# Inside the Block: how Solana validators order transactions

A small, reproducible experiment. It sends bursts of our own marked transactions to chosen leaders on mainnet, then
reads back where each one landed inside the block. All measurements are taken after Alpenglow activated
(slot 459,653,000, 2026-10-21), and the code refuses to run on a cluster that is earlier than that.

- Primary evidence: the position of our own transactions inside the target leader's block (`getBlock`, signatures in entry order).
- Supplementary evidence: how all other transactions in the same blocks are ordered relative to their priority fee.
- Coverage: 12 validators across 6 clients (2 per client, highest stake), selected automatically from gossip at run time.
- Cost: spend is capped in code (`SPEND_CAP_SOL`, default 0.05). A full run plans for ≤ 0.025 SOL. About 0.004 SOL of
  that is rent, and it comes back on sweep.

## Run it

```bash
docker compose run --rm itb keygen          # creates keys/id.json and prints its address
# send ~0.03 SOL to that address
docker compose run --rm itb                 # dry run: select targets, plan, time the bursts, send nothing
docker compose run --rm itb all --live      # real run: select, send, collect, sweep, analyze
```

You can also run each step on its own: `select | run [--live] | collect | analyze | sweep [address]`.

`sweep <address>` returns everything, including the main key's balance, to your own wallet.

Without Docker: `npm ci && KEYPAIR=./keys/id.json node src/main.ts …` (Node ≥ 22.18; runs the `.ts` files directly).
Math self-check: `npm run check`.

**Keys.** Keys never enter the repo or the image. `keys/` is a volume and is gitignored.
- `keys/id.json` is the funding wallet. It takes either a solana-keygen byte array or a base58 secret key.
- `keys/payers.json` holds the seeds of six throwaway fee payers.

**Settings.** All are optional env vars; see `.env.example`. The ones that matter:
- `SEND_RPC_URLS`: one or more send paths; probes rotate through them.
- `GAP_MS`: spacing between sends inside a burst.
- `LEAD_SLOTS`: how many slots before the leader's window we fire. A negative value fires inside the window.
- `PROBES_PER_VALIDATOR`.

**Output.** Everything goes to `data/`:

| file | contents |
|---|---|
| `targets.json` | Selected validators: identity, vote account, `clientId`, version, stake. Also stake share per client and the selection time. |
| `probes.jsonl` | One line per burst: target, arm, send path, trigger slot, slot at send, and for each tx its signature, payer, send rank, CU price, send/ack timestamps and send error. `live: false` lines come from dry runs; `analyze` ignores them. |
| `statuses.json` | Landing slot and error for every signature, read from each payer's `getSignaturesForAddress` history. |
| `blocks/<slot>.json` | Every block that contains our txs: all its signatures in entry order, with CU price, CU limit, fee and success for each tx. Slots around a target window that produced no block are stored as `{"skipped": true}`. |
| `blocks/leaders-<slot>.json` | `getSlotLeaders` for the slots around each target window. |
| `leaders.json`, `nodes.json` | The leader of every block that holds our txs, and each such leader's `clientId` and version from gossip at collection time. |
| `ours.csv` | One row per tx of ours: `LEAD_SLOTS` and `GAP_MS` of its run, landed slot, offset into the window, index in the block, block size. |
| `report.md` | Generated tables and verdicts. |

Every number in the report can be re-checked with `getBlock <slot>` on mainnet.

## Design

### Leader schedule and leader types

The target set is built from live cluster data:
- `getVoteAccounts` gives stake.
- `getClusterNodes` gives each node's self-reported `clientId` and version.

For each client type we take the two highest-stake validators. Stake share by client at selection on 2026-10-26:

| client | stake |
|---|---|
| AgaveBam | 35.6% |
| JitoLabs | 23.0% |
| HarmonicAgave | 21.7% |
| HarmonicFiredancer | 8.7% |
| Firedancer | 7.0% |
| FireBAM | 1.6% |
| Rakurai | 1.2% |
| Agave | 1.1% |
| Raiku | 0.1% |

Frankendancer is gone after Alpenglow. The top six types cover 97% of stake, so they are the default `CLIENTS`.

`getLeaderSchedule` with the identity filter gives each target's slots for the epoch. Consecutive slots are merged into
windows; after Alpenglow they are still 4 slots, about 220 ms each. The planner walks all target windows in time order:
- Each validator gets its next window until it has `PROBES_PER_VALIDATOR` probes.
- Bursts are kept at least 12 slots apart, so two bursts never share a block.

`getSlot`, polled every 300 ms, gives the clock; the public slot websocket falls behind, so it only counts when it is
ahead. The burst is signed just before the trigger and fired when the cluster reaches `windowStart − LEAD_SLOTS`. In
the dry run, every probe fired in its trigger slot with a 17–30 ms spread around the intended 20 ms gaps.

`clientId` is self-reported gossip data. We record it next to every measurement instead of trusting a static list.

### Transaction path

All sends go our process → HTTPS JSON-RPC `sendTransaction` → RPC node, with `skipPreflight: true` and
`maxRetries: 0`, sent as raw requests so what we log is exactly what was sent.
- The RPC node forwards the transaction over QUIC to the TPU of the current and upcoming leaders.
- With `maxRetries: 0` it does not re-broadcast, so each tx arrives once per path or not at all.
- Behind the TPU, the leader's client decides the order. That is the plain Agave or Firedancer scheduler, or an external
  block-building path for the BAM and Harmonic variants.

We treat each client as a black box and only measure the outcome.

What is in scope: Jito-run validators, as ordinary leaders. What is out of scope: Jito bundles, tips and private relays.
Every probe tx pays only the base fee plus a compute-unit price. The send path can be varied with `SEND_RPC_URLS`; the
host used is logged per burst.

### Our transactions and how they interact

A burst is `BURST` = 6 transactions, each with its own funded fee payer. Every tx has:
- `SetComputeUnitLimit(20000)`, identical for all, so priority ranking equals CU-price ranking;
- `SetComputeUnitPrice`, at one of 6 geometric levels from 1,000 to 300,000 µlamports/CU;
- a memo `itb|<run>|<probe>|<rank>`, so anyone can find them on an explorer.

A probe uses about 600 CU, measured with `simulateTransaction`.

Bursts rotate through four arms:

| arm | send order | fees | what it tests |
|---|---|---|---|
| `fee_vs_send` | low fee first | ascending | Fee priority and arrival order predict **opposite** block orders. This arm decides the verdict. |
| `fee_with_send` | high fee first | descending | Both rules predict the same order (control). |
| `equal_fee` | any | all equal | With no fee signal, does send order survive to the block? |
| `conflict` | low fee first | ascending | Like `fee_vs_send`, but every tx also write-locks one shared account (a 0-lamport transfer). |

Without the shared lock, the six txs touch disjoint accounts. A multi-threaded scheduler can then put them on different
workers, so their place in the block also depends on thread timing, not only on the scheduler's queue order. The
`conflict` arm forces sequential execution, so it separates "the queue is priority-ordered" from "the block looks
priority-ordered".

### Competition in the block

Our txs share the block with everyone else's. For each target block that contains our txs we also store every other
tx's prioritization fee per requested CU. From these we report:
- the share of adjacent pairs that are non-increasing;
- Spearman ρ between position and priority.

About half of the transactions in these blocks already use the v1 format, which carries the compute-unit limit and
the priority fee in the message's `transactionConfig` instead of ComputeBudget instructions. The collector reads both.

This is supplementary only: we cannot know when other people's txs arrived, so it cannot separate arrival from fee.
Our own bursts can. Our fees are moderate on purpose; the question is the relative order among our own six, not getting
to the top of the block.

### Send order

Send times are logged per tx, both at request start and at RPC ack.

Send order is not arrival order:
- requests can run in parallel over several HTTP connections;
- the RPC node forwards them independently;
- QUIC streams to the leader are not ordered against each other.

So `equal_fee` measures how much of our send order survives at all for a given `GAP_MS`. Repeating the run with
different `GAP_MS` (for example 0, 20, 100) shows when arrival order becomes visible.

`LEAD_SLOTS` was meant to control buffering: fired 2 slots early, the burst should wait at the target until its block
starts. In runs 1–3 that did not happen. The RPC node also forwards to the leader that is producing at that
moment, and 40% of our txs landed in the previous leader's last slot. So `analyze` credits every block to the leader
that actually built it (`getSlotLeaders`) and to that leader's client from gossip, not to the leader we aimed at.
Run 4 fired at the first slot of the window (`LEAD_SLOTS=0`), and 85% of the txs the RPC accepted landed in the target
window. Run 5 did the same with `GAP_MS=0`, and 90% landed there.

### Noise vs rule

- **What counts as evidence.** Only our txs that landed in the *same* block are compared. A burst split across two
  blocks is counted, but across blocks it carries no order information. The per-validator tables use only blocks in
  the target's own window. The by-client table uses every block, grouped by the client of the leader that built it.
- **Statistics.** We report pairwise rates with 95% Wilson intervals. Pairs inside one burst are not independent, so the
  verdict uses a burst-level two-sided binomial test: each burst votes "mostly fee-first" or "mostly send-first".
- **Verdict per validator** (`fee_vs_send` arm):
  - fewer than 4 informative bursts: *insufficient data*;
  - otherwise, p ≥ 0.05: *no detectable rule*;
  - otherwise, by pairwise fee-first rate: ≥ 90% *strict fee priority*, ≥ 60% *loose fee priority*, ≤ 40% *arrival order*.
- **Controls.** The `fee_with_send` control should agree with whichever rule wins. If it does not, the verdict is suspect.
  `equal_fee` gives the noise floor of arrival order.
- **Clients vs validators.** Two validators per client let us see whether a pattern belongs to the client or to one
  operator's setup.

## Results

See `data/report.md`, generated by `analyze`. It lists:
- the measurement window in UTC;
- where our txs landed relative to the target window;
- landing rate per validator;
- order statistics per validator and arm, and by the client of the leader that actually built each block;
- the whole-block statistics;
- an automatic "what went wrong" section: late triggers, send errors, skipped slots.

`REPORT.md` holds the written analysis of all five live runs.

## What this does not separate

- **Arrival vs scheduling.** We do not see when a tx reached the leader, only when we sent it. "Arrival order" in the
  verdicts means "send order survived". The arms make the fee-vs-arrival conclusion hold without knowing arrival times,
  but a scheduler that orders by fee only among txs that arrive within a few milliseconds would look like arrival order
  here.
- **RPC node vs leader.** Every tx passes through one RPC node we do not control. Delays or reordering there look the
  same as reordering at the leader. A run with several `SEND_RPC_URLS`, or with direct TPU sends, would separate them.
- **Queue order vs execution threads.** Without a shared account, worker-thread timing can move our txs inside the
  block. The `conflict` arm removes that factor, but only for txs that also share a write lock.
- **Client vs operator.** Two validators per client, plus grouping by the actual block builder, show whether a pattern
  holds across operators. It cannot show an operator's private settings (BAM or Harmonic block-engine configuration,
  scheduler flags).
- **External block builders.** For BAM and Harmonic leaders we cannot tell whether the order came from the local
  scheduler or from the external builder. We measure only the final block.
- **Load.** We measured at whatever load the network had on 28–29 October. A rule that only shows under congestion
  is not tested.

## Limits

- **Clock.** Our clock is the RPC node's slot notifications. They can lag the real leader by tens of milliseconds.
- **Public RPC.** It may rate-limit or drop sends; those cases show up as send errors or missing landings in the report.
- **`clientId`.** It is self-reported.

# Inside the Block: what we measured

321 bursts of our own transactions (1,926 txs) were sent to 12 mainnet leaders, two per client type, between
2026-10-28 17:04 and 2026-10-29 11:04 UTC. That is after Alpenglow activated (slot 459,653,000). We then read back where
each tx landed and in what order. The generated tables are in [`data/report.md`](data/report.md), and every tx has a
row in [`data/ours.csv`](data/ours.csv). Total spend was 0.0121 SOL in fees, against a 0.05 SOL cap.

## Summary

1. **Most bursts are not built by the leader we aimed at.** Fired 2 slots before the target window, 40% of our txs
   landed in the last slot of the *previous* leader. 37% landed in the target window and 14% landed 12 or more slots
   later.
2. **Inside a block, our txs come out in the order we sent them, not in fee order.** This holds for every client
   type with enough data: AgaveBam, JitoLabs, HarmonicAgave, Firedancer and HarmonicFiredancer. In the arm where fee
   and send order disagree, the higher-fee tx came first in only 18–33% of pairs.
3. **The reason is streaming.** Between two of our consecutive txs, sent 20 ms apart, the leader put a median of 28
   other txs. So each of ours was scheduled about as soon as it arrived, and the next one had not arrived yet. A
   priority fee can only reorder txs that are waiting at the leader *at the same time*.
4. **Whole blocks are not sorted by priority either.** Spearman ρ between position and priority is between −0.16 and
   0.08 for every target. Adjacent pairs are non-increasing 51–53% of the time, which is what random order gives.
5. **Plain Agave may differ.** Its blocks put the higher-fee tx first in 85% of `fee_vs_send` pairs. That is the opposite
   of every other client, but it rests on only 7 bursts from 3 leaders, and the burst-level test does not reach
   significance.

## Setup

Full design: [README](README.md). In short:
- Targets are the two highest-stake validators of each of the six main client types. Those types cover 97% of stake.
  Clients are read from gossip.
- A burst is 6 txs, each with its own fee payer, sent 20 ms apart through `api.mainnet-beta.solana.com` with
  `skipPreflight` and `maxRetries: 0`. Each tx sets the CU limit to 20,000 and a CU price at one of six levels from
  1,000 to 300,000 µlamports/CU.
- Bursts rotate through four arms:
  - `fee_vs_send`: low fee sent first, so fee order and send order predict opposite block orders;
  - `fee_with_send`: high fee sent first (control);
  - `equal_fee`: no fee signal at all;
  - `conflict`: like `fee_vs_send`, but all six txs also write-lock one shared account.

| run | started (UTC) | probes | note |
|---|---|---|---|
| 1 | 2026-10-28 17:04 | 12 | stopped by hand to fix the stop logic |
| 2 | 2026-10-28 17:27 | 42 | hung: the slot websocket died silently |
| 3 | 2026-10-29 09:48 | 267 of 288 | hung at probe 270: an RPC call without a timeout |

All three runs use the same targets, the same settings and the same code path for sending. The fixes are described
under "What went wrong".

## 1. Where the bursts landed

| slot offset from the target window | txs | share |
|---|---|---|
| −2 | 38 | 2% |
| −1 (previous leader's last slot) | 773 | 40% |
| 0–3 (target window) | 718 | 37% |
| 4–11 | 119 | 6% |
| 12 or more | 272 | 14% |
| not landed | 6 | 0.3% |

The RPC node forwards a tx to the current leader and the next ones. Sent 2 slots early, the tx usually reaches the
leader that is still producing, and that leader includes it right away. So `LEAD_SLOTS = 2` mostly measures the
*previous* leader. The analysis therefore credits each block to the leader that actually built it: `getSlotLeaders`
for the slot, then that leader's client from gossip. That covers 143 leaders of 9 client types (plus one unknown),
instead of only the 12 targets.

The 272 late txs come from 47 whole bursts, a median of 20 slots (about 8 s) late. All six ranks and all fee levels
are equally affected, so it is the delivery path, not the fee. With `maxRetries: 0` the RPC node should not resend.
We cannot see inside the public RPC node, so we do not know why these bursts were held.

## 2. Order of our own transactions, by the client that built the block

Only blocks holding at least two txs of one burst count. "Fee first" is the share of pairs where the higher-fee tx is
earlier in the block, with 95% Wilson intervals. Verdicts use a burst-level binomial test, because pairs from one burst
are not independent.

| client | leaders | `fee_vs_send`: bursts, fee first | `fee_with_send`: fee first = sent first | `equal_fee`: sent first | verdict |
|---|---|---|---|---|---|
| AgaveBam | 54 | 31, 27% [21–34%] | 83% | 71% [65–77%] | arrival order |
| JitoLabs | 26 | 29, 31% [26–37%] | 72% | 69% [60–77%] | arrival order |
| HarmonicAgave | 24 | 26, 33% [27–40%] | 72% | 78% [71–83%] | arrival order |
| Firedancer | 5 | 11, 24% [16–34%] | 83% | 61% [50–72%] | arrival order |
| HarmonicFiredancer | 11 | 9, 18% [10–29%] | 65% | 67% [53–79%] | arrival order |
| Agave | 3 | 7, 85% [70–93%] | 65% | 70% [53–83%] | not significant |
| FireBAM, Rakurai, Raiku | 5 | 1 or 0 | – | – | insufficient data |

How to read it:
- In `fee_vs_send` the two rules disagree, so "fee first" well below 50% means send order won.
- The control (`fee_with_send`), where both rules agree, comes out ordered 65–83% of the time. That is in line with
  `equal_fee`, where send order alone survives 61–78% of the time.
- The 20–30% of pairs that come out of order match the arrival jitter: requests overlap in flight (send to RPC ack
  takes a median of 134 ms, which is longer than the 20 ms gap), and the RPC node forwards each one independently.

**Shared write lock (`conflict`).** For AgaveBam, HarmonicFiredancer and Firedancer, the fee-first share moves up from
27/18/24% to 43/43/34%. That is closer to a coin flip, not to fee order. Making the six txs conflict did not turn on
priority ordering among them.

## 3. Why: the leader schedules as txs arrive

- Between two of our consecutive txs in the same block there are a median of 28 other txs. Only 10% of our pairs are
  adjacent.
- Our txs sit in the middle of the block: median relative position 0.45, interquartile range 0.18–0.72.
- Whole blocks (supplementary, other people's txs, all 181 target blocks with our txs): ρ ≈ 0 and about 51%
  non-increasing adjacent pairs, for every client.

Together this says that, at the load these leaders saw, the scheduler rarely holds a backlog long enough for priority
to matter. It drains what has arrived. A higher fee did not let a tx overtake one that arrived 20 ms earlier. We did
not test the case where many txs queue at once (congestion, or a burst buffered before the leader's first slot). That
is where priority ordering should show, and the fixed lead of 2 slots did not produce it.

## 4. Per target

The per-validator tables in `data/report.md` cover only txs that landed in the target's own window. Each validator
and arm has 0–7 bursts. At that size the burst-level test cannot reach significance: even 5 bursts out of 5 in one
direction give p = 0.06. So every per-validator verdict is "insufficient data" or "no detectable rule".

The shares still point the same way as the by-client table:
- In `fee_vs_send`, most targets put the higher fee first in 19–46% of pairs. The exceptions are the two JitoLabs
  validators (50% and 57%) and one AgaveBam validator (100%, but from only 2 bursts).
- Both plain Agave targets put the higher fee first in 81% and 87% of pairs. That is where the Agave line of the
  by-client table comes from.

Telling the two validators of one client type apart needs more probes per validator. The by-client table pools 3–54
leaders per type, so a pattern there is not one operator's setup.

## What went wrong

- **Run 2 hung at probe 42.** The slot websocket stopped sending without an error, and the polling fallback only
  started on a subscription error. Fix: poll `getSlot` whenever the websocket has been quiet for over 1 s, and time out
  the raw send after 5 s.
- **Run 3 hung at probe 270.** A `getSlot` poll never returned. `@solana/kit`'s HTTP transport has no timeout of its
  own. Fix: every RPC call now times out (15 s for the run, 120 s for collection). The 18 unsent probes are simply
  missing; 3 more were skipped because their trigger slot had passed.
- **Collection on the public RPC.**
  - `getSignatureStatuses` with history search did not answer within 2 minutes for 256 signatures. Landing slots now
    come from each payer's `getSignaturesForAddress` (6 calls).
  - `getBlock` for day-old slots takes about 8 s and often returns 429. Collection now runs in parallel, retries, and
    on the next run fetches only what is missing. A 429 is no longer recorded as a skipped slot.
  - About half the txs in these blocks use the new v1 format, where the CU limit and priority fee live in
    `transactionConfig`. The collector now reads them; before the fix, those blocks failed to load.
- **Send errors:** five 429s and one `fetch failed` from the public RPC, out of 1,926 sends. 7 of 585 landing blocks
  could not be fetched; they hold 1.4% of our landed txs.

## Limits

- One send path: the public RPC. A staked or private path, or sending to the leader's TPU directly, may arrive tighter
  and show more priority ordering.
- `GAP_MS` (20) and `LEAD_SLOTS` (2) were not varied. The natural next run is `GAP_MS=0`, and `LEAD_SLOTS` of 4–6
  aimed at the start of a window, to force a backlog.
- Clients come from self-reported gossip, read at collection time (2026-10-29 14:13 UTC) for non-target leaders.
- Out of scope: bundles and tips. All our txs pay base fee plus CU price only.

## Re-checking

Every number above can be re-derived:
- `node src/main.ts analyze` (or `docker compose run --rm itb analyze`) rebuilds `data/report.md` and
  `data/ours.csv` from the raw files.
- Any position can be checked against mainnet with `getBlock <slot>`, and our txs are findable by the memo
  `itb|<run>|<probe>|<rank>`.

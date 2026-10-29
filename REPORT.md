# Inside the Block: what we measured

603 bursts of our own transactions (3,618 txs) were sent to 12 mainnet leaders, two per client type, between
2026-10-28 17:04 and 2026-10-29 19:18 UTC. That is after Alpenglow activated (slot 459,653,000). We then read back where
each tx landed and in what order. The generated tables are in [`data/report.md`](data/report.md), and every tx has a
row in [`data/ours.csv`](data/ours.csv). Total spend was 0.0205 SOL in fees, against a 0.05 SOL cap.

## Summary

1. **Fired 2 slots early, most bursts are not built by the leader we aimed at.** 40% of our txs landed in the last
   slot of the *previous* leader, 37% in the target window and 14% 12 or more slots later. Fired at the window's first
   slot (runs 4 and 5), 85% and 90% of the txs the RPC accepted landed in the target window.
2. **Inside a block, our txs come out in the order we sent them, not in fee order.** This holds for every client
   type with enough data: AgaveBam, JitoLabs, HarmonicAgave, Firedancer and HarmonicFiredancer. In the arm where fee
   and send order disagree, the higher-fee tx came first in only 18–33% of pairs. Run 4, whose bursts arrived while
   the target itself was producing, points the same way: 14–50% per client, never above half.
3. **The reason is streaming.** Between two of our consecutive txs, sent 20 ms apart, the leader put a median of 28
   other txs. So each of ours was scheduled about as soon as it arrived, and the next one had not arrived yet. A
   priority fee can only reorder txs that are waiting at the leader *at the same time*.
4. **Sent all at once (run 5, `GAP_MS=0`), fee order still does not win.** Our txs now reached the leader close
   together (a median of 6 other txs between two of ours, instead of 28). Pooled over all clients, the higher-fee tx
   came first in 49% of `fee_vs_send` pairs: send order lost its edge, but fee order did not take over. The exception
   to watch is AgaveBam: 73% [61–82%] fee first (12 bursts, 7 leaders), against 27% with 20 ms gaps. Its burst-level
   test does not reach significance (9 of 12 bursts, p = 0.15).
5. **Whole blocks are not sorted by priority either.** Spearman ρ between position and priority is between −0.16 and
   0.08 for every target and every run. Adjacent pairs are non-increasing 51–53% of the time, which is what random order gives.
6. **Plain Agave: no claim.** Fired 2 slots early, its blocks put the higher-fee tx first in 85% of `fee_vs_send`
   pairs (7 bursts, 3 leaders). In runs 4 and 5 that did not repeat: 24% (3 bursts) and 41% (8 bursts). None of these
   tests reaches significance.

## Setup

Full design: [README](README.md). In short:
- Targets are the two highest-stake validators of each of the six main client types. Those types cover 97% of stake.
  Clients are read from gossip.
- A burst is 6 txs, each with its own fee payer, sent 20 ms apart (all at once in run 5) through `api.mainnet-beta.solana.com` with
  `skipPreflight` and `maxRetries: 0`. Each tx sets the CU limit to 20,000 and a CU price at one of six levels from
  1,000 to 300,000 µlamports/CU.
- Bursts rotate through four arms:
  - `fee_vs_send`: low fee sent first, so fee order and send order predict opposite block orders;
  - `fee_with_send`: high fee sent first (control);
  - `equal_fee`: no fee signal at all;
  - `conflict`: like `fee_vs_send`, but all six txs also write-lock one shared account.

| run | bursts sent (UTC) | probes | how it ended |
|---|---|---|---|
| 1 | 2026-10-28 17:04:46 – 17:05:51 | 12 of 288 | no burst after 17:05; stopped by hand at 17:20 before a power cut |
| 2 | 2026-10-28 17:27:16 – 17:31:39 | 42 of 288 | hung: the slot websocket died silently |
| 3 | 2026-10-29 09:48:35 – 11:04:25 | 267 of 288 | hung at probe 270: an RPC call without a timeout |
| 4 | 2026-10-29 15:15:29 – 16:44:43 | 102 of 216 | finished; 114 probes skipped as late |
| 5 | 2026-10-29 18:01:16 – 19:18:48 | 180 of 192 | finished; 12 probes skipped as late |

Runs 1–3 use the same targets, the same settings and the same code path for sending, with `LEAD_SLOTS=2`. Run 4 changes
only `LEAD_SLOTS` (0: fire at the first slot of the window) and the probe count (18 per validator instead of 24). Run 5
keeps `LEAD_SLOTS=0`, sets `GAP_MS=0` (all six txs sent at once) and 16 probes per validator, and has the slot clock fix
described under "What went wrong". Every table in `data/report.md` is split by `LEAD_SLOTS/GAP_MS`, and `data/ours.csv`
has `leadSlots` and `gapMs` columns. The UTC send time of every
burst is in the `at` column of `data/ours.csv` and in `data/probes.jsonl`. The fixes are described under
"What went wrong".

## 1. Where the bursts landed

| slot offset from the target window | `LEAD_SLOTS=2` (runs 1–3) | `LEAD_SLOTS=0` (run 4) | `LEAD_SLOTS=0`, `GAP_MS=0` (run 5) |
|---|---|---|---|
| −2 | 38 (2%) | – | – |
| −1 (previous leader's last slot) | 773 (40%) | – | – |
| target window | 718 (37%) | 337 (55%) | 853 (79%) |
| after the window, up to 11 | 119 (6%) | 55 (9%) | 87 (8%) |
| 12 or more | 272 (14%) | 6 (1%) | 8 (1%) |
| not landed | 6 (0.3%) | 214 (35%) | 132 (12%) |

The RPC node forwards a tx to the current leader and the next ones. Sent 2 slots early, the tx usually reaches the
leader that is still producing, and that leader includes it right away. So `LEAD_SLOTS = 2` mostly measures the
*previous* leader. The analysis therefore credits each block to the leader that actually built it: `getSlotLeaders`
for the slot, then that leader's client from gossip. That covers 143 leaders of 9 client types (plus one unknown),
instead of only the 12 targets.

Fired at the first slot of the window, 337 of the 398 txs the RPC accepted in run 4 (85%) and 853 of 948 in run 5 (90%)
landed in the target window. None landed in the window's first slot: the burst fires when we see that slot and reaches
the leader one or two slots later, and most landed in the window's second or third slot. All 214 and 132 txs that did
not land are send errors (see "What went wrong").

The 272 late txs come from 47 whole bursts, a median of 20 slots (about 8 s) late. All six ranks and all fee levels
are equally affected, so it is the delivery path, not the fee. With `maxRetries: 0` the RPC node should not resend.
We cannot see inside the public RPC node, so we do not know why these bursts were held.

## 2. Order of our own transactions, by the client that built the block

Only blocks holding at least two txs of one burst count. "Fee first" is the share of pairs where the higher-fee tx is
earlier in the block, with 95% Wilson intervals. Verdicts use a burst-level binomial test, because pairs from one burst
are not independent.

`LEAD_SLOTS=2` (runs 1–3):

| client | leaders | `fee_vs_send`: bursts, fee first | `fee_with_send`: fee first = sent first | `equal_fee`: sent first | verdict |
|---|---|---|---|---|---|
| AgaveBam | 54 | 31, 27% [21–34%] | 83% | 71% [65–77%] | arrival order |
| JitoLabs | 27 | 29, 31% [26–37%] | 72% | 72% [64–79%] | arrival order |
| HarmonicAgave | 23 | 25, 33% [27–40%] | 72% | 78% [72–84%] | arrival order |
| Firedancer | 5 | 11, 24% [16–34%] | 83% | 61% [50–72%] | arrival order |
| HarmonicFiredancer | 12 | 10, 18% [11–30%] | 65% | 67% [54–78%] | arrival order |
| Agave | 3 | 7, 85% [70–93%] | 65% | 70% [53–83%] | not significant |
| FireBAM, Rakurai, Raiku, unknown | 1–2 each | 1 or 0 | – | – | insufficient data |

`LEAD_SLOTS=0` (run 4):

| client | leaders | `fee_vs_send`: bursts, fee first | `fee_with_send`: fee first = sent first | `equal_fee`: sent first | verdict |
|---|---|---|---|---|---|
| JitoLabs | 6 | 11, 23% [13–38%] | 64% | 67% [39–86%] | not significant |
| AgaveBam | 6 | 7, 41% [28–56%] | 77% | 83% [55–95%] | not significant |
| HarmonicFiredancer | 2 | 5, 50% [33–67%] | 43% | 64% [39–84%] | not significant |
| Agave | 2 | 3, 24% [10–47%] | 76% | 89% [69–97%] | insufficient data |
| HarmonicAgave | 3 | 3, 50% [31–69%] | 79% | 86% [49–97%] | insufficient data |
| Firedancer | 2 | 2, 14% [5–35%] | 60% | 86% [49–97%] | insufficient data |

`LEAD_SLOTS=0`, `GAP_MS=0` (run 5):

| client | leaders | `fee_vs_send`: bursts, fee first | `fee_with_send`: fee first = sent first | `equal_fee`: sent first | verdict |
|---|---|---|---|---|---|
| AgaveBam | 7 | 12, 73% [61–82%] | 94% | 68% [57–78%] | not significant |
| HarmonicAgave | 6 | 12, 38% [28–51%] | 70% | 59% [46–70%] | not significant |
| HarmonicFiredancer | 2 | 12, 49% [40–59%] | 72% | 53% [39–67%] | not significant |
| Agave | 2 | 8, 41% [26–57%] | 70% | 76% [64–84%] | not significant |
| Firedancer | 4 | 8, 36% [25–50%] | 84% | 72% [59–82%] | not significant |
| JitoLabs | 6 | 6, 46% [33–60%] | 61% | 40% [28–54%] | not significant |

How to read it:
- In `fee_vs_send` the two rules disagree, so "fee first" well below 50% means send order won.
- The control (`fee_with_send`), where both rules agree, comes out ordered 65–83% of the time. That is in line with
  `equal_fee`, where send order alone survives 61–78% of the time.
- The 20–30% of pairs that come out of order match the arrival jitter: requests overlap in flight (send to RPC ack
  takes a median of 134 ms, which is longer than the 20 ms gap), and the RPC node forwards each one independently.
- Run 4 has 2–11 bursts per client and arm, so nothing in it reaches significance. It shows the same direction, not
  more power.
- In run 5 all six requests leave at once, so "sent first" only means "request started first". Send order alone
  (`equal_fee`) then survives in 63% of pairs, pooled. If fee had no effect, `fee_vs_send` would give 37% fee first and
  `fee_with_send` 63%; they give 49% and 76%. That is a weak pull toward fee order, largest in AgaveBam (73% and 94%
  against 32% and 68% from send order alone). These are pair shares, not a test.

**Shared write lock (`conflict`).** For AgaveBam, HarmonicFiredancer and Firedancer, the fee-first share moves up from
27/18/24% to 43/43/34%. That is closer to a coin flip, not to fee order. Making the six txs conflict did not turn on
priority ordering among them.

## 3. Why: the leader schedules as txs arrive

- Between two of our consecutive txs in the same block there are a median of 28 other txs. Only 10% of our pairs are
  adjacent.
- Our txs sit in the middle of the block: median relative position 0.45, interquartile range 0.18–0.72.
- In run 5 (`GAP_MS=0`) there were a median of 6 other txs between two of ours, and 22% of pairs were adjacent. In
  run 4 (20 ms gaps) it was 76 and 4%. So sending at once did bring our txs to the leader together.
- Whole blocks (supplementary, other people's txs, all 468 target blocks with our txs): ρ ≈ 0 and 50–55%
  non-increasing adjacent pairs, for every client and every run.

Together this says that, at the load these leaders saw, the scheduler rarely holds a backlog long enough for priority
to matter. It drains what has arrived. A higher fee did not let a tx overtake one that arrived 20 ms earlier, and
mostly not one that arrived together with it. Six txs arriving at once are not a backlog in a block of hundreds. We did
not test the case where many txs queue at once (congestion, or a burst buffered before the leader's first slot). That
is where priority ordering should show. Neither a lead of 2 slots nor firing at the window start (runs 4 and 5)
produced it.

## 4. Per target

The per-validator tables in `data/report.md` cover only txs that landed in the target's own window. Each validator
and arm has 0–8 bursts per setup. At that size the burst-level test cannot reach significance: even 5 bursts out of 5 in one
direction give p = 0.06. So every per-validator verdict is "insufficient data" or "no detectable rule".

The shares still point the same way as the by-client table:
- In `fee_vs_send`, most targets put the higher fee first in 19–46% of pairs. The exceptions are the two JitoLabs
  validators (50% and 57%) and one AgaveBam validator (100%, but from only 2 bursts).
- Both plain Agave targets put the higher fee first in 81% and 87% of pairs. That is where the Agave line of the
  by-client table comes from.
- In run 5 both AgaveBam targets put the higher fee first in 67% and 76% of pairs (5 and 4 bursts); every other target
  26–53%.

Telling the two validators of one client type apart needs more probes per validator. The by-client table pools 3–54
leaders per type, so a pattern there is not one operator's setup.

## What went wrong

- **Runs 1 and 2 stopped sending after 12 and 42 probes.** Most likely the cause was the same in both: the slot websocket stopped sending without an error, and the polling fallback only
  started on a subscription error. Fix: poll `getSlot` whenever the websocket has been quiet for over 1 s, and time out
  the raw send after 5 s.
- **Run 3 hung at probe 270.** A `getSlot` poll never returned. `@solana/kit`'s HTTP transport has no timeout of its
  own. Fix: every RPC call now times out (15 s for the run, 120 s for collection). The 18 unsent probes are simply
  missing; 3 more were skipped because their trigger slot had passed.
- **Run 4 lost 214 of its 612 sends.** The public RPC answered 201 of them with 429 `Connection rate limits exceeded`
  and 13 timed out; 196 of the 214 fell between 15:15 and 15:40 UTC. Runs 1–3 had 6 send errors in 1,926 sends. The
  limit is per IP. During that time the sender's location had a scheduled power cut and the network ran on backup
  power; we do not know if that is related. The lost txs never reached the chain and cost nothing. 51 bursts arrived
  complete, 17 were lost entirely, and the rest lost some txs, so they add fewer pairs.
- **Run 4 skipped 114 of 216 probes as late.** A probe is skipped when the loop's slot clock is already past its
  trigger. The skipped ones were a median of 18 slots past it, so the clock was stalled; a burst that just missed its
  slot would be 1 slot past (9 cases). Measured after the run: the public slot websocket falls behind and then goes
  silent. In a 16 s test it trailed a polled `getSlot` by 50 slots, then stopped after 24 messages. The old code
  polled only after 1 s of websocket silence, so the clock lagged and then jumped. Fix for run 5: poll `getSlot` every
  300 ms, and use the websocket only when it is ahead. Run 5 skipped 12 of 192 probes, each one right after a probe
  whose sends hit a 429 or the 5 s send timeout, which held the loop.
- **Run 5 lost 132 of its 1,080 sends:** 118 × 429 `Connection rate limits exceeded`, 11 timeouts and 3 `fetch
  failed`, spread over the whole run, with no power cut. So the 429s are the public RPC's per-IP limit, not the backup
  power during run 4.
- **Collection on the public RPC.**
  - `getSignatureStatuses` with history search did not answer within 2 minutes for 256 signatures. Landing slots now
    come from each payer's `getSignaturesForAddress` (6 calls).
  - `getBlock` for day-old slots takes about 8 s and often returns 429. Collection now runs in parallel, retries, and
    on the next run fetches only what is missing. A 429 is no longer recorded as a skipped slot.
  - About half the txs in these blocks use the new v1 format, where the CU limit and priority fee live in
    `transactionConfig`. The collector now reads them; before the fix, those blocks failed to load.
- **Send errors in runs 1–3:** five 429s and one `fetch failed` from the public RPC, out of 1,926 sends. After repeated
  collection passes, all 1,060 blocks holding our 3,266 landed txs were fetched.

## Limits

- One send path: the public RPC. A staked or private path, or sending to the leader's TPU directly, may arrive tighter
  and show more priority ordering.
- `GAP_MS` took 20 and 0, `LEAD_SLOTS` 2 and 0. A larger `LEAD_SLOTS` does not build a backlog through a public RPC,
  because the RPC forwards each tx to the leader producing at that moment. Forcing one needs many more txs at once or
  a direct path to the leader's TPU, from a connection without the public RPC's limits.
- The AgaveBam result in run 5 rests on 12 bursts. A run aimed only at AgaveBam leaders with `GAP_MS=0` would settle
  it.
- Clients come from self-reported gossip, read at collection time (2026-10-29 17:13 UTC) for non-target leaders.
- Out of scope: bundles and tips. All our txs pay base fee plus CU price only.

## Re-checking

Every number above can be re-derived:
- `node src/main.ts analyze` (or `docker compose run --rm itb analyze`) rebuilds `data/report.md` and
  `data/ours.csv` from the raw files.
- Any position can be checked against mainnet with `getBlock <slot>`, and our txs are findable by the memo
  `itb|<run>|<probe>|<rank>`.

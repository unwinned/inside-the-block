# Inside the Block — results

Targets selected 2026-10-28T17:04:35.418Z. Live probes: 321, from 2026-10-28T17:04:46.964Z to 2026-10-29T11:04:25.795Z (UTC). All after Alpenglow activation (slot 459,653,000).
Per-tx raw data: `data/ours.csv`, `data/probes.jsonl`, `data/statuses.json`, `data/blocks/`. Every claim can be re-checked with `getBlock` on the listed slots.

## Where our transactions landed

Slot of each tx relative to the first slot of the target window. Bursts fire 2 slots before the window.

| slot offset | txs | share |
|---|---|---|
| -2 (before the window) | 38 | 2% |
| -1 (before the window) | 773 | 40% |
| 0 (target window) | 545 | 28% |
| 1 (target window) | 98 | 5% |
| 2 (target window) | 47 | 2% |
| 3 (target window) | 28 | 1% |
| 4-11 (after the window) | 119 | 6% |
| 12 or more | 272 | 14% |
| not landed | 6 | 0% |

## Landing

| validator | client | version | stake | probes | txs | landed | in target window | bursts split across blocks |
|---|---|---|---|---|---|---|---|---|
| `CAo1dCGY…` | HarmonicAgave | 4.3.2 | 2.18% | 32 | 192 | 100% | 34% | 22% |
| `Fd7btgyS…` | HarmonicAgave | 4.3.2 | 3.92% | 30 | 180 | 100% | 30% | 7% |
| `JUPiTERr…` | HarmonicFiredancer | 26.10.4 | 2.24% | 32 | 192 | 99% | 35% | 9% |
| `HEL1USMZ…` | JitoLabs | 4.3.2 | 3.84% | 32 | 192 | 98% | 39% | 19% |
| `5Cchr1XG…` | AgaveBam | 4.3.2 | 1.32% | 28 | 168 | 100% | 38% | 11% |
| `9eGrDohd…` | Firedancer | 26.10.4 | 1.62% | 28 | 168 | 100% | 42% | 4% |
| `Awes4Tr6…` | HarmonicFiredancer | 26.10.4 | 1.61% | 27 | 162 | 100% | 31% | 11% |
| `DRpbCBMx…` | AgaveBam | 4.3.2 | 2.95% | 27 | 162 | 99% | 33% | 7% |
| `E1r4Psq8…` | JitoLabs | 4.3.2 | 2.50% | 28 | 168 | 100% | 41% | 18% |
| `JD549Hsb…` | Firedancer | 26.10.4 | 1.40% | 27 | 162 | 100% | 48% | 7% |
| `7QQGNm3p…` | Agave | 4.3.2 | 0.43% | 17 | 102 | 100% | 40% | 24% |
| `5Us18hLZ…` | Agave | 4.3.2 | 0.28% | 13 | 78 | 100% | 42% | 23% |

## Order of our own transactions inside one block

Pairs = every pair of our txs from one burst that landed in the same block. "Fee first" = the higher-fee tx is earlier; "sent first" = the earlier-sent tx is earlier. 95% Wilson intervals. The verdict uses the `fee_vs_send` arm (the two rules predict opposite orders) with a burst-level binomial test, because pairs inside a burst are not independent.

| validator | client | arm | bursts in one block | pairs | fee first | sent first | perfect fee order | perfect send order | verdict |
|---|---|---|---|---|---|---|---|---|---|
| `CAo1dCGY…` | HarmonicAgave | fee_vs_send | 6 | 25 | 36% [20%–55%] | 64% [45%–80%] | 1/6 | 2/6 | no detectable rule (noise) |
| `CAo1dCGY…` | HarmonicAgave | equal_fee | 5 | 34 | – | 65% [48%–79%] | 0/5 | 1/5 | no detectable rule (noise) |
| `CAo1dCGY…` | HarmonicAgave | fee_with_send | 2 | 11 | 55% [28%–79%] | 55% [28%–79%] | 0/2 | 0/2 |  |
| `CAo1dCGY…` | HarmonicAgave | conflict | 4 | 18 | 39% [20%–61%] | 61% [39%–80%] | 0/4 | 2/4 |  |
| `Fd7btgyS…` | HarmonicAgave | fee_with_send | 6 | 26 | 62% [43%–78%] | 62% [43%–78%] | 3/6 | 3/6 |  |
| `Fd7btgyS…` | HarmonicAgave | equal_fee | 1 | 1 | – | 100% [21%–100%] | 0/1 | 1/1 | insufficient data |
| `Fd7btgyS…` | HarmonicAgave | conflict | 3 | 31 | 13% [5%–29%] | 87% [71%–95%] | 0/3 | 1/3 |  |
| `Fd7btgyS…` | HarmonicAgave | fee_vs_send | 4 | 37 | 46% [31%–62%] | 54% [38%–69%] | 1/4 | 0/4 | no detectable rule (noise) |
| `JUPiTERr…` | HarmonicFiredancer | equal_fee | 4 | 15 | – | 73% [48%–89%] | 0/4 | 1/4 | no detectable rule (noise) |
| `JUPiTERr…` | HarmonicFiredancer | fee_vs_send | 3 | 21 | 19% [8%–40%] | 81% [60%–92%] | 1/3 | 0/3 | insufficient data |
| `JUPiTERr…` | HarmonicFiredancer | conflict | 5 | 38 | 37% [23%–53%] | 63% [47%–77%] | 1/5 | 0/5 |  |
| `JUPiTERr…` | HarmonicFiredancer | fee_with_send | 3 | 22 | 45% [27%–65%] | 45% [27%–65%] | 0/3 | 0/3 |  |
| `HEL1USMZ…` | JitoLabs | conflict | 4 | 18 | 78% [55%–91%] | 22% [9%–45%] | 2/4 | 1/4 |  |
| `HEL1USMZ…` | JitoLabs | fee_vs_send | 7 | 18 | 50% [29%–71%] | 50% [29%–71%] | 2/7 | 2/7 | no detectable rule (noise) |
| `HEL1USMZ…` | JitoLabs | equal_fee | 4 | 13 | – | 77% [50%–92%] | 0/4 | 2/4 | no detectable rule (noise) |
| `HEL1USMZ…` | JitoLabs | fee_with_send | 6 | 43 | 67% [53%–80%] | 67% [53%–80%] | 1/6 | 1/6 |  |
| `5Cchr1XG…` | AgaveBam | fee_with_send | 3 | 22 | 100% [85%–100%] | 100% [85%–100%] | 3/3 | 3/3 |  |
| `5Cchr1XG…` | AgaveBam | conflict | 7 | 47 | 62% [47%–74%] | 38% [26%–53%] | 3/7 | 1/7 |  |
| `5Cchr1XG…` | AgaveBam | equal_fee | 4 | 27 | – | 56% [37%–72%] | 0/4 | 0/4 | insufficient data |
| `5Cchr1XG…` | AgaveBam | fee_vs_send | 2 | 2 | 100% [34%–100%] | 0% [0%–66%] | 2/2 | 0/2 | insufficient data |
| `9eGrDohd…` | Firedancer | equal_fee | 5 | 43 | – | 53% [39%–67%] | 0/5 | 0/5 | no detectable rule (noise) |
| `9eGrDohd…` | Firedancer | conflict | 5 | 33 | 48% [33%–65%] | 52% [35%–67%] | 2/5 | 1/5 |  |
| `9eGrDohd…` | Firedancer | fee_with_send | 2 | 21 | 95% [77%–99%] | 95% [77%–99%] | 1/2 | 1/2 |  |
| `9eGrDohd…` | Firedancer | fee_vs_send | 5 | 17 | 35% [17%–59%] | 65% [41%–83%] | 1/5 | 1/5 | no detectable rule (noise) |
| `Awes4Tr6…` | HarmonicFiredancer | conflict | 3 | 17 | 71% [47%–87%] | 29% [13%–53%] | 1/3 | 1/3 |  |
| `Awes4Tr6…` | HarmonicFiredancer | fee_vs_send | 0 | 0 | – | – | 0/0 | 0/0 | insufficient data |
| `Awes4Tr6…` | HarmonicFiredancer | fee_with_send | 5 | 32 | 75% [58%–87%] | 75% [58%–87%] | 2/5 | 2/5 |  |
| `Awes4Tr6…` | HarmonicFiredancer | equal_fee | 5 | 10 | – | 60% [31%–83%] | 0/5 | 2/5 | no detectable rule (noise) |
| `DRpbCBMx…` | AgaveBam | fee_vs_send | 3 | 13 | 31% [13%–58%] | 69% [42%–87%] | 0/3 | 2/3 | insufficient data |
| `DRpbCBMx…` | AgaveBam | equal_fee | 7 | 44 | – | 57% [42%–70%] | 0/7 | 2/7 | no detectable rule (noise) |
| `DRpbCBMx…` | AgaveBam | fee_with_send | 1 | 10 | 80% [49%–94%] | 80% [49%–94%] | 0/1 | 0/1 |  |
| `DRpbCBMx…` | AgaveBam | conflict | 2 | 7 | 100% [65%–100%] | 0% [0%–35%] | 2/2 | 0/2 |  |
| `E1r4Psq8…` | JitoLabs | equal_fee | 2 | 13 | – | 62% [36%–82%] | 0/2 | 0/2 | insufficient data |
| `E1r4Psq8…` | JitoLabs | fee_with_send | 3 | 21 | 81% [60%–92%] | 81% [60%–92%] | 0/3 | 0/3 |  |
| `E1r4Psq8…` | JitoLabs | conflict | 4 | 28 | 29% [15%–47%] | 71% [53%–85%] | 0/4 | 1/4 |  |
| `E1r4Psq8…` | JitoLabs | fee_vs_send | 5 | 60 | 57% [44%–68%] | 43% [32%–56%] | 1/5 | 0/5 | no detectable rule (noise) |
| `JD549Hsb…` | Firedancer | fee_vs_send | 4 | 46 | 22% [12%–36%] | 78% [64%–88%] | 0/4 | 0/4 | no detectable rule (noise) |
| `JD549Hsb…` | Firedancer | fee_with_send | 5 | 37 | 76% [60%–87%] | 76% [60%–87%] | 1/5 | 1/5 |  |
| `JD549Hsb…` | Firedancer | conflict | 4 | 27 | 19% [8%–37%] | 81% [63%–92%] | 1/4 | 1/4 |  |
| `JD549Hsb…` | Firedancer | equal_fee | 5 | 23 | – | 65% [45%–81%] | 0/5 | 1/5 | no detectable rule (noise) |
| `7QQGNm3p…` | Agave | fee_vs_send | 3 | 16 | 81% [57%–93%] | 19% [7%–43%] | 2/3 | 1/3 | insufficient data |
| `7QQGNm3p…` | Agave | conflict | 5 | 10 | 10% [2%–40%] | 90% [60%–98%] | 1/5 | 4/5 |  |
| `7QQGNm3p…` | Agave | fee_with_send | 3 | 3 | 33% [6%–79%] | 33% [6%–79%] | 1/3 | 1/3 |  |
| `7QQGNm3p…` | Agave | equal_fee | 3 | 17 | – | 59% [36%–78%] | 0/3 | 0/3 | insufficient data |
| `5Us18hLZ…` | Agave | fee_with_send | 1 | 10 | 70% [40%–89%] | 70% [40%–89%] | 0/1 | 0/1 |  |
| `5Us18hLZ…` | Agave | fee_vs_send | 4 | 23 | 87% [68%–95%] | 13% [5%–32%] | 1/4 | 1/4 | no detectable rule (noise) |
| `5Us18hLZ…` | Agave | conflict | 0 | 0 | – | – | 0/0 | 0/0 |  |
| `5Us18hLZ…` | Agave | equal_fee | 4 | 16 | – | 81% [57%–93%] | 0/4 | 2/4 | no detectable rule (noise) |

## Order of our own transactions, by the client of the leader that built the block

Same as above, but every block that holds at least two txs of one burst counts, whichever leader built it. The leader comes from `getSlotLeaders`, its client from gossip at collection time (2026-10-29T14:13:28.343Z).

| client | leaders | arm | bursts in one block | pairs | fee first | sent first | perfect fee order | perfect send order | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Agave | 3 | fee_vs_send | 7 | 39 | 85% [70%–93%] | 15% [7%–30%] | 3/7 | 2/7 | no detectable rule (noise) |
| Agave | 3 | fee_with_send | 5 | 23 | 65% [45%–81%] | 65% [45%–81%] | 1/5 | 1/5 |  |
| Agave | 3 | equal_fee | 7 | 33 | – | 70% [53%–83%] | 0/7 | 2/7 | no detectable rule (noise) |
| Agave | 3 | conflict | 5 | 10 | 10% [2%–40%] | 90% [60%–98%] | 1/5 | 4/5 |  |
| AgaveBam | 54 | fee_vs_send | 31 | 169 | 27% [21%–34%] | 73% [66%–79%] | 3/31 | 11/31 | arrival order (FIFO-like) |
| AgaveBam | 54 | fee_with_send | 33 | 247 | 83% [78%–87%] | 83% [78%–87%] | 14/33 | 14/33 |  |
| AgaveBam | 54 | equal_fee | 35 | 214 | – | 71% [65%–77%] | 0/35 | 12/35 | arrival order (FIFO-like) |
| AgaveBam | 54 | conflict | 34 | 182 | 43% [36%–50%] | 57% [50%–64%] | 9/34 | 7/34 |  |
| FireBAM | 2 | fee_vs_send | 1 | 6 | 33% [10%–70%] | 67% [30%–90%] | 0/1 | 0/1 | insufficient data |
| FireBAM | 2 | fee_with_send | 1 | 15 | 87% [62%–96%] | 87% [62%–96%] | 0/1 | 0/1 |  |
| FireBAM | 2 | conflict | 1 | 10 | 20% [6%–51%] | 80% [49%–94%] | 0/1 | 0/1 |  |
| Firedancer | 5 | fee_vs_send | 11 | 88 | 24% [16%–34%] | 76% [66%–84%] | 1/11 | 1/11 | arrival order (FIFO-like) |
| Firedancer | 5 | fee_with_send | 8 | 59 | 83% [72%–91%] | 83% [72%–91%] | 3/8 | 3/8 |  |
| Firedancer | 5 | equal_fee | 11 | 72 | – | 61% [50%–72%] | 0/11 | 2/11 | no detectable rule (noise) |
| Firedancer | 5 | conflict | 12 | 73 | 34% [24%–46%] | 66% [54%–76%] | 3/12 | 3/12 |  |
| HarmonicAgave | 24 | fee_vs_send | 26 | 191 | 33% [27%–40%] | 67% [60%–73%] | 2/26 | 5/26 | arrival order (FIFO-like) |
| HarmonicAgave | 24 | fee_with_send | 25 | 196 | 72% [66%–78%] | 72% [66%–78%] | 4/25 | 4/25 |  |
| HarmonicAgave | 24 | equal_fee | 23 | 185 | – | 78% [71%–83%] | 0/23 | 3/23 | arrival order (FIFO-like) |
| HarmonicAgave | 24 | conflict | 23 | 165 | 25% [19%–32%] | 75% [68%–81%] | 1/23 | 8/23 |  |
| HarmonicFiredancer | 11 | fee_vs_send | 9 | 62 | 18% [10%–29%] | 82% [71%–90%] | 1/9 | 2/9 | arrival order (FIFO-like) |
| HarmonicFiredancer | 11 | fee_with_send | 9 | 57 | 65% [52%–76%] | 65% [52%–76%] | 3/9 | 3/9 |  |
| HarmonicFiredancer | 11 | equal_fee | 12 | 46 | – | 67% [53%–79%] | 0/12 | 3/12 | no detectable rule (noise) |
| HarmonicFiredancer | 11 | conflict | 13 | 84 | 43% [33%–54%] | 57% [46%–67%] | 3/13 | 2/13 |  |
| JitoLabs | 26 | fee_vs_send | 29 | 247 | 31% [26%–37%] | 69% [63%–74%] | 3/29 | 8/29 | arrival order (FIFO-like) |
| JitoLabs | 26 | fee_with_send | 23 | 203 | 72% [65%–78%] | 72% [65%–78%] | 4/23 | 4/23 |  |
| JitoLabs | 26 | equal_fee | 20 | 119 | – | 69% [60%–77%] | 0/20 | 7/20 | arrival order (FIFO-like) |
| JitoLabs | 26 | conflict | 27 | 211 | 31% [25%–38%] | 69% [62%–75%] | 3/27 | 7/27 |  |
| Raiku | 1 | conflict | 1 | 10 | 20% [6%–51%] | 80% [49%–94%] | 0/1 | 0/1 |  |
| Rakurai | 2 | fee_with_send | 2 | 7 | 100% [65%–100%] | 100% [65%–100%] | 2/2 | 2/2 |  |
| Rakurai | 2 | equal_fee | 2 | 6 | – | 100% [61%–100%] | 0/2 | 2/2 | insufficient data |
| Rakurai | 2 | conflict | 1 | 10 | 40% [17%–69%] | 60% [31%–83%] | 0/1 | 0/1 |  |
| Unknown(5694) | 1 | fee_with_send | 1 | 10 | 90% [60%–98%] | 90% [60%–98%] | 0/1 | 0/1 |  |

## Whole blocks (supplementary: other people's txs)

For blocks of the target leader that contain our txs: share of adjacent tx pairs where priority (prioritization fee per requested CU) does not increase, and Spearman ρ between position and priority (−1 = sorted high→low; 0 = no relation).

| validator | client | blocks | adjacent non-increasing | mean ρ |
|---|---|---|---|---|
| `CAo1dCGY…` | HarmonicAgave | 17 | 51% | 0.03 |
| `Fd7btgyS…` | HarmonicAgave | 14 | 51% | -0.00 |
| `JUPiTERr…` | HarmonicFiredancer | 15 | 51% | 0.08 |
| `HEL1USMZ…` | JitoLabs | 21 | 51% | 0.01 |
| `5Cchr1XG…` | AgaveBam | 16 | 52% | -0.16 |
| `9eGrDohd…` | Firedancer | 17 | 53% | 0.03 |
| `Awes4Tr6…` | HarmonicFiredancer | 13 | 51% | 0.07 |
| `DRpbCBMx…` | AgaveBam | 13 | 52% | -0.12 |
| `E1r4Psq8…` | JitoLabs | 14 | 51% | -0.06 |
| `JD549Hsb…` | Firedancer | 18 | 52% | -0.01 |
| `7QQGNm3p…` | Agave | 14 | 51% | -0.05 |
| `5Us18hLZ…` | Agave | 9 | 51% | -0.03 |

## What went wrong (automatic part)

- Probes skipped because the trigger slot had already passed: 3.
- Send errors: 5× `{"code":429,"message":"Too many requests for a specific RPC call"}`; 1× `TypeError: fetch failed`.
- Missing or skipped blocks: 4.

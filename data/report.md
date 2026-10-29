# Inside the Block — results

Targets selected 2026-10-28T17:04:35.418Z. Live probes: 603, from 2026-10-28T17:04:46.964Z to 2026-10-29T19:18:48.443Z (UTC). All after Alpenglow activation (slot 459,653,000).
Per-tx raw data: `data/ours.csv`, `data/probes.jsonl`, `data/statuses.json`, `data/blocks/`. Every claim can be re-checked with `getBlock` on the listed slots.

## Where our transactions landed

Slot of each tx relative to the first slot of the target window. `LEAD_SLOTS` = how many slots before the window the burst fired; `GAP_MS` = pause between the txs of one burst.

| LEAD_SLOTS/GAP_MS | slot offset | txs | share |
|---|---|---|---|
| 2/20 | -2 (before the window) | 38 | 2% |
| 2/20 | -1 (before the window) | 773 | 40% |
| 2/20 | 0 (target window) | 545 | 28% |
| 2/20 | 1 (target window) | 98 | 5% |
| 2/20 | 2 (target window) | 47 | 2% |
| 2/20 | 3 (target window) | 28 | 1% |
| 2/20 | 4-11 (after the window) | 119 | 6% |
| 2/20 | 12 or more | 272 | 14% |
| 2/20 | not landed | 6 | 0% |
| 0/20 | 1 (target window) | 27 | 4% |
| 0/20 | 2 (target window) | 199 | 33% |
| 0/20 | 3 (target window) | 106 | 17% |
| 0/20 | 4-11 (after the window) | 55 | 9% |
| 0/20 | 7 (target window) | 5 | 1% |
| 0/20 | 12 or more | 6 | 1% |
| 0/20 | not landed | 214 | 35% |
| 0/0 | 1 (target window) | 76 | 7% |
| 0/0 | 2 (target window) | 423 | 39% |
| 0/0 | 3 (target window) | 354 | 33% |
| 0/0 | 4-11 (after the window) | 87 | 8% |
| 0/0 | 12 or more | 8 | 1% |
| 0/0 | not landed | 132 | 12% |

## Landing

| validator | client | version | stake | LEAD_SLOTS/GAP_MS | probes | txs | landed | in target window | bursts split across blocks |
|---|---|---|---|---|---|---|---|---|---|
| `5Cchr1XG…` | AgaveBam | 4.3.2 | 1.32% | 2/20 | 28 | 168 | 100% | 38% | 11% |
| `5Us18hLZ…` | Agave | 4.3.2 | 0.28% | 2/20 | 13 | 78 | 100% | 42% | 23% |
| `7QQGNm3p…` | Agave | 4.3.2 | 0.43% | 2/20 | 17 | 102 | 100% | 40% | 24% |
| `9eGrDohd…` | Firedancer | 26.10.4 | 1.62% | 2/20 | 28 | 168 | 100% | 42% | 4% |
| `Awes4Tr6…` | HarmonicFiredancer | 26.10.4 | 1.61% | 2/20 | 27 | 162 | 100% | 31% | 11% |
| `CAo1dCGY…` | HarmonicAgave | 4.3.2 | 2.18% | 2/20 | 32 | 192 | 100% | 34% | 22% |
| `DRpbCBMx…` | AgaveBam | 4.3.2 | 2.95% | 2/20 | 27 | 162 | 99% | 33% | 7% |
| `E1r4Psq8…` | JitoLabs | 4.3.2 | 2.50% | 2/20 | 28 | 168 | 100% | 41% | 18% |
| `Fd7btgyS…` | HarmonicAgave | 4.3.2 | 3.92% | 2/20 | 30 | 180 | 100% | 30% | 7% |
| `HEL1USMZ…` | JitoLabs | 4.3.2 | 3.84% | 2/20 | 32 | 192 | 98% | 39% | 19% |
| `JD549Hsb…` | Firedancer | 26.10.4 | 1.40% | 2/20 | 27 | 162 | 100% | 48% | 7% |
| `JUPiTERr…` | HarmonicFiredancer | 26.10.4 | 2.24% | 2/20 | 32 | 192 | 99% | 35% | 9% |
| `5Cchr1XG…` | AgaveBam | 4.3.2 | 1.32% | 0/20 | 12 | 72 | 75% | 57% | 42% |
| `5Us18hLZ…` | Agave | 4.3.2 | 0.28% | 0/20 | 10 | 60 | 77% | 70% | 60% |
| `7QQGNm3p…` | Agave | 4.3.2 | 0.43% | 0/20 | 8 | 48 | 75% | 63% | 50% |
| `9eGrDohd…` | Firedancer | 26.10.4 | 1.62% | 0/20 | 7 | 42 | 45% | 40% | 14% |
| `Awes4Tr6…` | HarmonicFiredancer | 26.10.4 | 1.61% | 0/20 | 7 | 42 | 62% | 62% | 57% |
| `CAo1dCGY…` | HarmonicAgave | 4.3.2 | 2.18% | 0/20 | 5 | 30 | 80% | 47% | 60% |
| `DRpbCBMx…` | AgaveBam | 4.3.2 | 2.95% | 0/20 | 12 | 72 | 44% | 40% | 42% |
| `E1r4Psq8…` | JitoLabs | 4.3.2 | 2.50% | 0/20 | 8 | 48 | 60% | 54% | 38% |
| `Fd7btgyS…` | HarmonicAgave | 4.3.2 | 3.92% | 0/20 | 5 | 30 | 83% | 73% | 80% |
| `HEL1USMZ…` | JitoLabs | 4.3.2 | 3.84% | 0/20 | 9 | 54 | 70% | 63% | 67% |
| `JD549Hsb…` | Firedancer | 26.10.4 | 1.40% | 0/20 | 10 | 60 | 53% | 50% | 40% |
| `JUPiTERr…` | HarmonicFiredancer | 26.10.4 | 2.24% | 0/20 | 9 | 54 | 69% | 48% | 22% |
| `5Cchr1XG…` | AgaveBam | 4.3.2 | 1.32% | 0/0 | 15 | 90 | 100% | 66% | 27% |
| `5Us18hLZ…` | Agave | 4.3.2 | 0.28% | 0/0 | 16 | 96 | 98% | 88% | 63% |
| `7QQGNm3p…` | Agave | 4.3.2 | 0.43% | 0/0 | 15 | 90 | 99% | 73% | 47% |
| `9eGrDohd…` | Firedancer | 26.10.4 | 1.62% | 0/0 | 15 | 90 | 86% | 84% | 27% |
| `Awes4Tr6…` | HarmonicFiredancer | 26.10.4 | 1.61% | 0/0 | 16 | 96 | 81% | 81% | 44% |
| `CAo1dCGY…` | HarmonicAgave | 4.3.2 | 2.18% | 0/0 | 12 | 72 | 79% | 74% | 50% |
| `DRpbCBMx…` | AgaveBam | 4.3.2 | 2.95% | 0/0 | 15 | 90 | 81% | 68% | 20% |
| `E1r4Psq8…` | JitoLabs | 4.3.2 | 2.50% | 0/0 | 14 | 84 | 79% | 76% | 36% |
| `Fd7btgyS…` | HarmonicAgave | 4.3.2 | 3.92% | 0/0 | 15 | 90 | 89% | 89% | 60% |
| `HEL1USMZ…` | JitoLabs | 4.3.2 | 3.84% | 0/0 | 15 | 90 | 89% | 83% | 73% |
| `JD549Hsb…` | Firedancer | 26.10.4 | 1.40% | 0/0 | 16 | 96 | 86% | 83% | 44% |
| `JUPiTERr…` | HarmonicFiredancer | 26.10.4 | 2.24% | 0/0 | 16 | 96 | 84% | 80% | 50% |

## Order of our own transactions inside one block

Pairs = every pair of our txs from one burst that landed in the same block. "Fee first" = the higher-fee tx is earlier; "sent first" = the earlier-sent tx is earlier. 95% Wilson intervals. The verdict uses the `fee_vs_send` arm (the two rules predict opposite orders) with a burst-level binomial test, because pairs inside a burst are not independent.

| validator | client | LEAD_SLOTS/GAP_MS | arm | bursts in one block | pairs | fee first | sent first | perfect fee order | perfect send order | verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| `5Cchr1XG…` | AgaveBam | 2/20 | fee_with_send | 3 | 22 | 100% [85%–100%] | 100% [85%–100%] | 3/3 | 3/3 |  |
| `5Cchr1XG…` | AgaveBam | 2/20 | conflict | 7 | 47 | 62% [47%–74%] | 38% [26%–53%] | 3/7 | 1/7 |  |
| `5Cchr1XG…` | AgaveBam | 2/20 | equal_fee | 4 | 27 | – | 56% [37%–72%] | 0/4 | 0/4 | insufficient data |
| `5Cchr1XG…` | AgaveBam | 2/20 | fee_vs_send | 2 | 2 | 100% [34%–100%] | 0% [0%–66%] | 2/2 | 0/2 | insufficient data |
| `5Us18hLZ…` | Agave | 2/20 | fee_with_send | 1 | 10 | 70% [40%–89%] | 70% [40%–89%] | 0/1 | 0/1 |  |
| `5Us18hLZ…` | Agave | 2/20 | fee_vs_send | 4 | 23 | 87% [68%–95%] | 13% [5%–32%] | 1/4 | 1/4 | no detectable rule (noise) |
| `5Us18hLZ…` | Agave | 2/20 | conflict | 0 | 0 | – | – | 0/0 | 0/0 |  |
| `5Us18hLZ…` | Agave | 2/20 | equal_fee | 4 | 16 | – | 81% [57%–93%] | 0/4 | 2/4 | no detectable rule (noise) |
| `7QQGNm3p…` | Agave | 2/20 | fee_vs_send | 3 | 16 | 81% [57%–93%] | 19% [7%–43%] | 2/3 | 1/3 | insufficient data |
| `7QQGNm3p…` | Agave | 2/20 | conflict | 5 | 10 | 10% [2%–40%] | 90% [60%–98%] | 1/5 | 4/5 |  |
| `7QQGNm3p…` | Agave | 2/20 | fee_with_send | 3 | 3 | 33% [6%–79%] | 33% [6%–79%] | 1/3 | 1/3 |  |
| `7QQGNm3p…` | Agave | 2/20 | equal_fee | 3 | 17 | – | 59% [36%–78%] | 0/3 | 0/3 | insufficient data |
| `9eGrDohd…` | Firedancer | 2/20 | equal_fee | 5 | 43 | – | 53% [39%–67%] | 0/5 | 0/5 | no detectable rule (noise) |
| `9eGrDohd…` | Firedancer | 2/20 | conflict | 5 | 33 | 48% [33%–65%] | 52% [35%–67%] | 2/5 | 1/5 |  |
| `9eGrDohd…` | Firedancer | 2/20 | fee_with_send | 2 | 21 | 95% [77%–99%] | 95% [77%–99%] | 1/2 | 1/2 |  |
| `9eGrDohd…` | Firedancer | 2/20 | fee_vs_send | 5 | 17 | 35% [17%–59%] | 65% [41%–83%] | 1/5 | 1/5 | no detectable rule (noise) |
| `Awes4Tr6…` | HarmonicFiredancer | 2/20 | conflict | 3 | 17 | 71% [47%–87%] | 29% [13%–53%] | 1/3 | 1/3 |  |
| `Awes4Tr6…` | HarmonicFiredancer | 2/20 | fee_vs_send | 0 | 0 | – | – | 0/0 | 0/0 | insufficient data |
| `Awes4Tr6…` | HarmonicFiredancer | 2/20 | fee_with_send | 5 | 32 | 75% [58%–87%] | 75% [58%–87%] | 2/5 | 2/5 |  |
| `Awes4Tr6…` | HarmonicFiredancer | 2/20 | equal_fee | 6 | 16 | – | 63% [39%–82%] | 0/6 | 2/6 | no detectable rule (noise) |
| `CAo1dCGY…` | HarmonicAgave | 2/20 | fee_vs_send | 6 | 25 | 36% [20%–55%] | 64% [45%–80%] | 1/6 | 2/6 | no detectable rule (noise) |
| `CAo1dCGY…` | HarmonicAgave | 2/20 | equal_fee | 5 | 34 | – | 65% [48%–79%] | 0/5 | 1/5 | no detectable rule (noise) |
| `CAo1dCGY…` | HarmonicAgave | 2/20 | fee_with_send | 2 | 11 | 55% [28%–79%] | 55% [28%–79%] | 0/2 | 0/2 |  |
| `CAo1dCGY…` | HarmonicAgave | 2/20 | conflict | 4 | 18 | 39% [20%–61%] | 61% [39%–80%] | 0/4 | 2/4 |  |
| `DRpbCBMx…` | AgaveBam | 2/20 | fee_vs_send | 3 | 13 | 31% [13%–58%] | 69% [42%–87%] | 0/3 | 2/3 | insufficient data |
| `DRpbCBMx…` | AgaveBam | 2/20 | equal_fee | 7 | 44 | – | 57% [42%–70%] | 0/7 | 2/7 | no detectable rule (noise) |
| `DRpbCBMx…` | AgaveBam | 2/20 | fee_with_send | 1 | 10 | 80% [49%–94%] | 80% [49%–94%] | 0/1 | 0/1 |  |
| `DRpbCBMx…` | AgaveBam | 2/20 | conflict | 2 | 7 | 100% [65%–100%] | 0% [0%–35%] | 2/2 | 0/2 |  |
| `E1r4Psq8…` | JitoLabs | 2/20 | equal_fee | 2 | 13 | – | 62% [36%–82%] | 0/2 | 0/2 | insufficient data |
| `E1r4Psq8…` | JitoLabs | 2/20 | fee_with_send | 3 | 21 | 81% [60%–92%] | 81% [60%–92%] | 0/3 | 0/3 |  |
| `E1r4Psq8…` | JitoLabs | 2/20 | conflict | 4 | 28 | 29% [15%–47%] | 71% [53%–85%] | 0/4 | 1/4 |  |
| `E1r4Psq8…` | JitoLabs | 2/20 | fee_vs_send | 5 | 60 | 57% [44%–68%] | 43% [32%–56%] | 1/5 | 0/5 | no detectable rule (noise) |
| `Fd7btgyS…` | HarmonicAgave | 2/20 | fee_with_send | 6 | 26 | 62% [43%–78%] | 62% [43%–78%] | 3/6 | 3/6 |  |
| `Fd7btgyS…` | HarmonicAgave | 2/20 | equal_fee | 1 | 1 | – | 100% [21%–100%] | 0/1 | 1/1 | insufficient data |
| `Fd7btgyS…` | HarmonicAgave | 2/20 | conflict | 3 | 31 | 13% [5%–29%] | 87% [71%–95%] | 0/3 | 1/3 |  |
| `Fd7btgyS…` | HarmonicAgave | 2/20 | fee_vs_send | 4 | 37 | 46% [31%–62%] | 54% [38%–69%] | 1/4 | 0/4 | no detectable rule (noise) |
| `HEL1USMZ…` | JitoLabs | 2/20 | conflict | 4 | 18 | 78% [55%–91%] | 22% [9%–45%] | 2/4 | 1/4 |  |
| `HEL1USMZ…` | JitoLabs | 2/20 | fee_vs_send | 7 | 18 | 50% [29%–71%] | 50% [29%–71%] | 2/7 | 2/7 | no detectable rule (noise) |
| `HEL1USMZ…` | JitoLabs | 2/20 | equal_fee | 4 | 13 | – | 77% [50%–92%] | 0/4 | 2/4 | no detectable rule (noise) |
| `HEL1USMZ…` | JitoLabs | 2/20 | fee_with_send | 6 | 43 | 67% [53%–80%] | 67% [53%–80%] | 1/6 | 1/6 |  |
| `JD549Hsb…` | Firedancer | 2/20 | fee_vs_send | 4 | 46 | 22% [12%–36%] | 78% [64%–88%] | 0/4 | 0/4 | no detectable rule (noise) |
| `JD549Hsb…` | Firedancer | 2/20 | fee_with_send | 5 | 37 | 76% [60%–87%] | 76% [60%–87%] | 1/5 | 1/5 |  |
| `JD549Hsb…` | Firedancer | 2/20 | conflict | 4 | 27 | 19% [8%–37%] | 81% [63%–92%] | 1/4 | 1/4 |  |
| `JD549Hsb…` | Firedancer | 2/20 | equal_fee | 5 | 23 | – | 65% [45%–81%] | 0/5 | 1/5 | no detectable rule (noise) |
| `JUPiTERr…` | HarmonicFiredancer | 2/20 | equal_fee | 4 | 15 | – | 73% [48%–89%] | 0/4 | 1/4 | no detectable rule (noise) |
| `JUPiTERr…` | HarmonicFiredancer | 2/20 | fee_vs_send | 3 | 21 | 19% [8%–40%] | 81% [60%–92%] | 1/3 | 0/3 | insufficient data |
| `JUPiTERr…` | HarmonicFiredancer | 2/20 | conflict | 5 | 38 | 37% [23%–53%] | 63% [47%–77%] | 1/5 | 0/5 |  |
| `JUPiTERr…` | HarmonicFiredancer | 2/20 | fee_with_send | 3 | 22 | 45% [27%–65%] | 45% [27%–65%] | 0/3 | 0/3 |  |
| `5Cchr1XG…` | AgaveBam | 0/20 | fee_with_send | 3 | 13 | 54% [29%–77%] | 54% [29%–77%] | 1/3 | 1/3 |  |
| `5Cchr1XG…` | AgaveBam | 0/20 | conflict | 2 | 4 | 0% [0%–49%] | 100% [51%–100%] | 0/2 | 2/2 |  |
| `5Cchr1XG…` | AgaveBam | 0/20 | fee_vs_send | 3 | 31 | 35% [21%–53%] | 65% [47%–79%] | 0/3 | 0/3 | insufficient data |
| `5Cchr1XG…` | AgaveBam | 0/20 | equal_fee | 2 | 11 | – | 82% [52%–95%] | 0/2 | 1/2 | insufficient data |
| `5Us18hLZ…` | Agave | 0/20 | fee_with_send | 3 | 30 | 77% [59%–88%] | 77% [59%–88%] | 0/3 | 0/3 |  |
| `5Us18hLZ…` | Agave | 0/20 | equal_fee | 2 | 2 | – | 100% [34%–100%] | 0/2 | 2/2 | insufficient data |
| `5Us18hLZ…` | Agave | 0/20 | conflict | 4 | 12 | 17% [5%–45%] | 83% [55%–95%] | 0/4 | 2/4 |  |
| `5Us18hLZ…` | Agave | 0/20 | fee_vs_send | 2 | 7 | 29% [8%–64%] | 71% [36%–92%] | 1/2 | 0/2 | insufficient data |
| `7QQGNm3p…` | Agave | 0/20 | fee_vs_send | 1 | 10 | 20% [6%–51%] | 80% [49%–94%] | 0/1 | 0/1 | insufficient data |
| `7QQGNm3p…` | Agave | 0/20 | equal_fee | 3 | 17 | – | 88% [66%–97%] | 0/3 | 2/3 | insufficient data |
| `7QQGNm3p…` | Agave | 0/20 | conflict | 1 | 10 | 30% [11%–60%] | 70% [40%–89%] | 0/1 | 0/1 |  |
| `7QQGNm3p…` | Agave | 0/20 | fee_with_send | 2 | 7 | 71% [36%–92%] | 71% [36%–92%] | 1/2 | 1/2 |  |
| `9eGrDohd…` | Firedancer | 0/20 | fee_with_send | 0 | 0 | – | – | 0/0 | 0/0 |  |
| `9eGrDohd…` | Firedancer | 0/20 | conflict | 2 | 25 | 28% [14%–48%] | 72% [52%–86%] | 0/2 | 0/2 |  |
| `9eGrDohd…` | Firedancer | 0/20 | fee_vs_send | 1 | 6 | 17% [3%–56%] | 83% [44%–97%] | 0/1 | 0/1 | insufficient data |
| `Awes4Tr6…` | HarmonicFiredancer | 0/20 | fee_with_send | 2 | 7 | 43% [16%–75%] | 43% [16%–75%] | 1/2 | 1/2 |  |
| `Awes4Tr6…` | HarmonicFiredancer | 0/20 | fee_vs_send | 4 | 18 | 61% [39%–80%] | 39% [20%–61%] | 1/4 | 1/4 | insufficient data |
| `Awes4Tr6…` | HarmonicFiredancer | 0/20 | conflict | 2 | 7 | 43% [16%–75%] | 57% [25%–84%] | 1/2 | 0/2 |  |
| `CAo1dCGY…` | HarmonicAgave | 0/20 | fee_vs_send | 1 | 6 | 33% [10%–70%] | 67% [30%–90%] | 0/1 | 0/1 | insufficient data |
| `CAo1dCGY…` | HarmonicAgave | 0/20 | fee_with_send | 2 | 2 | 100% [34%–100%] | 100% [34%–100%] | 2/2 | 2/2 |  |
| `CAo1dCGY…` | HarmonicAgave | 0/20 | equal_fee | 0 | 0 | – | – | 0/0 | 0/0 | insufficient data |
| `DRpbCBMx…` | AgaveBam | 0/20 | equal_fee | 1 | 1 | – | 100% [21%–100%] | 0/1 | 1/1 | insufficient data |
| `DRpbCBMx…` | AgaveBam | 0/20 | fee_with_send | 3 | 17 | 94% [73%–99%] | 94% [73%–99%] | 2/3 | 2/3 |  |
| `DRpbCBMx…` | AgaveBam | 0/20 | fee_vs_send | 3 | 12 | 50% [25%–75%] | 50% [25%–75%] | 1/3 | 1/3 | insufficient data |
| `DRpbCBMx…` | AgaveBam | 0/20 | conflict | 1 | 1 | 100% [21%–100%] | 0% [0%–79%] | 1/1 | 0/1 |  |
| `E1r4Psq8…` | JitoLabs | 0/20 | fee_with_send | 1 | 10 | 70% [40%–89%] | 70% [40%–89%] | 0/1 | 0/1 |  |
| `E1r4Psq8…` | JitoLabs | 0/20 | fee_vs_send | 3 | 10 | 10% [2%–40%] | 90% [60%–98%] | 0/3 | 2/3 | insufficient data |
| `E1r4Psq8…` | JitoLabs | 0/20 | equal_fee | 2 | 4 | – | 25% [5%–70%] | 0/2 | 0/2 | insufficient data |
| `E1r4Psq8…` | JitoLabs | 0/20 | conflict | 1 | 6 | 0% [0%–39%] | 100% [61%–100%] | 0/1 | 1/1 |  |
| `Fd7btgyS…` | HarmonicAgave | 0/20 | fee_vs_send | 2 | 16 | 56% [33%–77%] | 44% [23%–67%] | 0/2 | 1/2 | insufficient data |
| `Fd7btgyS…` | HarmonicAgave | 0/20 | fee_with_send | 1 | 6 | 67% [30%–90%] | 67% [30%–90%] | 0/1 | 0/1 |  |
| `Fd7btgyS…` | HarmonicAgave | 0/20 | equal_fee | 2 | 7 | – | 86% [49%–97%] | 0/2 | 1/2 | insufficient data |
| `HEL1USMZ…` | JitoLabs | 0/20 | fee_vs_send | 7 | 28 | 25% [13%–43%] | 75% [57%–87%] | 1/7 | 3/7 | no detectable rule (noise) |
| `HEL1USMZ…` | JitoLabs | 0/20 | conflict | 4 | 6 | 33% [10%–70%] | 67% [30%–90%] | 0/4 | 3/4 |  |
| `HEL1USMZ…` | JitoLabs | 0/20 | equal_fee | 0 | 0 | – | – | 0/0 | 0/0 | insufficient data |
| `HEL1USMZ…` | JitoLabs | 0/20 | fee_with_send | 0 | 0 | – | – | 0/0 | 0/0 |  |
| `JD549Hsb…` | Firedancer | 0/20 | equal_fee | 2 | 7 | – | 86% [49%–97%] | 0/2 | 1/2 | insufficient data |
| `JD549Hsb…` | Firedancer | 0/20 | conflict | 2 | 6 | 17% [3%–56%] | 83% [44%–97%] | 0/2 | 1/2 |  |
| `JD549Hsb…` | Firedancer | 0/20 | fee_with_send | 3 | 10 | 60% [31%–83%] | 60% [31%–83%] | 1/3 | 1/3 |  |
| `JD549Hsb…` | Firedancer | 0/20 | fee_vs_send | 1 | 15 | 13% [4%–38%] | 87% [62%–96%] | 0/1 | 0/1 | insufficient data |
| `JUPiTERr…` | HarmonicFiredancer | 0/20 | fee_vs_send | 1 | 10 | 30% [11%–60%] | 70% [40%–89%] | 0/1 | 0/1 | insufficient data |
| `JUPiTERr…` | HarmonicFiredancer | 0/20 | equal_fee | 2 | 4 | – | 75% [30%–95%] | 0/2 | 1/2 | insufficient data |
| `JUPiTERr…` | HarmonicFiredancer | 0/20 | conflict | 3 | 22 | 27% [13%–48%] | 73% [52%–87%] | 0/3 | 1/3 |  |
| `5Cchr1XG…` | AgaveBam | 0/0 | fee_vs_send | 5 | 33 | 67% [50%–80%] | 33% [20%–50%] | 2/5 | 1/5 | no detectable rule (noise) |
| `5Cchr1XG…` | AgaveBam | 0/0 | equal_fee | 3 | 33 | – | 70% [53%–83%] | 0/3 | 0/3 | insufficient data |
| `5Cchr1XG…` | AgaveBam | 0/0 | conflict | 2 | 16 | 50% [28%–72%] | 50% [28%–72%] | 1/2 | 0/2 |  |
| `5Cchr1XG…` | AgaveBam | 0/0 | fee_with_send | 4 | 14 | 100% [78%–100%] | 100% [78%–100%] | 4/4 | 4/4 |  |
| `5Us18hLZ…` | Agave | 0/0 | fee_with_send | 4 | 32 | 72% [55%–84%] | 72% [55%–84%] | 1/4 | 1/4 |  |
| `5Us18hLZ…` | Agave | 0/0 | conflict | 6 | 36 | 33% [20%–50%] | 67% [50%–80%] | 1/6 | 2/6 |  |
| `5Us18hLZ…` | Agave | 0/0 | fee_vs_send | 5 | 29 | 38% [23%–56%] | 62% [44%–77%] | 2/5 | 0/5 | no detectable rule (noise) |
| `5Us18hLZ…` | Agave | 0/0 | equal_fee | 5 | 38 | – | 82% [67%–91%] | 0/5 | 2/5 | no detectable rule (noise) |
| `7QQGNm3p…` | Agave | 0/0 | fee_with_send | 6 | 24 | 67% [47%–82%] | 67% [47%–82%] | 2/6 | 2/6 |  |
| `7QQGNm3p…` | Agave | 0/0 | equal_fee | 4 | 28 | – | 68% [49%–82%] | 0/4 | 0/4 | no detectable rule (noise) |
| `7QQGNm3p…` | Agave | 0/0 | conflict | 4 | 36 | 33% [20%–50%] | 67% [50%–80%] | 0/4 | 1/4 |  |
| `7QQGNm3p…` | Agave | 0/0 | fee_vs_send | 3 | 8 | 50% [22%–78%] | 50% [22%–78%] | 1/3 | 1/3 | insufficient data |
| `9eGrDohd…` | Firedancer | 0/0 | fee_vs_send | 2 | 21 | 29% [14%–50%] | 71% [50%–86%] | 0/2 | 0/2 | insufficient data |
| `9eGrDohd…` | Firedancer | 0/0 | fee_with_send | 6 | 62 | 98% [91%–100%] | 98% [91%–100%] | 5/6 | 5/6 |  |
| `9eGrDohd…` | Firedancer | 0/0 | equal_fee | 4 | 31 | – | 71% [53%–84%] | 0/4 | 1/4 | insufficient data |
| `9eGrDohd…` | Firedancer | 0/0 | conflict | 5 | 33 | 73% [56%–85%] | 27% [15%–44%] | 3/5 | 1/5 |  |
| `Awes4Tr6…` | HarmonicFiredancer | 0/0 | equal_fee | 3 | 23 | – | 57% [37%–74%] | 0/3 | 0/3 | insufficient data |
| `Awes4Tr6…` | HarmonicFiredancer | 0/0 | fee_with_send | 4 | 41 | 76% [61%–86%] | 76% [61%–86%] | 1/4 | 1/4 |  |
| `Awes4Tr6…` | HarmonicFiredancer | 0/0 | fee_vs_send | 3 | 40 | 53% [37%–67%] | 48% [33%–63%] | 0/3 | 0/3 | insufficient data |
| `Awes4Tr6…` | HarmonicFiredancer | 0/0 | conflict | 6 | 40 | 45% [31%–60%] | 55% [40%–69%] | 4/6 | 0/6 |  |
| `CAo1dCGY…` | HarmonicAgave | 0/0 | fee_with_send | 5 | 33 | 82% [66%–91%] | 82% [66%–91%] | 1/5 | 1/5 |  |
| `CAo1dCGY…` | HarmonicAgave | 0/0 | fee_vs_send | 4 | 24 | 33% [18%–53%] | 67% [47%–82%] | 1/4 | 0/4 | insufficient data |
| `CAo1dCGY…` | HarmonicAgave | 0/0 | equal_fee | 2 | 4 | – | 50% [15%–85%] | 0/2 | 0/2 | insufficient data |
| `CAo1dCGY…` | HarmonicAgave | 0/0 | conflict | 3 | 17 | 59% [36%–78%] | 41% [22%–64%] | 0/3 | 1/3 |  |
| `DRpbCBMx…` | AgaveBam | 0/0 | fee_with_send | 3 | 40 | 93% [80%–97%] | 93% [80%–97%] | 0/3 | 0/3 |  |
| `DRpbCBMx…` | AgaveBam | 0/0 | conflict | 1 | 6 | 33% [10%–70%] | 67% [30%–90%] | 0/1 | 0/1 |  |
| `DRpbCBMx…` | AgaveBam | 0/0 | equal_fee | 6 | 27 | – | 63% [44%–78%] | 0/6 | 0/6 | no detectable rule (noise) |
| `DRpbCBMx…` | AgaveBam | 0/0 | fee_vs_send | 4 | 37 | 76% [60%–87%] | 24% [13%–40%] | 3/4 | 0/4 | no detectable rule (noise) |
| `E1r4Psq8…` | JitoLabs | 0/0 | conflict | 5 | 43 | 33% [20%–47%] | 67% [53%–80%] | 1/5 | 1/5 |  |
| `E1r4Psq8…` | JitoLabs | 0/0 | equal_fee | 1 | 10 | – | 30% [11%–60%] | 0/1 | 0/1 | insufficient data |
| `E1r4Psq8…` | JitoLabs | 0/0 | fee_with_send | 5 | 42 | 69% [54%–81%] | 69% [54%–81%] | 1/5 | 1/5 |  |
| `E1r4Psq8…` | JitoLabs | 0/0 | fee_vs_send | 3 | 17 | 41% [22%–64%] | 59% [36%–78%] | 1/3 | 1/3 | insufficient data |
| `Fd7btgyS…` | HarmonicAgave | 0/0 | conflict | 4 | 32 | 78% [61%–89%] | 22% [11%–39%] | 2/4 | 0/4 |  |
| `Fd7btgyS…` | HarmonicAgave | 0/0 | fee_vs_send | 7 | 40 | 43% [29%–58%] | 57% [42%–71%] | 0/7 | 3/7 | no detectable rule (noise) |
| `Fd7btgyS…` | HarmonicAgave | 0/0 | fee_with_send | 4 | 23 | 57% [37%–74%] | 57% [37%–74%] | 1/4 | 1/4 |  |
| `Fd7btgyS…` | HarmonicAgave | 0/0 | equal_fee | 3 | 40 | – | 53% [37%–67%] | 0/3 | 0/3 | insufficient data |
| `HEL1USMZ…` | JitoLabs | 0/0 | equal_fee | 6 | 34 | – | 50% [34%–66%] | 0/6 | 1/6 | no detectable rule (noise) |
| `HEL1USMZ…` | JitoLabs | 0/0 | conflict | 4 | 30 | 37% [22%–54%] | 63% [46%–78%] | 0/4 | 0/4 |  |
| `HEL1USMZ…` | JitoLabs | 0/0 | fee_with_send | 4 | 24 | 46% [28%–65%] | 46% [28%–65%] | 0/4 | 0/4 |  |
| `HEL1USMZ…` | JitoLabs | 0/0 | fee_vs_send | 2 | 25 | 48% [30%–67%] | 52% [33%–70%] | 0/2 | 0/2 | insufficient data |
| `JD549Hsb…` | Firedancer | 0/0 | equal_fee | 3 | 26 | – | 73% [54%–86%] | 0/3 | 0/3 | insufficient data |
| `JD549Hsb…` | Firedancer | 0/0 | fee_vs_send | 4 | 27 | 26% [13%–45%] | 74% [55%–87%] | 0/4 | 0/4 | no detectable rule (noise) |
| `JD549Hsb…` | Firedancer | 0/0 | conflict | 6 | 41 | 51% [36%–66%] | 49% [34%–64%] | 1/6 | 1/6 |  |
| `JD549Hsb…` | Firedancer | 0/0 | fee_with_send | 6 | 40 | 60% [45%–74%] | 60% [45%–74%] | 2/6 | 2/6 |  |
| `JUPiTERr…` | HarmonicFiredancer | 0/0 | fee_vs_send | 8 | 52 | 48% [35%–61%] | 52% [39%–65%] | 2/8 | 2/8 | no detectable rule (noise) |
| `JUPiTERr…` | HarmonicFiredancer | 0/0 | equal_fee | 5 | 21 | – | 52% [32%–72%] | 0/5 | 1/5 | no detectable rule (noise) |
| `JUPiTERr…` | HarmonicFiredancer | 0/0 | conflict | 3 | 36 | 56% [40%–70%] | 44% [30%–60%] | 1/3 | 0/3 |  |
| `JUPiTERr…` | HarmonicFiredancer | 0/0 | fee_with_send | 4 | 9 | 56% [27%–81%] | 56% [27%–81%] | 2/4 | 2/4 |  |

## Order of our own transactions, by the client of the leader that built the block

Same as above, but every block that holds at least two txs of one burst counts, whichever leader built it. The leader comes from `getSlotLeaders`, its client from gossip at collection time (2026-10-29T19:55:15.621Z).

| client | LEAD_SLOTS/GAP_MS | leaders | arm | bursts in one block | pairs | fee first | sent first | perfect fee order | perfect send order | verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| Agave | 2/20 | 3 | fee_vs_send | 7 | 39 | 85% [70%–93%] | 15% [7%–30%] | 3/7 | 2/7 | no detectable rule (noise) |
| Agave | 2/20 | 3 | fee_with_send | 5 | 23 | 65% [45%–81%] | 65% [45%–81%] | 1/5 | 1/5 |  |
| Agave | 2/20 | 3 | equal_fee | 7 | 33 | – | 70% [53%–83%] | 0/7 | 2/7 | no detectable rule (noise) |
| Agave | 2/20 | 3 | conflict | 5 | 10 | 10% [2%–40%] | 90% [60%–98%] | 1/5 | 4/5 |  |
| Agave | 0/20 | 2 | fee_vs_send | 3 | 17 | 24% [10%–47%] | 76% [53%–90%] | 1/3 | 0/3 | insufficient data |
| Agave | 0/20 | 2 | fee_with_send | 5 | 37 | 76% [60%–87%] | 76% [60%–87%] | 1/5 | 1/5 |  |
| Agave | 0/20 | 2 | equal_fee | 5 | 19 | – | 89% [69%–97%] | 0/5 | 4/5 | no detectable rule (noise) |
| Agave | 0/20 | 2 | conflict | 5 | 22 | 23% [10%–43%] | 77% [57%–90%] | 0/5 | 2/5 |  |
| Agave | 0/0 | 2 | fee_vs_send | 8 | 37 | 41% [26%–57%] | 59% [43%–74%] | 3/8 | 1/8 | no detectable rule (noise) |
| Agave | 0/0 | 2 | fee_with_send | 10 | 56 | 70% [57%–80%] | 70% [57%–80%] | 3/10 | 3/10 |  |
| Agave | 0/0 | 2 | equal_fee | 9 | 66 | – | 76% [64%–84%] | 0/9 | 2/9 | no detectable rule (noise) |
| Agave | 0/0 | 2 | conflict | 10 | 72 | 33% [24%–45%] | 67% [55%–76%] | 1/10 | 3/10 |  |
| AgaveBam | 2/20 | 54 | fee_vs_send | 31 | 169 | 27% [21%–34%] | 73% [66%–79%] | 3/31 | 11/31 | arrival order (FIFO-like) |
| AgaveBam | 2/20 | 54 | fee_with_send | 33 | 247 | 83% [78%–87%] | 83% [78%–87%] | 14/33 | 14/33 |  |
| AgaveBam | 2/20 | 54 | equal_fee | 35 | 214 | – | 71% [65%–77%] | 0/35 | 12/35 | arrival order (FIFO-like) |
| AgaveBam | 2/20 | 54 | conflict | 35 | 183 | 43% [36%–50%] | 57% [50%–64%] | 9/35 | 8/35 |  |
| AgaveBam | 0/20 | 6 | fee_vs_send | 7 | 44 | 41% [28%–56%] | 59% [44%–72%] | 2/7 | 1/7 | no detectable rule (noise) |
| AgaveBam | 0/20 | 6 | fee_with_send | 6 | 30 | 77% [59%–88%] | 77% [59%–88%] | 3/6 | 3/6 |  |
| AgaveBam | 0/20 | 6 | equal_fee | 3 | 12 | – | 83% [55%–95%] | 0/3 | 2/3 | insufficient data |
| AgaveBam | 0/20 | 6 | conflict | 7 | 9 | 56% [27%–81%] | 44% [19%–73%] | 5/7 | 2/7 |  |
| AgaveBam | 0/0 | 7 | fee_vs_send | 12 | 73 | 73% [61%–82%] | 27% [18%–39%] | 8/12 | 1/12 | no detectable rule (noise) |
| AgaveBam | 0/0 | 7 | fee_with_send | 7 | 54 | 94% [85%–98%] | 94% [85%–98%] | 4/7 | 4/7 |  |
| AgaveBam | 0/0 | 7 | equal_fee | 11 | 73 | – | 68% [57%–78%] | 0/11 | 0/11 | no detectable rule (noise) |
| AgaveBam | 0/0 | 7 | conflict | 4 | 28 | 57% [39%–73%] | 43% [27%–61%] | 2/4 | 0/4 |  |
| FireBAM | 2/20 | 2 | fee_vs_send | 1 | 6 | 33% [10%–70%] | 67% [30%–90%] | 0/1 | 0/1 | insufficient data |
| FireBAM | 2/20 | 2 | fee_with_send | 1 | 15 | 87% [62%–96%] | 87% [62%–96%] | 0/1 | 0/1 |  |
| FireBAM | 2/20 | 2 | conflict | 1 | 10 | 20% [6%–51%] | 80% [49%–94%] | 0/1 | 0/1 |  |
| Firedancer | 2/20 | 5 | fee_vs_send | 11 | 88 | 24% [16%–34%] | 76% [66%–84%] | 1/11 | 1/11 | arrival order (FIFO-like) |
| Firedancer | 2/20 | 5 | fee_with_send | 8 | 59 | 83% [72%–91%] | 83% [72%–91%] | 3/8 | 3/8 |  |
| Firedancer | 2/20 | 5 | equal_fee | 11 | 72 | – | 61% [50%–72%] | 0/11 | 2/11 | no detectable rule (noise) |
| Firedancer | 2/20 | 5 | conflict | 12 | 73 | 34% [24%–46%] | 66% [54%–76%] | 3/12 | 3/12 |  |
| Firedancer | 0/20 | 2 | fee_vs_send | 2 | 21 | 14% [5%–35%] | 86% [65%–95%] | 0/2 | 0/2 | insufficient data |
| Firedancer | 0/20 | 2 | fee_with_send | 3 | 10 | 60% [31%–83%] | 60% [31%–83%] | 1/3 | 1/3 |  |
| Firedancer | 0/20 | 2 | equal_fee | 2 | 7 | – | 86% [49%–97%] | 0/2 | 1/2 | insufficient data |
| Firedancer | 0/20 | 2 | conflict | 4 | 31 | 26% [14%–43%] | 74% [57%–86%] | 0/4 | 1/4 |  |
| Firedancer | 0/0 | 4 | fee_vs_send | 8 | 55 | 36% [25%–50%] | 64% [50%–75%] | 2/8 | 0/8 | no detectable rule (noise) |
| Firedancer | 0/0 | 4 | fee_with_send | 13 | 108 | 84% [76%–90%] | 84% [76%–90%] | 8/13 | 8/13 |  |
| Firedancer | 0/0 | 4 | equal_fee | 7 | 57 | – | 72% [59%–82%] | 0/7 | 1/7 | no detectable rule (noise) |
| Firedancer | 0/0 | 4 | conflict | 11 | 74 | 61% [49%–71%] | 39% [29%–51%] | 4/11 | 2/11 |  |
| HarmonicAgave | 2/20 | 23 | fee_vs_send | 25 | 188 | 33% [27%–40%] | 67% [60%–73%] | 2/25 | 5/25 | arrival order (FIFO-like) |
| HarmonicAgave | 2/20 | 23 | fee_with_send | 25 | 196 | 72% [66%–78%] | 72% [66%–78%] | 4/25 | 4/25 |  |
| HarmonicAgave | 2/20 | 23 | equal_fee | 24 | 195 | – | 78% [72%–84%] | 0/24 | 3/24 | arrival order (FIFO-like) |
| HarmonicAgave | 2/20 | 23 | conflict | 23 | 165 | 25% [19%–32%] | 75% [68%–81%] | 1/23 | 8/23 |  |
| HarmonicAgave | 0/20 | 3 | fee_vs_send | 3 | 22 | 50% [31%–69%] | 50% [31%–69%] | 0/3 | 1/3 | insufficient data |
| HarmonicAgave | 0/20 | 3 | fee_with_send | 5 | 14 | 79% [52%–92%] | 79% [52%–92%] | 3/5 | 3/5 |  |
| HarmonicAgave | 0/20 | 3 | equal_fee | 2 | 7 | – | 86% [49%–97%] | 0/2 | 1/2 | insufficient data |
| HarmonicAgave | 0/0 | 6 | fee_vs_send | 12 | 65 | 38% [28%–51%] | 62% [49%–72%] | 1/12 | 4/12 | no detectable rule (noise) |
| HarmonicAgave | 0/0 | 6 | fee_with_send | 12 | 61 | 70% [58%–80%] | 70% [58%–80%] | 4/12 | 4/12 |  |
| HarmonicAgave | 0/0 | 6 | equal_fee | 9 | 58 | – | 59% [46%–70%] | 0/9 | 1/9 | no detectable rule (noise) |
| HarmonicAgave | 0/0 | 6 | conflict | 9 | 56 | 71% [59%–82%] | 29% [18%–41%] | 3/9 | 1/9 |  |
| HarmonicFiredancer | 2/20 | 12 | fee_vs_send | 10 | 65 | 18% [11%–30%] | 82% [70%–89%] | 1/10 | 2/10 | arrival order (FIFO-like) |
| HarmonicFiredancer | 2/20 | 12 | fee_with_send | 9 | 57 | 65% [52%–76%] | 65% [52%–76%] | 3/9 | 3/9 |  |
| HarmonicFiredancer | 2/20 | 12 | equal_fee | 13 | 52 | – | 67% [54%–78%] | 0/13 | 3/13 | no detectable rule (noise) |
| HarmonicFiredancer | 2/20 | 12 | conflict | 13 | 84 | 43% [33%–54%] | 57% [46%–67%] | 3/13 | 2/13 |  |
| HarmonicFiredancer | 0/20 | 2 | fee_vs_send | 5 | 28 | 50% [33%–67%] | 50% [33%–67%] | 1/5 | 1/5 | no detectable rule (noise) |
| HarmonicFiredancer | 0/20 | 2 | fee_with_send | 2 | 7 | 43% [16%–75%] | 43% [16%–75%] | 1/2 | 1/2 |  |
| HarmonicFiredancer | 0/20 | 2 | equal_fee | 3 | 14 | – | 64% [39%–84%] | 0/3 | 1/3 | insufficient data |
| HarmonicFiredancer | 0/20 | 2 | conflict | 6 | 30 | 33% [19%–51%] | 67% [49%–81%] | 2/6 | 1/6 |  |
| HarmonicFiredancer | 0/0 | 2 | fee_vs_send | 12 | 93 | 49% [40%–59%] | 51% [41%–60%] | 2/12 | 3/12 | no detectable rule (noise) |
| HarmonicFiredancer | 0/0 | 2 | fee_with_send | 8 | 50 | 72% [58%–83%] | 72% [58%–83%] | 3/8 | 3/8 |  |
| HarmonicFiredancer | 0/0 | 2 | equal_fee | 9 | 45 | – | 53% [39%–67%] | 0/9 | 1/9 | no detectable rule (noise) |
| HarmonicFiredancer | 0/0 | 2 | conflict | 9 | 76 | 50% [39%–61%] | 50% [39%–61%] | 5/9 | 0/9 |  |
| JitoLabs | 2/20 | 27 | fee_vs_send | 29 | 247 | 31% [26%–37%] | 69% [63%–74%] | 3/29 | 8/29 | arrival order (FIFO-like) |
| JitoLabs | 2/20 | 27 | fee_with_send | 24 | 204 | 72% [66%–78%] | 72% [66%–78%] | 5/24 | 5/24 |  |
| JitoLabs | 2/20 | 27 | equal_fee | 21 | 134 | – | 72% [64%–79%] | 0/21 | 8/21 | arrival order (FIFO-like) |
| JitoLabs | 2/20 | 27 | conflict | 28 | 226 | 30% [24%–36%] | 70% [64%–76%] | 3/28 | 7/28 |  |
| JitoLabs | 0/20 | 6 | fee_vs_send | 11 | 39 | 23% [13%–38%] | 77% [62%–87%] | 2/11 | 5/11 | no detectable rule (noise) |
| JitoLabs | 0/20 | 6 | fee_with_send | 2 | 11 | 64% [35%–85%] | 64% [35%–85%] | 0/2 | 0/2 |  |
| JitoLabs | 0/20 | 6 | equal_fee | 6 | 12 | – | 67% [39%–86%] | 0/6 | 3/6 | no detectable rule (noise) |
| JitoLabs | 0/20 | 6 | conflict | 6 | 15 | 13% [4%–38%] | 87% [62%–96%] | 0/6 | 5/6 |  |
| JitoLabs | 0/0 | 6 | fee_vs_send | 6 | 48 | 46% [33%–60%] | 54% [40%–67%] | 1/6 | 1/6 | no detectable rule (noise) |
| JitoLabs | 0/0 | 6 | fee_with_send | 9 | 66 | 61% [49%–71%] | 61% [49%–71%] | 1/9 | 1/9 |  |
| JitoLabs | 0/0 | 6 | equal_fee | 10 | 52 | – | 40% [28%–54%] | 0/10 | 2/10 | no detectable rule (noise) |
| JitoLabs | 0/0 | 6 | conflict | 10 | 79 | 39% [29%–50%] | 61% [50%–71%] | 2/10 | 1/10 |  |
| Raiku | 2/20 | 1 | conflict | 1 | 10 | 20% [6%–51%] | 80% [49%–94%] | 0/1 | 0/1 |  |
| Rakurai | 2/20 | 2 | fee_with_send | 2 | 7 | 100% [65%–100%] | 100% [65%–100%] | 2/2 | 2/2 |  |
| Rakurai | 2/20 | 2 | equal_fee | 2 | 6 | – | 100% [61%–100%] | 0/2 | 2/2 | insufficient data |
| Rakurai | 2/20 | 2 | conflict | 1 | 10 | 40% [17%–69%] | 60% [31%–83%] | 0/1 | 0/1 |  |
| Unknown(10157) | 2/20 | 1 | fee_with_send | 1 | 10 | 90% [60%–98%] | 90% [60%–98%] | 0/1 | 0/1 |  |

## Whole blocks (supplementary: other people's txs)

For blocks of the target leader that contain our txs: share of adjacent tx pairs where priority (prioritization fee per requested CU) does not increase, and Spearman ρ between position and priority (−1 = sorted high→low; 0 = no relation).

| validator | client | LEAD_SLOTS/GAP_MS | blocks | adjacent non-increasing | mean ρ |
|---|---|---|---|---|---|
| `5Cchr1XG…` | AgaveBam | 2/20 | 16 | 52% | -0.16 |
| `5Us18hLZ…` | Agave | 2/20 | 9 | 51% | -0.03 |
| `7QQGNm3p…` | Agave | 2/20 | 14 | 51% | -0.05 |
| `9eGrDohd…` | Firedancer | 2/20 | 17 | 53% | 0.03 |
| `Awes4Tr6…` | HarmonicFiredancer | 2/20 | 14 | 50% | 0.08 |
| `CAo1dCGY…` | HarmonicAgave | 2/20 | 17 | 51% | 0.03 |
| `DRpbCBMx…` | AgaveBam | 2/20 | 13 | 52% | -0.12 |
| `E1r4Psq8…` | JitoLabs | 2/20 | 14 | 51% | -0.06 |
| `Fd7btgyS…` | HarmonicAgave | 2/20 | 14 | 51% | -0.00 |
| `HEL1USMZ…` | JitoLabs | 2/20 | 21 | 51% | 0.01 |
| `JD549Hsb…` | Firedancer | 2/20 | 18 | 52% | -0.01 |
| `JUPiTERr…` | HarmonicFiredancer | 2/20 | 15 | 51% | 0.08 |
| `5Cchr1XG…` | AgaveBam | 0/20 | 10 | 52% | -0.01 |
| `5Us18hLZ…` | Agave | 0/20 | 11 | 51% | -0.01 |
| `7QQGNm3p…` | Agave | 0/20 | 7 | 52% | -0.01 |
| `9eGrDohd…` | Firedancer | 0/20 | 3 | 54% | -0.02 |
| `Awes4Tr6…` | HarmonicFiredancer | 0/20 | 8 | 53% | -0.09 |
| `CAo1dCGY…` | HarmonicAgave | 0/20 | 3 | 52% | -0.13 |
| `DRpbCBMx…` | AgaveBam | 0/20 | 8 | 54% | -0.13 |
| `E1r4Psq8…` | JitoLabs | 0/20 | 7 | 52% | -0.07 |
| `Fd7btgyS…` | HarmonicAgave | 0/20 | 5 | 52% | -0.01 |
| `HEL1USMZ…` | JitoLabs | 0/20 | 11 | 50% | 0.01 |
| `JD549Hsb…` | Firedancer | 0/20 | 8 | 53% | 0.04 |
| `JUPiTERr…` | HarmonicFiredancer | 0/20 | 6 | 54% | -0.04 |
| `5Cchr1XG…` | AgaveBam | 0/0 | 14 | 53% | -0.05 |
| `5Us18hLZ…` | Agave | 0/0 | 20 | 51% | -0.01 |
| `7QQGNm3p…` | Agave | 0/0 | 17 | 50% | 0.00 |
| `9eGrDohd…` | Firedancer | 0/0 | 17 | 55% | -0.05 |
| `Awes4Tr6…` | HarmonicFiredancer | 0/0 | 16 | 53% | -0.06 |
| `CAo1dCGY…` | HarmonicAgave | 0/0 | 14 | 52% | -0.05 |
| `DRpbCBMx…` | AgaveBam | 0/0 | 14 | 52% | -0.09 |
| `E1r4Psq8…` | JitoLabs | 0/0 | 14 | 50% | -0.02 |
| `Fd7btgyS…` | HarmonicAgave | 0/0 | 18 | 52% | -0.06 |
| `HEL1USMZ…` | JitoLabs | 0/0 | 16 | 51% | -0.07 |
| `JD549Hsb…` | Firedancer | 0/0 | 19 | 52% | -0.01 |
| `JUPiTERr…` | HarmonicFiredancer | 0/0 | 20 | 53% | -0.06 |

## What went wrong (automatic part)

- Probes skipped because the trigger slot had already passed: 156.
- Send errors: 5× `{"code":429,"message":"Too many requests for a specific RPC call"}`; 5× `TypeError: fetch failed`; 319× `{"code":429,"message":"Connection rate limits exceeded"}`; 24× `TimeoutError: The operation was aborted due to timeout`.
- Missing or skipped blocks: 4.

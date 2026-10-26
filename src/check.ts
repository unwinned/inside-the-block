// Self-check of the analysis math: node src/check.ts
import assert from 'node:assert/strict';
import { binomP, pairs, verdict, wilson } from './analyze.ts';

// Ascending-fee send, block sorted by fee (high first): every pair is "fee first", none "sent first".
const burst = [1, 2, 3, 4].map(r => ({ sig: String(r), sendRank: r, cuPrice: r * 1000, index: 10 - r }));
const ps = pairs(burst);
assert.equal(ps.length, 6);
assert.ok(ps.every(p => p.fee === 1 && p.send === 0));
// Same burst in arrival order: the opposite.
assert.ok(pairs(burst.map(t => ({ ...t, index: t.sendRank }))).every(p => p.fee === 0 && p.send === 1));
// Equal fees give no fee evidence.
assert.ok(pairs(burst.map(t => ({ ...t, cuPrice: 5 }))).every(p => p.fee === null));

assert.ok(Math.abs(binomP(10, 10) - 2 / 1024) < 1e-12);
assert.equal(binomP(5, 10), 1);
const [lo, hi] = wilson(50, 100);
assert.ok(lo < 0.5 && hi > 0.5 && hi - lo < 0.2);

assert.equal(verdict(60, 60, 10, 10), 'fee priority, strict');
assert.equal(verdict(0, 60, 0, 10), 'arrival order (FIFO-like)');
assert.equal(verdict(30, 60, 5, 10), 'no detectable rule (noise)');
assert.equal(verdict(6, 6, 1, 1), 'insufficient data');
console.log('ok');

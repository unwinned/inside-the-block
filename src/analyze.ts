import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { path, readJson, readJsonl } from './config.ts';

type Tx = { sig: string; sendRank: number; cuPrice: number; index: number };

// Pairwise order evidence for our txs that landed in the same block.
// fee: 1 if the higher-fee tx came first, 0 if the lower-fee one did (ties skipped).
// send: 1 if the earlier-sent tx came first.
export function pairs(txs: Tx[]) {
  const out: { fee: number | null; send: number }[] = [];
  for (let i = 0; i < txs.length; i++) for (let j = i + 1; j < txs.length; j++) {
    const [a, b] = txs[i].index < txs[j].index ? [txs[i], txs[j]] : [txs[j], txs[i]];
    out.push({ fee: a.cuPrice === b.cuPrice ? null : +(a.cuPrice > b.cuPrice), send: +(a.sendRank < b.sendRank) });
  }
  return out;
}

const mean = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);

// Wilson 95% interval for k successes out of n.
export function wilson(k: number, n: number) {
  if (!n) return [NaN, NaN];
  const z = 1.96, p = k / n, d = 1 + z * z / n;
  const c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
  return [c - h, c + h];
}

// Exact two-sided binomial test against p = 0.5.
export function binomP(k: number, n: number) {
  if (!n) return NaN;
  const lf = (x: number) => { let s = 0; for (let i = 2; i <= x; i++) s += Math.log(i); return s; };
  const pmf = (i: number) => Math.exp(lf(n) - lf(i) - lf(n - i) - n * Math.LN2);
  const obs = pmf(k);
  let p = 0;
  for (let i = 0; i <= n; i++) if (pmf(i) <= obs * (1 + 1e-9)) p += pmf(i);
  return Math.min(1, p);
}

// Spearman correlation between position in block and priority (negative = higher priority earlier).
function spearman(xs: number[], ys: number[]) {
  const rank = (a: number[]) => {
    const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
    const r = new Array(a.length);
    for (let i = 0; i < idx.length;) {
      let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2;
      i = j + 1;
    }
    return r;
  };
  const rx = rank(xs), ry = rank(ys), mx = mean(rx), my = mean(ry);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < xs.length; i++) { num += (rx[i] - mx) * (ry[i] - my); dx += (rx[i] - mx) ** 2; dy += (ry[i] - my) ** 2; }
  return num / Math.sqrt(dx * dy);
}

export function verdict(feeK: number, feeN: number, burstK: number, burstN: number) {
  if (burstN < 4) return 'insufficient data';
  const r = feeK / feeN, p = binomP(burstK, burstN);
  if (p >= 0.05) return 'no detectable rule (noise)';
  if (r >= 0.9) return 'fee priority, strict';
  if (r >= 0.6) return 'fee priority, loose';
  if (r <= 0.4) return 'arrival order (FIFO-like)';
  return 'no detectable rule (noise)';
}

const pct = (x: number) => (Number.isFinite(x) ? (x * 100).toFixed(0) + '%' : '–');
const ci = (k: number, n: number) => { const [l, h] = wilson(k, n); return n ? `${pct(k / n)} [${pct(l)}–${pct(h)}]` : '–'; };

export function analyze() {
  const { targets, selectedAt } = readJson(path('targets.json'));
  const all = readJsonl(path('probes.jsonl'));
  const probes = all.filter(p => p.live && p.txs);
  const statuses = readJson(path('statuses.json'));
  const block = (s: number) => { const f = path('blocks', `${s}.json`); return existsSync(f) ? readJson(f) : null; };

  const rows: string[] = ['probe,at,identity,clientId,arm,path,sig,sendRank,cuPrice,landedSlot,slotOffset,inWindow,index,blockTxs,err'];
  const byV = new Map<string, any>();
  const agg = (key: string) => byV.get(key) ?? byV.set(key, { probes: 0, txs: 0, landed: 0, inWin: 0, split: 0, multi: 0, arms: {}, desc: [], rho: [] }).get(key);
  const errors = new Map<string, number>();

  for (const p of probes) {
    const v = agg(p.identity);
    v.probes++;
    const landed: (Tx & { slot: number })[] = [];
    const slotsHit = new Set<number>();
    for (const t of p.txs) {
      v.txs++;
      if (t.err) errors.set(t.err.slice(0, 120), (errors.get(t.err.slice(0, 120)) ?? 0) + 1);
      const st = statuses[t.sig];
      const off = st ? st.slot - p.windowStart : null;
      const inWin = off !== null && off >= 0 && off < p.windowLen;
      const b = st ? block(st.slot) : null;
      const index = b?.signatures ? b.signatures.indexOf(t.sig) : -1;
      if (st) v.landed++;
      if (inWin) { v.inWin++; slotsHit.add(st.slot); }
      if (inWin && index >= 0) landed.push({ ...t, index, slot: st.slot });
      rows.push([p.probe, p.at, p.identity, p.clientId, p.arm, p.path, t.sig, t.sendRank, t.cuPrice, st?.slot ?? '', off ?? '', inWin, index, b?.signatures?.length ?? '', JSON.stringify(t.err ?? '')].join(','));
    }
    if (slotsHit.size > 1) v.split++;
    const arm = v.arms[p.arm] ??= { feeK: 0, feeN: 0, sendK: 0, sendN: 0, bFee: 0, bSend: 0, bN: 0, perfFee: 0, perfSend: 0, bursts: 0 };
    for (const s of slotsHit) {
      const inBlock = landed.filter(t => t.slot === s);
      if (inBlock.length < 2) continue;
      v.multi++;
      const ps = pairs(inBlock);
      const f = ps.filter(x => x.fee !== null), fk = f.reduce((a, x) => a + x.fee!, 0), sk = ps.reduce((a, x) => a + x.send, 0);
      arm.feeK += fk; arm.feeN += f.length; arm.sendK += sk; arm.sendN += ps.length; arm.bursts++;
      // Burst-level unit (pairs inside one burst are not independent).
      const key = f.length ? fk / f.length : sk / ps.length, bfeeless = !f.length;
      if (key !== 0.5) { arm.bN++; if (key > 0.5) bfeeless ? arm.bSend++ : arm.bFee++; }
      if (f.length && fk === f.length) arm.perfFee++;
      if (sk === ps.length) arm.perfSend++;
      // Supplementary: is the whole block sorted by priority?
      const blk = block(s);
      if (blk?.txs && p.windowStart <= s && v.descSlots?.has(s) !== true) {
        (v.descSlots ??= new Set()).add(s);
        const others = blk.txs.filter((t: any) => t.ok);
        let d = 0, dn = 0;
        for (let i = 1; i < others.length; i++) {
          if (others[i].prioPerCu === others[i - 1].prioPerCu) continue;
          dn++; if (others[i].prioPerCu < others[i - 1].prioPerCu) d++;
        }
        if (dn) v.desc.push(d / dn);
        if (others.length > 2) v.rho.push(spearman(others.map((_: any, i: number) => i), others.map((t: any) => t.prioPerCu)));
      }
    }
  }
  writeFileSync(path('ours.csv'), rows.join('\n') + '\n');

  const T = new Map(targets.map((t: any) => [t.identity, t]));
  const ats = probes.map(p => p.at).sort();
  const md: string[] = [];
  md.push(`# Inside the Block — results`, '',
    `Targets selected ${selectedAt}. Live probes: ${probes.length}, from ${ats[0] ?? '–'} to ${ats.at(-1) ?? '–'} (UTC). All after Alpenglow activation (slot 459,653,000).`,
    `Per-tx raw data: \`data/ours.csv\`, \`data/probes.jsonl\`, \`data/statuses.json\`, \`data/blocks/\`. Every claim can be re-checked with \`getBlock\` on the listed slots.`, '');
  md.push('## Landing', '', '| validator | client | version | stake | probes | txs | landed | in target window | bursts split across blocks |', '|---|---|---|---|---|---|---|---|---|');
  for (const [id, v] of byV) {
    const t: any = T.get(id) ?? {};
    md.push(`| \`${id.slice(0, 8)}…\` | ${t.clientId} | ${t.version} | ${t.stakePct?.toFixed(2)}% | ${v.probes} | ${v.txs} | ${pct(v.landed / v.txs)} | ${pct(v.inWin / v.txs)} | ${pct(v.split / v.probes)} |`);
  }
  md.push('', '## Order of our own transactions inside one block', '',
    'Pairs = every pair of our txs from one burst that landed in the same block. "Fee first" = the higher-fee tx is earlier; "sent first" = the earlier-sent tx is earlier. 95% Wilson intervals. The verdict uses the `fee_vs_send` arm (the two rules predict opposite orders) with a burst-level binomial test, because pairs inside a burst are not independent.', '',
    '| validator | client | arm | bursts in one block | pairs | fee first | sent first | perfect fee order | perfect send order | verdict |', '|---|---|---|---|---|---|---|---|---|---|');
  for (const [id, v] of byV) for (const [arm, a] of Object.entries<any>(v.arms)) {
    const t: any = T.get(id) ?? {};
    const vd = arm === 'fee_vs_send' ? verdict(a.feeK, a.feeN, a.bFee, a.bN) : arm === 'equal_fee' ? (a.bN >= 4 && binomP(a.bSend, a.bN) < 0.05 ? (a.bSend / a.bN > 0.5 ? 'arrival order (FIFO-like)' : 'reverse arrival') : a.bN < 4 ? 'insufficient data' : 'no detectable rule (noise)') : '';
    md.push(`| \`${id.slice(0, 8)}…\` | ${t.clientId} | ${arm} | ${a.bursts} | ${a.sendN} | ${ci(a.feeK, a.feeN)} | ${ci(a.sendK, a.sendN)} | ${a.perfFee}/${a.bursts} | ${a.perfSend}/${a.bursts} | ${vd} |`);
  }
  md.push('', '## Whole blocks (supplementary: other people\'s txs)', '',
    'For blocks of the target leader that contain our txs: share of adjacent tx pairs where priority (prioritization fee per requested CU) does not increase, and Spearman ρ between position and priority (−1 = sorted high→low; 0 = no relation).', '',
    '| validator | client | blocks | adjacent non-increasing | mean ρ |', '|---|---|---|---|---|');
  for (const [id, v] of byV) { const t: any = T.get(id) ?? {}; md.push(`| \`${id.slice(0, 8)}…\` | ${t.clientId} | ${v.desc.length} | ${pct(mean(v.desc))} | ${mean(v.rho).toFixed(2)} |`); }
  const skipped = all.filter(p => p.skipped).length;
  md.push('', '## What went wrong (automatic part)', '',
    `- Probes skipped because the trigger slot had already passed: ${skipped}.`,
    `- Send errors: ${errors.size ? [...errors].map(([e, n]) => `${n}× \`${e}\``).join('; ') : 'none'}.`,
    `- Missing or skipped blocks: ${readdirSync(path('blocks')).filter(f => /^\d+\.json$/.test(f) && readJson(path('blocks', f)).skipped).length}.`, '');
  writeFileSync(path('report.md'), md.join('\n'));
  console.log(md.join('\n'));
}

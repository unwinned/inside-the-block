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

type Arm = { feeK: number; feeN: number; sendK: number; sendN: number; bFee: number; bSend: number; bN: number; perfFee: number; perfSend: number; bursts: number };
const newArm = (): Arm => ({ feeK: 0, feeN: 0, sendK: 0, sendN: 0, bFee: 0, bSend: 0, bN: 0, perfFee: 0, perfSend: 0, bursts: 0 });

function addBurst(arm: Arm, inBlock: Tx[]) {
  const ps = pairs(inBlock);
  const f = ps.filter(x => x.fee !== null), fk = f.reduce((a, x) => a + x.fee!, 0), sk = ps.reduce((a, x) => a + x.send, 0);
  arm.feeK += fk; arm.feeN += f.length; arm.sendK += sk; arm.sendN += ps.length; arm.bursts++;
  // Burst-level unit (pairs inside one burst are not independent).
  const key = f.length ? fk / f.length : sk / ps.length, bfeeless = !f.length;
  if (key !== 0.5) { arm.bN++; if (key > 0.5) bfeeless ? arm.bSend++ : arm.bFee++; }
  if (f.length && fk === f.length) arm.perfFee++;
  if (sk === ps.length) arm.perfSend++;
}

const armVerdict = (arm: string, a: Arm) => arm === 'fee_vs_send' ? verdict(a.feeK, a.feeN, a.bFee, a.bN)
  : arm === 'equal_fee' ? (a.bN < 4 ? 'insufficient data' : binomP(a.bSend, a.bN) < 0.05 ? (a.bSend / a.bN > 0.5 ? 'arrival order (FIFO-like)' : 'reverse arrival') : 'no detectable rule (noise)')
  : '';

const pct = (x: number) => (Number.isFinite(x) ? (x * 100).toFixed(0) + '%' : '–');
const ci = (k: number, n: number) => { const [l, h] = wilson(k, n); return n ? `${pct(k / n)} [${pct(l)}–${pct(h)}]` : '–'; };

export function analyze() {
  const { targets, selectedAt } = readJson(path('targets.json'));
  const all = readJsonl(path('probes.jsonl'));
  const probes = all.filter(p => p.live && p.txs);
  const statuses = readJson(path('statuses.json'));
  const cache = new Map<number, any>();
  const block = (s: number) => {
    if (!cache.has(s)) { const f = path('blocks', `${s}.json`); cache.set(s, existsSync(f) ? readJson(f) : null); }
    return cache.get(s);
  };
  const leaders: Record<string, string> = existsSync(path('leaders.json')) ? readJson(path('leaders.json')) : {};
  const nodes = existsSync(path('nodes.json')) ? readJson(path('nodes.json')) : { nodes: {} };
  const clientOf = (s: number) => nodes.nodes[leaders[s]]?.clientId ?? 'unknown';
  const byClient = new Map<string, { client: string; lead: number; leaders: Set<string>; arms: Record<string, Arm> }>();
  const offsets = new Map<string, number>();
  const bucket = (off: number | null, len: number) => off === null ? 'not landed' : off < 0 ? `${off} (before the window)`
    : off < len ? `${off} (target window)` : off < 12 ? '4-11 (after the window)' : '12 or more';

  const rows: string[] = ['probe,at,identity,clientId,arm,path,leadSlots,sig,sendRank,cuPrice,landedSlot,slotOffset,inWindow,index,blockTxs,blockLeader,blockLeaderClient,err'];
  const byV = new Map<string, any>();
  const agg = (id: string, lead: number) => byV.get(`${lead} ${id}`) ?? byV.set(`${lead} ${id}`, { id, lead, probes: 0, txs: 0, landed: 0, inWin: 0, split: 0, multi: 0, arms: {}, desc: [], rho: [] }).get(`${lead} ${id}`);
  const errors = new Map<string, number>();

  for (const p of probes) {
    const lead = p.windowStart - p.trigger;
    const v = agg(p.identity, lead);
    v.probes++;
    const landed: (Tx & { slot: number })[] = [];
    const anywhere: (Tx & { slot: number })[] = [];
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
      if (index >= 0) anywhere.push({ ...t, index, slot: st.slot });
      const bk = bucket(off, p.windowLen);
      offsets.set(`${lead}\t${bk}`, (offsets.get(`${lead}\t${bk}`) ?? 0) + 1);
      rows.push([p.probe, p.at, p.identity, p.clientId, p.arm, p.path, lead, t.sig, t.sendRank, t.cuPrice, st?.slot ?? '', off ?? '', inWin, index, b?.signatures?.length ?? '',
        st ? leaders[st.slot] ?? '' : '', st ? clientOf(st.slot) : '', JSON.stringify(t.err ?? '')].join(','));
    }
    if (slotsHit.size > 1) v.split++;
    for (const s of new Set(anywhere.map(t => t.slot))) {
      const inBlock = anywhere.filter(t => t.slot === s);
      if (inBlock.length < 2) continue;
      const ck = `${clientOf(s)} ${lead}`;
      const c = byClient.get(ck) ?? byClient.set(ck, { client: clientOf(s), lead, leaders: new Set(), arms: {} }).get(ck)!;
      c.leaders.add(leaders[s]);
      addBurst(c.arms[p.arm] ??= newArm(), inBlock);
    }
    const arm = v.arms[p.arm] ??= newArm();
    for (const s of slotsHit) {
      const inBlock = landed.filter(t => t.slot === s);
      if (inBlock.length < 2) continue;
      v.multi++;
      addBurst(arm, inBlock);
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
  const order = (k: string) => { const [lead, b] = k.split('\t'); return +lead * 1e10 + (b === 'not landed' ? 1e9 : parseInt(b)); };
  const leadTotal = (lead: string) => [...offsets].filter(([k]) => k.startsWith(lead + '\t')).reduce((a, [, n]) => a + n, 0);
  const vs = [...byV.values()].sort((a, b) => a.lead - b.lead || a.id.localeCompare(b.id));
  md.push('## Where our transactions landed', '', 'Slot of each tx relative to the first slot of the target window. `LEAD_SLOTS` = how many slots before the window the burst fired.', '',
    '| LEAD_SLOTS | slot offset | txs | share |', '|---|---|---|---|',
    ...[...offsets].sort((a, b) => order(a[0]) - order(b[0])).map(([k, n]) => { const [lead, b] = k.split('\t'); return `| ${lead} | ${b} | ${n} | ${pct(n / leadTotal(lead))} |`; }), '');
  md.push('## Landing', '', '| validator | client | version | stake | LEAD_SLOTS | probes | txs | landed | in target window | bursts split across blocks |', '|---|---|---|---|---|---|---|---|---|---|');
  for (const v of vs) {
    const t: any = T.get(v.id) ?? {};
    md.push(`| \`${v.id.slice(0, 8)}…\` | ${t.clientId} | ${t.version} | ${t.stakePct?.toFixed(2)}% | ${v.lead} | ${v.probes} | ${v.txs} | ${pct(v.landed / v.txs)} | ${pct(v.inWin / v.txs)} | ${pct(v.split / v.probes)} |`);
  }
  md.push('', '## Order of our own transactions inside one block', '',
    'Pairs = every pair of our txs from one burst that landed in the same block. "Fee first" = the higher-fee tx is earlier; "sent first" = the earlier-sent tx is earlier. 95% Wilson intervals. The verdict uses the `fee_vs_send` arm (the two rules predict opposite orders) with a burst-level binomial test, because pairs inside a burst are not independent.', '',
    '| validator | client | LEAD_SLOTS | arm | bursts in one block | pairs | fee first | sent first | perfect fee order | perfect send order | verdict |', '|---|---|---|---|---|---|---|---|---|---|---|');
  for (const v of vs) for (const [arm, a] of Object.entries<Arm>(v.arms)) {
    const t: any = T.get(v.id) ?? {};
    md.push(`| \`${v.id.slice(0, 8)}…\` | ${t.clientId} | ${v.lead} | ${arm} | ${a.bursts} | ${a.sendN} | ${ci(a.feeK, a.feeN)} | ${ci(a.sendK, a.sendN)} | ${a.perfFee}/${a.bursts} | ${a.perfSend}/${a.bursts} | ${armVerdict(arm, a)} |`);
  }
  md.push('', '## Order of our own transactions, by the client of the leader that built the block', '',
    `Same as above, but every block that holds at least two txs of one burst counts, whichever leader built it. The leader comes from \`getSlotLeaders\`, its client from gossip at collection time (${nodes.at ?? '–'}).`, '',
    '| client | LEAD_SLOTS | leaders | arm | bursts in one block | pairs | fee first | sent first | perfect fee order | perfect send order | verdict |', '|---|---|---|---|---|---|---|---|---|---|---|');
  for (const c of [...byClient.values()].sort((a, b) => a.client.localeCompare(b.client) || a.lead - b.lead))
    for (const arm of ['fee_vs_send', 'fee_with_send', 'equal_fee', 'conflict']) {
      const a = c.arms[arm];
      if (a) md.push(`| ${c.client} | ${c.lead} | ${c.leaders.size} | ${arm} | ${a.bursts} | ${a.sendN} | ${ci(a.feeK, a.feeN)} | ${ci(a.sendK, a.sendN)} | ${a.perfFee}/${a.bursts} | ${a.perfSend}/${a.bursts} | ${armVerdict(arm, a)} |`);
    }
  md.push('', '## Whole blocks (supplementary: other people\'s txs)', '',
    'For blocks of the target leader that contain our txs: share of adjacent tx pairs where priority (prioritization fee per requested CU) does not increase, and Spearman ρ between position and priority (−1 = sorted high→low; 0 = no relation).', '',
    '| validator | client | LEAD_SLOTS | blocks | adjacent non-increasing | mean ρ |', '|---|---|---|---|---|---|');
  for (const v of vs) { const t: any = T.get(v.id) ?? {}; md.push(`| \`${v.id.slice(0, 8)}…\` | ${t.clientId} | ${v.lead} | ${v.desc.length} | ${pct(mean(v.desc))} | ${mean(v.rho).toFixed(2)} |`); }
  const skipped = all.filter(p => p.skipped).length;
  md.push('', '## What went wrong (automatic part)', '',
    `- Probes skipped because the trigger slot had already passed: ${skipped}.`,
    `- Send errors: ${errors.size ? [...errors].map(([e, n]) => `${n}× \`${e}\``).join('; ') : 'none'}.`,
    `- Missing or skipped blocks: ${readdirSync(path('blocks')).filter(f => /^\d+\.json$/.test(f) && readJson(path('blocks', f)).skipped).length}.`, '');
  writeFileSync(path('report.md'), md.join('\n'));
  console.log(md.join('\n'));
}

import { existsSync, writeFileSync } from 'node:fs';
import { address, getBase58Encoder, type Signature } from '@solana/kit';
import { BASE_FEE, collectRpc as rpc, path, readJson, readJsonl, retry, toJson } from './config.ts';

const COMPUTE_BUDGET = 'ComputeBudget111111111111111111111111111111';
const b58 = getBase58Encoder();

// Compute-budget fields of one tx from a `json`-encoded block.
function budgetOf(tx: any) {
  const keys = tx.transaction.message.accountKeys;
  let cuPrice = 0, cuLimit: number | null = null;
  for (const ix of tx.transaction.message.instructions) {
    if (keys[ix.programIdIndex] !== COMPUTE_BUDGET) continue;
    const d = b58.encode(ix.data);
    const v = new DataView(d.buffer, d.byteOffset, d.byteLength);
    if (d[0] === 3) cuPrice = Number(v.getBigUint64(1, true));
    if (d[0] === 2) cuLimit = v.getUint32(1, true);
  }
  const tc = tx.transaction.message.transactionConfig;
  if (tc?.computeUnitLimit) { cuLimit = tc.computeUnitLimit; cuPrice = Math.floor(Number(tc.priorityFee ?? 0) * 1e6 / tc.computeUnitLimit); }
  const fee = Number(tx.meta.fee), nSig = tx.transaction.signatures.length;
  return {
    sig: tx.transaction.signatures[0], cuPrice, cuLimit, fee, nSig,
    cu: Number(tx.meta.computeUnitsConsumed ?? 0), ok: tx.meta.err === null,
    prioPerCu: (fee - BASE_FEE * nSig) / (cuLimit ?? Math.max(1, Number(tx.meta.computeUnitsConsumed ?? 1))),
  };
}

const pool = async <T>(items: T[], n: number, f: (x: T) => Promise<unknown>) => {
  const queue = [...items];
  await Promise.all(Array.from({ length: n }, async () => {
    while (queue.length) { const x = queue.shift()!; await f(x).catch(e => console.error('\n', x, e?.message ?? e)); }
  }));
};

// For every live probe: the leaders and the skipped slots around the target window, and every block that contains our
// txs, with the compute-budget fields of each of its txs (supplementary evidence).
export async function collect() {
  const probes = readJsonl(path('probes.jsonl')).filter(p => p.live && p.txs);
  const ours = new Map<string, any>();
  for (const p of probes) for (const t of p.txs) ours.set(t.sig, p);

  // Where each of our txs landed, if at all.
  const statuses: Record<string, any> = Object.fromEntries([...ours.keys()].map(s => [s, null]));
  for (const payer of new Set(probes.flatMap(p => p.txs.map((t: any) => t.payer as string)))) {
    let before: Signature | undefined;
    for (;;) {
      const page = await retry(() => rpc.getSignaturesForAddress(address(payer), { limit: 1000, before }).send());
      for (const s of page) if (s.signature in statuses) statuses[s.signature] = { slot: Number(s.slot), err: s.err };
      if (page.length < 1000) break;
      before = page.at(-1)!.signature;
    }
  }
  writeFileSync(path('statuses.json'), toJson(statuses));

  const landedSlots = [...new Set(Object.values(statuses).filter(Boolean).map((s: any) => s.slot as number))];
  let done = 0;
  await pool(probes, 4, async p => {
    const from = BigInt(p.windowStart) - 1n, len = p.windowLen + 4;
    const lf = path('blocks', `leaders-${p.windowStart}.json`);
    if (!existsSync(lf)) writeFileSync(lf, toJson(await retry(() => rpc.getSlotLeaders(from, len).send())));
    const produced = new Set((await retry(() => rpc.getBlocks(from, from + BigInt(len - 1)).send())).map(Number));
    for (let s = from; s < from + BigInt(len); s++) {
      const f = path('blocks', `${s}.json`);
      if (!existsSync(f) && !produced.has(Number(s))) writeFileSync(f, toJson({ slot: s, skipped: true }));
    }
    process.stdout.write(`\rcollect windows ${++done}/${probes.length}   `);
  });

  done = 0;
  const missing = landedSlots.filter(s => !existsSync(path('blocks', `${s}.json`)));
  await pool(missing, 2, async s => {
    const block: any = await retry(() => rpc.getBlock(BigInt(s), { encoding: 'json', transactionDetails: 'full', maxSupportedTransactionVersion: 1, rewards: false } as any).send());
    const txs = block.transactions.map(budgetOf);
    writeFileSync(path('blocks', `${s}.json`), toJson({ slot: s, blockTime: block.blockTime, parentSlot: block.parentSlot, signatures: txs.map((t: any) => t.sig), txs }));
    process.stdout.write(`\rcollect blocks ${++done}/${missing.length}   `);
  });

  const lp = path('leaders.json'), leaders: Record<string, string> = existsSync(lp) ? readJson(lp) : {};
  await pool(landedSlots.filter(s => !leaders[s]), 4, async s => {
    leaders[s] = (await retry(() => rpc.getSlotLeaders(BigInt(s), 1).send()))[0];
  });
  writeFileSync(lp, toJson(leaders));
  const seen = new Set(Object.values(leaders));
  const nodes = (await retry(() => rpc.getClusterNodes().send())).filter(n => seen.has(n.pubkey));
  writeFileSync(path('nodes.json'), toJson({ at: new Date().toISOString(),
    nodes: Object.fromEntries(nodes.map((n: any) => [n.pubkey, { clientId: n.clientId ?? 'unknown', version: n.version }])) }));
  console.log('\ncollect done');
}

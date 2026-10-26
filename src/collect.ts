import { existsSync, writeFileSync } from 'node:fs';
import { getBase58Encoder, type Signature } from '@solana/kit';
import { BASE_FEE, collectRpc as rpc, path, readJson, readJsonl, retry, sleep, toJson } from './config.ts';

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
  const fee = Number(tx.meta.fee), nSig = tx.transaction.signatures.length;
  return {
    sig: tx.transaction.signatures[0], cuPrice, cuLimit, fee, nSig,
    cu: Number(tx.meta.computeUnitsConsumed ?? 0), ok: tx.meta.err === null,
    prioPerCu: (fee - BASE_FEE * nSig) / (cuLimit ?? Math.max(1, Number(tx.meta.computeUnitsConsumed ?? 1))),
  };
}

// For every live probe: the ordered signature list of each block around the target window, the leader of each slot,
// and, for blocks that contain our txs, the compute-budget fields of every tx in the block (supplementary evidence).
export async function collect() {
  const probes = readJsonl(path('probes.jsonl')).filter(p => p.live && p.txs);
  const ours = new Map<string, any>();
  for (const p of probes) for (const t of p.txs) ours.set(t.sig, p);

  // Where each of our txs landed, if at all.
  const sigs = [...ours.keys()];
  const statuses: Record<string, any> = {};
  for (let i = 0; i < sigs.length; i += 256) {
    const chunk = sigs.slice(i, i + 256) as Signature[];
    const { value } = await retry(() => rpc.getSignatureStatuses(chunk, { searchTransactionHistory: true }).send());
    value.forEach((s, j) => { statuses[chunk[j]] = s ? { slot: Number(s.slot), err: s.err } : null; });
  }
  writeFileSync(path('statuses.json'), toJson(statuses));

  const landedSlots = new Set(Object.values(statuses).filter(Boolean).map((s: any) => s.slot));
  for (const [i, p] of probes.entries()) {
    const from = BigInt(p.windowStart) - 1n, len = p.windowLen + 4;
    const lf = path('blocks', `leaders-${p.windowStart}.json`);
    if (!existsSync(lf)) writeFileSync(lf, toJson(await retry(() => rpc.getSlotLeaders(from, len).send())));
    for (let s = from; s < from + BigInt(len); s++) {
      const f = path('blocks', `${s}.json`);
      if (existsSync(f)) continue;
      const full = landedSlots.has(Number(s));
      let block: any;
      try {
        block = await retry(() => rpc.getBlock(s, full
          ? { encoding: 'json', transactionDetails: 'full', maxSupportedTransactionVersion: 0, rewards: false }
          : { transactionDetails: 'signatures', maxSupportedTransactionVersion: 0, rewards: false } as any).send(), 3);
      } catch (e) { block = null; }
      if (!block) { writeFileSync(f, toJson({ slot: s, skipped: true })); continue; }
      const txs = full ? block.transactions.map(budgetOf) : null;
      writeFileSync(f, toJson({
        slot: s, blockTime: block.blockTime, parentSlot: block.parentSlot,
        signatures: full ? txs.map((t: any) => t.sig) : block.signatures, txs,
      }));
      await sleep(120);
    }
    process.stdout.write(`\rcollect ${i + 1}/${probes.length}   `);
  }
  console.log('\ncollect done');
}

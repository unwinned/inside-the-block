import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  address, appendTransactionMessageInstructions, createKeyPairSignerFromBytes,
  createKeyPairSignerFromPrivateKeyBytes, createSolanaRpcSubscriptions, createTransactionMessage,
  getAddressEncoder, getBase58Encoder, getBase64EncodedWireTransaction, getSignatureFromTransaction, lamports, pipe,
  setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners, type KeyPairSigner,
} from '@solana/kit';
import { getSetComputeUnitLimitInstruction, getSetComputeUnitPriceInstruction } from '@solana-program/compute-budget';
import { getAddMemoInstruction } from '@solana-program/memo';
import { getTransferSolInstruction } from '@solana-program/system';
import { BASE_FEE, LAMPORTS_PER_SOL, cfg, path, readJson, readJsonl, retry, rpc, sleep, toJson } from './config.ts';

// Arms. Within a burst every tx has its own fee payer, so the txs do not share any write lock,
// except in `conflict`, where each tx also write-locks one shared account.
//   fee_vs_send   – sent in ascending fee order: "by fee" and "by arrival" predict opposite block orders
//   fee_with_send – sent in descending fee order: both rules predict the same order (control)
//   equal_fee     – identical fees: isolates arrival order from fee
//   conflict      – fee_vs_send, but all txs contend for the same writable account
export const ARMS = ['fee_vs_send', 'fee_with_send', 'equal_fee', 'conflict'] as const;

// Compute-unit prices (micro-lamports) spread geometrically 1k..300k.
export const feeLevels = (n: number) => Array.from({ length: n }, (_, i) => Math.round(1000 * 300 ** (i / Math.max(1, n - 1))));

export function pricesFor(arm: string, n: number) {
  const lv = feeLevels(n);
  if (arm === 'fee_with_send') return [...lv].reverse();
  if (arm === 'equal_fee') return lv.map(() => lv[n >> 1]);
  return lv; // fee_vs_send, conflict
}

const txFee = (cuPrice: number, cuLimit: number) => BASE_FEE + Math.ceil(cuPrice * cuLimit / 1e6);
const maxFeePerTx = () => txFee(feeLevels(cfg.burst).at(-1)!, cfg.cuLimit);

async function leaderWindows(identity: string, epochStart: bigint) {
  const s = await retry(() => rpc.getLeaderSchedule(null, { identity: address(identity) }).send());
  const idx = ((s as any)?.[identity] ?? []).map(Number).sort((a: number, b: number) => a - b);
  const out: { start: bigint; len: number }[] = [];
  for (let i = 0; i < idx.length; i++) {
    if (i > 0 && idx[i] === idx[i - 1] + 1) out.at(-1)!.len++;
    else out.push({ start: epochStart + BigInt(idx[i]), len: 1 });
  }
  return out;
}

// Throwaway fee payers live next to the main key, never in data/.
async function loadPayers(n: number) {
  const f = dirname(cfg.keypair) + '/payers.json';
  mkdirSync(dirname(f), { recursive: true });
  const seeds: string[] = existsSync(f) ? readJson(f) : [];
  while (seeds.length < n) seeds.push(randomBytes(32).toString('hex'));
  writeFileSync(f, JSON.stringify(seeds), { mode: 0o600 });
  return Promise.all(seeds.slice(0, n).map(h => createKeyPairSignerFromPrivateKeyBytes(Buffer.from(h, 'hex'))));
}

// Accepts a solana-keygen JSON array or a base58 secret key (Phantom export).
async function loadMain() {
  const raw = readFileSync(cfg.keypair, 'utf8').trim();
  return createKeyPairSignerFromBytes(raw.startsWith('[') ? new Uint8Array(JSON.parse(raw)) : getBase58Encoder().encode(raw));
}

export async function keygen() {
  if (existsSync(cfg.keypair)) return console.log('exists:', (await loadMain()).address);
  const seed = randomBytes(32);
  const s = await createKeyPairSignerFromPrivateKeyBytes(seed);
  mkdirSync(dirname(cfg.keypair), { recursive: true });
  writeFileSync(cfg.keypair, JSON.stringify([...seed, ...getAddressEncoder().encode(s.address)]), { mode: 0o600 });
  console.log('new wallet:', s.address, '- send it up to SPEND_CAP_SOL + 0.002 SOL');
}

async function sendAndConfirm(instructions: any[], feePayer: KeyPairSigner) {
  const { value: bh } = await retry(() => rpc.getLatestBlockhash({ commitment: 'confirmed' }).send());
  const tx = await signTransactionMessageWithSigners(pipe(
    createTransactionMessage({ version: 0 }),
    m => setTransactionMessageFeePayerSigner(feePayer, m),
    m => setTransactionMessageLifetimeUsingBlockhash(bh, m),
    m => appendTransactionMessageInstructions(instructions, m),
  ));
  const sig = getSignatureFromTransaction(tx);
  await rpc.sendTransaction(getBase64EncodedWireTransaction(tx), { encoding: 'base64' }).send();
  for (let i = 0; i < 60; i++) {
    const { value: [st] } = await rpc.getSignatureStatuses([sig]).send();
    if (st?.err) throw new Error(`${sig} failed: ${toJson(st.err)}`);
    if (st?.confirmationStatus === 'confirmed' || st?.confirmationStatus === 'finalized') return sig;
    await sleep(1000);
  }
  throw new Error(`${sig} not confirmed`);
}

// Raw JSON-RPC send so the request is exactly what we log: no preflight, no RPC-side retries.
async function rawSend(url: string, wire: string) {
  const t0 = performance.timeOrigin + performance.now();
  try {
    const r = await fetch(url, {
      method: 'POST', headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(5000),
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'sendTransaction', params: [wire, { encoding: 'base64', skipPreflight: true, maxRetries: 0 }] }),
    });
    const j: any = await r.json();
    return { t0, t1: performance.timeOrigin + performance.now(), err: j.error ? toJson(j.error) : null };
  } catch (e) {
    return { t0, t1: performance.timeOrigin + performance.now(), err: String(e) };
  }
}

export async function run(live: boolean) {
  const { targets } = readJson(path('targets.json'));
  const log = path('probes.jsonl');
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const n = cfg.burst;
  const epoch = await retry(() => rpc.getEpochInfo().send());
  if (epoch.absoluteSlot < cfg.alpenglowSlot) throw new Error('before Alpenglow activation, refusing to mix');
  const epochStart = epoch.absoluteSlot - epoch.slotIndex;
  const epochEnd = epochStart + epoch.slotsInEpoch;

  // Plan: walk all upcoming leader windows of the targets in time order, take each target's next window
  // until it has its quota, keeping >= 12 slots between probes so bursts never overlap.
  const all: { t: any; start: bigint; len: number }[] = [];
  for (const t of targets) for (const w of await leaderWindows(t.identity, epochStart)) all.push({ t, ...w });
  all.sort((a, b) => Number(a.start - b.start));
  const quota = new Map(targets.map((t: any) => [t.identity, 0]));
  const plan: typeof all = [];
  let next = epoch.absoluteSlot + BigInt(cfg.leadSlots + 20);
  for (const w of all) {
    if (w.start < next || w.start + BigInt(w.len) > epochEnd) continue;
    if (quota.get(w.t.identity)! >= cfg.probesPerValidator) continue;
    quota.set(w.t.identity, quota.get(w.t.identity)! + 1);
    plan.push(w);
    next = w.start + BigInt(w.len) + 12n;
  }
  const lastSlot = plan.at(-1)?.start ?? epoch.absoluteSlot;
  console.log(`run ${runId}: ${live ? 'LIVE' : 'dry-run'}, ${plan.length} probes, ~${Math.round(Number(lastSlot - epoch.absoluteSlot) * 0.22 / 60)} min`);

  const payers = await loadPayers(n);
  const main = live ? await loadMain() : null;
  const lock = main?.address ?? payers[0].address; // shared writable account for the conflict arm

  // Budget, counted across all runs in data/probes.jsonl. Payers are funded with exactly rent + this run's
  // worst-case fees and only payers sign probe txs, so funding is a hard ceiling; the per-probe check is a second one.
  const prior = existsSync(log) ? readJsonl(log).filter(p => p.live && p.txs)
    .reduce((s, p) => s + p.txs.reduce((a: number, t: any) => a + txFee(t.cuPrice, p.cuLimit), 0), 0) : 0;
  const rent = Number(await retry(() => rpc.getMinimumBalanceForRentExemption(0n).send()));
  const perPayer = rent + plan.length * maxFeePerTx();
  const ceiling = prior + n * perPayer + BASE_FEE;
  const capLamports = Math.floor(cfg.spendCapSol * LAMPORTS_PER_SOL);
  console.log(`budget: earlier runs ${(prior / LAMPORTS_PER_SOL).toFixed(5)} + this run up to ${((ceiling - prior) / LAMPORTS_PER_SOL).toFixed(5)} SOL (cap ${cfg.spendCapSol}; rent ${(n * rent / LAMPORTS_PER_SOL).toFixed(5)} comes back on sweep)`);
  if (ceiling > capLamports) throw new Error('planned spend exceeds SPEND_CAP_SOL; lower PROBES_PER_VALIDATOR or BURST');
  if (live) {
    const top: any[] = [];
    for (const p of payers) {
      const { value: bal } = await rpc.getBalance(p.address).send();
      if (Number(bal) < perPayer) top.push(getTransferSolInstruction({ source: main!, destination: p.address, amount: lamports(BigInt(perPayer - Number(bal))) }));
    }
    if (top.length) console.log('funded payers:', await sendAndConfirm(top, main!));
  }

  // Slot clock: getSlot every 300 ms, since the public websocket feed falls behind; the websocket only helps when ahead.
  let slot = epoch.absoluteSlot;
  const ac = new AbortController();
  let pollAt = 0;
  try {
    const subs = createSolanaRpcSubscriptions(cfg.wsUrl);
    const it = await subs.slotNotifications().subscribe({ abortSignal: ac.signal });
    (async () => { try { for await (const s of it) { if (s.slot > slot) slot = s.slot; } } catch {} })();
  } catch {}
  (async () => { while (!ac.signal.aborted) { try { const s = await rpc.getSlot({ commitment: 'processed' }).send(); pollAt = Date.now(); if (s > slot) slot = s; } catch {} await sleep(300); } })();
  let bh = (await retry(() => rpc.getLatestBlockhash({ commitment: 'confirmed' }).send())).value;
  const bhTimer = setInterval(async () => { try { bh = (await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()).value; } catch {} }, 3000);

  let spent = 0;
  for (const [k, w] of plan.entries()) {
    const arm = ARMS[k % ARMS.length];
    const url = cfg.sendUrls[k % cfg.sendUrls.length];
    const trigger = w.start - BigInt(cfg.leadSlots);
    while (slot < trigger - 2n) await sleep(20);
    if (slot > trigger) { appendFileSync(log, toJson({ runId, probe: k, skipped: 'late', slot, windowStart: w.start, pollAgeMs: Date.now() - pollAt }) + '\n'); continue; }
    const prices = pricesFor(arm, n);
    const cost = prices.reduce((a, c) => a + txFee(c, cfg.cuLimit), 0);
    if (prior + spent + cost > capLamports - n * rent) { console.log('spend cap reached, stopping'); break; }

    const txs = await Promise.all(payers.map(async (p, rank) => {
      const ix: any[] = [
        getSetComputeUnitLimitInstruction({ units: cfg.cuLimit }),
        getSetComputeUnitPriceInstruction({ microLamports: BigInt(prices[rank]) }),
        getAddMemoInstruction({ memo: `itb|${runId.slice(0, 19)}|${String(k).padStart(4, '0')}|${rank}` }),
      ];
      if (arm === 'conflict') ix.push(getTransferSolInstruction({ source: p, destination: lock, amount: lamports(0n) }));
      const tx = await signTransactionMessageWithSigners(pipe(
        createTransactionMessage({ version: 0 }),
        m => setTransactionMessageFeePayerSigner(p, m),
        m => setTransactionMessageLifetimeUsingBlockhash(bh, m),
        m => appendTransactionMessageInstructions(ix, m),
      ));
      return { sig: getSignatureFromTransaction(tx), wire: getBase64EncodedWireTransaction(tx), payer: p.address, rank, cuPrice: prices[rank] };
    }));
    while (slot < trigger) await sleep(2);
    const slotAtSend = slot;
    const t0 = performance.now();
    const sends = txs.map(async (tx, i) => {
      await sleep(Math.max(0, i * cfg.gapMs - (performance.now() - t0)));
      return live ? rawSend(url, tx.wire) : { t0: performance.timeOrigin + performance.now(), t1: null, err: null };
    });
    const res = await Promise.all(sends);
    if (live) spent += cost;
    appendFileSync(log, toJson({
      runId, probe: k, live, arm, path: new URL(url).host, at: new Date().toISOString(),
      identity: w.t.identity, clientId: w.t.clientId, version: w.t.version,
      windowStart: w.start, windowLen: w.len, trigger, slotAtSend, pollAgeMs: Date.now() - pollAt, gapMs: cfg.gapMs, cuLimit: cfg.cuLimit,
      txs: txs.map((t, i) => ({ sig: t.sig, payer: t.payer, sendRank: t.rank, cuPrice: t.cuPrice, tSend: res[i].t0, tAck: res[i].t1, err: res[i].err })),
    }) + '\n');
    process.stdout.write(`\r${k + 1}/${plan.length} ${w.t.clientId.padEnd(18)} slot ${slotAtSend} -> window ${w.start}   `);
  }
  clearInterval(bhTimer);
  ac.abort();
  console.log(`\nrun done; fees this run at most ${(spent / LAMPORTS_PER_SOL).toFixed(5)} SOL`);
}

// Return everything left on the throwaway payers to the main wallet, or everything to `to` if given.
export async function sweep(to?: string) {
  const main = await loadMain();
  const dest = to ? address(to) : main.address;
  for (const p of [...await loadPayers(cfg.burst), ...(to ? [main] : [])]) {
    const { value: bal } = await rpc.getBalance(p.address).send();
    if (Number(bal) <= BASE_FEE) continue;
    console.log(p.address, await sendAndConfirm([getTransferSolInstruction({ source: p, destination: dest, amount: lamports(bal - BigInt(BASE_FEE)) })], p));
  }
}

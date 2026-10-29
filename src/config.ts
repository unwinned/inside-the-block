import { mkdirSync, readFileSync } from 'node:fs';
import { createDefaultRpcTransport, createSolanaRpcFromTransport } from '@solana/kit';

const env = process.env;
const list = (v: string | undefined, d: string) => (v || d).split(',').map(s => s.trim()).filter(Boolean);

export const cfg = {
  rpcUrl: env.RPC_URL || 'https://api.mainnet-beta.solana.com',
  wsUrl: env.WS_URL || (env.RPC_URL || 'https://api.mainnet-beta.solana.com').replace(/^http/, 'ws'),
  // Each probe goes out through exactly one of these; rotating them is how the send path is varied.
  sendUrls: list(env.SEND_RPC_URLS, env.RPC_URL || 'https://api.mainnet-beta.solana.com'),
  collectUrl: env.COLLECT_RPC_URL || env.RPC_URL || 'https://api.mainnet-beta.solana.com',
  keypair: env.KEYPAIR || '/keys/id.json',
  spendCapSol: Number(env.SPEND_CAP_SOL ?? 0.05),
  dataDir: env.DATA_DIR || './data',
  clients: list(env.CLIENTS, 'AgaveBam,JitoLabs,HarmonicAgave,HarmonicFiredancer,Firedancer,Agave'),
  perClient: Number(env.PER_CLIENT ?? 2),
  probesPerValidator: Number(env.PROBES_PER_VALIDATOR ?? 24),
  burst: Number(env.BURST ?? 6),
  gapMs: Number(env.GAP_MS ?? 20),
  leadSlots: Number(env.LEAD_SLOTS ?? 2),
  cuLimit: Number(env.CU_LIMIT ?? 20_000),
  // Alpenglow activated at this slot on 2026-10-21; measurements must not straddle it.
  alpenglowSlot: 459_653_000n,
};

const createSolanaRpc = (url: string, ms: number) => {
  const transport = createDefaultRpcTransport({ url });
  return createSolanaRpcFromTransport((c => transport({ ...c, signal: c.signal ?? AbortSignal.timeout(ms) })) as typeof transport);
};
export const rpc = createSolanaRpc(cfg.rpcUrl, 15_000);
export const collectRpc = createSolanaRpc(cfg.collectUrl, 120_000);

export const LAMPORTS_PER_SOL = 1_000_000_000;
export const BASE_FEE = 5_000; // lamports per signature

export function path(...p: string[]) {
  mkdirSync(cfg.dataDir + '/blocks', { recursive: true });
  return [cfg.dataDir, ...p].join('/');
}

export const readJson = (f: string) => JSON.parse(readFileSync(f, 'utf8'));
export const readJsonl = (f: string) =>
  readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));

// JSON with bigint support (RPC returns bigint for u64 fields).
export const toJson = (v: unknown, space?: number) =>
  JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? Number(x) : x), space);

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Retry wrapper for public-RPC rate limits (429) and transient errors.
export async function retry<T>(fn: () => Promise<T>, tries = 6): Promise<T> {
  for (let i = 0; ; i++) {
    try { return await fn(); } catch (e) {
      if (i >= tries) throw e;
      await sleep(500 * 2 ** i);
    }
  }
}

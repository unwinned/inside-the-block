import { writeFileSync } from 'node:fs';
import { cfg, path, retry, rpc, toJson } from './config.ts';

// Pick the highest-stake non-delinquent validators for each client type.
// clientId and version come from gossip (getClusterNodes) at the time of selection and are saved with the data.
export async function selectTargets() {
  const [nodes, votes, epoch] = await Promise.all([
    retry(() => rpc.getClusterNodes().send()),
    retry(() => rpc.getVoteAccounts().send()),
    retry(() => rpc.getEpochInfo().send()),
  ]);
  if (epoch.absoluteSlot < cfg.alpenglowSlot) throw new Error('cluster is still before Alpenglow activation');
  const node = new Map(nodes.map(n => [n.pubkey, n as typeof n & { clientId?: string }]));
  const total = votes.current.reduce((s, v) => s + Number(v.activatedStake), 0);
  const byClient = new Map<string, any[]>();
  const stakeByClient: Record<string, number> = {};
  for (const v of votes.current) {
    const n = node.get(v.nodePubkey);
    const clientId = n?.clientId ?? 'unknown';
    stakeByClient[clientId] = (stakeByClient[clientId] ?? 0) + Number(v.activatedStake) / total * 100;
    if (!cfg.clients.includes(clientId)) continue;
    const arr = byClient.get(clientId) ?? [];
    arr.push({
      identity: v.nodePubkey, vote: v.votePubkey, clientId, version: n?.version ?? null,
      stakePct: Number(v.activatedStake) / total * 100,
    });
    byClient.set(clientId, arr);
  }
  const targets = [...byClient.values()].flatMap(a => a.sort((x, y) => y.stakePct - x.stakePct).slice(0, cfg.perClient));
  const out = { selectedAt: new Date().toISOString(), slot: epoch.absoluteSlot, epoch: epoch.epoch, stakeByClient, targets };
  writeFileSync(path('targets.json'), toJson(out, 2));
  const clients = new Set(targets.map(t => t.clientId));
  console.log(`targets: ${targets.length} validators, ${clients.size} clients (${[...clients].join(', ')})`);
  if (targets.length < 6 || clients.size < 3) throw new Error('need at least 6 validators across 3 clients');
  return out;
}

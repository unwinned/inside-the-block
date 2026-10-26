import { selectTargets } from './targets.ts';
import { keygen, run, sweep } from './run.ts';
import { collect } from './collect.ts';
import { analyze } from './analyze.ts';

const [cmd = 'all', ...args] = process.argv.slice(2);
const live = args.includes('--live');

switch (cmd) {
  case 'keygen': await keygen(); break;
  case 'select': await selectTargets(); break;
  case 'run': await run(live); break;
  case 'collect': await collect(); break;
  case 'analyze': analyze(); break;
  case 'sweep': await sweep(args[0]); break;
  case 'all':
    await selectTargets();
    await run(live);
    if (live) { await collect(); await sweep(); analyze(); }
    break;
  default:
    console.log('usage: main.ts keygen | select | run [--live] | collect | analyze | sweep [address] | all [--live]');
    process.exit(1);
}
process.exit(0);

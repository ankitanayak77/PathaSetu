// npm run preflight [-- --expect-origin https://your-demo-host.example] [--json]
// Exit codes: 0 safe to proceed, 1 unsafe or demo-blocking configuration. Makes no live provider request and prints no secret.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPreflight, formatReport } from './lib/preflight.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = args.indexOf('--expect-origin');
const expectOrigin = flag > -1 ? args[flag + 1] ?? '' : null;
const json = args.includes('--json');
const result = await runPreflight({ env: process.env, root: ROOT, expectOrigin });
if (json) console.log(result.redact(JSON.stringify({ ok: result.ok, passed: result.passed, warned: result.warned, failed: result.failed, checks: result.checks }, null, 2)));
else console.log(formatReport(result));
process.exit(result.ok ? 0 : 1);

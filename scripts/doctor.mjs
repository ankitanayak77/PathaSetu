#!/usr/bin/env node
// npm run doctor [-- --json] [--expect-origin https://your-demo-host.example]
// Read-only local diagnostics; no live model request, deployment, browser launch or secret output.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDoctorReport, formatDoctorReport } from './lib/doctor.mjs';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: npm run doctor [-- --json] [--expect-origin https://your-demo-host.example]');
  console.log('Runs local syntax/content/preflight checks and discovers an installed browser. Makes no live provider call.');
  process.exit(0);
}
const unknown = args.filter((arg, i) => arg !== '--json' && arg !== '--expect-origin' && !(args[i - 1] === '--expect-origin'));
if (unknown.length) {
  console.error(`Unknown argument(s): ${unknown.join(', ')}. Use --help.`);
  process.exit(1);
}
const originIndex = args.indexOf('--expect-origin');
const expectOrigin = originIndex >= 0 ? (args[originIndex + 1] ?? '') : null;
if (originIndex >= 0 && (!expectOrigin || expectOrigin.startsWith('--'))) {
  console.error('BLOCKED: --expect-origin requires an HTTPS origin (or localhost HTTP origin) value.');
  process.exit(2);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = createDoctorReport({ root, env: process.env, expectOrigin });
if (args.includes('--json')) console.log(JSON.stringify(result, null, 2));
else console.log(formatDoctorReport(result));
process.exit(result.status === 'PASS' ? 0 : result.status === 'FAIL' ? 1 : 2);

// npm run mutation [-- --out <dir>] [--only A1,B2] [--tests tests/a.test.js,tests/b.test.js] [--list]
// Applies each deliberate fault from scripts/lib/mutants.mjs to a TEMPORARY copy of src/core, runs the configured test files
// (by default queue-invariants and Iteration 11 retry-atomicity) against that copy, and reports KILLED or SURVIVED. The project tree is never modified except
// for the report files written under --out. No network, no browser, no dependency.
// Exit codes: 0 every mutant killed, 1 a mutant survived or the harness failed.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { MUTANTS, applyEdits } from './lib/mutants.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (name, fallback) => { const index = args.indexOf(name); return index > -1 ? args[index + 1] ?? fallback : fallback; };
const outDir = path.resolve(ROOT, arg('--out', 'evidence/iteration10/mutation'));
const only = arg('--only', '') ? new Set(arg('--only', '').split(',').map((id) => id.trim())) : null;
// The invariant suite plus Iteration 11 retry-atomicity tests are the default. `--tests` lets the same mutants be
// run against an older focused suite to show what the new tests add.
const TEST_FILES = arg('--tests', 'tests/queue-invariants.test.js,tests/iteration11-retry-atomicity.test.js').split(',').map((file) => file.trim()).filter(Boolean);
const TEST_FILE = TEST_FILES.join(', ');
const CORE = path.join(ROOT, 'src/core');

if (args.includes('--list')) {
  for (const mutant of MUTANTS) console.log(`${mutant.id}\t${mutant.required ?? '-'}\t${mutant.description}`);
  process.exit(0);
}

const pristine = Object.fromEntries(fs.readdirSync(CORE).filter((name) => name.endsWith('.js')).map((name) => [name, fs.readFileSync(path.join(CORE, name), 'utf8')]));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'pathasetu-mutation-'));

function stage(files) {
  fs.rmSync(path.join(scratch, 'src'), { recursive: true, force: true });
  fs.mkdirSync(path.join(scratch, 'src/core'), { recursive: true });
  fs.mkdirSync(path.join(scratch, 'tests'), { recursive: true });
  fs.mkdirSync(path.join(scratch, 'content'), { recursive: true });
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(scratch, 'src/core', name), text);
  fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(scratch, 'package.json'));
  fs.copyFileSync(path.join(ROOT, 'content/electricity-pack.json'), path.join(scratch, 'content/electricity-pack.json'));
  for (const file of TEST_FILES) fs.copyFileSync(path.join(ROOT, file), path.join(scratch, file));
}

function runTests() {
  const started = Date.now();
  const run = spawnSync(process.execPath, ['--test', ...TEST_FILES], { cwd: scratch, encoding: 'utf8', timeout: 180_000, env: { ...process.env, NODE_OPTIONS: '' } });
  const text = `${run.stdout ?? ''}${run.stderr ?? ''}`;
  const count = (label) => Number((text.match(new RegExp(`^# ${label} (\\d+)`, 'm')) ?? [])[1] ?? Number.NaN);
  const failing = [...text.matchAll(/^not ok \d+ - (.+)$/gm)].map((match) => match[1]);
  return { exitCode: run.status, signal: run.signal, tests: count('tests'), passed: count('pass'), failed: count('fail'), failing, durationMs: Date.now() - started };
}

const results = [];
let harnessOk = true;
try {
  stage(pristine);
  const baseline = runTests();
  console.log(`baseline (unmutated copy): exit=${baseline.exitCode} tests=${baseline.tests} pass=${baseline.passed} fail=${baseline.failed}`);
  if (baseline.exitCode !== 0 || !(baseline.tests > 0)) { console.error('The unmutated copy must pass before mutants mean anything.'); harnessOk = false; }
  else {
    for (const mutant of MUTANTS) {
      if (only && !only.has(mutant.id)) continue;
      let status; let detail;
      try {
        const files = applyEdits(pristine, mutant.edits.map((e) => ({ ...e, file: e.file })));
        stage(files);
        const run = runTests();
        if (!(run.tests > 0) || run.signal) { status = 'ERROR'; detail = `the mutated copy did not run its tests (exit ${run.exitCode}, tests ${run.tests})`; }
        else if (run.exitCode === 0) { status = 'SURVIVED'; detail = 'all tests passed against the mutant'; }
        else { status = 'KILLED'; detail = `${run.failed} test(s) failed`; }
        results.push({ id: mutant.id, required: mutant.required, description: mutant.description, status, detail, exitCode: run.exitCode, tests: run.tests, failed: run.failed, failingTests: run.failing.slice(0, 6), durationMs: run.durationMs });
      } catch (error) {
        results.push({ id: mutant.id, required: mutant.required, description: mutant.description, status: 'ERROR', detail: String(error.message), exitCode: null, tests: 0, failed: 0, failingTests: [], durationMs: 0 });
      }
      const last = results.at(-1);
      console.log(`${last.id.padEnd(4)} ${last.status.padEnd(8)} ${last.required ? `(${last.required}) ` : '    '}${last.description} — ${last.detail}`);
    }
  }
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

const killed = results.filter((r) => r.status === 'KILLED').length;
const summary = { total: results.length, killed, survived: results.filter((r) => r.status === 'SURVIVED').length, errors: results.filter((r) => r.status === 'ERROR').length };
const requiredFamilies = ['a', 'b', 'c'].map((family) => ({ family, mutants: results.filter((r) => r.required === family).length, killed: results.filter((r) => r.required === family && r.status === 'KILLED').length }));
console.log(`\nmutants: ${summary.total}; killed ${summary.killed}; survived ${summary.survived}; errors ${summary.errors}`);
console.log(requiredFamilies.map((f) => `family ${f.family}: ${f.killed}/${f.mutants} killed`).join('; '));

fs.mkdirSync(outDir, { recursive: true });
const report = { node: process.version, testFile: TEST_FILE, note: 'Mutants are applied to a temporary copy of src/core only. A killed mutant means the tests failed against the deliberate fault. This is evidence about test sensitivity, not about learning outcomes or model accuracy.', summary, requiredFamilies, results };
fs.writeFileSync(path.join(outDir, 'mutation-results.json'), `${JSON.stringify(report, null, 2)}\n`);
const lines = ['# Mutation results (current iteration)', '', `Node ${process.version}. Test files: \`${TEST_FILE}\`. Mutants are applied to a temporary copy of \`src/core\`; the project tree is not modified.`, '', `Mutants: ${summary.total}; killed ${summary.killed}; survived ${summary.survived}; errors ${summary.errors}.`, '', '| ID | Family | Fault | Result | Failing tests (first) |', '|---|---|---|---|---|', ...results.map((r) => `| ${r.id} | ${r.required ?? ''} | ${r.description} | ${r.status} | ${r.failingTests[0] ? r.failingTests[0].replace(/\|/g, '/') : ''} |`), '', 'Families: a = retry timing or limit; b = queue drained on provider error; c = validator accepts a foreign misconception id or confirms uncertainty.', ''];
fs.writeFileSync(path.join(outDir, 'mutation-results.md'), lines.join('\n'));
console.log(`written: ${path.relative(ROOT, path.join(outDir, 'mutation-results'))}.json and .md`);
process.exit(harnessOk && summary.total > 0 && summary.survived === 0 && summary.errors === 0 ? 0 : 1);

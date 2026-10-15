// Iteration 12: command-line behaviour of `npm run mutation`. These run the real script on one or two cheap mutants and on the
// planning-only paths. The report must say what it is: a complete run, a partial run chosen with --only, or an INCOMPLETE run
// that ran out of its time budget (never a score).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts/mutation-check.mjs');
const run = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: 'utf8', timeout: 120_000 });
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'pathasetu-mutcli-'));

test('an unknown mutant id is an error, not an empty successful run', () => {
  const out = tmp();
  try {
    const r = run(['--only', 'A1,ZZ9', '--out', out]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /unknown mutant id: ZZ9/);
    assert.ok(!fs.existsSync(path.join(out, 'mutation-results.json')), 'no report is written for a rejected request');
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test('--dry-run prints the plan without running anything, and the default output folder is the current iteration, never an earlier one', () => {
  const r = run(['--dry-run']);
  assert.equal(r.status, 0, r.stderr);
  const plan = JSON.parse(r.stdout);
  assert.equal(plan.catalogueSize, 46);
  assert.equal(plan.mode, 'plan');
  assert.match(plan.outDir.split(path.sep).join('/'), /evidence\/iteration12\/mutation$/);
  assert.equal(plan.mutants.length, 46);
  for (const m of plan.mutants) { assert.ok(m.groups.length >= 1 && m.selections.length >= 1, m.id); }
  const full = JSON.parse(run(['--dry-run', '--full']).stdout);
  assert.equal(full.mode, 'full-suite');
  assert.ok(full.mutants.every((m) => m.selections.length >= 2), 'full-suite mode runs both invariant files for every mutant');
});

test('--list shows the test groups chosen for each mutant', () => {
  const r = run(['--list']);
  const rows = r.stdout.trim().split('\n');
  assert.equal(rows.length, 46);
  assert.ok(rows.every((row) => row.split('\t').length === 4), 'id, family, plan groups, description');
});

test('a partial run records, for every mutant, its plan, the tests executed before and after, the outcome and the time, and says it is partial', () => {
  const out = tmp();
  try {
    const r = run(['--only', 'A7,G1', '--out', out]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const report = JSON.parse(fs.readFileSync(path.join(out, 'mutation-results.json'), 'utf8'));
    assert.equal(report.catalogueSize, 46);
    assert.equal(report.mode, 'plan');
    assert.equal(report.complete, false, 'two of 46 mutants is not a mutation score');
    assert.equal(report.state, 'FINISHED');
    assert.equal(report.summary.selected, 2);
    assert.equal(report.summary.killed, 2);
    assert.ok(Number.isFinite(report.elapsedMs) && report.elapsedMs > 0);
    for (const row of report.results) {
      assert.equal(row.status, 'KILLED');
      assert.ok(Array.isArray(row.groups) && row.groups.length >= 1);
      assert.ok(row.selections.every((s) => s.file));
      assert.ok(row.baseline.executed > 0 && row.baseline.failed === 0, row.id);
      assert.ok(row.mutated.executed === row.baseline.executed && row.mutated.failed >= 1, row.id);
      assert.ok(Number.isFinite(row.durationMs) && row.durationMs >= 0);
      assert.ok(row.failingTests.length >= 1);
    }
    const md = fs.readFileSync(path.join(out, 'mutation-results.md'), 'utf8');
    assert.match(md, /PARTIAL RUN: 2 of 46/);
    assert.match(md, /\| A7 \|/);
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test('a run that exhausts its time budget is INCOMPLETE: unrun mutants are NOT_RUN, no score is claimed and the exit code is 3', () => {
  const out = tmp();
  try {
    const r = run(['--only', 'A1,A2,A3', '--budget-seconds', '0.0001', '--out', out]);
    assert.equal(r.status, 3, r.stdout + r.stderr);
    const report = JSON.parse(fs.readFileSync(path.join(out, 'mutation-results.json'), 'utf8'));
    assert.equal(report.complete, false);
    assert.equal(report.state, 'INCOMPLETE');
    assert.ok(report.summary.notRun >= 1);
    assert.ok(report.results.some((row) => row.status === 'NOT_RUN'));
    assert.equal(report.results.length, 3, 'every selected mutant has a row, run or not');
    assert.match(fs.readFileSync(path.join(out, 'mutation-results.md'), 'utf8'), /INCOMPLETE/);
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test('full-suite mode runs every mutant against all invariant tests and records that mode', () => {
  const out = tmp();
  try {
    const r = run(['--full', '--only', 'A7', '--out', out]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const report = JSON.parse(fs.readFileSync(path.join(out, 'mutation-results.json'), 'utf8'));
    assert.equal(report.mode, 'full-suite');
    assert.ok(report.results[0].baseline.executed >= 62, 'the whole 56 + 6 test combination');
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test('the script does not use the default (spec/TAP-dependent) reporter and states the reporter it forces', () => {
  const lib = fs.readFileSync(path.join(ROOT, 'scripts/lib/mutation-plan.mjs'), 'utf8');
  assert.match(lib, /--test-reporter=tap/);
});

test('an existing results file is never replaced silently: a second run into the same folder is refused unless --overwrite is given', () => {
  const out = tmp();
  try {
    const first = run(['--only', 'D13', '--out', out]);
    assert.equal(first.status, 0, first.stdout + first.stderr);
    const before = fs.readFileSync(path.join(out, 'mutation-results.json'), 'utf8');
    const second = run(['--only', 'D12', '--out', out]);
    assert.equal(second.status, 1);
    assert.match(second.stderr, /already contains mutation-results\.json/);
    assert.equal(fs.readFileSync(path.join(out, 'mutation-results.json'), 'utf8'), before, 'the earlier record must be untouched');
    const third = run(['--only', 'D12', '--out', out, '--overwrite']);
    assert.equal(third.status, 0, third.stdout + third.stderr);
    assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'mutation-results.json'), 'utf8')).results[0].id, 'D12');
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

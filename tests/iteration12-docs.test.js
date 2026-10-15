// Iteration 12 evidence and claim gates. Iteration 12 changes mutation-run tooling, tests and documents; no product runtime file and no
// phase criterion moves. These tests check that the harness was shown failing first, that the complete mutation catalogue ran to a
// real result in its own recorded run, that the focused plans were compared with the whole-suite run, that earlier evidence (including
// the Iteration 11 INCOMPLETE record) is unchanged, and that the written claims stay inside what was run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../scripts/lib/csv.mjs';
import { MUTANTS } from '../scripts/lib/mutants.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const json = (f) => JSON.parse(read(f));
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, f))).digest('hex');
const walk = (dir, out = []) => { for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) { const rel = `${dir}/${e.name}`; if (e.isDirectory()) walk(rel, out); else out.push(rel); } return out; };
// The command log is completed after the unit-test command, so evidence it produces is enforced only once the run script marked it DONE.
const finalDone = () => exists('evidence/iteration12/final/exit-codes.txt') && /^DONE$/m.test(read('evidence/iteration12/final/exit-codes.txt'));

test('the harness tests were shown failing before the implementation and passing after it', () => {
  const red = read('evidence/iteration12/tests-first/mutation-harness-red-before-fix.txt');
  assert.match(red, /^# fail [1-9]\d*$/m);
  assert.match(red, /^targeted red-before-fix exit=1$/m);
  assert.match(red, /not ok \d+ - an unknown mutant id is an error/);
  assert.match(red, /mutation-plan\.test\.js/, 'the planning tests failed because the implementation did not exist yet');
  const guard = read('evidence/iteration12/tests-first/mutation-overwrite-guard-red-before-fix.txt');
  assert.match(guard, /not ok \d+ - an existing results file is never replaced silently/);
  assert.match(guard, /^targeted red-before-fix exit=1$/m);
  const green = read('evidence/iteration12/tests-first/mutation-harness-green-after-fix.txt');
  assert.match(green, /^# fail 0$/m);
  assert.match(green, /^# pass (1[6-9]|[2-9]\d)$/m);
});

test('the whole-suite cross-check and the targeted G1 run are complete records: every mutant executed tests and none survived', () => {
  const full = json('evidence/iteration12/mutation-full-suite/mutation-results.json');
  assert.equal(full.mode, 'full-suite');
  assert.equal(full.reporter, 'tap');
  assert.equal(full.catalogueSize, MUTANTS.length);
  assert.equal(full.complete, true);
  assert.equal(full.state, 'FINISHED');
  assert.deepEqual(full.results.map((r) => r.id), MUTANTS.map((m) => m.id), 'a row for every mutant, in catalogue order');
  assert.deepEqual([full.summary.killed, full.summary.survived, full.summary.errors, full.summary.notRun], [46, 0, 0, 0]);
  for (const row of full.results) {
    assert.equal(row.status, 'KILLED', row.id);
    assert.ok(row.baseline.executed >= 62 && row.baseline.failed === 0, `${row.id}: the whole 56 + 6 test combination ran unmutated`);
    assert.equal(row.mutated.executed, row.baseline.executed, row.id);
    assert.ok(row.mutated.failed >= 1 && row.failingTests.length >= 1 && row.exitCode !== 0, row.id);
  }
  const g1 = json('evidence/iteration12/mutation-G1/mutation-results.json');
  assert.equal(g1.complete, false, 'a one-mutant run is not a mutation score');
  assert.equal(g1.results.length, 1);
  assert.equal(g1.results[0].id, 'G1');
  assert.equal(g1.results[0].status, 'KILLED');
  assert.ok(g1.results[0].baseline.executed > 0);
  assert.match(read('evidence/iteration12/mutation-G1/mutation-results.md'), /PARTIAL RUN: 1 of 46/);
});

test('the Iteration 11 harness was profiled before it was changed, and the finding is recorded without claiming a cause', () => {
  const profile = json('evidence/iteration12/profile-iteration11-harness/mutation-results.json');
  assert.equal(profile.summary.total, 46);
  assert.equal(profile.summary.killed, 46);
  const log = read('evidence/iteration12/profile-iteration11-harness/console-with-timing.txt');
  assert.match(log, /^real\s+0m\d+\.\d+s$/m);
  const decisions = parseCsv(read('docs/DECISION_LOG.csv')).records;
  const d222 = decisions.find((r) => r.id === 'D222');
  assert.equal(d222.status, 'UNKNOWN');
  assert.match(d222.decision, /not established/);
  assert.match(read('evidence/iteration11/mutation/full-mutant-run-incomplete.txt'), /INCOMPLETE/i, 'the Iteration 11 INCOMPLETE record is still there, unchanged');
});

test('the official plan-mode run is complete, killed every mutant, and agrees with the whole-suite run mutant by mutant', () => {
  if (!finalDone()) return;
  const plan = json('evidence/iteration12/mutation/mutation-results.json');
  const full = json('evidence/iteration12/mutation-full-suite/mutation-results.json');
  assert.equal(plan.mode, 'plan');
  assert.equal(plan.complete, true);
  assert.equal(plan.state, 'FINISHED');
  assert.equal(plan.catalogueSize, 46);
  assert.deepEqual([plan.summary.run, plan.summary.killed, plan.summary.survived, plan.summary.errors, plan.summary.notRun], [46, 46, 0, 0, 0]);
  assert.ok(Number.isFinite(plan.elapsedMs) && plan.elapsedMs > 0, 'elapsed time is recorded');
  for (const family of ['a', 'b', 'c']) {
    const f = plan.requiredFamilies.find((x) => x.family === family);
    assert.ok(f.mutants >= 3 && f.killed === f.mutants, `family ${family}`);
  }
  assert.deepEqual(plan.results.map((r) => [r.id, r.status]), full.results.map((r) => [r.id, r.status]), 'focused plans lose no kill that the whole suite makes');
  for (const row of plan.results) {
    assert.ok(row.groups.length >= 1 && row.selections.length >= 1, row.id);
    assert.ok(row.baseline.executed > 0 && row.baseline.failed === 0 && row.mutated.executed === row.baseline.executed && row.mutated.failed >= 1, row.id);
    assert.ok(Number.isFinite(row.durationMs), row.id);
  }
  assert.ok(plan.elapsedMs < full.elapsedMs, 'the focused plans are cheaper than running everything for every mutant');
});

test('earlier evidence is unchanged: every Iteration 8 to 11 record and the latest-run files match their recorded digests, and no file was added to those folders', () => {
  const recorded = new Map(read('evidence/iteration12/historical-evidence-hashes.txt').trim().split('\n').map((l) => { const [hash, file] = l.split(/\s{2}/); return [file, hash]; }));
  assert.ok(recorded.size >= 170);
  for (const [file, hash] of recorded) assert.equal(sha(file), hash, `${file} changed since it was recorded`);
  const onDisk = ['evidence/iteration8', 'evidence/iteration9', 'evidence/iteration10', 'evidence/iteration11'].flatMap((d) => walk(d)).sort();
  assert.deepEqual(onDisk, [...recorded.keys()].filter((f) => /^evidence\/iteration(8|9|10|11)\//.test(f)).sort(), 'a file was added to or removed from an earlier iteration folder');
});

test('Iteration 12 changed tooling only: product runtime files are byte-identical to the Iteration 11 record, and the previous tooling bytes are preserved', () => {
  const rec = new Map(read('evidence/iteration11/runtime-file-hashes.txt').trim().split('\n').map((l) => { const [hash, file] = l.split(/\s{2}/); return [file, hash]; }));
  for (const [file, hash] of rec) {
    if (/^(src|public|content)\//.test(file)) {
      const pathForIteration12 = [13, 14, 15, 16].map((n) => `evidence/iteration${n}/previous-runtime/${file}`).find((candidate) => exists(candidate)) ?? file;
      assert.equal(sha(pathForIteration12), hash, `${file} must be unchanged in Iteration 12 (or preserved as the Iteration 13 pre-change bytes)`);
    }
  }
  for (const file of ['package.json', 'scripts/lib/mutants.mjs', 'scripts/mutation-check.mjs']) {
    assert.equal(sha(`evidence/iteration12/previous-runtime/${file}`), rec.get(file), `${file}: the preserved bytes are the Iteration 11 version`);
    assert.notEqual(sha(file), rec.get(file), `${file} was declared as changed`);
  }
  const mutants = read('scripts/lib/mutants.mjs');
  const before = read('evidence/iteration12/previous-runtime/scripts/lib/mutants.mjs');
  const catalogue = (text) => text.slice(text.indexOf('export const MUTANTS'), text.indexOf('// ---- Test groups') > -1 ? text.indexOf('// ---- Test groups') : text.indexOf('export function applyEdits'));
  assert.equal(catalogue(mutants), catalogue(before), 'the 46 mutant definitions are byte-identical to Iteration 11; only plans were added');
  const pack = json('content/electricity-pack.json');
  assert.ok(pack.items.length === 8 && pack.items.every((i) => i.status === 'UNREVIEWED_DRAFT'));
});

test('the phase matrix did not move: the criteria list is identical to the Iteration 11 snapshot, 95/196, and the Iteration 12 snapshot matches the live matrix', () => {
  assert.equal(read('docs/PHASE_CRITERIA.csv'), read('evidence/iteration11/PHASE_CRITERIA_SNAPSHOT.csv'));
  assert.equal(read('evidence/iteration12/phase_criteria_snapshot.csv'), read('docs/PHASE_CRITERIA.csv'));
  const rows = parseCsv(read('docs/PHASE_CRITERIA.csv')).records.filter((r) => r.state !== 'NA');
  assert.equal(`${rows.filter((r) => r.state === 'DONE').length}/${rows.length}`, '95/196');
  const md = read('docs/PHASE_COMPLETION_MATRIX.md');
  assert.match(md, /95\/196 = 48\.5% complete, 51\.5% remaining/);
  assert.match(md, /Iterations 11 and 12 move no criterion/);
  assert.ok(read('evidence/iteration12/PHASE_MATRIX_SNAPSHOT_2026-10-14.md').endsWith(md), 'the snapshot is the live matrix under a short header');
});

test('the quick card uses the real on-screen strings and routes, and claims nothing beyond what ran', () => {
  const card = read('docs/DEMO_QUICK_CARD.md');
  const html = read('public/index.html');
  const app = read('public/app.js');
  const server = read('src/server/server.js');
  for (const text of ['MOCK PROVIDER · DEMO RULES · NO LIVE AI', 'Draft demo pack', 'Odia wording awaits teacher review', 'PROTOTYPE']) { assert.ok(card.includes(text) && html.includes(text), `${text} must match public/index.html`); }
  for (const text of ['Check my thinking', 'Saved offline · re-check queued', 'Re-check paused · needs attention', 'Retry now', 'Updated recommendation', 'QUESTION ']) { assert.ok(card.includes(text.trim()) && app.includes(text.trim()), `${text} must match public/app.js`); }
  for (const text of ['Agent decision trace', 'Download trace JSON']) assert.ok(card.includes(text) && html.includes(text), text);
  for (const route of ['/api/health', '/api/session', '/api/pack', '/api/recheck']) assert.ok(card.includes(route) && server.includes(`'${route}'`), route);
  for (const event of ['plan_selected', 'answer_submitted', 'recheck_complete']) assert.ok(card.includes(event) && read('src/core/agent.js').includes(`'${event}'`), event);
  assert.match(card, /nothing on it has been run on a phone/i);
  assert.match(card, /BLOCKED, not a pass/i);
  assert.match(card, /Rule 4\.1 stays UNCONFIRMED/);
  assert.ok(!/learning gain (was|is) (shown|proven)|works on (all|every) phone/i.test(card));
  const pack = json('content/electricity-pack.json');
  assert.ok(card.includes(`"itemId":"${pack.items[0].id}"`) && card.includes(`"optionId":"${pack.items[0].options[0].id}"`), 'the example request uses a real item and option');
});

test('BUILD_STATUS reports Iteration 12 per environment, keeps the earlier blocked and incomplete records, and claims nothing beyond synthetic engineering tests', () => {
  const status = read('docs/BUILD_STATUS.md');
  assert.match(status, /Iteration 12/);
  assert.match(status, /evidence\/iteration12\/final\//);
  assert.match(status, /INCOMPLETE/, 'the Iteration 11 incomplete sweep stays on record');
  assert.match(status, /ERR_BLOCKED_BY_ADMINISTRATOR/);
  assert.match(status, /synthetic/i);
  assert.match(status, /no phone|nothing here ran on a phone|No phone/i);
  assert.match(status, /D222|not established/);
  assert.match(status, /46 (deliberate )?(faults|mutants)/);
  for (const f of ['README.md', 'docs/BUILD_STATUS.md', 'docs/DEMO_QUICK_CARD.md']) {
    assert.ok(!/learning gain (was|is) (shown|proven|demonstrated)|improves? learning|proves? (that )?(learners|mastery)/i.test(read(f).replace(/(no|not|never|nor|without)[^.\n]{0,80}learning gain/gi, '')), `${f} must not claim learning gain`);
  }
  assert.match(read('docs/RULE_4_1_STATUS.md'), /RULE_4_1_STATUS=UNCONFIRMED/);
  assert.match(read('docs/ORGANIZER_CLARIFICATION_UNSENT.md'), /UNSENT/);
  assert.match(read('README.md'), /npm run mutation[^\n]*--full/);
});

test('the final command log has every required command with an exit status, in the required order, and the environment is recorded', () => {
  if (!finalDone()) return;
  const log = read('evidence/iteration12/final/exit-codes.txt');
  const order = ['npm-ci', 'npm-test', 'npm-check', 'npm-check-content', 'npm-preflight', 'npm-doctor', 'npm-evaluate', 'npm-mutation'];
  let last = -1;
  for (const name of order) { const at = log.search(new RegExp(`^${name}: exit=\\d+ `, 'm')); assert.ok(at > last, `${name} missing or out of order`); last = at; }
  for (const name of ['npm-capture', 'npm-e2e', 'npm-a11y']) assert.match(log, new RegExp(`^${name}: exit=\\d+ `, 'm'), name);
  assert.match(log, /^npm-mutation: exit=0 /m);
  const env = read('evidence/iteration12/final/environment.txt');
  assert.match(env, /node v\d+/);
  assert.match(env, /PATHASETU_MODEL_PROVIDER: set/);
  assert.match(env, /GROQ_API_KEY: NOT SET/);
  assert.match(env, /browser version:/);
  const base = read('evidence/iteration12/baseline/exit-codes.txt');
  for (const name of ['npm-ci', 'npm-test', 'npm-check', 'npm-check-content', 'npm-preflight', 'npm-doctor', 'npm-evaluate']) assert.match(base, new RegExp(`^${name}: exit=0 `, 'm'), `baseline ${name}`);
});

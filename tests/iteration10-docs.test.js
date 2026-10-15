// Iteration 10 evidence and claim gates: the new invariant tests were shown failing first, the mutation run is recorded and every
// mutant was killed, the criterion and backlog feature moved together, earlier evidence is unchanged, and the written claims stay
// inside what a synthetic engineering test can show.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../scripts/lib/csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const csv = (f) => parseCsv(read(f)).records;
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, f))).digest('hex');
const walk = (dir, out = []) => { for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) { const rel = `${dir}/${e.name}`; if (e.isDirectory()) walk(rel, out); else out.push(rel); } return out; };

test('P10-09 and J07 moved together: the criterion is DONE with existing evidence, the backlog feature says what was built, and only that one criterion changed since Iteration 9', () => {
  const now = csv('docs/PHASE_CRITERIA.csv');
  const before = csv('evidence/iteration9/phase_criteria_snapshot.csv');
  const p1009 = now.find((r) => r.id === 'P10-09');
  assert.equal(p1009.state, 'DONE');
  for (const token of p1009.evidence_path.split(';').map((x) => x.trim())) assert.ok(exists(token), `P10-09 cites missing ${token}`);
  assert.equal(before.find((r) => r.id === 'P10-09').state, 'NOT_STARTED');
  const changed = now.filter((r) => JSON.stringify(r) !== JSON.stringify(before.find((b) => b.id === r.id)));
  assert.deepEqual(changed.map((r) => r.id), ['P10-09'], 'exactly one criterion changed');
  assert.equal(now.length, before.length, 'no criterion was added or removed');
  const j07 = csv('docs/FEATURE_OPPORTUNITY_BACKLOG.csv').find((r) => r.id === 'J07');
  assert.match(j07.current_status, /^IMPLEMENTED IN ITERATION 10/);
  assert.match(j07.current_status, /no browser or phone claim/);
});

test('the mutation run is recorded: every required family and every mutant was killed, none survived, and nothing errored', () => {
  const report = JSON.parse(read('evidence/iteration10/mutation/mutation-results.json'));
  assert.ok(report.summary.total >= 45, `only ${report.summary.total} mutants`);
  assert.equal(report.summary.killed, report.summary.total);
  assert.equal(report.summary.survived, 0);
  assert.equal(report.summary.errors, 0);
  for (const family of ['a', 'b', 'c']) {
    const f = report.requiredFamilies.find((x) => x.family === family);
    assert.ok(f && f.mutants >= 3 && f.killed === f.mutants, `family ${family}`);
  }
  assert.ok(report.results.every((r) => r.status === 'KILLED' && r.failed > 0 && r.exitCode !== 0));
  assert.match(report.note, /not about learning outcomes or model accuracy/);
});

test('the same mutants were also run against the Iteration 9 unit tests, and the two defects fixed in Iteration 10 were among the survivors', () => {
  const report = JSON.parse(read('evidence/iteration10/mutation-vs-iteration9-tests/mutation-results.json'));
  const survivors = report.results.filter((r) => r.status === 'SURVIVED').map((r) => r.id);
  assert.ok(survivors.includes('B4'), 'the missing-provider-result fallback was not caught by the Iteration 9 tests');
  assert.ok(survivors.includes('D10'), 'the repeated-id collision was not caught by the Iteration 9 tests');
  assert.ok(report.summary.survived >= 2 && report.summary.errors === 0);
  assert.match(report.testFile, /tests\/retry\.test\.js/);
  assert.doesNotMatch(report.testFile, /queue-invariants/);
});

test('the new invariant tests were shown failing before the fix and passing after it', () => {
  const red = read('evidence/iteration10/tests-first/queue-invariants-red-before-fix.txt');
  assert.match(red, /^# fail [1-9]\d*$/m, 'the first run must have failures');
  assert.match(red, /not ok \d+ - identity \(fault injection\)/);
  assert.match(red, /not ok \d+ - fault null_body/);
  assert.match(red, /not ok \d+ - a missing diagnosis from the provider is a failed attempt/);
  const vs9 = read('evidence/iteration10/tests-first/queue-invariants-final-file-vs-iteration9-source.txt');
  assert.match(vs9, /^# fail [1-9]\d*$/m);
  assert.match(vs9, /^# pass \d+$/m);
  assert.match(vs9, /^exit=1$/m);
  const green = read('evidence/iteration10/tests-first/queue-invariants-green-after-fix.txt');
  assert.match(green, /^# fail 0$/m);
  assert.match(green, /^# pass (5[3-9]|[6-9]\d)$/m);
  // While `npm test` itself is running, its own output file is still being written, so it is only checked once the summary is there.
  const finalFile = 'evidence/iteration10/final/npm-test.txt';
  if (exists(finalFile) && /^# fail \d+$/m.test(read(finalFile))) assert.match(read(finalFile), /^# fail 0$/m);
});

test('Iteration 10 changed the queue core in exactly the two declared ways, and both are visible in the diff against the preserved Iteration 9 file', () => {
  const before = read('evidence/iteration10/previous-runtime/src/core/agent.js');
  const after = read('src/core/agent.js');
  assert.notEqual(before, after);
  assert.ok(!/uniqueId/.test(before) && /uniqueId\('q', state\.queue\)/.test(after) && /uniqueId\('ans', state\.answers\)/.test(after));
  assert.ok(/diagnosisOverride = null/.test(before) && !/diagnosisOverride = null/.test(after));
  assert.match(after, /Object\.hasOwn\(params, 'diagnosisOverride'\)/);
  // Nothing else of the learning logic moved: the planner, the validator allow-list and the retry policy are the Iteration 9 text.
  for (const marker of ['export function chooseNextItem', 'export function manualRetryQueue', 'function applyDiagnosisToState', 'const MAX_QUEUE = 100;', 'const MAX_TRACE = 200;']) {
    assert.equal(before.includes(marker), after.includes(marker), marker);
  }
});

test('earlier evidence is unchanged: every Iteration 8 and Iteration 9 record and the latest-run files match their recorded digests, and no file was added to those folders', () => {
  const recorded = new Map(read('evidence/iteration10/historical-evidence-hashes.txt').trim().split('\n').map((l) => { const [hash, file] = l.split(/\s{2}/); return [file, hash]; }));
  assert.ok(recorded.size >= 80);
  for (const [file, hash] of recorded) assert.equal(sha(file), hash, `${file} changed since it was recorded`);
  const onDisk = [...walk('evidence/iteration8'), ...walk('evidence/iteration9')];
  assert.deepEqual(onDisk.sort(), [...recorded.keys()].filter((f) => /^evidence\/iteration[89]\//.test(f)).sort(), 'a file was added to or removed from an earlier iteration folder');
});

test('the final command log has every required command with an exit status, and the browser results carry their environment', () => {
  const baseline = read('evidence/iteration10/baseline/exit-codes.txt');
  for (const name of ['npm-ci', 'npm-test', 'npm-check', 'npm-check-content', 'npm-preflight', 'npm-doctor', 'npm-evaluate']) assert.match(baseline, new RegExp(`^${name}: exit=0 `, 'm'), `baseline ${name}`);
  assert.match(baseline, /baseline/);
  // The command log is completed after the unit-test command, so it is enforced only once the run script has marked it DONE.
  if (!exists('evidence/iteration10/final/exit-codes.txt') || !/^DONE$/m.test(read('evidence/iteration10/final/exit-codes.txt'))) return;
  const log = read('evidence/iteration10/final/exit-codes.txt');
  for (const name of ['npm-ci', 'npm-test', 'npm-check', 'npm-check-content', 'npm-preflight', 'npm-doctor', 'npm-evaluate', 'npm-capture', 'npm-e2e', 'npm-a11y']) assert.match(log, new RegExp(`^${name}: exit=\\d+ `, 'm'), name);
  const env = read('evidence/iteration10/final/environment.txt');
  assert.match(env, /node v\d+/);
  assert.match(env, /PATHASETU_MODEL_PROVIDER: set/);
  assert.match(env, /GROQ_API_KEY: NOT SET/);
  assert.match(env, /browser version:/);
});

test('BUILD_STATUS reports Iteration 10 per environment, keeps the Iteration 9 policy block on record, and claims nothing beyond synthetic engineering tests', () => {
  const status = read('docs/BUILD_STATUS.md');
  assert.match(status, /Iteration 10/);
  assert.match(status, /evidence\/iteration10\/final\//);
  assert.match(status, /queue-invariants/);
  assert.match(status, /45 (deliberate )?(faults|mutants)/);
  assert.match(status, /ERR_BLOCKED_BY_ADMINISTRATOR/, 'the Iteration 9 policy block stays on record');
  assert.match(status, /synthetic/i);
  assert.match(status, /no phone|nothing here ran on a phone|No phone/i);
  for (const f of ['README.md', 'docs/BUILD_STATUS.md', 'docs/PHASE_COMPLETION_MATRIX.md']) {
    const text = read(f);
    assert.ok(!/learning gain (was|is) (shown|proven|demonstrated)|improves? learning|proves? (that )?(learners|mastery)/i.test(text.replace(/(no|not|never|nor|without)[^.\n]{0,80}learning gain/gi, '')), `${f} must not claim learning gain`);
  }
  const rule = read('docs/RULE_4_1_STATUS.md');
  assert.match(rule, /RULE_4_1_STATUS=UNCONFIRMED/);
  assert.match(read('docs/ORGANIZER_CLARIFICATION_UNSENT.md'), /UNSENT/);
  const pack = JSON.parse(read('content/electricity-pack.json'));
  assert.ok(pack.items.length === 8 && pack.items.every((i) => i.status === 'UNREVIEWED_DRAFT'));
});

test('the Iteration 10 matrix figure is the recomputed one, with the overall, launch, implementation and gate rows and no hard-coded average', () => {
  const rows = csv('docs/PHASE_CRITERIA.csv').filter((r) => r.state !== 'NA');
  const done = rows.filter((r) => r.state === 'DONE').length;
  assert.equal(`${done}/${rows.length}`, '95/196');
  const md = read('docs/PHASE_COMPLETION_MATRIX.md');
  assert.match(md, /95\/196 = 48\.5% complete, 51\.5% remaining/);
  assert.match(md, /Iteration 10 moves exactly one criterion \(P10-09/);
  assert.match(md, /\| P10 \| Automated quality and evaluation \| COMPLETE for the listed criteria \|/);
  assert.match(read('evidence/iteration10/PHASE_MATRIX_SNAPSHOT_2026-10-14.md'), /95\/196 = 48\.5% complete; 51\.5% remaining/);
});

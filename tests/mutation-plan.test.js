// Iteration 12: rules for the mutation harness itself. A mutant may be called KILLED only when the unmutated selected tests pass,
// at least one relevant test really executes, and at least one of them fails against the mutant. Everything else that is not a
// plain survivor is an ERROR, never a kill. These tests use small throw-away fixture projects, never the shipped source.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MUTANTS, TEST_GROUPS, MUTANT_PLANS } from '../scripts/lib/mutants.mjs';
import { parseTap, validatePlans, selectionsFor, runSelection, combineRuns, judge } from '../scripts/lib/mutation-plan.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fixture(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pathasetu-plan-test-'));
  for (const [name, text] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true }); fs.writeFileSync(path.join(dir, name), text); }
  return dir;
}
const PASSING = "import test from 'node:test';\ntest('alpha one', () => {});\ntest('alpha two', () => {});\ntest('beta', () => {});\n";
const FAILING_BETA = "import test from 'node:test';\nimport assert from 'node:assert/strict';\ntest('alpha one', () => {});\ntest('alpha two', () => {});\ntest('beta', () => assert.equal(1, 2));\n";
const ALL_SKIPPED = "import test from 'node:test';\ntest('alpha one', { skip: true }, () => {});\ntest('alpha two', { skip: true }, () => {});\n";
const BROKEN_IMPORT = "import test from 'node:test';\nimport './does-not-exist.js';\ntest('alpha one', () => {});\n";
const ids = (list) => list.map((m) => m.id);

test('parseTap reads the TAP summary and counts only tests that actually ran', () => {
  const sample = ['TAP version 13', 'ok 1 - a', 'ok 2 - b # SKIP', '1..2', '# tests 2', '# suites 0', '# pass 1', '# fail 0', '# cancelled 0', '# skipped 1', '# todo 0'].join('\n');
  assert.deepEqual(parseTap(sample), { tests: 2, pass: 1, fail: 0, cancelled: 0, skipped: 1, todo: 0, executed: 1 });
  assert.equal(parseTap('ℹ tests 2\nℹ pass 2\nℹ fail 0\n'), null, 'spec-style output is not TAP and must not be guessed at');
  assert.equal(parseTap(''), null);
});

test('a plan list with a missing selector, an unknown mutant, an empty plan, an unknown group or a bad pattern is rejected', () => {
  const mutants = [{ id: 'X1' }, { id: 'X2' }];
  const groups = { one: { file: 'tests/a.test.js', pattern: '^alpha' }, two: { file: 'tests/b.test.js', pattern: null } };
  assert.doesNotThrow(() => validatePlans(mutants, { X1: ['one'], X2: ['one', 'two'] }, groups));
  assert.throws(() => validatePlans(mutants, { X1: ['one'] }, groups), /no test plan for mutant X2/);
  assert.throws(() => validatePlans(mutants, { X1: ['one'], X2: ['one'], X9: ['one'] }, groups), /plan for unknown mutant X9/);
  assert.throws(() => validatePlans(mutants, { X1: [], X2: ['one'] }, groups), /empty test plan for mutant X1/);
  assert.throws(() => validatePlans(mutants, { X1: ['nope'], X2: ['one'] }, groups), /unknown test group "nope"/);
  assert.throws(() => validatePlans(mutants, { X1: ['one', 'one'], X2: ['one'] }, groups), /lists group "one" twice/);
  assert.throws(() => validatePlans(mutants, { X1: ['bad'], X2: ['one'] }, { ...groups, bad: { file: 'tests/c.test.js', pattern: '(' } }), /invalid pattern/);
  assert.throws(() => validatePlans(mutants, { X1: ['one'], X2: ['one'] }, { one: { file: 'tests/missing.test.js', pattern: null } }, { rootDir: ROOT }), /does not exist/);
});

test('groups on the same file merge into one selection, and a group without a pattern selects the whole file', () => {
  const groups = { a: { file: 'f1', pattern: '^x' }, b: { file: 'f1', pattern: '^y' }, c: { file: 'f2', pattern: null }, d: { file: 'f1', pattern: null } };
  assert.deepEqual(selectionsFor(['a', 'b', 'c'], groups), [{ file: 'f1', pattern: '(?:^x)|(?:^y)' }, { file: 'f2', pattern: null }]);
  assert.deepEqual(selectionsFor(['a', 'd'], groups), [{ file: 'f1', pattern: null }]);
});

test('a selector that matches zero tests, and a file whose tests all skip, both execute nothing', async () => {
  const dir = fixture({ 'tests/a.test.js': PASSING, 'tests/s.test.js': ALL_SKIPPED });
  try {
    const none = runSelection({ cwd: dir, selection: { file: 'tests/a.test.js', pattern: '^no such test$' } });
    assert.equal(none.executed, 0);
    const skipped = runSelection({ cwd: dir, selection: { file: 'tests/s.test.js', pattern: null } });
    assert.equal(skipped.executed, 0);
    assert.equal(skipped.skipped, 2);
    const some = runSelection({ cwd: dir, selection: { file: 'tests/a.test.js', pattern: '^alpha' } });
    assert.deepEqual([some.executed, some.fail, some.exitCode], [2, 0, 0]);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('judge: KILLED only if the unmutated run passes, tests executed, and the mutated run fails the same number of tests it ran', () => {
  const dir = fixture({ 'tests/a.test.js': PASSING });
  const mutatedDir = fixture({ 'tests/a.test.js': FAILING_BETA });
  const crashedDir = fixture({ 'tests/a.test.js': BROKEN_IMPORT });
  const skipDir = fixture({ 'tests/a.test.js': ALL_SKIPPED });
  try {
    const sel = { file: 'tests/a.test.js', pattern: null };
    const base = combineRuns([runSelection({ cwd: dir, selection: sel })]);
    const killed = judge({ baseline: base, mutated: combineRuns([runSelection({ cwd: mutatedDir, selection: sel })]) });
    assert.equal(killed.status, 'KILLED');
    const survived = judge({ baseline: base, mutated: combineRuns([runSelection({ cwd: dir, selection: sel })]) });
    assert.equal(survived.status, 'SURVIVED');
    const crashed = judge({ baseline: base, mutated: combineRuns([runSelection({ cwd: crashedDir, selection: sel })]) });
    assert.equal(crashed.status, 'ERROR', 'a test file that cannot even load is not a kill');
    assert.match(crashed.detail, /unmutated run executed 3/);
    const failingBase = combineRuns([runSelection({ cwd: mutatedDir, selection: sel })]);
    assert.equal(judge({ baseline: failingBase, mutated: failingBase }).status, 'ERROR');
    assert.match(judge({ baseline: failingBase, mutated: failingBase }).detail, /unmutated/);
    const allSkipped = combineRuns([runSelection({ cwd: skipDir, selection: sel })]);
    const j = judge({ baseline: allSkipped, mutated: allSkipped });
    assert.equal(j.status, 'ERROR');
    assert.match(j.detail, /no test executed/);
    assert.equal(judge({ baseline: base, mutated: { ...base, timedOut: true, fail: 1, exitCode: null } }).status, 'ERROR');
    assert.equal(judge({ baseline: base, mutated: null }).status, 'ERROR');
    assert.equal(judge({ baseline: null, mutated: base }).status, 'ERROR');
  } finally { for (const d of [dir, mutatedDir, crashedDir, skipDir]) fs.rmSync(d, { recursive: true, force: true }); }
});

test('the catalogue keeps all 46 mutants and every one has a test plan made of known groups', () => {
  const expected = ['A1','A2','A3','A4','A5','A6','A7','A8','A9','B1','B2','B3','B4','B5','C1','C2','C3','C4','C5','C6','C7','C8','C9','D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','E1','E2','E3','E4','E5','E6','E7','F1','F2','G1'];
  assert.deepEqual(ids(MUTANTS), expected, 'no mutant may be removed, renamed or reordered to make the run faster');
  assert.doesNotThrow(() => validatePlans(MUTANTS, MUTANT_PLANS, TEST_GROUPS, { rootDir: ROOT }));
  for (const family of ['a', 'b', 'c']) {
    for (const mutant of MUTANTS.filter((m) => m.required === family)) {
      const groups = MUTANT_PLANS[mutant.id];
      const wanted = { a: ['retry', 'atomicity'], b: ['faults', 'retry'], c: ['validator'] }[family];
      assert.ok(groups.some((g) => wanted.includes(g)), `${mutant.id} (family ${family}) must run a ${wanted.join('/')} group`);
    }
  }
});

test('every test group matches real tests in the shipped files and passes on the unmutated source', () => {
  for (const [name, group] of Object.entries(TEST_GROUPS)) {
    const run = runSelection({ cwd: ROOT, selection: { file: group.file, pattern: group.pattern } });
    assert.ok(run.executed > 0, `group ${name} selects no executable test`);
    assert.equal(run.fail, 0, `group ${name} fails on the unmutated source: ${run.failing.join('; ')}`);
    assert.equal(run.exitCode, 0, `group ${name}`);
  }
});

test('the harness helpers use no timers, network or unseeded randomness', () => {
  for (const file of ['scripts/lib/mutation-plan.mjs', 'tests/mutation-plan.test.js', 'tests/mutation-harness-cli.test.js']) {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/'[^'\n]*'|"[^"\n]*"|`[^`]*`|\/\/[^\n]*/g, '');
    const forbidden = new RegExp(['set' + 'Timeout', 'set' + 'Interval', 'Math\\.' + 'random', 'fet' + 'ch\\(', 'node:' + 'http', 'node:' + 'net'].join('|'));
    assert.ok(!forbidden.test(text), file);
  }
});

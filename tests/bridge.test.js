import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialState } from '../src/core/agent.js';
import { loadPack } from '../src/core/content.js';
import { usableMappings, mappingFromItem, mappingsConflict, buildBridgeExercise, gradeBridgeAnswer, recordBridgeAttempt, recordBridgeReveal } from '../src/core/bridge.js';

const pack = loadPack();
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const item = (id, bridge, extra = {}) => ({ id, conceptId: `c_${id}`, bridge, ...extra });
const mapping = (n, status = 'UNREVIEWED_DRAFT') => ({ everydayOdia: `everyday ${n}`, schoolOdiaTerm: `school term ${n}`, englishTerm: `english term ${n}`, status });
const miniPack = (...bridges) => ({ items: bridges.map((bridge, index) => item(`Q${index + 1}`, bridge)) });

test('the pack yields eight distinct usable mappings', () => {
  const mappings = usableMappings(pack);
  assert.equal(mappings.length, 8);
  assert.equal(new Set(mappings.map((m) => m.key)).size, 8);
});

test('incomplete, placeholder and duplicate mappings are not usable', () => {
  assert.equal(mappingFromItem(item('X', { everydayOdia: '', schoolOdiaTerm: 'a', englishTerm: 'b' })), null);
  assert.equal(mappingFromItem(item('X', { everydayOdia: 'x', schoolOdiaTerm: '[review needed]', englishTerm: 'b' })), null);
  assert.equal(mappingFromItem(item('X', { everydayOdia: 'x', schoolOdiaTerm: 'a' })), null);
  assert.equal(mappingFromItem(item('X', undefined)), null);
  const dup = { items: [item('Q1', mapping(1)), item('Q2', { ...mapping(1), everydayOdia: 'a different sentence' }), item('Q3', mapping(3))] };
  assert.deepEqual(usableMappings(dup).map((m) => m.itemId), ['Q1', 'Q3']);
});

test('mappings that share a term conflict and cannot be options for each other', () => {
  const byId = Object.fromEntries(pack.items.map((i) => [i.id, mappingFromItem(i)]));
  assert.equal(mappingsConflict(byId.EL01, byId.EL02), true);   // share "open circuit"
  assert.equal(mappingsConflict(byId.EL07, byId.EL08), true);   // share "equivalent resistance"
  assert.equal(mappingsConflict(byId.EL03, byId.EL05), false);
  assert.equal(mappingsConflict(byId.EL03, byId.EL03), true);
});

test('every question in the pack yields a valid exercise: one correct option, two distinct distractors from other mappings', () => {
  for (const q of pack.items) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const ex = buildBridgeExercise({ pack, itemId: q.id, attempt });
      assert.equal(ex.enabled, true, `${q.id} attempt ${attempt}: ${ex.reason}`);
      assert.equal(ex.options.length, 3);
      assert.equal(ex.prompt, mappingFromItem(q).everydayOdia);
      const correct = ex.options.find((o) => o.id === ex.correctOptionId);
      assert.equal(correct.sourceItemId, q.id);
      assert.equal(ex.options.filter((o) => o.sourceItemId === q.id).length, 1);
      const byId = Object.fromEntries(pack.items.map((i) => [i.id, mappingFromItem(i)]));
      for (const a of ex.options) for (const b of ex.options) if (a !== b) assert.equal(mappingsConflict(byId[a.sourceItemId], byId[b.sourceItemId]), false, `${q.id}: ${a.sourceItemId} conflicts with ${b.sourceItemId}`);
    }
  }
});

test('the exercise only uses strings that already exist in the pack (nothing is invented)', () => {
  const allowed = new Set();
  for (const q of pack.items) for (const k of ['everydayOdia', 'schoolOdiaTerm', 'englishTerm']) allowed.add(mappingFromItem(q)[k]);
  for (const q of pack.items) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const ex = buildBridgeExercise({ pack, itemId: q.id, attempt });
      for (const text of [ex.prompt, ...ex.options.flatMap((o) => [o.schoolOdiaTerm, o.englishTerm]), ex.target.schoolOdiaTerm, ex.target.englishTerm]) assert.ok(allowed.has(text), `unexpected text: ${text}`);
    }
  }
});

test('the exercise is deterministic and rotates with the attempt number', () => {
  const a = buildBridgeExercise({ pack, itemId: 'EL03', attempt: 2 });
  const b = buildBridgeExercise({ pack, itemId: 'EL03', attempt: 2 });
  assert.deepEqual(a, b);
  const positions = [0, 1, 2, 3, 4, 5].map((n) => buildBridgeExercise({ pack, itemId: 'EL03', attempt: n }).correctOptionId);
  assert.deepEqual(positions, ['B1', 'B2', 'B3', 'B1', 'B2', 'B3']);
  const sets = new Set([0, 1, 2, 3, 4, 5].map((n) => buildBridgeExercise({ pack, itemId: 'EL03', attempt: n }).options.map((o) => o.sourceItemId).filter((id) => id !== 'EL03').sort().join('+')));
  assert.ok(sets.size >= 2, `distractor sets: ${[...sets].join(' | ')}`);
});

test('the exercise is disabled, with an explanation, when fewer than three distinct mappings exist', () => {
  const two = miniPack(mapping(1), mapping(2));
  const ex = buildBridgeExercise({ pack: two, itemId: 'Q1' });
  assert.equal(ex.enabled, false);
  assert.match(ex.reason, /at least 3 distinct mappings/);
  assert.match(ex.reason, /has 2/);
  const same = miniPack(mapping(1), mapping(1), mapping(1));
  assert.equal(buildBridgeExercise({ pack: same, itemId: 'Q1' }).enabled, false);
  const lacking = { items: [item('Q1', undefined), item('Q2', mapping(2)), item('Q3', mapping(3)), item('Q4', mapping(4))] };
  const noBridge = buildBridgeExercise({ pack: lacking, itemId: 'Q1' });
  assert.equal(noBridge.enabled, false);
  assert.match(noBridge.reason, /no complete bridge mapping/);
  assert.equal(buildBridgeExercise({ pack: lacking, itemId: 'MISSING' }).enabled, false);
});

test('the exercise is disabled when too few mappings differ from the target to avoid ambiguity', () => {
  const p = { items: [item('Q1', { everydayOdia: 'e1', schoolOdiaTerm: 'alpha / beta', englishTerm: 'one / two', status: 'REVIEWED' }), item('Q2', { everydayOdia: 'e2', schoolOdiaTerm: 'alpha', englishTerm: 'two / three', status: 'REVIEWED' }), item('Q3', mapping(3, 'REVIEWED'))] };
  const ex = buildBridgeExercise({ pack: p, itemId: 'Q1' });
  assert.equal(ex.enabled, false);
  assert.match(ex.reason, /Not enough clearly different mappings/);
});

test('grading is exact, and a wrong answer still reveals the source mapping', () => {
  const ex = buildBridgeExercise({ pack, itemId: 'EL05', attempt: 0 });
  const right = gradeBridgeAnswer(ex, ex.correctOptionId);
  assert.equal(right.correct, true);
  const wrongId = ex.options.find((o) => o.id !== ex.correctOptionId).id;
  const wrong = gradeBridgeAnswer(ex, wrongId);
  assert.equal(wrong.correct, false);
  assert.equal(wrong.reveal.sourceItemId, 'EL05');
  assert.equal(wrong.reveal.status, 'UNREVIEWED_DRAFT');
  assert.equal(gradeBridgeAnswer(ex, 'NOPE').ok, false);
  assert.equal(gradeBridgeAnswer({ enabled: false }, 'B1').ok, false);
});

test('unreviewed mappings keep the UNREVIEWED_DRAFT label; only a fully reviewed set drops it', () => {
  assert.equal(buildBridgeExercise({ pack, itemId: 'EL01' }).draft, true);
  const reviewed = miniPack(mapping(1, 'REVIEWED'), mapping(2, 'PUBLISHED'), mapping(3, 'REVIEWED'), mapping(4, 'REVIEWED'));
  assert.equal(buildBridgeExercise({ pack: reviewed, itemId: 'Q1' }).draft, false);
  const mixed = miniPack(mapping(1, 'REVIEWED'), mapping(2, 'UNREVIEWED_DRAFT'), mapping(3, 'REVIEWED'), mapping(4, 'REVIEWED'));
  assert.equal(buildBridgeExercise({ pack: mixed, itemId: 'Q1' }).draft, true);
});

test('an attempt is recorded in the existing decision trace and a per-question counter', () => {
  const state = initialState(pack);
  const ex = buildBridgeExercise({ pack, itemId: 'EL01', attempt: 0 });
  const before = state.trace.length;
  const wrongId = ex.options.find((o) => o.id !== ex.correctOptionId).id;
  const result = recordBridgeAttempt(state, ex, wrongId);
  assert.equal(result.correct, false);
  assert.equal(state.trace.length, before + 1);
  const line = state.trace.at(-1);
  assert.equal(line.type, 'bridge_practice_attempt');
  assert.equal(line.itemId, 'EL01');
  assert.equal(line.correct, false);
  assert.equal(line.contentStatus, 'UNREVIEWED_DRAFT');
  assert.equal(line.network, false);
  assert.deepEqual(line.optionOrder, ex.options.map((o) => o.sourceItemId));
  assert.equal(state.learner.bridgeAttempts.EL01, 1);
  recordBridgeAttempt(state, ex, ex.correctOptionId);
  assert.equal(state.learner.bridgeAttempts.EL01, 2);
  assert.equal(state.trace.at(-1).correct, true);
  const unchanged = state.trace.length;
  assert.equal(recordBridgeAttempt(state, ex, 'NOPE').ok, false);
  assert.equal(state.trace.length, unchanged);
});

test('revealing the source mapping is traced too', () => {
  const state = initialState(pack);
  const ex = buildBridgeExercise({ pack, itemId: 'EL03' });
  const result = recordBridgeReveal(state, ex);
  assert.equal(result.ok, true);
  assert.equal(state.trace.at(-1).type, 'bridge_mapping_revealed');
  assert.equal(state.trace.at(-1).sourceItemId, 'EL03');
});

test('Bridge Practice is offline by construction: no network or model API is referenced or called', () => {
  const source = fs.readFileSync(path.join(ROOT, 'src/core/bridge.js'), 'utf8');
  for (const forbidden of [/\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /navigator\./, /Math\.random/, /groq/i, /\/api\//]) assert.doesNotMatch(source, forbidden);
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = () => { calls += 1; throw new Error('network must not be used'); };
  try {
    const state = initialState(pack);
    const ex = buildBridgeExercise({ pack, itemId: 'EL04' });
    recordBridgeAttempt(state, ex, ex.correctOptionId);
    recordBridgeReveal(state, ex);
  } finally { globalThis.fetch = realFetch; }
  assert.equal(calls, 0);
});

// Iteration 10 (criterion P10-09 / backlog J07): deterministic fault-injection and property-style tests for the re-check queue,
// bounded retry, validator and save/restore invariants.
//
// Rules this file follows (a hygiene test at the bottom checks the forbidden tokens):
//  - no sleeps, timers, network or browser: every clock is injected as a number or an ISO string;
//  - no unseeded randomness: generated sequences use the in-file seeded PRNG below, and every assertion message carries the
//    seed and the operation trace so a failure can be replayed exactly;
//  - the production id generator reads the clock and a random source, so the id tests replace those two globals with
//    deterministic stubs for the duration of one call (fault injection) and always restore them.
//
// This is synthetic engineering evidence. It says nothing about learning gain, model accuracy or adaptive mastery.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { RETRY_POLICY, backoffDelayMs, isDue, dueEntries, nextDueAtMs, queueStatus, cycleAttemptsOf } from '../src/core/retry.js';
import { initialState, submitAnswer, recheckQueued, recordRecheckDeferred, manualRetryQueue, appendTrace } from '../src/core/agent.js';
import { proposeDiagnosis } from '../src/core/mockModel.js';
import { validateDiagnosis } from '../src/core/validator.js';
import { repairSavedRecord, LIMITS } from '../src/core/recovery.js';
import { createIndexedDbStorage, createMemoryStorage } from '../src/core/storage.js';
import { loadPack } from '../src/core/content.js';

const pack = loadPack();
const T0 = Date.parse('2026-10-14T06:00:00.000Z');
const iso = (ms) => new Date(ms).toISOString();
const EXPLANATION = 'A synthetic explanation that is long enough for the mock rule.';
const RETRY_FIELDS = ['cycleAttempts', 'needsAttention', 'nextAttemptAt', 'pausedAt', 'manualRetries'];
const json = (value) => JSON.parse(JSON.stringify(value));

// ---------------------------------------------------------------------------------------------------------------- helpers

// Small, well-known 32-bit generator. Same seed, same sequence, on every machine.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Replaces the clock and the random source used by the production id generator, runs fn, and always restores both.
function withIds(clock, random, fn) {
  const realNow = Date.now;
  const realRandom = Reflect.get(Math, 'random');
  Date.now = clock;
  Reflect.set(Math, 'random', random);
  try { return fn(); } finally { Date.now = realNow; Reflect.set(Math, 'random', realRandom); }
}

const newState = () => initialState(pack);
function submit(state, { itemId = state.learner.currentItemId, optionId = null, explanation = EXPLANATION, online = false, now = iso(T0) } = {}) {
  const item = pack.items.find((candidate) => candidate.id === itemId);
  return submitAnswer({ state, pack, itemId, optionId: optionId ?? item.options[0].id, explanation, online, now });
}
// What the "Continue" button does in public/app.js: the recommended question becomes current and the recommendation clears.
function continueToNext(state) {
  const id = state.learner.nextRecommendedItemId;
  if (!id) return false;
  const prior = state.learner.currentItemId;
  state.learner.currentItemId = id;
  state.learner.nextRecommendedItemId = null;
  appendTrace(state, { type: 'learner_applied_updated_plan', previousItemId: prior, currentItemId: id, reason: 'The learner explicitly accepted the updated recommendation.' });
  return true;
}
function queuedState(count = 1) {
  const state = newState();
  for (let n = 0; n < count; n++) { submit(state, { now: iso(T0 + n) }); if (n + 1 < count) continueToNext(state); }
  return state;
}
const foreignIdFor = (item) => {
  const mine = new Set(item.allowedMisconceptionIds);
  for (const other of pack.items) for (const id of other.allowedMisconceptionIds) if (!mine.has(id)) return id;
  throw new Error('the content pack has no foreign misconception id to inject');
};

// Test-side copy of the drain loop in public/app.js drainQueue(): only due entries, one provider call per entry, a rejected or
// thrown result registers a failure and stops the pass. The browser loop itself is exercised by the browser regression run.
function drain({ state, nowMs, provider, policy = RETRY_POLICY }) {
  const calls = [];
  for (const entry of state.queue.filter((candidate) => isDue(candidate, nowMs))) {
    const answer = state.answers.find((candidate) => candidate.id === entry.answerId);
    const item = pack.items.find((candidate) => candidate.id === entry.itemId);
    if (!answer || !item) { recheckQueued({ state, pack, queueId: entry.id, online: true, now: iso(nowMs), policy }); continue; }
    calls.push(entry.id);
    try {
      const proposal = provider({ item, answer, entry });
      const result = recheckQueued({ state, pack, queueId: entry.id, online: true, diagnosisOverride: proposal, trusted: false, provider: 'mock', now: iso(nowMs), policy });
      if (!result.drained) break;
    } catch (error) {
      recordRecheckDeferred({ state, queueId: entry.id, reason: error?.message ?? 'error', now: iso(nowMs), policy });
      break;
    }
  }
  return calls;
}
const goodProvider = ({ item, answer }) => proposeDiagnosis({ item, optionId: answer.optionId, explanation: answer.explanation });
const defineFault = (name, make) => ({ name, make });
// Every way a provider can fail or answer badly. `throws` faults model network errors and timeouts; the rest return something wrong.
const FAULTS = [
  defineFault('network_error', () => { throw new TypeError('Failed to fetch'); }),
  defineFault('http_503', () => { throw new Error('recheck_http_503'); }),
  defineFault('timeout', () => { throw new Error('recheck_timeout'); }),
  defineFault('unexpected_provider', () => { throw new Error('unexpected_provider'); }),
  defineFault('null_body', () => null),
  defineFault('undefined_body', () => undefined),
  defineFault('string_body', () => 'not json'),
  defineFault('array_body', () => []),
  defineFault('number_body', () => 42),
  defineFault('foreign_misconception_id', ({ item }) => ({ questionId: item.id, type: 'MISCONCEPTION', misconceptionId: foreignIdFor(item), confidence: 0.9, rationale: 'x' })),
  defineFault('made_up_misconception_id', ({ item }) => ({ questionId: item.id, type: 'MISCONCEPTION', misconceptionId: 'NOT_A_REAL_ID', confidence: 0.9, rationale: 'x' })),
  defineFault('wrong_question', ({ item }) => ({ questionId: `${item.id}-other`, type: 'NONE', misconceptionId: null, confidence: 0.9, rationale: 'x' })),
  defineFault('confidence_nan', ({ item }) => ({ questionId: item.id, type: 'NONE', misconceptionId: null, confidence: Number.NaN, rationale: 'x' })),
  defineFault('confidence_negative', ({ item }) => ({ questionId: item.id, type: 'NONE', misconceptionId: null, confidence: -0.1, rationale: 'x' })),
  defineFault('confidence_above_one', ({ item }) => ({ questionId: item.id, type: 'NONE', misconceptionId: null, confidence: 1.5, rationale: 'x' })),
  defineFault('confidence_string', ({ item }) => ({ questionId: item.id, type: 'NONE', misconceptionId: null, confidence: '0.9', rationale: 'x' })),
  defineFault('uncertain_with_misconception_id', ({ item }) => ({ questionId: item.id, type: 'UNCERTAIN', misconceptionId: item.allowedMisconceptionIds[0], confidence: 0.9, rationale: 'x' })),
  defineFault('none_with_misconception_id', ({ item }) => ({ questionId: item.id, type: 'NONE', misconceptionId: item.allowedMisconceptionIds[0], confidence: 0.9, rationale: 'x' })),
  defineFault('unknown_type', ({ item }) => ({ questionId: item.id, type: 'CONFIRMED', misconceptionId: null, confidence: 0.9, rationale: 'x' })),
  defineFault('rationale_too_long', ({ item }) => ({ questionId: item.id, type: 'NONE', misconceptionId: null, confidence: 0.9, rationale: 'x'.repeat(501) }))
];

// ------------------------------------------------------------------------------------- 1. identity and duplicate work

test('identity: ids of answers and queue entries are unique across many submissions, and every entry points at exactly one answer', () => {
  const state = queuedState(8);
  assert.equal(new Set(state.queue.map((entry) => entry.id)).size, 8);
  assert.equal(new Set(state.answers.map((answer) => answer.id)).size, 8);
  for (const entry of state.queue) {
    assert.equal(state.answers.filter((answer) => answer.id === entry.answerId).length, 1, `entry ${entry.id} must point at exactly one answer`);
    assert.equal(state.queue.filter((other) => other.answerId === entry.answerId).length, 1, 'one answer, one queue entry');
  }
});

test('identity (fault injection): ids stay unique when the clock and the random suffix repeat, so one re-check cannot swallow another entry', () => {
  withIds(() => 1_000, () => 0.5, () => {
    const state = newState();
    for (let n = 0; n < 6; n++) { submit(state, { now: iso(T0 + n) }); continueToNext(state); }
    assert.equal(new Set(state.answers.map((answer) => answer.id)).size, 6, 'answer ids must be unique even with a frozen clock and a frozen random source');
    assert.equal(new Set(state.queue.map((entry) => entry.id)).size, 6, 'queue ids must be unique even with a frozen clock and a frozen random source');
    for (const entry of state.queue) assert.equal(state.answers.filter((answer) => answer.id === entry.answerId).length, 1, 'each entry resolves to exactly one answer');
    const firstId = state.queue[0].id;
    const result = recheckQueued({ state, pack, queueId: firstId, online: true });
    assert.equal(result.drained, true);
    assert.equal(state.queue.length, 5, 're-checking one entry removes only that entry');
    assert.equal(state.answers.filter((answer) => String(answer.mode).startsWith('RECHECKED_')).length, 1, 'exactly one answer was re-checked');
  });
});

test('duplicate submit (double tap) is refused before anything changes: no extra answer, queue entry, session or trace line', () => {
  const state = queuedState(1);
  const before = json(state);
  assert.throws(() => submit(state), /already_answered_awaiting_continue/);
  assert.deepEqual(json(state), before, 'a refused duplicate leaves the whole state untouched');
  assert.equal(state.answers.length, 1);
  assert.equal(state.queue.length, 1);
  assert.equal(state.learner.sessionsRemaining, 9);
  continueToNext(state);
  submit(state, { now: iso(T0 + 5) });
  assert.equal(state.answers.length, 2, 'after the learner continues, the next question can be answered normally');
});

test('every refused submission is atomic: unknown question, unknown option, duplicate and full queue leave no partial change', () => {
  const full = newState();
  full.queue = Array.from({ length: LIMITS.queue }, (_, index) => ({ id: `q-${index}`, answerId: `a-${index}`, itemId: 'EL01', attempts: 0, status: 'PENDING_RECHECK' }));
  const answered = queuedState(1);
  const cases = [
    { name: 'question_not_found', state: newState(), args: { itemId: 'EL99' }, error: /question_not_found/ },
    { name: 'option_not_found', state: newState(), args: { itemId: 'EL01', optionId: 'Z' }, error: /option_not_found/ },
    { name: 'already_answered', state: answered, args: { itemId: 'EL01' }, error: /already_answered_awaiting_continue/ },
    { name: 'recheck_queue_full', state: full, args: { itemId: 'EL01' }, error: /recheck_queue_full/ }
  ];
  for (const c of cases) {
    const before = json(c.state);
    assert.throws(() => submitAnswer({ state: c.state, pack, itemId: c.args.itemId, optionId: c.args.optionId ?? 'A', explanation: EXPLANATION, online: false }), c.error, c.name);
    assert.deepEqual(json(c.state), before, `${c.name}: state must be byte-identical after the refusal`);
  }
});

test('capacity boundary: the 100th entry is accepted, the 101st is refused, and a drain frees room again', () => {
  const state = newState();
  state.queue = Array.from({ length: LIMITS.queue - 1 }, (_, index) => ({ id: `q-${index}`, answerId: `a-${index}`, itemId: 'EL01', attempts: 0, status: 'PENDING_RECHECK' }));
  submit(state, { itemId: 'EL01', now: iso(T0) });
  assert.equal(state.queue.length, LIMITS.queue);
  continueToNext(state);
  const before = json(state);
  assert.throws(() => submit(state, { now: iso(T0 + 1) }), /recheck_queue_full/);
  assert.deepEqual(json(state), before);
  const ownEntry = state.queue.at(-1);
  assert.equal(recheckQueued({ state, pack, queueId: ownEntry.id, online: true }).drained, true);
  submit(state, { now: iso(T0 + 2) });
  assert.equal(state.queue.length, LIMITS.queue, 'draining one entry made room for exactly one more');
});

test('a repeated failure report or a repeated manual retry never creates a second entry, answer or session', () => {
  const state = queuedState(1);
  const id = state.queue[0].id;
  const sessions = state.learner.sessionsRemaining;
  for (let i = 0; i < 12; i++) recordRecheckDeferred({ state, queueId: id, now: iso(T0 + i * 100_000) });
  for (let i = 0; i < 6; i++) manualRetryQueue({ state, queueId: id }), manualRetryQueue({ state });
  assert.equal(state.queue.length, 1);
  assert.equal(state.answers.length, 1);
  assert.equal(state.learner.sessionsRemaining, sessions);
  assert.equal(state.queue[0].id, id, 'the identity of the entry is stable');
});

// ------------------------------------------------------------------------------------- 2. provider faults keep the entry

for (const fault of FAULTS) {
  test(`fault ${fault.name}: the entry is not drained, the answer is untouched, one attempt is counted, and it recovers when the provider works`, () => {
    const state = queuedState(1);
    const entryId = state.queue[0].id;
    const answerBefore = json(state.answers[0]);
    const learnerBefore = json(state.learner);
    const calls = drain({ state, nowMs: T0, provider: fault.make });
    assert.equal(calls.length, 1, 'exactly one provider call for one due entry');
    assert.equal(state.queue.length, 1, `${fault.name}: the queue entry must stay`);
    assert.equal(state.queue[0].id, entryId);
    assert.deepEqual(json(state.answers[0]), answerBefore, `${fault.name}: a failed re-check must not change the stored answer or its diagnosis`);
    assert.deepEqual(json(state.learner), learnerBefore, `${fault.name}: a failed re-check must not change learner state`);
    assert.equal(state.queue[0].attempts, 1);
    assert.equal(state.queue[0].cycleAttempts, 1);
    assert.equal(state.queue[0].nextAttemptAt, iso(T0 + 5000), 'the first backoff is 5 seconds from the injected clock');
    assert.equal(isDue(state.queue[0], T0 + 4999), false);
    assert.equal(drain({ state, nowMs: T0 + 4999, provider: goodProvider }).length, 0, 'nothing is attempted before the backoff ends');
    assert.deepEqual(drain({ state, nowMs: T0 + 5000, provider: goodProvider }), [entryId], 'a working provider processes the same entry once the backoff ends');
    assert.equal(state.queue.length, 0);
    assert.equal(state.answers.length, 1);
    assert.match(state.answers[0].mode, /^RECHECKED_/);
  });
}

test('a rejected diagnosis never reaches the stored answer or the confirmed misconceptions, even when the caller marks the result trusted', () => {
  const item = pack.items[0];
  const foreign = foreignIdFor(item);
  for (const bad of [
    { questionId: item.id, type: 'MISCONCEPTION', misconceptionId: foreign, confidence: 0.99, rationale: 'x' },
    { questionId: item.id, type: 'UNCERTAIN', misconceptionId: item.allowedMisconceptionIds[0], confidence: 0.99, rationale: 'x' }
  ]) {
    const state = queuedState(1);
    const answerBefore = json(state.answers[0]);
    const result = recheckQueued({ state, pack, queueId: state.queue[0].id, online: true, diagnosisOverride: bad, trusted: true, now: iso(T0) });
    assert.equal(result.drained, false, JSON.stringify(bad));
    assert.deepEqual(json(state.answers[0]), answerBefore);
    assert.deepEqual(state.learner.confirmedMisconceptions, {});
    assert.equal(state.queue.length, 1);
  }
});

// Iteration 16: a low-confidence MISCONCEPTION or NONE is no longer a provider fault. It drains as "not sure" (UNCERTAIN) and, even when
// the caller marks the result trusted, it never confirms a misconception.
test('a low-confidence result drains as UNCERTAIN, counts no failed attempt and never confirms a misconception, even when trusted', () => {
  const item = pack.items[0];
  for (const low of [
    { questionId: item.id, type: 'MISCONCEPTION', misconceptionId: item.allowedMisconceptionIds[0], confidence: 0.2, rationale: 'x' },
    { questionId: item.id, type: 'NONE', misconceptionId: null, confidence: 0.64, rationale: 'x' }
  ]) {
    const state = queuedState(1);
    const result = recheckQueued({ state, pack, queueId: state.queue[0].id, online: true, diagnosisOverride: low, trusted: true, provider: 'gemini', now: iso(T0) });
    assert.equal(result.drained, true, JSON.stringify(low));
    assert.equal(state.queue.length, 0);
    assert.equal(state.answers[0].diagnosis.type, 'UNCERTAIN');
    assert.equal(state.answers[0].diagnosis.misconceptionId, null);
    assert.deepEqual(state.learner.confirmedMisconceptions, {});
  }
});

test('a missing diagnosis from the provider is a failed attempt, never a silent local substitute', () => {
  for (const diagnosisOverride of [null, undefined]) {
    const state = queuedState(1);
    const result = recheckQueued({ state, pack, queueId: state.queue[0].id, online: true, diagnosisOverride, provider: 'groq', now: iso(T0) });
    assert.equal(result.drained, false, `diagnosisOverride=${String(diagnosisOverride)} is a provider result that is missing, not permission to use the local rule`);
    assert.equal(state.queue.length, 1);
    assert.notEqual(state.answers[0].mode, 'RECHECKED_GROQ', 'an answer must not be labelled as re-checked by a provider that returned nothing');
    assert.equal(state.queue[0].attempts, 1);
  }
  const local = queuedState(1);
  assert.equal(recheckQueued({ state: local, pack, queueId: local.queue[0].id, online: true }).drained, true, 'with no override at all, the documented local rule still re-checks');
});

// ------------------------------------------------------------------------------------- 3. bounded retry and backoff

test('default policy: provider calls are exactly 5, at +5 s, +10 s, +20 s, +40 s, then the entry pauses and is never due again', () => {
  const state = queuedState(1);
  const id = state.queue[0].id;
  const attemptTimes = [];
  let now = T0;
  for (let guard = 0; guard < 50; guard++) {
    const calls = drain({ state, nowMs: now, provider: FAULTS[1].make });
    if (calls.length) attemptTimes.push((now - T0) / 1000);
    const next = nextDueAtMs(state, now);
    if (next === null) break;
    now = next;
  }
  assert.deepEqual(attemptTimes, [0, 5, 15, 35, 75], 'attempt offsets in seconds: 0, then 5, 10, 20, 40 s after each failure');
  const entry = state.queue[0];
  assert.equal(entry.id, id);
  assert.equal(entry.needsAttention, true);
  assert.equal(entry.cycleAttempts, RETRY_POLICY.maxAutomaticAttempts);
  assert.equal(entry.nextAttemptAt, null);
  for (const later of [0, 1, 60, 3600, 86_400 * 365]) assert.equal(drain({ state, nowMs: now + later * 1000, provider: goodProvider }).length, 0, 'a paused entry is never attempted automatically');
  assert.deepEqual(dueEntries(state, now + 10 ** 12), []);
  assert.equal(nextDueAtMs(state, now), null);
  assert.equal(state.queue.length, 1, 'pausing keeps the entry');
});

test('custom policies: the delay is base * factor^(n-1), never above maxDelayMs, and the number of provider calls equals maxAutomaticAttempts', () => {
  const policies = [
    { maxAutomaticAttempts: 8, baseDelayMs: 1000, factor: 3, maxDelayMs: 10_000 },
    { maxAutomaticAttempts: 1, baseDelayMs: 2000, factor: 2, maxDelayMs: 60_000 },
    { maxAutomaticAttempts: 6, baseDelayMs: 500, factor: 1, maxDelayMs: 60_000 },
    { maxAutomaticAttempts: 12, baseDelayMs: 7000, factor: 2, maxDelayMs: 30_000 }
  ];
  for (const policy of policies) {
    const state = queuedState(1);
    const gaps = [];
    let now = T0; let calls = 0;
    for (let guard = 0; guard < 100; guard++) {
      calls += drain({ state, nowMs: now, provider: FAULTS[1].make, policy }).length;
      const next = nextDueAtMs(state, now);
      if (next === null) break;
      gaps.push(next - now);
      now = next;
    }
    const label = JSON.stringify(policy);
    assert.equal(calls, policy.maxAutomaticAttempts, `provider calls for ${label}`);
    assert.equal(gaps.length, policy.maxAutomaticAttempts - 1, `scheduled waits for ${label}`);
    gaps.forEach((gap, index) => {
      const expected = Math.min(policy.maxDelayMs, policy.baseDelayMs * policy.factor ** index);
      assert.equal(gap, expected, `wait #${index + 1} for ${label}`);
      assert.ok(gap <= policy.maxDelayMs, `wait #${index + 1} must not exceed maxDelayMs for ${label}`);
    });
    assert.equal(state.queue[0].needsAttention, true, label);
  }
  assert.equal(backoffDelayMs(1000), RETRY_POLICY.maxDelayMs, 'a very large failure count is capped, not Infinity');
});

test('a paused entry is excluded from due work and from the next-attempt clock, but still counts as needing attention', () => {
  const state = queuedState(2);
  const [a, b] = state.queue.map((entry) => entry.id);
  for (let i = 0; i < RETRY_POLICY.maxAutomaticAttempts; i++) recordRecheckDeferred({ state, queueId: a, now: iso(T0 + i * 100_000) });
  const now = T0 + 10 ** 6;
  assert.deepEqual(dueEntries(state, now).map((entry) => entry.id), [b]);
  recordRecheckDeferred({ state, queueId: b, now: iso(now) });
  assert.equal(nextDueAtMs(state, now), now + 5000, 'only the waiting entry contributes to the next-attempt time');
  const status = queueStatus(state, now);
  assert.equal(status.paused, 1);
  assert.equal(status.waiting, 1);
  assert.equal(status.canRetry, true);
});

// ------------------------------------------------------------------------------------- 4. manual retry

test('manual retry changes only the retry fields of the chosen entry and nothing else in the state', () => {
  const state = queuedState(2);
  const [a, b] = state.queue.map((entry) => entry.id);
  for (let i = 0; i < RETRY_POLICY.maxAutomaticAttempts; i++) { recordRecheckDeferred({ state, queueId: a, reason: 'recheck_http_500', now: iso(T0 + i * 100_000) }); }
  recordRecheckDeferred({ state, queueId: b, now: iso(T0) });
  const before = json(state);
  const result = manualRetryQueue({ state, queueId: a, now: iso(T0 + 10 ** 7) });
  assert.equal(result.reset, 1);
  const after = json(state);
  const strip = (entry) => Object.fromEntries(Object.entries(entry).filter(([key]) => !RETRY_FIELDS.includes(key)));
  assert.deepEqual(after.queue.map(strip), before.queue.map(strip), 'every non-retry field of every entry, including history, is unchanged');
  assert.deepEqual(after.queue[1], before.queue[1], 'the other entry is untouched');
  assert.deepEqual(after.answers, before.answers);
  assert.deepEqual(after.learner, before.learner);
  assert.equal(after.queue[0].cycleAttempts, 0);
  assert.equal(after.queue[0].needsAttention, false);
  assert.equal(after.queue[0].nextAttemptAt, null);
  assert.equal('pausedAt' in after.queue[0], false);
  assert.equal(after.queue[0].manualRetries, 1);
  assert.equal(after.trace.length, before.trace.length + 1);
  assert.equal(after.trace.at(-1).type, 'recheck_manual_retry');
});

test('repeating a manual retry is a no-op: state is identical, no new trace line, no extra manual-retry count', () => {
  const state = queuedState(1);
  const id = state.queue[0].id;
  for (let i = 0; i < RETRY_POLICY.maxAutomaticAttempts; i++) recordRecheckDeferred({ state, queueId: id, now: iso(T0 + i * 100_000) });
  assert.equal(manualRetryQueue({ state, now: iso(T0 + 10 ** 7) }).reset, 1);
  const after = json(state);
  for (let i = 0; i < 5; i++) {
    assert.equal(manualRetryQueue({ state, now: iso(T0 + 10 ** 7 + i) }).reset, 0);
    assert.equal(manualRetryQueue({ state, queueId: id, now: iso(T0 + 10 ** 7 + i) }).reset, 0);
    assert.equal(manualRetryQueue({ state, queueId: 'q-does-not-exist' }).reset, 0);
  }
  assert.deepEqual(json(state), after);
});

test('a fresh entry that never failed is not reset by a manual retry', () => {
  const state = queuedState(1);
  const before = json(state);
  assert.equal(manualRetryQueue({ state }).reset, 0);
  assert.deepEqual(json(state), before);
});

test('after a pause, a manual retry gives one new bounded cycle: five more automatic attempts, then paused again', () => {
  const state = queuedState(1);
  const id = state.queue[0].id;
  const runCycle = (startMs) => {
    let now = startMs; let calls = 0;
    for (let guard = 0; guard < 50; guard++) {
      calls += drain({ state, nowMs: now, provider: FAULTS[1].make }).length;
      const next = nextDueAtMs(state, now);
      if (next === null) break;
      now = next;
    }
    return { calls, now };
  };
  const first = runCycle(T0);
  assert.equal(first.calls, 5);
  assert.equal(manualRetryQueue({ state, queueId: id, now: iso(first.now) }).reset, 1);
  const second = runCycle(first.now + 1000);
  assert.equal(second.calls, 5, 'the manual retry grants exactly one more cycle, not an unlimited one');
  assert.equal(state.queue[0].needsAttention, true);
  assert.equal(state.queue[0].attempts, 10);
  assert.equal(state.queue[0].manualRetries, 1);
  assert.equal(state.queue.length, 1);
  assert.equal(state.answers.length, 1);
});

// ------------------------------------------------------------------------------------- 5. success is exactly once

test('success processes an entry exactly once; a second attempt on the same id does nothing and counts nothing twice', () => {
  const state = queuedState(1);
  const id = state.queue[0].id;
  const item = pack.items[0];
  const diagnosis = { questionId: item.id, type: 'MISCONCEPTION', misconceptionId: item.allowedMisconceptionIds[1], confidence: 0.9, rationale: 'synthetic trusted check' };
  const first = recheckQueued({ state, pack, queueId: id, online: true, diagnosisOverride: diagnosis, trusted: true });
  assert.equal(first.drained, true);
  assert.equal(state.learner.confirmedMisconceptions[item.allowedMisconceptionIds[1]], 1);
  const afterFirst = json(state);
  const second = recheckQueued({ state, pack, queueId: id, online: true, diagnosisOverride: diagnosis, trusted: true });
  assert.equal(second.drained, false);
  assert.equal(second.reason, 'queue_item_not_found');
  assert.deepEqual(json(state), afterFirst, 'a repeated success changes nothing, including the confirmed counts');
  assert.equal(drain({ state, nowMs: T0 + 10 ** 9, provider: goodProvider }).length, 0);
});

test('background re-check never switches the current question, discards the learner draft or spends a session', () => {
  const state = queuedState(3);
  continueToNext(state); // the learner is now on a later question and is typing
  const drafts = { [state.learner.currentItemId]: { optionId: 'B', explanation: 'half-written thought that must survive' } };
  const draftsBefore = json(drafts);
  const currentBefore = state.learner.currentItemId;
  const sessionsBefore = state.learner.sessionsRemaining;
  const answersBefore = state.answers.length;
  recordRecheckDeferred({ state, queueId: state.queue[0].id, now: iso(T0) });
  assert.equal(drain({ state, nowMs: T0 + 1000, provider: goodProvider }).length, 2, 'the waiting entry is skipped; the two fresh entries are processed');
  assert.equal(state.queue.length, 1);
  assert.equal(drain({ state, nowMs: T0 + 5000, provider: goodProvider }).length, 1);
  assert.equal(state.queue.length, 0);
  assert.equal(state.learner.currentItemId, currentBefore, 'the question on screen is not switched by a background re-check');
  assert.deepEqual(drafts, draftsBefore, 'the draft is not touched');
  assert.equal(state.learner.sessionsRemaining, sessionsBefore);
  assert.equal(state.answers.length, answersBefore);
  assert.ok(state.learner.nextRecommendedItemId, 'the plan may be updated; applying it is the learner’s choice');
  assert.equal(state.trace.filter((event) => event.type === 'recheck_complete').every((event) => event.currentItemPreserved === true), true);
});

test('background re-check leaves the question on screen alone even when its recommendation points to a different question', () => {
  const state = newState();
  submit(state, { online: true, now: iso(T0) });
  const onScreen = state.learner.currentItemId;
  assert.equal(drain({ state, nowMs: T0 + 1000, provider: goodProvider }).length, 1);
  assert.notEqual(state.learner.nextRecommendedItemId, onScreen, 'precondition: the updated plan names a different question, so a wrong switch would be visible');
  assert.equal(state.learner.currentItemId, onScreen, 'the question on screen is not switched by a background re-check');
});

test('uncertainty is never turned into a confirmed misconception, by the local rule or by a trusted provider result', () => {
  const state = queuedState(1);
  const id = state.queue[0].id;
  const item = pack.items[0];
  const uncertain = { questionId: item.id, type: 'UNCERTAIN', misconceptionId: null, confidence: 0.95, rationale: 'The explanation is unclear.' };
  assert.equal(recheckQueued({ state, pack, queueId: id, online: true, diagnosisOverride: uncertain, trusted: true }).drained, true);
  assert.deepEqual(state.learner.confirmedMisconceptions, {});
  assert.equal(state.answers[0].diagnosis.type, 'UNCERTAIN');
  assert.equal(state.answers[0].diagnosis.misconceptionId, null);
  for (const explanation of ['', '   ', 'short', 'x'.repeat(7)]) {
    const s = newState();
    const { answer } = submit(s, { explanation });
    assert.equal(answer.diagnosis.type, 'UNCERTAIN', `explanation ${JSON.stringify(explanation)}`);
    assert.deepEqual(s.learner.confirmedMisconceptions, {});
  }
});

// ------------------------------------------------------------------------------------- 6. save and restore

function richState() {
  const state = queuedState(4);
  const [waiting, paused, legacy] = [state.queue[0].id, state.queue[1].id, state.queue[2].id];
  recordRecheckDeferred({ state, queueId: waiting, reason: 'recheck_http_503', now: iso(T0) });
  for (let i = 0; i < RETRY_POLICY.maxAutomaticAttempts; i++) recordRecheckDeferred({ state, queueId: paused, now: iso(T0 + i * 100_000) });
  const legacyEntry = state.queue.find((entry) => entry.id === legacy);
  for (const key of RETRY_FIELDS) delete legacyEntry[key]; // as saved by a version before bounded retry
  legacyEntry.attempts = 3;
  return { state, waiting, paused, legacy };
}

test('JSON save and restore preserves answers, drafts and every queue entry, and the restored entries behave identically', () => {
  const { state } = richState();
  const drafts = { EL07: { optionId: 'C', explanation: 'a draft for another question' }, EL08: { optionId: 'A', explanation: '' } };
  const record = json({ state, drafts });
  assert.deepEqual(record.state, state, 'the state survives JSON exactly (no undefined-only fields, no lost entries)');
  const repaired = repairSavedRecord(record, pack);
  assert.deepEqual(repaired.repairs, [], 'a valid record needs no repair');
  assert.deepEqual(repaired.state, state);
  assert.deepEqual(repaired.drafts, drafts);
  for (const offset of [0, 1000, 4999, 5000, 5001, 60_000, 10 ** 8]) {
    const at = T0 + offset;
    assert.deepEqual(dueEntries(repaired.state, at).map((entry) => entry.id), dueEntries(state, at).map((entry) => entry.id), `due set at +${offset} ms`);
    assert.deepEqual(queueStatus(repaired.state, at), queueStatus(state, at));
  }
});

test('legacy entries without retry fields are recoverable: kept by repair, due now, bounded when they fail, and drained on success', () => {
  const legacy = { id: 'q-legacy', answerId: 'ans-legacy', itemId: 'EL01', createdAt: iso(T0), attempts: 3, status: 'PENDING_PROVIDER_RECHECK' };
  const answer = { id: 'ans-legacy', itemId: 'EL01', optionId: 'A', explanation: EXPLANATION, submittedAt: iso(T0), mode: 'LOCAL_PROPOSAL_PENDING_RECHECK', diagnosis: { questionId: 'EL01', type: 'MISCONCEPTION', misconceptionId: 'CURRENT_ACCUMULATES', confidence: 0.78, rationale: 'x', provisional: true }, reviewStatus: 'UNREVIEWED_DRAFT' };
  const base = newState();
  base.answers.push(answer); base.queue.push(legacy);
  const restored = repairSavedRecord(json({ state: base, drafts: {} }), pack);
  assert.deepEqual(restored.repairs, []);
  assert.deepEqual(restored.state.queue[0], legacy, 'no retry fields are invented on restore');
  assert.equal(isDue(restored.state.queue[0], T0), true);
  assert.equal(cycleAttemptsOf(restored.state.queue[0]), 3, 'the old attempts count is the starting point');
  const failing = json(restored.state);
  assert.equal(drain({ state: failing, nowMs: T0, provider: FAULTS[1].make }).length, 1);
  assert.equal(failing.queue[0].cycleAttempts, 4);
  assert.equal(failing.queue[0].needsAttention, false);
  const retryAt = Date.parse(failing.queue[0].nextAttemptAt);
  assert.equal(retryAt, T0 + backoffDelayMs(4), 'the wait continues from the old attempts count');
  assert.equal(drain({ state: failing, nowMs: retryAt - 1, provider: goodProvider }).length, 0);
  assert.equal(drain({ state: failing, nowMs: retryAt, provider: FAULTS[1].make }).length, 1);
  assert.equal(failing.queue[0].needsAttention, true, 'a legacy entry becomes bounded within the policy');
  assert.equal(manualRetryQueue({ state: failing }).reset, 1);
  assert.equal(drain({ state: failing, nowMs: retryAt + 1000, provider: goodProvider }).length, 1);
  assert.equal(failing.queue.length, 0);
  const happy = json(restored.state);
  assert.equal(drain({ state: happy, nowMs: T0, provider: goodProvider }).length, 1);
  assert.equal(happy.queue.length, 0);
  assert.equal(happy.answers.length, 1);
});

test('a legacy entry missing its basic fields is kept, not dropped, and then works', () => {
  const state = newState();
  state.answers.push({ id: 'ans-1', itemId: 'EL01', optionId: 'A', explanation: EXPLANATION, submittedAt: iso(T0), mode: 'OFFLINE_RULE', diagnosis: { questionId: 'EL01', type: 'UNCERTAIN', misconceptionId: null, confidence: 0.4, rationale: 'x', provisional: true }, reviewStatus: 'UNREVIEWED_DRAFT' });
  state.queue.push({ id: 'q-1', answerId: 'ans-1', itemId: 'EL01' });
  const repaired = repairSavedRecord(json({ state, drafts: {} }), pack);
  assert.equal(repaired.state.queue.length, 1);
  assert.equal(repaired.state.queue[0].id, 'q-1');
  assert.equal(drain({ state: repaired.state, nowMs: T0, provider: goodProvider }).length, 1);
  assert.equal(repaired.state.queue.length, 0);
});

// ------------------------------------------------------------------------------------- 7. corruption and repair

const WEIRD_RECORDS = [
  null, undefined, 0, 1, true, 'text', [], [1, 2], {}, { state: null }, { state: [] }, { state: 'x' }, { state: {} }, { state: { learner: [] } },
  { state: { learner: null, answers: null, queue: null, trace: null } },
  { state: { learner: { sessionsRemaining: 'ten', confirmedMisconceptions: [], seenItemIds: 'x', currentItemId: 5 }, answers: {}, queue: 'q', trace: 7 }, drafts: [] },
  { state: { queue: [null, 5, 'q', [], {}, { id: '' }, { id: 'q', answerId: 'a' }, { id: 'q', answerId: 'a', itemId: 'EL01', cycleAttempts: -1, nextAttemptAt: 'not a date', needsAttention: 'yes', attempts: 'many', status: 7, createdAt: 'never' }] } },
  { state: { answers: [null, { id: 'a' }, { id: 'a', itemId: 'EL01', optionId: 'A', mode: 'x', diagnosis: { questionId: 'EL01', type: 'MAGIC' } }], trace: [null, { type: 5 }, { nope: true }] } },
  { state: { learner: { sessionsRemaining: 99, nextRecommendedItemId: 12 } }, drafts: { EL01: 'text', EL02: { optionId: 7 }, '': {} } },
  { get state() { throw new Error('hostile getter'); } }
];

test('malformed records of every shape are repaired or replaced without throwing, and the repaired record is a fixed point', () => {
  for (const [index, weird] of WEIRD_RECORDS.entries()) {
    let first;
    assert.doesNotThrow(() => { first = repairSavedRecord(weird, pack); }, `weird record #${index}`);
    assert.ok(Array.isArray(first.state.answers) && Array.isArray(first.state.queue) && Array.isArray(first.state.trace), `#${index} arrays`);
    assert.ok(first.state.trace.length <= LIMITS.trace);
    const again = repairSavedRecord({ state: first.state, drafts: first.drafts }, pack);
    assert.deepEqual(again.repairs, [], `#${index}: repairing an already repaired record repairs nothing`);
    assert.deepEqual(again.state, first.state, `#${index}: and changes nothing`);
    assert.deepEqual(again.drafts, first.drafts);
    for (const entry of first.state.queue) {
      assert.ok(typeof entry.id === 'string' && entry.id && typeof entry.answerId === 'string' && typeof entry.itemId === 'string', `#${index} queue entry shape`);
      assert.ok(Number.isInteger(entry.attempts) && entry.attempts >= 0);
      assert.ok(entry.nextAttemptAt === undefined || entry.nextAttemptAt === null || !Number.isNaN(Date.parse(entry.nextAttemptAt)));
      assert.ok(entry.needsAttention === undefined || typeof entry.needsAttention === 'boolean');
      assert.ok(entry.cycleAttempts === undefined || (Number.isInteger(entry.cycleAttempts) && entry.cycleAttempts >= 0));
    }
    assert.doesNotThrow(() => { queueStatus(first.state, T0); dueEntries(first.state, T0); nextDueAtMs(first.state, T0); }, `#${index}: the retry helpers accept the repaired state`);
  }
});

test('repair keeps every usable record around the damage and removes duplicates and junk', () => {
  const { state } = richState();
  const record = json({ state, drafts: { EL05: { optionId: 'A', explanation: 'kept draft' } } });
  record.state.queue.push({ id: 'q-bad' }, 7, null, { ...record.state.queue[0] });
  record.state.answers.push('junk', { ...record.state.answers[0] });
  record.state.trace.push(null, { nope: true });
  record.drafts.EL06 = 'junk';
  const repaired = repairSavedRecord(record, pack);
  assert.deepEqual(repaired.state.queue.map((entry) => entry.id), state.queue.map((entry) => entry.id), 'valid entries kept, in order, without duplicates');
  assert.deepEqual(repaired.state.queue, state.queue, 'and unchanged');
  assert.deepEqual(repaired.state.answers, state.answers);
  assert.deepEqual(repaired.drafts, { EL05: { optionId: 'A', explanation: 'kept draft' } });
  assert.ok(repaired.repairs.length > 0);
  assert.equal(repaired.state.trace.at(-1).type, 'saved_state_repaired');
  assert.equal(repaired.state.learner.sessionsRemaining, state.learner.sessionsRemaining);
});

test('trace stays within its limit through repair, even when the saved trace is far over it', () => {
  const state = queuedState(1);
  const record = json({ state, drafts: {} });
  record.state.trace = Array.from({ length: 5000 }, (_, index) => ({ type: 'filler', id: `t-${index}`, at: iso(T0) }));
  const repaired = repairSavedRecord(record, pack);
  assert.ok(repaired.state.trace.length <= LIMITS.trace, `trace length ${repaired.state.trace.length}`);
  assert.equal(repaired.state.trace.at(-1).type, 'saved_state_repaired');
  assert.equal(repaired.state.trace.some((event) => event.id === 't-4999'), true, 'the newest saved events are the ones kept');
});

// seeded fuzz: damage random fields of a rich valid record and demand the same properties
const JUNK = [null, 0, -1, 1e9, 1.5, 'x', '', 'not-a-date', [], {}, true, false, 'y'.repeat(300), { id: 5 }, [1, 2], 2 ** 53];
function pathsOf(value, prefix = []) {
  const out = [];
  if (value && typeof value === 'object') for (const key of Object.keys(value)) { out.push([...prefix, key]); out.push(...pathsOf(value[key], [...prefix, key])); }
  return out;
}
function setAt(root, path, value, remove) {
  let target = root;
  for (const key of path.slice(0, -1)) target = target[key];
  if (remove) { if (Array.isArray(target)) target.splice(Number(path.at(-1)), 1); else delete target[path.at(-1)]; } else target[path.at(-1)] = value;
}

test('seeded fuzz: random damage to a valid record never throws, never leaves an unusable entry, is idempotent, and spares untouched entries', () => {
  for (let seed = 1; seed <= 150; seed++) {
    const rng = mulberry32(seed);
    const { state } = richState();
    const record = json({ state, drafts: { EL05: { optionId: 'A', explanation: 'draft' } } });
    const paths = pathsOf(record);
    const edits = [];
    for (let n = 0, count = 1 + Math.floor(rng() * 3); n < count; n++) {
      const path = paths[Math.floor(rng() * paths.length)];
      const remove = rng() < 0.3;
      const junk = JUNK[Math.floor(rng() * JUNK.length)];
      try { setAt(record, path, structuredClone(junk), remove); edits.push(`${remove ? 'del' : 'set'} ${path.join('.')}${remove ? '' : `=${JSON.stringify(junk)}`}`); } catch { /* an earlier edit removed this path */ }
    }
    const ctx = `seed=${seed} edits=[${edits.join(' | ')}]`;
    let first;
    assert.doesNotThrow(() => { first = repairSavedRecord(record, pack); }, ctx);
    const again = repairSavedRecord({ state: first.state, drafts: first.drafts }, pack);
    assert.deepEqual(again.repairs, [], `${ctx}: second repair must repair nothing`);
    assert.deepEqual(again.state, first.state, `${ctx}: second repair must change nothing`);
    const ids = first.state.queue.map((entry) => entry.id);
    assert.equal(new Set(ids).size, ids.length, `${ctx}: queue ids unique`);
    assert.ok(first.state.queue.length <= LIMITS.queue && first.state.trace.length <= LIMITS.trace, ctx);
    assert.doesNotThrow(() => {
      const copy = structuredClone(first.state);
      drain({ state: copy, nowMs: T0 + 10 ** 9, provider: goodProvider });
      queueStatus(copy, T0);
    }, `${ctx}: a repaired state can be processed`);
    json(first); // must be serialisable
  }
});

test('oversized saved collections are cut to their limits: the newest answers and the oldest queue entries are kept', () => {
  const state = newState();
  const answers = Array.from({ length: LIMITS.answers + 200 }, (_, index) => ({ id: `ans-${index}`, itemId: 'EL01', optionId: 'A', explanation: '', mode: 'OFFLINE_RULE', diagnosis: { questionId: 'EL01', type: 'UNCERTAIN', misconceptionId: null, confidence: 0.4, rationale: 'x', provisional: true } }));
  const queue = Array.from({ length: LIMITS.queue + 50 }, (_, index) => ({ id: `q-${index}`, answerId: `ans-${index}`, itemId: 'EL01', attempts: 0, status: 'PENDING_RECHECK' }));
  const repaired = repairSavedRecord(json({ state: { ...state, answers, queue }, drafts: {} }), pack);
  assert.equal(repaired.state.answers.length, LIMITS.answers);
  assert.equal(repaired.state.answers.at(-1).id, `ans-${LIMITS.answers + 199}`, 'the newest answers are the ones kept');
  assert.equal(repaired.state.queue.length, LIMITS.queue);
  assert.equal(repaired.state.queue[0].id, 'q-0', 'the oldest queue entries are the ones kept');
  assert.ok(repaired.repairs.includes('answers_trimmed') && repaired.repairs.includes('queue_trimmed'));
});

// A tiny synchronous-style fake IndexedDB (microtasks only, no timers) with a switchable write failure.
function microtaskIdb({ failWritesAfter = Infinity } = {}) {
  const data = new Map();
  let writes = 0;
  const db = {
    objectStoreNames: { contains: () => true },
    transaction() {
      const tx = {};
      tx.objectStore = () => ({
        get(key) { const request = {}; queueMicrotask(() => { request.result = data.get(key); request.onsuccess?.(); }); return request; },
        put(value, key) { writes += 1; if (writes > failWritesAfter) throw new DOMException('quota exceeded while saving learner text', 'QuotaExceededError'); data.set(key, structuredClone(value)); queueMicrotask(() => tx.oncomplete?.()); },
        delete(key) { data.delete(key); queueMicrotask(() => tx.oncomplete?.()); }
      });
      return tx;
    }
  };
  return { data, open() { const request = {}; queueMicrotask(() => { request.result = db; request.onsuccess?.(); }); return request; } };
}

test('persistence: a saved record comes back as an independent copy with the whole queue and retry state, and repair finds nothing to fix', async () => {
  const { state } = richState();
  const record = { state, drafts: { EL05: { optionId: 'B', explanation: 'unsent draft' } } };
  const storage = createMemoryStorage();
  await storage.save(record);
  const loaded = await storage.load();
  assert.deepEqual(loaded, record);
  loaded.state.queue.length = 0; loaded.drafts.EL05.explanation = 'changed after loading';
  assert.deepEqual(await storage.load(), record, 'changing a loaded copy never changes the stored record');
  const restored = repairSavedRecord(await storage.load(), pack);
  assert.deepEqual(restored.repairs, []);
  assert.equal(restored.state.queue.length, 4);
  assert.deepEqual(restored.drafts, record.drafts);
});

test('persistence fault: when a write is rejected, the older durable record is left alone, the newest state stays available in memory with its whole queue, and the reason holds no learner text', async () => {
  const fake = microtaskIdb({ failWritesAfter: 1 });
  const storage = createIndexedDbStorage(fake);
  const first = queuedState(1);
  await storage.save({ state: first, drafts: {} });
  assert.equal(storage.mode, 'indexeddb');
  const second = queuedState(2);
  recordRecheckDeferred({ state: second, queueId: second.queue[0].id, now: iso(T0) });
  await storage.save({ state: second, drafts: {} });
  assert.equal(storage.mode, 'memory', 'the failed write is visible as a downgrade');
  assert.equal(storage.persistent, false);
  assert.equal(storage.status.lastError, 'QuotaExceededError');
  assert.equal(/learner|text/.test(JSON.stringify(storage.status)), false, 'only the error name is kept');
  assert.deepEqual(fake.data.get('session').state.queue.map((entry) => entry.id), first.queue.map((entry) => entry.id), 'the older durable record is not overwritten or half-written');
  const latest = await storage.load();
  assert.deepEqual(latest.state.queue, second.queue, 'the newest queue, including retry state, is what the session sees');
  const restored = repairSavedRecord(latest, pack);
  assert.deepEqual(restored.repairs, []);
  assert.equal(drain({ state: restored.state, nowMs: T0 + 5000, provider: goodProvider }).length, 2, 'and both entries can still be processed');
  assert.equal(restored.state.queue.length, 0);
});

// ------------------------------------------------------------------------------------- 8. trace bounds and coalescing

test('adjacent repeats of the same failure for the same entry coalesce; any intervening event keeps them separate and readable', () => {
  const state = queuedState(2);
  const [a, b] = state.queue.map((entry) => entry.id);
  const deferred = () => state.trace.filter((event) => event.type === 'recheck_deferred');
  const at = (n) => iso(T0 + n * 1000);
  recordRecheckDeferred({ state, queueId: a, now: at(1) });
  recordRecheckDeferred({ state, queueId: a, now: at(2) });
  assert.equal(deferred().length, 1, 'same entry, adjacent: one line');
  assert.equal(deferred()[0].repeats, 2);
  assert.equal(deferred()[0].attempts, 2, 'the line reports the latest attempt count');
  recordRecheckDeferred({ state, queueId: b, now: at(3) });
  assert.equal(deferred().length, 2, 'a different entry is a new line');
  recordRecheckDeferred({ state, queueId: a, now: at(4) });
  assert.equal(deferred().length, 3, 'A, B, A does not collapse A across B');
  manualRetryQueue({ state, queueId: a, now: at(5) });
  recordRecheckDeferred({ state, queueId: a, now: at(6) });
  assert.equal(deferred().length, 4, 'a manual retry between failures keeps them separate');
  assert.deepEqual(state.trace.slice(-2).map((event) => event.type), ['recheck_manual_retry', 'recheck_deferred']);
  recheckQueued({ state, pack, queueId: a, online: true, diagnosisOverride: { questionId: 'other', type: 'NONE', misconceptionId: null, confidence: 1, rationale: 'x' }, now: at(7) });
  const lastTwo = state.trace.slice(-2).map((event) => event.type);
  assert.deepEqual(lastTwo, ['recheck_deferred', 'recheck_rejected'], 'a rejection after a provider failure is its own kind of line');
});

test('trace is bounded by 200 lines under thousands of failures, keeps the newest events, and pauses are reported once per entry', () => {
  const state = queuedState(3);
  const ids = state.queue.map((entry) => entry.id);
  for (let i = 0; i < 3000; i++) {
    recordRecheckDeferred({ state, queueId: ids[i % 3], now: iso(T0 + i * 1000) });
    assert.ok(state.trace.length <= 200, `trace length ${state.trace.length} after ${i + 1} failures`);
  }
  assert.equal(state.trace.length, 200);
  assert.equal(state.trace.at(-1).queueId, ids[(3000 - 1) % 3], 'the newest event is kept');
  assert.equal(state.trace.some((event) => event.type === 'answer_submitted'), false, 'oldest events leave first (documented first-in, first-out window)');
  assert.equal(state.queue.length, 3);
  assert.ok(state.queue.every((entry) => entry.needsAttention === true));
});

// ------------------------------------------------------------------------------------- 9. validator

test('validator: every own misconception id is accepted and every id that belongs only to a different question is rejected', () => {
  for (const item of pack.items) {
    const own = new Set(item.allowedMisconceptionIds);
    for (const id of own) assert.equal(validateDiagnosis({ questionId: item.id, type: 'MISCONCEPTION', misconceptionId: id, confidence: 0.8, rationale: 'ok' }, item).ok, true, `${item.id} accepts ${id}`);
    const foreign = [...new Set(pack.items.flatMap((other) => other.allowedMisconceptionIds))].filter((id) => !own.has(id));
    assert.ok(foreign.length > 0, 'the pack has foreign ids to test against');
    for (const id of foreign) {
      const result = validateDiagnosis({ questionId: item.id, type: 'MISCONCEPTION', misconceptionId: id, confidence: 0.99, rationale: 'ok' }, item);
      assert.equal(result.ok, false, `${item.id} must reject foreign id ${id}`);
      assert.equal(result.reason, 'misconception_not_allowed');
    }
    for (const other of pack.items.filter((candidate) => candidate.id !== item.id)) {
      assert.equal(validateDiagnosis({ questionId: other.id, type: 'NONE', misconceptionId: null, confidence: 0.9, rationale: 'ok' }, item).reason, 'question_mismatch');
    }
  }
});

test('validator, exhaustive grid: accepted if and only if the documented contract holds, and an accepted result never confirms uncertainty', () => {
  const item = pack.items[0];
  const allowed = item.allowedMisconceptionIds;
  const tops = [undefined, null, 'string', 7, []];
  const questionIds = [item.id, 'EL02', undefined, 5, ''];
  const types = ['MISCONCEPTION', 'NONE', 'UNCERTAIN', 'misconception', 'CONFIRMED', undefined, null];
  const ids = [allowed[0], allowed.at(-1), foreignIdFor(item), '', null, undefined, 7, '__proto__', 'constructor'];
  const confidences = [0, 0.25, 0.64, 0.65, 0.66, 1, -0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY, '0.9', null, undefined];
  const rationales = ['ok', '', 'x'.repeat(500), 'x'.repeat(501), 7, undefined];
  const contract = (raw) => raw !== null && typeof raw === 'object' && !Array.isArray(raw)
    && raw.questionId === item.id
    && ['MISCONCEPTION', 'NONE', 'UNCERTAIN'].includes(raw.type)
    && (raw.type === 'MISCONCEPTION' ? typeof raw.misconceptionId === 'string' && allowed.includes(raw.misconceptionId) : raw.misconceptionId == null)
    && typeof raw.confidence === 'number' && Number.isFinite(raw.confidence) && raw.confidence >= 0 && raw.confidence <= 1
    && typeof raw.rationale === 'string' && raw.rationale.length <= 500;
  // Iteration 16: below 0.65 a MISCONCEPTION or NONE is accepted only as UNCERTAIN.
  let accepted = 0; let rejected = 0;
  for (const top of tops) {
    assert.equal(validateDiagnosis(top, item).ok, false, `non-object ${String(top)}`);
    assert.equal(validateDiagnosis(top, item).reason, 'result_not_object', `non-object ${String(top)}`);
  }
  for (const questionId of questionIds) for (const type of types) for (const misconceptionId of ids) for (const confidence of confidences) for (const rationale of rationales) {
    const raw = { questionId, type, misconceptionId, confidence, rationale };
    const result = validateDiagnosis(raw, item);
    const expected = contract(raw);
    if (result.ok !== expected) assert.fail(`validator disagreed with the contract for ${JSON.stringify(raw)}: ok=${result.ok}, expected ${expected}`);
    if (result.ok) {
      accepted += 1;
      if (result.value.type === 'UNCERTAIN') assert.equal(result.value.misconceptionId, null, 'uncertainty must not carry a misconception id');
      if (result.value.type === 'MISCONCEPTION') assert.ok(allowed.includes(result.value.misconceptionId));
      if (raw.type !== 'UNCERTAIN' && raw.confidence < 0.65) assert.equal(result.value.type, 'UNCERTAIN', `low confidence must become UNCERTAIN: ${JSON.stringify(raw)}`);
      if (raw.type !== 'UNCERTAIN' && raw.confidence >= 0.65) assert.equal(result.value.type, raw.type);
      assert.ok(Object.isFrozen(result.value), 'an accepted result is immutable');
    } else rejected += 1;
  }
  assert.ok(accepted >= 50 && rejected > 10_000, `grid covered both outcomes (accepted=${accepted}, rejected=${rejected})`);
});

// ------------------------------------------------------------------------------------- 10. generated operation sequences

const OPS = [['submit', 3], ['continue', 2], ['fail', 4], ['advance', 4], ['manual', 2], ['succeed', 3], ['save', 2], ['corrupt', 1]];
const OP_TOTAL = OPS.reduce((sum, [, weight]) => sum + weight, 0);
const ADVANCES = [500, 1000, 5000, 10_000, 20_000, 40_000, 60_000, 3_600_000];
const SHORT = ['', 'short', 'x'.repeat(7)];

function runSequence(seed, steps) {
  const rng = mulberry32(seed);
  const pick = (list) => list[Math.floor(rng() * list.length)];
  // Fully deterministic ids for the whole run: the id generator's clock and random source come from the seed.
  // Every fourth seed freezes both, so id uniqueness has to come from the code, not from luck.
  const frozen = seed % 4 === 0;
  let idClock = 1_000_000;
  const idRng = mulberry32(seed ^ 0x9E3779B9);
  return withIds(frozen ? () => 1_000_000 : () => (idClock += 1), frozen ? () => 0.5 : idRng, () => {
    const trace = [];
    const ctx = () => `seed=${seed} ops=[${trace.join(' > ')}]`;
    const fail = (message) => assert.fail(`${message}  ${ctx()}`);
    const need = (condition, message) => { if (!condition) fail(message); };

    let state = newState();
    let drafts = {};
    let clock = T0;
    const seenQueueIds = new Set();
    const pending = new Set();
    const drained = new Set();
    const callsSinceReset = new Map();
    let submits = 0;
    let expectedCurrent = state.learner.currentItemId;
    let draftSnapshot = json(drafts);
    const maxAuto = RETRY_POLICY.maxAutomaticAttempts;

    const invariants = (op) => {
      const qids = state.queue.map((entry) => entry.id);
      need(new Set(qids).size === qids.length, `after ${op}: duplicate queue ids`);
      const aids = state.answers.map((answer) => answer.id);
      need(new Set(aids).size === aids.length, `after ${op}: duplicate answer ids`);
      need(qids.length === pending.size && qids.every((id) => pending.has(id)), `after ${op}: queue [${qids.length}] differs from the expected pending set [${pending.size}]`);
      need(state.answers.length === submits, `after ${op}: ${state.answers.length} answers but ${submits} accepted submissions`);
      need(state.learner.sessionsRemaining === Math.max(0, 10 - submits), `after ${op}: sessions ${state.learner.sessionsRemaining} after ${submits} submissions`);
      need(state.trace.length <= 200, `after ${op}: trace length ${state.trace.length}`);
      need(state.learner.currentItemId === expectedCurrent, `after ${op}: current question changed to ${state.learner.currentItemId}, expected ${expectedCurrent}`);
      need(JSON.stringify(drafts) === JSON.stringify(draftSnapshot), `after ${op}: drafts changed`);
      need(Object.keys(state.learner.confirmedMisconceptions).length === 0, `after ${op}: a provisional result confirmed a misconception`);
      for (const entry of state.queue) {
        const owners = state.answers.filter((answer) => answer.id === entry.answerId);
        need(owners.length === 1 && owners[0].itemId === entry.itemId, `after ${op}: entry ${entry.id} does not resolve to exactly one matching answer`);
        need(state.queue.filter((other) => other.answerId === entry.answerId).length === 1, `after ${op}: two entries for one answer`);
        const cycle = cycleAttemptsOf(entry);
        need(cycle <= maxAuto, `after ${op}: cycleAttempts ${cycle} exceeds ${maxAuto}`);
        if (entry.needsAttention === true) {
          need(entry.nextAttemptAt === null, `after ${op}: a paused entry still has nextAttemptAt`);
          need(cycle === maxAuto, `after ${op}: paused after only ${cycle} attempts`);
          need(isDue(entry, clock + 10 ** 12) === false, `after ${op}: a paused entry is due`);
        } else if (cycle > 0) {
          need(entry.nextAttemptAt && !Number.isNaN(Date.parse(entry.nextAttemptAt)), `after ${op}: a waiting entry has no valid nextAttemptAt`);
          const gap = Date.parse(entry.nextAttemptAt) - Date.parse(entry.lastAttemptAt);
          need(gap === backoffDelayMs(cycle) && gap <= RETRY_POLICY.maxDelayMs, `after ${op}: wait of ${gap} ms after failure ${cycle}, expected ${backoffDelayMs(cycle)}`);
        }
        need((callsSinceReset.get(entry.id) ?? 0) <= maxAuto, `after ${op}: ${callsSinceReset.get(entry.id)} automatic provider calls in one cycle`);
      }
      need(dueEntries(state, clock).every((entry) => entry.needsAttention !== true), `after ${op}: dueEntries returned a paused entry`);
    };

    for (let step = 0; step < steps; step++) {
      let roll = rng() * OP_TOTAL;
      let op = OPS[0][0];
      for (const [name, weight] of OPS) { if (roll < weight) { op = name; break; } roll -= weight; }

      if (op === 'submit') {
        const itemId = state.learner.currentItemId;
        const item = pack.items.find((candidate) => candidate.id === itemId);
        const optionId = pick(item.options).id;
        const explanation = rng() < 0.25 ? pick(SHORT) : EXPLANATION;
        const online = rng() < 0.5;
        const guarded = state.answers.at(-1)?.itemId === itemId && state.learner.nextRecommendedItemId && state.learner.nextRecommendedItemId !== itemId;
        trace.push(`submit(${itemId}${optionId}${online ? ',on' : ''}${guarded ? ',dup' : ''})`);
        const snapshot = json(state);
        let result = null; let error = null;
        try { result = submitAnswer({ state, pack, itemId, optionId, explanation, online, now: iso(clock) }); } catch (caught) { error = caught; }
        if (guarded || state.queue.length >= LIMITS.queue) {
          need(error !== null, 'a guarded or over-capacity submission must be refused');
          need(JSON.stringify(state) === JSON.stringify(snapshot), 'a refused submission changed the state');
        } else {
          need(error === null, `submission unexpectedly refused: ${error?.message}`);
          const entry = state.queue.at(-1);
          need(frozen || !seenQueueIds.has(entry.id), 'queue id reused');
          seenQueueIds.add(entry.id); pending.add(entry.id); submits += 1; expectedCurrent = itemId;
          drained.delete(entry.id); callsSinceReset.delete(entry.id); // frozen-id runs may reuse an id after its old entry was drained: a new generation
          need(entry.answerId === result.answer.id, 'new entry does not point at the new answer');
        }
      } else if (op === 'continue') {
        trace.push('continue');
        if (continueToNext(state)) {
          expectedCurrent = state.learner.currentItemId;
          drafts = { ...drafts, [expectedCurrent]: { optionId: pick(['A', 'B', 'C']), explanation: `draft-${step}` } };
          draftSnapshot = json(drafts);
        }
      } else if (op === 'fail') {
        const fault = pick(FAULTS);
        trace.push(`fail(${fault.name})`);
        const before = json({ queue: state.queue, answers: state.answers });
        const calls = drain({ state, nowMs: clock, provider: fault.make });
        for (const id of calls) callsSinceReset.set(id, (callsSinceReset.get(id) ?? 0) + 1);
        need(calls.length <= 1, 'a failing pass stops after the first failure');
        need(state.queue.length === before.queue.length, `${fault.name}: queue length changed from ${before.queue.length} to ${state.queue.length}`);
        need(JSON.stringify(state.answers) === JSON.stringify(before.answers), `${fault.name}: an answer changed during a failed re-check`);
        if (calls.length) {
          const was = before.queue.find((entry) => entry.id === calls[0]);
          const now = state.queue.find((entry) => entry.id === calls[0]);
          need(now && now.attempts === (was.attempts ?? 0) + 1, `${fault.name}: attempts did not increase by exactly one`);
        }
      } else if (op === 'advance') {
        const by = pick(ADVANCES);
        trace.push(`advance(${by})`);
        clock += by;
      } else if (op === 'manual') {
        const target = rng() < 0.5 || !state.queue.length ? null : pick(state.queue).id;
        trace.push(`manual(${target ?? 'all'})`);
        const before = json(state);
        const result = manualRetryQueue({ state, queueId: target, now: iso(clock) });
        for (const entry of state.queue) if (!target || entry.id === target) callsSinceReset.set(entry.id, 0);
        need(state.queue.length === before.queue.length && state.answers.length === before.answers.length, 'manual retry changed the number of entries or answers');
        need(JSON.stringify(state.learner) === JSON.stringify(before.learner), 'manual retry changed learner state');
        const again = manualRetryQueue({ state, queueId: target, now: iso(clock) });
        need(result.reset === 0 || again.reset === 0, 'a second manual retry reset something again');
      } else if (op === 'succeed') {
        trace.push('succeed');
        const calls = drain({ state, nowMs: clock, provider: goodProvider });
        for (const id of calls) callsSinceReset.set(id, (callsSinceReset.get(id) ?? 0) + 1);
        for (const id of calls) {
          need(!drained.has(id), `entry ${id} was processed twice`);
          if (!state.queue.some((entry) => entry.id === id)) {
            drained.add(id); pending.delete(id); callsSinceReset.delete(id);
          }
        }
        need(state.answers.every((answer) => answer.diagnosis.provisional === true), 'an untrusted re-check produced a non-provisional diagnosis');
      } else if (op === 'save') {
        trace.push('save+restore');
        const record = json({ state, drafts });
        need(JSON.stringify(record.state) === JSON.stringify(state), 'JSON round trip lost or changed state');
        const restored = repairSavedRecord(record, pack);
        need(restored.repairs.length === 0, `a valid saved record needed repair: ${restored.repairs.join(',')}`);
        need(JSON.stringify(restored.state) === JSON.stringify(state) && JSON.stringify(restored.drafts) === JSON.stringify(drafts), 'restore changed the state or drafts');
        state = restored.state; drafts = restored.drafts;
      } else if (op === 'corrupt') {
        trace.push('corrupt+repair');
        const record = json({ state, drafts });
        const valid = json(state);
        record.state.queue.push({ id: 'q-junk' }, 5, null);
        if (valid.queue.length) record.state.queue.push({ ...valid.queue[0] });
        record.state.answers.push('junk');
        record.state.trace.push(null, { nope: true });
        let repaired;
        try { repaired = repairSavedRecord(record, pack); } catch (caught) { fail(`repair threw: ${caught.message}`); }
        need(JSON.stringify(repaired.state.queue) === JSON.stringify(valid.queue), 'repair lost, altered or reordered a valid queue entry');
        need(JSON.stringify(repaired.state.answers) === JSON.stringify(valid.answers), 'repair lost or altered a valid answer');
        need(JSON.stringify(repaired.drafts) === JSON.stringify(drafts), 'repair lost a valid draft');
        const second = repairSavedRecord({ state: repaired.state, drafts: repaired.drafts }, pack);
        need(second.repairs.length === 0 && JSON.stringify(second.state) === JSON.stringify(repaired.state), 'repair is not idempotent');
        state = repaired.state; drafts = repaired.drafts;
      }
      invariants(op);
    }
    return { submits, drained: drained.size, pending: pending.size };
  });
}

test('generated operation sequences keep every queue, retry, restore and repair invariant (seeded, replayable)', () => {
  let submits = 0; let drained = 0;
  const started = process.hrtime.bigint();
  for (let seed = 1; seed <= 120; seed++) {
    const outcome = runSequence(seed, 90);
    submits += outcome.submits; drained += outcome.drained;
  }
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
  assert.ok(submits > 300, `the sequences must exercise many submissions (got ${submits})`);
  assert.ok(drained > 100, `the sequences must exercise many successful re-checks (got ${drained})`);
  assert.ok(elapsedMs < 10_000, `generated sequences took ${Math.round(elapsedMs)} ms; the target is under 10 s`);
});

test('a fixed enumerated table of operation sequences, written out by hand, reaches the pause, the manual retry and the recovery', () => {
  const table = [
    { name: 'fail x5 then manual retry then success', steps: ['submit', 'fail', 'wait5', 'fail', 'wait10', 'fail', 'wait20', 'fail', 'wait40', 'fail', 'idle', 'manual', 'succeed'] },
    { name: 'save while waiting, restore, wait, succeed', steps: ['submit', 'fail', 'save', 'idle-short', 'succeed', 'wait5', 'succeed'] },
    { name: 'save while paused, restore, manual retry, succeed', steps: ['submit', 'fail', 'wait5', 'fail', 'wait10', 'fail', 'wait20', 'fail', 'wait40', 'fail', 'save', 'manual', 'succeed'] },
    { name: 'two entries, only the first fails', steps: ['submit', 'continue', 'submit', 'fail', 'succeed-late'] }
  ];
  for (const row of table) {
    const state = newState();
    let clock = T0; let current = state;
    const expectedAnswers = row.steps.filter((step) => step === 'submit').length;
    const done = [];
    for (const step of row.steps) {
      done.push(step);
      const ctx = `${row.name}: ${done.join(' > ')}`;
      if (step === 'submit') submit(current, { now: iso(clock) });
      else if (step === 'continue') continueToNext(current);
      else if (step === 'fail') drain({ state: current, nowMs: clock, provider: FAULTS[1].make });
      else if (step.startsWith('wait')) clock += Number(step.slice(4)) * 1000;
      else if (step === 'idle') clock += 24 * 3_600_000;
      else if (step === 'idle-short') clock += 1000;
      else if (step === 'manual') manualRetryQueue({ state: current, now: iso(clock) });
      else if (step === 'save') { const restored = repairSavedRecord(json({ state: current, drafts: {} }), pack); assert.deepEqual(restored.repairs, [], ctx); current = restored.state; }
      else if (step === 'succeed') drain({ state: current, nowMs: clock, provider: goodProvider });
      else if (step === 'succeed-late') { clock += 10_000; drain({ state: current, nowMs: clock, provider: goodProvider }); }
      assert.equal(current.answers.length <= expectedAnswers, true, ctx);
    }
    assert.equal(current.answers.length, expectedAnswers, `${row.name}: no answer was lost or duplicated`);
    assert.equal(current.queue.length, 0, `${row.name}: everything was eventually processed exactly once`);
    assert.ok(current.answers.every((answer) => /^RECHECKED_/.test(answer.mode)), `${row.name}: every answer re-checked`);
  }
});

// ------------------------------------------------------------------------------------- 11. hygiene of this file

test('this file uses no timers, network, browser or unseeded randomness', () => {
  const source = fs.readFileSync(new URL(import.meta.url), 'utf8');
  const forbidden = [['Math', '\\.', 'random'], ['set', 'Timeout'], ['set', 'Interval'], ['fet', 'ch\\('], ['XML', 'HttpRequest'], ['puppe', 'teer'], ['play', 'wright'], ['node:', 'http'], ['node:', 'net']]
    .map((parts) => new RegExp(parts.join('')));
  for (const pattern of forbidden) assert.equal(pattern.test(source), false, `forbidden token ${pattern}`);
});

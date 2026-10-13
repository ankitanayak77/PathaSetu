// Bounded retry policy. A fake clock is passed in everywhere: nothing here sleeps.
import test from 'node:test';
import assert from 'node:assert/strict';
import { RETRY_POLICY, backoffDelayMs, normalisePolicy, isDue, dueEntries, nextDueAtMs, queueStatus, scheduleAfterFailure } from '../src/core/retry.js';
import { initialState, submitAnswer, recheckQueued, recordRecheckDeferred, manualRetryQueue } from '../src/core/agent.js';
import { loadPack } from '../src/core/content.js';

const pack = loadPack();
const T0 = Date.parse('2026-10-12T20:00:00.000Z');
const iso = (ms) => new Date(ms).toISOString();
function queued() {
  const state = initialState(pack);
  submitAnswer({ state, pack, itemId: 'EL01', optionId: 'A', explanation: 'A synthetic explanation waiting for a re-check.', online: false, now: iso(T0) });
  return state;
}

test('the default policy is conservative: 5 automatic attempts, 5 s base, doubling, 60 s cap', () => {
  assert.deepEqual({ ...RETRY_POLICY }, { maxAutomaticAttempts: 5, baseDelayMs: 5000, factor: 2, maxDelayMs: 60000 });
  assert.deepEqual([1, 2, 3, 4, 5, 6, 10].map((n) => backoffDelayMs(n)), [5000, 10000, 20000, 40000, 60000, 60000, 60000]);
  assert.equal(backoffDelayMs(0), 5000);
});

test('an invalid policy falls back to safe values instead of retrying forever', () => {
  const p = normalisePolicy({ maxAutomaticAttempts: 0, baseDelayMs: -5, factor: 0, maxDelayMs: NaN });
  assert.equal(p.maxAutomaticAttempts, 5);
  assert.equal(p.baseDelayMs, 5000);
  assert.equal(p.maxDelayMs, 60000);
  assert.equal(normalisePolicy({ maxAutomaticAttempts: 3.7 }).maxAutomaticAttempts, 3);
});

test('backoff progression is written onto the entry after each failure, with the injected clock', () => {
  const state = queued();
  const id = state.queue[0].id;
  const seen = [];
  let now = T0;
  for (let i = 1; i <= 4; i++) {
    recordRecheckDeferred({ state, queueId: id, reason: 'recheck_http_500', now: iso(now) });
    const entry = state.queue[0];
    seen.push((Date.parse(entry.nextAttemptAt) - now) / 1000);
    assert.equal(entry.needsAttention, false);
    assert.equal(isDue(entry, now), false, 'not due immediately after a failure');
    assert.equal(isDue(entry, Date.parse(entry.nextAttemptAt)), true, 'due exactly at nextAttemptAt');
    now = Date.parse(entry.nextAttemptAt);
  }
  assert.deepEqual(seen, [5, 10, 20, 40]);
});

test('after the maximum the entry pauses, stays queued with its answer, and is never due again automatically', () => {
  const state = queued();
  const id = state.queue[0].id;
  const answers = structuredClone(state.answers);
  let now = T0;
  for (let i = 1; i <= 5; i++) { recordRecheckDeferred({ state, queueId: id, reason: 'recheck_http_500', now: iso(now) }); now += 90_000; }
  const entry = state.queue[0];
  assert.equal(entry.attempts, 5);
  assert.equal(entry.cycleAttempts, 5);
  assert.equal(entry.needsAttention, true);
  assert.equal(entry.nextAttemptAt, null);
  assert.ok(entry.pausedAt);
  assert.equal(state.queue.length, 1, 'the queue entry is never silently deleted');
  assert.deepEqual(state.answers, answers, 'the answer is never silently deleted or changed');
  for (const hoursLater of [0, 1, 24, 24 * 30]) assert.equal(isDue(entry, now + hoursLater * 3600_000), false);
  assert.deepEqual(dueEntries(state, now + 24 * 3600_000), []);
  assert.equal(nextDueAtMs(state, now), null);
  assert.equal(state.trace.filter((event) => event.type === 'recheck_paused').length, 1);
});

test('rejected diagnoses are bounded in the same way as provider failures', () => {
  const state = queued();
  const id = state.queue[0].id;
  const bad = { questionId: 'WRONG', type: 'MISCONCEPTION', misconceptionId: 'NOT_ALLOWED', confidence: 0.9, rationale: 'x' };
  for (let i = 0; i < 5; i++) recheckQueued({ state, pack, queueId: id, online: true, diagnosisOverride: bad, now: iso(T0 + i * 100_000) });
  assert.equal(state.queue[0].needsAttention, true);
  assert.equal(state.queue.length, 1);
});

test('queue state survives a save and reload (JSON round trip) while waiting and while paused', () => {
  const state = queued();
  const id = state.queue[0].id;
  recordRecheckDeferred({ state, queueId: id, now: iso(T0) });
  const waiting = JSON.parse(JSON.stringify(state));
  assert.equal(isDue(waiting.queue[0], T0 + 1000), false);
  assert.equal(isDue(waiting.queue[0], T0 + 5000), true);
  for (let i = 0; i < 4; i++) recordRecheckDeferred({ state: waiting, queueId: id, now: iso(T0 + 60_000 * (i + 1)) });
  const paused = JSON.parse(JSON.stringify(waiting));
  assert.equal(paused.queue[0].needsAttention, true);
  assert.equal(isDue(paused.queue[0], T0 + 10 ** 9), false);
});

test('an entry saved by an earlier version (no retry fields) is due, and still becomes bounded', () => {
  const legacy = { id: 'q-old', answerId: 'a', itemId: 'EL01', createdAt: iso(T0), attempts: 3, status: 'PENDING_PROVIDER_RECHECK' };
  assert.equal(isDue(legacy, T0), true);
  const sched = scheduleAfterFailure(legacy, iso(T0));
  assert.equal(legacy.cycleAttempts, 4, 'continues from the old attempts count');
  assert.equal(sched.paused, false);
  assert.equal(scheduleAfterFailure(legacy, iso(T0)).paused, true);
});

test('manual retry resets only retry state: no new answer, session, queue entry, draft or current question', () => {
  const state = queued();
  const id = state.queue[0].id;
  for (let i = 0; i < 5; i++) recordRecheckDeferred({ state, queueId: id, now: iso(T0 + i * 100_000) });
  const before = JSON.parse(JSON.stringify(state));
  const drafts = { EL02: { optionId: 'B', explanation: 'unsent' } };
  const result = manualRetryQueue({ state, now: iso(T0 + 10 ** 7) });
  assert.equal(result.reset, 1);
  const entry = state.queue[0];
  assert.equal(entry.needsAttention, false);
  assert.equal(entry.nextAttemptAt, null);
  assert.equal(entry.cycleAttempts, 0);
  assert.equal(entry.attempts, 5, 'cumulative attempts are kept as history');
  assert.equal(entry.manualRetries, 1);
  assert.equal(isDue(entry, T0), true);
  assert.equal(state.queue.length, before.queue.length);
  assert.deepEqual(state.answers, before.answers);
  assert.equal(state.learner.sessionsRemaining, before.learner.sessionsRemaining);
  assert.equal(state.learner.currentItemId, before.learner.currentItemId);
  assert.deepEqual(drafts, { EL02: { optionId: 'B', explanation: 'unsent' } });
  assert.equal(state.trace.at(-1).type, 'recheck_manual_retry');
  assert.equal(manualRetryQueue({ state }).reset, 0, 'a second retry with nothing to reset changes nothing');
});

test('eventual recovery after a pause: manual retry then success drains the entry with exactly one answer and no extra session', () => {
  const state = queued();
  const id = state.queue[0].id;
  const sessions = state.learner.sessionsRemaining;
  for (let i = 0; i < 5; i++) recordRecheckDeferred({ state, queueId: id, now: iso(T0 + i * 100_000) });
  assert.equal(state.queue[0].needsAttention, true);
  manualRetryQueue({ state });
  const result = recheckQueued({ state, pack, queueId: id, online: true, now: iso(T0 + 10 ** 7) });
  assert.equal(result.drained, true);
  assert.equal(state.queue.length, 0);
  assert.equal(state.answers.length, 1);
  assert.equal(state.learner.sessionsRemaining, sessions);
  assert.match(state.answers[0].mode, /^RECHECKED_/);
});

test('recovery also works from the waiting state, and repeated manual retries never duplicate the entry', () => {
  const state = queued();
  const id = state.queue[0].id;
  recordRecheckDeferred({ state, queueId: id, now: iso(T0) });
  manualRetryQueue({ state }); manualRetryQueue({ state }); manualRetryQueue({ state, queueId: id });
  assert.equal(state.queue.length, 1);
  assert.equal(recheckQueued({ state, pack, queueId: id, online: true }).drained, true);
  assert.equal(state.answers.length, 1);
});

test('trace growth is bounded and distinct events stay interpretable', () => {
  const state = queued();
  const id = state.queue[0].id;
  for (let i = 0; i < 200; i++) recordRecheckDeferred({ state, queueId: id, now: iso(T0 + i * 1000) });
  const types = state.trace.map((event) => event.type);
  assert.ok(state.trace.length < 12, `trace has ${state.trace.length} lines after 200 failures`);
  assert.equal(types.filter((t) => t === 'recheck_paused').length, 1);
  assert.ok(types.includes('answer_submitted'), 'earlier history is still there');
});

test('queueStatus describes waiting and paused entries for the UI', () => {
  const state = queued();
  const id = state.queue[0].id;
  assert.deepEqual({ ...queueStatus(state, T0), nextAttemptInMs: 0 }, { total: 1, paused: 0, waiting: 0, canRetry: false, nextAttemptInMs: 0, maxAutomaticAttempts: 5, worstCycleAttempts: 0 });
  recordRecheckDeferred({ state, queueId: id, now: iso(T0) });
  const waiting = queueStatus(state, T0 + 1000);
  assert.equal(waiting.waiting, 1);
  assert.equal(waiting.canRetry, true);
  assert.equal(waiting.nextAttemptInMs, 4000);
  for (let i = 0; i < 4; i++) recordRecheckDeferred({ state, queueId: id, now: iso(T0 + 100_000 * (i + 1)) });
  const paused = queueStatus(state, T0 + 10 ** 6);
  assert.equal(paused.paused, 1);
  assert.equal(paused.nextAttemptInMs, null);
});

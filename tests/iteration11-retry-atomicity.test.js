import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduleAfterFailure } from '../src/core/retry.js';
import { initialState, submitAnswer, recordRecheckDeferred, recheckQueued } from '../src/core/agent.js';
import { loadPack } from '../src/core/content.js';

const pack = loadPack();
const NOW = '2026-10-14T04:00:00.000Z';
const iso = (ms) => new Date(ms).toISOString();

function makeQueued() {
  const state = initialState(pack);
  submitAnswer({ state, pack, itemId: pack.items[0].id, optionId: pack.items[0].options[0].id, explanation: 'Synthetic test explanation.', online: false, now: NOW });
  return state;
}

function clone(value) { return structuredClone(value); }

const invalidTimes = [null, '', 'not-a-clock', '2026-02-31T25:61:00.000Z', '999999-01-01T00:00:00.000Z'];

test('scheduleAfterFailure rejects malformed timestamps before mutating any retry field', () => {
  for (const now of [undefined, ...invalidTimes]) {
    const entry = { id: 'q-test', attempts: 2, cycleAttempts: 1, nextAttemptAt: '2026-10-14T04:00:10.000Z', needsAttention: false, pausedAt: undefined, lastAttemptAt: 'old', lastFailure: 'old' };
    const before = clone(entry);
    assert.throws(() => scheduleAfterFailure(entry, now), /invalid_retry_timestamp|valid ISO timestamp|timestamp/i, `input=${String(now)}`);
    assert.deepEqual(entry, before, `entry mutated for input=${String(now)}`);
  }
});

test('recordRecheckDeferred is atomic when the injected clock is invalid', () => {
  for (const now of invalidTimes) {
    const state = makeQueued();
    // Put an entry into a partially retried state to ensure existing data is preserved.
    recordRecheckDeferred({ state, queueId: state.queue[0].id, now: NOW, reason: 'first-failure' });
    const before = clone(state);
    assert.throws(() => recordRecheckDeferred({ state, queueId: state.queue[0].id, now, reason: 'bad-clock' }), /invalid_retry_timestamp|valid ISO timestamp|timestamp/i, `input=${String(now)}`);
    assert.deepEqual(state, before, `state mutated for input=${String(now)}`);
  }
});

test('invalid timestamps are rejected before pausing an entry at the automatic retry limit', () => {
  const state = makeQueued();
  const id = state.queue[0].id;
  for (let i = 0; i < 4; i++) recordRecheckDeferred({ state, queueId: id, now: iso(Date.parse(NOW) + i * 100_000) });
  const before = clone(state);
  assert.throws(() => recordRecheckDeferred({ state, queueId: id, now: 'invalid-attempt-five' }), /invalid_retry_timestamp|valid ISO timestamp|timestamp/i);
  assert.deepEqual(state, before, 'malformed time must not increment the counter or pause the entry');
});

test('a provider diagnosis rejected by the validator leaves the queue state unchanged when its clock is invalid', () => {
  const state = makeQueued();
  const before = clone(state);
  const item = pack.items[0];
  const bad = { questionId: 'WRONG', type: 'MISCONCEPTION', misconceptionId: 'NOT_ALLOWED', confidence: 0.99, rationale: 'Synthetic invalid diagnosis.' };
  assert.throws(() => recheckQueued({ state, pack, queueId: state.queue[0].id, online: true, diagnosisOverride: bad, now: 'broken-clock' }), /invalid_retry_timestamp|valid ISO timestamp|timestamp/i);
  assert.deepEqual(state, before);
});

test('a valid ISO timestamp retains the existing bounded retry behaviour', () => {
  const entry = { id: 'q-valid', attempts: 0 };
  const result = scheduleAfterFailure(entry, NOW);
  assert.equal(result.paused, false);
  assert.equal(entry.cycleAttempts, 1);
  assert.equal(entry.nextAttemptAt, '2026-10-14T04:00:05.000Z');
});

test('the shipped eight-question pack refuses a duplicate answer before the learner continues', () => {
  assert.equal(pack.items.length, 8, 'this test pins the shipped pack, not a hypothetical single-question pack');
  const state = makeQueued();
  const item = pack.items[0];
  const before = clone(state);
  assert.throws(() => submitAnswer({ state, pack, itemId: item.id, optionId: item.options[0].id, explanation: 'Duplicate tap.', online: false, now: NOW }), /already_answered_awaiting_continue/);
  assert.deepEqual(state, before, 'duplicate submission should not add an answer, queue entry, session decrement or trace event');
});

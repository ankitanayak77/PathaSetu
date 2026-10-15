import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudLearnerId, fromCloudAttempt, mergeCloudAttempts, toCloudAttempt } from '../src/core/cloudProgress.js';

const localAnswer = (overrides = {}) => ({
  id: 'ans-abc123', itemId: 'EL01', optionId: 'B', explanation: 'A private learner explanation that must not leave the browser.',
  submittedAt: '2026-10-15T12:30:00.000Z', mode: 'RECHECKED_MOCK',
  diagnosis: { type: 'MISCONCEPTION', misconceptionId: 'series_current', rationale: 'private model rationale', confidence: 0.8 },
  ...overrides
});

test('cloud projection is allowlisted and never includes free text or rationale', () => {
  const projected = toCloudAttempt(localAnswer());
  assert.deepEqual(Object.keys(projected).sort(), ['diagnosisType', 'itemId', 'misconceptionId', 'optionId', 'schemaVersion', 'submittedAt'].sort());
  assert.equal(projected.diagnosisType, 'MISCONCEPTION');
  assert.equal('explanation' in projected, false);
  assert.equal('rationale' in projected, false);
});

test('invalid and incomplete answer records do not sync', () => {
  assert.equal(toCloudAttempt(null), null);
  assert.equal(toCloudAttempt(localAnswer({ id: '../guardian' })), null);
  assert.equal(toCloudAttempt(localAnswer({ submittedAt: 'yesterday' })), null);
  assert.equal(toCloudAttempt(localAnswer({ optionId: '' })), null);
  assert.equal(toCloudAttempt(localAnswer({ diagnosis: { type: 'MISCONCEPTION', misconceptionId: null } })), null);
});

test('cloud merge is idempotent, keeps device explanations local, and deduplicates by answer ID', () => {
  const cloud = fromCloudAttempt('ans-remote', {
    schemaVersion: 1, itemId: 'EL02', optionId: 'A', submittedAt: '2026-10-15T12:31:00.000Z',
    diagnosisType: 'UNCERTAIN', misconceptionId: null
  });
  const first = mergeCloudAttempts([localAnswer()], [cloud]);
  assert.equal(first.length, 2);
  assert.equal(first[0].explanation, 'A private learner explanation that must not leave the browser.');
  assert.equal(first[1].explanation, '');
  assert.equal(mergeCloudAttempts(first, [cloud]).length, 2);
});

test('cloud learner paths accept only bounded opaque profile IDs', () => {
  assert.equal(cloudLearnerId('prof_child_b'), 'prof_child_b');
  assert.equal(cloudLearnerId('../guardian'), null);
  assert.equal(cloudLearnerId(''), null);
});

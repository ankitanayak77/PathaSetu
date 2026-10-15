import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDiagnosis } from '../src/core/validator.js';
import { loadPack } from '../src/core/content.js';
const item = loadPack().items[0];
const base = { questionId: item.id, type: 'MISCONCEPTION', misconceptionId: item.allowedMisconceptionIds[0], confidence: 0.8, rationale: 'A test proposal.' };

test('validator accepts an allowed structured proposal', () => assert.equal(validateDiagnosis(base, item).ok, true));
test('validator rejects an unallowed misconception ID', () => assert.equal(validateDiagnosis({ ...base, misconceptionId: 'NOT_ALLOWED' }, item).reason, 'misconception_not_allowed'));
test('validator rejects a question-ID mismatch', () => assert.equal(validateDiagnosis({ ...base, questionId: 'EL03' }, item).reason, 'question_mismatch'));
test('validator rejects malformed output and invalid confidence', () => {
  assert.equal(validateDiagnosis('not json', item).reason, 'result_not_object');
  assert.equal(validateDiagnosis({ ...base, confidence: 4 }, item).reason, 'invalid_confidence');
});
test('uncertain output is valid without a misconception ID', () => {
  const result = validateDiagnosis({ questionId: item.id, type: 'UNCERTAIN', misconceptionId: null, confidence: 0.4, rationale: 'Not enough evidence.' }, item);
  assert.equal(result.ok, true);
});
test('non-uncertain output below the confidence threshold is kept as UNCERTAIN (Iteration 16), not accepted as a misconception', () => { const r = validateDiagnosis({ ...base, confidence: 0.2 }, item); assert.equal(r.ok, true); assert.equal(r.reason, 'below_confidence_threshold'); assert.equal(r.value.type, 'UNCERTAIN'); assert.equal(r.value.misconceptionId, null); });

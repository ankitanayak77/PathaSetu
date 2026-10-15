export const DIAGNOSIS_TYPES = Object.freeze(['MISCONCEPTION', 'NONE', 'UNCERTAIN']);

// Iteration 16: naming a misconception (or NONE) still needs confidence of at least 0.65, but a result below that is now kept as
// "not sure" (UNCERTAIN) instead of being rejected. A rejection was counted as a failed attempt and retried, and a model at
// temperature 0 tends to return the same answer again. Every other rejection is unchanged.
export function validateDiagnosis(raw, item) {
  const strict = checkDiagnosis(raw, item);
  if (strict.ok || strict.reason !== 'below_confidence_threshold') return strict;
  const rationale = `Not confident enough to name a result (${raw.confidence}). ${raw.rationale}`.slice(0, 500);
  return { ok: true, reason: 'below_confidence_threshold', value: Object.freeze({ type: 'UNCERTAIN', questionId: item.id, misconceptionId: null, confidence: raw.confidence, rationale }) };
}

function checkDiagnosis(raw, item) {
  const reject = (reason) => ({ ok: false, reason, value: null });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return reject('result_not_object');
  if (raw.questionId !== item.id) return reject('question_mismatch');
  if (!DIAGNOSIS_TYPES.includes(raw.type)) return reject('invalid_type');
  if (raw.type === 'MISCONCEPTION') {
    if (typeof raw.misconceptionId !== 'string' || !item.allowedMisconceptionIds.includes(raw.misconceptionId)) return reject('misconception_not_allowed');
  } else if (raw.misconceptionId != null) {
    return reject('unexpected_misconception_id');
  }
  if (typeof raw.confidence !== 'number' || !Number.isFinite(raw.confidence) || raw.confidence < 0 || raw.confidence > 1) return reject('invalid_confidence');
  if (typeof raw.rationale !== 'string' || raw.rationale.length > 500) return reject('invalid_rationale');
  if (raw.type !== 'UNCERTAIN' && raw.confidence < 0.65) return reject('below_confidence_threshold');
  return { ok: true, reason: null, value: Object.freeze({ questionId: item.id, type: raw.type, misconceptionId: raw.misconceptionId ?? null, confidence: raw.confidence, rationale: raw.rationale }) };
}

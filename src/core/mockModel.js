/** Explicitly a deterministic demo double; it does not understand free-form Odia. */
export function proposeDiagnosis({ item, optionId, explanation = '' }) {
  const option = item.options.find((candidate) => candidate.id === optionId);
  if (!option) return { questionId: item.id, type: 'UNCERTAIN', misconceptionId: null, confidence: 0.25, rationale: 'The selected option is not part of this question.' };
  const text = explanation.trim();
  if (text.length < 8) return { questionId: item.id, type: 'UNCERTAIN', misconceptionId: null, confidence: 0.4, rationale: 'The explanation is too short for a meaningful re-check. Please add a little more reasoning.' };
  if (!option.misconceptionId) return { questionId: item.id, type: 'NONE', misconceptionId: null, confidence: 0.78, rationale: 'The selected option matches the answer key. This mock does not independently verify the explanation.' };
  return { questionId: item.id, type: 'MISCONCEPTION', misconceptionId: option.misconceptionId, confidence: 0.78, rationale: 'Option-linked demo rule selected this misconception. The free-text explanation was not semantically interpreted.' };
}

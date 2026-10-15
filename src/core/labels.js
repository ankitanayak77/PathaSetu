// Iteration 16: result wording shared by the browser app and the tests. Pure functions, no DOM.

// A re-check answered by a configured model (Ollama, Gemini, Groq). RECHECKED_MOCK is the server's demo rule, not a model.
export const isModelRecheck = (mode) => typeof mode === 'string' && mode.startsWith('RECHECKED_') && mode !== 'RECHECKED_MOCK';

export function provenanceText(mode) {
  if (isModelRecheck(mode)) return 'This model proposal remains provisional and has not been evaluated for learning accuracy.';
  return 'This result is from a deterministic demo rule, not semantic understanding of the explanation.';
}

// Whether the chosen option is the one the (draft, unreviewed) answer key marks as correct.
export const matchesKey = (item, optionId) => Boolean(item && typeof optionId === 'string' && optionId === item.correctOptionId);

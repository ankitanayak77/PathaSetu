// Bridge Practice: a deterministic matching exercise built ONLY from the `bridge` fields already in the local content pack.
// Pure and browser-safe: no network, no randomness, no model, no invented vocabulary.
import { appendTrace } from './agent.js';

export const REVIEWED_STATUSES = Object.freeze(['REVIEWED', 'PUBLISHED']);
const OPTION_COUNT = 3;

const clean = (value) => (typeof value === 'string' ? value.normalize('NFC').replace(/\s+/g, ' ').trim() : '');
const isUsableText = (value) => { const text = clean(value); return text.length > 0 && !/^\[.*\]$/.test(text); };
// "open circuit / closed circuit" or "current; potential difference" are lists of terms. Two mappings that share a term
// are not distinct enough to be a right answer and a wrong answer for each other.
const segments = (value) => clean(value).split(/\s*[\/;]\s*/).map((part) => part.toLowerCase()).filter(Boolean);

export function mappingFromItem(item) {
  const bridge = item?.bridge;
  if (!bridge || !isUsableText(bridge.everydayOdia) || !isUsableText(bridge.schoolOdiaTerm) || !isUsableText(bridge.englishTerm)) return null;
  const everydayOdia = clean(bridge.everydayOdia);
  const schoolOdiaTerm = clean(bridge.schoolOdiaTerm);
  const englishTerm = clean(bridge.englishTerm);
  return {
    itemId: item.id, conceptId: item.conceptId, everydayOdia, schoolOdiaTerm, englishTerm,
    status: typeof bridge.status === 'string' ? bridge.status : 'UNREVIEWED_DRAFT',
    key: `${schoolOdiaTerm.toLowerCase()}||${englishTerm.toLowerCase()}`,
    schoolSegments: segments(schoolOdiaTerm), englishSegments: segments(englishTerm)
  };
}

// Distinct usable mappings, first occurrence wins, in pack order.
export function usableMappings(pack) {
  const seen = new Set();
  const out = [];
  for (const item of pack?.items ?? []) {
    const mapping = mappingFromItem(item);
    if (!mapping || seen.has(mapping.key)) continue;
    seen.add(mapping.key);
    out.push(mapping);
  }
  return out;
}

export function mappingsConflict(a, b) {
  return a.key === b.key || a.schoolSegments.some((part) => b.schoolSegments.includes(part)) || a.englishSegments.some((part) => b.englishSegments.includes(part));
}

export function isDraftStatus(status) { return !REVIEWED_STATUSES.includes(status); }

// attempt: how many bridge attempts this learner has already made on this question. It rotates which distractors are used
// and where the correct option sits, so the exercise is deterministic but not identical every time.
export function buildBridgeExercise({ pack, itemId, attempt = 0 }) {
  const mappings = usableMappings(pack);
  const item = pack?.items?.find((candidate) => candidate.id === itemId);
  const target = mappingFromItem(item);
  if (!item) return { enabled: false, reason: 'There is no current question to practise.', distinctMappings: mappings.length };
  if (!target) return { enabled: false, reason: 'This question has no complete bridge mapping (everyday Odia, school Odia term and English term).', distinctMappings: mappings.length };
  if (mappings.length < OPTION_COUNT) return { enabled: false, reason: `Bridge Practice needs at least ${OPTION_COUNT} distinct mappings in the content pack; this pack has ${mappings.length}.`, distinctMappings: mappings.length };
  const pool = mappings.filter((candidate) => !mappingsConflict(candidate, target));
  const start = ((Number(attempt) % Math.max(1, pool.length)) + Math.max(1, pool.length)) % Math.max(1, pool.length);
  const distractors = [];
  for (let i = 0; i < pool.length && distractors.length < OPTION_COUNT - 1; i++) {
    const candidate = pool[(start + i) % pool.length];
    if (distractors.every((chosen) => !mappingsConflict(chosen, candidate))) distractors.push(candidate);
  }
  if (distractors.length < OPTION_COUNT - 1) {
    return { enabled: false, reason: `Not enough clearly different mappings in the pack to build ${OPTION_COUNT} options without ambiguity.`, distinctMappings: mappings.length };
  }
  const correctIndex = ((Number(attempt) % OPTION_COUNT) + OPTION_COUNT) % OPTION_COUNT;
  const ordered = [...distractors];
  ordered.splice(correctIndex, 0, target);
  const options = ordered.map((mapping, index) => ({ id: `B${index + 1}`, schoolOdiaTerm: mapping.schoolOdiaTerm, englishTerm: mapping.englishTerm, sourceItemId: mapping.itemId, status: mapping.status }));
  return {
    enabled: true, itemId: item.id, conceptId: item.conceptId, attempt: Number(attempt) || 0,
    prompt: target.everydayOdia, options, correctOptionId: `B${correctIndex + 1}`,
    target: { sourceItemId: target.itemId, everydayOdia: target.everydayOdia, schoolOdiaTerm: target.schoolOdiaTerm, englishTerm: target.englishTerm, status: target.status },
    draft: isDraftStatus(target.status) || options.some((option) => isDraftStatus(option.status)),
    distinctMappings: mappings.length
  };
}

export function gradeBridgeAnswer(exercise, optionId) {
  if (!exercise?.enabled) return { ok: false, reason: 'exercise_disabled' };
  const chosen = exercise.options.find((option) => option.id === optionId);
  if (!chosen) return { ok: false, reason: 'unknown_option' };
  return { ok: true, correct: chosen.id === exercise.correctOptionId, chosen, correctOption: exercise.options.find((option) => option.id === exercise.correctOptionId), reveal: exercise.target };
}

// Writes the attempt into the existing decision trace and a per-question counter. Uses no network.
export function recordBridgeAttempt(state, exercise, optionId) {
  const graded = gradeBridgeAnswer(exercise, optionId);
  if (!graded.ok) return graded;
  if (!state.learner.bridgeAttempts || typeof state.learner.bridgeAttempts !== 'object' || Array.isArray(state.learner.bridgeAttempts)) state.learner.bridgeAttempts = {};
  const priorAttempts = state.learner.bridgeAttempts[exercise.itemId];
  state.learner.bridgeAttempts[exercise.itemId] = Number.isInteger(priorAttempts) && priorAttempts >= 0 ? priorAttempts + 1 : 1;
  appendTrace(state, {
    type: 'bridge_practice_attempt', itemId: exercise.itemId, attempt: exercise.attempt,
    selectedSourceItemId: graded.chosen.sourceItemId, correctSourceItemId: graded.correctOption.sourceItemId,
    correct: graded.correct, optionOrder: exercise.options.map((option) => option.sourceItemId),
    contentStatus: exercise.draft ? 'UNREVIEWED_DRAFT' : 'REVIEWED', network: false
  });
  state.lastUpdated = new Date().toISOString();
  return graded;
}

export function recordBridgeReveal(state, exercise) {
  if (!exercise?.enabled) return { ok: false, reason: 'exercise_disabled' };
  appendTrace(state, { type: 'bridge_mapping_revealed', itemId: exercise.itemId, sourceItemId: exercise.target.sourceItemId, contentStatus: exercise.draft ? 'UNREVIEWED_DRAFT' : 'REVIEWED', network: false });
  state.lastUpdated = new Date().toISOString();
  return { ok: true, reveal: exercise.target };
}

// Validates and repairs a saved record read from local storage. Pure and browser-safe. Never throws; never invents answers.
// It removes only entries that cannot be used, counts what it removed, and reports counts (never content) in the trace.
import { initialState, appendTrace } from './agent.js';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isId = (value, max = 120) => typeof value === 'string' && value.length > 0 && value.length <= max;
const isCount = (value) => Number.isInteger(value) && value >= 0 && value <= 1_000_000;
const validIso = (value) => (typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null);
const DIAGNOSIS_TYPES = new Set(['MISCONCEPTION', 'NONE', 'UNCERTAIN']);
export const LIMITS = Object.freeze({ answers: 1000, queue: 100, trace: 200, explanation: 1000, drafts: 50 });

function dedupe(list, label, repairs) {
  const seen = new Set();
  const out = [];
  for (const entry of list) { if (seen.has(entry.id)) { repairs[`${label}_duplicates_removed`] = (repairs[`${label}_duplicates_removed`] ?? 0) + 1; continue; } seen.add(entry.id); out.push(entry); }
  return out;
}
const note = (repairs, key, n = 1) => { repairs[key] = (repairs[key] ?? 0) + n; };

export function repairSavedRecord(saved, pack) {
  const fresh = (reason) => {
    const state = initialState(pack);
    appendTrace(state, { type: 'saved_state_repaired', repairs: { [reason]: 1 }, reason: 'Saved progress could not be read, so a fresh state was started. A copy of the unreadable record was kept.' });
    return { state, drafts: {}, repairs: [reason], discarded: true };
  };
  try {
    if (!isObject(saved) || !isObject(saved.state)) return fresh('record_unreadable');
    const raw = saved.state;
    const counts = {};
    const base = initialState(pack);
    const learnerIn = isObject(raw.learner) ? raw.learner : (note(counts, 'learner_reset'), {});
    const sessions = Number.isInteger(learnerIn.sessionsRemaining) && learnerIn.sessionsRemaining >= 0 && learnerIn.sessionsRemaining <= 10 ? learnerIn.sessionsRemaining : (note(counts, 'sessions_reset'), base.learner.sessionsRemaining);
    const confirmed = {};
    if (isObject(learnerIn.confirmedMisconceptions)) {
      for (const [key, value] of Object.entries(learnerIn.confirmedMisconceptions)) { if (isId(key) && isCount(value)) confirmed[key] = value; else note(counts, 'confirmed_misconceptions_removed'); }
    } else if (learnerIn.confirmedMisconceptions !== undefined) note(counts, 'confirmed_misconceptions_reset');
    const seen = Array.isArray(learnerIn.seenItemIds) ? learnerIn.seenItemIds.filter((id) => isId(id)) : (learnerIn.seenItemIds !== undefined && note(counts, 'seen_reset'), []);
    if (Array.isArray(learnerIn.seenItemIds) && seen.length !== learnerIn.seenItemIds.length) note(counts, 'seen_removed', learnerIn.seenItemIds.length - seen.length);
    const current = learnerIn.currentItemId === null || isId(learnerIn.currentItemId) ? learnerIn.currentItemId : (note(counts, 'current_reset'), base.learner.currentItemId);
    const next = learnerIn.nextRecommendedItemId === null || learnerIn.nextRecommendedItemId === undefined || isId(learnerIn.nextRecommendedItemId) ? (learnerIn.nextRecommendedItemId ?? null) : (note(counts, 'next_reset'), null);

    const answersIn = Array.isArray(raw.answers) ? raw.answers : (raw.answers !== undefined && note(counts, 'answers_reset'), []);
    let answers = [];
    for (const answer of answersIn) {
      const ok = isObject(answer) && isId(answer.id) && isId(answer.itemId) && isId(answer.optionId, 20) && typeof answer.mode === 'string'
        && isObject(answer.diagnosis) && isId(answer.diagnosis.questionId) && DIAGNOSIS_TYPES.has(answer.diagnosis.type);
      if (!ok) { note(counts, 'answers_removed'); continue; }
      answers.push(typeof answer.explanation === 'string' && answer.explanation.length <= LIMITS.explanation ? answer : { ...answer, explanation: typeof answer.explanation === 'string' ? answer.explanation.slice(0, LIMITS.explanation) : '' });
    }
    answers = dedupe(answers, 'answers', counts);
    if (answers.length > LIMITS.answers) { note(counts, 'answers_trimmed', answers.length - LIMITS.answers); answers = answers.slice(-LIMITS.answers); }

    const queueIn = Array.isArray(raw.queue) ? raw.queue : (raw.queue !== undefined && note(counts, 'queue_reset'), []);
    let queue = [];
    for (const entry of queueIn) {
      if (!(isObject(entry) && isId(entry.id) && isId(entry.answerId) && isId(entry.itemId))) { note(counts, 'queue_removed'); continue; }
      const repaired = { ...entry, attempts: isCount(entry.attempts) ? entry.attempts : 0, status: typeof entry.status === 'string' ? entry.status : 'PENDING_RECHECK', createdAt: validIso(entry.createdAt) ?? base.lastUpdated };
      if (entry.cycleAttempts !== undefined && !isCount(entry.cycleAttempts)) delete repaired.cycleAttempts;
      if (entry.nextAttemptAt !== undefined && entry.nextAttemptAt !== null && validIso(entry.nextAttemptAt) === null) repaired.nextAttemptAt = null;
      if (entry.needsAttention !== undefined && typeof entry.needsAttention !== 'boolean') repaired.needsAttention = false;
      queue.push(repaired);
    }
    queue = dedupe(queue, 'queue', counts);
    if (queue.length > LIMITS.queue) { note(counts, 'queue_trimmed', queue.length - LIMITS.queue); queue = queue.slice(0, LIMITS.queue); }

    const traceIn = Array.isArray(raw.trace) ? raw.trace : (raw.trace !== undefined && note(counts, 'trace_reset'), []);
    let trace = traceIn.filter((event) => isObject(event) && typeof event.type === 'string' && event.type.length <= 60);
    if (trace.length !== traceIn.length) note(counts, 'trace_removed', traceIn.length - trace.length);
    if (trace.length > LIMITS.trace) { note(counts, 'trace_trimmed', trace.length - LIMITS.trace); trace = trace.slice(-LIMITS.trace); }

    const draftsIn = isObject(saved.drafts) ? saved.drafts : (saved.drafts !== undefined && note(counts, 'drafts_reset'), {});
    const drafts = {};
    for (const [itemId, draft] of Object.entries(draftsIn).slice(0, LIMITS.drafts)) {
      if (isId(itemId) && isObject(draft) && typeof draft.optionId === 'string' && draft.optionId.length <= 20 && typeof draft.explanation === 'string') drafts[itemId] = { ...draft, explanation: draft.explanation.slice(0, LIMITS.explanation) };
      else note(counts, 'drafts_removed');
    }

    const repairKeys = Object.keys(counts);
    if (!repairKeys.length) return { state: structuredClone(raw), drafts: structuredClone(draftsIn), repairs: [], discarded: false };
    const state = { ...raw, schemaVersion: 1, learner: { ...learnerIn, sessionsRemaining: sessions, confirmedMisconceptions: confirmed, seenItemIds: seen, currentItemId: current, nextRecommendedItemId: next }, answers, queue, trace, lastUpdated: validIso(raw.lastUpdated) ?? base.lastUpdated };
    appendTrace(state, { type: 'saved_state_repaired', repairs: counts, reason: 'Some saved entries could not be used and were removed; valid answers, queue entries and progress were kept.' });
    return { state, drafts, repairs: repairKeys, discarded: false };
  } catch {
    return fresh('record_unreadable');
  }
}

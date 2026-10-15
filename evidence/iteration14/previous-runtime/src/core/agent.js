import { RETRY_POLICY, scheduleAfterFailure, cycleAttemptsOf } from './retry.js';
import { proposeDiagnosis } from './mockModel.js';
import { validateDiagnosis } from './validator.js';

const MAX_TRACE = 200;
const MAX_QUEUE = 100;
const MAX_ANSWERS = 500;

function uid(prefix = 'evt') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Ids only have to be unique inside one learner's saved state. A clock + random suffix is nearly always enough, but if it ever
// repeats, two queue entries would share an id and re-checking one would remove both. So the id is checked against the ids
// already present and gets a counter suffix when it is taken.
function uniqueId(prefix, existing) {
  const taken = new Set(existing.map((entry) => entry?.id));
  const base = uid(prefix);
  let id = base;
  for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;
  return id;
}

export function initialState(pack) {
  const item = pack.items[0];
  const state = {
    schemaVersion: 1,
    learner: { sessionsRemaining: 10, confirmedMisconceptions: {}, seenItemIds: [], currentItemId: item?.id ?? null, nextRecommendedItemId: null },
    answers: [], queue: [], trace: [], lastUpdated: new Date().toISOString()
  };
  appendTrace(state, {
    type: 'plan_selected',
    reason: item ? 'Start with the first available Electricity question; no learner history exists yet.' : 'No available question exists in the current pack.',
    itemId: item?.id ?? null,
    planner: 'deterministic_offline'
  });
  return state;
}

export function appendTrace(state, event) {
  state.trace.push({ id: uid(), at: new Date().toISOString(), ...event });
  if (state.trace.length > MAX_TRACE) state.trace.splice(0, state.trace.length - MAX_TRACE);
}

// A provider that keeps failing would otherwise add one trace line per retry and push every useful decision out of the
// 200-event window. Repeats of the same failure for the same queue entry update one line instead.
function appendFailureTrace(state, event) {
  const last = state.trace.at(-1);
  if (last && last.type === event.type && last.queueId === event.queueId) {
    last.attempts = event.attempts;
    last.at = new Date().toISOString();
    last.repeats = (last.repeats ?? 1) + 1;
    if (event.details !== undefined) last.details = event.details;
    return;
  }
  appendTrace(state, event);
}

// Repairs references that no longer exist in the current content pack. Never guesses an answer.
export function reconcileState(state, pack) {
  if (!Array.isArray(pack?.items)) return false;
  const items = pack.items.filter((item) => item && typeof item === 'object' && typeof item.id === 'string' && item.id.length > 0);
  const ids = new Set(items.map((item) => item.id));
  let changed = false;
  if (items.length && !ids.has(state.learner.currentItemId)) {
    const prior = state.learner.currentItemId;
    state.learner.currentItemId = items[0].id;
    appendTrace(state, { type: 'content_mismatch_recovered', previousItemId: prior, nextItemId: items[0].id });
    changed = true;
  }
  const next = state.learner.nextRecommendedItemId;
  if (next && !ids.has(next)) {
    state.learner.nextRecommendedItemId = null;
    appendTrace(state, { type: 'recommendation_cleared', previousItemId: next, reason: 'The recommended question is not in the current content pack.' });
    changed = true;
  }
  if (changed) state.lastUpdated = new Date().toISOString();
  return changed;
}

export function chooseNextItem(state, pack, excludeId = null, focusConceptId = null) {
  const usable = pack.items;
  if (!usable.length) return null;
  const seen = new Map();
  for (const answer of state.answers) seen.set(answer.itemId, (seen.get(answer.itemId) ?? 0) + 1);
  const candidates = usable.filter((item) => item.id !== excludeId);
  const pool = candidates.length ? candidates : usable;
  const currentGaps = new Set(Object.keys(state.learner.confirmedMisconceptions).filter((id) => state.learner.confirmedMisconceptions[id] > 0));
  const scored = pool.map((item) => ({ item, score: (focusConceptId && item.conceptId === focusConceptId ? -20 : 0) + (item.allowedMisconceptionIds.some((id) => currentGaps.has(id)) ? -10 : 0) + (seen.get(item.id) ?? 0) * 5 + ((state.learner.seenItemIds.includes(item.id)) ? 1 : 0) }));
  scored.sort((a, b) => a.score - b.score || a.item.id.localeCompare(b.item.id));
  return scored[0].item;
}

export function submitAnswer({ state, pack, itemId, optionId, explanation, online, now = new Date().toISOString() }) {
  const item = pack.items.find((candidate) => candidate.id === itemId);
  if (!item) throw new Error('question_not_found');
  if (!item.options.some((option) => option.id === optionId)) throw new Error('option_not_found');
  if (state.queue.length >= MAX_QUEUE) throw new Error('recheck_queue_full');
  const lastAnswer = state.answers.at(-1);
  if (lastAnswer && lastAnswer.itemId === itemId && state.learner.currentItemId === itemId && state.learner.nextRecommendedItemId && state.learner.nextRecommendedItemId !== itemId) {
    // The learner has already answered this question and has not continued yet (for example a double tap).
    throw new Error('already_answered_awaiting_continue');
  }
  const cleanExplanation = String(explanation ?? '').trim().slice(0, 1000);
  const proposal = proposeDiagnosis({ item, optionId, explanation: cleanExplanation });
  const checked = validateDiagnosis(proposal, item);
  const diagnosis = checked.ok ? checked.value : { questionId: item.id, type: 'UNCERTAIN', misconceptionId: null, confidence: 0, rationale: `Validator rejected mock proposal: ${checked.reason}` };
  // This first MVP uses only an option-linked mock. Its output is always provisional;
  // an online HTTP request alone does not establish semantic or educational validity.
  const answer = {
    id: uniqueId('ans', state.answers), itemId, optionId, explanation: cleanExplanation,
    submittedAt: now, mode: online ? 'LOCAL_PROPOSAL_PENDING_RECHECK' : 'OFFLINE_RULE',
    diagnosis: { ...diagnosis, provisional: true },
    reviewStatus: item.status
  };
  state.answers.push(answer);
  if (state.answers.length > MAX_ANSWERS) state.answers.splice(0, state.answers.length - MAX_ANSWERS);
  if (!state.learner.seenItemIds.includes(itemId)) state.learner.seenItemIds.push(itemId);
  // Proposals from the mock never update confirmed mastery state.
  // Every local proposal gets a server re-check, even when the server currently appears
  // reachable. If online, the UI drains it immediately; if offline, it remains queued.
  state.queue.push({ id: uniqueId('q', state.queue), answerId: answer.id, itemId, createdAt: now, attempts: 0, status: online ? 'PENDING_PROVIDER_RECHECK' : 'PENDING_RECHECK' });
  const next = chooseNextItem(state, pack, itemId);
  // Keep the answered question visible so the learner can read its feedback and
  // remediation. Moving to the next item is an explicit learner action.
  state.learner.currentItemId = itemId;
  state.learner.nextRecommendedItemId = next?.id ?? null;
  state.learner.sessionsRemaining = Math.max(0, state.learner.sessionsRemaining - 1);
  state.lastUpdated = now;
  appendTrace(state, { type: 'answer_submitted', itemId, optionId, diagnosisType: diagnosis.type, misconceptionId: diagnosis.misconceptionId, provisional: true, action: diagnosis.type === 'MISCONCEPTION' ? 'show_remediation_and_queue_recheck_if_offline' : diagnosis.type === 'UNCERTAIN' ? 'ask_for_clarification' : 'schedule_follow_up', nextItemId: next?.id ?? null });
  return { state, answer, item, nextItem: next };
}


// One failed attempt: count it, schedule the next automatic attempt (bounded backoff) or pause the entry. The answer and the
// queue entry are never deleted here; a paused entry waits for a deliberate manual retry.
function registerFailure({ state, entry, type, reason, now, policy, itemId }) {
  // Schedule first: entries saved by earlier versions have no cycleAttempts and fall back to their old attempts count.
  const schedule = scheduleAfterFailure(entry, now, policy);
  entry.attempts = (Number.isInteger(entry.attempts) && entry.attempts >= 0 ? entry.attempts : 0) + 1;
  entry.lastAttemptAt = now;
  entry.lastFailure = String(reason).slice(0, 120);
  state.lastUpdated = now;
  appendFailureTrace(state, { type, itemId, queueId: entry.id, attempts: entry.attempts, reason: type === 'recheck_rejected' ? entry.lastFailure : 'provider_unavailable_or_invalid', details: entry.lastFailure, nextAttemptAt: schedule.nextAttemptAt });
  if (schedule.newlyPaused) {
    appendTrace(state, { type: 'recheck_paused', itemId, queueId: entry.id, attempts: entry.attempts, reason: 'Maximum automatic attempts reached. The answer and queue entry are kept; a manual retry is available.' });
  }
  return schedule;
}

export function recordRecheckDeferred({ state, queueId, reason = 'provider_unavailable', now = new Date().toISOString(), policy = RETRY_POLICY }) {
  const entry = state.queue.find((candidate) => candidate.id === queueId);
  if (!entry) return { recorded: false, reason: 'queue_item_not_found' };
  const schedule = registerFailure({ state, entry, type: 'recheck_deferred', reason, now, policy, itemId: entry.itemId });
  return { recorded: true, entry, paused: schedule.paused };
}

// A deliberate retry resets only the retry state of the chosen entries (or all entries that have failed). It never touches
// answers, drafts, sessions, the current question or the queue length.
export function manualRetryQueue({ state, queueId = null, now = new Date().toISOString() }) {
  let reset = 0;
  for (const entry of state.queue) {
    if (queueId && entry.id !== queueId) continue;
    if (!entry.needsAttention && cycleAttemptsOf(entry) === 0 && !entry.nextAttemptAt) continue;
    entry.cycleAttempts = 0;
    entry.needsAttention = false;
    entry.nextAttemptAt = null;
    delete entry.pausedAt;
    entry.manualRetries = (Number.isInteger(entry.manualRetries) ? entry.manualRetries : 0) + 1;
    reset += 1;
  }
  if (reset) {
    state.lastUpdated = now;
    appendTrace(state, { type: 'recheck_manual_retry', queueId: queueId ?? 'all', entries: reset, reason: 'The learner chose to retry now. Retry state was reset; the answers and the queue were not changed.' });
  }
  return { reset };
}

function applyDiagnosisToState(state, diagnosis, item) {
  if (diagnosis.type !== 'MISCONCEPTION' || !diagnosis.misconceptionId || !item.allowedMisconceptionIds.includes(diagnosis.misconceptionId)) return;
  state.learner.confirmedMisconceptions[diagnosis.misconceptionId] = (state.learner.confirmedMisconceptions[diagnosis.misconceptionId] ?? 0) + 1;
}

export function recheckQueued(params) {
  const { state, pack, queueId, online = true, diagnosisOverride, trusted = false, provider = 'mock', now = new Date().toISOString(), policy = RETRY_POLICY } = params;
  // Passing `diagnosisOverride` at all means "this is the provider's answer". If that answer is missing (null/undefined) it is a
  // malformed result and fails validation; it must never fall back to the local rule and drain the entry under the provider's
  // name. Only a call that omits the key (the offline/local path) uses the local rule.
  const providerSupplied = Object.hasOwn(params, 'diagnosisOverride');
  if (!online) return { state, drained: false, reason: 'offline' };
  const queueItem = state.queue.find((entry) => entry.id === queueId);
  if (!queueItem) return { state, drained: false, reason: 'queue_item_not_found' };
  const answer = state.answers.find((entry) => entry.id === queueItem.answerId);
  const item = pack.items.find((entry) => entry.id === queueItem.itemId);
  if (!answer || !item) {
    state.queue = state.queue.filter((entry) => entry.id !== queueId);
    appendTrace(state, { type: 'queue_dropped', reason: 'content_or_answer_missing', queueId });
    return { state, drained: true, reason: 'stale_queue_item_dropped' };
  }
  const proposal = providerSupplied ? diagnosisOverride : proposeDiagnosis({ item, optionId: answer.optionId, explanation: answer.explanation });
  const checked = validateDiagnosis(proposal, item);
  if (!checked.ok) {
    registerFailure({ state, entry: queueItem, type: 'recheck_rejected', reason: checked.reason, now, policy, itemId: item.id });
    return { state, drained: false, reason: checked.reason };
  }
  const prior = answer.diagnosis;
  const updated = { ...checked.value, provisional: !trusted };
  answer.diagnosis = updated;
  answer.mode = `RECHECKED_${String(provider).toUpperCase()}`;
  const changed = prior.type !== updated.type || prior.misconceptionId !== updated.misconceptionId;
  if (trusted && prior.type === 'MISCONCEPTION' && prior.misconceptionId && !prior.provisional && changed) {
    const count = state.learner.confirmedMisconceptions[prior.misconceptionId] ?? 0;
    if (count <= 1) delete state.learner.confirmedMisconceptions[prior.misconceptionId];
    else state.learner.confirmedMisconceptions[prior.misconceptionId] = count - 1;
  }
  if (trusted && updated.type === 'MISCONCEPTION' && (changed || prior.provisional)) applyDiagnosisToState(state, updated, item);
  state.queue = state.queue.filter((entry) => entry.id !== queueId);
  const oldCurrent = state.learner.currentItemId;
  const next = chooseNextItem(state, pack, item.id, item.conceptId);
  // A re-check may update the recommended plan, but it never silently replaces the
  // question currently being edited. The UI asks the learner to apply the new plan.
  state.learner.nextRecommendedItemId = next?.id ?? null;
  state.lastUpdated = new Date().toISOString();
  appendTrace(state, { type: 'recheck_complete', itemId: item.id, queueId, previousDiagnosis: prior.type, diagnosisType: updated.type, misconceptionId: updated.misconceptionId, provisional: updated.provisional, planChanged: oldCurrent !== state.learner.nextRecommendedItemId, currentItemPreserved: true, nextItemId: state.learner.nextRecommendedItemId });
  return { state, drained: true, reason: 'ok', answer, nextItem: next };
}

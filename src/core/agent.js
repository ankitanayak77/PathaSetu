import { proposeDiagnosis } from './mockModel.js';
import { validateDiagnosis } from './validator.js';

const MAX_TRACE = 200;
const MAX_QUEUE = 100;
const MAX_ANSWERS = 500;

function uid(prefix = 'evt') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
  const cleanExplanation = String(explanation ?? '').trim().slice(0, 1000);
  const proposal = proposeDiagnosis({ item, optionId, explanation: cleanExplanation });
  const checked = validateDiagnosis(proposal, item);
  const diagnosis = checked.ok ? checked.value : { questionId: item.id, type: 'UNCERTAIN', misconceptionId: null, confidence: 0, rationale: `Validator rejected mock proposal: ${checked.reason}` };
  // This first MVP uses only an option-linked mock. Its output is always provisional;
  // an online HTTP request alone does not establish semantic or educational validity.
  const answer = {
    id: uid('ans'), itemId, optionId, explanation: cleanExplanation,
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
  state.queue.push({ id: uid('q'), answerId: answer.id, itemId, createdAt: now, attempts: 0, status: online ? 'PENDING_PROVIDER_RECHECK' : 'PENDING_RECHECK' });
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


export function recordRecheckDeferred({ state, queueId, reason = 'provider_unavailable', now = new Date().toISOString() }) {
  const entry = state.queue.find((candidate) => candidate.id === queueId);
  if (!entry) return { recorded: false, reason: 'queue_item_not_found' };
  entry.attempts = (Number.isInteger(entry.attempts) && entry.attempts >= 0 ? entry.attempts : 0) + 1;
  entry.lastAttemptAt = now;
  entry.lastFailure = String(reason).slice(0, 120);
  state.lastUpdated = now;
  appendTrace(state, { type: 'recheck_deferred', itemId: entry.itemId, queueId, attempts: entry.attempts, reason: 'provider_unavailable_or_invalid', details: entry.lastFailure });
  return { recorded: true, entry };
}

function applyDiagnosisToState(state, diagnosis, item) {
  if (diagnosis.type !== 'MISCONCEPTION' || !diagnosis.misconceptionId || !item.allowedMisconceptionIds.includes(diagnosis.misconceptionId)) return;
  state.learner.confirmedMisconceptions[diagnosis.misconceptionId] = (state.learner.confirmedMisconceptions[diagnosis.misconceptionId] ?? 0) + 1;
}

export function recheckQueued({ state, pack, queueId, online = true, diagnosisOverride = null, trusted = false, provider = 'mock' }) {
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
  const proposal = diagnosisOverride ?? proposeDiagnosis({ item, optionId: answer.optionId, explanation: answer.explanation });
  const checked = validateDiagnosis(proposal, item);
  if (!checked.ok) {
    queueItem.attempts = (Number.isInteger(queueItem.attempts) && queueItem.attempts >= 0 ? queueItem.attempts : 0) + 1;
    queueItem.lastAttemptAt = new Date().toISOString();
    queueItem.lastFailure = checked.reason;
    state.lastUpdated = queueItem.lastAttemptAt;
    appendTrace(state, { type: 'recheck_rejected', itemId: item.id, reason: checked.reason, queueId, attempts: queueItem.attempts });
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

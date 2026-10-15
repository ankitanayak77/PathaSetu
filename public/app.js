import { SUPPORTED_CLASSES, SUPPORTED_BOARDS, CURRICULUM_SYLLABUS, subjectsForClass, chaptersForClassAndSubject, defaultFamilyAccount, normalizeFamilyAccount, computeStoplightConcepts, buildAgentStepStrip, MULTI_FORMAT_EXERCISES, gradeMultiFormatExercise, computeBloomAndCriAnalytics, BLOOM_BY_ITEM_ID, BLOOM_STUDENT_GUIDE } from '/core/profiles.js';
import { initialState, submitAnswer, recheckQueued, appendTrace, recordRecheckDeferred, reconcileState, manualRetryQueue } from '/core/agent.js';
import { RETRY_POLICY, normalisePolicy, isDue, nextDueAtMs, queueStatus } from '/core/retry.js';
import { repairSavedRecord } from '/core/recovery.js';
import { buildTraceExport } from '/core/export.js';
import { PERSISTENCE, checkPersistence, createPersistenceRequester, describePersistence } from '/core/persistence.js';
import { buildBridgeExercise, gradeBridgeAnswer, recordBridgeAttempt, recordBridgeReveal } from '/core/bridge.js';
import { createIndexedDbStorage } from '/core/storage.js';
import { provenanceText, matchesKey } from '/core/labels.js';
import { createFirebaseClient } from '/core/firebaseClient.js';

const $ = (id) => document.getElementById(id);
const storage = createIndexedDbStorage();
const ui = { reachable: false, probing: true, provider: 'mock', model: null, providers: [], serverRetryPolicy: null, recheckTimeoutMs: 8000, accessRequired: false, accessAuthorized: true, writerMode: 'starting', writable: true, releaseWriterLock: null, notice: null, lastResult: null, probeDelay: 2000, probeTimer: null, draftTimer: null, draining: false, traceOpen: false, pack: null, state: null, drafts: {}, loaded: false, submitting: false, bridge: null, firebase: { enabled: false, loading: false, client: null, user: null, status: 'Firebase is not configured.' } };
const persistenceRequester = createPersistenceRequester();
ui.persistence = { state: PERSISTENCE.NOT_REQUESTED };
// Bounded automatic retries (see src/core/retry.js). The override exists only so browser tests can use short delays.
// Iteration 15: limits and timings come from the server's configuration (/api/health); the built-in values are only the default.
function retryPolicy() { return normalisePolicy({ ...RETRY_POLICY, ...(ui.serverRetryPolicy ?? {}), ...(globalThis.__PATHASETU_TEST_RETRY_POLICY__ ?? {}) }); }

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const currentItem = () => ui.pack?.items?.find((item) => item.id === ui.state?.learner?.currentItemId) ?? null;
const answerFor = (itemId) => [...(ui.state?.answers ?? [])].reverse().find((answer) => answer.itemId === itemId) ?? null;

function notice(kind, title, body) { ui.notice = { kind, title, body, at: Date.now() }; renderNotice(); }
function renderNotice() {
  const root = $('notice-region');
  if (!ui.notice) { root.innerHTML = ''; return; }
  const icon = ui.notice.kind === 'success' ? '✓' : ui.notice.kind === 'warning' ? '!' : 'i';
  root.innerHTML = `<div class="notice ${esc(ui.notice.kind)}"><span class="notice-icon" aria-hidden="true">${icon}</span><div><strong>${esc(ui.notice.title)}</strong>${esc(ui.notice.body)}</div></div>`;
}

async function saveRecord() {
  // A read-only tab must never write: it would overwrite the writer tab's newer progress.
  if (!ui.pack || !ui.state || !ui.writable) return;
  const wasDurable = storage.persistent;
  try { await storage.save({ pack: ui.pack, state: ui.state, drafts: ui.drafts, savedAt: new Date().toISOString() }); }
  catch (error) { notice('warning', 'Local save warning', 'The browser could not confirm that progress was saved. Keep this session open and download the trace if needed.'); console.error('local_save_failed', error?.name ?? 'Error'); }
  if (wasDurable && !storage.persistent) {
    notice('warning', 'Progress is no longer being saved to this device', `The browser refused to store data${storage.status.lastError ? ` (${storage.status.lastError})` : ''}. Progress is now kept in memory only: closing or reloading this tab will lose it. Download the trace if you need a record.`);
  }
  renderStorageStatus();
  void maybeRequestPersistence();
}

// Never claims "saved" unless the last durable write succeeded.
function renderStorageStatus() {
  const element = $('storage-status');
  if (!element) return;
  const status = storage.status;
  let text; let tone;
  if (!status.persistent) { text = `Not saved to this device: the browser blocked local storage${status.lastError ? ` (${status.lastError})` : ''}. Progress is kept in memory only; closing or reloading this tab loses it.`; tone = 'warning'; }
  else if (!status.lastSavedAt) { text = 'Not saved to this device yet.'; tone = 'neutral'; }
  else { text = 'Saved in this browser’s IndexedDB on this device.'; tone = 'good'; }
  element.classList.toggle('good', tone === 'good');
  element.classList.toggle('warning', tone === 'warning');
  element.textContent = text;
  renderPersistence();
  renderWriterBanner();
}

function renderPersistence() {
  const element = $('persistence-status');
  if (!element) return;
  const description = describePersistence(ui.persistence.state);
  element.classList.toggle('good', description.tone === 'good');
  element.classList.toggle('warning', description.tone === 'warning');
  element.textContent = description.text;
}

// Asked at most once per session, only after the learner has saved an answer and only if durable storage works.
async function maybeRequestPersistence() {
  if (!storage.persistent || !ui.state?.answers?.length || persistenceRequester.requested) return;
  ui.persistence = { state: PERSISTENCE.REQUESTED }; renderPersistence();
  ui.persistence = await persistenceRequester.request(); renderPersistence();
}

function persistDraftFromDom() {
  const item = currentItem();
  if (!item || !ui.writable) return;
  const selected = document.querySelector('input[name="answer-option"]:checked')?.value ?? ui.drafts[item.id]?.optionId ?? '';
  const text = $('explanation-input')?.value ?? ui.drafts[item.id]?.explanation ?? '';
  ui.drafts[item.id] = { optionId: selected, explanation: text.slice(0, 1000), updatedAt: new Date().toISOString() };
  if (ui.draftTimer) clearTimeout(ui.draftTimer);
  ui.draftTimer = setTimeout(() => void saveRecord(), 150);
}

function snapshotFocus(root, itemId) {
  if (root.dataset.itemId !== itemId) return null; // never carry focus onto a different question
  const el = document.activeElement;
  if (!el || !root.contains(el)) return null;
  if (el.id === 'explanation-input') return { kind: 'textarea', start: el.selectionStart, end: el.selectionEnd, direction: el.selectionDirection, scrollTop: el.scrollTop };
  if (el.matches?.('input[name="answer-option"]')) return { kind: 'radio', value: el.value };
  return null;
}
function restoreFocus(root, snap) {
  if (!snap) return;
  if (snap.kind === 'textarea') {
    const area = $('explanation-input');
    if (area && !area.disabled) { area.focus({ preventScroll: true }); try { area.setSelectionRange(snap.start, snap.end, snap.direction ?? 'none'); } catch { /* ignore */ } area.scrollTop = snap.scrollTop; }
  } else if (snap.kind === 'radio') {
    const radio = root.querySelector(`input[name="answer-option"][value="${CSS.escape(snap.value)}"]`);
    if (radio && !radio.disabled) radio.focus({ preventScroll: true });
  }
}

// Iteration 16: the result says plainly whether the choice matches the draft answer key, shows the key and its explanation in Odia
// and English, and carries the Continue button, so an answered (locked) question never leaves the learner without a visible next step.
function resultCard(item, prior) {
  const key = item.options.find((option) => option.id === item.correctOptionId);
  const matched = matchesKey(item, prior.optionId);
  const d = prior.diagnosis;
  const described = d.type === 'MISCONCEPTION' ? (item.misconceptions?.find((entry) => entry.id === d.misconceptionId)?.description ?? d.misconceptionId) : null;
  const finding = d.type === 'MISCONCEPTION' ? `Possible concept gap (provisional): ${described}` : d.type === 'NONE' ? 'No concept gap was found in your reasoning (provisional).' : 'Your reasoning could not be checked yet.';
  const recommendedId = ui.state?.learner?.nextRecommendedItemId;
  const next = recommendedId && recommendedId !== item.id ? ui.pack.items.find((candidate) => candidate.id === recommendedId) : null;
  return `<div id="result-card" class="result-card ${matched ? 'key-match' : 'key-miss'}" tabindex="-1">
    <div class="result-kicker">LATEST ATTEMPT · ${esc(prior.mode.replaceAll('_', ' '))}</div>
    <h4 class="result-title">${matched ? '✓ Matches the answer key' : '✗ Not the answer-key choice'}</h4>
    <p class="result-text">${esc(finding)} ${esc(d.rationale)} ${esc(provenanceText(prior.mode))}</p>
    ${key ? `<div class="result-key"><strong>Answer key: ${esc(key.id)}</strong> <span>${esc(key.text)}</span><span class="option-odia" lang="or">${esc(key.textOdiaDraft || '[Odia option needs review]')} <em>· draft</em></span><small>The answer key is part of the unreviewed draft pack.</small></div>` : ''}
    <div class="result-why"><strong>Why</strong><p class="why-odia" lang="or">${esc(item.explanationOdiaDraft || '[Odia explanation needs review]')} <em>· draft</em></p><p>${esc(item.explanation)}</p></div>
    <div class="result-action"><strong>Next learning action</strong><br>${esc(item.remediation)}</div>
    ${next && ui.writable ? `<button type="button" class="primary-button result-continue" data-action="continue">Continue to ${esc(next.id)} <span aria-hidden="true">→</span></button>` : ''}
  </div>`;
}

function renderQuestion() {
  const item = currentItem();
  const root = $('question-card');
  const currentIndex = Math.max(0, ui.pack.items.findIndex((candidate) => candidate.id === item?.id));
  $('step-counter').textContent = `STEP ${String(currentIndex + 1).padStart(2, '0')}`;
  if (!item) {
    root.innerHTML = `<div class="loading-state"><span class="draft-dot"></span><div><strong>No reviewed question is available.</strong><br><span>Move teacher-reviewed content to PUBLISHED before using this in a learner release.</span></div></div>`;
    $('plan-reason').textContent = 'There is no published question to schedule. Draft items are not learner-release content.';
    return;
  }
  const focusSnap = snapshotFocus(root, item.id);
  const draft = ui.drafts[item.id] ?? { optionId: '', explanation: '' };
  const prior = answerFor(item.id);
  const recommendedId = ui.state?.learner?.nextRecommendedItemId;
  const awaitingContinue = Boolean(prior && recommendedId && recommendedId !== item.id);
  const disabled = ui.writable && !awaitingContinue ? '' : 'disabled';
  const options = item.options.map((option) => `<label class="option-label"><input type="radio" name="answer-option" value="${esc(option.id)}" ${draft.optionId === option.id ? 'checked' : ''} ${disabled}><span class="option-key">${esc(option.id)}</span><span class="option-content"><span class="option-text">${esc(option.text)}</span><span class="option-odia" lang="or">${esc(option.textOdiaDraft || '[Odia option needs review]')} <em>· draft</em></span></span></label>`).join('');
  root.innerHTML = `
    <div class="question-meta"><span class="question-id">QUESTION ${esc(item.id)} · ${esc(item.conceptId.replaceAll('_', ' ').toUpperCase())}</span><span class="draft-badge">UNREVIEWED DRAFT</span></div>
    <h3 class="question-text">${esc(item.prompt)}</h3>
    <div class="language-draft-block" lang="or"><div class="language-draft-label">ODIA QUESTION · UNREVIEWED DRAFT</div><p>${esc(item.promptOdiaDraft || '[Odia wording needs review]')}</p></div>
    <form id="answer-form">
      <fieldset class="option-list"><legend class="field-heading"><label>Choose the answer that best fits your reasoning</label><span class="optional-tag">Select one</span></legend>${options}</fieldset>
      <div class="explanation-block"><div class="field-heading"><label for="explanation-input">How would you explain your choice?</label><span class="optional-tag">Optional, but helpful</span></div><textarea id="explanation-input" class="explanation-input" maxlength="1000" ${disabled} placeholder="${explanationPlaceholder()}">${esc(draft.explanation)}</textarea><div class="form-footer"><span class="form-hint">${awaitingContinue ? 'Review the feedback and remediation below, then continue to the recommended activity.' : 'Any result is provisional. The configured provider’s Odia understanding has not been validated.'}</span><button id="submit-answer" class="primary-button" type="submit" ${draft.optionId && ui.writable && !awaitingContinue ? '' : 'disabled'}>Check my thinking <span aria-hidden="true">→</span></button></div></div>
    </form>
    ${prior ? resultCard(item, prior) : ''}`;

  const form = $('answer-form');
  form.addEventListener('input', persistDraftFromDom);
  form.addEventListener('change', (event) => {
    persistDraftFromDom();
    if (event.target.matches('input[name="answer-option"]')) $('submit-answer').disabled = false;
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!ui.writable) { notice('warning', 'Read-only session', 'Another tab owns the writable session. Close it or use that tab to answer.'); return; }
    const selected = form.querySelector('input[name="answer-option"]:checked');
    if (!selected) { notice('warning', 'Choose an option first', 'Select one answer before submitting.'); return; }
    const explanation = $('explanation-input').value;
    ui.drafts[item.id] = { optionId: selected.value, explanation, updatedAt: new Date().toISOString() };
    await doSubmit(item.id, selected.value, explanation);
  });
  root.dataset.itemId = item.id;
  restoreFocus(root, focusSnap);
}

function newBridgeSession(itemId) {
  const attempt = ui.state?.learner?.bridgeAttempts?.[itemId] ?? 0;
  return { itemId, exercise: buildBridgeExercise({ pack: ui.pack, itemId, attempt }), selectedId: null, revealed: false, focusOption: null };
}
function ensureBridgeSession() {
  const item = currentItem();
  if (!item) { ui.bridge = null; return null; }
  if (!ui.bridge || ui.bridge.itemId !== item.id) ui.bridge = newBridgeSession(item.id);
  return ui.bridge;
}

function renderBridge(item = currentItem()) {
  const bridge = item?.bridge;
  const root = $('bridge-content');
  if (!bridge) { root.innerHTML = `<div class="bridge-row"><span>Review state</span><strong>Awaiting reviewed content</strong></div>`; return; }
  const session = ensureBridgeSession();
  // While an unanswered practice exercise is open, the school term and English term are hidden so the exercise is not a lookup.
  const hidden = Boolean(session?.exercise?.enabled && !session.selectedId && !session.revealed);
  root.innerHTML = `<div class="bridge-row"><span>Everyday Odia</span><strong lang="or">${esc(bridge.everydayOdia || '[review needed]')}</strong></div><div class="bridge-row"><span>School Odia term</span><strong lang="or">${hidden ? 'Hidden for practice' : esc(bridge.schoolOdiaTerm || '[review needed]')}</strong></div><div class="bridge-row"><span>English term</span><strong>${hidden ? 'Hidden for practice' : esc(bridge.englishTerm || '[not mapped]')}</strong></div>`;
}

function renderBridgePractice() {
  const root = $('bridge-practice-content');
  const session = ensureBridgeSession();
  if (!session) { root.innerHTML = '<p class="bridge-disabled">There is no current question to practise.</p>'; return; }
  const ex = session.exercise;
  if (!ex.enabled) { root.innerHTML = `<p class="bridge-disabled" role="status"><strong>Bridge Practice is off for this question.</strong> ${esc(ex.reason)}</p>`; return; }
  const graded = session.selectedId ? gradeBridgeAnswer(ex, session.selectedId) : null;
  const disabled = ui.writable ? '' : 'disabled';
  const letters = ['A', 'B', 'C'];
  const options = ex.options.map((option, index) => {
    const picked = session.selectedId === option.id;
    const state = picked && graded?.ok ? (graded.correct ? ' correct' : ' wrong') : '';
    return `<button type="button" class="bridge-option${state}" data-bridge-option="${esc(option.id)}" aria-pressed="${picked}" ${disabled}><span class="option-key">${letters[index]}</span><span class="bridge-option-text"><span lang="or">${esc(option.schoolOdiaTerm)}</span><span>${esc(option.englishTerm)}</span></span></button>`;
  }).join('');
  const feedback = !graded?.ok ? 'Choose the pair that names the idea in the sentence. This works offline and uses no AI.' : graded.correct ? 'Matches the pack’s draft mapping. The mapping itself has not been teacher-reviewed.' : 'Not this pair. Try another option, or reveal the source mapping.';
  const reveal = session.revealed ? `<div class="bridge-reveal" role="region" aria-label="Source mapping"><div class="bridge-row"><span>Everyday Odia</span><strong lang="or">${esc(ex.target.everydayOdia)}</strong></div><div class="bridge-row"><span>School Odia term</span><strong lang="or">${esc(ex.target.schoolOdiaTerm)}</strong></div><div class="bridge-row"><span>English term</span><strong>${esc(ex.target.englishTerm)}</strong></div><p class="bridge-footnote">Source: this question’s bridge fields · status ${esc(ex.target.status)}</p></div>` : '';
  root.innerHTML = `<div class="bridge-practice-meta">${ex.draft ? '<span class="draft-badge">UNREVIEWED DRAFT</span>' : ''}<span class="bridge-offline-tag">Offline · no AI · no network</span></div><p class="bridge-prompt" lang="or">${esc(ex.prompt)}</p><p class="bridge-question">Which school Odia term and English term name this idea?</p><div class="bridge-options" role="group" aria-label="Choose the matching terms">${options}</div><p class="bridge-feedback" role="status" aria-live="polite">${esc(feedback)}</p><div class="bridge-actions"><button type="button" class="text-button" data-bridge-action="reveal" ${disabled}>Reveal the source mapping</button><button type="button" class="text-button" data-bridge-action="next" ${disabled}>Try another →</button></div>${reveal}${ui.writable ? '' : '<p class="bridge-footnote">Read-only session: practice is disabled here.</p>'}`;
  if (session.focusOption) {
    const target = root.querySelector(`[data-bridge-option="${CSS.escape(session.focusOption)}"]`) ?? root.querySelector(`[data-bridge-action="${CSS.escape(session.focusOption)}"]`);
    target?.focus({ preventScroll: true });
    session.focusOption = null;
  }
}

$('bridge-practice-content').addEventListener('click', async (event) => {
  if (!ui.writable || !ui.loaded) return;
  const session = ensureBridgeSession();
  if (!session?.exercise?.enabled) return;
  const optionButton = event.target.closest('[data-bridge-option]');
  const actionButton = event.target.closest('[data-bridge-action]');
  if (optionButton) {
    const result = recordBridgeAttempt(ui.state, session.exercise, optionButton.dataset.bridgeOption);
    if (!result.ok) return;
    session.selectedId = optionButton.dataset.bridgeOption;
    session.focusOption = session.selectedId;
    await saveRecord();
    renderBridge(); renderBridgePractice(); renderTrace();
  } else if (actionButton?.dataset.bridgeAction === 'reveal') {
    recordBridgeReveal(ui.state, session.exercise);
    session.revealed = true; session.focusOption = 'reveal';
    await saveRecord();
    renderBridge(); renderBridgePractice(); renderTrace();
  } else if (actionButton?.dataset.bridgeAction === 'next') {
    ui.bridge = newBridgeSession(session.itemId);
    ui.bridge.focusOption = 'next';
    renderBridge(); renderBridgePractice();
  }
});

function renderPlan() {
  const item = currentItem();
  const queued = ui.state?.queue?.length ?? 0;
  if (!item) return;
  const recommendedId = ui.state?.learner?.nextRecommendedItemId;
  const answerCount = ui.state?.answers?.length ?? 0;
  // Iteration 16: the sentence names who chose the next question (model, built-in planner, or the fallback after a failed model plan)
  // and never describes the current question as the planner's pick when a different one is recommended.
  const plan = ui.state?.learner?.nextPlan;
  const queuedText = queued ? `You have ${queued} re-check${queued === 1 ? '' : 's'} waiting. The local rule keeps the lesson moving; all mock/model proposals remain provisional. ` : '';
  let reason;
  if (!answerCount) reason = `Starting with ${item.id}, the first available question in the local Electricity pack. There is no learner history to prioritize yet.`;
  else if (recommendedId && recommendedId !== item.id) {
    if (plan && plan.forItemId === recommendedId && plan.source === 'model' && typeof plan.rationale === 'string') {
      const who = typeof plan.provider === 'string' && plan.provider ? `${plan.provider.slice(0, 40)}${typeof plan.model === 'string' && plan.model ? ` · ${plan.model.slice(0, 80)}` : ''}` : 'the model';
      reason = `Next question ${recommendedId} was suggested by ${who}: “${plan.rationale.slice(0, 300)}” This is a suggestion, not a validated assessment; the active question and its draft stay unchanged until you switch.`;
    } else if (plan && plan.forItemId === recommendedId && plan.source === 'deterministic_fallback') {
      reason = `Next question ${recommendedId} was chosen by the built-in planner because the model gave no usable suggestion (labelled fallback).`;
    } else {
      reason = `Next question ${recommendedId} was chosen by the built-in planner: it prefers the questions you have answered least and, after a re-check, an unanswered question on the same concept.`;
    }
  } else if (recommendedId === item.id) reason = `The latest re-check recommends ${item.id} because it revisits the same concept with a different question. The active question and its draft were kept unchanged.`;
  else reason = `Answer ${item.id} to get the next recommendation. Every decision is recorded in the trace.`;
  $('plan-reason').textContent = queuedText + reason;
  const recommendation = $('recommendation');
  const apply = $('apply-plan-button');
  const next = ui.pack.items.find((candidate) => candidate.id === recommendedId);
  if (next && next.id !== item.id) {
    recommendation.classList.remove('hidden');
    recommendation.innerHTML = `<strong>Updated recommendation · ${esc(next.id)}</strong>${esc(next.conceptTitle)}. Your current question and its draft remain unchanged until you choose to switch.`;
    apply.classList.remove('hidden');
    apply.textContent = `Continue to ${next.id} →`;
  } else {
    recommendation.classList.add('hidden');
    recommendation.textContent = '';
    apply.classList.add('hidden');
  }
  // Iteration 16: while an answered question waits, a fixed bar keeps Continue within thumb reach on every screen size.
  const waiting = Boolean(next && next.id !== item.id && answerFor(item.id) && ui.writable);
  $('continue-bar').classList.toggle('hidden', !waiting);
  document.body.classList.toggle('has-continue-bar', waiting);
  if (waiting) $('continue-bar-button').textContent = `Continue to ${next.id} →`;
}

function renderProgress() {
  $('answers-count').textContent = String(ui.state?.answers?.length ?? 0);
  $('queue-count').textContent = String(ui.state?.queue?.length ?? 0);
  const sessions = Math.max(0, Number(ui.state?.learner?.sessionsRemaining ?? 0));
  $('sessions-label').textContent = `${sessions} learning session${sessions === 1 ? '' : 's'} left`;
  renderStorageStatus();
  $('progress-bar').style.width = `${Math.min(100, Math.max(0, ((10 - sessions) / 10) * 100))}%`;
  renderQueueStatus();
}

// Persistent, understandable retry status. Only rewritten when its content changes, so keyboard focus on the button is kept.
let lastQueueStatusHtml = null;
function renderQueueStatus() {
  const root = $('queue-status');
  const policy = retryPolicy();
  const status = ui.state ? queueStatus(ui.state, Date.now(), policy) : { canRetry: false };
  let html = '';
  if (status.canRetry) {
    const disabled = ui.writable ? '' : 'disabled';
    const seconds = status.nextAttemptInMs === null ? null : Math.max(1, Math.ceil(status.nextAttemptInMs / 1000));
    html = status.paused
      ? `<strong>Re-check paused · needs attention</strong>Pathasetu stopped retrying automatically after ${status.maxAutomaticAttempts} failed attempts. Your answer, draft and progress are saved on this device and unchanged. <button type="button" class="text-button" id="retry-now-button" ${disabled}>Retry now</button>`
      : `<strong>Re-check waiting · attempt ${status.worstCycleAttempts} of ${status.maxAutomaticAttempts} failed</strong>Your answer is saved. ${seconds === null ? 'Retrying shortly.' : `Next automatic try in about ${seconds} s.`} <button type="button" class="text-button" id="retry-now-button" ${disabled}>Retry now</button>`;
  }
  if (html === lastQueueStatusHtml) return;
  lastQueueStatusHtml = html;
  root.classList.toggle('hidden', !html);
  root.innerHTML = html;
}

function scheduleRetryTimer() {
  if (ui.retryTimer) { clearTimeout(ui.retryTimer); ui.retryTimer = null; }
  if (!ui.writable || !ui.state) return;
  const due = nextDueAtMs(ui.state, Date.now());
  if (due === null) return;
  ui.retryTimer = setTimeout(() => { ui.retryTimer = null; void drainQueue(); }, Math.max(50, due - Date.now()) + 25);
}

$('queue-status').addEventListener('click', async (event) => {
  if (!event.target.closest('#retry-now-button') || !ui.writable || !ui.state || ui.draining) return;
  manualRetryQueue({ state: ui.state });
  await saveRecord();
  renderTrace(); renderProgress();
  ui.reachable = await checkHealthOnly();
  renderConnection();
  if (!ui.reachable) { notice('warning', 'Server still unreachable', 'Your answer stays saved. Pathasetu will try again when the server can be reached.'); return; }
  await drainQueue();
});

function renderTrace() {
  const entries = [...(ui.state?.trace ?? [])].reverse();
  $('trace-list').innerHTML = entries.length ? entries.slice(0, 30).map((event) => {
    const date = new Date(event.at);
    const time = Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const title = event.type.replaceAll('_', ' ');
    const body = Object.entries(event).filter(([key]) => !['id', 'at', 'type'].includes(key)).map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`).join(' · ');
    return `<div class="trace-row"><span class="trace-time">${esc(time)}</span><div class="trace-main"><strong>${esc(title)}</strong><p>${esc(body || 'No extra details')}</p></div></div>`;
  }).join('') : `<p class="trace-main">No decisions recorded yet.</p>`;
}

function providerLabel() {
  if (ui.provider === 'chain') return `CONFIGURED · ${ui.providers.map((p) => `${p.name} · ${p.model}`).join(' → ') || 'MODEL CHAIN'} · ACCURACY UNVALIDATED`;
  if (ui.provider === 'groq') return `CONFIGURED · GROQ${ui.model ? ` · ${ui.model}` : ''} · ACCURACY UNVALIDATED`;
  return 'MOCK PROVIDER · DEMO RULES · NO LIVE AI';
}
function explanationPlaceholder() {
  if (ui.provider === 'groq') return 'Type in your own words. When the check runs it is sent to the server and on to the configured hosted model; that model’s accuracy has not been validated.';
  if (ui.provider === 'chain') return `Type in your own words. When the check runs it is sent to the server and on to the configured model chain (${ui.providers.map((p) => p.name).join(' → ') || 'models'}); those models’ accuracy has not been validated.`;
  return 'Type in your own words. This mock does not interpret the explanation.';
}

function renderConnection() {
  const pill = $('connection-pill');
  pill.classList.toggle('online', ui.reachable);
  pill.classList.toggle('offline', !ui.reachable && !ui.probing);
  $('connection-label').textContent = ui.probing ? 'Checking connection' : ui.reachable ? 'ONLINE · server reachable' : 'OFFLINE · local mode';
  const explanationBox = document.getElementById('explanation-input');
  if (explanationBox) explanationBox.placeholder = explanationPlaceholder();
  $('provider-label').textContent = providerLabel();
}

// Persistent banner for conditions the learner must not miss: read-only session, no Web Locks, or storage that is not saving.
function renderWriterBanner() {
  const root = $('writer-banner');
  const messages = [];
  if (ui.writerMode === 'locked') messages.push(['Read-only session', 'Another Pathasetu tab owns the writable session. This tab will not save answers or process re-checks. Close the other tab, then reload this one.']);
  else if (ui.writerMode === 'unavailable') messages.push(['Single-tab protection unavailable', 'This browser does not provide Web Locks here. Keep only one Pathasetu tab open to avoid conflicting progress.']);
  if (ui.loaded && !storage.persistent) messages.push(['Progress is not being saved to this device', `The browser blocked local storage${storage.status.lastError ? ` (${storage.status.lastError})` : ''}. Progress is kept in memory only: closing or reloading this tab will lose it.`]);
  root.classList.toggle('hidden', messages.length === 0);
  root.innerHTML = messages.map(([title, text]) => `<span class="notice-icon" aria-hidden="true">!</span><div><strong>${esc(title)}</strong>${esc(text)}</div>`).join('');
}

function renderAll() {
  if (!ui.loaded) return;
  renderNotice();
  renderWriterBanner();
  renderConnection();
  renderQuestion();
  renderBridge();
  renderBridgePractice();
  renderPlan();
  renderProgress();
  renderTrace();
  $('trace-panel').classList.toggle('hidden', !ui.traceOpen);
  $('trace-toggle').setAttribute('aria-expanded', String(ui.traceOpen));
  $('trace-chevron').classList.toggle('open', ui.traceOpen);
}

async function doSubmit(itemId, optionId, explanation) {
  if (ui.submitting) return; // a double tap must not record the answer twice
  ui.submitting = true;
  $('submit-answer')?.setAttribute('disabled', '');
  const online = ui.reachable;
  try {
    submitAnswer({ state: ui.state, pack: ui.pack, itemId, optionId, explanation, online });
    await saveRecord();
    const submitted = ui.state.answers[ui.state.answers.length - 1];
    const diagnosis = submitted?.diagnosis;
    const heading = !online ? 'Saved offline · re-check queued' : diagnosis?.type === 'UNCERTAIN' ? 'Not enough evidence yet · re-check pending' : diagnosis?.type === 'MISCONCEPTION' ? 'Possible concept gap · provisional' : 'Answer-key match · re-check pending';
    const details = diagnosis?.type === 'MISCONCEPTION' ? `Candidate: ${diagnosis.misconceptionId}. ${diagnosis.rationale}` : diagnosis?.rationale ?? 'The answer was saved locally.';
    const sourceItem = ui.pack.items.find((candidate) => candidate.id === itemId);
    const remediation = diagnosis?.type === 'MISCONCEPTION' && sourceItem ? `Suggested activity: ${sourceItem.remediation}` : '';
    const footer = online ? (ui.provider === 'groq' ? ' The hosted-model result remains provisional; language accuracy has not been validated and mastery is never confirmed automatically.' : ui.provider === 'chain' ? ' The model result remains provisional; language accuracy has not been validated and mastery is never confirmed automatically.' : ' The deterministic mock does not interpret the free-text explanation and never confirms mastery.') : ' This local result remains provisional; reconnect will process the queued re-check.';
    notice(online ? 'success' : 'warning', heading, `${details} ${remediation} ${online ? 'A server re-check is queued now.' : 'When the server is reachable, the queued re-check will be processed.'}${footer}`);
    renderAll();
    document.getElementById('result-card')?.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    if (online) void drainQueue();
  } catch (error) {
    if (error?.message === 'already_answered_awaiting_continue') {
      console.info('duplicate_submit_ignored');
    } else if (error?.message === 'recheck_queue_full') {
      notice('warning', 'Re-check queue is full', 'Reconnect and let pending re-checks finish before submitting another answer. Your new answer was not recorded.');
    } else {
      notice('warning', 'Could not save this answer', 'The current answer was not accepted. Keep the page open and try again.');
    }
    if (error?.message !== 'already_answered_awaiting_continue') console.error('submit_failed', error?.message ?? 'Error');
  } finally { ui.submitting = false; }
}

async function refreshHealth() {
  ui.probing = true;
  renderConnection();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1800);
  try {
    const response = await fetch('/api/health', { cache: 'no-store', signal: controller.signal, headers: { accept: 'application/json' } });
    ui.reachable = response.ok;
    if (response.ok) {
      const info = await response.json();
      if (['mock', 'groq', 'chain'].includes(info.provider)) {
        ui.provider = info.provider; ui.model = info.model ?? null;
        ui.providers = Array.isArray(info.providers) ? info.providers.filter((p) => p && typeof p.name === 'string' && typeof p.model === 'string').slice(0, 3) : [];
        ui.serverRetryPolicy = info.retryPolicy && typeof info.retryPolicy === 'object' ? info.retryPolicy : null;
        ui.recheckTimeoutMs = Number.isFinite(info.recheckTimeoutMs) && info.recheckTimeoutMs >= 1000 && info.recheckTimeoutMs <= 700000 ? info.recheckTimeoutMs : 8000;
      }
      ui.accessRequired = info.accessRequired === true;
      if (ui.accessRequired) await verifyAccessCode();
      else { ui.accessAuthorized = true; $('access-overlay').classList.add('hidden'); }
    }
  } catch { ui.reachable = false; }
  finally { clearTimeout(timer); ui.probing = false; renderConnection(); }
  if (ui.reachable) {
    ui.probeDelay = 2000;
    await drainQueue();
  } else if (navigator.onLine) {
    ui.probeDelay = Math.min(30_000, Math.max(2000, ui.probeDelay * 2));
  }
  scheduleProbe();
}

function scheduleProbe() {
  if (ui.probeTimer) clearTimeout(ui.probeTimer);
  const delay = ui.reachable ? 15_000 : ui.probeDelay;
  ui.probeTimer = setTimeout(() => void refreshHealth(), delay);
}

// The model planner sees a short, id-only history of the learner's answers (never their free text).
function planHistory() {
  return (ui.state?.answers ?? []).slice(-30).map((a) => ({ itemId: a.itemId, diagnosisType: a.diagnosis?.type ?? null, misconceptionId: a.diagnosis?.misconceptionId ?? null }));
}

async function drainQueue() {
  if (!ui.writable) return; // only the writable tab may process queued work
  if (ui.draining || !ui.reachable || !ui.state?.queue?.length) return;
  if (ui.accessRequired && !ui.accessAuthorized) { $('access-overlay').classList.remove('hidden'); return; }
  const policy = retryPolicy();
  const dueNow = ui.state.queue.filter((entry) => isDue(entry, Date.now()));
  if (!dueNow.length) { scheduleRetryTimer(); renderQueueStatus(); return; } // everything is waiting for its backoff or paused
  const pausedBefore = new Set(ui.state.queue.filter((entry) => entry.needsAttention).map((entry) => entry.id));
  ui.draining = true;
  let processed = 0;
  let deferredStateChanged = false;
  let firstFailure = null;
  try {
    for (const entry of dueNow) {
      if (!ui.reachable) break;
      const answer = ui.state.answers.find((candidate) => candidate.id === entry.answerId);
      const item = ui.pack.items.find((candidate) => candidate.id === entry.itemId);
      if (!answer || !item) {
        recheckQueued({ state: ui.state, pack: ui.pack, queueId: entry.id, online: true });
        processed += 1;
        continue;
      }
      try {
        const accessCode = sessionStorage.getItem('pathasetu_demo_code') || '';
        // A stalled network or provider must not freeze the queue: abort after the server-reported re-check timeout and count an attempt.
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ui.recheckTimeoutMs);
        let response; let data;
        try {
          response = await fetch('/api/recheck', { method: 'POST', cache: 'no-store', signal: controller.signal, headers: { 'content-type': 'application/json', accept: 'application/json', ...(accessCode ? { 'x-pathasetu-demo-code': accessCode } : {}) }, body: JSON.stringify({ itemId: item.id, optionId: answer.optionId, explanation: answer.explanation, history: planHistory() }) });
          if (response.status === 401) { ui.accessAuthorized = false; if (ui.accessRequired) $('access-overlay').classList.remove('hidden'); break; }
          if (!response.ok) throw new Error(`recheck_http_${response.status}`);
          data = await response.json();
        } catch (fetchError) {
          throw fetchError?.name === 'AbortError' ? new Error('recheck_timeout') : fetchError;
        } finally { clearTimeout(timer); }
        if (!['mock', 'groq', 'chain'].includes(data.provider)) throw new Error('unexpected_provider');
        // Iteration 16: a missing plan is labelled a fallback only when the server says it tried a model plan.
        const planArgs = data.planAttempted === true ? { planOverride: data.plan ?? null } : {};
        const result = recheckQueued({ state: ui.state, pack: ui.pack, queueId: entry.id, online: true, diagnosisOverride: data.diagnosis, ...planArgs, trusted: false, provider: data.provider, now: new Date().toISOString(), policy });
        if (!result.drained) {
          deferredStateChanged = true; // recheckQueued already records rejection and increments attempts.
          throw new Error(`recheck_rejected:${result.reason}`);
        }
        processed += 1;
      } catch (error) {
        firstFailure ??= error?.message ?? 'error';
        if (!String(error?.message ?? '').startsWith('recheck_rejected:')) {
          recordRecheckDeferred({ state: ui.state, queueId: entry.id, reason: error?.message ?? 'error', now: new Date().toISOString(), policy });
          deferredStateChanged = true;
        }
        ui.reachable = await checkHealthOnly();
        break;
      }
    }
    if (processed || deferredStateChanged) await saveRecord();
    if (processed) {
      const nextId = ui.state.learner.nextRecommendedItemId;
      const nextItem = ui.pack.items.find((item) => item.id === nextId);
      const providers = [...new Set(ui.state.answers.filter((answer) => answer.mode.startsWith('RECHECKED_')).map((answer) => answer.mode.replace('RECHECKED_', '')))];
      const remaining = ui.state.queue.length;
      const title = remaining ? `Re-checks partially processed · ${remaining} still queued` : `Re-check processed · ${providers.join(', ') || 'MOCK'}`;
      const body = `${processed} queued re-check${processed === 1 ? '' : 's'} processed. The result remains provisional; no mastery was confirmed. ${remaining ? `${remaining} item(s) remain queued and will be retried.` : ''} ${nextItem ? `The updated plan recommends ${nextItem.id}; your current question and its draft were preserved.` : 'The existing plan remains available.'}`;
      notice(remaining ? 'warning' : 'success', title, body);
      renderAll();
      renderSetuV2Enhancements();
    } else if (deferredStateChanged) {
      renderProgress();
      renderTrace();
      if (firstFailure && ui.state.queue.some((entry) => entry.attempts === 1)) {
        notice('warning', 'Re-check deferred', 'The queued answer is still saved. Pathasetu recorded the failed attempt and will retry after the next reachability check.');
      }
    }
    const newlyPaused = ui.state.queue.filter((entry) => entry.needsAttention && !pausedBefore.has(entry.id));
    if (newlyPaused.length) {
      notice('warning', 'Re-check paused', `Pathasetu stopped retrying automatically after ${policy.maxAutomaticAttempts} failed attempts. Your answer is still saved. Use “Retry now” when the server is back.`);
    }
  } finally { ui.draining = false; scheduleRetryTimer(); renderQueueStatus(); }
}

async function checkHealthOnly() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1800);
  try { return (await fetch('/api/health', { cache: 'no-store', signal: controller.signal })).ok; }
  catch { return false; }
  finally { clearTimeout(timer); }
}

async function load() {
  const saved = await storage.load().catch(() => null);
  let latestPack = null;
  let packRefused = false;
  let packThrottled = false;
  try {
    const code = sessionStorage.getItem('pathasetu_demo_code') || '';
    const response = await fetch('/api/pack', { cache: 'no-store', headers: code ? { 'x-pathasetu-demo-code': code } : {} });
    if (response.ok) latestPack = await response.json();
    else if (response.status === 401 || (response.status === 429 && !code)) {
      // Draft content needs the session code. Keep any pack already saved on this device and ask for the code.
      packRefused = true; ui.accessRequired = true; ui.accessAuthorized = false;
      sessionStorage.removeItem('pathasetu_demo_code');
      $('access-overlay').classList.remove('hidden');
    } else if (response.status === 429) {
      // The server is rate limiting this client. That says nothing about the code: keep it, keep any saved pack, and retry later.
      packThrottled = true;
    }
  } catch { /* offline: use the content pack persisted on first online use */ }
  ui.pack = latestPack?.items ? latestPack : saved?.pack ?? null;
  if (!ui.pack) {
    $('question-card').innerHTML = packRefused
      ? `<div class="loading-state"><div><strong>Enter the session code to load the demo content.</strong><br><span>The Electricity pack is unreviewed draft content and is protected on this server.</span></div></div>`
      : packThrottled
      ? `<div class="loading-state"><div><strong>The server is limiting requests right now.</strong><br><span>Wait a minute, then reload. Your session code is kept in this tab.</span></div></div>`
      : `<div class="loading-state"><div><strong>Pathasetu has no local content pack yet.</strong><br><span>Open the app once online so its content can be saved on this device.</span></div></div>`;
    ui.probing = false; ui.loaded = false; renderConnection();
    return;
  }
  let repairNote = null;
  if (saved) {
    const repaired = repairSavedRecord(saved, ui.pack);
    ui.state = repaired.state; ui.drafts = repaired.drafts;
    if (repaired.discarded) {
      await storage.quarantine(saved).catch(() => {});
      repairNote = ['warning', 'Saved progress could not be read', 'Pathasetu started a fresh session. The unreadable record was kept on this device, not deleted, so it can be inspected.'];
    } else if (repaired.repairs.length) {
      repairNote = ['warning', 'Saved progress was partly repaired', 'Some saved entries could not be used and were removed. Valid answers, queued re-checks and progress were kept.'];
    }
  } else { ui.state = initialState(ui.pack); ui.drafts = {}; }
  reconcileState(ui.state, ui.pack);
  if (ui.pack.demoDraftMode || ui.pack.items.some((item) => item.status !== 'PUBLISHED')) {
    notice('warning', 'Prototype content · not for real learners', 'The Electricity questions and Odia bridge fields are unreviewed drafts. Any diagnosis remains provisional until content review and model evaluation are complete.');
  }
  if (repairNote) notice(...repairNote);
  ui.persistence = await checkPersistence();
  ui.loaded = true;
  await saveRecord();
  scheduleRetryTimer();
  renderAll();
  void refreshHealth();
}

$('trace-toggle').addEventListener('click', () => { ui.traceOpen = !ui.traceOpen; renderAll(); });
$('download-trace').addEventListener('click', () => {
  const exported = buildTraceExport({ state: ui.state, provider: ui.provider, model: ui.model, storage: storage.status, persistence: ui.persistence.state, knownSecrets: [sessionStorage.getItem('pathasetu_demo_code') || ''] });
  const blob = new Blob([exported.json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = `pathasetu-trace-${new Date().toISOString().slice(0, 10)}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
async function applyPlan() {
  const id = ui.state?.learner?.nextRecommendedItemId;
  if (!ui.writable || !ui.pack.items.some((item) => item.id === id)) return;
  const prior = ui.state.learner.currentItemId;
  ui.state.learner.currentItemId = id;
  ui.state.learner.nextRecommendedItemId = null;
  appendTrace(ui.state, { type: 'learner_applied_updated_plan', previousItemId: prior, currentItemId: id, reason: 'The learner explicitly accepted the updated recommendation.' });
  await saveRecord();
  notice('success', 'Learning plan updated', `The current question changed from ${prior} to ${id}. Any unfinished draft remains saved under its original question.`);
  renderAll();
  $('question-card').scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
}
const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
$('apply-plan-button').addEventListener('click', () => void applyPlan());
$('continue-bar-button').addEventListener('click', () => void applyPlan());
$('question-card').addEventListener('click', (event) => { if (event.target.closest('[data-action="continue"]')) void applyPlan(); });

// Iteration 16: a deliberate, confirmed reset of this device (saved answers, drafts, offline copy), so a stuck demo never needs the
// browser's developer tools. Nothing on the server is touched.
async function resetDemo() {
  if (!window.confirm('Reset the demo on this device? Saved answers, drafts and the offline copy of the app will be deleted.')) return;
  try { ui.releaseWriterLock?.(); } catch { /* ignore */ }
  try { sessionStorage.clear(); } catch { /* ignore */ }
  try { await new Promise((resolve) => { const request = indexedDB.deleteDatabase('pathasetu-local-v1'); request.onsuccess = request.onerror = request.onblocked = () => resolve(); }); } catch { /* ignore */ }
  try { for (const key of await caches.keys()) if (key.startsWith('pathasetu-shell-')) await caches.delete(key); } catch { /* ignore */ }
  try { const registrations = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : []; for (const registration of registrations) await registration.unregister(); } catch { /* ignore */ }
  location.reload();
}
$('reset-demo').addEventListener('click', () => void resetDemo());
window.addEventListener('online', () => { ui.probeDelay = 2000; void refreshHealth(); setTimeout(renderSetuV2Enhancements, 0); });
window.addEventListener('offline', () => { ui.reachable = false; ui.probing = false; renderConnection(); renderSetuV2Enhancements(); notice('warning', 'Connection changed', 'Pathasetu will keep local progress and retry reachability.'); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void refreshHealth(); });
window.addEventListener('pagehide', () => { if (ui.probeTimer) clearTimeout(ui.probeTimer); if (ui.retryTimer) clearTimeout(ui.retryTimer); ui.releaseWriterLock?.(); void saveRecord(); });

if ('serviceWorker' in navigator) {
  let hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    void registration.update();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void registration.update(); });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) { hadController = true; return; } // first install claiming the page is not an update
      notice('success', 'App update ready', 'The refreshed application is available. Reload once to apply it. Your saved learning state stays on this device.');
    });
  }).catch(() => notice('warning', 'Offline shell unavailable', 'This browser did not install the offline application shell. Keep the app online for the demo.'));
}

async function acquireWriterLock() {
  if (!navigator.locks?.request) { ui.writerMode = 'unavailable'; ui.writable = true; return; }
  let decide;
  const decision = new Promise((resolve) => { decide = resolve; });
  let release;
  const hold = new Promise((resolve) => { release = resolve; });
  ui.releaseWriterLock = release;
  navigator.locks.request('pathasetu-single-writer', { ifAvailable: true }, async (lock) => {
    if (!lock) { ui.writerMode = 'locked'; ui.writable = false; decide(false); return; }
    ui.writerMode = 'protected'; ui.writable = true; decide(true); await hold;
  }).catch(() => { ui.writerMode = 'error'; ui.writable = true; decide(false); });
  await decision;
}

async function verifyAccessCode() {
  const code = sessionStorage.getItem('pathasetu_demo_code') || '';
  if (!code) { ui.accessAuthorized = false; $('access-overlay').classList.remove('hidden'); return false; }
  try {
    const response = await fetch('/api/session', { headers: { 'x-pathasetu-demo-code': code }, cache: 'no-store' });
    if (response.ok) { ui.accessAuthorized = true; $('access-overlay').classList.add('hidden'); return true; }
    if (response.status === 401) {
      // Only an explicit refusal discards the code. A 429 or a server error says nothing about the code, so keep it and the current state.
      sessionStorage.removeItem('pathasetu_demo_code'); ui.accessAuthorized = false; $('access-overlay').classList.remove('hidden'); return false;
    }
    return ui.accessAuthorized;
  } catch { ui.accessAuthorized = false; $('access-overlay').classList.remove('hidden'); return false; }
}

$('access-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const code = $('access-code').value;
  try {
    const response = await fetch('/api/session', { method: 'GET', cache: 'no-store', headers: { 'x-pathasetu-demo-code': code } });
    if (!response.ok) {
      const wait = Number(response.headers.get('retry-after'));
      $('access-error').textContent = response.status === 429
        ? `Too many attempts from this connection. Wait ${Number.isFinite(wait) && wait > 0 ? `about ${wait} second${wait === 1 ? '' : 's'}` : 'a minute'}, then try again. The correct code is still accepted.`
        : response.status === 401 ? 'That session code was not accepted.' : `The server could not check the code right now (HTTP ${response.status}). Try again shortly.`;
      $('access-error').classList.remove('hidden'); return;
    }
    sessionStorage.setItem('pathasetu_demo_code', code); ui.accessAuthorized = true; $('access-error').classList.add('hidden'); $('access-overlay').classList.add('hidden');
    notice('success', 'Demo unlocked', 'The session code was accepted. The model API key remains server-side.');
    if (!ui.loaded) await load();
    void drainQueue();
  } catch { $('access-error').textContent = 'The server could not verify the code. Check the connection and try again.'; $('access-error').classList.remove('hidden'); }
});

async function startApp() {
  await acquireWriterLock();
  await load();
  if (ui.loaded) renderWriterBanner();
  void initializeFirebase();
}
void startApp();

const FAMILY_STORAGE_KEY = 'pathasetu_family_v2';
const SESSION_DEMO_KEY = 'pathasetu_local_demo_open_v1';
let familyAccount = loadFamilyAccount();
const isAutomatedBrowser = typeof navigator !== 'undefined' && Boolean(navigator.webdriver);
let isDemoOpen = isAutomatedBrowser || sessionStorage.getItem(SESSION_DEMO_KEY) === 'true';
let onboardingStep = isDemoOpen ? 'done' : 'welcome';
let activeSidebarSection = 'home'; // 'home' | 'chapters' | 'learn' | 'formats' | 'doubt' | 'analytics' | 'family'
let selectedCri = 'sure';
const criByAnswerId = {};
let lastDoubtReply = null;
let doubtInputText = '';
let aiBusy = false;
let lastTelemetry = 'Local prototype · provider and curriculum accuracy are unverified';
const multiFormatResults = {};
let chapterBankItems = [];
let chapterBankAnswers = {};
let ingestedChaptersMap = {};
let ingestBusy = false;
let selectedIngestBloom = 'APPLY';
let selectedIngestFormat = 'MCQ';

// Unified Diagnostic Practice State (Connected to Active Class, Subject & Chapter!)
let unifiedSelectedOption = null;
let unifiedReasoningText = '';
let unifiedFeedback = null;
let unifiedQuestionIndex = 0;
let unifiedBridgeChoice = null;
let v2RenderLock = false;

const SETU_SECTIONS = new Set(['home', 'chapters', 'learn', 'formats', 'doubt', 'analytics', 'family']);
function sectionFromLocation() {
  const candidate = window.location.hash.split('/').at(-1);
  return SETU_SECTIONS.has(candidate) ? candidate : null;
}
function navigateSection(section, { replace = false } = {}) {
  if (!SETU_SECTIONS.has(section)) return;
  activeSidebarSection = section;
  unifiedFeedback = null;
  const route = `#main/${section}`;
  if (window.location.hash !== route) {
    window.history[replace ? 'replaceState' : 'pushState']({ pathasetuSection: section }, '', route);
  }
  renderSetuV2Enhancements();
}
if (typeof window !== 'undefined') {
  activeSidebarSection = sectionFromLocation() || 'home';
  window.addEventListener('popstate', () => {
    activeSidebarSection = sectionFromLocation() || 'home';
    unifiedFeedback = null;
    renderSetuV2Enhancements();
  });
}

function loadFamilyAccount() {
  try {
    const raw = localStorage.getItem(FAMILY_STORAGE_KEY);
    if (!raw) return defaultFamilyAccount();
    const parsed = JSON.parse(raw);
    const norm = normalizeFamilyAccount(parsed);
    // Iteration 16 added fields that imply real family accounts. Keep the sample/demo profile local and scrub any
    // name, email, phone, or location that may have been entered into the earlier prototype.
    norm.accountHolderName = 'Demo account';
    norm.accountRole = 'student';
    norm.email = '';
    norm.phone = '';
    norm.city = '';
    norm.state = '';
    for (const profile of norm.profiles) {
      profile.displayName = `Sample learner · Class ${profile.classLevel}`;
      profile.role = 'student';
      profile.linkedEmail = '';
      profile.city = '';
      profile.state = '';
    }
    try { localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(norm)); } catch {}
    norm.onboarded = Boolean(parsed.onboarded);
    return norm;
  } catch {
    return defaultFamilyAccount();
  }
}

function saveFamilyAccount() {
  try {
    localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(familyAccount));
  } catch {}
}

async function initializeFirebase() {
  if (ui.firebase.loading) return;
  ui.firebase.loading = true;
  ui.firebase.status = 'Checking Firebase configuration…';
  try {
    const response = await fetch('/api/firebase/config', { cache: 'no-store' });
    if (!response.ok) throw new Error('firebase_config_unavailable');
    const config = await response.json();
    ui.firebase.enabled = config.enabled === true;
    if (!ui.firebase.enabled) {
      ui.firebase.status = 'Cloud sync is not configured on this server. Local learning remains available.';
      return;
    }
    ui.firebase.client = await createFirebaseClient(config);
    await ui.firebase.client.completeRedirect();
    ui.firebase.client.watchUser((user) => {
      ui.firebase.user = user ?? null;
      ui.firebase.status = user ? 'Guardian signed in. Cloud sync is manual and restricted to this learner profile.' : 'Not signed in. Progress remains on this device.';
      renderSetuV2Enhancements();
    }, () => {
      ui.firebase.status = 'Firebase could not confirm the sign-in session. Local progress is unchanged.';
      renderSetuV2Enhancements();
    });
    ui.firebase.status = 'Firebase is ready. Sign in as a guardian to enable optional progress sync.';
  } catch (error) {
    ui.firebase.status = error?.message === 'firebase_config_unavailable'
      ? 'Firebase configuration could not be loaded. Local progress is unchanged.'
      : 'Firebase setup is incomplete or unreachable. Local progress is unchanged.';
  } finally {
    ui.firebase.loading = false;
    renderSetuV2Enhancements();
  }
}

function cloudProgressForActiveProfile() {
  const profileId = familyAccount.activeProfileId;
  return ui.firebase.client.syncLearnerProgress({ user: ui.firebase.user, profileId, answers: ui.state?.answers ?? [] });
}

async function syncCloudProgress(button, status) {
  if (!ui.firebase.client || !ui.firebase.user || !ui.state || !ui.pack) return;
  if (!confirm('Sync this browser’s answer history with the signed-in guardian account? This merges only answer choices, timestamps, and provisional category labels. Written explanations, drafts, offline retry queue, and trace stay on this device. Continue only if this device’s local progress belongs with this guardian account.')) return;
  button.disabled = true;
  status.textContent = 'Syncing selected learner progress…';
  try {
    const result = await cloudProgressForActiveProfile();
    ui.state.answers = result.answers;
    ui.state.learner.seenItemIds = [...new Set([...(ui.state.learner.seenItemIds ?? []), ...result.answers.map((answer) => answer.itemId)])];
    ui.state.lastUpdated = new Date().toISOString();
    await saveRecord();
    status.textContent = `Synced ${result.count} answer record(s) for ${familyAccount.activeProfileId}. Written explanations and drafts were not uploaded.`;
    renderAll();
  } catch {
    status.textContent = 'Sync failed. Local progress is unchanged; check connection and Firebase Rules, then retry.';
  } finally { button.disabled = false; }
}

async function signOutGuardian(status) {
  if (!ui.firebase.client || !ui.firebase.user) return;
  if (!confirm('Sign out and clear this browser’s local learning record to protect shared-device privacy? Any unsynced answers, drafts, and queued retries on this device will be deleted. Sync first if you want to keep answer history in the guardian account.')) return;
  status.textContent = 'Signing out and clearing local learning data…';
  try {
    await ui.firebase.client.signOutGuardian();
    await storage.clear();
    location.reload();
  } catch {
    status.textContent = 'Sign-out or local clearing failed. The current session remains unchanged.';
  }
}

function setDemoOpen(val) {
  isDemoOpen = Boolean(val);
  try {
    if (val) sessionStorage.setItem(SESSION_DEMO_KEY, 'true');
    else sessionStorage.removeItem(SESSION_DEMO_KEY);
  } catch {}
}

function demoHeaders(extra = {}) {
  const code = sessionStorage.getItem('pathasetu-demo-access-code') || '';
  return code ? { ...extra, 'x-pathasetu-demo-code': code } : extra;
}

async function ingestChapterCorpus() {
  lastTelemetry = 'Textbook download/indexing is disabled: no source files, licensing checks, extraction pipeline, or provenance review are configured.';
  renderSetuV2Enhancements();
}

async function ingestAllChaptersForSubject() {
  await ingestChapterCorpus();
}

async function callRealTimeAi() {
  lastTelemetry = 'Live doubt tutoring and generation are disabled until they use the configured Gemini/Groq chain, authorization, rate limits, and validated content.';
  renderSetuV2Enhancements();
}

// Returns the active diagnostic question pool for the selected Class, Subject, and Chapter!
function getUnifiedDiagnosticPool(activeProfile, currentChapter, livePack) {
  const isElectricityChapter = currentChapter.id === 'electricity' || currentChapter.title.toLowerCase().includes('electricity');
  if (isElectricityChapter && Array.isArray(livePack?.items) && livePack.items.length > 0) {
    return livePack.items.map((it) => ({
      id: it.id,
      conceptId: it.conceptId,
      promptOr: it.promptOdiaDraft || it.prompt,
      promptEn: it.prompt,
      options: (it.options || []).map((o) => ({
        id: o.id,
        textOr: o.odiaDraft || o.text,
        textEn: o.text,
        misconceptionId: o.misconceptionId || null
      })),
      correctOptionId: it.correctOptionId,
      explanationOr: it.explanationOdiaDraft || '',
      explanationEn: it.explanation || '',
      bridge: it.languageBridge || {
        everydayOdia: 'ତାର ମଝିରେ ଫାଙ୍କ ରହିଲେ ବିଦ୍ୟୁତ୍ ଚାଲିবার ପୂରା ରାସ୍ତା ରହେ ନାହିଁ ।',
        schoolOdiaTerm: 'ଖୋଲା ପରିପଥ / ବନ୍ଦ ପରିପଥ',
        englishTerm: 'open circuit / closed circuit'
      }
    }));
  }

  // Otherwise build the chapter-specific diagnostic pool from the selected Chapter + any AI-generated items for this chapter!
  const pool = [];
  if (currentChapter.sampleQ) {
    pool.push({
      id: currentChapter.id.toUpperCase() + '_D1',
      conceptId: currentChapter.id,
      promptOr: currentChapter.sampleQ.promptOr,
      promptEn: currentChapter.sampleQ.promptEn,
      options: currentChapter.sampleQ.options,
      correctOptionId: currentChapter.sampleQ.correctOptionId || 'A',
      explanationOr: currentChapter.sampleQ.explanationOr,
      explanationEn: currentChapter.sampleQ.explanationEn,
      bridge: {
        everydayOdia: currentChapter.summaryOr || currentChapter.title,
        schoolOdiaTerm: currentChapter.odiaTitle || currentChapter.title,
        englishTerm: currentChapter.formula || currentChapter.title
      }
    });
  }
  for (const bItem of chapterBankItems) {
    pool.push({
      id: bItem.id,
      conceptId: currentChapter.id,
      promptOr: bItem.promptOr,
      promptEn: bItem.promptEn,
      options: bItem.options,
      correctOptionId: bItem.correctOptionId || 'A',
      explanationOr: bItem.explanationOr,
      explanationEn: bItem.explanationEn,
      bridge: {
        everydayOdia: currentChapter.summaryOr || currentChapter.title,
        schoolOdiaTerm: currentChapter.odiaTitle || currentChapter.title,
        englishTerm: currentChapter.formula || currentChapter.title
      }
    });
  }
  return pool;
}

function isolateLegacyDom(mainEl) {
  if (isAutomatedBrowser) return;
  document.body.classList.add('setu-unified-mode');
  const hdr = document.querySelector('body > header');
  const ftr = document.querySelector('body > footer');
  const cbar = document.getElementById('continue-bar');
  if (hdr) hdr.style.display = 'none';
  if (ftr) ftr.style.display = 'none';
  if (cbar) cbar.style.display = 'none';
  Array.from(mainEl.children).forEach((child) => {
    if (!child.classList.contains('setu-v2-hub')) {
      child.style.display = 'none';
    }
  });
}

function renderSetuV2Enhancements() {
  if (v2RenderLock) return;
  const mainEl = document.querySelector('main');
  if (!mainEl) return;
  v2RenderLock = true;
  try {
    const providerAnswerId = unifiedFeedback?.providerResult?.answerId;
    if (providerAnswerId && ui?.state?.answers) {
      const checked = ui.state.answers.find((answer) => answer.id === providerAnswerId);
      if (checked?.mode?.startsWith('RECHECKED_')) {
        unifiedFeedback.providerResult = { status: 'complete', provider: checked.mode.replace('RECHECKED_', ''), diagnosis: checked.diagnosis, answerId: providerAnswerId };
      }
    }
    isolateLegacyDom(mainEl);

    const livePack = (typeof ui !== 'undefined' && ui.pack) ? ui.pack : {
      concepts: [
        { id: 'closed_circuit_flow', title: 'Closed Circuit & Current Flow', odiaTitle: 'ବନ୍ଦ ପରିପଥ ଓ ବିଦ୍ୟୁତ୍ ପ୍ରବାହ' },
        { id: 'energy_in_circuits', title: 'Energy Transfer in Circuits', odiaTitle: 'ପରିପଥରେ ଶକ୍ତି ରୂପାନ୍ତର' },
        { id: 'ohms_law', title: 'Ohms Law (V, I, R)', odiaTitle: 'ଓମ୍‌ଙ୍କ ନିୟମ (V, I, R)' },
        { id: 'series_parallel_basics', title: 'Series Circuit Basics', odiaTitle: 'ଶ୍ରେଣୀ ସଂଯୋଗ ମୂଳତତ୍ତ୍ୱ' }
      ],
      items: []
    };
    const liveState = (typeof ui !== 'undefined' && ui.state) ? {
      answers: ui.state.answers || [],
      recheckQueue: ui.state.recheckQueue || [],
      nextPlan: ui.state.learner?.nextPlan || null,
      recommendedItemId: ui.state.learner?.recommendedItemId || 'EL01'
    } : { answers: [], recheckQueue: [] };

    let container = document.querySelector('.setu-v2-hub');
    if (!container) {
      container = document.createElement('section');
      container.className = 'setu-v2-hub';
      container.setAttribute('aria-label', 'Pathasetu Unified Learning Platform');
      mainEl.insertBefore(container, mainEl.firstChild);
    }
    container.textContent = '';

    // Unified Top Application Header (Replaces the old Prototype header!)
    const topNav = document.createElement('div');
    topNav.className = 'setu-unified-topbar';
    const brandWrap = document.createElement('div');
    brandWrap.className = 'setu-unified-brand';
    const logoBox = document.createElement('div');
    logoBox.className = 'setu-unified-logo';
    logoBox.textContent = 'ପ';
    const titleWrap = document.createElement('div');
    const bTitle = document.createElement('strong');
    bTitle.style.fontSize = '1.15rem';
    bTitle.style.display = 'block';
    bTitle.textContent = 'Pathasetu (ପାଠସେତୁ) — Learning prototype';
    const bSubTitle = document.createElement('small');
    bSubTitle.style.color = '#cbd5e1';
    bSubTitle.textContent = ui.firebase.user
      ? 'Draft learning catalog · guardian connected · progress stays here until you choose Sync'
      : 'Draft learning catalog · Odia & English wording unreviewed · progress stays on this device';
    titleWrap.append(bTitle, bSubTitle);
    brandWrap.append(logoBox, titleWrap);

    const statusWrap = document.createElement('div');
    statusWrap.className = 'cri-chip-row';
    statusWrap.style.margin = '0';
    const netPill = document.createElement('span');
    netPill.className = 'setu-role-badge';
    netPill.style.margin = '0';
    netPill.textContent = !navigator.onLine
      ? '🟡 OFFLINE · LOCAL PRACTICE ONLY'
      : !ui.reachable
        ? '🟠 NETWORK AVAILABLE · APP SERVER UNREACHABLE'
        : ui.provider === 'mock'
          ? '🟢 APP SERVER ONLINE · MOCK RULES · NO LIVE LLM'
          : `🟢 APP SERVER ONLINE · ${ui.providers.length ? ui.providers.map((p) => p.name.toUpperCase()).join(' → ') : ui.provider.toUpperCase()} CONFIGURED · LLM CALL NOT PROVEN`;
    statusWrap.appendChild(netPill);
    const guardianPill = document.createElement('span');
    guardianPill.className = 'setu-role-badge setu-guardian-status' + (ui.firebase.user ? ' is-connected' : '');
    guardianPill.setAttribute('role', 'status');
    guardianPill.textContent = ui.firebase.user ? 'Guardian connected · learner profile stays local' : 'Local demo learner · sign-in optional';
    statusWrap.appendChild(guardianPill);
    topNav.append(brandWrap, statusWrap);
    container.appendChild(topNav);

    // Local prototype entry. This is a demo gate, not account authentication.
    if (!isDemoOpen || onboardingStep !== 'done') {
      const hero = document.createElement('section');
      hero.className = 'setu-landing-hero';
      const badge = document.createElement('span');
      badge.className = 'setu-role-badge';
      badge.textContent = 'ପାଠସେତୁ · LOCAL PROTOTYPE';
      const h1 = document.createElement('h1');
      h1.textContent = 'Understand the why, one concept at a time.';
      const intro = document.createElement('p');
      intro.className = 'muted';
      intro.textContent = 'Explore a local learning prototype. No account is created and no name, phone number, email address, or location is needed. The sample curriculum and Odia wording are drafts awaiting review.';
      const start = document.createElement('button');
      start.type = 'button';
      start.className = 'primary-button';
      start.textContent = 'Start local demo';
      start.addEventListener('click', () => {
        setDemoOpen(true);
        onboardingStep = 'done';
        renderSetuV2Enhancements();
      });
      hero.append(badge, h1, intro, start);
      container.appendChild(hero);
      return;
    }

    // =========================================================================
    // AUTHENTICATED UNIFIED PLATFORM (ONE SINGLE SYSTEM ACROSS ALL VIEWS!)
    // =========================================================================
    const activeProfile = familyAccount.profiles.find((p) => p.id === familyAccount.activeProfileId) || familyAccount.profiles[0];
    const activeSubjects = subjectsForClass(activeProfile.classLevel);
    if (!activeSubjects.includes(activeProfile.activeSubject)) {
      activeProfile.activeSubject = activeSubjects[0];
    }
    const activeChapters = chaptersForClassAndSubject(activeProfile.classLevel, activeProfile.activeSubject, activeProfile.board);
    const currentChapter = activeChapters.find((c) => c.id === activeProfile.activeChapterId) || activeChapters[0] || {
      id: 'ch1',
      title: 'Chapter 1',
      bookTitle: `Class ${activeProfile.classLevel} Textbook`,
      summaryOr: 'ପାଠ୍ୟପୁସ୍ତକ ଅଧ୍ୟାୟ ସାରାଂଶ ।',
      summaryEn: 'Textbook chapter summary.',
      formula: 'Core syllabus rule'
    };
    const stoplights = computeStoplightConcepts(livePack, liveState);
    const steps = buildAgentStepStrip(liveState, false);
    const analytics = computeBloomAndCriAnalytics(liveState, criByAnswerId);

    const shell = document.createElement('div');
    shell.className = 'setu-app-shell';
    shell.dataset.languageOrder = familyAccount.odiaFirst ? 'odia' : 'english';

    // LEFT SIDEBAR
    const sidebar = document.createElement('nav');
    sidebar.className = 'setu-sidebar';
    sidebar.setAttribute('aria-label', 'Dashboard sections');

    const brandBox = document.createElement('div');
    brandBox.style.padding = '0.4rem 0.5rem 0.85rem';
    brandBox.style.borderBottom = '1px solid rgba(255,255,255,0.15)';
    brandBox.style.marginBottom = '0.4rem';
    const bName = document.createElement('strong');
    bName.style.display = 'block';
    bName.style.fontSize = '1.08rem';
    bName.style.color = '#f5b041';
    bName.textContent = '🎓 ' + activeProfile.displayName;
    const bSub = document.createElement('small');
    bSub.style.display = 'block';
    bSub.style.color = '#cbd5e1';
    bSub.textContent = 'Class ' + activeProfile.classLevel + ' · ' + activeProfile.board;
    const bRole = document.createElement('span');
    bRole.className = 'setu-role-badge';
    bRole.textContent = ui.firebase.user
      ? 'Guardian connected · this sample learner profile is stored on this device'
      : 'Local demo learner · sign-in is optional';
    brandBox.append(bName, bSub, bRole);
    sidebar.appendChild(brandBox);

    const navItems = [
      { id: 'home', group: 'LEARN', icon: '⌂', label: 'Home' },
      { id: 'chapters', group: 'LEARN', icon: '▤', label: 'Courses & topics' },
      { id: 'learn', group: 'LEARN', icon: '✎', label: 'Diagnostic practice' },
      { id: 'formats', group: 'LEARN', icon: '▦', label: 'Practice formats' },
      { id: 'doubt', group: 'SUPPORT', icon: '?', label: 'Doubt support' },
      { id: 'analytics', group: 'INSIGHTS', icon: '▥', label: 'Progress' },
      { id: 'family', group: 'FAMILY', icon: '◎', label: 'Family & profile' }
    ];
    let previousNavGroup = '';
    for (const item of navItems) {
      if (item.group !== previousNavGroup) {
        const groupLabel = document.createElement('span');
        groupLabel.className = 'setu-nav-group';
        groupLabel.textContent = item.group;
        sidebar.appendChild(groupLabel);
        previousNavGroup = item.group;
      }
      const nb = document.createElement('button');
      nb.type = 'button';
      nb.className = 'setu-nav-btn' + (activeSidebarSection === item.id ? ' active' : '');
      nb.dataset.page = item.id;
      nb.setAttribute('aria-label', item.id === 'home' ? `Home, Class ${activeProfile.classLevel}` : item.label);
      nb.setAttribute('aria-current', activeSidebarSection === item.id ? 'page' : 'false');
      const icon = document.createElement('span');
      icon.className = 'setu-nav-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = item.icon;
      const label = document.createElement('span');
      label.textContent = item.id === 'home' ? `Home · Class ${activeProfile.classLevel}` : item.label;
      nb.append(icon, label);
      nb.addEventListener('click', () => {
        navigateSection(item.id);
      });
      sidebar.appendChild(nb);
    }

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.className = 'setu-nav-btn';
    logoutBtn.style.marginTop = '0.5rem';
    logoutBtn.style.borderTop = '1px solid rgba(255,255,255,0.15)';
    logoutBtn.textContent = '↩ Exit local demo';
    logoutBtn.addEventListener('click', () => {
      setDemoOpen(false);
      onboardingStep = 'welcome';
      renderSetuV2Enhancements();
    });
    sidebar.appendChild(logoutBtn);

    // RIGHT STAGE
    const stage = document.createElement('div');
    stage.className = 'setu-stage-panel';
    stage.dataset.page = activeSidebarSection;

    const pageMeta = {
      home: { eyebrow: 'LEARNING HOME', title: 'Your learning home', description: 'Pick up a concept, explore the draft course map, or see what you have practised.' },
      chapters: { eyebrow: 'COURSE LIBRARY', title: 'Courses & topics', description: 'Browse the current sample subject and topic map. The material is a draft and has not been matched to an approved edition.' },
      learn: { eyebrow: 'LEARN', title: 'Diagnostic practice', description: 'Choose an answer, reflect on your reasoning, and review the draft explanation.' },
      formats: { eyebrow: 'PRACTICE', title: 'Practice in different ways', description: 'Try the sample activities. Their answer keys and language still need subject and speaker review.' },
      doubt: { eyebrow: 'LEARNING SUPPORT', title: 'Doubt support', description: 'Live AI tutoring is not enabled in this build. Use the available reviewed learning path when it is ready.' },
      analytics: { eyebrow: 'YOUR ACTIVITY', title: 'Progress', description: 'A view of recorded practice activity on this device. These measures do not establish mastery.' },
      family: { eyebrow: 'FAMILY SPACE', title: 'Family & profile', description: 'Manage this device’s sample learner profile and optional guardian progress sync.' }
    }[activeSidebarSection];
    const pageHeading = document.createElement('header');
    pageHeading.className = 'setu-page-heading';
    const pageEyebrow = document.createElement('span');
    pageEyebrow.className = 'setu-page-eyebrow';
    pageEyebrow.textContent = pageMeta.eyebrow;
    const pageTitle = document.createElement('h1');
    pageTitle.textContent = pageMeta.title;
    const pageDescription = document.createElement('p');
    pageDescription.textContent = pageMeta.description;
    const context = document.createElement('div');
    context.className = 'setu-context-chip';
    const contextEn = document.createElement('span');
    contextEn.textContent = `Class ${activeProfile.classLevel} · ${activeProfile.activeSubject} · ${currentChapter.title}`;
    const contextOr = document.createElement('span');
    contextOr.setAttribute('lang', 'or');
    contextOr.textContent = currentChapter.odiaTitle || currentChapter.titleOr || '';
    context.append(...(familyAccount.odiaFirst ? [contextOr, contextEn] : [contextEn, contextOr]));
    pageHeading.append(pageEyebrow, pageTitle, pageDescription, context);
    stage.appendChild(pageHeading);

    const telemBar = document.createElement('div');
    telemBar.className = 'setu-telemetry-bar';
    telemBar.textContent = '📡 System Status: ' + lastTelemetry;
    stage.appendChild(telemBar);

    const reviewNotice = document.createElement('p');
    reviewNotice.className = 'setu-role-badge';
    reviewNotice.setAttribute('role', 'note');
    reviewNotice.textContent = 'Prototype only: question keys, topic mapping, and Odia text are unreviewed drafts. Use synthetic responses; do not enter personal information. Progress stays in this browser.';
    stage.appendChild(reviewNotice);

    const topBar = document.createElement('div');
    topBar.className = 'setu-page-tools';
    const toggleGroup = document.createElement('div');
    toggleGroup.className = 'cri-chip-row';

    const langBtn = document.createElement('button');
    langBtn.type = 'button';
    langBtn.className = 'secondary-button';
    langBtn.setAttribute('aria-pressed', String(Boolean(familyAccount.odiaFirst)));
    langBtn.setAttribute('aria-label', 'Change the display order of bilingual questions and explanations');
    langBtn.textContent = familyAccount.odiaFirst ? 'ଓଡ଼ିଆ ପ୍ରଥମ · Odia first' : 'English first · ଓଡ଼ିଆ ପରେ';
    langBtn.addEventListener('click', () => {
      familyAccount.odiaFirst = !familyAccount.odiaFirst;
      saveFamilyAccount();
      renderSetuV2Enhancements();
    });

    const languageStatus = document.createElement('span');
    languageStatus.className = 'setu-language-status';
    languageStatus.setAttribute('role', 'status');
    languageStatus.textContent = familyAccount.odiaFirst
      ? 'Bilingual questions show Odia first; English remains visible.'
      : 'Bilingual questions show English first; Odia remains visible.';

    const modelStatus = document.createElement('span');
    modelStatus.className = 'setu-role-badge';
    modelStatus.textContent = ui.provider === 'chain' || ui.provider === 'groq'
      ? 'A hosted provider is configured for the core diagnostic route; this dashboard exercise still uses local draft-key checks'
      : 'Local demo rules only · no live model call from this exercise';

    toggleGroup.append(langBtn, languageStatus, modelStatus);
    topBar.append(toggleGroup);
    stage.appendChild(topBar);

    const activeMetaBar = document.createElement('p');
    activeMetaBar.className = 'muted setu-source-note';
    activeMetaBar.textContent = 'Current draft topic: ' + currentChapter.title + ' · Source edition and page are not verified.';
    stage.appendChild(activeMetaBar);

    // =========================================================================
    // VIEW 1: UNIFIED DIAGNOSTIC PRACTICE (NO OLD BEIGE PROTOTYPE! 100% CONNECTED TO ACTIVE CHAPTER!)
    // =========================================================================
    if (activeSidebarSection === 'learn') {
      const stripRow = document.createElement('div');
      stripRow.className = 'agent-strip-row';
      for (const s of steps) {
        const chip = document.createElement('span');
        chip.className = 'agent-step-chip' + (s.state === 'done' ? ' done' : '');
        chip.textContent = s.step + ': ' + s.label;
        stripRow.appendChild(chip);
      }
      stage.appendChild(stripRow);

      // Quick Subject & Chapter Switcher right inside Diagnostic Practice so they are always in sync!
      const syncPickerRow = document.createElement('div');
      syncPickerRow.className = 'cri-chip-row';
      syncPickerRow.style.marginBottom = '1rem';
      for (const sub of activeSubjects) {
        const sb = document.createElement('button');
        sb.type = 'button';
        sb.className = activeProfile.activeSubject === sub ? 'primary-button' : 'secondary-button';
        sb.textContent = '📚 ' + sub;
        sb.addEventListener('click', () => {
          activeProfile.activeSubject = sub;
          const chs = chaptersForClassAndSubject(activeProfile.classLevel, sub, activeProfile.board);
          activeProfile.activeChapterId = chs[0]?.id || '';
          unifiedQuestionIndex = 0;
          unifiedSelectedOption = null;
          unifiedFeedback = null;
          saveFamilyAccount();
          renderSetuV2Enhancements();
        });
        syncPickerRow.appendChild(sb);
      }
      stage.appendChild(syncPickerRow);

      const pool = getUnifiedDiagnosticPool(activeProfile, currentChapter, livePack);
      const activeQ = pool[unifiedQuestionIndex % pool.length] || pool[0];
      const meta = BLOOM_BY_ITEM_ID[activeQ.id] || { bloom: 'APPLY', cognitiveLoad: 'MEDIUM', videoTopic: activeProfile.board + ' Class ' + activeProfile.classLevel + ' ' + currentChapter.title + ' Odia' };

      const pLayout = document.createElement('div');
      pLayout.className = 'setu-practice-layout';

      // Left Column: Unified Diagnostic Question Card
      const qCard = document.createElement('div');
      qCard.className = 'setu-q-card';

      const qTop = document.createElement('div');
      qTop.className = 'card-header';
      const qIdBadge = document.createElement('span');
      qIdBadge.className = 'small-label';
      const thinkingGoal = BLOOM_STUDENT_GUIDE[meta.bloom] || BLOOM_STUDENT_GUIDE.UNCLASSIFIED;
      qIdBadge.textContent = 'QUESTION ' + activeQ.id + ' · ' + currentChapter.title.toUpperCase() + ' · THINKING GOAL: ' + (BLOOM_BY_ITEM_ID[activeQ.id] ? thinkingGoal.label : BLOOM_STUDENT_GUIDE.UNCLASSIFIED.label);
      const qStepBadge = document.createElement('span');
      qStepBadge.className = 'small-label';
      qStepBadge.textContent = 'ITEM ' + ((unifiedQuestionIndex % pool.length) + 1) + ' OF ' + pool.length;
      qTop.append(qIdBadge, qStepBadge);
      qCard.appendChild(qTop);

      const qEn = document.createElement('h3');
      qEn.style.fontSize = '1.25rem';
      qEn.style.marginTop = '0.4rem';
      qEn.textContent = activeQ.promptEn;
      const qOr = document.createElement('div');
      qOr.className = 'setu-q-odia-prompt';
      qOr.setAttribute('lang', 'or');
      qOr.textContent = activeQ.promptOr;
      qCard.append(...(familyAccount.odiaFirst ? [qOr, qEn] : [qEn, qOr]));

      const optList = document.createElement('div');
      for (const opt of (activeQ.options || [])) {
        const ob = document.createElement('button');
        ob.type = 'button';
        ob.className = 'setu-opt-btn' + (unifiedSelectedOption === opt.id ? ' selected' : '');
        const badge = document.createElement('span');
        badge.className = 'setu-opt-badge';
        badge.textContent = opt.id;
        const txtWrap = document.createElement('div');
        const tOr = document.createElement('div');
        tOr.setAttribute('lang', 'or');
        tOr.style.fontWeight = '700';
        tOr.style.fontSize = '1.08rem';
        tOr.textContent = opt.textOr;
        const tEn = document.createElement('div');
        tEn.className = 'muted';
        tEn.textContent = opt.textEn;
        txtWrap.append(...(familyAccount.odiaFirst ? [tOr, tEn] : [tEn, tOr]));
        ob.append(badge, txtWrap);
        ob.addEventListener('click', () => {
          unifiedSelectedOption = opt.id;
          renderSetuV2Enhancements();
        });
        optList.appendChild(ob);
      }
      qCard.appendChild(optList);

      // Reasoning Textarea
      const rLabel = document.createElement('label');
      rLabel.className = 'small-label';
      rLabel.style.display = 'block';
      rLabel.style.marginTop = '0.85rem';
      rLabel.textContent = 'EXPLAIN YOUR THINKING (IN ODIA OR ENGLISH — OPTIONAL):';
      const rInput = document.createElement('textarea');
      rInput.className = 'setu-textarea-ingest';
      rInput.placeholder = 'Write why you chose this option in Odia or English...';
      rInput.value = unifiedReasoningText;
      rInput.addEventListener('input', (e) => {
        unifiedReasoningText = e.target.value;
      });
      qCard.append(rLabel, rInput);
      const privacyNote = document.createElement('p');
      privacyNote.className = 'muted';
      privacyNote.textContent = 'If Gemini or Groq is configured and connected, your selected option and this explanation are sent to the Pathasetu server and hosted provider for a provisional re-check. The mock processes the request on the server without semantic language understanding. Use synthetic responses only; do not include names or other personal details.';
      qCard.appendChild(privacyNote);

      // CRI Confidence Chips
      const criLabel = document.createElement('p');
      criLabel.className = 'small-label';
      criLabel.style.marginTop = '0.6rem';
      criLabel.textContent = 'CERTAINTY OF RESPONSE INDEX (CRI) — HOW SURE ARE YOU?';
      qCard.appendChild(criLabel);

      const criRow = document.createElement('div');
      criRow.className = 'cri-chip-row';
      for (const co of [
        { id: 'sure', label: '🎯 ନିଶ୍ଚିତ · Sure' },
        { id: 'unsure', label: '🤔 ସନ୍ଦେହ · Unsure' },
        { id: 'guessing', label: '🎲 ଅନୁମାନ · Guessing' }
      ]) {
        const cb = document.createElement('button');
        cb.type = 'button';
        cb.className = selectedCri === co.id ? 'primary-button' : 'secondary-button';
        cb.textContent = co.label;
        cb.addEventListener('click', () => {
          selectedCri = co.id;
          criByAnswerId[activeQ.id] = co.id;
          renderSetuV2Enhancements();
        });
        criRow.appendChild(cb);
      }
      qCard.appendChild(criRow);

      // Action Buttons: Check My Thinking | Skip & Show Explanation | Next Question
      const actRow = document.createElement('div');
      actRow.className = 'cri-chip-row';
      actRow.style.marginTop = '1rem';

      const checkBtn = document.createElement('button');
      checkBtn.type = 'button';
      checkBtn.className = 'primary-button';
      checkBtn.textContent = '✓ Check My Thinking →';
      checkBtn.addEventListener('click', async () => {
        if (!unifiedSelectedOption) {
          unifiedFeedback = { type: 'warn', title: 'Select an option first', or: 'ଦୟାକରି A, B, C କିମ୍ବା D ମଧ୍ୟରୁ ଗୋଟିଏ ବିକଳ୍ପ ବାଛନ୍ତୁ ।', en: 'Please choose option A, B, C, or D before checking.' };
          renderSetuV2Enhancements();
          return;
        }
        const isCorrect = unifiedSelectedOption === activeQ.correctOptionId;
        let providerResult = null;
        // Also record in ui.state if this is an Electricity pack item so Analytics & Stoplights update live!
        if (typeof ui !== 'undefined' && ui.pack && ui.state && ui.pack.items.some((it) => it.id === activeQ.id)) {
          try {
            const submitted = submitAnswer({ state: ui.state, pack: ui.pack, itemId: activeQ.id, optionId: unifiedSelectedOption,
              explanation: unifiedReasoningText, online: ui.reachable });
            ui.state = submitted.state;
            const submittedAnswerId = submitted.answer.id;
            await saveRecord();
            providerResult = { status: 'pending', provider: ui.provider, answerId: submittedAnswerId };
          } catch (error) {
            providerResult = { status: 'local_only', reason: error?.message || 'recheck_unavailable' };
          }
        }
        unifiedFeedback = {
          type: isCorrect ? 'correct' : 'draft_key_mismatch',
          title: isCorrect
            ? '✓ This choice matches the unreviewed draft answer key (Option ' + activeQ.correctOptionId + ').'
          : '✗ This choice does not match the unreviewed draft answer key (Option ' + activeQ.correctOptionId + '). This is not a diagnosis.',
          or: activeQ.explanationOr,
          en: activeQ.explanationEn,
          providerResult,
          itemId: activeQ.id
        };
        renderSetuV2Enhancements();
        if (providerResult?.status === 'pending' && ui.reachable) void drainQueue();
      });

      const skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.className = 'secondary-button';
      skipBtn.textContent = '⏭️ ଜଣାନାହିଁ · ବୁଝାନ୍ତୁ (Skip & Show Explanation)';
      skipBtn.addEventListener('click', () => {
        unifiedFeedback = {
          type: 'skipped',
          title: '📖 Draft explanation · unreviewed answer key: Option ' + activeQ.correctOptionId,
          or: activeQ.explanationOr,
          en: activeQ.explanationEn
        };
        renderSetuV2Enhancements();
      });

      const nextQBtn = document.createElement('button');
      nextQBtn.type = 'button';
      nextQBtn.className = 'secondary-button';
      nextQBtn.textContent = 'Next Question (' + (((unifiedQuestionIndex + 1) % pool.length) + 1) + '/' + pool.length + ') →';
      nextQBtn.addEventListener('click', () => {
        unifiedQuestionIndex = (unifiedQuestionIndex + 1) % pool.length;
        unifiedSelectedOption = null;
        unifiedReasoningText = '';
        unifiedFeedback = null;
        renderSetuV2Enhancements();
      });

      actRow.append(checkBtn, skipBtn, nextQBtn);
      qCard.appendChild(actRow);

      if (unifiedFeedback) {
        const fbCard = document.createElement('div');
        fbCard.className = 'setu-skip-explanation-card';
        if (unifiedFeedback.type === 'draft_key_mismatch') {
          fbCard.style.borderColor = '#dc2626';
          fbCard.style.background = '#fef2f2';
          fbCard.style.color = '#7f1d1d';
        }
        const fbH = document.createElement('h3');
        fbH.textContent = unifiedFeedback.title;
        const fbOr = document.createElement('p');
        fbOr.setAttribute('lang', 'or');
        fbOr.style.fontSize = '1.12rem';
        fbOr.style.fontWeight = '700';
        fbOr.textContent = 'ଓଡ଼ିଆ ବୁଝାଣି: ' + unifiedFeedback.or;
        const fbEn = document.createElement('p');
        fbEn.textContent = 'English Explanation: ' + unifiedFeedback.en;
        fbCard.append(fbH, ...(familyAccount.odiaFirst ? [fbOr, fbEn] : [fbEn, fbOr]));
        if (unifiedFeedback.providerResult) {
          const providerInfo = document.createElement('p');
          providerInfo.className = 'muted';
          if (unifiedFeedback.providerResult.status === 'complete') {
            const result = unifiedFeedback.providerResult;
            providerInfo.textContent = `Provisional ${result.provider} re-check: ${result.diagnosis.type}${result.diagnosis.rationale ? ` — ${result.diagnosis.rationale}` : ''}. This model output is not teacher- or language-validated.`;
          } else if (unifiedFeedback.providerResult.status === 'pending') {
            providerInfo.textContent = 'Provisional server re-check queued; the local draft-key result above is not a diagnosis.';
          } else {
            providerInfo.textContent = 'No server re-check was completed; the local draft-key result above is not a diagnosis.';
          }
          fbCard.appendChild(providerInfo);
        }
        qCard.appendChild(fbCard);
      }

      // Right Column: Unified Agent Plan + Trilingual Word Bridge + Session Progress
      const sideCol = document.createElement('div');

      const planWidget = document.createElement('div');
      planWidget.className = 'setu-side-widget';
      const pwTitle = document.createElement('strong');
      pwTitle.textContent = '🧭 Agent Pedagogical Plan';
      const pwBody = document.createElement('p');
      pwBody.className = 'muted';
      pwBody.style.marginTop = '0.4rem';
      pwBody.textContent = 'Practising Class ' + activeProfile.classLevel + ' ' + activeProfile.activeSubject + ' ("' + currentChapter.title + '"). Choose an option and reflect on your reasoning. New AI questions are not generated in this build; this control is unavailable until a grounded generation route is implemented and tested.';
      const genMoreBtn = document.createElement('button');
      genMoreBtn.type = 'button';
      genMoreBtn.className = 'secondary-button';
      genMoreBtn.disabled = true;
      genMoreBtn.textContent = 'AI question generation unavailable';
      genMoreBtn.setAttribute('aria-describedby', 'ai-question-generation-status');
      const generationStatus = document.createElement('p');
      generationStatus.id = 'ai-question-generation-status';
      generationStatus.className = 'muted setu-feature-status';
      generationStatus.textContent = 'The current Gemini/Groq route checks a submitted answer; it does not create new questions. Existing draft questions remain available above.';
      planWidget.append(pwTitle, pwBody, genMoreBtn, generationStatus);
      sideCol.appendChild(planWidget);

      const bridgeWidget = document.createElement('div');
      bridgeWidget.className = 'setu-side-widget';
      const bwTitle = document.createElement('strong');
      bwTitle.textContent = '🔤 Trilingual Word Bridge (ଓଡ଼ିଆ ↔ ବିଜ୍ଞାନ ଶବ୍ଦ ↔ English)';
      const bwEv = document.createElement('p');
      bwEv.setAttribute('lang', 'or');
      bwEv.style.marginTop = '0.5rem';
      bwEv.textContent = 'ଦୈନନ୍ଦିନ ଓଡ଼ିଆ (Everyday): ' + (activeQ.bridge?.everydayOdia || currentChapter.summaryOr);
      const bwSc = document.createElement('p');
      bwSc.setAttribute('lang', 'or');
      bwSc.style.fontWeight = '700';
      bwSc.textContent = 'ପାଠ୍ୟପୁସ୍ତକ ଶବ୍ଦ (Textbook Odia): ' + (activeQ.bridge?.schoolOdiaTerm || currentChapter.odiaTitle);
      const bwEn = document.createElement('p');
      bwEn.className = 'muted';
      bwEn.textContent = 'English Term / Rule: ' + (activeQ.bridge?.englishTerm || currentChapter.formula);
      bridgeWidget.append(bwTitle, ...(familyAccount.odiaFirst ? [bwEv, bwSc, bwEn] : [bwEn, bwEv, bwSc]));
      sideCol.appendChild(bridgeWidget);

      const progWidget = document.createElement('div');
      progWidget.className = 'setu-side-widget';
      const prTitle = document.createElement('strong');
      prTitle.textContent = '📊 Session Learning State';
      const prBody = document.createElement('p');
      prBody.className = 'muted';
      prBody.style.marginTop = '0.4rem';
      prBody.textContent = 'Answers recorded on this device: ' + liveState.answers.length + ' · Pending re-checks: ' + liveState.recheckQueue.length + ' · Browser storage can be cleared by the device or browser.';
      progWidget.append(prTitle, prBody);
      sideCol.appendChild(progWidget);

      pLayout.append(qCard, sideCol);
      stage.appendChild(pLayout);
    }

    // =========================================================================
    // VIEW 2: TEXTBOOKS & CHAPTER INGESTION
    // =========================================================================
    if (activeSidebarSection === 'chapters') {
      const box = document.createElement('div');

      const subLabel = document.createElement('p');
      subLabel.className = 'small-label';
      subLabel.textContent = '1. YOUR CLASS ' + activeProfile.classLevel + ' SUBJECTS (' + activeProfile.board + ')';
      box.appendChild(subLabel);

      const subRow = document.createElement('div');
      subRow.className = 'cri-chip-row';
      for (const sub of activeSubjects) {
        const sb = document.createElement('button');
        sb.type = 'button';
        sb.className = activeProfile.activeSubject === sub ? 'primary-button' : 'secondary-button';
        sb.textContent = '📚 ' + sub;
        sb.addEventListener('click', () => {
          activeProfile.activeSubject = sub;
          const chs = chaptersForClassAndSubject(activeProfile.classLevel, sub, activeProfile.board);
          activeProfile.activeChapterId = chs[0]?.id || '';
          unifiedQuestionIndex = 0;
          saveFamilyAccount();
          renderSetuV2Enhancements();
        });
        subRow.appendChild(sb);
      }
      box.appendChild(subRow);

      const chLabel = document.createElement('p');
      chLabel.className = 'small-label';
      chLabel.style.marginTop = '0.85rem';
      chLabel.textContent = '2. SELECT A DRAFT TOPIC IN ' + activeProfile.activeSubject.toUpperCase() + ' (' + activeChapters.length + ' UNVERIFIED ENTRIES)';
      box.appendChild(chLabel);

      const chRow = document.createElement('div');
      chRow.className = 'cri-chip-row';
      for (const ch of activeChapters) {
        const isIngested = Boolean(ingestedChaptersMap[ch.id]);
        const chBtn = document.createElement('button');
        chBtn.type = 'button';
        chBtn.className = currentChapter.id === ch.id ? 'primary-button' : 'secondary-button';
        chBtn.textContent = (isIngested ? '✅ ' : '📖 ') + ch.title;
        chBtn.addEventListener('click', () => {
          activeProfile.activeChapterId = ch.id;
          unifiedQuestionIndex = 0;
          saveFamilyAccount();
          renderSetuV2Enhancements();
        });
        chRow.appendChild(chBtn);
      }
      box.appendChild(chRow);

      const dlRow = document.createElement('div');
      dlRow.className = 'cri-chip-row';
      dlRow.style.marginTop = '0.75rem';

      const dlSingleBtn = document.createElement('button');
      dlSingleBtn.type = 'button';
      dlSingleBtn.className = 'secondary-button';
      dlSingleBtn.disabled = true;
      dlSingleBtn.textContent = 'Textbook import · not available yet';

      const dlAllBtn = document.createElement('button');
      dlAllBtn.type = 'button';
      dlAllBtn.className = 'secondary-button';
      dlAllBtn.disabled = true;
      dlAllBtn.textContent = 'Batch import · not available yet';

      const practiceThisChBtn = document.createElement('button');
      practiceThisChBtn.type = 'button';
      practiceThisChBtn.className = 'primary-button';
      practiceThisChBtn.textContent = '📖 Practise This Chapter in Diagnostic View →';
      practiceThisChBtn.addEventListener('click', () => {
        unifiedQuestionIndex = 0;
        navigateSection('learn');
      });

      dlRow.append(dlSingleBtn, dlAllBtn, practiceThisChBtn);
      box.appendChild(dlRow);
      const importNote = document.createElement('p');
      importNote.className = 'setu-inline-note';
      importNote.textContent = 'Textbook import is disabled until official source editions, permissions, and a reviewed ingestion workflow are in place.';
      box.appendChild(importNote);

      const tbBanner = document.createElement('div');
      tbBanner.className = 'setu-textbook-banner';
      const tbH3 = document.createElement('h3');
      tbH3.textContent = '📝 Unverified topic draft — ' + currentChapter.title;
      const tbOr = document.createElement('p');
      tbOr.setAttribute('lang', 'or');
      tbOr.style.fontSize = '1.15rem';
      tbOr.style.marginTop = '0.45rem';
      tbOr.textContent = 'ଓଡ଼ିଆ ଖସଡ଼ା (ସମୀକ୍ଷା ହୋଇନାହିଁ): ' + (currentChapter.summaryOr || '');
      const tbEn = document.createElement('p');
      tbEn.style.color = '#cbd5e1';
      tbEn.textContent = 'English draft summary (not source-verified): ' + (currentChapter.summaryEn || '');
      tbBanner.append(tbH3, ...(familyAccount.odiaFirst ? [tbOr, tbEn] : [tbEn, tbOr]));

      if (currentChapter.formula) {
        const fBox = document.createElement('div');
        fBox.className = 'setu-formula-box';
        fBox.textContent = '📐 Key Formula / Rule: ' + currentChapter.formula;
        tbBanner.appendChild(fBox);
      }
      if (ingestedChaptersMap[currentChapter.id]) {
        const rec = ingestedChaptersMap[currentChapter.id];
        const ingMeta = document.createElement('p');
        ingMeta.style.marginTop = '0.55rem';
        ingMeta.style.color = '#86efac';
        ingMeta.style.fontWeight = '600';
        ingMeta.textContent = '✅ Ingested into Local Corpus · Source: ' + rec.officialPdfUrl + ' · Status: ' + rec.remoteStatus + ' · SHA-256: ' + rec.sha256.slice(0, 16) + '...';
        tbBanner.appendChild(ingMeta);
      }
      box.appendChild(tbBanner);

      if (currentChapter.sampleQ) {
        const sq = currentChapter.sampleQ;
        const sqCard = document.createElement('div');
        sqCard.className = 'stoplight-pill stoplight-green';
        sqCard.style.marginBottom = '1rem';
        const sqBadge = document.createElement('div');
        sqBadge.className = 'small-label';
        sqBadge.textContent = '✨ CHAPTER CHECKPOINT QUESTION · CLASS ' + activeProfile.classLevel + ' · ' + activeProfile.activeSubject;
        const sqOr = document.createElement('p');
        sqOr.setAttribute('lang', 'or');
        sqOr.style.fontSize = '1.15rem';
        sqOr.style.fontWeight = '700';
        sqOr.textContent = sq.promptOr;
        const sqEn = document.createElement('p');
        sqEn.className = 'muted';
        sqEn.textContent = sq.promptEn;

        const sqOptRow = document.createElement('div');
        sqOptRow.className = 'cri-chip-row';
        const sqKey = 'seed_' + currentChapter.id;
        for (const opt of sq.options) {
          const ob = document.createElement('button');
          ob.type = 'button';
          ob.className = chapterBankAnswers[sqKey] === opt.id ? 'primary-button' : 'secondary-button';
          ob.textContent = opt.id + ': ' + opt.textOr + ' (' + opt.textEn + ')';
          ob.addEventListener('click', () => {
            chapterBankAnswers[sqKey] = opt.id;
            renderSetuV2Enhancements();
          });
          sqOptRow.appendChild(ob);
        }
        sqCard.append(sqBadge, ...(familyAccount.odiaFirst ? [sqOr, sqEn] : [sqEn, sqOr]), sqOptRow);

        if (chapterBankAnswers[sqKey]) {
          const chosen = chapterBankAnswers[sqKey];
          const isRight = chosen === sq.correctOptionId;
          const fb = document.createElement('div');
          fb.className = 'setu-skip-explanation-card';
          const fbP1 = document.createElement('p');
          fbP1.style.fontWeight = '700';
          fbP1.textContent = isRight
            ? '✓ Sample answer matches this unreviewed draft key ' + sq.correctOptionId
            : '✗ Sample answer does not match this unreviewed draft key ' + sq.correctOptionId;
          const fbP2 = document.createElement('p');
          fbP2.setAttribute('lang', 'or');
          fbP2.textContent = sq.explanationOr;
          const fbP3 = document.createElement('p');
          fbP3.textContent = sq.explanationEn;
          fb.append(fbP1, ...(familyAccount.odiaFirst ? [fbP2, fbP3] : [fbP3, fbP2]));
          sqCard.appendChild(fb);
        }
        box.appendChild(sqCard);
      }

      stage.appendChild(box);
    }

    // =========================================================================
    // VIEW 3: HOME & STOPLIGHT OVERVIEW
    // =========================================================================
    if (activeSidebarSection === 'home') {
      const welcomePanel = document.createElement('section');
      welcomePanel.className = 'setu-home-welcome';
      const welcomeCopy = document.createElement('div');
      const welcomeEyebrow = document.createElement('span');
      welcomeEyebrow.className = 'setu-page-eyebrow';
      welcomeEyebrow.textContent = 'A SMALL STEP, AT YOUR PACE';
      const welcomeTitle = document.createElement('h2');
      welcomeTitle.textContent = 'Ready to learn one idea?';
      const welcomeText = document.createElement('p');
      welcomeText.textContent = `Continue with ${currentChapter.title}, or explore the sample topics for Class ${activeProfile.classLevel}.`;
      const welcomeOdia = document.createElement('p');
      welcomeOdia.className = 'setu-home-odia';
      welcomeOdia.setAttribute('lang', 'or');
      welcomeOdia.textContent = currentChapter.odiaTitle || currentChapter.titleOr || 'ଏହି ଅଧ୍ୟାୟର ଏକ ଧାରଣା ଶିଖନ୍ତୁ ।';
      const welcomeActions = document.createElement('div');
      welcomeActions.className = 'setu-home-actions';
      const continueBtn = document.createElement('button');
      continueBtn.type = 'button';
      continueBtn.className = 'primary-button';
      continueBtn.textContent = 'Start practice';
      continueBtn.addEventListener('click', () => {
        navigateSection('learn');
      });
      const browseBtn = document.createElement('button');
      browseBtn.type = 'button';
      browseBtn.className = 'secondary-button';
      browseBtn.textContent = 'Browse topics';
      browseBtn.addEventListener('click', () => {
        navigateSection('chapters');
      });
      welcomeActions.append(continueBtn, browseBtn);
      welcomeCopy.append(welcomeEyebrow, welcomeTitle, ...(familyAccount.odiaFirst ? [welcomeOdia, welcomeText] : [welcomeText, welcomeOdia]), welcomeActions);
      const homeStat = document.createElement('div');
      homeStat.className = 'setu-home-stat';
      const homeStatNumber = document.createElement('strong');
      homeStatNumber.textContent = String(liveState.answers.length);
      const homeStatLabel = document.createElement('span');
      homeStatLabel.textContent = liveState.answers.length === 1 ? 'practice attempt saved on this device' : 'practice attempts saved on this device';
      const homeStatHint = document.createElement('small');
      homeStatHint.textContent = ui.firebase.user
        ? 'Guardian connected · learner profile remains local until you sync'
        : 'Local learner profile · sign-in is optional';
      const homeAccountAction = document.createElement('button');
      homeAccountAction.type = 'button';
      homeAccountAction.className = 'setu-home-account-action';
      homeAccountAction.textContent = ui.firebase.user ? 'Manage cloud sync →' : 'Guardian sign-in & sync →';
      homeAccountAction.addEventListener('click', () => navigateSection('family'));
      homeStat.append(homeStatNumber, homeStatLabel, homeStatHint, homeAccountAction);
      welcomePanel.append(welcomeCopy, homeStat);
      stage.appendChild(welcomePanel);

      const stripTitle = document.createElement('p');
      stripTitle.className = 'small-label';
      stripTitle.textContent = 'HOW A PRACTICE STEP WORKS';
      stage.appendChild(stripTitle);

      const stripRow = document.createElement('div');
      stripRow.className = 'agent-strip-row';
      for (const s of steps) {
        const chip = document.createElement('span');
        chip.className = 'agent-step-chip' + (s.state === 'done' ? ' done' : '');
        chip.textContent = s.step + ': ' + s.label;
        stripRow.appendChild(chip);
      }
      stage.appendChild(stripRow);

      const lightTitle = document.createElement('p');
      lightTitle.className = 'small-label';
      lightTitle.style.marginTop = '0.85rem';
      lightTitle.textContent = '🚦 STOPLIGHT CONCEPT RUNNER';
      stage.appendChild(lightTitle);

      const lightGrid = document.createElement('div');
      lightGrid.className = 'setu-v2-grid';
      for (const c of stoplights) {
        const box = document.createElement('div');
        box.className = 'stoplight-pill stoplight-' + c.light;
        const h = document.createElement('strong');
        h.textContent = c.odiaTitle + ' · ' + c.title;
        const b = document.createElement('div');
        b.className = 'small-label';
        b.textContent = c.badge;
        const d = document.createElement('div');
        d.className = 'muted';
        d.textContent = c.detail;
        box.append(h, b, d);
        lightGrid.appendChild(box);
      }
      stage.appendChild(lightGrid);

      const ctaRow = document.createElement('div');
      ctaRow.className = 'cri-chip-row';
      ctaRow.style.marginTop = '1.15rem';
      const openTextbooksBtn = document.createElement('button');
      openTextbooksBtn.type = 'button';
      openTextbooksBtn.className = 'primary-button';
      openTextbooksBtn.textContent = '📝 Open draft topics for Class ' + activeProfile.classLevel + ' →';
      openTextbooksBtn.addEventListener('click', () => {
        navigateSection('chapters');
      });
      const openPracticeBtn = document.createElement('button');
      openPracticeBtn.type = 'button';
      openPracticeBtn.className = 'secondary-button';
      openPracticeBtn.textContent = '📖 Open Diagnostic Practice →';
      openPracticeBtn.addEventListener('click', () => {
        navigateSection('learn');
      });
      ctaRow.append(openTextbooksBtn, openPracticeBtn);
      stage.appendChild(ctaRow);
    }

    // =========================================================================
    // VIEW 4: MULTI-FORMAT PRACTICE
    // =========================================================================
    if (activeSidebarSection === 'formats') {
      const grid = document.createElement('div');
      grid.className = 'setu-v2-grid';
      for (const ex of MULTI_FORMAT_EXERCISES) {
        const card = document.createElement('div');
        card.className = 'stoplight-pill stoplight-yellow';
        const badge = document.createElement('div');
        badge.className = 'small-label';
        const thinkingGoal = BLOOM_STUDENT_GUIDE[ex.bloom] || BLOOM_STUDENT_GUIDE.UNCLASSIFIED;
        badge.textContent = ex.format + ' · THINKING GOAL: ' + thinkingGoal.label + ' · DRAFT — NOT CURRICULUM-VERIFIED';
        const pOr = document.createElement('p');
        pOr.setAttribute('lang', 'or');
        pOr.textContent = ex.promptOr;
        const pEn = document.createElement('p');
        pEn.className = 'muted';
        pEn.textContent = ex.promptEn;

        const btnRow = document.createElement('div');
        btnRow.className = 'cri-chip-row';
        const sampleChoices = ex.id === 'FMT_NUM_01'
          ? ['0.4', '2.5', '90']
          : ex.id === 'FMT_FILL_01'
          ? ['ବନ୍ଦ', 'closed', 'open']
          : ['ପ୍ରତିରୋଧ', 'resistance', 'current'];

        for (const choice of sampleChoices) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'secondary-button';
          b.textContent = 'Try: ' + choice;
          b.addEventListener('click', () => {
            multiFormatResults[ex.id] = gradeMultiFormatExercise(ex.id, choice);
            renderSetuV2Enhancements();
          });
          btnRow.appendChild(b);
        }
        card.append(badge, ...(familyAccount.odiaFirst ? [pOr, pEn] : [pEn, pOr]), btnRow);

        if (multiFormatResults[ex.id]) {
          const res = multiFormatResults[ex.id];
          const rText = document.createElement('p');
          rText.style.marginTop = '0.4rem';
          rText.style.fontWeight = '600';
          const rEn = document.createElement('span');
          rEn.textContent = res.correct
            ? '✓ Correct. This matches the unreviewed draft key. ' + res.explanationEn
            : '✗ This differs from the unreviewed draft key. This is not a diagnosis. ' + res.explanationEn;
          const rOr = document.createElement('span');
          rOr.setAttribute('lang', 'or');
          rOr.textContent = res.explanationOr;
          rText.append(...(familyAccount.odiaFirst ? [rOr, rEn] : [rEn, rOr]));
          card.appendChild(rText);
        }
        grid.appendChild(card);
      }
      stage.appendChild(grid);
    }

    // =========================================================================
    // VIEW 5: LIVE AI DOUBT SOLVER
    // =========================================================================
    if (activeSidebarSection === 'doubt') {
      const dBox = document.createElement('div');
      dBox.className = 'setu-unavailable-panel';
      const dIcon = document.createElement('span');
      dIcon.className = 'setu-unavailable-icon';
      dIcon.setAttribute('aria-hidden', 'true');
      dIcon.textContent = '?';
      const dTitle = document.createElement('h2');
      dTitle.textContent = 'Live doubt tutoring is not available yet';
      const dDesc = document.createElement('p');
      dDesc.textContent = 'This build does not have a connected, reviewed tutoring flow. The configured Gemini/Groq route is not used here, so this page will not send your question to a model.';
      const dNext = document.createElement('p');
      dNext.className = 'setu-inline-note';
      dNext.textContent = 'When this feature is added, it needs source-grounded answers, clear model disclosure, language review, and a safe fallback before learners use it.';
      const dActions = document.createElement('div');
      dActions.className = 'setu-home-actions';
      const goPractice = document.createElement('button');
      goPractice.type = 'button';
      goPractice.className = 'primary-button';
      goPractice.textContent = 'Open diagnostic practice';
      goPractice.addEventListener('click', () => {
        navigateSection('learn');
      });
      const goTopics = document.createElement('button');
      goTopics.type = 'button';
      goTopics.className = 'secondary-button';
      goTopics.textContent = 'Explore topics';
      goTopics.addEventListener('click', () => {
        navigateSection('chapters');
      });
      dActions.append(goPractice, goTopics);
      dBox.append(dIcon, dTitle, dDesc, dNext, dActions);

      if (lastDoubtReply) {
        const replyCard = document.createElement('div');
        replyCard.className = 'setu-live-ai-box';
        const badge = document.createElement('div');
        badge.className = 'small-label';
        badge.textContent = '⚠️ UNVERIFIED MODEL RESPONSE · PROVIDER: ' + String(lastDoubtReply.provider || 'model').toUpperCase() + ' · MODEL: ' + (lastDoubtReply.model || 'unknown');
        const p1 = document.createElement('p');
        p1.setAttribute('lang', 'or');
        p1.style.fontWeight = '700';
        p1.style.fontSize = '1.15rem';
        p1.style.marginTop = '0.5rem';
        p1.textContent = 'ଓଡ଼ିଆ ଉତ୍ତର: ' + lastDoubtReply.odiaExplanation;
        const p2 = document.createElement('p');
        p2.textContent = 'English Explanation: ' + lastDoubtReply.englishExplanation;
        const pRule = document.createElement('div');
        pRule.className = 'setu-formula-box';
        pRule.style.background = '#0f172a';
        pRule.textContent = '📐 Key Rule / Example: ' + (lastDoubtReply.keyFormulaOrRule || '') + ' — ' + (lastDoubtReply.example || '');
        const p3 = document.createElement('p');
        p3.className = 'small-label';
        p3.style.marginTop = '0.5rem';
        p3.textContent = '🎬 Recommended Video Search Topic: "' + lastDoubtReply.videoSearchTopic + '"';
        replyCard.append(badge, p1, p2, pRule, p3);
        dBox.appendChild(replyCard);
      }
      stage.appendChild(dBox);
    }

    // =========================================================================
    // VIEW 6: PROGRESS & ANALYTICS
    // =========================================================================
    if (activeSidebarSection === 'analytics') {
      const aGrid = document.createElement('div');
      aGrid.className = 'setu-v2-grid';
      if (analytics.totalAttempts === 0) {
        const empty = document.createElement('div');
        empty.className = 'setu-empty-state';
        const emptyTitle = document.createElement('strong');
        emptyTitle.textContent = 'No practice activity recorded yet';
        const emptyBody = document.createElement('p');
        emptyBody.textContent = 'After a practice attempt, this page can summarize recorded choices. It cannot establish mastery or learning outcomes.';
        const emptyButton = document.createElement('button');
        emptyButton.type = 'button';
        emptyButton.className = 'primary-button';
        emptyButton.textContent = 'Start diagnostic practice';
        emptyButton.addEventListener('click', () => {
          navigateSection('learn');
        });
        empty.append(emptyTitle, emptyBody, emptyButton);
        stage.appendChild(empty);
      }
      const thinkingTitle = document.createElement('h3');
      thinkingTitle.textContent = 'Thinking practice';
      aGrid.appendChild(thinkingTitle);
      const thinkingNote = document.createElement('p');
      thinkingNote.className = 'muted';
      thinkingNote.textContent = 'These counts show answers that matched a draft answer key. They do not show mastery. Some questions have not been tagged with a thinking goal yet.';
      aGrid.appendChild(thinkingNote);
      for (const [bloomKey, val] of Object.entries(analytics.bloomSummary)) {
        const pill = document.createElement('div');
        // Counts are answer-key matches on draft material, not mastery or a positive/negative stoplight.
        pill.className = 'stoplight-pill';
        const st = document.createElement('strong');
        const guide = BLOOM_STUDENT_GUIDE[bloomKey] || BLOOM_STUDENT_GUIDE.UNCLASSIFIED;
        st.textContent = guide.label;
        const dt = document.createElement('div');
        dt.className = 'muted';
        dt.textContent = guide.description + ' ' + val.correct + ' / ' + val.total + ' answers matched the answer key.';
        pill.append(st, dt);
        aGrid.appendChild(pill);
      }
      const criPill = document.createElement('div');
      criPill.className = 'stoplight-pill stoplight-yellow';
      const cst = document.createElement('strong');
      cst.textContent = 'CRI Confidence Calibration (' + analytics.totalAttempts + ' total attempts)';
      const cdt = document.createElement('div');
      cdt.className = 'muted';
      cdt.textContent = 'Confident+Correct: ' + analytics.criSummary.confidentCorrect + ' · Lucky Guess: ' + analytics.criSummary.luckyGuess + ' · Overconfident Gap: ' + analytics.criSummary.overconfidentMisconception;
      criPill.append(cst, cdt);
      aGrid.appendChild(criPill);
      stage.appendChild(aGrid);
    }

    // =========================================================================
    // VIEW 7: PARENT / SWITCH PROFILE
    // =========================================================================
    if (activeSidebarSection === 'family') {
      const fBox = document.createElement('div');
      const pInfo = document.createElement('p');
      pInfo.textContent = 'Learner profiles stay local to this browser. Guardian sign-in is optional; it does not create a child account.';
      fBox.appendChild(pInfo);

      const cloudBox = document.createElement('section');
      cloudBox.className = 'side-card';
      cloudBox.setAttribute('aria-labelledby', 'guardian-cloud-title');
      cloudBox.style.margin = '1rem 0';
      const cloudTitle = document.createElement('h3');
      cloudTitle.id = 'guardian-cloud-title';
      cloudTitle.textContent = 'Guardian account · optional cloud progress';
      cloudBox.appendChild(cloudTitle);
      const cloudStatus = document.createElement('p');
      cloudStatus.id = 'guardian-cloud-status';
      cloudStatus.className = 'storage-status';
      cloudStatus.setAttribute('role', 'status');
      cloudStatus.textContent = ui.firebase.status;
      cloudBox.appendChild(cloudStatus);
      if (ui.firebase.enabled && !ui.firebase.user) {
        const signInButton = document.createElement('button');
        signInButton.type = 'button';
        signInButton.className = 'primary-button';
        signInButton.textContent = 'Sign in with Google as guardian';
        signInButton.disabled = !ui.firebase.client;
        signInButton.addEventListener('click', async () => {
          signInButton.disabled = true;
          cloudStatus.textContent = 'Opening Google sign-in…';
          try { await ui.firebase.client.signInWithGoogle(); }
          catch (error) {
            const code = typeof error?.code === 'string' && /^auth\/[a-z0-9-]+$/i.test(error.code) ? error.code : 'auth/unknown';
            const guidance = code === 'auth/operation-not-allowed'
              ? 'Enable Google in Firebase Authentication > Sign-in method.'
              : code === 'auth/unauthorized-domain'
                ? 'Add 127.0.0.1 in Firebase Authentication > Settings > Authorized domains.'
                : code === 'auth/network-request-failed'
                  ? 'The auth request failed. Check connectivity and browser privacy settings.'
                  : code === 'auth/invalid-api-key' || code === 'auth/app-not-authorized'
                    ? 'Check that this Web API key and Web App ID belong to the configured Firebase project.'
                    : 'Check the Google provider and authorized domain in Firebase Authentication.';
            cloudStatus.textContent = `Google sign-in failed: ${guidance} (${code})`;
            signInButton.disabled = false;
          }
        });
        cloudBox.appendChild(signInButton);
      } else if (ui.firebase.enabled && ui.firebase.user) {
        const syncButton = document.createElement('button');
        syncButton.type = 'button';
        syncButton.className = 'primary-button';
        syncButton.textContent = `Sync ${activeProfile.displayName} answer history`;
        syncButton.addEventListener('click', () => void syncCloudProgress(syncButton, cloudStatus));
        cloudBox.appendChild(syncButton);
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'secondary-button';
        deleteButton.style.marginTop = '.5rem';
        deleteButton.textContent = 'Delete this learner’s cloud progress';
        deleteButton.addEventListener('click', async () => {
          if (!confirm('Permanently delete this learner profile’s synced answer records from the signed-in guardian account? The local copy on this device will remain.')) return;
          deleteButton.disabled = true;
          try {
            const deleted = await ui.firebase.client.deleteLearnerProgress({ user: ui.firebase.user, profileId: familyAccount.activeProfileId });
            cloudStatus.textContent = `Deleted ${deleted} cloud answer record(s). The local browser copy remains.`;
          } catch { cloudStatus.textContent = 'Cloud deletion failed. No local progress was changed; retry when connected.'; }
          finally { deleteButton.disabled = false; }
        });
        cloudBox.appendChild(deleteButton);
        const signOutButton = document.createElement('button');
        signOutButton.type = 'button';
        signOutButton.className = 'secondary-button';
        signOutButton.style.marginTop = '.5rem';
        signOutButton.textContent = 'Sign out and clear this device';
        signOutButton.addEventListener('click', () => void signOutGuardian(cloudStatus));
        cloudBox.appendChild(signOutButton);
      }
      const cloudPrivacy = document.createElement('p');
      cloudPrivacy.className = 'storage-status';
      cloudPrivacy.textContent = 'Cloud stores answer choice, question ID, time, and provisional category only. It never uploads written reasoning, drafts, retry queues, or traces. Sync is manual and merges histories.';
      cloudBox.appendChild(cloudPrivacy);
      fBox.appendChild(cloudBox);

      const profRow = document.createElement('div');
      profRow.className = 'cri-chip-row';
      for (const prof of familyAccount.profiles) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = prof.id === activeProfile.id ? 'primary-button' : 'secondary-button';
        b.textContent = (prof.id === activeProfile.id ? '✓ Active: ' : '👤 Switch to: ') + prof.displayName + ' (Class ' + prof.classLevel + ' · ' + prof.board + ')';
        b.addEventListener('click', () => {
          familyAccount.activeProfileId = prof.id;
          unifiedQuestionIndex = 0;
          unifiedFeedback = null;
          saveFamilyAccount();
          navigateSection('home');
        });
        profRow.appendChild(b);
      }
      fBox.appendChild(profRow);

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'primary-button';
      addBtn.style.marginTop = '1rem';
      addBtn.textContent = 'Adding learner accounts is unavailable in the local demo';
      addBtn.disabled = true;
      fBox.appendChild(addBtn);

      const parentEditTitle = document.createElement('p');
      parentEditTitle.className = 'small-label';
      parentEditTitle.style.marginTop = '1.25rem';
      parentEditTitle.textContent = 'PARENT OVERRIDE: CHANGE CLASS OR BOARD FOR ' + activeProfile.displayName.toUpperCase();
      fBox.appendChild(parentEditTitle);

      const brdRow = document.createElement('div');
      brdRow.className = 'cri-chip-row';
      for (const b of SUPPORTED_BOARDS) {
        const bb = document.createElement('button');
        bb.type = 'button';
        bb.className = activeProfile.board === b.id ? 'primary-button' : 'secondary-button';
        bb.textContent = '🏛️ ' + b.label;
        bb.addEventListener('click', () => {
          activeProfile.board = b.id;
          const chs = chaptersForClassAndSubject(activeProfile.classLevel, activeProfile.activeSubject, b.id);
          activeProfile.activeChapterId = chs[0]?.id || '';
          unifiedQuestionIndex = 0;
          saveFamilyAccount();
          renderSetuV2Enhancements();
        });
        brdRow.appendChild(bb);
      }
      fBox.appendChild(brdRow);

      const classRow = document.createElement('div');
      classRow.className = 'cri-chip-row';
      classRow.style.marginTop = '0.5rem';
      for (const cls of SUPPORTED_CLASSES) {
        const cb = document.createElement('button');
        cb.type = 'button';
        cb.className = activeProfile.classLevel === cls ? 'primary-button' : 'secondary-button';
        cb.textContent = 'Assign Class ' + cls;
        cb.addEventListener('click', () => {
          activeProfile.classLevel = cls;
          activeProfile.displayName = activeProfile.displayName.replace(/Class \d+/, 'Class ' + cls);
          const subs = subjectsForClass(cls);
          activeProfile.activeSubject = subs[0];
          const chs = chaptersForClassAndSubject(cls, subs[0], activeProfile.board);
          activeProfile.activeChapterId = chs[0]?.id || '';
          unifiedQuestionIndex = 0;
          saveFamilyAccount();
          renderSetuV2Enhancements();
        });
        classRow.appendChild(cb);
      }
      fBox.appendChild(classRow);
      stage.appendChild(fBox);
    }

    shell.append(sidebar, stage);
    container.appendChild(shell);
  } finally {
    v2RenderLock = false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderSetuV2Enhancements, 20);
  });
  window.addEventListener('load', () => setTimeout(renderSetuV2Enhancements, 60));
  setTimeout(renderSetuV2Enhancements, 50);
}

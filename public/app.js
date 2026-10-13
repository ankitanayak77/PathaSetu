import { initialState, submitAnswer, recheckQueued, appendTrace, recordRecheckDeferred, reconcileState, manualRetryQueue } from '/core/agent.js';
import { RETRY_POLICY, normalisePolicy, isDue, nextDueAtMs, queueStatus } from '/core/retry.js';
import { buildBridgeExercise, gradeBridgeAnswer, recordBridgeAttempt, recordBridgeReveal } from '/core/bridge.js';
import { createIndexedDbStorage } from '/core/storage.js';

const $ = (id) => document.getElementById(id);
const storage = createIndexedDbStorage();
const ui = { reachable: false, probing: true, provider: 'mock', model: null, accessRequired: false, accessAuthorized: true, writerMode: 'starting', writable: true, releaseWriterLock: null, notice: null, lastResult: null, probeDelay: 2000, probeTimer: null, draftTimer: null, draining: false, traceOpen: false, pack: null, state: null, drafts: {}, loaded: false, submitting: false, bridge: null };
const RECHECK_TIMEOUT_MS = 8000;
// Bounded automatic retries (see src/core/retry.js). The override exists only so browser tests can use short delays.
function retryPolicy() { return normalisePolicy({ ...RETRY_POLICY, ...(globalThis.__PATHASETU_TEST_RETRY_POLICY__ ?? {}) }); }

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
  try { await storage.save({ pack: ui.pack, state: ui.state, drafts: ui.drafts, savedAt: new Date().toISOString() }); }
  catch (error) { notice('warning', 'Local save warning', 'The browser could not confirm that progress was saved. Keep this session open and export the trace if needed.'); console.error('local_save_failed', error?.name ?? 'Error'); }
  const status = $('storage-status');
  if (status) {
    status.classList.toggle('good', storage.persistent);
    status.classList.toggle('warning', !storage.persistent);
    status.textContent = storage.persistent ? 'Saved in this browser’s IndexedDB on this device.' : 'Memory-only fallback. Do not close or reload this tab; progress may be lost.';
  }
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
      <div class="explanation-block"><div class="field-heading"><label for="explanation-input">How would you explain your choice?</label><span class="optional-tag">Optional, but helpful</span></div><textarea id="explanation-input" class="explanation-input" maxlength="1000" ${disabled} placeholder="Type in your own words. This mock does not interpret the explanation.">${esc(draft.explanation)}</textarea><div class="form-footer"><span class="form-hint">${awaitingContinue ? 'Review the feedback and remediation below, then continue to the recommended activity.' : 'Any result is provisional. The configured provider’s Odia understanding has not been validated.'}</span><button id="submit-answer" class="primary-button" type="submit" ${draft.optionId && ui.writable && !awaitingContinue ? '' : 'disabled'}>Check my thinking <span aria-hidden="true">→</span></button></div></div>
    </form>
    ${prior ? `<div class="result-card"><div class="result-kicker">LATEST ATTEMPT · ${esc(prior.mode.replaceAll('_', ' '))}</div><h4 class="result-title">${prior.diagnosis.type === 'UNCERTAIN' ? 'Let’s clarify your thinking' : prior.diagnosis.type === 'NONE' ? 'Answer key match (not independently verified)' : 'Possible concept gap — provisional'}</h4><p class="result-text">${esc(prior.diagnosis.rationale)} ${prior.mode.includes('GROQ') ? 'This hosted-model proposal remains provisional and has not been evaluated for learning accuracy.' : 'This result is from a deterministic demo rule, not semantic understanding of the explanation.'}</p><div class="result-action"><strong>Next learning action</strong><br>${esc(item.remediation)}</div></div>` : ''}`;

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
  $('plan-reason').textContent = queued ? `You have ${queued} re-check${queued === 1 ? '' : 's'} waiting. The local rule keeps the lesson moving; all mock/model proposals remain provisional.` : recommendedId === item.id ? `The latest re-check recommends ${item.id} because it revisits the same concept with a different question. The active question and its draft were kept unchanged.` : answerCount === 0 ? `Starting with ${item.id}, the first available question in the local Electricity pack. There is no learner history to prioritize yet.` : `The deterministic planner selected ${item.id} from the available pack using concept focus and prior attempts. The rationale is recorded in the trace.`;
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
}

function renderProgress() {
  $('answers-count').textContent = String(ui.state?.answers?.length ?? 0);
  $('queue-count').textContent = String(ui.state?.queue?.length ?? 0);
  const sessions = Math.max(0, Number(ui.state?.learner?.sessionsRemaining ?? 0));
  $('sessions-label').textContent = `${sessions} learning session${sessions === 1 ? '' : 's'} left`;
  $('storage-status').classList.toggle('good', storage.persistent);
  $('storage-status').classList.toggle('warning', !storage.persistent);
  $('storage-status').textContent = storage.persistent ? 'Saved in this browser’s IndexedDB on this device.' : 'Memory-only fallback. Do not close or reload this tab; progress may be lost.';
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

function renderConnection() {
  const pill = $('connection-pill');
  pill.classList.toggle('online', ui.reachable);
  pill.classList.toggle('offline', !ui.reachable && !ui.probing);
  $('connection-label').textContent = ui.probing ? 'Checking connection' : ui.reachable ? 'ONLINE · sync available' : 'OFFLINE · local mode';
  $('provider-label').textContent = ui.provider === 'groq' ? `CONFIGURED · GROQ${ui.model ? ` · ${ui.model}` : ''} · ACCURACY UNVALIDATED` : 'MOCK PROVIDER · DEMO RULES · NO LIVE AI';
}

function renderWriterBanner() {
  const root = $('writer-banner');
  const messages = { locked: ['Read-only session', 'Another Pathasetu tab owns the writable session. This tab will not save answers or process re-checks. Close the other tab, then reload this one.'], unavailable: ['Single-tab protection unavailable', 'This browser does not provide Web Locks here. Keep only one Pathasetu tab open to avoid conflicting progress.'] };
  const message = messages[ui.writerMode];
  root.classList.toggle('hidden', !message);
  root.innerHTML = message ? `<span class="notice-icon" aria-hidden="true">!</span><div><strong>${esc(message[0])}</strong>${esc(message[1])}</div>` : '';
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
    const footer = online ? (ui.provider === 'groq' ? ' The hosted-model result remains provisional; language accuracy has not been validated and mastery is never confirmed automatically.' : ' The deterministic mock does not interpret the free-text explanation and never confirms mastery.') : ' This local result remains provisional; reconnect will process the queued re-check.';
    notice(online ? 'success' : 'warning', heading, `${details} ${remediation} ${online ? 'A server re-check is queued now.' : 'When the server is reachable, the queued re-check will be processed.'}${footer}`);
    renderAll();
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
      if (['mock', 'groq'].includes(info.provider)) { ui.provider = info.provider; ui.model = info.model ?? null; }
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
        // A stalled network or provider must not freeze the queue: abort after RECHECK_TIMEOUT_MS and count an attempt.
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), RECHECK_TIMEOUT_MS);
        let response; let data;
        try {
          response = await fetch('/api/recheck', { method: 'POST', cache: 'no-store', signal: controller.signal, headers: { 'content-type': 'application/json', accept: 'application/json', ...(accessCode ? { 'x-pathasetu-demo-code': accessCode } : {}) }, body: JSON.stringify({ itemId: item.id, optionId: answer.optionId, explanation: answer.explanation }) });
          if (response.status === 401) { ui.accessAuthorized = false; if (ui.accessRequired) $('access-overlay').classList.remove('hidden'); break; }
          if (!response.ok) throw new Error(`recheck_http_${response.status}`);
          data = await response.json();
        } catch (fetchError) {
          throw fetchError?.name === 'AbortError' ? new Error('recheck_timeout') : fetchError;
        } finally { clearTimeout(timer); }
        if (!['mock', 'groq'].includes(data.provider)) throw new Error('unexpected_provider');
        const result = recheckQueued({ state: ui.state, pack: ui.pack, queueId: entry.id, online: true, diagnosisOverride: data.diagnosis, trusted: false, provider: data.provider, now: new Date().toISOString(), policy });
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
  try {
    const code = sessionStorage.getItem('pathasetu_demo_code') || '';
    const response = await fetch('/api/pack', { cache: 'no-store', headers: code ? { 'x-pathasetu-demo-code': code } : {} });
    if (response.ok) latestPack = await response.json();
    else if (response.status === 401) {
      // Draft content needs the session code. Keep any pack already saved on this device and ask for the code.
      packRefused = true; ui.accessRequired = true; ui.accessAuthorized = false;
      sessionStorage.removeItem('pathasetu_demo_code');
      $('access-overlay').classList.remove('hidden');
    }
  } catch { /* offline: use the content pack persisted on first online use */ }
  ui.pack = latestPack?.items ? latestPack : saved?.pack ?? null;
  if (!ui.pack) {
    $('question-card').innerHTML = packRefused
      ? `<div class="loading-state"><div><strong>Enter the session code to load the demo content.</strong><br><span>The Electricity pack is unreviewed draft content and is protected on this server.</span></div></div>`
      : `<div class="loading-state"><div><strong>Pathasetu has no local content pack yet.</strong><br><span>Open the app once online so its content can be saved on this device.</span></div></div>`;
    ui.probing = false; ui.loaded = false; renderConnection();
    return;
  }
  ui.state = saved?.state ?? initialState(ui.pack);
  ui.drafts = saved?.drafts && typeof saved.drafts === 'object' ? saved.drafts : {};
  reconcileState(ui.state, ui.pack);
  if (ui.pack.demoDraftMode || ui.pack.items.some((item) => item.status !== 'PUBLISHED')) {
    notice('warning', 'Prototype content · not for real learners', 'The Electricity questions and Odia bridge fields are unreviewed drafts. Any diagnosis remains provisional until content review and model evaluation are complete.');
  }
  ui.loaded = true;
  await saveRecord();
  scheduleRetryTimer();
  renderAll();
  void refreshHealth();
}

$('trace-toggle').addEventListener('click', () => { ui.traceOpen = !ui.traceOpen; renderAll(); });
$('download-trace').addEventListener('click', () => {
  const payload = { product: 'Pathasetu', exportedAt: new Date().toISOString(), provider: ui.provider, model: ui.model, contentStatus: 'UNREVIEWED_DRAFT', state: ui.state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = `pathasetu-trace-${new Date().toISOString().slice(0, 10)}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('apply-plan-button').addEventListener('click', async () => {
  const id = ui.state.learner.nextRecommendedItemId;
  if (!ui.pack.items.some((item) => item.id === id)) return;
  const prior = ui.state.learner.currentItemId;
  ui.state.learner.currentItemId = id;
  ui.state.learner.nextRecommendedItemId = null;
  appendTrace(ui.state, { type: 'learner_applied_updated_plan', previousItemId: prior, currentItemId: id, reason: 'The learner explicitly accepted the updated recommendation.' });
  await saveRecord();
  notice('success', 'Learning plan updated', `The current question changed from ${prior} to ${id}. Any unfinished draft remains saved under its original question.`);
  renderAll();
});
window.addEventListener('online', () => { ui.probeDelay = 2000; void refreshHealth(); });
window.addEventListener('offline', () => { ui.reachable = false; ui.probing = false; renderConnection(); notice('warning', 'Connection changed', 'Pathasetu will keep local progress and retry reachability.'); });
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
    ui.accessAuthorized = response.ok;
    if (!response.ok) sessionStorage.removeItem('pathasetu_demo_code');
    $('access-overlay').classList.toggle('hidden', response.ok);
    return response.ok;
  } catch { ui.accessAuthorized = false; $('access-overlay').classList.remove('hidden'); return false; }
}

$('access-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const code = $('access-code').value;
  try {
    const response = await fetch('/api/session', { method: 'GET', cache: 'no-store', headers: { 'x-pathasetu-demo-code': code } });
    if (!response.ok) { $('access-error').textContent = 'That session code was not accepted.'; $('access-error').classList.remove('hidden'); return; }
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
}
void startApp();

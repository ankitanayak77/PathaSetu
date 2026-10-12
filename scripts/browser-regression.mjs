// Browser regression suite for the Pathasetu offline/reconnect journey. Zero dependencies: raw Chrome DevTools Protocol.
//   CHROME_PATH=/path/to/chrome npm run e2e            (all scenarios)
//   CHROME_PATH=... node scripts/browser-regression.mjs --only D,G
// Exit codes: 0 all passed, 1 at least one failed, 2 blocked (no browser) and nothing failed.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { HOST, sleep, freePort, startServer, launchChrome } from './lib/devtools.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'evidence', 'browser-regression-latest.json');
const onlyArg = process.argv.indexOf('--only');
const only = onlyArg > -1 ? new Set(process.argv[onlyArg + 1].split(',')) : null;
const results = { startedAt: new Date().toISOString(), checks: [], scenarios: [], limitation: 'Headless Chromium on one machine. Not a physical-phone test, not Samsung Internet, not iPhone Safari, not educational validation.' };
const allErrors = [];

function check(id, title, passed, detail = '') {
  results.checks.push({ id, title, passed, detail: String(detail).slice(0, 400) });
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${id}  ${title}${detail ? ` — ${String(detail).slice(0, 230)}` : ''}`);
}
const UI = `(() => ({
  question: document.querySelector('.question-id')?.textContent || '',
  answers: document.querySelector('#answers-count')?.textContent,
  queue: document.querySelector('#queue-count')?.textContent,
  sessions: document.querySelector('#sessions-label')?.textContent || '',
  notice: document.querySelector('#notice-region')?.innerText || '',
  banner: document.querySelector('#writer-banner')?.classList.contains('hidden') ? '' : (document.querySelector('#writer-banner')?.innerText || ''),
  bridgeButtonsDisabled: [...document.querySelectorAll('[data-bridge-option]')].length > 0 && [...document.querySelectorAll('[data-bridge-option]')].every((b) => b.disabled),
  recommendation: document.querySelector('#recommendation')?.innerText || '',
  applyVisible: !document.querySelector('#apply-plan-button')?.classList.contains('hidden'),
  provider: document.querySelector('#provider-label')?.textContent || '',
  connection: document.querySelector('#connection-label')?.textContent || '',
  badge: document.querySelector('.draft-badge')?.textContent || '',
  option: document.querySelector('input[name="answer-option"]:checked')?.value || '',
  text: document.querySelector('#explanation-input')?.value ?? null,
  focus: document.activeElement?.id || '',
  caret: document.querySelector('#explanation-input')?.selectionStart ?? null,
  allDisabled: [...document.querySelectorAll('input[name="answer-option"], #explanation-input, #submit-answer')].length > 0 && [...document.querySelectorAll('input[name="answer-option"], #explanation-input, #submit-answer')].every((e) => e.disabled),
  remediation: document.querySelector('.result-action')?.innerText || '',
  body: document.body.innerText
}))()`;
const READ_DB = `new Promise((res) => { const r = indexedDB.open('pathasetu-local-v1', 1); r.onerror = () => res(null); r.onsuccess = () => { try { const g = r.result.transaction('records', 'readonly').objectStore('records').get('session'); g.onsuccess = () => { r.result.close(); res(g.result ?? null); }; g.onerror = () => res(null); } catch { res(null); } }; })`;
const editDb = (body) => `new Promise((res, rej) => { const r = indexedDB.open('pathasetu-local-v1', 1); r.onerror = () => rej(r.error); r.onsuccess = () => { const db = r.result; const tx = db.transaction('records', 'readwrite'); const os = tx.objectStore('records'); const g = os.get('session'); g.onsuccess = () => { const rec = g.result; (function (rec) { ${body} })(rec); os.put(rec, 'session'); }; tx.oncomplete = () => { db.close(); res(true); }; tx.onerror = () => rej(tx.error); }; })`;
const submitExpr = (opt, text, times = 1) => `(() => { const radio = document.querySelector('input[name="answer-option"][value="${opt}"]'); const ta = document.querySelector('#explanation-input'); const form = document.querySelector('#answer-form'); if (!radio || !ta || !form) return { ok: false }; radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); ta.value = ${JSON.stringify(text)}; ta.dispatchEvent(new Event('input', { bubbles: true })); for (let i = 0; i < ${times}; i++) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); return { ok: true }; })()`;
const draftExpr = (opt, text, caret) => `(() => { const radio = document.querySelector('input[name="answer-option"][value="${opt}"]'); const ta = document.querySelector('#explanation-input'); radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); ta.focus(); ta.value = ${JSON.stringify(text)}; ta.dispatchEvent(new Event('input', { bubbles: true })); ta.setSelectionRange(${caret}, ${caret}); return document.activeElement.id; })()`;

async function withEnv(fn, { serverEnv = {}, root = ROOT, port } = {}) {
  const p = port ?? await freePort();
  const server = await startServer({ root, port: p, env: serverEnv });
  const chrome = await launchChrome();
  results.browser ??= await chrome.version();
  const env = { server, chrome, port: p, base: `http://localhost:${p}`, root };
  try { return await fn(env); } finally { await chrome.kill(); await server.stop(); }
}
async function ready(page, expectQuestion = 'EL01') {
  return page.waitFor(UI, (u) => u.question.includes(expectQuestion) && u.options !== 0, 12000, `question ${expectQuestion}`).catch(() => page.waitFor(UI, (u) => u.question.includes(expectQuestion), 12000, `question ${expectQuestion}`));
}
async function controlled(page) {
  await page.waitFor(`(async () => { const keys = await caches.keys(); let n = 0; for (const k of keys) n += (await (await caches.open(k)).keys()).length; return { controller: Boolean(navigator.serviceWorker.controller), cached: n }; })()`, (v) => v.controller && v.cached >= 8, 12000, 'service worker controlling and shell cached');
}
async function scenario(id, title, fn) {
  if (only && !only.has(id)) return;
  console.log(`\n== ${id}: ${title}`);
  const t0 = Date.now();
  try { await fn(); results.scenarios.push({ id, title, ms: Date.now() - t0, completed: true }); }
  catch (error) { check(`${id}.run`, `${title}: scenario ran to completion`, false, error.message); results.scenarios.push({ id, title, ms: Date.now() - t0, completed: false, error: error.message }); }
}

try { await fs.access(process.env.CHROME_PATH || '/usr/bin/chromium'); }
catch { console.log('BLOCKED: no Chrome/Chromium binary. Set CHROME_PATH.'); results.blocked = true; await fs.mkdir(path.dirname(OUT), { recursive: true }); await fs.writeFile(OUT, JSON.stringify(results, null, 2)); process.exit(2); }

// ---------------------------------------------------------------------------------------------------------------
await scenario('A', 'initial load, labels, first visit', async () => withEnv(async ({ chrome, base }) => {
  const page = await chrome.newPage(`${base}/`);
  const u = await ready(page);
  check('A1', 'initial question loads with 4 options', /EL01/.test(u.question), u.question);
  check('A2', 'provider label says MOCK', /MOCK/i.test(u.provider), `provider label = "${u.provider}"`);
  check('A3', 'draft-content labels are visible (badge and prototype warning)', /UNREVIEWED DRAFT/.test(u.badge) && /Prototype content/.test(u.notice), `badge="${u.badge}"`);
  await controlled(page); await sleep(900);
  const after = await page.evaluate(UI);
  check('A4', 'a first visit does not announce an "App update ready" notice', !/App update ready/.test(after.notice), after.notice.slice(0, 100));
  allErrors.push(...page.errors);
}));

await scenario('B', 'answer, feedback, explicit continue', async () => withEnv(async ({ chrome, base }) => {
  const page = await chrome.newPage(`${base}/`);
  await ready(page);
  await page.evaluate(submitExpr('A', 'The current keeps building up in the wire.'));
  const u = await page.waitFor(UI, (v) => v.answers === '1' && v.queue === '0' && v.applyVisible, 10000, 'answer processed');
  check('B1', 'answer shows provisional feedback and remediation while the current question stays', /EL01/.test(u.question) && /Trace the path/.test(u.remediation), `question=${u.question}`);
  check('B2', 'recommendation is offered but not applied automatically', /EL02/.test(u.recommendation) && /EL01/.test(u.question));
  await page.evaluate("document.querySelector('#apply-plan-button').click()");
  const v = await page.waitFor(UI, (x) => /EL02/.test(x.question), 5000, 'apply plan');
  check('B3', 'applying the recommendation explicitly changes the question', /EL02/.test(v.question), v.question);
  allErrors.push(...page.errors);
}));

await scenario('C', 'offline answer is queued exactly once', async () => withEnv(async ({ chrome, base }) => {
  const page = await chrome.newPage(`${base}/`);
  await ready(page); await controlled(page);
  await page.offline(true);
  await page.waitFor('navigator.onLine', (x) => x === false, 6000, 'offline');
  await sleep(300);
  const sessionsBefore = (await page.evaluate(UI)).sessions;
  await page.evaluate(submitExpr('A', 'The battery becomes empty immediately.', 2)); // two submits in the same tick, like a double tap
  await page.waitFor(UI, (v) => Number(v.answers) >= 1, 6000, 'answer recorded');
  await sleep(600);
  const u = await page.evaluate(UI);
  const rec = await page.evaluate(READ_DB);
  check('C1', 'one answer and one queue entry despite a double submit', u.answers === '1' && u.queue === '1' && rec?.state?.queue?.length === 1 && rec?.state?.answers?.length === 1, `answers=${u.answers}; queue=${u.queue}; persisted answers=${rec?.state?.answers?.length}; persisted queue=${rec?.state?.queue?.length}`);
  check('C2', 'one learning session is consumed', sessionsBefore.includes('10') && u.sessions.includes('9'), `${sessionsBefore} -> ${u.sessions}`);
  allErrors.push(...page.errors);
}));

await scenario('D', 'reconnect drains the queue without disturbing a draft', async () => withEnv(async ({ chrome, base }) => {
  const page = await chrome.newPage(`${base}/`);
  await ready(page); await controlled(page);
  await page.evaluate(submitExpr('A', 'The current keeps building up in the wire.'));
  await page.waitFor(UI, (v) => v.answers === '1' && v.queue === '0' && v.applyVisible, 10000, 'first answer');
  await page.evaluate("document.querySelector('#apply-plan-button').click()");
  await page.waitFor(UI, (v) => /EL02/.test(v.question), 5000, 'EL02');
  await page.offline(true); await page.waitFor('navigator.onLine', (x) => x === false, 6000, 'offline');
  await sleep(300);
  await page.evaluate(submitExpr('A', 'The battery becomes empty immediately when the switch opens.'));
  await page.waitFor(UI, (v) => v.queue === '1' && v.answers === '2' && v.applyVisible, 8000, 'queued offline');
  await page.evaluate("document.querySelector('#apply-plan-button').click()");
  await page.waitFor(UI, (v) => /EL03/.test(v.question), 5000, 'EL03');
  const draft = 'Draft on EL03 must stay with EL03.';
  await page.evaluate(draftExpr('C', draft, 5)); await sleep(400);
  await page.offline(false);
  const u = await page.waitFor(UI, (v) => v.queue === '0' && /Re-check processed/.test(v.notice), 14000, 'queue drained');
  check('D1', 'queue drains after reconnect with no manual action', u.queue === '0', u.notice.slice(0, 90));
  check('D2', 'typed draft and selected option stay on the same question', /EL03/.test(u.question) && u.option === 'C' && u.text === draft, `question=${u.question}; option=${u.option}; text="${u.text}"`);
  check('D3', 'focus and caret survive the reconnect re-render', u.focus === 'explanation-input' && u.caret === 5, `focus="${u.focus}"; caret=${u.caret}`);
  const rec = await page.evaluate(READ_DB);
  const leaks = ['EL01', 'EL02'].filter((id) => rec?.drafts?.[id]?.explanation === draft);
  check('D4', 'the draft is never stored under another question', leaks.length === 0 && rec?.drafts?.EL03?.explanation === draft, `stored draft ids=${Object.keys(rec?.drafts ?? {}).join(',')}`);
  allErrors.push(...page.errors);
}));

await scenario('E', 'reload offline, cold start, queue survives', async () => withEnv(async ({ chrome, base }) => {
  let page = await chrome.newPage(`${base}/`);
  await ready(page); await controlled(page);
  await page.offline(true); await page.waitFor('navigator.onLine', (x) => x === false, 6000, 'offline');
  await sleep(300);
  await page.evaluate(submitExpr('A', 'The battery becomes empty immediately.'));
  await page.waitFor(UI, (v) => v.queue === '1' && v.answers === '1', 8000, 'queued');
  await page.reload();
  const u = await page.waitFor(UI, (v) => /EL01/.test(v.question) && v.answers === '1', 12000, 'offline reload restored state');
  check('E1', 'offline reload serves the app shell, content and saved answers', u.answers === '1' && u.queue === '1' && !/no local content pack/i.test(u.body), `answers=${u.answers}; queue=${u.queue}; connection=${u.connection}`);
  check('E2', 'the connection indicator says offline while offline', /OFFLINE/.test(u.connection), u.connection);
  await page.offline(false);
  const online = await page.waitFor(UI, (v) => v.queue === '0', 20000, 'drain after offline reload');
  check('E3', 'queue drains after reconnect following a reload', online.queue === '0', online.notice.slice(0, 80));
  allErrors.push(...page.errors);
  // cold start: queue an answer, close the tab, open a new tab online
  await page.offline(true); await page.waitFor('navigator.onLine', (x) => x === false, 6000, 'offline again'); await sleep(300);
  await page.evaluate("document.querySelector('#apply-plan-button')?.click()"); await sleep(300);
  const cur = (await page.evaluate(UI)).question.match(/EL0\d/)[0];
  await page.evaluate(submitExpr('A', 'Another synthetic offline answer.'));
  await page.waitFor(UI, (v) => v.queue === '1', 8000, 'queued before cold start');
  await page.close(); await sleep(400);
  page = await chrome.newPage(`${base}/`);
  const cold = await page.waitFor(UI, (v) => v.answers === '2' && v.queue === '0', 20000, 'cold start drained');
  check('E4', 'a queue left by a closed tab is recovered on a cold start without a tap', cold.queue === '0' && cold.answers === '2', `from ${cur}; answers=${cold.answers}; queue=${cold.queue}`);
  allErrors.push(...page.errors);
}));

await scenario('L', 'an unsent draft survives a reload', async () => withEnv(async ({ chrome, base }) => {
  const page = await chrome.newPage(`${base}/`);
  await ready(page); await controlled(page);
  const draft = 'A half-written explanation that must survive a reload.';
  await page.evaluate(draftExpr('C', draft, 7));
  await sleep(700);                                  // the app saves drafts about 150 ms after the last keystroke
  const saved = await page.evaluate(READ_DB);
  check('L1', 'the draft is stored in IndexedDB under its own question', saved?.drafts?.EL01?.explanation === draft && saved?.drafts?.EL01?.optionId === 'C', `stored=${JSON.stringify(saved?.drafts?.EL01 ?? null).slice(0, 120)}`);
  await page.reload();
  const u = await page.waitFor(UI, (v) => /EL01/.test(v.question) && v.text !== null, 12000, 'reloaded');
  check('L2', 'after a full reload the draft text and selected option come back on the same question', u.text === draft && u.option === 'C', `option=${u.option}; text="${u.text}"`);
  allErrors.push(...page.errors);
}));

await scenario('F', 'missing or stale content cannot strand the learner', async () => withEnv(async ({ chrome, base }) => {
  const page = await chrome.newPage(`${base}/`);
  await ready(page);
  await page.evaluate(editDb(`
    rec.state.learner.currentItemId = 'EL99';
    rec.state.learner.nextRecommendedItemId = 'EL98';
    rec.state.answers.push({ id: 'ans-stale', itemId: 'EL99', optionId: 'A', explanation: 'synthetic', submittedAt: new Date().toISOString(), mode: 'OFFLINE_RULE', diagnosis: { questionId: 'EL99', type: 'UNCERTAIN', misconceptionId: null, confidence: 0, rationale: 'synthetic', provisional: true }, reviewStatus: 'UNREVIEWED_DRAFT' });
    rec.state.queue.push({ id: 'q-stale', answerId: 'ans-stale', itemId: 'EL99', createdAt: new Date().toISOString(), attempts: 0, status: 'PENDING_RECHECK' });
    rec.state.queue.push({ id: 'q-orphan', answerId: 'ans-missing', itemId: 'EL01', createdAt: new Date().toISOString(), attempts: 0, status: 'PENDING_RECHECK' });
  `));
  await page.reload();
  const u = await page.waitFor(UI, (v) => /EL0\d/.test(v.question) && v.queue === '0', 15000, 'recovered');
  const rec = await page.evaluate(READ_DB);
  const types = (rec?.state?.trace ?? []).map((t) => t.type);
  check('F1', 'a missing current item is replaced and stale queue entries are dropped', /EL0\d/.test(u.question) && u.queue === '0', `question=${u.question}; queue=${u.queue}`);
  check('F2', 'recovery is recorded in the trace', types.includes('content_mismatch_recovered') && types.includes('queue_dropped'), types.slice(-6).join(','));
  check('F3', 'the recommendation never points at a missing item', !rec?.state?.learner?.nextRecommendedItemId || /^EL0[1-8]$/.test(rec.state.learner.nextRecommendedItemId), String(rec?.state?.learner?.nextRecommendedItemId));
  check('F4', 'recovery causes no page exceptions', page.errors.length === 0, page.errors.slice(0, 2).join(' | '));
  allErrors.push(...page.errors);
}));

await scenario('G', 'two tabs: read-only second tab, no lost update', async () => withEnv(async ({ chrome, base }) => {
  const a = await chrome.newPage(`${base}/`);
  await ready(a); await sleep(500);
  const b = await chrome.newPage(`${base}/`);
  const ub = await b.waitFor(UI, (v) => /EL0\d/.test(v.question) && /Read-only session/.test(v.banner), 12000, 'tab B read-only');
  check('G1', 'the second tab is read-only with a persistent banner and disabled controls', ub.allDisabled === true && ub.bridgeButtonsDisabled === true, ub.banner.slice(0, 90));
  await a.evaluate(submitExpr('A', 'The current keeps building up in the wire.'));
  await a.waitFor(UI, (v) => v.answers === '1' && v.queue === '0', 10000, 'tab A answered');
  await b.goto('about:blank'); await sleep(700);   // tab B unloads (pagehide)
  const rec = await a.evaluate(READ_DB);
  check('G2', "closing the read-only tab does not overwrite the writer's progress", rec?.state?.answers?.length === 1, `persisted answers=${rec?.state?.answers?.length}`);
  await a.reload();
  const ua = await a.waitFor(UI, (v) => /EL0\d/.test(v.question) && v.answers !== undefined, 12000, 'tab A reloaded');
  check('G3', 'the writer tab still has its answer after a reload', ua.answers === '1', `answers=${ua.answers}`);
  allErrors.push(...a.errors, ...b.errors);
}));

await scenario('G3', 'two tabs: a read-only tab never processes the queue', async () => withEnv(async ({ chrome, base }) => {
  const a = await chrome.newPage(`${base}/`);
  await ready(a); await controlled(a);
  await a.offline(true); await a.waitFor('navigator.onLine', (x) => x === false, 6000, 'tab A offline'); await sleep(300);
  await a.evaluate(submitExpr('A', 'Synthetic offline answer for the duplicate test.'));
  await a.waitFor(UI, (v) => v.queue === '1', 8000, 'queued in tab A');
  const b = await chrome.newPage(`${base}/`);                       // tab B is online and read-only
  await b.waitFor(UI, (v) => /EL0\d/.test(v.question) && v.allDisabled === true, 12000, 'tab B inputs disabled (read-only)');
  await sleep(3500);                                              // time for B's reachability probe to succeed and drain, if it were allowed to
  const bRequests = b.requests.filter((r) => r.url.includes('/api/recheck')).length;
  check('G5', 'the read-only tab sends no re-check request', bRequests === 0, `tab B re-check requests=${bRequests}`);
  await a.offline(false);
  await a.waitFor(UI, (v) => v.queue === '0', 20000, 'tab A drained');
  const total = a.requests.concat(b.requests).filter((r) => r.url.includes('/api/recheck') && r.method === 'POST').length;
  const rec = await a.evaluate(READ_DB);
  const bBanner = await b.evaluate("document.body.innerText.includes('Read-only') || document.body.innerText.includes('read-only')");
  check('G7', 'the read-only state stays visible (a transient notice cannot hide it)', bBanner === true, `banner visible=${bBanner}`);
  check('G6', 'the queued answer is re-checked exactly once across both tabs', total === 1 && rec?.state?.queue?.length === 0 && rec?.state?.answers?.length === 1, `total re-check POSTs=${total}; persisted answers=${rec?.state?.answers?.length}`);
  allErrors.push(...a.errors, ...b.errors);
}));

await scenario('K', 'Bridge Practice works offline, by keyboard, and is traced', async () => withEnv(async ({ chrome, base }) => {
  const page = await chrome.newPage(`${base}/`);
  await ready(page); await controlled(page);
  await page.offline(true); await page.waitFor('navigator.onLine', (x) => x === false, 6000, 'offline'); await sleep(400);
  const BR = `(() => ({
    options: [...document.querySelectorAll('[data-bridge-option]')].map((b) => ({ id: b.dataset.bridgeOption, pressed: b.getAttribute('aria-pressed'), cls: b.className, text: b.innerText.replace(/\\s+/g, ' ') })),
    badge: document.querySelector('#bridge-practice-content .draft-badge')?.textContent || '',
    offlineTag: document.querySelector('.bridge-offline-tag')?.textContent || '',
    prompt: document.querySelector('.bridge-prompt')?.textContent || '',
    feedback: document.querySelector('.bridge-feedback')?.textContent || '',
    reveal: document.querySelector('.bridge-reveal')?.innerText || '',
    cardText: document.querySelector('#bridge-content')?.innerText || '',
    focus: document.activeElement?.dataset?.bridgeOption || document.activeElement?.dataset?.bridgeAction || '',
    disabledMsg: document.querySelector('.bridge-disabled')?.innerText || ''
  }))()`;
  const first = await page.evaluate(BR);
  check('K1', 'three options, an everyday Odia prompt, the UNREVIEWED DRAFT label and an offline tag', first.options.length === 3 && first.prompt.length > 10 && /UNREVIEWED DRAFT/.test(first.badge) && /Offline/.test(first.offlineTag), `options=${first.options.length}; badge="${first.badge}"`);
  check('K2', 'the answer is not shown in the bridge card while the exercise is unanswered', /Hidden for practice/.test(first.cardText), first.cardText.replace(/\s+/g, ' ').slice(0, 90));
  const requestMark = page.requests.length;
  // keyboard: focus the first option and press Enter with real key events
  await page.evaluate("document.querySelector('[data-bridge-option]').focus()");
  await page.cdp.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r' });
  await page.cdp.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  const afterKey = await page.waitFor(BR, (v) => v.options.some((o) => o.pressed === 'true'), 4000, 'keyboard activation');
  check('K3', 'an option can be chosen from the keyboard and gives immediate feedback; focus stays on it', afterKey.feedback !== first.feedback && afterKey.focus === afterKey.options.find((o) => o.pressed === 'true').id, `feedback="${afterKey.feedback.slice(0, 60)}"; focus=${afterKey.focus}`);
  const outcomes = [afterKey.options.find((o) => o.pressed === 'true').cls.includes('correct') ? 'correct' : 'wrong'];
  for (const index of [1, 2]) {
    await page.evaluate(`document.querySelectorAll('[data-bridge-option]')[${index}].click()`);
    const v = await page.waitFor(BR, (x) => x.options[index].pressed === 'true', 3000, `option ${index} chosen`);
    outcomes.push(v.options[index].cls.includes('correct') ? 'correct' : 'wrong');
  }
  check('K4', 'exactly one of the three options is correct and each choice gets immediate feedback', outcomes.filter((o) => o === 'correct').length === 1, outcomes.join(','));
  const cardAfter = (await page.evaluate(BR)).cardText;
  check('K5', 'after an attempt the full mapping appears in the bridge card', !/Hidden for practice/.test(cardAfter), cardAfter.replace(/\s+/g, ' ').slice(0, 90));
  await page.evaluate("document.querySelector('[data-bridge-action=\"reveal\"]').click()");
  const revealed = await page.waitFor(BR, (v) => v.reveal.length > 0, 3000, 'reveal');
  check('K6', 'revealing shows the source mapping with its UNREVIEWED_DRAFT status', /UNREVIEWED_DRAFT/.test(revealed.reveal) && /Everyday Odia/.test(revealed.reveal), revealed.reveal.replace(/\s+/g, ' ').slice(0, 90));
  const rec = await page.evaluate(READ_DB);
  const types = (rec?.state?.trace ?? []).map((t) => t.type);
  const attempts = (rec?.state?.trace ?? []).filter((t) => t.type === 'bridge_practice_attempt');
  check('K7', 'three attempts and the reveal are in the persisted decision trace with network:false', attempts.length === 3 && types.includes('bridge_mapping_revealed') && attempts.every((t) => t.network === false && t.contentStatus === 'UNREVIEWED_DRAFT') && rec.state.learner.bridgeAttempts?.EL01 === 3, `attempts=${attempts.length}; counter=${rec?.state?.learner?.bridgeAttempts?.EL01}`);
  await page.evaluate("document.querySelector('#trace-toggle').click()");
  const traceText = await page.evaluate("document.querySelector('#trace-list')?.innerText || ''");
  check('K8', 'the trace panel shows the bridge attempts to the learner', /bridge practice attempt/i.test(traceText) && /bridge mapping revealed/i.test(traceText), traceText.split('\n').slice(0, 3).join(' | '));
  const probeFree = page.requests.slice(requestMark).filter((r) => r.url.includes('/api/') && !r.url.includes('/api/health'));
  check('K9', 'the whole interaction made no API request (the background reachability probe is excluded)', probeFree.length === 0, `non-probe API requests=${probeFree.length}; offline=${await page.evaluate('navigator.onLine === false')}`);
  const sigBefore = (await page.evaluate(BR)).options.map((o) => o.text).join('|');
  await page.evaluate("document.querySelector('[data-bridge-action=\"next\"]').click()");
  const next = await page.waitFor(BR, (v) => v.options.length === 3 && v.options.every((o) => o.pressed === 'false'), 3000, 'next exercise');
  check('K10', 'Try another builds a fresh, different exercise deterministically from the saved attempt count', next.options.map((o) => o.text).join('|') !== sigBefore && next.reveal === '', 'options changed and the reveal is closed');
  allErrors.push(...page.errors);
}));

await scenario('G2', 'no Web Locks: a visible warning', async () => withEnv(async ({ chrome, base }) => {
  const page = await chrome.newPage();
  await page.cdp.call('Page.addScriptToEvaluateOnNewDocument', { source: "Object.defineProperty(Navigator.prototype, 'locks', { get() { return undefined; }, configurable: true });" });
  await page.goto(`${base}/`);
  const u = await page.waitFor(UI, (v) => /EL0\d/.test(v.question) && /Single-tab protection unavailable/.test(v.banner), 12000, 'warning');
  check('G4', 'without Web Locks the app shows a persistent single-tab warning', /Single-tab protection unavailable/.test(u.banner), u.banner.slice(0, 80));
  allErrors.push(...page.errors);
}));

await scenario('H', 'service worker: shell offline, API never cached', async () => withEnv(async ({ chrome, base }) => {
  const page = await chrome.newPage(`${base}/`);
  await ready(page); await controlled(page);
  await page.evaluate(submitExpr('A', 'The current keeps building up in the wire.'));
  await page.waitFor(UI, (v) => v.answers === '1' && v.queue === '0', 10000, 'answer with a server re-check');
  const urls = await page.evaluate(`(async () => { const out = []; for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) out.push(r.url); return out; })()`);
  check('H1', 'no /api/ response is stored in any cache', urls.length >= 8 && urls.every((x) => !new URL(x).pathname.startsWith('/api/')), `${urls.length} cached; api entries=${urls.filter((x) => x.includes('/api/')).length}`);
  allErrors.push(...page.errors);
}));

await scenario('I', 'service worker update is announced and applied', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pathasetu-next-'));
  for (const d of ['src', 'public', 'content']) await fs.cp(path.join(ROOT, d), path.join(tmp, d), { recursive: true });
  const swPath = path.join(tmp, 'public/sw.js');
  await fs.writeFile(swPath, (await fs.readFile(swPath, 'utf8')).replace(/const CACHE_NAME = '([^']+)'/, "const CACHE_NAME = '$1-next'"));
  await fs.appendFile(path.join(tmp, 'public/app.js'), "\nwindow.__pathasetuBuildMarker = 'next';\n");
  const port = await freePort();
  const first = await startServer({ root: ROOT, port });
  const chrome = await launchChrome();
  let second;
  try {
    const page = await chrome.newPage(`http://localhost:${port}/`);
    await ready(page); await controlled(page); await sleep(800);
    await first.stop(); second = await startServer({ root: tmp, port });
    await page.evaluate("navigator.serviceWorker.getRegistration().then((r) => r.update())");
    await page.waitFor("caches.keys().then((k) => k.some((x) => x.endsWith('-next')))", (x) => x === true, 15000, 'new cache installed');
    const u = await page.waitFor(UI, (v) => /App update ready/.test(v.notice), 15000, 'update notice');
    const before = await page.evaluate('window.__pathasetuBuildMarker ?? null');
    await page.reload();
    await ready(page);
    const after = await page.waitFor('window.__pathasetuBuildMarker ?? null', (x) => x === 'next', 10000, 'new code after one reload').catch(() => null);
    check('I1', 'an updated service worker announces the update', /App update ready/.test(u.notice), u.notice.slice(0, 80));
    check('I2', 'one reload runs the new code (not stranded on the old shell)', before === null && after === 'next', `before=${before}; after=${after}`);
    allErrors.push(...page.errors);
  } finally { await chrome.kill(); await first.stop(); await second?.stop(); await fs.rm(tmp, { recursive: true, force: true }); }
});

await scenario('J', 'provider failures leave state consistent and entries retryable', async () => withEnv(async ({ chrome, base }) => {
  const page = await chrome.newPage();
  const paused = [];
  page.mode = 'pass';
  page.cdp.on('Fetch.requestPaused', async (p) => {
    const send = (status, body, type = 'application/json') => page.cdp.call('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: status, responseHeaders: [{ name: 'content-type', value: type }], body: Buffer.from(body).toString('base64') }).catch(() => {});
    if (page.mode === 'pass') return page.cdp.call('Fetch.continueRequest', { requestId: p.requestId }).catch(() => {});
    if (page.mode === 'http500') return send(500, JSON.stringify({ error: 'provider_request_failed' }));
    if (page.mode === 'badjson') return send(200, 'this is not json', 'text/plain');
    if (page.mode === 'baddiagnosis') return send(200, JSON.stringify({ provider: 'mock', diagnosis: { questionId: 'WRONG', type: 'MISCONCEPTION', misconceptionId: 'NOT_ALLOWED', confidence: 0.9, rationale: 'x' } }));
    if (page.mode === 'hang') { paused.push(p.requestId); return; }
  });
  await page.cdp.call('Fetch.enable', { patterns: [{ urlPattern: '*/api/recheck*' }] });
  await page.goto(`${base}/`);
  await ready(page); await controlled(page);
  const run = async (mode, label) => {
    page.mode = mode;
    const before = (await page.evaluate(READ_DB))?.state;
    await page.evaluate(submitExpr('A', `synthetic answer for ${label}`));
    await page.waitFor(UI, (v) => Number(v.answers) === (before?.answers?.length ?? 0) + 1, 8000, `${label} answer recorded`);
    const waitMs = mode === 'hang' ? 16000 : 5000;
    const u = await page.waitFor(UI, (v) => v.queue === '1', waitMs, `${label} queue`).catch(async () => page.evaluate(UI));
    let attempts = null;
    const start = Date.now();
    while (Date.now() - start < waitMs) { attempts = (await page.evaluate(READ_DB))?.state?.queue?.[0]?.attempts ?? null; if (attempts >= 1) break; await sleep(250); }
    const rec = (await page.evaluate(READ_DB))?.state;
    return { u, attempts, rec, drainingStuck: await page.evaluate('(() => { try { return null; } catch { return null; } })()') };
  };
  const clear = async () => {
    page.mode = 'pass';
    await page.evaluate("window.dispatchEvent(new Event('online'))");
    await page.waitFor(UI, (v) => v.queue === '0', 25000, 'queue recovers after the provider recovers').catch(() => null);
    await page.evaluate("document.querySelector('#apply-plan-button')?.click()"); await sleep(300);
  };
  for (const [mode, label, id] of [['http500', 'provider HTTP 500', 'J1'], ['badjson', 'invalid JSON', 'J2'], ['baddiagnosis', 'invalid diagnosis', 'J3']]) {
    const r = await run(mode, label);
    check(id, `${label}: answer kept, entry stays queued with a counted attempt`, r.u.queue === '1' && r.attempts >= 1 && r.rec.answers.length >= 1, `queue=${r.u.queue}; attempts=${r.attempts}`);
    await clear();
    const after = (await page.evaluate(READ_DB))?.state;
    check(`${id}b`, `${label}: the entry drains once the provider works again`, after.queue.length === 0, `queue after recovery=${after.queue.length}`);
  }
  const h = await run('hang', 'provider hangs');
  check('J4', 'a hung provider request times out: the entry stays queued with a counted attempt', h.u.queue === '1' && h.attempts >= 1, `queue=${h.u.queue}; attempts=${h.attempts} after up to 16 s`);
  await clear();
  const final = (await page.evaluate(READ_DB))?.state;
  check('J4b', 'after a hang the queue drains once the provider works again', final.queue.length === 0, `queue after recovery=${final.queue.length}`);
  check('J5', 'no uncaught exceptions during failure handling', page.errors.length === 0, page.errors.slice(0, 2).join(' | '));
  allErrors.push(...page.errors);
}));

check('Z1', 'no uncaught exceptions or console errors across the verified journeys', allErrors.length === 0, allErrors.slice(0, 3).join(' | ') || '0 errors');
results.completedAt = new Date().toISOString();
results.passCount = results.checks.filter((c) => c.passed).length;
results.failCount = results.checks.filter((c) => !c.passed).length;
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(results, null, 2));
console.log(`\nBrowser regression: ${results.passCount} passed, ${results.failCount} failed; ${OUT}`);
process.exit(results.failCount ? 1 : 0);

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { requireBrowser, browserRecord, classifyNavigationError } from './lib/browser-path.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = '127.0.0.1';
let PORT = Number(process.env.PORT || 0);
let BASE = '';
let BROWSER_BASE = '';
const OUT = path.join(ROOT, 'evidence', 'capture-latest.json');
const SCREENSHOT = path.join(ROOT, 'evidence', 'pathasetu-browser-latest.png');
let server;
let chromium;
let cdp;
const result = { startedAt: new Date().toISOString(), baseUrl: BASE, checks: [], limitation: 'Headless Chromium E2E is not a substitute for physical Samsung/iPhone testing or educational validation.' };

function add(name, passed, detail = '') { result.checks.push({ name, passed, detail }); console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`); }
function addBlocked(name, detail) { result.checks.push({ name, passed: null, status: 'BLOCKED', detail }); console.log(`BLOCKED ${name} — ${detail}`); }
async function freePort() {
  return await new Promise((resolve, reject) => {
    const socket = net.createServer();
    socket.once('error', reject);
    socket.listen(0, HOST, () => { const { port } = socket.address(); socket.close(() => resolve(port)); });
  });
}
async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try { const response = await fetch(`${BASE}/api/health`); if (response.ok) return true; } catch {}
    await sleep(250);
  }
  return false;
}
async function waitForCdp(port) {
  for (let i = 0; i < 40; i++) {
    try { const response = await fetch(`http://${HOST}:${port}/json/list`); if (response.ok) return await response.json(); } catch {}
    await sleep(250);
  }
  throw new Error('cdp_endpoint_timeout');
}
async function waitFor(getter, predicate, timeoutMs = 8000) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeoutMs) {
    last = await getter();
    if (predicate(last)) return last;
    await sleep(150);
  }
  throw new Error(`wait_timeout:last=${JSON.stringify(last).slice(0, 300)}`);
}
class DevTools {
  constructor(url) { this.url = url; this.id = 0; this.pending = new Map(); this.handlers = new Map(); this.errors = []; }
  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => { this.ws.addEventListener('open', resolve, { once: true }); this.ws.addEventListener('error', reject, { once: true }); });
    this.ws.addEventListener('message', (event) => {
      let message; try { message = JSON.parse(event.data); } catch { return; }
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (pending) { this.pending.delete(message.id); clearTimeout(pending.timer); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result ?? {}); }
      } else if (message.method) {
        for (const handler of this.handlers.get(message.method) ?? []) handler(message.params ?? {});
      }
    });
    return this;
  }
  on(method, handler) { if (!this.handlers.has(method)) this.handlers.set(method, []); this.handlers.get(method).push(handler); }
  call(method, params = {}, timeoutMs = 5000) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`cdp_timeout:${method}`)); }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression, timeoutMs = 5000) {
    const response = await this.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }, timeoutMs);
    if (response.exceptionDetails) throw new Error(`page_evaluate_exception:${response.exceptionDetails.text}`);
    return response.result?.value;
  }
  close() { try { this.ws?.close(); } catch {} }
}
async function clickRadioAndSubmit(cdp, optionId, explanation) {
  const expr = `(() => { const radio = document.querySelector('input[name="answer-option"][value="${optionId}"]'); const textarea = document.querySelector('#explanation-input'); const form = document.querySelector('#answer-form'); if (!radio || !textarea || !form) return {ok:false, question:document.querySelector('.question-id')?.textContent}; radio.checked=true; radio.dispatchEvent(new Event('change',{bubbles:true})); textarea.value=${JSON.stringify(explanation)}; textarea.dispatchEvent(new Event('input',{bubbles:true})); form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); return {ok:true,question:document.querySelector('.question-id')?.textContent}; })()`;
  return await cdp.evaluate(expr);
}

try {
  if (!PORT) PORT = await freePort();
  BASE = `http://${HOST}:${PORT}`;
  result.baseUrl = BASE;
  BROWSER_BASE = `http://localhost:${PORT}`;
  server = spawn(process.execPath, ['src/server/server.js'], { cwd: ROOT, env: { ...process.env, HOST, PORT: String(PORT), PATHASETU_MODEL_PROVIDER: 'mock', GROQ_API_KEY: '', PATHASETU_DEMO_ACCESS_CODE: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });
  const ready = await waitForServer();
  add('server starts', ready, ready ? serverOutput.trim().split('\n')[0] : serverOutput.slice(-300));
  if (!ready) throw new Error('server_failed_to_start');

  const home = await fetch(`${BASE}/`); const html = await home.text();
  add('homepage returns HTML', home.status === 200 && html.includes('Pathasetu'), `HTTP ${home.status}`);
  const health = await (await fetch(`${BASE}/api/health`)).json();
  add('health endpoint reports mock provider', health.ok && health.provider === 'mock', `provider=${health.provider}`);
  const packResponse = await fetch(`${BASE}/api/pack`); const pack = await packResponse.json();
  add('draft pack clearly identifies draft status', packResponse.status === 200 && pack.demoDraftMode === true && pack.items.length === 8 && pack.items.every((item) => item.status === 'UNREVIEWED_DRAFT' && Boolean(item.promptOdiaDraft) && item.options.every((option) => Boolean(option.textOdiaDraft))), `items=${pack.items?.length}; bilingual drafts present; all unreviewed`);
  const item = pack.items[0];
  const recheckResponse = await fetch(`${BASE}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', origin: BASE }, body: JSON.stringify({ itemId: item.id, optionId: 'A', explanation: 'Current keeps building in the wire.' }) });
  const recheckBody = await recheckResponse.json();
  add('recheck returns a bounded mock proposal', recheckResponse.status === 200 && recheckBody.provider === 'mock' && item.allowedMisconceptionIds.includes(recheckBody.diagnosis.misconceptionId), `HTTP ${recheckResponse.status}`);
  const invalidOption = await fetch(`${BASE}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', origin: BASE }, body: JSON.stringify({ itemId: item.id, optionId: 'NOT_AN_OPTION', explanation: 'synthetic invalid option' }) });
  add('invalid option is rejected', invalidOption.status === 400, `HTTP ${invalidOption.status}`);
  const invalid = await fetch(`${BASE}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', origin: BASE }, body: JSON.stringify({ itemId: item.id, optionId: 'A', explanation: 'x'.repeat(17000) }) });
  add('oversized API request is rejected', invalid.status === 413, `HTTP ${invalid.status}`);
  const wrongOrigin = await fetch(`${BASE}/api/health`, { headers: { origin: 'https://not-the-same-host.example' } });
  add('cross-origin API request is rejected', wrongOrigin.status === 403, `HTTP ${wrongOrigin.status}`);
  const core = await fetch(`${BASE}/core/agent.js`); const coreText = await core.text();
  add('browser-safe core module is served', core.status === 200 && coreText.includes('submitAnswer'), `HTTP ${core.status}`);
  const sw = await fetch(`${BASE}/sw.js`); const swText = await sw.text();
  add('service worker avoids caching API routes', sw.status === 200 && swText.includes("url.pathname.startsWith('/api/')"), `HTTP ${sw.status}`);

  // Shared resolver: an invalid CHROME_PATH or a missing browser throws BrowserBlockedError, which is reported as BLOCKED below, never as a failed check.
  const browserSelection = requireBrowser();
  const chromePath = browserSelection.path;
  const remotePort = await freePort();
  const userData = `/tmp/pathasetu-chromium-${process.pid}`;
  chromium = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking', '--no-first-run', '--disable-extensions', `--remote-debugging-port=${remotePort}`, `--user-data-dir=${userData}`, '--host-resolver-rules=MAP pathasetu.test 127.0.0.1', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  let chromeStderr = '';
  chromium.stderr.on('data', (chunk) => { chromeStderr += chunk.toString(); });
  const pages = await waitForCdp(remotePort);
  const page = pages.find((target) => target.type === 'page');
  if (!page) throw new Error('no_browser_page_target');
  cdp = await new DevTools(page.webSocketDebuggerUrl).connect();
  const pageErrors = [];
  cdp.on('Runtime.exceptionThrown', (params) => pageErrors.push(params.exceptionDetails?.text || 'page_exception'));
  cdp.on('Runtime.consoleAPICalled', (params) => { if (params.type === 'error') pageErrors.push((params.args ?? []).map((arg) => arg.value ?? arg.description ?? '').join(' ')); });
  await cdp.call('Page.enable'); await cdp.call('Runtime.enable'); await cdp.call('Network.enable');
  const navResult = await cdp.call('Page.navigate', { url: `${BROWSER_BASE}/` });
  if (classifyNavigationError(navResult.errorText) === 'POLICY_BLOCKED') {
    const blockedError = new Error('The managed Chromium policy blocked localhost navigation (ERR_BLOCKED_BY_ADMINISTRATOR). Run npm run capture on a machine/browser that permits local development URLs.');
    blockedError.browserBlocked = true;
    throw blockedError;
  }
  const first = await waitFor(() => cdp.evaluate("({title:document.title, href:location.href, body:document.body?.innerText?.slice(0,500)||'', question:document.querySelector('.question-id')?.textContent||'', text:document.querySelector('#question-card')?.innerText||'', options:document.querySelectorAll('input[name=\\\"answer-option\\\"]').length})"), (value) => value.question.includes('EL01'), 5000).catch(async (error) => { console.log('Browser diagnostic:', JSON.stringify(await cdp.evaluate("({title:document.title,href:location.href,body:document.body?.innerText?.slice(0,1000),errors:performance.getEntriesByType('resource').filter(x=>x.responseStatus>=400).map(x=>({name:x.name,status:x.responseStatus})).slice(-20)})"))); throw error; });
  add('Chromium renders Pathasetu question and options', first.title.includes('Pathasetu') && first.options === 4 && first.text.includes('UNREVIEWED DRAFT'), `question=${first.question}; options=${first.options}`);
  const runtime = await cdp.evaluate("({hasDraftWarning:document.body.innerText.includes('Prototype content'), provider:document.querySelector('#provider-label')?.textContent})");
  add('UI visibly identifies draft content and mock provider', runtime.hasDraftWarning && runtime.provider.includes('MOCK'), `provider=${runtime.provider}`);

  const submitOnline = await clickRadioAndSubmit(cdp, 'A', 'The current keeps building up in the wire.');
  const afterFirst = await waitFor(() => cdp.evaluate("({question:document.querySelector('.question-id')?.textContent||'', count:document.querySelector('#answers-count')?.textContent, queue:document.querySelector('#queue-count')?.textContent, notice:document.querySelector('#notice-region')?.innerText||'', sessions:document.querySelector('#sessions-label')?.textContent||'', recommendation:document.querySelector('#recommendation')?.innerText||'', remediation:document.querySelector('.result-action')?.innerText||''})"), (value) => value.count === '1' && value.queue === '0' && value.question.includes('EL01') && value.recommendation.includes('EL02'), 7000);
  add('online answer preserves the current question with remediation and an explicit next step', submitOnline.ok && afterFirst.question.includes('EL01') && afterFirst.remediation.includes('Trace the path') && afterFirst.recommendation.includes('EL02') && afterFirst.sessions.includes('9'), `current=${afterFirst.question}; next=${afterFirst.recommendation.slice(0, 30)}`);
  await cdp.evaluate("document.querySelector('#apply-plan-button').click()");
  const advanced = await waitFor(() => cdp.evaluate("({question:document.querySelector('.question-id')?.textContent||'', count:document.querySelector('#answers-count')?.textContent})"), (value) => value.question.includes('EL02') && value.count === '1', 4000);
  add('learner explicitly continues to the recommended question', advanced.question.includes('EL02'), `current=${advanced.question}`);

  await cdp.call('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0, connectionType: 'none' });
  await waitFor(() => cdp.evaluate('navigator.onLine'), (online) => online === false, 6000);
  await sleep(200);
  await clickRadioAndSubmit(cdp, 'A', 'The battery becomes empty immediately when the switch opens.');
  const afterOffline = await waitFor(() => cdp.evaluate("({question:document.querySelector('.question-id')?.textContent||'', queue:document.querySelector('#queue-count')?.textContent, answers:document.querySelector('#answers-count')?.textContent, online:navigator.onLine, recommendation:document.querySelector('#recommendation')?.innerText||''})"), (value) => value.queue === '1' && value.answers === '2' && value.question.includes('EL02') && value.recommendation.includes('EL03'), 7000);
  add('offline answer is saved and queued while its feedback remains available', afterOffline.queue === '1' && afterOffline.answers === '2' && afterOffline.online === false && afterOffline.question.includes('EL02'), `queue=${afterOffline.queue}; current=${afterOffline.question}`);
  await cdp.evaluate("document.querySelector('#apply-plan-button').click()");
  await waitFor(() => cdp.evaluate("document.querySelector('.question-id')?.textContent||''"), (value) => value.includes('EL03'), 4000);

  const draftValue = 'Draft on EL03 must stay with EL03.';
  await cdp.evaluate(`(() => { const radio=document.querySelector('input[name="answer-option"][value="C"]'); const area=document.querySelector('#explanation-input'); radio.checked=true; radio.dispatchEvent(new Event('change',{bubbles:true})); area.value=${JSON.stringify(draftValue)}; area.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
  await sleep(350);
  await cdp.call('Network.emulateNetworkConditions', { offline: false, latency: 25, downloadThroughput: 5_000_000, uploadThroughput: 1_000_000, connectionType: 'wifi' });
  const afterReconnect = await waitFor(() => cdp.evaluate("({question:document.querySelector('.question-id')?.textContent||'', queue:document.querySelector('#queue-count')?.textContent, online:navigator.onLine, currentOption:document.querySelector('input[name=\\\"answer-option\\\"]:checked')?.value||'', draft:document.querySelector('#explanation-input')?.value||'', notice:document.querySelector('#notice-region')?.innerText||'', recommendation:document.querySelector('#recommendation')?.innerText||''})"), (value) => value.online && value.queue === '0' && value.notice.includes('Re-check processed'), 10000);
  add('reconnect drains queue and keeps draft attached to original question', afterReconnect.question.includes('EL03') && afterReconnect.currentOption === 'C' && afterReconnect.draft === draftValue, `current=${afterReconnect.question}; queue=${afterReconnect.queue}; option=${afterReconnect.currentOption}`);
  add('reconnect exposes updated next-step plan without switching the active question', afterReconnect.recommendation.includes('EL01') && afterReconnect.question.includes('EL03'), `recommendation=${afterReconnect.recommendation.replace(/\s+/g, ' ').slice(0, 100)}`);

  await cdp.evaluate("document.querySelector('#trace-toggle').click()");
  const trace = await cdp.evaluate("({visible:!document.querySelector('#trace-panel').classList.contains('hidden'), text:document.querySelector('#trace-list')?.innerText||''})");
  add('decision trace is visible and records reconnect behavior', trace.visible && trace.text.includes('recheck complete'), `trace entries rendered=${trace.text.split('\n').length}`);

  try {
    const screenshot = await cdp.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    await fs.writeFile(SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  } catch (error) { result.screenshotError = error.message; }
  add('no uncaught page exceptions or console errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | ') || '0 browser page errors');
  const browserVersion = ((await fetch(`http://${HOST}:${remotePort}/json/version`).then((r) => r.json()).catch(() => ({}))).Browser) || 'unknown';
  result.browser = { ...browserRecord(browserSelection, browserVersion), errors: pageErrors, screenshot: SCREENSHOT };
} catch (error) {
  if (error.browserBlocked || String(error.message).includes('ERR_BLOCKED_BY_ADMINISTRATOR')) {
    addBlocked('Chromium E2E journey', error.message);
    result.browserE2E = error.code === 'BROWSER_BLOCKED' ? 'BLOCKED_NO_USABLE_BROWSER' : 'BLOCKED_BY_BROWSER_POLICY';
    if (error.code === 'BROWSER_BLOCKED') result.browser = { status: 'BLOCKED', executable: null, selectedBy: error.reason, version: null, tried: error.tried };
  } else {
    add('capture script completed', false, error.message);
    result.error = error.stack ?? error.message;
  }
} finally {
  cdp?.close();
  if (chromium && chromium.exitCode === null) chromium.kill('SIGTERM');
  if (server && server.exitCode === null) {
    server.kill('SIGTERM');
    await Promise.race([once(server, 'close').catch(() => {}), sleep(1200)]);
    if (server.exitCode === null) server.kill('SIGKILL');
  }
  result.completedAt = new Date().toISOString();
  result.passCount = result.checks.filter((check) => check.passed === true).length;
  result.failCount = result.checks.filter((check) => check.passed === false).length;
  result.blockedCount = result.checks.filter((check) => check.passed === null).length;
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(result, null, 2));
  console.log(`\nCapture result: ${result.passCount} passed, ${result.failCount} failed, ${result.blockedCount} blocked; ${OUT}`);
  if (result.failCount) process.exitCode = 1;
  else if (result.blockedCount) process.exitCode = 2;
}

// Zero-dependency browser test helpers: a server process, a Chrome process and a Chrome DevTools Protocol client.
// Browser discovery lives in scripts/lib/browser-path.mjs: set CHROME_PATH to an installed Chrome, Chromium or Edge, or let it check the standard locations. Nothing here bypasses browser security policy.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { resolveBrowser, BrowserBlockedError } from './browser-path.mjs';

export const HOST = '127.0.0.1';
export { sleep };

export async function freePort() {
  return await new Promise((resolve, reject) => {
    const socket = net.createServer();
    socket.once('error', reject);
    socket.listen(0, HOST, () => { const { port } = socket.address(); socket.close(() => resolve(port)); });
  });
}

export async function startServer({ root, port, env = {} }) {
  const proc = spawn(process.execPath, ['src/server/server.js'], {
    cwd: root,
    env: { ...process.env, HOST, PORT: String(port), PATHASETU_MODEL_PROVIDER: 'mock', PATHASETU_MODEL_PROVIDERS: '', GROQ_API_KEY: '', PATHASETU_DEMO_ACCESS_CODE: '', ...env },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  proc.stdout.on('data', (c) => { output += c; });
  proc.stderr.on('data', (c) => { output += c; });
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://${HOST}:${port}/api/health`)).ok) break; } catch { /* retry */ }
    await sleep(150);
  }
  return {
    port, proc, output: () => output,
    async stop() {
      if (proc.exitCode !== null) return;
      proc.kill('SIGTERM');
      for (let i = 0; i < 20 && proc.exitCode === null; i++) await sleep(100);
      if (proc.exitCode === null) proc.kill('SIGKILL');
    }
  };
}

export class DevTools {
  constructor(url) { this.url = url; this.id = 0; this.pending = new Map(); this.handlers = new Map(); }
  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => { this.ws.addEventListener('open', resolve, { once: true }); this.ws.addEventListener('error', reject, { once: true }); });
    this.ws.addEventListener('message', (event) => {
      let message; try { message = JSON.parse(event.data); } catch { return; }
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (pending) { this.pending.delete(message.id); clearTimeout(pending.timer); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result ?? {}); }
      } else if (message.method) for (const handler of this.handlers.get(message.method) ?? []) handler(message.params ?? {});
    });
    return this;
  }
  on(method, handler) { if (!this.handlers.has(method)) this.handlers.set(method, []); this.handlers.get(method).push(handler); }
  call(method, params = {}, timeoutMs = 8000) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`cdp_timeout:${method}`)); }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression, timeoutMs = 8000) {
    const response = await this.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }, timeoutMs);
    if (response.exceptionDetails) throw new Error(`page_evaluate_exception:${response.exceptionDetails.exception?.description ?? response.exceptionDetails.text}`);
    return response.result?.value;
  }
  close() { try { this.ws?.close(); } catch { /* ignore */ } }
}

export async function launchChrome({ chromePath } = {}) {
  // One shared resolver decides which installed browser to use (scripts/lib/browser-path.mjs). An explicit chromePath or CHROME_PATH that is
  // invalid is BLOCKED; it is never replaced by a different browser, and nothing is installed or downloaded.
  const selection = chromePath ? resolveBrowser({ env: { CHROME_PATH: chromePath } }) : resolveBrowser();
  if (selection.status !== 'FOUND') throw new BrowserBlockedError(selection);
  chromePath = selection.path;
  const remotePort = await freePort();
  const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'pathasetu-chrome-'));
  const proc = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking', '--no-first-run', '--disable-extensions', `--remote-debugging-port=${remotePort}`, `--user-data-dir=${userData}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const api = `http://${HOST}:${remotePort}`;
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`${api}/json/version`)).ok) break; } catch { /* retry */ } await sleep(150); }
  const pages = new Set();
  return {
    remotePort, selection, executable: chromePath, version: async () => (await (await fetch(`${api}/json/version`)).json()).Browser,
    async newPage(url) {
      const target = await (await fetch(`${api}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })).json();
      const cdp = await new DevTools(target.webSocketDebuggerUrl).connect();
      const page = { id: target.id, cdp, errors: [], notes: [], evaluate: (e, t) => cdp.evaluate(e, t) };
      cdp.on('Runtime.exceptionThrown', (p) => page.errors.push(`exception: ${p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text ?? 'unknown'}`));
      cdp.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error') page.errors.push(`console.error: ${(p.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ')}`); });
      await cdp.call('Page.enable'); await cdp.call('Runtime.enable'); await cdp.call('Network.enable');
      page.requests = [];
      cdp.on('Network.requestWillBeSent', (p) => page.requests.push({ url: p.request.url, method: p.request.method }));
      page.offline = (off) => cdp.call('Network.emulateNetworkConditions', off ? { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0, connectionType: 'none' } : { offline: false, latency: 20, downloadThroughput: 5_000_000, uploadThroughput: 1_000_000, connectionType: 'wifi' });
      page.goto = async (u) => { const r = await cdp.call('Page.navigate', { url: u }); if (r.errorText) throw new Error(`navigate_failed:${r.errorText}`); };
      page.reload = () => cdp.call('Page.reload', { ignoreCache: false });
      page.waitFor = async (getter, predicate, timeoutMs = 10000, label = 'condition') => {
        const start = Date.now(); let last;
        while (Date.now() - start < timeoutMs) { try { last = await (typeof getter === 'string' ? cdp.evaluate(getter) : getter()); if (predicate(last)) return last; } catch (e) { last = `error:${e.message}`; } await sleep(120); }
        throw new Error(`wait_timeout:${label}:last=${JSON.stringify(last)?.slice(0, 300)}`);
      };
      page.close = async () => { cdp.close(); pages.delete(page); try { await fetch(`${api}/json/close/${target.id}`); } catch { /* ignore */ } };
      pages.add(page);
      if (url) await page.goto(url);
      return page;
    },
    async kill() { for (const p of [...pages]) p.cdp.close(); if (proc.exitCode === null) proc.kill('SIGTERM'); await sleep(200); if (proc.exitCode === null) proc.kill('SIGKILL'); await fs.rm(userData, { recursive: true, force: true }).catch(() => {}); }
  };
}

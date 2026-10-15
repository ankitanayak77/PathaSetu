// Operational preflight for the Pathasetu demo server. It inspects configuration and starts a LOCAL harness server to
// check the required routes. It never contacts a model provider: the harness always runs with the mock provider and a blank
// API key. It never prints the access code or an API key; every line it emits is redacted against the configured secrets.
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { assessAccessCode, describeAccessCodeProblems, parseAllowedOrigins, parsePublicDemoFlag, MIN_ACCESS_CODE_LENGTH, GENERATE_CODE_HINT } from '../../src/server/access.js';
import { loadPack } from '../../src/core/content.js';
import { parseModelEnv } from '../../src/server/modelEnv.js';

export const MIN_NODE_MAJOR = 20;
export const REQUIRED_FILES = [
  'package.json', 'src/server/server.js', 'src/server/access.js', 'src/core/content.js', 'content/electricity-pack.json',
  'public/index.html', 'public/app.js', 'public/sw.js', 'public/manifest.webmanifest', 'public/styles.css',
  'docs/PHONE_TEST_PLAN.md', 'docs/PHONE_TEST_RESULTS_TEMPLATE.csv', 'docs/CONTENT_REVIEW_WORKSHEET.csv', 'docs/HTTPS_DEMO_RUNBOOK.md', 'docs/EVENT_DAY_CHECKLIST.md', 'docs/REVIEWER_GUIDE.md', 'evaluation/cases.json'
];
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);

// A served item must carry exactly the status it has in the pack file. Anything else is a silent promotion or an unknown item.
export function compareServedStatuses(fileItems, servedItems) {
  const byId = new Map(fileItems.map((item) => [item.id, item.status]));
  const problems = [];
  for (const served of servedItems) {
    if (!byId.has(served.id)) problems.push({ id: served.id, message: 'served item is not in the pack file' });
    else if (byId.get(served.id) !== served.status) problems.push({ id: served.id, message: `served as ${served.status} but the pack file says ${byId.get(served.id)}` });
  }
  return problems;
}

function freePort() {
  return new Promise((resolve, reject) => { const s = net.createServer(); s.once('error', reject); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Raw HTTP so the Host header can be set the way a Host-rewriting tunnel presents it.
function request(port, route, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const req = http.request({ host: '127.0.0.1', port, path: route, method, headers: { host: `127.0.0.1:${port}`, ...(payload ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } : {}), ...headers }, timeout: 8000 }, (res) => {
      let text = ''; res.on('data', (c) => { text += c; });
      res.on('end', () => { let json = null; try { json = JSON.parse(text); } catch { /* not json */ } resolve({ status: res.statusCode, text, json, headers: res.headers }); });
    });
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, text: '', json: null, headers: {} }); });
    req.on('error', () => resolve({ status: 0, text: '', json: null, headers: {} }));
    if (payload) req.write(payload);
    req.end();
  });
}

const SYNTHETIC_ANSWER = { itemId: 'EL01', optionId: 'A', explanation: 'A synthetic preflight explanation with enough detail to pass the length check.' };

export async function runPreflight({ env = process.env, root, expectOrigin = null, nodeVersion = process.versions.node } = {}) {
  const checks = [];
  const add = (status, id, message) => checks.push({ status, id, message });
  const secrets = [env.PATHASETU_DEMO_ACCESS_CODE, env.GROQ_API_KEY, env.GEMINI_API_KEY].filter((value) => typeof value === 'string' && value.length >= 4);
  const redact = (text) => secrets.reduce((acc, secret) => acc.split(secret).join('[redacted]'), String(text));

  // P01 Node
  const major = Number(String(nodeVersion).split('.')[0]);
  add(major >= MIN_NODE_MAJOR ? 'PASS' : 'FAIL', 'P01', `Node ${nodeVersion} (this project needs >= ${MIN_NODE_MAJOR})`);

  // P02 required files
  const missing = REQUIRED_FILES.filter((file) => !fs.existsSync(path.join(root, file)));
  add(missing.length ? 'FAIL' : 'PASS', 'P02', missing.length ? `missing required file(s): ${missing.join(', ')}` : `all ${REQUIRED_FILES.length} required files present`);

  // P03 content pack
  let pack = null;
  try {
    pack = loadPack(path.join(root, 'content/electricity-pack.json'));
    const counts = pack.items.reduce((m, item) => ({ ...m, [item.status]: (m[item.status] ?? 0) + 1 }), {});
    add('PASS', 'P03', `content pack loads: ${pack.items.length} items; statuses ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    const reviewed = pack.items.filter((item) => ['REVIEWED', 'PUBLISHED'].includes(item.status)).length;
    add('INFO', 'P03b', reviewed === 0
      ? `content is NOT reviewed: all ${pack.items.length} items are ${Object.keys(counts).join('/')}; no qualified Odia-medium science reviewer decision is recorded`
      : `${reviewed} of ${pack.items.length} items carry a reviewed/published status in the pack file; this tool cannot confirm the reviewer's qualifications, check the review record yourself`);
  } catch (error) {
    add('FAIL', 'P03', `content pack failed to load: ${redact(error.message).split('\n')[0]}`);
  }

  // P04 consistency (separate process; it never marks anything reviewed)
  const consistency = spawnSync(process.execPath, ['scripts/check-content-consistency.mjs'], { cwd: root, encoding: 'utf8', timeout: 30000 });
  add(consistency.status === 0 ? 'PASS' : 'FAIL', 'P04', consistency.status === 0
    ? 'content consistency check passes (pack, review worksheet and evaluation files agree). Consistency is not review.'
    : `content consistency check failed (exit ${consistency.status}); run npm run check:content for details`);

  // P05 provider (names and presence only)
  const provider = env.PATHASETU_MODEL_PROVIDER || 'mock';
  const providerOk = ['mock', 'groq'].includes(provider);
  let codeRequired = false;
  // Iteration 15: an ordered chain (PATHASETU_MODEL_PROVIDERS) and the retry/time settings use the same pure parser as the server.
  const chainRequested = Boolean(env.PATHASETU_MODEL_PROVIDERS);
  let modelEnv = null;
  try { modelEnv = parseModelEnv(env); }
  catch (error) { if (chainRequested || /^PATHASETU_(RETRY|MODEL_(TIMEOUT|DEADLINE|PLANNING))/.test(error.message)) add('FAIL', 'P05', redact(error.message)); }
  if (modelEnv) {
    const { retryPolicy: r, retryPolicySource: src } = modelEnv;
    add('INFO', 'P05r', `retry policy (${src}): ${r.maxAutomaticAttempts} attempts, base ${r.baseDelayMs} ms, factor ${r.factor}, cap ${r.maxDelayMs} ms`);
  }
  if (chainRequested && modelEnv?.mode === 'chain') {
    add('PASS', 'P05', `model chain: ${modelEnv.providers.map((p) => `${p.name} (${p.model})`).join(' → ')}; planning ${modelEnv.planning ? 'on' : 'off'}; per-provider ${modelEnv.timings.perProviderTimeoutMs} ms, whole chain ${modelEnv.timings.deadlineMs} ms (live model calls happen only through the access-protected /api/recheck)`);
    if (modelEnv.hosted) {
      codeRequired = true;
      add(env.PATHASETU_PROVIDER_DATA_CONTROLS_ACK === 'true' ? 'PASS' : 'FAIL', 'P05e', env.PATHASETU_PROVIDER_DATA_CONTROLS_ACK === 'true'
        ? 'PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true: you have recorded that you reviewed the hosted providers\' data controls and will send synthetic data only'
        : 'A hosted provider is in the chain but PATHASETU_PROVIDER_DATA_CONTROLS_ACK is not "true". Review that provider\'s data controls, then set it to true to confirm you will send synthetic data only (never real children\'s responses).');
    }
  } else if (chainRequested) { /* the parse error was reported above */ }
  else if (!providerOk) add('FAIL', 'P05', 'PATHASETU_MODEL_PROVIDER must be mock or groq');
  else add('PASS', 'P05', `provider: ${provider}${provider === 'mock' ? ' (no live provider request is possible)' : ' (live model calls happen only through the access-protected /api/recheck)'}`);
  if (!chainRequested && provider === 'mock' && env.GROQ_API_KEY) add('WARN', 'P05b', 'GROQ_API_KEY is set but the provider is mock, so it is unused. Unset it unless you intend a Groq run.');
  if (!chainRequested && provider === 'groq') {
    codeRequired = true;
    add(env.GROQ_API_KEY ? 'PASS' : 'FAIL', 'P05c', `GROQ_API_KEY: ${env.GROQ_API_KEY ? 'set (value not shown)' : 'MISSING; set it in your local environment, never in chat or in a file in the repository'}`);
    add('INFO', 'P05d', `GROQ_MODEL: ${env.GROQ_MODEL || 'openai/gpt-oss-20b (default)'}`);
    add(env.PATHASETU_PROVIDER_DATA_CONTROLS_ACK === 'true' ? 'PASS' : 'FAIL', 'P05e', env.PATHASETU_PROVIDER_DATA_CONTROLS_ACK === 'true'
      ? 'PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true: you have recorded that you reviewed the provider data controls and will send synthetic data only'
      : 'PATHASETU_PROVIDER_DATA_CONTROLS_ACK is not "true". Review the provider data controls, then set it to true to confirm you will send synthetic data only (never real children\'s responses).');
  }

  // P06 public demo flag and access code
  let publicDemo = false; let flagValid = true;
  try { publicDemo = parsePublicDemoFlag(env.PATHASETU_PUBLIC_DEMO); }
  catch (error) { flagValid = false; add('FAIL', 'P06', error.message); }
  if (flagValid) add('INFO', 'P06', `public demo mode: ${publicDemo ? 'ON (code required on session, pack and re-check)' : 'off (local development behaviour)'}`);
  const production = env.NODE_ENV === 'production';
  const draftsExposed = !production || env.PATHASETU_ALLOW_DRAFT_DEMO === 'true';
  if (publicDemo || (production && env.PATHASETU_ALLOW_DRAFT_DEMO === 'true')) codeRequired = true;
  const code = env.PATHASETU_DEMO_ACCESS_CODE || '';
  if (codeRequired) {
    const assessment = assessAccessCode(code);
    add(assessment.ok ? 'PASS' : 'FAIL', 'P07', assessment.ok
      ? `PATHASETU_DEMO_ACCESS_CODE: set, ${code.length} characters, passes the strength rules (value not shown)`
      : `PATHASETU_DEMO_ACCESS_CODE is required here and was rejected: ${describeAccessCodeProblems(assessment.problems)} (value not shown). Minimum ${MIN_ACCESS_CODE_LENGTH} random characters. Generate one with: ${GENERATE_CODE_HINT}`);
  } else if (code) {
    const assessment = assessAccessCode(code);
    add(assessment.ok ? 'PASS' : 'WARN', 'P07', assessment.ok ? 'PATHASETU_DEMO_ACCESS_CODE: set (optional here) and strong' : `PATHASETU_DEMO_ACCESS_CODE is set but weak (${describeAccessCodeProblems(assessment.problems)}); acceptable for local use only`);
  } else add('INFO', 'P07', 'PATHASETU_DEMO_ACCESS_CODE: not set (allowed only for local mock development)');

  // P08 bind address
  const bindHost = env.HOST || '127.0.0.1';
  if (!LOOPBACK_HOSTS.has(bindHost)) add(publicDemo ? 'WARN' : 'FAIL', 'P08', `HOST is ${bindHost}, not loopback. ${publicDemo ? 'The server is reachable from the network; a tunnel only needs loopback.' : 'Without PATHASETU_PUBLIC_DEMO=true this exposes an open development server to the network.'}`);
  else add('PASS', 'P08', `HOST: ${bindHost} (loopback only)`);

  // P09 allowed origins (exact, https) and the documented tunnel route
  let origins = new Set(); let originsValid = true;
  try { origins = parseAllowedOrigins(env.PATHASETU_ALLOWED_ORIGINS); }
  catch (error) { originsValid = false; add('FAIL', 'P09', error.message); }
  const external = [...origins].filter((origin) => { const u = new URL(origin); return !LOOPBACK_HOSTS.has(u.hostname); });
  if (originsValid) {
    add(origins.size ? 'PASS' : 'INFO', 'P09', origins.size ? `PATHASETU_ALLOWED_ORIGINS: ${[...origins].join(', ')} (exact origins)` : 'PATHASETU_ALLOWED_ORIGINS: none. That is correct for local use or a tunnel that preserves the Host header; a Host-rewriting tunnel needs the exact external origin listed or every POST returns 403.');
    if (external.length && !publicDemo) add('FAIL', 'P09b', 'a non-local origin is allowed but PATHASETU_PUBLIC_DEMO is not true: the tunnel would expose an open development server. Set PATHASETU_PUBLIC_DEMO=true with a strong PATHASETU_DEMO_ACCESS_CODE.');
  }
  if (expectOrigin) {
    let normalised = null;
    try { const u = new URL(expectOrigin); if (u.origin === expectOrigin && (u.protocol === 'https:') && !expectOrigin.includes('*')) normalised = u.origin; } catch { /* handled below */ }
    if (!normalised) add('FAIL', 'P10', '--expect-origin must be an exact https origin such as https://demo.example.com');
    else add(origins.has(normalised) ? 'PASS' : 'FAIL', 'P10', origins.has(normalised) ? `the planned HTTPS origin ${normalised} is in PATHASETU_ALLOWED_ORIGINS` : `the planned HTTPS origin ${normalised} is NOT in PATHASETU_ALLOWED_ORIGINS`);
  }

  // P11 draft exposure, stated explicitly
  if (pack) {
    const drafts = pack.items.filter((item) => item.status !== 'PUBLISHED');
    if (!draftsExposed && drafts.length === pack.items.length) add('FAIL', 'P11', 'NODE_ENV=production without PATHASETU_ALLOW_DRAFT_DEMO=true serves no questions, because no item is reviewed and published; the learner screen would be empty. For a draft demo set PATHASETU_ALLOW_DRAFT_DEMO=true together with PATHASETU_PUBLIC_DEMO=true and a strong code.');
    else add('INFO', 'P11', draftsExposed ? `unreviewed draft items WILL be served (${drafts.length} of ${pack.items.length}), labelled as demo draft content; nothing is promoted by this setting` : 'only published items are served');
  }

  // Local route checks through a harness server. Skipped when the configuration above already fails: the server would refuse to start.
  const configFailures = checks.filter((check) => check.status === 'FAIL').length;
  if (configFailures) {
    add('SKIP', 'P12', 'local route checks skipped because configuration checks failed (fix the FAIL lines above first)');
  } else {
    await routeChecks({ env, root, add, redact, publicDemo, code, origins, external, pack, draftsExposed, provider });
  }

  add('INFO', 'P99', 'no live provider request was made: the harness runs with the mock provider and a blank API key');
  const failed = checks.filter((check) => check.status === 'FAIL').length;
  const warned = checks.filter((check) => check.status === 'WARN').length;
  return { checks, failed, warned, passed: checks.filter((check) => check.status === 'PASS').length, ok: failed === 0, redact };
}

async function routeChecks({ env, root, add, redact, publicDemo, code, origins, external, pack, draftsExposed, provider }) {
  const port = await freePort();
  const childEnv = {
    ...env, HOST: '127.0.0.1', PORT: String(port),
    PATHASETU_MODEL_PROVIDER: 'mock', PATHASETU_MODEL_PROVIDERS: '', OLLAMA_URL: '', OLLAMA_MODEL: '', GEMINI_API_KEY: '', GEMINI_MODEL: '', GROQ_API_KEY: '', GROQ_MODEL: '', // the harness can never reach a provider
    PATHASETU_FAILED_ATTEMPT_LIMIT: '1000', PATHASETU_SESSION_RATE_LIMIT: '1000', PATHASETU_RECHECK_RATE_LIMIT: '1000'
  };
  const child = spawn(process.execPath, ['src/server/server.js'], { cwd: root, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = ''; child.stdout.on('data', (c) => { logs += c; }); child.stderr.on('data', (c) => { logs += c; });
  try {
    let up = false;
    for (let i = 0; i < 60 && !up; i += 1) {
      if (child.exitCode !== null) break;
      up = (await request(port, '/api/health')).status === 200;
      if (!up) await sleep(150);
    }
    if (!up) { add('FAIL', 'P12', `the harness server did not start: ${redact(logs).split('\n').filter(Boolean).slice(0, 2).join(' | ').slice(0, 300)}`); return; }
    add('PASS', 'P12', `harness server started on a loopback port (provider forced to mock; PATHASETU_MODEL_PROVIDER=${provider} is validated above, not exercised)`);

    const health = await request(port, '/api/health');
    const healthOk = health.json?.provider === 'mock' && health.json.publicDemo === publicDemo && health.json.accessRequired === Boolean(code);
    add(healthOk ? 'PASS' : 'FAIL', 'P13', `GET /api/health: ${health.status}; provider=${health.json?.provider}, publicDemo=${health.json?.publicDemo}, accessRequired=${health.json?.accessRequired}`);

    const withCode = code ? { 'x-pathasetu-demo-code': code } : {};
    const wrong = { 'x-pathasetu-demo-code': `${code || 'unset'}-wrong-guess` };
    const protectedRoutes = Boolean(code);
    const session = await request(port, '/api/session', { headers: withCode });
    add(session.status === 200 ? 'PASS' : 'FAIL', 'P14', `GET /api/session with ${code ? 'the configured code' : 'no code (none configured)'}: ${session.status}`);
    if (protectedRoutes) {
      const [noCode, badCode] = [await request(port, '/api/session'), await request(port, '/api/session', { headers: wrong })];
      add(noCode.status === 401 && badCode.status === 401 ? 'PASS' : 'FAIL', 'P15', `GET /api/session with no code: ${noCode.status}; with a wrong code: ${badCode.status} (both must be 401)`);
    }

    const packRes = await request(port, '/api/pack', { headers: withCode });
    const items = packRes.json?.items ?? [];
    add(packRes.status === 200 ? 'PASS' : 'FAIL', 'P16', `GET /api/pack${code ? ' with the code' : ''}: ${packRes.status}; ${items.length} item(s) served`);
    if (protectedRoutes && (publicDemo || draftsExposed)) {
      const [noCode, badCode] = [await request(port, '/api/pack'), await request(port, '/api/pack', { headers: wrong })];
      const leaked = /EL0\d|bridge/i.test(noCode.text + badCode.text);
      add(noCode.status === 401 && badCode.status === 401 && !leaked ? 'PASS' : 'FAIL', 'P17', `GET /api/pack with no code: ${noCode.status}; with a wrong code: ${badCode.status}; refusal carries no pack content: ${!leaked}`);
    }
    if (pack) {
      const promoted = compareServedStatuses(pack.items, items);
      add(promoted.length ? 'FAIL' : 'PASS', 'P18', promoted.length ? `served items differ from the pack file: ${promoted.map((p) => `${p.id} ${p.message}`).join('; ')}` : `served item statuses match the pack file (${items.filter((i) => i.status !== 'PUBLISHED').length} unreviewed draft item(s) are served as drafts; none promoted)`);
      const expectDraftFlag = items.some((item) => item.status !== 'PUBLISHED');
      if (packRes.json && packRes.json.demoDraftMode !== expectDraftFlag) add('FAIL', 'P18b', 'demoDraftMode in /api/pack does not match the statuses of the served items');
    }

    const recheck = await request(port, '/api/recheck', { method: 'POST', headers: withCode, body: SYNTHETIC_ANSWER });
    const recheckExpected = draftsExposed ? 200 : 404;
    add(recheck.status === recheckExpected ? 'PASS' : 'FAIL', 'P19', `POST /api/recheck with a synthetic answer${code ? ' and the code' : ''}: ${recheck.status} (expected ${recheckExpected}); mock provider, no network`);
    if (protectedRoutes) {
      const [noCode, badCode] = [await request(port, '/api/recheck', { method: 'POST', body: SYNTHETIC_ANSWER }), await request(port, '/api/recheck', { method: 'POST', headers: wrong, body: SYNTHETIC_ANSWER })];
      add(noCode.status === 401 && badCode.status === 401 ? 'PASS' : 'FAIL', 'P20', `POST /api/recheck with no code: ${noCode.status}; with a wrong code: ${badCode.status} (both must be 401)`);
    }

    for (const file of ['/', '/sw.js', '/manifest.webmanifest']) {
      const res = await request(port, file);
      add(res.status === 200 ? 'PASS' : 'FAIL', 'P21', `GET ${file}: ${res.status}`);
    }

    if (external.length) {
      const origin = external[0];
      const hostRewritten = await request(port, '/api/recheck', { method: 'POST', headers: { origin, ...withCode }, body: SYNTHETIC_ANSWER });
      const foreign = await request(port, '/api/recheck', { method: 'POST', headers: { origin: 'https://not-allowed.invalid', ...withCode }, body: SYNTHETIC_ANSWER });
      add(hostRewritten.status === recheckExpected && foreign.status === 403 ? 'PASS' : 'FAIL', 'P22', `Host-rewriting route: POST /api/recheck with Origin ${origin} but a loopback Host: ${hostRewritten.status} (expected ${recheckExpected}); an unlisted origin: ${foreign.status} (expected 403)`);
    }
  } finally {
    child.kill('SIGTERM');
    await sleep(150);
    if (child.exitCode === null) child.kill('SIGKILL');
  }
}

export function formatReport(result) {
  const lines = result.checks.map((check) => `${check.status.padEnd(4)}  ${check.id.padEnd(4)}  ${result.redact(check.message)}`);
  lines.push('', `PREFLIGHT: ${result.ok ? 'PASSED' : 'FAILED'} (${result.passed} pass, ${result.warned} warn, ${result.failed} fail)`);
  lines.push(result.ok
    ? 'This confirms configuration and local routes only. It does not review content, test a phone, or call a model provider.'
    : 'Fix every FAIL line, then run npm run preflight again. Nothing was exposed and no provider was contacted.');
  return lines.join('\n');
}

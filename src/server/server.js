import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPack, selectPublishedItems } from '../core/content.js';
import { proposeDiagnosis } from '../core/mockModel.js';
import { validateDiagnosis } from '../core/validator.js';
import { createGroqModel } from './groqModel.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
const PACK = loadPack();
const MAX_BODY_BYTES = 16 * 1024;
const PROVIDER = process.env.PATHASETU_MODEL_PROVIDER || 'mock';
if (!['mock', 'groq'].includes(PROVIDER)) throw new Error('PATHASETU_MODEL_PROVIDER must be mock or groq');
if (PROVIDER === 'groq' && !process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is required when PATHASETU_MODEL_PROVIDER=groq');
const ACTIVE_MODEL = PROVIDER === 'groq' ? (process.env.GROQ_MODEL || 'openai/gpt-oss-20b') : null;
const ACCESS_CODE = process.env.PATHASETU_DEMO_ACCESS_CODE || '';
const RATE_WINDOW_MS = positiveInteger(process.env.PATHASETU_RATE_WINDOW_MS, 60_000);
const SESSION_RATE_LIMIT = positiveInteger(process.env.PATHASETU_SESSION_RATE_LIMIT, 30);
const RECHECK_RATE_LIMIT = positiveInteger(process.env.PATHASETU_RECHECK_RATE_LIMIT, 24);
const rateBuckets = new Map();

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function rateLimit(req, route, limit) {
  const now = Date.now();
  const client = req.socket.remoteAddress || 'unknown';
  const key = `${route}:${client}`;
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
    bucket = { startedAt: now, count: 0 };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (rateBuckets.size > 1024) {
    for (const [entryKey, entry] of rateBuckets) if (now - entry.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(entryKey);
    while (rateBuckets.size > 2048) rateBuckets.delete(rateBuckets.keys().next().value);
  }
  if (bucket.count <= limit) return null;
  return Math.max(1, Math.ceil((RATE_WINDOW_MS - (now - bucket.startedAt)) / 1000));
}

function enforceRateLimit(req, res, route, limit) {
  const retryAfter = rateLimit(req, route, limit);
  if (retryAfter == null) return false;
  send(res, 429, { error: 'rate_limited', retryAfterSeconds: retryAfter }, 'application/json; charset=utf-8', { 'retry-after': String(retryAfter) });
  return true;
}
function draftDemoEnabled() { return process.env.NODE_ENV !== 'production' || process.env.PATHASETU_ALLOW_DRAFT_DEMO === 'true'; }
if ((PROVIDER === 'groq' || (process.env.NODE_ENV === 'production' && process.env.PATHASETU_ALLOW_DRAFT_DEMO === 'true')) && ACCESS_CODE.length < 16) throw new Error('Set PATHASETU_DEMO_ACCESS_CODE to a random value of at least 16 characters for a Groq or production draft-demo endpoint.');
function hasValidAccessCode(req) {
  if (!ACCESS_CODE) return true;
  const provided = String(req.headers['x-pathasetu-demo-code'] || '');
  const a = Buffer.from(provided); const b = Buffer.from(ACCESS_CODE);
  return a.length === b.length && timingSafeEqual(a, b);
}
const groqDiagnose = PROVIDER === 'groq' ? createGroqModel({ apiKey: process.env.GROQ_API_KEY, model: ACTIVE_MODEL, timeoutMs: 5200 }) : null;
async function getDiagnosis(args) { return PROVIDER === 'groq' ? groqDiagnose(args) : proposeDiagnosis(args); }

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.webmanifest', 'application/manifest+json; charset=utf-8']
]);

function send(res, status, body, type = 'application/json; charset=utf-8', headers = {}) {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'content-security-policy': "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'", ...headers });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    const host = req.headers.host;
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.host === host;
  } catch { return false; }
}

async function readJson(req) {
  let bytes = 0;
  const chunks = [];
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > MAX_BODY_BYTES) throw Object.assign(new Error('body_too_large'), { statusCode: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('invalid_json'), { statusCode: 400 }); }
}

function safeStaticPath(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { return null; }
  // Expose only browser-safe shared core modules. Content loading and server modules stay private.
  if (decoded.startsWith('/core/')) {
    const relativeCore = decoded.slice('/core/'.length);
    if (!/^[a-zA-Z0-9_-]+\.js$/.test(relativeCore)) return null;
    const corePath = path.resolve(ROOT, 'src/core', relativeCore);
    return corePath.startsWith(path.resolve(ROOT, 'src/core') + path.sep) ? corePath : null;
  }
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const resolved = path.resolve(PUBLIC, relative);
  if (!resolved.startsWith(PUBLIC + path.sep) && resolved !== PUBLIC) return null;
  return resolved;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    if (!originAllowed(req)) return send(res, 403, { error: 'origin_not_allowed' });
    if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true, provider: PROVIDER, model: ACTIVE_MODEL, accessRequired: Boolean(ACCESS_CODE), time: new Date().toISOString() });
    if (req.method === 'GET' && url.pathname === '/api/session') {
      if (enforceRateLimit(req, res, 'session', SESSION_RATE_LIMIT)) return;
      const authorized = hasValidAccessCode(req);
      return send(res, authorized ? 200 : 401, { ok: authorized, accessRequired: Boolean(ACCESS_CODE) });
    }
    if (req.method === 'GET' && url.pathname === '/api/pack') {
      const allowDraftDemo = draftDemoEnabled();
      const items = allowDraftDemo ? PACK.items : selectPublishedItems(PACK);
      return send(res, 200, { packId: PACK.packId, subject: PACK.subject, topic: PACK.topic, classLevel: PACK.classLevel, medium: PACK.medium, languageBridge: PACK.languageBridge, demoDraftMode: allowDraftDemo && items.some((item) => item.status !== 'PUBLISHED'), items });
    }
    if (req.method === 'POST' && url.pathname === '/api/recheck') {
      if (enforceRateLimit(req, res, 'recheck', RECHECK_RATE_LIMIT)) return;
      if (!hasValidAccessCode(req)) return send(res, 401, { error: 'demo_access_required' });
      try {
        const body = await readJson(req);
        if (!body || typeof body.itemId !== 'string' || typeof body.optionId !== 'string' || typeof body.explanation !== 'string') return send(res, 400, { error: 'invalid_request' });
        const item = PACK.items.find((candidate) => candidate.id === body.itemId);
        if (!item) return send(res, 404, { error: 'unknown_item' });
        if (!item.options.some((option) => option.id === body.optionId)) return send(res, 400, { error: 'invalid_option' });
        if (body.explanation.length > 1000) return send(res, 400, { error: 'explanation_too_long' });
        if (!draftDemoEnabled() && !selectPublishedItems(PACK).some((candidate) => candidate.id === item.id)) {
          return send(res, 404, { error: 'content_not_published' });
        }
        const proposal = await getDiagnosis({ item, optionId: body.optionId, explanation: body.explanation });
        const checked = validateDiagnosis(proposal, item);
        if (!checked.ok) return send(res, 422, { error: 'diagnosis_rejected', reason: checked.reason });
        return send(res, 200, { provider: PROVIDER, model: ACTIVE_MODEL, diagnosis: checked.value, note: PROVIDER === 'mock' ? 'This result comes from the option-linked demo rule, not semantic language understanding.' : 'Structured provider proposal; still provisional and not educationally validated.' });
      } catch (error) {
        if (error?.statusCode === 413) return send(res, 413, { error: 'body_too_large' });
        if (error?.statusCode === 400 && error?.message === 'invalid_json') return send(res, 400, { error: 'invalid_json' });
        const status = error?.code === 'groq_timeout' ? 504 : error?.statusCode || 502;
        const safeCode = String(error?.code || error?.message || 'request_failed').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
        return send(res, status, { error: status === 504 ? 'provider_timeout' : 'provider_request_failed', code: safeCode });
      }
    }
    return send(res, 404, { error: 'not_found' });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'method_not_allowed' });
  const file = safeStaticPath(url.pathname);
  if (!file) return send(res, 400, { error: 'bad_path' });
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, { error: 'not_found' });
  const ext = path.extname(file).toLowerCase();
  const headers = { 'cache-control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=0, must-revalidate' };
  res.writeHead(200, { 'content-type': TYPES.get(ext) || 'application/octet-stream', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'content-security-policy': "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'", ...headers });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
});

server.requestTimeout = 10_000;
server.headersTimeout = 12_000;
server.keepAliveTimeout = 5_000;
server.listen(PORT, HOST, () => console.log(`Pathasetu listening on http://${HOST}:${PORT} provider=${PROVIDER}${ACTIVE_MODEL ? ` model=${ACTIVE_MODEL}` : ''} node=${process.version}`));

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));

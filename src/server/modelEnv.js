// Iteration 15: pure parsing and validation of the model environment. No network, no clients, no provider imports, so
// `npm run preflight` can use exactly the rules the server uses without being able to reach a provider.
// Every model, key, URL, time budget and retry limit is read from the environment here.
// Nothing is defaulted to a model name. Defaults exist only for time budgets and the retry policy, and they are documented values
// that the environment can change. A value that is set but invalid is an error, never a silent fallback.
import { RETRY_POLICY, normalisePolicy } from '../core/retry.js';

const KNOWN = ['ollama', 'gemini', 'groq'];
const DEFAULT_PROVIDER_TIMEOUT_MS = 20_000;
const DEFAULT_DEADLINE_MS = 45_000;
const DEFAULT_RECHECK_TIMEOUT_MS = 8_000;
const RECHECK_MARGIN_MS = 3_000;
const MAX_TIMEOUT_MS = 600_000;
const MAX_ATTEMPTS = 50;
const MAX_DELAY_MS = 3_600_000;

function numberFrom(env, name, { integer = false, min, max }) {
  const raw = env[name];
  if (raw === undefined || raw === '') return undefined;
  const value = Number(raw);
  const ok = Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value));
  if (!ok) throw new Error(`${name} must be ${integer ? 'a whole number' : 'a number'} between ${min} and ${max} (got "${String(raw).slice(0, 40)}")`);
  return value;
}

const isLoopback = (url) => ['127.0.0.1', 'localhost', '[::1]', '::1'].includes(new URL(url).hostname);

function parseList(raw) {
  const names = String(raw).split(',').map((part) => part.trim().toLowerCase());
  if (names.some((name) => !name)) throw new Error('PATHASETU_MODEL_PROVIDERS has an empty entry');
  const seen = new Set();
  for (const name of names) {
    if (!KNOWN.includes(name)) throw new Error(`PATHASETU_MODEL_PROVIDERS has an unknown provider "${name.slice(0, 30)}" (allowed: ${KNOWN.join(', ')})`);
    if (seen.has(name)) throw new Error(`PATHASETU_MODEL_PROVIDERS lists ${name} twice (duplicate)`);
    seen.add(name);
  }
  return names;
}

function retryFrom(env) {
  const maxAutomaticAttempts = numberFrom(env, 'PATHASETU_RETRY_MAX_ATTEMPTS', { integer: true, min: 1, max: MAX_ATTEMPTS });
  const baseDelayMs = numberFrom(env, 'PATHASETU_RETRY_BASE_DELAY_MS', { integer: true, min: 1, max: MAX_DELAY_MS });
  const factor = numberFrom(env, 'PATHASETU_RETRY_FACTOR', { min: 1, max: 10 });
  const maxDelayMs = numberFrom(env, 'PATHASETU_RETRY_MAX_DELAY_MS', { integer: true, min: 1, max: MAX_DELAY_MS });
  const given = { maxAutomaticAttempts, baseDelayMs, factor, maxDelayMs };
  const supplied = Object.values(given).some((value) => value !== undefined);
  const merged = { ...RETRY_POLICY, ...Object.fromEntries(Object.entries(given).filter(([, value]) => value !== undefined)) };
  if (merged.maxDelayMs < merged.baseDelayMs) throw new Error('PATHASETU_RETRY_MAX_DELAY_MS cannot be below the base delay');
  return { retryPolicy: normalisePolicy(merged), retryPolicySource: supplied ? 'environment' : 'default' };
}

export function parseModelEnv(env = process.env) {
  const retry = retryFrom(env);
  const legacy = env.PATHASETU_MODEL_PROVIDER || 'mock';
  const listRaw = env.PATHASETU_MODEL_PROVIDERS;

  if (listRaw === undefined || listRaw === '') {
    if (!['mock', 'groq'].includes(legacy)) throw new Error('PATHASETU_MODEL_PROVIDER must be mock or groq');
    if (legacy === 'groq' && !env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is required when PATHASETU_MODEL_PROVIDER=groq');
    return { mode: legacy, providers: [], needsAccessCode: legacy === 'mock' ? false : true, hosted: legacy !== 'mock', planning: false, timings: null, recheckTimeoutMs: DEFAULT_RECHECK_TIMEOUT_MS, ...retry };
  }

  if (env.PATHASETU_MODEL_PROVIDER && env.PATHASETU_MODEL_PROVIDER !== 'mock') throw new Error('Set either PATHASETU_MODEL_PROVIDERS (ordered list) or PATHASETU_MODEL_PROVIDER (single), not both: remove PATHASETU_MODEL_PROVIDER (the value mock is ignored when a list is set)');
  const names = parseList(listRaw);
  const perProviderTimeoutMs = numberFrom(env, 'PATHASETU_MODEL_TIMEOUT_MS', { integer: true, min: 1, max: MAX_TIMEOUT_MS }) ?? DEFAULT_PROVIDER_TIMEOUT_MS;
  const deadlineMs = numberFrom(env, 'PATHASETU_MODEL_DEADLINE_MS', { integer: true, min: 1, max: MAX_TIMEOUT_MS }) ?? Math.max(DEFAULT_DEADLINE_MS, perProviderTimeoutMs);
  if (deadlineMs < perProviderTimeoutMs && env.PATHASETU_MODEL_DEADLINE_MS !== undefined && env.PATHASETU_MODEL_TIMEOUT_MS !== undefined) throw new Error('PATHASETU_MODEL_DEADLINE_MS cannot be below PATHASETU_MODEL_TIMEOUT_MS');
  const planningRaw = (env.PATHASETU_MODEL_PLANNING || 'on').toLowerCase();
  if (!['on', 'off'].includes(planningRaw)) throw new Error('PATHASETU_MODEL_PLANNING must be on or off');
  const planning = planningRaw === 'on';

  let hosted = false;
  const providers = names.map((name) => {
    if (name === 'ollama') {
      if (!env.OLLAMA_MODEL) throw new Error('OLLAMA_MODEL is required when ollama is in PATHASETU_MODEL_PROVIDERS');
      const baseUrl = env.OLLAMA_URL || 'http://127.0.0.1:11434';
      let parsed;
      try { parsed = new URL(baseUrl); } catch { throw new Error('OLLAMA_URL must be a valid http(s) URL'); }
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('OLLAMA_URL must be a valid http(s) URL');
      if (!isLoopback(baseUrl)) hosted = true;
      return { name, model: env.OLLAMA_MODEL, baseUrl };
    }
    hosted = true; // gemini and groq send learner text to a hosted service
    const KEY = `${name.toUpperCase()}_API_KEY`; const MODEL = `${name.toUpperCase()}_MODEL`;
    if (!env[KEY]) throw new Error(`${KEY} is required when ${name} is in PATHASETU_MODEL_PROVIDERS`);
    if (!env[MODEL]) throw new Error(`${MODEL} is required when ${name} is in PATHASETU_MODEL_PROVIDERS`);
    return { name, model: env[MODEL], apiKey: env[KEY] };
  });

  // A re-check may run the diagnosis chain and then the planning chain, so the browser waits for both budgets plus a margin.
  const recheckTimeoutMs = (planning ? 2 : 1) * deadlineMs + RECHECK_MARGIN_MS;
  return { mode: 'chain', providers, needsAccessCode: hosted, hosted, planning, timings: { perProviderTimeoutMs, deadlineMs }, recheckTimeoutMs, ...retry };
}

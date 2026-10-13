// Pure helpers for the lightweight demo access policy. Shared by the server and `npm run preflight`.
// None of these functions return, log or throw the access code itself: they report categories only.
// This is demo protection for a private tunnel, NOT production-grade authentication.

export const MIN_ACCESS_CODE_LENGTH = 16;
const MIN_DISTINCT_CHARACTERS = 6;
const MAX_SEQUENTIAL_RUN = 8;
const PLACEHOLDER_WORDS = ['password', 'changeme', 'change-me', 'placeholder', 'replace-me', 'replaceme', 'example', 'your-code'];

export const GENERATE_CODE_HINT = "node -e \"console.log(require('node:crypto').randomBytes(24).toString('base64url'))\"";

function longestSequentialRun(value) {
  let best = 1; let run = 1; let direction = 0;
  for (let i = 1; i < value.length; i += 1) {
    const step = value.charCodeAt(i) - value.charCodeAt(i - 1);
    if (step === 1 || step === -1) {
      run = direction === step ? run + 1 : 2;
      direction = step;
    } else { run = 1; direction = 0; }
    if (run > best) best = run;
  }
  return best;
}

function isRepeatedUnit(value) {
  for (let size = 1; size <= Math.floor(value.length / 2); size += 1) {
    if (value.length % size === 0 && value === value.slice(0, size).repeat(value.length / size)) return true;
  }
  return false;
}

// Returns { ok, problems }. `problems` holds fixed category names only, never any part of the code.
export function assessAccessCode(code) {
  const value = typeof code === 'string' ? code : '';
  const problems = [];
  if (value.length < MIN_ACCESS_CODE_LENGTH) problems.push('shorter_than_16_characters');
  if (/\s/.test(value)) problems.push('contains_whitespace');
  if (value.length > 0) {
    if (new Set(value).size < MIN_DISTINCT_CHARACTERS) problems.push('too_few_distinct_characters');
    if (isRepeatedUnit(value)) problems.push('repeating_pattern');
    if (longestSequentialRun(value) >= MAX_SEQUENTIAL_RUN) problems.push('sequential_characters');
    const lower = value.toLowerCase();
    if (PLACEHOLDER_WORDS.some((word) => lower.includes(word))) problems.push('placeholder_word');
  }
  return { ok: problems.length === 0, problems };
}

export function describeAccessCodeProblems(problems) {
  return problems.length ? problems.join(', ') : 'none';
}

// PATHASETU_PUBLIC_DEMO accepts only the exact strings true or false (or unset/empty = false).
// Anything else throws rather than silently enabling or disabling the protection.
export function parsePublicDemoFlag(value) {
  if (value === undefined || value === null || value === '' || value === 'false') return false;
  if (value === 'true') return true;
  throw new Error('PATHASETU_PUBLIC_DEMO must be true or false (exact lower-case value, or unset).');
}

function maskCredentials(raw) { return String(raw).replace(/\/\/[^/@]*@/, '//***@'); }

// Exact origins only: https, or http for loopback. No wildcard, path, query, fragment, credentials, default port or upper-case host.
export function parseAllowedOrigins(value) {
  const origins = new Set();
  for (const raw of String(value || '').split(',').map((part) => part.trim()).filter(Boolean)) {
    const shown = maskCredentials(raw).slice(0, 120);
    let url;
    try { url = new URL(raw); } catch { throw new Error(`PATHASETU_ALLOWED_ORIGINS has an invalid entry: ${shown}`); }
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
    const hostOk = /^(\[[0-9a-f:]+\]|[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)$/.test(url.hostname);
    if (raw.includes('*') || !hostOk || url.origin !== raw || !(url.protocol === 'https:' || (url.protocol === 'http:' && local))) {
      throw new Error(`PATHASETU_ALLOWED_ORIGINS entries must be exact origins such as https://demo.example.com (https, or http for localhost; no path, no wildcard, no credentials): ${shown}`);
    }
    origins.add(url.origin);
  }
  return origins;
}

export function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const DEFAULT_FAILED_ATTEMPT_LIMIT = 20;

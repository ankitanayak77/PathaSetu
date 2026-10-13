// `npm run preflight`: configuration and readiness checks. Each case runs the real command with a specific environment.
// It must exit nonzero for unsafe or demo-blocking configuration, print no secret value, and never contact a model provider.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CODE = 'Pf7Kq2Vx9mT4Lb8RnY3cZd1e'; // synthetic, 24 characters
const FAKE_KEY = 'gsk_SYNTHETICPREFLIGHTKEYDONOTUSE0001'; // not a real key
const TUNNEL = 'https://demo.example.test';
const CLEAN = { HOST: '', PORT: '', NODE_ENV: '', PATHASETU_MODEL_PROVIDER: '', GROQ_API_KEY: '', GROQ_MODEL: '', PATHASETU_DEMO_ACCESS_CODE: '', PATHASETU_PUBLIC_DEMO: '', PATHASETU_ALLOW_DRAFT_DEMO: '', PATHASETU_ALLOWED_ORIGINS: '', PATHASETU_PROVIDER_DATA_CONTROLS_ACK: '' };

function preflight(env = {}, args = []) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/preflight.mjs', ...args], { cwd: ROOT, env: { ...process.env, ...CLEAN, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = ''; child.stdout.on('data', (c) => { out += c; }); child.stderr.on('data', (c) => { out += c; });
    const timer = setTimeout(() => child.kill('SIGKILL'), 45000);
    child.on('exit', (code) => { clearTimeout(timer); resolve({ code, out }); });
  });
}
const noSecrets = (out) => { assert.ok(!out.includes(CODE), 'the access code must not be printed'); assert.ok(!out.includes(FAKE_KEY), 'the API key must not be printed'); assert.ok(!/gsk_[A-Za-z0-9]{8}/.test(out), 'nothing key-shaped may be printed'); };
const failedLines = (out) => out.split('\n').filter((l) => l.startsWith('FAIL'));

test('a safe local mock configuration passes, states that content is unreviewed, and makes no live provider request', async () => {
  const { code, out } = await preflight();
  assert.equal(code, 0, out);
  assert.match(out, /PREFLIGHT: PASSED/);
  assert.match(out, /provider: mock/i);
  assert.match(out, /UNREVIEWED_DRAFT/);
  assert.match(out, /not (been )?reviewed|unreviewed/i);
  assert.match(out, /no live provider request/i);
  assert.match(out, /\/api\/health/); assert.match(out, /\/api\/pack/); assert.match(out, /\/api\/recheck/); assert.match(out, /\/api\/session/);
  assert.equal(failedLines(out).length, 0);
});

test('public demo mode without a code fails, names the variable, and prints no secret', async () => {
  const { code, out } = await preflight({ PATHASETU_PUBLIC_DEMO: 'true' });
  assert.equal(code, 1, out); assert.match(out, /PREFLIGHT: FAILED/); assert.match(out, /PATHASETU_DEMO_ACCESS_CODE/);
});

test('a weak code, whitespace or ambiguous public-demo value fails without echoing the value', async () => {
  for (const weak of ['short', 'aaaaaaaaaaaaaaaaaaaaaaaa', 'abcdefghijklmnopqrstuvwx', 'has space in the code 12345']) {
    const { code, out } = await preflight({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: weak });
    assert.equal(code, 1, weak); assert.ok(!out.includes(weak), `weak code echoed: ${weak}`);
  }
  for (const value of ['yes', 'TRUE', '1']) {
    const { code, out } = await preflight({ PATHASETU_PUBLIC_DEMO: value, PATHASETU_DEMO_ACCESS_CODE: CODE });
    assert.equal(code, 1, value); assert.match(out, /PATHASETU_PUBLIC_DEMO must be true or false/); noSecrets(out);
  }
});

test('a public demo with a strong code and the exact HTTPS tunnel origin passes, checks the Host-rewriting route, and hides the code', async () => {
  const { code, out } = await preflight({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, PATHASETU_ALLOWED_ORIGINS: TUNNEL, PATHASETU_ALLOW_DRAFT_DEMO: 'true', NODE_ENV: 'production' }, ['--expect-origin', TUNNEL]);
  assert.equal(code, 0, out); noSecrets(out);
  assert.match(out, /PASS .*origin/i);
  assert.match(out, /Host-rewrit/i);
  assert.match(out, /wrong code.*401/i);
  assert.match(out, /draft/i);
});

test('--expect-origin that is missing from PATHASETU_ALLOWED_ORIGINS fails, as does an invalid expectation', async () => {
  const base = { PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, PATHASETU_ALLOWED_ORIGINS: TUNNEL };
  assert.equal((await preflight(base, ['--expect-origin', 'https://other.example.test'])).code, 1);
  assert.equal((await preflight({ ...base, PATHASETU_ALLOWED_ORIGINS: '' }, ['--expect-origin', TUNNEL])).code, 1);
  assert.equal((await preflight(base, ['--expect-origin', 'https://*.example.test'])).code, 1);
});

test('wildcard, path and credential origins fail without echoing credentials', async () => {
  for (const origin of ['https://*.example.test', 'https://demo.example.test/app', 'http://demo.example.test', 'https://user:hunter2@demo.example.test']) {
    const { code, out } = await preflight({ PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE, PATHASETU_ALLOWED_ORIGINS: origin });
    assert.equal(code, 1, origin); assert.match(out, /PATHASETU_ALLOWED_ORIGINS/); assert.ok(!out.includes('hunter2'));
  }
});

test('a non-local tunnel origin without public demo mode fails: the tunnel would expose an open development server', async () => {
  const { code, out } = await preflight({ PATHASETU_ALLOWED_ORIGINS: TUNNEL });
  assert.equal(code, 1, out); assert.match(out, /PATHASETU_PUBLIC_DEMO/);
});

test('binding to all interfaces without public demo mode fails; with public demo mode it is only a warning', async () => {
  assert.equal((await preflight({ HOST: '0.0.0.0' })).code, 1);
  const warned = await preflight({ HOST: '0.0.0.0', PATHASETU_PUBLIC_DEMO: 'true', PATHASETU_DEMO_ACCESS_CODE: CODE });
  assert.equal(warned.code, 0, warned.out); assert.match(warned.out, /WARN .*HOST/);
});

test('NODE_ENV=production without the draft flag fails: with nothing published the learner screen would be empty', async () => {
  const { code, out } = await preflight({ NODE_ENV: 'production' });
  assert.equal(code, 1, out); assert.match(out, /PATHASETU_ALLOW_DRAFT_DEMO/);
});

test('groq: a missing key, a missing code or a missing data-controls acknowledgement each fail; a complete configuration passes without any key output or provider call', async () => {
  const groq = { PATHASETU_MODEL_PROVIDER: 'groq', GROQ_API_KEY: FAKE_KEY, PATHASETU_DEMO_ACCESS_CODE: CODE, PATHASETU_PROVIDER_DATA_CONTROLS_ACK: 'true' };
  const missingKey = await preflight({ ...groq, GROQ_API_KEY: '' }); assert.equal(missingKey.code, 1); assert.match(missingKey.out, /GROQ_API_KEY/);
  const missingCode = await preflight({ ...groq, PATHASETU_DEMO_ACCESS_CODE: '' }); assert.equal(missingCode.code, 1); assert.match(missingCode.out, /PATHASETU_DEMO_ACCESS_CODE/);
  const missingAck = await preflight({ ...groq, PATHASETU_PROVIDER_DATA_CONTROLS_ACK: '' }); assert.equal(missingAck.code, 1); assert.match(missingAck.out, /PATHASETU_PROVIDER_DATA_CONTROLS_ACK/);
  for (const r of [missingKey, missingCode, missingAck]) noSecrets(r.out);
  const ok = await preflight(groq);
  assert.equal(ok.code, 0, ok.out); noSecrets(ok.out);
  assert.match(ok.out, /provider: groq/i); assert.match(ok.out, /GROQ_API_KEY: set/); assert.match(ok.out, /no live provider request/i);
  assert.match(ok.out, /harness .*mock/i, 'the local route check must run against a forced-mock harness, never the live provider');
});

test('an unknown provider fails', async () => {
  const { code, out } = await preflight({ PATHASETU_MODEL_PROVIDER: 'openai' });
  assert.equal(code, 1); assert.match(out, /PATHASETU_MODEL_PROVIDER/);
});

test('promotion check: a served item whose status differs from the pack file is flagged', async () => {
  const { compareServedStatuses } = await import('../scripts/lib/preflight.mjs');
  const file = [{ id: 'EL01', status: 'UNREVIEWED_DRAFT' }, { id: 'EL02', status: 'UNREVIEWED_DRAFT' }];
  assert.deepEqual(compareServedStatuses(file, [{ id: 'EL01', status: 'UNREVIEWED_DRAFT' }]), []);
  assert.deepEqual(compareServedStatuses(file, [{ id: 'EL01', status: 'PUBLISHED' }]).map((p) => p.id), ['EL01']);
  assert.deepEqual(compareServedStatuses(file, [{ id: 'EL99', status: 'UNREVIEWED_DRAFT' }]).map((p) => p.id), ['EL99']);
});

test('the preflight source never names a provider endpoint and never imports the provider adapter', () => {
  const source = ['scripts/preflight.mjs', 'scripts/lib/preflight.mjs'].map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  assert.doesNotMatch(source, /api\.groq\.com|groqModel/);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts.preflight, 'node scripts/preflight.mjs');
});

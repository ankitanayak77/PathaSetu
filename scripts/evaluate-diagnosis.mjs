// Diagnosis evaluation on explicitly labelled synthetic cases (evaluation/cases.json, TEAM_AUTHORED_UNVALIDATED).
//   node scripts/evaluate-diagnosis.mjs                      deterministic baseline only (always possible, no network)
//   PATHASETU_MODEL_PROVIDER=groq GROQ_API_KEY=... PATHASETU_DEMO_ACCESS_CODE=... node scripts/evaluate-diagnosis.mjs --provider groq
// The live run goes through the real server route and always includes the deterministic baseline on the identical cases.
// Never prints or stores keys, headers or raw provider bodies. Exit codes: 0 done, 2 BLOCKED (no credentials), 1 failure.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPack } from '../src/core/content.js';
import { proposeDiagnosis } from '../src/core/mockModel.js';
import { validateDiagnosis } from '../src/core/validator.js';
import { scoreRun } from './lib/eval-metrics.mjs';
import { renderReport } from './lib/eval-report.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : fallback; };
const provider = arg('--provider', 'mock');
const casesPath = path.resolve(ROOT, arg('--cases', 'evaluation/cases.json'));
const outDir = path.resolve(ROOT, arg('--out', 'evidence/iteration3/evaluation'));
const dataset = JSON.parse(await fs.readFile(casesPath, 'utf8'));
const pack = loadPack();
const itemById = new Map(pack.items.map((item) => [item.id, item]));
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
await fs.mkdir(outDir, { recursive: true });

function runBaseline() {
  return dataset.cases.map((c) => {
    const item = itemById.get(c.itemId);
    const started = performance.now();
    const proposal = proposeDiagnosis({ item, optionId: c.optionId, explanation: c.explanation });
    const checked = validateDiagnosis(proposal, item);
    const elapsedMs = performance.now() - started;
    return checked.ok ? { id: c.id, outcome: 'valid', predicted: { type: checked.value.type, misconceptionId: checked.value.misconceptionId ?? null, confidence: checked.value.confidence }, elapsedMs } : { id: c.id, outcome: 'rejected', predicted: null, elapsedMs, errorCode: 'validator_rejected' };
  });
}

const baselineResults = runBaseline();
const baselineMetrics = scoreRun(dataset.cases, baselineResults);
const meta = (label, extra = {}) => ({ label, when: new Date().toISOString(), provider, model: null, datasetWarning: dataset.warning, ...extra });

async function write(name, payload, report) {
  await fs.writeFile(path.join(outDir, `${name}.json`), JSON.stringify(payload, null, 2) + '\n');
  await fs.writeFile(path.join(outDir, `${name}.md`), report + '\n');
  console.log(`written: ${path.relative(ROOT, path.join(outDir, name))}.json and .md`);
}
const summarise = (m) => `valid ${m.compatibility.valid}/${m.compatibility.n} · agreement ${m.diagnosis.overallAgreementOverAllCases.successes}/${m.diagnosis.overallAgreementOverAllCases.n} · false-positive misconceptions on correct reasoning ${m.diagnosis.falsePositiveMisconceptionsOnCorrectReasoning.successes}/${m.diagnosis.falsePositiveMisconceptionsOnCorrectReasoning.n} · proper abstention ${m.diagnosis.abstention.onAbstainReferenceCases_properAbstention.successes}/${m.diagnosis.abstention.onAbstainReferenceCases_properAbstention.n}`;

if (provider === 'mock') {
  const m = { ...meta('deterministic baseline (option-linked mock rule)', { provider: 'mock-deterministic-baseline' }) };
  console.log(`BASELINE (deterministic option-linked rule, no network): ${summarise(baselineMetrics)}`);
  await write(`evaluation-baseline-${stamp}`, { meta: m, results: baselineResults, metrics: baselineMetrics }, renderReport({ meta: m, metrics: baselineMetrics }));
  process.exit(0);
}

if (provider !== 'groq') { console.error(`Unknown provider "${provider}". Use mock or groq.`); process.exit(1); }
const missing = ['GROQ_API_KEY', 'PATHASETU_DEMO_ACCESS_CODE'].filter((name) => !process.env[name]);
if (process.env.PATHASETU_MODEL_PROVIDER !== 'groq') missing.push('PATHASETU_MODEL_PROVIDER=groq');
if (process.env.PATHASETU_PROVIDER_DATA_CONTROLS_ACK !== 'true') missing.push('PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true');
if (missing.length) {
  const note = `BLOCKED: local credentials or settings not configured (${missing.join(', ')}). No live evaluation was run. Values are never requested in chat.`;
  console.error(note);
  await fs.writeFile(path.join(outDir, `evaluation-groq-BLOCKED-${stamp}.txt`), `${note}\nTime: ${new Date().toISOString()}\nThe deterministic baseline on the same cases is in the evaluation-baseline files.\n`);
  process.exit(2);
}

const HOST = '127.0.0.1';
const port = await new Promise((resolve, reject) => { const s = net.createServer(); s.once('error', reject); s.listen(0, HOST, () => { const { port: p } = s.address(); s.close(() => resolve(p)); }); });
const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const server = spawn(process.execPath, ['src/server/server.js'], { cwd: ROOT, env: { ...process.env, HOST, PORT: String(port), NODE_ENV: 'development', PATHASETU_MODEL_PROVIDER: 'groq', PATHASETU_MODEL_PROVIDERS: '', GROQ_MODEL: model }, stdio: ['ignore', 'ignore', 'ignore'] });
const delay = Number(process.env.EVAL_DELAY_MS || 2300);
const results = [];
try {
  for (let i = 0; i < 40; i++) { try { if ((await fetch(`http://${HOST}:${port}/api/health`)).ok) break; } catch { /* retry */ } await sleep(250); }
  for (const c of dataset.cases) {
    const started = performance.now();
    try {
      const response = await fetch(`http://${HOST}:${port}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-pathasetu-demo-code': process.env.PATHASETU_DEMO_ACCESS_CODE }, body: JSON.stringify({ itemId: c.itemId, optionId: c.optionId, explanation: c.explanation }), signal: AbortSignal.timeout(Number(process.env.EVAL_TIMEOUT_MS || 15000)) });
      const data = await response.json().catch(() => ({}));
      const elapsedMs = performance.now() - started;
      if (response.ok && data.diagnosis) results.push({ id: c.id, outcome: 'valid', predicted: { type: data.diagnosis.type, misconceptionId: data.diagnosis.misconceptionId ?? null, confidence: data.diagnosis.confidence }, elapsedMs });
      else if (response.status === 422) results.push({ id: c.id, outcome: 'rejected', predicted: null, elapsedMs, errorCode: 'validator_rejected' });
      else results.push({ id: c.id, outcome: 'error', predicted: null, elapsedMs, errorCode: response.status === 504 ? 'timeout' : `http_${response.status}` });
    } catch (error) { results.push({ id: c.id, outcome: 'error', predicted: null, elapsedMs: performance.now() - started, errorCode: error?.name === 'TimeoutError' ? 'timeout' : 'network_error' }); }
    console.log(`${c.id} ${results.at(-1).outcome}${results.at(-1).errorCode ? ` (${results.at(-1).errorCode})` : ''} ${Math.round(results.at(-1).elapsedMs)} ms`);
    await sleep(delay);
  }
} finally { server.kill('SIGTERM'); }
const metrics = scoreRun(dataset.cases, results);
const m = meta(`${model} through the Pathasetu server route`, { provider: 'groq', model });
console.log(`LIVE ${model}: ${summarise(metrics)}`);
console.log(`BASELINE: ${summarise(baselineMetrics)}`);
await write(`evaluation-groq-${model.replace(/[^A-Za-z0-9]+/g, '_')}-${stamp}`, { meta: m, results, metrics, baseline: { results: baselineResults, metrics: baselineMetrics } }, renderReport({ meta: m, metrics, baseline: baselineMetrics }));
process.exit(0);

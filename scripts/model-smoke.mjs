import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = '127.0.0.1';
const provider = process.env.PATHASETU_MODEL_PROVIDER || 'mock';
if (provider !== 'groq') { console.error('BLOCKED: set PATHASETU_MODEL_PROVIDER=groq and GROQ_API_KEY in your local environment. Never put a key in this script or chat.'); process.exit(2); }
if (!process.env.GROQ_API_KEY) { console.error('BLOCKED: GROQ_API_KEY is not set in this local environment.'); process.exit(2); }
if (!process.env.PATHASETU_DEMO_ACCESS_CODE || process.env.PATHASETU_DEMO_ACCESS_CODE.length < 16) { console.error('BLOCKED: set a random PATHASETU_DEMO_ACCESS_CODE of at least 16 characters; all model requests are access-protected.'); process.exit(2); }
let server;
let port;
const cases = [
  { id: 'S01', itemId: 'EL01', optionId: 'B', explanation: 'The disconnected wire opens the loop, so there is no complete path for a steady current.' },
  { id: 'S02', itemId: 'EL01', optionId: 'A', explanation: 'The cell keeps pushing charge, so current accumulates at the open end of the wire.' },
  { id: 'S03', itemId: 'EL01', optionId: 'C', explanation: 'Current can jump over the open gap without a conducting connection.' },
  { id: 'S04', itemId: 'EL01', optionId: 'D', explanation: 'The bulb consumes current as it lights, so no current remains after it.' },
  { id: 'S05', itemId: 'EL01', optionId: 'A', explanation: 'It just stops.' },
  { id: 'S06', itemId: 'EL02', optionId: 'A', explanation: 'The switch breaks the loop, although the cell can still contain chemical energy.' },
  { id: 'S07', itemId: 'EL02', optionId: 'B', explanation: 'Opening the switch makes the battery instantly lose all its stored energy.' },
  { id: 'S08', itemId: 'EL02', optionId: 'C', explanation: 'Current remains stored inside the bulb when the switch opens.' },
  { id: 'S09', itemId: 'EL02', optionId: 'D', explanation: 'The open switch turns the current into air.' },
  { id: 'S10', itemId: 'EL03', optionId: 'B', explanation: 'Energy transferred from the cell to the resistor can be transferred to thermal energy.' },
  { id: 'S11', itemId: 'EL03', optionId: 'A', explanation: 'Energy is destroyed in the resistor and no energy remains.' },
  { id: 'S12', itemId: 'EL04', optionId: 'A', explanation: 'The warm resistor creates new energy from nothing.' },
  { id: 'S13', itemId: 'EL04', optionId: 'B', explanation: 'The resistor becomes warm because some energy is transferred to thermal energy.' }
];
async function freePort() { return await new Promise((resolve, reject) => { const s = net.createServer(); s.once('error', reject); s.listen(0, HOST, () => { const p = s.address().port; s.close(() => resolve(p)); }); }); }
async function waitForServer(base) { for (let i = 0; i < 40; i++) { try { const r = await fetch(`${base}/api/health`); if (r.ok) return await r.json(); } catch {} await sleep(250); } throw new Error('server_start_timeout'); }
let failed = 0; const output = { createdAt: new Date().toISOString(), provider: 'groq', model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b', inputType: 'synthetic-only', cases: [], warning: 'Smoke test checks live API compatibility and response shape only. It does not establish diagnosis accuracy or Odia proficiency.' };
try {
  port = await freePort();
  server = spawn(process.execPath, ['src/server/server.js'], { cwd: ROOT, env: { ...process.env, HOST, PORT: String(port), NODE_ENV: 'development' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = ''; server.stdout.on('data', (c) => { logs += c.toString(); }); server.stderr.on('data', (c) => { logs += c.toString(); });
  const base = `http://${HOST}:${port}`;
  const health = await waitForServer(base);
  if (health.provider !== 'groq') throw new Error(`server_provider_mismatch:${health.provider}`);
  const pack = await fetch(`${base}/api/pack`).then((r) => r.json());
  const byId = new Map(pack.items.map((item) => [item.id, item]));
  for (const testCase of cases) {
    const started = Date.now();
    try {
      const response = await fetch(`${base}/api/recheck`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-pathasetu-demo-code': process.env.PATHASETU_DEMO_ACCESS_CODE }, body: JSON.stringify({ itemId: testCase.itemId, optionId: testCase.optionId, explanation: testCase.explanation }), signal: AbortSignal.timeout(9000) });
      const data = await response.json().catch(() => ({}));
      const item = byId.get(testCase.itemId);
      const structurallyValid = response.ok && data.provider === 'groq' && data.diagnosis?.questionId === testCase.itemId && ['MISCONCEPTION', 'NONE', 'UNCERTAIN'].includes(data.diagnosis.type) && (data.diagnosis.type !== 'MISCONCEPTION' || item.allowedMisconceptionIds.includes(data.diagnosis.misconceptionId));
      const row = { id: testCase.id, itemId: testCase.itemId, httpStatus: response.status, elapsedMs: Date.now() - started, diagnosisType: data.diagnosis?.type ?? null, misconceptionId: data.diagnosis?.misconceptionId ?? null, structurallyValid, safeError: data.error ?? null };
      output.cases.push(row); if (!structurallyValid) failed++;
      console.log(`${structurallyValid ? 'PASS' : 'FAIL'} ${row.id} item=${row.itemId} status=${row.httpStatus} ms=${row.elapsedMs} type=${row.diagnosisType ?? 'none'} id=${row.misconceptionId ?? '-'}${row.safeError ? ` error=${row.safeError}` : ''}`);
    } catch (error) {
      failed++; const row = { id: testCase.id, itemId: testCase.itemId, httpStatus: null, elapsedMs: Date.now() - started, diagnosisType: null, misconceptionId: null, structurallyValid: false, safeError: error?.name === 'TimeoutError' ? 'client_timeout' : 'request_failed' };
      output.cases.push(row); console.log(`FAIL ${row.id} item=${row.itemId} error=${row.safeError}`);
    }
  }
} catch (error) {
  failed++;
  output.error = error?.message ?? 'smoke_failed';
  console.error(`SMOKE FAILED: ${output.error}`);
} finally {
  if (server && server.exitCode === null) { server.kill('SIGTERM'); await sleep(200); if (server.exitCode === null) server.kill('SIGKILL'); }
  output.completedAt = new Date().toISOString();
  output.passCount = output.cases.filter((row) => row.structurallyValid).length;
  output.failCount = failed;
  const destination = path.join(ROOT, 'evidence', 'model-smoke-latest.json');
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, JSON.stringify(output, null, 2));
  console.log(`\nSmoke result: ${output.passCount}/${output.cases.length} structurally valid; accuracy is NOT evaluated. Evidence: ${destination}`);
  if (failed) process.exitCode = 1;
}

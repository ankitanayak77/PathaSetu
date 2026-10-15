import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../scripts/lib/csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));

test('Iteration 15 documents say plainly that no real model was run, and separate each level of evidence', () => {
  const doc = read('docs/MODEL_PROVIDERS.md');
  assert.match(doc, /None of this has been run against a real model/);
  for (const level of ['Implemented', 'Unit-tested', 'Integration-tested', 'Browser-tested', 'Run against a real Ollama, Gemini or Groq model', 'Run on a physical phone', 'Content reviewed by a qualified teacher']) assert.ok(doc.includes(level), level);
  const status = read('docs/BUILD_STATUS.md');
  assert.match(status, /Iteration 15/);
  assert.match(status, /no real model/i);
});

test('every environment variable the model layer reads is documented in .env.example and in the providers guide', () => {
  const source = ['src/server/modelEnv.js', 'src/server/modelConfig.js'].map(read).join('\n');
  const names = new Set([...source.matchAll(/\b(PATHASETU_(?:MODEL|RETRY)_[A-Z_]+|OLLAMA_(?:URL|MODEL)|GEMINI_(?:API_KEY|MODEL)|GROQ_(?:API_KEY|MODEL))\b/g)].map((m) => m[1]));
  names.add('GEMINI_API_KEY'); names.add('GEMINI_MODEL');
  assert.ok(names.size >= 12, `found ${names.size} variables`);
  const guide = read('docs/MODEL_PROVIDERS.md'); const example = read('.env.example');
  for (const name of names) {
    if (name === 'PATHASETU_MODEL_PROVIDER') continue;
    assert.ok(guide.includes(name), `${name} missing from docs/MODEL_PROVIDERS.md`);
    assert.ok(example.includes(name), `${name} missing from .env.example`);
  }
});

test('the README and quick card point to the providers guide; the content pack is untouched and still unreviewed', () => {
  assert.match(read('README.md'), /docs\/MODEL_PROVIDERS\.md/);
  assert.match(read('docs/DEMO_QUICK_CARD.md'), /MODEL_PROVIDERS\.md/);
  const pack = JSON.parse(read('content/electricity-pack.json'));
  assert.ok(pack.items.length === 8 && pack.items.every((i) => i.status === 'UNREVIEWED_DRAFT' && i.review.reviewer === null));
  assert.equal(exists('generated-drafts'), false, 'no generated draft folder ships in the package');
});

test('decisions D224 to D232 exist and D231 lists what remains fixed', () => {
  const rows = parseCsv(read('docs/DECISION_LOG.csv')).records;
  for (let n = 224; n <= 232; n += 1) assert.ok(rows.some((r) => r.id === `D${n}`), `D${n}`);
  const d231 = rows.find((r) => r.id === 'D231').decision;
  for (const fixed of ['allowed misconceptions', '0.65', 'offline', 'fallback']) assert.ok(d231.includes(fixed), fixed);
});

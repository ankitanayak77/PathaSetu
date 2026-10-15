import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runGeneration } from '../scripts/generate-draft-items.mjs';
import { loadPack } from '../src/core/content.js';

const pack = loadPack();
const base = pack.items[0];
const good = (id) => ({ ...JSON.parse(JSON.stringify(base)), id, status: 'REVIEWED', review: { status: 'REVIEWED', reviewer: 'x', reviewedAt: '2026-10-14T00:00:00.000Z' } });
const ollamaEnv = { PATHASETU_MODEL_PROVIDERS: 'ollama', OLLAMA_MODEL: 'm', PATHASETU_MODEL_PROVIDER: '' };
const fetchWith = (items) => async () => ({ ok: true, status: 200, async json() { return { message: { content: JSON.stringify({ items }) }, done: true }; } });
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'pathasetu-gen-'));

test('writes accepted items as AI-generated unreviewed drafts and reports rejected ones with reasons; never touches content/', async () => {
  const dir = tmp(); const out = path.join(dir, 'drafts.json');
  const before = fs.readFileSync(new URL('../content/electricity-pack.json', import.meta.url), 'utf8');
  const bad = { ...good('GEN02'), correctOptionId: 'Z' };
  const result = await runGeneration({ argv: ['--concept', base.conceptId, '--count', '2', '--out', out], env: ollamaEnv, fetchImpl: fetchWith([good('GEN01'), bad]), now: () => '2026-10-14T05:00:00.000Z' });
  assert.equal(result.accepted, 1); assert.equal(result.rejected, 1);
  const file = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.equal(file.items[0].status, 'UNREVIEWED_DRAFT');
  assert.equal(file.items[0].review.reviewer, null);
  assert.equal(file.items[0].generated.provider, 'ollama');
  assert.equal(file.rejected[0].id, 'GEN02');
  assert.ok(file.rejected[0].errors.length > 0);
  assert.match(file.notice, /not been reviewed/i);
  assert.equal(fs.readFileSync(new URL('../content/electricity-pack.json', import.meta.url), 'utf8'), before);
});

test('refuses to write inside the app, content, source or script folders so a draft can never be loaded by accident', async () => {
  for (const target of ['content/x.json', 'public/x.json', 'src/x.json', 'scripts/x.json']) {
    await assert.rejects(runGeneration({ argv: ['--concept', base.conceptId, '--out', target], env: ollamaEnv, fetchImpl: fetchWith([good('GEN01')]) }), /outside/i, target);
  }
});

test('an unknown concept, a missing provider setup, or zero valid items is a clear failure, not a silent empty file', async () => {
  const out = path.join(tmp(), 'd.json');
  await assert.rejects(runGeneration({ argv: ['--concept', 'nope', '--out', out], env: ollamaEnv, fetchImpl: fetchWith([]) }), /unknown_concept|concept/i);
  await assert.rejects(runGeneration({ argv: ['--concept', base.conceptId, '--out', out], env: {}, fetchImpl: fetchWith([]) }), /PATHASETU_MODEL_PROVIDERS/);
  await assert.rejects(runGeneration({ argv: ['--concept', base.conceptId, '--out', out], env: ollamaEnv, fetchImpl: fetchWith([{ ...good('GEN01'), correctOptionId: 'Z' }]) }), /no valid items/i);
  assert.equal(fs.existsSync(out), false, 'nothing is written when nothing is valid');
});

test('ids that collide with the pack or with each other in one batch are rejected', async () => {
  const out = path.join(tmp(), 'd.json');
  const result = await runGeneration({ argv: ['--concept', base.conceptId, '--count', '3', '--out', out], env: ollamaEnv, fetchImpl: fetchWith([good(pack.items[1].id), good('GEN01'), good('GEN01')]) });
  assert.equal(result.accepted, 1);
  assert.equal(result.rejected, 2);
});

test('--dry-run prints the request without contacting any model', async () => {
  let called = false;
  const result = await runGeneration({ argv: ['--concept', base.conceptId, '--dry-run'], env: ollamaEnv, fetchImpl: async () => { called = true; throw new Error('no'); } });
  assert.equal(called, false);
  assert.match(result.request.system, /UNREVIEWED/);
});

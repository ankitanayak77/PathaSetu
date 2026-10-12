import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const html = read('public/index.html');
const app = read('public/app.js');
const sw = read('public/sw.js');
const css = read('public/styles.css');

test('every static DOM selector in the app maps to an existing HTML ID', () => {
  const staticIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const required = new Set([...app.matchAll(/\$\('([a-z0-9-]+)'\)/g)].map((match) => match[1]));
  const dynamicIds = new Set(['explanation-input', 'answer-form', 'submit-answer']);
  const missing = [...required].filter((id) => !staticIds.has(id) && !dynamicIds.has(id));
  for (const dynamicId of dynamicIds) assert.ok(app.includes(`id="${dynamicId}"`), `dynamic DOM id ${dynamicId} should be emitted by the renderer`);
  assert.deepEqual(missing, []);
});

test('language bridge visibly marks the Odia prompt and options as unreviewed drafts', () => {
  assert.match(app, /ODIA QUESTION · UNREVIEWED DRAFT/);
  assert.match(app, /textOdiaDraft/);
  assert.match(app, /lang="or"/);
  assert.match(html, /Odia wording awaits teacher review/);
  assert.match(css, /\.language-draft-block/);
});

test('service worker never caches API responses and has an offline navigation fallback', () => {
  assert.match(sw, /url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(sw, /caches\.match\('\/index\.html'\)/);
  assert.match(sw, /self\.clients\.claim\(\)/);
});

test('all authored executable assets are local rather than third-party scripts', () => {
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i);
  assert.match(html, /<script type="module" src="\/app\.js"><\/script>/);
  assert.match(html, /<meta name="viewport"/);
  assert.match(css, /@media\(max-width:700px\)/);
});

test('service worker shell cache version is bumped for the revised feedback-first flow', () => {
  assert.match(sw, /pathasetu-shell-v2/);
  assert.match(app, /Review the feedback and remediation below/);
  assert.match(app, /Continue to \$\{next\.id\}/);
});

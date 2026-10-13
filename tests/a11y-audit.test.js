// The accessibility audit must be able to FAIL, otherwise a passing audit proves nothing.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateAudit, MIN_TARGET_PX, MIN_FONT_PX, CONTRAST_NORMAL, AUDIT_EXPRESSION } from '../scripts/lib/a11y-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const good = () => ({
  viewport: { width: 360, height: 780 }, horizontalOverflowPx: 0, interactiveCount: 5, textElements: 20,
  unnamed: [], smallTargets: [], lowContrast: [], smallText: [], odiaWithoutLang: [], htmlLang: 'en', h1Count: 1, headingSkips: false,
  viewportMeta: 'width=device-width, initial-scale=1', zoomBlocked: false, hasMain: true, hasSkipLink: true, liveRegions: 3,
  dialogs: [], imagesWithoutAlt: [], unlabelledSvg: []
});
const goodTab = () => ({ stops: ['a', 'b'], noIndicator: [], unreached: [], leftThePage: true, count: 2 });
const failing = (report, tab = goodTab()) => evaluateAudit(report, { label: 't', tab }).filter((c) => !c.passed).map((c) => c.id);

test('a clean report passes every check', () => {
  assert.deepEqual(failing(good()), []);
});

test('each kind of defect is reported by its own check', () => {
  assert.deepEqual(failing({ ...good(), horizontalOverflowPx: 40 }), ['overflow']);
  assert.deepEqual(failing({ ...good(), unnamed: ['button#x'] }), ['names']);
  assert.deepEqual(failing({ ...good(), smallTargets: ['button 30x30'] }), ['targets']);
  assert.deepEqual(failing({ ...good(), lowContrast: ['span 2.1:1'] }), ['contrast']);
  assert.deepEqual(failing({ ...good(), smallText: ['span 9px'] }), ['fontsize']);
  assert.deepEqual(failing({ ...good(), odiaWithoutLang: ['span'] }), ['lang-odia']);
  assert.deepEqual(failing({ ...good(), htmlLang: '' }), ['lang-page']);
  assert.deepEqual(failing({ ...good(), h1Count: 2 }), ['headings']);
  assert.deepEqual(failing({ ...good(), headingSkips: true }), ['headings']);
  assert.deepEqual(failing({ ...good(), zoomBlocked: true }), ['zoom']);
  assert.deepEqual(failing({ ...good(), hasSkipLink: false }), ['landmarks']);
  assert.deepEqual(failing({ ...good(), dialogs: [{ modal: false, named: true }] }), ['dialogs']);
  assert.deepEqual(failing({ ...good(), imagesWithoutAlt: ['img'] }), ['images']);
  assert.deepEqual(failing(good(), { ...goodTab(), noIndicator: ['button "x"'] }), ['focus']);
  assert.deepEqual(failing(good(), { ...goodTab(), unreached: ['button#y'] }), ['keyboard-reach']);
  assert.deepEqual(failing(good(), { ...goodTab(), leftThePage: false }), ['keyboard-reach']);
});

test('the documented thresholds are the ones the audit uses', () => {
  assert.equal(MIN_TARGET_PX, 44);
  assert.equal(MIN_FONT_PX, 12);
  assert.equal(CONTRAST_NORMAL, 4.5);
  assert.match(AUDIT_EXPRESSION, /const MIN_TARGET = 44, MIN_FONT = 12, CN = 4.5, CL = 3/);
});

test('the stylesheet keeps the accessibility rules the audit depends on', () => {
  const css = fs.readFileSync(path.join(ROOT, 'public/styles.css'), 'utf8');
  assert.match(css, /:focus-visible\{outline:3px solid #1a3a63/);
  assert.match(css, /\.skip-link:focus/);
  assert.match(css, /\.text-button\{min-height:44px/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test('the page declares language, viewport zoom, landmarks and decorative glyphs correctly', () => {
  const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
  assert.match(html, /<html lang="en">/);
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/);
  assert.doesNotMatch(html, /user-scalable\s*=\s*(no|0)|maximum-scale/i);
  assert.match(html, /<main id="main"/);
  assert.match(html, /class="skip-link" href="#main"/);
  assert.match(html, /id="trace-chevron" class="chevron" aria-hidden="true"/);
  assert.match(html, /id="access-overlay"[^>]*role="dialog" aria-modal="true" aria-labelledby="access-title"/);
});

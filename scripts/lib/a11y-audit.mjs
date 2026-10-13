// In-page accessibility and mobile-readiness audit, run through the DevTools protocol (no dependencies).
// It automates what a script can check: names, target size, focus visibility, contrast, font size, language tags, overflow.
// It does NOT replace a screen-reader pass (TalkBack / VoiceOver) or a real-phone test. Those stay NOT TESTED until a person runs them.

export const MIN_TARGET_PX = 44;      // comfortable touch target (WCAG 2.5.5 is 44; 2.5.8 AA minimum is 24)
export const MIN_FONT_PX = 12;        // smaller than this is hard to read on a phone
export const CONTRAST_NORMAL = 4.5;   // WCAG 1.4.3 AA for normal text
export const CONTRAST_LARGE = 3;      // large text: >= 24px, or >= 18.66px bold

// Returns a JSON-serialisable report. Evaluate with Runtime.evaluate (awaitPromise).
export const AUDIT_EXPRESSION = `(async () => {
  const MIN_TARGET = ${MIN_TARGET_PX}, MIN_FONT = ${MIN_FONT_PX}, CN = ${CONTRAST_NORMAL}, CL = ${CONTRAST_LARGE};
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('.hidden,[hidden],[aria-hidden="true"]'); };
  const label = (el) => (el.getAttribute('aria-label') || '').trim() || (el.getAttribute('aria-labelledby') ? el.getAttribute('aria-labelledby').split(/\\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim() : '') || (el.labels && el.labels.length ? [...el.labels].map((l) => l.textContent).join(' ').trim() : '') || (el.getAttribute('title') || '').trim() || (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' ? '' : el.textContent.trim());
  const desc = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
  const toRgb = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(',').map((x) => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
  const bgOf = (el) => { const stack = []; for (let n = el; n; n = n.parentElement) { const c = toRgb(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } } let base = { r: 255, g: 255, b: 255, a: 1 }; for (const c of stack.reverse()) base = over(c, base); return base; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

  const interactive = [...document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=button], [tabindex]:not([tabindex="-1"])')].filter(visible);
  const unnamed = interactive.filter((el) => !label(el)).map(desc);

  const targetOf = (el) => { if ((el.type === 'radio' || el.type === 'checkbox') && el.labels?.length) { const r = el.labels[0].getBoundingClientRect(); return { w: r.width, h: r.height }; } const r = el.getBoundingClientRect(); return { w: r.width, h: r.height }; };
  const smallTargets = interactive.filter((el) => !el.classList.contains('skip-link')).map((el) => ({ el, t: targetOf(el) })).filter(({ t }) => t.w < MIN_TARGET || t.h < MIN_TARGET).map(({ el, t }) => desc(el) + ' ' + Math.round(t.w) + 'x' + Math.round(t.h));

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set(); const lowContrast = []; const smallText = []; let textElements = 0;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement; if (!el || seen.has(el) || !n.textContent.trim() || !visible(el) || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) || el.closest('button:disabled, input:disabled, textarea:disabled, select:disabled')) continue;
    seen.add(el); textElements++;
    const s = getComputedStyle(el); const size = parseFloat(s.fontSize); const bold = parseInt(s.fontWeight, 10) >= 700;
    const fg0 = toRgb(s.color); if (!fg0) continue; const bg = bgOf(el); const op = parseFloat(s.opacity); const fg = over({ ...fg0, a: fg0.a * (Number.isNaN(op) ? 1 : op) }, bg);
    const r = ratio(fg, bg); const large = size >= 24 || (size >= 18.66 && bold);
    const text = n.textContent.trim().slice(0, 28);
    if (r < (large ? CL : CN)) lowContrast.push(desc(el) + ' "' + text + '" ' + r.toFixed(2) + ':1 @' + size + 'px');
    if (size < MIN_FONT) smallText.push(desc(el) + ' "' + text + '" ' + size + 'px');
  }

  const odia = /[\\u0B00-\\u0B7F]/; const odiaWithoutLang = []; const owalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = owalker.nextNode(); n; n = owalker.nextNode()) { const el = n.parentElement; if (el && odia.test(n.textContent) && visible(el) && !el.closest('[lang="or"],[lang^="or-"]')) odiaWithoutLang.push(desc(el)); }

  const headings = [...document.querySelectorAll('h1,h2,h3,h4')].filter(visible).map((h) => Number(h.tagName[1]));
  const headingSkips = headings.some((level, i) => i > 0 && level - headings[i - 1] > 1);
  const meta = document.querySelector('meta[name=viewport]')?.content || '';
  const root = document.documentElement;
  const liveRegions = [...document.querySelectorAll('[role=status],[role=alert],[aria-live]')].length;
  const dialogs = [...document.querySelectorAll('[role=dialog]')].filter(visible).map((d) => ({ modal: d.getAttribute('aria-modal') === 'true', named: Boolean(d.getAttribute('aria-labelledby') || d.getAttribute('aria-label')) }));
  const imagesWithoutAlt = [...document.querySelectorAll('img:not([alt])')].map(desc);
  const unlabelledSvg = [...document.querySelectorAll('svg')].filter((s) => visible(s) || s.closest('[aria-hidden="true"]')).filter((s) => !s.closest('[aria-hidden="true"]') && !s.getAttribute('aria-label') && !s.getAttribute('role')).map(desc);
  return {
    viewport: { width: innerWidth, height: innerHeight },
    horizontalOverflowPx: Math.max(0, root.scrollWidth - innerWidth),
    interactiveCount: interactive.length, textElements,
    unnamed, smallTargets, lowContrast, smallText, odiaWithoutLang,
    htmlLang: root.lang || '', h1Count: headings.filter((h) => h === 1).length, headingSkips,
    viewportMeta: meta, zoomBlocked: /user-scalable\\s*=\\s*(no|0)/i.test(meta) || /maximum-scale\\s*=\\s*(1(\\.0*)?)(?![0-9])/i.test(meta),
    hasMain: Boolean(document.querySelector('main')), hasSkipLink: Boolean(document.querySelector('a.skip-link[href^="#"]')), liveRegions, dialogs, imagesWithoutAlt, unlabelledSvg
  };
})()`;

// Real keyboard traversal: presses Tab through the page, and for each stop compares the element (and its label/parent) with and
// without focus to prove a visible indicator exists. Also lists the focus order and any visible control that Tab never reaches.
export const FOCUS_STOP_EXPRESSION = `(() => {
  const el = document.activeElement; if (!el || el === document.body) return null;
  const chain = [el, el.closest('label'), el.parentElement, el.closest('.option-label')].filter((n, i, a) => n && a.indexOf(n) === i);
  const snap = () => chain.map((n) => { const st = getComputedStyle(n); return { outline: st.outlineStyle !== 'none' ? parseFloat(st.outlineWidth) : 0, shadow: st.boxShadow, border: st.borderTopColor, bg: st.backgroundColor }; });
  const on = snap(); el.blur(); const off = snap(); el.focus({ preventScroll: true });
  const changed = on.some((a, i) => a.outline !== off[i].outline || a.shadow !== off[i].shadow || a.border !== off[i].border || a.bg !== off[i].bg);
  const strong = on.some((a, i) => (a.outline >= 2 && a.outline !== off[i].outline) || (a.shadow !== off[i].shadow && a.shadow !== 'none'));
  el.dataset.a11yVisited = '1';
  const r = el.getBoundingClientRect();
  return { id: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/)[0] : ''), name: (el.getAttribute('aria-label') || el.textContent || el.value || '').trim().slice(0, 30), changed, strong, onScreen: r.bottom > 0 && r.right > 0 };
})()`;
export const UNREACHED_EXPRESSION = `(() => {
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('.hidden,[hidden],[aria-hidden="true"]'); };
  const radioGroups = new Map();
  const out = [];
  for (const el of document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=button]')) {
    if (!visible(el) || el.disabled) continue;
    if (el.type === 'radio') { const key = el.name; const g = radioGroups.get(key) ?? { visited: false, label: el.name }; g.visited ||= el.dataset.a11yVisited === '1'; radioGroups.set(key, g); continue; }
    if (el.dataset.a11yVisited !== '1') out.push(el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''));
  }
  for (const g of radioGroups.values()) if (!g.visited) out.push('radio group ' + g.label);
  return out;
})()`;

export async function tabAudit(page, { max = 60 } = {}) {
  // Reset the sequential-focus starting point to the top of the document (a click earlier in the journey would otherwise move it).
  await page.evaluate(`document.querySelectorAll('[data-a11y-visited]').forEach((n) => delete n.dataset.a11yVisited); const probe = document.createElement('span'); probe.tabIndex = -1; document.body.prepend(probe); probe.focus(); probe.remove(); window.scrollTo(0, 0); 0`);
  const key = (type) => page.cdp.call('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  const stops = []; const noIndicator = []; let firstId = null; let looped = false;
  for (let i = 0; i < max; i++) {
    await key('rawKeyDown'); await key('keyUp');
    const stop = await page.evaluate(FOCUS_STOP_EXPRESSION);
    if (!stop) { looped = true; break; } // focus left the document (to browser chrome)
    const tag = stop.id + ' "' + stop.name + '"';
    if (firstId === tag && stops.length > 1) { looped = true; break; }
    firstId ??= tag; stops.push(stop);
    if (!stop.strong) noIndicator.push(tag);
  }
  const unreached = await page.evaluate(UNREACHED_EXPRESSION);
  return { stops: stops.map((x) => x.id + ' "' + x.name + '"'), noIndicator, unreached, leftThePage: looped, count: stops.length };
}

// Checks that must hold. Everything here is an automated finding, never a claim of full accessibility.
export function evaluateAudit(report, { label = 'page', minTarget = MIN_TARGET_PX, tab = null } = {}) {
  const ok = (id, title, passed, detail = '') => ({ id, title: `${label}: ${title}`, passed, detail });
  const list = (items) => (items.length ? items.slice(0, 6).join(' | ') + (items.length > 6 ? ` (+${items.length - 6} more)` : '') : 'none');
  return [
    ok('overflow', 'no horizontal scrolling', report.horizontalOverflowPx <= 1, `${report.horizontalOverflowPx}px`),
    ok('names', 'every control has an accessible name', report.unnamed.length === 0, list(report.unnamed)),
    ok('targets', `touch targets are at least ${minTarget}px`, report.smallTargets.length === 0, list(report.smallTargets)),
    ...(tab ? [ok('focus', 'every keyboard stop shows a visible focus indicator (>= 2px outline or a shadow ring)', tab.noIndicator.length === 0, list(tab.noIndicator)),
      ok('keyboard-reach', 'Tab reaches every visible control, and focus can leave the page (no trap)', tab.unreached.length === 0 && tab.leftThePage && tab.count > 0, `stops=${tab.count} unreached=${list(tab.unreached)} left=${tab.leftThePage}`)] : []),
    ok('contrast', 'text contrast meets WCAG AA (4.5:1, large text 3:1)', report.lowContrast.length === 0, list(report.lowContrast)),
    ok('fontsize', `no visible text is below ${MIN_FONT_PX}px`, report.smallText.length === 0, list(report.smallText)),
    ok('lang-odia', 'Odia script is tagged lang="or"', report.odiaWithoutLang.length === 0, list(report.odiaWithoutLang)),
    ok('lang-page', 'the page language is declared', Boolean(report.htmlLang), report.htmlLang),
    ok('headings', 'one h1 and no skipped heading levels', report.h1Count === 1 && !report.headingSkips, `h1=${report.h1Count} skips=${report.headingSkips}`),
    ok('zoom', 'pinch zoom is not disabled', !report.zoomBlocked, report.viewportMeta),
    ok('landmarks', 'main landmark, skip link and live regions exist', report.hasMain && report.hasSkipLink && report.liveRegions >= 2, `main=${report.hasMain} skip=${report.hasSkipLink} live=${report.liveRegions}`),
    ok('dialogs', 'visible dialogs are modal and named', report.dialogs.every((d) => d.modal && d.named), JSON.stringify(report.dialogs)),
    ok('images', 'images have alt text and informative svg is labelled', report.imagesWithoutAlt.length === 0 && report.unlabelledSvg.length === 0, list([...report.imagesWithoutAlt, ...report.unlabelledSvg]))
  ];
}

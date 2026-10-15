// Finds a Chromium-family browser that is ALREADY installed. It never installs, downloads or launches anything and makes no network call.
// Order: (1) an explicit CHROME_PATH — used if it exists and is executable, otherwise BLOCKED (never replaced by another browser);
// (2) the standard locations for the current operating system. If nothing is usable the answer is BLOCKED, not an uncaught ENOENT.
// A browser that exists but is refused by a managed-device policy is a different case (POLICY_BLOCKED) and is reported separately.
import fs from 'node:fs';
import path from 'node:path';

const MAC_APPS = [
  ['Google Chrome', 'Google Chrome.app/Contents/MacOS/Google Chrome'],
  ['Chromium', 'Chromium.app/Contents/MacOS/Chromium'],
  ['Microsoft Edge', 'Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
  ['Brave Browser', 'Brave Browser.app/Contents/MacOS/Brave Browser']
];
const LINUX = [
  ['Chromium', '/usr/bin/chromium'], ['Chromium', '/usr/bin/chromium-browser'], ['Chromium (snap)', '/snap/bin/chromium'],
  ['Google Chrome', '/usr/bin/google-chrome'], ['Google Chrome', '/usr/bin/google-chrome-stable'], ['Google Chrome', '/opt/google/chrome/chrome'],
  ['Microsoft Edge', '/usr/bin/microsoft-edge'], ['Microsoft Edge', '/usr/bin/microsoft-edge-stable']
];
const WINDOWS = [
  ['Google Chrome', ['PROGRAMFILES', 'Google\\Chrome\\Application\\chrome.exe'], ['PROGRAMFILES(X86)', 'Google\\Chrome\\Application\\chrome.exe'], ['LOCALAPPDATA', 'Google\\Chrome\\Application\\chrome.exe']],
  ['Microsoft Edge', ['PROGRAMFILES(X86)', 'Microsoft\\Edge\\Application\\msedge.exe'], ['PROGRAMFILES', 'Microsoft\\Edge\\Application\\msedge.exe'], ['LOCALAPPDATA', 'Microsoft\\Edge\\Application\\msedge.exe']]
];

export class BrowserBlockedError extends Error {
  constructor(result) {
    super(`BLOCKED: ${result.detail}`);
    this.name = 'BrowserBlockedError';
    this.code = 'BROWSER_BLOCKED';
    this.browserBlocked = true;
    this.reason = result.reason;
    this.tried = result.tried ?? [];
  }
}

/** True only for an existing regular file the current user may execute. */
export function defaultIsExecutable(candidate) {
  try {
    if (!fs.statSync(candidate).isFile()) return false;
    fs.accessSync(candidate, fs.constants.X_OK);
    return true;
  } catch { return false; }
}

/** The documented places checked when CHROME_PATH is not set, in order. */
export function candidateBrowsers(platform = process.platform, env = process.env) {
  if (platform === 'darwin') {
    const roots = ['/Applications', env.HOME ? path.posix.join(env.HOME, 'Applications') : null].filter(Boolean);
    return roots.flatMap((root) => MAC_APPS.map(([label, rel]) => ({ label, path: path.posix.join(root, rel) })));
  }
  if (platform === 'win32') {
    const roots = { PROGRAMFILES: env.PROGRAMFILES || 'C:\\Program Files', 'PROGRAMFILES(X86)': env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', LOCALAPPDATA: env.LOCALAPPDATA };
    return WINDOWS.flatMap(([label, ...locations]) => locations
      .filter(([variable]) => roots[variable])
      .map(([variable, rel]) => ({ label, path: `${roots[variable].replace(/[\\/]+$/, '')}\\${rel}` })));
  }
  return LINUX.map(([label, p]) => ({ label, path: p }));
}

/**
 * @returns {{status:'FOUND', path:string, source:'CHROME_PATH'|'standard location', label:string}
 *          |{status:'BLOCKED', reason:'invalid_chrome_path'|'no_browser_found', detail:string, tried:string[]}}
 */
export function resolveBrowser({ env = process.env, platform = process.platform, isExecutable = defaultIsExecutable } = {}) {
  const explicit = typeof env.CHROME_PATH === 'string' ? env.CHROME_PATH.trim() : '';
  if (explicit) {
    if (isExecutable(explicit)) return { status: 'FOUND', path: explicit, source: 'CHROME_PATH', label: 'explicit CHROME_PATH' };
    return {
      status: 'BLOCKED', reason: 'invalid_chrome_path', tried: [explicit],
      detail: `CHROME_PATH is set to "${explicit}" but that is not an existing, executable file. No other browser was tried, on purpose. Fix or unset CHROME_PATH.`
    };
  }
  const candidates = candidateBrowsers(platform, env);
  for (const candidate of candidates) {
    if (isExecutable(candidate.path)) return { status: 'FOUND', path: candidate.path, source: 'standard location', label: candidate.label };
  }
  return {
    status: 'BLOCKED', reason: 'no_browser_found', tried: candidates.map((c) => c.path),
    detail: `no permitted browser found in the standard ${platform} locations (${candidates.length} checked). Nothing was installed or downloaded. Set CHROME_PATH to an installed Chrome, Chromium or Edge executable; if none is allowed on this machine the browser checks stay BLOCKED.`
  };
}

/** Resolve or throw BrowserBlockedError (code BROWSER_BLOCKED). */
export function requireBrowser(options) {
  const result = resolveBrowser(options);
  if (result.status !== 'FOUND') throw new BrowserBlockedError(result);
  return result;
}

/** A managed-device policy refusing local pages is BLOCKED by policy, not a product failure. */
export function classifyNavigationError(errorText) {
  return typeof errorText === 'string' && errorText.includes('ERR_BLOCKED_BY_ADMINISTRATOR') ? 'POLICY_BLOCKED' : null;
}

/** What the evidence files record about the browser: path, how it was chosen, version. Never environment values. */
export function browserRecord(result, version = null) {
  if (result.status !== 'FOUND') return { status: 'BLOCKED', executable: null, selectedBy: result.reason, version: null };
  return { status: 'FOUND', executable: result.path, selectedBy: result.source, version: version ?? null };
}

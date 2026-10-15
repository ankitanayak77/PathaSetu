// Local, read-only readiness diagnostics. No live model calls, deployments, browser launches or secret output.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveBrowser } from './browser-path.mjs';

export const MIN_NODE_MAJOR = 20;
export const DOCTOR_REQUIRED_FILES = [
  'package.json',
  'package-lock.json',
  'src/server/server.js',
  'src/core/agent.js',
  'content/electricity-pack.json',
  'public/index.html',
  'public/app.js',
  'public/sw.js',
  'docs/BUILD_STATUS.md',
  'docs/PHASE_COMPLETION_MATRIX.md',
  'docs/PHONE_TEST_PLAN.md',
  'docs/CONTENT_REVIEW_WORKSHEET.csv'
];

function mapCommandResult(result) {
  if (!result || result.status === 'BLOCKED' || result.error || result.code === null) {
    return { status: 'BLOCKED', summary: 'The command could not be completed in this environment.' };
  }
  if (result.status === 'FAIL' || result.code !== 0) {
    return { status: 'FAIL', summary: 'The command reported a failure. Run the named command directly for its detailed diagnostics.' };
  }
  return { status: 'PASS', summary: 'The command exited successfully.' };
}

function defaultRunCommand(name, { root, env, expectOrigin }) {
  const args = ['run', name];
  if (name === 'preflight' && expectOrigin !== null) args.push('--', '--expect-origin', expectOrigin);
  const npmCli = env.npm_execpath;
  let child;
  if (npmCli) {
    child = spawnSync(process.execPath, [npmCli, ...args], { cwd: root, env: { ...env }, encoding: 'utf8', timeout: 45000, windowsHide: true });
  } else {
    child = spawnSync('npm', args, { cwd: root, env: { ...env }, encoding: 'utf8', timeout: 45000, windowsHide: true, shell: process.platform === 'win32' });
  }
  if (child.error || child.signal === 'SIGTERM' || child.status === null) return { status: 'BLOCKED', code: null };
  return { status: child.status === 0 ? 'PASS' : 'FAIL', code: child.status };
}

function aggregateStatus(checks) {
  if (checks.some((c) => c.status === 'FAIL')) return 'FAIL';
  if (checks.some((c) => c.status === 'BLOCKED')) return 'BLOCKED';
  return 'PASS';
}

function abbreviateLocalPath(value, env) {
  let result = String(value);
  const prefixes = [env.HOME, env.USERPROFILE].filter((x) => typeof x === 'string' && x.length > 0)
    .sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (result === prefix) return '~';
    if (result.startsWith(`${prefix}/`) || result.startsWith(`${prefix}\\`)) return `~${result.slice(prefix.length)}`;
  }
  return result;
}

/**
 * Run local checks with injectable runners for tests. This function does not make external network requests itself.
 * @returns {{status:'PASS'|'FAIL'|'BLOCKED',ok:boolean,checks:Array<{id:string,label:string,status:string,summary:string}>}}
 */
export function createDoctorReport({
  root,
  env = process.env,
  platform = process.platform,
  nodeVersion = process.versions.node,
  resolveBrowserFn = resolveBrowser,
  runCommand = defaultRunCommand,
  expectOrigin = null
} = {}) {
  if (!root) throw new TypeError('createDoctorReport requires a project root');
  const checks = [];
  const add = (id, label, status, summary) => checks.push({ id, label, status, summary });

  const nodeMajor = Number(String(nodeVersion).split('.')[0]);
  add('D01', 'Node.js runtime', Number.isFinite(nodeMajor) && nodeMajor >= MIN_NODE_MAJOR ? 'PASS' : 'FAIL',
    Number.isFinite(nodeMajor) && nodeMajor >= MIN_NODE_MAJOR
      ? `Node ${nodeVersion}; this project requires Node >= ${MIN_NODE_MAJOR}.`
      : `Node ${nodeVersion}; install/use Node >= ${MIN_NODE_MAJOR}.`);

  const missing = DOCTOR_REQUIRED_FILES.filter((file) => !fs.existsSync(path.join(root, file)));
  add('D02', 'Required project files', missing.length ? 'FAIL' : 'PASS',
    missing.length ? `Missing required files: ${missing.join(', ')}.` : `All ${DOCTOR_REQUIRED_FILES.length} required project files are present.`);

  for (const [id, label, command] of [
    ['D03', 'JavaScript syntax checks', 'check'],
    ['D04', 'Curriculum pack consistency', 'check:content'],
    ['D05', 'Local demo preflight', 'preflight']
  ]) {
    let result;
    try { result = runCommand(command, { root, env, expectOrigin }); }
    catch { result = { status: 'BLOCKED', code: null }; }
    const mapped = mapCommandResult(result);
    let summary = mapped.summary;
    if (id === 'D04' && mapped.status === 'PASS') summary = 'The pack, worksheet and evaluation files are consistent; this does not mean the content has been reviewed.';
    if (id === 'D05' && mapped.status === 'PASS') summary = 'The local mock-only preflight passed; it does not call a hosted model or validate a phone/tunnel.';
    add(id, label, mapped.status, summary);
  }

  let browser;
  try { browser = resolveBrowserFn({ env, platform }); }
  catch { browser = { status: 'BLOCKED', reason: 'browser_check_error' }; }
  if (browser?.status === 'FOUND') {
    const browserPath = typeof browser.path === 'string' ? abbreviateLocalPath(browser.path, env) : '(path unavailable)';
    add('D06', 'Browser executable discovery', 'PASS',
      `Found an executable at ${browserPath} (${browser.source === 'CHROME_PATH' ? 'explicit CHROME_PATH' : 'standard location'}). Discovery checks file availability only; it does not run capture, E2E or accessibility tests.`);
  } else if (browser?.reason === 'invalid_chrome_path') {
    add('D06', 'Browser executable discovery', 'BLOCKED',
      'CHROME_PATH is set but is invalid/unusable. No alternate browser was tried; correct or unset CHROME_PATH before browser tests.');
  } else {
    add('D06', 'Browser executable discovery', 'BLOCKED',
      'No permitted Chrome/Chromium/Edge executable was found in standard locations. Browser tests remain blocked; nothing was installed or downloaded.');
  }

  const status = aggregateStatus(checks);
  return { status, ok: status === 'PASS', checks };
}

export function formatDoctorReport(report) {
  const lines = ['PATHASETU DOCTOR — local diagnostics only'];
  for (const c of report.checks) lines.push(`${c.status.padEnd(7)} ${c.id} ${c.label}: ${c.summary}`);
  lines.push('', `DOCTOR: ${report.status}`);
  if (report.status === 'PASS') lines.push('Local checks and browser discovery passed; this is not a phone, live-provider, content-review or deployment sign-off.');
  else if (report.status === 'BLOCKED') lines.push('At least one check could not be completed. Fix the listed environment blocker and re-run npm run doctor.');
  else lines.push('At least one required check failed. Fix it and re-run npm run doctor.');
  return lines.join('\n');
}

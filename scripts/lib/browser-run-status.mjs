import { classifyNavigationError } from './browser-path.mjs';

/** Classify environment blocks separately from a failed application assertion. */
export function classifyBrowserFailure(error) {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown browser-run error');
  if (error?.code === 'BROWSER_BLOCKED') {
    return { status: 'BLOCKED', reason: 'browser_unavailable', summary: 'No usable browser executable is available in this environment.' };
  }
  if (error?.browserBlocked || error?.code === 'BROWSER_POLICY_BLOCKED' || classifyNavigationError(message)) {
    return { status: 'BLOCKED', reason: 'browser_policy', summary: 'A managed browser policy blocked navigation. This run cannot establish whether the application journey passes or fails.' };
  }
  return { status: 'FAIL', reason: 'test_failure', summary: message.slice(0, 400) };
}

/** Count executed checks without confusing an environment block for a pass. */
export function summarizeBrowserRun({ checks = [], blocked = null } = {}) {
  const passCount = checks.filter((check) => check.passed === true).length;
  const failCount = checks.filter((check) => check.passed === false).length;
  const checkBlockedCount = checks.filter((check) => check.passed === null).length;
  const blockedCount = checkBlockedCount + (blocked ? 1 : 0);
  const status = failCount > 0 ? 'FAIL' : blockedCount > 0 ? 'BLOCKED' : 'PASS';
  return { status, passCount, failCount, blockedCount };
}

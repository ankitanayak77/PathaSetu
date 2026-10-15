// Bounded retry policy for queued re-checks. Pure and browser-safe: no clock, no timers, no network, no imports.
// Callers pass the time in, so tests can use a fake clock and never sleep.
// Entry fields added by this module (all optional, so states saved by earlier versions stay valid):
//   cycleAttempts   failed automatic attempts since the entry was created or last manually retried
//   nextAttemptAt   ISO time before which no automatic attempt is made (absent = due now)
//   needsAttention  true once automatic retries stopped; the answer and the entry are kept
//   pausedAt        ISO time the entry stopped retrying automatically
//   manualRetries   how many times the learner deliberately retried
export const RETRY_POLICY = Object.freeze({ maxAutomaticAttempts: 5, baseDelayMs: 5000, factor: 2, maxDelayMs: 60000 });

export function normalisePolicy(policy = RETRY_POLICY) {
  const positive = (value, fallback) => (Number.isFinite(value) && value > 0 ? value : fallback);
  return {
    maxAutomaticAttempts: Math.max(1, Math.floor(positive(policy?.maxAutomaticAttempts, RETRY_POLICY.maxAutomaticAttempts))),
    baseDelayMs: positive(policy?.baseDelayMs, RETRY_POLICY.baseDelayMs),
    factor: Math.max(1, positive(policy?.factor, RETRY_POLICY.factor)),
    maxDelayMs: positive(policy?.maxDelayMs, RETRY_POLICY.maxDelayMs)
  };
}

// Delay before the next automatic attempt after the n-th failure of the current cycle: 5 s, 10 s, 20 s, 40 s, 60 s (capped).
export function backoffDelayMs(failedAttempts, policy = RETRY_POLICY) {
  const p = normalisePolicy(policy);
  return Math.min(p.maxDelayMs, p.baseDelayMs * p.factor ** (Math.max(1, failedAttempts) - 1));
}

export function cycleAttemptsOf(entry) {
  if (Number.isInteger(entry?.cycleAttempts) && entry.cycleAttempts >= 0) return entry.cycleAttempts;
  return Number.isInteger(entry?.attempts) && entry.attempts >= 0 ? entry.attempts : 0;
}

// Validate the injected clock before touching any retry state. Production callers pass
// Date#toISOString() values; accepting an invalid string here could otherwise increment
// counters before `toISOString()` throws (or silently save an invalid pause timestamp).
function parseRetryTimestamp(nowIso) {
  if (typeof nowIso !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(nowIso)) {
    throw new RangeError('invalid_retry_timestamp: expected a canonical UTC ISO timestamp');
  }
  const milliseconds = Date.parse(nowIso);
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== nowIso) {
    throw new RangeError('invalid_retry_timestamp: expected a valid canonical UTC ISO timestamp');
  }
  return milliseconds;
}

// Called right after a failed attempt. Mutates the entry; returns what happened.
// The timestamp is validated before the first mutation, so malformed clocks are atomic failures.
export function scheduleAfterFailure(entry, nowIso, policy = RETRY_POLICY) {
  const nowMs = parseRetryTimestamp(nowIso);
  const p = normalisePolicy(policy);
  const wasPaused = entry.needsAttention === true;
  entry.cycleAttempts = cycleAttemptsOf(entry) + 1;
  if (entry.cycleAttempts >= p.maxAutomaticAttempts) {
    entry.needsAttention = true;
    entry.nextAttemptAt = null;
    if (!wasPaused) entry.pausedAt = nowIso;
    return { paused: true, newlyPaused: !wasPaused, nextAttemptAt: null };
  }
  entry.needsAttention = false;
  entry.nextAttemptAt = new Date(nowMs + backoffDelayMs(entry.cycleAttempts, p)).toISOString();
  return { paused: false, newlyPaused: false, nextAttemptAt: entry.nextAttemptAt };
}

export function isDue(entry, nowMs) {
  if (entry?.needsAttention === true) return false;
  if (!entry?.nextAttemptAt) return true;
  const due = Date.parse(entry.nextAttemptAt);
  return Number.isNaN(due) || due <= nowMs;
}

export function dueEntries(state, nowMs) { return (state?.queue ?? []).filter((entry) => isDue(entry, nowMs)); }

// Earliest future automatic attempt among entries that are waiting (not paused); null when none.
export function nextDueAtMs(state, nowMs) {
  let earliest = null;
  for (const entry of state?.queue ?? []) {
    if (entry.needsAttention === true || !entry.nextAttemptAt) continue;
    const due = Date.parse(entry.nextAttemptAt);
    if (!Number.isNaN(due) && due > nowMs && (earliest === null || due < earliest)) earliest = due;
  }
  return earliest;
}

// What the learner should see. `retryable` entries have failed at least once; fresh entries are simply queued.
export function queueStatus(state, nowMs, policy = RETRY_POLICY) {
  const p = normalisePolicy(policy);
  const queue = state?.queue ?? [];
  const paused = queue.filter((entry) => entry.needsAttention === true);
  const waiting = queue.filter((entry) => entry.needsAttention !== true && cycleAttemptsOf(entry) > 0);
  const next = nextDueAtMs(state, nowMs);
  return {
    total: queue.length, paused: paused.length, waiting: waiting.length,
    canRetry: paused.length + waiting.length > 0,
    nextAttemptInMs: next === null ? null : next - nowMs,
    maxAutomaticAttempts: p.maxAutomaticAttempts,
    worstCycleAttempts: queue.reduce((max, entry) => Math.max(max, cycleAttemptsOf(entry)), 0)
  };
}

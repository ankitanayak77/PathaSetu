// Best-effort persistent-storage reporting. Pure and browser-safe: the navigator is passed in so tests can stub it.
// "granted" means the browser said yes to navigator.storage.persist(); it does not guarantee that data is never cleared.
export const PERSISTENCE = Object.freeze({ NOT_REQUESTED: 'not_requested', REQUESTED: 'requested', GRANTED: 'granted', DENIED: 'denied', UNSUPPORTED: 'unsupported', ERROR: 'error' });

export function supportsPersistence(nav = globalThis.navigator) {
  return typeof nav?.storage?.persist === 'function' && typeof nav?.storage?.persisted === 'function';
}

// Does not prompt: reports whether the browser already treats this origin's storage as persistent.
export async function checkPersistence(nav = globalThis.navigator) {
  if (!supportsPersistence(nav)) return { state: PERSISTENCE.UNSUPPORTED };
  try { return { state: (await nav.storage.persisted()) ? PERSISTENCE.GRANTED : PERSISTENCE.NOT_REQUESTED }; }
  catch { return { state: PERSISTENCE.ERROR }; }
}

// Asks at most once per requester instance, even when called concurrently. Never throws.
export function createPersistenceRequester(nav = globalThis.navigator) {
  let outcome = null;
  let pending = null;
  let calls = 0;
  async function ask() {
    if (!supportsPersistence(nav)) return { state: PERSISTENCE.UNSUPPORTED };
    try {
      if (await nav.storage.persisted()) return { state: PERSISTENCE.GRANTED };
      calls += 1;
      return { state: (await nav.storage.persist()) === true ? PERSISTENCE.GRANTED : PERSISTENCE.DENIED };
    } catch { return { state: PERSISTENCE.ERROR }; }
  }
  return {
    get calls() { return calls; },
    get requested() { return outcome !== null || pending !== null; },
    request() {
      if (outcome) return Promise.resolve(outcome);
      pending ??= ask().then((result) => { outcome = result; return result; });
      return pending;
    }
  };
}

export function describePersistence(state) {
  switch (state) {
    case PERSISTENCE.GRANTED: return { tone: 'good', text: 'The browser granted persistent storage. That makes clearing less likely but does not guarantee your progress is kept.' };
    case PERSISTENCE.REQUESTED: return { tone: 'neutral', text: 'Asking the browser to keep this data…' };
    case PERSISTENCE.DENIED: return { tone: 'warning', text: 'Persistent storage was not granted. The browser may clear this data when space is low or after a long time unused.' };
    case PERSISTENCE.UNSUPPORTED: return { tone: 'warning', text: 'This browser cannot request persistent storage. It may clear this data without warning.' };
    case PERSISTENCE.ERROR: return { tone: 'warning', text: 'The persistent-storage request failed. Treat saved progress as clearable.' };
    default: return { tone: 'neutral', text: 'Persistent storage is requested after your first saved answer. It is never guaranteed.' };
  }
}

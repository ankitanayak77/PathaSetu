const DB_NAME = 'pathasetu-local-v1';
const STORE_NAME = 'records';
const RECORD_KEY = 'session';

const BACKUP_KEY = 'session-unreadable-backup';
// Only the error's name is kept as a reason: never its message, which could contain stored data.
const reasonOf = (error) => String(error?.name || 'storage_error').replace(/[^A-Za-z0-9_]/g, '_').slice(0, 60);

export function createMemoryStorage(reason = null) {
  let record = null;
  let backup = null;
  return {
    mode: 'memory',
    get persistent() { return false; },
    get status() { return { mode: 'memory', persistent: false, lastError: reason, lastSavedAt: null }; },
    async load() { return record ? structuredClone(record) : null; },
    async save(value) { record = structuredClone(value); },
    async quarantine(value) { backup = structuredClone(value); },
    async loadQuarantine() { return backup ? structuredClone(backup) : null; },
    async clear() { record = null; }
  };
}

export function createIndexedDbStorage(indexedDBImpl = globalThis.indexedDB) {
  if (!indexedDBImpl) return createMemoryStorage('indexeddb_unavailable');
  let dbPromise;
  let fallbackMode = false;
  let lastError = null;
  let lastSavedAt = null;
  const fallback = createMemoryStorage();
  function openDb() {
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const request = indexedDBImpl.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
      request.onblocked = () => reject(new Error('IndexedDB upgrade blocked'));
    });
    return dbPromise;
  }

  return {
    get mode() { return fallbackMode ? 'memory' : 'indexeddb'; },
    get persistent() { return !fallbackMode; },
    get status() { return { mode: fallbackMode ? 'memory' : 'indexeddb', persistent: !fallbackMode, lastError, lastSavedAt }; },
    async load() {
      if (fallbackMode) return fallback.load();
      try {
        const db = await openDb();
        return await new Promise((resolve, reject) => {
          const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(RECORD_KEY);
          request.onsuccess = () => resolve(request.result ?? null);
          request.onerror = () => reject(request.error ?? new Error('IndexedDB read failed'));
        });
      } catch (error) { fallbackMode = true; lastError = reasonOf(error); return fallback.load(); }
    },
    async save(value) {
      if (fallbackMode) return fallback.save(value);
      try {
        const db = await openDb();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(value, RECORD_KEY);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error ?? new Error('IndexedDB save failed'));
          tx.onabort = () => reject(tx.error ?? new Error('IndexedDB save aborted'));
        });
        lastSavedAt = new Date().toISOString();
      } catch (error) { fallbackMode = true; lastError = reasonOf(error); await fallback.save(value); }
    },
    // Keeps a copy of a record that could not be read, under a separate key, so unreadable data is never silently overwritten.
    async quarantine(value) {
      if (fallbackMode) return fallback.quarantine(value);
      try {
        const db = await openDb();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(value, BACKUP_KEY);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error ?? new Error('IndexedDB backup failed'));
          tx.onabort = () => reject(tx.error ?? new Error('IndexedDB backup aborted'));
        });
      } catch (error) { await fallback.quarantine(value); }
    },
    async clear() {
      if (fallbackMode) return fallback.clear();
      try {
        const db = await openDb();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).delete(RECORD_KEY);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error ?? new Error('IndexedDB clear failed'));
        });
      } catch (error) { fallbackMode = true; lastError = reasonOf(error); await fallback.clear(); }
    }
  };
}

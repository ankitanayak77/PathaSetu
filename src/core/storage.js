const DB_NAME = 'pathasetu-local-v1';
const STORE_NAME = 'records';
const RECORD_KEY = 'session';

export function createMemoryStorage() {
  let record = null;
  return {
    mode: 'memory',
    get persistent() { return false; },
    async load() { return record ? structuredClone(record) : null; },
    async save(value) { record = structuredClone(value); },
    async clear() { record = null; }
  };
}

export function createIndexedDbStorage(indexedDBImpl = globalThis.indexedDB) {
  if (!indexedDBImpl) return createMemoryStorage();
  let dbPromise;
  let fallbackMode = false;
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
    async load() {
      if (fallbackMode) return fallback.load();
      try {
        const db = await openDb();
        return await new Promise((resolve, reject) => {
          const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(RECORD_KEY);
          request.onsuccess = () => resolve(request.result ?? null);
          request.onerror = () => reject(request.error ?? new Error('IndexedDB read failed'));
        });
      } catch (error) { fallbackMode = true; return fallback.load(); }
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
      } catch (error) { fallbackMode = true; await fallback.save(value); }
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
      } catch (error) { fallbackMode = true; await fallback.clear(); }
    }
  };
}

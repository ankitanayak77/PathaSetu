const CACHE_NAME = 'pathasetu-shell-v12';
const SHELL = ['/', '/index.html', '/styles.css', '/app.js', '/manifest.webmanifest', '/favicon.svg', '/core/agent.js', '/core/mockModel.js', '/core/validator.js', '/core/storage.js', '/core/bridge.js', '/core/retry.js', '/core/recovery.js', '/core/export.js', '/core/persistence.js', '/core/labels.js', '/core/profiles.js', '/core/cloudProgress.js', '/core/firebaseClient.js'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('pathasetu-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || request.method !== 'GET') return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', response.clone()));
      return response;
    }).catch(async () => (await caches.match('/index.html')) || (await caches.match('/'))));
    return;
  }
  event.respondWith(networkFirst(request));
});

// Iteration 16: network first for app files, so an online device always runs the current code; the cache answers when offline, or
// when the network has not answered within NETWORK_TIMEOUT_MS and a cached copy exists. Before this, a cache-first shell could keep
// serving old files after an update until the cache name changed.
const NETWORK_TIMEOUT_MS = 3000;
function networkFirst(request) {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (response) => { if (!settled && response) { settled = true; resolve(response); } };
    const timer = setTimeout(() => { caches.match(request).then(settle); }, NETWORK_TIMEOUT_MS);
    fetch(request).then((response) => {
      clearTimeout(timer);
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)); }
      settle(response);
    }).catch(() => {
      clearTimeout(timer);
      caches.match(request).then((cached) => settle(cached || Response.error()));
    });
  });
}

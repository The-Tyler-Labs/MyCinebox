// MyCinebox service worker — v1.7.72
const CACHE_NAME = 'mycinebox-v1.7.72';
const APP_SHELL = [
  '/MyCinebox/',
  '/MyCinebox/index.html',
  '/MyCinebox/manifest.json',
  '/MyCinebox/icon-192.png',
  '/MyCinebox/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(APP_SHELL.map(url => cache.add(url)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // IMPORTANT : ne jamais intercepter les ressources externes (TMDB, Google APIs,
  // Google Identity, images, etc.). Firefox signale sinon des erreurs du service worker.
  if (url.origin !== self.location.origin) return;

  // Fichiers MyCinebox : réseau d'abord, cache en secours.
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(()=>{});
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/MyCinebox/')))
  );
});

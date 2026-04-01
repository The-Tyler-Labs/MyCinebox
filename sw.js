const CACHE_NAME = 'videotheque-202603312321';
const FILES_TO_CACHE = ['/MyCinebox/', '/MyCinebox/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  // Forcer l'activation immédiate sans attendre
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  // Prendre le contrôle immédiatement
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Toujours aller chercher sur le réseau en priorité
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Mettre en cache la nouvelle version
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

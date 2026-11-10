// MyCinebox v1.7.104 — mise à jour « À voir » / tablette.
// La nouvelle interface se charge via le service worker, sans modifier index.html.
const CACHE_NAME = 'mycinebox-v1.7.104';
const BASE = '/MyCinebox/';
const APP_SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  BASE + 'js/ai-connector.js',
  BASE + 'js/watchlist.js',
  BASE + 'js/watchlist.css'
];

function estDocumentMyCinebox(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' || (url.pathname === BASE || url.pathname === BASE + 'index.html');
}

async function ajouterInterfaceAVoir(response) {
  if (!response || !response.ok) return response;
  const raw = await response.text();
  // Ne jamais injecter deux fois si une future version intègre les fichiers directement.
  let html = raw;
  if (!html.includes('js/watchlist.css')) {
    html = html.replace(/<\/head>/i, '<link rel="stylesheet" href="/MyCinebox/js/watchlist.css">\n</head>');
  }
  if (!html.includes('js/watchlist.js')) {
    html = html.replace(/<\/body>/i, '<script src="/MyCinebox/js/watchlist.js"></script>\n</body>');
  }
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache =>
    Promise.allSettled(APP_SHELL.map(url => cache.add(url))))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('mycinebox-') && k !== CACHE_NAME)
      .map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Ne jamais toucher aux API externes : Google, TMDB, images, OpenAI, etc.
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  event.respondWith((async () => {
    const isDoc = estDocumentMyCinebox(request);
    try {
      const response = await fetch(request);
      const result = isDoc ? await ajouterInterfaceAVoir(response) : response;
      if (result && result.ok) {
        const copy = result.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
      }
      return result;
    } catch (_) {
      const cached = await caches.match(request) || await caches.match(BASE);
      if (!cached) return Response.error();
      return isDoc ? await ajouterInterfaceAVoir(cached) : cached;
    }
  })());
});

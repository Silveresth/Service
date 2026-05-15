// ── Service Worker - Mode hors-ligne partiel ──
const CACHE_NAME = 'servicemarket-v2';  // ← version incrémentée pour forcer update
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/offline.html',
  '/favicon.ico',
];

const API_CACHE_NAME = 'servicemarket-api-v2';

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation — supprime tous les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== API_CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ── 1. Ne jamais intercepter les requêtes non-GET ──
  if (event.request.method !== 'GET') return;

  // ── 2. Ne jamais intercepter localhost/dev ──
  if (url.hostname === 'localhost' || url.port === '3000') return;

  // ── 3. Ne jamais intercepter les routes React (navigation HTML) ──
  // Si c'est une navigation (clic sur lien, refresh), on laisse passer
  // → le _redirects de Render renverra index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // ── 4. Requêtes API → Network first, fallback cache ──
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => {
          if (cached) return cached;
          return new Response(
            JSON.stringify({ error: 'Hors ligne' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }))
    );
    return;
  }

  // ── 5. Assets statiques (JS, CSS, images) → Cache first ──
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Mettre en cache seulement les réponses valides
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Fallback offline pour HTML
        if (event.request.headers.get('Accept')?.includes('text/html')) {
          return caches.match('/offline.html');
        }
      });
    })
  );
});
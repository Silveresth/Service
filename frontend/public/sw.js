// ── Service Worker - Mode hors-ligne partiel ──
const CACHE_NAME = 'servicemarket-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/leaflet.css',
  '/leaflet.js',
  '/favicon.ico',
];

const API_CACHE_NAME = 'servicemarket-api-v1';
const API_CACHE_ROUTES = [
  '/api/services/',
  '/api/prestataires/',
  '/api/categories/',
];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== API_CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : stratégie Network First pour API, Cache First pour assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip SW pour localhost/dev (évite proxy conflicts)
  if (url.hostname === 'localhost' || url.port === '3000') {
    return;
  }

  // Requêtes API → Network first, cache, custom offline Response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.headers.get('Accept')?.includes('application/json')) {
            return new Response(JSON.stringify({error: 'Service temporairement indisponible (hors ligne)'}), {
              status: 503,
              statusText: 'Service Unavailable',
              headers: {'Content-Type': 'application/json'}
            });
          }
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Assets statiques → Cache first
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).catch(() => {
          if (event.request.headers.get('Accept')?.includes('text/html')) {
            return caches.match(OFFLINE_URL);
          }
        });
      })
    );
  }
});


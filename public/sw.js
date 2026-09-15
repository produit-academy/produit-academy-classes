// Service Worker for Produit Academy Classes PWA
const CACHE_NAME = 'produit-classes-v1';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses for static assets
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/');
          if (fallback) return fallback;
        }
        return new Response('Offline - resource not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
  );
});

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic pass-through fetch handler required for PWA installability
  event.respondWith(fetch(event.request).catch(() => new Response("Offline")));
});

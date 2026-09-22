const CACHE_NAME = 'power-up-2-runtime-v3'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('power-up-2-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
))

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.includes('/api/')) return
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone()
      void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
      return response
    }).catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html'))))
    return
  }
  // Recordings keep stable URLs, so always check the network first. This
  // prevents an old cached MP3 from surviving after a corrected deployment.
  if (url.pathname.includes('/assets/audio/')) {
    event.respondWith(fetch(request).then((response) => {
      if (response.status === 200) {
        const copy = response.clone()
        void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
      }
      return response
    }).catch(() => caches.match(request)))
    return
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone()
      void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
    }
    return response
  })))
})

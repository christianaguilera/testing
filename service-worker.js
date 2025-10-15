// ✅ Cambia este número en cada actualización
const CACHE_NAME = 'reportes-v5'; 
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 🪣 Instalar y guardar archivos en caché
self.addEventListener('install', event => {
  console.log('[SW] Instalando nueva versión...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting(); // fuerza activación inmediata
});

// ♻️ Activar y eliminar versiones antiguas del caché
self.addEventListener('activate', event => {
  console.log('[SW] Activando nueva versión...');
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antiguo:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // toma control de todas las pestañas abiertas
});

// 🌐 Interceptar peticiones y responder con red o caché
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Actualiza el caché con versiones nuevas
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => caches.match(event.request)) // si no hay red, usa caché
  );
});

// 🧠 Forzar actualización cuando haya nueva versión
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/*
  Service Worker for Control de Gastos PWA
  Version: 1.1.1 (Actualiza esta versión para forzar la recarga de caché)
*/

const CACHE_NAME = 'gastos-pwa-v1.1.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './pwa_icon_512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Evento de Instalación: Pre-cacheo de recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-cacheando App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Evento de Activación: Limpieza de versiones antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Borrando caché antigua', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento de recuperación (Fetch): Cache First o Network Fallback
self.addEventListener('fetch', (event) => {
  // No cachear peticiones de API externas (IA, GitHub) ni de escaneo en tiempo real
  if (event.request.url.includes('generativelanguage.googleapis.com') || 
      event.request.url.includes('api.github.com') ||
      event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devolver de caché si existe, sino ir a la red
      return response || fetch(event.request).then((networkResponse) => {
        // Opcional: Podríamos cachear dinámicamente aquí
        return networkResponse;
      });
    }).catch(() => {
      // Si falla la red y no está en caché, devolver index.html para rutas SPA
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});

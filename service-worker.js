const CACHE_NAME = 'nestorvit-cache-v2'; // <-- Cambia este nombre cada vez que actualices tus archivos
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png', // <-- Recurso local
  './icons/icon-512.png', // <-- Recurso local
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Evento 'install': se dispara cuando el SW se instala.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'activate': se dispara cuando el SW se activa.
// Ideal para limpiar cachés antiguos.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});


// Evento 'fetch': intercepta las peticiones de red.
// Estrategia: Cache-First. Busca en caché, si no lo encuentra, va a la red.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en el caché, la devuelve.
        if (response) {
          return response;
        }
        // Si no, hace la petición a la red.
        return fetch(event.request);
      })
  );
});
// Define un nombre único para la caché
const CACHE_NAME = 'nestorvit-v1';

// Lista de archivos para cachear durante la instalación
const urlsToCache = [
  '/',
  'index.html'
  // Puedes agregar aquí otros recursos como CSS, imágenes, etc. si los tuvieras
];

// Evento de instalación: se dispara cuando el service worker se instala por primera vez
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de activación: se dispara cuando el service worker se activa
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Evento fetch: intercepta todas las solicitudes de red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en la caché, la devuelve
        if (response) {
          return response;
        }
        // Si no, intenta obtenerla de la red
        return fetch(event.request);
      })
  );
});
// Define un nombre para la caché actual. Cambiar este nombre forzará la actualización del service worker.
const CACHE_NAME = 'nestorvit-v1';

// Lista de archivos y recursos que se guardarán en la caché para el funcionamiento offline.
const urlsToCache = [
  '/', // La página principal (index.html)
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://iili.io/K2SlXDv.png', // Logo de bienvenida
  'https://iili.io/K2inqGt.png'  // Imagen de fototipos
];

// Evento 'install': Se dispara cuando el service worker se instala por primera vez.
self.addEventListener('install', event => {
  // Espera hasta que la promesa dentro de waitUntil se resuelva.
  event.waitUntil(
    // Abre la caché con el nombre que definimos.
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caché abierta');
        // Agrega todos los archivos de nuestra lista a la caché.
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'activate': Se dispara cuando el service worker se activa.
// Es un buen momento para limpiar cachés antiguas.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si una caché no está en nuestra lista blanca, la eliminamos.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento 'fetch': Se dispara cada vez que la aplicación solicita un recurso (una página, una imagen, etc.).
self.addEventListener('fetch', event => {
  event.respondWith(
    // Primero, busca el recurso en la caché.
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en la caché, lo devuelve desde ahí.
        if (response) {
          return response;
        }

        // Si no está en la caché, lo busca en la red.
        return fetch(event.request).then(
          response => {
            // Si la respuesta de la red no es válida, simplemente la devuelve.
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona la respuesta. Es necesario porque la respuesta es un "stream"
            // y solo se puede consumir una vez. Necesitamos una para la caché y otra para el navegador.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Guarda la respuesta clonada en la caché para futuras solicitudes.
                cache.put(event.request, responseToCache);
              });

            // Devuelve la respuesta original de la red al navegador.
            return response;
          }
        );
      })
  );
});

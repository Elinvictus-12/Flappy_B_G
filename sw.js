const CACHE_NAME = "mi-juego-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "index.html",
  "manifest.json",
  "sw.js",
  "inicio.js",
  "juego.js",
  "gameover.js",
  "main.js",
  "Fondo.png",
  "F1.png",
  "F2.png",
  "F3.png",
  "Pipe.png",
  "Light_it_Up.mp3",
  "Icono.png",
  "Icono2.png",
  "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll(FILES_TO_CACHE);
    } catch (e) {
      await Promise.all(FILES_TO_CACHE.map(async (file) => {
        try {
          const response = await fetch(file);
          if (response && response.ok) {
            await cache.put(file, response.clone());
          }
        } catch (err) {
          // ignorar errores individuales
        }
      }));
    }
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const isNavigationRequest = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');

  if (isNavigationRequest) {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match("/index.html");
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === "opaque") {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        return caches.match("/");
      });
    })
  );
});

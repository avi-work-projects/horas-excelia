/* ============================================================
   SERVICE WORKER — Horas Excelia
   Habilita instalación como WebAPK en Android (Chrome)
   → Cambiar CACHE_VER en cada deploy para forzar actualización
   ============================================================ */

var CACHE_VER = 'v50';
var CACHE_NAME = 'horas-excelia-' + CACHE_VER;

var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './css/styles.css',
  './js/core.js',
  './js/summary.js',
  './js/economics.js',
  './js/birthdays.js',
  './js/events.js',
  './js/alarms.js',
  './js/init.js',
  './VIP.png'
];

/* ── Instalar: cachear todos los assets ── */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // cache:'no-cache' evita que el navegador sirva archivos viejos
      // de su caché HTTP durante la instalación del SW
      return cache.addAll(ASSETS.map(function(url) {
        return new Request(url, {cache: 'no-cache'});
      }));
    })
  );
  self.skipWaiting();
});

/* ── Activar: limpiar caches antiguas, reclamar clientes y notificar ── */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      // Reclamar clientes DESPUÉS de limpiar caches antiguas
      return self.clients.claim();
    }).then(function() {
      // Avisar a todas las pestañas de que hay nueva versión
      return self.clients.matchAll({type:'window',includeUncontrolled:true})
        .then(function(clients) {
          clients.forEach(function(c) {
            c.postMessage({type:'SW_UPDATED',version:CACHE_VER});
          });
        });
    })
  );
});

/* ── Fetch: network-first para HTML, cache-first para assets ── */
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Solo interceptar peticiones al mismo origin
  if (url.origin !== self.location.origin) return;

  // HTML → Network-first (para recibir secrets inyectados por CI)
  if (e.request.destination === 'document' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
          return response;
        })
        .catch(function() {
          return caches.match(e.request);
        })
    );
    return;
  }

  // Assets (CSS, JS, SVG) → Cache-first con fallback a network
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        }
        return response;
      });
    })
  );
});

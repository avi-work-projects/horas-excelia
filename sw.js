/* ============================================================
   SERVICE WORKER — Horas Excelia
   Habilita instalación como WebAPK en Android (Chrome)
   → Cambiar CACHE_VER en cada deploy para forzar actualización
   ============================================================ */

var CACHE_VER = 'v284';
var CACHE_NAME = 'horas-excelia-' + CACHE_VER;

var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './css/styles.css',
  './js/core.js',
  './js/summary.js',
  './js/economics-helpers.js',
  './js/economics.js',
  './js/economics-analisis.js',
  './js/economics-estudio.js',
  './js/economics-comp.js',
  './js/economics-sim.js',
  './js/economics-gastos.js',
  './js/economics-fiscal-datos.js',
  './js/economics-fiscal.js',
  './js/economics-fiscal-hip.js',
  './js/economics-fiscal-gas.js',
  './js/economics-fiscal-bind.js',
  './js/economics-fiscal-elect.js',
  './js/birthdays.js',
  './js/events-picker-color.js',
  './js/events-picker-date.js',
  './js/rutinas.js',
  './js/bodas.js',
  './js/events.js',
  './js/events-cal.js',
  './js/events-render.js',
  './js/events-form.js',
  './js/events-detail.js',
  './js/events-bind.js',
  './js/alarms.js',
  './js/init.js',
  './js/logo-popup.js',
  './js/import-export.js',
  './js/home-popup.js',
  './js/lib/jspdf.umd.min.js',
  './js/lib/jspdf.plugin.autotable.min.js',
  './VIP.png',
  './icon-home.png',
  './icon-econ.png',
  './icon-alarm.png',
  './icon-bday.png',
  './icon-events.png',
  './icon-estudio.png'
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

/* ── Fetch: cache-first dentro de la generacion, y punto ──────────────
   Sin revalidacion en segundo plano a proposito. Revalidar fichero a fichero
   mete ficheros nuevos en la generacion vieja y reaparece el problema que
   esto venia a resolver: index.html nuevo con init.js viejo, que si entre
   versiones ha desaparecido un elemento revienta al engancharle un listener.

   La generacion solo avanza instalando otro service worker. Eso pasa cuando
   cambia CACHE_VER — por eso hay que tocarlo en CADA push. */
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request, {cacheName: CACHE_NAME}).then(function(cached) {
      if (cached) return cached;
      /* Lo que no forma parte de la generacion (un fichero nuevo que aun no
         esta en ASSETS, una imagen suelta) va a la red sin tocar la cache. */
      return fetch(e.request);
    })
  );
});

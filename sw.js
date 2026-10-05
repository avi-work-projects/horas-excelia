/* ============================================================
   SERVICE WORKER — Horas Excelia
   Habilita instalación como WebAPK en Android (Chrome)
   → Cambiar CACHE_VER en cada deploy para forzar actualización
   ============================================================ */

var CACHE_VER = 'v404';
var CACHE_NAME = 'horas-excelia-' + CACHE_VER;

/* Generado desde app-assets.json: npm run assets */
var ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./css/tasks.css",
  "./css/household.css",
  "./css/electricity-comparator.css",
  "./css/finance-views.css",
  "./css/personal-periods.css",
  "./js/lib/jspdf.umd.min.js",
  "./js/lib/jspdf.plugin.autotable.min.js",
  "./js/data-integrity.js",
  "./js/energy-data.js",
  "./js/nav-icons.js",
  "./js/core.js",
  "./js/tasks.js",
  "./js/tasks-view.js",
  "./js/tasks-float.js",
  "./js/csv-sync.js",
  "./js/summary.js",
  "./js/economics-helpers.js",
  "./js/economics.js",
  "./js/economics-analisis.js",
  "./js/economics-estudio.js",
  "./js/economics-comp.js",
  "./js/economics-sim.js",
  "./js/economics-gastos.js",
  "./js/economics-fiscal-datos.js",
  "./js/personal-periods.js",
  "./js/personal-periods-editor.js",
  "./js/personal-cards.js",
  "./js/economics-fiscal.js",
  "./js/economics-fiscal-elect.js",
  "./js/economics-fiscal-hip.js",
  "./js/economics-fiscal-gas.js",
  "./js/energy-history.js",
  "./js/energy-bills.js",
  "./js/energy-analysis.js",
  "./js/energy-reference.js",
  "./js/energy-costs.js",
  "./js/energy-reconciliation.js",
  "./js/energy-study.js",
  "./js/energy-import-preview.js",
  "./js/energy-analysis-view.js",
  "./js/energy-analysis-bind.js",
  "./js/energy-tariff-editor.js",
  "./js/energy-bills-view.js",
  "./js/electricity-comparator.js",
  "./js/electricity-comparator-inputs.js",
  "./js/economics-fiscal-bind.js",
  "./js/household.js",
  "./js/household-summary.js",
  "./js/birthdays.js",
  "./js/birthdays-render.js",
  "./js/birthdays-panels.js",
  "./js/birthdays-bind.js",
  "./js/events-appearance.js",
  "./js/events-picker-color.js",
  "./js/events-picker-date.js",
  "./js/rutinas-icons.js",
  "./js/rutinas.js",
  "./js/rutinas-form.js",
  "./js/rutinas-flex.js",
  "./js/rutinas-sessions.js",
  "./js/rutinas-addition.js",
  "./js/rutinas-recovery.js",
  "./js/rutinas-history.js",
  "./js/rutinas-bulk.js",
  "./js/bodas.js",
  "./js/bodas-assign.js",
  "./js/bodas-class-form.js",
  "./js/bodas-bind.js",
  "./js/bodas-config.js",
  "./js/events.js",
  "./js/events-calendar-export.js",
  "./js/events-cal.js",
  "./js/events-render.js",
  "./js/events-form.js",
  "./js/events-form-controls.js",
  "./js/events-form-save.js",
  "./js/events-detail.js",
  "./js/events-bind.js",
  "./js/alarms.js",
  "./js/settings-menu.js",
  "./js/alarm-panel.js",
  "./js/init.js",
  "./js/logo-popup.js",
  "./js/import-preview.js",
  "./js/import-export.js",
  "./js/home-popup.js",
  "./manifest.json",
  "./logo.png",
  "./css/asturias-cross.svg",
  "./css/wedding-moves.png",
  "./VIP.png",
  "./icon-home.png",
  "./icon-econ.png",
  "./icon-household.png",
  "./icon-alarm.png",
  "./icon-bday.png",
  "./icon-events.png",
  "./icon-estudio.png"
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
      var own=keys.filter(function(k){return k.indexOf('horas-excelia-')===0&&k!==CACHE_NAME;});
      var previous=own[own.length-1]; /* una generacion para migrar defaults personales */
      return Promise.all(
        own.filter(function(k) { return k !== previous; })
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

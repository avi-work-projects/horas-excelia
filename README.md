# Gestify — Horas Excelia

PWA personal de horas, eventos, cumpleaños, ensayos de bodas y rutinas.

## Uso y datos
Los datos se guardan en el navegador del dispositivo. Exportar todo genera un backup JSON;
Importar permite fusionar o reemplazar. Conserva una copia fuera del navegador.
Los datos personales y el webhook de MacroDroid no se publican con la aplicacion.
Configura el correo de horas y MacroDroid en Ajustes. En instalaciones anteriores se intenta
recuperar el correo y cumpleaños de la cache local antigua; si no existe, importa tu backup.

## Desarrollo
Node 24: `npm ci`, `npm run assets`, `npm test`, `npm run build`.
`npm run test:browser` ejecuta las interacciones en CI con Chromium.
La revisión visual local se hace en Microsoft Edge mediante la extensión.
GitHub Actions publica dist en Pages solo cuando pasan todas las comprobaciones.
Consulta [CLAUDE.md](CLAUDE.md) para las reglas vigentes,
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) para arquitectura y componentes,
y [CODEMAP.md](CODEMAP.md) para localizar funciones y estilos.
`app-assets.json` es el catálogo de carga, pruebas y archivos sin conexión.
`css/styles.css` se genera desde `css/source/`; ejecuta `npm run assets` tras editarlas.
No subir backups personales, .local-preview ni configuracion del dispositivo.

## Versiones
Incrementar APP_VERSION y CACHE_VER antes de publicar. La PWA ofrece Actualizar en el menu
y en el toast. Se conserva una generacion anterior de cache para la migracion local.

## Último ensayo (v361)
`bodaEsUltimoEnsayo(ev)` consulta todos los eventos de la pareja: marca las clases
que coinciden con su última fecha programada, aunque haya filtros activos. Añadir,
reprogramar o borrar una clase recalcula la marca sin guardar estado duplicado.
`bodaUltimoEnsayoHtml` comparte el distintivo entre Próximos, Agenda y recordatorios.
El calendario mensual añade `boda-last-marker`, con un pulso cada 4 segundos;
con movimiento reducido se sustituye por un contorno fijo. Anual/4 meses no cambian.

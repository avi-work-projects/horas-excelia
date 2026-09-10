# Gestify — Horas Excelia

PWA personal de horas, eventos, cumpleaños, ensayos de bodas y rutinas.

## Uso y datos
Los datos se guardan en el navegador del dispositivo. Exportar todo genera un backup JSON;
Importar permite fusionar o reemplazar. Conserva una copia fuera del navegador.
Los datos personales y el webhook de MacroDroid no se publican con la aplicacion.
Configura el correo de horas y MacroDroid en Ajustes. En instalaciones anteriores se intenta
recuperar el correo y cumpleaños de la cache local antigua; si no existe, importa tu backup.

## Desarrollo
Node 24: `npm ci`, `npm test`, `npm run build`, `npm run test:browser`.
En Windows las pruebas usan Microsoft Edge aislado; CI instala Chromium para las pruebas.
GitHub Actions publica dist en Pages solo cuando pasan todas las comprobaciones.
Consulta CLAUDE.md para arquitectura y CODEMAP.md para localizar funciones.
No subir backups personales, .local-preview ni configuracion del dispositivo.

## Versiones
Incrementar APP_VERSION y CACHE_VER antes de publicar. La PWA ofrece Actualizar en el menu
y en el toast. Se conserva una generacion anterior de cache para la migracion local.

# Gestify: guia de trabajo

## Antes de tocar codigo
1. Buscar el simbolo en CODEMAP.md (indice generado), abrir solo el bloque necesario.
2. Reutilizar los componentes existentes; renders puros, listeners separados.
3. Tras nuevas funciones o mover archivos: `node tools/codemap.js`.
4. Antes de publicar: `npm test`, `npm run build`, `npm run test:browser`.
5. Incrementar APP_VERSION (core.js) y CACHE_VER (sw.js) en cada publicacion.

## Arquitectura actual
PWA estatica, sin backend. Datos personales locales; el despliegue no inyecta secretos.
ES5 en el codigo existente; se permiten las APIs modernas compatibles con Edge/Chromium usadas por la PWA.
No hace falta cambiar de framework. Los renders devuelven HTML y no persisten cambios.

| Modulo | Responsabilidad |
|---|---|
| data-integrity.js | appStorage, transaccion, validacion, referencias y migracion local |
| core.js | estado general, tema, componentes, horas y correo |
| events.js | ocurrencias, firmas, limites y geometria de barras |
| events-cal.js | calendarios 1 mes, 4 meses y anual |
| events-render.js / events-form.js / events-detail.js / events-bind.js | vistas, formulario, ficha y acciones |
| birthdays.js | datos y alarmas por fecha |
| birthdays-render.js / birthdays-panels.js / birthdays-bind.js | vistas, paneles y acciones |
| bodas.js | datos de parejas/clases y vistas principales |
| bodas-config.js | catalogos de packs, duraciones, salas y estadisticas de extras |
| bodas-assign.js | asignacion de fechas, incidencias y estadisticas |
| bodas-class-form.js | formulario y selectores de una clase |
| bodas-bind.js | pareja, acciones de vistas y contexto de render |
| rutinas.js | recurrencias, excepciones y sesiones virtuales |
| economics-* | calculos, datos, vistas y acciones economicas |
| import-export.js | backups, fusion y exportaciones |
| home-popup.js / init.js | avisos y arranque |

## Componentes compartidos
- Ventanas: navegacion (renderNavBar), pestañas, cabecera, `.sy-body` como unico scroll.
- Subpestañas: `.econ-sub-tabs` primer hijo de `.sy-body`.
- Titulos centrados: `.sy-header-center`.
- Paneles: `abrirPanel` / `cerrarPanel`; no duplicar temporizadores ni overlays.
- Checkbox global `<input type="checkbox">`; color por `--chk`.
- Filtros: `.ev-sort-chip` general, `.boda-chip` en Bodas.
- Acciones: `.ev-io-btn` / `.bday-io-btn`, variantes `io-primaria` y `io-peligro`.
- Avisos: `showToast(msg,tipo,undoFn)`; errores de guardado nunca deben parecer exito.
- Gestos: `addSwipe` protege paneles anidados; `addLongPress` para acciones destructivas.
- Color: `_renderColorPicker` / `_bindColorPicker`; `getEvDisplayColor` es la fuente de color de eventos.
- Fecha multiple: `openOtrosDatePicker`; semana de rutina reutiliza `renderEvCalMonth` en consulta.
- Todos los nombres de meses: MN / MN_SHORT en core.js.

## Persistencia y backups
Usar `appStorage`, no nuevas llamadas directas a localStorage. Es una envoltura compatible
que permite preparar y revertir importaciones y hacer visibles fallos de almacenamiento.
Cada clave nueva debe figurar en el censo de tools/test.js y exportacion/importacion.
Validar antes de escribir. Una firma de duplicado incluye categoria, fecha, hora y pareja;
conservar identificadores canonicos y remapear referencias al fusionar.
No poner backups personales ni datos de pruebas reales en Git. `.local-preview` es local.

## Calendarios
- Puntuales: Rec. Gestiones primero; ensayos ordenados por hora.
- Maximos diarios: 5 puntuales, 3 rutinas, 3 VIP, 2 grandes de cada grosor.
- Los datos antiguos importados no se borran por superar un limite visual.
- Grandes: gruesa, mediana cerca de su base, fina separada abajo.
- Coincidencia de gruesas/medianas: solo se estrecha el tramo compartido.
- Relevo de un dia: media casilla cada una (incluye Otros del mismo grosor).
- Finas: se apilan con altura original solo en el tramo coincidente.
- Redondeo solo en inicio/final reales; cortes de semana/mes rectos.
- Contorno del color de fondo separa capas; colores apagados opacos fuera del mes.
- `withEventDateIndex` tiene vida de un render: se restaura siempre con finally.

## Bodas y cumpleaños
Parejas abre Activas, boda ascendente; sin fecha al final. Fecha y asignacion son filtros
independientes. Clases Cerradas significa que las clases contratadas estan asignadas.
Proximos cumpleaños comparte render y bind en Eventos: Pasados, Hoy, Mañana, dias 2-7 y 8-14.
Solo VIP filtra ambas vistas; Lista ofrece Hoy y filtros VIP alternables.
La alarma guarda una fecha de ocurrencia, no un booleano permanente. Booleanos antiguos
no se consideran alarma vigente porque no permiten saber a que año correspondian.

## Alarmas y privacidad
Solo MacroDroid. URL local en Ajustes, exportable. Correo y MacroDroid se editan solo tras desbloquear el botón; Guardar confirma ambos de forma conjunta. La macro del movil usa Java. Scripts y limitaciones del dispositivo: [docs/macrodroid.md](docs/macrodroid.md).
El PWA envia una solicitud: `no-cors` no demuestra que el reloj haya creado la alarma.
Sin dia semanal cuando el aviso queda entre 5 min y 24 h; fuera de esa ventana requiere dia.
Correo y cumpleaños no se incluyen en el HTML publicado. Se intenta rescatar configuracion
antigua desde la cache local anterior, sin sobreescribir datos locales existentes.
Una instalacion limpia requiere importar el backup/configurar el correo en Ajustes.

## Comprobaciones
- `npm test`: snapshots, reglas e integridad/importacion/rollback.
- `npm run build`: crea dist con solo archivos de la app.
- `npm run test:browser`: Edge aislado en Windows, Chromium en CI; 400x880.
- CI exige estas pruebas antes de publicar. Backups reales nunca son fixtures.
- Capturas y pruebas visuales complementan HTML: este no comprueba CSS ni tactilidad.

## Ideas
FUTURO.md es el lugar para propuestas futuras. No mezclar ideas pendientes con reglas vigentes.

## Catalogos de Bodas (v299)
`BODA_CONFIG` / `excelia-bodas-config-v1` viaja en `bodaConfig` del backup.
Packs, duraciones y salas tienen identificadores estables y estado `active`.
Desactivar impide nuevas asignaciones; las existentes siguen siendo editables.
No borrar una opcion con referencias; tampoco la duracion por defecto.
`couple.packId` vincula el pack y `packClasses` conserva las clases incluidas al contratar.
`event.boda.durationId` vincula el catalogo; `duration` conserva los minutos de esa clase.
Los eventos antiguos sin duracion valen 60 min, nunca la nueva duracion predeterminada.
El formulario compartido de clase edita la duracion. `bodaDuration` y `bodaEndAt` son
la fuente del horario final; no sumar una hora en cada pantalla.
Las extras cuentan clases finalizadas con pareja por encima de `packClasses`.
Packs historicos sin id se reconocen por `contracted`, conservando cantidades distintas
como opciones propias; no inferir un pack menor por el numero de clases que haya.
Lugares: reutilizar `BODA_PLACE_LIST`, `bodaPlaceLabel` y descripciones; no hardcodear etiquetas.
Todo boton con lapiz lleva `.action-edit` (naranja), conservando sus dimensiones.

## Ajustes de Bodas (v300)
Los packs iniciales se llaman Esencia (2), Latido (4) y Eternidad (6). El selector de pareja muestra nombre y número de clases: Esencia (2 clases), Latido (4 clases) y Eternidad (6 clases). Al cargar se migran los nombres automáticos antiguos sin cambiar IDs, cantidades ni nombres personalizados. La duración queda al final de la ficha del ensayo; las altas toman la duración predeterminada y las clases existentes conservan la guardada. Las cuatro subpestañas y la rueda de Bodas ocupan cinco columnas iguales. El lápiz de Home conserva su estilo propio; los demás usan action-edit naranja.

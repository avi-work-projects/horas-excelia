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
| rutinas-flex.js | cupos semanales/mensuales, planificación por fecha y avisos de sesiones pendientes |
| economics-* | calculos, datos, vistas y acciones economicas |
| energy-analysis.js / energy-costs.js | lecturas por mes, tarifas ponderadas, vigencias, IVA y coste estimado |
| energy-study.js / energy-analysis-view.js / energy-analysis-bind.js | indicadores, cinco pestañas del estudio y acciones de consulta/importación |
| import-export.js | backups, fusion y exportaciones |
| home-popup.js / init.js | avisos y arranque |

## Componentes compartidos
### Rutinas flexibles (v368)
Al crear una rutina se elige horario fijo o sesiones flexibles. La modalidad de
una rutina existente no se transforma, para preservar su historial. `r.flex`
guarda `{period:'month'|'week',target,weeklyTarget,sessions:{fecha:{time,dur}}}`.
Una sesión por fecha y rutina; cada sesión conserva su duración al cambiar
la predeterminada. Las cancelaciones siguen en `r.skips` y liberan cupo.
`rutOccursOn` y `rutDurationOn` son las únicas puertas de entrada: calendarios,
Próximos, estadísticas y exportación ICS reutilizan las sesiones virtuales.
`rutFlexStatus` limita el aviso semanal al cupo restante del período; no genera
sesiones automáticamente ni arrastra las pendientes al siguiente mes/semana.
`RUT_PLAN` solo guarda la selección visual. Los datos viajan en `rutinas` del
backup existente, con validación de fechas, horas, duración y cupos al importar.
Los límites diarios incluyen también fechas explícitas lejanas.

- Selector horario de clases: `#bodaTpOv` tiene layout oculto antes de abrir; las ruedas se posicionan síncronamente. No retrasar el scroll inicial con temporizadores: provoca un destello al abrir una clase sin hora.
- Ventanas: navegacion (renderNavBar), pestañas, cabecera, `.sy-body` como unico scroll.
- Subpestañas: `.econ-sub-tabs` primer hijo de `.sy-body`.

## Estudio energético (v366)

Un acceso «Consumo y tarifas» abre una ventana propia: Resumen, Consumo, Coste,
Tarifas y Escenarios. Sus pestañas y el selector de año quedan fuera del único
scroll (`.sy-body`); los gráficos admiten swipe para cambiar de año.
Los contratos, lecturas e impuestos históricos solo cambian al importar.
Los controles de IVA y tarifa comparada son escenarios temporales, sin alterar el histórico.

`energyBills` admite `vatAmount`, `electricityTaxAmount`, `otherTaxesAmount`
y `readings:[{start,end,consumption,periods:[punta,llano,valle]}]` opcionales.
Las fechas de `readings` son **inclusivas**. Un array vacío conserva el documento
financiero sin añadir consumo (abono o lectura sustituida por una rectificación).
Si no existe el campo se conserva el cálculo compatible con backups anteriores.
`consumptionPeriods` permite el desglose de una factura antigua sin `readings`.
Estos campos viajan dentro de `energyBills` en el backup, sin nuevas claves.

El importador no deduce qué lectura rectifica a otra: el archivo preparado debe
resolverlo explícitamente. Un solapamiento no resuelto bloquea el cálculo del mes.
La cobertura incompleta se indica y nunca se extrapola a los días sin lectura.
El coste usa consumo medio diario mensual y reparte los días según el contrato.
Si todos los días tienen tramos, sus proporciones sustituyen los pesos genéricos
de la tarifa. Las cuotas fijas conservan el prorrateo por días reales del mes.
`energyCostMonths` devuelve grupos por contrato y bandas de IVA para las gráficas.

Los impuestos documentados y el total real se agrupan por **emisión**; el estimado,
por **consumo**. La diferencia incluye desplazamientos entre años, huecos,
regularizaciones y servicios; no se interpreta como error puro del modelo.
El IVA histórico refleja las fechas importadas, no una tabla legal incorporada.
Los documentos privados y archivos de importación nunca van en el repositorio.

El ciclo de filtros anual/4 meses mantiene una X cuadrada a la derecha:
rojo = ocultar, verde = mostrar, amarillo = recuperar selección anterior.
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

## Navegación y marca de Bodas (v302)
BODA_SUBTAB incluye config: renderBodaConfig es puro y bindBodaConfig engancha sus controles dentro de la vista, sin overlay propio. El swipe general usa el mismo botón de subpestaña que el click (conserva el guardado de pendientes); el swipe anidado del calendario sigue navegando meses. Solo los botones de lápiz sin texto deben recibir action-edit por ese criterio; Edición conserva boda-mode-btn.
Logo oficial: css/wedding-moves.png procede de https://weddingmoves.es/assets/img/logo-gold.png, descargado el 11/09/2026, ya con transparencia. Se representa con máscara CSS y currentColor para conservar contraste; el chip usa 18px de ancho. Hoy de lista de cumpleaños salta al encabezado del mes actual, no al siguiente cumpleaños.

## Profesores y ajustes visuales (v303)
La ficha de clase guarda boda.teachers={celia:boolean,angel:boolean,substitute:string|null}. Ausencia del campo significa ambos profesores principales; null desactiva sustituto. El formulario copia los datos y solo los guarda al confirmar, también para altas multidía. El backup transporta el bloque dentro de events, sin una clave nueva; la normalización multidía lo conserva. Duración sigue siendo el último campo.
El grupo interno WM + Rut se conserva por compatibilidad pero ahora solo contiene ensayos: las rutinas pertenecen a Resto. Las subpestañas de Bodas usan #6B1F20, color de marca de weddingmoves.es, y una variante legible en oscuro. Próximos cumpleaños muestra el siguiente fuera de 14 días si no hay ninguno hoy ni próximo; respeta el filtro VIP. Los detalles de conexiones se pliegan cada vez que se abre el menú, mantienen readonly y se editan únicamente mediante el botón explícito.

## Consistencia visual de Bodas (v304)
--wm-wine es el granate accesible por tema para días cerrados (tarjeta, casilla e indicadores); los pasados siguen grises. La ficha de clase integra Profesores y Duración dentro de ev-bficha, como filas editables, con Duración al final. Las subpestañas conservan altura, peso y borde constantes; scrollbar-gutter:stable evita desplazamientos según el contenido. La prueba de navegador compara sus posiciones al cambiar por las cinco vistas. La configuración usa secciones separadas boda-config-section.

## Edición de profesores y catálogos (v305)
La fila Duración abre openBodaDurationPicker y guarda en el borrador de clase. bodaTeacherCount limita la selección a 1–2 profesores; las nuevas clases usan ambos profesores principales. bodaTeacherStats cuenta clases finalizadas en cuatro grupos exclusivos: ambos, solo el profesor 2, solo el profesor 1 y con sustituto. El cierre diferido de la ficha comprueba identidad del borrador para no borrar otra clase recién abierta.
Los catálogos muestran fichas con cabecera (nombre/editar) y estado debajo; borrar se ofrece solo dentro del editor de una opción sin referencias. Las subpestañas de Bodas usan ancho de contenido y space-between para igualar espacios entre etiquetas, conservando altura y tipografía constantes.

## Preferencias de Bodas (v307)
BODA_CONFIG.teacherNames permite renombrar los dos profesores conservando los IDs angel/celia de las clases. teachers.lastSelected recuerda el ultimo titular marcado y lo conserva al introducir sustituto. defaultPlace elige la sala inicial entre activas (los datos antiguos siguen usando Casa). Ambos ajustes viajan en bodaConfig del backup y se validan al importar. renderBdayVipFilter se reutiliza en las cabeceras Proximos y Eventos; el cuerpo no duplica el control. El titulo WM usa el marron del boton.

## Privacidad de profesores (v309)
Los nombres iniciales quedan vacios; los textos de interfaz usan Profesor 1/Profesor 2 hasta configurar nombres. Los nombres ya guardados por el usuario se conservan. Las claves tecnicas angel/celia del esquema antiguo se mantienen para poder importar backups sin cambiar las asignaciones. BodaConfig completo se exporta; los nombres vacios tambien son validos al importar.

## Horarios de rutinas con fecha efectiva (v310)
`rutChangeFrom(previous,candidate,from)` devuelve un borrador: conserva `start`, guarda los periodos anteriores en `scheduleHistory[{until,schedule}]` (limite exclusivo) y conserva hora/duracion de cancelaciones en `keptSessions[fecha]`. No se permiten cambios retroactivos; las sesiones iniciadas hoy tambien quedan fijadas. Los renders resuelven horario con `rutOccursOn` y duracion con `rutDurationOn`, nunca directamente desde el horario mas reciente.
El formulario permite elegir Aplicar cambios desde. Un nuevo horario sustituye las excepciones semanales futuras desde esa fecha; editar solo nombre/color las conserva. `rutChangeWeek` modifica una semana sin adelantar otros cambios programados y sin alterar sesiones pasadas/canceladas. Los campos nuevos viajan en el objeto completo `rutinas` del backup; `validateImport` valida el historial. Pruebas de logica y navegador cubren cambiar lunes por martes, varias fechas efectivas, cancelaciones, recarga y exportacion.
Los botones de edicion con texto llevan `action-edit action-edit-text` (naranja solido). Los lapices sin texto mantienen `action-edit` (naranja tenue); Home conserva su estilo propio. Rutinas comparte el gesto de subpestanas del contenedor Eventos mediante `_evSwipeRutinas`.

## Rutinas: semana inicial e historial editable (v312)
El formulario principal aplica cambios desde hoy preservando lo ya iniciado; no pide fecha efectiva. Si el nuevo horario de hoy ya ha pasado, `keptSessions[hoy].time=null` evita crear una sesion retroactiva (se valida y exporta). El calendario de Cambiar (desde) una semana concreta ofrece `rutWkForward`: desmarcado llama a `rutChangeWeek`, marcado a `rutNewSchedule` desde el lunes elegido o hoy si la semana ya ha empezado. Las semanas totalmente pasadas se rechazan para cambios de horario.
`js/rutinas-history.js` contiene la vista y edicion historica. `rutHistoryPeriods` agrupa etapas contiguas por dias/horas habituales, ignorando excepciones semanales. Las sesiones se muestran en orden, 20 por etapa con ampliacion; se incluyen tres meses futuros ampliables y acceso rapido al horario actual. `rutEditSession` corrige hora, duracion y cancelacion de UNA sesion (incluso pasada), con Deshacer, sin modificar el horario del grupo. Usa keptSessions y skips existentes, por lo que el backup completo los incluye. Validar todos los horarios y fechas al importar antes de usarlos en formularios.
En Eventos, las casillas heredan el color de su etiqueta y el trazo interior usa el fondo del tema para contrastar tambien en oscuro. El filtro WM usa el logo y tono marron; rutinas usa el texto neutro y puentes libres rosa. El borde negro del bailarin se dibuja ensanchando tambien los trazos explicitos de sus brazos/piernas, no solo el grupo SVG.

## Rutinas canceladas: representacion (v313)
Las sesiones conservan `_rutSkip` y sus datos. `_renderEvMonthCard` las excluye en anual/4 meses; mensual usa `.rut-skip` (X roja), Proximos y agenda `.rut-cancelled` (tachado rojo y oscurecimiento). No filtrar en `rutEventsOn`: se perderian el historico y las otras vistas. La agenda alterna fondos `.ev-wk-day-bg` bajo las barras continuas.

## Agenda: transporte en flujo (v315)
`evWeekTravelRow` coloca cabecera/ida antes de los chips del primer dia y vuelta despues de los del ultimo. Respeta los carriles de las cajas continuas y repite titulo al cambiar de mes. No reservar un padding fijo: los textos largos deben aumentar el alto del dia.
Color definitivo calendarios: `#65a367`. Las pestañas de Eventos usan `--tab-tone`: texto y borde constantes, solo cambia el fondo seleccionado. Selector temporal retirado en v316.

El titulo fijo de agenda usa `.ev-wk-title-track` sobre el tramo completo del viaje y `.ev-wk-sticky-title`; el titulo en flujo reserva su espacio para evitar solapes con el transporte. El contenedor limita el sticky al final del tramo.

En agenda, `_bindEvWeekTitleBackground` sincroniza el fondo del titulo sticky con la fila bajo su posicion, agrupando lecturas en requestAnimationFrame y usando un listener pasivo del contenedor de scroll. `.rut-skipped-title` separa el tachado del aviso `.rut-skipped-label` para que el estado nunca quede tachado.

El fondo sticky mezcla RGB de la fila con RGBA de la barra y guarda RGB opaco: simula transparencia sin dejar ver texto inferior. Su caja respeta los 1.5px de borde lateral del evento.

## Iconos alternativos (v321)
`js/nav-icons.js` contiene seis SVG propios de trazo y conserva las imagenes originales. `navIconHtml` renderiza y `applyNavIconStyle` actualiza la navegacion sin reemplazar botones/listeners. Preferencia `excelia-nav-icons-v1` (`original`/`professional`), exportada como `navIconStyle`; selector en ajustes globales. VIP y Gestify no cambian.
El fondo sticky usa un gradiente de franjas RGB opacas con limites medidos respecto al titulo: si cruza dos dias muestra ambos fondos, desplazandolos continuamente con el scroll.

`openNavIconPicker` ofrece dos tarjetas con vista previa, usando `abrirPanel` con `contenedor:document.body` por tratarse de un ajuste global accesible desde Home. No montarlo en Events si esa ventana esta cerrada.


## Cupo de vacaciones por ejercicio (v328)
`vacEntitlementForYear(year)` es la fuente del cupo para resumen y aviso de Home.
`VAC_BY_YEAR` persiste en `excelia-vac-years` y se exporta como `vacByYear`.
`saveVacEntitlement(n,year)` cambia solo ese ejercicio. El input lleva `data-year`
para no confundir el ejercicio del resumen económico con el resumen independiente.
El antiguo `VAC_ENTITLEMENT` / `excelia-vac-days` se conserva como respaldo para
los años todavía no configurados y para backups antiguos. La importación incremental
fusiona el mapa por año; reemplazar usa el mapa recibido. Se validan enteros de 1 a 60.


## Estado de envios de Home (v334)
`homeSubmissionStatus(year,month)` comprueba `SW` para todas las semanas de
`weeks(year,month)` y el lunes inmediatamente posterior a la ultima. Asi la
semana compartida entre meses nunca cuenta como la semana adicional.
`renderHomeSubmissionStatus` muestra el aviso o el estado completo encima de
las tarjetas. Se calcula al renderizar: no tiene persistencia independiente.


## Seguimiento de CSV (v339)
`js/csv-sync.js` centraliza `csvYearContent(year)` (el mismo contenido que se descarga)
y registra contenido y fecha por año en `excelia-csv-exports-v1`. Viaja como `csvExports`
en el backup. Comparar contenidos evita falsos avisos al deshacer o cambiar campos que
no exporta el CSV (hora, semanas enviadas). No se puede comprobar si el programa externo
ha consumido el archivo: se registra la descarga solicitada o el compartir completado.
Cancelar compartir no actualiza el registro. Los CSV anteriores a esta version necesitan
una nueva exportacion para establecer su referencia. En diciembre se pide el año siguiente.
Los avisos pendientes reaparecen al cargar incluso si los recordatorios se cerraron antes.

Desde v342, el CSV conserva `Fecha,Estado`, con estados `trabajado`, `festivo`,
`vacaciones`, `ausencia`. Sustituye `festivo/vacaciones` y `baja`; el consumidor
externo debe admitir los nuevos valores. El PDF ya distingue los tres tipos.

## Parejas futuras (v343)
`couple.future` es una marca manual independiente de `weddingDate` (opcional).
Se muestra en Futuras y Todas, nunca en Activas/Pasadas. Se edita en el formulario
y viaja dentro de `bodas` en el backup. Las parejas antiguas siguen sin marcar.


## Exportación selectiva a Google Calendar (v352)
`js/events-calendar-export.js` añade el botón de exportar a la derecha del logo WM.
Solo eventos guardados (sin ensayos, cumpleaños virtuales ni sesiones de rutina).
Los grandes son continuos de día completo, con DTEND exclusivo; los puntuales con
hora usan Europe/Madrid. Repeticiones se expanden dentro del intervalo elegido
(máximo dos años) usando `eventOccursOn`, incluidas las fechas clampadas.

El UID depende del id original; las ocurrencias múltiples añaden su fecha. Nunca
regenerarlo por título, fechas del viaje o fecha de descarga. El registro
`excelia-calendar-exports-v1` (`calendarExports` en el backup) conserva las filas,
revisión y bajas. Solo se guarda al completar compartir/solicitar descarga.
No significa que Google haya recibido el archivo. Fusionar backups conserva la revisión
más alta. Los ya compartidos siguen disponibles aunque se cambie el intervalo de búsqueda.
La selección empieza vacía. Desmarcar, filtrar o borrar en Gestify NO genera bajas.
Los borrados se hacen manualmente en Google. El serializador omite registros cancelados
antiguos y solo emite STATUS:CONFIRMED; no existe ninguna acción de cancelar.
`evIcsPrepare` conserva el registro histórico y actualiza solo seleccionados.
`evIcsExportRows` limita el archivo a esa selección, sin reenviar históricos.
`evIcsExportStatus` compara el contenido que se exportaría con el último exportado:
new/repeat/changed/missing. La fila y el resumen avisan de reexportaciones y cambios.
Los filtros de clase/subtipo y texto son independientes de las selecciones.
La vista Seleccionados reúne los marcados sin filtros; cambiar el intervalo conserva la selección.
El botón descarga directamente el ICS (`shareOrDownload` con `download:true`) y deja un enlace
al último archivo como respaldo. El URL vive hasta cerrar el panel; no revocarlo inmediatamente.
El ayudante global recupera errores de compartir mediante descarga, salvo cancelación voluntaria.
Solo se exportan notas si se marca la opción.

Prueba real en Google Calendar (14/09/2026), con datos ficticios retirados al terminar:
importar el mismo UID no duplicó el evento; una revisión posterior cambió título y fechas;
STATUS:CANCELLED retiró el evento en aquella prueba. Desde v350 ya no se generan bajas, por elección del usuario.
Es un intercambio manual: hay que importar el archivo más reciente en el MISMO calendario.
No hay conexión automática, permisos OAuth, invitados ni modificaciones de ensayos.
Al usar otro dispositivo se debe restaurar el backup para conservar identificadores, revisiones y bajas.


## v363 — Huecos de ensayo, asignación y filtros

- `bodaBulkCreate` también se usa para crear un solo hueco desde el calendario;
  mantiene los ensayos anteriores y Deshacer retira solo los IDs recién creados.
- Los huecos y las asignaciones no inventan hora. `BODA_DEFAULT_TIME` (19:00)
  solo propone la hora al abrir el selector; minutos con cinco ciclos, centrados.
- Un solo botón Asignar clases (extras si el paquete está completo). Ambos estados
  permiten desasignar; al guardar se confirma si alguna clase liberada tiene hora
  o pertenece a un día cerrado. Se conserva el hueco con su hora y sala.
- `bodaReopenDay` reabre al añadir/asignar/liberar; cerrar ya no bloquea altas.
  La selección pendiente no modifica ni clases ni candados hasta Guardar.
- El límite de cinco puntuales sigue vigente; asignar un hueco existente no gasta
  otra plaza. Días con otras parejas seleccionables y candados visibles en la leyenda.
- `evCycleFilters`: ocultar todos → ver todos → restaurar selección previa,
  compartido entre anual y cuatro meses. Cambiar un chip reinicia el ciclo.
- Recordatorios sin «Sin hora», salvo ensayos; faltas de pareja/sala explícitas.

## Vista previa de importación y rutinas en ICS (v364)
- `js/import-preview.js`: render puro de categorías y recuentos del archivo. Se utiliza antes de confirmar backups y archivos de eventos. No escribe datos ni muestra valores de correo/MacroDroid. Los recuentos son contenido recibido, no altas netas; la identidad y fusión siguen en import-export/data-integrity.
- `askImportMode(subtitulo, callback, previewHtml)`: tercer argumento opcional generado por el render, nunca HTML del archivo importado. Validación del backup antes de abrir y antes de aplicar.
- `evIcsRoutineRows(mes, ahora)`: sesiones virtuales futuras no canceladas, con horarios e históricos resueltos por `rutEventsOn`. Una ocurrencia por VEVENT, UID estable por rutina/fecha. El usuario elige mes en Rutinas y puede acumular sesiones en Seleccionados. Se revalidan antes de descargar. Los ensayos siguen excluidos.
- No se añaden claves de almacenamiento: firmas y avisos de reexportación usan `calendarExports`, ya incluido en backup. Google se actualiza manualmente.
- El ciclo de filtros de 4 meses/anual conserva sus tres estados y usa un chip cuadrado de 22 px.
- Pruebas: `tools/test-import-sharing.js`, integrado en `npm test`.

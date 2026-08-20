# CLAUDE.md — Contexto del proyecto Horas Excelia

## ¿Qué es?
PWA de registro y envío semanal de horas trabajadas por proyecto. Desplegada en GitHub Pages mediante GitHub Actions. Un único `index.html` más archivos CSS/JS externos. No hay backend.

## ⚡ Índice de código — LEER ANTES DE EXPLORAR
`CODEMAP.md` (raíz) es un índice generado con todas las funciones, el estado global y
las secciones CSS del proyecto, en formato `nombre:línea`.

**Flujo obligatorio antes de tocar código:**
1. `grep` sobre `CODEMAP.md` para localizar el símbolo → te da fichero y línea.
2. Abrir ese fichero con `offset`/`limit` alrededor de esa línea. **No leer ficheros
   enteros** (`events.js` son 2.200 líneas, `economics-fiscal.js` 1.400).
3. Tras cambios grandes (funciones nuevas/renombradas): `node tools/codemap.js`.

Las funciones de primer nivel llevan su tamaño cuando pasan de 80 líneas: `nombre:línea (!362)`.
Ese `(!)` es una señal de "esto ya pide partirse o compartirse con otra vista" — mirar ahí
primero cuando algo cueste de tocar.

## 🧭 Guía de arquitectura — LEER ANTES DE CREAR ALGO NUEVO

Objetivo: que añadir una pantalla o un control sea *ensamblar piezas que ya existen*,
no escribir HTML/CSS nuevo. Antes de crear nada, buscar en el **catálogo de componentes**
de más abajo; si algo se parece en un 80 %, se reutiliza y se parametriza.

### Anatomía de una ventana (overlay)
Todas las ventanas secundarias tienen la misma estructura. De arriba a abajo:

```
#xxxOverlay .full-overlay          display:flex; flex-direction:column
├── .overlay-nav-bar               NIVEL 1 · emojis de navegación (renderNavBar)
├── .ev-hdr-sub / .bday-hdr-sub    NIVEL 2 · pestañas de la ventana        (opcional)
├── .sy-header.with-tabs           NIVEL 3 · título + flechas ◀ ▶ + "Hoy"  (opcional)
└── .sy-body                       flex:1; min-height:0; overflow-y:auto
    ├── .econ-sub-tabs             SUBPESTAÑAS (sticky) — debe ser el 1.er hijo
    ├── …contenido…
    └── .ev-io-row                 botonera inferior (+ Añadir, Exportar…)
```

Reglas duras (romperlas se nota a simple vista):
- El scroll vive **solo** en `.sy-body`. Nunca en `.full-overlay`.
- Los niveles 1-3 son `flex-shrink:0` y **nunca** se ocultan al hacer scroll.
- Separadores con `box-shadow:0 1px 0 var(--border)`, no `border-bottom` (no suma px).
- Las subpestañas usan `.econ-sub-tabs`/`.econ-sub-tab` y van como **primer hijo** de
  `.sy-body` (hay una regla `:has()` que le quita el padding superior para que peguen).

### Catálogo de componentes reutilizables
Antes de escribir uno nuevo, comprobar aquí:

| Necesito… | Uso | Dónde |
|---|---|---|
| Barra de navegación (nivel 1) | `renderNavBar('events')` + `bindNavBar('events',closeFn)` | core.js |
| Subpestañas sticky | `.econ-sub-tabs` / `.econ-sub-tab` | styles.css |
| Aviso corto | `showToast(msg,'success'\|'error',undoFn)` — con `undoFn` sale "Deshacer" | core.js |
| Elegir color | `_renderColorPicker(hex,_,_,'prefijo')` + `_bindColorPicker(wrap,'prefijo')` → `{getColor,setColor}` | events-picker-color.js |
| Elegir hora (ruedas) | `.drum-wrap`/`.drum-picker`/`.drum-sel-lines` + `openBodaTimePicker` como referencia | styles.css / bodas.js |
| Elegir varios días | `openOtrosDatePicker(dates,color,año,cb)` | events-picker-date.js |
| Panel deslizante (sheet) | `.ev-form-overlay`+`.ev-form-sheet` (formularios) · `.ev-detail-overlay`+`.ev-detail-sheet` (detalles) | styles.css |
| Conservar el scroll al re-renderizar | `refreshEvents()` (pasar `false` para volver arriba) | events.js |
| Deslizar para cambiar de mes | `addSwipe(el,onLeft,onRight)` | core.js |
| Preguntar añadir/reemplazar al importar | `askImportMode(subtitulo,cb)` | import-export.js |
| Fusionar sin duplicar al importar | `evMergeIncoming(lista)` · `_mergeList(cur,inc,keyFn,sigFn)` | events.js / import-export.js |
| Marcador de evento (formas) | `evShapeSvg(shape)` · `evMarkerHtml(ev,past,size,shapeDef,ds)` | events-picker-color.js / events.js |
| Relleno "falso translúcido" | `fakeTrans(hex,alpha)` | core.js |
| Grafico de barras (N barras) | `simpleBarChart(values,labels,color,{height,highlight})` | core.js |
| Barras horizontales de reparto | `hBarRows([{label,value,color}],{suffix})` | core.js |
| Panel deslizante de Bodas | `bodaOpenSheet(wrapId,ovId,html,onClose)` + `bodaCloseSheet(...)` | bodas.js |
| Chips de filtro | `.ev-filter-chip` (calendarios) · `.boda-chip` (parejas) | styles.css |
| Tarjeta de mes de calendario | `_renderEvMonthCard(m,año,ctx)` — la usan Anual y 4 meses | events.js |

### Cómo se añade una pantalla o subpestaña nueva
1. **Estado**: una variable global `XXX_VIEW` / `XXX_SUBTAB` arriba del módulo, con
   comentario de los valores posibles. Nada de estado escondido en el DOM.
2. **Render puro**: `renderXxx()` devuelve **string HTML**, no toca el DOM. Así se puede
   comparar la salida antes/después al refactorizar (ver "verificación" abajo).
3. **Binds aparte**: `bindXxxEvents()` se llama *después* de volcar el `innerHTML`.
   Si el contenedor se re-renderiza, usar delegación con el flag `_delegated`.
4. **Abrir/cerrar**: seguir el patrón de doble `requestAnimationFrame` documentado abajo.
5. **Persistencia**: una clave `excelia-*` propia, con `loadXxx()`/`saveXxx()`, y
   **añadirla al backup** en `import-export.js` (exportAll + `_applyFullImport`).
6. **Documentar**: una fila en la tabla de vocabulario y, si es un módulo nuevo, su
   sección en este fichero. Regenerar `CODEMAP.md`.

### Convenciones de nombres
- `renderXxx()` devuelve HTML · `openXxx()`/`closeXxx()` manejan overlays ·
  `bindXxxEvents()` engancha listeners · `_xxx()` = privado del módulo.
- Estado global en MAYÚSCULAS (`EV_VIEW`, `BODA_SUBTAB`): así sale listado aparte en
  `CODEMAP.md` y se ve de un vistazo qué recuerda cada pantalla.
- Clases CSS con prefijo del módulo (`ev-`, `boda-`, `bday-`, `econ-`, `sy-`).

### Antipatrones que ya nos han mordido
- **Duplicar un render "porque es casi igual"**: Anual y 4 meses fueron dos copias de
  ~160 líneas y cada ajuste había que hacerlo dos veces (y una se olvidaba). Hoy ambos
  llaman a `_renderEvMonthCard`. Si dos vistas comparten el 80 %, se parametriza.
- **Identificar datos solo por `id`**: al importar desde otro dispositivo los ids no
  coinciden y se duplicaba todo. Usar además una **firma de contenido** (`evSignature`).
- **Buscar elementos por id con varios formularios abiertos**: `openEvForm` elimina el
  formulario anterior antes de abrir el nuevo; si no, los listeners se enganchan al
  viejo y "Guardar" se ejecuta dos veces.
- **Tintar el fondo con rgba sobre otra capa de color**: da colores embarrados (pasó con
  la jornada sobre las semanas enviadas). Para eventos usar `fakeTrans`; para estados,
  franja de color o borde, no relleno translúcido.

### Verificación al refactorizar
Como los `renderXxx()` son funciones puras que devuelven string, un refactor se valida
comparando la salida vieja y la nueva:
```js
const nuevo = renderEvAnnual();          // con el código nuevo cargado
(0,eval)(await (await fetch('js/_old.js')).text());   // carga temporal del viejo
const viejo = renderEvAnnual();
nuevo === viejo   // debe ser true
```
Es como se validó la unificación Anual/4 meses (idéntico byte a byte en 4 escenarios).

## Estructura de archivos
```
index.html          ← Shell HTML + config inline (secrets inyectados por CI)
css/styles.css      ← Todos los estilos
js/core.js          ← Estado global, utilidades, render principal, bottom sheet
js/summary.js       ← Resumen anual (VAC_ENTITLEMENT=23, barChart3, computePuentes)
js/economics.js     ← Cálculo económico (IVA 21%, IRPF 15%, DAILY_RATE=315)
js/birthdays.js     ← Cumpleaños (BDAYS de localStorage o BDAYS_FROM_SECRET)
js/events.js        ← Eventos con notas, colores, repetición (EVENTS en localStorage)
js/alarms.js        ← Gestión de alarmas creadas desde el PWA (ALARMS en localStorage)
js/init.js          ← Event listeners globales + arranque (IIFE)
.github/workflows/deploy.yml  ← GitHub Actions: inyecta secrets y despliega en Pages
manifest.json       ← PWA manifest
```

## Variables globales clave (core.js)
- `SK = 'excelia-horas-v3'` — clave localStorage de datos principales
- `CY, CM` — año y mes actuales
- `ST` — días marcados `{YYYY-MM-DD: {type?, hours?}}`
- `SW` — semanas enviadas `{YYYY-MM-DD: true}`
- `MONTH_H` — horas por defecto por mes `{'YYYY-MM': 7|8|9}`
- `DAILY_RATE` — tarifa diaria (€, persiste en localStorage)
- `ED` — día seleccionado en el bottom sheet
- `ALARMS` — array de alarmas creadas desde el PWA (js/alarms.js, persiste en `excelia-alarms-v1`)

## Persistencia
Todos los datos en `localStorage`. No hay servidor.
- Datos principales: `excelia-horas-v3`
- Cumpleaños importados: `excelia-bdays-v1` (override del secret de GitHub)
- Eventos: `excelia-events-v1`
- Alarmas: `excelia-alarms-v1`
- URL base MacroDroid: `excelia-alarm-url` (base del webhook, sin nombre de macro)

## Secretos de GitHub
Configurar en Settings → Secrets and variables → Actions:
- `MAIL_TO` — email del destinatario
- `MAIL_CC` — emails en copia (separados por coma)
- `AUTHOR_NAME` — nombre del autor para el email
- `BIRTHDAYS` — datos de cumpleaños (formato CSV o base64-JSON, ver README)

El script Python en `deploy.yml` reemplaza `{{TO}}`, `{{CC}}`, `{{AUTHOR_NAME}}`, `{{BIRTHDAYS}}` en `index.html`.

## BIRTHDAYS: formato aceptado
Dos formatos válidos en el secret de GitHub:
1. **CSV** (una línea por persona): `Nombre,día,mes` (ej: `María,15,3`)
2. **Base64 JSON** (array codificado en base64): `[{"name":"María","day":15,"month":3}]` → base64

El deploy.yml detecta el formato automáticamente y convierte a base64-JSON.

## Ventanas / Overlays
Todas son `position:fixed;inset:0` con `transform:translateY(100%)` → `translateY(0)` al abrirse.
- `#summaryOverlay` — Resumen anual (Σ)
- `#econOverlay` — Económico (€)
- `#bdayOverlay` — Cumpleaños (🎂)
- `#eventsOverlay` — Eventos (📅)
- `#alarmsOverlay` — Gestión de alarmas (botón "📋 Gestión de alarmas" en menú ⋮)

Navegación cruzada: bdayOverlay ↔ eventsOverlay vía botones en la cabecera.

### Patrón de apertura/cierre de overlay (OBLIGATORIO para animación correcta)
```javascript
// ABRIR:
ov.style.display = 'block';
requestAnimationFrame(function(){ requestAnimationFrame(function(){
  ov.classList.add('open');  // añade transform:translateY(0) con transición CSS
}); });
NAV_BACK = closeXxx;

// CERRAR:
ov.classList.remove('open');
setTimeout(function(){ ov.style.display = 'none'; }, 320);  // 320ms = duración de la transición
NAV_BACK = null;
```
El doble `requestAnimationFrame` es necesario para que el navegador pinte primero el estado inicial (`translateY(100%)`) y luego aplique la transición. Sin él, la animación no se ve — el overlay aparece instantáneamente.

### Event delegation en overlays con contenido dinámico
Cuando un overlay usa `innerHTML` para re-renderizar (ej. `alarmsContent`), los listeners por elemento se pierden. Patrón correcto:
```javascript
// Registrar UNA SOLA VEZ en el container (flag _delegated):
if(container && !container._delegated){
  container._delegated = true;
  container.addEventListener('click', function(e){
    var btn = e.target.closest('.mi-boton');
    if(!btn) return;
    e.stopPropagation();
    // actuar con btn.dataset.id, btn.dataset.xxx...
  });
}
// Después, hacer el render que sobreescribe innerHTML:
renderContenido();
```
El listener en el container **sobrevive** a los `innerHTML` porque el container mismo no se reemplaza.

## Clases de evento (v241) — `js/events-picker-color.js`
Cada evento tiene un `kind` y un `type`. **La identidad de una categoría es el par
`kind|type`**, porque "Otros" existe en las dos clases.

| kind | categorías | representación |
|---|---|---|
| `puntual` | Rec. Gestiones · Plan/Quedada · Ensayos boda · Otros | **un marcador por cada día** que ocupa (misma forma en los 3 calendarios) |
| `grande` | Viaje · Asturias · Casa Rural · Otros | **barra continua**, dure 1 día o varios |

- `getEvKind(ev)` deduce la clase de eventos antiguos (los `Otros` de varios días → grande).
- `EV_TYPE_COLORS['kind|type']` — color por defecto (Casa Rural = `#8b5e34` marrón).
- `EV_FREE_COLOR` — categorías con paleta libre · `EV_FREE_SHAPE` — con selector de forma
  (solo `puntual|Otros`) · `EV_FREE_DATES` — con Selección Multidía.
- `isEvBarAlways(ev)` = `getEvKind(ev)==='grande'`; es lo único que decide barra vs marcador.
- **Orden de capas de las barras** (`EV_BAR_Z`, `_evAssignRow`): de arriba a abajo →
  marcadores puntuales · barra fina · media · gruesa · perímetro de puente. El reparto en
  filas se hace **por grosor**: dos barras del mismo grosor que chocan van a filas distintas
  (la franja se ensancha y cada una se estrecha), y dos de grosor distinto comparten fila y
  se superponen quedando la fina encima. Todas comparten BASE (la de la barra gruesa),
  no van centradas: al solaparse quedan escalonadas desde abajo.
- **Grosor de la barra** (`evBarSize`/`evBarSizeCls`): Viaje y Asturias `lg`; el resto de
  grandes `md`; solo `grande|Otros` puede elegir entre `lg`/`md`/`sm` (se guarda en
  `ev.barSize` y se pinta con las clases `.ev-bar-lg|md|sm`).
- **Clases de boda ordenadas por hora** en todos los calendarios: `evSortMarks` reordena
  entre sí las clases (`evBodaMinutes`) dejándolas en las mismas posiciones, para no alterar
  el orden del resto de categorías. Las que no tienen hora van al final.
- **Orden de los marcadores en un dia** (`EV_MARK_ORDER`/`evSortMarks`): `Rec. Gestiones`
  siempre primero; en anual/4-meses solo se dibujan los 3 primeros antes del "+", asi que
  el orden decide que se ve. Para priorizar otra categoria, anadirla a `EV_MARK_ORDER`.
- **Notas**: `ev.note` es la nota general (todos los días) y `ev.dayNotes['YYYY-MM-DD']` la
  nota propia de un día. El formulario muestra las dos cajas solo si el evento es puntual,
  ocupa varios días y se entró desde un día concreto (`EV_EDIT_DS`).

## Filtros del calendario anual / 4 meses (v244)
Los chips NO filtran por tipo suelto sino por **grupo** (`evFilterGroup`, events.js):
`Grandes` (todo kind grande menos Asturias) · `Asturias` · `Gestiones` · `Bodas`
(puntual|Ensayos boda) · `Resto` (el resto de puntuales: Plan/Quedada, Otros...) ·
`Cumpleanos VIP`. `EV_ANNUAL_FILTER_HIDDEN` guarda los grupos ocultos.

## Bodas (js/bodas.js)
Pestaña `EV_VIEW==='bodas'` con cuatro subpestañas (`BODA_SUBTAB`): **Clases**, **Parejas**,
**Calendario** y **Estadísticas**. Las subpestañas y el conmutador Consulta/Edición van en un
único bloque `.boda-sticky-hd` para que ambos queden fijos al hacer scroll.
- `bodaIssues()` calcula los avisos de TODO el calendario (solo los recorta "Ocultar pasadas"):
  huecos sin asignar, parejas pendientes e info incompleta. Cada tarjeta abre `openBodaIssue(kind)`
  con las acciones para resolverlo.
- Parejas en `localStorage['excelia-bodas-v1']` (`BODA_COUPLES`):
  `{id,name,color,contracted,note,weddingDate}`. Al crearlas: 4 clases por defecto y
  color automatico no repetido (`bodaNextColor`). `weddingDate` solo se ve al asignar
  ensayos, nunca en el calendario personal.
- Subpestanas `Clases` / `Parejas` con el componente `.econ-sub-tabs` (sticky), igual
  que en economico. En `Clases` hay dos modos (`BODA_CLASS_MODE`): `ver` (consulta, sin
  controles) y `editar`. En `Parejas` se filtra por `BODA_PAREJAS_FILTER` (por defecto
  las que tienen clases sin asignar).
- **Dias cerrados** (`BODA_CLOSED`, clave `excelia-bodas-closed-v1`): un dia marcado como
  cerrado no admite mas clases (`bodaDayFull` lo tiene en cuenta) y se puede ocultar con el
  chip "Ocultar cerrados".
- **Edicion sin re-render**: en modo Edicion los cambios de hora/pareja/lugar van a
  `BODA_PENDING` y solo se repinta esa fila (`bodaRefreshRow`); se confirman con la barra
  fija de abajo (Guardar/Descartar) y se auto-guardan al cambiar de subpestana o de modo.
  Altas, bajas y cierres de dia si son inmediatos.
- `openBodaAssign(pareja, extraMode)` — calendario de asignacion: dias con clase libre
  resaltados, los de la pareja marcados (fijos si `extraMode`), y modo "Todos los dias"
  para crear clases en cualquier fecha. Guardar asigna, crea o libera clases.
- `openBodaTimePicker` — ruedas de hora y minutos (:00/:15/:30/:45, por defecto 18:00)
  reutilizando el CSS del drum de alarmas, mas entrada manual.
- Lugar de la clase (`BODA_PLACE_LIST`): Sala / Casa (por defecto) / Casa (pareja) / Otro,
  mas **sin asignar** (`place:''`, distinto de "campo ausente", que sigue cayendo en Casa).
  Una clase con pareja pero sin hora o sin sala cuenta como incompleta en los avisos.
  Al anadir otra clase el mismo dia hereda el lugar de la anterior.
- Una **clase** es un evento normal `puntual|Ensayos boda` con `ev.boda={coupleId,time,place}`.
  Duración fija de 1 hora; `time` en saltos de 15 min.
- Subpestana **Calendario** (`BODA_SUBTAB==='calendario'`): mes con un punto por clase
  (color de la pareja + hora) y el dia de la boda resaltado con anillo.
- Filtros de Parejas: chips (`BODA_PAREJAS_FILTER`) con el contador de cada grupo.
- Franjas (`BODA_SLOTS`): cada brazo de abajo tiene su propio color, y la progresion
  entra por la derecha — blanco|blanco (9-14), blanco|gris (14-18), gris|negro (18-20),
  negro|negro (20-23). Los brazos de la pareja se pintan los ultimos para que
  predominen en el centro.
- Marcador: **aspa bicolor** (`evBodaSvg`) — brazos de arriba con el color de la pareja,
  los de abajo con el de la franja (`BODA_SLOTS`: 9-14 blanco, 14-18 gris claro,
  18-20 gris oscuro, 20-23 negro; gris neutro si no tiene hora).
- **Invariante: una clase = un evento de UN SOLO día.** Nunca un evento `Ensayos boda`
  con `dates[]` o con `end>start`; si aparece uno (p.ej. al cambiar de categoría un evento
  multidía) hay que partirlo. Lo hace `bodaNormalizeClasses()` al cargar y el propio
  formulario al guardar. Si no se parte, la pestaña Bodas lo cuenta como una sola clase.
- **Alarma de un ensayo**: desde Próximos, el panel de alarma de una clase ofrece los
  atajos "1 hora antes" y "30 min antes" (se pueden marcar los dos → dos alarmas). La hora
  de abajo sigue siendo editable; tocarla a mano desmarca los atajos.
- Alta masiva: en el formulario, categoría "Ensayos boda" + rango o Selección Multidía →
  `bodaBulkCreate()` crea **una clase por día**, sin hora ni pareja.

## Eventos (events.js)
Estructura de un evento:
```json
{
  "id": "ev-1234567890",
  "title": "string (max 80)",
  "note": "string (max 200)",
  "color": "#6c8cff",
  "start": "YYYY-MM-DD",
  "end": "YYYY-MM-DD",
  "repeat": null
}
```
`repeat` puede ser:
- `null` — sin repetición
- `{"type":"weekly","weekDays":[1,3]}` — semanal (0=Dom...6=Sáb)
- `{"type":"monthly-date"}` — mensual el mismo día del mes
- `{"type":"monthly-first"}` — mensual el día 1
- `{"type":"yearly"}` — anual

## Colores de eventos
`#6c8cff` azul, `#34d399` verde, `#fb923c` naranja, `#ff6b6b` rojo, `#c084fc` morado, `#fbbf24` amarillo

## Sistema de capas (z-index) en los calendarios de eventos

### Calendario anual — estructura de capas dentro de `ev-annual-week-outer`
Cada semana del calendario anual apila 4 capas mediante `position:relative/absolute`:

| Capa | z-index | Elemento CSS | Qué contiene |
|------|---------|-------------|--------------|
| 1 (base) | 1 | `.ev-annual-day` | Celdas de día (número, color de festivo/puente/vacación) |
| 2 | 2 | `.ev-annual-bars-row` → `.ev-annual-mbar` | Barras de eventos multi-día (CSS grid: `grid-column` + `grid-row` para apilar sin solaparse) |
| 3 | 3 | `.ev-annual-xs` → `.ev-annual-x` / `.ev-annual-vip-star` | ✕ de eventos puntuales y ⭐ VIP (centrados encima del día) |
| 4 | 4 | `.ev-annual-puente-perimeter` | Borde rosa de puente (CSS grid: `grid-column` span del puente, `grid-row:1`) |

**Regla crítica**: las capas 2, 3 y 4 son `position:absolute` dentro de `ev-annual-week-outer` que es `position:relative`. Modificar tamaños de celdas puede desalinear las barras.

### Calendario mensual — estructura de capas dentro de cada celda día
En el calendario por meses (`renderEvCalMonth`):
- **Capa base**: celda día con número y colores
- **Barras multi-día** (`ev-multi-bar`): CSS grid con `grid-column: cs+1 / ce+2` y `grid-row: fila+1` — el algoritmo de packing asigna filas para evitar solapamientos
- **Perímetro puente** (`ev-puente-perimeter`): mismo sistema de grid-column/grid-row:1

### Algoritmo de packing de barras multi-día
Antes de renderizar, se ejecuta un algoritmo que asigna a cada evento una `row` (fila) tal que no coincidan en columna con otro evento de la misma fila. El número máximo de filas determina la altura visual de la semana.

## Horas por defecto
- Julio/Agosto: 7h
- Septiembre (1-15): 7h
- Resto del año: 9h
- Viernes: 6,5h siempre
- Sábado/Domingo: 0h

## Entorno de desarrollo local
- **Navegador: Microsoft Edge** — la extensión de Claude Code está instalada en Edge, NO en Chrome. Usar siempre Edge para verificación visual y pruebas con MCP browser. No intentar conectar con Chrome.
- Test local: `py -m http.server 8082` desde la raíz del proyecto (puerto 8082, comando `py` en Windows)

## Dispositivo móvil del usuario
- **Vivo X200 Ultra** — versión china (FuntouchOS / OriginOS)
- Relevante para: alarmas vía MacroDroid, intents Android, ringtones
- La app de Reloj de Vivo **ignora el extra `RINGTONE`** en el intent `SET_ALARM` (limitación confirmada del OEM, probado con RingtoneManager URI y MediaStore URI — ninguno funciona)
- Vivo solo acepta **mp3 y wav** como tonos personalizados (no opus, no ogg)
- Para alarmas automáticas desde la PWA: MacroDroid webhook → Rhino (1.6) JS → intent `SET_ALARM`
- **ContentProvider de alarmas bloqueado**: `content://com.android.deskclock/alarms` lanza `java.lang.SecurityException: Permission`. URIs de Vivo (`com.vivo.deskclock`, `com.vivo.clock`, `com.bbk.clock`) devuelven null. No se puede leer/listar alarmas existentes del sistema.
- **DISMISS_ALARM sí funciona**: el intent `android.intent.action.DISMISS_ALARM` con `SEARCH_MODE=android.label` y `MESSAGE=nombre` **funciona en Vivo** para apagar/borrar alarmas por nombre. Confirmado en pruebas reales.
- El PWA lleva su propio registro en `excelia-alarms-v1` (no depende de poder leer el sistema).

## Alarmas (alarms.js)

### Estructura de una alarma
```json
{
  "id": "alrm-1234567890-123",
  "type": "birthday|event|other",
  "label": "Mensaje de la alarma",
  "hour": 9,
  "minute": 0,
  "days": [1, 2] ,
  "targetDate": "YYYY-MM-DD",
  "createdAt": "ISO8601"
}
```
- `days`: array de días de la semana (1=Lu...7=Do), null si no aplica
- `targetDate`: fecha objetivo `YYYY-MM-DD`, null si es recurrente
- Una alarma es "pasada" si `targetDate < hoy` (UTC midnight). Si `targetDate` es null, es recurrente y nunca pasada.

### Funciones clave (alarms.js)
- `addAlarm(alarm)` — genera id+createdAt, añade a ALARMS y guarda en localStorage
- `removeAlarm(id)` — elimina por id y guarda
- `isAlarmPast(alarm)` — true si targetDate < hoy
- `openAlarms()` / `closeAlarms()` — overlay con event delegation (un listener en container, sobrevive re-renders)
- `renderAlarms()` — pinta todas las alarmas clasificadas por tipo y por futuras/pasadas

### Integración con otros módulos
- `js/birthdays.js`: llama `addAlarm()` en `onBdAlarmSuccess()` (tipo `'birthday'`, dos alarmas: día anterior y día del cumpleaños)
- `js/init.js` (`proceed()`): llama `addAlarm()` al crear alarma MacroDroid (tipo `'other'`)
- Export/Import: `ALARMS` incluido en el objeto exportado/importado

### normalizeMacroBase(url)
Función en `core.js` que extrae la URL base del webhook MacroDroid eliminando el nombre de la macro.
- Entrada: `https://trigger.macrodroid.com/ABC123/crear_alarma` → Salida: `https://trigger.macrodroid.com/ABC123`
- Usada en `alarms.js` al llamar al webhook DISMISS: `macroBase + '/apagar_alarmas?names=' + encodeURIComponent(label)`

## MacroDroid — creación de alarmas

> **Estado (2026-08-19):** la creación de alarmas volvió a funcionar. La macro ya **no
> ejecuta JavaScript (Rhino): el código se pasó a Java**. El PWA no cambia — sigue
> llamando al webhook `…/generar_alarma1?alarmH=&alarmM=&alarmMsg=&alarmDays=` y
> registrando la alarma en `excelia-alarms-v1` antes del fetch, así que lo de este lado
> sigue siendo válido. Lo de abajo es la implementación **anterior en Rhino**, que se
> conserva como referencia hasta documentar la de Java (pedir el script al usuario).

### (Histórico) Scripts Rhino JS

### Stack tecnológico
- Engine: **Rhino 1.6** (JavaScript dentro de MacroDroid)
- Acceso Android: `android.app.ActivityThread.currentApplication()` para obtener contexto
- Variables de webhook: `{v=nombreParam}` se sustituye en el script antes de ejecutarse

### Crear alarma (SET_ALARM intent)
Script real en producción (macro `generar_alarma1`, recibe `alarmH`/`alarmM`/`alarmMsg`/`alarmDays` del webhook):
```javascript
var hStr    = "{v=alarmH}";
var mStr    = "{v=alarmM}";
var msg     = "{v=alarmMsg}";
var daysStr = "{v=alarmDays}";

var h = (!hStr || hStr.indexOf('{') >= 0) ? 9 : parseInt(hStr, 10);
var m = (!mStr || mStr.indexOf('{') >= 0) ? 0 : parseInt(mStr, 10);
if (isNaN(h) || h < 0 || h > 23) h = 9;
if (isNaN(m) || m < 0 || m > 59) m = 0;

var intent = new android.content.Intent("android.intent.action.SET_ALARM");
// ⚠️ CRÍTICO: usar new java.lang.Integer() — Rhino pasa JS numbers como double,
// pero Vivo requiere int. Sin esto, la alarma se crea con la hora actual por defecto.
intent.putExtra("android.intent.extra.alarm.HOUR",    new java.lang.Integer(h));
intent.putExtra("android.intent.extra.alarm.MINUTES", new java.lang.Integer(m));
intent.putExtra("android.intent.extra.alarm.MESSAGE", msg);
intent.putExtra("android.intent.extra.alarm.SKIP_UI", true);
intent.putExtra("android.intent.extra.alarm.VIBRATE", true);
intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

// Días de la semana (alarmDays llega como "2,4" etc. — 1=Domingo...7=Sábado,
// mismas constantes que java.util.Calendar, no hace falta remapear desde el PWA)
if (daysStr && daysStr.indexOf('{') < 0 && daysStr.length > 0) {
  var dayParts = daysStr.split(',');
  var days = new java.util.ArrayList();
  for (var i = 0; i < dayParts.length; i++) {
    var dv = parseInt(dayParts[i], 10);
    if (!isNaN(dv) && dv >= 1 && dv <= 7) days.add(new java.lang.Integer(dv));
  }
  if (days.size() > 0) intent.putExtra("android.intent.extra.alarm.DAYS", days);
}

// ⚠️ CRÍTICO: sin startActivity() el intent se construye pero NUNCA se lanza —
// no da error (por eso el log de MacroDroid parece "correcto"), simplemente no
// pasa nada. Bug real detectado en 2026-07: el script en producción llegó a
// perder estas dos líneas finales, dejando de crear alarmas nuevas silenciosamente.
var ctx = android.app.ActivityThread.currentApplication();
ctx.startActivity(intent);
```
**Nota**: Los días en SET_ALARM usan constantes de `java.util.Calendar`: 1=Domingo, 2=Lunes, ..., 7=Sábado. Distinto del formato del PWA (1=Lu..7=Do), pero `androidDay=jsDay+1` en `js/init.js` ya genera directamente el valor correcto — el script de MacroDroid NO debe remapear.

### Eliminar/desactivar alarma (DISMISS) — intent DISMISS_ALARM
El intent `DISMISS_ALARM` con `SEARCH_MODE=android.label` **SÍ funciona en Vivo** para borrar alarmas por nombre. Confirmado en pruebas reales.

```javascript
// MacroDroid — Macro: apagar_alarmas
// Parámetro recibido del PWA: {v=names} → label exacto de la alarma a borrar
var nombre = '{v=names}';

var intent = new android.content.Intent("android.intent.action.DISMISS_ALARM");
intent.putExtra("android.intent.extra.alarm.SEARCH_MODE", "android.label");
intent.putExtra("android.intent.extra.alarm.MESSAGE", nombre);
intent.putExtra("android.intent.extra.alarm.SKIP_UI", true);
intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
var ctx = android.app.ActivityThread.currentApplication();
ctx.startActivity(intent);
```

**⚠️ Requisito**: el `MESSAGE` debe coincidir exactamente (case-sensitive) con el label con el que se creó la alarma.
**Nota**: Esto solo descarta/apaga la alarma activa, no la elimina de la lista del reloj. Para eliminarla completamente puede requerirse interacción manual.

La "eliminación" desde el PWA sigue siendo:
1. Borra del registro `excelia-alarms-v1` (siempre, inmediato)
2. Llama al webhook MacroDroid `/apagar_alarmas?names=label` → ejecuta el script DISMISS_ALARM

## Despliegue
Push a `main` → GitHub Actions → inject secrets → GitHub Pages.
Test local: `py -m http.server 8082` desde la raíz del proyecto.

## Versioning — INSTRUCCIONES OBLIGATORIAS
- `APP_VERSION` en `js/core.js` (primera línea tras el comentario del bloque) — actualizar en CADA push significativo.
- Formato: `'vN — descripción corta'` (ej: `'v10 — MacroDroid + versioning'`).
- `CACHE_VER` en `sw.js` — mantener sincronizado con el número N de `APP_VERSION`.
- El usuario ve la versión pulsando el botón `⋮` (arriba a la derecha) en cualquier overlay.
- **SIEMPRE** incluir al final de cada respuesta tras un push: `✅ Versión desplegada: vN — descripción`
- Esto permite al usuario verificar que su PWA instalada está actualizada sin ambigüedad.

### ⚠️ CRÍTICO: sw.js DEBE cambiar en CADA push, incluso los más pequeños
El navegador detecta actualizaciones del Service Worker comparando `sw.js` byte a byte.
Si solo cambian archivos JS/CSS pero `sw.js` no cambia → el SW no se actualiza → el usuario NO ve el botón de actualizar → la app queda en la versión antigua sin avisar.
**Regla**: En TODO commit que llegue a `main`, incluso hotfixes de una línea, SIEMPRE bumpar `CACHE_VER` en `sw.js`.

## Vocabulario del usuario (términos ↔ código)

| Término del usuario | Qué es en el código |
|---|---|
| **ventana home** | La pantalla principal (header + lista de semanas en `<main>`) |
| **ventanas secundarias** | Overlays deslizantes (`full-overlay`): resumen, económico, cumpleaños, eventos |
| **ventana resumen / Σ** | `#summaryOverlay` — js/summary.js |
| **ventana económico / €** | `#econOverlay` — js/economics.js |
| **ventana cumpleaños / 🎂** | `#bdayOverlay` — js/birthdays.js |
| **ventana eventos / 📅** | `#eventsOverlay` — js/events.js |
| **emojis de nivel 1** | Fila de botones en el `<header>`: 🏠📊💰🎂📅🔔⋯ (`data-btn` / `nav-bar-btn`) |
| **emojis de nivel 2** | Tabs dentro de una ventana secundaria (`ev-view-toggle`, `bday-view-toggle`) |
| **emojis de nivel 3** | Sub-controles dentro de una pestaña (filtros, chips, botones de acción) |
| **calendario mensual (eventos)** | Vista "Calendario por Meses" en ventana eventos — `renderEvCalMonth()` |
| **calendario anual (eventos)** | Vista "Calendario Anual" en ventana eventos — `renderEvAnnual()` |
| **puentes** | Secuencias de festivos+fines de semana calculadas por `computePuentes()` |
| **eventos puntuales** | Eventos con `start === end` (un solo día) |
| **eventos de varios días / multi-día** | Eventos con `end > start` (barras horizontales en el calendar) |
| **cumpleaños VIP** | `b.vip === true` en BDAYS; sincronizados como eventos `ev-bday-vip-*` |
| **estrella / star VIP** | `⭐` mostrada en el calendario anual y en la pestaña Próximos cumpleaños |
| **aspas / X / ✕** | Marcadores de eventos puntuales en días del calendario anual (`ev-annual-x`) |
| **barra de evento** | `ev-multi-bar`: barra horizontal de evento multi-día en calendario mensual |
| **perimetro puente** | `ev-puente-perimeter`: borde rosa que rodea días de puente en el calendario mensual |
| **chips de filtro** | `ev-filter-chip`: botones de filtro tipo/categoría en calendario anual |
| **ventana alarmas** | `#alarmsOverlay` — js/alarms.js — accesible desde menú ⋮ → "📋 Gestión de alarmas" |
| **bottom sheet** | Panel deslizable desde abajo al pulsar un día en home (`#bottomSheet`) |
| **arriba** | Posición física superior: un elemento queda en una fila/altura mayor (como piezas de Tetris). Ej: "el evento queda arriba del día" = ocupa espacio de layout propio, desplazando el resto hacia abajo. |
| **encima** | Superposición en capas: un elemento se coloca sobre otro como una pegatina, sin desplazarlo. Ej: "el evento queda encima del día" = `position:absolute`, no afecta al flujo. |

## Sistema de 3 niveles de cabecera (OBLIGATORIO en todas las ventanas)

Cada ventana secundaria (overlay) tiene hasta 3 niveles de cabecera, apilados de arriba a abajo:

| Nivel | Presencia | Elemento CSS | Contenido |
|-------|-----------|-------------|-----------|
| **Nivel 1** | Siempre (obligatorio) | `.overlay-nav-bar` | Emojis de navegación: 🏠📊💰🎂📅🔔⋯ |
| **Nivel 2** | Opcional | `.bday-hdr-sub` / `.ev-hdr-sub` / `.sy-tab-bar` | Pestañas específicas de cada ventana |
| **Nivel 3** | Opcional | `.sy-header` (con o sin `.with-tabs`) | Título del mes/año + flechas de navegación |

**Normas obligatorias:**
1. **Sin espacios visibles** entre niveles en ningún momento (ni al abrir, ni al hacer scroll, ni al cambiar de pestaña).
2. **Sin solapamiento** de un nivel sobre el contenido del nivel inferior.
3. Los 3 niveles son **siempre visibles** — no desaparecen al hacer scroll vertical ni al scroll horizontal del contenido.
4. Esta norma aplica a **todas las ventanas** sin excepción.

**Implementación correcta (desde v51): layout flex column**
```
.full-overlay {
  display: flex;
  flex-direction: column;
  /* SIN overflow-y — el overflow va en sy-body */
}
.overlay-nav-bar { flex-shrink: 0 }   /* Nivel 1 */
.bday-hdr-sub    { flex-shrink: 0 }   /* Nivel 2 (si aplica) */
.sy-header       { flex-shrink: 0 }   /* Nivel 3 */
.sy-body         { flex: 1; min-height: 0; overflow-y: auto }  /* Área scrollable */
```
**NO usar `position:sticky` con `top:Xpx` hardcodeado** — produce gaps porque la altura real del nivel superior varía según dispositivo. El layout flex column elimina el problema sin necesitar JS.

El separador visual entre niveles: usar `box-shadow:0 1px 0 var(--border)` (no `border-bottom`) para no añadir px al layout.

## Notificación en emojis de nivel 1 (OBLIGATORIO en TODAS las ventanas)
Los puntos verdes de notificación (`.bday-active`, `.events-active`) deben aparecer en los botones de TODAS las ventanas (home + todas las ventanas secundarias), no solo en la home.
- `updateEventsBtn()` y `updateBdayBtn()` usan `querySelectorAll('.nav-bar-btn[data-nav="events/bday"]')` para actualizar TODOS los botones de la nav bar simultáneamente.
- El CSS `::after` del punto verde se aplica a `.data-btn.bday-active::after`, `.data-btn.events-active::after`, `.nav-bar-btn.bday-active::after`, `.nav-bar-btn.events-active::after`.
- `.nav-bar-btn` tiene `position:relative` para que el `::after` absoluto funcione.

## Falso translúcido — concepto OBLIGATORIO para rellenos de eventos

El término **"falso translúcido"** significa: el relleno de un evento debe *parecer* semi-transparente (mezclado con el fondo negro del calendario en tema oscuro), pero debe ser **opaco** — NO usa `rgba` ni `opacity` CSS, porque eso causaría sangrado de color desde las capas inferiores (eventos, puentes, celdas).

### Comportamiento correcto
- Evento A encima de evento B encima de puente C → A tapa completamente B y C (no sangran colores)
- A se ve "más oscuro" / "mezcladado con negro" = parece translúcido, pero actúa como pegatina opaca
- Equivale a un "agujero al fondo negro": se mezcla con el fondo, no con lo que está debajo

### Implementación: función `fakeTrans(hex, alpha)` en `core.js`
```javascript
// alpha ∈ [0,1] — 0=negro puro, 1=color original
// Mezcla el color con negro (#000000) de forma opaca
fakeTrans('#6c8cff', 0.65)  // → '#46599f' — azul oscurecido al 65%
```
- Los bordes del evento se mantienen con el color original vibrante (`border: 1px solid ev.color`)
- El `background` usa `fakeTrans(ev.color, alpha)` NO `ev.color+'cc'` (nunca rgba para rellenos)

### Valores de alpha por tipo de calendario
- **1 mes** (`ev-multi-bar`): alpha = 0.65 (texto blanco legible sobre fondo oscuro)
- **Anual** (`ev-annual-mbar`): alpha = 0.65 (sin texto significativo, barra delgada)
- **4 meses** (`ev-annual-mbar` en quad): alpha = 0.65 (texto pequeño, fondo oscuro suficiente)

## Patrones CSS relevantes
- `.full-overlay` — base para todos los overlays: `display:flex;flex-direction:column` (NO `overflow-y:auto`)
- `.sy-body` — área scrollable: `flex:1;min-height:0;overflow-y:auto`
- `.sy-header` — cabecera nivel 3: `flex-shrink:0`; usa `box-shadow` NO `border-bottom`
- `.data-btn.bday-active` / `.nav-bar-btn.bday-active` — brillo naranja + punto verde en todos los navbars
- `.data-btn.events-active` / `.nav-bar-btn.events-active` — brillo azul + punto verde en todos los navbars
- `.day-cell.h7/.h8/.h9` — colores por horas en celda del día (ámbar/azul/verde)
- `.col-base/.col-iva/.col-irpf/.col-net` — colores en ventana económica

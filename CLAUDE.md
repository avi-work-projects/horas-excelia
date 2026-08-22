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

## ✅ Pruebas automáticas — PASARLAS ANTES DE CADA PUSH

```bash
node tools/test.js
```

Dos redes en una:

- **26 instantáneas.** Cada `renderXxx()` se pinta con un fixture fijo y su HTML
  se compara con el de `tools/snapshots/`. No dicen si la vista está *bien*
  (eso se mira), dicen si ha cambiado **sin querer**.
- **12 reglas de lógica** para lo que un string no deja ver: barras que se
  rozan, prioridad de horas de una rutina, color de una clase por su pareja,
  tope de eventos por día, firma de un evento al importar…

| Fichero | Qué es |
|---|---|
| `tools/entorno.js` | Un navegador de mentira (localStorage, `document` inerte) y un **Date congelado** al 21/08/2026, para que la salida no cambie según el día |
| `tools/fixture.json` | Datos **inventados** que tocan los casos que más se han roto. No hay nada personal: nunca meter aquí un backup de verdad |
| `tools/snapshots/*.html` | La última salida buena de cada vista, una etiqueta por línea para que el diff se lea |

Si un cambio es intencionado: `node tools/test.js --update`, se mira el diff en
git y se commitea **junto** al cambio. Un `--update` a ciegas convierte la red
en decoración.

`node tools/test.js --solo=cal` limita la ejecución a las vistas que casen.

**Lo que NO cubren**: nada de listeners ni de CSS. La capa de `bindXxxEvents` y
el aspecto siguen necesitando abrir el navegador y mirar.

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
| Casilla de verificacion | `<input type="checkbox">` a secas — hay un estilo unico global; el color se cambia con `style="--chk:#hex"` | styles.css |
| Elegir color | `_renderColorPicker(hex,_,_,'prefijo')` + `_bindColorPicker(wrap,'prefijo')` → `{getColor,setColor}` | events-picker-color.js |
| Elegir hora (ruedas) | `.drum-wrap`/`.drum-picker`/`.drum-sel-lines` + `openBodaTimePicker` como referencia | styles.css / bodas.js |
| Elegir varios días | `openOtrosDatePicker(dates,color,año,cb)` | events-picker-date.js |
| Panel deslizante (sheet) | **`abrirPanel(id,html,{overlay,alCerrar,reutilizar})`** + `cerrarPanel(id,overlay)` | core.js |
| Conservar el scroll al re-renderizar | `refreshEvents()` (pasar `false` para volver arriba) | events.js |
| Deslizar para cambiar de mes | `addSwipe(el,onLeft,onRight)` | core.js |
| Borrar solo con pulsacion larga | `addLongPress(el,cb,ms)` — marca `el._lpFired`, el click posterior debe ignorarse | core.js |
| Preguntar añadir/reemplazar al importar | `askImportMode(subtitulo,cb)` | import-export.js |
| Fusionar sin duplicar al importar | `evMergeIncoming(lista)` · `_mergeList(cur,inc,keyFn,sigFn)` | events.js / import-export.js |
| Marcador de evento (formas) | `evShapeSvg(shape)` · `evMarkerHtml(ev,past,size,shapeDef,ds)` | events-picker-color.js / events.js |
| Relleno "falso translúcido" | `fakeTrans(hex,alpha)` | core.js |
| Grafico de barras (N barras) | `simpleBarChart(values,labels,color,{height,highlight})` | core.js |
| Recorrer los eventos de un dia | `openEvDayCarousel(ds,idInicial)` — es la propia ficha de detalle con flechas, puntos y swipe | events.js |
| Barras horizontales de reparto | `hBarRows([{label,value,color}],{suffix})` | core.js |
| Panel deslizante de Bodas | `bodaOpenSheet(wrapId,ovId,html,onClose)` + `bodaCloseSheet(...)` | bodas.js |
| Tarjeta que se despliega en su sitio | `BODA_CARD_OPEN` + `.boda-card.abierta` — patron a seguir antes que abrir otro modal | bodas.js |
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
js/events.js        ← Eventos: estado, ocurrencias, marcadores, reparto de barras
js/events-render.js ← Las vistas (calendarios, Próximos, Todos) — funciones puras
js/events-form.js  ← Alta y edición de un evento
js/events-detail.js ← Ficha del día (= carrusel), hoja de borrado y panel de alarma
js/events-bind.js  ← Apertura de la ventana y enganche de listeners (carga el último)
js/alarms.js        ← Registro de alarmas creadas desde el PWA (ALARMS en localStorage)
js/rutinas.js       ← Rutinas semanales (RUTINAS en localStorage) — sesiones virtuales en los calendarios
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
- `RUTINAS` — rutinas semanales (js/rutinas.js, persiste en `excelia-rutinas-v1`)

## Persistencia
Todos los datos en `localStorage`. No hay servidor.
- Datos principales: `excelia-horas-v3`
- Cumpleaños importados: `excelia-bdays-v1` (override del secret de GitHub)
- Eventos: `excelia-events-v1`
- Alarmas: `excelia-alarms-v1`
- Rutinas semanales: `excelia-rutinas-v1`
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
`Grandes` (todo kind grande menos Asturias) · `Asturias` · `Gestiones` · `WM + Rut`
(Wedding Moves + rutinas: clases de boda y sesiones de rutina)
(puntual|Ensayos boda) · `Resto` (el resto de puntuales: Plan/Quedada, Otros...) ·
`Cumpleanos VIP`. `EV_ANNUAL_FILTER_HIDDEN` guarda los grupos ocultos.

### Color de un evento: quien manda (v259)
`getEvDisplayColor(ev)` es la unica fuente de color para pintar. Por orden:
1. `Rutina` → el color de la rutina tal cual (su id cambia cada dia).
2. `Ensayos boda` con pareja → **el color de la pareja**; el morado del tipo
   solo se ve mientras la clase no tiene pareja asignada.
3. Viaje con color base → matiz determinista por id (`evTravelColor`).
4. El resto → `ev.color`.
Los paneles (detalle, alarma, Proximos) usan esta funcion, nunca `ev.color`.

### Rutinas: el color lo manda el icono
`RUT_FIXED_COLOR` fija naranja/verde/rojo para gimnasio, padel y baile; el
selector de color del formulario solo aparece con el icono `gen` ("Otra").

## Topes de un mismo dia (v269)
Cada columna del calendario de 1 mes tiene el suyo, en vez del unico tope de 8
que habia antes para todo junto (las rutinas y los cumpleanos se comian el
sitio de los eventos de verdad).

| Tope | Cuanto | Que cuenta | Donde se aplica |
|---|---|---|---|
| `EV_MAX_PUNT_DIA` | 5 | eventos **puntuales**; ni VIP, ni rutinas, ni grandes | `evDayLimitExceeded` (al guardar un evento y al crear clases de boda) |
| `EV_MAX_RUT_DIA` | 3 | sesiones de rutina | `rutDiaLleno` (al guardar una rutina o crearla desde una sugerencia) |
| `EV_MAX_VIP_DIA` | 3 | cumpleanos VIP | conmutador VIP de la ventana de cumpleanos |

Los tres **bloquean** con un aviso. Coinciden a proposito con los huecos que
pinta el calendario (`EV_CAL_CORNER_STACK` = 5 a la derecha, VIP y rutinas a la
izquierda), asi que lo que se puede crear es justo lo que se puede ver. El
marcador `+` de la columna derecha sigue en el codigo para los dias que ya
tuvieran mas de 5 de antes.

## Avisos de cupo anual (v267/v269)
Dos avisos al marcar un dia en la home, los dos con `confirm()` y los dos
dejando seguir:

| Tipo | Tope | Cuenta | Funcion |
|---|---|---|---|
| Vacaciones | `VAC_ENTITLEMENT` (23) | solo laborables: son los que gastan jornada | `confirmarCupoVacaciones` |
| Festivos | `FESTIVOS_ANIO` (12) | **todos** los dias: los 12 festivos son del calendario | `confirmarCupoFestivos` |

## Calendario de 1 mes: el dia en dos columnas (v258)
Cada celda reparte lo que ocupa el dia en dos columnas:

| Columna | Donde | Que lleva | Tope |
|---|---|---|---|
| Derecha (`.ev-otros-corner`) | a la altura del numero | eventos **puntuales** | `EV_CAL_CORNER_STACK`=5; si hay mas, el 5.º hueco es el `+` |
| Izquierda (`.ev-day-left`) | empieza bajo el numero | 1.º cumpleanos **VIP**, 2.º sesiones de **rutina** | `EV_CAL_VIP_MAX`=3 VIP |

- Las estrellas VIP se solapan al 75 % (`margin-left:-9px` sobre marcadores de 12 px).
  Al superar el tope, el conmutador VIP de la ventana de cumpleanos avisa y no deja.
- Pulsar las estrellas o el `+` abre `openEvDayCarousel(ds,id)`: una ficha por evento
  del dia, con flechas, puntos y swipe, y un boton que salta al panel de siempre
  (detalle de evento, alarma de cumpleanos o sesion de rutina).
- El resto de calendarios sigue con el reparto de siempre.

## Horas de un evento y transporte (v260)
Cada clase de evento guarda su hora en un sitio distinto, pero se lee siempre
con los mismos tres ayudantes (`events.js`), asi que el resto del codigo no
tiene que saber de donde sale:

| Funcion | Devuelve |
|---|---|
| `evStartTime(ev)` | hora de inicio: `ev._rutTime` (rutina) · `ev.boda.time` (clase) · `ev.time` (resto) |
| `evEndTime(ev)` | hora de fin (las clases de boda duran 1 h fija y devuelven `null`) |
| `evTimeLabel(ev)` | texto `09:30–11:00` para las tarjetas |
| `evTramos(ev)` | tramos de viaje de un evento grande, ya normalizados |

- **Puntual** (menos `Ensayos boda`): `ev.time` y `ev.endTime`, las dos
  opcionales. El fin solo se activa si hay inicio.
- **Grande**: `ev.viaje = {ida:{time,modo,conductor}, vuelta:{...}}`, cada
  tramo opcional. `time` es la hora de **salida**. `modo` sale de
  `EV_TRANSPORTES` (tren · bus · coche · avion) y `conductor` solo se guarda
  con `modo==='coche'`.
- **Alarmas desde Proximos**: los atajos "1 h antes" / "30 min antes" ya no son
  solo de las clases de boda; salen para cualquier evento con hora y, en los
  grandes, un bloque por tramo. Cada boton lleva `data-ds` (su dia: la vuelta
  cae en `ev.end`) y `data-suf` (la coletilla del mensaje). Si el viaje ya
  empezo, la ida no se ofrece.
- La hora se ve en el detalle, en Proximos y en la agenda semanal.

## Cierre de paneles: cancelar el temporizador (v260)
Los paneles se quitan del DOM 300 ms despues de cerrarse. Si en ese rato se
abria otro con el mismo id, el temporizador del cierre anterior se llevaba por
delante el panel NUEVO. Por eso hay `_evScheduleRemove(id,extra)` /
`_evCancelRemove(id)`: todo `openXxx` cancela el borrado pendiente de su id.

## Swipe anidado: manda el de dentro (v263)
`addSwipe` descarta el gesto si empieza dentro de un elemento que ya tiene su
propio swipe (`_swipeAdded`) o dentro de un panel abierto (`.ev-detail-overlay`,
`.ev-form-overlay`, `.ev-alarm-overlay`, `.bd-alarm-overlay`, `.dp-overlay`,
`.imp-mode-ov`). Sin esto, deslizar en la ficha de un dia cambiaba **ademas** el
mes de fondo, porque el gesto subia hasta el swipe de `#eventsOverlay`.

## Ficha de una clase: un solo sitio (v271)
`openBodaClaseForm(ev,alTerminar)` crea o cambia UNA clase: dia, hora, pareja y
sala. Se llega desde tres sitios y siempre es la misma ficha:

- el lapiz de cada clase en **Consulta**
- el lapiz de cada clase en una **pareja desplegada**
- el boton **+ Anadir clase** (con `ev` a null)

Mientras esta abierta trabaja sobre un evento de mentira (`BODA_FORM.tmp`), asi
que los selectores pueden escribir a gusto; el evento de verdad solo se toca al
pulsar Guardar. Por eso se le pueden pasar los mismos selectores de siempre en
modo `{directo:true}`.

## Repeticion: solo donde tiene sentido (v271)
`evAdmiteRepeticion(kind,type)` = `puntual` y (`Rec. Gestiones` u `Otros`). El
bloque `#evFRepBlock` se muestra u oculta desde `_applyTypeUI`, que ahora
tambien corre al ABRIR el formulario, no solo al cambiar de categoria.

## La ficha de un ensayo se edita desde ella misma (v270)
Las tres filas (Hora, Sala, Pareja) son botones: cada una abre el mismo
selector que la pestana Bodas y lo que se elija queda guardado en el evento.

El detalle esta en **como guardan esos selectores**. En la pestana Bodas
escriben en `BODA_PENDING` y se confirman con la barra de guardado; desde la
ficha no hay tal barra, asi que se les pasa un tercer argumento:

    openBodaTimePicker(ev,{directo:true, alGuardar:fn})

- `bodaAplicarCampo(ev,campo,valor,opts)` decide: con `directo` escribe en
  `ev.boda` y hace `saveEvents()`; sin el, deja el cambio pendiente.
- `bodaTrasElegir(ev,opts)` decide a quien avisar: con `directo` llama a
  `refreshEvents()` y al `alGuardar` (que repinta la ficha); sin el, a
  `bodaRefreshRow(ev)`.

Si se anade un selector nuevo para una clase, tiene que seguir este patron o
desde la ficha no guardara nada.

## Por que los hijos de una hoja no se encogen (v270)
`.ev-car-sheet` es `display:flex;flex-direction:column` con `max-height:90vh`.
Los elementos de un contenedor flex se **encogen por defecto**, asi que cuando
el contenido pasaba de ese alto el texto se salia de su caja y se comia los
botones de abajo. Lo arregla `.ev-car-sheet > *{flex-shrink:0}`: los hijos
mantienen su alto y lo que sobra se resuelve con el scroll de la hoja.

## La ficha del dia no cambia de alto (v263)
Con `car`, la hoja lleva la clase `.ev-car-sheet`: `min-height:56vh`, en columna
y con las acciones pegadas abajo (`margin-top:auto`). Ademas, una clase de boda
pinta SIEMPRE sus tres pastillas (hora, sala y pareja): si falta el dato sale
`.ev-bchip.warn` con el aviso, en vez de desaparecer la linea. Asi la ficha mide
lo mismo este la clase completa o vacia.

## La ficha del dia es la ficha de detalle (v261)
No hay dos paneles. `renderEvDetail(ev,fromSummary,car)` recibe un tercer
argumento `car = {ds,i,n}`: cuando viene, la cabecera muestra la fecha y el
contador `i/n`, y debajo salen las flechas y los puntos. `openEvDetail(ev,
container,car)` reaprovecha el panel ya abierto al deslizar (si lo quitara y lo
volviera a poner, la animacion de entrada saldria en cada evento).

Las acciones del pie cambian segun lo que sea el elemento:

| Elemento | Botones |
|---|---|
| Evento normal | Editar evento · Eliminar |
| Sesion de rutina (`ev._rut`) | Marcar hecha/saltada · Editar rutina |
| Cumpleanos VIP | Alarma de cumpleanos |

Por eso `openEvDetail` consulta con `if(...)` cada boton antes de engancharlo:
en una rutina no existen `evDEdit` ni `evDDel`.

## Cambiar una semana de una rutina: dos pasos (v261)
`openRutWeek(r)` ya no abre el editor directamente. Primero `_rutWeekPick(r)`
pinta el mes en modo consulta (`.rut-wpick`), con un punto en los dias en los
que toca y borde en las semanas que ya tienen un cambio guardado; al pulsar
cualquier dia se abre `_rutWeekRender(r)` para esa semana. La flecha atras del
editor vuelve al selector, no cierra.

## Barras que se rozan: media casilla cada una (v262)
Cuando una barra ACABA el mismo dia en que otra EMPIEZA no hay conflicto real,
asi que van en la **misma fila** y se reparten esa casilla a mitades.

- `_evSoloSeRozan(aS,aE,bS,bE)` decide si es un roce (se pisan exactamente un
  dia y ese dia es el final de una y el principio de la otra). Pide que las dos
  duren mas de un dia: con una barra de un solo dia no se sabria que mitad le
  toca, y se trata como choque de siempre.
- `_evAssignRow` ya no cuenta el roce como colision.
- `_evMarcarMitades(lista)` marca `halfL`/`halfR` mirando TODAS las barras de la
  semana, no solo las de su fila.
- `_evMitadesStyle(it)` devuelve el margen: `calc(50% / N)` con N = dias que
  ocupa la barra. **El porcentaje de un margen en un elemento de rejilla se mide
  sobre el ancho de SU area**, por eso hay que dividir entre N para obtener
  media casilla. Vale igual en 1 mes y en anual/4 meses.

## Chips de filtro en una sola fila (v262)
Con los nombres largos la fila de chips se partia en dos en pantallas
estrechas. `EV_FILTER_SHORT` usa ahora `WM/Rut` y, para Asturias, **la bandera
en SVG en vez de texto** (campo azul + Cruz de la Victoria). El valor de
`EV_FILTER_SHORT` se inserta como HTML, asi que admite marcado.

## Rutinas con horario distinto segun el dia (v262)
`r.times = {'1':'07:30','5':'20:45'}` guarda SOLO los dias que se salen de la
hora general (`r.time`); el resto caen en ella. `rutTimeOfDay(r,wd)` resuelve la
hora del dia y `rutWeekCfg` la usa, con esta prioridad:

    suspension > cambio de esa semana (weeks[lunes].time) > hora del dia > hora general

En el formulario lo activa el conmutador "Horario distinto segun el dia", que
pinta una fila por cada dia marcado. `rutTieneHorarios(r)` es lo que hace que la
tarjeta ponga "horario por dia" en vez de una hora suelta.

## Elegir semana de una rutina = el calendario de verdad (v267)
`_rutWeekPick(r)` ya no dibuja un mes propio: presta `EV_YEAR`/`EV_MONTH`, llama
a **`renderEvCalMonth()`** y los devuelve. Asi se ve exactamente lo mismo que en
la pestana de 1 mes (eventos, rutinas, puentes, hoy). El calendario queda inerte
con `.rut-wpick-real *{pointer-events:none}` y solo `.ev-week-outer` vuelve a
`auto`: lo unico pulsable es la fila de la semana. Las que ya tienen un cambio
guardado llevan `.rut-wk-cambiada`.

Este patron —reutilizar un render entero y desactivarlo con `pointer-events`—
sirve para cualquier "elige aqui" que deba parecerse a una vista existente.

## Rutinas (js/rutinas.js) — v257
Pestana `EV_VIEW==='rutinas'` (ocupa el hueco que dejo "Todos"), con dos subpestanas
(`RUT_SUBTAB`): **Rutinas** y **Estadisticas**.

Una rutina es una actividad semanal (gimnasio, baile, padel...) guardada en
`localStorage['excelia-rutinas-v1']`:
```json
{"id":"rut-...","name":"Gimnasio","color":"#34d399",
 "weekDays":[1,3,5],            // 0=Dom … 6=Sab
 "time":"18:00","dur":60,       // RUT_TIME_DEFAULT / RUT_DUR_DEFAULT
 "start":"YYYY-MM-DD",
 "suspend":{"from":"YYYY-MM-DD","to":null},   // to null = indefinida
 "weeks":{"YYYY-MM-DD":{"weekDays":[2,4],"time":"19:00"}},  // clave = lunes de esa semana
 "skips":{"YYYY-MM-DD":1}}      // sesiones marcadas como saltadas
```

- **Sesiones virtuales**: `rutEventsOn(ds)` devuelve eventos `puntual|Rutina` con id
  `rut-<idRutina>-<ds>` y los inyecta `getEventsOn()`. No estan en `EVENTS` y no se
  guardan: se recalculan siempre desde la rutina.
- **Donde se pintan (v260)**: en 1 mes con su icono; en anual y 4 meses como un
  puntito de 4 px (`.ev-ann-rut`) en fila arriba del dia; en Proximos y en la
  agenda semanal como una tarjeta mas. Home y resumen las excluyen con
  `getEventsOn(ds,EV_NO_RUT)`. En Proximos hay un check para esconderlas
  (`EV_UP_HIDE_RUT`) y otro para las clases de boda (`EV_UP_HIDE_BODA`).
- **Icono** (`rut.icon`): `gym` (mancuerna) · `padel` (pala) · `baile` (bailarin) ·
  `gen`. `rutIconOf(r)` lo deduce del nombre si la rutina no lo trae. `rutIconSvg(kind,color)`
  dibuja la silueta en el color de la rutina y los detalles en `fakeTrans(color,.52)`.
  Se pinta dos veces (trazo negro grueso + relleno) para tener contorno de la union.
  OJO: a 13 px el contorno cierra los huecos, asi que las siluetas finas no valen
  (un biceps se probo y quedaba en una mancha; por eso el gimnasio es una mancuerna).
- Al pulsar una sesion se abre `openRutSesion(rutina,ds)` (marcar hecha / saltada).
  El id se deshace con `rutEventFromId(id)`.
- **Prioridad de configuracion** en `rutOccursOn`: suspension > override de la semana
  (`weeks[lunes]`) > configuracion base. Devuelve la hora o `null` si ese dia no toca.
- **Estadisticas** (`rutStats`): las sesiones pasadas cuentan como *hechas* por defecto
  (automatico) y `skips` permite corregirlas. Hoy no cuenta. Sin sesiones pasadas se
  muestra "Aun sin sesiones pasadas", no un 0 %.
- **Color**: `getEvDisplayColor` respeta `ev.color` tal cual para `type==='Rutina'`; sin
  esa excepcion el matiz por hash de Viaje pintaria cada sesion de un color distinto
  (el id cambia cada dia).
- Las rutinas van en el backup completo (`rutinas` en exportAll / `_applyFullImport`,
  fusion por id con el nombre como firma).

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
- Para alarmas automáticas desde la PWA: MacroDroid webhook → script **Java** → intent `SET_ALARM`
- **ContentProvider de alarmas bloqueado**: `content://com.android.deskclock/alarms` lanza `java.lang.SecurityException: Permission`. URIs de Vivo (`com.vivo.deskclock`, `com.vivo.clock`, `com.bbk.clock`) devuelven null. No se puede leer/listar alarmas existentes del sistema.
- **DISMISS_ALARM sí funciona**: el intent `android.intent.action.DISMISS_ALARM` con `SEARCH_MODE=android.label` y `MESSAGE=nombre` **funciona en Vivo** para apagar/borrar alarmas por nombre. Confirmado en pruebas reales.
- El PWA lleva su propio registro en `excelia-alarms-v1` (no depende de poder leer el sistema).

## Paneles deslizantes: `abrirPanel` (v273)
**Todo panel nuevo se abre con esto.** Abrir uno eran seis pasos copiados en
quince sitios y cada copia se olvidaba de algo distinto.

```js
abrirPanel('miWrap', html, {
  overlay:'miOv',          // id del div con .ev-detail-overlay / .ev-form-overlay
  contenedor:elemento,      // por defecto #eventsOverlay
  alCerrar:fn,              // que hacer al tocar el fondo
  reutilizar:true           // repintar el que ya hay, sin animacion de entrada
});
cerrarPanel('miWrap','miOv', alTerminar);
```

Lo que resuelve de una vez, y que antes habia que acordarse en cada sitio:

- **Borrado con retardo cancelable.** El panel se quita 300 ms despues de
  cerrarse; si se vuelve a abrir el mismo id antes, el temporizador viejo se
  llevaba por delante el panel NUEVO.
- **Tocar el fondo cierra y ahi se queda**: el click no sigue hacia abajo.
- **La animacion se ve** (doble requestAnimationFrame) pero no depende de ella:
  hay un temporizador de respaldo, porque rAF no corre si la pestana no esta
  pintando y el panel se quedaba creado sin abrir.
- **`reutilizar`** para repintar en sitio, que es lo que hace el carrusel del
  dia al deslizar de un evento a otro.

`bodaOpenSheet`/`bodaCloseSheet` y `_evScheduleRemove`/`_evCancelRemove` siguen
existiendo como alias finos: son los nombres que ya usaban Bodas y Eventos.

## Un click fuera de un desplegable no se cuela (v272)
Los dos desplegables del header (panel de alarma y menu ajustes) no tienen
fondo que tape la pantalla, asi que el mismo toque que los cerraba activaba
ademas lo que hubiera debajo (cerrar el panel tocando una semana enviada
soltaba el aviso "Semana enviada..."). El cierre se hace ahora en **fase de
captura** sobre `document` y corta el evento con `stopPropagation()` +
`preventDefault()`, de modo que ese toque solo cierra.

Los paneles deslizantes (`.ev-detail-overlay` y companeros) no tienen este
problema: su fondo a pantalla completa ya se come el click.

## La URL de MacroDroid vive en un unico sitio (v272)
Solo en el menu ajustes (clave `excelia-alarm-url`). Habia una segunda copia
dentro del panel de alarma y las dos escribian en la misma clave, con codigo
para mantenerlas sincronizadas. El conmutador "MacroDroid webhook" sigue en el
panel: decide el metodo (webhook o intent), y la URL la lee de la clave.

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

> **Estado (2026-08-21):** funcionando. La macro ejecuta **Java**, no
> JavaScript (Rhino). El PWA no cambia: sigue llamando al webhook
> `…/generar_alarma1?alarmH=&alarmM=&alarmMsg=&alarmDays=` y registrando la
> alarma en `excelia-alarms-v1` antes del fetch.

### Crear alarma — script Java en producción (macro `generar_alarma1`)

```java
String hStr    = "{v=alarmH}";
String mStr    = "{v=alarmM}";
String msg     = "{v=alarmMsg}";
String daysStr = "{v=alarmDays}";

int h = 9;
int m = 0;
try { h = Integer.parseInt(hStr.trim()); } catch (Exception e) { h = 9; }
try { m = Integer.parseInt(mStr.trim()); } catch (Exception e) { m = 0; }
if (h < 0 || h > 23) h = 9;
if (m < 0 || m > 59) m = 0;
if (msg == null || msg.length() == 0 || msg.indexOf('{') >= 0) msg = "Alarma";

final android.content.Context ctx = android.app.ActivityThread.currentApplication();

android.content.Intent it = new android.content.Intent("android.intent.action.SET_ALARM");
it.putExtra("android.intent.extra.alarm.HOUR", h);
it.putExtra("android.intent.extra.alarm.MINUTES", m);
it.putExtra("android.intent.extra.alarm.MESSAGE", msg);
it.putExtra("android.intent.extra.alarm.SKIP_UI", true);
it.putExtra("android.intent.extra.alarm.VIBRATE", true);

if (daysStr != null && daysStr.length() > 0 && daysStr.indexOf('{') < 0) {
  java.util.ArrayList<Integer> dias = new java.util.ArrayList<Integer>();
  String[] partes = daysStr.split(",");
  for (int i = 0; i < partes.length; i++) {
    try {
      int dv = Integer.parseInt(partes[i].trim());
      if (dv >= 1 && dv <= 7) dias.add(Integer.valueOf(dv));
    } catch (Exception e) { }
  }
  if (dias.size() > 0) it.putIntegerArrayListExtra("android.intent.extra.alarm.DAYS", dias);
}

it.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

String res;
try {
  ctx.startActivity(it);
  res = "Alarma " + h + ":" + (m < 10 ? "0" + m : "" + m) + " (implicito)";
} catch (Exception e1) {
  res = "FALLO: ningun reloj acepto SET_ALARM (" + h + ":" + m + ")";
  String[] pkgs = { "com.android.BBKClock", "com.vivo.alarmclock",
                    "com.google.android.deskclock", "com.android.deskclock" };
  for (int i = 0; i < pkgs.length; i++) {
    try {
      it.setPackage(pkgs[i]);
      ctx.startActivity(it);
      res = "Alarma " + h + ":" + (m < 10 ? "0" + m : "" + m) + " -> " + pkgs[i];
      break;
    } catch (Exception e2) { }
  }
}

final String txt = res;
try {
  new android.os.Handler(android.os.Looper.getMainLooper()).post(new Runnable() {
    public void run() {
      android.widget.Toast.makeText(ctx, txt, android.widget.Toast.LENGTH_LONG).show();
    }
  });
} catch (Exception e) { }

System.out.println(res);
```

Tres cosas que hacen que funcione y que es fácil cargarse:

1. **`putExtra` con `int` de Java**, no con un número suelto: Vivo exige `int`.
   Este es el mismo problema que en Rhino obligaba a `new java.lang.Integer()`.
2. **`startActivity(it)`**: sin esa línea el intent se construye y no se lanza,
   y el log de MacroDroid parece correcto. Ya pasó una vez.
3. **Plan B por paquete**: si el intent implícito no lo coge nadie, prueba uno a
   uno con los relojes de Vivo y de Google. Y avisa con un Toast, que es lo que
   permite depurar sin cable.

Los días van con las constantes de `java.util.Calendar` (1=Domingo … 7=Sábado).
`androidDay=jsDay+1` en `js/init.js` ya manda ese valor: el script **no** debe
volver a convertirlo.

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
| **pestana rutinas** | `EV_VIEW=='rutinas'` — js/rutinas.js — actividades semanales |
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

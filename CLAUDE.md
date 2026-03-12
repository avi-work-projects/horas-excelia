# CLAUDE.md — Contexto del proyecto Horas Excelia

## ¿Qué es?
PWA de registro y envío semanal de horas trabajadas por proyecto. Desplegada en GitHub Pages mediante GitHub Actions. Un único `index.html` más archivos CSS/JS externos. No hay backend.

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

## MacroDroid — Scripts Rhino JS

### Stack tecnológico
- Engine: **Rhino 1.6** (JavaScript dentro de MacroDroid)
- Acceso Android: `android.app.ActivityThread.currentApplication()` para obtener contexto
- Variables de webhook: `{v=nombreParam}` se sustituye en el script antes de ejecutarse

### Crear alarma (SET_ALARM intent)
```javascript
var ctx = android.app.ActivityThread.currentApplication();
var intent = new android.content.Intent('android.intent.action.SET_ALARM');
intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
// ⚠️ CRÍTICO: usar new java.lang.Integer() — Rhino pasa JS numbers como double,
// pero Vivo requiere int. Sin esto, la alarma se crea con la hora actual por defecto.
intent.putExtra('android.intent.extra.alarm.HOUR', new java.lang.Integer(h));
intent.putExtra('android.intent.extra.alarm.MINUTES', new java.lang.Integer(m));
intent.putExtra('android.intent.extra.alarm.MESSAGE', msg);
intent.putExtra('android.intent.extra.alarm.SKIP_UI', true);
intent.putExtra('android.intent.extra.alarm.VIBRATE', true);
// Para días de la semana:
var days = new java.util.ArrayList();
days.add(new java.lang.Integer(1)); // 1=Do, 2=Lu, ..., 7=Sá (Android Calendar constants)
intent.putExtra('android.intent.extra.alarm.DAYS', days);
ctx.startActivity(intent);
```
**Nota**: Los días en SET_ALARM usan constantes de `java.util.Calendar`: 1=Domingo, 2=Lunes, ..., 7=Sábado. Distinto del formato del PWA (1=Lu..7=Do).

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

## Patrones CSS relevantes
- `.full-overlay` — base para todos los overlays: `display:flex;flex-direction:column` (NO `overflow-y:auto`)
- `.sy-body` — área scrollable: `flex:1;min-height:0;overflow-y:auto`
- `.sy-header` — cabecera nivel 3: `flex-shrink:0`; usa `box-shadow` NO `border-bottom`
- `.data-btn.bday-active` / `.nav-bar-btn.bday-active` — brillo naranja + punto verde en todos los navbars
- `.data-btn.events-active` / `.nav-bar-btn.events-active` — brillo azul + punto verde en todos los navbars
- `.day-cell.h7/.h8/.h9` — colores por horas en celda del día (ámbar/azul/verde)
- `.col-base/.col-iva/.col-irpf/.col-net` — colores en ventana económica

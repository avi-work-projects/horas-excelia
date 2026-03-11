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
- **ContentProvider de alarmas bloqueado**: `content://com.android.deskclock/alarms` lanza `java.lang.SecurityException: Permission` — MacroDroid no tiene `READ_ALARM` permission. No soluble sin root. URIs de Vivo (`com.vivo.deskclock`, `com.vivo.clock`, `com.bbk.clock`) devuelven null (no existen).
- **Conclusión**: Es imposible leer alarmas existentes del sistema Android desde MacroDroid. El PWA lleva su propio registro en `excelia-alarms-v1`.

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

### Eliminar/desactivar alarma (DISMISS)
MacroDroid no puede eliminar alarmas del sistema nativo. La "eliminación" desde el PWA:
1. Borra del registro `excelia-alarms-v1` (siempre, inmediato)
2. Llama al webhook MacroDroid `/apagar_alarmas?names=label` (opcional, best-effort)
El macro MacroDroid `/apagar_alarmas` debe buscar la alarma por nombre y desactivarla manualmente.

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

## Regla de separación entre niveles (OBLIGATORIO en todas las ventanas)
Los 3 niveles de cabecera de cada ventana secundaria deben cumplir:
1. **Sin espacios visibles** entre niveles al hacer scroll (no "rendija/gap").
2. **Sin solapamiento** de un nivel sobre el contenido del nivel de abajo.
3. Los 3 niveles son siempre visibles (todos sticky).
Implementación: usar `box-shadow:0 1px 0 var(--border)` en lugar de `border-bottom:1px solid` en todos los elementos sticky (overlay-nav-bar, sy-header, bday-hdr-sub, ev-hdr-sub, sy-tab-bar). Así no se altera la altura de layout y no aparece el gap.

## Notificación en emojis de nivel 1 (OBLIGATORIO en TODAS las ventanas)
Los puntos verdes de notificación (`.bday-active`, `.events-active`) deben aparecer en los botones de TODAS las ventanas (home + todas las ventanas secundarias), no solo en la home.
- `updateEventsBtn()` y `updateBdayBtn()` usan `querySelectorAll('.nav-bar-btn[data-nav="events/bday"]')` para actualizar TODOS los botones de la nav bar simultáneamente.
- El CSS `::after` del punto verde se aplica a `.data-btn.bday-active::after`, `.data-btn.events-active::after`, `.nav-bar-btn.bday-active::after`, `.nav-bar-btn.events-active::after`.
- `.nav-bar-btn` tiene `position:relative` para que el `::after` absoluto funcione.

## Patrones CSS relevantes
- `.full-overlay` — base para todos los overlays deslizantes
- `.sy-header` — cabecera sticky de overlay (compartida); usa `box-shadow` NO `border-bottom`
- `.data-btn.bday-active` / `.nav-bar-btn.bday-active` — brillo naranja + punto verde en todos los navbars
- `.data-btn.events-active` / `.nav-bar-btn.events-active` — brillo azul + punto verde en todos los navbars
- `.day-cell.h7/.h8/.h9` — colores por horas en celda del día (ámbar/azul/verde)
- `.col-base/.col-iva/.col-irpf/.col-net` — colores en ventana económica

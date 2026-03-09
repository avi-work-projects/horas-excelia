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

## Persistencia
Todos los datos en `localStorage`. No hay servidor.
- Datos principales: `excelia-horas-v3`
- Cumpleaños importados: `excelia-bdays-v1` (override del secret de GitHub)
- Eventos: `excelia-events-v1`

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

## Patrones CSS relevantes
- `.full-overlay` — base para todos los overlays deslizantes
- `.sy-header` — cabecera sticky de overlay (compartida)
- `.data-btn.bday-active` — brillo naranja cuando hay cumpleaños próximos
- `.data-btn.events-active` — brillo azul cuando hay eventos próximos
- `.day-cell.h7/.h8/.h9` — colores por horas en celda del día (ámbar/azul/verde)
- `.col-base/.col-iva/.col-irpf/.col-net` — colores en ventana económica

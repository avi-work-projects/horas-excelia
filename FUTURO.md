# Cosas a hacer en el futuro — Horas Excelia

> Ideas y mejoras pendientes para implementar más adelante.
> No son urgentes, pero conviene no olvidarlas.

---

## 1. Temas de la app (cambio de apariencia)

Actualmente la app tiene un único tema oscuro. La idea es añadir **2–3 temas alternativos** que el usuario pueda seleccionar desde los ajustes (o desde un selector en el header).

**Posibles variantes:**
- **Dark** (actual) — fondo `#0a0a0f`, acentos azul/verde
- **Light** — fondo claro, texto oscuro, estilo minimalista
- **Midnight blue** — azul profundo con acentos dorados/naranjas

**Cómo implementarlo:**
- Añadir un atributo `data-theme="dark|light|midnight"` al `<html>` o `<body>`
- Mover todas las variables CSS de `:root` a selectores por tema, por ejemplo `[data-theme="light"] { --bg: #f5f5f5; ... }`
- Guardar la preferencia en `localStorage` con clave `excelia-theme`
- Añadir un botón/icono (p.ej. 🎨 o ☀️) en el header que cicle entre temas o abra un pequeño selector

---

## 2. Alarmas en el móvil para cumpleaños y eventos

Al pulsar sobre un **cumpleaños** o un **evento**, ofrecer la opción de crear alarmas en la app de alarmas del teléfono.

**Comportamiento deseado:**
- **El día antes** a las **21:30** — recordatorio de que mañana es el cumple/evento
- **El mismo día** a las **10:30** — recordatorio el día D

**Cómo funciona en la práctica:**
La API estándar de alarmas no existe en navegadores web, pero hay una alternativa sencilla: generar un fichero `.ics` (iCalendar) con dos `VALARM` dentro del evento, que el teléfono puede importar directamente al calendario/alarmas.

```
BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:🎂 Nombre — Cumpleaños
DTSTART;VALUE=DATE:20260704
BEGIN:VALARM
TRIGGER:-P1DT2H30M   (día anterior a las 21:30)
ACTION:DISPLAY
DESCRIPTION:Mañana es el cumpleaños de Nombre
END:VALARM
BEGIN:VALARM
TRIGGER:T10H30M0S    (mismo día a las 10:30)
ACTION:DISPLAY
DESCRIPTION:Hoy es el cumpleaños de Nombre 🎂
END:VALARM
END:VEVENT
END:VCALENDAR
```

El usuario descarga el `.ics` y lo abre → el móvil lo importa al calendario con los recordatorios activados. Sin necesidad de permisos extra.

**Dónde añadirlo en la app:**
- En el panel de detalle de cumpleaños (`renderBdayDetail`): botón "🔔 Crear alarmas"
- En el panel de detalle de evento (`renderEvDetail`): botón "🔔 Crear alarmas"

---

## 3. Envío automático de correos con N8N

Actualmente el correo semanal se genera y el usuario lo envía manualmente. La idea es conectar la app con **N8N** para que el envío sea automático, quizás con un paso de confirmación.

**Flujo propuesto:**
1. El usuario pulsa "Enviar semana" en la app
2. La app hace un `POST` a un webhook de N8N con el JSON de la semana
3. N8N construye el correo (HTML o texto) y muestra una vista previa (opcional)
4. N8N envía el correo a `TO` y `CC` configurados
5. La semana se marca como enviada en la app

**Opción con confirmación (recomendada para empezar):**
- N8N responde con `{ "preview": "html del correo", "ok": true }`
- La app muestra la preview al usuario con botón "Confirmar envío"
- Al confirmar, se llama a un segundo endpoint de N8N que hace el envío real

**Consideraciones:**
- El webhook URL de N8N puede inyectarse como secreto de GitHub (`{{N8N_WEBHOOK}}`) igual que `TO` y `CC`
- N8N puede usar SMTP propio o servicios como Resend / Sendgrid (gratuitos en uso bajo)
- Hay que decidir si N8N corre en servidor propio o en N8N Cloud (plan gratuito disponible)

---

*Documento creado el 07/03/2026. Actualizar cuando se implemente alguna de estas mejoras.*

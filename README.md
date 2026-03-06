# Horas Excelia

PWA para registrar y enviar semanalmente los días/horas trabajados por proyecto.

## Funcionalidades

- **Calendario semanal** — marca cada día como trabajado, festivo, vacaciones o ausencia
- **Envío por email** — genera un correo prefabricado en Outlook con el resumen de la semana
- **Resumen anual** — estadísticas de días trabajados, vacaciones, festivos y horas; gráficas y exportación PDF
- **Económico** — calcula base imponible, IVA (21%), IRPF (15%) y neto mensual/anual por tarifa diaria configurable
- **Cumpleaños** — calendario y lista de cumpleaños del equipo; alerta cuando hay uno en los próximos 7 días
- **Eventos** — notas y eventos con colores, repetición y rango de fechas; visible desde el calendario principal

## Configuración (GitHub Secrets)

En **Settings → Secrets and variables → Actions**, crear estos secrets:

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `MAIL_TO` | Destinatario del email | `rrhh@empresa.com` |
| `MAIL_CC` | Copia (separados por coma) | `jefe@empresa.com,admin@empresa.com` |
| `AUTHOR_NAME` | Tu nombre completo | `María García` |
| `BIRTHDAYS` | Cumpleaños del equipo (ver formato abajo) | *(ver abajo)* |

### Formato BIRTHDAYS

**Opción A — CSV** (más sencilla). Una persona por línea: `Nombre,día,mes`
```
Juan,5,3
María,15,8
Carlos,22,12
```

**Opción B — Base64 JSON** (si ya tienes el JSON). Codifica el array en base64:
```json
[{"name":"Juan","day":5,"month":3},{"name":"María","day":15,"month":8}]
```
Puedes codificarlo con: `echo '[...]' | base64`

También puedes importar un archivo JSON directamente desde la app (botón "Importar JSON" en la ventana de cumpleaños). Los datos importados tienen prioridad sobre el secret.

## Horas por defecto

| Período | Horas/día | Viernes |
|---------|-----------|---------|
| Julio–Agosto | 7h | 6,5h |
| 1–15 septiembre | 7h | 6,5h |
| Resto del año | 9h | 6,5h |

Puedes ajustar las horas mensuales con los chips `7h / 8h / 9h` en la cabecera, o por día desde el selector al pulsar sobre un día.

## Despliegue

Cualquier push a `main` despliega automáticamente en GitHub Pages. El workflow inyecta los secrets antes de subir el HTML.

## Test local

```bash
python3 -m http.server 8080
```
Abre `http://localhost:8080` en el navegador. Los secrets no estarán inyectados (quedarán como `{{TO}}`, etc.), pero toda la funcionalidad de la app es accesible sin ellos salvo el envío de email.

## Exportación e importación

- **Datos principales** (botón ↓ en la cabecera): exporta todos los días marcados, semanas enviadas y tarifa diaria en JSON
- **Cumpleaños**: exporta/importa desde la ventana 🎂
- **Eventos**: exporta/importa desde la ventana 📅

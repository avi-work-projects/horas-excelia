# Programación de horas: candidato en revisión

El acceso individual y «Programar pendientes» abren la misma conciliación.
El servicio sigue **deshabilitado en producción**. La autorización posterior de
Ángel permitió una prueba real acotada, ya anulada, que se describe debajo;
no activa el lote de horas. La clave de paso queda fuera de este trabajo.

## Reglas compartidas

- Mes visible, incluida su semana puente, más dos semanas completas posteriores.
  Identidad: lunes `YYYY-MM-DD`, nunca el día de envío ni solo el número de semana.
- Último día realmente trabajado, a las 08:00 de `Europe/Madrid`. Si ya pasó o
  no hay días laborables, dejar pendiente; no enviar inmediatamente.
- La anterior debe existir enviada/programada. El lote avanza cronológicamente;
  una incidencia sin resolver bloquea las nuevas semanas posteriores.
- Enviada: conservar. Programada idéntica: conservar. Programada con cambios:
  mostrar días/horas y fecha, exigir selección expresa y actualizar el mismo ID.
  Sus destinatarios y asunto se conservan; los correos nuevos usan Para/CC de
  «Correo de horas». Las firmas de Android no cuentan como cambio de horas.
- Duplicado, borrador, lectura parcial, cuenta incorrecta o intento incierto:
  bloquear. Una conversación enviada con respuestas acredita el envío y no
  provoca una nueva programación.
- Abrir Outlook o la revisión no marca una semana enviada. Las marcas `SW`
  antiguas solo se usan cuando no hay una conexión Kairo configurada.

## Componentes y estado privado

`hours_model.py` valida contenido/alcance y decide sin efectos externos.
`outlook_hours.py` consulta DOM visible de Elementos enviados y Borradores en
el Chromium ya autenticado. No consulta cookies, tokens ni API internas.
`hours_store.py` conserva planes de cinco minutos y un diario SQLite con clave
única por semana. Un bloqueo entre procesos y una reserva anterior a escribir
impiden repetir por doble clic, dos dispositivos o respuesta perdida.

Antes de cada operación se vuelve a leer Outlook; después se exige encontrar
una única programación con el contenido y fecha revisados. Una actualización
debe conservar el ID. Un resultado incierto detiene el lote y bloquea nuevos
intentos. No borrar el diario como mecanismo de recuperación.

`hours_service.py` escucha únicamente en loopback. El contrato previsto es
`/horas/` tras Tailscale Serve, con Host y usuario exactos; CORS de `/status`
solo admite el origen configurado de Gestify. Las escrituras HTTP requieren
origen privado y CSRF. La app verifica origen, ventana e ID de cada mensaje,
y que sus datos sigan iguales antes de una futura confirmación.

El directorio de estado y SQLite son privados (700/600 en Linux). Guardarlos
fuera del checkout, junto con la configuración real. No publicar perfil,
destinatarios, solicitudes, correo, diario ni copias en el atlas o Git.
Los registros HTTP no imprimen solicitudes; los fallos del lector se resumen.

## Demostración y pruebas

```sh
python tools/kairo/demo_hours.py --port 8771
npm run map:serve
```

Abrir `http://127.0.0.1:8766/docs/visual-map/review/hours-scheduling-preview.html`.
Usa destinatarios `.invalid`, inventario en memoria y diario temporal con la
misma conciliación/pantalla. **Nunca conecta con Outlook.** «Simular programación»
usa un escritor ficticio y no altera el estado de Home.

```sh
npm test
python tools/kairo/test_hours.py
npm run build
npx playwright test tools/browser/hours-kairo.spec.js --workers=1
```

Windows Python necesita `tzdata` o un `PYTHONTZPATH` de IANA; Kairo usa el sistema.
`hours-requirements.txt` fija Playwright. La prueba opcional
`test_hours_writer_ui.py --cdp http://127.0.0.1:9223` crea solo un contexto aislado,
sin red y con HTML ficticio; no abre el buzón y cierra ese contexto al terminar.

## Activación pendiente después de la revisión

La lectura real se ha comprobado con la sesión ya iniciada por el propietario:
reconoce enviados y mensajes programados desde Outlook Android, incluidas
las dos semanas adicionales. La configuración real permanece fuera de Git.

`outlook_hours_writer.py` sigue protegido y deshabilitado por defecto. Se han
adaptado los controles al formulario español real: remitente en un botón «De:»,
destinatarios contenteditable, Asunto y dos diálogos de fecha personalizada.
La fecha es texto DD/MM/YYYY y debe coincidir también con el calendario
seleccionado; no se aceptan las horas sugeridas. El botón final «Enviar» se
busca únicamente dentro de ese diálogo y con fecha futura a las 08:00 de Madrid.
Las pruebas sin red reproducen estos controles, incluida la conservación de dos
Para y dos CC, actualizaciones y bloqueo de un cuerpo o calendario distinto.
No confundir la prueba manual descrita debajo con validar todo el recorrido
Gestify → servicio privado → diario → adaptador. Este último sigue pendiente;
no activar `writes_enabled` por haber pasado una simulación.

Si el buzón crece debe
reforzarse la acreditación de lista completa: el lector recorre desde el inicio
hasta un final estable, con límites que bloquean, pero depende de la
virtualización de Outlook. Una interfaz desconocida nunca permite crear correo.
Después corresponderá instalar el servicio privado y conectar su ruta sin
alterar `kairo-facturas`. Esta entrega no instala ese servicio ni publica la ruta.

No reiniciar el Chromium autenticado para desplegar fuentes. CDP 9223, VNC y
el perfil solo son accesibles mediante loopback/túnel privado existente.
Las capturas nuevas son únicamente Home y la revisión ficticia; se conservan
las históricas. El resumen de horas de Home sigue en su propuesta separada;
esta entrega no aprueba ni publica su diseño.

## Comprobación del Vivo por USB — 28/10/2026

El dispositivo conserva v510 de producción; no confundir esa PWA con el candidato.
Se comprobó «Correo de horas → Atrás → Ajustes» y se comparó la solicitud de horas
real con el lector de Outlook, sin activar un escritor ni cambiar correos.
`tools/browser/mobile-hours-probe.cjs` lee solo los datos de horas necesarios y
guarda el resultado fuera del repositorio, en LocalAppData/Gestify/private-tests.
Compara además un SHA-256 del almacenamiento para acreditar que sigue intacto.
No sustituye la primera muestra salvo `--replace-baseline` explícito. Requiere el
puente USB ya autorizado en loopback 9225 hacia `chrome_devtools_remote`.

La prueba detectó que Recordatorios todavía usaba desde dos semanas antes hasta
tres después de hoy. Se corrigió en el candidato: `homeSubmissionWarnings` usa
el mes visible más sus dos semanas adicionales, reconoce enviadas/programadas
y muestra un único aviso de consulta si Outlook está sin confirmar. El contenido
de las capturas representativas no se regenera por este ajuste de lógica.

La interfaz ficticia se abrió en Chrome del Vivo por USB: la revisión del lote,
la selección expresa de una actualización, su simulación sin correo y el regreso
al origen funcionan. El acceso individual presenta una única semana. Se conserva
esta separación entre prueba visual móvil con datos ficticios y conciliación
de datos reales; no afirmar que ya se probó una programación real.

El arranque de los procesos temporales para unir el candidato móvil con la
conciliación real fue rechazado por el control automático, incluso tras la
autorización específica del propietario. No se instaló un servicio ni una ruta
nueva en Kairo. La lectura real y la interfaz ficticia por USB se comprueban por
separado: no equivalen a certificar el recorrido completo de producción.

## Prueba real autorizada y anulada — 28/10/2026

Se creó una única prueba técnica con contenido ficticio, dirigida a la propia
cuenta del propietario, para el 06/11/2026 a las 08:00. Outlook mostró su estado
Programado y la fecha prevista. Se anuló con «Cancelar envío» y quedó como
borrador, sin enviarse. La lectura final, tras recargar del servidor, confirmó
la anulación, ningún editor abierto y las programaciones originales intactas.
El diario de la prueba y las imágenes reales quedan fuera de Git.

El recorrido se hizo mediante la interfaz existente; no se reintentó instalar
los procesos o rutas que el control automático había rechazado.

La prueba reveló dos requisitos de integración:

- Outlook puede conservar temporalmente «Borrador» en la lista después de
  programar. Las consultas reales sin caché ahora recargan el buzón; después
  de escribir no se admite la pantalla anterior como prueba de éxito o ausencia.
  Si aparece un inicio de sesión o un editor, se deja sin confirmar y no se repite.
- Microsoft redirige de `outlook.office.com` a `outlook.cloud.microsoft`:
  [documentación oficial](https://learn.microsoft.com/en-us/microsoft-365/enterprise/cloud-microsoft-domain?view=o365-worldwide).
  Se aceptan solo esos hosts HTTPS exactos. La identidad del correo usa la cuenta
  y su ID, sin depender del host, para que el cambio no parezca otro mensaje.

Recargar mediante la API de navegación o el botón del navegador, con el editor
cerrado. No usar Ctrl+R dentro de Outlook: puede abrir una respuesta. La respuesta
accidental a la prueba se descartó sin enviarse antes de la auditoría final.

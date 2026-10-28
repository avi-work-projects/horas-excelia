# Programación de horas: candidato en revisión

El acceso individual y «Programar pendientes» abren la misma conciliación.
Esta entrega permite revisar y simular; **no está activada en producción ni
autoriza programaciones reales**. La clave de paso queda fuera de este trabajo.

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

`outlook_hours_writer.py` es un adaptador protegido, deshabilitado por defecto.
Su formulario se ha probado **solo sobre HTML ficticio sin red**. Los selectores
de remitente, destinatarios, fecha y confirmación deben calibrarse con Outlook
real. No activar `writes_enabled` por haber pasado la simulación.

Tras la revisión de Ángel falta validar de forma controlada el formulario real,
la zona horaria del buzón y la verificación posterior. Si el buzón crece debe
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

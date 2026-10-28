# Programación de horas con Kairo

El acceso individual y «Programar pendientes» abren la misma conciliación.
La programación requiere confirmar una revisión vigente, sin cambios en los
datos de Gestify. El servidor conserva el interruptor privado `writes_enabled`;
instalar código no programa correos por sí solo. La clave de paso queda pendiente.
Las secciones siguientes conservan el historial de preparación; el estado de
integración más reciente figura al final.

El contrato de uso vigente, con cachés de móvil y Kairo, facturas, trabajos y
límites de la sesión, está en [Gestify y Kairo: funcionamiento y límites](../../docs/gestify-kairo-flujo.md).

## Reglas compartidas

- Mes visible, incluida su semana puente, más dos semanas completas posteriores.
  Identidad: lunes `YYYY-MM-DD`, nunca el día de envío ni solo el número de semana.
- Último día realmente trabajado de lunes a viernes, a las 08:00 de Madrid.
  Si los cinco días son vacaciones/festivos, usar el último que no sea festivo,
  aunque sea de vacaciones. Con los cinco festivos o una fecha ya pasada, dejar
  pendiente; no enviar inmediatamente.
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

## Integración v511 — 28/10/2026

- Home incorpora «Programar pendientes» y conserva «Programar semana». El resumen
  vuelve a la composición de producción en el lado derecho; su propuesta de
  rediseño permanece separada. Se incluyen las correcciones de Ajustes y alarmas
  de v510, sin revertirlas al integrar la rama.
- Tailscale Serve publica `/horas` hacia `127.0.0.1:8770`, con el usuario y origen
  exactos. Las rutas anteriores, incluida `/facturas`, se conservan. Se comprobó
  por HTTPS la lectura de cuatro semanas enviadas y tres programadas.
- El adaptador programó una prueba ficticia a la propia cuenta para el jueves
  19/11 a las 08:00, con viernes no laborable. Después el diario y adaptador
  actualizaron ese mismo correo al miércoles 18/11 a las 08:00, al descontar
  también el jueves. La lectura fresca confirmó un solo correo y el mismo ID.
  Ningún correo real de horas se creó ni se reprogramó durante estas pruebas.
- Las comprobaciones reales detectaron diferencias del formulario que una
  simulación no acredita: sugerencias de destinatarios asíncronas, icono dentro
  del botón de fecha y dos elementos con la misma etiqueta de hora. Ahora se
  selecciona la dirección exacta y solo el input de hora. El día se elige en el
  calendario y se comprueban tanto su selección como el texto DD/MM/YYYY.
- Para actualizar se abre la fila observada y se verifica el ID del mensaje.
  Navegar directamente a su URL puede volver a la carpeta sin seleccionar el
  correo. Una fila ausente o una identidad distinta bloquean la operación.
- Los intentos interrumpidos de prueba se conservaron en su diario privado y se
  conciliaron antes de continuar. Ese diario está separado del de producción;
  no se borra una reserva incierta como mecanismo de reintento.

### Servicio persistente privado

Las unidades de usuario están en `gestify-hours.service` y
`gestify-outlook.service`; requieren el directorio privado `~/gestify-outlook`,
su venv y `hours.json` con remitente, propietario, orígenes y estado reales.
Configurar permisos 700/600 y mantener todo ello fuera de Git.
El comando de horas escucha solo en loopback; no publicar CDP, VNC o el perfil.

En Kairo se habilitó el mantenimiento de la sesión de usuario con linger y ambas
unidades para próximos arranques. El Chromium autenticado actual no se reinició:
continúa la unidad temporal anterior hasta que termine. No iniciar una segunda
sesión sobre el mismo perfil mientras esa unidad siga activa. El nuevo arranque
tras reiniciar Kairo no se ha ensayado en esta validación.

Si Microsoft caduca la sesión, pide elegir cuenta o cambia una interfaz que no
se reconoce, la conciliación queda sin confirmar y no crea correos. El acceso
no equivale a una autenticación permanente ni a acceso por Graph.

Para desactivar escrituras, cambiar únicamente `writes_enabled` a false en la
configuración privada y reiniciar `gestify-hours.service`. Conserva el estado y
el diario. La revisión y la simulación permanecen disponibles.


### Estado comprobado de la activación

El servicio persistente de horas está activo y permite confirmar programaciones
tras la revisión. La auditoría final confirmó la anulación y retirada del
correo ficticio automático, sin modificar las programaciones originales.
El borrador manual de la prueba anterior se conserva sin programación.

Se comprobó el candidato desde el origen HTTPS de Gestify contra el servicio
real: siete semanas conciliadas, confirmación del origen sin cambios, commit
sin operaciones (cuatro enviadas y tres programadas) y devolución del estado a
Home. Se usó una copia privada de la solicitud del Vivo; esta prueba web no
sustituye la comprobación física de la PWA instalada después de publicar.

Edge bloqueó la consulta automática por el permiso Local Network Access.
[Documentación oficial de Microsoft](https://learn.microsoft.com/en-us/deployedge/ms-edge-local-network-access).
El fetch señala `targetAddressSpace: local`, sin conceder ni desactivar permisos.
Si se deniega, la revisión por navegación HTTPS sigue disponible y devuelve sus
estados por el canal de ventana ya validado, también al refrescar o confirmar.
No se sustituye ese resultado por un fetch automático denegado. El aviso señala
el permiso necesario; no inventa semanas enviadas ni pendientes sin comprobar.
La sincronización automática al abrir Home requiere ese permiso del navegador.

### PWA de Android y captura de enlaces (v513)

En el Vivo, abrir directamente la ventana de `/horas/` podía lanzar la PWA de
Kairo y cerrar el `WindowProxy` esperado por Gestify. La consulta automática
sí funcionaba; eso no acreditaba el recorrido del botón. Android standalone
usa ahora un iframe dentro de un diálogo de Gestify, con sandbox de scripts y
origen, sin navegación superior ni ventanas nuevas. El HTML solo permite como
ancestro el origen configurado de Gestify; las demás respuestas prohíben marcos.
La identidad Tailscale, Host, origen, CSRF y verificación del contenido al
confirmar conservan sus comprobaciones. No se cambian permisos del dispositivo.

La prueba física del candidato validó Comprobar Outlook con regreso automático,
el lote de siete semanas y la revisión individual del 26/10. El resultado fue
cuatro enviadas y tres programadas, sin crear o cambiar correos. La huella de
localStorage coincidió con la inicial. Evidencia privada fuera de Git; el mapa
añade únicamente una captura ficticia de esta presentación.

La caché de lectura empieza al terminar la observación, para que una consulta
lenta no nazca ya caducada. El commit conserva sus lecturas frescas y el diario.
La prueba HTTP simula una observación de 40 segundos y acredita que la segunda
revisión inmediata reutiliza la observación, sin escribir correo.


## Home y confirmación compacta (v512)

El estado principal está en Home: «Todo al día», pendientes o revisión, con
recuentos y una etiqueta por semana. Las programadas muestran su fecha/hora.
El resumen mensual conserva su composición a la derecha. «Comprobar Outlook»
abre el puente de consulta y vuelve automáticamente a Home; no confirma ni
programa. Si hay que programar, solo se muestran de entrada semanas nuevas o
modificadas. Resueltas, destinatarios y contenido permanecen plegados.
En producción se oculta la simulación. Cero operaciones no ofrece confirmar.

GET /status añade únicamente días y fecha de las programaciones a su resultado
privado. Home compara esos datos con los días actuales y la fecha prevista:
existencia de correo no acredita sincronización de horas o fecha. La consulta
completa devuelve la misma evidencia mediante el puente de ventanas. Una edición
local deja de verse sincronizada y deshacerla recupera el estado si vuelve a
coincidir. Sin esa evidencia, una programación no se presenta como sincronizada.
No se incluyen cuerpo ni destinatarios en este endpoint.

hoursWeekDays centraliza el desglose que se envía y el que se compara. El puente
solo gestiona origen/ventana/ID; Home aporta callbacks y la validación de datos
sin cambios. La demostración documental no depende de los globales de la app.
La intención check oculta la confirmación y tampoco autoriza la comprobación
previa a un commit.

La excepción de vacaciones se calcula tanto en Home como en Kairo; una prueba
cruzada verifica ambas versiones. SCHEDULE_POLICY=2 invalida las revisiones
anteriores al cambio de regla, sin borrar el diario ni tocar correos existentes.
Si se cambia otra vez la elegibilidad o fecha de envío, revisar esta versión de
política para no confirmar una decisión diferente de la que vio el usuario.

Las pruebas de esta entrega usan datos ficticios y Edge en anchuras de móvil.
No necesitan ni manejan el teléfono. No se programa correo real para validar la
nueva presentación; la comprobación remota posterior es de solo lectura.


La comprobación de solo lectura del candidato v512 contra Kairo real acreditó
el regreso automático a Home y cuatro enviadas/tres programadas sincronizadas
con la solicitud privada de referencia. El contexto de prueba bloqueaba commit
por precaución y registró cero peticiones de escritura. No se conectó ni utilizó
el teléfono. La evidencia real queda fuera de Git y las capturas del atlas son
ficticias.

## Caché local de conciliación (v514)

Gestify conserva los últimos hechos verificados por semana, compartidos entre
meses y asociados a la URL de Kairo. Cambiar de mes o recargar no inicia otra
lectura si sus jornadas no han cambiado. La fecha de la última comprobación
permanece visible incluso sin conexión. Días y horas locales diferentes siguen
marcándose «Revisar cambios», aunque no se pueda consultar Outlook.

Una fecha de envío alcanzada provoca una nueva lectura; ↻ actualiza a petición.
Los cambios externos en Outlook requieren esa nueva lectura para conocerse. La
caché nunca autoriza por sí sola una escritura: el servicio conserva la revisión
fresca, las comprobaciones de duplicados y el diario. Al confirmar, Gestify elimina
los hechos afectados hasta recibir el nuevo estado. La revisión individual
invalida solo su semana; un error de consulta no borra las verificaciones previas.
No cambian el servicio de Kairo ni la política de programación en esta entrega.

## Estado operativo revisado con v515

Comprobación de solo lectura: servicio de horas activo, escrituras habilitadas y
consulta HTTPS de conciliación correcta con cuenta e inventario verificados.
La sesión sigue siendo la abierta manualmente por el propietario en Chromium
de Kairo; el adaptador reutiliza ese perfil, no guarda una contraseña en Gestify
ni implementa un inicio de sesión automático nuevo. Si Microsoft exige volver
a entrar o aprobar MFA, debe hacerlo el propietario en ese navegador.

Para consultar o crear programaciones se necesita Kairo encendido, sus servicios,
sesión válida, Internet y conexión Tailscale desde el dispositivo. El USB no
interviene. Gestify inicia la revisión desde el botón; el usuario confirma y
Kairo crea las programaciones en Outlook. No hay una tarea mensual que pulse el
botón por sí sola. Una vez aceptadas por Outlook web, el envío a la hora prevista
depende de Outlook, no de mantener Gestify abierto.

El servicio de horas y la unidad permanente del navegador están habilitados al
arrancar, con linger. El navegador actual continúa en la unidad temporal anterior
para conservar la sesión; no se debe arrancar otro sobre el mismo perfil. Sigue
sin ensayarse el reinicio completo de Kairo. En esta comprobación no se cambian
servicios ni se crean, actualizan o cancelan correos.

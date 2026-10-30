# Gestify y Kairo: funcionamiento y límites

Contrato revisado el 30/10/2026 sobre v527. Describe el sistema instalado;
las comprobaciones y límites pendientes se distinguen al final.

## Qué guarda cada parte

| Parte | Datos y responsabilidad |
| --- | --- |
| Gestify, en cada dispositivo | Días, horas, vacaciones, festivos, ausencias y configuración de correo. Caché local de estados confirmados e identificadores de trabajos. |
| Kairo, servicio de horas | SQLite privado: últimos estados verificados por cuenta/mes (`status_facts`), trabajos y resultados (`jobs`), revisiones y diario por semana (`plans`, `weeks`). |
| Chromium de Kairo | Perfil persistente con la sesión iniciada en Outlook de Excelia. El adaptador utiliza su interfaz web. |
| Outlook de Excelia | Correos enviados y programaciones realmente aceptadas. Es la comprobación definitiva para las horas. |
| Kairo, facturación | Bases propias de preparaciones, aprobaciones, emisión y envío. Home consulta su registro; no busca la factura en Outlook de Excelia. |

La caché de Kairo **ya existe desde v516**. No caduca cada pocos segundos ni
obliga a releer el correo al entrar desde otro móvil. `status_facts` conserva
la última fotografía confirmada de cada mes, no un archivo completo de todos
los mensajes ni una cronología inmutable de cada cambio en Outlook. Los trabajos
y el diario añaden el registro de las operaciones realizadas por la integración.

La caché del móvil y la de Kairo son diferentes. Borrar los datos del móvil no
borra la base de Kairo, pero tampoco recupera automáticamente todos los días y
configuración de Gestify: esos datos personales requieren su backup/importación.

## Al abrir Home

1. Gestify dibuja el mes con sus datos locales y el último estado guardado.
   Abrir Gestify no inicia sesión de Microsoft en el móvil.
2. Si necesita completar la auditoría inicial, solicita a Kairo los meses
   anterior, actual y siguiente. Tailscale identifica al propietario; el servicio
   valida además el origen de Gestify. El USB no interviene.
3. Kairo devuelve inmediatamente los meses ya confirmados en SQLite. Solo los
   periodos que faltan requieren una nueva lectura en Chromium. La petición se
   acepta como trabajo en segundo plano y el móvil consulta su progreso ligero.
4. La lectura debe acreditar la cuenta correcta y un inventario completo. Kairo
   guarda el resultado y Gestify conserva una copia local con fecha de consulta.
   Un fallo mantiene el último resultado; nunca inventa que una semana se envió.

Navegar, recuperar el foco, recargar o modificar horas no provocan por sí solos
un barrido de Outlook. El histórico anterior al mes previo queda cerrado para
las comprobaciones automáticas. Al cambiar el mes real se completa únicamente
el periodo nuevo que falte.

`Actualizar estado` consulta a petición el mes visible: relee Outlook para las
horas y consulta la base de facturación para la factura. Alcanzar una fecha
programada permite una comprobación puntual de entrega. Cambios realizados
directamente en Outlook se descubren al refrescar, no en tiempo real.

## Al programar correos de horas

1. La revisión individual y `Programar pendientes` comparten las reglas. El lote
   abarca las semanas del mes visible y dos semanas completas posteriores.
2. Gestify envía una propuesta con días, horas y destinatarios de `Correo de
   horas`. Kairo contrasta la propuesta con Outlook y muestra las diferencias.
3. Una semana enviada se conserva. Una programada idéntica también. Si cambian
   los datos, se requiere aprobar la actualización del mismo correo existente,
   conservando su identidad y destinatarios. La identidad de la semana es su
   lunes, independientemente del día elegido para enviar.
4. Al confirmar, Kairo vuelve a comprobar Outlook bajo un bloqueo y reserva la
   semana en su diario antes de escribir. La caché rápida no sustituye esta
   comprobación. Se verifica también el resultado de cada programación.
5. El trabajo aceptado continúa aunque cierres Gestify. Repetir una confirmación
   recupera el mismo trabajo. Tras una interrupción, una escritura incierta se
   deja para revisión; no se repite automáticamente.
6. Una vez que Outlook acepta la programación, su entrega depende de Outlook.
   No requiere dejar Gestify abierto ni mantener Kairo encendido a esa hora.

Se programa a las 08:00 de Madrid del último día realmente trabajado de lunes
a viernes. Si toda la semana son vacaciones/festivos, se escoge el último de
esos días que no sea festivo. Sin fecha válida o con hora ya vencida, queda
pendiente para decidir. La semana anterior debe estar enviada o programada.
No hay una tarea mensual que pulse el botón ni confirme el lote por su cuenta.

El botón azul abre el envío manual en Outlook; no acredita que se haya enviado.
`Desmarcar` desbloquea la edición local y no cancela una programación remota.

## Facturas

«Enviar factura» fija el mes elegido en Home, sin selector adicional. Abre el
cálculo primero y sitúa el calendario bajo Enviar a Kairo/Consultar estado.
Se retiran los enlaces finales de configuración y JSON; los datos se ajustan
desde Ajustes → Facturas y correo. Muestra V/F/A y sus colores, sin eventos. Reutiliza
el calendario local y la caché confirmada, sin añadir consultas de red al abrir.
El borde discontinuo significa fecha prevista; el continuo, programada en Kairo.
Las enviadas no inventan una fecha de envío si el servicio no la proporciona.
El cálculo económico queda abierto y se puede plegar. Consultar estado o volver del circuito
de Kairo actualiza el calendario cuando llega una nueva respuesta confirmada.

En Kairo, «Preparar borrador» comprueba y guarda los datos recibidos desde
Gestify. No aprueba la emisión: el propietario revisa el PDF y confirma después.
Cada mes conserva su propio plan, aprobación y fecha: noviembre y diciembre
pueden quedar programados simultáneamente. Las acciones identifican la revisión
vigente del mes y comprueban su huella; preparar o cancelar otro mes no la sustituye.
Los cambios en una factura requieren revisar y aprobar de nuevo ese mes.
El proceso recorre los planes por fecha y conserva las ventanas de emisión y envío.
Una emisión incierta impide iniciar otra hasta conciliarla; no cancela ni borra
las demás aprobaciones. Los correos de facturas ya emitidas pueden completarse.
Los avisos de entrega mantienen una identidad independiente para cada mes.

La revisión de horas incorpora un calendario de las semanas seleccionadas y
sus fechas de envío. Distingue lo ya programado de lo propuesto, muestra V/F/A
también en fines de semana y permite ver los meses limítrofes y las dos semanas
extra. Los días de envío proceden de la conciliación existente; el calendario
no los recalcula, consulta ni programa. Una modificación de fecha conserva la
actual hasta que se seleccione explícitamente actualizar esa semana.

Consultar Home es de solo lectura: pide el estado del mes al servicio de
facturación de Kairo, que lee sus bases existentes. Puede mostrar programada
con su fecha confirmada, enviada, sin enviar o una incidencia por revisar.
Consultar no prepara, emite, aprueba ni envía una factura.

Preparar/enviar la información de la factura es otra acción. Kairo conserva su
propio circuito de revisión y aprobación; Home refleja el resultado confirmado.
La fecha prevista es el día 20 o el laboral anterior. Si el calendario local y
la fecha aprobada en Kairo difieren, se avisa para revisarlo; no se cambia una
factura aprobada a escondidas. Este circuito no depende de la sesión de Outlook
utilizada exclusivamente para los correos de horas.

## Sesión de Outlook y recuperación

Estado comprobado: perfil privado con permisos 700; base de horas con permisos
600; servicio de horas activo y habilitado; navegador permanente habilitado al
arranque; usuario con `linger`. El navegador actual sigue en la unidad temporal
anterior para conservar la sesión. No se arranca otro sobre ese mismo perfil.
El reinicio del servicio de horas y la persistencia de su estado se comprobaron;
no se ha ensayado un reinicio completo de Kairo con Outlook.

Chromium conserva el perfil y los servicios pueden reiniciar sus procesos ante
fallo. El recuperador con credenciales cifradas de systemd está activo después
de que el propietario introdujese el secreto por SSH. El primer reingreso real
ha abierto el buzón correcto y alcanzado `ready`, sin MFA en ese intento. Las
instrucciones y el procedimiento de eliminación están en
[Reingreso de Outlook con secreto privado](../tools/kairo/OUTLOOK-AUTH.md).

Microsoft permite sesiones persistentes, pero la organización puede exigir
reauthenticación o MFA y revocar la sesión. Una contraseña guardada puede servir
para rellenar el primer factor; no garantiza resolver esos otros requisitos.
Fuente: [Microsoft, duración y reautenticación de sesiones](https://learn.microsoft.com/en-us/entra/identity/authentication/concepts-azure-multi-factor-authentication-prompts-session-lifetime).

El secreto se introduce directamente en Kairo, fuera del chat, del repositorio y
de Gestify. Solo se utiliza ante un formulario de acceso reconocido, con un intento
acotado; una contraseña rechazada, MFA o una pantalla desconocida detienen la
recuperación. El aviso aparece en Home al consultar el estado de acceso. La
programación pendiente debe volver a conciliarse tras recuperar el acceso.

«Comprobar acceso» solicita al recuperador una revisión acotada; no relee
simplemente el aviso anterior. Puede continuar una pantalla antes desconocida
si ahora reconoce el formulario de Microsoft. MFA y contraseñas rechazadas
siguen detenidas. El aviso se consulta al entrar/volver y durante esa petición,
sin un temporizador permanente en Home.

«Actualizar estado» crea un trabajo de lectura en Kairo y muestra su progreso.
Al completarse, conserva la fecha nueva del mes comprobado. Si falla, muestra
la hora del intento y una causa concreta, manteniendo por separado la fecha y
los datos de la última comprobación correcta. Una lectura incompleta tampoco
produce una revisión de programación aparentemente correcta.

## Comparación local de cambios

Las semanas programadas comparan días, horas, fecha prevista y configuración con la última
confirmación guardada. Las facturas conservan identidad, huella de contenido y
revisión; Home compara el calendario y la configuración actuales con la
preparación guardada. Estos avisos no necesitan consultar servicios externos.
Una factura enviada o aprobada conserva su estado y su versión aunque se señalen
cambios locales. No se sustituye ni se vuelve a enviar automáticamente.
Las semanas ya enviadas se conservan; el control de actualización automática se
aplica a las programaciones. No se reabre ni se manda otra semana enviada por
haber cambiado el calendario local.

La corrección de septiembre de v518 recupera una vez la caché de Kairo cuando
el mes previo contiene una ausencia antigua en el móvil. No marca enviada una
semana por su antigüedad ni fuerza un barrido de Outlook: incorpora la lectura
verificada más reciente que ya conserva Kairo.

## Consecuencias que conviene tener presentes

- Lo confirmado se puede consultar desde caché aunque Outlook haya caducado.
  Eso acredita la última consulta, no que la sesión siga válida ahora mismo.
- Crear, actualizar o refrescar horas necesita Kairo disponible, Internet,
  Tailscale y sesión válida. Un fallo conserva el estado anterior y no convierte
  una fecha vencida en un envío inmediato.
- Las bases privadas de Kairo y el perfil del navegador quedan fuera de Git y
  del backup JSON del móvil. Su recuperación requiere copia privada en Kairo.
  No borrar el diario contra duplicados para resolver una incidencia.

Implementación: `js/hours-cache.js`, `js/hours-jobs.js`, `js/invoices-home.js`,
`tools/kairo/hours_service.py`, `hours_jobs.py`, `hours_store.py` y
`home_invoice_status.py`. Reglas técnicas e historial: [HOURS.md](../tools/kairo/HOURS.md).

## Comprobación del 30/10/2026 y pendientes

- Servicios de horas, Chromium, recuperación de Outlook y facturación activos;
  temporizador fiscal esperando su siguiente ejecución. Acceso Outlook `ready`
  a las 15:14 de Madrid. No se ha forzado un cierre de sesión ni MFA.
- Consulta HTTPS de horas por la ruta utilizada por Gestify (`background=1`):
  HTTP 200 en 156 ms desde caché. Octubre comprobado a las 15:13: cinco semanas
  enviadas y dos programadas. La lectura completa previa actualizó esa caché;
  no se interpreta la latencia de caché como duración de un barrido de Outlook.
- Consulta HTTPS de factura de noviembre: HTTP 200, borrador sin aprobar ni
  programar. Octubre consta enviado. Las facturas consultan las bases propias
  de Kairo; no el buzón Outlook usado para las horas.
- La programación real de horas y modificación del mismo mensaje ya se probaron
  en v511 con un correo de prueba, posteriormente cancelado; el detalle está en
  HOURS.md. No se repite una escritura real para validar este calendario.
- Actualización v527: el propietario ya aprobó noviembre para el 20/11/2026.
  Se habilitan varias programaciones mensuales y se conserva esa aprobación.
  Las pruebas usan SQLite temporal y transportes ficticios; no emiten facturas.
- Pendientes: completar el circuito fiscal real de noviembre en su fecha;
  probar un reinicio completo del equipo Kairo; clave de paso aplazada.
  Reiniciar el servicio y las pruebas no acreditan una entrega futura real ni
  garantizan todas las sesiones futuras de Microsoft.

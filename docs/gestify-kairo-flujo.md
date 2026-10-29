# Gestify y Kairo: funcionamiento y límites

Contrato revisado el 29/10/2026 sobre v518. Describe el sistema instalado;
las propuestas de autenticación pendientes se distinguen al final.

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
fallo. Se ha preparado el recuperador con credenciales cifradas de systemd;
permanece inactivo hasta introducir la contraseña directamente en Kairo. Las
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

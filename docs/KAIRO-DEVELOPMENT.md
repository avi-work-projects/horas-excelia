# Conexión de preparaciones Gestify → Kairo

## Hallazgos iniciales y alcance histórico

La sección v527 al final sustituye el límite inicial de un único plan activo.

El servicio privado existente autentica al usuario mediante Tailscale Serve,
valida Host y exige Origin propio + X-CSRF para los POST. Fuera de la consulta
de solo lectura v509 descrita al final, no ofrece CORS para GitHub Pages. Su `/upload` importa con `import_json`, que puede enviar un correo
de revisión. Mantiene un único plan activo. El importador ya verifica las huellas
y rechaza revisiones distintas de una operación existente: no se sustituye por
otro importador ni se añade una base de datos paralela.

La integración transmite la preparación mensual existente; no el CSV anual de
Imputaciones. No cambia cálculos, PDF, fechas fiscales ni el runner mensual.
No hay operaciones de emisión, aprobación, correo ni impuestos en el puente.

## Transporte y seguridad

1. Configurar `kairoUrl` en Facturas y Correo, solo cuando el receptor esté activo.
   Debe ser HTTPS en un host `.ts.net`, ruta `/facturas/`, sin claves, query ni
   fragmento. Empieza vacío; se conserva en el backup y export de configuración.
2. Enviar abre `/facturas/gestify` mediante un gesto del usuario. El receptor se
   sirve con la autenticación existente. Para enviar preparaciones la PWA no hace fetch a una red privada:
   intercambia mensajes con esa ventana, validando origen exacto, ventana e ID
   aleatorio; la preparación nunca viaja en la URL. No se habilita CORS.
3. El receptor solo acepta el origen configurado de GitHub Pages y su opener.
   Muestra el mes y permite recibirlo. Su POST ocurre en el propio origen de
   Kairo y conserva CSRF e identidad. La confianza es por **origen**, no por ruta:
   otros proyectos del mismo dominio GitHub Pages comparten origen. La
   confirmación en Kairo es también una barrera frente a una petición inesperada.
4. El adaptador usa el validador existente y llama al importador con
   `notify_review=False`. El camino manual `/upload` conserva su comportamiento.
   Recibir desde Gestify nunca manda el correo automático de revisión.
5. Consultar devuelve solo identidad de operación, hash, mes y estado. No devuelve
   datos fiscales, credenciales ni una URL arbitraria. La revisión desde Gestify
   abre `/facturas/gestify-month?period=YYYY-MM`, conservando el mes seleccionado.
   El histórico y la revisión extensa anterior siguen disponibles en Kairo.

No usar `noopener` en esta ventana de transporte: necesita el opener para el
intercambio. Solo se abre el destino privado validado y configurado por el usuario.
Un navegador que suprima el opener (por COOP o políticas de PWA) no recibirá datos;
el intento quedará sin confirmar. No se relajan protecciones para solucionarlo.

## Duplicados, incertidumbre y revisiones

- Mismo operationId/hash/revisión ya importado: devuelve estado sin reimportar.
- Respuesta perdida o ventana cerrada: conserva `pending`, no afirma recepción.
  Consultar después recupera el estado desde borradores/planes existentes.
- JSON o huellas inválidos: rechazo antes de cambios persistentes.
- Cambio de contenido: invalida aprobaciones del mes y devuelve `blocked`.
  Conserva el borrador y exige conciliación manual; el importador actual no admite
  sustituirlo automáticamente. No se ha construido un editor fiscal paralelo.
- Mes emitido o cualquier emisión/correo activo o incierto: no importa otro
  contenido. Otro mes aprobado tampoco se reemplaza.
- Los estados son una **última consulta** al registro del servicio, no una nueva
  comprobación en AEAT ni una promesa de estado en tiempo real.
- Configurar Kairo oculta el circuito manual de PDF/Gmail. Tras un intento, el
  marcador mensual mantiene ese bloqueo aunque se quite la URL. Evita ofrecer un
  segundo envío cuando Kairo puede haber recibido la preparación.
- La preparación y el resto de la PWA siguen funcionando offline. El JSON
  descargable continúa disponible como alternativa de importación manual; su uso
  debe revisarse en Kairo, donde el upload antiguo puede mandar correo de revisión.

## Preparación del candidato privado

Código público y sin datos personales: `tools/kairo/gestify_bridge.py`,
`receiver.js` y `prepare_candidate.py`. Este último lee una copia autorizada del
servicio y crea **un directorio nuevo** con `service.py` parcheado y el adaptador.
No copia configuración, bases de datos, certificados, PDFs ni credenciales.
No instala, ejecuta ni reinicia nada. Falla si los puntos de inserción han cambiado.

```text
python tools/kairo/prepare_candidate.py RUTA_COPIA_SERVICIO DESTINO_PRIVADO_NUEVO
```

No añadir el candidato privado a Git: el servicio original contiene configuración
personal. El parche añade una ruta GET autenticada y una ruta POST bajo las mismas
comprobaciones y los mismos bloqueos MUTEX/process_lock. Con `gestify_origin`
ausente en la configuración privada devuelve 404. Su valor futuro será el origen
HTTPS exacto de la PWA, sin ruta; nunca `*`. No se cambian ACL ni puertos.

## Verificación y activación pendiente

```text
npm test
python tools/kairo/test_bridge.py
python tools/kairo/test_candidate_http.py RUTA_CANDIDATO_PRIVADO/service.py
npm run build
npx playwright test tools/browser/invoices-kairo.spec.js tools/browser/invoices.spec.js
```

Python usa SQLite temporal e importador simulado: recepción, repetición, pérdida
de respuesta, estado ausente, JSON inválido, rechazo del validador, revisión nueva,
mes emitido y correo pendiente. Edge headless usa HTTPS interceptado y datos
sintéticos; prueba transporte real entre ventanas, sin red, respuesta perdida,
cierre, consulta, URLs y ausencia del circuito Gmail paralelo. Las capturas móviles
se revisan en tema claro e iconos Profesional. No son una prueba del móvil real ni
una emisión de preproducción en FacturaScripts. Las pruebas existentes de huellas
comprueban el JSON con `node:crypto`.

El test del candidato carga sus definiciones sin arrancar el servicio y sustituye
almacenamiento/importador por dobles temporales. Verifica que identidad, Host,
Origin y CSRF sigan siendo obligatorios, que la ruta esté desactivada por defecto
y que un POST autenticado llegue al adaptador. No prueba fechas ni el runner;
usa una zona horaria sintética para no requerir tzdata en Windows.

Antes de activar, en otro encargo autorizado:

- Comprobar que no haya correo pendiente ni plan activo que se deba conservar;
  no sustituir ni modificar octubre de 2026 como parte de esta integración.
- Revisar el diff del candidato frente al servicio vigente, probarlo en un entorno
  aislado con su validador/importador real y sin SMTP ni emisión habilitados.
- Instalar el adaptador y configurar el origen bajo autorización de despliegue;
  no reemplazar las bases de datos o la configuración completa.
- Publicar la PWA solo con autorización y configurar su URL privada. Probar desde
  la PWA instalada en el Vivo, con Tailscale: apertura, identidad Serve, opener,
  CSRF, red ausente y retorno de estado. No se ha probado todavía ese recorrido
  real GitHub Pages → Tailscale móvil.

El proceso mensual sigue dependiendo de los scripts, servicios y temporizador
existentes de Kairo; no necesita Codex ni una IA cada mes.


## Activación autorizada del 12/10/2026

Receptor instalado sobre la versión vigente del servicio, con copia privada para
reversión. Solo se reinició el servicio web; temporizador y datos conservados.
Origen exacto de la PWA configurado, sin CORS ni acceso público añadido.
Pruebas: npm test; 9 pruebas Edge; 9 del adaptador y 4 HTTP; consulta HTTP real
con autenticación/CSRF y rechazo de identidad/origen inválidos. La repetición de
la fuente ya registrada pasó dos veces por el validador real, sin reimportación.
Comparación de tablas, plan/aprobación y PDFs antes/después: sin cambios.
No hubo emisión ni correo. No se probó aquí crear una factura nueva con el
importador real: el plan emitido con correo pendiente bloquea esa operación.

Acceso en la PWA: Enviar Factura → Edición facturas y correo → Conexión privada.
Editar y guardar la URL privada facilitada al propietario; volver a Enviar Factura.
Aparecen Enviar a Kairo y Consultar estado (solo consulta si hay PDF final local).
Primera prueba móvil: Tailscale activo, consultar octubre. Si los datos locales
coinciden, devuelve factura emitida/correo pendiente; si no, conserva otra versión.
No modificar octubre ni preparar un mes ficticio en el servicio de producción.
El recorrido real con el opener de la PWA instalada sigue pendiente del móvil.


## Corrección de restauración y pantalla de consulta (v463)

La revisión local aumenta al editar y deshacer; no pertenece a contentHash.
Tras validar íntegramente el JSON, mismo operationId/hash/mes es una repetición
sin cambios, aunque tenga mayor revisión. Nunca modifica la revisión fiscal,
aprobación o plan original. Contenido diferente mantiene los bloqueos existentes.
La ruta status ya devolvía antes de validar la revisión; el antiguo error
«Revisión inconsistente» solo existía en prepare. Las capturas no permiten
confirmar qué acción originó la segunda petición; no atribuirlo a una emisión.

El receptor usa receiver.html + receiver.js: mes, modo consulta/recepción,
estados en español, retorno a Gestify y acceso a la programación. La regla
[hidden] prevalece sobre estilos de botones; consulta no muestra ni engancha
el botón de recibir. Instaladores deben copiar también receiver.html.
Regresiones: editar/restaurar un día, revision+2 con hash original, consulta sin
importaciones, recepción idéntica tras restaurar, aprobación conservada, hash
inválido rechazado. Pruebas del navegador usan la plantilla real, no una página
sustituta; capturas a 320/393/412/1024 px.

## Consulta mensual de Home v509 (26/10/2026)

`home_invoice_status.py` reutiliza el catálogo existente, que abre SQLite con
`mode=ro`. `GET /facturas/gestify-status?period=YYYY-MM` devuelve únicamente mes,
estado, indicadores de preparada/emitida/programada/enviada y fecha programada.
No expone números, importes, contactos, documentos, huellas fiscales ni claves.
Varias facturas en un mes requieren revisión; una base no disponible devuelve
503, nunca una falsa ausencia de factura.

Esta es una excepción de lectura a la ausencia de CORS del transporte original:
se exige la identidad y Host existentes y `Origin` igual a `gestify_origin`.
Solo se autoriza GET; OPTIONS acepta exclusivamente ese método y origen,
incluida la negociación de red privada cuando el navegador la solicita. No
se permiten credenciales CORS, comodines ni cabeceras arbitrarias. Respuestas
sin caché. Los POST, CSRF, X-Frame-Options y aprobación/emisión/correo mantienen
el código anterior, comprobado también por el preparador del candidato.

`prepare_home_status.py` prepara una copia con las dos rutas de lectura; rechaza
inserciones duplicadas y verifica por AST que POST, identidad y cabeceras no
cambien. El receptor requiere el `invoice_catalog.py` ya instalado. No necesita
configuración, puerto, identidad ni temporizador nuevos.

Activación realizada sobre el servicio vigente tras comparar su hash. Copia
privada para reversión y reinicio solo del servicio web. Hashes lógicos de las
tres bases, configuración y estado del runner antes/después: idénticos.
Una consulta real coincide con el registro, sin emitir ni reenviar nada. GET real 200,
origen ajeno 403. Edge desde el origen público confirma la lectura tras conceder
permiso de red local en un perfil de prueba efímero; sin permiso la petición se
bloquea y Gestify conserva estado sin confirmar. La primera autorización del
navegador del móvil corresponde al usuario.

Pruebas: `python tools/kairo/test_home_status.py`, incluidas en CI, y
`tools/browser/home-invoice-status.spec.js`. Los fixtures son ficticios.


## Home compacto y revisión por mes (v521)

Responsabilidades: Home representa los hechos de caché existentes; el selector
prepara el mes indicado sin cambiar el mes de Home; la revisión privada solo
lee planes y delega las acciones en los POST existentes. No cambia fórmulas,
conciliación de Outlook, vencimientos, importador, aprobación ni runner fiscal.

`invoice_month_review.py` y su plantilla reciben un período obligatorio y buscan
su último plan. Un mes sin preparar no muestra la factura de otro mes. Los planes
históricos son de consulta; solo el plan actual puede ofrecer aprobación o
cancelación, manteniendo hash exacto y segunda confirmación. El PDF usa la ruta
privada inmutable por ID de plan. Los detalles del correo permanecen disponibles.

`prepare_month_review.py` añade únicamente el GET autenticado. Comprueba mediante
AST que ninguna función salvo do_GET haya cambiado, y rechaza puntos de inserción
inesperados. La instalación copia la plantilla, módulo y receptor, además del
servicio parcheado, con copia privada previa y sin reemplazar datos/configuración.

Límite conservado: Kairo ejecuta un único plan fiscal activo. Se puede preparar
noviembre en octubre cuando octubre está enviado, pero otro mes ya aprobado o
con correo pendiente bloquea sustituirlo. Esta entrega no promete varias facturas
aprobadas simultáneamente; eso requiere ampliar el runner y su modelo de planes.

Validación: resumen cerrado/abierto con tipografía idéntica a 320/400/440 px;
selector octubre → noviembre, transporte e idempotencia; revisión compacta a
320/400 px, confirmación y rechazo de versión; SQLite sintético conserva el
histórico y bloquea otro mes aprobado; ruta HTTP mantiene identidad/Host/CSRF.
Sin emisión fiscal ni programación real como parte de las pruebas.

Activación del 30/10/2026: instalada la ruta y las pantallas; servicio activo.
GET privado de octubre devuelve enviada; noviembre devuelve no preparada,
sin ofrecer acciones sobre octubre. Sin identidad responde 403. La huella de
todos los registros de planes antes/después permanece idéntica. Copia privada:
`backup-v521-20261030-134346`. No se ejecutaron POST de aprobación/cancelación.


## Proyecto con vigencia mensual (v522)

El propietario confirmó un cambio de proyecto desde noviembre de 2026 para
los meses siguientes. La configuración privada conserva el proyecto base y añade
`project_periods`, un diccionario mes inicial → proyecto autorizado. Sus valores
reales permanecen solo en Kairo. El último inicio anterior o igual al mes recibido
es el aplicable; sin regla se conserva el proyecto base. Los borradores nunca
pueden autorizar por sí mismos un proyecto nuevo.

`project_periods.py` separa esta comprobación de las comparaciones estrictas de
emisor, cliente e IBAN. `prepare_project_periods.py` solo cambia el punto de
validación en `engine.target`; preserva las demás funciones por comparación AST.
No cambia importación/idempotencia, importes, emisión, aprobación ni correos.

Verificación: límites octubre/noviembre, años futuros, configuración antigua,
proyecto incorrecto, reglas inválidas e identidad/cuenta distintas. En la fuente
real pendiente, emisor, cliente e IBAN coincidían; la discrepancia era el proyecto.
Instalación con copia privada `backup-v522-20261030-141658`; planes y aprobaciones
sin modificar. La preparación real se hace desde Gestify en Vivo Sesiones y
la aprobación de emisión/envío queda en manos del propietario.

No se regeneran capturas: no hay cambios de estructura visual. Se conserva
la revisión v521; v522 cambia la validación privada y la etiqueta de versión.


## Proyecto sincronizado desde Gestify y correo exacto (v523)

El editor de Facturas y Correo permite guardar código y mes «Aplicar desde».
La acción explícita `project` utiliza el mismo receptor autenticado, origen,
ventana, identificador, CSRF y bloqueo del proceso que el puente existente.
No autoriza el proyecto a partir de un borrador recibido: solo al guardar
la configuración. No añade rutas de emisión, aprobación ni correo.

`project_settings.py` incorpora una vigencia a `settings.json` mediante escritura
atómica privada, conservando todas las demás claves y las reglas posteriores.
Rechaza meses pasados, conflictos con la configuración conocida y cualquier
cambio efectivo de proyecto en meses con planes o borradores ya registrados.
La repetición exacta devuelve la configuración sin escribir de nuevo. No toca
bases, PDF, fuentes fiscales, aprobaciones ni cuerpos de correo.

Gestify conserva base y vigencias en la configuración del backup existente.
Calcula el proyecto efectivo también en operationId; el código del formulario
no cambia retroactivamente los meses anteriores. Antes de solicitar la escritura
conserva `projectPending` y su destino. Una respuesta perdida bloquea preparaciones
nuevas afectadas y permite reintentar; una respuesta explícita de rechazo libera
el intento para corregirlo. El rechazo por configuración desfasada recupera las
vigencias de Kairo para poder resolverlo desde Gestify, sin editar dos sistemas.
Sin conexión no cambia la configuración. Los ajustes ajenos al proyecto no abren
Kairo ni crean consultas periódicas.

«Ver correo» representa únicamente destinatarios, asunto y body del plan. Se
elimina el desglose que antes se dibujaba debajo del mensaje en la revisión.
El envío real ya usaba exactamente `plan['body']`; nunca añadía aquel desglose.
Los importes continúan en el PDF. No se cambia ningún mensaje existente.

Comprobaciones: vigencias y huellas, conservación de meses/backups, rechazo de
facturas preparadas, reintento idempotente, fallo de disco, pérdida de respuesta,
conflicto entre dispositivos, offline y vistas móviles. Actualización privada con
copia `backup-v523-20261030-145736`, conservando las siete filas de planes y la
configuración. Solo se añaden tres ejemplos ficticios al mapa; el atlas anterior
se conserva. Ninguna prueba autoriza la emisión o envío de noviembre.

## Cuerpo del correo en su propio panel (v525)

En «Ver correo», Para y Asunto permanecen fuera del nuevo recuadro «Contenido
del correo». Solo se modifica el render de `invoice_month_review.py` y su CSS:
el cuerpo conserva su escape HTML y saltos de línea. No cambia el plan, los
destinatarios, el contenido enviado ni las acciones de aprobación/cancelación.
Se comprueban la vista móvil a 320/400 px y los contratos existentes de revisión.
El mapa conserva sus capturas y añade únicamente este ejemplo de Kairo.

Instalado con copia privada `backup-v525-20261030-mail-panel`. Servicio activo,
GET real de noviembre HTTP 200 con el panel separado y pendiente de aprobación.
La huella de las siete filas de planes permanece idéntica antes/después.

## Calendario de horas y acción comprensible (v526)

`receiver` llama «Preparar borrador» a la recepción validada; no cambia sus
POST, guardas ni estados. `hours_receiver` dibuja el mes a partir de la revisión:
fechas confirmadas frente a propuestas, selección individual/lote, V/F/A y
semanas adicionales. Los cambios de fecha siguen la casilla de actualización.
Gestify adjunta `calendarDays` como información visual de exclusiones, incluidos
fines de semana, sin alterar los cinco días del correo ni su huella de contenido.
No se cambia el modelo, el escritor Outlook ni los trabajos de Kairo.
Los cuatro archivos de presentación se leen en cada GET: se instalan con copia
privada sin reiniciar servicios ni interrumpir las pruebas del propietario.

Instalados con copias `backup-v526-20261030-calendars` en ambos servicios.
Los GET privados de facturas y horas responden HTTP 200 con las nuevas vistas.
La consulta de noviembre de 2026 conserva `scheduled`, con fecha 20/11/2026;
esta programación ya había sido aprobada por el propietario. Las pruebas de
esta entrega usan datos ficticios y no aprueban ni programan correos reales.

## Planes independientes por mes (v527)

`invoice_plans.py` selecciona la última revisión de cada mes sobre `plans`, sin
otra base ni migración de datos. `load` admite mes/id; aprobar/cancelar resuelve
id y huella y rechaza revisiones sustituidas. Clientes antiguos con solo huella
siguen funcionando si esta identifica una única revisión vigente. Las escrituras
de estado requieren id; los antiguos scripts de un solo plan fallan si son ambiguos.

`prepare_multi_invoice.py` genera un candidato privado con puntos exactos y
compara el AST de las funciones no afectadas. Cambia selección en importación,
revisión, aprobación, cancelación, transición y runner. Conserva autenticación,
CSRF, bloqueos de proceso, validador, importador fiscal, PDF, SMTP y sus diarios.
Las rutas de revisión e histórico apuntan al mes correcto; los POST añaden planId.

El runner recorre las revisiones vigentes por fecha bajo el bloqueo existente.
Cada transición lleva su id. Un resultado incierto no se reintenta ni permite
otra emisión, pero no invalida aprobaciones ajenas ni impide entregar un PDF ya
emitido. Las ventanas 07:30/08:00 se conservan. Los avisos de resultado se acotan
a los planes atendidos y no reenvían notificaciones históricas al actualizar.

`invoice_monitor.py` separa las alertas por mes, conserva el UUID/slug del aviso
existente y añade una identidad propia a los nuevos planes aprobados. Guardar
un borrador no arma una alerta. Se conserva la alerta de disponibilidad.

Validación: selección/id/huella, dos meses aprobados, cancelación aislada,
revisión de un mes anterior al último creado, fechas, persistencia tras recarga,
errores inciertos, idempotencia, monitor y contratos HTTP. El candidato real se
carga en pruebas con bases temporales, transportes ficticios y sockets prohibidos;
no se copian datos privados ni código con configuración personal a Git.

El mapa conserva las capturas v526: no cambia la estructura visual. Se documenta
que las mismas acciones funcionan ahora para cada mes independiente.

Instalación: copia privada `backup-v527-multiple` (código y bases), comparación
de huellas y sustitución bajo el bloqueo existente. Se reinició únicamente
facturación y se reanudaron sus temporizadores; Outlook/horas permanecieron activos.
Las siete filas de planes, aprobaciones y diario de correos quedaron idénticas.
Consultas HTTPS: octubre enviado, noviembre programado para 20/11/2026, diciembre
sin preparar. Revisión, histórico y monitor HTTP 200. No se creó ni aprobó una
factura real de diciembre como prueba.

Pruebas del candidato: 11 escenarios multi-mes y 27 regresiones del runner
anterior con transportes ficticios; 7 pruebas del modelo/monitor, contratos de
puente/HTTP y revisión, y 8 recorridos de navegador afectados. Las dos pruebas
antiguas de descripción de conceptos pertenecen al motor sin cambios y no se
duplicaron en el candidato. La batería completa de la PWA se ejecuta en CI.

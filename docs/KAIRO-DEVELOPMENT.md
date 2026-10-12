# Conexión de preparaciones Gestify → Kairo

## Hallazgos y alcance

El servicio privado existente autentica al usuario mediante Tailscale Serve,
valida Host y exige Origin propio + X-CSRF para los POST. No ofrece CORS para
GitHub Pages. Su `/upload` importa con `import_json`, que puede enviar un correo
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
   sirve con la autenticación existente. La PWA no hace fetch a una red privada:
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
   datos fiscales, credenciales ni una URL arbitraria. La revisión sigue en
   `/facturas/`, con las cuatro pestañas y aprobación de versión exacta existentes.

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

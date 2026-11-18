"""Plain-language guide for the local app; rendering has no side effects."""


def render_help():
    return '''<section class="local-page help-page">
<div class="eyebrow">GUÍA DE USO</div>
<h1>Cómo usar tu espacio de trabajo</h1>
<p class="lead">Facturas, programación y contabilidad, conectadas a los mismos motores.</p>

<article class="feature-card">
<h2>Cuando vuelvas</h2>
<p>Abre <strong>Kairo Contabilidad</strong> desde el escritorio del mini. Puedes consultar lo que ya está registrado, añadir documentos o continuar una revisión. <strong>No necesitas tener Codex abierto.</strong></p>
<p class="quiet">Cambiar de sección no recoge facturas ni actualiza el libro. La recogida y la actualización empiezan con una acción tuya; no hay comprobaciones periódicas.</p>
</article>

<div class="help-grid">
<article class="feature-card">
<h2>Para añadir un gasto</h2>
<ol class="help-steps">
<li><strong>Consigue el PDF.</strong> Usa <a href="/recoger">Recoger facturas</a> o descárgalo tú. En Gastos, «Mis carpetas de 2026» abre tus carpetas históricas y «Abrir carpeta de entrada» abre la bandeja para PDF nuevos, donde puedes arrastrarlos desde Descargas.</li>
<li><strong>Importa cuando quieras.</strong> «Importar PDF depositados» los añade a la bandeja y evita duplicados. Abrir la carpeta o dejar allí un archivo no inicia ninguna comprobación. Los documentos reservados para Renta se organizan desde Renta, sin importarlos al IVA.</li>
<li><strong>Revisa el borrador.</strong> En <a href="/facturas/modelos/gastos">Añadir o revisar gastos</a>, compara el PDF con proveedor, número, fecha e importes. Completa los datos que falten y el destino del gasto.</li>
<li><strong>Guarda y aprueba.</strong> Guardar conserva tu revisión. Aprobar solicita que esa versión se incorpore al libro.</li>
<li><strong>Consulta el resultado.</strong> Pulsa «Ver estado de actualización» y, cuando termine, vuelve a cargar la vista. El gasto incorporado aparecerá en «Gastos» y en el Excel actualizado.</li>
</ol>
<p class="quiet">Subir un PDF no lo convierte en gasto aprobado. Si ya existe, se conserva el documento y su revisión sin crear otro gasto.</p>
</article>
<article class="feature-card">
<h2>Ejemplo: los tapones</h2>
<p>Pulsa <strong>«Recoger factura ahora»</strong>. Se buscarán una sola vez los PDF adjuntos a los correos del pedido configurado.</p>
<p>Si se encuentra un documento, quedará en la bandeja para revisar. Si aún no hay PDF, o el correo solo contiene un enlace, la aplicación te lo dirá y podrás abrir el pedido para descargarlo.</p>
<p class="quiet">El botón de Amazon está configurado para el pedido de los tapones. Para otros proveedores y periodos usa los encargos a la IA de la misma pantalla.</p>
</article>
</div>

<article class="feature-card">
<h2>Encargar una búsqueda o lectura a la IA</h2>
<p>En <a href="/recoger">Recoger facturas</a>, elige buscar en correo o procesar la carpeta. Indica proveedor y, para correo, cuenta. Las fechas son opcionales: puedes dejar «Sin límite de fechas», usar «Este trimestre», «Trimestre anterior» o elegir un trimestre y año. «Crear encargo y preparar prompt» guarda esas instrucciones en este mini.</p>
<p>«Abrir en ChatGPT» abre un chat nuevo con el texto preparado; tú lo envías. También puedes copiarlo y pegarlo. La IA necesitará acceso al correo o a los archivos, según el encargo. Kairo no instala un agente que trabaje por su cuenta.</p>
<p>El encargo pide conservar los PDF y registrar su procedencia y los documentos pendientes. Al terminar, «Comprobar resultados» contrasta ese informe con la bandeja y el libro: distingue PDF recuperado, en revisión e incorporado. Un documento encontrado no demuestra que se haya recuperado todo un periodo.</p>
<p class="quiet">La carpeta de entrada conserva los originales. El historial de encargos se guarda en este mini y todavía no se sincroniza con el móvil. Electricidad y gas siguen separados del IVA trimestral, para su revisión en Renta.</p>
</article>

<article class="feature-card">
<h2>Organizar la documentación de Renta</h2>
<p>En <a href="/facturas/modelos?vista=renta">Renta</a> tienes un seguimiento por partidas. «Revisar documentos locales» comprueba los archivos disponibles en el mini. Puedes asignar cada PDF a su partida y preparar una búsqueda en una cuenta de correo, en todas las cuentas configuradas o en la web del proveedor.</p>
<p>«Preparar búsqueda» crea un encargo para el asistente con los documentos ya conocidos. No busca ni descarga por sí solo. La casilla de partida completa la marcas tú cuando hayas revisado la documentación del ejercicio: no aprueba una deducción, no modifica el libro y no presenta la Renta.</p>
<h3>Primera prueba: una factura de Digi de octubre de 2026</h3>
<ol class="help-steps">
<li><strong>Abre Renta y localiza Digi.</strong> Pulsa «Revisar documentos locales» para ver si el PDF ya está disponible.</li>
<li><strong>Prepara la petición.</strong> En la partida Digi, elige buscar en el correo y selecciona una cuenta o todas las configuradas. Pulsa «Preparar búsqueda».</li>
<li><strong>Acota esta prueba.</strong> El encargo de Renta se prepara para 2026 completo; no hay un selector de mes en esa partida. Pulsa «Copiar prompt», pégalo al asistente y añade: «Dentro del ejercicio 2026, recupera únicamente la factura de Digi correspondiente a octubre de 2026. Comprueba antes si ya está disponible, registra el resultado y deja pendiente revisar el resto del año. No marques la partida como completa».</li>
<li><strong>Envía el mensaje cuando quieras iniciar la búsqueda.</strong> El asistente necesitará acceso al correo y al mini. Si falta una sesión, la completarás en la aplicación o web correspondiente; no compartas contraseñas ni códigos en el chat.</li>
<li><strong>Comprueba el documento recuperado.</strong> Cuando el asistente haya registrado su informe, usa «Volver a Renta» y pulsa «Revisar documentos locales». Abre el PDF, confirma que corresponde a octubre y asígnalo a Digi si todavía no está asociado.</li>
<li><strong>Conserva la partida pendiente.</strong> Una factura de octubre no completa Digi para todo 2026. Marca la partida completa únicamente cuando hayas comprobado la documentación necesaria de todo el ejercicio. El año en curso puede seguir incompleto.</li>
</ol>
<p class="quiet">Este recorrido conserva y organiza documentación. Recuperar o asignar un PDF de Renta no crea un gasto de IVA ni inicia una presentación.</p>
</article>

<article class="feature-card help-sections">
<h2>Qué encontrarás en cada sección</h2>
<div class="help-table-wrap"><table>
<thead><tr><th scope="col">Sección</th><th scope="col">Para qué sirve</th></tr></thead>
<tbody>
<tr><th scope="row"><a href="/facturas/modelos?vista=resumen">Resumen</a></th><td>Ver los importes registrados, la cobertura de los datos y el estado de los trimestres.</td></tr>
<tr><th scope="row"><a href="/facturas/">Facturas</a></th><td>Consultar las facturas preparadas, sus PDF y su histórico; revisar y aprobar o cancelar su programación con los mismos controles del móvil. La preparación desde las jornadas sigue entrando desde Gestify.</td></tr>
<tr><th scope="row"><a href="/horas/calendario">Programación</a></th><td>Consultar el calendario de correos y facturas y actualizar su estado a petición. Los correos se siguen preparando y programando desde Gestify; aquí no hay otro editor de esos correos.</td></tr>
<tr><th scope="row"><a href="/facturas/modelos?vista=ingresos">Ingresos</a></th><td>Consultar las facturas de clientes incorporadas al libro y abrir sus originales. La generación de ingresos que ya tenías sigue funcionando.</td></tr>
<tr><th scope="row"><a href="/facturas/modelos?vista=gastos">Gastos</a></th><td>Consultar los gastos registrados. «Añadir o revisar gastos» abre la bandeja de documentos que todavía necesitan revisión o incorporación.</td></tr>
<tr><th scope="row"><a href="/facturas/modelos?vista=libros">Libros</a></th><td>Descargar el Excel de consulta y acceder a archivos anteriores. El Excel se genera a partir del libro; editar una copia no cambia la contabilidad de la aplicación.</td></tr>
<tr><th scope="row"><a href="/facturas/modelos?vista=modelos">Modelos</a></th><td>Consultar el IVA y preparar el 303/390. Desde «Presentar modelos» puedes validar la versión aprobada, confirmar su presentación con el certificado de Windows y conservar el justificante.</td></tr>
<tr><th scope="row"><a href="/facturas/modelos?vista=renta">Renta</a></th><td>Seguir las partidas del ejercicio, revisar y asignar PDF locales y preparar búsquedas asistidas en correo o web. Las comprobaciones y las marcas de partida completa son manuales. Todavía no calcula la declaración, las deducciones ni las amortizaciones.</td></tr>
<tr><th scope="row"><a href="/modulos">Mapa de módulos</a></th><td>Ver cómo pasan los documentos de la recogida a la revisión, al libro y a sus salidas.</td></tr>
</tbody></table></div>
</article>

<article class="feature-card">
<h2>Para presentar un modelo</h2>
<ol class="help-steps">
<li><strong>Prepara el periodo.</strong> Completa la revisión, aprueba el resumen y genera el fichero. La cobertura del trimestre debe estar completa.</li>
<li><strong>Valida en Hacienda.</strong> En <a href="/facturas/modelos/aeat">Presentar modelos</a>, pulsa «Validar modelo». Revisa los errores y avisos. Validar todavía no presenta.</li>
<li><strong>Confirma la presentación.</strong> Comprueba titular, periodo, resultado y modalidad, marca la confirmación y pulsa «Firmar y presentar en Hacienda». El botón permanece deshabilitado si falta algún requisito o el periodo no ha terminado.</li>
<li><strong>Conserva el justificante.</strong> La aceptación y su PDF se guardan en el mini y se incorporan al archivo contable. Si la respuesta queda incierta, consulta ese mismo intento; no lo vuelvas a enviar.</li>
</ol>
<p class="quiet">Para ingreso necesitas el NRC de un pago ya realizado; la aplicación no realiza ese pago. La domiciliación se revisa dentro de la declaración. Presentar y comprobar el cargo bancario son pasos distintos.</p>
<p>El 4T actual todavía está incompleto: solo incluye octubre. Se ha comprobado la validación oficial con datos de prueba y con el fichero histórico del 2T de 2026, sin errores y con un aviso de revisar la información adicional. No se ha vuelto a presentar ese trimestre ni se ha comprobado una presentación real con este conector.</p>
<p class="quiet">La conexión con certificado también está comprobada: el 17/11/2026 a las 20:02, Hacienda devolvió una declaración al consultar el 3T de 2026. Su identificación, CSV, justificante y fecha coinciden con el PDF que ya tienes archivado. Esa consulta no presentó ni pagó nada.</p>
<h3>Cómo cerrar 2026 en enero</h3>
<ol class="help-steps">
<li><strong>Completar los documentos.</strong> Actualizar ingresos y aprobar los gastos revisados del 4T. Resolver los PDF pendientes y las exclusiones; los datos de noviembre y diciembre todavía no están completos.</li>
<li><strong>Revisar el 303 del 4T.</strong> Confirmar cobertura, tratamiento, ajustes y modalidad. Generar, validar y presentar únicamente la versión final que autorices.</li>
<li><strong>Preparar el 390 anual.</strong> Con el justificante del 4T archivado, conciliar los cuatro 303 y revisar el perfil anual. Validar y presentar el 390 por separado.</li>
<li><strong>Archivar y comprobar.</strong> Conservar ambos justificantes y comprobar el cargo o pago cuando corresponda.</li>
</ol>
<p>Los servicios adquiridos a empresas de la UE disponen de un tratamiento específico al 21 %, con deducción completa tras revisión. Antes de incorporar Claude quedan por comprobar los datos NIF-IVA/ROI y la posible obligación del modelo 349. El 349 todavía no se genera desde esta aplicación.</p>
<p class="quiet">Comprobación del 18/11/2026: el validador oficial acepta el ensayo 303 del 4T con servicios UE, sin errores y con avisos informativos que deberán revisarse en el cierre real. Para el 390 devuelve que todavía no encuentra la presentación de 2026. Queda pendiente repetir esa validación cuando esté disponible. Ninguno de esos ensayos ha presentado una declaración.</p>
</article>

<div class="help-grid">
<details class="feature-card">
<summary>Qué hace cada botón</summary>
<dl>
<dt><strong>Recoger factura ahora</strong></dt><dd>Consulta el correo una vez y conserva los PDF encontrados como documentos por revisar. No aprueba gastos ni modifica el libro.</dd>
<dt><strong>Mis carpetas de 2026</strong></dt><dd>Abre tus carpetas históricas de facturas. No las mueve ni vuelve a contabilizar sus documentos.</dd>
<dt><strong>Abrir carpeta de entrada</strong></dt><dd>Abre la bandeja local para PDF nuevos. Dejarlos allí no inicia una importación.</dd>
<dt><strong>Revisar documentos locales · Renta</strong></dt><dd>Comprueba los archivos disponibles y actualiza su seguimiento documental. No consulta correos, no descarga facturas y no modifica el libro ni el IVA.</dd>
<dt><strong>Preparar búsqueda · Renta</strong></dt><dd>Guarda un encargo con la partida, el ejercicio y los documentos conocidos. Copia el prompt o ábrelo en el asistente y envíalo para iniciar el trabajo.</dd>
<dt><strong>Marcar partida completa · Renta</strong></dt><dd>Registra tu comprobación de la documentación del ejercicio. No equivale a revisión fiscal, deducibilidad aprobada ni declaración presentada.</dd>
<dt><strong>Subir archivos</strong></dt><dd>Conserva los PDF seleccionados y crea sus borradores. Detecta los documentos que ya estaban en el libro o en la bandeja.</dd>
<dt><strong>Guardar revisión</strong></dt><dd>Guarda los datos que has revisado en el borrador. El gasto aún no queda incorporado al libro.</dd>
<dt><strong>Aprobar revisión</strong></dt><dd>Aprueba la versión revisada y solicita su incorporación. «Aprobado» puede aparecer mientras el trabajo está pendiente; «Incorporado» indica que terminó.</dd>
<dt><strong>Actualizar datos</strong></dt><dd>Busca nuevos ingresos en la carpeta del flujo existente, incorpora gastos ya aprobados y justificantes pendientes, y regenera los libros y las copias de consulta. No recoge nuevas facturas de Amazon.</dd>
<dt><strong>Ver estado de actualización</strong></dt><dd>Consulta una vez cómo va el trabajo. No lanza otra actualización ni se queda vigilándolo.</dd>
<dt><strong>Volver a cargar esta vista</strong></dt><dd>Muestra la versión disponible en ese momento. No inicia una recogida ni una actualización.</dd>
<dt><strong>Validar modelo</strong></dt><dd>Envía el fichero aprobado al servicio oficial de validación. Muestra errores y avisos, sin presentar la declaración.</dd>
<dt><strong>Firmar y presentar en Hacienda</strong></dt><dd>Envía la versión validada después de tu confirmación expresa, usando el certificado del almacén de Windows. Su clave no se exporta.</dd>
<dt><strong>Consultar resultado / recuperar justificante</strong></dt><dd>Comprueba un intento pendiente y trata de recuperar su evidencia. No vuelve a enviar la declaración.</dd>
<dt><strong>Completar archivo en el libro</strong></dt><dd>Termina de archivar una presentación aceptada cuyo justificante ya está conservado; no la presenta otra vez.</dd>
<dt><strong>Comprobar conexión con Hacienda</strong></dt><dd>Consulta con el certificado el periodo seleccionado. Windows puede pedir permiso para usar la clave. No valida ni presenta un modelo y no ordena un pago.</dd>
</dl>
</details>
<details class="feature-card">
<summary>Cómo interpretar los estados</summary>
<dl>
<dt><strong>Para revisar</strong></dt><dd>Hay un PDF y un borrador. Sus datos y su tratamiento todavía necesitan revisión.</dd>
<dt><strong>Aprobado · pendiente de incorporar</strong></dt><dd>La revisión está guardada, pero falta terminar su incorporación y verificar la copia. Puedes consultar el estado de actualización.</dd>
<dt><strong>Incorporado al libro</strong></dt><dd>La incorporación ha terminado. Su inclusión en el cálculo de IVA depende del destino que se haya revisado para ese documento.</dd>
<dt><strong>En curso / Pendiente</strong></dt><dd>El trimestre todavía no está cerrado o faltan condiciones para obtener el resultado. «Pendiente» no significa que el importe sea cero.</dd>
<dt><strong>Referencia presentada</strong></dt><dd>Es el importe histórico guardado para comparar con el libro. Mostrarlo no inicia una consulta a Hacienda ni acredita un cargo bancario.</dd>
<dt><strong>Validación técnica correcta</strong></dt><dd>Hacienda ha validado esa versión del fichero; todavía falta confirmar su presentación.</dd>
<dt><strong>Resultado pendiente de comprobar</strong></dt><dd>No hay una respuesta concluyente sobre el intento. Consulta su resultado antes de decidir cómo continuar; no se reenvía automáticamente.</dd>
<dt><strong>Presentado · justificante conservado</strong></dt><dd>Se ha recibido la aceptación y un PDF verificable con su CSV. La comprobación del pago sigue siendo independiente.</dd>
</dl>
<p class="quiet">La fecha de «Datos hasta…» indica la cobertura registrada. Una actualización realizada hoy no significa que ya estén completos todos los documentos hasta hoy.</p>
</details>
</div>

<details class="feature-card">
<summary>Qué necesita estar conectado</summary>
<p>El resumen, las tablas, los originales archivados y los libros se leen desde el mini. La bandeja de revisión, la preparación fiscal, la actualización y la recogida del correo utilizan los módulos que ya existen en Kairo, mediante la conexión privada.</p>
<p>Para esas acciones, el mini y el equipo que aloja esos módulos deben estar encendidos y conectados. Si falla la conexión, puedes seguir consultando el archivo local. Antes de repetir una aprobación, comprueba su estado.</p>
<p class="quiet">Hay un solo libro y una sola bandeja de revisión. La aplicación no necesita una conversación con la IA para ejecutar sus botones.</p>
<p>Facturas utiliza su servicio existente y Programación consulta el calendario compartido. No crean otra copia de los planes. Los envíos que ya hayas aprobado para una fecha mantienen esa programación. La contabilidad y la recogida de gastos siguen funcionando bajo petición.</p>
<p>La presentación en Hacienda se ejecuta desde el mini, con su certificado de Windows y conexión a Internet. También necesita la preparación vigente de Kairo. La clave del certificado permanece en el mini; esta función aún no está integrada en la interfaz del móvil.</p>
<p>Si aparece la ventana protegida de Windows, autoriza allí el uso de la clave. No hay que exportarla ni desactivar su protección. Si la petición caduca mientras esperas, comprueba el estado y vuelve a solicitar la consulta manualmente. Una presentación con resultado incierto se consulta, no se reenvía.</p>
<p><strong>Gestify sigue siendo una aplicación independiente.</strong> Conserva la preparación y programación de correos, envía preparaciones de facturas a Kairo y consulta los estados mediante su botón de sincronización. Kairo consulta esos correos; no modifica las jornadas ni la configuración de Gestify.</p>
</details>

<article class="feature-card">
<h2>El siguiente paso</h2>
<p><strong>Completar la documentación del próximo periodo.</strong> La validación y la consulta autenticada ya están comprobadas. Falta incorporar noviembre y diciembre, revisar y cerrar el 4T y aprobar su versión antes de validar y confirmar su primera presentación. Para el 390 harán falta el año completo y los cuatro 303.</p>
<p class="quiet">La descarga directa de un justificante por el conector aún no está comprobada: la consulta histórica devuelve datos identificativos, pero no una URL de descarga. Los justificantes históricos que ya tienes conservan su archivo.</p>
<p>Después podremos llevar el mismo acceso a Modelos al móvil, manteniendo una única fuente de datos y el mini como ejecutor del certificado. La futura integración del bot de Imputaciones seguirá separada de Gestify; la programación de correos continúa en Gestify.</p>
<p>La documentación de Digi, electricidad, gas y otras partidas ya puede organizarse en Renta y buscarse mediante encargos al asistente. El cálculo completo de Renta, las deducciones y las amortizaciones siguen pendientes.</p>
<p class="quiet">Los encargos permiten pedir al asistente que lea documentos y registre información acreditada. La aplicación no ejecuta una IA ni reconoce automáticamente documentos escaneados por su cuenta.</p>
</article>
</section>'''

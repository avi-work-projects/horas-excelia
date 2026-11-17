"""Plain-language guide for the local app; rendering has no side effects."""


def render_help():
    return '''<section class="local-page help-page">
<div class="eyebrow">GUÍA DE USO</div>
<h1>Cómo usar tu contabilidad</h1>
<p class="lead">Conserva las facturas, revisa sus datos y consulta todo desde el mismo sitio.</p>

<article class="feature-card">
<h2>Cuando vuelvas</h2>
<p>Abre <strong>Kairo Contabilidad</strong> desde el escritorio del mini. Puedes consultar lo que ya está registrado, añadir documentos o continuar una revisión. <strong>No necesitas tener Codex abierto.</strong></p>
<p class="quiet">Cambiar de sección no recoge facturas ni actualiza el libro. La recogida y la actualización empiezan con una acción tuya; no hay comprobaciones periódicas.</p>
</article>

<div class="help-grid">
<article class="feature-card">
<h2>Para añadir un gasto</h2>
<ol class="help-steps">
<li><strong>Consigue el PDF.</strong> Usa <a href="/recoger">Recoger facturas</a> o descárgalo tú de la web del proveedor.</li>
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
<p class="quiet">Por ahora, este botón está configurado para el pedido de los tapones. Todavía no recoge todo tu historial de Amazon ni las facturas de otros proveedores.</p>
</article>
</div>

<article class="feature-card help-sections">
<h2>Qué encontrarás en cada sección</h2>
<div class="help-table-wrap"><table>
<thead><tr><th scope="col">Sección</th><th scope="col">Para qué sirve</th></tr></thead>
<tbody>
<tr><th scope="row"><a href="/facturas/modelos?vista=resumen">Resumen</a></th><td>Ver los importes registrados, la cobertura de los datos y el estado de los trimestres.</td></tr>
<tr><th scope="row"><a href="/facturas/modelos?vista=ingresos">Ingresos</a></th><td>Consultar las facturas de clientes incorporadas al libro y abrir sus originales. La generación de ingresos que ya tenías sigue funcionando.</td></tr>
<tr><th scope="row"><a href="/facturas/modelos?vista=gastos">Gastos</a></th><td>Consultar los gastos registrados. «Añadir o revisar gastos» abre la bandeja de documentos que todavía necesitan revisión o incorporación.</td></tr>
<tr><th scope="row"><a href="/facturas/modelos?vista=libros">Libros</a></th><td>Descargar el Excel de consulta y acceder a archivos anteriores. El Excel se genera a partir del libro; editar una copia no cambia la contabilidad de la aplicación.</td></tr>
<tr><th scope="row"><a href="/facturas/modelos?vista=modelos">Modelos</a></th><td>Consultar el IVA por trimestre o del año, preparar el 303/390 y conservar justificantes. La aplicación no firma ni presenta las declaraciones.</td></tr>
<tr><th scope="row"><a href="/facturas/modelos?vista=renta">Renta</a></th><td>Consultar los documentos reservados para revisar en Renta, separados del IVA trimestral. Todavía no calcula la declaración ni las amortizaciones.</td></tr>
<tr><th scope="row"><a href="/modulos">Mapa de módulos</a></th><td>Ver cómo pasan los documentos de la recogida a la revisión, al libro y a sus salidas.</td></tr>
</tbody></table></div>
</article>

<div class="help-grid">
<details class="feature-card">
<summary>Qué hace cada botón</summary>
<dl>
<dt><strong>Recoger factura ahora</strong></dt><dd>Consulta el correo una vez y conserva los PDF encontrados como documentos por revisar. No aprueba gastos ni modifica el libro.</dd>
<dt><strong>Subir archivos</strong></dt><dd>Conserva los PDF seleccionados y crea sus borradores. Detecta los documentos que ya estaban en el libro o en la bandeja.</dd>
<dt><strong>Guardar revisión</strong></dt><dd>Guarda los datos que has revisado en el borrador. El gasto aún no queda incorporado al libro.</dd>
<dt><strong>Aprobar revisión</strong></dt><dd>Aprueba la versión revisada y solicita su incorporación. «Aprobado» puede aparecer mientras el trabajo está pendiente; «Incorporado» indica que terminó.</dd>
<dt><strong>Actualizar datos</strong></dt><dd>Busca nuevos ingresos en la carpeta del flujo existente, incorpora gastos ya aprobados y justificantes pendientes, y regenera los libros y las copias de consulta. No recoge nuevas facturas de Amazon.</dd>
<dt><strong>Ver estado de actualización</strong></dt><dd>Consulta una vez cómo va el trabajo. No lanza otra actualización ni se queda vigilándolo.</dd>
<dt><strong>Volver a cargar esta vista</strong></dt><dd>Muestra la versión disponible en ese momento. No inicia una recogida ni una actualización.</dd>
</dl>
</details>
<details class="feature-card">
<summary>Cómo interpretar los estados</summary>
<dl>
<dt><strong>Para revisar</strong></dt><dd>Hay un PDF y un borrador. Sus datos y su tratamiento todavía necesitan revisión.</dd>
<dt><strong>Aprobado · pendiente de incorporar</strong></dt><dd>La revisión está guardada, pero falta terminar su incorporación y verificar la copia. Puedes consultar el estado de actualización.</dd>
<dt><strong>Incorporado al libro</strong></dt><dd>La incorporación ha terminado. Su inclusión en el cálculo de IVA depende del destino que se haya revisado para ese documento.</dd>
<dt><strong>En curso / Pendiente</strong></dt><dd>El trimestre todavía no está cerrado o faltan condiciones para obtener el resultado. «Pendiente» no significa que el importe sea cero.</dd>
<dt><strong>Referencia presentada</strong></dt><dd>Es el importe histórico guardado para comparar con el libro. La aplicación no consulta Hacienda ni el banco para comprobar un pago.</dd>
</dl>
<p class="quiet">La fecha de «Datos hasta…» indica la cobertura registrada. Una actualización realizada hoy no significa que ya estén completos todos los documentos hasta hoy.</p>
</details>
</div>

<details class="feature-card">
<summary>Qué necesita estar conectado</summary>
<p>El resumen, las tablas, los originales archivados y los libros se leen desde el mini. La bandeja de revisión, la preparación fiscal, la actualización y la recogida del correo utilizan los módulos que ya existen en Kairo, mediante la conexión privada.</p>
<p>Para esas acciones, el mini y el equipo que aloja esos módulos deben estar encendidos y conectados. Si falla la conexión, puedes seguir consultando el archivo local. Antes de repetir una aprobación, comprueba su estado.</p>
<p class="quiet">Hay un solo libro y una sola bandeja de revisión. La aplicación no necesita una conversación con la IA para ejecutar sus botones.</p>
</details>

<article class="feature-card">
<h2>El siguiente paso</h2>
<p><strong>Reducir el trabajo de revisar cada factura.</strong> El siguiente módulo recomendado es una lectura asistida de los PDF que proponga proveedor, número, fecha e importes, indicando de dónde ha sacado cada dato. Tú revisarías la propuesta antes de aprobarla.</p>
<p>Después podremos ampliar la recogida a más pedidos y proveedores, e incorporar los documentos de Digi, electricidad y gas al circuito que corresponda. El cálculo completo de Renta y la interfaz móvil siguen pendientes.</p>
<p class="quiet">La lectura actual aprovecha el texto extraíble del PDF y ofrece propuestas básicas. La lectura avanzada con IA y el reconocimiento de documentos escaneados todavía no están conectados.</p>
</article>
</section>'''

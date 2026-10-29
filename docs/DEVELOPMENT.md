# Arquitectura y desarrollo

Gestify es una PWA estática sin backend. Mantiene scripts clásicos, renders que
devuelven HTML y listeners separados. No requiere un framework ni un empaquetador
de JavaScript. Los datos personales residen en el dispositivo y viajan en JSON.

## Publicación al terminar

Por autorización permanente de Ángel del 11/10/2026, después de realizar cambios:
validar, integrar la rama de tarea en `main`, subirla al remoto y comprobar el
despliegue de GitHub Pages. No terminar dejando el resultado solo en una rama.
Esta preferencia sustituye en este proyecto la norma general de no integrar ni
desplegar al guardar, salvo instrucción explícita en contrario. Incrementar
`APP_VERSION` y `CACHE_VER` de forma sincronizada en cada publicación. Conservar
fuera del commit los cambios previos ajenos y los datos privados.

Excepción documental (18/10/2026): si solo cambian normas o documentación, conservar
`APP_VERSION`, `CACHE_VER` y todos los archivos publicados. Validar que el diff no
afecta a los recursos de `app-assets.json` ni a `sw.js`. Integrar y sincronizar las
normas según el flujo habitual; si CI despliega, el contenido de la app es idéntico.

## Localizar y modificar código

1. Buscar el símbolo en `CODEMAP.md` y leer solo el bloque necesario.
2. Reutilizar el componente existente. Separar cálculo, presentación y acciones.
3. Añadir archivos a `app-assets.json` cuando corresponda.
4. Ejecutar `npm run assets` y `node tools/codemap.js`.
5. Verificar lógica, datos, interacciones y presentación antes de publicar.

`CODEMAP.md` señala funciones grandes con `(!)`. Es una orientación para separar
responsabilidades cuando se trabaja en ellas, no una orden de reescribirlas todas.
Los históricos por versión están en [history-through-v388.md](history-through-v388.md).
Las ideas aún no implementadas están en [FUTURO.md](../FUTURO.md).

## Criterios permanentes de mantenibilidad (18/10/2026)

Leer esta sección al comenzar una sesión, incluso sin contexto previo. Ángel indica
que la app funciona con fluidez: la prioridad es evitar regresiones y facilitar cambios.

1. **Una responsabilidad, una fuente de verdad.** Centralizar reglas de cálculo,
   colores semánticos y comportamiento compartido. Reutilizar piezas existentes;
   parametrizar diferencias reales sin crear componentes universales con muchas excepciones.
2. **Corregir la causa.** Antes de añadir CSS, condiciones o `!important`, localizar
   la regla responsable y sus consumidores. Las variantes viven junto a su base.
   Mantener orden de cascada y especificidad al reorganizar estilos.
3. **Ordenar por zonas.** Usar extracciones pequeñas y reversibles en el módulo que
   se trabaja. La longitud es una señal para inspeccionar, no un criterio suficiente
   para dividir funciones. No migrar de framework, reescribir toda la app ni añadir
   dependencias sin una necesidad demostrada y alcance autorizado.
4. **Separar estructura y comportamiento.** Un refactor conserva interfaz, textos,
   gestos, scroll, foco, valores calculados, precisión y formatos de datos. Primero
   caracterizar la salida existente; después extraer conservando sus contratos.
   Una corrección funcional descubierta durante la revisión se registra aparte;
   no esconderla dentro de un refactor ni darla por autorizada en una auditoría.
5. **Límites claros.** Separar cálculo, render, interacción y persistencia. Los renders
   y previsualizaciones deben ser de solo lectura, incluidos estado global y almacenamiento.
   Acotar selectores al panel responsable y hacer explícitos los datos/borradores que
   consume cada pieza; no introducir dependencias implícitas entre pantallas.
6. **Verificar también a los consumidores.** Antes de editar, anotar qué componentes,
   pantallas y datos comparten la pieza. Comprobar la vista solicitada y las afectadas;
   según el riesgo, probar guardar/cancelar, reabrir, navegación cruzada y recuperación
   ante fallo. Mantener fixtures ficticias, censo del backup e invariantes de datos.
7. **Pruebas proporcionales y con significado.** Añadir caracterización cuando falte
   cobertura del contrato a extraer. Un refactor debería conservar las instantáneas;
   nunca usar `--update` para ocultar diferencias inexplicadas. El HTML no comprueba CSS
   ni listeners: cambios visuales requieren Edge móvil y revisión de los estados afectados.
   Para documentos, comprobar recursos intactos; no generar capturas sin motivo.
8. **Rendimiento con evidencia.** Medir antes de optimizar. Preservar la fluidez actual;
   evitar cachés persistentes o cargas diferidas que compliquen el estado sin beneficio medido.
9. **Cierre comprensible.** Revisar diff, explicar qué responsabilidad quedó mejor
   aislada, qué comprobaciones lo acreditan y qué sigue pendiente. Actualizar CODEMAP
   cuando cambien símbolos y el futuro mapa visual cuando exista y se afecte su interfaz.

Antes de un refactor, dejar una nota breve con: pieza y consumidores, invariantes,
primer paso acotado y comprobaciones. El informe de prioridades al final de este
documento orienta el trabajo; no obliga a ejecutar todas las propuestas en cada tarea.

## Comprobaciones proporcionadas y entrega ágil (26/10/2026)

Ángel pide recuperar agilidad conservando comprobaciones útiles. Un ajuste pequeño
requiere `npm test`, build y pruebas visuales/de interacción de las vistas afectadas;
no ejecutar toda la batería de navegador local y después repetirla en GitHub.
La batería completa sigue como puerta de publicación en CI, una vez por entrega.
En cambios de importación, persistencia, dinero o integración se añaden sus pruebas
de dominio y errores; no ampliar a zonas ajenas por rutina. Una prueba visual nueva
debe comprobar los componentes modificados, sin convertir defectos previos ajenos
en una ampliación silenciosa de alcance.

Preparar `dist` antes de las pruebas. No hacer build, regeneración ni otra operación
que cambie esa carpeta mientras el navegador la consume. Mostrar una captura o
previsualización local cuando esté lista, separando ese resultado de la confirmación
posterior del despliegue. Agrupar correcciones antes de publicar para no encadenar
ejecuciones completas evitables. Para el mapa, aplicar primero el criterio sustancial del 27/10 descrito debajo.
`map:plan` solo propone candidatos por dependencias; no obliga a capturarlos.
Elegir escenas concretas y mantener las revisiones por huella. Un archivo
compartido no demuestra por sí solo que todos sus menús necesiten otra imagen.

CI usa Chrome preinstalado en `ubuntu-24.04` mediante
`GESTIFY_BROWSER_CHANNEL=chrome`. Se conserva la batería completa y se comprueba
la versión del navegador antes de ejecutarla. Se elimina la instalación de
Chromium/dependencias que en la entrega v509 superó ocho minutos antes de empezar
las pruebas. Windows sigue usando Edge; Linux local conserva el valor por defecto
si no se declara el canal. Referencias: [imagen oficial](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md)
y [canales admitidos por Playwright](https://playwright.dev/docs/browsers#google-chrome--microsoft-edge).

Desde v519, CI compila y ejecuta las pruebas rápidas una vez. Cuatro máquinas
independientes reparten los archivos de navegador mediante `--shard=N/4`,
con un trabajador por máquina: no comparten puertos ni bases de prueba.
Todas deben pasar antes de publicar exactamente el `dist` validado.
Cada grupo registra los ocho archivos más lentos para orientar mejoras futuras.
No se habilita `fullyParallel`: se conserva el orden dentro de cada archivo.
Referencia: [reparto oficial de Playwright](https://playwright.dev/docs/test-sharding).

En cada tarea, elegir primero las pruebas afectadas y ejecutarlas juntas tras
el último cambio relevante; repetir solo por un fallo o un cambio posterior.
Kairo real se utiliza para cambios de integración; los ajustes de presentación
usan datos ficticios. No ampliar una entrega pequeña a refactors ni comprobaciones
ajenas. Buscar en fuentes concretas, excluyendo artefactos generados voluminosos.
Entregar la previsualización útil antes de esperar a CI y comunicar por separado
el resultado final de publicación. El atlas conserva su criterio representativo.

## Capturas representativas y alcance (27/10/2026)

El atlas es una referencia visual de menús y recorridos, no una réplica exacta
obligatoria de cada versión. Esta preferencia sustituye la actualización por
cualquier cambio visual/funcional definida el 25/10.

- Conservar la captura ante un plan nuevo aislado, textos menores o una corrección
  de lógica que no cambie de forma relevante la estructura o interacción del menú.
- Actualizarla si hay rediseño, controles/interacciones sustancialmente distintos
  o diferencias acumuladas que la vuelvan poco representativa. Varias opciones
  nuevas (por ejemplo cinco planes) pueden justificarlo por el efecto conjunto,
  sin convertir el número cinco en un automatismo.
- Seleccionar solo los menús que realmente hayan cambiado de esa forma. Abrir
  otras pantallas para llegar al menú no obliga a volver a fotografiarlas.
- Si una pieza compartida se rediseña y afecta de forma relevante a varios menús,
  actualizar esos menús concretos. Un fondo apenas distinto detrás de una hoja
  no exige por sí solo repetir la hoja ni toda la cadena de acceso.
- Las huellas del capturador detectan cambios técnicos, no su importancia visual.
  `map:plan`/`map:check` pueden señalar referencias cuyo código cambió aunque la
  imagen siga cumpliendo su función. Ese aviso no justifica una recaptura masiva
  ni bloquea por sí solo una entrega menor. No falsear huellas, fechas de captura
  ni aceptación visual: conservar la referencia y anotar el desfase menor tolerado
  cuando sea necesario. La selección editorial precede al generador.
- Mantener las pruebas apropiadas de funcionamiento y persistencia. No confundir
  las capturas documentales del atlas con las pruebas HTML/visuales de regresión.

## Convenciones visuales de controles

- Los botones de volver y las flechas de navegación usan cajas cuadradas con esquinas redondeadas. Los tres calendarios comparten posición y tamaño de «Hoy». En el calendario mensual las iniciales semanales acompañan al mes durante el swipe; solo el mes actual marca el día de la semana presente en verde. Preferencia de Ángel del 16/10/2026.

- Por defecto, el título de cada menú o panel nuevo se centra respecto al ancho completo de su contenedor, no al espacio sobrante tras la flecha. Reutilizar `.bd-panel-header.panel-header-centered`, con columnas laterales simétricas; si hay acciones más anchas, reservar el mismo ancho en ambos lados. Preferencia de Ángel del 11/10/2026.

- En desplegables, reutilizar los indicadores dibujados de la aplicación (`.ev-tax-chevron` o el chevrón de `details > summary`). No usar caracteres de texto como `⌄` para representar la flecha. Preferencia de Ángel del 11/10/2026.
- En el editor de cumpleaños, nombre y fecha comparten un panel blanco; categorías tiene su propio panel con acento suave. En la ficha, el resumen queda abierto, sin recuadro interior, y categorías conserva su panel.
- Los símbolos VIP de la lista no deben cambiar la altura de las filas.
- Los calendarios de selección de día conservan altura y posición exterior al cambiar de mes mediante flechas o swipe, aunque el mes ocupe cuatro, cinco o seis semanas. Reutilizar el marco y reservar seis filas semanales; actualizar únicamente el contenido interior. Preferencia de Ángel del 14/10/2026, también para clases extras y recuperaciones.
- Los swipes autorizados muestran progresivamente el contenido vecino mientras se arrastra. Solo se mueve el contenido que cambia; cabeceras, navegación y acciones compartidas permanecen fijas. Previsualizar o cancelar no debe navegar, guardar ni alterar borradores. Preferencia de Ángel del 15/10/2026.

## Exportaciones de archivos

Todos los exportadores usan `shareOrDownload`: CSV, PDF, cumpleaños, copia completa,
histórico de energía y calendario ICS. `exportFileName` añade fecha y hora local
(`nombre_YYYYMMDD_HHMMSS_mmm.ext`), con un sufijo adicional si coinciden en el mismo
milisegundo. Compartir se invoca directamente desde el gesto del usuario; cancelar
el diálogo no provoca una descarga inesperada. Si el formato o navegador no admite
compartir, se conserva la descarga como alternativa.

Cada exportación abre una elección: Guardar copia, Compartir o Guardar y compartir.
Compartir solo no escribe una copia; Guardar solo no abre el diálogo nativo.
Si no hay carpeta elegida o falla su permiso, guardar usa la descarga del navegador.
En Ajustes → Modificar ruta de guardado se elige o cambia la carpeta. Su handle y
una ubicación descriptiva opcional se conservan en IndexedDB solo en ese dispositivo.
La descripción la escribe el usuario: nunca se presenta como ruta detectada, porque
el navegador no expone los antecesores de la carpeta. No viaja en el backup.
En Guardar y compartir, cancelar Compartir no deshace la copia ya solicitada.
El soporte del selector de carpetas se comprueba en ejecución.

La ficha de cumpleaños ajusta su altura al contenido. Volver desde edición o
alarma sustituye el panel sin esperar animaciones ni mostrar la lista entre medias.
Las categorías conservan aire entre su título y las etiquetas; el nombre es mayor.
Solo las rutinas de horario fijo admiten nuevas sesiones saltadas (incluido histórico
y operaciones en lote). Los datos flexibles antiguos se preservan. La ficha permanece
abierta tras cambiar el estado; al reactivar una original con recuperación, se exige
eliminar esa recuperación o convertirla en extra. La operación se valida antes de guardar.
Los filtros de Todos usan `kind|type`, para distinguir ambos tipos Otros, y `kind|*`
para filtrar todos los puntuales o grandes. Se conserva lectura de filtros antiguos.

## Preparación mensual de facturación (v447)

Home agrupa los exportadores anuales existentes en «Exportar horas». «Enviar
factura» abre la preparación del mes visible en Home. El símbolo reutiliza
`evManagementShapeInner('invoice')`, igual que Rec. Gestiones.

`invoices.js` separa el cálculo por fechas/tarifas del resumen económico predictivo.
Calcula en céntimos y agrupa por unidad/tarifa. Al abrir el mes prepara automáticamente
los laborables normales del calendario completo, excluyendo festivos, vacaciones y
ausencias. Muestra un resumen mensual, sin selección ni confirmación diaria. Las tarifas diarias pueden proceder de la configuración
anual. El modo horario antiguo de Económico conserva una equivalencia diaria:
se exige tarifa explícita en el nuevo editor, sin reconstruirla mediante una media.
La configuración y los PDF son privados del dispositivo; no introducirlos en Git.

La fase inicial produce un XLSX auxiliar con fórmulas y un JSON versionado desde
el mismo cálculo. `invoices-export.js` escribe OOXML/ZIP localmente, sin red ni
biblioteca adicional. Son documentos auxiliares; no se importan automáticamente
en la aplicación gratuita AEAT ni constituyen una factura definitiva.

### Estado y comprobación de los exports auxiliares

`condition: "calendar-month"` significa preparación automática basada en el mes
completo del calendario, incluyendo los días futuros seleccionados por sus reglas;
no acredita trabajo ya realizado ni una confirmación explícita del usuario. El
Excel expresa lo mismo: «Basada en calendario; puede incluir planificación».
No se añade un paso de confirmación. No cambia el esquema ni las huellas existentes.

`node tools/verify-invoice-export.js "ruta/al/export.json"` comprueba ambas huellas
con `node:crypto`, sin cargar la aplicación ni escribir en el archivo. Salida: dos
booleanos, y código de salida 1 si alguna no coincide. Son huellas de coherencia,
no firmas de autenticidad. Para reproducirlas desde el JSON original:

- **operationId**: SHA-256 de los bytes UTF-8 de `JSON.stringify` del array
  `[issuer.taxId.trim().toUpperCase(), client.taxId.trim().toUpperCase(), period,
  project.trim().toLowerCase()]`. Salida hexadecimal minúscula (64 caracteres).
- **contentHash**: SHA-256, UTF-8, hexadecimal minúscula, de `JSON.stringify(p)`
  excluyendo `appVersion`, `contentHash`, `revision` y `preparedAt`. Incluye el
  `operationId` almacenado. Se verifica este último por separado.
- No se ordenan claves, no hay espacios de formato ni salto final, no se normaliza
  Unicode. Los números se serializan como JavaScript. Se conserva el orden de las
  propiedades y de los arrays, incluidos `days` y `lines`. Un JSON reindentado
  verifica; uno con claves reordenadas puede no hacerlo.
- Orden superior actual: `schemaVersion`, `period`, `kind`, `condition`, `issuer`,
  `client`, `project`, `payment`, `concept`, `days`, `lines`, `vatBasisPoints`,
  `withholdingBasisPoints`, `baseCents`, `vatCents`, `withholdingCents`, `totalCents`,
  `operationId`. `payment` no se inserta al verificar exports antiguos sin ese campo.
- Objetos emisor/cliente: `name`, `taxId`, `address`; pago: `iban`. En cada día del
  calendario: `date`, `type`, `weekend`, `selected`, `hours`, `rate`, `unit`,
  `rateIssue`. En cada línea: `unit`, `rateCents`, `quantity100`, `baseCents`.
  Para versiones anteriores se conserva el orden y los campos presentes, sin rellenar.

El Excel muestra `operationId`, `contentHash` y `revision` copiados de esa misma
preparación. `contentHash` no es la huella binaria del XLSX: cambios de texto o
formato en el libro no la alteran. Corregir la etiqueta requiere volver a exportar
el Excel una vez instalada la corrección; el JSON previo no necesita regenerarse.

Octubre de 2026 es el primer mes real autorizado. Los meses anteriores permiten
comprobaciones históricas pero no asociar documentos para nuevos envíos.
El PDF definitivo se incorpora después de emitir en AEAT: se declara número,
fecha y comprobación del mes/importes/entorno. Gestify valida formato/tamaño,
identifica el archivo por SHA-256 y evita repetir PDF o número entre meses. La
confirmación del usuario no se presenta como una consulta automática a AEAT.
Con PDF definitivo, la preparación queda conservada. «Corregir PDF asociado»
requiere nuevamente archivo y confirmación, sin borrar antes el documento vigente.

`excelia-invoices-v1` incluye configuración, preparaciones y PDF (máximo 2 MB por
archivo), también en el backup completo. Si se supera la cuota del navegador,
guardar falla sin marcar la asociación como completada. Fusionar dos versiones
distintas del mismo mes se rechaza para evitar sobrescribir documentación.

Gmail se abre con cuenta sugerida, destinatarios, asunto y cuerpo; no adjunta por
URL, envía ni programa automáticamente. La pantalla indica guardar el PDF
definitivo y adjuntarlo en Gmail. Nunca ofrece el auxiliar como adjunto de factura
ni marca enviado por abrir un borrador. El usuario comprueba remitente y decide
cuándo enviar/programar. La negrita del mensaje puede aplicarse al revisarlo en Gmail.

Configuración → Edición facturas y correo centraliza emisor, cliente, proyecto,
concepto, tarifa/unidad, impuestos y correo. `{mes}`, `{anio}` y `{periodo}` se
sustituyen en concepto, asunto y cuerpo. Los campos personales empiezan vacíos. «Importar datos» acepta JSON con
`format: "gestify-invoice-settings"`, `version: 1` y `config` (campos de
`invoiceDefaults`). Admite campos parciales: conserva los demás. Carga el formulario
para revisión; solo «Guardar configuración» persiste. No importa meses ni PDF.
«Exportar datos» genera ese mismo formato. Los archivos reales permanecen fuera de Git.
Los botones de Home se ubican a la derecha de Jornada. El mes de facturación se
toma de Home y se muestra sin selector en el panel. El resumen incluye las tarifas
por día (o por hora si está configurado), separadas si hay varios tramos. El ojo
oculta los importes del resumen durante la sesión sin modificar datos ni exportaciones. El IBAN de ingreso es
opcional, se normaliza sin espacios y en mayúsculas, y se comprueban sus dígitos
de control. Viaja en configuración, backup y `preparation.payment.iban`; también
aparece en el Excel auxiliar. Preparaciones antiguas sin IBAN siguen siendo válidas.

Preferencia de Ángel: los archivos preparados para importar en el teléfono se dejan
en `%USERPROFILE%/CrossDevice/V2454A/storage/Download/Gestify`, fuera del repositorio.
Pruebas: `tools/test-invoices.js` y `tools/browser/invoices.spec.js`, siempre con
identidades y PDF sintéticos. No se emiten facturas ni se envían correos al probar.

## Catálogo único de archivos

Conexión privada de facturación (candidato sin desplegar): ver
[KAIRO-DEVELOPMENT.md](KAIRO-DEVELOPMENT.md). `js/invoices-kairo.js` aporta transporte
entre ventanas y consulta; reutiliza preparaciones y persistencia de facturación.
No habilitar el campo opcional de conexión hasta instalar y validar el receptor.

`app-assets.json` determina:

| Campo | Responsabilidad |
| --- | --- |
| `scripts` | Orden de los scripts de la página y de las pruebas de lógica. `unit:false` excluye bibliotecas o arranque con DOM real del navegador simulado. |
| `styles` | Hojas que enlaza la aplicación. |
| `styleSources` | Fragmentos que componen `css/styles.css`, en orden de cascada. |
| `assets` | Imágenes, manifiesto y otros archivos necesarios sin conexión. |

`npm run assets` genera los bloques marcados de `index.html`, la lista `ASSETS`
del service worker y `css/styles.css`. Esos resultados se versionan para que la
raíz siga funcionando directamente como página estática. No se editan a mano.
`npm run check:assets` rechaza archivos nuevos sin registrar o resultados pendientes
de regenerar; también se ejecuta al probar y al preparar la publicación.

`tools/build.js` publica únicamente lo registrado, `index.html` y `sw.js`.
Las fuentes CSS, documentos, pruebas y backups no entran en `dist`. Las imágenes
históricas que se conservan por compatibilidad también deben figurar en el catálogo.

## Estilos

Las fuentes de la antigua hoja central están en `css/source/`:

| Bloque | Contenido |
| --- | --- |
| `base.css` | Temas, Home, campos y controles base. |
| `economics.css` | Ventanas económicas y componentes de tablas/análisis. |
| `birthdays.css` | Listas y calendario de cumpleaños. |
| `event-calendar.css` | Calendarios, marcadores y filtros. |
| `navigation-alarms.css` | Navegación y alarmas. |
| `event-panels.css` | Fichas, selectores y formularios de eventos. |
| `dialogs-responsive.css` | Diálogos y reglas adaptables. |
| `wedding-moves.css` | Clases, parejas y configuración de bodas. |
| `routines.css` | Base de rutinas y su histórico. |
| `shared-refinements.css` | Reglas finales compartidas de navegación, agenda y controles. |
| `home-sharing.css` | Resúmenes de Home y exportación de eventos. |
| `energy-refinements.css` | Estudio energético y ajustes finales de pantallas relacionadas. |

Las hojas de tareas, hogar, comparador eléctrico, vistas financieras y períodos
personales siguen siendo independientes. `CODEMAP.md` indexa todas las fuentes
editables y omite el archivo generado.

El orden del catálogo conserva la cascada anterior. No reagrupar una regla por su
nombre sin revisar qué sobrescribe. Los bloques de ajustes finales se mantienen
explícitos por esa razón; una regla compartida no debe cambiarse para retocar solo
una pantalla. Las rutas `url(...)` de los fragmentos se resuelven respecto al archivo
generado en `css/`, no respecto a `css/source/`.

## Componentes y ventanas

| Necesidad | Pieza existente |
| --- | --- |
| Navegación principal | `renderNavBar` / `bindNavBar` / `navigateMain` |
| Atrás, flechas y Hoy | `css/source/navigation-controls.css`; geometría del carrusel en `event-panels.css` |
| Ajustes globales sin salir de la ventana | `toggleSettingsMenu` / `closeSettingsMenu` en `settings-menu.js` |
| Ventana secundaria | `.full-overlay` → navegación → cabecera → `.sy-body` |
| Subpestañas | `.econ-sub-tabs` / `.econ-sub-tab`, con clase local de la pantalla |
| Panel deslizante | `abrirPanel` / `cerrarPanel`, con cancelación del cierre pendiente |
| Aviso y Deshacer | `showToast`; gesto horizontal sin ejecutar la acción |
| Checkbox | Estilo global y variable `--chk` |
| Colores y fechas | `_renderColorPicker` / `_bindColorPicker`, `openOtrosDatePicker` |
| Hora de ensayo | `openBodaTimePicker` |
| Importación | `askImportMode`, previsualización y validación antes de escribir |
| Gráficas | `simpleBarChart`, `hBarRows` y los renders energéticos compartidos |
| Tarjetas de estadísticas | `renderStatsCard`, `renderStatsMetrics` en `statistics-ui.js`; marco en `css/source/statistics.css` |
| Acceso a Recordatorios | `.reminders-access`: medida compacta compartida de 90 × 33 px en Ajustes y Tareas |

El scroll vive en `.sy-body`, nunca en `.full-overlay`. Cabeceras y navegación
mantienen su altura; no se encogen ni desaparecen. Usar el patrón existente de
doble `requestAnimationFrame` al abrir y la transición de cierre. Conservar el scroll
al actualizar una vista que sigue abierta. Delegar listeners de contenido dinámico
una sola vez con un indicador `_delegated`.

No alterar todas las subpestañas para corregir una: el reparto entre textos de
Energía y de Próximos tiene reglas propias. Los campos con caja y tarjetas
consecutivas necesitan al menos 10–12 px reales de separación, mediante `gap`
en su contenedor. Comprobar contenido largo y móvil, además de escritorio.

En Eventos, el fondo seleccionado y el subrayado ocupan el botón completo,
no un `span` ajustado al texto. Rutinas y Próximos reparten el ancho disponible
en partes iguales; WM hace lo mismo para sus cuatro títulos y reserva una
columna compacta al engranaje. Mantener el ancho al cambiar de selección,
con margen lateral y sin desbordar «Estadísticas» o «Cumpleaños» a 320 px.
Próximos usa el mismo `.ev-upcoming-body` sin padding para las cuatro vistas
y una rejilla de cuatro columnas iguales. El espaciado de las listas vive en
`.ev-upcoming-content`; no compensar márgenes negativos según la subpestaña.
La cabecera conserva 64 px mínimos también cuando «Añadir» reduce el botón
de volver en móviles estrechos, para que la fila no salte al entrar en Cumpleaños.

El menú de ajustes es único y se monta en `body`, anclado al botón pulsado.
Abrirlo no cierra overlays ni reconstruye su contenido. Conserva el retorno
anterior; Escape y el clic exterior lo cierran sin activar el control de debajo.
Toda salida del menú debe pasar por `closeSettingsMenu`, también importación
y elección de iconos, para restaurar ese retorno y el estado del botón.
La campana sigue el mismo patrón (`alarm-panel.js`): formulario único en `body`,
`toggleAlarmPanel` desde Home y navegación, y `closeAlarmPanel` en toda salida.
Comparte `_positionHeaderMenu` con ajustes. Al alternar entre ambos se cierra
primero el anterior para conservar `NAV_BACK`; abrirlos nunca llama a una ruta.
`init.js` prepara las ruedas al abrir y conserva el envío de alarmas a MacroDroid.

### Marcadores y viajes (v390)

- Los filtros de anual y cuatro meses comparten reparto flexible del ancho:
  crecen las etiquetas, no los iconos ni la X. Sus reglas viven en
  `event-calendar.css`; evitar un margen automático que deje un hueco al final.
- El óvalo VIP de un mes aplica la misma escala de ribete que los puntuales,
  incluida su reducción de 20 unidades SVG a 12 px al mostrarse.
- Ribete definitivo de símbolos: 1,3 px en el ajuste común, negro en claro y
  blanco suave en oscuro/gris. `evSymbolStroke` distingue borde, relleno y halo;
  no cambiar indiscriminadamente todos los trazos del SVG.
- El laboratorio temporal se ha retirado. Los backups anteriores conservan
  los otros ajustes de dibujo; el borde se normaliza a 1,3 al leer/importar.
- `_evBarPast` calcula el porcentaje pasado del fragmento visible, incluyendo
  relevos de medio día. Una máscara atenúa esa parte sin cortar la barra ni
  duplicar el título. La bombilla retira la atenuación en los tres calendarios.
- En 1 mes, los tramos exteriores ya se atenúan con `_evBarMutedColor`.
  Desde v392, `_evBarPast(..., inMonth)` omite la segunda atenuación allí,
  tanto en barras sencillas como escalonadas. Dentro del mes se sigue apagando
  solo la parte pasada de un viaje en curso. La bombilla no activa el mes vecino.
- La luna mantiene `planet` como identificador compatible con eventos previos.

### Calendarios y Economía personal (v391)

- `renderBdayAddButton` comparte el botón de cabecera entre cumpleaños y la
  subpestaña de cumpleaños de Próximos. Los calendarios crean desde el día;
  anual/4 meses conservan el lápiz para activar la edición.
- `evIsPlan` agrupa Plan/Quedada y subtipos para el filtro P/Q. La fila compacta
  incluye siete filtros y el control de ciclo, sin saltos de línea desde 320 px.
- Próximos identifica cada cita puntual por evento + fecha activa. Los grandes
  mantienen su intervalo y las repeticiones muestran la próxima ocurrencia.
  No inferir duración continua a partir de los extremos de `dates`.
- `evDetailTitleColor` define el color del título; `evUpcomingMarkHtml` conserva
  la identidad del marcador. Cambiar el color libre no recolorea el título.
- `personal-cards.js` renderiza las partidas con y sin períodos sobre la misma
  estructura. `excelia-personal-cards-v1` recuerda el plegado por año/partida y
  se excluye del backup por ser solo presentación local. Los períodos e importes
  siguen viajando íntegros con `personalPerYear`.
- Los controles de partidas recorren `PERSONAL_SECTIONS`, no todas las claves
  de `PERSONAL_DATA`: copias antiguas también contienen opciones auxiliares
  como `limpiezaCasa`. Se conservan, pero no son listas de tarjetas (v396).
- `PERSONAL_SAVED` compara el borrador con la carga/guardado del año. Cambiar
  el plegado no enciende Guardar; revertir el importe tampoco deja un falso aviso.
  Guardar períodos conserva su guardado explícito; los campos simples usan
  Guardar configuración cuando hay cambios.

## Energía: datos y cálculos

| Módulos | Responsabilidad |
| --- | --- |
| `energy-history`, `energy-bills`, `energy-analysis` | Contratos, facturas, IVA, validación y cálculos base. |
| `energy-costs`, `energy-reconciliation`, `energy-study` | Costes por día/compañía, conciliación e indicadores. |
| `energy-reference`, `electricity-comparator*` | Referencias y escenarios independientes. |
| `energy-analysis-view`, `energy-analysis-bind` | Presentación y navegación del estudio. |
| `energy-data` | Reutilización de datos y cálculos durante un render. |

El modo Total de Resumen oculta el selector anual sin cambiar el año guardado
ni la altura de su fila. El mismo botón vuelve al año seleccionado; las demás
pestañas conservan su selector y los gestos de navegación correspondientes.

`withEnergyData(render)` crea un contexto síncrono de solo lectura para una
actualización de pantalla. Las llamadas anidadas lo comparten. `energyReadData`
lee, interpreta y valida cada colección una sola vez; `energyMemo` reutiliza
cálculos con los mismos argumentos (por identidad de colección, año y suministro).
`finally` descarta el contexto incluso si el render falla. Fuera de ese contexto
las funciones siguen leyendo y calculando normalmente.

No escribir datos ni mutar arrays devueltos durante un render. No extender esta
caché a promesas ni conservarla entre pantallas: importaciones, Deshacer y cambios
externos deben verse en el siguiente render sin depender de invalidaciones manuales.
Coste con IVA histórico reutiliza su resultado para la conciliación y el gráfico.
Los otros escenarios comparten lecturas, pero calculan sus propias condiciones.

Los precios almacenados y los cálculos mantienen toda su precisión. Solo se
redondea al presentar: precios unitarios con dos cifras significativas, importes
finales con dos decimales, kWh anuales/mensuales enteros y diarios con hasta uno.
Nunca volver a leer un texto redondeado para recalcular una tarifa.
Contratos y facturas importados permanecen independientes de las simulaciones.
No convertir huecos o lecturas desconocidas en consumo cero; excluir servicios
ajenos al suministro al conciliar, conservándolos en el histórico y el backup.

`npm run benchmark:energy` mide las cinco vistas con diez años y 240 facturas
ficticias. Informa mediana, lecturas/validaciones y hash del HTML. La mejora v389
redujo de 2–3 a 1 lectura/validación por vista; los cinco hashes se mantuvieron.
Los tiempos dependen de la máquina: comparar en la misma, no fijar límites de
milisegundos en CI. `test-energy-cache.js` compara el HTML con/sin contexto para
luz, gas, varios años e IVA, y prueba importación, Deshacer y fallos de lectura.

## Formulario de eventos

| Archivo | Responsabilidad |
| --- | --- |
| `events-form.js` | Render, abrir/cerrar y coordinación de controles. |
| `events-form-controls.js` | Categorías, título sugerido, formas, fechas, horas y transporte. |
| `events-form-save.js` | Leer/validar borrador, crear ensayos, guardar, borrar y Deshacer. |

Cada apertura crea un borrador con referencia a su hoja, evento original, día de
edición, forma, fechas y grosor. Los selectores están acotados a esa hoja, no al
documento completo. `_evFormRead` valida los campos antes de cambiar `EVENTS`.
`_evFormSaveBodas` crea clases independientes por día; `_evFormCommit` aplica los
límites diarios y guarda el resto. No añadir persistencia a listeners de selección.

Al cambiar categoría se conserva un título escrito por el usuario, se actualiza
solo el sugerido y se limpia repetición si la categoría no la admite. Asturias
sugiere el título, pero deja la nota vacía y conserva cualquier nota escrita.
Un trayecto
puede tener transporte/conductor sin hora. Editar una nota de día conserva las
demás notas. Deshacer una creación múltiple restaura también los días cerrados.
`tools/browser/event-form.spec.js` cubre esos recorridos y una recarga sin conexión.

## Persistencia y compatibilidad

Usar `appStorage`; permite transacciones y restauración ante error. Toda clave
nueva debe figurar en el censo de `tools/test.js` y viajar en exportación/importación,
salvo estados temporales de interfaz excluidos explícitamente. Leer del disco al
exportar datos de ventanas que quizá no se hayan abierto. El backup sigue siendo
JSON; no hay migración de formato ni de datos en esta reorganización.

Fusionar por identificador y firma de contenido, conservando referencias canónicas.
No publicar datos personales, backups, facturas ni webhooks. Los fixtures son
inventados. Las alarmas usan únicamente MacroDroid; la configuración local y sus
límites están en [macrodroid.md](macrodroid.md).

## Verificación y publicación

- `npm test`: catálogo, instantáneas y reglas de lógica/importación/restauración.
- `npm run build`: prepara `dist` con los archivos del catálogo.
- `npm run test:browser`: interacciones y geometría; Chromium en CI. Para revisión
  manual local, Edge mediante la extensión, con capturas reales.
- Revisar diffs de instantáneas antes de aceptar `node tools/test.js --update`.
  Un refactor sin cambios de interfaz debería conservarlas.
- Incrementar `APP_VERSION` y `CACHE_VER` antes de publicar. La nueva generación
  offline instala el conjunto completo; no actualizar scripts sueltos en una caché vieja.
- GitHub Actions debe completar las pruebas y el despliegue de la revisión concreta
  antes de dar la versión por publicada.

## Paneles de configuración (v454)

El menú de ajustes ofrece tres accesos, en este orden: correo de horas y
MacroDroid, facturas y correo, y ruta de guardado. Se abren en consulta;
`bindSettingsEditor` habilita los campos al pulsar Editar, conserva un borrador
para Cancelar y vuelve a consulta después de Guardar. Los botones del pie
permanecen visibles y el contenido largo se desplaza dentro del panel.
`settingsPanelHtml` y `settingsEditorActions` comparten cabecera centrada y pie.
En la ruta de guardado, elegir una carpeta solo cambia el borrador: tanto el
handle como su referencia se escriben juntos en IndexedDB al guardar.

## Home y configuración (v455)
El acento de Home pasa del rojo a pizarra azulado (`--home-tone`, #526477 en claro).
Afecta a navegación, Hoy, exportación, actualización y al símbolo compartido de factura.
Los estados de error y acciones destructivas conservan su rojo.
Configuración separa Correo de Horas y MacroDroid y añade Ver Datos. Los cinco paneles
abren en consulta; cada campo ofrece copia con confirmación verde. Editar habilita
los campos, Cancelar descarta y Guardar persiste. El foco de teclado de los botones
sigue visible; los campos de consulta no muestran el contorno negro del navegador.
`excelia-contact-data-v1` guarda campos personales como strings, sin valores iniciales.
Viaja como `contactData` en el backup, con validación y normalización de campos.
La selección para copiar es temporal y nunca envía mensajes por sí sola.
Guardar copia desde Exportar Horas cierra ambos paneles y devuelve a Home.

## Opciones, estadísticas y datos personales (v456)
- Los títulos de menús y sus opciones llevan mayúscula inicial en palabras significativas; artículos y enlaces (de, y, para…) siguen en minúscula. `menuTitle` sirve para etiquetas presentadas, nunca para reescribir nombres del usuario o los valores de categorías guardadas.
- Próximos conserva cuatro subpestañas: Próximos, Agenda, Todos y Estadísticas. Cumpleaños es una vista alternativa de Próximos, accesible mediante `evUpBirthdays`; el mismo botón vuelve a eventos. Los swipes siguen las cuatro pestañas visibles.
- `events-statistics.js`: estado `EV_STATS_YEAR` y `EV_STATS_PERIOD`, render puro y binds propios. Realizados llega hasta hoy, Futuros comienza mañana y Ambos reúne las dos partes. Los agregados se basan en fechas registradas. Los grandes cuentan una vez por evento; los puntuales una vez por fecha activa. Los días se deduplican por categoría y en Días Fuera (Viaje + Asturias + Casa Rural). Las repeticiones futuras sin año explícito se acotan a 12 meses. Los VIP virtuales y rutinas no entran en estos agregados.
- Todos permite categorías completas (`group:id`) combinadas por OR o tipos (`kind|type`) de una sola categoría. Al elegir un tipo de otra categoría se sustituye la selección incompatible y se explica en el panel. Ensayos y Otros son categorías independientes. La selección se muestra mediante un contorno, sin oscurecer el fondo.
- `settings-personal.js`: Ver Datos y Notas viven en el grupo personal de Configuración, separado por una línea. Los datos escalares antiguos se migran en lectura a correos, direcciones vinculadas a CP/localidad y cuentas. Hasta ocho registros por grupo; tarjetas y cuentas tienen nombre identificativo. Editar/Guardar/Cancelar y la copia reutilizan el editor común. No se crean campos de CVV ni PIN.
- `excelia-contact-data-v1` sigue viajando como `contactData`; admite grupos de objetos validados. La fusión deduplica y rechaza exceder ocho entradas antes de confirmar la transacción. `excelia-personal-notes-v1` es una única nota de hasta 50.000 caracteres, exportada como `personalNotes`.
- El distintivo «Para el Programa Imputaciones» corresponde exclusivamente al CSV anual de horas; no se muestra en facturas ni en PDFs.

| Vocabulario | Código |
| --- | --- |
| Estadísticas de Próximos | `renderEventStatistics` / `computeEventStatistics` |
| Cumpleaños dentro de Próximos | `evUpBirthdays`, `EV_VIEW='birthdays'` |
| Datos y direcciones personales | `openPersonalData`, `CONTACT_GROUPS` |
| Nota única | `openPersonalNotes`, `PERSONAL_NOTES_KEY` |

## Refinamiento de filtros y estadísticas (v457)
- Home usa rosa (`--home-tone`: #bb3979 en claro, #f29bc2 en oscuro), sustituyendo al pizarra de v455 por petición de Ángel.
- Filtrar Eventos: pulsar el nombre selecciona la categoría completa; el área del chevrón abre los tipos. El fondo de cada categoría conserva su color suave y la selección se indica por el borde. Se conserva la regla de categorías completas o tipos de una única categoría.
- Estadísticas: selector de año con Total a su derecha, que recuerda el último año consultado. Gestiones y Planes muestran Veces sin columna Días.

## Próximos y direcciones (v458)
- Próximos y Estadísticas comparten `--upcoming-tone` celeste, con variante de texto legible. Los colores de los tipos de evento conservan su identidad.
- Estadísticas usa flechas anuales y oculta el año y las flechas al activar Total; desactivarlo recupera el último año.
- Cada dirección de Mis Datos se muestra plegada por nombre (o por dirección si falta el nombre); al editar se abren los registros y los nuevos se abren para rellenarlos.

## Mis Datos y exportación (v459)
- Atajos de selección para identidad, contacto y dirección principal; copia directa desde registros plegados.
- Direcciones y cuentas guardan `primary: "1"` en el registro principal; sin marca explícita se utiliza el primero. Se conserva en copias e importaciones.
- Campos personales con altura automática al desplegar, escribir y cambiar de ancho. CSV y nota usan el acento Home; PDF usa gris.

## Próximos y copia directa (v460)
- Los atajos de Mis Datos copian directamente y confirman con un check verde.
- Todos filtra por el año actual, con flechas y Total; los eventos que cruzan años y las repeticiones se incluyen si ocurren dentro del año.
- Cumpleaños/Eventos alterna el texto y sustituye los controles de rutinas y ensayos por VIP. Se elimina el acceso flotante Hoy de la lista de cumpleaños.
- Estadísticas identifica Casas Rurales y ofrece accesos a los módulos de estadísticas de Rutinas y Wedding Moves.

## Selector anual (v461)
- Estadísticas abre con el año actual, centrado y conservando el color de las flechas. Total es explícito y al desactivarlo recupera el año elegido.
- Todos vuelve a su listado sin selector ni filtro anual; conserva el buscador, los tipos y la ordenación compacta.

## Botones, alarmas y rotores (v464)
- Las pestañas principales de Eventos, Economía y Fiscal y los botones de Estudios comparten peso 600, como Próximos.
- La campana de la cabecera de la ficha ofrece Configurar Alarma para ocurrencias entre hoy y dentro de 14 días, incluidos ambos extremos. Calendarios y agenda conservan la fecha pulsada; sin fecha se busca la próxima ocurrencia.
- Las ruedas resaltan únicamente los dos elementos afectados. La campana recentra los minutos al terminar el gesto, para no interrumpirlo.
- El día de cumpleaños tiene tres ciclos y arranca en el central. Los horarios de rutinas usan cuartos de hora, conservando los minutos antiguos que no coincidan con ellos al editar.
- Fiscal enlaza los campos antes de mostrar la ventana, evitando perder cambios durante la animación de apertura.

## Cabecera anual de Eventos (v465)
- Todos y Estadísticas sitúan el año y Total en la cabecera, sustituyendo sus títulos. Usan la geometría de Agenda y las flechas neutras compartidas.
- Ambas consultas arrancan en el año actual. Total oculta el año y las flechas, muestra Todo el Histórico y conserva el año para recuperarlo al desactivarlo.
- Todos filtra por ocurrencias del año, incluyendo repeticiones, cruces de año y fechas discontinuas. Buscar, categorías y Excluir Pasados siguen combinándose con ese período.
## Gestiones del mes y carrusel (v466)
- Enviar Factura, Pago, Pago Hacienda y Presentar Modelo entran en las tareas verdes desde el inicio de su mes. Las ocurrencias conservan su identidad y estado de finalización.
- El símbolo de limpieza sustituye a la hoja conservando la clave `leaf`, compatible con eventos y copias anteriores.
- Próximos Cumpleaños muestra VIP con el acento de Próximos y Añadir a su derecha.
- El carrusel acompaña el arrastre con vistas previas inertes, mantiene el tamaño y respeta el desplazamiento vertical. La fecha queda centrada y la alarma usa un icono vectorial.
- La captura táctil ignora la pérdida de captura de los hijos y evita la navegación lateral del navegador durante el arrastre.


## Rutinas y orden de planes (v468)
- Desde Eventos, `js/events-routines.js` ofrece hasta cuatro rutinas activas y un selector ampliado. Una flexible crea una extra; una fija crea una sesión planificada y permite sustituir un compromiso de esa semana sin modificar semanas posteriores.
- El histórico compara el horario efectivo con el original (`originalTime`, `originalDur`, y `originalDate` si se cambió de día), conservado en `keptSessions`. Volver al horario original o cancelar y descancelar no deja una marca de edición. Las nuevas sesiones fijas llevan `planned` y cuentan entre las previstas. El recuento mensual añade las movidas de horario.
- Una extra sin `recoveryOf` se puede editar o eliminar, pero no cancelar ni recuperar, también al actuar por lote. Las recuperaciones mantienen su vínculo y los controles correspondientes.
- Rutinas separa hechas habituales, canceladas, recuperadas y extras pasadas. Cumplimiento = (hechas + recuperadas + extras) / sesiones habituales previstas hasta ayer. Puede superar el 100 %; sin sesiones de referencia se muestra un guion.
- `js/events-order.js` guarda las preferencias en `excelia-plan-order-v1`, campo `planOrder` del backup. Las horas de referencia no se escriben en los eventos ni producen alarmas. Las horas ordenan primero; las flechas desempatan planes sin hora con la misma referencia. Próximos, recordatorios, agenda y marcadores usan la misma comparación. La prioridad histórica de gestiones se conserva como desempate, no por encima de una hora real.
- Plan cultural sustituye al alias Actividad cultural sin perder eventos antiguos; `culturalPlan` conserva Monólogo, Teatro, Scape Room u Otro. Ponencia sigue independiente. Desayunar se añade; las actividades pasan a Plan/Quedada y Carrera usa una bandera diferenciada de Salir a Correr. Las rutinas comparten el marco blanco de los símbolos de actividad.
- El histórico mantiene esquinas opacas al fijar el mes. Mis Datos usa tres atajos iguales y copia nombre, teléfono y correo sin prefijo; los documentos de identidad y campos bancarios conservan la etiqueta, incluso al copiar un campo individual.
- Verificación: `tools/test-routines-plans.js` y `tools/browser/routines-plans-adjustments.spec.js`, además de las pruebas existentes. Capturas en Edge oculto con tema claro, iconos profesionales y tamaños móviles.

## Medición visual estable (v469)
- La alineación izquierda/derecha se mide dentro del mismo fotograma. Evita atribuir al calendario el desplazamiento de la animación de apertura del overlay; se mantiene la tolerancia de un píxel.

## Formulario de eventos y carrusel (v470)
- Los eventos puntuales nuevos ocupan un único día. El formulario elimina las repeticiones y la selección multidía; al editar se conservan los días y las repeticiones de eventos anteriores. Cumpleaños mantiene su recurrencia anual.
- `js/events-form-schedule.js` reúne la cabecera dinámica y los controles de fechas y horas, situados a la derecha de Título y Notas. La cabecera y Guardar permanecen fijos; únicamente el cuerpo desplaza su contenido. El final de un ensayo se calcula con su duración y no se edita como una hora independiente.
- Puntual y Grande muestran sus símbolos de categoría. Ensayos boda y Otros comparten la selección mediante check sin sombreado adicional.
- En el carrusel, `.ev-car-viewport` recorta el contenido de cada evento y sus vistas previas. La fecha, los controles de navegación y el marco permanecen quietos durante el arrastre. La campana usa `navIconHtml('alarm')` con el formato cuadrado de esquinas redondeadas.
- `tools/browser/event-form-layout.spec.js` verifica cabecera fija, geometría móvil, guardado de fechas y horas, conservación de datos anteriores y desplazamiento exclusivo del contenido del carrusel. La revisión visual usa Edge oculto, tema claro e iconos profesionales.

## Planes, prioridades y calendarios estables (v471)
- Próximos Cumpleaños alinea VIP a la izquierda, Añadir al centro de la pantalla y configuración a la derecha. La configuración usa el acento de Próximos sin recuadro. Eventos vuelve desde la cabecera.
- El orden de planes comparte `bindListReorder` con Mis Tareas: arrastre con ratón y táctil, cancelación, auto-scroll y flechas del teclado. Arrastre y botones ajustan la hora de referencia del plan movido al intervalo de sus vecinos; el listado siempre conserva el orden horario. Guardar confirma el borrador; salir lo descarta. Las horas reales siguen mandando en eventos, agenda y recordatorios. Este criterio sustituye el bloqueo anterior al reordenar horas diferentes.
- El selector muestra Barbacoa cuarta y Desayunar primero en la segunda fila, con tostadas. Los planes de Pádel y Baile usan símbolos propios sin marco; las rutinas conservan el marco blanco. La cuadrícula reservaba espacio para todas las opciones; al pasar a 29 en v505 conserva el tamaño de tarjeta con scroll interior. Las rutinas activas siguen usando tarjetas compactas.
- Otros puntual arranca con amarillo claro. La paleta, el selector nativo y el hexadecimal actualizan las formas y el símbolo seleccionado mediante el callback compartido del selector de color. Los colores ya guardados se conservan al editar.
- Todas las rutinas, fijas y flexibles, ofrecen Añadir Clase Extra junto a Consultar Histórico. El selector de día mantiene su marco, seis filas semanales y Confirmar visible al cambiar de mes con flechas o swipe; solo se repinta el calendario interior. Mis Datos mantiene los tres atajos con texto en negrita.
- `tools/browser/plans-routines-layout.spec.js` cubre geometría móvil, arrastre y persistencia, cancelación, teclado, colores, alta de extras, recuperación y estabilidad de meses de cuatro, cinco y seis semanas. Revisión visual en Edge oculto con tema claro e iconos profesionales.

## Evento alineado y selección multidía (v472)
- Título/Horas y Notas/Fechas comparten filas de rejilla; la segunda fila reserva sitio para Multidía. Los controles quedan alineados arriba y abajo y mantienen la cabecera y Guardar fijos.
- Puntual y Grande comparten el tono violeta. Grande muestra tres barras, centradas en una fila de la misma altura que los cuatro símbolos de Puntual.
- Por indicación de Ángel del 14/10/2026, Multidía está siempre visible y bloqueado salvo en Otros puntual y Ensayos Boda. Sustituye para esas categorías la restricción de un solo día introducida en v470. Se seleccionan días sueltos; Fecha Fin sigue bloqueada en todos los puntuales. Los demás puntuales continúan ocupando un solo día, y no se crean repeticiones.
- Otros guarda `dates` únicamente con más de un día. Ensayos Boda crea una clase independiente por día, conservando hora y datos de la clase; Deshacer restaura las clases y los cierres anteriores. Cancelar el selector no modifica el borrador; cambiar a una categoría sin Multidía no guarda fechas sueltas nuevas. Los eventos antiguos conservan sus fechas y repeticiones hasta que se cambie expresamente la selección de días.
- El selector anual de días conserva su altura al cambiar de año y reutiliza el panel abierto. `tools/browser/event-form-layout.spec.js` mide filas y centros de los símbolos; `tools/browser/event-form-multiday.spec.js` verifica disponibilidad, guardado, edición, cancelación, cambio de categoría, límites diarios y deshacer.


## Contenido que se desliza y referencias opcionales (v473)
- Por indicación de Ángel del 15/10/2026, al hacer swipe entre meses o pestañas se desliza solamente el contenido que cambia. Las cabeceras, flechas, pestañas, filtros compartidos y acciones permanecen quietos. `addSwipe` utiliza `swipeContentResolver` y `animateContentSwipe`; no habilita nuevos gestos. El gesto anidado sigue teniendo prioridad y se respeta Reducir movimiento. Las copias de transición son inertes, sin IDs y aisladas en un shadow root cerrado para no participar en consultas ni listeners.
- La ficha del día deja Editar a la izquierda y Eliminar a la derecha, fuera de `.ev-car-content`, con papelera de contorno blanco y campana emoji. Los controles de cancelar/recuperar la sesión permanecen dentro del contenido. Eliminar una sesión utiliza el flujo con confirmación y Deshacer; no elimina la rutina. Los cumpleaños abren su propio editor y borran la persona correspondiente. El aviso Deshacer se sitúa por encima de la ficha de sesión para no tapar los controles de estado.
- El orden de planes permite `time:null` y muestra Sin hora. Estos planes conservan la posición de la lista al arrastrarlos; no se les guarda una hora. Para compararlos con horas reales se utiliza una posición entre las referencias vecinas, sin mostrarla como hora ni crear alarmas. Las referencias asignadas se mantienen crecientes; arrastrarlas limita su hora a las referencias vecinas, mientras asignar otra hora recoloca la fila. Ya no hay botones de subir/bajar; el agarre mantiene navegación por teclado. Las preferencias nulas viajan en el backup.
- Multidía está ahora dentro de los paneles Ensayos Boda y Otros puntual, como botón a la derecha; solo se activa en la categoría seleccionada. Sustituye expresamente el control global siempre visible de v472. Las cuatro etiquetas de horario/fecha salen fuera de las tarjetas y siguen alineadas con Título y Notas.
- Otros comienza en amarillo claro y conserva su identidad multicolor en el selector. Las formas de Gestiones, Plan/Quedada y Ensayos Boda se retiran de sus opciones; siguen renderizándose en datos anteriores. Cocinar sustituye a Luna en las opciones nuevas. Baile representa una pareja bailando y ocupa la antigua posición de Cine; Cine pasa a la de Ping pong y Ping pong a la última de Baile. Rutinas activas añade el icono genérico y utiliza el color de texto.
- El selector de semana de una rutina reutiliza el panel y reserva seis semanas, igual que el selector de recuperación/extra. Asignar clases de boda conserva también el marco y las seis filas durante la navegación mensual.

## Previsualización durante el gesto y formulario (v474)
- `js/swipe-render.js` ensambla los renders existentes con un estado temporal restaurado antes de volver al gesto; no ejecuta los callbacks de navegación. `js/swipe-live.js` mantiene la vista siguiente junto a la actual mientras el dedo sigue apoyado, permite invertir el sentido y vuelve al origen al cancelar. Al soltar confirma la navegación y completa la transición. Se aplica a los swipes existentes de meses y pestañas, incluido el arrastre de ratón ya disponible en Energía; no añade gestos nuevos.
- Las copias son inertes y viven en un shadow root cerrado. Conservan sus IDs únicamente dentro de ese árbol aislado para reproducir los estilos específicos, sin entrar en las consultas ni en los listeners de la app. Este criterio sustituye la eliminación de IDs documentada en v473. Se reutiliza una hoja de estilos compilada y se respeta Reducir movimiento.
- Nuevo Evento centra las etiquetas Hora, Hora fin, Día y Día fin, con la fuente y el tamaño de Título y Notas. Rutinas activas comparte tamaño con Ensayos Boda. El resumen de Puntual utiliza el círculo multicolor; Multidía queda separado del borde y adopta el tono de su categoría.
- Boda se añade a Plan/Quedada con las alianzas, sin desplazar las posiciones de los planes anteriores. Reparación sustituye las alianzas en las opciones de Otros. Reparación, Cocinar y Limpiar tienen colores fijos, aplicados también al mostrar eventos importados; las demás formas de Otros conservan paleta libre. Las alianzas guardadas anteriormente siguen representándose y editándose.
- Verificación: `tools/browser/swipe-live.spec.js` comprueba la previsualización antes de soltar, cancelación, inversión, borradores, controles fijos y meses; `tools/browser/event-form-refinements.spec.js` comprueba geometría móvil, tipografía, símbolos y persistencia. Revisión visual en Edge oculto a 320, 400 y 440 px.

## Separación durante el swipe (v475)
- Por indicación de Ángel del 15/10/2026, los contenidos actual y vecino dejan 24 px de separación durante el arrastre y al completar o cancelar la transición, en ambos sentidos. `swipeContentDistance` comparte la distancia entre meses, pestañas y fichas del día. El hueco muestra el fondo de la vista; no reduce el ancho del contenido ni mueve las cabeceras y acciones compartidas.
- Durante el gesto se suspenden las transiciones CSS de los elementos desplazados, para que sigan el dedo sin retraso ni invadan el hueco. Al terminar se restauran sus estilos originales.

## Semanas sin entrada vertical (v476)
- Las tarjetas semanales de Home no tienen animación de entrada ni retardos por fila. Al cambiar de mes acompañan únicamente la transición horizontal compartida, tanto en la previsualización como después de soltar el dedo. Esto elimina la aparición escalonada desde abajo sin afectar a otros usos de `fadeUp`.

## Transiciones sin reajustes y Siesta (v477)
- La vista previa conserva el árbol completo de distribución real en un shadow root cerrado e inerte (`js/swipe-layout.js`): clases, contenedores flex/grid, anchos, padding, valores de formularios y scroll. No se reconstruyen los ancestros con `display:contents` ni se eliminan nodos que reservan espacio. Los IDs quedan aislados del documento y los scripts clonados se retiran.
- Solo el área que cambia se recorta y desplaza, con 24 px de separación y esquinas de 16 px durante el movimiento. Agenda conserva sus bordes habituales al quedar quieta, por aclaración expresa de Ángel del 15/10/2026. Los calendarios interiores recortan su propia cuadrícula y mantienen visibles los controles exteriores.
- Se precisa la norma de v473: cabeceras, pestañas y acciones compartidas permanecen fijas; `.ev-io-row`, con acciones propias de cada vista, viaja con su contenido para no alterar su distribución. La botonera Editar/Eliminar del carrusel sigue fija. El botón flotante de tareas y los avisos pertenecen al documento real y no se duplican dentro de las vistas previas.
- Al soltar se confirma la navegación detrás de la vista previa y se completan las animaciones de entrada antes de revelar el contenido definitivo. No se vuelve a renderizar al retirar la copia. Los swipes sin eventos intermedios usan el mismo mecanismo. Se conserva la prioridad de gestos anidados y Reducir movimiento.
- `evLayoutWeekTitles` comparte el cálculo de fondos de Agenda entre la vista real y su previsualización. Los bordes de las tarjetas de energía declaran sus lados por separado para evitar que CSSOM pierda el borde base al serializar un shorthand con variables y una excepción superior.
- Cada apertura de Crear alarma empieza con mensaje vacío y ningún día seleccionado. Los días guardados por versiones anteriores se ignoran en este formulario y siguen siendo compatibles con las copias de seguridad. Un mensaje vacío se envía vacío.
- Siesta crea una alarma puntual por MacroDroid para la hora actual más 22 minutos, con mensaje Siesta y sin días de repetición, también al cruzar medianoche. Utiliza la configuración y registro existentes; sin URL no crea una alarma.
- `swipe-layout-quality.spec.js` contrasta geometría, fuentes y colores de la previsualización con la pantalla definitiva en Inicio, Agenda y ocho secciones adicionales. Incluye meses enviados, viajes, rutinas, notas y scroll en 320/400/440 px. `alarm-nap.spec.js` verifica aperturas vacías, horario diurno y medianoche con envíos simulados. Validación visual en Edge oculto, tema claro e iconos profesionales.

## Continuidad de pintado y accesos (v478)
- El contenido real y su copia de swipe conservan la misma composición del texto. Los avisos con animación infinita se congelan en su fase actual durante el gesto; la copia reproduce sus propiedades calculadas y se reanudan al terminar o cancelar. La nueva vista pinta un fotograma bajo la copia opaca antes de retirarla; las esquinas vuelven suavemente a su estado de reposo.
- `swipe-paint.spec.js` compara píxeles al comenzar y finalizar en Inicio, Calendario y Agenda, con densidades 1 y 3. Verifica también el relevo sin huecos y la reanudación de los avisos al confirmar o cancelar.
- Actualizar usa fondo del acento de Inicio e icono blanco. Hoy en Inicio comparte el relleno suave del calendario, adaptado al acento de Inicio.
- Próximos Cumpleaños no muestra configuración de planes. El botón Eventos ocupa la misma posición que Cumpleaños en la fila de filtros, con VIP a la izquierda y Añadir centrado.
- Los accesos Consumo y tarifas de Gas y Electricidad están al principio del detalle, bajo las pestañas, con el acento de Gastos del hogar. El detalle permanece alineado arriba aunque sea corto.

## Agenda, minutero y selección de datos (v479)
- La línea bajo Próximos, Agenda, Todos y Estadísticas se dibuja dentro de la barra fija con una sombra interior. Las vistas de swipe no pueden taparla.
- Por nueva petición de Ángel, Agenda mantiene las esquinas de 16 px también en reposo; sustituye el criterio de v477 de redondear solo durante el gesto. Las máscaras superiores usan el fondo opaco de la ventana y los bordes inferiores recortan el área de scroll. El radio final de la transición coincide con el de la vista de destino.
- `bindMinuteDrumMotion` se comparte entre las ruedas de 60 minutos del selector general y Crear alarma. El desplazamiento depende de la velocidad del dedo, con inercia limitada y ajuste al minuto al detenerse o cancelar. Un nuevo toque detiene la inercia. Las ruedas de horas y cuartos de hora conservan su funcionamiento. El cruce de hora de la alarma se procesa una sola vez, al terminar el gesto.
- El acceso Ver análisis de hipoteca encabeza Resumen y Detalle Hipoteca, en Hogar y Fiscal, usando el acento de la ventana correspondiente.
- En consulta de Mis datos, tocar el cuerpo de una tarjeta alterna su casilla y resalta el contorno. El scroll, los botones de copia, las casillas, los desplegables y el modo de edición conservan sus acciones propias.
- `agenda-minute-cards.spec.js` verifica la línea con capturas durante el swipe, los píxeles opacos de las esquinas al hacer scroll, gestos táctiles rápidos/lentos y cancelación, cruces de hora, accesos de hipoteca y selección de tarjetas. Revisar visualmente en Edge oculto con tema claro e iconos profesionales.

## Agenda y notas de peluquería (v480)
- Las cabeceras de mes de Agenda no añaden un segundo borde superior bajo las subpestañas. Su fondo exterior es opaco y la superficie interior tiene esquinas superiores de 16 px, también en los meses siguientes y al hacer scroll. El botón Hoy comparte dimensiones y relleno suave con Inicio, usando el acento de Agenda.
- Mis notas tiene las pestañas General y Peluquería, con altura exterior estable, edición explícita, cancelar y copiar. `PERSONAL_NOTES_TAB` conserva la pestaña durante la sesión. Las notas generales anteriores mantienen su formato y clave.
- `hairdresserNote()` lee `excelia-hairdresser-notes-v1`, que viaja como `hairdresserNotes` en el backup y admite hasta 50 000 caracteres. Los backups antiguos que no incluyen el campo conservan la nota existente. El guardado de ambas notas es atómico.
- Las fichas de eventos de tipo Peluquería muestran las instrucciones actuales al consultarlas, junto a las notas particulares del evento. No se duplican en cada evento ni se sobreescriben sus notas. El texto se escapa como el resto de las notas.
- `agenda-hairdresser.spec.js` comprueba las esquinas con contenido detrás, el formato de Hoy, la edición entre pestañas, el carrusel y la ida y vuelta del backup. Las pruebas de lógica cubren compatibilidad, validación, texto escapado y eliminación de las instrucciones.

## Calendarios, accesos y tema crema (v481)
- La ficha de Peluquería abre directamente Mis notas → Peluquería en edición y actualiza las instrucciones al volver. El enlace también existe cuando la nota está vacía.
- Los tres calendarios comparten la cabecera y el tamaño de Hoy de Inicio. En 1 mes, la bombilla acompaña al año para reservar espacio a los controles. Las iniciales de los días se desplazan con el mes; solo el mes actual resalta el día de la semana presente. Los días de otros meses usan `--surface3`.
- Crema sustituye visualmente a Gris; conserva el identificador `grey` por compatibilidad con preferencias y backups. Comparte las reglas de contraste del tema claro. El símbolo de Comida incorpora un mantel beige fijo, también en oscuro.
- `rutDayTimesHtml` se comparte entre el formulario habitual y el cambio de semana. Las excepciones semanales admiten `times` por día, con prioridad sobre la hora común; el cambio desde una semana guarda ese mapa en el horario habitual. La importación valida ambos mapas, incluidos los históricos.
- Las cinco primeras cifras de Wedding Moves cuentan clases y la sexta parejas. Esta última abre Parejas → Todas, limpia búsquedas y filtros, y ordena por fecha de boda.
- Por petición de Ángel, Ver análisis de hipoteca queda solo en Detalle hipoteca, tanto en Hogar como en Fiscal. Sustituye su colocación anterior en Resumen de v479. En Hogar se alinea con Consumo y tarifas de gas y electricidad.
- Ahora en Crear alarma actualiza ambas ruedas con la hora actual, conservando el mensaje y los días elegidos; no crea una alarma.
- `calendar-notes-controls.spec.js` verifica estos flujos en Edge oculto, las cabeceras a 320/400/440 px, temas claro/oscuro/crema y persistencia de los horarios por día. Las reglas de lógica incluyen su ida y vuelta por backup y rechazan mapas semanales inválidos.

## Agenda y composición del tema crema (v484)
- Agenda comparte `ev-calendar-header` con los tres calendarios, incluidos tamaño de Hoy, bombilla de 24 px y márgenes adaptativos. El mismo marco se aplica a Próximos, Cumpleaños, Todos y Estadísticas para mantener fijas las subpestañas al navegar. Agenda, Todos y Estadísticas conservan además el ancho común del selector. El espacio de las iniciales semanales sigue limitado al calendario mensual.
- Por corrección de Ángel, se sustituye la paleta desaturada de v483 por una composición de petróleo y terracota, con oliva, miel y rosa arcilla como apoyos. Se suavizan los bordes inactivos y el resplandor de navegación; la selección conserva una señal de color clara. Las superficies secundarias son más neutras y el texto usa tinta cálida.
- La comprobación compartida de cabeceras incluye ahora Agenda a 320/360/400/440 px: tamaño, posición de Hoy, centrado, hueco de la bombilla y ausencia de solapamientos.

## Acentos del tema crema (v483, sustituidos en v485)
- Crema conserva sus superficies marfil y arena. Sus acentos propios usan rosa empolvado en Inicio y Cumpleaños, salvia en calendarios, azul pizarra en Económico, eucalipto en Hogar, azul petróleo suave en Próximos, malva en Fiscal/Tareas y ocre en Estudios/Alarmas.
- Esta versión colocaba la paleta en `:root[data-theme="grey"]` de `base.css`. En v485 se mueve a `theme-cream.css` con un selector que también funciona en las vistas previas aisladas del swipe.
- No se modifican los colores personalizados guardados de eventos, parejas, rutinas o tareas. Claro y Oscuro conservan sus paletas. La clave `grey` sigue siendo compatible con preferencias y backups.
- Revisión visual en Edge oculto a 400 × 880: Inicio, calendario, Próximos, nuevo evento, Hogar, Económico, Tareas y Mis datos.

## Cabeceras y controles de calendario (v482)
- Todos los botones Hoy usan esquinas de 9 px. En 1 mes, el día actual se rellena con el mismo verde suave de Hoy, también si cae en fin de semana; se conservan las marcas de festivo o vacaciones.
- El separador de la cabecera vive dentro de su caja fija (`box-shadow:inset`) para que las copias del swipe no lo cubran. Las iniciales siguen deslizándose con el mes y quedan a 4 px de esa cabecera; su anclaje sticky usa el mismo desplazamiento.
- Por corrección de Ángel a v481, la bombilla vuelve entre la flecha derecha y Hoy. Se eliminan las reducciones de fuente y de flechas de los selectores: mantienen sus tamaños originales y esquinas cuadradas. Por debajo de 360 px, las cabeceras reservan una segunda fila para el selector completo en lugar de encogerlo; Hoy sigue en la misma posición en los tres calendarios.
- Crear alarma centra su título con columnas laterales simétricas; Ahora tiene margen interior superior y lateral.
- `calendar-header-refinements.spec.js` comprueba tamaños, alineación y ausencia de solapamientos a 320/360/400/440 px, compara los píxeles de la línea durante el arrastre en ambos sentidos y valida el relleno de Hoy en laborable y domingo. También verifica la cabecera de alarma y la acción de Ahora.

## Horarios, crema y preparación de factura (v485)

- El editor semanal de rutinas usa etiquetas `ev-field`, tarjetas de opción pulsables y un cuerpo con scroll interior. Cabecera, selector semanal, pie y tamaño exterior permanecen estables al activar horarios por día. Se conserva la lógica de excepción semanal y de cambio del horario habitual.
- Crema tiene su paleta completa en `css/source/theme-cream.css`: marfil, ciruela, eucalipto, arcilla y azul pizarra. No hereda los tokens de Claro. Se mantiene `grey` como identificador de persistencia. Los colores personalizados de eventos y rutinas no se reescriben.
- El contexto de las vistas previas del swipe es un elemento con `data-theme`, dentro de un ShadowRoot. `:root[data-theme="grey"]` no coincidía allí: la copia tomaba los colores de Claro y cambiaba al concluir. Los tokens usan ahora `[data-theme="grey"]`, tanto en la pantalla real como en su copia. `swipe-paint.spec.js` compara los píxeles en Claro y Crema con densidades 1 y 3; `theme-cream.spec.js` comprueba el cambio de tema con la hoja de estilos ya cacheada y el contraste de los acentos.
- La disposición de Enviar factura de v485 queda sustituida por la revisión compacta de v486, descrita debajo. Se conserva la privacidad inicial y Kairo visible sin configurar.

### Criterio de mantenimiento tras la revisión del 18/10/2026

- Mantener las pruebas con datos ficticios, el censo de claves del backup y la lista de recursos de publicación. Separar presentación, cálculo y persistencia al tocar módulos; no iniciar una reescritura completa.
- Consolidar estilos por componente y tokens de tema. Evitar seguir acumulando correcciones en `shared-refinements.css` cuando se pueda corregir la fuente responsable.
- Antes de optimizar, medir arranque, preparación del swipe y listas con históricos grandes. La prueba de Energía mide cálculo/render HTML, no fluidez en el móvil. La copia completa del DOM durante el swipe y las bibliotecas PDF cargadas al inicio son candidatos concretos a medir.
- Mapa visual: atlas documental en `docs/visual-map/`, ampliado el 24/10/2026 tras aprobar Ángel el formato del piloto. Incluye secciones, paneles secundarios, estados de scroll, fecha y datos ficticios fijos, flechas desde controles medidos, comparativa e inventario de cobertura y límites. `npm run map:serve` abre el visor; `map:changed` actualiza escenas dependientes y `map:verify` comprueba todas las láminas y las exporta. Alcance y límites en `docs/visual-map/README.md`.

### Norma para el mapa visual (18/10/2026; piloto 24/10/2026)

- Ángel aprobó el piloto y autorizó ampliar al resto de la app el 24/10/2026. El atlas cubre las áreas principales y los paneles secundarios inventariados. Las capturas nuevas siguen pendientes de su revisión visual; no exigir capturas de todas las pantallas en cada tarea ni todas las combinaciones de datos.
- Preferencia vigente de Ángel (27/10/2026; sustituye la regla amplia del 25/10): conservar el atlas como referencia representativa. Actualizar imágenes solo por rediseños, modificaciones sustanciales del menú o diferencias acumuladas importantes. Cambios menores de catálogo, texto o lógica no obligan a recapturar. Ver el criterio de alcance de esta guía. Las pruebas funcionales y los cambios de navegación que requieran ajustar flechas/índice se revisan por separado, sin convertirlos automáticamente en una recaptura general.
- Regenerar solo esas escenas; cambios en temas, fuentes o componentes compartidos regeneran las dependientes. Revisar antes de aceptar; no actualizar referencias a ciegas.
- Usar Edge oculto, viewport móvil fijo, fecha y datos ficticios estables. Registrar el commit de referencia y señalar fichas pendientes para no presentar capturas antiguas como actuales.
- El mapa ayuda a ubicarse en sesiones nuevas y comprobar coherencia; complementa CODEMAP y pruebas, no los sustituye. Evitar un producto documental paralelo o todas las combinaciones de temas/estados.
- La revisión del 25/10/2026 está en `docs/visual-map/review/`: 150 capturas inspeccionadas, hallazgos priorizados, reproducciones ficticias y maquetas aisladas. No se han aplicado correcciones de la PWA como parte de la revisión. Los hallazgos resueltos se retiran o actualizan al regenerar las escenas correspondientes; no conservar avisos de defectos ya corregidos ni dar por revisadas capturas futuras con la revisión antigua.

## Revisión compacta de factura (v486)

- Orden: días trabajados plegados, cálculo visible y acciones Kairo debajo. En móvil deben verse juntos al entrar; importe oculto por defecto y cabecera fija. El despliegue de días conserva el tamaño exterior y usa scroll interno.
- Jornadas: lunes a viernes menos festivos, vacaciones y ausencias/bajas, con fechas por motivo. No descontar fines de semana. Incluye planificación, igual que Home. Con PDF definitivo se respeta la selección guardada y no se inventan motivos históricos desde el calendario actual.
- IVA e IRPF reutilizan `--c-orange` y `--c-red`, como Económico. Eliminar explicaciones duplicadas y el acceso al Excel auxiliar del menú; mantener descarga JSON y flujo manual de PDF/Gmail. No cambia cálculo monetario, contenido firmado ni transporte Kairo.
- Hipoteca y Consumo y tarifas comparten la regla de geometría de su botón, conservando sus acentos.

## Revisión de prioridades de mantenimiento — 18/10/2026

Base revisada: `084d90d` (v486). Revisión dirigida del índice, estilos, navegación,
previsualización, rutinas y fiscalidad; no una certificación exhaustiva de toda la app.
Esta tarea cambia solo documentación. No ejecuta los refactors ni corrige la incidencia
descrita debajo. No se han usado datos personales.

La base ya dispone de módulos, catálogo único de recursos (`app-assets.json`), construcción
por lista permitida, helpers de dominio y pruebas de lógica/navegador. Conviene conservar
esa arquitectura y reducir dependencias implícitas gradualmente. Facturas y Energía
ya separan varias responsabilidades: no son el primer objetivo por tamaño de archivo.

### Orden recomendado

| Orden | Zona y evidencia en v486 | Primer trabajo acotado | Contrato que comprobar |
|---|---|---|---|
| 1 | **Fiscal: dibujo con escritura.** `renderFiscalTabDespachoOnly` en `js/economics-fiscal-hip.js:288` calcula y guarda intereses en la línea 316. `swipeWithState` (`js/swipe-render.js:2`) restaura globales, pero no deshace esa escritura. Caso reproducido abajo. | Primero una prueba de caracterización del caso. Después, una corrección funcional separada que defina cuándo se persiste el interés derivado y permita dibujar sin guardar. No cambiar fórmulas ni redondeos. | Mismo cálculo y HTML; previsualizar/cancelar no altera memoria, claves guardadas ni borradores; guardar explícitamente conserva el resultado correcto. Cubrir intereses automáticos/manuales y varios años. |
| 2 | **CSS compartido.** `shared-refinements.css` mezcla reglas de muchos módulos en 1.067 líneas. Ejemplo: `.sy-back` nace circular en `base.css:236` y se vuelve cuadrado en `shared-refinements.css:1033`; Hoy tiene otro reparto similar (`base.css:54`, `shared-refinements.css:1036`). | Elegir una familia, por ejemplo Atrás/flechas/Hoy, inventariar todas sus variantes y consolidar la regla efectiva. No mover en bloque el archivo ni alterar el orden de `styleSources` para resolver una pantalla. | Geometría y estilos calculados idénticos en Home, calendarios, Agenda y paneles; temas y estados activo/desactivado afectados; esquinas opacas, scroll y swipe. La comparación de HTML sola no basta. |
| 3 | **Navegación y fichas de Eventos.** `_bindEvNav` agrupa 202 líneas; `openEvDetail` reúne controles de eventos, cumpleaños, rutinas, bodas y notas. El orden de pestañas se repite en `_evSwipeUpcoming` (`events-bind.js:614`) y `swipeEventsPreview` (`swipe-render.js:25`). | Extraer primero el orden/destino de navegación como datos compartidos entre gesto y vista previa, manteniendo los efectos en el controlador. Después separar binds de la ficha por tipo y acotarlos a `wrap`, una extracción por cambio. | La vista previsualizada coincide con la abierta; mismos límites, Atrás, fecha seleccionada y scroll; no duplicar listeners; cancelar no cambia estado; conservar enlaces hacia rutinas/bodas/notas y pie fijo. |
| 4 | **Editor semanal de Rutinas.** `_rutWeekRender` (`js/rutinas.js:469`, 95 líneas) construye HTML, abre el panel, captura borrador, enlaza controles, valida y guarda. El dominio ya ofrece `rutChangeWeek` y `rutNewSchedule`. | Extraer render y lectura/validación del borrador manteniendo esos helpers de dominio. Luego aislar los binds y consultas DOM del panel. Es una primera extracción JS manejable, sin rehacer todo Rutinas. | Misma salida y altura; horarios por día; guardar una semana o desde una fecha; cancelar/restablecer; cupos, sesiones pasadas, extras y recuperaciones. Reutilizar `routine-week-layout.spec.js` y las pruebas `test-rutinas-*`. |
| 5 | **Presentación económica y contexto fiscal/Hogar.** `_renderAnalisisGastos` (`economics-analisis.js:32`, 250 líneas) agrega importes y produce HTML. `economics-fiscal-hip.js` reúne fórmulas, vistas y edición; `reRenderFiscal` cambia de destino según `FISCAL_ENTRY`. | Tras aislar la escritura del punto 1, extraer el modelo de lectura de una vista económica y pasar su resultado al render. Delimitar el host Fiscal/Hogar usando sus helpers existentes; no duplicar fórmulas. | Resultados numéricos y precisión idénticos; cruces de año, tarifas, períodos y subrogaciones; cancelar edición y volver al mismo detalle; backup e importación. |

El punto 1 quedó corregido de forma aislada en v487 (ver resolución debajo).
El primer paso del punto 2 (Atrás, flechas y Hoy) queda realizado en v488; el resto del CSS compartido no se reorganiza en bloque. El primer paso del punto 3 (orden compartido entre swipe y vista previa) queda realizado en v504. Los binds por tipo de ficha del punto 3 y los puntos 4–5 siguen pendientes; son oportunidades de organización, no fallos funcionales demostrados.
El número de líneas orienta la lectura; el orden responde a efectos secundarios,
consumidores compartidos y posibilidad de hacer cambios acotados.

### Incidencia reproducida en v486 (corregida en v487): previsualización fiscal con escritura

En un contexto aislado de `tools/entorno.js`, con una hipoteca ficticia de 100.000,
3 %, 20 años desde 2025-01-01, año fiscal 2026 e intereses automáticos inicialmente 0,
dibujar Despacho escribió `excelia-despacho-v1`. Ejecutarlo mediante `swipeWithState`
restauró la pestaña y el objeto original en memoria (interés 0), pero el almacenamiento
quedó con interés 2836.6. Se comprobó la ruta de render/previsualización en el entorno
simulado, no una grabación del gesto en el teléfono. No demuestra pérdidas de datos
del usuario; sí demuestra un efecto persistente al dibujar que debe aislarse.

Reproducción con datos ficticios, desde la raíz, en Node:

```js
const a = require('./tools/entorno').cargarApp({});
require('node:vm').runInContext('window=globalThis;', a);
a.loadDespacho();
Object.assign(a.DESPACHO.compra, {
  importePrestamo: 100000, tipoInteres: 3, plazoAnios: 20, fechaInicio: '2025-01-01'
});
a.FISCAL_YEAR = 2026;
a.FISCAL_TAB = 'gastos_desg'; a.FISCAL_IRPF_SUB = 'despacho';
a.DESPACHO.hipotecaIntereses = 0; a.DESPACHO.hipotecaInteresesManual = false;
a.saveDespacho();
const before = a.appStorage.getItem(a.DESPACHO_SK);
a.swipeWithState({ FISCAL_TAB: 'irpf_deduc' }, () => a.renderFiscalContent());
console.log(a.DESPACHO.hipotecaIntereses); // 0: memoria restaurada
console.log(before === a.appStorage.getItem(a.DESPACHO_SK)); // false: escritura persistente
```

Las pruebas existentes de swipe comprueban estado, almacenamiento y borradores en
sus escenarios, pero el caso fiscal revisado empieza en Personal y no caracteriza
esta combinación de subpestaña Despacho e intereses automáticos. Añadir ese escenario
es más útil que aumentar pruebas que solo repitan la implementación.

### Qué no priorizar ahora

- Optimizar la velocidad de un swipe que Ángel considera fluido, cambiar animaciones
  o introducir cachés para resolver un problema de organización.
- Reescribir los tres calendarios, cambiar de framework o fragmentar todos los archivos
  largos de una vez. El cálculo de barras y marcadores tiene contratos delicados.
- Reorganizar primero importación/backup o el protocolo Kairo por estética: tienen
  validaciones y contratos que conviene conservar. Modificarlos cuando haya una necesidad concreta.
- Construir ya el mapa de capturas: sigue siendo una propuesta separada, con sus normas.


## Previsualización fiscal sin escrituras (v487)

- Corrección aislada del punto 1 de la revisión. El ejemplo anterior describe v486;
  ahora la comparación del almacenamiento devuelve `true`.
- `renderFiscalTabDespachoOnly` calcula el importe mostrado en una variable local,
  sin modificar `DESPACHO` ni llamar a `saveDespacho`.
- La sincronización automática anterior se ejecuta en `_bindTabDespachoOnly`, solo
  al activar la vista real. Se mantiene ese momento de actualización para conservar
  los consumidores fiscales existentes; no se cambia el modelo de persistencia ni
  se recalcula al abrir Hogar. Previsualizar o cancelar no activa ese controlador.
- Se conservan la fórmula, el redondeo, el valor manual y el respaldo cuando el
  cálculo no es positivo. Sin cambios de HTML, CSS, animación ni formato de backup.
- Regresión en `tools/test-household.js`: fallaba con v486 por escritura durante
  swipe; ahora verifica render directo, identidad y contenido en memoria, persistencia,
  activación real, importe manual, año sin intereses y consumo por la deducción.
  `swipe-live.spec.js` añade el gesto cancelado/confirmado, cambio de año, manual,
  Recalcular y Guardar configuración en navegador.
- Verificación: HTML anterior/nuevo idéntico en 12 escenarios (tres años, manual/auto,
  con/sin subrogación); 53 instantáneas sin actualizar, suite lógica completa y
  20 pruebas de interacción en Edge oculto, incluidas las de Hogar y otros swipes.
  Comparación visual anterior/actual en Edge a 400 × 880: capturas idénticas con
  intereses automáticos y manuales, tras finalizar las transiciones.


## Orden de los controles de navegación (v488)

Alcance previo: consolidar Atrás, flechas y Hoy; consumidores Home, calendarios,
Agenda, Cumpleaños, Fiscal, Energía y paneles de detalle/histórico. Invariantes:
misma geometría, colores, tipografía, foco, pulsación, navegación y swipe.
Comparación de estilos calculados y capturas antes/después, más interacciones.

- `css/source/navigation-controls.css` reúne la base y las variantes de los
  controles compartidos. El catálogo lo inserta tras `base.css` sin reordenar las
  hojas existentes. No añadir correcciones de esta familia a `shared-refinements.css`.
- La disposición de cabeceras y las variantes de contexto (p. ej. las flechas de
  Energía a 34 px o Atrás en la exportación a 34 px) permanecen en sus módulos.
- El carrusel combina `.ev-car-arrow` con `.ev-btn`. Se conserva expresamente
  esa cascada en `event-panels.css`: aspecto previo a la base de acción y geometría
  definitiva después. Su fuente/padding/borde efectivos proceden de `.ev-btn`.
- Se eliminan los radios circulares sobrescritos y las antiguas reglas verdes de
  Hoy en Cumpleaños que quedaban anuladas por su acento propio. No se cambia JS, HTML,
  estructura de datos ni listeners (salvo el identificador de versión).

Observaciones pendientes, sin rediseñarlas en este refactor:

- Resuelto por separado en v489: la fuente y el padding de Hoy de Cumpleaños
  pasan del HTML a `#bdToday` en `navigation-controls.css`, con los mismos valores.
  El alias `.bday-jump-today` conserva su tamaño independiente.
- Las flechas conservan tamaños de 32, 34 y 36 px según el contexto; los controles
  compartidos tampoco fuerzan todos la misma familia tipográfica. Unificar esos
  valores o ampliar la zona táctil requiere decidir un cambio visual/funcional.
- El alias `.bday-jump-today` no tiene consumidores en el JS actual; se conserva
  su estilo final por compatibilidad. Evaluar su retirada junto al antiguo dock,
  tras revisar rutas/fixtures, en vez de mezclar limpieza de UI con esta extracción.

Verificación: 60 comparaciones antes/después en Edge oculto, con estilos calculados
y capturas idénticos (10 vistas; claro a 320/400/440/1000 px, oscuro y crema a 400 px).
Se comparó sustituyendo únicamente la hoja CSS en la misma página ya estabilizada,
para evitar diferencias de rasterizado entre contextos de navegador. Las 53
instantáneas HTML permanecen intactas y la suite lógica pasa. El contrato de
teclado, pulsación, desactivación, Atrás, flechas y Hoy de
`navigation-controls.spec.js` pasa tanto con la hoja anterior (opción local
`NAVIGATION_BASELINE_CSS`) como con la actual. Las pruebas de calendarios, Agenda,
Energía y swipe cubren los consumidores compartidos.

Verificación de v489: estilos calculados y capturas antes/después idénticos en Edge
oculto (Cumpleaños en claro a 320/400/440 px, oscuro y crema a 400 px). Se restituye
el atributo inline al comparar la versión anterior. La prueba de navegación cubre
también avanzar un mes y volver con Hoy en Cumpleaños, en los tres temas. Pasan
`npm test`, las seis pruebas de navegación/cabeceras y `npm run build`;
las 53 instantáneas existentes no cambian.

## Clases concretas, planificación y cambio de día (v490)

- El botón Editar de una sesión en el detalle del calendario reutiliza el editor
  del histórico. Modifica esa clase, no la configuración completa. Las flexibles
  planificadas admiten cambiar el día; las fijas conservan su día y permiten cambiar
  hora/duración. Extras y recuperaciones mantienen sus reglas y vínculos existentes.
- `rutRescheduleSession` valida sobre una copia, conserva el origen para el histórico
  y elimina la marca de cambio al volver al día/hora/duración originales. No mueve
  una sesión vinculada a una recuperación ni sobrescribe otra clase.
- Planificar sesiones permite seleccionar varios días y guardar un horario común
  una sola vez. `rutFlexPlanSessions` reutiliza la validación individual sobre una
  copia y devuelve el lote completo: errores de cupo, pausa o colisión no guardan
  altas parciales. Cerrar descarta la selección sin guardar.
- Las clases ya planificadas abren el mismo editor individual. Se retira de este
  panel la antigua cancelación de flexibles, que contradecía la regla vigente de
  cancelación exclusiva para rutinas fijas. Las canceladas importadas siguen
  admitiendo reactivación desde su editor.
- El planificador tiene cabecera/pie fijos, scroll interior y seis filas de días.
  El acceso flotante a tareas se oculta mientras está abierto para no tapar Guardar.
- `initCalendarDateRefresh` repinta calendarios abiertos al cambiar el día local:
  medianoche, vuelta a primer plano, foco o restauración de la página. Conserva
  el mes consultado, scroll y formularios; no fuerza recargar la PWA ni guarda datos.
- Recordatorios: propuesta visual presentada en v490, aprobada y aplicada en
  v491 con pendientes primero (ver apartado siguiente).

Validación: pruebas de lote atómico/cupos, movimiento/reversión y backup; Edge
oculto con alta múltiple, cierre sin guardar, edición flexible/fija, recarga y
cambio de fecha (incluido cambio de hora de octubre). Revisión visual móvil en
claro a 320 y 400 px y comprobación adicional del tema oscuro.

## Recordatorios agrupados (v491)

- Pendientes es el primer bloque, antes de Cumpleaños: resumen rojo y desplegable
  para tareas, semanas sin enviar y los avisos existentes. No cambia su cálculo.
- Cumpleaños conserva sus símbolos propios y VIP, dos personas visibles y el
  desplegable de las restantes. Los eventos puntuales se agrupan por Hoy/Mañana,
  con el orden compartido del calendario, sin repetir el día en cada tarjeta.
- Los eventos grandes tienen una sola tarjeta, periodo y trayectos de hoy/mañana;
  al desplegarla se conservan las notas de ambas ocurrencias. Los títulos completos
  y notas quedan accesibles sin hacer más altas las filas cerradas.
- La alarma ⏰ consulta el indicador persistido existente por evento. Se carga al
  abrir Recordatorios, incluso antes de abrir Calendario; no crea ni modifica alarmas.
- Estilos propios en css/source/home-reminders.css, retirando las antiguas reglas
  repartidas. Cabecera y tamaño exterior estables; el contenido tiene scroll interior.
- Verificación: Edge oculto a 400 y 320 px, grupos, símbolos, alarmas al arrancar,
  expansión sin saltos, notas de ida/vuelta y accesos a tareas. Sin cambios de backup.

## Recordatorios compactos y pendientes visibles (v492)

Corrección de la propuesta tras revisar las capturas con Ángel:
- Pendientes deja de ser un desplegable. Muestra siempre las tres primeras tareas
  realmente pendientes, en el orden compartido de Mis tareas, y todos los avisos
  de semanas sin enviar. Las completadas no entran en esa selección.
- Se retira el summary y su interacción de Pendientes: la regla global de hover
  ya no puede pintar el rectángulo gris sobre la cabecera roja.
- Hoy y Mañana son listas continuas con contorno común y separadores interiores.
  Hoy usa el azul del tema; Mañana, el verde. Los iconos conservan su identidad.
  Es una excepción autorizada a la separación general de 10–12 px entre tarjetas.
- Los títulos de planes se muestran íntegros, en tantas líneas como necesiten.
  Las notas siguen desplegándose dentro del marco fijo del menú.
- Verificación Edge móvil: tres pendientes en orden excluyendo completadas,
  semanas visibles sin pulsar, colores distintos por día, filas unidas, textos
  de más de dos líneas sin recorte, símbolos, alarmas y acceso a Mis tareas.

## Wedding Moves: acciones y estadísticas (v493)

- Clases ofrece Añadir clase y Añadir pareja en una misma fila, con iguales
  dimensiones. Ambos reutilizan los formularios y guardados existentes; crear una
  pareja desde Clases conserva esa subpestaña.
- Las acciones principales, Guardar y los controles seleccionados usan --wm-wine,
  también en los paneles de Bodas. La base compartida de io-primaria admite
  --io-primary/--io-primary-ink, conservando sus colores previos fuera de Bodas.
- Resumen de parejas separado del de clases: total, pasadas, en curso y próximas.
  Usa bodaMatchesDate, igual que los filtros de Parejas; próximas significa future.
  Todos los recuentos de parejas enlazan al filtro correspondiente, por fecha de boda.
  Se informa aparte de cuántas parejas tienen alguna clase impartida.
- bodaStatsOverview reutiliza bodaTaken para impartidas (pareja asignada y clase
  finalizada, incluida la hora/duración de hoy). Las otras clases asignadas son
  pendientes; las no asignadas se muestran por separado. Las tres cifras suman el total.
  Corrige la antigua diferencia con la distribución, que sí consultaba la hora de fin.
- Ritmo programado conserva las medias y aclara que incluyen todos los registros,
  incluso futuros y huecos sin pareja. Gráficos mensuales/semanales sin cambios de fórmula.
- Distribución por clases impartidas: filas con clases recibidas y número de parejas,
  barras proporcionales y fila Sin empezar (cero clases). Incluye todas las parejas;
  bodaPackStats conserva el cálculo de extras y los packs históricos.
- Verificación: límites horarios de hoy, sin hora, sin pareja, cero clases/parejas,
  enlaces de estados, altas desde Clases, persistencia y colores en Edge móvil.

## Recordatorios: color y desplegables útiles (v494)

- Cumpleaños usa su acento en el título, los contornos y un fondo suave. Hoy y
  Mañana conservan sus listas compactas azul y verde.
- «Planes en curso y próximos» sustituye a «Planes de varios días». Su marco
  usa un tono neutro del tema, independiente del color de cada evento.
- Solo las tarjetas con notas generales o del día se despliegan. Los campos
  vacíos o con espacios no crean un desplegable; las demás filas no reaccionan
  al pulsar. Un signo + identifica las notas y cambia a − al abrirlas.
- El contenido desplegado muestra las notas sin repetir el título. Los planes
  grandes conservan las notas de hoy y mañana, dentro del mismo marco estable.
- Validación en Edge oculto a 400 y 320 px: notas y texto escapado, teclado,
  tarjetas sin descripción, alto estable, títulos largos y consumidores compartidos.

## Recordatorios: accesos y edición directa (v495)

- Cumpleaños se agrupa en un único panel con su color y separadores interiores,
  también al mostrar los cumpleaños adicionales. Conserva los símbolos y el orden.
- Mantener pulsada una fila abre el editor existente de cumpleaños, evento,
  sesión concreta de rutina o clase de boda. F2 ofrece la misma acción con teclado.
  Se reutiliza addLongPress: mover el dedo cancela el gesto; soltar tras una
  pulsación larga no debe desplegar las notas. La pulsación corta no cambia.
- La navegación usa navigateMain con un destino opcional para abrir la ficha en
  Calendario 1 mes. Conserva el cierre común de las otras ventanas, incluso al
  entrar en Recordatorios desde Ajustes de Hogar u otra sección.
- Mis tareas y Ajustes comparten .reminders-access: campana y texto sobre el
  acento amarillo del tema. Ajustes lo coloca a la derecha del selector de tema.
  Mis tareas dentro de Pendientes es un botón con icono, contorno y color propio.
- Pruebas con datos ficticios: tres tareas y una semana sin marcas ni envío,
  cumpleaños plegados/desplegados, accesos a 320/400 px, guardar/cancelar desde
  los editores, cancelación del gesto al desplazar y navegación entre ventanas.

## Recordatorios: edición desde la tarjeta (v496)

- Los accesos a Recordatorios en Tareas y Ajustes muestran solo texto, sin campana.
- Mis tareas pasa a la derecha de la cabecera de Pendientes. Su botón contiene
  el recuento; se retira el resumen numérico duplicado de tareas/avisos.
- En eventos puntuales, incluidos ensayos y sesiones de rutina, mantener pulsado
  o usar F2 muestra Editar y × a la derecha de la fila. Solo Editar abre la ficha.
  × o Escape cancelan sin abrir ni guardar; solo una fila ofrece estas acciones.
- La selección es estado temporal HOME_REMINDER_EDITING y se limpia al abrir o
  cerrar Recordatorios. Las notas conservan su pulsación corta y estado desplegado.
  Cumpleaños y eventos grandes conservan la edición directa mediante pulsación larga.
- Verificación: gesto táctil, cancelación, cambio de fila, teclado, notas, editores
  específicos, navegación y geometría móvil a 320/400 px. Sin cambios de persistencia.

## Revisión visual v498: decisiones aplicadas

- El botón flotante de Tareas se oculta temporalmente mientras está abierto un panel secundario creado por `abrirPanel`, el editor de jornada, el panel de alarma o Fiscal. La preferencia y posición del botón se conservan; al cerrar recupera su visibilidad habitual.
- `events-alarm-policy.js` decide las ocurrencias y trayectos elegibles, compartido por ficha, Próximos y confirmación. Un evento con hora deja de admitir alarmas exactamente al inicio. Sin hora se mantiene el criterio por fecha; la vuelta futura se evalúa separadamente. Al confirmar se vuelve a comprobar el inicio y un margen mínimo de cinco minutos para el aviso. Los atajos conservan el día anterior cuando cruzan medianoche.
- El acceso a la alarma usa emoji 🔔, texto y estado. La ficha de un evento grande agrupa fechas, hora del evento y las salidas de transporte por separado. El carrusel conserva un alto exterior de 64dvh y scroll interior.
- Una barra grande comienza en el borde antes de las 13:00 y en la mitad de la primera casilla desde las 13:00; sin hora ocupa la casilla completa. Esta mitad se combina con los relevos existentes sin descontarla dos veces. La hora de transporte no sustituye a la hora del evento.
- Una recuperación puede ser anterior o posterior a la original, también el mismo día a otra hora. Se conservan el inicio de la rutina, los límites diarios, la unicidad y el vínculo con la original cancelada, tanto al guardar como al importar.
- El informe conserva las pruebas anteriores y añade capturas reales del resultado. A01–A06 quedan resueltos; A07–A13 siguen pendientes. La cobertura de 150 capturas iniciales es histórica, verificable contra su commit; regenerar el mapa no equivale a aprobar visualmente todos los estados futuros.

## Revisión visual v499: P2 aplicados

- A07: el calendario de cumpleaños ocupa el ancho disponible y conserva casillas de altura fija. Muestra dos nombres cortos en una línea con elipsis, prioriza VIP y ofrece un contador para abrir el listado completo del día. Pulsar un día con personas abre ese listado; los días vacíos siguen abriendo el alta con fecha preparada. No se cambia ningún cumpleaños al consultar.
- A08: los formularios de pareja y rutina reutilizan el marco fijo de los formularios existentes y los componentes de cabecera, cuerpo y pie. El cuerpo es el único que desplaza campos y paletas. Cancelar y Guardar permanecen visibles y el borrador no se aplica al cancelar. Se conservan los contratos de guardado y la persistencia anteriores.
- A09: Multidía abre el mes ampliado; las flechas permiten cambiar mes/año y el resumen anual ofrece doce controles de mes. Los días del resumen son informativos: la selección se hace en los botones grandes del mes. Siempre se reservan seis filas. `EV_DATE_PICKER` es el borrador explícito; los renders no escriben, la navegación conserva selección y contenedor, Cancelar descarta y Aceptar devuelve los días ordenados.
- A10: el reparto eléctrico solo dibuja proporciones cuando hay consumo desglosado positivo. Sin lecturas muestra un estado neutro; con lecturas de cero muestra cero sin inventar porcentajes. La cobertura parcial se indica y las proporciones se refieren solo a los días documentados. No se modifican cálculos, lecturas ni estimaciones.
- A11: Ajustes nombra sus accesos Correo de horas, MacroDroid y Facturas y correo, conservando consulta protegida, edición explícita y guardado.
- El atlas añade los recorridos de resumen anual y selección mensual de Multidía, listado del día de cumpleaños y salto a una persona. El informe conserva las comparativas históricas de v498 y añade los resultados de v499. Solo A12 y A13 (P3) quedan pendientes; no se avanza sobre ellos en esta fase.

## Revisión visual v500: P3 y ajustes solicitados

- A12: Herramientas introduce el propósito de los escenarios y separa Trabajo/Hogar con controles mayores. Economía elimina abreviaturas en pestañas. Fiscal usa dos columnas para entradas legibles, títulos de sección, tarjetas y campos/períodos mayores; se mantienen los cálculos, datos y guardado.
- A13: Coste distingue todos los meses no calculables (explicación compacta con motivos), cobertura parcial (gráfico y nota) y cero conocido (valor válido). IVA real/sin IVA/constante siguen explícitos; la comparación con facturas usa siempre IVA histórico.
- Recordatorios en Ajustes mide 44 px de alto, como los iconos profesionales.
- Ángel pide deshacer A09: se restaura exactamente el selector anual y su CSS anteriores a v499. Esta petición sustituye la regla mensual de la sección histórica v499; no queda pendiente de reaplicación. Se mantienen los demás P2.
- Atlas actual: 162 capturas y 165 relaciones tras retirar los dos estados exclusivos de la propuesta mensual y añadir cuatro recorridos de estimación explícita del coste. Se conserva toda la evidencia de v498/v499 y la cobertura inicial de 150 capturas.

## Ajustes compactos v501

Ángel aclara que Tema debe recuperar su grosor original y Recordatorios debe ser todavía menor que en v500. Se elimina la altura/min-height forzada de Recordatorios: la fila vuelve a tomar la altura natural de Tema (33 px en la referencia), y ambos quedan iguales. Esta petición sustituye el objetivo inicial de 44 px, sin imponer una nueva altura absoluta dependiente de la fuente. El mapa y el informe conservan las capturas v499/v500 y añaden v501. La escritura de PNG del atlas reutiliza el guardado atómico para soportar bloqueos transitorios de archivos en Windows.

## Tareas, Wedding Moves y estadísticas v502

- Recordatorios comparte la caja de 90 × 33 px entre Ajustes y Tareas. La petición de igualar ambos accesos sustituye la dependencia de la altura natural de la fila de Tema de v501; Tema conserva su grosor.
- Pulsar texto o fondo de una tarjeta de tarea usa la misma acción que su checkbox. Solo los tres puntos abren o cierran el editor. Los controles internos y el arrastre no propagan una segunda selección; se conservan Mover explícito, Deshacer, recuperación de fechas e identidad de gestiones enlazadas.
- Añadir clase y Añadir pareja comparten acento suave con la subpestaña activa, tanto en Clases como en Parejas; Guardar conserva la jerarquía de confirmación. La variante primaria acepta `--io-primary-border` con el mismo valor anterior como respaldo para el resto de consumidores.
- `statistics-ui.js` y `statistics.css` son la fuente del marco común: título, métricas, contenido y notas. Wedding Moves aplica ese marco también a gráficos por período, extras, profesores y distribuciones; Rutinas y Próximos lo reutilizan con sus métricas y colores. No se han cambiado las fórmulas, períodos, recuentos, filtros, datos ni enlaces de edición.
- El atlas añade el estado de tarea marcada y los recorridos inferiores de las tres estadísticas, con flechas de scroll y los enlaces cruzados a Rutinas/Wedding Moves. La comparación v501/v502 conserva datos ficticios equivalentes y código histórico cuando se muestra el formato anterior.


## Mantenimiento incremental del atlas (25/10/2026)

Pieza y consumidores: selección y metadatos de `tools/visual-map/generate.cjs`,
visor e imágenes exportadas del atlas. Invariantes: mismas rutas reales, datos
ficticios, flechas medidas, detección de cambios compartidos y separación entre
inspección técnica y aceptación del usuario. No cambia ningún recurso de la PWA.

`tracking.cjs` concentra planes y huellas con cachés limitadas a la ejecución.
Los contratos del catálogo se comparan por escena, los estilos aislados declaran
sus grupos y los estilos nuevos/mixtos permanecen globales. La versión visible
se separa de la lógica de core. `map:plan` permite comprobar el alcance sin
capturar. `map:verify` mantiene la verificación completa del visor y reutiliza las
exportaciones de contenido idéntico. No regenerar referencias a ciegas.

La revisión sigue a la huella de la imagen: se conserva si no cambia y pasa al
historial si la nueva captura es distinta. La migración contrasta fuentes y
recorridos antes de sustituir las antiguas dependencias generales; no toma el
commit documental como una modificación de la app. La inspección de las 150
capturas iniciales conserva su evidencia histórica, sin aprobar estados nuevos.

Comprobaciones: contratos de selección, caché, fuentes añadidas/eliminadas,
versiones, cambios compartidos, revisión e independencia de las exportaciones;
recaptura aislada en Edge; verificación del visor y pasada posterior sin cambios;
pruebas generales y build. Las herramientas y documentos no incrementan la
versión ni forman parte de `dist/`.


## Calendario mensual y trayectos (v503)

Los fines de semana ajenos al mes conservan el mismo fondo apagado y halo de
marcadores que los otros días fuera del mes. La variante de fin de semana se
limita a las casillas del mes para que su especificidad no anule ese estado.

`evBarTravelTimes` lee las horas de ida/vuelta mediante `evTramos`, con las horas
generales como respaldo. El calendario de un mes pasa ese criterio a
`_evMarcarMitades`: ida desde las 13:00, media casilla inicial; vuelta antes de
las 13:00, media casilla final. Solo se recortan los extremos reales, no cada
corte de semana o mes. Las fechas y horas guardadas no cambian; anual y cuatro
meses conservan su criterio previo. Una combinación antigua contradictoria en
un único día mantiene la barra visible.

Pruebas de geometría a 320/400/440 px, días ajenos al principio/final del mes,
prioridad de transporte, las cuatro categorías grandes, cortes, respaldo sin
hora de trayecto y render sin escrituras. Comparación con v502 en
`docs/visual-map/review/calendar-v503.html`; el fixture del atlas prescinde de la
hora general del viaje para no enmascarar esta regresión. La unificación del
orden entre swipe y vista previa sigue pendiente: esta tarea solo explica esa
propuesta y corrige las dos incidencias solicitadas.


## Orden compartido de swipe (v504, 26/10/2026)

Pieza y consumidores: listas de Próximos, Wedding Moves y Rutinas en
`swipeEventsPreview` y `_evSwipeUpcoming` / `_evSwipeBodas` / `_evSwipeRutinas`.
Invariantes: mismo orden, extremos sin vuelta al inicio, alias Cumpleaños,
restauración de fecha y scroll, filtros de parejas y previsualización sin
escrituras. Primer paso: compartir únicamente las listas, conservando los
efectos de navegación en cada controlador. Caracterizar todas las transiciones
y límites antes y después, y conservar las instantáneas. La reorganización del
formulario de alta se registra en un cambio funcional separado.


Resultado del primer paso: `EV_SWIPE_ORDER` en `swipe-render.js` es la única
fuente de las tres listas; los controladores mantienen sus efectos previos.
Las 53 instantáneas quedan iguales. La caracterización pasa antes y después:
24 transiciones/límites, alias Cumpleaños, fecha recordada y filtros; la batería
de gestos y previsualización pasa sus 18 casos. El mapa declara la dependencia
de `swipe-render.js` desde Eventos y se actualiza al cerrar la publicación v504.


## Alta de eventos por categoría (v504)

Preferencia de Ángel del 26/10/2026: al crear, elegir primero clase y categoría;
el bloque de nombre, notas, fecha y horas queda al final. `renderEvFormLead` se
ensambla una sola vez y se coloca al principio al editar o al final al crear.
No se duplican campos, se cambian bindings ni se altera el guardado. Los datos
específicos de la categoría, colores y trayectos conservan sus controles.
La cabecera y Guardar siguen fijos y el desplazamiento vive dentro del panel.

La instantánea de edición y las otras 52 previas se conservan. Se añade una
referencia del formulario vacío nuevo y pruebas móviles a 320/400/440 px de
orden, tamaño exterior, autocompletado de categoría, horas, guardado, recarga y
cancelación. El atlas añade la escena de datos al final del alta, enlazada con
la entrada por una flecha de desplazamiento.


El cierre de v504 añade una regresión del mantenimiento: al recapturar, el orden
interno de los campos puede diferir del que se obtiene al recargar el JSON. La
comparación del índice usa igualdad estructural (conserva orden de arrays e ignora
solo fecha/commit globales), para no reescribir contenido idéntico por el orden de
las propiedades. Una huella, revisión o flecha distinta sigue actualizando el índice.


## Planes nuevos y compatibilidad del orden (v505)

Se incorporan Fiesta, Plan exterior, Navidad (abeto decorado), Torneo (copa) y
Fútbol (balón independiente de Ver partido fútbol), con el mismo sistema SVG
que los demás planes. Baile pasa a Salir a bailar en el catálogo de planes.
`evPlanType` reconoce el nombre anterior en eventos, colores, símbolos y
preferencias de orden. No modifica títulos personalizados ni los nombres de rutinas.

Al añadir categorías, `evPlanOrderData` conserva primero las filas guardadas,
con sus referencias y posiciones; los tipos nuevos se añaden al final sin hora
si ya existen preferencias. El catálogo visual de Más Opciones es independiente
de ese orden personal. `validateEvPlanOrder` normaliza el alias antes de validar
para evitar que el nombre antiguo invalide la configuración completa; sigue
rechazando duplicados canónicos y horas inválidas/decrecientes. Leer el orden no
reescribe localStorage, y los backups anteriores siguen admitidos.

La comprobación cubre el catálogo completo, configuración antigua con Baile,
referencias nulas, lectura sin escrituras, representación heredada e importación;
en Edge a 320/400/440 px se comprueban las opciones, guardar/recargar y el panel
de referencias. El atlas añade una escena al final del selector para mostrar
los cinco planes nuevos y declara sus dependencias de catálogo y orden.


Cambio de criterio comunicado en v505: la vista completa sin scroll de v471
correspondía al catálogo anterior. Con 29 opciones se conserva el panel fijo y
las tarjetas de al menos 86 px; el exceso se resuelve en `.ev-plan-options`,
sin encoger iconos/textos ni mover la cabecera o Confirmar. La prueba antigua
se actualiza a ese contrato, manteniendo posiciones iniciales y símbolos.


## Rótulos de barras mensuales y medias casillas (v506)

La corrección separa el título semanal de los segmentos de pintura que atenúan
los días ajenos al mes. `_evMonthBarTitle` utiliza la franja común de los tramos
o su sección más amplia; el texto puede continuar a la derecha al cambiar el
color del mes. La capa de título no intercepta pulsaciones y conserva el contraste
del texto sobre barras pasadas, con la bombilla de resaltado.

Los fragmentos de hasta una casilla solo ocultan una abreviatura cuando hay una
continuación mayor en otra semana visible. CSS comprueba el espacio real mediante
el salto de línea del texto completo; sin una alternativa mayor se conserva la
elipsis. No se añaden medidas DOM, observadores ni escrituras a los renders.

El contorno SVG usa la longitud visible tras recortar las medias casillas. Un
extremo recto no reserva espacio para una segunda esquina redondeada. Las horas,
fechas, colores y reglas de solapamiento no cambian. Los rótulos de anual/cuatro
meses conservan su ensamblado anterior.

Comprobación: escenarios ficticios de fin de semana, cambio de mes con solape,
tramo aislado, corte fuera del mes visible y contraste pasado/bombilla; medidas
y capturas en Edge a 320/400/440 px, incluyendo apertura desde el texto. Se revisan
y actualizan solo las tres referencias mensuales afectadas. El atlas añade una
captura de septiembre con estos casos; no incorpora la imagen privada del usuario.

## Días pendientes del mes actual (v507)

El calendario de un mes agrupa hoy y todos los días visibles posteriores con
un contorno verde, incluidos los del mes siguiente. Solo se muestra al consultar
el mes y año actuales. El fondo y el número de hoy permanecen; su recuadro
individual da paso al contorno conjunto. No cambia las fechas ni los eventos.

`_evMonthRemainingOutline` aporta los bordes exteriores de cada semana y un
escalón tras la primera semana parcial. Los laterales se unen en el centro del
hueco entre semanas, sin líneas horizontales interiores. Cada pieza se adapta
a la altura real de su semana mediante CSS, sin medir el DOM ni usar observadores.
La capa es decorativa y no intercepta pulsaciones. El render sigue siendo puro
y el mismo HTML acompaña las previsualizaciones de swipe.

Los dos selectores de rutinas que reutilizan el calendario pasan
`{remaining:false}` para conservar su presentación. No hay estado ni claves de
almacenamiento nuevos. Se revisan las dos referencias HTML mensuales afectadas,
el atlas y capturas de Edge a 320/400/440 px: bloque final del 26/10 al 1/11,
inicio a mitad de semana, cambio de mes/año, cambio horario y malla sin saltos.

## Apertura de Eventos (v508)

`openEvents` selecciona `cal` y el mes actual cada vez que se abre la ventana
desde su navegación principal. El estado inicial ya usaba `cal`; se elimina
la asignación de `upcoming` que la apertura imponía. `openEventsAt` conserva
los destinos y fechas explícitos de los demás accesos.

El atlas conecta Inicio directamente con Calendario 1 mes. Próximos sigue
disponible desde su botón, con una ruta explícita en las capturas que lo usan.
Las pruebas de swipe de Próximos entran expresamente en esa vista.

## Resumen Home y consulta de facturas (v509)

El resumen conserva los cálculos existentes: total mensual primero, días no
trabajados y su desglose después, y días/horas trabajados al final. Las horas
son el dato más grande y en negrita. El mismo HTML se usa en el pie y en la
copia compacta de «Todo enviado».

`invoices-home.js` separa el modelo y render puro de la consulta asíncrona.
Usa la conexión Kairo ya configurada y distingue borrador, emitida pendiente
de correo, programada, enviada, proceso, revisión y ausencia de factura. La
consulta se hace al renderizar/volver a Home, recuperar foco/conexión y mediante
el botón de actualizar; se agrupan intentos durante un minuto y se muestra la
fecha/hora de la última consulta confirmada. No hay sondeo permanente ni
almacenamiento nuevo. Las respuestas de meses anteriores no sustituyen el mes
visible. Una falta de conexión o respuesta inválida nunca equivale a «pendiente».

El circuito empieza en `INVOICE_FIRST_PERIOD`, compartido con Enviar factura.
Un mes futuro sin factura no se presenta como un envío vencido. Sin URL, el
aviso abre la configuración privada existente. El navegador puede exigir
permiso de red local; no se modifica el permiso del perfil del usuario.

Kairo ofrece un GET mínimo de lectura autenticado por Tailscale y Origin exacto;
ver [el contrato](KAIRO-DEVELOPMENT.md). Las 8 pruebas Python cubren estados,
ambigüedad, CORS, identidad y preservación de POST. Edge comprueba 320/400/440 px,
altura estable, cálculo conservado, ausencia de escrituras, fallo de red,
configuración y respuestas tardías. Las pruebas existentes del transporte de
preparación y facturas siguen pasando. El nuevo módulo no invalida en el atlas
las ventanas declaradas opacas que ocultan Home; las dependencias desconocidas
se mantienen conservadoras.


## Home y programación de horas — preparación del 27/10/2026

Trabajo todavía incompleto: no activar ni presentar como implementada la
programación automática. La producción conserva v509 hasta completar la
validación y publicación. Los cambios están en la rama de la tarea.

- Home usa homeMonthHours/renderHomeMonthHours (js/home-hours.js): base de
  lunes a viernes, descuentos con sus días/horas y resultado alineado; las horas
  personalizadas se explican como ajuste, sin cambiar las horas trabajadas. El
  mismo render alimenta el resumen superior, el pie y la previsualización.
- homeSubmissionWeeks (js/home-weeks.js) define las semanas del mes visible
  más dos completas posteriores, sin repetir la semana puente. Aviso y futura
  programación consumen esta lista. En el candidato del 28/10, el aviso usa
  estados conciliados de Outlook cuando Kairo está configurado; SW queda como
  marca manual heredada sin conexión privada y no acredita un envío remoto.
- homeWeekSchedule define el último día realmente trabajado de esa semana a
  las 08:00 Europe/Madrid. Si ha vencido o no hay días trabajados, dejar pendiente
  para decidir. El huso del navegador no debe decidir la hora de envío.
- El remitente será la cuenta corporativa que Ángel ha indicado en la conversación;
  Para/CC se toman de Correo de horas. Nunca copiar cuentas reales al código,
  fixture, mapa o Git. La cuenta real de Outlook queda en el perfil privado.

Ángel prefiere automatizar Outlook web mediante Chromium en Kairo; no puede
registrar una aplicación corporativa sin un trámite de TI. La primera fase es
una sesión iniciada manualmente por él y una comprobación solo de lectura. No
se pide ni almacena una contraseña en el repositorio. El perfil dedicado queda
fuera de Git y con modo 700; el navegador recuerda la sesión y, si caduca, se
debe pedir renovarla. Se ha confirmado en la cuenta real que Outlook web muestra
en Borradores los mensajes programados desde Android, con etiqueta Programado,
asunto, semana, contenido y un aviso de fecha/hora de envío en el panel de lectura.
También se han consultado las semanas anteriores en Elementos enviados. Estas
lecturas validan la viabilidad del acceso, no la conciliación automática completa.
La comprobación fue de solo lectura, sin cancelar, modificar ni crear correos.

Herramienta: tools/kairo/outlook-session.sh. Requiere Chromium, Xvfb, xauth,
x11vnc, noVNC y websockify en Kairo. Usa un servicio temporal independiente
(gestify-outlook-session), sin habilitar inicio automático. El visor escucha
en 127.0.0.1:6091, VNC en 127.0.0.1:5901 y CDP en 127.0.0.1:9223. Acceso
solo mediante túnel SSH; no publicar esos puertos en Tailscale Serve ni Internet.
No modificar kairo-facturas ni su temporizador para esta integración. Para
cerrar esta prueba: sudo systemctl stop gestify-outlook-session.service.

Pendiente antes de activar envíos: reconocer cada semana por su lunes (con año),
conciliar enviados/programados existentes, mantener estado persistente único
por semana en Kairo, verificar que la anterior esté enviada/programada, crear
en orden cronológico, mantener el recorrido individual y evitar duplicados
incluso tras cambios de fecha/horas. Si una programación cambia, mostrar la
diferencia y pedir actualizar esa misma programación. Un resultado de envío
incierto se revisa antes de reintentar. Abrir Outlook no confirma un envío:
corregir ese comportamiento en el recorrido individual cuando exista lectura
fiable del buzón. Todas las pruebas de escritura se harán con datos y destinos
sintéticos; esta preparación no envía ni programa correos reales.

### Teclado y portapapeles del visor privado de Kairo

La sesión manual ya ha alcanzado el buzón de Outlook. No se ha activado el
programador de correos. Un rechazo 50126 se debió al comportamiento de Bloq
Mayús en el acceso remoto; la prueba anterior con Shift no caracterizaba ese
bloqueo. noVNC 1.6 sincroniza los bloqueos con el servidor. El lanzador añade
`-capslock` a x11vnc para que su ajuste de modificadores no aplique Shift dos
veces al recibir letras mayúsculas con CapsLock activo. Se puede aplicar al
servidor existente con `x11vnc -sync -R capslock -query_retries 5:1`, conservando
Chromium y su perfil; comprobar después `x11vnc -Q capslock`. Usar el DISPLAY y
XAUTHORITY reales de esa sesión. Se ha verificado la secuencia `aAaA`: minúscula,
Bloq Mayús, Bloq Mayús + Shift y Shift sin bloqueo; al terminar no quedan
modificadores retenidos ni Bloq Mayús activo en Kairo.

`tools/kairo/install-viewer.sh` instala solo los cuatro recursos públicos de
`tools/kairo/viewer/` en `/usr/share/novnc/gestify/`. Reutilizan la biblioteca
noVNC instalada, el WebSocket del mismo origen y el túnel existente. El nuevo
visor se abre en `/gestify/index.html`; el noVNC habitual continúa disponible.
Ctrl+V transfiere el texto del evento de pegado antes del atajo remoto. Ctrl+C
solo escribe en el portapapeles local tras una petición explícita de copia;
recibir datos por RFB no autoriza sobrescribirlo. Los botones Copiar/Pegar
ofrecen el mismo recorrido mediante un gesto explícito. Si el navegador bloquea
el portapapeles, se informa del permiso requerido. También se atiende el evento
copy de los navegadores/menús que no emiten keydown. El texto no se registra,
no se guarda en localStorage y se descarta al desconectar.

La combinación comprobada es noVNC 1.6.0 y x11vnc 0.9.17: este último entrega
UTF-8 por CutText clásico y noVNC lo trata como Latin-1. El adaptador conserva
los bytes en ambos sentidos, sin modificar la biblioteca instalada. Revalidar
la codificación si cambia el servidor. `/gestify/input-test.html` contiene solo
texto ficticio, sin scripts ni almacenamiento, para probar fuera del correo.
Se verificaron Ctrl+C/Ctrl+V, los botones, cambios de contenido y el recorrido
completo con acentos, ñ, euro, emoji y saltos de línea. Las siete pruebas de
`npm run test:kairo-viewer`, `npm test` y el build pasan. El programador automático
y la conciliación persistente de semanas siguen pendientes; ver mensajes
existentes en Outlook no equivale todavía a tener implementado ese circuito.

Estos recursos son una herramienta privada de administración, fuera del catálogo
de la PWA. No modifican Gestify, sus capturas ni los servicios de facturas.

## Conciliación de horas — candidato del 28/10/2026

`js/hours-kairo.js` conecta el aviso y la acción individual con una revisión
privada. El cálculo no escribe datos y el estado remoto solo vive en memoria,
con vencimiento y descarte de respuestas de otro mes. Abrir la revisión ya no
marca una semana enviada. Sin confirmar Outlook, Home muestra estado desconocido.

El modelo, diario persistente y servidor privado están en `tools/kairo/`:
[contrato, pruebas y limitaciones](../tools/kairo/HOURS.md). Un duplicado o un
resultado incierto bloquean; cambios de días/horas/fecha requieren actualizar
el mismo correo expresamente. La simulación usa un diario temporal y un
escritor ficticio. El endpoint real empieza deshabilitado en servidor.

La lectura real reconoce enviados y programaciones de Android. Con autorización
posterior de Ángel se validó manualmente el formulario real mediante una única
programación técnica a su propia cuenta, que se anuló y se comprobó después de
recargar. El adaptador refleja esos controles y tiene regresiones sin red;
el recorrido completo desde la PWA mediante el servicio sigue pendiente. No se
activó el lote ni una ruta nueva. La clave de paso queda pendiente.

La [revisión local](visual-map/review/hours-scheduling-preview.html) conserva
la evidencia histórica y añade solo dos capturas ficticias del recorrido nuevo.
El resumen de horas de Home sigue siendo una propuesta independiente.

En la comprobación posterior del Vivo se detectó que Recordatorios conservaba
el intervalo antiguo de semanas. `homeSubmissionWarnings` consume ahora el
mismo mes más dos semanas extra que Home y los estados conciliados de Outlook.
Una lectura sin confirmar produce un aviso general, no falsos pendientes por
cada semana. La prueba de navegador cubre las adicionales y las programadas.
La PWA instalada se mantiene en v510 y sus datos no se modifican durante la
lectura; la prueba nueva sigue siendo un candidato sin programación habilitada.

El lector admite solo los hosts HTTPS exactos `outlook.office.com` y
`outlook.cloud.microsoft`. La identidad del mensaje no depende del host. Las
consultas sin caché y las verificaciones del commit refrescan el servidor para
no tomar por definitivo un estado anterior de la lista. Un editor abierto o
un inicio de sesión interrumpen esa lectura sin provocar reintentos de escritura.
## Regreso a Ajustes y entrega de alarmas (v510)

settingsPanelBack (settings-menu.js) conserva el anclaje, scroll y navegación
anterior de Configuración. Correo, MacroDroid, Facturas, Ruta de guardado, Mis
Datos y Notas restauran ese origen al pulsar Atrás. Los accesos directos conservan
su destino anterior; repintar una factura abierta conserva el mismo retorno y
reabrir durante los 300 ms de cierre captura un origen nuevo. No se cambia el
aspecto de los menús: las capturas del atlas siguen siendo representativas.

requestMacroAlarm (alarms.js) centraliza los envíos de campana/Siesta, eventos
y cumpleaños: GET sin caché, sin reintentos automáticos y respuesta opaca sin
interpretarla como creación confirmada. El registro se añade tras terminar la
petición del navegador; un fallo conocido no marca el evento como enviado. En
lotes puede quedar constancia de las peticiones completadas antes de un fallo.
Una petición que siga pendiente tras 10 s muestra un aviso, sin abortarla ni
reenviarla. No detecta el retraso posterior en FCM, MacroDroid o el reloj.
ALARM_REQUESTS conserva en memoria los últimos 20 intentos con fecha, duración
y estado, sin URL, texto, horas de la alarma ni datos privados. No es un acuse
del teléfono y no se exporta al backup.

Las pruebas de navegador interceptan todos los webhooks. La investigación
controlada del móvil y sus límites están en docs/macrodroid.md. El trabajo
de programación semanal de Outlook y el nuevo resumen de Home siguen en su
rama WIP; esta entrega no los publica.


## Programación de horas integrada (v511)

Home abre la misma revisión privada de Kairo desde «Programar pendientes» y
«Programar semana». El alcance compartido es el mes visible más dos semanas
completas adicionales. La conciliación remota sustituye las marcas manuales
como evidencia y exige confirmación antes de programar. El resumen conserva
su diseño de producción a la derecha; la propuesta de rediseño sigue separada.

La conexión privada HTTPS reconoce las semanas enviadas y las programadas desde
Android. Se validó una programación ficticia en jueves y su actualización por
el adaptador al miércoles, conservando un único correo y su ID. El formulario
real necesitó ajustes de destinatarios asíncronos, selector de fecha y selección
de fila; las pruebas offline reproducen esas diferencias. Ver el estado,
servicios, diario y límites de sesión en [HOURS.md](../tools/kairo/HOURS.md).

El atlas recaptura solo las tres vistas de Home afectadas. Las otras referencias
y revisiones históricas se conservan mediante verificación representativa;
no se regeneran por cambios de huellas compartidas.

La revisión HTTPS real también se confirmó con un lote sin operaciones. El
estado vuelve a Home por el canal de ventana validado, incluso cuando el
navegador deniega la consulta automática de red local. No conceder ni desactivar
ese permiso por código. Su denegación no se presenta como rechazo de Outlook.
La comprobación física de la PWA nueva en el Vivo sigue separada de esta prueba.


## Outlook integrado en Home (v512)

El panel y tarjetas de Home muestran el estado y la fecha de cada semana;
Comprobar Outlook devuelve el resultado a Home sin programar. La confirmación
solo presenta las excepciones y mantiene plegados los detalles. La consulta de
estado incluye los días y fecha observados, para detectar diferencias reales
con Gestify en lugar de comprobar únicamente si existe un correo.

La fecha es el último día trabajado de lunes a viernes a las 08:00 de Madrid;
si toda la semana son vacaciones/festivos, el último día no festivo, aunque sea
de vacaciones. Con cinco festivos o una fecha pasada queda pendiente.
Pruebas cruzadas JS/Python acreditan la regla compartida. La revisión anterior
se invalida al cambiar la versión de política para que no cree una programación
que no estaba propuesta. No se modifica el diario existente.

Solo se actualizan las tres vistas de Home y las evidencias ficticias de esta
interfaz. Las pruebas usan el navegador y no necesitan el teléfono del propietario.

## Revisión de horas en Android instalado (v513)

La prueba física detectó que Android intentaba abrir `/horas/` en la PWA de
Kairo, perdiendo el canal de ventana con Gestify. En Android standalone se usa
ahora una revisión integrada en un diálogo; el escritorio conserva la ventana.
El servicio permite incrustar su HTML solo al origen configurado de Gestify
mediante CSP, conservando propietario, Host, origen, CSRF y confirmación del
contenido. El canal sigue validando origen, ventana e identificador.

El Vivo comprobó el mes, el regreso automático de Comprobar Outlook y una
semana individual: cuatro enviadas y tres programadas, sin escrituras y con
la misma huella del almacenamiento antes y después. La prueba usó el candidato
en memoria sobre v512; la publicación v513 incorpora esa misma corrección.
Solo se añade la captura ficticia del diálogo a la revisión del mapa.

## Resumen mensual y caché de horas (v514)

Home usa homeMonthHours y renderHomeMonthSummary, también en el swipe. Días y
horas comparten línea en el total, cada descuento y el resultado. Sin días no
trabajados se muestra solo el resultado y su nota; con ajustes de jornada, la
resta conserva su correspondencia con las horas reales. Los descuentos completos
heredan el color de festivo, vacaciones o ausencia.

hours-cache.js guarda hechos verificados por semana y firmas por mes, vinculados
a la conexión configurada y limitados a 24 meses. No hay caducidad de dos minutos:
navegar, recargar o perder conexión conserva la última comprobación. Un cambio
local se compara inmediatamente con el correo observado. Al llegar la fecha de
una programación se consulta una vez; ↻ fuerza una revisión. Los fallos no borran
la evidencia y los intentos automáticos idénticos no se repiten continuamente.

La caché derivada se excluye del backup, no incluye destinatarios ni contenido y
los renders no la escriben. Confirmar una programación invalida las semanas
afectadas hasta obtener evidencia nueva. La conciliación previa a escribir y el
diario contra duplicados de Kairo mantienen sus comprobaciones independientes.
Las modificaciones hechas directamente en Outlook se descubren en una nueva
consulta, no por la caché. Solo se recapturan las tres escenas de Home; se
conservan las demás referencias y revisiones del mapa.

## Ajustes de Home y continuidad del mes (v515)

El resumen abrevia Vacaciones, muestra la nota sin días no trabajados en cursiva
y comparte el color entre días y horas del resultado. El contorno de pendientes
del calendario mensual también se dibuja al consultar el mes siguiente si hoy
está en la semana inicial compartida. El límite inicial se calcula con la primera
celda visible; el final sigue siendo el último día del mes. Así el mes anterior
no activa el contorno por mostrar hoy entre sus días finales de relleno. Los
selectores de rutinas siguen excluyéndolo mediante remaining:false.

Se comprueban los tres anchos de móvil, cambio de año y cambio horario. Son
ajustes puntuales: se mantienen las capturas generales y se añaden únicamente
ejemplos a la revisión existente, conservando su historial.

## Home persistente y programación independiente del móvil (v516)

Contrato y evidencia en [home-mail-maintenance.md](home-mail-maintenance.md).
Home conserva el resumen a la derecha en todos los estados y un único total;
la fórmula de jornadas se despliega mediante un control discreto. Los colores
de 7/8/9/6,5 h se comparten entre opciones, celdas y fórmula. El lápiz SVG
editPencilHtml sustituye el glifo de los botones que ya mostraban lápiz.

Las tarjetas mantienen sus tres zonas, envío manual y desbloqueo local.
V/F/A sombrean la celda; el estado remoto y la edición son independientes.
Abrir Outlook no marca enviada una semana. La programación individual se abre
desde su distintivo; la conjunta permanece en el aviso del mes.

La auditoría inicial cubre anterior/actual/siguiente. Al cambiar el mes real
se consulta solo el periodo nuevo; los hechos compartidos conservan la lectura
más reciente. El histórico anterior queda cerrado. Foco, navegación, cambios
locales y conexión no fuerzan barridos. Actualizar estado comprueba correos y
factura; errores conservan lo confirmado. Las cachés y referencias de trabajo
son derivadas y están expresamente excluidas del backup.

hours_jobs mantiene en SQLite trabajos, resultados y estados confirmados en
Kairo. El móvil conserva identificadores recuperables, sin cuerpos ni direcciones.
Una confirmación repetida reutiliza su trabajo; un reinicio no reintenta una
escritura interrumpida. Se conserva el diario y bloqueo antes de escribir.
La confirmación de un correo sirve como comprobación previa del siguiente,
sin repetir el barrido; la hora se vuelve a comprobar antes de cada escritura.
La interfaz actualiza indicadores sin reemplazar las tarjetas durante el foco.

Facturas muestra fecha/estado confirmado por Kairo y compara el día 20 o laboral
anterior con el calendario local. Una discrepancia se señala, sin alterar una
factura aprobada. La integración existente de Kairo ya utiliza día 20 y festivos.

## Hoy visible al consultar el mes siguiente (v517)

El calendario mensual comparte `showsToday` para reconocer el mes actual y la
primera semana compartida del siguiente. Su cabecera marca el día de la semana
actual en ambos casos. El fondo verde y el número de hoy conservan su intensidad
aunque la celda tenga `out-m`; los otros días externos siguen atenuados. El mes
anterior y los meses que no contienen hoy conservan su comportamiento.
Pruebas: tres anchos, Claro/Oscuro/Crema, fin de semana y cambio de año.

El circuito vigente de horas y facturas está descrito para consulta en
[Gestify y Kairo: funcionamiento y límites](gestify-kairo-flujo.md). Se confirmó
en Kairo la caché SQLite de tres meses mediante una respuesta HTTP 200 en
20,5 ms, sin pedir refresco ni iniciar un nuevo barrido de Outlook. Esta entrega
no añade otra caché ni configura un secreto de autenticación nuevo.

Se conserva el atlas representativo: este ajuste puntual añade un único ejemplo
en la revisión v517, sin recapturar los menús anteriores.

## Avisos y reingreso privado de Outlook (v518)

`outlook_auth.py` observa el Chromium existente bajo el mismo bloqueo del lector
y escritor. La identidad de la pestaña dedicada se conserva entre redirecciones.
Solo admite formularios Microsoft reconocidos y la cuenta configurada. Reserva
el intento antes de interactuar; MFA, contraseña rechazada, estado corrupto,
interrupción o pantalla desconocida detienen los intentos. Solo observar el
buzón correcto o una sustitución expresa del secreto libera la pausa pertinente.
No modifica mensajes ni reintenta trabajos de correo fallidos.

La utilidad privada instalada en Kairo recibe dos entradas ocultas por SSH y
envía el secreto por stdin a `systemd-creds encrypt`. Solo persiste el cifrado,
con modo 600 y clave del host. La unidad de sistema entrega la credencial con
`LoadCredentialEncrypted` a un proceso del propietario. Permanece inactiva hasta
provisionar el secreto; no se incluye un valor real en pruebas ni en Git.
Instrucciones: [OUTLOOK-AUTH.md](../tools/kairo/OUTLOOK-AUTH.md).

El endpoint protegido `/horas/auth-status` devuelve únicamente fase y fecha.
Home consulta ese archivo al entrar/volver, refrescar acceso, fallar un trabajo
y cada minuto solo en primer plano; no recorre Outlook para mostrar el aviso.
El aviso MFA es de Home y toast, sin push cuando la app está cerrada. Las
comprobaciones de progreso son acotadas y no hay sondeo periódico de correos.

Home oculta el resumen mensual si faltan semanas por programar; los estados
confirmados y las programaciones con cambios mantienen su resumen. El aviso de
factura sin enviar parpadea, respeta movimiento reducido y abre el circuito
existente de factura. La comparación local de factura usa su preparación
guardada, ignora versión de app y metadatos y no altera contenido ni estado remoto.

Septiembre mostraba un negativo del móvil de las 18:00 frente a una lectura
posterior de Kairo que acredita las siete semanas de su alcance como enviadas.
El mes previo con un negativo antiguo recupera una vez la caché del servidor
sin `refresh=1`; no inventa envíos ni repite el barrido del buzón.

Validación: transiciones de acceso y fronteras HTTP; Chromium separado con toda
la red interceptada; cifrado/entrega de una credencial sintética real por systemd;
secreto ausente, diario de semanas intacto y API de salud protegida en Kairo.
Solo se recapturan las tres referencias de Home, conservando las otras 170.

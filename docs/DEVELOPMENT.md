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

## Convenciones visuales de controles

- Por defecto, el título de cada menú o panel nuevo se centra respecto al ancho completo de su contenedor, no al espacio sobrante tras la flecha. Reutilizar `.bd-panel-header.panel-header-centered`, con columnas laterales simétricas; si hay acciones más anchas, reservar el mismo ancho en ambos lados. Preferencia de Ángel del 11/10/2026.

- En desplegables, reutilizar los indicadores dibujados de la aplicación (`.ev-tax-chevron` o el chevrón de `details > summary`). No usar caracteres de texto como `⌄` para representar la flecha. Preferencia de Ángel del 11/10/2026.
- En el editor de cumpleaños, nombre y fecha comparten un panel blanco; categorías tiene su propio panel con acento suave. En la ficha, el resumen queda abierto, sin recuadro interior, y categorías conserva su panel.
- Los símbolos VIP de la lista no deben cambiar la altura de las filas.

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

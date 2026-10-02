# Arquitectura y desarrollo

Gestify es una PWA estática sin backend. Mantiene scripts clásicos, renders que
devuelven HTML y listeners separados. No requiere un framework ni un empaquetador
de JavaScript. Los datos personales residen en el dispositivo y viajan en JSON.

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

El menú de ajustes es único y se monta en `body`, anclado al botón pulsado.
Abrirlo no cierra overlays ni reconstruye su contenido. Conserva el retorno
anterior; Escape y el clic exterior lo cierran sin activar el control de debajo.
Toda salida del menú debe pasar por `closeSettingsMenu`, también importación
y elección de iconos, para restaurar ese retorno y el estado del botón.

### Marcadores y viajes (v390)

- Ribete definitivo de símbolos: 1,3 px en el ajuste común, negro en claro y
  blanco suave en oscuro/gris. `evSymbolStroke` distingue borde, relleno y halo;
  no cambiar indiscriminadamente todos los trazos del SVG.
- El laboratorio temporal se ha retirado. Los backups anteriores conservan
  los otros ajustes de dibujo; el borde se normaliza a 1,3 al leer/importar.
- `_evBarPast` calcula el porcentaje pasado del fragmento visible, incluyendo
  relevos de medio día. Una máscara atenúa esa parte sin cortar la barra ni
  duplicar el título. La bombilla retira la atenuación en los tres calendarios.
- La luna mantiene `planet` como identificador compatible con eventos previos.

## Energía: datos y cálculos

| Módulos | Responsabilidad |
| --- | --- |
| `energy-history`, `energy-bills`, `energy-analysis` | Contratos, facturas, IVA, validación y cálculos base. |
| `energy-costs`, `energy-reconciliation`, `energy-study` | Costes por día/compañía, conciliación e indicadores. |
| `energy-reference`, `electricity-comparator*` | Referencias y escenarios independientes. |
| `energy-analysis-view`, `energy-analysis-bind` | Presentación y navegación del estudio. |
| `energy-data` | Reutilización de datos y cálculos durante un render. |

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
solo el sugerido y se limpia repetición si la categoría no la admite. Un trayecto
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

# Gestify: guía de trabajo

## Antes de cambiar código
0. En cada sesión, leer los criterios de mantenibilidad de docs/DEVELOPMENT.md y su revisión de prioridades antes de decidir el alcance. Las prioridades son propuestas, no autorización para ejecutar toda la reorganización.
1. Localizar símbolos en CODEMAP.md y leer solo el bloque necesario.
2. Reutilizar componentes; separar cálculos, renders y listeners.
3. Registrar archivos nuevos en app-assets.json. Ejecutar npm run assets y node tools/codemap.js.
4. Pasar npm test y npm run build; comprobar interacciones y presentación en Edge.
5. Antes de publicar, incrementar APP_VERSION y CACHE_VER. CI debe aprobar las pruebas de navegador.
6. Agilidad (26/10/2026): en local ejecutar las pruebas de navegador afectadas; reservar la batería completa para CI y no duplicarla por rutina. Construir `dist` antes de abrir el servidor de pruebas y no reconstruirlo mientras esté en uso. Enseñar el resultado local antes de esperar el despliegue. Las capturas son referencias visuales: aplicar el criterio sustancial del 27/10/2026 antes de capturar. `map:plan` propone candidatos técnicos; no ejecutar `map:changed` a ciegas. Conservar revisiones y seleccionar solo los menús sustancialmente afectados.

Una tarea exclusivamente documental conserva las versiones y los archivos de la app. Ver la excepción de publicación en docs/DEVELOPMENT.md.

## Reglas vigentes
- v551: los eventos grandes de un día, salvo barra fina, reservan dos líneas de título y una tercera solo con «…» cuando se recorta; aplicar la misma distribución en la vista previa del swipe. Editar horas y Cancelar en las acciones semanales llevan fondo naranja y rojo, respectivamente.
- Home v550: las semanas con correo programado/enviado tienen un botón central Acciones. Su despliegue ocupa la fila con tres botones iguales: Enviar a Outlook, Editar horas (naranja) y Cancelar (rojo, símbolo de prohibido). Las pendientes solo muestran Enviar a Outlook. La edición de semanas protegidas requiere confirmar según su estado y conserva el correo remoto. El primer cambio concreto de un día pendiente se confirma; solo esa aceptación se recuerda 20 minutos en la sesión.
- Eventos grandes: las horas inicio/fin y las de ida/vuelta se editan de forma coordinada en el borrador. Ninguno es un transporte válido; cancelar no modifica el evento guardado.
- En cualquier pantalla, las aclaraciones introducidas con un asterisco se presentan en cursiva, incluido el asterisco.
- Home R8 integrada en v543 tras la revisión de Ángel. Los botones de acción (exportar, ver envíos, sincronizar y enviar factura) comparten fondo blanco y borde/iconos rosas; las acciones de panel tienen su columna a la derecha. Los avisos pendientes usan ese acento con fondo suave y borde marcado. El rojo se reserva a revisiones y plazos urgentes. La factura programada conserva el azul ante cambios y añade el aviso rojo. Las modificaciones de correo y factura usan sus recorridos de Kairo por separado, con confirmación; actualizar un borrador requiere nueva aprobación.
- Confirmación expresa de Ángel (09/11/2026): todas las semanas anteriores a la del 9 de noviembre de 2026 están enviadas. Los meses totalmente cubiertos muestran «Correos al día», resumen de días/horas y semanas marcadas. El corte queda fijo: no dar por enviadas automáticamente las semanas que terminen después. Guardar la procedencia como confirmación del usuario, sin inventar fechas ni identificadores de Outlook y sin cambiar las horas.
- PWA estática sin backend. Mantener la arquitectura actual y la compatibilidad de backups JSON.
- css/styles.css es generado. Editar css/source/; las otras hojas CSS siguen siendo editables. No alterar el orden de cascada del catálogo por comodidad.
- Atrás, flechas y Hoy: base y variantes en css/source/navigation-controls.css; disposición de cabeceras en su módulo. El carrusel conserva su combinación con .ev-btn en event-panels.css. No añadir parches de estos controles a shared-refinements.css.
- El orden de swipe de Próximos, Wedding Moves y Rutinas vive solo en EV_SWIPE_ORDER (swipe-render.js); controladores y previsualización comparten esas listas y conservan sus efectos separados.
- Renders sin escrituras. Estado de pantalla explícito y listeners separados; consultas del formulario acotadas a su hoja.
- appStorage para persistencia, validación previa e importaciones atómicas con restauración. Toda clave nueva se declara en el censo de backup.
- Energía reutiliza lecturas/cálculos solo dentro de withEnergyData. No mutar sus resultados ni mantener cachés entre renders. Preservar precisión; redondear únicamente al mostrar.
- El scroll de una ventana vive en .sy-body. Navegación y cabeceras no se encogen ni desaparecen. Reutilizar abrirPanel/cerrarPanel y conservar scroll al refrescar.
- Los campos con caja, selectores y tarjetas consecutivas deben separarse 10–12 px reales con gap. Excepción explícita: Recordatorios agrupa Cumpleaños y los eventos de Hoy/Mañana en paneles continuos, sin huecos entre filas, con separadores interiores y un color por grupo. Verificar móvil y escritorio.
- Estadísticas de Bodas, Rutinas y Próximos comparten `renderStatsCard` / `renderStatsMetrics` y `statistics.css`; conservar los cálculos y acciones de cada dominio. Recordatorios comparte la medida compacta entre Ajustes y Tareas.
- Los ajustes de subpestañas se acotan a su pantalla. No cambiar el sistema global para corregir Energía, Próximos o Rutinas.
- En botones de pestaña, selección por fondo; conservar color de fuente y borde. Naranja suave solo para lápices sin texto.
- Alta de eventos: clase/categoría primero; nombre, notas y horario al final. Al editar se conserva el bloque de datos arriba; ambos reutilizan renderEvFormLead sin duplicar controles.
- Selector de planes ampliado: panel estable, tarjetas legibles y scroll interior al crecer el catálogo; sustituye la cuadrícula completa sin scroll de v471 desde v505.
- Orden de planes: conservar tipos, posiciones y horas guardadas; los tipos nuevos se añaden al final sin referencia cuando hay preferencias. Todo renombre persistido necesita compatibilidad en lectura y validación (Baile → Salir a bailar mediante evPlanType).
- Barras del calendario mensual: título semanal separado de los cortes de color del mes; aprovechar el ancho continuo y omitir abreviaturas en fragmentos cortos solo si hay una continuación mayor visible. En eventos completos de uno o dos días dentro de la misma semana, permitir hasta dos líneas si el título no cabe, salvo en barras finas, que conservan una sola línea. Mantener los extremos de media casilla y las pulsaciones sobre la barra.
- Mes actual: un único contorno verde agrupa desde hoy hasta la última casilla visible, incluidos los días del mes siguiente. Redondear también los dos giros del escalón, con el mismo radio de las esquinas exteriores. Conservar el fondo y el número de hoy sin su recuadro individual; los selectores de rutinas desactivan el contorno con `{remaining:false}`.
- Al abrir Eventos mediante su navegación principal, seleccionar Calendario 1 mes en el mes actual. `openEventsAt` conserva los destinos explícitos de otros accesos.
- Un plan grande de un solo día se agrupa bajo su fecha en Próximos y Hoy/Mañana en Recordatorios; solo los intervalos de varios días usan el bloque continuo. En el mes conserva su barra, con texto centrado y esquinas compactas; las barras finas siguen en una línea. Recordatorios usa siempre el mes real, independientemente del mes seleccionado en Home.
- Categoría de evento = kind + type. Usar getEvDisplayColor, evStartTime y evSortMarks; no duplicar su política en una vista.
- No perder historial al editar rutinas. Horarios efectivos, extras, recuperaciones y pausas pasan por las funciones compartidas del dominio.
- Datos personales, facturas y backups nunca son fixtures ni se publican. Alarmas solo por MacroDroid, con configuración local.
- Actualizar instantáneas únicamente si el cambio visual es intencionado y se ha revisado el diff.
- Mantenibilidad: una fuente de verdad por regla/componente; corregir la causa y evitar nuevas capas de excepciones. Ordenar por zonas con cambios pequeños, sin reescrituras generales por defecto.
- Separar reorganización interna y cambios de comportamiento. Antes de extraer código, identificar consumidores y caracterizar el resultado existente; después comprobar salida, interacciones, persistencia y aspecto de las vistas afectadas.
- No optimizar por tamaño o por intuición: Ángel considera fluida la app (18/10/2026). Priorizar aislamiento y comprensión; medir antes de modificar rendimiento. La escritura de la previsualización fiscal quedó corregida en v487 y Atrás/flechas/Hoy se consolidaron en v488; las demás prioridades siguen pendientes.
- Mapa visual con capturas: atlas documental en docs/visual-map/ (24/10/2026), ampliado tras aprobar Ángel el piloto. Incluye las secciones y paneles secundarios en láminas navegables, con inventario de límites y accesos ausentes; las capturas nuevas quedan pendientes de su revisión visual. npm run map:serve abre el visor local; map:plan muestra candidatos por fuentes, sin decidir su relevancia visual. Tras aplicar el criterio sustancial, capturar solo las escenas elegidas y exportar las láminas que realmente cambien. Las revisiones se conservan por huella de imagen, con historial si cambia. Usar datos ficticios y conservar explícita la cobertura. Ver docs/visual-map/README.md y la norma de docs/DEVELOPMENT.md.
- Capturas como referencia representativa (Ángel, 27/10/2026; sustituye la obligación más amplia del 25/10): actualizar solo ante rediseño, cambio sustancial de estructura/interacción o diferencias acumuladas importantes. Añadir un plan aislado, retocar texto o corregir lógica sin cambio relevante del menú no exige recaptura. Añadir varias opciones puede justificarla si la referencia deja de representar bien el menú; no es un umbral numérico automático. Elegir solo ese menú y otros realmente afectados por el mismo cambio sustancial; no regenerar antecesores por la ruta de acceso. Las pruebas funcionales necesarias siguen siendo independientes del atlas. Revisión inicial de 150 capturas en docs/visual-map/review/: A01–A06 corregidos en v498, A07–A11 en v499, A12–A13 en v500; A09 revertido al selector anual por petición expresa de Ángel en v500; conservar antes/después y la cobertura histórica.

## Dónde ampliar
- [Arquitectura, catálogo de componentes y flujos](docs/DEVELOPMENT.md).
- [Índice de funciones y estilos](CODEMAP.md), generado desde las fuentes editables.
- [Notas históricas hasta v388](docs/history-through-v388.md), conservadas como referencia, no como reglas nuevas.
- [Propuestas pendientes](FUTURO.md).
- [MacroDroid](docs/macrodroid.md).

## Reorganización v389
Estilos separados por bloques, catálogo único de archivos para página/pruebas/offline,
contexto de lectura energética por render y formulario de eventos dividido en controles
y guardado. Conserva la salida de las vistas y el formato de datos; no añade un framework.

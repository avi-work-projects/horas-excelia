# Gestify: guía de trabajo

## Antes de cambiar código
0. En cada sesión, leer los criterios de mantenibilidad de docs/DEVELOPMENT.md y su revisión de prioridades antes de decidir el alcance. Las prioridades son propuestas, no autorización para ejecutar toda la reorganización.
1. Localizar símbolos en CODEMAP.md y leer solo el bloque necesario.
2. Reutilizar componentes; separar cálculos, renders y listeners.
3. Registrar archivos nuevos en app-assets.json. Ejecutar npm run assets y node tools/codemap.js.
4. Pasar npm test y npm run build; comprobar interacciones y presentación en Edge.
5. Antes de publicar, incrementar APP_VERSION y CACHE_VER. CI debe aprobar las pruebas de navegador.

Una tarea exclusivamente documental conserva las versiones y los archivos de la app. Ver la excepción de publicación en docs/DEVELOPMENT.md.

## Reglas vigentes
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
- Categoría de evento = kind + type. Usar getEvDisplayColor, evStartTime y evSortMarks; no duplicar su política en una vista.
- No perder historial al editar rutinas. Horarios efectivos, extras, recuperaciones y pausas pasan por las funciones compartidas del dominio.
- Datos personales, facturas y backups nunca son fixtures ni se publican. Alarmas solo por MacroDroid, con configuración local.
- Actualizar instantáneas únicamente si el cambio visual es intencionado y se ha revisado el diff.
- Mantenibilidad: una fuente de verdad por regla/componente; corregir la causa y evitar nuevas capas de excepciones. Ordenar por zonas con cambios pequeños, sin reescrituras generales por defecto.
- Separar reorganización interna y cambios de comportamiento. Antes de extraer código, identificar consumidores y caracterizar el resultado existente; después comprobar salida, interacciones, persistencia y aspecto de las vistas afectadas.
- No optimizar por tamaño o por intuición: Ángel considera fluida la app (18/10/2026). Priorizar aislamiento y comprensión; medir antes de modificar rendimiento. La escritura de la previsualización fiscal quedó corregida en v487 y Atrás/flechas/Hoy se consolidaron en v488; las demás prioridades siguen pendientes.
- Mapa visual con capturas: atlas documental en docs/visual-map/ (24/10/2026), ampliado tras aprobar Ángel el piloto. Incluye las secciones y paneles secundarios en láminas navegables, con inventario de límites y accesos ausentes; las capturas nuevas quedan pendientes de su revisión visual. npm run map:serve abre el visor local; map:plan muestra el alcance, map:changed actualiza escenas afectadas y map:verify exporta solo las láminas afectadas. Las revisiones se conservan por huella de imagen, con historial si cambia. Usar datos ficticios y conservar explícita la cobertura. Ver docs/visual-map/README.md y la norma de docs/DEVELOPMENT.md.
- Mantener el atlas también al cambiar funcionalidades, estados o validaciones de los menús: verificar sus recorridos y dependencias, actualizar las capturas afectadas y cerrar las incidencias resueltas junto al cambio. Norma reafirmada por Ángel el 25/10/2026. Revisión inicial de 150 capturas en docs/visual-map/review/: A01–A06 corregidos en v498, A07–A11 en v499, A12–A13 en v500; A09 revertido al selector anual por petición expresa de Ángel en v500; conservar antes/después y la cobertura histórica.

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

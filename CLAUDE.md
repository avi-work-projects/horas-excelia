# Gestify: guía de trabajo

## Antes de cambiar código
1. Localizar símbolos en CODEMAP.md y leer solo el bloque necesario.
2. Reutilizar componentes; separar cálculos, renders y listeners.
3. Registrar archivos nuevos en app-assets.json. Ejecutar npm run assets y node tools/codemap.js.
4. Pasar npm test y npm run build; comprobar interacciones y presentación en Edge.
5. Antes de publicar, incrementar APP_VERSION y CACHE_VER. CI debe aprobar las pruebas de navegador.

## Reglas vigentes
- PWA estática sin backend. Mantener la arquitectura actual y la compatibilidad de backups JSON.
- css/styles.css es generado. Editar css/source/; las otras hojas CSS siguen siendo editables. No alterar el orden de cascada del catálogo por comodidad.
- Renders sin escrituras. Estado de pantalla explícito y listeners separados; consultas del formulario acotadas a su hoja.
- appStorage para persistencia, validación previa e importaciones atómicas con restauración. Toda clave nueva se declara en el censo de backup.
- Energía reutiliza lecturas/cálculos solo dentro de withEnergyData. No mutar sus resultados ni mantener cachés entre renders. Preservar precisión; redondear únicamente al mostrar.
- El scroll de una ventana vive en .sy-body. Navegación y cabeceras no se encogen ni desaparecen. Reutilizar abrirPanel/cerrarPanel y conservar scroll al refrescar.
- Los campos con caja, selectores y tarjetas consecutivas deben separarse 10–12 px reales con gap. Verificar móvil y escritorio.
- Los ajustes de subpestañas se acotan a su pantalla. No cambiar el sistema global para corregir Energía, Próximos o Rutinas.
- En botones de pestaña, selección por fondo; conservar color de fuente y borde. Naranja suave solo para lápices sin texto.
- Categoría de evento = kind + type. Usar getEvDisplayColor, evStartTime y evSortMarks; no duplicar su política en una vista.
- No perder historial al editar rutinas. Horarios efectivos, extras, recuperaciones y pausas pasan por las funciones compartidas del dominio.
- Datos personales, facturas y backups nunca son fixtures ni se publican. Alarmas solo por MacroDroid, con configuración local.
- Actualizar instantáneas únicamente si el cambio visual es intencionado y se ha revisado el diff.

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

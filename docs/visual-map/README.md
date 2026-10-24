# Mapa visual de Gestify

Atlas ampliado el 24/10/2026 tras aprobar Ángel el piloto: **160 capturas,
164 relaciones y 13 áreas**, repartidas en láminas legibles.

```sh
npm ci
npm run map:serve
```

Abrir <http://127.0.0.1:8766/docs/visual-map/index.html>. El servidor solo escucha
en el equipo local. El HTML también funciona como archivo; exportar SVG requiere
el servidor por las restricciones del navegador sobre `file:`.

## Recorrer y comparar

- **Mapa general:** accesos principales desde Inicio.
- **Recorrido de un evento:** piloto aprobado, con ficha, edición, hora, scroll y
  Multidía. Los regresos pueden mostrarse por separado.
- **Sección:** Inicio/facturas, Hogar, Herramientas, Eventos, Economía, Ajustes,
  Rutinas, Bodas, Cumpleaños, gas, electricidad, Fiscal y Tareas. Las áreas largas
  se dividen en páginas de hasta diez estados, más su entrada cuando procede.
- **Conexiones de la seleccionada:** solo sus flechas para facilitar la lectura;
  desmarcar permite ver todas las relaciones de esa lámina.
- **Ficha lateral:** destinos y procedencia. Los enlaces entre secciones abren la
  lámina correspondiente. Pulsar una captura la amplía; un control marcado sigue
  su destino. El fondo se arrastra y el zoom es ajustable.
- **Comparar pantallas:** hasta tres capturas a idéntica escala, filtrables por área.
- **Inventario:** cobertura explícita y censo técnico de funciones de apertura.

Cada origen es un rectángulo medido en el DOM antes de capturar. Las flechas
nacen en el botón, marcador o fila pulsados; los desplazamientos son discontinuos
y parten del área desplazable. Se captura el estado desplazado para que el
siguiente botón aparezca en la imagen. En el piloto también se mide el destino
de los paneles. Una ruta hija comprueba la transición desde su padre; los
regresos se ejecutan aparte. La importación atraviesa el selector nativo mediante
un archivo inventado y llega a la previsualización, sin confirmar la importación.

## Cobertura y límites

Se recorre cada área y los paneles secundarios del inventario: formularios,
selectores propios, catálogos, filtros, alarmas, tareas, edición fiscal, históricos,
extras/recuperaciones, acciones múltiples y preparación de facturas. Incluye
variantes relevantes como factura histórica y preparación actual. No enumera
todas las combinaciones posibles de datos, meses, filtros, errores, temas o
caminos de navegación cruzada.

**Archivo de gas y Archivo de electricidad:** sus funciones siguen en código,
pero la versión de referencia no ofrece una pestaña ni un botón para abrirlos.
Se marcan «Sin entrada visible», sin forzar llamadas internas para capturarlos.
Los selectores nativos de fecha, archivo y carpeta, y los destinos de compartir
y correo, se identifican como límite del atlas.

El formato del piloto está aprobado. **Sin revisar** significa que las nuevas
capturas están pendientes de aceptación visual de Ángel, aunque se haya comprobado
la navegación e inspeccionado las imágenes durante la generación. El generador
no clasifica una pantalla como bonita, anticuada o incoherente ni autoriza rediseños.

## Generación y mantenimiento

`tools/visual-map/catalog.cjs` conserva el piloto y el inventario; `extend.cjs`
añade escenas por áreas con un único constructor de rutas. `fixture.cjs` prepara
datos inventados sobre `tools/fixture.json`. `map-data.json` y `map-data.js` se
generan, no se editan a mano.

```sh
npm run map:capture                         # atlas entero, tres contextos aislados
npm run map:capture -- --scene=calendar     # una escena
npm run map:capture -- --scene=day,time     # varias escenas
npm run map:changed                         # fuentes modificadas y dependientes
npm run map:index                           # cobertura/antigüedad sin capturar
npm run map:check                           # falla si faltan capturas o cambió una fuente
npm run map:verify                          # visor, relaciones y láminas PNG/SVG
node tools/visual-map/probe.cjs             # diagnóstico de rutas sin capturas
```

Las huellas incluyen fuentes de la ruta de acceso, componentes base, CSS, fixture
y generador. Los cambios compartidos pueden afectar a todas las escenas; un módulo
concreto afecta a su escena y descendientes. El índice señala **Actualizar captura**
cuando cambian las fuentes. Es una comprobación por comando, no vigilancia en
segundo plano. Tras regenerar escenas, ejecutar `map:verify` para actualizar láminas.

Edge **headless**, perfil efímero, 400 × 880, escala 1, tema claro, iconos profesionales
y fecha fija **21/08/2026**. Personas, facturas, suministros y eventos ficticios. No
se lee el perfil ni almacenamiento del usuario. Se bloquean peticiones externas
salvo las fuentes de Google. Salvo la recuperación anterior guardada en el perfil temporal ficticio para verificar su resultado, los recorridos se detienen antes de guardar, borrar,
confirmar importaciones, compartir, enviar correos o crear alarmas. El modo de
exportación se abre con un archivo del fixture, sin guardarlo ni compartirlo.

El commit de cada captura identifica la base de la app. Un commit documental
posterior no invalida capturas cuyas fuentes siguen idénticas.

## Archivos

- `captures/*.png`: capturas reales individuales.
- `map-general.png`, `map-flow.png`: láminas generales y del piloto.
- `map-general.svg`, `map-flow.svg`: exportaciones con imágenes incrustadas.
- `sheets/*.png`, `sheets/index.json`: láminas de todas las áreas y su índice.
- `index.html`, `viewer.css`, `viewer.js`: visor documental local.
- `test-results/visual-map/`: QA y SVG intermedios, fuera de Git.

Documentación y herramientas independientes de la PWA: no entran en
`app-assets.json`, `dist/` ni el service worker, ni incrementan la versión.
Las correcciones A01–A06 se integraron con v498 y A07–A11 con v499. A12–A13 (P3) permanecen pendientes de revisión con Ángel.

La revisión visual de las 150 capturas está en `review/index.html`: 13 casos
priorizados, con evidencia histórica y capturas reales del resultado de A01–A11. La fuente
editorial es `review/findings.js`; `review-notes.js` deriva sus anotaciones para el
mapa. `review/coverage.json` conserva las huellas de las 150 imágenes revisadas,
para no confundir esta revisión con una certificación de capturas posteriores.
Las pruebas y reproducciones adicionales usan exclusivamente datos ficticios.

Norma reafirmada por Ángel el 25/10/2026: cada cambio visual o funcional que afecte
a un menú actualiza sus fichas, estados, validaciones y recorridos dependientes.
Revisar las escenas afectadas, regenerar láminas y cerrar hallazgos resueltos junto
al cambio. Si no cambia la salida visual, comprobar y documentar su vigencia sin
repetir capturas innecesarias. `node tools/visual-map/verify-review.cjs` comprueba
el informe; `review-evidence.cjs` conserva los seis resultados reales desde las escenas regeneradas del atlas. La cobertura inicial se verifica contra su commit histórico, sin confundirla con la revisión de estados nuevos.

`node tools/visual-map/p2-evidence.cjs` conserva las capturas reales de los P2 desde el atlas regenerado. `verify-review.cjs` exporta sus comparativas de antes y después.

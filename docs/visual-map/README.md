# Mapa visual de Gestify — piloto

El visor está en `index.html`. Desde la raíz del repositorio:

```sh
npm ci
npm run map:serve
```

Abrir <http://127.0.0.1:8766/docs/visual-map/index.html>. El servidor solo escucha
en el equipo local. El visor también puede abrirse como archivo; para exportar
SVG hay que usar el servidor por las restricciones del navegador sobre `file:`.

## Qué incluye

- **Mapa general:** Inicio, Gastos del hogar, Herramientas de comparación,
  Eventos/Próximos, Resumen económico, Crear alarma y Más opciones.
- **Recorrido:** Calendario de un mes → ficha del día → editar evento → hora;
  desplazamiento del mismo formulario → Multidía. Los regresos pueden mostrarse
  por separado. Cerrar el formulario vuelve al calendario, no al detalle anterior.
- **Comparativa:** hasta tres capturas a idéntica escala, ampliables con el navegador.
- **Inventario inicial:** pestañas y paneles localizados en fuentes, con cobertura
  pendiente explícita. Un censo adicional conserva todas las funciones `openXxx`
  de primer nivel y las aperturas de menús. No equivale a una auditoría completa
  de todos los caminos ni a una lista exhaustiva de estados condicionales.

Cada origen es un rectángulo medido en el DOM antes de capturar, no una posición
dibujada a mano. Cada relación se comprueba ejecutando su control en un contexto
nuevo. Las flechas de desplazamiento son discontinuas; señalan el área desplazable.
El destino de los paneles se mide también para dirigir la flecha al panel abierto.
Las zonas pulsables del visor llevan al destino; pulsar el resto de una captura
la amplía. El fondo se arrastra y los botones permiten ajustar el zoom.

## Generación y mantenimiento

La fuente editorial única es `tools/visual-map/catalog.cjs`: escenas, rutas,
dependencias directas, relaciones y primer inventario. `map-data.json` y
`map-data.js` se generan; no deben editarse a mano. Las coordenadas de las
tarjetas organizan el mapa; las de los controles proceden del navegador.

```sh
npm run map:capture                         # piloto entero
npm run map:capture -- --scene=calendar     # una escena
npm run map:changed                         # fuentes modificadas y dependientes
npm run map:index                           # actualizar cobertura/antigüedad sin capturar
npm run map:check                           # falla si faltan capturas o cambió una fuente
npm run map:verify                          # visor, relaciones registradas y láminas exportadas
```

Las huellas incluyen las fuentes del recorrido de acceso, los componentes base,
las hojas de estilo cargadas, fixture y generador. Un cambio en CSS se considera
compartido y puede requerir todas las escenas del piloto. Un cambio en un módulo
específico afecta a esa escena y sus descendientes. El índice marca **Actualizar
captura** si sus fuentes han cambiado. Es una comprobación ejecutada por comando,
no una vigilancia del repositorio en segundo plano. Después de cambiar escenas,
ejecutar `map:verify` para regenerar también las láminas PNG/SVG.

Las capturas usan Edge **headless**, perfil efímero, 400 × 880, escala 1, tema claro,
iconos profesionales y fecha fija **21/08/2026**. Se reutiliza `tools/fixture.json`
con dos eventos inventados para el recorrido. No se lee el almacenamiento del
usuario. Se bloquean peticiones externas salvo los archivos de las fuentes de
Google; no se pulsa guardar, enviar, exportar datos reales ni crear alarmas.

El commit de cada captura identifica la base de la app. Los cambios documentales
posteriores no invalidan una captura cuyas fuentes siguen idénticas. **Sin revisar**
significa pendiente de aceptación visual de Ángel, aunque el generador haya
comprobado la navegación y el agente haya inspeccionado las imágenes. No hay
clasificación automática de una pantalla como bonita, coherente o anticuada.

## Archivos y alcance

- `captures/*.png`: capturas reales de las escenas.
- `map-general.png` y `map-flow.png`: láminas para revisión rápida.
- `map-general.svg` y `map-flow.svg`: exportaciones con las capturas incrustadas.
- `index.html`, `viewer.css`, `viewer.js`: visor documental sin dependencias de UI.
- Las capturas de QA del visor quedan en `test-results/visual-map/`, fuera de Git.

Este piloto es documentación y herramientas locales. No entra en
`app-assets.json`, en `dist/` ni en el service worker; no incrementa la versión de
la PWA y no añade menús a producción. La rama se conserva independiente hasta que
Ángel revise el resultado. Lo pendiente es ampliar cobertura por zonas y añadir
las incidencias visuales que se decidan registrar tras esa revisión.

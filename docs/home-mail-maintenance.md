# Home: estados persistentes y programación independiente del móvil

Trabajo autorizado por Ángel el 28/10/2026, sobre v515. Referencia visual
aprobada: propuesta Home v9 de este chat. Se conserva la estructura de las
tarjetas semanales y las capturas anteriores del atlas.

## Contratos de la entrega

- Resumen mensual a la derecha, días/horas en la misma línea, fórmula
  desplegable sin duplicar el total; colores compartidos de jornadas.
- Tres zonas semanales, separadores neutros, V/F/A en negrita y fondo de
  celda completo. Envío manual a Outlook y desbloqueo local para editar.
- Hechos confirmados persistentes por semana/mes y conexión; navegar,
  foco, conexión y cambios locales no provocan barridos de Outlook.
- Primera conciliación del mes anterior, actual y siguiente; histórico
  anterior cerrado. Programar abarca el mes visible y dos semanas extra.
- Trabajos duraderos en Kairo: iniciar, recuperar estado y resultado,
  cerrar Gestify y volver sin abortar ni repetir la operación.
- Programación individual y conjunta a las 08:00 Europe/Madrid, último
  día trabajado; semana enteramente vacaciones/festivos usa el último
  lunes-viernes no festivo. Fecha vencida o inexistente queda pendiente.
- Mantener bloqueo por semana anterior, idempotencia y comprobación de
  duplicados por semana completa antes de escribir. Cambios requieren
  aprobar la actualización del mismo correo; abrir Outlook no confirma envío.
- Facturas: programada con fecha confirmada, enviada o sin enviar. Día 20
  o laboral anterior; discrepancias de fecha se revisan, nunca se ocultan.
- Actualizar manualmente correos y factura; fallos conservan el último
  estado. Una comprobación puntual tras vencimiento confirma entrega.

## Zonas y consumidores

Home y copia de swipe comparten modelo/render. Cambios de horas usan core,
home-hours, home-weeks, hours-cache y hours-kairo; facturas usan invoices-home.
El receptor privado y hours_service/store comparten las reglas de hours_model
y la integración de Outlook existente. No se modifican alarmas ni autenticación.

Primero se refuerzan persistencia/transporte, después se conecta la presentación.
Se verifican navegación, reinicio, cierre del cliente, errores, horarios,
actualización sin duplicados, estado real de Kairo y geometría en Edge móvil.
Solo se recapturan Home y los diálogos sustancialmente modificados. La batería
completa de navegador queda para CI; en local se ejecuta la cobertura afectada.

## Estado

Implementado sobre la integración existente.

La cola SQLite comparte el bloqueo del navegador y el diario previo a escribir.
Una confirmación repetida recupera el mismo trabajo; un reinicio recupera las
lecturas y deja las escrituras interrumpidas pendientes de revisión. El estado
final se recalcula con el diario ya confirmado, sin otro barrido de Outlook.

La actualización de indicadores conserva los botones y las celdas: reemplazar
las tarjetas al recuperar el foco podía perder una pulsación al salir del iframe.
El desbloqueo local se mantiene separado del hecho remoto observado.

Las acciones explícitas de preparación/consulta de factura refrescan su mes
cuando Kairo confirma la respuesta. Una conexión cambiada o borrada no hereda
ese resultado. Fuera de esas acciones y del refresco manual, se conserva la caché.

Validación local: npm test y build; 35 pruebas Python; pruebas de Home, cachés,
Android instalado simulado, programación individual/conjunta, respuestas tardías,
conexiones, facturas y geometría móvil. La revisión real del escritor usa una
instancia aislada de Chromium con red desactivada. La batería completa queda
como puerta de publicación en CI.

Prueba real de lectura el 28/10: auditoría conjunta anterior/actual/siguiente en
27,06 s; aceptación en 38 ms y recuperación posterior en 3 ms. La sesión existente
de Outlook funciona. Se conservó la configuración de escritura y no se ejecutaron
programaciones ni envíos. Se guardó una copia privada del código y SQLite antes
de actualizar el servicio de Kairo. Las pruebas del escritor usan un navegador
separado con datos ficticios y la red desactivada.

El servicio de facturas ya aplica día 20 y retroceso por fin de semana/festivo.
Home conserva la fecha confirmada de Kairo; cualquier diferencia con el
calendario de Gestify se muestra para revisar, sin modificar una factura aprobada.

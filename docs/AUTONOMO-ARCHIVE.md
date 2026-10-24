# Archivo de autónomo: contrato entre equipos

Regla permanente de Ángel, 25/10/2026: antes de cambiar rutas, nombres,
estructura o contratos de datos, documentar el impacto en mini, Google Drive,
Kairo y consumidores. Preparar migración y reversión; verificar las copias al
terminar. Un cambio local no se considera desplegado en los otros equipos.

## Autoridad y destinos

- AUTONOMO existente en Drive es el archivo documental común. El mini usa su
  espejo de Drive. No crear una segunda carpeta AUTONOMO por comodidad.
- FACTURAS/año/A - FACTURAS INGRESOS conserva los PDF emitidos y sus nombres.
  El publicador de Kairo depende de ese contrato; no moverlos unilateralmente.
- FACTURAS/año/FACTURAS AMAZON es la fuente de gastos indicada por Ángel. No
  exigir exportación de Declarando para incorporar sus documentos. Respetar
  exclusiones expresas y evitar contar dos veces originales/copias.
- MODELOS/MODELOS IVA conserva justificantes con el patrón histórico
  MODELO 303 IVA - año - número trimestre.pdf. No reestructurar el histórico
  para añadir dos justificantes. Descargar es distinto de presentar.
- LIBROS CONTABLES/año contiene libro anual y sus datos fuente privados.
- REVISIONES contiene ensayos identificados; instrucciones IA explica el estado,
  rutas y cambios. Código, logs, cachés y credenciales quedan fuera de AUTONOMO.

Kairo conserva por separado su archivo fiscal y bases operativas: no se
sobrescriben con Drive. Su publicador actual solo copia definitivas a Drive;
no es una sincronización bidireccional de toda AUTONOMO.

## Consulta y cambios

El libro es una salida regenerable. Para cambiar un dato, identificar documento,
campo y motivo, actualizar la fuente privada y regenerar. Conservar huellas y
fecha de revisión; no cambiar originales emitidos para igualar un resultado.
Los datos reales y los justificantes nunca se incorporan a Git público.

Las copias seleccionadas para consulta en Kairo se guardan fuera del runtime y
de las bases fiscales. Son instantáneas fechadas, no fuentes editables en paralelo.
Comprobar SHA256 contra el espejo y Drive; si falla la comprobación, informar
pendiente de sincronizar, no afirmar que todo está actualizado.

Antes de una migración: inventariar lectores/escritores, definir origen/destino,
guardar respaldo, probar sin emisión ni correo y comprobar cambio de año,
duplicados y reintentos. Actualizar esta guía, instrucciones privadas y configuración
de todos los consumidores en la misma tarea. No añadir procesos periódicos por
defecto ni usar rclone sync con borrado para distribuir documentación.

La revisión fiscal permanece separada y aplazada. Las diferencias con modelos
presentados se muestran; nunca se fuerzan importes para conseguir coincidencia.

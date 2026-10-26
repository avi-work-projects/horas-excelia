# Gastos, cierre anual y renta

Revisión del producto Declarando realizada el 26/10/2026, con sesión autorizada.
No se crearon ni modificaron gastos, facturas o declaraciones. No se copian
sus textos de ayuda; las siguientes son observaciones y decisiones propias.

## Observado y propuesta

| Observado en Declarando | Aplicación propuesta en Kairo | Estado |
|---|---|---|
| Catálogo de 41 opciones, preguntas según gasto y actividad | Ficha breve de ayuda por categoría, con condiciones y fuente fechada | Diseñado; pendiente implementar |
| Analizador con normativa, consejo, consecuencias y acceso a registro | Separar explicación, datos que faltan y acción; evitar que una sugerencia contabilice automáticamente | Pendiente |
| Ordenador: preguntas de titular de factura, importe, duración y uso | Separar IVA de IRPF y vincular activo/amortización con documento de compra | Pendiente revisión fiscal |
| Factura europea: preguntas de IVA y ROI | Detectar operación especial y pedir revisión; no asumir IVA nacional | Pendiente revisión fiscal |
| Bandeja «Para revisar», listado por proveedor, origen y filtros | Importación propuesta → revisión → incorporado; detección de duplicados y trazabilidad | Siguiente interfaz a desarrollar |
| Consejo por cuota de Seguridad Social ausente | Avisos explicables por documentos esperados, descartables, sin dar por cierta una obligación por ausencia de registro | Pendiente |
| Resumen trimestral y exportación | Ya existe consulta Modelos; falta generación guiada/aprobación de nuevos cierres | Parcial |
| Renta separa resultado actual, previsión y escenario editable; incluye nóminas, otros ingresos y retenciones | Separar hechos de simulaciones y explicar el cálculo; nunca confundir una previsión con datos fiscales completos | Pendiente |

Se inspeccionó un supuesto ilustrativo de ordenador, no un gasto real. El
resumen de respuestas mostró «más de» aunque el formulario conservaba «No»;
no utilizar ese resumen como evidencia fiscal. Las reglas y porcentajes del
analizador requieren contraste oficial antes de incorporarlos al motor.
No trasladar mensajes de ahorro/promociones ni automatizar deducibilidad por
popularidad entre otros profesionales.

Fuentes complementarias leídas (no reglas ejecutables):
- https://ayuda.declarando.es/es/articles/1101552-como-contabilizo-un-gasto
- https://ayuda.declarando.es/es/articles/1016654-diferencia-entre-los-gastos-con-factura-y-gastos-sin-factura
- https://ayuda.declarando.es/es/articles/3530511-amortizar-bienes-que-no-son-inversion

## Orden de implementación

1. Terminar la variante de domiciliación en OPEN y el flujo de cierre nuevo:
   datos, comprobaciones, resumen aprobado y exportación. No presentar de nuevo
   periodos históricos. La autorización de cuenta no equivale a firmar un modelo.
2. Ingesta de gastos con revisión: adjunto, proveedor, fechas y procedencia,
   importes documentales, categoría propuesta, IVA/IRPF separados. Una ayuda
   debe declarar ejercicio, fuente, condiciones y estado de revisión.
3. Preparación anual 390: dossier y conciliación implementados; faltan mapeo
   específico, diseño aplicable, cobertura del año y validación oficial.
   El servicio consultado todavía ofrece 2025:
   https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G412.shtml
   Diseño: https://www3.agenciatributaria.gob.es/Sede/ayuda/disenos-registro/modelos-300-399.html
   El 390 es informativo, no otro pago del IVA trimestral.
4. Amortizaciones: recuperar fichas existentes, evitar doble deducción de
   compra y dotación, conservar historial por activo. No hacer ajustes al
   histórico sin revisión específica.
5. Renta: preparar un expediente anual de ingresos, gastos, retenciones,
   amortizaciones y documentación personal/fiscal pendiente. Contrastar con
   datos fiscales y Renta WEB del ejercicio. El libro de actividad no permite
   calcular por sí solo toda la renta. Asistencia conversacional y revisión
   del usuario; no prometer una API de presentación ni enviar sin aprobación.
6. Boletín de cambios y ayudas: pendiente, con aplicabilidad al perfil y plazos.
   No se crea una suscripción ni tarea periódica en esta fase.

## Distribución de este cambio

Nuevo módulo offline prepare_390 y apartado GET anual del panel privado.
Regenerar REVISIONES/año/REVISION_IVA_año.json/html, actualizar su SHA en el
índice y copiar los documentos seleccionados Drive → consulta de Kairo.
Verificar huellas antes de activar el índice. No mover originales ni cambiar
datos del libro. Respaldo del módulo y del índice previo fuera del archivo
documental; reversión restaurándolos. Sin nuevos temporizadores, POST, firmas,
emisiones ni correos. La generación sigue ejecutándose con el comando del README.

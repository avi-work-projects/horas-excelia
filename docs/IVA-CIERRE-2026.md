# Cierre de IVA 2026 desde el mini

Estado técnico comprobado el 18 de noviembre de 2026. No se ha presentado ningún
modelo nuevo. El libro real sigue abierto: solo octubre está incorporado al 4T.

## Lo preparado

- El 303 trimestral genera el fichero oficial 2026 y conserva revisión, versión,
  validación, autorización de presentación y justificante como pasos distintos.
- El 390 anual genera el fichero oficial 2026 y concilia los cuatro trimestres.
  Requiere el 4T completo y su referencia presentada; un dossier provisional no
  habilita la presentación.
- Las compras corrientes de servicios UE con IVA documental cero, autoliquidación
  al 21 % y deducción completa tienen un tratamiento explícito `eu_services21`.
  El IVA del documento permanece en cero. El 303 usa 10/11 y 36/37; el 390 usa
  551/552, 637/638 y los totales 597/598. No se mezclan con gastos nacionales.
- El acceso al certificado de Windows y la consulta del 3T ya presentado se
  comprobaron el 17 de noviembre. No se ha probado una presentación real nueva.

## Comprobación oficial del 18 de noviembre

El ensayo del 303 4T, con importes ficticios y una compra UE de 18 euros, devuelve
validación correcta y PDF, sin errores. Tiene los avisos 30100, INF024 y 31190:
hay que revisar su aplicabilidad en el cierre real. Se corrigió la lectura de
avisos multilínea, sin relajar la validación de identificadores.

El servicio oficial devuelve para el 390 de 2026 que no encuentra la presentación
`390-2026-002`. La estructura está comprobada contra el diseño oficial y las
pruebas locales, pero **su validación oficial sigue pendiente**. No se cambia de
ejercicio para presentar esa prueba como válida para 2026.

## Qué hacer en enero

1. Actualizar los ingresos y completar noviembre/diciembre. Recuperar los PDF
   pendientes, revisar gastos/exclusiones y aprobar los que correspondan.
2. Revisar Claude: el uso exclusivamente profesional está confirmado; comprobar
   NIF-IVA/ROI y la obligación de 349. La solicitud de alta en ROI conservada no
   demuestra por sí sola que el alta esté vigente. El 349 aún no se exporta.
3. En Modelos → 4T, confirmar cobertura y perfil, generar la versión final y
   validarla. Revisar avisos, modalidad y plazos vigentes antes de autorizar el
   envío. No repetir un envío cuya respuesta haya quedado incierta.
4. Archivar el justificante del 303. Preparar el 390 con los cuatro trimestres,
   resolver diferencias conservando las cuotas originales y repetir su
   validación oficial cuando el servicio esté disponible.
5. Autorizar el 390 por separado, conservar ambos justificantes y comprobar el
   pago o cargo cuando corresponda.

Entre los documentos pendientes conocidos están la factura del pedido Amazon
de los tapones y la factura solicitada a Alicantecno. No se da un periodo por
completo porque exista una factura de cada proveedor o de cada mes.

## Documentos y encargos a la IA

En Gastos, «Abrir carpeta de entrada» abre `AUTONOMO/ENTRADA/GASTOS/2026`.
Arrastrar PDF allí no ejecuta nada. «Importar PDF depositados» los incorpora
como borradores, conservando originales y evitando duplicados; aprobarlos sigue
siendo una acción separada.

Recoger facturas permite guardar un encargo para buscar en correo o procesar esa
carpeta. Se puede copiar el prompt o abrirlo en el compositor de ChatGPT; el
usuario lo envía. La IA registra documentos, procedencia y pendientes mediante
un informe estructurado. «Comprobar resultados» coteja ese informe con la bandeja
y el libro, distinguiendo recuperado, en revisión e incorporado.

El historial vive en el mini, todavía sin sincronización al móvil. No hay
observadores de carpetas, búsquedas periódicas ni envío automático de prompts.
Electricidad y gas continúan reservados para revisión en Renta, no para deducir
IVA automáticamente. El Excel es una consulta del libro, no su fuente editable.

Contrato y CLI: [DESKTOP-ACCOUNTING.md](DESKTOP-ACCOUNTING.md).
Alcance anual: [IVA-390.md](IVA-390.md).

Fuentes: [instrucciones 303 2026](https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/iva/modelo-303-iva-autoliquidacion_/instrucciones-2026/instrucciones-02-12-2t-4t-2026.html),
[operaciones intracomunitarias](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/folleto-actividades-economicas/5-impuesto-sobre-valor-anadido/5_9-operaciones-intracomunitarias.html),
[enlaces del compositor de ChatGPT](https://learn.chatgpt.com/docs/reference/commands.md).

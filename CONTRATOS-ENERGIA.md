# Histórico de contratos de luz y gas

Acceso: Configuración fiscal → Hipoteca y Facturas → Detalle Gas o Electricidad → Histórico de contratos.

`js/energy-history.js` mantiene contratos independientes de DESPACHO y de las simulaciones. No migra automáticamente tarifas existentes: faltan las fechas y condiciones originales. No almacena los PDF, sino sus datos y una referencia al documento. Un cambio de condiciones con nueva vigencia se registra como otra etapa, conservando la anterior.

Persistencia: `excelia-energy-history-v1`. El backup completo y la exportación específica incluyen `energyContracts`. La importación específica combina sin borrar otros contratos; la general respeta añadir/reemplazar cuando se incluye ese campo. Un backup antiguo que no incluya el campo deja el histórico intacto.

Se valida antes de escribir. Las importaciones repetidas se identifican por `id` o por suministro, tipo, compañía, tarifa e intervalo de fechas. Si se reconoce un contrato se actualiza conservando su identificador local. Para archivos elaborados a partir de facturas, reutilizar el identificador ya exportado al corregir información. Nunca inferir fechas de contrato a partir del período facturado sin indicarlo en las observaciones.

Formato mínimo de intercambio (datos ficticios):

```json
{
  "version": 7,
  "energyContracts": [{
    "id": "energy-ejemplo-1",
    "kind": "luz",
    "supplier": "Comercializadora de ejemplo",
    "tariff": "Tarifa ejemplo",
    "supply": "Vivienda de ejemplo",
    "start": "2025-01-01",
    "end": "2025-12-31",
    "commitment": "",
    "taxes": "excluidos",
    "prices": [{"label": "Energía P1", "value": 0.12, "unit": "€/kWh"}],
    "notes": "Condiciones que consten en el documento",
    "source": "factura-ejemplo.pdf"
  }]
}
```

`kind`: `luz` o `gas`. `taxes`: `incluidos`, `excluidos` o `desconocido`. Fechas desconocidas: cadena vacía; precios desconocidos: no incluir el concepto. Los precios conservan sus decimales y unidades, sin conversiones implícitas. Admite varios conceptos de energía/potencia, término fijo, cuotas y servicios. Condiciones indexadas, descuentos y excepciones se describen en `notes`.

Verificación: `npm test` cubre persistencia, importación repetida, separación luz/gas, validación de fechas e importes e importación mediante el backup general. La interacción y el aspecto se revisan también en el navegador.

## Facturas y consumo (v359)

Desde la misma sección, «Facturas y consumo» abre el registro real por año. `js/energy-bills.js` contiene validación, persistencia, fusión y agregación; `js/energy-bills-view.js` contiene vistas y formularios. Se reutilizan paneles, botones, tablas y `simpleBarChart`, sin dependencias nuevas.

Persistencia: `excelia-energy-bills-v1`, campo `energyBills` del backup. Exportar desde facturas incluye todos los años del suministro y sus contratos. Ambos importadores específicos aceptan los dos campos y los guardan en una transacción con Deshacer. El backup general mantiene su semántica añadir/reemplazar; si falta el campo no lo borra.

Una factura contiene `id`, `kind`, `supplier`, `number`, `issued`, `start`, `end`, `consumption`, `net`, `gross`, `paid`, `notes`, `source`. `consumption` está en kWh; importes en euros. `net` excluye todos los impuestos del recibo (no es necesariamente la base de IVA). `gross` es el total con impuestos; `paid` es el cargo indicado tras créditos/saldo, no una confirmación bancaria. `null` en consumo/cargo significa desconocido; cero es un dato real y no se sustituye. Los abonos pueden ser negativos. Las correcciones de consumo se registran por su efecto neto, explicándolo en la nota, para no volver a sumar consumos ya registrados.

Identidad de importación: ID o suministro (luz/gas), comercializadora y número de factura; se conserva el ID local al actualizar. No usar el nombre del PDF como identidad. Los archivos personales nunca forman parte de los fixtures ni del repositorio.

Las gráficas agrupan por **mes de emisión**, también cuando el período cruza meses/años. No se prorratea el consumo ni se convierte en consumo de mes natural. Mes sin facturas: sin dato, no cero. Si un recibo del mes carece de consumo/cargo, la gráfica correspondiente marca el mes incompleto; importes y datos individuales siguen en las tarjetas. Los abonos negativos se incluyen en los totales de la tabla, con aclaración cuando el gráfico compartido no puede representarlos.

Los contratos mantienen precios/unidades originales y no se recalculan con un IVA actual: los impuestos pueden cambiar. Si no hay fecha acreditada de cambio de precio, se describen las observaciones por factura en lugar de inventar una fecha de vigencia. Para fechas documentadas, registrar etapas separadas.

Pruebas añadidas: identidad entre dispositivos, importación repetida, campos ausentes, cero, abonos, consumo fraccionario, agrupación anual por emisión, importación general y restauración. La vista se revisa en Edge con un almacenamiento aislado de prueba.


## Estudio de consumo y tarifas (v360)

Acceso: Configuración fiscal → Hipoteca y facturas → Gas/Electricidad → Consumo y tarifas. Tres vistas: Consumo, Tarifas y Comparar; las facturas originales siguen aparte.

- `energy-analysis.js`: motor puro compartido, validación de tarifas, IVA y prorrateo.
- `energy-analysis-view.js`: vistas, navegación y editor de períodos de IVA.
- `energy-tariff-editor.js`: formulario común para contratos y escenarios; copia explícita entre ambos, sin sustituir silenciosamente la tarifa actual.
- `tools/test-energy.js`: invariantes numéricas y regresión de los cálculos anteriores.

Cada contrato admite `analysis` opcional. Usa las mismas claves que los escenarios (`modo`, `precioKwh`, `cuotaFija`, `terminoFijo`, `terminoFijoDia`, precios y potencias P1/P2). `energyMode` distingue `unico`/`tramos`; `periodPrices` y `periodWeights` tienen tres números, los pesos suman 100 %. El editor calcula `precioKwh` para mantener compatibles las vistas antiguas; el motor usa siempre la ponderación original. `useOwnPower` permite que una alternativa configurada tenga su propia potencia; las antiguas conservan la potencia de la tarifa actual.

`modo: fijo` sustituye energía, potencia y términos fijos por una cuota mensual. El estudio nuevo prorratea por días reales de cada mes; los escenarios existentes mantienen su convenio de 30 días. `otherTaxPct` y `otherTaxKwh` son aproximaciones opcionales anteriores al IVA; `promotion` es descuento mensual después de impuestos, desactivado por defecto y prorrateado en meses parciales. No es una reproducción fiscal exacta de una factura.

El IVA se almacena en `excelia-energy-tax-v1` y viaja como `energyTaxes` en el backup general y en los exports específicos. Cada registro: `{kind: 'luz'|'gas', start: 'YYYY-MM-DD', rate: número}`. Vale desde su fecha hasta el siguiente cambio del mismo suministro. No se aplica un IVA actual al pasado ni se preinstala un calendario fiscal supuesto: los períodos deben proceder del suministro del usuario. Sin período conocido, la comparación con impuestos muestra Sin dato. En el estudio aproximado se aplica por fecha de consumo, no se reproduce la regla de devengo de cada factura.

Los consumos e importes se distribuyen uniformemente entre las fechas de cada factura. Si dos recibos de consumo comparten exactamente la fecha límite, se asigna al siguiente para evitar contar dos veces ese día. Los importes y kWh totales se conservan. Se muestran cobertura y meses parciales; no se extrapola a meses completos. Solapamientos o consumo desconocido impiden simular ese mes. El campo opcional `noReading` de una factura indica consumo no acreditado para el estudio (p.ej. cero impreso sin nueva lectura): mantiene el dato documental, pero no lo interpreta como consumo doméstico cero.

La comparación aplica un contrato elegido a los días con consumo, independientemente de su vigencia histórica: es el contrafactual de mantenerlo todo el período. La columna facturada usa el total con impuestos, antes de saldo externo. Diferencia positiva significa menor coste simulado. Los abonos negativos siguen en tablas, como en el gráfico compartido de facturas.

Compatibilidad: al añadir un backup antiguo sin `analysis`, `noReading` o `energyTaxes`, se conservan los datos nuevos existentes. Reemplazar sigue la semántica del importador general. El importador específico fusiona IVA por suministro/fecha en la misma transacción que contratos y facturas; Deshacer restaura los tres bloques.

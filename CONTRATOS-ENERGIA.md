# Histórico de energía (v369)

Acceso: Configuración fiscal → Hipoteca y Facturas → Detalle Electricidad/Gas → **Consumo y tarifas**.

Una ventana con cinco pestañas y selector de año: Resumen, Consumo, Coste, Tarifas y Escenarios. El histórico solo se incorpora mediante archivos; las hipótesis de los escenarios no alteran los datos reales. Los PDF se conservan fuera del repositorio: la app guarda datos y referencias al documento.

## Módulos y persistencia

| Módulo | Responsabilidad |
|---|---|
| `energy-history.js` | Contratos, validación e identidad |
| `energy-bills.js` | Facturas, lecturas, fusión y restauración |
| `energy-analysis.js` | Tarifas ponderadas, cargos e IVA |
| `energy-costs.js` | Coste del consumo por día y compañía |
| `energy-study.js` | Indicadores, tarifas comerciales, franja de IVA y comparación |
| `energy-analysis-view.js` / `energy-analysis-bind.js` | Cinco pestañas, navegación y acciones |
| `energy-import-preview.js` | Diferencias antes de confirmar la importación |

Las claves `excelia-energy-history-v1`, `excelia-energy-bills-v1` y `excelia-energy-tax-v1` viajan en el backup como `energyContracts`, `energyBills` y `energyTaxes`. La importación específica solo fusiona: muestra registros nuevos/actualizados, permite cancelar y ofrece Deshacer después. La general admite añadir/reemplazar por las categorías incluidas. Un archivo sin una categoría no la vacía.

Contratos y facturas se identifican por `id` o firma de contenido; se conserva el identificador local cuando coinciden. Las correcciones preparadas deben reutilizar los identificadores anteriores. Todos los bloques se validan antes de guardarse dentro de una transacción.

## Contratos y condiciones

Formato mínimo de contrato (datos ficticios):

```json
{
  "version": 7,
  "energyContracts": [{
    "id": "contrato-ejemplo",
    "kind": "luz",
    "supplier": "Compañía de ejemplo",
    "tariff": "Tarifa por consumo",
    "supply": "Vivienda de ejemplo",
    "start": "2025-01-01",
    "end": "",
    "commitment": "",
    "taxes": "excluidos",
    "prices": [{"label": "Consumo", "value": 0.12, "unit": "€/kWh"}],
    "notes": "Condiciones documentadas; fechas desconocidas expresamente indicadas",
    "source": "factura-ejemplo.pdf"
  }]
}
```

`kind`: luz/gas. `taxes`: incluidos/excluidos/desconocido. Fechas desconocidas: cadena vacía; precios desconocidos: omitir el concepto, nunca convertirlos en cero. El período de factura no acredita por sí solo el alta/baja contractual: indicar cuando se usa como aproximación de la cobertura.

`analysis` contiene una tarifa calculable, validada con `energyValidateTariff`. `analysisPeriods` admite etapas `{start, tariff}`: rigen hasta la siguiente etapa dentro del contrato y prevalecen sobre `analysis`.

- Consumo: precio único o tres precios (`periodPrices`) con pesos que suman 100 (`periodWeights`). Si las lecturas mensuales tienen desglose completo, se usan sus proporciones reales.
- Potencia: uno o dos precios diarios multiplicados por los kW contratados.
- Cuota fija mensual: sustituye consumo/potencia/fijos, con prorrateo por días reales del mes.
- `terminoFijo` / `terminoFijoDia`: cargos mensuales/diarios incluidos en la base del impuesto eléctrico aproximado.
- `extrasPerDay`: alquiler y servicios diarios fuera de esa base, sujetos a IVA. Opcional, cero cuando no existe.
- `servicesPerDay` / `servicesVatPct`: servicios recurrentes con IVA propio (por ejemplo mantenimiento al 21 % mientras el suministro tiene IVA reducido). En escenarios de IVA constante o sin IVA, la hipótesis se aplica también a estos servicios.
- `otherTaxPct` / `otherTaxKwh`: aproximación del impuesto eléctrico antes del IVA.

`energyCommercialPeriods` agrupa etapas consecutivas con iguales precios de consumo/potencia. Los cambios de reparto de consumo, cargos o impuestos se consultan dentro de la misma tarifa. El cálculo conserva todas las etapas originales. Las fechas exactas de cambio deben proceder de documentos; no crear una tarifa distinta solo por emitir otra factura.

## Facturas, lecturas y cobertura

`energyBills` conserva identificación, suministro, compañía, fecha de emisión, inicio/fin, consumo, neto, bruto, cargo conocido y notas. Los importes negativos se admiten para abonos; un valor desconocido es `null`.

Campos opcionales:

- `vatAmount`, `electricityTaxAmount`, `otherTaxesAmount`: impuestos documentados.
- `readings: [{start,end,consumption,periods:[punta,llano,valle]}]`: lecturas con fechas **inclusivas**.
- `readings: []`: documento financiero sin lectura adicional (abono o lectura sustituida).
- `consumptionPeriods`: desglose de una factura antigua sin `readings`.
- `serviceOnly`: mantenimiento sin suministro; no invalida otras lecturas del mes.
- `noReading`: consumo no acreditado; no interpretarlo como consumo cero.

El archivo preparado resuelve explícitamente las rectificaciones. No deducir automáticamente qué factura sustituye otra. Sin `readings`, se conserva la compatibilidad anterior: una fecha límite compartida se asigna al siguiente recibo. Solapamientos sin resolver bloquean el cálculo; los huecos nunca se extrapolan.

## Coste, IVA y escenarios

El consumo conocido de un mes se reparte uniformemente entre sus días cubiertos y se calcula con la tarifa vigente de cada día. Las barras apilan los costes por compañía. El IVA (`{kind,start,rate}`) procede del histórico importado; la franja une intervalos adyacentes iguales y muestra una etiqueta por tramo. No se instala una tabla fiscal supuesta.

La comparación anual distingue **estimado por consumo** y **facturas por emisión**. Su diferencia puede incluir desplazamientos entre años, abonos, días sin lectura y regularizaciones; no es un error puro del modelo ni acredita pagos bancarios. Los cargos promedios deben justificarse con documentos, no ajustarse para forzar esa diferencia a cero.

Los dos escenarios comparan el histórico con IVA constante elegido y con una tarifa elegida para todo el período. Usan el mismo consumo/cobertura; el segundo conserva el IVA histórico y los últimos cargos documentados dentro de la tarifa elegida. Las tarifas hipotéticas de las listas de DESPACHO siguen siendo compatibles y exportables.

## Verificación

`npm test` cubre compatibilidad, pesos, cuotas, IVA, cargos separados, lecturas corregidas, huecos, fusión idempotente, vista previa sin escritura y Deshacer. La revisión de CSS y acciones se realiza en Edge; CI ejecuta además las pruebas de navegador antes de publicar.

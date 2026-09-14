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

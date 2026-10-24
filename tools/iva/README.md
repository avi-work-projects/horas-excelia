# Libro anual y ensayo Pre303

Herramientas locales, separadas de la PWA y de los servicios de facturación. No
emiten facturas, no acceden a certificados, no presentan declaraciones y no
modifican documentos originales. No incorporar estos archivos a app-assets.json:
son herramientas de escritorio, no recursos públicos de la PWA.

## Flujo

1. Mantener un JSON privado con `year`, `as_of`, `records`, `documents`,
   `coverage`, `profiles`, `references`, `reference_source` y `activity`.
2. Opcionalmente actualizar ingresos desde los PDF compatibles:
   `python collect_income.py --input privado.json --root AUTONOMO --folder carpeta/ingresos --profile cliente.json --output actualizado.json`.
   El perfil privado contiene `customer` y `customer_tax_id`. El adaptador admite
   exclusivamente los diseños inspeccionados, de una página, con una base,
   IVA 21 % y retención 15 %. Cualquier ambigüedad bloquea la importación.
3. `python ledger.py actualizado.json --root AUTONOMO --output calculado.json`.
4. Con Node y `@oai/artifact-tool` disponibles:
   `node build_workbooks.mjs calculado.json salidas cabeceras-lsi.json 3T`.
   Añadir `--annual-only` para actualizar el libro sin generar LSI cuando faltan
   campos de importación. No inventar identidades ni fechas de recepción.
   Las cabeceras son las dos filas originales de la plantilla oficial, claves
   `EXPEDIDAS_INGRESOS` (36 columnas) y `RECIBIDAS_GASTOS` (42).
5. Revisar cobertura, diferencias, fórmulas y pendientes; ensayar importación
   en OPEN. La aceptación informática no confirma la corrección fiscal.

## Datos y límites

Respetar [el contrato de archivo entre equipos](../../docs/AUTONOMO-ARCHIVE.md).
Los gastos se toman de la carpeta Amazon por instrucción del usuario; no requieren
contraste previo con Declarando. La revisión fiscal y las exclusiones expresas
siguen separadas de la incorporación documental.

Cada registro identifica tipo, número, proveedor/cliente, NIF documental, fecha,
periodo explícito, base, IVA, retención y total (cadenas decimales con dos cifras),
inclusión, tratamiento, tipo impositivo, ruta relativa del PDF y SHA256. Los gastos
del ensayo histórico tienen además `legacy_party`, `legacy_tax_id` y
`registration_date`: esa identidad histórica se usa únicamente para comparar la
importación anterior, no sustituye al proveedor documental del libro anual.

Solo se calculan casillas 07, 09, 28, 29, 45 y 46 para el perfil doméstico al 21 %
soportado. La 71 requiere confirmación explícita de que las otras casillas no
aportan ajustes; en otro caso queda pendiente. No es un motor fiscal universal.
Rectificativas, retenciones en gastos y otros tratamientos necesitan adaptadores
específicos; no se asimilan silenciosamente. Las filas excluidas quedan visibles
en el libro, pero no se exportan ni suman. Cero gastos incorporados no demuestra
que no existan gastos. El export incluye los periodos anteriores del mismo año,
pero no puede inventar documentación que falte.

Los Excel son salidas regenerables, no la fuente maestra. Cambiar datos en el
Excel no actualiza el JSON. No editar el código para cambiar importes trimestrales.
El libro LSI es entrada para Pre303, no un TXT 303 presentable. El 390 queda fuera
del alcance de esta primera implementación.

## Verificación

`python -m unittest discover -s tools/iva -v` desde la raíz (requiere pypdf).
Pruebas con datos ficticios: duplicados, cambio de originales, céntimos,
retenciones, exclusiones, cambio de trimestre/año, perfiles incompletos,
rectificativas no soportadas y extracción ambigua. El constructor contrasta las
fórmulas con el motor Decimal y cambia/restaura una entrada para comprobar recálculo.
Revisar las seis imágenes de pestañas y leer las cachés XLSX con un lector
independiente. Guardar evidencias y datos reales fuera de Git.

Plantilla oficial:
https://sede.agenciatributaria.gob.es/Sede/iva/pre-303/nuevo-servicio-pre303-importacion-libros-electronico/plantilla-libros-soporte-electronico.html

Simulador 2026:
https://www2.agenciatributaria.gob.es/wlpl/A303-FWME/E2026/OPEN/index.zul

## Metadatos de importacion

El exportador usa el proveedor documental; no reutiliza `legacy_tax_id` ni
`legacy_party`. Para identificaciones extranjeras requiere `lsi_identity` con
`type`, `country`, `id` y `source` explicitos. Un NIF nacional con prefijo ES
se normaliza sin cambiar el proveedor. Esto no verifica su deducibilidad.

Cada gasto requiere `receipt_date` y `receipt_date_source`. No se deduce la
recepcion de la fecha de emision, del pago, ni de un campo generico Fecha.
La prevalidacion falla antes de escribir salidas si falta informacion.
Los antiguos metadatos permanecen solo como evidencia del ensayo historico.
Pruebas del adaptador: `node --test tools/iva/test_lsi_fields.mjs`.

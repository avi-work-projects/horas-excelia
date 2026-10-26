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

## TXT experimental para OPEN

`python tools/iva/export_303_test.py privado.json --profile perfil-historico.json --identity identidad-privada.json --design DR303e26v101.xlsx --root AUTONOMO --output 303_ENSAYO.txt --open-rehearsal`

Genera el formato de posiciones fijas ISO-8859-1 con identificación, páginas
01/03/DID y resultados. Requiere la versión oficial 1.01 de 2026, comprobada por
SHA256. Usa `openpyxl` exclusivamente para leer ese diseño; no crea libros.
La identidad privada contiene `nif`, `name`, `developer_nif`, `foral_only:false`
y `monthly_refund:false`, acreditados para el ensayo. No guardar datos reales
en Git. El perfil y los originales se verifican con `prepare_open`.

Alcance cerrado: 2026, 1T–3T, régimen general exclusivo, 100 % Estado, resultado
positivo y sin ajustes. Tipo I (ingreso), sin cuenta bancaria ni domiciliación.
No presenta, no firma, no sustituye una autorización de pago. No soporta 4T,
compensaciones, devoluciones ni rectificativas. El TXT de ensayo contiene datos
fiscales reales: usar exclusivamente OPEN, nunca la pantalla CONT de presentación.
Generar correctamente el archivo no equivale a validarlo en Hacienda.

Ensayo real confirmado el 26/10/2026: TXT del 2T importado en OPEN 2026,
perfil cargado y validación 00001 «No existen errores». Casilla 71 coincide
con el motor documental. Aviso general 31190 conservado. Corregida la constante
de tipo de la casilla 169 (0,5 %), requerida incluso con base cero, y cubierta
con prueba de regresión. Evidencia y datos reales en AUTONOMO, fuera de Git.
También se comprobó la recarga de la sesión .ses y su validación independiente.
Esto no acredita presentación, domiciliación, otros trimestres ni revisión fiscal.

Diseño oficial:
https://www3.agenciatributaria.gob.es/static_files/Sede/Disenyo_registro/DR_300_399/archivos_26/DR303e26v101.xlsx

## Verificación

Revisión anual reproducible en un comando (datos y salidas siempre privados):
`python tools/iva/review_year.py privado.json --root AUTONOMO --output-dir salida --open-report Info_LR.csv --period 2T`.
Comprueba huellas, calcula los cuatro trimestres y genera un informe HTML y JSON.
El CSV opcional de OPEN se coteja fila a fila con el orden exacto del exportador
LSI: rechaza diferencias, duplicados, omisiones o exclusiones inesperadas.
Las exclusiones de periodos anteriores del acumulado se comprueban también.
No acredita la casilla 71 ni sustituye la validación global del formulario.
Las fechas de recepción pendientes se muestran sin inventarlas. La prevalidación
LSI sigue siendo quien comprueba además las identidades antes de exportar.
El acumulado anual no se etiqueta como 390 ni como cierre completo.

Para conservar la preparación histórica de OPEN:
`python tools/iva/prepare_open.py privado.json --profile perfil-historico.json --root AUTONOMO --output recuperacion.json`.
Verifica las huellas de documentos y justificante, el ejercicio, el perfil
soportado y la comparación con el resultado histórico antes de generar la guía.
La guía JSON no es una sesión `.ses` ni un archivo que se importe en Hacienda.
El perfil histórico no se aplica automáticamente a ejercicios o periodos nuevos.
La sesión nativa se guarda desde OPEN con «Guardar datos trabajo (.ses)» y debe
completarse en el navegador antes de archivarla; un `.crdownload` no cuenta como
sesión guardada. Para un XLSX usar «Importación de libros de registro», nunca el
botón inicial «Importar» que espera un fichero de declaración.

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

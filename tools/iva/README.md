# IVA en Kairo: documentos, libro y preparación de modelos

Herramientas privadas para incorporar documentos, mantener el libro anual,
preparar los modelos 303 y 390 y conservar sus justificantes. Incluyen módulos
offline, el panel autenticado de Kairo y el worker del mini. No emiten facturas,
acceden a certificados, firman, presentan declaraciones ni ordenan pagos. No
incorporar estos archivos a `app-assets.json` ni a los recursos públicos de la PWA.

## Flujo actual

1. **Documentos.** En Gastos se adjunta un PDF, se revisan todas sus páginas y
   los datos propuestos, se completa el tratamiento y se aprueba esa versión.
   Los ingresos compatibles se incorporan incrementalmente desde su carpeta
   documental; los ambiguos o pertenecientes a periodos presentados se señalan
   para revisión. No se modifica un registro histórico para hacerlo coincidir.
2. **Libro.** El worker `sync_models.py` recoge gastos aprobados y justificantes,
   actualiza ingresos, incorpora al archivo canónico con respaldo y bloqueo,
   recalcula el informe y prepara una instantánea coherente. Solo después de
   verificar su copia en Kairo activa el índice y acusa la incorporación.
   Los fallos conservan la copia anterior y se muestran como pendientes.
3. **Revisión trimestral.** Modelos permite consultar 1T, 2T, 3T y 4T, documentos,
   diferencias y cobertura. En periodos nuevos, el formulario solicita revisión
   de cobertura, tratamiento fiscal, perfil y ajustes; el 4T añade condiciones
   anuales. Tener facturas no acredita por sí solo que el trimestre esté completo.
4. **Preparación.** Preparar resumen → aprobar esa versión → generar → descargar
   TXT para validar. Libro, identidad, cuenta cuando corresponda, documentos,
   diseño y motor quedan vinculados mediante huellas. Cambiarlos invalida el uso
   de la aprobación. Un trimestre con referencia presentada no se vuelve a
   preparar como declaración ordinaria nueva.
5. **Resumen anual.** El dossier está disponible durante el año. El 390 importable
   se prepara mediante su formulario propio cuando existen cobertura completa,
   perfil acreditado y conciliación de los cuatro 303 con sus justificantes.
   El dossier conserva pendientes; no se etiqueta como fichero del modelo.
6. **Servicio oficial y archivo.** La validación y presentación se realizan en
   Hacienda. Kairo permite aportar justificantes de validación, presentación y,
   para el 303, pago. Guardar un PDF documenta lo aportado por el usuario; no es
   una consulta automática a Hacienda o al banco. El worker archiva las pruebas
   y añade referencias presentadas nuevas sin sobrescribir otras distintas.

Documentación de detalle:

- [Contrato del archivo AUTONOMO entre equipos](../../docs/AUTONOMO-ARCHIVE.md).
- [Gastos e ingresos: revisión, incorporación y recuperación](../../docs/IVA-EXPENSES.md).
- [Interfaz privada de Modelos y comprobación visual](../../docs/IVA-UI.md).
- [Exportador 390, perfil, diseño oficial e integración anual](../../docs/IVA-390.md).
- [Cierre histórico y ensayos del 26/10/2026](../../docs/IVA-CLOSING.md).
  Su estado inicial describe aquel ensayo; la preparación nueva es la indicada
  aquí y en los módulos `period_workflow` y `annual_workflow`.

## Fuente de datos y alcance

El JSON privado de AUTONOMO es la fuente maestra: `year`, `as_of`, `records`,
`documents`, `coverage`, `profiles`, `references`, `reference_source` y `activity`.
Los Excel, informes y copias de consulta son salidas regenerables. Editar un
Excel no actualiza el libro. No editar código para cambiar importes.

Cada registro conserva tipo, número, proveedor/cliente y NIF documental, fecha,
trimestre explícito, base, IVA, retención y total como cadenas decimales de dos
cifras, inclusión, tratamiento, tipo impositivo, ruta del PDF y SHA256. Las
exclusiones permanecen visibles sin sumarse. Los gastos de Amazon se incorporan
según la instrucción del usuario sin requerir contraste previo con Declarando;
eso no sustituye la revisión fiscal ni las exclusiones expresas.

El motor Decimal calcula 07, 09, 28, 29, 45 y 46 del 303 para operaciones nacionales
al 21 % soportadas. La 71 requiere confirmación explícita de ausencia de los
otros ajustes. Rectificativas, gastos con retención, operaciones extranjeras y
otros tratamientos necesitan adaptadores específicos. No se convierten en
operaciones ordinarias ni se deduce su tratamiento de una categoría genérica.
IVA, IRPF y amortizaciones pueden tener tratamientos distintos; este flujo no
calcula por sí solo toda la renta ni incorpora un motor universal de deducibilidad.

`expense_workflow.py` admite una factura por PDF, hasta 8 MiB y 60 páginas, sin
cifrado. Extrae propuestas con `pypdf`, no hace OCR; un escaneado puede completarse
manualmente. Aprobar exige revisión de todas las páginas y unicidad; para sumar
el gasto exige además revisión fiscal. No inventa recepción ni proveedor.
Los gastos aprobados se incorporan en `FACTURAS/año/GASTOS KAIRO/`, conservando
los originales históricos. Una modificación posterior requiere su circuito de
corrección, no sobrescribir el PDF original.

`income_refresh.py` usa el adaptador de `collect_income.py` para los diseños
inspeccionados: una página, una base, IVA 21 % y retención 15 %. Deriva cliente
solo si existe uno único acreditado; también acepta perfil privado explícito.
Rechaza versiones conflictivas y señala periodos ya presentados. No consulta
el correo ni admite automáticamente diseños nuevos. Incorporar ingresos o
gastos no adelanta `as_of` ni confirma la cobertura de un trimestre.

## Exportadores 303 y 390

`export_303_test.py` genera posiciones fijas ISO-8859-1 para 2026, 1T–4T, régimen
general exclusivo, 100 % Estado, resultado positivo y sin ajustes. Usa el diseño
oficial 1.01 con SHA256 comprobado; `openpyxl` se utiliza solo para leerlo.
La identidad privada contiene `nif`, `name`, `developer_nif`, `foral_only:false`
y `monthly_refund:false`. No reutilizar un perfil histórico como acreditación
automática de un trimestre nuevo.

La modalidad I es ingreso sin cuenta; U utiliza la cuenta privada de domiciliación
con IBAN español comprobado por formato y módulo 97. Eso no acredita titularidad,
aceptación bancaria ni plazo. El panel muestra la cuenta enmascarada y la variante
U necesita validación propia. El 4T requiere revisión anual explícita: obligación
de 390, sin opción/revocación de prorrata especial ni regularizaciones anuales,
de bienes de inversión o forales. Para ese supuesto el diseño usa campo 23=2 y
24=0. No soporta exonerados, compensaciones, devoluciones o rectificativas.

`export_390.py` usa el diseño oficial 2026 verificado por SHA256 y un lector
ZIP/XML de la biblioteca estándar. Alcance: persona física, una actividad,
régimen general nacional al 21 %, operaciones corrientes, 100 % Estado,
resultados trimestrales no negativos y sin ajustes, compensaciones, devoluciones
ni sustituciones. El formulario acredita nombre/apellidos separados, actividad,
código, IAE, obligación de declaración de terceros, cobertura y condiciones
fiscales explícitas. No marca confirmaciones por defecto.

Concilia los cuatro 303 y verifica sus documentos. Cada diferencia no nula exige
explicación, aunque se compense con otra; una diferencia total anual detiene la
exportación. Emite páginas 01000, 02000, 02B00, 03000, 04000 y 06000 con envoltura
AUX: 7.427 bytes ISO-8859-1. No hay datos de pago en el 390. Mientras falten datos
o confirmaciones, `prepare_390.py` sigue ofreciendo el dossier documental.

## Estado de validación oficial

- **2T histórico, 26/10/2026:** TXT de ingreso importado en OPEN 2026, perfil
  cargado y validación 00001 «No existen errores»; casilla 71 coincidente con el
  motor documental. Se conservó el aviso general 31190 y se comprobó la recarga
  de la sesión `.ses`. La constante de tipo de la casilla 169 quedó corregida y
  cubierta por regresión. No acredita presentación ni corrección fiscal.
- **Domiciliación del 2T, 26/10/2026:** OPEN leyó la variante U y respondió
  E010063 por plazo, con aviso sobre los datos de pago. No constituye validación
  completa de U ni aceptación de la domiciliación.
- **4T:** el 26/10 OPEN rechazaba incluso su selección manual. El 11/11/2026 se
  ha observado que permite seleccionar el periodo. Esa observación actualiza
  aquel bloqueo, pero no acredita importación ni validación oficial del fichero
  4T hoy. Sus comprobaciones locales no sustituyen la comprobación oficial.
- **390 de 2026:** exportador y flujo anual implementados con diseño oficial.
  No consta validación del TXT en el servicio oficial 2026. El libro real sigue
  necesitando cierre del año, el 4T completo y sus referencias/justificantes;
  los supuestos sintéticos no autorizan dar esos requisitos por satisfechos.

Los archivos conservan `filing_ready=false`. No volver a presentar un periodo
histórico para probarlos. Los ensayos con datos reales se usan exclusivamente
en OPEN, no en CONT. Evidencias y datos fiscales permanecen fuera de Git.

## Integración privada y sincronización

`vat_dashboard.response(consulta_root, request_path)` sirve Modelos, documentos
y descargas verificadas. `modelos_web` atiende Gastos; `period_workflow` prepara
303 y delega el anual a `annual_workflow`. Se montan tras los controles existentes
de propietario/Host; las escrituras usan POST, Origin y CSRF. También admiten
rutas sin `/facturas`, prefijo que elimina Tailscale Serve. No montarlos en la PWA.
`closing.py` aporta el almacén de aprobación; `closing_web.py` conserva el ensayo
histórico separado de la preparación nueva.

El índice de consulta `modelos-index.json` identifica libro, informe y descargas
mediante rutas relativas y SHA256. `sync_models.py` crea versiones coherentes,
transfiere lo necesario desde Drive, verifica originales e índice y solo entonces
activa la nueva copia. Un fallo de verificación no sustituye el índice activo.
Se conservan las descargas históricas con sus etiquetas y un estado de
sincronización visible. No hay una segunda fuente maestra editable en Kairo.

El worker usa configuración privada para archivo, respaldos externos, libro,
índice y conexión SSH a Kairo; se ejecuta con
`python tools/iva/sync_models.py --config configuracion-privada.json`.
Evita ejecuciones simultáneas y no usa sincronización con borrado. La programación
y el despliegue del worker se verifican por separado; tener el script no prueba
que exista una tarea activa. No modificar temporizadores de emisión/envío.

En el runtime privado de Kairo quedan `config.json`, cola de gastos, revisiones,
evidencias y bases de estado. La configuración identifica `archive_root`, `ledger`,
`identity`, `payment`, `year`, `design` del 303 y `design_390`; este último admite
como alternativa `runtime/dr390e2026.xlsx`. Nunca subir identidades, IBAN,
configuración de conexiones, PDFs, libros, bases de estado o índices reales a Git.
Respaldar los módulos del servicio y configuración antes del despliegue; la
reversión conserva originales y auditoría. Verificar HTTP 403 sin autorización.

## Uso local, LSI y recuperación histórica

```text
python tools/iva/ledger.py privado.json --root AUTONOMO --output calculado.json
node tools/iva/build_workbooks.mjs calculado.json salidas cabeceras-lsi.json 3T
python tools/iva/review_year.py privado.json --root AUTONOMO --output-dir salida --open-report Info_LR.csv --period 2T
python tools/iva/prepare_open.py privado.json --profile perfil-historico.json --root AUTONOMO --output recuperacion.json
python tools/iva/export_303_test.py privado.json --profile perfil-historico.json --identity identidad-privada.json --design DR303e26v101.xlsx --root AUTONOMO --output 303_ENSAYO.txt --open-rehearsal
```

El constructor requiere Node y `@oai/artifact-tool`. Las cabeceras LSI son las
dos filas originales de la plantilla oficial: `EXPEDIDAS_INGRESOS` (36 columnas)
y `RECIBIDAS_GASTOS` (42). `--annual-only` actualiza el libro sin producir LSI
cuando faltan campos de importación. LSI es entrada para Pre303, no un TXT de
declaración. El CSV opcional de OPEN se coteja fila a fila con el orden exacto
del exportador; esa conciliación no acredita la validación global del modelo.

Para LSI cada gasto necesita `receipt_date` y `receipt_date_source`. La fecha de
recepción no se deduce de emisión o pago. Las identidades extranjeras requieren
`lsi_identity` con `type`, `country`, `id` y `source` explícitos. Un prefijo ES
en NIF nacional se normaliza sin cambiar proveedor. `legacy_party`,
`legacy_tax_id` y `registration_date` se conservan solo para comparar el ensayo
histórico; nunca sustituyen al proveedor documental actual.

`prepare_open` genera una guía de recuperación, no una sesión importable.
Guardar la sesión nativa desde OPEN como `.ses` y comprobar que terminó la
descarga: un `.crdownload` no cuenta. Un XLSX se carga mediante «Importación de
libros de registro», no con el botón inicial «Importar» del fichero de declaración.
`rehearse_fourth.py` conserva el supuesto ficticio separado del libro real.

## Comprobaciones

```text
python -m unittest discover -s tools/iva -v
node --test tools/iva/test_lsi_fields.mjs
```

Dependencias Python: `pypdf` para documentos y `openpyxl==3.1.5` para el diseño
303. Definir `IVA303_DESIGN` e `IVA390_DESIGN` con los originales oficiales para
ejecutar las pruebas de integración correspondientes; informar cualquier prueba
omitida por falta de diseño. La batería utiliza documentos sintéticos y comprueba
duplicados, fuentes modificadas, centésimas, exclusiones, perfiles incompletos,
aprobaciones obsoletas, rutas, incorporación/reintentos y publicación verificada.
Las posiciones y los totales del 390 se contrastan independientemente contra el
diseño. No son validaciones de Hacienda.

Los cambios de pantalla requieren observación de la vista renderizada en los
tamaños, temas y estados afectados. Los cambios de libros requieren comparar
fórmulas con Decimal, revisar pestañas renderizadas y cachés con lector
independiente. Guardar evidencias reales fuera de Git.

Fuentes oficiales:

- [Diseño 303 de 2026, versión 1.01](https://www3.agenciatributaria.gob.es/static_files/Sede/Disenyo_registro/DR_300_399/archivos_26/DR303e26v101.xlsx).
- [Diseño 390 de 2026](https://www3.agenciatributaria.gob.es/static_files/Sede/Disenyo_registro/DR_300_399/archivos_26/dr390e2026.xlsx).
- [Plantilla de libros de soporte electrónico](https://sede.agenciatributaria.gob.es/Sede/iva/pre-303/nuevo-servicio-pre303-importacion-libros-electronico/plantilla-libros-soporte-electronico.html).
- [Simulador OPEN 2026 del 303](https://www2.agenciatributaria.gob.es/wlpl/A303-FWME/E2026/OPEN/index.zul).

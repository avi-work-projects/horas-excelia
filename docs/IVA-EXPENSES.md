# Incorporación de gastos en Modelos

El panel conserva una cola privada de PDF y propuestas revisables. La fuente
maestra continúa siendo `AUTONOMO/LIBROS CONTABLES/año/datos_libro_año.json` en
el espejo del mini. Aprobar un gasto lo prepara para incorporar; no convierte
la copia de consulta de Kairo en otro libro editable ni presenta modelos.

## Contrato de archivo y distribución

- En Kairo, `ExpenseStore(runtime)` crea `id/original.pdf` y `id/draft.json` en
  un directorio operativo privado fuera de AUTONOMO. El original mantiene sus
  bytes y su SHA256. Los borradores y auditorías nunca se añaden a Git.
- Se añade una única carpeta documental de destino para nuevas cargas:
  `FACTURAS/año/GASTOS KAIRO/id.pdf`. La aplicación genera la ruta; no mueve ni
  renombra los originales históricos ni modifica la carpeta Amazon. Una ruta
  alternativa explícita debe quedar bajo `FACTURAS/año/` y terminar en `.pdf`.
- La aprobación produce un paquete con registro, PDF y procedencia de revisión.
  Solo un worker local de confianza, obteniéndolo del Kairo autenticado, puede
  incorporar ese paquete al archivo canónico. El hash del paquete comprueba
  integridad, no constituye una firma ni autentica por sí solo al remitente.
- El importador añade `expense_imports` al libro como recibos de operación;
  mantiene sus campos previos y referencias históricas. No altera `as_of`:
  incorporar una factura no acredita cobertura del periodo hasta hoy.
- Se crean instantáneas completas e inmutables bajo
  `REVISIONES/año/versiones/SHA256/` con libro, informe JSON e informe HTML.
  `REVISIONES/año/modelos-index.json` se publica al final y apunta a esa versión.
  Las descargas históricas del índice se conservan con sus etiquetas anteriores.
- El importador guarda respaldos de libro e índice en el directorio privado
  pasado como `backup_root`, obligatoriamente fuera de AUTONOMO. No genera ni
  modifica el XLSX: sigue siendo una salida regenerable, no la fuente maestra.
- La propagación de Drive y la copia seleccionada de consulta Kairo son pasos
  posteriores. `remote_verified` permanece falso al terminar la incorporación
  local. Solo después de verificarlas, el worker registra `mark_applied` en la
  cola de Kairo. No montar ese método como acción del navegador.

## API del panel

`ExpenseStore` (también exportado como `Store`) proporciona:

```python
store.upload(filename, pdf_base64, actor)
store.list()
store.get(id)
store.pdf(id)
store.edit(id, expected_revision, fields, actor)
store.update(id, fields, expected_revision, actor)  # mismo comportamiento
store.approve(id, expected_revision, actor)
store.bundle(id)
store.mark_applied(id, bundle_sha256, ledger_sha256, actor='archive-worker')
```

Las rutas web deben mantener autorización de propietario; escrituras mediante
POST con Origin y CSRF del servicio existente. El límite del PDF es 8 MiB,
base64 estricto, entre 1 y 60 páginas, sin cifrado; el límite HTTP necesita
admitir la expansión base64. `pypdf` extrae texto de todas las páginas. No hace
OCR ni garantiza detección del proveedor; propone solo campos etiquetados que
aparecen una vez. El usuario puede completar un PDF escaneado manualmente.

Un borrador devuelve `id`, `revision`, `state`, `filename`, `sha256`, `pages`,
`text_excerpt`, `fields`, `warnings`, fechas y auditoría. Sus estados son
`draft`, `approved`, `incorporated`. Se comprueba revisión antes de guardar;
toda edición invalida las confirmaciones salvo las aportadas de nuevo en la
misma acción. Un gasto aprobado es inmutable para evitar carreras con el worker.
Una corrección de un gasto incorporado exige su circuito específico, no editar
el PDF ni el importe original silenciosamente.

Campos revisables: ejercicio entero, número, proveedor, NIF documental, fecha,
trimestre explícito, base, IVA, retención, total (decimales como cadenas con dos
cifras), inclusión booleana, mapping, tipo, motivo, fecha de recepción y su
procedencia. `archive_path` lo calcula la aplicación al completar el ejercicio.

Aprobar exige `reviewed_all_pages=true` y `single_invoice=true`: esta primera
entrada admite una factura por PDF. Si hay varias se conservan para revisión
fuera de este adaptador. Para sumarla al cálculo exige también
`fiscal_review_confirmed=true`; esa confirmación es del usuario y no equivale a
una comprobación independiente de deducibilidad. El motor admite tratamiento
doméstico al 21 % y sin retención de gastos; bloquea operaciones no soportadas.
Las exclusiones con motivo se conservan sin sumarse. No se inventan fechas de
recepción ni se heredan identidades de otros documentos.

## Incorporación en el mini

```python
apply_bundle(bundle, archive_root, ledger_relative, expected_ledger_sha256,
             index_relative=None, backup_root=private_backups)
```

La huella esperada debe obtenerse de la versión del libro que el worker acaba
de revisar. Una discrepancia bloquea la incorporación. El importador comprueba
todos los originales, duplicados de PDF y de identidad fiscal, coherencia de
importes, destino y aprobación antes de reemplazar el libro. Los documentos se
crean sin sobrescritura. Un bloqueo cooperativo serializa escritores; todos los
escritores del libro deben seguir el mismo protocolo para evitar carreras. Un
bloqueo persistente tras caída del proceso se inspecciona antes de retirarlo.

El índice se publica al final y usa archivos de una misma versión. Si el proceso
cae después de reemplazar el libro, repetir el mismo paquete recupera publicación
del índice sin duplicar el gasto. Un fallo previo puede dejar un PDF documental
o instantánea no referenciados, nunca una sustitución de otro original. El
recibo de operación y el SHA del paquete permiten distinguir reintento de otro
contenido. No marcar `incorporated` en Kairo hasta verificar distribución.

```text
python tools/iva/expense_workflow.py --bundle paquete.json --root AUTONOMO
  --ledger "LIBROS CONTABLES/2026/datos_libro_2026.json"
  --expected-sha256 HASH --backup-root CARPETA_PRIVADA
```

Reversión: con escritores detenidos, restaurar libro e índice de la misma
operación desde el respaldo; conservar originales nuevos y auditoría. Resolver
el acuse del worker coherentemente antes de volver a sincronizar. No utilizar
un sync con borrado ni eliminar documentos para resolver un conflicto.

Pruebas: `python -m unittest discover -s tools/iva -p test_expense_workflow.py`.
Se usan PDF sintéticos y carpetas temporales; cubren revisión, versiones,
duplicados, alteración, exclusiones, rutas, concurrencia, conservación de fechas
y referencias, fallo tras escritura canónica y reintento/acuse idempotentes.

## Actualización incremental de ingresos

`income_refresh.refresh(root, ledger_relative, backup_root, profile=None,
folder=None)` revisa nuevos PDF en `FACTURAS/año/A - FACTURAS INGRESOS` usando
el adaptador documental ya existente. Deriva el cliente solo si hay uno único
con NIF en los ingresos incorporados; admite perfil privado explícito.

Verifica primero todos los originales previos. Añade exclusivamente facturas
nuevas compatibles, conserva filas anteriores, usa el mismo bloqueo/CAS y
respaldo externo que gastos, mantiene `as_of`, y registra procedencia en
`income_imports`. Devuelve `added`, `warnings`, `changed`, `ledger_sha256` y
`remote_verified=false`; el worker regenera/publica después el índice completo.

Los PDF ambiguos, versiones con la misma identidad y contenido distinto,
periodos ya presentados, ejercicios diferentes y diseños no soportados quedan
señalados para revisión. No se elige arbitrariamente una versión ni se sustituyen
registros históricos. Los PDF duplicados exactos se identifican sin sumarse.
Los avisos deben mostrarse en el estado del worker aun cuando se incorporen
otras facturas independientes. El adaptador admite los diseños inspeccionados
de una página; documentos escaneados o diseños nuevos requieren otro adaptador
o revisión específica. No se hace OCR ni se consulta el correo desde este módulo.

---
name: recoger-factura-amazon
description: Recupera bajo petición una factura de Amazon de un pedido ya comprado y la incorpora como borrador documental a Gastos de Kairo. Usa el correo o el pedido, conserva el PDF y evita duplicados; no realiza compras ni comprobaciones periódicas.
---

# Recoger una factura de Amazon para Kairo

Se activa cuando Ángel pide recoger o importar una factura de Amazon. La frase
«Recoge la factura de mis tapones» identifica la compra pendiente configurada
localmente. Esta habilidad no crea tareas programadas ni vigilancia de correo,
Amazon o Descargas. Abrir Kairo no la ejecuta.

## Contexto privado y estado

En Windows, leer `%LOCALAPPDATA%/GestifyFacturacion/modelos/amazon-manual.json`.
Contiene `default_order`, `account_email`, `kairo_url` y `python`. El registro
`default_order` identifica el pedido, importe, producto y uso declarado; no es
una factura. Para otro pedido, usar su registro confirmado y la cuenta correcta.
Pasar `-OrderPath` en todas sus llamadas, incluida la consulta inicial y `-Resume`.
Si no existe configuración, localizar el archivo privado autorizado antes de
preguntar; no crear otra raíz AUTONOMO ni adivinar pedidos o cuentas.

El worker existente se configura en el mismo directorio, `config.json`. Sus
rutas y conexión SSH ya están autorizadas. Leer solo las claves necesarias,
sin volcar credenciales o configuración completa al chat.

Consultar primero el estado local, sin red ni cambios:

```powershell
& 'RUTA_DE_ESTA_HABILIDAD/scripts/recoger_factura.ps1'
```

El helper devuelve JSON: `pending_invoice` sin PDF importado, `prepared` para
reanudar, y `created`, `existing_in_queue` o `already_in_book` con recibo válido.
Si ya existe recibo confirmado, recuperar su enlace a
Gastos y consultar el estado actual. Saltar la descarga y la creación; si quedó
un borrador sin completar, continuar en «Completar la ficha», respetando los
campos ya revisados. No repetir una propuesta que ya esté guardada. Si el estado indica
transferencia preparada o fallida, usar `-Resume` en esta petición manual antes
de iniciar una nueva descarga. No modificar revisiones ya aprobadas.

## Recoger el documento una vez

1. Preferir las herramientas Gmail conectadas. Elegir la cuenta que coincide
   con `account_email`; buscar por la referencia exacta del pedido. Leer el
   mensaje relevante y obtener el PDF adjunto con la herramienta de adjuntos.
   Conservar el correo fuente y sus identificadores como procedencia. No
   presentar el correo de confirmación de compra como factura.
2. Si no hay adjunto utilizable, abrir el `source_url` del pedido con la
   herramienta de navegador disponible. Usar Amazon Business y verificar el
   número de pedido. En **Factura**, descargar la factura real. **Resumen del
   pedido imprimible** no sirve. Un enlace de correo puede abrir esa misma
   pantalla; no equivale por sí solo a haber obtenido el PDF.
3. Si Amazon todavía no ofrece la factura, informar «Factura aún no disponible»
   y terminar. No iniciar un bucle, una espera de días ni una automatización.
   Otra petición manual de Ángel será el siguiente intento. Si la herramienta
   no puede completar el inicio de sesión o el guardado, pedir únicamente esa
   intervención; completar por cuenta propia las descargas que sí permita.

No reutilizar cookies por fuera del navegador, automatizar páginas internas
de descargas bloqueadas ni crear una integración API de Amazon en este flujo.
Descargas es legible desde el sistema de archivos; que exista un `invoice.pdf`
antiguo no acredita una descarga nueva. Identificar el archivo recién obtenido
y contrastar su contenido con el pedido, no solo su nombre o fecha de archivo.

## Revisar el PDF e importar

Usar la capacidad PDF disponible para leer todas las páginas. Identificar
factura/abono, emisor real, número y fecha, destinatario, concepto, importes y
referencia del pedido. El emisor se obtiene del PDF: no sustituir un vendedor
por Amazon ni usar el IVA estimado del checkout. No completar datos ausentes
con suposiciones. Conservar el original sin editar sus bytes.

El helper admite un PDF de factura por pedido. Abonos, varias facturas o un
PDF distinto del ya vinculado requieren revisión documental separada; no
forzarlos dentro de este flujo ni borrar el recibo para saltar el control.
El parámetro `source-kind=invoice` es una clasificación explícita de quien leyó
el documento, no una comprobación fiscal automática del programa.

Después de verificar que es la factura correspondiente:

```powershell
& 'RUTA_DE_ESTA_HABILIDAD/scripts/recoger_factura.ps1' -Pdf 'RUTA_PDF_REAL'
# Solo para reanudar un lote preparado tras un fallo de conexión:
& 'RUTA_DE_ESTA_HABILIDAD/scripts/recoger_factura.ps1' -Resume
```

`-OrderPath 'REGISTRO_PRIVADO.json'` permite elegir otro pedido confirmado.
El script ejecuta `amazon_order.py`, conserva originales y manifiesto bajo
`AUTONOMO/ENTRADA/AMAZON`, y usa `amazon_transfer` con el SSH existente. Los
recibos operativos quedan en `modelos/amazon-order-receipts`, fuera del libro.
Comprobar código de salida **y** `status`, `sha256`, `manifest`, `draft_id`.
No anunciar éxito si el recibo contiene error. Una conexión cortada puede
haber guardado el PDF remotamente: reanudar el mismo lote evita duplicarlo.

## Completar la ficha de Gastos

La importación crea un borrador con el original, no un gasto aprobado. Con
`draft_id`, su vista es `kairo_url + /facturas/modelos/gastos?id=ID`.
La referencia de pedido se conserva en manifiesto/recibo; comprobar también
que aparezca en la ficha y añadirla como dato documental si falta.

Completar los campos documentales desde el PDF, utilizando el formulario de
Kairo o el contrato existente `ExpenseStore.extraction_request()` / `propose()`
del código privado instalado (ejemplo de transporte en `modelos/code/README.md`,
apartado «Recogida manual de la factura de un pedido»). En este último caso cada valor necesita cita
y página, SHA del documento y revisión actual del borrador; leer el contrato
vigente antes de generar la propuesta. No alterar directamente `draft.json`.
Guardar como propuesta sin sobrescribir una revisión manual posterior.

Preservar `include=false`, destino fiscal «Por decidir», IRPF pendiente y las
confirmaciones de aprobación sin marcar. El uso exclusivo declarado puede
describirse como contexto, pero no prueba por sí solo la deducibilidad. Si ya
estaba incorporada, señalarlo y no editar el asiento. La incorporación fiscal
al libro sigue siendo la acción manual **Aprobar** de Kairo y su worker por
eventos; esta recogida no la dispara.

Al terminar, indicar uno de estos resultados con enlace al documento/ficha:
factura pendiente, intervención necesaria, borrador preparado, ya existente,
o error recuperable. Distinguir **guardado en Gastos para revisar** de
**incorporado al libro**. No enviar mensajes a vendedores ni comprar nada.
`approved` significa aprobado y pendiente de incorporación; solo `incorporated`
acredita que Kairo ha registrado la incorporación al libro.

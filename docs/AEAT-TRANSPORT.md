# Transporte de modelos a la AEAT

`tools/iva/aeat_client.py` conecta los ficheros ya preparados con servicios
oficiales. No calcula impuestos, concede aprobaciones, crea temporizadores ni
exporta certificados. El módulo de operaciones que lo invoque debe conservar
la revisión, la conformidad y el estado durable antes del envío.

## Contrato oficial comprobado

Fuente: [Servicios Comunes de Declaraciones AEAT](https://www.agenciatributaria.es/static_files/AEAT_Desarrolladores/EEDD/General/EspecificacionesServiciosDeclaracionesAEAT_ES.pdf),
enlazado como v3.1 en el [portal de desarrolladores](https://www.agenciatributaria.es/AEAT.desarrolladores/Desarrolladores/_menu_/Documentacion/General/General.html).
Descargado el 17/11/2026; el PDF conserva la cabecera interna «Versión 30».
SHA256: `cdbd1cad6d6db079d264490d5a0d6484818225db95a1d3ba563b253affce605e`.

Los modelos 303 y 390 están incluidos. Presentación: POST JSON a
`https://www1.agenciatributaria.gob.es/wlpl/PFTW-PICW/PresBasicaDos`, con
autenticación mediante certificado y conformidad sobre los datos. La variante
de pruebas usa `prewww1.aeat.es`. Validación: JSON a
`https://prewww2.aeat.es/wlpl/PFTW-PICW/ServValiDos`, sin presentar.
Consulta: formulario URL-encoded a
`https://www1.agenciatributaria.gob.es/wlpl/SCEJ-MANT/ConsultaExt`; respuesta XML
según [consultas.xsd](https://www.agenciatributaria.es/static_files/AEAT_Desarrolladores/EEDD/General/consultas.xsd).

El PDF contiene una inconsistencia: la tabla de ServValiDos indica `FIC`, pero
el ejemplo JSON y la nota inmediata indican `F01`. El cliente usa **F01**,
comprobado mediante una petición ficticia. Nunca utiliza `SINVL`, que omitiría
la validación. El recibo de presentación es el PDF, no solo el JSON de respuesta.

## Interfaz del módulo

```python
client = AeatClient(environment='test', certfile=private_certificate,
                    keyfile=private_key, key_password=private_password)
identity = client.identity()
validation = client.validate(snapshot, payload_bytes)
result = client.submit(snapshot, payload_bytes, operation_id)
query = client.recover(snapshot, operation_id)
receipt = client.receipt(known_receipt_url)
```

`snapshot` contiene `model` (`303`/`390`), `year`, `period`, `nif` y
`payload_sha256`. Para 390 se acepta `anual` y se transmite `0A`. El envío añade
`presenter_nif`, `presenter_name`, `mode` y, únicamente para 303 modalidad `I`,
`nrc` de 22 caracteres. `U` utiliza el IBAN que ya contiene el TXT revisado.
La consulta admite `name` del declarante y filtros `date_from`/`date_to` ISO.

El hash y la envoltura del TXT deben coincidir con la instantánea. No se
eliminan controles ni se transforma silenciosamente el fichero aprobado.
`validate` devuelve `valid`, `errors`, `warnings`, `pdf` cuando procede y
`raw_response`. Un PDF de validación no es un recibo de presentación.

`submit` devuelve `outcome`: `accepted`, `rejected` o `uncertain`. La aceptación
exige identidad, periodo, ejercicio, presentador, CSV y justificante coherentes.
Incluye `receipt_pdf` si se pudo descargar; en caso contrario conserva la
aceptación con `receipt_error` y `receipt_url`, para recuperar el PDF sin reenviar.
`raw_response` conserva el JSON de presentación. Estos datos son privados.

`recover` devuelve candidatos con `outcome='uncertain'`. La consulta oficial
no identifica la huella del fichero ni el importe: una coincidencia de NIF,
modelo y periodo no demuestra que sea el intento pendiente. Cero resultados
tampoco es autorización para reenviar. `operation_id` es solo local y nunca se
envía como supuesto identificador de idempotencia de la AEAT.

## Certificado del almacén de Windows

El transporte puede inyectarse sin exportar la clave:

```python
client = AeatClient(environment='production',
                    external_certificate={'sha256': certificate_sha256},
                    transport=windows_transport)
```

Firma del adaptador:

```python
transport(method, url, body, headers, *, timeout, max_bytes,
          client_certificate) -> (status, response_headers, raw_bytes)
```

El adaptador debe utilizar exactamente el certificado cuya identidad anuncia,
verificar TLS, respetar el tiempo y tamaño máximos, y no seguir redirecciones.
`client_certificate` es falso para validación y verdadero para presentación,
consulta y recuperación del recibo. `identity()` devuelve entorno, huella y
`configured`; el controlador liga esa identidad a la aprobación.

El camino PEM utiliza TLS del sistema y admite un `ca_file` explícito para una
cadena de confianza adicional. Nunca se desactiva la verificación del servidor.

## Límites de transporte y comprobaciones

Los destinos de operación son fijos. Los recibos solo se descargan por HTTPS
desde los dos hosts oficiales del entorno correspondiente, bajo `/wlpl/`.
Se rechazan usuario/contraseña en URL, puertos alternativos, rutas ambiguas,
redirecciones y contenido comprimido. Respuestas: máximo 12 MiB; PDF: 8 MiB;
TXT: 1 MiB. El tiempo configurado está acotado entre 1 y 120 segundos;
el mini permite ese margen para atender el permiso protegido de Windows.

JSON: claves duplicadas, identidades contradictorias y formatos desconocidos
se rechazan. XML: no DTD, entidades, estructuras arbitrarias ni resultados de
otra declaración. No se interpreta un HTTP 200 por sí solo como aceptación.
Los errores de transporte o interpretación tras el envío son inciertos y no
se reintentan automáticamente.

Pruebas locales: `python -m unittest test_aeat_client -v` con `PYTHONPATH=tools/iva`.
Usan identidades y documentos ficticios y transporte inyectado, sin red.

Comprobación del contrato, 17/11/2026: una única llamada a ServValiDos con
TXT 303 del 4T de 2026 generado por el exportador (3.767 bytes), NIF ficticio
`00000000T`, sin IBAN y sin certificado. El servicio leyó `F01` y devolvió
`ENIFAUX` y `E010070` por los NIF ficticios; no devolvió error de campo,
formato o periodo. No se llamó a PresBasicaDos ni se presentó ninguna declaración.
Esto comprueba transporte y lectura, no la validación fiscal de un modelo real.

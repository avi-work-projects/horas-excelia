# Despliegue privado de Modelos

Este documento describe el despliegue; no certifica que se haya ejecutado. Los
módulos de `tools/iva` son código publicable. `service.py`, los datos fiscales,
`vat-workflow`, las configuraciones, los respaldos y las claves permanecen fuera
de Git. Kairo conserva una copia de consulta: el archivo AUTONOMO del mini sigue
siendo la autoridad. Véase también [IVA-EXPENSES.md](IVA-EXPENSES.md).

## Preparación y respaldo

1. Detener temporalmente el worker de sincronización y comprobar que no haya una
   ejecución activa. No cambiar el temporizador de emisión de facturas.
2. Anotar la revisión de código que se instala y las huellas SHA256 del servicio
   y de los módulos actuales. Guardar una copia privada coherente de esos módulos,
   `service.py`, la configuración de `vat-workflow` y el índice de consulta. Los
   respaldos canónicos del mini deben estar fuera de AUTONOMO.
3. Instalar versiones de la misma revisión de `modelos_ui`, `modelos_web`,
   `vat_dashboard`, `expense_workflow`, `income_refresh`, `period_workflow`,
   `annual_workflow`, `sync_models` y sus módulos de `tools/iva` importados. No
   sobrescribir la configuración privada con ejemplos del repositorio. Comprobar
   las importaciones en el intérprete real del servicio, con `pypdf` y `openpyxl`.
4. Conservar los diseños oficiales requeridos por los exportadores en las rutas
   configuradas; comprobar sus huellas con el exportador correspondiente. Un
   diseño desconocido debe impedir la exportación, no sustituirse silenciosamente.

## Integración de rutas

`install_web_routes.py` contiene exclusivamente el parche. No contiene una copia
del servicio ni sus valores privados. El modo predeterminado es de solo lectura:

```sh
python install_web_routes.py --service /ruta/privada/service.py \
  --expected-sha256 HUELLA_REVISADA --backup-dir /ruta/privada/respaldos
```

El JSON de salida indica las huellas anterior y propuesta. Aplicar con los mismos
argumentos y `--apply`. Si el archivo ha cambiado, falta un ancla o existe una
integración parcial, el instalador cancela la operación. Antes de reemplazarlo
guarda `service-before-modelos-<sha256>.py`; una segunda ejecución con la huella
actual no cambia el archivo. El reemplazo es atómico y conserva sus permisos y
propietario. Suspender otros despliegues durante esta operación.

El parche añade los GET de `modelos_web` y `period_workflow` antes de `closing_web`.
Los POST permanecen bajo `MUTEX` y `process_lock`; conserva las guardas existentes
de propietario, Origin y CSRF. El límite HTTP ampliado solo afecta a las rutas de
gastos y preparación; cada flujo valida además el PDF y su tamaño.

Compilar el servicio y los módulos instalados antes de reiniciar únicamente el
servicio de facturación. Comprobar acceso del propietario, rechazo anónimo y los
estados relevantes de Modelos en escritorio y móvil, con los temas afectados.
No usar facturas ni justificantes reales como fixtures para una prueba de alta.

## Worker en el mini

Crear un JSON privado de configuración para `sync_models.py`. Los valores de este
ejemplo son marcadores y deben reemplazarse por las rutas y conexiones existentes:

```json
{
  "archive_root": "RUTA_ABSOLUTA_AUTONOMO",
  "ledger": "LIBROS CONTABLES/2026/datos_libro_2026.json",
  "index": "REVISIONES/2026/modelos-index.json",
  "backup_root": "RUTA_PRIVADA_FUERA_DE_AUTONOMO",
  "ssh": "ssh",
  "ssh_key": "RUTA_CLAVE_SSH_EXISTENTE",
  "host": "USUARIO@HOST_KAIRO_EXISTENTE",
  "remote_python": "/ruta/venv/bin/python",
  "remote_script": "/ruta/sync_models.py",
  "remote_runtime": "/ruta/vat-workflow"
}
```

En Kairo, ampliar el `config.json` privado existente con `consultation_root`
(directorio estable de consulta), `drive_config` (configuración rclone ya
autorizada) y `drive_remote` (prefijo de AUTONOMO terminado en `/`). Mantener las
claves de año, libro, identidad, pago, perfiles y diseños que utilizan los flujos.
`archive_root` se actualiza al directorio de la versión publicada; no debe
apuntarse al archivo canónico del mini.

El mini necesita su sincronizador de documentos operativo; Kairo usa rclone para
leer Drive. Conservar las comprobaciones SSH de identidad del servidor. Ninguna
clave, contraseña ni configuración de Drive debe incluirse en código o logs.

```sh
python tools/iva/sync_models.py --config RUTA_CONFIG_PRIVADA.json
```

Ejecutar primero manualmente y comprobar su resultado. El worker incorpora los
ingresos nuevos de los formatos reconocidos y las altas aprobadas, archiva las
evidencias, regenera la revisión y publica una versión completa por huellas.
Solo confirma la incorporación en Kairo después de verificar esa copia. Si Drive
no ha propagado un archivo, queda pendiente y el siguiente intento reutiliza la
incorporación sin duplicarla. Las anomalías de ingresos se conservan en `warnings`;
un estado de distribución verificado no las convierte en revisiones fiscales
resueltas ni actualiza la fecha de cobertura del libro.

Cuando esa ejecución esté verificada, registrar el mismo comando en el
planificador existente del mini, con directorio de trabajo e intérprete explícitos,
sin solapar ejecuciones y con logs privados. El archivo de bloqueo del worker
también protege invocaciones manuales; ante un bloqueo huérfano, comprobar que no
haya un proceso activo antes de retirarlo. No habilitar dos workers canónicos en
mini y portátil a la vez. La instalación del código por sí sola no activa esta
programación ni demuestra que Drive esté al día.

## Reversión

Detener el worker y el servicio antes de restaurar una versión. Restaurar el
servicio desde su respaldo y los módulos de la misma revisión; restaurar juntos
la configuración y el índice de consulta correspondientes. Conservar las colas
de gastos, la base de evidencias, originales y auditoría. Reiniciar y comprobar
que la versión anterior sirve la copia de consulta esperada.

Revertir código no revierte incorporaciones canónicas ya confirmadas. No restaurar
un libro antiguo sobre altas nuevas: revisar recibos de operaciones y respaldos
con todos los escritores detenidos, y preservar cada original y operación. Las
versiones de consulta permiten volver a mostrar un conjunto coherente sin borrar
el historial del archivo canónico.

La generación de un fichero o paquete no equivale a presentación ni pago en AEAT.
La validación, presentación y justificantes deben mantener sus estados separados;
no se fabrican confirmaciones para dar por terminado un despliegue.

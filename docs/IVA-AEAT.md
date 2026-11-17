# Presentación de modelos desde el mini

El conector local añade a la preparación existente del 303/390 un recorrido
manual de validación, confirmación, presentación y archivo. Se abre en
`/facturas/modelos/aeat`. No sustituye el motor fiscal, no emite facturas de
VeriFactu y no inicia comprobaciones periódicas.

## Recorrido de uso

1. **Preparar modelo.** Completar la revisión del periodo, aprobar esa versión y
   generar el TXT en el flujo de preparación existente. El archivo del mini y la
   copia empleada por Kairo deben tener la misma huella de libro. Un periodo con
   referencia presentada queda bloqueado para una nueva declaración ordinaria.
2. **Validar modelo.** Enviar esa versión al servicio oficial de validación. Se
   muestran errores y avisos; esta acción no presenta la declaración. Para un
   303 de modalidad ingreso se solicita el NRC del pago ya realizado; Kairo no
   obtiene ese NRC ni realiza el pago. La domiciliación no utiliza NRC.
3. **Firmar y presentar en Hacienda.** Revisar declarante, periodo, resultado,
   modalidad y avisos, y marcar la confirmación de presentación. Solo se habilita
   con validación vigente, preparación sin cambios, periodo terminado y presentación
   real habilitada en la configuración privada. El envío usa el certificado de
   Windows del mini; no necesita exportar la clave ni abrir un selector del navegador.
   Windows puede mostrar su ventana protegida para autorizar el uso de la clave.
   Ese permiso se concede allí, sin desactivar su protección ni compartir la contraseña.
4. **Conservar el resultado.** Una aceptación y un PDF verificable con su CSV
   permiten marcar `filed`. Se conserva el justificante y se archivan el modelo,
   la respuesta y la evidencia en `AUTONOMO`; se solicita una actualización manual
   del libro y sus salidas. Presentación y pago son estados independientes.

Si el intento queda incierto, **Consultar resultado / recuperar justificante**
consulta el intento existente, sin reenviarlo. Una coincidencia de periodo y
titular encontrada en la consulta no demuestra que sea el mismo fichero: la
interfaz conserva esa limitación y exige cotejar la evidencia. Si el envío fue
aceptado pero falló el archivo, **Completar archivo en el libro** repite el archivo,
no la presentación. El justificante ya recibido permanece conservado.

**Comprobar conexión con Hacienda** realiza una consulta autenticada del periodo
seleccionado. No valida, presenta ni paga. Abrir esta pantalla no ejecuta esa
consulta: muestra la configuración y la última comprobación guardada.

Si Windows pide permiso para usar el certificado, la petición permanece esperando
durante el plazo de la acción. Si ese plazo vence, autorizar después no recupera
la petición caducada: hay que comprobar el estado y solicitar la consulta de nuevo
manualmente. No se extrae la clave ni se desactiva su protección para evitar la
ventana. Si lo que quedó incierto fue una presentación, se consulta su resultado;
no se vuelve a enviar.

## Componentes y configuración

| Componente | Responsabilidad |
|---|---|
| `aeat_client.py` | Contrato y análisis estricto de validación, presentación, consulta y PDF; destinos oficiales delimitados |
| `aeat_windows.py` y `.ps1` | HTTPS mediante .NET y certificado de `CurrentUser/My`; sin exportar la clave, seguir redirecciones ni reintentar |
| `aeat_submission.py` | Estado duradero, consentimiento de versión exacta, reserva del periodo, recuperación y evidencia |
| `aeat_workflow.py` | Comparación de fuentes, selección del modelo generado, restricciones de periodo y archivo canónico |
| `aeat_web.py` | Pantalla local y acciones manuales dentro de la sesión/CSRF del mini |

La configuración privada reside en `desktop-state/aeat-settings.json`, fuera
de Git. Define `environment`, `certificate_thumbprint`, los metadatos públicos
de `certificate`, `taxpayer_nif` y `allow_live_submission`. El cliente vuelve a
leer los metadatos del certificado y compara su SHA-256 con el configurado antes
de una operación. El ayudante comprueba vigencia y disponibilidad de clave privada.
Un cambio de certificado exige revisar la configuración.

La clave permanece en el almacén de Windows. No se copia el certificado de
VeriFactu ni se arranca una segunda instalación emisora de facturas. El mini
ejecuta la conexión AEAT; la preparación sigue reutilizando los módulos de Kairo
mediante la conexión privada. Se necesitan ambos equipos disponibles para ese
recorrido y conexión a Internet para las operaciones oficiales. La paridad móvil
del conector local no está desplegada por añadir estos módulos.

Estado de operaciones en `desktop-state/aeat/submissions.sqlite3`; documentos y
respuestas en una carpeta privada por operación. La salida canónica se archiva en:

```text
AUTONOMO/REVISIONES/<año>/PRESENTACIONES/<modelo>/<periodo>/<operación>/
  justificante.pdf
  modelo.txt
  presentacion.json
  respuesta-aeat.json
```

La validación caduca a las 24 horas. Cambiar el fichero, revisión o identidad
invalida su uso; para ingreso, el NRC queda ligado a la revisión. El modo de pruebas
no produce un estado fiscal `filed` ni incorpora una presentación real al libro.
No se reenvía automáticamente un resultado incierto. Las consultas y recuperación
se ejecutan únicamente cuando el usuario las solicita.

## Alcance y evidencia de esta entrega

Implementado para los modelos y perfiles que admiten los exportadores existentes.
El conector no amplía por sí mismo el alcance fiscal a otros regímenes, rectificaciones,
compensaciones, ejercicios o modalidades. Tampoco convierte el fin del trimestre
en prueba de cobertura documental completa.

Al redactar esta entrega, el libro real sigue con datos hasta el 25/10/2026 y el
4T solo contiene octubre. Faltan noviembre/diciembre, el cierre de ese trimestre
y su referencia presentada para completar el 390. No se debe presentar ese conjunto
incompleto ni reutilizar un trimestre histórico para ensayar un envío real.

Se ha comprobado la lectura de metadatos del certificado de Windows y el transporte
con respuestas controladas. Hay validación oficial con datos sintéticos y también
del fichero histórico `303_2026_2T_GENERADO_ENSAYO.txt`: el servicio devolvió validación
correcta, sin errores, con aviso 31190 de revisar la información adicional cuando
corresponda. Se utilizó exclusivamente la operación de validación, no presentación.
La respuesta histórica queda en `desktop-state/aeat-validation-historical-response.json`,
fuera de Git.

**No se ha probado una presentación real con este conector.** La consulta autenticada
real ha llegado a la ventana protegida de Windows para autorizar el uso de la clave;
falta completar esa autorización dentro del plazo y comprobar la respuesta oficial.
La recuperación de un justificante real también sigue pendiente. La validación
técnica, incluso con el fichero histórico, no acredita una nueva presentación ni
resuelve por sí sola las diferencias documentales del libro.

Las pruebas usan respuestas y documentos sintéticos para los estados, pérdidas de
respuesta, duplicados, cambios de revisión y límites del transporte. Ningún test
debe realizar firmas, presentaciones o pagos reales como parte de su ejecución.

Especificación oficial: [servicios de declaraciones de AEAT](https://www.agenciatributaria.es/static_files/AEAT_Desarrolladores/EEDD/General/EspecificacionesServiciosDeclaracionesAEAT_ES.pdf).
Se distinguen `ServValiDos` (validación), `PresBasicaDos` (presentación) y
`ConsultaExt` (consulta). El ámbito de cada modelo y ejercicio se conserva separado
de las pruebas de conexión y del estado del certificado.

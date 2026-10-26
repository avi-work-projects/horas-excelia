# Cierre guiado del IVA: alcance y despliegue

Implementación privada de ensayo, 26/10/2026. No pertenece a los assets de la
PWA. Conserva el motor y sus límites: 2026, régimen general soportado, resultado
positivo y sin ajustes. El adaptador admite 4T con revisión anual explícita:
obligación de 390, sin opción/revocación de prorrata especial ni ajustes anuales.
DP30301 notas3/4: campo23=2, campo24=0 para este supuesto. No admite exonerados.
La configuración operativa solo habilita el perfil acreditado del 2T.
Los otros periodos explican qué falta. No hay integración de presentación.

Para periodos nuevos `preparation_kind=new_period` exige `period_complete=true`,
perfil acreditado por documento, ausencia de referencia ya presentada y los
ajustes restantes confirmados en el libro. No se infiere cierre por tener alguna
factura. `rehearse_fourth.py` construye un supuesto separado de189 euros; nunca
modifica el libro anual real. Las confirmaciones de su perfil son hipótesis de
prueba y no deben copiarse al perfil real.

## Estados y garantías

Preparar → aprobar resumen → generar → descargar. Cancelar retira la aprobación
y bloquea la descarga; no retira archivos que el usuario ya haya descargado.
Se comprueban documentos originales, perfil, libro, identidad, diseño oficial,
cuenta y versión del motor. La aprobación referencia esa versión exacta.
Cambiar datos invalida su uso y preparar la nueva versión pide otra aprobación.
Repetir la misma preparación conserva el estado; no duplica ni presenta nada.
GET no aprueba ni genera. POST usa la autorización de propietario, Origin y
X-CSRF del servicio existente. SQLite transaccional y bloqueo del servicio;
registro de acción, actor y versión, sin incluir secretos en mensajes.

El archivo se genera en memoria y permanece como salida de ensayo en el estado
privado. La descarga comprueba nuevamente fuentes y versión. Aprobar el ensayo
no autoriza domiciliar, presentar ni volver a presentar el 2T histórico.

## Contrato de archivo antes de desplegar

AUTONOMO sigue siendo la autoridad de libros y originales. Ampliar su copia de
consulta en Kairo con los PDF que referencia el libro, sin mover ni renombrar
ninguno. Copiar desde Drive y comprobar SHA256 de cada documento. No es una
sincronización bidireccional ni incorpora nuevos temporizadores.

Configuración y estado de trabajo en Kairo: gestify-facturacion/vat-workflow/
config.json y closing.sqlite. No se mezclan con la base fiscal de facturas ni
se suben a Git. El diseño oficial se guarda allí; openpyxl se añade al venv
existente para leerlo, fijando versión. El código está en tools/iva.

Integración de service.py: delegar GET y POST /modelos/cierre después de los
controles existentes. Añadir enlace desde Modelos. Respaldar service.py y
vat_dashboard.py antes de desplegar; verificar huella del servicio para evitar
pisar cambios simultáneos. Reiniciar solo servicio web, no runner.timer.
Reversión: restaurar esos dos módulos; conservar base de cierre para auditoría.
La configuración no se distribuye a la PWA ni publica identidad/IBAN.

Pruebas: datos ficticios para aprobación/cancelación/cambio/duplicados/año,
rechazo sin CSRF/Origin/propietario, generación con motor real en directorio
aislado; en panel operativo preparar únicamente, dejar aprobación al usuario.
Pendientes: validación OPEN de variante U, perfiles nuevos y cierre 4T,
generación del 390, archivo final aprobado y justificante tras presentación.

## Resultado del ensayo del 26/10/2026

OPEN leyó la variante U del 2T y devolvió E010063 (plazo de domiciliación),
junto con aviso de que borraría los datos de pago incompatibles con el entorno.
Esto no acredita aceptación bancaria ni validación completa de U. No cambiar
fecha/ejercicio para aparentar que ese ensayo está dentro de plazo.

Primer intento de importar el 4T ficticio: FRECH, E010100 (periodo), MALINI4
(cabecera). La cabecera local coincide en posiciones/longitud con DP30300.
Diagnóstico posterior: el selector ofrece4T, pero al seleccionarlo manualmente,
sin importar fichero, OPEN responde «El periodo seleccionado no está permitido».
La validación oficial queda bloqueada por el periodo en el servicio actual;
el ensayo debe repetirse cuando sea admitido, sin asumir que no aparecerán otros
errores después. No cambiar el ejercicio para simular una validación2026.
No hace falta que el usuario cargue manualmente el archivo ahora. No habilitar
el perfil real. Evidencias en REVISIONES/2026-4T/ENSAYO_SINTETICO.

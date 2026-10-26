# Cierre guiado del IVA: alcance y despliegue

Implementación privada de ensayo, 26/10/2026. No pertenece a los assets de la
PWA. Conserva el motor validado y sus límites: 2026, 1T–3T, régimen general
soportado. La configuración inicial solo habilita el perfil acreditado del 2T.
Los otros periodos explican qué falta. No es todavía el cierre de un trimestre
nuevo ni el exportador de 4T. No hay integración de presentación con Hacienda.

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

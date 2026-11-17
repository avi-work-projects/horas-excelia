# Contabilidad en el mini

Aplicación local para Windows, iniciada desde **Kairo Contabilidad** en el
escritorio. La interfaz se sirve en `127.0.0.1:18766`, con sesión local privada.
No hay publicación web, acceso por LAN, tarea programada ni recogida periódica.
El proceso queda esperando peticiones HTTP; no consulta fuentes en reposo.

## Uso

- **Facturas:** catálogo, histórico, PDF y revisión mensual de los servicios
  existentes. Permite aprobar/cancelar la programación de una factura preparada.
  No añade una emisión inmediata: respeta las horas y condiciones del motor actual.
- **Programación:** calendario compartido de correos y facturas, navegación mensual
  y consulta explícita de Outlook mediante «Actualizar». Al abrir se leen los
  estados guardados. Los correos se siguen preparando y programando desde Gestify;
  Kairo ofrece su consulta, sin otro editor de programación.
- **Resumen, Ingresos y Gastos:** consulta del libro existente, filtro por
  trimestre y búsqueda; acceso a los originales verificados.
- **Libros:** descarga del Excel de la misma versión y archivos históricos.
- **Modelos:** consulta y preparación de 303/390, validación oficial y presentación
  manual desde el mini con el certificado de Windows. Requiere una versión aprobada,
  periodo completo y confirmación final; genera y conserva su evidencia. Véase
  [el recorrido AEAT y sus comprobaciones pendientes](IVA-AEAT.md).
- **Renta:** documentos separados del IVA; no calcula la declaración de IRPF.
- **Recoger facturas:** una consulta al correo Business para el pedido confirmado
  configurado. Conserva los adjuntos en el mini y los envía como borradores a
  la bandeja existente. Si solo hay un enlace o aún no hay PDF, lo indica.
- **Añadir PDF:** carga manual de cualquier proveedor. Conserva el PDF local
  antes de transmitirlo; detecta documentos del libro y de la bandeja.
- **Actualizar datos:** solicita una ejecución al trabajador de Modelos ya
  instalado. **Ver estado** consulta su resultado una sola vez; recargar la vista
  lee la versión disponible, sin lanzar otra actualización.
- **Cómo funciona** (`/ayuda`): guía integrada con el recorrido de un gasto,
  significado de cada botón y estado, conexiones necesarias y alcance pendiente.
  Se puede consultar al volver a abrir el acceso directo, sin depender del chat.

La recogida no aprueba la clasificación fiscal, los importes ni la identidad del
proveedor. El correo no se marca como leído. No abre Chromium, no usa una API de
comprador de Amazon ni requiere que Codex esté abierto.

La vista local de Modelos muestra una tarjeta breve por periodo: estado, importe
cuando está disponible y acción principal. La cobertura, los avisos y los pasos
pendientes siguen accesibles en un desplegable. Este modo compacto no cambia
los cálculos ni la presentación de la interfaz remota.

El tema, los estilos y los iconos se incluyen en el HTML inicial para evitar
destellos al navegar. El logotipo usa la forma oficial como máscara transparente,
con el color de acento de cada tema. No depende de una descarga posterior de
la imagen para mostrar el encabezado.

## Módulos y contratos

```mermaid
flowchart LR
  D[Interfaz local del mini] --> A[Archivo canónico AUTONOMO]
  D -->|Acción manual por SSH| Q[Bandeja existente de Kairo]
  D -->|Recoger una vez| M[Correo Business por IMAP]
  M --> P[PDF original y procedencia en ENTRADA]
  P --> Q
  Q -->|Aprobación explícita| W[Trabajador existente del mini]
  W --> A
  A --> E[Excel, resumen, 303 y 390]
  D -->|Validar y confirmar manualmente| H[Conector AEAT del mini]
  E -->|Modelo aprobado y generado| H
  H -->|Aceptación y justificante| A
```

`desktop_app` sirve la interfaz y aplica sesión, Host, Origin y CSRF.
`desktop_transport` envía peticiones limitadas por SSH, reutilizando la clave
configurada. `desktop_remote` se ejecuta solo para esa petición y llama a los
motores ya instalados; no modifica el servicio remoto. Sus escrituras respetan
el mismo `service.lock` que la interfaz de Kairo.

`desktop_intake` conserva los originales y la procedencia antes del transporte.
Usa el manifiesto Amazon versión 1 y el importador existentes. Los documentos
recogidos son `source_kind=unknown` y deben revisarse. Un error conserva el PDF
para repetir manualmente sin perderlo ni duplicarlo. Los abonos necesitan revisión
específica; no existe clasificación fiscal automática por remitente.

`desktop_billing` es el adaptador de Facturas y Programación. Viaja como código
de esta instalación en la petición SSH y llama únicamente a rutas permitidas de
los dos servicios HTTP locales existentes en Kairo. Conserva sus bloqueos, trabajos,
identidades de plan y huellas de aprobación. El navegador usa la sesión/CSRF del
mini; el token del servicio remoto se obtiene y utiliza solo dentro del adaptador.
No instala otro servicio, abre puertos de red ni inicia los emisores.

El HTML se incorpora al marco local, conservando diálogos y controles propios
de cada módulo. Sus estilos quedan acotados para mantener el tema del escritorio.
La importación de un borrador mantiene el comportamiento del servicio existente,
incluido el posible aviso de revisión al propietario si está configurado. No se
ejecutan envíos reales para comprobar la integración.

Gestify permanece externo: envía preparaciones y consulta estados por su botón
de sincronización, y conserva la preparación y programación de correos. La aplicación
no controla Gestify ni crea un segundo editor de esos correos. Véase el alcance
completo en [KAIRO-ECOSYSTEM.md](KAIRO-ECOSYSTEM.md).

`aeat_workflow` añade el circuito local de presentación; `aeat_submission` conserva
sus operaciones y `aeat_windows` utiliza el certificado del almacén de Windows sin
exportar la clave. «Validar modelo» y «Firmar y presentar en Hacienda» son acciones
distintas. «Consultar resultado / recuperar justificante» nunca reenvía un intento
incierto. Los modelos, respuestas y justificantes aceptados se archivan en AUTONOMO.
No se modifica la instalación emisora de facturas ni su certificado de VeriFactu.
Windows puede pedir permiso para usar la clave en su ventana protegida; se conserva
esa protección. Una petición caducada requiere otra acción manual, no un reintento
automático de presentación.

La lectura del correo reutiliza la cuenta y contraseña de aplicación que ya
usa el servicio de facturas. La contraseña permanece en el equipo que la guarda;
no se copia al mini, a Git, al navegador ni a los registros. Gmail se abre en modo
solo lectura, buscando el número exacto de pedido en Todo el correo (INBOX como
alternativa explícitamente limitada). Máximo 20 mensajes, 10 PDF y 8 MiB por PDF.
No sigue enlaces del correo. Solo admite candidatos de `amazon.es` y subdominios;
esto selecciona documentos, no acredita su autenticidad fiscal.

## Instalación y recuperación

Requiere el entorno de Modelos instalado, Python y sus dependencias existentes,
`config.json`, `amazon-manual.json` y acceso SSH. Desde el checkout:

```powershell
& .\tools\iva\install-desktop.ps1
& "$env:LOCALAPPDATA\GestifyFacturacion\modelos\launch-desktop.ps1"
```

El instalador conserva la configuración privada existente. En la primera
instalación obtiene pedido y cuenta de `amazon-manual.json`. El puerto se puede
indicar con `-Port`; debe estar libre. No modifica la generación de ingresos,
el listener de acciones ni la aplicación móvil.

Una reinstalación para únicamente el proceso `desktop_app.py` identificado por
PID y ruta, copia los módulos y conserva un respaldo privado de los anteriores.
Debe hacerse sin acciones en curso. El acceso directo inicia el servidor o
reutiliza la instancia autenticada que ya está abierta. Un puerto ocupado por
otro programa se rechaza. El token de arranque se guarda en el estado privado,
nunca en el acceso directo ni en Git.

## Alcance actual

Resumen, tablas, originales y libros se consultan desde el archivo del mini sin
conectar a Kairo. La bandeja, preparación fiscal, actualización y recogida de
correo requieren la conexión privada al equipo que ya tiene esos módulos.
No hay un segundo libro ni una segunda bandeja.

La presentación AEAT se ejecuta en el mini y requiere Internet, certificado vigente
y acceso a la preparación de Kairo. El 4T real sigue incompleto; no se habilita su
presentación por tener instalada la conexión. Hay validación oficial con datos
sintéticos y del fichero histórico 303 2T 2026 (sin errores, aviso 31190), pero no
una presentación real probada con este conector. La consulta autenticada está
pendiente de completar la autorización protegida de Windows y comprobar la respuesta;
la recuperación real tampoco está comprobada. Esta capacidad
local todavía no implica paridad de presentación desde el móvil.

Esta entrega configura la recogida del pedido de prueba seleccionado, no una
descarga de todo el historial de Amazon. Siguen pendientes la extracción avanzada
IA/OCR, la recogida de otros proveedores y el cálculo completo de Renta. La interfaz
móvil no se despliega ni modifica en esta entrega.

Validación: pruebas `test_desktop`, `test_desktop_billing` y `test_vat_dashboard`; revisión visual local
en claro/oscuro y ancho estrecho; comprobación real de correo sin factura disponible.

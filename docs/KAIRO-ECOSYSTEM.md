# Una plataforma para el mini y el móvil

Alcance acordado el 17/11/2026. El objetivo es gestionar facturas, correos,
contabilidad y modelos desde Kairo, y añadir después las horas y las imputaciones
de Excelia. La interfaz debe adaptar su distribución a la pantalla y ofrecer
las mismas operaciones en el mini y en el móvil.

**Gestify conserva su interfaz y queda fuera de esta unificación.** Es un cliente
externo que envía preparaciones y consulta el estado de sus correos y facturas
mediante el botón de sincronización que ya existe. Kairo debe permitir crear y
gestionar sus operaciones también sin partir de Gestify. No se añaden acciones
de Kairo sobre Gestify ni se convierte su calendario en una dependencia del panel.

Este documento fija el destino y las entregas pendientes. No acredita que todas
las integraciones estén instaladas. El estado de cada entrega debe actualizarse
cuando se haya comprobado su funcionamiento real.

## Una interfaz y una fuente por módulo

El mini y el móvil son dos accesos al mismo sistema. No deben mantener dos libros,
dos colas de gastos ni dos planes de envío que puedan modificarse por separado.
Cada módulo conserva su motor y su fuente de datos; la interfaz envía comandos
y presenta sus resultados, sin repetir los cálculos ni la lógica de aprobación.

| Módulo | Fuente que se conserva | Copias y salidas |
|---|---|---|
| Facturas y su correo | Servicio existente de Kairo, con sus preparaciones, versiones, aprobaciones y planes | PDF definitivo, estado de emisión y registro del correo |
| Programación de correos de horas | Servicio existente de horas y sus registros de operación | Calendario y última consulta verificada del estado de Outlook |
| Gastos | Bandeja de revisión existente de Kairo | Originales conservados en el mini y paquetes de incorporación aprobados |
| Contabilidad | Libro canónico del archivo `AUTONOMO` del mini | Excel, informes y copia de consulta con la misma versión verificada |
| Modelos | Preparación vinculada a una versión del libro y a sus evidencias | Fichero del modelo, resultado de validación y justificante de presentación cuando exista |
| Imputaciones Excelia | Motor del bot, calendario revisado y registros comprobados en Excelia | Plan, resultado de ejecución y exportación posterior verificada |
| Gestify, cliente externo | Conserva sus datos y su interfaz actuales, fuera de Kairo | Preparaciones enviadas a Kairo y respuesta a sus consultas de estado |

Excel es una salida del libro contable: modificar una copia descargada no cambia
el libro. La copia móvil debe mostrar su fecha y versión, y no aceptar cambios
como si fuera otra fuente independiente. Los repositorios de código no se
sincronizan por Drive o Syncthing.

## Módulos, entradas y salidas

```mermaid
flowchart LR
    U[Interfaz Kairo: mini o móvil] -->|Acción del usuario| A[Adaptadores de operaciones]
    EX[Gestify: cliente externo] -->|Preparación y consulta de estado| A
    A -->|Respuesta a la consulta| EX
    A -->|Preparación mensual y revisión| F[Motor de facturas]
    F -->|PDF definitivo y resultado| I[Ingresos]
    F -->|Plan de correo aprobado| C[Motor de correo]
    A -->|Consulta y gestión de planes existentes| C
    A -.->|Preparación propia y revisión| P[Editor de programación de Kairo: pendiente]
    P -.->|Plan aprobado| C
    A -->|PDF y procedencia| G[Entrada y revisión de gastos]
    G -->|Paquete aprobado| L[Libro canónico del mini]
    I -->|Documento identificado| L
    L -->|Versión verificada| E[Excel y vistas de consulta]
    L -->|Datos del periodo y evidencias| M[Preparación 303 y 390]
    M -.->|Modelo aprobado e identidad habilitada| H[Conector AEAT pendiente]
    H -.->|Respuesta y justificante| M
    A -.->|Calendario con revisión| T[Contrato de horas para Imputaciones: pendiente]
    T -.->|Horas y proyectos revisados| X[Motor Imputaciones Excelia]
    X -.->|Resultado verificado| A
```

Las conexiones discontinuas representan trabajo de integración pendiente. Cada
entrada debe conservar la identidad de la operación y la revisión que se aprobó.
Una respuesta perdida deja un resultado pendiente de comprobar; no autoriza
repetir una emisión, presentación o envío cuyo resultado sea incierto.
La respuesta a Gestify devuelve el estado que ha solicitado; no es una orden para
modificar su calendario, sus facturas ni su interfaz.

## Estado de partida

Ya existen el circuito de creación y gestión de facturas de Kairo, sus correos,
la programación de correos de horas y el bot de Imputaciones. Su existencia no
significa que todos sus controles estén integrados en la aplicación del mini.
El puente externo de Gestify se conserva. Integrar el calendario y los planes
existentes en el mini no completa por sí solo la creación de una programación
nueva desde Kairo: ese recorrido necesita su propio editor y contrato de entrada.

La aplicación local permite consultar Resumen, Ingresos, Gastos, Libros y Modelos,
usar la bandeja compartida, aprobar incorporaciones y solicitar una actualización.
La recogida de Amazon está limitada al pedido configurado y a los PDF que lleguen
adjuntos al correo. El archivo de documentos para Renta existe; su cálculo completo
y las amortizaciones siguen pendientes.

Los modelos tienen preparación, controles, exportación y archivo de evidencias.
**Preparar o exportar un modelo no lo presenta en Hacienda.** Falta conectar el
envío real con su autenticación, validación, respuesta y justificante. La existencia
de servicios oficiales permite estudiar ese conector, pero no equivale a tenerlo
configurado o validado en Kairo. La disponibilidad se comprobará para cada modelo
y ejercicio; presentar, pagar y conservar el justificante son estados distintos.

La [documentación oficial de servicios de declaraciones de AEAT](https://www.agenciatributaria.es/static_files/AEAT_Desarrolladores/EEDD/General/EspecificacionesServiciosDeclaracionesAEAT_ES.pdf)
incluye los modelos 303 y 390: `ServValiDos` para validación/impresión,
`PresBasicaDos` para presentación con certificado y conformidad, y `ConsultaExt`
para recuperar declaraciones. Son operaciones diferentes. Este conector no existe
todavía en el código de Kairo; deberá comprobarse contra la especificación vigente
antes de habilitar cada operación.

## Entregas

1. **Facturas y Programación en el mini — en curso.** Llevar las operaciones
   existentes al mismo menú y mantener sus datos, estados y motores actuales.
   Integrar Facturas y el calendario de Programación reutilizando el circuito ya
   implantado. Completar después los editores que permitan preparar una factura
   o una programación nueva desde Kairo, sin exigir abrir Gestify. No crear un
   segundo emisor ni un segundo programador de correos. La preparación propia
   y la recibida de Gestify deben converger en los mismos contratos y estados.
2. **Presentación de modelos — pendiente.** Integrar el canal oficial de AEAT
   adecuado para el modelo y ejercicio, incluida la identificación necesaria.
   El botón debe mostrar periodo, tipo de declaración, resultado y versión antes
   de la confirmación final; después debe conservar la respuesta real. Una
   validación de prueba no habilita la etiqueta «Presentado».
3. **Paridad móvil — pendiente.** Servir la misma interfaz adaptable y las mismas
   operaciones mediante el acceso privado de Kairo. Comprobar desde el móvil
   consulta, creación, revisión, aprobación, descarga y recuperación tras una
   interrupción. No resolverlo manteniendo una segunda contabilidad en el teléfono.
4. **Horas e Imputaciones — integración futura separada.** Definir primero la
   consulta y el contrato de calendario que recibe el bot, y después conectar sus
   operaciones. Mantener la revisión del plan, la detección de cambios y la
   comprobación posterior en Excelia. No trasladar la interfaz de Gestify a Kairo
   ni bloquear la programación de correos hasta completar este módulo.
5. **Ampliaciones documentales — pendientes.** Lectura avanzada de PDF/escaneados,
   más pedidos y proveedores, recopilación de Digi/luz/gas y cálculo completo de
   Renta. Son módulos independientes y no bloquean la integración de funciones
   que ya están operativas.

### Preparaciones propias de Kairo

La nueva programación desde Kairo debe construir una entrada completa y revisable
para el servicio de horas existente: periodo o semana, días y horas, destinatarios,
mensaje, fecha de envío, identidad de operación y revisión. El editor debe mostrar
el plan y conservar los mismos controles frente a cambios, duplicados y resultados
inciertos. Crear esa entrada no debe requerir un calendario abierto en Gestify.

El cliente externo puede seguir enviando sus preparaciones y consultar después
el resultado mediante su botón de sincronización. La gestión de los planes vive
en Kairo; no se añade una sincronización que escriba cambios de vuelta en Gestify.

### Contrato futuro de horas para Imputaciones

`horas-excelia` es el repositorio de Gestify; `imputaciones-bot` contiene el motor
Node/Edge que registra las imputaciones. El bot ya ofrece comparación e importación
de exportaciones de Gestify, preparación de un plan y verificación de Excelia.

El CSV actual contiene únicamente `Fecha,Estado`. El lector del bot asigna ocho
horas por día y obtiene los códigos de proyecto de su propia configuración. No
transmite las horas reales ni los códigos de proyecto guardados en Gestify.

La futura integración debe definir un contrato versionado, con fecha, estado,
duración, proyecto, procedencia y revisión. Debe conservar la compatibilidad con
el CSV anterior e identificar cuándo se aplica su equivalencia de ocho horas.
Una exportación de Gestify puede ser una entrada, igual que cualquier otra fuente
admitida explícitamente; no obliga a integrar su interfaz ni a centralizar sus
datos personales. Las importaciones deben presentar sus diferencias y conservar
su procedencia, sin fusionar automáticamente calendarios de distintos navegadores.

## Acciones y conectividad

Consultar o cambiar de sección no recoge correo, no escanea pedidos y no regenera
la contabilidad. Recoger, aprobar, actualizar o comprobar un estado son acciones
explícitas. Un correo programado conserva su ejecución en la fecha aprobada:
esa programación no exige vigilar periódicamente los gastos ni los modelos.

La consulta del archivo local del mini funciona con los datos disponibles aunque
Kairo no esté conectado. Las operaciones que viven en Kairo necesitan su servicio
y la conexión privada. El motor de Imputaciones necesita el mini encendido y una
sesión válida de Excelia; el móvil puede ordenar la operación, pero no sustituye
al proceso que la ejecuta. Ninguno de estos botones debe depender de tener Codex
abierto. La futura paridad no implica que todas las acciones funcionen sin red.

## Cuándo se considera terminado

- Se puede completar cada recorrido autorizado desde la misma interfaz, con
  estados y operaciones equivalentes en mini y móvil, sin saltar entre paneles
  internos distintos. Una autenticación externa necesaria conserva su recorrido
  propio y devuelve el resultado a Kairo.
- Facturas, correos, gastos y modelos muestran la misma operación y revisión en
  ambos dispositivos. La repetición o pérdida de respuesta no genera duplicados.
- Kairo permite preparar y gestionar sus facturas y programaciones sin abrir
  Gestify. Este conserva su circuito externo de envío y consulta de estados;
  no recibe órdenes para modificar sus datos desde Kairo.
- Libro, Excel e índice de consulta coinciden en versión y huellas; los documentos
  originales siguen disponibles. Una publicación fallida conserva la última
  copia verificada, identificada con su fecha.
- «Presentado» requiere una aceptación real de AEAT y su justificante, asociados
  al modelo, periodo y versión enviados. La comprobación del pago es independiente.
- Horas e Imputaciones conservan el plan aprobado y el resultado comprobado en
  Excelia; una importación de calendario no se confunde con una imputación realizada.
- No se han añadido comprobaciones periódicas de contabilidad. Los errores indican
  qué operación quedó pendiente y permiten recuperarla sin empezar todo el circuito.

Las comprobaciones se acotan al módulo cambiado y a sus contratos afectados.
No es necesario repetir todo el historial de ensayos para entregar una mejora.

Referencias de implementación: [aplicación del mini](DESKTOP-ACCOUNTING.md),
[contabilidad modular](ACCOUNTING-MODULES.md) y
[preparaciones de Gestify hacia Kairo](KAIRO-DEVELOPMENT.md).

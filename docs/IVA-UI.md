# Modelos privados de Kairo

La vista trimestral reúne situación, antigüedad de datos, siguiente acción,
cálculo, documentos y archivos. Año mantiene conciliación por trimestre y
preparación 390 separadas. Los importes ausentes se muestran pendientes; una
coincidencia exacta de referencias no se convierte en validación fiscal ni pago.

## Integración

Los módulos son herramientas privadas. No añadirlos a los assets de Gestify.
Conservar la autenticación de propietario/Tailscale, Host y, en POST, Origin y
CSRF del servicio. La UI usa `kairo_invoice_web.dashboard` y su cabecera/tema.
El fallback HTML solo permite ejecutar las herramientas offline sin el servidor
privado; el despliegue debe tener el dashboard compartido instalado.

- `vat_dashboard.response(archive_root, url)`: consulta, descargas del índice,
  originales bajo `/modelos/documento?id=sha256`. Conserva el prefijo opcional
  `/facturas`, rutas y parámetros anteriores.
- `modelos_web.get(runtime, url, csrf)`: bandeja/revisión de gastos y lectura de
  PDF/paquete aprobado en `/modelos/gastos[/pdf|/paquete]?id=...`.
- `modelos_web.post(runtime, path, data, actor)`: `upload`, `edit` y `approve`.
  Actor viene de la identidad autenticada del servicio. Edición/aprobación
  requieren la revisión exacta; el motor conserva su propio control concurrente.
- Cola privada: `ExpenseStore(runtime / 'expenses')`. Aprobado es pendiente de
  incorporación; `incorporated` se muestra solo tras confirmación del worker.
- Para el POST de gastos, aceptar hasta 12 MiB de JSON por el PDF de 8 MiB en
  base64. Mantener los límites anteriores en otras rutas. El motor limita el
  PDF decodificado a 8 MiB y valida su contenido.
- Preparación nueva: enlaces a `/modelos/preparacion?periodo=1T..4T` y
  `periodo=anual`; atiende el módulo de preparación independiente.

Los originales requieren un libro verificado por su huella, un ID existente en
ese libro, ruta confinada y PDF con SHA256 correcto. `index.document_root`
permite instantáneas versionadas; también se confina dentro del archivo.
`index.sync.at`, cuando existe, muestra la fecha de sincronización verificada.
Gastos lee `runtime/sync-status.json` y muestra pendientes sin exponer errores
internos ni rutas privadas.
Rutas de originales y datos reales no se incrustan como enlaces al filesystem.

## Comprobación de esta entrega

Ocho pruebas nuevas de UI/rutas pasan: protección de originales alterados,
rutas confinadas/versionadas, escapes HTML/script, actor y revisión de
aprobación, rechazo de campos ajenos y flujo real subir/editar/aprobar/descargar
con ExpenseStore y privacidad de los errores de sincronización. Las dos pruebas anteriores de vat_dashboard también pasan.

QA con datos ficticios, dashboard y shell compartidos reales: trimestre actual,
histórico, anual, documentos, subida, revisión e incorporación de gasto y
sincronización pendiente,
393 y 1200 px, temas claro y oscuro. Sin desbordamiento horizontal. Comprobado
que una edición sin guardar impide aprobar desde la pantalla. Se observaron
las capturas, se corrigieron la columna Periodo y el texto largo del selector
de tratamiento y se volvieron a observar las vistas afectadas.

Evidencias locales no versionadas:
`Configuración ordenador mini codex/tmp/modelos-ui/visual/`.
La prueba local no acredita despliegue remoto, presentación ni datos fiscales.

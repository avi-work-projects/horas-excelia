# Drive publication — WIP, not commissioned

Prepared 2026-10-24. This is not a completed Kairo→Drive→PC integration.
Google login/own OAuth client and authorization are still required. Existing
daily Windows archive collection must remain enabled until the full probe passes.

## Preparation completed

- Google Drive for desktop restarted on the mini; startup entry already existed.
- A new harmless test file was created under AUTONOMO/REVISIONES/PRUEBAS_SINCRONIZACION.
  Drive's local mirror database acknowledged cloud size and MD5 matching the local
  bytes. This is client evidence, not an independent Drive API download.
- AUTONOMO folder ID identified in Drive's local metadata; the chat's separate
  connector cannot access it. Verify it through the authorized Kairo account.
- Debian's packaged rclone installed on Kairo (1.60.1+dfsg-4, binary reports DEV).
- Six isolated publisher tests pass: new/repeated upload, conflict preservation,
  duplicate-name refusal, corrupted readback, lost reply and path confinement.
- No new service enabled; no invoice/mail/production database changed.

## Design

`drive_publish.py` reads accepted invoices and verified immutable archived PDFs
through invoice_catalog. It publishes only to FACTURAS/year/A - FACTURAS INGRESOS.
`--probe` creates a harmless text file under REVISIONES/PRUEBAS_SINCRONIZACION.

Use a dedicated private rclone config with its root_folder_id set to the verified
AUTONOMO ID. This limits tool paths, not the account-level OAuth grant. Explain
Google's actual permission scope at authorization time. Do not copy Desktop Drive
tokens or ChatGPT connector credentials. Own OAuth client required: rclone's shared
client is being retired in 2026 (https://rclone.org/drive/).

Existing directories and filenames must be unique. An existing different file is
never overwritten. Upload uses ignore-existing/immutable/checksum, followed by
listing and SHA-256 verification of downloaded bytes. Publication state is saved
atomically only after verification. A lost upload reply can retry without duplicate
uploads. A verified unchanged file is skipped without new network calls.

Publication is separate from fiscal issuance and SMTP. The proposed archive hook
touches a request file only when a final PDF is newly archived; a systemd path
triggers the publisher. Boot-time run reconciles missed requests. Failures retry
at five-minute intervals, bounded by systemd start limits; no periodic normal poll.
Failure reporting/monitoring should be reviewed before commissioning. Do not
silently describe a failed or disabled publisher as ready.

## Remaining steps

1. User logs into Google Cloud; prepare own OAuth application and enable Drive API.
   User handles required terms/permission approvals. Do not activate paid billing.
   Avoid testing-mode weekly expiry for unattended use; review personal-use OAuth
   publication requirements with the user.
2. Authorize Kairo through loopback SSH forwarding; store credentials privately,
   never in Git, command output or chat. Verify account and exact AUTONOMO folder.
3. Stage private config (enabled=false, remote, folder_id, rclone_config path).
   Run --probe, verify Drive readback and mini's downloaded file with same SHA-256.
4. Reconcile existing October PDF without overwriting or re-emitting it.
5. Validate/install event hook and path/service; add visible failure reporting.
   Enable publisher only after successful probe. Snapshot invoice/mail state.
6. Export then disable (not delete) the old Windows collection task. Verify no
   duplicate publisher and document rollback to the saved Windows task.

The service/path files and archive patch are candidates, not installed. The worker
is staged privately on Kairo; production code and the current copy task are intact.

## Authorization handoff (2026-10-24)

Edge is the user's chosen browser. Correct Google account already signed in.
Dedicated Google Cloud project `kairo-drive` created without enabling billing.
OAuth app identity/contact form prepared; final Google user-data policy acceptance
is awaiting the user in Edge. No OAuth client, token or Drive grant created yet.
Continue with Drive API and Desktop OAuth client after the user completes this step.

## OAuth preparation update (2026-10-24, evening)

User accepted Google API user data policy. Desktop OAuth client created and
Drive API enabled. Credentials stored privately outside Git on mini and Kairo.
Only owner's account added as test user. Edge is waiting at Google's unverified
app warning; user must review and grant actual Drive access. No token confirmed.

Production publication remains disabled by Google pending branding completion.
Test-mode Drive refresh tokens expire after seven days; do not commission this
as unattended production or disable the daily copy in that state.
Reference: https://support.google.com/cloud/answer/15549945

An SSH loopback authorization session was started (local 127.0.0.1:53682 only).
If expired, restart rclone config reconnect with the same private config and
SSH loopback forwarding. Never put tokens or client secrets in documentation.

## Authorization result (2026-10-24)

OAuth succeeded: access and refresh tokens are present in private Kairo config.
Read-only Drive API verified the authorized user's email. However, its My Drive
root differs from the desktop mirror root; the configured existing AUTONOMO ID
returns 404 and a name query finds neither AUTONOMO nor the mini probe file.
Do NOT upload into this account or create a replacement AUTONOMO folder.
Await the user identifying the desktop Drive account; then authorize that account
and verify the existing folder. No cloud probe uploaded, publisher not enabled,
old daily collection still retained. Production OAuth branding remains pending.

## End-to-end probe passed (2026-10-24)

Correct document account authorized and existing AUTONOMO folder confirmed by
Drive API. Test text uploaded from Kairo, downloaded back from Drive, and arrived
in the existing desktop mirror with identical SHA-256. Re-running verification
reused the same cloud object without uploading a duplicate.

Live rclone emits hash keys in lowercase. Publisher now normalizes hash names;
tests use the actual lowercase shape. Six isolated tests passed on Windows and
Kairo. No fiscal or mail production code changed.

Still NOT commissioned: OAuth remains Testing and Google disables Publish app
pending branding completion. User is choosing where to host public informational
and privacy pages. Keep daily Windows copy enabled until permanent auth plus
publisher service/event hook and visible failure reporting are validated.

## Year rollover checked (2026-10-24)

Archive destinations use the validated invoice period, never the current clock.
The number must agree with that period; mismatches stop publication for review.
December 2026 stays in FACTURAS/2026 even when uploaded/retried after January.
January 2027 goes into FACTURAS/2027/A - FACTURAS INGRESOS, created if absent.
Existing folders are reused; no copies or invoices are generated for a new year.
Nine isolated tests passed on Windows and Kairo, including rollover, late retry,
missing year folder creation, repeated uploads and inconsistent metadata rejection.
The staged worker was updated; production services remain unchanged.

OAuth checked again in Edge: Publish app is disabled and directs to Branding.
Homepage/privacy links and authorized domains are empty. No settings changed.
The user previously deferred public pages pending review; do not publish them
without resolving that decision. Existing Windows copy remains enabled.

### Proposed public information (draft, not published)

Kairo Drive — archivador personal
Herramienta de uso personal para archivar documentos seleccionados en Google Drive.
No ofrece registro de usuarios ni acceso público a los documentos.

Privacidad
Kairo Drive utiliza una autorización de Google para copiar y comprobar documentos
seleccionados en la cuenta de su titular. La configuración de archivo se limita a
AUTONOMO; el permiso OAuth concedido por Google puede abarcar el resto de Drive.
Los documentos se conservan en los equipos del titular y en su cuenta de Google
Drive. Esta página informativa no muestra documentos ni credenciales. La herramienta
no vende datos ni los utiliza con fines publicitarios. El titular puede revocar el
acceso desde la sección de conexiones con terceros de su cuenta de Google; revocar
el acceso no borra los archivos ya guardados. Su eliminación se gestiona en Drive
y en los archivos locales del titular.

Proposed host: a dedicated informational path on the existing Gestify GitHub Pages.
No public Kairo endpoint, invoices, email addresses or identifiers in this text.
Hosting and final publication still require the user's deferred decision.

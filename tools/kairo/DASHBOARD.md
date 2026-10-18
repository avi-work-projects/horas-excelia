# Invoice overview and history

The private invoice service now exposes authenticated, read-only pages:

- `/facturas/`: active invoice overview and mail state.
- `/facturas/historico`: all prepared documents, filtered by year and issuance.
- `/facturas/factura/<docid>`: amounts, fiscal/mail status, recipients and versions.
- `/facturas/documento/<planid>/draft|final`: immutable archived PDF, checked by SHA-256.
- `/facturas/revision`: preserved existing approval/upload/settings screen.

`prepare_dashboard_candidate.py` patches only GET routing, using an exact anchor.
Existing Tailscale identity/Host validation and no-store headers apply to every
new route. All POST routes, approval logic, monthly runner and mail configuration
are unchanged. No fiscal adapter or SMTP module is imported by the dashboard.

## Data rules

`invoice_catalog.py` opens existing SQLite databases in read-only mode and closes
connections explicitly. Each document appears once; latest plan wins. Earlier
plans are shown as preparations, not additional invoices. This catalog assumes
one FacturaScripts instance; a future multi-instance import needs an instance ID.

Fiscal acceptance comes from the stored outbox result, not merely a plan label.
Review mail and final mail have different idempotency keys. A final mail record
marked sent means the transport accepted it, not that the client read or paid it.
The dashboard does not claim live banking reconciliation or query the AEAT.

PDF requests read existing archives and verify their recorded hash. Missing,
altered or unconfirmed final documents return an error, never a draft fallback.
Paths must resolve inside the archive directory. Only the active document links
to the existing approval screen; historic document pages are read-only.

Older Declarando invoices are not imported by this feature. There is no invoice
mutation, regeneration, send, cancel or approval action in the new pages.

## Verification and deployment, 2026-10-18

- Six synthetic catalog tests: grouping, multi-month filtering, mail separation,
  no storage changes, escaping, empty state, path confinement and corrupted PDF.
- Two patched HTTP tests: authentication for all new routes, no writes, retained
  review screen and missing-document response.
- Four existing HTTP bridge tests, 12 bridge tests, four PDF delivery tests and
  full `npm test` passed.
- Browser navigation/detail/history checked with actual rendered data at 320,
  390 and 736px; no horizontal overflow or JS errors. Light/dark visual inspection.
- Production endpoints returned 200; unauthenticated request returned 403.
  The final PDF served through the new route matched the manifest hash.
- Before/after comparison (including live read requests): invoice snapshot,
  plans, approvals, mail records, importer, fiscal state, PDFs and config unchanged.
  October remained accepted/approved with its October 20 schedule. Timer active.

Deployment adds the catalog, renderer and CSS, patches the private service and
restarts only its web service. No schema changes. Original service and private
verification evidence are retained in `/home/angel/dashboard-deploy-20261018`.
Rollback: restore that original `service.py` under the service process lock and
restart only `kairo-facturas.service`; do not restore databases or touch timers.

Run synthetic tests with:

```text
python -m unittest discover -s tools/kairo -p test_invoice_dashboard.py
python tools/kairo/test_dashboard_http.py PRIVATE_PATCHED_SERVICE.py
```

Private data, screenshots, database snapshots and service source remain outside Git.

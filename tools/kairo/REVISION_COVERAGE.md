# Draft revision coverage — 2026-10-18

Implemented and deployed controlled replacement of unissued drafts. The earlier
invalidation-only behavior remains a compatibility fallback for old services.

## Current behavior

Explicit preparation of changed content updates the same FacturaScripts document
and number, clears both approval records, archives a new PDF and creates a fresh
review plan. Status queries remain read-only. Identical retries are idempotent.
Issued documents, fiscal intents and active emission/mail states are rejected.
Old approval digests cannot approve new plans. A failed update stays blocked.
A durable journal reconciles a lost PHP response without duplicating invoices.

## Evidence

- 12 bridge tests and 4 private candidate HTTP tests passed.
- Full `npm test` passed, including 53 view snapshots and 55 logic rules.
- Real isolated FacturaScripts clone: six synthetic November revisions, same
  document and number, day/rate changes, adding/removing price-group lines,
  reverting content, old approval rejection and immutable previous PDFs.
- Injected lost response after database commit: retry recovered the same draft.
- Regenerated PDF visually inspected. No fiscal emission or mail occurred.

The clone used a separate database, internal Docker network without Internet and
no fiscal certificates. Its containers were stopped after testing. Private
fixtures, snapshots, database dump and credentials are outside Git.
The scripts `run_revision_integration.py` and `test_revision_recovery.py` require
that explicitly prepared private clone; they are not standalone generic tests.

## Deployment

The existing private service was patched with exact source anchors and AST checks.
A backup and before/after evidence were retained privately. Only the review web
service was restarted; the monthly runner schedule was not changed.
Production plans, approvals, mails, importer, fiscal record, archived PDFs and
monthly configuration compared equal after restart. October remained accepted
and approved, scheduled for October 20 at 08:00 Europe/Madrid.

Remaining acceptance: observe the mobile workflow in the next editable month,
after October mail closes. Do not use October for replacement tests or repeat
AEAT issuance/numbering trials without a new reason.

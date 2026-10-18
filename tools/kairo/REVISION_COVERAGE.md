# Draft revision coverage audit — 2026-10-18

The bridge currently **invalidates and blocks**, rather than updating a draft.
Do not describe automatic draft replacement as implemented or merely awaiting QA.

Existing coverage already included revision invalidation, idempotent import,
lost reply/retry, issued-document edit/revert protection and pending-mail guards.
The deployed bridge matches the repository version (SHA-256
52806e21f276c013c629994ecb653d6a253c30c478ea11650fb45b11ec1a5d91).

The added regression covers a previously approved, unissued synthetic month:
1. A status query showing a difference is read-only.
2. Explicit changed preparation clears both approval records and blocks the plan.
3. Retrying that change creates no duplicate or additional import.
4. Undoing the edit does not resurrect the old approval.
5. Original snapshot remains intact; one draft remains, with no approval timestamp.

Validation: 11 bridge tests, 4 private candidate HTTP tests, 53 view snapshots and
55 logic rules passed. The HTTP suite needs the private service path as its argument.
Tests use temporary SQLite, synthetic data and an importer/validator double; they
cannot send mail, issue invoices or write the live database. No production code
was changed or deployed by this audit.

Remaining feature work: controlled replacement of an unissued draft, refreshed PDF,
new explicit approval and failure recovery. Validate that feature against an isolated
real importer once implemented. Do not repeat fiscal issuance or numbering trials
just to compensate for stale status documentation.

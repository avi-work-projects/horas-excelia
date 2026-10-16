# PDF references in the private Kairo service

`pdf_delivery.reference(row)` identifies draft and final documents with different
URLs and filenames. It only reads the plan; it cannot emit, approve or send.

Private service integration:
- The review link uses the returned canonical path.
- GET /facturas/pdf redirects (303) to the canonical path.
- A different or stale version path returns 409 and asks to reopen the review.
- The canonical route loads the existing final bytes for issued states, or the
  existing draft for review states. It sets inline Content-Disposition with the
  returned filename and retains Cache-Control: no-store and authentication.
- No PDF is regenerated and no plan, approval, fiscal record or scheduler changes.

Verification: python tools/kairo/test_pdf_delivery.py. The private deployment
also checked its final bytes against the archived SHA-256, the filename header,
a stale URL rejection and exact equality of the production plan before/after.

This avoids reusing the generic PDF URL on mobile. It cannot erase an old file
already open in an external viewer: close that viewer and open the new review link.

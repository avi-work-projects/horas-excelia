"""Versioned URLs for the existing private PDF viewer; no document mutation."""
import re

ISSUED = {'accepted', 'sent', 'email_cancelled', 'sending'}


def reference(row):
    p = row['data']
    issued = row['status'] in ISSUED
    token = p['panel_hash'] if issued else p['pdf_hash']
    if not re.fullmatch('[a-f0-9]{64}', token):
        raise ValueError('Invalid document reference')
    number = p['number'].replace('/', '_')
    if not re.fullmatch(r'\d{2,}-\d{2}_20\d{2}', number):
        raise ValueError('Invalid invoice number')
    filename = ('Factura_' if issued else 'BORRADOR_') + number + '.pdf'
    path = f"/facturas/pdf/{'final' if issued else 'draft'}/{int(p['docid'])}/{token}/{filename}"
    return path, filename, issued

"""Read-only invoice catalog. Never imports the runner, SMTP or fiscal adapter."""
import hashlib
import json
import re
import sqlite3
from contextlib import closing
from pathlib import Path


def rows(root, file, table):
    path = Path(root) / file
    if not path.exists():
        return []
    with closing(sqlite3.connect(path.resolve().as_uri() + '?mode=ro', uri=True)) as db:
        db.row_factory = sqlite3.Row
        return [dict(r) for r in db.execute('SELECT * FROM ' + table)]


def digest(data):
    return hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False,
                                     separators=(',', ':')).encode()).hexdigest()


def catalog(root):
    plans = rows(root, 'service.sqlite', 'plans')
    for row in plans:
        row['data'] = json.loads(row['data'])
    plans.sort(key=lambda r: r['id'], reverse=True)
    drafts = {r['docid']: json.loads(r['snapshot']) for r in rows(root, 'workflow.sqlite', 'drafts')}
    fiscal = {r['docid']: r for r in rows(root, 'emission-production.sqlite', 'emissions')}
    mails = {r['key']: r['state'] for r in rows(root, 'service.sqlite', 'mails')}
    invoices = {}
    for row in plans:
        p = row['data']; docid = int(p['docid'])
        if docid in invoices:
            invoices[docid]['versions'].append(row)
            continue
        snap = drafts.get(docid, {})
        f = fiscal.get(docid, {})
        result = json.loads(f.get('result') or '{}')
        accepted = f.get('phase') == 'accepted' and result.get('status') == 'Correcto'
        state = row['status']
        final_mail = mails.get('final:' + digest(p))
        mail_label = ('Enviado' if final_mail == 'sent' else
                      'Cancelado' if state == 'email_cancelled' else
                      'Requiere revisión' if state in ('uncertain', 'sending') or final_mail else
                      'Programado' if state in ('approved', 'accepted') else
                      'Sin programar')
        invoices[docid] = dict(docid=docid, row=row, versions=[row],
            display=p.get('display') or snap, client=snap.get('raw_doc', {}).get('nombrecliente', 'Cliente no registrado'),
            accepted=accepted, fiscal_phase=f.get('phase'), mail=mail_label,
            review_mails=sum(mails.get(key) == 'sent' for key in
                             {'review:' + digest(x['data']) for x in plans if x['data']['docid'] == docid}),
            active=row['id'] == (plans[0]['id'] if plans else None))
    return sorted(invoices.values(), key=lambda x: (x['row']['data']['period'], x['docid']), reverse=True)


def archived_pdf(root, plan, kind):
    """Read a verified immutable artifact; never generate a PDF on a GET."""
    root = Path(root).resolve(); p = plan['data']
    if kind == 'final':
        token = p.get('panel_hash', '')
        if not re.fullmatch('[a-f0-9]{64}', token):
            raise ValueError('Referencia inválida')
        folder = root / 'archive' / 'issued' / str(int(p['docid'])) / token
        path = folder / 'factura.pdf'
        manifest = folder / 'manifest.json'
        if not manifest.resolve().is_relative_to(root / 'archive'):
            raise ValueError('Ruta inválida')
        expected = json.loads(manifest.read_text(encoding='utf-8'))['pdf_sha256']
    elif kind == 'draft':
        path = root / p['draft_pdf']; expected = p.get('pdf_hash')
    else:
        raise ValueError('Tipo inválido')
    if not path.resolve().is_relative_to(root / 'archive'):
        raise ValueError('Ruta inválida')
    pdf = path.read_bytes()
    if not pdf.startswith(b'%PDF') or not expected or hashlib.sha256(pdf).hexdigest() != expected:
        raise ValueError('Documento distinto del archivado; requiere revisión')
    number = p['number'].replace('/', '_')
    if not re.fullmatch(r'\d{2,}-\d{2}_20\d{2}', number):
        raise ValueError('Número inválido')
    return pdf, ('Factura_' if kind == 'final' else 'BORRADOR_') + number + '.pdf'


def pdf_available(root, row, kind):
    try:
        archived_pdf(root, row, kind)
        return True
    except (OSError, ValueError, KeyError):
        return False

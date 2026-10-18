"""Replace an unissued draft under the service's existing process lock.

No emission or mail calls. A failed replacement remains blocked; a retry reconciles
the same document, rather than creating another invoice.
"""
import hashlib
import json
import sqlite3
import subprocess
from datetime import date
from pathlib import Path

SAFE = {'review', 'approved', 'cancelled', 'blocked'}


def replace(service, panel, engine, raw):
    root = service.ROOT
    p = json.loads(raw)
    current = service.load()
    if current['status'] not in SAFE:
        raise ValueError('Solo se puede sustituir un borrador sin emisión iniciada')
    old_plan = current['data']; docid = old_plan['docid']
    if old_plan['period'] != p['period']:
        raise ValueError('El cambio debe corresponder al mismo mes')
    if service.now().date() >= date.fromisoformat(old_plan['send_date']):
        raise ValueError('La revisión anticipada está cerrada para este mes')
    with panel.db() as db:
        row = dict(db.execute('SELECT * FROM drafts WHERE docid=?', (docid,)).fetchone())
    old = json.loads(row['snapshot'])
    if old['operationId'] != p['operationId']:
        raise ValueError('Cambio de identidad o proyecto: requiere revisión manual')
    folder = root / 'revisions'; folder.mkdir(exist_ok=True)
    journal = folder / (p['operationId'] + '.json')
    pending = json.loads(journal.read_text()) if journal.exists() else None
    if (pending and pending['phase'] != 'done' and current['status'] in ('review','approved')
            and old_plan['source_hash'] == pending['new_hash'] == old['contentHash']):
        # Recovery after the new review plan committed but before journal finalization.
        pending['phase'] = 'done'
        journal.write_text(json.dumps(pending,ensure_ascii=False),encoding='utf-8')
    retry = pending and pending['phase'] != 'done'
    if retry and pending['new_hash'] != p['contentHash']:
        raise ValueError('Termina o concilia la revisión pendiente antes de recibir otra')
    if not retry and p['revision'] <= old['revision']:
        raise ValueError('Revisión antigua: vuelve a exportar los datos actuales desde Gestify')
    archive = root / 'archive' / p['period'] / p['contentHash'] / ('r' + str(p['revision']))
    archive.mkdir(parents=True, exist_ok=True)
    source = archive / 'source.json'
    if source.exists() and json.loads(source.read_text()) != p:
        raise ValueError('Fuente archivada distinta; no se sobrescribe')
    source.write_text(raw, encoding='utf-8')
    p = engine.validate_source(source)
    # Check unissued state even when recovering a response lost after a commit.
    live = service.FiscalBackend().inspect_for_revision(docid) if hasattr(service.FiscalBackend, 'inspect_for_revision') else None
    if live is None:
        from emission import ProductionAdapter
        live = ProductionAdapter(root).inspect(docid)
    if live['state'] != 10 or live['records'] or live.get('vf_sent'):
        raise ValueError('Documento emitido o con registro fiscal: no se puede sustituir')
    # Any durable fiscal intent is outside the revision path.
    outbox = root / 'emission-production.sqlite'
    if outbox.exists():
        with sqlite3.connect(outbox) as db:
            if db.execute('SELECT 1 FROM emissions WHERE docid=?', (docid,)).fetchone():
                raise ValueError('Existe intención fiscal; conciliar antes de modificar')
    cfg = engine.target(p, old['date'])
    body, marker, lines = engine.body_for(p, cfg)
    if not retry:
        # Confirm untouched previous snapshot before invalidating its approval.
        panel.current_draft(row)
    with service.db() as db:
        db.execute('UPDATE plans SET status=?,approval=NULL,detail=? WHERE id=?',
                   ('blocked', 'Actualizando borrador; requiere nueva aprobación', current['id']))
    with panel.db() as db:
        db.execute('UPDATE drafts SET approved_hash=NULL,approved_at=NULL WHERE docid=?', (docid,))
    if not retry:
        backup = panel.backup()
        pending = dict(phase='intent', docid=docid, old_hash=old['contentHash'], new_hash=p['contentHash'],
                       expected=old, backup=backup)
        journal.write_text(json.dumps(pending, ensure_ascii=False), encoding='utf-8')
    # If the PHP commit succeeded but its response was lost, verify new content.
    updated = False
    if retry:
        try:
            engine.inspect_doc(docid, p, cfg, marker, lines)
            updated = True
        except engine.ReviewRequired:
            pass
    if not updated:
        settings = json.loads((root / 'draft-revision-config.json').read_text())
        container = settings['container']
        if container not in ('gestify-fs-real-app-1', 'gestify-revision-test-app-1'):
            raise ValueError('Contenedor no permitido')
        payload = dict(docid=docid, hash=p['contentHash'], expected=pending['expected'], lines=lines,
                       observations=body['observaciones'], due_date=cfg['due_date'],
                       totals={k: p[k] for k in ('baseCents','vatCents','withholdingCents','totalCents')})
        php = (root / 'replace_draft.php').read_text().removeprefix('<?php')
        run = subprocess.run(['docker', 'exec', '-i', container, 'php', '-r', php],
                             input=json.dumps(payload), text=True, capture_output=True, timeout=60)
        if run.returncode:
            raise ValueError('No se completó la revisión. El borrador sigue sin aprobación: ' + run.stderr[-400:])
    engine.inspect_doc(docid, p, cfg, marker, lines)
    digest = hashlib.sha256(json.dumps({'body':body,'due_date':cfg['due_date']}, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    with sqlite3.connect(root / 'gestify-import.sqlite') as db:
        n = db.execute('UPDATE imports SET content_hash=?,revision=?,body_hash=?,status=? WHERE operation_id=? AND doc_id=? AND content_hash IN (?,?)',
            (p['contentHash'], p['revision'], digest, 'done', p['operationId'], docid, pending['old_hash'], p['contentHash'])).rowcount
        if n != 1:
            raise ValueError('Diario del importador incoherente; conciliar sin emitir')
    result = dict(idfactura=docid, due_date=cfg['due_date'], action='replaced')
    snap = panel.snapshot(docid, p, result); fingerprint = panel.fp(snap)
    pdf = panel.request('exportarFacturaCliente/' + str(docid))
    if not pdf.startswith(b'%PDF'):
        raise ValueError('PDF nuevo pendiente; no se habilita la aprobación')
    (archive / 'borrador.pdf').write_bytes(pdf)
    with panel.db() as db:
        db.execute('UPDATE drafts SET source=?,snapshot=?,fingerprint=?,approved_hash=NULL,approved_at=NULL WHERE docid=?',
                   (str(source),json.dumps(snap,ensure_ascii=False),fingerprint,docid))
    # Existing builder uses a hash directory. Point its PDF lookup at the revision
    # archive without overwriting any older PDF: build through a narrow override.
    service.prepare_plan_revision(docid, archive.relative_to(root).as_posix())
    pending['phase'] = 'done'
    journal.write_text(json.dumps(pending,ensure_ascii=False),encoding='utf-8')
    panel.audit('draft_replaced', {'docid':docid,'old_hash':pending['old_hash'],'new_hash':p['contentHash'],'approval':False})
    return service.load()['data']

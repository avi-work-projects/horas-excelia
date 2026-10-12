"""Candidate adapter for the existing private service, never a standalone server.

Handler must run handle() under its existing identity, Origin, CSRF and process
locks. No emission, approval or mail endpoint is exposed by this bridge.
"""
import json
import re
import tempfile
from pathlib import Path

ACTIVE = {'emitting', 'queued', 'accepted', 'sending', 'uncertain'}
ISSUED = ACTIVE | {'sent', 'email_cancelled'}


def handle(service, panel, validate_source, data):
    if data.get('action') not in ('prepare', 'status'):
        raise ValueError('Acción no permitida')
    for key in ('operationId', 'contentHash'):
        if not re.fullmatch('[a-f0-9]{64}', str(data.get(key, ''))):
            raise ValueError('Identificador no válido')
    if not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', str(data.get('period', ''))):
        raise ValueError('Periodo no válido')
    result = {k: data[k] for k in ('operationId', 'contentHash', 'period')}
    with service.db() as db:
        plans = [dict(row) for row in db.execute('SELECT * FROM plans ORDER BY id DESC')]
    for row in plans:
        row['data'] = json.loads(row['data'])
    with panel.db() as db:
        drafts = [dict(row) for row in db.execute('SELECT * FROM drafts')]
    snapshots = [json.loads(row['snapshot']) for row in drafts]
    matching = next((s for s in snapshots if s['operationId'] == data['operationId'] and s['contentHash'] == data['contentHash'] and s['period'] == data['period']), None)
    plan = next((r for r in plans if r['data']['period'] == data['period'] and r['data']['source_hash'] == data['contentHash']), None) if matching else None
    state = plan['status'] if plan else 'uncertain' if matching else 'different' if any(s['period'] == data['period'] for s in snapshots) else 'missing'
    if data['action'] == 'status':
        return result | {'state': state}
    raw = data.get('source')
    if not isinstance(raw, str) or len(raw.encode('utf-8')) > 1024 * 1024:
        raise ValueError('JSON no válido o demasiado grande')
    # Reuse the exact existing JS hash and arithmetic validator before any mutation.
    with tempfile.TemporaryDirectory(dir=service.ROOT) as tmp:
        path = Path(tmp) / 'source.json'
        path.write_text(raw, encoding='utf-8')
        source = validate_source(path)
    if any(source[k] != data[k] for k in result):
        raise ValueError('La preparación no corresponde a la solicitud')
    if matching:
        # Local revisions increase when edits are undone. Validated identical
        # content is already registered: keep the original plan and approval.
        # A lost reply or repeated send never reimports or sends mail.
        return result | {'state': state}
    if any(r['status'] in ACTIVE or (r['data']['period'] == data['period'] and r['status'] in ISSUED) for r in plans):
        raise ValueError('Hay una emisión o correo pendiente, o este mes ya está emitido')
    if any(r['status'] == 'approved' and r['data']['period'] != data['period'] for r in plans):
        raise ValueError('Hay otro mes aprobado; revisa el plan activo')
    if state == 'different':
        # Existing importer refuses changed revisions. Invalidate approvals, leave
        # original invoice intact and require reconciliation in the existing UI.
        with service.db() as db:
            for row in plans:
                if row['data']['period'] == data['period']:
                    db.execute('UPDATE plans SET status=?,approval=NULL,detail=? WHERE id=?',
                               ('blocked', 'Nueva revisión de Gestify; conciliar antes de aprobar', row['id']))
        with panel.db() as db:
            for row, snapshot in zip(drafts, snapshots):
                if snapshot['period'] == data['period']:
                    db.execute('UPDATE drafts SET approved_hash=NULL,approved_at=NULL WHERE docid=?', (row['docid'],))
        return result | {'state': 'blocked'}
    service.import_json(raw, notify_review=False)
    current = service.load()
    if current['data']['source_hash'] != data['contentHash'] or current['data']['period'] != data['period']:
        raise ValueError('Importación sin confirmar: consultar estado')
    return result | {'state': current['status']}


def receiver(origin, csrf):
    """Only the configured public PWA origin can talk to this authenticated page."""
    if not re.fullmatch(r'https://[a-z0-9-]+\.github\.io', origin):
        raise ValueError('Configura el origen HTTPS de GitHub Pages')
    script = (Path(__file__).with_name('receiver.js')).read_text(encoding='utf-8')
    config = json.dumps({'origin': origin, 'csrf': csrf}).replace('<', '\\u003c')
    template = Path(__file__).with_name('receiver.html').read_text(encoding='utf-8')
    return template.replace('/*BRIDGE_CONFIG*/', config).replace('/*BRIDGE_SCRIPT*/', script)

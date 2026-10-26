"""Minimal authenticated read-only status. No runner, SMTP or fiscal imports."""
import json
import re
from datetime import date as calendar_date
from pathlib import Path
from urllib.parse import urlsplit, parse_qs


def month_status(period, items):
    if not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', period):
        raise ValueError('Periodo no válido')
    selected = [item for item in items if item['row']['data']['period'] == period]
    result = dict(period=period, state='missing', generated=False, issued=False,
                  scheduled=False, sent=False, scheduledDate=None)
    if not selected:
        return result
    result['generated'] = True
    if len(selected) != 1:
        return result | {'state': 'multiple'}
    item = selected[0]
    state = item['row']['status']
    issued = bool(item['accepted'])
    sent = item['mail'] == 'Enviado'
    date = item['row']['data'].get('send_date')
    try:
        date = calendar_date.fromisoformat(date).isoformat()
    except (TypeError, ValueError):
        date = None
    scheduled = item['mail'] == 'Programado' and date is not None
    public = ('sent' if sent else 'processing' if state in ('emitting', 'queued', 'sending')
              else 'attention' if state in ('blocked', 'uncertain', 'cancelled', 'email_cancelled') or item['mail'] == 'Requiere revisión'
              else 'scheduled' if scheduled else 'issued' if issued else 'draft')
    return result | dict(state=public, issued=issued, sent=sent, scheduled=scheduled,
                         scheduledDate=date if scheduled else None)


def read_month(root, period):
    # Reuse the service's catalog, which opens existing SQLite files in mode=ro.
    if not all((Path(root) / name).is_file() for name in ('service.sqlite', 'workflow.sqlite')):
        raise RuntimeError('Registro no disponible')
    from invoice_catalog import catalog
    return month_status(period, catalog(root))


def reply_status(handler, root, origin, preflight=False):
    parsed = urlsplit(handler.path)
    if parsed.path not in ('/gestify-status', '/facturas/gestify-status') or not origin:
        return handler.reply(404, 'No encontrado')
    if not handler.allowed() or handler.headers.get('Origin') != origin:
        return handler.reply(403, 'Acceso no permitido')
    cors = {'Access-Control-Allow-Origin': origin, 'Vary': 'Origin'}
    if preflight:
        if handler.headers.get('Access-Control-Request-Method') != 'GET' or handler.headers.get('Access-Control-Request-Headers', '').lower() not in ('', 'accept'):
            return handler.reply(403, 'Consulta no permitida')
        cors |= {'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '600'}
        if handler.headers.get('Access-Control-Request-Private-Network') == 'true':
            cors['Access-Control-Allow-Private-Network'] = 'true'
        return handler.reply(204, '', extra=cors)
    query = parse_qs(parsed.query, keep_blank_values=True)
    if set(query) != {'period'} or len(query['period']) != 1 or not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', query['period'][0]):
        return handler.reply(400, json.dumps({'error': 'Periodo no válido'}), 'application/json', extra=cors)
    try:
        data = read_month(root, query['period'][0])
    except Exception:
        return handler.reply(503, json.dumps({'error': 'Estado no disponible'}), 'application/json', extra=cors)
    return handler.reply(200, json.dumps(data), 'application/json', extra=cors)

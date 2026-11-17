"""Bounded SSH-side bridge to the existing invoice and hours HTTP services.

The mini authenticates its own session/Origin/CSRF before calling this adapter.
Only fixed loopback services are contacted. Their original handlers retain all
approval fingerprints, process locks, durable jobs and emission/mail decisions.
No service is started, no runner is ticked and no GET scans Outlook.
"""
import ast
import base64
import http.client
import json
from pathlib import Path
import re
from urllib.parse import parse_qs, urlsplit


MONTH = r'20\d\d-(?:0[1-9]|1[0-2])'
UUID = r'[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}'
TOKEN = r'[A-Za-z0-9_-]{20,100}'
MAX_RESPONSE = 16 * 1024 * 1024
BILLING_POST = {'/facturas/approve', '/facturas/cancel', '/facturas/upload',
                '/facturas/review-mail'}
HOURS_POST = {'/horas/calendar-days', '/horas/calendar-refresh',
              '/horas/preview', '/horas/simulate', '/horas/commit'}


def route(url, method):
    """Reject URLs, traversal, duplicate/unknown parameters and scan-on-GET APIs."""
    if not isinstance(url, str) or len(url) > 1500 or '\\' in url:
        raise ValueError('Ruta no disponible')
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc or parsed.fragment or '%' in parsed.path or not parsed.path.startswith('/'):
        raise ValueError('Ruta no disponible')
    path, query = parsed.path, parse_qs(parsed.query, keep_blank_values=True)
    if any(len(values) != 1 for values in query.values()):
        raise ValueError('Consulta no válida')
    if method == 'POST':
        if query:
            raise ValueError('Acción no disponible')
        if path in BILLING_POST:
            return 'billing'
        if path in HOURS_POST:
            return 'hours'
        raise ValueError('Acción no disponible')
    if method != 'GET':
        raise ValueError('Método no disponible')
    if path in ('/facturas', '/facturas/', '/facturas/revision', '/facturas/ajustes'):
        if not query:
            return 'billing'
    elif path == '/facturas/historico':
        if (set(query) <= {'year', 'state'}
                and re.fullmatch(r'all|20\d\d', query.get('year', ['all'])[0])
                and query.get('state', ['all'])[0] in ('all', 'issued', 'draft')):
            return 'billing'
    elif re.fullmatch(r'/facturas/(?:factura/[1-9]\d*|documento/[1-9]\d*/(?:draft|final))', path):
        if not query:
            return 'billing'
    elif path in ('/facturas/gestify-month', '/facturas/programacion'):
        if set(query) == {'period'} and re.fullmatch(MONTH, query['period'][0]):
            return 'billing'
    elif path in ('/horas/calendario', '/horas/calendar-data'):
        if (not query and path == '/horas/calendario') or (set(query) == {'period'} and re.fullmatch(MONTH, query['period'][0])):
            return 'hours'
    elif re.fullmatch('/horas/jobs/'+UUID, path):
        if not query:
            return 'hours'
    raise ValueError('Ruta no disponible')


def endpoint(root, kind):
    """Read only public routing/identity fields; never load a mail password."""
    root = Path(root)
    if kind == 'billing':
        tree = ast.parse((root/'service.py').read_text(encoding='utf-8-sig'))
        fields = {}
        for node in tree.body:
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id in ('OWNER', 'ORIGIN'):
                        fields[target.id] = ast.literal_eval(node.value)
        result = dict(port=8766, owner=fields.get('OWNER'), origin=fields.get('ORIGIN'),
                      csrf_page='/facturas/ajustes')
    else:
        config = json.loads((root.parent/'gestify-outlook/hours.json').read_text(encoding='utf-8-sig'))
        result = dict(port=config['port'], owner=config.get('owner'),
                      origin=config.get('private_origin'), csrf_page='/horas/calendario')
    parsed = urlsplit(str(result['origin']))
    if (type(result['port']) is not int or not 1024 <= result['port'] <= 65535
            or parsed.scheme != 'https' or not parsed.hostname or parsed.username
            or parsed.password or parsed.path not in ('', '/') or parsed.query or parsed.fragment
            or not isinstance(result['owner'], str) or '\n' in result['owner'] or '\r' in result['owner']):
        raise ValueError('La conexión privada no está configurada')
    result['host'] = parsed.netloc
    return result


def exchange(target, method, url, data=None, csrf=None):
    headers = {'Host': target['host'], 'Tailscale-User-Login': target['owner'],
               'Origin': target['origin'], 'Accept': '*/*'}
    body = None
    if method == 'POST':
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        limit = 1_499_999 if url.startswith('/facturas/') else 131072
        if len(body) > limit:
            raise ValueError('La petición supera el tamaño permitido')
        headers.update({'Content-Type': 'application/json', 'X-CSRF': csrf})
    connection = http.client.HTTPConnection('127.0.0.1', target['port'], timeout=45)
    try:
        connection.request(method, url, body=body, headers=headers)
        response = connection.getresponse()
        raw = response.read(MAX_RESPONSE+1)
        if len(raw) > MAX_RESPONSE:
            raise ValueError('La respuesta supera el tamaño permitido')
        return response.status, raw, response.getheader('Content-Type', ''), dict(response.getheaders())
    except (OSError, http.client.HTTPException):
        raise ValueError('No se ha recibido respuesta del servicio. Consulta el estado antes de repetir una aprobación o un envío.') from None
    finally:
        connection.close()


def csrf_tokens(html):
    return set(re.findall(r'["\']csrf["\']\s*:\s*["\']('+TOKEN+r')["\']', html))


def local_fragment(html, local_csrf):
    """Retain dialogs, symbols and page scripts, but discard remote chrome."""
    if not re.fullmatch(TOKEN, str(local_csrf)):
        raise ValueError('Sesión local no válida')
    for token in csrf_tokens(html):
        html = html.replace(token, local_csrf)
    main = re.search(r'<main\b[^>]*>(.*?)</main>', html, re.S|re.I)
    if not main:
        raise ValueError('Pantalla privada no compatible')
    head = html[:main.start()]
    styles = ''.join(re.findall(r'<style\b[^>]*>(.*?)</style>', head, re.S|re.I))
    # Root/body rules stay outside this scope; shared component styles remain.
    styles = '<style>@scope (.billing-content){'+styles+'}</style>'
    body_head = head.split('<body', 1)[-1] if '<body' in head else ''
    symbols = ''.join(svg for svg in re.findall(r'<svg\b[^>]*>.*?</svg>', body_head, re.S|re.I)
                      if '<symbol' in svg)
    tail = html[main.end():]
    dialogs = ''.join(re.findall(r'<dialog\b[^>]*>.*?</dialog>', tail, re.S|re.I))
    scripts = ''.join(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>.*?</script>', tail, re.S|re.I))
    content = main.group(1)
    # Account setup remains on the original private service; no password form
    # or monitor action is exposed through this adapter.
    content = re.sub(r'<a\b[^>]*href=["\']/facturas/(?:mail-setup|monitor)["\'][^>]*>.*?</a>', '', content, flags=re.S|re.I)
    return styles+symbols+content+dialogs+scripts


def packed(status, raw, mime, headers=None):
    return dict(status=status, body=base64.b64encode(raw).decode('ascii'),
                mime=mime, headers=headers or {})


def dispatch(root, request, transport=exchange):
    """billing_get -> packed response; billing_post -> parsed existing result."""
    action = request.get('action')
    method = {'billing_get': 'GET', 'billing_post': 'POST'}.get(action)
    if method is None:
        raise ValueError('Operación no disponible')
    url = request.get('url')
    kind = route(url, method)
    target = endpoint(root, kind)
    if method == 'POST':
        data = request.get('data')
        if not isinstance(data, dict):
            raise ValueError('Solicitud no válida')
        # Require explicit current revision, rather than legacy default-plan
        # selection. The upstream action rechecks the fingerprint under lock.
        if url in ('/facturas/approve', '/facturas/cancel', '/facturas/review-mail'):
            if type(data.get('planId')) is not int or data['planId'] <= 0 or not re.fullmatch(r'[a-f0-9]{64}', str(data.get('hash', ''))):
                raise ValueError('Vuelve a abrir la factura y revisa su versión')
            if url.endswith('/cancel') and not isinstance(data.get('expectedState'), str):
                raise ValueError('Vuelve a abrir el estado actual de la factura')
        state, page, mime, _ = transport(target, 'GET', target['csrf_page'])
        tokens = csrf_tokens(page.decode('utf-8')) if state == 200 and 'text/html' in mime else set()
        if len(tokens) != 1:
            raise ValueError('No se ha podido iniciar la acción privada. Recarga la vista.')
        state, raw, mime, _ = transport(target, 'POST', url, data, tokens.pop())
        if 'application/json' not in mime:
            raise ValueError('La acción no se ha confirmado. Comprueba el estado antes de repetir.')
        try:
            result = json.loads(raw)
        except (ValueError, UnicodeError):
            raise ValueError('Respuesta incompleta. Comprueba el estado antes de repetir.') from None
        if not isinstance(result, dict):
            raise ValueError('Respuesta privada no válida')
        if not 200 <= state < 300:
            raise ValueError(result.get('message') or result.get('error') or 'La acción no se ha confirmado')
        return result
    state, raw, mime, headers = transport(target, 'GET', url)
    outgoing = {'Content-Disposition': v for k, v in headers.items() if k.lower() == 'content-disposition'}
    if 300 <= state < 400:
        location = next((v for k, v in headers.items() if k.lower() == 'location'), '')
        route(location, 'GET')
        outgoing['Location'] = location
    elif 'text/html' in mime and state == 200:
        raw = local_fragment(raw.decode('utf-8'), request.get('csrf')).encode('utf-8')
    return packed(state, raw, mime, outgoing)

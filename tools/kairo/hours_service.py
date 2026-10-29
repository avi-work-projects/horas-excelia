"""Candidate private hours service. Review and simulation; real mail stays disabled."""
import argparse
import copy
import json
import secrets
import tempfile
import uuid
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from hours_model import MADRID, inventory_signature, scope, validate_request
from hours_store import Store
from hours_jobs import Jobs
from outlook_hours import OutlookReader


def simulate(store, plan_id, reader, now, updates):
    with store.db() as db:
        saved = db.execute('SELECT * FROM plans WHERE id=?', (plan_id,)).fetchone()
    if not saved:
        raise ValueError('Concilia antes de simular')
    request = json.loads(saved['payload'])
    observed = reader(request)
    if datetime.fromisoformat(saved['expires']) <= now or inventory_signature(observed) != saved['signature']:
        raise ValueError('La revisión ha cambiado o caducado; concilia de nuevo')
    with tempfile.TemporaryDirectory(dir=store.root) as temp:
        sandbox = Store(temp)
        # Uncertain real attempts also block simulation; it cannot teach an
        # unsafe recovery path. Copy only ledger entries, not credentials.
        with sandbox.db() as db:
            for row in store.ledger().values():
                db.execute('INSERT INTO weeks VALUES (?,?,?,?,?,?)',
                           tuple(row[k] for k in ('week','state','plan','record_id','content_hash','schedule')))
        plan = sandbox.preview(request, observed, now)
        local = copy.deepcopy(observed)

        def read(_request): return copy.deepcopy(local)

        def write(_request, row):
            local['records'] = [r for r in local['records'] if r.get('week') != row['key']]
            local['records'].append(dict(week=row['key'], id=row.get('recordId', 'simulation-'+row['key']),
                                         state='scheduled', schedule=row['schedule'], contentHash=row['contentHash']))

        result = sandbox.commit(plan['planId'], read, write, now, allow_writes=True, updates=updates)
        return {'simulation': True, 'results': result['results']}


def make_handler(config, store, reader, clock=lambda:datetime.now(MADRID)):
    csrf = secrets.token_urlsafe(32)
    private_origin = config['private_origin']
    app_origin = config['app_origin']
    private_host = urlsplit(private_origin).netloc
    source = Path(__file__).parent
    allow_writes=config.get('writes_enabled') is True
    cache = {}
    latest = {}

    def snapshots(request, inventory):
        if not inventory.get('complete') or not inventory.get('accountVerified'):
            raise RuntimeError('Lectura incompleta')
        ledger = store.ledger()
        result = []
        for period in request.get('periods', [request['period']]):
            rows = []
            for key in scope(period):
                found = [r for r in inventory['records'] if r.get('week') == key]
                state = 'missing' if not found else 'duplicate' if len(found)>1 else found[0]['state']
                if state != 'sent' and ledger.get(key,{}).get('state') in ('reserved','uncertain'):
                    state = 'uncertain'
                row = dict(key=key, state=state)
                if state == 'scheduled':
                    row.update(days=found[0].get('days'), schedule=found[0].get('schedule'))
                rows.append(row)
            value = dict(period=period, checkedAt=clock().isoformat(), verified=True, rows=rows)
            jobs.remember(config.get('sender', inventory.get('account','')), value)
            result.append(value)
        return result

    def current(request):
        # A successful Schedule send can leave Draft in the cached DOM.
        if hasattr(reader,'invalidate'):reader.invalidate()
        inventory = reader(request)
        if inventory.get('complete') and inventory.get('accountVerified'):
            latest[request['period']] = inventory
            snapshots(request, inventory)
        return inventory

    def observed(request, force=False):
        now = clock()
        old = cache.get(request['period'])
        if force or not old or (now-old[0]).total_seconds() >= config.get('cache_seconds',30):
            inventory=current(request)
            cache[request['period']] = (clock(), inventory)
        return copy.deepcopy(cache[request['period']][1])

    def execute(kind, payload):
        now = clock()
        if kind == 'status':
            if not payload.get('refresh',True):
                payload['periods']=[p for p in payload['periods'] if not jobs.fact(config['sender'],p)]
            if not payload['periods']:
                return {'periods':[jobs.fact(config['sender'],p) for p in payload['requestedPeriods']]}
            with store.exclusive():
                inventory = current(payload)
            if not inventory.get('complete') or not inventory.get('accountVerified'):
                raise RuntimeError('Lectura incompleta')
            return {'periods': [jobs.fact(config['sender'], p) for p in payload.get('requestedPeriods',payload['periods'])]}
        if kind == 'preview':
            with store.exclusive():
                force = payload.pop('refresh', False) is True
                return store.preview(payload, observed(payload, force), now) | {'allowWrites':allow_writes}
        if kind == 'simulate':
            with store.exclusive():
                return simulate(store, payload['planId'], observed, now, payload.get('updates', []))
        if kind == 'commit':
            from outlook_hours_writer import OutlookWriter
            with store.db() as db:
                saved = db.execute('SELECT payload FROM plans WHERE id=?', (payload['planId'],)).fetchone()
            if not saved:
                raise ValueError('Revisión inexistente')
            request = json.loads(saved['payload'])
            result = store.commit(payload['planId'], current,
                                  OutlookWriter(config['sender'], reader, enabled=True), now,
                                  allow_writes=allow_writes, updates=payload.get('updates', []), clock=clock)
            cache.clear()
            # The confirming browser read happens while the ledger is still
            # reserved. Reapply the completed ledger without another Outlook scan.
            result['status'] = snapshots(request, latest[request['period']])[0] if request['period'] in latest else None
            return result
        raise ValueError('Trabajo no válido')

    jobs = Jobs(store, execute)
    jobs.start()

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_args): pass

        def allowed(self):
            if self.headers.get('Host') != private_host:
                return False
            if config.get('local_review'):
                return self.client_address[0] == '127.0.0.1' and urlsplit(private_origin).hostname == '127.0.0.1'
            return bool(config.get('owner')) and self.headers.get('Tailscale-User-Login') == config['owner']

        def reply(self, status, data, content_type='application/json', cors=False, extra=None):
            body = b'' if status == 204 else (json.dumps(data, ensure_ascii=False) if content_type == 'application/json' else data).encode()
            self.send_response(status)
            for key, value in {'Content-Type': content_type+'; charset=utf-8', 'Cache-Control':'no-store',
                               'X-Content-Type-Options':'nosniff',
                               'Content-Security-Policy':"frame-ancestors "+(app_origin if status == 200 and content_type == 'text/html' else "'none'"),
                               'Referrer-Policy':'no-referrer', 'Content-Length':str(len(body))}.items():
                self.send_header(key, value)
            if cors:
                self.send_header('Access-Control-Allow-Origin', app_origin)
                self.send_header('Vary', 'Origin')
            for key, value in (extra or {}).items(): self.send_header(key, value)
            self.end_headers(); self.wfile.write(body)

        def route(self):
            path = urlsplit(self.path).path
            return path[6:] if path.startswith('/horas/') else path

        def do_GET(self):
            if not self.allowed(): return self.reply(403, {'error':'Acceso no permitido'})
            if self.route() == '/auth-status':
                if self.headers.get('Origin') != app_origin:
                    return self.reply(403, {'error':'Origen no permitido'})
                from outlook_auth import public_state
                return self.reply(200, public_state(store.root), cors=True)
            if self.route().startswith('/jobs/'):
                origin = self.headers.get('Origin')
                if origin not in (None, private_origin, app_origin):
                    return self.reply(403, {'error':'Origen no permitido'})
                try:
                    identifier = str(uuid.UUID(self.route().split('/')[-1]))
                    return self.reply(200, jobs.get(identifier), cors=origin == app_origin)
                except (KeyError, ValueError):
                    return self.reply(404, {'error':'Trabajo no encontrado'}, cors=origin == app_origin)
            if self.route() in ('', '/'):
                template = (source/'hours_receiver.html').read_text(encoding='utf-8')
                script = (source/'hours_receiver.js').read_text(encoding='utf-8')
                settings = json.dumps(dict(origin=app_origin, csrf=csrf, allowWrites=allow_writes)).replace('<','\\u003c')
                return self.reply(200, template.replace('/*HOURS_CONFIG*/', settings).replace('/*HOURS_SCRIPT*/', script), 'text/html')
            if self.route() == '/status':
                if self.headers.get('Origin') != app_origin:
                    return self.reply(403, {'error':'Origen no permitido'})
                query = parse_qs(urlsplit(self.path).query)
                try:
                    if query.get('background') == ['1']:
                        if set(query) - {'period','background','refresh','audit'} or len(query.get('period',[])) != 1:
                            raise ValueError()
                        period = query['period'][0]
                        scope(period)
                        periods = [period]
                        if query.get('audit') == ['1']:
                            number = int(period[:4])*12+int(period[5:])-1
                            periods = [f'{value//12:04d}-{value%12+1:02d}' for value in (number-1,number,number+1)]
                        known = [jobs.fact(config['sender'], p) for p in periods]
                        if all(known) and query.get('refresh') != ['1']:
                            return self.reply(200, {'phase':'done','result':{'periods':known}}, cors=True)
                        identity = 'status:'+','.join(periods)
                        if query.get('refresh') == ['1']:
                            identity += ':'+str(uuid.uuid4())
                        missing=periods if query.get('refresh')==['1'] else [p for p,value in zip(periods,known) if not value]
                        return self.reply(202, jobs.submit('status', {'period':period,'periods':missing,'requestedPeriods':periods,'refresh':query.get('refresh')==['1']}, identity), cors=True)
                    if set(query) != {'period'} or len(query['period']) != 1: raise ValueError()
                    keys = scope(query['period'][0])
                    with store.exclusive(): inventory = observed({'period':query['period'][0]})
                    if not inventory.get('complete') or not inventory.get('accountVerified'):
                        raise RuntimeError()
                    rows = []
                    ledger = store.ledger()
                    for key in keys:
                        found = [r for r in inventory['records'] if r.get('week') == key]
                        state = 'missing' if not found else 'duplicate' if len(found)>1 else found[0]['state']
                        if state != 'sent' and ledger.get(key,{}).get('state') in ('reserved','uncertain'):
                            state = 'uncertain'
                        row=dict(key=key,state=state)
                        if state=='scheduled':row.update(days=found[0].get('days'),schedule=found[0].get('schedule'))
                        rows.append(row)
                    return self.reply(200, dict(period=query['period'][0], checkedAt=clock().isoformat(), rows=rows), cors=True)
                except Exception:
                    return self.reply(503, {'error':'Estado de Outlook sin confirmar'}, cors=True)
            return self.reply(404, {'error':'No encontrado'})

        def do_OPTIONS(self):
            if not self.allowed() or (self.route() not in ('/status','/auth-status') and not self.route().startswith('/jobs/')) or self.headers.get('Origin') != app_origin or self.headers.get('Access-Control-Request-Method') != 'GET' or self.headers.get('Access-Control-Request-Headers','').lower() not in ('','accept'):
                return self.reply(403, {'error':'Consulta no permitida'})
            extra={'Access-Control-Allow-Methods':'GET','Access-Control-Max-Age':'600'}
            if self.headers.get('Access-Control-Request-Private-Network') == 'true':extra['Access-Control-Allow-Private-Network']='true'
            return self.reply(204, '', cors=True, extra=extra)

        def do_POST(self):
            if not self.allowed() or self.headers.get('Origin') != private_origin or self.headers.get('X-CSRF') != csrf:
                return self.reply(403, {'error':'Acceso no permitido'})
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= 131072 or self.headers.get('Content-Type','').split(';')[0] != 'application/json':
                    raise ValueError()
                data = json.loads(self.rfile.read(size))
                now = clock()
                background = data.pop('background', False) is True
                if background and self.route() in ('/preview', '/simulate', '/commit'):
                    kind = self.route()[1:]
                    if kind == 'preview':
                        validate_request(data)
                    elif not isinstance(data.get('planId'), str) or len(data['planId']) > 80:
                        raise ValueError()
                    if kind == 'commit' and (not allow_writes or data.get('sourceVerified') is not True):
                        return self.reply(403, {'error':'Revisa los datos antes de programar'})
                    identity = 'commit:'+data['planId'] if kind == 'commit' else kind+':'+str(uuid.uuid4())
                    return self.reply(202, jobs.submit(kind, data, identity))
                if self.route() == '/preview':
                    validate_request(data)
                    with store.exclusive():
                        force = data.pop('refresh',False) is True
                        result = store.preview(data, observed(data, force), now)
                    return self.reply(200, result | {'allowWrites':allow_writes})
                if self.route() == '/simulate':
                    with store.exclusive():
                        result = simulate(store, data['planId'], observed, now, data.get('updates',[]))
                    return self.reply(200, result)
                if self.route() == '/commit':
                    if not allow_writes or data.get('sourceVerified') is not True:
                        return self.reply(403, {'error':'Revisión previa: la programación real está deshabilitada'})
                    from outlook_hours_writer import OutlookWriter
                    result=store.commit(data['planId'],current,OutlookWriter(config['sender'],reader,enabled=True),now,allow_writes=True,updates=data.get('updates',[]),clock=clock)
                    cache.clear()
                    return self.reply(200,result)
                return self.reply(404, {'error':'No encontrado'})
            except (ValueError, KeyError, TypeError):
                return self.reply(400, {'error':'Solicitud no válida; vuelve a conciliar'})
            except Exception:
                return self.reply(503, {'error':'No se ha confirmado la operación. Concilia antes de repetir'})
    Handler.jobs = jobs
    return Handler


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, required=True)
    args = parser.parse_args()
    cfg = json.loads(args.config.read_text(encoding='utf-8'))
    if urlsplit(cfg['private_origin']).scheme != 'https' and not cfg.get('local_review'):
        raise SystemExit('El servicio privado debe usar HTTPS mediante Tailscale')
    server = ThreadingHTTPServer(('127.0.0.1', int(cfg.get('port',8770))),
                                 make_handler(cfg, Store(cfg['state_dir']), OutlookReader(cfg['sender'])))
    server.serve_forever()

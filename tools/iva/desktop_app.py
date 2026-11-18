"""Mini accounting app. Loopback only; all collection/sync starts with a POST.

The canonical archive is local. The existing Kairo review queue remains shared;
opening a book never contacts mail, Amazon, or the remote accounting worker.
"""
import argparse
import base64
from datetime import datetime
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import secrets
import socket
import sys
import threading
from urllib.parse import parse_qs, urlsplit
import urllib.request
import webbrowser

from expense_workflow import atomic
from modelos_ui import e, button
from desktop_transport import call

BASE = '/facturas/modelos'
ASSETS = Path(__file__).with_name('desktop_assets')
THEME_ICONS = ('<svg class="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>'
               '<svg class="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true"><path d="M20 14a8.5 8.5 0 0 1-10-11 9 9 0 1 0 10 11Z"/></svg>')


def fragment(html):
    """Reuse the existing screen content, without a second header or theme."""
    if '<html' not in html.lower():
        return html
    match = re.search(r'<main\b[^>]*>(.*?)</main>', html, re.S)
    if not match:
        raise ValueError('La pantalla no contiene un panel compatible')
    styles = ''.join(re.findall(r'<style\b[^>]*>.*?</style>', html[:match.start()], re.S))
    scripts = ''.join(re.findall(r'<script\b[^>]*>.*?</script>', html[match.end():], re.S))
    return styles+match.group(1)+scripts


class Application:
    def __init__(self, path, remote=call):
        self.path = Path(path)
        self.settings = json.loads(self.path.read_text(encoding='utf-8-sig'))
        self.config = json.loads(Path(self.settings['models_config']).read_text(encoding='utf-8-sig'))
        self.remote = remote
        self.csrf = secrets.token_urlsafe(32)
        self.session = secrets.token_urlsafe(32)
        self.launch = secrets.token_urlsafe(32)
        self.mutex = threading.Lock()
        self.state = Path(self.settings['state_root'])
        self.port = int(self.settings.get('port', 18766))
        self.origin = 'http://127.0.0.1:'+str(self.port)

    def shell(self, content, url, title='Contabilidad'):
        parsed = urlsplit(url)
        query = parse_qs(parsed.query)
        active = query.get('vista', ['modelos' if 'periodo' in query or 'paso' in query else 'resumen'])[0]
        if parsed.path.startswith(BASE+'/gastos'):
            active = 'gastos'
        elif parsed.path.startswith(BASE+'/preparacion') or parsed.path.startswith(BASE+'/cierre') or parsed.path.startswith(BASE+'/aeat'):
            active = 'modelos'
        elif parsed.path == '/recoger':
            active = 'recoger'
        elif parsed.path == '/modulos':
            active = 'modulos'
        elif parsed.path == '/ayuda':
            active = 'ayuda'
        elif parsed.path.startswith('/renta'):
            active = 'renta'
        elif parsed.path.startswith('/horas'):
            active = 'programacion'
        elif parsed.path.startswith('/facturas') and not parsed.path.startswith(BASE):
            active = 'facturas'
        entries = [('resumen','Resumen','◫',BASE+'?vista=resumen'),
                   ('facturas','Facturas','▱','/facturas/'),
                   ('programacion','Programación','◷','/horas/calendario'),
                   ('ingresos','Ingresos','↗',BASE+'?vista=ingresos'),
                   ('gastos','Gastos','↙',BASE+'?vista=gastos'),
                   ('libros','Libros','▤',BASE+'?vista=libros'),
                   ('modelos','Modelos','▧',BASE+'?vista=modelos'),
                   ('renta','Renta','◷',BASE+'?vista=renta')]
        nav = ''.join('<a href="'+url+'"'+(' aria-current="page"' if key == active else '')+'><span aria-hidden="true">'+icon+'</span>'+label+'</a>' for key,label,icon,url in entries)
        # Each navigation gets the theme and critical chrome in the initial HTML.
        # No unstyled frame, delayed icon, or logo fetch on a no-store response.
        theme = (ASSETS/'theme.js').read_text(encoding='utf-8')
        css = (ASSETS/'desktop.css').read_text(encoding='utf-8')
        wordmark = 'data:image/png;base64,'+base64.b64encode((ASSETS/'wordmark-mask.png').read_bytes()).decode()
        css += '.brand-mark{mask-image:url('+wordmark+');-webkit-mask-image:url('+wordmark+')}'
        script = (ASSETS/'desktop.js').read_text(encoding='utf-8')
        return '''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f3f7ef"><meta name="referrer" content="no-referrer"><title>'''+e(title)+''' · Kairo en el mini</title><script>'''+theme+'''</script><style>'''+css+'''</style><link rel="icon" href="/assets/icon.png"></head>
<body data-csrf="'''+e(self.csrf)+'''"><aside class="sidebar"><a class="brand" href="/" aria-label="Kairo · Resumen"><span class="brand-mark" aria-hidden="true"></span></a><div class="workspace-label">TU ESPACIO <span>Mini</span></div><nav aria-label="Secciones">'''+nav+'''</nav><div class="sidebar-bottom"><a href="/recoger"'''+(' aria-current="page"' if active == 'recoger' else '')+'''>↓ &nbsp; Recoger facturas</a><a href="/modulos"'''+(' aria-current="page"' if active == 'modulos' else '')+'''>⋮ &nbsp; Mapa de módulos</a><a href="/ayuda"'''+(' aria-current="page"' if active == 'ayuda' else '')+'''>? &nbsp; Cómo funciona</a><p><span class="dot"></span> Contabilidad bajo petición</p></div></aside>
<div class="workspace"><header class="topbar"><span>Tu espacio de trabajo <span class="muted">/ Ordenador mini</span></span><div><button id="refresh-data" type="button">Actualizar datos</button><button id="theme-toggle" type="button" aria-label="Cambiar tema">'''+THEME_ICONS+'''</button></div></header><div id="action-message" class="action-message" role="status" aria-live="polite" hidden></div><main class="desktop-main k-main">'''+fragment(content)+'''</main><footer class="desktop-footer"><span>Archivo único · Documentos originales conservados</span><button id="check-state" type="button">Ver estado de actualización</button></footer></div><script>'''+script+'''</script></body></html>'''

    def assistant_store(self):
        from assistant_requests import Requests
        return Requests(self.state,self.config['archive_root'])

    def renta_store(self):
        from renta_documents import Store
        return Store(self.state,self.config['archive_root'],2026)

    def mail_accounts(self):
        accounts = self.settings.get('accounts',[])
        accounts = accounts if isinstance(accounts,list) else []
        return list(dict.fromkeys(a for a in accounts+[self.settings.get('account','')] if isinstance(a,str) and a))

    def renta_search(self, data):
        store = self.renta_store()
        catalog = store.read()
        item = next((x for x in catalog['items'] if x['id']==data.get('item')),None)
        if item is None or data.get('kind') not in ('mail','web'):
            raise ValueError('Selecciona una partida y dónde buscar')
        accounts = self.mail_accounts()
        account = data.get('account','all')
        if account == 'all':
            account = 'Todos los correos conectados: '+', '.join(accounts)
        elif account not in accounts:
            raise ValueError('Selecciona una de las cuentas configuradas')
        linked = [d for d in catalog['documents'] if d.get('item_id')==item['id']]
        unassigned = [d for d in catalog['documents'] if not d.get('item_id')]
        candidates = linked + unassigned
        payload = dict(year=2026,partida=item['label'],nota=item.get('note',''),
                       catalogo_completo=str(store.path.resolve()),documentos_totales=len(catalog['documents']),
                       documentos_de_partida=len(linked),documentos_sin_clasificar=len(unassigned),
                       documentos_omitidos=len(candidates),documentos_conocidos=[],
                       aviso='La muestra prioriza esta partida y después los PDF sin clasificar. Consulta el catálogo completo para comprobar todos los documentos; una omisión no significa que falte la factura.')
        def encode(value):
            return json.dumps(value,ensure_ascii=False)
        context = encode(payload)
        if max(len(context),len(context.encode('utf-8'))) > 16000:
            raise ValueError('La referencia de esta partida es demasiado extensa para el encargo. Revisa su nota en el seguimiento documental.')
        for document in candidates:
            if len(payload['documentos_conocidos']) >= 60:
                break
            known = payload['documentos_conocidos'] + [dict(path=document['path'],sha256=document['sha256'])]
            candidate = dict(payload,documentos_conocidos=known,documentos_omitidos=len(candidates)-len(known))
            encoded = encode(candidate)
            if len(encode(known).encode('utf-8')) > 12000 or max(len(encoded),len(encoded.encode('utf-8'))) > 16000:
                continue
            payload, context = candidate, encoded
        record = self.assistant_store().create(dict(kind=data['kind'],provider='other',other_provider=item['label'],account=account,
               date_from='2026-01-01',date_to='2026-12-31',renta_item=item['id'],renta_context=context))
        return dict(id=record['id'],url='/recoger?id='+record['id']+'#assistant-detail',message='Búsqueda preparada. Revisa y envía el prompt al asistente.')

    def intake_toolbar(self):
        return '<section class="intake-toolbar"><div><strong>Documentos de gastos · 2026</strong><p class="quiet">Tus originales siguen en FACTURAS/2026. La entrada es una bandeja para PDF nuevos, no otro libro.</p></div><div class="assistant-actions"><button type="button" data-intake-open="archive">Mis carpetas de 2026</button><button type="button" data-intake-open>Abrir carpeta de entrada</button><button type="button" data-intake-import>Importar PDF depositados</button><a class="link-button" href="/recoger">Encargos a la IA</a></div></section>'

    def collect_page(self, url='/recoger'):
        from assistant_requests import render
        accounts = self.settings.get('accounts',[])
        accounts = accounts if isinstance(accounts,list) else []
        accounts = accounts+[self.settings['account']] if self.settings.get('account') else accounts
        selected = parse_qs(urlsplit(url).query).get('id',[''])[0]
        body = render(self.assistant_store(),self.path,selected,accounts)
        if self.settings.get('order_path'):
            body += '<details class="feature-card direct-collection"><summary>Recogida directa del pedido Amazon configurado</summary>'+self.amazon_page()+'</details>'
        return body

    def amazon_page(self):
        order = json.loads(Path(self.settings['order_path']).read_text(encoding='utf-8-sig'))
        reference = order['order_reference']
        receipt = self.state/'mail'/(reference+'.json')
        last = json.loads(receipt.read_text(encoding='utf-8')) if receipt.exists() else None
        state = '<p class="quiet" id="mail-last">Todavía no se ha consultado desde esta aplicación.</p>'
        if last:
            state = '<div class="notice" id="mail-last"><strong>Última recogida · '+e(last['at'][:16].replace('T',' '))+' UTC</strong><p>'+e(last['message'])+'</p></div>'
        return '''<section class="local-page"><div class="eyebrow">ENTRADA DE DOCUMENTOS</div><h1>Recoger facturas</h1><p class="lead">Un clic para buscar. Tú decides cuándo.</p><div class="intake-grid"><article class="feature-card"><span class="source-badge">a<span>Amazon Business</span></span><h2>La factura de tus tapones</h2><p>'''+e(order.get('product',{}).get('description','Pedido Amazon'))+'''</p><dl><div><dt>Pedido</dt><dd>'''+e(reference)+'''</dd></div><div><dt>Importe de compra</dt><dd>'''+e(str(order['order_amounts']['total']).replace('.',','))+''' €</dd></div></dl><p class="quiet">Busca los PDF adjuntos a los correos de este pedido y los guarda en la bandeja para revisar. No inicia sesión en Amazon.</p><button id="collect-amazon" class="primary" type="button">Recoger factura ahora</button><a class="text-link" href="'''+e(order['source_url'])+'''" target="_blank" rel="noreferrer">Abrir pedido en Amazon ↗</a>'''+state+'''</article><article class="feature-card"><span class="source-badge file">PDF<span>Cualquier proveedor</span></span><h2>Ya tengo la factura</h2><p>Añade los PDF que descargues de Amazon o de cualquier otra página. Los duplicados conservan su revisión.</p><a class="primary link-button" href="'''+BASE+'''/gastos">Añadir o revisar PDF</a><div class="steps"><div><b>1</b><span>Conservar el original</span></div><div><b>2</b><span>Revisar proveedor, importes y destino</span></div><div><b>3</b><span>Aprobar la incorporación al libro</span></div></div></article></div><p class="quiet">Si el correo trae un enlace en vez del PDF, abre el pedido y descarga la factura. La recogida no da por aprobado ningún gasto.</p></section>'''

    def modules_page(self):
        parts = [('1','Recogida','Correo de Amazon Business o PDF descargado','Original y procedencia','/recoger'),
                 ('2','Revisión','Documento y texto extraído','Datos revisados y decisión de gasto',BASE+'/gastos'),
                 ('3','Libro','Gasto aprobado e ingresos existentes','Libro único y originales archivados',BASE+'?vista=gastos'),
                 ('4','Salidas','Una versión del libro','Excel, resumen, 303, 390 y documentos de Renta',BASE+'?vista=libros')]
        cards = ''.join('<article class="module-card"><span class="module-number">'+n+'</span><h2>'+name+'</h2><p><small>RECIBE</small>'+e(inp)+'</p><p><small>ENTREGA</small>'+e(out)+'</p><a href="'+url+'">Abrir módulo →</a></article>' for n,name,inp,out,url in parts)
        return '<section class="local-page"><div class="eyebrow">CÓMO SE CONECTA TODO</div><h1>Un archivo, cuatro pasos</h1><p class="lead">Cada módulo conserva una entrada y una salida claras.</p><div class="module-grid">'+cards+'</div><div class="feature-card"><h2>Qué está conectado</h2><p>El resumen, los libros y los originales se leen del archivo del mini. La revisión de gastos y la preparación fiscal reutilizan la bandeja existente de Kairo a través de la conexión privada.</p><p>La recogida de correo y la actualización solo se ejecutan al pulsar sus botones. Los ingresos mantienen el flujo de generación que ya tenías.</p><p class="quiet">Renta permite seguir la documentación y preparar búsquedas asistidas de Digi, luz, gas y otras partidas cuando tú lo pidas. El cálculo de la declaración y las amortizaciones siguen pendientes. Los modelos requieren sus revisiones y validaciones antes de presentar.</p></div></section>'

    def get(self, url):
        parsed = urlsplit(url)
        path = parsed.path
        if path == '/renta/documento':
            document = self.renta_store().document(parse_qs(parsed.query).get('id',[''])[0],as_bytes=True)
            return 200,document,'application/pdf',{'Content-Disposition':'inline; filename="documento-renta.pdf"'}
        if path == BASE and parse_qs(parsed.query).get('vista') == ['renta']:
            from renta_documents import render
            return 200,self.shell(render(self.renta_store(),self.mail_accounts()),url,'Renta 2026')
        if path == '/importacion':
            from assistant_requests import render_import
            ident = parse_qs(parsed.query).get('id',[''])[0]
            return 200, self.shell(render_import(self.assistant_store().get(ident)),url,'Resultado de importación')
        if re.fullmatch(r'/facturas/archivo/20\d\d-(0[1-9]|1[0-2])',path):
            from vat_dashboard import read_archive
            _,_,ledger = read_archive(self.config['archive_root'],self.config['index'])
            period = path.rsplit('/',1)[-1]
            rows = [r for r in ledger['records'] if r['kind']=='income' and r['date'].startswith(period)]
            body = '<section class="local-page"><a class="link-button" href="/facturas/historico">← Volver a Facturas</a><h1>Facturas · '+e(period)+'</h1><p>PDF originales del libro. La fecha de expedición puede diferir del mes trabajado.</p>'
            if not rows:
                body += '<p>No hay PDF incorporados al libro para este mes.</p>'
            for row in rows:
                pdf = BASE+'/documento?id='+row['sha256']
                body += '<article class="feature-card"><h2>'+e(row['number'])+' · '+e(row['party'])+'</h2><p>'+e(row['date'])+' · Total '+e(row['total'])+' €</p><a class="link-button" href="'+pdf+'" target="_blank" rel="noopener">Abrir PDF en el visor ↗</a><iframe title="PDF '+e(row['number'])+'" src="'+pdf+'" style="width:100%;height:65vh;border:1px solid var(--k-line);margin-top:16px"></iframe></article>'
            body += '<a class="link-button" href="/horas/calendario?period='+period+'">Ver programación del mes</a></section>'
            return 200,self.shell(body,url,'Facturas archivadas')
        if path == '/':
            url = BASE+'?vista=resumen'
            path = BASE
        if (path.startswith('/facturas') and not path.startswith(BASE)) or path.startswith('/horas'):
            result = self.remote(self.config, dict(action='billing_get',url=url,csrf=self.csrf))
            raw = base64.b64decode(result['body'], validate=True)
            if result['mime'].startswith('text/html'):
                raw = re.sub(rb'data-local-archive-period="(20\d\d-\d\d)" href="[^"]*">Ver env[^<]*',lambda m:b'data-local-archive-period="'+m[1]+b'" href="/facturas/archivo/'+m[1]+b'">Ver documentos',raw)
                raw = self.shell('<section class="billing-content"><div class="billing-theme"><script>document.currentScript.parentElement.dataset.kTheme=document.documentElement.dataset.kTheme;</script><div class="k-ui">'+raw.decode()+'</div></div></section>',url,
                                 'Programación' if path.startswith('/horas') else 'Facturas')
            return result['status'], raw, result['mime'], result['headers']
        if path == '/recoger':
            return 200, self.shell(self.collect_page(url), url, 'Encargos a la IA')
        if path == '/api/assistant-requests':
            selected = parse_qs(parsed.query).get('id',[''])[0]
            store = self.assistant_store()
            return 200, json.dumps(store.get(selected) if selected else store.list(),ensure_ascii=False), 'application/json; charset=utf-8'
        if path == '/modulos':
            return 200, self.shell(self.modules_page(), url, 'Mapa de módulos')
        if path == '/ayuda':
            from desktop_help import render_help
            return 200, self.shell(render_help(), url, 'Cómo funciona')
        if path in (BASE+'/aeat',BASE+'/aeat/justificante'):
            from aeat_web import get
            return get(self,url)
        if path == BASE+'/gastos':
            from modelos_web import render, filters_from_query
            query = parse_qs(parsed.query)
            payload = self.remote(self.config, dict(action='expense_data', id=query.get('id',[''])[0]))
            body = render(payload['draft'], payload['rows'], self.csrf, filters=filters_from_query(query))
            return 200, self.shell(self.intake_toolbar()+fragment(body), url, 'Revisar gastos')
        if path.startswith(BASE+'/gastos/') or path.startswith(BASE+'/preparacion') or path.startswith(BASE+'/cierre') or path == BASE+'/actualizacion':
            result = self.remote(self.config, dict(action='get',url=url,csrf=self.csrf))
            raw = base64.b64decode(result['body'], validate=True)
            if result['mime'].startswith('text/html'):
                raw = fragment(raw.decode())
                if path==BASE+'/preparacion':
                    period = parse_qs(parsed.query).get('periodo',['4T'])[0]
                    if period in ('1T','2T','3T','4T','anual'):
                        raw += '<p class="aeat-return"><a class="link-button" href="'+BASE+'/aeat?periodo='+period+'">Continuar a validación y presentación →</a></p>'
                raw = self.shell(raw, url, 'Preparar modelos')
            return result['status'], raw, result['mime'], result['headers']
        from vat_dashboard import response
        result = response(self.config['archive_root'], url, index_relative=self.config['index'], compact=True)
        if result is not None:
            status, body, *rest = result
            if not rest:
                body = self.shell(body if '<' in body else '<p>'+e(body)+'</p>', url)
                if parse_qs(parsed.query).get('vista') == ['gastos']:
                    body = body.replace('<main class="desktop-main k-main">','<main class="desktop-main k-main">'+self.intake_toolbar(),1)
            return (status,body,*rest)
        return 404, self.shell('<h1>Página no encontrada</h1>',url)

    def post(self, path, data):
        if not self.mutex.acquire(blocking=False):
            raise ValueError('Hay una acción en curso. Espera a que termine antes de repetir.')
        try:
            if path == '/api/renta-search':
                result = self.renta_search(data)
            elif path in ('/api/renta-scan','/api/renta-mark','/api/renta-assign'):
                store = self.renta_store()
                if path.endswith('-scan'):
                    store.scan()
                elif path.endswith('-mark'):
                    store.mark(data.get('item'),data.get('complete'))
                else:
                    store.assign(data.get('sha'),data.get('item'))
                result = dict(url=BASE+'?vista=renta',message='Seguimiento documental guardado. No cambia el libro ni el IVA.')
            elif path == '/api/assistant-requests':
                record = self.assistant_store().create(data)
                result = dict(id=record['id'],url='/recoger?id='+record['id']+'#assistant-detail',message='Encargo guardado. Revisa el prompt y envíalo cuando quieras.')
            elif path == '/api/assistant-reconcile':
                record = self.assistant_store().reconcile(data.get('id'),self.config,self.remote)
                result = dict(id=record['id'],url='/recoger?id='+record['id']+'#assistant-detail',message='Resultados comprobados. La búsqueda no acredita cobertura del periodo.')
            elif path == '/api/intake-open':
                if data.get('folder','inbox') not in ('inbox','archive'):
                    raise ValueError('Carpeta no disponible')
                folder = self.assistant_store().folder(create=True)
                if data.get('folder')=='archive':
                    folder = Path(self.config['archive_root'])/'FACTURAS'/'2026'
                    if not folder.is_dir():
                        raise ValueError('No se encuentra tu carpeta FACTURAS/2026')
                if os.name != 'nt':
                    raise ValueError('La apertura de carpeta requiere el ordenador mini Windows')
                # The local server is launched hidden. Explicitly show Explorer
                # instead of inheriting that startup state through ShellExecute.
                import subprocess
                startup = subprocess.STARTUPINFO()
                startup.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                startup.wShowWindow = 1
                subprocess.Popen([str(Path(os.environ['SystemRoot'])/'explorer.exe'),str(folder)],
                                 startupinfo=startup,close_fds=True)
                result = dict(message='Carpeta de entrada solicitada en el Explorador. Deposita los PDF y pulsa Importar cuando quieras.')
            elif path == '/api/intake-import':
                store = self.assistant_store()
                ident = data.get('id')
                if not ident:
                    ident = store.create(dict(kind='folder',provider='other',other_provider='PDF depositados'))['id']
                record = store.import_folder(ident,self.config,self.remote)
                errors = sum(item['status']=='error' for item in record['attempts'])
                result = dict(id=ident,url='/importacion?id='+ident,message=f'Importación terminada: {len(record["attempts"])-errors} archivos confirmados y {errors} con incidencia. Revisa el resultado de cada PDF.')
            elif path == '/api/collect-amazon':
                from desktop_intake import collect
                result = collect(self.config, self.settings, self.remote)
            elif path == BASE+'/aeat':
                from aeat_workflow import post
                result = post(self,data)
            elif (path.startswith('/facturas/') and not path.startswith(BASE)) or path.startswith('/horas/'):
                result = self.remote(self.config, dict(action='billing_post',url=path,data=data))
            elif path in (BASE+'/gastos', BASE+'/actualizar', BASE+'/preparacion', BASE+'/cierre'):
                # Suppress historical duplicates before any upload to the queue.
                if path == BASE+'/gastos' and data.get('action') == 'upload':
                    from expense_workflow import decode_pdf, digest, inspect_pdf
                    from amazon_inbox import _immutable
                    from vat_dashboard import read_archive
                    _,_,ledger = read_archive(self.config['archive_root'],self.config['index'])
                    raw = decode_pdf(data.get('pdf'))
                    sha = digest(raw)
                    if any(row['sha256'] == sha for row in ledger['records']):
                        return dict(duplicate=True,message='Este PDF ya está en el libro. No se ha creado otro gasto.',url=BASE+'?vista=gastos')
                    inspect_pdf(raw)
                    _immutable(Path(self.config['archive_root'])/'ENTRADA'/'MANUAL',sha+'.pdf',raw)
                result = self.remote(self.config, dict(action='post',url=path,data=data))
            else:
                raise ValueError('Acción no disponible')
            atomic(self.state/'last-action.json', json.dumps(dict(at=datetime.now().isoformat(),
                   message=result.get('message','Acción completada')),ensure_ascii=False).encode())
            return result
        finally:
            self.mutex.release()


class Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = False

    def server_bind(self):
        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
            self.socket.setsockopt(socket.SOL_SOCKET,socket.SO_EXCLUSIVEADDRUSE,1)
        super().server_bind()


class Handler(BaseHTTPRequestHandler):
    server_version = 'KairoLocal/1'

    def log_message(self, *args):
        pass  # No URLs, session tokens or fiscal data in an access log.

    def send_result(self, status, body, mime='text/html; charset=utf-8', headers=None):
        raw = body if isinstance(body,bytes) else body.encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length',str(len(raw)))
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('X-Frame-Options','SAMEORIGIN')
        self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'")
        for key,value in (headers or {}).items():
            if key in ('Content-Disposition','Set-Cookie','Location') and '\r' not in value and '\n' not in value:
                self.send_header(key,value)
        self.end_headers()
        try:
            self.wfile.write(raw)
        except (BrokenPipeError,ConnectionResetError):
            pass

    def allowed_host(self):
        return self.headers.get('Host') == '127.0.0.1:'+str(self.server.app.port)

    def authorized(self):
        try:
            cookie = SimpleCookie(self.headers.get('Cookie',''))
            token = cookie['kairo_local'].value if 'kairo_local' in cookie else ''
            return secrets.compare_digest(token,self.server.app.session) and self.headers.get('Sec-Fetch-Site') != 'cross-site'
        except Exception:
            return False

    def do_GET(self):
        app = self.server.app
        if not self.allowed_host():
            return self.send_result(403,'Host no válido')
        path = urlsplit(self.path).path
        if path in ('/entrar','/ping'):
            key = parse_qs(urlsplit(self.path).query).get('key',[''])[0]
            if not secrets.compare_digest(key,app.launch):
                return self.send_result(403,'Abre la aplicación desde el acceso directo del escritorio.')
            if path == '/ping':
                return self.send_result(200,'kairo-desktop-v1','text/plain')
            return self.send_result(303,'',headers={'Location':'/', 'Set-Cookie':'kairo_local='+app.session+'; HttpOnly; SameSite=Strict; Path=/'})
        if not self.authorized():
            return self.send_result(401,'<h1>Abre Kairo Contabilidad desde el escritorio</h1><p>El acceso directo inicia tu sesión local privada.</p>')
        assets = {'/assets/desktop.css':('desktop.css','text/css'),'/assets/desktop.js':('desktop.js','text/javascript'),
                  '/theme.js':('theme.js','text/javascript'),'/assets/wordmark.png':('wordmark.png','image/png'),
                  '/assets/icon.png':('icon.png','image/png')}
        try:
            if path in assets:
                file,mime = assets[path]
                return self.send_result(200,(ASSETS/file).read_bytes(),mime)
            return self.send_result(*app.get(self.path))
        except ValueError as exc:
            content = '<section class="local-page"><h1>No se ha podido abrir esta vista</h1><p>'+e(exc)+'</p>'+button(BASE+'?vista=resumen','Volver al resumen')+'</section>'
            return self.send_result(503,app.shell(content,self.path))
        except Exception:
            return self.send_result(503,app.shell('<h1>Vista temporalmente no disponible</h1><p>Vuelve al resumen y comprueba los archivos y la conexión.</p>',self.path))

    def do_POST(self):
        app = self.server.app
        if (not self.allowed_host() or not self.authorized() or self.headers.get('Origin') != app.origin
                or not secrets.compare_digest(self.headers.get('X-CSRF',''),app.csrf)):
            return self.send_result(403,json.dumps({'message':'Sesión no válida. Abre la aplicación desde el escritorio.'}),'application/json')
        try:
            size = int(self.headers.get('Content-Length','0'))
            if not 0 < size <= 15_000_000 or self.headers.get('Content-Type','').split(';')[0] != 'application/json':
                raise ValueError('Petición no válida o demasiado grande')
            self.connection.settimeout(30)
            data = json.loads(self.rfile.read(size))
            if not isinstance(data,dict):
                raise ValueError('Se requiere un objeto')
            result = app.post(urlsplit(self.path).path,data)
            return self.send_result(200,json.dumps(result,ensure_ascii=False),'application/json')
        except (ValueError,OSError) as exc:
            return self.send_result(409,json.dumps({'message':str(exc)},ensure_ascii=False),'application/json')
        except Exception:
            return self.send_result(503,json.dumps({'message':'Acción interrumpida. Comprueba el estado antes de repetirla.'}),'application/json')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config',required=True,type=Path)
    parser.add_argument('--open',action='store_true')
    args = parser.parse_args()
    app = Application(args.config)
    app.state.mkdir(parents=True,exist_ok=True)
    descriptor = app.state/'instance.json'
    try:
        server = Server(('127.0.0.1',app.port),Handler)
    except OSError:
        try:
            running = json.loads(descriptor.read_text(encoding='utf-8'))
            key = running['key']
            with urllib.request.urlopen(app.origin+'/ping?key='+key,timeout=3) as response:
                if response.read() != b'kairo-desktop-v1':
                    raise ValueError('Puerto ocupado por otra aplicación')
            if args.open:
                webbrowser.open(app.origin+'/entrar?key='+key)
            return
        except Exception:
            raise RuntimeError('El puerto local está ocupado. No se ha conectado a otra aplicación.') from None
    server.app = app
    atomic(descriptor,json.dumps({'key':app.launch,'port':app.port,'pid':os.getpid()}).encode())
    if args.open:
        webbrowser.open(app.origin+'/entrar?key='+app.launch)
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == '__main__':
    main()

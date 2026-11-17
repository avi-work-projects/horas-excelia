"""Desktop boundary tests: no real mail, tax approvals or personal documents."""
import base64
from email.message import EmailMessage
import hashlib
import http.client
import json
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch

from desktop_app import Application, Handler, Server, fragment
from desktop_intake import collect
from desktop_remote import attachments
from test_amazon_inbox import pdf


class DesktopTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.archive = self.root/'archive'
        self.order_id = '123-1234567-1234567'
        self.order_path = self.archive/'ENTRADA/AMAZON/pedidos'/self.order_id/'pendiente_factura.json'
        self.order_path.parent.mkdir(parents=True)
        self.order_path.write_text(json.dumps(dict(order_reference=self.order_id,purchase_status='confirmed',
             product={'description':'Producto de prueba'},order_amounts={'total':9.99},source_url='https://www.amazon.es/')))
        self.models = self.root/'models.json'
        self.config = dict(archive_root=str(self.archive),index='index.json',ledger='ledger.json')
        self.models.write_text(json.dumps(self.config))
        self.settings = dict(models_config=str(self.models),order_path=str(self.order_path),
                             state_root=str(self.root/'state'),account='fictional@example.test')
        self.settings_path = self.root/'desktop.json'
        self.settings_path.write_text(json.dumps(self.settings))
        self.calls = []

    def remote(self, config, request, **kwargs):
        self.calls.append(request)
        return {'message':'Solicitado','state':'queued'}

    def test_opening_collector_and_map_does_not_collect_or_sync(self):
        app = Application(self.settings_path,remote=self.remote)
        before = set(self.root.rglob('*'))
        for path in ('/recoger','/modulos'):
            code, html = app.get(path)
            self.assertEqual(code,200)
            self.assertIn('Contabilidad bajo petición',html)
        self.assertEqual(self.calls,[])
        self.assertEqual(before,set(self.root.rglob('*')))

    def test_summary_uses_local_archive_without_remote_calls(self):
        app = Application(self.settings_path,remote=self.remote)
        with patch('vat_dashboard.response',return_value=(200,'<h1>Local</h1>')) as read:
            self.assertEqual(app.get('/')[0],200)
            self.assertEqual(read.call_args.kwargs['index_relative'],'index.json')
        self.assertEqual(self.calls,[])

    def test_explicit_refresh_only_sends_one_request(self):
        app = Application(self.settings_path,remote=self.remote)
        app.post('/facturas/modelos/actualizar',{})
        self.assertEqual(len(self.calls),1)
        self.assertEqual(self.calls[0]['action'],'post')

    def test_billing_and_calendar_share_remote_state_inside_local_shell(self):
        def remote(config, request):
            self.calls.append(request)
            return dict(status=200,body=base64.b64encode(b'<h1>Existing service</h1>').decode(),
                        mime='text/html; charset=utf-8',headers={})
        app = Application(self.settings_path,remote=remote)
        for path in ('/facturas/','/horas/calendario?month=2026-11'):
            code, html, *_ = app.get(path)
            self.assertEqual(code,200)
            self.assertIn('Existing service',html)
            self.assertIn('billing-content"><div class="billing-theme',html)
            self.assertEqual(self.calls[-1]['url'],path)
            self.assertEqual(self.calls[-1]['csrf'],app.csrf)
        self.assertEqual([v['action'] for v in self.calls],['billing_get','billing_get'])

    def test_billing_action_preserves_approved_identity(self):
        app = Application(self.settings_path,remote=self.remote)
        data = dict(planId=7,hash='approved-content-hash',expectedState='review')
        app.post('/facturas/approve',data)
        self.assertEqual(self.calls,[dict(action='billing_post',url='/facturas/approve',data=data)])

    def test_historical_pdf_is_not_uploaded_again(self):
        raw = pdf('fictional historic invoice')
        app = Application(self.settings_path,remote=self.remote)
        with patch('vat_dashboard.read_archive',return_value=({}, {}, {'records':[{'sha256':hashlib.sha256(raw).hexdigest()}]})):
            result = app.post('/facturas/modelos/gastos',{'action':'upload','pdf':base64.b64encode(raw).decode()})
        self.assertTrue(result['duplicate'])
        self.assertEqual(self.calls,[])

    def test_parallel_manual_action_is_rejected(self):
        app = Application(self.settings_path,remote=self.remote)
        app.mutex.acquire()
        with self.assertRaises(ValueError):
            app.post('/facturas/modelos/actualizar',{})
        self.assertEqual(self.calls,[])

    def test_manual_upload_keeps_original_when_remote_is_unavailable(self):
        raw = pdf('fictional new invoice')
        def unavailable(*args,**kwargs):
            raise ValueError('offline')
        app = Application(self.settings_path,remote=unavailable)
        with patch('vat_dashboard.read_archive',return_value=({}, {}, {'records':[]})):
            with self.assertRaises(ValueError):
                app.post('/facturas/modelos/gastos',{'action':'upload','filename':'example.pdf','pdf':base64.b64encode(raw).decode()})
        path = self.archive/'ENTRADA/MANUAL'/(hashlib.sha256(raw).hexdigest()+'.pdf')
        self.assertEqual(path.read_bytes(),raw)

    def test_fragment_preserves_screen_styles_and_script(self):
        html = '<html><style>old</style><main class="k-main"><h1>X</h1></main><script>save()</script></html>'
        self.assertEqual(fragment(html),'<style>old</style><h1>X</h1><script>save()</script>')

    def email(self,sender='invoices@amazon.es',order=None):
        mail = EmailMessage()
        mail['From'] = sender
        mail['Subject'] = 'Documento del pedido '+(order or self.order_id)
        mail.set_content('Adjunto documento para revisar.')
        mail.add_attachment(pdf('fictional PDF'),maintype='application',subtype='pdf',filename='../../invoice.pdf')
        return mail.as_bytes()

    def test_mail_candidates_require_exact_order_and_sender_domain(self):
        found = attachments(self.email(),self.order_id)
        self.assertEqual(len(found),1)
        self.assertEqual(found[0]['filename'],'invoice.pdf')
        self.assertEqual(attachments(self.email(sender='amazon.es@evil.test'),self.order_id),[])
        self.assertEqual(attachments(self.email(order='999-9999999-9999999'),self.order_id),[])

    def test_collection_preserves_original_before_transport_and_is_not_approval(self):
        documents = attachments(self.email(),self.order_id)
        sha = hashlib.sha256(base64.b64decode(documents[0]['pdf'])).hexdigest()
        def remote(*args,**kwargs):
            return dict(documents=documents,messages=1,mailbox='all')
        def sender(manifest_path,config):
            manifest = json.loads(manifest_path.read_text())
            self.assertTrue((self.archive/'ENTRADA/AMAZON/objects'/(sha+'.pdf')).is_file())
            self.assertEqual(manifest['files'][0]['source_kind'],'unknown')
            return dict(batch_id=manifest['batch_id'],documents=[dict(sha256=sha,status='created',state='draft',draft_id='a'*32)])
        original = self.order_path.read_bytes()
        result = collect(self.config,self.settings,remote,sender)
        self.assertEqual(result['documents'][0]['state'],'draft')
        self.assertEqual(self.order_path.read_bytes(),original)
        self.assertFalse((self.archive/'ledger.json').exists())

    def test_missing_invoice_is_reported_without_any_transfer(self):
        def remote(*args,**kwargs):
            return dict(documents=[],messages=1,mailbox='all')
        def sender(*args):
            self.fail('No PDF must not trigger a transfer')
        result = collect(self.config,self.settings,remote,sender)
        self.assertEqual(result['documents'],[])
        self.assertIn('No hay PDF',result['message'])

    def test_dropped_transfer_keeps_original_for_manual_retry(self):
        documents = attachments(self.email(),self.order_id)
        def remote(*args,**kwargs):
            return dict(documents=documents,messages=1,mailbox='all')
        def sender(*args):
            raise ValueError('lost reply')
        with self.assertRaises(ValueError):
            collect(self.config,self.settings,remote,sender)
        self.assertEqual(len(list((self.archive/'ENTRADA/AMAZON/objects').glob('*.pdf'))),1)
        self.assertFalse((self.root/'state/mail'/(self.order_id+'.json')).exists())

    def test_empty_receipt_does_not_claim_success(self):
        documents = attachments(self.email(),self.order_id)
        def remote(*args,**kwargs):
            return dict(documents=documents,messages=1,mailbox='all')
        def sender(path,*args):
            return dict(batch_id=json.loads(path.read_text())['batch_id'],documents=[])
        with self.assertRaises(ValueError):
            collect(self.config,self.settings,remote,sender)

    def test_http_requires_session_host_origin_and_csrf(self):
        app = Application(self.settings_path,remote=self.remote)
        server = Server(('127.0.0.1',0),Handler)
        self.addCleanup(server.server_close)
        app.port = server.server_port
        app.origin = 'http://127.0.0.1:'+str(app.port)
        server.app = app
        thread = threading.Thread(target=server.serve_forever,daemon=True)
        thread.start()
        self.addCleanup(server.shutdown)
        def request(method,path,headers=None,body=None):
            conn=http.client.HTTPConnection('127.0.0.1',app.port)
            conn.request(method,path,body=body,headers=headers or {})
            result=conn.getresponse()
            code,raw=result.status,result.read()
            conn.close()
            return code,raw
        self.assertEqual(request('GET','/recoger')[0],401)
        self.assertEqual(request('GET','/recoger',{'Host':'evil.test'})[0],403)
        self.assertEqual(request('GET','/entrar?key=wrong')[0],403)
        self.assertEqual(request('GET','/entrar?key='+app.launch)[0],303)
        headers={'Cookie':'kairo_local='+app.session,'Content-Type':'application/json',
                 'X-CSRF':app.csrf,'Origin':app.origin}
        self.assertEqual(request('POST','/facturas/modelos/actualizar',headers|{'Origin':'https://evil.test'},'{}')[0],403)
        self.assertEqual(request('POST','/facturas/modelos/actualizar',headers|{'X-CSRF':'wrong'},'{}')[0],403)
        self.assertEqual(request('POST','/facturas/modelos/actualizar',headers,'{}')[0],200)
        self.assertEqual(len(self.calls),1)


if __name__ == '__main__':
    unittest.main()

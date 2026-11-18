"""Synthetic records only: custody, truthful state and explicit desktop actions."""
import base64
from contextlib import redirect_stdout, nullcontext
import hashlib
import html
import http.client
import io
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

from assistant_requests import Requests, FOLDER, render, main
from desktop_app import Application, Handler, Server
from expense_workflow import ExpenseStore
from test_amazon_inbox import pdf


class AssistantRequestsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.archive = self.root/'archive'
        self.archive.mkdir()
        self.state = self.root/'state'
        self.store = Requests(self.state,self.archive)
        self.config = {'archive_root':str(self.archive),'index':'index.json','ledger':'ledger.json'}
        self.models = self.root/'models.json'
        self.models.write_text(json.dumps(self.config))
        self.settings = self.root/'desktop.json'
        self.settings.write_text(json.dumps(dict(models_config=str(self.models),state_root=str(self.state))))
        self.queue = ExpenseStore(self.root/'remote-queue')
        self.calls = []
        self.book([])

    def book(self, rows):
        data = json.dumps(dict(year=2026,records=rows)).encode()
        report = json.dumps(dict(year=2026)).encode()
        (self.archive/'ledger.json').write_bytes(data)
        (self.archive/'report.json').write_bytes(report)
        (self.archive/'index.json').write_text(json.dumps(dict(
            ledger={'path':'ledger.json','sha256':hashlib.sha256(data).hexdigest()},
            report={'path':'report.json','sha256':hashlib.sha256(report).hexdigest()})))

    def create(self, mail=False):
        fields = dict(kind='mail' if mail else 'folder',provider='amazon')
        if mail:
            fields.update(account='example@example.test',date_from='2026-01-01',date_to='2026-03-31')
        return self.store.create(fields)

    def document(self, name='one.pdf', tag='one'):
        path = self.store.folder(create=True)/name
        raw = pdf(tag)
        path.write_bytes(raw)
        return dict(path=FOLDER+'/'+name,sha256=hashlib.sha256(raw).hexdigest(),source={'kind':'manual_folder'})

    def report(self, ident, docs, pending=None):
        return self.store.report(ident,dict(schema_version=1,request_id=ident,documents=docs,pending=pending or []))

    def remote(self, config, request):
        self.calls.append(request)
        if request['action']=='expense_data':
            return dict(rows=self.queue.list(),draft=None)
        if request['action']=='expense_propose':
            row = self.queue.propose(request['id'],request['proposal'],request['expected_revision'],'test-extractor')
            return {key:row[key] for key in ('id','revision','state')}
        self.assertEqual(request['action'],'post')
        data = request['data']
        self.assertEqual(data['action'],'upload')
        if data['filename']=='offline.pdf':
            raise ValueError('PRIVATE/CONNECTION/DETAIL')
        existing = {row['id'] for row in self.queue.list()}
        row = self.queue.upload(data['filename'],data['pdf'],'test')
        return dict(id=row['id'],revision=row['revision'],state=row['state'],duplicate=row['id'] in existing)

    def test_gets_create_no_folder_job_or_remote_call(self):
        app = Application(self.settings,remote=self.remote)
        before = set(self.root.rglob('*'))
        self.assertEqual(app.get('/recoger')[0],200)
        self.assertEqual(json.loads(app.get('/api/assistant-requests')[1]),[])
        self.assertEqual(set(self.root.rglob('*')),before)
        self.assertEqual(self.calls,[])

    def test_durable_prompt_and_desktop_link_escape_input_without_auto_send(self):
        record = self.create(mail=True)
        record = Requests(self.state,self.archive).get(record['id'])
        rendered = render(self.store,self.settings,record['id'],['x"><script>bad()</script>'])
        self.assertNotIn('<script>bad()',rendered)
        link = html.unescape(re.search(r'id="assistant-chatgpt" href="([^"]+)"',rendered).group(1))
        parsed = urlsplit(link)
        self.assertEqual((parsed.scheme,parsed.netloc),('codex','new'))
        query = parse_qs(parsed.query)
        self.assertEqual(set(query),{'prompt','path'})
        self.assertEqual(query['path'],[str(self.store.folder())])
        self.assertIn(record['id'],query['prompt'][0])
        self.assertIn('NO acredita',query['prompt'][0])
        self.assertTrue(self.store.folder().is_dir())
        self.assertEqual(record['documents'],[])
        self.assertNotIn('coverage',record)

    def test_report_binds_original_hash_and_keeps_provenance_and_pending_audit(self):
        record = self.create(mail=True)
        document = self.document()
        document['source'] = dict(kind='email',provider='Amazon',message_id='message-1',attachment_id='part-1')
        result = self.report(record['id'],[document],['Falta comprobar un enlace'])
        self.assertEqual(result['documents'][0]['status'],'recovered')
        self.assertEqual(result['documents'][0]['source'],document['source'])
        self.report(record['id'],[document],[])
        final = self.store.get(record['id'])
        self.assertEqual(len(final['documents']),1)
        self.assertEqual(final['pending'],[])
        self.assertEqual(final['events'][1]['detail']['pending'],['Falta comprobar un enlace'])
        self.assertFalse((self.root/'remote-queue').exists())

    def test_report_rejects_escape_changed_sha_and_forged_incorporation(self):
        record = self.create()
        item = self.document()
        for changed in [item|{'path':'../outside.pdf'},item|{'path':'C:/outside.pdf'},item|{'sha256':'0'*64},item|{'status':'incorporated'}]:
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                self.report(record['id'],[changed])
        self.assertEqual(self.store.get(record['id'])['documents'],[])

    def test_symlink_is_rejected_without_reading_or_uploading_target(self):
        record = self.create()
        outside = self.root/'outside.pdf'
        outside.write_bytes(pdf('outside'))
        link = self.store.folder()/'linked.pdf'
        try:
            link.symlink_to(outside)
        except OSError:
            self.skipTest('Symlink creation unavailable on this platform')
        with self.assertRaises(ValueError):
            self.store.document(FOLDER+'/linked.pdf')
        result = self.store.import_folder(record['id'],self.config,self.remote)
        self.assertEqual(result['attempts'][0]['status'],'error')
        self.assertFalse(any(call['action']=='post' for call in self.calls))

    def test_batch_keeps_successes_errors_originals_and_one_queue_draft_per_hash(self):
        record = self.create()
        one = self.document()
        self.document('copy.pdf')
        self.document('offline.pdf','offline')
        (self.store.folder()/'broken.pdf').write_bytes(b'not pdf')
        book_before = (self.archive/'ledger.json').read_bytes()
        result = self.store.import_folder(record['id'],self.config,self.remote)
        self.assertEqual(len(self.queue.list()),1)
        self.assertEqual([row['state'] for row in self.queue.list()],['draft'])
        self.assertEqual(sum(r['status']=='error' for r in result['attempts']),2)
        self.assertEqual(sum(r['status']=='existing_in_queue' for r in result['attempts']),1)
        self.assertEqual((self.archive/'ledger.json').read_bytes(),book_before)
        self.assertEqual(len(list(self.store.folder().glob('*.pdf'))),4)
        self.assertNotIn('PRIVATE/',json.dumps(result))
        self.assertTrue(all(d['status']!='incorporated' for d in result['documents']))
        self.assertFalse((self.state/'model-events.sqlite').exists())

    def test_incorporated_requires_verified_book_and_original_not_queue_status(self):
        record = self.create()
        item = self.document()
        self.report(record['id'],[item])
        remote = lambda *a,**kw:dict(rows=[dict(id='a'*32,sha256=item['sha256'],state='incorporated')])
        result = self.store.reconcile(record['id'],self.config,remote)
        self.assertEqual(result['documents'][0]['status'],'queued')
        original = self.archive/'book-original.pdf'
        original.write_bytes((self.store.folder()/'one.pdf').read_bytes())
        self.book([dict(source='book-original.pdf',sha256=item['sha256'])])
        result = self.store.reconcile(record['id'],self.config,remote)
        self.assertEqual(result['documents'][0]['status'],'incorporated')
        original.write_bytes(pdf('changed'))
        result = self.store.reconcile(record['id'],self.config,remote)
        self.assertEqual(result['documents'][0]['status'],'queued')
        self.assertTrue(result['checks']['warnings'])

    def test_existing_book_document_is_never_uploaded_again(self):
        record = self.create()
        item = self.document()
        self.book([dict(source=item['path'],sha256=item['sha256'])])
        result = self.store.import_folder(record['id'],self.config,self.remote)
        self.assertEqual(result['documents'][0]['status'],'incorporated')
        self.assertFalse(any(call['action']=='post' for call in self.calls))

    def test_mail_assignment_imports_only_reported_documents(self):
        record = self.create(mail=True)
        self.report(record['id'],[self.document('selected.pdf','selected')])
        self.document('unrelated.pdf','unrelated')
        result = self.store.import_folder(record['id'],self.config,self.remote)
        self.assertEqual([r['filename'] for r in result['attempts']],['selected.pdf'])

    def test_changed_reported_pdf_is_not_imported_as_a_new_unreported_document(self):
        record = self.create(mail=True)
        original = self.document('declared.pdf','declared')
        self.report(record['id'],[original])
        self.document('declared.pdf','replaced')
        result = self.store.import_folder(record['id'],self.config,self.remote)
        self.assertEqual(result['attempts'][0]['status'],'error')
        self.assertFalse(any(call['action']=='post' for call in self.calls))
        self.assertEqual([doc['sha256'] for doc in result['documents']],[original['sha256']])
        self.assertEqual(result['documents'][0]['status'],'unavailable')

    def test_limit_and_corrupt_book_stop_import_before_remote_mutation(self):
        record = self.create()
        for i in range(101):
            (self.store.folder()/f'{i}.pdf').write_bytes(b'%PDF-')
        with self.assertRaises(ValueError):
            self.store.import_folder(record['id'],self.config,self.remote)
        self.assertEqual(self.calls,[])
        (self.archive/'ledger.json').write_text('changed')
        with self.assertRaises(ValueError):
            self.store.import_folder(record['id'],self.config,self.remote)
        self.assertEqual(self.calls,[])

    def test_cli_records_report_without_importing_or_claiming_coverage(self):
        record = self.create()
        report = self.root/'private-report.json'
        report.write_text(json.dumps(dict(schema_version=1,request_id=record['id'],documents=[self.document()],pending=[])))
        with patch('sys.argv',['assistant_requests.py','--settings',str(self.settings),'--request',record['id'],'--report',str(report)]), redirect_stdout(io.StringIO()) as output:
            main()
        self.assertEqual(json.loads(output.getvalue())['documents'],1)
        self.assertFalse((self.root/'remote-queue').exists())

    def proposal(self, item, number='EXTRACTED-1'):
        return dict(schema_version=1,document_sha256=item['sha256'],values={'number':number},
                    evidence={'number':[{'page':1,'quote':'Invoice '+number}]})

    def test_valid_proposal_applies_only_to_new_draft_without_approval(self):
        record = self.create()
        item = self.document()
        item['proposal'] = self.proposal(item)
        self.report(record['id'],[item])
        self.assertEqual(self.calls,[])
        self.assertFalse((self.root/'remote-queue').exists())
        result = self.store.import_folder(record['id'],self.config,self.remote)
        draft = self.queue.list()[0]
        self.assertEqual(draft['fields']['number'],'EXTRACTED-1')
        self.assertEqual(draft['fields']['tax_scope'],'review')
        self.assertEqual(draft['state'],'draft')
        self.assertIsNone(draft['approval'])
        self.assertEqual(result['attempts'][0]['proposal_status'],'applied')
        self.assertEqual([c['action'] for c in self.calls],['post','expense_propose','expense_data'])

    def test_duplicate_preserves_existing_manual_review_and_never_proposes(self):
        record = self.create()
        item = self.document()
        raw = (self.store.folder()/'one.pdf').read_bytes()
        old = self.queue.upload('one.pdf',base64.b64encode(raw).decode(),'user')
        old = self.queue.edit(old['id'],old['revision'],{'number':'MANUAL-REVIEW'},'user')
        item['proposal'] = self.proposal(item)
        self.report(record['id'],[item])
        result = self.store.import_folder(record['id'],self.config,self.remote)
        self.assertEqual(self.queue.get(old['id'])['revision'],old['revision'])
        self.assertEqual(self.queue.get(old['id'])['fields']['number'],'MANUAL-REVIEW')
        self.assertFalse(any(c['action']=='expense_propose' for c in self.calls))
        self.assertEqual(result['attempts'][0]['proposal_status'],'preserved')

    def test_proposal_rejects_wrong_sha_page_and_fiscal_confirmation(self):
        record = self.create()
        item = self.document()
        valid = self.proposal(item)
        invalid = [valid|{'document_sha256':'f'*64},valid|{'evidence':{'number':[{'page':2,'quote':'wrong page'}]}},
                   valid|{'values':{'include':'true'},'evidence':{'include':[{'page':1,'quote':'wrong field'}]}}]
        for proposal in invalid:
            with self.subTest(proposal=proposal),self.assertRaises(ValueError):
                self.report(record['id'],[item|{'proposal':proposal}])
        self.assertEqual(self.store.get(record['id'])['documents'],[])
        self.assertEqual(self.calls,[])

    def test_folder_report_also_binds_import_to_declared_sha(self):
        record = self.create()
        original = self.document()
        self.report(record['id'],[original|{'proposal':self.proposal(original)}])
        self.document(tag='replacement')
        result = self.store.import_folder(record['id'],self.config,self.remote)
        self.assertEqual(result['attempts'][0]['status'],'error')
        self.assertFalse(any(c['action']=='post' for c in self.calls))
        self.assertEqual([d['sha256'] for d in result['documents']],[original['sha256']])

    def test_remote_proposal_dispatch_uses_exact_revision_and_never_approves(self):
        from desktop_remote import dispatch
        runtime = self.root/'runtime'
        queue = ExpenseStore(runtime/'expenses')
        raw = pdf('remote proposal')
        draft = queue.upload('one.pdf',base64.b64encode(raw).decode(),'test')
        request = dict(action='expense_propose',id=draft['id'],expected_revision=draft['revision'],
                       proposal=self.proposal({'sha256':draft['sha256']}))
        with patch('desktop_remote.service_lock',return_value=nullcontext()),patch.dict(sys.modules):
            result = dispatch(runtime,request)
            self.assertEqual(result['state'],'draft')
            self.assertIsNone(queue.get(draft['id'])['approval'])
            with self.assertRaises(ValueError):
                dispatch(runtime,request)
        self.assertFalse((runtime/'model-events.sqlite').exists())

    def test_prompt_uses_console_python_and_names_extraction_contract(self):
        record = self.store.create(dict(kind='folder',provider='other',other_provider='Mi proveedor'))
        with patch('assistant_requests.sys.executable',str(self.root/'pythonw.exe')):
            prompt = self.store.prompt(record,self.settings)
        self.assertNotIn('pythonw.exe',prompt)
        self.assertIn('python.exe',prompt)
        self.assertIn('Lee todas las páginas',prompt)
        self.assertIn('document_sha256',prompt)
        self.assertIn('<h2>Mi proveedor</h2>',render(self.store,self.settings,record['id']))

    def test_prompt_powershell_quotes_paths_and_arguments_literally(self):
        record = self.create()
        special = self.root / "Mini d'Angel $valor"
        script = special / "script d'encargo $valor.py"
        settings = special / "config d'encargo $valor.json"
        with patch('assistant_requests.sys.executable', str(special / 'pythonw.exe')), \
             patch('assistant_requests.__file__', str(script)):
            prompt = self.store.prompt(record, settings)
        expected_base = str(self.root) + "\\Mini d''Angel $valor"
        if sys.platform != 'win32':
            expected_base = str(self.root) + "/Mini d''Angel $valor"
        separator = '\\' if sys.platform == 'win32' else '/'
        expected = (
            f"Registra el informe en PowerShell con: & '{expected_base}{separator}python.exe' "
            f"'{expected_base}{separator}script d''encargo $valor.py' "
            f"--settings '{expected_base}{separator}config d''encargo $valor.json' "
            f"--request '{record['id']}' --report 'RUTA_INFORME_PRIVADO.json'"
        )
        command = next(line for line in prompt.splitlines() if line.startswith('Registra el informe'))
        self.assertEqual(command, expected)

    @unittest.skipUnless(shutil.which('node'),'Node unavailable')
    def test_post_success_reloads_same_record_even_when_only_hash_changes(self):
        script = Path(__file__).with_name('desktop_assets').joinpath('desktop.js').read_text(encoding='utf-8')
        function = re.search(r'  function openResult\(result\) \{.*?\n  \}',script,re.S).group(0)
        check = """const assert=require('node:assert/strict'); let reloads=0;
const location={href:'http://127.0.0.1:1234/recoger?id=abc#old',pathname:'/recoger',search:'?id=abc',reload(){reloads++;}};
FUNCTION
openResult({url:'/recoger?id=abc#assistant-detail'}); assert.equal(reloads,1);
openResult({url:'/recoger?id=new#assistant-detail'}); assert.equal(location.href,'http://127.0.0.1:1234/recoger?id=new#assistant-detail');
assert.equal(reloads,1);
""".replace('FUNCTION',function)
        result = subprocess.run(['node','-e',check],capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual(script.count('    openResult(result);'),3)

    def test_new_http_actions_keep_host_origin_csrf_guards(self):
        app = Application(self.settings,remote=self.remote)
        server = Server(('127.0.0.1',0),Handler)
        self.addCleanup(server.server_close)
        app.port = server.server_port
        app.origin = 'http://127.0.0.1:'+str(app.port)
        server.app = app
        threading.Thread(target=server.serve_forever,daemon=True).start()
        self.addCleanup(server.shutdown)
        headers = {'Cookie':'kairo_local='+app.session,'Content-Type':'application/json','X-CSRF':app.csrf,'Origin':app.origin}
        data = json.dumps(dict(kind='folder',provider='amazon'))
        def request(extra):
            conn = http.client.HTTPConnection('127.0.0.1',app.port)
            conn.request('POST','/api/assistant-requests',body=data,headers=headers|extra)
            response = conn.getresponse()
            status = response.status
            response.read()
            conn.close()
            return status
        for invalid in ({'Host':'evil.test'},{'Origin':'https://evil.test'},{'X-CSRF':'wrong'}):
            self.assertEqual(request(invalid),403)
        self.assertEqual(self.store.list(),[])
        self.assertFalse(self.store.folder().exists())
        self.assertEqual(request({}),200)
        self.assertEqual(len(self.store.list()),1)
        self.assertEqual(self.calls,[])


if __name__=='__main__':
    unittest.main()

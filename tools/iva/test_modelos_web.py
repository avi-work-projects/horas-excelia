import hashlib
import json
import re
from pathlib import Path
import tempfile
import unittest
import shutil
import subprocess
from unittest.mock import patch
import modelos_web
from vat_dashboard import response, render


def fixture(root):
    raw=b'%PDF-1.4\nfixture'
    (root/'document.pdf').write_bytes(raw)
    sha=hashlib.sha256(raw).hexdigest()
    record=dict(kind='expense',period='4T',party='<script>alert(1)</script>',number='X1',date='2026-10-01',base='100.00',vat='21.00',withholding='0.00',total='121.00',include=True,source='document.pdf',sha256=sha)
    ledger={'year':2026,'records':[record]}
    quarters={q:dict(boxes={'09':'210.00','29':'21.00','71':None},reference={},difference={},coverage='Solo documentación incorporada') for q in ('1T','2T','3T','4T')}
    report=dict(year=2026,as_of='2026-10-25',quarters=quarters,missing_receipt_metadata=[])
    index={'updated':'2026-10-26','downloads':{}}
    for key,obj in [('report',report),('ledger',ledger)]:
        contents=json.dumps(obj).encode()
        (root/(key+'.json')).write_bytes(contents)
        index[key]={'path':key+'.json','sha256':hashlib.sha256(contents).hexdigest()}
    (root/'modelos-index.json').write_text(json.dumps(index))
    return index,report,ledger


class ModelosTests(unittest.TestCase):
    def test_original_requires_verified_ledger_and_original(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            _,_,ledger=fixture(root)
            sha=ledger['records'][0]['sha256']
            url='/facturas/modelos/documento?id='+sha
            self.assertEqual(response(root,url)[0],200)
            self.assertEqual(response(root,'/modelos/documento?id='+sha)[2],'application/pdf')
            self.assertEqual(response(root,'/modelos/documento?id=../../private')[0],404)
            (root/'document.pdf').write_bytes(b'%PDF-1.4\nchanged')
            self.assertEqual(response(root,url)[0],503)

    def test_document_content_escaped_and_no_zero_from_missing_result(self):
        with tempfile.TemporaryDirectory() as folder:
            index,report,ledger=fixture(Path(folder))
            html=render(index,report,ledger,'4T','documentos')
            self.assertNotIn('<script>alert(1)</script>',html)
            self.assertIn('&lt;script&gt;',html)
            self.assertIn('documento?id=',html)
            result=render(index,report,ledger,'4T','revision')
            self.assertIn('Resultado provisional',result)
            self.assertIn('Pendiente',result)
            self.assertNotIn('Listo para presentar',result)

    def test_versioned_document_root_is_confined_and_verified(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            index,_,ledger=fixture(root)
            version=root/'_versions'/'revision'
            version.mkdir(parents=True)
            (version/'document.pdf').write_bytes((root/'document.pdf').read_bytes())
            index['document_root']='_versions/revision'
            (root/'modelos-index.json').write_text(json.dumps(index))
            url='/modelos/documento?id='+ledger['records'][0]['sha256']
            self.assertEqual(response(root,url)[0],200)
            index['document_root']='../outside'
            (root/'modelos-index.json').write_text(json.dumps(index))
            self.assertEqual(response(root,url)[0],503)

    def test_route_dispatch_and_unknown_mutation_fields_rejected(self):
        self.assertIsNone(modelos_web.get('unused','/facturas/approve','csrf'))
        self.assertIsNone(modelos_web.post('unused','/approve',{},'actor'))
        with patch.object(modelos_web,'store') as factory:
            with self.assertRaises(ValueError):
                modelos_web.post('runtime','/modelos/gastos',{'action':'edit','fields':{'archive_path':'../escape'}},'actor')
            factory.return_value.update.assert_not_called()

    def test_expense_approval_passes_exact_revision_without_user_actor_override(self):
        with patch.object(modelos_web,'store') as factory, patch('model_events.request') as request:
            queue=factory.return_value
            queue.approve.return_value={'id':'abc','revision':'r2','state':'approved'}
            result=modelos_web.post('runtime','/modelos/gastos',{'action':'approve','id':'abc','revision':'r1','actor':'forged'},'authenticated-owner')
            queue.approve.assert_called_once_with('abc','r1','authenticated-owner')
            self.assertEqual(result['state'],'approved')
            self.assertIn('pendiente de incorporación',result['message'])
            request.assert_called_once_with('runtime','expense','authenticated-owner')

    def test_untrusted_filename_text_and_csrf_cannot_break_html_script(self):
        row={'id':'abc','revision':'r','state':'draft','filename':'<img src=x onerror=alert(1)>','pages':1,'fields':{},'warnings':[]}
        html=modelos_web.render(row,[], '</script><script>evil()</script>')
        self.assertNotIn('<img src=x',html)
        self.assertNotIn('</script><script>evil()',html)
        approved=modelos_web.render(row|{'state':'approved'},[],'csrf')
        self.assertNotIn('id="expense-approve"',approved)
        self.assertIn('<fieldset style="border:0;padding:0;margin:0;min-width:0" disabled',approved)

    def test_real_expense_routes_upload_review_approve_and_verified_download(self):
        from test_expense_workflow import pdf, fields
        with tempfile.TemporaryDirectory() as folder:
            runtime=Path(folder)
            first=modelos_web.post(runtime,'/modelos/gastos',{'action':'upload','filename':'sample.pdf','pdf':pdf()},'owner')
            self.assertEqual(modelos_web.get(runtime,first['url'],'csrf')[0],200)
            saved=modelos_web.post(runtime,'/modelos/gastos',{'action':'edit','id':first['id'],'revision':first['revision'],'fields':fields()},'owner')
            approved=modelos_web.post(runtime,'/modelos/gastos',{'action':'approve','id':saved['id'],'revision':saved['revision']},'owner')
            self.assertEqual(approved['state'],'approved')
            from model_events import status
            self.assertEqual(status(runtime)['requested_seq'],1)
            package=modelos_web.get(runtime,'/modelos/gastos/paquete?id='+approved['id'],'csrf')
            self.assertEqual(package[0],200)
            self.assertEqual(modelos_web.get(runtime,'/modelos/gastos/pdf?id='+approved['id'],'csrf')[2],'application/pdf')
            with self.assertRaises(ValueError):
                modelos_web.post(runtime,'/modelos/gastos',{'action':'edit','id':approved['id'],'revision':approved['revision'],'fields':fields()},'owner')

    def test_sync_status_does_not_disclose_internal_exception_or_document_paths(self):
        html=modelos_web.render(None,[],'csrf',{'state':'pending','message':'PRIVATE/PATH/TOKEN'})
        self.assertIn('Sincronización pendiente',html)
        self.assertNotIn('PRIVATE/PATH/TOKEN',html)
        html=modelos_web.render(None,[],'csrf',{'state':'verified','warnings':['PRIVATE/FILE']})
        self.assertIn('Documentos por revisar',html)
        self.assertNotIn('PRIVATE/FILE',html)

    def test_dashboard_and_status_get_never_request_update_or_create_runtime(self):
        with tempfile.TemporaryDirectory() as folder, patch('model_events.request') as request:
            root=Path(folder)
            fixture(root)
            runtime=root/'not-created'
            self.assertEqual(response(root,'/modelos',csrf='token',runtime=runtime)[0],200)
            result=modelos_web.get(runtime,'/facturas/modelos/actualizacion','token')
            self.assertEqual(result[0],200)
            self.assertEqual(json.loads(result[1])['state'],'idle')
            self.assertEqual(result[3]['Cache-Control'],'no-store')
            self.assertFalse(runtime.exists())
            request.assert_not_called()

    def test_manual_request_uses_authenticated_actor_without_opening_expense_store(self):
        state={'state':'queued','requested_seq':1,'processed_seq':0,'pending':True}
        with patch('model_events.request',return_value=state) as request, patch.object(modelos_web,'store') as factory:
            result=modelos_web.post('runtime','/facturas/modelos/actualizar',{'actor':'forged','reason':'evidence'},'owner')
            self.assertEqual(result,state)
            request.assert_called_once_with('runtime','manual','owner')
            factory.assert_not_called()

    def test_upload_edit_and_failed_approval_do_not_request_updates(self):
        with patch('model_events.request') as request, patch.object(modelos_web,'store') as factory:
            queue=factory.return_value
            queue.upload.return_value=queue.update.return_value={'id':'abc','revision':'r1','state':'draft'}
            modelos_web.post('runtime','/modelos/gastos',{'action':'upload'},'owner')
            modelos_web.post('runtime','/modelos/gastos',{'action':'edit','fields':{}},'owner')
            queue.approve.side_effect=ValueError('Not reviewed')
            with self.assertRaises(ValueError):
                modelos_web.post('runtime','/modelos/gastos',{'action':'approve'},'owner')
            request.assert_not_called()

    def test_update_failure_after_successful_approval_preserves_approval_and_recovery(self):
        with patch('model_events.request',side_effect=OSError('PRIVATE/PATH')) as request, patch.object(modelos_web,'store') as factory:
            queue=factory.return_value
            queue.approve.return_value={'id':'abc','revision':'r2','state':'approved'}
            result=modelos_web.post('runtime','/modelos/gastos',{'action':'approve','id':'abc','revision':'r1'},'owner')
            self.assertEqual(result['state'],'approved')
            self.assertIn('actualizacion=pendiente',result['url'])
            self.assertNotIn('PRIVATE/PATH',result['message'])
            self.assertIn('Actualizar datos',result['message'])
            queue.get.return_value=queue.approve.return_value|{'filename':'f.pdf','fields':{}}
            page=modelos_web.get('runtime',result['url'],'token')[1]
            self.assertIn('no necesitas volver a aprobar',page)
            self.assertNotIn('id="expense-approve"',page)

    def test_update_controls_escape_status_and_csrf_and_use_only_manual_actions(self):
        from vat_dashboard import update_controls
        html=update_controls('</script><script>evil()</script>',{'state':'queued','message':'<script>bad()</script>'})
        self.assertNotIn('</script><script>evil()',html)
        self.assertNotIn('<script>bad()',html)
        self.assertIn('id="modelos-update" class="m-button m-primary" disabled',html)
        self.assertIn('Ver estado',html)
        self.assertNotIn('setInterval',html)
        self.assertNotIn('setTimeout',html)

    def test_upload_duplicate_preserves_review_and_reports_existing_document(self):
        from test_expense_workflow import pdf, fields
        with tempfile.TemporaryDirectory() as folder, patch('model_events.request') as request:
            first=modelos_web.post(folder,'/modelos/gastos',{'action':'upload','filename':'factura.pdf','pdf':pdf()},'owner')
            self.assertFalse(first['duplicate'])
            saved=modelos_web.post(folder,'/modelos/gastos',{'action':'edit','id':first['id'],'revision':first['revision'],'fields':fields()},'owner')
            repeated=modelos_web.post(folder,'/modelos/gastos',{'action':'upload','filename':'otra-copia.pdf','pdf':pdf()},'owner')
            self.assertTrue(repeated['duplicate'])
            self.assertEqual(repeated['id'],saved['id'])
            self.assertEqual(repeated['revision'],saved['revision'])
            request.assert_not_called()

    def test_queue_filters_combine_state_scope_category_without_mutating_rows(self):
        rows=[{'id':'a','state':'draft','fields':{'category':'electricity','tax_scope':'irpf_only'}},
              {'id':'b','state':'approved','fields':{'category':'electricity','tax_scope':'irpf_only'}},
              {'id':'c','state':'draft','fields':{'category':'gas','tax_scope':'review'}}]
        original=json.dumps(rows)
        filters=modelos_web.filters_from_query({'estado':['draft'],'alcance':['irpf_only'],'categoria':['electricity']})
        self.assertEqual([row['id'] for row in modelos_web.filtered_rows(rows,filters)],['a'])
        self.assertEqual(json.dumps(rows),original)
        with self.assertRaises(ValueError):modelos_web.filters_from_query({'categoria':['<script>']})

    def test_incomplete_amount_in_one_draft_does_not_break_the_inbox(self):
        row={'id':'abc','state':'draft','filename':'pendiente.pdf','fields':{'total':'ilegible'}}
        html=modelos_web.render(None,[row],'token')
        self.assertIn('pendiente.pdf',html)
        self.assertIn('Por revisar',html)

    def test_renta_fields_pass_through_routes_without_entering_vat(self):
        from test_expense_workflow import pdf, fields
        with tempfile.TemporaryDirectory() as folder:
            first=modelos_web.post(folder,'/modelos/gastos',{'action':'upload','filename':'luz.pdf','pdf':pdf()},'owner')
            review=fields()|dict(category='electricity',tax_scope='irpf_only',irpf_treatment='pending',include=False,mapping='pending',buyer_tax_id='',buyer_identity_confirmed=False,fiscal_review_confirmed=False,invoice_status='needs_review',tax_id='')
            saved=modelos_web.post(folder,'/modelos/gastos',{'action':'edit','id':first['id'],'revision':first['revision'],'fields':review},'owner')
            approved=modelos_web.post(folder,'/modelos/gastos',{'action':'approve','id':saved['id'],'revision':saved['revision']},'owner')
            record=json.loads(modelos_web.get(folder,'/modelos/gastos/paquete?id='+approved['id'],'token')[1])['record']
            self.assertFalse(record['include'])
            self.assertEqual(record['tax_scope'],'irpf_only')
            self.assertEqual(record['irpf_treatment'],'pending')
            self.assertEqual(record['vat'],'21.00')
            html=modelos_web.get(folder,approved['url'],'token')[1]
            self.assertIn('sin deducción IRPF calculada',html)

    def test_save_and_next_chooses_another_pending_draft_without_approving(self):
        from test_expense_workflow import pdf, fields
        with tempfile.TemporaryDirectory() as folder, patch('model_events.request') as request:
            drafts=[modelos_web.post(folder,'/modelos/gastos',{'action':'upload','filename':name+'.pdf','pdf':pdf(name)},'owner') for name in ('one','two')]
            first,second=drafts
            result=modelos_web.post(folder,'/modelos/gastos',{'action':'edit','id':first['id'],'revision':first['revision'],'fields':fields(),'next':True},'owner')
            self.assertEqual(result['url'],modelos_web.BASE+'?id='+second['id'])
            self.assertEqual(modelos_web.store(folder).get(first['id'])['state'],'draft')
            request.assert_not_called()

    @unittest.skipUnless(shutil.which('node'),'Node is required to exercise browser batch logic')
    def test_batch_upload_is_sequential_and_keeps_successes_after_errors(self):
        program=r'''
const assert=require('node:assert/strict');
const upload=new Function(SOURCE+';return uploadExpenseFiles;')();
const file=(name,size=3)=>({name,size,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer});
let active=0,calls=0;const progress=[];
(async()=>{const results=await upload([file('ok.pdf'),file('duplicate.pdf'),file('bad.pdf'),file('big.pdf',8*1024*1024+1),file('after.pdf')],async body=>{
 assert.equal(active,0);active++;calls++;await Promise.resolve();active--;
 if(body.filename==='bad.pdf')throw Error('PDF dañado');
 return {duplicate:body.filename==='duplicate.pdf',url:'/facturas/modelos/gastos?id=fixture',message:'Conservado'};
},result=>progress.push(result));
assert.equal(calls,4);assert.deepEqual(results.map(r=>r.state),['saved','duplicate','error','error','saved']);assert.ok(results[0].url);assert.ok(results[4].url);assert.equal(progress.length,10);
})().catch(error=>{console.error(error);process.exitCode=1});
'''.replace('SOURCE',json.dumps(modelos_web.BATCH_SCRIPT))
        result=subprocess.run([shutil.which('node'),'-e',program],capture_output=True,text=True,timeout=15)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_navigation_and_review_escape_new_fiscal_fields_and_show_no_auto_job(self):
        from modelos_ui import navigation
        row={'id':'abc','revision':'r1','state':'draft','filename':'invoice.pdf','pages':1,
             'fields':{'business_purpose':'</textarea><script>evil()</script>','order_reference':'<img src=x>','buyer_tax_id':'\"><svg onload=evil()>','category':'electricity','tax_scope':'irpf_only'}}
        html=modelos_web.render(row,[],'token')
        self.assertNotIn('</textarea><script>evil()',html)
        self.assertNotIn('<img src=x>',html)
        self.assertIn('Copiar texto',html)
        self.assertIn('sin deducción IRPF calculada',html)
        self.assertNotIn('setInterval',html)
        self.assertEqual(navigation('gastos').count('aria-current="page"'),1)
        self.assertIn('vista=modelos',navigation('gastos'))

    def test_pdf_preview_is_opt_in_with_new_tab_original_fallback(self):
        row={'id':'abc','revision':'r1','state':'draft','filename':'invoice.pdf','pages':1,'fields':{}}
        html=modelos_web.render(row,[],'token')
        iframe=re.search(r'<iframe\b[^>]*>',html).group()
        self.assertNotIn('src=',iframe)
        self.assertIn('hidden',iframe)
        details=re.search(r'<details\b[^>]*id="expense-preview"[^>]*>',html).group()
        self.assertNotIn(' open',details)
        self.assertIn('data-pdf-url=',details)
        self.assertIn('target="_blank" rel="noopener">Abrir PDF completo',html)
        self.assertNotIn('matchMedia',html)
        self.assertIn("addEventListener('toggle'",html)

    @unittest.skipUnless(shutil.which('node'),'Node is required to exercise PDF loader')
    def test_pdf_loader_accepts_authenticated_pdf_with_deny_header_and_rejects_html(self):
        program=r'''
const assert=require('node:assert/strict');
const load=new Function(SOURCE+';return fetchExpensePdf;')();
(async()=>{
 let calls=0;
 const pdf=await load('/facturas/modelos/gastos/pdf?id=fixture',async(url,options)=>{
  calls++;assert.equal(options.credentials,'same-origin');assert.equal(options.cache,'no-store');
  return new Response('%PDF-1.4\nfixture',{headers:{'Content-Type':'application/pdf','X-Frame-Options':'DENY'}});
 });
 assert.equal(calls,1);assert.equal(await pdf.slice(0,5).text(),'%PDF-');
 const objectUrl=URL.createObjectURL(pdf);assert.ok(objectUrl.startsWith('blob:'));URL.revokeObjectURL(objectUrl);
 for(const response of [new Response('<html>Denied</html>',{status:403}),new Response('<html>Login</html>',{headers:{'Content-Type':'text/html'}}),new Response('not a pdf',{headers:{'Content-Type':'application/pdf'}})]){
  await assert.rejects(load('/private',async()=>response));
 }
})().catch(error=>{console.error(error);process.exitCode=1});
'''.replace('SOURCE',json.dumps(modelos_web.PDF_SCRIPT))
        result=subprocess.run([shutil.which('node'),'-e',program],capture_output=True,text=True,timeout=15)
        self.assertEqual(result.returncode,0,result.stderr)


if __name__=='__main__':
    unittest.main()

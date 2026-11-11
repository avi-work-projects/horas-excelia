import hashlib
import json
from pathlib import Path
import tempfile
import unittest
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
        with patch.object(modelos_web,'store') as factory:
            queue=factory.return_value
            queue.approve.return_value={'id':'abc','revision':'r2','state':'approved'}
            result=modelos_web.post('runtime','/modelos/gastos',{'action':'approve','id':'abc','revision':'r1','actor':'forged'},'authenticated-owner')
            queue.approve.assert_called_once_with('abc','r1','authenticated-owner')
            self.assertEqual(result['state'],'approved')
            self.assertIn('pendiente de incorporación',result['message'])

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


if __name__=='__main__':
    unittest.main()

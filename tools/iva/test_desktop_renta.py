"""Renta is an explicit documentary workflow, separate from the fiscal ledger."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

from desktop_app import Application


class DesktopRentaTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.archive = self.root/'archive'
        self.archive.mkdir()
        config = self.root/'config.json'
        config.write_text(json.dumps(dict(archive_root=str(self.archive),index='index.json')))
        settings = self.root/'desktop.json'
        settings.write_text(json.dumps(dict(models_config=str(config),state_root=str(self.root/'state'),
            accounts=['one@example.test','two@example.test'])))
        self.remote = Mock(side_effect=AssertionError('Must not contact the fiscal worker'))
        self.app = Application(settings,self.remote)
        self.catalog_path = self.app.renta_store().path
        self.catalog = dict(year=2026,items=[dict(id='internet',label='Internet',note='Confirmar periodo')],
            documents=[dict(path='FACTURAS/2026/internet.pdf',sha256='a'*64,item_id='internet')])

    def test_renta_page_is_local_and_read_only(self):
        before = set(self.root.rglob('*'))
        status, body = self.app.get('/facturas/modelos?vista=renta')
        self.assertEqual(status,200)
        self.assertIn('Renta',body)
        self.assertEqual(before,set(self.root.rglob('*')))
        self.remote.assert_not_called()

    def test_search_all_accounts_records_documentary_context_only(self):
        with patch.object(self.app,'renta_store') as store:
            store.return_value.read.return_value = self.catalog
            store.return_value.path = self.catalog_path
            result = self.app.post('/api/renta-search',dict(item='internet',kind='mail',account='all'))
        record = self.app.assistant_store().get(result['id'])
        self.assertIn('one@example.test',record['request']['account'])
        self.assertIn('two@example.test',record['request']['account'])
        self.assertEqual(record['request']['date_from'],'2026-01-01')
        self.assertEqual(record['request']['renta_item'],'internet')
        self.assertIn('a'*64,record['request']['renta_context'])
        self.remote.assert_not_called()

    def test_search_bounds_document_count_and_prioritizes_the_selected_item(self):
        linked = dict(path='FACTURAS/2026/linked.pdf',sha256='b'*64,item_id='internet')
        self.catalog['documents'] = [dict(path='FACTURAS/2026/document-'+str(n)+'.pdf',
                                          sha256=f'{n:064x}',item_id=None) for n in range(180)] + [linked]
        with patch.object(self.app,'renta_store') as store:
            store.return_value.read.return_value = self.catalog
            store.return_value.path = self.catalog_path
            result = self.app.post('/api/renta-search',dict(item='internet',kind='web',account='all'))
        context = json.loads(self.app.assistant_store().get(result['id'])['request']['renta_context'])
        self.assertEqual(context['documentos_conocidos'][0],dict(path=linked['path'],sha256=linked['sha256']))
        self.assertEqual(len(context['documentos_conocidos']),60)
        self.assertEqual(context['documentos_omitidos'],121)
        self.assertEqual(context['documentos_totales'],181)
        self.assertEqual(context['catalogo_completo'],str(self.catalog_path.resolve()))
        self.assertIn('catálogo completo',context['aviso'])
        self.remote.assert_not_called()

    def test_search_bounds_utf8_context_without_truncating_metadata(self):
        note = 'Revisión 🧾 ' * 170
        self.catalog['items'][0]['note'] = note
        self.catalog['documents'] = [dict(path='FACTURAS/2026/'+('á🧾'*180)+str(n)+'.pdf',
                                          sha256=f'{n:064x}',item_id='internet') for n in range(2000)]
        with patch.object(self.app,'renta_store') as store:
            store.return_value.read.return_value = self.catalog
            store.return_value.path = self.catalog_path
            result = self.app.post('/api/renta-search',dict(item='internet',kind='mail',account='all'))
        raw = self.app.assistant_store().get(result['id'])['request']['renta_context']
        context = json.loads(raw)
        self.assertLessEqual(len(raw),16000)
        self.assertLessEqual(len(raw.encode('utf-8')),16000)
        self.assertLessEqual(len(json.dumps(context['documentos_conocidos'],ensure_ascii=False).encode('utf-8')),12000)
        self.assertEqual(context['nota'],note)
        self.assertEqual(context['partida'],'Internet')
        self.assertGreater(len(context['documentos_conocidos']),0)
        self.assertEqual(context['documentos_omitidos'],2000-len(context['documentos_conocidos']))
        self.remote.assert_not_called()

    def test_pdf_response_uses_verified_bytes_even_if_original_changes(self):
        store = self.app.renta_store()
        raw = b'%PDF-1.7\noriginal\n%%EOF\n'
        changed = b'%PDF-1.7\nreplacement\n%%EOF\n'
        sha = hashlib.sha256(raw).hexdigest()
        document = self.archive/'FACTURAS/2026/original.pdf'
        document.parent.mkdir(parents=True)
        document.write_bytes(raw)
        catalog = store._empty()
        catalog['documents'] = [dict(path='FACTURAS/2026/original.pdf',sha256=sha,item_id=None)]
        store._save(catalog)
        read_pdf = store._pdf
        def replace_after_read(relative):
            verified = read_pdf(relative)
            document.write_bytes(changed)
            return verified
        with patch.object(self.app,'renta_store',return_value=store), patch.object(store,'_pdf',side_effect=replace_after_read):
            status, body, content_type, headers = self.app.get('/renta/documento?id='+sha)
        self.assertEqual(status,200)
        self.assertEqual(body,raw)
        self.assertEqual(content_type,'application/pdf')
        self.assertTrue(headers['Content-Disposition'].startswith('inline;'))
        self.assertEqual(document.read_bytes(),changed)
        self.remote.assert_not_called()

    def test_unknown_item_or_account_is_rejected_without_creating_request(self):
        with patch.object(self.app,'renta_store') as store:
            store.return_value.read.return_value = self.catalog
            for supplied in (dict(item='missing',kind='mail',account='all'),
                             dict(item='internet',kind='mail',account='outsider@example.test')):
                with self.assertRaises(ValueError):
                    self.app.post('/api/renta-search',supplied)
        self.assertEqual(self.app.assistant_store().list(),[])

    def test_mark_and_scan_do_not_update_fiscal_worker(self):
        with patch.object(self.app,'renta_store') as store:
            self.app.post('/api/renta-mark',dict(item='internet',complete=True))
            store.return_value.mark.assert_called_once_with('internet',True)
            self.app.post('/api/renta-scan',{})
            store.return_value.scan.assert_called_once_with()
        self.remote.assert_not_called()


if __name__ == '__main__':
    unittest.main()

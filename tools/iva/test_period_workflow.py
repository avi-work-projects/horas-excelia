import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from rehearse_fourth import build_case
from closing import Store, digest
from period_workflow import save_review, build_candidate, CHECKS
from sync_models import publish

class PeriodIntegrationTests(unittest.TestCase):
    def test_real_303_engine_approval_and_source_change(self):
        design=os.environ.get('IVA303_DESIGN')
        if not design:self.skipTest('Set IVA303_DESIGN to original AEAT workbook')
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)/'archive';data,_=build_case(root)
            runtime=Path(folder)/'runtime';runtime.mkdir()
            (root/'identity.json').write_text(json.dumps(dict(nif='00000000T',name='ENSAYO FICTICIO',developer_nif='00000000T',foral_only=False,monthly_refund=False)))
            (root/'payment.json').write_text(json.dumps(dict(mode='direct_debit',iban='ES9121000418450200051332')))
            config=dict(archive_root=str(root),ledger='libro_ficticio.json',identity='identity.json',payment='payment.json',design=design,year=2026)
            (runtime/'config.json').write_text(json.dumps(config))
            original=(root/'libro_ficticio.json').read_bytes()
            supplied=dict(ledger_hash=digest(original),mode='U',**{k:True for k in CHECKS})
            with self.assertRaises(ValueError):save_review(runtime,'4T',supplied|{'fiscal':False},'test')
            save_review(runtime,'4T',supplied,'test')
            candidate=build_candidate(runtime,'4T');self.assertEqual(candidate['boxes']['71'],'189.00')
            store=Store(runtime/'new-closing.sqlite')
            store.act('4T','prepare',None,candidate,'test')
            with self.assertRaises(ValueError):store.download(candidate)
            store.act('4T','approve',candidate['revision'],candidate,'test')
            store.act('4T','generate',candidate['revision'],candidate,'test')
            raw=store.download(candidate);self.assertIn(b'20264T',raw);self.assertIn(b'ES9121000418450200051332',raw)
            self.assertEqual((root/'libro_ficticio.json').read_bytes(),original)
            data['coverage']['4T']='Nueva revisión';(root/'libro_ficticio.json').write_text(json.dumps(data))
            with self.assertRaises(ValueError):build_candidate(runtime,'4T')
    def test_failed_drive_verification_keeps_active_index(self):
        with tempfile.TemporaryDirectory() as folder:
            runtime=Path(folder)/'runtime';runtime.mkdir();root=Path(folder)/'consulta';root.mkdir()
            old=b'OLD';(root/'modelos-index.json').write_bytes(old)
            config=dict(archive_root=str(root),consultation_root=str(root),drive_config='private.conf',drive_remote='test:')
            (runtime/'config.json').write_text(json.dumps(config))
            manifest=dict(files=[dict(path='libro.json',sha256=digest(b'RIGHT'))],index='index.json',ledger_sha256='x')
            def copy_wrong(args,**kwargs):Path(args[-1]).write_bytes(b'WRONG')
            with patch('sync_models.subprocess.run',side_effect=copy_wrong):
                with self.assertRaises(ValueError):publish(runtime,manifest)
            self.assertEqual((root/'modelos-index.json').read_bytes(),old)
            self.assertEqual(json.loads((runtime/'config.json').read_text()),config)
    def test_versioned_snapshot_contains_only_verified_files(self):
        with tempfile.TemporaryDirectory() as folder:
            runtime=Path(folder)/'runtime';runtime.mkdir();root=Path(folder)/'consulta';root.mkdir()
            items={'libro.json':b'{}','report.json':b'{}'}
            index=dict(ledger=dict(path='libro.json',sha256=digest(items['libro.json'])),report=dict(path='report.json',sha256=digest(items['report.json'])),downloads={})
            items['index.json']=json.dumps(index).encode()
            for name,raw in items.items():(root/name).write_bytes(raw)
            config=dict(archive_root=str(root),consultation_root=str(root),drive_config='private.conf',drive_remote='test:')
            (runtime/'config.json').write_text(json.dumps(config))
            manifest=dict(files=[dict(path=n,sha256=digest(v)) for n,v in items.items()],index='index.json',ledger_sha256=digest(b'{}'))
            result=publish(runtime,manifest)
            published=json.loads((root/'modelos-index.json').read_text())
            self.assertEqual(published['sync']['state'],'verified')
            self.assertEqual((root/published['ledger']['path']).read_bytes(),b'{}')
            self.assertEqual(published['document_root'],'_versions/'+result['version'])

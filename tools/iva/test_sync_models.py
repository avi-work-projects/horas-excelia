"""Synthetic integration cases for the archive worker's publication boundary."""
import base64
from copy import deepcopy
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from pypdf import PdfWriter
from expense_workflow import ExpenseStore, digest, encoded
import sync_models


def synthetic_pdf():
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


class WorkerIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.root = self.base / 'archive'
        self.root.mkdir()
        self.ledger_relative = 'LIBROS CONTABLES/2026/datos.json'
        self.ledger = self.root / self.ledger_relative
        self.ledger.parent.mkdir(parents=True)
        self.data = dict(year=2026, as_of='2026-10-25', records=[], documents=[],
                         coverage={q:'incomplete' for q in ('1T','2T','3T','4T')}, references={})
        self.ledger.write_bytes(encoded(self.data))
        self.index_relative = 'REVISIONES/2026/modelos-index.json'
        self.index = self.root / self.index_relative
        self.index.parent.mkdir(parents=True)
        self.index.write_bytes(encoded({'downloads': {}}))
        self.backup = self.base / 'private-backups'
        self.config = dict(archive_root=str(self.root), ledger=self.ledger_relative,
                           index=self.index_relative, backup_root=str(self.backup))
        self.store = ExpenseStore(self.base / 'queue')

    def approve_expense(self):
        draft = self.store.upload('test.pdf', base64.b64encode(synthetic_pdf()).decode(), 'owner')
        fields = dict(year=2026, number='EXPENSE-1', party='Synthetic', tax_id='B00000000',
                      date='2026-11-01', period='4T', base='100.00', vat='21.00',
                      withholding='0.00', total='121.00', include=True,
                      mapping='domestic21', rate='21.00', note='Synthetic review',
                      reviewed_all_pages=True, single_invoice=True, fiscal_review_confirmed=True)
        draft = self.store.edit(draft['id'], draft['revision'], fields, 'owner')
        return self.store.approve(draft['id'], draft['revision'], 'owner')

    def test_publication_failure_retains_approval_and_retry_does_not_double_count(self):
        draft = self.approve_expense()
        calls = []
        fail_publication = [True]
        def fake_remote(config, request):
            action = request['action']
            calls.append(action)
            if action == 'outbox':
                return [self.store.bundle(d['id']) for d in self.store.list() if d['state']=='approved']
            if action == 'evidence_outbox':
                return []
            if action == 'publish':
                if fail_publication[0]:
                    raise RuntimeError('Drive snapshot not available yet')
                return {'ledger_sha256':request['manifest']['ledger_sha256']}
            if action == 'ack':
                return self.store.mark_applied(request['id'], request['bundle_sha256'], request['ledger_sha256'])
            if action == 'status':
                return {'ok': True}
            raise AssertionError(action)
        with patch.object(sync_models, 'remote', fake_remote):
            with self.assertRaises(RuntimeError):
                sync_models.run(self.config)
            self.assertEqual(self.store.get(draft['id'])['state'], 'approved')
            self.assertNotIn('ack', calls)
            self.assertEqual(len(json.loads(self.ledger.read_bytes())['records']), 1)
            fail_publication[0] = False
            status = sync_models.run(self.config)
        self.assertEqual(status['state'], 'verified')
        self.assertEqual(self.store.get(draft['id'])['state'], 'incorporated')
        self.assertEqual(len(json.loads(self.ledger.read_bytes())['records']), 1)

    def evidence(self):
        raw = synthetic_pdf()
        return {'id':1, 'period':'2026-3T', 'pdf':base64.b64encode(raw).decode(), 'data':{
            'kind':'filing', 'sha256':digest(raw), 'provenance':'Synthetic user-reviewed receipt',
            'boxes':{'07':'100.00','09':'21.00','28':'0.00','29':'0.00','45':'0.00','46':'21.00','71':'21.00'}}}

    def test_different_historical_reference_never_overwritten(self):
        item = self.evidence()
        self.data['references']['3T'] = dict(item['data']['boxes']) | {'71':'20.99'}
        before = encoded(self.data)
        self.ledger.write_bytes(before)
        with self.assertRaises(ValueError):
            sync_models.apply_evidence(self.root, self.ledger_relative, item, backup_root=self.backup)
        self.assertEqual(self.ledger.read_bytes(), before)
        self.assertFalse((self.root / 'REVISIONES/2026/JUSTIFICANTES').exists())

    def test_evidence_retry_preserves_history_and_has_private_backup(self):
        item = self.evidence()
        self.data['references']['1T'] = {'71':'123.45'}
        self.ledger.write_bytes(encoded(self.data))
        sync_models.apply_evidence(self.root, self.ledger_relative, item, backup_root=self.backup)
        once = self.ledger.read_bytes()
        sync_models.apply_evidence(self.root, self.ledger_relative, item, backup_root=self.backup)
        self.assertEqual(once, self.ledger.read_bytes())
        updated = json.loads(once)
        self.assertEqual(updated['references']['1T']['71'], '123.45')
        self.assertEqual(len(updated['documents']), 1)
        self.assertFalse((self.ledger.parent/'backups').exists())
        self.assertTrue(any(self.backup.glob('*.json')))

    def test_validation_archive_preserves_approved_ledger_version(self):
        item = self.evidence()
        item['data']['kind'] = 'validation'
        before = self.ledger.read_bytes()
        sync_models.apply_evidence(self.root, self.ledger_relative, item, self.backup)
        self.assertEqual(self.ledger.read_bytes(), before)
        manifest = sync_models.build_manifest(self.root, self.ledger_relative, self.index_relative, self.backup)
        proofs = [f for f in manifest['files'] if '/JUSTIFICANTES/' in f['path']]
        self.assertEqual(len(proofs), 2)

    def test_manifest_refuses_concurrent_book_change_instead_of_mixing_versions(self):
        import review_year
        real_review = review_year.review
        def mutate_during_review(data, root):
            result = real_review(data, root)
            changed = deepcopy(data)
            changed['as_of'] = '2026-11-01'
            self.ledger.write_bytes(encoded(changed))
            return result
        with patch.object(review_year, 'review', mutate_during_review):
            with self.assertRaises(ValueError):
                sync_models.build_manifest(self.root, self.ledger_relative, self.index_relative, self.backup)


if __name__ == '__main__':
    unittest.main()

import base64
from copy import deepcopy
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from pypdf import PdfWriter
import expense_workflow as workflow
from expense_workflow import ExpenseStore, apply_bundle, digest, encoded, exclusive


def pdf(tag='one'):
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    writer.add_metadata({'/Title': tag})
    out = io.BytesIO()
    writer.write(out)
    return base64.b64encode(out.getvalue()).decode('ascii')


def fields():
    return dict(year=2026, number='E-TEST', party='Synthetic supplier', tax_id='B00000000',
                date='2026-11-01', period='4T', base='100.00', vat='21.00', withholding='0.00',
                total='121.00', include=True, mapping='domestic21', rate='21.00',
                receipt_date='2026-11-02', receipt_date_source='Synthetic receipt log',
                note='Synthetic test', reviewed_all_pages=True, single_invoice=True,
                fiscal_review_confirmed=True)


class ExpenseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.store = ExpenseStore(self.root / 'queue')
        self.archive = self.root / 'AUTONOMO'
        self.archive.mkdir()
        self.ledger_rel = 'LIBROS CONTABLES/2026/datos_libro_2026.json'
        self.ledger = self.archive / self.ledger_rel
        self.ledger.parent.mkdir(parents=True)
        self.initial = encoded(dict(year=2026, as_of='2026-10-25', records=[], documents=[],
            coverage={q:'Open synthetic coverage' for q in ('1T','2T','3T','4T')},
            references={'3T': {'71':'99.00'}}, profiles={'4T': {'remaining_boxes_confirmed_zero':True}}))
        self.ledger.write_bytes(self.initial)

    def draft(self, tag='one'):
        return self.store.upload('synthetic.pdf', pdf(tag), 'test-user')

    def approved(self, tag='one', **changes):
        draft = self.draft(tag)
        draft = self.store.edit(draft['id'], draft['revision'], fields() | changes, 'test-user')
        return self.store.approve(draft['id'], draft['revision'], 'test-user')

    def apply(self, bundle, expected=None):
        return apply_bundle(bundle, self.archive, self.ledger_rel,
            expected or digest(self.initial), backup_root=self.root / 'backups')

    def test_upload_is_proposal_does_not_change_ledger_and_deduplicates(self):
        first = self.draft()
        second = self.draft()
        self.assertEqual(first['id'], second['id'])
        self.assertEqual(first['state'], 'draft')
        self.assertEqual(first['pages'], 1)
        self.assertEqual(self.ledger.read_bytes(), self.initial)
        with self.assertRaises(ValueError):
            self.store.bundle(first['id'])

    def test_approval_requires_explicit_review_and_balanced_totals(self):
        for override in ({'reviewed_all_pages':False}, {'single_invoice':False},
                         {'fiscal_review_confirmed':False}, {'total':'122.00'},
                         {'mapping':'foreign'}, {'withholding':'15.00', 'total':'106.00'}):
            with self.subTest(override=override):
                draft = self.draft(str(override))
                draft = self.store.edit(draft['id'], draft['revision'], fields() | override, 'user')
                with self.assertRaises(ValueError):
                    self.store.approve(draft['id'], draft['revision'], 'user')

    def test_edit_cas_and_confirmation_invalidation(self):
        d = self.draft()
        edited = self.store.edit(d['id'], d['revision'], fields(), 'user')
        with self.assertRaises(ValueError):
            self.store.edit(d['id'], d['revision'], {'number':'different'}, 'user')
        again = self.store.edit(d['id'], edited['revision'], {'number':'different'}, 'user')
        self.assertFalse(again['fields']['fiscal_review_confirmed'])
        with self.assertRaises(ValueError):
            self.store.approve(d['id'], again['revision'], 'user')

    def test_approved_data_is_immutable_and_pdf_tampering_blocks_export(self):
        d = self.approved()
        with self.assertRaises(ValueError):
            self.store.edit(d['id'], d['revision'], fields(), 'user')
        (self.store.root / d['id'] / 'original.pdf').write_bytes(b'changed')
        with self.assertRaises(ValueError):
            self.store.bundle(d['id'])

    def test_import_recalculates_and_preserves_coverage_and_historical_reference(self):
        d = self.approved()
        result = self.apply(self.store.bundle(d['id']))
        updated = json.loads(self.ledger.read_text())
        self.assertEqual(updated['calculations']['4T']['boxes']['71'], '-21.00')
        self.assertEqual(updated['as_of'], '2026-10-25')
        self.assertEqual(updated['references']['3T']['71'], '99.00')
        self.assertEqual(len(updated['records']), 1)
        index = json.loads((self.archive / result['index_path']).read_text())
        snapshot = self.archive / index['ledger']['path']
        self.assertEqual(digest(snapshot.read_bytes()), index['ledger']['sha256'])
        self.assertEqual(snapshot.read_bytes(), self.ledger.read_bytes())
        self.assertFalse(result['remote_verified'])

    def test_retry_is_idempotent_after_canonical_import_even_stale_expected_hash(self):
        d = self.approved()
        bundle = self.store.bundle(d['id'])
        first = self.apply(bundle)
        again = self.apply(bundle)
        self.assertTrue(again['already_applied'])
        self.assertEqual(first['ledger_sha256'], again['ledger_sha256'])
        self.assertEqual(len(json.loads(self.ledger.read_text())['records']), 1)

    def test_crash_after_ledger_before_index_recovers_on_retry(self):
        d = self.approved()
        bundle = self.store.bundle(d['id'])
        real_atomic = workflow.atomic
        def interrupted(path, raw):
            if Path(path).name == 'modelos-index.json':
                raise OSError('simulated interruption')
            return real_atomic(path, raw)
        with patch.object(workflow, 'atomic', interrupted):
            with self.assertRaises(OSError):
                self.apply(bundle)
        self.assertEqual(len(json.loads(self.ledger.read_text())['records']), 1)
        result = self.apply(bundle)
        self.assertTrue(result['already_applied'])
        self.assertTrue((self.archive / result['index_path']).exists())

    def test_duplicate_identity_in_different_pdf_is_rejected(self):
        one = self.approved('first')
        result = self.apply(self.store.bundle(one['id']))
        two = self.approved('second')
        with self.assertRaises(ValueError):
            self.apply(self.store.bundle(two['id']), result['ledger_sha256'])
        self.assertEqual(len(json.loads(self.ledger.read_text())['records']), 1)

    def test_stale_book_and_concurrent_lock_prevent_import(self):
        d = self.approved()
        bundle = self.store.bundle(d['id'])
        self.ledger.write_bytes(self.initial + b' ')
        with self.assertRaises(ValueError):
            self.apply(bundle)
        self.ledger.write_bytes(self.initial)
        lock = self.root / 'backups' / (digest(str(self.ledger.resolve()).encode()) + '.lock')
        with exclusive(lock):
            with self.assertRaises(ValueError):
                self.apply(bundle)
        self.assertEqual(self.ledger.read_bytes(), self.initial)

    def test_tampered_bundle_and_traversal_blocked(self):
        d = self.approved()
        bundle = self.store.bundle(d['id'])
        bundle['record']['total'] = '999.00'
        with self.assertRaises(ValueError):
            self.apply(bundle)
        for source in ('../outside.pdf', 'FACTURAS/2026/../../../outside.pdf', 'C:/outside.pdf'):
            draft = self.draft(source)
            draft = self.store.edit(draft['id'], draft['revision'], fields() | {'archive_path': source}, 'user')
            with self.assertRaises(ValueError):
                self.store.approve(draft['id'], draft['revision'], 'user')

    def test_existing_original_is_never_overwritten(self):
        d = self.approved()
        bundle = self.store.bundle(d['id'])
        dest = self.archive / bundle['record']['source']
        dest.parent.mkdir(parents=True)
        dest.write_bytes(b'previous original')
        with self.assertRaises(ValueError):
            self.apply(bundle)
        self.assertEqual(dest.read_bytes(), b'previous original')
        self.assertEqual(self.ledger.read_bytes(), self.initial)

    def test_exclusion_retained_without_contributing(self):
        d = self.approved(include=False, mapping='pending', fiscal_review_confirmed=False)
        self.apply(self.store.bundle(d['id']))
        data = json.loads(self.ledger.read_text())
        self.assertEqual(data['calculations']['4T']['boxes']['29'], '0.00')
        self.assertFalse(data['records'][0]['include'])

    def test_worker_ack_is_bound_to_bundle_and_idempotent(self):
        d = self.approved()
        bundle = self.store.bundle(d['id'])
        result = self.apply(bundle)
        with self.assertRaises(ValueError):
            self.store.mark_applied(d['id'], 'a'*64, result['ledger_sha256'])
        ack = self.store.mark_applied(d['id'], bundle['bundle_sha256'], result['ledger_sha256'])
        self.assertEqual(ack['state'], 'incorporated')
        again = self.store.mark_applied(d['id'], bundle['bundle_sha256'], result['ledger_sha256'])
        self.assertEqual(ack['revision'], again['revision'])


if __name__ == '__main__':
    unittest.main()

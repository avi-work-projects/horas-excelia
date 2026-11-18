"""Synthetic documentary fixtures: no fiscal assumptions or private categories."""
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from pypdf import PdfWriter

import renta_documents
from renta_documents import Store, render


def pdf(label):
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    writer.add_metadata({'/Title': label})
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()


class RentaDocumentsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.archive = self.root / 'archive'
        self.archive.mkdir()
        self.store = Store(self.root / 'state', self.archive)
        self.seed = self.store._empty()
        self.seed['items'] = [dict(id='supplies', label='Suministro de prueba', note='Revisar cobertura',
                                   excel_evidence=[dict(path='referencia.xlsx', sheet='Hoja', range='A2')], complete=False),
                              dict(id='reference', label='Otra partida', note='', excel_evidence=[], complete=False)]
        self.store._save(self.seed)

    def put(self, name, raw=None):
        path = self.archive / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(raw if raw is not None else pdf(name))
        return path

    def test_read_has_no_scan_side_effect_and_new_store_is_empty(self):
        path = self.put('FACTURAS/2026/unread.pdf')
        before = self.store.path.read_bytes()
        with patch.object(self.store, 'scan', side_effect=AssertionError('Must be manual')):
            self.assertEqual(self.store.read()['documents'], [])
            render(self.store, ['a@example.test'])
        self.assertEqual(self.store.path.read_bytes(), before)
        self.assertTrue(path.exists())
        another = Store(self.root / 'state2', self.root / 'empty')
        self.assertEqual(another.read()['items'], [])
        self.assertFalse(another.path.exists())

    def test_explicit_scan_deduplicates_keeps_aliases_and_never_completes(self):
        raw = pdf('same')
        sha = hashlib.sha256(raw).hexdigest()
        original = self.put('FACTURAS/2026/one.pdf', raw)
        alias = self.put('ENTRADA/CORREO/2026/two.pdf', raw)
        self.put('DECLARACION RENTA/2026/three.pdf')
        excluded = self.put('FACTURAS/2025/old.pdf')
        self.put('ENTRADA/GASTOS/2026/not-pdf.pdf', b'not a PDF')
        result = self.store.scan()
        self.assertEqual(len(result['documents']), 2)
        doc = next(row for row in result['documents'] if row['sha256'] == sha)
        self.assertEqual(len(doc['aliases']), 1)
        self.assertFalse(any(item['complete'] for item in result['items']))
        self.assertEqual(len(result['warnings']), 1)
        self.assertTrue(result['scanned_at'])
        self.assertTrue(excluded.exists())
        self.assertEqual(original.read_bytes(), raw)
        self.assertEqual(alias.read_bytes(), raw)
        self.assertEqual(self.store.document(sha).read_bytes(), raw)

    def test_manual_flags_assignments_and_evidence_survive_rescan(self):
        raw = pdf('one')
        sha = hashlib.sha256(raw).hexdigest()
        self.put('FACTURAS/2026/one.pdf', raw)
        self.store.scan()
        self.store.assign(sha, 'supplies')
        self.store.mark('supplies', True)
        result = self.store.read()
        result['documents'][0].update(period_start='2026-01-01', period_end='2026-01-31', period_evidence='PDF página 1')
        self.store._save(result)
        result = self.store.scan()
        self.assertTrue(result['items'][0]['complete'])
        self.assertFalse(result['items'][1]['complete'])
        self.assertEqual(result['documents'][0]['item_id'], 'supplies')
        self.assertEqual(result['documents'][0]['period_end'], '2026-01-31')
        self.store.assign(sha, '')
        self.assertIsNone(self.store.read()['documents'][0]['item_id'])
        self.store.mark('supplies', False)
        self.assertFalse(self.store.read()['items'][0]['complete'])

    def test_changed_original_is_rejected_and_missing_entries_retained(self):
        raw = pdf('original')
        path = self.put('FACTURAS/2026/one.pdf', raw)
        sha = hashlib.sha256(raw).hexdigest()
        self.store.scan()
        self.store.assign(sha, 'supplies')
        path.write_bytes(pdf('replacement'))
        with self.assertRaises(ValueError):
            self.store.document(sha)
        result = self.store.scan()
        self.assertEqual(len(result['documents']), 2)
        missing = next(row for row in result['documents'] if row['sha256'] == sha)
        self.assertFalse(missing['available'])
        self.assertEqual(missing['item_id'], 'supplies')
        self.assertIsNone(next(row for row in result['documents'] if row['sha256'] != sha)['item_id'])

    def test_document_falls_back_to_verified_alias(self):
        raw = pdf('original')
        one = self.put('FACTURAS/2026/one.pdf', raw)
        two = self.put('ENTRADA/GASTOS/2026/two.pdf', raw)
        sha = hashlib.sha256(raw).hexdigest()
        self.store.scan()
        one.write_bytes(pdf('replacement'))
        self.assertEqual(self.store.document(sha), two)
        self.assertEqual(self.store.document(sha, as_bytes=True), raw)

    def test_document_bytes_preserve_verified_read_when_path_is_replaced(self):
        raw = pdf('original')
        changed = pdf('replacement')
        path = self.put('FACTURAS/2026/one.pdf', raw)
        sha = hashlib.sha256(raw).hexdigest()
        self.store.scan()
        read_pdf = self.store._pdf
        def replace_after_read(relative):
            verified = read_pdf(relative)
            path.write_bytes(changed)
            return verified
        with patch.object(self.store, '_pdf', side_effect=replace_after_read):
            self.assertEqual(self.store.document(sha, as_bytes=True), raw)
        self.assertEqual(path.read_bytes(), changed)

    def test_confined_document_access_rejects_bad_paths_and_unknown_ids(self):
        for path in ('../outside.pdf', 'FACTURAS/2026/../../../outside.pdf',
                     'FACTURAS\\2026\\one.pdf', '/FACTURAS/2026/one.pdf',
                     'FACTURAS/2026/C:one.pdf', 'FACTURAS/2025/one.pdf',
                     'FACTURAS/2026//one.pdf', 'FACTURAS/2026/./one.pdf'):
            with self.subTest(path=path), self.assertRaises(ValueError):
                self.store._safe(path, pdf=True)
        for sha in ('../outside.pdf', 'A' * 64, 'a' * 64):
            with self.subTest(sha=sha), self.assertRaises(ValueError):
                self.store.document(sha)
        with self.assertRaises(ValueError):
            self.store.mark('missing', True)
        with self.assertRaises(ValueError):
            self.store.mark('supplies', 'true')
        with self.assertRaises(ValueError):
            self.store.assign('a' * 64, 'supplies')
        with self.assertRaises(ValueError):
            Store(self.root, self.archive, 1999)

    def test_catalog_path_tampering_cannot_expose_outside_pdf(self):
        raw = pdf('outside')
        external = self.root / 'outside.pdf'
        external.write_bytes(raw)
        sha = hashlib.sha256(raw).hexdigest()
        self.seed['documents'] = [dict(sha256=sha, path='../outside.pdf', label='Outside', item_id=None)]
        self.store._save(self.seed)
        with self.assertRaises(ValueError):
            self.store.document(sha)

    def test_symlink_pdf_is_never_served_or_imported(self):
        raw = pdf('outside')
        outside = self.root / 'outside.pdf'
        outside.write_bytes(raw)
        link = self.archive / 'FACTURAS/2026/link.pdf'
        link.parent.mkdir(parents=True)
        try:
            link.symlink_to(outside)
        except OSError as exc:
            self.skipTest('Host does not allow symlinks: ' + str(exc))
        result = self.store.scan()
        self.assertEqual(result['documents'], [])
        self.assertEqual(len(result['warnings']), 1)

    def test_redirected_root_and_catalog_fail_closed(self):
        with patch.object(renta_documents, '_plain', side_effect=lambda p: p.name != '2026'):
            with self.assertRaises(ValueError):
                self.store.read()
            with self.assertRaises(ValueError):
                self.store.scan()

    def test_bounded_scan_does_not_partially_write(self):
        self.put('FACTURAS/2026/one.pdf')
        self.put('FACTURAS/2026/two.pdf')
        before = self.store.path.read_bytes()
        with patch.object(renta_documents, 'MAX_FILES', 1), self.assertRaises(ValueError):
            self.store.scan()
        self.assertEqual(self.store.path.read_bytes(), before)

    def test_invalid_catalog_is_not_replaced(self):
        self.store.path.write_text('{broken', encoding='utf-8')
        with self.assertRaises(ValueError):
            self.store.scan()
        self.assertEqual(self.store.path.read_text(), '{broken')

    def test_render_exposes_manual_controls_escapes_text_and_preserves_uncertainty(self):
        raw = pdf('one')
        sha = hashlib.sha256(raw).hexdigest()
        self.put('FACTURAS/2026/one.pdf', raw)
        self.store.scan()
        self.store.assign(sha, 'supplies')
        result = self.store.read()
        result['items'][0]['label'] = '<script>alert(1)</script>'
        result['documents'][0]['date'] = '2026-02-01'  # No evidence: do not present as read.
        self.store._save(result)
        content = render(self.store, ['a@example.test'])
        for attribute in ('data-renta-scan', 'data-renta-check="supplies"', 'data-renta-assign="' + sha + '"',
                          'class="renta-search" data-item="supplies"', 'name="kind"', 'name="account"', 'value="all"'):
            self.assertIn(attribute, content)
        self.assertIn('/renta/documento?id=' + sha, content)
        self.assertIn('Periodo por comprobar en el PDF', content)
        self.assertNotIn('Fecha leída: 2026-02-01', content)
        self.assertNotIn('<script>', content)
        self.assertIn('&lt;script&gt;', content)
        self.assertIn('2</strong> partidas pendientes', content)


if __name__ == '__main__':
    unittest.main()

import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject
from expense_workflow import digest, encoded
from income_refresh import refresh


def invoice(number='NEW-1', text_extra='', date='01-11-2026'):
    lines = [f'Nº factura {number}', f'Fecha {date}', 'CUSTOMER-ID', 'Base imponible 100,00',
             'IVA 21,00', 'IRPF 15% -15,00', 'Total a cobrar 106,00', text_extra]
    writer = PdfWriter()
    page = writer.add_blank_page(width=400, height=400)
    font = DictionaryObject({NameObject('/Type'): NameObject('/Font'), NameObject('/Subtype'): NameObject('/Type1'),
                             NameObject('/BaseFont'): NameObject('/Helvetica'), NameObject('/Encoding'): NameObject('/WinAnsiEncoding')})
    page[NameObject('/Resources')] = DictionaryObject({NameObject('/Font'): DictionaryObject({NameObject('/F1'): writer._add_object(font)})})
    stream = DecodedStreamObject()
    ops = ['BT /F1 12 Tf 20 380 Td 16 TL']
    for line in lines:
        escaped = line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        ops.append(f'({escaped}) Tj T*')
    stream.set_data(('\n'.join(ops) + '\nET').encode('cp1252'))
    page[NameObject('/Contents')] = writer._add_object(stream)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


class IncomeRefreshTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'archive'
        self.folder = self.root / 'FACTURAS/2026/A - FACTURAS INGRESOS'
        self.folder.mkdir(parents=True)
        self.ledger_rel = 'LIBROS CONTABLES/2026/datos_libro_2026.json'
        self.ledger = self.root / self.ledger_rel
        self.ledger.parent.mkdir(parents=True)
        self.data = dict(year=2026, as_of='2026-10-25', records=[], documents=[],
                         coverage={q:'incomplete' for q in ('1T','2T','3T','4T')}, references={})
        self.ledger.write_bytes(encoded(self.data))
        self.backup = Path(self.temp.name) / 'backup'
        self.profile = {'customer':'Synthetic customer', 'customer_tax_id':'CUSTOMER-ID'}

    def run_refresh(self):
        return refresh(self.root, self.ledger_rel, self.backup, self.profile)

    def test_incremental_refresh_preserves_prior_rows_and_coverage_then_noop(self):
        (self.folder / 'new.PDF').write_bytes(invoice())
        result = self.run_refresh()
        self.assertEqual(len(result['added']), 1)
        after = self.ledger.read_bytes()
        data = json.loads(after)
        self.assertEqual(data['as_of'], '2026-10-25')
        self.assertEqual(data['calculations']['4T']['boxes']['09'], '21.00')
        self.assertFalse(self.run_refresh()['changed'])
        self.assertEqual(self.ledger.read_bytes(), after)
        # Implicit single-customer profile is derived on subsequent refreshes.
        (self.folder / 'next.pdf').write_bytes(invoice('NEW-2'))
        self.assertEqual(len(refresh(self.root, self.ledger_rel, self.backup)['added']), 1)
        self.assertEqual(json.loads(self.ledger.read_text(encoding='utf-8'))['records'][0], data['records'][0])

    def test_ambiguous_and_duplicate_new_versions_are_visible_not_arbitrarily_selected(self):
        (self.folder / 'a.pdf').write_bytes(invoice())
        (self.folder / 'b.pdf').write_bytes(invoice(text_extra='version changed'))
        (self.folder / 'bad.pdf').write_bytes(invoice('BAD', 'IVA 1,00'))
        (self.folder / 'good.pdf').write_bytes(invoice('GOOD'))
        result = self.run_refresh()
        self.assertEqual(len(result['added']), 1)
        self.assertEqual(len(result['warnings']), 3)
        self.assertEqual(json.loads(self.ledger.read_text())['records'][0]['number'], 'GOOD')

    def test_original_changes_block_all_new_imports(self):
        original = self.folder / 'original.pdf'
        original.write_bytes(invoice())
        self.run_refresh()
        before = self.ledger.read_bytes()
        original.write_bytes(invoice(text_extra='altered'))
        (self.folder / 'new.pdf').write_bytes(invoice('NEW-2'))
        with self.assertRaises(ValueError):
            self.run_refresh()
        self.assertEqual(self.ledger.read_bytes(), before)

    def test_presented_period_is_not_modified_by_new_discovery(self):
        self.data['references'] = {'3T': {'71': '21.00'}}
        self.ledger.write_bytes(encoded(self.data))
        (self.folder / 'late.pdf').write_bytes(invoice(date='01-09-2026'))
        result = self.run_refresh()
        self.assertFalse(result['changed'])
        self.assertIn('presentado', result['warnings'][0]['message'])

    def test_concurrent_canonical_edit_detected_before_replace(self):
        (self.folder / 'new.pdf').write_bytes(invoice())
        import income_refresh
        actual = income_refresh.verify_sources
        count = [0]
        def edit_after_verification(data, root):
            actual(data, root)
            count[0] += 1
            if count[0] == 2:
                self.ledger.write_bytes(self.ledger.read_bytes() + b' ')
        with patch.object(income_refresh, 'verify_sources', edit_after_verification):
            with self.assertRaises(ValueError):
                self.run_refresh()
        self.assertEqual(json.loads(self.ledger.read_text())['records'], [])

    def test_duplicate_copy_does_not_add_again_and_missing_profile_visible(self):
        (self.folder / 'one.pdf').write_bytes(invoice())
        missing = refresh(self.root, self.ledger_rel, self.backup)
        self.assertEqual(missing['warnings'][0]['code'], 'customer_profile')
        self.run_refresh()
        (self.folder / 'copy.pdf').write_bytes((self.folder / 'one.pdf').read_bytes())
        result = self.run_refresh()
        self.assertFalse(result['changed'])
        self.assertEqual(result['warnings'][0]['code'], 'duplicate_pdf')


if __name__ == '__main__':
    unittest.main()

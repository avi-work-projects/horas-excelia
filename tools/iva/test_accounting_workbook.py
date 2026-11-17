"""Synthetic annual Excel checks independent of its presentation builder."""
from copy import deepcopy
from datetime import datetime
import hashlib
import io
import json
import unittest
from unittest.mock import patch
from zipfile import ZipFile
from xml.etree import ElementTree as ET

from openpyxl import load_workbook
import accounting_workbook as workbook
from ledger import calculate


def fixture():
    data = dict(year=2026, as_of='2026-11-17', records=[], documents=[],
        coverage={q:'Cobertura pendiente de confirmar' for q in workbook.PERIODS},
        profiles={'1T':{'remaining_boxes_confirmed_zero':True}},
        references={'1T':{'07':'1000.00','09':'210.00','28':'100.00','29':'21.00',
                          '45':'21.00','46':'189.00','71':'189.00'}})
    for number, kind, period, base, vat, total, include, scope, category, irpf in [
        ('ING-1','income','1T','1000.00','210.00','1210.00',True,None,None,None),
        ('GASTO-1','expense','1T','100.00','21.00','121.00',True,None,None,None),
        ('LUZ-1','expense','1T','200.00','42.00','242.00',False,'irpf_only','electricity','current_expense'),
        ('GAS-1','expense','4T','50.00','10.50','60.50',False,'irpf_only','gas','asset'),
        ('EXCL-1','expense','4T','10.00','2.10','12.10',False,'excluded','other','excluded')]:
        raw = ('SYNTHETIC ' + number).encode()
        record = dict(kind=kind,number=number,date='2026-01-01' if period=='1T' else '2026-11-01',
            period=period,party='Proveedor sintético',tax_id='00000000T',base=base,vat=vat,
            withholding='0.00',total=total,include=include,mapping='domestic21' if include else 'pending',
            rate='21.00',source=number+'.pdf',sha256=hashlib.sha256(raw).hexdigest(),pages=[1],note='Dato sintético')
        if scope:
            record.update(tax_scope=scope,category=category,irpf_treatment=irpf,
                          business_purpose='Uso declarado pendiente de revisión',
                          expense_policy_version=1,invoice_status='complete',
                          buyer_tax_id='00000000T',buyer_identity_confirmed=False,order_reference='')
        data['records'].append(record)
    return data


class AccountingWorkbookTests(unittest.TestCase):
    def setUp(self):
        self.data = fixture()
        self.sha = hashlib.sha256(json.dumps(self.data).encode()).hexdigest()

    def test_decimal_totals_renta_separation_and_persisted_source_version(self):
        before = deepcopy(self.data)
        raw = workbook.build(self.data, self.sha)
        book = load_workbook(io.BytesIO(raw), data_only=True)
        self.addCleanup(book.close)
        self.assertEqual(book.sheetnames, ['Resumen','Ingresos','Gastos','Renta pendiente','Documentos'])
        summary = book['Resumen']
        self.assertEqual([summary.cell(6,c).value for c in range(2,9)], [1000,210,100,21,189,189,0])
        self.assertEqual(summary['F9'].value, 'Pendiente')
        self.assertEqual(summary['G9'].value, 'Sin referencia')
        self.assertEqual(summary['E10'].value, 21)  # electricity/gas VAT is never added
        self.assertEqual(summary['B14'].value, 3)
        self.assertEqual(summary['B15'].value, 423.5)  # document totals, not an IRPF deduction
        self.assertEqual(book['Gastos']['J7'].value, 'No')
        self.assertEqual(book['Renta pendiente']['E7'].value, 'Electricidad')
        self.assertEqual(book['Renta pendiente']['H7'].value, 242)
        self.assertEqual(book['Renta pendiente']['K7'].value, 'Pendiente; sin deducción calculada')
        self.assertIsInstance(book['Ingresos']['B6'].value, datetime)
        self.assertEqual(book['Documentos']['B5'].value, self.sha)
        self.assertEqual(book.properties.identifier, self.sha)
        self.assertEqual(self.data, before)
        # Inspect emitted OOXML directly as well: no formula/cache dependency.
        ns = {'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        with ZipFile(io.BytesIO(raw)) as archive:
            root = ET.fromstring(archive.read('xl/worksheets/sheet1.xml'))
            self.assertFalse(root.findall('.//s:f', ns))
            self.assertEqual(root.find('.//s:c[@r="E6"]/s:v', ns).text, '21')

    def test_empty_book_is_valid_and_repeated_generation_is_deterministic(self):
        self.assertEqual(workbook.build(self.data,self.sha), workbook.build(self.data,self.sha))
        self.data['records'] = []
        raw = workbook.build(self.data,self.sha)
        book = load_workbook(io.BytesIO(raw), data_only=True)
        self.addCleanup(book.close)
        self.assertEqual(book['Resumen']['B6'].value, 0)
        self.assertEqual(book['Resumen']['B14'].value, 0)
        self.assertEqual(book['Ingresos'].max_row, 5)

    def test_untrusted_text_stays_text_and_report_mismatch_blocks(self):
        self.data['records'][0]['party'] = '=HYPERLINK("https://example.invalid","unsafe")'
        book = load_workbook(io.BytesIO(workbook.build(self.data,self.sha)), data_only=False)
        self.addCleanup(book.close)
        self.assertEqual(book['Ingresos']['D6'].data_type, 's')
        self.assertTrue(book['Ingresos']['D6'].value.startswith('='))
        wrong = calculate(self.data)
        wrong['1T']['boxes']['09'] = '999.00'
        with self.assertRaisesRegex(ValueError,'mismo cálculo'):
            workbook.build(self.data,self.sha,wrong)
        with patch.object(workbook,'calculate',return_value=wrong):
            with self.assertRaisesRegex(ValueError,'no concilian'):
                workbook.build(self.data,self.sha)

    def test_irpf_cannot_enter_vat_and_oversized_money_cannot_lose_precision(self):
        self.data['records'][2]['include'] = True
        with self.assertRaisesRegex(ValueError,'ajeno al IVA'):
            workbook.build(self.data,self.sha)
        self.data['records'][2]['include'] = False
        self.data['records'][0].update(base='10000000000000.00',vat='0.00',total='10000000000000.00')
        with self.assertRaisesRegex(ValueError,'precisión'):
            workbook.build(self.data,self.sha)


if __name__ == '__main__':
    unittest.main()

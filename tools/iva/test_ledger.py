import hashlib
import tempfile
from pathlib import Path
import unittest
from ledger import calculate, validate, quarter, verify_sources
from collect_income import parse_income


def record(**values):
    r = dict(kind='income', number='TEST-1', party='Synthetic customer', date='2026-09-30',
             period='3T', base='100.00', vat='21.00', withholding='15.00', total='106.00',
             include=True, mapping='domestic21', rate='21.00', source='synthetic.pdf', sha256='a'*64)
    return r | values


def data(records):
    return dict(year=2026, records=records, coverage={q:'test only' for q in ('1T','2T','3T','4T')})


class LedgerTests(unittest.TestCase):
    def test_original_changed_blocks_generation(self):
        with tempfile.TemporaryDirectory() as folder:
            p=Path(folder)/'synthetic.pdf';p.write_bytes(b'original')
            d=data([record(sha256=hashlib.sha256(p.read_bytes()).hexdigest())])
            verify_sources(d,folder)
            p.write_bytes(b'changed')
            with self.assertRaises(ValueError):verify_sources(d,folder)

    def test_credit_note_needs_explicit_mapping(self):
        with self.assertRaises(ValueError):validate([record(base='-100.00',vat='-21.00',withholding='-15.00',total='-106.00')],2026)

    def test_pdf_adapter_fails_closed_on_ambiguous_fields(self):
        text='Nº factura TEST-1\nFecha 30-09-2026\nSYNTHETIC\nBase imponible 100,00\nIVA 21,00\nIRPF 15% -15,00\nTotal a cobrar 106,00\n'
        profile={'customer':'Synthetic','customer_tax_id':'SYNTHETIC'}
        self.assertEqual(parse_income(text,profile)['total'],'106.00')
        for extra in ('IVA 5,00\n','Base imponible 50,00\n','Tipo 10%\n'):
            with self.assertRaises(ValueError):parse_income(text+extra,profile)

    def test_decimal_and_retention_not_deducted_from_vat(self):
        d=data([record(),record(kind='expense',number='E1',base='0.05',vat='0.01',withholding='0.00',total='0.06')])
        self.assertEqual(calculate(d)['3T']['boxes']['46'],'20.99')
        self.assertIsNone(calculate(d)['3T']['boxes']['71'])

    def test_later_deduction_keeps_issue_date(self):
        r=record(kind='expense',date='2026-06-17',withholding='0.00',total='121.00')
        self.assertEqual(calculate(data([r]))['3T']['boxes']['29'],'21.00')
        self.assertEqual(r['date'],'2026-06-17')

    def test_duplicate_rejected_even_different_file(self):
        with self.assertRaises(ValueError):validate([record(),record(source='copy.pdf')],2026)

    def test_two_invoices_in_one_pdf(self):
        validate([record(),record(number='TEST-2')],2026)

    def test_unknown_treatment_not_silently_exported(self):
        with self.assertRaises(ValueError):calculate(data([record(mapping='unknown')]))

    def test_excluded_is_not_counted(self):
        self.assertEqual(calculate(data([record(include=False,mapping='pending')]))['3T']['record_count'],0)

    def test_unknown_or_float_amount_rejected(self):
        for value in (None,0,21.0,'21,00','21.001'):
            with self.assertRaises(ValueError):validate([record(vat=value)],2026)

    def test_next_quarter_and_year(self):
        d=data([record(),record(number='TEST-2',date='2026-10-01',period='4T')])
        self.assertEqual(calculate(d)['4T']['boxes']['09'],'21.00')
        with self.assertRaises(ValueError):validate([record(date='2027-01-01')],2026)
        self.assertEqual(quarter('2027-01-01'),'1T')

    def test_mismatch_not_forced_to_reference(self):
        d=data([record()]);d['references']={'3T':{'09':'20.99'}}
        self.assertEqual(calculate(d)['3T']['difference']['09'],'0.01')

    def test_missing_profile_never_implies_final_zero_adjustments(self):
        d=data([record()]);self.assertIsNone(calculate(d)['3T']['boxes']['71'])
        d['profiles']={'3T':{'remaining_boxes_confirmed_zero':True}}
        self.assertEqual(calculate(d)['3T']['boxes']['71'],'21.00')


if __name__=='__main__':unittest.main()

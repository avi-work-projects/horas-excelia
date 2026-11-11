import copy
import hashlib
import os
from pathlib import Path
import tempfile
import unittest

from export_390 import (FALSE_FLAGS, fingerprint, prepare, load_design, serialize,
                        field, render_page, DESIGN_SHA256)


class AnnualPreparationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.data = {'year': 2026, 'records': [], 'profiles': {}, 'coverage': {}, 'references': {}}
        def document(name):
            raw = ('Synthetic evidence: ' + name).encode()
            (self.root / name).write_bytes(raw)
            return {'source': name, 'sha256': hashlib.sha256(raw).hexdigest()}
        evidence = document('annual-review.txt')
        filed = {}
        for n, period in enumerate(('1T', '2T', '3T', '4T')):
            self.data['coverage'][period] = 'Synthetic complete quarter'
            self.data['profiles'][period] = {'remaining_boxes_confirmed_zero': True}
            self.data['references'][period] = {'07': '1000.00', '09': '210.00',
                '28': '100.00', '29': '21.00', '45': '21.00', '46': '189.00', '71': '189.00'}
            filed[period] = document(f'filed-{period}.txt')
            for kind, base, vat, total in [('income', '1000.00', '210.00', '1210.00'),
                                          ('expense', '100.00', '21.00', '121.00')]:
                self.data['records'].append(dict(kind=kind, number=f'{kind}-{period}',
                    date=f'2026-{n*3+1:02d}-01', period=period, party='SYNTHETIC',
                    tax_id='00000000T', base=base, vat=vat, total=total,
                    withholding='0.00', include=True, mapping='domestic21', rate='21.00',
                    **document(f'{kind}-{period}.txt')))
        self.profile = {k: False for k in FALSE_FLAGS}
        self.profile.update(year=2026, reviewed=True, year_complete=True,
            general_regime=True, fiscal_reviewed=True, state_percentage='100.00',
            third_party_return=False, activity={'description': 'CONSULTORIA', 'code': 'A05', 'iae': '763'},
            evidence=evidence, filed_evidence=filed, ledger_fingerprint=fingerprint(self.data))
        self.identity = dict(person_type='physical', nif='00000000T', developer_nif='00000000T',
                             surname='PRUEBA SINTETICA', given_name='EJEMPLO')

    def bind(self):
        self.profile['ledger_fingerprint'] = fingerprint(self.data)

    def test_independent_annual_totals(self):
        result = prepare(self.data, self.profile, self.root)
        # Four independent quarters: 4*210 - 4*21 = 756; no annual rescaling/rounding.
        self.assertEqual(result['boxes'], {'05':'4000.00','06':'840.00','33':'4000.00',
            '34':'840.00','47':'840.00','605':'400.00','606':'84.00','48':'400.00',
            '49':'84.00','64':'84.00','65':'756.00','84':'756.00','86':'756.00',
            '95':'756.00','99':'4000.00','108':'4000.00'})
        self.assertFalse(result['filing_ready'])

    def test_incomplete_future_or_unreviewed_year_cannot_generate(self):
        for key in ('year_complete', 'reviewed', 'fiscal_reviewed', 'general_regime'):
            with self.subTest(key=key), self.assertRaises(ValueError):
                prepare(self.data, self.profile | {key: False}, self.root)
        for key in FALSE_FLAGS:
            with self.subTest(key=key), self.assertRaises(ValueError):
                prepare(self.data, self.profile | {key: True}, self.root)
            missing = self.profile.copy()
            del missing[key]
            with self.assertRaises(ValueError):
                prepare(self.data, missing, self.root)

    def test_missing_reference_and_changed_source_block(self):
        del self.data['references']['4T']
        self.bind()
        with self.assertRaisesRegex(ValueError, 'referencia'):
            prepare(self.data, self.profile, self.root)
        self.setUp()
        (self.root / 'expense-1T.txt').write_text('tampered')
        with self.assertRaises(ValueError):
            prepare(self.data, self.profile, self.root)

    def test_approval_bound_to_ledger_and_evidence(self):
        self.data['coverage']['1T'] = 'changed coverage'
        with self.assertRaisesRegex(ValueError, 'cambiado'):
            prepare(self.data, self.profile, self.root)
        self.bind()
        (self.root / 'filed-1T.txt').write_text('changed return')
        with self.assertRaisesRegex(ValueError, 'evidencia'):
            prepare(self.data, self.profile, self.root)

    def test_compensating_cent_differences_still_need_individual_review(self):
        self.data['references']['2T'].update({'29':'21.01','45':'21.01','46':'188.99','71':'188.99'})
        self.data['references']['3T'].update({'29':'20.99','45':'20.99','46':'189.01','71':'189.01'})
        self.bind()
        with self.assertRaisesRegex(ValueError, 'diferencias'):
            prepare(self.data, self.profile, self.root)
        self.profile['difference_reviews'] = {
            '2T': {'reviewed': True, 'reason': 'Synthetic documented cent difference',
                   'differences': {'29':'-0.01','45':'-0.01','46':'0.01','71':'0.01'}},
            '3T': {'reviewed': True, 'reason': 'Synthetic documented cent difference',
                   'differences': {'29':'0.01','45':'0.01','46':'-0.01','71':'-0.01'}}}
        result = prepare(self.data, self.profile, self.root)
        self.assertEqual(result['boxes']['95'], '756.00')
        self.assertEqual(result['quarters']['2T']['differences']['71'], '0.01')
        self.assertEqual(result['quarters']['3T']['differences']['71'], '-0.01')

    def test_unknown_year_adjustments_and_missing_proof_rejected(self):
        with self.assertRaises(ValueError):
            prepare(self.data, self.profile | {'year': 2027}, self.root)
        self.data['profiles']['4T'] = {}
        self.bind()
        with self.assertRaisesRegex(ValueError, 'ajustes'):
            prepare(self.data, self.profile, self.root)

    def test_source_path_escape_and_invalid_nif(self):
        with self.assertRaises(ValueError):
            prepare(self.data, self.profile | {'evidence': {'source': '../escape', 'sha256': 'a'*64}}, self.root)
        reviewed = prepare(self.data, self.profile, self.root)
        with self.assertRaises(ValueError):
            serialize({}, reviewed, self.identity | {'nif': '00000000A'})

    @unittest.skipUnless(os.environ.get('IVA390_DESIGN'), 'Set IVA390_DESIGN to the original official XLSX')
    def test_official_design_fixed_positions_and_envelope(self):
        path = Path(os.environ['IVA390_DESIGN'])
        self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), DESIGN_SHA256)
        reviewed = prepare(self.data, self.profile, self.root)
        raw = serialize(load_design(path), reviewed, self.identity)
        # Positions transcribed independently from official page tables, one based.
        sizes = {'01000':1188, '02000':1806, '02B00':531, '03000':1840, '04000':854, '06000':862}
        position, pages = 328, {}
        self.assertEqual(raw[:22], b'<T390020260A0000><AUX>')
        for name, size in sizes.items():
            page = raw[position:position + size]
            self.assertEqual(len(page), size)
            self.assertEqual(page[:11], ('<T390'+name+'>').encode())
            self.assertEqual(page[-12:], ('</T390'+name+'>').encode())
            pages[name] = page
            position += size
        self.assertEqual(raw[position:], b'</T390020260A0000>')
        self.assertEqual(pages['01000'][13:22], b'00000000T')
        self.assertEqual(pages['01000'][102:106], b'2026')
        self.assertEqual(pages['01000'][133:135], b'00')  # not substitute
        checks = [('02000',217,400000),('02000',234,84000),('02000',1611,400000),
                  ('02000',1628,84000),('02B00',353,84000),('03000',183,40000),
                  ('03000',200,8400),('03000',217,40000),('03000',234,8400),
                  ('04000',659,8400),('04000',676,75600),('06000',30,75600),
                  ('06000',98,75600),('06000',259,75600),('06000',395,400000),
                  ('06000',684,400000)]
        for page, start, cents in checks:
            with self.subTest(page=page, start=start):
                self.assertEqual(pages[page][start-1:start+16], f'{cents:017d}'.encode())
        # Mixed-territory section remains zero, it is not a duplicated annual result.
        self.assertEqual(pages['06000'][114:258], b'0' * 144)
        with self.assertRaises(ValueError):
            serialize(load_design(path), reviewed, self.identity | {'nif':'00000000A'})
        reviewed['boxes']['95'] = '0.00'
        with self.assertRaises(ValueError):
            serialize(load_design(path), reviewed, self.identity)

    def test_fixed_fields_reject_truncation_controls_and_negative(self):
        self.assertEqual(field('13', 6, 'Num'), '000013')
        self.assertEqual(field('ÁNGEL', 8, 'An').encode('latin1'), b'\xc1NGEL   ')
        for value, length, kind in [('123',2,'Num'),('-1',17,'N'),('a\n',3,'An'),('A&B',3,'An')]:
            with self.assertRaises(ValueError):
                field(value, length, kind)
        with self.assertRaises(ValueError):
            render_page([(1,2,1,'Num','','')], {})


if __name__ == '__main__':
    unittest.main()

import copy
import hashlib
import os
from pathlib import Path
import tempfile
import unittest

from export_390 import (EU_FLAGS, FALSE_FLAGS, fingerprint, prepare, load_design, serialize,
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
        self.profile = {k: False for k in (*FALSE_FLAGS, *EU_FLAGS)}
        self.profile.update(year=2026, reviewed=True, year_complete=True,
            general_regime=True, fiscal_reviewed=True, state_percentage='100.00',
            third_party_return=False, activity={'description': 'CONSULTORIA', 'code': 'A05', 'iae': '763'},
            evidence=evidence, filed_evidence=filed, ledger_fingerprint=fingerprint(self.data))
        self.identity = dict(person_type='physical', nif='00000000T', developer_nif='00000000T',
                             surname='PRUEBA SINTETICA', given_name='EJEMPLO')

    def bind(self):
        self.profile['ledger_fingerprint'] = fingerprint(self.data)

    def add_eu_service(self, period, base, number='eu-service'):
        """Synthetic evidence with an explicit reviewed current-service classification."""
        month = 1 + 3 * (int(period[0]) - 1)
        name = f'{number}-{period}.txt'
        raw = ('SYNTHETIC EU SERVICE ' + name).encode()
        (self.root / name).write_bytes(raw)
        self.data['records'].append(dict(kind='expense', number=number,
            date=f'2026-{month:02d}-02', period=period, party='SYNTHETIC EU SERVICE',
            tax_id='IE1234567AA', base=base, vat='0.00', withholding='0.00', total=base,
            include=True, mapping='eu_services21', rate='0.00',
            reverse_charge_rate='21.00', deductible_percentage='100.00',
            expense_policy_version=1, category='general', tax_scope='iva_irpf',
            irpf_treatment='pending', business_purpose='Synthetic programming service',
            buyer_tax_id='00000000T', invoice_status='complete', order_reference='',
            buyer_identity_confirmed=True, fiscal_review_confirmed=True,
            source=name, sha256=hashlib.sha256(raw).hexdigest()))
        self.profile.update({k: True for k in EU_FLAGS})
        self.bind()

    def eu_year(self):
        self.add_eu_service('1T', '100.00', 'eu-one')
        self.add_eu_service('2T', '0.50', 'eu-half-a')
        self.add_eu_service('2T', '0.50', 'eu-half-b')
        self.add_eu_service('4T', '12.34', 'eu-fourth')
        # Independent known values, including per-invoice half-up rounding: .11+.11.
        for period, base, vat, accrued, deductible in (
                ('1T','100.00','21.00','231.00','42.00'),
                ('2T','1.00','0.22','210.22','21.22'),
                ('4T','12.34','2.59','212.59','23.59')):
            self.data['references'][period].update({'10':base,'11':vat,'27':accrued,
                '36':base,'37':vat,'45':deductible})
        self.bind()

    def test_independent_annual_totals(self):
        result = prepare(self.data, self.profile, self.root)
        # Four independent quarters: 4*210 - 4*21 = 756; no annual rescaling/rounding.
        self.assertEqual(result['boxes'], {'05':'4000.00','06':'840.00','33':'4000.00',
            '34':'840.00','47':'840.00','605':'400.00','606':'84.00','48':'400.00',
            '49':'84.00','64':'84.00','65':'756.00','84':'756.00','86':'756.00',
            '95':'756.00','99':'4000.00','108':'4000.00', '551':'0.00','552':'0.00',
            '637':'0.00','638':'0.00','597':'0.00','598':'0.00'})
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
        for key in EU_FLAGS:
            missing = self.profile.copy()
            del missing[key]
            with self.subTest(key=key), self.assertRaisesRegex(ValueError, 'intracomunitarios'):
                prepare(self.data, missing, self.root)
            with self.assertRaisesRegex(ValueError, 'intracomunitarios'):
                prepare(self.data, self.profile | {key:True}, self.root)

    def test_eu_services_accrual_deduction_and_independent_rounding(self):
        self.eu_year()
        result = prepare(self.data, self.profile, self.root)
        self.assertEqual(result['boxes'], {'05':'4000.00','06':'840.00',
            '551':'113.34','552':'23.81','33':'4113.34','34':'863.81','47':'863.81',
            '605':'400.00','606':'84.00','48':'400.00','49':'84.00',
            '637':'113.34','638':'23.81','597':'113.34','598':'23.81','64':'107.81',
            '65':'756.00','84':'756.00','86':'756.00','95':'756.00',
            '99':'4000.00','108':'4000.00'})
        self.assertEqual(result['quarters']['2T']['differences'], {})
        self.assertTrue(result['eu_services21'])
        self.assertFalse(result['filing_ready'])

    def test_eu_scope_and_reference_must_match(self):
        self.eu_year()
        for flag in EU_FLAGS:
            with self.subTest(flag=flag), self.assertRaisesRegex(ValueError, 'intracomunitarios'):
                prepare(self.data, self.profile | {flag:False}, self.root)
        ref = self.data['references']['1T'].copy()
        for missing in ('10','11','27','36','37'):
            self.data['references']['1T'] = {k:v for k,v in ref.items() if k != missing}
            self.bind()
            with self.subTest(missing=missing), self.assertRaisesRegex(ValueError, 'referencia 303'):
                prepare(self.data, self.profile, self.root)
        for changed in ('36','37','27','45'):
            self.data['references']['1T'] = ref | {changed:'0.00'}
            self.bind()
            with self.subTest(changed=changed), self.assertRaisesRegex(ValueError, 'incompatible'):
                prepare(self.data, self.profile, self.root)
        self.data['references']['1T'] = ref
        row = self.data['records'][-1]
        original = row.copy()
        for change in ({'deductible_percentage':'50.00'}, {'reverse_charge_rate':'10.00'},
                       {'mapping':'eu_goods21'}, {'tax_id':'US123456789'}):
            row.clear()
            row.update(original | change)
            self.bind()
            with self.subTest(change=change), self.assertRaises(ValueError):
                prepare(self.data, self.profile, self.root)

    @unittest.skipUnless(os.environ.get('IVA390_DESIGN'), 'Set IVA390_DESIGN to original AEAT XLSX')
    def test_eu_services_official_2026_positions(self):
        self.eu_year()
        raw = serialize(load_design(os.environ['IVA390_DESIGN']),
                        prepare(self.data, self.profile, self.root), self.identity)
        # Page offsets/fields transcribed from the SHA-pinned official XLSX,
        # independently of serializer field-number mappings. All fields are 17 bytes.
        pages = {'02000':raw[1516:3322], '02B00':raw[3322:3853],
                 '03000':raw[3853:5693], '04000':raw[5693:6547], '06000':raw[6547:7409]}
        checks = [('02000',1441,11334),('02000',1458,2381),
                  ('02000',1611,411334),('02000',1628,86381),('02B00',353,86381),
                  ('03000',183,40000),('03000',200,8400),
                  ('04000',421,11334),('04000',438,2381),
                  ('04000',455,11334),('04000',472,2381),
                  ('04000',659,10781),('04000',676,75600),
                  ('06000',395,400000),('06000',684,400000)]
        for page, start, cents in checks:
            with self.subTest(page=page, start=start):
                self.assertEqual(pages[page][start-1:start+16], f'{cents:017d}'.encode())
        # Goods and other reverse-charge operations stay zero.
        self.assertEqual(pages['02000'][1202:1236], b'0'*34)
        self.assertEqual(pages['02000'][1474:1508], b'0'*34)

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

import unittest
import os
from pathlib import Path
from unittest.mock import patch
from export_303_test import field, page, serialize, payment_fields, year_end_fields, load_design, checked_boxes


class TxtTests(unittest.TestCase):
    def test_eu_services_reach_official_303_fields_without_changing_net_payment(self):
        design_path = os.environ.get('IVA303_DESIGN')
        if not design_path:
            self.skipTest('Set IVA303_DESIGN to original AEAT workbook')
        design = load_design(Path(design_path))
        boxes = {'07':'1000.00','09':'210.00','10':'18.00','11':'3.78','27':'213.78',
                 '28':'100.00','29':'21.00','36':'18.00','37':'3.78',
                 '45':'24.78','46':'189.00','71':'189.00'}
        identity = dict(nif='00000000T',name='ENSAYO FICTICIO',developer_nif='00000000T',
                        foral_only=False,monthly_refund=False)
        closing = dict(reviewed=True, **{k:False for k in ('exempt_390','special_prorata_option',
                       'special_prorata_revocation','annual_deduction_adjustment',
                       'investment_goods_adjustment','foral_annual_adjustment')})
        payload = serialize(design,boxes,identity,2026,'4T',annual_closing=closing)
        # Positions independently checked in the original 2026 AEAT workbook.
        for position, expected in ((365,1800),(382,378),(696,21378),(713,10000),
                                   (730,2100),(849,1800),(866,378),(1002,2478),(1019,18900)):
            self.assertEqual(int(payload[328+position-1:328+position-1+17]), expected)

    def test_incomplete_or_inconsistent_eu_boxes_never_serialize_as_domestic(self):
        domestic = {'07':'100.00','09':'21.00','28':'0.00','29':'0.00',
                    '45':'0.00','46':'21.00','71':'21.00'}
        full = checked_boxes(domestic)
        self.assertEqual(full['27'],'21.00')
        self.assertEqual(full['11'],'0.00')
        for bad in (domestic | {'10':'18.00'}, full | {'27':'0.00'}, full | {'45':'1.00'},
                    full | {'46':'20.00'}, full | {'71':'20.00'}, full | {'13':'0.00'}, full | {'11':'3.78'}):
            with self.assertRaises(ValueError): checked_boxes(bad)

    def test_fourth_quarter_requires_explicit_non_exempt_no_adjustment_review(self):
        closing = dict(reviewed=True,exempt_390=False,special_prorata_option=False,
                       special_prorata_revocation=False,annual_deduction_adjustment=False,
                       investment_goods_adjustment=False,foral_annual_adjustment=False)
        self.assertEqual(year_end_fields('4T',closing),{23:'2',24:'0'})
        self.assertEqual(year_end_fields('3T',None),{23:'0',24:'0'})
        for key in closing:
            bad = dict(closing)
            del bad[key]
            with self.assertRaises(ValueError):year_end_fields('4T',bad)
        for key in closing:
            with self.assertRaises(ValueError):year_end_fields('4T',closing | {key:not closing[key]})
        with self.assertRaises(ValueError):year_end_fields('3T',closing)
        boxes={'07':'100.00','09':'21.00','28':'0.00','29':'0.00','45':'0.00','46':'21.00','71':'21.00'}
        identity=dict(nif='00000000T',name='ENSAYO',developer_nif='00000000T',foral_only=False,monthly_refund=False)
        with patch('export_303_test.page', return_value='') as render:
            payload=serialize({'DP30301':[],'DP30303':[],'DP303DID':[]},boxes,identity,2026,'4T',annual_closing=closing)
        self.assertIn(b'20264T',payload)
        self.assertEqual(render.call_args_list[0].args[1][23],'2')
        self.assertEqual(render.call_args_list[0].args[1][24],'0')
    def test_explicit_payment_and_checksum(self):
        # Public synthetic IBAN example, never the user's account.
        mode, fields = payment_fields({'mode':'direct_debit','iban':'ES91 2100 0418 4502 0005 1332'})
        self.assertEqual(mode,'U')
        self.assertEqual(fields,{6:'ES9121000418450200051332'})
        self.assertEqual(payment_fields(None),('I',{}))
        for iban in ['ES0021000418450200051332','ES91','GB82WEST12345698765432']:
            with self.assertRaises(ValueError):
                payment_fields({'mode':'direct_debit','iban':iban})
        with self.assertRaises(ValueError):
            payment_fields({'mode':'unexpected','iban':'ES9121000418450200051332'})
    def test_fixed_width_and_latin1(self):
        self.assertEqual(field('12', 5, True), '00012')
        self.assertEqual(field('ÁNGEL', 8).encode('latin1'), b'\xc1NGEL   ')
        for value, length, numeric in [('123', 2, True), ('-1', 5, True), ('1.2', 5, True), ('a\n', 5, False)]:
            with self.assertRaises(ValueError):
                field(value, length, numeric)

    def test_pages_preserve_constants_and_reserve(self):
        rows = [(1, 1, 3, 'An', '', '', 'Constante "<T>"'),
                (2, 4, 4, 'Num', '', '', None), (3, 8, 2, 'An', '', '', None)]
        self.assertEqual(page(rows, {2:'19'}), '<T>0019  ')
        with self.assertRaises(ValueError):
            page(rows, {4:'x'})
        with self.assertRaises(ValueError):
            page(rows + [(4, 8, 2, 'An', '', '', None)], {})

    def test_unsupported_year_and_fourth_quarter_blocked(self):
        for year, period in [(2027,'2T'), (2026,'4T')]:
            with self.assertRaises(ValueError):
                serialize({}, {}, {}, year, period)

    def test_required_rate_169_and_no_bank_details(self):
        boxes = {'07':'100.00','09':'21.00','28':'0.00','29':'0.00',
                 '45':'0.00','46':'21.00','71':'21.00'}
        identity = {'nif':'00000000T','name':'ENSAYO', 'developer_nif':'00000000T',
                    'foral_only':False,'monthly_refund':False}
        design = {'DP30301':[], 'DP30303':[], 'DP303DID':[]}
        with patch('export_303_test.page', return_value='') as render:
            serialize(design, boxes, identity, 2026, '2T')
        # AEAT E010541 regression: this rate is mandatory even with zero base.
        self.assertEqual(render.call_args_list[0].args[1][54], '00050')
        self.assertEqual(render.call_args_list[2].args[1], {})

import unittest
from unittest.mock import patch
from export_303_test import field, page, serialize


class TxtTests(unittest.TestCase):
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

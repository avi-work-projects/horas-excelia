import unittest
from prepare_390 import prepare


class AnnualPreparationTests(unittest.TestCase):
    def report(self):
        return {'year': 2027, 'annual_documentary_totals': {'07':'100.00','09':'21.00','28':'0.00','29':'0.00'},
                'quarters': {p: {'reference': {}, 'difference': {}} for p in ('1T','2T','3T','4T')}}

    def test_opposite_differences_remain_visible_and_missing_is_not_zero(self):
        report = self.report()
        report['quarters']['2T'] = {'reference': {'71':'10.00'}, 'difference': {'71':'0.01'}}
        report['quarters']['3T'] = {'reference': {'71':'11.00'}, 'difference': {'71':'-0.01'}}
        result = prepare(report)
        self.assertEqual(len(result['quarterly_differences']), 2)
        self.assertEqual(result['missing_filed_references'], ['1T','4T'])
        self.assertEqual(result['filed_results_subtotal'], '21.00')
        self.assertEqual(result['year'], 2027)
        self.assertFalse(result['filing_ready'])

    def test_all_references_do_not_claim_annual_filing_ready(self):
        report = self.report()
        for q in report['quarters'].values():
            q['reference'] = {'71':'0.00'}
        self.assertFalse(prepare(report)['filing_ready'])
        del report['quarters']['4T']
        with self.assertRaises(ValueError):
            prepare(report)

    def test_eu_services_remain_provisional_with_explicit_pending_reconciliation(self):
        report = self.report()
        report['annual_documentary_totals'].update({'10':'100.00','11':'21.00',
            '27':'42.00','36':'100.00','37':'21.00','45':'21.00'})
        report['quarters']['4T']['boxes'] = {'10':'100.00','11':'21.00','36':'100.00','37':'21.00'}
        report['quarters']['4T']['reference'] = {'71':'21.00'}
        result = prepare(report)
        self.assertTrue(result['provisional'])
        self.assertFalse(result['filing_ready'])
        self.assertEqual(result['intracommunity_services'], {'base':'100.00',
            'accrued_vat':'21.00','deductible_base':'100.00','deductible_vat':'21.00'})
        self.assertEqual(result['missing_intracommunity_references'], ['4T'])
        self.assertTrue(any('349' in item for item in result['pending']))

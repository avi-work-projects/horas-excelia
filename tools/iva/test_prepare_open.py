import hashlib
from pathlib import Path
import tempfile
import unittest
from prepare_open import prepare
from test_ledger import data, record


class RecoveryTests(unittest.TestCase):
    def test_new_fourth_quarter_completeness_and_existing_reference(self):
        with tempfile.TemporaryDirectory() as folder:
            raw=b'fictional source';Path(folder,'synthetic.pdf').write_bytes(raw)
            sha=hashlib.sha256(raw).hexdigest()
            ledger=data([record(date='2026-12-01',period='4T',sha256=sha)])
            ledger['profiles']={'4T':{'remaining_boxes_confirmed_zero':True}}
            profile=dict(year=2026,period='4T',source='synthetic.pdf',source_sha256=sha,
                         general_regime=True,simplified_regime=False,joint_return=False,
                         cash_accounting=False,recipient_cash_accounting=False,insolvency=False,
                         voluntary_sii=False,state_percentage='100.00',preparation_kind='new_period',
                         period_complete=True,annual_closing=dict(reviewed=True,exempt_390=False,
                         special_prorata_option=False,special_prorata_revocation=False,
                         annual_deduction_adjustment=False,investment_goods_adjustment=False,foral_annual_adjustment=False))
            result=prepare(ledger,profile,folder)
            self.assertEqual(result['expected_boxes']['71'],'21.00')
            self.assertIsNone(result['difference'])
            self.assertFalse(result['filing_ready'])
            with self.assertRaises(ValueError):prepare(ledger,profile | {'period_complete':False},folder)
            with self.assertRaises(ValueError):prepare(ledger,profile | {'annual_closing':None},folder)
            ledger['references']={'4T':{'71':'21.00'}}
            with self.assertRaises(ValueError):prepare(ledger,profile,folder)
    def test_recovery_preserves_difference_and_blocks_stale_inputs(self):
        with tempfile.TemporaryDirectory() as folder:
            raw = b'synthetic document'
            Path(folder, 'synthetic.pdf').write_bytes(raw)
            digest = hashlib.sha256(raw).hexdigest()
            ledger = data([record(sha256=digest)])
            ledger['profiles'] = {'3T': {'remaining_boxes_confirmed_zero': True}}
            profile = dict(year=2026, period='3T', source='synthetic.pdf',
                source_sha256=digest, general_regime=True, simplified_regime=False,
                joint_return=False, cash_accounting=False, recipient_cash_accounting=False,
                insolvency=False, voluntary_sii=False, state_percentage='100.00',
                expected_result='21.00', filed_result='20.99', difference='0.01')
            report = prepare(ledger, profile, folder)
            self.assertEqual(report['difference'], '0.01')
            self.assertFalse(report['filing_ready'])
            for patch in ({'year': 2027}, {'expected_result': '22.00'},
                          {'difference': '0.00'}, {'cash_accounting': True},
                          {'source': '../outside.pdf'}, {'source_sha256': '0'*64}):
                with self.subTest(patch=patch), self.assertRaises(ValueError):
                    prepare(ledger, profile | patch, folder)
            ledger['profiles'] = {}
            with self.assertRaises(ValueError):
                prepare(ledger, profile, folder)

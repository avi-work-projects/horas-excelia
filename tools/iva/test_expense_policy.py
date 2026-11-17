from copy import deepcopy
import unittest

from expense_policy import default_fields, normalize_fields, validate_policy, validate_proposal


class PolicyTests(unittest.TestCase):
    def test_legacy_is_not_migrated_or_modified(self):
        original = {'include':True, 'mapping':'historical_domestic21', 'vat':'21.00'}
        self.assertEqual(normalize_fields(original), original)
        validate_policy(original, for_approval=True)

    def test_luz_gas_never_enter_vat_and_keep_documentary_amounts(self):
        for category in ('electricity', 'gas'):
            with self.subTest(category=category):
                fields = default_fields() | {'category':category,'tax_scope':'irpf_only',
                    'include':True,'mapping':'domestic21','vat':'21.00','total':'121.00'}
                normalized = normalize_fields(fields)
                self.assertFalse(normalized['include'])
                self.assertEqual(normalized['mapping'], 'pending')
                self.assertEqual(normalized['vat'], '21.00')
                self.assertEqual(normalized['irpf_treatment'], 'pending')
                validate_policy(normalized, for_approval=True)
                with self.assertRaises(ValueError):
                    normalize_fields(fields | {'tax_scope':'iva_irpf'})

    def test_telecom_does_not_supply_deductibility_confirmations(self):
        fields = normalize_fields(default_fields() | {'category':'telecom',
            'tax_scope':'iva_irpf','mapping':'domestic21'})
        for missing in ('invoice_status','buyer_identity_confirmed','buyer_tax_id',
                        'business_purpose','fiscal_review_confirmed'):
            complete = fields | dict(invoice_status='complete', buyer_identity_confirmed=True,
                buyer_tax_id='00000000T', business_purpose='Servicio profesional ficticio', fiscal_review_confirmed=True)
            complete[missing] = False if 'confirmed' in missing else ''
            with self.subTest(missing=missing), self.assertRaises(ValueError):
                validate_policy(complete, for_approval=True)

    def test_unknown_version_and_unversioned_partial_metadata_are_rejected(self):
        for fields in (default_fields() | {'expense_policy_version':2}, {'category':'general'}):
            with self.assertRaises(ValueError):
                normalize_fields(fields)

    def test_extraction_requires_per_field_evidence_and_real_page(self):
        proposal = dict(schema_version=1, document_sha256='a'*64, values={'party':'Synthetic'},
            evidence={'party':[{'page':1,'quote':'Synthetic'}]})
        self.assertEqual(validate_proposal(proposal,1,'a'*64),proposal)
        for change in ({'evidence':{}}, {'evidence':{'party':[{'page':2,'quote':'Synthetic'}]}},
                       {'values':{'tax_scope':'iva_irpf'}}):
            with self.assertRaises(ValueError):
                validate_proposal(deepcopy(proposal) | change,1,'a'*64)


if __name__ == '__main__':
    unittest.main()

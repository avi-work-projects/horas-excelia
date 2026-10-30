"""Synthetic validity boundaries and unchanged fiscal/identity guards."""
import ast
import copy
import unittest
from project_periods import effective_project, validate_identity
from prepare_project_periods import patch, OLD


def require(ok, message):
    if not ok:
        raise ValueError(message)


class ProjectPeriodTests(unittest.TestCase):
    def setUp(self):
        self.settings={'project':'DEMO/OLD','project_periods':{'2026-11':'DEMO/NEW'},
                       'issuer':{'name':'Example issuer'},'customer':{'name':'Example client'},'iban':'SYNTHETIC'}
        self.source={'period':'2026-11','project':'DEMO/NEW','issuer':self.settings['issuer'].copy(),
                     'client':self.settings['customer'].copy(),'payment':{'iban':'SYNTHETIC'}}

    def test_boundary_future_years_and_no_mutation(self):
        before=copy.deepcopy(self.settings)
        for period,expected in [('2026-10','DEMO/OLD'),('2026-11','DEMO/NEW'),('2026-12','DEMO/NEW'),('2030-01','DEMO/NEW')]:
            self.assertEqual(effective_project(self.settings,period),expected)
        self.assertEqual(self.settings,before)
        self.settings['project_periods']['2028-01']='DEMO/THIRD'
        self.assertEqual(effective_project(self.settings,'2027-12'),'DEMO/NEW')
        self.assertEqual(effective_project(self.settings,'2028-02'),'DEMO/THIRD')

    def test_old_config_preserves_old_rule(self):
        self.settings.pop('project_periods')
        self.assertEqual(effective_project(self.settings,'2026-11'),'DEMO/OLD')

    def test_new_project_before_cutoff_and_old_after_cutoff_rejected(self):
        validate_identity(self.source,self.settings,require)
        for period,project in [('2026-10','DEMO/NEW'),('2026-11','DEMO/OLD'),('2027-03','UNAUTHORIZED')]:
            with self.assertRaisesRegex(ValueError,'Proyecto distinto'):
                validate_identity(dict(self.source,period=period,project=project),self.settings,require)
        validate_identity(dict(self.source,period='2026-10',project='DEMO/OLD'),self.settings,require)

    def test_identity_and_bank_still_strict(self):
        for key,value in [('issuer',{'name':'Changed'}),('client',{'name':'Changed'}),('payment',{'iban':'CHANGED'})]:
            with self.assertRaises(ValueError):
                validate_identity(dict(self.source,**{key:value}),self.settings,require)

    def test_invalid_rules_fail_closed(self):
        for rules in [None,[],{'2026-13':'DEMO'},{'2026-9':'DEMO'},{'2026-11':''}]:
            with self.assertRaises(ValueError):effective_project(dict(self.settings,project_periods=rules),'2026-11')

    def test_patch_only_replaces_guard(self):
        source='def target(p):\n'+OLD+'\n    return p\ndef prepare():\n    fiscal_guard()\n'
        updated=patch(source);ast.parse(updated)
        self.assertEqual(patch(updated),updated)
        self.assertIn('fiscal_guard()',updated)
        with self.assertRaises(ValueError):patch('def changed(): pass')


if __name__=='__main__':unittest.main()

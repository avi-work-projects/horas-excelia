"""Synthetic persisted project synchronization; never connects to real mail."""
import copy
import datetime
import json
import unittest
from unittest.mock import patch
import test_bridge
from project_settings import proposal


class ProjectSettingsTests(unittest.TestCase):
    db = test_bridge.BridgeTests.db
    tearDown = test_bridge.BridgeTests.tearDown
    call = test_bridge.BridgeTests.call
    load = test_bridge.BridgeTests.load
    import_json = test_bridge.BridgeTests.import_json

    def setUp(self):
        test_bridge.BridgeTests.setUp(self)
        self.settings = {'project':'TEST/OLD','project_periods':{'2027-02':'TEST/CURRENT'},
                         'issuer':{'name':'Synthetic'},'emission_enabled':False,'iban':'TEST'}
        self.path = self.root/'settings.json'
        self.path.write_text(json.dumps(self.settings))
        self.service.now = lambda: datetime.datetime(2027, 2, 1)
        self.change = {'project':'TEST/NEXT','from':'2027-03','previous':'TEST/CURRENT'}
        self.call()
        with self.db() as db:
            db.execute("UPDATE plans SET status='sent',approval='keep'")

    def save_project(self, change=None):
        return self.call({'action':'project','change':change or self.change})

    def test_sync_retry_and_invoices_untouched(self):
        before=self.load()
        result=self.save_project()
        self.assertEqual(result['state'],'project_saved')
        self.assertEqual(result['periods'],{'2027-02':'TEST/CURRENT','2027-03':'TEST/NEXT'})
        stored=json.loads(self.path.read_text())
        expected=copy.deepcopy(self.settings);expected['project_periods']['2027-03']='TEST/NEXT'
        self.assertEqual(stored,expected)
        stamp=self.path.stat().st_mtime_ns
        self.assertEqual(self.save_project(),result)
        self.assertEqual(self.path.stat().st_mtime_ns,stamp)
        self.assertEqual(self.load(),before)
        self.assertEqual(len(self.calls),1)

    def test_protects_invoice_and_draft_only_months(self):
        original=self.path.read_bytes()
        for period in ['2027-02','2027-04']:
            with self.db() as db:
                db.execute('INSERT INTO drafts(snapshot) VALUES(?)',(json.dumps({'period':'2027-04'}),))
            result=self.save_project(dict(self.change,**{'from':period}))
            self.assertEqual(result['state'],'project_rejected')
            self.assertIn('factura preparada',result['message'])
            self.assertEqual(self.path.read_bytes(),original)

    def test_conflict_past_and_invalid_do_not_write(self):
        original=self.path.read_bytes()
        for change in [dict(self.change,previous='STALE'),dict(self.change,**{'from':'2027-01'}),
                       dict(self.change,project=''),dict(self.change,**{'from':'2027-13'}),
                       dict(self.change,issuer='not permitted')]:
            self.assertEqual(self.save_project(change)['state'],'project_rejected')
            self.assertEqual(self.path.read_bytes(),original)

    def test_write_failure_keeps_previous_settings(self):
        original=self.path.read_bytes()
        with patch('project_settings.os.replace',side_effect=OSError('Disk error')):
            with self.assertRaises(OSError): self.save_project()
        self.assertEqual(self.path.read_bytes(),original)
        self.assertFalse(list(self.root.glob('.project-*')))

    def test_later_rules_retained_and_retry_after_rollover(self):
        cfg=copy.deepcopy(self.settings);cfg['project_periods']['2027-05']='TEST/LATER'
        changed=proposal(cfg,self.change,{'2027-02','2027-05'},'2027-02')
        self.assertEqual(changed['project_periods']['2027-05'],'TEST/LATER')
        self.assertEqual(proposal(changed,self.change,set(),'2027-07'),changed)


if __name__=='__main__':unittest.main()

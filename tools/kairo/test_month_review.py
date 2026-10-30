"""Synthetic selected-month navigation; no production service import or writes."""
import json
import unittest
import test_bridge
from invoice_month_review import response
from prepare_month_review import patch


class MonthReviewTests(unittest.TestCase):
    db = test_bridge.BridgeTests.db
    tearDown = test_bridge.BridgeTests.tearDown

    def setUp(self):
        import tempfile
        from pathlib import Path
        from types import SimpleNamespace
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        self.service=SimpleNamespace(db=self.db)
        self.service.config=lambda: {'commissioned': True, 'mail_enabled': True}
        self.service.digest=lambda p: 'hash-for-'+p['period']
        with self.db() as db:
            db.execute('CREATE TABLE plans(id INTEGER PRIMARY KEY,data TEXT,status TEXT,approval TEXT,detail TEXT)')
            for period,status in [('2027-10','sent'),('2027-11','review')]:
                data={'period':period,'number':period,'send_date':period+'-19',
                      'display':{'total':1234},'to':'recipient@example.invalid'}
                db.execute('INSERT INTO plans(data,status) VALUES(?,?)',(json.dumps(data),status))

    def test_month_navigation_and_missing_never_fall_back(self):
        with self.db() as db: before=[tuple(r) for r in db.execute('SELECT * FROM plans')]
        for period,expected,action in [('2027-10','Factura enviada',False),('2027-11','Pendiente de aprobación',True),('2027-12','No está preparada',False)]:
            code,body=response(self.service,'/facturas/gestify-month?period='+period,'csrf-test')
            self.assertEqual(code,200);self.assertIn(expected,body)
            self.assertEqual('data-action="approve"' in body,action)
            if action:self.assertIn('hash-for-2027-11',body)
        with self.db() as db: self.assertEqual(before,[tuple(r) for r in db.execute('SELECT * FROM plans')])

    def test_bad_period_and_duplicate_rejected(self):
        for query in ('','?period=2027-13','?period=2027-10&period=2027-11','?period=<script>'):
            self.assertEqual(response(self.service,'/gestify-month'+query,'csrf')[0],400)

    def test_old_review_never_offers_mutations(self):
        with self.db() as db: db.execute("UPDATE plans SET status='review'")
        body=response(self.service,'/gestify-month?period=2027-10','csrf')[1]
        self.assertNotIn('data-action="approve"',body);self.assertNotIn('data-action="cancel"',body)

    def test_patch_is_guarded_and_idempotent(self):
        source="class Handler:\n def do_GET(self):\n  try:\n   if path=='/revision': return page()\n  except: pass\n def do_POST(self):\n  validate_then_mutate()\n"
        updated=patch(source);self.assertEqual(patch(updated),updated)
        self.assertIn('validate_then_mutate()',updated)
        with self.assertRaises(ValueError):patch('def changed(): pass')


if __name__=='__main__':unittest.main()

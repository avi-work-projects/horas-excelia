"""Public synthetic tests for month selection, transitions and independent monitors."""
import hashlib
import json
import sqlite3
import tempfile
import unittest
from contextlib import contextmanager
from pathlib import Path
from types import SimpleNamespace
import invoice_plans as plans
import invoice_monitor


class PlansTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        self.service=SimpleNamespace(db=self.db,event=lambda *a:None)
        with self.db() as c:
            c.execute('CREATE TABLE plans(id INTEGER PRIMARY KEY,data TEXT,status TEXT,approval TEXT,detail TEXT)')
            c.execute('CREATE TABLE mails(key TEXT PRIMARY KEY,state TEXT)')
        self.nov=self.add('2027-11','approved');self.dec=self.add('2027-12','approved')

    def tearDown(self):self.tmp.cleanup()

    @contextmanager
    def db(self):
        c=sqlite3.connect(self.root/'service.sqlite');c.row_factory=sqlite3.Row
        try:
            with c:yield c
        finally:c.close()

    def add(self,month,state):
        data={'period':month,'send_date':month+'-19'}
        with self.db() as c:
            key=c.execute('INSERT INTO plans(data,status,approval) VALUES(?,?,?)',(json.dumps(data),state,'preserved')).lastrowid
        return plans.load(self.db,plan_id=key)

    def test_month_and_id_never_fall_back_to_latest(self):
        self.assertEqual(plans.load(self.db,month='2027-11'),self.nov)
        self.assertEqual(plans.load(self.db,plan_id=self.nov['id']),self.nov)
        for kw in [{'month':'2027-01'},{'plan_id':100},{'plan_id':True},{'month':'bad'}]:
            with self.assertRaises(ValueError):plans.load(self.db,**kw)

    def test_action_requires_matching_current_hash(self):
        digest=lambda p:p['period']
        self.assertEqual(plans.action(self.db,digest,'2027-11')['id'],self.nov['id'])
        with self.assertRaises(ValueError):plans.action(self.db,digest,'2027-11',self.dec['id'])
        self.add('2027-11','review')
        with self.assertRaises(ValueError):plans.action(self.db,digest,'2027-11',self.nov['id'])

    def test_transition_changes_only_named_month(self):
        plans.update(self.service,'cancelled',plan_id=self.dec['id'])
        self.assertEqual(plans.load(self.db,month='2027-11'),self.nov)
        self.assertEqual(plans.load(self.db,month='2027-12')['status'],'cancelled')
        with self.assertRaises(ValueError):plans.update(self.service,'sent')

    def test_tick_visits_current_revisions_in_date_order(self):
        ids=[];self.service.tick_plan=lambda t,b,i:ids.append(i) or 'waiting'
        result=plans.tick(self.service)
        self.assertEqual(ids,[self.nov['id'],self.dec['id']])
        self.assertEqual(result,{'2027-11':'waiting','2027-12':'waiting'})
        new=self.add('2027-11','review');ids.clear();plans.tick(self.service)
        self.assertEqual(ids,[new['id'],self.dec['id']])

    def test_uncertain_attempt_prevents_further_issuance_but_not_own_delivery(self):
        plans.update(self.service,'uncertain',plan_id=self.nov['id'])
        ids=[];self.service.tick_plan=lambda t,b,i:ids.append(i) or 'unchanged'
        self.assertEqual(plans.tick(self.service)['2027-12'],'waiting-reconciliation')
        self.assertNotIn(self.dec['id'],ids)
        plans.update(self.service,'accepted',plan_id=self.dec['id']);ids.clear();plans.tick(self.service)
        self.assertIn(self.dec['id'],ids)

    def test_monitor_preserves_legacy_and_creates_separate_month_identity(self):
        state={'delivery_plan':str(self.nov['id'])+':2027-11-19','delivery_uuid':'original','delivery_signal':''}
        seen=[];saved=[]
        def sync(client,cfg,entry,row,t):
            seen.append((row['data']['period'],entry['slug'],entry.get('delivery_uuid')))
            entry['delivery_uuid']=entry.get('delivery_uuid') or 'second'
            entry['delivery_plan']=str(row['id'])+':'+row['data']['send_date']
        monitor=SimpleNamespace(sync_delivery=sync,save=lambda name,value:saved.append(json.loads(json.dumps(value))))
        invoice_monitor.sync(monitor,None,{},state,invoice_monitor.plans(self.root),None)
        self.assertEqual(seen,[('2027-11','kairo-envio','original'),('2027-12','kairo-envio-2027-12',None)])
        self.assertEqual(state['deliveries']['2027-11']['delivery_uuid'],'original')
        self.assertEqual(set(saved[-1]['deliveries']),{'2027-11','2027-12'})

    def test_notifications_cover_both_months(self):
        seen=[];self.service.notify_plan=seen.append;plans.notify(self.service)
        self.assertEqual(seen,[self.nov['id'],self.dec['id']])
        seen.clear();watched=plans.notification_ids(self.service)
        plans.update(self.service,'sent',plan_id=self.nov['id']);plans.notify(self.service,watched)
        self.assertIn(self.nov['id'],seen)
        seen.clear();plans.notify(self.service)
        self.assertNotIn(self.nov['id'],seen,'No backfill of historical owner notifications')


if __name__=='__main__':unittest.main()

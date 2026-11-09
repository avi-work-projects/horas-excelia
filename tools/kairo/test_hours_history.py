"""Owner confirmations are facts, never an Outlook send or a guessed send date."""
import tempfile
import unittest
from datetime import datetime,timezone
from hours_store import Store
from hours_jobs import Jobs
from hours_model import user_confirmed,scope
from mail_calendar import calendar_data
from test_hours import request,NOW


class HistoryTests(unittest.TestCase):
    def test_confirmation_is_durable_idempotent_and_never_covers_future_weeks(self):
        with tempfile.TemporaryDirectory() as root:
            store=Store(root)
            store.confirm_history('2027-02-01',NOW);store.confirm_history('2027-02-01',NOW)
            with store.db() as db:self.assertEqual(db.execute('SELECT count(*) FROM history_confirmations').fetchone()[0],1)
            ledger=Store(root).ledger(['2027-01-25','2027-02-01','2027-02-08'])
            self.assertTrue(user_confirmed(ledger['2027-01-25']))
            self.assertIsNone(ledger['2027-01-25']['record_id']);self.assertIsNone(ledger['2027-01-25']['schedule'])
            self.assertNotIn('2027-02-01',ledger);self.assertNotIn('2027-02-08',ledger)
            with self.assertRaises(ValueError):store.confirm_history('2027-02-08',NOW)
            with self.assertRaises(ValueError):store.confirm_history('2027-01-31',NOW)
            with store.db() as db:self.assertEqual(db.execute('SELECT count(*) FROM weeks').fetchone()[0],0)

    def test_previous_month_is_covered_and_a_historical_week_is_never_written(self):
        with tempfile.TemporaryDirectory() as root:
            at=datetime(2027,2,8,6,tzinfo=timezone.utc)
            store=Store(root);store.confirm_history('2027-02-08',at)
            req=request();inv=dict(complete=True,accountVerified=True,records=[])
            result=store.preview(req,inv,at)
            first=result['rows'][0];self.assertEqual(first['state'],'sent');self.assertIsNone(first['action']);self.assertIsNone(first['schedule'])
            self.assertTrue(first['confirmedByUser']);self.assertNotIn('recordId',first)
            self.assertEqual(result['previousMonth']['pending'],[])
            calls=[]
            # A week-only confirmation produces no create/update, even on commit.
            req=request('week',req['weeks'][0]['key']);plan=store.preview(req,inv,at)
            store.commit(plan['planId'],lambda _:inv,lambda *args:calls.append(args),at,allow_writes=True,updates=[])
            self.assertEqual(calls,[])

    def test_calendar_and_stored_facts_share_the_confirmation_without_reading_outlook(self):
        with tempfile.TemporaryDirectory() as root:
            store=Store(root);jobs=Jobs(store,lambda *args:self.fail('No browser work'))
            with store.db() as db:db.execute('CREATE TABLE calendar_days (period TEXT PRIMARY KEY,days TEXT NOT NULL)')
            before=dict(period='2027-01',checkedAt=NOW.isoformat(),verified=True,rows=[dict(key=k,state='missing') for k in scope('2027-01')])
            jobs.remember('synthetic@example.invalid',before)
            store.confirm_history('2027-02-01',NOW)
            result=jobs.fact('synthetic@example.invalid','2027-01')
            self.assertTrue(all(r['state']=='sent' for r in result['rows'] if r['key']<'2027-02-01'))
            self.assertTrue(all(r['state']=='missing' for r in result['rows'] if r['key']>='2027-02-01'))
            calendar=calendar_data(store,'synthetic@example.invalid','2027-01',NOW)
            self.assertTrue(all(r['state']=='sent' for r in calendar['rows']))
            with store.db() as db:
                self.assertEqual(db.execute('SELECT count(*) FROM jobs').fetchone()[0],0)
            self.assertTrue(all(r['state']=='missing' for r in before['rows']))
            jobs.close()


if __name__=='__main__':unittest.main()

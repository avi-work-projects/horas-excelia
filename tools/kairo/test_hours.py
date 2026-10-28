import copy
import tempfile
import unittest
from datetime import datetime, timedelta, timezone

from hours_model import content_hash, monday, parse_days, reconcile, schedule, scope, validate_request
from hours_store import Store, StalePlan
from outlook_hours import week_from_label, header_date, header_week_year, scheduled_time, outlook_page, item_identity
from demo_hours import synthetic_request

NOW = datetime(2027, 2, 1, 6, tzinfo=timezone.utc)


def request(mode='month', target=None):
    return synthetic_request(mode=mode, target=target)


def inventory(req, count=0):
    previous = (monday(req['weeks'][0]['key'])-timedelta(weeks=1)).isoformat()
    records = [dict(id='prior', week=previous, state='sent')]
    for week in req['weeks'][:count]:
        records.append(dict(id=week['key'], week=week['key'], state='scheduled',
                            contentHash=content_hash(week),days=copy.deepcopy(week['days']),
                            schedule=schedule(week, NOW)[0]))
    return dict(complete=True, accountVerified=True, account='sender@example.invalid', records=records)


class ModelTests(unittest.TestCase):
    def test_official_outlook_redirect_keeps_identity_and_rejects_lookalikes(self):
        old='https://outlook.office.com/mail/drafts/id/item%2Bid%3D'
        new='https://outlook.cloud.microsoft/mail/drafts/id/item%2Bid%3D'
        self.assertTrue(outlook_page(old));self.assertTrue(outlook_page(new))
        self.assertEqual(item_identity(old,'sender@example.invalid'),item_identity(new,'sender@example.invalid'))
        for bad in ('http://outlook.cloud.microsoft/mail/','https://outlook.cloud.microsoft.evil.invalid/mail/',
                    'https://outlook.office.com@evil.invalid/mail/','https://user@outlook.office.com/mail/',
                    'https://outlook.office.com:8000/mail/','https://outlook.office.com:bad/mail/'):
            self.assertFalse(outlook_page(bad))

    def test_pwa_payload_and_python_share_the_mail_contract(self):
        import json,subprocess
        from pathlib import Path
        script="""const a=require('./tools/entorno').cargarApp({});
        a.CY=2026;a.CM=9;a.TO='destino@example.invalid';a.CC=[];a.AUTHOR_NAME='Prueba';
        a.ST={'2026-10-12':{type:'festivo'},'2026-10-13':{type:'vacaciones'},'2026-10-14':{type:'ausencia'}};
        process.stdout.write(JSON.stringify(a.hoursMailRequest()));"""
        payload=json.loads(subprocess.check_output(['node','-e',script],cwd=Path(__file__).resolve().parents[2],encoding='utf-8'))
        validate_request(payload)
        self.assertEqual(len(payload['weeks']),7)

    def test_outlook_labels_year_and_relative_schedule(self):
        self.assertIsNone(week_from_label('Semana del 14/09 al 18/09',scope('2026-10')))
        self.assertEqual(header_week_year('2026-12-28',header_date('Vie 01/01/2027 8:00'),False),2026)
        self.assertEqual(scheduled_time('Este mensaje está programado para enviarse este Vie 8.00.','2026-10-26',datetime(2026,10,28,tzinfo=timezone.utc)),'2026-10-30T08:00:00+01:00')
        self.assertEqual(scheduled_time('Vie 06/11, 8:00.','2026-11-02',NOW),'2026-11-06T08:00:00+01:00')

    def test_scope_bridge_and_year_boundary(self):
        self.assertEqual(scope('2026-10'), ['2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09'])
        self.assertEqual(scope('2026-12')[-2:], ['2027-01-04', '2027-01-11'])

    def test_vacation_fallback_matches_home_and_keeps_expired_dates_pending(self):
        import json,subprocess
        from pathlib import Path
        cases=[['normal']*5,['normal']*4+['vacaciones'],['vacaciones']*5,
               ['vacaciones']*4+['festivo'],['festivo']*5,['ausencia']*5]
        script="""const a=require('./tools/entorno').cargarApp({});const cases=JSON.parse(process.argv[1]);
        process.stdout.write(JSON.stringify(cases.map(types=>{a.ST={};types.forEach((type,i)=>{a.ST['2026-10-'+(26+i)]={type};});return a.homeWeekSchedule('2026-10-26',new Date('2026-10-26T06:00:00Z'));})));"""
        client=json.loads(subprocess.check_output(['node','-e',script,json.dumps(cases)],cwd=Path(__file__).resolve().parents[2],encoding='utf-8'))
        for types,expected,row in zip(cases,['2026-10-30','2026-10-29','2026-10-30','2026-10-29',None,None],client):
            week=dict(days=[dict(date='2026-10-'+str(26+i),type=kind,hours=9 if kind=='normal' else 0) for i,kind in enumerate(types)])
            target,issue=schedule(week,datetime(2026,10,26,6,tzinfo=timezone.utc))
            self.assertEqual(target[:10] if target else None,expected)
            self.assertEqual((row['date'],row['reason']),(expected,issue))
        week=dict(days=[dict(date='2026-10-'+str(26+i),type='vacaciones',hours=0) for i in range(5)])
        self.assertEqual(schedule(week,datetime(2026,10,30,7,tzinfo=timezone.utc))[1],'past-due')

    def test_vacation_week_can_be_scheduled_without_breaking_predecessor_rule(self):
        req=request()
        for day in req['weeks'][0]['days']:day.update(type='vacaciones',hours=0)
        req['weeks'][0]['body']='\n'.join('LMXJV'[i]+' '+datetime.fromisoformat(d['date']).strftime('%d/%m')+' — Vacaciones' for i,d in enumerate(req['weeks'][0]['days']))
        plan=reconcile(req,inventory(req),NOW)
        self.assertEqual((plan['rows'][0]['state'],plan['rows'][0]['schedule']),('ready','2027-02-05T08:00:00+01:00'))
        self.assertEqual(plan['rows'][1]['state'],'ready')
        self.assertEqual(reconcile(req,dict(complete=True,accountVerified=True,records=[]),NOW)['rows'][0]['state'],'blocked-previous')

    def test_sequential_and_individual(self):
        req = request(); inv = inventory(req)
        plan = reconcile(req, inv, NOW)
        self.assertEqual(plan['ready'], len(req['weeks']))
        req['mode'] = 'week'; req['targetWeek'] = req['weeks'][1]['key']
        self.assertEqual(reconcile(req, inv, NOW)['rows'][1]['state'], 'blocked-previous')
        inv['records'] = []
        self.assertTrue(all(r['state'] == 'blocked-previous' for r in reconcile(request(), inv, NOW)['rows']))

    def test_existing_week_is_not_identified_by_send_day(self):
        req = request(); inv = inventory(req, 1)
        inv['records'][1]['schedule'] = '2027-02-04T08:00:00+01:00'
        row = reconcile(req, inv, NOW)['rows'][0]
        self.assertEqual((row['state'], row['action'], row['recordId']), ('changed', 'update', '2027-02-01'))
        inv['records'][1]['state'] = 'sent'
        self.assertEqual(reconcile(req, inv, NOW)['rows'][0]['state'], 'sent')

    def test_existing_recipients_are_preserved_when_settings_change(self):
        req=request();inv=inventory(req,1);req['config']['to']=['otro@example.invalid']
        row=reconcile(req,inv,NOW)['rows'][0]
        self.assertEqual(row['state'],'scheduled')
        self.assertEqual(row['recipientPolicy'],'preserve-existing')

    def test_duplicates_drafts_incomplete_and_wrong_account_block(self):
        req = request(); inv = inventory(req, 1)
        inv['records'].append(inv['records'][1] | {'id': 'duplicate'})
        self.assertEqual(reconcile(req, inv, NOW)['rows'][0]['state'], 'duplicate')
        inv = inventory(req, 1); inv['records'][1]['state'] = 'draft'
        self.assertEqual(reconcile(req, inv, NOW)['rows'][0]['state'], 'draft')
        for field in ['complete', 'accountVerified']:
            inv = inventory(req); inv[field] = False
            self.assertEqual(reconcile(req, inv, NOW)['ready'], 0)

    def test_expired_and_empty_week_block_successors(self):
        req = request(); inv = inventory(req)
        self.assertEqual(reconcile(req, inv, datetime(2027,2,6,tzinfo=timezone.utc))['rows'][0]['state'], 'past-due')
        for day in req['weeks'][0]['days']:
            day.update(type='festivo', hours=0)
        req['weeks'][0]['body'] = '\n'.join('LMXJV'[i]+' '+datetime.fromisoformat(d['date']).strftime('%d/%m')+' — Festivo' for i,d in enumerate(req['weeks'][0]['days']))
        plan = reconcile(req, inv, NOW)
        self.assertEqual(plan['rows'][0]['state'], 'no-workdays')
        self.assertEqual(plan['rows'][1]['state'], 'blocked-previous')

    def test_last_workday_madrid_and_dst(self):
        week = request()['weeks'][0]
        week['days'][4].update(type='festivo', hours=0)
        self.assertEqual(schedule(week, NOW)[0], '2027-02-04T08:00:00+01:00')
        key = '2027-03-29'; start = monday(key)
        week['days'] = [dict(date=(start+timedelta(days=i)).isoformat(), type='normal', hours=9) for i in range(5)]
        self.assertEqual(schedule(week, NOW)[0], '2027-04-02T08:00:00+02:00')

    def test_android_footer_does_not_change_daily_identity(self):
        body = 'L 01/02 — 9 h\nM 02/02 — Festivo\nX 03/02 — Vacaciones\nJ 04/02 — Ausencia\nV 05/02 — 6,5 h\nEnviado desde Outlook para Android'
        days = parse_days(body, '2027-02-01')
        self.assertEqual([d['hours'] for d in days], [9,0,0,0,6.5])
        integer_days=[dict(d,hours=int(d['hours']) if d['hours']%1==0 else d['hours']) for d in days]
        self.assertEqual(content_hash({'days':days}),content_hash({'days':integer_days}))
        with self.assertRaises(ValueError): parse_days(body+'\nL 01/02 — 9 h', '2027-02-01')

    def test_reviewed_days_must_match_the_actual_mail(self):
        req=request();req['weeks'][0]['body']=req['weeks'][0]['body'].replace('9 h','8 h',1)
        with self.assertRaises(ValueError):reconcile(req,inventory(req),NOW)
        req=request();req['weeks'][0]['subject']='Semana del 08/02 al 12/02'
        with self.assertRaises(ValueError):reconcile(req,inventory(req),NOW)


class StoreTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.store = Store(self.tmp.name)
        self.req = request(); self.inv = inventory(self.req)
        self.calls = []

    def reader(self, request): return copy.deepcopy(self.inv)

    def writer(self, req, row):
        self.calls.append(row['key'])
        self.inv['records'] = [r for r in self.inv['records'] if r['week'] != row['key']]
        self.inv['records'].append(dict(id=row.get('recordId', row['key']), week=row['key'], state='scheduled', contentHash=row['contentHash'], schedule=row['schedule']))

    def test_review_is_readonly_and_commit_defaults_off(self):
        plan = self.store.preview(self.req, self.inv, NOW)
        self.assertEqual(self.store.ledger(), {})
        with self.assertRaises(PermissionError): self.store.commit(plan['planId'], self.reader, self.writer, NOW, updates=[])
        self.assertEqual(self.calls, [])

    def test_date_policy_change_requires_a_new_review(self):
        from unittest.mock import patch
        plan=self.store.preview(self.req,self.inv,NOW)
        with patch('hours_model.SCHEDULE_POLICY',999):
            with self.assertRaises(StalePlan):self.store.commit(plan['planId'],self.reader,self.writer,NOW,allow_writes=True,updates=[])
        self.assertEqual(self.calls,[])

    def test_chronological_commit_and_repeat_do_not_duplicate(self):
        plan = self.store.preview(self.req, self.inv, NOW)
        result = self.store.commit(plan['planId'], self.reader, self.writer, NOW, allow_writes=True, updates=[])
        self.assertEqual(self.calls, [w['key'] for w in self.req['weeks']])
        self.assertEqual(self.store.commit(plan['planId'], self.reader, self.writer, NOW, allow_writes=True, updates=[]), result)

    def test_lost_result_stops_and_never_retries(self):
        plan = self.store.preview(self.req, self.inv, NOW)
        def lost(req, row):
            self.writer(req, row)
            raise TimeoutError('Response lost after scheduling')
        self.store.commit(plan['planId'], self.reader, lost, NOW, allow_writes=True, updates=[])
        self.assertEqual(len(self.calls), 1)
        self.assertEqual(self.store.ledger()[self.req['weeks'][0]['key']]['state'], 'uncertain')
        next_plan = self.store.preview(self.req, self.inv, NOW)
        self.assertEqual(next_plan['rows'][0]['state'], 'uncertain')

    def test_time_is_rechecked_after_a_slow_browser_read(self):
        target=datetime.fromisoformat(schedule(self.req['weeks'][0],NOW)[0])
        before=target-timedelta(minutes=2)
        plan=self.store.preview(self.req,self.inv,before)
        result=self.store.commit(plan['planId'],self.reader,self.writer,before,
                                 allow_writes=True,updates=[],clock=lambda:target+timedelta(seconds=1))
        self.assertEqual(self.calls,[])
        self.assertEqual(result['results'][0]['state'],'changed-before-write')

    def test_outlook_change_and_expiry_require_new_review(self):
        plan = self.store.preview(self.req, self.inv, NOW)
        self.inv['records'].append(dict(id='external', week=self.req['weeks'][0]['key'], state='draft'))
        with self.assertRaises(StalePlan): self.store.commit(plan['planId'], self.reader, self.writer, NOW, allow_writes=True, updates=[])
        self.assertEqual(self.calls, [])
        plan = self.store.preview(self.req, self.inv, NOW)
        with self.assertRaises(StalePlan): self.store.commit(plan['planId'], self.reader, self.writer, NOW+timedelta(minutes=6), allow_writes=True, updates=[])

    def test_updates_require_specific_confirmation_and_keep_id(self):
        self.inv = inventory(self.req, 1); self.inv['records'][1]['contentHash'] = 'old'
        self.req.update(mode='week', targetWeek=self.req['weeks'][0]['key'])
        plan = self.store.preview(self.req, self.inv, NOW)
        self.store.commit(plan['planId'], self.reader, self.writer, NOW, allow_writes=True, updates=[])
        self.assertEqual(self.calls, [])
        plan = self.store.preview(self.req, self.inv, NOW)
        self.store.commit(plan['planId'], self.reader, self.writer, NOW, allow_writes=True, updates=[self.req['targetWeek']])
        self.assertEqual(self.inv['records'][1]['id'], self.req['targetWeek'])

    def test_two_devices_cannot_reserve_the_same_week(self):
        from concurrent.futures import ThreadPoolExecutor
        plans = [self.store.preview(self.req, self.inv, NOW) for _ in range(2)]
        def run(plan):
            try:return self.store.commit(plan['planId'], self.reader, self.writer, NOW, allow_writes=True, updates=[])
            except StalePlan:return None
        with ThreadPoolExecutor(2) as pool: list(pool.map(run, plans))
        self.assertEqual(len(self.calls), len(set(self.calls)))


class HttpTests(unittest.TestCase):
    def test_identity_csrf_simulation_and_real_write_denied(self):
        from hours_service import make_handler
        from http.server import ThreadingHTTPServer
        from threading import Thread
        from urllib.request import Request, urlopen
        from urllib.error import HTTPError
        import json,re
        with tempfile.TemporaryDirectory() as temp:
            store=Store(temp);req=request();inv=inventory(req,1)
            observed_clock=[NOW];read_calls=[]
            cfg=dict(private_origin='https://hours.example.invalid',app_origin='https://app.example.invalid',owner='owner@example.invalid')
            class FreshReader:
                fresh=False
                def invalidate(self):self.fresh=True
                def __call__(self,_request):
                    if not self.fresh:raise RuntimeError('El DOM almacenado no acredita el servidor')
                    self.fresh=False
                    read_calls.append(True)
                    observed_clock[0]+=timedelta(seconds=40)
                    return copy.deepcopy(inv)
            server=ThreadingHTTPServer(('127.0.0.1',0),make_handler(cfg,store,FreshReader(),clock=lambda:observed_clock[0]))
            thread=Thread(target=server.serve_forever,daemon=True);thread.start()
            root='http://127.0.0.1:'+str(server.server_port)
            headers={'Host':'hours.example.invalid','Tailscale-User-Login':cfg['owner']}
            try:
                with self.assertRaises(HTTPError) as caught:urlopen(root+'/')
                caught.exception.close()
                with urlopen(Request(root+'/',headers=headers)) as response:
                    self.assertEqual(response.headers['Content-Security-Policy'],'frame-ancestors '+cfg['app_origin'])
                    self.assertIsNone(response.headers.get('X-Frame-Options'))
                    html=response.read().decode()
                csrf=json.loads(re.search(r'const hoursBridgeConfig=(.*?);',html).group(1))['csrf']
                def post(path,data,token=csrf):
                    return urlopen(Request(root+path,data=json.dumps(data).encode(),headers=headers|{'Origin':cfg['private_origin'],'X-CSRF':token,'Content-Type':'application/json'}))
                with self.assertRaises(HTTPError) as caught:post('/preview',req,token='wrong')
                caught.exception.close()
                plan=json.load(post('/preview',req))
                self.assertFalse(plan['allowWrites'])
                # A slow observation must not expire its cache before returning.
                json.load(post('/preview',req))
                self.assertEqual(len(read_calls),1)
                status=json.load(urlopen(Request(root+'/status?period=2027-02',headers=headers|{'Origin':cfg['app_origin']})))
                self.assertEqual(status['rows'][0]['days'],req['weeks'][0]['days'])
                self.assertEqual(status['rows'][0]['schedule'],'2027-02-05T08:00:00+01:00')
                self.assertNotIn('body',status['rows'][0]);self.assertNotIn('toDisplay',status['rows'][0])
                result=json.load(post('/simulate',dict(planId=plan['planId'],updates=[])))
                self.assertTrue(result['simulation']);self.assertEqual(store.ledger(),{})
                with self.assertRaises(HTTPError) as caught:post('/commit',dict(planId=plan['planId']))
                self.assertEqual(caught.exception.code,403)
                caught.exception.close()
            finally:
                server.shutdown();server.server_close();thread.join()


if __name__ == '__main__': unittest.main()

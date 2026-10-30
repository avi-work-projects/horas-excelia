import json
import tempfile
import threading
import time
import unittest
from datetime import datetime
from http.server import ThreadingHTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from hours_jobs import Jobs
from hours_model import MADRID
from hours_service import make_handler
from hours_store import Store


def wait_done(jobs, identifier):
    deadline = time.monotonic()+5
    while time.monotonic()<deadline:
        state = jobs.get(identifier)
        if state['phase'] in ('done','error'):
            return state
        time.sleep(.01)
    raise AssertionError('Trabajo sin terminar')


class JobsTests(unittest.TestCase):
    def test_failed_status_preserves_facts_and_returns_specific_safe_error(self):
        with tempfile.TemporaryDirectory() as temp:
            store=Store(temp)
            cfg=dict(private_origin='https://hours.invalid',app_origin='https://app.invalid',sender='sender@example.invalid')
            handler=make_handler(cfg,store,lambda _:dict(complete=False,accountVerified=False,problemCode='auth_required',problem='PRIVATE CONTENT MUST NOT LEAK'))
            old=dict(period='2027-02',checkedAt='2027-02-01T00:00:00Z',verified=True,rows=[])
            handler.jobs.remember(cfg['sender'],old)
            try:
                job=handler.jobs.submit('status',{'period':'2027-02','periods':['2027-02'],'refresh':True},'test-refresh')
                result=wait_done(handler.jobs,job['jobId'])
                self.assertEqual(result['phase'],'error');self.assertEqual(result['errorCode'],'auth_required')
                self.assertNotIn('PRIVATE CONTENT',json.dumps(result))
                self.assertEqual(handler.jobs.fact(cfg['sender'],'2027-02'),old)
            finally:handler.jobs.close()

    def test_commit_job_confirms_facts_after_reservations_and_is_idempotent(self):
        from unittest.mock import patch
        import copy
        from test_hours import request, inventory, NOW
        with tempfile.TemporaryDirectory() as temp:
            store=Store(temp);req=request();observed=inventory(req);writes=[];reads=[]
            plan=store.preview(req,observed,NOW)
            def read(_request):reads.append(True);return copy.deepcopy(observed)
            def write(_request,row):
                writes.append(row['key'])
                week=next(w for w in req['weeks'] if w['key']==row['key'])
                observed['records'].append(dict(week=row['key'],id=row['key'],state='scheduled',
                    days=week['days'],schedule=row['schedule'],contentHash=row['contentHash']))
            cfg=dict(private_origin='https://hours.invalid',app_origin='https://app.invalid',sender='sender@example.invalid',writes_enabled=True)
            handler=make_handler(cfg,store,read,clock=lambda:NOW)
            try:
                with patch('outlook_hours_writer.OutlookWriter',return_value=write):
                    job=handler.jobs.submit('commit',{'planId':plan['planId'],'updates':[]},'commit:'+plan['planId'])
                    done=wait_done(handler.jobs,job['jobId'])
                    self.assertEqual(done['phase'],'done')
                    self.assertTrue(all(row['state']=='scheduled' for row in done['result']['status']['rows']))
                    again=handler.jobs.submit('commit',{'planId':plan['planId'],'updates':[]},'commit:'+plan['planId'])
                    self.assertEqual(again['jobId'],job['jobId'])
                    self.assertEqual(len(writes),len(req['weeks']))
                    self.assertEqual(len(reads),len(writes)+1,'Cada confirmación comprueba también la semana siguiente, sin barrido duplicado')
            finally:handler.jobs.close()

    def test_disconnect_and_duplicate_confirmation_do_not_repeat_work(self):
        with tempfile.TemporaryDirectory() as temp:
            store=Store(temp);entered=threading.Event();release=threading.Event();calls=[]
            def execute(kind, data):
                calls.append(kind);entered.set();release.wait(3);return {'confirmed':True}
            jobs=Jobs(store, execute)
            try:
                first=jobs.submit('commit', {'planId':'example'}, 'commit:example')
                self.assertTrue(entered.wait(2))
                second=jobs.submit('commit', {'planId':'example'}, 'commit:example')
                self.assertEqual(first['jobId'],second['jobId'])
                release.set()
                self.assertEqual(wait_done(jobs,first['jobId'])['result'],{'confirmed':True})
                self.assertEqual(calls,['commit'])
            finally:release.set();jobs.close()
            restored=Jobs(Store(temp),execute)
            try:self.assertEqual(restored.get(first['jobId'])['phase'],'done')
            finally:restored.close()

    def test_restart_recovers_reads_and_never_replays_an_interrupted_write(self):
        with tempfile.TemporaryDirectory() as temp:
            store=Store(temp);initial=Jobs(store,lambda *_:None)
            with store.db() as db:
                for kind in ('status','commit'):
                    db.execute('INSERT INTO jobs VALUES (?,?,?,?,?,NULL,NULL,?)',
                               (kind,kind,kind,'{}','running','2027-02-01'))
            calls=[];restored=Jobs(store,lambda kind,data:calls.append(kind) or {'ok':True})
            try:
                self.assertEqual(restored.get('commit')['phase'],'error')
                restored.start();self.assertEqual(wait_done(restored,'status')['phase'],'done')
                self.assertEqual(calls,['status'])
                restored.remember('account-a',{'period':'2027-02','rows':[]})
                self.assertIsNone(restored.fact('account-b','2027-02'))
                self.assertIsNotNone(restored.fact('account-a','2027-02'))
            finally:restored.close();initial.close()

    def test_http_audit_acknowledges_before_browser_and_reuses_three_month_facts(self):
        with tempfile.TemporaryDirectory() as temp:
            gate=threading.Event();entered=threading.Event();calls=[]
            class Reader:
                def invalidate(self):pass
                def __call__(self, request):
                    calls.append(request);entered.set();gate.wait(3)
                    return {'complete':True,'accountVerified':True,'account':'test@example.invalid','records':[]}
            cfg={'private_origin':'https://hours.example.invalid','app_origin':'https://app.example.invalid',
                 'owner':'test-owner','sender':'test@example.invalid'}
            handler=make_handler(cfg,Store(temp),Reader(),clock=lambda:datetime(2027,2,1,tzinfo=MADRID))
            server=ThreadingHTTPServer(('127.0.0.1',0),handler);threading.Thread(target=server.serve_forever,daemon=True).start()
            root='http://127.0.0.1:'+str(server.server_port)
            headers={'Host':'hours.example.invalid','Origin':cfg['app_origin'],'Tailscale-User-Login':cfg['owner']}
            def get(path,extra=None):
                with urlopen(Request(root+path,headers=headers|(extra or {})),timeout=5) as response:
                    return response.status,json.load(response)
            try:
                started=time.monotonic();status,job=get('/status?period=2027-02&background=1&audit=1')
                self.assertEqual(status,202);self.assertLess(time.monotonic()-started,1)
                self.assertTrue(entered.wait(2))
                _,same=get('/status?period=2027-02&background=1&audit=1&refresh=1')
                self.assertEqual(same['jobId'],job['jobId'])
                gate.set()
                result=wait_done(handler.jobs,job['jobId'])
                self.assertEqual([r['period'] for r in result['result']['periods']],['2027-01','2027-02','2027-03'])
                self.assertEqual(calls[0]['periods'],['2027-01','2027-02','2027-03'])
                self.assertEqual(get('/status?period=2027-02&background=1&audit=1')[0],200)
                self.assertEqual(len(calls),1)
                _,next_job=get('/status?period=2027-03&background=1&audit=1')
                next_result=wait_done(handler.jobs,next_job['jobId'])
                self.assertEqual(next_result['phase'],'done')
                self.assertEqual(calls[-1]['periods'],['2027-04'])
                self.assertEqual([r['period'] for r in next_result['result']['periods']],['2027-02','2027-03','2027-04'])
                with self.assertRaises(HTTPError) as caught:get('/jobs/'+job['jobId'],{'Origin':'https://wrong.invalid'})
                caught.exception.close()
                self.assertEqual(get('/jobs/'+job['jobId'])[1]['phase'],'done')
            finally:gate.set();server.shutdown();server.server_close();handler.jobs.close()


if __name__=='__main__':unittest.main()

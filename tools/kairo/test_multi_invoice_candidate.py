"""Test the actual patched private service against temporary data and fake transports.

Usage: python test_multi_invoice_candidate.py PRIVATE_CANDIDATE/service.py
No service starts; socket construction is forbidden throughout every test.
"""
import importlib.util
import json
import sys
import tempfile
import unittest
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

candidate=Path(sys.argv.pop(1)).resolve()
sys.path.insert(0,str(candidate.parent))
spec=importlib.util.spec_from_file_location('multi_candidate',candidate)
s=importlib.util.module_from_spec(spec);sys.modules[spec.name]=s;spec.loader.exec_module(s)


class Backend:
    def __init__(self):self.calls=[];self.fail=set()
    def preflight(self,p):self.calls.append(('preflight',p['period']))
    def emit(self,p):
        self.calls.append(('emit',p['period']))
        if p['period'] in self.fail:raise TimeoutError('synthetic transport interruption')
        return {'status':'accepted'}
    def final_pdf(self,p):return b'%PDF synthetic'
    def send(self,p,pdf):self.calls.append(('mail',p['period']))


class CandidateTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        self.patches=[patch.object(s,'ROOT',self.root),patch('socket.socket',side_effect=AssertionError('Network forbidden'))]
        for p in self.patches:p.start()
        (self.root/'service-config.json').write_text(json.dumps({'commissioned':True,'live_enabled':True,'mail_enabled':True,'calendar':{'years':{'2027':[]}}}))
        self.backend=Backend();self.nov=self.add('2027-11','2027-11-19',1);self.dec=self.add('2027-12','2027-12-20',2)

    def tearDown(self):
        for p in reversed(self.patches):p.stop()
        self.tmp.cleanup()

    def add(self,period,day,docid,state='approved'):
        data={'period':period,'send_date':day,'docid':docid,'number':'TEST-'+period,'source_hash':period,'panel_hash':'panel-'+period}
        with s.db() as c:
            i=c.execute('INSERT INTO plans(data,status,approval) VALUES(?,?,?)',(json.dumps(data),state,json.dumps({'hash':s.digest(data)}))).lastrowid
        return s.load(plan_id=i)

    def moment(self,month=11,day=19,hour=7,minute=30):return datetime(2027,month,day,hour,minute,tzinfo=s.ZONE)

    def test_both_months_wait_then_emit_and_send_independently_without_duplicates(self):
        before=s.load(period='2027-12')
        self.assertEqual(s.tick(self.moment(day=18),self.backend)['2027-11'],'waiting')
        s.tick(self.moment(),self.backend)
        self.assertEqual(s.load(period='2027-11')['status'],'accepted');self.assertEqual(s.load(period='2027-12'),before)
        s.tick(self.moment(hour=8,minute=0),self.backend);s.tick(self.moment(hour=8,minute=0),self.backend)
        self.assertEqual(self.backend.calls.count(('mail','2027-11')),1)
        s.tick(self.moment(12,20),self.backend);s.tick(self.moment(12,20,8,0),self.backend)
        self.assertEqual(self.backend.calls.count(('emit','2027-11')),1);self.assertEqual(self.backend.calls.count(('emit','2027-12')),1)
        self.assertEqual(self.backend.calls.count(('mail','2027-12')),1)

    def test_cancel_december_keeps_november_approval_and_execution(self):
        before=s.load(period='2027-11')
        s.cancel(s.digest(self.dec['data']),self.dec['id'])
        self.assertEqual(s.load(period='2027-11'),before)
        s.tick(self.moment(),self.backend)
        self.assertEqual(s.load(period='2027-12')['status'],'cancelled')
        self.assertIn(('emit','2027-11'),self.backend.calls)

    def test_approve_older_month_by_hash_and_reject_cross_month_id(self):
        s.status('review',plan_id=self.nov['id']);s.status('review',plan_id=self.dec['id'])
        with patch.object(s,'now',return_value=self.moment(day=1)),patch.object(s,'live_matches',return_value={'state':10,'records':[]}):
            with self.assertRaises(ValueError):s.approve(s.digest(self.nov['data']),self.dec['id'])
            s.approve(s.digest(self.nov['data']))
            s.approve(s.digest(self.dec['data']),self.dec['id'])
        self.assertEqual(s.load(period='2027-11')['status'],'approved');self.assertEqual(s.load(period='2027-12')['status'],'approved')
        self.assertFalse(self.backend.calls)

    def test_changed_month_invalidates_only_its_approval(self):
        with s.db() as c:c.execute('UPDATE plans SET data=? WHERE id=?',(json.dumps(self.dec['data']|{'number':'CHANGED'}),self.dec['id']))
        s.tick(self.moment(),self.backend)
        self.assertEqual(s.load(period='2027-12')['status'],'blocked');self.assertEqual(s.load(period='2027-11')['status'],'accepted')

    def test_interrupted_emission_is_not_retried_or_transferred_to_other_month(self):
        self.backend.fail.add('2027-11');s.tick(self.moment(),self.backend)
        s.tick(self.moment(minute=31),self.backend)
        self.assertEqual(s.load(period='2027-11')['status'],'uncertain')
        self.assertEqual(s.load(period='2027-12'),self.dec)
        result=s.tick(self.moment(12,20),self.backend)
        self.assertEqual(result['2027-12'],'waiting-reconciliation')
        self.assertEqual(self.backend.calls.count(('emit','2027-11')),1)

    def test_reloading_module_preserves_independent_persisted_plans(self):
        # Re-import definitions like a restart, then point to the same temporary DB.
        spec2=importlib.util.spec_from_file_location('multi_restarted',candidate)
        restarted=importlib.util.module_from_spec(spec2);sys.modules[spec2.name]=restarted;spec2.loader.exec_module(restarted);restarted.ROOT=self.root
        self.assertEqual(restarted.load(period='2027-11'),self.nov)
        restarted.tick(self.moment(),self.backend)
        self.assertEqual(restarted.load(period='2027-12'),self.dec)
        del sys.modules[spec2.name]

    def test_future_import_selects_existing_month_even_when_another_is_newer(self):
        fake=SimpleNamespace(validate_source=lambda path:json.loads(path.read_text()))
        with patch.dict(sys.modules,{'engine':fake,'panel':SimpleNamespace()}),patch.object(s,'live_matches',return_value={}):
            result=s.import_json(json.dumps({'period':'2027-11','contentHash':'2027-11'}),notify_review=False)
        self.assertEqual(result,self.nov['data']);self.assertEqual(s.load(period='2027-12'),self.dec)

    def test_prepare_new_december_preserves_approved_november_and_reuses_identical_plan(self):
        with s.db() as c:
            c.execute('DELETE FROM plans WHERE id=?',(self.dec['id'],))
            c.execute('CREATE TABLE drafts(docid INTEGER PRIMARY KEY,snapshot TEXT,fingerprint TEXT,source TEXT)')
        source=self.root/'synthetic-source.json';source.write_text(json.dumps({'project':'TEST'}))
        snap={'period':'2027-12','contentHash':'synthetic-hash','number':'TEST-12','days':20,'base':200,'vat':42,'withholding':30,'total':212,'due_date':'20-01-2028','lines':[{'pvpunitario':10}]}
        with s.db() as c:c.execute('INSERT INTO drafts VALUES(?,?,?,?)',(2,json.dumps(snap),'synthetic-panel',str(source)))
        pdf=self.root/'archive/2027-12/synthetic-hash/borrador.pdf';pdf.parent.mkdir(parents=True);pdf.write_bytes(b'%PDF synthetic')
        template=self.root/'template-plugin/GestifyPDF/Lib/Export/PDFExport.php';template.parent.mkdir(parents=True);template.write_text('synthetic')
        fake=SimpleNamespace(ProductionAdapter=lambda root:SimpleNamespace(inspect=lambda docid:{'state':10,'records':[],'snapshot':{'invoice':{'fecha':'20-12-2027'}}}),digest=lambda p:'synthetic-fiscal')
        with patch.dict(sys.modules,{'panel':SimpleNamespace(db=s.db),'emission':fake}),patch.object(s,'make_message',return_value=SimpleNamespace(as_bytes=lambda:b'Synthetic review')):
            prepared=s.prepare_plan(2);repeated=s.prepare_plan(2)
        self.assertEqual(prepared,repeated);self.assertEqual(s.load(period='2027-11'),self.nov)
        self.assertEqual(s.load(period='2027-12')['status'],'review')
        with s.db() as c:self.assertEqual(c.execute('SELECT count(*) FROM plans').fetchone()[0],2)

    def test_stale_revision_cannot_cancel_current_month(self):
        with s.db() as c:c.execute("UPDATE plans SET status='blocked',approval=NULL WHERE id=?",(self.nov['id'],))
        self.add('2027-11','2027-11-19',1,state='review')
        with self.assertRaises(ValueError):s.cancel(s.digest(self.nov['data']),self.nov['id'])
        self.assertEqual(s.load(period='2027-12'),self.dec)

    def test_editing_november_dispatches_its_revision_while_december_is_newer(self):
        fake=SimpleNamespace(validate_source=lambda path:json.loads(path.read_text()))
        raw=json.dumps({'period':'2027-11','contentHash':'changed'})
        with patch.dict(sys.modules,{'engine':fake,'panel':SimpleNamespace()}),patch.object(s,'replace_draft',return_value='synthetic revision') as revise:
            self.assertEqual(s.import_json(raw,notify_review=False),'synthetic revision')
            revise.assert_called_once_with(raw)
        self.assertEqual(s.load(period='2027-12'),self.dec)

    def test_private_monitor_keeps_november_alert_and_tracks_december_separately(self):
        spec2=importlib.util.spec_from_file_location('multi_monitor',candidate.parent/'monitoring.py')
        monitor=importlib.util.module_from_spec(spec2);sys.modules[spec2.name]=monitor
        # This test exercises alert identities, not the unchanged Linux process lock.
        with patch.dict(sys.modules,{'fcntl':SimpleNamespace()} if sys.platform=='win32' else {}):
            spec2.loader.exec_module(monitor)
        monitor.ROOT=self.root
        calls=[]
        def api(path,data):calls.append(('api',data['slug']));return {'uuid':'new-december'}
        client=SimpleNamespace(api=api,ping=lambda uuid,**kw:calls.append(('ping',uuid,kw)))
        state={'delivery_plan':str(self.nov['id'])+':2027-11-19','delivery_uuid':'existing-november','delivery_signal':''}
        monitor.sync_deliveries(client,{'channels':'synthetic'},state,monitor.plans(),self.moment(day=1))
        self.assertEqual([c for c in calls if c[0]=='api'],[('api','kairo-envio-2027-12')])
        self.assertEqual(state['deliveries']['2027-11']['delivery_uuid'],'existing-november')
        s.status('sent',plan_id=self.nov['id'])
        with s.db() as c:c.execute('INSERT INTO mails VALUES(?,?,?)',('final:'+s.digest(self.nov['data']),'sent','synthetic'))
        monitor.sync_deliveries(client,{'channels':'synthetic'},state,monitor.plans(),self.moment(hour=8,minute=0))
        self.assertIn(('ping','existing-november',{'failed':False}),calls)
        self.assertEqual(set(json.loads((self.root/'monitor-state.json').read_text())['deliveries']),{'2027-11','2027-12'})
        del sys.modules[spec2.name]


if __name__=='__main__':unittest.main()

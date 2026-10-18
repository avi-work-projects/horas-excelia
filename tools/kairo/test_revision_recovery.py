"""Second-stage integration: run only after run_revision_integration in its clone."""
import json
import subprocess
from unittest.mock import patch
import service as s
import panel
import engine
import draft_revision
from gestify_bridge import handle

assert str(s.ROOT) == '/home/angel/draft-revision-test-20261018/workflow'
assert json.loads((s.ROOT/'draft-revision-config.json').read_text())['container']=='gestify-revision-test-app-1'

def forbidden(*a, **k): raise AssertionError('No fiscal emission or mail in test')
s.mail=forbidden
s.FiscalBackend.emit=forbidden
s.FiscalBackend.send=forbidden

def receive(p):
    with s.process_lock():
        return handle(s,panel,engine.validate_source,dict(action='prepare',source=json.dumps(p),**{k:p[k] for k in ('operationId','contentHash','period')}))

old=s.load(); assert old['data']['period']=='2026-11' and old['data']['docid']==2
s.approve(s.digest(old['data']))
p=json.loads((s.ROOT/'fixture-r4.json').read_text())
p['revision']=5
p['days'][1]['rate']='350'
p['lines']=[dict(unit='day',rateCents=r,quantity100=100,baseCents=r) for r in (32000,35000)]
p.update(baseCents=67000,vatCents=14070,withholdingCents=10050,totalCents=71020)
path=s.ROOT/'fixture-r5.json';path.write_text(json.dumps(p))
subprocess.run(['node',str(s.ROOT/'rehash.mjs'),str(path)],check=True)
p=json.loads(path.read_text())

# Commit succeeds in PHP, then transport loses its response.
real_run=subprocess.run
def lost_reply(args,*a,**kw):
    result=real_run(args,*a,**kw)
    if args[:3]==['docker','exec','-i'] and 'php' in args:
        assert result.returncode==0,result.stderr
        raise TimeoutError('Simulated response loss after commit')
    return result
if old['data']['display']['base'] != 670:
    with patch.object(draft_revision.subprocess,'run',lost_reply):
        try:receive(p)
        except TimeoutError:pass
        else:raise AssertionError('Expected lost reply')
    assert s.load()['status']=='blocked' and s.load()['approval'] is None
assert receive(p)['state'] in ('review','approved')
new=s.load();assert new['data']['docid']==2 and new['data']['display']['base']==670
assert len([x for x in engine.api('lineafacturaclientes?limit=1000') if x['idfactura']==2])==2
assert receive(p)['state'] in ('review','approved') and s.load()==new

# Revert from two price groups to one line; still no inherited approval.
if new['status']=='review':s.approve(s.digest(new['data']))
p=json.loads((s.ROOT/'fixture-r4.json').read_text());p['revision']=6
assert receive(p)['state']=='review'
assert s.load()['approval'] is None and len([x for x in engine.api('lineafacturaclientes?limit=1000') if x['idfactura']==2])==1
with s.db() as db:assert db.execute('SELECT COUNT(*) FROM mails').fetchone()[0]==0
assert len(engine.api('facturaclientes?limit=1000'))==2
print('PASS: lost PHP response recovered, multi-line add/remove, approval cleared, no duplicate/mail')

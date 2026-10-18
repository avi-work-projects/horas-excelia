"""Run ONLY in the private, network-isolated FacturaScripts test clone.

Requires its prepared seed.json and rehash.mjs. Never accepts a production root.
"""
import copy
import json
import subprocess
from pathlib import Path
import service as s
import panel
import engine
from gestify_bridge import handle

assert str(s.ROOT) == '/home/angel/draft-revision-test-20261018/workflow'
assert 'gestify-revision-test' in json.loads((s.ROOT/'draft-revision-config.json').read_text())['container']
def forbidden(*a, **k): raise AssertionError('Emission or email forbidden in revision test')
s.mail = forbidden
s.FiscalBackend.emit = forbidden
s.FiscalBackend.send = forbidden

seed = json.loads((s.ROOT/'seed.json').read_text())

def source(revision, count, rate='320'):
    p = copy.deepcopy(seed)
    p['revision'] = revision
    p['days'] = p['days'][:count]
    for d in p['days']: d['rate'] = rate
    p['lines'] = [dict(unit='day',rateCents=int(rate)*100,quantity100=count*100,baseCents=int(rate)*100*count)]
    p['baseCents'] = p['lines'][0]['baseCents']
    p['vatCents'] = engine.rounded(p['baseCents']*2100,10000)
    p['withholdingCents'] = engine.rounded(p['baseCents']*1500,10000)
    p['totalCents'] = p['baseCents']+p['vatCents']-p['withholdingCents']
    path = s.ROOT/('fixture-r'+str(revision)+'.json')
    path.write_text(json.dumps(p,ensure_ascii=False))
    subprocess.run(['node',str(s.ROOT/'rehash.mjs'),str(path)],check=True)
    return path.read_text(), json.loads(path.read_text())

def receive(raw,p):
    with s.process_lock():
        return handle(s,panel,engine.validate_source,dict(action='prepare',source=raw,**{k:p[k] for k in ('operationId','contentHash','period')}))

raw,p = source(1,2)
assert receive(raw,p)['state'] in ('review','blocked')
first=s.load();docid=first['data']['docid'];number=first['data']['number']
assert docid != 1 and first['data']['period']=='2026-11'
if first['status']=='review':
    s.approve(s.digest(first['data']))
    assert s.load()['approval']
else:
    assert list((s.ROOT/'revisions').glob('*.json')), 'Unexpected blocked baseline'
old_pdf=(s.ROOT/first['data']['draft_pdf']).read_bytes()
raw,p = source(2,1)
assert receive(raw,p)['state']=='review'
second=s.load()
assert second['approval'] is None and second['data']['docid']==docid and second['data']['number']==number
assert second['data']['display']['base']==320
assert (s.ROOT/first['data']['draft_pdf']).read_bytes()==old_pdf
assert (s.ROOT/second['data']['draft_pdf']).read_bytes()!=old_pdf
try:s.approve(s.digest(first['data']))
except ValueError:pass
else:raise AssertionError('Old approval accepted')
assert receive(raw,p)['state']=='review' and s.load()==second
s.approve(s.digest(second['data']))
raw,p=source(3,2,'350')
assert receive(raw,p)['state']=='review'
third=s.load()
assert third['approval'] is None and third['data']['display']['base']==700
assert third['data']['docid']==docid and third['data']['number']==number
# Reverting content still requires a fresh approval.
raw,p=source(4,2)
assert receive(raw,p)['state']=='review'
fourth=s.load();assert fourth['approval'] is None and fourth['data']['display']['base']==640
assert fourth['data']['docid']==docid
with s.db() as db:assert db.execute('SELECT COUNT(*) FROM mails').fetchone()[0]==0
with panel.db() as db:
    draft=db.execute('SELECT * FROM drafts WHERE docid=?',(docid,)).fetchone()
    assert draft['approved_hash'] is None
docs=engine.api('facturaclientes?limit=1000')
assert len(docs)==2 and next(x for x in docs if x['idfactura']==docid)['idestado']==10
(s.ROOT/'integration-result.json').write_text(json.dumps({'ok':True,'docid':docid,'number':number,
 'revisions':4,'old_approval_rejected':True,'old_pdf_preserved':True,'no_mail':True,
 'same_document':True,'pdf':fourth['data']['draft_pdf']},indent=2))
print('PASS: 4 revisions, same document/number, fresh approval required, archived PDFs preserved, no mail')

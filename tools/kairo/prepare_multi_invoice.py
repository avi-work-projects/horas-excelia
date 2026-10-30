"""Build a private candidate without copying personal configuration into Git.

Exact anchors fail closed on drift; untouched functions are preserved verbatim.
This command does not install, restart services, import invoices or send mail.
"""
import ast
from pathlib import Path


def replace(source, old, new):
    if source.count(old) != 1:
        raise ValueError('El servicio ha cambiado; revisar el punto: ' + old[:100])
    return source.replace(old, new, 1)


def function(source, name, transform):
    nodes = [n for n in ast.walk(ast.parse(source)) if isinstance(n, ast.FunctionDef) and n.name == name]
    if len(nodes) != 1:
        raise ValueError('Función ausente o ambigua: ' + name)
    node = nodes[0]
    lines = source.splitlines(keepends=True)
    old = ''.join(lines[node.lineno-1:node.end_lineno])
    new = transform(old.rstrip('\n')) + '\n'
    return ''.join(lines[:node.lineno-1]) + new + ''.join(lines[node.end_lineno:])


def patch_service(source):
    result = function(source, 'load', lambda _: '''def load(plan_id=None,period=None):
 from invoice_plans import load as select_plan
 return select_plan(db,plan_id=plan_id,month=period)''')
    result = function(result, 'status', lambda _: '''def status(value,detail=None,plan_id=None):
 from invoice_plans import update
 return update(sys.modules[__name__],value,detail,plan_id)''')
    result = function(result, 'prepare_plan', lambda s: replace(s,
        "  old=c.execute('SELECT * FROM plans ORDER BY id DESC LIMIT 1').fetchone()",
        "  records=c.execute('SELECT * FROM plans ORDER BY id DESC').fetchall()\n  same=[r for r in records if json.loads(r['data'])['period']==p['period']]\n  old=same[0] if same else None\n  if any(r['status'] in ('emitting','queued','accepted','sending','uncertain','sent','email_cancelled') for r in same):raise ValueError('Este mes ya tiene una emisión iniciada o confirmada')"))
    result = function(result, 'import_json', lambda s: replace(s, 'try:previous=load()', "try:previous=load(period=source['period'])"))
    for name in ('approve','cancel'):
        def transform(s, name=name):
            s=replace(s, 'def '+name+'(expected):', 'def '+name+'(expected,plan_id=None):')
            s=replace(s, ' r=load()', ' from invoice_plans import action\n r=action(db,digest,expected,plan_id)')
            return explicit_status(s)
        result=function(result,name,transform)
    def tick_one(s):
        s=replace(s,'def tick(moment=None,backend=None):','def tick_plan(moment=None,backend=None,plan_id=None):')
        s=replace(s,'r=load();p=', 'r=load(plan_id=plan_id);p=')
        return explicit_status(s)
    result=function(result,'tick',tick_one)
    result=function(result,'notify_status',lambda s: replace(replace(s,'def notify_status():','def notify_plan(plan_id):'),'r=load();p=','r=load(plan_id=plan_id);p='))
    result=replace(result,'def page():', '''def tick(moment=None,backend=None,plan_id=None):
 from invoice_plans import tick as tick_months
 return tick_months(sys.modules[__name__],moment,backend,plan_id)

def notify_status(plan_ids=None):
 from invoice_plans import notify
 notify(sys.modules[__name__],plan_ids)

def page():''')
    def post(s):
        s=replace(replace(s,"approve(data['hash'])","approve(data['hash'],data.get('planId'))"),"cancel(data['hash'])","cancel(data['hash'],data.get('planId'))")
        return replace(s,"     p=load()['data'];mail(","     from invoice_plans import action\n     p=action(db,digest,data.get('hash'),data.get('planId'))['data'];mail(")
    result=function(result,'do_POST',post)
    result=replace(result,'   try:print(tick())','   from invoice_plans import notification_ids\n   watched=notification_ids(sys.modules[__name__])\n   try:print(tick())')
    result=replace(result,'   finally:notify_status()','   finally:notify_status(watched)')
    changed={'load','status','prepare_plan','import_json','approve','cancel','tick','tick_plan','notify_status','notify_plan','do_POST'}
    def protected(text):
        return {n.name:ast.dump(n,include_attributes=False) for n in ast.walk(ast.parse(text)) if isinstance(n,ast.FunctionDef) and n.name not in changed}
    if protected(source)!=protected(result):
        raise ValueError('Se ha modificado una función fuera del alcance mensual')
    return result


def explicit_status(source):
    """Append a plan ID to every status transition inside a single-plan function."""
    tree=ast.parse(source)
    lines=source.splitlines(keepends=True)
    offsets=[0]
    for line in lines:offsets.append(offsets[-1]+len(line.encode('utf-8')))
    data=source.encode('utf-8')
    calls=[n for n in ast.walk(tree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='status']
    for n in sorted(calls,key=lambda n:(n.end_lineno,n.end_col_offset),reverse=True):
        at=offsets[n.end_lineno-1]+n.end_col_offset-1
        data=data[:at]+b",plan_id=r['id']"+data[at:]
    return data.decode('utf-8')


def patch_revision(source):
    source=replace(source,'current = service.load()',"current = service.load(period=p['period'])")
    return replace(source,"return service.load()['data']","return service.load(period=p['period'])['data']")


def patch_monitor(source):
    source=function(source,'plan',lambda _:'''def plans():
    from invoice_monitor import plans as read_plans
    return read_plans(ROOT)

def sync_deliveries(client,cfg,state,rows,t):
    import sys
    from invoice_monitor import sync
    return sync(sys.modules[__name__],client,cfg,state,rows,t)''')
    def delivery(s):
        s=replace(s,"'name': 'Kairo · envío mensual', 'slug': 'kairo-envio'","'name': 'Kairo · envío '+row['data']['period'], 'slug': state['slug']")
        return s.replace("        save('monitor-state.json', state)","        # The caller persists the complete multi-month state.")
    source=function(source,'sync_delivery',delivery)
    source=replace(source,'sync_delivery(client, cfg, state, plan(), t)','sync_deliveries(client, cfg, state, plans(), t)')
    source=replace(source,'sync_delivery(client, cfg, state, plan(), now())','sync_deliveries(client, cfg, state, plans(), now())')
    return source


def patch_catalog(source):
    return replace(source,"active=row['id'] == (plans[0]['id'] if plans else None)","active=row['id'] == next(x['id'] for x in plans if x['data']['period']==p['period']) and row['status'] not in ('sent','email_cancelled')")


def patch_dashboard(source):
    source=replace(source,"item = next((x for x in items if x['active']), None)","item = min((x for x in items if x['active']), key=lambda x:x['row']['data']['send_date'], default=None)")
    source=replace(source,"manage='<a class=\"button secondary\" href=\"/facturas/revision\">Revisar aprobación y programación</a>'", "manage='<a class=\"button secondary\" href=\"/facturas/gestify-month?period='+item['row']['data']['period']+'\">Revisar aprobación y programación</a>'")
    return source.replace('Revisión y ajustes del mes activo','Revisión y ajustes de la última preparación')


def patch_review(source):
    source=replace(source,"{'csrf':csrf,'hash':fingerprint}","{'csrf':csrf,'hash':fingerprint,'planId':row['id']}")
    return replace(source,"post('review-mail',{{}})","post('review-mail',{{hash:boot.hash,planId:boot.planId}})")


if __name__=='__main__':
    import sys
    src,dst=map(Path,sys.argv[1:])
    dst.mkdir(exist_ok=False)
    for name,patch in [('service.py',patch_service),('draft_revision.py',patch_revision),('monitoring.py',patch_monitor),('invoice_catalog.py',patch_catalog),('invoice_dashboard.py',patch_dashboard),('review_view.py',patch_review)]:
        (dst/name).write_text(patch((src/name).read_text(encoding='utf-8')),encoding='utf-8')
    for name in ['invoice_plans.py','invoice_monitor.py','gestify_bridge.py','invoice_month_review.py','invoice_month_review.html']:
        (dst/name).write_bytes(Path(__file__).with_name(name).read_bytes())

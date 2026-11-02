"""Create presentation-only candidates from private sources; abort on drift."""
import ast
from pathlib import Path
from prepare_multi_invoice import function, replace


def patch_service(source):
    result=function(source,'page',lambda _:'''def page():
 from invoice_month_review import render
 row=load()
 return render(row['data']['period'],row,row['id'],config(),CSRF,digest(row['data']))''')
    start="   if path=='/revision':"
    begin=result.index(start)
    end=result.index('   from closing_web import get as closing_get',begin)
    old=result[begin:end]
    if 'content=page().replace(' not in old or old.count('return self.reply')!=1:
        raise ValueError('La revisión privada ha cambiado')
    result=replace(result,old,"""   if path=='/programacion':
    from kairo_invoice_web import schedule
    return self.reply(*schedule(ROOT,self.path))
   if path=='/ajustes':
    from kairo_invoice_web import settings
    return self.reply(200,settings(sys.modules[__name__],CSRF))
   if path=='/revision':return self.reply(200,page())
""")
    def protected(text):
        return [ast.dump(n) for n in ast.walk(ast.parse(text)) if isinstance(n,ast.FunctionDef) and n.name not in ('page','do_GET')]
    if protected(source)!=protected(result):raise ValueError('Cambios fuera de las vistas')
    return result


def patch_cancellation(source):
    """Install the same cutoff in the write path, inside the existing runner lock."""
    original="if r['status'] in ('sending','sent','emitting','queued','uncertain'):raise ValueError('Proceso iniciado o incierto; requiere revisión manual')"
    guard="""from invoice_cancellation import can_cancel
 if expected_state is not None and r['status']!=expected_state:raise ValueError('El estado ha cambiado. Vuelve a abrir la factura.')
 if not can_cancel(r['status'],r['data']['send_date'],now()):raise ValueError('Esta programación ya no se puede cancelar.')"""
    def guarded_cancel(text):
        text=replace(text,'def cancel(expected,plan_id=None):','def cancel(expected,plan_id=None,expected_state=None):')
        return replace(text,original,guard)
    result=function(source,'cancel',guarded_cancel)
    return replace(result,"cancel(data['hash'],data.get('planId'))","cancel(data['hash'],data.get('planId'),data.get('expectedState',''))")


def patch_dashboard(source):
    result=function(source,'shell',lambda _:'''def shell(content,tab):
    from kairo_invoice_web import dashboard
    return dashboard(content,tab)''')
    return function(result,'summary',lambda _: """def summary(items, root=None):
    current = [item for item in items if item['active']]
    if not current:
        return shell('<h1>Facturación</h1><p>Sin facturas preparadas.</p>', 'summary')
    pending = [item for item in current if item['mail'] != 'Enviado']
    item = min(pending,key=lambda x:x['row']['data']['send_date']) if pending else max(current,key=lambda x:x['row']['data']['period'])
    p=item['row']['data']
    month=e(p['period'])
    when=e(day(p['send_date']))+' · 08:00' if item['mail']=='Programado' else ''
    schedule='<p>'+when+'</p>' if when else ''
    archive=drive_card(root,item)
    archive='<details><summary>Archivo en Drive</summary>'+archive+'</details>' if archive else ''
    content='<div class="k-eye">Facturación</div><h1>'+e(period(p['period']))+'</h1>'
    content+='<section class="k-card"><div class="row"><span class="k-secondary">'+e(p['number'])+'</span><span class="k-badge">'+e(item['mail'])+'</span></div>'
    content+='<strong class="k-amount">'+money(item['display'].get('total'))+'</strong>'+schedule
    content+='<div class="k-action-list"><a class="k-button k-primary" href="/facturas/gestify-month?period='+month+'">Ver factura</a>'
    content+='<a class="k-button" href="/horas/calendario?period='+month+'">Ver programación</a></div></section>'
    return shell(content+archive,'summary')""")



if __name__=='__main__':
    import sys
    src,dst=map(Path,sys.argv[1:])
    dst.mkdir(exist_ok=False)
    for name,change in [('service.py',lambda source:patch_cancellation(patch_service(source))),('invoice_dashboard.py',patch_dashboard)]:
        (dst/name).write_text(change((src/name).read_text(encoding='utf-8')),encoding='utf-8')

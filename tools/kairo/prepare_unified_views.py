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


def patch_dashboard(source):
    return function(source,'shell',lambda _:'''def shell(content,tab):
    from kairo_invoice_web import dashboard
    return dashboard(content,tab)''')


if __name__=='__main__':
    import sys
    src,dst=map(Path,sys.argv[1:])
    dst.mkdir(exist_ok=False)
    for name,change in [('service.py',patch_service),('invoice_dashboard.py',patch_dashboard)]:
        (dst/name).write_text(change((src/name).read_text(encoding='utf-8')),encoding='utf-8')

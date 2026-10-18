"""Exact, reviewed integration into the private service; no runner changes."""
import ast


def patch(source):
    old="   if path=='/':return self.reply(200,page())"
    new="""   if path=='/revision':
    content=page().replace('<header class="intro">','<p><a href="/facturas/">← Resumen e histórico</a></p><header class="intro">')
    return self.reply(200,content)
   from invoice_dashboard import response as dashboard_response
   dashboard=dashboard_response(ROOT,self.path)
   if dashboard is not None:return self.reply(*dashboard)"""
    if source.count(old)!=1:raise ValueError('Service changed; review before installing')
    result=source.replace(old,new)
    ast.parse(result)
    return result

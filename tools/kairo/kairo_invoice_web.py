"""Owner-only read views for billing. Existing POST routes own every mutation."""
import html
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from home_invoice_status import read_month
from kairo_ui import shell


def schedule(root,url):
    query=parse_qs(urlsplit(url).query,keep_blank_values=True)
    values=query.get('period',[])
    if set(query)!={'period'} or len(values)!=1 or not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])',values[0]):
        return 400,json.dumps({'error':'Mes no válido'}),'application/json'
    try:
        fact=read_month(root,values[0])
    except Exception:
        return 503,json.dumps({'error':'Facturación sin confirmar'}),'application/json'
    return 200,json.dumps({key:fact[key] for key in ('period','state','scheduledDate')}),'application/json'


def dashboard(content,tab):
    # Keep the catalog's layout rules. Its old light/dark palette was in :root.
    catalog_css=Path(__file__).with_name('invoice_dashboard.css').read_text(encoding='utf-8')
    layout=catalog_css.partition('}')[2]
    links=[('summary','/facturas/','Resumen'),('history','/facturas/historico','Histórico'),
           ('models','/facturas/modelos','Modelos'),('calendar','/horas/calendario','Programación')]
    nav=''.join('<a href="'+href+'"'+(' aria-current="page"' if key==tab else '')+'>'+name+'</a>' for key,href,name in links)
    template='''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Facturación · Kairo</title><style>'''+layout+'''</style><!--KAIRO_HEAD--><style>
    body.k-ui{--panel:var(--k-surface);--brand:var(--k-accent);--soft:#294235;--amber:#f0cb83;--amber-bg:#41381f}
    .k-ui nav{display:flex;gap:5px;margin:0 0 18px}.k-ui nav a{font-size:12px;padding:9px 4px;min-height:36px}.k-ui nav a[aria-current]{background:var(--soft);color:var(--k-accent)}
    .k-ui .card{margin:12px 0;padding:16px}.k-ui .button{min-height:42px}.k-ui .utilities{display:flex;gap:14px;padding:5px 0}
    </style></head><body class="k-ui"><!--KAIRO_HEADER--><main class="k-main"><nav aria-label="Facturación">'''+nav+'</nav>'+content+'''
    <footer class="utilities"><a href="/facturas/ajustes">Ajustes</a><a href="/facturas/monitor">Avisos</a></footer></main></body></html>'''
    return shell(template)


def settings(service,csrf):
    try:row=service.load()
    except ValueError:row=None
    identity={'planId':row['id'],'hash':service.digest(row['data'])} if row else {}
    boot=json.dumps({'csrf':csrf,'identity':identity}).replace('<',r'\u003c')
    number=html.escape(row['data']['number']) if row else ''
    review='<button id="reviewMail">Enviarme el borrador '+number+'</button>' if row and service.config().get('mail_enabled') else ''
    return shell('''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ajustes · Kairo</title><!--KAIRO_HEAD--></head>
    <body class="k-ui"><!--KAIRO_HEADER--><main class="k-main"><span class="k-eye">Facturación</span><h1>Ajustes</h1>
    <section class="k-card"><h2>Correo</h2><div class="k-action-list"><a class="k-button" href="/facturas/mail-setup">Configurar correo</a>'''+review+'''</div></section>
    <section class="k-card"><h2>Importar borrador</h2><input id="file" type="file" accept=".json,application/json"><div class="k-action-list"><button id="upload" disabled>Preparar borrador</button></div></section>
    <p id="message" role="status"></p><a class="k-link" href="/facturas/">Facturación</a></main><script>
    const boot='''+boot+''';const el=id=>document.getElementById(id);
    async function post(button,action,data){
      button.disabled=true;
      try{const r=await fetch('/facturas/'+action,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':boot.csrf},body:JSON.stringify(data)});
        const result=await r.json();el('message').textContent=result.message;if(r.ok&&action==='upload')location.href='/facturas/revision';
      }catch{el('message').textContent='Operación sin confirmar.';}finally{button.disabled=false;}
    }
    if(el('reviewMail'))el('reviewMail').onclick=e=>post(e.currentTarget,'review-mail',boot.identity);
    el('file').onchange=()=>el('upload').disabled=!el('file').files.length;
    el('upload').onclick=async()=>{const f=el('file').files[0];if(!f)return;if(f.size>1000000){el('message').textContent='El archivo supera 1 MB.';return;}await post(el('upload'),'upload',{source:await f.text()});};
    </script></body></html>''')

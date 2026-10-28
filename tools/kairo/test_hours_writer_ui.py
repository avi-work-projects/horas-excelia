"""Offline regression of the UI observed in Outlook on 28 October 2026.

Only a new context with networking disabled is used. It never opens a mailbox.
"""
import argparse
from datetime import datetime
from playwright.sync_api import sync_playwright
from outlook_hours_writer import OutlookWriter
from demo_hours import synthetic_request
from hours_model import MADRID

HTML='''<!doctype html><html lang="es"><meta charset="utf-8"><title>Prueba ficticia sin Outlook</title>
<h1>Contrato de formulario ficticio; no usa correo real</h1>
<section data-app-section="MailReadCompose" aria-hidden="true">
<button aria-label="De: sender@example.invalid">De: sender@example.invalid</button>
<div contenteditable="true" tabindex="0" aria-label="Para" data-recipient="to"></div>
<div contenteditable="true" tabindex="0" aria-label="CC" data-recipient="cc"></div>
<div contenteditable="true" tabindex="0" aria-label="CCO" data-recipient="bcc"></div>
<input aria-label="Asunto" placeholder="Agregar un asunto" id="subject">
<div role="textbox" contenteditable="true" aria-label="Cuerpo del mensaje" id="body" style="white-space:pre-wrap"></div>
<button onclick="immediate++">Enviar</button>
<button aria-label="Más opciones de envío" onclick="document.getElementById('menu').hidden=false">Opciones</button>
</section>
<div id="menu" role="menu" hidden><button role="menuitem" onclick="document.getElementById('suggested').hidden=false;this.parentElement.hidden=true">Programar envío</button></div>
<div id="suggested" role="dialog" aria-hidden="true" hidden><h2>Programar envío</h2>
<button onclick="document.getElementById('custom').hidden=false;this.parentElement.hidden=true">Tiempo personalizado</button>
<button onclick="immediate++">Enviar</button></div>
<div id="custom" role="dialog" aria-hidden="true" aria-labelledby="customTitle" hidden>
<h2 id="customTitle">Establecer fecha y hora personalizadas</h2>
<label id="dateLabel" for="different-control">Seleccionar una fecha</label>
<input role="combobox" aria-labelledby="dateLabel" type="text" id="date" value="04/02/2027">
<label for="time">Seleccionar una hora</label><input role="combobox" type="text" id="time" value="8:00">
<div role="grid" aria-label="February 2027, Selected date February 4, 2027"></div>
<button onclick="result={date:document.getElementById('date').value,time:document.getElementById('time').value,body:document.getElementById('body').innerText,subject:document.getElementById('subject').value,to:chips('to'),cc:chips('cc')};this.parentElement.hidden=true;document.querySelector('[data-app-section]').hidden=true">Enviar</button>
<button>Cancelar</button></div>
<script>
let immediate=0,result=null;
function chips(kind){return [...document.querySelector('[data-recipient='+kind+']').querySelectorAll('._EType_RECIPIENT_ENTITY')].map(e=>e.textContent);}
function addChip(field,address){
 const chip=document.createElement('span');chip.className='_EType_RECIPIENT_ENTITY';chip.contentEditable='false';chip.textContent=address;
 field.querySelectorAll('br').forEach(e=>e.remove());
 for(const child of [...field.childNodes])if(child.nodeType===3)child.remove();
 field.append(chip,document.createTextNode(String.fromCharCode(8203)));
 const range=document.createRange();range.selectNodeContents(field);range.collapse(false);getSelection().removeAllRanges();getSelection().addRange(range);
}
for(const field of document.querySelectorAll('[data-recipient]'))field.onkeydown=e=>{
 if(e.key==='Enter'){e.preventDefault();const address=[...field.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').replace(/[\\s\\u200b]/g,'');addChip(field,address);}
};
document.getElementById('date').onblur=function(){
 const [day,month,year]=this.value.split('/').map(Number),date=new Date(Date.UTC(year,month-1,day));
 document.querySelector('[role=grid]').setAttribute('aria-label','Selected date '+new Intl.DateTimeFormat('en-US',{month:'long',timeZone:'UTC'}).format(date)+' '+day+', '+year);
};
document.getElementById('time').onblur=function(){this.value=this.value.replace(/^0/,'');};
</script></html>'''


def run(endpoint):
    disabled=OutlookWriter('sender@example.invalid',None)
    try:disabled({}, {})
    except PermissionError:pass
    else:raise AssertionError('El escritor debe empezar deshabilitado')
    writer=OutlookWriter('sender@example.invalid',None,enabled=True,clock=lambda:datetime(2027,2,1,tzinfo=MADRID))
    req=synthetic_request()
    req['config']=dict(to=['destino@example.invalid','segundo@example.invalid'],cc=['copia@example.invalid','otra@example.invalid'])
    row=dict(key=req['weeks'][0]['key'],action='create',schedule='2027-02-05T08:00:00+01:00')
    with sync_playwright() as p:
        browser=p.chromium.connect_over_cdp(endpoint)
        context=browser.new_context(timezone_id='Europe/Madrid');context.set_offline(True)
        try:
            page=context.new_page();page.set_default_timeout(3000)
            def reset():
                page.goto('about:blank');page.set_content(HTML)
            def blocked():
                try:writer.edit_and_schedule(page,req,row)
                except ValueError:pass
                else:raise AssertionError('Debe bloquear el formulario sin confirmar')
                assert page.evaluate('result') is None and page.evaluate('immediate')==0
            reset();writer.edit_and_schedule(page,req,row)
            result=page.evaluate('({result,immediate})')
            assert result['immediate']==0 and result['result']['time']=='8:00' and result['result']['date']=='05/02/2027'
            assert result['result']['to']==req['config']['to'] and result['result']['cc']==req['config']['cc']
            reset();page.evaluate("addChip(document.querySelector('[data-recipient=to]'),'original@example.invalid');document.getElementById('subject').value='Asunto original'")
            writer.edit_and_schedule(page,req,row|{'action':'update'})
            result=page.evaluate('({result,immediate})')
            assert result['result']['to']==['original@example.invalid'] and result['result']['subject']=='Asunto original' and result['immediate']==0
            reset();page.locator('button[aria-label^="De:"]').evaluate('(e)=>e.setAttribute("aria-label","De: otro@example.invalid")');blocked()
            reset();page.locator('#dateLabel').evaluate('(e)=>e.textContent="Fecha desconocida"');blocked()
            reset();page.locator('#date').evaluate('(e)=>e.onblur=null');blocked()
            reset();page.locator('button[aria-label="Más opciones de envío"]').evaluate("e=>e.addEventListener('click',()=>{document.getElementById('body').textContent=document.getElementById('body').textContent.replace('9 h','8 h');})");blocked()
            reset()
            try:writer.edit_and_schedule(page,req,row|{'schedule':'2020-02-05T08:00:00+01:00'})
            except ValueError:pass
            else:raise AssertionError('La hora vencida debe quedar pendiente')
            assert page.evaluate('result') is None and page.evaluate('immediate')==0
        finally:context.close();browser.close()
    print('Contrato real en HTML offline: dos Para/CC conservados, actualización, calendario confirmado, fecha vencida y cero Enviar inmediato')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--cdp',required=True);run(parser.parse_args().cdp)

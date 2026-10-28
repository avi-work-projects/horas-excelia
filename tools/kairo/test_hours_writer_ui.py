"""Offline composer contract. Only an empty, isolated browser context is used.

Run on Kairo with --cdp http://127.0.0.1:9223. No mailbox, profile or real
recipients are opened, and the context has all network access disabled.
"""
import argparse
from playwright.sync_api import sync_playwright
from outlook_hours_writer import OutlookWriter
from demo_hours import synthetic_request

HTML='''<!doctype html><html lang="es"><meta charset="utf-8"><title>Prueba ficticia · no usa Outlook</title>
<h1>Prueba local de programación · sin correos reales</h1>
<section data-app-section="MailReadCompose">
<span data-email-address="sender@example.invalid" data-recipient-kind="from">sender@example.invalid</span>
<input role="combobox" aria-label="Para" id="to"><input role="combobox" aria-label="CC" id="cc">
<input role="textbox" aria-label="Agregar un asunto" id="subject"><div role="textbox" contenteditable="true" aria-label="Cuerpo del mensaje" id="body"></div>
<button onclick="immediate++">Enviar ahora</button><button aria-label="Más opciones de envío" onclick="document.getElementById('menu').hidden=false">Opciones</button>
</section><div id="menu" role="menu" hidden><button role="menuitem" onclick="document.getElementById('schedule').hidden=false;this.parentElement.hidden=true">Programar envío</button></div>
<div role="dialog" aria-label="Programar envío" id="schedule" hidden><button>Hora personalizada</button><input type="date" id="date"><input type="time" id="time"><button onclick="result={date:document.getElementById('date').value,time:document.getElementById('time').value,body:document.getElementById('body').innerText,subject:document.getElementById('subject').value,to:recipients.to,cc:recipients.cc};this.parentElement.hidden=true">Confirmar programación</button></div>
<script>let immediate=0,result=null,recipients={to:[],cc:[]};for(const kind of ['to','cc'])document.getElementById(kind).onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();recipients[kind].push(e.target.value);e.target.value='';}};</script></html>'''


def run(endpoint):
    writer=OutlookWriter('sender@example.invalid',None)
    try:writer({}, {})
    except PermissionError:pass
    else:raise AssertionError('El escritor debe empezar deshabilitado')
    req=synthetic_request();row=dict(key=req['weeks'][0]['key'],action='create',schedule='2027-02-05T08:00:00+01:00')
    with sync_playwright() as p:
        browser=p.chromium.connect_over_cdp(endpoint)
        context=browser.new_context();context.set_offline(True)
        try:
            page=context.new_page()
            def reset():
                page.goto('about:blank');page.set_content(HTML)
            reset()
            writer.edit_and_schedule(page,req,row)
            result=page.evaluate('({result,immediate})')
            assert result['immediate']==0 and result['result']['time']=='08:00' and result['result']['date']=='2027-02-05'
            assert result['result']['to']==['destino@example.invalid']
            assert result['result']['cc']==['copia@example.invalid']
            reset()
            page.evaluate("recipients.to=['original@example.invalid'];document.getElementById('subject').value='Asunto original'")
            writer.edit_and_schedule(page,req,row|{'action':'update'})
            result=page.evaluate('({result,immediate})')
            assert result['result']['to']==['original@example.invalid'] and result['result']['subject']=='Asunto original' and result['immediate']==0
            reset();page.locator('[data-email-address]').evaluate('(e)=>e.removeAttribute("data-email-address")')
            try:writer.edit_and_schedule(page,req,row)
            except ValueError:pass
            else:raise AssertionError('Debe bloquear un remitente no reconocido')
            assert page.evaluate('result') is None and page.evaluate('immediate')==0
            reset();page.locator('input[type=date]').evaluate('(e)=>e.type="text"')
            try:writer.edit_and_schedule(page,req,row)
            except ValueError:pass
            else:raise AssertionError('Debe bloquear un selector de fecha desconocido')
            assert page.evaluate('result') is None and page.evaluate('immediate')==0
        finally:context.close();browser.close()
    print('Escritor: contrato ficticio offline, actualización conservada, sin Enviar inmediato y guardas verificadas')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--cdp',required=True);run(parser.parse_args().cdp)

"""Month-specific rendering; actions identify the current revision of this month."""
from kairo_ui import shell
from invoice_cancellation import can_cancel
import html
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

LABELS = {'review': 'Pendiente de aprobación', 'approved': 'Factura programada',
          'sent': 'Factura enviada', 'accepted': 'Emitida · correo pendiente',
          'cancelled': 'Programación cancelada', 'email_cancelled': 'Correo cancelado',
          'blocked': 'Requiere revisión', 'uncertain': 'Resultado por comprobar',
          'missed': 'No ejecutada en plazo', 'queued': 'Registro en preparación',
          'emitting': 'Emisión en curso', 'sending': 'Envío en curso'}


def response(service, url, csrf):
    values = parse_qs(urlsplit(url).query).get('period', [])
    if len(values) != 1 or not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', values[0]):
        return 400, 'Selecciona un mes válido desde Gestify.'
    period = values[0]
    with service.db() as db:
        rows = db.execute('SELECT * FROM plans ORDER BY id DESC').fetchall()
    selected = None
    for row in rows:
        data = json.loads(row['data'])
        if data.get('period') == period:
            selected = dict(row, data=data)
            break
    cfg = service.config() if selected else {}
    fingerprint = service.digest(selected['data']) if selected else ''
    return 200, render(period, selected, selected['id'] if selected else None, cfg, csrf, fingerprint)


def render(period, row, current, cfg, csrf, fingerprint, moment=None):
    e = lambda value: html.escape(str(value))
    months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
              'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    title = months[int(period[5:])-1]+' '+period[:4]
    initial=1
    content='<section class="k-card"><h2>No está preparada en Kairo</h2><p>Abre este mes en Gestify y pulsa «Enviar a Kairo».</p></section>'
    if row:
        p,state=row['data'],row['status']
        active=row['id']==current
        fields=p.get('display',{})
        issued=state in {'accepted','sent','email_cancelled','sending'}
        approve=active and cfg.get('commissioned') and cfg.get('mail_enabled') and state in {'review','cancelled'}
        cancel=active and can_cancel(state,p['send_date'],moment)
        initial=5 if issued else 2 if state in {'review','cancelled'} else 4
        status=e(LABELS.get(state,'Requiere revisión'))
        when=e('/'.join(p['send_date'].split('-')[::-1]))
        def money(value):
            return f"{float(value):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')+' €'
        def facts(pairs):
            return '<dl class="k-facts">'+''.join('<div><dt>'+label+'</dt><dd>'+e(value)+'</dd></div>' for label,value in pairs if value is not None and value!='')+'</dl>'
        def panel(step,title,body):
            return '<section class="k-card" data-panel="'+str(step)+'" aria-label="'+title+'"'+('' if step==initial else ' hidden')+'><h2>'+title+'</h2>'+body+'</section>'
        def next_step(step,label):
            return '<div class="k-action-list"><button type="button" class="k-primary" data-go="'+str(step)+'">'+label+' →</button></div>'
        kind='final' if issued else 'draft'
        pdf='<a class="k-button" target="_blank" rel="noopener" href="/facturas/documento/'+str(int(row['id']))+'/'+kind+'">'+('Ver factura PDF' if issued else 'Revisar borrador PDF')+'</a>'
        def icon(kind):
            return '<svg class="k-dispatch-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#dispatch-'+kind+'"/></svg>'
        badge='<span class="k-badge">'+(icon('invoice') if state=='approved' else '')+status+'</span>'
        schedule='<a class="k-button" href="/horas/calendario?period='+e(period)+'">'+icon('agenda')+'Ver programación</a>'
        total=money(fields['total']) if fields.get('total') is not None else '—'
        breakdown=[(name,money(fields[key])) for key,name in [('base','Base imponible'),('vat','IVA'),('withholding','Retención')] if fields.get(key) is not None]
        content=panel(1,'Borrador','<span class="k-badge">Mes preparado</span>'+facts([('Mes',title),('Proyecto',fields.get('project'))])+next_step(2,'Ver factura'))
        invoice='<span class="k-secondary">'+e(p['number'])+'</span><strong class="k-amount">'+total+'</strong>'
        invoice+=facts([('Jornadas',fields.get('days')),('Tarifa',fields.get('rate_label')),('Proyecto',fields.get('project')),('Vencimiento',fields.get('due_date'))])
        if breakdown:invoice+='<details><summary>Desglose fiscal <span class="disclosure" aria-hidden="true"></span></summary>'+facts(breakdown)+'</details>'
        content+=panel(2,'Factura',invoice+'<div class="k-action-list">'+pdf+'</div>'+next_step(3,'Ver correo'))
        recipients=p.get('to','')
        if isinstance(recipients,list):recipients=', '.join(recipients)
        mail=facts([('Para',recipients),('Asunto',p.get('subject',''))])
        mail+='<section class="k-mail" aria-label="Contenido del correo"><small class="k-secondary">Mensaje</small><pre>'+e(p.get('body',''))+'</pre></section>'
        content+=panel(3,'Correo',mail+next_step(4,'Ver aprobación'))
        approval=badge+'<h3>'+when+'</h3>'+facts([('Emisión','07:30'),('Envío','08:00 · Madrid')])
        if state in {'blocked','uncertain','missed'} and row.get('detail'):
            approval+='<p role="status">'+e(row['detail'])+'</p>'
        if active and state in {'review','cancelled'} and not approve:
            approval+='<p>La aprobación está deshabilitada en Kairo.</p>'
        if not active:approval+='<p>Esta revisión ha sido sustituida.</p>'
        approval+='<div class="k-action-list">'
        if approve:approval+='<button class="k-primary" data-action="approve">Aprobar emisión y envío</button>'
        approval+='<div class="k-schedule-actions">'+schedule
        if cancel:
            caption='Cancelar envío del correo' if issued else 'Cancelar programación'
            approval+='<button type="button" class="k-cancel" data-action="cancel" aria-label="'+caption+'">Cancelar</button>'
        content+=panel(4,'Aprobar',approval+'</div></div>')
        archive=badge+('<div class="k-action-list">'+pdf+'</div>' if issued else '<p>PDF definitivo pendiente de emisión.</p>')
        content+=panel(5,'Programación',archive+'<div class="k-action-list">'+schedule+'</div>')
    boot=json.dumps({'csrf':csrf,'hash':fingerprint,'period':title,'planId':row['id'] if row else None,
                     'initial':initial,'hasPlan':bool(row),'state':row['status'] if row else None},ensure_ascii=True).replace('<',r'\u003c')
    template=Path(__file__).with_name('invoice_month_review.html').read_text(encoding='utf-8')
    return shell(template,current=initial,interactive=bool(row)).replace('<!--TITLE-->',e(title)).replace('<!--CONTENT-->',content).replace('/*BOOT*/',boot)

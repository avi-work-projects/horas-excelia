"""Month-specific, read-only rendering. Existing service owns all mutations.

An older plan is never made actionable merely by selecting its month. The POST
handler still validates the current plan hash, CSRF, owner and execution state.
"""
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
    current = rows[0]['id'] if rows else None
    selected = None
    for row in rows:
        data = json.loads(row['data'])
        if data.get('period') == period:
            selected = dict(row, data=data)
            break
    cfg = service.config() if selected else {}
    fingerprint = service.digest(selected['data']) if selected else ''
    return 200, render(period, selected, current, cfg, csrf, fingerprint)


def render(period, row, current, cfg, csrf, fingerprint):
    e = lambda value: html.escape(str(value))
    months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
              'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    title = months[int(period[5:])-1]+' '+period[:4]
    content = '<h2>No está preparada en Kairo</h2><p>Vuelve a Gestify y pulsa «Enviar a Kairo» para este mes.</p>'
    if row:
        p, state = row['data'], row['status']
        active = row['id'] == current
        f = p.get('display', {})
        date = '/'.join(p['send_date'].split('-')[::-1])
        issued = state in {'accepted', 'sent', 'email_cancelled', 'sending'}
        kind = 'final' if issued else 'draft'
        pdf = '/facturas/documento/'+str(int(row['id']))+'/'+kind
        ready = active and cfg.get('commissioned') and cfg.get('mail_enabled') and state in {'review', 'cancelled'}
        cancel = active and state not in {'sending', 'sent', 'emitting', 'queued', 'uncertain', 'cancelled', 'email_cancelled'}
        total = f"{float(f.get('total', 0)):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')+' €'
        content = '<h2>'+e(LABELS.get(state, 'Requiere revisión'))+'</h2><div class="facts"><span>Factura <b>'+e(p['number'])+'</b></span><strong>'+e(total)+'</strong></div>'
        content += '<p class="date">'+('Envío registrado' if state == 'sent' else 'Envío previsto')+' · '+e(date)+' · 08:00 Madrid</p>'
        content += '<p class="notice">'+('Factura emitida. Cancelar solo afecta al correo pendiente.' if issued else 'Aprobar autoriza emitir la factura a las 07:30 y enviar su correo a las 08:00 del día indicado.')+'</p>'
        content += '<div class="actions"><a class="button" href="'+pdf+'" target="_blank" rel="noopener">'+('Ver factura PDF' if issued else 'Revisar borrador PDF')+'</a>'
        if ready:
            content += '<button class="primary" data-action="approve">Aprobar emisión y envío</button>'
        if cancel:
            content += '<button data-action="cancel">Cancelar programación</button>'
        content += '</div><details><summary>Correo y desglose</summary><p>Para: '+e(p.get('to', ''))+'</p><p>'+e(p.get('subject', ''))+'</p><pre>'+e(p.get('body', ''))+'</pre>'
        for key, label in [('days', 'Días'), ('base', 'Base'), ('vat', 'IVA'), ('withholding', 'Retención')]:
            content += '<p>'+label+': '+e(f.get(key, ''))+'</p>'
        content += '</details>'
        if not active:
            content += '<p class="notice">Consulta guardada. Hay otro mes activo; esta vista no cambia su programación.</p>'
    boot = json.dumps({'csrf': csrf, 'hash': fingerprint, 'period': title}, ensure_ascii=True).replace('<', '\\u003c')
    template = Path(__file__).with_name('invoice_month_review.html').read_text(encoding='utf-8')
    return template.replace('<!--TITLE-->', e(title)).replace('<!--CONTENT-->', content).replace('/*BOOT*/', boot)

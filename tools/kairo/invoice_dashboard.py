"""Responsive server-rendered overview, history and immutable document routes."""
import html
import json
import hashlib
import re
from datetime import date
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from invoice_catalog import catalog, archived_pdf, pdf_available

MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
e = lambda value: html.escape(str(value), quote=True)


def money(value):
    if value is None: return '—'
    return format(float(value), ',.2f').replace(',', 'X').replace('.', ',').replace('X', '.') + ' €'


def period(value):
    try: return MONTHS[int(value[5:7])-1].capitalize() + ' ' + value[:4]
    except (ValueError, IndexError): return str(value)


def day(value):
    try:
        d = date.fromisoformat(value)
        return f'{d.day} {MONTHS[d.month-1]} {d.year}'
    except (ValueError, TypeError): return value or 'No registrada'


def label(item):
    if item['accepted']: return 'Emitida'
    return {'approved':'Aprobada', 'review':'Por aprobar', 'blocked':'Requiere revisión',
            'cancelled':'Cancelada', 'uncertain':'Requiere revisión', 'queued':'En proceso',
            'emitting':'En proceso'}.get(item['row']['status'], 'Pendiente de verificar')


def shell(content, tab):
    css = Path(__file__).with_name('invoice_dashboard.css').read_text(encoding='utf-8')
    return f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#12665e"><title>Facturas · Kairo</title><style>{css}</style></head><body><div class="app"><header class="top"><div class="bar"><a class="brand" href="/">k<span>Kairo</span></a><a href="/facturas/monitor">Avisos</a></div><p class="muted">Tu espacio de facturación</p><nav aria-label="Facturación"><a href="/facturas/" {'aria-current="page"' if tab=='summary' else ''}>Resumen</a><a href="/facturas/historico" {'aria-current="page"' if tab=='history' else ''}>Histórico</a></nav></header><main>{content}</main><footer>Acceso privado con Tailscale · Hora de Madrid<br><a href="/facturas/revision">Revisión y ajustes del mes activo</a></footer></div></body></html>'''


def invoice_link(item):
    return '/facturas/factura/' + str(item['docid'])


def drive_card(root, item):
    if root is None:return ''
    root=Path(root)
    if not (root/'drive-publish-config.json').exists():return ''
    title='Pendiente de archivar en Drive'
    note='La copia se realiza por separado de la emisión y del correo.'
    try:
        cfg=json.loads((root/'drive-publish-config.json').read_text())
        state_path=root/'drive-publish-state.json'
        state=json.loads(state_path.read_text()) if state_path.exists() else {}
        if not cfg.get('enabled'):
            title='Conexión con Drive en preparación'
        elif not item['accepted']:
            title='Se archivará al emitir la factura'
        else:
            from drive_publish import archive_target
            pdf,name=archived_pdf(root,item['row'],'final')
            target=archive_target(item['row']['data'],name)
            record=state.get('files',{}).get(target,{})
            if record.get('sha256')==hashlib.sha256(pdf).hexdigest():
                title='Archivada y verificada en Drive'
                note=target+' · La descarga al mini depende de su conexión con Drive.'
            elif state.get('ok') is False:
                title='Archivo en Drive pendiente: último intento fallido'
                note='El servicio reintenta automáticamente. La factura y el correo no se repiten.'
    except (ValueError,OSError,KeyError,TypeError):
        title='Estado del archivo en Drive no verificable'
        note='Requiere revisión; esta consulta no modifica ni vuelve a emitir la factura.'
    return '<article class="card"><h2>Archivo en Drive</h2><p><strong>'+e(title)+'</strong></p><p class="muted">'+e(note)+'</p></article>'


def summary(items, root=None):
    item = next((x for x in items if x['active']), None)
    if not item:
        return shell('<h1>Tu facturación</h1><p>No hay facturas preparadas todavía.</p><p>Envía la preparación desde Gestify para comenzar.</p>', 'summary')
    p=item['row']['data']; f=item['display']
    scheduled=item['mail']=='Programado'
    title='Próximo envío' if scheduled else 'Mes activo'
    action='Ver factura y envío' if item['accepted'] else 'Ver y revisar borrador'
    return shell(f'''<h1>{e(period(p['period']))}</h1><p class="muted">{'La factura está emitida; consulta aquí su envío.' if item['accepted'] else 'Revisa esta versión antes de aprobar su emisión.'}</p><article class="card"><div class="row"><span class="eyebrow">{title}</span><span class="badge wait">{e(item['mail'])}</span></div>{f'<p class="date">{e(day(p["send_date"]))} · 08:00</p><p class="muted">Hora de Madrid</p>' if scheduled else ''}<hr><div class="row"><h2>{e(item['client'])}</h2><span class="muted">{e(p['number'])}</span></div><p class="amount">{money(f.get('total'))}</p><p class="muted">Total a cobrar · {e(f.get('days','—'))} jornadas</p><a class="button" href="{invoice_link(item)}">{action} →</a></article><ul class="steps"><li><span>{'✓' if item['accepted'] else '○'}</span><div><strong>{e(label(item))}</strong><p class="muted">{'Registro VeriFactu aceptado' if item['accepted'] else 'La aprobación solo corresponde a esta versión'}</p></div></li><li><span>◷</span><div><strong>Correo: {e(item['mail'].lower())}</strong><p class="muted">{'Enviado no significa leído ni cobrado.' if item['mail']=='Enviado' else 'Consulta el detalle antes de modificar la programación.'}</p></div></li></ul>{drive_card(root,item)}<a class="button secondary" href="/facturas/historico">Ver histórico · {len(items)} {'factura' if len(items)==1 else 'facturas'}</a>''', 'summary')


def history(items, query):
    year=query.get('year',['all'])[0]; state=query.get('state',['all'])[0]
    years=sorted({x['row']['data']['period'][:4] for x in items},reverse=True)
    selected=[x for x in items if (year=='all' or x['row']['data']['period'][:4]==year) and (state=='all' or (state=='issued' and x['accepted']) or (state=='draft' and not x['accepted']))]
    filters='<form class="filters" method="get"><label>Año<select name="year"><option value="all">Todos</option>'+''.join(f'<option {"selected" if y==year else ""}>{e(y)}</option>' for y in years)+'</select></label><label>Estado<select name="state">'+''.join(f'<option value="{v}" {"selected" if v==state else ""}>{t}</option>' for v,t in [('all','Todos'),('issued','Emitidas'),('draft','Sin emitir')])+'</select></label><button type="submit">Filtrar</button></form>'
    entries=''.join(f'''<li><a class="invoice" href="{invoice_link(x)}"><span class="row"><strong>{e(period(x['row']['data']['period']))}</strong><strong>{money(x['display'].get('total'))}</strong></span><span class="row"><span class="muted">{e(x['row']['data']['number'])} · {e(x['client'])}</span><span class="badge">{e(label(x))}</span></span><span class="muted">Correo: {e(x['mail'].lower())} →</span></a></li>''' for x in selected)
    return shell('<h1>Tus facturas</h1><p class="muted">Una ficha por factura, con sus preparaciones anteriores.</p>'+filters+'<ul class="list">'+entries+'</ul>'+('' if entries else '<p>No hay facturas con estos filtros.</p>')+'<p class="note">Este histórico muestra las facturas preparadas en Kairo. Los documentos antiguos de Declarando aún no están incorporados.</p>','history')


def detail(root, item):
    p=item['row']['data']; f=item['display']; row=item['row']; kind='final' if item['accepted'] else 'draft'
    pdf=f'/facturas/documento/{row["id"]}/{kind}'
    document=f'<a class="button" href="{pdf}" target="_blank" rel="noopener">Abrir {"PDF definitivo" if kind=="final" else "borrador PDF"} ↗</a>' if pdf_available(root,row,kind) else '<p class="note">Documento archivado no disponible o pendiente de verificación. No se mostrará un borrador como definitivo.</p>'
    amounts=''.join(f'<div><dt>{t}</dt><dd>{money(v)}</dd></div>' for t,v in [('Base imponible',f.get('base')),('IVA',f.get('vat')),('Retención IRPF',-float(f['withholding']) if f.get('withholding') is not None else None)])
    versions=''.join(f'<li>Preparación {i+1} · {"versión actual" if v["id"]==row["id"] else "anterior"} '+(f'<a href="/facturas/documento/{v["id"]}/draft" target="_blank" rel="noopener">Ver borrador PDF</a>' if pdf_available(root,v,'draft') else '<span class="muted">Sin PDF verificable</span>')+'</li>' for i,v in enumerate(reversed(item['versions'])))
    manage='<a class="button secondary" href="/facturas/revision">Revisar aprobación y programación</a>' if item['active'] else '<p class="muted">Factura histórica · consulta sin modificar.</p>'
    content=f'''<a class="back" href="/facturas/historico">← Histórico</a><div class="row"><h1>{e(period(p['period']))}</h1><span class="badge">{e(label(item))}</span></div><p class="muted">{e(p['number'])} · {e(item['client'])}</p><p class="amount">{money(f.get('total'))}</p><p class="muted">Total a cobrar · no confirma el cobro bancario</p><article class="card"><h2>Importes</h2><dl><div><dt>Jornadas</dt><dd>{e(f.get('days','—'))}</dd></div>{amounts}<div><dt>Total con IVA</dt><dd>{money(float(f['base'])+float(f['vat'])) if f.get('base') is not None and f.get('vat') is not None else '—'}</dd></div></dl></article><article class="card"><h2>Emisión y envío</h2><dl><div><dt>Expedición</dt><dd>{e(day(p.get('issue_date'))) if item['accepted'] else 'Sin emitir'}</dd></div><div><dt>Vencimiento</dt><dd>{e(f.get('due_date','No registrado'))}</dd></div><div><dt>VeriFactu</dt><dd>{'Registro aceptado' if item['accepted'] else 'Sin aceptación confirmada'}</dd></div><div><dt>Correo</dt><dd>{e(item['mail'])}</dd></div></dl><p class="muted">Fecha prevista: {e(day(p.get('send_date')))} · 08:00 Madrid</p><details><summary>Destinatarios y mensaje</summary><p>{'<br>'.join(e(v) for v in p.get('to',[]))}</p><strong>{e(p.get('subject',''))}</strong><pre>{e(p.get('body',''))}</pre></details></article>{document}{manage}<details><summary>Preparaciones y actividad · {len(item['versions'])}</summary><ul class="versions">{versions}</ul><p class="muted">{item['review_mails']} correos de revisión enviados. Se contabilizan por separado del envío definitivo.</p></details>'''
    return shell(content+drive_card(root,item),'history')


def response(root, url):
    parsed=urlsplit(url); path=parsed.path.removeprefix('/facturas') or '/'
    if path not in ('/','/historico') and not re.fullmatch(r'/factura/\d+|/documento/\d+/(draft|final)',path):
        return None
    items=catalog(root)
    if path=='/':return 200,summary(items,root)
    if path=='/historico':return 200,history(items,parse_qs(parsed.query))
    if path.startswith('/factura/'):
        item=next((x for x in items if x['docid']==int(path.split('/')[-1])),None)
        return (200,detail(root,item)) if item else (404,'Factura no encontrada')
    _,_,planid,kind=path.split('/')
    row=next((v for x in items for v in x['versions'] if v['id']==int(planid)),None)
    if row is None:return 404,'Documento no encontrado'
    if kind=='final' and not next(x for x in items if x['docid']==row['data']['docid'])['accepted']:
        return 409,'Emisión no confirmada'
    try:pdf,name=archived_pdf(root,row,kind)
    except (OSError,ValueError,KeyError):return 409,'Documento no disponible o no verificado. No se ha generado ni modificado ninguna factura.'
    return 200,pdf,'application/pdf',{'Content-Disposition':'inline; filename="'+name+'"'}

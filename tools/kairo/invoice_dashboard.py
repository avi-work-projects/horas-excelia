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


def shell(content,tab):
    content='<style>'+VIEW_CSS+'</style>'+content
    try:
        from kairo_invoice_web import dashboard
    except ModuleNotFoundError as exc:
        if exc.name != 'kairo_invoice_web':raise
        css=Path(__file__).with_name('invoice_dashboard.css').read_text(encoding='utf-8')
        return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Facturas · Kairo</title><style>'+css+'</style></head><body><main>'+content+'</main></body></html>'
    return dashboard(content,tab)


VIEW_CSS='''
.invoice-year-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:16px 0 28px}
.invoice-month{min-width:0;border:1px solid var(--k-line,#dfe6df);border-radius:16px;background:var(--k-surface,#fff);padding:15px}
.invoice-month h3{font-size:14px;margin:0 0 12px;text-transform:capitalize}.invoice-month-empty{color:var(--k-muted,#607267);font-size:12px;margin:0}
.invoice-month-items{display:grid;gap:9px}.invoice-month-entry{display:grid;gap:4px;padding:10px;border-radius:10px;background:color-mix(in srgb,var(--k-accent,#235c49) 7%,transparent);color:inherit;text-decoration:none;border:1px solid transparent}
.invoice-month-entry:hover,.invoice-month-entry:focus-visible{border-color:var(--k-accent,#235c49)}
.invoice-month-entry strong{font-size:13px}.invoice-month-entry small,.invoice-evidence{color:var(--k-muted,#607267);font-size:12px;line-height:1.5}.invoice-evidence{margin:9px 0 0}
.invoice-mail-state{font-size:12px}.invoice-mail-state[data-mail=Programado]{color:light-dark(#2563eb,#60a5fa)}
.invoice-detail-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;margin:16px 0}.invoice-detail-grid .card{margin:0;min-width:0}
.invoice-pdf{border:1px solid var(--k-line,#dfe6df);border-radius:14px;padding:16px;margin:18px 0;background:var(--k-surface,#fff)}
.invoice-pdf-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}.invoice-pdf-bar h2{margin:0}
.invoice-pdf iframe{display:block;width:100%;height:680px;border:1px solid var(--k-line,#dfe6df);border-radius:8px;background:white}.invoice-pdf .note{font-size:12px;margin-bottom:0}
.invoice-detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}.invoice-detail-actions a{margin:0}
@media(min-width:1200px){.invoice-year-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:650px){.invoice-year-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.invoice-month{padding:12px}.invoice-detail-grid{grid-template-columns:1fr}.invoice-pdf{padding:12px}.invoice-pdf iframe{height:460px}}
@media(max-width:360px){.invoice-year-grid{grid-template-columns:1fr}}
'''


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
    return shell(content+archive,'summary')


def history(items, query, sent=()):
    years=sorted({x['row']['data']['period'][:4] for x in items}|{p[:4] for p,_ in sent},reverse=True)
    year=query.get('year',[years[0] if years else str(date.today().year)])[0]; state=query.get('state',['all'])[0]
    if year!='all' and not re.fullmatch(r'20\d\d',year):year=years[0] if years else str(date.today().year)
    selected=[x for x in items if (year=='all' or x['row']['data']['period'][:4]==year) and (state=='all' or (state=='issued' and x['accepted']) or (state=='draft' and not x['accepted']))]
    filters='<form class="filters" method="get"><label>Año<select name="year"><option value="all">Todos</option>'+''.join(f'<option {"selected" if y==year else ""}>{e(y)}</option>' for y in years)+'</select></label><label>Estado<select name="state">'+''.join(f'<option value="{v}" {"selected" if v==state else ""}>{t}</option>' for v,t in [('all','Todos'),('issued','Emitidas'),('draft','Sin emitir')])+'</select></label><button type="submit">Filtrar</button></form>'
    grids=''
    for y in (years if year=='all' else [year]):
        months=''
        for month in range(1,13):
            key=f'{y}-{month:02d}'
            matching=[x for x in selected if x['row']['data']['period']==key]
            entries=''.join(f'<a class="invoice-month-entry" href="{invoice_link(x)}" aria-label="Ver factura {e(x["row"]["data"]["number"])}"><strong>{e(x["row"]["data"]["number"])}</strong><span>{money(x["display"].get("total"))}</span><small>{e(x["client"])}</small><span class="invoice-mail-state" data-mail="{e(x["mail"])}">{e(label(x))} · {e(x["mail"])}</span></a>' for x in matching)
            evidence=''
            if state=='all':
                dates=sorted({d for p,d in sent if p==key})
                if dates:
                    evidence='<p class="invoice-evidence">✓ Envío confirmado: '+', '.join(e(day(d)) for d in dates)+'</p>'
                    if not matching:
                        evidence+='<a class="invoice-legacy-link" data-local-archive-period="'+key+'" href="/horas/calendario?period='+key+'">Ver envío</a>'
            empty='<p class="invoice-month-empty">Sin registros</p>' if not entries and not evidence else ''
            months+='<article class="invoice-month" aria-label="'+e(period(key))+'"><h3>'+MONTHS[month-1]+'</h3><div class="invoice-month-items">'+entries+'</div>'+evidence+empty+'</article>'
        grids+='<section aria-label="Facturas de '+e(y)+'"><h2>'+e(y)+'</h2><div class="invoice-year-grid">'+months+'</div></section>'
    note='<p class="note">Cada mes agrupa sus facturas y los envíos confirmados. Una confirmación de envío antiguo no implica que su PDF esté archivado en este servicio.</p>'
    return shell('<h1>Tus facturas</h1><p class="muted">Selecciona una factura para ver sus importes, envío y PDF.</p>'+filters+grids+note,'history')


def detail(root, item):
    p=item['row']['data']; f=item['display']; row=item['row']; kind='final' if item['accepted'] else 'draft'
    pdf=f'/facturas/documento/{row["id"]}/{kind}'
    document_title='PDF definitivo' if kind=='final' else 'borrador PDF'
    document=(f'<section class="invoice-pdf" aria-label="Vista previa de la factura"><div class="invoice-pdf-bar"><h2>{"Factura emitida" if kind=="final" else "Borrador · sin emitir"}</h2><a class="k-button button" href="{pdf}" target="_blank" rel="noopener">Abrir {document_title} ↗</a></div><iframe title="Vista previa del {document_title}" src="{pdf}#toolbar=0&amp;navpanes=0" loading="lazy"></iframe><p class="note">Si tu navegador no muestra la vista previa, abre el PDF en el visor.</p></section>'
              if pdf_available(root,row,kind) else '<p class="note">Documento archivado no disponible o pendiente de verificación. No se mostrará un borrador como definitivo.</p>')
    amounts=''.join(f'<div><dt>{t}</dt><dd>{money(v)}</dd></div>' for t,v in [('Base imponible',f.get('base')),('IVA',f.get('vat')),('Retención IRPF',-float(f['withholding']) if f.get('withholding') is not None else None)])
    versions=''.join(f'<li>Preparación {i+1} · {"versión actual" if v["id"]==row["id"] else "anterior"} '+(f'<a href="/facturas/documento/{v["id"]}/draft" target="_blank" rel="noopener">Ver borrador PDF</a>' if pdf_available(root,v,'draft') else '<span class="muted">Sin PDF verificable</span>')+'</li>' for i,v in enumerate(reversed(item['versions'])))
    manage='<a class="button secondary" href="/facturas/gestify-month?period='+p['period']+'">Revisar aprobación y programación</a>' if item['active'] else '<p class="muted">Factura histórica · consulta sin modificar.</p>'
    heading=f'<a class="back" href="/facturas/historico">← Histórico</a><div class="row"><h1>{e(period(p["period"]))}</h1><span class="badge">{e(label(item))}</span></div><p class="muted">{e(p["number"])} · {e(item["client"])}</p><p class="amount">{money(f.get("total"))}</p><p class="muted">Total a cobrar · no confirma el cobro bancario</p>'
    amounts_card=f'<article class="card"><h2>Importes</h2><dl><div><dt>Jornadas</dt><dd>{e(f.get("days","—"))}</dd></div>{amounts}<div><dt>Total con IVA</dt><dd>{money(float(f["base"])+float(f["vat"])) if f.get("base") is not None and f.get("vat") is not None else "—"}</dd></div></dl></article>'
    recipients='<br>'.join(e(v) for v in p.get('to',[]))
    delivery_card=f'<article class="card"><h2>Emisión y envío</h2><dl><div><dt>Expedición</dt><dd>{e(day(p.get("issue_date"))) if item["accepted"] else "Sin emitir"}</dd></div><div><dt>Vencimiento</dt><dd>{e(f.get("due_date","No registrado"))}</dd></div><div><dt>VeriFactu</dt><dd>{"Registro aceptado" if item["accepted"] else "Sin aceptación confirmada"}</dd></div><div><dt>Correo</dt><dd>{e(item["mail"])}</dd></div></dl><p class="muted">Fecha prevista: {e(day(p.get("send_date")))} · 08:00 Madrid</p><details><summary>Destinatarios y mensaje</summary><p>{recipients}</p><strong>{e(p.get("subject",""))}</strong><pre>{e(p.get("body",""))}</pre></details></article>'
    schedule='<a class="k-button button secondary" href="/horas/calendario?period='+e(p['period'])+'">Ver programación</a>'
    activity=f'<details><summary>Preparaciones y actividad · {len(item["versions"])}</summary><ul class="versions">{versions}</ul><p class="muted">{item["review_mails"]} correos de revisión enviados. Se contabilizan por separado del envío definitivo.</p></details>'
    content=heading+document+'<div class="invoice-detail-grid">'+amounts_card+delivery_card+'</div>'
    content+='<div class="invoice-detail-actions">'+schedule+manage+'</div>'+activity
    return shell(content+drive_card(root,item),'history')


def response(root, url):
    parsed=urlsplit(url); path=parsed.path.removeprefix('/facturas') or '/'
    if path not in ('/','/historico') and not re.fullmatch(r'/factura/\d+|/documento/\d+/(draft|final)',path):
        return None
    items=catalog(root)
    if path=='/':return 200,summary(items,root)
    if path=='/historico':
        try:
            from invoice_calendar import sent_days
        except ModuleNotFoundError as exc:
            if exc.name != 'invoice_calendar':raise
            sent=()
        else:sent=sent_days(root,items)
        return 200,history(items,parse_qs(parsed.query),sent)
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

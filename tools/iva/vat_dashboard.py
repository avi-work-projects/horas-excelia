"""Authenticated read-only VAT overview and verified original-document access."""
import hashlib
import json
import re
from datetime import date
from decimal import Decimal
from pathlib import Path
from urllib.parse import parse_qs, urlsplit, quote
from modelos_ui import e, euro, page, fact, button, navigation

BASE = '/facturas/modelos'


def verified(root, entry):
    root = Path(root).resolve()
    path = (root / entry['path']).resolve()
    if not path.is_relative_to(root):
        raise ValueError('Invalid archive path')
    raw = path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != entry['sha256']:
        raise ValueError('Archive version mismatch')
    return raw


def read_archive(root, index_relative='modelos-index.json'):
    index = json.loads((Path(root) / index_relative).read_text(encoding='utf-8-sig'))
    report = json.loads(verified(root, index['report']))
    ledger = json.loads(verified(root, index['ledger']))
    if report['year'] != ledger['year']:
        raise ValueError('Year mismatch')
    from document_details import attach_details
    # The verified fiscal copy can live in an immutable CONSULTA snapshot.
    # Display metadata remains next to the canonical year book and is joined
    # only by the original PDF hash; it cannot change any fiscal field.
    ledger = attach_details(ledger, Path(root) / 'LIBROS CONTABLES' / str(ledger['year']) / 'libro.json')
    return index, report, ledger


def update_status(runtime):
    if runtime is None:
        return {'state':'idle','message':'Consulta de la última copia disponible.'}
    from model_events import status
    try:
        return status(runtime)
    except Exception:
        return {'state':'error','message':'No se puede consultar el estado de actualización. Vuelve a intentarlo.'}


def update_controls(csrf, status):
    if not csrf:
        return ''
    state = status.get('state','idle')
    pending = state in ('queued','running')
    boot = json.dumps({'csrf':csrf,'status':status},ensure_ascii=False).replace('<','\\u003c')
    controls = '<section class="m-card" aria-label="Actualización de los datos"><div class="m-actions" style="margin-top:0"><button type="button" id="modelos-update" class="m-button m-primary"'+(' disabled' if pending else '')+'>Actualizar datos</button><button type="button" id="modelos-status" class="m-button">Ver estado</button><button type="button" id="modelos-reload" class="m-button" hidden>Ver datos actualizados</button></div><p id="modelos-update-message" role="status" aria-live="polite">'+e(status.get('message','Actualización manual de los datos.'))+'</p><p class="m-note">El mini debe estar encendido y conectado. Si no está disponible, la petición quedará pendiente. Abrir esta pantalla no actualiza los datos.</p></section>'
    script = r'''<script>(()=>{const context=BOOT;
const update=document.getElementById('modelos-update'),check=document.getElementById('modelos-status'),reload=document.getElementById('modelos-reload'),output=document.getElementById('modelos-update-message');
function show(status,canReload){update.disabled=['queued','running'].includes(status.state);check.disabled=false;reload.hidden=!(canReload&&status.state==='verified');output.textContent=status.message||'Estado no disponible.';}
async function request(manual){update.disabled=true;check.disabled=true;reload.hidden=true;output.textContent=manual?'Solicitando actualización…':'Consultando estado…';try{const options=manual?{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':context.csrf},body:'{}'}:{cache:'no-store'};const result=await fetch('/facturas/modelos/'+(manual?'actualizar':'actualizacion'),options);const data=await result.json();if(!result.ok)throw Error('No se ha podido completar la petición. Vuelve a intentarlo.');show(data,true);}catch(error){show({state:'error',message:error.message},false);}}
update.addEventListener('click',()=>request(true));check.addEventListener('click',()=>request(false));reload.addEventListener('click',()=>location.reload());
})();</script>'''.replace('BOOT',boot)
    return '<style>.modelos #modelos-reload[hidden]{display:none}</style>'+controls+script


def response(root, url, csrf='', runtime=None, index_relative='modelos-index.json', compact=False):
    parsed = urlsplit(url)
    path = parsed.path.removeprefix('/facturas')
    if path not in ('/modelos', '/modelos/', '/modelos/descargar', '/modelos/documento'):
        return None
    query = parse_qs(parsed.query)
    try:
        if path.endswith('/descargar'):
            index = json.loads((Path(root)/index_relative).read_text(encoding='utf-8-sig'))
            key = query.get('id', [''])[0]
            if key not in index['downloads']:
                return 404, 'Archivo no disponible'
            item = index['downloads'][key]
            if key == 'annual-workbook' and item.get('ledger_sha256') != index.get('ledger', {}).get('sha256'):
                raise ValueError('Workbook is not from the current ledger')
            # Never permit a configured filename to inject response headers.
            name = re.sub(r'[^A-Za-z0-9_.-]', '_', Path(item['filename']).name)
            return 200, verified(root, item), item['mime'], {'Content-Disposition':f'attachment; filename="{name}"'}
        index, report, ledger = read_archive(root, index_relative)
        if path.endswith('/documento'):
            key = query.get('id', [''])[0]
            if not re.fullmatch(r'[a-f0-9]{64}', key):
                return 404, 'Documento no disponible'
            rows = [row for row in ledger['records'] if row['sha256'] == key]
            if not rows:
                return 404, 'Documento no disponible'
            row = rows[0]
            document_root = (Path(root).resolve() / index.get('document_root','.')).resolve()
            if not document_root.is_relative_to(Path(root).resolve()):
                raise ValueError('Document root escapes archive')
            raw = verified(document_root, {'path':row['source'], 'sha256':key})
            if not raw.startswith(b'%PDF-'):
                return 415, 'El original no es un PDF compatible'
            return 200, raw, 'application/pdf', {'Content-Disposition':'inline; filename="documento.pdf"'}
        default = f'{(date.today().month-1)//3+1}T' if report['year'] == date.today().year else '4T'
        view = query.get('vista', ['modelos' if 'periodo' in query or 'paso' in query else 'resumen'])[0]
        if view != 'modelos':
            from accounting_views import VIEWS, render as accounting_render
            if view not in VIEWS:
                return 400, 'Vista no válida'
            pending_count = None
            if runtime is not None and view == 'resumen':
                try:
                    from expense_workflow import ExpenseStore
                    pending_count = sum(row['state'] != 'incorporated' for row in ExpenseStore(Path(runtime)/'expenses').list())
                except (OSError, ValueError, KeyError):
                    pass
            return 200, accounting_render(index, report, ledger, view,
                query.get('periodo', ['todos'])[0], query.get('buscar', [''])[0][:160],
                update_controls(csrf, update_status(runtime)), pending_count)
        quarter = query.get('periodo', [default])[0]
        section = query.get('paso', ['revision'])[0]
        if quarter not in report['quarters'] or section not in ('documentos','revision','archivos','anual'):
            return 400, 'Periodo o vista no válido'
        kind = query.get('tipo', ['todos'])[0]
        if kind not in ('todos','income','expense'):
            return 400, 'Filtro no válido'
        return 200, render(index, report, ledger, quarter, section, kind, csrf, update_status(runtime), compact=compact)
    except (OSError, ValueError, KeyError, TypeError):
        return 503, page('<h1>Modelos temporalmente no disponibles</h1><p>La copia de consulta falta o ha cambiado. Solicita actualizar y verificar el archivo.</p>'+update_controls(csrf,update_status(runtime))+button('/facturas/','Volver a Facturas'))


def documents(ledger, quarter, kind):
    rows = [r for r in ledger['records'] if r['period']==quarter and (kind=='todos' or r['kind']==kind)]
    filters = ''.join(button(f'{BASE}?periodo={quarter}&paso=documentos&tipo={value}', label)
                      for value,label in [('todos','Todos'),('income','Ingresos'),('expense','Gastos')])
    content = f'<div class="m-actions">{filters}</div>'
    month = None
    months = ('Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre')
    for r in sorted(rows, key=lambda r:(r['date'],r['party'],r['number']), reverse=True):
        d = date.fromisoformat(r['date'])
        if month != d.month:
            if month is not None: content += '</div>'
            month = d.month
            content += '<div class="m-card"><h2>'+months[month-1]+'</h2>'
        inclusion = 'Incorporado al cálculo' if r['include'] else 'Excluido / pendiente'
        details = ''.join(fact(label, euro(r.get(key))) for label,key in [('Base','base'),('IVA documental','vat'),('Retención','withholding'),('Total','total')])
        details += fact('Estado', inclusion)
        if r.get('receipt_date'): details += fact('Recepción',r['receipt_date'])
        content += f'''<details class="m-document {'' if r['include'] else 'm-excluded'}"><summary><span><strong>{e(r['party'])}</strong><span class="m-meta">{d.strftime('%d/%m')} · {'Ingreso' if r['kind']=='income' else 'Gasto'} · {e(r['number'])}</span></span><span class="m-doc-total">{e(euro(r['total']))}<span class="m-meta">Ver detalle</span></span></summary><dl class="m-facts">{details}</dl><p class="m-note">{e(r.get('note',''))}</p><div class="m-actions">{button(BASE+'/documento?id='+r['sha256'],'Abrir PDF original')}</div></details>'''
    if month is not None: content += '</div>'
    else: content += '<p>Sin documentos incorporados para este filtro.</p>'
    return content


def annual_content(report, compact=False):
    annual = report.get('preparation_390')
    if not annual:
        return '<div class="m-card"><h2>Preparación anual pendiente</h2><p>Actualiza el informe anual para incorporar esta vista.</p></div>'
    totals = annual['documentary_totals']
    metrics = ''.join('<div class="m-card"><span class="m-eyebrow">'+label+'</span><strong class="m-metric">'+e(euro(value))+'</strong></div>' for label,value in [
        ('Base de ingresos',totals.get('07')),('IVA de ingresos',totals.get('09')),
        ('Base de gastos nacionales',totals.get('28')),('IVA deducible',totals.get('45',totals.get('29')))])
    if totals.get('36') and Decimal(totals['36']):
        metrics += '<div class="m-card"><span class="m-eyebrow">Base de servicios UE</span><strong class="m-metric">'+e(euro(totals['36']))+'</strong></div>'
    rows = ''
    for q, data in report['quarters'].items():
        ref = data.get('reference',{}).get('71')
        diff = data.get('difference',{}).get('71')
        rows += '<tr><th scope="row">'+e(q)+'</th><td>'+e(euro(data['boxes'].get('71')))+'</td><td>'+e(euro(ref) if ref is not None else 'Sin referencia')+'</td><td>'+e(euro(diff,True) if diff is not None else '—')+'</td></tr>'
    pending = ''.join('<li>'+e(x)+'</li>' for x in annual.get('pending',[]))
    summary = f'''<div class="m-card m-hero"><span class="m-eyebrow">Resumen anual · 390</span><div class="m-status">Preparación del ejercicio</div><p>{e(annual['status'])}</p><div class="m-actions">{button(BASE+'/preparacion?periodo=anual','Preparar 390',True)}</div></div>'''
    detail = f'''<div class="m-card"><h2>Pendientes del año</h2><ul class="m-list">{pending}</ul><p class="m-note">{e(annual['scope'])}</p></div>'''
    if compact:
        summary = '<div class="m-card m-period-summary"><div><h2>Resumen anual</h2><p class="m-note">Pendiente de cierre</p></div><div class="m-actions">'+button(BASE+'/aeat?periodo=anual','Preparar y presentar 390',True)+'</div></div>'
        detail = f'''<details class="m-card m-period-detail"><summary>Qué falta para cerrar el año</summary><p>{e(annual['status'])}</p><ul class="m-list">{pending}</ul><p class="m-note">{e(annual['scope'])}</p></details>'''
    return summary+f'''<div class="m-columns">{metrics}</div><div class="m-card"><h2>Comparación de los 303</h2><div class="m-table-wrap"><table><thead><tr><th>Periodo</th><th>Calculado</th><th>Referencia presentada</th><th>Diferencia</th></tr></thead><tbody>{rows}</tbody></table></div><p class="m-note">Las diferencias se conservan por trimestre, aunque su suma sea cero. La coincidencia de importes no acredita revisión fiscal ni pago.</p></div>'''+detail


def render(index, report, ledger, quarter, section, kind='todos', csrf='', update=None, compact=False):
    year = report['year']
    annual = section == 'anual'
    tabs = ''.join(f'<a href="{BASE}?periodo={q}"'+(' aria-current="page"' if q==quarter and not annual else '')+'>'+q+'</a>' for q in ('1T','2T','3T','4T'))
    tabs += f'<a href="{BASE}?periodo={quarter}&paso=anual"'+(' aria-current="page"' if annual else '')+'>Año</a>'
    head = navigation('modelos')+f'<h1>IVA {year}</h1><nav class="m-periods" aria-label="Periodo fiscal">{tabs}</nav>'+update_controls(csrf,update or {'state':'idle','message':'Actualización manual de los datos.'})
    if annual:
        content = annual_content(report, compact=compact)
    elif section == 'documentos':
        content = button(BASE+'?periodo='+quarter,'Volver al '+quarter)+f'<h2 style="margin-top:18px">Documentos · {quarter} de {year}</h2>'+documents(ledger,quarter,kind)
    else:
        selected = report['quarters'][quarter]
        boxes = selected['boxes']
        ref = selected.get('reference',{}).get('71')
        diff = selected.get('difference',{}).get('71')
        rows = [r for r in ledger['records'] if r['period']==quarter]
        missing = [r for r in report.get('missing_receipt_metadata',[]) if r['period']==quarter]
        status = 'Referencia presentada disponible' if ref is not None else ('En curso' if rows else 'Sin documentos incorporados')
        label = 'Importe de la referencia presentada' if ref is not None else 'Resultado provisional del libro'
        value = ref if ref is not None else boxes.get('71')
        action = 'Consulta el justificante y las diferencias documentales.' if ref is not None else 'Incorpora los documentos y revisa el periodo antes de cerrarlo.'
        primary = button(BASE+'/gastos','Añadir o revisar gastos',True)
        if ref is None: primary += button(BASE+'/preparacion?periodo='+quarter,'Preparar trimestre')
        content = f'''<div class="m-card m-hero"><span class="m-eyebrow">{quarter} · {year}</span><div class="m-status">{status}</div><span class="m-eyebrow">{label}</span><div class="m-amount">{e(euro(value))}</div><p>{action}</p><p class="m-note">Datos incorporados hasta {e(report['as_of'])} · Revisión fiscal pendiente.</p><div class="m-actions">{primary}</div></div>'''
        if compact:
            status = 'Referencia presentada' if ref is not None else 'En preparación'
            amount = '' if value is None else '<span class="m-eyebrow">'+('Importe presentado' if ref is not None else 'Resultado provisional')+'</span><div class="m-amount">'+e(euro(value))+'</div>'
            primary = (button(BASE+'?periodo='+quarter+'&paso=documentos','Ver documentos',True) if ref is not None else
                       button(BASE+'/aeat?periodo='+quarter,'Preparar y presentar',True))
            content = '<div class="m-card m-period-summary"><div><h2>'+status+'</h2>'+amount+'</div><div class="m-actions">'+primary+'</div></div>'
            content += '<details class="m-card m-period-detail"><summary>'+('Ver detalle del periodo' if ref is not None else 'Qué falta para cerrar')+'</summary><p>'+e(action)+'</p><p>'+e(selected['coverage'])+'</p><p class="m-note">Datos incorporados hasta '+e(report['as_of'])+' · Revisión fiscal pendiente.</p>'
            if missing:
                content += '<p class="m-warning">'+str(len(missing))+' gastos necesitan completar los datos de recepción para la importación de libros.</p>'
            content += '<div class="m-actions">'+button(BASE+'/gastos','Añadir o revisar gastos')+'</div></details>'
        facts = fact('IVA devengado · 27', euro(boxes.get('27', boxes['09'])))+fact('IVA deducible · 45',euro(boxes.get('45', boxes['29'])))+fact('Resultado calculado · 71',euro(boxes.get('71')))
        if ref is not None:
            facts += fact('Referencia presentada',euro(ref))+fact('Diferencia documental',euro(diff,True))
        content += '<div class="m-card"><h2>Cálculo y comparación</h2><dl class="m-facts">'+facts+'</dl><p class="m-note">Resultado para el perfil soportado. Los ajustes pendientes mantienen el resultado sin cerrar. El pago se comprueba por separado.</p></div>'
        counts = fact('Ingresos',str(sum(r['kind']=='income' for r in rows)))+fact('Gastos',str(sum(r['kind']=='expense' for r in rows)))
        content += f'<div class="m-card"><h2>Documentos del trimestre</h2><dl class="m-facts">{counts}</dl>'
        if not compact:
            content += '<p>'+e(selected['coverage'])+'</p>'
            if missing: content += f'<p class="m-warning">{len(missing)} gastos necesitan completar los datos de recepción para la importación de libros.</p>'
        content += '<div class="m-actions">'+button(BASE+'?periodo='+quarter+'&paso=documentos','Ver documentos')+'</div></div>'
        items = [(key,item) for key,item in index.get('downloads',{}).items() if item.get('period')==quarter]
        content += '<div class="m-card" id="archivos"><h2>Archivos y preparación</h2>'
        for key,item in items:
            content += '<p class="m-note">'+e(item.get('note',''))+'</p><div class="m-actions">'+button(BASE+'/descargar?id='+quote(key,safe=''),item['label'])+'</div>'
        if not items: content += '<p>No hay archivos de ensayo archivados para este periodo.</p>'
        if ref is not None:
            content += '<div class="m-actions">'+button(BASE+'/cierre?periodo='+quarter,'Ensayo histórico '+quarter)+'</div><p class="m-note">Los ensayos permiten comprobar el archivo. No vuelvas a presentar un periodo declarado.</p>'
        if index.get('payment_summary'):
            content += '<details><summary>Cuenta configurada</summary><p>'+e(index['payment_summary'])+'</p><p class="m-note">Preparada para generar el archivo; no acredita domiciliación solicitada ni cargo.</p></details>'
        content += '</div>'
    sync = '<br>Sincronización verificada: '+e(index['sync']['at'])+'.' if index.get('sync',{}).get('at') else ''
    footer = '<footer class="m-footer">Copia de consulta actualizada: '+e(index['updated'])+' · Datos hasta '+e(report['as_of'])+'.'+sync+'<br>Preparación y consulta. La presentación y el pago tienen comprobación propia.</footer>'
    return page(head+content+footer)

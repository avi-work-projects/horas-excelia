"""Authenticated read-only VAT overview and verified original-document access."""
import hashlib
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import parse_qs, urlsplit, quote
from modelos_ui import e, euro, page, fact, button

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


def read_archive(root):
    index = json.loads((Path(root) / 'modelos-index.json').read_text(encoding='utf-8-sig'))
    report = json.loads(verified(root, index['report']))
    ledger = json.loads(verified(root, index['ledger']))
    if report['year'] != ledger['year']:
        raise ValueError('Year mismatch')
    return index, report, ledger


def response(root, url):
    parsed = urlsplit(url)
    path = parsed.path.removeprefix('/facturas')
    if path not in ('/modelos', '/modelos/', '/modelos/descargar', '/modelos/documento'):
        return None
    query = parse_qs(parsed.query)
    try:
        if path.endswith('/descargar'):
            index = json.loads((Path(root)/'modelos-index.json').read_text(encoding='utf-8-sig'))
            key = query.get('id', [''])[0]
            if key not in index['downloads']:
                return 404, 'Archivo no disponible'
            item = index['downloads'][key]
            # Never permit a configured filename to inject response headers.
            name = re.sub(r'[^A-Za-z0-9_.-]', '_', Path(item['filename']).name)
            return 200, verified(root, item), item['mime'], {'Content-Disposition':f'attachment; filename="{name}"'}
        index, report, ledger = read_archive(root)
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
        quarter = query.get('periodo', [default])[0]
        section = query.get('paso', ['revision'])[0]
        if quarter not in report['quarters'] or section not in ('documentos','revision','archivos','anual'):
            return 400, 'Periodo o vista no válido'
        kind = query.get('tipo', ['todos'])[0]
        if kind not in ('todos','income','expense'):
            return 400, 'Filtro no válido'
        return 200, render(index, report, ledger, quarter, section, kind)
    except (OSError, ValueError, KeyError, TypeError):
        return 503, page('<h1>Modelos temporalmente no disponibles</h1><p>La copia de consulta falta o ha cambiado. Se requiere actualizar y verificar el archivo.</p>'+button('/facturas/','Volver a Facturas'))


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


def annual_content(report):
    annual = report.get('preparation_390')
    if not annual:
        return '<div class="m-card"><h2>Preparación anual pendiente</h2><p>Actualiza el informe anual para incorporar esta vista.</p></div>'
    metrics = ''.join('<div class="m-card"><span class="m-eyebrow">'+label+'</span><strong class="m-metric">'+e(euro(annual['documentary_totals'].get(key)))+'</strong></div>' for key,label in [('07','Base de ingresos'),('09','IVA de ingresos'),('28','Base de gastos'),('29','IVA de gastos')])
    rows = ''
    for q, data in report['quarters'].items():
        ref = data.get('reference',{}).get('71')
        diff = data.get('difference',{}).get('71')
        rows += '<tr><th scope="row">'+e(q)+'</th><td>'+e(euro(data['boxes'].get('71')))+'</td><td>'+e(euro(ref) if ref is not None else 'Sin referencia')+'</td><td>'+e(euro(diff,True) if diff is not None else '—')+'</td></tr>'
    pending = ''.join('<li>'+e(x)+'</li>' for x in annual.get('pending',[]))
    return f'''<div class="m-card m-hero"><span class="m-eyebrow">Resumen anual · 390</span><div class="m-status">Preparación del ejercicio</div><p>{e(annual['status'])}</p><div class="m-actions">{button(BASE+'/preparacion?periodo=anual','Preparar 390',True)}</div></div><div class="m-columns">{metrics}</div><div class="m-card"><h2>Comparación de los 303</h2><div class="m-table-wrap"><table><thead><tr><th>Periodo</th><th>Calculado</th><th>Referencia presentada</th><th>Diferencia</th></tr></thead><tbody>{rows}</tbody></table></div><p class="m-note">Las diferencias se conservan por trimestre, aunque su suma sea cero. La coincidencia de importes no acredita revisión fiscal ni pago.</p></div><div class="m-card"><h2>Pendientes del año</h2><ul class="m-list">{pending}</ul><p class="m-note">{e(annual['scope'])}</p></div>'''


def render(index, report, ledger, quarter, section, kind='todos'):
    year = report['year']
    annual = section == 'anual'
    tabs = ''.join(f'<a href="{BASE}?periodo={q}"'+(' aria-current="page"' if q==quarter and not annual else '')+'>'+q+'</a>' for q in ('1T','2T','3T','4T'))
    tabs += f'<a href="{BASE}?periodo={quarter}&paso=anual"'+(' aria-current="page"' if annual else '')+'>Año</a>'
    head = f'<h1>IVA {year}</h1><nav class="m-periods" aria-label="Periodo fiscal">{tabs}</nav>'
    if annual:
        content = annual_content(report)
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
        facts = fact('IVA de ingresos · 09', euro(boxes['09']))+fact('IVA de gastos incorporados · 29',euro(boxes['29']))+fact('Resultado calculado · 71',euro(boxes.get('71')))
        if ref is not None:
            facts += fact('Referencia presentada',euro(ref))+fact('Diferencia documental',euro(diff,True))
        content += '<div class="m-card"><h2>Cálculo y comparación</h2><dl class="m-facts">'+facts+'</dl><p class="m-note">Resultado para el perfil soportado. Los ajustes pendientes mantienen el resultado sin cerrar. El pago se comprueba por separado.</p></div>'
        counts = fact('Ingresos',str(sum(r['kind']=='income' for r in rows)))+fact('Gastos',str(sum(r['kind']=='expense' for r in rows)))
        content += f'<div class="m-card"><h2>Documentos del trimestre</h2><dl class="m-facts">{counts}</dl><p>{e(selected["coverage"])}</p>'
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

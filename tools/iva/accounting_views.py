"""Read-only accounting views over one verified ledger snapshot.

The expense queue owns drafts; this module never edits it or the ledger.
Renta is an explicit documentary collection, not an IRPF calculation.
"""
from decimal import Decimal
from urllib.parse import quote

from modelos_ui import e, euro, page, button, navigation
from ledger import eu_service_vat

BASE = '/facturas/modelos'
VIEWS = ('resumen', 'ingresos', 'gastos', 'libros', 'renta')
CATEGORIES = {'general': 'General', 'equipment': 'Equipos', 'telecom': 'Telefonía e internet',
              'electricity': 'Electricidad', 'gas': 'Gas', 'other': 'Otros'}
SCOPES = {'iva_irpf': 'IVA · Renta pendiente', 'irpf_only': 'Solo Renta · pendiente',
          'excluded': 'Excluido', 'review': 'Por revisar'}


def scope(row):
    return SCOPES.get(row.get('tax_scope'), 'IVA según libro · IRPF pendiente' if row['include'] else 'Excluido / por revisar')


def total(rows, field):
    return sum((Decimal(row[field]) for row in rows), Decimal('0.00'))


def filters(view, period, search=''):
    options = ''.join('<option value="'+value+'"'+(' selected' if value == period else '')+'>'+label+'</option>'
                      for value, label in [('todos', 'Todo el año'), ('1T', '1T'), ('2T', '2T'), ('3T', '3T'), ('4T', '4T')])
    return ('<form class="m-form a-filters" method="get" action="'+BASE+'">'
            '<input type="hidden" name="vista" value="'+e(view)+'">'
            '<label>Periodo<select name="periodo">'+options+'</select></label>'
            '<label>Buscar proveedor, cliente o factura<input name="buscar" value="'+e(search)+'" maxlength="160" type="search"></label>'
            '<button class="m-button" type="submit">Aplicar filtro</button></form>')


def record_table(rows, income=False):
    if not rows:
        return '<div class="m-card"><p>No hay documentos registrados con este filtro.</p></div>'
    headers = ['Fecha / factura', 'Cliente' if income else 'Proveedor', 'Base', 'IVA documental']
    headers += ['Retención', 'Total a cobrar'] if income else ['Total documental', 'Destino / categoría']
    headers += ['Original']
    body = ''
    for row in sorted(rows, key=lambda r: (r['date'], r['number']), reverse=True):
        cells = '<td><strong>'+e(row['date'])+'</strong><small>'+e(row['number'])+' · '+e(row['period'])+'</small></td>'
        cells += '<td>'+e(row['party'])+'<small>'+e(row.get('tax_id', ''))+'</small></td>'
        cells += '<td>'+e(euro(row['base']))+'</td><td>'+e(euro(row['vat']))+'</td>'
        if income:
            cells += '<td>'+e(euro(row['withholding']))+'</td><td>'+e(euro(row['total']))+'</td>'
        else:
            cells += '<td>'+e(euro(row['total']))+'</td><td><span class="m-tag">'+e(scope(row))+'</span>'
            cells += '<small>'+e(CATEGORIES.get(row.get('category'), 'Sin categoría histórica'))+'</small>'
            if row['include'] and row.get('mapping') == 'eu_services21':
                levy = euro(eu_service_vat(row))
                cells += '<small>Servicio UE · autoliquidado '+e(levy)+' · deducible '+e(levy)+'</small>'
            if row.get('note'):
                cells += '<details><summary>Detalle</summary><p>'+e(row['note'])+'</p></details>'
            cells += '</td>'
        cells += '<td>'+button(BASE+'/documento?id='+quote(row['sha256'], safe=''), 'PDF')+'</td>'
        body += '<tr>'+cells+'</tr>'
    return '<div class="m-card m-table-wrap a-table"><table><thead><tr>'+''.join('<th scope="col">'+h+'</th>' for h in headers)+'</tr></thead><tbody>'+body+'</tbody></table></div>'


def overview(report, rows, pending_count):
    incomes = [r for r in rows if r['kind'] == 'income' and r['include']]
    expenses = [r for r in rows if r['kind'] == 'expense' and r['include']]
    renta = [r for r in rows if r['kind'] == 'expense' and r.get('tax_scope') == 'irpf_only']
    metrics = [('Ingresos · base registrada', euro(total(incomes, 'base'))),
               ('Gastos incluidos en IVA · base', euro(total(expenses, 'base'))),
               ('IVA deducible calculado', euro(total(expenses, 'vat') + sum((eu_service_vat(r)
                    for r in expenses if r.get('mapping') == 'eu_services21'), Decimal('0.00')))),
               ('Documentos solo para Renta', str(len(renta)))]
    content = '<div class="m-columns a-metrics">'+''.join('<div class="m-card"><span class="m-eyebrow">'+label+'</span><strong class="m-metric">'+e(value)+'</strong></div>' for label, value in metrics)+'</div>'
    content += '<p class="m-note">Importes del libro registrado. La base de gastos del IVA no equivale al gasto deducible en Renta; los cobros y pagos no se dan por conciliados.</p>'
    queue_text = 'Consulta la bandeja de facturas por revisar.' if pending_count is None else str(pending_count)+' documentos en la bandeja pendientes de revisión o incorporación.'
    content += '<div class="m-card m-hero"><h2>Tu siguiente paso</h2><p>'+e(queue_text)+'</p><div class="m-actions">'+button(BASE+'/gastos', 'Añadir o revisar gastos', True)+button(BASE+'?vista=libros', 'Abrir libros')+'</div></div>'
    content += '<div class="m-card"><h2>Trimestres</h2><div class="a-quarters">'
    for quarter, data in report['quarters'].items():
        presented = data.get('reference', {}).get('71') is not None
        content += '<article><span class="m-tag">'+e(quarter)+'</span><h3>'+('Referencia presentada' if presented else 'En preparación')+'</h3><p>'+e(data['coverage'])+'</p>'+button(BASE+'?periodo='+quarter, 'Ver '+quarter)+'</article>'
    content += '</div></div>'
    content += '<div class="m-card"><h2>Preparación de Renta</h2><p>Electricidad y gas se conservan separados del IVA trimestral. Su posible deducción, junto con telefonía, activos y amortizaciones, se revisará para Renta.</p>'+button(BASE+'?vista=renta', 'Ver documentación de Renta')+'</div>'
    return content


def books(index, report):
    current = index.get('downloads', {}).get('annual-workbook')
    matches = current and current.get('ledger_sha256') == index['ledger']['sha256']
    if matches:
        content = '<div class="m-card m-hero"><h2>Libro anual de consulta</h2><p>Ingresos, gastos, resumen y documentos para Renta desde la misma versión del libro.</p>'+button(BASE+'/descargar?id=annual-workbook', 'Descargar Excel actualizado', True)+'</div>'
    else:
        content = '<div class="m-card m-hero"><h2>Libro anual de consulta</h2><p>El Excel de esta versión todavía no está disponible. Pulsa «Actualizar datos» para generarlo y publicar la copia verificada.</p></div>'
    content += '<p class="m-note">El Excel es una salida de consulta. Para corregir un dato se conserva el documento y se registra el cambio en su fuente. No es un fichero de presentación LSI ni un cálculo completo de Renta.</p>'
    historical = [(k, v) for k, v in index.get('downloads', {}).items() if k != 'annual-workbook']
    if historical:
        content += '<details class="m-card"><summary>Archivos y ensayos anteriores ('+str(len(historical))+')</summary><p class="m-note">Estos archivos conservan su fecha y alcance originales; pueden corresponder a una versión anterior del libro.</p>'
        for key, item in historical:
            content += '<div class="a-download"><strong>'+e(item.get('label', item['filename']))+'</strong><p class="m-note">'+e(item.get('note', 'Archivo histórico'))+'</p>'+button(BASE+'/descargar?id='+quote(key, safe=''), 'Descargar')+'</div>'
        content += '</details>'
    content += '<div class="m-actions">'+button(BASE+'?vista=ingresos', 'Consultar ingresos')+button(BASE+'?vista=gastos', 'Consultar gastos')+button(BASE+'?vista=renta', 'Documentos para Renta')+'</div>'
    return content


STYLE = '''<style>
.modelos .a-filters{grid-template-columns:minmax(130px,1fr) minmax(200px,3fr) auto;align-items:end;margin:18px 0}
.modelos .a-table table{table-layout:auto;min-width:790px}.modelos .a-table th:first-child,.modelos .a-table td:first-child{width:auto;min-width:130px}.modelos .a-table th:nth-child(2),.modelos .a-table td:nth-child(2){text-align:left;min-width:170px;max-width:280px}.modelos .a-table small{display:block;color:var(--k-muted);font-size:12px;font-weight:400}.modelos .a-table td{vertical-align:top}.modelos .a-table td details{text-align:left;max-width:260px}.modelos .a-table .m-tag{white-space:normal}
.modelos .a-quarters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.modelos .a-quarters article{padding:8px;border-left:2px solid var(--k-line)}.modelos .a-quarters h3{margin-top:9px}.modelos .a-quarters p{font-size:13px;color:var(--k-muted)}.modelos .a-download{padding:14px 0;border-top:1px solid var(--k-line)}
@media(min-width:900px){.modelos .a-metrics{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:600px){.modelos .a-filters{grid-template-columns:1fr}.modelos .a-quarters{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>'''


def render(index, report, ledger, view, period='todos', search='', controls='', pending_count=None):
    if view not in VIEWS or period not in ('todos', '1T', '2T', '3T', '4T'):
        raise ValueError('Vista o periodo no válido')
    titles = {'resumen': 'Tu contabilidad', 'ingresos': 'Ingresos', 'gastos': 'Gastos registrados',
              'libros': 'Libros y archivos', 'renta': 'Documentación para Renta'}
    rows = [r for r in ledger['records'] if period == 'todos' or r['period'] == period]
    if search:
        rows = [r for r in rows if search.casefold() in ' '.join(str(r.get(k, '')) for k in ('party', 'number', 'tax_id')).casefold()]
    head = navigation('gastos' if view == 'renta' else view)+'<h1>'+titles[view]+'</h1><p class="m-note">Ejercicio '+e(ledger['year'])+' · Cobertura declarada hasta '+e(report['as_of'])+'</p>'
    if view == 'resumen':
        content = overview(report, rows, pending_count)
    elif view == 'libros':
        content = books(index, report)
    else:
        rows = [r for r in rows if r['kind'] == ('income' if view == 'ingresos' else 'expense')]
        if view == 'renta':
            rows = [r for r in rows if r.get('tax_scope') == 'irpf_only']
            content = '<div class="m-card m-hero"><p>Documentos reservados para revisar en Renta, sin incorporación al IVA trimestral. No representan un importe deducible aprobado.</p><p class="m-note">Luz y gas siguen esta separación. La recopilación desde correo y el cálculo de IRPF y amortizaciones están pendientes de integrar.</p></div>'
        else:
            content = ''
        if view != 'ingresos':
            content += '<div class="m-actions">'+button(BASE+'/gastos', 'Añadir o revisar gastos', True)+button(BASE+'?vista='+('gastos' if view == 'renta' else 'renta'), 'Todos los gastos' if view == 'renta' else 'Solo Renta')+'</div>'
        content += filters(view, period, search)+record_table(rows, income=view == 'ingresos')
        content += '<p class="m-note">'+str(len(rows))+' documentos. '+('Los importes a cobrar no acreditan cobros recibidos.' if view == 'ingresos' else 'IVA documental y destino fiscal se muestran por separado.')+'</p>'
    sync = index.get('sync', {}).get('at')
    footer = '<footer class="m-footer">Última copia: '+e(index['updated'])+(' · Sincronización verificada: '+e(sync) if sync else '')+'.<br>Los datos cambian al solicitar una actualización o aprobar una incorporación.</footer>'
    return page(STYLE+head+content+controls+footer, title=titles[view], wide=True)

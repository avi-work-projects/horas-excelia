"""Deterministic annual consultation XLSX from the canonical Decimal ledger."""
import argparse
from datetime import date
from decimal import Decimal
import hashlib
import io
import json
from pathlib import Path
import re
from xml.etree import ElementTree as ET
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.views import Selection

from ledger import calculate, money, verify_sources, eu_service_vat

PERIODS = ('1T', '2T', '3T', '4T')
CENT = Decimal('0.01')
MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
CATEGORIES = {'general':'General', 'equipment':'Equipamiento', 'telecom':'Telecomunicaciones',
              'electricity':'Electricidad', 'gas':'Gas', 'other':'Otros'}
SCOPES = {'iva_irpf':'IVA e IRPF por revisar', 'irpf_only':'Solo IRPF por revisar',
          'excluded':'Excluido', 'review':'Tratamiento pendiente'}
IRPF = {'pending':'Pendiente', 'current_expense':'Gasto corriente propuesto',
        'asset':'Activo propuesto', 'excluded':'Excluido de IRPF'}


def _sheet(book, name, title, note, widths):
    sheet = book.create_sheet(name)
    sheet.sheet_view.showGridLines = False
    sheet.sheet_properties.pageSetUpPr.fitToPage = True
    sheet.page_setup.orientation = 'landscape'
    sheet.page_setup.paperSize = sheet.PAPERSIZE_A4
    sheet.page_setup.fitToWidth, sheet.page_setup.fitToHeight = 1, 0
    for n, width in enumerate(widths, 1):
        sheet.column_dimensions[get_column_letter(n)].width = width
    _cell(sheet, 2, 1, title)
    sheet['A2'].font = Font(name='Arial', size=15, bold=True, color='183B56')
    sheet.row_dimensions[2].height = 25
    _cell(sheet, 3, 1, note)
    sheet['A3'].font = Font(name='Arial', size=10, italic=True, color='526477')
    sheet.row_dimensions[3].height = 22
    return sheet


def _cell(sheet, row, column, value):
    cell = sheet.cell(row, column)
    if isinstance(value, str):
        if len(value) > 32767:
            raise ValueError('Texto demasiado largo para el Excel de consulta')
        cell.value, cell.data_type = value, 's'  # never interpret document text as a formula
    else:
        cell.value = value
    cell.font = Font(name='Arial', size=10, color='253746')
    cell.alignment = Alignment(vertical='center', indent=1,
                               horizontal='right' if isinstance(value, (int, float, Decimal)) else 'left')
    if isinstance(value, date):
        cell.number_format = 'dd/mm/yyyy'
    return cell


def _table(sheet, headers, rows, monetary, checks, first=5):
    for col, label in enumerate(headers, 1):
        cell = _cell(sheet, first, col, label)
        cell.fill = PatternFill('solid', fgColor='183B56')
        cell.font = Font(name='Arial', size=10, bold=True, color='FFFFFF')
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        cell.border = Border(right=Side(style='thin', color='FFFFFF'))
    sheet.row_dimensions[first].height = 34
    for row_number, values in enumerate(rows, first + 1):
        sheet.row_dimensions[row_number].height = 30
        for col, value in enumerate(values, 1):
            if col in monetary and isinstance(value, Decimal):
                if abs(value) >= Decimal('10000000000000'):
                    raise ValueError('Importe fuera de la precisión admitida en Excel')
                checks.append((sheet.title, row_number, col, value))
                value = float(value)
            cell = _cell(sheet, row_number, col, value)
            if col in monetary:
                cell.number_format = '#,##0.00;[Red](#,##0.00);0.00'
            if row_number % 2 == 0:
                cell.fill = PatternFill('solid', fgColor='F1F5F8')
            if value in ('Pendiente', 'Sin referencia', 'Incompleto', 'Solo IRPF por revisar'):
                cell.fill = PatternFill('solid', fgColor='FFF0CB')
            if isinstance(value, str):
                cell.alignment = Alignment(vertical='center', wrap_text=True, indent=1,
                                           horizontal='right' if col in monetary else 'left')
                width = sheet.column_dimensions[get_column_letter(col)].width
                lines = sum(max(1, (len(line) + int(width) - 1) // int(width)) for line in value.split('\n'))
                sheet.row_dimensions[row_number].height = max(sheet.row_dimensions[row_number].height, 15 * lines + 6)
    last = first + len(rows)
    sheet.auto_filter.ref = f'A{first}:{get_column_letter(len(headers))}{last}'
    sheet.freeze_panes = f'D{first + 1}'
    sheet.print_title_rows = f'1:{first}'
    sheet.print_options.horizontalCentered = True
    sheet.print_area = f'A1:{get_column_letter(len(headers))}{max(last, first + 1)}'


def _canonical_zip(raw):
    """Same inputs produce identical XLSX bytes despite ZIP/property timestamps."""
    output = io.BytesIO()
    with ZipFile(io.BytesIO(raw)) as source, ZipFile(output, 'w', compression=ZIP_DEFLATED) as target:
        for name in sorted(source.namelist()):
            content = source.read(name)
            if name == 'docProps/core.xml':
                root = ET.fromstring(content)
                for child in list(root):
                    if child.tag.rsplit('}', 1)[-1] in ('created', 'modified'):
                        root.remove(child)
                content = ET.tostring(root, encoding='utf-8')
            info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            target.writestr(info, content)
    return output.getvalue()


def build(data, ledger_sha256, calculations=None):
    """Return a static XLSX snapshot; no files, imports, network or fiscal writes."""
    if not re.fullmatch('[a-f0-9]{64}', ledger_sha256):
        raise ValueError('Falta la huella del libro de origen')
    for record in data['records']:
        if record.get('tax_scope') in ('irpf_only', 'excluded', 'review') and record['include']:
            raise ValueError('Un gasto ajeno al IVA no puede incorporarse a sus totales')
    quarters = calculate(data)
    if calculations is not None and calculations != quarters:
        raise ValueError('El informe y el libro no corresponden al mismo cálculo')
    # Independent row reconciliation, before any rounding/conversion for Excel.
    for period, q in quarters.items():
        rows = [r for r in data['records'] if r['period'] == period and r['include']]
        for kind, field, box in [('income','base','07'), ('income','vat','09'),
                                 ('expense','base','28'), ('expense','vat','29')]:
            expected = sum((money(r[field]) for r in rows if r['kind'] == kind
                            and r['mapping'] != 'eu_services21'), Decimal('0.00'))
            if expected != money(q['boxes'][box]):
                raise ValueError('Las filas no concilian con el motor Decimal')
    book = Workbook()
    book.remove(book.active)
    book.properties.creator = 'Kairo'
    book.properties.title = f'Libro anual de consulta {data["year"]}'
    book.properties.subject = 'Consulta documental; IVA y revisión IRPF separados'
    book.properties.identifier = ledger_sha256
    checks = []
    summary = _sheet(book, 'Resumen', f'Libro anual de consulta {data["year"]}',
        f'Cobertura declarada hasta {data.get("as_of", "sin fecha")}. Importes en euros.', [14,18,18,18,18,18,18,18,43])
    summary.sheet_properties.tabColor = '183B56'
    summary_rows = []
    for period in PERIODS:
        q = quarters[period]
        values = [money(q['boxes'][box]) for box in ('07','09','28','29')]
        summary_rows.append([period, *values,
            money(q['boxes']['71']) if q['boxes']['71'] is not None else 'Pendiente',
            money(q['reference']['71']) if q['reference'].get('71') is not None else 'Sin referencia',
            money(q['difference']['71']) if q['difference'].get('71') is not None else 'Pendiente', q['coverage']])
    total = ['Total documental']
    for col in range(1, 8):
        values = [r[col] for r in summary_rows]
        total.append(sum(values, Decimal('0.00')) if all(isinstance(v, Decimal) for v in values) else 'Incompleto')
    total.append('El acumulado no confirma el cierre del ejercicio.')
    summary_rows.append(total)
    _table(summary, ['Periodo','Base ingresos','IVA ingresos','Base gastos nacionales','IVA gastos nacionales',
                     'Resultado 303','Referencia 303','Diferencia','Cobertura'], summary_rows, set(range(2,9)), checks)
    summary.freeze_panes = None
    summary.auto_filter.ref = None
    for cell in summary[10]:
        cell.font = Font(name='Arial', size=10, bold=True, color='183B56')
    expenses = [r for r in data['records'] if r['kind'] == 'expense']
    pending = [r for r in expenses if r.get('tax_scope') != 'excluded' and r.get('irpf_treatment') != 'excluded']
    _cell(summary, 13, 1, 'IRPF pendiente')
    _cell(summary, 14, 1, 'Documentos')
    _cell(summary, 14, 2, len(pending))
    _cell(summary, 15, 1, 'Total documental')
    amount = sum((money(r['total']) for r in pending), Decimal('0.00'))
    _cell(summary, 15, 2, float(amount)).number_format = '#,##0.00'
    checks.append(('Resumen', 15, 2, amount))
    for row, text in [(17,'Renta pendiente conserva importes documentales. No calcula una deducción ni el resultado del IRPF.'),
                      (18,'Este archivo es una consulta del libro, no una plantilla LSI ni una declaración fiscal.'),
                      (19,'Los valores se regeneran desde Kairo. Editar este Excel no modifica el libro ni recalcula el resumen.')]:
        _cell(summary, row, 1, text)
    _cell(summary, 21, 1, 'IVA autoliquidado y deducible: desglose del 303')
    eu_summary = [[period, *[money(quarters[period]['boxes'][box])
        for box in ('10','11','36','37','27','45','46')]] for period in PERIODS]
    _table(summary, ['Periodo','Base servicios UE (10)','IVA UE devengado (11)',
        'Base UE deducible (36)','IVA UE deducible (37)','Total devengado (27)',
        'Total deducible (45)','Resultado (46)'], eu_summary, set(range(2,9)), checks, first=22)
    summary.auto_filter.ref = None
    summary.freeze_panes = None
    # Removing a frozen pane does not clear openpyxl's pane selections. The two
    # tables above otherwise leave five orphan/duplicate selections, which Excel
    # repairs on opening even though openpyxl can read the workbook itself.
    summary.sheet_view.selection = [Selection(activeCell='A1', sqref='A1')]
    summary.print_area = 'A1:I26'

    for kind, title in [('income','Ingresos'), ('expense','Gastos')]:
        sheet = _sheet(book, title, f'{title} documentales',
                       'Los documentos excluidos se conservan sin sumar al IVA.', [22,15,12,35,18,17,17,17,17,16,25,20])
        rows = []
        for r in data['records']:
            if r['kind'] != kind:
                continue
            rows.append([r['number'],date.fromisoformat(r['date']),r['period'],r['party'],r.get('tax_id') or 'Sin dato',
                money(r['base']),money(r['vat']),money(r['withholding']),money(r['total']),
                'Sí' if r['include'] else 'No',SCOPES.get(r.get('tax_scope'), 'Histórico; IRPF no revisado'),r['sha256'][:16]])
        _table(sheet, ['Factura','Fecha','Trimestre','Cliente' if kind=='income' else 'Proveedor','NIF documental',
                      'Base EUR','IVA documental','Retención EUR','Total EUR','Incluido IVA','Ámbito','Documento'],
               rows, {6,7,8,9}, checks)

    eu_rows = [r for r in expenses if r['include'] and r['mapping'] == 'eu_services21']
    if eu_rows:
        services = _sheet(book, 'Servicios UE', 'Servicios intracomunitarios revisados',
            'IVA documental cero; autoliquidación y deducción explícitas, sin validación VIES automática.',
            [22,15,12,35,20,17,17,17,17,17,17])
        rows = [[r['number'],date.fromisoformat(r['date']),r['period'],r['party'],r['tax_id'],
                 money(r['base']),money(r['vat']),money(r['reverse_charge_rate']),
                 eu_service_vat(r),money(r['deductible_percentage']),eu_service_vat(r)] for r in eu_rows]
        _table(services, ['Factura','Fecha','Trimestre','Proveedor','NIF-IVA documental','Base EUR',
            'IVA documental','Tipo autoliquidado %','IVA autoliquidado','Deducción %','IVA deducible'],
            rows, set(range(6,12)), checks)

    renta = _sheet(book, 'Renta pendiente', 'Documentos para revisar el IRPF',
        'Importes documentales completos. Porcentaje y deducción pendientes de revisar.', [22,15,12,33,24,17,17,17,28,42,33,20])
    rows = [[r['number'],date.fromisoformat(r['date']),r['period'],r['party'],
             CATEGORIES.get(r.get('category'),r.get('category','Sin clasificar')),
             money(r['base']),money(r['vat']),money(r['total']),
             IRPF.get(r.get('irpf_treatment'), 'Tratamiento no confirmado'),
             r.get('business_purpose','Sin finalidad documentada'),
             'Pendiente; sin deducción calculada',r['sha256'][:16]] for r in pending]
    _table(renta, ['Factura','Fecha','Trimestre','Proveedor','Categoría','Base EUR','IVA documental',
                   'Total documental','Clasificación propuesta','Finalidad declarada','Estado IRPF','Documento'], rows, {6,7,8}, checks)

    documents = _sheet(book, 'Documentos', 'Originales y versión del libro',
                        'Cada identificador enlaza los registros con su original conservado.', [21,80,15,60,75])
    _cell(documents, 5, 1, 'SHA256 del libro')
    _cell(documents, 5, 2, ledger_sha256)
    sources = {}
    for d in [*data.get('documents', []), *data['records']]:
        if not d.get('source') or not d.get('sha256'):
            continue
        key = d['source']
        if key in sources and sources[key]['sha256'] != d['sha256']:
            raise ValueError('Un original tiene huellas contradictorias en el libro')
        sources.setdefault(key, d)
    doc_rows = []
    for source, d in sorted(sources.items()):
        pages = d.get('pages', 'Sin dato')
        pages = ', '.join(map(str, pages)) if isinstance(pages, list) else pages
        doc_rows.append([d['sha256'][:16],source,pages,d.get('status',d.get('note','Registro del libro')),d['sha256']])
    _table(documents, ['Documento','Original en el archivo','Páginas','Estado documental','SHA256 del original'], doc_rows, set(), checks, first=7)
    buffer = io.BytesIO()
    book.save(buffer)
    raw = _canonical_zip(buffer.getvalue())
    # Read the emitted bytes, not just in-memory values: reject Excel precision loss.
    saved = load_workbook(io.BytesIO(raw), data_only=True)
    try:
        for name, row, col, expected in checks:
            value = saved[name].cell(row, col).value
            if not isinstance(value, (int, float)) or Decimal(str(value)).quantize(CENT) != expected:
                raise ValueError('La salida Excel ha perdido precisión en los importes')
        if saved['Documentos']['B5'].value != ledger_sha256 or saved.properties.identifier != ledger_sha256:
            raise ValueError('La salida Excel no conserva la versión del libro')
    finally:
        saved.close()
    return raw


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True, type=Path)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    source = args.input.read_bytes()
    data = json.loads(source.decode('utf-8-sig'))
    verify_sources(data, args.root)
    payload = build(data, hashlib.sha256(source).hexdigest())
    if args.output.resolve() == args.input.resolve():
        raise ValueError('La salida no puede reemplazar el libro de origen')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(payload)
    print('Excel de consulta generado; no se han incorporado documentos ni presentado modelos.')


if __name__ == '__main__':
    main()

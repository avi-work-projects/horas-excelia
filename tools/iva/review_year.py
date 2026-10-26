"""One-command private annual review and optional OPEN report reconciliation."""
import argparse
from decimal import Decimal
from html import escape
import hashlib
import json
from pathlib import Path
from ledger import calculate, verify_sources
from reconcile_open import reconcile
from prepare_390 import prepare


def review(data, root, report=None, period=None):
    verify_sources(data, root)
    calculated = calculate(data)
    missing = [{'period': r['period'], 'number': r['number'],
                'missing': [f for f in ('receipt_date', 'receipt_date_source') if not r.get(f)]}
               for r in data['records'] if r['include'] and r['kind'] == 'expense'
               and (not r.get('receipt_date') or not r.get('receipt_date_source'))]
    result = dict(year=data['year'], as_of=data['as_of'], filing_ready=False,
                  quarters=calculated, missing_receipt_metadata=missing,
                  excluded_records=[{'number': r['number'], 'period': r['period'], 'note': r.get('note', '')}
                                    for r in data['records'] if not r['include']],
                  annual_documentary_totals={b: str(sum((Decimal(q['boxes'][b]) for q in calculated.values()), Decimal('0.00')))
                                             for b in ('07', '09', '28', '29')},
                  annual_status='Acumulado documental disponible; NO es modelo 390 ni cierre anual',
                  submission_status='No se presenta ni se modifica ninguna declaración')
    if report is not None:
        raw = report.read_bytes()
        try:
            text = raw.decode('utf-8-sig')
        except UnicodeDecodeError:
            text = raw.decode('cp1252')
        result['open_report'] = reconcile(data, period, text)
        result['open_report']['sha256'] = hashlib.sha256(raw).hexdigest()
    result['preparation_390'] = prepare(result)
    return result


def render(result):
    def e(value):
        return escape(str(value if value is not None else 'Pendiente'))
    rows = ''.join('<tr>' + ''.join(f'<td>{e(v)}</td>' for v in (
        period, q['boxes']['07'], q['boxes']['09'], q['boxes']['29'],
        q['boxes']['71'], q['reference'].get('71'), q['difference'].get('71'), q['coverage'])) + '</tr>'
        for period, q in result['quarters'].items())
    missing = ''.join(f"<li>{e(r['period'])} · {e(r['number'])}: falta fecha de recepción o su procedencia</li>"
                      for r in result['missing_receipt_metadata']) or '<li>Sin fechas de recepción pendientes</li>'
    excluded = ''.join(f"<li>{e(r['period'])} · {e(r['number'])}: {e(r['note'])}</li>"
                       for r in result['excluded_records']) or '<li>Ninguno</li>'
    report = result.get('open_report')
    proof = (f"Informe OPEN {e(report['period'])}: cotejo exacto correcto. "
             f"{report['incorporated_records']} registros incorporados; "
             f"{report['excluded_previous_period_records']} de periodos anteriores no incorporados."
             if report else 'Sin informe OPEN aportado en esta ejecución.')
    return f'''<!doctype html><html lang="es"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisión IVA {e(result['year'])}</title><style>
body{{font:16px system-ui;background:#f3f6fa;color:#183044;margin:0;padding:24px}}main{{max-width:1100px;margin:auto}}
section{{background:white;border-radius:14px;padding:22px;margin:18px 0}}h1{{font-size:28px}}h2{{font-size:20px}}
.scroll{{overflow:auto}}table{{border-collapse:collapse;width:100%}}td,th{{padding:12px;text-align:left;border-bottom:1px solid #dde4eb}}
th{{background:#eaf1f7}}li{{margin:12px 0}}.notice{{border-left:5px solid #be8121}}small{{color:#526477}}</style>
<main><h1>Revisión del IVA · {e(result['year'])}</h1><p>Datos hasta {e(result['as_of'])}. Ensayo sin presentación.</p>
<section><h2>1. Comparación trimestral</h2><div class="scroll"><table><thead><tr>
<th>Periodo</th><th>Base ingresos</th><th>IVA ingresos</th><th>IVA gastos</th><th>Resultado</th><th>Presentado</th><th>Diferencia</th><th>Cobertura</th>
</tr></thead><tbody>{rows}</tbody></table></div><p>Importes en euros. Se conservan las cuotas de los documentos; las diferencias no se corrigen artificialmente.</p></section>
<section><h2>2. Comprobación de importación</h2><p>{proof}</p><small>Comprueba filas e importes del CSV; no acredita por sí solo validación final ni presentación.</small></section>
<section><h2>3. Documentos pendientes para importar</h2><ul>{missing}</ul><h2>Exclusiones conservadas</h2><ul>{excluded}</ul></section>
<section class="notice"><h2>4. Qué falta para el cierre anual</h2><p>{e(result['annual_status'])}.</p>
<p>Completar el cuarto trimestre y contrastar su cobertura documental. El modelo 390 requiere su propio diseño y validación: este informe no lo genera.</p>
<p>La revisión fiscal aplazada permanece separada. No se hereda el perfil de un trimestre a otro automáticamente.</p></section>
<section><h2>Cómo retomar el ensayo</h2><p>Usar el simulador OPEN del ejercicio y periodo correcto. El XLSX se carga en «Importación de libros de registro».
El botón inicial «Importar» espera otro formato. Una sesión .ses debe haberse descargado completamente antes de recuperarla con «Cargar».</p>
<p>Esta página es un informe local, no está conectada con Hacienda y no contiene botones de envío.</p></section></main></html>'''


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('input', type=Path)
    p.add_argument('--root', required=True, type=Path)
    p.add_argument('--output-dir', required=True, type=Path)
    p.add_argument('--open-report', type=Path)
    p.add_argument('--period', choices=['1T', '2T', '3T', '4T'])
    a = p.parse_args()
    if bool(a.open_report) != bool(a.period):
        p.error('--open-report and --period must be provided together')
    data = json.loads(a.input.read_text(encoding='utf-8-sig'))
    result = review(data, a.root, a.open_report, a.period)
    a.output_dir.mkdir(parents=True, exist_ok=True)
    for extension, content in [('json', json.dumps(result, ensure_ascii=False, indent=2)), ('html', render(result))]:
        (a.output_dir / f'REVISION_IVA_{data["year"]}.{extension}').write_text(content, encoding='utf-8')
    print('Annual review saved; source hashes verified; nothing filed.')


if __name__ == '__main__':
    main()

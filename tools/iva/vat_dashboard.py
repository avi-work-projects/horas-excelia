"""Read-only private Kairo VAT panel. Mount only after existing authentication."""
import hashlib
import html
import json
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

BASE = '/facturas/modelos'
e = lambda value: html.escape(str(value), quote=True)


def verified(root, entry):
    root = Path(root).resolve()
    path = (root / entry['path']).resolve()
    if not path.is_relative_to(root):
        raise ValueError('Invalid archive path')
    raw = path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != entry['sha256']:
        raise ValueError('Archive version mismatch')
    return raw


def response(root, url):
    parsed = urlsplit(url)
    path = parsed.path
    if path in ('/modelos', '/modelos/', '/modelos/descargar'):
        path = '/facturas' + path
    if path not in (BASE, BASE + '/', BASE + '/descargar'):
        return None
    try:
        index = json.loads((Path(root) / 'modelos-index.json').read_text(encoding='utf-8'))
        query = parse_qs(parsed.query)
        if path.endswith('/descargar'):
            key = query.get('id', [''])[0]
            if key not in index['downloads']:
                return (404, 'Archivo no disponible')
            item = index['downloads'][key]
            return (200, verified(root, item), item['mime'],
                    {'Content-Disposition': 'attachment; filename="' + item['filename'] + '"'})
        report = json.loads(verified(root, index['report']))
        ledger = json.loads(verified(root, index['ledger']))
        if report['year'] != ledger['year']:
            raise ValueError('Year mismatch')
        quarter = query.get('periodo', ['2T'])[0]
        section = query.get('paso', ['revision'])[0]
        if quarter not in report['quarters'] or section not in ('documentos', 'revision', 'archivos'):
            return (400, 'Periodo o paso no válido')
        return (200, render(index, report, ledger, quarter, section))
    except (OSError, ValueError, KeyError, TypeError):
        return (503, '<h1>Modelos temporalmente no disponibles</h1><p>La copia de consulta falta o no coincide con la versión verificada. No se ha modificado ni presentado nada.</p><a href="/facturas/">Volver a facturas</a>')


def render(index, report, ledger, quarter, section):
    def link(q, s):
        return f'{BASE}?periodo={q}&paso={s}'
    def euro(value):
        if value is None:
            return 'Pendiente'
        from decimal import Decimal
        return format(Decimal(value), ',.2f').replace(',', 'X').replace('.', ',').replace('X', '.') + ' €'
    selected = report['quarters'][quarter]
    quarters = ''.join(f'<a class="pill" href="{link(q,section)}" {"aria-current=page" if q==quarter else ""}>{q}</a>' for q in report['quarters'])
    tabs = ''.join(f'<a href="{link(quarter,key)}" {"aria-current=step" if key==section else ""}>{n}. {title}</a>'
                   for n,key,title in [(1,'documentos','Documentos'),(2,'revision','Revisión'),(3,'archivos','Archivos')])
    if section == 'documentos':
        rows = [r for r in ledger['records'] if r['period'] == quarter]
        cards = ''.join(f'<article><strong>{e(r["number"])}</strong><p>{e(r["party"])}</p><p>{"Ingreso" if r["kind"]=="income" else "Gasto"} · {e(r["date"])} · {e(euro(r["total"]))}</p><span class="badge">{"Incorporado al cálculo" if r["include"] else "Excluido / pendiente"}</span><details><summary>Documento de origen</summary><p class="path">{e(r["source"])}</p><p>{e(r.get("note", ""))}</p></details></article>' for r in rows)
        content = f'<h2>Documentos del {quarter}</h2><p>{len(rows)} registros. Se consultan desde la copia del libro; los originales siguen en AUTONOMO.</p><div class="cards">{cards or "Sin documentos incorporados"}</div>'
    elif section == 'revision':
        boxes = selected['boxes']
        metrics = ''.join(f'<article><small>{label}</small><strong class="amount">{e(euro(value))}</strong></article>' for label,value in [
            ('IVA de ingresos',boxes['09']),('IVA de gastos',boxes['29']),('Resultado calculado',boxes['71']),
            ('Referencia presentada',selected['reference'].get('71')),('Diferencia',selected['difference'].get('71'))])
        missing = [r for r in report['missing_receipt_metadata'] if r['period']==quarter]
        content = f'<h2>Revisión del {quarter}</h2><div class="cards">{metrics}</div><article><h3>Cobertura</h3><p>{e(selected["coverage"])}</p><p>{len(missing)} gastos con metadatos de recepción pendientes para importar el libro.</p><p>La revisión fiscal sigue pendiente. Se mantienen los importes documentales y las diferencias visibles.</p></article>'
    else:
        items = [(key,item) for key,item in index['downloads'].items() if item['period']==quarter]
        downloads = ''.join(f'<article><h3>{e(item["label"])}</h3><p>{e(item["note"])}</p><a class="button" href="{BASE}/descargar?id={e(key)}">Descargar {e(item["label"])}</a></article>' for key,item in items)
        content = f'<h2>Archivos del {quarter}</h2>{downloads or "<article>No hay archivo validado disponible para este periodo.</article>"}<article><h3>Preparación de nuevos periodos</h3><p>La generación desde el panel y la aprobación de nuevos cierres todavía no están habilitadas. Los archivos disponibles son ensayos identificados.</p></article>'
    if index.get('payment_summary'):
        content += '<article><h3>Cuenta para domiciliación</h3><p>' + e(index['payment_summary']) + '</p><p>Configurada para preparar el archivo. No hay domiciliación solicitada ni cargo ordenado desde este panel.</p></article>'
    return f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Modelos IVA · Kairo</title><style>
*{{box-sizing:border-box}}body{{margin:0;background:#f2f6f5;color:#17352f;font:16px system-ui;line-height:1.55}}main{{max-width:1050px;margin:auto;padding:20px}}header{{margin-bottom:22px}}a{{color:#12665e}}h1{{font-size:30px;margin:18px 0 6px}}h2{{font-size:23px}}h3{{font-size:18px}}nav,.quarters{{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}}nav a,.pill{{padding:10px 15px;border:1px solid #cadbd6;border-radius:10px;text-decoration:none;background:white}}[aria-current]{{background:#12665e;color:white}}.cards{{margin-bottom:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}}article{{background:white;padding:20px;border:1px solid #dce7e3;border-radius:14px;margin-bottom:14px}}.cards article{{margin:0}}.amount{{display:block;font-size:26px;margin-top:8px}}small{{color:#50695f}}.notice{{background:#fff4da;border-left:4px solid #c78a24;padding:14px;border-radius:8px}}.badge{{display:inline-block;background:#eaf1ef;border-radius:8px;padding:5px 9px;font-size:14px}}.path{{overflow-wrap:anywhere}}.button{{display:inline-block;background:#12665e;color:white;padding:12px 16px;border-radius:9px;text-decoration:none}}footer{{padding:22px 0;color:#50695f}}@media(max-width:420px){{main{{padding:14px}}nav{{gap:6px}}nav a{{padding:10px;font-size:14px}}.cards{{grid-template-columns:1fr}}}}
</style></head><body><main><header><a href="/facturas/">← Facturas · Kairo</a><h1>Modelos IVA · {report['year']}</h1><p>Libro, revisión trimestral y archivos de ensayo.</p><p class="notice">Modo de revisión: este panel no presenta declaraciones ni ordena pagos.</p><div class="quarters">{quarters}</div><nav aria-label="Pasos del trimestre">{tabs}</nav></header>{content}<footer>Consulta actualizada: {e(index['updated'])} · Datos hasta {e(report['as_of'])}<br>Acceso privado mediante Tailscale · Los cambios del libro requieren regenerar y verificar esta copia.</footer></main></body></html>'''

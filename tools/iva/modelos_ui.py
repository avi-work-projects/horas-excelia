"""Presentation helpers for private Modelos routes; no data writes."""
import html
from decimal import Decimal


def e(value):
    return html.escape(str(value), quote=True)


def euro(value, signed=False):
    if value is None:
        return 'Pendiente'
    number = Decimal(str(value))
    text = format(number, '+,.2f' if signed else ',.2f')
    return text.replace(',', 'X').replace('.', ',').replace('X', '.') + ' €'


STYLE = '''<style>
.modelos{--m-tint:color-mix(in srgb,var(--k-accent) 9%,var(--k-surface));line-height:1.5}
.modelos *{box-sizing:border-box}.modelos h1{text-align:center;margin:8px 0 14px}.modelos p,.modelos li{overflow-wrap:anywhere}.modelos h2{font-size:18px;margin:0 0 12px}.modelos h3{font-size:15px;margin:0 0 8px}
.modelos .m-periods{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;border:1px solid var(--k-line);padding:4px;border-radius:14px;margin:12px 0 16px;background:var(--k-surface)}
.modelos .m-periods a{display:grid;place-items:center;min-height:44px;text-decoration:none;border-radius:10px;color:var(--k-muted);font-weight:650}
.modelos .m-periods a[aria-current]{background:var(--k-accent);color:var(--k-bg)}
.modelos .m-card{padding:16px;margin:12px 0;border:1px solid var(--k-line);border-radius:16px;background:var(--k-surface)}
.modelos .m-hero{background:var(--m-tint)}.modelos .m-eyebrow{font-size:12px;color:var(--k-muted);font-weight:650}.modelos .m-status{font-weight:700;font-size:18px;margin:6px 0}.modelos .m-amount{font-size:30px;line-height:1.2;letter-spacing:-.035em;font-weight:700;margin:8px 0;font-variant-numeric:tabular-nums}
.modelos .m-tag{display:inline-block;font-size:12px;padding:3px 8px;border:1px solid var(--k-line);border-radius:8px;color:var(--k-muted);background:var(--k-bg)}
.modelos .m-facts{margin:0}.modelos .m-facts>div{display:flex;align-items:baseline;justify-content:space-between;gap:15px;padding:9px 0;border-bottom:1px solid var(--k-line)}.modelos .m-facts>div:last-child{border:0}.modelos dt{color:var(--k-muted);font-size:14px}.modelos dd{margin:0;font-weight:650;text-align:right;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.modelos .m-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}.modelos .m-button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 13px;border:1px solid var(--k-line);border-radius:11px;color:var(--k-accent);background:var(--k-surface);text-decoration:none;font-weight:650;font-size:14px}.modelos .m-primary{background:var(--k-accent);color:var(--k-bg)}
.modelos .m-note,.modelos .m-meta{font-size:12px;color:var(--k-muted);overflow-wrap:anywhere}.modelos .m-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.modelos .m-columns .m-card{margin:0}.modelos .m-metric{font-size:20px;font-weight:650;display:block;font-variant-numeric:tabular-nums}
.modelos .m-document{padding:10px 0;border-bottom:1px solid var(--k-line)}.modelos .m-document:last-child{border:0}.modelos .m-document summary{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;min-height:44px;color:inherit;font-size:14px;list-style:none}.modelos .m-document summary:after{display:none}.modelos .m-document summary strong{display:block;overflow-wrap:anywhere}.modelos .m-document summary .m-doc-total{text-align:right;white-space:nowrap;font-weight:650}.modelos .m-document summary .m-meta{display:block;font-weight:400}.modelos .m-document .m-facts{padding:5px 10px;background:var(--k-bg);border-radius:10px}.modelos .m-document[open] summary{margin-bottom:10px}.modelos .m-excluded{border-left:3px solid var(--k-muted);padding-left:10px}
.modelos .m-table-wrap{overflow:auto}.modelos table{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed}.modelos th,.modelos td{padding:9px 4px;text-align:right;border-bottom:1px solid var(--k-line);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.modelos th:first-child,.modelos td:first-child{text-align:left;width:18%}.modelos th{color:var(--k-muted);font-size:12px;font-weight:600}.modelos .m-list{padding-left:19px;margin:0}.modelos .m-list li{padding:5px 0}.modelos .m-form{display:grid;gap:12px}.modelos .m-form label{display:grid;gap:5px;font-size:13px;color:var(--k-muted)}.modelos .m-form input,.modelos .m-form select,.modelos .m-form textarea{width:100%;min-width:0;padding:11px;border:1px solid var(--k-line);border-radius:9px;background:var(--k-bg);color:var(--text);font:inherit;font-size:16px}.modelos .m-form input[type=checkbox]{width:20px;min-height:20px;accent-color:var(--k-accent)}.modelos .m-form .m-check{display:flex;align-items:flex-start;gap:10px;color:inherit}.modelos .m-check input{flex:none}.modelos pre{max-width:100%;max-height:210px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;background:var(--k-bg);padding:12px;border-radius:10px;font-size:12px}.modelos .m-warning{border-left:3px solid var(--k-accent);padding-left:10px}.modelos .m-feedback:empty{display:none}.modelos .m-feedback{padding:12px;border:1px solid var(--k-line);border-radius:10px;white-space:pre-line}.modelos .m-footer{font-size:12px;color:var(--k-muted);margin:18px 0}.modelos details>summary{cursor:pointer}.modelos button:disabled{opacity:.55;cursor:wait}
@media(max-width:360px){.modelos .m-card{padding:13px}.modelos .m-amount{font-size:27px}.modelos .m-columns{gap:7px}.modelos .m-metric{font-size:18px}}
</style>'''


def page(content, title='Modelos IVA'):
    content = STYLE + '<section class="modelos">' + content + '</section>'
    try:
        from kairo_invoice_web import dashboard
    except ModuleNotFoundError as exc:
        if exc.name != 'kairo_invoice_web':
            raise
        # Standalone offline tools do not ship the private billing server.
        # Installed Kairo always uses its shared dashboard above.
        return '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+e(title)+'</title><link rel="stylesheet" href="/style.css"><script src="/theme.js"></script><body class="k-ui"><main class="k-main">'+content+'</main></body></html>'
    return dashboard(content, 'models', title)


def fact(label, value):
    return '<div><dt>'+e(label)+'</dt><dd>'+e(value)+'</dd></div>'


def button(url, label, primary=False):
    return '<a class="m-button'+(' m-primary' if primary else '')+'" href="'+e(url)+'">'+e(label)+'</a>'

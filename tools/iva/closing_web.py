"""Mount behind Kairo's existing owner, Origin and CSRF checks."""
import html
import json
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from closing import candidate, read, Store

BASE = '/facturas/modelos/cierre'
e = lambda v: html.escape(str(v), quote=True)


def get(runtime, url, csrf):
    path = urlsplit(url).path.removeprefix('/facturas')
    if path not in ('/modelos/cierre', '/modelos/cierre/archivo'):
        return None
    period = parse_qs(urlsplit(url).query).get('periodo', ['2T'])[0]
    if period not in ('1T', '2T', '3T', '4T'):
        return (400, 'Periodo no válido')
    try:
        config = read(Path(runtime)/'config.json')
        store = Store(Path(runtime)/'closing.sqlite')
        row = store.get(f'{config["year"]}-{period}')
        if path.endswith('/archivo'):
            if not row:
                raise ValueError('Prepara primero el resumen')
            current = candidate(config, period, row['snapshot']['mode'])
            return (200, store.download(current), 'text/plain; charset=iso-8859-1',
                    {'Content-Disposition': f'attachment; filename="{current["filename"]}"'})
        available = period in config['profiles']
        stale = False
        problem = ''
        if row:
            try:
                stale = candidate(config, period, row['snapshot']['mode'])['revision'] != row['snapshot']['revision']
            except (ValueError, OSError, KeyError):
                stale, problem = True, 'La documentación o el perfil ya no superan las comprobaciones.'
        return (200, render(config['year'], period, row, available, stale, problem, csrf))
    except (ValueError, KeyError, OSError):
        return (409, 'Cierre no disponible o versión cambiada. Vuelve al panel y prepara el resumen de nuevo.')


def post(runtime, path, data, actor):
    if path.removeprefix('/facturas') != '/modelos/cierre':
        return None
    config = read(Path(runtime)/'config.json')
    period = data.get('period')
    current = candidate(config, period, data.get('mode'))
    state = Store(Path(runtime)/'closing.sqlite').act(period, data.get('action'), data.get('revision'), current, actor)
    return {'state': state, 'message': 'Estado guardado. No se ha presentado nada ni solicitado ningún pago.'}


def render(year, period, row, available, stale, problem, csrf):
    snapshot = row['snapshot'] if row else {}
    state = row['state'] if row else 'none'
    names = {'none':'Sin preparar', 'prepared':'Pendiente de aprobación', 'approved':'Resumen aprobado',
             'generated':'Archivo generado', 'cancelled':'Aprobación cancelada'}
    status = 'Datos cambiados: requiere nueva revisión' if stale else names[state]
    notice = 'Ensayo para OPEN. No vuelvas a presentar un periodo ya declarado. '
    if period == '4T' and year == 2026:
        problem = 'Última prueba oficial, 26/10/2026: OPEN rechaza la selección del 4T («El periodo seleccionado no está permitido»). La validación está pendiente; las pruebas locales no la sustituyen.'
    def button(action, label, enabled):
        return f'<button type="button" data-action="{action}" {"" if enabled else "disabled"}>{label}</button>'
    summary = ''
    if row:
        summary = '<section><h2>Resumen que estás revisando</h2><dl>' + ''.join(
            f'<dt>{label}</dt><dd>{e(value)}</dd>' for label,value in [
                ('Ejercicio y periodo', f'{year} · {period}'), ('Resultado calculado (€)',snapshot['boxes']['71']),
                ('Presentado históricamente (€)',snapshot['filed_result'] if snapshot['filed_result'] is not None else 'No aplica'),('Diferencia (€)',snapshot['difference'] if snapshot['difference'] is not None else 'No aplica'),
                ('Modalidad', 'Domiciliación (ensayo)' if snapshot['mode']=='U' else 'Ingreso sin cuenta (ensayo)'),
                ('Cuenta',snapshot['account'])]) + '</dl><p>Versión: <code>' + e(snapshot['revision'][:12]) + '</code></p></section>'
    controls = button('prepare','1. Preparar resumen', available)
    controls += button('approve','2. Aprobar resumen de ensayo',available and not stale and state=='prepared')
    controls += button('generate','3. Generar TXT de ensayo',available and not stale and state in ('approved','generated'))
    controls += button('cancel','Cancelar aprobación',available and not stale and state in ('prepared','approved','generated'))
    download = f'<a class="download" href="{BASE}/archivo?periodo={period}">Descargar TXT generado · solo OPEN</a>' if state=='generated' and not stale else ''
    script_data = json.dumps(dict(period=period, mode=snapshot.get('mode','U'), revision=snapshot.get('revision',''), csrf=csrf)).replace('<','\\u003c')
    return f'''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cierre trimestral · Kairo</title><style>*{{box-sizing:border-box}}body{{margin:0;background:#f2f6f5;color:#17352f;font:16px system-ui;line-height:1.55}}main{{max-width:800px;padding:20px;margin:auto}}section{{background:white;border:1px solid #dce7e3;border-radius:14px;padding:20px;margin:18px 0}}h1{{font-size:28px}}h2{{font-size:20px}}a{{color:#12665e}}.notice{{padding:16px;background:#fff4da;border-radius:10px}}.actions{{display:grid;gap:12px}}button,.download{{font:inherit;border:0;border-radius:9px;background:#12665e;color:white;padding:14px;text-align:center;text-decoration:none}}button:disabled{{background:#dbe4e1;color:#51645f}}label{{display:block;margin:12px 0}}select{{font:inherit;padding:10px;max-width:100%}}dt{{color:#52695f}}dd{{font-weight:600;margin:0 0 12px}}code{{overflow-wrap:anywhere}}</style>
<main><a href="/facturas/modelos?periodo={period}&paso=revision">← Volver a Modelos</a><h1>Cierre trimestral · {year} · {period}</h1>
<p class="notice">{notice}Aprobar aquí solo permite generar un archivo para OPEN; no firma una declaración ni solicita domiciliación.</p>
<section><h2>{e(status)}</h2><p>{e(problem)}</p><p>{'Perfil configurado disponible.' if available else 'Falta acreditar el perfil y confirmar que los datos del periodo están completos. El adaptador 4T tiene alcance limitado: régimen general, resultado positivo, sin ajustes anuales y con obligación de 390. No se reutiliza automáticamente el perfil del 2T.'}</p>
<label for="mode">Modalidad para preparar el próximo resumen</label><select id="mode"><option value="U" {'selected' if snapshot.get('mode','U')=='U' else ''}>Domiciliación · cuenta configurada</option><option value="I" {'selected' if snapshot.get('mode')=='I' else ''}>Ingreso sin cuenta</option></select><p>Cambiar modalidad requiere preparar y aprobar otra versión. La variante con domiciliación está pendiente de validación en OPEN.</p></section>
{summary}<section class="actions">{controls}{download}</section><p id="result" role="status"></p></main>
<script>const ctx={script_data};document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',async()=>{{const action=b.dataset.action;document.querySelectorAll('button').forEach(x=>x.disabled=true);try{{const r=await fetch('{BASE}',{{method:'POST',headers:{{'Content-Type':'application/json','X-CSRF':ctx.csrf}},body:JSON.stringify({{period:ctx.period,revision:ctx.revision,mode:action==='prepare'?document.getElementById('mode').value:ctx.mode,action}})}});const d=await r.json();if(!r.ok)throw new Error(d.message||'No se pudo completar');location.reload();}}catch(err){{document.getElementById('result').textContent=err.message+' Recarga la página para revisar el estado.';}}}}));</script></html>'''

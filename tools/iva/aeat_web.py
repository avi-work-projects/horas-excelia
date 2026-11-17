"""Manual presentation UI. GET only reads local state and the reviewed source."""
from datetime import datetime
import json
import time
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from modelos_ui import e
from aeat_workflow import BASE, PERIODS, settings, source, store, receipt, period_has_ended, candidate
from aeat_submission import VALIDATION_TTL


LABELS = {'prepared':'Preparado para validar','validating':'Validación en curso','validated':'Validación técnica correcta',
          'submitting':'Envío en curso','accepted':'Aceptación recibida','uncertain':'Resultado pendiente de comprobar',
          'rejected':'Requiere corrección','receipt_pending':'Aceptado · falta recuperar el justificante','filed':'Presentado · justificante conservado'}


def get(app, url):
    query = parse_qs(urlsplit(url).query)
    period = query.get('periodo',['4T'])[0]
    if period not in PERIODS:
        raise ValueError('Periodo no válido')
    if urlsplit(url).path==BASE+'/justificante':
        identifier = query.get('id',[''])[0]
        return 200,receipt(app,identifier),'application/pdf',{'Content-Disposition':'inline; filename="justificante-aeat.pdf"'}
    current = source(app,period)
    history = [item for item in store(app).list() if item['snapshot']['period']==period and item['snapshot']['year']==current['year']]
    selected = query.get('id',[''])[0]
    entry = next((row for row in history if row['id']==selected),None) if selected else (history[0] if history else None)
    if selected and not entry:
        raise ValueError('La presentación no corresponde a este periodo.')
    config = settings(app)
    return 200,app.shell(render(current,entry,history,config,app),url,'Presentar modelos')


def render(current, entry, history, config, app):
    period,year = current['period'],current['year']
    model = '390' if period=='anual' else '303'
    title = f'Modelo {model} · {"Año" if period=="anual" else period} {year}'
    certificate = config.get('certificate',{})
    configured = bool(certificate.get('sha256') and config.get('certificate_thumbprint'))
    expiry = certificate.get('not_after','')[:10]
    environment = 'Presentación real' if config.get('environment')=='production' else 'Entorno de pruebas'
    selected = ''.join('<a href="'+BASE+'?periodo='+p+'"'+(' aria-current="page"' if p==period else '')+'>'+('Año' if p=='anual' else p)+'</a>' for p in PERIODS)
    original = current.get('snapshot')
    stale = False
    if entry and original:
        try:
            now,_ = candidate(current,entry['snapshot'].get('nrc',''))
            from aeat_submission import snapshot_data
            import base64
            stale = snapshot_data(now,base64.b64decode(original['payload']))!=entry['snapshot']
        except ValueError:
            stale = True
    elif entry and entry['state'] not in ('filed','accepted','receipt_pending','uncertain','submitting'):
        stale = True
    ended = period_has_ended(year,period)
    pending = entry and entry['state'] in ('submitting','uncertain','accepted','receipt_pending','filed')
    can_validate = bool(configured and original and not current.get('already_filed') and not pending)
    validation = (entry or {}).get('validation') or {}
    fresh = bool(validation.get('valid') is True and 0 <= time.time()-validation.get('validated_at',0) <= VALIDATION_TTL)
    same_identity = bool(entry and entry['certificate_sha256']==certificate.get('sha256') and entry['environment']==config.get('environment'))
    can_submit = bool(can_validate and entry and entry['state']=='validated' and not stale and ended and fresh and same_identity and config.get('allow_live_submission') is True)
    ready = 'Periodo ya presentado' if current.get('already_filed') else 'Versión aprobada y generada' if original else 'Pendiente de preparar'
    problem = current.get('problem','')
    coverage = str(current.get('coverage') or ('Revisión del ejercicio completo necesaria.' if period=='anual' else ''))
    prep = '/facturas/modelos/preparacion?periodo='+period
    amount = original['boxes'].get('71') if original and model=='303' else None
    summary = '<dl class="aeat-facts"><div><dt>Declarante</dt><dd>'+e(current['name'])+'</dd></div><div><dt>NIF</dt><dd>'+e(current['nif'])+'</dd></div>'
    if amount is not None:
        summary += '<div><dt>Resultado</dt><dd>'+e(amount)+' €</dd></div><div><dt>Modalidad</dt><dd>'+('Domiciliación · '+e(original['account']) if original.get('mode')=='U' else 'Ingreso · NRC del pago previo')+'</dd></div>'
    summary += '</dl>'
    source_panel = '<article class="feature-card"><h2>1. Preparación</h2><p><strong>'+e(ready)+'</strong></p>'+summary
    if not original and not current.get('already_filed'):
        source_panel += '<p>'+e(problem)+'</p>'
    if not ended and not current.get('already_filed'):
        source_panel += '<p>El periodo todavía no ha terminado. Puedes preparar la documentación; la presentación permanecerá cerrada hasta entonces.</p>'
    if not current.get('already_filed'):
        source_panel += '<a class="link-button" href="'+prep+'">'+('Ver preparación' if original else 'Preparar modelo')+'</a>'
    source_panel += '<details><summary>Cobertura de los datos</summary><p>'+e(coverage)+'</p><p>Datos incorporados hasta '+e(current.get('as_of',''))+'.</p></details></article>'
    errors = validation.get('errors',[])
    warnings = validation.get('warnings',[])
    validations = ''.join('<li>'+e(v)+'</li>' for v in errors)
    if validations:
        validations = '<ul class="aeat-errors">'+validations+'</ul>'
    if warnings:
        validations += '<details open><summary>Avisos de Hacienda</summary><ul>'+''.join('<li>'+e(v)+'</li>' for v in warnings)+'</ul></details>'
    nrc = ''
    if original and original.get('mode')=='I':
        nrc = '<label>NRC del pago realizado<input name="nrc" required pattern="[A-Za-z0-9]{22}" maxlength="22" autocomplete="off" value="'+e((entry or {}).get('snapshot',{}).get('nrc',''))+'"></label><p class="quiet">Kairo no realiza el pago. El NRC quedará vinculado a esta revisión.</p>'
    validation_panel = '<article class="feature-card"><h2>2. Validación en Hacienda</h2><p>Envía el fichero al servicio oficial para comprobar su formato y sus datos. Esta acción no presenta la declaración.</p>'
    if stale:
        validation_panel += '<p class="aeat-errors">La preparación ha cambiado. Valida la versión actual antes de presentar.</p>'
    elif entry and entry['state']=='validated' and (not fresh or not same_identity):
        validation_panel += '<p>Vuelve a validar: la comprobación ha caducado o ha cambiado el certificado o el entorno.</p>'
    validation_panel += validations+'<form id="aeat-validate">'+nrc+'<button class="primary"'+('' if can_validate else ' disabled')+'>Validar modelo</button></form></article>'
    status = LABELS.get(entry['state'],'Sin presentación') if entry else ('Presentación histórica archivada' if current.get('already_filed') else 'Sin presentación')
    filing = '<article class="feature-card"><h2>3. Presentación</h2><p><strong>'+e(status)+'</strong></p>'
    if entry and entry.get('last_error'):
        filing += '<p>'+e(entry['last_error'])+'</p>'
    if can_submit:
        filing += '<form id="aeat-submit"><p>Se enviará '+e(title)+' para '+e(current['name'])+', NIF '+e(current['nif'])+'.</p>'
        if amount is not None:
            filing += '<p><strong>Resultado: '+e(amount)+' €.</strong> '+('Domiciliación en '+e(original['account'])+'.' if original.get('mode')=='U' else 'Ingreso con el NRC revisado.')+'</p>'
        submit_label = 'Firmar y presentar en Hacienda' if config.get('environment')=='production' else 'Enviar al entorno de pruebas'
        filing += '<label class="aeat-check"><input type="checkbox" name="confirmed" required>He revisado los datos, los avisos, el periodo y la modalidad. Confirmo la presentación de esta declaración con mi certificado.</label><button class="primary">'+submit_label+'</button></form>'
    elif current.get('already_filed') and not entry:
        filing += '<p>El justificante y la referencia ya están en el archivo. No se vuelve a presentar este periodo.</p><a href="/facturas/modelos?periodo='+period+'">Ver documentos del periodo</a>'
    elif not entry or entry['state'] in ('prepared','validated','validating','rejected'):
        filing += '<p>Se habilita después de aprobar el modelo, validar esta versión y completar el periodo.</p><button disabled>Firmar y presentar en Hacienda</button>'
    if entry and entry['state'] in ('submitting','uncertain','accepted','receipt_pending'):
        filing += '<button type="button" data-aeat-action="recover">Consultar resultado / recuperar justificante</button><p class="quiet">Consulta el mismo intento; no vuelve a enviarlo.</p>'
    evidence = (entry or {}).get('evidence') or {}
    if evidence.get('receipt_path'):
        filing += '<a class="link-button" href="'+BASE+'/justificante?id='+entry['id']+'&periodo='+period+'" target="_blank" rel="noreferrer">Abrir justificante PDF</a>'
    if entry and entry['state']=='filed':
        marker = app.state/'aeat'/entry['id']/'archive.json'
        if not marker.is_file():
            filing += '<button type="button" data-aeat-action="archive">Completar archivo en el libro</button>'
        filing += '<p class="quiet">Presentar y pagar son estados distintos. El justificante conserva la respuesta de Hacienda.</p>'
        filing += '<p class="quiet">Si la publicación de los libros falla, pulsa «Actualizar datos» en Modelos. El justificante local se conserva.</p>'
    if evidence.get('csv'):
        filing += '<p>CSV: <code>'+e(evidence['csv'])+'</code></p>'
    recovery = evidence.get('recovery',{})
    if recovery.get('matches'):
        filing += '<details open><summary>Declaraciones encontradas para cotejar</summary><ul>'+''.join('<li>'+e(v.get('filed_at',''))+' · CSV '+e(v.get('csv',''))+'</li>' for v in recovery['matches'])+'</ul><p>La consulta no devuelve la huella del fichero. Comprueba el justificante antes de resolver este intento; no se reenviará automáticamente.</p></details>'
    filing += '</article>'
    connection = app.state/'aeat-connection.json'
    last = json.loads(connection.read_text()) if connection.is_file() else None
    cert_panel = '<details class="feature-card"><summary>Certificado y conexión</summary><p>'+('Certificado de Windows configurado · válido hasta '+e(expiry)+'.' if configured else 'Falta configurar el certificado de Windows.')+'</p><p>'+e(environment)+'. La clave permanece en el almacén del mini.</p><button type="button" data-aeat-action="check_connection"'+('' if configured else ' disabled')+'>Comprobar conexión con Hacienda</button>'
    cert_panel += '<p class="quiet">Windows puede pedirte permiso para usar el certificado. Atiende ese aviso en el mini. Si la acción caduca, cancela el aviso antiguo antes de volver a intentarlo.</p>'
    if last:
        cert_panel += '<p class="quiet">'+e(last['message'])+' '+e(last['at'][:16].replace('T',' '))+' UTC.</p>'
    else:
        cert_panel += '<p class="quiet">Conexión con certificado pendiente de comprobar.</p>'
    cert_panel += '</details>'
    past = ''
    if history:
        past = '<details class="feature-card"><summary>Operaciones conservadas</summary><ul>'+''.join('<li><a href="'+BASE+'?periodo='+period+'&id='+r['id']+'">'+e(LABELS.get(r['state'],r['state']))+'</a> · '+e(datetime.fromtimestamp(r['created']).strftime('%d/%m/%Y %H:%M'))+(' · ensayo' if r['simulation'] else '')+'</li>' for r in history)+'</ul></details>'
    context = dict(period=period,csrf=app.csrf,operation_id=entry['id'] if entry else '',
                   confirmation=store(app).confirmation(entry['id']) if entry else None)
    script = '''<script>(()=>{const ae=BOOT;let busy=false;const out=document.getElementById('aeat-result');async function act(data){if(busy)return;busy=true;out.textContent=data.action==='submit'?'Enviando la declaración. Si Windows pide usar el certificado, atiende el aviso. Conserva esta pantalla hasta recibir el resultado…':(data.action==='check_connection'||data.action==='recover'?'Consultando Hacienda. Si aparece Seguridad de Windows, autoriza el uso del certificado en el mini…':'Procesando la acción…');document.querySelectorAll('.aeat-page button').forEach(b=>b.disabled=true);try{const r=await fetch('/facturas/modelos/aeat',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':ae.csrf},body:JSON.stringify({...ae,...data})});const d=await r.json();if(!r.ok)throw Error(d.message||'Acción no confirmada');location.href=d.url;}catch(error){out.textContent=error.message+' Vuelve a cargar esta vista para comprobar el estado antes de repetir.';const a=document.createElement('a');a.href=location.pathname+location.search;a.textContent=' Volver a cargar';out.append(a);}finally{busy=false;}}document.getElementById('aeat-validate')?.addEventListener('submit',ev=>{ev.preventDefault();act({action:'validate',nrc:ev.target.elements.nrc?.value.trim()||''});});document.getElementById('aeat-submit')?.addEventListener('submit',ev=>{ev.preventDefault();if(ev.target.confirmed.checked)act({action:'submit',confirmation:{...ae.confirmation,confirmed:true}});});document.querySelectorAll('[data-aeat-action]').forEach(b=>b.addEventListener('click',()=>act({action:b.dataset.aeatAction})));addEventListener('beforeunload',ev=>{if(busy){ev.preventDefault();ev.returnValue='';}});})();</script>'''.replace('BOOT',json.dumps(context,ensure_ascii=False).replace('<','\\u003c'))
    return '<section class="local-page aeat-page"><div class="eyebrow">PRESENTACIÓN DIRECTA'+(' · ENSAYO SIN EFECTOS FISCALES' if config.get('environment')=='test' else '')+'</div><h1>'+e(title)+'</h1><nav class="aeat-periods" aria-label="Periodo fiscal">'+selected+'</nav><p id="aeat-result" role="status" aria-live="polite"></p>'+source_panel+validation_panel+filing+cert_panel+past+'</section>'+script

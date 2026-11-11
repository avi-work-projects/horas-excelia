"""Expense UI behind the existing owner/Origin/CSRF gates of Kairo."""
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from modelos_ui import e, page, button

BASE = '/facturas/modelos/gastos'
FIELDS = ('year','number','party','tax_id','date','period','base','vat','withholding','total',
          'include','mapping','rate','note','receipt_date','receipt_date_source',
          'reviewed_all_pages','single_invoice','fiscal_review_confirmed')


def store(runtime):
    from expense_workflow import ExpenseStore
    return ExpenseStore(Path(runtime)/'expenses')


def get(runtime, url, csrf):
    parsed = urlsplit(url)
    path = parsed.path.removeprefix('/facturas')
    if path not in ('/modelos/gastos','/modelos/gastos/pdf','/modelos/gastos/paquete'):
        return None
    try:
        queue = store(runtime)
        key = parse_qs(parsed.query).get('id',[''])[0]
        if path.endswith('/pdf'):
            return 200, queue.pdf(key), 'application/pdf', {'Content-Disposition':'inline; filename="gasto.pdf"'}
        if path.endswith('/paquete'):
            raw = json.dumps(queue.bundle(key), ensure_ascii=False, indent=2).encode('utf-8')
            return 200, raw, 'application/json; charset=utf-8', {'Content-Disposition':'attachment; filename="gasto-aprobado.json"'}
        try:
            sync = json.loads((Path(runtime)/'sync-status.json').read_text(encoding='utf-8'))
        except (OSError, ValueError):
            sync = None
        return 200, render(queue.get(key) if key else None, queue.list() if not key else [], csrf, sync)
    except (ValueError, OSError, KeyError, TypeError):
        return 409, page('<h1>Gasto no disponible</h1><p>El documento o su versión han cambiado. Vuelve a la bandeja para consultar el estado actual.</p>'+button(BASE,'Volver a Gastos'))


def post(runtime, path, data, actor):
    if path.removeprefix('/facturas') != '/modelos/gastos':
        return None
    queue = store(runtime)
    action = data.get('action')
    if action == 'upload':
        draft = queue.upload(data.get('filename',''), data.get('pdf',''), actor)
        message = 'PDF guardado. Revisa los datos propuestos y todas sus páginas.'
    elif action == 'edit':
        fields = data.get('fields')
        if not isinstance(fields,dict) or set(fields)-set(FIELDS):
            raise ValueError('Campos de gasto no válidos')
        draft = queue.update(data.get('id'), fields, data.get('revision'), actor)
        message = 'Datos guardados. Puedes revisar y aprobar esta versión.'
    elif action == 'approve':
        draft = queue.approve(data.get('id'), data.get('revision'), actor)
        message = 'Revisión aprobada. El gasto queda pendiente de incorporación al libro y de verificación de la copia.'
    else:
        raise ValueError('Acción de gasto no válida')
    return {'id':draft['id'],'revision':draft['revision'],'state':draft['state'],'message':message,
            'url':BASE+'?id='+draft['id']}


def input_field(fields, name, label, kind='text', required=False):
    value = fields.get(name,'')
    value = '' if value is None else value
    attributes = ' required' if required else ''
    if kind == 'money':
        kind = 'text'
        attributes += ' inputmode="decimal" pattern="-?[0-9]+[.][0-9]{2}" placeholder="0.00"'
    return f'<label>{e(label)}<input name="{name}" type="{kind}" value="{e(value)}"{attributes}></label>'


def render(draft, rows, csrf, sync=None):
    body = button('/facturas/modelos','Volver a Modelos')+'<h1>Gastos</h1>'
    if isinstance(sync,dict):
        if sync.get('state')=='pending':
            body += '<section class="m-card m-warning"><h2>Sincronización pendiente</h2><p>La actualización requiere revisión. Los gastos aprobados siguen conservados; Modelos puede mostrar la copia anterior.</p></section>'
        elif sync.get('state')=='verified' and sync.get('warnings'):
            body += '<section class="m-card m-warning"><h2>Documentos por revisar</h2><p>La última actualización terminó con documentos que necesitan revisión antes de incorporarlos. Los documentos ya verificados siguen disponibles.</p></section>'
        elif sync.get('state')=='verified':
            body += '<p class="m-note">Última sincronización verificada: '+e(sync.get('at',''))+'</p>'
    ctx = {'csrf':csrf,'id':draft['id'] if draft else '', 'revision':draft['revision'] if draft else ''}
    if draft is None:
        body += '''<section class="m-card"><h2>Añadir factura</h2><p>Adjunta un PDF con una sola factura. Sus datos quedarán como propuesta para revisar.</p><form id="expense-upload" class="m-form"><label>Factura en PDF<input name="pdf" type="file" accept="application/pdf,.pdf" required></label><button type="submit" class="k-primary">Subir y revisar</button></form><p class="m-note">Hasta 8 MB. Si el PDF es una imagen, podrás completar los datos a mano.</p></section><section class="m-card"><h2>Bandeja de gastos</h2>'''
        for row in rows:
            status = {'draft':'Para revisar','approved':'Aprobado · pendiente de incorporar','incorporated':'Incorporado al libro'}.get(row['state'],'Revisar estado')
            title = row.get('fields',{}).get('party') or row['filename']
            body += '<div class="m-document"><a class="k-link" href="'+BASE+'?id='+e(row['id'])+'">'+e(title)+'</a><p class="m-meta">'+e(status)+'</p></div>'
        if not rows: body += '<p>No hay gastos pendientes en esta bandeja.</p>'
        body += '</section>'
    else:
        f = dict(draft.get('fields',{}))
        f.setdefault('withholding','0.00')
        approved = draft['state'] != 'draft'
        state = {'draft':'Para revisar','approved':'Aprobado · pendiente de incorporar','incorporated':'Incorporado al libro'}.get(draft['state'],'Revisar estado')
        body += '<section class="m-card m-hero"><div class="m-status">'+e(state)+'</div><p>'+e(draft['filename'])+' · '+e(draft.get('pages',''))+' páginas</p><div class="m-actions">'+button(BASE+'/pdf?id='+draft['id'],'Abrir PDF completo')+'</div></section>'
        if draft.get('warnings'):
            warnings = '<ul class="m-list">'+''.join('<li>'+e(w)+'</li>' for w in draft['warnings'])+'</ul>'
            body += ('<details class="m-card"><summary>Observaciones de la extracción original</summary>'+warnings+'</details>' if approved else '<section class="m-card"><h2>Antes de aprobar</h2>'+warnings+'</section>')
        body += '<section class="m-card"><form id="expense-edit" class="m-form"><fieldset style="border:0;padding:0;margin:0;min-width:0"'+(' disabled' if approved else '')+'><div class="m-form"><h2>Datos de la factura</h2>'
        body += input_field(f,'party','Proveedor',required=True)+input_field(f,'tax_id','NIF o identificación fiscal',required=True)+input_field(f,'number','Número de factura',required=True)
        body += '<div class="m-columns">'+input_field(f,'date','Fecha de factura','date',True)+input_field(f,'year','Ejercicio','number',True)+'</div>'
        options = ''.join('<option value="'+q+'"'+(' selected' if f.get('period')==q else '')+'>'+q+'</option>' for q in ('1T','2T','3T','4T'))
        body += '<label>Trimestre de registro<select name="period">'+options+'</select></label>'
        body += '<div class="m-columns">'+''.join(input_field(f,key,label,'money',True) for key,label in [('base','Base imponible'),('vat','IVA documental'),('withholding','Retención'),('total','Total')])+'</div><p class="m-note">Importes con dos decimales y punto: 123.45. Deben coincidir con el PDF.</p>'
        body += '<div class="m-columns">'+input_field(f,'receipt_date','Fecha de recepción','date')+input_field(f,'receipt_date_source','Cómo se acredita la recepción')+'</div>'
        included = bool(f.get('include'))
        body += '<label>Tratamiento en este libro<select name="include"><option value="false"'+(' selected' if not included else '')+'>Excluido / pendiente</option><option value="true"'+(' selected' if included else '')+'>Gasto nacional · 21 %</option></select></label><p class="m-note">Las operaciones especiales necesitan revisión específica. El IVA y el IRPF pueden tener tratamientos distintos.</p>'
        body += '<label>Notas y motivo del tratamiento<textarea name="note" rows="3">'+e(f.get('note',''))+'</textarea></label>'
        for key,label in [('reviewed_all_pages','He revisado todas las páginas del PDF.'),('single_invoice','Este PDF contiene una sola factura, sin duplicados.'),('fiscal_review_confirmed','He revisado el tratamiento fiscal antes de incorporarlo al cálculo.')]:
            body += '<label class="m-check"><input type="checkbox" name="'+key+'"'+(' checked' if f.get(key) else '')+'><span>'+label+'</span></label>'
        if not approved:
            body += '<button type="submit" class="k-primary">Guardar revisión</button>'
        body += '</div></fieldset></form></section>'
        if not approved:
            body += '<section class="m-card"><h2>Confirmar incorporación</h2><p>Guarda primero cualquier cambio. La aprobación se vincula a esta versión exacta de la factura.</p><button type="button" id="expense-approve" class="k-primary">Aprobar revisión</button></section>'
        elif draft['state']=='incorporated':
            body += '<section class="m-card"><h2>Incorporación completada</h2><p>El gasto está incorporado en el libro de AUTONOMO. Consulta la fecha de sincronización de Modelos para comprobar su copia.</p><div class="m-actions">'+button('/facturas/modelos','Ver Modelos')+button(BASE,'Volver a la bandeja')+'</div></section>'
        else:
            body += '<section class="m-card"><h2>Siguiente paso</h2><p>La incorporación actualizará el archivo y el libro de AUTONOMO. El resultado aparecerá en Modelos cuando se haya verificado la copia.</p><div class="m-actions">'+button(BASE,'Volver a la bandeja')+'</div><details><summary>Paquete de recuperación</summary><p class="m-note">Conserva PDF, datos y aprobación para incorporar esta versión de forma segura.</p>'+button(BASE+'/paquete?id='+draft['id'],'Descargar paquete aprobado')+'</details></section>'
        if draft.get('text_excerpt'):
            body += '<details class="m-card"><summary>Texto detectado en el PDF</summary><pre>'+e(draft['text_excerpt'])+'</pre></details>'
    boot = json.dumps(ctx,ensure_ascii=False).replace('<','\\u003c')
    script = r'''<p id="expense-feedback" class="m-feedback" role="status" aria-live="polite"></p><script>
(()=>{const ctx=BOOT, endpoint='/facturas/modelos/gastos';let dirty=false;
const output=document.getElementById('expense-feedback');
const busy=v=>document.querySelectorAll('.modelos button').forEach(b=>b.disabled=v);
async function send(body){busy(true);output.textContent='Guardando…';try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':ctx.csrf},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.message||'No se pudo completar la operación.');location.href=d.url;}catch(err){output.textContent=err.message;output.scrollIntoView({block:'center',behavior:'smooth'});busy(false);}}
const upload=document.getElementById('expense-upload');upload?.addEventListener('submit',async ev=>{ev.preventDefault();const file=upload.elements.pdf.files[0];if(!file)return;if(file.size>8*1024*1024){output.textContent='El PDF supera 8 MB.';return;}try{const bytes=new Uint8Array(await file.arrayBuffer());let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));await send({action:'upload',filename:file.name,pdf:btoa(text)});}catch(err){output.textContent=err.message;}});
const editor=document.getElementById('expense-edit');editor?.addEventListener('input',()=>{dirty=true;});editor?.addEventListener('submit',ev=>{ev.preventDefault();const f=Object.fromEntries(new FormData(editor));f.year=Number(f.year);f.include=f.include==='true';f.mapping=f.include?'domestic21':'pending';f.rate=f.include?'21.00':'0.00';for(const k of ['reviewed_all_pages','single_invoice','fiscal_review_confirmed'])f[k]=editor.elements[k].checked;send({action:'edit',id:ctx.id,revision:ctx.revision,fields:f});});
document.getElementById('expense-approve')?.addEventListener('click',()=>{if(dirty){output.textContent='Guarda los cambios antes de aprobar esta versión.';output.scrollIntoView({block:'center'});return;}send({action:'approve',id:ctx.id,revision:ctx.revision});});})();</script>'''.replace('BOOT',boot)
    return page(body+script,'Gastos')

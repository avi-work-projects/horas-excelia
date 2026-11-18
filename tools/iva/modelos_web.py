"""Expense UI behind the existing owner/Origin/CSRF gates of Kairo."""
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, urlsplit, urlencode
from modelos_ui import e, euro, page, button, navigation

BASE = '/facturas/modelos/gastos'
FIELDS = ('year','number','party','tax_id','date','period','base','vat','withholding','total',
          'include','mapping','rate','note','receipt_date','receipt_date_source',
          'reviewed_all_pages','single_invoice','fiscal_review_confirmed',
          'expense_policy_version','category','tax_scope','irpf_treatment',
          'business_purpose','buyer_tax_id','invoice_status','order_reference','buyer_identity_confirmed')
CATEGORIES = {'general':'Gasto general','equipment':'Equipo / material','telecom':'Telefonía / internet',
              'electricity':'Luz','gas':'Gas','other':'Otro gasto'}
SCOPES = {'iva_irpf':'IVA e IRPF','irpf_only':'Solo Renta · sin IVA','excluded':'Excluido','review':'Por decidir'}
IRPF = {'pending':'Pendiente de revisar','current_expense':'Gasto del ejercicio','asset':'Bien / amortización','excluded':'No incluir en Renta'}
INVOICES = {'complete':'Factura completa','needs_invoice':'Falta pedir factura','needs_review':'Por revisar'}
STATES = {'draft':'Para revisar','approved':'Aprobado · pendiente de incorporar','incorporated':'Incorporado al libro'}


def filters_from_query(query):
    filters = {key:query.get(key,['todos'])[0] for key in ('estado','alcance','categoria')}
    for key,allowed in [('estado',STATES),('alcance',SCOPES),('categoria',CATEGORIES)]:
        if filters[key] != 'todos' and filters[key] not in allowed:
            raise ValueError('Filtro de gastos no válido')
    return filters


def display_fields(row):
    fields = dict(row.get('fields',{}))
    # Legacy approvals remain untouched. Defaults are only displayed for review.
    defaults = dict(category='general',tax_scope='iva_irpf' if fields.get('include') else 'review',
                    irpf_treatment='pending',invoice_status='needs_review',withholding='0.00',rate='21.00')
    return defaults | fields


def filtered_rows(rows, filters):
    result = []
    for row in rows:
        fields = display_fields(row)
        values = {'estado':row['state'],'alcance':fields['tax_scope'],'categoria':fields['category']}
        if all(filters.get(key,'todos') in ('todos',value) for key,value in values.items()):
            result.append(row)
    return result


def next_pending(rows, ident):
    return next((row for row in rows if row['id'] != ident and row['state']=='draft'),None)


def draft_total(value):
    try:
        return euro(value or None)
    except (ArithmeticError, ValueError, TypeError):
        return 'Por revisar'


def store(runtime):
    from expense_workflow import ExpenseStore
    return ExpenseStore(Path(runtime)/'expenses')


def get(runtime, url, csrf):
    parsed = urlsplit(url)
    path = parsed.path.removeprefix('/facturas')
    if path == '/modelos/actualizacion':
        from model_events import status
        try:
            return 200, json.dumps(status(runtime),ensure_ascii=False), 'application/json; charset=utf-8', {'Cache-Control':'no-store'}
        except Exception:
            return 503, json.dumps({'state':'error','message':'No se puede consultar el estado de actualización. Vuelve a intentarlo.'}), 'application/json; charset=utf-8', {'Cache-Control':'no-store'}
    if path not in ('/modelos/gastos','/modelos/gastos/pdf','/modelos/gastos/paquete'):
        return None
    try:
        queue = store(runtime)
        query = parse_qs(parsed.query)
        key = query.get('id',[''])[0]
        if path.endswith('/pdf'):
            return 200, queue.pdf(key), 'application/pdf', {'Content-Disposition':'inline; filename="gasto.pdf"'}
        if path.endswith('/paquete'):
            raw = json.dumps(queue.bundle(key), ensure_ascii=False, indent=2).encode('utf-8')
            return 200, raw, 'application/json; charset=utf-8', {'Content-Disposition':'attachment; filename="gasto-aprobado.json"'}
        try:
            sync = json.loads((Path(runtime)/'sync-status.json').read_text(encoding='utf-8'))
        except (OSError, ValueError):
            sync = None
        return 200, render(queue.get(key) if key else None, queue.list(), csrf, sync,
                           query.get('actualizacion')==['pendiente'], filters_from_query(query))
    except (ValueError, OSError, KeyError, TypeError):
        return 409, page('<h1>Gasto no disponible</h1><p>El documento o su versión han cambiado. Vuelve a la bandeja para consultar el estado actual.</p>'+button(BASE,'Volver a Gastos'))


def post(runtime, path, data, actor):
    path = path.removeprefix('/facturas')
    if path == '/modelos/actualizar':
        from model_events import request
        try:
            return request(runtime,'manual',actor)
        except Exception:
            raise ValueError('No se ha podido solicitar la actualización. Vuelve a intentarlo.') from None
    if path != '/modelos/gastos':
        return None
    queue = store(runtime)
    action = data.get('action')
    update_failed = False
    duplicate = False
    if action == 'upload':
        existing = {row['id'] for row in queue.list()}
        draft = queue.upload(data.get('filename',''), data.get('pdf',''), actor)
        duplicate = draft['id'] in existing
        message = 'Este PDF ya estaba en la bandeja; se conserva su revisión.' if duplicate else 'PDF guardado. Revisa los datos propuestos y todas sus páginas.'
    elif action == 'edit':
        fields = data.get('fields')
        if not isinstance(fields,dict) or set(fields)-set(FIELDS):
            raise ValueError('Campos de gasto no válidos')
        draft = queue.update(data.get('id'), fields, data.get('revision'), actor)
        message = 'Datos guardados. Puedes revisar y aprobar esta versión.'
    elif action == 'approve':
        draft = queue.approve(data.get('id'), data.get('revision'), actor)
        message = 'Revisión aprobada. El gasto queda pendiente de incorporación al libro y de verificación de la copia.'
        from model_events import request
        try:
            request(runtime,'expense',actor)
        except Exception:
            # The approval is durable even when its separate update request fails.
            update_failed = True
            message += ' No se ha podido solicitar la actualización; usa Actualizar datos en Modelos.'
    else:
        raise ValueError('Acción de gasto no válida')
    url = BASE+'?id='+draft['id']+('&actualizacion=pendiente' if update_failed else '')
    if action=='edit' and data.get('next') is True:
        following = next_pending(queue.list(),draft['id'])
        url = BASE+'?id='+following['id'] if following else BASE
    return {'id':draft['id'],'revision':draft['revision'],'state':draft['state'],'message':message,
            'url':url,'duplicate':duplicate}


def input_field(fields, name, label, kind='text', required=False):
    value = fields.get(name,'')
    value = '' if value is None else value
    attributes = ' required' if required else ''
    if kind == 'money':
        kind = 'text'
        attributes += ' inputmode="decimal" pattern="-?[0-9]+([.,][0-9]{1,2})?" placeholder="0,00"'
    return f'<label>{e(label)}<input name="{name}" type="{kind}" value="{e(value)}"{attributes}></label>'


def select_field(fields, name, label, options):
    choices = ''.join('<option value="'+e(value)+'"'+(' selected' if fields.get(name)==value else '')+'>'+e(text)+'</option>' for value,text in options.items())
    return '<label>'+e(label)+'<select name="'+e(name)+'">'+choices+'</select></label>'


def invoice_help(fields):
    order = fields.get('order_reference') or '[referencia del pedido]'
    buyer = fields.get('buyer_tax_id') or '[mi NIF]'
    text = f'Hola, necesito la factura completa del pedido {order}.\n\nDatos del destinatario:\nNombre y apellidos: [completar]\nNIF: {buyer}\nDomicilio fiscal: [completar]\n\nPor favor, incluid número y fecha de factura, identificación del proveedor y del destinatario, concepto, base imponible, tipo y cuota de IVA y total.\n\nGracias.'
    return '<details class="m-card m-invoice-help"><summary>Ayuda para pedir una factura</summary><p>Comprueba el vendedor que figura en el pedido. Completa tus datos antes de copiar el texto y enviarlo por tu cuenta.</p><ul class="m-list"><li>Factura del proveedor; el pedido o justificante de pago puede no ser suficiente.</li><li>Nombre, NIF y domicilio fiscal del destinatario correctos.</li><li>Concepto, fecha, número e importes legibles.</li></ul><label class="m-form">Texto para copiar<textarea id="invoice-request-text" rows="8">'+e(text)+'</textarea></label><div class="m-actions"><button type="button" id="copy-invoice-request" class="m-button">Copiar texto</button></div><p id="copy-feedback" class="m-note" role="status"></p></details>'


def original_pdf_link(url):
    return '<a class="m-button" href="'+e(url)+'" target="_blank" rel="noopener">Abrir PDF completo</a>'


def render_queue(rows, filters):
    visible = filtered_rows(rows,filters)
    body = '''<section class="m-card m-expense-upload"><div><h2>Añadir PDF a la bandeja</h2><p>Selecciona varias facturas para subirlas una a una. Cada PDF debe contener una sola factura.</p><p class="m-note">Máximo 8 MB por archivo. El texto extraíble sirve como propuesta; si el PDF es una imagen, completa sus datos a mano.</p></div><form id="expense-upload" class="m-form"><label>Facturas en PDF<input name="pdf" type="file" accept="application/pdf,.pdf" multiple required></label><button type="submit" class="k-primary">Subir archivos</button></form><div id="expense-batch" hidden style="grid-column:1/-1"><h3>Resultado de la subida</h3><p id="expense-batch-summary" role="status" aria-live="polite"></p><ol id="expense-batch-results" class="m-batch-results"></ol><div class="m-actions">'''+button(BASE,'Ver bandeja actualizada')+'''</div></div></section>'''
    body += '<section class="m-card"><div class="m-summary-line"><h2>Facturas subidas</h2>'+button('/facturas/modelos?vista=gastos','Ver gastos registrados')+'</div><p class="m-note">Esta bandeja conserva los PDF y sus revisiones. Los gastos registrados del libro se consultan por separado.</p><form method="get" action="'+BASE+'" class="m-form m-filters">'
    body += select_field(filters,'estado','Estado',{'todos':'Todos los estados'}|STATES)
    body += select_field(filters,'alcance','Destino fiscal',{'todos':'Todos los destinos'}|SCOPES)
    body += select_field(filters,'categoria','Categoría',{'todos':'Todas las categorías'}|CATEGORIES)
    body += '<button type="submit" class="m-button">Filtrar</button></form><p class="m-note">'+str(len(visible))+' de '+str(len(rows))+' documentos</p><ul class="m-expense-list">'
    for row in visible:
        fields = display_fields(row)
        title = fields.get('party') or row['filename']
        url = BASE+'?'+urlencode({'id':row['id']}|{k:v for k,v in filters.items() if v!='todos'})
        meta = ' · '.join(str(value) for value in (fields.get('date'),fields.get('number'),fields.get('period')) if value)
        scope = SCOPES.get(fields['tax_scope'],'Por decidir')
        if not row.get('fields',{}).get('expense_policy_version'):
            scope += ' · ficha anterior pendiente de clasificar'
        body += '<li class="m-expense-row"><div><a href="'+e(url)+'"><strong>'+e(title)+'</strong></a><p class="m-meta">'+e(meta or row['filename'])+'</p><span class="m-tag">'+e(STATES.get(row['state'],'Revisar estado'))+'</span></div><div class="m-expense-classification"><p>'+e(scope)+'</p><p class="m-meta">'+e(CATEGORIES.get(fields['category'],'Otro gasto'))+' · '+e(INVOICES.get(fields['invoice_status'],'Por revisar'))+'</p></div><strong class="m-doc-total">'+e(draft_total(fields.get('total')))+'</strong></li>'
    if not visible:
        body += '<li><p>'+('No hay documentos con estos filtros.' if rows else 'Todavía no hay PDF en esta bandeja. Puedes añadirlos arriba.')+'</p></li>'
    return body+'</ul></section>'


def render_review(draft, rows):
    from expense_policy import scope_reason
    fields = display_fields(draft)
    approved = draft['state'] != 'draft'
    following = next_pending(rows,draft['id'])
    pdf_url = BASE+'/pdf?id='+draft['id']
    body = '<div class="m-summary-line"><div><span class="m-tag">'+e(STATES.get(draft['state'],'Revisar estado'))+'</span><h2 style="margin-top:12px">'+e(fields.get('party') or draft['filename'])+'</h2><p class="m-meta">'+e(draft['filename'])+' · '+e(draft.get('pages',''))+' páginas</p></div><div class="m-actions">'+button(BASE,'Volver a la bandeja')+original_pdf_link(pdf_url)+'</div></div>'
    if not draft.get('fields',{}).get('expense_policy_version'):
        body += '<p class="m-note">Ficha anterior a esta clasificación. Los nuevos campos no acreditan una revisión previa. Los registros ya aprobados conservan sus datos originales.</p>'
    body += '<div class="m-expense-layout"><aside class="m-expense-preview"><details class="m-card" id="expense-preview" data-pdf-url="'+e(pdf_url)+'"><summary>Vista previa del PDF</summary><p class="m-note">Revisa todas las páginas del documento.</p><p id="expense-pdf-status" class="m-note" role="status"></p>'+original_pdf_link(pdf_url)+'<iframe id="expense-pdf-frame" title="PDF original de la factura" hidden></iframe></details>'
    if draft.get('warnings'):
        body += '<details class="m-card"><summary>Observaciones del documento</summary><ul class="m-list">'+''.join('<li>'+e(w)+'</li>' for w in draft['warnings'])+'</ul></details>'
    if draft.get('text_excerpt'):
        body += '<details class="m-card"><summary>Texto extraído del PDF</summary><p class="m-note">Es una ayuda para revisar el documento, no una validación de sus datos.</p><pre>'+e(draft['text_excerpt'])+'</pre></details>'
    body += invoice_help(fields)+'</aside><div class="m-expense-fields"><section class="m-card"><form id="expense-edit" class="m-form"><fieldset style="border:0;padding:0;margin:0;min-width:0"'+(' disabled' if approved else '')+'><div class="m-form"><h2>Datos del documento</h2>'
    body += input_field(fields,'party','Proveedor')+'<div class="m-columns">'+input_field(fields,'tax_id','NIF del proveedor')+input_field(fields,'number','Número de factura')+'</div>'
    body += '<div class="m-columns">'+input_field(fields,'date','Fecha de factura','date')+input_field(fields,'year','Ejercicio','number')+'</div>'
    body += '<div class="m-columns">'+select_field(fields,'period','Trimestre de registro',{'':'Selecciona'}|{q:q for q in ('1T','2T','3T','4T')})+select_field(fields,'invoice_status','Estado del documento',INVOICES)+'</div>'
    body += '<div class="m-columns">'+input_field(fields,'buyer_tax_id','NIF del destinatario')+input_field(fields,'order_reference','Referencia de pedido')+'</div>'
    body += '<label class="m-check"><input type="checkbox" name="buyer_identity_confirmed"'+(' checked' if fields.get('buyer_identity_confirmed') else '')+'><span>He cotejado los datos del destinatario con la factura.</span></label>'
    body += '<h2 class="m-review-section">Importes del PDF</h2><div class="m-columns">'+''.join(input_field(fields,key,label,'money') for key,label in [('base','Base imponible'),('vat','Cuota de IVA'),('withholding','Retención'),('total','Total'),('rate','Tipo de IVA (%)')])+'</div><p class="m-note">Puedes usar coma o punto decimal, sin separador de miles. Copia los importes del documento aunque su IVA no entre en el cálculo.</p>'
    body += '<h2 class="m-review-section">Destino fiscal</h2><div class="m-columns">'+select_field(fields,'category','Categoría',CATEGORIES)+select_field(fields,'tax_scope','Destino del gasto',SCOPES)+'</div>'
    body += '<p id="expense-scope-note" class="m-note">'+e(scope_reason(fields) or 'Requiere revisión expresa del documento y su tratamiento. La categoría no acredita deducibilidad.')+'</p>'
    treatments = {'pending':'Pendiente de decidir', 'domestic21':'Operación nacional al 21 %', 'eu_services21':'Servicio corriente de otro país UE · autoliquidación 21 %'}
    if fields.get('mapping') == 'historical_domestic21':
        treatments['historical_domestic21'] = 'Nacional 21 % · registro histórico'
    body += select_field(fields,'mapping','Tratamiento del IVA',treatments)
    body += '<div class="m-columns">'+input_field(fields,'reverse_charge_rate','Tipo de autoliquidación (%)','money')+input_field(fields,'deductible_percentage','Porcentaje deducible (%)','money')+'</div><p class="m-note">Solo para servicios corrientes de otro país UE: indica expresamente 21,00 y 100,00. Conserva tipo y cuota del PDF en cero. El NIF-IVA se comprueba por formato y país; esto no valida su alta en VIES. Otros supuestos requieren revisión específica.</p>'
    body += '<p class="m-note">Antes de aprobar servicios UE, revisa la situación NIF-IVA/ROI y la obligación informativa del modelo 349. Este tratamiento se refleja en los cálculos 303/390 y en el Excel de consulta; su exportación LSI o importación en OPEN no está habilitada.</p>'
    body += select_field(fields,'irpf_treatment','Tratamiento para revisar en Renta',IRPF)+'<p class="m-note">Esta clasificación no calcula ni confirma una deducción en Renta. Luz y gas se conservan para esa revisión, sin incorporarse al IVA.</p>'
    body += '<label>Uso profesional del gasto<textarea name="business_purpose" rows="2" maxlength="500">'+e(fields.get('business_purpose',''))+'</textarea></label>'
    body += '<label>Notas y motivo del tratamiento<textarea name="note" rows="3" maxlength="2000">'+e(fields.get('note',''))+'</textarea></label>'
    body += '<details><summary>Fecha de recepción del documento</summary><div class="m-columns" style="margin-top:12px">'+input_field(fields,'receipt_date','Fecha de recepción','date')+input_field(fields,'receipt_date_source','Cómo se acredita')+'</div></details>'
    body += '<h2 class="m-review-section">Revisión de esta versión</h2>'
    for key,label in [('reviewed_all_pages','He revisado todas las páginas del PDF.'),('single_invoice','Este PDF contiene una sola factura, sin duplicados.'),('fiscal_review_confirmed','He revisado el tratamiento fiscal para incorporar su IVA.')]:
        body += '<label class="m-check"><input type="checkbox" name="'+key+'"'+(' checked' if fields.get(key) else '')+'><span>'+label+'</span></label>'
    if not approved:
        body += '<p class="m-note">Guardar conserva el borrador. Aprobar comprueba los datos necesarios y solicita su incorporación según el destino elegido.</p><div class="m-actions"><button type="submit" class="k-primary">Guardar revisión</button>'
        if following:
            body += '<button type="submit" name="next" value="true" class="m-button">Guardar y siguiente</button>'
        body += '</div>'
    body += '</div></fieldset></form></section>'
    if not approved:
        body += '<section class="m-card"><h2>Confirmar incorporación</h2><p>Guarda primero los cambios. La aprobación queda vinculada a esta versión del documento; los gastos de Renta mantienen pendiente su deducibilidad.</p><button type="button" id="expense-approve" class="k-primary">Aprobar revisión</button></section>'
    elif draft['state']=='incorporated':
        body += '<section class="m-card"><h2>Incorporación completada</h2><p>El documento está incorporado al libro de AUTONOMO con su destino fiscal. Revisa la fecha de actualización de la copia de consulta.</p>'+button('/facturas/modelos?vista=gastos','Ver gastos registrados')+'</section>'
    else:
        body += '<section class="m-card"><h2>Pendiente de incorporar</h2><p>La aprobación ha solicitado actualizar el libro. El mini debe estar disponible para completar la incorporación. Puedes consultar el estado desde Modelos.</p>'+button('/facturas/modelos?vista=modelos','Ver estado de actualización')+'<details><summary>Paquete de recuperación</summary>'+button(BASE+'/paquete?id='+draft['id'],'Descargar paquete aprobado')+'</details></section>'
    return body+'</div></div>'


BATCH_SCRIPT = r'''
async function uploadExpenseFiles(files,post,progress){
 const results=[];
 for(let index=0;index<files.length;index++){
  const file=files[index];progress({index,name:file.name,state:'uploading',message:'Subiendo…'});
  let result;
  try{
   if(!/\.pdf$/i.test(file.name))throw Error('Selecciona un archivo PDF.');
   if(file.size>8*1024*1024)throw Error('El PDF supera 8 MB.');
   const bytes=new Uint8Array(await file.arrayBuffer());let text='';
   for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));
   const response=await post({action:'upload',filename:file.name,pdf:btoa(text)});
   result={index,name:file.name,state:response.duplicate?'duplicate':'saved',message:response.message,url:response.url};
  }catch(error){result={index,name:file.name,state:'error',message:error.message||'No se pudo subir este archivo.'};}
  results.push(result);progress(result);
 }
 return results;
}
'''


PDF_SCRIPT = r'''
async function fetchExpensePdf(url,request){
 const response=await request(url,{credentials:'same-origin',cache:'no-store'});
 if(!response.ok||(response.headers.get('Content-Type')||'').split(';')[0].trim().toLowerCase()!=='application/pdf')throw Error('PDF no disponible');
 const blob=await response.blob();
 if(await blob.slice(0,5).text()!=='%PDF-')throw Error('PDF no compatible');
 return blob;
}
'''


def render(draft, rows, csrf, sync=None, update_failed=False, filters=None):
    filters = filters or dict(estado='todos',alcance='todos',categoria='todos')
    body = navigation('gastos')+'<h1>Gastos</h1>'
    if update_failed:
        body += '<section class="m-card m-warning"><h2>Aprobación guardada</h2><p>No se pudo solicitar su actualización. Abre Modelos y pulsa Actualizar datos para continuar; no necesitas volver a aprobar este gasto.</p>'+button('/facturas/modelos?vista=modelos','Ir a Modelos')+'</section>'
    if isinstance(sync,dict):
        if sync.get('state')=='pending':
            body += '<section class="m-card m-warning"><h2>Sincronización pendiente</h2><p>La actualización requiere revisión. Los gastos aprobados siguen conservados; la consulta puede mostrar la copia anterior.</p></section>'
        elif sync.get('state')=='verified' and sync.get('warnings'):
            body += '<section class="m-card m-warning"><h2>Documentos por revisar</h2><p>La última actualización terminó con documentos que necesitan revisión antes de incorporarlos.</p></section>'
        elif sync.get('state')=='verified':
            body += '<p class="m-note">Última sincronización verificada: '+e(sync.get('at',''))+'</p>'
    body += render_queue(rows,filters) if draft is None else render_review(draft,rows)
    ctx = {'csrf':csrf,'id':draft['id'] if draft else '', 'revision':draft['revision'] if draft else ''}
    boot = json.dumps(ctx,ensure_ascii=False).replace('<','\\u003c')
    script = r'''<p id="expense-feedback" class="m-feedback" role="status" aria-live="polite"></p><script>
(()=>{const ctx=BOOT,endpoint='/facturas/modelos/gastos';let dirty=false,inFlight=false;
BATCH
PDF_LOADER
const output=document.getElementById('expense-feedback');
async function api(body){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':ctx.csrf},body:JSON.stringify(body)});let data;try{data=await response.json()}catch{throw Error('El servicio no devolvió una respuesta válida. Puedes volver a intentarlo.')}if(!response.ok)throw Error(data.message||'No se pudo completar la operación.');return data;}
const controls=()=>[...document.querySelectorAll('#expense-edit button,#expense-approve,#expense-upload button')];
function busy(value){inFlight=value;controls().forEach(button=>button.disabled=value);}
async function save(body){busy(true);output.textContent='Guardando…';try{const result=await api(body);dirty=false;inFlight=false;location.href=result.url;}catch(error){output.textContent=error.message;output.scrollIntoView({block:'center',behavior:'smooth'});busy(false);}}
const upload=document.getElementById('expense-upload');
upload?.addEventListener('submit',async event=>{event.preventDefault();const files=[...upload.elements.pdf.files];if(!files.length)return;busy(true);document.getElementById('expense-batch').hidden=false;const list=document.getElementById('expense-batch-results'),summary=document.getElementById('expense-batch-summary');const nodes=files.map(file=>{const item=document.createElement('li');list.append(item);return item});
const results=await uploadExpenseFiles(files,api,result=>{const item=nodes[result.index];item.replaceChildren();const name=document.createElement('strong');name.textContent=result.name;const status=document.createElement('span');status.textContent=({uploading:'Subiendo',saved:'Guardado',duplicate:'Ya estaba subido',error:'No subido'}[result.state])+': '+result.message;item.append(name,status);if(result.url){const link=document.createElement('a');link.href=result.url;link.textContent='Abrir revisión';item.append(link);}summary.textContent='Procesando '+(result.index+1)+' de '+files.length+' archivos…';});
summary.textContent=results.filter(r=>r.state==='saved').length+' guardados · '+results.filter(r=>r.state==='duplicate').length+' ya existentes · '+results.filter(r=>r.state==='error').length+' con error. Los archivos guardados se conservan.';upload.reset();busy(false);});
const editor=document.getElementById('expense-edit');
editor?.addEventListener('input',()=>{dirty=true;});
function scopeHint(categoryChanged=false){if(!editor)return;const f=editor.elements;const utility=['electricity','gas'].includes(f.category.value);if(utility&&(f.tax_scope.value==='iva_irpf'||(categoryChanged&&f.tax_scope.value==='review'))){f.tax_scope.value='irpf_only';f.irpf_treatment.value='pending';dirty=true;}if(f.tax_scope.value==='excluded')f.irpf_treatment.value='excluded';const message={irpf_only:'Archivado para revisar en Renta; sin deducción IRPF calculada y fuera del cálculo de IVA.',excluded:'Excluido del cálculo de IVA y del expediente de deducciones IRPF.',review:'Pendiente de revisión fiscal; no incluido en IVA ni aprobado como deducible en IRPF.',iva_irpf:'Requiere factura completa, destinatario cotejado y tratamiento fiscal elegido expresamente. Los servicios UE admitidos autoliquidan 21 % y deducen 100 % sin cambiar el IVA cero del PDF.'};document.getElementById('expense-scope-note').textContent=utility?'Luz y gas: revisión pendiente de Renta, sin incorporarlos al IVA.':message[f.tax_scope.value];}
editor?.elements.category.addEventListener('change',()=>scopeHint(true));editor?.elements.tax_scope.addEventListener('change',()=>scopeHint());
editor?.addEventListener('submit',event=>{event.preventDefault();const fields=Object.fromEntries(new FormData(editor));if(fields.year)fields.year=Number(fields.year);else delete fields.year;fields.expense_policy_version=1;fields.include=fields.tax_scope==='iva_irpf';if(!fields.include)fields.mapping='pending';for(const key of ['base','vat','withholding','total','rate','reverse_charge_rate','deductible_percentage']){if(fields[key]){const parts=fields[key].replace(',','.').split('.');fields[key]=parts[0]+'.'+(parts[1]||'').padEnd(2,'0');}}for(const key of ['reviewed_all_pages','single_invoice','fiscal_review_confirmed','buyer_identity_confirmed'])fields[key]=editor.elements[key].checked;save({action:'edit',id:ctx.id,revision:ctx.revision,fields,next:event.submitter?.name==='next'});});
document.getElementById('expense-approve')?.addEventListener('click',()=>{if(dirty){output.textContent='Guarda los cambios antes de aprobar esta versión.';output.scrollIntoView({block:'center'});return;}save({action:'approve',id:ctx.id,revision:ctx.revision});});
const preview=document.getElementById('expense-preview'),pdfFrame=document.getElementById('expense-pdf-frame'),pdfStatus=document.getElementById('expense-pdf-status');let pdfObjectUrl=null,pdfLoading=false;
preview?.addEventListener('toggle',async()=>{if(!preview.open||pdfObjectUrl||pdfLoading)return;pdfLoading=true;pdfStatus.textContent='Cargando PDF…';try{const blob=await fetchExpensePdf(preview.dataset.pdfUrl,fetch);pdfObjectUrl=URL.createObjectURL(blob);pdfFrame.src=pdfObjectUrl;pdfFrame.hidden=false;pdfStatus.textContent='Si el visor no aparece, abre el PDF completo en otra pestaña.';}catch{pdfStatus.textContent='La vista previa no está disponible. Abre el PDF completo en otra pestaña.';}finally{pdfLoading=false;}});
pdfFrame?.addEventListener('error',()=>{pdfStatus.textContent='No se ha podido mostrar el visor. Abre el PDF completo en otra pestaña.';});
addEventListener('pagehide',()=>{if(pdfObjectUrl){URL.revokeObjectURL(pdfObjectUrl);pdfObjectUrl=null;}});
addEventListener('pageshow',event=>{if(event.persisted&&preview){preview.open=false;pdfFrame.hidden=true;pdfFrame.removeAttribute('src');pdfStatus.textContent='Abre la vista previa para cargar el documento.';}});
document.getElementById('copy-invoice-request')?.addEventListener('click',async()=>{const text=document.getElementById('invoice-request-text'),feedback=document.getElementById('copy-feedback');try{await navigator.clipboard.writeText(text.value);feedback.textContent='Texto copiado. Revisa los datos antes de enviarlo.';}catch{text.focus();text.select();feedback.textContent='Selecciona y copia el texto. No se ha enviado ningún mensaje.';}});
addEventListener('beforeunload',event=>{if(dirty||inFlight){event.preventDefault();event.returnValue='';}});
})();</script>'''.replace('BATCH',BATCH_SCRIPT).replace('PDF_LOADER',PDF_SCRIPT).replace('BOOT',boot)
    return page(body+script,'Gastos',wide=True)

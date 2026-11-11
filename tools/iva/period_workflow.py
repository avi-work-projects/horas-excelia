"""Private preparation and evidence workflow. No network, signature or filing."""
import base64
from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import html
import io
import json
from pathlib import Path
import sqlite3
from urllib.parse import parse_qs, urlsplit
from closing import Store, confined, digest, read
from ledger import calculate, verify_sources
from export_303_test import load_design, serialize

BASE = '/facturas/modelos/preparacion'
CHECKS = {
    'coverage': 'He incorporado todos los ingresos y gastos de este periodo y revisado los excluidos.',
    'fiscal': 'He revisado el tratamiento fiscal de los documentos incorporados.',
    'profile': 'Confirmo régimen general exclusivo, 100 % Estado, sin régimen simplificado, tributación conjunta, criterio de caja, concurso ni SII.',
    'adjustments': 'Confirmo que no hay compensaciones anteriores, devoluciones, rectificaciones ni otros ajustes en este periodo.',
    'annual': 'Para el 4T: confirmo obligación de 390, sin prorrata especial ni regularizaciones anuales o de bienes de inversión.',
}
e = lambda value: html.escape(str(value), quote=True)

@contextmanager
def connect(runtime):
    runtime = Path(runtime)
    runtime.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(runtime/'periods.sqlite', timeout=15)
    db.execute('CREATE TABLE IF NOT EXISTS reviews (period TEXT PRIMARY KEY, data TEXT)')
    db.execute('CREATE TABLE IF NOT EXISTS evidence (id INTEGER PRIMARY KEY, period TEXT, data TEXT)')
    try:
        with db:
            yield db
    finally:
        db.close()

def context(runtime):
    config = read(Path(runtime)/'config.json')
    root = Path(config['archive_root']).resolve()
    ledger_path = confined(root, config['ledger'])
    raw = ledger_path.read_bytes()
    data = json.loads(raw.decode('utf-8-sig'))
    if data['year'] != config['year']:
        raise ValueError('El ejercicio del libro no coincide con la configuración')
    verify_sources(data, root)
    return config, root, data, digest(raw)

def review_record(runtime, key):
    with connect(runtime) as db:
        row = db.execute('SELECT data FROM reviews WHERE period=?', (key,)).fetchone()
    return json.loads(row[0]) if row else None

def save_review(runtime, period, supplied, actor):
    config, root, data, ledger_hash = context(runtime)
    if period not in ('1T','2T','3T','4T'):
        raise ValueError('Periodo no válido')
    if supplied.get('ledger_hash') != ledger_hash:
        raise ValueError('El libro ha cambiado. Revisa la versión actual antes de confirmar.')
    if data.get('references', {}).get(period):
        raise ValueError('Este periodo ya tiene una referencia presentada; utiliza la consulta histórica.')
    required = set(CHECKS) - (set() if period == '4T' else {'annual'})
    if any(supplied.get(k) is not True for k in required):
        raise ValueError('Completa las confirmaciones del periodo antes de preparar el archivo.')
    if not any(r['period']==period and r['include'] for r in data['records']):
        raise ValueError('No hay documentos incorporados para este periodo.')
    if supplied.get('mode') not in ('I','U'):
        raise ValueError('Modalidad no válida')
    record = dict(year=data['year'], period=period, ledger_hash=ledger_hash,
                  confirmations={k:True for k in required}, mode=supplied['mode'],
                  actor=actor, at=datetime.now(timezone.utc).isoformat())
    key = f'{data["year"]}-{period}'
    # Construct before saving: an unsupported calculation cannot become approved.
    build_candidate(runtime, period, record)
    with connect(runtime) as db:
        db.execute('INSERT OR REPLACE INTO reviews VALUES (?,?)', (key,json.dumps(record)))
    return record

def build_candidate(runtime, period, record=None):
    config, root, data, ledger_hash = context(runtime)
    record = record or review_record(runtime, f'{data["year"]}-{period}')
    if not record or record['ledger_hash'] != ledger_hash:
        raise ValueError('Falta revisar la versión actual del libro.')
    if data.get('references',{}).get(period):
        raise ValueError('El periodo ya figura presentado; no se genera otro cierre ordinario.')
    required = set(CHECKS) - (set() if period=='4T' else {'annual'})
    if any(record['confirmations'].get(k) is not True for k in required):
        raise ValueError('Revisión incompleta')
    data.setdefault('profiles',{}).setdefault(period,{})['remaining_boxes_confirmed_zero'] = True
    boxes = calculate(data)[period]['boxes']
    identity_path = confined(root, config['identity'])
    payment_path = confined(root, config['payment'])
    payment = read(payment_path) if record['mode']=='U' else None
    annual = None
    if period=='4T':
        annual = dict(reviewed=True, **{k:False for k in ('exempt_390','special_prorata_option',
            'special_prorata_revocation','annual_deduction_adjustment','investment_goods_adjustment','foral_annual_adjustment')})
    payload = serialize(load_design(Path(config['design'])), boxes, read(identity_path), data['year'], period, payment, annual)
    basis = dict(ledger=ledger_hash, review=digest(json.dumps(record,sort_keys=True).encode()),
                 identity=digest(identity_path.read_bytes()), payment=digest(payment_path.read_bytes()) if payment else '',
                 design=digest(Path(config['design']).read_bytes()), payload=digest(payload),
                 engine=digest(b''.join(Path(__file__).with_name(n).read_bytes() for n in ('period_workflow.py','ledger.py','export_303_test.py','closing.py'))))
    revision = digest(json.dumps(basis,sort_keys=True).encode())
    return dict(year=data['year'],period=period,revision=revision,mode=record['mode'],boxes=boxes,
                filed_result=None,difference=None,account=('ES•• ···· '+payment['iban'].replace(' ','')[-4:]) if payment else 'Sin cuenta',
                filename=f'303_{data["year"]}_{period}_PARA_VALIDAR.txt',payload=base64.b64encode(payload).decode(),
                payload_sha256=digest(payload),filing_ready=False,basis=basis)

def evidence(runtime, period, supplied, actor):
    config,root,data,ledger_hash=context(runtime)
    if period not in ('1T','2T','3T','4T','anual'):
        raise ValueError('Periodo no válido')
    kind=supplied.get('kind')
    if kind not in ('validation','filing','payment') or supplied.get('confirmed') is not True:
        raise ValueError('Indica qué acredita el documento y confirma su revisión.')
    encoded=supplied.get('pdf','')
    if not isinstance(encoded,str) or len(encoded)>14_000_000:
        raise ValueError('PDF demasiado grande (máximo 10 MB)')
    raw=base64.b64decode(encoded,validate=True)
    if not raw.startswith(b'%PDF-') or len(raw)>10_000_000:
        raise ValueError('Adjunta un justificante PDF válido (máximo 10 MB)')
    from pypdf import PdfReader
    pdf=PdfReader(io.BytesIO(raw))
    if pdf.is_encrypted or not len(pdf.pages):raise ValueError('El PDF no se puede leer')
    note=str(supplied.get('note','')).strip()
    if not note or len(note)>1000:raise ValueError('Describe la evidencia y su fecha (máximo 1000 caracteres)')
    model_hash=str(supplied.get('model_hash','')).strip()
    import re
    if model_hash and not re.fullmatch('[a-f0-9]{64}',model_hash):raise ValueError('Huella del archivo no válida')
    if kind=='validation' and not model_hash:raise ValueError('La validación debe identificar la huella del archivo validado')
    sha=digest(raw);dest=Path(runtime)/'evidence';dest.mkdir(exist_ok=True)
    target=dest/(sha+'.pdf')
    if not target.exists():target.write_bytes(raw)
    record=dict(kind=kind,sha256=sha,note=note,actor=actor,at=datetime.now(timezone.utc).isoformat(),
                provenance='Documento aportado y revisado por el usuario; sin consulta automática a AEAT o banco',model_hash=model_hash,ledger_hash=ledger_hash)
    if kind=='filing' and period!='anual':
        from ledger import money
        boxes=supplied.get('boxes',{})
        if set(boxes)!={'07','09','28','29','45','46','71'}:raise ValueError('Completa las casillas del 303 presentado')
        for value in boxes.values():money(value)
        if money(boxes['46'])!=money(boxes['09'])-money(boxes['45']):raise ValueError('Las casillas 09, 45 y 46 no concilian')
        record['boxes']=boxes
    inserted=False
    with connect(runtime) as db:
        key=f'{data["year"]}-{period}'
        existing=db.execute('SELECT data FROM evidence WHERE period=?',(key,)).fetchall()
        if not any(json.loads(r[0]).get('sha256')==sha and json.loads(r[0]).get('kind')==kind for r in existing):
            db.execute('INSERT INTO evidence(period,data) VALUES (?,?)',(key,json.dumps(record)))
            inserted=True
    if inserted:
        from model_events import request
        try:
            request(runtime,'evidence',actor)
        except (OSError,RuntimeError,sqlite3.Error):
            record['update_request_failed']=True
    return record

def get(runtime,url,csrf):
    parsed=urlsplit(url);path=parsed.path.removeprefix('/facturas')
    if path not in ('/modelos/preparacion','/modelos/preparacion/archivo','/modelos/preparacion/evidencia'):return None
    period=parse_qs(parsed.query).get('periodo',['4T'])[0]
    if period not in ('1T','2T','3T','4T','anual'):return (400,'Periodo no válido')
    if period=='anual':
        from annual_workflow import get as annual_get
        return annual_get(runtime,url,csrf)
    try:
        config,root,data,ledger_hash=context(runtime);key=f'{data["year"]}-{period}'
        store=Store(Path(runtime)/'new-closing.sqlite');row=store.get(key)
        if path.endswith('/archivo'):
            current=build_candidate(runtime,period)
            return (200,store.download(current),'text/plain; charset=iso-8859-1',{'Content-Disposition':'attachment; filename="'+current['filename']+'"'})
        if path.endswith('/evidencia'):
            identifier=parse_qs(parsed.query).get('id',[''])[0]
            with connect(runtime) as db:found=db.execute('SELECT data FROM evidence WHERE id=? AND period=?',(identifier,key)).fetchone()
            if not found:return (404,'Documento no disponible')
            item=json.loads(found[0]);raw=(Path(runtime)/'evidence'/(item['sha256']+'.pdf')).read_bytes()
            if digest(raw)!=item['sha256']:raise ValueError('Justificante cambiado')
            return (200,raw,'application/pdf',{'Content-Disposition':'inline; filename="justificante.pdf"'})
        problem='';current=None
        try:current=build_candidate(runtime,period)
        except (ValueError,OSError,KeyError) as exc:problem=str(exc)
        stale=bool(row and (not current or current['revision']!=row['snapshot']['revision']))
        with connect(runtime) as db:proofs=db.execute('SELECT id,data FROM evidence WHERE period=? ORDER BY id DESC',(key,)).fetchall()
        return (200,render(data,period,ledger_hash,row,stale,problem,proofs,csrf))
    except (ValueError,OSError,KeyError) as exc:return (409,'Preparación no disponible: '+e(exc))

def post(runtime,path,data,actor):
    if path.removeprefix('/facturas')!='/modelos/preparacion':return None
    period=data.get('period');action=data.get('action')
    if period=='anual':
        from annual_workflow import post as annual_post
        return annual_post(runtime,path,data,actor)
    if action=='review':
        save_review(runtime,period,data,actor)
        current=build_candidate(runtime,period)
        Store(Path(runtime)/'new-closing.sqlite').act(period,'prepare',None,current,actor)
    elif action=='evidence':
        saved=evidence(runtime,period,data,actor)
        if saved.get('update_request_failed'):
            return {'message':'Justificante guardado. No se pudo solicitar la actualización; pulsa Actualizar datos en Modelos para reintentarlo.'}
    elif action in ('approve','generate','cancel'):
        current=build_candidate(runtime,period)
        Store(Path(runtime)/'new-closing.sqlite').act(period,action,data.get('revision'),current,actor)
    else:raise ValueError('Acción no válida')
    return {'message':'Guardado. Revisa el estado y los siguientes pasos.'}

def render(data,period,ledger_hash,row,stale,problem,proofs,csrf):
    from kairo_invoice_web import dashboard
    filed=bool(data.get('references',{}).get(period));snapshot=row['snapshot'] if row else {}
    state=row['state'] if row and not stale else 'none'
    names={'none':'Pendiente de revisar','prepared':'Resumen preparado','approved':'Resumen aprobado','generated':'Archivo preparado para validar','cancelled':'Aprobación cancelada'}
    checks=''.join(f'<label class="pw-check"><input type="checkbox" name="{k}">{e(v)}</label>' for k,v in CHECKS.items() if k!='annual' or period=='4T')
    form='' if filed else f'<section><h2>Revisión del periodo</h2><form id="review">{checks}<label>Modalidad<select name="mode"><option value="U">Domiciliación · cuenta configurada</option><option value="I">Ingreso sin cuenta</option></select></label><button>Guardar revisión y preparar resumen</button></form></section>'
    if form and state in ('prepared','approved','generated'):
        form = '<details><summary>Revisar otra versión</summary>'+form+'</details>'
    actions=''
    if state in ('prepared','approved','generated'):
        actions=f'<section><h2>Resultado calculado: {e(snapshot["boxes"]["71"])} €</h2><p>{e(snapshot["account"])}</p><details><summary>Identificación técnica del archivo</summary><p>Huella del archivo: <code>{e(snapshot["payload_sha256"])}</code></p></details>'
        if state=='prepared':actions+='<button data-action="approve">Aprobar este resumen</button>'
        if state in ('approved','generated'):actions+='<button data-action="generate">Generar TXT</button>'
        if state=='generated':actions+=f'<a class="pw-button" href="{BASE}/archivo?periodo={period}">Descargar TXT para validar</a>'
        actions+='<button data-action="cancel">Cancelar aprobación</button></section>'
    evidence_rows=''.join(f'<li><a href="{BASE}/evidencia?periodo={period}&id={ident}">{e({"validation":"Validación aportada","filing":"Presentación documentada","payment":"Pago documentado"}[item["kind"]])}</a> · {e(item["note"])}<small>{e(item["provenance"])}</small></li>' for ident,raw in proofs for item in [json.loads(raw)])
    reference=data.get('references',{}).get(period,{}) or snapshot.get('boxes',{})
    fields=''.join(f'<label>Casilla {box}<input name="box_{box}" inputmode="decimal" value="{e(reference.get(box,""))}"></label>' for box in ('07','09','28','29','45','46','71'))
    ctx=json.dumps(dict(period=period,ledger_hash=ledger_hash,revision=snapshot.get('revision',''),csrf=csrf)).replace('<','\\u003c')
    return dashboard(f'''<style>.pw{{max-width:800px;margin:auto}}.pw section{{padding:18px;margin:16px 0;border:1px solid var(--k-line,#bbb);border-radius:14px;background:var(--k-surface,#fff)}}.pw label,.pw small{{display:block;margin:12px 0}}.pw-check{{display:flex!important;gap:10px;align-items:flex-start}}.pw input[type=checkbox]{{width:22px;height:22px;flex-shrink:0}}.pw input:not([type=checkbox]),.pw textarea,.pw select{{display:block;width:100%;padding:10px;font:inherit;background:var(--k-surface,#fff);color:inherit;border:1px solid var(--k-line,#aaa);border-radius:8px}}.pw button,.pw-button{{display:inline-block;font:inherit;padding:12px;margin:6px 8px 6px 0;border-radius:9px;border:1px solid var(--k-line,#aaa);background:var(--k-accent,#d6edac);color:var(--k-bg,#102019);text-decoration:none}}.pw code{{overflow-wrap:anywhere}}.pw h1{{text-align:center;font-size:24px}}.pw input{{max-width:100%}}.pw summary{{cursor:pointer}}</style>
<div class="pw"><a href="/facturas/modelos?periodo={period}">← Modelos</a><h1>Preparar 303 · {data['year']} · {period}</h1><p>{e(names[state])}. Datos hasta {e(data['as_of'])}.</p><p>{e('Periodo con referencia presentada: consulta y archivo de justificantes.' if filed else problem)}</p>
{form}{actions}<section><h2>Validación y presentación</h2><p>El archivo se valida en Hacienda antes de presentarlo. Guardar o aprobar aquí no firma ni presenta declaraciones ni ordena pagos.</p><a href="https://www2.agenciatributaria.gob.es/wlpl/A303-FWME/E{data['year']}/OPEN/index.zul" target="_blank" rel="noreferrer">Abrir simulador 303</a><p>La validación de domiciliación y del periodo debe comprobarse para este archivo. La última incidencia del 4T registrada fue el 26/10/2026; no acredita su estado actual.</p></section>
<section><h2>Guardar justificante</h2><ul>{evidence_rows or '<li>Sin justificantes añadidos en este flujo.</li>'}</ul><form id="evidence"><label>Tipo<select name="kind"><option value="validation">Validación técnica</option><option value="filing">Presentación</option><option value="payment">Pago</option></select></label><label>Descripción y fecha<textarea name="note" required maxlength="1000"></textarea></label><details><summary>Importes del 303 presentado</summary><p>Solo para registrar una presentación. Copia las casillas del justificante; verifica los importes sugeridos.</p>{fields}</details><details><summary>Identificación técnica del archivo</summary><label>Huella SHA256 del fichero del modelo<input name="model_hash" value="{e(snapshot.get('payload_sha256',''))}"></label></details><label>Documento PDF<input name="pdf" type="file" accept="application/pdf" required></label><label class="pw-check"><input type="checkbox" name="confirmed" required>He revisado que el justificante corresponde al ejercicio, periodo y operación indicados y, para una presentación, sus casillas.</label><button>Guardar justificante</button></form></section><p id="pw-result" role="status"></p></div>
<script>const pw={ctx};async function send(data){{const r=await fetch('{BASE}',{{method:'POST',headers:{{'Content-Type':'application/json','X-CSRF':pw.csrf}},body:JSON.stringify({{...pw,...data}})}});const d=await r.json();if(!r.ok)throw Error(d.message||'No se pudo guardar');location.reload()}}function fail(err){{document.getElementById('pw-result').textContent=err.message}}document.getElementById('review')?.addEventListener('submit',async ev=>{{ev.preventDefault();const f=ev.target;const d={{action:'review',mode:f.mode.value}};for(const k of {json.dumps(list(CHECKS))})d[k]=!!f.elements[k]?.checked;try{{await send(d)}}catch(x){{fail(x)}}}});document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>send({{action:b.dataset.action}}).catch(fail));document.getElementById('evidence').addEventListener('submit',async ev=>{{ev.preventDefault();const f=ev.target;const file=f.pdf.files[0];if(!file||file.size>10000000)return fail(Error('PDF máximo 10 MB'));try{{const pdf=await new Promise((resolve,reject)=>{{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(file)}});await send({{action:'evidence',kind:f.kind.value,note:f.note.value,model_hash:f.model_hash.value,confirmed:f.confirmed.checked,boxes:Object.fromEntries(['07','09','28','29','45','46','71'].map(b=>[b,f.elements['box_'+b].value.trim().replace(',','.')])),pdf}})}}catch(x){{fail(x)}}}});</script>''','models','Preparar 303')

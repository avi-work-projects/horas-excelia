"""Private annual 390 review, approval, generation and evidence; no filing."""
import base64
import copy
from datetime import datetime, timezone
from decimal import Decimal
import html
import json
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from closing import Store, confined, digest, read
from export_390 import FALSE_FLAGS, fingerprint, load_design, prepare, serialize
from ledger import calculate
from prepare_390 import prepare as dossier

BASE = '/facturas/modelos/preparacion'
GROUPS = {
    'regime': ('Confirmo obligación de 390 y régimen general exclusivo, una actividad, sin régimen simplificado, grupo de entidades, SII, tributación conjunta ni otros regímenes especiales.',
               ('exempt_390', 'simplified_regime', 'joint_return', 'group_entities', 'sii', 'special_regimes')),
    'cash': ('No se aplica criterio de caja, no he recibido operaciones con ese régimen, no hay concurso ni inscripción en devolución mensual.',
             ('cash_accounting', 'recipient_cash_accounting', 'insolvency', 'monthly_refund')),
    'operations': ('Las operaciones incluidas son nacionales ordinarias al 21 %, sin operaciones intracomunitarias, importaciones/exportaciones, inversión del sujeto pasivo ni otras operaciones especiales.',
                   ('intracommunity', 'imports_exports', 'reverse_charge', 'other_operations')),
    'adjustments': ('No hay bienes de inversión a declarar en IVA, prorrata, regularizaciones o ajustes anuales, compensaciones anteriores ni pagos a cuenta por combustibles.',
                    ('investment_goods', 'prorata', 'annual_adjustments', 'prior_compensation', 'fuel_payments')),
    'ordinary': ('Esta es una preparación ordinaria; no sustituye una declaración anual anterior.', ('substitute_return',)),
}
CHECKS = {
    'coverage': 'Confirmo que el año está completo: todos los ingresos y gastos y sus exclusiones están revisados.',
    'fiscal': 'He revisado el tratamiento fiscal y los cuatro 303; confirmo tributación exclusiva al Estado.',
}
e = lambda value: html.escape(str(value), quote=True)


def context(runtime):
    from period_workflow import context as period_context
    return period_context(runtime)


def candidates(root, year=2026):
    """List existing documentary evidence; never accept a client-supplied path."""
    root = Path(root).resolve()
    result = {}
    for folder in ('MODELOS', 'DOCUMENTOS ALTA AUTONOMO', f'REVISIONES/{year}/JUSTIFICANTES'):
        base = root / folder
        if not base.is_dir():
            continue
        for path in sorted(base.rglob('*.pdf')) + sorted(base.rglob('*.PDF')):
            resolved = path.resolve()
            if not resolved.is_relative_to(root) or not resolved.is_file():
                continue
            rel = resolved.relative_to(root).as_posix()
            result[fingerprint(rel)] = rel
            if len(result) > 1500:
                raise ValueError('Hay demasiados documentos; acota el archivo de modelos')
    return result


def pending(data):
    problems = []
    if data.get('year') != 2026:
        problems.append('El exportador instalado corresponde al ejercicio 2026.')
    for p in ('1T', '2T', '3T', '4T'):
        if not data.get('references', {}).get(p, {}).get('71'):
            problems.append(f'{p}: falta incorporar la referencia del 303 presentado y su justificante.')
    return problems


def review_path(runtime):
    return Path(runtime) / 'annual-review.json'


def build_candidate(runtime, record=None):
    config, root, source, ledger_hash = context(runtime)
    record = record or (read(review_path(runtime)) if review_path(runtime).is_file() else None)
    if not record or record.get('ledger_hash') != ledger_hash:
        raise ValueError('Falta revisar la versión actual del libro anual.')
    identity_path = confined(root, config['identity'])
    if record.get('identity_source_hash') != digest(identity_path.read_bytes()):
        raise ValueError('La identificación fiscal ha cambiado; vuelve a revisar el año.')
    data = copy.deepcopy(source)
    # The recorded explicit review applies to this copy, not the canonical ledger.
    for period in ('1T', '2T', '3T', '4T'):
        data.setdefault('profiles', {}).setdefault(period, {})['remaining_boxes_confirmed_zero'] = True
    profile = copy.deepcopy(record['profile'])
    profile['ledger_fingerprint'] = fingerprint(data)
    reviewed = prepare(data, profile, root)
    design_path = Path(config.get('design_390', Path(runtime) / 'dr390e2026.xlsx'))
    payload = serialize(load_design(design_path), reviewed, record['identity'])
    basis = {'ledger': ledger_hash, 'review': fingerprint(record), 'design': digest(design_path.read_bytes()),
             'payload': digest(payload), 'engine': digest(b''.join(Path(__file__).with_name(n).read_bytes()
                 for n in ('annual_workflow.py', 'export_390.py', 'ledger.py', 'closing.py')))}
    return dict(year=data['year'], period='anual', revision=fingerprint(basis), boxes=reviewed['boxes'],
                dossier=reviewed, filename=f'390_{data["year"]}_PREPARACION.txt',
                payload=base64.b64encode(payload).decode(), payload_sha256=digest(payload),
                filing_ready=False, basis=basis)


def save_review(runtime, supplied, actor):
    config, root, data, ledger_hash = context(runtime)
    if supplied.get('ledger_hash') != ledger_hash:
        raise ValueError('El libro ha cambiado; vuelve a revisar los datos actuales.')
    if any(supplied.get(k) is not True for k in (*CHECKS, *GROUPS)):
        raise ValueError('Revisa las condiciones y confirma todas las que correspondan al alcance del 390.')
    problems = pending(data)
    if problems:
        raise ValueError(' '.join(problems))
    choices = candidates(root, data['year'])
    def selected(key):
        identifier = supplied.get(key)
        if identifier not in choices:
            raise ValueError('Selecciona un documento existente para el perfil y cada trimestre.')
        path = confined(root, choices[identifier])
        return {'source': choices[identifier], 'sha256': digest(path.read_bytes())}
    profile = {k: False for k in FALSE_FLAGS}
    profile.update(year=data['year'], reviewed=True, year_complete=True, fiscal_reviewed=True,
                   general_regime=True, state_percentage='100.00',
                   activity={k: str(supplied.get(k, '')).strip() for k in ('description', 'code', 'iae')},
                   evidence=selected('profile_source'),
                   filed_evidence={p: selected('source_' + p) for p in ('1T', '2T', '3T', '4T')})
    if supplied.get('third_party_return') not in ('yes', 'no'):
        raise ValueError('Indica si corresponde declaración anual de operaciones con terceros.')
    profile['third_party_return'] = supplied['third_party_return'] == 'yes'
    # Review exact differences rather than offer an unexplained tolerance.
    checked = copy.deepcopy(data)
    for p in ('1T', '2T', '3T', '4T'):
        checked.setdefault('profiles', {}).setdefault(p, {})['remaining_boxes_confirmed_zero'] = True
    differences = calculate(checked)
    profile['difference_reviews'] = {}
    for p, quarter in differences.items():
        diff = {k: v for k, v in quarter['difference'].items() if v not in ('0.00', '-0.00')}
        if diff:
            reason = str(supplied.get('difference_' + p, '')).strip()
            if not reason or len(reason) > 1000:
                raise ValueError(f'{p}: explica la revisión de sus diferencias documentales.')
            profile['difference_reviews'][p] = {'reviewed': True, 'differences': diff, 'reason': reason}
    identity_path = confined(root, config['identity'])
    existing_identity = read(identity_path)
    identity = dict(person_type='physical', nif=existing_identity['nif'],
                    developer_nif=existing_identity['developer_nif'],
                    surname=str(supplied.get('surname', '')).strip(), given_name=str(supplied.get('given_name', '')).strip())
    record = dict(year=data['year'], ledger_hash=ledger_hash, profile=profile, identity=identity,
                  identity_source_hash=digest(identity_path.read_bytes()),
                  actor=actor, at=datetime.now(timezone.utc).isoformat())
    current = build_candidate(runtime, record)
    path = review_path(runtime)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary.replace(path)
    Store(Path(runtime) / 'new-annual.sqlite').act('anual', 'prepare', None, current, actor)
    return current


def get(runtime, url, csrf):
    parsed = urlsplit(url)
    path = parsed.path.removeprefix('/facturas')
    query = parse_qs(parsed.query)
    if query.get('periodo', [''])[0] != 'anual' or path not in (
            '/modelos/preparacion', '/modelos/preparacion/archivo', '/modelos/preparacion/evidencia'):
        return None
    try:
        config, root, data, ledger_hash = context(runtime)
        if path.endswith('/archivo') and query.get('tipo', [''])[0] == 'dossier':
            report = {'year': data['year'], 'quarters': calculate(data)}
            report['annual_documentary_totals'] = {k: str(sum((Decimal(q['boxes'][k])
                for q in report['quarters'].values()), Decimal('0.00'))) for k in ('07', '09', '28', '29')}
            raw = json.dumps(dossier(report), ensure_ascii=False, indent=2)
            return (200, raw, 'application/json; charset=utf-8',
                    {'Content-Disposition': f'attachment; filename="DOSSIER_IVA_{data["year"]}.json"'})
        store = Store(Path(runtime) / 'new-annual.sqlite')
        key = f'{data["year"]}-anual'
        row = store.get(key)
        if path.endswith('/archivo'):
            current = build_candidate(runtime)
            return (200, store.download(current), 'text/plain; charset=iso-8859-1',
                    {'Content-Disposition': 'attachment; filename="' + current['filename'] + '"'})
        from period_workflow import connect
        if path.endswith('/evidencia'):
            with connect(runtime) as db:
                found = db.execute('SELECT data FROM evidence WHERE id=? AND period=?', (query.get('id',[''])[0],key)).fetchone()
            if not found:
                return (404, 'Justificante no disponible')
            item = json.loads(found[0])
            raw = (Path(runtime) / 'evidence' / (item['sha256'] + '.pdf')).read_bytes()
            if digest(raw) != item['sha256']:
                raise ValueError('El justificante ha cambiado')
            return (200, raw, 'application/pdf', {'Content-Disposition':'inline; filename="justificante-390.pdf"'})
        problem, current = '', None
        try:
            current = build_candidate(runtime)
        except (ValueError, KeyError, OSError) as exc:
            problem = str(exc)
        stale = bool(row and (not current or current['revision'] != row['snapshot']['revision']))
        with connect(runtime) as db:
            proofs = db.execute('SELECT id,data FROM evidence WHERE period=? ORDER BY id DESC', (key,)).fetchall()
        return (200, render(data, ledger_hash, row, stale, problem, candidates(root, data['year']), proofs, csrf))
    except (ValueError, KeyError, OSError) as exc:
        return (409, 'Preparación anual no disponible: ' + e(exc))


def post(runtime, path, data, actor):
    if path.removeprefix('/facturas') != '/modelos/preparacion' or data.get('period') != 'anual':
        return None
    action = data.get('action')
    if action == 'review':
        save_review(runtime, data, actor)
    elif action == 'evidence':
        if data.get('kind') not in ('validation', 'filing'):
            raise ValueError('El 390 admite justificante de validación o presentación, no de pago.')
        from period_workflow import evidence
        evidence(runtime, 'anual', data, actor)
    elif action in ('approve', 'generate', 'cancel'):
        current = build_candidate(runtime)
        Store(Path(runtime) / 'new-annual.sqlite').act('anual', action, data.get('revision'), current, actor)
    else:
        raise ValueError('Acción anual no válida')
    return {'message': 'Preparación anual guardada. No se ha presentado ninguna declaración.'}


def render(data, ledger_hash, row, stale, problem, choices, proofs, csrf):
    from kairo_invoice_web import dashboard
    snapshot = row['snapshot'] if row else {}
    state = row['state'] if row and not stale else 'none'
    states = {'none':'Pendiente de revisión anual', 'prepared':'Resumen anual preparado',
              'approved':'Resumen anual aprobado', 'generated':'Fichero 390 preparado para validar', 'cancelled':'Aprobación cancelada'}
    problems = pending(data)
    current = state in ('prepared', 'approved', 'generated')
    review_status = 'Cobertura y perfil confirmados para esta versión del libro.' if current else 'Referencias de los cuatro 303 incorporadas. Falta confirmar cobertura y perfil.'
    options = '<option value="">Selecciona el documento</option>' + ''.join(
        f'<option value="{e(key)}">{e(path)}</option>' for key,path in choices.items())
    selectors = ''.join(f'<label>{label}<select name="{key}" required>{options}</select></label>'
        for key,label in [('profile_source','Documento de actividad y perfil fiscal'),
                          *[(f'source_{p}',f'Justificante 303 · {p}') for p in ('1T','2T','3T','4T')]])
    checks = ''.join(f'<label class="aw-check"><input type="checkbox" name="{key}" required>{e(text)}</label>'
                    for key,text in {**CHECKS, **{k:v[0] for k,v in GROUPS.items()}}.items())
    diffs = ''.join(f'<label>{p}: diferencias frente al 303 ({e(", ".join("casilla "+k+": "+v+" €" for k,v in q["difference"].items() if v not in ("0.00","-0.00")))}). Explica su revisión<textarea name="difference_{p}" maxlength="1000" required></textarea></label>'
        for p,q in calculate(data).items() if any(v not in ('0.00','-0.00') for v in q['difference'].values()))
    actions = ''
    if row:
        actions = '<section><h2>Resumen anual</h2><dl>' + ''.join(f'<dt>{label}</dt><dd>{e(snapshot["boxes"][box])} €</dd>' for box,label in [('05','Base de ingresos'),('06','IVA de ingresos'),('64','IVA deducible según la revisión'),('86','Resultado anual'),('95','Suma de los 303 presentados')]) + '</dl>'
        for action,label,enabled in [('approve','Aprobar resumen',state=='prepared'),('generate','Generar fichero 390',state in ('approved','generated')),('cancel','Cancelar aprobación',state in ('prepared','approved','generated'))]:
            actions += f'<button data-action="{action}" {"" if enabled else "disabled"}>{label}</button>'
        if state == 'generated':
            actions += f'<a class="aw-button" href="{BASE}/archivo?periodo=anual">Descargar 390 para validar</a>'
        actions += '</section>'
    proof_rows = ''.join(f'<li><a href="{BASE}/evidencia?periodo=anual&id={identifier}">{e({"validation":"Validación documentada","filing":"Presentación documentada"}.get(item["kind"],"Justificante"))}</a> · {e(item["note"])}</li>' for identifier,raw in proofs for item in [json.loads(raw)])
    ctx = json.dumps(dict(period='anual', ledger_hash=ledger_hash, revision=snapshot.get('revision',''), csrf=csrf), ensure_ascii=False).replace('<','\\u003c')
    script = r'''<script>const aw=CONTEXT;async function sendAnnual(data){const r=await fetch('/facturas/modelos/preparacion',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':aw.csrf},body:JSON.stringify({...aw,...data})});const d=await r.json();if(!r.ok)throw Error(d.message||'No se pudo guardar');location.reload()}function annualFail(error){document.getElementById('aw-result').textContent=error.message}document.getElementById('aw-review').addEventListener('submit',async ev=>{ev.preventDefault();const d={action:'review'};for(const field of ev.target.elements){if(!field.name)continue;d[field.name]=field.type==='checkbox'?field.checked:field.value}try{await sendAnnual(d)}catch(x){annualFail(x)}});document.querySelectorAll('.aw [data-action]').forEach(b=>b.onclick=()=>sendAnnual({action:b.dataset.action}).catch(annualFail));document.getElementById('aw-evidence').addEventListener('submit',async ev=>{ev.preventDefault();const f=ev.target;const file=f.pdf.files[0];if(!file||file.size>10000000)return annualFail(Error('PDF máximo 10 MB'));try{const pdf=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(file)});await sendAnnual({action:'evidence',pdf,kind:f.kind.value,note:f.note.value,confirmed:f.confirmed.checked,model_hash:f.model_hash.value})}catch(x){annualFail(x)}});</script>'''.replace('CONTEXT',ctx)
    content = f'''<style>.aw{{max-width:800px;margin:auto}}.aw h1{{text-align:center;font-size:24px}}.aw section{{padding:18px;margin:16px 0;border:1px solid var(--k-border,#c2c8be);border-radius:14px;background:var(--k-surface,#fff)}}.aw label{{display:block;margin:14px 0}}.aw .aw-check{{display:flex;gap:10px;align-items:flex-start}}.aw input[type=checkbox]{{width:22px;height:22px;flex-shrink:0}}.aw input:not([type=checkbox]),.aw textarea,.aw select{{display:block;width:100%;max-width:100%;padding:10px;font:inherit;color:inherit;background:var(--k-surface,#fff);border:1px solid var(--k-border,#aaa);border-radius:8px}}.aw button,.aw-button{{display:inline-block;margin:6px 8px 6px 0;padding:12px;font:inherit;border:1px solid var(--k-border,#aaa);border-radius:9px;background:var(--k-accent,#d6edac);color:var(--k-bg,#f5f8ed)}}.aw button:disabled{{opacity:.55}}.aw li,.aw p{{overflow-wrap:anywhere}}.aw dd{{font-weight:600;margin:0 0 12px}}.aw summary{{cursor:pointer}}</style>
<div class="aw"><a href="/facturas/modelos?paso=anual">← Resumen anual</a><h1>Preparar 390 · {data['year']}</h1><p>{e(states[state])}. Datos hasta {e(data.get('as_of','sin fecha'))}.</p><section><h2>{'Revisión guardada' if current else 'Antes de preparar'}</h2><ul>{''.join('<li>'+e(x)+'</li>' for x in problems) or '<li>'+e(review_status)+'</li>'}</ul><p>{e('Los datos han cambiado: hay que revisar otra versión.' if stale else problem)}</p><a href="{BASE}/archivo?periodo=anual&tipo=dossier">Descargar dossier anual de trabajo</a><p>El dossier conserva los pendientes y diferencias; no es el fichero del modelo 390.</p></section>
<details {'open' if not problems and not current else ''}><summary>{'Revisar otra versión' if current else 'Revisar datos y condiciones del año'}</summary><section><form id="aw-review"><h2>Identificación y actividad</h2><p>El NIF se toma de la configuración privada. Apellidos y nombre se consignan por separado.</p><label>Apellidos<input name="surname" required maxlength="60" autocomplete="family-name"></label><label>Nombre<input name="given_name" required maxlength="20" autocomplete="given-name"></label><label>Actividad principal<input name="description" required maxlength="40"></label><label>Código de actividad del modelo anterior<input name="code" required pattern="[A-Z][0-9]{{2}}" maxlength="3"></label><label>Epígrafe IAE<input name="iae" required pattern="[0-9]{{3,4}}" maxlength="4"></label><label>¿Corresponde declaración anual de operaciones con terceros?<select name="third_party_return" required><option value="">Selecciona</option><option value="yes">Sí</option><option value="no">No</option></select></label><h2>Documentos de referencia</h2>{selectors}<h2>Confirmaciones del año</h2>{checks}{diffs}<button {'disabled' if problems else ''}>Preparar resumen anual</button></form></section></details>{actions}
<section><h2>Validación y presentación</h2><p>Revisa el fichero en el servicio oficial del ejercicio antes de presentarlo. La aprobación aquí permite generar el archivo; no firma ni presenta el 390.</p><a href="https://sede.agenciatributaria.gob.es/Sede/iva/modelo-390-iva-declaracion-resumen-anual.html" target="_blank" rel="noreferrer">Abrir modelo 390 en Hacienda</a><ul>{proof_rows or '<li>Sin justificantes añadidos en este flujo.</li>'}</ul><form id="aw-evidence"><label>Tipo<select name="kind"><option value="validation">Validación técnica</option><option value="filing">Presentación</option></select></label><label>Descripción y fecha<textarea name="note" required maxlength="1000"></textarea></label><details><summary>Identificación técnica del archivo</summary><label>Huella SHA256 del fichero del modelo<input name="model_hash" value="{e(snapshot.get('payload_sha256',''))}"></label></details><label>Justificante PDF<input type="file" name="pdf" accept="application/pdf" required></label><label class="aw-check"><input type="checkbox" name="confirmed" required>He revisado que el justificante corresponde al modelo 390 y a este ejercicio.</label><button>Guardar justificante</button></form></section><p id="aw-result" role="status"></p></div>'''
    return dashboard(content + script, 'models', 'Preparar 390')

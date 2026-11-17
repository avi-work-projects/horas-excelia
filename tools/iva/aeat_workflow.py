"""Local orchestration of the reviewed model, AEAT operation and canonical receipt."""
import base64
from datetime import date, datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import uuid

from aeat_submission import SubmissionStore
from expense_workflow import atomic


BASE = '/facturas/modelos/aeat'
PERIODS = ('1T','2T','3T','4T','anual')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def settings(app):
    path = app.state/'aeat-settings.json'
    return json.loads(path.read_text(encoding='utf-8-sig')) if path.is_file() else {}


def client(app):
    from aeat_client import AeatClient
    from aeat_windows import WindowsTransport
    config = settings(app)
    if config.get('environment') not in ('test','production'):
        raise ValueError('Falta configurar el entorno de presentación.')
    transport = WindowsTransport(config.get('certificate_thumbprint'))
    certificate = transport.certificate()
    if certificate['sha256'] != config.get('certificate',{}).get('sha256'):
        raise ValueError('El certificado ha cambiado. Revisa la configuración antes de presentar.')
    # Allow time for Windows' existing protected-key consent dialog on a manual action.
    return AeatClient(environment=config['environment'],external_certificate=certificate,transport=transport,timeout=120)


def store(app, active=False):
    return SubmissionStore(app.state/'aeat',client(app) if active else None)


def source(app, period):
    if period not in PERIODS:
        raise ValueError('Periodo no válido')
    result = app.remote(app.config,dict(action='aeat_source',period=period))
    expected_nif = settings(app).get('taxpayer_nif')
    if expected_nif and result['nif']!=expected_nif:
        raise ValueError('El declarante no coincide con el certificado configurado para esta instalación.')
    ledger = Path(app.config['archive_root'])/app.config['ledger']
    if sha(ledger.read_bytes()) != result['ledger_sha256']:
        result['snapshot'] = None
        result['problem'] = 'Las copias del libro no coinciden. Actualiza los datos antes de preparar la presentación.'
    return result


def candidate(current, nrc=''):
    if current.get('already_filed'):
        raise ValueError('Este periodo ya tiene una presentación archivada. No se vuelve a presentar como declaración ordinaria.')
    item = current.get('snapshot')
    if not item:
        raise ValueError(current.get('problem') or 'Revisa, aprueba y genera primero el modelo.')
    snapshot = {k:item[k] for k in ('year','period','revision','payload_sha256','boxes','basis')}
    snapshot.update(model='390' if item['period']=='anual' else '303',nif=current['nif'],name=current['name'],
                    presenter_nif=current['nif'],presenter_name=current['name'],ledger_sha256=current['ledger_sha256'])
    if snapshot['model']=='303':
        snapshot.update(mode=item['mode'],account=item['account'])
        if item['mode']=='I':
            if not re.fullmatch('[A-Za-z0-9]{22}',nrc):
                raise ValueError('Para la modalidad ingreso, indica el NRC de 22 caracteres del pago ya realizado. Kairo no realiza ese pago.')
            snapshot['nrc'] = nrc
            snapshot['revision'] = sha((snapshot['revision']+'|'+nrc).encode())
        elif nrc:
            raise ValueError('La domiciliación no utiliza NRC.')
    elif nrc:
        raise ValueError('El 390 no lleva NRC.')
    payload = base64.b64decode(item['payload'],validate=True)
    if sha(payload)!=snapshot['payload_sha256']:
        raise ValueError('El fichero del modelo no coincide con su huella.')
    return snapshot,payload


def period_has_ended(year, period, today=None):
    today = today or date.today()
    if period in ('4T','anual'):
        return today >= date(year+1,1,1)
    return today >= date(year,int(period[0])*3+1,1)


def _immutable(path, raw):
    path = Path(path)
    if path.exists():
        if path.read_bytes()!=raw:
            raise ValueError('El documento archivado tiene otro contenido.')
    else:
        atomic(path,raw)


def receipt(app, operation_id):
    entry = store(app).get(operation_id)
    evidence = entry.get('evidence') or {}
    path = Path(evidence.get('receipt_path','')).resolve()
    root = (app.state/'aeat'/operation_id).resolve()
    if not path.is_relative_to(root) or not path.is_file():
        raise ValueError('El justificante todavía no está disponible.')
    raw = path.read_bytes()
    if sha(raw)!=evidence.get('receipt_sha256'):
        raise ValueError('El justificante no coincide con la respuesta conservada.')
    return raw


def archive(app, entry):
    """A failed copy can be retried independently of the already accepted filing."""
    if entry['state']!='filed' or entry['environment']!='production':
        return False
    snapshot,evidence = entry['snapshot'],entry['evidence']
    folder = Path(app.config['archive_root'])/'REVISIONES'/str(snapshot['year'])/'PRESENTACIONES'/snapshot['model']/snapshot['period']/entry['id']
    private = app.state/'aeat'/entry['id']
    raw = receipt(app,entry['id'])
    payload = (private/'payload.txt').read_bytes()
    if sha(payload)!=snapshot['payload_sha256']:
        raise ValueError('El fichero archivado no coincide con el modelo presentado.')
    response_path = Path(evidence['raw_response_path']).resolve()
    response = response_path.read_bytes() if response_path.is_relative_to(private.resolve()) else b''
    if not response or sha(response)!=evidence['raw_response_sha256']:
        raise ValueError('La respuesta oficial archivada no coincide.')
    _immutable(folder/'justificante.pdf',raw)
    _immutable(folder/'modelo.txt',payload)
    _immutable(folder/'presentacion.json',json.dumps({k:entry[k] for k in ('id','snapshot','environment','certificate_sha256','state','evidence')},ensure_ascii=False,indent=2).encode())
    _immutable(folder/'respuesta-aeat.json',response)
    from sync_models import apply_evidence
    document = dict(kind='filing',sha256=sha(raw),model_hash=snapshot['payload_sha256'],
                    ledger_hash=snapshot['ledger_sha256'],boxes=snapshot['boxes'],csv=evidence['csv'],
                    actor='aeat-directa',at=evidence.get('filed_at',''),
                    provenance='Aceptación directa AEAT y justificante PDF con CSV verificado; pago independiente.')
    apply_evidence(app.config['archive_root'],app.config['ledger'],
                   dict(period=f'{snapshot["year"]}-{snapshot["period"]}',data=document,pdf=base64.b64encode(raw).decode()),
                   app.config['backup_root'])
    marker = private/'archive.json'
    previous = json.loads(marker.read_text()) if marker.is_file() else {}
    if not previous.get('update_requested'):
        app.remote(app.config,dict(action='post',url='/facturas/modelos/actualizar',data={}))
    atomic(marker,json.dumps(dict(archived=True,update_requested=True,at=datetime.now(timezone.utc).isoformat()),ensure_ascii=False).encode())
    return True


def post(app, data):
    action = data.get('action')
    period = data.get('period','4T')
    if period not in PERIODS:
        raise ValueError('Periodo no válido')
    if action=='check_connection':
        current = source(app,period)
        # Consultation cannot submit or pay. Keep the response private for diagnosis.
        result = client(app).recover(dict(model='390' if period=='anual' else '303',year=current['year'],
                                          period=period,nif=current['nif'],presenter_name=current['name']),uuid.uuid4().hex)
        raw = result.get('raw_response',b'')
        if raw:
            atomic(app.state/'aeat-connection-response.xml',raw)
        if result.get('errors'):
            raise ValueError('Hacienda no ha confirmado la consulta: '+'; '.join(result['errors']))
        message = 'Conexión con certificado confirmada. '+str(len(result.get('matches',[])))+' declaraciones encontradas para este periodo; no se ha presentado ni pagado nada.'
        atomic(app.state/'aeat-connection.json',json.dumps(dict(at=datetime.now(timezone.utc).isoformat(),message=message)).encode())
        return dict(message=message,url=BASE+'?periodo='+period)
    active = store(app,active=action!='archive')
    if action=='validate':
        snapshot,payload = candidate(source(app,period),str(data.get('nrc','')).strip())
        operation = active.register(snapshot,payload)
        operation = active.validate(operation['id'],snapshot,payload)
    elif action in ('submit','recover','archive'):
        operation = active.get(data.get('operation_id',''))
        if operation['snapshot']['period']!=period:
            raise ValueError('La operación corresponde a otro periodo.')
        if action=='submit':
            snapshot,payload = candidate(source(app,period),operation['snapshot'].get('nrc',''))
            if not period_has_ended(snapshot['year'],period):
                raise ValueError('El periodo todavía no ha terminado. No se puede presentar una declaración ordinaria de ese periodo.')
            if settings(app).get('allow_live_submission') is not True:
                raise ValueError('La presentación real no está habilitada en esta instalación.')
            operation = active.confirm(operation['id'],data.get('confirmation'),snapshot,payload)
        elif action=='recover':
            operation = active.recover(operation['id'])
    else:
        raise ValueError('Acción de Hacienda no disponible')
    message = operation.get('last_error') or {'prepared':'Modelo preparado.','validated':'Validación técnica correcta. Revisa el resumen antes de presentar.',
        'accepted':'Aceptación recibida.','filed':'Presentación aceptada y justificante conservado.',
        'submitting':'Envío en curso. Consulta su estado antes de repetir.'}.get(operation['state'],'Consulta el resultado de la operación.')
    if operation['state']=='filed':
        try:
            archive(app,operation)
            message += ' Archivado en AUTONOMO; actualización de libros solicitada.'
        except (ValueError,OSError,KeyError):
            message += ' El justificante está a salvo. Falta completar su archivo en el libro; usa «Completar archivo».'
    return dict(message=message,url=BASE+'?periodo='+period+'&id='+operation['id'])

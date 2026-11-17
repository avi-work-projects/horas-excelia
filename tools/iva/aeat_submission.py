"""Durable, manually driven AEAT submission lifecycle.

This module owns no certificate private key and starts no worker. An injected
client validates, submits or queries only in response to an explicit method
call. An ambiguous submission reserves its fiscal period until reconciled; a
repeat confirmation cannot send it again.
"""
from contextlib import contextmanager
from datetime import datetime
import hashlib
import json
import math
import os
from pathlib import Path
import re
import sqlite3
import time
import uuid


MAX_ARTIFACT = 25 * 1024 * 1024
VALIDATION_TTL = 24 * 60 * 60
INFLIGHT_TTL = 120
FINAL_OR_PENDING = {'submitting', 'accepted', 'uncertain', 'receipt_pending', 'filed'}


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def json_text(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def snapshot_data(snapshot, payload):
    if not isinstance(snapshot, dict) or not isinstance(payload, bytes) or not 0 < len(payload) <= MAX_ARTIFACT:
        raise ValueError('Falta la preparación exacta del modelo')
    required = ('revision', 'payload_sha256', 'year', 'period', 'model', 'nif', 'presenter_nif', 'presenter_name')
    if any(k not in snapshot for k in required):
        raise ValueError('La preparación no identifica su revisión, declarante o presentador')
    data = {k: snapshot[k] for k in required}
    data['model'] = str(data['model'])
    data['revision'] = str(data['revision'])
    if (data['model'] not in ('303', '390') or type(data['year']) is not int or not 2000 <= data['year'] <= 2099
            or not data['revision'] or len(data['revision']) > 200
            or not re.fullmatch(r'[a-f0-9]{64}', str(data['payload_sha256']))
            or digest(payload) != data['payload_sha256']):
        raise ValueError('La revisión o la huella del fichero no coincide')
    periods = ('1T', '2T', '3T', '4T') if data['model'] == '303' else ('anual', '0A')
    if data['period'] not in periods:
        raise ValueError('Periodo no soportado por esta preparación')
    for key in ('nif', 'presenter_nif'):
        if not isinstance(data[key], str) or not re.fullmatch(r'[A-Z0-9]{9}', data[key]):
            raise ValueError('Identificación fiscal no válida')
    if (not isinstance(data['presenter_name'], str) or not data['presenter_name'].strip()
            or len(data['presenter_name']) > 100 or any(ord(c) < 32 for c in data['presenter_name'])):
        raise ValueError('Presentador no válido')
    for key in ('name', 'declarante_name', 'account', 'mode', 'nrc', 'ledger_sha256', 'date_from', 'date_to'):
        if key not in snapshot:
            continue
        value = snapshot[key]
        if not isinstance(value, str) or len(value) > 200 or any(ord(c) < 32 for c in value):
            raise ValueError('Dato de preparación no válido: '+key)
        if key == 'mode' and value not in ('I', 'U'):
            raise ValueError('Modalidad de pago no soportada')
        if key == 'nrc' and value and not re.fullmatch(r'[A-Za-z0-9]{22}', value):
            raise ValueError('NRC no válido')
        if key == 'ledger_sha256' and not re.fullmatch(r'[a-f0-9]{64}', value):
            raise ValueError('Huella del libro no válida')
        if key in ('date_from', 'date_to') and value:
            try:
                datetime.strptime(value, '%Y-%m-%d')
            except ValueError:
                raise ValueError('Fecha de consulta no válida') from None
        data[key] = value
    for key in ('boxes', 'basis'):
        if key not in snapshot:
            continue
        values = snapshot[key]
        if not isinstance(values, dict) or len(values) > 600:
            raise ValueError('Datos de trazabilidad no válidos')
        copied = {}
        for field, value in values.items():
            if not isinstance(field, str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,80}', field):
                raise ValueError('Referencia de trazabilidad no válida')
            if key == 'basis':
                if not isinstance(value, str) or value and not re.fullmatch(r'[a-f0-9]{64}', value):
                    raise ValueError('Huella de preparación no válida')
            elif (value is not None and (type(value) not in (str, int, float)
                    or isinstance(value, str) and (len(value) > 120 or any(ord(c) < 32 for c in value))
                    or isinstance(value, float) and not math.isfinite(value))):
                raise ValueError('Casilla no válida')
            copied[field] = value
        data[key] = copied
    if data['model'] == '303' and data.get('mode') not in ('I', 'U'):
        raise ValueError('La preparación debe identificar la modalidad del 303')
    return data


def _identity(client):
    if client is None:
        raise ValueError('Configura el certificado antes de validar o presentar')
    identity = client.identity()
    if not isinstance(identity, dict) or identity.get('configured') is False:
        raise ValueError('Configura el certificado antes de validar o presentar')
    identity = {k: identity.get(k) for k in ('certificate_sha256', 'environment')}
    if (identity['environment'] not in ('test', 'production')
            or not re.fullmatch(r'[a-fA-F0-9]{64}', str(identity['certificate_sha256']))):
        raise ValueError('No se ha verificado el certificado o el entorno AEAT')
    identity['certificate_sha256'] = identity['certificate_sha256'].lower()
    return identity


def valid_receipt(pdf, csv):
    """A PDF header alone is not a filing receipt: parse it and find its CSV."""
    if not isinstance(pdf, bytes) or not 20 < len(pdf) <= MAX_ARTIFACT or not pdf.startswith(b'%PDF-'):
        return False
    if not isinstance(csv, str) or not re.fullmatch(r'[A-Za-z0-9]{16}', csv):
        return False
    try:
        from io import BytesIO
        from pypdf import PdfReader
        reader = PdfReader(BytesIO(pdf), strict=True)
        if reader.is_encrypted or not 1 <= len(reader.pages) <= 100:
            return False
        text = ''.join((page.extract_text() or '') for page in reader.pages)
        compact = re.sub(r'\s+', '', text).upper()
        return csv.upper() in compact
    except Exception:
        return False


class SubmissionStore:
    def __init__(self, root, client=None, *, clock=time.time):
        self.root = Path(root).absolute()
        if self.root.is_symlink():
            raise ValueError('El archivo de presentaciones debe ser una carpeta privada directa')
        self.root.mkdir(parents=True, exist_ok=True)
        self.root = self.root.resolve()
        self.client, self.clock = client, clock
        self.database = self.root/'submissions.sqlite3'
        if self.database.is_symlink():
            raise ValueError('Archivo de estado no válido')
        with self.db() as db:
            db.executescript('''
                CREATE TABLE IF NOT EXISTS operations (
                    id TEXT PRIMARY KEY, input_key TEXT UNIQUE NOT NULL, scope TEXT NOT NULL,
                    snapshot TEXT NOT NULL, certificate_sha256 TEXT NOT NULL, environment TEXT NOT NULL,
                    state TEXT NOT NULL, created REAL NOT NULL, updated REAL NOT NULL,
                    attempt TEXT, validation TEXT, evidence TEXT, last_error TEXT,
                    submit_count INTEGER NOT NULL DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS reservations (
                    scope TEXT PRIMARY KEY, operation_id TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY, operation_id TEXT NOT NULL, at REAL NOT NULL,
                    kind TEXT NOT NULL, detail TEXT NOT NULL
                );
            ''')

    @contextmanager
    def db(self):
        db = sqlite3.connect(self.database, timeout=15)
        db.row_factory = sqlite3.Row
        try:
            db.execute('PRAGMA busy_timeout=15000')
            db.execute('PRAGMA synchronous=FULL')
            with db:
                yield db
        finally:
            db.close()

    def configuration(self):
        try:
            return _identity(self.client) | {'configured': True}
        except ValueError as error:
            return {'configured': False, 'message': str(error)}

    def _path(self, operation_id, name):
        if not re.fullmatch(r'[a-f0-9]{32}', str(operation_id)) or not re.fullmatch(r'[a-z0-9_.-]+', name):
            raise ValueError('Referencia de documento no válida')
        directory = self.root/operation_id
        if directory.is_symlink():
            raise ValueError('Carpeta de presentación no válida')
        directory.mkdir(exist_ok=True)
        path = directory/name
        if path.is_symlink() or self.root not in path.resolve().parents:
            raise ValueError('Documento fuera del archivo de presentaciones')
        return path

    def _write(self, operation_id, name, raw):
        if not isinstance(raw, bytes) or len(raw) > MAX_ARTIFACT:
            raise ValueError('Respuesta o documento demasiado grande')
        target = self._path(operation_id, name)
        if target.exists():
            if target.read_bytes() != raw:
                raise ValueError('El documento archivado tiene otro contenido')
            return str(target)
        temporary = target.with_name(target.name+'.'+uuid.uuid4().hex+'.tmp')
        with temporary.open('xb') as stream:
            stream.write(raw)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, target)
        return str(target)

    def _event(self, db, operation_id, kind, detail=None):
        db.execute('INSERT INTO events(operation_id,at,kind,detail) VALUES(?,?,?,?)',
                   (operation_id, self.clock(), kind, json_text(detail or {})))

    def get(self, operation_id):
        with self.db() as db:
            row = db.execute('SELECT * FROM operations WHERE id=?', (operation_id,)).fetchone()
        if row is None:
            raise ValueError('Presentación no encontrada')
        result = dict(row)
        for key in ('snapshot', 'validation', 'evidence'):
            result[key] = json.loads(result[key]) if result[key] else None
        result['simulation'] = result['environment'] != 'production'
        return result

    def list(self):
        with self.db() as db:
            identifiers = [row[0] for row in db.execute('SELECT id FROM operations ORDER BY created DESC')]
        return [self.get(identifier) for identifier in identifiers]

    def register(self, snapshot, payload):
        data, identity = snapshot_data(snapshot, payload), _identity(self.client)
        input_key = digest(json_text(data | identity).encode())
        period = '0A' if data['model'] == '390' else data['period']
        scope = ':'.join(str(x) for x in (identity['environment'], data['model'], data['year'], period, data['nif']))
        with self.db() as db:
            db.execute('BEGIN IMMEDIATE')
            existing = db.execute('SELECT id FROM operations WHERE input_key=?', (input_key,)).fetchone()
            if existing:
                identifier = existing[0]
                if self._path(identifier, 'payload.txt').read_bytes() != payload:
                    raise ValueError('El original archivado ha cambiado')
            else:
                identifier = uuid.uuid4().hex
                self._write(identifier, 'payload.txt', payload)
                self._write(identifier, 'snapshot.json', json_text(data | identity).encode('utf-8'))
                db.execute('INSERT INTO operations(id,input_key,scope,snapshot,certificate_sha256,environment,state,created,updated) VALUES(?,?,?,?,?,?,?,?,?)',
                           (identifier, input_key, scope, json_text(data), identity['certificate_sha256'], identity['environment'], 'prepared', self.clock(), self.clock()))
                self._event(db, identifier, 'prepared', {'payload_sha256': data['payload_sha256']})
        return self.get(identifier)

    def _check_source(self, operation, current_snapshot, current_payload):
        current = snapshot_data(current_snapshot, current_payload)
        if current != operation['snapshot'] or self._path(operation['id'], 'payload.txt').read_bytes() != current_payload:
            raise ValueError('La preparación ha cambiado. Genera y valida una revisión nueva.')
        identity = _identity(self.client)
        if any(identity[k] != operation[k] for k in identity):
            raise ValueError('El certificado o el entorno han cambiado. Valida una operación nueva.')
        return current_payload

    def _record_response(self, operation_id, attempt, kind, response):
        if not isinstance(response, dict):
            raise ValueError('Respuesta AEAT no válida')
        metadata = {k: v for k, v in response.items() if k not in ('raw_response', 'receipt_pdf', 'pdf')}
        raw = response.get('raw_response')
        if isinstance(raw, str):
            raw = raw.encode('utf-8')
        if raw is not None:
            metadata['raw_response_path'] = self._write(operation_id, attempt+'-'+kind+'.bin', raw)
            metadata['raw_response_sha256'] = digest(raw)
        for field in ('receipt_pdf', 'pdf'):
            candidate = response.get(field)
            if isinstance(candidate, bytes):
                metadata[field+'_path'] = self._write(operation_id, attempt+'-'+kind+'-'+field+'.pdf', candidate)
                metadata[field+'_sha256'] = digest(candidate)
        self._write(operation_id, attempt+'-'+kind+'.json', json_text(metadata).encode('utf-8'))
        return metadata

    def validate(self, operation_id, current_snapshot, current_payload):
        operation = self.get(operation_id)
        payload = self._check_source(operation, current_snapshot, current_payload)
        attempt = uuid.uuid4().hex
        with self.db() as db:
            db.execute('BEGIN IMMEDIATE')
            row = db.execute('SELECT state,updated FROM operations WHERE id=?', (operation_id,)).fetchone()
            if row['state'] in FINAL_OR_PENDING or (row['state'] == 'validating' and self.clock()-row['updated'] < INFLIGHT_TTL):
                raise ValueError('Esta operación ya está en curso o tiene un resultado de presentación')
            db.execute('UPDATE operations SET state=?,attempt=?,updated=?,validation=NULL,last_error=NULL WHERE id=?',
                       ('validating', attempt, self.clock(), operation_id))
            self._event(db, operation_id, 'validating')
        try:
            response = self.client.validate(operation['snapshot'], payload)
            metadata = self._record_response(operation_id, attempt, 'validation', response)
            valid = response.get('valid') is True and not response.get('errors') and bool(response.get('raw_response'))
            validation = metadata | {'revision': operation['snapshot']['revision'],
                'payload_sha256': operation['snapshot']['payload_sha256'],
                'certificate_sha256': operation['certificate_sha256'], 'environment': operation['environment'],
                'validated_at': self.clock(), 'valid': valid}
            state, error = ('validated', None) if valid else ('rejected', 'La validación AEAT contiene errores')
        except Exception:
            state, error, validation = 'rejected', 'No se ha confirmado la validación. Puedes volver a validarla manualmente.', None
        with self.db() as db:
            db.execute('BEGIN IMMEDIATE')
            changed = db.execute('UPDATE operations SET state=?,validation=?,last_error=?,updated=? WHERE id=? AND state=? AND attempt=?',
                                 (state, json_text(validation) if validation else None, error, self.clock(), operation_id, 'validating', attempt)).rowcount
            if changed:
                self._event(db, operation_id, state, {'phase': 'validation'})
        return self.get(operation_id)

    def confirmation(self, operation_id):
        operation = self.get(operation_id)
        return {key: operation[key] for key in ('certificate_sha256', 'environment')} | {
            'operation_id': operation_id, 'revision': operation['snapshot']['revision'],
            'payload_sha256': operation['snapshot']['payload_sha256']}

    def confirm(self, operation_id, confirmation, current_snapshot, current_payload):
        operation = self.get(operation_id)
        payload = self._check_source(operation, current_snapshot, current_payload)
        expected = self.confirmation(operation_id) | {'confirmed': True}
        if not isinstance(confirmation, dict) or confirmation.get('confirmed') is not True or confirmation != expected:
            raise ValueError('Confirma expresamente esta revisión, certificado y entorno')
        if operation['snapshot'].get('mode') == 'I' and not re.fullmatch(r'[A-Za-z0-9]{22}', operation['snapshot'].get('nrc', '')):
            raise ValueError('Añade y revisa el NRC del ingreso antes de presentar')
        if operation['snapshot'].get('mode') != 'I' and operation['snapshot'].get('nrc'):
            raise ValueError('El NRC no corresponde a esta modalidad')
        attempt = uuid.uuid4().hex
        with self.db() as db:
            db.execute('BEGIN IMMEDIATE')
            row = db.execute('SELECT * FROM operations WHERE id=?', (operation_id,)).fetchone()
            if row['state'] in FINAL_OR_PENDING:
                return self.get(operation_id)
            validation = json.loads(row['validation']) if row['validation'] else None
            if (row['state'] != 'validated' or not validation or validation.get('valid') is not True
                    or not 0 <= self.clock()-validation['validated_at'] <= VALIDATION_TTL):
                raise ValueError('Valida esta revisión antes de presentarla')
            for key in ('revision', 'payload_sha256', 'certificate_sha256', 'environment'):
                if validation.get(key) != expected[key]:
                    raise ValueError('La validación corresponde a otra revisión o certificado')
            reserved = db.execute('SELECT operation_id FROM reservations WHERE scope=?', (row['scope'],)).fetchone()
            if reserved and reserved[0] != operation_id:
                raise ValueError('Ya existe una presentación o un envío sin resolver para este modelo y periodo')
            db.execute('INSERT OR IGNORE INTO reservations(scope,operation_id) VALUES(?,?)', (row['scope'], operation_id))
            db.execute('UPDATE operations SET state=?,attempt=?,updated=?,submit_count=submit_count+1,last_error=NULL WHERE id=?',
                       ('submitting', attempt, self.clock(), operation_id))
            self._event(db, operation_id, 'submitting', expected)
        try:
            response = self.client.submit(operation['snapshot'], payload, operation_id)
            return self._submission_result(operation, attempt, response)
        except Exception:
            with self.db() as db:
                db.execute('UPDATE operations SET state=?,updated=?,last_error=? WHERE id=? AND attempt=? AND state=?',
                           ('uncertain', self.clock(), 'No se ha confirmado el envío. Consulta su estado; no se reenviará automáticamente.', operation_id, attempt, 'submitting'))
                self._event(db, operation_id, 'uncertain')
            return self.get(operation_id)

    def _identity_matches(self, snapshot, response):
        for key in ('model', 'year', 'period', 'nif'):
            left, right = str(snapshot[key]), str(response.get(key, ''))
            if key == 'period' and snapshot['model'] == '390':
                left, right = ('0A' if v == 'anual' else v for v in (left, right))
            if left != right:
                return False
        if response.get('presenter_nif') != snapshot['presenter_nif']:
            return False
        if response.get('payload_sha256') is not None and response['payload_sha256'] != snapshot['payload_sha256']:
            return False
        return True

    def _submission_result(self, operation, attempt, response):
        identifier = operation['id']
        metadata = self._record_response(identifier, attempt, 'submission', response)
        outcome, error = response.get('outcome'), None
        official_response = bool(response.get('raw_response')) and bool(metadata.get('raw_response_sha256'))
        if official_response and outcome == 'accepted' and self._identity_matches(operation['snapshot'], response) and re.fullmatch(r'[A-Za-z0-9]{16}', str(response.get('csv', ''))):
            state = 'accepted'
        elif official_response and outcome == 'rejected':
            state, error = 'rejected', 'Hacienda ha rechazado esta presentación'
        else:
            state, error = 'uncertain', 'No se ha podido vincular una aceptación a esta presentación'
        with self.db() as db:
            db.execute('BEGIN IMMEDIATE')
            changed = db.execute('UPDATE operations SET state=?,evidence=?,last_error=?,updated=? WHERE id=? AND attempt=? AND state IN (?,?)',
                (state, json_text(metadata), error, self.clock(), identifier, attempt, 'submitting', 'uncertain')).rowcount
            if not changed:
                return self.get(identifier)
            self._event(db, identifier, state)
            if state == 'rejected':
                db.execute('DELETE FROM reservations WHERE operation_id=?', (identifier,))
        if state == 'accepted':
            return self._receipt(identifier, response.get('receipt_pdf'))
        return self.get(identifier)

    def _receipt(self, operation_id, pdf=None):
        operation = self.get(operation_id)
        evidence = operation['evidence'] or {}
        if operation['state'] not in ('accepted', 'receipt_pending', 'filed'):
            return operation
        if operation['state'] == 'filed':
            return operation
        if pdf is None and evidence.get('receipt_url'):
            try:
                downloaded = self.client.receipt(evidence['receipt_url'])
                pdf = downloaded.get('receipt_pdf')
            except Exception:
                pdf = None
        if isinstance(pdf, bytes):
            evidence.update(receipt_candidate_path=self._write(operation_id, 'receipt-candidate-'+digest(pdf)+'.pdf', pdf),
                            receipt_candidate_sha256=digest(pdf))
        if valid_receipt(pdf, evidence.get('csv')):
            receipt = self._write(operation_id, 'receipt-'+digest(pdf)+'.pdf', pdf)
            evidence.update(receipt_path=receipt, receipt_sha256=digest(pdf), receipt_verified=True)
            state = 'filed' if operation['environment'] == 'production' else 'accepted'
            error = None
        else:
            state, error = 'receipt_pending', 'Aceptación recibida; falta un justificante PDF verificable con el mismo CSV'
        with self.db() as db:
            db.execute('UPDATE operations SET state=?,evidence=?,last_error=?,updated=? WHERE id=? AND state IN (?,?)',
                       (state, json_text(evidence), error, self.clock(), operation_id, 'accepted', 'receipt_pending'))
            self._event(db, operation_id, state, {'phase': 'receipt'})
        return self.get(operation_id)

    def _recover_saved_response(self, operation):
        """Finish the same durable attempt after a crash before its DB update."""
        attempt = operation.get('attempt')
        if not attempt or not re.fullmatch(r'[a-f0-9]{32}', attempt):
            return None
        path = self._path(operation['id'], attempt+'-submission.json')
        if not path.is_file():
            return None
        try:
            metadata = json.loads(path.read_text(encoding='utf-8'))
            raw = self._path(operation['id'], attempt+'-submission.bin').read_bytes()
            original = self._path(operation['id'], 'payload.txt').read_bytes()
            if (not raw or digest(raw) != metadata.get('raw_response_sha256')
                    or digest(original) != operation['snapshot']['payload_sha256']):
                return None
            if metadata.get('outcome') == 'accepted':
                if not self._identity_matches(operation['snapshot'], metadata) or not re.fullmatch(r'[A-Za-z0-9]{16}', str(metadata.get('csv', ''))):
                    return None
                state = 'accepted'
            elif metadata.get('outcome') == 'rejected':
                state = 'rejected'
            else:
                return None
            pdf = None
            if metadata.get('receipt_pdf_sha256'):
                candidate = self._path(operation['id'], attempt+'-submission-receipt_pdf.pdf').read_bytes()
                if digest(candidate) == metadata['receipt_pdf_sha256']:
                    pdf = candidate
        except (OSError, ValueError, TypeError, KeyError):
            return None
        with self.db() as db:
            db.execute('BEGIN IMMEDIATE')
            changed = db.execute('UPDATE operations SET state=?,evidence=?,last_error=NULL,updated=? WHERE id=? AND attempt=? AND state IN (?,?)',
                (state, json_text(metadata), self.clock(), operation['id'], attempt, 'submitting', 'uncertain')).rowcount
            if changed:
                self._event(db, operation['id'], 'saved_response_recovered', {'state': state})
                if state == 'rejected':
                    db.execute('DELETE FROM reservations WHERE operation_id=?', (operation['id'],))
        if changed and state == 'accepted':
            return self._receipt(operation['id'], pdf)
        return self.get(operation['id'])

    def recover(self, operation_id):
        """Query an ambiguous attempt or retrieve a known receipt; never submit."""
        operation = self.get(operation_id)
        identity = _identity(self.client)
        if any(identity[k] != operation[k] for k in identity):
            raise ValueError('Recupera con el mismo certificado y entorno de la presentación')
        if operation['state'] in ('accepted', 'receipt_pending', 'filed'):
            return self._receipt(operation_id)
        if operation['state'] == 'submitting':
            if self.clock()-operation['updated'] < INFLIGHT_TTL:
                raise ValueError('El envío sigue en curso. Espera a que termine antes de consultarlo.')
            with self.db() as db:
                db.execute('UPDATE operations SET state=?,updated=?,last_error=? WHERE id=? AND state=? AND attempt=?',
                           ('uncertain', self.clock(), 'El proceso se interrumpió; consulta pendiente, sin reenvío.', operation_id, 'submitting', operation['attempt']))
            operation = self.get(operation_id)
        if operation['state'] != 'uncertain':
            return operation
        saved = self._recover_saved_response(operation)
        if saved is not None:
            return saved
        attempt = uuid.uuid4().hex
        try:
            response = self.client.recover(operation['snapshot'], operation_id)
            metadata = self._record_response(operation_id, attempt, 'recovery', response)
            # AEAT's period lookup does not return the TXT hash or our operation
            # ID. Even one result is a candidate, never proof of this attempt.
            evidence = (operation['evidence'] or {}) | {'recovery': metadata}
            error = 'Consulta guardada. Las coincidencias requieren cotejo; este envío no se repetirá.'
        except Exception:
            evidence, error = operation['evidence'], 'No se ha confirmado la consulta. El envío sigue sin resolverse y no se repetirá.'
        with self.db() as db:
            db.execute('UPDATE operations SET evidence=?,last_error=?,updated=? WHERE id=? AND state=?',
                       (json_text(evidence) if evidence else None, error, self.clock(), operation_id, 'uncertain'))
            self._event(db, operation_id, 'recovery_query')
        return self.get(operation_id)

"""Bounded AEAT transport. No retries, scheduling, certificate export or approvals.

The durable caller owns review/consent and must reserve a submission before
calling submit. A network/protocol failure after POST is uncertain, not rejected.
"""
import base64
from datetime import date, datetime
import hashlib
import http.client
import json
from pathlib import Path
import re
import ssl
import time
from urllib.parse import urlencode, urlsplit
import xml.etree.ElementTree as ET


SPEC_URL = 'https://www.agenciatributaria.es/static_files/AEAT_Desarrolladores/EEDD/General/EspecificacionesServiciosDeclaracionesAEAT_ES.pdf'
SPEC_SHA256 = 'cdbd1cad6d6db079d264490d5a0d6484818225db95a1d3ba563b253affce605e'
MAX_RESPONSE = 12 * 1024 * 1024
MAX_PDF = 8 * 1024 * 1024
MAX_PAYLOAD = 1024 * 1024
VALIDATE_URL = 'https://prewww2.aeat.es/wlpl/PFTW-PICW/ServValiDos'
HOSTS = {'test': ('prewww1.aeat.es', 'prewww2.aeat.es'),
         'production': ('www1.agenciatributaria.gob.es', 'www2.agenciatributaria.gob.es')}


class AeatError(ValueError):
    """Local input/configuration or unrecognized official response."""


class AeatTransportError(AeatError):
    """Transport did not yield a bounded, usable response; never auto-retry."""

    def __init__(self, message, raw_response=b''):
        super().__init__(message)
        self.raw_response = raw_response


def _sha(raw):
    return hashlib.sha256(raw).hexdigest()


def _string(value, label, pattern=None, maximum=200):
    if not isinstance(value, str) or not value or len(value) > maximum:
        raise AeatError('Dato no válido: '+label)
    if any(ord(c) < 32 or ord(c) == 127 for c in value):
        raise AeatError('Dato no válido: '+label)
    if pattern and not re.fullmatch(pattern, value):
        raise AeatError('Dato no válido: '+label)
    return value


def _identity(snapshot):
    model = str(snapshot.get('model', ''))
    year = str(snapshot.get('year', ''))
    period = snapshot.get('period', '')
    if model not in ('303', '390') or not re.fullmatch(r'20\d{2}', year):
        raise AeatError('Modelo o ejercicio no soportado')
    wire_period = '0A' if model == '390' and period in ('anual', '0A') else period
    if wire_period not in (('1T', '2T', '3T', '4T') if model == '303' else ('0A',)):
        raise AeatError('Periodo no soportado')
    nif = _string(snapshot.get('nif'), 'NIF', r'[A-Z0-9]{9}')
    return dict(model=model, year=year, period=period, wire_period=wire_period, nif=nif)


def _payload(snapshot, raw):
    ident = _identity(snapshot)
    if not isinstance(raw, bytes) or not 1 <= len(raw) <= MAX_PAYLOAD:
        raise AeatError('Fichero del modelo no válido')
    if snapshot.get('payload_sha256') != _sha(raw):
        raise AeatError('El fichero no coincide con la versión revisada')
    # Do not silently strip CRLF/tabs and change the approved bytes.
    if any(b < 32 or 127 <= b < 160 for b in raw):
        raise AeatError('El fichero contiene caracteres de control')
    text = raw.decode('iso-8859-1')
    # The approved fixed-width export must identify the same model/period/year.
    prefix = '<T'+ident['model']+'0'+ident['year']+ident['wire_period']
    if not text.startswith(prefix+'0000>') or not text.endswith('</'+prefix[1:]+'0000>'):
        raise AeatError('La cabecera del fichero no coincide con el modelo y periodo')
    return ident, text


def _object_pairs(pairs):
    result = {}
    for key, value in pairs:
        normalized = key.strip().casefold()
        if normalized in result:
            raise AeatError('Respuesta JSON con claves duplicadas')
        result[normalized] = value
    return result


def _json(raw):
    if not isinstance(raw, bytes) or len(raw) > MAX_RESPONSE:
        raise AeatError('Respuesta demasiado grande')
    try:
        result = json.loads(raw.decode('utf-8-sig'), object_pairs_hook=_object_pairs,
                            parse_constant=lambda value: (_ for _ in ()).throw(AeatError('Número JSON no válido')))
    except (UnicodeError, json.JSONDecodeError, RecursionError) as exc:
        raise AeatError('La respuesta de Hacienda no es JSON válido') from exc
    if not isinstance(result, dict) or set(result) != {'respuesta'} or not isinstance(result['respuesta'], dict):
        raise AeatError('Respuesta de Hacienda no reconocida')
    return result['respuesta']


def _messages(value):
    if value is None:
        return []
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list) or len(value) > 100:
        raise AeatError('Lista de mensajes no válida')
    return [_string(item, 'mensaje de Hacienda', maximum=4000) for item in value]


def _pdf(raw):
    if not isinstance(raw, bytes) or not 20 <= len(raw) <= MAX_PDF or not raw.startswith(b'%PDF-') or b'%%EOF' not in raw[-4096:]:
        raise AeatError('Hacienda no ha devuelto un PDF completo')
    return raw


def parse_validation(raw):
    data = _json(raw)
    errors = _messages(data.get('errores'))
    warnings = _messages(data.get('avisos')) + _messages(data.get('advertencias'))
    if errors:
        if data.get('pdf') or data.get('correcta'):
            raise AeatError('Respuesta de validación contradictoria')
        return dict(valid=False, errors=errors, warnings=warnings, raw_response=raw)
    if set(data) - {'pdf', 'avisos', 'advertencias', 'errores'}:
        raise AeatError('Respuesta de validación no reconocida')
    encoded = data.get('pdf')
    if isinstance(encoded, list) and len(encoded) == 1:
        encoded = encoded[0]
    if not isinstance(encoded, str) or len(encoded) > (MAX_PDF * 4 // 3 + 8):
        raise AeatError('Falta el PDF de validación')
    try:
        pdf = _pdf(base64.b64decode(encoded, validate=True))
    except (ValueError, TypeError) as exc:
        raise AeatError('PDF de validación no válido') from exc
    return dict(valid=True, errors=[], warnings=warnings, pdf=pdf, raw_response=raw)


def parse_submission(raw, snapshot):
    data = _json(raw)
    errors = _messages(data.get('errores'))
    if errors:
        if 'correcta' in data:
            raise AeatError('Respuesta de presentación contradictoria')
        return dict(outcome='rejected', errors=errors, warnings=[], raw_response=raw)
    if set(data) != {'correcta'} or not isinstance(data['correcta'], dict):
        raise AeatError('No hay aceptación identificable de Hacienda')
    accepted = data['correcta']
    ident = _identity(snapshot)
    for field, expected in (('modelo', ident['model']), ('ejercicio', ident['year']),
                            ('periodo', ident['wire_period']), ('nifdeclarante', ident['nif']),
                            ('nifpresentador', snapshot.get('presenter_nif'))):
        if str(accepted.get(field, '')) != expected:
            raise AeatError('La aceptación no corresponde a la declaración enviada')
    csv = _string(accepted.get('codigoseguroverificacion'), 'CSV', r'[A-Za-z0-9]{16}')
    justification = _string(accepted.get('justificante'), 'justificante', r'\d{13}')
    receipt_url = _string(accepted.get('urlpdf'), 'URL del justificante', maximum=2048)
    day = _string(accepted.get('fecha'), 'fecha', r'\d{4}-\d{2}-\d{2}')
    clock = _string(accepted.get('hora'), 'hora', r'\d{2}:\d{2}(?::\d{2})?')
    try:
        datetime.fromisoformat(day+'T'+clock)
    except ValueError as exc:
        raise AeatError('Fecha de presentación no válida') from exc
    return dict(outcome='accepted', csv=csv, receipt_url=receipt_url, justificante=justification,
                model=ident['model'], year=int(ident['year']), period=ident['period'], nif=ident['nif'],
                presenter_nif=accepted['nifpresentador'], filed_at=day+'T'+clock,
                errors=[], warnings=_messages(accepted.get('avisos'))+_messages(accepted.get('advertencias')),
                raw_response=raw, payload_sha256=snapshot['payload_sha256'])


def parse_consultation(raw, snapshot):
    if not isinstance(raw, bytes) or len(raw) > MAX_RESPONSE or b'\x00' in raw or re.search(br'<!\s*(?:DOCTYPE|ENTITY)', raw, re.I):
        raise AeatError('XML de consulta no permitido')
    try:
        root = ET.fromstring(raw)
    except (ET.ParseError, ValueError) as exc:
        raise AeatError('Respuesta de consulta no reconocida') from exc
    if root.tag != 'servicioConsultasDirectas' or root.attrib or len(root) > 100:
        raise AeatError('Respuesta de consulta no reconocida')
    ident = _identity(snapshot)
    matches = []
    for node in root:
        if node.tag == 'error' and len(root) == 1 and len(node) == 1 and node[0].tag == 'descripcionError':
            return dict(outcome='uncertain', matches=[], errors=_messages(node[0].text), raw_response=raw)
        if node.tag != 'respuestaCorrecta' or node.attrib:
            raise AeatError('Resultado de consulta no reconocido')
        expected = ['ejercicio','modelo','periodo','nif','csv','expediente','justificante','fechaYHoraPresentacion']
        actual = [field.tag for field in node]
        if actual not in (expected, expected[:-1]+['just_anterior', expected[-1]]):
            raise AeatError('Campos de consulta no reconocidos')
        values = {field.tag:field.text or '' for field in node}
        if any(len(field) or field.attrib for field in node):
            raise AeatError('Campos de consulta no válidos')
        if (values['modelo'], values['ejercicio'], values['periodo'], values['nif']) != (ident['model'], ident['year'], ident['wire_period'], ident['nif']):
            raise AeatError('La consulta contiene otra declaración')
        _string(values['csv'], 'CSV', r'[A-Za-z0-9]{16}')
        _string(values['justificante'], 'justificante', r'\d{13}')
        _string(values['expediente'], 'expediente', maximum=100)
        try:
            datetime.fromisoformat(values['fechaYHoraPresentacion'])
        except ValueError as exc:
            raise AeatError('Fecha de consulta no válida') from exc
        matches.append(dict(model=ident['model'], year=int(ident['year']), period=ident['period'], nif=ident['nif'],
                            csv=values['csv'], justificante=values['justificante'], expediente=values['expediente'],
                            filed_at=values['fechaYHoraPresentacion']))
    # Query has neither payload hash nor amount. Even one match is only a candidate.
    return dict(outcome='uncertain', matches=matches, errors=[], raw_response=raw)


class AeatClient:
    def __init__(self, environment='test', certfile=None, keyfile=None, key_password=None,
                 timeout=30, transport=None, ca_file=None, external_certificate=None):
        if environment not in HOSTS:
            raise AeatError('Entorno AEAT no válido')
        if not isinstance(timeout, (int, float)) or isinstance(timeout, bool) or not 1 <= timeout <= 120:
            raise AeatError('Tiempo de espera no válido')
        if external_certificate is not None and (not isinstance(external_certificate, dict) or certfile or keyfile or not callable(transport)):
            raise AeatError('El certificado externo requiere su transporte exclusivo')
        self.environment, self.timeout, self.transport = environment, timeout, transport
        self.certfile, self.keyfile, self.key_password, self.ca_file = certfile, keyfile, key_password, ca_file
        self.certificate_sha256 = ''
        if external_certificate is not None:
            self.certificate_sha256 = _string(external_certificate.get('sha256'), 'huella del certificado', r'[a-f0-9]{64}')
        elif certfile:
            try:
                pem = Path(certfile).read_text(encoding='ascii')
                match = re.search(r'-----BEGIN CERTIFICATE-----.*?-----END CERTIFICATE-----', pem, re.S)
                if not match:
                    raise ValueError()
                self.certificate_sha256 = _sha(ssl.PEM_cert_to_DER_cert(match[0]))
            except (OSError, UnicodeError, ValueError) as exc:
                raise AeatError('No se puede leer el certificado PEM configurado') from exc
        elif keyfile:
            raise AeatError('Falta el certificado de la clave configurada')
        self._external = external_certificate is not None

    def identity(self):
        return dict(certificate_sha256=self.certificate_sha256, environment=self.environment,
                    configured=bool(self.certificate_sha256))

    def _context(self, authenticated):
        context = ssl.create_default_context(cafile=self.ca_file)
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        if authenticated:
            if not self.certificate_sha256:
                raise AeatError('Configura un certificado antes de presentar o consultar')
            if not self._external:
                try:
                    context.load_cert_chain(self.certfile, self.keyfile, self.key_password)
                except (OSError, ssl.SSLError, ValueError) as exc:
                    raise AeatError('El certificado y su clave no se pueden utilizar') from exc
        return context

    def _url(self, url, operation):
        if not isinstance(url, str) or len(url) > 2048 or re.search(r'[\x00-\x20\x7f]', url):
            raise AeatError('Destino AEAT no autorizado')
        try:
            parts = urlsplit(url)
            port = parts.port
        except ValueError as exc:
            raise AeatError('Destino AEAT no autorizado') from exc
        if parts.scheme != 'https' or parts.username or parts.password or parts.fragment or port not in (None, 443):
            raise AeatError('Destino AEAT no autorizado')
        if operation == 'validate':
            allowed = url == VALIDATE_URL
        elif operation == 'submit':
            allowed = url == 'https://'+HOSTS[self.environment][0]+'/wlpl/PFTW-PICW/PresBasicaDos'
        elif operation == 'consult':
            allowed = url == 'https://'+HOSTS[self.environment][0]+'/wlpl/SCEJ-MANT/ConsultaExt'
        else:
            allowed = (parts.hostname in HOSTS[self.environment] and parts.path.startswith('/wlpl/')
                       and not re.search(r'%2f|%5c|%2e|\\|/\.\.?/', parts.path, re.I))
        if not allowed:
            raise AeatError('Destino AEAT no autorizado')
        return parts

    def _request(self, url, body=None, *, operation, content_type='application/json;charset=UTF-8'):
        parts = self._url(url, operation)
        authenticated = operation != 'validate'
        if authenticated and not self.certificate_sha256:
            raise AeatError('Configura un certificado antes de presentar o consultar')
        headers = {'Accept':'application/pdf' if operation == 'receipt' else 'application/xml' if operation == 'consult' else 'application/json',
                   'Accept-Encoding':'identity', 'User-Agent':'Kairo-AEAT/1'}
        if body is not None:
            headers['Content-Type'] = content_type
        method = 'POST' if body is not None else 'GET'
        maximum = MAX_PDF if operation == 'receipt' else MAX_RESPONSE
        try:
            if self.transport:
                status, response_headers, raw = self.transport(method, url, body, headers, timeout=self.timeout,
                                                              max_bytes=maximum, client_certificate=authenticated)
            else:
                context = self._context(authenticated)
                connection = http.client.HTTPSConnection(parts.hostname, timeout=self.timeout, context=context)
                try:
                    deadline = time.monotonic()+self.timeout
                    connection.request(method, parts.path+('?' + parts.query if parts.query else ''), body, headers)
                    remaining = deadline-time.monotonic()
                    if remaining <= 0:
                        raise AeatTransportError('Tiempo de respuesta agotado')
                    connection.sock.settimeout(remaining)
                    response = connection.getresponse()
                    status, response_headers = response.status, dict(response.getheaders())
                    length = response.getheader('Content-Length')
                    if length is not None and (not length.isdigit() or int(length) > maximum):
                        raise AeatTransportError('Respuesta AEAT demasiado grande')
                    chunks, count = [], 0
                    while count <= maximum:
                        remaining = deadline-time.monotonic()
                        if remaining <= 0:
                            raise AeatTransportError('Tiempo de respuesta agotado')
                        # HTTP/1.0 or Connection: close may detach connection.sock.
                        sock = connection.sock or getattr(getattr(response.fp, 'raw', None), '_sock', None)
                        if sock is not None:
                            sock.settimeout(remaining)
                        chunk = response.read1(min(65536, maximum+1-count))
                        if not chunk:
                            break
                        chunks.append(chunk)
                        count += len(chunk)
                    raw = b''.join(chunks)
                finally:
                    connection.close()
        except AeatError:
            raise
        except Exception as exc:
            # No URLs, credentials, payloads or server body in public error text.
            raise AeatTransportError('No se obtuvo una respuesta verificable de Hacienda') from exc
        if not isinstance(status, int) or not isinstance(raw, bytes) or len(raw) > maximum or not isinstance(response_headers, dict):
            raise AeatTransportError('Respuesta AEAT no válida o demasiado grande')
        if status != 200:
            # Redirects are not followed; an HTTP failure after submit is uncertain.
            raise AeatTransportError('Hacienda devolvió HTTP '+str(status), raw)
        response_headers = {str(k).lower():str(v) for k,v in response_headers.items()}
        if response_headers.get('content-encoding','identity').lower() not in ('identity', ''):
            raise AeatTransportError('Compresión de respuesta no admitida', raw)
        expected = ('application/pdf',) if operation == 'receipt' else ('application/xml','text/xml') if operation == 'consult' else ('application/json',)
        mime = response_headers.get('content-type','').split(';')[0].strip().lower()
        if mime not in expected:
            raise AeatTransportError('El formato devuelto por Hacienda no es el esperado', raw)
        return raw

    def validate(self, snapshot, payload):
        ident, text = _payload(snapshot, payload)
        request = dict(MODELO=ident['model'], EJERCICIO=ident['year'], PERIODO=ident['wire_period'], IDI='ES')
        # F01 follows the official JSON example and its accompanying notes.
        # Confirmed against ServValiDos with a synthetic 303 on 2026-11-17.
        request['F01'] = text
        # SINVL is deliberately unavailable: a PDF without validation is not valid.
        raw = self._request(VALIDATE_URL, json.dumps(request, ensure_ascii=False).encode('utf-8'), operation='validate')
        return parse_validation(raw)

    def submit(self, snapshot, payload, operation_id):
        ident, text = _payload(snapshot, payload)
        _string(operation_id, 'identificador de operación', r'[A-Za-z0-9_-]{1,100}')
        presenter = _string(snapshot.get('presenter_nif'), 'NIF del presentador', r'[A-Z0-9]{9}')
        name = _string(snapshot.get('presenter_name'), 'nombre del presentador', maximum=100)
        if not self.certificate_sha256:
            raise AeatError('Configura un certificado antes de presentar')
        nrc = snapshot.get('nrc','')
        if ident['model'] == '303' and snapshot.get('mode') not in ('I','U'):
            raise AeatError('Modalidad del 303 no soportada')
        if ident['model'] == '303' and snapshot.get('mode') == 'I':
            _string(nrc, 'NRC del ingreso', r'[A-Za-z0-9]{22}')
        elif nrc:
            raise AeatError('El NRC no corresponde a la modalidad de esta declaración')
        request = dict(MODELO=ident['model'], EJERCICIO=ident['year'], PERIODO=ident['wire_period'],
                       NRC=nrc, IDI='ES', F01=text, FIR='FirmaBasica', FIRNIF=presenter, FIRNOMBRE=name)
        # Preflight local key errors happen before the caller-visible attempt.
        if not self.transport:
            self._context(True)
        raw = b''
        try:
            raw = self._request('https://'+HOSTS[self.environment][0]+'/wlpl/PFTW-PICW/PresBasicaDos',
                                json.dumps(request, ensure_ascii=False).encode('utf-8'), operation='submit')
            result = parse_submission(raw, snapshot)
        except AeatError as exc:
            return dict(outcome='uncertain', errors=[str(exc)], warnings=[], raw_response=raw or getattr(exc,'raw_response',b''))
        if result['outcome'] == 'accepted':
            try:
                result.update(self.receipt(result['receipt_url']))
                # Preserve JSON as audit response; receipt bytes have their own key.
                result['raw_response'] = raw
            except AeatError as exc:
                result['receipt_error'] = str(exc)
        return result

    def recover(self, snapshot, operation_id):
        ident = _identity(snapshot)
        _string(operation_id, 'identificador de operación', r'[A-Za-z0-9_-]{1,100}')
        name = _string(snapshot.get('name') or snapshot.get('declarante_name') or snapshot.get('presenter_name'), 'nombre del declarante', maximum=100)
        request = [('NIF',ident['nif']), ('ANR',name), ('MOD',ident['model']), ('EJF',ident['year']), ('PER',ident['wire_period'])]
        for key, source in (('FED','date_from'),('FEH','date_to')):
            value = snapshot.get(source,'')
            if value:
                try:
                    value = date.fromisoformat(value).strftime('%Y%m%d')
                except (TypeError, ValueError) as exc:
                    raise AeatError('Fecha de consulta no válida') from exc
            request.append((key,value))
        request += [('HOD',''),('HOH','')]
        raw = self._request('https://'+HOSTS[self.environment][0]+'/wlpl/SCEJ-MANT/ConsultaExt',
                            urlencode(request).encode('ascii'), operation='consult', content_type='application/x-www-form-urlencoded')
        try:
            return parse_consultation(raw, snapshot)
        except AeatError as exc:
            raise AeatTransportError(str(exc), raw_response=raw) from exc

    def receipt(self, url):
        raw = self._request(url, operation='receipt')
        return dict(receipt_pdf=_pdf(raw), raw_response=raw)

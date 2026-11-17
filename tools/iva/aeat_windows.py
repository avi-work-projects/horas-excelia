"""AEAT transport using Windows certificate store without private-key export.

No retries or redirects. Requests only travel through the child's stdin;
errors never include URLs, bodies, certificate identifiers or server content.
"""
import base64
from datetime import datetime
import json
import math
import os
from pathlib import Path
import re
import subprocess
from urllib.parse import urlsplit

HOSTS = frozenset(('prewww1.aeat.es', 'prewww2.aeat.es',
                   'www1.agenciatributaria.gob.es', 'www2.agenciatributaria.gob.es'))
MAX_BODY = 8 * 1024 * 1024
MAX_RESPONSE = 32 * 1024 * 1024
ERROR = ('Windows no ha confirmado la conexión segura o el uso del certificado. '
         'Comprueba su vigencia, la conexión y el estado antes de repetir un envío.')


def _invoke(request):
    if os.name != 'nt':
        raise ValueError('El certificado de este conector se utiliza desde el mini Windows.')
    executable = Path(os.environ.get('SystemRoot', 'C:/Windows'))/'System32/WindowsPowerShell/v1.0/powershell.exe'
    try:
        result = subprocess.run([str(executable), '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                                 '-File', str(Path(__file__).with_suffix('.ps1'))],
                                input=json.dumps(request, ensure_ascii=True).encode('ascii'),
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                timeout=float(request.get('timeout', 15)) + 20,
                                creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        response = json.loads(result.stdout.decode('utf-8-sig'))
    except (OSError, ValueError, subprocess.TimeoutExpired):
        raise ValueError(ERROR) from None
    if result.returncode or not isinstance(response, dict) or response.get('ok') is not True:
        # Diagnostics stay fixed: never propagate arbitrary child output.
        raise ValueError(ERROR)
    return response


def _request(method, url, body, headers, timeout, max_bytes, client_certificate):
    if method not in ('GET', 'POST') or type(client_certificate) is not bool:
        raise ValueError('Petición del conector no válida.')
    if (not isinstance(url, str) or len(url) > 2048
            or re.search(r'[\x00-\x20\x7f\\]', url)):
        raise ValueError('Destino AEAT no permitido.')
    try:
        parts = urlsplit(url)
        if (parts.scheme != 'https' or parts.hostname not in HOSTS or parts.port not in (None, 443)
                or parts.username or parts.password or parts.fragment):
            raise ValueError()
    except ValueError:
        raise ValueError('Destino AEAT no permitido.') from None
    if (not isinstance(timeout, (int, float)) or isinstance(timeout, bool)
            or not math.isfinite(timeout) or not 1 <= timeout <= 120
            or type(max_bytes) is not int or not 1 <= max_bytes <= MAX_RESPONSE):
        raise ValueError('Límites de conexión no válidos.')
    if (body is not None and (not isinstance(body, bytes) or len(body) > MAX_BODY)
            or method == 'GET' and body is not None):
        raise ValueError('Cuerpo de la petición no válido.')
    allowed = {'content-type', 'accept', 'accept-encoding', 'user-agent'}
    if not isinstance(headers, dict) or len(headers) > len(allowed):
        raise ValueError('Cabeceras no válidas.')
    seen = set()
    for key, value in headers.items():
        if (not isinstance(key, str) or key.lower() not in allowed or key.lower() in seen
                or not isinstance(value, str) or not value or len(value) > 512
                or re.search(r'[\x00-\x1f\x7f]', value)):
            raise ValueError('Cabeceras no válidas.')
        seen.add(key.lower())
        if key.lower() == 'accept-encoding' and value != 'identity':
            raise ValueError('Compresión de respuesta no admitida.')
        if key.lower() == 'content-type' and body is None:
            raise ValueError('La cabecera de contenido requiere un cuerpo.')


class WindowsTransport:
    def __init__(self, thumbprint, invoke=_invoke):
        if not isinstance(thumbprint, str) or not re.fullmatch('[a-fA-F0-9]{40}', thumbprint):
            raise ValueError('Selecciona un certificado del almacén de Windows.')
        self.thumbprint = thumbprint.upper()
        self.invoke = invoke

    def certificate(self):
        result = self.invoke(dict(action='certificate', thumbprint=self.thumbprint))
        value = result.get('certificate') if isinstance(result, dict) else None
        if (not isinstance(value, dict) or not re.fullmatch(r'[a-f0-9]{64}', str(value.get('sha256', '')))
                or value.get('has_private_key') is not True or not isinstance(value.get('subject'), str)
                or not value['subject']):
            raise ValueError('No se ha podido comprobar el certificado de Windows.')
        try:
            expiry = datetime.fromisoformat(value['not_after'].replace('Z', '+00:00'))
            if expiry.tzinfo is None:
                raise ValueError()
        except (KeyError, AttributeError, TypeError, ValueError):
            raise ValueError('No se ha podido comprobar la vigencia del certificado.') from None
        return {key: value[key] for key in ('sha256', 'subject', 'not_after', 'has_private_key')}

    def __call__(self, method, url, body, headers, *, timeout, max_bytes, client_certificate):
        _request(method, url, body, headers, timeout, max_bytes, client_certificate)
        result = self.invoke(dict(action='request', thumbprint=self.thumbprint,
                                  method=method, url=url, body=base64.b64encode(body).decode() if body is not None else None,
                                  headers=headers, timeout=timeout, max_bytes=max_bytes, client_certificate=client_certificate))
        try:
            encoded = result['body']
            if not isinstance(encoded, str) or len(encoded) > ((max_bytes + 2) // 3) * 4:
                raise ValueError()
            raw = base64.b64decode(encoded, validate=True)
            status, response_headers = result['status'], result['headers']
            if (type(status) is not int or not 100 <= status <= 599 or 300 <= status <= 399
                    or not isinstance(response_headers, dict) or len(raw) > max_bytes
                    or any(not isinstance(k, str) or not isinstance(v, str) for k, v in response_headers.items())):
                raise ValueError()
        except (KeyError, TypeError, ValueError):
            raise ValueError('Windows no ha devuelto una respuesta permitida y completa.') from None
        return status, response_headers, raw

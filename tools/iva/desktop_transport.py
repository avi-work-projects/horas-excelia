"""Bounded one-shot SSH requests. Only installed application code is executed."""
import json
from pathlib import Path
import shlex
import subprocess


BOOT = '''import json,sys
p=json.load(sys.stdin)
sys.path.insert(0,p['code_root'])
ns={'__name__':'desktop_remote'}
try:
 exec(p['source'],ns)
 result=ns['dispatch'](p['runtime'],p['request'])
 print(json.dumps({'ok':True,'result':result}))
except Exception as exc:
 print(json.dumps({'ok':False,'message':str(exc) if isinstance(exc,ValueError) else 'El servicio contable no está disponible. Reintenta la acción manualmente.'}))
'''


def call(config, request, timeout=60):
    source = Path(__file__).with_name('desktop_remote.py').read_text(encoding='utf-8')
    payload = dict(source=source, code_root=str(Path(config['remote_script']).parent).replace('\\','/'),
                   runtime=config['remote_runtime'], request=request)
    command = [config.get('ssh', 'ssh'), '-i', config['ssh_key'], '-o', 'BatchMode=yes',
               '-o', 'ConnectTimeout=8', config['host'],
               ' '.join(shlex.quote(x) for x in (config['remote_python'], '-B', '-c', BOOT))]
    try:
        process = subprocess.run(command, input=json.dumps(payload).encode(), stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE, timeout=timeout,
                                 creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
    except (OSError, subprocess.TimeoutExpired):
        raise ValueError('No se ha recibido la respuesta de Kairo. El libro local sigue disponible. Comprueba la conexión y el estado antes de repetir una aprobación.') from None
    if process.returncode:
        raise ValueError('No se puede conectar con la bandeja de Kairo. Comprueba que está encendido y conectado.')
    try:
        response = json.loads(process.stdout)
    except ValueError:
        raise ValueError('Respuesta contable incompleta; comprueba el estado antes de repetir la acción.') from None
    if not response.get('ok'):
        raise ValueError(response.get('message', 'No se ha podido completar la acción'))
    return response['result']

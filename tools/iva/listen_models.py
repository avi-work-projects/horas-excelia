"""Run the existing model worker only for durable manual requests from Kairo."""
import argparse
import json
import os
from pathlib import Path, PurePosixPath
import shlex
import subprocess
import sys
import time

from model_events import process_lock


class TransportError(RuntimeError):
    pass


def remote(config, supplied):
    script = str(PurePosixPath(config['remote_script']).with_name('model_events.py'))
    command = [config.get('ssh', 'ssh'), '-T', '-i', config['ssh_key'],
               '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10',
               '-o', 'ServerAliveInterval=30', '-o', 'ServerAliveCountMax=3', config['host'],
               ' '.join(shlex.quote(s) for s in (config['remote_python'], script, '--server', '--runtime', config['remote_runtime']))]
    try:
        completed = subprocess.run(command, input=json.dumps(supplied).encode(),
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                   creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    except OSError as exc:
        raise TransportError('No se pudo establecer la conexión SSH.') from exc
    if completed.returncode == 255:
        raise TransportError('La conexión SSH se interrumpió.')
    if completed.returncode:
        raise RuntimeError('El servidor de solicitudes no pudo completar la operación.')
    try:
        return json.loads(completed.stdout)
    except (ValueError, UnicodeError) as exc:
        raise RuntimeError('Respuesta del servidor de solicitudes no válida.') from exc


def reconnect(config, supplied, transport=remote, pause=time.sleep):
    delay = 1
    while True:
        try:
            return transport(config, supplied)
        except TransportError:
            # This only reconnects the SSH channel. It never invokes the worker,
            # reads AUTONOMO, queries Drive, or creates another fiscal request.
            pause(delay)
            delay = min(delay * 2, 30)


def run_worker(config_path):
    completed = subprocess.run([sys.executable, str(Path(__file__).with_name('sync_models.py')),
                                '--config', str(config_path)], stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                               creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    if completed.returncode:
        raise RuntimeError('El worker no terminó: ' + completed.stderr.decode(errors='replace')[-4000:])
    result = json.loads(completed.stdout)
    if not isinstance(result, dict) or result.get('state') != 'verified':
        raise RuntimeError('El worker no confirmó una copia verificada.')
    return result


def listen(config_path, transport=remote, worker=run_worker, pause=time.sleep):
    config_path = Path(config_path)
    # Reading connection configuration is not a source/Drive refresh.
    config = json.loads(config_path.read_text(encoding='utf-8-sig'))
    with process_lock(config_path.with_suffix('.listener.lock')):
        while True:
            job = reconnect(config, {'action':'wait'}, transport, pause)
            if (not isinstance(job, dict) or not isinstance(job.get('id'), str)
                    or type(job.get('through')) is not int):
                raise RuntimeError('Solicitud recibida no válida.')
            try:
                result, error = worker(config_path), None
            except Exception as exc:
                result, error = None, str(exc)
            # A worker failure is acknowledged as terminal, never retried by a
            # clock. New requests queued during the run remain separate work.
            reconnect(config, dict(action='finish', job=job, result=result, error=error), transport, pause)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', required=True)
    args = parser.parse_args()
    listen(args.config)


if __name__ == '__main__':
    main()

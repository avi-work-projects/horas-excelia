"""Manually transfer a prepared Amazon batch to the existing private Kairo queue.

Uses the already configured SSH connection. No Amazon login, new credentials,
scheduled execution, fiscal approval, ledger update or message to a seller.
"""
import argparse
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import shlex
import subprocess
import sys
import tarfile
import tempfile

from expense_workflow import confined, read
from model_events import process_lock

MAX_TRANSFER = 512 * 1024 * 1024
MAX_MEMBERS = 4002
MEMBER = re.compile(r'(?:objects/[a-f0-9]{64}\.(?:pdf|zip)|manifests/[a-f0-9]{64}\.json)\Z')


def members(manifest):
    return {item['path'] for item in manifest['artifacts'] + manifest['files']} | {
        'manifests/' + manifest['batch_id'] + '.json'}


def package(manifest_path, stream):
    from amazon_inbox import load_manifest
    manifest_path = Path(manifest_path).resolve()
    manifest = load_manifest(manifest_path)
    root = manifest_path.parent.parent
    paths = members(manifest)
    if len(paths) > MAX_MEMBERS or any(not MEMBER.fullmatch(p) for p in paths):
        raise ValueError('Estructura de lote no admitida')
    total = 0
    with tarfile.open(fileobj=stream, mode='w') as archive:
        for relative in sorted(paths):
            raw = confined(root, relative).read_bytes()
            total += len(raw)
            if total > MAX_TRANSFER:
                raise ValueError('Lote demasiado grande; divide la descarga')
            info = tarfile.TarInfo(relative)
            info.size, info.mode, info.mtime = len(raw), 0o600, 0
            archive.addfile(info, io.BytesIO(raw))
    return manifest


def receive(stream, runtime):
    from amazon_inbox import load_manifest, enqueue
    runtime = Path(runtime).resolve()
    config = read(runtime/'config.json')
    consultation = Path(config['consultation_root']).resolve()
    index = read(consultation/'modelos-index.json')
    ledger = index['ledger']
    root = runtime/'amazon-inbox'
    root.mkdir(mode=0o700, parents=True, exist_ok=True)
    with process_lock(runtime/'amazon-transfer.lock'):
        with tempfile.TemporaryDirectory(prefix='.incoming-', dir=root) as temporary:
            stage = Path(temporary)
            found, total = set(), 0
            with tarfile.open(fileobj=stream, mode='r|') as archive:
                for info in archive:
                    if (not info.isfile() or not MEMBER.fullmatch(info.name)
                            or info.name in found or len(found) >= MAX_MEMBERS):
                        raise ValueError('Contenido de transferencia no admitido')
                    limit = (256 if info.name.endswith('.zip') else 8) * 1024 * 1024
                    if info.size < 0 or info.size > limit:
                        raise ValueError('Archivo de transferencia demasiado grande')
                    total += info.size
                    if total > MAX_TRANSFER:
                        raise ValueError('Lote de transferencia demasiado grande')
                    raw = archive.extractfile(info).read(limit + 1)
                    if len(raw) != info.size:
                        raise ValueError('Transferencia incompleta')
                    target = confined(stage, info.name)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with target.open('xb') as output:
                        output.write(raw)
                    found.add(info.name)
            manifests = [p for p in found if p.startswith('manifests/')]
            if len(manifests) != 1:
                raise ValueError('Se requiere exactamente un manifiesto')
            relative = manifests[0]
            manifest = load_manifest(stage/relative)
            if found != members(manifest):
                raise ValueError('La transferencia no coincide con el manifiesto')
            destination = root/manifest['batch_id']
            if destination.exists():
                prior = load_manifest(destination/relative)
                if prior != manifest:
                    raise ValueError('Ya existe otro contenido para este lote')
            else:
                # Keep originals and provenance in the private runtime. Nothing
                # is copied to the public PWA or directly into the fiscal book.
                os.replace(stage, destination)
            # ExpenseStore creates this same directory on the first web upload;
            # an unused production queue does not yet have a directory.
            (runtime/'expenses').mkdir(mode=0o700, exist_ok=True)
            receipt = enqueue(destination/relative, runtime/'expenses',
                              archive_root=consultation,
                              ledger_relative=ledger['path'],
                              expected_ledger_sha256=ledger['sha256'])
            return receipt


def send(manifest_path, config, runner=subprocess.run):
    required = ('host', 'ssh_key', 'remote_python', 'remote_script', 'remote_runtime')
    if any(not isinstance(config.get(k), str) or not config[k].strip() for k in required):
        raise ValueError('Falta la configuración de conexión de Kairo')
    if config['host'].startswith('-') or any(any(c in config[k] for c in ('\x00', '\r', '\n')) for k in required):
        raise ValueError('Configuración de conexión no válida')
    remote_script = str(PurePosixPath(config['remote_script']).with_name('amazon_transfer.py'))
    command = [config.get('ssh', 'ssh'), '-T', '-i', config['ssh_key'],
               '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', config['host'],
               shlex.join([config['remote_python'], remote_script, '--receive',
                           '--runtime', config['remote_runtime']])]
    with tempfile.TemporaryFile() as stream:
        manifest = package(manifest_path, stream)
        stream.seek(0)
        result = runner(command, stdin=stream, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                        timeout=600,
                        creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    if result.returncode:
        # Do not dump SSH diagnostics, paths, or document contents into a public log.
        raise RuntimeError('Kairo no confirmó la importación. Puedes repetir el mismo lote sin duplicarlo.')
    try:
        receipt = json.loads(result.stdout)
    except (ValueError, UnicodeError) as exc:
        raise RuntimeError('Kairo no devolvió un recibo válido') from exc
    if not isinstance(receipt, dict) or receipt.get('batch_id') != manifest['batch_id']:
        raise RuntimeError('El recibo no corresponde al lote enviado')
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config')
    parser.add_argument('--manifest')
    parser.add_argument('--input', action='append', dest='inputs')
    parser.add_argument('--metadata')
    parser.add_argument('--receive', action='store_true')
    parser.add_argument('--runtime')
    args = parser.parse_args()
    if args.receive:
        if not args.runtime or args.config or args.manifest or args.inputs or args.metadata:
            parser.error('--receive requiere solamente --runtime')
        result = receive(sys.stdin.buffer, args.runtime)
    else:
        if (not args.config or args.runtime or bool(args.manifest) == bool(args.inputs)
                or args.metadata and not args.inputs):
            parser.error('Usa --config y una opción: --manifest o --input (repetible)')
        config = read(args.config)
        prepared = None
        if args.inputs:
            from amazon_inbox import prepare
            output = Path(config['archive_root'])/'ENTRADA'/'AMAZON'
            prepared = prepare([Path(p) for p in args.inputs], output,
                               metadata=read(args.metadata) if args.metadata else None)
            args.manifest = output/'manifests'/(prepared['batch_id']+'.json')
            if not prepared['files']:
                print(json.dumps({'batch_id':prepared['batch_id'], 'state':'no_documents',
                                  'errors':prepared['errors']}, ensure_ascii=False))
                return 1
        result = send(args.manifest, config)
        if prepared:
            result['preparation_errors'] = prepared['errors']
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

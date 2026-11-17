"""Manual Amazon PDF/ZIP intake. No browser, AI, tax approval or worker trigger.

prepare stores immutable documentary originals and a content-addressed manifest.
enqueue explicitly sends verified PDFs to the existing private ExpenseStore and
keeps operation receipts/provenance under queue_root/.amazon-imports, outside
the documentary archive. Source kinds are supplied metadata, never inferred.
"""
import argparse
import base64
from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import tempfile
import zipfile

SCHEMA_VERSION = 1
KINDS = ('invoice', 'credit_note', 'unknown')
MAX_PDF = 8 * 1024 * 1024
MAX_ZIP = 256 * 1024 * 1024
MAX_EXPANDED = 512 * 1024 * 1024
MAX_MEMBERS = 4000
MAX_RATIO = 200
MAX_PAGES = 60
SHA = re.compile(r'[a-f0-9]{64}')


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + '\n').encode()


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def now():
    return datetime.now(timezone.utc).isoformat()


def _read(path, limit):
    if not path.is_file() or path.is_symlink() or not stat.S_ISREG(path.stat().st_mode):
        raise ValueError('Se requiere un archivo regular, no un enlace.')
    if path.stat().st_size > limit:
        raise ValueError('El archivo supera el tamaño admitido.')
    with path.open('rb') as stream:
        raw = stream.read(limit + 1)
    if len(raw) > limit:
        raise ValueError('El archivo supera el tamaño admitido.')
    return raw


def _private_destination(path):
    path = Path(path).resolve()
    if any((p / '.git').exists() for p in (path, *path.parents)):
        raise ValueError('Los documentos y recibos deben quedar fuera del repositorio.')
    return path


def _path(root, relative):
    if not isinstance(relative, str) or '\\' in relative or ':' in relative:
        raise ValueError('Ruta documental no válida.')
    parts = relative.split('/')
    if not relative or any(p in ('', '.', '..') for p in parts):
        raise ValueError('Ruta documental fuera de la entrada.')
    candidate = Path(root).joinpath(*parts)
    if candidate.is_symlink() or not candidate.resolve().is_relative_to(Path(root).resolve()):
        raise ValueError('Ruta documental fuera de la entrada.')
    return candidate


def _immutable(root, relative, raw):
    target = _path(root, relative)
    target.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if target.exists():
        if _read(target, len(raw)) != raw:
            raise ValueError('El objeto existente no coincide; no se sobrescribe.')
        return
    fd, temporary = tempfile.mkstemp(prefix='.intake-', dir=target.parent)
    try:
        with os.fdopen(fd, 'wb') as output:
            output.write(raw)
            output.flush()
            os.fsync(output.fileno())
        try:
            # Atomic create-only publication; concurrent prepares cannot expose
            # a partially written content-addressed object or overwrite one.
            os.link(temporary, target)
        except FileExistsError:
            if _read(target, len(raw)) != raw:
                raise ValueError('El objeto concurrente no coincide.')
    finally:
        Path(temporary).unlink(missing_ok=True)


def _atomic(path, value):
    raw = encoded(value)
    if path.exists() and path.read_bytes() == raw:
        return
    fd, temporary = tempfile.mkstemp(prefix='.receipt-', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as output:
            output.write(raw)
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, path)
    finally:
        Path(temporary).unlink(missing_ok=True)


@contextmanager
def _lock(path):
    with path.open('a+b') as handle:
        if path.stat().st_size == 0:
            handle.write(b'0')
            handle.flush()
        handle.seek(0)
        if os.name == 'nt':
            import msvcrt
            msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        try:
            yield
        finally:
            handle.seek(0)
            if os.name == 'nt':
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(handle.fileno(), fcntl.LOCK_UN)


def _pdf(raw):
    from pypdf import PdfReader
    if not 8 < len(raw) <= MAX_PDF or not raw.startswith(b'%PDF-'):
        raise ValueError('PDF no admitido o superior a 8 MiB.')
    try:
        reader = PdfReader(io.BytesIO(raw), strict=True)
        if reader.is_encrypted:
            raise ValueError('PDF cifrado; se necesita una copia legible.')
        pages = len(reader.pages)
        if not 1 <= pages <= MAX_PAGES:
            raise ValueError('PDF fuera del límite de 1 a 60 páginas.')
        return pages
    except Exception as exc:
        if isinstance(exc, ValueError):
            raise
        raise ValueError('PDF ilegible o incompleto.') from None


def _metadata(value):
    if value is None:
        return {}
    if (not isinstance(value, dict) or set(value) != {'schema_version', 'documents'}
            or type(value['schema_version']) is not int or value['schema_version'] != 1
            or not isinstance(value['documents'], dict)):
        raise ValueError('Metadatos de procedencia no válidos.')
    for sha, fields in value['documents'].items():
        if (not isinstance(sha, str) or not SHA.fullmatch(sha) or not isinstance(fields, dict)
                or set(fields) - {'source_kind', 'order_reference'}):
            raise ValueError('Metadatos de documento no válidos; no se admiten URLs ni rutas.')
        if fields.get('source_kind', 'unknown') not in KINDS:
            raise ValueError('Tipo documental no admitido.')
        order = fields.get('order_reference')
        if order is not None and (not isinstance(order, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9 ._/-]{0,99}', order)):
            raise ValueError('Referencia de pedido no válida.')
    return value['documents']


def _member_name(name):
    if not isinstance(name, str) or '\\' in name or ':' in name or '\0' in name:
        return False
    parts = name.rstrip('/').split('/')
    return bool(name) and all(p not in ('', '.', '..') for p in parts)


def _identity(manifest):
    return digest(encoded({k:v for k,v in manifest.items() if k not in ('batch_id', 'created_at')}))


def prepare(inputs, output, metadata=None):
    """Archive explicit PDF/ZIP inputs and return schema-version-1 manifest.

    Metadata is {schema_version:1,documents:{PDF_SHA:{source_kind,order_reference}}}.
    Unknown is the default even when a filename contains 'invoice' or 'abono'.
    Each failed member is reported while independent valid PDFs are retained.
    """
    if not inputs:
        raise ValueError('Selecciona al menos un PDF o ZIP.')
    supplied = _metadata(metadata)
    root = _private_destination(output)
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    manifest = dict(schema_version=1, provider='amazon', marketplace='ES', artifacts=[], files=[], errors=[])

    def failed(name, artifact, member, code, message):
        if member is not None and not _member_name(member):
            # Distinguish rejected entries without persisting their unsafe path.
            message += ' Entrada ' + digest(member.encode('utf-8', errors='replace'))[:12] + '.'
        manifest['errors'].append(dict(original_filename=name, artifact_sha256=artifact,
            member_name=member if member is None or _member_name(member) else None, code=code, message=message))

    def accept(raw, original, zip_name, artifact, member):
        try:
            pages = _pdf(raw)
        except ValueError as exc:
            failed(original, artifact, member, 'invalid_pdf', str(exc))
            return
        sha = digest(raw)
        relative = f'objects/{sha}.pdf'
        _immutable(root, relative, raw)
        fields = supplied.get(sha, {})
        manifest['files'].append(dict(sha256=sha, size=len(raw), pages=pages, path=relative,
            original_filename=original, zip_filename=zip_name, artifact_sha256=artifact,
            member_name=member, source_kind=fields.get('source_kind', 'unknown'),
            order_reference=fields.get('order_reference')))

    for source in inputs:
        source = Path(source)
        suffix = source.suffix.lower()
        if suffix not in ('.pdf', '.zip'):
            failed(source.name, None, None, 'unsupported_input', 'Solo se admiten PDF o ZIP.')
            continue
        try:
            raw = _read(source, MAX_ZIP if suffix == '.zip' else MAX_PDF)
        except (OSError, ValueError):
            failed(source.name, None, None, 'unreadable_input', 'Archivo no disponible, enlazado o superior al límite.')
            continue
        sha = digest(raw)
        relative = f'objects/{sha}{suffix}'
        _immutable(root, relative, raw)
        manifest['artifacts'].append(dict(sha256=sha, size=len(raw), original_filename=source.name,
                                          kind=suffix[1:], path=relative))
        if suffix == '.pdf':
            accept(raw, source.name, None, sha, None)
            continue
        try:
            archive = zipfile.ZipFile(io.BytesIO(raw))
        except zipfile.BadZipFile:
            failed(source.name, sha, None, 'invalid_zip', 'ZIP ilegible o incompleto.')
            continue
        with archive:
            members = archive.infolist()
            if len(members) > MAX_MEMBERS:
                failed(source.name, sha, None, 'zip_limit', 'Demasiadas entradas en el ZIP; divide la descarga.')
                continue
            expanded = 0
            for member in members:
                mode = member.external_attr >> 16
                unsafe_type = stat.S_IFMT(mode) not in (0, stat.S_IFREG, stat.S_IFDIR)
                if not _member_name(member.filename) or unsafe_type:
                    failed(source.name, sha, member.filename, 'unsafe_member', 'Ruta o tipo de entrada ZIP no admitido.')
                    continue
                if member.is_dir():
                    continue
                if member.flag_bits & 1:
                    failed(source.name, sha, member.filename, 'encrypted_member', 'Entrada ZIP cifrada no admitida.')
                    continue
                if PurePosixPath(member.filename).suffix.lower() != '.pdf':
                    failed(source.name, sha, member.filename, 'unsupported_member', 'Entrada conservada dentro del ZIP; no es un PDF.')
                    continue
                if (member.file_size > MAX_PDF or member.file_size / max(member.compress_size, 1) > MAX_RATIO
                        or expanded + member.file_size > MAX_EXPANDED):
                    failed(source.name, sha, member.filename, 'zip_limit', 'Entrada fuera de los límites de descompresión.')
                    continue
                try:
                    with archive.open(member) as stream:
                        content = stream.read(MAX_PDF + 1)
                    expanded += len(content)
                    if len(content) != member.file_size or len(content) > MAX_PDF:
                        raise ValueError('Tamaño descomprimido no válido.')
                except (OSError, ValueError, RuntimeError, NotImplementedError, zipfile.BadZipFile):
                    failed(source.name, sha, member.filename, 'unreadable_member', 'No se pudo leer y verificar la entrada ZIP.')
                    continue
                accept(content, PurePosixPath(member.filename).name, source.name, sha, member.filename)

    # Stable identity for repeated preparation; original input paths and URLs are
    # deliberately absent. Different supplied provenance creates another batch.
    for key in ('artifacts', 'files', 'errors'):
        unique = {encoded(item):item for item in manifest[key]}
        manifest[key] = [unique[k] for k in sorted(unique)]
    manifest['batch_id'] = _identity(manifest)
    relative = f'manifests/{manifest["batch_id"]}.json'
    target = _path(root, relative)
    if target.exists():
        existing = load_manifest(target)
        return existing
    manifest['created_at'] = now()
    _immutable(root, relative, encoded(manifest))
    return manifest


def load_manifest(manifest_path):
    """Validate a manifest and every referenced ZIP/PDF SHA. Root is parent.parent."""
    path = Path(manifest_path)
    raw = _read(path, 16 * 1024 * 1024)
    manifest = json.loads(raw.decode('utf-8-sig'))
    keys = {'schema_version','provider','marketplace','artifacts','files','errors','batch_id','created_at'}
    if (not isinstance(manifest, dict) or set(manifest) != keys
            or type(manifest['schema_version']) is not int or manifest['schema_version'] != 1
            or manifest['provider'] != 'amazon' or manifest['marketplace'] != 'ES'
            or not isinstance(manifest['batch_id'], str) or not SHA.fullmatch(manifest['batch_id'])
            or manifest['batch_id'] != _identity(manifest)
            or path.name != manifest['batch_id'] + '.json' or path.parent.name != 'manifests'):
        raise ValueError('Manifiesto de entrada no válido o alterado.')
    root = path.parent.parent
    artifact_ids = set()
    if not all(isinstance(manifest[k], list) for k in ('artifacts','files','errors')):
        raise ValueError('Listados de manifiesto no válidos.')
    if not isinstance(manifest['created_at'], str):
        raise ValueError('Fecha de manifiesto no válida.')
    datetime.fromisoformat(manifest['created_at'])
    for group in ('artifacts', 'files'):
        for item in manifest[group]:
            allowed = ({'sha256','size','original_filename','kind','path'} if group == 'artifacts' else
                {'sha256','size','pages','path','original_filename','zip_filename','artifact_sha256',
                 'member_name','source_kind','order_reference'})
            if not isinstance(item, dict) or set(item) != allowed or not isinstance(item.get('sha256'), str) or not SHA.fullmatch(item['sha256']):
                raise ValueError('Objeto documental no válido.')
            kind = item.get('kind') if group == 'artifacts' else 'pdf'
            if kind not in ('pdf','zip') or item.get('path') != f'objects/{item["sha256"]}.{kind}':
                raise ValueError('Ruta de objeto no válida.')
            content = _read(_path(root, item['path']), MAX_ZIP if kind == 'zip' else MAX_PDF)
            if digest(content) != item['sha256'] or type(item.get('size')) is not int or len(content) != item['size']:
                raise ValueError('Un original no coincide con su manifiesto.')
            if not isinstance(item.get('original_filename'), str) or '/' in item['original_filename'] or '\\' in item['original_filename']:
                raise ValueError('Nombre documental no válido.')
            if group == 'artifacts':
                artifact_ids.add(item['sha256'])
            else:
                _metadata({'schema_version':1,'documents':{item['sha256']:{
                    'source_kind':item.get('source_kind'),'order_reference':item.get('order_reference')}}})
                if item.get('artifact_sha256') not in artifact_ids or _pdf(content) != item.get('pages'):
                    raise ValueError('Procedencia o paginación documental no válida.')
                if item.get('member_name') is not None and not _member_name(item['member_name']):
                    raise ValueError('Referencia ZIP no válida.')
                if item.get('zip_filename') is not None and (not isinstance(item['zip_filename'], str)
                        or '/' in item['zip_filename'] or '\\' in item['zip_filename']):
                    raise ValueError('Nombre de ZIP no válido.')
    for error in manifest['errors']:
        if (not isinstance(error, dict) or set(error) != {'original_filename','artifact_sha256','member_name','code','message'}
                or not isinstance(error['original_filename'], str) or '/' in error['original_filename'] or '\\' in error['original_filename']
                or (error['member_name'] is not None and not _member_name(error['member_name']))):
            raise ValueError('Incidencia documental no válida.')
    return manifest


def enqueue(manifest_path, queue_root, archive_root=None, ledger_relative=None, expected_ledger_sha256=None):
    """Explicit intake into Kairo's EXISTING queue, never approval or sync.

    Optional known-ledger suppression requires all three ledger arguments and an
    exact ledger SHA. Credit notes and unknown kinds retain an external review
    flag; this receipt is not a new tax adapter or a modification of ExpenseStore.
    """
    from expense_workflow import ExpenseStore
    manifest = load_manifest(manifest_path)
    source_root = Path(manifest_path).parent.parent
    queue = _private_destination(queue_root)
    if not queue.is_dir() or queue.is_symlink():
        raise ValueError('Selecciona la cola privada existente de Kairo.')
    provided = (archive_root is not None, ledger_relative is not None, expected_ledger_sha256 is not None)
    known = set()
    if any(provided):
        if not all(provided) or not isinstance(expected_ledger_sha256, str) or not SHA.fullmatch(expected_ledger_sha256):
            raise ValueError('La consulta del libro necesita raíz, ruta relativa y SHA verificado.')
        ledger_raw = _read(_path(archive_root, ledger_relative), 32 * 1024 * 1024)
        if digest(ledger_raw) != expected_ledger_sha256:
            raise ValueError('El libro no coincide con la versión verificada.')
        ledger = json.loads(ledger_raw.decode('utf-8-sig'))
        known = {row['sha256'] for row in ledger['records']}
    receipts = queue / '.amazon-imports'
    receipts.mkdir(exist_ok=True, mode=0o700)
    receipt_path = receipts / (manifest['batch_id'] + '.json')
    store = ExpenseStore(queue)
    with _lock(receipts / '.enqueue.lock'):
        receipt = json.loads(_read(receipt_path, 32 * 1024 * 1024).decode()) if receipt_path.exists() else dict(
            schema_version=1, batch_id=manifest['batch_id'], created_at=now(), provider='amazon',
            marketplace='ES', documents=[], manifest=manifest)
        if receipt.get('batch_id') != manifest['batch_id'] or receipt.get('manifest') != manifest:
            raise ValueError('El recibo existente no corresponde al manifiesto.')
        existing = {row['sha256']:row for row in store.list()}
        completed = {row['sha256']:row for row in receipt['documents'] if row['status'] != 'error'}
        for sha in sorted({item['sha256'] for item in manifest['files']}):
            if sha in completed:
                old = completed[sha]
                if old.get('draft_id') and existing.get(sha, {}).get('id') != old['draft_id']:
                    raise ValueError('Falta un borrador previamente importado; revisa el recibo.')
                continue
            origins = [item for item in manifest['files'] if item['sha256'] == sha]
            item = origins[0]
            entry = dict(sha256=sha, source_kind=item['source_kind'], order_reference=item['order_reference'],
                review_required=True, flag=('credit_note_adapter_required' if item['source_kind']=='credit_note'
                    else 'document_kind_unconfirmed' if item['source_kind']=='unknown' else 'document_review_required'),
                origins=origins, draft_id=None)
            if item['source_kind'] == 'credit_note':
                entry.update(status='manual_review_credit_note',
                    message='Abono conservado; el adaptador de rectificativas está pendiente. No se envía a la bandeja de facturas.')
            elif sha in known:
                entry.update(status='already_in_book', ledger_sha256=expected_ledger_sha256)
            else:
                try:
                    content = _read(_path(source_root, item['path']), MAX_PDF)
                    if digest(content) != sha:
                        raise ValueError('El original cambió antes de subirlo.')
                    draft = store.upload(item['original_filename'], base64.b64encode(content).decode(), 'amazon-import')
                    entry.update(status='existing_in_queue' if sha in existing else 'created',
                                 draft_id=draft['id'], state=draft['state'])
                    existing[sha] = draft
                except (OSError, ValueError):
                    entry.update(status='error', message='No se pudo guardar este PDF; conserva el original y reintenta.')
            receipt['documents'] = [r for r in receipt['documents'] if r['sha256'] != sha] + [entry]
            _atomic(receipt_path, receipt)
        if not receipt_path.exists():
            _atomic(receipt_path, receipt)
        return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    prep = commands.add_parser('prepare')
    prep.add_argument('--input', action='append', required=True, type=Path)
    prep.add_argument('--output', required=True, type=Path)
    prep.add_argument('--metadata', type=Path)
    send = commands.add_parser('enqueue')
    send.add_argument('--manifest', required=True, type=Path)
    send.add_argument('--queue-root', required=True, type=Path)
    send.add_argument('--archive-root', type=Path)
    send.add_argument('--ledger')
    send.add_argument('--expected-ledger-sha256')
    args = parser.parse_args()
    if args.command == 'prepare':
        metadata = json.loads(_read(args.metadata, 4 * 1024 * 1024).decode('utf-8-sig')) if args.metadata else None
        manifest = prepare(args.input, args.output, metadata)
        result = dict(batch_id=manifest['batch_id'], manifest=f'manifests/{manifest["batch_id"]}.json',
            files=len(manifest['files']), unique_pdfs=len({f['sha256'] for f in manifest['files']}), errors=manifest['errors'])
    else:
        receipt = enqueue(args.manifest, args.queue_root, args.archive_root, args.ledger, args.expected_ledger_sha256)
        result = dict(batch_id=receipt['batch_id'], documents=receipt['documents'])
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()

"""Private expense queue and explicit CAS import into the canonical AUTONOMO archive.

No submission, payment, network access or automatic fiscal classification.
The Kairo queue is never an editable copy of the canonical ledger.
"""
import argparse
import base64
from contextlib import contextmanager
from copy import deepcopy
from datetime import date, datetime, timezone
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import uuid

from ledger import calculate, money, quarter, validate, verify_sources
from review_year import review, render

MAX_PDF_BYTES = 8 * 1024 * 1024
MAX_PAGES = 60
FIELDS = {'year', 'number', 'party', 'tax_id', 'date', 'period', 'base', 'vat',
          'withholding', 'total', 'include', 'mapping', 'rate', 'note',
          'receipt_date', 'receipt_date_source', 'archive_path', 'reviewed_all_pages',
          'single_invoice', 'fiscal_review_confirmed'}


def now():
    return datetime.now(timezone.utc).isoformat()


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + '\n').encode('utf-8')


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def atomic(path, raw):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + '.' + uuid.uuid4().hex + '.tmp')
    try:
        with os.fdopen(os.open(temp, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600), 'wb') as stream:
            stream.write(raw)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)


def confined(root, relative):
    if not isinstance(relative, str) or '\\' in relative or ':' in relative:
        raise ValueError('Ruta relativa no válida')
    rel = PurePosixPath(relative)
    if rel.is_absolute() or not rel.parts or any(x in ('..', '.') for x in rel.parts):
        raise ValueError('Ruta fuera del archivo autorizado')
    root = Path(root).resolve()
    result = (root / relative).resolve()
    if not result.is_relative_to(root) or result == root:
        raise ValueError('Ruta fuera del archivo autorizado')
    return result


@contextmanager
def exclusive(path):
    """Cooperating writers use this lock; stale locks require operator inspection."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError:
        raise ValueError('Otra actualización está en curso; revisa el bloqueo antes de reintentar')
    try:
        os.write(fd, encoded({'pid': os.getpid(), 'at': now()}))
        os.close(fd)
        yield
    finally:
        path.unlink(missing_ok=True)


def decode_pdf(value):
    if not isinstance(value, str) or len(value) > (MAX_PDF_BYTES + 2) // 3 * 4:
        raise ValueError('PDF demasiado grande: máximo 8 MiB')
    try:
        raw = base64.b64decode(value, validate=True)
    except (ValueError, TypeError):
        raise ValueError('Contenido PDF no válido')
    if not 8 < len(raw) <= MAX_PDF_BYTES or not raw.startswith(b'%PDF-'):
        raise ValueError('El archivo no es un PDF admitido')
    return raw


def inspect_pdf(raw):
    from pypdf import PdfReader
    try:
        pdf = PdfReader(io.BytesIO(raw), strict=True)
        if pdf.is_encrypted:
            raise ValueError('El PDF está cifrado; aporta una copia legible')
        if not 1 <= len(pdf.pages) <= MAX_PAGES:
            raise ValueError('El PDF debe contener entre 1 y 60 páginas')
        text = '\n'.join((page.extract_text() or '')[:20000] for page in pdf.pages)[:60000]
        return len(pdf.pages), text
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError('No se puede leer el PDF; revisa el archivo') from exc


def propose(text):
    """Only unambiguous labelled values become suggestions, never accepted data."""
    result = {}
    for field, label in [('base', r'base\s+imponible'), ('vat', r'(?:cuota\s+)?iva'),
                         ('total', r'total(?:\s+factura)?')]:
        matches = re.findall(r'(?im)^\s*' + label + r'\s*[:=]?\s*([0-9]+(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+\.[0-9]{2})\s*(?:€|EUR)?\s*$', text)
        if len(matches) == 1:
            raw = matches[0]
            result[field] = raw.replace('.', '').replace(',', '.') if ',' in raw else raw
    matches = re.findall(r'(?im)^\s*(?:n[úu]mero\s+(?:de\s+)?factura|factura\s+n[ºo°.]*)\s*[:=]?\s*([\w/-]+)\s*$', text)
    if len(matches) == 1:
        result['number'] = matches[0]
    return result


def clean_fields(fields):
    if not isinstance(fields, dict) or set(fields) - FIELDS:
        raise ValueError('Campos de gasto no admitidos')
    result = dict(fields)
    for key, value in result.items():
        if key in ('include', 'reviewed_all_pages', 'single_invoice', 'fiscal_review_confirmed'):
            if type(value) is not bool:
                raise ValueError('La confirmación debe ser explícita')
        elif key == 'year':
            if type(value) is not int or not 2000 <= value <= 2100:
                raise ValueError('Ejercicio no válido')
        elif not isinstance(value, str) or len(value) > (2000 if key == 'note' else 500):
            raise ValueError('Valor de campo no válido')
        else:
            result[key] = value.strip()
    return result


def make_record(draft):
    f = clean_fields(draft['fields'])
    required = ('year', 'number', 'party', 'tax_id', 'date', 'period', 'base', 'vat',
                'withholding', 'total', 'include', 'mapping', 'rate', 'archive_path')
    if any(key not in f or f[key] == '' for key in required):
        raise ValueError('Completa identificación, fechas, importes, destino y tratamiento')
    if f.get('reviewed_all_pages') is not True or f.get('single_invoice') is not True:
        raise ValueError('Revisa todas las páginas y confirma que contienen una sola factura')
    if f['include'] and f.get('fiscal_review_confirmed') is not True:
        raise ValueError('Confirma la revisión del tratamiento fiscal antes de incorporar al cálculo')
    if not f['include'] and not f.get('note'):
        raise ValueError('Indica el motivo de exclusión')
    for key in ('date', 'receipt_date'):
        if f.get(key):
            date.fromisoformat(f[key])
    if f.get('receipt_date') and not f.get('receipt_date_source'):
        raise ValueError('Indica de dónde procede la fecha de recepción')
    if f.get('receipt_date_source') and not f.get('receipt_date'):
        raise ValueError('Falta la fecha de recepción')
    prefix = f'FACTURAS/{f["year"]}/'
    if not f['archive_path'].startswith(prefix) or not f['archive_path'].lower().endswith('.pdf'):
        raise ValueError('El PDF debe archivarse bajo FACTURAS/ejercicio, en la carpeta elegida')
    confined(Path.cwd(), f['archive_path'])
    record = {key: f[key] for key in ('number', 'party', 'tax_id', 'date', 'period', 'base',
                                     'vat', 'withholding', 'total', 'include', 'mapping', 'rate')}
    record.update(kind='expense', source=f['archive_path'], sha256=draft['sha256'],
                  pages=list(range(1, draft['pages'] + 1)), note=f.get('note', ''))
    for key in ('receipt_date', 'receipt_date_source'):
        if f.get(key):
            record[key] = f[key]
    validate([record], f['year'])
    if money(record['base']) < 0 or money(record['vat']) < 0 or money(record['total']) < 0:
        raise ValueError('Rectificativas requieren revisión específica')
    return record


class ExpenseStore:
    def __init__(self, runtime):
        self.root = Path(runtime)

    def _dir(self, ident):
        if not isinstance(ident, str) or not re.fullmatch('[a-f0-9]{32}', ident):
            raise ValueError('Identificador de gasto no válido')
        return self.root / ident

    def _save(self, draft, actor, action):
        if not isinstance(actor, str) or not actor.strip():
            raise ValueError('Actor requerido')
        draft['updated_at'] = now()
        draft.setdefault('audit', []).append({'at': draft['updated_at'], 'actor': actor, 'action': action})
        draft.pop('revision', None)
        draft['revision'] = digest(encoded(draft))
        atomic(self._dir(draft['id']) / 'draft.json', encoded(draft))
        return deepcopy(draft)

    def list(self):
        if not self.root.exists():
            return []
        return sorted([self.get(p.parent.name) for p in self.root.glob('*/draft.json')],
                      key=lambda d: d['updated_at'], reverse=True)

    def get(self, ident):
        draft = read(self._dir(ident) / 'draft.json')
        expected = draft.get('revision')
        payload = {key: value for key, value in draft.items() if key != 'revision'}
        if draft.get('id') != ident or digest(encoded(payload)) != expected:
            raise ValueError('El borrador ha cambiado fuera del circuito de revisión')
        return draft

    def pdf(self, ident):
        draft = self.get(ident)
        raw = (self._dir(ident) / 'original.pdf').read_bytes()
        if digest(raw) != draft['sha256']:
            raise ValueError('El PDF original ha cambiado')
        return raw

    def upload(self, filename, pdf_base64, actor):
        if not isinstance(filename, str) or not filename.lower().endswith('.pdf') or len(filename) > 200:
            raise ValueError('Nombre de PDF no válido')
        raw = decode_pdf(pdf_base64)
        pages, text = inspect_pdf(raw)
        with exclusive(self.root / '.queue.lock'):
            sha = digest(raw)
            for old in self.list():
                if old['sha256'] == sha:
                    return old
            ident = uuid.uuid4().hex
            atomic(self._dir(ident) / 'original.pdf', raw)
            draft = dict(id=ident, state='draft', filename=Path(filename).name, sha256=sha,
                         pages=pages, text_excerpt=text, fields=propose(text),
                         warnings=['Los datos extraídos son propuestas: revisa el documento completo.'],
                         created_at=now(), approval=None)
            if not text.strip():
                draft['warnings'].append('Sin texto extraíble. Introduce los datos tras revisar el PDF.')
            if pages > 1:
                draft['warnings'].append('Comprueba que todas las páginas pertenecen a una sola factura.')
            return self._save(draft, actor, 'upload')

    def edit(self, ident, expected_revision, fields, actor):
        with exclusive(self.root / '.queue.lock'):
            draft = self.get(ident)
            if draft['revision'] != expected_revision:
                raise ValueError('El borrador cambió; vuelve a abrirlo antes de guardar')
            if draft['state'] != 'draft':
                raise ValueError('El gasto aprobado está cerrado para incorporación; registra una corrección por separado')
            draft['fields'].update(clean_fields(fields))
            if draft['fields'].get('year') and 'archive_path' not in fields:
                draft['fields']['archive_path'] = f'FACTURAS/{draft["fields"]["year"]}/GASTOS KAIRO/{ident}.pdf'
            draft['state'], draft['approval'] = 'draft', None
            # Every edit invalidates review confirmations, unless supplied anew in this action.
            for key in ('reviewed_all_pages', 'single_invoice', 'fiscal_review_confirmed'):
                draft['fields'][key] = fields.get(key, False)
            return self._save(draft, actor, 'edit')

    def update(self, ident, fields, expected_revision, actor):
        return self.edit(ident, expected_revision, fields, actor)

    def approve(self, ident, expected_revision, actor):
        with exclusive(self.root / '.queue.lock'):
            draft = self.get(ident)
            if draft['revision'] != expected_revision:
                raise ValueError('El borrador cambió; revisa la nueva versión')
            if draft['state'] != 'draft':
                raise ValueError('El gasto ya está aprobado o incorporado')
            self.pdf(ident)
            record = make_record(draft)
            draft['state'] = 'approved'
            draft['approval'] = {'actor': actor, 'at': now(), 'reviewed_revision': expected_revision,
                                 'record_sha256': digest(encoded(record))}
            return self._save(draft, actor, 'approve')

    def bundle(self, ident):
        draft = self.get(ident)
        if draft['state'] != 'approved' or not draft['approval']:
            raise ValueError('Revisa y aprueba el gasto antes de exportarlo')
        record = make_record(draft)
        if digest(encoded(record)) != draft['approval']['record_sha256']:
            raise ValueError('El registro ya no coincide con la aprobación')
        result = dict(schema_version=1, operation_id=ident, year=draft['fields']['year'],
                      record=record, approval=draft['approval'],
                      pdf_base64=base64.b64encode(self.pdf(ident)).decode('ascii'))
        result['bundle_sha256'] = digest(encoded(result))
        return result

    def mark_applied(self, ident, bundle_sha256, ledger_sha256, actor='archive-worker'):
        """Worker-only ACK, after canonical import and remote-copy verification.

        Do not mount this as a browser action. The caller must verify the remote
        manifest; this method records its receipt, it cannot prove network state.
        """
        if not re.fullmatch('[a-f0-9]{64}', ledger_sha256 or ''):
            raise ValueError('Huella de libro no válida')
        with exclusive(self.root / '.queue.lock'):
            draft = self.get(ident)
            if draft['state'] == 'incorporated':
                if draft.get('incorporation', {}).get('bundle_sha256') != bundle_sha256:
                    raise ValueError('El acuse no corresponde al paquete incorporado')
                return draft
            if self.bundle(ident)['bundle_sha256'] != bundle_sha256:
                raise ValueError('El acuse no corresponde al paquete aprobado')
            draft['state'] = 'incorporated'
            draft['incorporation'] = {'bundle_sha256': bundle_sha256,
                'ledger_sha256': ledger_sha256, 'at': now(), 'actor': actor}
            return self._save(draft, actor, 'incorporated')


Store = ExpenseStore


def validate_bundle(bundle):
    if not isinstance(bundle, dict) or bundle.get('schema_version') != 1:
        raise ValueError('Paquete de gasto no admitido')
    if not re.fullmatch('[a-f0-9]{32}', bundle.get('operation_id', '')):
        raise ValueError('Operación no válida')
    if digest(encoded({k: v for k, v in bundle.items() if k != 'bundle_sha256'})) != bundle.get('bundle_sha256'):
        raise ValueError('El paquete cambió durante la transferencia')
    record = bundle['record']
    raw = decode_pdf(bundle['pdf_base64'])
    if digest(raw) != record['sha256']:
        raise ValueError('El PDF no coincide con el aprobado')
    if record.get('kind') != 'expense':
        raise ValueError('El paquete solo admite gastos')
    validate([record], bundle['year'])
    approval = bundle.get('approval') or {}
    if not approval.get('actor') or not approval.get('at') or approval.get('record_sha256') != digest(encoded(record)):
        raise ValueError('Aprobación ausente o no correspondiente al registro')
    if not record['source'].startswith(f'FACTURAS/{bundle["year"]}/') or not record['source'].lower().endswith('.pdf'):
        raise ValueError('Destino documental no autorizado')
    return raw


def apply_bundle(bundle, archive_root, ledger_relative, expected_ledger_sha256,
                 index_relative=None, backup_root=None):
    """Import a locally trusted approved bundle on the mini, then publish a snapshot.

    Bundle hashes detect corruption, not identity: transfer only from authenticated
    Kairo. An operation receipt in the canonical JSON makes retries idempotent.
    A crash after canonical replace is recovered by reapplying the same bundle.
    """
    raw = validate_bundle(bundle)
    root = Path(archive_root).resolve()
    ledger_path = confined(root, ledger_relative)
    year, op = bundle['year'], bundle['operation_id']
    index_relative = index_relative or f'REVISIONES/{year}/modelos-index.json'
    index_path = confined(root, index_relative)
    if backup_root is None:
        raise ValueError('Indica directorio privado de respaldos fuera de AUTONOMO')
    backup = Path(backup_root).resolve()
    if backup.is_relative_to(root):
        raise ValueError('Los respaldos de trabajo deben quedar fuera de AUTONOMO')
    backup.mkdir(parents=True, exist_ok=True)
    lock = backup / (digest(str(ledger_path).encode()) + '.lock')
    with exclusive(lock):
        prior_raw = ledger_path.read_bytes()
        prior_hash = digest(prior_raw)
        data = json.loads(prior_raw.decode('utf-8-sig'))
        if data['year'] != year:
            raise ValueError('El ejercicio del libro no coincide')
        receipts = data.get('expense_imports', {})
        previous = receipts.get(op)
        if previous and previous['bundle_sha256'] != bundle['bundle_sha256']:
            raise ValueError('La operación ya existe con otro contenido')
        if not previous and prior_hash != expected_ledger_sha256:
            raise ValueError('El libro cambió; descarga y revisa la versión actual antes de incorporar')
        verify_sources(data, root)
        destination = confined(root, bundle['record']['source'])
        if destination.exists() and destination.read_bytes() != raw:
            raise ValueError('Ya existe otro documento con ese nombre; no se sobrescribe')
        if not previous:
            if any(r['sha256'] == bundle['record']['sha256'] for r in data['records']):
                raise ValueError('Este PDF ya está incorporado; revisa el posible duplicado')
            updated = deepcopy(data)
            updated['records'].append(deepcopy(bundle['record']))
            validate(updated['records'], year)
            updated.setdefault('expense_imports', {})[op] = {
                'bundle_sha256': bundle['bundle_sha256'], 'at': now(),
                'approval': bundle['approval'], 'source': bundle['record']['source']}
            updated.setdefault('documents', []).append({'source': bundle['record']['source'],
                'sha256': bundle['record']['sha256'], 'pages': len(bundle['record']['pages']),
                'status': 'Gasto revisado e incorporado desde la cola privada'})
            # as_of is a coverage date, never advanced merely because a file arrived.
            updated['last_updated_at'] = now()
            updated['calculations'] = calculate(updated)
        else:
            updated = data
        # Content-addressed backups are never overwritten with a newer version.
        old_copy = backup / (prior_hash + '.json')
        if not old_copy.exists():
            atomic(old_copy, prior_raw)
        if not destination.exists():
            # Create-only prevents even an external writer from losing an original.
            destination.parent.mkdir(parents=True, exist_ok=True)
            with destination.open('xb') as output:
                output.write(raw)
                output.flush()
                os.fsync(output.fileno())
        report = review(updated, root)
        ledger_bytes, report_bytes = encoded(updated), encoded(report)
        version = digest(ledger_bytes)
        outputs = {'libro.json': ledger_bytes, 'revision.json': report_bytes,
                   'revision.html': render(report).encode('utf-8')}
        # Report/render code may evolve while canonical ledger bytes stay the same.
        snapshot_version = digest(b''.join(outputs[name] for name in sorted(outputs)))
        snapshot_prefix = f'REVISIONES/{year}/versiones/{snapshot_version}'
        for filename, content in outputs.items():
            path = confined(root, snapshot_prefix + '/' + filename)
            if path.exists() and path.read_bytes() != content:
                raise ValueError('La instantánea existente no coincide')
            if not path.exists():
                atomic(path, content)
        index_raw = index_path.read_bytes() if index_path.exists() else None
        index = json.loads(index_raw.decode('utf-8-sig')) if index_raw else {'downloads': {}}
        index['ledger'] = {'path': snapshot_prefix + '/libro.json', 'sha256': version}
        index['report'] = {'path': snapshot_prefix + '/revision.json', 'sha256': digest(report_bytes)}
        index['updated'] = now()
        index['canonical_ledger_sha256'] = version
        index['distribution_status'] = 'Pendiente de verificar copia remota de Drive y Kairo'
        if index_raw is not None:
            atomic(backup / ('index-' + digest(index_raw) + '.json'), index_raw)
        # Final compare protects against non-cooperating edits detected since read.
        if digest(ledger_path.read_bytes()) != prior_hash:
            raise ValueError('El libro cambió durante la preparación; no se ha reemplazado')
        if (index_path.read_bytes() if index_path.exists() else None) != index_raw:
            raise ValueError('El índice cambió durante la preparación; vuelve a revisar')
        if not previous:
            atomic(ledger_path, ledger_bytes)
        # Publish index last, pointing only to complete immutable outputs.
        atomic(index_path, encoded(index))
        return {'operation_id': op, 'state': 'incorporated', 'already_applied': bool(previous),
                'ledger_sha256': version, 'index_path': index_relative,
                'source': bundle['record']['source'], 'snapshot': snapshot_prefix,
                'remote_verified': False}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--bundle', required=True, type=Path)
    p.add_argument('--root', required=True, type=Path)
    p.add_argument('--ledger', required=True)
    p.add_argument('--expected-sha256', required=True)
    p.add_argument('--backup-root', required=True, type=Path)
    p.add_argument('--index')
    args = p.parse_args()
    result = apply_bundle(read(args.bundle), args.root, args.ledger, args.expected_sha256,
                          args.index, args.backup_root)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()

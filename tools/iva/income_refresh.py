"""Incremental refresh of supported income PDFs; canonical existing rows are immutable."""
import argparse
from copy import deepcopy
import io
import json
from pathlib import Path

from pypdf import PdfReader
from collect_income import parse_income
from expense_workflow import atomic, confined, digest, encoded, exclusive, now
from ledger import calculate, validate, verify_sources


def identity(record):
    return (record['kind'], (record.get('tax_id') or record['party']).strip().casefold(),
            record['number'].strip().casefold())


def refresh(root, ledger_relative, backup_root, profile=None, folder=None):
    root = Path(root).resolve()
    ledger_path = confined(root, ledger_relative)
    backup = Path(backup_root).resolve()
    if backup.is_relative_to(root):
        raise ValueError('Los respaldos de trabajo deben quedar fuera de AUTONOMO')
    lock = backup / (digest(str(ledger_path).encode()) + '.lock')
    with exclusive(lock):
        old = ledger_path.read_bytes()
        old_hash = digest(old)
        data = json.loads(old.decode('utf-8-sig'))
        verify_sources(data, root)
        validate(data['records'], data['year'])
        result = {'added': [], 'warnings': [], 'ledger_sha256': old_hash,
                  'changed': False, 'remote_verified': False}
        def warning(source, code, message):
            result['warnings'].append({'source': source, 'code': code, 'message': message})
        if profile is None:
            customers = {(r['party'], r.get('tax_id')) for r in data['records']
                         if r['kind'] == 'income' and r['include']}
            if len(customers) != 1 or not next(iter(customers))[1]:
                warning('', 'customer_profile', 'No hay un único cliente acreditado en el libro; configura el perfil de lectura.')
                return result
            customer, tax_id = next(iter(customers))
            profile = {'customer': customer, 'customer_tax_id': tax_id}
        if not isinstance(profile, dict) or any(not isinstance(profile.get(k), str) or not profile[k].strip()
                                               for k in ('customer', 'customer_tax_id')):
            raise ValueError('Perfil de cliente incompleto')
        folder_relative = folder or f'FACTURAS/{data["year"]}/A - FACTURAS INGRESOS'
        source_dir = confined(root, folder_relative)
        if not source_dir.is_dir():
            warning(folder_relative, 'missing_folder', 'La carpeta de ingresos no está disponible; no se presume vacía.')
            return result
        known_sources = {r['source'] for r in data['records']}
        known_hashes = {r['sha256'] for r in data['records']}
        known_identity = {identity(r) for r in data['records']}
        candidates = []
        for path in sorted(source_dir.iterdir()):
            if not path.is_file() or path.suffix.lower() != '.pdf':
                continue
            relative = path.relative_to(root).as_posix()
            actual = confined(root, relative)
            if relative in known_sources:
                continue  # verify_sources already checked these exact originals
            raw = actual.read_bytes()
            sha = digest(raw)
            if sha in known_hashes:
                warning(relative, 'duplicate_pdf', 'Copia de un PDF ya incorporado; no se vuelve a sumar.')
                continue
            try:
                if len(raw) > 8 * 1024 * 1024 or not raw.startswith(b'%PDF-'):
                    raise ValueError('PDF no admitido o superior a 8 MiB')
                pdf = PdfReader(io.BytesIO(raw), strict=True)
                if pdf.is_encrypted or len(pdf.pages) != 1:
                    raise ValueError('Este adaptador necesita una factura legible de una página')
                record = parse_income(pdf.pages[0].extract_text() or '', profile)
                record.update(source=relative, sha256=sha)
                validate([record], data['year'])
                if identity(record) in known_identity:
                    raise ValueError('Ya existe una factura con esta identidad y otro contenido; revisar versiones')
                if data.get('references', {}).get(record['period']):
                    raise ValueError('La factura corresponde a un trimestre presentado; requiere revisión del histórico')
                candidates.append(record)
            except Exception as exc:
                warning(relative, 'review_required', str(exc)[:300])
        groups = {}
        for record in candidates:
            groups.setdefault(identity(record), []).append(record)
        accepted = []
        for group in groups.values():
            if len({r['sha256'] for r in group}) != 1:
                for record in group:
                    warning(record['source'], 'conflicting_invoice', 'Varios PDF nuevos tienen la misma identidad y distinto contenido; no se elige una versión automáticamente.')
                continue
            accepted.append(group[0])
            for copy in group[1:]:
                warning(copy['source'], 'duplicate_pdf', 'Copia exacta de la factura incorporada en este lote; no se vuelve a sumar.')
        if not accepted:
            return result
        updated = deepcopy(data)
        updated['records'].extend(accepted)
        validate(updated['records'], updated['year'])
        for record in accepted:
            updated.setdefault('documents', []).append({'source': record['source'],
                'sha256': record['sha256'], 'pages': 1, 'status': 'Ingreso incorporado por adaptador documental conocido'})
        updated['last_updated_at'] = now()
        updated.setdefault('income_imports', []).append({'at': updated['last_updated_at'],
            'sources': [{'source': r['source'], 'sha256': r['sha256']} for r in accepted],
            'previous_ledger_sha256': old_hash, 'warnings': result['warnings']})
        updated['calculations'] = calculate(updated)
        # New and existing originals must still match immediately before commit.
        verify_sources(updated, root)
        if digest(ledger_path.read_bytes()) != old_hash:
            raise ValueError('El libro cambió durante la lectura; no se ha reemplazado')
        backup.mkdir(parents=True, exist_ok=True)
        backup_path = backup / (old_hash + '.json')
        if not backup_path.exists():
            atomic(backup_path, old)
        payload = encoded(updated)
        atomic(ledger_path, payload)
        result.update(added=[r['source'] for r in accepted], ledger_sha256=digest(payload), changed=True)
        return result


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--root', type=Path, required=True)
    p.add_argument('--ledger', required=True)
    p.add_argument('--backup-root', type=Path, required=True)
    p.add_argument('--profile', type=Path)
    p.add_argument('--folder')
    args = p.parse_args()
    profile = json.loads(args.profile.read_text(encoding='utf-8-sig')) if args.profile else None
    print(json.dumps(refresh(args.root, args.ledger, args.backup_root, profile, args.folder), ensure_ascii=False))


if __name__ == '__main__':
    main()

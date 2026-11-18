"""Documentary display metadata, separate from the fiscal ledger and its totals."""
from copy import deepcopy
from decimal import Decimal, InvalidOperation
import json
from pathlib import Path, PurePosixPath
import re


def detail_path(ledger_path, year):
    return Path(ledger_path).with_name(f'detalles_documentales_{int(year)}.json')


def attach_details(data, ledger_path):
    result = deepcopy(data)
    path = detail_path(ledger_path, data['year'])
    if not path.exists() or path.is_symlink():
        return result
    try:
        source = json.loads(path.read_text(encoding='utf-8-sig'))
        if source.get('schema_version') != 1 or source.get('year') != data['year']:
            return result
        documents = source.get('documents', {})
        if not isinstance(documents, dict):
            return result
        for row in result['records']:
            # Some scanned PDFs contain several invoices. A document-level
            # description must not silently be assigned to all of them.
            if sum(r['sha256'] == row['sha256'] for r in result['records']) != 1:
                continue
            detail = documents.get(row['sha256'])
            if not isinstance(detail, dict):
                continue
            clean = {}
            evidence = detail.get('evidence', [])
            if not isinstance(evidence, list) or not evidence or not all(
                    isinstance(x, dict) and type(x.get('page')) is int and x['page'] > 0
                    and isinstance(x.get('quote'), str) and 0 < len(x['quote']) <= 3000 for x in evidence):
                continue
            description = detail.get('description')
            if isinstance(description, str) and 0 < len(description) <= 600:
                clean['description'] = description
            lines = detail.get('work_lines', [])
            if isinstance(lines, list) and 0 < len(lines) <= 20:
                try:
                    normalized = []
                    for line in lines:
                        days, rate = str(line['days']), str(line['rate'])
                        if not all(re.fullmatch(r'\d+(?:\.\d{1,2})?', x) for x in (days, rate)):
                            raise ValueError('Invalid work line')
                        normalized.append({'days': days, 'rate': rate})
                    if sum((Decimal(x['days'])*Decimal(x['rate']) for x in normalized), Decimal(0)) == Decimal(row['base']):
                        clean['work_lines'] = normalized
                except (ValueError, KeyError, TypeError, InvalidOperation):
                    pass
            for key, amount in [('vat_rate', 'vat'), ('withholding_rate', 'withholding')]:
                value = detail.get(key)
                if isinstance(value, str) and re.fullmatch(r'\d+(?:\.\d{1,2})?', value):
                    if (Decimal(row['base'])*Decimal(value)/100).quantize(Decimal('.01')) == Decimal(row[amount]):
                        clean[key] = value
            clean['evidence'] = evidence
            row['display_details'] = clean
    except (OSError, ValueError, TypeError, KeyError):
        return deepcopy(data)
    return result


def description(row):
    detail = row.get('display_details', {})
    if detail.get('description'):
        return detail['description'], 'Según PDF original'
    if row.get('description'):
        return str(row['description']), 'Concepto registrado'
    stem = PurePosixPath(str(row.get('source', '')).replace('\\', '/')).stem
    if stem and not re.match(r'^(?:factura|invoice|documento|receipt|scan)[_\s\d-]', stem, re.I):
        return stem.replace('_', ' ').strip().capitalize(), 'Nombre del archivo original'
    return 'Concepto pendiente de completar', 'Consulta el PDF original'

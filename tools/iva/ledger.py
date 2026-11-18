"""Offline, decimal VAT worksheet engine. Never files a return or changes originals."""
import argparse
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
import hashlib
import json
from pathlib import Path
import re
from expense_policy import validate_policy, validate_eu_services, normalized_tax_id


def money(value):
    if not isinstance(value, str) or not re.fullmatch(r'-?\d+\.\d{2}', value):
        raise ValueError('Amounts must be explicit decimal strings with two places')
    return Decimal(value)


def quarter(day):
    d = date.fromisoformat(day)
    return f'{(d.month - 1) // 3 + 1}T'


def validate(records, year):
    seen = set()
    for r in records:
        party_key = normalized_tax_id(r['tax_id']) if r.get('tax_id') else r['party'].strip().casefold()
        key = (r['kind'], party_key, r['number'].strip().casefold())
        if key in seen:
            raise ValueError('Duplicate invoice identity')
        seen.add(key)
        if r['kind'] not in ('income', 'expense'):
            raise ValueError('Unknown record kind')
        if r['kind'] == 'expense':
            validate_policy(r, for_approval=True)
            validate_eu_services(r)
        if date.fromisoformat(r['date']).year != year:
            raise ValueError('Wrong exercise')
        if r['period'] not in ('1T', '2T', '3T', '4T'):
            raise ValueError('Explicit reporting period required')
        if type(r['include']) is not bool:
            raise ValueError('Explicit inclusion decision required')
        for field in ('base', 'vat', 'withholding', 'total'):
            money(r[field])
        if r['include'] and any(money(r[f]) < 0 for f in ('base', 'vat', 'withholding')):
            raise ValueError('Credit notes require a separate explicit mapping')
        if r['kind'] == 'expense' and money(r['withholding']) != 0:
            raise ValueError('Expense withholding requires a separate adapter')
        if money(r['base']) + money(r['vat']) - money(r['withholding']) != money(r['total']):
            raise ValueError('Invoice totals do not reconcile')
        if r['include']:
            if r['mapping'] == 'eu_services21':
                if r['kind'] != 'expense':
                    raise ValueError('EU services mapping is only for acquired current services')
            elif r['mapping'] not in ('domestic21', 'historical_domestic21') or r['rate'] != '21.00':
                raise ValueError('Unsupported VAT treatment; do not silently map it')
        if not r['source'] or not re.fullmatch('[a-f0-9]{64}', r['sha256']):
            raise ValueError('Document provenance required')


def eu_service_vat(record):
    """Per-invoice reverse-charge VAT, separate from the documentary zero VAT."""
    validate_eu_services(record)
    if record.get('mapping') != 'eu_services21':
        return Decimal('0.00')
    return (money(record['base']) * money(record['reverse_charge_rate']) / 100).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP)


def calculate(data):
    validate(data['records'], data['year'])
    results = {}
    for period in ('1T', '2T', '3T', '4T'):
        rows = [r for r in data['records'] if r['include'] and r['period'] == period]
        def total(kind, field):
            return sum((money(r[field]) for r in rows if r['kind'] == kind
                        and r['mapping'] != 'eu_services21'), Decimal('0.00'))
        eu = [r for r in rows if r['mapping'] == 'eu_services21']
        eu_base = sum((money(r['base']) for r in eu), Decimal('0.00'))
        eu_vat = sum((eu_service_vat(r) for r in eu), Decimal('0.00'))
        # AEAT 303 (2026): EU acquired services use 10/11 and current deductions
        # 36/37. Their zero invoice VAT never belongs to domestic boxes 28/29.
        boxes = {'07': total('income', 'base'), '09': total('income', 'vat'),
                 '10': eu_base, '11': eu_vat,
                 '28': total('expense', 'base'), '29': total('expense', 'vat'),
                 '36': eu_base, '37': eu_vat}
        boxes['27'] = boxes['09'] + boxes['11']
        boxes['45'] = boxes['29'] + boxes['37']
        boxes['46'] = boxes['27'] - boxes['45']
        # Only calculate final payable for an explicitly documented zero-adjustment profile.
        profile = data.get('profiles', {}).get(period, {})
        boxes['71'] = boxes['46'] if profile.get('remaining_boxes_confirmed_zero') is True else None
        reference = data.get('references', {}).get(period, {})
        results[period] = {
            'boxes': {k: str(v) if v is not None else None for k, v in boxes.items()},
            'reference': reference,
            'difference': {k: str(v - money(reference[k])) for k, v in boxes.items() if k in reference and v is not None},
            'record_count': len(rows), 'filing_ready': False,
            'coverage': data['coverage'][period],
        }
    return results


def verify_sources(data, root):
    root = Path(root).resolve()
    for r in data['records']:
        p = (root / r['source']).resolve()
        if not p.is_relative_to(root):
            raise ValueError('Source escapes document root')
        if hashlib.sha256(p.read_bytes()).hexdigest() != r['sha256']:
            raise ValueError('Source changed; review extraction before generating')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('input', type=Path)
    p.add_argument('--root', required=True, type=Path)
    p.add_argument('--output', required=True, type=Path)
    a = p.parse_args()
    data = json.loads(a.input.read_text(encoding='utf-8-sig'))
    verify_sources(data, a.root)
    data['calculations'] = calculate(data)
    a.output.parent.mkdir(parents=True, exist_ok=True)
    a.output.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: v['boxes'] for k, v in data['calculations'].items()}))


if __name__ == '__main__':
    main()

"""Experimental 2026 quarterly general-regime TXT, for OPEN rehearsals only."""
import argparse
import hashlib
import json
from pathlib import Path
import re
from ledger import money
from prepare_open import prepare

DESIGN_SHA256 = '0be8b156da2250c6b11f6253e0165221ed2e549ec4c65a562021bec6b9b8489b'
DESIGN_URL = 'https://www3.agenciatributaria.gob.es/static_files/Sede/Disenyo_registro/DR_300_399/archivos_26/DR303e26v101.xlsx'


def field(value, length, numeric=False):
    value = str(value)
    if len(value) > length or (numeric and not value.isdigit()):
        raise ValueError('Field overflow or invalid numeric value')
    if any(ord(c) < 32 for c in value):
        raise ValueError('Control characters are not permitted')
    value.encode('iso-8859-1')
    return value.zfill(length) if numeric else value.ljust(length)


def load_design(path):
    if hashlib.sha256(path.read_bytes()).hexdigest() != DESIGN_SHA256:
        raise ValueError('Unreviewed AEAT design version')
    import openpyxl
    workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
    result = {}
    for name in ('DP30301', 'DP30303', 'DP303DID'):
        rows = []
        for row in workbook[name].iter_rows(min_row=6, max_row=100, max_col=7, values_only=True):
            if all(isinstance(row[i], int) for i in (0, 1, 2)):
                rows.append(row)
            elif row[0] == 'TOTAL':
                break
        result[name] = rows
    workbook.close()
    return result


def page(rows, overrides):
    size = max(r[1] + r[2] - 1 for r in rows)
    output = [' '] * size
    occupied = set()
    if set(overrides) - {r[0] for r in rows}:
        raise ValueError('Unknown field number')
    for number, position, length, kind, description, required, content in rows:
        indices = set(range(position - 1, position - 1 + length))
        if occupied & indices:
            raise ValueError('Overlapping design fields')
        occupied |= indices
        numeric = kind.strip() in ('Num', 'N')
        constants = re.findall(r'"([^"\n]+)"', content or '')
        value = overrides.get(number)
        if value is None:
            if len(constants) == 1 and (number <= 4 or 'Constante' in (content or '')):
                value = constants[0]
            else:
                value = '0' if numeric else ''
        output[position - 1:position - 1 + length] = field(value, length, numeric)
    if occupied != set(range(size)):
        raise ValueError('Gaps in design')
    return ''.join(output)


def serialize(design, boxes, identity, year, period):
    if year != 2026 or period not in ('1T', '2T', '3T'):
        raise ValueError('Only reviewed 2026 quarters 1T-3T are supported')
    if identity.get('foral_only') is not False or identity.get('monthly_refund') is not False:
        raise ValueError('Explicit historical non-foral and non-REDEME profile required')
    nif, name, developer = identity['nif'], identity['name'], identity['developer_nif']
    if not re.fullmatch(r'[A-Z0-9]{9}', nif) or not re.fullmatch(r'[A-Z0-9]{9}', developer):
        raise ValueError('NIF format invalid')
    if not name.strip() or len(name) > 80:
        raise ValueError('Taxpayer name required, maximum 80 characters')
    if money(boxes['71']) <= 0 or money(boxes['71']) != money(boxes['46']):
        raise ValueError('Only positive, zero-adjustment historical rehearsals supported')
    def cents(box):
        value = money(boxes[box])
        if value < 0:
            raise ValueError('Negative values outside reviewed scope')
        return str(int(value * 100))
    first = {6: 'I', 7: nif, 8: name, 9: str(year), 10: period,
             11: '2', 12: '2', 13: '3', 14: '2', 15: '2', 16: '2',
             17: '2', 18: '2', 19: '2', 22: '2', 23: '0', 24: '0', 25: '0',
             41: cents('07'), 43: cents('09'), 54: '00050', 67: cents('09'),
             68: cents('28'), 69: cents('29'), 85: cents('45'), 86: cents('46')}
    third = {16: cents('46'), 17: '10000', 18: cents('46'), 25: cents('71'), 29: cents('71')}
    header = f'<T3030{year}{period}0000><AUX>' + ' ' * 70 + '0001' + ' ' * 4 + developer + ' ' * 213 + '</AUX>'
    if len(header) != 328:
        raise ValueError('Envelope length mismatch')
    return (header + page(design['DP30301'], first) + page(design['DP30303'], third)
            + page(design['DP303DID'], {}) + f'</T3030{year}{period}0000>').encode('iso-8859-1')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('input', type=Path)
    for name in ('profile', 'identity', 'design', 'root', 'output'):
        p.add_argument('--' + name, required=True, type=Path)
    p.add_argument('--open-rehearsal', required=True, action='store_true')
    a = p.parse_args()
    read = lambda path: json.loads(path.read_text(encoding='utf-8-sig'))
    data, profile = read(a.input), read(a.profile)
    checked = prepare(data, profile, a.root)
    payload = serialize(load_design(a.design), checked['expected_boxes'], read(a.identity), data['year'], profile['period'])
    if 'ENSAYO' not in a.output.name.upper():
        raise ValueError('Output name must explicitly identify ENSAYO')
    a.output.parent.mkdir(parents=True, exist_ok=True)
    a.output.write_bytes(payload)
    print('Experimental TXT generated for OPEN only; not submitted or production-approved.')


if __name__ == '__main__':
    main()

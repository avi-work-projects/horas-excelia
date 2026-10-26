"""Reconcile the downloaded OPEN incorporation CSV against the exact LSI rows."""
import csv
from decimal import Decimal
from io import StringIO
import re
from ledger import money


def reconcile(data, period, text):
    if period not in ('1T', '2T', '3T', '4T'):
        raise ValueError('Invalid period')
    expected = {}
    excluded = set()
    for kind, prefix, fields in (
        ('income', 'LFE', (('07', 'base'), ('09', 'vat'))),
        ('expense', 'LFR', (('28', 'base'), ('29', 'vat'))),
    ):
        rows = [r for r in data['records'] if r['include'] and r['kind'] == kind
                and int(r['period'][0]) <= int(period[0])]
        for line, r in enumerate(rows, 3):
            if r['period'] != period:
                excluded.add((kind, line, r['period']))
            else:
                for box, field in fields:
                    expected[(prefix, line, box)] = money(r[field])
    seen, omitted, totals = set(), set(), {b: Decimal('0.00') for b in ('07', '09', '28', '29')}
    reader = csv.DictReader(StringIO(text.lstrip('\ufeff')), delimiter=';')
    if reader.fieldnames != ['Fila excel', 'Periodo', 'Casilla', 'Importe', 'Descripcion']:
        raise ValueError('Unknown OPEN report columns')
    for row in reader:
        line = int(row['Fila excel'])
        if not row['Casilla']:
            label = row['Descripcion']
            kind = 'income' if label == '[Ingreso] Registro no incorporado' else (
                'expense' if label == '[Gasto] Registro no incorporado' else None)
            key = (kind, line, row['Periodo'])
            if key not in excluded or key in omitted or row['Importe']:
                raise ValueError('Unexpected or duplicate excluded record')
            omitted.add(key)
            continue
        match = re.fullmatch(r'(LFE|LFR)_PRE303_(07|09|28|29)', row['Casilla'])
        if not match or row['Periodo'] != period or row['Descripcion'] != 'Registro incorporado correctamente':
            raise ValueError('Unexpected incorporation result')
        key = (match[1], line, match[2])
        value = row['Importe']
        if not re.fullmatch(r'-?\d+,\d{2}', value):
            raise ValueError('Unexpected amount format')
        amount = money(value.replace(',', '.'))
        if key in seen or key not in expected or expected[key] != amount:
            raise ValueError('Imported row differs from ledger or is duplicated')
        seen.add(key)
        totals[match[2]] += amount
    if seen != set(expected) or omitted != excluded:
        raise ValueError('Incomplete OPEN report')
    return {'status': 'matched', 'period': period,
            'incorporated_records': len({(p, r) for p, r, b in seen}),
            'excluded_previous_period_records': len(omitted),
            'boxes': {b: str(v) for b, v in totals.items()},
            'scope': 'Incorporation report only; not final validation or filing'}

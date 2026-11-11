"""Prepare a limited-scope 2026 model 390 TXT; never signs or submits it."""
import argparse
from decimal import Decimal
import hashlib
import json
from pathlib import Path
import re
from xml.etree import ElementTree as ET
from zipfile import ZipFile

from ledger import calculate, money, verify_sources

DESIGN_URL = 'https://www3.agenciatributaria.gob.es/static_files/Sede/Disenyo_registro/DR_300_399/archivos_26/dr390e2026.xlsx'
DESIGN_SHA256 = '5ce047995347c2b5ad6e5d4e407f126eeb9bd214602ed7c99e9f85175176ec15'
PERIODS = ('1T', '2T', '3T', '4T')
PAGES = ('01000', '02000', '02B00', '03000', '04000', '06000')
FALSE_FLAGS = ('exempt_390', 'simplified_regime', 'joint_return', 'cash_accounting',
               'recipient_cash_accounting', 'insolvency', 'monthly_refund',
               'group_entities', 'sii', 'special_regimes', 'intracommunity',
               'imports_exports', 'reverse_charge', 'investment_goods',
               'prorata', 'annual_adjustments', 'prior_compensation',
               'substitute_return', 'other_operations', 'fuel_payments')


def fingerprint(data):
    """Bind the review to the complete JSON content, independent of indentation."""
    return hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False,
                                    separators=(',', ':')).encode('utf-8')).hexdigest()


def verified_document(root, evidence):
    root = Path(root).resolve()
    source = evidence.get('source')
    if not isinstance(source, str) or not source:
        raise ValueError('Falta el documento de evidencia')
    path = (root / source).resolve()
    if not path.is_relative_to(root) or not path.is_file():
        raise ValueError('Documento de evidencia fuera del archivo o ausente')
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != evidence.get('sha256'):
        raise ValueError('La evidencia ha cambiado; revisar de nuevo')
    return {'source': source, 'sha256': actual}


def prepare(data, profile, root):
    """Validate source coverage/profile and reconcile four filed 303 references."""
    if data.get('year') != 2026 or profile.get('year') != 2026:
        raise ValueError('El diseño revisado solo admite 2026')
    if profile.get('ledger_fingerprint') != fingerprint(data):
        raise ValueError('El libro ha cambiado desde la revisión anual')
    if any(profile.get(k) is not True for k in
           ('reviewed', 'year_complete', 'general_regime', 'fiscal_reviewed')):
        raise ValueError('Falta confirmar cobertura anual, perfil y revisión fiscal')
    if any(profile.get(k) is not False for k in FALSE_FLAGS):
        raise ValueError('Perfil anual incompleto o con operaciones no soportadas')
    if profile.get('state_percentage') != '100.00':
        raise ValueError('Solo se admite tributación exclusiva al Estado')
    if not isinstance(profile.get('third_party_return'), bool):
        raise ValueError('Indicar obligación de declaración anual de terceros')
    activity = profile.get('activity', {})
    if (not isinstance(activity.get('description'), str) or not activity['description'].strip()
            or not re.fullmatch(r'[A-Z][0-9]{2}', activity.get('code', ''))
            or not re.fullmatch(r'[0-9]{3,4}', activity.get('iae', ''))):
        raise ValueError('Actividad, código y epígrafe IAE acreditados requeridos')
    evidence = {'profile': verified_document(root, profile.get('evidence', {}))}
    verify_sources(data, root)
    quarters = calculate(data)
    comparisons = {}
    filed_total = Decimal('0.00')
    sums = {box: Decimal('0.00') for box in ('07', '09', '28', '29', '71')}
    for period in PERIODS:
        q = quarters[period]
        if q['boxes']['71'] is None or money(q['boxes']['71']) < 0:
            raise ValueError(f'{period}: faltan ajustes confirmados o el resultado no está soportado')
        ref = q['reference']
        if any(k not in ref for k in ('07', '09', '28', '29', '45', '46', '71')):
            raise ValueError(f'{period}: falta referencia completa del 303 presentado')
        if (money(ref['71']) < 0 or money(ref['71']) != money(ref['46'])
                or money(ref['46']) != money(ref['09']) - money(ref['45'])
                or money(ref['45']) != money(ref['29'])):
            raise ValueError(f'{period}: referencia presentada incompatible con el alcance')
        evidence[period] = verified_document(root, profile.get('filed_evidence', {}).get(period, {}))
        differences = {k: v for k, v in q['difference'].items() if money(v) != 0}
        if differences:
            review = profile.get('difference_reviews', {}).get(period, {})
            if (review.get('reviewed') is not True or review.get('differences') != differences
                    or not str(review.get('reason', '')).strip()):
                raise ValueError(f'{period}: diferencias documentales sin revisión expresa')
        comparisons[period] = {'differences': differences, 'filed_result': ref['71'],
                               'documentary_result': q['boxes']['71']}
        filed_total += money(ref['71'])
        for box in sums:
            sums[box] += money(q['boxes'][box])
    if sums['71'] != filed_total:
        raise ValueError('El resultado anual y los cuatro 303 difieren; requiere tratamiento específico')
    boxes = {'05': sums['07'], '06': sums['09'], '33': sums['07'], '34': sums['09'],
             '47': sums['09'], '605': sums['28'], '606': sums['29'],
             '48': sums['28'], '49': sums['29'], '64': sums['29'],
             '65': sums['71'], '84': sums['71'], '86': sums['71'],
             '95': filed_total, '99': sums['07'], '108': sums['07']}
    result = {'model': '390', 'year': 2026, 'filing_ready': False,
              'status': 'Fichero de preparación; pendiente de validación oficial',
              'boxes': {k: str(v) for k, v in boxes.items()}, 'quarters': comparisons,
              'activity': activity, 'third_party_return': profile['third_party_return'],
              'ledger_fingerprint': fingerprint(data), 'profile_fingerprint': fingerprint(profile),
              'evidence': evidence}
    result['preparation_fingerprint'] = fingerprint(result)
    return result


def load_design(path):
    """Read reviewed fixed-width records from the original AEAT XLSX (stdlib)."""
    path = Path(path)
    if hashlib.sha256(path.read_bytes()).hexdigest() != DESIGN_SHA256:
        raise ValueError('Versión del diseño 390 no revisada')
    ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    result = {}
    with ZipFile(path) as archive:
        strings = [''.join(n.itertext()) for n in ET.fromstring(
            archive.read('xl/sharedStrings.xml')).findall('s:si', ns)]
        # The SHA-pinned official workbook stores pages 1,2,2bis,3,4,6 here.
        for sheet in (2, 3, 4, 5, 6, 8):
            xml = ET.fromstring(archive.read(f'xl/worksheets/sheet{sheet}.xml'))
            rows = []
            for row in xml.findall('.//s:row', ns):
                cells = {}
                for cell in row:
                    v = cell.find('s:v', ns)
                    if v is not None:
                        cells[re.sub(r'\d', '', cell.attrib['r'])] = (
                            strings[int(v.text)] if cell.attrib.get('t') == 's' else v.text)
                if cells.get('A') == 'TOTAL':
                    break
                if all(re.fullmatch(r'\d+', str(cells.get(k, ''))) for k in ('A', 'B', 'C')):
                    rows.append((int(cells['A']), int(cells['B']), int(cells['C']),
                                 cells.get('D', '').strip(), cells.get('E', ''), cells.get('G', '')))
            identifier = re.search(r'"([0-9A-Z]{5})"', rows[2][5]).group(1)
            result[identifier] = rows
    if tuple(result) != PAGES:
        raise ValueError('Páginas del diseño no reconocidas')
    return result


def field(value, length, kind, literal=False):
    value = str(value)
    if any(ord(c) < 32 for c in value):
        raise ValueError('Caracteres de control no permitidos')
    value.encode('iso-8859-1')
    if not literal and kind in ('A', 'An'):
        allowed = str.isalpha if kind == 'A' else str.isalnum
        if any(c != ' ' and not allowed(c) for c in value):
            raise ValueError('El diseño exige letras, números y espacios, sin signos de puntuación')
    if not literal and kind in ('Num', 'N'):
        if not re.fullmatch(r'\d+', value):
            raise ValueError('Importe o campo numérico no soportado')
        value = value.zfill(length)
    else:
        value = value.ljust(length)
    if len(value) != length:
        raise ValueError('Campo fuera del tamaño oficial')
    return value


def render_page(rows, overrides):
    if set(overrides) - {r[0] for r in rows}:
        raise ValueError('Campo no definido en el diseño')
    output = []
    expected = 1
    for number, position, length, kind, description, content in rows:
        if position != expected:
            raise ValueError('Hueco o solapamiento en diseño')
        const = re.search(r'Constante\s+"([^"\n]+)"', content, flags=re.I)
        if const:
            if number in overrides:
                raise ValueError('No se puede sobrescribir una constante')
            value = field(const.group(1), length, kind, literal=True)
        else:
            value = field(overrides.get(number, '0' if kind in ('Num', 'N') else ''), length, kind)
        output.append(value)
        expected += length
    return ''.join(output)


def serialize(design, prepared, identity):
    """Emit only reviewed preparation; no official-validation claim or payment fields."""
    check = dict(prepared)
    expected = check.pop('preparation_fingerprint', None)
    if fingerprint(check) != expected or prepared.get('year') != 2026 or prepared.get('model') != '390':
        raise ValueError('Preparación modificada o ejercicio incorrecto')
    if tuple(design) != PAGES:
        raise ValueError('Diseño incompleto')
    if identity.get('person_type') != 'physical':
        raise ValueError('Solo persona física en el alcance revisado')
    nif, developer = identity.get('nif', ''), identity.get('developer_nif', '')
    if not re.fullmatch(r'[0-9XYZ][0-9]{7}[A-Z]', nif) or not re.fullmatch(r'[A-Z0-9]{9}', developer):
        raise ValueError('NIF inválido')
    number = nif[:-1].replace('X', '0').replace('Y', '1').replace('Z', '2')
    if 'TRWAGMYFPDXBNJZSQVHLCKE'[int(number) % 23] != nif[-1]:
        raise ValueError('Dígito de control NIF inválido')
    surname, name = identity.get('surname', '').strip(), identity.get('given_name', '').strip()
    if not surname or not name:
        raise ValueError('Apellidos y nombre separados requeridos por el diseño')
    boxes = prepared['boxes']
    def cents(box):
        value = money(boxes[box])
        if value < 0:
            raise ValueError('Resultado negativo fuera del alcance')
        return str(int(value * 100))
    activity = prepared['activity']
    values = {
        '01000': {7: nif, 8: surname.upper(), 9: name.upper(), 10: '2026',
                  12: '0', 13: '0', 15: '0', 16: '0', 17: '0', 19: '2',
                  20: '2', 21: '2', 22: '2', 23: '0', 24: '0',
                  26: activity['description'].upper(), 27: activity['code'],
                  28: activity['iae'], 44: '1' if prepared['third_party_return'] else '0'},
        '02000': {18: cents('05'), 19: cents('06'), 100: cents('33'), 101: cents('34')},
        '02B00': {26: cents('47')},
        '03000': {16: cents('605'), 17: cents('606'), 18: cents('48'), 19: cents('49')},
        '04000': {44: cents('64'), 45: cents('65')},
        # Exclusive common territory: section 7, not mixed-territory section 8.
        '06000': {7: cents('84'), 11: cents('86'), 24: cents('95'),
                  32: cents('99'), 49: cents('108')},
    }
    envelope = '<T390020260A0000><AUX>' + ' ' * 70 + '0001' + ' ' * 4 + developer + ' ' * 213 + '</AUX>'
    if len(envelope) != 328:
        raise ValueError('Cabecera incorrecta')
    return (envelope + ''.join(render_page(design[p], values[p]) for p in PAGES)
            + '</T390020260A0000>').encode('iso-8859-1')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('input', type=Path)
    for key in ('profile', 'root', 'identity', 'design', 'output'):
        p.add_argument('--' + key, type=Path, required=True)
    args = p.parse_args()
    read = lambda path: json.loads(path.read_text(encoding='utf-8-sig'))
    if 'PREPARACION' not in args.output.name.upper():
        raise ValueError('El nombre de salida debe identificar PREPARACION')
    reviewed = prepare(read(args.input), read(args.profile), args.root)
    raw = serialize(load_design(args.design), reviewed, read(args.identity))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(raw)
    args.output.with_suffix('.revision.json').write_text(json.dumps(reviewed, ensure_ascii=False, indent=2), encoding='utf-8')
    print('390 preparado. Validación oficial y presentación pendientes; no se ha enviado nada.')


if __name__ == '__main__':
    main()

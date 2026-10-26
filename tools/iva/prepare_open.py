"""Build a private recovery checklist for OPEN; never a presentable return."""
import argparse
import hashlib
import json
from pathlib import Path
from ledger import calculate, money, verify_sources


def prepare(data, profile, root):
    period = profile['period']
    if profile['year'] != data['year'] or period not in ('1T', '2T', '3T', '4T'):
        raise ValueError('Historical profile year/period mismatch')
    root = Path(root).resolve()
    source = (root / profile['source']).resolve()
    if not source.is_relative_to(root):
        raise ValueError('Profile source escapes document root')
    if hashlib.sha256(source.read_bytes()).hexdigest() != profile['source_sha256']:
        raise ValueError('Historical profile source changed')
    if profile.get('general_regime') is not True or any(
        profile.get(k) is not False for k in ('simplified_regime', 'joint_return',
        'cash_accounting', 'recipient_cash_accounting', 'insolvency', 'voluntary_sii')
    ) or profile.get('state_percentage') != '100.00':
        raise ValueError('Unsupported or incomplete profile')
    verify_sources(data, root)
    result = calculate(data)[period]
    if result['boxes']['71'] is None:
        raise ValueError('Remaining adjustments must be documented in ledger profile')
    expected = result['boxes']['71']
    if money(expected) != money(profile['expected_result']):
        raise ValueError('Ledger changed since historical validation; review again')
    difference = str(money(expected) - money(profile['filed_result']))
    if money(difference) != money(profile['difference']):
        raise ValueError('Recorded comparison does not reconcile')
    return dict(year=data['year'], period=period, filing_ready=False,
        format='Recovery checklist, NOT an AEAT .ses or import file',
        profile=profile, expected_boxes=result['boxes'], difference=difference,
        steps=[
            'Open the official OPEN simulator for the specified exercise and period.',
            'Restore a confirmed .ses using Cargar, or enter this historical profile.',
            'Use Importacion de libros de registro for the cumulative XLSX; not the initial TXT Importar button.',
            'Download and inspect incorporated and excluded records before accepting.',
            'Validate and compare expected boxes, keeping the difference visible.',
            'Save .ses; verify browser download completion before archiving it. Do not rename partial downloads.',
            'Never present this historical rehearsal or reuse its profile for a new period without review.'
        ])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('--profile', type=Path, required=True)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    read = lambda path: json.loads(path.read_text(encoding='utf-8-sig'))
    result = prepare(read(args.input), read(args.profile), args.root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Historical OPEN recovery checklist generated; no submission performed.')


if __name__ == '__main__':
    main()

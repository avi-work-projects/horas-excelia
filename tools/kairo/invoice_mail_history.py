"""Private evidence of past invoice emails; never issues or sends invoices."""
import json
import os
import re
from datetime import date, datetime, timezone
from functools import lru_cache
from pathlib import Path
from zoneinfo import ZoneInfo

NAME = 'invoice-mail-history.json'
MADRID = ZoneInfo('Europe/Madrid')


def validate(payload):
    if not isinstance(payload, dict) or payload.get('schema') != 1:
        raise ValueError('Histórico no válido')
    through = payload.get('through', '')
    if not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', through):
        raise ValueError('Mes de revisión no válido')
    if payload.get('workStart') is not None:
        date.fromisoformat(payload['workStart'])
    records = payload.get('records')
    if not isinstance(records, list) or len(records) > 5000:
        raise ValueError('Registros no válidos')
    unique = {}
    for row in records:
        if not isinstance(row, dict):
            raise ValueError('Evidencia no válida')
        period, message = row.get('period', ''), row.get('messageId', '')
        if not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', period) or period > through or not re.fullmatch(r'[a-f0-9]{16,32}', message):
            raise ValueError('Evidencia no válida')
        instant = datetime.fromisoformat(row['sentAt'])
        if instant.tzinfo is None or instant > datetime.now(timezone.utc):
            raise ValueError('Fecha sin confirmar')
        prior = unique.get((period, message))
        if prior and datetime.fromisoformat(prior['sentAt']) != instant:
            raise ValueError('La evidencia existente tiene otra fecha')
        unique[(period, message)] = dict(period=period, messageId=message, sentAt=instant.isoformat())
    return dict(schema=1, through=through, workStart=payload.get('workStart'), records=list(unique.values()))


def consolidate(root, payload):
    root = Path(root)
    path = root / NAME
    incoming = validate(payload)
    if path.exists():
        old = validate(json.loads(path.read_text()))
        incoming = validate(incoming | {'through': max(old['through'], incoming['through']),
                                       'workStart': incoming['workStart'] or old['workStart'],
                                       'records': old['records'] + incoming['records']})
    incoming['checkedAt'] = datetime.now(timezone.utc).isoformat()
    temp = path.with_suffix('.tmp')
    with temp.open('w', encoding='utf-8') as stream:
        os.chmod(temp, 0o600)
        json.dump(incoming, stream, ensure_ascii=False)
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temp, path)
    return len(incoming['records'])


@lru_cache(maxsize=2)
def _public(path, modified, size):
    raw = json.loads(Path(path).read_text(encoding='utf-8'))
    data = validate(raw)
    months = {}
    for row in data['records']:
        day = datetime.fromisoformat(row['sentAt']).astimezone(MADRID).date().isoformat()
        item = months.setdefault(row['period'], dict(sentDate=day, lastSentDate=day, count=0))
        item.update(sentDate=min(item['sentDate'], day), lastSentDate=max(item['lastSentDate'], day), count=item['count']+1)
    return dict(schema=1, through=data['through'], workStart=data['workStart'], checkedAt=raw['checkedAt'], months=months)


def public_history(root):
    path = Path(root) / NAME
    if not path.exists():
        return None
    stat = path.stat()
    return _public(str(path), stat.st_mtime_ns, stat.st_size)


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    print(json.dumps({'records': consolidate(args.root, json.loads(args.source.read_text(encoding='utf-8')))}))

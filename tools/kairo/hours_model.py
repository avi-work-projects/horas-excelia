"""Pure reconciliation for weekly hours. No browser, credentials or writes."""
import hashlib
import json
import re
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

MADRID = ZoneInfo('Europe/Madrid')
DAY_TYPES = {'normal', 'festivo', 'vacaciones', 'ausencia'}
SCHEDULE_POLICY = 2  # Changing eligible send dates invalidates earlier reviews.


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False,
                                     separators=(',', ':')).encode()).hexdigest()


def monday(key):
    if not isinstance(key, str) or not re.fullmatch(r'20\d\d-\d\d-\d\d', key):
        raise ValueError('Semana no válida')
    day = date.fromisoformat(key)
    if day.weekday() != 0:
        raise ValueError('La semana debe empezar en lunes')
    return day


def scope(period):
    if not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', str(period)):
        raise ValueError('Mes no válido')
    year, month = map(int, period.split('-'))
    first = date(year, month, 1)
    end = date(year + (month == 12), month % 12 + 1, 1) - timedelta(days=1)
    start = first - timedelta(days=first.weekday())
    last = end - timedelta(days=end.weekday()) + timedelta(weeks=2)
    return [(start + timedelta(weeks=i)).isoformat()
            for i in range((last-start).days//7+1)]


def addresses(values, required=False):
    if not isinstance(values, list) or len(values) > 20:
        raise ValueError('Destinatarios no válidos')
    result = []
    for value in values:
        if not isinstance(value, str) or not re.fullmatch(r'[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+', value):
            raise ValueError('Dirección de correo no válida')
        result.append(value.lower())
    if required and not result:
        raise ValueError('Completa Para en Correo de horas')
    return sorted(set(result))


def validate_request(request):
    if not isinstance(request, dict) or request.get('schema') != 1:
        raise ValueError('Solicitud no válida')
    keys = scope(request.get('period'))
    if request.get('mode') not in ('month', 'week'):
        raise ValueError('Recorrido no válido')
    if request['mode'] == 'week' and request.get('targetWeek') not in keys:
        raise ValueError('Semana fuera del mes y sus dos adicionales')
    if not isinstance(request.get('weeks'), list) or [w.get('key') for w in request['weeks']] != keys:
        raise ValueError('El alcance no coincide con el mes y sus dos semanas adicionales')
    config = request.get('config', {})
    to, cc = addresses(config.get('to'), True), addresses(config.get('cc'))
    for week in request['weeks']:
        start = monday(week['key'])
        days = week.get('days')
        if not isinstance(days, list) or len(days) != 5:
            raise ValueError('Se necesitan los cinco días de la semana')
        for i, day in enumerate(days):
            if day.get('date') != (start+timedelta(days=i)).isoformat() or day.get('type') not in DAY_TYPES:
                raise ValueError('Fechas o tipos no válidos')
            hours = day.get('hours')
            if isinstance(hours, bool) or not isinstance(hours, (float, int)) or not 0 <= hours <= 24:
                raise ValueError('Horas no válidas')
            if day['type'] != 'normal' and hours != 0:
                raise ValueError('Un día no trabajado no puede tener horas trabajadas')
        if not isinstance(week.get('subject'), str) or not 1 <= len(week['subject']) <= 500 or '\n' in week['subject'] or '\r' in week['subject']:
            raise ValueError('Asunto no válido')
        if not isinstance(week.get('body'), str) or not 1 <= len(week['body']) <= 10000:
            raise ValueError('Contenido no válido')
        label = 'Semana del '+start.strftime('%d/%m')+' al '+(start+timedelta(days=4)).strftime('%d/%m')
        if label not in week['subject'] or parse_days(week['body'], week['key']) != days:
            raise ValueError('El asunto o el contenido no coincide con los días revisados')
    return to, cc


def content_hash(week):
    # Existing scheduled mail keeps its recipients. Compare only the meaningful
    # daily content, not Android's footer, HTML, greetings or display names.
    days = [dict(date=d['date'], type=d['type'], hours=float(d['hours'])) for d in week['days']]
    return digest({'days': days})


def schedule(week, now):
    days = [d['date'] for d in week['days'] if d['type'] == 'normal' and d['hours'] > 0]
    if not days and all(d['type'] in ('vacaciones','festivo') for d in week['days']):
        days = [d['date'] for d in week['days'] if d['type'] != 'festivo']
    if not days:
        return None, 'no-workdays'
    target = datetime.fromisoformat(days[-1]+'T08:00:00').replace(tzinfo=MADRID)
    return target.isoformat(), 'past-due' if target <= now.astimezone(MADRID) else None


def inventory_signature(inventory):
    return digest({'policy':SCHEDULE_POLICY,'complete': inventory.get('complete'), 'account': inventory.get('account'),
                   'accountVerified': inventory.get('accountVerified'),
                   'records': sorted(inventory.get('records', []), key=lambda r: (r.get('week', ''), r.get('id', '')))})


def reconcile(request, inventory, now, ledger=None):
    validate_request(request)
    if now.tzinfo is None:
        raise ValueError('El reloj debe incluir zona horaria')
    ledger = ledger or {}
    records = inventory.get('records', [])
    verified = inventory.get('complete') is True and inventory.get('accountVerified') is True
    grouped = {}
    for record in records:
        grouped.setdefault(record.get('week'), []).append(record)
    first = monday(request['weeks'][0]['key'])
    previous = (first-timedelta(weeks=1)).isoformat()
    covered = {key for key, items in grouped.items()
               if len(items) == 1 and items[0].get('state') in ('sent', 'scheduled')}
    rows = []
    for week in request['weeks']:
        key = week['key']
        target, issue = schedule(week, now)
        wanted_hash = content_hash(week)
        items = grouped.get(key, [])
        selected = request['mode'] == 'month' or request['targetWeek'] == key
        row = dict(key=key, extra=len(rows) >= len(request['weeks'])-2, schedule=target,
                   contentHash=wanted_hash, selected=selected, action=None, changes=[])
        if not verified:
            row['state'] = 'unverified'
        elif len(items) > 1:
            row['state'] = 'duplicate'
            row['count'] = len(items)
            covered.discard(key)
        elif items and items[0].get('state') == 'sent':
            row['state'] = 'sent'
            row['recordId'] = items[0]['id']
        elif ledger.get(key, {}).get('state') in ('reserved', 'uncertain'):
            row['state'] = 'uncertain'
            covered.discard(key)
        elif items and items[0].get('state') == 'scheduled':
            record = items[0]
            row.update(recordId=record['id'], previousSchedule=record.get('schedule'),existingDays=record.get('days'))
            row.update(recipientPolicy='preserve-existing',toDisplay=record.get('toDisplay','Ver en Outlook'),ccDisplay=record.get('ccDisplay','Ver en Outlook'))
            if record.get('contentHash') != wanted_hash:
                row['changes'].append('days')
                row['dayChanges'] = [dict(date=after['date'], before=before, after=after)
                                     for before, after in zip(record.get('days', []), week['days']) if before != after]
            if record.get('schedule') != target:
                row['changes'].append('schedule')
            row['state'] = 'changed' if row['changes'] else 'scheduled'
            if row['changes'] and not issue:
                row['action'] = 'update'
            if issue:
                row['reason'] = issue
        elif items:
            row['state'] = 'draft' if items[0].get('state') == 'draft' else 'unverified'
            covered.discard(key)
        elif ledger.get(key, {}).get('state') in ('scheduled', 'sent'):
            # A disappeared message is not permission to create a replacement.
            row['state'] = 'uncertain'
        elif issue:
            row['state'] = issue
        elif previous not in covered:
            row['state'] = 'blocked-previous'
            row['previousWeek'] = previous
        else:
            row['state'] = 'ready'
            row['action'] = 'create'
            if selected:
                covered.add(key)
        rows.append(row)
        previous = key
    return dict(schema=1, period=request['period'], mode=request['mode'],
                verified=verified, checkedAt=now.isoformat(), rows=rows,
                signature=inventory_signature(inventory),
                ready=sum(r['selected'] and r['state'] == 'ready' for r in rows),
                needsReview=sum(r['selected'] and r['state'] not in ('sent', 'scheduled', 'ready') for r in rows))


def parse_days(body, week_key):
    """Only the five displayed daily rows establish semantic content."""
    start = monday(week_key)
    result = []
    for i in range(5):
        day = start+timedelta(days=i)
        pattern = rf'(?m)^\s*{"LMXJV"[i]}\s+0?{day.day}/0?{day.month}\s+[—–-]\s+([^\r\n]+)'
        matches = re.findall(pattern, body)
        if len(matches) != 1:
            raise ValueError('Desglose diario no reconocido')
        value = matches[0].strip().lower()
        types = {'festivo': 'festivo', 'vacaciones': 'vacaciones', 'ausencia': 'ausencia'}
        kind = types.get(value, 'normal')
        if kind != 'normal':
            hours = 0
        elif re.fullmatch(r'\d+(?:[.,]\d+)?\s*h', value):
            hours = float(value.rstrip('h').strip().replace(',', '.'))
        elif value in ('—', '–', '-'):
            hours = 0
        else:
            raise ValueError('Horas del correo no reconocidas')
        result.append(dict(date=day.isoformat(), type=kind, hours=hours))
    return result

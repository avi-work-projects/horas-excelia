"""Read saved facts before preparing or approving a monthly invoice."""
import calendar
import json
import sqlite3
from contextlib import closing
from datetime import datetime
from pathlib import Path

from home_invoice_status import read_month


def check(root, period, config):
    policy = config.get('gestify_prerequisites')
    if not policy:
        return None
    first = policy['first_period']
    if period < first:
        return None
    year, month = map(int, period.split('-'))
    required = {week[0].isoformat()
                for week in calendar.Calendar().monthdatescalendar(year, month)
                if any(day.month == month for day in week[:5])}
    try:
        hours = json.loads(Path(policy['hours_config']).read_text())
        database = Path(hours['state_dir']) / 'hours.sqlite'
        latest = {}
        with closing(sqlite3.connect(database.as_uri() + '?mode=ro', uri=True)) as db:
            for payload, in db.execute('SELECT payload FROM status_facts WHERE account=?', (hours['sender'],)):
                fact = json.loads(payload)
                if fact.get('verified') is not True:
                    continue
                stamp = datetime.fromisoformat(fact['checkedAt']).timestamp()
                for row in fact['rows']:
                    key = row['key']
                    if key in required and (key not in latest or stamp > latest[key][0]):
                        latest[key] = (stamp, row['state'])
        if any(latest.get(key, (0, 'missing'))[1] not in ('sent', 'scheduled') for key in required):
            return {'code': 'hours', 'message': 'Programa primero los envíos de horas de este mes.'}
        previous = f'{year - (month == 1):04d}-{month - 1 if month > 1 else 12:02d}'
        if previous >= first and read_month(root, previous)['state'] not in ('scheduled', 'sent'):
            return {'code': 'previous-invoice', 'previousPeriod': previous,
                    'message': 'Programa primero la factura del mes anterior.'}
    except (OSError, ValueError, KeyError, TypeError, RuntimeError, sqlite3.Error):
        return {'code': 'unavailable', 'message': 'No se han podido consultar los requisitos guardados en Kairo.'}
    return None


def require(root, period, config):
    problem = check(root, period, config)
    if problem:
        raise ValueError(problem['message'])

"""Month-scoped selection over the existing plans table; no parallel storage."""
import json
import re


def period(row):
    return row['data'].get('period') or row['data']['send_date'][:7]


def rows(db):
    with db() as conn:
        records = conn.execute('SELECT * FROM plans ORDER BY id').fetchall()
    return [dict(r, data=json.loads(r['data'])) for r in records]


def latest(db):
    months = {}
    for row in rows(db):
        months[period(row)] = row
    return sorted(months.values(), key=lambda r: (r['data'].get('send_date', period(r)), r['id']))


def load(db, *, plan_id=None, month=None):
    if month is not None and not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', str(month)):
        raise ValueError('Mes no válido')
    if plan_id is not None and (type(plan_id) is not int or plan_id <= 0):
        raise ValueError('Identificador de factura no válido')
    candidates = latest(db)
    if month is not None:
        candidates = [r for r in candidates if period(r) == month]
    if plan_id is not None:
        candidates = [r for r in candidates if r['id'] == plan_id]
    if not candidates:
        raise ValueError('No hay borrador vigente para esta factura')
    return max(candidates, key=lambda r: r['id'])


def action(db, digest, expected, plan_id=None):
    """Old clients may omit ID, but their fingerprint must identify one current plan."""
    candidates = latest(db) if plan_id is None else [load(db, plan_id=plan_id)]
    matches = [r for r in candidates if digest(r['data']) == expected]
    if len(matches) != 1:
        raise ValueError('Vista antigua o factura distinta; recarga y revisa ese mes')
    return matches[0]


def update(service, value, detail=None, plan_id=None):
    if plan_id is None:
        candidates = latest(service.db)
        if len(candidates) != 1:
            raise ValueError('Indica la factura que se debe actualizar')
        plan_id = candidates[0]['id']
    row = load(service.db, plan_id=plan_id)
    with service.db() as conn:
        conn.execute('UPDATE plans SET status=?,detail=? WHERE id=?', (value, detail, row['id']))
    service.event(value, {'plan': row['id'], 'detail': detail})


def tick(service, moment=None, backend=None, plan_id=None):
    """Caller holds the existing process lock. Never change the selected month globally."""
    if plan_id is not None:
        return service.tick_plan(moment, backend, plan_id)
    candidates = latest(service.db)
    if not candidates:
        return 'empty'
    results = {}
    for row in candidates:
        # An unresolved fiscal attempt must be reconciled before issuing another.
        # Already-issued invoices may still complete their own email delivery.
        others = latest(service.db)
        uncertain = any(r['id'] != row['id'] and r['status'] in {'emitting', 'queued', 'uncertain'} for r in others)
        if row['status'] == 'approved' and uncertain:
            results[period(row)] = 'waiting-reconciliation'
            continue
        try:
            results[period(row)] = service.tick_plan(moment, backend, row['id'])
        except Exception:
            if len(candidates) == 1:
                raise
            results[period(row)] = 'requires-review'
            service.event('runner_plan_error', {'plan': row['id'], 'period': period(row)})
    return next(iter(results.values())) if len(results) == 1 else results


def notification_ids(service):
    return [r['id'] for r in latest(service.db) if r['status'] not in {'sent','cancelled','email_cancelled','review'}]


def notify(service, plan_ids=None):
    for plan_id in notification_ids(service) if plan_ids is None else plan_ids:
        service.notify_plan(plan_id)

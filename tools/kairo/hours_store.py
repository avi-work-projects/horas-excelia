"""Private SQLite journal: reserve before browser writes; never retry uncertainty."""
import json
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

from hours_model import inventory_signature, reconcile


class StalePlan(ValueError):
    pass


class Store:
    def __init__(self, root):
        self.root = Path(root)
        self.root.mkdir(mode=0o700, parents=True, exist_ok=True)
        os.chmod(self.root, 0o700)
        self.path = self.root/'hours.sqlite'
        with self.db() as db:
            db.executescript('''CREATE TABLE IF NOT EXISTS plans (
                id TEXT PRIMARY KEY, payload TEXT NOT NULL, signature TEXT NOT NULL,
                expires TEXT NOT NULL, result TEXT);
                CREATE TABLE IF NOT EXISTS weeks (
                week TEXT PRIMARY KEY, state TEXT NOT NULL, plan TEXT NOT NULL,
                record_id TEXT, content_hash TEXT NOT NULL, schedule TEXT);''')
        os.chmod(self.path, 0o600)

    @contextmanager
    def db(self):
        db = sqlite3.connect(self.path, timeout=10)
        db.row_factory = sqlite3.Row
        try:
            yield db
            db.commit()
        finally:
            db.close()

    @contextmanager
    def exclusive(self):
        # All service processes share this lock, not only one HTTP worker.
        with (self.root/'browser.lock').open('a') as lock:
            if os.name == 'nt':
                import msvcrt
                if lock.tell() == 0: lock.write('0')
                lock.flush(); lock.seek(0)
                msvcrt.locking(lock.fileno(), msvcrt.LK_LOCK, 1)
            else:
                import fcntl
                fcntl.flock(lock, fcntl.LOCK_EX)
            try:
                yield
            finally:
                if os.name == 'nt':
                    lock.seek(0); msvcrt.locking(lock.fileno(), msvcrt.LK_UNLCK, 1)
                else:
                    fcntl.flock(lock, fcntl.LOCK_UN)

    def ledger(self):
        with self.db() as db:
            return {row['week']: dict(row) for row in db.execute('SELECT * FROM weeks')}

    def preview(self, request, inventory, now):
        result = reconcile(request, inventory, now, self.ledger())
        plan_id = str(uuid.uuid4())
        expires = (now.astimezone(timezone.utc)+timedelta(minutes=5)).isoformat()
        with self.db() as db:
            db.execute('DELETE FROM plans WHERE expires < ? AND result IS NULL',
                       ((now.astimezone(timezone.utc)-timedelta(days=1)).isoformat(),))
            db.execute('INSERT INTO plans VALUES (?,?,?,?,NULL)',
                       (plan_id, json.dumps(request), result['signature'], expires))
        return result | {'planId': plan_id, 'expiresAt': expires}

    def commit(self, plan_id, reader, writer, now, *, allow_writes=False, updates=(), clock=None):
        if not allow_writes:
            raise PermissionError('Modo de revisión: los correos reales no están habilitados')
        if not isinstance(updates, list) or len(updates) != len(set(updates)):
            raise ValueError('Confirmaciones de actualización no válidas')
        with self.exclusive():
            with self.db() as db:
                plan = db.execute('SELECT * FROM plans WHERE id=?', (plan_id,)).fetchone()
            if not plan:
                raise StalePlan('La revisión ya no existe; concilia de nuevo')
            if plan['result']:
                return json.loads(plan['result'])
            if datetime.fromisoformat(plan['expires']) <= now:
                raise StalePlan('La revisión ha caducado; concilia de nuevo')
            request = json.loads(plan['payload'])
            inventory = reader(request)
            if inventory_signature(inventory) != plan['signature']:
                raise StalePlan('Outlook ha cambiado; revisa el nuevo resultado')
            decision = reconcile(request, inventory, now, self.ledger())
            allowed_updates = {r['key'] for r in decision['rows']
                               if r['selected'] and r['action'] == 'update'}
            if not set(updates) <= allowed_updates:
                raise ValueError('La actualización no corresponde a esta revisión')
            results = []
            fresh = inventory
            for row in decision['rows']:
                if not row['selected'] or row['action'] is None:
                    continue
                if row['action'] == 'update' and row['key'] not in updates:
                    continue
                # The initial live read checks the first write. Each confirmed
                # read below also checks the next week, under the same lock.
                live = reconcile(request, fresh, clock() if clock else now, self.ledger())
                current = next(r for r in live['rows'] if r['key'] == row['key'])
                # A preceding write is verified in Outlook before the next one.
                if current['action'] != row['action'] or current['contentHash'] != row['contentHash'] or current.get('recordId') != row.get('recordId'):
                    results.append({'key': row['key'], 'state': 'changed-before-write'})
                    break
                with self.db() as db:
                    db.execute('BEGIN IMMEDIATE')
                    old = db.execute('SELECT state FROM weeks WHERE week=?', (row['key'],)).fetchone()
                    if old and old['state'] in ('reserved', 'uncertain'):
                        raise StalePlan('Hay un intento pendiente de comprobar')
                    db.execute('INSERT OR REPLACE INTO weeks VALUES (?,?,?,?,?,?)',
                               (row['key'], 'reserved', plan_id, row.get('recordId'),
                                row['contentHash'], row['schedule']))
                try:
                    writer(request, current)
                    observed = reader(request)
                    fresh = observed
                    matches = [r for r in observed.get('records', []) if r.get('week') == row['key']]
                    if not observed.get('complete') or not observed.get('accountVerified') or len(matches) != 1:
                        raise RuntimeError('Programación sin confirmación única')
                    record = matches[0]
                    if record.get('state') != 'scheduled' or record.get('contentHash') != row['contentHash'] or record.get('schedule') != row['schedule']:
                        raise RuntimeError('La programación no coincide con la revisión')
                    if row['action'] == 'update' and record['id'] != row['recordId']:
                        raise RuntimeError('La actualización no conserva el correo original')
                    with self.db() as db:
                        db.execute('UPDATE weeks SET state=?,record_id=? WHERE week=?',
                                   ('scheduled', record['id'], row['key']))
                    results.append({'key': row['key'], 'state': 'scheduled'})
                except Exception:
                    with self.db() as db:
                        db.execute('UPDATE weeks SET state=? WHERE week=?', ('uncertain', row['key']))
                    results.append({'key': row['key'], 'state': 'uncertain'})
                    break
            result = {'planId': plan_id, 'results': results}
            with self.db() as db:
                db.execute('UPDATE plans SET result=? WHERE id=?', (json.dumps(result), plan_id))
            return result

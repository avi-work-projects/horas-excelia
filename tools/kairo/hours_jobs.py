"""Durable browser work: the HTTP client may leave without cancelling Outlook."""
import json
import threading
import uuid
from datetime import datetime, timezone
from hours_errors import HoursFailure, MESSAGES


class Jobs:
    def __init__(self, store, execute):
        self.store, self.execute = store, execute
        self.wake = threading.Event()
        self.guard = threading.Lock()
        self.started = False
        self.stopped = False
        self.thread = None
        with store.db() as db:
            db.executescript('''CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY, identity TEXT UNIQUE NOT NULL, kind TEXT NOT NULL,
                payload TEXT NOT NULL, phase TEXT NOT NULL, result TEXT, error TEXT,
                updated TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS status_facts (
                account TEXT NOT NULL, period TEXT NOT NULL, payload TEXT NOT NULL,
                PRIMARY KEY(account,period));''')
            # An interrupted write is never replayed automatically. The existing
            # per-week reserved/uncertain journal is an additional protection.
            db.execute("UPDATE jobs SET phase='error',error=? WHERE phase='running' AND kind='commit'",
                       ('Operación interrumpida. Concilia antes de repetir.',))
            db.execute("UPDATE jobs SET phase='queued' WHERE phase='running'")

    def start(self):
        with self.guard:
            if not self.started:
                self.started = True
                self.thread = threading.Thread(target=self._run, daemon=True, name='gestify-hours-jobs')
                self.thread.start()
        self.wake.set()

    def submit(self, kind, payload, identity):
        now = datetime.now(timezone.utc).isoformat()
        with self.store.db() as db:
            db.execute('BEGIN IMMEDIATE')
            if kind == 'status':
                wanted=set(payload.get('requestedPeriods',payload['periods']))
                for active in db.execute("SELECT id,payload FROM jobs WHERE kind='status' AND phase IN ('queued','running')"):
                    running=json.loads(active['payload'])
                    if wanted==set(running.get('requestedPeriods',running['periods'])) and set(payload['periods'])==set(running['periods']):
                        identifier=active['id']
                        break
                else:identifier=None
                if identifier:
                    self.start()
                    return self.get(identifier)
            db.execute('INSERT OR IGNORE INTO jobs VALUES (?,?,?,?,?,NULL,NULL,?)',
                       (str(uuid.uuid4()), identity, kind, json.dumps(payload), 'queued', now))
            row = db.execute('SELECT id FROM jobs WHERE identity=?', (identity,)).fetchone()
        self.start()
        return self.get(row['id'])

    def get(self, identifier):
        with self.store.db() as db:
            row = db.execute('SELECT * FROM jobs WHERE id=?', (identifier,)).fetchone()
        if not row:
            raise KeyError('Trabajo inexistente')
        result = dict(jobId=row['id'], kind=row['kind'], phase=row['phase'], updatedAt=row['updated'])
        if row['result'] is not None:
            result['result'] = json.loads(row['result'])
        if row['error']:
            result['error'] = row['error']
            try:
                failure = json.loads(row['error'])
                if failure.get('code') in MESSAGES:
                    result.update(error=MESSAGES[failure['code']], errorCode=failure['code'])
            except (ValueError, TypeError, AttributeError):
                pass
        return result

    def _run(self):
        while not self.stopped and self.store.root.exists():
            with self.store.db() as db:
                db.execute('BEGIN IMMEDIATE')
                row = db.execute("SELECT * FROM jobs WHERE phase='queued' ORDER BY rowid LIMIT 1").fetchone()
                if row:
                    db.execute("UPDATE jobs SET phase='running' WHERE id=?", (row['id'],))
            if not row:
                self.wake.wait(30)
                self.wake.clear()
                continue
            try:
                result = self.execute(row['kind'], json.loads(row['payload']))
                phase, error = 'done', None
            except HoursFailure as failure:
                result, phase = None, 'error'
                error = json.dumps({'code': failure.code})
            except Exception:
                # Browser exceptions can contain selectors, addresses or bodies.
                result, phase = None, 'error'
                error = 'Kairo no ha podido confirmar el resultado. Se conserva el estado anterior; revisa la sesión antes de repetir.'
            with self.store.db() as db:
                db.execute('UPDATE jobs SET phase=?,result=?,error=?,updated=? WHERE id=?',
                           (phase, json.dumps(result) if result is not None else None, error,
                            datetime.now(timezone.utc).isoformat(), row['id']))

    def remember(self, account, snapshot):
        with self.store.db() as db:
            db.execute('INSERT OR REPLACE INTO status_facts VALUES (?,?,?)',
                       (account, snapshot['period'], json.dumps(snapshot)))

    def fact(self, account, period):
        with self.store.db() as db:
            row = db.execute('SELECT payload FROM status_facts WHERE account=? AND period=?',
                             (account, period)).fetchone()
        return json.loads(row['payload']) if row else None

    def close(self):
        self.stopped = True
        self.wake.set()
        if self.thread:
            self.thread.join(timeout=5)

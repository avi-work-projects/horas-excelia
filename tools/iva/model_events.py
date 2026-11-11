"""Durable requests for manually triggered model updates; blocking OS notification."""
import argparse
from contextlib import contextmanager, closing
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sqlite3
import sys
import uuid

REASONS = frozenset(('manual', 'expense', 'evidence'))
SIGNAL = 'model-events.signal'
MESSAGES = {
    'idle': 'No hay actualizaciones solicitadas.',
    'queued': 'Actualización solicitada; pendiente del mini.',
    'running': 'El mini está actualizando los documentos y el libro.',
    'error': 'La actualización no terminó. Revisa el estado y solicita una nueva actualización.',
    'verified': 'Actualización terminada y copia verificada.',
}


def now():
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def process_lock(path):
    """Nonblocking OS lock, released on process death; never unlink its inode."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('a+b') as handle:
        if path.stat().st_size == 0:
            handle.write(b'0')
            handle.flush()
        handle.seek(0)
        try:
            if os.name == 'nt':
                import msvcrt
                msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as exc:
            raise RuntimeError('Ya hay un proceso activo para esta operación.') from exc
        try:
            yield
        finally:
            handle.seek(0)
            if os.name == 'nt':
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(handle.fileno(), fcntl.LOCK_UN)


def database(runtime):
    root = Path(runtime)
    root.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(root / 'model-events.sqlite', timeout=30)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA synchronous=FULL')
    db.execute('BEGIN IMMEDIATE')
    db.execute('CREATE TABLE IF NOT EXISTS requests (seq INTEGER PRIMARY KEY AUTOINCREMENT, reason TEXT NOT NULL, actor TEXT NOT NULL, at TEXT NOT NULL)')
    db.execute('CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, through_seq INTEGER NOT NULL UNIQUE, state TEXT NOT NULL, started_at TEXT NOT NULL, finished_at TEXT, result TEXT, error TEXT)')
    db.commit()
    return db


def _status(db):
    latest = db.execute('SELECT seq,at FROM requests ORDER BY seq DESC LIMIT 1').fetchone()
    requested = latest['seq'] if latest else 0
    processed = db.execute("SELECT COALESCE(MAX(through_seq),0) FROM jobs WHERE state!='running'").fetchone()[0]
    running = db.execute("SELECT * FROM jobs WHERE state='running'").fetchone()
    terminal = db.execute("SELECT * FROM jobs WHERE state!='running' ORDER BY through_seq DESC LIMIT 1").fetchone()
    pending = requested > (running['through_seq'] if running else processed)
    state = 'running' if running else 'queued' if pending else terminal['state'] if terminal else 'idle'
    times = [r for r in (latest['at'] if latest else None, running['started_at'] if running else None,
                         terminal['finished_at'] if terminal else None) if r]
    return dict(state=state, requested_seq=requested, processed_seq=processed, pending=pending,
                updated_at=max(times) if times else None,
                job={'id':running['id'], 'through':running['through_seq']} if running else None,
                message=MESSAGES[state] + (' Hay otra solicitud pendiente.' if running and pending else ''))


def _idle():
    return dict(state='idle', requested_seq=0, processed_seq=0, pending=False,
                updated_at=None, job=None, message=MESSAGES['idle'])


def status(runtime):
    """UI-safe state; never returns reasons, actors, raw errors or fiscal results."""
    path = Path(runtime) / 'model-events.sqlite'
    if not path.exists():
        return _idle()
    with closing(sqlite3.connect(path.resolve().as_uri() + '?mode=ro', uri=True, timeout=30)) as db:
        db.row_factory = sqlite3.Row
        db.execute('BEGIN')
        if db.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name IN ('requests','jobs')").fetchone()[0] < 2:
            return _idle()  # first connection is still committing initial schema
        return _status(db)


def _signal(runtime):
    # The SQLite commit is authoritative; the file only wakes an OS waiter.
    folder = Path(runtime) / 'signals'
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / SIGNAL
    with path.open('wb') as handle:
        handle.write(b'1')
        handle.flush()
        os.fsync(handle.fileno())


def request(runtime, reason, actor):
    if not isinstance(reason, str) or reason not in REASONS or not isinstance(actor, str) or not actor.strip() or len(actor) > 300:
        raise ValueError('Solicitud de actualización no válida.')
    with closing(database(runtime)) as db, db:
        db.execute('BEGIN IMMEDIATE')
        db.execute('INSERT INTO requests(reason,actor,at) VALUES (?,?,?)', (reason, actor.strip(), now()))
        result = _status(db)
    _signal(runtime)
    return result


def _claim(runtime):
    with closing(database(runtime)) as db, db:
        db.execute('BEGIN IMMEDIATE')
        current = db.execute("SELECT * FROM jobs WHERE state='running'").fetchone()
        if current:
            # Only the locally OS-locked listener calls wait: a surviving job is
            # an interrupted delivery/execution, not a timer-based retry.
            return dict(id=current['id'], through=current['through_seq'],
                        started_at=current['started_at'], recovered=True)
        current_status = _status(db)
        if not current_status['pending']:
            return None
        job = dict(id=uuid.uuid4().hex, through=current_status['requested_seq'], started_at=now(), recovered=False)
        db.execute('INSERT INTO jobs(id,through_seq,state,started_at) VALUES (?,?,?,?)',
                   (job['id'], job['through'], 'running', job['started_at']))
        return job


class _Notifier:
    """OS event subscription, armed before the first pending-request query."""
    def __init__(self, runtime):
        import ctypes
        self.ctypes = ctypes
        # Isolate notifications from the SQLite directory, especially on
        # Windows where FindFirstChangeNotification cannot filter file names.
        path = Path(runtime) / 'signals'
        path.mkdir(parents=True, exist_ok=True)
        if os.name == 'nt':
            from ctypes import wintypes
            api = ctypes.WinDLL('kernel32', use_last_error=True)
            api.FindFirstChangeNotificationW.argtypes = (wintypes.LPCWSTR, wintypes.BOOL, wintypes.DWORD)
            api.FindFirstChangeNotificationW.restype = wintypes.HANDLE
            api.WaitForSingleObject.argtypes = (wintypes.HANDLE, wintypes.DWORD)
            api.WaitForSingleObject.restype = wintypes.DWORD
            api.FindNextChangeNotification.argtypes = (wintypes.HANDLE,)
            api.FindNextChangeNotification.restype = wintypes.BOOL
            api.FindCloseChangeNotification.argtypes = (wintypes.HANDLE,)
            api.FindCloseChangeNotification.restype = wintypes.BOOL
            self.api = api
            self.handle = api.FindFirstChangeNotificationW(str(path.resolve()), False, 0x01 | 0x10)
            if self.handle == ctypes.c_void_p(-1).value:
                raise OSError(ctypes.get_last_error(), 'No se pudo esperar a solicitudes.')
        elif sys.platform.startswith('linux'):
            import ctypes.util
            api = ctypes.CDLL(ctypes.util.find_library('c') or None, use_errno=True)
            api.inotify_init1.argtypes = (ctypes.c_int,)
            api.inotify_init1.restype = ctypes.c_int
            api.inotify_add_watch.argtypes = (ctypes.c_int, ctypes.c_char_p, ctypes.c_uint32)
            api.inotify_add_watch.restype = ctypes.c_int
            self.api = api
            self.fd = api.inotify_init1(os.O_CLOEXEC)
            if self.fd < 0:
                raise OSError(ctypes.get_errno(), 'No se pudo abrir inotify.')
            # CLOSE_WRITE | MOVED_TO | CREATE; unrelated SQLite changes are
            # discarded without consulting the queue or document sources.
            if api.inotify_add_watch(self.fd, os.fsencode(path.resolve()), 0x08 | 0x80 | 0x100) < 0:
                os.close(self.fd)
                raise OSError(ctypes.get_errno(), 'No se pudo observar la cola.')
        else:
            raise RuntimeError('La espera de solicitudes requiere Linux o Windows.')

    def wait(self):
        if os.name == 'nt':
            if self.api.WaitForSingleObject(self.handle, 0xFFFFFFFF) != 0:
                raise OSError(self.ctypes.get_last_error(), 'Falló la espera de solicitudes.')
            if not self.api.FindNextChangeNotification(self.handle):
                raise OSError(self.ctypes.get_last_error(), 'No se pudo rearmar la espera.')
            return
        import struct
        while True:
            # Blocking kernel read: no timeout, sleep, SQLite polling or Drive IO.
            events = os.read(self.fd, 65536)
            if not events:
                raise OSError('Se cerró la espera de solicitudes.')
            offset = 0
            while offset + 16 <= len(events):
                _, mask, _, length = struct.unpack_from('iIII', events, offset)
                name = events[offset + 16:offset + 16 + length].split(b'\0', 1)[0]
                if name == SIGNAL.encode() or mask & 0x4000:  # overflow: recheck durable queue
                    return
                offset += 16 + length

    def close(self):
        if os.name == 'nt':
            self.api.FindCloseChangeNotification(self.handle)
        else:
            os.close(self.fd)


def wait_for_request(runtime):
    # Subscribe FIRST: a request between the DB check and wait remains signalled.
    with closing(_Notifier(runtime)) as notification:
        while True:
            job = _claim(runtime)
            if job:
                return job
            notification.wait()


def finish(runtime, job, result, error=None):
    if (not isinstance(job, dict) or not isinstance(job.get('id'), str)
            or type(job.get('through')) is not int):
        raise ValueError('Identificador de actualización no válido.')
    if error is None and (not isinstance(result, dict) or result.get('state') != 'verified'):
        raise ValueError('La actualización no acredita una copia verificada.')
    encoded = json.dumps(result, ensure_ascii=False, sort_keys=True)
    error = str(error)[:10000] if error is not None else None
    with closing(database(runtime)) as db, db:
        db.execute('BEGIN IMMEDIATE')
        row = db.execute('SELECT * FROM jobs WHERE id=?', (job['id'],)).fetchone()
        if not row or row['through_seq'] != job['through']:
            raise ValueError('La respuesta no corresponde a la actualización solicitada.')
        if row['state'] != 'running':
            if row['result'] != encoded or row['error'] != error:
                raise ValueError('La actualización ya terminó con otro resultado.')
            return _status(db)  # lost SSH acknowledgement is safe to retry
        db.execute('UPDATE jobs SET state=?,finished_at=?,result=?,error=? WHERE id=?',
                   ('error' if error is not None else 'verified', now(), encoded, error, job['id']))
        return _status(db)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--server', action='store_true', required=True)
    parser.add_argument('--runtime', required=True)
    args = parser.parse_args()
    supplied = json.load(sys.stdin)
    action = supplied.get('action')
    if action == 'wait':
        result = wait_for_request(args.runtime)
    elif action == 'finish':
        result = finish(args.runtime, supplied.get('job'), supplied.get('result'), supplied.get('error'))
    elif action == 'status':
        result = status(args.runtime)
    else:
        raise ValueError('Acción de cola no válida.')
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()

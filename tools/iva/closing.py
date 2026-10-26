"""Private, approval-bound OPEN rehearsal workflow. No network or filing capability."""
import base64
from contextlib import closing as close_db
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import sqlite3

from export_303_test import load_design, serialize
from prepare_open import prepare


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def confined(root, relative):
    root = Path(root).resolve()
    path = (root / relative).resolve()
    if not path.is_relative_to(root):
        raise ValueError('Ruta fuera del archivo autorizado')
    return path


def candidate(config, period, payment_mode):
    if payment_mode not in ('I', 'U'):
        raise ValueError('Modalidad no admitida')
    if period not in config['profiles']:
        raise ValueError('Este periodo no tiene un perfil acreditado y un exportador habilitado. No está listo para generar.')
    root = Path(config['archive_root'])
    paths = {key: confined(root, config[key]) for key in ('ledger', 'identity', 'payment')}
    paths['profile'] = confined(root, config['profiles'][period])
    data, profile, identity = (read(paths[k]) for k in ('ledger', 'profile', 'identity'))
    if data['year'] != config['year']:
        raise ValueError('El ejercicio no coincide con la configuración del cierre')
    if profile['period'] != period:
        raise ValueError('El perfil no corresponde al periodo solicitado')
    checked = prepare(data, profile, root)  # checks every original hash and historical profile
    payment = read(paths['payment']) if payment_mode == 'U' else None
    payload = serialize(load_design(Path(config['design'])), checked['expected_boxes'], identity,
                        data['year'], period, payment)
    basis = {k: digest(p.read_bytes()) for k, p in paths.items()}
    basis['engine'] = digest(b''.join(Path(__file__).with_name(n).read_bytes() for n in
                                    ('closing.py', 'ledger.py', 'prepare_open.py', 'export_303_test.py')))
    basis['payload'] = digest(payload)
    basis['mode'] = payment_mode
    revision = digest(json.dumps(basis, sort_keys=True).encode())
    return dict(year=data['year'], period=period, revision=revision, mode=payment_mode,
                boxes=checked['expected_boxes'], difference=checked['difference'],
                filed_result=profile['filed_result'],
                account=('ES•• ···· ' + payment['iban'].replace(' ', '')[-4:]) if payment else 'Sin cuenta',
                filename=f'303_{data["year"]}_{period}_GENERADO_ENSAYO.txt',
                payload=base64.b64encode(payload).decode(), payload_sha256=digest(payload),
                filing_ready=False, basis=basis)


class Store:
    def __init__(self, path):
        self.path = Path(path)

    def connect(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        db = sqlite3.connect(self.path, timeout=15)
        db.execute('CREATE TABLE IF NOT EXISTS closing (period TEXT PRIMARY KEY, state TEXT, snapshot TEXT)')
        db.execute('CREATE TABLE IF NOT EXISTS audit (at TEXT, period TEXT, action TEXT, revision TEXT, actor TEXT)')
        return db

    def get(self, period):
        if not self.path.exists():
            return None
        with close_db(sqlite3.connect(self.path)) as db:
            row = db.execute('SELECT state,snapshot FROM closing WHERE period=?', (period,)).fetchone()
        return dict(state=row[0], snapshot=json.loads(row[1])) if row else None

    def act(self, period, action, expected, current, actor):
        if action not in ('prepare', 'approve', 'cancel', 'generate'):
            raise ValueError('Acción no admitida')
        key = f'{current["year"]}-{period}'
        with close_db(self.connect()) as db, db:
            db.execute('BEGIN IMMEDIATE')
            row = db.execute('SELECT state,snapshot FROM closing WHERE period=?', (key,)).fetchone()
            old = dict(state=row[0], snapshot=json.loads(row[1])) if row else None
            if action == 'prepare':
                # Repeated preparation must not undo an existing approval of identical data.
                if old and old['snapshot']['revision'] == current['revision'] and old['state'] != 'cancelled':
                    return old['state']
                state = 'prepared'
            else:
                if not old or expected != old['snapshot']['revision'] or expected != current['revision']:
                    raise ValueError('Los datos han cambiado. Prepara y revisa el nuevo resumen antes de aprobar.')
                allowed = {'approve': ('prepared', 'approved'), 'cancel': ('prepared', 'approved', 'generated'),
                           'generate': ('approved', 'generated')}
                if old['state'] not in allowed[action]:
                    raise ValueError('Primero prepara y aprueba este resumen. Una cancelación requiere prepararlo de nuevo.')
                state = {'approve': 'approved', 'cancel': 'cancelled', 'generate': 'generated'}[action]
            db.execute('INSERT OR REPLACE INTO closing VALUES (?,?,?)', (key, state, json.dumps(current)))
            db.execute('INSERT INTO audit VALUES (?,?,?,?,?)',
                       (datetime.now(timezone.utc).isoformat(), key, action, current['revision'], actor))
        return state

    def download(self, current):
        old = self.get(f'{current["year"]}-{current["period"]}')
        if not old or old['state'] != 'generated' or old['snapshot']['revision'] != current['revision']:
            raise ValueError('Archivo no disponible: genera la versión aprobada o revisa los datos cambiados.')
        raw = base64.b64decode(old['snapshot']['payload'], validate=True)
        if digest(raw) != current['payload_sha256']:
            raise ValueError('El archivo no coincide con el aprobado')
        return raw

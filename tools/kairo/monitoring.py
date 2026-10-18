"""Independent observer. Never imports the fiscal or SMTP execution code."""
import fcntl
import hashlib
import html
import json
import os
import re
import sqlite3
import subprocess
import urllib.request
from contextlib import contextmanager
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
ZONE = ZoneInfo('Europe/Madrid')


def now():
    return datetime.now(ZONE)


def read(name, default=None):
    p = ROOT / name
    return json.loads(p.read_text()) if p.exists() else (default or {})


def save(name, value):
    p = ROOT / (name + '.tmp')
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2))
    p.chmod(0o600)
    p.replace(ROOT / name)


@contextmanager
def lock():
    with (ROOT / 'monitor.lock').open('a') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        yield


def plan():
    # Read-only connection: cannot modify invoices, approval or mail attempts.
    with sqlite3.connect((ROOT / 'service.sqlite').as_uri() + '?mode=ro', uri=True) as c:
        c.row_factory = sqlite3.Row
        r = dict(c.execute('SELECT * FROM plans ORDER BY id DESC LIMIT 1').fetchone())
        r['data'] = json.loads(r['data'])
        token = hashlib.sha256(json.dumps(r['data'], sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
        m = c.execute('SELECT state FROM mails WHERE key=?', ('final:' + token,)).fetchone()
        r['mail_confirmed'] = bool(m and m[0] == 'sent')
        return r


class Client:
    def __init__(self, key):
        self.key = key

    def api(self, path, data=None):
        req = urllib.request.Request('https://healthchecks.io/api/v3/' + path,
            data=None if data is None else json.dumps(data).encode(),
            headers={'X-Api-Key': self.key, 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=12) as r:
                return json.load(r)
        except Exception:
            raise ValueError('Healthchecks no ha confirmado la operación. Revisa la conexión o la clave.') from None

    def ping(self, uuid, failed=False):
        if not re.fullmatch(r'[a-f0-9-]{36}', uuid):
            raise ValueError('Identificador de vigilancia no válido')
        req = urllib.request.Request('https://hc-ping.com/' + uuid + ('/fail' if failed else ''), data=b'')
        try:
            with urllib.request.urlopen(req, timeout=12) as r:
                r.read()
        except Exception:
            raise ValueError('No se pudo comunicar el estado a Healthchecks.') from None


def deadline(row):
    return datetime.fromisoformat(row['data']['send_date'] + 'T08:00:00').replace(tzinfo=ZONE)


def sync_delivery(client, cfg, state, row, t):
    identity = str(row['id']) + ':' + row['data']['send_date']
    due = deadline(row)
    if state.get('delivery_plan') != identity:
        # The remote calendar is armed before the due date, including if Kairo goes offline.
        result = client.api('checks/', {'name': 'Kairo · envío mensual', 'slug': 'kairo-envio',
            'unique': ['slug'], 'schedule': due.strftime('%Y-%m-%d %H:%M:%S'),
            'tz': 'Europe/Madrid', 'grace': 300, 'channels': cfg['channels'], 'methods': 'POST'})
        state['delivery_uuid'] = result['uuid']
        state['delivery_plan'] = identity
        state['delivery_signal'] = ''
        if t < due:
            client.ping(result['uuid'])  # arms a calendar check; not a claim of delivery
        save('monitor-state.json', state)
    if row['status'] == 'sent' and row['mail_confirmed']:
        signal = 'success'
    elif row['status'] in ('blocked', 'uncertain', 'missed', 'email_cancelled', 'cancelled') or t >= due + timedelta(minutes=5):
        signal = 'failure'
    else:
        return
    if state.get('delivery_signal') != signal:
        client.ping(state['delivery_uuid'], failed=signal == 'failure')
        state['delivery_signal'] = signal
        save('monitor-state.json', state)


def services_healthy():
    r = subprocess.run(['systemctl', 'is-active', 'kairo-facturas.service', 'kairo-facturas-runner.timer'],
                       capture_output=True, text=True, timeout=10)
    return r.returncode == 0 and r.stdout.split() == ['active', 'active']


def tick():
    with lock():
        cfg = read('monitor-config.json')
        if not cfg:
            return 'not_configured'
        client = Client(cfg['api_key']); state = read('monitor-state.json'); t = now()
        # Both checks are independent: failure in one does not suppress the other.
        errors = []
        try:
            until = datetime.fromisoformat(state['maintenance_until']) if state.get('maintenance_until') else None
            if not until or t >= until:
                if until:
                    client.api('checks/' + cfg['availability_uuid'], {'timeout': 300, 'grace': 300})
                    state.pop('maintenance_until', None)
                if t.timestamp() - state.get('availability_at', 0) >= 300:
                    client.ping(cfg['availability_uuid'], failed=not services_healthy())
                    state['availability_at'] = t.timestamp()
                    save('monitor-state.json', state)
        except Exception:
            errors.append('No se pudo actualizar disponibilidad')
        try:
            sync_delivery(client, cfg, state, plan(), t)
        except Exception:
            errors.append('No se pudo actualizar vigilancia del envío')
        state['last_observation'] = t.isoformat()
        state['error'] = '; '.join(errors)
        save('monitor-state.json', state)
        return state['error'] or 'ok'


def action(data):
    with lock():
        kind = data.get('action')
        cfg = read('monitor-config.json'); state = read('monitor-state.json')
        if kind == 'setup':
            key = str(data.get('key', '')).strip()
            if not re.fullmatch(r'[A-Za-z0-9_-]{20,200}', key):
                raise ValueError('Introduce la API key del proyecto Healthchecks')
            client = Client(key)
            channels = [x['id'] for x in client.api('channels/')['channels'] if x['kind'] == 'telegram']
            if not channels:
                raise ValueError('Vincula Telegram en Integrations antes de guardar la clave.')
            cfg = {'api_key': key, 'channels': ','.join(channels)}
            result = client.api('checks/', {'name': 'Kairo · disponibilidad', 'slug': 'kairo-disponibilidad',
                'unique': ['slug'], 'timeout': 300, 'grace': 300, 'channels': cfg['channels'], 'methods': 'POST'})
            cfg['availability_uuid'] = result['uuid']
            save('monitor-config.json', cfg)
            client.ping(result['uuid'], failed=not services_healthy())
            sync_delivery(client, cfg, state, plan(), now())
            state['availability_at'] = now().timestamp()
            state['configured_at'] = now().isoformat()
            save('monitor-state.json', state)
            return 'Dos alertas configuradas con Telegram. No se ha enviado ninguna factura.'
        if not cfg:
            raise ValueError('Primero vincula Healthchecks y Telegram')
        client = Client(cfg['api_key'])
        if kind == 'maintenance':
            hours = int(data.get('hours', 0))
            if hours not in (1, 4, 24):
                raise ValueError('Duración no válida')
            client.api('checks/' + cfg['availability_uuid'], {'timeout': hours * 3600, 'grace': 300})
            client.ping(cfg['availability_uuid'])
            state['maintenance_until'] = (now() + timedelta(hours=hours)).isoformat()
            save('monitor-state.json', state)
            return 'Mantenimiento confirmado. Puedes apagar Kairo. El aviso de envío mensual sigue activo.'
        if kind == 'resume':
            client.api('checks/' + cfg['availability_uuid'], {'timeout': 300, 'grace': 300})
            client.ping(cfg['availability_uuid'], failed=not services_healthy())
            state.pop('maintenance_until', None)
            state['availability_at'] = now().timestamp()
            save('monitor-state.json', state)
            return 'Vigilancia de disponibilidad reanudada'
        raise ValueError('Acción desconocida')


def page(csrf):
    cfg = read('monitor-config.json'); state = read('monitor-state.json')
    status = 'Pendiente de vincular Healthchecks y Telegram' if not cfg else 'Healthchecks vinculado'
    maintenance = state.get('maintenance_until')
    if maintenance:
        status += ' · mantenimiento hasta ' + datetime.fromisoformat(maintenance).strftime('%d/%m %H:%M')
    setup = '' if cfg else '''<section><h2>1. Vincular cuenta</h2><p>En Healthchecks, crea un proyecto para Kairo, vincula Telegram en Integrations y genera su API key de lectura y escritura en Settings. Pégala aquí: se guardará solo en Kairo.</p><label>API key del proyecto<input id="key" type="password" autocomplete="off"></label><button onclick="act('setup')">Vincular y activar alertas</button></section>'''
    return '''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Avisos y mantenimiento · Kairo</title><style>
    *{box-sizing:border-box}body{margin:0;background:#f3f6fa;color:#192c42;font:16px/1.6 system-ui}main{max-width:760px;margin:auto;padding:24px 18px}h1{font-size:28px;line-height:1.2}h2{font-size:20px}section{background:white;border:1px solid #dce5ee;border-radius:16px;padding:22px;margin:18px 0}button{background:#185abd;color:white;border:0;border-radius:10px;padding:13px 16px;font:inherit;cursor:pointer;margin:6px 4px 6px 0}button:disabled{opacity:.5}input{display:block;width:100%;padding:12px;border:1px solid #8899aa;border-radius:8px}a{color:#185abd}.note{color:#52657a}#result{white-space:pre-wrap}</style><main><a href="/facturas/">← Volver a facturas</a><h1>Avisos y mantenimiento</h1><p>''' + html.escape(status) + '''</p>''' + setup + '''<section><h2>Vigilancia independiente</h2><p><b>Disponibilidad:</b> avisa si faltan señales o falla el servicio. Normalmente, cada 5 minutos con 5 minutos de margen.</p><p><b>Envío mensual:</b> avisa si a las 08:05 no consta la aceptación del correo por Gmail en la fecha prevista. No acredita la lectura por Excelia.</p><p class="note">Los avisos llegan por Telegram. No se comparten facturas ni credenciales fiscales.</p></section><section><h2>Apagar Kairo por mantenimiento</h2><p>Selecciona cuánto tiempo estará apagado y espera la confirmación antes de apagarlo. Si no vuelve, Healthchecks avisará al finalizar el plazo y sus 5 minutos de margen.</p><button onclick="act('maintenance',1)">Pausar 1 hora</button><button onclick="act('maintenance',4)">Pausar 4 horas</button><button onclick="act('maintenance',24)">Pausar 24 horas</button><button onclick="act('resume')">Reanudar ahora</button><p><b>El aviso del envío mensual permanece activo.</b> Esto no cancela ni cambia el envío de facturas.</p></section><p class="note">Última observación: ''' + html.escape(state.get('last_observation', 'Todavía no registrada')) + '''</p><p role="status" id="result">''' + html.escape(state.get('error', '')) + '''</p></main><script>
    async function act(action,hours){document.querySelectorAll('button').forEach(b=>b.disabled=true);let k=document.getElementById('key');try{let r=await fetch('/facturas/monitor',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':''' + json.dumps(csrf) + '''},body:JSON.stringify({action,hours,key:k?k.value:undefined})});if(k)k.value='';let v=await r.json();document.getElementById('result').textContent=v.message;if(r.ok)setTimeout(()=>location.reload(),2200);}catch(e){document.getElementById('result').textContent='Sin confirmación. No apagues Kairo todavía; vuelve a consultar.';}finally{document.querySelectorAll('button').forEach(b=>b.disabled=false)}}
    </script></html>'''


if __name__ == '__main__':
    os.umask(0o077)
    print(tick())

"""Interactive provisioning on Kairo. Never put the password in chat or argv."""
import argparse
import getpass
import json
import os
import pwd
import resource
import subprocess
import tempfile
from pathlib import Path

CREDENTIAL = Path('/etc/credstore.encrypted/gestify-outlook-password')
UNIT = 'gestify-outlook-auth.service'


def main():
    resource.setrlimit(resource.RLIMIT_CORE,(0,0))
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, required=True)
    parser.add_argument('--remove', action='store_true')
    args = parser.parse_args()
    if os.geteuid() != 0 or not args.config.is_file():
        raise SystemExit('Ejecutar con sudo y la configuración privada de horas.')
    config = json.loads(args.config.read_text())
    owner = args.config.stat().st_uid
    account = pwd.getpwuid(owner)
    if owner == 0:
        raise SystemExit('La configuración debe pertenecer al propietario de Outlook.')
    status = Path(config['state_dir'])/'auth-status.json'
    if args.remove:
        subprocess.run(['systemctl', 'disable', '--now', UNIT], check=True, stdout=subprocess.DEVNULL)
        CREDENTIAL.unlink(missing_ok=True)
        phase = 'disabled'
    else:
        if not os.isatty(0):
            raise SystemExit('Abre una sesión SSH con -t; la contraseña se introduce de forma oculta.')
        password = getpass.getpass('Contraseña de Outlook (no se muestra): ')
        confirmation = getpass.getpass('Repite la contraseña: ')
        if not password or len(password) > 1024 or password != confirmation:
            raise SystemExit('No coinciden o están vacías. No se ha cambiado el secreto.')
        CREDENTIAL.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        fd, temporary = tempfile.mkstemp(prefix='.outlook-', dir=CREDENTIAL.parent)
        os.close(fd)
        try:
            subprocess.run(['systemd-creds', 'encrypt', '--with-key=host', '--name=outlook-password',
                            '-', temporary], input=password.encode('utf-8'),
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            os.chmod(temporary, 0o600)
            os.replace(temporary, CREDENTIAL)
        finally:
            Path(temporary).unlink(missing_ok=True)
            password = confirmation = None
        phase = 'waiting'
        subprocess.run(['systemctl','stop',UNIT],check=True)
    # A new credential explicitly releases a previous pause. No mail is retried.
    temporary = status.with_suffix('.setup')
    temporary.write_text(json.dumps({'phase':phase,'paused':False,'checkedAt':None}))
    os.chmod(temporary, 0o600)
    os.chown(temporary, owner, account.pw_gid)
    os.replace(temporary, status)
    if not args.remove:
        subprocess.run(['systemctl', 'enable', UNIT], check=True, stdout=subprocess.DEVNULL)
        subprocess.run(['systemctl', 'restart', UNIT], check=True)
    print('Secreto eliminado.' if args.remove else 'Secreto cifrado guardado. Recuperación activada; nunca confirma MFA ni envía correos.')
    if not args.remove:print('Se utilizará al necesitar un nuevo acceso. Una sesión ya abierta no se cierra para probarlo.')


if __name__ == '__main__':
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        raise SystemExit('Cancelado; no se ha introducido una contraseña por el chat.')

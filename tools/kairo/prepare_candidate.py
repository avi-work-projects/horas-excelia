"""Prepare a private candidate copy. Does not install, start or configure services."""
import argparse
import ast
from pathlib import Path
import shutil


def patch(source):
    replacements = [
        ('def import_json(raw):', 'def import_json(raw, notify_review=True):'),
        (" if config()['mail_enabled']:\n  key='review:'", " if notify_review and config()['mail_enabled']:\n  key='review:'"),
        ("   if path=='/':return self.reply(200,page())", """   if path=='/gestify':
    from gestify_bridge import receiver
    origin=config().get('gestify_origin','')
    if not origin:return self.reply(404,'Integración no activada')
    return self.reply(200,receiver(origin,CSRF))
   if path=='/':return self.reply(200,page())"""),
        ("    if path=='/approve':approve(data['hash']);msg='Aprobación guardada. No se ha emitido todavía.'", """    if path=='/gestify':
     if not config().get('gestify_origin'):return self.reply(404,'Integración no activada')
     import panel
     from engine import validate_source
     from gestify_bridge import handle
     result=handle(sys.modules[__name__],panel,validate_source,data)
     return self.reply(200,json.dumps(result),'application/json')
    if path=='/approve':approve(data['hash']);msg='Aprobación guardada. No se ha emitido todavía.'"""),
    ]
    for old, new in replacements:
        if source.count(old) != 1:
            raise ValueError('El servicio ha cambiado: revisar el adaptador antes de continuar')
        source = source.replace(old, new)
    ast.parse(source)
    return source


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    if args.destination.exists():
        raise SystemExit('El destino debe ser nuevo; nunca se sobrescribe una instalación')
    candidate = patch((args.source / 'service.py').read_text(encoding='utf-8'))
    args.destination.mkdir(parents=True)
    (args.destination / 'service.py').write_text(candidate, encoding='utf-8')
    for name in ('gestify_bridge.py', 'receiver.js', 'receiver.html'):
        shutil.copyfile(Path(__file__).with_name(name), args.destination / name)
    print('Candidato preparado. Sin configuración, instalación ni ejecución.')

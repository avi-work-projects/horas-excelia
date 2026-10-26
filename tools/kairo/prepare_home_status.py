"""Prepare only the read-only GET/OPTIONS hooks; never deploy or run the service."""
import ast
from pathlib import Path


def patch_status_service(source):
    tree = ast.parse(source)
    handler = next(node for node in tree.body if isinstance(node, ast.ClassDef) and node.name == 'Handler')
    if any(isinstance(node, ast.FunctionDef) and node.name == 'do_OPTIONS' for node in handler.body):
        raise ValueError('Ya existe OPTIONS: revisar antes de integrar')
    anchor = "   if path=='/gestify':\n    from gestify_bridge import receiver"
    if source.count(anchor) != 1 or source.count(' def do_GET(self):') != 1:
        raise ValueError('El servicio ha cambiado: revisar la inserción')
    source = source.replace(anchor, "   if path=='/gestify-status':\n    from home_invoice_status import reply_status\n    return reply_status(self,ROOT,config().get('gestify_origin',''))\n" + anchor)
    source = source.replace(' def do_GET(self):', " def do_OPTIONS(self):\n  from home_invoice_status import reply_status\n  return reply_status(self,ROOT,config().get('gestify_origin',''),preflight=True)\n def do_GET(self):")
    updated = ast.parse(source)
    changed = next(node for node in updated.body if isinstance(node, ast.ClassDef) and node.name == 'Handler')
    # The existing POST, identity guard and reply headers must remain identical.
    for name in ('do_POST', 'allowed', 'reply'):
        old = next(node for node in handler.body if isinstance(node, ast.FunctionDef) and node.name == name)
        new = next(node for node in changed.body if isinstance(node, ast.FunctionDef) and node.name == name)
        if ast.dump(old) != ast.dump(new):
            raise ValueError('Se ha alterado una ruta ajena a la consulta')
    return source


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    if args.destination.exists():
        raise SystemExit('El candidato debe ser nuevo')
    args.destination.write_text(patch_status_service(args.source.read_text(encoding='utf-8')), encoding='utf-8')

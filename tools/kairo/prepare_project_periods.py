"""Patch only the project/identity check in the private invoice target."""
import ast

OLD = "    require(p['issuer']==c['issuer'] and p['client']==c['customer'] and p['project']==c['project'] and p['payment']['iban']==c['iban'],'Cambio de identidad/proyecto/cuenta: revisar configuración')"
NEW = "    from project_periods import validate_identity\n    validate_identity(p,c,require)"


def patch(source):
    if NEW in source and OLD not in source:
        return source
    if source.count(OLD) != 1:
        raise ValueError('El motor ha cambiado; revisar antes de instalar')
    result = source.replace(OLD, NEW)
    def protected(text):
        return [ast.dump(node, include_attributes=False) for node in ast.walk(ast.parse(text))
                if isinstance(node, ast.FunctionDef) and node.name != 'target']
    if protected(source) != protected(result):
        raise ValueError('Se ha modificado una función ajena a la comprobación')
    return result


if __name__ == '__main__':
    import sys
    from pathlib import Path
    source, destination = map(Path, sys.argv[1:])
    if destination.exists():
        raise SystemExit('El candidato ya existe')
    destination.write_text(patch(source.read_text(encoding='utf-8')), encoding='utf-8')

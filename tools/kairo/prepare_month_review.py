"""Add one authenticated GET route; preserve all existing mutations verbatim."""
import ast
from pathlib import Path


def patch(source):
    anchor = "   if path=='/revision':"
    addition = """   if path=='/gestify-month':
    from invoice_month_review import response as month_review
    return self.reply(*month_review(sys.modules[__name__],self.path,CSRF))
"""
    if addition in source:
        return source
    if source.count(anchor) != 1:
        raise ValueError('El servicio ha cambiado; revisar la ruta antes de instalar')
    result = source.replace(anchor, addition+anchor)
    before, after = ast.parse(source), ast.parse(result)
    # Only do_GET may change. Fiscal runner, approval, import and auth stay exact.
    def protected(tree):
        return [ast.dump(n, include_attributes=False) for n in ast.walk(tree)
                if isinstance(n, ast.FunctionDef) and n.name != 'do_GET']
    if protected(before) != protected(after):
        raise ValueError('Se ha modificado una función protegida')
    return result


if __name__ == '__main__':
    import sys
    source, destination = map(Path, sys.argv[1:])
    if destination.exists():
        raise SystemExit('El candidato ya existe')
    destination.write_text(patch(source.read_text(encoding='utf-8')), encoding='utf-8')

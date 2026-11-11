"""Idempotent, hash-checked installation of private Modelos HTTP delegates.

Does not carry service configuration or secrets. Default mode is read-only;
--apply requires the current service hash and a private backup directory.
"""
import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import tempfile


GET_ANCHOR = '   from closing_web import get as closing_get\n'
GET_BLOCK = """   from modelos_web import get as modelos_get
   modelos_result=modelos_get(ROOT/'vat-workflow',self.path,CSRF)
   if modelos_result is not None:return self.reply(*modelos_result)
   from period_workflow import get as period_get
   period_result=period_get(ROOT/'vat-workflow',self.path,CSRF)
   if period_result is not None:return self.reply(*period_result)
"""
OLD_LIMIT = "   if not 0<size<1500000:raise ValueError('Petición no válida')\n"
NEW_LIMIT = """   model_path=urlsplit(self.path).path.removeprefix('/facturas')
   limit=15_000_000 if model_path in ('/modelos/gastos','/modelos/preparacion') else 1500000
   if not 0<size<limit:raise ValueError('Petición no válida o archivo demasiado grande')
"""
LOCK_ANCHOR = '   with MUTEX,process_lock():\n'
POST_ANCHOR = "    if path=='/modelos/cierre':\n"
POST_BLOCK_V1 = """    if path=='/modelos/gastos':
     from modelos_web import post as modelos_post
     return self.reply(200,json.dumps(modelos_post(ROOT/'vat-workflow',path,data,OWNER)),'application/json')
    if path=='/modelos/preparacion':
     from period_workflow import post as period_post
     return self.reply(200,json.dumps(period_post(ROOT/'vat-workflow',path,data,OWNER)),'application/json')
"""
POST_BLOCK = POST_BLOCK_V1.replace("if path=='/modelos/gastos':", "if path in ('/modelos/gastos','/modelos/actualizar'):")
VAT_CALL_V1 = "   vat=vat_response(ROOT.parent/'autonomo-consulta',self.path)\n"
VAT_CALL = "   vat=vat_response(ROOT.parent/'autonomo-consulta',self.path,csrf=CSRF,runtime=ROOT/'vat-workflow')\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def parse(text):
    try:
        return ast.parse(text)
    except SyntaxError as exc:
        # Never print a private source line in diagnostic output.
        raise ValueError(f'El servicio no compila: línea {exc.lineno}') from None


def handlers(tree):
    classes = [node for node in tree.body if isinstance(node, ast.ClassDef) and node.name == 'Handler']
    if len(classes) != 1:
        raise ValueError('No hay un único Handler; revisar integración')
    found = {node.name: node for node in classes[0].body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    if not all(name in found for name in ('allowed', 'do_GET', 'do_POST')):
        raise ValueError('Faltan controles HTTP requeridos')
    return found


def verify_gates(before, after):
    original, changed = handlers(parse(before)), handlers(parse(after))
    for name in ('allowed',):
        if ast.dump(original[name], include_attributes=False) != ast.dump(changed[name], include_attributes=False):
            raise ValueError('La integración alteraría el control de propietario')
    for name in ('do_GET', 'do_POST'):
        if not isinstance(original[name].body[0], ast.If):
            raise ValueError('La autorización debe preceder a las rutas')
        if ast.dump(original[name].body[0], include_attributes=False) != ast.dump(changed[name].body[0], include_attributes=False):
            raise ValueError('La integración alteraría una guarda de autorización')
    post_guard = ast.unparse(original['do_POST'].body[0])
    if not all(token in post_guard for token in ('self.allowed()', 'Origin', 'X-CSRF', 'compare_digest')):
        raise ValueError('No se reconocen las guardas de propietario, Origin y CSRF')
    get_guard = ast.unparse(original['do_GET'].body[0])
    if 'self.allowed()' not in get_guard:
        raise ValueError('No se reconoce la guarda de lectura privada')


def patch_source(text):
    newline = '\r\n' if '\r\n' in text else '\n'
    clean = text.replace('\r\n', '\n')
    parse(clean)
    for anchor in (GET_ANCHOR, LOCK_ANCHOR, POST_ANCHOR):
        if clean.count(anchor) != 1:
            raise ValueError('Ancla HTTP ausente o ambigua; no se ha cambiado el servicio')
    result = clean
    if GET_BLOCK + GET_ANCHOR not in result:
        if any(marker in result for marker in ('from modelos_web import get', 'from period_workflow import get')):
            raise ValueError('Las rutas GET de Modelos tienen una instalación parcial o diferente')
        result = result.replace(GET_ANCHOR, GET_BLOCK + GET_ANCHOR, 1)
    if NEW_LIMIT not in result:
        if result.count(OLD_LIMIT) != 1 or 'model_path=' in result:
            raise ValueError('El límite HTTP tiene un formato distinto; requiere revisión')
        result = result.replace(OLD_LIMIT, NEW_LIMIT, 1)
    if LOCK_ANCHOR + POST_BLOCK + POST_ANCHOR not in result:
        if LOCK_ANCHOR + POST_BLOCK_V1 + POST_ANCHOR in result:
            result = result.replace(POST_BLOCK_V1, POST_BLOCK, 1)
        else:
            if any(marker in result for marker in ('from modelos_web import post', 'from period_workflow import post')):
                raise ValueError('Las rutas POST de Modelos tienen una instalación parcial o diferente')
            if LOCK_ANCHOR + POST_ANCHOR not in result:
                raise ValueError('El cierre existente no está dentro del bloqueo esperado')
            result = result.replace(LOCK_ANCHOR + POST_ANCHOR, LOCK_ANCHOR + POST_BLOCK + POST_ANCHOR, 1)
    if VAT_CALL not in result:
        if result.count(VAT_CALL_V1) != 1:
            raise ValueError('La consulta de Modelos tiene un formato distinto; requiere revisión')
        result = result.replace(VAT_CALL_V1, VAT_CALL, 1)
    # Verify placement and exact preservation of the existing security controls.
    if not all(result.count(block) == 1 for block in (GET_BLOCK, NEW_LIMIT, POST_BLOCK, VAT_CALL)) or VAT_CALL_V1 in result:
        raise ValueError('Integración duplicada o incompleta')
    verify_gates(clean, result)
    return result.replace('\n', newline)


def install(service, expected_sha256, backup_dir, apply=False):
    path = Path(service)
    if path.is_symlink() or not path.is_file():
        raise ValueError('El servicio debe ser un archivo regular')
    if not re.fullmatch('[a-fA-F0-9]{64}', expected_sha256):
        raise ValueError('Huella SHA256 no válida')
    raw = path.read_bytes()
    before = sha(raw)
    if before != expected_sha256.lower():
        raise ValueError('El servicio cambió desde la revisión; no se ha reemplazado')
    bom = raw.startswith(b'\xef\xbb\xbf')
    changed = patch_source(raw.decode('utf-8-sig')).encode('utf-8')
    if bom:
        changed = b'\xef\xbb\xbf' + changed
    result = {'changed': changed != raw, 'applied': False, 'before_sha256': before,
              'after_sha256': sha(changed)}
    if not apply or changed == raw:
        return result
    backup_root = Path(backup_dir)
    backup_root.mkdir(parents=True, exist_ok=True, mode=0o700)
    backup_path = backup_root / ('service-before-modelos-' + before + '.py')
    if backup_path.exists():
        if backup_path.read_bytes() != raw:
            raise ValueError('El respaldo existente no coincide con la revisión')
    else:
        with os.fdopen(os.open(backup_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600), 'wb') as stream:
            stream.write(raw)
            stream.flush()
            os.fsync(stream.fileno())
    metadata = path.stat()
    fd, temp_name = tempfile.mkstemp(dir=path.parent, prefix='.modelos-service-', suffix='.tmp')
    temp = Path(temp_name)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(changed)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temp, stat.S_IMODE(metadata.st_mode))
        if hasattr(os, 'chown'):
            os.chown(temp, metadata.st_uid, metadata.st_gid)
        if sha(path.read_bytes()) != before:
            raise ValueError('Otro proceso modificó el servicio durante la preparación')
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)
    if sha(path.read_bytes()) != result['after_sha256']:
        raise ValueError('La huella instalada no coincide; revisar antes de reiniciar')
    result.update(applied=True, backup=str(backup_path))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--service', required=True, type=Path)
    parser.add_argument('--expected-sha256', required=True)
    parser.add_argument('--backup-dir', required=True, type=Path)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    try:
        result = install(args.service, args.expected_sha256, args.backup_dir, args.apply)
    except (ValueError, OSError, UnicodeError) as exc:
        parser.exit(1, 'Instalación cancelada: ' + str(exc) + '\n')
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()

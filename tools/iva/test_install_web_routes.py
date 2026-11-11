"""Migrate deployed Modelos routes while preserving private HTTP guards."""
from contextlib import nullcontext
import io
import json
from pathlib import Path
import secrets
import tempfile
import unittest
from unittest.mock import patch
import install_web_routes as installer


SERVICE = '''class Handler:
 def allowed(self):return self.owner
 def reply(self,*args):return args
 def do_GET(self):
  if not self.allowed():return self.reply(403,'Private')
  try:
   from closing_web import get as closing_get
   closing_result=closing_get(ROOT/'vat-workflow',self.path,CSRF)
   if closing_result is not None:return self.reply(*closing_result)
   from vat_dashboard import response as vat_response
   vat=vat_response(ROOT.parent/'autonomo-consulta',self.path)
   if vat is not None:return self.reply(*vat)
   return self.reply(404,'Missing')
  except Exception:return self.reply(503,'Unavailable')
 def do_POST(self):
  if not self.allowed() or self.headers.get('Origin')!=ORIGIN or not secrets.compare_digest(self.headers.get('X-CSRF',''),CSRF):return self.reply(403,'Private')
  try:
   size=int(self.headers.get('Content-Length','0'))
   if not 0<size<1500000:raise ValueError('Petición no válida')
   data=json.loads(self.rfile.read(size));path=urlsplit(self.path).path.removeprefix('/facturas')
   with MUTEX,process_lock():
    if path=='/modelos/cierre':
     from closing_web import post as closing_post
     return self.reply(200,json.dumps(closing_post(ROOT/'vat-workflow',path,data,OWNER)),'application/json')
   return self.reply(404,'Missing')
  except Exception:return self.reply(409,'Unavailable')
'''


def deployed_v1():
    return SERVICE.replace(installer.GET_ANCHOR,installer.GET_BLOCK+installer.GET_ANCHOR).replace(installer.OLD_LIMIT,installer.NEW_LIMIT).replace(installer.POST_ANCHOR,installer.POST_BLOCK_V1+installer.POST_ANCHOR)


class InstallerTests(unittest.TestCase):
    def test_fresh_and_deployed_migrations_are_identical_and_idempotent(self):
        expected=installer.patch_source(SERVICE)
        self.assertEqual(installer.patch_source(deployed_v1()),expected)
        self.assertEqual(installer.patch_source(expected),expected)
        self.assertIn(installer.VAT_CALL,expected)
        self.assertIn("'/modelos/actualizar'",expected)
        self.assertEqual(installer.patch_source(deployed_v1().replace('\n','\r\n')),expected.replace('\n','\r\n'))

    def test_partial_installation_is_rejected(self):
        for broken in (deployed_v1().replace('modelos_post(ROOT/', 'modelos_post(OTHER/'), SERVICE.replace(installer.VAT_CALL_V1,'')):
            with self.assertRaises(ValueError):installer.patch_source(broken)

    def test_installed_manual_route_keeps_owner_origin_and_csrf_guards(self):
        from urllib.parse import urlsplit
        with tempfile.TemporaryDirectory() as folder:
            namespace=dict(ROOT=Path(folder),CSRF='token',ORIGIN='https://private',OWNER='owner',
                           secrets=secrets,json=json,urlsplit=urlsplit,MUTEX=nullcontext(),process_lock=nullcontext)
            exec(installer.patch_source(deployed_v1()),namespace)
            handler=namespace['Handler']()
            handler.path='/facturas/modelos/actualizar'
            good={'Content-Length':'2','Origin':'https://private','X-CSRF':'token'}
            with patch('model_events.request',return_value={'state':'queued'}) as request:
                for owner,headers in ((False,good),(True,good|{'Origin':'https://evil'}),(True,good|{'X-CSRF':'wrong'})):
                    handler.owner=owner;handler.headers=headers;handler.rfile=io.BytesIO(b'{}')
                    self.assertEqual(handler.do_POST()[0],403)
                request.assert_not_called()
                handler.owner=True;handler.headers=good;handler.rfile=io.BytesIO(b'{}')
                response=handler.do_POST()
                self.assertEqual(response[0],200)
                self.assertEqual(json.loads(response[1])['state'],'queued')
                request.assert_called_once_with(Path(folder)/'vat-workflow','manual','owner')
            handler.path='/facturas/modelos/actualizacion'
            with patch('model_events.request') as request, patch('model_events.status',return_value={'state':'idle'}) as status:
                handler.owner=False
                self.assertEqual(handler.do_GET()[0],403)
                status.assert_not_called()
                handler.owner=True
                self.assertEqual(json.loads(handler.do_GET()[1])['state'],'idle')
                request.assert_not_called()

    def test_hash_checked_installation_preserves_backup_and_rejects_changed_source(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);service=root/'service.py';backup=root/'backup'
            raw=deployed_v1().encode();service.write_bytes(raw)
            with self.assertRaises(ValueError):installer.install(service,'0'*64,backup,True)
            self.assertEqual(service.read_bytes(),raw)
            applied=installer.install(service,installer.sha(raw),backup,True)
            self.assertTrue(applied['applied'])
            self.assertEqual(Path(applied['backup']).read_bytes(),raw)
            self.assertFalse(installer.install(service,applied['after_sha256'],backup,True)['changed'])


if __name__=='__main__':unittest.main()

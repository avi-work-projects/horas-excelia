import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from vat_dashboard import response, verified


class DashboardTests(unittest.TestCase):
    def test_allowlist_and_changed_file_block_download(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root/'test.txt').write_bytes(b'ENSAYO')
            entry = dict(path='test.txt',sha256=hashlib.sha256(b'ENSAYO').hexdigest(),
                         mime='text/plain',filename='ENSAYO.txt')
            (root/'modelos-index.json').write_text(json.dumps({'downloads':{'test':entry}}))
            self.assertEqual(response(root, '/facturas/modelos/descargar?id=test')[1], b'ENSAYO')
            self.assertEqual(response(root, '/modelos/descargar?id=test')[1], b'ENSAYO')
            self.assertEqual(response(root, '/facturas/modelos/descargar?id=../../secret')[0],404)
            (root/'test.txt').write_bytes(b'CHANGED')
            self.assertEqual(response(root, '/facturas/modelos/descargar?id=test')[0],503)
            with self.assertRaises(ValueError):
                verified(root, entry | {'path':'../secret'})
            self.assertIsNone(response(root, '/facturas/approve'))

    def test_missing_archive_fails_closed(self):
        with tempfile.TemporaryDirectory() as folder:
            self.assertEqual(response(folder,'/facturas/modelos')[0],503)

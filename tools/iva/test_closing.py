import base64
import tempfile
from pathlib import Path
import unittest
from closing import Store, digest, confined


class ClosingTests(unittest.TestCase):
    def snapshot(self, revision='a'*64, year=2026):
        return dict(year=year,period='2T',revision=revision,payload=base64.b64encode(b'ENSAYO').decode(),payload_sha256=digest(b'ENSAYO'))

    def test_approval_change_cancel_and_idempotency(self):
        with tempfile.TemporaryDirectory() as folder:
            store = Store(Path(folder)/'state.sqlite')
            a, b = self.snapshot(), self.snapshot('b'*64)
            for action in ('approve','generate'):
                with self.assertRaises(ValueError):store.act('2T',action,a['revision'],a,'test')
            self.assertEqual(store.act('2T','prepare',None,a,'test'),'prepared')
            with self.assertRaises(ValueError):store.download(a)
            store.act('2T','approve',a['revision'],a,'test')
            self.assertEqual(store.act('2T','prepare',None,a,'test'),'approved')
            store.act('2T','generate',a['revision'],a,'test')
            self.assertEqual(store.download(a),b'ENSAYO')
            with self.assertRaises(ValueError):store.download(b)
            with self.assertRaises(ValueError):store.act('2T','generate',a['revision'],b,'test')
            store.act('2T','prepare',None,b,'test')
            self.assertEqual(store.get('2026-2T')['state'],'prepared')
            with self.assertRaises(ValueError):store.act('2T','approve',a['revision'],b,'test')
            store.act('2T','approve',b['revision'],b,'test')
            store.act('2T','cancel',b['revision'],b,'test')
            with self.assertRaises(ValueError):store.act('2T','generate',b['revision'],b,'test')
            with self.assertRaises(ValueError):store.download(b)
            self.assertIsNone(store.get('2027-2T'))
            self.assertEqual(store.act('2T','prepare',None,b,'test'),'prepared')

    def test_corrupted_payload_and_path_escape_blocked(self):
        with tempfile.TemporaryDirectory() as folder:
            store=Store(Path(folder)/'state.sqlite')
            a=self.snapshot() | {'payload':base64.b64encode(b'CORRUPT').decode()}
            store.act('2T','prepare',None,a,'test')
            store.act('2T','approve',a['revision'],a,'test')
            store.act('2T','generate',a['revision'],a,'test')
            with self.assertRaises(ValueError):store.download(a)
            with self.assertRaises(ValueError):confined(folder,'../secret')

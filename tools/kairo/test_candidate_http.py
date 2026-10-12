"""Exercise patched Handler in memory; no sockets, fiscal backend or live storage.

Usage: python tools/kairo/test_candidate_http.py PRIVATE_CANDIDATE/service.py
"""
import importlib.util
import io
import json
import sys
import unittest
from contextlib import nullcontext
from datetime import timezone
from types import SimpleNamespace
from unittest.mock import patch
from test_bridge import BridgeTests

candidate_path = sys.argv.pop(1)
spec = importlib.util.spec_from_file_location('isolated_candidate', candidate_path)
candidate = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = candidate
# These tests cover routing/authentication only, never dates or the runner.
# Avoid requiring the Linux tz database on the Windows development machine.
with patch('zoneinfo.ZoneInfo', lambda _: timezone.utc):
    spec.loader.exec_module(candidate)  # __main__ runner never executes.


class HandlerTests(unittest.TestCase):
    def setUp(self):
        self.fixture = BridgeTests()
        self.fixture.setUp()
        self.patches = [
            patch.object(candidate, 'ROOT', self.fixture.root),
            patch.object(candidate, 'db', self.fixture.db),
            patch.object(candidate, 'load', self.fixture.load),
            patch.object(candidate, 'import_json', self.fixture.import_json),
            patch.object(candidate, 'process_lock', nullcontext),
            patch.object(candidate, 'config', lambda: {'gestify_origin':'https://synthetic.github.io'}),
            patch.dict(sys.modules, {'panel':self.fixture.panel, 'engine':SimpleNamespace(validate_source=lambda p:json.loads(p.read_text()))}),
        ]
        for item in self.patches: item.start()

    def tearDown(self):
        for item in reversed(self.patches): item.stop()
        self.fixture.tearDown()

    def request(self, changes=None, method='POST'):
        handler = candidate.Handler.__new__(candidate.Handler)
        raw = json.dumps(self.fixture.data).encode()
        handler.headers = {'Tailscale-User-Login':candidate.OWNER, 'Host':'127.0.0.1:8766',
                           'Origin':candidate.ORIGIN, 'X-CSRF':candidate.CSRF, 'Content-Length':str(len(raw))}
        handler.headers.update(changes or {})
        handler.path = '/facturas/gestify'
        handler.rfile = io.BytesIO(raw)
        response = []
        handler.reply = lambda *args: response.append(args)
        getattr(handler, 'do_' + method)()
        return response[0]

    def test_same_origin_csrf_authenticated_import(self):
        code, raw, _ = self.request()
        self.assertEqual(code, 200)
        self.assertEqual(json.loads(raw)['state'], 'review')
        self.assertEqual(len(self.fixture.calls), 1)

    def test_identity_host_origin_and_csrf_stay_required(self):
        for headers in ({'Tailscale-User-Login':''}, {'Host':'evil.test'},
                        {'Origin':'https://synthetic.github.io'}, {'X-CSRF':'wrong'}):
            self.assertEqual(self.request(headers)[0], 403)
        self.assertFalse(self.fixture.calls)

    def test_get_requires_identity(self):
        self.assertEqual(self.request({'Tailscale-User-Login':''}, 'GET')[0], 403)

    def test_disabled_by_default(self):
        with patch.object(candidate, 'config', lambda:{}):
            self.assertEqual(self.request()[0], 404)
            self.assertEqual(self.request(method='GET')[0], 404)
        self.assertFalse(self.fixture.calls)


if __name__ == '__main__':
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(HandlerTests)
    result = unittest.TextTestRunner().run(suite)
    sys.exit(not result.wasSuccessful())

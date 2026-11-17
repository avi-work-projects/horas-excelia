"""Bridge boundary and concurrency contracts; no live requests or mail writes."""
import base64
import json
from pathlib import Path
import tempfile
import unittest

from desktop_billing import dispatch, local_fragment, route


REMOTE_CSRF = 'remote-private-token-'+'a'*24
LOCAL_CSRF = 'local-session-token-'+'b'*24
PAGE = ('<html><head><style>body{color:red}.k-card{padding:12px}</style>'
        '<script src="/theme.js"></script></head><body>'
        '<svg hidden><symbol id="invoice"><path/></symbol></svg>'
        '<header><svg class="theme-sun"><circle/></svg></header>'
        '<main><h1>Factura</h1><a href="/facturas/mail-setup">Configurar</a></main>'
        '<dialog id="confirm">Confirmar programación</dialog>'
        '<script>const boot={"csrf":"'+REMOTE_CSRF+'"};</script></body></html>')


class BillingBridgeTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        base = Path(self.temp.name)
        self.root = base/'gestify-facturacion'
        self.root.mkdir()
        (self.root/'service.py').write_text("OWNER='owner@example.test'\nORIGIN='https://kairo.example.test'\n")
        hours = base/'gestify-outlook'
        hours.mkdir()
        (hours/'hours.json').write_text(json.dumps(dict(port=8770, owner='owner@example.test', private_origin='https://kairo.example.test')))
        self.calls = []

    def transport(self, target, method, url, data=None, csrf=None):
        self.calls.append((target, method, url, data, csrf))
        if method == 'GET':
            return 200, PAGE.encode(), 'text/html; charset=utf-8', {}
        return 200, b'{"message":"Guardado"}', 'application/json', {}

    def test_read_preserves_confirmation_and_uses_only_local_csrf(self):
        result = dispatch(self.root, dict(action='billing_get', url='/facturas/revision', csrf=LOCAL_CSRF), self.transport)
        html = base64.b64decode(result['body']).decode()
        self.assertIn('id="confirm"', html)
        self.assertIn('<symbol', html)
        self.assertIn(LOCAL_CSRF, html)
        self.assertNotIn(REMOTE_CSRF, html)
        self.assertNotIn('theme.js', html)
        self.assertNotIn('theme-sun', html)
        self.assertNotIn('mail-setup', html)
        self.assertIn('@scope (.billing-content)', html)
        self.assertEqual([call[1] for call in self.calls], ['GET'])

    def test_approval_preserves_identity_and_obtains_server_token(self):
        data = dict(planId=12, hash='a'*64)
        result = dispatch(self.root, dict(action='billing_post', url='/facturas/approve', data=data), self.transport)
        self.assertEqual(result['message'], 'Guardado')
        self.assertEqual(self.calls[0][2], '/facturas/ajustes')
        self.assertEqual(self.calls[1][3:], (data, REMOTE_CSRF))
        self.assertEqual(self.calls[1][0]['port'], 8766)

    def test_old_or_unspecified_invoice_never_reaches_upstream(self):
        for data in ({'hash':'a'*64}, {'planId': True, 'hash':'a'*64}, {'planId':1,'hash':'old'}):
            with self.assertRaises(ValueError):
                dispatch(self.root, dict(action='billing_post', url='/facturas/approve', data=data), self.transport)
        with self.assertRaises(ValueError):
            dispatch(self.root, dict(action='billing_post', url='/facturas/cancel', data=dict(planId=1,hash='a'*64)), self.transport)
        self.assertEqual(self.calls, [])

    def test_private_paths_and_scan_on_get_are_not_forwarded(self):
        cases = [('GET','https://outside.test/facturas/'), ('GET','//outside.test/facturas/'),
                 ('GET','/horas/status?period=2026-11'), ('GET','/facturas/mail-setup'),
                 ('GET','/facturas/../mail-setup'), ('GET','/facturas/%2e%2e/'),
                 ('GET','/horas/calendar-data?period=2026-11&period=2026-12'),
                 ('POST','/facturas/tick'), ('POST','/facturas/mail-setup'),
                 ('POST','/facturas/approve?force=1')]
        for method, url in cases:
            with self.subTest(method=method, url=url), self.assertRaises(ValueError):
                route(url, method)
        self.assertEqual(route('/facturas/historico?year=2026&state=issued', 'GET'), 'billing')
        self.assertEqual(route('/facturas/historico?year=%32%30%32%36&state=issued', 'GET'), 'billing')

    def test_hours_uses_existing_persistent_job_service(self):
        data = dict(period='2026-11')
        dispatch(self.root, dict(action='billing_post', url='/horas/calendar-refresh', data=data), self.transport)
        self.assertEqual(self.calls[1][0]['port'], 8770)
        self.assertEqual(self.calls[1][2:], ('/horas/calendar-refresh', data, REMOTE_CSRF))

    def test_upstream_conflict_is_not_reported_as_success(self):
        def conflict(target, method, url, data=None, csrf=None):
            if method == 'GET':
                return self.transport(target, method, url)
            return 409, b'{"message":"Vista antigua; recarga"}', 'application/json', {}
        with self.assertRaisesRegex(ValueError, 'Vista antigua'):
            dispatch(self.root, dict(action='billing_post', url='/facturas/approve', data=dict(planId=1,hash='a'*64)), conflict)

    def test_pdf_is_not_rewritten(self):
        pdf = b'%PDF-1.7\ninvoice'
        def document(*args):
            return 200, pdf, 'application/pdf', {'content-disposition':'inline; filename="factura.pdf"', 'Set-Cookie':'private'}
        result = dispatch(self.root, dict(action='billing_get', url='/facturas/documento/12/final', csrf=LOCAL_CSRF), document)
        self.assertEqual(base64.b64decode(result['body']), pdf)
        self.assertEqual(result['headers'], {'Content-Disposition':'inline; filename="factura.pdf"'})


if __name__ == '__main__':
    unittest.main()

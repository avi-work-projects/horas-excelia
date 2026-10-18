"""Pass private candidate service.py; all storage uses synthetic temporary files."""
import unittest
from unittest.mock import patch
from test_candidate_http import candidate
from test_invoice_dashboard import DashboardTests as Fixture


class RoutingTests(unittest.TestCase):
    def setUp(self):
        self.f=Fixture();self.f.setUp()
        self.patch=patch.object(candidate,'ROOT',self.f.root);self.patch.start()

    def tearDown(self):self.patch.stop();self.f.tearDown()

    def get(self,path,owner=True):
        h=candidate.Handler.__new__(candidate.Handler)
        h.path=path;h.headers={'Host':'127.0.0.1:8766','Tailscale-User-Login':candidate.OWNER if owner else ''}
        result=[];h.reply=lambda *args:result.append(args)
        h.do_GET();return result[0]

    def test_all_new_routes_protected_and_read_only(self):
        before=self.f.hashes()
        for url in ['/facturas/','/facturas/historico?state=issued','/facturas/factura/1','/facturas/documento/2/final','/facturas/documento/1/draft']:
            self.assertEqual(self.get(url,False)[0],403)
            self.assertEqual(self.get(url)[0],200)
        self.assertEqual(before,self.f.hashes())

    def test_review_retained_and_unknown_invoice_404(self):
        with patch.object(candidate,'page',return_value='<header class="intro">Existing approval screen'):
            result=self.get('/facturas/revision')
        self.assertEqual(result[0],200);self.assertIn('Existing approval screen',result[1])
        self.assertIn('Resumen e histórico',result[1])
        self.assertEqual(self.get('/facturas/factura/99')[0],404)


if __name__=='__main__':unittest.main(defaultTest='RoutingTests')

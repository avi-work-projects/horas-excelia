from copy import deepcopy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from accounting_views import render
from test_modelos_web import fixture
from vat_dashboard import response


class AccountingViewsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.index, self.report, self.ledger = fixture(self.root)
        self.ledger['records'][0]['party'] = 'Proveedor de oficina'
        self.ledger['records'][0]['tax_id'] = 'B00000000'
        renta = deepcopy(self.ledger['records'][0])
        renta.update(number='GAS-2', party='Gas de prueba', include=False,
                     base='50.00', vat='10.50', total='60.50', category='gas', tax_scope='irpf_only')
        self.ledger['records'].append(renta)

    def test_renta_documents_never_enter_overview_vat_totals(self):
        html = render(self.index, self.report, self.ledger, 'resumen')
        self.assertIn('100,00 €', html)
        self.assertIn('21,00 €', html)
        self.assertNotIn('150,00 €', html)
        self.assertNotIn('31,50 €', html)
        renta = render(self.index, self.report, self.ledger, 'renta')
        self.assertIn('GAS-2', renta)
        self.assertNotIn('Proveedor de oficina', renta)
        self.assertIn('No representan un importe deducible aprobado', renta)

    def test_filters_escape_values_and_legacy_document_links_work(self):
        self.ledger['records'][0]['party'] = '<img src=x onerror=alert(1)>'
        html = render(self.index, self.report, self.ledger, 'gastos', search='<img')
        self.assertIn('&lt;img', html)
        self.assertNotIn('<img src=x', html)
        self.assertNotIn('GAS-2', html)
        self.assertIn('documento?id=', html)
        self.assertIn('IVA según libro', html)
        empty = render(self.index, self.report, self.ledger, 'ingresos')
        self.assertIn('No hay documentos registrados', empty)

    def test_current_excel_requires_matching_ledger_and_stale_download_is_blocked(self):
        item = dict(path='current.xlsx', sha256=hashlib.sha256(b'xlsx').hexdigest(),
                    mime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    filename='consulta.xlsx', ledger_sha256='different')
        self.index['downloads']['annual-workbook'] = item
        html = render(self.index, self.report, self.ledger, 'libros')
        self.assertNotIn('Descargar Excel actualizado', html)
        (self.root/'current.xlsx').write_bytes(b'xlsx')
        (self.root/'modelos-index.json').write_text(json.dumps(self.index))
        self.assertEqual(response(self.root, '/modelos/descargar?id=annual-workbook')[0], 503)
        item['ledger_sha256'] = self.index['ledger']['sha256']
        (self.root/'modelos-index.json').write_text(json.dumps(self.index))
        self.assertIn('Descargar Excel actualizado', render(self.index, self.report, self.ledger, 'libros'))
        self.assertEqual(response(self.root, '/modelos/descargar?id=annual-workbook')[1], b'xlsx')

    def test_default_overview_preserves_quarter_routes_and_rejects_unknown_views(self):
        self.assertIn('Tu contabilidad', response(self.root, '/modelos')[1])
        self.assertIn('IVA 2026', response(self.root, '/modelos?periodo=4T')[1])
        self.assertIn('IVA 2026', response(self.root, '/modelos?vista=modelos')[1])
        self.assertEqual(response(self.root, '/modelos?vista=unknown')[0], 400)


if __name__ == '__main__':
    unittest.main()

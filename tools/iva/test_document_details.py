from copy import deepcopy
import json
from pathlib import Path
import tempfile
import unittest

from document_details import attach_details, detail_path, description
from accounting_views import record_table


class DetailsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name)/'ledger.json'
        self.row = dict(sha256='a'*64, kind='income', number='I-1', date='2026-10-01', period='4T',
            party='Cliente <privado>', tax_id='B00000000', base='6830.00', vat='1434.30', withholding='1024.50',
            total='7239.80', source='Factura_2026.pdf', include=True)
        self.data = dict(year=2026, records=[self.row])
        self.details = dict(description='Consultoría', work_lines=[dict(days='20',rate='310'),dict(days='2',rate='315')],
            vat_rate='21.00', withholding_rate='15.00', evidence=[dict(page=1,quote='20 días a 310; 2 días a 315')])

    def save(self):
        detail_path(self.path,2026).write_text(json.dumps(dict(schema_version=1,year=2026,documents={'a'*64:self.details})),encoding='utf-8')

    def test_multi_rate_details_only_enrich_display_and_render_separate_lines(self):
        self.save()
        before=deepcopy(self.data)
        data=attach_details(self.data,self.path)
        self.assertEqual(self.data,before)
        row=data['records'][0]
        self.assertEqual(row['base'],'6830.00')
        self.assertEqual(len(row['display_details']['work_lines']),2)
        html=record_table([row],income=True)
        self.assertIn('20 × 310 €',html)
        self.assertIn('2 × 315 €',html)
        self.assertIn('(Base × 21 %)',html)
        self.assertIn('(Base × 15 %)',html)
        self.assertIn('Cliente &lt;privado&gt;',html)
        self.assertLess(html.index('>Cliente</th>'),html.index('>Fecha / factura</th>'))
        self.assertEqual(html.count('--rate-hue:'),2)

    def test_bad_breakdown_or_other_document_never_fills_missing_days(self):
        self.details['work_lines'][0]['days']='19'
        self.save()
        row=attach_details(self.data,self.path)['records'][0]
        self.assertNotIn('work_lines',row['display_details'])
        self.assertIn('Desglose pendiente',record_table([row],income=True))
        self.row['sha256']='b'*64
        self.assertNotIn('display_details',attach_details(self.data,self.path)['records'][0])

    def test_shared_pdf_does_not_assign_one_description_to_multiple_invoices(self):
        self.save()
        self.data['records'].append(dict(self.row,number='I-2'))
        self.assertTrue(all('display_details' not in r for r in attach_details(self.data,self.path)['records']))

    def test_missing_concept_never_uses_filename_or_supplier(self):
        self.assertEqual(description(self.row)[0],'Concepto pendiente de revisar')
        self.row['source']='FACTURAS/2026/TECLADO_TRABAJO.pdf'
        self.assertEqual(description(self.row),('Concepto pendiente de revisar','Consulta el PDF original'))
        self.row['description']='Teclado de oficina documentado'
        self.assertEqual(description(self.row),('Teclado de oficina documentado','Concepto registrado'))

    def test_shared_pdf_uses_exact_invoice_with_its_identity_evidence(self):
        self.data['records'].append(dict(self.row,number='I-2'))
        self.details={'invoices':{
            'I-1':{'description':'Regleta de 4 tomas','evidence':[dict(page=1,quote='Factura I-1: regleta de 4 tomas')]},
            'I-2':{'description':'Regleta USB','evidence':[dict(page=2,quote='Factura I-2: regleta USB')]}}}
        self.save()
        rows=attach_details(self.data,self.path)['records']
        self.assertEqual([description(r)[0] for r in rows],['Regleta de 4 tomas','Regleta USB'])
        self.details['invoices']['I-2']['evidence'][0]['quote']='No corresponde a esa factura'
        self.save()
        rows=attach_details(self.data,self.path)['records']
        self.assertEqual(description(rows[1])[0],'Concepto pendiente de revisar')
        self.assertEqual(description(rows[0])[0],'Regleta de 4 tomas')


if __name__ == '__main__':
    unittest.main()

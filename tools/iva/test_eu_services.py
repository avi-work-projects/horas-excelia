"""Fictional EU-services fixtures: no private invoices or filing operations."""
from copy import deepcopy
from decimal import Decimal
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest

from openpyxl import load_workbook
from accounting_workbook import build
from accounting_views import record_table, overview
from expense_policy import default_fields, validate_policy, validate_proposal
from expense_workflow import ExpenseStore
from ledger import calculate, eu_service_vat, validate
from modelos_web import render_review
from test_expense_workflow import fields, pdf
from test_ledger import record, data


def eu_record(**changes):
    return record(kind='expense', number='EU-TEST', party='Fictional EU service',
        tax_id='IE1234567AB', base='18.00', vat='0.00', withholding='0.00', total='18.00',
        mapping='eu_services21', rate='0.00') | default_fields() | {
            'mapping':'eu_services21', 'include':True, 'tax_scope':'iva_irpf',
            'invoice_status':'complete', 'business_purpose':'Fictional business service',
            'buyer_tax_id':'00000000T', 'buyer_identity_confirmed':True,
            'fiscal_review_confirmed':True, 'reverse_charge_rate':'21.00',
            'deductible_percentage':'100.00'} | changes


class EUServicesTests(unittest.TestCase):
    def test_mixed_operations_keep_documentary_and_reverse_charge_vat_separate(self):
        service=eu_record()
        domestic=record(kind='expense',number='DOMESTIC',withholding='0.00',total='121.00')
        inputs=data([record(),domestic,service]); before=deepcopy(inputs)
        inputs['profiles']={'3T':{'remaining_boxes_confirmed_zero':True}}
        boxes=calculate(inputs)['3T']['boxes']
        self.assertEqual({k:boxes[k] for k in ('07','09','10','11','27','28','29','36','37','45','46','71')},
            {'07':'100.00','09':'21.00','10':'18.00','11':'3.78','27':'24.78',
             '28':'100.00','29':'21.00','36':'18.00','37':'3.78','45':'24.78','46':'0.00','71':'0.00'})
        self.assertEqual(inputs['records'],before['records'])
        self.assertEqual(service['vat'],'0.00')
        self.assertEqual(service['rate'],'0.00')
        self.assertEqual(calculate(data([record()]))['3T']['boxes']['11'],'0.00')

    def test_rounding_is_half_up_per_invoice_and_negative_precision_are_blocked(self):
        first=eu_record(base='0.50',total='0.50')
        self.assertEqual(eu_service_vat(first),Decimal('0.11'))
        second=first|{'number':'EU-2'}
        self.assertEqual(calculate(data([first,second]))['3T']['boxes']['11'],'0.22')
        for changes in ({'base':'-18.00','total':'-18.00'}, {'base':'18.001','total':'18.001'},
                        {'base':18.0,'total':'18.00'}):
            with self.subTest(changes=changes),self.assertRaises(ValueError):
                validate([eu_record(**changes)],2026)

    def test_only_explicit_supported_treatment_and_review_can_be_included(self):
        for changes in ({'vat':'3.78','total':'21.78'}, {'rate':'21.00'},
                        {'reverse_charge_rate':''},{'reverse_charge_rate':'10.00'},
                        {'deductible_percentage':''},{'deductible_percentage':'50.00'},
                        {'withholding':'1.00','total':'17.00'}, {'kind':'income'},
                        {'category':'electricity'}, {'irpf_treatment':'asset'},
                        {'buyer_identity_confirmed':False}, {'fiscal_review_confirmed':False},
                        {'invoice_status':'needs_review'}, {'tax_id':'ESB00000000'},
                        {'tax_id':'GB123456789'}, {'tax_id':'US123456789'}, {'tax_id':'IE123'},
                        {'mapping':'domestic21','rate':'21.00'}):
            with self.subTest(changes=changes),self.assertRaises(ValueError):
                calculate(data([eu_record(**changes)]))
        # A new mapping cannot disguise itself as an unreviewed historical row.
        legacy=eu_record()
        for key in default_fields(): legacy.pop(key,None)
        legacy.update(include=True,mapping='eu_services21')
        with self.assertRaises(ValueError):calculate(data([legacy]))

    def test_supplier_format_normalization_blocks_duplicate_identity_without_rewriting(self):
        first=eu_record(tax_id='IE 1234567AB')
        validate([first],2026)
        self.assertEqual(first['tax_id'],'IE 1234567AB')
        with self.assertRaisesRegex(ValueError,'Duplicate'):
            validate([first,eu_record(tax_id='ie1234567ab',source='other.pdf',sha256='b'*64)],2026)

    def test_approval_bundle_preserves_zero_document_vat_and_explicit_treatment(self):
        with tempfile.TemporaryDirectory() as directory:
            store=ExpenseStore(Path(directory)/'queue')
            draft=store.upload('invoice.pdf',pdf('fictional eu'),'test')
            supplied=fields()|{key:eu_record()[key] for key in (
                'party','tax_id','base','vat','withholding','total','mapping','rate',
                'reverse_charge_rate','deductible_percentage')}
            draft=store.update(draft['id'],supplied,draft['revision'],'test')
            html=render_review(draft,[draft])
            for name in ('mapping','reverse_charge_rate','deductible_percentage'):
                self.assertIn('name="'+name+'"',html)
            self.assertIn('eu_services21',html)
            self.assertIn('VIES',html)
            approved=store.approve(draft['id'],draft['revision'],'test')
            row=store.bundle(approved['id'])['record']
            self.assertEqual([row[k] for k in ('vat','rate','reverse_charge_rate','deductible_percentage')],
                             ['0.00','0.00','21.00','100.00'])
            self.assertEqual(calculate(data([row]))['4T']['boxes']['37'],'3.78')
            proposal={'schema_version':1,'document_sha256':draft['sha256'],
                'values':{'rate':'0.00','vat':'0.00'},
                'evidence':{'rate':[{'page':1,'quote':'VAT 0%'}],'vat':[{'page':1,'quote':'VAT EUR 0.00'}]}}
            self.assertEqual(validate_proposal(proposal,1,draft['sha256'])['values']['rate'],'0.00')
            proposal['values']['reverse_charge_rate']='21.00'
            with self.assertRaises(ValueError):validate_proposal(proposal,1,draft['sha256'])

    def test_excel_and_views_show_autoliquidated_vat_separately(self):
        inputs=data([eu_record()]); inputs['as_of']='2026-09-30'
        sha=hashlib.sha256(json.dumps(inputs).encode()).hexdigest()
        book=load_workbook(io.BytesIO(build(inputs,sha)),data_only=True)
        self.addCleanup(book.close)
        self.assertEqual(book['Gastos']['G6'].value,0)
        self.assertEqual(book['Servicios UE']['G6'].value,0)
        self.assertEqual(book['Servicios UE']['I6'].value,3.78)
        self.assertEqual(book['Servicios UE']['K6'].value,3.78)
        self.assertEqual(book['Resumen']['D8'].value,0) # domestic base excludes EU
        self.assertEqual(book['Resumen']['B25'].value,18)
        self.assertEqual(book['Resumen']['C25'].value,3.78)
        rendered=record_table(inputs['records'])
        self.assertIn('Servicio UE',rendered)
        self.assertIn('3,78',rendered)
        report={'quarters':calculate(inputs)}
        self.assertIn('IVA deducible calculado',overview(report,inputs['records'],0))


if __name__=='__main__':unittest.main()

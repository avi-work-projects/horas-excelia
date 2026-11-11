"""Synthetic integration through the real annual calculation and approval store."""
import json
import os
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import patch

import annual_workflow as annual
from closing import Store, digest
import test_export_390 as fixtures


@unittest.skipUnless(os.environ.get('IVA390_DESIGN'), 'Set IVA390_DESIGN to original AEAT XLSX')
class AnnualWorkflowTests(unittest.TestCase):
    def setUp(self):
        fixture = fixtures.AnnualPreparationTests()
        fixture.setUp()
        self.addCleanup(fixture.doCleanups)
        self.root, self.data = fixture.root, fixture.data
        self.runtime = self.root / 'runtime'
        self.runtime.mkdir()
        (self.root / 'MODELOS').mkdir()
        # Documents are synthetic evidence bytes, not uploaded through the PDF parser.
        for period in ('perfil', '1T', '2T', '3T', '4T'):
            (self.root / 'MODELOS' / f'{period}.pdf').write_bytes(('SYNTHETIC ' + period).encode())
        received = self.root / 'REVISIONES/2026/JUSTIFICANTES'
        received.mkdir(parents=True)
        self.fourth_proof = received / 'filing_4T_synthetic.pdf'
        self.fourth_proof.write_bytes(b'SYNTHETIC uploaded fourth return')
        old_year = self.root / 'REVISIONES/2025/JUSTIFICANTES'
        old_year.mkdir(parents=True)
        (old_year / 'filing_4T.pdf').write_bytes(b'SYNTHETIC another exercise')
        (self.root / 'identity.json').write_text(json.dumps(fixture.identity), encoding='utf-8')
        self.write_ledger()
        config = dict(archive_root=str(self.root), ledger='ledger.json', identity='identity.json',
                      design_390=os.environ['IVA390_DESIGN'], year=2026)
        (self.runtime / 'config.json').write_text(json.dumps(config), encoding='utf-8')
        options = {value:key for key,value in annual.candidates(self.root).items()}
        self.form = dict(period='anual', action='review', ledger_hash=digest((self.root / 'ledger.json').read_bytes()),
            surname='PRUEBA SINTETICA', given_name='EJEMPLO', description='CONSULTORIA', code='A05', iae='763',
            third_party_return='no', profile_source=options['MODELOS/perfil.pdf'],
            **{k:True for k in (*annual.CHECKS, *annual.GROUPS)},
            **{'source_' + p:options['MODELOS/' + p + '.pdf'] for p in ('1T','2T','3T','4T')})
        self.form['source_4T'] = options['REVISIONES/2026/JUSTIFICANTES/filing_4T_synthetic.pdf']
        self.dashboard = patch.dict(sys.modules, {'kairo_invoice_web': types.SimpleNamespace(dashboard=lambda body,*args:body)})
        self.dashboard.start()
        self.addCleanup(self.dashboard.stop)

    def write_ledger(self):
        (self.root / 'ledger.json').write_text(json.dumps(self.data), encoding='utf-8')

    def test_prepare_approve_generate_download_and_changed_proof(self):
        original = (self.root / 'ledger.json').read_bytes()
        annual.post(self.runtime, annual.BASE, self.form, 'synthetic')
        current = annual.build_candidate(self.runtime)
        self.assertEqual(current['boxes']['86'], '756.00')
        self.assertEqual(current['boxes']['95'], '756.00')
        self.assertFalse(current['filing_ready'])
        self.assertEqual(annual.get(self.runtime, annual.BASE + '/archivo?periodo=anual', 'token')[0], 409)
        action = dict(period='anual', revision=current['revision'])
        with self.assertRaises(ValueError):
            annual.post(self.runtime, annual.BASE, action | {'action':'generate'}, 'synthetic')
        annual.post(self.runtime, annual.BASE, action | {'action':'approve'}, 'synthetic')
        annual.post(self.runtime, annual.BASE, action | {'action':'generate'}, 'synthetic')
        response = annual.get(self.runtime, annual.BASE + '/archivo?periodo=anual', 'token')
        self.assertEqual(response[0], 200)
        self.assertEqual(len(response[1]), 7427)
        self.assertTrue(response[1].startswith(b'<T390020260A0000><AUX>'))
        self.assertEqual((self.root / 'ledger.json').read_bytes(), original)
        self.assertEqual(Store(self.runtime / 'new-annual.sqlite').get('2026-anual')['state'], 'generated')
        self.fourth_proof.write_bytes(b'Changed evidence')
        self.assertEqual(annual.get(self.runtime, annual.BASE + '/archivo?periodo=anual', 'token')[0], 409)
        page = annual.get(self.runtime, annual.BASE + '?periodo=anual', 'token')
        self.assertEqual(page[0], 200)
        self.assertIn('Los datos han cambiado', page[1])
        self.assertNotIn('Descargar 390 para validar', page[1])

    def test_incomplete_fourth_visible_and_dossier_remains_available(self):
        del self.data['references']['4T']
        self.write_ledger()
        self.form['ledger_hash'] = digest((self.root / 'ledger.json').read_bytes())
        with self.assertRaisesRegex(ValueError, '4T'):
            annual.post(self.runtime, annual.BASE, self.form, 'synthetic')
        page = annual.get(self.runtime, annual.BASE + '?periodo=anual', 'token')
        self.assertEqual(page[0], 200)
        self.assertIn('4T: falta incorporar', page[1])
        self.assertIn('<button disabled>Preparar resumen anual', page[1])
        response = annual.get(self.runtime, annual.BASE + '/archivo?periodo=anual&tipo=dossier', 'token')
        self.assertEqual(response[0], 200)
        report = json.loads(response[1])
        self.assertEqual(report['missing_filed_references'], ['4T'])
        self.assertEqual(report['filed_results_subtotal'], '567.00')
        self.assertEqual(report['documentary_totals']['09'], '840.00')
        self.assertFalse(report['filing_ready'])
        self.assertFalse((self.runtime / 'annual-review.json').exists())

    def test_all_scope_conditions_explicit_and_no_path_injection(self):
        self.assertNotIn('REVISIONES/2025/JUSTIFICANTES/filing_4T.pdf', annual.candidates(self.root, 2026).values())
        self.assertEqual(set(annual.FALSE_FLAGS), {flag for _, flags in annual.GROUPS.values() for flag in flags})
        for group in (*annual.CHECKS, *annual.GROUPS):
            with self.subTest(group=group), self.assertRaises(ValueError):
                annual.save_review(self.runtime, self.form | {group:False}, 'synthetic')
        with self.assertRaisesRegex(ValueError, 'documento existente'):
            annual.save_review(self.runtime, self.form | {'profile_source':'../identity.json'}, 'synthetic')
        self.assertFalse((self.runtime / 'annual-review.json').exists())

    def test_identity_and_ledger_change_invalidate_saved_confirmation(self):
        annual.save_review(self.runtime, self.form, 'synthetic')
        identity_path = self.root / 'identity.json'
        original = identity_path.read_bytes()
        identity_path.write_bytes(original + b' ')
        with self.assertRaisesRegex(ValueError, 'identificación fiscal'):
            annual.build_candidate(self.runtime)
        identity_path.write_bytes(original)
        self.data['coverage']['1T'] = 'Another review'
        self.write_ledger()
        with self.assertRaisesRegex(ValueError, 'versión actual'):
            annual.build_candidate(self.runtime)


if __name__ == '__main__':
    unittest.main()

"""Synthetic mini/source/archive integration; no network or real taxpayer data."""
import base64
from copy import deepcopy
from datetime import date
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import aeat_workflow as workflow
from aeat_submission import SubmissionStore
from test_aeat_submission import FakeClient


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.root = self.base/'AUTONOMO'
        self.ledger_relative = 'LIBROS CONTABLES/2026/libro.json'
        self.ledger = self.root/self.ledger_relative
        self.ledger.parent.mkdir(parents=True)
        self.book = dict(year=2026, as_of='2026-12-31', records=[], documents=[],
            coverage={q:'complete' for q in ('1T','2T','3T','4T')},
            references={'1T':{'71':'12.34'}}, profiles={'4T':{'remaining_boxes_confirmed_zero':True}})
        self.ledger.write_text(json.dumps(self.book), encoding='utf-8')
        self.state = self.base/'private'
        self.state.mkdir()
        self.calls = []
        self.config = dict(archive_root=str(self.root), ledger=self.ledger_relative,
                           backup_root=str(self.base/'backups'))
        self.app = SimpleNamespace(config=self.config, state=self.state, remote=self.remote)
        self.client = FakeClient()
        self.payload = b'<T303020264T synthetic approved model>'
        self.boxes = {k:'0.00' for k in ('07','09','28','29','45','46','71')}
        ledger_hash = workflow.sha(self.ledger.read_bytes())
        self.source_data = dict(year=2026, nif='12345678Z', name='Synthetic Person',
            ledger_sha256=ledger_hash, already_filed=False, problem='',
            snapshot=dict(year=2026, period='4T', revision='revision-original', mode='U',
                payload_sha256=workflow.sha(self.payload), payload=base64.b64encode(self.payload).decode(),
                boxes=self.boxes, basis={'ledger':ledger_hash,'review':'c'*64}, account='Cuenta revisada'))
        (self.state/'aeat-settings.json').write_text(json.dumps(dict(environment='production',allow_live_submission=True)), encoding='utf-8')
        self.client_patch = patch.object(workflow, 'client', return_value=self.client)
        self.client_patch.start()
        self.addCleanup(self.client_patch.stop)

    def remote(self, config, request):
        self.calls.append(deepcopy(request))
        if request['action'] == 'aeat_source':
            return deepcopy(self.source_data)
        if request == dict(action='post',url='/facturas/modelos/actualizar',data={}):
            return {'state':'queued'}
        raise AssertionError(request)

    def prepare(self):
        workflow.post(self.app, dict(action='validate', period='4T'))
        active = workflow.store(self.app, active=True)
        operation = active.list()[0]
        self.assertEqual(operation['state'], 'validated')
        return active, operation['id']

    def filed(self):
        active, identifier = self.prepare()
        snapshot, payload = workflow.candidate(workflow.source(self.app, '4T'))
        result = active.confirm(identifier, active.confirmation(identifier)|{'confirmed':True}, snapshot, payload)
        self.assertEqual(result['state'], 'filed')
        return result

    def test_different_local_and_remote_books_block_candidate(self):
        before = self.ledger.read_bytes()
        self.source_data['ledger_sha256'] = 'f'*64
        current = workflow.source(self.app, '4T')
        self.assertIsNone(current['snapshot'])
        with self.assertRaisesRegex(ValueError, 'copias del libro'):
            workflow.post(self.app, dict(action='validate',period='4T'))
        self.assertEqual(self.ledger.read_bytes(), before)
        self.assertEqual(self.client.submit_calls, 0)

    def test_period_boundaries_use_calendar_not_approximate_days(self):
        for period, last, first in (
            ('1T',date(2026,3,31),date(2026,4,1)),
            ('2T',date(2026,6,30),date(2026,7,1)),
            ('3T',date(2026,9,30),date(2026,10,1)),
            ('4T',date(2026,12,31),date(2027,1,1)),
            ('anual',date(2026,12,31),date(2027,1,1))):
            with self.subTest(period=period):
                self.assertFalse(workflow.period_has_ended(2026,period,last))
                self.assertTrue(workflow.period_has_ended(2026,period,first))

    def test_windows_client_keeps_bounded_time_for_key_consent(self):
        self.client_patch.stop()
        certificate = {'sha256':'a'*64,'has_private_key':True,'subject':'FICTITIOUS','not_after':'2030-01-01T00:00:00Z'}
        with (patch.object(workflow, 'settings', return_value=dict(environment='production',certificate_thumbprint='b'*40,certificate=certificate)),
              patch('aeat_windows.WindowsTransport') as transport):
            transport.return_value.certificate.return_value = certificate
            client = workflow.client(self.app)
        self.assertEqual(client.timeout,120)
        self.assertEqual(client.identity()['certificate_sha256'],'a'*64)

    def test_nrc_is_required_for_income_mode_and_binds_revision(self):
        current = deepcopy(self.source_data)
        current['snapshot']['mode'] = 'I'
        for invalid in ('','123', '!'*22):
            with self.assertRaises(ValueError):
                workflow.candidate(current, invalid)
        first, payload = workflow.candidate(current, 'A'*22)
        second, _ = workflow.candidate(current, 'B'*22)
        self.assertEqual(first['nrc'], 'A'*22)
        self.assertNotEqual(first['revision'], second['revision'])
        self.assertEqual(payload, self.payload)
        with self.assertRaises(ValueError):
            workflow.candidate(self.source_data, 'A'*22)
        forged = deepcopy(current)
        forged['snapshot']['payload_sha256'] = 'a'*64
        with self.assertRaises(ValueError):
            workflow.candidate(forged, 'A'*22)

    def test_historical_filing_cannot_be_submitted_again(self):
        self.source_data['already_filed'] = True
        with self.assertRaisesRegex(ValueError, 'ya tiene una presentación'):
            workflow.post(self.app, dict(action='validate',period='4T'))
        self.assertEqual(self.client.submit_calls, 0)

    def test_final_confirmation_and_period_gate_prevent_network_submission(self):
        active, identifier = self.prepare()
        correct = active.confirmation(identifier)|{'confirmed':True}
        with patch.object(workflow, 'period_has_ended', return_value=False):
            with self.assertRaisesRegex(ValueError, 'todavía no ha terminado'):
                workflow.post(self.app, dict(action='submit',period='4T',operation_id=identifier,confirmation=correct))
        with patch.object(workflow, 'period_has_ended', return_value=True):
            with self.assertRaisesRegex(ValueError, 'Confirma expresamente'):
                workflow.post(self.app, dict(action='submit',period='4T',operation_id=identifier,
                    confirmation=correct|{'payload_sha256':'f'*64}))
        self.assertEqual(self.client.submit_calls, 0)

    def test_certificate_error_fails_before_network_actions(self):
        active, identifier = self.prepare()
        for action in ('submit', 'recover'):
            with (self.subTest(action=action), patch.object(workflow, 'client', side_effect=ValueError('Certificado cambiado')),
                    patch.object(workflow, 'archive') as archive):
                with self.assertRaisesRegex(ValueError, 'Certificado cambiado'):
                    workflow.post(self.app, dict(action=action,period='4T',operation_id=identifier,
                        confirmation=active.confirmation(identifier)|{'confirmed':True}))
                archive.assert_not_called()
        self.assertEqual(self.client.submit_calls, 0)

    def test_local_archive_retry_does_not_require_certificate(self):
        entry = self.filed()
        with patch.object(workflow, 'client', side_effect=ValueError('Certificado cambiado')) as certificate:
            result = workflow.post(self.app, dict(action='archive',period='4T',operation_id=entry['id']))
        certificate.assert_not_called()
        self.assertIn('Archivado', result['message'])
        self.assertTrue((self.app.state/'aeat'/entry['id']/'archive.json').is_file())

    def test_archive_only_production_filed_and_is_idempotent_in_book(self):
        entry = self.filed()
        before = self.ledger.read_bytes()
        self.assertFalse(workflow.archive(self.app, entry|{'state':'receipt_pending'}))
        self.assertFalse(workflow.archive(self.app, entry|{'environment':'test'}))
        self.assertEqual(self.ledger.read_bytes(), before)
        self.assertTrue(workflow.archive(self.app, entry))
        first = self.ledger.read_bytes()
        self.assertTrue(workflow.archive(self.app, entry))
        self.assertEqual(first, self.ledger.read_bytes())
        book = json.loads(first)
        self.assertEqual(book['references']['1T'], {'71':'12.34'})
        self.assertEqual(book['references']['4T'], self.boxes)
        self.assertEqual(len(book['documents']), 1)
        self.assertEqual(len(list((self.base/'backups').glob('datos-*.json'))), 1)
        updates = [call for call in self.calls if call['action']=='post']
        self.assertEqual(len(updates), 1)
        archive_root = self.root/'REVISIONES/2026/PRESENTACIONES/303/4T'/entry['id']
        self.assertEqual((archive_root/'modelo.txt').read_bytes(), self.payload)
        self.assertEqual((archive_root/'justificante.pdf').read_bytes(), workflow.receipt(self.app,entry['id']))

    def test_corrupted_official_response_never_updates_book(self):
        entry = self.filed()
        before = self.ledger.read_bytes()
        Path(entry['evidence']['raw_response_path']).write_bytes(b'changed response')
        with self.assertRaises(ValueError):
            workflow.archive(self.app, entry)
        self.assertEqual(self.ledger.read_bytes(), before)
        self.assertFalse(any(call['action']=='post' for call in self.calls))

    def test_update_failure_can_resume_archive_without_duplicate_evidence(self):
        entry = self.filed()
        original_remote = self.app.remote
        failed = [False]
        def fail_one_update(config, request):
            if request['action']=='post' and not failed[0]:
                failed[0] = True
                raise ValueError('Connection unavailable')
            return original_remote(config,request)
        self.app.remote = fail_one_update
        with self.assertRaisesRegex(ValueError, 'Connection unavailable'):
            workflow.archive(self.app, entry)
        after_local_archive = self.ledger.read_bytes()
        self.assertFalse((self.state/'aeat'/entry['id']/'archive.json').exists())
        self.assertTrue(workflow.archive(self.app, entry))
        self.assertEqual(self.ledger.read_bytes(), after_local_archive)
        self.assertEqual(len(json.loads(after_local_archive)['documents']), 1)
        self.assertEqual(len(list((self.base/'backups').glob('datos-*.json'))), 1)
        self.assertEqual(self.client.submit_calls, 1)

    def test_corrupted_submitted_payload_never_updates_book(self):
        entry = self.filed()
        before = self.ledger.read_bytes()
        (self.state/'aeat'/entry['id']/'payload.txt').write_bytes(b'changed model')
        with self.assertRaises(ValueError):
            workflow.archive(self.app, entry)
        self.assertEqual(self.ledger.read_bytes(), before)
        self.assertFalse(any(call['action']=='post' for call in self.calls))


if __name__ == '__main__':
    unittest.main()

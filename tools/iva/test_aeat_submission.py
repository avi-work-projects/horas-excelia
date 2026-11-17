"""Fake-client tests for durable filing state; never contact Hacienda."""
import hashlib
from pathlib import Path
import tempfile
import threading
import unittest

from aeat_submission import SubmissionStore, valid_receipt


CSV = 'ABCDEFGH12345678'


def receipt_pdf(text=CSV):
    """Small valid PDF with extractable receipt text and a real xref table."""
    stream = ('BT /F1 12 Tf 30 100 Td ('+text+') Tj ET').encode('ascii')
    objects = [b'<< /Type /Catalog /Pages 2 0 R >>',
        b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream']
    raw, offsets = b'%PDF-1.4\n', [0]
    for index, content in enumerate(objects, 1):
        offsets.append(len(raw))
        raw += str(index).encode()+b' 0 obj\n'+content+b'\nendobj\n'
    xref = len(raw)
    raw += b'xref\n0 6\n0000000000 65535 f \n'
    raw += b''.join(f'{offset:010d} 00000 n \n'.encode() for offset in offsets[1:])
    return raw+b'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+str(xref).encode()+b'\n%%EOF\n'


class FakeClient:
    def __init__(self):
        self.certificate = 'a'*64
        self.environment = 'production'
        self.submit_calls = 0
        self.recover_calls = 0
        self.receipt_calls = 0
        self.behaviour = 'accepted'
        self.pdf = receipt_pdf()
        self.entered = self.release = None

    def identity(self):
        return dict(certificate_sha256=self.certificate, environment=self.environment, configured=True)

    def validate(self, snapshot, payload):
        return dict(valid=True, errors=[], warnings=[], raw_response=b'{"valid":true}')

    def submit(self, snapshot, payload, operation_id):
        self.submit_calls += 1
        if self.entered:
            self.entered.set()
            self.release.wait(3)
        if self.behaviour == 'timeout':
            raise TimeoutError('lost reply')
        if self.behaviour == 'rejected':
            return dict(outcome='rejected', errors=['Incorrecto'], raw_response=b'{"rejected":true}')
        result = {key: snapshot[key] for key in ('model', 'year', 'period', 'nif', 'presenter_nif')}
        result.update(outcome='accepted', csv=CSV, receipt_pdf=self.pdf,
                      receipt_url='https://official.invalid/receipt', raw_response=b'{"accepted":true}')
        if self.behaviour == 'wrong_identity':
            result['period'] = '1T'
        return result

    def receipt(self, url):
        self.receipt_calls += 1
        return dict(receipt_pdf=self.pdf, raw_response=self.pdf)

    def recover(self, snapshot, operation_id):
        self.recover_calls += 1
        # Even an apparently accepted lookup must not be mistaken for proof
        # that this exact uncertain request was accepted.
        return dict(outcome='accepted', matches=[dict(csv=CSV)], raw_response=b'<matches/>')


class SubmissionTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.client = FakeClient()
        self.time = [1_800_000_000.0]
        self.store = SubmissionStore(Path(self.temp.name)/'private', self.client, clock=lambda:self.time[0])
        self.payload = b'<T303020264T exact approved document>'
        self.snapshot = dict(revision='revision-a', payload_sha256=hashlib.sha256(self.payload).hexdigest(),
            model='303', year=2026, period='4T', nif='12345678Z', presenter_nif='12345678Z',
            presenter_name='Example Person', mode='U', account='Cuenta revisada',
            basis={'ledger':'b'*64,'review':'c'*64}, boxes={'71':'123.45'})

    def prepared(self):
        operation = self.store.register(self.snapshot, self.payload)
        self.store.validate(operation['id'], self.snapshot, self.payload)
        return operation['id']

    def confirm(self, identifier):
        return self.store.confirm(identifier, self.store.confirmation(identifier)|{'confirmed':True}, self.snapshot, self.payload)

    def test_unconfigured_status_works_without_submission(self):
        empty = SubmissionStore(Path(self.temp.name)/'unconfigured')
        self.assertFalse(empty.configuration()['configured'])
        self.assertEqual(empty.list(), [])

    def test_registered_exact_input_is_idempotent_and_preserves_basis(self):
        one = self.store.register(self.snapshot, self.payload)
        two = self.store.register(self.snapshot, self.payload)
        self.assertEqual(one['id'], two['id'])
        self.assertEqual(one['snapshot']['basis'], self.snapshot['basis'])
        self.assertEqual(one['snapshot']['boxes'], self.snapshot['boxes'])
        self.assertEqual(one['snapshot']['mode'], 'U')

    def test_changed_source_or_certificate_cannot_submit(self):
        identifier = self.prepared()
        with self.assertRaises(ValueError):
            self.store.confirm(identifier, self.store.confirmation(identifier)|{'confirmed':True},
                               self.snapshot|{'revision':'different'}, self.payload)
        self.client.certificate = 'd'*64
        with self.assertRaises(ValueError):
            self.confirm(identifier)
        self.assertEqual(self.client.submit_calls, 0)

    def test_validation_and_final_confirmation_are_required(self):
        identifier = self.store.register(self.snapshot, self.payload)['id']
        with self.assertRaises(ValueError):
            self.confirm(identifier)
        self.store.validate(identifier, self.snapshot, self.payload)
        with self.assertRaises(ValueError):
            self.store.confirm(identifier, self.store.confirmation(identifier)|{'confirmed':1}, self.snapshot, self.payload)
        self.time[0] += 86401
        with self.assertRaises(ValueError):
            self.confirm(identifier)
        self.assertEqual(self.client.submit_calls, 0)

    def test_filed_requires_same_csv_in_valid_pdf(self):
        self.assertTrue(valid_receipt(receipt_pdf(), CSV))
        self.assertFalse(valid_receipt(b'%PDF-1.4 invalid', CSV))
        self.assertFalse(valid_receipt(receipt_pdf('DIFFERENT'), CSV))
        identifier = self.prepared()
        operation = self.confirm(identifier)
        self.assertEqual(operation['state'], 'filed')
        self.assertEqual(operation['submit_count'], 1)
        self.assertTrue(Path(operation['evidence']['receipt_path']).is_file())
        self.assertEqual(self.confirm(identifier)['state'], 'filed')
        self.assertEqual(self.client.submit_calls, 1)

    def test_uncertain_never_resubmits_and_lookup_does_not_assume_match(self):
        self.client.behaviour = 'timeout'
        identifier = self.prepared()
        self.assertEqual(self.confirm(identifier)['state'], 'uncertain')
        self.assertEqual(self.confirm(identifier)['state'], 'uncertain')
        operation = self.store.recover(identifier)
        self.assertEqual(operation['state'], 'uncertain')
        self.assertEqual(operation['evidence']['recovery']['matches'], [{'csv':CSV}])
        self.assertEqual(self.client.submit_calls, 1)
        self.assertEqual(self.client.recover_calls, 1)

    def test_other_revision_cannot_bypass_unresolved_period_reservation(self):
        self.client.behaviour = 'timeout'
        identifier = self.prepared()
        self.confirm(identifier)
        self.snapshot = self.snapshot|{'revision':'revision-b'}
        other = self.prepared()
        with self.assertRaisesRegex(ValueError, 'Ya existe'):
            self.confirm(other)
        self.assertEqual(self.client.submit_calls, 1)

    def test_receipt_recovery_never_submits_again(self):
        self.client.pdf = b'%PDF-invalid'
        identifier = self.prepared()
        pending = self.confirm(identifier)
        self.assertEqual(pending['state'], 'receipt_pending')
        self.assertEqual(Path(pending['evidence']['receipt_candidate_path']).read_bytes(), b'%PDF-invalid')
        self.client.pdf = receipt_pdf()
        self.assertEqual(self.store.recover(identifier)['state'], 'filed')
        self.assertEqual(self.client.submit_calls, 1)
        self.assertEqual(self.client.receipt_calls, 1)

    def test_saved_response_survives_crash_before_database_acceptance(self):
        identifier = self.prepared()
        original = self.store._record_response
        def crash_after_archiving(operation_id, attempt, kind, response):
            metadata = original(operation_id, attempt, kind, response)
            if kind == 'submission':
                raise RuntimeError('simulated interruption')
            return metadata
        self.store._record_response = crash_after_archiving
        self.assertEqual(self.confirm(identifier)['state'], 'uncertain')
        self.store._record_response = original
        self.assertEqual(self.store.recover(identifier)['state'], 'filed')
        self.assertEqual(self.client.submit_calls, 1)
        self.assertEqual(self.client.recover_calls, 0)

    def test_rejection_requires_new_validation_and_releases_period(self):
        self.client.behaviour = 'rejected'
        identifier = self.prepared()
        self.assertEqual(self.confirm(identifier)['state'], 'rejected')
        with self.assertRaises(ValueError):
            self.confirm(identifier)
        self.snapshot = self.snapshot|{'revision':'corrected-revision'}
        corrected = self.prepared()
        self.client.behaviour = 'accepted'
        self.assertEqual(self.confirm(corrected)['state'], 'filed')
        self.assertEqual(self.client.submit_calls, 2)

    def test_wrong_fiscal_identity_is_uncertain(self):
        self.client.behaviour = 'wrong_identity'
        identifier = self.prepared()
        self.assertEqual(self.confirm(identifier)['state'], 'uncertain')

    def test_test_environment_never_becomes_filed(self):
        self.client.environment = 'test'
        identifier = self.prepared()
        result = self.confirm(identifier)
        self.assertTrue(result['simulation'])
        self.assertEqual(result['state'], 'accepted')

    def test_concurrent_confirmations_reserve_before_network(self):
        identifier = self.prepared()
        self.client.entered, self.client.release = threading.Event(), threading.Event()
        results = []
        worker = threading.Thread(target=lambda:results.append(self.confirm(identifier)))
        worker.start()
        self.assertTrue(self.client.entered.wait(2))
        self.assertEqual(self.confirm(identifier)['state'], 'submitting')
        self.client.release.set()
        worker.join(3)
        self.assertFalse(worker.is_alive())
        self.assertEqual(results[0]['state'], 'filed')
        self.assertEqual(self.client.submit_calls, 1)

    def test_nrc_and_confined_original_preflight(self):
        self.snapshot = self.snapshot|{'mode':'I'}
        identifier = self.prepared()
        with self.assertRaisesRegex(ValueError, 'NRC'):
            self.confirm(identifier)
        self.snapshot = self.snapshot|{'mode':'U'}
        other = self.prepared()
        (self.store.root/other/'payload.txt').write_bytes(b'changed')
        with self.assertRaises(ValueError):
            self.confirm(other)
        with self.assertRaises(ValueError):
            self.store._path('../outside', 'payload.txt')
        self.assertEqual(self.client.submit_calls, 0)


if __name__ == '__main__':
    unittest.main()

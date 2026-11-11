"""A successful evidence write requests work; reads and duplicates do not."""
import base64
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from pypdf import PdfWriter
from rehearse_fourth import build_case
import period_workflow as periods
import model_events


class EvidenceEventsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        base = Path(self.tmp.name)
        archive = base / 'archive'
        build_case(archive)
        self.runtime = base / 'runtime'
        self.runtime.mkdir()
        (self.runtime / 'config.json').write_text(json.dumps(dict(
            archive_root=str(archive), ledger='libro_ficticio.json', year=2026)))
        pdf = PdfWriter()
        pdf.add_blank_page(width=100, height=100)
        out = io.BytesIO()
        pdf.write(out)
        self.form = dict(kind='validation', confirmed=True, note='Synthetic validation',
                         model_hash='a'*64, pdf=base64.b64encode(out.getvalue()).decode())

    def test_success_requests_once_and_duplicate_or_invalid_do_not(self):
        with patch.object(model_events, 'request', wraps=model_events.request) as enqueue:
            with self.assertRaises(ValueError):
                periods.evidence(self.runtime, '4T', self.form | {'confirmed':False}, 'owner')
            enqueue.assert_not_called()
            periods.evidence(self.runtime, '4T', self.form, 'owner')
            enqueue.assert_called_once_with(self.runtime, 'evidence', 'owner')
            self.assertEqual(model_events.status(self.runtime)['state'], 'queued')
            periods.evidence(self.runtime, '4T', self.form, 'owner')
            enqueue.assert_called_once()
        with periods.connect(self.runtime) as db:
            self.assertEqual(db.execute('SELECT count(*) FROM evidence').fetchone()[0], 1)

    def test_queue_failure_does_not_hide_saved_proof(self):
        with patch.object(model_events, 'request', side_effect=OSError('Unavailable')):
            response = periods.post(self.runtime, '/modelos/preparacion',
                                    self.form | {'period':'4T', 'action':'evidence'}, 'owner')
        self.assertIn('Justificante guardado', response['message'])
        self.assertIn('Actualizar datos', response['message'])
        with periods.connect(self.runtime) as db:
            self.assertEqual(db.execute('SELECT count(*) FROM evidence').fetchone()[0], 1)


if __name__ == '__main__':
    unittest.main()

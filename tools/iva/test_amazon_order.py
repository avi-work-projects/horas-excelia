"""Order intake recovery tests with fictional documents and no network calls."""
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import amazon_inbox as inbox
import amazon_order as order
from expense_workflow import ExpenseStore
from model_events import process_lock
from test_amazon_inbox import pdf


class AmazonOrderTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.archive = self.root/'archive'
        self.runtime = self.root/'runtime'
        self.runtime.mkdir()
        self.config = self.runtime/'config.json'
        self.config.write_text(json.dumps({'archive_root':str(self.archive)}), encoding='utf-8')
        self.reference = '123-1234567-1234567'
        self.record = self.archive/'ENTRADA'/'AMAZON'/'pedidos'/self.reference/'pendiente_factura.json'
        self.record.parent.mkdir(parents=True)
        self.record.write_text(json.dumps(dict(schema_version=1, kind='order_pending_invoice',
            provider='amazon', order_reference=self.reference, purchase_status='confirmed')),
            encoding='utf-8')
        self.record_before = self.record.read_bytes()
        self.pdf = self.root/'invoice.pdf'
        self.pdf.write_bytes(pdf('fictional invoice'))
        self.queue = self.root/'remote'/'expenses'
        self.queue.mkdir(parents=True)
        self.calls = []
        self.state_path = self.runtime/'amazon-order-receipts'/(self.reference+'.json')

    def sender(self, manifest_path, config):
        self.calls.append(str(manifest_path))
        return inbox.enqueue(manifest_path, self.queue)

    def run_import(self, **kwargs):
        return order.import_invoice(self.config, self.record, self.pdf, 'invoice', sender=self.sender, **kwargs)

    def resume(self, **kwargs):
        return order.import_invoice(self.config, self.record, resume=True, sender=kwargs.get('sender',self.sender))

    def test_status_is_read_only_and_offline_before_and_after_import(self):
        before = {str(p.relative_to(self.root)):p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        with patch.object(order, 'send', side_effect=AssertionError('no network')):
            result = order.status(self.config, self.record)
        after = {str(p.relative_to(self.root)):p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertEqual(result['status'],'pending_invoice')
        self.assertEqual(before,after)
        imported = self.run_import()
        self.pdf.unlink()  # A status query never needs the original download.
        with patch.object(order,'send',side_effect=AssertionError('no network')):
            self.assertEqual(order.status(self.config,self.record),imported)

    def test_same_pdf_and_resume_reuse_local_receipt_without_a_second_send(self):
        first = self.run_import()
        state_before = self.state_path.read_bytes()
        self.assertEqual(self.run_import(),first)
        self.assertEqual(self.resume(),first)
        self.assertEqual(len(self.calls),1)
        self.assertEqual(self.state_path.read_bytes(),state_before)
        self.assertEqual(self.record.read_bytes(),self.record_before)
        drafts = ExpenseStore(self.queue).list()
        self.assertEqual(len(drafts),1)
        self.assertEqual(drafts[0]['state'],'draft')
        self.assertFalse(drafts[0]['fields']['include'])
        self.assertIsNone(drafts[0]['approval'])
        self.assertEqual(first['draft_id'],drafts[0]['id'])
        self.assertFalse(list(self.root.rglob('model-events.sqlite')))

    def test_recovery_after_remote_success_before_local_receipt_write(self):
        original_atomic = order._atomic

        def fail_after_send(path, state):
            if state['phase']=='confirmed':
                raise OSError('simulated power loss after remote receipt')
            original_atomic(path,state)

        with patch.object(order,'_atomic',side_effect=fail_after_send):
            with self.assertRaises(OSError):
                self.run_import()
        first_draft = ExpenseStore(self.queue).list()[0]
        self.assertEqual(order.status(self.config,self.record)['status'],'prepared')
        self.pdf.unlink()
        recovered = self.resume()
        self.assertEqual(len(self.calls),2)
        self.assertEqual(recovered['draft_id'],first_draft['id'])
        self.assertEqual(ExpenseStore(self.queue).list(),[first_draft])
        self.assertEqual(self.calls[0],self.calls[1])

    def test_send_failure_keeps_prepared_and_explicit_resume_recovers(self):
        with self.assertRaises(RuntimeError):
            order.import_invoice(self.config,self.record,self.pdf,'invoice',
                sender=lambda *args: (_ for _ in ()).throw(RuntimeError('offline')))
        prepared = order.status(self.config,self.record)
        self.assertEqual(prepared['status'],'prepared')
        self.assertEqual(ExpenseStore(self.queue).list(),[])
        recovered = self.resume()
        self.assertEqual(prepared['manifest'],recovered['manifest'])
        self.assertEqual(recovered['status'],'created')

    def test_different_pdf_is_blocked_without_replacing_the_existing_invoice(self):
        self.run_import()
        state_before = self.state_path.read_bytes()
        originals_before = sorted((self.archive/'ENTRADA'/'AMAZON'/'objects').iterdir())
        self.pdf.write_bytes(pdf('different fictional invoice'))
        with self.assertRaisesRegex(ValueError,'otro PDF'):
            self.run_import()
        self.assertEqual(self.state_path.read_bytes(),state_before)
        self.assertEqual(sorted((self.archive/'ENTRADA'/'AMAZON'/'objects').iterdir()),originals_before)
        self.assertEqual(len(self.calls),1)

    def test_remote_error_or_mismatched_receipt_never_marks_confirmed_and_cli_fails(self):
        def bad_sender(path, config):
            manifest = inbox.load_manifest(path)
            return dict(schema_version=1,batch_id=manifest['batch_id'],manifest=manifest,
                documents=[dict(sha256=inbox.digest(self.pdf.read_bytes()),source_kind='invoice',
                    order_reference=self.reference,status='error',draft_id=None)])
        output = io.StringIO()
        with patch.object(order,'send',side_effect=bad_sender), redirect_stdout(output):
            code = order.main(['--config',str(self.config),'--order',str(self.record),
                               '--input',str(self.pdf),'--source-kind','invoice'])
        self.assertEqual(code,1)
        self.assertEqual(json.loads(output.getvalue())['status'],'blocked')
        self.assertEqual(order.status(self.config,self.record)['status'],'prepared')
        def wrong_order(path, config):
            receipt=self.sender(path,config)
            receipt['documents'][0]['order_reference']='999-9999999-9999999'
            return receipt
        with self.assertRaises(ValueError):
            self.resume(sender=wrong_order)
        self.assertEqual(order.status(self.config,self.record)['status'],'prepared')

    def test_unconfirmed_order_malformed_reference_and_invalid_pdf_never_send(self):
        original = json.loads(self.record_before)
        for changed in ({'purchase_status':'pending'},{'order_reference':'../../bad'}):
            with self.subTest(changed=changed):
                self.record.write_text(json.dumps(original|changed),encoding='utf-8')
                with self.assertRaises(ValueError): self.run_import()
        self.record.write_bytes(self.record_before)
        self.pdf.write_bytes(b'%PDF-broken')
        with self.assertRaises(ValueError): self.run_import()
        self.assertEqual(self.calls,[])
        self.assertFalse(self.state_path.exists())

    def test_changed_archived_pdf_blocks_resume_and_same_order_lock_blocks_parallel_send(self):
        with self.assertRaises(RuntimeError):
            order.import_invoice(self.config,self.record,self.pdf,'invoice',
                sender=lambda *args: (_ for _ in ()).throw(RuntimeError('offline')))
        state=json.loads(self.state_path.read_bytes())
        with process_lock(self.state_path.with_suffix('.lock')):
            with self.assertRaises(RuntimeError): self.resume()
        original=self.archive/'ENTRADA'/'AMAZON'/'objects'/(state['sha256']+'.pdf')
        original.write_bytes(b'altered')
        with self.assertRaises(ValueError): self.resume()
        self.assertEqual(self.calls,[])

    def test_already_in_book_is_terminal_without_creating_a_draft(self):
        def already(path, config):
            manifest=inbox.load_manifest(path)
            return dict(schema_version=1,batch_id=manifest['batch_id'],manifest=manifest,
                documents=[dict(sha256=manifest['files'][0]['sha256'],source_kind='invoice',
                    order_reference=self.reference,status='already_in_book',draft_id=None,
                    ledger_sha256='a'*64)])
        result=order.import_invoice(self.config,self.record,self.pdf,'invoice',sender=already)
        self.assertEqual(result['status'],'already_in_book')
        self.assertIsNone(result['draft_id'])
        self.assertEqual(ExpenseStore(self.queue).list(),[])

    def test_existing_incorporated_draft_receipt_is_accepted_without_reapproval(self):
        def incorporated(path, config):
            receipt=self.sender(path,config)
            receipt['documents'][0].update(status='existing_in_queue',state='incorporated')
            return receipt
        result=order.import_invoice(self.config,self.record,self.pdf,'invoice',sender=incorporated)
        self.assertEqual(result['status'],'existing_in_queue')
        self.assertEqual(result['draft_state_at_import'],'incorporated')
        self.assertEqual(self.resume(),result)
        self.assertEqual(len(self.calls),1)

    def test_timeout_is_reported_without_command_details_or_automatic_retry(self):
        output=io.StringIO()
        with patch.object(order,'send',side_effect=subprocess.TimeoutExpired('private-command',10)) as sender:
            with redirect_stdout(output):
                code=order.main(['--config',str(self.config),'--order',str(self.record),
                    '--input',str(self.pdf),'--source-kind','invoice'])
        self.assertEqual(code,1)
        self.assertEqual(sender.call_count,1)
        self.assertNotIn('private-command',output.getvalue())
        self.assertIn('--resume',json.loads(output.getvalue())['message'])
        self.assertEqual(order.status(self.config,self.record)['status'],'prepared')


if __name__ == '__main__':
    unittest.main()

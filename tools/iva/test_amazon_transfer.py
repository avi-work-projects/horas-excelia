"""Synthetic transfer boundary tests: no SSH, browser, approval or real ledger."""
import base64
from contextlib import redirect_stderr, redirect_stdout
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tarfile
import tempfile
import unittest
from unittest.mock import patch
import zipfile

import amazon_transfer as transfer
from expense_workflow import ExpenseStore
from model_events import status
from test_expense_workflow import pdf


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def tar_bytes(entries):
    stream = io.BytesIO()
    with tarfile.open(fileobj=stream, mode='w') as archive:
        for name, raw, kind, link in entries:
            info = tarfile.TarInfo(name)
            info.type, info.linkname, info.size = kind, link, len(raw)
            archive.addfile(info, io.BytesIO(raw) if info.isfile() else None)
    return stream.getvalue()


def tar_entries(raw):
    with tarfile.open(fileobj=io.BytesIO(raw), mode='r') as archive:
        return [(info.name, archive.extractfile(info).read(), info.type, info.linkname)
                for info in archive]


class AmazonTransferTests(unittest.TestCase):
    def setUp(self):
        import amazon_inbox
        self.inbox = amazon_inbox
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.runtime = self.root/'runtime'
        self.runtime.mkdir()
        self.consultation = self.root/'consulta'
        self.consultation.mkdir()
        self.ledger_path = self.consultation/'ledger.json'
        self.ledger_raw = json.dumps(dict(year=2026, as_of='2026-11-17', records=[], documents=[],
            references={}, profiles={}, coverage={q:'Synthetic fixture' for q in ('1T','2T','3T','4T')})).encode()
        self.ledger_path.write_bytes(self.ledger_raw)
        self.index_raw = json.dumps({'ledger':{'path':'ledger.json','sha256':digest(self.ledger_raw)}}).encode()
        (self.consultation/'modelos-index.json').write_bytes(self.index_raw)
        (self.runtime/'config.json').write_text(json.dumps({'consultation_root':str(self.consultation)}),encoding='utf-8')
        self.direct = self.root/'invoice.pdf'
        self.direct.write_bytes(base64.b64decode(pdf('Synthetic direct invoice')))
        self.zip_path = self.root/'business-invoices.zip'
        self.inside_pdf = base64.b64decode(pdf('Synthetic zipped invoice'))
        with zipfile.ZipFile(self.zip_path,'w',compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr('documents/invoice-002.pdf',self.inside_pdf)
        self.output = self.root/'prepared'
        self.manifest = self.inbox.prepare([self.zip_path,self.direct],self.output)
        self.manifest_path = self.output/'manifests'/(self.manifest['batch_id']+'.json')
        stream = io.BytesIO()
        transfer.package(self.manifest_path,stream)
        self.package = stream.getvalue()
        self.entries = tar_entries(self.package)

    def assert_book_and_events_unchanged(self):
        self.assertEqual(self.ledger_path.read_bytes(),self.ledger_raw)
        self.assertEqual((self.consultation/'modelos-index.json').read_bytes(),self.index_raw)
        self.assertEqual(status(self.runtime)['requested_seq'],0)
        self.assertFalse(status(self.runtime)['pending'])

    def test_valid_zip_and_direct_pdf_package_reaches_only_draft_queue(self):
        names = {name for name,_,_,_ in self.entries}
        self.assertEqual(names,transfer.members(self.manifest))
        self.assertTrue(any(name.endswith('.zip') for name in names))
        self.assertEqual(sum(name.endswith('.pdf') for name in names),2)
        self.assertFalse((self.runtime/'expenses').exists())
        with patch('model_events.request') as event:
            receipt = transfer.receive(io.BytesIO(self.package),self.runtime)
            event.assert_not_called()
        self.assertEqual(receipt['batch_id'],self.manifest['batch_id'])
        rows = ExpenseStore(self.runtime/'expenses').list()
        self.assertEqual(len(rows),2)
        self.assertEqual({row['sha256'] for row in rows},{digest(self.direct.read_bytes()),digest(self.inside_pdf)})
        self.assertTrue(all(row['state']=='draft' and row['approval'] is None for row in rows))
        self.assertTrue(all(not row['fields'].get('include') for row in rows))
        retained = self.runtime/'amazon-inbox'/self.manifest['batch_id']
        self.assertEqual(self.inbox.load_manifest(retained/'manifests'/(self.manifest['batch_id']+'.json')),self.manifest)
        self.assert_book_and_events_unchanged()

    def test_receiving_same_batch_twice_keeps_ids_revisions_and_one_archive(self):
        (self.runtime/'expenses').mkdir()
        first = transfer.receive(io.BytesIO(self.package),self.runtime)
        before = ExpenseStore(self.runtime/'expenses').list()
        again = transfer.receive(io.BytesIO(self.package),self.runtime)
        after = ExpenseStore(self.runtime/'expenses').list()
        self.assertEqual(first['batch_id'],again['batch_id'])
        self.assertEqual({row['id']:row['revision'] for row in before},{row['id']:row['revision'] for row in after})
        folders = [path.name for path in (self.runtime/'amazon-inbox').iterdir() if path.is_dir()]
        self.assertEqual(folders,[self.manifest['batch_id']])
        self.assert_book_and_events_unchanged()

    def test_traversal_links_duplicates_extra_and_missing_members_fail_before_queue(self):
        marker = self.root/'outside.pdf'
        marker.write_bytes(b'UNCHANGED')
        pdf_name = next(name for name,_,_,_ in self.entries if name.endswith('.pdf'))
        extra_raw = base64.b64decode(pdf('Unexpected extra PDF'))
        extra_name = 'objects/'+digest(extra_raw)+'.pdf'
        extra_manifest = ('manifests/'+'0'*64+'.json',b'{}',tarfile.REGTYPE,'')
        cases = {
            'traversal':self.entries+[('../../outside.pdf',b'BAD',tarfile.REGTYPE,'')],
            'absolute':self.entries+[('/tmp/outside.pdf',b'BAD',tarfile.REGTYPE,'')],
            'symlink':self.entries+[(extra_name,b'',tarfile.SYMTYPE,'../../outside.pdf')],
            'hardlink':self.entries+[(extra_name,b'',tarfile.LNKTYPE,pdf_name)],
            'duplicate':self.entries+[self.entries[0]],
            'extra':self.entries+[(extra_name,extra_raw,tarfile.REGTYPE,'')],
            'missing_pdf':[entry for entry in self.entries if entry[0]!=pdf_name],
            'missing_manifest':[entry for entry in self.entries if not entry[0].startswith('manifests/')],
            'second_manifest':self.entries+[extra_manifest],
        }
        for label,entries in cases.items():
            with self.subTest(label=label), patch.object(self.inbox,'enqueue') as enqueue:
                with self.assertRaises((ValueError,OSError,tarfile.TarError)):
                    transfer.receive(io.BytesIO(tar_bytes(entries)),self.runtime)
                enqueue.assert_not_called()
                self.assertFalse((self.runtime/'expenses').exists())
                self.assertFalse((self.runtime/'amazon-inbox'/self.manifest['batch_id']).exists())
                self.assertEqual(marker.read_bytes(),b'UNCHANGED')
                self.assert_book_and_events_unchanged()

    def test_changed_object_sha_is_rejected_before_enqueue(self):
        for suffix in ('.pdf','.zip'):
            with self.subTest(suffix=suffix), patch.object(self.inbox,'enqueue') as enqueue:
                target = next(name for name,_,_,_ in self.entries if name.endswith(suffix))
                changed = [(name,raw+b'CHANGED' if name==target else raw,kind,link) for name,raw,kind,link in self.entries]
                with self.assertRaises((ValueError,OSError)):
                    transfer.receive(io.BytesIO(tar_bytes(changed)),self.runtime)
                enqueue.assert_not_called()
                self.assertFalse((self.runtime/'expenses').exists())
                self.assert_book_and_events_unchanged()

    def test_tampered_retained_batch_is_not_reused(self):
        transfer.receive(io.BytesIO(self.package),self.runtime)
        rows = ExpenseStore(self.runtime/'expenses').list()
        pdf_name = next(name for name,_,_,_ in self.entries if name.endswith('.pdf'))
        target = self.runtime/'amazon-inbox'/self.manifest['batch_id']/pdf_name
        target.write_bytes(target.read_bytes()+b'CHANGED')
        with patch.object(self.inbox,'enqueue') as enqueue:
            with self.assertRaises((ValueError,OSError)):
                transfer.receive(io.BytesIO(self.package),self.runtime)
            enqueue.assert_not_called()
        self.assertEqual(rows,ExpenseStore(self.runtime/'expenses').list())
        self.assert_book_and_events_unchanged()

    def test_send_streams_package_with_fake_runner_and_rejects_wrong_receipt(self):
        config={'host':'owner@example.test','ssh_key':'fixture key','remote_python':'/usr/bin/python3',
                'remote_script':'/private app/sync_models.py','remote_runtime':'/private runtime'}
        calls=[]
        def runner(command,**options):
            calls.append(command)
            self.assertEqual({entry[0] for entry in tar_entries(options['stdin'].read())},transfer.members(self.manifest))
            self.assertIn('BatchMode=yes',command)
            self.assertIn("'/private app/amazon_transfer.py'",command[-1])
            return subprocess.CompletedProcess(command,0,json.dumps({'batch_id':self.manifest['batch_id']}).encode(),b'')
        receipt=transfer.send(self.manifest_path,config,runner=runner)
        self.assertEqual(receipt['batch_id'],self.manifest['batch_id'])
        self.assertEqual(len(calls),1)
        with self.assertRaises(RuntimeError):
            transfer.send(self.manifest_path,config,runner=lambda *a,**k:subprocess.CompletedProcess(a[0],0,b'{"batch_id":"wrong"}',b''))
        self.assertFalse((self.runtime/'expenses').exists())

    def test_cli_rejects_conflicting_input_modes_without_transfer(self):
        argv=['amazon_transfer.py','--config','unused','--manifest','unused.json','--input','unused.zip']
        with patch.object(sys,'argv',argv), patch.object(transfer,'send') as send, redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as raised:transfer.main()
            self.assertEqual(raised.exception.code,2)
            send.assert_not_called()

    def test_cli_empty_preparation_returns_failure_without_transfer(self):
        config=self.root/'connection.json'
        config.write_text(json.dumps({'archive_root':str(self.root/'archive')}),encoding='utf-8')
        empty={'batch_id':'a'*64,'files':[],'errors':[{'message':'No PDF found'}]}
        argv=['amazon_transfer.py','--config',str(config),'--input','empty.zip']
        with patch.object(sys,'argv',argv), patch.object(self.inbox,'prepare',return_value=empty), patch.object(transfer,'send') as send, redirect_stdout(io.StringIO()) as output:
            self.assertEqual(transfer.main(),1)
            self.assertEqual(json.loads(output.getvalue())['state'],'no_documents')
            send.assert_not_called()


if __name__=='__main__':
    unittest.main()

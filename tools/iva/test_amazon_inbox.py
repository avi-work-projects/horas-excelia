import base64
import io
import json
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch
import zipfile

from pypdf import PdfWriter
import amazon_inbox as inbox
from expense_workflow import ExpenseStore


def pdf(tag, encrypted=False):
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    writer.add_metadata({'/Title':tag})
    if encrypted:
        writer.encrypt('synthetic-password')
    result = io.BytesIO()
    writer.write(result)
    return result.getvalue()


class AmazonInboxTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.output = self.root / 'entrada'
        self.queue = self.root / 'queue'
        self.queue.mkdir()

    def source(self, name, raw):
        path = self.root / name
        path.write_bytes(raw)
        return path

    def bundle(self, entries, name='download.zip'):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
            for entry, raw in entries:
                archive.writestr(entry, raw)
        return self.source(name, stream.getvalue())

    def manifest_path(self, manifest):
        return self.output / 'manifests' / (manifest['batch_id'] + '.json')

    def test_prepare_is_immutable_idempotent_and_keeps_all_origins_and_failures(self):
        invoice, credit = pdf('invoice'), pdf('credit')
        archive = self.bundle([('folder/factura.pdf',invoice),('abono.pdf',credit),('broken.pdf',b'%PDF-broken')])
        direct = self.source('again.pdf',invoice)
        metadata = {'schema_version':1,'documents':{inbox.digest(credit):{
            'source_kind':'credit_note','order_reference':'123-1234567-1234567'}}}
        manifest = inbox.prepare([archive,direct],self.output,metadata)
        self.assertEqual(len(manifest['files']),3)
        self.assertEqual(len({f['sha256'] for f in manifest['files']}),2)
        self.assertEqual(len(manifest['errors']),1)
        self.assertEqual({f['source_kind'] for f in manifest['files']},{'unknown','credit_note'})
        original = next(a for a in manifest['artifacts'] if a['kind']=='zip')
        self.assertEqual((self.output/original['path']).read_bytes(),archive.read_bytes())
        self.assertEqual(inbox.load_manifest(self.manifest_path(manifest)),manifest)
        self.assertEqual(inbox.prepare([archive,direct],self.output,metadata),manifest)
        self.assertFalse(any(self.queue.iterdir()))

    def test_unsafe_members_and_zip_bomb_do_not_lose_valid_pdf(self):
        link = zipfile.ZipInfo('linked.pdf')
        link.create_system = 3
        link.external_attr = (stat.S_IFLNK | 0o777) << 16
        archive = self.bundle([('ok.pdf',pdf('ok')),('../escape.pdf',pdf('bad')),
            ('C:/escape.pdf',pdf('bad2')),(link,b'outside.pdf'),('bomb.pdf',b'A'*100000)])
        manifest = inbox.prepare([archive],self.output)
        self.assertEqual([f['original_filename'] for f in manifest['files']],['ok.pdf'])
        self.assertEqual(len(manifest['errors']),4)
        self.assertIn('zip_limit',{e['code'] for e in manifest['errors']})
        self.assertFalse((self.root/'escape.pdf').exists())
        inbox.load_manifest(self.manifest_path(manifest))

    def test_encrypted_pdf_and_zip_member_are_reported_without_discarding_other_pdf(self):
        direct = self.source('encrypted.pdf',pdf('private',True))
        archive = self.bundle([('encrypted-member.pdf',pdf('member')),('ok.pdf',pdf('ok'))])
        raw = bytearray(archive.read_bytes())
        # Mark only the first member encrypted in its local and central headers.
        local = raw.index(b'PK\x03\x04')
        central = raw.index(b'PK\x01\x02')
        raw[local+6] |= 1
        raw[central+8] |= 1
        archive.write_bytes(raw)
        manifest = inbox.prepare([direct,archive],self.output)
        self.assertEqual(len(manifest['files']),1)
        self.assertEqual({e['code'] for e in manifest['errors']},{'invalid_pdf','encrypted_member'})

    def test_loader_rejects_changed_objects_and_rehashed_escape_paths(self):
        manifest = inbox.prepare([self.source('invoice.pdf',pdf('one'))],self.output)
        path = self.manifest_path(manifest)
        document = self.output/manifest['files'][0]['path']
        original = document.read_bytes()
        document.write_bytes(b'changed')
        with self.assertRaises(ValueError):
            inbox.load_manifest(path)
        document.write_bytes(original)
        changed = json.loads(json.dumps(manifest))
        changed['files'][0]['path'] = '../escape.pdf'
        changed['batch_id'] = inbox._identity(changed)
        malicious = self.manifest_path(changed)
        malicious.write_bytes(inbox.encoded(changed))
        with self.assertRaises(ValueError):
            inbox.load_manifest(malicious)

    def test_metadata_never_infers_kind_and_rejects_urls(self):
        raw = pdf('named-credit')
        source = self.source('credit_note_abono.pdf',raw)
        manifest = inbox.prepare([source],self.output)
        self.assertEqual(manifest['files'][0]['source_kind'],'unknown')
        with self.assertRaises(ValueError):
            inbox.prepare([source],self.output,{'schema_version':1,'documents':{
                inbox.digest(raw):{'source_url':'https://example.invalid/?token=private'}}})

    def test_enqueue_creates_only_drafts_and_credit_notes_stay_outside_queue(self):
        normal, credit = pdf('normal'),pdf('credit')
        archive = self.bundle([('normal.pdf',normal),('credit.pdf',credit)])
        manifest = inbox.prepare([archive],self.output,{'schema_version':1,'documents':{
            inbox.digest(credit):{'source_kind':'credit_note'}}})
        with patch.object(ExpenseStore,'approve',side_effect=AssertionError('No approval')):
            receipt = inbox.enqueue(self.manifest_path(manifest),self.queue)
            before = (self.queue/'.amazon-imports'/(manifest['batch_id']+'.json')).read_bytes()
            again = inbox.enqueue(self.manifest_path(manifest),self.queue)
        self.assertEqual(receipt,again)
        self.assertEqual(before,(self.queue/'.amazon-imports'/(manifest['batch_id']+'.json')).read_bytes())
        self.assertEqual({r['status'] for r in receipt['documents']},{'created','manual_review_credit_note'})
        drafts = ExpenseStore(self.queue).list()
        self.assertEqual(len(drafts),1)
        self.assertEqual(drafts[0]['state'],'draft')
        self.assertFalse(drafts[0]['fields']['include'])
        self.assertIsNone(drafts[0]['approval'])

    def test_lost_receipt_recovers_without_duplicate_or_editing_existing_review(self):
        manifest = inbox.prepare([self.source('normal.pdf',pdf('normal'))],self.output)
        with patch.object(inbox,'_atomic',side_effect=OSError('simulated interruption')):
            with self.assertRaises(OSError):
                inbox.enqueue(self.manifest_path(manifest),self.queue)
        first = ExpenseStore(self.queue).list()[0]
        receipt = inbox.enqueue(self.manifest_path(manifest),self.queue)
        self.assertEqual(len(ExpenseStore(self.queue).list()),1)
        self.assertEqual(first,ExpenseStore(self.queue).get(first['id']))
        self.assertEqual(receipt['documents'][0]['draft_id'],first['id'])

    def test_verified_book_dedup_and_wrong_book_hash_stop_before_queue_mutation(self):
        source = self.source('normal.pdf',pdf('normal'))
        manifest = inbox.prepare([source],self.output)
        archive = self.root/'archive'
        archive.mkdir()
        ledger = archive/'ledger.json'
        ledger.write_bytes(inbox.encoded({'records':[{'sha256':inbox.digest(source.read_bytes())}]}))
        with self.assertRaises(ValueError):
            inbox.enqueue(self.manifest_path(manifest),self.queue,archive,'ledger.json','0'*64)
        self.assertFalse(any(self.queue.iterdir()))
        receipt = inbox.enqueue(self.manifest_path(manifest),self.queue,archive,'ledger.json',inbox.digest(ledger.read_bytes()))
        self.assertEqual(receipt['documents'][0]['status'],'already_in_book')
        self.assertEqual(ExpenseStore(self.queue).list(),[])


if __name__ == '__main__':
    unittest.main()

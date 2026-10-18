"""Synthetic SQLite + importer double; never imports the production service."""
import json
import sqlite3
import tempfile
import unittest
from contextlib import contextmanager
from pathlib import Path
from types import SimpleNamespace
from gestify_bridge import handle, receiver
from prepare_candidate import patch


class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.calls = []
        self.source = dict(operationId='a'*64, contentHash='b'*64, period='2027-02', revision=1)
        self.data = dict(self.source, action='prepare', source=json.dumps(self.source))
        self.service = SimpleNamespace(ROOT=self.root, db=self.db, import_json=self.import_json, load=self.load)
        self.panel = SimpleNamespace(db=self.db)
        with self.db() as db:
            db.execute('CREATE TABLE plans(id INTEGER PRIMARY KEY,data TEXT,status TEXT,approval TEXT,detail TEXT)')
            db.execute('CREATE TABLE drafts(docid INTEGER PRIMARY KEY,snapshot TEXT,approved_hash TEXT,approved_at TEXT)')

    def tearDown(self):
        self.tmp.cleanup()

    @contextmanager
    def db(self):
        db = sqlite3.connect(self.root / 'synthetic.sqlite')
        db.row_factory = sqlite3.Row
        try:
            with db:
                yield db
        finally:
            db.close()

    def load(self):
        with self.db() as db:
            row = dict(db.execute('SELECT * FROM plans ORDER BY id DESC LIMIT 1').fetchone())
        row['data'] = json.loads(row['data'])
        return row

    def import_json(self, raw, notify_review):
        self.assertFalse(notify_review)
        self.calls.append(raw)
        p = json.loads(raw)
        with self.db() as db:
            db.execute('INSERT INTO drafts VALUES(1,?,NULL,NULL)', (raw,))
            db.execute('INSERT INTO plans VALUES(1,?,?,NULL,NULL)', (json.dumps(dict(period=p['period'], source_hash=p['contentHash'])), 'review'))

    def call(self, data=None, validator=None):
        return handle(self.service, self.panel, validator or (lambda p: json.loads(p.read_text())), data or self.data)

    def test_import_repeat_and_lost_reply(self):
        self.assertEqual(self.call()['state'], 'review')
        self.assertEqual(self.call()['state'], 'review')
        self.assertEqual(self.call(dict(self.data, action='status'))['state'], 'review')
        self.assertEqual(len(self.calls), 1)

    def test_edit_then_revert_keeps_issued_invoice_and_approval(self):
        self.call()
        with self.db() as db:
            db.execute("UPDATE plans SET status='accepted',approval='keep'")
        before = self.load()
        changed = dict(self.source, contentHash='c'*64, revision=2)
        self.assertEqual(self.call(dict(changed, action='status'))['state'], 'different')
        restored = dict(self.source, revision=3)
        self.assertEqual(self.call(dict(restored, action='status'))['state'], 'accepted')
        self.assertEqual(self.call(dict(restored, action='prepare', source=json.dumps(restored)))['state'], 'accepted')
        self.assertEqual(self.load(), before)
        self.assertEqual(len(self.calls), 1)
        # Same declared hash does not bypass the real validator.
        with self.assertRaises(ValueError):
            self.call(dict(restored, action='prepare', source=json.dumps(restored)), validator=lambda p: (_ for _ in ()).throw(ValueError('Invalid hash')))
        self.assertEqual(self.load(), before)

    def test_invalid_json_and_hash_validator(self):
        with self.assertRaises(ValueError):
            self.call(dict(self.data, source='{'))
        def invalid(_): raise ValueError('Invalid hash')
        with self.assertRaises(ValueError): self.call(validator=invalid)
        self.assertFalse(self.calls)

    def test_new_revision_invalidates_approval_without_import(self):
        self.call()
        with self.db() as db:
            db.execute("UPDATE plans SET status='approved',approval='approved-hash'")
            db.execute("UPDATE drafts SET approved_hash='approved-hash',approved_at='yesterday'")
        p = dict(self.source, contentHash='c'*64, revision=2)
        self.assertEqual(self.call(dict(p, action='prepare', source=json.dumps(p)))['state'], 'blocked')
        self.assertIsNone(self.load()['approval'])
        with self.db() as db:
            self.assertIsNone(db.execute('SELECT approved_hash FROM drafts').fetchone()[0])
        self.assertEqual(len(self.calls), 1)

    def test_revision_dispatch_and_status_remains_read_only(self):
        self.call()
        with self.db() as db:db.execute("UPDATE plans SET status='approved',approval='old'")
        changed=dict(self.source,contentHash='c'*64,revision=2)
        calls=[]
        def replace(raw):
            calls.append(raw)
            with self.db() as db:
                db.execute('UPDATE drafts SET snapshot=?,approved_hash=NULL,approved_at=NULL',(raw,))
                db.execute("UPDATE plans SET data=?,status='review',approval=NULL",(json.dumps(dict(period=changed['period'],source_hash=changed['contentHash'])),))
        self.service.replace_draft=replace
        self.assertEqual(self.call(dict(changed,action='status'))['state'],'different')
        self.assertFalse(calls)
        self.assertEqual(self.load()['approval'],'old')
        request=dict(changed,action='prepare',source=json.dumps(changed))
        self.assertEqual(self.call(request)['state'],'review')
        self.assertIsNone(self.load()['approval'])
        self.assertEqual(self.call(request)['state'],'review')
        self.assertEqual(len(calls),1)

    def test_changed_approved_draft_repeat_and_revert_cannot_restore_approval(self):
        self.call()
        with self.db() as db:
            db.execute("UPDATE plans SET status='approved',approval='old-approval'")
            db.execute("UPDATE drafts SET approved_hash='old-approval',approved_at='yesterday'")
            original_snapshot = db.execute('SELECT snapshot FROM drafts').fetchone()[0]
        original_data = self.load()['data']
        changed = dict(self.source, contentHash='c'*64, revision=2)
        # Query is read-only, including when it reveals a difference.
        self.assertEqual(self.call(dict(changed, action='status'))['state'], 'different')
        self.assertEqual(self.load()['approval'], 'old-approval')
        # Explicit preparation invalidates approval, but does not replace the invoice.
        for _ in range(2):
            self.assertEqual(self.call(dict(changed, action='prepare', source=json.dumps(changed)))['state'], 'blocked')
            self.assertIsNone(self.load()['approval'])
            self.assertEqual(self.load()['data'], original_data)
        # Undoing the edit must not silently resurrect the previously granted approval.
        restored = dict(self.source, revision=3)
        self.assertEqual(self.call(dict(restored, action='prepare', source=json.dumps(restored)))['state'], 'blocked')
        self.assertIsNone(self.load()['approval'])
        with self.db() as db:
            row = db.execute('SELECT * FROM drafts').fetchone()
            self.assertEqual(row['snapshot'], original_snapshot)
            self.assertIsNone(row['approved_hash'])
            self.assertIsNone(row['approved_at'])
            self.assertEqual(db.execute('SELECT COUNT(*) FROM drafts').fetchone()[0], 1)
        self.assertEqual(len(self.calls), 1)

    def test_issued_month_and_other_month_blocked_without_mutation(self):
        self.call()
        for state in ('accepted','sent','email_cancelled','sending','uncertain','emitting','queued'):
            with self.db() as db: db.execute('UPDATE plans SET status=?,approval=?', (state, 'keep'))
            before = self.load()
            p = dict(self.source, contentHash='c'*64, revision=2)
            with self.assertRaisesRegex(ValueError, 'emitido'):
                self.call(dict(p, action='prepare', source=json.dumps(p)))
            self.assertEqual(self.load(), before)
            self.assertEqual(self.call()['state'], state)
        self.assertEqual(len(self.calls), 1)

    def test_other_period_cannot_replace_pending_mail(self):
        self.call()
        with self.db() as db: db.execute("UPDATE plans SET status='accepted'")
        p = dict(self.source, period='2027-03', operationId='d'*64, contentHash='e'*64)
        with self.assertRaises(ValueError): self.call(dict(p, action='prepare', source=json.dumps(p)))
        self.assertEqual(len(self.calls), 1)

    def test_missing_status_no_import(self):
        self.assertEqual(self.call(dict(self.data, action='status'))['state'], 'missing')
        self.assertFalse(self.calls)

    def test_receiver_origin_and_no_secrets_in_url(self):
        html = receiver('https://example.github.io', 'synthetic-csrf')
        self.assertIn('event.source !== opener', html)
        self.assertIn('event.origin !== bridgeConfig.origin', html)
        self.assertNotIn('Access-Control-Allow-Origin', html)
        with self.assertRaises(ValueError): receiver('https://evil.test', 'x')

    def test_changed_service_refuses_candidate(self):
        with self.assertRaisesRegex(ValueError, 'ha cambiado'):
            patch('def unrelated(): pass')

    def test_approved_other_period_cannot_be_replaced(self):
        self.call()
        with self.db() as db: db.execute("UPDATE plans SET status='approved'")
        p = dict(self.source, period='2027-03', operationId='d'*64, contentHash='e'*64)
        with self.assertRaisesRegex(ValueError, 'otro mes aprobado'):
            self.call(dict(p, action='prepare', source=json.dumps(p)))
        self.assertEqual(len(self.calls), 1)


if __name__ == '__main__': unittest.main()

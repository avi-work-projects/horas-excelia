import hashlib
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from invoice_catalog import catalog, digest, archived_pdf
from invoice_dashboard import response


class DashboardTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        self.pdf=b'%PDF-1.4 synthetic draft';self.final=b'%PDF-1.4 synthetic final'
        (self.root/'archive').mkdir();(self.root/'archive/draft.pdf').write_bytes(self.pdf)
        self.p=dict(docid=1,period='2026-10',number='01-10/2026',send_date='2026-10-20',issue_date='2026-10-12',panel_hash='a'*64,draft_pdf='archive/draft.pdf',pdf_hash=hashlib.sha256(self.pdf).hexdigest(),display=dict(days=21,base=6720,vat=1411.2,withholding=1008,total=7123.2,due_date='05-11-2026'),to=['client@example.test'],subject='<script>bad</script>',body='Example')
        with closing(sqlite3.connect(self.root/'service.sqlite')) as c, c:
            c.execute('CREATE TABLE plans(id INTEGER PRIMARY KEY,data TEXT,status TEXT,approval TEXT,detail TEXT)')
            c.execute('CREATE TABLE mails(key TEXT PRIMARY KEY,state TEXT,message_id TEXT)')
            for i in (1,2):c.execute('INSERT INTO plans VALUES(?,?,?,?,NULL)',(i,json.dumps(self.p),'review' if i==1 else 'accepted','approval' if i==2 else None))
            c.execute('INSERT INTO mails VALUES(?,?,NULL)',('review:'+digest(self.p),'sent'))
        with closing(sqlite3.connect(self.root/'workflow.sqlite')) as c, c:
            c.execute('CREATE TABLE drafts(docid INTEGER,snapshot TEXT)')
            c.execute('INSERT INTO drafts VALUES(?,?)',(1,json.dumps(dict(raw_doc=dict(nombrecliente='Customer <unsafe>')))))
        with closing(sqlite3.connect(self.root/'emission-production.sqlite')) as c, c:
            c.execute('CREATE TABLE emissions(docid INTEGER,phase TEXT,result TEXT)')
            c.execute('INSERT INTO emissions VALUES(?,?,?)',(1,'accepted',json.dumps(dict(status='Correcto'))))
        folder=self.root/'archive/issued/1'/('a'*64);folder.mkdir(parents=True)
        (folder/'factura.pdf').write_bytes(self.final)
        (folder/'manifest.json').write_text(json.dumps(dict(pdf_sha256=hashlib.sha256(self.final).hexdigest())))

    def tearDown(self):self.tmp.cleanup()

    def hashes(self):return {p.relative_to(self.root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in self.root.rglob('*') if p.is_file()}

    def test_grouping_versions_review_mail_not_final(self):
        items=catalog(self.root)
        self.assertEqual(len(items),1);self.assertEqual(len(items[0]['versions']),2)
        self.assertEqual(items[0]['review_mails'],1)
        self.assertEqual(items[0]['mail'],'Programado')
        with closing(sqlite3.connect(self.root/'service.sqlite')) as c, c:c.execute('INSERT INTO mails VALUES(?,?,NULL)',('final:'+digest(self.p),'sent'))
        self.assertEqual(catalog(self.root)[0]['mail'],'Enviado')

    def test_every_read_leaves_storage_identical(self):
        before=self.hashes()
        for path in ['/facturas/','/facturas/historico','/facturas/factura/1','/facturas/documento/2/final','/facturas/documento/1/draft']:
            self.assertEqual(response(self.root,path)[0],200)
        self.assertEqual(before,self.hashes())

    def test_multimonth_filter_and_active_only(self):
        p=dict(self.p,docid=2,period='2026-11',number='01-11/2026')
        with closing(sqlite3.connect(self.root/'service.sqlite')) as c, c:c.execute('INSERT INTO plans VALUES(3,?,?,NULL,NULL)',(json.dumps(p),'review'))
        items=catalog(self.root)
        self.assertEqual(len(items),2);self.assertTrue(items[0]['active']);self.assertFalse(items[1]['active'])
        text=response(self.root,'/facturas/historico?state=draft&year=2026')[1]
        self.assertIn('01-11/2026',text);self.assertNotIn('01-10/2026',text)
        self.assertNotIn('Revisar aprobación y programación',response(self.root,'/facturas/factura/1')[1])
        self.assertIn('Revisar aprobación y programación',response(self.root,'/facturas/factura/2')[1])

    def test_escaping_missing_ids_and_no_draft_as_final(self):
        text=response(self.root,'/facturas/factura/1')[1]
        self.assertIn('&lt;script&gt;',text);self.assertNotIn('<script>bad',text)
        self.assertIn('Customer &lt;unsafe&gt;',text)
        self.assertEqual(response(self.root,'/facturas/factura/99')[0],404)
        (self.root/'archive/issued/1'/('a'*64)/'factura.pdf').write_bytes(b'bad')
        self.assertEqual(response(self.root,'/facturas/documento/2/final')[0],409)
        self.assertNotIn('Abrir PDF definitivo',response(self.root,'/facturas/factura/1')[1])

    def test_path_confinement(self):
        p=dict(self.p,draft_pdf='../outside.pdf')
        with self.assertRaises(ValueError):archived_pdf(self.root,dict(data=p),'draft')
        p=dict(self.p,panel_hash='../outside')
        with self.assertRaises(ValueError):archived_pdf(self.root,dict(data=p),'final')

    def test_empty_does_not_create_databases(self):
        with tempfile.TemporaryDirectory() as folder:
            self.assertEqual(response(Path(folder),'/facturas/')[0],200)
            self.assertEqual(list(Path(folder).iterdir()),[])


if __name__=='__main__':unittest.main()

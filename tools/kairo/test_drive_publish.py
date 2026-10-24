import hashlib
import unittest
import tempfile
from pathlib import Path
from unittest.mock import patch
from drive_publish import publish_one, publish_archive, archive_target, Drive


class FakeDrive:
    def __init__(self):self.files={};self.uploads=0;self.duplicate=False;self.corrupt=False;self.lose_reply=False
    def folder(self,path):pass
    def entries(self,parent):
        result=[dict(Name=p.split('/')[-1],IsDir=False,Size=len(b),Hashes={'md5':hashlib.md5(b).hexdigest()},ID=p) for p,b in self.files.items() if p.rsplit('/',1)[0]==parent]
        return result*2 if self.duplicate else result
    def upload(self,path,target):
        self.files.setdefault(target,path.read_bytes());self.uploads+=1
        if self.lose_reply:raise TimeoutError('Reply lost')
    def read(self,target):return b'corrupt' if self.corrupt else self.files[target]


class PublishTests(unittest.TestCase):
    target='FACTURAS/2026/A - FACTURAS INGRESOS/Factura_01-10_2026.pdf'
    def test_new_and_repeat(self):
        d=FakeDrive();a=publish_one(d,self.target,b'%PDF test');b=publish_one(d,self.target,b'%PDF test')
        self.assertEqual(a['sha256'],b['sha256']);self.assertEqual(d.uploads,1)
    def test_conflict_preserved(self):
        d=FakeDrive();d.files[self.target]=b'original'
        with self.assertRaises(ValueError):publish_one(d,self.target,b'changed')
        self.assertEqual(d.files[self.target],b'original');self.assertEqual(d.uploads,0)
    def test_duplicate_rejected(self):
        d=FakeDrive();d.files[self.target]=b'test';d.duplicate=True
        with self.assertRaises(ValueError):publish_one(d,self.target,b'test')
    def test_readback_detects_corruption(self):
        d=FakeDrive();d.corrupt=True
        with self.assertRaises(ValueError):publish_one(d,self.target,b'test')
    def test_lost_reply_no_duplicate_upload(self):
        d=FakeDrive();d.lose_reply=True
        with self.assertRaises(TimeoutError):publish_one(d,self.target,b'test')
        d.lose_reply=False;publish_one(d,self.target,b'test');self.assertEqual(d.uploads,1)
    def test_reject_path(self):
        d=FakeDrive()
        for target in ['../secrets','FACTURAS/../../secrets','another-folder/file']:
            with self.assertRaises(ValueError):publish_one(d,target,b'test')
        self.assertEqual(d.uploads,0)

    def test_year_rollover_and_late_retry(self):
        items = [dict(accepted=True, row={'data': dict(period=p, number=n)})
                 for p,n in [('2027-01','01-01/2027'),('2026-12','01-12/2026')]]
        def pdf(root, row, kind):
            n=row['data']['number'].replace('/', '_')
            return ('%PDF '+n).encode(), 'Factura_'+n+'.pdf'
        d=FakeDrive();state={'files':{}}
        with tempfile.TemporaryDirectory() as tmp, \
                patch('invoice_catalog.catalog',return_value=items), \
                patch('invoice_catalog.archived_pdf',side_effect=pdf):
            publish_archive(Path(tmp),d,state)
            publish_archive(Path(tmp),d,state)
        self.assertEqual(set(d.files), {
            'FACTURAS/2027/A - FACTURAS INGRESOS/Factura_01-01_2027.pdf',
            'FACTURAS/2026/A - FACTURAS INGRESOS/Factura_01-12_2026.pdf'})
        self.assertEqual(d.uploads,2)

    def test_inconsistent_period_refused(self):
        for period,number in [('2027-01','01-12/2026'),('2027-13','01-13/2027'),
                              ('2027/01','01-01/2027')]:
            with self.assertRaises(ValueError):
                archive_target(dict(period=period,number=number),
                               'Factura_'+number.replace('/','_')+'.pdf')
        with self.assertRaises(ValueError):
            archive_target(dict(period='2027-01',number='01-01/2027'),'other.pdf')

    def test_missing_year_directory_created_once(self):
        drive=object.__new__(Drive);drive.prefix='test:'
        folders={'': [{'Name':'FACTURAS','IsDir':True}], 'FACTURAS':[]}
        created=[]
        drive.entries=lambda p: folders[p]
        def run(action,target):
            self.assertEqual(action,'mkdir')
            p=target.removeprefix('test:');parent,name=p.rsplit('/',1)
            folders[parent].append({'Name':name,'IsDir':True});folders[p]=[]
            created.append(p)
        drive.run=run
        drive.folder('FACTURAS/2027/A - FACTURAS INGRESOS')
        drive.folder('FACTURAS/2027/A - FACTURAS INGRESOS')
        self.assertEqual(created,['FACTURAS/2027','FACTURAS/2027/A - FACTURAS INGRESOS'])

    def test_archive_notification_does_not_block_archive_on_failure(self):
        from prepare_drive_archive_candidate import patch as add_notification
        source="def archive(folder,row,pdf):\n (folder/'approved-summary.json').write_text(row['snapshot'],encoding='utf-8')\n return pdf\n"
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);scope={'ROOT':root}
            exec(add_notification(source),scope)
            self.assertEqual(scope['archive'](root,{'snapshot':'{}'},b'pdf'),b'pdf')
            self.assertTrue((root/'drive-publish-request').exists())
            with patch.object(Path,'touch',side_effect=OSError('unavailable')):
                self.assertEqual(scope['archive'](root,{'snapshot':'{}'},b'pdf'),b'pdf')
        with self.assertRaises(ValueError):add_notification('def changed(): pass')


if __name__=='__main__':unittest.main()

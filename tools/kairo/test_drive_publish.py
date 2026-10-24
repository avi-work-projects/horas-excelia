import hashlib
import unittest
from drive_publish import publish_one


class FakeDrive:
    def __init__(self):self.files={};self.uploads=0;self.duplicate=False;self.corrupt=False;self.lose_reply=False
    def folder(self,path):pass
    def entries(self,parent):
        result=[dict(Name=p.split('/')[-1],IsDir=False,Size=len(b),Hashes={'MD5':hashlib.md5(b).hexdigest()},ID=p) for p,b in self.files.items() if p.rsplit('/',1)[0]==parent]
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


if __name__=='__main__':unittest.main()

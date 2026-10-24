"""Publish immutable final PDFs to a pre-authorized Drive folder. No deletion.

Separate from emission/mail. Configuration and OAuth credentials are private.
Disabled until the cloud-to-PC probe has passed and the operator enables it.
"""
import argparse
import configparser
import hashlib
import json
import os
import re
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath


def sha(data): return hashlib.sha256(data).hexdigest()


def save(path, value):
    tmp=path.with_suffix('.tmp')
    tmp.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
    tmp.replace(path)


class Drive:
    def __init__(self, cfg):
        self.cfg=cfg
        if not re.fullmatch('[a-zA-Z0-9_-]+',cfg['remote']):raise ValueError('Invalid remote')
        path=Path(cfg['rclone_config'])
        if path.stat().st_mode & 0o077:raise ValueError('OAuth configuration must be private (0600)')
        cp=configparser.ConfigParser(interpolation=None);cp.read(path)
        remote=cp[cfg['remote']]
        if remote.get('type')!='drive' or remote.get('root_folder_id')!=cfg['folder_id']:
            raise ValueError('Remote is not restricted to the verified AUTONOMO folder')
        if not remote.get('client_id') or not remote.get('token'):
            raise ValueError('Own OAuth client and Google authorization required')
        self.prefix=cfg['remote']+':'

    def run(self, *args):
        p=subprocess.run(['/usr/bin/rclone','--config',self.cfg['rclone_config'],
            '--contimeout','15s','--timeout','60s','--retries','1','--low-level-retries','1',*args],
            capture_output=True,timeout=120)
        if p.returncode:raise RuntimeError('Drive operation failed ('+str(p.returncode)+'); no invoice/mail action was run')
        return p.stdout

    def entries(self, directory):
        return json.loads(self.run('lsjson',self.prefix+directory,'--hash'))

    def folder(self, path):
        parent=''
        for part in PurePosixPath(path).parts:
            if part in ('.','..','/') or ':' in part:raise ValueError('Invalid folder')
            hits=[x for x in self.entries(parent) if x['Name']==part]
            if len(hits)>1 or (hits and not hits[0]['IsDir']):raise ValueError('Ambiguous Drive folder')
            parent='/'.join(x for x in (parent,part) if x)
            if not hits:
                self.run('mkdir',self.prefix+parent)
                # Re-list the parent to reject duplicate names created concurrently.
                base=str(PurePosixPath(parent).parent);base='' if base=='.' else base
                found=[x for x in self.entries(base) if x['Name']==part and x['IsDir']]
                if len(found)!=1:raise ValueError('Folder creation not uniquely confirmed')

    def upload(self, local, target):
        self.run('copyto',str(local),self.prefix+target,'--ignore-existing','--immutable','--checksum')

    def read(self, target):return self.run('cat',self.prefix+target)


def publish_one(drive, target, data):
    if not 0<len(data)<=10*1024*1024:raise ValueError('Invalid archive size')
    path=PurePosixPath(target)
    if path.is_absolute() or '..' in path.parts or ':' in target:raise ValueError('Invalid path')
    if not (target.startswith('FACTURAS/') or target.startswith('REVISIONES/PRUEBAS_SINCRONIZACION/')):
        raise ValueError('Destination not allowed')
    parent=path.parent.as_posix();drive.folder(parent)
    md5=hashlib.md5(data).hexdigest()
    def existing():
        hits=[x for x in drive.entries(parent) if x['Name']==path.name]
        if len(hits)>1:raise ValueError('Duplicate filename in Drive; manual review required')
        if hits and (hits[0]['IsDir'] or hits[0].get('Size')!=len(data) or hits[0].get('Hashes',{}).get('MD5','').lower()!=md5):
            raise ValueError('Existing Drive file differs; never overwrite')
        return hits
    hits=existing()
    if not hits:
        with tempfile.TemporaryDirectory() as tmp:
            local=Path(tmp)/path.name;local.write_bytes(data);drive.upload(local,target)
        hits=existing()
    if not hits:raise ValueError('Upload not visible yet; retry without overwriting')
    if sha(drive.read(target))!=sha(data):raise ValueError('Drive download verification failed')
    return {'id':hits[0]['ID'],'sha256':sha(data),'bytes':len(data),'verified_at':datetime.now(timezone.utc).isoformat()}


def publish_archive(root, drive, state):
    from invoice_catalog import catalog,archived_pdf
    for item in catalog(root):
        if not item['accepted']:continue
        row=item['row'];p=row['data'];pdf,name=archived_pdf(root,row,'final')
        target='FACTURAS/'+p['period'][:4]+'/A - FACTURAS INGRESOS/'+name
        previous=state.get('files',{}).get(target)
        if previous:
            if previous['sha256']!=sha(pdf):raise ValueError('Verified local invoice changed')
            continue
        result=publish_one(drive,target,pdf)
        state.setdefault('files',{})[target]=result
        save(root/'drive-publish-state.json',state)


def main(root, probe):
    import fcntl
    os.umask(0o077)
    with (root/'drive-publish.lock').open('a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        cfg=json.loads((root/'drive-publish-config.json').read_text())
        if not probe and not cfg.get('enabled'):raise ValueError('Publication disabled until end-to-end verification')
        drive=Drive(cfg)
        if probe:
            name='prueba-kairo-drive-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'.txt'
            data=('Prueba Kairo -> Drive -> mini. No es una factura.\n'+name+'\n').encode()
            result=publish_one(drive,'REVISIONES/PRUEBAS_SINCRONIZACION/'+name,data)
            result['filename']=name
            save(root/'drive-probe-result.json',result)
            print(json.dumps(result));return
        state_path=root/'drive-publish-state.json'
        state=json.loads(state_path.read_text()) if state_path.exists() else {'files':{}}
        try:
            publish_archive(root,drive,state)
            state.update(ok=True,last_check=datetime.now(timezone.utc).isoformat(),error=None)
        except Exception as exc:
            state.update(ok=False,last_check=datetime.now(timezone.utc).isoformat(),error=str(exc))
            save(state_path,state);raise
        save(state_path,state)
        print('Drive archive verified:',len(state['files']),'files')


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parent);parser.add_argument('--probe',action='store_true')
    args=parser.parse_args();main(args.root,args.probe)

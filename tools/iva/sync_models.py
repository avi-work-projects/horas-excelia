"""Bridge approved expense bundles to the canonical archive and verified Drive snapshots."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import shlex
from closing import confined, digest, read

def atomic(path,data):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    fd,name=tempfile.mkstemp(dir=path.parent,prefix=path.name+'.')
    try:
        with os.fdopen(fd,'wb') as f:f.write(data)
        os.replace(name,path)
    finally:
        if os.path.exists(name):os.unlink(name)

def remote(config,request):
    cmd=[config.get('ssh','ssh'),'-i',config['ssh_key'],'-o','BatchMode=yes','-o','ConnectTimeout=10',config['host'],
         ' '.join(shlex.quote(v) for v in [config['remote_python'],config['remote_script'],'--server','--runtime',config['remote_runtime']])]
    result=subprocess.run(cmd,input=json.dumps(request).encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=600)
    if result.returncode:raise RuntimeError(result.stderr.decode(errors='replace')[-1500:])
    return json.loads(result.stdout)

def publish(runtime,manifest):
    config=read(Path(runtime)/'config.json')
    # The stable consultation root is configured independently from versioned closing roots.
    base=Path(config['consultation_root']).resolve()
    version=digest(json.dumps(manifest,sort_keys=True).encode())
    target=base/'_versions'/version;target.mkdir(parents=True,exist_ok=True)
    for item in manifest['files']:
        relative=item['path'];dest=confined(target,relative)
        if dest.exists() and digest(dest.read_bytes())==item['sha256']:continue
        # A copy already verified locally can be reused; changed files must be read from Drive.
        candidates=[confined(Path(config['archive_root']),relative),confined(base,relative)]
        src=next((p for p in candidates if p.is_file() and digest(p.read_bytes())==item['sha256']),None)
        dest.parent.mkdir(parents=True,exist_ok=True)
        if src:shutil.copyfile(src,dest)
        else:
            temp=dest.with_suffix(dest.suffix+'.incoming')
            subprocess.run(['rclone','copyto','--config',config['drive_config'],'--retries','1','--low-level-retries','1',
                            '--timeout','30s',config['drive_remote']+relative,str(temp)],check=True,timeout=65,
                           stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
            if digest(temp.read_bytes())!=item['sha256']:raise ValueError('Drive todavía no ha propagado: '+relative)
            os.replace(temp,dest)
    for item in manifest['files']:
        if digest(confined(target,item['path']).read_bytes())!=item['sha256']:raise ValueError('Copia no coincide')
    index=read(confined(target,manifest['index']))
    for item in [index['ledger'],index['report'],*index['downloads'].values()]:
        item['path']='_versions/'+version+'/'+item['path']
    # Originals are resolved relative to the version root by the panel.
    index['document_root']='_versions/'+version
    index['distribution_status']='verified'
    index['sync']={'state':'verified','at':datetime.now(timezone.utc).isoformat(),'ledger_sha256':manifest['ledger_sha256']}
    atomic(base/'modelos-index.json',json.dumps(index,ensure_ascii=False,indent=2).encode())
    config['archive_root']=str(target)
    atomic(Path(runtime)/'config.json',json.dumps(config,ensure_ascii=False,indent=2).encode())
    return {'version':version,'ledger_sha256':manifest['ledger_sha256']}

def server(runtime,request):
    from expense_workflow import ExpenseStore
    store=ExpenseStore(Path(runtime)/'expenses')
    action=request.get('action')
    if action=='outbox':return [store.bundle(row['id']) for row in store.list() if row['state']=='approved']
    if action=='publish':return publish(runtime,request['manifest'])
    if action=='ack':
        return store.mark_applied(request['id'],request['bundle_sha256'],request['ledger_sha256'])
    if action=='evidence_outbox':
        import base64
        from period_workflow import connect
        with connect(runtime) as db:rows=db.execute('SELECT id,period,data FROM evidence').fetchall()
        return [dict(id=i,period=p,data=json.loads(d),pdf=base64.b64encode((Path(runtime)/'evidence'/(json.loads(d)['sha256']+'.pdf')).read_bytes()).decode())
                for i,p,d in rows if not json.loads(d).get('archived')]
    if action=='evidence_ack':
        from period_workflow import connect
        with connect(runtime) as db:
            row=db.execute('SELECT data FROM evidence WHERE id=?',(request['id'],)).fetchone()
            if not row:raise ValueError('Evidencia ausente')
            item=json.loads(row[0]);item['archived']=request['ledger_sha256']
            db.execute('UPDATE evidence SET data=? WHERE id=?',(json.dumps(item),request['id']))
        return {'ok':True}
    if action=='status':
        atomic(Path(runtime)/'sync-status.json',json.dumps(request['status'],ensure_ascii=False).encode());return {'ok':True}
    raise ValueError('Acción no válida')

def build_manifest(root,ledger_relative,index_relative,backup_root=None):
    from expense_workflow import exclusive
    if backup_root is None:raise ValueError('Respaldo privado requerido para bloquear el libro')
    backup=Path(backup_root);backup.mkdir(parents=True,exist_ok=True)
    with exclusive(backup/(digest(str(confined(Path(root).resolve(),ledger_relative)).encode())+'.lock')):
        return _build_manifest(root,ledger_relative,index_relative,backup)

def _build_manifest(root,ledger_relative,index_relative,backup):
    from review_year import review, render
    root=Path(root);ledger=confined(root,ledger_relative);ledger_raw=ledger.read_bytes();data=json.loads(ledger_raw.decode('utf-8-sig'))
    index_path=confined(root,index_relative);index=read(index_path)
    result=review(data,root)
    report_bytes=json.dumps(result,ensure_ascii=False,indent=2).encode()
    version=digest(ledger_raw+report_bytes)
    prefix=f'REVISIONES/{data["year"]}/CONSULTA/{version}'
    snapshot=confined(root,prefix+'/libro.json')
    atomic(snapshot,ledger_raw)
    report=confined(root,prefix+'/revision.json');raw=json.dumps(result,ensure_ascii=False,indent=2).encode()
    if not report.exists() or report.read_bytes()!=raw:atomic(report,raw)
    atomic(report.with_suffix('.html'),render(result).encode())
    index['ledger']={'path':prefix+'/libro.json','sha256':digest(ledger_raw)}
    index['report']={'path':prefix+'/revision.json','sha256':digest(raw)}
    index['updated']=datetime.now().strftime('%d/%m/%Y')
    if ledger.read_bytes()!=ledger_raw:raise ValueError('El libro ha cambiado durante la actualización')
    atomic(backup/('index-'+digest(index_path.read_bytes())+'.json'),index_path.read_bytes())
    atomic(index_path,json.dumps(index,ensure_ascii=False,indent=2).encode())
    paths={ledger_relative,index_relative,index['ledger']['path'],index['report']['path'],prefix+'/revision.html'}
    paths.update(r['source'] for r in data['records'])
    paths.update(item['path'] for item in index['downloads'].values())
    # Profile/identity/payment files are configuration inputs and stay in the private replica.
    for p in (root/'LIBROS CONTABLES'/str(data['year'])).glob('*.json'):
        paths.add(p.relative_to(root).as_posix())
    paths.update(d['source'] for d in data.get('documents',[]) if 'source' in d)
    for p in (root/'MODELOS'/'MODELOS IVA').glob('*.pdf'):
        if str(data['year']) in p.name:paths.add(p.relative_to(root).as_posix())
    for p in (root/'DOCUMENTOS ALTA AUTONOMO').glob('*Situacion Censal*'):
        if p.is_file():paths.add(p.relative_to(root).as_posix())
    for p in (root/'REVISIONES'/str(data['year'])/'JUSTIFICANTES').glob('*'):
        if p.is_file() and p.suffix in ('.pdf','.json'):paths.add(p.relative_to(root).as_posix())
    files=[{'path':relative,'sha256':digest(confined(root,relative).read_bytes())} for relative in sorted(paths)]
    if ledger.read_bytes()!=ledger_raw:raise ValueError('El libro ha cambiado durante la verificación')
    return {'files':files,'index':index_relative,'ledger_sha256':digest(ledger_raw)}

def run(config):
    from expense_workflow import apply_bundle
    from income_refresh import refresh
    root=Path(config['archive_root']);ledger=confined(root,config['ledger'])
    income=refresh(root,config['ledger'],config['backup_root'])
    applied=[]
    for bundle in remote(config,{'action':'outbox'}):
        result=apply_bundle(bundle,root,config['ledger'],digest(ledger.read_bytes()),index_relative=config['index'],backup_root=config['backup_root'])
        applied.append((bundle,result))
    evidences=remote(config,{'action':'evidence_outbox'})
    for item in evidences:apply_evidence(root,config['ledger'],item,config['backup_root'])
    manifest=build_manifest(root,config['ledger'],config['index'],config['backup_root'])
    published=remote(config,{'action':'publish','manifest':manifest})
    for bundle,result in applied:
        remote(config,{'action':'ack','id':bundle['operation_id'],'bundle_sha256':bundle['bundle_sha256'],'ledger_sha256':published['ledger_sha256']})
    for item in evidences:remote(config,{'action':'evidence_ack','id':item['id'],'ledger_sha256':published['ledger_sha256']})
    status={'state':'verified','at':datetime.now(timezone.utc).isoformat(),'applied':len(applied),'ledger_sha256':published['ledger_sha256'],'income_added':len(income['added']),'warnings':income['warnings']}
    remote(config,{'action':'status','status':status})
    return status

def apply_evidence(root,ledger_relative,item,backup_root):
    from expense_workflow import exclusive
    root=Path(root).resolve();backup=Path(backup_root).resolve();path=confined(root,ledger_relative)
    if backup.is_relative_to(root):raise ValueError('El respaldo debe estar fuera de AUTONOMO')
    backup.mkdir(parents=True,exist_ok=True)
    with exclusive(backup/(digest(str(path).encode())+'.lock')):
        return _apply_evidence(root,ledger_relative,item,backup)

def _apply_evidence(root,ledger_relative,item,backup_root):
    import base64
    from ledger import calculate
    root=Path(root);path=confined(root,ledger_relative);before=path.read_bytes();data=json.loads(before.decode('utf-8-sig'))
    year,period=item['period'].split('-',1)
    if int(year)!=data['year'] or period not in ('1T','2T','3T','4T','anual'):raise ValueError('Ejercicio o periodo de evidencia incorrecto')
    record=item['data'];raw=base64.b64decode(item['pdf'],validate=True)
    if digest(raw)!=record['sha256']:raise ValueError('Justificante cambiado')
    rel=f'REVISIONES/{year}/JUSTIFICANTES/{record["kind"]}_{period}_{record["sha256"]}.pdf'
    destination=confined(root,rel)
    if destination.exists() and destination.read_bytes()!=raw:raise ValueError('Colisión de justificante')
    if record['kind'] not in ('validation','filing','payment'):raise ValueError('Tipo de justificante incorrecto')
    if record['kind']!='filing' or period=='anual':
        # Archiving validation/payment does not change the reviewed tax inputs.
        # Otherwise the model would invalidate its own approval immediately after validation.
        atomic(destination,raw)
        atomic(destination.with_suffix('.json'),json.dumps(item['data'],ensure_ascii=False,indent=2).encode())
        return
    if record['kind']=='filing' and period!='anual':
        boxes=record['boxes'];old=data.setdefault('references',{}).get(period)
        if old and old!=boxes:raise ValueError('Hay una referencia histórica distinta. Revisar sin sobrescribir.')
        data['references'][period]=boxes
        # The filed receipt records the result, not a fresh fiscal approval of all source rows.
        data.setdefault('filed_evidence',{})[period]={'source':rel,'sha256':record['sha256']}
    data.setdefault('documents',[])
    if not any(d.get('source')==rel for d in data['documents']):
        data['documents'].append({'source':rel,'sha256':record['sha256'],'status':record['provenance']})
    data['calculations']=calculate(data)
    after=json.dumps(data,ensure_ascii=False,indent=2).encode()
    if path.read_bytes()!=before:raise ValueError('Libro modificado durante el archivo del justificante')
    if after!=before:
        backup=Path(backup_root)/('datos-'+digest(before)+'.json')
        if not backup.exists():atomic(backup,before)
    atomic(destination,raw)
    if after!=before:atomic(path,after)

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--config');parser.add_argument('--server',action='store_true');parser.add_argument('--runtime')
    args=parser.parse_args()
    if args.server:
        result=server(args.runtime,json.load(sys.stdin));print(json.dumps(result));return
    config=read(args.config)
    lock=Path(args.config).with_suffix('.lock')
    # Scheduler also disallows overlapping runs; file lock protects direct invocations.
    try:fd=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY)
    except FileExistsError:raise RuntimeError('Ya hay una actualización en curso. Revisar el bloqueo si se interrumpió.')
    try:
        os.close(fd);result=run(config);print(json.dumps(result))
    except Exception as exc:
        status={'state':'pending','at':datetime.now(timezone.utc).isoformat(),'message':str(exc)[:1500]}
        try:remote(config,{'action':'status','status':status})
        except Exception:pass
        print(json.dumps(status),file=sys.stderr);raise
    finally:lock.unlink(missing_ok=True)

if __name__=='__main__':main()

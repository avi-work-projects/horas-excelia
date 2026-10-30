"""Preserve the existing independent delivery alert and track further months separately."""
import hashlib
import json
import sqlite3
from contextlib import closing


def plans(root):
    with closing(sqlite3.connect((root/'service.sqlite').as_uri()+'?mode=ro',uri=True)) as conn:
        conn.row_factory=sqlite3.Row
        records=conn.execute('SELECT * FROM plans ORDER BY id').fetchall()
        months={}
        for record in records:
            row=dict(record,data=json.loads(record['data']))
            fingerprint=hashlib.sha256(json.dumps(row['data'],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
            mail=conn.execute('SELECT state FROM mails WHERE key=?',('final:'+fingerprint,)).fetchone()
            row['mail_confirmed']=bool(mail and mail[0]=='sent')
            months[row['data']['period']]=row
    return sorted(months.values(),key=lambda r:r['data']['send_date'])


def sync(monitor,client,cfg,state,rows,moment):
    deliveries=state.setdefault('deliveries',{})
    legacy=state.get('delivery_plan')
    if legacy:
        previous=next((r for r in rows if legacy==str(r['id'])+':'+r['data']['send_date']),None)
        if previous:
            saved={k:v for k,v in state.items() if k.startswith('delivery_')}
            saved['slug']='kairo-envio'
            deliveries.setdefault(previous['data']['period'],saved)
    errors=[]
    for row in rows:
        month=row['data']['period']
        # Unapproved drafts and untouched history do not arm delivery alerts.
        if month not in deliveries and row['status'] not in {'approved','emitting','queued','accepted','sending','uncertain'}:
            continue
        delivery=deliveries.setdefault(month,{'slug':'kairo-envio-'+month})
        try:
            monitor.sync_delivery(client,cfg,delivery,row,moment)
            monitor.save('monitor-state.json',state)
        except Exception:
            errors.append(month)
    if errors:
        raise RuntimeError('Vigilancia pendiente de actualizar: '+', '.join(errors))

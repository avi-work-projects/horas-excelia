"""Loopback-only visual demo with synthetic recipients; no Outlook connection."""
import argparse
import copy
import tempfile
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer
from urllib.parse import urlsplit, parse_qs

from hours_model import content_hash, monday, schedule, scope
from hours_service import make_handler
from hours_store import Store

NOW = datetime(2027,2,1,6,tzinfo=timezone.utc)


def synthetic_request(period='2027-02', mode='month', target=None):
    weeks=[]
    for key in scope(period):
        mon=monday(key)
        days=[dict(date=(mon+timedelta(days=i)).isoformat(),type='normal',hours=9 if i<4 else 6.5) for i in range(5)]
        lines=['LMXJV'[i]+' '+(mon+timedelta(days=i)).strftime('%d/%m')+' — '+str(days[i]['hours']).replace('.',',')+' h' for i in range(5)]
        weeks.append(dict(key=key,days=days,subject='HORAS Y DIAS TRABAJADOS - Persona de prueba - Semana del '+mon.strftime('%d/%m')+' al '+(mon+timedelta(days=4)).strftime('%d/%m'),body='Buenos días!\n\nSemana del '+mon.strftime('%d/%m')+' al '+(mon+timedelta(days=4)).strftime('%d/%m')+':\n\n'+'\n'.join(lines)+'\n\nUn saludo,\nPersona de prueba'))
    return dict(schema=1,period=period,mode=mode,targetWeek=target,config=dict(to=['destino@example.invalid'],cc=['copia@example.invalid']),weeks=weeks)


def demo_reader(request):
    data=synthetic_request(request['period'])
    previous=(monday(data['weeks'][0]['key'])-timedelta(weeks=1)).isoformat()
    records=[dict(id='demo-previous',week=previous,state='sent')]
    scenario=request.get('demoScenario','mixed')
    if scenario=='previous-missing': records=[]
    elif scenario!='empty':
        for index,week in enumerate(data['weeks'][:3]):
            days=copy.deepcopy(week['days'])
            if index==2: days[1]['hours']=8
            record=dict(id='demo-'+week['key'],week=week['key'],state='sent' if index==0 else 'scheduled',days=days,toDisplay='Destino de prueba',ccDisplay='Copia de prueba',contentHash=content_hash({'days':days}),schedule=schedule(week,NOW)[0])
            records.append(record)
        if scenario=='duplicate': records.append(records[2]|{'id':'demo-duplicate','schedule':'2027-02-11T08:00:00+01:00'})
    return dict(complete=scenario!='incomplete',accountVerified=True,account='sender@example.invalid',records=records)


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--port',type=int,default=8771);parser.add_argument('--app-origin',default='http://127.0.0.1:8766');args=parser.parse_args()
    with tempfile.TemporaryDirectory(prefix='gestify-hours-demo-') as state:
        config=dict(private_origin='http://127.0.0.1:'+str(args.port),app_origin=args.app_origin,local_review=True,cache_seconds=0,sender='sender@example.invalid')
        parent=make_handler(config,Store(state),demo_reader,clock=lambda:NOW)
        class DemoHandler(parent):
            def do_GET(self):
                if self.route()=='/example' and self.allowed() and self.headers.get('Origin')==args.app_origin:
                    params=parse_qs(urlsplit(self.path).query)
                    individual=params.get('mode')==['week']
                    example=synthetic_request(mode='week' if individual else 'month',target='2027-02-22' if individual else None)
                    scenario=params.get('scenario',['mixed'])[0]
                    if scenario not in ('mixed','duplicate','previous-missing','incomplete'):return self.reply(400,{'error':'Ejemplo no válido'},cors=True)
                    example['demoScenario']=scenario
                    return self.reply(200,example,cors=True)
                return super().do_GET()
        server=ThreadingHTTPServer(('127.0.0.1',args.port),DemoHandler)
        print('Demo ficticia de horas en loopback',flush=True)
        try:server.serve_forever()
        finally:server.server_close();parent.jobs.close()

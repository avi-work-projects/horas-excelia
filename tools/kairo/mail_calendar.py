"""Monthly view of Kairo's confirmed weekly facts and Gestify's civil calendar."""
import json
from datetime import date, datetime, timedelta
from hours_model import scope


def validated_days(period, days):
    scope(period)
    if not isinstance(days,list) or len(days)>31:
        raise ValueError('Calendario de días no válido')
    dates={}
    for item in days:
        if not isinstance(item,dict):raise ValueError('Día no válido')
        key=item.get('date','')
        if not isinstance(key,str) or date.fromisoformat(key).isoformat()!=key or key[:7]!=period or key in dates or item.get('type') not in ('vacaciones','festivo','ausencia'):
            raise ValueError('Día no válido')
        dates[key]=item['type']
    return json.dumps(dates,sort_keys=True)


def save_calendars(store, months):
    values=[(month,validated_days(month,days)) for month,days in months.items()]
    with store.db() as db:
        db.executemany('INSERT INTO calendar_days VALUES(?,?) ON CONFLICT(period) DO UPDATE SET days=excluded.days WHERE days!=excluded.days',values)


def remember_review_days(store,request):
    days=request.get('calendarDays')
    if days is None:return
    if not isinstance(days,list):raise ValueError('Calendario no válido')
    keys=scope(request['period'])
    first=date.fromisoformat(keys[0]).replace(day=1)
    last=date.fromisoformat(keys[-1])+timedelta(days=6)
    months={}
    while first<=last:
        months[first.strftime('%Y-%m')]=[]
        first=(first.replace(day=28)+timedelta(days=4)).replace(day=1)
    for item in days:
        month=str(item.get('date',''))[:7] if isinstance(item,dict) else ''
        if month not in months:raise ValueError('Día fuera del calendario')
        months[month].append(item)
    save_calendars(store,months)


def calendar_data(store, sender, period):
    keys=scope(period)[:-2]
    observed={}
    with store.db() as db:
        for saved in db.execute('SELECT payload FROM status_facts WHERE account=?',(sender,)):
            fact=json.loads(saved['payload'])
            if not fact.get('verified'):continue
            stamp=datetime.fromisoformat(fact['checkedAt']).timestamp()
            for row in fact['rows']:
                if row['key'] in keys and (row['key'] not in observed or stamp>observed[row['key']][0]):
                    observed[row['key']]=(stamp,row,fact['checkedAt'])
        stored=db.execute('SELECT days FROM calendar_days WHERE period=?',(period,)).fetchone()
        preparation=None
        if not stored:
            preparation=db.execute("""SELECT json_extract(payload,'$.calendarDays') FROM plans
                WHERE json_type(payload,'$.calendarDays')='array'
                AND substr(json_extract(payload,'$.weeks[0].key'),1,7)<=?
                AND substr(date(json_extract(payload,'$.weeks[#-1].key'),'+6 days'),1,7)>=?
                ORDER BY rowid DESC LIMIT 1""",(period,period)).fetchone()
    dates={}
    ledger=store.ledger()
    rows=[]
    for key in keys:
        _,fact,checked=observed.get(key,(0,{},None))
        journal=ledger.get(key,{})
        state=fact.get('state','unverified')
        when=fact.get('schedule')
        if state!='sent' and journal.get('state') in ('reserved','uncertain'):
            state,when='uncertain',None
        elif not fact and journal.get('state')=='scheduled':
            state,when='scheduled',journal.get('schedule')
        for day in fact.get('days') or []:
            if day.get('type') in ('vacaciones','festivo','ausencia'):
                dates[day['date']]=day['type']
        rows.append(dict(key=key,state=state,schedule=when if state=='scheduled' else None,checkedAt=checked))
    if preparation:
        dates={d['date']:d['type'] for d in json.loads(preparation[0]) if isinstance(d,dict)
               and str(d.get('date',''))[:7]==period and d.get('type') in ('vacaciones','festivo','ausencia')}
    if stored:dates=json.loads(stored[0])
    return dict(period=period,rows=rows,days=dates,daysSynced=bool(stored or preparation))

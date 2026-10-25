const assert=require('node:assert/strict');
const {cargarApp}=require('./entorno');
const a=cargarApp({'excelia-event-appearance-v1':JSON.stringify({border:2.4,cross:4,ink:2.5,halo:.4})});
assert.equal(a.EV_APPEARANCE.border,1.3);
assert.equal(a.EV_APPEARANCE.cross,4);
assert.equal(a.document.documentElement.style.getPropertyValue('--ev-symbol-border-scale'),'0.65');
a.setEventAppearance({border:.5,cross:5,ink:3,halo:.6});
assert.equal(a.loadEventAppearance().border,1.3);
const week=Array.from({length:7},(_,i)=>new Date(2026,7,17+i)),today=new Date(2026,7,21);
assert.equal(a._evBarPast({cs:0,ce:6},week,today).style,';--ev-bar-past:57.1429%');
assert.equal(a._evBarPast({cs:0,ce:3},week,today).cls,' past-bar');
assert.equal(a._evBarPast({cs:4,ce:6},week,today).cls,'');
assert.equal(a._evBarPast({cs:0,ce:6,halfL:true,halfR:true},week,today).style,';--ev-bar-past:58.3333%');
assert.equal(a._evBarPast({cs:0,ce:3},week,today,false).cls,'');
assert.equal(a._evBarPast({cs:0,ce:6},week,today,false).style,'');
assert.equal(a._evBarPast({cs:0,ce:6},week,today,true).cls,' ev-part-past');

// Calendario mensual: las horas de transporte mandan sobre la hora general.
for(const type of ['Viaje','Asturias','Casa Rural','Otros']){
 for(const [start,end,left,right] of [['00:00','00:00',false,true],['12:59','12:59',false,true],['13:00','13:00',true,false],['15:00','10:00',true,true],[null,null,false,false]]){
  const ev={id:'hours',kind:'grande',type,start:'2026-08-24',end:'2026-08-28',viaje:{ida:{time:start},vuelta:{time:end}}};
  const row={ev,cs:0,ce:4,starts:true,ends:true,row:0};a._evMarcarMitades([row],true);
  assert.equal(row.halfL,left,type+' ida '+start);assert.equal(row.halfR,right,type+' vuelta '+end);
  const middle={...row,starts:false,ends:false};a._evMarcarMitades([middle],true);assert.equal(middle.halfL,false);assert.equal(middle.halfR,false);
 }
}
const timed={id:'hours',kind:'grande',type:'Viaje',title:'Viaje ficticio',color:'#5b7db5',start:'2026-08-24',end:'2026-08-28',time:'09:00',endTime:'19:00',viaje:{ida:{time:'15:00'},vuelta:{time:'10:00'}}};
assert.equal(a.evBarTravelTimes(timed).start,'15:00');assert.equal(a.evBarTravelTimes(timed).end,'10:00');
assert.equal(a.evBarTravelTimes({...timed,viaje:{ida:{time:null,modo:'tren'}}}).start,'09:00');
const oneDay={ev:{...timed,end:timed.start},cs:0,ce:0,starts:true,ends:true,row:0};a._evMarcarMitades([oneDay],true);
assert.equal(oneDay.halfL,true);assert.equal(oneDay.halfR,false);
const original={ev:timed,cs:0,ce:4,starts:true,ends:true,row:0};a._evMarcarMitades([original]);assert.equal(original.halfL,false);assert.equal(original.halfR,false);

a.EVENTS=[timed];a.EV_YEAR=2026;a.EV_MONTH=7;a.EV_QUAD_YEAR=2026;a.EV_QUAD_MONTH=7;
const untouched=JSON.stringify(a.EVENTS),monthly=a.renderEvCalMonth();
assert.match(monthly,/margin-left:calc\(50% \/ 5\)/);assert.match(monthly,/margin-right:calc\(50% \/ 5\)/);
assert.equal(JSON.stringify(a.EVENTS),untouched);
for(const render of ['renderEvQuad','renderEvAnnual'])assert.doesNotMatch(a[render](),/margin-(left|right):calc\(50% \/ 5\)/);
a.EVENTS=[timed,{...timed,id:'overlap',start:'2026-08-26',end:'2026-08-27',viaje:null,time:null,endTime:null}];
const stepped=a.renderEvCalMonth();assert.match(stepped,/ev-stepped-bar/);assert.doesNotMatch(stepped,/NaN|Infinity/);assert.match(stepped,/margin-right:calc\(50% \/ 5\)/);
// El corte de semana y mes no repite el recorte en los tramos interiores.
a.EVENTS=[{...timed,start:'2026-08-30',end:'2026-09-02'}];
const split=a.renderEvCalMonth();assert.equal((split.match(/margin-left:calc\(50% \/ /g)||[]).length,1);assert.equal((split.match(/margin-right:calc\(50% \/ /g)||[]).length,1);
a.EVENTS=[{id:'test-trip',kind:'grande',type:'Viaje',title:'Viaje en curso',start:'2026-08-19',end:'2026-08-24',color:'#38bdf8'}];
a.EV_YEAR=2026;a.EV_MONTH=7;a.EV_QUAD_YEAR=2026;a.EV_QUAD_MONTH=7;
for(const render of ['renderEvCalMonth','renderEvQuad','renderEvAnnual'])assert.match(a[render](),/ev-part-past[^>]+data-id="test-trip"/);
console.log('Apariencia: ribete definitivo, backups previos y viajes en curso en los tres calendarios OK');

a.BDAYS=[{name:'Ana',day:21,month:8,vip:true}];
const birthday=a.renderEvDetail({id:'ev-bday-vip-21-8-ana',title:'⭐ Cumple Ana',note:'Cumpleaños VIP',start:'2026-08-21',end:'2026-08-21',color:'#fbbf24',repeat:{type:'yearly'}},false,{ds:'2027-08-21',i:0,n:1});
assert.match(birthday,/id="evDTitle">Ana<\/div>/);
assert.equal((birthday.match(/src="VIP.png"/g)||[]).length,1);
assert.doesNotMatch(birthday,/⭐|Cumpleaños VIP|Anual/);
assert.match(birthday,/21 de agosto/);
assert.match(birthday,/id="evDBdayAlarm"/);

assert.equal(a.getEvType({type:'Pago hacienda'}),'Pago Hacienda');
assert.match(a.evManagementShapeInner('tax'),/#647db1/);
assert.ok(a.evManagementShapeInner('tax').includes(a.evPaymentCoinsSvg()));
assert.ok(a.evManagementShapeInner('payment').includes(a.evPaymentCoinsSvg()));

// Clasificación múltiple: OR, catálogo ampliado y persistencia sin perder VIP.
a.BDAYS=[{name:'Ana',day:1,month:10,vip:true},{name:'Luis',day:2,month:10}];
a.bdaySaveGroupDraft([['Amigos Oviedo','Familia'],['Grupo nuevo']]);
assert.equal(a.BDAYS[0].vip,true);
assert.ok(a.bdayGroupCatalog().includes('Grupo Nuevo'));
a.BDAY_GROUP_FILTER=['Familia','Grupo Nuevo'];assert.ok(a.BDAYS.every(b=>a.bdayGroupMatch(b)));
a.BDAY_GROUP_FILTER=['Amigos Oviedo'];assert.equal(a.bdayGroupMatch(a.BDAYS[1]),false);
assert.doesNotThrow(()=>a.validateImport({birthdays:JSON.parse(a.appStorage.getItem(a.BDAY_STORAGE_KEY))}));
assert.throws(()=>a.validateImport({birthdays:[{name:'Ana',day:1,month:10,categories:[9]}]}));
const savedPeople=JSON.stringify(a.BDAYS),setGroups=a.appStorage.setItem;
a.appStorage.setItem=()=>{throw Error('sin espacio');};
assert.throws(()=>a.bdaySaveGroupDraft([[],[]]));assert.equal(JSON.stringify(a.BDAYS),savedPeople);a.appStorage.setItem=setGroups;

assert.equal(a.bdayCanSetAlarm({day:21,month:8}),true);
assert.equal(a.bdayCanSetAlarm({day:4,month:9}),true);
assert.equal(a.bdayCanSetAlarm({day:5,month:9}),false);
assert.equal(a.bdayCanSetAlarm({day:20,month:8}),false);
assert.equal(a.bdayCanSetAlarm(null),false);
assert.doesNotMatch(a.renderBdayDetail({name:'Lejano',day:5,month:9}),/id="bdDAlarm"/);

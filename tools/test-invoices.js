const assert=require('node:assert/strict');
const {cargarApp}=require('./entorno');
const g=cargarApp(),cfg=g.invoiceDefaults();
{
  const local=cargarApp(),config=local.invoiceDefaults();config.rate='320';
  const preparation=local.invoiceCalculate('2026-10',config,local.invoiceDayRows('2026-10',config));
  const saved={config,months:{'2026-10':{preparation}}},original=JSON.stringify(saved);
  assert.equal(local.invoiceHasLocalChanges('2026-10',saved),false);
  local.ST['2026-10-08']={type:'vacaciones'};assert.equal(local.invoiceHasLocalChanges('2026-10',saved),true);
  local.ST={};local.MONTH_H['2026-10']=7;assert.equal(local.invoiceHasLocalChanges('2026-10',saved),true);
  assert.equal(JSON.stringify(saved),original,'La comparación no guarda ni altera la factura');
}
cfg.rate='320';
let rows=g.invoiceDayRows('2026-09',cfg);rows.forEach(r=>r.selected=!r.weekend);let p=g.invoiceCalculate('2026-09',cfg,rows);
assert.equal(p.days.length,22);assert.equal(p.baseCents,704000);assert.equal(p.vatCents,147840);assert.equal(p.withholdingCents,105600);assert.equal(p.totalCents,746240);
assert.throws(()=>g.invoiceCalculate('2026-09',cfg,[rows[0],rows[0]]),/duplicada/);
assert.throws(()=>g.invoiceDecimal('1.005',2),/decimales/);assert.equal(g.invoiceDecimal('12,34',2),1234);
rows=[{date:'2026-10-01',selected:true,rate:'0.01',unit:'day',hours:8},{date:'2026-10-02',selected:true,rate:'0.02',unit:'day',hours:6.5}];
p=g.invoiceCalculate('2026-10',cfg,rows);assert.equal(p.baseCents,3);assert.equal(p.lines.length,2);
rows[0].rate='12.35';rows[0].unit='hour';rows[0].hours='6.5';rows[1].selected=false;p=g.invoiceCalculate('2026-10',cfg,rows);assert.equal(p.baseCents,8028);
g.ECON_YEAR_CONFIG[2026]={rate:320,multiRate:true,ratePeriods:[{startDate:'2026-10-16',rate:340,rateMode:'daily'},{startDate:'2026-01-01',rate:320,rateMode:'daily'}]};cfg.rate='';rows=g.invoiceDayRows('2026-10',cfg);assert.equal(rows.find(r=>r.date==='2026-10-15').rate,'320');assert.equal(rows.find(r=>r.date==='2026-10-16').rate,'340');
g.ST['2026-10-02']={type:'ausencia'};assert.equal(g.invoiceDayRows('2026-10',cfg)[1].selected,false);
g.ECON_YEAR_CONFIG[2026]={rate:320,rateMode:'hourly'};assert.throws(()=>g.invoiceCalculate('2026-10',cfg,g.invoiceDayRows('2026-10',cfg)),/equivalencia diaria/);
cfg.rate='40';cfg.unit='hour';assert.equal(g.invoiceDayRows('2026-10',cfg)[0].rate,'40');assert.equal(g.invoiceDayRows('2026-10',cfg)[0].unit,'hour');
assert.throws(()=>g.invoiceGmailUrl(cfg,'2026-10'),/Completa/);cfg.from='demo@example.test';cfg.to='Cliente <cliente@example.test>';let url=g.invoiceGmailUrl(cfg,'2026-10');assert.ok(url.includes('authuser=demo%40example.test'));assert.ok(!url.includes('send='));
const data={config:cfg,months:{}};g.invoiceSave(data);assert.equal(g.invoiceData().config.from,cfg.from);
assert.throws(()=>g.invoiceMerge({config:cfg,months:{'2026-10':{note:'A'}}},{config:cfg,months:{'2026-10':{note:'B'}}}),/dos versiones/);
assert.throws(()=>g.invoiceValidate({config:cfg,months:{'2026-10':{final:{pdf:'not-pdf'}}}}),/no válidos/);
require('node:vm').runInContext(require('node:fs').readFileSync('js/import-export.js','utf8'),g);
g.showToast=()=>{};g.render=()=>{};g.updateEventsBtn=()=>{};g.updateBdayBtn=()=>{};
g.applyFullImport({invoices:data},'replace');assert.equal(g.invoiceData().config.from,cfg.from);
console.log('Facturación auxiliar: céntimos, tramos, exclusiones, histórico, Gmail y backup OK');

const imported=g.invoiceConfigImport({format:'gestify-invoice-settings',version:1,config:{issuer:'Persona ejemplo',issuerTax:'TEST',issuerAddress:'Dirección ficticia'}},cfg);
assert.equal(imported.issuer,'Persona ejemplo');assert.equal(imported.to,cfg.to);assert.equal(cfg.issuer,'');
assert.throws(()=>g.invoiceConfigImport({config:{}},cfg),/archivo/);
assert.throws(()=>g.invoiceConfigImport({format:'gestify-invoice-settings',version:1,config:{vat:'101'}},cfg),/Porcentaje/);
assert.throws(()=>g.invoiceConfigImport({format:'gestify-invoice-settings',version:1,config:{months:{}}},cfg),/Campo/);
console.log('Importación de configuración: campos parciales, validación y meses protegidos OK');

const sampleIban='ES'+String(98n-(BigInt('00000000000000000000'+'142800')%97n)).padStart(2,'0')+'00000000000000000000';
assert.equal(g.invoiceIban(sampleIban.toLowerCase().replace(/(.{4})/g,'$1 ')),sampleIban);
assert.throws(()=>g.invoiceIban(sampleIban.slice(0,-1)+'1'),/dígitos/);
assert.equal(g.invoiceIban(''),'');
const bankConfig=g.invoiceConfigImport({format:'gestify-invoice-settings',version:1,config:{iban:sampleIban}},cfg);
g.invoiceSave({config:bankConfig,months:{}});assert.equal(g.invoiceData().config.iban,sampleIban);
assert.equal(g.invoiceCalculate('2026-10',bankConfig,[{date:'2026-10-01',selected:true,rate:'320',unit:'day',hours:9}]).payment.iban,sampleIban);
console.log('IBAN: normalización, dígitos de control, importación y preparación OK');

// El desglose explica la unidad real y oculta también las tarifas y subtotales.
g.INVOICE_HIDE_AMOUNTS=true;
let summary=g.invoiceSummary(p);
assert.ok(summary.includes('6,5 horas ×'));assert.ok(summary.includes('Precio por hora'));
assert.ok(!summary.includes('€'));assert.ok(!summary.includes('12,35'));assert.ok(!summary.includes('80,28'));
g.INVOICE_HIDE_AMOUNTS=false;summary=g.invoiceSummary(p);
assert.ok(summary.includes('12,35 €'));assert.ok(summary.includes('80,28 €'));
assert.ok(summary.includes('IVA · 21 %'));assert.ok(summary.includes('IRPF · 15 %'));assert.ok(summary.includes('Base + IVA − IRPF'));
const locked=g.invoiceKairoSection(null,{},'','Faltan datos');
assert.ok(locked.includes('Sin configurar'));assert.ok(locked.includes('invoiceKairoConfig'));assert.ok(!locked.includes('invoiceKairoSend'));
const incomplete=g.invoiceKairoSection(null,{},'https://synthetic.test.ts.net/facturas/','Faltan datos');
assert.ok(incomplete.includes('id="invoiceKairoSend" disabled'));assert.ok(incomplete.includes('id="invoiceKairoStatus" disabled'));
console.log('Desglose: cantidades, tarifas, impuestos, privacidad y Kairo sin configurar OK');

// Solo se descuentan ausencias laborables; la preparación con PDF conserva su selección.
g.ST={'2026-10-12':{type:'festivo'},'2026-10-15':{type:'ausencia'},'2026-10-17':{type:'festivo'},'2026-10-20':{type:'vacaciones'}};
const breakdown=g.invoiceDaysSummary('2026-10',null);
assert.ok(breakdown.includes('19 de 22'));assert.ok(breakdown.includes('12 de octubre'));assert.ok(breakdown.includes('15 de octubre'));assert.ok(breakdown.includes('20 de octubre'));assert.ok(!breakdown.includes('17 de octubre'));
assert.ok(breakdown.includes('Ausencias / bajas'));assert.ok(!breakdown.includes(' open'));
const frozen=g.invoiceCalculate('2026-10',cfg,g.invoiceDayRows('2026-10',cfg));
g.ST={};const savedBreakdown=g.invoiceDaysSummary('2026-10',frozen);
assert.ok(savedBreakdown.includes('19 de 22'));assert.ok(savedBreakdown.includes('Días no incluidos'));assert.ok(!savedBreakdown.includes('Festivos'));
assert.ok(g.invoiceDaysSummary('2024-02',null).includes('21 de 21'));
console.log('Jornadas: motivos, fechas, fines de semana, febrero bisiesto y factura conservada OK');

{
  const app=cargarApp(),old=Object.assign(app.invoiceDefaults(),{project:'DEMO/OLD',rate:'320'});app.URL=URL;
  const change={project:'DEMO/NEW',from:'2027-03',previous:'DEMO/OLD'};
  const next=app.invoiceProjectApply(old,change,{'2027-02':{preparation:{}}});
  assert.equal(old.project,'DEMO/OLD');assert.equal(Object.keys(old.projectPeriods).length,0);
  for(const [period,expected] of [['2027-02','DEMO/OLD'],['2027-03','DEMO/NEW'],['2030-01','DEMO/NEW']]){
    assert.equal(app.invoiceProjectFor(next,period),expected);
    assert.equal(app.invoiceCalculate(period,next,app.invoiceDayRows(period,next)).project,expected);
  }
  assert.throws(()=>app.invoiceProjectApply(old,change,{'2027-03':{preparation:{}}}),/factura preparada/);
  assert.throws(()=>app.invoiceProjectPeriods({'2027-13':'DEMO'}),/Vigencias/);
  assert.throws(()=>app.invoiceProjectChange({...change,from:''}),/Selecciona/);
  const saved={config:next,months:{},projectPending:{project:'DEMO/LATER',from:'2027-06',previous:'DEMO/NEW'},projectPendingUrl:'https://synthetic.test.ts.net/facturas/'};
  app.invoiceSave(saved);const restored=app.invoiceData();
  assert.equal(app.invoiceProjectFor(restored.config,'2027-02'),'DEMO/OLD');
  assert.equal(restored.projectPending.project,'DEMO/LATER');
  const merged=app.invoiceMerge(restored,{config:next,months:{}});
  assert.equal(merged.projectPendingUrl,saved.projectPendingUrl);
  const imported=app.invoiceConfigImport({format:'gestify-invoice-settings',version:1,config:next},old);
  assert.equal(app.invoiceProjectFor(imported,'2027-02'),'DEMO/OLD');
  assert.equal(app.invoiceProjectReply({state:'project_saved',project:change.project,from:change.from,base:old.project,periods:{'2027-03':change.project}},change).project,change.project);
  assert.throws(()=>app.invoiceProjectReply({state:'project_saved',project:change.project,from:change.from,base:old.project,periods:{}},change),/vigencia/);
  const first=app.invoiceProjectApply(app.invoiceDefaults(),{...change,previous:''},{});
  assert.equal(app.invoiceProjectFor(first,'2027-02'),'');assert.equal(app.invoiceProjectFor(first,'2027-03'),'DEMO/NEW');
}
console.log('Proyectos: vigencias, histórico, backup, conflicto y confirmación de Kairo OK');

{
  const app=cargarApp(),config=app.invoiceDefaults();
  config.kairoUrl='https://synthetic-calendar.test.ts.net/facturas/';
  app.ST={'2027-02-19':{type:'festivo'},'2027-02-18':{type:'vacaciones'},'2027-02-17':{type:'ausencia'}};
  const before=JSON.stringify(app.ST);
  assert.equal(app.invoiceCalendarDelivery('2027-02',config).date,'2027-02-16');
  assert.equal(app.invoiceCalendarDelivery('2027-02',config).kind,'planned');
  let html=app.renderInvoiceCalendar('2027-02',config);
  for(const mark of ['V · Vacaciones','F · Festivo','A · Ausencia','Envío previsto'])assert.ok(html.includes(mark));
  assert.equal((html.match(/data-date=/g)||[]).length,28);
  assert.equal((app.renderInvoiceCalendar('2028-02',config).match(/data-date=/g)||[]).length,29);
  assert.equal((app.renderInvoiceCalendar('2027-05',config).match(/<tr>/g)||[]).length,7);
  app.INVOICE_HOME_CACHE={url:config.kairoUrl,periods:{'2027-02':{data:{state:'scheduled',scheduledDate:'2027-02-19'}}}};
  assert.equal(app.invoiceCalendarDelivery('2027-02',config).date,'2027-02-19');
  assert.ok(app.invoiceCalendarDelivery('2027-02',config).note.includes('difiere'));
  app.INVOICE_HOME_CACHE.periods['2027-02'].data={state:'sent',sent:true};
  assert.equal(app.invoiceCalendarDelivery('2027-02',config).date,null);
  assert.equal(app.invoiceCalendarDelivery('2027-02',config).kind,'sent');
  assert.equal(JSON.stringify(app.ST),before);
}
console.log('Calendario de factura: exclusiones, fecha prevista/confirmada, histórico y calendario sin escrituras OK');

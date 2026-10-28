const {test,expect}=require('@playwright/test');
const {spawn}=require('node:child_process');
const base='https://synthetic-hours.test.ts.net/';
let demo;
test.beforeAll(async()=>{
  demo=spawn('python',['tools/kairo/demo_hours.py','--port','8772','--app-origin','http://127.0.0.1:8765'],{stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject)=>{demo.stdout.once('data',resolve);demo.once('error',reject);demo.once('exit',code=>reject(Error('Demo no disponible: '+code)));});
});
test.afterAll(()=>{demo?.kill();});
test.describe.configure({mode:'serial'});

async function setup(page,context,scenario='mixed'){
  const calls=[];
  await context.route(base+'facturas/**',route=>{
    const period=new URL(route.request().url()).searchParams.get('period');
    return route.fulfill({json:{period,state:'sent',generated:true,issued:true,scheduled:false,sent:true,scheduledDate:null},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
  });
  await context.route(base+'horas/**',async route=>{
    const req=route.request(),url=new URL(req.url());calls.push({method:req.method(),path:url.pathname});
    const local='http://127.0.0.1:8772'+url.pathname.replace('/horas/','/')+url.search;
    let payload=req.postDataJSON();if(payload&&url.pathname.endsWith('/preview'))payload.demoScenario=scenario;
    const response=await context.request.fetch(local,{method:req.method(),headers:{'Origin':req.method()==='GET'?'http://127.0.0.1:8765':'http://127.0.0.1:8772','Content-Type':'application/json','X-CSRF':req.headers()['x-csrf']||''},data:payload||undefined});
    await route.fulfill({response,headers:{...response.headers(),'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
  });
  await page.clock.setFixedTime(new Date('2027-02-01T12:00:00+01:00'));
  await page.addInitScript(()=>{
    sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');
    localStorage.setItem('excelia-mail-config-v1',JSON.stringify({to:'destino@example.invalid',cc:['copia@example.invalid'],name:'Persona de prueba'}));
    localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:'https://synthetic-hours.test.ts.net/facturas/'},months:{}}));
  });
  await page.goto('/');
  await page.evaluate(()=>{CY=2027;CM=1;MONTH_H={'2027-02':9,'2027-03':9};ST={};SW={};render();});
  await expect(page.locator('[data-hours-review]')).toBeVisible();
  return calls;
}
async function open(page,button){const waiting=page.waitForEvent('popup');await button.click();const popup=await waiting;await expect(popup.locator('#message')).toContainText('Conciliación terminada');return popup;}

test('lote e individual conservan alcance; revisión muestra cambios y simula sin correos reales',async({page,context},info)=>{
  const calls=await setup(page,context);const before=await page.evaluate(()=>JSON.stringify(SW));
  const popup=await open(page,page.locator('[data-hours-review]'));
  await expect(popup.locator('.week')).toHaveCount(6);await expect(popup.locator('.week[data-state=sent]')).toHaveCount(1);await expect(popup.locator('.week[data-state=scheduled]')).toHaveCount(1);await expect(popup.locator('.week[data-state=changed]')).toHaveCount(1);await expect(popup.locator('.week[data-state=ready]')).toHaveCount(3);
  await expect(popup.locator('.week[data-state=changed]')).toContainText('8 h → 9 h');
  await expect(popup.locator('#recipients')).toContainText('copia@example.invalid');
  await popup.locator('[data-update]').check();await popup.locator('#simulate').click();await expect(popup.locator('#simulation')).toContainText('No se ha creado ni modificado ningún correo');
  expect(await page.evaluate(()=>JSON.stringify(SW))).toBe(before);
  expect(calls.some(c=>c.path.endsWith('/commit'))).toBe(false);
  await popup.screenshot({path:info.outputPath('hours-batch.png'),fullPage:true});await popup.close();
  const individual=await open(page,page.locator('.week-card').nth(3).getByRole('button',{name:'Programar semana'}));
  await expect(individual.locator('h1')).toHaveText('Programar esta semana');await expect(individual.locator('.week')).toHaveCount(1);await expect(individual.locator('.week')).toHaveAttribute('data-state','ready');
  await individual.close();expect(await page.evaluate(()=>JSON.stringify(SW))).toBe(before);
});

test('un duplicado se revisa por semana aunque cambie su día de envío',async({page,context})=>{
  await setup(page,context,'duplicate');const popup=await open(page,page.locator('[data-hours-review]'));
  await expect(popup.locator('.week[data-state=duplicate]')).toHaveCount(1);await expect(popup.locator('.week[data-state=duplicate]')).toContainText('No se creará otro correo');
});

test('individual no adelanta una semana anterior pendiente',async({page,context})=>{
  await setup(page,context,'previous-missing');const popup=await open(page,page.locator('.week-card').nth(3).getByRole('button',{name:'Programar semana'}));
  await expect(popup.locator('.week')).toHaveAttribute('data-state','blocked-previous');await expect(popup.locator('.week')).toContainText('2027-02-15');
  await popup.locator('#simulate').click();await expect(popup.locator('#simulation')).toContainText('No hay programaciones nuevas');
});

test('si Gestify cambia tras revisar, no permite confirmar el lote antiguo',async({page,context})=>{
  const calls=await setup(page,context);
  // Only this synthetic page exposes the future confirmation control. The
  // service still refuses /commit; no real Outlook service is used here.
  await context.route(base+'horas/',async route=>{
    const response=await context.request.get('http://127.0.0.1:8772/');
    await route.fulfill({status:200,contentType:'text/html',body:(await response.text()).replace('"allowWrites": false','"allowWrites": true')});
  });
  const popup=await open(page,page.locator('[data-hours-review]'));
  await expect(popup.locator('#commit')).toBeVisible();
  await page.evaluate(()=>{ST['2027-02-01']={type:'normal',hours:8};});
  await popup.locator('#commit').click();
  await expect(popup.locator('#message')).toContainText('Los datos de Gestify han cambiado');
  expect(calls.some(c=>c.path.endsWith('/commit'))).toBe(false);
});

test('Recordatorios comparte las dos semanas extra y reconoce enviadas y programadas',async({page,context})=>{
  await setup(page,context);
  const popup=await open(page,page.locator('[data-hours-review]'));
  await popup.close();
  await page.evaluate(()=>openHomePopup(true));
  const warnings=page.locator('#homePopupContent');
  await expect(warnings).toContainText('Semana del 15/02');
  await expect(warnings).toContainText('por revisar');
  await expect(warnings).toContainText('Semana del 01/03');
  await expect(warnings).toContainText('Semana del 08/03');
  await expect(warnings).not.toContainText('Semana del 08/02');
  await expect(warnings).not.toContainText('Semana del 15/03');
});

for(const width of [320,400])test('revisión de horas legible a '+width,async({page,context},info)=>{
  await page.setViewportSize({width,height:880});await setup(page,context);
  await page.screenshot({path:info.outputPath('hours-home-'+width+'.png'),animations:'disabled'});
  const popup=await open(page,page.locator('[data-hours-review]'));await popup.setViewportSize({width,height:880});
  expect(await popup.locator('html').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  await popup.screenshot({path:info.outputPath('hours-review-'+width+'.png'),animations:'disabled',fullPage:true});
});

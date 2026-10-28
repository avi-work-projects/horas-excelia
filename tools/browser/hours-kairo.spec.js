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
async function open(page,button){const waiting=page.waitForEvent('popup');await button.click();const popup=await waiting;await expect(popup.locator('#message')).toContainText('Estado actualizado en Home');return popup;}

test('Android instalado conserva la revisión en Gestify y vuelve a Home',async({page,context},info)=>{
  await page.setViewportSize({width:400,height:850});
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'userAgent',{get:()=> 'Mozilla/5.0 Android Gestify'});
    const media=window.matchMedia.bind(window);window.matchMedia=query=>query==='(display-mode: standalone)'?{matches:true}:media(query);
  });
  const calls=await setup(page,context),before=await page.evaluate(()=>JSON.stringify(localStorage));
  const popups=[];page.on('popup',popup=>popups.push(popup));
  await page.getByRole('button',{name:'Comprobar Outlook',exact:true}).click();
  await expect(page.locator('.home-submission')).toContainText('1 enviada · 1 programada · 3 pendientes · 1 por revisar');
  await expect(page.locator('.hours-review-dialog')).toHaveCount(0);
  await page.locator('[data-hours-review]').click();
  const review=page.frameLocator('.hours-review-dialog iframe');
  await expect(review.locator('#message')).toContainText('Estado actualizado en Home');
  await expect(review.locator('.week')).toHaveCount(4);
  await page.screenshot({path:info.outputPath('hours-android-review.png'),animations:'disabled'});
  await review.getByRole('button',{name:'Volver a Gestify'}).click();
  await expect(page.locator('.hours-review-dialog')).toHaveCount(0);
  await page.locator('.week-card').nth(3).getByRole('button',{name:'Programar semana'}).click();
  await expect(review.locator('h1')).toHaveText('Programar esta semana');
  await expect(review.locator('.week')).toHaveCount(1);
  await page.getByRole('button',{name:'Volver a Home',exact:true}).click();
  await expect(page.locator('.hours-review-dialog')).toHaveCount(0);
  expect(popups).toHaveLength(0);
  expect(calls.some(c=>c.path.endsWith('/commit')||c.path.endsWith('/simulate'))).toBe(false);
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(before);
});

test('lote e individual conservan alcance; revisión muestra cambios y simula sin correos reales',async({page,context},info)=>{
  const calls=await setup(page,context);const before=await page.evaluate(()=>JSON.stringify(SW));
  const popup=await open(page,page.locator('[data-hours-review]'));
  await expect(popup.locator('.week')).toHaveCount(4);await expect(popup.locator('.resolved-week[data-state=sent]')).toHaveCount(1);await expect(popup.locator('.resolved-week[data-state=scheduled]')).toHaveCount(1);await expect(popup.locator('#resolved')).not.toHaveAttribute('open','');await popup.screenshot({path:info.outputPath('hours-batch.png'),fullPage:true});await expect(popup.locator('.week[data-state=changed]')).toHaveCount(1);await expect(popup.locator('.week[data-state=ready]')).toHaveCount(3);
  await expect(popup.locator('.week[data-state=changed] details')).not.toHaveAttribute('open','');await popup.locator('.week[data-state=changed] summary').click();await expect(popup.locator('.week[data-state=changed]')).toContainText('8 h → 9 h');await popup.locator('.week[data-state=changed] summary').click();
  await expect(popup.locator('#recipients')).not.toHaveAttribute('open','');await popup.locator('#recipients > summary').click();await expect(popup.locator('#recipients')).toContainText('copia@example.invalid');await popup.locator('#recipients > summary').click();
  await popup.locator('[data-update]').check();await popup.locator('#simulate').click();await expect(popup.locator('#simulation')).toContainText('No se ha creado ni modificado ningún correo');
  expect(await page.evaluate(()=>JSON.stringify(SW))).toBe(before);
  expect(calls.some(c=>c.path.endsWith('/commit'))).toBe(false);
  await popup.close();
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
  await expect(popup.locator('.week')).toHaveAttribute('data-state','blocked-previous');await expect(popup.locator('.week')).toContainText('15 feb');
  await popup.locator('#simulate').click();await expect(popup.locator('#simulation')).toContainText('No hay programaciones nuevas');
});

test('la revisión comunica estados aunque el navegador bloquee la consulta automática',async({page,context})=>{
  await page.route(base+'horas/status?**',route=>route.abort());
  await setup(page,context);
  const popup=await open(page,page.locator('[data-hours-review]'));
  await expect.poll(()=>page.evaluate(()=>HOURS_STATUS.phase)).toBe('ready');
  await popup.route(base+'horas/preview',async route=>{
    const payload=route.request().postDataJSON();payload.demoScenario='duplicate';
    const response=await context.request.post('http://127.0.0.1:8772/preview',{headers:{Origin:'http://127.0.0.1:8772','X-CSRF':route.request().headers()['x-csrf']},data:payload});
    await route.fulfill({response});
  });
  await popup.locator('#refresh').click();
  await expect(popup.locator('.week[data-state=duplicate]')).toHaveCount(1);
  await expect.poll(()=>page.evaluate(()=>HOURS_STATUS.rows.filter(r=>r.state==='duplicate').length)).toBe(1);
});

test('comprobar vuelve a Home sin confirmar ni cambiar correos',async({page,context})=>{
  await page.route(base+'horas/status?**',route=>route.abort());
  const calls=await setup(page,context),before=await page.evaluate(()=>JSON.stringify(localStorage));
  const waiting=page.waitForEvent('popup');await page.getByRole('button',{name:'Comprobar Outlook',exact:true}).click();const popup=await waiting;
  await expect.poll(()=>popup.isClosed()).toBe(true);
  await expect(page.locator('.home-submission')).toContainText('1 enviada · 1 programada · 3 pendientes · 1 por revisar');
  expect(calls.some(c=>c.path.endsWith('/commit')||c.path.endsWith('/simulate'))).toBe(false);
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(before);
});

test('Home compara la programación con los días actuales y detecta cambios locales',async({page,context},info)=>{
  await setup(page,context);await expect.poll(()=>page.evaluate(()=>HOURS_STATUS.phase)).toBe('ready');
  const week=page.locator('.week-card').nth(1);
  await expect(week.locator('.hours-week-badge')).toHaveText('◷ Programada');
  await expect(week.locator('.hours-week-readonly')).toContainText('12/02');
  await page.evaluate(()=>{ST['2027-02-09']={type:'vacaciones'};render();});
  await expect(week.locator('.hours-week-badge')).toHaveText('Revisar cambios');
  await page.screenshot({path:info.outputPath('hours-home-changed.png'),animations:'disabled'});
  await page.evaluate(()=>{delete ST['2027-02-09'];render();});
  await expect(week.locator('.hours-week-badge')).toHaveText('◷ Programada');
});

test('semana de vacaciones usa el último día no festivo y muestra solo lo que requiere revisión',async({page,context})=>{
  await setup(page,context);await page.evaluate(()=>{for(let day=8;day<=12;day++)ST['2027-02-'+String(day).padStart(2,'0')]={type:day===12?'festivo':'vacaciones'};render();});
  const popup=await open(page,page.locator('.week-card').nth(1).getByRole('button',{name:'Revisar cambios'}));
  await expect(popup.locator('.week .date')).toContainText('11/02');await expect(popup.locator('.week .date')).toContainText('08:00');
  await expect(popup.locator('[data-update]')).not.toBeChecked();
});

test('semanas resueltas aparecen sincronizadas en Home y no ofrecen una confirmación vacía',async({page,context},info)=>{
  await page.route(base+'horas/status?**',async route=>{
    const request=await (await context.request.get('http://127.0.0.1:8772/example?mode=month',{headers:{Origin:'http://127.0.0.1:8765'}})).json();
    return route.fulfill({json:{period:request.period,checkedAt:new Date().toISOString(),rows:request.weeks.map((w,i)=>({key:w.key,state:i?'scheduled':'sent',days:w.days,schedule:w.days[4].date+'T08:00:00+01:00'}))},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
  });
  await setup(page,context);await expect(page.locator('.home-submission.complete')).toContainText('Todo al día');
  await expect(page.locator('.home-submission.complete')).toContainText('1 enviada · 5 programadas');
  await page.screenshot({path:info.outputPath('hours-home-synced.png'),animations:'disabled'});
  await context.route(base+'horas/',async route=>{const response=await context.request.get('http://127.0.0.1:8772/');await route.fulfill({contentType:'text/html',body:(await response.text()).replace('"allowWrites": false','"allowWrites": true')});});
  const popup=await open(page,page.locator('.week-card').first().getByRole('button',{name:'Ver estado'}));
  await expect(popup.locator('#summary')).toContainText('Todo al día');await expect(popup.locator('#commit')).toBeHidden();await expect(popup.locator('#simulate')).toBeHidden();
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

test('una confirmación sin operaciones no anuncia que haya programado correos',async({page,context})=>{
  await setup(page,context);
  await context.route(base+'horas/',async route=>{const response=await context.request.get('http://127.0.0.1:8772/');await route.fulfill({contentType:'text/html',body:(await response.text()).replace('"allowWrites": false','"allowWrites": true')});});
  await context.route(base+'horas/commit',route=>route.fulfill({json:{results:[]}}));
  const popup=await open(page,page.locator('[data-hours-review]'));await popup.locator('#commit').click();
  await expect(popup.locator('#message')).toContainText('No se ha modificado ningún correo');
  await expect(popup.locator('#message')).not.toContainText('Programación confirmada');
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

const {test,expect}=require('@playwright/test');
const service='https://network-fixture.test.ts.net';
const trigger='https://trigger.macrodroid.com/synthetic-test-device';
async function setup(page,{configured=true,linked=true}={}){
  const state={reachable:false,reject:false,commands:[],agenda:0};
  await page.clock.install({time:new Date('2027-02-01T12:00:00+01:00')});
  await page.addInitScript(({service,trigger,linked,configured})=>{
    sessionStorage.setItem('excelia-popup-dismissed','1');
    if(linked)localStorage.setItem('excelia-alarm-url',trigger+'/generar_alarma1');
    if(configured)localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:service+'/facturas/'},months:{}}));
  },{service,trigger,configured,linked});
  await page.route('https://trigger.macrodroid.com/**',r=>{
    state.commands.push(r.request().url());
    return r.fulfill({status:state.reject?403:200,headers:{'Access-Control-Allow-Origin':'*'},body:''});
  });
  await page.route(service+'/**',r=>{
    const path=new URL(r.request().url()).pathname;
    if(path==='/horas/reachable'&&state.reachable)return r.fulfill({json:{service:'kairo-hours'},headers:{'Access-Control-Allow-Origin':'*'}});
    if(path==='/horas/calendario'){state.agenda++;return r.fulfill({contentType:'text/html',body:'<h1>Agenda de prueba</h1>'});}
    return r.abort();
  });
  await page.goto('/');
  return state;
}
async function fromMenu(page){
  await page.locator('#menuBtn').click();await page.locator('#mobileConnectionBtn').click();
  return page.getByRole('dialog',{name:'Conexión del móvil'});
}
test('Ajustes usa los tres destinos del widget, limita toques repetidos y distingue entrega de acceso privado',async({page},info)=>{
  const state=await setup(page),dialog=await fromMenu(page);
  await expect(dialog.locator('[data-route]')).toHaveText('Acceso a Kairo sin confirmar');
  await dialog.getByRole('button',{name:'VPN Kairo'}).dblclick({delay:15,force:true});
  await expect(dialog.locator('[data-mode-result]')).toContainText('Solicitud enviada');
  await expect(dialog.getByRole('button',{name:'DNS AdGuard'})).toBeDisabled();
  expect(state.commands).toEqual([trigger+'/conexion_kairo']);
  state.reachable=true;await page.clock.fastForward(9000);await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(dialog.locator('[data-route]')).toHaveText('Kairo accesible desde este dispositivo');
  await page.evaluate(()=>window.getSelection().removeAllRanges());
  await dialog.screenshot({path:info.outputPath('conexion.png')});
  state.reachable=false;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(dialog.locator('[data-route]')).toHaveText('Acceso a Kairo sin confirmar');
  await dialog.getByRole('button',{name:'DNS AdGuard'}).click();await expect(dialog.locator('[data-mode-result]')).toContainText('Solicitud enviada');
  await page.clock.fastForward(9000);
  state.reject=true;await dialog.getByRole('button',{name:'OFF',exact:true}).click();
  await expect(dialog.locator('[data-mode-result]')).toContainText('Entrega sin confirmar');
  expect(state.commands).toEqual(['conexion_kairo','conexion_adguard','conexion_normal'].map(id=>trigger+'/'+id));
  await dialog.getByRole('button',{name:'Volver'}).click();await expect(page.locator('#dataMenu')).toHaveClass(/open/);
});
test('la agenda activa VPN con un solo toque y continúa únicamente tras una lectura privada válida',async({page})=>{
  const state=await setup(page);await page.locator('#hoursCalendarBtn').click();
  await page.getByRole('dialog',{name:'Programación',exact:true}).getByRole('button',{name:'Activar VPN'}).click();
  const dialog=page.locator('#mobileConnectionDialog');
  await expect(dialog.locator('[data-mode-result]')).toContainText('Solicitud enviada');
  await page.clock.fastForward(2000);await expect(dialog.locator('[data-route]')).toContainText('sin confirmar');
  expect(state.agenda).toBe(0);state.reachable=true;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(dialog).toHaveCount(0);await expect(page.frameLocator('iframe[title="Programación de Kairo"]').getByRole('heading')).toHaveText('Agenda de prueba');
  expect(state.commands).toEqual([trigger+'/conexion_kairo']);expect(state.agenda).toBe(1);
});
test('vinculación privada sin Kairo permite los modos y rechaza orígenes ajenos',async({page})=>{
  const state=await setup(page,{linked:false,configured:false}),dialog=await fromMenu(page);
  const input=dialog.getByLabel('Enlace de MacroDroid');
  await input.fill('https://trigger.macrodroid.com.ejemplo.invalid/device');await dialog.getByRole('button',{name:/Guardar para/}).click();
  await expect(dialog.getByRole('button',{name:'OFF',exact:true})).toBeDisabled();
  await input.fill(trigger+'/conexion_normal');await dialog.getByRole('button',{name:/Guardar para/}).click();
  await expect(input).toBeHidden();await expect(dialog).not.toContainText('synthetic-test-device');
  expect(await page.evaluate(()=>localStorage.getItem('excelia-alarm-url'))).toBe(trigger);
  await dialog.getByRole('button',{name:'DNS AdGuard'}).click();await expect(dialog.locator('[data-mode-result]')).toContainText('Solicitud enviada');
  expect(state.commands).toEqual([trigger+'/conexion_adguard']);
});

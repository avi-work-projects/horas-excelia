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
  await page.getByRole('dialog',{name:'Comprobar conexión',exact:true}).getByRole('button',{name:'Aceptar',exact:true}).click();
  const dialog=page.locator('#mobileConnectionDialog');
  await expect(dialog.locator('[data-mode-result]')).toContainText('Solicitud enviada');
  await page.clock.fastForward(2000);await expect(dialog.locator('[data-route]')).toContainText('sin confirmar');
  expect(state.agenda).toBe(0);state.reachable=true;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(dialog).toHaveCount(0);await expect(page.frameLocator('iframe[title="Programación de Kairo"]').getByRole('heading')).toHaveText('Agenda de prueba');
  expect(state.commands).toEqual([trigger+'/conexion_kairo']);expect(state.agenda).toBe(1);
});

test('cancelar el aviso no cambia la red ni abre la agenda',async({page},info)=>{
  const state=await setup(page);await page.locator('#hoursCalendarBtn').click();
  const prompt=page.getByRole('dialog',{name:'Comprobar conexión',exact:true});
  await expect(prompt).toBeVisible();await expect(prompt).toContainText('ni confirmar la VPN');
  await prompt.screenshot({path:info.outputPath('aviso-vpn.png'),animations:'disabled'});
  await prompt.getByRole('button',{name:'Cancelar',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Programación',exact:true})).toHaveCount(0);
  expect(state.commands).toEqual([]);expect(state.agenda).toBe(0);
});

test('Android lee primero el registro publicado; no confunde Kairo caído con VPN apagada',async({page,context})=>{
  await context.addInitScript(()=>Object.defineProperty(navigator,'userAgent',{value:'Android Gestify test'}));
  const state=await setup(page),reads=[];let mode='dns',confirmed=true;
  await page.route('http://127.0.0.1:8080/gestify-connection',r=>{
    reads.push('local');return r.fulfill({json:{schema:1,service:'gestify-mobile-connection',mode,confirmed,updatedAt:Date.now()},headers:{'Access-Control-Allow-Origin':'*'}});
  });
  await page.route(service+'/horas/reachable',r=>{reads.push('kairo');return r.abort();});
  await page.locator('#hoursCalendarBtn').click();
  const prompt=page.getByRole('dialog',{name:'Conectar VPN',exact:true});await expect(prompt).toBeVisible();
  expect(reads).toEqual(['local']);await prompt.getByRole('button',{name:'Cancelar',exact:true}).click();
  mode='vpn';await page.locator('#hoursCalendarBtn').click();
  await expect(page.locator('#toast')).toContainText('La VPN está activa, pero Kairo no responde');
  expect(reads).toEqual(['local','local','kairo']);expect(state.commands).toEqual([]);
  await expect(page.locator('.kairo-vpn-prompt')).toHaveCount(0);
  confirmed=false;await page.locator('#hoursCalendarBtn').click();
  await expect(page.getByRole('dialog',{name:'Comprobar conexión',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');expect(state.commands).toEqual([]);
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

test('Conexión DNS / VPN tiene fondo visible y contraste en todos los temas; Atrás recupera Ajustes',async({page})=>{
 await setup(page);
 for(const width of [320,440]){
  await page.setViewportSize({width,height:880});
  for(const theme of ['light','dark','grey']){
   await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
   await page.locator('#menuBtn').click();
   const button=page.getByRole('button',{name:'Conexión DNS / VPN',exact:true});await expect(button).toBeVisible();
   const styles=await button.evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
   expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');expect(styles.background).not.toBe(styles.color);
   const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(v=>+v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
   const a=luminance(styles.background),b=luminance(styles.color);expect((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toBeGreaterThanOrEqual(4.5);
   // Una variante sin color también conserva el fondo de respaldo.
   await button.evaluate(el=>el.classList.remove('settings-edit-mobile'));
   expect(await button.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
   await button.evaluate(el=>el.classList.add('settings-edit-mobile'));
   await button.focus();await page.keyboard.press('Enter');
   const dialog=page.getByRole('dialog',{name:'Conexión del móvil'});await expect(dialog).toBeVisible();
   await dialog.getByRole('button',{name:'Volver',exact:true}).click();await expect(page.locator('#dataMenu')).toHaveClass(/open/);await expect(button).toBeFocused();
   await page.locator('#menuBtn').click();
  }
 }
});

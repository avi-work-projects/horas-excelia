const {test,expect}=require('@playwright/test');
const service='https://network-fixture.test.ts.net';
const trigger='https://trigger.macrodroid.com/synthetic-test-device';
async function setup(page,{configured=true,linked=true,paused=false}={}){
  const state={reachable:false,reject:false,commands:[],agenda:0,checks:0,brokenAgenda:false};
  await page.clock.install({time:new Date('2027-02-01T12:00:00+01:00')});
  if(paused)await page.clock.pauseAt(new Date('2027-02-01T12:00:10+01:00'));
  await page.addInitScript(({service,trigger,linked,configured})=>{
    sessionStorage.setItem('excelia-popup-dismissed','1');
    localStorage.setItem('excelia-theme-v1','light');
    if(linked)localStorage.setItem('excelia-alarm-url',trigger+'/generar_alarma1');
    if(configured)localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:service+'/facturas/'},months:{}}));
  },{service,trigger,configured,linked});
  await page.route('https://trigger.macrodroid.com/**',r=>{
    state.commands.push(r.request().url());
    return r.fulfill({status:state.reject?403:200,headers:{'Access-Control-Allow-Origin':'*'},body:''});
  });
  await page.route(service+'/**',r=>{
    const path=new URL(r.request().url()).pathname;
    if(path==='/horas/reachable'){state.checks++;if(state.reachable)return r.fulfill({json:{service:'kairo-hours'},headers:{'Access-Control-Allow-Origin':'*'}});}
    if(path==='/horas/calendario'){state.agenda++;if(state.brokenAgenda)return r.abort();return r.fulfill({contentType:'text/html',body:'<h1>Agenda de prueba</h1><button onclick="parent.postMessage({type:\'kairo-calendar-close\'},\'*\')">Volver a Gestify</button><script>parent.postMessage({type:"kairo-calendar-month",period:"2027-02"},"*")</script>'});}
    return r.abort();
  });
  await page.goto('/');
  return state;
}
async function closeAgenda(page){await page.frameLocator('iframe[title="Programación de Kairo"]').getByRole('button',{name:'Volver a Gestify',exact:true}).click();}
async function openDialog(page){
  await page.evaluate(()=>openMobileConnection());
  return page.getByRole('dialog',{name:'Conexión del móvil'});
}
test('el selector conserva el formato de Kairo en los tres temas',async({page},info)=>{
  const state=await setup(page);const dialog=await openDialog(page);
  for(const theme of ['light','dark','grey'])for(const width of [320,400,440]){
    await page.setViewportSize({width,height:880});await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
    await expect(dialog.locator('p')).toHaveCount(0);await expect(dialog.locator('.mobile-modes button')).toHaveCount(3);
    expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
    const widths=await dialog.locator('.mobile-modes button').evaluateAll(buttons=>buttons.map(b=>b.getBoundingClientRect().width));expect(Math.max(...widths)-Math.min(...widths)).toBeLessThan(1);
    await expect(dialog.locator('[data-mobile-mode=off] .prohibition-icon')).toBeVisible();
    await expect(dialog.locator('[data-mobile-mode=vpn] .mobile-kairo-wordmark')).toBeVisible();
    const head=await dialog.locator('header').evaluate(h=>({back:h.querySelector('[data-back]').getBoundingClientRect().left,title:h.querySelector('h2').getBoundingClientRect().left}));expect(head.back).toBeLessThan(head.title);
    if(theme==='light'&&width===400)await dialog.screenshot({path:info.outputPath('conexion-tres-botones.png')});
  }
  expect((await page.request.get('/kairo-wordmark.png')).status()).toBe(200);expect(state.checks).toBe(0);
  await dialog.getByRole('button',{name:'Volver',exact:true}).click();
  await expect(dialog).toHaveCount(0);
});
test('la vuelta automática espera acceso real y solo reanuda una vez',async({page})=>{
  const state=await setup(page,{paused:true});
  const dialog=page.getByRole('dialog',{name:'Conexión del móvil'});
  await page.evaluate(()=>{window.connectionResumed=0;openMobileConnection(function(){window.connectionResumed++;},'vpn');});
  await expect.poll(()=>state.commands.length).toBe(1);
  await expect(dialog.getByRole('status')).toContainText('solicitud enviada');
  await page.clock.fastForward(1500);
  await expect(dialog).toBeVisible();expect(await page.evaluate(()=>window.connectionResumed)).toBe(0);
  state.reachable=true;
  await expect.poll(async()=>{await page.clock.fastForward(2500);return page.evaluate(()=>window.connectionResumed);}).toBe(1);
  await expect(dialog).toHaveCount(0);expect(await page.evaluate(()=>kairoVpnConfirmed())).toBe(true);
  await page.clock.fastForward(30000);expect(state.commands).toEqual([trigger+'/conexion_kairo']);
  expect(await page.evaluate(()=>window.connectionResumed)).toBe(1);
});
test('Ajustes muestra los tres modos en línea, limita toques repetidos y no sondea Kairo',async({page},info)=>{
  const state=await setup(page);await page.locator('#menuBtn').click();
  const group=page.locator('#settingsConnection');
  await expect(page.locator('#mobileConnectionBtn')).toHaveCount(0);await expect(group.locator('.mobile-modes button')).toHaveCount(3);
  expect(await group.evaluate(c=>c.previousElementSibling.matches('.settings-menu-separator')&&c.nextElementSibling.matches('.settings-menu-separator')&&c.nextElementSibling.nextElementSibling.firstElementChild.id==='editConnectionsBtn')).toBe(true);
  for(const width of [320,400,440]){
    await page.setViewportSize({width,height:880});
    expect(await page.locator('#dataMenu').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
    expect(await group.locator('.mobile-modes button').evaluateAll(bs=>bs.every(b=>b.scrollWidth<=b.clientWidth+1))).toBe(true);
  }
  await group.getByRole('button',{name:'VPN Kairo'}).dblclick({delay:15,force:true});
  await expect(group.getByRole('status')).toContainText('VPN Kairo: solicitud enviada');
  await expect(group.getByRole('button',{name:'DNS AdGuard'})).toBeDisabled();
  expect(state.commands).toEqual([trigger+'/conexion_kairo']);
  await page.locator('#dataMenu').screenshot({path:info.outputPath('ajustes-conexion.png')});
  await page.clock.fastForward(9000);await expect(group.getByRole('button',{name:'DNS AdGuard'})).toBeEnabled();
  await group.getByRole('button',{name:'DNS AdGuard'}).click();await expect(group.getByRole('status')).toContainText('DNS AdGuard: solicitud enviada');
  await page.clock.fastForward(9000);
  state.reject=true;await group.getByRole('button',{name:'OFF',exact:true}).click();
  await expect(group.getByRole('status')).toContainText('Entrega sin confirmar');
  expect(state.commands).toEqual(['conexion_kairo','conexion_adguard','conexion_normal'].map(id=>trigger+'/'+id));
  expect(state.checks).toBe(0);await expect(page.locator('#dataMenu')).toHaveClass(/open/);
});
test('sin enlace, un modo de Ajustes abre el diálogo para vincular MacroDroid sin enviar órdenes',async({page})=>{
  const state=await setup(page,{linked:false});await page.locator('#menuBtn').click();
  await page.locator('#settingsConnection').getByRole('button',{name:'VPN Kairo'}).click();
  const dialog=page.getByRole('dialog',{name:'Conexión del móvil'});
  await expect(dialog.locator('[data-link]')).toBeVisible();expect(state.commands).toEqual([]);
  await dialog.getByRole('button',{name:'Volver'}).click();await expect(page.locator('#dataMenu')).toHaveClass(/open/);
});
test('la confirmación sirve 20 minutos para agenda y sincronización; cancelar nunca se recuerda',async({page},info)=>{
  const state=await setup(page);await page.locator('#hoursCalendarBtn').click();
  const prompt=page.getByRole('dialog',{name:'VPN de Kairo',exact:true});
  await expect(prompt).toContainText('Para realizar esta operación es necesario que la VPN esté activada.');
  await expect(page.getByRole('dialog',{name:'Programación',exact:true})).toHaveCount(0);
  for(const width of [320,440]){await page.setViewportSize({width,height:880});expect(await prompt.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);}
  await prompt.screenshot({path:info.outputPath('aviso-vpn.png'),animations:'disabled'});
  await page.screenshot({path:info.outputPath('vpn-sobre-home.png'),animations:'disabled'});
  await prompt.getByRole('button',{name:'Cancelar',exact:true}).click();
  expect(state.commands).toEqual([]);expect(state.agenda).toBe(0);
  expect(await page.evaluate(()=>kairoVpnConfirmed())).toBe(false);
  await page.locator('#hoursCalendarBtn').click();await expect(prompt).toBeVisible();
  await prompt.getByRole('button',{name:'Ya está activada',exact:true}).click();
  await expect(page.frameLocator('iframe[title="Programación de Kairo"]').getByRole('heading')).toHaveText('Agenda de prueba');
  await closeAgenda(page);
  expect(await page.evaluate(()=>ensureKairoConnection())).toBe(true);
  await page.clock.fastForward(19*60*1000);await expect.poll(()=>page.evaluate(()=>kairoVpnConfirmed())).toBe(true);
  await page.reload();await expect.poll(()=>page.evaluate(()=>kairoVpnConfirmed())).toBe(true);
  await page.clock.fastForward(60*1000);expect(await page.evaluate(()=>kairoVpnConfirmed())).toBe(false);
  await page.locator('#hoursCalendarBtn').click();await expect(prompt).toBeVisible();
  await prompt.getByRole('button',{name:'Cancelar',exact:true}).click();
  expect(state.commands).toEqual([]);
});

test('Activar VPN manda una sola orden; DNS invalida la confirmación y no se consulta ningún registro local',async({page})=>{
  const state=await setup(page);const local=[];
  await page.route('http://127.0.0.1:8080/**',r=>{local.push(r.request().url());return r.abort();});
  await page.locator('#hoursCalendarBtn').click();
  const prompt=page.getByRole('dialog',{name:'VPN de Kairo'});
  await prompt.getByRole('button',{name:'Activar VPN',exact:true}).click();
  await expect(prompt).toContainText('Esperando a que la VPN conecte con Kairo');
  expect(state.agenda).toBe(0);expect(await page.evaluate(()=>kairoVpnConfirmed())).toBe(false);
  await page.clock.fastForward(5000);expect(state.commands).toEqual([trigger+'/conexion_kairo']);expect(state.agenda).toBe(0);
  state.reachable=true;await page.clock.fastForward(1500);
  await expect(prompt).toHaveCount(0);expect(state.commands).toEqual([trigger+'/conexion_kairo']);
  await expect.poll(()=>page.evaluate(()=>kairoVpnConfirmed())).toBe(true);
  await closeAgenda(page);
  await page.clock.fastForward(9000);
  await page.evaluate(()=>requestMobileMode('dns',mobileWebhookBase(appStorage.getItem('excelia-alarm-url'))));
  expect(await page.evaluate(()=>kairoVpnConfirmed())).toBe(false);expect(local).toEqual([]);
  await page.locator('#hoursCalendarBtn').click();await expect(prompt).toBeVisible();await prompt.getByRole('button',{name:'Cancelar',exact:true}).click();
});

test('confirmar no oculta errores de activación ni sirve para otra conexión',async({page})=>{
  const state=await setup(page);state.reject=true;await page.locator('#hoursCalendarBtn').click();
  const prompt=page.getByRole('dialog',{name:'VPN de Kairo'});
  await prompt.getByRole('button',{name:'Activar VPN',exact:true}).click();
  await expect(prompt).toContainText('Esperando a que la VPN conecte con Kairo');
  await page.clock.fastForward(27000);
  await expect(prompt).toContainText('No se ha podido confirmar el acceso a Kairo');expect(await page.evaluate(()=>kairoVpnConfirmed())).toBe(false);expect(state.agenda).toBe(0);
  await prompt.getByRole('button',{name:'Ya está activada',exact:true}).click();
  await closeAgenda(page);
  await page.evaluate(()=>{const d=invoiceData();d.config.kairoUrl='https://another.test.ts.net/facturas/';invoiceSave(d);});
  expect(await page.evaluate(()=>kairoVpnConfirmed())).toBe(false);
});

test('cancelar la espera detiene las comprobaciones y una agenda fallida ofrece reintento sin pantalla rota',async({page})=>{
  const state=await setup(page);await page.locator('#hoursCalendarBtn').click();
  const prompt=page.getByRole('dialog',{name:'VPN de Kairo'});
  await prompt.getByRole('button',{name:'Activar VPN',exact:true}).click();
  await expect(prompt).toContainText('Esperando a que la VPN conecte con Kairo');
  await prompt.getByRole('button',{name:'Cancelar',exact:true}).click();
  await page.clock.fastForward(30000);const checks=state.checks;await page.clock.fastForward(30000);
  expect(state.checks).toBe(checks);expect(state.agenda).toBe(0);expect(await page.evaluate(()=>kairoVpnConfirmed())).toBe(false);
  state.brokenAgenda=true;await page.locator('#hoursCalendarBtn').click();
  await prompt.getByRole('button',{name:'Ya está activada',exact:true}).click();
  const calendar=page.getByRole('dialog',{name:'Programación',exact:true});
  await expect(calendar).toContainText('Abriendo Kairo');await page.clock.fastForward(16000);
  await expect(calendar).toContainText('No se ha podido abrir Kairo');await expect(calendar.locator('iframe')).toHaveCount(0);
  state.brokenAgenda=false;await calendar.getByRole('button',{name:'Reintentar'}).click();
  await expect(page.frameLocator('iframe').getByRole('heading')).toHaveText('Agenda de prueba');
  await closeAgenda(page);await expect(calendar).toHaveCount(0);await expect(page.locator('#hoursCalendarBtn')).toBeFocused();
});

test('vinculación privada sin Kairo permite los modos y rechaza orígenes ajenos',async({page})=>{
  const state=await setup(page,{linked:false,configured:false});await page.locator('#menuBtn').click();
  await page.locator('#settingsConnection [data-mobile-mode=dns]').click();const dialog=page.getByRole('dialog',{name:'Conexión del móvil'});
  const input=dialog.getByLabel('Enlace de MacroDroid');
  await input.fill('https://trigger.macrodroid.com.ejemplo.invalid/device');await dialog.getByRole('button',{name:/Guardar para/}).click();
  await expect(dialog.getByRole('button',{name:'OFF',exact:true})).toBeDisabled();
  await input.fill(trigger+'/conexion_normal');await dialog.getByRole('button',{name:/Guardar para/}).click();
  await expect(input).toBeHidden();await expect(dialog).not.toContainText('synthetic-test-device');
  expect(await page.evaluate(()=>localStorage.getItem('excelia-alarm-url'))).toBe(trigger);
  await dialog.getByRole('button',{name:'DNS AdGuard'}).click();await expect(dialog.getByRole('status')).toContainText('solicitud enviada');
  expect(state.commands).toEqual([trigger+'/conexion_adguard']);
});

test('los modos de Ajustes tienen fondo visible y contraste en todos los temas; Atrás recupera Ajustes',async({page})=>{
 await setup(page,{linked:false});
 const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(v=>+v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 for(const width of [320,440]){
  await page.setViewportSize({width,height:880});
  for(const theme of ['light','dark','grey']){
   await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
   await page.locator('#menuBtn').click();
   for(const mode of ['vpn','dns']){
    const button=page.locator('#settingsConnection [data-mobile-mode='+mode+']');await expect(button).toBeVisible();
    const styles=await button.evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
    expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');
    const a=luminance(styles.background),b=luminance(styles.color);expect((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toBeGreaterThanOrEqual(4.5);
   }
   const button=page.locator('#settingsConnection [data-mobile-mode=vpn]');
   await button.focus();await page.keyboard.press('Enter');
   const dialog=page.getByRole('dialog',{name:'Conexión del móvil'});await expect(dialog).toBeVisible();
   await dialog.getByRole('button',{name:'Volver',exact:true}).click();await expect(page.locator('#dataMenu')).toHaveClass(/open/);await expect(button).toBeFocused();
   await page.locator('#menuBtn').click();
  }
 }
});

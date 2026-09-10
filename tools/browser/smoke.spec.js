const {test,expect}=require('@playwright/test');
test('mobile: menus, cumpleanos, guardado y deshacer',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Persona de prueba',day:22,month:8}]));});
 await page.goto('/');await page.locator('#menuBtn').click();await page.locator('#themeBtn').click();await page.locator('#menuBtn').click();
 await page.locator('#bdayBtn').click();await page.locator('#bdViewList').click();await page.locator('.bday-list-item').first().click();await page.locator('#bdDEdit').click();
 await page.locator('#bdFName').fill('Nombre editado');await page.locator('#bdFSave').click();await expect(page.getByRole('button',{name:'Deshacer',exact:true})).toBeVisible();await page.getByRole('button',{name:'Deshacer',exact:true}).click();
 await expect(page.locator('#bdayContent')).toContainText('Persona De Prueba');expect(errors).toEqual([]);
});
test('publicacion no incluye datos privados ni herramientas',async({request})=>{for(const url of ['/CLAUDE.md','/tools/fixture.json','/horas-excelia-backup-test.json'])expect((await request.get(url)).status()).toBe(404);});

test('backup: importar, repetir sin duplicar y rechazar datos invalidos',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');
 const backup={days:{},events:[{id:'one',kind:'puntual',type:'Otros',title:'Evento de prueba',start:'2026-09-10',end:'2026-09-10',color:'#123456'}]};
 async function upload(data){await page.locator('#menuBtn').click();await page.locator('#importAllBtn').click();await page.locator('#importAllFile').setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.locator('.imp-mode-btn').first().click();}
 await upload(backup);await upload(backup);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-events-v1')).length)).toBe(1);
 await upload({days:{},events:[{...backup.events[0],start:'2026-02-31'}]});
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-events-v1'))[0].start)).toBe('2026-09-10');
});
test('actualizar desde menu recarga, sin consumir el click al cerrar',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');
 await page.evaluate(()=>navigator.serviceWorker.dispatchEvent(new MessageEvent('message',{data:{type:'SW_UPDATED',version:'test'}})));
 await page.locator('#menuBtn').click();await expect(page.locator('#swUpdBtn')).toBeVisible();
 await Promise.all([page.waitForEvent('load'),page.locator('#swUpdBtn').click()]);
 await expect(page.locator('#dataMenu')).not.toHaveClass(/open/);
});

test('migracion privada desde cache anterior sin sobrescribir datos locales',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.evaluate(async()=>{
   const old=await caches.open('horas-excelia-legacy-test');
   const payload=btoa(JSON.stringify([{name:'Ejemplo legado',day:1,month:1}]));
   await old.put('/index.html',new Response("var TO='ejemplo@example.invalid';var CC='';var AUTHOR_NAME='Prueba';var BDAYS_RAW='"+payload+"';"));
   await migrateLegacyDefaults();
 });
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-mail-config-v1')).to)).toBe('ejemplo@example.invalid');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-bdays-v1'))[0].name)).toBe('Ejemplo legado');
});

test('ajustes bloqueados, guardado explicito y backup con conexiones',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');
 await page.locator('#menuBtn').click();
 for(const id of ['mailToLocal','mailCcLocal','mailNameLocal','macroAlarmUrlMenu'])await expect(page.locator('#'+id)).toHaveAttribute('readonly','');
 await page.locator('#editConnectionsBtn').click();
 await page.locator('#mailToLocal').fill('test@example.invalid');await page.locator('#mailNameLocal').fill('Prueba');
 await page.locator('#macroAlarmUrlMenu').fill('https://trigger.macrodroid.com/TEST');
 expect(await page.evaluate(()=>localStorage.getItem('excelia-mail-config-v1'))).toBeNull();
 await page.locator('#editConnectionsBtn').click();await expect(page.locator('#mailToLocal')).toHaveAttribute('readonly','');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportAllBtn').click()]);
 const data=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));
 expect(data.mailConfig.to).toBe('test@example.invalid');expect(data.macroUrl).toBe('https://trigger.macrodroid.com/TEST');
 await page.evaluate(()=>{localStorage.removeItem('excelia-mail-config-v1');localStorage.removeItem('excelia-alarm-url');});
 await page.evaluate(d=>applyFullImport(d,'replace'),data);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-mail-config-v1')).to)).toBe('test@example.invalid');
 expect(await page.evaluate(()=>localStorage.getItem('excelia-alarm-url'))).toBe(data.macroUrl);
});

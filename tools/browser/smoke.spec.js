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

test('Bodas: configurar pack, duracion, salas y exportar catalogos',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  localStorage.setItem('excelia-bodas-v1',JSON.stringify([{id:'p2',name:'Pareja prueba',contracted:2,weddingDate:'2030-01-01',color:'#123456'}]));
  localStorage.setItem('excelia-events-v1',JSON.stringify([1,2,3].map(i=>({id:'cls'+i,kind:'puntual',type:'Ensayos boda',title:'Ensayo',start:'2020-01-0'+i,end:'2020-01-0'+i,color:'#123456',boda:{coupleId:'p2',time:'18:00',place:'casa'}}))));
 });
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewBodas').click();await page.locator('[data-bsub="stats"]').click();
 await expect(page.locator('#eventsContent')).toContainText('1 pareja con clases extras');
 await page.locator('#bodaConfigBtn').click();
 await expect(page.locator('[data-cfg-delete="packs"][data-id="pack-2"]')).toHaveCount(0);
 await expect(page.locator('[data-cfg-delete="places"][data-id="casa"]')).toHaveCount(0);
 await page.locator('[data-cfg-edit="packs"][data-id="pack-2"]').click();await page.locator('#bodaCatalogNumber').fill('6');await page.locator('#bodaCatalogSave').click();
 expect(await page.evaluate(()=>BODA_COUPLES[0].packClasses)).toBe(2);
 await page.locator('[data-cfg-add="packs"]').click();await page.locator('#bodaCatalogName').fill('Pack tres');await page.locator('#bodaCatalogNumber').fill('3');await page.locator('#bodaCatalogSave').click();
 await expect(page.locator('#bodaConfigOv')).toContainText('Pack tres');
 await page.locator('[data-cfg-add="places"]').click();await page.locator('#bodaCatalogName').fill('Sala nueva');await page.locator('#bodaCatalogDesc').fill('Sala de pruebas');await page.locator('#bodaCatalogSave').click();
 await expect(page.locator('#bodaConfigOv')).toContainText('Sala de pruebas');
 await page.locator('[data-default="dur-20"]').check();
 await page.locator('[data-cfg-edit="places"][data-id="casa"]').click();await page.locator('#bodaCatalogName').fill('Mi casa');await page.locator('#bodaCatalogDesc').fill('Descripcion modificada');await page.locator('#bodaCatalogSave').click();
 await page.locator('#bodaConfigClose').click();await page.locator('[data-bsub="clases"]').click();await page.locator('#bodaAddClass').click();
 await expect(page.locator('#bodaFormDuration')).toHaveValue('dur-20');
 await page.locator('#bodaFormDia').fill('2030-01-05');await page.locator('#bodaFormSave').click();
 expect(await page.evaluate(()=>EVENTS.find(e=>e.start==='2030-01-05').boda.duration)).toBe(20);
 await page.evaluate(()=>openBodaClaseForm(EVENTS.find(e=>e.id==='cls1')));
 await page.locator('#bodaFormDuration').selectOption('dur-20');await expect(page.locator('#bodaFormOv')).toContainText('18:20');await page.locator('#bodaFormSave').click();
 expect(await page.evaluate(()=>EVENTS.find(e=>e.id==='cls1').boda.duration)).toBe(20);
 await page.locator('#eventsContent').getByRole('button',{name:'Inicio',exact:true}).click();await page.locator('#menuBtn').click();
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportAllBtn').click()]);const data=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));
 expect(data.bodaConfig.defaultDurationId).toBe('dur-20');expect(data.bodaConfig.places.find(p=>p.k==='casa').n).toBe('Mi casa');
 await page.evaluate(d=>applyFullImport(d,'replace'),data);expect(await page.evaluate(()=>BODA_CONFIG.defaultDurationId)).toBe('dur-20');expect(errors).toEqual([]);
});

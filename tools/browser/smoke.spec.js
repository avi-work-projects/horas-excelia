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
 await expect(page.locator('#mailToLocal')).not.toBeVisible();await expect(page.locator('#macroAlarmUrlMenu')).not.toBeVisible();
 await page.locator('summary').filter({hasText:'Correo de horas'}).click();await expect(page.locator('#mailToLocal')).toBeVisible();
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
 await page.locator('[data-teacher-name=angel]').fill('Profesor A');await page.locator('[data-teacher-name=celia]').fill('Profesora B');await page.locator('#bodaSaveTeacherNames').click();
 await page.locator('[data-default-place=sala]').check();expect(await page.evaluate(()=>BODA_PLACE_DEFAULT)).toBe('sala');
 await expect(page.locator('[data-cfg-delete="packs"][data-id="pack-2"]')).toHaveCount(0);
 await expect(page.locator('[data-cfg-delete="places"][data-id="casa"]')).toHaveCount(0);
 await page.locator('[data-cfg-edit="packs"][data-id="pack-2"]').click();await page.locator('#bodaCatalogNumber').fill('6');await page.locator('#bodaCatalogSave').click();
 expect(await page.evaluate(()=>BODA_COUPLES[0].packClasses)).toBe(2);
 await page.locator('[data-cfg-add="packs"]').click();await page.locator('#bodaCatalogName').fill('Pack tres');await page.locator('#bodaCatalogNumber').fill('3');await page.locator('#bodaCatalogSave').click();
 await expect(page.locator('#bodaConfigContent')).toContainText('Pack tres');
 await page.locator('[data-cfg-add="places"]').click();await page.locator('#bodaCatalogName').fill('Sala nueva');await page.locator('#bodaCatalogDesc').fill('Sala de pruebas');await page.locator('#bodaCatalogSave').click();
 await expect(page.locator('#bodaConfigContent')).toContainText('Sala de pruebas');
 await page.locator('[data-default="dur-20"]').check();
 await page.locator('[data-cfg-edit="places"][data-id="casa"]').click();await page.locator('#bodaCatalogName').fill('Mi casa');await page.locator('#bodaCatalogDesc').fill('Descripcion modificada');await page.locator('#bodaCatalogSave').click();
 await page.locator('[data-bsub="clases"]').click();await page.locator('#bodaAddClass').click();
 await expect(page.locator('#bodaFormDuration')).toContainText('20 min');
 await expect(page.locator('.ev-bficha #bodaFormDuration')).toHaveCount(1);await expect(page.locator('#bodaFormOv .ev-bficha')).toHaveCount(3);await expect(page.locator('#bodaFormTeachers')).toContainText('Profesor A y Profesora B');
 expect(await page.locator('#bodaFormDuration').evaluate(el=>!!(document.querySelector('[data-fcampo=pareja]').compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
 await page.locator('#bodaFormDia').fill('2030-01-05');await page.locator('#bodaFormSave').click();
 expect(await page.evaluate(()=>EVENTS.find(e=>e.start==='2030-01-05').boda.duration)).toBe(20);
 await page.evaluate(()=>openBodaClaseForm(EVENTS.find(e=>e.id==='cls1')));
 await page.locator('#bodaFormTeachers').click();await page.locator('[data-teacher=angel]').uncheck();await page.locator('[data-teacher=angel]').check();await page.locator('[data-teacher=substitute]').check();await expect(page.locator('[data-teacher=celia]')).not.toBeChecked();await expect(page.locator('[data-teacher=angel]')).toBeChecked();
 await page.locator('[data-teacher=celia]').click();await expect(page.locator('[data-teacher=celia]')).not.toBeChecked();
 await page.locator('[data-teacher=substitute]').uncheck();await page.locator('[data-teacher=angel]').click();await expect(page.locator('[data-teacher=angel]')).toBeChecked();await page.locator('[data-teacher=substitute]').check();await page.locator('#bodaTeacherName').fill('Profesora prueba');await page.locator('#bodaTeachersSave').click();
 await expect(page.locator('#bodaFormTeachers')).toContainText('Profesor A y Sustituto');
 await page.locator('#bodaFormDuration').click();await page.locator('[data-duration=dur-20]').click();await expect(page.locator('#bodaFormOv')).toContainText('18:20');await page.locator('#bodaFormSave').click();
 expect(await page.evaluate(()=>EVENTS.find(e=>e.id==='cls1').boda.duration)).toBe(20);
 await page.locator('#eventsContent').getByRole('button',{name:'Inicio',exact:true}).click();await page.locator('#menuBtn').click();
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportAllBtn').click()]);const data=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));
 expect(data.events.find(e=>e.id==='cls1').boda.teachers).toEqual({celia:false,angel:true,substitute:'Profesora prueba',lastSelected:'angel'});
 expect(data.bodaConfig.teacherNames).toEqual({angel:'Profesor A',celia:'Profesora B'});expect(data.bodaConfig.defaultPlace).toBe('sala');
 expect(data.bodaConfig.defaultDurationId).toBe('dur-20');expect(data.bodaConfig.places.find(p=>p.k==='casa').n).toBe('Mi casa');
 await page.evaluate(d=>applyFullImport(d,'replace'),data);expect(await page.evaluate(()=>BODA_CONFIG)).toEqual(data.bodaConfig);expect(errors).toEqual([]);
});

test('Hoy apunta al mes y las cinco subpestanas de Bodas admiten swipe',async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-bdays-v1',JSON.stringify(Array.from({length:60},(_,m)=>({name:'Persona '+m,day:1+Math.floor(m/12),month:m%12+1}))));});
 await page.goto('/');await page.locator('#bdayBtn').click();await page.locator('#bdViewList').click();
 await page.evaluate(()=>document.querySelector('#bdayOverlay .sy-body').scrollTop=0);
 await page.locator('#bdVipAll').click();
 expect(await page.evaluate(()=>{var body=document.querySelector('#bdayOverlay .sy-body'),sec=body.querySelector('[data-month="'+new Date().getMonth()+'"]');return Math.abs(sec.getBoundingClientRect().top-body.getBoundingClientRect().top-8)<2;})).toBe(true);
 await page.locator('#bdayContent').getByRole('button',{name:'Eventos',exact:true}).click();await page.locator('#evViewBodas').click();await page.locator('[data-bsub="stats"]').click();
 async function swipe(left){await page.locator('#eventsOverlay .boda-sec').evaluate((el,left)=>{el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target:el,clientX:left?300:80,clientY:400})]}));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target:el,clientX:left?80:300,clientY:400})]}));},left);}
 await swipe(true);await expect(page.locator('#bodaConfigContent')).toBeVisible();await expect(page.locator('#bodaConfigWrap')).toHaveCount(0);
 await swipe(false);await expect(page.locator('[data-bsub="stats"]')).toHaveClass(/active/);
 await swipe(false);await expect(page.locator('[data-bsub="calendario"]')).toHaveClass(/active/);
 await swipe(false);await expect(page.locator('[data-bsub="parejas"]')).toHaveClass(/active/);
 await swipe(false);await expect(page.locator('[data-bsub="clases"]')).toHaveClass(/active/);
 await expect(page.locator('[data-bmode="editar"]')).not.toHaveClass(/action-edit/);
 const positions=[];
 for(const name of ['clases','parejas','calendario','stats','config']){
  await page.locator('[data-bsub="'+name+'"]').click();
  positions.push(await page.locator('.boda-sticky-hd [data-bsub]').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];})));
 }
 for(const row of positions)row.forEach((r,i)=>r.forEach((v,j)=>expect(Math.abs(v-positions[0][i][j])).toBeLessThan(1)));

});

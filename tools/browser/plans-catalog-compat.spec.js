const {test,expect}=require('@playwright/test');
const prefs=[{type:'Cena',time:'07:20'},{type:'Baile',time:'10:35'},{type:'Comida',time:null},{type:'Montaña',time:'19:45'}];
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00+02:00'));
 await page.addInitScript(prefs=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');if(!localStorage.getItem('excelia-plan-order-v1'))localStorage.setItem('excelia-plan-order-v1',JSON.stringify(prefs));if(!localStorage.getItem('excelia-events-v1'))localStorage.setItem('excelia-events-v1',JSON.stringify([{id:'dance-old',type:'Baile',kind:'puntual',title:'Mi plan anterior',note:'Nota anterior',start:'2026-08-22',end:'2026-08-22',color:'#e03131'}]));},prefs);await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();
});
for(const width of [320,400,440])test('Cinco planes nuevos, bailar renombrado y creación persistida '+width,async({page},info)=>{
 await page.setViewportSize({width,height:880});await page.locator('#evAdd').click();await page.locator('[data-picker="plans"]').click();
 await expect(page.locator('#evPlanPickerOv [data-type="Salir a bailar"]')).toHaveCount(1);await expect(page.locator('#evPlanPickerOv [data-type="Baile"]')).toHaveCount(0);
 for(const type of ['Fiesta','Plan exterior','Navidad','Torneo','Fútbol']){
  const option=page.locator('#evPlanPickerOv [data-type="'+type+'"]');await option.scrollIntoViewIfNeeded();await expect(option).toBeInViewport();await expect(option.locator('svg')).toHaveCount(1);expect((await option.boundingBox()).height).toBeGreaterThanOrEqual(80);await option.click();await page.locator('#evPlanConfirm').click();
  await expect(page.locator('#evFTitle')).toHaveValue(type);await expect(page.locator('.ev-kind-picker')).toHaveAttribute('data-cur-type',type);await page.locator('[data-picker="plans"]').click();
 }
 await page.locator('#evPlanPickerOv [data-type="Fútbol"]').scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('planes-nuevos-'+width+'.png'),animations:'disabled'});
 const frame=await page.locator('.ev-plan-sheet').evaluate(el=>el.scrollWidth<=el.clientWidth);expect(frame).toBe(true);await expect(page.locator('#evPlanConfirm')).toBeInViewport();
 await page.locator('#evPlanPickerOv [data-type="Navidad"]').click();await page.locator('#evPlanConfirm').click();await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);await page.reload();
 const created=await page.evaluate(()=>EVENTS.find(ev=>ev.type==='Navidad'));expect(created).toMatchObject({kind:'puntual',title:'Navidad'});expect(created.time).toBeUndefined();
 expect(await page.evaluate(()=>appStorage.getItem(EV_PLAN_ORDER_KEY))).toBe(JSON.stringify(prefs));
});
test('El orden previo, Baile y su hora sobreviven a guardar, recargar e importar',async({page})=>{
 const check=async()=>{const rows=await page.evaluate(()=>evPlanOrderData().map(({type,time})=>({type,time})));expect(rows.slice(0,prefs.length)).toEqual(prefs.map(row=>({...row,type:row.type==='Baile'?'Salir a bailar':row.type})));for(const type of ['Fiesta','Plan exterior','Navidad','Torneo','Fútbol'])expect(rows.find(row=>row.type===type).time).toBeNull();};
 await check();await page.locator('#evUpcomingOrder').click();await expect(page.locator('[data-order-type="Salir a bailar"] input')).toHaveValue('10:35');await page.locator('#evOrderSave').click();await page.reload();await check();
 await page.evaluate(()=>{openEvents();openEvForm(EVENTS.find(ev=>ev.id==='dance-old'));});await expect(page.locator('.ev-kind-picker')).toHaveAttribute('data-cur-type','Salir a bailar');await expect(page.locator('#evFTitle')).toHaveValue('Mi plan anterior');await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>EVENTS.find(ev=>ev.id==='dance-old'))).toMatchObject({id:'dance-old',title:'Mi plan anterior',note:'Nota anterior',type:'Salir a bailar',start:'2026-08-22'});
 await page.evaluate(prefs=>applyFullImport({version:7,planOrder:prefs},'merge'),prefs);await page.reload();await check();
});

for(const width of [320,400,440])test('Plan romántico desde calendario: vista previa, cancelar y persistencia '+width,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:880});
 await page.locator('#evViewCal').click();await page.locator('.ev-cell[data-ds="2026-08-24"]').click();
 await expect(page.locator('#evFStart')).toHaveValue('2026-08-24');
 await expect(page.locator('#evFRomantic')).not.toBeChecked();
 await page.locator('[data-picker="plans"]').click();
 const picker=page.locator('#evPlanPickerOv'),sheet=picker.locator('.ev-plan-sheet');
 await expect(picker.locator('[data-type="¡Sorpresa!"]')).toHaveCount(1);
 await expect(picker.locator('[data-type="Plan romántico"]')).toHaveCount(0);
 await expect(picker.locator('.ev-romantic-badge')).toHaveCount(0);
 await picker.locator('[data-type="Comida"]').click();
 const box=await sheet.boundingBox();
 if(width===400)await page.screenshot({path:'test-results/planes-sin-corazon-400.png',animations:'disabled'});
 await picker.locator('#evPlanRomantic').check();
 const types=await picker.locator('[data-type]').count();
 await expect(picker.locator('.ev-romantic-badge')).toHaveCount(types);
 expect(await sheet.boundingBox()).toEqual(box);
 expect(await sheet.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await expect(picker.locator('#evPlanConfirm')).toBeInViewport();
 await page.screenshot({path:'test-results/planes-romanticos-'+width+'.png',animations:'disabled'});
 await picker.locator('[data-type="Fútbol"]').scrollIntoViewIfNeeded();
 await page.screenshot({path:'test-results/planes-simbolos-'+width+'.png',animations:'disabled'});
 await picker.locator('#evPlanCancel').click();
 await expect(page.locator('#evFRomantic')).not.toBeChecked();
 await page.locator('[data-picker="plans"]').click();
 await expect(picker.locator('#evPlanRomantic')).not.toBeChecked();
 await picker.locator('#evPlanRomantic').check();
 await picker.locator('[data-type="Fútbol"]').click();await picker.locator('#evPlanConfirm').click();
 await expect(page.locator('#evFRomantic')).toBeChecked();
 await expect(page.locator('.ev-quick-selection [data-type="Fútbol"] .ev-romantic-badge')).toHaveCount(1);
 await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 const created=await page.evaluate(()=>EVENTS.find(ev=>ev.type==='Fútbol'));
 expect(created).toMatchObject({romantic:true,start:'2026-08-24',title:'Fútbol'});
 const marker=page.locator('.ev-cell[data-ds="2026-08-24"] [data-id="'+created.id+'"]');
 await expect(marker.locator('.ev-romantic-badge')).toHaveCount(1);
 if(width===400)await page.screenshot({path:'test-results/plan-romantico-calendario-400.png',animations:'disabled'});
 await marker.click();await expect(page.locator('#evDMarker .ev-romantic-badge')).toHaveCount(1);
 await page.locator('#evDClose').click();
 if(width===400){
  for(const view of ['#evViewAnnual','#evViewQuad','#evViewUpcoming']){
   await page.locator(view).click();await expect(page.locator('#eventsContent [data-id="'+created.id+'"] .ev-romantic-badge').first()).toBeVisible();
  }
 }
 await page.reload();expect(await page.evaluate(()=>EVENTS.find(ev=>ev.type==='Fútbol').romantic)).toBe(true);
 await page.evaluate(id=>{openEvents();openEvForm(EVENTS.find(ev=>ev.id===id));},created.id);
 await page.locator('#evFRomantic').uncheck();
 await expect(page.locator('[data-group="plans"] .ev-romantic-badge')).toHaveCount(0);
 await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(id=>EVENTS.find(ev=>ev.id===id).romantic,created.id)).toBeUndefined();
 await expect(page.locator('#eventsContent [data-id="'+created.id+'"] .ev-romantic-badge')).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('Plan romántico antiguo: Sorpresa con corazón, orden e importación sin perder datos',async({page})=>{
 const legacy={id:'old-romantic',kind:'puntual',type:'Plan romántico',title:'Título que conservo',note:'Nota que conservo',start:'2026-08-22',end:'2026-08-22',time:'17:30',color:'#e03131'};
 await page.evaluate(ev=>{EVENTS.push(ev);saveEvents();refreshEvents();},legacy);
 const stored=await page.evaluate(()=>appStorage.getItem('excelia-events-v1'));
 await page.evaluate(()=>openEvForm(EVENTS.find(ev=>ev.id==='old-romantic')));
 await expect(page.locator('.ev-kind-picker')).toHaveAttribute('data-cur-type','¡Sorpresa!');
 await expect(page.locator('#evFRomantic')).toBeChecked();
 await expect(page.locator('#evFTitle')).toHaveValue(legacy.title);
 await page.locator('#evFClose').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>appStorage.getItem('excelia-events-v1'))).toBe(stored);
 await page.evaluate(()=>openEvForm(EVENTS.find(ev=>ev.id==='old-romantic')));
 await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 const saved=await page.evaluate(()=>JSON.parse(appStorage.getItem('excelia-events-v1')).find(ev=>ev.id==='old-romantic'));
 expect(saved).toMatchObject({...legacy,type:'¡Sorpresa!',romantic:true,color:await page.evaluate(()=>evTypeColor('puntual','¡Sorpresa!'))});
 await page.evaluate(ev=>{EVENTS=[];saveEvents();applyFullImport({version:7,events:[ev]},'merge');},saved);
 await page.reload();expect(await page.evaluate(()=>EVENTS.find(ev=>ev.id==='old-romantic'))).toMatchObject(saved);
});

for(const width of [320,400,440])test('Interrogación, Ir a casa de y Hacer deporte: símbolos y guardado '+width,async({page})=>{
 await page.setViewportSize({width,height:880});await page.locator('#evAdd').click();
 await page.locator('[data-picker="plans"]').click();
 const picker=page.locator('#evPlanPickerOv');
 await expect(picker.locator('[data-type="Copas"]')).toHaveCount(0);
 await expect(picker.locator('[data-type="Ir a casa de"]')).toHaveCount(1);
 await picker.locator('[data-type="¡Sorpresa!"]').click();
 await page.screenshot({path:'test-results/planes-interrogacion-casa-'+width+'.png',animations:'disabled'});
 await picker.locator('#evPlanRomantic').check();
 await expect(picker.locator('[data-type="Ir a casa de"] .ev-romantic-badge')).toHaveCount(1);
 await picker.locator('[data-type="Hacer deporte"]').scrollIntoViewIfNeeded();
 await expect(picker.locator('[data-type="Hacer deporte"] .ev-romantic-badge')).toHaveCount(1);
 await page.screenshot({path:'test-results/planes-deporte-'+width+'.png',animations:'disabled'});
 await expect(picker.locator('#evPlanConfirm')).toBeInViewport();
 await picker.locator('[data-type="Hacer deporte"]').click();await picker.locator('#evPlanConfirm').click();
 await expect(page.locator('#evFTitle')).toHaveValue('Hacer deporte');
 await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 await page.reload();expect(await page.evaluate(()=>EVENTS.find(ev=>ev.type==='Hacer deporte'))).toMatchObject({title:'Hacer deporte',romantic:true});
});
test('Copas antiguo conserva datos, corazón y orden al convertirse en Ir a casa de',async({page})=>{
 const legacy={id:'old-copas',kind:'puntual',type:'Copas',title:'Visita a una amiga',note:'Conservar',start:'2026-08-22',end:'2026-08-22',time:'22:30',color:'#9f62bc',romantic:true};
 const order=[{type:'Copas',time:'21:45'},{type:'Cena',time:'23:00'}];
 await page.evaluate(({legacy,order})=>{EVENTS.push(legacy);saveEvents();appStorage.setItem(EV_PLAN_ORDER_KEY,JSON.stringify(order));openEvForm(EVENTS.find(ev=>ev.id===legacy.id));},{legacy,order});
 await expect(page.locator('.ev-kind-picker')).toHaveAttribute('data-cur-type','Ir a casa de');
 await expect(page.locator('#evFRomantic')).toBeChecked();
 await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);await page.reload();
 expect(await page.evaluate(()=>EVENTS.find(ev=>ev.id==='old-copas'))).toMatchObject({...legacy,type:'Ir a casa de'});
 expect(await page.evaluate(()=>evPlanOrderData().slice(0,2).map(({type,time})=>({type,time})))).toEqual([{type:'Ir a casa de',time:'21:45'},{type:'Cena',time:'23:00'}]);
 expect(await page.evaluate(()=>appStorage.getItem(EV_PLAN_ORDER_KEY))).toBe(JSON.stringify(order));
 expect(await page.evaluate(()=>evPlanOrderData().find(row=>row.type==='Hacer deporte').time)).toBeNull();
 await page.evaluate(ev=>{EVENTS=[];saveEvents();applyFullImport({version:7,events:[ev]},'merge');},legacy);
 await page.reload();expect(await page.evaluate(()=>[getEvType(EVENTS[0]),evIsRomantic(EVENTS[0])])).toEqual(['Ir a casa de',true]);
});

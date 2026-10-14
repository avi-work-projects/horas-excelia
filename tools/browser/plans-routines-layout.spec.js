const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-14T12:00:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');await page.evaluate(()=>{RUTINAS=[{id:'fixed',name:'Pádel',icon:'padel',color:'#a3e635',start:'2026-09-01',weekDays:[1,5],time:'15:00',dur:60,weeks:{},skips:{'2026-10-12':true},extraSessions:[]},{id:'flex',name:'Baile flexible',icon:'baile',color:'#e03131',start:'2026-09-01',weekDays:[],time:'18:00',dur:60,weeks:{},skips:{},flex:{period:'week',target:2,weeklyTarget:2,sessions:{}}}];saveRutinas();});
 await page.locator('#eventsBtn').click();await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);await page.locator('#eventsOverlay').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
});
test('cumpleaños: VIP a la izquierda, Añadir centrado y configuración a la derecha sin marco',async({page},info)=>{
 await page.locator('#evUpBirthdays').click();await expect(page.locator('#evBdayAdd')).toBeVisible();
 for(const width of [320,400,440]){
  await page.setViewportSize({width,height:880});
  const geometry=await page.locator('.ev-up-filters').evaluate(el=>{const vip=el.querySelector('.bday-up-vip').getBoundingClientRect(),add=el.querySelector('#evBdayAdd').getBoundingClientRect(),gear=el.querySelector('#evUpcomingOrder').getBoundingClientRect();return {vip:vip.left,add:add.left+add.width/2,gear:gear.left,edge:gear.right};});
  expect(geometry.vip).toBeLessThan(30);expect(Math.abs(geometry.add-width/2)).toBeLessThan(1);expect(geometry.gear).toBeGreaterThan(width/2+45);expect(geometry.edge).toBeLessThan(width);
  const gear=page.locator('#evUpcomingOrder');await expect(gear).toHaveCSS('border-top-width','0px');await expect(gear).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  const colors=await gear.evaluate(el=>{const probe=document.createElement('i');probe.style.color='var(--upcoming-text)';el.appendChild(probe);const actual=getComputedStyle(el).color,accent=getComputedStyle(probe).color;probe.remove();return {actual,accent};});expect(colors.actual).toBe(colors.accent);
  await page.screenshot({path:info.outputPath('cumpleanos-'+width+'.png'),animations:'disabled'});
 }
 await page.locator('#evUpcomingOrder').click();await expect(page.locator('.ev-order-sheet')).toBeVisible();
});
test('orden móvil: descripción separada, controles completos y cabecera estable',async({page},info)=>{
 await page.locator('#evUpcomingOrder').click();
 for(const width of [320,400,440]){
  await page.setViewportSize({width,height:880});
  const bounds=await page.locator('.ev-order-sheet').evaluate(el=>{const header=el.querySelector('header').getBoundingClientRect(),note=el.querySelector('.ev-order-note').getBoundingClientRect(),list=el.querySelector('.ev-order-list').getBoundingClientRect();return {gap:note.top-header.bottom,overflow:el.querySelector('.ev-order-list').scrollWidth-list.width,buttons:Array.from(el.querySelectorAll('[data-order-drag],input')).every(button=>{const r=button.getBoundingClientRect();return r.left>=list.left&&r.right<=list.right;})};});
  expect(bounds.gap).toBeGreaterThanOrEqual(12);expect(bounds.overflow).toBeLessThanOrEqual(1);expect(bounds.buttons).toBe(true);
  await page.screenshot({path:info.outputPath('orden-'+width+'.png'),animations:'disabled'});
 }
 await page.locator('.ev-order-list').evaluate(el=>el.scrollTop=el.scrollHeight);await expect(page.locator('#evOrderClose')).toBeInViewport();await expect(page.locator('#evOrderSave')).toBeInViewport();
});
for(const mode of ['mouse','touch'])test('orden por arrastre '+mode+': ajusta la hora y persiste sin alterar eventos reales',async({page},info)=>{
 await page.locator('#evUpcomingOrder').click();const row=page.locator('[data-order-type="Desayunar"]');await expect(row).toBeVisible();await page.locator('.ev-order-sheet').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));const grip=await row.locator('[data-order-drag]').boundingBox(),target=await page.locator('[data-order-type="Carrera"]').boundingBox();
 const x=grip.x+grip.width/2,y=grip.y+grip.height/2,end=target.y+target.height-3;
 if(mode==='touch'){
  const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
  for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+(end-y)*i/8,id:1}]});
  await expect(page.locator('.task-drag-ghost')).toBeVisible();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,end,{steps:10});await expect(page.locator('.task-drag-ghost')).toBeVisible();await page.mouse.up();}
 await expect(page.locator('.task-drag-ghost')).toHaveCount(0);await expect(row.locator('input')).toHaveValue('10:00');
 expect(await page.evaluate(()=>EV_PLAN_ORDER_DRAFT.every((row,i,rows)=>!i||rows[i-1].time<=row.time))).toBe(true);
 await page.locator('#evOrderSave').click();await expect(page.locator('#evPlanOrderWrap')).toHaveCount(0);await page.reload();expect(await page.evaluate(()=>evPlanReferenceTime('Desayunar'))).toBe('10:00');
 expect(await page.evaluate(()=>{const ev={type:'Desayunar',kind:'puntual'},before={type:'Otros',kind:'puntual',time:'09:50'},after={type:'Otros',kind:'puntual',time:'10:10'};return [evCompareOrder(before,ev)<0,evCompareOrder(ev,after)<0];})).toEqual([true,true]);
});
test('arrastre cancelado y teclado mantienen el borrador y Guardar explícito',async({page})=>{
 await page.locator('#evUpcomingOrder').click();const grip=page.locator('[data-order-type="Desayunar"] [data-order-drag]');await expect(grip).toBeVisible();const original=await page.evaluate(()=>JSON.stringify(EV_PLAN_ORDER_DRAFT)),box=await grip.boundingBox();
 await page.mouse.move(box.x+10,box.y+10);await page.mouse.down();await page.mouse.move(box.x+10,box.y+130,{steps:8});await page.keyboard.press('Escape');await page.mouse.up();await expect(page.locator('.task-drag-ghost')).toHaveCount(0);expect(await page.evaluate(()=>JSON.stringify(EV_PLAN_ORDER_DRAFT))).toBe(original);
 await grip.focus();await page.keyboard.press('ArrowUp');expect(await page.locator('.ev-order-row').first().getAttribute('data-order-type')).toBe('Desayunar');expect(await page.evaluate(()=>appStorage.getItem(EV_PLAN_ORDER_KEY))).toBeNull();
 await page.locator('#evOrderClose').click();await expect(page.locator('#evPlanOrderWrap')).toHaveCount(0);await page.locator('#evUpcomingOrder').click();expect(await page.locator('.ev-order-row').first().getAttribute('data-order-type')).toBe('Montaña');
});
test('planes completos de un vistazo: barbacoa cuarta, tostadas en segunda fila y actividades sin marco',async({page},info)=>{
 await page.locator('#evAdd').click();
 for(const width of [320,400,440]){
  await page.setViewportSize({width,height:800});await page.locator('[data-picker="plans"]').click();
  expect((await page.locator('.ev-plan-options [data-type]').evaluateAll(els=>els.map(el=>el.dataset.type))).slice(0,8)).toEqual(['Comida','Tomar algo','Cena','Barbacoa','Desayunar','Brunch','Merendar','Cumpleaños']);
  expect(await page.locator('.ev-plan-options [data-type]').evaluateAll(es=>[es[11].dataset.type,es[15].dataset.type,es[22].dataset.type])).toEqual(['Baile','Cine','Ping pong']);
  for(const type of ['Salir a Correr','Pádel','Baile'])await expect(page.locator('#evPlanPickerOv [data-type="'+type+'"]')).toBeInViewport();
  expect(await page.locator('.ev-plan-options').evaluate(el=>el.scrollHeight-el.clientHeight)).toBeLessThanOrEqual(1);
  for(const type of ['Pádel','Baile'])await expect(page.locator('#evPlanPickerOv [data-type="'+type+'"] svg>rect[fill="#fff"]')).toHaveCount(0);
  await page.screenshot({path:info.outputPath('planes-'+width+'.png'),animations:'disabled'});await page.locator('#evPlanCancel').click();await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);
 }
 const group=page.locator('.ev-routines-active');await group.scrollIntoViewIfNeeded();expect((await group.boundingBox()).height).toBeLessThan(120);await page.screenshot({path:info.outputPath('rutinas-compactas.png'),animations:'disabled'});
});
test('Otros amarillo claro: paleta, color personalizado y forma actualizan las previsualizaciones',async({page},info)=>{
 await page.locator('#evAdd').click();const other=page.locator('#evFTypePicker [data-kind="puntual"][data-type="Otros"]');await other.click();await page.locator('#evFTitle').fill('Marcador de prueba');await expect(page.locator('#evFCpHex')).toHaveValue('#ffe066');await expect(other.locator('.ev-type-dot')).toHaveClass(/ev-type-dot-multi/);
  await page.locator('#evFCpWrap [data-hex="#1d4ed8"]').click();await expect(page.locator('#evFShapePicker .ev-shape-preview').first()).toHaveCSS('color','rgb(29, 78, 216)');await expect(other.locator('.ev-type-dot')).toHaveClass(/ev-type-dot-multi/);
 await page.locator('[data-shape="wave"]').click();await expect(page.locator('[data-shape="wave"] svg path')).not.toHaveCount(0);await page.locator('#evFCpHex').fill('#663399');await page.locator('#evFCpHex').press('Tab');await expect(page.locator('#evFShapePicker .ev-shape-preview').first()).toHaveCSS('color','rgb(102, 51, 153)');
 await page.locator('#evFCpNative').evaluate(el=>{el.value='#ff6b6b';el.dispatchEvent(new Event('input',{bubbles:true}));});await expect(other.locator('.ev-type-dot')).toHaveClass(/ev-type-dot-multi/);await page.screenshot({path:info.outputPath('otros-paleta.png'),animations:'disabled'});await other.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('otros-marcador.png'),animations:'disabled'});
 await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);expect(await page.evaluate(()=>EVENTS[0])).toMatchObject({type:'Otros',color:'#ff6b6b',shape:'wave'});
});
test('extra fija y recuperación: mismo marco con cuatro, cinco y seis semanas y con swipe',async({page},info)=>{
 await page.evaluate(()=>{_switchEvView('rutinas');refreshEvents(false);});await expect(page.locator('[data-rid="fixed"].rut-routine-card [data-rextra]')).toHaveCount(1);await page.locator('[data-rextra="fixed"]').click();
 await expect(page.locator('#rutRecoveryConfirm')).toBeInViewport();await page.locator('.rut-addition-sheet').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));const original=await page.locator('.rut-addition-sheet').boundingBox();await page.evaluate(()=>window.rutFrameNode=document.querySelector('.rut-addition-sheet'));
 for(let i=0;i<4;i++)await page.locator('#rutRecoveryNext').click();await expect(page.locator('#rutRecoveryMonth')).toHaveText('Febrero 2027');expect(await page.locator('.rut-calendar-spacer').count()).toBe(2);expect(await page.locator('.rut-addition-sheet').boundingBox()).toEqual(original);expect(await page.evaluate(()=>window.rutFrameNode===document.querySelector('.rut-addition-sheet'))).toBe(true);
 for(let i=0;i<3;i++)await page.locator('#rutRecoveryNext').click();await expect(page.locator('#rutRecoveryMonth')).toHaveText('Mayo 2027');expect(await page.locator('.rut-calendar-spacer').count()).toBe(0);expect(await page.locator('.rut-addition-sheet').boundingBox()).toEqual(original);await page.screenshot({path:info.outputPath('calendario-seis-semanas.png'),animations:'disabled'});
 const cal=await page.locator('.rut-dpick-real').boundingBox(),cdp=await page.context().newCDPSession(page),y=cal.y+cal.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cal.x+45,y,id:1}]});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cal.x+45+150*i/8,y,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.locator('#rutRecoveryMonth')).toHaveText('Abril 2027');expect(await page.locator('.rut-calendar-spacer').count()).toBe(1);expect(await page.locator('.rut-addition-sheet').boundingBox()).toEqual(original);
 await page.locator('#rutAdditionOv [data-ds="2027-04-14"]').click();await page.locator('#rutRecoveryConfirm').click();await page.locator('#rutExtraSave').click();await expect(page.locator('#rutAdditionWrap')).toHaveCount(0);expect(await page.evaluate(()=>RUTINAS[0].extraSessions[0].date)).toBe('2027-04-14');
 await page.evaluate(()=>openRutRecoveryDay(RUTINAS[0],'2026-10-12','2027-02-01'));await expect(page.locator('.rut-addition-sheet')).toBeVisible();await expect(page.locator('#rutRecoveryMonth')).toHaveText('Febrero 2027');await page.screenshot({path:info.outputPath('calendario-cuatro-semanas.png'),animations:'disabled'});await page.locator('#rutRecoveryNext').click();expect((await page.locator('.rut-addition-sheet').boundingBox()).height).toBe(original.height);
});
test('Mis Datos mantiene tres atajos iguales con texto en negrita',async({page},info)=>{
 await page.evaluate(()=>{closeEvents();openPersonalData();});await expect(page.locator('.contact-shortcuts button')).toHaveCount(3);for(const button of await page.locator('.contact-shortcuts button').all())await expect(button).toHaveCSS('font-weight','700');await page.screenshot({path:info.outputPath('mis-datos.png'),animations:'disabled'});
});

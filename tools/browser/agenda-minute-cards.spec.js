const {test,expect}=require('@playwright/test');
const {PNG}=require('../../node_modules/playwright-core/lib/utilsBundle.js');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-15T12:00:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');
});
async function settled(page){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);await Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});}
test('La línea permanece completa durante el swipe y Agenda tapa sus esquinas al desplazar',async({page},info)=>{
 await page.locator('#eventsBtn').click();await settled(page);
 for(const view of ['upcoming','week','months','stats']){
  await page.evaluate(view=>{EV_VIEW=view;refreshEvents(false);},view);await settled(page);
  const rect=await page.locator('.ev-upcoming-tabs').boundingBox(),clip={x:rect.x,y:rect.y+rect.height-1,width:rect.width,height:1};
  const before=await page.screenshot({clip});
  await page.evaluate(()=>{const el=document.querySelector('#eventsOverlay');window.lineSwipe=createLiveSwipe(el,swipeContentResolver(el));lineSwipe.move(EV_VIEW==='stats'?150:-150);});
  expect(await page.screenshot({clip})).toEqual(before);
  await page.screenshot({path:info.outputPath('swipe-'+view+'.png')});await page.evaluate(()=>lineSwipe.cancel());
 }
 await page.evaluate(()=>{EV_VIEW='week';refreshEvents(false);});await settled(page);
 for(const top of [0,180,480]){
  await page.locator('.ev-wk-body').evaluate((el,top)=>el.scrollTop=top,top);
  const tabs=await page.locator('.ev-upcoming-tabs').boundingBox();
  const pixels=PNG.sync.read(await page.screenshot({clip:{x:tabs.x,y:tabs.y+tabs.height,width:tabs.width,height:16},path:info.outputPath('esquinas-'+top+'.png')}));
  const bg=await page.locator('.ev-wk-body').evaluate(el=>{const c=getComputedStyle(el).getPropertyValue('--bg').trim();const n=document.createElement('span');n.style.color=c;el.append(n);const rgb=getComputedStyle(n).color.match(/\d+/g).map(Number);n.remove();return rgb;});
  for(const x of [1,pixels.width-2])expect([...pixels.data.slice((pixels.width+x)*4,(pixels.width+x)*4+3)]).toEqual(bg);
  await page.screenshot({path:info.outputPath('agenda-scroll-'+top+'.png')});
 }
 await expect(page.locator('.ev-wk-body')).toHaveCSS('border-bottom-left-radius','16px');
});

async function dragMinutes(page,selector,delay,direction=1,wait=true){
 const drum=page.locator(selector),r=await drum.boundingBox(),x=r.x+r.width/2,y=direction>0?r.y+r.height-18:r.y+18;
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 for(let i=1;i<=8;i++){if(delay)await page.waitForTimeout(delay);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-direction*i*11,id:1}]});}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 if(wait)await expect.poll(()=>drum.evaluate(el=>!!el._minuteGesture)).toBe(false);
 return drum.evaluate(el=>Math.round(el.scrollTop/44));
}
test('Minutero: el gesto rápido recorre más, el lento conserva precisión y el toque funciona',async({page},info)=>{
 await page.evaluate(()=>{const input=document.createElement('input');input.id='motionTime';input.value='09:00';document.body.append(input);openTimePicker(input);});
 await expect(page.locator('#timePickerMinutes')).toHaveAttribute('aria-valuenow','0');await settled(page);
 const slow=await dragMinutes(page,'#timePickerMinutes',130)-60;
 await page.locator('#timePickerMinutes').evaluate(el=>el.scrollTop=60*44);
 await expect(page.locator('#timePickerMinutes')).toHaveAttribute('aria-valuenow','0');
 const fast=await dragMinutes(page,'#timePickerMinutes',0)-60;
 expect(slow).toBeGreaterThan(0);expect(slow).toBeLessThanOrEqual(3);expect(fast).toBeGreaterThan(slow*3);
 const current=await page.locator('#timePickerMinutes').evaluate(el=>Math.round(el.scrollTop/44));
 await page.locator('#timePickerMinutes').focus();await page.keyboard.press('ArrowDown');
 await expect(page.locator('#timePickerMinutes')).toHaveAttribute('aria-valuenow',String((current+1)%60));
 await page.screenshot({path:info.outputPath('minutos.png')});
 const r=await page.locator('#timePickerMinutes').boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+110);
 await expect(page.locator('#timePickerMinutes')).toHaveAttribute('aria-valuenow',String((current+2)%60));
 await page.locator('#timePickerMinutes').evaluate(el=>el.scrollTop=60*44);
 await dragMinutes(page,'#timePickerMinutes',0,1,false);await page.locator('#timePickerMinutes').focus();await page.keyboard.press('ArrowUp');
 expect(await page.locator('#timePickerMinutes').evaluate(el=>!!el._minuteGesture)).toBe(false);
 const stopped=await page.locator('#timePickerMinutes').getAttribute('aria-valuenow');await page.waitForTimeout(200);
 await expect(page.locator('#timePickerMinutes')).toHaveAttribute('aria-valuenow',stopped);
 await page.locator('#timePickerSave').click();expect(await page.locator('#motionTime').inputValue()).toMatch(/^09:\d{2}$/);
});
test('Minutero de alarma: gesto rápido, cancelación y cruce de hora conservan el valor',async({page})=>{
 await page.locator('#alarmTestBtn').click();await expect(page.locator('#drumMin .drum-selected')).toHaveText('20');await settled(page);
 await dragMinutes(page,'#drumMin',8);
 const selected=await page.locator('#drumMin .drum-selected').textContent();expect(Number(selected)).toBeLessThan(60);
 const hour=Number(await page.locator('#drumHour .drum-selected').textContent());
 await page.locator('#drumMin').evaluate(el=>el.scrollTop=125*44);
 await expect(page.locator('#drumMin .drum-selected')).toHaveText('05');
 await expect(page.locator('#drumHour .drum-selected')).toHaveText(String((hour+1)%24).padStart(2,'0'));
 await expect.poll(()=>page.locator('#drumMin').evaluate(el=>Math.round(el.scrollTop/44))).toBe(65);
 const r=await page.locator('#drumMin').boundingBox(),cdp=await page.context().newCDPSession(page),x=r.x+30,y=r.y+105;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-40,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await cdp.detach();
 await expect.poll(()=>page.locator('#drumMin').evaluate(el=>!!el._minuteGesture)).toBe(false);
 expect(await page.locator('#drumMin').evaluate(el=>Math.abs(el.scrollTop-Math.round(el.scrollTop/44)*44))).toBeLessThanOrEqual(1);
});
test('Análisis de hipoteca arriba en ambos detalles y con el acento de cada ventana',async({page},info)=>{
 await page.evaluate(()=>{loadDespacho();DESPACHO.compra=Object.assign(_defaultCompra(),{importePrestamo:120000,tipoInteres:3,plazoAnios:20,fechaInicio:'2024-01-01',entidadBanco:'Banco de prueba'});saveDespacho();});
 for(const fiscal of [false,true])for(const tab of ['resumen','detalle']){
  await page.evaluate(({fiscal,tab})=>{if(fiscal){FISCAL_TAB='despacho';FISCAL_HIP_SUB=tab;openFiscal(2026);}else openHousehold(tab);},{fiscal,tab});await settled(page);
  const button=page.locator((fiscal?'#fiscalOverlay':'#householdOverlay')+' #hipGoAnalisis');if(tab==='resumen'){await expect(button).toHaveCount(0);continue;}await expect(button).toBeInViewport();
  const state=await button.evaluate(el=>{const s=getComputedStyle(el),probe=document.createElement('i');probe.style.color='var(--accent)';el.append(probe);const accent=getComputedStyle(probe).color;probe.remove();return {first:el.parentNode.firstElementChild===el,fill:s.backgroundColor,accent};});
  expect(state.first).toBe(true);expect(state.fill).toBe(state.accent);await page.screenshot({path:info.outputPath('hipoteca-'+fiscal+'-'+tab+'.png')});
 }
});
test('Mis Datos: tocar tarjeta selecciona y desmarca sin activar edición ni botones de copia',async({page},info)=>{
 await page.evaluate(()=>{appStorage.setItem(CONTACT_DATA_KEY,JSON.stringify({name:'Persona de prueba',tax:'DNI ficticio',emails:[{value:'prueba@example.invalid'}]}));openPersonalData();});
 const name=page.locator('[data-personal-select="name"]'),row=name.locator('..');
 await row.locator('textarea').click();await expect(name).toBeChecked();await expect(row).toHaveCSS('outline-width','2px');
 await row.locator('.invoice-field>span').first().click();await expect(name).not.toBeChecked();
 await name.check();await expect(name).toBeChecked();await name.uncheck();await expect(name).not.toBeChecked();
 await row.locator('.settings-copy').click();await expect(name).not.toBeChecked();
 await page.locator('[data-contact-group=emails]>summary').click();const entry=page.locator('[data-contact-entry="emails.0"]');
 await entry.locator('textarea').click();await expect(entry.locator('[data-personal-select]')).toBeChecked();await expect(entry).toHaveCSS('outline-width','2px');
 await page.screenshot({path:info.outputPath('tarjetas-seleccionadas.png'),animations:'disabled'});
 await page.locator('#personalDataEdit').click();await row.locator('textarea').fill('Nombre editado');await expect(name).not.toBeChecked();
 await page.locator('#personalDataCancel').click();await expect(row.locator('textarea')).toHaveValue('Persona de prueba');
});

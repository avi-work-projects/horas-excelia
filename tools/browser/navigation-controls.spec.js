const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test.use({timezoneId:'Europe/Madrid'});
// Permite contrastar el mismo contrato con una hoja anterior, sin actualizar snapshots.
test.beforeEach(async({page})=>{
 if(process.env.NAVIGATION_BASELINE_CSS){const css=fs.readFileSync(process.env.NAVIGATION_BASELINE_CSS,'utf8');await page.route('**/css/styles.css*',r=>r.fulfill({contentType:'text/css',body:css}));}
 await page.clock.setFixedTime(new Date('2026-10-16T14:37:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');
});

for(const theme of ['light','dark','grey'])test('Controles compartidos: teclado, pulsación y navegación en '+theme,async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.evaluate(theme=>applyTheme(theme),theme);
 const next=page.locator('#nextBtn');await expect(next).toHaveCSS('border-radius','9px');
 await next.evaluate(el=>el.disabled=true);await expect(next).toBeDisabled();
 await next.evaluate(el=>el.click());expect(await page.evaluate(()=>CM)).toBe(9);
 await next.evaluate(el=>el.disabled=false);
 await page.locator('#prevBtn').focus();await page.keyboard.press('Tab');await expect(next).toBeFocused();
 await page.keyboard.press('Enter');expect(await page.evaluate(()=>CM)).toBe(10);
 await page.locator('#todayBtn').click();expect(await page.evaluate(()=>CM)).toBe(9);
 // Se conserva la respuesta de pulsación de Home, sin modificar aún el mes.
 const box=await next.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 await expect(next).toHaveCSS('transform','matrix(0.93, 0, 0, 0.93, 0, 0)');expect(await page.evaluate(()=>CM)).toBe(9);
 await page.mouse.up();expect(await page.evaluate(()=>CM)).toBe(10);
 await page.evaluate(()=>{EV_VIEW='cal';EV_YEAR=2026;EV_MONTH=9;openEventsAt();});
 await page.locator('#evNext').click();expect(await page.evaluate(()=>EV_MONTH)).toBe(10);
 await page.locator('#evToday').click();expect(await page.evaluate(()=>[EV_YEAR,EV_MONTH])).toEqual([2026,9]);
 await expect(page.locator('#evBack')).toHaveCSS('border-radius','9px');
 await page.locator('#evBack').click();await expect(page.locator('#eventsOverlay')).toBeHidden();
 await page.evaluate(()=>{EV_VIEW='bday';BDAY_VIEW='cal';BDAY_YEAR=2026;BDAY_MONTH=9;openEventsAt();});
 const birthdayToday=page.locator('#bdToday');
 await expect(birthdayToday).toHaveCSS('padding','6px 12px');
 expect(await birthdayToday.evaluate(el=>parseFloat(getComputedStyle(el).fontSize)/parseFloat(getComputedStyle(document.documentElement).fontSize))).toBeCloseTo(.7);
 await page.locator('#bdNext').click();expect(await page.evaluate(()=>BDAY_MONTH)).toBe(10);
 await birthdayToday.click();expect(await page.evaluate(()=>[BDAY_YEAR,BDAY_MONTH])).toEqual([2026,9]);
 await page.locator('#bdBack').click();await expect(page.locator('#eventsOverlay')).toBeHidden();
 await page.evaluate(()=>{FISCAL_TAB='personal';openFiscal(2026);});
 const fiscal=page.locator('#fiscalYearNext');await expect(fiscal).toHaveCSS('width','32px');await expect(fiscal).toHaveCSS('height','32px');
 await fiscal.click();expect(await page.evaluate(()=>FISCAL_YEAR)).toBe(2027);
 await page.locator('#fiscalYearPrev').click();expect(await page.evaluate(()=>FISCAL_YEAR)).toBe(2026);
 await page.locator('#fiscalBack').click();await expect(page.locator('#fiscalOverlay')).toBeHidden();
 await page.evaluate(()=>{
  EV_VIEW='cal';openEventsAt();EVENTS=['a','b'].map(id=>({id,kind:'puntual',type:'Comida',title:'Prueba '+id,start:'2026-10-16',end:'2026-10-16',color:'#e99a31'}));openEvDayCarousel('2026-10-16','a');
 });
 for(const id of ['evCarPrev','evCarNext']){const arrow=page.locator('#'+id);await expect(arrow).toHaveCSS('width','36px');await expect(arrow).toHaveCSS('height','36px');await expect(arrow).toHaveCSS('border-radius','9px');}
 await page.locator('#evCarNext').click({trial:true});
 const edit=await page.locator('#evDEdit').boundingBox();await page.locator('#evCarNext').click();expect(await page.evaluate(()=>EV_CAR.i)).toBe(1);
 expect(await page.locator('#evDEdit').boundingBox()).toEqual(edit);
 await page.locator('#evCarPrev').click();expect(await page.evaluate(()=>EV_CAR.i)).toBe(0);
 await page.screenshot({path:info.outputPath('carrusel-'+theme+'.png'),animations:'disabled'});
 await page.locator('#evDClose').click();await expect(page.locator('#evDetailOv')).toHaveCount(0);
 expect(errors).toEqual([]);
});

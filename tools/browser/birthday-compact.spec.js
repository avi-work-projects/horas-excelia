const {test,expect}=require('@playwright/test');
async function openBirthdays(page){await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();}
test.beforeEach(async({page})=>{await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');const today=new Date();const person=(name,offset)=>{const d=new Date(today);d.setDate(d.getDate()+offset);return {name,day:d.getDate(),month:d.getMonth()+1,vip:true}};localStorage.setItem('excelia-bdays-v1',JSON.stringify([person('Hoy A',0),person('Hoy B',0),person('Limite',14),person('Lejano',15),person('Ayer',-1)]));});});
test('alarma: hoy y 14 días sí, 15 y pasado no; protege acceso desde eventos',async({page})=>{
 await openBirthdays(page);
 expect(await page.evaluate(()=>BDAYS.map(bdayCanSetAlarm))).toEqual([true,true,true,false,false]);
 await page.evaluate(()=>openBdayDetail(BDAYS[3]));await expect(page.locator('#bdDAlarm')).toHaveCount(0);await expect(page.locator('.bday-alarm-hint')).toBeVisible();
 await page.locator('#bdDClose').click();await expect(page.locator('#bdDWrap')).toHaveCount(0);
 await page.evaluate(()=>openBdayAlarm(BDAYS[3]));await expect(page.locator('#bdAlarmWrap')).toHaveCount(0);
 await page.evaluate(()=>{syncVipBdaysToEvents();openBdayAlarmFromEvents(EVENTS.find(e=>e.id.includes('lejano')))});await expect(page.locator('#bdAlarmWrap')).toHaveCount(0);
 await page.evaluate(()=>openBdayAlarm(BDAYS[2]));await expect(page.locator('#bdAlarmOv')).toBeVisible();
});
test('hoy usa el separador existente y filas compactas, incluso con filtro',async({page})=>{
 await openBirthdays(page);await page.locator('#bdViewList').click();
 const row=page.locator('.bday-today-item');await expect(row).toHaveCount(1);await expect(page.locator('.bday-today-line')).toBeHidden();
 const style=await row.evaluate(el=>({border:getComputedStyle(el).borderTopWidth,dotTop:getComputedStyle(el,'::before').top,height:el.getBoundingClientRect().height}));expect(style.border).toBe('1px');expect(style.dotTop).toBe('-4px');expect(style.height).toBeLessThan(56);
 await page.screenshot({path:'test-results/cumpleanos-compactos.png'});
 await page.locator('#bdSearch').fill('Lejano');const line=page.locator('.bday-today-line');await expect(line).toBeVisible();expect((await line.boundingBox()).height).toBeLessThanOrEqual(1);
 await page.screenshot({path:'test-results/separador-cumpleanos.png'});
});
test('VIP del mismo día se solapan con el primero delante y sin altura extra',async({page})=>{
 await openBirthdays(page);
 await page.evaluate(()=>{syncVipBdaysToEvents();EV_VIEW='cal';EV_YEAR=new Date().getFullYear();EV_MONTH=new Date().getMonth();refreshEvents()});
 const group=page.locator('.ev-day-vips').filter({has:page.locator('[data-id*="hoy_a"]')});await expect(group.locator('.ev-month-vip')).toHaveCount(2);
 const geometry=await group.locator('.ev-month-vip').evaluateAll(els=>els.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,w:el.getBoundingClientRect().width,z:+getComputedStyle(el).zIndex})));
 expect(geometry[1].x-geometry[0].x).toBeGreaterThan(0);expect(geometry[1].x-geometry[0].x).toBeLessThan(geometry[0].w/2);expect(geometry[0].y).toBe(geometry[1].y);expect(geometry[0].z).toBeGreaterThan(geometry[1].z);
 await group.screenshot({path:'test-results/vip-superpuestos.png'});
});

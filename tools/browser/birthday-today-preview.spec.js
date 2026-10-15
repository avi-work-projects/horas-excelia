const {test,expect}=require('@playwright/test');
test.use({isMobile:true,hasTouch:true,viewport:{width:400,height:880}});
for(const count of [1,2])test(`captura: ${count} cumpleaños hoy`,async({page},testInfo)=>{
 await page.clock.setFixedTime(new Date(2026,9,11,12));
 await page.addInitScript(count=>{localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-bdays-v1',JSON.stringify([
  ...Array.from({length:count},(_,i)=>({name:['Lucía Ejemplo','Marcos Ejemplo'][i],day:11,month:10,vip:i===0,categories:['Amigos N.A.S.A']})),
  ...Array.from({length:12},(_,i)=>({name:'Persona de ejemplo '+(i+1),day:14+i,month:10})),
  {name:'Ejemplo Enero',day:8,month:1},{name:'Ejemplo Septiembre',day:20,month:9}
 ]));},count);
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();
 await expect(page.locator('#bdVipAll')).toHaveCount(0);
 const rows=page.locator('.bday-list-item[data-bday-day="11"][data-bday-month="10"]');await expect(rows).toHaveCount(count);
 await expect(page.locator('.bday-today-item')).toHaveCount(1);await expect(page.locator('.bday-today-line')).toBeHidden();
 for(const row of await rows.all()){await expect(row).toBeInViewport();await expect(row.locator('.today-lbl')).toHaveText('¡Hoy!');const colors=await row.evaluate(el=>({day:getComputedStyle(el.querySelector('.bday-list-day')).color,label:getComputedStyle(el.querySelector('.today-lbl')).color,accent:getComputedStyle(el.querySelector('.bday-list-day')).getPropertyValue('--birthday-tone').trim()}));expect(colors.day).toBe(colors.label);}
 await expect(page.locator('.bday-today-stroke:visible')).toHaveCount(1);await expect(page.locator('.bday-today-stroke:visible')).toHaveCSS('border-top-right-radius','999px');
 const todayRow=page.locator('.bday-today-item');
 const gap=await todayRow.evaluate(el=>el.getBoundingClientRect().x+parseFloat(getComputedStyle(el,'::after').left)-el.querySelector('.bday-list-day').getBoundingClientRect().right);
 expect(gap).toBeGreaterThanOrEqual(8);
 await page.screenshot({path:testInfo.outputPath(`hoy-${count}.png`),animations:'disabled'});
});
test('actualización: botón flotante único conserva toast y recarga',async({page},testInfo)=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');
 await page.evaluate(()=>{showToast('Aviso de prueba','success');navigator.serviceWorker.dispatchEvent(new MessageEvent('message',{data:{type:'SW_UPDATED',version:'test'}}));});
 const fab=page.locator('#swUpdateFab');await expect(fab).toBeVisible();await expect(page.locator('#toast')).toContainText('Aviso de prueba');
 await page.evaluate(()=>navigator.serviceWorker.dispatchEvent(new MessageEvent('message',{data:{type:'SW_UPDATED',version:'test'}})));await expect(fab).toHaveCount(1);
 const r=await fab.boundingBox();expect(Math.abs(r.x+r.width/2-200)).toBeLessThan(1);expect(r.height).toBe(48);expect(r.width).toBe(48);await expect(fab).toHaveText('');await expect(fab).toHaveCSS('color','rgb(255, 255, 255)');const colors=await fab.evaluate(el=>({fill:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderTopColor}));expect(colors.fill).toBe(colors.border);expect(colors.fill).not.toBe('rgb(255, 255, 255)');await expect(fab).toHaveCSS('border-radius','17px');expect(r.y+r.height).toBe(862);
 await page.evaluate(()=>document.getElementById('toast').classList.remove('show'));await expect(page.locator('#todayBtn')).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 await page.screenshot({path:testInfo.outputPath('actualizar.png'),animations:'disabled'});
 await Promise.all([page.waitForEvent('load'),fab.click()]);await expect(fab).toHaveCount(0);
});

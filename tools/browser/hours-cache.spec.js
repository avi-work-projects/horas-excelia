const {test,expect}=require('@playwright/test');
const base='https://synthetic-cache.test.ts.net/';
async function setup(page,context){
  let offline=false;const calls=[];
  await page.clock.setFixedTime(new Date('2027-02-01T12:00:00+01:00'));
  await page.addInitScript(()=>{
    sessionStorage.setItem('excelia-popup-dismissed','1');
    localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:'https://synthetic-cache.test.ts.net/facturas/'},months:{}}));
  });
  await context.route(base+'facturas/**',route=>route.abort());
  await context.route(base+'horas/status?**',async route=>{
    const period=new URL(route.request().url()).searchParams.get('period');calls.push(period);
    if(offline)return route.abort();
    const rows=await page.evaluate(period=>hoursScopeKeys(period).map(key=>({key,state:key==='2027-02-08'?'scheduled':'sent',days:hoursWeekDays(key),schedule:homeWeekSchedule(key).date+'T08:00:00+01:00'})),period);
    await route.fulfill({json:{period,checkedAt:new Date().toISOString(),rows},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
  });
  await page.goto('/');
  await expect(page.locator('.home-submission.complete')).toContainText('Todo al día');
  return {calls,offline(){offline=true;}};
}
test('Cambiar de mes, volver y recargar conserva la comprobación sin nuevas consultas',async({page,context})=>{
  const api=await setup(page,context);expect(api.calls).toEqual(['2027-02']);
  await page.evaluate(()=>{CM=2;render();});await expect.poll(()=>page.evaluate(()=>HOURS_STATUS.phase)).toBe('ready');expect(api.calls).toEqual(['2027-02','2027-03']);
  await page.evaluate(()=>{CM=1;render();});await expect(page.locator('.home-submission.complete')).toContainText('Todo al día');expect(api.calls).toHaveLength(2);
  await page.clock.setFixedTime(new Date('2027-02-01T15:00:00+01:00'));
  await page.evaluate(()=>{render();window.dispatchEvent(new Event('focus'));});expect(api.calls).toHaveLength(2);
  await page.reload();await expect(page.locator('.home-submission.complete')).toContainText('Todo al día');expect(api.calls).toHaveLength(2);
  await expect(page.locator('.hours-verified-note')).toContainText('Comprobado');
});
test('Sin conexión conserva hechos conocidos y señala cambios locales sin reintentar continuamente',async({page,context})=>{
  const api=await setup(page,context);api.offline();
  await page.evaluate(()=>syncHoursStatus(true));await expect.poll(()=>page.evaluate(()=>HOURS_STATUS.phase)).toBe('error');
  await expect(page.locator('.home-submission.complete')).toContainText('Todo al día');
  await page.evaluate(()=>{ST['2027-02-09']={type:'vacaciones'};render();});await expect.poll(()=>page.evaluate(()=>HOURS_STATUS.phase)).toBe('error');
  await expect(page.locator('.week-card').nth(1).locator('.hours-week-badge')).toHaveText('Revisar cambios');
  const count=api.calls.length;await page.evaluate(()=>{render();render();window.dispatchEvent(new Event('focus'));});expect(api.calls).toHaveLength(count);
  await page.evaluate(()=>{delete ST['2027-02-09'];render();});await expect(page.locator('.week-card').nth(1).locator('.hours-week-badge')).toHaveText('◷ Programada');expect(api.calls).toHaveLength(count);
});
test('La fecha programada provoca una comprobación; confirmar sigue invalidando el hecho anterior',async({page,context})=>{
  const api=await setup(page,context);
  await page.clock.setFixedTime(new Date('2027-02-12T08:01:00+01:00'));
  await page.evaluate(()=>syncHoursStatus(false));expect(api.calls).toHaveLength(2);
  await page.evaluate(()=>{render();window.dispatchEvent(new Event('focus'));});expect(api.calls).toHaveLength(2);
  await page.evaluate(()=>invalidateHoursReview({mode:'week',targetWeek:'2027-02-08',period:'2027-02'},hoursKairoUrl(),'loading'));
  await expect(page.locator('.week-card').nth(1).locator('.hours-week-badge')).toHaveText('Sin comprobar');
  await expect(page.locator('.week-card').first().locator('.hours-week-badge')).toHaveText('✓ Enviada');
});
test('Respuesta tardía no contamina otro mes y cambiar de servidor no reutiliza sus hechos',async({page,context})=>{
  await setup(page,context);
  await page.evaluate(()=>{window.hourReplies=[];window.fetch=(url)=>String(url).includes('/horas/')?new Promise(resolve=>hourReplies.push({url,resolve})):Promise.reject(Error('offline'));syncHoursStatus(true);CM=2;render();});
  await expect.poll(()=>page.evaluate(()=>hourReplies.length)).toBe(2);
  await page.evaluate(()=>{for(const i of [1,0]){const period=i?'2027-03':'2027-02';hourReplies[i].resolve({ok:true,json:async()=>({period,checkedAt:new Date().toISOString(),rows:hoursScopeKeys(period).map(key=>({key,state:i?'sent':'missing'}))})});}});
  await expect.poll(()=>page.evaluate(()=>HOURS_STATUS.period+HOURS_STATUS.phase)).toBe('2027-03ready');
  await expect(page.locator('.home-submission.complete')).toContainText('Todo al día');
  await page.evaluate(()=>{CM=1;render();});await expect(page.locator('.home-submission.complete')).toContainText('Todo al día');
  await page.evaluate(()=>{const data=invoiceData();data.config.kairoUrl='https://another.test.ts.net/facturas/';invoiceSave(data);render();});
  await expect(page.locator('.home-submission')).toContainText('Sin comprobar');
});

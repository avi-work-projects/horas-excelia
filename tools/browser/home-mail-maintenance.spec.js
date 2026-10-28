const {test,expect}=require('@playwright/test');
const origin='https://home-maintenance.test.ts.net/';
async function setup(page,context,{queued=false}={}){
  const calls={hours:0,invoices:[],jobs:0},jobId='10000000-0000-4000-8000-000000000001';let phase='running',offline=false,bundle;
  await page.clock.setFixedTime(new Date('2027-02-01T12:00:00+01:00'));
  await context.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');if(!localStorage.getItem('excelia-invoices-v1'))localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:'https://home-maintenance.test.ts.net/facturas/'},months:{}}));});
  await context.route(origin+'facturas/gestify-status?**',async route=>{
    const period=new URL(route.request().url()).searchParams.get('period');calls.invoices.push(period);
    if(offline)return route.abort();
    await route.fulfill({json:{period,state:'scheduled',generated:true,issued:true,scheduled:true,sent:false,scheduledDate:period+'-19'},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
  });
  await context.route(origin+'horas/status?**',async route=>{
    calls.hours++;if(offline)return route.abort();
    const requested=new URL(route.request().url()).searchParams.get('period');
    bundle=await page.evaluate(requested=>({periods:[-1,0,1].map(offset=>{const d=new Date(Number(requested.slice(0,4)),Number(requested.slice(5))-1+offset,1),period=mkey(d.getFullYear(),d.getMonth());return {period,checkedAt:new Date().toISOString(),verified:true,rows:hoursScopeKeys(period).map(key=>({key,state:'scheduled',days:hoursWeekDays(key),schedule:homeWeekSchedule(key).date+'T08:00:00+01:00'}))};})}),requested);
    await route.fulfill({status:queued?202:200,json:queued?{jobId,kind:'status',phase:'queued'}:{phase:'done',result:bundle},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
  });
  await context.route(origin+'horas/jobs/**',route=>{calls.jobs++;return route.fulfill({json:{jobId,kind:'status',phase,...(phase==='done'?{result:bundle}:{})},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});});
  await page.goto('/');
  await expect.poll(()=>calls.hours).toBe(1);
  if(!queued)await expect(page.locator('.home-submission.complete')).toContainText('Correos al día');
  await expect.poll(()=>calls.invoices.length).toBe(3);
  return {calls,finish(){phase='done';},offline(){offline=true;}};
}
test('una auditoría de tres meses; navegar, editar, foco y recarga reutilizan los hechos',async({page,context})=>{
  const api=await setup(page,context);
  expect(api.calls.invoices.sort()).toEqual(['2027-01','2027-02','2027-03']);
  await page.evaluate(()=>{CM=0;render();CM=2;render();CM=1;render();window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('online'));document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.locator('.home-submission')).toContainText('Correos al día');expect(api.calls.hours).toBe(1);expect(api.calls.invoices).toHaveLength(3);
  await page.evaluate(()=>{ST['2027-02-09']={type:'vacaciones'};render();});
  await expect(page.locator('.week-card').nth(1).locator('.hours-week-badge')).toContainText('Revisar cambios');expect(api.calls.hours).toBe(1);
  await page.reload();await expect(page.locator('.home-submission.complete')).toContainText('Correos al día');expect(api.calls.hours).toBe(1);expect(api.calls.invoices).toHaveLength(3);
  await expect(page.locator('.hours-verified-note')).toContainText('Comprobado');
  await page.evaluate(()=>{CY=2025;CM=0;render();});await expect(page.locator('.home-submission')).toContainText('Mes cerrado');expect(api.calls.hours).toBe(1);expect(api.calls.invoices).toHaveLength(3);
});
test('desmarcar desbloquea edición y conserva la programación; V/F/A sombrean toda la celda',async({page,context})=>{
  const api=await setup(page,context),card=page.locator('.week-card').first();
  await expect(card).toHaveClass(/sent/);await card.getByRole('button',{name:'Desmarcar',exact:true}).click();await expect(card).not.toHaveClass(/sent/);
  await card.locator('.day-cell').first().click();await expect(page.locator('#bottomSheet')).toHaveClass(/active/);
  await page.evaluate(()=>{closeSheet();ST['2027-02-01']={type:'vacaciones'};ST['2027-02-02']={type:'festivo'};ST['2027-02-03']={type:'ausencia'};render();});
  await expect(card.locator('.day-hours')).toHaveText(['V','F','A','9h',/6,5\s*h/]);
  const backgrounds=await card.locator('.day-cell').evaluateAll(cells=>cells.map(c=>getComputedStyle(c).backgroundColor));expect(new Set(backgrounds).size).toBe(4);
  expect(await page.evaluate(()=>hoursCachedWeek('2027-02-01').state)).toBe('scheduled');expect(api.calls.hours).toBe(1);
  await expect(card.getByRole('button',{name:'Enviar a Outlook',exact:true})).toBeVisible();await expect(card.locator('.hours-week-badge')).toHaveAccessibleName('Revisar cambios');
  await expect(card.locator('.days-grid')).toHaveCSS('border-top-width','2px');await expect(card.locator('.days-grid')).toHaveCSS('border-bottom-width','2px');
});
test('un trabajo sobrevive al cierre de Gestify y devuelve su resultado sin repetir Outlook',async({page,context})=>{
  const api=await setup(page,context,{queued:true});await expect(page.locator('.hours-job-note')).toContainText('Puedes salir');
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem(HOURS_JOBS_KEY)).length)).toBe(1);
  await page.close();api.finish();const next=await context.newPage();await next.goto('/');
  await expect(next.locator('.home-submission.complete')).toContainText('Correos al día');expect(api.calls.hours).toBe(1);
  await expect.poll(()=>next.evaluate(()=>JSON.parse(localStorage.getItem(HOURS_JOBS_KEY)).length)).toBe(0);
});
test('fallo de actualización conserva factura y correos; el refresco está dentro del panel',async({page,context})=>{
  const api=await setup(page,context);await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura programada');
  api.offline();await page.locator('.home-submission').getByRole('button',{name:'Actualizar estado de correos y factura'}).click();
  await expect.poll(()=>api.calls.hours).toBe(2);await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura programada');await expect(page.locator('.home-submission')).toContainText('Correos al día');
  expect(api.calls.invoices).toHaveLength(4);
});
test('doble actualización no encola dos comprobaciones',async({page,context})=>{
  const api=await setup(page,context);await page.evaluate(()=>{refreshHomeStates();refreshHomeStates();});
  await expect.poll(()=>api.calls.hours).toBe(2);await expect(page.locator('[data-hours-check]')).toBeEnabled();expect(api.calls.hours).toBe(2);
});
test('una caché antigua del mes actual se completa con anterior y siguiente',async({page,context})=>{
  const api=await setup(page,context);
  await page.evaluate(()=>{HOURS_CACHE.periods={'2027-02':HOURS_CACHE.periods['2027-02']};HOURS_CACHE.attempts={};HOURS_ATTEMPTS={};hoursCacheSave();syncHoursStatus(false);});
  await expect.poll(()=>api.calls.hours).toBe(2);
  await expect.poll(()=>page.evaluate(()=>Object.keys(HOURS_CACHE.periods).sort())).toEqual(['2027-01','2027-02','2027-03']);
  await expect(page.locator('.home-submission.complete')).toContainText('Correos al día');
});
test('al cambiar el mes real incorpora el nuevo mes de auditoría una sola vez',async({page,context})=>{
  const api=await setup(page,context);await page.clock.setFixedTime(new Date('2027-03-01T12:00:00+01:00'));
  await page.evaluate(()=>{CM=2;render();});await expect.poll(()=>api.calls.hours).toBe(2);
  await expect.poll(()=>page.evaluate(()=>!!HOURS_CACHE.periods['2027-04'])).toBe(true);
  await page.evaluate(()=>{render();window.dispatchEvent(new Event('focus'));});expect(api.calls.hours).toBe(2);
});
for(const width of [320,400,440])test('resumen, fórmula y colores de jornada a '+width+' px',async({page,context},info)=>{
  await page.setViewportSize({width,height:1000});await setup(page,context);
  await page.evaluate(()=>{ST['2027-02-02']={type:'normal',hours:7};ST['2027-02-03']={type:'normal',hours:8};ST['2027-02-04']={type:'festivo'};render();});
  const summary=page.locator('.home-summary-compact');await expect(summary.locator('.total')).toContainText('20 días laborables');
  await summary.locator('[data-home-formula]').click();await expect(summary.locator('.home-hours-equation')).toContainText('9×14 + 8×1 + 7×1 + 6,5×4');
  expect(await summary.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);expect(await page.locator('.home-submission').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  expect(await summary.evaluate(e=>e.getBoundingClientRect().left>e.parentElement.getBoundingClientRect().left)).toBe(true);
  await page.locator('#editHoursBtn').click();
  const colors=await page.locator('.hours-chip').evaluateAll(nodes=>nodes.map(e=>getComputedStyle(e).color));expect(new Set(colors).size).toBe(3);
  await page.locator('#editHoursBtn').click();await page.screenshot({path:info.outputPath('home-'+width+'.png'),animations:'disabled'});
});

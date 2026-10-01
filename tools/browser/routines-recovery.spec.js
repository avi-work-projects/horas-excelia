const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-01T10:00:00'));
  await page.addInitScript(()=>{
    sessionStorage.setItem('excelia-popup-dismissed','1');
    localStorage.setItem('excelia-rutinas-v1',JSON.stringify([{id:'recovery-test',name:'Pádel de prueba',icon:'padel',color:'#a3e635',start:'2026-01-01',weekDays:[4],time:'16:00',dur:60,weeks:{},skips:{'2026-09-24':1},extraSessions:[{id:'extra-follow',date:'2026-10-01',time:'17:00',dur:60,skip:false},{id:'extra-separated',date:'2026-10-08',time:'20:00',dur:60,skip:false}]}]));
  });
});
async function history(page){
  await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewRutinas').click();
  await expect(page.locator('.rut-prox-i')).toHaveCount(0);
  expect(await page.evaluate(()=>Object.keys(RUTINAS[0].skips))).toEqual(['2026-09-24']);
  await page.locator('.rut-edit').click();await page.locator('#rutFHistory').click();
}
test('recuperación con calendario, agenda fija y estado enlazado',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('excelia-events-v1',JSON.stringify([
    {id:'travel-hit-test',kind:'grande',type:'Viaje',title:'Viaje de prueba',start:'2026-10-01',end:'2026-10-12',color:'#426aaa'},
    {id:'travel-overlap-test',kind:'grande',type:'Viaje',title:'Otro viaje de prueba',start:'2026-10-06',end:'2026-10-10',color:'#9a68b0'}
  ])));
  await history(page);
  await page.locator('[data-history-edit="2026-09-24"]').click();
  await expect(page.locator('#rutHistorySkip')).toHaveCount(0);await expect(page.locator('#rutHistoryEditAdd')).toHaveCount(0);
  await page.locator('#rutHistoryRecover').click();
  // Las barras escalonadas no pueden interceptar el centro ni la base de una celda.
  for(const date of ['2026-10-07','2026-10-08']){
    const cell=page.locator('#rutAdditionOv .ev-cell[data-ds="'+date+'"]');
    await expect(cell).toBeVisible();
    const box=await cell.boundingBox();
    await cell.click({position:{x:box.width*.5,y:box.height*.7}});
    await expect(page.locator('#rutAdditionOv .ev-cell[data-ds="'+date+'"]')).toHaveAttribute('aria-pressed','true');
  }
  await page.locator('#rutAdditionOv .ev-cell[data-ds="2026-10-08"]').click();
  await expect(page.locator('#rutRecoveryConfirm')).toContainText('08/10/2026');
  await page.locator('#rutRecoveryConfirm').click();await expect(page.locator('#rutDestinationAgenda')).toContainText('20:00');
  await expect(page.locator('#rutDestinationAgenda input,#rutDestinationAgenda button')).toHaveCount(0);
  await page.locator('#rutExtraTime').fill('18:00');await page.locator('#rutExtraSave').click();
  await expect(page.locator('[data-history-date="2026-09-24"]')).toContainText('Recuperada este día: 08/10/2026');
  await expect(page.locator('[data-history-date="2026-10-08"]').filter({hasText:'18:00'})).toContainText('(Recuperada de 24/09/2026)');
  await page.locator('[data-history-edit="2026-10-15"]').click();await page.locator('#rutHistoryCancel').click();
  await expect(page.locator('#rutHistoryCancel')).toHaveText('Descancelar clase');
  await page.locator('#rutHistoryCancel').click();await expect(page.locator('#rutHistoryCancel')).toHaveText('Cancelar clase');
});
test('selección múltiple y pausa con fecha de vuelta',async({page})=>{
  await history(page);await page.locator('#rutHistoryBulk').click();
  for(const date of ['2026-10-15','2026-10-22'])await page.locator('[data-history-select="'+date+'"]').check();
  await page.locator('[data-rut-bulk-action="cancel"]').click();await expect(page.locator('#rutBulkOv')).toContainText('2 clases');
  await page.locator('#rutBulkConfirm').click();await expect(page.locator('[data-history-date="2026-10-15"]')).toContainText('(sin recuperar)');
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  await expect(page.locator('[data-history-date="2026-10-15"]')).not.toContainText('Cancelada');
  await page.locator('#rutHistoryBulk').click();await page.locator('[data-history-select="2026-10-01"]').check();
  await page.locator('[data-rut-bulk-action="pause"]').click();await page.locator('#rutPauseReturn').fill('2026-10-15');await page.locator('#rutPauseReturn').press('Tab');
  await expect(page.locator('#rutPausePreview')).toContainText('extras/recuperaciones');await page.locator('#rutBulkConfirm').click();
  await expect(page.locator('[data-history-date="2026-10-08"]')).toHaveCount(0);await expect(page.locator('[data-history-date="2026-10-15"]')).toHaveCount(1);
  expect(await page.evaluate(()=>validateImport(JSON.parse(JSON.stringify({rutinas:RUTINAS}))).rutinas[0].pauses)).toEqual([{from:'2026-10-02',to:'2026-10-14'}]);
});
test('marcadores de rutina contiguos superpuestos y separados apilados',async({page})=>{
  await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewCal').click();
  const consecutive=page.locator('.ev-cell[data-ds="2026-10-01"] .ev-rut-mark');
  const bounds=await consecutive.evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width};}));
  expect(bounds).toHaveLength(2);expect(bounds[1].y).toBe(bounds[0].y);expect(bounds[1].x-bounds[0].x).toBeCloseTo(bounds[0].w*.3,1);
  const separate=await page.locator('.ev-cell[data-ds="2026-10-08"] .ev-rut-mark').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().y));
  expect(separate[1]).toBeGreaterThan(separate[0]+10);
});
test('navegación con la misma geometría en Home y ventanas para ambos estilos',async({page})=>{
  await page.goto('/');
  for(const style of ['professional','original']){
    await page.evaluate(s=>applyNavIconStyle(s),style);
    const home=await page.locator('.data-actions>.data-btn,.data-actions>.data-menu-wrap').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.width];}));
    await page.locator('#eventsBtn').click();
    const events=await page.locator('#eventsOverlay .nav-bar-btn').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.width];}));
    expect(events).toEqual(home);
    await page.locator('#eventsOverlay [data-nav="home"]').click();
  }
});

const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-02T10:00:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');});
 await page.goto('/');
});

test('filtros compactos P/Q, sin Añadir inferior y cumpleaños con Añadir en cabecera',async({page})=>{
 await page.locator('#eventsBtn').click();
 for(const width of [320,400]){
  await page.setViewportSize({width,height:880});
  for(const id of ['evViewQuad','evViewAnnual']){
   await page.locator('#'+id).click();await expect(page.locator('#evAdd')).toHaveCount(0);
   const row=page.locator('.ev-annual-filter-row');await expect(row.getByRole('button',{name:'Gest',exact:true})).toBeVisible();
   await expect(row.getByRole('button',{name:'P/Q',exact:true})).toBeVisible();
   const rects=await row.evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth,tops:[...e.querySelectorAll('button')].map(b=>b.getBoundingClientRect().top)}));
   expect(rects.scroll).toBeLessThanOrEqual(rects.width+1);expect(new Set(rects.tops.map(Math.round)).size).toBe(1);
   await row.getByRole('button',{name:'P/Q',exact:true}).click();await expect(row.getByRole('button',{name:'P/Q',exact:true})).not.toHaveClass(/chip-active/);
   await page.locator('#evCycleFilters').click();await page.locator('#evCycleFilters').click();await page.locator('#evCycleFilters').click();
   await expect(row.getByRole('button',{name:'P/Q',exact:true})).not.toHaveClass(/chip-active/);
   await row.getByRole('button',{name:'P/Q',exact:true}).click();
  }
 }
 await page.locator('#evViewCal').click();await expect(page.locator('#evAdd')).toHaveCount(0);
 await page.locator('#evViewUpcoming').click();await page.locator('#evSubBirthdays').click();
 await expect(page.locator('#evBdayAdd')).toHaveText('Añadir');
 await page.locator('#evBdayAdd').click();await expect(page.locator('#bdFName')).toBeVisible();
});

test('un puntual multidía se lista por fechas y al abrirlo conserva la fecha elegida',async({page})=>{
 await page.evaluate(()=>{
  EVENTS=[{id:'split',kind:'puntual',type:'Otros',shape:'x-outline',title:'Curso de prueba',color:'#8b5e34',start:'2026-09-29',end:'2026-10-09',dates:['2026-09-29','2026-10-03','2026-10-09']}];EV_VIEW='upcoming';openEventsAt();
 });
 const items=page.locator('.ev-upcoming-item[data-id="split"]');await expect(items).toHaveCount(2);
 await expect(items.nth(0)).toHaveAttribute('data-first','2026-10-03');await expect(items.nth(1)).toHaveAttribute('data-first','2026-10-09');
 await expect(page.locator('.ev-upcoming-lbl.ongoing')).toHaveCount(0);
 await items.nth(1).click();await expect(page.locator('#evAlarmOv')).toContainText('09/10');
});

test('partidas: cambios reales, plegado independiente por año y memoria al recargar',async({page})=>{
 await page.evaluate(()=>{
  PERSONAL_DATA={gastosSemanales:[{id:'weekly',label:'Gasto semanal',period:'weekly',amount:40,periods:[{start:'2026-01-01',end:'2026-06-30',period:'weekly',amount:40},{start:'2026-07-01',end:'2026-12-31',period:'weekly',amount:60}]}],gastosRecurrentes:[{id:'transport',label:'Transporte',period:'monthly',amount:35}],inversiones:[],ingresos:[]};savePersonalYear(2026);FISCAL_TAB='personal';openFiscal(2026);
 });
 const save=page.locator('#fiscalSave'),details=page.locator('#personalGastosSem .personal-period-details');
 await expect(save).toBeHidden();await expect(details).toBeHidden();
 await page.locator('#personalFoldAll').click();await expect(details).toBeVisible();await expect(save).toBeHidden();
 await page.reload();await page.evaluate(()=>{FISCAL_TAB='personal';openFiscal(2026);});await expect(details).toBeVisible();
 const amount=page.getByRole('spinbutton',{name:'Importe de Transporte',exact:true});
 await amount.fill('45');await expect(save).toBeVisible();await amount.fill('35');await expect(save).toBeHidden();
 await page.locator('#personalFoldAll').click();await expect(details).toBeHidden();
 await amount.fill('45');await save.click();await page.reload();await page.evaluate(()=>{FISCAL_TAB='personal';openFiscal(2026);});
 await expect(amount).toHaveValue('45');await expect(save).toBeHidden();await expect(details).toBeHidden();
});

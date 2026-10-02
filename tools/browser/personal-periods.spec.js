const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-02T10:00:00'));
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  localStorage.setItem('excelia-theme-v1','light');
  const key='excelia-personal-v1-2026';
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({gastosSemanales:[{id:'weekly',label:'Gastos semanales',amount:50,period:'weekly'}],gastosRecurrentes:[],inversiones:[],ingresos:[]}));
 });
 await page.goto('/');
});

test('períodos editables, parón, copia a ambos lados y recarga sin perder datos',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(()=>{FISCAL_TAB='personal';openFiscal(2026);});
 const advanced=page.locator('#personalGastosSem [data-pp-edit]');await advanced.click();
 await page.getByLabel('Hasta período 1',{exact:true}).fill('2026-06-30');
 await page.getByRole('button',{name:'+ Añadir período',exact:true}).click();
 await page.getByLabel('Importe período 2',{exact:true}).fill('80');
 await page.locator('.personal-pause summary').click();await page.locator('#personalPauseDate').fill('2026-10-01');
 await page.getByRole('button',{name:'Aplicar parón',exact:true}).click();
 await expect(page.getByLabel('Hasta período 2',{exact:true})).toHaveValue('2026-09-30');
 await expect(page.getByLabel('Importe período 3',{exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Guardar períodos',exact:true}).click();
 await expect(page.locator('#personalGastosSem .personal-period-line')).toHaveCount(3);
 await expect(page.locator('#personalGastosSem')).toContainText('Paralizado');
 await page.reload();await page.evaluate(()=>{FISCAL_TAB='personal';openFiscal(2026);});
 await expect(page.locator('#personalGastosSem .personal-period-line')).toHaveCount(3);
 await page.locator('#fiscalYearNext').click();
 page.once('dialog',d=>d.accept());await page.locator('[data-copy-year="2026"]').click();
 await expect(page.locator('#personalGastosSem .personal-period-line')).toHaveCount(1);
 await expect(page.locator('#personalGastosSem .personal-amount')).toHaveText('0,00€');
 await expect(page.locator('#personalGastosSem')).toContainText('Paralizado');
 await page.locator('#fiscalYearPrev').click();await page.locator('#fiscalYearPrev').click();
 page.once('dialog',d=>d.accept());await page.locator('[data-copy-year="2026"]').click();
 await expect(page.locator('#personalGastosSem .personal-amount')).toHaveText('50,00€');
 await expect(page.locator('#personalGastosSem')).not.toContainText('Paralizado');
 // Una coincidencia de fechas nunca se guarda; cerrar descarta el borrador.
 await page.locator('#personalGastosSem [data-pp-edit]').click();await page.getByRole('button',{name:'+ Añadir período',exact:true}).click();
 await page.getByLabel('Desde período 2',{exact:true}).fill('2025-01-01');
 await page.getByRole('button',{name:'Guardar períodos',exact:true}).click();
 await expect(page.locator('.personal-period-error')).toContainText('coinciden');
 await page.locator('#personalPeriodsOverlay').getByRole('button',{name:'Volver',exact:true}).click();
 await expect(page.locator('#personalGastosSem .personal-period-line')).toHaveCount(1);expect(errors).toEqual([]);
});

test('seguros de referencia se editan solo en Fiscal y sobreviven a recargar',async({page})=>{
 await page.evaluate(()=>{FISCAL_TAB='despacho';FISCAL_HIP_SUB='detalle';openFiscal(2026);});
 const ref=page.locator('#desp-segNormalHogar');await ref.fill('225.75');await ref.press('Tab');
 const positions=await page.evaluate(()=>({insurance:document.querySelector('#desp-segNormalHogar').getBoundingClientRect().top,loan:document.querySelector('#hip-section-prestamo').getBoundingClientRect().top}));
 expect(positions.insurance).toBeLessThan(positions.loan);
 await page.locator('#householdDetailLink').click();await expect(page.locator('#householdOverlay')).not.toContainText('Precios referencia seguros');
 await page.reload();await page.evaluate(()=>{FISCAL_TAB='despacho';FISCAL_HIP_SUB='detalle';openFiscal(2026);});
 await expect(ref).toHaveValue('225.75');
});

test('cumpleaños VIP con nombre, color y filtro exclusivo de calendario',async({page})=>{
 await page.evaluate(()=>{BDAYS=[{name:'Cumple normal de prueba',day:2,month:10},{name:'Un cumpleaños VIP de nombre muy largo',day:2,month:10,vip:true}];BDAY_VIEW='cal';BDAY_MONTH=9;BDAY_YEAR=2026;openBday();});
 await page.getByRole('button',{name:'Calendario',exact:true}).click();
 await expect(page.locator('.bday-badge')).toHaveCount(2);await expect(page.locator('.bday-badge-vip img[alt="VIP"]')).toHaveCount(1);
 await page.getByRole('checkbox',{name:'Solo VIPs',exact:true}).check();await expect(page.locator('.bday-badge')).toHaveCount(1);
 await expect(page.locator('.bday-badge-name')).toContainText('Un Cumpleaños Vip');
 await page.getByRole('checkbox',{name:'Solo VIPs',exact:true}).uncheck();await expect(page.locator('.bday-badge')).toHaveCount(2);
 const lines=await page.locator('.bday-badge-name').first().evaluate(e=>getComputedStyle(e).webkitLineClamp);expect(lines).toBe('4');
 const header=await page.evaluate(()=>({next:document.querySelector('#bdNext').getBoundingClientRect().right,tools:document.querySelector('.bday-calendar-tools').getBoundingClientRect().left}));expect(header.tools).toBeGreaterThan(header.next);
});

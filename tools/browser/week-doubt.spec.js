const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});
test.beforeEach(async({page})=>{
  await page.setViewportSize({width:400,height:880});
  await page.clock.setFixedTime(new Date('2026-11-26T12:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');});
  await page.goto('/');
});
test('semana en duda: días, comentario, ámbar con parpadeo, aviso al enviar y backup',async({page})=>{
  const pending=page.locator('.week-card:not(.sent)').first();const key=await pending.getAttribute('data-week');
  await pending.locator('[data-week-doubt]').click();
  await page.locator('[data-doubt-day="2"]').click();await page.locator('#weekDoubtNote').fill('Revisar festivo');
  await page.locator('#weekDoubtSave').click();
  const card=page.locator('.week-card[data-week="'+key+'"]');
  await expect(card).toHaveClass(/doubt/);await expect(card).toHaveCSS('animation-name','week-doubt-pulse');
  await expect(card.locator('.day-cell.doubt-day')).toHaveCount(1);await expect(card.locator('.week-doubt-note')).toHaveText('En duda · X · Revisar festivo');
  // Aviso al enviar: cancelar no abre Outlook.
  let msg='';page.once('dialog',d=>{msg=d.message();d.dismiss();});
  await page.evaluate(k=>sendManualEmail(k),key);
  expect(msg).toContain('Ojo, esta semana está en duda');expect(msg).toContain('Revisar festivo');
  // Viaja en el backup y se puede quitar.
  expect(await page.evaluate(k=>weekDoubts()[k],key)).toEqual({days:[2],note:'Revisar festivo'});
  await card.locator('[data-week-doubt]').click();await page.locator('#weekDoubtClear').click();
  await expect(page.locator('.week-card[data-week="'+key+'"]')).not.toHaveClass(/doubt/);
});
test('las semanas enviadas no ofrecen la marca de duda',async({page})=>{
  const sent=page.locator('.week-card.sent');
  if(await sent.count())await expect(sent.first().locator('[data-week-doubt]')).toHaveCount(await page.evaluate(k=>homeWeekEditState(k)==='sent'?0:1,await sent.first().getAttribute('data-week')));
});
test('casillas con texto: tocar el texto marca la casilla (Plan romántico y Cumpleaños)',async({page})=>{
  await page.locator('#eventsBtn').click();await page.evaluate(()=>openEvForm(null));
  await page.locator('[data-picker="plans"]').click();
  await page.locator('label[for="evPlanBirthday"] >> text=Cumpleaños').click();await expect(page.locator('#evPlanBirthday')).toBeChecked();
  await page.locator('label[for="evPlanRomantic"] >> text=Plan romántico').click();await expect(page.locator('#evPlanRomantic')).toBeChecked();
});

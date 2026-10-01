const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
  await page.goto('/');
});
async function swipe(locator,left){
  await locator.evaluate((el,left)=>{
    const point=x=>new Touch({identifier:1,target:el,clientX:x,clientY:420});
    el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[point(left?300:80)]}));
    el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[point(left?80:300)]}));
  },left);
}
for(const kind of ['luz','gas'])test(kind+': el primer panel cambia de año y el resto cambia de pestaña',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.evaluate(kind=>{ENERGY_ANALYSIS_YEAR=2026;ENERGY_ANALYSIS_TAB='resumen';openEnergyAnalysis(kind);},kind);
  const active=()=>page.locator('[data-energy-tab].active');
  const year=()=>page.locator('.energy-year-nav strong');
  for(const tab of ['resumen','consumo','costes']){
    await page.locator('[data-energy-tab="'+tab+'"]').click();
    // Desde un hijo real del primer panel: el gesto no debe llegar al padre.
    await swipe(page.locator('.energy-window-content > :first-child').locator('span').first(),true);
    await expect(year()).toHaveText('2027');await expect(active()).toHaveAttribute('data-energy-tab',tab);
    await swipe(page.locator('.energy-window-content > :first-child').locator('span').first(),false);
    await expect(year()).toHaveText('2026');await expect(active()).toHaveAttribute('data-energy-tab',tab);
    await swipe(page.locator('.energy-window-header h2'),true);
    await expect(active()).toHaveAttribute('data-energy-tab',tab==='resumen'?'consumo':tab==='consumo'?'costes':'tarifas');
    await expect(year()).toHaveText('2026');
  }
  await swipe(page.locator('.energy-reference-strip > strong'),true);
  await expect(active()).toHaveAttribute('data-energy-tab','comparar');await expect(year()).toHaveText('2026');
  await swipe(page.locator('.energy-window-content > :first-child h3'),false);
  await expect(active()).toHaveAttribute('data-energy-tab','tarifas');await expect(year()).toHaveText('2026');
  await swipe(page.locator('.energy-reference-strip > strong'),false);
  await expect(active()).toHaveAttribute('data-energy-tab','costes');
  await expect(page.getByRole('button',{name:'Importar datos',exact:true})).toHaveText('↑');
  expect(errors).toEqual([]);
});

test('Próximos mantiene la posición de los cuatro títulos al cambiar de pestaña',async({page})=>{
  await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();
  const positions=[];
  for(const id of ['evSubUpcoming','evSubBirthdays','evSubAgenda','evSubTodos','evSubUpcoming']){
    await page.locator('#'+id).click();
    positions.push(await page.locator('.ev-upcoming-tabs .econ-sub-tab').evaluateAll(els=>els.map(el=>{
      const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];
    })));
  }
  for(const row of positions)row.forEach((r,i)=>r.forEach((v,j)=>expect(Math.abs(v-positions[0][i][j])).toBeLessThan(1)));
  const row=positions[0],gaps=row.slice(1).map((r,i)=>r[0]-row[i][0]-row[i][2]);
  expect(Math.max(...gaps)-Math.min(...gaps)).toBeLessThan(1);
});

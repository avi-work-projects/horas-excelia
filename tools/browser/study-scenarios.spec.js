const {test,expect}=require('@playwright/test');
const fixture=require('../visual-map/fixture.cjs');
const scenarios=[
 {label:'A',rateType:'daily',rateValue:300,hoursMode:'real'},
 {label:'B',rateType:'salary',rateValue:52000,hoursMode:'real'},
 {label:'C',rateType:'hourly',rateValue:38,hoursMode:'8h'}
];
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00+02:00'));
 await page.addInitScript(({data,scenarios})=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  for(const [key,value]of Object.entries(data))localStorage.setItem(key,JSON.stringify(value));
  localStorage.setItem('excelia-econ-comp-v1',JSON.stringify(scenarios));
  localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');
 },{data:fixture(),scenarios});
 await page.goto('/');
 if(await page.locator('#homePopupClose').isVisible())await page.locator('#homePopupClose').click();
 await page.locator('#estudioBtn').click();await page.locator('#ecSubComp').click();
});
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-econ-comp-v1')));

test('cada escenario muestra un tipo activo y un único importe con su unidad',async({page})=>{
 const cards=page.locator('.econ-scenario-card');await expect(cards).toHaveCount(3);
 const expected=[['€/día','300','€/día'],['Nómina','52000','€/año bruto'],['€/h 8h','38','€/hora (8h)']];
 for(const [i,[type,value,unit]]of expected.entries()){
  const card=cards.nth(i);
  await expect(card.locator('.econ-sc-type')).toHaveCount(4);
  await expect(card.locator('.econ-sc-type[aria-pressed=true]')).toHaveText(type);
  await expect(card.locator('.econ-sc-input')).toHaveValue(value);await expect(card.locator('.econ-sc-unit')).toHaveText(unit);
 }
 await expect(page.locator('.study-intro p')).toHaveCount(0);
});

test('cambiar el tipo conserva el importe y se guarda; editar el importe también',async({page})=>{
 const b=page.locator('.econ-scenario-card').nth(1);
 await b.getByRole('button',{name:'€/h real'}).click();
 expect((await stored(page))[1]).toMatchObject({rateType:'hourly',hoursMode:'real',rateValue:52000});
 await expect(page.locator('.econ-scenario-card').nth(1).locator('.econ-sc-unit')).toHaveText('€/hora real');
 const a=page.locator('.econ-scenario-card').nth(0).locator('.econ-sc-input');
 await a.fill('320');await a.press('Tab');
 expect((await stored(page))[0]).toMatchObject({rateType:'daily',rateValue:320});
 await page.locator('.econ-scenario-card').nth(0).getByRole('button',{name:'Nómina'}).click();
 expect((await stored(page))[0]).toMatchObject({rateType:'salary',rateValue:320});
});

test('ordenar, quitar y añadir mantienen las letras consecutivas',async({page})=>{
 await page.getByRole('button',{name:'Subir escenario C'}).click();
 expect((await stored(page)).map(s=>s.label+':'+s.rateType)).toEqual(['A:daily','B:hourly','C:salary']);
 await page.getByRole('button',{name:'Quitar escenario A'}).click();
 expect((await stored(page)).map(s=>s.label)).toEqual(['A','B']);
 await expect(page.locator('.econ-sc-del')).toHaveCount(0);
 await page.locator('#ecAddScenario').click();await expect(page.locator('.econ-scenario-card')).toHaveCount(3);
});

for(const width of [320,400])test(`resultados sin desbordamiento en ${width}px y gráfico con colores del tema`,async({page},info)=>{
 await page.setViewportSize({width,height:880});
 const body=page.locator('#estudioOverlay .sy-body');
 expect(await body.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 for(const card of await page.locator('.econ-sc-type').all())expect(await card.evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
 await page.locator('#ecCompCalcular').click();
 const totals=page.locator('.econ-comp-total');await expect(totals).toHaveCount(3);
 await expect(totals.nth(0).locator('.econ-comp-delta')).toHaveText('Referencia');
 await expect(totals.nth(1).locator('.econ-comp-delta')).toHaveClass(/neg/);await expect(totals.nth(1).locator('.econ-comp-delta')).toContainText('vs A');
 await expect(page.locator('.econ-comp-table thead .econ-sc-badge')).toHaveText(['A','B','C']);
 expect(await page.locator('.econ-comp-table-wrap').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 expect(await body.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 const svg=await page.locator('.econ-line-chart').evaluate(e=>e.outerHTML);
 expect(svg).not.toContain('#2a2a3e');expect(svg).not.toContain('#0d0d14');
 await page.locator('#ecChartDiff').click();await expect(page.locator('#ecChartDiff')).toHaveClass(/active/);
 await expect(page.locator('.econ-line-chart polyline')).toHaveCount(2);
 if(width===400)await page.screenshot({path:info.outputPath('comparar-escenarios.png'),fullPage:true});
});

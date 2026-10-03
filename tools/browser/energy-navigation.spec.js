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
  await expect(page.getByRole('button',{name:'Importar datos',exact:true})).toHaveText('Importar');
  expect(errors).toEqual([]);
});

test('Próximos mantiene la posición de los cuatro títulos al cambiar de pestaña',async({page})=>{
  await page.evaluate(()=>{
    const now=new Date();
    EVENTS=Array.from({length:30},(_,i)=>{
      const date=dk(new Date(now.getFullYear(),now.getMonth(),now.getDate()+i));
      return {id:'tabs-'+i,kind:'puntual',type:'Otros',title:'Evento de prueba '+i,start:date,end:date,color:'#65a367'};
    });
    BDAYS=[];
  });
  await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();
  for(const width of [320,400]){
    await page.setViewportSize({width,height:880});
    const positions=[];
    for(const id of ['evSubUpcoming','evSubBirthdays','evSubAgenda','evSubTodos','evSubUpcoming']){
      await page.locator('#'+id).click();
      const title={evSubUpcoming:'Próximos eventos',evSubBirthdays:'Cumpleaños',evSubTodos:'Todos los Eventos'}[id];
      if(title)await expect(page.locator('#eventsContent>.sy-header .sy-year')).toHaveText(title);
      if(id==='evSubBirthdays'){
        const layout=await page.locator('#eventsContent>.sy-header').evaluate(e=>{
          const back=e.querySelector('.sy-back').getBoundingClientRect(),add=e.querySelector('.bday-header-add').getBoundingClientRect(),title=e.querySelector('.sy-year').getBoundingClientRect();
          return {backWidth:back.width,backHeight:back.height,gap:title.left-add.right};
        });
        expect(layout.backWidth).toBe(36);expect(layout.backHeight).toBe(36);expect(layout.gap).toBeGreaterThan(2);
      }
      // Medir también las letras y con el listado desplazado, no solo las cajas vacías.
      await page.locator('#eventsContent .sy-body').evaluate(el=>el.scrollTop=240);
      positions.push(await page.locator('.ev-upcoming-tabs .econ-sub-tab').evaluateAll(els=>els.map(el=>{
        const r=el.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(el);
        const text=range.getBoundingClientRect();return [r.x,r.y,r.width,r.height,text.x,text.width];
      })));
    }
    for(const [view,row] of positions.entries())row.forEach((r,i)=>r.forEach((v,j)=>expect(Math.abs(v-positions[0][i][j]),width+'px, vista '+view+', botón '+i+', medida '+j).toBeLessThan(1)));
    const row=positions[0],gaps=row.slice(1).map((r,i)=>r[0]-row[i][0]-row[i][2]);
    expect(Math.max(...gaps)-Math.min(...gaps)).toBeLessThan(1);
  }
});

for(const kind of ['luz','gas'])test(kind+': Total oculta el año y permite volver al mismo año',async({page})=>{
  await page.evaluate(kind=>{ENERGY_ANALYSIS_YEAR=2025;ENERGY_ANALYSIS_TAB='resumen';ENERGY_SUMMARY_TOTAL=false;openEnergyAnalysis(kind);},kind);
  await expect(page.locator('#energyAnalysisOverlay')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  const selector=page.locator('.energy-year-selector'),total=page.locator('#energySummaryTotal');
  const before=await total.boundingBox();
  await total.click();await expect(selector).toBeHidden();await expect(total).toHaveAttribute('aria-pressed','true');
  expect(await total.boundingBox()).toEqual(before);
  await total.click();await expect(selector).toBeVisible();await expect(selector.locator('strong')).toHaveText('2025');
  await total.click();await page.locator('[data-energy-tab="consumo"]').click();
  await expect(selector).toBeVisible();await expect(selector.locator('strong')).toHaveText('2025');
  await page.locator('[data-energy-tab="resumen"]').click();await expect(selector).toBeHidden();
});

test('fiscal abre con opciones antiguas y las subpestañas mantienen toda su casilla',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.evaluate(()=>{
    ECON_YEAR=2026;
    localStorage.setItem('excelia-personal-v1-2026',JSON.stringify({gastosRecurrentes:[],gastosSemanales:[],inversiones:[],ingresos:[],limpiezaCasa:{enabled:true,amount:40}}));
  });
  await page.locator('#econBtn').click();await page.locator('#ecGear').click();
  await expect(page.locator('#fiscalOverlay')).toHaveClass(/open/);
  await expect(page.locator('#fiscalTabPersonal')).toHaveClass(/active/);
  for(const section of ['fiscalTabIrpfDeduc','fiscalTabDespacho']){
    await page.locator('#'+section).click();
    const tabs=page.locator('#fiscalOverlay .econ-sub-tab'),count=await tabs.count();
    let initial;
    for(let i=0;i<count;i++){
      await tabs.nth(i).click();
      const rects=await tabs.evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {x:r.x,width:r.width,height:r.height,border:s.borderBottomColor,background:s.backgroundColor};}));
      initial=initial||rects;
      rects.forEach((r,j)=>{expect(Math.abs(r.width-initial[j].width)).toBeLessThan(1);expect(Math.abs(r.x-initial[j].x)).toBeLessThan(1);expect(Math.abs(r.height-rects[0].height)).toBeLessThan(1);});
      expect(Math.max(...rects.map(r=>r.width))-Math.min(...rects.map(r=>r.width))).toBeLessThan(1);
      expect(rects[i].background).not.toBe('rgba(0, 0, 0, 0)');
      expect(rects[i].border).not.toBe('rgba(0, 0, 0, 0)');
      rects.filter((_,j)=>j!==i).forEach(r=>expect(r.border).toBe('rgba(0, 0, 0, 0)'));
    }
  }
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-personal-v1-2026')).limpiezaCasa.amount)).toBe(40);
});

test('los pesos se ven enteros y conservan la precisión hasta que se editan',async({page})=>{
  async function openEditor(){
    await page.evaluate(()=>openEnergyTariff('luz',energyTariffDefaults({energyMode:'tramos',periodPrices:[.3,.2,.1],periodWeights:[19.72,30.64,49.64]}),tariff=>window.qaSavedTariff=tariff,document.body));
  }
  await openEditor();
  for(const [i,value] of ['20','31','49'].entries())await expect(page.locator('[name="weight'+i+'"]')).toHaveValue(value);
  await page.getByRole('button',{name:'Guardar tarifa',exact:true}).click();
  expect(await page.evaluate(()=>qaSavedTariff.periodWeights)).toEqual([19.72,30.64,49.64]);
  await expect(page.locator('#energyTariffWrap')).toHaveCount(0);
  await openEditor();
  await page.locator('[name="weight0"]').fill('21');await page.locator('[name="weight2"]').fill('48');
  await page.getByRole('button',{name:'Guardar tarifa',exact:true}).click();
  expect(await page.evaluate(()=>qaSavedTariff.periodWeights)).toEqual([21,31,48]);
});

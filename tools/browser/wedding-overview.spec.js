const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  await page.goto('/');
  await page.evaluate(()=>{
    BODA_COUPLES=[{id:'past',name:'Pareja pasada',weddingDate:'2026-10-20',contracted:4,color:'#eaa155'},{id:'active',name:'Pareja activa',weddingDate:'2026-11-24',contracted:4,color:'#50aa80'},{id:'nodate',name:'Sin fecha',contracted:4,color:'#ba80ae'},{id:'future',name:'Pareja próxima',future:true,weddingDate:'2026-11-30',contracted:4,color:'#72aacc'}];
    EVENTS=[['past','2026-10-01','18:00'],['active','2026-10-24','11:00'],['active','2026-10-24','11:30'],['active','2026-10-24',null],['future','2026-11-01','18:00'],[null,'2026-10-01','19:00']].map(([coupleId,start,time],i)=>({id:'cl'+i,kind:'puntual',type:'Ensayos boda',title:'Ensayo',start,end:start,boda:{coupleId,time,duration:60}}));
    EV_VIEW='bodas';BODA_SUBTAB='clases';openEventsAt();
  });
});

test('acciones de Clases y Parejas comparten acento y abren sus formularios',async({page})=>{
  await expect(page.locator('.boda-create-actions button')).toHaveText(['+ Añadir clase','+ Añadir pareja']);
  for(const width of [320,400]){
    await page.setViewportSize({width,height:880});
    const boxes=await page.locator('.boda-create-actions button').evaluateAll(es=>es.map(el=>{const r=el.getBoundingClientRect();return {y:r.y,width:r.width,height:r.height,bg:getComputedStyle(el).backgroundColor};}));
    expect(boxes[0].y).toBe(boxes[1].y);expect(boxes[0].width).toBe(boxes[1].width);expect(boxes[0].height).toBe(boxes[1].height);expect(boxes[0].bg).toBe(boxes[1].bg);
  }
  const color=await page.locator('#bodaAddClass').evaluate(el=>getComputedStyle(el).backgroundColor);
  await expect(page.locator('#bodaAddClass')).toHaveCSS('background-color','rgb(107, 31, 32)');
  await page.screenshot({path:'test-results/wedding-clases.png'});
  await page.locator('#bodaAddClass').click();await expect(page.locator('#bodaFormOv')).toBeVisible();await expect(page.locator('#bodaFormSave')).toHaveCSS('background-color',color);await page.locator('#bodaFormClose').click();
  await page.locator('#bodaAddCouple').click();await expect(page.locator('#bodaCFormOv')).toBeVisible();await expect(page.locator('#bodaCSave')).toHaveCSS('background-color',color);
  await page.locator('#bodaCName').fill('Pareja creada desde Clases');await page.locator('#bodaCFuture').check();await page.locator('#bodaCSave').click();
  await expect.poll(()=>page.evaluate(()=>BODA_COUPLES.length)).toBe(5);expect(await page.evaluate(()=>BODA_SUBTAB)).toBe('clases');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem(BODAS_SK)).some(c=>c.name==='Pareja creada desde Clases'))).toBe(true);
  await page.locator('[data-bsub=parejas]').click();await expect(page.locator('#bodaAddCouple')).toHaveCSS('background-color',color);
  await page.locator('[data-bsub=config]').click();await expect(page.locator('#bodaSaveTeacherNames')).toHaveCSS('background-color',color);
  for(const theme of ['grey','dark']){
    await page.evaluate(t=>applyTheme(t),theme);await page.locator('[data-bsub=clases]').click();
    await page.screenshot({path:'test-results/wedding-clases-'+theme+'.png'});
    await expect(page.locator('#bodaAddClass')).toHaveCSS('color',theme==='dark'?'rgb(35, 23, 25)':'rgb(255, 255, 255)');
  }
});

test('resumen coherente, distribución con cero clases y enlaces por estado',async({page})=>{
  await page.locator('[data-bsub=stats]').click();
  await expect(page.locator('[aria-label="Resumen de parejas"] .boda-overview-total b')).toHaveText('4');
  await expect(page.locator('[aria-label="Resumen de parejas"] .boda-overview-grid b')).toHaveText(['1','2','1']);
  await expect(page.locator('[aria-label="Resumen de clases"] .boda-overview-grid b')).toHaveText(['2','3','1']);
  await expect(page.locator('[aria-label="Resumen de clases"] .boda-overview-total b')).toHaveText('6');
  await expect(page.locator('.boda-distribution-row')).toHaveText(['Sin empezar2','1 clase2']);
  await page.screenshot({path:'test-results/wedding-estadisticas.png'});
  await page.locator('.boda-distribution').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/wedding-distribucion.png'});
  await page.setViewportSize({width:320,height:880});
  expect(await page.locator('.boda-sec').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  for(const [filter,names] of [['pasadas',['Pareja pasada']],['activas',['Pareja activa','Sin fecha']],['futuras',['Pareja próxima']],['todas',['Pareja pasada','Pareja activa','Pareja próxima','Sin fecha']]]){
    await page.locator('[data-bsub=stats]').click();await page.locator('[data-stats-couples='+filter+']').click();
    await expect(page.locator('.boda-name')).toHaveText(names);
  }
  await page.evaluate(()=>{EVENTS=[];BODA_SUBTAB='stats';refreshEvents(false);});
  await expect(page.locator('#bodaStatsCouples b')).toHaveText('4');await expect(page.locator('.boda-distribution-row')).toHaveText(['Sin empezar4']);
  await page.evaluate(()=>{BODA_COUPLES=[];refreshEvents(false);});await expect(page.locator('#bodaStatsCouples b')).toHaveText('0');await expect(page.locator('.boda-distribution')).toContainText('Todavía no hay parejas registradas');
});

// Verificación funcional del visor y exportación de dos láminas PNG para revisión.
const fs=require('node:fs'),path=require('node:path');
const {chromium,expect}=require('@playwright/test');
const {startServer}=require('./serve.cjs');
const {createTracker,exportFingerprint,digest}=require('./tracking.cjs');
const {scenes,edges}=require('./catalog.cjs');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/visual-map'),qa=path.join(root,'test-results/visual-map');
function writeChanged(file,content){const bytes=Buffer.from(content);if(!fs.existsSync(file)||!fs.readFileSync(file).equals(bytes))fs.writeFileSync(file,bytes);}
async function main(){
  const data=JSON.parse(fs.readFileSync(path.join(out,'map-data.json'),'utf8'));
  const tracker=createTracker({root,scenes,edges,assets:require('../../app-assets.json')});
  if(JSON.stringify(data.scenes.map(s=>s.id))!==JSON.stringify(scenes.map(s=>s.id)))throw Error('Índice del catálogo desfasado');
  const manifestFile=path.join(out,'export-state.json');let previous={};
  try{previous=JSON.parse(fs.readFileSync(manifestFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  const renderer=digest(['index.html','viewer.js','viewer.css','review-notes.js'].map(file=>fs.readFileSync(path.join(out,file),'utf8').replace(/\r\n/g,'\n')).join('\n'));
  const next={},updated=[];
  function needsExport(id,ids,files){
    const fingerprint=exportFingerprint(data,ids,renderer);next[id]={fingerprint,files};
    return process.argv.includes('--force-exports')||previous[id]?.fingerprint!==fingerprint||files.some(file=>!fs.existsSync(path.join(out,file))||previous[id]?.hashes?.[file]!==digest(fs.readFileSync(path.join(out,file))));
  }
  function recordExport(id){next[id].hashes=Object.fromEntries(next[id].files.map(file=>[file,digest(fs.readFileSync(path.join(out,file)))]));}
  fs.mkdirSync(qa,{recursive:true});
  for(const s of data.scenes){if(!s.image||!fs.existsSync(path.join(out,s.image)))throw new Error('Falta captura: '+s.id);if(!tracker.fresh(scenes.find(scene=>scene.id===s.id),s))throw Error('Captura desfasada: '+s.id);if(s.imageHash!==digest(fs.readFileSync(path.join(out,s.image))))throw Error('Imagen alterada sin comprobar: '+s.id);}
  for(const e of data.edges){const s=data.scenes.find(s=>s.id===e.from),t=data.scenes.find(s=>s.id===e.to);if(!s.anchors[e.to]||!s.verifiedEdges.includes(e.to))throw new Error('Relación no comprobada: '+e.from+' → '+e.to);if(t.route.length===s.route.length+1&&JSON.stringify(t.route.slice(0,-1))===JSON.stringify(s.route)){const step=t.route.at(-1);if(e.action==='scroll'?!step.scroll:JSON.stringify(step)!==JSON.stringify(e.step||e.selector))throw Error('El control de la flecha no corresponde a la ruta: '+e.from+' → '+e.to);}}
  if(data.inventory.some(x=>x.status==='Pendiente de captura'))throw Error('Quedan entradas del inventario pendientes de captura');
  const server=await startServer(),url='http://127.0.0.1:'+server.address().port;let browser;
  try{
    browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
    const page=await browser.newPage({viewport:{width:1500,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'/docs/visual-map/index.html');await page.locator('#nodes img').first().waitFor();
    await expect(page.locator('.screen-node')).toHaveCount(7);await expect(page.locator('#connections > g')).toHaveCount(6);
    await page.screenshot({path:path.join(qa,'preview-general.png'),fullPage:true});
    await page.locator('[data-scene="home"] [data-target="calendar"]').click();await expect(page.locator('#selectedTitle')).toHaveText('Calendario · 1 mes');
    await page.locator('[data-view="flow"]').click();
    await expect(page.locator('[data-view="flow"]')).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.screen-node')).toHaveCount(6);await page.locator('#fit').click();await page.screenshot({path:path.join(qa,'preview-flow.png'),fullPage:true});
    await page.locator('#returns').check();await expect(page.locator('#connections > g')).toHaveCount(8);await page.locator('#returns').uncheck();
    await page.locator('[data-scene="calendar"] img').click();await expect(page.locator('#screenDialog')).toBeVisible();await page.locator('.close-dialog').click();
    await page.locator('#zoomIn').click();const z=await page.locator('#zoomValue').textContent();await page.locator('#zoomOut').click();if(z===await page.locator('#zoomValue').textContent())throw new Error('No cambia el zoom');
    await page.locator('[data-view="compare"]').click();await expect(page.locator('#compareGrid img')).toHaveCount(3);await page.screenshot({path:path.join(qa,'preview-comparison.png'),fullPage:true});
    await page.locator('[data-view="inventory"]').click();await page.locator('#inventorySearch').fill('Multidía');await expect(page.locator('#inventoryTable tbody tr')).toHaveCount(1);await expect(page.locator('#inventoryTable')).toContainText('Ver captura');
    await page.locator('[data-inventory-scene="dates"]').click();await expect(page.locator('#selectedTitle')).toHaveText('Selección Multidía');
    await page.locator('#fit').click();const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const svg=fs.readFileSync(await download.path(),'utf8');if(!svg.includes('data:image/png;base64,')||!svg.includes('marker-end'))throw new Error('SVG incompleto');
    const flowChanged=needsExport('flow',data.scenes.filter(s=>s.flow).map(s=>s.id),['map-flow.svg','map-flow.png']);
    if(flowChanged)writeChanged(path.join(out,'map-flow.svg'),svg);
    await page.locator('[data-view="general"]').click();
    const generalChanged=needsExport('general',data.scenes.filter(s=>s.layout).map(s=>s.id),['map-general.svg','map-general.png']);
    if(generalChanged){const dl=page.waitForEvent('download');await page.locator('#export').click();writeChanged(path.join(out,'map-general.svg'),fs.readFileSync(await(await dl).path()));}
    // Convertir las mismas láminas exportadas, con capturas incrustadas, a PNG compartibles.
    for(const name of ['general','flow']){
      if(!(name==='general'?generalChanged:flowChanged)){recordExport(name);continue;}updated.push(name);
      const imagePage=await browser.newPage({viewport:{width:name==='general'?1950:1400,height:1300},deviceScaleFactor:1});
      await imagePage.goto(url+'/docs/visual-map/map-'+name+'.svg');writeChanged(path.join(out,'map-'+name+'.png'),await imagePage.screenshot());await imagePage.close();recordExport(name);
    }
    // Recorrer todas las secciones y exportar láminas sin la interfaz del visor.
    fs.mkdirSync(path.join(out,'sheets'),{recursive:true});const sheets=[];
    const areas=await page.locator('#areaSelect option').evaluateAll(els=>els.filter(e=>e.value).map(e=>({id:e.value,title:e.textContent})));
    for(const area of areas){
      await page.locator('#areaSelect').selectOption(area.id);await expect(page.locator('#viewTitle')).toHaveText(area.title);
      await page.locator('#focusEdges').uncheck();
      const count=await page.locator('.screen-node').count();if(count<1||count>11)throw Error('Lámina no acotada: '+area.id);
      const ids=await page.locator('.screen-node').evaluateAll(els=>els.map(e=>e.dataset.scene));
      const image='sheets/'+area.id+'.png';sheets.push({...area,image,scenes:ids});
      if(!needsExport(area.id,ids,[image])){recordExport(area.id);continue;}updated.push(area.id);
      const exported=page.waitForEvent('download');await page.locator('#export').click();const file=await exported;await file.saveAs(path.join(qa,area.id+'.svg'));
      const p=await browser.newPage({viewport:{width:1500,height:2100}});await p.goto(url+'/test-results/visual-map/'+area.id+'.svg');await p.locator('image').first().waitFor({state:'attached'});
      const size=await p.locator('svg').evaluate(el=>({width:+el.getAttribute('width'),height:+el.getAttribute('height')}));await p.setViewportSize(size);writeChanged(path.join(out,image),await p.screenshot());await p.close();recordExport(area.id);
    }
    writeChanged(path.join(out,'sheets/index.json'),JSON.stringify(sheets,null,2)+'\n');
    // Seguir un enlace entre secciones y volver desde su procedencia.
    await page.locator('[data-view="inventory"]').click();await page.locator('#inventorySearch').fill('Ficha de sesión');await page.locator('[data-inventory-scene="routine-session"]').click();await expect(page.locator('#selectedTitle')).toHaveText('Ficha de sesión');
    await page.locator('#destinations [data-target="calendar"]').click();await expect(page.locator('#selectedTitle')).toHaveText('Calendario · 1 mes');
    await page.locator('[data-view="inventory"]').click();await page.locator('#inventorySearch').fill('Ficha de clase');await page.locator('[data-inventory-scene="wedding-class"]').click();await expect(page.locator('#selectedNote')).not.toContainText('P1');
    const historical=data.scenes.find(s=>s.reviewHistory?.length);
    if(historical){await page.locator('[data-view="inventory"]').click();await page.locator('#inventorySearch').fill(historical.title);await page.locator('[data-inventory-scene="'+historical.id+'"]').click();await expect(page.locator('#selectedMeta')).toContainText('revisión anterior conservada');}
    await page.locator('[data-view="compare"]').click();await page.locator('#compareGroup').selectOption('Rutinas');if(await page.locator('#compareChoices input').count()<10)throw Error('Falta filtro de comparación por sección');
    await page.locator('[data-view="general"]').click();
    await page.setViewportSize({width:440,height:950});await page.screenshot({path:path.join(root,'test-results/visual-map-mobile.png'),fullPage:true});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw new Error('El visor desborda en móvil');
    if(errors.length)throw new Error(errors.join('\n'));
    writeChanged(manifestFile,JSON.stringify(next,null,2)+'\n');
    console.log('Láminas actualizadas: '+updated.length+'; conservadas: '+(Object.keys(next).length-updated.length)+'.');
    console.log('Visor comprobado en Edge: '+areas.length+' láminas por sección, enlaces, regreso, zoom, ampliación, comparativa, inventario, exportación y móvil.');
    console.log(data.scenes.length+' capturas · '+data.edges.length+' relaciones · '+data.inventory.length+' entradas localizadas · '+data.openers.length+' aperturas en censo técnico.');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

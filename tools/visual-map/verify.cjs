// Verificación funcional del visor y exportación de dos láminas PNG para revisión.
const fs=require('node:fs'),path=require('node:path');
const {chromium,expect}=require('@playwright/test');
const {startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/visual-map'),qa=path.join(root,'test-results/visual-map');
async function main(){
  const data=JSON.parse(fs.readFileSync(path.join(out,'map-data.json'),'utf8'));
  fs.mkdirSync(qa,{recursive:true});
  for(const s of data.scenes){if(!s.image||!fs.existsSync(path.join(out,s.image)))throw new Error('Falta captura: '+s.id);}
  for(const e of data.edges){const s=data.scenes.find(s=>s.id===e.from);if(!s.anchors[e.to]||!s.verifiedEdges.includes(e.to))throw new Error('Relación no comprobada: '+e.from+' → '+e.to);}
  const server=await startServer(),url='http://127.0.0.1:'+server.address().port;let browser;
  try{
    browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
    const page=await browser.newPage({viewport:{width:1500,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'/docs/visual-map/index.html');await page.locator('#nodes img').first().waitFor();
    await expect(page.locator('.screen-node')).toHaveCount(7);await expect(page.locator('#connections > g')).toHaveCount(6);
    await page.screenshot({path:path.join(qa,'preview-general.png'),fullPage:true});
    await page.locator('[data-scene="home"] [data-target="events"]').click();await expect(page.locator('#selectedTitle')).toHaveText('Eventos · Próximos');
    await page.locator('#destinations [data-target="calendar"]').click();await expect(page.locator('[data-view="flow"]')).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.screen-node')).toHaveCount(6);await page.locator('#fit').click();await page.screenshot({path:path.join(qa,'preview-flow.png'),fullPage:true});
    await page.locator('#returns').check();await expect(page.locator('#connections > g')).toHaveCount(8);await page.locator('#returns').uncheck();
    await page.locator('[data-scene="calendar"] img').click();await expect(page.locator('#screenDialog')).toBeVisible();await page.locator('.close-dialog').click();
    await page.locator('#zoomIn').click();const z=await page.locator('#zoomValue').textContent();await page.locator('#zoomOut').click();if(z===await page.locator('#zoomValue').textContent())throw new Error('No cambia el zoom');
    await page.locator('[data-view="compare"]').click();await expect(page.locator('#compareGrid img')).toHaveCount(3);await page.screenshot({path:path.join(qa,'preview-comparison.png'),fullPage:true});
    await page.locator('[data-view="inventory"]').click();await page.locator('#inventorySearch').fill('Multidía');await expect(page.locator('#inventoryTable tbody tr')).toHaveCount(1);await expect(page.locator('#inventoryTable')).toContainText('Ver captura');
    await page.locator('[data-inventory-scene="dates"]').click();await expect(page.locator('#selectedTitle')).toHaveText('Selección Multidía');
    await page.locator('#fit').click();const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const svg=fs.readFileSync(await download.path(),'utf8');if(!svg.includes('data:image/png;base64,')||!svg.includes('marker-end'))throw new Error('SVG incompleto');
    await download.saveAs(path.join(out,'map-flow.svg'));
    await page.locator('[data-view="general"]').click();const dl=page.waitForEvent('download');await page.locator('#export').click();await(await dl).saveAs(path.join(out,'map-general.svg'));
    // Convertir las mismas láminas exportadas, con capturas incrustadas, a PNG compartibles.
    for(const name of ['general','flow']){
      const imagePage=await browser.newPage({viewport:{width:name==='general'?1950:1400,height:1300},deviceScaleFactor:1});
      await imagePage.goto(url+'/docs/visual-map/map-'+name+'.svg');await imagePage.screenshot({path:path.join(out,'map-'+name+'.png')});await imagePage.close();
    }
    await page.setViewportSize({width:440,height:950});await page.screenshot({path:path.join(root,'test-results/visual-map-mobile.png'),fullPage:true});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw new Error('El visor desborda en móvil');
    if(errors.length)throw new Error(errors.join('\n'));
    console.log('Visor comprobado en Edge: enlaces, regreso, zoom, ampliación, comparativa, inventario, exportación y móvil.');
    console.log(data.scenes.length+' capturas · '+data.edges.length+' relaciones · '+data.inventory.length+' entradas localizadas · '+data.openers.length+' aperturas en censo técnico.');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

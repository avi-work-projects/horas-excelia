const path=require('node:path'),fs=require('node:fs'),{chromium,expect}=require('@playwright/test'),{startServer}=require('./serve.cjs');
async function main(){
 const root=path.resolve(__dirname,'../..'),server=await startServer();let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/docs/visual-map/review/updates-v502.html');await expect(page.locator('.finding')).toHaveCount(5);
  for(const article of await page.locator('.finding').all()){await article.scrollIntoViewIfNeeded();const id=await article.getAttribute('id');await article.locator('.evidence-grid').screenshot({path:path.join(root,'docs/visual-map/review',id+'-v502-comparison.png')});}
  await page.locator('[data-picture]').first().click();await expect(page.locator('#picture')).toBeVisible();await page.locator('.close-dialog').click();
  for(const src of await page.locator('img[src]').evaluateAll(els=>els.map(el=>el.getAttribute('src'))))if(!fs.existsSync(path.resolve(root,'docs/visual-map/review',src)))throw Error('Falta imagen '+src);
  for(const width of [320,400,440]){await page.setViewportSize({width,height:880});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Informe desborda en '+width);}
  if(errors.length)throw Error(errors.join('\n'));console.log('Comparativa v502 verificada: cinco casos, evidencias, ampliación y móvil.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

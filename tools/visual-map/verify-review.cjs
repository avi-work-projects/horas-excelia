const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {chromium,expect}=require('@playwright/test'),{startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/visual-map/review');
async function main(){
 const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(out,'findings.js'),'utf8'),scope);
 const findings=scope.window.VISUAL_REVIEW.findings,coverage=JSON.parse(fs.readFileSync(path.join(out,'coverage.json'),'utf8'));
 if(findings.filter(f=>f.status==='resolved').length!==11)throw Error('Faltan las once correcciones acordadas');
 if(coverage.screens.length!==150||new Set(coverage.screens.map(s=>s.id)).size!==150)throw Error('Cobertura de revisión incompleta');
 for(const s of coverage.screens){const hash=crypto.createHash('sha256').update(execFileSync('git',['show',coverage.referenceCommit+':docs/visual-map/captures/'+s.id+'.png'],{cwd:root,maxBuffer:4*1024*1024})).digest('hex');if(hash!==s.sha256)throw Error('Huella histórica incorrecta: '+s.id);}
 for(const f of findings){for(const source of f.sources)if(!fs.existsSync(path.join(root,source)))throw Error('Fuente inexistente: '+source);for(const [file]of f.evidence)if(!fs.existsSync(path.resolve(out,file)))throw Error('Falta evidencia: '+file);}
 const server=await startServer(),url='http://127.0.0.1:'+server.address().port;let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'/docs/visual-map/review/index.html');await expect(page.locator('.finding')).toHaveCount(13);
  await page.locator('#priority').selectOption('P1');await expect(page.locator('.finding:visible')).toHaveCount(3);await page.locator('#priority').selectOption('');
  await page.locator('#search').fill('Elsa Pruebas');await expect(page.locator('.finding:visible')).toHaveCount(1);await page.locator('#search').fill('');
  for(const [time,left]of [['12:59','0px'],['13:00','10%'],['15:00','10%']]){await page.locator('#startTime').fill(time);await page.locator('#startTime').dispatchEvent('input');if(await page.locator('#proposedBar').evaluate(el=>el.style.left)!==left)throw Error('Esquema incorrecto para '+time);}
  await page.locator('#A04 [data-picture]').first().click();await expect(page.locator('#picture')).toBeVisible();await page.locator('#picture .close-dialog').click();
  // Las capturas de las maquetas y el resumen se pueden mostrar sin abrir la PWA real.
  await page.locator('#A04').scrollIntoViewIfNeeded();await page.locator('#A04 .evidence-grid').screenshot({path:path.join(out,'alarm-comparison.png')});
  await page.locator('#A05').scrollIntoViewIfNeeded();await page.locator('#A05 .evidence-grid').screenshot({path:path.join(out,'large-comparison.png')});
  for(const [id,name]of [['A07','birthday'],['A08','forms'],['A09','dates'],['A10','energy'],['A11','settings']]){
    await page.locator('#'+id).scrollIntoViewIfNeeded();await page.locator('#'+id+' .evidence-grid').screenshot({path:path.join(out,name+'-comparison.png')});
  }
  await page.locator('#A06 .diagram').screenshot({path:path.join(out,'large-start-diagram.png')});
  await page.goto(url+'/docs/visual-map/index.html');await expect(page.locator('a.review-link')).toHaveAttribute('href','review/index.html');await page.locator('a.review-link').click();await expect(page.locator('h1')).toHaveText('Correcciones y pendientes.');
  await page.setViewportSize({width:400,height:880});await page.screenshot({path:path.join(root,'test-results/visual-review/report-mobile.png')});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Informe desborda en móvil');
  const broken=await page.locator('img[src]').evaluateAll(els=>els.filter(el=>el.complete&&el.naturalWidth===0).map(el=>el.src));if(broken.length)throw Error('Imágenes rotas: '+broken.join(', '));
  if(errors.length)throw Error(errors.join('\n'));console.log('Revisión verificada: 150 huellas, 13 casos, evidencias, filtros, ampliación, corte 13:00, enlace al atlas y móvil.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

// Capturas documentales aisladas. Nunca abre el perfil del usuario ni publica la app.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium,expect}=require('@playwright/test');
const {scenes,edges,sections}=require('./catalog.cjs');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'docs/visual-map');
const VIEWPORT={width:400,height:880},DATE='2026-08-21T10:00:00+02:00';
const options=process.argv.slice(2),only=options.find(x=>x.startsWith('--scene='))?.slice(8);
const sha=()=>execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
// Las fuentes son texto; CRLF/LF no deben invalidar el mapa al cambiar de equipo.
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,file),'utf8').replace(/\r\n/g,'\n')).digest('hex');
const fileData=file=>({file,hash:hash(file)});
function sharedSources(){return ['index.html','js/nav-icons.js','js/core.js','js/data-integrity.js','tools/fixture.json','tools/visual-map/fixture.cjs','tools/visual-map/catalog.cjs','tools/visual-map/extend.cjs','tools/visual-map/generate.cjs',...require('../../app-assets.json').styleSources,...require('../../app-assets.json').styles.filter(x=>x!=='css/styles.css')];}
function dependencies(scene){
  const parents=scenes.filter(s=>s.route.length<=scene.route.length&&JSON.stringify(s.route)===JSON.stringify(scene.route.slice(0,s.route.length)));
  return [...new Set([...sharedSources(),...parents.flatMap(s=>s.sources)])].map(fileData);
}
function census(){
  const openers=[];
  for(const file of fs.readdirSync(path.join(ROOT,'js')).filter(x=>x.endsWith('.js'))){
    fs.readFileSync(path.join(ROOT,'js',file),'utf8').split(/\r?\n/).forEach((line,i)=>{
      const match=line.match(/^function\s+(open\w+|toggleSettingsMenu|toggleAlarmPanel|askImportMode)\(/);
      if(match)openers.push({symbol:match[1],file:'js/'+file,line:i+1});
    });
  }
  return openers;
}
function inventory(captures){
  const result=[];
  for(const [group,titles,file]of sections)for(const title of titles.split('|'))result.push({group,title,file,status:'Pendiente de captura'});
  const aliases={home:'Jornada y horas del mes',household:'Resumen del hogar',study:'Comparar escenarios',events:'Próximos',economics:'Resumen económico',calendar:'Calendario 1 mes',day:'Ficha del día',edit:'Editar evento',time:'Elegir hora'};
  const canonical=g=>g==='Fiscal'?'Economía':g.startsWith('Energía')?'Energía':g;
  const coverage={'Eventos|Exportar calendario':'calendar-export','Eventos|Detalle evento':'day','Eventos|Asignar sesión de rutina':'routine-extra-day','Bodas|Catálogos de bodas':'wedding-pack','Cumpleaños|Selector de día o mes':'birthday-day','Economía|Configuración fiscal':'fiscal','Energía|Editor de tarifa':'energy-tariff','Ajustes|Previsualización de importación':'import-preview','Ajustes|Añadir o reemplazar al importar':'import-preview','Ajustes|Tareas pendientes y completadas':'tasks'};
  for(const row of result){const id=coverage[row.group+'|'+row.title];if(id){row.scene=id;row.status='Capturada · sin revisar';}if(row.title.startsWith('Archivo de ')){row.status='Sin entrada visible';row.note='Existe la función de archivo en código, pero la versión actual no presenta un botón ni pestaña que la abra. No se ha inventado un acceso.';}}
  for(const scene of scenes){const match=result.find(x=>x.group===canonical(scene.group)&&x.title===(aliases[scene.id]||scene.title));if(match){match.scene=scene.id;match.status='Capturada · sin revisar';}else if(!result.some(x=>x.scene===scene.id))result.push({group:canonical(scene.group),title:scene.title,file:scene.sources[0],scene:scene.id,status:'Capturada · sin revisar'});}
  result.push({group:'Ajustes',title:'Selectores nativos y aplicaciones externas',status:'Límite del atlas',note:'Los selectores de fecha, archivo y carpeta y el destino de compartir/correo pertenecen al navegador o al sistema. Se captura el control y el panel de la app hasta ese límite.'});
  return result.map(x=>x.scene&&!captures[x.scene]?{...x,status:'Pendiente de captura',scene:undefined}:x);
}
function assemble(captures){
  return {schemaVersion:1,title:'Gestify · mapa visual',generatedAt:new Date().toISOString(),referenceCommit:sha(),date:DATE,viewport:VIEWPORT,theme:'light',icons:'professional',scope:'Atlas de las secciones de la app y sus paneles secundarios, con capturas reales y recorridos comprobados. Estados condicionales y selectores nativos se identifican en el inventario.',scenes:scenes.map(s=>({...s,...captures[s.id],fresh:!!captures[s.id]&&!captures[s.id].dependencies.some(d=>!fs.existsSync(path.join(ROOT,d.file))||hash(d.file)!==d.hash),route:s.route})),edges,inventory:inventory(captures),openers:census()};
}
function writeAtomically(file,content){
  const temporary=file+'.tmp';fs.writeFileSync(temporary,content);
  for(let attempt=0;;attempt++){
    try{fs.renameSync(temporary,file);return;}catch(error){
      if(attempt>=8)throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,25*(attempt+1));
    }
  }
}
function writeData(captures){
  const data=assemble(captures);fs.mkdirSync(OUT,{recursive:true});
  writeAtomically(path.join(OUT,'map-data.json'),JSON.stringify(data,null,2)+'\n');
  writeAtomically(path.join(OUT,'map-data.js'),'window.VISUAL_MAP = '+JSON.stringify(data).replace(/</g,'\\u003c')+';\n');
}
function currentCaptures(){try{return Object.fromEntries(JSON.parse(fs.readFileSync(path.join(OUT,'map-data.json'),'utf8')).scenes.filter(s=>s.image).map(s=>[s.id,({image:s.image,anchors:s.anchors,entryBox:s.entryBox,dependencies:s.dependencies,commit:s.commit,review:s.review,verifiedEdges:s.verifiedEdges})]));}catch{return {};}}
function stale(captures){return scenes.filter(s=>!captures[s.id]||captures[s.id].dependencies.some(d=>!fs.existsSync(path.join(ROOT,d.file))||hash(d.file)!==d.hash)).map(s=>s.id);}
async function perform(page,action){
  if(typeof action==='string')await page.locator(action).first().click();
  else if(action.hold)await page.locator(action.hold).first().click({delay:750});
  else if(action.click)await page.locator(action.click).first().click(action.position?{position:action.position}:{});
  else if(action.fill)await page.locator(action.fill).first().fill(action.value);
  else if(action.file)await page.locator(action.file).setInputFiles({name:action.name,mimeType:action.mimeType||'application/json',buffer:Buffer.from(JSON.stringify(action.data))});
  else await page.locator(action.scroll).first().scrollIntoViewIfNeeded();
  await settle(page);
}
async function settle(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.waitForTimeout(380);}
async function setup(browser,url){
  const context=await browser.newContext({viewport:VIEWPORT,deviceScaleFactor:1,isMobile:true,hasTouch:true,timezoneId:'Europe/Madrid',locale:'es-ES',serviceWorkers:'block'});
  await context.route('**/*',route=>{
    const u=new URL(route.request().url());
    return u.origin===url||['fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?route.continue():route.abort();
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date(DATE));
  const fixture=require('./fixture.cjs')();
  await page.addInitScript(data=>{sessionStorage.setItem('excelia-popup-dismissed','1');for(const [key,value]of Object.entries(data))if(key.startsWith('excelia-'))localStorage.setItem(key,JSON.stringify(value));localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');localStorage.setItem('excelia-household-tab-v1','resumen');},fixture);
  await page.goto(url+'/index.html');await page.evaluate(()=>document.fonts.ready);await settle(page);
  if(await page.locator('#homePopupClose').isVisible()){await page.locator('#homePopupClose').click();await settle(page);}
  return {context,page,errors};
}
async function main(){
  const captures=currentCaptures();
  if(options.includes('--index')){writeData(captures);console.log('Índice actualizado; las capturas antiguas se señalan como pendientes.');return;}
  if(options.includes('--check')){const pending=stale(captures);console.log(pending.length?'Pendientes de actualizar: '+pending.join(', '):'Las '+scenes.length+' capturas corresponden a sus fuentes.');process.exitCode=pending.length?1:0;return;}
  const ids=only?.split(',');if(ids)for(const id of ids)if(!scenes.some(s=>s.id===id))throw new Error('Escena desconocida: '+id);
  const selected=ids?scenes.filter(s=>ids.includes(s.id)):options.includes('--changed')?scenes.filter(s=>stale(captures).includes(s.id)):scenes;
  for(const s of selected)dependencies(s);
  if(!selected.length){writeData(captures);console.log('No hay escenas pendientes.');return;}
  fs.mkdirSync(path.join(OUT,'captures'),{recursive:true});
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
  const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://local').pathname),file=path.resolve(ROOT,'.'+(rel==='/'?'/index.html':rel));if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);});});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
  let browser;
  try{
    browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
    let cursor=0;const failures=[];
    await Promise.all(Array.from({length:3},async()=>{while(cursor<selected.length){const scene=selected[cursor++];
      const {context,page,errors}=await setup(browser,url);
      page.setDefaultTimeout(3500);
      try{
        for(const action of scene.route)await perform(page,action);
        await expect(page.locator(scene.ready).first()).toBeVisible();await settle(page);
        const outgoing=edges.filter(e=>e.from===scene.id),anchors={};
        for(const edge of outgoing){
          let b=await page.locator(edge.selector).first().boundingBox();
          if(b&&edge.action==='scroll'){const right=Math.min(VIEWPORT.width,b.x+b.width),bottom=Math.min(VIEWPORT.height,b.y+b.height);b={x:Math.max(0,b.x),y:Math.max(0,b.y),width:right-Math.max(0,b.x),height:bottom-Math.max(0,b.y)};}
          if(!b||b.x<0||b.y<0||b.x+b.width>VIEWPORT.width+1||b.y+b.height>VIEWPORT.height+1)throw new Error('Origen fuera de captura: '+scene.id+' → '+edge.to);
          if(edge.step&&edge.step.position)b={x:b.x+edge.step.position.x-3,y:b.y+edge.step.position.y-3,width:6,height:6};
          anchors[edge.to]=edge.action==='scroll'?{x:b.x+b.width-10,y:b.y+b.height*.55,width:8,height:Math.min(100,b.height*.25)}:{x:b.x,y:b.y,width:b.width,height:b.height};
        }
        // Evitar PNG truncados o bloqueos transitorios al reemplazar capturas en Windows.
        const image='captures/'+scene.id+'.png';writeAtomically(path.join(OUT,image),await page.screenshot({animations:'disabled'}));
        // Las rutas hijas reproducen la transición al capturarse. Los regresos requieren otra ejecución.
        const verifiedEdges=[];
        for(const edge of outgoing){
          const target=scenes.find(s=>s.id===edge.to);
          if(target.route.length===scene.route.length+1&&JSON.stringify(target.route.slice(0,-1))===JSON.stringify(scene.route))continue;
          const check=await setup(browser,url);
          try{
            for(const action of scene.route)await perform(check.page,action);
            await perform(check.page,edge.step||(edge.action==='scroll'?target.route.at(-1):edge.selector));
            await expect(check.page.locator(target.ready).first()).toBeVisible();
            if(edge.view==='return')await expect(check.page.locator(scene.ready).first()).not.toBeVisible();
            if(check.errors.length)throw new Error(check.errors.join('\n'));verifiedEdges.push(edge.to);
          }finally{await check.context.close();}
        }
        if(errors.length)throw new Error(errors.join('\n'));
        const entryBox=scene.entry?await page.locator(scene.entry).first().boundingBox():null;
        captures[scene.id]={image,anchors,entryBox,dependencies:dependencies(scene),commit:sha(),review:'Sin revisar',verifiedEdges};
        if(Object.keys(captures).length&&selected.indexOf(scene)%10===0)writeData(captures);
        console.log('Capturada: '+scene.id);
      }catch(error){failures.push(scene.id+': '+error.message);console.error('FALLO '+scene.id+': '+error.message.split('\n')[0]);}finally{await context.close();}
    }}));
    for(const edge of edges){const s=scenes.find(s=>s.id===edge.from),t=scenes.find(s=>s.id===edge.to),c=captures[s.id];if(c&&captures[t.id]&&!failures.some(x=>x.startsWith(t.id+':')||x.startsWith(s.id+':'))&&t.route.length===s.route.length+1&&JSON.stringify(t.route.slice(0,-1))===JSON.stringify(s.route)&&!c.verifiedEdges.includes(t.id))c.verifiedEdges.push(t.id);}
    writeData(captures);
    if(failures.length)throw Error(failures.join('\n'));
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
module.exports={setup,perform,settle};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});

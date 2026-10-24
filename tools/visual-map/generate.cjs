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
function sharedSources(){return ['index.html','js/nav-icons.js','js/core.js','js/data-integrity.js','tools/fixture.json','tools/visual-map/catalog.cjs','tools/visual-map/generate.cjs',...require('../../app-assets.json').styleSources,...require('../../app-assets.json').styles.filter(x=>x!=='css/styles.css')];}
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
  // Conservar las variantes del piloto sin afirmar que se ha recorrido todo el inventario.
  const aliases={home:'Jornada y horas del mes',household:'Resumen del hogar',study:'Comparar escenarios',events:'Próximos',economics:'Resumen económico',calendar:'Calendario 1 mes',day:'Ficha del día',edit:'Editar evento',time:'Elegir hora'};
  for(const scene of scenes){const match=result.find(x=>x.group===scene.group&&x.title===(aliases[scene.id]||scene.title));if(match){match.scene=scene.id;match.status='Capturada · sin revisar';}else result.push({group:scene.group,title:scene.title,file:scene.sources[0],scene:scene.id,status:'Capturada · sin revisar'});}
  return result.map(x=>x.scene&&!captures[x.scene]?{...x,status:'Pendiente de captura',scene:undefined}:x);
}
function assemble(captures){
  return {schemaVersion:1,title:'Gestify · mapa visual',generatedAt:new Date().toISOString(),referenceCommit:sha(),date:DATE,viewport:VIEWPORT,theme:'light',icons:'professional',scope:'Piloto: navegación principal y recorrido de edición de un evento. Inventario inicial localizado en código; no auditado visualmente al completo.',scenes:scenes.map(s=>({...s,...captures[s.id],fresh:!!captures[s.id]&&!captures[s.id].dependencies.some(d=>!fs.existsSync(path.join(ROOT,d.file))||hash(d.file)!==d.hash),route:s.route})),edges,inventory:inventory(captures),openers:census()};
}
function writeData(captures){
  const data=assemble(captures);fs.mkdirSync(OUT,{recursive:true});
  fs.writeFileSync(path.join(OUT,'map-data.json'),JSON.stringify(data,null,2)+'\n');
  fs.writeFileSync(path.join(OUT,'map-data.js'),'window.VISUAL_MAP = '+JSON.stringify(data).replace(/</g,'\\u003c')+';\n');
}
function currentCaptures(){try{return Object.fromEntries(JSON.parse(fs.readFileSync(path.join(OUT,'map-data.json'),'utf8')).scenes.filter(s=>s.image).map(s=>[s.id,({image:s.image,anchors:s.anchors,entryBox:s.entryBox,dependencies:s.dependencies,commit:s.commit,review:s.review,verifiedEdges:s.verifiedEdges})]));}catch{return {};}}
function stale(captures){return scenes.filter(s=>!captures[s.id]||captures[s.id].dependencies.some(d=>!fs.existsSync(path.join(ROOT,d.file))||hash(d.file)!==d.hash)).map(s=>s.id);}
async function perform(page,action){
  if(typeof action==='string')await page.locator(action).first().click();
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
  const fixture=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/fixture.json'),'utf8'));
  fixture['excelia-events-v1']=[{id:'map-demo',kind:'puntual',type:'Otros',title:'Café de ejemplo',note:'Datos ficticios para revisar la interfaz.',start:'2026-08-21',end:'2026-08-21',color:'#537b78',time:'18:30',endTime:'19:30',shape:'circle'},{id:'map-trip',kind:'grande',type:'Viaje',title:'Viaje de ejemplo',start:'2026-08-24',end:'2026-08-28',color:'#5b7db5'}];
  await page.addInitScript(data=>{sessionStorage.setItem('excelia-popup-dismissed','1');for(const [key,value]of Object.entries(data))if(key.startsWith('excelia-'))localStorage.setItem(key,JSON.stringify(value));localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');localStorage.setItem('excelia-household-tab-v1','resumen');},fixture);
  await page.goto(url);await page.evaluate(()=>document.fonts.ready);await settle(page);
  return {context,page,errors};
}
async function main(){
  const captures=currentCaptures();
  if(options.includes('--index')){writeData(captures);console.log('Índice actualizado; las capturas antiguas se señalan como pendientes.');return;}
  if(options.includes('--check')){const pending=stale(captures);console.log(pending.length?'Pendientes de actualizar: '+pending.join(', '):'Las 13 capturas corresponden a sus fuentes.');process.exitCode=pending.length?1:0;return;}
  if(only&&!scenes.some(s=>s.id===only))throw new Error('Escena desconocida: '+only);
  const selected=only?scenes.filter(s=>s.id===only):options.includes('--changed')?scenes.filter(s=>stale(captures).includes(s.id)):scenes;
  if(!selected.length){writeData(captures);console.log('No hay escenas pendientes.');return;}
  fs.mkdirSync(path.join(OUT,'captures'),{recursive:true});
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
  const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://local').pathname),file=path.resolve(ROOT,'.'+(rel==='/'?'/index.html':rel));if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);});});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
  let browser;
  try{
    browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
    for(const scene of selected){
      const {context,page,errors}=await setup(browser,url);
      try{
        for(const action of scene.route)await perform(page,action);
        await expect(page.locator(scene.ready).first()).toBeVisible();await settle(page);
        const outgoing=edges.filter(e=>e.from===scene.id),anchors={};
        for(const edge of outgoing){
          const b=await page.locator(edge.selector).first().boundingBox();
          if(!b||b.x<0||b.y<0||b.x+b.width>VIEWPORT.width+1||b.y+b.height>VIEWPORT.height+1)throw new Error('Origen fuera de captura: '+scene.id+' → '+edge.to);
          anchors[edge.to]=edge.action==='scroll'?{x:b.x+b.width-10,y:b.y+b.height*.55,width:8,height:Math.min(100,b.height*.25)}:{x:b.x,y:b.y,width:b.width,height:b.height};
        }
        const image='captures/'+scene.id+'.png';await page.screenshot({path:path.join(OUT,image),animations:'disabled'});
        // Verificar cada relación desde su estado de origen. No ejecutar Guardar, alarmas ni exportaciones.
        const verifiedEdges=[];
        for(const edge of outgoing){
          const check=await setup(browser,url);
          try{
            for(const action of scene.route)await perform(check.page,action);
            const target=scenes.find(s=>s.id===edge.to);
            await perform(check.page,edge.action==='scroll'?target.route.at(-1):edge.selector);
            await expect(check.page.locator(target.ready).first()).toBeVisible();
            if(edge.view==='return')await expect(check.page.locator(scene.ready).first()).not.toBeVisible();
            if(check.errors.length)throw new Error(check.errors.join('\n'));verifiedEdges.push(edge.to);
          }finally{await check.context.close();}
        }
        if(errors.length)throw new Error(errors.join('\n'));
        const entryBox=scene.entry?await page.locator(scene.entry).first().boundingBox():null;
        captures[scene.id]={image,anchors,entryBox,dependencies:dependencies(scene),commit:sha(),review:'Sin revisar',verifiedEdges};
        writeData(captures);console.log('Capturada y navegación comprobada: '+scene.id);
      }finally{await context.close();}
    }
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});

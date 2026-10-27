// Vigencia documental: cachés por ejecución, contratos por escena y revisión por imagen.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {isDeepStrictEqual}=require('node:util');
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const normalize=value=>value.replace(/\r\n/g,'\n');
// Solo hojas aisladas. Las mixtas, nuevas o compartidas siguen siendo globales.
// Los grupos de todos los pasos de acceso incluyen también los fondos de los paneles.
const STYLE_GROUPS={
  'css/source/birthdays.css':['Cumpleaños','Eventos','Inicio'],
  'css/source/routines.css':['Rutinas','Eventos'],
  'css/household.css':['Hogar','Fiscal','Herramientas','Energía · gas','Energía · electricidad'],
  'css/electricity-comparator.css':['Herramientas'],
  'css/finance-views.css':['Economía','Fiscal','Herramientas'],
  'css/personal-periods.css':['Fiscal']
};
function coreRuntime(text){return text.replace(/^var APP_VERSION = .*;$/m,'var APP_VERSION = "<versión>";');}
// Solo para acreditar la extracción al migrar el formato antiguo. La vigencia
// habitual compara capture.cjs entero, sin interpretar ni recortar su código.
function legacyCaptureRuntime(text){
  const start=text.indexOf('async function perform('),end=text.search(/async function (main|measure)\(/);
  if(start<0||end<=start)throw Error('No se reconoce el contrato del capturador');
  const endMeasure=text.includes('// Evitar PNG')?text.indexOf('// Evitar PNG'):text.indexOf('const png=');
  const measured=text.slice(text.indexOf('const outgoing=edges.filter'),endMeasure).replace(/\s+/g,'');
  return text.slice(start,end)+text.match(/const VIEWPORT=.*?;/s)?.[0]+measured+text.match(/await page\.screenshot\(\{animations:'disabled'\}\)/)?.[0]+text.match(/const entryBox=.*?;/)?.[0];
}
function sceneContract(scene,edges){
  return JSON.stringify({route:scene.route,ready:scene.ready,entry:scene.entry||null,edges:edges.filter(e=>e.from===scene.id)});
}
function createTracker({root,scenes,edges,assets,read=file=>fs.readFileSync(path.join(root,file),'utf8')}){
  const texts=new Map(),hashes=new Map(),plans=new Map(),history=new Map();
  const stats={fileReads:0,hashes:0,plans:0};
  function text(file){if(!texts.has(file)){stats.fileReads++;try{texts.set(file,normalize(read(file)));}catch(error){if(error.code!=='ENOENT')throw error;texts.set(file,null);}}return texts.get(file);}
  function fingerprint(file,part){
    const key=file+':'+(part||'');if(hashes.has(key))return hashes.get(key);
    let content=text(file);
    if(content!==null){if(part==='core-runtime')content=coreRuntime(content);if(part==='app-version')content=content.match(/^var APP_VERSION = .*;$/m)?.[0]||'';}
    const hash=content===null?null:digest(content);stats.hashes++;hashes.set(key,hash);return hash;
  }
  const parentsOf=scene=>scenes.filter(s=>s.route.length<=scene.route.length&&JSON.stringify(s.route)===JSON.stringify(scene.route.slice(0,s.route.length)));
  function dependencies(scene){
    if(plans.has(scene.id))return plans.get(scene.id);stats.plans++;
    const parents=parentsOf(scene),groups=new Set(parents.map(s=>s.group));
    // Solo las entradas declaradas a pantalla completa ocultan Home. Lo
    // desconocido conserva sus dependencias; un descendiente puede reabrirla.
    const coverage=parents.filter(s=>typeof s.hidesHome==='boolean').sort((a,b)=>b.route.length-a.route.length)[0];
    const homeSources=coverage?.hidesHome?[]:['js/home-hours.js','js/home-weeks.js','js/invoices-home.js','js/invoices.js','js/invoices-kairo.js'];
    const styles=[...assets.styleSources,...assets.styles.filter(x=>x!=='css/styles.css')].filter(file=>file==='css/source/statistics.css'?parents.some(s=>s.sources.includes('js/statistics-ui.js')):!STYLE_GROUPS[file]||STYLE_GROUPS[file].some(group=>groups.has(group)));
    const sources=[...new Set(['index.html','js/nav-icons.js','js/core.js','js/data-integrity.js','tools/fixture.json','tools/visual-map/fixture.cjs',...styles,...homeSources,...parents.flatMap(s=>s.sources)])];
    const result=sources.map(file=>{const part=file==='js/core.js'?'core-runtime':undefined;return {file,...(part?{part}:{}),hash:fingerprint(file,part)};});
    if(scene.route.includes('#menuBtn'))result.push({file:'js/core.js',part:'app-version',hash:fingerprint('js/core.js','app-version')});
    result.push({file:'tools/visual-map/capture.cjs',hash:fingerprint('tools/visual-map/capture.cjs')});
    result.push({file:'tools/visual-map/catalog.cjs',part:'scene:'+scene.id,hash:digest(sceneContract(scene,edges))});
    plans.set(scene.id,result);return result;
  }
  function fresh(scene,capture){
    if(!capture||capture.dependencyVersion!==2)return false;
    const expected=dependencies(scene),previous=capture.dependencies||[];
    return expected.length===previous.length&&expected.every(d=>d.hash!==null&&previous.some(p=>p.file===d.file&&p.part===d.part&&p.hash===d.hash));
  }
  function stale(captures){return scenes.filter(s=>!fresh(s,captures[s.id])).map(s=>s.id);}
  // Migración sin recapturar: acreditar que fuentes y recorrido siguen iguales.
  // El código de selección/índice ya no es una dependencia visual del capturador.
  function migrate(scene,capture,oldData){
    if(capture?.dependencyVersion===2){if(!fresh(scene,capture))throw Error('Fuente cambiada; recapturar '+scene.id);return capture;}
    const oldScene=oldData.scenes.find(s=>s.id===scene.id);
    if(!capture||!oldScene||sceneContract(scene,edges)!==sceneContract(oldScene,oldData.edges))throw Error('Recorrido cambiado: '+scene.id);
    for(const dep of dependencies(scene)){
      const previous=capture.dependencies.find(d=>d.file===dep.file&&!d.part);
      if(previous?.hash===fingerprint(dep.file))continue;
      if(dep.part?.startsWith('scene:'))continue;
      const key=capture.commit+':'+(dep.file==='tools/visual-map/capture.cjs'?'tools/visual-map/generate.cjs':dep.file);
      if(!history.has(key))history.set(key,normalize(execFileSync('git',['show',key],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024})));
      let old=history.get(key),now=text(dep.file);
      if(dep.file==='tools/visual-map/capture.cjs'){old=legacyCaptureRuntime(old);now=legacyCaptureRuntime(now);}
      if(old!==now)throw Error('Fuente cambiada; recapturar '+scene.id+': '+dep.file);
    }
    return {...capture,dependencyVersion:2,dependencies:dependencies(scene)};
  }
  return {dependencies,fresh,stale,migrate,stats,fingerprint};
}
function retainReview(previous,next,imageHash){
  const history=[...(previous?.reviewHistory||[])];
  const same=previous?.imageHash===imageHash;
  if(previous&&!same&&previous.review&&previous.review!=='Sin revisar')history.push({imageHash:previous.imageHash,review:previous.review,commit:previous.commit,...(previous.reviewImage?{image:previous.reviewImage}:{}),...(previous.reviewEvidence?{reviewEvidence:previous.reviewEvidence}:{})});
  return {...next,imageHash,review:same?previous.review||'Sin revisar':'Sin revisar',...(history.length?{reviewHistory:history}:{}),...(same&&previous.reviewEvidence?{reviewEvidence:previous.reviewEvidence}:{})};
}
function importHistoricalReview(capture,record,coverage){
  if(!record)return capture;
  const reviewEvidence={referenceCommit:coverage.referenceCommit,reviewedAt:coverage.reviewedAt,method:coverage.method};
  if(capture.imageHash===record.sha256)return capture.review==='Sin revisar'?{...capture,review:record.status,reviewEvidence}:capture;
  const history=[...(capture.reviewHistory||[])];
  if(!history.some(h=>h.imageHash===record.sha256))history.push({imageHash:record.sha256,review:record.status,commit:coverage.referenceCommit,reviewEvidence});
  return {...capture,reviewHistory:history};
}
function exportFingerprint(data,ids,renderer){
  const selected=new Set(ids);
  return digest(JSON.stringify({renderer,scenes:ids.map(id=>{const s=data.scenes.find(s=>s.id===id);return {id,title:s.title,group:s.group,imageHash:s.imageHash,anchors:s.anchors,entryBox:s.entryBox,layout:s.layout,flow:s.flow,review:s.review,fresh:s.fresh};}),edges:data.edges.filter(e=>selected.has(e.from)&&selected.has(e.to))}));
}
function sameMapContent(a,b){
  const stable=value=>JSON.parse(JSON.stringify({...value,generatedAt:null,referenceCommit:null}));
  return isDeepStrictEqual(stable(a),stable(b));
}
module.exports={createTracker,retainReview,importHistoricalReview,exportFingerprint,sameMapContent,digest,STYLE_GROUPS};

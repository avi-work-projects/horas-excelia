const {test}=require('node:test'),assert=require('node:assert/strict');
const {createTracker,retainReview,importHistoricalReview,exportFingerprint,sameMapContent}=require('./visual-map/tracking.cjs');
const scenes=[
  {id:'home',group:'Inicio',route:[],ready:'#home',sources:['js/init.js']},
  {id:'settings',group:'Ajustes',route:['#menuBtn'],ready:'#menu',sources:['js/settings-menu.js']},
  {id:'tasks',group:'Tareas',route:['#tasksFab'],ready:'#tasks',sources:['js/tasks-view.js']},
  {id:'editor',group:'Tareas',route:['#tasksFab','.edit'],ready:'#editor',sources:['js/editor.js']},
  {id:'stats',group:'Eventos',route:['#events'],ready:'#stats',sources:['js/events.js','js/statistics-ui.js']}
];
const assets={styleSources:['css/source/base.css','css/source/statistics.css'],styles:['css/styles.css','css/new-shared.css']};
const contents={
  'js/core.js':"var APP_VERSION = 'v502';\nfunction render(){return 'ok';}",
  'tools/visual-map/generate.cjs':"const VIEWPORT={width:400,height:880},DATE='fixed';\nasync function perform(){return 'click';}\nasync function main(){return 'selection';}"
};
const tracker=(changes={},catalog=scenes,edges=[])=>createTracker({root:'.',scenes:catalog,edges,assets,read:file=>Object.hasOwn(changes,file)?changes[file]:contents[file]||file+' original'});
function baseline(t=tracker()){return Object.fromEntries(scenes.map(s=>[s.id,{dependencyVersion:2,dependencies:t.dependencies(s)}]));}
test('lee cada fuente una vez y calcula cada variante una vez por ejecución',()=>{
  const t=tracker(),captures=baseline(t);for(let i=0;i<10;i++)assert.deepEqual(t.stale(captures),[]);
  assert.equal(t.stats.plans,scenes.length);
  const deps=scenes.flatMap(s=>t.dependencies(s));
  assert.equal(t.stats.fileReads,new Set(deps.map(d=>d.file).filter(f=>f!=='tools/visual-map/catalog.cjs')).size);
  assert.equal(t.stats.hashes,new Set(deps.filter(d=>!d.part?.startsWith('scene:')).map(d=>d.file+':'+(d.part||''))).size);
});
test('módulo local afecta a escena y descendiente; CSS compartido o nuevo afecta a todas',()=>{
  const captures=baseline();
  assert.deepEqual(tracker({'js/tasks-view.js':'cambiado'}).stale(captures),['tasks','editor']);
  for(const file of ['css/source/base.css','css/new-shared.css'])assert.equal(tracker({[file]:'cambiado'}).stale(captures).length,scenes.length);
  assert.deepEqual(tracker({'css/source/statistics.css':'cambiado'}).stale(captures),['stats']);
});
test('cambiar solo versión afecta al menú que la presenta; cambiar core afecta a todas',()=>{
  const captures=baseline();
  assert.deepEqual(tracker({'js/core.js':contents['js/core.js'].replace('v502','v503')}).stale(captures),['settings']);
  assert.equal(tracker({'js/core.js':contents['js/core.js']+'\nfunction nueva(){}'}).stale(captures).length,scenes.length);
});
test('cambio editorial/selector de generación no invalida píxeles; cambio de ruta o capturador sí',()=>{
  const captures=baseline(),changed=scenes.map(s=>s.id==='tasks'?{...s,title:'Otro título'}:s);
  assert.deepEqual(tracker({},changed).stale(captures),[]);
  assert.deepEqual(tracker({'tools/visual-map/generate.cjs':contents['tools/visual-map/generate.cjs'].replace('selection','new selection')}).stale(captures),[]);
  assert.equal(tracker({'tools/visual-map/capture.cjs':'otro contrato de fotografía'}).stale(captures).length,scenes.length);
  assert.deepEqual(tracker({},scenes,[{from:'tasks',to:'editor',selector:'.new'}]).stale(captures),['tasks']);
});
test('detecta dependencias añadidas, eliminadas y archivos desaparecidos',()=>{
  const captures=baseline();
  for(const sources of [[],['js/tasks-view.js','js/new-helper.js']])assert.ok(tracker({},scenes.map(s=>s.id==='tasks'?{...s,sources}:s)).stale(captures).includes('tasks'));
  const t=createTracker({root:'.',scenes,edges:[],assets,read:file=>{if(file==='js/editor.js')throw Object.assign(Error('missing'),{code:'ENOENT'});return contents[file]||file+' original';}});
  assert.deepEqual(t.stale(captures),['editor']);
});
test('CRLF y LF no invalidan al pasar de equipo',()=>{
  assert.deepEqual(tracker({'js/core.js':contents['js/core.js'].replace(/\n/g,'\r\n')}).stale(baseline()),[]);
});
test('imagen idéntica conserva revisión/evidencia; imagen nueva queda pendiente y conserva historial',()=>{
  const old={imageHash:'abc',review:'Aceptada por Ángel',commit:'old',reviewImage:'captures/reviewed/abc.png',reviewEvidence:{reviewedAt:'2026-10-25'}};
  const identical=retainReview(old,{commit:'new'},'abc');assert.equal(identical.review,old.review);assert.deepEqual(identical.reviewEvidence,old.reviewEvidence);
  const changed=retainReview(old,{commit:'new'},'def');assert.equal(changed.review,'Sin revisar');assert.equal(changed.reviewHistory[0].review,old.review);assert.deepEqual(changed.reviewHistory[0].reviewEvidence,old.reviewEvidence);assert.equal(changed.reviewEvidence,undefined);
  assert.equal(changed.reviewHistory[0].image,'captures/reviewed/abc.png');
  assert.deepEqual(retainReview(changed,{commit:'third'},'ghi').reviewHistory,changed.reviewHistory);
});
test('revisión histórica solo se recupera si coincide exactamente la imagen',()=>{
  const capture={imageHash:'new',review:'Sin revisar'},record={sha256:'old',status:'Revisada visualmente'},coverage={referenceCommit:'history',reviewedAt:'2026-10-25',method:'Inspección'};
  assert.equal(importHistoricalReview(capture,record,coverage).review,'Sin revisar');
  assert.equal(importHistoricalReview(capture,record,coverage).reviewHistory[0].imageHash,'old');
  const matching=importHistoricalReview(capture,{...record,sha256:'new'},coverage);assert.equal(matching.review,'Revisada visualmente');assert.equal(matching.reviewEvidence.referenceCommit,'history');
});
test('láminas dependen de su contenido, no de fechas, commits ni huellas de otras escenas',()=>{
  const data={scenes:scenes.map(s=>({...s,imageHash:s.id,anchors:{},review:'Sin revisar',fresh:true})),edges:[],referenceCommit:'old',generatedAt:'old'};
  const hash=exportFingerprint(data,['tasks','editor'],'renderer');
  const next=structuredClone(data);next.referenceCommit='new';next.generatedAt='new';next.scenes[0].imageHash='unrelated';next.scenes[2].dependencies=['updated'];
  assert.equal(exportFingerprint(next,['tasks','editor'],'renderer'),hash);
  next.scenes[2].imageHash='changed';assert.notEqual(exportFingerprint(next,['tasks','editor'],'renderer'),hash);
  assert.notEqual(exportFingerprint(data,['tasks','editor'],'new renderer'),hash);
});
test('recapturar y recargar metadatos con otro orden de campos no reescribe el índice',()=>{
  const captured={generatedAt:'before',referenceCommit:'old',scenes:[{id:'new',image:'new.png',anchors:{next:{x:1,y:2}},imageHash:'abc',review:'Sin revisar',note:undefined}]};
  const reloaded={scenes:[{id:'new',imageHash:'abc',image:'new.png',review:'Sin revisar',anchors:{next:{y:2,x:1}}}],referenceCommit:'new',generatedAt:'after'};
  assert.equal(sameMapContent(captured,reloaded),true);
  for(const field of ['imageHash','review']){const changed=structuredClone(reloaded);changed.scenes[0][field]='changed';assert.equal(sameMapContent(captured,changed),false);}
  const changed=structuredClone(reloaded);changed.scenes[0].anchors.next.x=9;assert.equal(sameMapContent(captured,changed),false);
});

'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const catalog=require('../app-assets.json');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8').replace(/\r\n/g,'\n');
function assetPaths(){return ['index.html',...catalog.styles,...catalog.scripts.map(s=>s.path),...catalog.assets];}
function validateCatalog(){
  const paths=[...assetPaths(),...catalog.styleSources];
  if(new Set(paths).size!==paths.length)throw new Error('Archivo repetido en app-assets.json');
  for(const file of paths){
    if(!/^[\w./-]+$/.test(file)||file.startsWith('/')||file.split('/').includes('..')||!fs.statSync(path.join(ROOT,file)).isFile())throw new Error('Archivo no válido en catálogo: '+file);
  }
  // Ningún módulo nuevo puede quedar silenciosamente fuera de la aplicación.
  for(const file of fs.readdirSync(path.join(ROOT,'js')).filter(f=>f.endsWith('.js'))){
    if(!catalog.scripts.some(s=>s.path==='js/'+file))throw new Error('Añade js/'+file+' a app-assets.json');
  }
  for(const file of fs.readdirSync(path.join(ROOT,'css')).filter(f=>f.endsWith('.css'))){
    if(!catalog.styles.includes('css/'+file))throw new Error('Añade css/'+file+' a app-assets.json');
  }
  for(const file of fs.readdirSync(path.join(ROOT,'css/source')).filter(f=>f.endsWith('.css'))){
    if(!catalog.styleSources.includes('css/source/'+file))throw new Error('Añade css/source/'+file+' a app-assets.json');
  }
}
function replaceBlock(text,name,body){
  const start='<!-- assets:'+name+' -->',end='<!-- /assets:'+name+' -->';
  if(text.split(start).length!==2||text.split(end).length!==2||text.indexOf(end)<text.indexOf(start))throw new Error('Marcadores de '+name+' ausentes o repetidos en index.html');
  return text.slice(0,text.indexOf(start))+start+'\n'+body+'\n'+end+text.slice(text.indexOf(end)+end.length);
}
function generatedFiles(){
  let html=read('index.html');
  html=replaceBlock(html,'styles',catalog.styles.map(file=>'<link rel="stylesheet" href="'+file+'">').join('\n'));
  html=replaceBlock(html,'scripts',catalog.scripts.map(s=>'<script defer src="'+s.path+'"></script>').join('\n'));
  const assets=['./',...assetPaths().map(file=>'./'+file)];
  const swSource=read('sw.js'),swBlock=/var ASSETS = \[[\s\S]*?\];/;
  if(!swBlock.test(swSource))throw new Error('Falta el catálogo ASSETS en sw.js');
  const sw=swSource.replace(swBlock,'var ASSETS = '+JSON.stringify(assets,null,2)+';');
  const css='/* GENERADO: editar css/source/ y ejecutar npm run assets. Orden: app-assets.json. */\n'+catalog.styleSources.map(file=>'/* Fuente: '+file+' */\n'+read(file).trimEnd()+'\n').join('\n');
  return {'index.html':html,'sw.js':sw,'css/styles.css':css};
}
function syncAssets(check){
  validateCatalog();const generated=generatedFiles(),changed=[];
  for(const [file,content] of Object.entries(generated))if(read(file)!==content){changed.push(file);if(!check)fs.writeFileSync(path.join(ROOT,file),content);}
  if(check&&changed.length)throw new Error('Ejecuta npm run assets: '+changed.join(', '));
  return changed;
}
if(require.main===module){const check=process.argv.includes('--check'),changed=syncAssets(check);console.log(check?'Catálogo, estilos y carga sin conexión sincronizados':'Archivos generados: '+(changed.join(', ')||'sin cambios'));}
module.exports={catalog,assetPaths,syncAssets};

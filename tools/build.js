const fs=require('fs'),path=require('path');
const {assetPaths,syncAssets}=require('./assets');
syncAssets(true);
const root=fs.realpathSync(path.join(__dirname,'..')),out=path.resolve(root,'dist');
if(path.dirname(out)!==root||path.basename(out)!=='dist')throw new Error('Destino de publicacion no valido');
if(fs.existsSync(out)&&fs.lstatSync(out).isSymbolicLink())throw new Error('dist no puede ser un enlace');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const name of ['sw.js',...assetPaths()]){const target=path.join(out,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,name),target);}
console.log('Publicacion preparada sin backups, documentacion ni pruebas');

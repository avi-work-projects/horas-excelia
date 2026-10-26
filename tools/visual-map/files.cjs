const fs=require('node:fs');

// Conservar el archivo bueno hasta completar el reemplazo, también cuando
// Windows mantiene brevemente una imagen abierta en otro lector.
function writeAtomically(file,content){
  const bytes=Buffer.from(content);
  if(fs.existsSync(file)&&fs.readFileSync(file).equals(bytes))return false;
  const temporary=file+'.'+process.pid+'.tmp';
  try{
    fs.writeFileSync(temporary,bytes);
    for(let attempt=0;;attempt++){
      try{fs.renameSync(temporary,file);return true;}catch(error){
        if(attempt>=8)throw error;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,25*(attempt+1));
      }
    }
  }finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
}
module.exports={writeAtomically};

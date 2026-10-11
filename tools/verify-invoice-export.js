/* Verificador independiente: no carga Gestify ni escribe el documento. */
const crypto=require('node:crypto');
const fs=require('node:fs');
function sha256(text){return crypto.createHash('sha256').update(text,'utf8').digest('hex');}
function verifyInvoiceExport(p){
  if(!p||p.kind!=='auxiliary'||!p.issuer||!p.client)throw new Error('Preparación auxiliar no válida');
  const operationId=sha256(JSON.stringify([p.issuer.taxId.trim().toUpperCase(),p.client.taxId.trim().toUpperCase(),p.period,p.project.trim().toLowerCase()]));
  // Conserva el orden del export original, también dentro de objetos y arrays.
  const content=Object.assign({},p);
  for(const key of ['appVersion','contentHash','revision','preparedAt'])delete content[key];
  const contentHash=sha256(JSON.stringify(content));
  return {operationIdMatches:operationId===p.operationId,contentHashMatches:contentHash===p.contentHash};
}
module.exports={verifyInvoiceExport};
if(require.main===module){
  try{
    if(!process.argv[2])throw new Error('Uso: node tools/verify-invoice-export.js archivo.json');
    const result=verifyInvoiceExport(JSON.parse(fs.readFileSync(process.argv[2],'utf8')));
    console.log(JSON.stringify(result));
    if(!result.operationIdMatches||!result.contentHashMatches)process.exitCode=1;
  }catch(e){console.error(e.message);process.exitCode=1;}
}

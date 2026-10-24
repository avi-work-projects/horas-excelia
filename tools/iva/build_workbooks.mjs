import fs from 'node:fs/promises';
import path from 'node:path';
import {Workbook, SpreadsheetFile} from '@oai/artifact-tool';
import {identity,receiptDate} from './lsi_fields.mjs';

const [input, outputDir, headersFile, period='3T'] = process.argv.slice(2);
if (!input || !outputDir || !headersFile || !/^[1-4]T$/.test(period)) throw Error('input outputDir headers.json [period] required');
const d=JSON.parse(await fs.readFile(input,'utf8'));
const headers=JSON.parse(await fs.readFile(headersFile,'utf8'));
// Fail before writing any workbook when a requested import lacks required metadata.
if(!process.argv.includes('--annual-only')) for(const r of d.records.filter(r=>r.include&&Number(r.period[0])<=Number(period[0]))){
 identity(r);
 if(r.kind==='expense')receiptDate(r);
}
await fs.mkdir(outputDir,{recursive:true});
const col=n=>{let s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)}return s};
const num=v=>v===null||v===undefined?null:Number(v);
const serial=s=>s?(Date.parse(s+'T00:00:00Z')-Date.UTC(1899,11,30))/86400000:null;
function table(w,name,rows,widths){
 const s=w.worksheets.add(name),n=Math.max(...rows.map(r=>r.length));
 s.getRange(`A1:${col(n)}${rows.length}`).values=rows.map(r=>[...r,...Array(n-r.length).fill(null)]);
 s.showGridLines=false;
 s.getRange(`A1:${col(n)}${rows.length}`).format={font:{name:'Arial',size:10},rowHeight:34,verticalAlignment:'center',wrapText:true};
 s.getRange(`A1:${col(n)}1`).format={fill:'#183B56',font:{bold:true,color:'#FFFFFF'},rowHeight:44};
 widths.forEach((v,i)=>s.getRange(`${col(i+1)}1:${col(i+1)}${rows.length}`).format.columnWidth=v);
 s.freezePanes.freezeRows(1);return s;
}
const w=Workbook.create();
const summary=table(w,'Resumen 303',[
 ['Periodo','Base ingresos','IVA ingresos','Base gastos incorporados','IVA gastos incorporados','Saldo simulado','303 presentado','Diferencia','Cobertura'],
 ...['1T','2T','3T','4T'].map(q=>[q,null,null,null,null,null,num(d.references[q]?.['71']),null,d.coverage[q]]),
 ['Alcance','Libro en revisión: datos hasta '+d.as_of+'. No presentar.',null,null,null,null,null,null,null],
 ['Cálculo','Solo operaciones incorporadas; los gastos pendientes no equivalen a cero gasto real.',null,null,null,null,null,null,null],
 ['3T','Cuotas originales de los PDF; no se fuerza la coincidencia con Declarando.',null,null,null,null,null,null,null],
 ['Referencia',d.reference_source,null,null,null,null,null,null,null],
 ['Actualización','Actualizar los datos de entrada y regenerar. El Excel es una salida revisable; no sustituye el registro fuente.',null,null,null,null,null,null,null]
 ],[11,17,17,19,19,18,18,16,51]);
for(let r=6;r<=10;r++){summary.getRange(`B${r}:I${r}`).merge();summary.getRange(`A${r}:I${r}`).format.rowHeight=34;}
const inc=d.records.filter(r=>r.kind==='income'),exp=d.records.filter(r=>r.kind==='expense');
const si=table(w,'Ingresos',[['Factura','Expedición','Periodo','Cliente','NIF','Base EUR','IVA EUR','Retención EUR','Total con IVA','A cobrar EUR','Original en AUTONOMO','SHA256','Incorporado (1/0)'],...inc.map(r=>[r.number,serial(r.date),r.period,r.party,r.tax_id,num(r.base),num(r.vat),num(r.withholding),null,null,r.source,r.sha256,r.include?1:0])],[18,15,11,27,17,17,17,17,18,18,65,72,17]);
const se=table(w,'Gastos',[['Factura','Fecha documental','Periodo previsto','Proveedor documental','NIF documental','Base EUR','IVA documental','Total EUR','Incorporado (1/0)','Estado / motivo','Original en AUTONOMO','SHA256'],...exp.map(r=>[r.number,serial(r.date),r.period,r.party,r.tax_id,num(r.base),num(r.vat),null,r.include?1:0,r.note,r.source,r.sha256])],[23,17,15,37,20,16,17,16,17,65,65,72]);
const sd=table(w,'Documentos',[['Original en AUTONOMO','Estado','Páginas','SHA256'],...d.documents.map(r=>[r.source,r.status,r.pages,r.sha256])],[87,68,12,72]);
si.getRange(`B2:B${inc.length+1}`).setNumberFormat('dd/mm/yyyy');se.getRange(`B2:B${exp.length+1}`).setNumberFormat('dd/mm/yyyy');
si.getRange(`F2:J${inc.length+1}`).setNumberFormat('#,##0.00');se.getRange(`F2:H${exp.length+1}`).setNumberFormat('#,##0.00');
si.getRange(`C2:C${inc.length+1}`).format.horizontalAlignment='center';
se.getRange(`C2:C${exp.length+1}`).format.horizontalAlignment='center';
se.getRange(`I2:I${exp.length+1}`).format.horizontalAlignment='center';
inc.forEach((r,i)=>{let n=i+2;si.getRange(`I${n}:J${n}`).formulas=[[`=F${n}+G${n}`,`=I${n}-H${n}`]];});
exp.forEach((r,i)=>{let n=i+2;se.getRange(`H${n}`).formulas=[[`=F${n}+G${n}`]];});
for(let n=2;n<=5;n++){
 const q=`${n-1}T`,ni=inc.length+1,ne=exp.length+1;
 summary.getRange(`B${n}:E${n}`).formulas=[[
  `=ROUND(SUMIFS(Ingresos!$F$2:$F$${ni},Ingresos!$C$2:$C$${ni},A${n},Ingresos!$M$2:$M$${ni},1),2)`,
  `=ROUND(SUMIFS(Ingresos!$G$2:$G$${ni},Ingresos!$C$2:$C$${ni},A${n},Ingresos!$M$2:$M$${ni},1),2)`,
  `=ROUND(SUMIFS(Gastos!$F$2:$F$${ne},Gastos!$C$2:$C$${ne},A${n},Gastos!$I$2:$I$${ne},1),2)`,
  `=ROUND(SUMIFS(Gastos!$G$2:$G$${ne},Gastos!$C$2:$C$${ne},A${n},Gastos!$I$2:$I$${ne},1),2)`]];
 if(d.calculations[q].boxes['71']!==null)summary.getRange(`F${n}`).formulas=[[`=ROUND(C${n}-E${n},2)`]];
 else summary.getRange(`F${n}`).values=[['Pendiente']];
 if(d.references[q]?.['71'])summary.getRange(`H${n}`).formulas=[[`=ROUND(F${n}-G${n},2)`]];
 else summary.getRange(`H${n}`).values=[['Sin referencia']];
}
summary.getRange('B2:H5').setNumberFormat('#,##0.00');summary.getRange('A2:I5').format.rowHeight=66;
w.recalculate();
// Independently compare spreadsheet totals with the Decimal engine.
for(let n=2;n<=5;n++)for(const [column,box] of [[2,'07'],[3,'09'],[4,'28'],[5,'29']]){
 const got=summary.getRange(`${col(column)}${n}`).values[0][0];
 if(Math.abs(got-Number(d.calculations[`${n-1}T`].boxes[box]))>1e-7)throw Error('Spreadsheet reconciliation failed');
}
// Verify live formula recalculation, restoring the original input before export.
const checkRow=inc.findIndex(r=>r.include)+2;
if(checkRow<2)throw Error('At least one included income is required');
const checkSummary='B'+(Number(inc[checkRow-2].period[0])+1);
const checkInput='F'+checkRow;
const original=si.getRange(checkInput).values[0][0],before=summary.getRange(checkSummary).values[0][0];
si.getRange(checkInput).values=[[original+1]];w.recalculate();
if(summary.getRange(checkSummary).values[0][0]!==before+1)throw Error('Recalculation failed');
si.getRange(checkInput).values=[[original]];w.recalculate();
console.log((await w.inspect({kind:'region',sheetId:'Resumen 303',range:'A1:I5',maxChars:2200})).ndjson);
await(await SpreadsheetFile.exportXlsx(w)).save(path.join(outputDir,`LIBRO_ANUAL_${d.year}_REVISION.xlsx`));
for(const [name,range] of [['Resumen 303','A1:I10'],['Ingresos','A1:J7'],['Gastos','A1:J7'],['Documentos','A1:C7']]){
 const img=await w.render({sheetName:name,range,scale:1,format:'png'});await fs.writeFile(path.join(outputDir,name+'.png'),new Uint8Array(await img.arrayBuffer()));
}

// LSI export uses documented identities, independently of historical demo mappings.
// No guessing a missing taxpayer ID. This export is an incomplete annual simulation.
if(process.argv.includes('--annual-only')){
 console.log('Annual workbook saved. LSI export intentionally not regenerated.');
 process.exit(0);
}
const lsi=Workbook.create();
for(const [name,kind] of [['EXPEDIDAS_INGRESOS','income'],['RECIBIDAS_GASTOS','expense']]){
 const rows=d.records.filter(r=>r.kind===kind&&r.include&&Number(r.period[0])<=Number(period[0])).map((r,i)=>{
  const a=Array(kind==='income'?36:42).fill(null),income=kind==='income';
  Object.assign(a,{0:d.year,1:r.period,2:d.activity.code,3:d.activity.type,4:d.activity.group,5:'F1',6:income?'I01':'G03',7:num(r.base),8:serial(r.date)});
  if(income){const customer=identity(r);Object.assign(a,{11:r.number,13:customer.type,14:customer.country,15:customer.id,16:customer.name,17:'01',18:'S1',20:num(r.base)+num(r.vat),21:num(r.base),22:num(r.rate),23:num(r.vat),30:num(r.withholding)?15:0,31:num(r.withholding),35:'ENSAYO NO PRESENTAR: acumulado incompleto'});}
  else{
   const supplier=identity(r);
   Object.assign(a,{10:r.number,12:serial(receiptDate(r)),13:String(i+1),15:supplier.type,16:supplier.country,17:supplier.id,18:supplier.name,19:'01',20:'N',21:'N',22:'N',25:num(r.total),26:num(r.base),27:num(r.rate),28:num(r.vat),29:num(r.vat),41:'ENSAYO NO PRESENTAR: identidad y cuota documentales'});
  }
  return a;
 });
 const count=headers[name][0].length;
 const sh=table(lsi,name,[...headers[name],...rows],Array(count).fill(19));
 if(rows.length)sh.getRange(`C3:E${rows.length+2}`).setNumberFormat('@');
 sh.getRange(`A1:${col(count)}2`).format.rowHeight=85;
 if(rows.length)sh.getRange(`I3:I${rows.length+2}`).setNumberFormat('dd/mm/yyyy');
 if(kind==='expense'&&rows.length)sh.getRange(`M3:M${rows.length+2}`).setNumberFormat('dd/mm/yyyy');
 const img=await lsi.render({sheetName:name,range:'A1:I5',scale:1,format:'png'});
 await fs.writeFile(path.join(outputDir,name+'.png'),new Uint8Array(await img.arrayBuffer()));
}
lsi.recalculate();
await(await SpreadsheetFile.exportXlsx(lsi)).save(path.join(outputDir,`PRE303_${d.year}_${period}_ENSAYO.xlsx`));
console.log('Saved annual ledger and LSI simulation; nothing filed.');

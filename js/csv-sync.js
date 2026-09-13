/* Seguimiento del contenido entregado al exportar CSV, independiente por año. */
var CSV_EXPORT_KEY='excelia-csv-exports-v1';
var CSV_WARNED={};
function csvYearContent(year){
  var lines=['Fecha,Estado'],d=new Date(year,0,1);
  while(d.getFullYear()===year){
    if(d.getDay()>=1&&d.getDay()<=5){
      var t=dayT(d);
      lines.push(dk(d)+','+(t==='ausencia'||t==='festivo'||t==='vacaciones'?t:'trabajado'));
    }
    d.setDate(d.getDate()+1);
  }
  return lines.join('\n');
}
function csvExportRecords(){
  try{return JSON.parse(appStorage.getItem(CSV_EXPORT_KEY)||'{}');}catch(e){return {};}
}
function csvRecordExport(year,content){
  var records=csvExportRecords();
  records[year]={content:content,exportedAt:new Date().toISOString()};
  appStorage.setItem(CSV_EXPORT_KEY,JSON.stringify(records));delete CSV_WARNED[year];
}
function csvPendingWarnings(today){
  var records=csvExportRecords(),out=[];
  Object.keys(records).sort().forEach(function(year){
    if(records[year].content!==csvYearContent(+year))out.push({year:+year,text:'CSV de '+year+' desactualizado: han cambiado los días. Vuelve a exportarlo y actualiza el otro programa.'});
  });
  var next=today.getFullYear()+1;
  if(today.getMonth()===11&&!records[next])out.push({year:next,text:'Tienes que exportar también el CSV de '+next+' para preparar el próximo año.'});
  return out;
}
function csvCheckChanges(){
  var pending=csvPendingWarnings(new Date()),active={};
  pending.forEach(function(it){
    active[it.year]=true;
    if(!CSV_WARNED[it.year])showToast(it.text,'error');
  });
  CSV_WARNED=active;
}

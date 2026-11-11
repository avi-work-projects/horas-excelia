/* ============================================================
   ECONOMICS COMP — Tab 2: Comparador de escenarios
   ============================================================ */

var ECON_COMP_SK='excelia-econ-comp-v1';
var ECON_SCENARIOS=[
  {label:'A',rateType:'daily',rateValue:0,hoursMode:'real'},
  {label:'B',rateType:'daily',rateValue:0,hoursMode:'real'}
];
var ECON_COMP_ACCUM=false;
var ECON_COMP_DIFF=false;
var ECON_COMP_COLORS=['#34d399','#6c8cff','#fb923c','#c084fc'];
var SC_LABELS=['A','B','C','D'];
var ECON_COMP_CALC=false; // true = mostrar tabla (esperando Calcular)

/* Genera array de 12 meses con neto uniforme para asalariado (14 pagas repartidas en 12) */
function _salaryMonths(sal){
  var monthly=Math.round(sal.netoAnual/12*100)/100;
  var arr=[];for(var i=0;i<12;i++)arr.push({neto:monthly});
  return arr;
}

function loadEconComp(){
  try{
    var r=appStorage.getItem(ECON_COMP_SK);
    if(r){var d=JSON.parse(r);if(Array.isArray(d)&&d.length>=2)ECON_SCENARIOS=d;}
  }catch(e){}
}
function saveEconComp(){
  try{appStorage.setItem(ECON_COMP_SK,JSON.stringify(ECON_SCENARIOS));}catch(e){}
}

/* ── Gráfico SVG de líneas ───────────────────────────────────── */
/* Rejilla y textos heredan el color del tema mediante currentColor. */
function econLineChart(scenariosData,accum){
  var W=320,H=132,PB=16,PT=18,PL=34,PR=8,W2=W-PL-PR,H2=H-PT;
  var series=scenariosData.map(function(sc){
    var vals=[],cum=0;
    for(var i=0;i<12;i++){cum+=sc.months[i];vals.push(accum?Math.round(cum*100)/100:sc.months[i]);}
    return{label:sc.label,color:sc.color,vals:vals};
  });
  var allVals=[];
  series.forEach(function(s){allVals=allVals.concat(s.vals);});
  var minV=Math.min.apply(null,allVals)||0;
  var maxV=Math.max.apply(null,allVals)||1;
  var range=maxV-minV||1;
  var vMin=minV<0?minV-range*0.08:Math.max(0,minV-range*0.08);
  var vMax=maxV+range*0.08;
  var vRange=vMax-vMin||1;
  function xPos(i){return Math.round(PL+(i/11)*W2);}
  function yPos(v){return Math.round(PT+H2-(v-vMin)/vRange*H2);}
  var svg='<svg class="econ-line-chart" viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Neto mensual por escenario">';
  var step=2500;
  while((vMax-vMin)/step>4&&step<1e12)step*=2;
  while((vMax-vMin)/step<2&&step>500)step=Math.round(step/2);
  for(var gv=Math.ceil(vMin/step)*step;gv<=vMax;gv+=step){
    var gy=yPos(gv);
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="currentColor" stroke-opacity="'+(gv===0?'.45':'.15')+'" stroke-width="1"/>';
    var lbl=Math.abs(gv)>=1000?(gv/1000).toFixed(1).replace('.',',')+'k':gv;
    svg+='<text x="'+(PL-4)+'" y="'+(gy+3)+'" text-anchor="end" font-size="8" fill="currentColor">'+lbl+'</text>';
  }
  series.forEach(function(s){
    var pts=s.vals.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
    svg+='<polyline points="'+pts+'" fill="none" stroke="'+s.color+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    s.vals.forEach(function(v,i){svg+='<circle class="econ-line-dot" cx="'+xPos(i)+'" cy="'+yPos(v)+'" r="2.6" fill="'+s.color+'"/>';});
  });
  MN_SHORT.forEach(function(mn,i){svg+='<text x="'+xPos(i)+'" y="'+(H+PB-3)+'" text-anchor="middle" font-size="8" fill="currentColor">'+mn+'</text>';});
  var lx=PL;
  series.forEach(function(s){
    svg+='<rect x="'+lx+'" y="4" width="10" height="3" rx="1.5" fill="'+s.color+'"/>';
    svg+='<text x="'+(lx+13)+'" y="8.5" font-size="8" font-weight="600" fill="'+s.color+'">'+s.label+'</text>';
    lx+=27+s.label.length*5;
  });
  svg+='</svg>';return svg;
}

/* ── Render Tab 2 ─────────────────────────────────────────────── */
/* Cuatro formas de expresar el ingreso; el importe del escenario es único. */
var ECON_SC_TYPES=[
  {key:'salary',label:'Nómina',unit:'€/año bruto',step:1000},
  {key:'daily',label:'€/día',unit:'€/día',step:1},
  {key:'hourlyReal',label:'€/h real',unit:'€/hora real',step:1},
  {key:'hourly8h',label:'€/h 8h',unit:'€/hora (8h)',step:1}
];
function econScType(sc){
  var key=sc.rateType==='salary'?'salary':sc.rateType==='daily'?'daily':sc.hoursMode==='8h'?'hourly8h':'hourlyReal';
  return ECON_SC_TYPES.filter(function(t){return t.key===key;})[0];
}
function renderEconComp(){
  var h='';
  h+='<div class="sy-section"><div class="sy-section-title">Escenarios</div>';
  h+='<div class="econ-comp-scenarios">';
  ECON_SCENARIOS.forEach(function(sc,i){
    var type=econScType(sc);
    h+='<div class="econ-scenario-card" style="--sc-tone:'+ECON_COMP_COLORS[i]+'">';
    h+='<div class="econ-sc-header"><span class="econ-sc-badge" aria-label="Escenario '+sc.label+'">'+sc.label+'</span>';
    h+='<div class="econ-sc-types" role="group" aria-label="Tipo de ingreso del escenario '+sc.label+'">';
    ECON_SC_TYPES.forEach(function(t){h+='<button type="button" class="econ-sc-type'+(t===type?' active':'')+'" data-sci="'+i+'" data-type="'+t.key+'" aria-pressed="'+(t===type)+'">'+t.label+'</button>';});
    h+='</div></div>';
    h+='<div class="econ-sc-row"><label class="econ-sc-amount"><input class="econ-sc-input" data-sci="'+i+'" type="number" inputmode="decimal" min="0" step="'+type.step+'" placeholder="0" value="'+(sc.rateValue>0?sc.rateValue:'')+'" aria-label="Importe del escenario '+sc.label+' en '+type.unit+'"><span class="econ-sc-unit">'+type.unit+'</span></label>';
    h+='<div class="econ-sc-tools">';
    h+='<button type="button" class="econ-sc-reorder" data-sci="'+i+'" data-dir="up" aria-label="Subir escenario '+sc.label+'"'+(i===0?' disabled':'')+'>&#9650;</button>';
    h+='<button type="button" class="econ-sc-reorder" data-sci="'+i+'" data-dir="down" aria-label="Bajar escenario '+sc.label+'"'+(i===ECON_SCENARIOS.length-1?' disabled':'')+'>&#9660;</button>';
    if(ECON_SCENARIOS.length>2){h+='<button type="button" class="econ-sc-del" data-sci="'+i+'" aria-label="Quitar escenario '+sc.label+'">&#10005;</button>';}
    h+='</div></div></div>';
  });
  if(ECON_SCENARIOS.length<4){h+='<button class="econ-add-sc-btn" id="ecAddScenario">+ A&#241;adir escenario</button>';}
  h+='</div>';
  h+='<button class="econ-calc-btn" id="ecCompCalcular">Calcular comparativa</button>';
  h+='</div>';

  if(!ECON_COMP_CALC){return h;}

  // Calcular resultados (autónomo o asalariado según rateType)
  var results=ECON_SCENARIOS.map(function(sc){
    if(sc.rateType==='salary'){
      var sal=computeSalaryNet(sc.rateValue||0);
      // Adaptar a formato compatible con la tabla
      return{netoReal:sal.netoAnual,totBase:sal.brutAnual,totIrpf:sal.irpfRetenido,
        totIva:0,totCobrado:sal.netoAnual,ssEmpleado:sal.ssEmpleado,
        ssEmpleador:sal.ssEmpleador,costeEmpresa:sal.costeEmpresa,
        _salary:true,months:_salaryMonths(sal)};
    }
    return computeEconEx(ECON_YEAR,{rateType:sc.rateType,rateValue:sc.rateValue,hoursMode:sc.hoursMode});
  });

  // Neto anual de cada escenario y su diferencia con el primero
  h+='<div class="sy-section"><div class="sy-section-title">Neto anual</div><div class="econ-comp-totals">';
  results.forEach(function(r,i){
    var sc=ECON_SCENARIOS[i],diff=Math.round(((r.netoReal||0)-(results[0].netoReal||0))*100)/100;
    h+='<div class="econ-comp-total" style="--sc-tone:'+ECON_COMP_COLORS[i]+'"><div class="econ-comp-total-head"><span class="econ-sc-badge">'+sc.label+'</span><span>'+econScType(sc).label+'</span></div>';
    h+='<div class="econ-comp-total-value">'+fc(r.netoReal||0)+'</div>';
    if(i>0)h+='<div class="econ-comp-delta'+(diff>0?' pos':diff<0?' neg':'')+'">'+(diff>0?'+':'')+fc(diff)+' vs '+ECON_SCENARIOS[0].label+'</div>';
    else h+='<div class="econ-comp-delta">Referencia</div>';
    h+='</div>';
  });
  h+='</div></div>';

  // Desglose por concepto
  var hasSalary=results.some(function(r){return r._salary;});
  h+='<div class="sy-section"><div class="sy-section-title">Desglose</div>';
  h+='<div class="econ-comp-table-wrap"><table class="econ-comp-table"><thead><tr><th></th>';
  ECON_SCENARIOS.forEach(function(sc,i){h+='<th><span class="econ-sc-badge" style="--sc-tone:'+ECON_COMP_COLORS[i]+'">'+sc.label+'</span></th>';});
  h+='</tr></thead><tbody>';
  var _rows=[{key:'totBase',label:'Bruto / Base'},{key:'totIrpf',label:'IRPF'}];
  if(hasSalary)_rows.push({key:'ssEmpleado',label:'SS empleado'});
  _rows.push({key:'totIva',label:'IVA'});
  _rows.push({key:'totCobrado',label:'Ingresado'});
  if(hasSalary)_rows.push({key:'ssEmpleador',label:'SS empresa',info:true},{key:'costeEmpresa',label:'Coste empresa',info:true});
  _rows.forEach(function(row){
    h+='<tr'+(row.info?' class="info"':'')+'><th scope="row">'+row.label+'</th>';
    results.forEach(function(r){h+='<td>'+fc(r[row.key]||0)+'</td>';});
    h+='</tr>';
  });
  h+='</tbody></table></div></div>';

  // Gráfico
  h+='<div class="sy-section"><div class="sy-section-title">Neto mensual</div>';
  var chartData=results.map(function(r,i){
    return{label:ECON_SCENARIOS[i].label,color:ECON_COMP_COLORS[i],months:r.months.map(function(mo){return mo.neto;})};
  });
  if(ECON_COMP_DIFF){
    // Gráfica: diferencia acumulada de cada escenario vs A
    var diffData=[];
    var cumA=[];var cA=0;
    for(var di=0;di<12;di++){cA+=results[0].months[di].neto;cumA.push(Math.round(cA*100)/100);}
    for(var si=1;si<results.length;si++){
      var dMonths=[];var cS=0;
      for(var di2=0;di2<12;di2++){cS+=results[si].months[di2].neto;dMonths.push(Math.round((cS-cumA[di2])*100)/100);}
      diffData.push({label:'Δ'+ECON_SCENARIOS[si].label+' vs '+ECON_SCENARIOS[0].label,color:ECON_COMP_COLORS[si],months:dMonths});
    }
    h+='<div class="econ-line-chart-wrap">'+econLineChart(diffData,false)+'</div>';
  } else {
    h+='<div class="econ-line-chart-wrap">'+econLineChart(chartData,ECON_COMP_ACCUM)+'</div>';
  }
  var _mAct=!ECON_COMP_ACCUM&&!ECON_COMP_DIFF;
  var _aAct=ECON_COMP_ACCUM&&!ECON_COMP_DIFF;
  h+='<div class="econ-opt-row">';
  h+='<button class="econ-opt-btn'+(_mAct?' active':'')+'" id="ecChartMensual">Mensual</button>';
  h+='<button class="econ-opt-btn'+(_aAct?' active':'')+'" id="ecChartAcum">Acumulado</button>';
  h+='<button class="econ-opt-btn'+(ECON_COMP_DIFF?' active':'')+'" id="ecChartDiff">Δ vs '+ECON_SCENARIOS[0].label+'</button>';
  h+='</div></div>';
  return h;
}

function bindEconCompEvents(){
  /* Tipo de ingreso: conserva el importe y cambia cómo se interpreta, como antes. */
  document.querySelectorAll('.econ-sc-type').forEach(function(btn){
    btn.addEventListener('click',function(){
      var sc=ECON_SCENARIOS[parseInt(btn.dataset.sci,10)],type=btn.dataset.type;
      if(!sc)return;
      if(type==='salary')sc.rateType='salary';
      else if(type==='daily'){sc.rateType='daily';sc.hoursMode='real';}
      else{sc.rateType='hourly';sc.hoursMode=type==='hourly8h'?'8h':'real';}
      ECON_COMP_CALC=false;saveEconComp();_estudioReRender();
    });
  });
  /* Importe: solo se guarda un valor positivo. */
  document.querySelectorAll('.econ-sc-input').forEach(function(el){
    el.addEventListener('change',function(){
      var sc=ECON_SCENARIOS[parseInt(this.dataset.sci,10)],v=parseFloat(this.value);
      if(!sc)return;
      if(v>0)sc.rateValue=v;
      ECON_COMP_CALC=false;saveEconComp();_estudioReRender();
    });
  });
  // Reorder
  document.querySelectorAll('.econ-sc-reorder').forEach(function(btn){
    btn.addEventListener('click',function(){
      var i=parseInt(this.dataset.sci,10);
      var dir=this.dataset.dir;
      var j=dir==='up'?i-1:i+1;
      if(j<0||j>=ECON_SCENARIOS.length)return;
      var tmp=ECON_SCENARIOS[i];ECON_SCENARIOS[i]=ECON_SCENARIOS[j];ECON_SCENARIOS[j]=tmp;
      ECON_SCENARIOS.forEach(function(sc,k){sc.label=SC_LABELS[k];});
      ECON_COMP_CALC=false;saveEconComp();_estudioReRender();
    });
  });
  // Eliminar
  document.querySelectorAll('.econ-sc-del').forEach(function(btn){
    btn.addEventListener('click',function(){
      var i=parseInt(this.dataset.sci,10);
      if(ECON_SCENARIOS.length>2){
        ECON_SCENARIOS.splice(i,1);
        ECON_SCENARIOS.forEach(function(sc,j){sc.label=SC_LABELS[j];});
        ECON_COMP_CALC=false;saveEconComp();_estudioReRender();
      }
    });
  });
  // Añadir escenario
  var addBtn=document.getElementById('ecAddScenario');
  if(addBtn)addBtn.addEventListener('click',function(){
    if(ECON_SCENARIOS.length<4){
      var prev=ECON_SCENARIOS[ECON_SCENARIOS.length-1];
      ECON_SCENARIOS.push({label:SC_LABELS[ECON_SCENARIOS.length],rateType:prev.rateType,rateValue:prev.rateValue,hoursMode:prev.hoursMode});
      ECON_COMP_CALC=false;saveEconComp();_estudioReRender();
    }
  });
  // Calcular
  var calcBtn=document.getElementById('ecCompCalcular');
  if(calcBtn)calcBtn.addEventListener('click',function(){ECON_COMP_CALC=true;_estudioReRender();});
  // Chart toggle
  var btnM=document.getElementById('ecChartMensual');
  var btnA=document.getElementById('ecChartAcum');
  if(btnM)btnM.addEventListener('click',function(){ECON_COMP_ACCUM=false;ECON_COMP_DIFF=false;_estudioReRender();});
  if(btnA)btnA.addEventListener('click',function(){ECON_COMP_ACCUM=true;ECON_COMP_DIFF=false;_estudioReRender();});
  var btnD=document.getElementById('ecChartDiff');
  if(btnD)btnD.addEventListener('click',function(){ECON_COMP_DIFF=!ECON_COMP_DIFF;if(ECON_COMP_DIFF)ECON_COMP_ACCUM=false;_estudioReRender();});
}

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
    var r=localStorage.getItem(ECON_COMP_SK);
    if(r){var d=JSON.parse(r);if(Array.isArray(d)&&d.length>=2)ECON_SCENARIOS=d;}
  }catch(e){}
}
function saveEconComp(){
  try{localStorage.setItem(ECON_COMP_SK,JSON.stringify(ECON_SCENARIOS));}catch(e){}
}

/* ── Gráfico SVG de líneas ───────────────────────────────────── */
function econLineChart(scenariosData,accum){
  var W=320,H=100,PB=18,PT=16,PL=36,PR=8,W2=W-PL-PR,H2=H-PT;
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
  var vMin=Math.max(0,minV-range*0.08);
  var vMax=maxV+range*0.08;
  var vRange=vMax-vMin||1;
  function xPos(i){return Math.round(PL+(i/11)*W2);}
  function yPos(v){return Math.round(PT+H2-(v-vMin)/vRange*H2);}
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">';
  var step=2500;
  while((vMax-vMin)/step>4)step*=2;
  while((vMax-vMin)/step<2&&step>500)step=Math.round(step/2);
  for(var gv=Math.ceil(vMin/step)*step;gv<=vMax;gv+=step){
    var gy=yPos(gv);
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl=gv>=1000?(gv/1000).toFixed(1).replace('.',',')+'k':gv;
    svg+='<text x="'+(PL-2)+'" y="'+(gy+3)+'" text-anchor="end" font-size="6" fill="#5a5a70">'+lbl+'</text>';
  }
  series.forEach(function(s){
    var pts=s.vals.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
    svg+='<polyline points="'+pts+'" fill="none" stroke="'+s.color+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    s.vals.forEach(function(v,i){svg+='<circle cx="'+xPos(i)+'" cy="'+yPos(v)+'" r="2.5" fill="'+s.color+'" stroke="#0d0d14" stroke-width="1.5"/>';});
  });
  MN_SHORT.forEach(function(mn,i){svg+='<text x="'+xPos(i)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="6" fill="#5a5a70">'+mn+'</text>';});
  var lx=PL;
  series.forEach(function(s){
    svg+='<rect x="'+lx+'" y="3" width="10" height="3" rx="1.5" fill="'+s.color+'"/>';
    svg+='<text x="'+(lx+12)+'" y="7" font-size="7" fill="'+s.color+'">'+s.label+'</text>';
    lx+=28;
  });
  svg+='</svg>';return svg;
}

/* ── Render Tab 2 ─────────────────────────────────────────────── */
function renderEconComp(){
  var h='';
  // Cards de escenarios
  h+='<div class="sy-section"><div class="sy-section-title">Escenarios</div>';
  h+='<div class="econ-comp-scenarios">';
  ECON_SCENARIOS.forEach(function(sc,i){
    var _zoneKey=sc.rateType==='salary'?'salary':sc.rateType==='daily'?'daily':sc.hoursMode==='8h'?'hourly8h':'hourlyReal';
    h+='<div class="econ-scenario-card" style="border-left:3px solid '+ECON_COMP_COLORS[i]+'">';
    h+='<div class="econ-sc-header">';
    h+='<span style="color:'+ECON_COMP_COLORS[i]+';font-weight:700;font-size:.88rem">Escenario '+sc.label+'</span>';
    h+='<div style="display:flex;gap:2px;align-items:center">';
    h+='<button class="econ-sc-reorder" data-sci="'+i+'" data-dir="up"'+(i===0?' disabled':'')+'>&#9650;</button>';
    h+='<button class="econ-sc-reorder" data-sci="'+i+'" data-dir="down"'+(i===ECON_SCENARIOS.length-1?' disabled':'')+'>&#9660;</button>';
    if(ECON_SCENARIOS.length>2){h+='<button class="econ-sc-del" data-sci="'+i+'">&#10005;</button>';}
    h+='</div></div>';
    /* 3 zones */
    h+='<div class="econ-sc-zones">';
    /* Zone: Nómina */
    h+='<div class="econ-sc-zone'+(_zoneKey==='salary'?' active':'')+'" data-sci="'+i+'" data-zone="salary">';
    h+='<div class="econ-sc-zone-label">N\u00f3mina</div>';
    h+='<input class="econ-sc-zone-input" data-sci="'+i+'" data-zone="salary" type="number" min="0" step="1000" placeholder="Bruto anual \u20ac" value="'+(sc.rateType==='salary'?sc.rateValue:'')+'">';
    h+='</div>';
    /* Zone: €/día */
    h+='<div class="econ-sc-zone'+(_zoneKey==='daily'?' active':'')+'" data-sci="'+i+'" data-zone="daily">';
    h+='<div class="econ-sc-zone-label">\u20ac/d\u00eda</div>';
    h+='<input class="econ-sc-zone-input" data-sci="'+i+'" data-zone="daily" type="number" min="0" step="1" placeholder="\u20ac/d\u00eda" value="'+(sc.rateType==='daily'?sc.rateValue:'')+'">';
    h+='</div>';
    /* Zone: €/hora (2 sub-buttons) */
    h+='<div class="econ-sc-zone'+(_zoneKey==='hourlyReal'||_zoneKey==='hourly8h'?' active':'')+'" data-sci="'+i+'" data-zone="hourly">';
    h+='<div class="econ-sc-zone-btns">';
    h+='<button class="econ-sc-zone-sub'+(_zoneKey==='hourlyReal'?' active':'')+'" data-sci="'+i+'" data-zone="hourlyReal">\u20ac/hora (trabajadas reales)</button>';
    h+='<button class="econ-sc-zone-sub'+(_zoneKey==='hourly8h'?' active':'')+'" data-sci="'+i+'" data-zone="hourly8h">\u20ac/hora (si jornada 8h)</button>';
    h+='</div>';
    h+='<input class="econ-sc-zone-input" data-sci="'+i+'" data-zone="hourly" type="number" min="0" step="1" placeholder="\u20ac/hora" value="'+(sc.rateType==='hourly'?sc.rateValue:'')+'">';
    h+='</div>';
    h+='</div>';
    h+='</div>';
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

  // Tabla comparativa
  var hasSalary=results.some(function(r){return r._salary;});
  h+='<div class="sy-section"><div class="sy-section-title">Tabla comparativa (&#916; relativo a '+ECON_SCENARIOS[0].label+')</div>';
  h+='<div style="overflow-x:auto"><table class="econ-comp-table"><thead><tr>';
  h+='<th>Concepto</th>';
  ECON_SCENARIOS.forEach(function(sc,i){h+='<th style="color:'+ECON_COMP_COLORS[i]+'">'+sc.label+(sc.rateType==='salary'?' \ud83d\udcbc':'')+'</th>';});
  for(var j=1;j<ECON_SCENARIOS.length;j++){
    h+='<th style="color:'+ECON_COMP_COLORS[j]+'">&#916;'+ECON_SCENARIOS[j].label+'</th>';
  }
  h+='</tr></thead><tbody>';
  var _rows=[{key:'netoReal',label:'Neto anual'},{key:'totBase',label:'Bruto / Base'},{key:'totIrpf',label:'IRPF'}];
  if(hasSalary)_rows.push({key:'ssEmpleado',label:'SS empleado'});
  _rows.push({key:'totIva',label:'IVA'});
  _rows.push({key:'totCobrado',label:'Ingresado cuenta'});
  if(hasSalary)_rows.push({key:'ssEmpleador',label:'SS empleador (info)'},{key:'costeEmpresa',label:'Coste empresa (info)'});
  _rows.forEach(function(row){
    h+='<tr><td>'+row.label+'</td>';
    results.forEach(function(r){var v=r[row.key]||0;h+='<td>'+fc(v)+'</td>';});
    for(var j=1;j<results.length;j++){
      var diff=Math.round(((results[j][row.key]||0)-(results[0][row.key]||0))*100)/100;
      h+='<td class="'+(diff>0?'pos':diff<0?'neg':'')+'">'+(diff>0?'+':'')+fc(diff)+'</td>';
    }
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
      diffData.push({label:'\u0394'+ECON_SCENARIOS[si].label+' vs '+ECON_SCENARIOS[0].label,color:ECON_COMP_COLORS[si],months:dMonths});
    }
    h+='<div class="econ-line-chart-wrap">'+econLineChart(diffData,false)+'</div>';
  } else {
    h+='<div class="econ-line-chart-wrap">'+econLineChart(chartData,ECON_COMP_ACCUM)+'</div>';
  }
  var _mAct=!ECON_COMP_ACCUM&&!ECON_COMP_DIFF;
  var _aAct=ECON_COMP_ACCUM&&!ECON_COMP_DIFF;
  h+='<div style="display:flex;gap:8px;margin-top:8px">';
  h+='<button class="econ-opt-btn'+(_mAct?' active':'')+'" id="ecChartMensual">Mensual</button>';
  h+='<button class="econ-opt-btn'+(_aAct?' active':'')+'" id="ecChartAcum">Acumulado</button>';
  h+='<button class="econ-opt-btn'+(ECON_COMP_DIFF?' active':'')+'" id="ecChartDiff">\u0394 vs '+ECON_SCENARIOS[0].label+'</button>';
  h+='</div></div>';
  return h;
}

function bindEconCompEvents(){
  /* Zone clicks: select the active zone */
  document.querySelectorAll('.econ-sc-zone').forEach(function(zone){
    zone.addEventListener('click',function(e){
      if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')return;
      var sci=parseInt(zone.dataset.sci,10);
      var zoneType=zone.dataset.zone;
      if(isNaN(sci))return;
      _selectZone(sci,zoneType,zoneType==='hourly'?'real':null);
    });
  });
  /* Sub-buttons inside €/hora zone */
  document.querySelectorAll('.econ-sc-zone-sub').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var sci=parseInt(btn.dataset.sci,10);
      var subZone=btn.dataset.zone; // 'hourlyReal' or 'hourly8h'
      if(isNaN(sci))return;
      _selectZone(sci,'hourly',subZone==='hourly8h'?'8h':'real');
    });
  });
  function _selectZone(sci,zoneType,hoursMode){
    if(zoneType==='salary'){ECON_SCENARIOS[sci].rateType='salary';}
    else if(zoneType==='daily'){ECON_SCENARIOS[sci].rateType='daily';ECON_SCENARIOS[sci].hoursMode='real';}
    else{ECON_SCENARIOS[sci].rateType='hourly';ECON_SCENARIOS[sci].hoursMode=hoursMode||'real';}
    /* Read value from the selected zone's input */
    var input=document.querySelector('.econ-sc-zone-input[data-sci="'+sci+'"][data-zone="'+zoneType+'"]');
    if(input&&parseFloat(input.value)>0)ECON_SCENARIOS[sci].rateValue=parseFloat(input.value);
    ECON_COMP_CALC=false;saveEconComp();reRenderEcon();
  }
  /* Zone inputs: update value on change */
  document.querySelectorAll('.econ-sc-zone-input').forEach(function(el){
    el.addEventListener('change',function(){
      var sci=parseInt(this.dataset.sci,10);
      var v=parseFloat(this.value);
      var zoneType=this.dataset.zone;
      if(isNaN(sci))return;
      /* Auto-select zone when typing into it */
      var currentZone=ECON_SCENARIOS[sci].rateType==='salary'?'salary':ECON_SCENARIOS[sci].rateType==='daily'?'daily':'hourly';
      if(currentZone!==zoneType){
        if(zoneType==='salary')ECON_SCENARIOS[sci].rateType='salary';
        else if(zoneType==='daily'){ECON_SCENARIOS[sci].rateType='daily';ECON_SCENARIOS[sci].hoursMode='real';}
        else{ECON_SCENARIOS[sci].rateType='hourly';}
      }
      if(v>0)ECON_SCENARIOS[sci].rateValue=v;
      ECON_COMP_CALC=false;saveEconComp();reRenderEcon();
    });
    /* Also auto-select on focus */
    el.addEventListener('focus',function(){
      var sci=parseInt(this.dataset.sci,10);
      var zoneType=this.dataset.zone;
      if(isNaN(sci))return;
      var card=this.closest('.econ-scenario-card');
      if(!card)return;
      card.querySelectorAll('.econ-sc-zone').forEach(function(z){z.classList.toggle('active',z.dataset.zone===zoneType);});
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
      ECON_COMP_CALC=false;saveEconComp();reRenderEcon();
    });
  });
  // Eliminar
  document.querySelectorAll('.econ-sc-del').forEach(function(btn){
    btn.addEventListener('click',function(){
      var i=parseInt(this.dataset.sci,10);
      if(ECON_SCENARIOS.length>2){
        ECON_SCENARIOS.splice(i,1);
        ECON_SCENARIOS.forEach(function(sc,j){sc.label=SC_LABELS[j];});
        ECON_COMP_CALC=false;saveEconComp();reRenderEcon();
      }
    });
  });
  // Añadir escenario
  var addBtn=document.getElementById('ecAddScenario');
  if(addBtn)addBtn.addEventListener('click',function(){
    if(ECON_SCENARIOS.length<4){
      var prev=ECON_SCENARIOS[ECON_SCENARIOS.length-1];
      ECON_SCENARIOS.push({label:SC_LABELS[ECON_SCENARIOS.length],rateType:prev.rateType,rateValue:prev.rateValue,hoursMode:prev.hoursMode});
      ECON_COMP_CALC=false;saveEconComp();reRenderEcon();
    }
  });
  // Calcular
  var calcBtn=document.getElementById('ecCompCalcular');
  if(calcBtn)calcBtn.addEventListener('click',function(){ECON_COMP_CALC=true;reRenderEcon();});
  // Chart toggle
  var btnM=document.getElementById('ecChartMensual');
  var btnA=document.getElementById('ecChartAcum');
  if(btnM)btnM.addEventListener('click',function(){ECON_COMP_ACCUM=false;ECON_COMP_DIFF=false;reRenderEcon();});
  if(btnA)btnA.addEventListener('click',function(){ECON_COMP_ACCUM=true;ECON_COMP_DIFF=false;reRenderEcon();});
  var btnD=document.getElementById('ecChartDiff');
  if(btnD)btnD.addEventListener('click',function(){ECON_COMP_DIFF=!ECON_COMP_DIFF;if(ECON_COMP_DIFF)ECON_COMP_ACCUM=false;reRenderEcon();});
}

/* ============================================================
   ECONOMICS COMP — Tab 2: Comparador de escenarios
   ============================================================ */

var ECON_COMP_SK='excelia-econ-comp-v1';
var ECON_SCENARIOS=[
  {label:'A',rateType:'daily',rateValue:315,hoursMode:'real'},
  {label:'B',rateType:'daily',rateValue:350,hoursMode:'real'}
];
var ECON_COMP_ACCUM=false;
var ECON_COMP_COLORS=['#34d399','#6c8cff','#fb923c','#c084fc'];
var SC_LABELS=['A','B','C','D'];

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
  var W=320,H=100,PB=18,PT=16,PL=36,PR=8;
  var W2=W-PL-PR,H2=H-PT;

  // Construir series (mensual o acumulado)
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

  // Grid Y + etiquetas
  var step=2500;
  while((vMax-vMin)/step>4)step*=2;
  while((vMax-vMin)/step<2&&step>500)step=Math.round(step/2);
  for(var gv=Math.ceil(vMin/step)*step;gv<=vMax;gv+=step){
    var gy=yPos(gv);
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl=gv>=1000?(gv/1000).toFixed(1).replace('.',',')+'k':gv;
    svg+='<text x="'+(PL-2)+'" y="'+(gy+3)+'" text-anchor="end" font-size="6" fill="#5a5a70">'+lbl+'</text>';
  }

  // Líneas por escenario
  series.forEach(function(s){
    var pts=s.vals.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
    svg+='<polyline points="'+pts+'" fill="none" stroke="'+s.color+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    s.vals.forEach(function(v,i){
      svg+='<circle cx="'+xPos(i)+'" cy="'+yPos(v)+'" r="2.5" fill="'+s.color+'" stroke="#0d0d14" stroke-width="1.5"/>';
    });
  });

  // Etiquetas eje X
  MN_SHORT.forEach(function(mn,i){
    svg+='<text x="'+xPos(i)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="6" fill="#5a5a70">'+mn+'</text>';
  });

  // Leyenda (top-left)
  var lx=PL;
  series.forEach(function(s){
    svg+='<rect x="'+lx+'" y="3" width="10" height="3" rx="1.5" fill="'+s.color+'"/>';
    svg+='<text x="'+(lx+12)+'" y="7" font-size="7" fill="'+s.color+'">'+s.label+'</text>';
    lx+=28;
  });

  svg+='</svg>';
  return svg;
}

/* ── Render Tab 2 ─────────────────────────────────────────────── */
function renderEconComp(){
  var h='';

  // Cards de escenarios
  h+='<div class="sy-section"><div class="sy-section-title">Escenarios</div>';
  h+='<div class="econ-comp-scenarios">';
  ECON_SCENARIOS.forEach(function(sc,i){
    h+='<div class="econ-scenario-card" style="border-left-color:'+ECON_COMP_COLORS[i]+'">';
    h+='<div class="econ-sc-header">';
    h+='<span style="color:'+ECON_COMP_COLORS[i]+';font-weight:700">Escenario '+sc.label+'</span>';
    if(ECON_SCENARIOS.length>2){
      h+='<button class="econ-sc-del" data-sci="'+i+'">&#10005;</button>';
    }
    h+='</div>';
    h+='<div class="econ-sc-row">';
    h+='<select class="econ-sc-type" data-sci="'+i+'">';
    h+='<option value="daily"'+(sc.rateType==='daily'?' selected':'')+'>&#8364;/d&#237;a</option>';
    h+='<option value="hourly"'+(sc.rateType==='hourly'?' selected':'')+'>&#8364;/hora</option>';
    h+='</select>';
    h+='<input class="econ-sc-value" data-sci="'+i+'" type="number" min="0.01" step="1" value="'+sc.rateValue+'">';
    h+='</div>';
    h+='<div class="econ-sc-row">';
    h+='<select class="econ-sc-mode" data-sci="'+i+'">';
    h+='<option value="real"'+(sc.hoursMode==='real'?' selected':'')+'>Horas reales</option>';
    h+='<option value="8h"'+(sc.hoursMode==='8h'?' selected':'')+'>8h fijas/d&#237;a</option>';
    h+='</select>';
    h+='</div></div>';
  });
  if(ECON_SCENARIOS.length<4){
    h+='<button class="econ-add-sc-btn" id="ecAddScenario">+ A\u00f1adir escenario</button>';
  }
  h+='</div></div>';

  // Calcular todos los escenarios
  var results=ECON_SCENARIOS.map(function(sc){
    return computeEconEx(ECON_YEAR,{rateType:sc.rateType,rateValue:sc.rateValue,hoursMode:sc.hoursMode});
  });

  // Tabla comparativa
  h+='<div class="sy-section"><div class="sy-section-title">Tabla comparativa</div>';
  h+='<div style="overflow-x:auto"><table class="econ-comp-table"><thead><tr>';
  h+='<th>Concepto</th>';
  ECON_SCENARIOS.forEach(function(sc,i){
    h+='<th style="color:'+ECON_COMP_COLORS[i]+'">'+sc.label+'</th>';
  });
  for(var j=1;j<ECON_SCENARIOS.length;j++){
    h+='<th style="color:'+ECON_COMP_COLORS[j]+'">&#916;'+ECON_SCENARIOS[j].label+'</th>';
  }
  h+='</tr></thead><tbody>';
  var rows=[
    {key:'netoReal',label:'Neto anual'},
    {key:'totBase',label:'Base imponible'},
    {key:'totIrpf',label:'IRPF retenido'},
    {key:'totIva',label:'IVA generado'},
    {key:'totCobrado',label:'Ingresado cuenta'}
  ];
  rows.forEach(function(row){
    h+='<tr><td>'+row.label+'</td>';
    results.forEach(function(r){h+='<td>'+fc(r[row.key])+'</td>';});
    for(var j=1;j<results.length;j++){
      var diff=Math.round((results[j][row.key]-results[0][row.key])*100)/100;
      var cls=diff>0?'pos':diff<0?'neg':'';
      h+='<td class="'+cls+'">'+(diff>0?'+':'')+fc(diff)+'</td>';
    }
    h+='</tr>';
  });
  h+='</tbody></table></div></div>';

  // Gráfico de líneas
  h+='<div class="sy-section"><div class="sy-section-title">Neto mensual</div>';
  var chartData=results.map(function(r,i){
    return{label:ECON_SCENARIOS[i].label,color:ECON_COMP_COLORS[i],months:r.months.map(function(mo){return mo.neto;})};
  });
  h+='<div class="econ-line-chart-wrap">'+econLineChart(chartData,ECON_COMP_ACCUM)+'</div>';
  h+='<div style="display:flex;gap:8px;margin-top:8px">';
  h+='<button class="econ-toggle-btn'+(ECON_COMP_ACCUM?'':' active')+'" id="ecChartMensual">Mensual</button>';
  h+='<button class="econ-toggle-btn'+(ECON_COMP_ACCUM?' active':'')+'" id="ecChartAcum">Acumulado</button>';
  h+='</div></div>';

  return h;
}

function bindEconCompEvents(){
  // Tipo / valor / modo (event delegation por querySelectorAll)
  document.querySelectorAll('.econ-sc-type,.econ-sc-value,.econ-sc-mode').forEach(function(el){
    el.addEventListener('change',function(){
      var i=parseInt(this.dataset.sci,10);
      if(isNaN(i))return;
      if(this.classList.contains('econ-sc-type'))ECON_SCENARIOS[i].rateType=this.value;
      else if(this.classList.contains('econ-sc-value')){var v=parseFloat(this.value);if(v>0)ECON_SCENARIOS[i].rateValue=v;}
      else if(this.classList.contains('econ-sc-mode'))ECON_SCENARIOS[i].hoursMode=this.value;
      saveEconComp();reRenderEcon();
    });
  });

  // Eliminar escenario
  document.querySelectorAll('.econ-sc-del').forEach(function(btn){
    btn.addEventListener('click',function(){
      var i=parseInt(this.dataset.sci,10);
      if(ECON_SCENARIOS.length>2){
        ECON_SCENARIOS.splice(i,1);
        ECON_SCENARIOS.forEach(function(sc,j){sc.label=SC_LABELS[j];});
        saveEconComp();reRenderEcon();
      }
    });
  });

  // Añadir escenario
  var addBtn=document.getElementById('ecAddScenario');
  if(addBtn)addBtn.addEventListener('click',function(){
    if(ECON_SCENARIOS.length<4){
      var prev=ECON_SCENARIOS[ECON_SCENARIOS.length-1];
      ECON_SCENARIOS.push({label:SC_LABELS[ECON_SCENARIOS.length],rateType:prev.rateType,rateValue:prev.rateValue,hoursMode:prev.hoursMode});
      saveEconComp();reRenderEcon();
    }
  });

  // Toggle mensual/acumulado
  var btnM=document.getElementById('ecChartMensual');
  var btnA=document.getElementById('ecChartAcum');
  if(btnM)btnM.addEventListener('click',function(){ECON_COMP_ACCUM=false;reRenderEcon();});
  if(btnA)btnA.addEventListener('click',function(){ECON_COMP_ACCUM=true;reRenderEcon();});
}

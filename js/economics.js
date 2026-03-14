/* ============================================================
   ECONOMICS — Core + Tab 1: Resumen
   ============================================================ */

var ECON_YEAR=new Date().getFullYear();
var ECON_VIEW='resumen';    // 'resumen' | 'gastos' | 'analisis' | 'estudio'
var ECON_RATE_MODE='daily'; // 'daily' | 'hourly' | 'salary'
var ECON_ESTUDIO_SUB='comparador'; // 'comparador' | 'simulador'
window._ECON_SALARY=0; // salario bruto anual para modo nómina

/* ── Nómina asalariado — modelo simplificado ───────────────── */
var _SS_EMP_PCT=6.35;   // SS empleado: CC 4.70 + Desempleo 1.55 + FP 0.10
var _SS_EMP_MAX=56646;  // Base máx cotización anual (~4720.50€/mes×12)
var _SS_PAT_PCT=30.9;   // SS empleador: CC 23.60 + Desemp 5.50 + FP 0.60 + FOGASA 0.20 + AT/EP ~1.0

function computeSalaryNet(brutAnual){
  var ssBase=Math.min(brutAnual,_SS_EMP_MAX);
  var ssEmpleado=Math.round(ssBase*_SS_EMP_PCT/100*100)/100;
  var baseIrpf=Math.max(0,Math.round((brutAnual-ssEmpleado)*100)/100);
  var irpf=computeIrpfBrackets(baseIrpf);
  var irpfRetenido=irpf.totalTax;
  var netoAnual=Math.round((brutAnual-ssEmpleado-irpfRetenido)*100)/100;
  var netoMensual=Math.round(netoAnual/14*100)/100;  // 14 pagas
  var ssEmpleador=Math.round(ssBase*_SS_PAT_PCT/100*100)/100;
  var costeEmpresa=Math.round((brutAnual+ssEmpleador)*100)/100;
  return{brutAnual:brutAnual,ssEmpleado:ssEmpleado,baseIrpf:baseIrpf,
    irpfRetenido:irpfRetenido,irpfPct:irpf.effectivePct,
    netoAnual:netoAnual,netoMensual:netoMensual,
    ssEmpleador:ssEmpleador,costeEmpresa:costeEmpresa};
}

/* ── Formato moneda ─────────────────────────────────────────── */
function fc(n){
  var parts=n.toFixed(2).split('.');
  parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return parts[0]+','+parts[1]+'&#8364;';
}
function fcPlain(n){
  var parts=n.toFixed(2).split('.');
  parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return parts[0]+','+parts[1]+'€';
}

/* ── computeEconEx ──────────────────────────────────────────── */
function computeEconEx(year,opts){
  opts=opts||{};
  var s=computeYearlySummary(year);
  var avgHDay=s.avgHDay||8;
  var dailyRate=DAILY_RATE;
  if(opts.rateType==='hourly'&&opts.rateValue>0){dailyRate=Math.round(opts.rateValue*avgHDay*100)/100;}
  else if(opts.rateType==='daily'&&opts.rateValue>0){dailyRate=opts.rateValue;}
  else if(opts.dailyRate>0){dailyRate=opts.dailyRate;}
  var irpfPct=(opts.irpfPct!==undefined)?opts.irpfPct:getIrpfPct();
  var hoursMode=opts.hoursMode||'real';
  var months=[],totBase=0,totIva=0,totIrpf=0,totCobrado=0;
  var qIva=[0,0,0,0],qCobrado=[0,0,0,0],qBase=[0,0,0,0];
  var totalDays=0,totalHours=0;
  for(var m=0;m<12;m++){
    var dias=s.mDays[m]+s.mDaysP[m];
    var effHours=hoursMode==='8h'?dias*8:(s.mHours[m]+s.mHoursP[m]);
    var base=opts.rateType==='hourly'&&opts.rateValue>0?Math.round(effHours*opts.rateValue*100)/100:Math.round(dias*dailyRate*100)/100;
    var iva=Math.round(base*0.21*100)/100;
    var irpf=Math.round(base*irpfPct/100*100)/100;
    var cobrado=Math.round((base+iva-irpf)*100)/100;
    var neto=Math.round((base-irpf)*100)/100;
    months.push({m:m,dias:dias,hours:effHours,base:base,iva:iva,irpf:irpf,cobrado:cobrado,neto:neto});
    totBase+=base;totIva+=iva;totIrpf+=irpf;totCobrado+=cobrado;
    totalDays+=dias;totalHours+=effHours;
    var qi=Math.floor(m/3);qIva[qi]+=iva;qCobrado[qi]+=cobrado;qBase[qi]+=base;
  }
  qBase=qBase.map(function(b){return Math.round(b*100)/100;});
  qIva=qIva.map(function(v){return Math.round(v*100)/100;});
  qCobrado=qCobrado.map(function(v){return Math.round(v*100)/100;});
  var qNeto=qIva.map(function(iv,i){return Math.round((qCobrado[i]-iv)*100)/100;});
  totBase=Math.round(totBase*100)/100;totIva=Math.round(totIva*100)/100;
  totIrpf=Math.round(totIrpf*100)/100;totCobrado=Math.round(totCobrado*100)/100;
  var netoReal=Math.round((totBase-totIrpf)*100)/100;
  var hourlyRate=totalHours>0?Math.round(totBase/totalHours*100)/100:0;
  return{months:months,totBase:totBase,totIva:totIva,totIrpf:totIrpf,totCobrado:totCobrado,
    netoReal:netoReal,qIva:qIva,qCobrado:qCobrado,qBase:qBase,qNeto:qNeto,
    totalDays:totalDays,totalHours:totalHours,dailyRate:dailyRate,hourlyRate:hourlyRate,
    avgHDay:avgHDay,irpfPct:irpfPct};
}
function computeEcon(year){return computeEconEx(year);}

/* ── Gráfica de barras ──────────────────────────────────────── */
function econBarChart(data,labels,color){
  var W=320,H=90,PB=18,PT=14,PL=32,n=12;
  var bW=W-PL;var maxV=Math.max.apply(null,data)||1;
  var step=2500;while(maxV/step>5)step*=2;
  var bw=Math.floor((bW-n*2)/n),gap=2;
  var today=new Date();var cm=ECON_YEAR===today.getFullYear()?today.getMonth():-1;
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">';
  for(var gv=step;gv<=maxV*1.05;gv+=step){
    var gy=Math.round(H-(gv/maxV)*(H-PT));if(gy<PT)break;
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+W+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl=gv%1000===0?(gv/1000)+'k':((gv/1000).toFixed(1).replace('.',','))+'k';
    svg+='<text x="'+(PL-2)+'" y="'+(gy+3)+'" text-anchor="end" font-size="6" fill="#5a5a70">'+lbl+'</text>';
  }
  for(var i=0;i<n;i++){
    var x=PL+i*(bw+gap);var v=data[i];
    var h2=v>0?Math.max(2,Math.round((v/maxV)*(H-PT))):0;
    var op=i<cm?'.45':i===cm?'1':'.25';
    if(v>0)svg+='<rect x="'+x+'" y="'+(H-h2)+'" width="'+bw+'" height="'+h2+'" rx="2" fill="'+color+'" opacity="'+op+'"/>';
    svg+='<text x="'+(x+bw/2)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="7" fill="#5a5a70">'+labels[i]+'</text>';
  }
  svg+='</svg>';return svg;
}

/* ── Helper: opt-button row ─────────────────────────────────── */
function renderOptRow(id,opts,cur){
  var h='<div class="econ-opt-row" id="'+id+'">';
  opts.forEach(function(o){h+='<button class="econ-opt-btn'+(o.v===cur?' active':'')+'" data-val="'+o.v+'" data-opt="'+id+'">'+o.l+'</button>';});
  h+='</div>';return h;
}

/* ── Cascade row helper ─────────────────────────────────────── */
function cascRow(lbl,sign,val,color,cls,note){
  var rowCls='econ-casc-row'+(cls?' '+cls:'');
  var h='<div class="'+rowCls+'">';
  h+='<span class="econ-casc-lbl">'+lbl+(note?'<br><span style="font-size:.68rem;color:var(--text-dim)">'+note+'</span>':'')+'</span>';
  h+='<span class="econ-casc-sign">'+sign+'</span>';
  h+='<span class="econ-casc-val"'+(color?' style="color:'+color+'"':'')+'>'+fc(val)+'</span>';
  h+='</div>';return h;
}

/* ── Helpers para tarjetas de resumen ───────────────────────── */
function _econCard(color,lbl,val,sub){
  return '<div class="econ-avg-card" style="border-left-color:'+color+'">'
    +'<div class="econ-avg-card-lbl" style="color:'+color+'">'+lbl+'</div>'
    +'<div class="econ-avg-card-val" style="color:'+color+'">'+fcPlain(val)+'</div>'
    +'<div class="econ-avg-card-sub">'+sub+'</div></div>';
}
function _econCards7(e,cotAnual,declDiff,factor,subSuffix){
  // factor=1 para anual, factor=1/12 para media mensual; subSuffix texto del sublabel
  var f=function(v){return Math.round(v*factor*100)/100;};
  var netoCCSS=Math.round((e.netoReal-cotAnual)*100)/100;
  var netoDecl=Math.round((e.netoReal-cotAnual-declDiff)*100)/100;
  var h='';
  h+=_econCard('var(--c-blue)','Base',f(e.totBase),subSuffix);
  h+=_econCard('var(--c-orange)','IVA',f(e.totIva),'no toques');
  h+=_econCard('var(--c-green)','Base \u2212 15% IRPF',f(e.netoReal),'base \u2212 15% IRPF');
  h+=_econCard('var(--c-red)','IRPF',f(e.totIrpf),'retenci\u00f3n '+e.irpfPct+'%');
  h+=_econCard('var(--c-green)','Base \u2212 15% IRPF \u2212 CCSS',f(cotAnual>0?netoCCSS:e.netoReal),'tras CCSS');
  h+=_econCard('#c084fc','Cuota Aut\u00f3nomos',f(cotAnual),'CCSS');
  h+=_econCard('var(--accent-bright)','Neto tras Dec. Renta',f(cotAnual>0?netoDecl:Math.round((e.netoReal-declDiff)*100)/100),'tras declaraci\u00f3n');
  return h;
}

/* ── Tab 1: Resumen ──────────────────────────────────────────── */
function renderEconResumen(){
  var e=computeEconEx(ECON_YEAR);
  var avgHDay=e.avgHDay||8;
  var hourlyRate=Math.round(DAILY_RATE/avgHDay*100)/100;
  var cotAnual=typeof gastoAnual==='function'?gastoAnual('cot_social'):0;
  var dr=typeof computeDeclResult==='function'?computeDeclResult(e.totBase,e.totIrpf):{gdPct:5,totalDesgrav:0,baseDecl:Math.max(0,Math.round((e.totBase*0.95)*100)/100),decl:computeIrpfBrackets(Math.max(0,Math.round((e.totBase*0.95)*100)/100)),declDiff:0};
  var declDiff=dr.declDiff; // pos=paga más, neg=devuelve
  var h='';

  /* §1 Tarifa + Calcular */
  h+='<div class="sy-section"><div class="sy-section-title">Tarifa</div>';
  /* Selector de modo */
  h+='<div class="econ-opt-row" style="margin-bottom:8px">';
  h+='<button class="econ-opt-btn'+(ECON_RATE_MODE==='daily'||ECON_RATE_MODE==='hourly'?' active':'')+'" id="ecModeFreelance">Aut\u00f3nomo</button>';
  h+='<button class="econ-opt-btn'+(ECON_RATE_MODE==='salary'?' active':'')+'" id="ecModeSalary">N\u00f3mina</button>';
  h+='</div>';
  if(ECON_RATE_MODE==='salary'){
    h+='<div class="econ-rate-dual" style="flex-direction:column;gap:6px">';
    h+='<div class="econ-rate-field primary">';
    h+='<label>Salario bruto anual &#8364;</label>';
    h+='<input class="econ-rate-input" id="rateSalaryInput" type="number" min="1" step="100" value="'+(window._ECON_SALARY||0)+'">';
    h+='</div></div>';
  } else {
    h+='<div class="econ-rate-dual">';
    h+='<div class="econ-rate-field'+(ECON_RATE_MODE==='daily'?' primary':' derived')+'">';
    h+='<label>&#8364;/d&#237;a</label>';
    h+='<input class="econ-rate-input" id="rateDayInput" type="number" min="1" step="1" value="'+DAILY_RATE+'">';
    h+='<span class="econ-rate-badge">media '+avgHDay.toFixed(1)+'h/d&#237;a</span>';
    h+='</div>';
    h+='<div class="econ-rate-sep">&#8596;</div>';
    h+='<div class="econ-rate-field'+(ECON_RATE_MODE==='hourly'?' primary':' derived')+'">';
    h+='<label>&#8364;/hora</label>';
    h+='<input class="econ-rate-input" id="rateHourInput" type="number" min="0.01" step="0.01" value="'+hourlyRate.toFixed(2)+'">';
    h+='</div></div>';
    h+='<div class="excl-row">';
    h+='<label class="excl-item" style="color:var(--festivo)"><input type="checkbox" class="excl-chk" id="ecExclFestChk" style="accent-color:var(--festivo)"'+(EXCL_FEST?' checked':'')+'>&#160;Quitar festivos</label>';
    h+='<label class="excl-item" style="color:var(--vacaciones)"><input type="checkbox" class="excl-chk" id="ecExclVacChk" style="accent-color:var(--vacaciones)"'+(EXCL_VAC?' checked':'')+'>&#160;Quitar vacaciones</label>';
    h+='</div>';
  }
  h+='<button class="econ-calc-btn" id="ecCalcular">Calcular</button>';
  h+='</div>';

  if(ECON_RATE_MODE==='salary'){
    var sal=computeSalaryNet(window._ECON_SALARY||0);
    /* §2 Resumen Anual (Nómina) */
    h+='<div class="sy-section"><div class="sy-section-title">Resumen Anual (N\u00f3mina)</div>';
    h+='<div class="econ-avg-cards">';
    h+=_econCard('var(--col-base)','Bruto anual',sal.brutAnual,'');
    h+=_econCard('var(--col-irpf)','SS empleado ('+_SS_EMP_PCT+'%)',sal.ssEmpleado,'');
    h+=_econCard('var(--col-irpf)','IRPF ('+sal.irpfPct.toFixed(1)+'%)',sal.irpfRetenido,'');
    h+=_econCard('var(--col-net)','Neto anual',sal.netoAnual,'');
    h+=_econCard('var(--col-net)','Neto mensual (14p)',sal.netoMensual,'');
    h+='</div>';
    h+='<div style="font-size:.68rem;color:var(--text-dim);padding:6px 12px;border-top:1px solid var(--border);margin-top:4px">';
    h+='SS empleador: '+fc(sal.ssEmpleador)+' ('+_SS_PAT_PCT+'%) &middot; Coste empresa: '+fc(sal.costeEmpresa);
    h+='</div></div>';
  } else {
  /* §2 Resumen Anual — 7 tarjetas totales del año */
  h+='<div class="sy-section"><div class="sy-section-title">Resumen Anual</div>';
  h+='<div class="econ-avg-cards">'+_econCards7(e,cotAnual,declDiff,1,'a\u00f1o completo')+'</div>';
  h+='</div>';

  /* §3 Media mensual — 7 tarjetas /12 */
  h+='<div class="sy-section"><div class="sy-section-title">Media Mensual</div>';
  h+='<div class="econ-avg-cards">'+_econCards7(e,cotAnual,declDiff,1/12,'a\u00f1o / 12')+'</div></div>';
  }

  if(ECON_RATE_MODE==='salary')return h;

  /* §4 Estadísticas por hora/día (siempre con columna 8h) */
  var e8h=computeEconEx(ECON_YEAR,{hoursMode:'8h'});
  var hPerH_base=e.totalHours>0?Math.round(e.totBase/e.totalHours*100)/100:0;
  var hPerH_iva=Math.round(hPerH_base*0.21*100)/100;
  var hPerH_irpf=Math.round(hPerH_base*e.irpfPct/100*100)/100;
  var hPerH_net=Math.round((hPerH_base-hPerH_irpf)*100)/100;
  var dPerD_base=e.totalDays>0?Math.round(e.totBase/e.totalDays*100)/100:DAILY_RATE;
  var dPerD_iva=Math.round(dPerD_base*0.21*100)/100;
  var dPerD_irpf=Math.round(dPerD_base*e.irpfPct/100*100)/100;
  var dPerD_net=Math.round((dPerD_base-dPerD_irpf)*100)/100;
  var d8_base=e8h.totalHours>0?Math.round(e8h.totBase/e8h.totalHours*100)/100:0;
  var d8_iva=Math.round(d8_base*0.21*100)/100;
  var d8_irpf=Math.round(d8_base*e.irpfPct/100*100)/100;
  var d8_net=Math.round((d8_base-d8_irpf)*100)/100;
  h+='<div class="sy-section"><div class="sy-section-title">Estad&#237;sticas por hora y d&#237;a</div>';
  h+='<div style="overflow-x:auto"><table class="econ-stats-table"><thead><tr>';
  h+='<th></th><th>Por hora</th><th>Por d&#237;a</th><th>Hora (8h fijas)</th></tr></thead><tbody>';
  h+='<tr class="col-base"><td>Base</td><td>'+fc(hPerH_base)+'/h</td><td>'+fc(dPerD_base)+'/d</td><td>'+fc(d8_base)+'/h</td></tr>';
  h+='<tr class="col-iva"><td>IVA</td><td>'+fc(hPerH_iva)+'/h</td><td>'+fc(dPerD_iva)+'/d</td><td>'+fc(d8_iva)+'/h</td></tr>';
  h+='<tr class="col-irpf"><td>IRPF</td><td>'+fc(hPerH_irpf)+'/h</td><td>'+fc(dPerD_irpf)+'/d</td><td>'+fc(d8_irpf)+'/h</td></tr>';
  h+='<tr class="col-net"><td>Neto</td><td>'+fc(hPerH_net)+'/h</td><td>'+fc(dPerD_net)+'/d</td><td>'+fc(d8_net)+'/h</td></tr>';
  h+='</tbody></table></div></div>';

  /* §5 IVA trimestral — sin fila Base */
  var hasComprasIva=typeof COMPRAS_IVA_ENABLED!=='undefined'&&COMPRAS_IVA_ENABLED&&typeof comprasIvaTotal==='function';
  h+='<div class="sy-section econ-quarter-section"><div class="sy-section-title">IVA trimestral a Hacienda (mod. 303)'+(hasComprasIva?' \u2014 con IVA soportado compras':'')+'</div>';
  h+='<div class="econ-quarter-scroll"><div class="econ-quarter-grid">';
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell"><div class="sy-val-sm">'+fc(e.qCobrado[i])+'</div><div class="sy-lbl">'+q+' Cobrado</div></div>';
  });
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell econ-qcell-iva"><div class="sy-val-sm" style="color:var(--c-orange)">'+fc(e.qIva[i])+'</div><div class="sy-lbl">'+q+' IVA facturado</div></div>';
  });
  if(hasComprasIva){
    ['T1','T2','T3','T4'].forEach(function(q,i){
      var ivaComp=comprasIvaTotal(i+1);
      h+='<div class="econ-qcell econ-qcell-iva"><div class="sy-val-sm" style="color:var(--c-green)">'+fc(ivaComp)+'</div><div class="sy-lbl">'+q+' IVA soportado</div></div>';
    });
    ['T1','T2','T3','T4'].forEach(function(q,i){
      var ivaNeto=Math.round((e.qIva[i]-comprasIvaTotal(i+1))*100)/100;
      h+='<div class="econ-qcell econ-qcell-iva"><div class="sy-val-sm" style="color:var(--c-orange);font-weight:700">'+fc(Math.max(0,ivaNeto))+'</div><div class="sy-lbl">'+q+' IVA neto Hac.</div></div>';
    });
  }
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell econ-qcell-neto"><div class="sy-val-sm" style="color:var(--c-green)">'+fc(e.qNeto[i])+'</div><div class="sy-lbl">'+q+' Base \u2212 15% IRPF</div></div>';
  });
  h+='</div></div></div>';

  /* §6 Gráfica Base − 15% IRPF mensual */
  h+='<div class="sy-section"><div class="sy-section-title">Base \u2212 15% IRPF mensual</div>';
  h+='<div class="sy-chart">'+econBarChart(e.months.map(function(mo){return mo.neto;}),MN_SHORT,'#34d399')+'</div></div>';

  /* §7 Desglose mensual — 9 columnas con CCSS y Neto Dec. */
  var cotMensual=cotAnual/12;
  h+='<div class="sy-section econ-month-section"><div class="sy-section-title">Desglose Mensual</div>';
  h+='<div class="econ-month-wrap"><table class="econ-month-table"><thead><tr>';
  h+='<th>Mes</th><th>D\u00edas</th><th style="color:var(--c-blue)">Base</th><th style="color:var(--c-orange)">IVA</th><th style="color:var(--c-red)">IRPF</th><th>Ingresado</th>';
  h+='<th style="color:var(--c-green)">Base\u221215%\u00a0IRPF</th>';
  h+='<th style="color:var(--c-green)">Base\u221215%\u00a0IRPF\u2212CCSS</th>';
  h+='<th style="color:var(--accent-bright)">Neto Dec.</th>';
  h+='</tr></thead><tbody>';
  var totD=0;
  e.months.forEach(function(mo){
    totD+=mo.dias;
    var moNetoCCSS=Math.round((mo.neto-cotMensual)*100)/100;
    var moDeclDiff=declDiff/12;
    var moNetoDecl=Math.round((mo.neto-cotMensual-moDeclDiff)*100)/100;
    h+='<tr><td>'+MN_SHORT[mo.m]+'</td><td>'+mo.dias+'d</td>';
    h+='<td class="col-base">'+fc(mo.base)+'</td><td class="col-iva">'+fc(mo.iva)+'</td>';
    h+='<td class="col-irpf">'+fc(mo.irpf)+'</td><td class="col-ingresado">'+fc(mo.cobrado)+'</td>';
    h+='<td class="col-net">'+fc(mo.neto)+'</td>';
    h+='<td class="col-net" style="opacity:.8">'+fc(cotAnual>0?moNetoCCSS:mo.neto)+'</td>';
    h+='<td style="color:var(--accent-bright)">'+fc(cotAnual>0?moNetoDecl:(Math.round((mo.neto-moDeclDiff)*100)/100))+'</td>';
    h+='</tr>';
  });
  var totNetoCCSS=Math.round((e.netoReal-cotAnual)*100)/100;
  var totNetoDecl=Math.round((e.netoReal-cotAnual-declDiff)*100)/100;
  h+='<tr class="econ-tr-total"><td>Total</td><td>'+totD+'d</td>';
  h+='<td class="col-base">'+fc(e.totBase)+'</td><td class="col-iva">'+fc(e.totIva)+'</td>';
  h+='<td class="col-irpf">'+fc(e.totIrpf)+'</td><td class="col-ingresado">'+fc(e.totCobrado)+'</td>';
  h+='<td class="col-net">'+fc(e.netoReal)+'</td>';
  h+='<td class="col-net" style="opacity:.8">'+fc(cotAnual>0?totNetoCCSS:e.netoReal)+'</td>';
  h+='<td style="color:var(--accent-bright)">'+fc(cotAnual>0?totNetoDecl:(Math.round((e.netoReal-declDiff)*100)/100))+'</td>';
  h+='</tr></tbody></table></div></div>';

  return h;
}

/* ── renderEconContent — 4 tabs ─────────────────────────────── */
function renderEconContent(){
  var h=renderNavBar('econ');
  h+='<div class="econ-hdr-sub">';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='resumen'?' active':'')+'" id="ecTabResumen">Resumen<br>Econ\u00f3mico</button>';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='gastos'?' active':'')+'" id="ecTabGastos">Ingresos<br>y Gastos</button>';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='analisis'?' active':'')+'" id="ecTabAnalisis">An\u00e1lisis<br>Ec. Personal</button>';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='estudio'?' active':'')+'" id="ecTabEstudio">Estudio<br>Cambio</button>';
  h+='</div>';
  h+='<div class="sy-header with-tabs">';
  if(ECON_VIEW==='resumen'||ECON_VIEW==='gastos'){
    h+='<button class="econ-gear-btn" id="ecGear">&#9965;</button>';
  } else if(ECON_VIEW==='estudio'){
    h+='<div class="econ-hdr-note">Seg\u00fan horas y d\u00edas trabajados del a\u00f1o:</div>';
  } else {
    h+='<div style="width:42px"></div>';
  }
  h+='<div class="sy-year-nav"><button class="sy-nav" id="ecPrev">&#9664;</button><div class="sy-year">'+ECON_YEAR+'</div><button class="sy-nav" id="ecNext">&#9654;</button></div>';
  h+='<button class="sy-pdf" id="ecPdf">PDF</button>';
  h+='</div>';
  h+='<div class="sy-body">';
  if(ECON_VIEW==='resumen'){h+=renderEconResumen();}
  else if(ECON_VIEW==='gastos'){h+=typeof renderEconGastos==='function'?renderEconGastos():'';}
  else if(ECON_VIEW==='analisis'){h+=renderEconAnalisis();}
  else if(ECON_VIEW==='estudio'){h+=renderEconEstudio();}
  h+='</div>';
  return h;
}
/* ── Análisis Economía Personal (vacío) ────────────────────── */
function renderEconAnalisis(){
  return '<div class="sy-section" style="text-align:center;padding:60px 20px;color:var(--text-dim)">'
    +'<div style="font-size:2rem;margin-bottom:12px">&#128202;</div>'
    +'<div style="font-size:.85rem;font-weight:600;margin-bottom:6px">An\u00e1lisis Econom\u00eda Personal</div>'
    +'<div style="font-size:.72rem">Pr\u00f3ximamente</div></div>';
}
/* ── Estudio Cambio (sub-tabs) ─────────────────────────────── */
function renderEconEstudio(){
  var h='<div class="econ-sub-tabs">';
  h+='<button class="econ-sub-tab'+(ECON_ESTUDIO_SUB==='comparador'?' active':'')+'" id="ecSubComp">Comparar Escenarios</button>';
  h+='<button class="econ-sub-tab'+(ECON_ESTUDIO_SUB==='simulador'?' active':'')+'" id="ecSubSim">Calcular Tarifa</button>';
  h+='</div>';
  if(ECON_ESTUDIO_SUB==='comparador'){h+=typeof renderEconComp==='function'?renderEconComp():'';}
  else if(ECON_ESTUDIO_SUB==='simulador'){h+=typeof renderEconSim==='function'?renderEconSim():'';}
  return h;
}

function openEcon(){
  NAV_BACK=null;
  ECON_YEAR=CY;
  if(typeof loadFiscal==='function')loadFiscal();
  if(typeof loadGastos==='function')loadGastos();
  if(typeof loadIngresos==='function')loadIngresos();
  if(typeof loadDesgrav==='function')loadDesgrav();
  if(typeof loadDespacho==='function')loadDespacho();
  if(typeof loadCompras==='function')loadCompras();
  if(typeof loadEconComp==='function')loadEconComp();
  if(typeof loadGastosToggles==='function')loadGastosToggles();
  var ov=document.getElementById('econOverlay');
  document.getElementById('econContent').innerHTML=renderEconContent();
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindEconEvents();});});
}
function closeEcon(){
  var ov=document.getElementById('econOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}
function reRenderEcon(){
  document.getElementById('econContent').innerHTML=renderEconContent();
  bindEconEvents();
}

/* ── bindEconEvents ─────────────────────────────────────────── */
function bindEconEvents(){
  bindNavBar('econ',closeEcon);
  // Tabs
  document.getElementById('ecTabResumen').addEventListener('click',function(){ECON_VIEW='resumen';reRenderEcon();});
  document.getElementById('ecTabGastos').addEventListener('click',function(){ECON_VIEW='gastos';reRenderEcon();});
  document.getElementById('ecTabAnalisis').addEventListener('click',function(){ECON_VIEW='analisis';reRenderEcon();});
  document.getElementById('ecTabEstudio').addEventListener('click',function(){
    // Sync A con tarifa actual de Resumen
    if(ECON_RATE_MODE!=='salary'){
      var s=computeYearlySummary(ECON_YEAR);
      var aRate=ECON_RATE_MODE==='hourly'?Math.round(DAILY_RATE/(s.avgHDay||8)*100)/100:DAILY_RATE;
      ECON_SCENARIOS[0].rateType=ECON_RATE_MODE;
      ECON_SCENARIOS[0].rateValue=aRate;
    }
    ECON_VIEW='estudio';reRenderEcon();
  });
  var gearBtn=document.getElementById('ecGear');
  if(gearBtn)gearBtn.addEventListener('click',function(){
    NAV_BACK=function(){closeEcon();openEcon();};openFiscal();
  });
  document.getElementById('ecPrev').addEventListener('click',function(){ECON_YEAR--;reRenderEcon();});
  document.getElementById('ecNext').addEventListener('click',function(){ECON_YEAR++;reRenderEcon();});
  document.getElementById('ecPdf').addEventListener('click',function(){
    document.body.classList.add('print-econ');window.print();document.body.classList.remove('print-econ');
  });
  if(ECON_VIEW==='resumen')bindEconResumenEvents();
  else if(ECON_VIEW==='gastos'&&typeof bindEconGastosEvents==='function')bindEconGastosEvents();
  else if(ECON_VIEW==='estudio')bindEconEstudioEvents();
  setTimeout(function(){
    var qs=document.querySelector('.econ-quarter-section');
    var ms=document.querySelector('.econ-month-section');
    if(qs&&ms)ms.style.maxWidth=qs.offsetWidth+'px';
  },60);
}

function bindEconEstudioEvents(){
  var subComp=document.getElementById('ecSubComp');
  var subSim=document.getElementById('ecSubSim');
  if(subComp)subComp.addEventListener('click',function(){ECON_ESTUDIO_SUB='comparador';reRenderEcon();});
  if(subSim)subSim.addEventListener('click',function(){ECON_ESTUDIO_SUB='simulador';reRenderEcon();});
  if(ECON_ESTUDIO_SUB==='comparador'&&typeof bindEconCompEvents==='function')bindEconCompEvents();
  else if(ECON_ESTUDIO_SUB==='simulador'&&typeof bindEconSimEvents==='function')bindEconSimEvents();
}

function bindEconResumenEvents(){
  /* Modo Autónomo / Nómina */
  var modeF=document.getElementById('ecModeFreelance');
  var modeS=document.getElementById('ecModeSalary');
  if(modeF)modeF.addEventListener('click',function(){if(ECON_RATE_MODE==='salary'){ECON_RATE_MODE='daily';reRenderEcon();}});
  if(modeS)modeS.addEventListener('click',function(){if(ECON_RATE_MODE!=='salary'){ECON_RATE_MODE='salary';reRenderEcon();}});

  var ecChkFest=document.getElementById('ecExclFestChk');
  var ecChkVac=document.getElementById('ecExclVacChk');
  if(ecChkFest)ecChkFest.addEventListener('change',function(){EXCL_FEST=this.checked;save();reRenderEcon();});
  if(ecChkVac)ecChkVac.addEventListener('change',function(){EXCL_VAC=this.checked;save();reRenderEcon();});
  // Calcular button
  var calcBtn=document.getElementById('ecCalcular');
  if(calcBtn)calcBtn.addEventListener('click',function(){
    if(ECON_RATE_MODE==='salary'){
      var salEl=document.getElementById('rateSalaryInput');
      window._ECON_SALARY=parseFloat(salEl?salEl.value:'')||0;
      reRenderEcon();return;
    }
    var dayEl=document.getElementById('rateDayInput');
    var hourEl=document.getElementById('rateHourInput');
    var dayV=parseFloat(dayEl?dayEl.value:'');
    var hourV=parseFloat(hourEl?hourEl.value:'');
    var s=computeYearlySummary(ECON_YEAR);
    var curHourly=Math.round(DAILY_RATE/(s.avgHDay||8)*100)/100;
    if(hourEl&&Math.abs(hourV-curHourly)>0.005){
      ECON_RATE_MODE='hourly';
      DAILY_RATE=Math.round(hourV*(s.avgHDay||8));
    } else if(dayEl&&dayV>0){
      ECON_RATE_MODE='daily';
      DAILY_RATE=Math.round(dayV);
    }
    save();reRenderEcon();
  });
  // Click en inputs cambia el modo primario
  var dayInput=document.getElementById('rateDayInput');
  var hourInput=document.getElementById('rateHourInput');
  if(dayInput)dayInput.addEventListener('focus',function(){ECON_RATE_MODE='daily';});
  if(hourInput)hourInput.addEventListener('focus',function(){ECON_RATE_MODE='hourly';});
}

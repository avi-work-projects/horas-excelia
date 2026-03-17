/* ============================================================
   ECONOMICS — Core + Tab 1: Resumen
   ============================================================ */

var ECON_YEAR=new Date().getFullYear();
var ECON_VIEW='resumen';    // 'resumen' | 'gastos' | 'analisis' | 'estudio'
var ECON_RATE_MODE='daily'; // 'daily' | 'hourly' | 'salary'
var ECON_MULTI_RATE=false;
var ECON_RATE_PERIODS=[{from:0,to:11,rate:0}]; // legacy month-based (migrated to date-based)
/* New date-based periods: [{startDate:'YYYY-MM-DD', rate:315, rateMode:'daily'}]
   First period always starts Jan 1. The startDate of period N+1 = end+1 of period N.
   Last period always ends Dec 31. */
var ECON_ESTUDIO_SUB='comparador'; // 'comparador' | 'simulador'
window._ECON_SALARY=30000; // salario bruto anual para modo nómina

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
  var netoMensual12=Math.round(netoAnual/12*100)/100;  // 12 pagas
  var ssEmpleador=Math.round(ssBase*_SS_PAT_PCT/100*100)/100;
  var costeEmpresa=Math.round((brutAnual+ssEmpleador)*100)/100;
  return{brutAnual:brutAnual,ssEmpleado:ssEmpleado,baseIrpf:baseIrpf,
    irpfRetenido:irpfRetenido,irpfPct:irpf.effectivePct,
    netoAnual:netoAnual,netoMensual:netoMensual,netoMensual12:netoMensual12,
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
/* Helper: given date-based rate periods for a year, returns the effective daily rate for a given date.
   Periods: [{startDate:'YYYY-MM-DD', rate:315, rateMode:'daily'|'hourly'}] sorted by startDate.
   Falls back to DAILY_RATE if no period matches. */
function _rateForDate(datePeriods,dateStr,fallbackRate,avgHDay){
  if(!datePeriods||!datePeriods.length)return fallbackRate;
  var effectiveRate=fallbackRate;
  for(var i=0;i<datePeriods.length;i++){
    if(dateStr>=datePeriods[i].startDate){
      var r=datePeriods[i].rate||0;
      if(datePeriods[i].rateMode==='hourly'&&r>0){effectiveRate=Math.round(r*avgHDay*100)/100;}
      else if(r>0){effectiveRate=r;}
    }
  }
  return effectiveRate;
}

/* Build date-period boundaries for computeEconEx.
   Converts legacy month-based periods to date-based if needed. */
function _buildDatePeriods(year,ratePeriods){
  if(!ratePeriods||!ratePeriods.length)return null;
  // Check if already date-based (has startDate property)
  if(ratePeriods[0].startDate)return ratePeriods;
  // Legacy month-based → convert
  var result=[];
  for(var i=0;i<ratePeriods.length;i++){
    var p=ratePeriods[i];
    var mm=String(p.from+1).padStart(2,'0');
    result.push({startDate:year+'-'+mm+'-01',rate:p.rate||0,rateMode:'daily'});
  }
  return result;
}

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
  var datePeriods=opts.ratePeriods?_buildDatePeriods(year,opts.ratePeriods):null;
  for(var m=0;m<12;m++){
    var dias=s.mDays[m]+s.mDaysP[m];
    var effHours=hoursMode==='8h'?dias*8:(s.mHours[m]+s.mHoursP[m]);
    var effectiveRate=dailyRate;
    if(datePeriods&&datePeriods.length>0){
      /* Weighted average rate for the month — iterate actual work days */
      var mKey=year+'-'+String(m+1).padStart(2,'0');
      var daysInMonth=new Date(year,m+1,0).getDate();
      var rateSum=0,rateCount=0;
      for(var d=1;d<=daysInMonth;d++){
        var ds=mKey+'-'+String(d).padStart(2,'0');
        var dayType=ST[ds];
        if(!dayType&&(new Date(ds+'T00:00:00').getDay()===0||new Date(ds+'T00:00:00').getDay()===6))continue; // skip weekends unless marked
        if(dayType&&dayType.type==='festivo')continue;
        if(dayType&&dayType.type==='vacaciones')continue;
        if(dayType&&dayType.type==='baja')continue;
        var dayRate=_rateForDate(datePeriods,ds,dailyRate,avgHDay);
        rateSum+=dayRate;rateCount++;
      }
      effectiveRate=rateCount>0?Math.round(rateSum/rateCount*100)/100:dailyRate;
    }
    var base=opts.rateType==='hourly'&&opts.rateValue>0?Math.round(effHours*opts.rateValue*100)/100:Math.round(dias*effectiveRate*100)/100;
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
  var step=2500;while(maxV/step>5&&step<1e12)step*=2;
  var bw=Math.floor((bW-n*2)/n),gap=2;
  var today=new Date();var cm=ECON_YEAR===today.getFullYear()?today.getMonth():-1;
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">';
  var gridCount=0;
  for(var gv=step;gv<=maxV*1.05;gv+=step){
    if(++gridCount>10)break;
    var gy=Math.round(H-(gv/maxV)*(H-PT));if(gy<PT)break;
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+W+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl;if(gv>=1000000&&gv%1000000===0)lbl=(gv/1000000)+'M';else if(gv%1000===0)lbl=(gv/1000)+'k';else lbl=((gv/1000).toFixed(1).replace('.',','))+'k';
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

/* ── Helpers: date-based multi-rate ─────────────────────────── */
function _fmtDateEs(ds){
  if(!ds)return'';
  var parts=ds.split('-');
  return parts[2]+'/'+parts[1]+'/'+parts[0];
}
function _prevDate(ds){
  var d=new Date(ds+'T12:00:00');
  d.setDate(d.getDate()-1);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
/* Ensure ECON_RATE_PERIODS is in date-based format for a given year.
   Migrates legacy month-based format if needed. */
function _ensureDatePeriods(year){
  if(!ECON_RATE_PERIODS||!ECON_RATE_PERIODS.length){
    ECON_RATE_PERIODS=[{startDate:year+'-01-01',rate:DAILY_RATE,rateMode:'daily'}];
    return ECON_RATE_PERIODS;
  }
  if(ECON_RATE_PERIODS[0].startDate)return ECON_RATE_PERIODS;
  // Legacy migration
  var migrated=[];
  for(var i=0;i<ECON_RATE_PERIODS.length;i++){
    var p=ECON_RATE_PERIODS[i];
    var mm=String((p.from||0)+1).padStart(2,'0');
    migrated.push({startDate:year+'-'+mm+'-01',rate:p.rate||DAILY_RATE,rateMode:'daily'});
  }
  ECON_RATE_PERIODS=migrated;
  return ECON_RATE_PERIODS;
}
/* Render a rate input pair (€/día ↔ €/hora) with a prefix for unique IDs */
function _renderRateInputs(prefix,dailyVal,hourlyVal,avgH,mode){
  var pfx=prefix||'';
  var h='<div class="econ-rate-dual">';
  h+='<div class="econ-rate-field'+(mode==='daily'||mode!=='hourly'?' primary':' derived')+'">';
  h+='<label>&#8364;/d&#237;a</label>';
  h+='<input class="econ-rate-input econ-mr-rate" id="rateDay'+pfx+'" data-pfx="'+pfx+'" data-rtype="daily" type="number" min="1" step="1" value="'+dailyVal+'">';
  if(!prefix)h+='<span class="econ-rate-badge">media '+avgH.toFixed(1)+'h/d&#237;a</span>';
  h+='</div>';
  h+='<div class="econ-rate-sep">&#8596;</div>';
  h+='<div class="econ-rate-field'+(mode==='hourly'?' primary':' derived')+'">';
  h+='<label>&#8364;/hora</label>';
  h+='<input class="econ-rate-input econ-mr-rate" id="rateHour'+pfx+'" data-pfx="'+pfx+'" data-rtype="hourly" type="number" min="0.01" step="0.01" value="'+hourlyVal.toFixed(2)+'">';
  h+='</div></div>';
  return h;
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
function _getMultiRateOpts(){
  if(!ECON_MULTI_RATE)return{};
  return{ratePeriods:ECON_RATE_PERIODS};
}
function renderEconResumen(){
  var _mrOpts=_getMultiRateOpts();
  var e=computeEconEx(ECON_YEAR,_mrOpts);
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
    var _salFmt=window._ECON_SALARY>0?String(window._ECON_SALARY).replace(/\B(?=(\d{3})+(?!\d))/g,'.'):'';
    h+='<input class="econ-rate-input" id="rateSalaryInput" type="text" inputmode="numeric" value="'+_salFmt+'" placeholder="30.000" autocomplete="off">';
    h+='</div></div>';
  } else {
    /* Multi-tarifa toggle */
    h+='<div class="econ-opt-row" style="margin-bottom:8px">';
    h+='<button class="econ-opt-btn'+(!ECON_MULTI_RATE?' active':'')+'" id="ecRateSingle">Tarifa \u00fanica</button>';
    h+='<button class="econ-opt-btn'+(ECON_MULTI_RATE?' active':'')+'" id="ecRateMulti">M\u00faltiples tarifas</button>';
    h+='</div>';
    if(!ECON_MULTI_RATE){
      /* ── Tarifa única: €/día ↔ €/hora ── */
      h+=_renderRateInputs('',DAILY_RATE,hourlyRate,avgHDay,ECON_RATE_MODE);
    } else {
      /* ── Múltiples tarifas: period cards ── */
      var _datePeriods=_ensureDatePeriods(ECON_YEAR);
      h+='<div class="econ-multi-rate-cards">';
      _datePeriods.forEach(function(p,pi){
        var isFirst=(pi===0);
        var isLast=(pi===_datePeriods.length-1);
        var pRate=p.rate||DAILY_RATE;
        var pHourly=Math.round(pRate/avgHDay*100)/100;
        var pMode=p.rateMode||'daily';
        var startLabel=isFirst?'01/01/'+ECON_YEAR:_fmtDateEs(p.startDate);
        var endDate=isLast?ECON_YEAR+'-12-31':_prevDate(_datePeriods[pi+1].startDate);
        var endLabel=_fmtDateEs(endDate);
        h+='<div class="econ-multi-rate-card">';
        h+='<div class="econ-multi-rate-hdr">';
        h+='<span class="econ-multi-rate-num">Per\u00edodo '+(pi+1)+'</span>';
        h+='<span class="econ-multi-rate-range">'+startLabel+' \u2014 '+endLabel+'</span>';
        if(_datePeriods.length>1){h+='<button class="econ-multi-rate-del" data-mrdel="'+pi+'">\u2715</button>';}
        h+='</div>';
        if(!isFirst){
          h+='<div class="econ-multi-rate-date-row">';
          h+='<label>Inicio del per\u00edodo</label>';
          h+='<input type="date" class="econ-mr-date" data-mri="'+pi+'" value="'+p.startDate+'" min="'+ECON_YEAR+'-01-02" max="'+ECON_YEAR+'-12-31">';
          h+='</div>';
        }
        h+=_renderRateInputs('mr'+pi,pRate,pHourly,avgHDay,pMode);
        h+='</div>';
      });
      if(_datePeriods.length<4){
        h+='<button class="econ-multi-rate-add" id="ecRateAddPeriod">+ A\u00f1adir per\u00edodo</button>';
      }
      h+='</div>';
      /* Tarifa equivalente */
      var eqRate=e.totalDays>0?Math.round(e.totBase/e.totalDays*100)/100:DAILY_RATE;
      var eqHourly=e.totalHours>0?Math.round(e.totBase/e.totalHours*100)/100:0;
      h+='<div class="econ-equiv-rate">';
      h+='<span class="econ-equiv-label">Tarifa equivalente</span>';
      h+='<span class="econ-equiv-val">'+fc(eqRate)+'/d\u00eda</span>';
      h+='<span class="econ-equiv-sep">\u00b7</span>';
      h+='<span class="econ-equiv-val">'+fc(eqHourly)+'/hora</span>';
      h+='</div>';
    }
  }
  h+='<button class="econ-calc-btn" id="ecCalcular">Calcular</button>';
  /* Checkboxes below Calcular */
  if(ECON_RATE_MODE!=='salary'){
    h+='<div class="excl-row" style="margin-top:8px">';
    h+='<label class="excl-item" style="color:var(--festivo)"><input type="checkbox" class="excl-chk" id="ecExclFestChk" style="accent-color:var(--festivo)"'+(EXCL_FEST?' checked':'')+'>&#160;Quitar festivos</label>';
    h+='<label class="excl-item" style="color:var(--vacaciones)"><input type="checkbox" class="excl-chk" id="ecExclVacChk" style="accent-color:var(--vacaciones)"'+(EXCL_VAC?' checked':'')+'>&#160;Quitar vacaciones</label>';
    h+='</div>';
  }
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
    h+=_econCard('var(--accent-bright)','Neto mensual (12p)',sal.netoMensual12,'');
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
  /* Load per-year econ config before rendering any tab */
  if(typeof loadEconYear==='function')loadEconYear(ECON_YEAR);
  var h=renderNavBar('econ');
  h+='<div class="econ-hdr-sub">';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='resumen'?' active':'')+'" id="ecTabResumen">Resumen<br>Econ\u00f3mico</button>';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='gastos'?' active':'')+'" id="ecTabGastos">An\u00e1lisis Gastos<br>Dec. Renta</button>';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='analisis'?' active':'')+'" id="ecTabAnalisis">An\u00e1lisis<br>Ec. Personal</button>';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='estudio'?' active':'')+'" id="ecTabEstudio">Estudio<br>Cambio</button>';
  h+='</div>';
  h+='<div class="sy-header with-tabs">';
  if(ECON_VIEW==='resumen'||ECON_VIEW==='gastos'||ECON_VIEW==='analisis'){
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
/* ── Análisis Economía Personal ────────────────────────────── */
var ANALISIS_SUB='gastos'; // 'gastos' | 'hipoteca'
var ANALISIS_ALT_RATE=2.5;
var ANALISIS_SWITCH_COST=0;
var ANALISIS_CALC_HIP=false; // botón Calcular hipoteca
/* Desgravables para incluir en análisis personal (ids de GASTOS_ITEMS) */
var ANALISIS_DESGRAV_IDS={hipoteca:true,comunidad:true,seg_hogar:true,gas:true,luz:true,digi:true,agua:true,otros_seg:true};
var ANALISIS_DESGRAV_DISCOUNT=true; // aplicar descuento del desgravamiento
/* Seguros normales (sin vinculación) para comparar sobrecostes */
var ANALISIS_SEG_NORMAL={segSalud:0,segVida:0,segHogar:0};

function renderEconAnalisis(){
  if(typeof loadPersonalYear==='function')loadPersonalYear(ECON_YEAR);
  if(typeof loadGastosYear==='function')loadGastosYear(ECON_YEAR);
  if(typeof loadDespacho==='function')loadDespacho();
  var h='';
  /* Sub-tabs */
  h+='<div class="econ-sub-tabs">';
  h+='<button class="econ-sub-tab'+(ANALISIS_SUB==='gastos'?' active':'')+'" id="analisisSubGastos">Mis gastos</button>';
  h+='<button class="econ-sub-tab'+(ANALISIS_SUB==='hipoteca'?' active':'')+'" id="analisisSubHipoteca">An\u00e1lisis Hipoteca</button>';
  h+='</div>';
  if(ANALISIS_SUB==='gastos'){h+=_renderAnalisisGastos();}
  else{h+=_renderAnalisisHipoteca();}
  return h;
}

function _renderAnalisisGastos(){
  var h='';

  /* A. Resumen mensual de flujo personal */
  var tGS=typeof _personalTotalWeekly==='function'?_personalTotalWeekly(PERSONAL_DATA.gastosSemanales):0;
  var tGR=typeof _personalTotal==='function'?_personalTotal(PERSONAL_DATA.gastosRecurrentes):0;
  var tInv=typeof _personalTotal==='function'?_personalTotal(PERSONAL_DATA.inversiones):0;
  var tIng=typeof _personalTotal==='function'?_personalTotal(PERSONAL_DATA.ingresos):0;
  var totalGastos=tGS+tGR;
  var balance=tIng-totalGastos-tInv;

  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Flujo mensual personal ('+ECON_YEAR+')</div>';
  h+='<div class="analisis-cards">';
  h+=_analisisCard('Ingresos extra',tIng/12,'var(--c-green)');
  h+=_analisisCard('Gastos',totalGastos/12,'var(--c-orange)');
  h+=_analisisCard('Inversiones',tInv/12,'var(--accent-bright)');
  h+=_analisisCard('Balance',balance/12,balance>=0?'var(--c-green)':'var(--c-red)');
  h+='</div></div>';

  /* Compute all personal items upfront */
  var allGastos=[];
  (PERSONAL_DATA.gastosSemanales||[]).forEach(function(g){
    if(!g.amount)return;
    var annual=g.period==='monthly'?g.amount*12:g.amount*52;
    allGastos.push({label:g.label,annual:annual});
  });
  (PERSONAL_DATA.gastosRecurrentes||[]).forEach(function(g){
    if(!g.amount)return;
    var annual=g.period==='annual'?g.amount:g.period==='weekly'?g.amount*52:g.amount*12;
    allGastos.push({label:g.label,annual:annual});
  });
  allGastos.sort(function(a,b){return b.annual-a.annual;});
  var allInv=[];
  (PERSONAL_DATA.inversiones||[]).forEach(function(g){
    if(!g.amount)return;
    var annual=g.period==='annual'?g.amount:g.amount*12;
    allInv.push({label:g.label,annual:annual});
  });
  allInv.sort(function(a,b){return b.annual-a.annual;});

  if(allGastos.length>0){
    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">Distribuci\u00f3n de gastos personales</div>';
    h+=_analisisHBar(allGastos,'#fb923c');
    var totalAn=0;allGastos.forEach(function(g){totalAn+=g.annual;});
    h+='<div style="font-size:.72rem;color:var(--text-dim);margin-top:6px">Total anual: <b>'+fcPlain(totalAn)+'</b> ('+fcPlain(Math.round(totalAn/12*100)/100)+'/mes)</div>';
    h+='</div>';
  }

  /* B2. % del Disponible para gastos personales */
  var disponible=typeof computeDisponible==='function'?computeDisponible(ECON_YEAR):0;
  if(disponible>0&&(allGastos.length>0||allInv.length>0)){
    var pItems=[];
    /* Personal gastos */
    allGastos.forEach(function(g){pItems.push({label:g.label,annual:g.annual,cat:'gasto'});});
    /* Personal inversiones */
    allInv.forEach(function(g){pItems.push({label:g.label,annual:g.annual,cat:'inversion'});});
    /* Desgravables opcionales */
    if(typeof GASTOS_ITEMS!=='undefined'){
      var DESGRAV_LABELS={hipoteca:'Hipoteca',comunidad:'Com. Propietarios',seg_hogar:'Seg. Hogar',gas:'Gas',luz:'Luz',digi:'Digi',agua:'Agua',otros_seg:'Otros seguros'};
      var drInfo=typeof computeDeclResult==='function'?computeDeclResult(computeEconEx(ECON_YEAR).totBase,computeEconEx(ECON_YEAR).totIrpf):null;
      var desgravPct=drInfo&&drInfo.decl?drInfo.decl.effectivePct||0:0;
      Object.keys(ANALISIS_DESGRAV_IDS).forEach(function(gid){
        if(!ANALISIS_DESGRAV_IDS[gid])return;
        var g=null;for(var gi=0;gi<GASTOS_ITEMS.length;gi++){if(GASTOS_ITEMS[gi].id===gid){g=GASTOS_ITEMS[gi];break;}}
        if(!g||!g.amount)return;
        var anual=typeof gastoAnual==='function'?gastoAnual(gid):(g.period==='monthly'?g.amount*12:g.amount);
        if(ANALISIS_DESGRAV_DISCOUNT&&desgravPct>0){
          anual=Math.round(anual*(1-desgravPct/100)*100)/100;
        }
        pItems.push({label:(DESGRAV_LABELS[gid]||g.label)+(ANALISIS_DESGRAV_DISCOUNT?' (neto)':''),annual:anual,cat:'desgrav'});
      });
    }
    pItems.sort(function(a,b){return b.annual-a.annual;});
    var totalPartidas=0;pItems.forEach(function(p){totalPartidas+=p.annual;});
    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">% del Disponible ('+fcPlain(disponible)+'/a\u00f1o)</div>';
    h+='<div class="analisis-hbar-wrap">';
    pItems.forEach(function(p){
      var pct=disponible>0?Math.round(p.annual/disponible*1000)/10:0;
      var color=p.cat==='gasto'?'#fb923c':p.cat==='inversion'?'var(--accent-bright)':'#c084fc';
      h+='<div class="analisis-hbar-row">';
      h+='<span class="analisis-hbar-label">'+escHtml(p.label)+'</span>';
      h+='<div class="analisis-hbar-track"><div class="analisis-hbar-fill" style="width:'+Math.min(pct,100)+'%;background:'+color+'"></div></div>';
      h+='<span class="analisis-hbar-val">'+pct+'% <span style="font-size:.6rem;color:var(--text-dim)">'+fcPlain(Math.round(p.annual))+'</span></span>';
      h+='</div>';
    });
    h+='</div>';
    var usedPct=disponible>0?Math.round(totalPartidas/disponible*1000)/10:0;
    var restante=Math.round((disponible-totalPartidas)*100)/100;
    h+='<div style="font-size:.72rem;color:var(--text-dim);margin-top:8px">Usado: <b>'+usedPct+'%</b> ('+fcPlain(totalPartidas)+') &middot; Libre: <b>'+fcPlain(restante)+'</b></div>';
    /* Toggles para incluir gastos desgravables */
    h+='<div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:var(--radius-sm);border:1px solid var(--border)">';
    h+='<div style="font-size:.68rem;color:var(--text-dim);margin-bottom:6px">Incluir gastos desgravables en el an\u00e1lisis:</div>';
    var _dIds=['hipoteca','comunidad','seg_hogar','gas','luz','agua','digi','otros_seg'];
    var _dLbls={hipoteca:'Hipoteca',comunidad:'Com. Propietarios',seg_hogar:'Seg. Hogar',gas:'Gas',luz:'Luz',agua:'Agua',digi:'Digi',otros_seg:'Otros seg.'};
    h+='<div style="display:flex;flex-wrap:wrap;gap:4px">';
    _dIds.forEach(function(did){
      h+='<label style="display:flex;align-items:center;gap:3px;font-size:.68rem;color:var(--text-muted);cursor:pointer"><input type="checkbox" class="analisis-desgrav-chk" data-did="'+did+'"'+(ANALISIS_DESGRAV_IDS[did]?' checked':'')+' style="accent-color:#c084fc">'+_dLbls[did]+'</label>';
    });
    h+='</div>';
    h+='<label style="display:flex;align-items:center;gap:4px;font-size:.68rem;color:#c084fc;margin-top:6px;cursor:pointer"><input type="checkbox" id="analisisDesgravDiscount"'+(ANALISIS_DESGRAV_DISCOUNT?' checked':'')+' style="accent-color:#c084fc">Aplicar descuento desgravamiento ('+desgravPct.toFixed(1)+'%)</label>';
    h+='</div>';
    h+='</div>';
  }

  /* C. Inversiones breakdown */
  if(allInv.length>0){
    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">Inversiones recurrentes</div>';
    h+=_analisisHBar(allInv,'var(--accent-bright)');
    h+='<div style="font-size:.72rem;color:var(--text-dim);margin-top:6px">Total anual: <b>'+fcPlain(tInv)+'</b> ('+fcPlain(Math.round(tInv/12*100)/100)+'/mes)</div>';
    h+='</div>';
  }

  /* Empty state if no personal data */
  if(allGastos.length===0&&allInv.length===0&&tIng===0){
    h+='<div class="sy-section" style="text-align:center;padding:20px;color:var(--text-dim)">';
    h+='<div style="font-size:.75rem">Configura tus gastos e inversiones en <b>\u2699 Configuraci\u00f3n Fiscal \u2192 Econom\u00eda Personal</b></div>';
    h+='</div>';
  }
  return h;
}

function _renderAnalisisHipoteca(){
  var h='';
  /* D. Hipoteca — Comparativa tipo fijo */
  var comp=DESPACHO&&DESPACHO.compra?DESPACHO.compra:null;
  if(comp&&comp.importePrestamo>0&&comp.tipoInteres>0&&comp.plazoAnios>0){
    var r1=comp.tipoInteres/100/12;
    var n=comp.plazoAnios*12;
    var cuota1=comp.importePrestamo*r1*Math.pow(1+r1,n)/(Math.pow(1+r1,n)-1);
    var total1=cuota1*n;
    var intereses1=total1-comp.importePrestamo;

    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">Hipoteca \u2014 Comparativa tipo fijo</div>';

    /* Current mortgage info */
    h+='<div class="analisis-mortgage-current">';
    h+='<div class="analisis-mortgage-label">Hipoteca actual ('+comp.tipoInteres.toFixed(2)+'% fijo)</div>';
    h+='<div class="analisis-mortgage-vals">';
    h+='<span>Cuota: <b>'+fcPlain(Math.round(cuota1*100)/100)+'</b>/mes</span>';
    h+='<span>Total: <b>'+fcPlain(Math.round(total1))+'</b></span>';
    h+='<span>Intereses: <b style="color:var(--c-orange)">'+fcPlain(Math.round(intereses1))+'</b></span>';
    h+='</div></div>';

    /* Alternative rate input */
    h+='<div class="analisis-mortgage-alt">';
    h+='<div class="analisis-mortgage-label">Comparar con otro tipo fijo</div>';
    h+='<div class="analisis-mortgage-inputs">';
    h+='<div class="analisis-input-group"><label>Tipo alternativo %</label>';
    h+='<input class="analisis-input" id="analisisAltRate" type="number" min="0" step="0.1" value="'+ANALISIS_ALT_RATE+'"></div>';
    h+='<div class="analisis-input-group"><label>Coste cambio banco \u20ac</label>';
    h+='<input class="analisis-input" id="analisisSwitchCost" type="number" min="0" step="100" value="'+ANALISIS_SWITCH_COST+'"></div>';
    h+='</div>';
    h+='<button class="econ-calc-btn" id="analisisCalcHip" style="margin-top:6px">Calcular</button>';

    /* Calculate alternative */
    if(ANALISIS_CALC_HIP&&ANALISIS_ALT_RATE>0){
      var r2=ANALISIS_ALT_RATE/100/12;
      var cuota2=comp.importePrestamo*r2*Math.pow(1+r2,n)/(Math.pow(1+r2,n)-1);
      var total2=cuota2*n+ANALISIS_SWITCH_COST;
      var intereses2=cuota2*n-comp.importePrestamo;
      var ahorro=total1-total2;
      var ahorroMes=Math.round((cuota1-cuota2)*100)/100;

      h+='<div class="analisis-mortgage-result">';
      h+='<div class="analisis-mortgage-vals">';
      h+='<span>Cuota: <b>'+fcPlain(Math.round(cuota2*100)/100)+'</b>/mes</span>';
      h+='<span>Total: <b>'+fcPlain(Math.round(total2))+'</b></span>';
      h+='<span>Intereses: <b style="color:var(--c-orange)">'+fcPlain(Math.round(intereses2))+'</b></span>';
      h+='</div>';
      h+='<div class="analisis-mortgage-ahorro '+(ahorro>=0?'pos':'neg')+'">';
      h+=(ahorro>=0?'Ahorras: <b>'+fcPlain(Math.round(ahorro))+'</b>':'Pagas m\u00e1s: <b>'+fcPlain(Math.round(-ahorro))+'</b>');
      h+=' ('+fcPlain(Math.abs(ahorroMes))+'/mes)';
      h+='</div>';

      /* Break-even */
      if(ANALISIS_SWITCH_COST>0&&ahorroMes>0){
        var breakEven=Math.ceil(ANALISIS_SWITCH_COST/ahorroMes);
        h+='<div style="font-size:.72rem;color:var(--text-dim)">Break-even en <b>'+breakEven+' meses</b> ('+Math.round(breakEven/12*10)/10+' a\u00f1os)</div>';
      }
      h+='</div>';

      /* SVG chart: accumulated payments */
      h+=_mortgageComparisonChart(cuota1,cuota2,n,ANALISIS_SWITCH_COST,comp.tipoInteres,ANALISIS_ALT_RATE);
    }
    h+='</div></div>';
  } else {
    h+='<div class="sy-section" style="text-align:center;padding:30px 20px;color:var(--text-dim)">';
    h+='<div style="font-size:.75rem">Configura los datos de hipoteca en <b>\u2699 Configuraci\u00f3n Fiscal \u2192 Despacho e Hipoteca</b> para ver la comparativa.</div>';
    h+='</div>';
  }

  /* Análisis subrogación */
  if(comp&&comp.subrogacion){
    h+=_renderSubrogacionAnalysis(comp);
  }

  /* Análisis sobrecoste seguros vinculados */
  h+=_renderInsuranceOvercost(comp);

  return h;
}

function _renderSubrogacionAnalysis(comp){
  var sub=comp.subrogacion;
  if(!sub||!sub.fecha||!sub.nuevoImporte||!sub.nuevoTipoInteres||!sub.nuevoPlazoAnios)return '';
  if(!comp.fechaInicio||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios)return '';
  var h='';
  /* Calcular saldo vivo a fecha subrogación con condiciones originales */
  var balanceAtSub=typeof _computeBalanceAtDate==='function'?_computeBalanceAtDate(comp,sub.fecha):0;
  if(balanceAtSub<=0)return '';

  /* Cuota original para el plazo restante */
  var startP=comp.fechaInicio.split('-');
  var subP=sub.fecha.split('-');
  var mesesTranscurridos=((parseInt(subP[0],10)-parseInt(startP[0],10))*12)+(parseInt(subP[1],10)-parseInt(startP[1],10));
  var mesesRestantesOrig=comp.plazoAnios*12-mesesTranscurridos;
  if(mesesRestantesOrig<=0)return '';

  var r1=comp.tipoInteres/100/12;
  var cuotaOrig=balanceAtSub*r1*Math.pow(1+r1,mesesRestantesOrig)/(Math.pow(1+r1,mesesRestantesOrig)-1);
  var totalOrig=cuotaOrig*mesesRestantesOrig;
  var interesesOrig=totalOrig-balanceAtSub;

  /* Cuota nueva */
  var r2=sub.nuevoTipoInteres/100/12;
  var mesesNuevo=sub.nuevoPlazoAnios*12;
  var cuotaNueva=sub.nuevoImporte*r2*Math.pow(1+r2,mesesNuevo)/(Math.pow(1+r2,mesesNuevo)-1);
  var totalNuevo=cuotaNueva*mesesNuevo;
  var interesesNuevo=totalNuevo-sub.nuevoImporte;

  /* Costes del cambio */
  var costesCambio=(sub.comisionCancelacion||0)+(sub.notaria||0)+(sub.tasacion||0)+(sub.registro||0);

  /* Ahorro */
  var ahorroIntereses=Math.round((interesesOrig-interesesNuevo)*100)/100;
  var ahorroTotal=Math.round((totalOrig-(totalNuevo+costesCambio))*100)/100;
  var ahorroMes=Math.round((cuotaOrig-cuotaNueva)*100)/100;

  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">An\u00e1lisis de la subrogaci\u00f3n</div>';

  /* Cards resumen */
  h+='<div class="analisis-cards">';
  h+=_analisisCard('Ahorro cuota',ahorroMes,ahorroMes>=0?'var(--c-green)':'var(--c-red)');
  h+=_analisisCard('Ahorro intereses',(ahorroIntereses/12/((mesesNuevo>mesesRestantesOrig?mesesNuevo:mesesRestantesOrig)/12)),ahorroIntereses>=0?'var(--c-green)':'var(--c-red)');
  h+='</div>';

  /* Detalle */
  h+='<div style="padding:8px 0;font-size:.72rem;color:var(--text-muted)">';
  h+='<div>Capital pendiente al subrogar: <b>'+fcPlain(balanceAtSub)+'</b></div>';
  h+='<div>Costes del cambio: <b style="color:var(--c-orange)">'+fcPlain(costesCambio)+'</b></div>';
  h+='<div style="margin-top:4px">Cuota original ('+comp.tipoInteres.toFixed(2)+'%, '+mesesRestantesOrig+' meses): <b>'+fcPlain(Math.round(cuotaOrig*100)/100)+'</b>/mes</div>';
  h+='<div>Cuota nueva ('+sub.nuevoTipoInteres.toFixed(2)+'%, '+mesesNuevo+' meses): <b>'+fcPlain(Math.round(cuotaNueva*100)/100)+'</b>/mes</div>';
  h+='<div style="margin-top:4px">Intereses originales restantes: <b style="color:var(--c-orange)">'+fcPlain(Math.round(interesesOrig))+'</b></div>';
  h+='<div>Intereses nuevos: <b style="color:var(--c-orange)">'+fcPlain(Math.round(interesesNuevo))+'</b></div>';
  h+='<div style="margin-top:4px;font-size:.78rem">Ahorro total: <b style="color:'+(ahorroTotal>=0?'var(--c-green)':'var(--c-red)')+'">'+fcPlain(Math.round(ahorroTotal))+'</b></div>';
  h+='</div>';

  /* Break-even */
  if(costesCambio>0&&ahorroMes>0){
    var breakEven=Math.ceil(costesCambio/ahorroMes);
    h+='<div style="font-size:.72rem;color:var(--text-dim);padding:4px 0">Recuperas la inversi\u00f3n en <b>'+breakEven+' meses</b> ('+Math.round(breakEven/12*10)/10+' a\u00f1os)</div>';
  }

  /* Gráfica SVG comparativa */
  var maxMeses=Math.max(mesesRestantesOrig,mesesNuevo);
  var points=Math.min(Math.ceil(maxMeses/12),40);
  h+=_mortgageComparisonChart(cuotaOrig,cuotaNueva,maxMeses,costesCambio,comp.tipoInteres,sub.nuevoTipoInteres);

  h+='</div>';
  return h;
}

function _analisisCard(label,val,color){
  var sign=val>=0?'':'\u2212';
  var abs=Math.abs(Math.round(val*100)/100);
  return '<div class="analisis-card" style="border-left-color:'+color+'">'
    +'<div class="analisis-card-label">'+label+'</div>'
    +'<div class="analisis-card-value" style="color:'+color+'">'+sign+fcPlain(abs)+'/mes</div></div>';
}

function _analisisHBar(items,color){
  var maxVal=items[0]?items[0].annual:1;
  var h='<div class="analisis-hbar-wrap">';
  var barColors=['#fb923c','#f59e0b','#fbbf24','#34d399','#6c8cff','#c084fc','#ff6b6b','#a78bfa'];
  items.forEach(function(item,i){
    var pct=maxVal>0?Math.round(item.annual/maxVal*100):0;
    var bc=typeof color==='string'&&color.charAt(0)==='#'?color:barColors[i%barColors.length];
    if(color==='var(--accent-bright)')bc=['#6c8cff','#818cf8','#a78bfa','#c084fc','#34d399'][i%5];
    h+='<div class="analisis-hbar-row">';
    h+='<div class="analisis-hbar-label">'+item.label+'</div>';
    h+='<div class="analisis-hbar-track"><div class="analisis-hbar-fill" style="width:'+Math.max(pct,4)+'%;background:'+bc+'"></div></div>';
    h+='<div class="analisis-hbar-val">'+fcPlain(Math.round(item.annual))+'/a</div>';
    h+='</div>';
  });
  h+='</div>';
  return h;
}

function _renderInsuranceOvercost(comp){
  var h='';
  var vinc=comp?comp.vinculaciones:null;
  if(!vinc)return '';
  /* Check if any insurance vinculación is enabled */
  var _segKeys=[{key:'segSalud',label:'Seguro salud'},{key:'segVida',label:'Seguro de vida'},{key:'segHogar',label:'Seguro hogar'}];
  var hasAny=false;
  _segKeys.forEach(function(s){if(vinc[s.key]&&vinc[s.key].enabled)hasAny=true;});
  if(!hasAny)return '';

  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Sobrecoste de seguros vinculados</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:10px">Compara lo que pagas en seguros vinculados a la hipoteca con lo que costar\u00edan sin vinculaci\u00f3n.</div>';

  var totalVinc=0,totalNormal=0;
  h+='<div class="analisis-insurance-table">';
  h+='<div class="analisis-ins-header">';
  h+='<span></span><span>Vinculado</span><span>Normal</span><span>Sobrecoste</span>';
  h+='</div>';
  _segKeys.forEach(function(s){
    if(!vinc[s.key]||!vinc[s.key].enabled)return;
    var costeVinc=vinc[s.key].costeAnual||0;
    var costeNormal=ANALISIS_SEG_NORMAL[s.key]||0;
    var diff=costeVinc-costeNormal;
    totalVinc+=costeVinc;totalNormal+=costeNormal;
    h+='<div class="analisis-ins-row">';
    h+='<span class="analisis-ins-label">'+s.label+'</span>';
    h+='<span class="analisis-ins-val" style="color:var(--c-orange)">'+fcPlain(costeVinc)+'</span>';
    h+='<span class="analisis-ins-val"><input class="analisis-input analisis-seg-normal" data-seg="'+s.key+'" type="number" min="0" step="10" value="'+costeNormal+'" style="width:70px;font-size:.72rem;text-align:right"></span>';
    h+='<span class="analisis-ins-val" style="color:'+(diff>0?'var(--c-red)':'var(--c-green)')+'">'+((diff>0?'+':'')+fcPlain(diff))+'</span>';
    h+='</div>';
  });
  var totalDiff=totalVinc-totalNormal;
  h+='<div class="analisis-ins-row analisis-ins-total">';
  h+='<span class="analisis-ins-label"><b>Total anual</b></span>';
  h+='<span class="analisis-ins-val" style="color:var(--c-orange)"><b>'+fcPlain(totalVinc)+'</b></span>';
  h+='<span class="analisis-ins-val"><b>'+fcPlain(totalNormal)+'</b></span>';
  h+='<span class="analisis-ins-val" style="color:'+(totalDiff>0?'var(--c-red)':'var(--c-green)')+'"><b>'+((totalDiff>0?'+':'')+fcPlain(totalDiff))+'</b></span>';
  h+='</div>';
  h+='</div>';

  /* Resumen */
  if(totalDiff>0){
    h+='<div style="margin-top:8px;padding:8px 10px;background:var(--surface2);border-radius:var(--radius-sm);border:1px solid var(--border);font-size:.72rem">';
    h+='Sobrecoste anual por seguros vinculados: <b style="color:var(--c-red)">+'+fcPlain(totalDiff)+'</b> ('+fcPlain(Math.round(totalDiff/12*100)/100)+'/mes)';
    /* Check if vinculaciones reduction compensates */
    var vincReduccion=0;
    _segKeys.forEach(function(s){if(vinc[s.key]&&vinc[s.key].enabled)vincReduccion+=vinc[s.key].reduccion||0;});
    if(vincReduccion>0&&comp.importePrestamo>0&&comp.tipoInteres>0&&comp.plazoAnios>0){
      /* Calculate interest savings from reduction */
      var r1=comp.tipoInteres/100/12;
      var n=comp.plazoAnios*12;
      var cuota1=comp.importePrestamo*r1*Math.pow(1+r1,n)/(Math.pow(1+r1,n)-1);
      var tipoEf=Math.max(0,comp.tipoInteres-vincReduccion);
      var r2=tipoEf/100/12;
      var cuota2=r2>0?comp.importePrestamo*r2*Math.pow(1+r2,n)/(Math.pow(1+r2,n)-1):comp.importePrestamo/n;
      var ahorroAnual=Math.round((cuota1-cuota2)*12*100)/100;
      var balanceNeto=Math.round((ahorroAnual-totalDiff)*100)/100;
      h+='<br>Ahorro anual por reducci\u00f3n tipo (\u2212'+vincReduccion.toFixed(2)+'%): <b style="color:var(--c-green)">'+fcPlain(ahorroAnual)+'</b>';
      h+='<br><span style="font-size:.78rem">Balance neto: <b style="color:'+(balanceNeto>=0?'var(--c-green)':'var(--c-red)')+'">'+((balanceNeto>=0?'+':'')+fcPlain(balanceNeto))+'</b>/a\u00f1o</span>';
      if(balanceNeto>=0){
        h+='<br><span style="color:var(--c-green)">Las vinculaciones te compensan \u2714</span>';
      } else {
        h+='<br><span style="color:var(--c-red)">Las vinculaciones te cuestan '+fcPlain(-balanceNeto)+'/a\u00f1o extra</span>';
      }
    }
    h+='</div>';
  } else if(totalNormal>0){
    h+='<div style="margin-top:8px;font-size:.72rem;color:var(--c-green)">Los seguros vinculados son m\u00e1s baratos o iguales que los normales \u2714</div>';
  }
  h+='</div>';
  return h;
}

function _mortgageComparisonChart(cuota1,cuota2,nMeses,switchCost,rate1,rate2){
  var W=320,H=120,PB=18,PT=16,PL=42,PR=8;
  var W2=W-PL-PR,H2=H-PT;
  var years=Math.ceil(nMeses/12);
  var points=Math.min(years,40);
  var cum1=[],cum2=[];
  var c1=0,c2=switchCost;
  for(var y=0;y<=points;y++){
    cum1.push(Math.round(c1));
    cum2.push(Math.round(c2));
    c1+=cuota1*12;c2+=cuota2*12;
  }
  var maxV=Math.max(cum1[points],cum2[points])||1;
  function xPos(i){return Math.round(PL+(i/points)*W2);}
  function yPos(v){return Math.round(PT+H2-v/maxV*H2);}

  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;margin-top:10px">';
  /* Grid */
  var step=50000;
  while(maxV/step>5)step*=2;
  while(maxV/step<2&&step>10000)step=Math.round(step/2);
  for(var gv=0;gv<=maxV;gv+=step){
    var gy=yPos(gv);
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl=gv>=1000000?(gv/1000000).toFixed(1)+'M':gv>=1000?Math.round(gv/1000)+'k':'0';
    svg+='<text x="'+(PL-2)+'" y="'+(gy+3)+'" text-anchor="end" font-size="6" fill="#5a5a70">'+lbl+'</text>';
  }
  /* Line 1: current */
  var pts1=cum1.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
  svg+='<polyline points="'+pts1+'" fill="none" stroke="#fb923c" stroke-width="2" stroke-linejoin="round"/>';
  /* Line 2: alternative */
  var pts2=cum2.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
  svg+='<polyline points="'+pts2+'" fill="none" stroke="#34d399" stroke-width="2" stroke-linejoin="round"/>';
  /* X labels (every 5 years) */
  for(var xi=0;xi<=points;xi+=Math.max(1,Math.round(points/6))){
    svg+='<text x="'+xPos(xi)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="6" fill="#5a5a70">'+xi+'a</text>';
  }
  /* Legend */
  svg+='<rect x="'+PL+'" y="3" width="10" height="3" rx="1.5" fill="#fb923c"/>';
  svg+='<text x="'+(PL+12)+'" y="7" font-size="6" fill="#fb923c">'+rate1.toFixed(2)+'%</text>';
  svg+='<rect x="'+(PL+55)+'" y="3" width="10" height="3" rx="1.5" fill="#34d399"/>';
  svg+='<text x="'+(PL+67)+'" y="7" font-size="6" fill="#34d399">'+rate2.toFixed(2)+'%</text>';
  svg+='</svg>';
  return '<div class="analisis-mortgage-chart">'+svg+'</div>';
}

function bindEconAnalisisEvents(){
  /* Sub-tab clicks */
  var subG=document.getElementById('analisisSubGastos');
  var subH=document.getElementById('analisisSubHipoteca');
  if(subG)subG.addEventListener('click',function(){ANALISIS_SUB='gastos';reRenderEcon();});
  if(subH)subH.addEventListener('click',function(){ANALISIS_SUB='hipoteca';reRenderEcon();});
  if(ANALISIS_SUB==='gastos'){
    /* Desgravable checkboxes */
    document.querySelectorAll('.analisis-desgrav-chk').forEach(function(chk){
      chk.addEventListener('change',function(){
        ANALISIS_DESGRAV_IDS[this.dataset.did]=this.checked;
        reRenderEcon();
      });
    });
    var discountChk=document.getElementById('analisisDesgravDiscount');
    if(discountChk)discountChk.addEventListener('change',function(){ANALISIS_DESGRAV_DISCOUNT=this.checked;reRenderEcon();});
  } else {
    var rateEl=document.getElementById('analisisAltRate');
    var costEl=document.getElementById('analisisSwitchCost');
    if(rateEl)rateEl.addEventListener('change',function(){
      ANALISIS_ALT_RATE=parseFloat(this.value)||0;
      reRenderEcon();
    });
    if(costEl)costEl.addEventListener('change',function(){
      ANALISIS_SWITCH_COST=parseFloat(this.value)||0;
      reRenderEcon();
    });
    var calcHipBtn=document.getElementById('analisisCalcHip');
    if(calcHipBtn)calcHipBtn.addEventListener('click',function(){ANALISIS_CALC_HIP=true;reRenderEcon();});
    /* Normal insurance cost inputs */
    document.querySelectorAll('.analisis-seg-normal').forEach(function(inp){
      inp.addEventListener('change',function(){
        ANALISIS_SEG_NORMAL[this.dataset.seg]=parseFloat(this.value)||0;
        reRenderEcon();
      });
    });
  }
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
  var body=document.querySelector('#econOverlay .sy-body');
  var scrollTop=body?body.scrollTop:0;
  document.getElementById('econContent').innerHTML=renderEconContent();
  bindEconEvents();
  if(body)body.scrollTop=scrollTop;
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
  else if(ECON_VIEW==='analisis')bindEconAnalisisEvents();
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
  if(modeF)modeF.addEventListener('click',function(){if(ECON_RATE_MODE==='salary'){ECON_RATE_MODE='daily';if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);reRenderEcon();}});
  if(modeS)modeS.addEventListener('click',function(){if(ECON_RATE_MODE!=='salary'){ECON_RATE_MODE='salary';if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);reRenderEcon();}});

  var ecChkFest=document.getElementById('ecExclFestChk');
  var ecChkVac=document.getElementById('ecExclVacChk');
  if(ecChkFest)ecChkFest.addEventListener('change',function(){EXCL_FEST=this.checked;if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);else save();reRenderEcon();});
  if(ecChkVac)ecChkVac.addEventListener('change',function(){EXCL_VAC=this.checked;if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);else save();reRenderEcon();});
  // Calcular button
  var calcBtn=document.getElementById('ecCalcular');
  if(calcBtn)calcBtn.addEventListener('click',function(){
    if(ECON_RATE_MODE==='salary'){
      var salEl=document.getElementById('rateSalaryInput');
      var salRaw=(salEl?salEl.value:'').replace(/\./g,'');
      window._ECON_SALARY=parseFloat(salRaw)||0;
      if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);
      else save();
      reRenderEcon();return;
    }
    var s=computeYearlySummary(ECON_YEAR);
    var avgH=s.avgHDay||8;
    if(!ECON_MULTI_RATE){
      /* Single rate — read €/día and €/hora */
      var dayEl=document.getElementById('rateDay');
      var hourEl=document.getElementById('rateHour');
      var dayV=parseFloat(dayEl?dayEl.value:'');
      var hourV=parseFloat(hourEl?hourEl.value:'');
      var curHourly=Math.round(DAILY_RATE/avgH*100)/100;
      if(hourEl&&Math.abs(hourV-curHourly)>0.005){
        ECON_RATE_MODE='hourly';
        DAILY_RATE=Math.round(hourV*avgH);
      } else if(dayEl&&dayV>0){
        ECON_RATE_MODE='daily';
        DAILY_RATE=Math.round(dayV);
      }
    } else {
      /* Multi rate — read each period's €/día or €/hora */
      _ensureDatePeriods(ECON_YEAR);
      for(var pi=0;pi<ECON_RATE_PERIODS.length;pi++){
        var pfx='mr'+pi;
        var dEl=document.getElementById('rateDay'+pfx);
        var hEl=document.getElementById('rateHour'+pfx);
        var dV=parseFloat(dEl?dEl.value:'');
        var hV=parseFloat(hEl?hEl.value:'');
        var pRate=ECON_RATE_PERIODS[pi].rate||DAILY_RATE;
        var curPH=Math.round(pRate/avgH*100)/100;
        if(hEl&&Math.abs(hV-curPH)>0.005){
          ECON_RATE_PERIODS[pi].rate=Math.round(hV*avgH);
          ECON_RATE_PERIODS[pi].rateMode='hourly';
        } else if(dEl&&dV>0){
          ECON_RATE_PERIODS[pi].rate=Math.round(dV);
          ECON_RATE_PERIODS[pi].rateMode='daily';
        }
      }
      /* Also update DAILY_RATE from first period for fallback */
      if(ECON_RATE_PERIODS.length>0&&ECON_RATE_PERIODS[0].rate>0){
        DAILY_RATE=ECON_RATE_PERIODS[0].rate;
      }
    }
    if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);
    else save();
    reRenderEcon();
  });
  /* Focus on rate inputs: toggle primary/derived styling */
  document.querySelectorAll('.econ-mr-rate').forEach(function(inp){
    inp.addEventListener('focus',function(){
      var pfx=this.dataset.pfx||'';
      var rtype=this.dataset.rtype;
      var dayF=document.getElementById('rateDay'+pfx);
      var hourF=document.getElementById('rateHour'+pfx);
      if(dayF){dayF.parentElement.className='econ-rate-field'+(rtype==='daily'?' primary':' derived');}
      if(hourF){hourF.parentElement.className='econ-rate-field'+(rtype==='hourly'?' primary':' derived');}
    });
  });
  /* Salary input: thousands separator */
  var salInput=document.getElementById('rateSalaryInput');
  if(salInput)salInput.addEventListener('input',function(){
    var raw=this.value.replace(/[^\d]/g,'');
    if(!raw){this.value='';return;}
    var n=parseInt(raw,10);
    if(isNaN(n)){this.value='';return;}
    this.value=n>999?String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.'):String(n);
  });
  /* Multi-rate toggle */
  var mrSingle=document.getElementById('ecRateSingle');
  var mrMulti=document.getElementById('ecRateMulti');
  if(mrSingle)mrSingle.addEventListener('click',function(){if(ECON_MULTI_RATE){ECON_MULTI_RATE=false;if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);else save();reRenderEcon();}});
  if(mrMulti)mrMulti.addEventListener('click',function(){
    if(!ECON_MULTI_RATE){
      ECON_MULTI_RATE=true;
      _ensureDatePeriods(ECON_YEAR);
      if(ECON_RATE_PERIODS.length===1&&(!ECON_RATE_PERIODS[0].rate||ECON_RATE_PERIODS[0].rate===0)){
        ECON_RATE_PERIODS[0].rate=DAILY_RATE;
      }
      if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);else save();
      reRenderEcon();
    }
  });
  /* Multi-rate period controls (date-based) */
  if(ECON_MULTI_RATE){
    /* Date pickers for period start dates */
    document.querySelectorAll('.econ-mr-date').forEach(function(inp){
      inp.addEventListener('change',function(){
        var i=parseInt(this.dataset.mri,10);
        if(ECON_RATE_PERIODS[i]){
          ECON_RATE_PERIODS[i].startDate=this.value;
          if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);else save();
          reRenderEcon();
        }
      });
    });
    /* Delete period */
    document.querySelectorAll('.econ-multi-rate-del').forEach(function(btn){
      btn.addEventListener('click',function(){
        var i=parseInt(this.dataset.mrdel,10);
        ECON_RATE_PERIODS.splice(i,1);
        if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);else save();
        reRenderEcon();
      });
    });
    /* Add period */
    var addPeriodBtn=document.getElementById('ecRateAddPeriod');
    if(addPeriodBtn)addPeriodBtn.addEventListener('click',function(){
      _ensureDatePeriods(ECON_YEAR);
      var lastP=ECON_RATE_PERIODS[ECON_RATE_PERIODS.length-1];
      /* Default: start on Jul 1 if only 1 period, else the month after last start */
      var newStart;
      if(ECON_RATE_PERIODS.length===1){
        newStart=ECON_YEAR+'-07-01';
      } else {
        var lm=parseInt(lastP.startDate.slice(5,7),10);
        var nm=Math.min(lm+1,12);
        newStart=ECON_YEAR+'-'+String(nm).padStart(2,'0')+'-01';
      }
      ECON_RATE_PERIODS.push({startDate:newStart,rate:DAILY_RATE,rateMode:'daily'});
      if(typeof saveEconYear==='function')saveEconYear(ECON_YEAR);else save();
      reRenderEcon();
    });
  }
}

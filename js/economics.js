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
var ESTUDIO_YEAR=new Date().getFullYear();
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
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='dias'?' active':'')+'" id="ecTabDias">Resumen<br>D\u00edas</button>';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='gastos'?' active':'')+'" id="ecTabGastos">An\u00e1lisis Gastos<br>Dec. Renta</button>';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='analisis'?' active':'')+'" id="ecTabAnalisis">An\u00e1lisis<br>Ec. Personal</button>';
  h+='</div>';
  h+='<div class="sy-header with-tabs">';
  if(ECON_VIEW==='resumen'||ECON_VIEW==='gastos'||ECON_VIEW==='analisis'){
    h+='<button class="econ-gear-btn" id="ecGear">&#9965;</button>';
  } else {
    h+='<div style="width:42px"></div>';
  }
  h+='<div class="sy-year-nav"><button class="sy-nav" id="ecPrev">&#9664;</button><div class="sy-year">'+ECON_YEAR+'</div><button class="sy-nav" id="ecNext">&#9654;</button></div>';
  h+='<button class="sy-pdf" id="ecPdf">PDF</button>';
  h+='</div>';
  h+='<div class="sy-body">';
  if(ECON_VIEW==='resumen'){h+=renderEconResumen();}
  else if(ECON_VIEW==='dias'){h+=renderSummaryWorkBody(ECON_YEAR);}
  else if(ECON_VIEW==='gastos'){h+=typeof renderEconGastos==='function'?renderEconGastos():'';}
  else if(ECON_VIEW==='analisis'){h+=renderEconAnalisis();}
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
  /* Real income = disponible (post decl. renta + ingresos extras), NOT personal ingresos */
  var disponible=typeof computeDisponible==='function'?computeDisponible(ECON_YEAR):0;
  var tIngExtra=typeof _personalTotal==='function'?_personalTotal(PERSONAL_DATA.ingresos):0;

  /* Collect personal gastos with categories */
  var allItems=[];
  var catMap={};/* label → cat */
  (PERSONAL_DATA.gastosSemanales||[]).forEach(function(g){if(!g.amount)return;var a=g.period==='monthly'?g.amount*12:g.amount*52;allItems.push({label:g.label,annual:a,cat:'gasto'});});
  (PERSONAL_DATA.gastosRecurrentes||[]).forEach(function(g){if(!g.amount)return;var a=g.period==='annual'?g.amount:g.period==='weekly'?g.amount*52:g.amount*12;allItems.push({label:g.label,annual:a,cat:'gasto'});});
  (PERSONAL_DATA.inversiones||[]).forEach(function(g){if(!g.amount)return;var a=g.period==='annual'?g.amount:g.amount*12;allItems.push({label:g.label,annual:a,cat:'inversion'});});
  allItems.sort(function(a,b){return b.annual-a.annual;});

  var tGastos=0,tInv=0;
  allItems.forEach(function(i){if(i.cat==='inversion')tInv+=i.annual;else tGastos+=i.annual;});
  var totalOut=tGastos+tInv;
  var balance=disponible-totalOut;

  /* Empty state */
  if(allItems.length===0&&disponible<=0){
    h+='<div class="sy-section" style="text-align:center;padding:20px;color:var(--text-dim)">';
    h+='<div style="font-size:.75rem">Configura tus gastos e inversiones en <b>\u2699 Configuraci\u00f3n Fiscal \u2192 Econom\u00eda Personal</b></div>';
    h+='</div>';
    return h;
  }

  /* ── Sección 1: Resumen mensual (hero) ── */
  h+='<div class="ah-section">';
  h+='<div class="ah-section-title">Resumen mensual ('+ECON_YEAR+')</div>';
  h+='<div class="ah-cuota-hero"><div class="ah-cuota-val" style="color:'+(balance>=0?'var(--c-green)':'var(--c-red)')+'">'+fcPlain(Math.round(balance/12*100)/100)+'\u20ac</div>';
  h+='<div class="ah-cuota-sub">Libre mensual (disponible \u2212 gastos \u2212 inversiones)</div></div>';
  h+='<div class="hip-stats">';
  h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-green)">'+fcPlain(Math.round(disponible/12*100)/100)+'</span><span class="hip-stat-lbl">Disponible/mes</span></div>';
  h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-orange)">'+fcPlain(Math.round(tGastos/12*100)/100)+'</span><span class="hip-stat-lbl">Gastos/mes</span></div>';
  if(tInv>0)h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--accent-bright)">'+fcPlain(Math.round(tInv/12*100)/100)+'</span><span class="hip-stat-lbl">Inversiones/mes</span></div>';
  h+='</div>';
  h+='<div style="font-size:.62rem;color:var(--text-dim);margin-top:4px">Disponible = post decl. renta'+(tIngExtra>0?' + ingresos extra':'')+' \u2212 gastos profesionales</div>';
  /* Key ratios */
  if(disponible>0){
    var ratioGastos=Math.round(tGastos/disponible*100);
    var ratioAhorro=tInv>0?Math.round(tInv/disponible*100):0;
    h+='<div style="display:flex;gap:8px;margin-top:6px;font-size:.68rem">';
    h+='<span style="color:var(--text-dim)">Gastos: <b style="color:'+(ratioGastos>80?'var(--c-red)':ratioGastos>60?'var(--c-orange)':'var(--c-green)')+'">'+ratioGastos+'%</b></span>';
    if(ratioAhorro>0)h+='<span style="color:var(--text-dim)">Ahorro: <b style="color:var(--accent-bright)">'+ratioAhorro+'%</b></span>';
    var ratioLibre=Math.max(0,100-ratioGastos-ratioAhorro);
    h+='<span style="color:var(--text-dim)">Libre: <b style="color:var(--c-green)">'+ratioLibre+'%</b></span>';
    h+='</div>';
  }
  /* Donut */
  if(totalOut>0&&disponible>0){
    var pG=Math.round(tGastos/disponible*100);
    var pI=Math.round(tInv/disponible*100);
    var pL=Math.max(0,100-pG-pI);
    h+=_triDonut(pG,pI,pL);
  }
  h+='</div>';

  /* ── Sección 2: Gastos por categoría (agregados) ── */
  /* Group by "seg" prefix, "factura", etc. */
  var cats={seguros:{label:'\uD83D\uDEE1 Seguros',items:[],total:0},facturas:{label:'\uD83D\uDCE6 Facturas/Suministros',items:[],total:0},inversiones:{label:'\uD83D\uDCC8 Inversiones',items:[],total:0},otros:{label:'\uD83D\uDCCB Otros gastos',items:[],total:0}};
  allItems.forEach(function(it){
    var l=it.label.toLowerCase();
    if(it.cat==='inversion'){cats.inversiones.items.push(it);cats.inversiones.total+=it.annual;}
    else if(l.indexOf('seguro')!==-1||l.indexOf('seg.')!==-1){cats.seguros.items.push(it);cats.seguros.total+=it.annual;}
    else if(l.indexOf('factura')!==-1||l.indexOf('gas')!==-1||l.indexOf('luz')!==-1||l.indexOf('agua')!==-1||l.indexOf('internet')!==-1||l.indexOf('digi')!==-1||l.indexOf('m\u00f3vil')!==-1){cats.facturas.items.push(it);cats.facturas.total+=it.annual;}
    else{cats.otros.items.push(it);cats.otros.total+=it.annual;}
  });
  var catKeys=['seguros','facturas','inversiones','otros'];
  var catColorsMap={seguros:'#c084fc',facturas:'#fbbf24',inversiones:'#6c8cff',otros:'#fb923c'};
  /* Aggregated summary */
  var hasCats=false;
  catKeys.forEach(function(k){if(cats[k].total>0)hasCats=true;});
  if(hasCats){
    h+='<div class="ah-section">';
    h+='<div class="ah-section-title">Gastos por categor\u00eda</div>';
    var catBars=[];
    catKeys.forEach(function(k){if(cats[k].total>0)catBars.push({label:cats[k].label,annual:cats[k].total});});
    catBars.sort(function(a,b){return b.annual-a.annual;});
    h+=_analisisHBar(catBars,'multi');
    h+='<div style="font-size:.66rem;color:var(--text-dim);margin-top:6px">';
    catKeys.forEach(function(k){
      if(cats[k].total<=0)return;
      h+='<span style="margin-right:10px"><span style="color:'+catColorsMap[k]+'">\u25CF</span> '+cats[k].label.replace(/^[^\s]+ /,'')+': <b>'+fcPlain(Math.round(cats[k].total/12*100)/100)+'/mes</b></span>';
    });
    h+='</div>';
    h+='</div>';
  }

  /* ── Sección 3: Detalle de gastos ── */
  if(allItems.length>0){
    h+='<div class="ah-section">';
    h+='<div class="ah-section-title">Detalle de gastos e inversiones</div>';
    h+=_analisisHBar(allItems,'multi');
    /* Top 3 */
    if(allItems.length>=3){
      h+='<div style="font-size:.66rem;color:var(--text-dim);margin-top:4px">\uD83D\uDD25 Top 3: ';
      for(var t=0;t<Math.min(3,allItems.length);t++)h+=(t>0?', ':'')+allItems[t].label+' ('+fcPlain(Math.round(allItems[t].annual/12*100)/100)+'/mes)';
      h+='</div>';
    }
    h+='</div>';
  }

  /* ── Sección 4: Presupuesto vs Disponible (tabla compacta) ── */
  if(disponible>0&&allItems.length>0){
    /* Add desgravables if toggle on */
    var pItems=[];
    allItems.forEach(function(i){pItems.push({label:i.label,annual:i.annual,cat:i.cat});});
    var desgravPct=0;
    if(ANALISIS_DESGRAV_DISCOUNT&&typeof GASTOS_ITEMS!=='undefined'){
      var drInfo=typeof computeDeclResult==='function'&&typeof computeEconEx==='function'?computeDeclResult(computeEconEx(ECON_YEAR).totBase,computeEconEx(ECON_YEAR).totIrpf):null;
      desgravPct=drInfo&&drInfo.decl?drInfo.decl.effectivePct||0:0;
      var _dLbls={hipoteca:'Hipoteca',comunidad:'Comunidad',seg_hogar:'Seg. Hogar',gas:'Gas',luz:'Luz',digi:'Internet',agua:'Agua',otros_seg:'Otros seg.'};
      GASTOS_ITEMS.forEach(function(g){
        if(!g.amount)return;
        var anual=typeof gastoAnual==='function'?gastoAnual(g.id):(g.period==='monthly'?g.amount*12:g.amount);
        if(desgravPct>0)anual=Math.round(anual*(1-desgravPct/100)*100)/100;
        pItems.push({label:(_dLbls[g.id]||g.label)+' (neto)',annual:anual,cat:'desgrav'});
      });
    }
    pItems.sort(function(a,b){return b.annual-a.annual;});
    var totalPartidas=0;pItems.forEach(function(p){totalPartidas+=p.annual;});
    var usedPct=Math.round(totalPartidas/disponible*1000)/10;
    var restante=Math.round((disponible-totalPartidas)*100)/100;

    h+='<div class="ah-section">';
    h+='<div class="ah-section-title">Presupuesto vs Disponible ('+fcPlain(Math.round(disponible))+'/a\u00f1o)</div>';
    h+='<div class="hip-bar-wrap"><div class="hip-bar">';
    h+='<div class="hip-bar-cap" style="width:'+Math.min(usedPct,100)+'%;background:'+(usedPct>90?'var(--c-red)':usedPct>70?'var(--c-orange)':'var(--c-green)')+'"></div>';
    h+='<div class="hip-bar-int" style="width:'+Math.max(0,100-usedPct)+'%;background:var(--surface)"></div>';
    h+='</div>';
    h+='<div class="hip-bar-legend"><span style="color:'+(usedPct>90?'var(--c-red)':'var(--text-muted)')+'">Usado: '+usedPct+'%</span><span style="color:var(--c-green)">Libre: '+fcPlain(Math.round(restante/12*100)/100)+'/mes</span></div></div>';
    h+='<div class="mg-budget-table">';
    h+='<div class="mg-budget-hdr"><span>Concepto</span><span>/mes</span><span>%</span></div>';
    var _catC={gasto:'#fb923c',inversion:'#6c8cff',desgrav:'#c084fc'};
    pItems.forEach(function(p){
      var pct=Math.round(p.annual/disponible*1000)/10;
      h+='<div class="mg-budget-row"><span class="mg-budget-lbl"><span class="mg-cat-dot" style="background:'+_catC[p.cat]+'"></span>'+escHtml(p.label)+'</span>';
      h+='<span class="mg-budget-val">'+fcPlain(Math.round(p.annual/12*100)/100)+'</span><span class="mg-budget-pct">'+pct+'%</span></div>';
    });
    h+='</div>';
    h+='<label class="mg-desgrav-toggle"><input type="checkbox" id="analisisDesgravDiscount"'+(ANALISIS_DESGRAV_DISCOUNT?' checked':'')+' style="accent-color:#c084fc">Incluir gastos desgravables'+(desgravPct>0?' (neto '+desgravPct.toFixed(1)+'% desc.)':'')+'</label>';
    h+='</div>';
  }

  return h;
}

/* Tri-section donut: gastos vs inversiones vs libre */
function _triDonut(pctG,pctI,pctL){
  var r=28,cx=36,cy=36,sw=7;
  var circ=2*Math.PI*r;
  var dG=Math.round(circ*pctG/100),dI=Math.round(circ*pctI/100),dL=circ-dG-dI;
  var svg='<svg width="72" height="72" viewBox="0 0 72 72">';
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#1e1e2e" stroke-width="'+sw+'"/>';
  /* Gastos arc */
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#fb923c" stroke-width="'+sw+'" stroke-dasharray="'+dG+' '+(circ-dG)+'" stroke-dashoffset="'+(circ/4)+'" stroke-linecap="round"/>';
  /* Inversiones arc */
  if(dI>0)svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#6c8cff" stroke-width="'+sw+'" stroke-dasharray="'+dI+' '+(circ-dI)+'" stroke-dashoffset="'+(circ/4-dG)+'" stroke-linecap="round"/>';
  /* Libre arc */
  if(dL>2)svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#34d399" stroke-width="'+sw+'" stroke-dasharray="'+dL+' '+(circ-dL)+'" stroke-dashoffset="'+(circ/4-dG-dI)+'" stroke-linecap="round"/>';
  svg+='</svg>';
  var h='<div class="ah-donut-wrap">'+svg;
  h+='<div class="ah-donut-legend">';
  h+='<span><span style="color:#fb923c">\u25CF</span> Gastos '+pctG+'%</span>';
  if(pctI>0)h+='<span><span style="color:#6c8cff">\u25CF</span> Inversiones '+pctI+'%</span>';
  if(pctL>0)h+='<span><span style="color:#34d399">\u25CF</span> Libre '+pctL+'%</span>';
  h+='</div></div>';
  return h;
}

/* Helper: month name in Spanish (1-based) */
function _monthName(m){
  var names=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return names[(m-1+12)%12]||'';
}
/* Helper: compute effective rate for a mortgage considering vinculaciones */
function _hipTipoEfectivo(tipoNominal,vinc){
  var r=tipoNominal;
  if(vinc){['nomina','segHogar','segSalud','segVida'].forEach(function(k){if(vinc[k]&&vinc[k].enabled)r-=(vinc[k].reduccion||0);});}
  return Math.max(0,r);
}
/* Helper: mortgage info box for analysis (shows cuota + details) */
function _analisisMortgageBox(title,importe,tipoNominal,tipoEfectivo,plazo,banco){
  var rEf=tipoEfectivo/100/12,n=plazo*12;
  var cuota=rEf>0?importe*rEf*Math.pow(1+rEf,n)/(Math.pow(1+rEf,n)-1):importe/n;
  cuota=Math.round(cuota*100)/100;
  var total=Math.round(cuota*n*100)/100;
  var intereses=Math.round((total-importe)*100)/100;
  var h='<div class="analisis-mortgage-current" style="margin-bottom:8px">';
  h+='<div class="analisis-mortgage-label">'+title+(banco?' ('+escHtml(banco)+')':'')+'</div>';
  h+='<div class="analisis-mortgage-vals">';
  h+='<span>Cuota: <b>'+fcPlain(cuota)+'</b>/mes</span>';
  h+='<span>Total: <b>'+fcPlain(Math.round(total))+'</b></span>';
  h+='<span>Intereses: <b style="color:var(--c-orange)">'+fcPlain(Math.round(intereses))+'</b></span>';
  h+='</div>';
  if(tipoNominal!==tipoEfectivo){
    h+='<div style="font-size:.68rem;color:var(--text-dim);margin-top:2px">Tipo: '+tipoNominal.toFixed(2)+'% \u2192 efectivo <b style="color:var(--c-green)">'+tipoEfectivo.toFixed(2)+'%</b></div>';
  } else {
    h+='<div style="font-size:.68rem;color:var(--text-dim);margin-top:2px">Tipo: '+tipoNominal.toFixed(2)+'% fijo, '+plazo+' a\u00f1os</div>';
  }
  h+='</div>';
  return h;
}

function _renderAnalisisHipoteca(){
  var h='';
  var comp=DESPACHO&&DESPACHO.compra?DESPACHO.compra:null;
  if(!comp||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios){
    h+='<div class="sy-section" style="text-align:center;padding:30px 20px;color:var(--text-dim)">';
    h+='<div style="font-size:.75rem">Configura los datos de hipoteca en <b>\u2699 Configuraci\u00f3n Fiscal \u2192 Hipoteca</b> para ver el an\u00e1lisis.</div>';
    h+='</div>';
    return h;
  }

  var subs=comp.subrogaciones||[];
  if(!subs.length&&comp.subrogacion)subs=[comp.subrogacion];
  /* Get active mortgage for current calculations */
  var act=typeof _getActiveMortgage==='function'?_getActiveMortgage(comp):{importe:comp.importePrestamo,tipo:comp.tipoInteres,plazo:comp.plazoAnios,fecha:comp.fechaInicio,banco:comp.entidadBanco,vinc:comp.vinculaciones,idx:-1};
  var tipoEfAct=typeof _hipEffRate==='function'?_hipEffRate(act.tipo,act.vinc):act.tipo;
  var rAct=tipoEfAct/100/12,nAct=act.plazo*12;
  var cuotaAct=rAct>0?act.importe*rAct*Math.pow(1+rAct,nAct)/(Math.pow(1+rAct,nAct)-1):act.importe/nAct;
  cuotaAct=Math.round(cuotaAct*100)/100;

  /* ── Sección 1: Situación actual ── */
  h+='<div class="ah-section">';
  h+='<div class="ah-section-title">Situaci\u00f3n actual'+(act.banco?' \u2014 '+escHtml(act.banco):'')+'</div>';
  h+='<div class="ah-cuota-hero"><div class="ah-cuota-val">'+fcPlain(cuotaAct)+'\u20ac</div>';
  h+='<div class="ah-cuota-sub">Cuota mensual \u00b7 '+tipoEfAct.toFixed(2)+'%'+(tipoEfAct!==act.tipo?' (nominal '+act.tipo.toFixed(2)+'%)':' fijo')+' \u00b7 '+act.plazo+' a\u00f1os</div></div>';

  /* Stats: saldo vivo, intereses, tiempo */
  var hoy=new Date();
  var todayStr=hoy.getFullYear()+'-'+String(hoy.getMonth()+1).padStart(2,'0')+'-01';
  var saldoVivo=typeof _computeBalanceAtDate==='function'?_computeBalanceAtDate(comp,todayStr):0;
  var intAnual=typeof _computeAnnualInterest==='function'?_computeAnnualInterest(comp,ECON_YEAR):0;
  var mPagados=0,mRestantes=0;
  if(act.fecha){
    var fp=act.fecha.split('-');
    mPagados=Math.max(0,(hoy.getFullYear()-parseInt(fp[0],10))*12+(hoy.getMonth()-(parseInt(fp[1],10)-1)));
    mRestantes=Math.max(0,nAct-mPagados);
  }
  h+='<div class="hip-stats">';
  if(saldoVivo>0){var pctA=Math.round((1-saldoVivo/act.importe)*100);h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-green)">'+_fmtMiles(saldoVivo)+'\u20ac</span><span class="hip-stat-lbl">Saldo vivo ('+pctA+'%)</span></div>';}
  if(intAnual>0)h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-orange)">'+fcPlain(intAnual)+'</span><span class="hip-stat-lbl">Intereses '+ECON_YEAR+'</span></div>';
  if(mPagados>0){var aP=Math.floor(mPagados/12),mR2=mPagados%12;h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--accent-bright)">'+(aP>0?aP+'a ':'')+(mR2>0?mR2+'m':'')+'</span><span class="hip-stat-lbl">Pagado</span></div>';}
  if(mRestantes>0){var aQ=Math.floor(mRestantes/12),mQ=mRestantes%12;h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--text-muted)">'+(aQ>0?aQ+'a ':'')+(mQ>0?mQ+'m':'')+'</span><span class="hip-stat-lbl">Restante</span></div>';}
  h+='</div>';

  /* Donut: capital amortizado vs pendiente */
  if(saldoVivo>0&&act.importe>0){
    var pctAmort=Math.round((1-saldoVivo/act.importe)*100);
    h+=_donutChart(pctAmort,'Amortizado','Pendiente');
  }

  /* Desglose cuota actual: capital vs intereses */
  if(saldoVivo>0){
    var intMes=Math.round(saldoVivo*rAct*100)/100;
    var capMes=Math.round((cuotaAct-intMes)*100)/100;
    var pctCap=Math.round(capMes/cuotaAct*100);
    h+='<div style="font-size:.68rem;color:var(--text-dim);margin-top:8px;font-weight:600">Desglose cuota actual</div>';
    h+='<div class="hip-bar-wrap" style="margin-top:4px"><div class="hip-bar"><div class="hip-bar-cap" style="width:'+pctCap+'%"></div><div class="hip-bar-int" style="width:'+(100-pctCap)+'%"></div></div>';
    h+='<div class="hip-bar-legend"><span class="hip-bar-leg-cap">Capital '+pctCap+'% \u00b7 '+fcPlain(capMes)+'</span><span class="hip-bar-leg-int">Intereses '+(100-pctCap)+'% \u00b7 '+fcPlain(intMes)+'</span></div></div>';
  }
  h+='</div>';

  /* ── Sección 2: Evolución del préstamo ── */
  h+='<div class="ah-section">';
  h+='<div class="ah-section-title">Evoluci\u00f3n del pr\u00e9stamo</div>';
  h+=_balanceEvolutionChart(comp);
  h+='</div>';

  /* ── Sección 3: Análisis de la subrogación ── */
  var _lastSub=subs.length>0?subs[subs.length-1]:null;
  if(_lastSub){
    h+=_renderSubrogacionAnalysis(comp,_lastSub);
  }

  /* ── Sección 4: Coste total de la hipoteca ── */
  h+='<div class="ah-section">';
  h+='<div class="ah-section-title">Coste total de la hipoteca</div>';
  var totalCuotas=Math.round(cuotaAct*nAct);
  var totalInt=totalCuotas-act.importe;
  var totalCambio=0;
  subs.forEach(function(s){totalCambio+=(s.comisionCancelacion||0)+(s.notaria||0)+(s.tasacion||0)+(s.registro||0);});
  var vincAnual=0;
  if(act.vinc){['segHogar','segSalud','segVida'].forEach(function(k){if(act.vinc[k]&&act.vinc[k].enabled)vincAnual+=act.vinc[k].costeAnual||0;});}
  var totalVinc=Math.round(vincAnual*act.plazo);
  h+='<div class="ah-total-row">'+_ahRow('Capital prestado',_fmtMiles(act.importe)+' \u20ac')+'</div>';
  h+='<div class="ah-total-row">'+_ahRow('Total intereses',_fmtMiles(totalInt)+' \u20ac','var(--c-orange)')+'</div>';
  if(totalCambio>0)h+='<div class="ah-total-row">'+_ahRow('Costes subrogaci\u00f3n',_fmtMiles(totalCambio)+' \u20ac','var(--c-orange)')+'</div>';
  if(totalVinc>0)h+='<div class="ah-total-row">'+_ahRow('Seguros vinculados (~'+act.plazo+'a)',_fmtMiles(totalVinc)+' \u20ac','var(--c-orange)')+'</div>';
  h+='<div class="ah-total-row highlight">'+_ahRow('TOTAL',_fmtMiles(totalCuotas+totalCambio+totalVinc)+' \u20ac')+'</div>';
  h+='</div>';

  return h;
}
function _ahRow(lbl,val,color){
  return '<span class="hip-ro-lbl">'+lbl+'</span><span class="hip-ro-val"'+(color?' style="color:'+color+'"':'')+'>'+val+'</span>';
}

/* ── Donut chart SVG ──────────────────────────────────────── */
function _donutChart(pct,labelA,labelB){
  var r=30,cx=40,cy=40,sw=8;
  var circ=2*Math.PI*r;
  var dashA=Math.round(circ*pct/100);
  var dashB=circ-dashA;
  var svg='<svg width="80" height="80" viewBox="0 0 80 80">';
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#2a2a3e" stroke-width="'+sw+'"/>';
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#34d399" stroke-width="'+sw+'" stroke-dasharray="'+dashA+' '+dashB+'" stroke-dashoffset="'+(circ/4)+'" stroke-linecap="round"/>';
  svg+='<text x="'+cx+'" y="'+(cy+3)+'" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text)">'+pct+'%</text>';
  svg+='</svg>';
  var h='<div class="ah-donut-wrap">'+svg;
  h+='<div class="ah-donut-legend"><span style="color:var(--c-green)">\u25CF '+labelA+': '+pct+'%</span><span style="color:var(--text-dim)">\u25CF '+labelB+': '+(100-pct)+'%</span></div></div>';
  return h;
}

/* ── Balance evolution chart ──────────────────────────────── */
function _balanceEvolutionChart(comp){
  if(!comp.fechaInicio)return '';
  var startParts=comp.fechaInicio.split('-');
  var startY=parseInt(startParts[0],10),startM=parseInt(startParts[1],10)-1;
  var tipoEf=typeof _hipEffRate==='function'?_hipEffRate(comp.tipoInteres,comp.vinculaciones):comp.tipoInteres;
  var r=tipoEf/100/12,nTotal=comp.plazoAnios*12;
  var cuota=r>0?comp.importePrestamo*r*Math.pow(1+r,nTotal)/(Math.pow(1+r,nTotal)-1):comp.importePrestamo/nTotal;
  var balance=comp.importePrestamo;
  var switches=typeof _buildMortgageSwitches==='function'?_buildMortgageSwitches(comp):[];
  var switchIdx=0;
  var years=Math.ceil(nTotal/12);
  var points=Math.min(years,40);
  var balances=[balance];
  var switchYears=[];
  switches.forEach(function(s){switchYears.push(Math.round(s.monthOffset/12*10)/10);});
  for(var y=1;y<=points;y++){
    for(var mi=0;mi<12;mi++){
      var m=(y-1)*12+mi;
      while(switchIdx<switches.length&&m>=switches[switchIdx].monthOffset){
        balance=switches[switchIdx].balance;r=switches[switchIdx].rate;cuota=switches[switchIdx].cuota;switchIdx++;
      }
      if(balance<=0)break;
      var interes=balance*r;
      var capital=cuota-interes;
      if(capital>balance)capital=balance;
      balance-=capital;
      if(balance<0.01){balance=0;break;}
    }
    balances.push(Math.round(balance));
  }
  var W=320,H=110,PB=18,PT=10,PL=45,PR=8;
  var W2=W-PL-PR,H2=H-PT;
  var maxV=comp.importePrestamo;
  function xPos(i){return Math.round(PL+(i/points)*W2);}
  function yPos(v){return Math.round(PT+H2-v/maxV*H2);}
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;margin-top:6px">';
  /* Grid */
  var step=50000;while(maxV/step>4)step*=2;while(maxV/step<1.5&&step>10000)step=Math.round(step/2);
  for(var gv=0;gv<=maxV;gv+=step){
    var gy=yPos(gv);
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl=gv>=1000?Math.round(gv/1000)+'k':'0';
    svg+='<text x="'+(PL-2)+'" y="'+(gy+3)+'" text-anchor="end" font-size="6" fill="#5a5a70">'+lbl+'</text>';
  }
  /* Area fill */
  var areaPath='M'+xPos(0)+','+yPos(0);
  for(var i=1;i<balances.length;i++)areaPath+=' L'+xPos(i)+','+yPos(balances[i]);
  areaPath+=' L'+xPos(balances.length-1)+','+yPos(0)+' Z';
  svg+='<path d="'+areaPath+'" fill="rgba(108,140,255,.12)"/>';
  /* Line */
  var linePts=balances.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
  svg+='<polyline points="'+linePts+'" fill="none" stroke="#6c8cff" stroke-width="2" stroke-linejoin="round"/>';
  /* Switch points */
  switchYears.forEach(function(sy){
    if(sy>0&&sy<=points){
      var sx=xPos(sy);
      svg+='<line x1="'+sx+'" y1="'+PT+'" x2="'+sx+'" y2="'+yPos(0)+'" stroke="#c084fc" stroke-width="1" stroke-dasharray="3,3"/>';
      svg+='<text x="'+sx+'" y="'+(PT-1)+'" text-anchor="middle" font-size="5" fill="#c084fc">Sub.</text>';
    }
  });
  /* X labels */
  for(var xi=0;xi<=points;xi+=Math.max(1,Math.round(points/6))){
    svg+='<text x="'+xPos(xi)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="6" fill="#5a5a70">'+xi+'a</text>';
  }
  svg+='</svg>';
  return '<div class="analisis-mortgage-chart">'+svg+'</div>';
}

function _renderSubrogacionAnalysis(comp,sub){
  if(!sub)sub=(comp.subrogaciones||[])[0]||comp.subrogacion;
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

  /* Insurance cost comparison */
  var segAnualOrig=0,segAnualNuevo=0;
  var vinc=comp.vinculaciones;
  if(vinc){
    var _sk=['segSalud','segVida','segHogar'];
    _sk.forEach(function(k){if(vinc[k]&&vinc[k].enabled)segAnualOrig+=vinc[k].costeAnual||0;});
  }
  var subVinc=sub.vinculaciones;
  if(subVinc){
    var _sk2=['segSalud','segVida','segHogar'];
    _sk2.forEach(function(k){if(subVinc[k]&&subVinc[k].enabled)segAnualNuevo+=subVinc[k].costeAnual||0;});
  }
  var diffSegAnual=Math.round((segAnualOrig-segAnualNuevo)*100)/100;
  if(segAnualOrig>0||segAnualNuevo>0){
    h+='<div style="padding:8px 0;font-size:.72rem;color:var(--text-muted);margin-top:4px">';
    h+='<div>Seguros originales: <b style="color:var(--c-orange)">'+fcPlain(segAnualOrig)+'</b>/a\u00f1o</div>';
    h+='<div>Seguros nuevos: <b style="color:var(--c-orange)">'+fcPlain(segAnualNuevo)+'</b>/a\u00f1o</div>';
    h+='<div>Diferencia seguros: <b style="color:'+(diffSegAnual>=0?'var(--c-green)':'var(--c-red)')+'">'+((diffSegAnual>=0?'+':'')+fcPlain(diffSegAnual))+'</b>/a\u00f1o</div>';
    /* Recalculate total savings including insurance */
    var maxM2=Math.max(mesesRestantesOrig,mesesNuevo);
    var totalAhorroConSeg=Math.round(((cuotaOrig+segAnualOrig/12)*maxM2-(cuotaNueva+segAnualNuevo/12)*maxM2-costesCambio)*100)/100;
    h+='<div style="margin-top:4px;font-size:.78rem">Ahorro total (cuotas + seguros): <b style="color:'+(totalAhorroConSeg>=0?'var(--c-green)':'var(--c-red)')+'">'+fcPlain(Math.round(totalAhorroConSeg))+'</b></div>';
    h+='</div>';
  }

  /* Diff chart: evolution A vs B */
  h+='<div style="margin-top:10px;font-size:.75rem;color:var(--text-muted);font-weight:600">Evoluci\u00f3n: quedarse vs subrogar</div>';
  h+='<div style="font-size:.65rem;color:var(--text-dim);margin-bottom:2px">Incluye cuotas + seguros vinculados. Zona verde = el cambio compensa.</div>';
  h+=_mortgageDiffChart(cuotaOrig,cuotaNueva,segAnualOrig,segAnualNuevo,mesesTranscurridos,maxMeses,costesCambio);

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

/* ── Diff chart: evolution of A-B including insurance ────── */
function _mortgageDiffChart(cuotaA,cuotaB,segAnualA,segAnualB,mesesPre,mesesPost,switchCost){
  /* X-axis starts at subrogation moment (year 0 = switch), NOT loan start */
  var years=Math.ceil(mesesPost/12);
  var points=Math.min(years,40);
  var diffs=[];var cum=-switchCost; /* Start negative (switch cost) */
  diffs.push(Math.round(cum));
  var savingsPerMonth=(cuotaA+segAnualA/12)-(cuotaB+segAnualB/12);
  var breakEvenYear=-1;
  for(var y=1;y<=points;y++){
    cum+=savingsPerMonth*12;
    diffs.push(Math.round(cum));
    if(breakEvenYear<0&&cum>=0)breakEvenYear=y;
  }
  var W=320,H=130,PB=18,PT=16,PL=42,PR=8;
  var W2=W-PL-PR,H2=H-PT;
  var minV=diffs[0],maxV=diffs[0];
  diffs.forEach(function(v){if(v<minV)minV=v;if(v>maxV)maxV=v;});
  var range=Math.max(Math.abs(minV),Math.abs(maxV))||1;
  minV=Math.min(minV,-range*0.1);maxV=Math.max(maxV,range*0.1);
  var spanV=maxV-minV||1;
  function xPos(i){return Math.round(PL+(i/points)*W2);}
  function yPos(v){return Math.round(PT+H2-(v-minV)/spanV*H2);}
  var y0=yPos(0);
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;margin-top:10px">';
  /* Zero line */
  svg+='<line x1="'+PL+'" y1="'+y0+'" x2="'+(W-PR)+'" y2="'+y0+'" stroke="#5a5a70" stroke-width="1" stroke-dasharray="4,3"/>';
  /* Grid */
  var step=5000;while(spanV/step>6)step*=2;while(spanV/step<2&&step>1000)step=Math.round(step/2);
  for(var gv=Math.ceil(minV/step)*step;gv<=maxV;gv+=step){
    if(gv===0)continue;
    var gy=yPos(gv);
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl=Math.abs(gv)>=1000?(gv/1000).toFixed(0)+'k':gv;
    svg+='<text x="'+(PL-2)+'" y="'+(gy+3)+'" text-anchor="end" font-size="6" fill="#5a5a70">'+lbl+'</text>';
  }
  /* Fill areas: green above 0, red below 0 */
  var posPath='',negPath='';
  for(var i=0;i<=points;i++){
    var x=xPos(i),yv=yPos(diffs[i]);
    if(diffs[i]>=0){
      if(!posPath)posPath='M'+x+','+y0;
      posPath+=' L'+x+','+yv;
    } else {
      if(posPath){posPath+=' L'+x+','+y0+' Z';svg+='<path d="'+posPath+'" fill="rgba(52,211,153,.15)"/>';posPath='';}
      if(!negPath)negPath='M'+x+','+y0;
      negPath+=' L'+x+','+yv;
    }
    if(diffs[i]>=0&&negPath){negPath+=' L'+x+','+y0+' Z';svg+='<path d="'+negPath+'" fill="rgba(239,68,68,.15)"/>';negPath='';}
  }
  if(posPath){posPath+=' L'+xPos(points)+','+y0+' Z';svg+='<path d="'+posPath+'" fill="rgba(52,211,153,.15)"/>';}
  if(negPath){negPath+=' L'+xPos(points)+','+y0+' Z';svg+='<path d="'+negPath+'" fill="rgba(239,68,68,.15)"/>';}
  /* Line */
  var pts=diffs.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
  svg+='<polyline points="'+pts+'" fill="none" stroke="#6c8cff" stroke-width="2" stroke-linejoin="round"/>';
  /* Break-even marker */
  if(breakEvenYear>0&&breakEvenYear<=points){
    var bx=xPos(breakEvenYear);
    svg+='<line x1="'+bx+'" y1="'+PT+'" x2="'+bx+'" y2="'+yPos(0)+'" stroke="#34d399" stroke-width="1" stroke-dasharray="3,2"/>';
    svg+='<text x="'+bx+'" y="'+(PT-1)+'" text-anchor="middle" font-size="5" fill="#34d399">Break-even '+breakEvenYear+'a</text>';
  }
  /* X labels (relative to switch: "0a" = moment of change) */
  for(var xi=0;xi<=points;xi+=Math.max(1,Math.round(points/6))){
    svg+='<text x="'+xPos(xi)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="6" fill="#5a5a70">'+xi+'a</text>';
  }
  /* Legend */
  svg+='<text x="'+PL+'" y="7" font-size="6" fill="#5a5a70">Desde el cambio: \u25B2verde=compensa \u25BCrojo=no</text>';
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
    /* Single toggle for desgravables inclusion */
    var discountChk=document.getElementById('analisisDesgravDiscount');
    if(discountChk)discountChk.addEventListener('change',function(){ANALISIS_DESGRAV_DISCOUNT=this.checked;reRenderEcon();});
  }
}
/* ── Estudio Cambio (sub-tabs) ─────────────────────────────── */
function renderEconEstudio(){
  var h='<div class="est-nav">';
  /* Group 1: Autónomo */
  h+='<div class="est-group">';
  h+='<div class="est-group-label">Aut\u00f3nomo</div>';
  h+='<button class="est-btn'+(ECON_ESTUDIO_SUB==='comparador'?' active':'')+'" id="ecSubComp">Comparar Escenarios</button>';
  h+='<button class="est-btn'+(ECON_ESTUDIO_SUB==='simulador'?' active':'')+'" id="ecSubSim">Calcular Tarifa</button>';
  h+='</div>';
  /* Group 2: Casa */
  h+='<div class="est-group est-group-casa">';
  h+='<div class="est-group-label">Casa</div>';
  h+='<button class="est-btn est-casa'+(ECON_ESTUDIO_SUB==='hipoteca'?' active':'')+'" id="ecSubHip">Comparar Hipotecas</button>';
  h+='<button class="est-btn est-casa'+(ECON_ESTUDIO_SUB==='gas'?' active':'')+'" id="ecSubGas">Comparar Gas</button>';
  h+='<button class="est-btn est-casa'+(ECON_ESTUDIO_SUB==='elect'?' active':'')+'" id="ecSubElect">Comparar Electricidad</button>';
  h+='</div>';
  h+='</div>';
  if(ECON_ESTUDIO_SUB==='comparador'){h+=typeof renderEconComp==='function'?renderEconComp():'';}
  else if(ECON_ESTUDIO_SUB==='simulador'){h+=typeof renderEconSim==='function'?renderEconSim():'';}
  else if(ECON_ESTUDIO_SUB==='hipoteca'){h+=_renderEstudioHipotecaComp();}
  else if(ECON_ESTUDIO_SUB==='gas'){h+=_renderEstudioGasComp();}
  else if(ECON_ESTUDIO_SUB==='elect'){h+=_renderEstudioElectComp();}
  return h;
}

/* ── Estudio Cambio: Comparar Hipotecas ──────────────────── */
var ESTUDIO_HIP_ALT={importe:0,tipo:0,plazo:0,costeCambio:0,vincCoste:0,vincReduc:0};
var ESTUDIO_HIP_CALC=false;

function _renderEstudioHipotecaComp(){
  var h='';
  var comp=DESPACHO&&DESPACHO.compra?DESPACHO.compra:null;
  if(!comp||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios){
    h+='<div class="sy-section" style="text-align:center;padding:30px 20px;color:var(--text-dim)">';
    h+='<div style="font-size:.75rem">Configura los datos de hipoteca en <b>\u2699 Configuraci\u00f3n Fiscal \u2192 Hipoteca</b> para comparar.</div>';
    h+='</div>';
    return h;
  }
  /* Current mortgage summary */
  var act=typeof _getActiveMortgage==='function'?_getActiveMortgage(comp):{importe:comp.importePrestamo,tipo:comp.tipoInteres,plazo:comp.plazoAnios,vinc:comp.vinculaciones};
  var tipoEfAct=typeof _hipEffRate==='function'?_hipEffRate(act.tipo,act.vinc):act.tipo;
  var rAct=tipoEfAct/100/12,nAct=act.plazo*12;
  var cuotaAct=rAct>0?act.importe*rAct*Math.pow(1+rAct,nAct)/(Math.pow(1+rAct,nAct)-1):act.importe/nAct;

  /* Include insurance costs from vinculaciones */
  var vincAnual=0;
  if(act.vinc){['segHogar','segSalud','segVida'].forEach(function(k){if(act.vinc[k]&&act.vinc[k].enabled)vincAnual+=act.vinc[k].costeAnual||0;});}
  var cuotaActConSeg=Math.round((cuotaAct+vincAnual/12)*100)/100;

  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Tu hipoteca actual (tipo bonificado + seguros)</div>';
  h+='<div class="analisis-mortgage-current">';
  h+='<div style="font-size:.72rem;color:var(--text-dim)">'+escHtml(act.banco||'')+' \u00b7 '+tipoEfAct.toFixed(2)+'% (bonificado) \u00b7 '+act.plazo+'a \u00b7 '+_fmtMiles(act.importe)+'\u20ac</div>';
  h+='<div style="font-family:var(--mono);font-size:1rem;font-weight:700;margin-top:4px">'+fcPlain(Math.round(cuotaAct*100)/100)+'\u20ac<span style="font-size:.68rem;color:var(--text-dim)">/mes</span>';
  if(vincAnual>0)h+='<span style="font-size:.62rem;color:var(--c-orange);margin-left:6px">+ '+fcPlain(Math.round(vincAnual/12*100)/100)+' seguros = '+fcPlain(cuotaActConSeg)+'/mes</span>';
  h+='</div>';
  h+='</div></div>';

  /* Alternative mortgage inputs */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Hipoteca alternativa</div>';
  if(!ESTUDIO_HIP_ALT.importe)ESTUDIO_HIP_ALT.importe=act.importe;
  if(!ESTUDIO_HIP_ALT.plazo)ESTUDIO_HIP_ALT.plazo=act.plazo;
  h+='<div class="analisis-mortgage-alt">';
  h+='<div class="analisis-mortgage-inputs" style="flex-wrap:wrap">';
  h+='<div class="analisis-input-group"><label>Capital \u20ac</label><input class="analisis-input" id="estHipImporte" type="number" min="0" step="1000" value="'+ESTUDIO_HIP_ALT.importe+'"></div>';
  h+='<div class="analisis-input-group"><label>Tipo inter\u00e9s %</label><input class="analisis-input" id="estHipTipo" type="number" min="0" step="0.1" value="'+ESTUDIO_HIP_ALT.tipo+'"></div>';
  h+='<div class="analisis-input-group"><label>Plazo (a\u00f1os)</label><input class="analisis-input" id="estHipPlazo" type="number" min="1" step="1" value="'+ESTUDIO_HIP_ALT.plazo+'"></div>';
  h+='<div class="analisis-input-group"><label>Coste cambio \u20ac</label><input class="analisis-input" id="estHipCoste" type="number" min="0" step="100" value="'+ESTUDIO_HIP_ALT.costeCambio+'"></div>';
  h+='<div class="analisis-input-group"><label>Vinc. coste/a\u00f1o \u20ac</label><input class="analisis-input" id="estHipVincCoste" type="number" min="0" step="50" value="'+ESTUDIO_HIP_ALT.vincCoste+'"></div>';
  h+='<div class="analisis-input-group"><label>Vinc. reducci\u00f3n %</label><input class="analisis-input" id="estHipVincReduc" type="number" min="0" step="0.05" value="'+ESTUDIO_HIP_ALT.vincReduc+'"></div>';
  h+='</div>';
  h+='<button class="econ-calc-btn" id="estHipCalc" style="margin-top:6px">Comparar</button>';
  h+='</div>';

  if(ESTUDIO_HIP_CALC&&ESTUDIO_HIP_ALT.tipo>0){
    var tipoEfAlt=Math.max(0,ESTUDIO_HIP_ALT.tipo-ESTUDIO_HIP_ALT.vincReduc);
    var rAlt=tipoEfAlt/100/12,nAlt=ESTUDIO_HIP_ALT.plazo*12;
    var cuotaAlt=rAlt>0?ESTUDIO_HIP_ALT.importe*rAlt*Math.pow(1+rAlt,nAlt)/(Math.pow(1+rAlt,nAlt)-1):ESTUDIO_HIP_ALT.importe/nAlt;
    var totalAct2=cuotaAct*nAct;
    var totalAlt=cuotaAlt*nAlt+ESTUDIO_HIP_ALT.costeCambio;
    var ahorro=Math.round(totalAct2-totalAlt);
    var ahorroMes=Math.round((cuotaAct-cuotaAlt)*100)/100;

    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">Resultado</div>';
    h+='<div class="ah-vs">';
    h+='<div class="ah-vs-card"><div class="ah-vs-card-title">Actual ('+tipoEfAct.toFixed(2)+'%)</div><div class="ah-vs-card-val">'+fcPlain(Math.round(cuotaAct*100)/100)+'<span style="font-size:.6rem;color:var(--text-dim)">/mes</span></div></div>';
    h+='<div class="ah-vs-card"><div class="ah-vs-card-title">Alternativa ('+tipoEfAlt.toFixed(2)+'%)</div><div class="ah-vs-card-val">'+fcPlain(Math.round(cuotaAlt*100)/100)+'<span style="font-size:.6rem;color:var(--text-dim)">/mes</span></div></div>';
    h+='</div>';
    h+='<div class="analisis-mortgage-ahorro '+(ahorro>=0?'pos':'neg')+'" style="margin-top:8px">';
    h+=(ahorro>=0?'Ahorras: <b>'+fcPlain(ahorro)+'\u20ac</b>':'Pagas m\u00e1s: <b>'+fcPlain(-ahorro)+'\u20ac</b>');
    h+=' ('+fcPlain(Math.abs(ahorroMes))+'/mes)';
    h+='</div>';
    if(ESTUDIO_HIP_ALT.costeCambio>0&&ahorroMes>0){
      var be=Math.ceil(ESTUDIO_HIP_ALT.costeCambio/ahorroMes);
      h+='<div style="font-size:.72rem;color:var(--text-dim);margin-top:4px">Break-even en <b>'+be+' meses</b> ('+Math.round(be/12*10)/10+' a\u00f1os)</div>';
    }
    h+=_mortgageComparisonChart(cuotaAct,cuotaAlt,Math.max(nAct,nAlt),ESTUDIO_HIP_ALT.costeCambio,tipoEfAct,tipoEfAlt);
    h+='</div>';
  }
  h+='</div>';
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
  document.getElementById('ecTabDias').addEventListener('click',function(){ECON_VIEW='dias';reRenderEcon();});
  document.getElementById('ecTabGastos').addEventListener('click',function(){ECON_VIEW='gastos';reRenderEcon();});
  document.getElementById('ecTabAnalisis').addEventListener('click',function(){ECON_VIEW='analisis';reRenderEcon();});
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
  else if(ECON_VIEW==='dias')bindSummaryWorkBodyEvents(reRenderEcon);
  else if(ECON_VIEW==='gastos'&&typeof bindEconGastosEvents==='function')bindEconGastosEvents();
  else if(ECON_VIEW==='analisis')bindEconAnalisisEvents();
  setTimeout(function(){
    var qs=document.querySelector('.econ-quarter-section');
    var ms=document.querySelector('.econ-month-section');
    if(qs&&ms)ms.style.maxWidth=qs.offsetWidth+'px';
  },60);
}

function bindEconEstudioEvents(){
  var _reRender=document.getElementById('estudioOverlay')&&document.getElementById('estudioOverlay').classList.contains('open')?reRenderEstudio:reRenderEcon;
  var _estTabs={ecSubComp:'comparador',ecSubSim:'simulador',ecSubHip:'hipoteca',ecSubGas:'gas',ecSubElect:'elect'};
  Object.keys(_estTabs).forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('click',function(){ECON_ESTUDIO_SUB=_estTabs[id];_reRender();});
  });
  if(ECON_ESTUDIO_SUB==='comparador'&&typeof bindEconCompEvents==='function')bindEconCompEvents();
  else if(ECON_ESTUDIO_SUB==='simulador'&&typeof bindEconSimEvents==='function')bindEconSimEvents();
  else if(ECON_ESTUDIO_SUB==='hipoteca')_bindEstudioHipoteca();
  else if(ECON_ESTUDIO_SUB==='gas')_bindEstudioGas();
  else if(ECON_ESTUDIO_SUB==='elect')_bindEstudioElect();
}
function _estudioReRender(){
  var ov=document.getElementById('estudioOverlay');
  if(ov&&ov.style.display==='flex')reRenderEstudio();else reRenderEcon();
}
function _bindEstudioHipoteca(){
  var calcBtn=document.getElementById('estHipCalc');
  if(calcBtn)calcBtn.addEventListener('click',function(){
    ESTUDIO_HIP_ALT.importe=parseFloat(document.getElementById('estHipImporte').value)||0;
    ESTUDIO_HIP_ALT.tipo=parseFloat(document.getElementById('estHipTipo').value)||0;
    ESTUDIO_HIP_ALT.plazo=parseFloat(document.getElementById('estHipPlazo').value)||0;
    ESTUDIO_HIP_ALT.costeCambio=parseFloat(document.getElementById('estHipCoste').value)||0;
    ESTUDIO_HIP_ALT.vincCoste=parseFloat(document.getElementById('estHipVincCoste').value)||0;
    ESTUDIO_HIP_ALT.vincReduc=parseFloat(document.getElementById('estHipVincReduc').value)||0;
    ESTUDIO_HIP_CALC=true;
    _estudioReRender();
  });
}

/* ── Estudio: Comparar Gas ────────────────────────────────── */
var ESTUDIO_GAS={consumoKwh:0,dias:30};
function _renderEstudioGasComp(){
  if(typeof loadDespacho==='function')loadDespacho();
  var g=DESPACHO&&DESPACHO.gas?DESPACHO.gas:{modo:'consumo',precioKwh:0,cuotaFija:0,terminoFijo:0};
  var comps=DESPACHO&&DESPACHO.gasComparaciones?DESPACHO.gasComparaciones:[];
  var h='';
  /* Current tariff */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">\uD83D\uDD25 Tu tarifa actual</div>';
  if(g.modo==='fijo')h+='<div style="font-size:.72rem;color:var(--text-dim)">Cuota fija: <b>'+fcPlain(g.cuotaFija)+'\u20ac/mes</b> + T\u00e9rmino fijo: '+fcPlain(g.terminoFijo)+'\u20ac/mes</div>';
  else h+='<div style="font-size:.72rem;color:var(--text-dim)">Precio: <b>'+(g.precioKwh||0).toFixed(4)+' \u20ac/kWh</b> + T\u00e9rmino fijo: '+fcPlain(g.terminoFijo)+'\u20ac/mes</div>';
  h+='</div>';
  /* Consumption input */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Consumo a comparar</div>';
  h+='<div class="analisis-mortgage-inputs">';
  h+='<div class="analisis-input-group"><label>Consumo (kWh)</label><input class="analisis-input" id="estGasKwh" type="number" min="0" step="10" value="'+ESTUDIO_GAS.consumoKwh+'"></div>';
  h+='<div class="analisis-input-group"><label>D\u00edas</label><input class="analisis-input" id="estGasDias" type="number" min="1" step="1" value="'+ESTUDIO_GAS.dias+'"></div>';
  h+='</div></div>';
  /* Comparisons table */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Tarifas a comparar (max 5)</div>';
  h+=_renderSupplyCompTable(comps,g,ESTUDIO_GAS,'gas');
  if(comps.length<5)h+='<button class="hip-add-sub-btn" id="estGasAdd">+ A\u00f1adir tarifa</button>';
  h+='</div>';
  return h;
}

/* ── Estudio: Comparar Electricidad ──────────────────────── */
var ESTUDIO_ELECT={consumoKwh:0,dias:30};
function _renderEstudioElectComp(){
  if(typeof loadDespacho==='function')loadDespacho();
  var e=DESPACHO&&DESPACHO.elect?DESPACHO.elect:{precioKwh:0,terminoFijo:0,potenciaTotal:3.3};
  var comps=DESPACHO&&DESPACHO.electComparaciones?DESPACHO.electComparaciones:[];
  var h='';
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">\u26A1 Tu tarifa actual</div>';
  var potTxt,potPrecioTxt;
  if(e.modoPotencia==='doble'){
    potTxt='P1:'+e.potenciaP1+'kW + P2:'+e.potenciaP2+'kW';
    potPrecioTxt='P1:'+(e.precioPotP1||0).toFixed(6)+' + P2:'+(e.precioPotP2||0).toFixed(6)+' = '+((e.precioPotP1||0)+(e.precioPotP2||0)).toFixed(6)+' \u20ac/kW/d\u00eda';
  } else {
    potTxt=e.potenciaTotal+' kW';
    potPrecioTxt=(e.precioPotP1||0).toFixed(6)+' \u20ac/kW/d\u00eda';
  }
  h+='<div style="font-size:.72rem;color:var(--text-dim)">Potencia: <b>'+potTxt+'</b> \u00b7 Precio pot.: <b>'+potPrecioTxt+'</b></div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim)">Energ\u00eda: <b>'+(e.precioKwh||0).toFixed(4)+' \u20ac/kWh</b>'+(e.terminoFijo?' + T. fijo: '+fcPlain(e.terminoFijo)+'\u20ac/mes':'')+'</div>';
  h+='</div>';
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Consumo a comparar</div>';
  h+='<div class="analisis-mortgage-inputs">';
  h+='<div class="analisis-input-group"><label>Consumo (kWh)</label><input class="analisis-input" id="estElectKwh" type="number" min="0" step="10" value="'+ESTUDIO_ELECT.consumoKwh+'"></div>';
  h+='<div class="analisis-input-group"><label>D\u00edas</label><input class="analisis-input" id="estElectDias" type="number" min="1" step="1" value="'+ESTUDIO_ELECT.dias+'"></div>';
  h+='</div></div>';
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Tarifas a comparar (max 5)</div>';
  h+=_renderSupplyCompTable(comps,e,ESTUDIO_ELECT,'elect');
  if(comps.length<5)h+='<button class="hip-add-sub-btn" id="estElectAdd">+ A\u00f1adir tarifa</button>';
  h+='</div>';
  return h;
}

/* Shared supply comparison table */
function _renderSupplyCompTable(comps,current,consumo,tipo){
  var kwh=consumo.consumoKwh||0,dias=consumo.dias||30;
  /* Current cost */
  var costActual=0;
  if(tipo==='gas'){
    if(current.modo==='fijo')costActual=current.cuotaFija*(dias/30);
    else costActual=kwh*(current.precioKwh||0);
    costActual+=(current.terminoFijo||0)*(dias/30);
  } else {
    /* Electricidad: energía + potencia por kW/día + término fijo */
    var potCostAct=0;
    if(current.modoPotencia==='doble'){
      potCostAct=((current.precioPotP1||0)*(current.potenciaP1||0)+(current.precioPotP2||0)*(current.potenciaP2||0))*dias;
    } else {
      potCostAct=(current.precioPotP1||0)*(current.potenciaTotal||0)*dias;
    }
    costActual=kwh*(current.precioKwh||0)+potCostAct+(current.terminoFijo||0)*(dias/30);
  }
  var h='<div class="mg-budget-table" style="margin-top:6px">';
  h+='<div class="mg-budget-hdr" style="grid-template-columns:1fr 70px 60px 60px"><span>Tarifa</span><span>Coste</span><span>/d\u00eda</span><span>Dif.</span></div>';
  /* Current row */
  h+='<div class="mg-budget-row" style="grid-template-columns:1fr 70px 60px 60px;background:var(--surface2)">';
  h+='<span class="mg-budget-lbl"><span class="mg-cat-dot" style="background:var(--c-green)"></span>Actual</span>';
  h+='<span class="mg-budget-val">'+fcPlain(Math.round(costActual*100)/100)+'</span>';
  h+='<span class="mg-budget-val">'+fcPlain(Math.round(costActual/dias*100)/100)+'</span>';
  h+='<span class="mg-budget-val">\u2014</span></div>';
  /* Comparison rows */
  comps.forEach(function(c,i){
    var costAlt=0;
    if(tipo==='gas'){
      if(c.modo==='fijo')costAlt=(c.cuotaFija||0)*(dias/30);
      else costAlt=kwh*(c.precioKwh||0);
      costAlt+=(c.terminoFijo||0)*(dias/30);
    } else {
      /* Electricidad: energía + potencia por kW/día + término fijo */
      var potKw=current.potenciaTotal||0;
      costAlt=kwh*(c.precioKwh||0)+(c.precioPot||0)*potKw*dias+(c.terminoFijo||0)*(dias/30);
    }
    var diff=Math.round((costAlt-costActual)*100)/100;
    h+='<div class="mg-budget-row" style="grid-template-columns:1fr 70px 60px 60px">';
    h+='<span class="mg-budget-lbl"><input class="analisis-input est-comp-name" data-tipo="'+tipo+'" data-idx="'+i+'" type="text" value="'+escHtml(c.nombre||'')+'" placeholder="Tarifa '+(i+1)+'" style="font-size:.68rem;padding:2px 4px;width:100%"></span>';
    h+='<span class="mg-budget-val">'+fcPlain(Math.round(costAlt*100)/100)+'</span>';
    h+='<span class="mg-budget-val">'+fcPlain(Math.round(costAlt/dias*100)/100)+'</span>';
    h+='<span class="mg-budget-val" style="color:'+(diff<=0?'var(--c-green)':'var(--c-red)')+'">'+(diff<=0?'':'+')+ fcPlain(diff)+'</span></div>';
    /* Editable fields for this comparison */
    if(tipo==='elect'){
      h+='<div class="mg-budget-row" style="grid-template-columns:1fr 1fr 1fr 30px;border-top:none;padding:2px 8px">';
      h+='<span style="font-size:.62rem;color:var(--text-dim)"><input class="analisis-input est-comp-precio" data-tipo="'+tipo+'" data-idx="'+i+'" type="number" min="0" step="0.0001" value="'+(c.precioKwh||0)+'" style="font-size:.66rem;padding:2px 4px;width:55px"> \u20ac/kWh</span>';
      h+='<span style="font-size:.62rem;color:var(--text-dim)"><input class="analisis-input est-comp-pot" data-tipo="'+tipo+'" data-idx="'+i+'" type="number" min="0" step="0.000001" value="'+(c.precioPot||0)+'" style="font-size:.66rem;padding:2px 4px;width:55px"> \u20ac/kW/d</span>';
      h+='<span style="font-size:.62rem;color:var(--text-dim)"><input class="analisis-input est-comp-tfijo" data-tipo="'+tipo+'" data-idx="'+i+'" type="number" min="0" step="1" value="'+(c.terminoFijo||0)+'" style="font-size:.66rem;padding:2px 4px;width:45px"> \u20ac/m</span>';
      h+='<button class="est-comp-del" data-tipo="'+tipo+'" data-idx="'+i+'" style="background:none;border:none;color:var(--c-red);font-size:.78rem;cursor:pointer">\u2715</button></div>';
    } else {
      h+='<div class="mg-budget-row" style="grid-template-columns:1fr 1fr 30px;border-top:none;padding:2px 8px">';
      h+='<span style="font-size:.62rem;color:var(--text-dim)"><input class="analisis-input est-comp-precio" data-tipo="'+tipo+'" data-idx="'+i+'" type="number" min="0" step="0.0001" value="'+(c.precioKwh||0)+'" style="font-size:.66rem;padding:2px 4px;width:70px"> \u20ac/kWh</span>';
      h+='<span style="font-size:.62rem;color:var(--text-dim)"><input class="analisis-input est-comp-tfijo" data-tipo="'+tipo+'" data-idx="'+i+'" type="number" min="0" step="1" value="'+(c.terminoFijo||0)+'" style="font-size:.66rem;padding:2px 4px;width:55px"> \u20ac/mes</span>';
      h+='<button class="est-comp-del" data-tipo="'+tipo+'" data-idx="'+i+'" style="background:none;border:none;color:var(--c-red);font-size:.78rem;cursor:pointer">\u2715</button></div>';
    }
  });
  h+='</div>';
  return h;
}

function _bindEstudioGas(){
  var kwhEl=document.getElementById('estGasKwh');
  var diasEl=document.getElementById('estGasDias');
  if(kwhEl)kwhEl.addEventListener('change',function(){ESTUDIO_GAS.consumoKwh=parseFloat(this.value)||0;_estudioReRender();});
  if(diasEl)diasEl.addEventListener('change',function(){ESTUDIO_GAS.dias=parseInt(this.value)||30;_estudioReRender();});
  var addBtn=document.getElementById('estGasAdd');
  if(addBtn)addBtn.addEventListener('click',function(){
    if(!DESPACHO.gasComparaciones)DESPACHO.gasComparaciones=[];
    if(DESPACHO.gasComparaciones.length>=5)return;
    DESPACHO.gasComparaciones.push({nombre:'',precioKwh:0,terminoFijo:0,modo:'consumo',cuotaFija:0});
    saveDespacho();_estudioReRender();
  });
  _bindCompInputs('gas','gasComparaciones');
}
function _bindEstudioElect(){
  var kwhEl=document.getElementById('estElectKwh');
  var diasEl=document.getElementById('estElectDias');
  if(kwhEl)kwhEl.addEventListener('change',function(){ESTUDIO_ELECT.consumoKwh=parseFloat(this.value)||0;_estudioReRender();});
  if(diasEl)diasEl.addEventListener('change',function(){ESTUDIO_ELECT.dias=parseInt(this.value)||30;_estudioReRender();});
  var addBtn=document.getElementById('estElectAdd');
  if(addBtn)addBtn.addEventListener('click',function(){
    if(!DESPACHO.electComparaciones)DESPACHO.electComparaciones=[];
    if(DESPACHO.electComparaciones.length>=5)return;
    DESPACHO.electComparaciones.push({nombre:'',precioKwh:0,precioPot:0,terminoFijo:0});
    saveDespacho();_estudioReRender();
  });
  _bindCompInputs('elect','electComparaciones');
}
function _bindCompInputs(tipo,despKey){
  document.querySelectorAll('.est-comp-name[data-tipo="'+tipo+'"]').forEach(function(el){
    el.addEventListener('change',function(){DESPACHO[despKey][parseInt(el.dataset.idx)].nombre=el.value;saveDespacho();});
  });
  document.querySelectorAll('.est-comp-precio[data-tipo="'+tipo+'"]').forEach(function(el){
    el.addEventListener('change',function(){DESPACHO[despKey][parseInt(el.dataset.idx)].precioKwh=parseFloat(el.value)||0;saveDespacho();_estudioReRender();});
  });
  document.querySelectorAll('.est-comp-pot[data-tipo="'+tipo+'"]').forEach(function(el){
    el.addEventListener('change',function(){DESPACHO[despKey][parseInt(el.dataset.idx)].precioPot=parseFloat(el.value)||0;saveDespacho();_estudioReRender();});
  });
  document.querySelectorAll('.est-comp-tfijo[data-tipo="'+tipo+'"]').forEach(function(el){
    el.addEventListener('change',function(){DESPACHO[despKey][parseInt(el.dataset.idx)].terminoFijo=parseFloat(el.value)||0;saveDespacho();_estudioReRender();});
  });
  document.querySelectorAll('.est-comp-del[data-tipo="'+tipo+'"]').forEach(function(btn){
    btn.addEventListener('click',function(){DESPACHO[despKey].splice(parseInt(btn.dataset.idx),1);saveDespacho();_estudioReRender();});
  });
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

/* ============================================================
   ESTUDIO CAMBIO — Ventana independiente
   ============================================================ */
function renderEstudioContent(){
  ECON_YEAR=ESTUDIO_YEAR; // sync for sub-functions that use ECON_YEAR
  if(typeof loadEconYear==='function')loadEconYear(ECON_YEAR);
  var h=renderNavBar('estudio');
  h+='<div class="sy-header with-tabs">';
  h+='<button class="sy-back" id="estBack">&#8592;</button>';
  h+='<div class="sy-year-nav"><button class="sy-nav" id="estPrev">&#9664;</button><div class="sy-year">'+ESTUDIO_YEAR+'</div><button class="sy-nav" id="estNext">&#9654;</button></div>';
  h+='<div class="econ-hdr-note" style="font-size:.55rem;white-space:nowrap">Seg\u00fan horas y d\u00edas<br>trabajados del a\u00f1o</div>';
  h+='</div>';
  h+='<div class="sy-body">';
  h+=renderEconEstudio();
  h+='</div>';
  return h;
}
function openEstudio(){
  NAV_BACK=null;
  ESTUDIO_YEAR=CY;
  if(typeof loadDespacho==='function')loadDespacho();
  if(typeof loadEconComp==='function')loadEconComp();
  var ov=document.getElementById('estudioOverlay');
  document.getElementById('estudioContent').innerHTML=renderEstudioContent();
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindEstudioEvents();});});
}
function closeEstudio(){
  var ov=document.getElementById('estudioOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}
function reRenderEstudio(){
  var body=document.querySelector('#estudioOverlay .sy-body');
  var scrollTop=body?body.scrollTop:0;
  document.getElementById('estudioContent').innerHTML=renderEstudioContent();
  bindEstudioEvents();
  if(body)body.scrollTop=scrollTop;
}
function bindEstudioEvents(){
  document.getElementById('estBack').addEventListener('click',function(){
    if(NAV_BACK){var fn=NAV_BACK;NAV_BACK=null;fn();}else{closeEstudio();}
  });
  bindNavBar('estudio',closeEstudio);
  document.getElementById('estPrev').addEventListener('click',function(){ESTUDIO_YEAR--;reRenderEstudio();});
  document.getElementById('estNext').addEventListener('click',function(){ESTUDIO_YEAR++;reRenderEstudio();});
  bindEconEstudioEvents();
}

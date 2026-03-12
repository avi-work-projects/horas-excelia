/* ============================================================
   ECONOMICS — Core + Tab 1: Resumen
   ============================================================ */

var ECON_YEAR=new Date().getFullYear();
var ECON_VIEW='resumen';    // 'resumen' | 'comparador' | 'simulador'
var ECON_RATE_MODE='daily'; // campo editado manualmente: 'daily' | 'hourly'
var ECON_8H=false;          // mostrar columna 8h en stats
var ECON_IRPF_DECL=false;   // mostrar sección declaración IRPF

/* ── Formato de moneda ───────────────────────────────────────── */
function fc(n){
  var parts=n.toFixed(2).split('.');
  parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return parts[0]+','+parts[1]+'&#8364;';
}

/* ── computeEconEx — cálculo extendido ──────────────────────── */
function computeEconEx(year,opts){
  opts=opts||{};
  var s=computeYearlySummary(year);
  var avgHDay=s.avgHDay||8;

  // Determinar tarifa diaria
  var dailyRate=DAILY_RATE;
  if(opts.rateType==='hourly'&&opts.rateValue>0){
    dailyRate=Math.round(opts.rateValue*avgHDay*100)/100;
  } else if(opts.rateType==='daily'&&opts.rateValue>0){
    dailyRate=opts.rateValue;
  } else if(opts.dailyRate>0){
    dailyRate=opts.dailyRate;
  }

  var irpfPct=(opts.irpfPct!==undefined)?opts.irpfPct:getIrpfPct();
  var hoursMode=opts.hoursMode||'real';

  var months=[],totBase=0,totIva=0,totIrpf=0,totCobrado=0;
  var qIva=[0,0,0,0],qCobrado=[0,0,0,0],qBase=[0,0,0,0];
  var totalDays=0,totalHours=0;

  for(var m=0;m<12;m++){
    var dias=s.mDays[m]+s.mDaysP[m];
    var realHours=s.mHours[m]+s.mHoursP[m];
    var effHours=hoursMode==='8h'?dias*8:realHours;

    var base;
    if(opts.rateType==='hourly'&&opts.rateValue>0){
      base=Math.round(effHours*opts.rateValue*100)/100;
    } else {
      base=Math.round(dias*dailyRate*100)/100;
    }
    var iva=Math.round(base*0.21*100)/100;
    var irpf=Math.round(base*irpfPct/100*100)/100;
    var cobrado=Math.round((base+iva-irpf)*100)/100;
    var neto=Math.round((base-irpf)*100)/100;
    months.push({m:m,dias:dias,hours:effHours,base:base,iva:iva,irpf:irpf,cobrado:cobrado,neto:neto});
    totBase+=base; totIva+=iva; totIrpf+=irpf; totCobrado+=cobrado;
    totalDays+=dias; totalHours+=effHours;
    var qi=Math.floor(m/3);
    qIva[qi]+=iva; qCobrado[qi]+=cobrado; qBase[qi]+=base;
  }

  qBase=qBase.map(function(b){return Math.round(b*100)/100;});
  qIva=qIva.map(function(v){return Math.round(v*100)/100;});
  qCobrado=qCobrado.map(function(v){return Math.round(v*100)/100;});
  var qNeto=qIva.map(function(iv,i){return Math.round((qCobrado[i]-iv)*100)/100;});
  totBase=Math.round(totBase*100)/100;
  totIva=Math.round(totIva*100)/100;
  totIrpf=Math.round(totIrpf*100)/100;
  totCobrado=Math.round(totCobrado*100)/100;
  var netoReal=Math.round((totBase-totIrpf)*100)/100;
  var hourlyRate=totalHours>0?Math.round(totBase/totalHours*100)/100:0;

  return{months:months,totBase:totBase,totIva:totIva,totIrpf:totIrpf,
    totCobrado:totCobrado,netoReal:netoReal,
    qIva:qIva,qCobrado:qCobrado,qBase:qBase,qNeto:qNeto,
    totalDays:totalDays,totalHours:totalHours,
    dailyRate:dailyRate,hourlyRate:hourlyRate,avgHDay:avgHDay,
    irpfPct:irpfPct};
}

/* Alias de compatibilidad */
function computeEcon(year){return computeEconEx(year);}

/* ── Gráfica de barras ───────────────────────────────────────── */
function econBarChart(data,labels,color){
  var W=320,H=90,PB=18,PT=14,PL=32,n=12;
  var bW=W-PL;
  var maxV=Math.max.apply(null,data)||1;
  var step=2500;
  while(maxV/step>5)step*=2;
  var bw=Math.floor((bW-n*2)/n),gap=2;
  var today=new Date();
  var cm=ECON_YEAR===today.getFullYear()?today.getMonth():-1;
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">';
  for(var gv=step;gv<=maxV*1.05;gv+=step){
    var gy=Math.round(H-(gv/maxV)*(H-PT));
    if(gy<PT)break;
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+W+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl=gv%1000===0?(gv/1000)+'k':((gv/1000).toFixed(1).replace('.',','))+'k';
    svg+='<text x="'+(PL-2)+'" y="'+(gy+3)+'" text-anchor="end" font-size="6" fill="#5a5a70">'+lbl+'</text>';
  }
  for(var i=0;i<n;i++){
    var x=PL+i*(bw+gap);
    var v=data[i];
    var h2=v>0?Math.max(2,Math.round((v/maxV)*(H-PT))):0;
    var op=i<cm?'.45':i===cm?'1':'.25';
    if(v>0)svg+='<rect x="'+x+'" y="'+(H-h2)+'" width="'+bw+'" height="'+h2+'" rx="2" fill="'+color+'" opacity="'+op+'"/>';
    svg+='<text x="'+(x+bw/2)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="7" fill="#5a5a70">'+labels[i]+'</text>';
  }
  svg+='</svg>';
  return svg;
}

/* ── Tab 1: Resumen ──────────────────────────────────────────── */
function renderEconResumen(){
  var e=computeEconEx(ECON_YEAR);
  var avgHDay=e.avgHDay||8;
  var hourlyRate=Math.round(DAILY_RATE/avgHDay*100)/100;
  var h='';

  // §1 Tarifa dual
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Tarifa</div>';
  h+='<div class="econ-rate-dual">';
  h+='<div class="econ-rate-field'+(ECON_RATE_MODE==='daily'?' primary':' derived')+'">';
  h+='<label>&#8364;/d&#237;a</label>';
  h+='<input class="econ-rate-input" id="rateDayInput" type="number" min="1" step="1" value="'+DAILY_RATE+'">';
  h+='</div>';
  h+='<div class="econ-rate-sep">&#8596;</div>';
  h+='<div class="econ-rate-field'+(ECON_RATE_MODE==='hourly'?' primary':' derived')+'">';
  h+='<label>&#8364;/hora</label>';
  h+='<input class="econ-rate-input" id="rateHourInput" type="number" min="0.01" step="0.01" value="'+hourlyRate.toFixed(2)+'">';
  h+='</div></div>';
  h+='<div class="excl-row">';
  h+='<label class="excl-item" style="color:var(--festivo)"><input type="checkbox" class="excl-chk" id="ecExclFestChk" style="accent-color:var(--festivo)"'+(EXCL_FEST?' checked':'')+'>&#160;Quitar festivos</label>';
  h+='<label class="excl-item" style="color:var(--vacaciones)"><input type="checkbox" class="excl-chk" id="ecExclVacChk" style="accent-color:var(--vacaciones)"'+(EXCL_VAC?' checked':'')+'>&#160;Quitar vacaciones</label>';
  h+='</div></div>';

  // §2 Resumen anual
  h+='<div class="sy-section"><div class="sy-section-title">Resumen anual</div>';
  h+='<div class="econ-annual">';
  h+='<div class="econ-row col-base"><span>Base imponible (bruto)</span><span class="econ-val">'+fc(e.totBase)+'</span></div>';
  h+='<div class="econ-row col-iva"><span>+ IVA a pagar (21%)</span><span class="econ-val">+'+fc(e.totIva)+'</span></div>';
  h+='<div class="econ-row col-irpf"><span>&#8722; IRPF retenido ('+e.irpfPct+'%)</span><span class="econ-val">&#8722;'+fc(e.totIrpf)+'</span></div>';
  h+='<div class="econ-row col-net"><span>Neto efectivo:<br><span style="font-size:.8em;opacity:.8">(Base &#8722; IRPF)</span></span><span class="econ-val">'+fc(e.netoReal)+'</span></div>';
  h+='</div>';
  // Media mensual
  var avgBase=Math.round(e.totBase/12*100)/100;
  var avgIva=Math.round(e.totIva/12*100)/100;
  var avgIrpf=Math.round(e.totIrpf/12*100)/100;
  var avgNeto=Math.round(e.netoReal/12*100)/100;
  h+='<div class="econ-avg-section"><div class="econ-avg-title">Media mensual (a\u00f1o / 12)</div>';
  h+='<div class="econ-avg-grid">';
  h+='<span class="econ-avg-lbl" style="color:var(--c-blue)">Base</span><span class="econ-avg-val" style="color:var(--c-blue)">'+fc(avgBase)+'</span><span></span>';
  h+='<span class="econ-avg-lbl" style="color:var(--c-orange)">IVA</span><span class="econ-avg-val" style="color:var(--c-orange)">'+fc(avgIva)+'</span>';
  h+='<span class="econ-avg-lbl" style="color:var(--c-red)">IRPF</span><span class="econ-avg-val" style="color:var(--c-red)">'+fc(avgIrpf)+'</span><span></span>';
  h+='<span class="econ-avg-lbl" style="color:var(--c-green)">Neto</span><span class="econ-avg-val" style="color:var(--c-green)">'+fc(avgNeto)+'</span>';
  h+='</div></div>';
  // Ingresado
  h+='<div class="econ-ingresado-box">';
  h+='<div class="econ-row ingresado-main"><span>Ingresado en la cuenta</span><span class="econ-val">'+fc(e.totCobrado)+'</span></div>';
  h+='<div class="econ-formula">';
  h+='<span class="f-base">Base</span> + <span class="f-iva">IVA 21%</span> &#8722; <span class="f-irpf">IRPF '+e.irpfPct+'%</span> = ingresado en cuenta';
  h+='<br><b style="color:var(--c-orange)">Recuerda restar el IVA</b>, que se paga trimestralmente a Hacienda (mod. 303).';
  h+='</div></div></div>';

  // §3 Estadísticas por hora/día
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Estad&#237;sticas por hora y d&#237;a</div>';
  var hPerH_base=e.totalHours>0?Math.round(e.totBase/e.totalHours*100)/100:0;
  var hPerH_iva=Math.round(hPerH_base*0.21*100)/100;
  var hPerH_irpf=Math.round(hPerH_base*e.irpfPct/100*100)/100;
  var hPerH_net=Math.round((hPerH_base-hPerH_irpf)*100)/100;
  var dPerD_base=e.totalDays>0?Math.round(e.totBase/e.totalDays*100)/100:DAILY_RATE;
  var dPerD_iva=Math.round(dPerD_base*0.21*100)/100;
  var dPerD_irpf=Math.round(dPerD_base*e.irpfPct/100*100)/100;
  var dPerD_net=Math.round((dPerD_base-dPerD_irpf)*100)/100;
  var e8h=ECON_8H?computeEconEx(ECON_YEAR,{hoursMode:'8h'}):null;
  var d8_base=ECON_8H&&e8h.totalHours>0?Math.round(e8h.totBase/e8h.totalHours*100)/100:0;
  var d8_iva=ECON_8H?Math.round(d8_base*0.21*100)/100:0;
  var d8_irpf=ECON_8H?Math.round(d8_base*e.irpfPct/100*100)/100:0;
  var d8_net=ECON_8H?Math.round((d8_base-d8_irpf)*100)/100:0;
  h+='<div style="overflow-x:auto"><table class="econ-stats-table">';
  h+='<thead><tr><th></th><th>Por hora</th><th>Por d&#237;a</th>'+(ECON_8H?'<th>Por hora (8h)</th>':'')+'</tr></thead><tbody>';
  h+='<tr class="col-base"><td>Base</td><td>'+fc(hPerH_base)+'/h</td><td>'+fc(dPerD_base)+'/d</td>'+(ECON_8H?'<td>'+fc(d8_base)+'/h</td>':'')+'</tr>';
  h+='<tr class="col-iva"><td>IVA</td><td>'+fc(hPerH_iva)+'/h</td><td>'+fc(dPerD_iva)+'/d</td>'+(ECON_8H?'<td>'+fc(d8_iva)+'/h</td>':'')+'</tr>';
  h+='<tr class="col-irpf"><td>IRPF</td><td>'+fc(hPerH_irpf)+'/h</td><td>'+fc(dPerD_irpf)+'/d</td>'+(ECON_8H?'<td>'+fc(d8_irpf)+'/h</td>':'')+'</tr>';
  h+='<tr class="col-net"><td>Neto</td><td>'+fc(hPerH_net)+'/h</td><td>'+fc(dPerD_net)+'/d</td>'+(ECON_8H?'<td>'+fc(d8_net)+'/h</td>':'')+'</tr>';
  h+='</tbody></table></div>';
  h+='<button class="econ-toggle-btn'+(ECON_8H?' active':'')+'" id="ec8hToggle">'+(ECON_8H?'&#9746;':'&#9744;')+'&#160;Comparar con jornada 8h</button>';
  h+='</div>';

  // §4 Declaración IRPF (condicional)
  h+='<div class="sy-section">';
  h+='<button class="econ-toggle-btn'+(ECON_IRPF_DECL?' active':'')+'" id="ecDeclToggle">'+(ECON_IRPF_DECL?'&#9746;':'&#9744;')+'&#160;Incluir IRPF declaraci&#243;n</button>';
  if(ECON_IRPF_DECL){
    var decl=computeIrpfBrackets(e.totBase);
    var diff=Math.round((e.totIrpf-decl.totalTax)*100)/100;
    h+='<div class="econ-decl-section">';
    h+='<div class="econ-decl-row"><span>Base imponible:</span><span class="econ-val">'+fc(e.totBase)+'</span></div>';
    h+='<div class="econ-decl-row"><span>IRPF por tramos:</span><span class="econ-val col-irpf">'+fc(decl.totalTax)+'</span></div>';
    h+='<div class="econ-decl-row"><span>Tipo efectivo:</span><span class="econ-val">'+decl.effectivePct.toFixed(2).replace('.',',')+'\u202f%</span></div>';
    h+='<div class="econ-decl-row"><span>Retenci&#243;n facturada ('+e.irpfPct+'%):</span><span class="econ-val col-irpf">'+fc(e.totIrpf)+'</span></div>';
    h+='<div class="econ-decl-row"><span>'+(diff>0?'Devoluci\u00f3n estimada:':'A pagar estimado:')+'</span>';
    h+='<span class="econ-val" style="color:'+(diff>0?'var(--c-green)':'var(--c-red)')+';">'+(diff>0?'+':'')+fc(Math.abs(diff))+'</span></div>';
    h+='<div style="overflow-x:auto;margin-top:8px"><table class="econ-bracket-table"><thead><tr>';
    h+='<th>Desde</th><th>Hasta</th><th>Tipo</th><th>Tramo</th><th>Cuota</th></tr></thead><tbody>';
    decl.breakdown.forEach(function(tr){
      h+='<tr><td>'+fc(tr.from)+'</td><td>'+(tr.to===Infinity?'&#8734;':fc(tr.to))+'</td>';
      h+='<td>'+tr.pct+'%</td><td>'+fc(tr.taxable)+'</td><td class="col-irpf">'+fc(tr.tax)+'</td></tr>';
    });
    h+='</tbody></table></div>';
    h+='</div>';
  }
  h+='</div>';

  // §5 IVA trimestral
  h+='<div class="sy-section econ-quarter-section"><div class="sy-section-title">IVA trimestral a Hacienda (mod. 303)</div>';
  h+='<div class="econ-quarter-scroll"><div class="econ-quarter-grid">';
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell"><div class="sy-val-sm">'+fc(e.qCobrado[i])+'</div><div class="sy-lbl">'+q+' Cobrado</div></div>';
  });
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell"><div class="sy-val-sm" style="color:var(--c-blue)">'+fc(e.qBase[i])+'</div><div class="sy-lbl">'+q+' Base</div></div>';
  });
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell econ-qcell-iva"><div class="sy-val-sm" style="color:var(--c-orange)">'+fc(e.qIva[i])+'</div><div class="sy-lbl">'+q+' IVA Hacienda</div></div>';
  });
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell econ-qcell-neto"><div class="sy-val-sm" style="color:var(--c-green)">'+fc(e.qNeto[i])+'</div><div class="sy-lbl">'+q+' neto real</div></div>';
  });
  h+='</div></div></div>';

  // §6 Gráfica neto mensual
  h+='<div class="sy-section"><div class="sy-section-title">Neto mensual (Base &#8722; IRPF)</div>';
  var netoData=e.months.map(function(mo){return mo.neto;});
  h+='<div class="sy-chart">'+econBarChart(netoData,MN_SHORT,'#34d399')+'</div></div>';

  // §7 Desglose mensual
  h+='<div class="sy-section econ-month-section"><div class="sy-section-title">Desglose mensual</div>';
  h+='<div class="econ-month-wrap"><table class="econ-month-table"><thead><tr>';
  h+='<th>Mes</th><th>D&#237;as</th><th style="color:var(--c-blue)">Base</th><th style="color:var(--c-orange)">IVA</th><th style="color:var(--c-red)">IRPF</th><th>Ingresado</th></tr></thead><tbody>';
  var totD=0;
  e.months.forEach(function(mo){
    totD+=mo.dias;
    h+='<tr><td>'+MN_SHORT[mo.m]+'</td><td>'+mo.dias+'d</td>';
    h+='<td class="col-base">'+fc(mo.base)+'</td><td class="col-iva">'+fc(mo.iva)+'</td>';
    h+='<td class="col-irpf">'+fc(mo.irpf)+'</td><td class="col-ingresado">'+fc(mo.cobrado)+'</td></tr>';
  });
  h+='<tr class="econ-tr-total"><td>Total</td><td>'+totD+'d</td>';
  h+='<td class="col-base">'+fc(e.totBase)+'</td><td class="col-iva">'+fc(e.totIva)+'</td>';
  h+='<td class="col-irpf">'+fc(e.totIrpf)+'</td><td class="col-ingresado">'+fc(e.totCobrado)+'</td></tr>';
  h+='</tbody></table></div></div>';

  return h;
}

/* ── renderEconContent — estructura 3 tabs ───────────────────── */
function renderEconContent(){
  var h=renderNavBar('econ');
  // Nivel 2: tabs
  h+='<div class="econ-hdr-sub">';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='resumen'?' active':'')+'" id="ecTabResumen">\uD83D\uDCCA Resumen</button>';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='comparador'?' active':'')+'" id="ecTabComp">&#9878; Comparador</button>';
  h+='<button class="econ-tab-btn'+(ECON_VIEW==='simulador'?' active':'')+'" id="ecTabSim">&#127919; Simulador</button>';
  h+='<button class="econ-gear-btn" id="ecGear">&#9881;&#65039;</button>';
  h+='</div>';
  // Nivel 3: año
  h+='<div class="sy-header with-tabs">';
  h+='<div class="sy-year-nav"><button class="sy-nav" id="ecPrev">&#9664;</button><div class="sy-year">'+ECON_YEAR+'</div><button class="sy-nav" id="ecNext">&#9654;</button></div>';
  h+='<button class="sy-pdf" id="ecPdf">PDF</button>';
  h+='</div>';
  h+='<div class="sy-body">';
  if(ECON_VIEW==='resumen'){h+=renderEconResumen();}
  else if(ECON_VIEW==='comparador'){h+=typeof renderEconComp==='function'?renderEconComp():'';}
  else if(ECON_VIEW==='simulador'){h+=typeof renderEconSim==='function'?renderEconSim():'';}
  h+='</div>';
  return h;
}

function openEcon(){
  NAV_BACK=null;
  ECON_YEAR=CY;
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

function bindEconEvents(){
  bindNavBar('econ',closeEcon);

  // Tabs nivel 2
  document.getElementById('ecTabResumen').addEventListener('click',function(){ECON_VIEW='resumen';reRenderEcon();});
  document.getElementById('ecTabComp').addEventListener('click',function(){ECON_VIEW='comparador';reRenderEcon();});
  document.getElementById('ecTabSim').addEventListener('click',function(){ECON_VIEW='simulador';reRenderEcon();});
  document.getElementById('ecGear').addEventListener('click',function(){
    NAV_BACK=function(){closeEcon();openEcon();};
    openFiscal();
  });

  // Nivel 3: año y PDF
  document.getElementById('ecPrev').addEventListener('click',function(){ECON_YEAR--;reRenderEcon();});
  document.getElementById('ecNext').addEventListener('click',function(){ECON_YEAR++;reRenderEcon();});
  document.getElementById('ecPdf').addEventListener('click',function(){
    document.body.classList.add('print-econ');window.print();document.body.classList.remove('print-econ');
  });

  // Eventos específicos de cada pestaña
  if(ECON_VIEW==='resumen'){bindEconResumenEvents();}
  else if(ECON_VIEW==='comparador'&&typeof bindEconCompEvents==='function'){bindEconCompEvents();}
  else if(ECON_VIEW==='simulador'&&typeof bindEconSimEvents==='function'){bindEconSimEvents();}

  setTimeout(function(){
    var qs=document.querySelector('.econ-quarter-section');
    var ms=document.querySelector('.econ-month-section');
    if(qs&&ms)ms.style.maxWidth=qs.offsetWidth+'px';
  },60);
}

function bindEconResumenEvents(){
  var dayInput=document.getElementById('rateDayInput');
  var hourInput=document.getElementById('rateHourInput');
  if(!dayInput||!hourInput)return;

  dayInput.addEventListener('change',function(){
    var v=parseFloat(this.value);
    if(v>0){DAILY_RATE=Math.round(v);ECON_RATE_MODE='daily';save();reRenderEcon();}
  });
  hourInput.addEventListener('change',function(){
    var v=parseFloat(this.value);
    if(v>0){
      ECON_RATE_MODE='hourly';
      var s=computeYearlySummary(ECON_YEAR);
      DAILY_RATE=Math.round(v*(s.avgHDay||8));
      save();reRenderEcon();
    }
  });

  var ecChkFest=document.getElementById('ecExclFestChk');
  var ecChkVac=document.getElementById('ecExclVacChk');
  if(ecChkFest)ecChkFest.addEventListener('change',function(){EXCL_FEST=this.checked;save();reRenderEcon();});
  if(ecChkVac)ecChkVac.addEventListener('change',function(){EXCL_VAC=this.checked;save();reRenderEcon();});

  var t8=document.getElementById('ec8hToggle');
  if(t8)t8.addEventListener('click',function(){ECON_8H=!ECON_8H;reRenderEcon();});

  var td=document.getElementById('ecDeclToggle');
  if(td)td.addEventListener('click',function(){ECON_IRPF_DECL=!ECON_IRPF_DECL;reRenderEcon();});
}

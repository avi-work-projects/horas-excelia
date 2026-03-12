/* ============================================================
   ECONOMICS — Cálculos económicos del año
   ============================================================ */

var ECON_YEAR=new Date().getFullYear();

function fc(n){
  var parts=n.toFixed(2).split('.');
  parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return parts[0]+','+parts[1]+'&#8364;';
}

function computeEcon(year){
  var s=computeYearlySummary(year);
  var months=[];
  var totBase=0,totIva=0,totIrpf=0,totCobrado=0;
  var qIva=[0,0,0,0],qCobrado=[0,0,0,0],qBase=[0,0,0,0];
  var qMonthData=[[],[],[],[]];
  for(var m=0;m<12;m++){
    var dias=s.mDays[m]+s.mDaysP[m];
    var base=dias*DAILY_RATE;
    var iva=Math.round(base*0.21*100)/100;
    var irpf=Math.round(base*0.15*100)/100;
    var cobrado=Math.round((base+iva-irpf)*100)/100;
    var neto=Math.round((base-irpf)*100)/100;
    months.push({m:m,dias:dias,base:base,iva:iva,irpf:irpf,cobrado:cobrado,neto:neto});
    totBase+=base; totIva+=iva; totIrpf+=irpf; totCobrado+=cobrado;
    var qi=Math.floor(m/3);
    qIva[qi]+=iva;
    qCobrado[qi]+=cobrado;
    qBase[qi]+=base;
    qMonthData[qi].push({m:m,cobrado:Math.round(cobrado*100)/100});
  }
  qBase=qBase.map(function(b){return Math.round(b*100)/100;});
  totBase=Math.round(totBase*100)/100;
  totIva=Math.round(totIva*100)/100;
  totIrpf=Math.round(totIrpf*100)/100;
  totCobrado=Math.round(totCobrado*100)/100;
  var netoReal=Math.round((totBase-totIrpf)*100)/100;
  var neto=Math.round((totBase-totIva-totIrpf)*100)/100;
  var qNeto=qIva.map(function(iva,i){return Math.round((qCobrado[i]-iva)*100)/100;});
  return{months:months,totBase:totBase,totIva:totIva,totIrpf:totIrpf,
    totCobrado:totCobrado,neto:neto,netoReal:netoReal,
    qIva:qIva,qCobrado:qCobrado,qBase:qBase,qMonthData:qMonthData,qNeto:qNeto};
}

/* ── Gráfica de barras ───────────────────────────────────── */
function econBarChart(data,labels,color){
  var W=320,H=90,PB=18,PT=14,PL=32,n=12;
  var bW=W-PL;
  var maxV=Math.max.apply(null,data)||1;
  // Paso en múltiplos de 2500
  var step=2500;
  while(maxV/step>5)step*=2;
  var bw=Math.floor((bW-n*2)/n),gap=2;
  var today=new Date();
  var cm=ECON_YEAR===today.getFullYear()?today.getMonth():-1;
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">';
  // Líneas de fondo y etiquetas eje Y
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

function renderEconContent(){
  var e=computeEcon(ECON_YEAR);
  var h=renderNavBar('econ');
  h+='<div class="sy-header">';
  h+='<button class="sy-back" id="ecBack">&#8592;</button>';
  h+='<div class="sy-year-nav"><button class="sy-nav" id="ecPrev">&#9664;</button><div class="sy-year">'+ECON_YEAR+'</div><button class="sy-nav" id="ecNext">&#9654;</button></div>';
  h+='<button class="sy-pdf" id="ecPdf">PDF</button>';
  h+='</div>';
  h+='<div class="sy-body">';

  // Tarifa configurable
  h+='<div class="sy-section"><div class="sy-section-title">Tarifa diaria</div>';
  h+='<div class="rate-row"><span class="rate-label">&#8364;/d&#237;a (sin IVA)</span>';
  h+='<input class="rate-input" id="rateInput" type="number" min="1" step="1" value="'+DAILY_RATE+'">';
  h+='<span class="rate-suffix">&#8364;/d&#237;a</span></div>';
  h+='<div class="excl-row">';
  h+='<label class="excl-item" style="color:var(--festivo)"><input type="checkbox" class="excl-chk" id="ecExclFestChk" style="accent-color:var(--festivo)"'+(EXCL_FEST?' checked':'')+'>&#160;Quitar festivos</label>';
  h+='<label class="excl-item" style="color:var(--vacaciones)"><input type="checkbox" class="excl-chk" id="ecExclVacChk" style="accent-color:var(--vacaciones)"'+(EXCL_VAC?' checked':'')+'>&#160;Quitar vacaciones</label>';
  h+='</div></div>';

  // Resumen anual
  h+='<div class="sy-section"><div class="sy-section-title">Resumen anual</div>';
  h+='<div class="econ-annual">';
  h+='<div class="econ-row col-base"><span>Base imponible (bruto)</span><span class="econ-val">'+fc(e.totBase)+'</span></div>';
  h+='<div class="econ-row col-iva"><span>+ IVA a pagar (21%)</span><span class="econ-val">+'+fc(e.totIva)+'</span></div>';
  h+='<div class="econ-row col-irpf"><span>&#8722; IRPF retenido (15%)</span><span class="econ-val">&#8722;'+fc(e.totIrpf)+'</span></div>';
  h+='<div class="econ-row col-net"><span>Neto efectivo:<br><span style="font-size:.8em;opacity:.8">(Base &#8722; IRPF)</span></span><span class="econ-val">'+fc(e.netoReal)+'</span></div>';
  h+='</div>';
  // Media mensual (año/12)
  var avgBase=Math.round(e.totBase/12*100)/100;
  var avgIva=Math.round(e.totIva/12*100)/100;
  var avgIrpf=Math.round(e.totIrpf/12*100)/100;
  var avgNeto=Math.round(e.netoReal/12*100)/100;
  h+='<div class="econ-avg-section">';
  h+='<div class="econ-avg-title">Media mensual (a\u00f1o / 12)</div>';
  h+='<div class="econ-avg-grid">';
  h+='<div class="econ-avg-item"><span class="econ-avg-lbl" style="color:var(--c-blue)">Base</span><span class="econ-avg-val" style="color:var(--c-blue)">'+fc(avgBase)+'</span></div>';
  h+='<div class="econ-avg-item"><span class="econ-avg-lbl" style="color:var(--c-orange)">IVA</span><span class="econ-avg-val" style="color:var(--c-orange)">'+fc(avgIva)+'</span></div>';
  h+='<div class="econ-avg-item"><span class="econ-avg-lbl" style="color:var(--c-red)">IRPF</span><span class="econ-avg-val" style="color:var(--c-red)">'+fc(avgIrpf)+'</span></div>';
  h+='<div class="econ-avg-item"><span class="econ-avg-lbl" style="color:var(--c-green)">Neto</span><span class="econ-avg-val" style="color:var(--c-green)">'+fc(avgNeto)+'</span></div>';
  h+='</div></div>';

  // Ingresado en cuenta (neutral)
  h+='<div class="econ-ingresado-box">';
  h+='<div class="econ-row ingresado-main"><span>Ingresado en la cuenta</span><span class="econ-val">'+fc(e.totCobrado)+'</span></div>';
  h+='<div class="econ-formula">';
  h+='<span class="f-base">Base</span> + <span class="f-iva">IVA 21%</span> &#8722; <span class="f-irpf">IRPF 15%</span> = ingresado en cuenta';
  h+='<br><b style="color:var(--c-orange)">Recuerda restar el IVA</b>, que se paga trimestralmente a Hacienda (mod. 303).';
  h+='<br>Neto efectivo = ingresado &#8722; IVA trimestral = base &#8722; IRPF.';
  h+='</div></div>';
  h+='</div>';

  // IVA trimestral — cuadrícula única (4 col × 4 fila) para alineación perfecta
  h+='<div class="sy-section econ-quarter-section"><div class="sy-section-title">IVA trimestral a Hacienda (mod. 303)</div>';
  h+='<div class="econ-quarter-scroll"><div class="econ-quarter-grid">';
  // Fila 1: cobrado total por trimestre
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell"><div class="sy-val-sm">'+fc(Math.round(e.qCobrado[i]*100)/100)+'</div>';
    h+='<div class="sy-lbl">'+q+' Cobrado</div></div>';
  });
  // Fila 2: Base por trimestre
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell"><div class="sy-val-sm" style="color:var(--c-blue)">'+fc(e.qBase[i])+'</div>';
    h+='<div class="sy-lbl">'+q+' Base</div></div>';
  });
  // Fila 3: IVA a pagar por trimestre
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell econ-qcell-iva"><div class="sy-val-sm" style="color:var(--c-orange)">'+fc(Math.round(e.qIva[i]*100)/100)+'</div>';
    h+='<div class="sy-lbl">'+q+' IVA Hacienda</div></div>';
  });
  // Fila 4: neto real tras pagar IVA
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcell econ-qcell-neto"><div class="sy-val-sm" style="color:var(--c-green)">'+fc(e.qNeto[i])+'</div>';
    h+='<div class="sy-lbl">'+q+' neto real</div></div>';
  });
  h+='</div></div></div>';

  // Gráfica neto mensual
  h+='<div class="sy-section"><div class="sy-section-title">Neto mensual (Base &#8722; IRPF)</div>';
  var netoData=e.months.map(function(mo){return mo.neto;});
  h+='<div class="sy-chart">'+econBarChart(netoData,MN_SHORT,'#34d399')+'</div></div>';

  // Desglose mensual
  h+='<div class="sy-section econ-month-section"><div class="sy-section-title">Desglose mensual</div>';
  h+='<div class="econ-month-wrap"><table class="econ-month-table"><thead><tr>';
  h+='<th>Mes</th><th>D&#237;as</th><th style="color:var(--c-blue)">Base</th><th style="color:var(--c-orange)">IVA</th><th style="color:var(--c-red)">IRPF</th><th>Ingresado</th></tr></thead><tbody>';
  var totD=0;
  e.months.forEach(function(mo){
    totD+=mo.dias;
    h+='<tr><td>'+MN_SHORT[mo.m]+'</td><td>'+mo.dias+'d</td>';
    h+='<td class="col-base">'+fc(mo.base)+'</td>';
    h+='<td class="col-iva">'+fc(mo.iva)+'</td>';
    h+='<td class="col-irpf">'+fc(mo.irpf)+'</td>';
    h+='<td class="col-ingresado">'+fc(mo.cobrado)+'</td></tr>';
  });
  h+='<tr class="econ-tr-total"><td>Total</td><td>'+totD+'d</td>';
  h+='<td class="col-base">'+fc(e.totBase)+'</td>';
  h+='<td class="col-iva">'+fc(e.totIva)+'</td>';
  h+='<td class="col-irpf">'+fc(e.totIrpf)+'</td>';
  h+='<td class="col-ingresado">'+fc(e.totCobrado)+'</td></tr>';
  h+='</tbody></table></div></div>';

  h+='</div>';
  return h;
}

function openEcon(){
  NAV_BACK=null;
  ECON_YEAR=CY;
  var ov=document.getElementById('econOverlay');
  document.getElementById('econContent').innerHTML=renderEconContent();
  ov.style.display='block';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindEconEvents();});});
}

function closeEcon(){
  var ov=document.getElementById('econOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}

function bindEconEvents(){
  document.getElementById('ecBack').addEventListener('click',function(){
    if(NAV_BACK){var fn=NAV_BACK;NAV_BACK=null;fn();}else{closeEcon();}
  });
  bindNavBar('econ',closeEcon);
  document.getElementById('ecPdf').addEventListener('click',function(){
    document.body.classList.add('print-econ');
    window.print();
    document.body.classList.remove('print-econ');
  });
  document.getElementById('ecPrev').addEventListener('click',function(){
    ECON_YEAR--;
    document.getElementById('econContent').innerHTML=renderEconContent();
    bindEconEvents();
  });
  document.getElementById('ecNext').addEventListener('click',function(){
    ECON_YEAR++;
    document.getElementById('econContent').innerHTML=renderEconContent();
    bindEconEvents();
  });
  document.getElementById('rateInput').addEventListener('change',function(){
    var v=parseInt(this.value,10);
    if(v>0){DAILY_RATE=v;save();document.getElementById('econContent').innerHTML=renderEconContent();bindEconEvents();}
  });
  var ecChkFest=document.getElementById('ecExclFestChk');
  var ecChkVac=document.getElementById('ecExclVacChk');
  if(ecChkFest)ecChkFest.addEventListener('change',function(){EXCL_FEST=this.checked;save();document.getElementById('econContent').innerHTML=renderEconContent();bindEconEvents();});
  if(ecChkVac)ecChkVac.addEventListener('change',function(){EXCL_VAC=this.checked;save();document.getElementById('econContent').innerHTML=renderEconContent();bindEconEvents();});
  // Sincronizar ancho máximo de la tabla mensual con el ancho de la sección trimestral
  setTimeout(function(){
    var qs=document.querySelector('.econ-quarter-section');
    var ms=document.querySelector('.econ-month-section');
    if(qs&&ms)ms.style.maxWidth=qs.offsetWidth+'px';
    if(typeof fixStickyTops==='function')fixStickyTops();
  },60);
}

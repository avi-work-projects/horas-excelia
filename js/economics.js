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
  var qIva=[0,0,0,0];
  for(var m=0;m<12;m++){
    var dias=s.mDays[m]+s.mDaysP[m];
    var base=dias*DAILY_RATE;
    var iva=Math.round(base*0.21*100)/100;
    var irpf=Math.round(base*0.15*100)/100;
    var cobrado=Math.round((base+iva-irpf)*100)/100;
    months.push({m:m,dias:dias,base:base,iva:iva,irpf:irpf,cobrado:cobrado});
    totBase+=base; totIva+=iva; totIrpf+=irpf; totCobrado+=cobrado;
    qIva[Math.floor(m/3)]+=iva;
  }
  totBase=Math.round(totBase*100)/100;
  totIva=Math.round(totIva*100)/100;
  totIrpf=Math.round(totIrpf*100)/100;
  totCobrado=Math.round(totCobrado*100)/100;
  var netoReal=Math.round((totBase-totIrpf)*100)/100; // cobrado - IVA trimestral
  var neto=Math.round((totBase-totIva-totIrpf)*100)/100;
  return{months:months,totBase:totBase,totIva:totIva,totIrpf:totIrpf,
    totCobrado:totCobrado,neto:neto,netoReal:netoReal,qIva:qIva};
}

function renderEconContent(){
  var e=computeEcon(ECON_YEAR);
  var h='<div class="sy-header">';
  h+='<button class="sy-back" id="ecBack">&#8592;</button>';
  h+='<div class="sy-year-nav"><button class="sy-nav" id="ecPrev">&#9664;</button><div class="sy-year">'+ECON_YEAR+'</div><button class="sy-nav" id="ecNext">&#9654;</button></div>';
  h+='<button class="sy-pdf" id="ecPdf">PDF</button>';
  h+='</div><div class="sy-body">';

  // Tarifa configurable
  h+='<div class="sy-section"><div class="sy-section-title">Tarifa diaria</div>';
  h+='<div class="rate-row"><span class="rate-label">&#8364;/d&#237;a (sin IVA)</span>';
  h+='<input class="rate-input" id="rateInput" type="number" min="1" step="1" value="'+DAILY_RATE+'">';
  h+='<span class="rate-suffix">&#8364;/d&#237;a</span></div></div>';

  // Resumen anual — Caja 1: Base, IVA, IRPF, Neto
  h+='<div class="sy-section"><div class="sy-section-title">Resumen anual</div>';
  h+='<div class="econ-annual">';
  h+='<div class="econ-row col-base"><span>Base imponible (bruto)</span><span class="econ-val">'+fc(e.totBase)+'</span></div>';
  h+='<div class="econ-row col-iva"><span>+ IVA a pagar (21%)</span><span class="econ-val">+'+fc(e.totIva)+'</span></div>';
  h+='<div class="econ-row col-irpf"><span>&#8722; IRPF retenido (15%)</span><span class="econ-val">&#8722;'+fc(e.totIrpf)+'</span></div>';
  h+='<div class="econ-row col-net"><span>Neto efectivo</span><span class="econ-val">'+fc(e.netoReal)+'</span></div>';
  h+='</div>';

  // Caja 2: Cobrado del cliente (separada)
  h+='<div class="econ-cobrado-box">';
  h+='<div class="econ-row cobrado-main"><span>Cobrado del cliente</span><span class="econ-val">'+fc(e.totCobrado)+'</span></div>';
  h+='<div class="econ-formula">';
  h+='<span class="f-base">Base</span> + <span class="f-iva">IVA 21%</span> &#8722; <span class="f-irpf">IRPF 15%</span> = cobrado del cliente';
  h+='<br>El IVA recaudado <b>no es tuyo</b>: se liquida trimestralmente con Hacienda (mod. 303).';
  h+='<br>Neto efectivo = cobrado &#8722; IVA trimestral = base &#8722; IRPF.';
  h+='</div></div>';
  h+='</div>';

  // IVA trimestral
  h+='<div class="sy-section"><div class="sy-section-title">IVA trimestral a Hacienda (mod. 303)</div>';
  h+='<div class="econ-quarter">';
  ['T1','T2','T3','T4'].forEach(function(q,i){
    h+='<div class="econ-qcard"><div class="sy-val-sm" style="color:var(--c-orange)">'+fc(Math.round(e.qIva[i]*100)/100)+'</div><div class="sy-lbl">'+q+'</div></div>';
  });
  h+='</div></div>';

  // Desglose mensual
  h+='<div class="sy-section"><div class="sy-section-title">Desglose mensual</div>';
  h+='<div style="overflow-x:auto"><table class="econ-month-table"><thead><tr>';
  h+='<th>Mes</th><th>D&#237;as</th><th style="color:var(--c-blue)">Base</th><th style="color:var(--c-orange)">IVA</th><th style="color:var(--c-red)">IRPF</th><th style="color:var(--c-green)">Cobrado</th></tr></thead><tbody>';
  var totD=0;
  e.months.forEach(function(mo){
    totD+=mo.dias;
    h+='<tr><td>'+MN_SHORT[mo.m]+'</td><td>'+mo.dias+'d</td>';
    h+='<td class="col-base">'+fc(mo.base)+'</td>';
    h+='<td class="col-iva">'+fc(mo.iva)+'</td>';
    h+='<td class="col-irpf">'+fc(mo.irpf)+'</td>';
    h+='<td class="col-net">'+fc(mo.cobrado)+'</td></tr>';
  });
  h+='<tr class="econ-tr-total"><td>Total</td><td>'+totD+'d</td>';
  h+='<td class="col-base">'+fc(e.totBase)+'</td>';
  h+='<td class="col-iva">'+fc(e.totIva)+'</td>';
  h+='<td class="col-irpf">'+fc(e.totIrpf)+'</td>';
  h+='<td class="col-net">'+fc(e.totCobrado)+'</td></tr>';
  h+='</tbody></table></div></div>';

  h+='</div>';
  return h;
}

function openEcon(){
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
  document.getElementById('ecBack').addEventListener('click',closeEcon);
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
}

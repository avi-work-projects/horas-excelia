/* ============================================================
   ECONOMICS SIM — Tab 4: Calcular Tarifa (calculadora inversa)
   ============================================================ */

var SIM_TARGET='';
var SIM_PERIOD='annual';   // 'annual' | 'monthly'
var SIM_HOURS_MODE='real'; // 'real' | '8h'
var SIM_NET_MODE='irpf15'; // 'irpf15' | 'ccss' | 'decl'
var SIM_RESULT=null;

/* ── Render Tab ─────────────────────────────────────────────── */
function renderEconSim(){
  var h='';

  /* Tarjeta de configuración */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Calcular Tarifa</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:14px">Calcula la tarifa diaria necesaria para alcanzar un neto objetivo determinado.</div>';

  /* Neto objetivo — input con suffix .000€ */
  h+='<div class="sim-field-group">';
  h+='<div class="sim-field-label">Neto objetivo</div>';
  h+='<div class="sim-target-row">';
  h+='<div class="sim-target-input-wrap">';
  h+='<input class="sim-target-input" id="simTarget" type="text" inputmode="numeric" placeholder="25" value="'+(SIM_TARGET?Math.round(SIM_TARGET/1000):'')+'" autocomplete="off">';
  h+='<span class="sim-target-suffix">.000&nbsp;&#8364;</span>';
  h+='</div></div></div>';

  /* Período */
  h+='<div class="sim-field-group" style="margin-top:12px">';
  h+='<div class="sim-field-label">Per&#237;odo</div>';
  h+='<div class="econ-opt-row" id="simPeriod">';
  h+='<button class="econ-opt-btn'+(SIM_PERIOD==='annual'?' active':'')+'" data-val="annual" data-opt="simPeriod">Anual</button>';
  h+='<button class="econ-opt-btn'+(SIM_PERIOD==='monthly'?' active':'')+'" data-val="monthly" data-opt="simPeriod">Mensual</button>';
  h+='</div></div>';

  /* Modo de horas */
  h+='<div class="sim-field-group" style="margin-top:12px">';
  h+='<div class="sim-field-label">Modo de horas</div>';
  h+='<div class="econ-opt-row" id="simHoursMode">';
  h+='<button class="econ-opt-btn'+(SIM_HOURS_MODE==='real'?' active':'')+'" data-val="real" data-opt="simHoursMode">Horas reales</button>';
  h+='<button class="econ-opt-btn'+(SIM_HOURS_MODE==='8h'?' active':'')+'" data-val="8h" data-opt="simHoursMode">8h fijas</button>';
  h+='</div></div>';

  /* Definición de "Neto" */
  h+='<div class="sim-field-group" style="margin-top:12px">';
  h+='<div class="sim-field-label">El neto objetivo es&hellip;</div>';
  h+='<div class="econ-opt-row" id="simNetMode">';
  h+='<button class="econ-opt-btn'+(SIM_NET_MODE==='irpf15'?' active':'')+'" data-val="irpf15" data-opt="simNetMode">Base \u2212 15% IRPF</button>';
  h+='<button class="econ-opt-btn'+(SIM_NET_MODE==='ccss'?' active':'')+'" data-val="ccss" data-opt="simNetMode">Base \u2212 15% IRPF \u2212 CCSS</button>';
  h+='<button class="econ-opt-btn'+(SIM_NET_MODE==='decl'?' active':'')+'" data-val="decl" data-opt="simNetMode">Neto tras Dec. Renta</button>';
  h+='</div></div>';

  h+='<button class="econ-calc-btn" id="simCalc" style="margin-top:16px">Calcular tarifa</button>';
  h+='</div>';

  /* Resultado */
  if(SIM_RESULT){
    var r=SIM_RESULT;
    var cotAnual=typeof gastoAnual==='function'?gastoAnual('cot_social'):0;
    var gdPct=typeof GASTOS_DIFICIL_PCT!=='undefined'?GASTOS_DIFICIL_PCT:5;
    var baseDecl=Math.max(0,Math.round((r.totBase*(1-gdPct/100))*100)/100);
    var decl=computeIrpfBrackets(baseDecl);
    var declDiff=Math.round((decl.totalTax-r.totIrpf)*100)/100;
    var netoCCSS=Math.round((r.netoReal-cotAnual)*100)/100;
    var netoDecl=Math.round((r.netoReal-cotAnual-declDiff)*100)/100;
    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">Resultado</div>';
    h+='<div class="econ-sim-result">';
    h+='<div class="econ-decl-row econ-sim-main-rate"><span>Tarifa diaria necesaria</span><span class="econ-val" style="color:var(--accent-bright);font-size:1.1em;font-weight:700">'+fc(r.dailyRate)+'/d&#237;a</span></div>';
    h+='<div class="econ-decl-row"><span>Equivalente por hora</span><span class="econ-val" style="color:var(--c-blue)">'+fc(r.hourlyRate)+'/hora</span></div>';
    h+='<hr class="sim-hr">';
    h+='<div class="econ-decl-row"><span>Base imponible</span><span class="econ-val col-base">'+fc(r.totBase)+'</span></div>';
    h+='<div class="econ-decl-row"><span>IVA generado (21%)</span><span class="econ-val col-iva">'+fc(r.totIva)+'</span></div>';
    h+='<div class="econ-decl-row"><span>IRPF retenido ('+r.irpfPct+'%)</span><span class="econ-val col-irpf">'+fc(r.totIrpf)+'</span></div>';
    h+='<div class="econ-decl-row" style="font-weight:600"><span>Base \u2212 15% IRPF</span><span class="econ-val col-net">'+fc(r.netoReal)+'</span></div>';
    if(cotAnual>0){
      h+='<div class="econ-decl-row" style="opacity:.75"><span>Cuota Aut\u00f3nomos</span><span class="econ-val" style="color:#c084fc">&minus;'+fc(cotAnual)+'</span></div>';
      h+='<div class="econ-decl-row" style="font-weight:600"><span>Base \u2212 15% IRPF \u2212 CCSS</span><span class="econ-val col-net">'+fc(netoCCSS)+'</span></div>';
    }
    if(declDiff!==0){
      var declLbl=declDiff>0?'IRPF Dec. Renta (a pagar)':'Devoluci\u00f3n IRPF Dec.';
      var declColor=declDiff>0?'var(--c-red)':'var(--c-green)';
      h+='<div class="econ-decl-row" style="opacity:.75"><span>'+declLbl+'</span><span class="econ-val" style="color:'+declColor+'">'+(declDiff>0?'&minus;':'+')+(fc(Math.abs(declDiff)))+'</span></div>';
      h+='<div class="econ-decl-row" style="font-weight:600"><span>Neto tras Dec. Renta</span><span class="econ-val" style="color:var(--accent-bright)">'+fc(cotAnual>0?netoDecl:(Math.round((r.netoReal-declDiff)*100)/100))+'</span></div>';
    }
    h+='<hr class="sim-hr">';
    h+='<div class="econ-decl-row"><span>D&#237;as trabajados</span><span class="econ-val">'+r.totalDays+'d</span></div>';
    h+='<div class="econ-decl-row"><span>Horas trabajadas</span><span class="econ-val">'+r.totalHours.toFixed(1)+'h</span></div>';
    h+='</div></div>';
  }

  return h;
}

function bindEconSimEvents(){
  /* Opt-btn rows: período, horas y net mode */
  ['simPeriod','simHoursMode','simNetMode'].forEach(function(rowId){
    document.querySelectorAll('#'+rowId+' .econ-opt-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        var val=btn.dataset.val;
        if(rowId==='simPeriod')SIM_PERIOD=val;
        else if(rowId==='simHoursMode')SIM_HOURS_MODE=val;
        else SIM_NET_MODE=val;
        document.querySelectorAll('#'+rowId+' .econ-opt-btn').forEach(function(b){b.classList.toggle('active',b.dataset.val===val);});
      });
    });
  });

  /* Input: separador de miles (sin los .000 del suffix) */
  var targetEl=document.getElementById('simTarget');
  if(targetEl){
    targetEl.addEventListener('input',function(){
      var raw=this.value.replace(/[^\d]/g,'');
      if(!raw){this.value='';return;}
      var n=parseInt(raw,10);
      if(isNaN(n)){this.value='';return;}
      // Separador de miles solo si >999
      this.value=n>999?String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.'):String(n);
    });
    targetEl.addEventListener('blur',function(){
      /* Al salir, si vacío dejar vacío */
    });
  }

  var calcBtn=document.getElementById('simCalc');
  if(!calcBtn)return;
  calcBtn.addEventListener('click',function(){
    var targetEl=document.getElementById('simTarget');
    var rawVal=(targetEl?targetEl.value:'').replace(/\./g,'');
    var thousandsVal=parseFloat(rawVal);
    if(!thousandsVal||thousandsVal<=0){showToast('Introduce un neto objetivo v\u00e1lido','error');return;}

    SIM_TARGET=thousandsVal*1000; // el input es en miles
    var period=SIM_PERIOD;
    var hoursMode=SIM_HOURS_MODE;

    var netObjective=period==='monthly'?SIM_TARGET*12:SIM_TARGET;
    var irpfPct=getIrpfPct();

    var s=computeYearlySummary(ECON_YEAR);
    var totalDays=0;
    for(var m=0;m<12;m++)totalDays+=s.mDays[m]+s.mDaysP[m];
    if(totalDays===0){showToast('No hay d\u00edas trabajados en '+ECON_YEAR,'error');return;}

    /* Ajustar el neto objetivo según el modo */
    var cotAnual=typeof gastoAnual==='function'?gastoAnual('cot_social'):0;
    var netForCalc=netObjective;
    if(SIM_NET_MODE==='ccss')netForCalc=netObjective+cotAnual;
    else if(SIM_NET_MODE==='decl'){
      /* Aproximación: calculamos el declDiff con la tarifa base IRPF=15% primero */
      var approxBase=netObjective/(1-irpfPct/100);
      var gdPct=typeof GASTOS_DIFICIL_PCT!=='undefined'?GASTOS_DIFICIL_PCT:5;
      var approxBaseDecl=Math.max(0,approxBase*(1-gdPct/100));
      var approxDecl=computeIrpfBrackets(approxBaseDecl);
      var approxDiff=Math.round((approxDecl.totalTax-approxBase*irpfPct/100)*100)/100;
      netForCalc=netObjective+cotAnual+Math.max(0,approxDiff);
    }

    /* Fórmula inversa: netoReal = dailyRate × totalDays × (1 - irpfPct/100) */
    var requiredDailyRate=Math.round(netForCalc/(totalDays*(1-irpfPct/100))*100)/100;
    SIM_RESULT=computeEconEx(ECON_YEAR,{rateType:'daily',rateValue:requiredDailyRate,hoursMode:hoursMode});
    reRenderEcon();
  });
}

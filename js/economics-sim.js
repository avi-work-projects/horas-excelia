/* ============================================================
   ECONOMICS SIM — Tab 4: Calcular Tarifa (calculadora inversa)
   ============================================================ */

var SIM_TARGET=40000;
var SIM_PERIOD='annual';   // 'annual' | 'monthly'
var SIM_NET_MODE='irpf15'; // 'base' | 'irpf15' | 'ccss' | 'decl'
var SIM_RESULT=null;
var SIM_RESULT_SAL=null;

/* ── Compute all rate combinations ───────────────────────── */
function _simComputeAll(){
  var irpfPct=getIrpfPct();
  var s=computeYearlySummary(ECON_YEAR);
  var totalDays=0;
  for(var m=0;m<12;m++)totalDays+=s.mDays[m]+s.mDaysP[m];
  if(totalDays===0)return null;

  var netObjective=SIM_PERIOD==='monthly'?SIM_TARGET*12:SIM_TARGET;
  var cotAnual=typeof gastoAnual==='function'?gastoAnual('cot_social'):0;
  var netForCalc=netObjective;

  if(SIM_NET_MODE==='base'){
    var reqRate=Math.round(netObjective/totalDays*100)/100;
    var eReal=computeEconEx(ECON_YEAR,{rateType:'daily',rateValue:reqRate,hoursMode:'real'});
    var e8h=computeEconEx(ECON_YEAR,{rateType:'daily',rateValue:reqRate,hoursMode:'8h'});
    /* Nómina: brutAnual = netObjective (la base IS the target) */
    return{eReal:eReal,e8h:e8h,salBrut:netObjective};
  } else if(SIM_NET_MODE==='ccss'){
    netForCalc=netObjective+cotAnual;
  } else if(SIM_NET_MODE==='decl'){
    var approxBase=netObjective/(1-irpfPct/100);
    var gdPct=typeof GASTOS_DIFICIL_PCT!=='undefined'?GASTOS_DIFICIL_PCT:5;
    var approxBaseDecl=Math.max(0,approxBase*(1-gdPct/100));
    var approxDecl=computeIrpfBrackets(approxBaseDecl);
    var approxDiff=Math.round((approxDecl.totalTax-approxBase*irpfPct/100)*100)/100;
    netForCalc=netObjective+cotAnual+Math.max(0,approxDiff);
  }

  var reqDailyRate=Math.round(netForCalc/(totalDays*(1-irpfPct/100))*100)/100;
  var eReal=computeEconEx(ECON_YEAR,{rateType:'daily',rateValue:reqDailyRate,hoursMode:'real'});
  var e8h=computeEconEx(ECON_YEAR,{rateType:'daily',rateValue:reqDailyRate,hoursMode:'8h'});

  /* Nómina inversa: buscar bruto anual que dé el neto objetivo (bisección) */
  var salBrut=_inverseSalary(netObjective);

  return{eReal:eReal,e8h:e8h,salBrut:salBrut};
}

function _inverseSalary(netoTarget){
  /* Bisección: encontrar brutAnual tal que computeSalaryNet(brut).netoAnual ≈ netoTarget */
  var lo=netoTarget*0.8,hi=netoTarget*3;
  for(var iter=0;iter<50;iter++){
    var mid=(lo+hi)/2;
    var res=computeSalaryNet(mid);
    if(Math.abs(res.netoAnual-netoTarget)<1)return Math.round(mid);
    if(res.netoAnual<netoTarget)lo=mid;
    else hi=mid;
  }
  return Math.round((lo+hi)/2);
}

/* ── Render Tab ─────────────────────────────────────────────── */
function renderEconSim(){
  var h='';

  /* Resultado (output primero) */
  var res=SIM_TARGET>0?_simComputeAll():null;
  if(res){
    var eR=res.eReal;
    var e8=res.e8h;
    var cotAnual=typeof gastoAnual==='function'?gastoAnual('cot_social'):0;
    var sal=computeSalaryNet(res.salBrut);

    var netoLabel=SIM_NET_MODE==='base'?'Base imponible':SIM_NET_MODE==='irpf15'?'Base \u2212 15% IRPF':SIM_NET_MODE==='ccss'?'Base \u2212 IRPF \u2212 CCSS':'Neto tras Dec. Renta';
    var netoVal=SIM_PERIOD==='monthly'?SIM_TARGET:SIM_TARGET;
    var netoFmt=SIM_PERIOD==='monthly'?fcPlain(SIM_TARGET)+'/mes':fcPlain(SIM_TARGET)+'/a\u00f1o';

    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">Para obtener '+netoFmt+' de '+netoLabel+':</div>';

    /* Tabla resumen de todas las combinaciones */
    h+='<div style="overflow-x:auto"><table class="econ-stats-table sim-combo-table"><thead><tr>';
    h+='<th>Modalidad</th><th>Tarifa</th><th>Base anual</th><th>Neto anual</th>';
    h+='</tr></thead><tbody>';

    /* Fila: Tarifa por día */
    h+='<tr class="sim-combo-highlight"><td>Tarifa / d\u00eda</td>';
    h+='<td class="sim-combo-rate">'+fc(eR.dailyRate)+'/d</td>';
    h+='<td>'+fc(eR.totBase)+'</td>';
    h+='<td class="col-net">'+fc(eR.netoReal)+'</td></tr>';

    /* Fila: Tarifa por hora (horas reales) */
    h+='<tr><td>Tarifa / hora real</td>';
    h+='<td class="sim-combo-rate">'+fc(eR.hourlyRate)+'/h</td>';
    h+='<td>'+fc(eR.totBase)+'</td>';
    h+='<td class="col-net">'+fc(eR.netoReal)+'</td></tr>';

    /* Fila: Tarifa por hora (8h fijas) */
    var hourly8h=e8.totalHours>0?Math.round(e8.totBase/e8.totalHours*100)/100:0;
    h+='<tr><td>Tarifa / hora (8h fijas)</td>';
    h+='<td class="sim-combo-rate">'+fc(hourly8h)+'/h</td>';
    h+='<td>'+fc(e8.totBase)+'</td>';
    h+='<td class="col-net">'+fc(e8.netoReal)+'</td></tr>';

    /* Fila: Nómina */
    h+='<tr style="border-top:2px solid var(--border)"><td>N\u00f3mina asalariado</td>';
    h+='<td class="sim-combo-rate">'+fc(res.salBrut)+'/a\u00f1o</td>';
    h+='<td>\u2014</td>';
    h+='<td class="col-net">'+fc(sal.netoAnual)+'</td></tr>';
    h+='<tr style="opacity:.7"><td style="padding-left:16px">Neto mensual (12p)</td>';
    h+='<td></td><td></td>';
    h+='<td class="col-net">'+fc(sal.netoMensual12)+'</td></tr>';
    h+='<tr style="opacity:.7"><td style="padding-left:16px">Neto mensual (14p)</td>';
    h+='<td></td><td></td>';
    h+='<td class="col-net">'+fc(sal.netoMensual)+'</td></tr>';

    h+='</tbody></table></div>';

    /* Info adicional */
    h+='<div style="font-size:.68rem;color:var(--text-dim);margin-top:6px">';
    h+=eR.totalDays+'d trabajados \u00b7 '+eR.totalHours.toFixed(1)+'h reales \u00b7 Media '+eR.avgHDay.toFixed(1)+'h/d';
    if(cotAnual>0)h+=' \u00b7 CCSS: '+fcPlain(cotAnual);
    h+='</div>';
    h+='</div>';
  }

  /* Tarjeta de configuración */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Calcular Tarifa</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:14px">Calcula qu\u00e9 tarifa necesitas para alcanzar un neto objetivo.</div>';

  /* Neto objetivo */
  h+='<div class="sim-field-group">';
  h+='<div class="sim-field-label">Neto objetivo</div>';
  h+='<div class="sim-target-row">';
  h+='<div class="sim-target-input-wrap">';
  h+='<input class="sim-target-input" id="simTarget" type="text" inputmode="numeric" placeholder="40" value="'+(SIM_TARGET?Math.round(SIM_TARGET/1000):'')+'" autocomplete="off">';
  h+='<span class="sim-target-suffix">.000&nbsp;&#8364;</span>';
  h+='</div></div></div>';

  /* Período */
  h+='<div class="sim-field-group" style="margin-top:12px">';
  h+='<div class="sim-field-label">Per&#237;odo</div>';
  h+='<div class="econ-opt-row" id="simPeriod">';
  h+='<button class="econ-opt-btn'+(SIM_PERIOD==='annual'?' active':'')+'" data-val="annual" data-opt="simPeriod">Anual</button>';
  h+='<button class="econ-opt-btn'+(SIM_PERIOD==='monthly'?' active':'')+'" data-val="monthly" data-opt="simPeriod">Mensual</button>';
  h+='</div></div>';

  /* Definición de "Neto" */
  h+='<div class="sim-field-group" style="margin-top:12px">';
  h+='<div class="sim-field-label">El neto objetivo es&hellip;</div>';
  h+='<div class="econ-opt-row multiline" id="simNetMode">';
  h+='<button class="econ-opt-btn'+(SIM_NET_MODE==='base'?' active':'')+'" data-val="base" data-opt="simNetMode">Base</button>';
  h+='<button class="econ-opt-btn'+(SIM_NET_MODE==='irpf15'?' active':'')+'" data-val="irpf15" data-opt="simNetMode">Base<br>\u2212 15% IRPF</button>';
  h+='<button class="econ-opt-btn'+(SIM_NET_MODE==='ccss'?' active':'')+'" data-val="ccss" data-opt="simNetMode">Base<br>\u2212 15% IRPF<br>\u2212 CCSS</button>';
  h+='<button class="econ-opt-btn'+(SIM_NET_MODE==='decl'?' active':'')+'" data-val="decl" data-opt="simNetMode">Neto tras<br>Dec. Renta</button>';
  h+='</div></div>';

  h+='<button class="econ-calc-btn" id="simCalc" style="margin-top:16px">Calcular tarifa</button>';
  h+='</div>';

  return h;
}

function bindEconSimEvents(){
  /* Opt-btn rows: período y net mode */
  ['simPeriod','simNetMode'].forEach(function(rowId){
    document.querySelectorAll('#'+rowId+' .econ-opt-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        var val=btn.dataset.val;
        if(rowId==='simPeriod')SIM_PERIOD=val;
        else SIM_NET_MODE=val;
        document.querySelectorAll('#'+rowId+' .econ-opt-btn').forEach(function(b){b.classList.toggle('active',b.dataset.val===val);});
      });
    });
  });

  /* Input: separador de miles */
  var targetEl=document.getElementById('simTarget');
  if(targetEl){
    targetEl.addEventListener('input',function(){
      var raw=this.value.replace(/[^\d]/g,'');
      if(!raw){this.value='';return;}
      var n=parseInt(raw,10);
      if(isNaN(n)){this.value='';return;}
      this.value=n>999?String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.'):String(n);
    });
  }

  var calcBtn=document.getElementById('simCalc');
  if(!calcBtn)return;
  calcBtn.addEventListener('click',function(){
    var targetEl=document.getElementById('simTarget');
    var rawVal=(targetEl?targetEl.value:'').replace(/\./g,'');
    var thousandsVal=parseFloat(rawVal);
    if(!thousandsVal||thousandsVal<=0){showToast('Introduce un neto objetivo v\u00e1lido','error');return;}

    SIM_TARGET=thousandsVal*1000;
    _estudioReRender();
  });
}

/* ============================================================
   ECONOMICS SIM — Tab 3: Simulador (calculadora inversa)
   ============================================================ */

var SIM_TARGET='';
var SIM_PERIOD='annual';   // 'annual' | 'monthly'
var SIM_HOURS_MODE='real'; // 'real' | '8h'
var SIM_RESULT=null;

/* ── Render Tab 3 ─────────────────────────────────────────────── */
function renderEconSim(){
  var h='';
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Simulador &#8212; Tarifa objetivo</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:12px">Calcula la tarifa necesaria para alcanzar un neto determinado.</div>';

  h+='<div class="econ-sim-row">';
  h+='<label class="econ-sim-label">Neto objetivo</label>';
  h+='<div class="econ-sim-input-wrap">';
  h+='<input class="econ-sim-input" id="simTarget" type="number" min="1" step="100" placeholder="p.ej. 25000" value="'+(SIM_TARGET||'')+'">';
  h+='<select class="econ-sim-select" id="simPeriod">';
  h+='<option value="annual"'+(SIM_PERIOD==='annual'?' selected':'')+'>Anual</option>';
  h+='<option value="monthly"'+(SIM_PERIOD==='monthly'?' selected':'')+'>Mensual</option>';
  h+='</select>';
  h+='</div></div>';

  h+='<div class="econ-sim-row" style="margin-top:10px">';
  h+='<label class="econ-sim-label">Modo de horas</label>';
  h+='<select class="econ-sim-select" id="simHoursMode">';
  h+='<option value="real"'+(SIM_HOURS_MODE==='real'?' selected':'')+'>Horas reales del calendario</option>';
  h+='<option value="8h"'+(SIM_HOURS_MODE==='8h'?' selected':'')+'>8h fijas por d&#237;a</option>';
  h+='</select></div>';

  h+='<button class="fiscal-save-btn" id="simCalc" style="margin-top:14px">Calcular</button>';

  if(SIM_RESULT){
    var r=SIM_RESULT;
    h+='<div class="econ-sim-result">';
    h+='<div class="econ-sim-res-title">Resultado</div>';
    h+='<div class="econ-decl-row"><span>Tarifa diaria necesaria:</span><span class="econ-val" style="color:var(--accent-bright);font-size:1.05em;font-weight:700">'+fc(r.dailyRate)+'/d&#237;a</span></div>';
    h+='<div class="econ-decl-row"><span>Equivalente por hora:</span><span class="econ-val" style="color:var(--c-blue)">'+fc(r.hourlyRate)+'/hora</span></div>';
    h+='<hr style="border:none;border-top:1px solid var(--border);margin:8px 0">';
    h+='<div class="econ-decl-row"><span>Base imponible:</span><span class="econ-val col-base">'+fc(r.totBase)+'</span></div>';
    h+='<div class="econ-decl-row"><span>IVA generado (21%):</span><span class="econ-val col-iva">'+fc(r.totIva)+'</span></div>';
    h+='<div class="econ-decl-row"><span>IRPF retenido ('+r.irpfPct+'%):</span><span class="econ-val col-irpf">'+fc(r.totIrpf)+'</span></div>';
    h+='<div class="econ-decl-row" style="font-weight:600;margin-top:4px"><span>Neto efectivo:</span><span class="econ-val col-net" style="font-size:1em">'+fc(r.netoReal)+'</span></div>';
    h+='<hr style="border:none;border-top:1px solid var(--border);margin:8px 0">';
    h+='<div class="econ-decl-row"><span>D&#237;as trabajados:</span><span class="econ-val">'+r.totalDays+'d</span></div>';
    h+='<div class="econ-decl-row"><span>Horas trabajadas ('+SIM_HOURS_MODE+'):</span><span class="econ-val">'+r.totalHours.toFixed(1)+'h</span></div>';
    h+='</div>';
  }

  h+='</div>';
  return h;
}

function bindEconSimEvents(){
  var periodSel=document.getElementById('simPeriod');
  var hoursSel=document.getElementById('simHoursMode');
  if(periodSel)periodSel.addEventListener('change',function(){SIM_PERIOD=this.value;});
  if(hoursSel)hoursSel.addEventListener('change',function(){SIM_HOURS_MODE=this.value;});

  var calcBtn=document.getElementById('simCalc');
  if(!calcBtn)return;
  calcBtn.addEventListener('click',function(){
    var targetEl=document.getElementById('simTarget');
    var target=parseFloat(targetEl?targetEl.value:'');
    if(!target||target<=0){showToast('Introduce un neto objetivo v\u00e1lido','error');return;}

    SIM_TARGET=target;
    var period=document.getElementById('simPeriod').value;
    SIM_PERIOD=period;
    var hoursMode=document.getElementById('simHoursMode').value;
    SIM_HOURS_MODE=hoursMode;

    var netObjective=period==='monthly'?target*12:target;
    var irpfPct=getIrpfPct();

    // Calcular días totales del año
    var s=computeYearlySummary(ECON_YEAR);
    var totalDays=0;
    for(var m=0;m<12;m++)totalDays+=s.mDays[m]+s.mDaysP[m];
    if(totalDays===0){showToast('No hay d\u00edas trabajados en '+ECON_YEAR,'error');return;}

    // Fórmula inversa: netoReal = dailyRate × totalDays × (1 - irpfPct/100)
    var requiredDailyRate=Math.round(netObjective/(totalDays*(1-irpfPct/100))*100)/100;
    SIM_RESULT=computeEconEx(ECON_YEAR,{rateType:'daily',rateValue:requiredDailyRate,hoursMode:hoursMode});
    reRenderEcon();
  });
}

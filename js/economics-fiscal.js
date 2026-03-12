/* ============================================================
   ECONOMICS FISCAL — Configuración fiscal (IRPF + tramos)
   ============================================================ */

var FISCAL_SK='excelia-fiscal-v1';
var DEFAULT_BRACKETS=[
  {from:0,to:12450,pct:19},
  {from:12450,to:20200,pct:24},
  {from:20200,to:35200,pct:30},
  {from:35200,to:60000,pct:37},
  {from:60000,to:300000,pct:45},
  {from:300000,to:Infinity,pct:47}
];
var FISCAL={
  irpfMode:'fixed',   // 'fixed' | 'custom'
  irpfPct:15,
  brackets:null       // null = usa DEFAULT_BRACKETS
};

function loadFiscal(){
  try{
    var r=localStorage.getItem(FISCAL_SK);
    if(r){var d=JSON.parse(r);FISCAL.irpfMode=d.irpfMode||'fixed';FISCAL.irpfPct=d.irpfPct||15;FISCAL.brackets=d.brackets||null;}
  }catch(e){/* defaults */}
}
function saveFiscal(){
  localStorage.setItem(FISCAL_SK,JSON.stringify({irpfMode:FISCAL.irpfMode,irpfPct:FISCAL.irpfPct,brackets:FISCAL.brackets}));
}
function getIrpfPct(){
  return FISCAL.irpfMode==='custom'?FISCAL.irpfPct:15;
}
function getBrackets(){
  return FISCAL.brackets||DEFAULT_BRACKETS;
}

/* ── Cálculo IRPF por tramos ──────────────────────────────── */
function computeIrpfBrackets(base){
  var brackets=getBrackets();
  var totalTax=0;
  var breakdown=[];
  for(var i=0;i<brackets.length;i++){
    var b=brackets[i];
    if(base<=b.from)break;
    var topLimit=(b.to===Infinity)?base:Math.min(base,b.to);
    var taxable=topLimit-b.from;
    var tax=Math.round(taxable*b.pct/100*100)/100;
    totalTax+=tax;
    breakdown.push({from:b.from,to:b.to,pct:b.pct,taxable:taxable,tax:tax,active:true});
  }
  return{totalTax:Math.round(totalTax*100)/100,breakdown:breakdown,effectivePct:base>0?Math.round(totalTax/base*10000)/100:0};
}

/* ── Render fiscal modal ──────────────────────────────────── */
function renderFiscalContent(){
  var brackets=getBrackets();
  var h=renderNavBar('econ');
  h+='<div class="sy-header with-tabs">';
  h+='<button class="sy-back" id="fiscalBack">&#8592;</button>';
  h+='<div class="sy-year" style="font-size:.95rem">&#9881;&#65039; Configuraci\u00f3n Fiscal</div>';
  h+='</div>';
  h+='<div class="sy-body" style="padding:16px">';

  // § Retención IRPF
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Retenci\u00f3n IRPF (en facturas)</div>';
  h+='<div class="fiscal-radio-row">';
  h+='<div class="fiscal-radio-item'+(FISCAL.irpfMode==='fixed'?' active':'')+'" id="fiscalRadioFixed">';
  h+='<div class="fiscal-radio-dot'+(FISCAL.irpfMode==='fixed'?' on':'')+'"></div>';
  h+='<span>Fijo al <b>15%</b> (por defecto)</span></div>';
  h+='<div class="fiscal-radio-item'+(FISCAL.irpfMode==='custom'?' active':'')+'" id="fiscalRadioCustom">';
  h+='<div class="fiscal-radio-dot'+(FISCAL.irpfMode==='custom'?' on':'')+'"></div>';
  h+='<span>Personalizado (debe ser &gt;15%)</span></div>';
  h+='</div>';
  h+='<div class="fiscal-custom-row" id="fiscalCustomRow" style="'+(FISCAL.irpfMode==='custom'?'':'display:none')+'">';
  h+='<label style="font-size:.8rem;color:var(--text-muted)">Tipo de retenci\u00f3n:</label>';
  h+='<input class="fiscal-pct-input" id="fiscalPctInput" type="number" min="15.01" max="50" step="0.1" value="'+(FISCAL.irpfMode==='custom'?FISCAL.irpfPct:21)+'">';
  h+='<span style="font-size:.8rem;color:var(--text-muted)">%</span>';
  h+='<span class="fiscal-error" id="fiscalPctError" style="display:none">Debe ser &gt; 15%</span>';
  h+='</div></div>';

  // § Tramos declaración IRPF
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Tramos IRPF — Declaraci\u00f3n de la renta</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Usados para el c\u00e1lculo de la declaraci\u00f3n. Edita o usa los tramos estatales 2025 por defecto.</div>';
  h+='<div style="overflow-x:auto"><table class="fiscal-bracket-table" id="fiscalBracketTable">';
  h+='<thead><tr><th style="text-align:left">Desde (&#8364;)</th><th>Hasta (&#8364;)</th><th>Tipo (%)</th><th></th></tr></thead><tbody>';
  for(var i=0;i<brackets.length;i++){
    var b=brackets[i];
    h+='<tr data-bi="'+i+'">';
    h+='<td><input class="fiscal-bracket-input fbi-from" data-bi="'+i+'" type="number" min="0" value="'+b.from+'"></td>';
    h+='<td><input class="fiscal-bracket-input fbi-to" data-bi="'+i+'" type="number" min="0" value="'+(b.to===Infinity?'':b.to)+'"></td>';
    h+='<td><input class="fiscal-bracket-input fiscal-pct-small fbi-pct" data-bi="'+i+'" type="number" min="0" max="100" step="0.1" value="'+b.pct+'"></td>';
    h+='<td><button class="fiscal-bracket-del fbi-del" data-bi="'+i+'">&#10005;</button></td>';
    h+='</tr>';
  }
  h+='</tbody></table></div>';
  h+='<button class="fiscal-add-btn" id="fiscalAddBracket">+ A\u00f1adir tramo</button>';
  h+='</div>';

  // Botón restaurar defaults + guardar
  h+='<button class="econ-toggle-btn" id="fiscalRestore" style="margin-bottom:8px;color:var(--text-muted)">';
  h+='&#8635; Restaurar tramos 2025 por defecto</button>';
  h+='<button class="fiscal-save-btn" id="fiscalSave">Guardar configuraci\u00f3n</button>';
  h+='</div>';
  return h;
}

function openFiscal(){
  var ov=document.getElementById('fiscalOverlay');
  document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    ov.classList.add('open');
    bindFiscalEvents();
  });});
}
function closeFiscal(){
  var ov=document.getElementById('fiscalOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}

function bindFiscalEvents(){
  document.getElementById('fiscalBack').addEventListener('click',function(){closeFiscal();});
  bindNavBar('econ',closeFiscal);

  // Radio IRPF mode
  document.getElementById('fiscalRadioFixed').addEventListener('click',function(){
    FISCAL.irpfMode='fixed';
    document.getElementById('fiscalRadioFixed').classList.add('active');
    document.getElementById('fiscalRadioFixed').querySelector('.fiscal-radio-dot').classList.add('on');
    document.getElementById('fiscalRadioCustom').classList.remove('active');
    document.getElementById('fiscalRadioCustom').querySelector('.fiscal-radio-dot').classList.remove('on');
    document.getElementById('fiscalCustomRow').style.display='none';
  });
  document.getElementById('fiscalRadioCustom').addEventListener('click',function(){
    FISCAL.irpfMode='custom';
    document.getElementById('fiscalRadioCustom').classList.add('active');
    document.getElementById('fiscalRadioCustom').querySelector('.fiscal-radio-dot').classList.add('on');
    document.getElementById('fiscalRadioFixed').classList.remove('active');
    document.getElementById('fiscalRadioFixed').querySelector('.fiscal-radio-dot').classList.remove('on');
    document.getElementById('fiscalCustomRow').style.display='flex';
  });

  // Restaurar defaults
  document.getElementById('fiscalRestore').addEventListener('click',function(){
    FISCAL.brackets=null;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });

  // Añadir tramo
  document.getElementById('fiscalAddBracket').addEventListener('click',function(){
    var brackets=getBrackets().slice(); // copia
    var last=brackets[brackets.length-1];
    var newFrom=last.to===Infinity?300000:last.to;
    brackets.push({from:newFrom,to:Infinity,pct:47});
    FISCAL.brackets=brackets;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });

  // Eliminar tramos (event delegation)
  document.querySelectorAll('.fbi-del').forEach(function(btn){
    btn.addEventListener('click',function(){
      var bi=parseInt(this.dataset.bi,10);
      var brackets=getBrackets().slice();
      if(brackets.length<=1){showToast('Debe haber al menos 1 tramo','error');return;}
      brackets.splice(bi,1);
      FISCAL.brackets=brackets;
      document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
      bindFiscalEvents();
    });
  });

  // Guardar
  document.getElementById('fiscalSave').addEventListener('click',function(){
    // Validar IRPF personalizado
    if(FISCAL.irpfMode==='custom'){
      var pctEl=document.getElementById('fiscalPctInput');
      var pct=parseFloat(pctEl.value);
      if(isNaN(pct)||pct<=15){
        document.getElementById('fiscalPctError').style.display='';
        showToast('El IRPF personalizado debe ser mayor al 15%','error');
        return;
      }
      FISCAL.irpfPct=Math.round(pct*100)/100;
    }
    // Leer tramos del DOM
    var rows=document.querySelectorAll('#fiscalBracketTable tbody tr');
    var brackets=[];
    var valid=true;
    rows.forEach(function(row){
      var fromV=parseFloat(row.querySelector('.fbi-from').value)||0;
      var toRaw=row.querySelector('.fbi-to').value;
      var toV=toRaw===''?Infinity:parseFloat(toRaw)||0;
      var pct=parseFloat(row.querySelector('.fbi-pct').value)||0;
      brackets.push({from:fromV,to:toV,pct:pct});
    });
    if(!valid||brackets.length===0){showToast('Tramos inv\u00e1lidos','error');return;}
    FISCAL.brackets=brackets;
    saveFiscal();
    showToast('Configuraci\u00f3n guardada','success');
    closeFiscal();
    // Refrescar ventana económica si está abierta
    var ec=document.getElementById('econContent');
    if(ec&&ec.innerHTML){ec.innerHTML=renderEconContent();bindEconEvents();}
  });
}

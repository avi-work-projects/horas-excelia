/* ============================================================
   ECONOMICS HELPERS — Helpers de UI compartidos entre módulos
   económicos (fiscal-hip, fiscal-elect, fiscal-gas, estudio,
   analisis, etc.). Cargado antes que todos ellos.
   ============================================================ */

/* ── Formato de miles estilo español (1234567 → "1.234.567") ── */
function _fmtMiles(n){
  if(!n||n===0)return '0';
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
}

/* ── Hip edit field helpers (formularios despacho/hipoteca) ── */
function _hipMoney(id,label,val){
  return '<div class="hip-cf"><label class="hip-cf-lbl">'+label+'</label>'
    +'<div class="hip-cf-row"><input class="fiscal-despacho-input" id="desp-'+id+'" type="number" min="0" step="1000" value="'+(val||0)+'"><span class="fiscal-despacho-unit">€</span></div>'
    +'<div class="fiscal-despacho-money-fmt" id="desp-fmt-'+id+'">'+(val&&val>0?_fmtMiles(val)+' €':'')+'</div></div>';
}
function _hipNum(id,label,val,unit){
  var step=unit==='%'?'0.05':'1';
  return '<div class="hip-cf"><label class="hip-cf-lbl">'+label+'</label>'
    +'<div class="hip-cf-row"><input class="fiscal-despacho-input" id="desp-'+id+'" type="number" min="0" step="'+step+'" value="'+(val||0)+'"><span class="fiscal-despacho-unit">'+unit+'</span></div></div>';
}
function _hipDate(id,label,val){
  return '<div class="hip-cf"><label class="hip-cf-lbl">'+label+'</label>'
    +'<div class="hip-cf-row"><input class="fiscal-despacho-input" id="desp-'+id+'" type="date" value="'+(val||'')+'"></div></div>';
}
function _hipText(id,label,val,ph){
  return '<div class="hip-cf hip-cf-wide"><label class="hip-cf-lbl">'+label+'</label>'
    +'<input class="fiscal-despacho-input" id="desp-'+id+'" type="text" value="'+escHtml(val||'')+'" placeholder="'+(ph||'')+'" style="text-align:left"></div>';
}
function _hipVinc(id,label,data){
  if(!data)data={enabled:false,costeAnual:0,reduccion:0};
  var isNom=id.indexOf('Nomina')!==-1;
  var h='<div class="hip-vr">';
  h+='<span class="hip-vr-lbl">'+label+'</span>';
  h+='<div class="hip-vr-right">';
  if(data.enabled){
    if(!isNom)h+='<input class="hip-vr-inp" id="'+id+'Coste" type="number" min="0" step="10" value="'+(data.costeAnual||0)+'" title="€/año">';
    h+='<input class="hip-vr-inp hip-vr-pct" id="'+id+'Reduccion" type="number" min="0" step="0.05" value="'+(data.reduccion||0)+'" title="− tipo %">';
  }
  h+='<div class="fiscal-onoff'+(data.enabled?' on':'')+'" id="'+id+'Toggle">'+(data.enabled?'ON':'OFF')+'</div>';
  h+='</div></div>';
  return h;
}
function _hipVincSum(vinc,tipoBase){
  var total=0,reduc=0;
  if(!vinc)return '';
  ['nomina','segHogar','segSalud','segVida'].forEach(function(k){if(vinc[k]&&vinc[k].enabled){total+=vinc[k].costeAnual||0;reduc+=vinc[k].reduccion||0;}});
  if(!total&&!reduc)return '';
  var h='<div class="hip-vinc-summary">';
  if(total>0)h+='Coste: <b style="color:var(--c-orange)">'+fcPlain(total)+'</b>/a';
  if(reduc>0){
    h+=(total>0?' · ':'')+'<b style="color:var(--c-green)">−'+reduc.toFixed(2)+'%</b>';
    if(tipoBase>0)h+=' → <b style="color:var(--c-green)">'+Math.max(0,tipoBase-reduc).toFixed(2)+'%</b>';
  }
  h+='</div>';
  return h;
}

/* ── Read-only helpers ─────────────────────────────────────── */
function _hipRO(label,val,unit){
  return '<div class="hip-ro-row"><span class="hip-ro-lbl">'+label+'</span><span class="hip-ro-val">'+(val!=null?val:'')+(unit?' '+unit:'')+'</span></div>';
}
function _hipROmoney(label,val){
  return _hipRO(label,val&&val>0?_fmtMiles(val)+' €':'—');
}

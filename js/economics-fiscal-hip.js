/* ============================================================
   FISCAL — Hipoteca detalle, compra, préstamo, subrogaciones
   ============================================================ */

var DESPACHO_SK='excelia-despacho-v1';
var DESPACHO={enabled:true,m2Total:0,m2Despacho:0,pct:0,valorCatastral:0,valorCompra:0,hipotecaIntereses:0,hipotecaInteresesManual:false,compra:null};

function _defaultCompra(){return{valorCompraTotal:0,itpMadrid:0,notariaRegistro:0,tasacion:0,reformas:0,inmobiliaria:0,importePrestamo:0,tipoInteres:0,plazoAnios:0,fechaInicio:null,entidadBanco:'',vinculaciones:{nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}},subrogaciones:[]};}
function _defaultSubrogacion(){return{fecha:null,comisionCancelacion:0,notaria:0,tasacion:0,registro:0,nuevoImporte:0,nuevoTipoInteres:0,nuevoPlazoAnios:0,entidadBanco:'',vinculaciones:null};}
function loadDespacho(){
  try{
    var r=localStorage.getItem(DESPACHO_SK);
    if(r){var d=JSON.parse(r);
      DESPACHO.enabled=d.enabled!=null?!!d.enabled:true;
      DESPACHO.m2Total=d.m2Total||0;DESPACHO.m2Despacho=d.m2Despacho||0;
      DESPACHO.pct=d.pct||0;
      DESPACHO.valorCatastral=d.valorCatastral||0;DESPACHO.valorCompra=d.valorCompra||0;
      DESPACHO.hipotecaIntereses=d.hipotecaIntereses||0;
      /* Migración: si no existe compra, crear con defaults y migrar valorCompra */
      if(d.compra){
        DESPACHO.compra=d.compra;
        /* Migrar campos nuevos v106 */
        if(!d.compra.fechaInicio&&d.compra.fechaInicio!==null)d.compra.fechaInicio=null;
        if(!d.compra.vinculaciones)d.compra.vinculaciones={nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}};
        else{var _vk=['nomina','segHogar','segSalud','segVida'];_vk.forEach(function(k){if(!d.compra.vinculaciones[k])d.compra.vinculaciones[k]={enabled:false,costeAnual:0,reduccion:0};else if(d.compra.vinculaciones[k].reduccion==null)d.compra.vinculaciones[k].reduccion=0;});}
        /* Migración v120→v121: subrogacion (single) → subrogaciones (array) */
        if(d.compra.subrogacion!==undefined){
          if(d.compra.subrogacion)d.compra.subrogaciones=[d.compra.subrogacion];
          else d.compra.subrogaciones=[];
          delete d.compra.subrogacion;
        }
        if(!Array.isArray(d.compra.subrogaciones))d.compra.subrogaciones=[];
      }
      else{DESPACHO.compra=_defaultCompra();if(DESPACHO.valorCompra>0)DESPACHO.compra.valorCompraTotal=DESPACHO.valorCompra;}
      DESPACHO.hipotecaInteresesManual=d.hipotecaInteresesManual||false;
      if(!d.deducciones)DESPACHO.deducciones={amortizacion:true,ibi:true,hipotecaInt:true,casa:true,suministros:true};
      else DESPACHO.deducciones=d.deducciones;
      /* Migración v123→v124: gas, electricidad, seguros normales */
      DESPACHO.gas=d.gas||{modo:'consumo',precioKwh:0,cuotaFija:0,terminoFijo:0,comercializadora:''};
      DESPACHO.elect=d.elect||{modoPotencia:'doble',potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:6.6,precioPotP1:0,precioPotP2:0,precioKwh:0,terminoFijo:0,comercializadora:''};
      DESPACHO.segurosNormales=d.segurosNormales||{segSalud:0,segVida:0,segHogar:0};
      DESPACHO.gasComparaciones=d.gasComparaciones||[];
      DESPACHO.electComparaciones=d.electComparaciones||[];
      /* Migrar ANALISIS_SEG_NORMAL a DESPACHO.segurosNormales */
      if(typeof ANALISIS_SEG_NORMAL!=='undefined'){
        var sn=DESPACHO.segurosNormales;
        if(!sn.segSalud&&ANALISIS_SEG_NORMAL.segSalud)sn.segSalud=ANALISIS_SEG_NORMAL.segSalud;
        if(!sn.segVida&&ANALISIS_SEG_NORMAL.segVida)sn.segVida=ANALISIS_SEG_NORMAL.segVida;
        if(!sn.segHogar&&ANALISIS_SEG_NORMAL.segHogar)sn.segHogar=ANALISIS_SEG_NORMAL.segHogar;
      }
    }else{
      DESPACHO.compra=_defaultCompra();
      DESPACHO.deducciones={amortizacion:true,ibi:true,hipotecaInt:true,casa:true,suministros:true};
      DESPACHO.gas={modo:'consumo',precioKwh:0,cuotaFija:0,terminoFijo:0,comercializadora:''};
      DESPACHO.elect={modoPotencia:'doble',potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:6.6,precioPotP1:0,precioPotP2:0,precioKwh:0,terminoFijo:0,comercializadora:''};
      DESPACHO.segurosNormales={segSalud:0,segVida:0,segHogar:0};
      DESPACHO.gasComparaciones=[];
      DESPACHO.electComparaciones=[];
    }
  }catch(e){if(!DESPACHO.compra)DESPACHO.compra=_defaultCompra();}
}
function saveDespacho(){
  try{localStorage.setItem(DESPACHO_SK,JSON.stringify(DESPACHO));}catch(e){}
}
function _despachoGetPct(){
  if(DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0)return DESPACHO.m2Despacho/DESPACHO.m2Total;
  if(DESPACHO.pct>0)return DESPACHO.pct/100;
  return 0;
}
function computeDespachoDeduccion(){
  if(!DESPACHO.enabled)return 0;
  var prop=_despachoGetPct();
  if(prop<=0)return 0;
  var dd=DESPACHO.deducciones||{amortizacion:true,ibi:true,hipotecaInt:true,casa:true,suministros:true};
  /* Amortización: 3% × 80% (construcción) × max(valorCatastral, valorCompra) × prop */
  var vc=DESPACHO.valorCatastral||0, vcp=DESPACHO.valorCompra||0;
  var baseAmort=0;
  if(vc>0&&vcp>0){baseAmort=Math.max(vc,vcp);}else if(vcp>0){baseAmort=vcp;}else if(vc>0){baseAmort=vc;}
  var amort=dd.amortizacion!==false?Math.round(baseAmort*0.80*0.03*prop*100)/100:0;
  /* IBI: 100% deducible × prop (el límite del 30% aplica solo a suministros) */
  var ibiReal=gastoAnual('ibi');
  var ibi=dd.ibi!==false?(ibiReal>0?Math.round(ibiReal*prop*100)/100:Math.round(DESPACHO.valorCatastral*0.011*prop*100)/100):0;
  /* Hipoteca: solo los intereses (campo separado hipotecaIntereses) */
  var hipInteres=dd.hipotecaInt!==false?Math.round((DESPACHO.hipotecaIntereses||0)*prop*100)/100:0;
  var GROUP_CASA=['comunidad','seg_hogar']; /* hipoteca excluida — usar hipotecaIntereses */
  var GROUP_UTIL=['luz','gas','agua','digi'];
  var gastosCasa=0,gastosUtil=0;
  GASTOS_ITEMS.forEach(function(g){
    var a=gastoAnual(g.id);
    if(GROUP_CASA.indexOf(g.id)!==-1)gastosCasa+=a;
    else if(GROUP_UTIL.indexOf(g.id)!==-1)gastosUtil+=a;
  });
  var casaDeducible=dd.casa!==false?Math.round(gastosCasa*prop*100)/100:0;
  var utilDeducible=dd.suministros!==false?Math.round(gastosUtil*prop*0.30*100)/100:0;
  return Math.round((amort+ibi+hipInteres+casaDeducible+utilDeducible)*100)/100;
}

/* ── computeDeclResult — cálculo unificado para declaración ── */
function computeDeclResult(base,irpfTotal){
  var gdPct=typeof GASTOS_DIFICIL_PCT!=='undefined'?GASTOS_DIFICIL_PCT:5;
  var gdAmount=Math.round(base*gdPct/100*100)/100;
  if(gdAmount>2000)gdAmount=2000; /* tope legal AEAT: máx 2.000€/año (est. directa simplificada) */
  var baseAfterGD=Math.max(0,Math.round((base-gdAmount)*100)/100);
  var dg=computeTotalDesgrav();
  var totalBaseDesgrav=dg.base;
  var totalQuotaDesgrav=dg.quota;
  /* Quota: para vivienda notaPct=15 → la cantidad ingresada ES la base (hipoteca pagada)
     la deducción real = min(amount,9015) × 15% → desgravAnual ya aplica min(amount,limit),
     pero el notaPct se aplica aquí */
  var quotaEffective=0;
  DESGRAV_ITEMS.forEach(function(item){
    if(!item.enabled||(item.type||'base')!=='quota')return;
    var d=desgravAnual(item);
    var qPct=item.notaPct!=null?item.notaPct/100:1;
    quotaEffective+=Math.round(d*qPct*100)/100;
  });
  quotaEffective=Math.round(quotaEffective*100)/100;
  if(DESPACHO.enabled)totalBaseDesgrav=Math.round((totalBaseDesgrav+computeDespachoDeduccion())*100)/100;
  var baseDecl=Math.max(0,Math.round((baseAfterGD-totalBaseDesgrav)*100)/100);
  var decl=computeIrpfBrackets(baseDecl);
  var declDiff=Math.round((decl.totalTax-irpfTotal-quotaEffective)*100)/100;
  return{
    gdPct:gdPct,gdAmount:gdAmount,baseAfterGD:baseAfterGD,
    totalDesgrav:Math.round((totalBaseDesgrav+totalQuotaDesgrav)*100)/100,
    totalBaseDesgrav:totalBaseDesgrav,totalQuotaDesgrav:quotaEffective,
    baseDecl:baseDecl,decl:decl,declDiff:declDiff
  };
}

/* ── Cálculo IRPF por tramos ──────────────────────────────── */
function computeIrpfBrackets(base){
  var brackets=getBrackets();
  var totalTax=0,breakdown=[];
  for(var i=0;i<brackets.length;i++){
    var b=brackets[i];
    if(base<=b.from)break;
    var top=b.to===Infinity?base:Math.min(base,b.to);
    var taxable=top-b.from;
    var tax=Math.round(taxable*b.pct/100*100)/100;
    totalTax+=tax;
    breakdown.push({from:b.from,to:b.to,pct:b.pct,taxable:taxable,tax:tax});
  }
  return{totalTax:Math.round(totalTax*100)/100,breakdown:breakdown,effectivePct:base>0?Math.round(totalTax/base*10000)/100:0};
}

/* ── renderFiscalContent — con tabs ──────────────────────── */

function _hipEffRate(tipoBase,vinc){
  var r=tipoBase;
  if(vinc){['nomina','segHogar','segSalud','segVida'].forEach(function(k){if(vinc[k]&&vinc[k].enabled)r-=(vinc[k].reduccion||0);});}
  return Math.max(0,r);
}
/* ── Build switch-points from comp.subrogaciones ─────────── */
function _buildMortgageSwitches(comp){
  /* Returns sorted array of {monthOffset, rate, cuota, balance} */
  var startParts=comp.fechaInicio.split('-');
  var startY=parseInt(startParts[0],10),startM=parseInt(startParts[1],10)-1;
  var switches=[];
  var subs=comp.subrogaciones||[];
  subs.forEach(function(sub){
    if(!sub||!sub.fecha||!sub.nuevoImporte||!sub.nuevoTipoInteres||!sub.nuevoPlazoAnios)return;
    var sp=sub.fecha.split('-');
    var sY=parseInt(sp[0],10),sM=parseInt(sp[1],10)-1;
    var mo=(sY-startY)*12+(sM-startM);
    if(mo<0)return;
    var tipoEf=_hipEffRate(sub.nuevoTipoInteres,sub.vinculaciones);
    var rr=tipoEf/100/12,nn=sub.nuevoPlazoAnios*12;
    var cuota=rr>0?sub.nuevoImporte*rr*Math.pow(1+rr,nn)/(Math.pow(1+rr,nn)-1):sub.nuevoImporte/nn;
    switches.push({monthOffset:mo,rate:rr,cuota:cuota,balance:sub.nuevoImporte,plazoMeses:nn});
  });
  switches.sort(function(a,b){return a.monthOffset-b.monthOffset;});
  return switches;
}
/* ── Cálculo intereses hipotecarios por año (multi-subrogación) ── */
function _computeAnnualInterest(comp,year){
  if(!comp||!comp.fechaInicio||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios)return 0;
  var startParts=comp.fechaInicio.split('-');
  var startY=parseInt(startParts[0],10),startM=parseInt(startParts[1],10)-1;
  var tipoEf=_hipEffRate(comp.tipoInteres,comp.vinculaciones);
  var r=tipoEf/100/12;
  var nTotal=comp.plazoAnios*12;
  var cuota=r>0?comp.importePrestamo*r*Math.pow(1+r,nTotal)/(Math.pow(1+r,nTotal)-1):comp.importePrestamo/nTotal;
  var balance=comp.importePrestamo;
  var interesesYear=0;
  var switches=_buildMortgageSwitches(comp);
  var switchIdx=0;
  var maxMonths=nTotal+360; /* extra for subrogaciones extending */
  for(var m=0;m<maxMonths;m++){
    var curY=startY+Math.floor((startM+m)/12);
    if(curY>year)break;
    /* Apply switch if we've reached the next subrogation */
    while(switchIdx<switches.length&&m>=switches[switchIdx].monthOffset){
      balance=switches[switchIdx].balance;
      r=switches[switchIdx].rate;
      cuota=switches[switchIdx].cuota;
      switchIdx++;
    }
    if(balance<=0)break;
    var interesMes=balance*r;
    var capital=cuota-interesMes;
    if(capital>balance){capital=balance;interesMes=cuota-capital;}
    if(curY===year)interesesYear+=interesMes;
    balance-=capital;
    if(balance<0.01)balance=0;
  }
  return Math.round(interesesYear*100)/100;
}
/* ── Obtener saldo vivo a una fecha dada (multi-subrogación) ── */
function _computeBalanceAtDate(comp,dateStr){
  if(!comp||!comp.fechaInicio||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios||!dateStr)return 0;
  var startParts=comp.fechaInicio.split('-');
  var startY=parseInt(startParts[0],10),startM=parseInt(startParts[1],10)-1;
  var dp=dateStr.split('-');
  var dY=parseInt(dp[0],10),dM=parseInt(dp[1],10)-1;
  var targetMonth=(dY-startY)*12+(dM-startM);
  if(targetMonth<=0)return comp.importePrestamo;
  var tipoEf=_hipEffRate(comp.tipoInteres,comp.vinculaciones);
  var r=tipoEf/100/12;
  var nTotal=comp.plazoAnios*12;
  var cuota=r>0?comp.importePrestamo*r*Math.pow(1+r,nTotal)/(Math.pow(1+r,nTotal)-1):comp.importePrestamo/nTotal;
  var balance=comp.importePrestamo;
  var switches=_buildMortgageSwitches(comp);
  var switchIdx=0;
  for(var m=0;m<targetMonth;m++){
    while(switchIdx<switches.length&&m>=switches[switchIdx].monthOffset){
      balance=switches[switchIdx].balance;
      r=switches[switchIdx].rate;
      cuota=switches[switchIdx].cuota;
      switchIdx++;
    }
    if(balance<=0)break;
    var interes=balance*r;
    var capital=cuota-interes;
    if(capital>balance)capital=balance;
    balance-=capital;
    if(balance<0.01){balance=0;break;}
  }
  return Math.round(balance*100)/100;
}

/* ── Tab Despacho (sub-tab dentro de IRPF y Deducciones) ──── */
function renderFiscalTabDespachoOnly(){
  var pctShow=DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0
    ?Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10
    :DESPACHO.pct;
  var comp=DESPACHO.compra||_defaultCompra();
  var h='';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Despacho en casa \u2014 Deducci\u00f3n IRPF</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:12px">Configura el espacio dedicado al trabajo. Los m\u00b2 y el % se sincronizan autom\u00e1ticamente entre s\u00ed.</div>';
  h+='<div class="fiscal-despacho-toggle-row">';
  h+='<span class="fiscal-despacho-toggle-lbl">Activar deducci\u00f3n despacho</span>';
  h+='<div class="fiscal-onoff'+(DESPACHO.enabled?' on':'')+'" id="despachoToggle">'+(DESPACHO.enabled?'ON':'OFF')+'</div>';
  h+='</div>';
  h+='<div class="fiscal-despacho-grid">';
  h+=_despField('m2Total','M\u00b2 totales de la casa',DESPACHO.m2Total,'m\u00b2');
  h+=_despField('m2Despacho','M\u00b2 del despacho',DESPACHO.m2Despacho,'m\u00b2');
  h+=_despField('pct','% del despacho (se sincroniza con m\u00b2)',pctShow,'%');
  h+=_despFieldMoney('valorCatastral','Valor catastral del inmueble',DESPACHO.valorCatastral);
  /* Auto-calcular intereses si hay datos suficientes */
  var _autoInt=_computeAnnualInterest(comp,FISCAL_YEAR);
  if(_autoInt>0&&!DESPACHO.hipotecaInteresesManual){DESPACHO.hipotecaIntereses=_autoInt;saveDespacho();}
  var _intLabel='Intereses hipotecarios anuales ('+FISCAL_YEAR+')';
  if(_autoInt>0){
    _intLabel+=DESPACHO.hipotecaInteresesManual?' \u2014 <span style="font-size:.65rem;color:var(--c-orange)">manual</span>':' \u2014 <span style="font-size:.65rem;color:var(--c-green)">calculado</span>';
  }
  h+=_despFieldMoney('hipotecaIntereses',_intLabel,DESPACHO.hipotecaIntereses);
  if(DESPACHO.hipotecaInteresesManual&&_autoInt>0){
    h+='<div style="font-size:.66rem;color:var(--text-dim);padding:0 4px 4px"><button class="fiscal-link-btn" id="despRecalcInt" style="font-size:.66rem;color:var(--accent-bright);background:none;border:none;cursor:pointer;text-decoration:underline;padding:0">\u21bb Recalcular ('+fcPlain(_autoInt)+')</button></div>';
  }
  /* Explanation: how interest is calculated + monthly avg */
  if(_autoInt>0){
    var intMes=Math.round(_autoInt/12*100)/100;
    var tipoEfCalc=_hipEffRate(comp.tipoInteres,comp.vinculaciones);
    var subs=comp.subrogaciones||[];
    var lastSub=subs.length>0?subs[subs.length-1]:null;
    h+='<div style="font-size:.64rem;color:var(--text-dim);padding:4px;background:var(--surface2);border-radius:var(--radius-sm);margin-top:4px">';
    h+='<div>\uD83D\uDCA1 <b>Media mensual intereses: '+fcPlain(intMes)+'\u20ac/mes</b></div>';
    h+='<div style="margin-top:2px">C\u00e1lculo: simulaci\u00f3n mes a mes del pr\u00e9stamo (amortizaci\u00f3n francesa), sumando los intereses de cada cuota mensual del a\u00f1o '+FISCAL_YEAR+'.</div>';
    if(lastSub&&lastSub.fecha){
      var sp=lastSub.fecha.split('-');
      var sY=parseInt(sp[0],10);
      if(sY<=FISCAL_YEAR){
        h+='<div style="margin-top:2px">Incluye subrogaci\u00f3n ('+lastSub.fecha.split('-').reverse().join('/')+') con tipo efectivo '+_hipEffRate(lastSub.nuevoTipoInteres,lastSub.vinculaciones).toFixed(2)+'%.</div>';
      }
    } else {
      h+='<div style="margin-top:2px">Tipo efectivo: '+tipoEfCalc.toFixed(2)+'%'+(tipoEfCalc!==comp.tipoInteres?' (nominal '+comp.tipoInteres.toFixed(2)+'% \u2212 vinculaciones)':'')+'</div>';
    }
    h+='</div>';
  }
  h+='</div>';
  h+='</div>';
  return h;
}

/* ── Tab Hipoteca ─────────────────────────────────────────── */
/* Get the active (latest) mortgage data */
function _getActiveMortgage(comp){
  var subs=comp.subrogaciones||[];
  if(subs.length===0)return{importe:comp.importePrestamo,tipo:comp.tipoInteres,plazo:comp.plazoAnios,fecha:comp.fechaInicio,banco:comp.entidadBanco,vinc:comp.vinculaciones,idx:-1};
  var last=subs[subs.length-1];
  return{importe:last.nuevoImporte,tipo:last.nuevoTipoInteres,plazo:last.nuevoPlazoAnios,fecha:last.fecha,banco:last.entidadBanco,vinc:last.vinculaciones,idx:subs.length-1};
}
/* Format duration as "Xa Ym" */
function _fmtDuration(meses){
  if(meses<=0)return '0m';
  var a=Math.floor(meses/12),m=meses%12;
  return (a>0?a+'a ':'')+(m>0?m+'m':'');
}
/* Period card for Resumen sub-tab */
function _hipPeriodCard(comp,subIdx,isActive,startDate,endDate){
  var importe,tipo,plazo,banco,vinc,label;
  if(subIdx<0){
    importe=comp.importePrestamo;tipo=comp.tipoInteres;plazo=comp.plazoAnios;banco=comp.entidadBanco;vinc=comp.vinculaciones;label='Pr\u00e9stamo original';
  } else {
    var sub=comp.subrogaciones[subIdx];
    importe=sub.nuevoImporte;tipo=sub.nuevoTipoInteres;plazo=sub.nuevoPlazoAnios;banco=sub.entidadBanco;vinc=sub.vinculaciones;label='Subrogaci\u00f3n '+(subIdx+1);
  }
  if(!importe||!tipo||!plazo)return '';
  var tipoEf=_hipEffRate(tipo,vinc);
  var r=tipoEf/100/12,n=plazo*12;
  var cuota=r>0?Math.round(importe*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)*100)/100:Math.round(importe/n*100)/100;
  /* Tiempo pagado/restante */
  var hoy=new Date();
  var mPagados=0,mRestantes=0;
  if(startDate){
    var sp=startDate.split('-');
    mPagados=Math.max(0,(hoy.getFullYear()-parseInt(sp[0],10))*12+(hoy.getMonth()-(parseInt(sp[1],10)-1)));
    if(endDate){
      var ep=endDate.split('-');
      var mEnd=(parseInt(ep[0],10)-parseInt(sp[0],10))*12+(parseInt(ep[1],10)-parseInt(sp[1],10));
      mPagados=Math.min(mPagados,mEnd);
      mRestantes=0; /* this period ended */
    } else {
      mRestantes=Math.max(0,n-mPagados);
    }
  }
  var saldoVivo=0,intAnual=0;
  if(isActive&&comp.fechaInicio){
    var todayStr=hoy.getFullYear()+'-'+String(hoy.getMonth()+1).padStart(2,'0')+'-01';
    saldoVivo=_computeBalanceAtDate(comp,todayStr);
    intAnual=_computeAnnualInterest(comp,FISCAL_YEAR);
  }
  var h='<div class="hip-period-card">';
  h+='<div class="hip-period-hdr"><span class="hip-period-title">'+label+(banco?' \u2014 '+escHtml(banco):'')+'</span>';
  h+='<span class="hip-period-badge'+(isActive?' active':'')+'">'+( isActive?'Vigente':'Finalizada')+'</span></div>';
  h+='<div class="hip-period-cuota"><span class="hip-period-cuota-val">'+fcPlain(cuota)+'</span><span class="hip-period-cuota-lbl">\u20ac/mes</span></div>';
  h+='<div class="hip-period-info">'+tipoEf.toFixed(2)+'% '+(tipoEf!==tipo?'(nominal '+tipo.toFixed(2)+'%)':' fijo')+' \u00b7 '+plazo+' a\u00f1os \u00b7 '+_fmtMiles(importe)+' \u20ac</div>';
  if(startDate){
    h+='<div class="hip-period-info">';
    h+=startDate.split('-').reverse().join('/')+(endDate?' \u2192 '+endDate.split('-').reverse().join('/'):' \u2192 hoy');
    h+=' \u00b7 pagado: '+_fmtDuration(mPagados);
    if(mRestantes>0)h+=' \u00b7 restante: '+_fmtDuration(mRestantes);
    h+='</div>';
  }
  /* Stats for active mortgage */
  if(isActive){
    h+='<div class="hip-stats" style="margin-top:6px">';
    if(saldoVivo>0){var pctA=Math.round((1-saldoVivo/importe)*100);h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-green)">'+_fmtMiles(saldoVivo)+' \u20ac</span><span class="hip-stat-lbl">Saldo vivo ('+pctA+'%)</span></div>';}
    if(intAnual>0)h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-orange)">'+fcPlain(intAnual)+'</span><span class="hip-stat-lbl">Intereses '+FISCAL_YEAR+'</span></div>';
    h+='</div>';
  }
  /* Sobrecoste seguros vinculados */
  if(vinc){
    var oc=_calcInsOvercost(vinc);
    if(oc!==null)h+='<div class="hip-period-info" style="color:'+(oc>0?'var(--c-red)':'var(--c-green)')+'">Sobrecoste seguros: '+((oc>0?'+':'')+fcPlain(oc))+'\u20ac/a\u00f1o</div>';
  }
  h+='<button class="hip-period-btn" data-gotosection="'+(subIdx<0?'prestamo':'sub-'+subIdx)+'">Ver Detalle</button>';
  h+='</div>';
  return h;
}
/* ── Hip edit field helpers (reused in edit mode) ────────── */
function _hipMoney(id,label,val){
  return '<div class="hip-cf"><label class="hip-cf-lbl">'+label+'</label>'
    +'<div class="hip-cf-row"><input class="fiscal-despacho-input" id="desp-'+id+'" type="number" min="0" step="1000" value="'+(val||0)+'"><span class="fiscal-despacho-unit">\u20ac</span></div>'
    +'<div class="fiscal-despacho-money-fmt" id="desp-fmt-'+id+'">'+(val&&val>0?_fmtMiles(val)+' \u20ac':'')+'</div></div>';
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
    if(!isNom)h+='<input class="hip-vr-inp" id="'+id+'Coste" type="number" min="0" step="10" value="'+(data.costeAnual||0)+'" title="\u20ac/a\u00f1o">';
    h+='<input class="hip-vr-inp hip-vr-pct" id="'+id+'Reduccion" type="number" min="0" step="0.05" value="'+(data.reduccion||0)+'" title="\u2212 tipo %">';
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
    h+=(total>0?' \u00b7 ':'')+'<b style="color:var(--c-green)">\u2212'+reduc.toFixed(2)+'%</b>';
    if(tipoBase>0)h+=' \u2192 <b style="color:var(--c-green)">'+Math.max(0,tipoBase-reduc).toFixed(2)+'%</b>';
  }
  h+='</div>';
  return h;
}
/* ── Read-only helpers ─────────────────────────────────────── */
function _hipRO(label,val,unit){
  return '<div class="hip-ro-row"><span class="hip-ro-lbl">'+label+'</span><span class="hip-ro-val">'+(val!=null?val:'')+(unit?' '+unit:'')+'</span></div>';
}
function _hipROmoney(label,val){
  return _hipRO(label,val&&val>0?_fmtMiles(val)+' \u20ac':'\u2014');
}
function _hipROvinc(label,data){
  if(!data||!data.enabled)return '<div class="hip-ro-vinc"><span class="hip-ro-vinc-lbl">'+label+'</span><span class="hip-ro-vinc-off">OFF</span></div>';
  var isNom=label.indexOf('\u00f3mina')!==-1;
  var h='<div class="hip-ro-vinc"><span class="hip-ro-vinc-lbl">'+label+'</span><span class="hip-ro-vinc-vals">';
  if(!isNom&&data.costeAnual)h+=_fmtMiles(data.costeAnual)+'\u20ac ';
  if(data.reduccion)h+='\u2212'+data.reduccion.toFixed(2)+'%';
  h+='</span></div>';
  return h;
}

function _calcInsOvercost(vinc){
  var sn=DESPACHO.segurosNormales||{};
  var _sk=[{key:'segSalud',label:'Seg. salud'},{key:'segVida',label:'Seg. vida'},{key:'segHogar',label:'Seg. hogar'}];
  var total=0,hasAny=false;
  _sk.forEach(function(s){
    if(!vinc[s.key]||!vinc[s.key].enabled)return;
    hasAny=true;
    total+=(vinc[s.key].costeAnual||0)-(sn[s.key]||0);
  });
  return hasAny?total:null;
}
function _renderInlineOvercost(vinc){
  var sn=DESPACHO.segurosNormales||{};
  var _sk=[{key:'segSalud',label:'Seg. salud'},{key:'segVida',label:'Seg. vida'},{key:'segHogar',label:'Seg. hogar'}];
  var hasAny=false,totalVinc=0,totalRef=0;
  _sk.forEach(function(s){if(vinc[s.key]&&vinc[s.key].enabled)hasAny=true;});
  if(!hasAny)return '';
  var h='<div style="font-size:.66rem;color:var(--text-dim);margin-top:6px;font-weight:600">Sobrecoste seguros vinculados</div>';
  _sk.forEach(function(s){
    if(!vinc[s.key]||!vinc[s.key].enabled)return;
    var cv=vinc[s.key].costeAnual||0,cn=sn[s.key]||0,diff=cv-cn;
    totalVinc+=cv;totalRef+=cn;
    h+='<div class="hip-ro-row"><span class="hip-ro-lbl">'+s.label+'</span><span class="hip-ro-val" style="color:'+(diff>0?'var(--c-red)':'var(--c-green)')+'">'+((diff>0?'+':'')+fcPlain(diff))+'\u20ac/a\u00f1o</span></div>';
  });
  var totalDiff=totalVinc-totalRef;
  h+='<div class="hip-ro-row" style="border-top:1px solid var(--border);padding-top:3px"><span class="hip-ro-lbl"><b>Total sobrecoste</b></span><span class="hip-ro-val" style="font-weight:700;color:'+(totalDiff>0?'var(--c-red)':'var(--c-green)')+'">'+((totalDiff>0?'+':'')+fcPlain(totalDiff))+'\u20ac/a\u00f1o</span></div>';
  return h;
}

/* ── Resumen sub-tab ──────────────────────────────────────── */
function _renderHipResumen(){
  var comp=DESPACHO.compra||_defaultCompra();
  var h='';
  if(!comp.importePrestamo){
    h+='<div style="text-align:center;padding:30px;color:var(--text-dim);font-size:.75rem">Configura los datos de hipoteca en la pesta\u00f1a <b>Detalle</b>.</div>';
    return h;
  }
  /* Compra summary */
  var totalCompra=(comp.valorCompraTotal||0)+(comp.itpMadrid||0)+(comp.notariaRegistro||0)+(comp.tasacion||0)+(comp.reformas||0)+(comp.inmobiliaria||0);
  if(totalCompra>0){
    h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">\uD83C\uDFE0 Inversi\u00f3n vivienda: <b style="color:var(--accent-bright)">'+_fmtMiles(totalCompra)+' \u20ac</b></div>';
  }
  /* Build periods */
  var subs=comp.subrogaciones||[];
  var periods=[];
  /* Original mortgage */
  var origEnd=subs.length>0&&subs[0].fecha?subs[0].fecha:null;
  periods.push({subIdx:-1,start:comp.fechaInicio,end:origEnd,isActive:subs.length===0});
  /* Each subrogation */
  for(var i=0;i<subs.length;i++){
    var nextEnd=(i<subs.length-1&&subs[i+1].fecha)?subs[i+1].fecha:null;
    periods.push({subIdx:i,start:subs[i].fecha,end:nextEnd,isActive:i===subs.length-1});
  }
  for(var p=0;p<periods.length;p++){
    h+=_hipPeriodCard(comp,periods[p].subIdx,periods[p].isActive,periods[p].start,periods[p].end);
  }
  /* Ver análisis button */
  /* Gas/Electricidad summary cards */
  var gas=DESPACHO.gas||{};
  _ensureGasScenarios();
  var gasActivo=gas.activo||'consumo';
  var gasData=gasActivo==='fijo'?(gas.fijo||{}):(gas.consumo||{});
  var elc=DESPACHO.elect||{};
  var hasGas=gasActivo==='fijo'?gasData.cuotaFija:gasData.precioKwh;
  if(hasGas||elc.precioKwh){
    h+='<div style="font-size:.72rem;color:var(--text-dim);margin:12px 0 6px;font-weight:600">\uD83D\uDCE6 Facturas</div>';
    if(hasGas){
      h+='<div class="hip-period-card">';
      h+='<div class="hip-period-hdr"><span class="hip-period-title">\uD83D\uDD25 Gas'+(gasData.comercializadora?' \u2014 '+escHtml(gasData.comercializadora):'')+'</span></div>';
      if(gasActivo==='fijo')h+='<div class="hip-period-info">Cuota fija: <b>'+fcPlain(gasData.cuotaFija)+'\u20ac/mes</b></div>';
      else{
        h+='<div class="hip-period-info">Precio: <b>'+(gasData.precioKwh||0).toFixed(4)+' \u20ac/kWh</b></div>';
        if(gasData.terminoFijoDia)h+='<div class="hip-period-info">T\u00e9rmino fijo: '+fcPlain(gasData.terminoFijoDia)+'\u20ac/d\u00eda</div>';
        if(gasData.terminoFijo)h+='<div class="hip-period-info">T\u00e9rmino fijo: '+fcPlain(gasData.terminoFijo)+'\u20ac/factura</div>';
      }
      if(gas.ivaGas)h+='<div class="hip-period-info">IVA: '+gas.ivaGas+'%</div>';
      h+='<button class="hip-period-btn" data-hipsub="gas">Ver Detalle</button></div>';
    }
    if(elc.precioKwh){
      h+='<div class="hip-period-card">';
      h+='<div class="hip-period-hdr"><span class="hip-period-title">\u26A1 Electricidad'+(elc.comercializadora?' \u2014 '+escHtml(elc.comercializadora):'')+'</span></div>';
      var potTxt=elc.modoPotencia==='doble'?'P1: '+elc.potenciaP1+'kW ('+(elc.precioPotP1||0).toFixed(6)+') + P2: '+elc.potenciaP2+'kW ('+(elc.precioPotP2||0).toFixed(6)+')':elc.potenciaTotal+'kW ('+(elc.precioPotP1||0).toFixed(6)+')';
      h+='<div class="hip-period-info">Potencia: <b>'+potTxt+'</b> \u20ac/kW/d\u00eda</div>';
      if(elc.modoPotencia==='doble')h+='<div class="hip-period-info">Suma precios: <b>'+((elc.precioPotP1||0)+(elc.precioPotP2||0)).toFixed(6)+' \u20ac/kW/d\u00eda</b></div>';
      h+='<div class="hip-period-info">Precio: <b>'+(elc.precioKwh||0).toFixed(4)+' \u20ac/kWh</b></div>';
      if(elc.terminoFijo)h+='<div class="hip-period-info">T\u00e9rmino fijo: '+fcPlain(elc.terminoFijo)+'\u20ac/mes</div>';
      h+='<button class="hip-period-btn" data-hipsub="elect">Ver Detalle</button></div>';
    }
  }
  h+='<button class="hip-add-sub-btn" id="hipGoAnalisis" style="border-style:solid;margin-top:4px">\uD83D\uDCC8 Ver An\u00e1lisis Hipoteca</button>';
  return h;
}

/* ── Detalle sub-tab ──────────────────────────────────────── */
function _renderHipDetalle(){
  var comp=DESPACHO.compra||_defaultCompra();
  var h='';
  /* Compra section */
  h+='<div class="fiscal-section" id="hip-section-compra">';
  h+=_renderHipSectionContent('compra',FISCAL_HIP_EDITING==='compra');
  h+='</div>';
  /* Préstamo section */
  h+='<div class="fiscal-section" id="hip-section-prestamo">';
  h+=_renderHipSectionContent('prestamo',FISCAL_HIP_EDITING==='prestamo');
  h+='</div>';
  /* Subrogaciones */
  var subs=comp.subrogaciones||[];
  for(var i=0;i<subs.length;i++){
    var sid='sub-'+i;
    h+='<div class="fiscal-section" id="hip-section-'+sid+'">';
    h+=_renderHipSectionContent(sid,FISCAL_HIP_EDITING===sid);
    h+='</div>';
  }
  /* Add subrogation button */
  h+='<button class="hip-add-sub-btn" id="hipAddSub">+ A\u00f1adir subrogaci\u00f3n</button>';
  /* Precios referencia seguros */
  h+=_renderSegurosNormales();
  return h;
}

function _renderHipSectionContent(sectionId,isEditing){
  var comp=DESPACHO.compra||_defaultCompra();
  if(sectionId==='compra')return _renderCompraSection(comp,isEditing);
  if(sectionId==='prestamo')return _renderPrestamoSection(comp,isEditing);
  if(sectionId.indexOf('sub-')===0){
    var idx=parseInt(sectionId.substring(4),10);
    var sub=(comp.subrogaciones||[])[idx];
    if(sub)return _renderSubSection(comp,sub,idx,isEditing);
  }
  return '';
}

function _renderCompraSection(comp,isEditing){
  var h='<div class="hip-section-hdr"><span class="fiscal-section-title">\uD83C\uDFE0 Compra de vivienda</span>';
  if(!isEditing)h+='<button class="hip-edit-btn" data-editsection="compra">Editar</button>';
  h+='</div>';
  if(isEditing){
    h+='<div class="hip-g2">';
    h+=_hipMoney('compraValor','Valor escritura',comp.valorCompraTotal);
    h+=_hipMoney('compraItp','ITP Madrid (6%)',comp.itpMadrid);
    h+=_hipMoney('compraNotaria','Notar\u00eda y registro',comp.notariaRegistro);
    h+=_hipMoney('compraTasacion','Tasaci\u00f3n',comp.tasacion);
    h+=_hipMoney('compraReformas','Reformas',comp.reformas);
    h+=_hipMoney('compraInmobiliaria','Inmobiliaria',comp.inmobiliaria||0);
    h+='</div>';
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" data-savesection="compra">Guardar cambios</button><button class="hip-cancel-btn" data-cancelsection="compra">Cancelar</button></div>';
  } else {
    h+='<div class="hip-ro-grid">';
    h+=_hipROmoney('Valor escritura',comp.valorCompraTotal);
    h+=_hipROmoney('ITP Madrid',comp.itpMadrid);
    h+=_hipROmoney('Notar\u00eda',comp.notariaRegistro);
    h+=_hipROmoney('Tasaci\u00f3n',comp.tasacion);
    h+=_hipROmoney('Reformas',comp.reformas);
    h+=_hipROmoney('Inmobiliaria',comp.inmobiliaria);
    h+='</div>';
    var total=(comp.valorCompraTotal||0)+(comp.itpMadrid||0)+(comp.notariaRegistro||0)+(comp.tasacion||0)+(comp.reformas||0)+(comp.inmobiliaria||0);
    if(total>0)h+='<div class="hip-section-total">Total: <b>'+_fmtMiles(total)+' \u20ac</b></div>';
  }
  return h;
}

function _renderPrestamoSection(comp,isEditing){
  var vinc=comp.vinculaciones||{nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}};
  var h='<div class="hip-section-hdr"><span class="fiscal-section-title">\uD83C\uDFE6 Pr\u00e9stamo original</span>';
  if(!isEditing)h+='<button class="hip-edit-btn" data-editsection="prestamo">Editar</button>';
  h+='</div>';
  if(isEditing){
    h+='<div class="hip-g2">';
    h+=_hipMoney('compraImporte','Importe',comp.importePrestamo);
    h+=_hipDate('compraFechaInicio','Fecha inicio',comp.fechaInicio);
    h+=_hipNum('compraTipo','Tipo inter\u00e9s',comp.tipoInteres,'%');
    h+=_hipNum('compraPlazo','Plazo',comp.plazoAnios,'a\u00f1os');
    h+=_hipText('entidadBanco','Banco',comp.entidadBanco,'Ej: CaixaBank...');
    h+='</div>';
    h+='<div style="font-size:.7rem;color:var(--text-dim);font-weight:600;margin:6px 0 2px">Vinculaciones</div>';
    h+='<div class="hip-vr-head"><span></span><span class="hip-vr-h">\u20ac/a\u00f1o</span><span class="hip-vr-h">\u2212tipo%</span><span></span></div>';
    h+=_hipVinc('vincNomina','N\u00f3mina',vinc.nomina);
    h+=_hipVinc('vincSegHogar','Seg. hogar',vinc.segHogar);
    h+=_hipVinc('vincSegSalud','Seg. salud',vinc.segSalud);
    h+=_hipVinc('vincSegVida','Seg. vida',vinc.segVida);
    h+=_hipVincSum(vinc,comp.tipoInteres);
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" data-savesection="prestamo">Guardar cambios</button><button class="hip-cancel-btn" data-cancelsection="prestamo">Cancelar</button></div>';
  } else {
    h+=_hipRO('Importe',comp.importePrestamo?_fmtMiles(comp.importePrestamo)+' \u20ac':'\u2014');
    h+=_hipRO('Tipo inter\u00e9s',comp.tipoInteres?comp.tipoInteres.toFixed(2)+'%':'\u2014');
    h+=_hipRO('Plazo',comp.plazoAnios?comp.plazoAnios+' a\u00f1os':'\u2014');
    h+=_hipRO('Fecha inicio',comp.fechaInicio?comp.fechaInicio.split('-').reverse().join('/'):'\u2014');
    h+=_hipRO('Banco',comp.entidadBanco||'\u2014');
    /* Cuota calculated */
    if(comp.importePrestamo>0&&comp.tipoInteres>0&&comp.plazoAnios>0){
      var tipoEf=_hipEffRate(comp.tipoInteres,vinc);
      var r=tipoEf/100/12,n=comp.plazoAnios*12;
      var cuota=r>0?Math.round(comp.importePrestamo*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)*100)/100:0;
      h+='<div class="hip-ro-row" style="margin-top:4px;border-top:1px solid var(--border);padding-top:4px"><span class="hip-ro-lbl">Cuota mensual</span><span class="hip-ro-val" style="font-size:.88rem;font-weight:700">'+fcPlain(cuota)+'</span></div>';
      if(tipoEf!==comp.tipoInteres)h+='<div style="font-size:.62rem;color:var(--c-green);text-align:right">Tipo efectivo: '+tipoEf.toFixed(2)+'%</div>';
    }
    /* Vinculaciones read-only */
    h+='<div style="font-size:.66rem;color:var(--text-dim);margin-top:6px;font-weight:600">Vinculaciones</div>';
    h+=_hipROvinc('N\u00f3mina',vinc.nomina);
    h+=_hipROvinc('Seg. hogar',vinc.segHogar);
    h+=_hipROvinc('Seg. salud',vinc.segSalud);
    h+=_hipROvinc('Seg. vida',vinc.segVida);
    h+=_hipVincSum(vinc,comp.tipoInteres);
    h+=_renderInlineOvercost(vinc);
  }
  return h;
}

function _renderSubSection(comp,sub,idx,isEditing){
  var pfx='sub'+idx;
  var h='<div class="hip-section-hdr"><span class="fiscal-section-title">\uD83D\uDD04 Subrogaci\u00f3n '+(idx+1)+(sub.entidadBanco?' \u2014 '+escHtml(sub.entidadBanco):'')+'</span>';
  if(!isEditing)h+='<button class="hip-edit-btn" data-editsection="sub-'+idx+'">Editar</button>';
  h+='</div>';
  if(isEditing){
    h+='<div class="hip-g2">';
    h+=_hipDate(pfx+'Fecha','Fecha subrogaci\u00f3n',sub.fecha);
    h+='<div></div>';
    h+=_hipMoney(pfx+'Comision','Com. cancelaci\u00f3n',sub.comisionCancelacion);
    h+=_hipMoney(pfx+'Notaria','Notar\u00eda',sub.notaria);
    h+=_hipMoney(pfx+'Tasacion','Tasaci\u00f3n',sub.tasacion);
    h+=_hipMoney(pfx+'Registro','Registro',sub.registro);
    h+='</div>';
    h+='<div class="hip-sub-heading">Nuevas condiciones</div>';
    h+='<div class="hip-g2">';
    h+=_hipMoney(pfx+'NuevoImporte','Capital pendiente',sub.nuevoImporte);
    h+='<div></div>';
    h+=_hipNum(pfx+'NuevoTipo','Tipo inter\u00e9s',sub.nuevoTipoInteres,'%');
    h+=_hipNum(pfx+'NuevoPlazo','Plazo',sub.nuevoPlazoAnios,'a\u00f1os');
    h+=_hipText(pfx+'EntidadBanco','Nuevo banco',sub.entidadBanco||'','Ej: ING...');
    h+='</div>';
    var sv=sub.vinculaciones||{nomina:{enabled:false,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0}};
    h+='<div class="hip-sub-heading">Vinculaciones</div>';
    h+='<div class="hip-vr-head"><span></span><span class="hip-vr-h">\u20ac/a\u00f1o</span><span class="hip-vr-h">\u2212tipo%</span><span></span></div>';
    h+=_hipVinc(pfx+'VincNomina','N\u00f3mina',sv.nomina);
    h+=_hipVinc(pfx+'VincSegVida','Seg. vida',sv.segVida);
    h+=_hipVinc(pfx+'VincSegSalud','Seg. salud',sv.segSalud);
    h+=_hipVinc(pfx+'VincSegHogar','Seg. hogar',sv.segHogar);
    h+=_hipVincSum(sv,sub.nuevoTipoInteres);
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" data-savesection="sub-'+idx+'">Guardar cambios</button><button class="hip-cancel-btn" data-cancelsection="sub-'+idx+'">Cancelar</button></div>';
  } else {
    h+=_hipRO('Fecha',sub.fecha?sub.fecha.split('-').reverse().join('/'):'\u2014');
    var costes=(sub.comisionCancelacion||0)+(sub.notaria||0)+(sub.tasacion||0)+(sub.registro||0);
    if(costes>0)h+=_hipROmoney('Costes cambio',costes);
    h+=_hipRO('Capital',sub.nuevoImporte?_fmtMiles(sub.nuevoImporte)+' \u20ac':'\u2014');
    h+=_hipRO('Tipo inter\u00e9s',sub.nuevoTipoInteres?sub.nuevoTipoInteres.toFixed(2)+'%':'\u2014');
    h+=_hipRO('Plazo',sub.nuevoPlazoAnios?sub.nuevoPlazoAnios+' a\u00f1os':'\u2014');
    h+=_hipRO('Banco',sub.entidadBanco||'\u2014');
    /* Cuota + tiempo restante */
    if(sub.nuevoImporte>0&&sub.nuevoTipoInteres>0&&sub.nuevoPlazoAnios>0){
      var sv2=sub.vinculaciones||{};
      var tipoEfS=_hipEffRate(sub.nuevoTipoInteres,sv2);
      var rs=tipoEfS/100/12,ns=sub.nuevoPlazoAnios*12;
      var cuotaS=rs>0?Math.round(sub.nuevoImporte*rs*Math.pow(1+rs,ns)/(Math.pow(1+rs,ns)-1)*100)/100:0;
      h+='<div class="hip-ro-row" style="margin-top:4px;border-top:1px solid var(--border);padding-top:4px"><span class="hip-ro-lbl">Cuota mensual</span><span class="hip-ro-val" style="font-size:.88rem;font-weight:700">'+fcPlain(cuotaS)+'</span></div>';
      if(tipoEfS!==sub.nuevoTipoInteres)h+='<div style="font-size:.62rem;color:var(--c-green);text-align:right">Tipo efectivo: '+tipoEfS.toFixed(2)+'%</div>';
      /* Tiempo restante */
      if(sub.fecha){
        var hoy=new Date();
        var fp=sub.fecha.split('-');
        var mPagados=Math.max(0,(hoy.getFullYear()-parseInt(fp[0],10))*12+(hoy.getMonth()-(parseInt(fp[1],10)-1)));
        var mRest=Math.max(0,ns-mPagados);
        h+=_hipRO('Tiempo pagado',_fmtDuration(mPagados));
        h+=_hipRO('Tiempo restante',_fmtDuration(mRest));
      }
    }
    /* Vinculaciones read-only */
    var sv3=sub.vinculaciones||{};
    h+='<div style="font-size:.66rem;color:var(--text-dim);margin-top:4px;font-weight:600">Vinculaciones</div>';
    h+=_hipROvinc('N\u00f3mina',sv3.nomina);
    h+=_hipROvinc('Seg. vida',sv3.segVida);
    h+=_hipROvinc('Seg. salud',sv3.segSalud);
    h+=_hipROvinc('Seg. hogar',sv3.segHogar);
    h+=_hipVincSum(sv3,sub.nuevoTipoInteres);
    h+=_renderInlineOvercost(sv3);
  }
  return h;
}

/* ── Main tab dispatcher ──────────────────────────────────── */
function renderFiscalTabDespacho(){
  var h='';
  h+='<div class="econ-sub-tabs" style="flex-wrap:wrap">';
  h+='<button class="econ-sub-tab'+(FISCAL_HIP_SUB==='resumen'?' active':'')+'" data-hipsub="resumen">Resumen</button>';
  h+='<button class="econ-sub-tab'+(FISCAL_HIP_SUB==='detalle'?' active':'')+'" data-hipsub="detalle">Detalle<br>Hipoteca</button>';
  h+='<button class="econ-sub-tab est-hip'+(FISCAL_HIP_SUB==='gas'?' active':'')+'" data-hipsub="gas">Detalle<br>Gas</button>';
  h+='<button class="econ-sub-tab est-hip'+(FISCAL_HIP_SUB==='elect'?' active':'')+'" data-hipsub="elect">Detalle<br>Elect.</button>';
  h+='</div>';
  if(FISCAL_HIP_SUB==='resumen')h+=_renderHipResumen();
  else if(FISCAL_HIP_SUB==='detalle')h+=_renderHipDetalle();
  else if(FISCAL_HIP_SUB==='gas')h+=_renderGasDetalle();
  else if(FISCAL_HIP_SUB==='elect')h+=_renderElectDetalle();
  return h;
}

/* ── Gas detail sub-tab (two scenarios: consumo + fijo) ──── */

function _bindTabDespacho(){
  if(!DESPACHO.compra)DESPACHO.compra=_defaultCompra();
  /* Sub-tab switching */
  document.querySelectorAll('[data-hipsub]').forEach(function(btn){
    btn.addEventListener('click',function(){
      FISCAL_HIP_SUB=btn.dataset.hipsub;
      FISCAL_HIP_EDITING=null;
      FISCAL_HIP_EDIT_SNAPSHOT=null;
      reRenderFiscal();
    });
  });
  if(FISCAL_HIP_SUB==='resumen'){
    _bindHipResumen();
  } else if(FISCAL_HIP_SUB==='detalle'){
    _bindHipDetalle();
  } else if(FISCAL_HIP_SUB==='gas'){
    _bindGasDetalle();
  } else if(FISCAL_HIP_SUB==='elect'){
    _bindElectDetalle();
  }
}

/* ── Gas detail bindings ─────────────────────────────────── */

function _bindHipResumen(){
  /* "Ver Detalle" buttons */
  document.querySelectorAll('[data-gotosection]').forEach(function(btn){
    btn.addEventListener('click',function(){
      FISCAL_HIP_SUB='detalle';
      FISCAL_HIP_DETAIL_TARGET=btn.dataset.gotosection;
      reRenderFiscal();
      /* Scroll to target section after render */
      setTimeout(function(){
        var target=document.getElementById('hip-section-'+FISCAL_HIP_DETAIL_TARGET);
        if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
        FISCAL_HIP_DETAIL_TARGET=null;
      },100);
    });
  });
  /* "Ver análisis" */
  var goAnalBtn=document.getElementById('hipGoAnalisis');
  if(goAnalBtn)goAnalBtn.addEventListener('click',function(){
    closeFiscal();
    setTimeout(function(){
      ECON_VIEW='analisis';ANALISIS_SUB='hipoteca';
      openEcon();
    },350);
  });
}
function _bindHipDetalle(){
  /* Edit buttons */
  document.querySelectorAll('[data-editsection]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var sid=btn.dataset.editsection;
      FISCAL_HIP_EDIT_SNAPSHOT=JSON.parse(JSON.stringify(DESPACHO.compra));
      FISCAL_HIP_EDITING=sid;
      _rerenderSection(sid,true);
    });
  });
  /* Save buttons */
  document.querySelectorAll('[data-savesection]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var sid=btn.dataset.savesection;
      _readSectionInputs(sid);
      DESPACHO.hipotecaInteresesManual=false;
      saveDespacho();
      FISCAL_HIP_EDITING=null;
      FISCAL_HIP_EDIT_SNAPSHOT=null;
      _rerenderSection(sid,false);
    });
  });
  /* Cancel buttons */
  document.querySelectorAll('[data-cancelsection]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var sid=btn.dataset.cancelsection;
      if(FISCAL_HIP_EDIT_SNAPSHOT){
        DESPACHO.compra=FISCAL_HIP_EDIT_SNAPSHOT;
        saveDespacho();
      }
      FISCAL_HIP_EDITING=null;
      FISCAL_HIP_EDIT_SNAPSHOT=null;
      _rerenderSection(sid,false);
    });
  });
  /* Add subrogation */
  var addBtn=document.getElementById('hipAddSub');
  if(addBtn)addBtn.addEventListener('click',function(){
    var subs=DESPACHO.compra.subrogaciones||[];
    /* Warn if last sub < 2 years ago */
    if(subs.length>0){
      var lastFecha=subs[subs.length-1].fecha;
      if(lastFecha){
        var lp=lastFecha.split('-');
        var diff=(new Date().getFullYear()-parseInt(lp[0],10))*12+(new Date().getMonth()-(parseInt(lp[1],10)-1));
        if(diff<24){
          if(!confirm('Han pasado menos de 2 a\u00f1os desde la \u00faltima subrogaci\u00f3n ('+lastFecha+'). \u00bfA\u00f1adir de todos modos?'))return;
        }
      }
    } else if(!DESPACHO.compra.fechaInicio){
      if(!confirm('No hay fecha de inicio del pr\u00e9stamo. \u00bfA\u00f1adir subrogaci\u00f3n de todos modos?'))return;
    }
    DESPACHO.compra.subrogaciones.push(_defaultSubrogacion());
    saveDespacho();
    var newIdx=DESPACHO.compra.subrogaciones.length-1;
    FISCAL_HIP_EDIT_SNAPSHOT=JSON.parse(JSON.stringify(DESPACHO.compra));
    FISCAL_HIP_EDITING='sub-'+newIdx;
    reRenderFiscal();
  });
  /* If editing, bind inputs for that section */
  if(FISCAL_HIP_EDITING)_bindEditingSection(FISCAL_HIP_EDITING);
  /* Seguros normales inputs (at end of hipoteca detail) */
  _bindSegurosNormales();
  /* Scroll to target from Resumen "Ver Detalle" */
  if(FISCAL_HIP_DETAIL_TARGET){
    var target=document.getElementById('hip-section-'+FISCAL_HIP_DETAIL_TARGET);
    if(target)setTimeout(function(){target.scrollIntoView({behavior:'smooth',block:'start'});},100);
    FISCAL_HIP_DETAIL_TARGET=null;
  }
}
/* Replace a single section's innerHTML and rebind */
function _rerenderSection(sectionId,isEditing){
  var el=document.getElementById('hip-section-'+sectionId);
  if(!el)return;
  var scrollTop=document.querySelector('#fiscalOverlay .sy-body').scrollTop;
  el.innerHTML=_renderHipSectionContent(sectionId,isEditing);
  _bindHipDetalle();
  document.querySelector('#fiscalOverlay .sy-body').scrollTop=scrollTop;
}
/* Read inputs from an editing section into DESPACHO */
function _readSectionInputs(sectionId){
  function _rv(id){var el=document.getElementById('desp-'+id);return el?parseFloat(el.value)||0:0;}
  function _rv_s(id){var el=document.getElementById('desp-'+id);return el?el.value||'':'';}
  var comp=DESPACHO.compra;
  if(sectionId==='compra'){
    comp.valorCompraTotal=_rv('compraValor');
    comp.itpMadrid=_rv('compraItp');
    comp.notariaRegistro=_rv('compraNotaria');
    comp.tasacion=_rv('compraTasacion');
    comp.reformas=_rv('compraReformas');
    comp.inmobiliaria=_rv('compraInmobiliaria');
    DESPACHO.valorCompra=comp.valorCompraTotal;
  } else if(sectionId==='prestamo'){
    comp.importePrestamo=_rv('compraImporte');
    comp.tipoInteres=_rv('compraTipo');
    comp.plazoAnios=_rv('compraPlazo');
    comp.fechaInicio=_rv_s('compraFechaInicio')||null;
    comp.entidadBanco=_rv_s('entidadBanco');
    /* Read vinculaciones from toggles */
    var _vk=['nomina','segHogar','segSalud','segVida'];
    var _vi=['vincNomina','vincSegHogar','vincSegSalud','vincSegVida'];
    _vk.forEach(function(k,i){
      if(!comp.vinculaciones[k])comp.vinculaciones[k]={enabled:false,costeAnual:0,reduccion:0};
      var tgl=document.getElementById(_vi[i]+'Toggle');
      if(tgl)comp.vinculaciones[k].enabled=tgl.classList.contains('on');
      var ce=document.getElementById(_vi[i]+'Coste');
      if(ce)comp.vinculaciones[k].costeAnual=parseFloat(ce.value)||0;
      var re=document.getElementById(_vi[i]+'Reduccion');
      if(re)comp.vinculaciones[k].reduccion=parseFloat(re.value)||0;
    });
  } else if(sectionId.indexOf('sub-')===0){
    var idx=parseInt(sectionId.substring(4),10);
    var sub=comp.subrogaciones[idx];
    if(!sub)return;
    var pfx='sub'+idx;
    sub.fecha=_rv_s(pfx+'Fecha')||null;
    sub.comisionCancelacion=_rv(pfx+'Comision');
    sub.notaria=_rv(pfx+'Notaria');
    sub.tasacion=_rv(pfx+'Tasacion');
    sub.registro=_rv(pfx+'Registro');
    sub.nuevoImporte=_rv(pfx+'NuevoImporte');
    sub.nuevoTipoInteres=_rv(pfx+'NuevoTipo');
    sub.nuevoPlazoAnios=_rv(pfx+'NuevoPlazo');
    sub.entidadBanco=_rv_s(pfx+'EntidadBanco');
    /* Vinculaciones */
    if(!sub.vinculaciones)sub.vinculaciones={nomina:{enabled:false,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0}};
    var _svk=['nomina','segVida','segSalud','segHogar'];
    var _svi=[pfx+'VincNomina',pfx+'VincSegVida',pfx+'VincSegSalud',pfx+'VincSegHogar'];
    _svk.forEach(function(k,i){
      if(!sub.vinculaciones[k])sub.vinculaciones[k]={enabled:false,costeAnual:0,reduccion:0};
      var tgl=document.getElementById(_svi[i]+'Toggle');
      if(tgl)sub.vinculaciones[k].enabled=tgl.classList.contains('on');
      var ce=document.getElementById(_svi[i]+'Coste');
      if(ce)sub.vinculaciones[k].costeAnual=parseFloat(ce.value)||0;
      var re=document.getElementById(_svi[i]+'Reduccion');
      if(re)sub.vinculaciones[k].reduccion=parseFloat(re.value)||0;
    });
  }
}
/* Bind edit-mode inputs (toggles, money format, ITP auto-calc) */
function _bindEditingSection(sectionId){
  /* Money format update on input */
  document.querySelectorAll('#hip-section-'+sectionId+' .fiscal-despacho-input[type="number"]').forEach(function(el){
    var fmtId=el.id?el.id.replace('desp-','desp-fmt-'):null;
    if(fmtId){
      var fmtEl=document.getElementById(fmtId);
      if(fmtEl){
        el.addEventListener('input',function(){
          var v=parseFloat(el.value)||0;
          fmtEl.textContent=v>0?_fmtMiles(v)+' \u20ac':'';
          /* Auto-calc ITP */
          if(el.id==='desp-compraValor'){
            var itpEl=document.getElementById('desp-compraItp');
            if(itpEl){var iv=Math.round(v*0.06);itpEl.value=iv;var fi=document.getElementById('desp-fmt-compraItp');if(fi)fi.textContent=iv>0?_fmtMiles(iv)+' \u20ac':'';}
          }
        });
      }
    }
  });
  /* Vinculación toggles */
  document.querySelectorAll('#hip-section-'+sectionId+' .fiscal-onoff').forEach(function(tgl){
    tgl.addEventListener('click',function(){
      var isOn=tgl.classList.contains('on');
      tgl.classList.toggle('on');
      tgl.textContent=isOn?'OFF':'ON';
      /* Re-render the whole section to show/hide inputs */
      var sid=sectionId;
      /* Read current values before re-render */
      _readSectionInputs(sid);
      saveDespacho();
      var el=document.getElementById('hip-section-'+sid);
      if(el){
        var st=document.querySelector('#fiscalOverlay .sy-body').scrollTop;
        el.innerHTML=_renderHipSectionContent(sid,true);
        _bindEditingSection(sid);
        /* Re-bind save/cancel */
        el.querySelectorAll('[data-savesection]').forEach(function(b){b.addEventListener('click',function(){
          _readSectionInputs(sid);DESPACHO.hipotecaInteresesManual=false;saveDespacho();
          FISCAL_HIP_EDITING=null;FISCAL_HIP_EDIT_SNAPSHOT=null;_rerenderSection(sid,false);
        });});
        el.querySelectorAll('[data-cancelsection]').forEach(function(b){b.addEventListener('click',function(){
          if(FISCAL_HIP_EDIT_SNAPSHOT){DESPACHO.compra=FISCAL_HIP_EDIT_SNAPSHOT;saveDespacho();}
          FISCAL_HIP_EDITING=null;FISCAL_HIP_EDIT_SNAPSHOT=null;_rerenderSection(sid,false);
        });});
        document.querySelector('#fiscalOverlay .sy-body').scrollTop=st;
      }
    });
  });
}

/* ── _saveFiscalAll — guardar todo ────────────────────────── */

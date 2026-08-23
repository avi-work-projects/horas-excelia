/* ============================================================
   FISCAL BIND - Abrir y cerrar la ventana fiscal y enganchar sus controles.

   Va aparte de las vistas a proposito: cada vez que se repinta hay que
   volver a enganchar, asi que este fichero es el que se lee cuando algo
   "no responde", y las vistas el que se lee cuando algo "se ve mal".
   ============================================================ */

function openFiscal(year){
  /* Si se pasa un año explícito, lo usa; si no, hereda el año del overlay
     económico activo (ECON_YEAR) para mantener contexto entre vistas; si
     tampoco existe, cae al año actual. */
  FISCAL_YEAR=year||(typeof ECON_YEAR!=='undefined'?ECON_YEAR:CY);
  loadPersonalYear(FISCAL_YEAR);
  loadGastosYear(FISCAL_YEAR);
  if(typeof loadDespacho==='function')loadDespacho();
  var ov=document.getElementById('fiscalOverlay');
  document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindFiscalEvents();});});
}
function closeFiscal(){
  var ov=document.getElementById('fiscalOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}
/* Re-render fiscal overlay preserving scroll position */
function reRenderFiscal(){
  var body=document.querySelector('#fiscalOverlay .sy-body');
  var scrollTop=body?body.scrollTop:0;
  document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
  bindFiscalEvents();
  var newBody=document.querySelector('#fiscalOverlay .sy-body');
  if(newBody)newBody.scrollTop=scrollTop;
}

/* ── bindFiscalEvents ─────────────────────────────────────── */
function bindFiscalEvents(){
  document.getElementById('fiscalBack').addEventListener('click',function(){closeFiscal();});
  bindNavBar('econ',closeFiscal);

  function _switchTab(tab){
    FISCAL_TAB=tab;
    if(tab==='personal')loadPersonalYear(FISCAL_YEAR);
    if(tab==='gastos_desg')loadGastosYear(FISCAL_YEAR);
    reRenderFiscal();
  }
  document.getElementById('fiscalTabPersonal').addEventListener('click',function(){_switchTab('personal');});
  document.getElementById('fiscalTabGastosDesg').addEventListener('click',function(){_switchTab('gastos_desg');});
  document.getElementById('fiscalTabIrpfDeduc').addEventListener('click',function(){_switchTab('irpf_deduc');});
  document.getElementById('fiscalTabDespacho').addEventListener('click',function(){_switchTab('despacho');});

  /* Swipe: cambiar entre pestañas de configuración económica */
  var _fiscalTabOrder=['personal','gastos_desg','irpf_deduc','despacho'];
  var _fiscalTabIds={personal:'fiscalTabPersonal',gastos_desg:'fiscalTabGastosDesg',irpf_deduc:'fiscalTabIrpfDeduc',despacho:'fiscalTabDespacho'};
  addSwipe(document.getElementById('fiscalOverlay'),function(){
    var i=_fiscalTabOrder.indexOf(FISCAL_TAB);
    if(i>=0&&i<_fiscalTabOrder.length-1){var b=document.getElementById(_fiscalTabIds[_fiscalTabOrder[i+1]]);if(b)b.click();}
  },function(){
    var i=_fiscalTabOrder.indexOf(FISCAL_TAB);
    if(i>0){var b=document.getElementById(_fiscalTabIds[_fiscalTabOrder[i-1]]);if(b)b.click();}
  });

  document.getElementById('fiscalSave').addEventListener('click',function(){_saveFiscalAll();});

  /* Year selector bindings (shared by personal + gastos_desg + irpf_deduc) */
  if(FISCAL_TAB==='personal'||FISCAL_TAB==='gastos_desg'||FISCAL_TAB==='irpf_deduc')_bindYearSelector();

  if(FISCAL_TAB==='personal')_bindTabPersonal();
  else if(FISCAL_TAB==='gastos_desg')_bindTabGastosDesg();
  else if(FISCAL_TAB==='irpf_deduc')_bindTabIrpfDeduc();
  else if(FISCAL_TAB==='despacho')_bindTabDespacho();
}

function _bindYearSelector(){
  var prev=document.getElementById('fiscalYearPrev');
  var next=document.getElementById('fiscalYearNext');
  if(prev)prev.addEventListener('click',function(){
    FISCAL_YEAR--;
    if(FISCAL_TAB==='personal')loadPersonalYear(FISCAL_YEAR);
    else{loadGastosYear(FISCAL_YEAR);if(typeof loadCompras==='function')loadCompras();}
    reRenderFiscal();
  });
  if(next)next.addEventListener('click',function(){
    FISCAL_YEAR++;
    if(FISCAL_TAB==='personal')loadPersonalYear(FISCAL_YEAR);
    else{loadGastosYear(FISCAL_YEAR);if(typeof loadCompras==='function')loadCompras();}
    reRenderFiscal();
  });
  /* Copy year buttons */
  document.querySelectorAll('.fiscal-copy-year-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var srcYear=parseInt(btn.dataset.copyYear,10);
      if(!srcYear)return;
      if(!confirm('¿Copiar datos de '+srcYear+' al año '+FISCAL_YEAR+'?'))return;
      if(FISCAL_TAB==='personal'){
        loadPersonalYear(srcYear);
        savePersonalYear(FISCAL_YEAR);
        loadPersonalYear(FISCAL_YEAR);
      }else{
        loadGastosYear(srcYear);
        saveGastosYear(FISCAL_YEAR);
        loadGastosYear(FISCAL_YEAR);
      }
      reRenderFiscal();
      showToast('Datos de '+srcYear+' copiados','success');
    });
  });

}

function _bindTabPersonal(){
  /* Event delegation for all sections */
  var fCont=document.getElementById('fiscalContent');
  var body=fCont?fCont.querySelector('.sy-body'):null;
  if(!body||body._personalDel)return;
  body._personalDel=true;
  /* Add buttons — preserve scroll position */
  body.addEventListener('click',function(e){
    var addBtn=e.target.closest('[data-padd]');
    if(addBtn){
      var sec=addBtn.dataset.padd;
      var isWeekly=sec==='gastosSemanales';
      var isViaje=addBtn.dataset.viaje==='1';
      var newItem={id:sec+'_'+Date.now(),label:isViaje?'Viaje':'',amount:0};
      if(isWeekly)newItem.period='weekly';
      else newItem.period=isViaje?'annual':'monthly';
      if(isViaje){newItem._viaje=true;newItem.viajeFilter='all';}
      PERSONAL_DATA[sec].push(newItem);
      reRenderFiscal();
      return;
    }
    /* Delete */
    var del=e.target.closest('.fiscal-personal-del');
    if(del){
      var sec=del.dataset.ps,pi=parseInt(del.dataset.pi,10);
      if(PERSONAL_DATA[sec])PERSONAL_DATA[sec].splice(pi,1);
      reRenderFiscal();
      return;
    }
    /* Period toggle */
    var per=e.target.closest('.fiscal-period-btn[data-pf="period"]');
    if(per){
      var sec=per.dataset.ps,pi=parseInt(per.dataset.pi,10);
      if(PERSONAL_DATA[sec]&&PERSONAL_DATA[sec][pi]){
        PERSONAL_DATA[sec][pi].period=per.dataset.val;
        per.closest('.fiscal-gasto-period').querySelectorAll('.fiscal-period-btn').forEach(function(b){b.classList.toggle('active',b.dataset.val===per.dataset.val);});
      }
    }
  });
  body.addEventListener('change',function(e){
    var el=e.target;
    var sec=el.dataset.ps,pi=parseInt(el.dataset.pi,10),field=el.dataset.pf;
    if(!sec||isNaN(pi)||!PERSONAL_DATA[sec]||!PERSONAL_DATA[sec][pi])return;
    if(field==='amount'){var v=parseFloat(el.value);PERSONAL_DATA[sec][pi].amount=isNaN(v)?0:v;}
    else if(field==='label'){PERSONAL_DATA[sec][pi].label=el.value||'';}
    else if(field==='viajeFilter'){PERSONAL_DATA[sec][pi].viajeFilter=el.value||'all';}
  });
}

function _bindTabIrpf(){
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
  var gdInput=document.getElementById('gastosDificilInput');
  if(gdInput)gdInput.addEventListener('change',function(){
    var v=parseFloat(this.value);
    if(v>=0&&v<=15)GASTOS_DIFICIL_PCT=v;
  });
  document.getElementById('fiscalRestore').addEventListener('click',function(){
    FISCAL.brackets=null;
    reRenderFiscal();
  });
  document.getElementById('fiscalAddBracket').addEventListener('click',function(){
    var brackets=getBrackets().slice();
    var last=brackets[brackets.length-1];
    brackets.push({from:last.to===Infinity?300000:last.to,to:Infinity,pct:47});
    FISCAL.brackets=brackets;
    reRenderFiscal();
  });
  document.querySelectorAll('.fbi-del').forEach(function(btn){
    btn.addEventListener('click',function(){
      var bi=parseInt(this.dataset.bi,10);
      var brackets=getBrackets().slice();
      if(brackets.length<=1){showToast('Debe haber al menos 1 tramo','error');return;}
      brackets.splice(bi,1);
      FISCAL.brackets=brackets;
      reRenderFiscal();
    });
  });
}

function _bindTabGastosDesg(){
  /* Gastos: event delegation */
  var gastosList=document.getElementById('fiscalGastosList');
  if(gastosList&&!gastosList._del){
    gastosList._del=true;
    gastosList.addEventListener('click',function(e){
      var btn=e.target.closest('.fiscal-period-btn[data-gfield="period"]');
      if(btn){
        var gi=parseInt(btn.dataset.gi,10);
        GASTOS_ITEMS[gi].period=btn.dataset.val;
        btn.closest('.fiscal-gasto-period').querySelectorAll('.fiscal-period-btn').forEach(function(b){b.classList.toggle('active',b.dataset.val===btn.dataset.val);});
        return;
      }
      var del=e.target.closest('.fiscal-gasto-del');
      if(del&&del.dataset.gi!==undefined){
        GASTOS_ITEMS.splice(parseInt(del.dataset.gi,10),1);
        document.getElementById('fiscalGastosList').innerHTML=renderGastosList();
      }
    });
    gastosList.addEventListener('change',function(e){
      var el=e.target;var gi=parseInt(el.dataset.gi,10);if(isNaN(gi))return;
      var field=el.dataset.gfield;
      if(field==='amount'){var v=parseFloat(el.value);GASTOS_ITEMS[gi].amount=isNaN(v)?0:v;}
      else if(field==='label'){GASTOS_ITEMS[gi].label=el.value||'Gasto';}
    });
  }
  /* Ingresos desgravables (plan_pension) */
  var ingList=document.getElementById('fiscalIngresosDesgList');
  if(ingList&&!ingList._del){
    ingList._del=true;
    ingList.addEventListener('change',function(e){
      var el=e.target;var gi=parseInt(el.dataset.gi,10);if(isNaN(gi))return;
      if(el.dataset.gfield==='amount'){var v=parseFloat(el.value);GASTOS_ITEMS[gi].amount=isNaN(v)?0:v;}
    });
  }
  document.getElementById('fiscalAddGasto').addEventListener('click',function(){
    GASTOS_ITEMS.push({id:'custom_'+Date.now(),label:'Nuevo gasto',amount:0,period:'monthly'});
    document.getElementById('fiscalGastosList').innerHTML=renderGastosList();
  });
  /* Toggle global IVA compras */
  var civTog=document.getElementById('comprasIvaToggle');
  if(civTog)civTog.addEventListener('click',function(){
    COMPRAS_IVA_ENABLED=!COMPRAS_IVA_ENABLED;
    this.textContent=COMPRAS_IVA_ENABLED?'ON':'OFF';
    this.classList.toggle('on',COMPRAS_IVA_ENABLED);
    document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
    _rebindComprasDel();
  });
  /* Compras: event delegation */
  function _rebindComprasDel(){
    var comprasList=document.getElementById('fiscalComprasList');
    if(!comprasList||comprasList._del)return;
    comprasList._del=true;
    comprasList.addEventListener('click',function(e){
      var tgl=e.target.closest('[data-ctgl]');
      if(tgl){
        var ci=parseInt(tgl.dataset.ctgl,10);
        COMPRAS_ITEMS[ci].enabled=!COMPRAS_ITEMS[ci].enabled;
        document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
        return;
      }
      var civtgl=e.target.closest('[data-civtgl]');
      if(civtgl){
        var ci=parseInt(civtgl.dataset.civtgl,10);
        COMPRAS_ITEMS[ci].ivaIncluded=!COMPRAS_ITEMS[ci].ivaIncluded;
        document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
        return;
      }
      var del=e.target.closest('.fiscal-compras-del');
      if(del){
        COMPRAS_ITEMS.splice(parseInt(del.dataset.ci,10),1);
        document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
      }
    });
    comprasList.addEventListener('change',function(e){
      var el=e.target;var ci=parseInt(el.dataset.ci,10);if(isNaN(ci))return;
      var field=el.dataset.cfield;
      if(field==='amount'){var v=parseFloat(el.value);COMPRAS_ITEMS[ci].amount=isNaN(v)?0:v;document.getElementById('fiscalComprasList').innerHTML=renderComprasList();}
      else if(field==='label'){COMPRAS_ITEMS[ci].label=el.value||'Compra';}
      else if(field==='ivaPct'){var p=parseInt(el.value,10);COMPRAS_ITEMS[ci].ivaPct=isNaN(p)?21:p;document.getElementById('fiscalComprasList').innerHTML=renderComprasList();}
      else if(field==='quarter'){var q=el.value===''?null:parseInt(el.value,10);COMPRAS_ITEMS[ci].quarter=isNaN(q)?null:q;document.getElementById('fiscalComprasList').innerHTML=renderComprasList();}
    });
  }
  _rebindComprasDel();
  document.getElementById('fiscalAddCompra').addEventListener('click',function(){
    COMPRAS_ITEMS.push({id:'compra_'+Date.now(),label:'Nueva compra',amount:0,enabled:true,ivaIncluded:false,ivaPct:21,quarter:null});
    document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
    _rebindComprasDel();
  });
}

function _bindTabIrpfDeduc(){
  /* Sub-tab clicks */
  document.querySelectorAll('[data-firsub]').forEach(function(btn){
    btn.addEventListener('click',function(){
      FISCAL_IRPF_SUB=btn.dataset.firsub;
      reRenderFiscal();
    });
  });
  if(FISCAL_IRPF_SUB==='irpf')_bindTabIrpf();
  else if(FISCAL_IRPF_SUB==='despacho')_bindTabDespachoOnly();
  else _bindTabDesgrav();
}

function _bindTabDesgrav(){
  /* Delegación unificada para ambas listas */
  function _bindList(containerId){
    var list=document.getElementById(containerId);
    if(!list||list._del)return;
    list._del=true;
    list.addEventListener('click',function(e){
      var tgl=e.target.closest('[data-dtgl]');
      if(tgl){
        var di=parseInt(tgl.dataset.dtgl,10);
        DESGRAV_ITEMS[di].enabled=!DESGRAV_ITEMS[di].enabled;
        reRenderFiscal();
        return;
      }
      var del=e.target.closest('.fiscal-desgrav-del');
      if(del){
        var di=parseInt(del.dataset.di,10);
        DESGRAV_ITEMS.splice(di,1);
        reRenderFiscal();
        return;
      }
      var lnk=e.target.closest('.fiscal-desgrav-link');
      if(lnk){
        var gastoId=lnk.dataset.linkGasto;
        if(gastoId==='_compras_total'){
          FISCAL_TAB='gastos_desg';reRenderFiscal();
          setTimeout(function(){var el=document.getElementById('fiscalComprasList');if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('fiscal-highlight');setTimeout(function(){el.classList.remove('fiscal-highlight');},1500);}},80);
        }else{
          FISCAL_TAB='gastos_desg';reRenderFiscal();
          setTimeout(function(){
            for(var gi=0;gi<GASTOS_ITEMS.length;gi++){
              if(GASTOS_ITEMS[gi].id===gastoId){
                var el=document.querySelector('.fiscal-gasto-item[data-gi="'+gi+'"]');
                if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('fiscal-highlight');setTimeout(function(){el.classList.remove('fiscal-highlight');},1500);}
                break;
              }
            }
          },80);
        }
      }
    });
    list.addEventListener('change',function(e){
      var el=e.target;
      var di=parseInt(el.dataset.di,10);if(isNaN(di))return;
      var field=el.dataset.difield;
      if(el.classList.contains('fiscal-desgrav-amt')){
        var v=parseFloat(el.value);DESGRAV_ITEMS[di].amount=isNaN(v)?0:v;
        reRenderFiscal();
      }else if(field==='label'){DESGRAV_ITEMS[di].label=el.value||'Desgravaci\u00f3n';}
    });
  }
  _bindList('fiscalDesgravList');
  _bindList('fiscalDesgravListQuota');
  document.getElementById('fiscalAddDesgrav').addEventListener('click',function(){
    DESGRAV_ITEMS.push({id:'desgrav_'+Date.now(),label:'Nueva desgravaci\u00f3n',amount:0,limit:null,enabled:true,type:'base'});
    reRenderFiscal();
  });
  /* Links from despacho deductions → other tabs */
  var despSection=document.querySelector('.fiscal-desgrav-despacho-section');
  if(despSection&&!despSection._linkDel){
    despSection._linkDel=true;
    despSection.addEventListener('click',function(e){
      var link=e.target.closest('.fiscal-desp-link');
      if(link){
        if(link.dataset.linkTab==='despacho-sub'){FISCAL_IRPF_SUB='despacho';reRenderFiscal();}
        else if(link.dataset.linkTab==='despacho-tab'){FISCAL_TAB='despacho';reRenderFiscal();}
        return;
      }
      /* Link "ir a Resultado declaración": cierra fiscal, abre econ → gastos → scroll a #resultadoDeclaracion */
      if(e.target.id==='despFiscalGotoAhorro'){
        e.stopPropagation();
        if(typeof closeFiscal==='function')closeFiscal();
        setTimeout(function(){
          if(typeof openEcon==='function'){openEcon();}
          setTimeout(function(){
            if(typeof ECON_VIEW!=='undefined'){ECON_VIEW='gastos';if(typeof reRenderEcon==='function')reRenderEcon();}
            setTimeout(function(){
              var el=document.getElementById('resultadoDeclaracion');
              if(el)el.scrollIntoView({block:'start',behavior:'smooth'});
            },200);
          },200);
        },350);
        return;
      }
      var tgl=e.target.closest('[data-dedtgl]');
      if(tgl){
        var key=tgl.dataset.dedtgl;
        if(!DESPACHO.deducciones)DESPACHO.deducciones={amortizacion:true,ibi:true,hipotecaInt:true,casa:true,suministros:true};
        DESPACHO.deducciones[key]=DESPACHO.deducciones[key]===false?true:false;
        saveDespacho();
        reRenderFiscal();
      }
    });
  }
}

function _bindTabDespachoOnly(){
  /* Toggle on/off */
  var tog=document.getElementById('despachoToggle');
  if(tog)tog.addEventListener('click',function(){
    DESPACHO.enabled=!DESPACHO.enabled;
    reRenderFiscal();
  });
  /* Sincronización en tiempo real entre m²despacho ↔ % */
  var m2TotalEl=document.getElementById('desp-m2Total');
  var m2DespEl=document.getElementById('desp-m2Despacho');
  var pctEl=document.getElementById('desp-pct');
  function _syncLiveD(changed){
    var m2T=parseFloat(m2TotalEl?m2TotalEl.value:0)||0;
    var m2D=parseFloat(m2DespEl?m2DespEl.value:0)||0;
    var p=parseFloat(pctEl?pctEl.value:0)||0;
    if(changed==='m2Despacho'||changed==='m2Total'){
      if(m2T>0&&pctEl)pctEl.value=(Math.round(m2D/m2T*1000)/10).toFixed(1);
    }else if(changed==='pct'){
      if(m2T>0&&m2DespEl)m2DespEl.value=(Math.round(p*m2T/100*10)/10).toFixed(1);
    }
  }
  if(m2TotalEl){
    m2TotalEl.addEventListener('input',function(){_syncLiveD('m2Total');});
    m2TotalEl.addEventListener('change',function(){
      DESPACHO.m2Total=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0)DESPACHO.pct=Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10;
      reRenderFiscal();
    });
  }
  if(m2DespEl){
    m2DespEl.addEventListener('input',function(){_syncLiveD('m2Despacho');});
    m2DespEl.addEventListener('change',function(){
      DESPACHO.m2Despacho=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0)DESPACHO.pct=Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10;
      reRenderFiscal();
    });
  }
  if(pctEl){
    pctEl.addEventListener('input',function(){_syncLiveD('pct');});
    pctEl.addEventListener('change',function(){
      DESPACHO.pct=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0)DESPACHO.m2Despacho=Math.round(DESPACHO.pct*DESPACHO.m2Total/100*10)/10;
      reRenderFiscal();
    });
  }
  /* Campos monetarios despacho */
  ['valorCatastral','valorCatastralConstruccion','hipotecaIntereses'].forEach(function(field){
    var el=document.getElementById('desp-'+field);
    if(!el)return;
    function _updateFmt(){
      var v=parseFloat(el.value)||0;
      var fmtEl=document.getElementById('desp-fmt-'+field);
      if(fmtEl)fmtEl.textContent=v>0?_fmtMiles(v)+' \u20ac':'';
    }
    el.addEventListener('input',_updateFmt);
    el.addEventListener('change',function(){
      DESPACHO[field]=parseFloat(this.value)||0;
      _updateFmt();
      reRenderFiscal();
    });
  });
  /* Recalcular intereses button */
  var recalcBtn=document.getElementById('despRecalcInt');
  if(recalcBtn){
    recalcBtn.addEventListener('click',function(){
      DESPACHO.hipotecaInteresesManual=false;
      reRenderFiscal();
    });
  }
  /* Manual override */
  var hipIntEl=document.getElementById('desp-hipotecaIntereses');
  if(hipIntEl){
    hipIntEl.addEventListener('change',function(){
      var autoInt=_computeAnnualInterest(DESPACHO.compra,FISCAL_YEAR);
      var newVal=parseFloat(this.value)||0;
      if(autoInt>0&&Math.abs(newVal-autoInt)>0.5){
        DESPACHO.hipotecaInteresesManual=true;
      }
    });
  }
}


function _saveFiscalAll(){
  if(FISCAL.irpfMode==='custom'){
    var pctEl=document.getElementById('fiscalPctInput');
    if(pctEl){
      var pct=parseFloat(pctEl.value);
      if(isNaN(pct)||pct<=15){
        var errEl=document.getElementById('fiscalPctError');
        if(errEl)errEl.style.display='';
        showToast('El IRPF personalizado debe ser &gt;15%','error');return;
      }
      FISCAL.irpfPct=Math.round(pct*100)/100;
    }
  }
  if(FISCAL_TAB==='irpf_deduc'&&FISCAL_IRPF_SUB==='irpf'){
    var gdV=parseFloat((document.getElementById('gastosDificilInput')||{}).value);
    if(!isNaN(gdV)&&gdV>=0&&gdV<=15)GASTOS_DIFICIL_PCT=gdV;
    var rows=document.querySelectorAll('#fiscalBracketTable tbody tr');
    if(rows.length>0){
      var brackets=[];
      rows.forEach(function(row){
        var fromV=parseFloat(row.querySelector('.fbi-from').value)||0;
        var toRaw=row.querySelector('.fbi-to').value;
        var toV=toRaw===''?Infinity:parseFloat(toRaw)||0;
        brackets.push({from:fromV,to:toV,pct:parseFloat(row.querySelector('.fbi-pct').value)||0});
      });
      if(brackets.length>0)FISCAL.brackets=brackets;
    }
  }
  /* Leer valores despacho directamente del DOM (evita pérdida por re-render) */
  var _rv=function(id){var el=document.getElementById('desp-'+id);return el?parseFloat(el.value)||0:null;};
  var v;
  /* Despacho sub-tab (dentro de IRPF y Deducciones) */
  if(FISCAL_TAB==='irpf_deduc'&&FISCAL_IRPF_SUB==='despacho'){
    v=_rv('m2Total');if(v!==null)DESPACHO.m2Total=v;
    v=_rv('m2Despacho');if(v!==null)DESPACHO.m2Despacho=v;
    v=_rv('pct');if(v!==null)DESPACHO.pct=v;
    v=_rv('valorCatastral');if(v!==null)DESPACHO.valorCatastral=v;
    v=_rv('valorCatastralConstruccion');if(v!==null)DESPACHO.valorCatastralConstruccion=v;
    v=_rv('hipotecaIntereses');if(v!==null)DESPACHO.hipotecaIntereses=v;
    if(DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0)DESPACHO.pct=Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10;
  }
  /* Hipoteca tab */
  if(FISCAL_TAB==='despacho'){
    if(!DESPACHO.compra)DESPACHO.compra=_defaultCompra();
    v=_rv('compraValor');if(v!==null){DESPACHO.compra.valorCompraTotal=v;DESPACHO.valorCompra=v;}
    v=_rv('compraItp');if(v!==null)DESPACHO.compra.itpMadrid=v;
    v=_rv('compraNotaria');if(v!==null)DESPACHO.compra.notariaRegistro=v;
    v=_rv('compraTasacion');if(v!==null)DESPACHO.compra.tasacion=v;
    v=_rv('compraReformas');if(v!==null)DESPACHO.compra.reformas=v;
    v=_rv('compraInmobiliaria');if(v!==null)DESPACHO.compra.inmobiliaria=v;
    v=_rv('compraImporte');if(v!==null)DESPACHO.compra.importePrestamo=v;
    v=_rv('compraTipo');if(v!==null)DESPACHO.compra.tipoInteres=v;
    v=_rv('compraPlazo');if(v!==null)DESPACHO.compra.plazoAnios=v;
  }
  saveFiscal();
  saveGastosYear(FISCAL_YEAR);
  savePersonalYear(FISCAL_YEAR);
  saveDesgrav();
  saveDespacho();
  saveCompras();
  showToast('Configuraci\u00f3n guardada','success');
  closeFiscal();
  var ec=document.getElementById('econContent');
  if(ec&&ec.innerHTML){ec.innerHTML=renderEconContent();bindEconEvents();}
}

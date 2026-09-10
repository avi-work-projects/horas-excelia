function bindBdayFormEvents(){
  document.getElementById('bdFClose').addEventListener('click',closeBdayForm);
  var delBtn=document.getElementById('bdFDel');
  if(delBtn){
    delBtn.addEventListener('click',function(){
      if(!BDAY_EDIT)return;
      BDAYS=BDAYS.filter(function(x){return!(x.name===BDAY_EDIT.name&&x.day===BDAY_EDIT.day&&x.month===BDAY_EDIT.month);});
      appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
      syncVipBdaysToEvents();
      showToast('Cumplea\u00f1os eliminado','success');
      updateBdayBtn();closeBdayForm();setTimeout(refreshBday,320);
    });
  }
  document.getElementById('bdFSave').addEventListener('click',function(){
    var name=document.getElementById('bdFName').value.trim();
    var day=parseInt(document.getElementById('bdFDay').value,10);
    var month=parseInt(document.getElementById('bdFMonth').value,10);
    var vipChk=document.getElementById('bdFVip');
    var vip=vipChk?vipChk.checked:false;
    if(!name){showToast('El nombre es obligatorio','error');return;}
    var issue=birthdayValidation({name:name,day:day,month:month,vip:vip},BDAY_EDIT);
    if(issue){showToast(issue,'error');return;}
    if(BDAY_EDIT){
      var idx=-1;
      for(var i=0;i<BDAYS.length;i++){
        if(BDAYS[i].name===BDAY_EDIT.name&&BDAYS[i].day===BDAY_EDIT.day&&BDAYS[i].month===BDAY_EDIT.month){idx=i;break;}
      }
      var previous=idx>=0?JSON.parse(JSON.stringify(BDAYS[idx])):null;
      var updated={name:name,day:day,month:month,vip:vip||undefined};
      if(idx!==-1)BDAYS[idx]=updated;
      showToast('Cumplea\u00f1os actualizado','success',function(){
        var current=BDAYS.indexOf(updated);
        if(previous&&current>=0){
          BDAYS[current]=previous;
          appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
          syncVipBdaysToEvents();updateBdayBtn();_bdRefreshBoth();
        }
      });
    } else {
      var newB={name:name,day:day,month:month};
      if(vip)newB.vip=true;
      BDAYS.push(newB);
      showToast('Cumplea\u00f1os a\u00f1adido','success');
    }
    appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
    syncVipBdaysToEvents();
    updateBdayBtn();closeBdayForm();setTimeout(refreshBday,320);
  });
}

/* ── Apertura/cierre ventana ──────────────────────────────── */
function openBday(){
  NAV_BACK=null;
  var now=new Date();BDAY_YEAR=now.getFullYear();BDAY_MONTH=now.getMonth();BDAY_VIEW='upcoming';
  var ov=document.getElementById('bdayOverlay');
  document.getElementById('bdayContent').innerHTML=renderBdayContent();
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindBdayEvents();});});
}

function closeBday(){
  var ov=document.getElementById('bdayOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}

function refreshBday(){
  document.getElementById('bdayContent').innerHTML=renderBdayContent();
  bindBdayEvents();
  if(typeof EV_VIEW!=='undefined'&&EV_VIEW==='birthdays')refreshEvents();
}

function applyBdaySearch(q){
  document.querySelectorAll('.bday-month-section').forEach(function(sec){
    var vis=0;
    sec.querySelectorAll('.bday-list-item').forEach(function(item){
      var match=!q||(item.dataset.sname&&item.dataset.sname.indexOf(q)>=0);
      item.style.display=match?'':'none';
      if(match)vis++;
    });
    sec.style.display=vis?'':'none';
  });
}

function bindBdayEvents(){
  var bdBackEl=document.getElementById('bdBack');
  if(bdBackEl)bdBackEl.addEventListener('click',function(){
    if(NAV_BACK){var fn=NAV_BACK;NAV_BACK=null;fn();}else{closeBday();}
  });
  bindNavBar('bday',closeBday);
  var prevBtn=document.getElementById('bdPrev');
  if(prevBtn)prevBtn.addEventListener('click',function(){
    BDAY_MONTH--;if(BDAY_MONTH<0){BDAY_MONTH=11;BDAY_YEAR--;}refreshBday();
  });
  var nextBtn=document.getElementById('bdNext');
  if(nextBtn)nextBtn.addEventListener('click',function(){
    BDAY_MONTH++;if(BDAY_MONTH>11){BDAY_MONTH=0;BDAY_YEAR++;}refreshBday();
  });
  var todayBtn=document.getElementById('bdToday');
  if(todayBtn)todayBtn.addEventListener('click',function(){
    var n=new Date();BDAY_YEAR=n.getFullYear();BDAY_MONTH=n.getMonth();refreshBday();
  });
  // Listener global para cerrar el minimenu al clicar fuera (se añade una sola vez)
  if(!_bdCtrlDocListenerAdded){
    _bdCtrlDocListenerAdded=true;
    document.addEventListener('click',function(e){
      if(!e.target.closest('.bday-inline-ctrl')){
        var ctrl=document.querySelector('.bday-inline-ctrl');
        if(ctrl){
          ctrl.remove();
          if(_bdPendingRefresh){_bdPendingRefresh=false;refreshBday();}
        }
      }
    });
  }
  function _bdResetScroll(){var b=document.querySelector('#bdayOverlay .sy-body');if(b)b.scrollTop=0;}
  /* La lista arranca en el mes en curso; el resto queda a un scroll de distancia */
  function _bdScrollToMonth(){
    var body=document.querySelector('#bdayOverlay .sy-body');
    if(!body)return;
    var sec=body.querySelector('.bday-month-section[data-month="'+(new Date()).getMonth()+'"]');
    if(!sec){body.scrollTop=0;return;}
    body.scrollTop=Math.max(0,body.scrollTop+sec.getBoundingClientRect().top-body.getBoundingClientRect().top-8);
  }
  document.getElementById('bdViewUpcoming').addEventListener('click',function(){BDAY_SEARCH='';BDAY_FILTER_VIP='all';BDAY_EDIT_VIP=false;BDAY_VIP_PENDING=null;BDAY_VIEW='upcoming';refreshBday();_bdResetScroll();});
  document.getElementById('bdViewCal').addEventListener('click',function(){BDAY_SEARCH='';BDAY_FILTER_VIP='all';BDAY_EDIT_VIP=false;BDAY_VIP_PENDING=null;BDAY_VIEW='cal';refreshBday();_bdResetScroll();});
  document.getElementById('bdViewList').addEventListener('click',function(){BDAY_VIP_PENDING=null;BDAY_EDIT_VIP=false;BDAY_VIEW='list';refreshBday();_bdScrollToMonth();});
  // Filter chips: Todos / Solo VIP / Sin VIP
  var bdVipAllEl=document.getElementById('bdVipAll');
  if(bdVipAllEl)bdVipAllEl.addEventListener('click',function(){
    BDAY_FILTER_VIP='all';BDAY_SEARCH='';refreshBday();
    _bdScrollToMonth();
  });
  var bdVipOnlyEl=document.getElementById('bdVipOnly');
  if(bdVipOnlyEl)bdVipOnlyEl.addEventListener('click',function(){BDAY_FILTER_VIP=BDAY_FILTER_VIP==='vip'?'all':'vip';BDAY_SEARCH='';refreshBday();});
  var bdVipNoneEl=document.getElementById('bdVipNone');
  if(bdVipNoneEl)bdVipNoneEl.addEventListener('click',function(){BDAY_FILTER_VIP=BDAY_FILTER_VIP==='novip'?'all':'novip';BDAY_SEARCH='';refreshBday();});
  // Botón "Editar VIPs" / "✓ Listo": entra en modo edición O guarda y sale
  var editVipEl=document.getElementById('bdEditVip');
  if(editVipEl)editVipEl.addEventListener('click',function(){
    if(BDAY_EDIT_VIP){
      // "✓ Listo" → aplica BDAY_VIP_PENDING, guarda y refresca
      if(BDAY_VIP_PENDING!==null){
        Object.keys(BDAY_VIP_PENDING).forEach(function(k){
          var i=parseInt(k,10);
          if(i>=0&&i<BDAYS.length){
            if(BDAY_VIP_PENDING[k])BDAYS[i].vip=true;else delete BDAYS[i].vip;
          }
        });
        appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
        syncVipBdaysToEvents();updateBdayBtn();
      }
      BDAY_EDIT_VIP=false;BDAY_VIP_PENDING=null;refreshBday();
    } else {
      // Entra en modo edición (UN solo refresco para cambiar la etiqueta del botón)
      BDAY_EDIT_VIP=true;BDAY_VIP_PENDING={};refreshBday();
    }
  });
  // Botón "Cancelar" — descarta cambios pendientes y sale del modo edición
  var cancelEditEl=document.getElementById('bdCancelEdit');
  if(cancelEditEl)cancelEditEl.addEventListener('click',function(){
    BDAY_EDIT_VIP=false;BDAY_VIP_PENDING=null;refreshBday();
  });
  var srch=document.getElementById('bdSearch');
  if(srch){
    if(BDAY_SEARCH){srch.value=BDAY_SEARCH;applyBdaySearch(BDAY_SEARCH);}
    srch.addEventListener('input',function(){
      BDAY_SEARCH=this.value.trim().toLowerCase();
      applyBdaySearch(BDAY_SEARCH);
    });
  }
  var addBtn=document.getElementById('bdAdd');
  if(addBtn)addBtn.addEventListener('click',function(){openBdayForm(null);});
  // Clic en día vacío del calendario → abre formulario con día/mes pre-rellenos
  document.querySelectorAll('.bday-cell[data-cal-day]').forEach(function(cell){
    cell.addEventListener('click',function(e){
      if(e.target.closest('.bday-badge'))return; // dejar que el badge maneje su propio clic
      var day=parseInt(cell.dataset.calDay,10);
      var month=parseInt(cell.dataset.calMonth,10);
      if(!isNaN(day)&&!isNaN(month))openBdayForm(null,day,month);
    });
  });
  // Clicks en badges del calendario
  document.querySelectorAll('.bday-badge[data-bday-name]').forEach(function(badge){
    badge.addEventListener('click',function(e){
      e.stopPropagation();
      var b=null;
      var idx=parseInt(badge.dataset.bdayIdx,10);
      if(!isNaN(idx)&&idx>=0&&idx<BDAYS.length){b=BDAYS[idx];}
      if(!b){
        var name=badge.dataset.bdayName;
        var day=parseInt(badge.dataset.bdayDay,10);
        var month=parseInt(badge.dataset.bdayMonth,10);
        for(var i=0;i<BDAYS.length;i++){if(BDAYS[i].name===name&&BDAYS[i].day===day&&BDAYS[i].month===month){b=BDAYS[i];break;}}
        if(!b)b={name:name,day:day,month:month};
      }
      openBdayDetail(b);
    });
  });
  // Clicks en lista por meses → detail (o toggle VIP en modo edición)
  document.querySelectorAll('.bday-list-item[data-bday-name]').forEach(function(item){
    item.addEventListener('touchstart',function(){
      _bdLpFired=false;
      var bidx=parseInt(item.dataset.bdayIdx,10);
      var b2=(!isNaN(bidx)&&bidx>=0&&bidx<BDAYS.length)?BDAYS[bidx]:null;
      if(!b2){var n=item.dataset.bdayName;var dd=parseInt(item.dataset.bdayDay,10);var dm=parseInt(item.dataset.bdayMonth,10);
        for(var i2=0;i2<BDAYS.length;i2++){if(BDAYS[i2].name===n&&BDAYS[i2].day===dd&&BDAYS[i2].month===dm){b2=BDAYS[i2];break;}}
        if(!b2)b2={name:n,day:dd,month:dm};}
      var _self=item;
      _bdLpTimer=setTimeout(function(){_bdLpTimer=null;_bdLpFired=true;_showBdayInlineCtrl(_self,b2);},500);
    },{passive:true});
    item.addEventListener('touchend',function(){if(_bdLpTimer){clearTimeout(_bdLpTimer);_bdLpTimer=null;}});
    item.addEventListener('touchmove',function(){if(_bdLpTimer){clearTimeout(_bdLpTimer);_bdLpTimer=null;}});
    item.addEventListener('click',function(e){
      if(_bdLpFired){_bdLpFired=false;return;}
      e.stopPropagation();
      var idx=parseInt(item.dataset.bdayIdx,10);
      if(BDAY_EDIT_VIP){
        // En modo edición: toggle VIP visual (DOM directo, sin refreshBday para evitar scroll)
        if(!isNaN(idx)&&idx>=0&&idx<BDAYS.length&&BDAY_VIP_PENDING!==null){
          var curEff=BDAY_VIP_PENDING.hasOwnProperty(idx)?BDAY_VIP_PENDING[idx]:!!BDAYS[idx].vip;
          var newEff=!curEff;
          BDAY_VIP_PENDING[idx]=newEff;
          // Toggle CSS dim/active sin re-render
          item.classList.remove(newEff?'bday-list-vip-dim':'bday-list-vip-active');
          item.classList.add(newEff?'bday-list-vip-active':'bday-list-vip-dim');
          // Añadir/quitar logo VIP dentro del span del nombre
          var nameSpan=item.querySelector('.bday-list-name');
          if(nameSpan){
            var existingImg=nameSpan.querySelector('.bday-vip-img');
            if(newEff){
              if(!existingImg){
                var vipImg=document.createElement('img');
                vipImg.src='./VIP.png';vipImg.className='bday-vip-img';vipImg.alt='VIP';
                nameSpan.appendChild(vipImg);
              }
            } else {
              if(existingImg)existingImg.remove();
            }
          }
        }
        return;
      }
      // Si hay un minimenu abierto, cerrarlo sin abrir el detalle de B
      var prevCtrl=document.querySelector('.bday-inline-ctrl');
      if(prevCtrl){prevCtrl.remove();return;}
      var b=null;
      if(!isNaN(idx)&&idx>=0&&idx<BDAYS.length){b=BDAYS[idx];}
      if(!b){
        var name=item.dataset.bdayName;
        var day=parseInt(item.dataset.bdayDay,10);
        var month=parseInt(item.dataset.bdayMonth,10);
        for(var i=0;i<BDAYS.length;i++){if(BDAYS[i].name===name&&BDAYS[i].day===day&&BDAYS[i].month===month){b=BDAYS[i];break;}}
        if(!b)b={name:name,day:day,month:month};
      }
      openBdayDetail(b);
    });
  });
  bindBdayUpcoming(document.getElementById('bdayContent'));
  // Export
  var bdExportEl=document.getElementById('bdExport');
  if(bdExportEl)bdExportEl.addEventListener('click',function(){
    if(!BDAYS.length){showToast('No hay cumplea\u00f1os para exportar','error');return;}
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(BDAYS,null,2));
    a.download='cumpleanos.json'; a.click();
  });
  /* Swipe: navegar mes anterior/siguiente (bdPrev/bdNext solo existen en vista cal) */
  addSwipe(document.getElementById('bdayOverlay'),function(){
    var b=document.getElementById('bdNext');if(b)b.click();
  },function(){
    var b=document.getElementById('bdPrev');if(b)b.click();
  });
}

/* Compartido por Cumpleanos y Eventos: mismos gestos y acciones. */
function bindBdayUpcoming(root){
  var vip=root.querySelector('.bday-up-vip');
  if(vip)vip.addEventListener('change',function(){BDAY_UP_VIP=this.checked;_bdRefreshBoth();});
  // Clicks en vista "Próximos" → ALARM panel
  root.querySelectorAll('.bday-upcoming-item[data-bday-name]').forEach(function(item){
    item.addEventListener('touchstart',function(){
      _bdLpFired=false;
      var bidxUp2=parseInt(item.dataset.bdayIdx,10);
      var b2=(!isNaN(bidxUp2)&&bidxUp2>=0&&bidxUp2<BDAYS.length)?BDAYS[bidxUp2]:null;
      if(!b2){
        var n=item.dataset.bdayName;var dd=parseInt(item.dataset.bdayDay,10);var dm=parseInt(item.dataset.bdayMonth,10);
        for(var i2=0;i2<BDAYS.length;i2++){if(BDAYS[i2].name===n&&BDAYS[i2].day===dd&&BDAYS[i2].month===dm){b2=BDAYS[i2];break;}}
        if(!b2)b2={name:n,day:dd,month:dm};
      }
      var _self=item;
      _bdLpTimer=setTimeout(function(){_bdLpTimer=null;_bdLpFired=true;_showBdayInlineCtrl(_self,b2);},500);
    },{passive:true});
    item.addEventListener('touchend',function(){if(_bdLpTimer){clearTimeout(_bdLpTimer);_bdLpTimer=null;}});
    item.addEventListener('touchmove',function(){if(_bdLpTimer){clearTimeout(_bdLpTimer);_bdLpTimer=null;}});
    item.addEventListener('click',function(){
      if(_bdLpFired){_bdLpFired=false;return;}
      var prev=document.querySelector('.bday-inline-ctrl');
      if(prev){prev.remove();return;}
      // No alarm panel for past birthdays
      var diff=parseInt(item.dataset.diff,10);
      if(!isNaN(diff)&&diff<0)return;
      /* Bug 1 fix: usar índice directo para evitar ambigüedad con dos VIPs el mismo día */
      var bidxUp=parseInt(item.dataset.bdayIdx,10);
      var b=null;
      if(!isNaN(bidxUp)&&bidxUp>=0&&bidxUp<BDAYS.length){b=BDAYS[bidxUp];}
      if(!b){
        var name=item.dataset.bdayName;
        var day=parseInt(item.dataset.bdayDay,10);
        var month=parseInt(item.dataset.bdayMonth,10);
        for(var i=0;i<BDAYS.length;i++){if(BDAYS[i].name===name&&BDAYS[i].day===day&&BDAYS[i].month===month){b=BDAYS[i];break;}}
        if(!b)b={name:name,day:day,month:month};
      }
      openBdayAlarm(b);
    });
  });
}

function bdayPanelHost(){
  var events=document.getElementById('eventsOverlay');
  return typeof EV_VIEW!=='undefined'&&EV_VIEW==='birthdays'&&events&&events.classList.contains('open')?events:document.getElementById('bdayOverlay');
}

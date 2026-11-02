/* Home opens Kairo's monthly calendar. Only civil day types cross the frame. */
async function kairoGet(url){
  var controller=new AbortController(),timeout=setTimeout(function(){controller.abort();},4500);
  try{
    var response=await fetch(url,{signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',targetAddressSpace:'local'});
    if(!response.ok)throw Error('Kairo ha respondido con un error de acceso o servicio ('+response.status+').');
    return await response.json();
  }catch(error){
    if(error.name==='AbortError'||error instanceof TypeError)throw Error(hoursCheckMessage('network'));
    throw error;
  }finally{clearTimeout(timeout);}
}
async function openCheckedInvoice(href){
  var url=new URL(href),period=url.searchParams.get('period'),popup=window.open('about:blank','_blank');
  if(!popup){showToast('Permite abrir la revisión de Kairo.','error');return;}
  popup.opener=null;popup.document.body.textContent='Conectando con Kairo…';
  try{
    var base=invoiceKairoUrl(invoiceData().config.kairoUrl);
    validateHomeInvoiceStatus(await kairoGet(base+'gestify-status?period='+period),period);
    if(!popup.closed)popup.location.replace(href);
  }catch(error){popup.close();showToast(error.message,'error');}
}
function openMailCalendar(){
  var base=hoursKairoUrl();
  if(!base){openInvoiceSettings({connection:true});return;}
  var period=mkey(CY,CM),origin=new URL(base).origin,previous=NAV_BACK;
  var dialog=document.createElement('dialog'),header=document.createElement('header'),back=document.createElement('button');
  var title=document.createElement('strong'),body=document.createElement('div'),note=document.createElement('p'),retry=document.createElement('button');
  var frame=document.createElement('iframe');
  dialog.className='hours-review-dialog';dialog.setAttribute('aria-label','Programación');
  back.textContent='Volver a Gestify';title.textContent='Programación';retry.textContent='Reintentar';
  frame.title='Programación de Kairo';frame.referrerPolicy='no-referrer';
  frame.setAttribute('sandbox','allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox');frame.setAttribute('allow','local-network-access');
  function receive(event){
    var message=event.data;
    if(event.origin!==origin||event.source!==frame.contentWindow||!message)return;
    if(message.type==='kairo-calendar-leaving'){dialog.prepend(header);return;}
    if(message.type==='kairo-calendar-close'){close();return;}
    if(message.type==='kairo-calendar-invoice'&&/^20\d\d-(0[1-9]|1[0-2])$/.test(message.period)){
      var url=invoiceData().config.kairoUrl,stored=INVOICE_HOME_CACHE.url===url&&INVOICE_HOME_CACHE.periods[message.period];
      if(stored&&stored.data&&stored.data.state!==message.state)fetchHomeInvoiceStatus(message.period,url,true);
      return;
    }
    if(message.type!=='kairo-calendar-month'||!/^20\d\d-(0[1-9]|1[0-2])$/.test(message.period))return;
    header.remove();
    var days=[],date=new Date(message.period+'-01T12:00:00');
    while(dk(date).slice(0,7)===message.period){
      var type=dayT(date);if(type!=='normal')days.push({date:dk(date),type:type});
      date=ad(date,1);
    }
    frame.contentWindow.postMessage({type:'gestify-calendar-days',period:message.period,days:days},origin);
  }
  async function connect(){
    note.textContent='Conectando con Kairo…';retry.hidden=true;
    try{
      var result=await kairoGet(base+'reachable');
      if(result.service!=='kairo-hours')throw Error('Respuesta inesperada de Kairo.');
      if(!dialog.open)return;
      frame.src=base+'calendario?period='+period;body.replaceWith(frame);
    }catch(error){note.textContent=error.message;retry.hidden=false;}
  }
  function close(){dialog.close();}
  dialog.addEventListener('close',function(){window.removeEventListener('message',receive);dialog.remove();if(NAV_BACK===close)NAV_BACK=previous;backFocus.focus();},{once:true});
  var backFocus=document.activeElement;
  back.onclick=close;retry.onclick=connect;header.append(title,back);body.append(note,retry);dialog.append(header,body);
  document.body.append(dialog);dialog.showModal();NAV_BACK=close;
  window.addEventListener('message',receive);connect();
}

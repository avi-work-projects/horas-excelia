function startMailCalendar(data,labels,draw){
  const el=id=>document.getElementById(id);
  const create=(tag,value,cls)=>{
    const node=document.createElement(tag);
    node.textContent=value;
    if(cls)node.className=cls;
    return node;
  };
  const privateOrigin=hoursBridgeConfig.origin;
  const prefsKey='kairo-programacion-filtros';
  let invoice=null,returnFromInvoice=false,wanted=data.period,navSeq=0,billSeq=0;
  const grid=el('calendar'),embedded=window.parent!==window;
  const mail=el('showMail'),invoices=el('showInvoices');
  try{
    const prefs=JSON.parse(sessionStorage.getItem(prefsKey));
    if(prefs){mail.checked=prefs.mail!==false;invoices.checked=prefs.invoices!==false;}
  }catch{}
  document.body.classList.add('k-agenda');
  document.title='Programación · Kairo';
  document.querySelector('footer.actions').hidden=true;
  el('title').textContent='Programación';
  document.querySelector('.badge').textContent='';
  el('intro').hidden=true;el('filters').hidden=false;
  el('message').textContent='';
  function dateTime(value){
    return new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
  }
  function row(label,state,tag,detail){
    const line=create('div','','k-schedule-row'),name=create('div',label,'k-week-range');
    if(detail)name.append(create('small',detail));
    const confirmed=state==='scheduled'||state==='sent';
    const badge=create('span',(confirmed?'✓ ':'')+tag,'k-state');badge.dataset.state=state;
    line.append(name,badge);return line;
  }
  const weeks=el('weeks'),bill=el('invoiceSchedule');
  weeks.className='k-card';
  function weekList(){
    weeks.replaceChildren(create('h2','Correos de horas'));
    const day=d=>new Intl.DateTimeFormat('es-ES',{timeZone:'UTC',day:'2-digit',month:'2-digit'}).format(d);
    for(const week of data.rows){
      const monday=new Date(week.key+'T12:00:00Z');
      const thursday=new Date(monday);thursday.setUTCDate(monday.getUTCDate()+3);
      const weekNumber=1+Math.floor((thursday-Date.UTC(thursday.getUTCFullYear(),0,1))/604800000);
      const friday=new Date(monday);friday.setUTCDate(monday.getUTCDate()+4);
      const estimate=week.estimatedDate?day(new Date(week.estimatedDate+'T12:00:00Z'))+' · fecha calculada':'';
      const state=week.state==='unverified'&&!week.checkedAt?'Sin programar':labels[week.state]||'Revisar';
      const entry=row(day(monday)+' – '+day(friday),week.state,state,week.schedule?dateTime(week.schedule):estimate);
      entry.prepend(create('span','S'+weekNumber,'k-week-number'));
      weeks.append(entry);
    }
  }
  const sync=el('calendarSync'),note=create('span',''),refresh=create('button','Actualizar'), feedback=el('message');
  sync.className='k-sync k-section-heading';
  sync.append(note,refresh);
  const billLabels={missing:'Sin preparar',draft:'Pendiente de aprobación',scheduled:'Programada',sent:'Enviada',processing:'En proceso',issued:'Emitida',attention:'Revisar',multiple:'Revisar'};
  function paint(){
    const focused=grid.contains(document.activeElement)?document.activeElement.getAttribute('aria-label'):null;
    draw(data,mail.checked,invoices.checked?invoice:null,move);
    if(focused)Array.from(grid.querySelectorAll('button')).find(b=>b.getAttribute('aria-label')===focused)?.focus({preventScroll:true});
    weeks.hidden=!mail.checked;bill.hidden=!invoices.checked;
    sync.hidden=!mail.checked&&!invoices.checked;
    const checks=data.rows.map(r=>r.checkedAt).filter(Boolean).sort((a,b)=>Date.parse(b)-Date.parse(a));
    note.textContent=mail.checked?(checks.length?'Correos · '+dateTime(checks[0]):'Sin programación registrada'):'Facturación de Kairo';
    bill.replaceChildren();
    const state=invoice?.state||'unknown';
    const label=billLabels[state]||(state==='loading'?'Consultando…':'Sin confirmar');
    const date=state==='scheduled'&&invoice.scheduledDate
      ?new Intl.DateTimeFormat('es-ES',{timeZone:'UTC',day:'numeric',month:'long'}).format(new Date(invoice.scheduledDate+'T12:00:00Z'))+' · 08:00'
      :new Intl.DateTimeFormat('es-ES',{timeZone:'UTC',month:'long'}).format(new Date(data.period+'-01T12:00:00Z'));
    const summary=row(date,state,label);
    summary.prepend(create('h2','Factura'));
    if(state==='scheduled'||state==='issued'){
      const details=create('details','','invoice-manage'),toggle=create('summary',''),actions=create('div','','k-action-list');
      const manage=create('a','Gestionar envío de factura','k-button');
      manage.href='/facturas/gestify-month?period='+data.period+'#aprobar';
      if(window.parent!==window){manage.target='_blank';manage.rel='noopener noreferrer';manage.onclick=()=>{returnFromInvoice=true;};}
      toggle.append(...summary.childNodes);toggle.className='k-schedule-row';
      actions.append(manage);details.append(toggle,actions);bill.append(details);
    }else bill.append(summary);
  }
  async function loadInvoice(period){
    try{
      const response=await fetch('/facturas/programacion?period='+period,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(6000)});
      if(!response.ok)throw Error();
      const result=await response.json();
      if(result.period!==period||!Object.hasOwn(billLabels,result.state)||
        (result.state==='scheduled'&&!/^20\d\d-\d\d-\d\d$/.test(result.scheduledDate)))throw Error();
      return result;
    }catch{return {state:'unknown'};}
  }
  async function readInvoice(loaded){
    const token=++billSeq,period=data.period;
    if(!invoice){invoice={state:'loading'};paint();}
    const result=await (loaded||loadInvoice(period));
    if(token!==billSeq||period!==data.period)return;
    invoice=result;
    if(result.period&&embedded)window.parent.postMessage({type:'kairo-calendar-invoice',period,state:result.state},privateOrigin);
    paint();
  }
  function resumeInvoice(){
    if(!document.hidden&&returnFromInvoice){returnFromInvoice=false;void readInvoice();}
  }
  window.addEventListener('focus',resumeInvoice);
  document.addEventListener('visibilitychange',resumeInvoice);
  window.addEventListener('pageshow',e=>{if(e.persisted&&invoices.checked)void readInvoice();});
  for(const input of [mail,invoices])input.onchange=()=>{
    try{sessionStorage.setItem(prefsKey,JSON.stringify({mail:mail.checked,invoices:invoices.checked}));}catch{}
    paint();
    if(invoices.checked&&!invoice)void readInvoice();
  };
  function requestCivilDays(){
    if(embedded)window.parent.postMessage({type:'kairo-calendar-month',period:data.period,periods:data.periods},privateOrigin);
  }
  async function readMonth(period){
    const response=await fetch('calendar-data?period='+period,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw Error();
    const result=await response.json();
    if(result.period!==period||!Array.isArray(result.rows)||!result.days)throw Error();
    return result;
  }
  async function navigate(period,historyMode,loaded,billLoad,previewInvoice){
    const token=++navSeq;wanted=period;feedback.textContent='';
    if(period===data.period){grid.removeAttribute('aria-busy');return;}
    grid.setAttribute('aria-busy','true');
    try{
      const result=await (loaded||readMonth(period));
      if(token!==navSeq)return;
      data=result;invoice=previewInvoice||null;++billSeq;returnFromInvoice=false;delete grid.dataset.synced;
      if(historyMode!=='pop')history[embedded?'replaceState':'pushState'](null,'','?period='+period);
      weekList();paint();requestCivilDays();
      if(invoices.checked)void readInvoice(billLoad);
    }catch{
      if(token===navSeq){wanted=data.period;feedback.textContent='No se ha podido abrir el mes. Vuelve a intentarlo.';if(historyMode==='pop')history.replaceState(null,'','?period='+data.period);}
    }finally{if(token===navSeq)grid.removeAttribute('aria-busy');}
  }
  function adjacent(period,step){
    const next=new Date(period+'-01T12:00:00Z');next.setUTCMonth(next.getUTCMonth()+step);
    return next.toISOString().slice(0,7);
  }
  function move(step){
    const period=adjacent(wanted,step);if(period.startsWith('20'))void navigate(period);
  }
  const firstPeriod=data.period;
  if(!embedded)window.addEventListener('popstate',()=>void navigate(new URL(location.href).searchParams.get('period')||firstPeriod,'pop'));
  weekList();paint();if(invoices.checked)void readInvoice();
  async function post(path,payload){
    const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':hoursBridgeConfig.csrf},body:JSON.stringify(payload)});
    if(!response.ok)throw Error('No se pudo consultar Kairo.');
    return response.json();
  }
  refresh.onclick=async()=>{
    const period=data.period;
    refresh.disabled=true;feedback.textContent='';
    try{
      if(invoices.checked)await readInvoice();
      if(!mail.checked||data.period!==period)return;
      feedback.textContent='Actualizando correos…';
      let job=await post('calendar-refresh',{period});
      while(['queued','running'].includes(job.phase)){
        await new Promise(resolve=>setTimeout(resolve,2000));
        const response=await fetch('jobs/'+job.jobId,{cache:'no-store'});
        if(!response.ok)throw Error('Comprueba la conexión con Kairo.');
        job=await response.json();
      }
      if(job.phase!=='done')throw Error(job.error||'Outlook requiere revisión.');
      const result=await readMonth(period);
      if(data.period===period){data=result;weekList();paint();requestCivilDays();feedback.textContent='Estado actualizado.';}
    }catch(error){if(data.period===period)feedback.textContent=error.message;}
    finally{refresh.disabled=false;}
  };
  // Both pages follow the finger. Keep the incoming page mounted until the
  // confirmed month has been painted, including while a slow read is in flight.
  const viewport=grid.parentElement;
  let gesture=null,settling=false;
  function resetSlide(){
    if(gesture?.preview)gesture.preview.remove();
    grid.style.transition='';grid.style.transform='';
    viewport.classList.remove('sliding');gesture=null;settling=false;
  }
  function displaySlide(dx){
    const g=gesture,step=dx<0?1:-1,period=adjacent(data.period,step);
    if(!period.startsWith('20'))return;
    if(g.period!==period){
      g.preview?.remove();g.period=period;g.step=step;
      const pane=document.createElement('section');
      pane.className='hours-calendar k-preview';pane.inert=true;pane.setAttribute('aria-hidden','true');
      viewport.append(pane);g.preview=pane;
      let previewMonth={period,rows:[],days:data.days};
      g.invoice=null;g.billLoad=invoices.checked?loadInvoice(period):null;
      const render=()=>draw(previewMonth,mail.checked,invoices.checked?g.invoice:null,move,pane);
      render();
      g.billLoad?.then(result=>{if(gesture===g&&g.preview===pane){g.invoice=result;render();}});
      g.load=readMonth(period);
      g.load.then(month=>{if(gesture===g&&g.preview===pane){previewMonth=month;render();}},()=>{});
    }
    const width=viewport.clientWidth;
    dx=Math.max(-width,Math.min(width,dx));viewport.classList.add('sliding');
    grid.style.transform='translate3d('+dx+'px,0,0)';
    g.preview.style.transform='translate3d('+(g.step*width+dx)+'px,0,0)';
  }
  async function finishSlide(commit){
    const g=gesture;
    if(!g?.preview){resetSlide();return;}
    settling=true;
    const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:160;
    grid.style.transition=g.preview.style.transition='transform '+duration+'ms ease-out';
    // Flush the drag offset before animating, also for a very fast flick.
    grid.getBoundingClientRect();
    grid.style.transform='translate3d('+(-g.step*viewport.clientWidth*(commit?1:0))+'px,0,0)';
    g.preview.style.transform='translate3d('+(g.step*viewport.clientWidth*(commit?0:1))+'px,0,0)';
    if(duration)await new Promise(resolve=>setTimeout(resolve,duration));
    if(commit)await navigate(g.period,'swipe',g.load,g.billLoad,g.invoice);
    resetSlide();
  }
  grid.addEventListener('touchstart',event=>{
    if(settling||wanted!==data.period||event.touches.length!==1)return;
    const t=event.touches[0];gesture={x:t.clientX,y:t.clientY};
  },{passive:true});
  grid.addEventListener('touchmove',event=>{
    if(!gesture||settling)return;
    if(event.touches.length!==1){resetSlide();return;}
    const dx=event.touches[0].clientX-gesture.x,dy=event.touches[0].clientY-gesture.y;
    if(!gesture.preview){
      if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){resetSlide();return;}
      if(Math.abs(dx)<6||Math.abs(dx)<Math.abs(dy)*1.25)return;
    }
    if(event.cancelable)event.preventDefault();displaySlide(dx||gesture.step*-0.1);
  },{passive:false});
  grid.addEventListener('touchcancel',()=>{if(gesture&&!settling)void finishSlide(false);});
  grid.addEventListener('touchend',event=>{
    if(!gesture||settling)return;
    const dx=event.changedTouches[0].clientX-gesture.x,dy=event.changedTouches[0].clientY-gesture.y;
    const commit=Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5;
    if(commit){if(event.cancelable)event.preventDefault();displaySlide(dx);}
    void finishSlide(commit);
  },{passive:false});
  if(window.parent===window)return;
  el('return').onclick=event=>{
    event.preventDefault();
    window.parent.postMessage({type:'kairo-calendar-close'},privateOrigin);
  };
  window.addEventListener('message',async event=>{
    const m=event.data;
    if(event.source!==window.parent||event.origin!==privateOrigin||m?.type!=='gestify-calendar-days'||m.period!==data.period)return;
    try{
      const visible=data,months=m.months||{[m.period]:m.days};
      const differs=Object.entries(months).some(([month,list])=>!data.syncedPeriods.includes(month)
        ||Object.keys(data.days).filter(key=>key.startsWith(month+'-')).length!==list.length||list.some(d=>data.days[d.date]!==d.type));
      if(differs){
        const result=await post('calendar-days',{period:m.period,months});
        if(data!==visible)return;
        data=result.calendar;weekList();paint();
      }
      grid.dataset.synced='true';
    }catch{if(data.period===m.period)feedback.textContent='No se pudieron sincronizar las jornadas.';}
  });
  requestCivilDays();
}

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
  let days=data.days,invoice=null;
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
  weeks.append(create('h2','Correos de horas'));
  for(const week of data.rows){
    const monday=new Date(week.key+'T12:00:00Z');
    const thursday=new Date(monday);thursday.setUTCDate(monday.getUTCDate()+3);
    const weekNumber=1+Math.floor((thursday-Date.UTC(thursday.getUTCFullYear(),0,1))/604800000);
    const friday=new Date(monday);friday.setUTCDate(monday.getUTCDate()+4);
    const day=d=>new Intl.DateTimeFormat('es-ES',{timeZone:'UTC',day:'2-digit',month:'2-digit'}).format(d);
    const entry=row(day(monday)+' – '+day(friday),week.state,labels[week.state]||'Revisar',week.schedule?dateTime(week.schedule):'');
    entry.prepend(create('span','S'+weekNumber,'k-week-number'));
    weeks.append(entry);
  }
  const sync=el('calendarSync'),note=create('span',''),refresh=create('button','Actualizar'), feedback=el('message');
  sync.className='k-sync k-section-heading';
  sync.append(note,refresh);
  const checks=data.rows.map(r=>r.checkedAt).filter(Boolean).sort((a,b)=>Date.parse(b)-Date.parse(a));
  const checked=checks.length?'Correos · '+dateTime(checks[0]):'Correos sin comprobar';
  const billLabels={missing:'Sin preparar',draft:'Pendiente de aprobación',scheduled:'Programada',sent:'Enviada',processing:'En proceso',issued:'Emitida',attention:'Revisar',multiple:'Revisar'};
  function paint(){
    draw(days,mail.checked,invoices.checked?invoice:null);
    weeks.hidden=!mail.checked;bill.hidden=!invoices.checked;
    sync.hidden=!mail.checked&&!invoices.checked;
    note.textContent=mail.checked?checked:'Facturación de Kairo';
    bill.replaceChildren();
    const state=invoice?.state||'unknown';
    const label=billLabels[state]||(state==='loading'?'Consultando…':'Sin confirmar');
    const date=state==='scheduled'&&invoice.scheduledDate
      ?new Intl.DateTimeFormat('es-ES',{timeZone:'UTC',day:'numeric',month:'long'}).format(new Date(invoice.scheduledDate+'T12:00:00Z'))+' · 08:00'
      :new Intl.DateTimeFormat('es-ES',{timeZone:'UTC',month:'long'}).format(new Date(data.period+'-01T12:00:00Z'));
    const summary=row(date,state,label);
    summary.prepend(create('h2','Factura'));bill.append(summary);
  }
  async function readInvoice(){
    invoice={state:'loading'};paint();
    try{
      const response=await fetch('/facturas/programacion?period='+data.period,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(6000)});
      if(!response.ok)throw Error();
      const result=await response.json();
      if(result.period!==data.period||!Object.hasOwn(billLabels,result.state)||
        (result.state==='scheduled'&&!/^20\d\d-\d\d-\d\d$/.test(result.scheduledDate)))throw Error();
      invoice=result;
    }catch{invoice={state:'unknown'};}
    paint();
  }
  for(const input of [mail,invoices])input.onchange=()=>{
    try{sessionStorage.setItem(prefsKey,JSON.stringify({mail:mail.checked,invoices:invoices.checked}));}catch{}
    paint();
    if(invoices.checked&&!invoice)void readInvoice();
  };
  paint();if(invoices.checked)void readInvoice();
  async function post(path,payload){
    const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':hoursBridgeConfig.csrf},body:JSON.stringify(payload)});
    if(!response.ok)throw Error('No se pudo consultar Kairo.');
    return response.json();
  }
  refresh.onclick=async()=>{
    refresh.disabled=true;feedback.textContent='';
    try{
      if(invoices.checked)await readInvoice();
      if(!mail.checked)return;
      feedback.textContent='Actualizando correos…';
      let job=await post('calendar-refresh',{period:data.period});
      while(['queued','running'].includes(job.phase)){
        await new Promise(resolve=>setTimeout(resolve,2000));
        const response=await fetch('jobs/'+job.jobId,{cache:'no-store'});
        if(!response.ok)throw Error('Comprueba la conexión con Kairo.');
        job=await response.json();
      }
      if(job.phase!=='done')throw Error(job.error||'Outlook requiere revisión.');
      location.reload();
    }catch(error){feedback.textContent=error.message;}
    finally{refresh.disabled=false;}
  };
  const grid=el('calendar');
  let touch=null;
  grid.addEventListener('touchstart',event=>{touch=event.touches.length===1?event.touches[0]:null;},{passive:true});
  grid.addEventListener('touchcancel',()=>{touch=null;});
  grid.addEventListener('touchend',event=>{
    if(!touch)return;
    const dx=event.changedTouches[0].clientX-touch.clientX,dy=event.changedTouches[0].clientY-touch.clientY;
    touch=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)grid.querySelector(dx<0?'[aria-label="Mes siguiente"]':'[aria-label="Mes anterior"]').click();
  },{passive:true});
  if(window.parent===window)return;
  el('return').onclick=event=>{
    event.preventDefault();
    window.parent.postMessage({type:'kairo-calendar-close'},privateOrigin);
  };
  window.addEventListener('message',async event=>{
    const m=event.data;
    if(event.source!==window.parent||event.origin!==privateOrigin||m?.type!=='gestify-calendar-days'||m.period!==data.period)return;
    try{
      const incoming=Object.fromEntries(m.days.map(d=>[d.date,d.type]));
      if(!data.daysSynced||Object.keys(incoming).length!==Object.keys(days).length||Object.keys(incoming).some(k=>incoming[k]!==days[k]))await post('calendar-days',{period:data.period,days:m.days});
      days=incoming;paint();grid.dataset.synced='true';
    }catch{feedback.textContent='No se pudieron sincronizar las jornadas.';}
  });
  window.parent.postMessage({type:'kairo-calendar-month',period:data.period},privateOrigin);
}

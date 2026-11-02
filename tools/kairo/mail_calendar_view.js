function startMailCalendar(data,labels,draw){
  const el=id=>document.getElementById(id);
  document.title='Programación de correos · Kairo';
  document.querySelector('footer.actions').hidden=true;
  el('title').textContent='Programación de correos';
  document.querySelector('.badge').textContent='Kairo';
  el('intro').textContent='Desliza para cambiar de mes.';
  el('message').textContent=data.daysSynced?'Calendario de jornadas sincronizado con Gestify.':'Jornadas según las semanas comprobadas. Abre este mes desde Gestify para sincronizar todos los días.';
  draw(data.days);
  const status=el('weeks');
  status.className='week';
  for(const row of data.rows){
    const line=document.createElement('div'),week=document.createElement('span'),value=document.createElement('strong');
    line.className='resolved-week';
    week.textContent='Semana del '+row.key.slice(5).split('-').reverse().join('/');
    value.textContent=labels[row.state]||'Por revisar';
    if(row.schedule)value.textContent+=' · '+new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(row.schedule));
    line.append(week,value);status.append(line);
  }
  const checks=data.rows.map(row=>row.checkedAt).filter(Boolean).sort();
  const note=document.createElement('p');
  note.textContent=checks.length?'Última lectura disponible · '+new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',dateStyle:'short',timeStyle:'short'}).format(new Date(checks.at(-1))):'Aún no se han comprobado estas semanas.';
  status.append(note);
  const refresh=document.createElement('button');refresh.textContent='Actualizar desde Outlook';status.append(refresh);
  async function post(path,payload){
    const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':hoursBridgeConfig.csrf},body:JSON.stringify(payload)});
    if(!response.ok)throw Error('Kairo no pudo completar la consulta.');
    return response.json();
  }
  refresh.onclick=async()=>{
    refresh.disabled=true;note.textContent='Kairo está comprobando Outlook. Puedes salir y volver.';
    try{
      let job=await post('calendar-refresh',{period:data.period});
      while(['queued','running'].includes(job.phase)){
        await new Promise(resolve=>setTimeout(resolve,2000));
        const response=await fetch('jobs/'+job.jobId,{cache:'no-store'});
        if(!response.ok)throw Error('Comprueba la conexión con Kairo.');
        job=await response.json();
      }
      if(job.phase!=='done')throw Error(job.error||'Outlook requiere revisión.');
      location.reload();
    }catch(error){note.textContent=error.message;refresh.disabled=false;}
  };
  let touch=null;
  const grid=el('calendar');
  grid.addEventListener('touchstart',event=>{touch=event.touches.length===1?event.touches[0]:null;},{passive:true});
  grid.addEventListener('touchcancel',()=>{touch=null;});
  grid.addEventListener('touchend',event=>{
    if(!touch)return;
    const dx=event.changedTouches[0].clientX-touch.clientX,dy=event.changedTouches[0].clientY-touch.clientY;
    touch=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)grid.querySelector(dx<0?'[aria-label="Mes siguiente"]':'[aria-label="Mes anterior"]').click();
  },{passive:true});
  if(window.parent===window){
    const link=document.createElement('a');link.href='/facturas/';link.textContent='Volver a facturas';status.after(link);
    return;
  }
  window.addEventListener('message',async event=>{
    const m=event.data;
    if(event.source!==window.parent||event.origin!==hoursBridgeConfig.origin||m?.type!=='gestify-calendar-days'||m.period!==data.period)return;
    try{
      const dates=Object.fromEntries(m.days.map(d=>[d.date,d.type]));
      if(!data.daysSynced||Object.keys(dates).length!==Object.keys(data.days).length||Object.keys(dates).some(k=>dates[k]!==data.days[k]))await post('calendar-days',{period:data.period,days:m.days});
      draw(dates);el('message').textContent='Calendario de jornadas sincronizado con Gestify.';
    }catch{el('message').textContent='No se pudieron sincronizar las jornadas con Kairo.';}
  });
  window.parent.postMessage({type:'kairo-calendar-month',period:data.period},hoursBridgeConfig.origin);
}

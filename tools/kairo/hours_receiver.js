(() => {
  const el = id => document.getElementById(id), opener = window.opener;
  let id=null, request=null, plan=null, busy=false;
  const labels={sent:'Ya enviada',scheduled:'Ya programada',ready:'Lista para programar',changed:'Cambios por revisar',duplicate:'Posible duplicado',uncertain:'Intento sin confirmar',draft:'Ya existe un borrador',unverified:'Sin confirmar','ambiguous-thread':'Conversación por revisar','past-due':'Hora prevista vencida','no-workdays':'Sin días laborables','blocked-previous':'Falta la semana anterior'};
  const text = (tag,value,className='') => {const node=document.createElement(tag);node.textContent=value;if(className)node.className=className;return node;};
  const date = value => value ? new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value)) : 'Sin fecha';
  const send = value => {if(opener)opener.postMessage({channel:'gestify-hours-v1',id,...value},hoursBridgeConfig.origin);};
  function verifySource(){
    return new Promise(resolve=>{
      if(!opener||opener.closed)return resolve(false);
      const probe=crypto.randomUUID();
      const receive=event=>{const m=event.data;if(event.source===opener&&event.origin===hoursBridgeConfig.origin&&m?.channel==='gestify-hours-v1'&&m.id===id&&m.type==='source-result'&&m.probe===probe){clearTimeout(timer);window.removeEventListener('message',receive);resolve(m.matches===true);}};
      const timer=setTimeout(()=>{window.removeEventListener('message',receive);resolve(false);},6000);
      window.addEventListener('message',receive);send({type:'verify-source',probe});
    });
  }
  async function api(action,data){
    const response=await fetch(new URL(action,location.href),{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':hoursBridgeConfig.csrf},body:JSON.stringify(data),cache:'no-store',redirect:'error'});
    const result=await response.json();if(!response.ok)throw new Error(result.error||'No se ha confirmado la operación');return result;
  }
  function paint(){
    el('weeks').replaceChildren();
    const chosen=plan.rows.filter(r=>r.selected);
    el('summary').hidden=false;el('summary').replaceChildren();
    for(const [count,single,plural] of [[chosen.filter(r=>r.state==='sent').length,'enviada','enviadas'],[chosen.filter(r=>r.state==='scheduled').length,'programada','programadas'],[plan.ready,'nueva','nuevas'],[plan.needsReview,'por revisar','por revisar']]){
      const item=text('span',count===1?single:plural);item.prepend(text('b',String(count)));el('summary').append(item);
    }
    chosen.forEach(row=>{
      const card=text('article','', 'week');card.dataset.state=row.state;
      const header=document.createElement('header'),title=document.createElement('div');
      const end=new Date(row.key+'T12:00:00');end.setDate(end.getDate()+4);
      title.append(text('h2',row.key.split('-').reverse().join('/')+' — '+String(end.getDate()).padStart(2,'0')+'/'+String(end.getMonth()+1).padStart(2,'0')));
      if(row.extra)title.append(text('span','Semana adicional del mes siguiente','extra'));
      header.append(title,text('span',labels[row.state]||'Revisar en Outlook','state'));card.append(header);
      if(row.state==='sent')card.append(text('p','El correo enviado se conserva. No se generará otro.','date'));
      else if(row.schedule)card.append(text('p',(row.state==='scheduled'?'Envío conservado: ':'Fecha prevista: ')+date(row.schedule)+' · Madrid','date'));
      if(row.state==='changed'){
        if(row.changes.includes('schedule'))card.append(text('p','Fecha actual: '+date(row.previousSchedule)+' → propuesta: '+date(row.schedule),'change'));
        if(row.changes.includes('days')){
          const label=day=>day.type==='normal'?String(day.hours).replace('.',',')+' h':({festivo:'Festivo',vacaciones:'Vacaciones',ausencia:'Ausencia'})[day.type];
          (row.dayChanges||[]).forEach(change=>card.append(text('p',change.date+': '+label(change.before)+' → '+label(change.after),'change')));
          if(!(row.dayChanges||[]).length)card.append(text('p','El desglose de días y horas difiere del correo existente.','change'));
        }
        card.append(text('p','Se actualizaría el mismo correo; no se crearía otro.','change'));
        card.append(text('p','Se conservan sus destinatarios: '+row.toDisplay+'. CC: '+row.ccDisplay+'.','date'));
        if(row.action==='update'){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.dataset.update=row.key;label.append(check,text('span','Incluir la actualización de esta programación existente'));card.append(label);}
      }
      if(row.state==='blocked-previous')card.append(text('p','La semana del '+row.previousWeek+' debe constar enviada o programada antes.'));
      if(['past-due','no-workdays'].includes(row.state)||row.reason)card.append(text('p','Se deja pendiente para que decidas. No se enviará ahora ni se buscará otra fecha automáticamente.'));
      if(['duplicate','uncertain','draft','unverified'].includes(row.state))card.append(text('p','No se creará otro correo para esta semana. Revisa lo que ya existe en Outlook.'));
      const week=request.weeks.find(w=>w.key===row.key),details=document.createElement('details');details.append(text('summary','Ver asunto y contenido'),text('strong',week.subject),text('pre',week.body));card.append(details);el('weeks').append(card);
    });
    el('simulate').disabled=!plan.verified;el('refresh').hidden=false;
    if(el('commit'))el('commit').disabled=!plan.verified;
    el('message').textContent=plan.verified?'Conciliación terminada. Las programaciones existentes se conservan.':'No se ha confirmado la lectura completa de Outlook. No se puede programar.';
  }
  async function review(refresh=false){
    if(busy||!request)return;busy=true;el('simulate').disabled=true;el('message').textContent='Consultando enviados y programaciones de Outlook…';el('simulation').hidden=true;
    if(el('commit'))el('commit').disabled=true;
    try{plan=await api('preview',{...request,refresh});paint();send({type:'result',ok:true,result:{period:plan.period,checkedAt:plan.checkedAt,verified:plan.verified,rows:plan.rows.map(r=>({key:r.key,state:r.state}))}});}
    catch(e){el('message').textContent=e.message;send({type:'result',ok:false});}
    finally{busy=false;}
  }
  window.addEventListener('message',event=>{
    const m=event.data;if(!opener||event.source!==opener||event.origin!==hoursBridgeConfig.origin||!m||m.channel!=='gestify-hours-v1'||typeof m.id!=='string'||m.id.length>80)return;
    if(m.type==='hello'&&!request){id=m.id;send({type:'ready'});return;}
    if(m.type!=='request'||request||m.id!==id||!m.request)return;
    request=m.request;el('title').textContent=request.mode==='week'?'Programar esta semana':'Programar pendientes';
    el('intro').textContent=request.mode==='week'?'Mismos controles y conciliación para una única semana.':'Semanas del mes visible y las dos siguientes, en orden cronológico.';
    el('recipients').hidden=false;el('recipients').replaceChildren(text('div','Para: '+request.config.to.join(', ')),text('div','CC: '+(request.config.cc.join(', ')||'Sin CC')));
    void review();
  });
  el('refresh').onclick=()=>review(true);
  el('simulate').onclick=async()=>{
    if(busy||!plan)return;busy=true;el('simulate').disabled=true;
    try{const result=await api('simulate',{planId:plan.planId,updates:[...document.querySelectorAll('[data-update]:checked')].map(n=>n.dataset.update)});
      if(result.simulation!==true)throw new Error('Resultado de simulación no válido');
      el('simulation').hidden=false;el('simulation').textContent='Simulación completada. No se ha creado ni modificado ningún correo.\n'+(result.results.length?result.results.map(r=>r.key+': '+(r.state==='scheduled'?'se programaría':labels[r.state]||'requiere revisión')).join('\n'):'No hay programaciones nuevas ni actualizaciones seleccionadas.');
    }catch(e){el('message').textContent=e.message;}
    finally{busy=false;el('simulate').disabled=false;}
  };
  el('return').onclick=()=>{if(opener){opener.focus();window.close();}else el('message').textContent='Cierra esta ventana para volver a Gestify.';};
  if(hoursBridgeConfig.allowWrites){
    document.querySelector('.badge').textContent='Revisa antes de confirmar la programación';
    el('notice').textContent='Solo se programarán las semanas de esta revisión. Las actualizaciones requieren marcar su casilla.';
    const button=text('button','Confirmar programación','primary');button.id='commit';button.disabled=true;
    button.onclick=async()=>{
      if(busy||!plan)return;busy=true;button.disabled=true;el('simulate').disabled=true;
      const updates=[...document.querySelectorAll('[data-update]:checked')].map(n=>n.dataset.update);
      try{
        if(!await verifySource())throw new Error('Los datos de Gestify han cambiado o su ventana está cerrada. Abre una revisión nueva.');
        el('message').textContent='Programando y comprobando las semanas en Outlook… Mantén abierta esta revisión.';
        const result=await api('commit',{planId:plan.planId,updates,sourceVerified:true});
        send({type:'committed'});
        busy=false;await review(true);
        el('message').textContent=!result.results.length?'No había programaciones nuevas ni actualizaciones seleccionadas. No se ha modificado ningún correo.':result.results.some(r=>r.state!=='scheduled')?'Hay una operación pendiente de comprobar. No repitas la programación.':'Programaciones verificadas en Outlook.';
        button.disabled=true;el('simulate').disabled=true;
      }catch(error){el('message').textContent=error.message;}
      finally{busy=false;el('refresh').hidden=false;}
    };
    el('simulate').parentElement.prepend(button);
  }
})();

(() => {
  const el=id=>document.getElementById(id),opener=window.opener;
  let id=null,request=null,plan=null,busy=false,intent='review';
  const labels={sent:'Enviada',scheduled:'Programada',ready:'Por programar',changed:'Cambios por revisar',duplicate:'Posible duplicado',uncertain:'Sin confirmar',draft:'Borrador existente',unverified:'Sin confirmar','ambiguous-thread':'Revisar conversación','past-due':'Fecha vencida','no-workdays':'Sin fecha disponible','blocked-previous':'Semana anterior pendiente'};
  const text=(tag,value,className='')=>{const node=document.createElement(tag);node.textContent=value;if(className)node.className=className;return node;};
  const date=value=>value?new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value)):'Sin fecha';
  const weekDate=key=>{const first=new Date(key+'T12:00:00'),end=new Date(first);end.setDate(end.getDate()+4);const format=new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short'});return format.format(first)+' — '+format.format(end);};
  const send=value=>{if(opener)opener.postMessage({channel:'gestify-hours-v1',id,...value},hoursBridgeConfig.origin);};
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
  function updates(){return [...document.querySelectorAll('[data-update]:checked')].map(n=>n.dataset.update);}
  function controls(){
    const check=intent==='check',count=plan?plan.ready+updates().length:0;
    el('simulate').hidden=check||hoursBridgeConfig.allowWrites;el('simulate').disabled=busy||!plan?.verified;
    el('refresh').hidden=check||!request;el('refresh').disabled=busy;
    if(el('commit')){el('commit').hidden=check||!count;el('commit').disabled=busy||!plan?.verified;}
  }
  function details(row){
    const node=document.createElement('details');node.append(text('summary',row.state==='changed'?'Ver cambios y correo':'Ver correo'));
    if(row.state==='changed'){
      if(row.changes.includes('schedule'))node.append(text('p','Fecha actual: '+date(row.previousSchedule)+' → '+date(row.schedule),'change'));
      const label=day=>day.type==='normal'?String(day.hours).replace('.',',')+' h':({festivo:'Festivo',vacaciones:'Vacaciones',ausencia:'Ausencia'})[day.type];
      (row.dayChanges||[]).forEach(change=>node.append(text('p',change.date+': '+label(change.before)+' → '+label(change.after),'change')));
      node.append(text('p','Se actualiza el mismo correo, conservando sus destinatarios.','change'));
    }
    const week=request.weeks.find(w=>w.key===row.key);node.append(text('strong',week.subject),text('pre',week.body));return node;
  }
  function paint(){
    el('weeks').replaceChildren();el('resolvedWeeks').replaceChildren();el('summary').replaceChildren();
    const chosen=plan.rows.filter(r=>r.selected),done=chosen.filter(r=>['sent','scheduled'].includes(r.state)),pending=chosen.filter(r=>!['sent','scheduled'].includes(r.state));
    const sent=done.filter(r=>r.state==='sent').length,scheduled=done.length-sent;
    el('summary').hidden=intent==='check';el('summary').classList.toggle('attention',!!pending.length||!plan.verified);
    const title=!plan.verified?'Outlook sin confirmar':!pending.length?'Todo al día':[plan.ready?plan.ready+' por programar':'',plan.needsReview?plan.needsReview+' por revisar':''].filter(Boolean).join(' · ');
    el('summary').append(text('h2',title),text('p',[sent?sent+' enviada'+(sent===1?'':'s'):'',scheduled?scheduled+' programada'+(scheduled===1?'':'s'):''].filter(Boolean).join(' · ')||'Revisa las fechas antes de confirmar.'));
    if(intent!=='check')pending.forEach(row=>{
      const card=text('article','','week');card.dataset.state=row.state;
      const header=document.createElement('header');header.append(text('h2',weekDate(row.key)),text('span',labels[row.state]||'Revisar','state'));card.append(header);
      if(row.extra)card.append(text('p','Semana adicional','extra'));
      if(row.schedule)card.append(text('p',date(row.schedule)+' · Madrid','date'));
      if(row.state==='changed'){
        card.append(text('p',row.changes.includes('days')?'Han cambiado los días o las horas.':'Ha cambiado la fecha de envío.','change'));
        if(row.action==='update'){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.dataset.update=row.key;label.append(check,text('span','Actualizar esta semana'));card.append(label);}
      }
      if(row.state==='blocked-previous')card.append(text('p','Primero hay que resolver la semana '+weekDate(row.previousWeek)+'.','issue'));
      if(row.state==='past-due'||row.reason==='past-due')card.append(text('p','La fecha prevista ha pasado. Queda pendiente para decidir.','issue'));
      if(row.state==='no-workdays')card.append(text('p','No hay una fecha de envío definida para esta semana.','issue'));
      if(['duplicate','uncertain','draft','unverified','ambiguous-thread'].includes(row.state))card.append(text('p','Revisa lo que existe en Outlook. No se creará otro correo.','issue'));
      if(row.state==='changed')card.append(details(row));el('weeks').append(card);
    });
    el('resolved').hidden=intent==='check'||!done.length;el('resolvedTitle').textContent='Ver semanas resueltas ('+done.length+')';
    done.forEach(row=>{const line=text('div','','resolved-week');line.dataset.state=row.state;line.append(text('span',weekDate(row.key)),text('span',labels[row.state]+(row.state==='scheduled'?' · '+date(row.previousSchedule||row.schedule):'')));el('resolvedWeeks').append(line);});
    el('recipients').hidden=intent==='check';
    const mail=document.createElement('details');mail.append(text('summary','Ver correos que se prepararán'));
    pending.filter(r=>r.action).forEach(row=>{const week=request.weeks.find(w=>w.key===row.key);mail.append(text('strong',week.subject),text('pre',week.body));});
    el('recipientsBody').replaceChildren(text('div','Para: '+request.config.to.join(', ')),text('div','CC: '+(request.config.cc.join(', ')||'Sin CC')));if(mail.children.length>1)el('recipientsBody').append(mail);
    el('message').textContent=plan.verified?'Estado actualizado en Home.':'No se ha podido comprobar Outlook. Revisa la sesión antes de continuar.';
    controls();
  }
  async function review(refresh=false){
    if(busy||!request)return;busy=true;controls();el('message').textContent='Comprobando Outlook…';el('simulation').hidden=true;
    try{
      plan=await api('preview',{...request,refresh});paint();
      send({type:'result',ok:true,result:{period:plan.period,checkedAt:plan.checkedAt,verified:plan.verified,rows:plan.rows.map(r=>({key:r.key,state:r.state,...(Array.isArray(r.existingDays)&&r.previousSchedule?{days:r.existingDays,schedule:r.previousSchedule}:{})}))}});
    }catch(e){el('message').textContent=e.message;send({type:'result',ok:false});}
    finally{busy=false;controls();}
  }
  window.addEventListener('message',event=>{
    const m=event.data;if(!opener||event.source!==opener||event.origin!==hoursBridgeConfig.origin||!m||m.channel!=='gestify-hours-v1'||typeof m.id!=='string'||m.id.length>80)return;
    if(m.type==='hello'&&!request){id=m.id;send({type:'ready'});return;}
    if(m.type!=='request'||request||m.id!==id||!m.request)return;
    request=m.request;intent=m.intent==='check'?'check':'review';
    el('title').textContent=intent==='check'?'Comprobar Outlook':request.mode==='week'?'Programar esta semana':'Revisar programación';
    el('intro').textContent=intent==='check'?'El resultado aparecerá en Home.':request.mode==='week'?weekDate(request.targetWeek):'Mes visible y dos semanas adicionales · 08:00 de Madrid';
    el('recipientsBody').replaceChildren(text('div','Para: '+request.config.to.join(', ')),text('div','CC: '+(request.config.cc.join(', ')||'Sin CC')));
    void review();
  });
  el('weeks').onchange=controls;el('refresh').onclick=()=>review(true);
  el('simulate').onclick=async()=>{
    if(busy||!plan)return;busy=true;controls();
    try{const result=await api('simulate',{planId:plan.planId,updates:updates()});if(result.simulation!==true)throw new Error('Resultado de simulación no válido');el('simulation').hidden=false;el('simulation').textContent='Simulación completada. No se ha creado ni modificado ningún correo.\n'+(result.results.length?result.results.map(r=>r.key+': '+(r.state==='scheduled'?'se programaría':labels[r.state]||'requiere revisión')).join('\n'):'No hay programaciones nuevas ni actualizaciones seleccionadas.');}
    catch(e){el('message').textContent=e.message;}finally{busy=false;controls();}
  };
  el('return').onclick=()=>{if(opener){opener.focus();window.close();}else el('message').textContent='Cierra esta ventana para volver a Gestify.';};
  document.querySelector('.badge').textContent=hoursBridgeConfig.allowWrites?'Revisión previa':'Demostración';
  el('notice').textContent=hoursBridgeConfig.allowWrites?'Los correos existentes se conservan.':'Datos ficticios. La simulación no crea correos.';
  if(hoursBridgeConfig.allowWrites){
    const button=text('button','Confirmar programación','primary');button.id='commit';button.hidden=true;button.disabled=true;
    button.onclick=async()=>{
      if(busy||!plan)return;busy=true;controls();const selected=updates();
      try{
        if(!await verifySource())throw new Error('Los datos de Gestify han cambiado o su ventana está cerrada. Abre una revisión nueva.');
        el('message').textContent='Programando y comprobando en Outlook…';
        const result=await api('commit',{planId:plan.planId,updates:selected,sourceVerified:true});send({type:'committed'});busy=false;await review(true);
        el('message').textContent=result.results.some(r=>r.state!=='scheduled')?'Hay una semana pendiente de comprobar. Revisa antes de repetir.':'Programación confirmada. El estado ya aparece en Home.';
      }catch(error){el('message').textContent=error.message;}finally{busy=false;controls();}
    };
    el('simulate').parentElement.prepend(button);
  }
  controls();
})();

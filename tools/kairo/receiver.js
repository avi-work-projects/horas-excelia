/* Authenticated receiver; status is strictly read-only. No fiscal actions here. */
(() => {
  const opener = window.opener, status = document.getElementById('status');
  const button = document.getElementById('receive'), el = id => document.getElementById(id);
  let requestId = null, requested = false, running = false;
  const send = data => opener.postMessage({channel:'gestify-kairo-v1',id:requestId,...data}, bridgeConfig.origin);
  function show(title, detail, tone='neutral') {
    el('resultTitle').textContent = title; status.textContent = detail;
    el('resultCard').dataset.tone = tone;
    el('resultTitle').classList.toggle('warn',tone==='warning'||tone==='error');
  }
  const states = {
    different:['Revisar cambios','La versión de Gestify difiere de la registrada.','warning'],
    accepted:['Factura emitida','Correo pendiente.','success'],
    review:['Mes preparado','','success'],
    approved:['Factura programada','','success'],
    sent:['Correo enviado','','success'],
    missing:['Sin borrador','Prepara este mes desde Gestify.','warning'],
    blocked:['Revisar borrador','Revisa los cambios antes de aprobar.','warning'],
    uncertain:['Resultado sin confirmar','Consulta el registro antes de repetir.','warning'],
    cancelled:['Programación cancelada','','warning'],
    email_cancelled:['Correo cancelado','Factura emitida.','warning'],
    emitting:['Emisión en curso','','neutral'],queued:['En proceso','','neutral'],sending:['Enviando correo','','neutral']
  };
  el('return').onclick = event => {
    if(opener && requested && !opener.closed){event.preventDefault();opener.focus();window.close();}
  };
  window.addEventListener('message', event => {
    const m = event.data;
    if (!opener || event.source !== opener || event.origin !== bridgeConfig.origin || !m || m.channel !== 'gestify-kairo-v1' || typeof m.id !== 'string' || m.id.length > 80) return;
    if (m.type === 'hello' && !requested) { requestId = m.id; send({type:'ready'}); return; }
    if (m.type !== 'request' || requested || m.id !== requestId || !['prepare','revise','status'].includes(m.action)) return;
    requested = true;
    if (m.action === 'project') {
      document.title = 'Kairo · Proyecto';
      el('title').textContent = 'Guardar proyecto';
      el('stepLabel').textContent = 'Configuración';document.querySelector('.k-steps').hidden=true;
      el('period').textContent = (m.change?.project || '')+' · desde '+(m.change?.from || '');
      show('Guardando proyecto','Confirmando el cambio solicitado desde Gestify.');
      fetch('/facturas/gestify',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF':bridgeConfig.csrf},body:JSON.stringify({action:'project',change:m.change})})
        .then(async response => {const data=await response.json();if(!response.ok)throw Error(data.message||'No se pudo guardar el proyecto');return data;})
        .then(data => {if(data.state==='project_rejected'){show('Proyecto no guardado',data.message,'warning');send({type:'result',ok:false,rejected:true,message:data.message,current:data.current});return;}if(data.state!=='project_saved')throw Error('Kairo no confirmó el proyecto');show('Proyecto guardado','Vuelve a Gestify para terminar. Las facturas anteriores se conservan.','success');send({type:'result',ok:true,result:data});})
        .catch(error => {show('Proyecto sin confirmar',error.message,'error');send({type:'result',ok:false,message:error.message});});
      return;
    }
    const consulting = m.action === 'status', revising = m.action === 'revise';
    if(revising){button.textContent='Actualizar borrador';el('title').textContent='Modificar factura';}
    document.title = consulting ? 'Kairo · Consultar estado' : revising ? 'Kairo · Modificar factura' : 'Kairo · Preparar borrador';
    el('title').textContent = consulting ? 'Estado de la factura' : revising ? 'Modificar factura' : 'Borrador';
    if (/^20\d\d-(0[1-9]|1[0-2])$/.test(m.period)) {
      const label = new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(m.period+'-01T12:00:00Z'));
      el('period').textContent = label.charAt(0).toUpperCase()+label.slice(1);
      el('invoiceReview').href = '/facturas/gestify-month?period='+m.period;
      el('invoiceReview').hidden = !consulting;
    }
    async function run() {
      if (running) return;
      running = true; button.hidden = true; button.disabled = true;
      show(consulting ? 'Consultando estado' : 'Comprobando preparación','Estamos verificando los datos con Kairo.');
      try {
        const response = await fetch('/facturas/gestify', {method:'POST', headers:{'Content-Type':'application/json','X-CSRF':bridgeConfig.csrf}, body:JSON.stringify({action:m.action,operationId:m.operationId,contentHash:m.contentHash,period:m.period,source:consulting?undefined:m.source})});
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Kairo no ha confirmado la operación.');
        const presentation = states[data.state];
        if (!presentation) throw new Error('El estado recibido requiere revisión en Kairo.');
        show(...presentation); el('invoiceReview').hidden=false; send({type:'result',ok:true,result:data});
      } catch (error) {
        show(consulting ? 'No pudimos consultar el estado' : 'Recepción no confirmada',error.message+' Vuelve a Gestify para consultar el estado.','error');
        send({type:'result',ok:false});
      }
    }
    if (consulting) run();
    else { show(revising?'Cambios listos':'Datos listos',revising?'Se conserva la factura y se solicitará una nueva aprobación.':''); button.hidden=false; button.onclick=run; }
  });
  if (!opener) show('Abre la conexión desde Gestify','Pulsa «Consultar estado» o «Enviar a Kairo» dentro de Gestify.','warning');
})();

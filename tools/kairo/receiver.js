/* Authenticated receiver; status is strictly read-only. No fiscal actions here. */
(() => {
  const opener = window.opener, status = document.getElementById('status');
  const button = document.getElementById('receive'), el = id => document.getElementById(id);
  let requestId = null, requested = false, running = false;
  const send = data => opener.postMessage({channel:'gestify-kairo-v1',id:requestId,...data}, bridgeConfig.origin);
  function show(title, detail, tone='neutral') {
    el('resultTitle').textContent = title; status.textContent = detail;
    el('resultCard').dataset.tone = tone;
    el('signal').textContent = ({success:'✓',warning:'!',error:'!',neutral:'↔'})[tone];
  }
  const states = {
    different:['Los datos no coinciden','La preparación de Gestify es distinta de la registrada en Kairo. La factura y su programación no se han modificado.','warning'],
    accepted:['Factura emitida · correo pendiente','Kairo conserva la factura emitida y su envío programado. Puedes consultar los detalles en «Ver factura y programación».','success'],
    review:['Preparación recibida','El borrador está disponible para revisar en Kairo. Todavía no está aprobado ni emitido.','success'],
    approved:['Preparación aprobada','Kairo conserva la versión aprobada y su programación.','success'],
    sent:['Correo enviado','Kairo tiene registrado el envío del correo. Consulta sus detalles en la factura.','success'],
    missing:['Esta versión no está registrada','No encontramos esta preparación en Kairo. Consultar el estado no la importa ni emite una factura.','warning'],
    blocked:['Preparación pendiente de revisión','Hay una revisión bloqueada. Revisa los detalles en Kairo antes de continuar.','warning'],
    uncertain:['Resultado pendiente de comprobar','Kairo conserva una operación cuyo resultado requiere revisión. No repitas el envío.','warning'],
    cancelled:['Preparación cancelada','Esta preparación figura como cancelada en Kairo.','warning'],
    email_cancelled:['Correo cancelado','La factura está emitida, pero su correo figura como cancelado.','warning'],
    emitting:['Emisión en curso','Kairo ya está procesando una emisión. Esta consulta no ha iniciado otra.','neutral'],
    queued:['Operación en curso','Kairo conserva una operación en curso. Esta consulta no la repite.','neutral'],
    sending:['Correo en curso','Kairo ya está procesando el correo. Esta consulta no ha iniciado otro envío.','neutral']
  };
  el('return').onclick = () => {
    if (opener) { opener.focus(); window.close(); }
    el('return').textContent = 'Cierra esta ventana para volver a Gestify';
  };
  window.addEventListener('message', event => {
    const m = event.data;
    if (!opener || event.source !== opener || event.origin !== bridgeConfig.origin || !m || m.channel !== 'gestify-kairo-v1' || typeof m.id !== 'string' || m.id.length > 80) return;
    if (m.type === 'hello' && !requested) { requestId = m.id; send({type:'ready'}); return; }
    if (m.type !== 'request' || requested || m.id !== requestId || !['prepare','status'].includes(m.action)) return;
    requested = true;
    const consulting = m.action === 'status';
    document.title = consulting ? 'Kairo · Consultar estado' : 'Kairo · Recibir preparación';
    el('title').textContent = consulting ? 'Estado de tu factura' : 'Recibir preparación';
    el('intro').textContent = consulting ? 'Comparamos tu preparación de Gestify con la que conserva Kairo.' : 'Revisa el mes antes de recibir los datos en Kairo.';
    el('mode').textContent = consulting ? 'Solo consulta' : 'Recepción de datos';
    el('assurance').textContent = consulting ? 'Esta consulta no emite facturas, no envía correos y no cambia tu programación.' : 'Recibir datos no aprueba ni emite facturas y no envía correos.';
    if (/^20\d\d-(0[1-9]|1[0-2])$/.test(m.period)) {
      const label = new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(m.period+'-01T12:00:00Z'));
      el('period').textContent = label.charAt(0).toUpperCase()+label.slice(1);
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
        show(...presentation); send({type:'result',ok:true,result:data});
      } catch (error) {
        show(consulting ? 'No pudimos consultar el estado' : 'Recepción no confirmada',error.message+' Vuelve a Gestify para consultar el estado.','error');
        send({type:'result',ok:false});
      }
    }
    if (consulting) run();
    else { show('Lista para recibir','Confirma para comprobar y recibir esta preparación. Si ya existe, Kairo conservará la registrada.'); button.hidden=false; button.onclick=run; }
  });
  if (!opener) show('Abre la conexión desde Gestify','Pulsa «Consultar estado» o «Enviar a Kairo» dentro de Gestify. También puedes abrir aquí tu factura y programación.','warning');
})();

/* Executed only on the authenticated Kairo origin, with server-injected CSRF. */
(() => {
  const opener = window.opener, status = document.getElementById('status');
  const button = document.getElementById('receive');
  let requestId = null, requested = false;
  const send = data => opener.postMessage({channel:'gestify-kairo-v1',id:requestId,...data}, bridgeConfig.origin);
  window.addEventListener('message', event => {
    const m = event.data;
    if (!opener || event.source !== opener || event.origin !== bridgeConfig.origin || !m || m.channel !== 'gestify-kairo-v1' || typeof m.id !== 'string' || m.id.length > 80) return;
    if (m.type === 'hello' && !requested) {
      requestId = m.id; send({type:'ready'}); return;
    }
    if (m.type !== 'request' || requested || m.id !== requestId || !['prepare','status'].includes(m.action)) return;
    requested = true;
    async function run() {
      button.disabled = true; status.textContent = 'Consultando Kairo…';
      try {
        const response = await fetch('/facturas/gestify', {method:'POST', headers:{'Content-Type':'application/json','X-CSRF':bridgeConfig.csrf}, body:JSON.stringify({action:m.action,operationId:m.operationId,contentHash:m.contentHash,period:m.period,source:m.source})});
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'No se pudo confirmar la operación');
        status.textContent = 'Consulta completada. Estado: ' + data.state + '. Abre la revisión para continuar.';
        send({type:'result',ok:true,result:data});
      } catch (error) {
        status.textContent = error.message + '. Consulta el estado antes de repetir.';
        send({type:'result',ok:false});
      }
      button.hidden = true;
    }
    if (m.action === 'status') run();
    else {
      status.textContent = 'Gestify propone recibir la preparación de ' + String(m.period) + '. Confirma para importarla sin emitir ni enviar correos.';
      button.hidden = false; button.onclick = run;
    }
  });
  if (!opener) status.textContent = 'Abre esta ventana desde Enviar a Kairo o Consultar estado en Gestify.';
})();

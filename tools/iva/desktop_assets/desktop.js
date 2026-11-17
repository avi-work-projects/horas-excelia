'use strict';
(() => {
  const output = document.getElementById('action-message');
  const controls = ['refresh-data','check-state','collect-amazon'].map(id=>document.getElementById(id)).filter(Boolean);
  let busy = false;
  function show(message, url, label) {
    output.hidden = false;
    output.textContent = message;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.textContent = label;
      output.append(link);
    }
    output.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  async function run(path, post, pending, next) {
    if (busy) return;
    busy = true;
    controls.forEach(button=>button.disabled=true);
    show(pending);
    try {
      const response = await fetch(path, post ? {method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF':document.body.dataset.csrf},body:'{}'} : {cache:'no-store',credentials:'same-origin'});
      const result = await response.json();
      if (!response.ok) throw Error(result.message || 'No se pudo completar. Comprueba el estado antes de repetir.');
      show(result.message || 'Acción completada.', next?.url, next?.label);
      if (path === '/api/collect-amazon') {
        const last = document.getElementById('mail-last');
        if (last) last.textContent = 'Última recogida: ' + result.message;
      }
    } catch (error) {
      show(error.message || 'No se ha recibido respuesta. Comprueba el estado antes de repetir.');
    } finally {
      busy = false;
      controls.forEach(button=>button.disabled=false);
    }
  }
  document.getElementById('refresh-data')?.addEventListener('click',()=>run('/facturas/modelos/actualizar',true,'Solicitando la actualización del libro…'));
  document.getElementById('check-state')?.addEventListener('click',()=>run('/facturas/modelos/actualizacion',false,'Consultando el estado…',{url:location.pathname+location.search,label:'Volver a cargar esta vista'}));
  document.getElementById('collect-amazon')?.addEventListener('click',()=>run('/api/collect-amazon',true,'Buscando los adjuntos de este pedido en Amazon Business…',{url:'/facturas/modelos/gastos',label:'Abrir bandeja de gastos'}));
  addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue='';}});
})();

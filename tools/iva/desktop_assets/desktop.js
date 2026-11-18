'use strict';
(() => {
  const billingTheme = document.querySelector('.billing-theme');
  if (billingTheme) {
    const syncTheme = () => { billingTheme.dataset.kTheme = document.documentElement.dataset.kTheme; };
    syncTheme();
    new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-k-theme']});
  }
  const output = document.getElementById('action-message');
  const controls = [...document.querySelectorAll('#refresh-data,#check-state,#collect-amazon,#assistant-create button,[data-intake-open],[data-intake-import],[data-assistant-reconcile]')];
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
  async function run(path, post, pending, next, data={}) {
    if (busy) return;
    busy = true;
    controls.forEach(button=>button.disabled=true);
    show(pending);
    try {
      const response = await fetch(path, post ? {method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF':document.body.dataset.csrf},body:JSON.stringify(data)} : {cache:'no-store',credentials:'same-origin'});
      const result = await response.json();
      if (!response.ok) throw Error(result.message || 'No se pudo completar. Comprueba el estado antes de repetir.');
      show(result.message || 'Acción completada.', next?.url, next?.label);
      if (path === '/api/collect-amazon') {
        const last = document.getElementById('mail-last');
        if (last) last.textContent = 'Última recogida: ' + result.message;
      }
      return result;
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
  const requestForm = document.getElementById('assistant-create');
  function requestFields() {
    if (!requestForm) return;
    const fields = requestForm.elements, mail = fields.kind.value === 'mail', other = fields.provider.value === 'other';
    document.getElementById('assistant-mail-fields').hidden = !mail;
    document.getElementById('assistant-other').hidden = !other;
    ['account','date_from','date_to'].forEach(name=>{fields[name].required=mail;fields[name].disabled=!mail;});
    fields.other_provider.required=other;fields.other_provider.disabled=!other;
  }
  requestForm?.addEventListener('change',requestFields);
  requestFields();
  function openResult(result) {
    if (!result?.url) return;
    const target = new URL(result.url,location.href);
    // A hash-only navigation does not ask the server for the updated record.
    if (target.pathname===location.pathname && target.search===location.search) location.reload();
    else location.href=target.href;
  }
  requestForm?.addEventListener('submit',async event=>{
    event.preventDefault();
    const data=Object.fromEntries(new FormData(requestForm));
    const result=await run('/api/assistant-requests',true,'Guardando el encargo…',null,data);
    openResult(result);
  });
  document.querySelectorAll('[data-intake-open]').forEach(button=>button.addEventListener('click',()=>run('/api/intake-open',true,'Abriendo la carpeta de entrada…')));
  document.querySelectorAll('[data-intake-import]').forEach(button=>button.addEventListener('click',async()=>{
    const result=await run('/api/intake-import',true,'Comprobando e importando los PDF. Los originales se conservan…',null,button.dataset.request?{id:button.dataset.request}:{});
    openResult(result);
  }));
  document.querySelectorAll('[data-assistant-reconcile]').forEach(button=>button.addEventListener('click',async()=>{
    const result=await run('/api/assistant-reconcile',true,'Comprobando huellas, libro y bandeja…',null,{id:button.dataset.assistantReconcile});
    openResult(result);
  }));
  document.getElementById('assistant-copy')?.addEventListener('click',async()=>{
    const prompt=document.getElementById('assistant-prompt'), feedback=document.getElementById('assistant-copy-status');
    try {await navigator.clipboard.writeText(prompt.value);feedback.textContent='Prompt copiado. Pégalo y revísalo antes de enviarlo.';}
    catch {prompt.focus();prompt.select();feedback.textContent='El navegador no pudo copiarlo. El texto está seleccionado: usa Ctrl+C.';}
  });
  addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue='';}});
})();

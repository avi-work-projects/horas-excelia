'use strict';
(() => {
  const billingTheme = document.querySelector('.billing-theme');
  if (billingTheme) {
    const syncTheme = () => { billingTheme.dataset.kTheme = document.documentElement.dataset.kTheme; };
    syncTheme();
    new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-k-theme']});
  }
  const output = document.getElementById('action-message');
  const controls = [...document.querySelectorAll('#refresh-data,#check-state,#collect-amazon,#assistant-create button,[data-intake-open],[data-intake-import],[data-assistant-reconcile],[data-renta-scan],[data-renta-check],[data-renta-assign],.renta-search button')];
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
    ['account','date_from','date_to'].forEach(name=>{fields[name].required=mail&&name==='account';fields[name].disabled=!mail;});
    fields.other_provider.required=other;fields.other_provider.disabled=!other;
  }
  requestForm?.addEventListener('change',requestFields);
  requestFields();
  const periodPicker=document.getElementById('assistant-period'),yearPicker=document.getElementById('assistant-year');
  function selectPeriod(){
    if(!requestForm)return;
    const f=requestForm.elements, mode=periodPicker.value, now=new Date();
    if(mode==='custom')return;
    if(mode==='all'){f.date_from.value='';f.date_to.value='';return;}
    let year=Number(yearPicker.value), q=Number(mode);
    if(mode==='current'||mode==='previous'){
      year=now.getFullYear();q=Math.floor(now.getMonth()/3)+1-(mode==='previous'?1:0);
      if(q===0){q=4;year--;}
      yearPicker.value=year;
    }
    if(!Number.isInteger(year)||year<2000||year>2100)return;
    const stamp=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    f.date_from.value=stamp(new Date(year,(q-1)*3,1));
    f.date_to.value=stamp(new Date(year,q*3,0));
  }
  periodPicker?.addEventListener('change',selectPeriod);
  yearPicker?.addEventListener('change',selectPeriod);
  ['date_from','date_to'].forEach(name=>requestForm?.elements[name].addEventListener('input',()=>{periodPicker.value='custom';}));
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
  document.querySelectorAll('[data-intake-open]').forEach(button=>button.addEventListener('click',()=>run('/api/intake-open',true,'Abriendo la carpeta…',null,{folder:button.dataset.intakeOpen||'inbox'})));
  document.querySelectorAll('[data-intake-import]').forEach(button=>button.addEventListener('click',async()=>{
    const result=await run('/api/intake-import',true,'Comprobando e importando los PDF. Los originales se conservan…',null,button.dataset.request?{id:button.dataset.request}:{});
    openResult(result);
  }));
  document.querySelectorAll('[data-assistant-reconcile]').forEach(button=>button.addEventListener('click',async()=>{
    const result=await run('/api/assistant-reconcile',true,'Comprobando huellas, libro y bandeja…',null,{id:button.dataset.assistantReconcile});
    openResult(result);
  }));
  document.querySelectorAll('[data-renta-scan]').forEach(button=>button.addEventListener('click',async()=>{
    openResult(await run('/api/renta-scan',true,'Revisando los documentos locales de 2026…'));
  }));
  document.querySelectorAll('[data-renta-check]').forEach(input=>input.addEventListener('change',async()=>{
    const result=await run('/api/renta-mark',true,'Guardando tu revisión documental…',null,{item:input.dataset.rentaCheck,complete:input.checked});
    if(result)openResult(result);else input.checked=!input.checked;
  }));
  document.querySelectorAll('[data-renta-assign]').forEach(select=>select.addEventListener('change',async()=>{
    openResult(await run('/api/renta-assign',true,'Asignando documento a la partida…',null,{sha:select.dataset.rentaAssign,item:select.value}));
  }));
  document.querySelectorAll('.renta-search').forEach(form=>form.addEventListener('submit',async event=>{
    event.preventDefault();
    openResult(await run('/api/renta-search',true,'Preparando instrucciones de búsqueda…',null,{...Object.fromEntries(new FormData(form)),item:form.dataset.item}));
  }));
  document.getElementById('assistant-copy')?.addEventListener('click',async()=>{
    const prompt=document.getElementById('assistant-prompt'), feedback=document.getElementById('assistant-copy-status');
    try {await navigator.clipboard.writeText(prompt.value);feedback.textContent='Prompt copiado. Pégalo y revísalo antes de enviarlo.';}
    catch {prompt.focus();prompt.select();feedback.textContent='El navegador no pudo copiarlo. El texto está seleccionado: usa Ctrl+C.';}
  });
  addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue='';}});
})();

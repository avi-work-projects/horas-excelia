/* Transporte privado: el receptor autenticado conserva importación y aprobación. */
var INVOICE_KAIRO_BUSY=false;
function invoiceKairoUrl(value){
  if(!value)return '';
  var url=new URL(value);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.ts.net')||url.port||url.username||url.password||url.search||url.hash||url.pathname!=='/facturas/')throw new Error('Usa la dirección HTTPS privada de Tailscale terminada en /facturas/');
  return url.href;
}
function invoiceKairoState(state){
  return ({cancelled:'Preparación cancelada en Kairo.',pending:'Recepción sin confirmar. Consulta antes de repetir.',review:'Preparación recibida. Revisa y aprueba en Kairo.',blocked:'Revisión bloqueada. Revisa en Kairo.',approved:'Versión aprobada en Kairo.',accepted:'Factura emitida; correo pendiente en Kairo.',sent:'Correo enviado desde Kairo.',email_cancelled:'Factura emitida; correo cancelado.',emitting:'Emisión en curso en Kairo.',queued:'Operación en curso en Kairo.',sending:'Correo en curso en Kairo.',uncertain:'Resultado pendiente de comprobar en Kairo.',missing:'Esta versión aún no consta en Kairo.',different:'Kairo conserva otra versión; revisa allí antes de continuar.'})[state]||'Consulta el estado en Kairo.';
}
function invoiceKairoSection(p,record,url,problem){
  var locked=!url,disabled=(!p||problem)?' disabled':'';
  var h='<section class="invoice-kairo-card'+(locked?' invoice-card invoice-kairo-locked':'')+'" aria-label="Kairo">';
  if(locked)h+='<header class="invoice-kairo-header"><h3>Kairo</h3><span class="invoice-kairo-badge">Sin configurar</span></header>';
  if(locked)h+='<button class="ev-btn invoice-connection-action" id="invoiceKairoConfig">Configurar conexión</button>';
  else{
    h+='<div class="invoice-actions">';
    if(!record.final)h+='<button class="ev-btn ev-btn-primary invoice-primary-action" id="invoiceKairoSend"'+disabled+'>Enviar a Kairo</button>';
    h+='<button class="ev-btn" id="invoiceKairoStatus"'+disabled+'>Consultar estado</button></div>';
  }
  return h+'<p class="invoice-note" id="invoiceKairoMessage" role="status">'+(locked&&record.kairo?'Configura de nuevo la dirección privada para consultar Kairo.':!locked&&disabled?'Completa los datos de facturación para continuar.':record.kairo?escHtml(invoiceKairoState(record.kairo.state))+(p&&record.kairo.contentHash!==p.contentHash?' La preparación local ha cambiado.':''):'')+'</p></section>';
}
function invoiceKairoExchange(url,p,action,popup){
  return new Promise(function(resolve,reject){
    var origin=new URL(url).origin,id=crypto.randomUUID(),sent=false,done=false;
    function finish(error,result){if(done)return;done=true;clearInterval(ping);clearTimeout(timeout);window.removeEventListener('message',receive);if(error)reject(error);else resolve(result);}
    function receive(event){
      var m=event.data;
      if(event.origin!==origin||event.source!==popup||!m||m.channel!=='gestify-kairo-v1'||m.id!==id)return;
      if(m.type==='ready'&&!sent){sent=true;popup.postMessage({channel:m.channel,id:id,type:'request',action:action,change:action==='project'?p:undefined,period:p.period,operationId:p.operationId,contentHash:p.contentHash,source:action==='prepare'?JSON.stringify(p):undefined},origin);}
      if(m.type==='result'&&sent){
        if(!m.ok){var error=new Error(typeof m.message==='string'?m.message:'Kairo no confirmó la operación. Consulta el estado y revisa su ventana.');error.projectRejected=action==='project'&&m.rejected===true;error.projectCurrent=m.current;return finish(error);}
        var r=m.result;
        if(action==='project'){
          try{invoiceProjectReply(r,p);}catch(e){return finish(e);}
          return finish(null,r);
        }
        if(!r||r.operationId!==p.operationId||r.contentHash!==p.contentHash||r.period!==p.period||!['review','cancelled','blocked','approved','accepted','sent','email_cancelled','emitting','queued','sending','uncertain','missing','different'].includes(r.state))return finish(new Error('Respuesta de Kairo no válida. Consulta el estado.'));
        finish(null,r);
      }
    }
    window.addEventListener('message',receive);
    var ping=setInterval(function(){if(popup.closed)return finish(new Error('Ventana cerrada. La recepción no está confirmada; consulta el estado.'));if(!sent)popup.postMessage({channel:'gestify-kairo-v1',id:id,type:'hello'},origin);},500);
    var timeout=setTimeout(function(){finish(new Error('Sin respuesta de Kairo. Comprueba Tailscale y consulta el estado antes de repetir. Puedes usar Datos para AEAT como alternativa.'));},45000);
  });
}
function bindInvoiceKairo(root,p,url){
  ['Send','Status'].forEach(function(suffix){
    var button=root.querySelector('#invoiceKairo'+suffix);if(!button)return;
    button.onclick=async function(){
      if(INVOICE_KAIRO_BUSY)return;
      var message=root.querySelector('#invoiceKairoMessage'),popup;
      try{
        if(navigator.onLine===false)throw new Error('Sin conexión. La preparación sigue guardada en este dispositivo.');
        url=invoiceKairoUrl(url);
        // Abrir dentro del gesto del usuario; nunca datos fiscales en la URL.
        popup=window.open(url+'gestify','_blank');
        if(!popup)throw new Error('Permite abrir la ventana privada de Kairo para continuar.');
        var data=invoiceData(),record=data.months[p.period];
        if(!record||record.preparation.contentHash!==p.contentHash)throw new Error('La preparación cambió. Vuelve a abrir el mes.');
        if(suffix==='Send'&&record.final)throw new Error('Este mes ya tiene un PDF definitivo. Consulta su estado.');
        if(suffix==='Send'){
          record.kairo={operationId:p.operationId,contentHash:p.contentHash,state:'pending'};invoiceSave(data);
          var manual=root.querySelector('#invoiceDocument');if(manual)manual.remove();
          var gmail=root.querySelector('#invoiceGmail');if(gmail)gmail.remove();
        }
        INVOICE_KAIRO_BUSY=true;root.querySelectorAll('#invoiceKairoSend,#invoiceKairoStatus').forEach(function(el){el.disabled=true;});
        message.textContent='Conectando con Kairo… Mantén abierta su ventana.';
        var result=await invoiceKairoExchange(url,p,suffix==='Send'?'prepare':'status',popup);
        data=invoiceData();record=data.months[p.period];
        if(record&&record.preparation.contentHash===p.contentHash){record.kairo={operationId:p.operationId,contentHash:p.contentHash,state:result.state};invoiceSave(data);if(data.config.kairoUrl&&invoiceKairoUrl(data.config.kairoUrl)===url&&typeof fetchHomeInvoiceStatus==='function')fetchHomeInvoiceStatus(p.period,data.config.kairoUrl,true);}
        message.textContent=invoiceKairoState(result.state);
      }catch(e){message.textContent=e.message;}
      finally{INVOICE_KAIRO_BUSY=false;root.querySelectorAll('#invoiceKairoSend,#invoiceKairoStatus').forEach(function(el){el.disabled=false;});}
    };
  });
}

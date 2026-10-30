/* Calendario de facturación: datos locales y último estado confirmado, sin red. */
function invoiceCalendarDelivery(period,config){
  var year=+period.slice(0,4),month=+period.slice(5)-1,expected=homeInvoiceScheduleDate(year,month);
  var saved=config.kairoUrl&&INVOICE_HOME_CACHE.url===config.kairoUrl&&INVOICE_HOME_CACHE.periods[period],state=saved&&saved.data;
  if(state&&state.state==='scheduled')return {kind:'scheduled',date:state.scheduledDate,title:'Envío programado',note:state.scheduledDate!==expected?'La fecha de Kairo difiere del calendario actual. Revisa antes de cambiarla.':'Confirmado en Kairo · 08:00 Madrid'};
  if(state&&state.sent)return {kind:'sent',date:null,title:'Factura enviada',note:'Envío confirmado en Kairo'};
  if(state&&['processing','attention','multiple'].includes(state.state))return {kind:'attention',date:null,title:'Revisar estado de la factura',note:'Consulta el detalle en Kairo'};
  if(period<INVOICE_FIRST_PERIOD)return {kind:'history',date:null,title:'Mes histórico',note:'Sin nueva programación'};
  return {kind:'planned',date:expected,title:'Envío previsto',note:state&&state.state==='draft'?'Pendiente de aprobación · 08:00 Madrid':'Según el calendario · aún sin fecha confirmada en Kairo'};
}
function renderInvoiceCalendar(period,config){
  var year=+period.slice(0,4),month=+period.slice(5)-1,first=new Date(year,month,1),offset=(first.getDay()+6)%7,days=new Date(year,month+1,0).getDate();
  var delivery=invoiceCalendarDelivery(period,config),types={vacaciones:['V','Vacaciones'],festivo:['F','Festivo'],ausencia:['A','Ausencia']};
  var h='<section class="invoice-calendar invoice-card" id="invoiceCalendar" aria-label="Calendario de facturación de '+escHtml(invoiceLabel(period))+'"><table><thead><tr>';
  ['L','M','X','J','V','S','D'].forEach(function(day,i){h+='<th scope="col" aria-label="'+['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][i]+'">'+day+'</th>';});h+='</tr></thead><tbody>';
  var total=Math.ceil((offset+days)/7)*7;
  for(var index=0;index<total;index++){
    if(index%7===0)h+='<tr>';
    var number=index-offset+1;
    if(number<1||number>days)h+='<td class="empty"></td>';
    else{
      var date=new Date(year,month,number),iso=dk(date),type=dayT(date),marked=delivery.date===iso,kind=types[type],label=number+' de '+MN[month]+(kind?' · '+kind[1]:'')+(marked?' · '+delivery.title:'');
      h+='<td data-date="'+iso+'" class="'+(kind?type:'normal')+(index%7>4?' weekend':'')+(marked?' delivery '+delivery.kind:'')+'" aria-label="'+escHtml(label)+'"><span class="invoice-calendar-number">'+number+'</span><span class="invoice-calendar-mark">'+(kind?kind[0]:'')+'</span>'+(marked?'<span class="invoice-calendar-envelope" aria-hidden="true">✉</span>':'')+'</td>';
    }
    if(index%7===6)h+='</tr>';
  }
  h+='</tbody></table><div class="invoice-calendar-legend"><span class="vacaciones">V · Vacaciones</span><span class="festivo">F · Festivo</span><span class="ausencia">A · Ausencia</span></div>';
  h+='<div class="invoice-calendar-delivery '+delivery.kind+'"><strong>'+escHtml(delivery.title)+(delivery.date?' · '+delivery.date.split('-').reverse().slice(0,2).join('/'):'')+'</strong><span>'+escHtml(delivery.note)+'</span></div></section>';
  return h;
}
function paintInvoiceCalendar(){
  var root=document.getElementById('invoiceCalendar');if(root&&INVOICE_MONTH)root.outerHTML=renderInvoiceCalendar(INVOICE_MONTH,invoiceData().config);
}

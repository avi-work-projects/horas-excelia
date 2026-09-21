/* Resumen del contenido recibido: no modifica ni fusiona datos. */
function renderImportPreview(d){
  var groups=[];
  function add(title,lines){if(lines.length)groups.push('<section><h4>'+escHtml(title)+'</h4>'+lines.map(function(x){return '<p>'+escHtml(x)+'</p>';}).join('')+'</section>');}
  if(Array.isArray(d.events)){
    ['grande','puntual'].forEach(function(kind){var counts={};d.events.forEach(function(e){if(getEvKind(e)===kind){var t=getEvType(e);counts[t]=(counts[t]||0)+1;}});add(kind==='grande'?'Eventos grandes':'Eventos puntuales',Object.keys(counts).sort().map(function(t){return counts[t]+' · '+t;}));});
    if(!d.events.length)add('Eventos',['0 eventos (lista vacía)']);
  }
  var people=[];[['birthdays','cumpleaños'],['bodas','parejas'],['rutinas','rutinas'],['alarms','alarmas']].forEach(function(x){if(Array.isArray(d[x[0]]))people.push(d[x[0]].length+' '+x[1]);});add('Personas y actividades',people);
  var hours=[];[['days','días registrados'],['sent','semanas registradas'],['monthH','meses con jornada'],['vacByYear','años con cupo de vacaciones']].forEach(function(x){if(d[x[0]])hours.push(Object.keys(d[x[0]]).length+' '+x[1]);});add('Horas y días',hours);
  var money=[];[['energyBills','facturas energéticas'],['energyContracts','contratos energéticos']].forEach(function(x){if(Array.isArray(d[x[0]]))money.push(d[x[0]].length+' '+x[1]);});
  [['fiscal','Configuración fiscal'],['gastos','Gastos'],['ingresos','Ingresos'],['compras','Compras'],['desgrav','Desgravaciones'],['despacho','Tarifas y suministros'],['personalData','Economía personal'],['gastosPerYear','Gastos por año'],['personalPerYear','Economía personal por año'],['scenarios','Escenarios'],['econYearConfig','Configuración económica por año'],['rate','Tarifa'],['ratePeriods','Períodos de tarifa'],['energyTaxes','Histórico de impuestos']].forEach(function(x){if(d[x[0]]!=null)money.push(x[1]);});add('Información económica',money);
  var settings=[];[['bodaConfig','Wedding Moves: packs, salas, profesores y duraciones'],['mailConfig','Correo (valores ocultos)'],['macroUrl','MacroDroid (valor oculto)'],['theme','Tema'],['navIconStyle','Iconos de navegación'],['calendarExports','Historial de eventos exportados'],['csvExports','Historial de CSV exportados'],['evAlarms','Avisos de eventos'],['bdayAlarms','Avisos de cumpleaños']].forEach(function(x){if(d[x[0]]!=null)settings.push(x[1]);});add('Ajustes e historiales',settings);
  return '<div class="imp-preview">'+(groups.join('')||'<p>No se han encontrado categorías reconocidas.</p>')+'</div><p class="imp-preview-note">Contenido del archivo, antes de fusionar. Los recuentos no significan elementos nuevos. Añadir conserva los datos actuales y actualiza coincidencias; Reemplazar sustituye las categorías incluidas, incluso las listas vacías. Los ajustes incluidos se aplican en ambos modos.</p>';
}

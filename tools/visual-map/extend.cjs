// Rutas de la ampliación. Cada transición reproduce un control real.
module.exports=function extend({scenes,edges}){
  const get=id=>{const s=scenes.find(s=>s.id===id);if(!s)throw Error(id);return s;};
  function add(id,title,group,parent,action,ready,opts={}){
    let source=get(parent);
    if(opts.scroll){
      const sid=parent+'--scroll-'+id;
      const selector=typeof action==='string'?action:action.click||action.hold;
      scenes.push({id:sid,title:source.title+' · más abajo',group:source.group,route:[...source.route,{scroll:selector}],ready:selector,sources:source.sources,note:'Misma pantalla, desplazada hasta el control indicado.',region:source.region});
      edges.push({from:parent,to:sid,selector:source.region||'#eventsOverlay .sy-body',label:'Deslizar hasta el control',action:'scroll',view:'area'});source=get(sid);
    }
    const route=[...source.route,...(Array.isArray(action)?action:[action])];
    const s={id,title,group,route,ready,sources:opts.sources||source.sources,entry:opts.entry,region:opts.region||source.region,note:opts.note};scenes.push(s);
    const last=Array.isArray(action)?action.at(-1):action;
    const scrolling=typeof last==='object'&&last.scroll;
    edges.push({from:source.id,to:id,selector:scrolling?(source.region||'#eventsOverlay .sy-body'):typeof last==='string'?last:last.click||last.hold||last.fill||last.file,label:opts.label||title,view:'area',action:scrolling?'scroll':typeof last==='object'&&last.file?'file':undefined,step:last});
    if(opts.back)edges.push({from:id,to:source.id,selector:opts.back,label:'Atrás / Cancelar',view:'return'});
    return s;
  }
  get('home').region='body';get('household').region='#householdOverlay .sy-body';get('study').region='#estudioOverlay .sy-body';get('economics').region='#econOverlay .sy-body';
  add('hours','Editar jornada del mes','Inicio','home','#editHoursBtn','#hoursPanel.open',{sources:['js/init.js','js/core.js']});
  add('workday','Ficha de jornada de un día','Inicio','home','.day-cell','#bottomSheet.active',{sources:['js/core.js']});
  add('reminders','Recordatorios','Inicio','settings','#settingsReminders','#homePopup',{sources:['js/home-popup.js','js/events-picker-color.js','js/events-order.js']});
  add('hours-export','Exportar horas','Inicio','home','#hoursExportBtn','#hoursCsv',{sources:['js/invoices-ui.js']});
  add('invoice','Enviar factura','Inicio','home','#invoiceHomeBtn','#invoiceConfig',{sources:['js/invoices-ui.js','js/invoices.js','js/invoices-calendar.js'],region:'.invoice-body',note:'Agosto de 2026 se presenta como referencia histórica.'});
  add('invoice-config','Configuración de facturas','Inicio','invoice','#invoiceConfig','#invoiceSettingsEdit',{sources:['js/invoices-ui.js','js/invoices.js']});
  add('invoice-config-edit','Editar datos de facturación','Inicio','invoice-config','#invoiceSettingsEdit','#invoiceSettingsSave');
  add('home-september','Inicio · septiembre','Inicio','home','#nextBtn','#invoiceHomeBtn');
  add('home-october','Inicio · octubre','Inicio','home-september','#nextBtn','#invoiceHomeBtn');
  add('home-invoice-connection','Inicio · conectar estado de factura','Inicio','home-october','[data-home-invoice="configure"]','#invoiceSettingsSave',{sources:['js/invoices-home.js','js/invoices-ui.js','js/invoices.js'],region:'.invoice-body',note:'Consulta sin configurar: el botón abre la conexión privada existente.'});
  add('invoice-current','Preparar factura del mes','Inicio','home-october','#invoiceHomeBtn','#invoiceJson',{sources:['js/invoices-ui.js','js/invoices.js','js/invoices-calendar.js'],region:'.invoice-body'});
  add('invoice-document','Adjuntar factura definitiva','Inicio','invoice-current','#invoiceDocument summary','#invoiceFinalFile',{scroll:true});
  // Calendarios y pestañas de Eventos.
  for(const [id,title,button]of [['annual','Calendario anual','#evViewAnnual'],['quad','Calendario 4 meses','#evViewQuad'],['timeoff','Vacaciones y festivos','#evViewTimeOff']])add(id,title,'Eventos','events',button,button+'.active');
  add('bridges','Puentes','Eventos','timeoff','#evSubPuentes','#evSubPuentes.active',{sources:['js/summary.js']});
  add('calendar-bar-titles','Calendario · títulos en barras grandes','Eventos','calendar','#evNext','.ev-cell[data-ds="2026-09-30"]',{sources:['js/events-cal.js','js/events.js'],region:'#eventsOverlay .sy-body'});
  for(const [id,title,button]of [['agenda','Agenda','#evSubAgenda'],['all-events','Todos','#evSubTodos'],['event-stats','Estadísticas','#evSubStats']])add(id,title,'Eventos','events',button,button+'.active');
  add('event-birthdays','Cumpleaños en Próximos','Eventos','events','#evUpBirthdays','#evBdayAdd');
  add('event-filter','Filtros de eventos','Eventos','all-events','#evTypesFilter','#evTypeFilterOv.open',{sources:['js/events-bind.js']});
  add('event-order','Orden de Próximos','Eventos','events','#evUpcomingOrder','#evPlanOrderOv.open',{sources:['js/events-order.js']});
  add('event-new','Nuevo evento','Eventos','events','#evAdd','#evFTitle',{scroll:true,sources:['js/events-form.js','js/events-form-controls.js','js/events-form-schedule.js'],region:'.ev-event-form-body'});
  add('event-new-details','Nuevo evento · nombre, notas y horario','Eventos','event-new',{scroll:'.ev-form-lead'},'#evFTitle',{label:'Deslizar · completar los datos'});
  add('event-delete','Eliminar evento','Eventos','all-events',{hold:'.ev-list-item[data-id="map-demo"]'},'#evDelOv.open',{sources:['js/events-detail.js'],label:'Pulsación larga del evento'});
  add('large-detail','Ficha de evento grande','Eventos','calendar',{click:'.ev-multi-bar[data-id="map-trip"]',position:{x:8,y:8}},'#evDetailOv.open',{sources:['js/events-detail.js','js/events-alarm-policy.js']});
  add('started-detail','Evento ya iniciado','Eventos','calendar','.ev-cell[data-ds="2026-08-21"] [data-id="map-started"]','#evDetailOv.open',{sources:['js/events-detail.js','js/events-alarm-policy.js']});
  add('event-alarm','Alarma de evento','Eventos','day','#evDAlarm','#evAlarmOv.open',{sources:['js/events-detail.js']});
  add('routine-session','Ficha de sesión','Rutinas','calendar','.ev-cell[data-ds="2026-08-21"] [data-id="rut-fx-rut-gym-2026-08-21"]','#evDetailOv.open',{sources:['js/events-detail.js','js/rutinas.js']});
  add('plan-picker','Selector de planes','Eventos','edit','.ev-plan-more[data-picker="plans"]','#evPlanPickerOv.open',{scroll:true,sources:['js/events-plan-picker.js'],region:'#evPlanPickerOv .ev-plan-options'});
  add('plan-picker-new-plans','Planes · nuevas opciones','Eventos','plan-picker',{scroll:'#evPlanPickerOv [data-type="Fútbol"]'},'#evPlanPickerOv [data-type="Fútbol"]',{label:'Deslizar · nuevos planes',region:'#evPlanPickerOv .ev-plan-options'});
  // Bodas: rutas de consulta y formularios compartidos.
  add('weddings','Consulta de clases','Bodas','events','#evViewBodas','[data-bsub="clases"].active',{sources:['js/bodas.js','js/bodas-bind.js']});
  add('calendar-export','Exportar calendario','Bodas','weddings','#evCalendarExport','#evCalendarExportOv.open',{sources:['js/events-calendar-export.js']});
  for(const [id,title,key]of [['couples','Parejas','parejas'],['wedding-calendar','Calendario de clases','calendario'],['wedding-stats','Estadísticas de bodas','stats'],['wedding-config','Configuración de bodas','config']])add(id,title,'Bodas','weddings','[data-bsub="'+key+'"]','[data-bsub="'+key+'"].active');
  add('wedding-edit','Edición de clases','Bodas','weddings','[data-bmode="editar"]','[data-bmode="editar"].active');
  add('wedding-class','Ficha de clase','Bodas','weddings','.boda-cl-edit','#bodaFormOv.open',{sources:['js/bodas-class-form.js']});
  for(const [id,title,button,ready]of [['wedding-time','Elegir hora de clase','[data-fcampo="hora"]','#bodaTpOv.open'],['wedding-place','Elegir sala','[data-fcampo="sala"]','#bodaPpkOv.open'],['wedding-couple','Elegir pareja','[data-fcampo="pareja"]','#bodaCpkOv.open'],['wedding-duration','Elegir duración','#bodaFormDuration','#bodaDurationOv.open'],['wedding-teachers','Elegir profesores','#bodaFormTeachers','#bodaTeachersOv.open']])add(id,title,'Bodas','wedding-class',button,ready,{sources:['js/bodas-class-form.js','js/bodas-assign.js']});
  add('couple-card','Pareja desplegada','Bodas','couples','.boda-card-hd','.boda-card.abierta');
  add('couple-form','Ficha de pareja','Bodas','couple-card','.boda-c-edit','#bodaCFormOv.open',{sources:['js/bodas-bind.js'],region:'.ev-fixed-form-body'});
  add('wedding-new','Añadir clase','Bodas','weddings','#bodaAddClass','#bodaFormOv.open',{sources:['js/bodas-class-form.js']});
  add('couple-new','Añadir pareja','Bodas','couples','#bodaAddCouple','#bodaCFormOv.open');
  add('wedding-assign','Asignar clases','Bodas','couple-card','.boda-c-asig','#bodaAsgOv.open',{sources:['js/bodas-assign.js']});
  add('wedding-issues','Incidencias de clases','Bodas','weddings','[data-issue="pendientes"]','#bodaIssOv.open',{sources:['js/bodas-assign.js']});
  for(const [id,title,kind]of [['wedding-pack','Catálogo de packs','packs'],['wedding-length','Catálogo de duraciones','durations'],['wedding-room','Catálogo de salas','places']])add(id,title,'Bodas','wedding-config','[data-cfg-add="'+kind+'"]','#bodaCatalogOv.open',{scroll:true,sources:['js/bodas-config.js']});
  // Cumpleaños.
  add('birthdays','Próximos cumpleaños','Cumpleaños','events','#evViewBday','#bdViewUpcoming.active',{sources:['js/birthdays-render.js','js/birthdays-bind.js']});
  add('birthday-list','Lista de cumpleaños','Cumpleaños','birthdays','#bdViewList','#bdViewList.active');
  add('birthday-calendar','Calendario de cumpleaños','Cumpleaños','birthdays','#bdViewCal','#bdViewCal.active');
  add('birthday-day-list','Cumpleaños del día','Cumpleaños','birthday-calendar','[data-bday-day-list]','#bdDayOv.open',{sources:['js/birthdays-render.js','js/birthdays-bind.js'],back:'#bdDayClose'});
  add('birthday-day-person','Persona desde el listado del día','Cumpleaños','birthday-day-list','[data-day-person]','#bdDetailOv.open',{sources:['js/birthdays-panels.js']});
  add('birthday-person','Ficha de persona','Cumpleaños','birthday-list','.bday-list-item[data-bday-idx="0"]','#bdDetailOv.open',{sources:['js/birthdays-panels.js']});
  add('birthday-form','Añadir o editar persona','Cumpleaños','birthday-person','#bdDEdit','#bdFormOv.open');
  add('birthday-alarm','Alarma de cumpleaños','Cumpleaños','birthday-person','#bdDAlarm','#bdAlarmOv.open');
  add('birthday-groups','Selector de grupos','Cumpleaños','birthday-person','#bdCategories','#bdCategoryOv.open',{sources:['js/birthdays-groups.js']});
  add('birthday-day','Selector de día','Cumpleaños','birthday-form','#bdFDayPick','#bdDateOv.open');
  add('birthday-month','Selector de mes','Cumpleaños','birthday-form','#bdFMonthPick','#bdDateOv.open');
  add('birthday-group-edit','Edición de grupos','Cumpleaños','birthday-list','#bdEditGroups','#bdGroupEditOv.open',{sources:['js/birthdays-groups.js']});
  add('birthday-filters','Filtros de grupos','Cumpleaños','birthday-list','.bday-group-tools summary','.bday-filter-options');
  add('birthday-vip','Edición de VIPs','Cumpleaños','birthday-list','#bdEditVip','#bdCancelEdit');
  // Rutinas e histórico.
  add('routines','Lista de rutinas','Rutinas','events','#evViewRutinas','[data-rsub="lista"].active',{sources:['js/rutinas.js']});
  add('routine-stats','Estadísticas de rutinas','Rutinas','routines','[data-rsub="stats"]','[data-rsub="stats"].active');
  add('routine-form','Añadir o editar rutina','Rutinas','routines','.rut-edit[data-rid="fx-rut-gym"]','#rutFormOv.open',{sources:['js/rutinas-form.js'],region:'.rut-form-body'});
  add('routine-week','Selección de semana','Rutinas','routines','[data-rweek="fx-rut-gym"]','#rutWkOv.open');
  add('routine-week-edit','Edición de semana','Rutinas','routine-week','.rut-wpick-real [data-week="2026-08-24"]','#rutWkSave');
  add('routine-history','Histórico de sesiones','Rutinas','routines','[data-rhistory="fx-rut-gym"]','#rutHistoryOv.open',{sources:['js/rutinas-history.js'],region:'.rut-history-body'});
  add('routine-history-edit','Editar sesión histórica','Rutinas','routine-history','[data-history-edit]','#rutHistoryEditOv.open');
  add('routine-delete','Eliminar sesión','Rutinas','routine-history-edit','#rutHistoryDelete','#rutDeleteOv.open',{sources:['js/rutinas-sessions.js']});
  add('routine-bulk','Acciones en varias sesiones','Rutinas','routine-history','#rutHistoryBulk','[data-history-select]',{sources:['js/rutinas-bulk.js']});
  add('routine-bulk-selected','Selección de sesiones','Rutinas','routine-bulk','[data-history-select]','[data-rut-bulk-action="delete"]:not([disabled])');
  add('routine-bulk-confirm','Confirmación de acciones múltiples','Rutinas','routine-bulk-selected','[data-rut-bulk-action="delete"]','#rutBulkOv.open');
  add('routine-addition','Clase extra o recuperación','Rutinas','routine-history','#rutHistoryAdd','[data-addition-mode="recover"]',{sources:['js/rutinas-addition.js']});
  add('routine-recoveries','Lista de recuperaciones','Rutinas','routine-addition','[data-addition-mode="recover"]','#rutRecoveryExcludePast',{sources:['js/rutinas-recovery.js']});
  add('routine-earlier-picker','Recuperar una clase antes de la original','Rutinas','routine-recoveries','[data-recover-origin]','#rutRecoveryConfirm',{sources:['js/rutinas-recovery.js','js/rutinas-sessions.js']});
  add('routine-earlier-selected','Recuperación elegida el día anterior','Rutinas','routine-earlier-picker','.rut-dpick-real .ev-cell[data-ds="2026-08-04"]','#rutRecoveryConfirm:not([disabled])');
  add('routine-earlier-form','Confirmar recuperación anterior','Rutinas','routine-earlier-selected','#rutRecoveryConfirm','#rutExtraSave',{sources:['js/rutinas-addition.js','js/rutinas-sessions.js']});
  add('routine-earlier-saved','Recuperación anterior guardada','Rutinas','routine-earlier-form','#rutExtraSave','#rutHistoryOv.open',{sources:['js/rutinas-history.js','js/rutinas-sessions.js']});
  add('routine-extra','Elegir día de recuperación','Rutinas','routines','[data-rextra="fx-rut-gym"]','#rutAdditionOv.open',{sources:['js/rutinas-recovery.js']});
  add('routine-extra-selected','Día elegido para la clase extra','Rutinas','routine-extra','.rut-dpick-real .ev-cell[data-ds="2026-08-24"]','#rutRecoveryConfirm:not([disabled])');
  add('routine-extra-day','Añadir clase extra','Rutinas','routine-extra-selected','#rutRecoveryConfirm','#rutExtraSave',{sources:['js/rutinas-addition.js']});
  add('routine-flex','Planificación flexible','Rutinas','routines','[data-rplan="map-flex"]','#rutPlanOv.open',{scroll:true,sources:['js/rutinas-flex.js']});
  add('routine-new','Nueva rutina','Rutinas','routines','#rutAdd','#rutFTime',{scroll:true,sources:['js/rutinas-form.js'],region:'.ev-form-sheet'});
  add('routine-time','Hora de una rutina','Rutinas','routine-new','#rutFTime','#timePickerOv.open',{sources:['js/time-picker.js']});
  // Hogar y estudios de suministros.
  for(const [id,title,key]of [['mortgage','Detalle hipoteca','detalle'],['gas','Detalle gas','gas'],['electric','Detalle electricidad','elect']])add(id,title,'Hogar','household','[data-hipsub="'+key+'"]','[data-hipsub="'+key+'"].active',{sources:['js/economics-fiscal-hip.js','js/economics-fiscal-gas.js','js/economics-fiscal-elect.js']});
  add('purchase-edit','Edición compra','Hogar','mortgage','[data-editsection="compra"]','[data-savesection="compra"]');
  add('loan-edit','Edición préstamo','Hogar','mortgage','[data-editsection="prestamo"]','[data-savesection="prestamo"]',{scroll:true});
  add('switch-edit','Edición subrogación','Hogar','mortgage','[data-editsection="sub-0"]','[data-savesection="sub-0"]',{scroll:true});
  add('mortgage-analysis','Análisis de hipoteca','Hogar','mortgage','#hipGoAnalisis','#ecTabAnalisis.active');
  add('gas-edit','Editar tarifa de gas','Hogar','gas','[data-gasedit="consumo"]','[data-gassave="consumo"]');
  add('gas-flat-edit','Editar cuota fija de gas','Hogar','gas','[data-gasedit="fijo"]','[data-gassave="fijo"]',{scroll:true});
  add('electric-edit','Editar tarifa de electricidad','Hogar','electric','#electEditBtn','#electSaveBtn');
  for(const [kind,parent,group]of [['gas','gas','Energía · gas'],['luz','electric','Energía · electricidad']]){
    const id='energy-'+kind;add(id,'Resumen de '+(kind==='gas'?'gas':'electricidad'),group,parent,'.energy-analysis-open','#energyAnalysisOverlay.open',{sources:['js/energy-analysis-view.js','js/energy-analysis-bind.js','js/energy-study.js','js/energy-costs.js'],region:'#energyAnalysisOverlay .sy-body'});
    for(const [key,label]of [['consumo','Consumo'],['costes','Coste'],['tarifas','Tarifas'],['comparar','Escenarios']])add(id+'-'+key,label+' de '+(kind==='gas'?'gas':'electricidad'),group,id,'[data-energy-tab="'+key+'"]','[data-energy-tab="'+key+'"].active');
    add(id+'-costes-neto','Coste · estimación sin IVA',group,id+'-costes','#energyVatCycle','.energy-cost-chart',{note:'Estimación explícita sin IVA. El fixture cubre ocho meses; no se rellenan los cuatro restantes.'});
    add(id+'-costes-constante','Coste · estimación con IVA constante',group,id+'-costes-neto','#energyVatCycle','.energy-tax-controls label:not([hidden]) #energyCostRate',{note:'IVA constante para explorar el escenario; no modifica los impuestos históricos ni la comparación con facturas.'});
  }
  // Herramientas y economía/fiscal.
  for(const [id,title,button]of [['study-rate','Calcular tarifa','#ecSubSim'],['study-mortgage','Comparar hipotecas','#ecSubHip'],['study-gas','Comparar gas','#ecSubGas'],['study-electric','Comparar electricidad','#ecSubElect']])add(id,title,'Herramientas','study',button,button+'.active');
  add('energy-tariff','Editor de tarifa','Herramientas','study-gas','[data-energy-legacy][data-energy-kind="gas"]','#energyTariffOverlay.open',{scroll:true,sources:['js/energy-tariff-editor.js']});
  for(const [id,title,button]of [['econ-days','Resumen horas y días','#ecTabDias'],['econ-tax','Análisis gastos y renta','#ecTabGastos'],['econ-personal','Análisis economía personal','#ecTabAnalisis']])add(id,title,'Economía','economics',button,button+'.active');
  add('fiscal','Economía personal','Fiscal','economics','#ecGear','#fiscalTabPersonal.active',{sources:['js/economics-fiscal.js','js/economics-fiscal-bind.js'],region:'#fiscalOverlay .sy-body'});
  for(const [id,title,button]of [['fiscal-expenses','Gastos desgravables','#fiscalTabGastosDesg'],['fiscal-irpf','IRPF y deducciones','#fiscalTabIrpfDeduc'],['fiscal-home','Hipoteca y facturas en consulta','#fiscalTabDespacho']])add(id,title,'Fiscal','fiscal',button,button+'.active');
  add('personal-periods','Editor de períodos personales','Fiscal','fiscal','[data-pp-edit]','#personalPeriodsOverlay.open',{scroll:true,sources:['js/personal-periods-editor.js']});
  // Ajustes y panel flotante de tareas.
  for(const [id,title,button,ready,src]of [['mail','Correo de horas','#editConnectionsBtn','#connectionsOv.open','js/settings-menu.js'],['macro','Conexión MacroDroid','#editMacroBtn','#connectionsOv.open','js/settings-menu.js'],['contacts','Datos personales','#personalDataBtn','#personalDataOv.open','js/settings-personal.js'],['notes','Notas generales','#personalNotesBtn','#personalNotesOv.open','js/settings-personal.js'],['icons','Estilo de iconos','#navIconStyle','#navIconPickerOv.open','js/nav-icons.js']])add(id,title,'Ajustes','settings',button,ready,{sources:[src],region:'body'});
  add('hairdresser','Notas de peluquería','Ajustes','notes','#personalHairdresserTab','#personalHairdresserTab.active',{sources:['js/settings-personal.js']});
  add('export-folder','Carpeta de exportación','Ajustes','settings','#exportFolderBtn','#exportFolderOv.open',{sources:['js/export-files.js'],note:'El siguiente paso abre el selector nativo de carpetas del navegador; queda fuera de las capturas de la app.'});
  add('export-mode','Modo de exportación','Ajustes','hours-export','#hoursCsv','#exportChoiceOv.open',{sources:['js/export-files.js'],note:'Opciones del archivo ficticio. El recorrido se detiene antes de guardar o compartir.'});
  add('import-preview','Previsualización y modo de importación','Ajustes','settings',{file:'#importAllFile',name:'ejemplo-mapa.json',data:{version:7,events:[{id:'map-import',kind:'puntual',type:'Otros',title:'Evento inventado para previsualización',start:'2026-08-25',end:'2026-08-25',color:'#537b78'}]}},'.imp-mode-ov.open',{sources:['js/import-export.js','js/import-preview.js'],note:'Archivo ficticio seleccionado en un perfil aislado; no se confirma Añadir ni Reemplazar.'});
  // El selector de archivo no es un control visible: la flecha nace en Importar.
  edges.at(-1).selector='#importAllBtn';
  add('tasks','Tareas pendientes','Tareas','home','#tasksFab','#tasksOverlay.open',{sources:['js/tasks-view.js','js/tasks.js'],region:'#tasksList'});
  add('tasks-completed','Tareas completadas','Tareas','tasks','[data-tasks-view="done"]','[data-tasks-view="done"].active');
  add('task-edit','Editar tarea y color','Tareas','tasks','.task-more','.task-editor',{label:'⋯ Opciones · editar tarea'});
  add('tasks-selected','Tarea marcada para mover','Tareas','tasks','.task-title','.task-row input:checked',{label:'Pulsar el texto · marcar tarea',sources:['js/tasks-view.js','js/tasks.js']});
  for(const [id,sources]of [['wedding-stats',['js/bodas-assign.js','js/bodas-config.js']],['routine-stats',['js/rutinas.js']],['event-stats',['js/events-statistics.js']]])get(id).sources=[...new Set([...get(id).sources,...sources,'js/statistics-ui.js'])];
  add('wedding-stats-charts','Estadísticas · meses y semanas','Bodas','wedding-stats',{scroll:'.stats-section:has(h3:text-is("Clases por mes"))'},'.stats-section:has(h3:text-is("Clases por mes"))',{label:'Deslizar · gráficos por período'});
  add('wedding-stats-packs','Estadísticas · distribución y packs','Bodas','wedding-stats-charts',{scroll:'.boda-distribution'},'.boda-distribution',{label:'Deslizar · distribución y extras'});
  add('wedding-stats-teachers','Estadísticas · profesores y reparto','Bodas','wedding-stats-packs',{scroll:'.stats-section:has(h3:text-is("Clases dadas por profesores"))'},'.stats-section:has(h3:text-is("Clases dadas por profesores"))',{label:'Deslizar · profesores y reparto'});
  add('routine-stats-detail','Estadísticas · detalle de una rutina','Rutinas','routine-stats',{scroll:'.rut-stat-card'},'.rut-stat-card',{label:'Deslizar · actividad e historial'});
  add('event-stats-breakdown','Estadísticas · desglose por categoría','Eventos','event-stats',{scroll:'.ev-stat-section'},'.ev-stat-section',{label:'Deslizar · desglose de eventos'});
  add('event-stats-links','Estadísticas · criterios y enlaces','Eventos','event-stats-breakdown',{scroll:'#evStatsRoutines'},'#evStatsRoutines',{label:'Deslizar · criterios y otras estadísticas'});
  edges.push({from:'event-stats-links',to:'routine-stats',selector:'#evStatsRoutines',label:'Estadísticas de Rutinas',view:'area'},{from:'event-stats-links',to:'wedding-stats',selector:'#evStatsRehearsals',label:'Estadísticas de Wedding Moves',view:'area'});
};

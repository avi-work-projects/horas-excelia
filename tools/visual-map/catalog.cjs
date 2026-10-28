// Inventario editorial: una entrada por pantalla/estado, no por cada combinación de datos.
const home=[],calendar=['#eventsBtn'],events=[...calendar,'#evViewUpcoming'];
const day=[...calendar,'.ev-cell[data-ds="2026-08-21"] [data-id="map-demo"]'];
const edit=[...day,'#evDEdit'];
const lower=[...edit,{scroll:'#evFTypePicker [data-ev-multiday="Otros"]'}];
const scenes=[
  {id:'home',title:'Inicio',group:'Inicio',route:home,ready:'#homeBtn',sources:['js/core.js','js/init.js'],layout:[850,65]},
  {id:'household',hidesHome:true,title:'Gastos del hogar',group:'Hogar',route:['#householdBtn'],ready:'#householdOverlay.open',sources:['js/household.js','js/household-summary.js','js/economics-fiscal-hip.js','css/household.css'],layout:[40,705]},
  {id:'study',hidesHome:true,title:'Herramientas de comparación',group:'Herramientas',route:['#estudioBtn'],ready:'#estudioOverlay.open',sources:['js/economics-estudio.js','js/economics-comp.js','js/economics-sim.js'],layout:[365,705]},
  {id:'events',title:'Eventos · Próximos',group:'Eventos',route:events,ready:'#evViewUpcoming.active',sources:['js/events-render.js','js/events-bind.js','js/swipe-render.js','js/events-picker-color.js','js/events-order.js','js/events.js','js/events-alarm-policy.js']},
  {id:'economics',hidesHome:true,title:'Resumen económico',group:'Economía',route:['#econBtn'],ready:'#econOverlay.open',sources:['js/economics.js','js/economics-fiscal-datos.js'],layout:[1015,705]},
  {id:'alarm',title:'Crear alarma',group:'Ajustes',route:['#alarmTestBtn'],ready:'#alarmPanel.open',sources:['js/alarm-panel.js','js/init.js'],layout:[1340,705]},
  {id:'settings',title:'Más opciones',group:'Ajustes',route:['#menuBtn'],ready:'#dataMenu.open',sources:['js/settings-menu.js'],layout:[1665,705]},
  {id:'calendar',hidesHome:true,title:'Calendario · 1 mes',group:'Eventos',route:calendar,ready:'.ev-cell[data-ds="2026-08-21"]',sources:['js/events-cal.js','js/events-render.js','js/events-bind.js','js/events.js'],layout:[690,705],flow:[40,65]},
  {id:'day',title:'Ficha del día',group:'Eventos',route:day,ready:'#evDetailOv.open',entry:'.ev-car-sheet',sources:['js/events-detail.js','js/events.js'],flow:[390,65]},
  {id:'edit',title:'Editar evento · inicio',group:'Eventos',route:edit,ready:'#evFormOv.open',entry:'.ev-event-form-header',sources:['js/events-form.js','js/events-form-schedule.js','js/events-form-controls.js'],flow:[740,65]},
  {id:'time',title:'Elegir hora',group:'Eventos',route:[...edit,'#evFTime'],ready:'#timePickerOv.open',entry:'.time-picker-sheet',sources:['js/time-picker.js'],flow:[1090,65]},
  {id:'edit-scroll',title:'Editar evento · categorías',group:'Eventos',route:lower,ready:'#evFTypePicker [data-ev-multiday="Otros"]',entry:'.ev-event-form-header',sources:['js/events-form.js','js/events-form-schedule.js','js/events-form-controls.js'],flow:[740,705],note:'Mismo formulario, desplazado hasta el botón Multidía.'},
  {id:'dates',title:'Selección Multidía',group:'Eventos',route:[...lower,'#evFTypePicker [data-ev-multiday="Otros"]'],ready:'#dpOv.open',entry:'.dp-hdr',sources:['js/events-picker-date.js'],flow:[1090,705]}
];
const edges=[
  ...[['household','#householdBtn','Gastos del hogar'],['study','#estudioBtn','Comparación'],['calendar','#eventsBtn','Eventos · Calendario 1 mes'],['economics','#econBtn','Resumen económico'],['alarm','#alarmTestBtn','Campana'],['settings','#menuBtn','Más opciones']].map(([to,selector,label])=>({from:'home',to,selector,label,view:'general'})),
  {from:'calendar',to:'events',selector:'#evViewUpcoming',label:'Próximos',view:'bridge'},
  {from:'events',to:'calendar',selector:'#evViewCal',label:'Calendario 1 mes',view:'bridge'},
  {from:'calendar',to:'day',selector:day.at(-1),label:'Pulsar el marcador',view:'flow'},
  {from:'day',to:'edit',selector:'#evDEdit',label:'Editar evento',view:'flow'},
  {from:'edit',to:'time',selector:'#evFTime',label:'Hora',view:'flow'},
  {from:'edit',to:'edit-scroll',selector:'.ev-event-form-body',label:'Deslizar hacia abajo',action:'scroll',view:'flow'},
  {from:'edit-scroll',to:'dates',selector:'#evFTypePicker [data-ev-multiday="Otros"]',label:'Multidía',view:'flow'},
  {from:'time',to:'edit',selector:'#timePickerCancel',label:'Cancelar · volver',view:'return'},
  {from:'dates',to:'edit-scroll',selector:'#dpClose',label:'Atrás · volver',view:'return'},
  {from:'edit',to:'calendar',selector:'#evFClose',label:'Atrás · calendario',view:'return'}
];
// Estados de pestañas no representados por una función openXxx independiente.
const sections=[
  ['Inicio','Jornada y horas del mes|Correos al día y programación individual/conjunta|Actualización manual de estados|Ficha de jornada de un día|Recordatorios|Exportar horas|Estado y envío de factura|Configuración de facturas','js/core.js'],
  ['Hogar','Resumen del hogar|Detalle hipoteca|Detalle gas|Detalle electricidad|Edición compra|Edición préstamo|Edición subrogación|Análisis de hipoteca','js/economics-fiscal-hip.js'],
  ['Herramientas','Comparar escenarios|Calcular tarifa|Comparar hipotecas|Comparar gas|Comparar electricidad','js/economics-estudio.js'],
  ['Eventos','Próximos|Agenda|Todos|Estadísticas|Calendario 1 mes|Calendario 4 meses|Calendario anual|Vacaciones y festivos|Puentes|Orden de Próximos|Filtros de eventos|Exportar calendario|Ficha del día|Detalle evento|Nuevo evento|Editar evento|Eliminar evento|Alarma de evento|Selección Multidía|Elegir hora|Selector de planes|Asignar sesión de rutina','js/events-render.js'],
  ['Bodas','Calendario de clases|Parejas|Consulta de clases|Estadísticas de bodas|Configuración de bodas|Ficha de pareja|Ficha de clase|Asignar clases|Elegir pareja|Elegir sala|Elegir hora de clase|Elegir duración|Elegir profesores|Catálogos de bodas|Incidencias de clases','js/bodas.js'],
  ['Cumpleaños','Próximos cumpleaños|Lista de cumpleaños|Ficha de persona|Añadir o editar persona|Alarma de cumpleaños|Selector de día o mes|Selector de grupos|Edición de grupos','js/birthdays-render.js'],
  ['Rutinas','Lista de rutinas|Estadísticas de rutinas|Añadir o editar rutina|Selección de semana|Edición de semana|Ficha de sesión|Planificación flexible|Histórico de sesiones|Editar sesión histórica|Añadir clase extra|Lista de recuperaciones|Elegir día de recuperación|Acciones en varias sesiones|Eliminar sesión','js/rutinas.js'],
  ['Economía','Resumen económico|Resumen horas y días|Análisis gastos y renta|Análisis economía personal|Configuración fiscal|Economía personal|Gastos desgravables|IRPF y deducciones|Hipoteca y facturas en consulta|Editor de períodos personales','js/economics.js'],
  ['Energía','Resumen de gas|Consumo de gas|Coste de gas|Tarifas de gas|Escenarios de gas|Archivo de gas|Resumen de electricidad|Consumo de electricidad|Coste de electricidad|Tarifas de electricidad|Escenarios de electricidad|Archivo de electricidad|Editor de tarifa','js/energy-analysis-view.js'],
  ['Ajustes','Más opciones|Crear alarma|Correo de horas|Conexión MacroDroid|Datos personales|Notas generales|Notas de peluquería|Estilo de iconos|Carpeta de exportación|Modo de exportación|Previsualización de importación|Añadir o reemplazar al importar|Tareas pendientes y completadas','js/settings-menu.js']
];
require('./extend.cjs')({scenes,edges,sections});
module.exports={scenes,edges,sections};

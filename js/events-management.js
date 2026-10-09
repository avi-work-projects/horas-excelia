/* Símbolos y finalización de gestiones; las citas de salud/peluquería no se completan. */
function evManagementShapeInner(shape){
  var edge=' stroke="#000" '+evSymbolStroke(1.6)+' stroke-linejoin="round"',shapes={
    tax:'<path d="M-9,-3 L0,-9 L9,-3 Z" fill="currentColor"'+edge+'/><path d="M-8,8 H8 M-6,-1 V6 M0,-1 V6 M6,-1 V6" stroke="#000" stroke-width="2" stroke-linecap="round"/><path d="M-9,9 H9" stroke="currentColor" stroke-width="2"/>',
    payment:'<rect x="-9" y="-6" width="18" height="13" rx="2" fill="currentColor"'+edge+'/><path d="M-8,-2 H8" stroke="#000" stroke-width="2.2"/><path d="M-5,3 H-2" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
    insurance:'<path d="M0,-9 L8,-6 V0 Q8,6 0,9 Q-8,6 -8,0 V-6 Z" fill="currentColor"'+edge+'/><path d="M-4,0 L-1,3 L4,-3" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    utilities:'<path d="M-8,-1 L0,-8 L8,-1 V8 H-8 Z" fill="currentColor"'+edge+'/><path d="M1,-4 L-3,2 H0 L-1,6 L4,0 H1 Z" fill="#fff7d3" stroke="#000" stroke-width="1"/>',
    invoice:'<path d="M-7,-9 H3 L7,-5 V9 H-7 Z" fill="#f6faf8"'+edge+'/><path d="M3,-9 V-5 H7 M-4,-3 H1 M-4,0 H0" fill="none" stroke="#000" stroke-width="1.2"/><path d="M-3,5 H8 M4,1 L8,5 L4,9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'
  };return shapes[shape]||null;
}
function evManagementCheckable(ev){return getEvKind(ev)==='puntual'&&evIsManagement(getEvType(ev))&&['Peluquería','Médico','Dentista'].indexOf(getEvType(ev))<0;}
function evManagementDate(ev,ds){return ds&&eventOccursOn(ev,ds)?ds:(ev.end||ev.start);}
function evManagementDone(ev,ds){return tasksData().items.some(function(t){return tasksEventMatches(t,ev,ds)&&t.completedAt!==null;});}
function evManagementCheckHtml(ev,ds){
  if(!evManagementCheckable(ev))return '';
  ds=evManagementDate(ev,ds);
  return '<label class="ev-management-check"><input type="checkbox" id="evManagementDone" style="--chk:#279b64" data-ds="'+ds+'"'+(evManagementDone(ev,ds)?' checked':'')+'><span>Hecho</span></label>';
}
function bindEvManagementCheck(wrap,ev){
  var box=wrap.querySelector('#evManagementDone');if(!box)return;
  box.onchange=function(){
    try{tasksSetEventDone(ev,box.dataset.ds,box.checked);tasksUpdateFab();}
    catch(e){box.checked=!box.checked;showToast(e.message,'error');}
  };
}

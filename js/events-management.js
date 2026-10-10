function evTaxBuildingSvg(){return '<path d="M-9,-3 L0,-9 L9,-3 Z" fill="currentColor" stroke="#000" stroke-width="1.3" stroke-linejoin="round"/><path d="M-8,-1 H8 V7 H-8 Z" fill="currentColor" stroke="#000" stroke-width="1.2"/><path d="M-6,0 V6 M0,0 V6 M6,0 V6 M-9,9 H9" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>';}
function evUtilityHomeSvg(edge){return '<path d="M-8,-1 L0,-8 L8,-1 V8 H-8 Z" fill="currentColor"'+edge+'/>';}
/* Símbolos y finalización de gestiones; las citas de salud/peluquería no se completan. */
function evManagementShapeInner(shape){
  var edge=' stroke="#000" '+evSymbolStroke(1.6)+' stroke-linejoin="round"',shapes={
    tax:evTaxBuildingSvg()+'<g stroke="#17130a" stroke-width="1" stroke-linejoin="round"><path d="M-6,-1 V4 Q-2,7 2,4 V-1" fill="#e4ab24"/><ellipse cx="-2" cy="-1" rx="4" ry="1.7" fill="#ffe081"/><path d="M-6,1.5 Q-2,4.5 2,1.5" fill="none"/><circle cx="4" cy="3" r="3.5" fill="#ffd35b"/><path d="M5,1.5 H3.7 Q2.4,3 3.7,4.5 H5 M2.5,2.5 H4.4 M2.5,3.5 H4.4" fill="none" stroke-width=".65" stroke-linecap="round"/></g>',
    'tax-form':evTaxBuildingSvg()+'<g transform="translate(-1 5)"><path d="M-4,-9 H3 L6,-6 V-1 H-4 Z" fill="#f6f8ff" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/><path d="M3,-9 V-6 H6 M-2,-5 H2 M-2,-3 H2" fill="none" stroke="currentColor" stroke-width="1.2"/></g>',
    payment:'<g fill="currentColor" stroke="#000" stroke-width="1.2" stroke-linejoin="round"><path d="M-9,2 V7 Q-4,10 1,7 V2"/><ellipse cx="-4" cy="2" rx="5" ry="2"/><path d="M-9,4.5 Q-4,7.5 1,4.5" fill="none"/><path d="M0,-6 V5 Q4,8 9,5 V-6"/><ellipse cx="4.5" cy="-6" rx="4.5" ry="2"/><path d="M0,-2 Q4.5,1 9,-2 M0,1.5 Q4.5,4.5 9,1.5" fill="none"/></g>',
    appointment:'<rect x="-8" y="-7" width="16" height="15" rx="2" fill="currentColor"'+edge+'/><path d="M-4,-9 V-5 M4,-9 V-5 M-7,-2 H7" stroke="#000" stroke-width="1.6" stroke-linecap="round"/><circle cx="3" cy="4" r="4.8" fill="#fff8e9" stroke="#000" stroke-width="1.3"/><path d="M3,1 V4 L5,5" fill="none" stroke="#000" stroke-width="1.2" stroke-linecap="round"/>',
    'gas-home':evUtilityHomeSvg(edge).replace('currentColor','#65ad83')+'<path d="M1,-4 C0,0 -4,1 -3,4 C-2,8 4,8 4,3 C4,1 2,0 1,-4 Z" fill="#fff5d3" stroke="#000" stroke-width="1.1"/><path d="M1,2 C-2,5 1,7 2,5 Z" fill="#ef8c3e"/>',
    'electric-home':evUtilityHomeSvg(edge).replace('currentColor','#65ad83')+'<path d="M1,-4 L-3,2 H0 L-1,6 L4,0 H1 Z" fill="#fff7d3" stroke="#000" stroke-width="1"/>',
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
  return '<label class="ev-management-check"><input type="checkbox" id="evManagementDone" style="--chk:#279b64" data-ds="'+ds+'"'+(evManagementDone(ev,ds)?' checked':'')+'><span class="ev-management-state"><span class="ev-management-pending">Pendiente</span><span class="ev-management-complete">Hecho</span></span></label>';
}
function bindEvManagementCheck(wrap,ev){
  var box=wrap.querySelector('#evManagementDone');if(!box)return;
  box.onchange=function(){
    try{tasksSetEventDone(ev,box.dataset.ds,box.checked);tasksUpdateFab();}
    catch(e){box.checked=!box.checked;showToast(e.message,'error');}
  };
}

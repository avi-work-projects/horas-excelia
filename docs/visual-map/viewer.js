'use strict';
(() => {
  const data=window.VISUAL_MAP,$=id=>document.getElementById(id),W=220,S=W/data.viewport.width,H=data.viewport.height*S,TOP=46;
  const state={view:'general',selected:'home',scale:.5,x:0,y:0,returns:false,compare:['household','study','economics']};
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const notes=window.VISUAL_MAP_NOTES||{};
  const status=s=>!s.image?'Pendiente':!s.fresh?'Actualizar captura':notes[s.id]?'Revisar · '+window.VISUAL_MAP_PRIORITIES[s.id]:s.review;
  const scene=id=>data.scenes.find(s=>s.id===id),maps=new Map();
  maps.set('general',{title:'Los accesos principales',ids:data.scenes.filter(s=>s.layout).map(s=>s.id)});
  maps.set('flow',{title:'Del calendario a los selectores',ids:data.scenes.filter(s=>s.flow).map(s=>s.id)});
  const groups=[...new Set(data.scenes.map(s=>s.group))];
  groups.forEach((group,g)=>{
    const owned=data.scenes.filter(s=>s.group===group);
    for(let start=0;start<owned.length;start+=10){
      const ids=owned.slice(start,start+10).map(s=>s.id),incoming=data.edges.find(e=>e.to===ids[0]&&!ids.includes(e.from)&&e.view!=='return');
      if(incoming)ids.unshift(incoming.from);
      const id='area-'+g+'-'+Math.floor(start/10),pages=Math.ceil(owned.length/10);
      const title=group+(pages>1?' · '+(Math.floor(start/10)+1)+'/'+pages:'');maps.set(id,{title,ids,group});
      const option=document.createElement('option');option.value=id;option.textContent=title;$('areaSelect').append(option);
    }
    for(const select of [$('compareGroup')]){const o=document.createElement('option');o.value=group;o.textContent=group;select.append(o);}
  });
  const visible=()=>maps.get(state.view).ids.map(scene);
  const position=s=>state.view==='general'?s.layout:state.view==='flow'?s.flow:[40+(maps.get(state.view).ids.indexOf(s.id)%4)*350,180+Math.floor(maps.get(state.view).ids.indexOf(s.id)/4)*700];
  const dimensions=()=>({width:Math.max(...visible().map(s=>position(s)[0]+W))+(state.view.startsWith('area-')?160:90),height:Math.max(...visible().map(s=>position(s)[1]+TOP+H))+100+(state.returns?150:0)});
  const availableEdges=()=>data.edges.filter(e=>visible().some(s=>s.id===e.from)&&visible().some(s=>s.id===e.to)&&(e.view!=='return'||state.returns)&&(!state.view.startsWith('area-')||!$('focusEdges').checked||e.from===state.selected||e.to===state.selected));
  $('edition').textContent='Base '+data.referenceCommit.slice(0,7)+' · móvil 400 × 880';$('scope').textContent=data.scope;
  function activate(view){
    state.view=view;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
    const map=maps.has(view);$('workspace').hidden=!map;$('inspector').hidden=!map;$('comparison').hidden=view!=='compare';$('inventory').hidden=view!=='inventory';$('areaSelect').value=view.startsWith('area-')?view:'';
    if(map){$('viewTitle').textContent=maps.get(view).title;$('viewSubtitle').textContent=view==='general'?'Inicio conecta con las cinco áreas principales y sus menús auxiliares.':view==='flow'?'Un mismo formulario puede tener varios estados de scroll. Las flechas siguen controles reales.':'Selecciona una captura para seguir sus conexiones. Los enlaces entre secciones abren el mapa de destino.';$('focusControl').hidden=!view.startsWith('area-');if(!visible().some(s=>s.id===state.selected))state.selected=visible()[0].id;renderMap();fit();inspect();}
    if(view==='compare')renderComparison();if(view==='inventory')renderInventory();
  }
  function renderMap(){
    const list=visible(),size=dimensions();$('stage').style.width=size.width+'px';$('stage').style.height=size.height+'px';
    $('nodes').innerHTML=list.map((s,i)=>{const [x,y]=position(s);return '<article class="screen-node'+(s.id===state.selected?' selected':'')+'" data-scene="'+s.id+'" style="left:'+x+'px;top:'+y+'px"><div class="node-head"><span class="node-index">'+String(i+1).padStart(2,'0')+'</span><strong>'+escape(s.title)+'</strong></div><div class="screen">'+(s.image?'<img src="'+s.image+'" alt="Captura real de '+escape(s.title)+'" data-enlarge="'+s.id+'" loading="eager">':'<p>Captura pendiente</p>')+hotspots(s,S)+'</div><div class="node-foot"><span>'+escape(s.group)+'</span><span class="review">'+escape(status(s))+'</span></div></article>';}).join('');
    bindScreens($('nodes'));drawEdges();
  }
  function hotspots(s,scale){return data.edges.filter(e=>e.from===s.id&&(e.view!=='return'||state.returns)).map(e=>{const b=s.anchors?.[e.to];if(!b)return '';return '<button class="hotspot'+(e.action==='scroll'?' scroll':'')+'" style="left:'+b.x*scale+'px;top:'+b.y*scale+'px;width:'+b.width*scale+'px;height:'+b.height*scale+'px" title="'+escape(e.label+' → '+scene(e.to).title)+'" aria-label="'+escape(e.label+' → '+scene(e.to).title)+'" data-target="'+e.to+'"></button>';}).join('');}
  function bindScreens(root){root.querySelectorAll('[data-enlarge]').forEach(el=>el.onclick=()=>{state.selected=el.dataset.enlarge;inspect();enlarge(scene(state.selected));});root.querySelectorAll('[data-target]').forEach(el=>el.onclick=e=>{e.stopPropagation();if($('screenDialog').open)$('screenDialog').close();focusScene(el.dataset.target);});root.querySelectorAll('[data-scene]').forEach(el=>el.addEventListener('click',()=>{state.selected=el.dataset.scene;inspect();}));}
  function drawEdges(){
    const ns='http://www.w3.org/2000/svg',svg=$('connections'),size=dimensions();svg.replaceChildren();svg.setAttribute('viewBox','0 0 '+size.width+' '+size.height);
    const defs=document.createElementNS(ns,'defs');defs.innerHTML='<marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#476880"/></marker>';svg.append(defs);
    availableEdges().forEach((e,i)=>{
      const a=scene(e.from),b=scene(e.to),r=a.anchors?.[e.to];if(!r)return;const [ax,ay]=position(a),[bx,by]=position(b),x=ax+(r.x+r.width/2)*S,y=ay+TOP+(r.y+r.height/2)*S;
      let endX=bx,endY=by+TOP+H/2,d,labelX,labelY;
      if(state.view.startsWith('area-')){
        // Circular entre tarjetas por los márgenes; no atravesar otras capturas.
        const lane=availableEdges().filter(edge=>edge.from===e.from).indexOf(e),sideX=ax+W+22+lane*7,targetSide=bx-22-(lane%3)*6,channel=by-38-(lane%9)*8;
        endX=bx-7;endY=by+TOP+(b.entryBox?b.entryBox.y+Math.min(30,b.entryBox.height/2):data.viewport.height*.52)*S;
        d=`M ${x} ${y} L ${sideX} ${y} L ${sideX} ${channel} L ${targetSide} ${channel} L ${targetSide} ${endY} L ${endX} ${endY}`;labelX=bx;labelY=by-12;
      }else if(state.view==='general'){
        endX=bx+W/2;endY=by+TOP-7;const channel=ay+TOP-26-i*8;const sideX=(endX<x?ax-40-i*8:ax+W+40+i*8);d=`M ${x} ${y} L ${x} ${channel} L ${sideX} ${channel} L ${sideX} ${by-28} L ${endX} ${by-28} L ${endX} ${endY}`;labelX=endX;labelY=by-40;
      }else if(e.action==='scroll'){
        endX=bx+W/2;endY=by+TOP-7;const sideX=ax+W+45;d=`M ${x} ${y} L ${sideX} ${y} L ${sideX} ${by-30} L ${endX} ${by-30} L ${endX} ${endY}`;labelX=ax+10;labelY=by-44;
      }else if(e.view==='return'){
        endX=bx+W/2;endY=by+TOP+H+7;const lane=Math.max(ay,by)+TOP+H+48+i*4;d=`M ${x} ${y} L ${ax+W+25} ${y} L ${ax+W+25} ${lane} L ${endX} ${lane} L ${endX} ${endY}`;labelX=(x+endX)/2;labelY=lane-9;
      }else{
        endX=bx+(b.entryBox?.x||0)*S-7;endY=by+TOP+(b.entryBox?b.entryBox.y+Math.min(30,b.entryBox.height/2):data.viewport.height*.52)*S;const channel=ax+W+55;d=`M ${x} ${y} L ${channel} ${y} L ${channel} ${endY} L ${endX} ${endY}`;labelX=channel+5;labelY=endY-16;
      }
      const group=document.createElementNS(ns,'g'),path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke','#476880');path.setAttribute('stroke-width',e.from===state.selected?'2.5':'1.5');path.setAttribute('stroke-linejoin','round');path.setAttribute('marker-end','url(#arrow)');if(e.action==='scroll'||e.view==='return')path.setAttribute('stroke-dasharray','5 5');group.append(path);
      const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r','3.5');dot.setAttribute('fill','#f6f5f0');dot.setAttribute('stroke','#316d61');dot.setAttribute('stroke-width','1.5');group.append(dot);
      const text=document.createElementNS(ns,'text');text.setAttribute('x',labelX);text.setAttribute('y',labelY);text.setAttribute('font-size','12');text.setAttribute('text-anchor',state.view==='general'?'middle':'start');text.setAttribute('fill','#365649');text.setAttribute('stroke','#f6f5f0');text.setAttribute('stroke-width','5');text.setAttribute('paint-order','stroke');text.textContent=e.label;group.append(text);svg.append(group);
    });
  }
  function transform(){$('stage').style.transform=`translate(${state.x}px,${state.y}px) scale(${state.scale})`;$('zoomValue').value=Math.round(state.scale*100)+' %';}
  function fit(){const box=$('canvas').getBoundingClientRect(),list=visible(),maxX=Math.max(...list.map(s=>position(s)[0]+W))+45,maxY=Math.max(...list.map(s=>position(s)[1]+TOP+H+50+(state.returns?150:0)));state.scale=Math.min(box.width/maxX,box.height/maxY);state.x=(box.width-maxX*state.scale)/2;state.y=12;transform();}
  function zoom(factor){const box=$('canvas').getBoundingClientRect(),x=box.width/2,y=box.height/2,next=Math.max(.15,Math.min(2,state.scale*factor)),ratio=next/state.scale;state.x=x-(x-state.x)*ratio;state.y=y-(y-state.y)*ratio;state.scale=next;transform();}
  function focusScene(id){const s=scene(id);if(!s)return;if(!maps.has(state.view)||!visible().some(n=>n.id===id)){const own=[...maps].find(([key,m])=>key.startsWith('area-')&&m.group===s.group&&m.ids.includes(id));activate(s.flow?'flow':own?own[0]:'general');}state.selected=id;const [x,y]=position(s),box=$('canvas').getBoundingClientRect();state.scale=Math.min(1.35,(box.height-55)/(TOP+H+30));state.x=(box.width-W*state.scale)/2-x*state.scale;state.y=20-y*state.scale;transform();inspect();}
  function inspect(){const s=scene(state.selected);$('selectedTitle').textContent=s.title;$('selectedNote').textContent=notes[s.id]||s.note||'Captura de la app en un navegador aislado con datos ficticios.';$('selectedMeta').innerHTML='<span class="tag">400 × 880</span><span class="tag">'+escape(status(s))+'</span><span class="tag">Base '+escape((s.commit||data.referenceCommit).slice(0,7))+'</span>';
    $('destinations').innerHTML=data.edges.filter(e=>e.from===s.id).map(e=>'<button data-target="'+e.to+'">'+escape(e.label)+' →<small>'+escape(scene(e.to).title)+'</small></button>').join('')||'<p>Fin de este recorrido documentado.</p>';
    const incoming=data.edges.filter(e=>e.to===s.id&&e.view!=='return');if(incoming.length)$('destinations').innerHTML+='<h3>Se abre desde</h3>'+incoming.map(e=>'<button data-target="'+e.from+'">← '+escape(scene(e.from).title)+'<small>'+escape(e.label)+'</small></button>').join('');
    $('destinations').querySelectorAll('[data-target]').forEach(el=>el.onclick=()=>focusScene(el.dataset.target));$('technical').innerHTML='<b>Ruta reproducida</b><p><code>'+escape(s.route.map(x=>typeof x==='string'?x:x.scroll?'Deslizar: '+x.scroll:x.hold?'Pulsación larga: '+x.hold:x.file?'Elegir archivo ficticio: '+x.name:x.fill?'Rellenar: '+x.fill:x.click).join(' → ')||'Abrir Inicio')+'</code></p><br><b>Fuentes directas</b><p>'+s.sources.map(escape).join('<br>')+'</p>';
    document.querySelectorAll('[data-scene]').forEach(el=>el.classList.toggle('selected',el.dataset.scene===s.id));drawEdges();
  }
  function enlarge(s){$('dialogTitle').textContent=s.title;const width=Math.min(400,window.innerWidth*.8);$('dialogScreen').innerHTML='<img src="'+s.image+'" alt="'+escape(s.title)+'">'+hotspots(s,width/data.viewport.width);bindScreens($('dialogScreen'));$('screenDialog').showModal();}
  function renderComparison(){
    $('compareChoices').innerHTML=data.scenes.filter(s=>s.image&&(!$('compareGroup').value||s.group===$('compareGroup').value)).map(s=>'<label><input type="checkbox" value="'+s.id+'" '+(state.compare.includes(s.id)?'checked':'')+'> '+escape(s.title)+'</label>').join('');
    $('compareChoices').querySelectorAll('input').forEach(input=>{input.disabled=!input.checked&&state.compare.length>=3;input.onchange=()=>{state.compare=input.checked?[...state.compare,input.value]:state.compare.filter(x=>x!==input.value);renderComparison();};});
    $('compareGrid').innerHTML=state.compare.map(id=>{const s=scene(id);return '<figure><figcaption>'+escape(s.title)+'</figcaption><img src="'+s.image+'" alt="'+escape(s.title)+'"></figure>';}).join('');
  }
  function renderInventory(){
    const q=$('inventorySearch').value.toLocaleLowerCase('es'),group=$('inventoryGroup').value;
    const list=data.inventory.filter(x=>(!group||x.group===group)&&(!q||(x.title+' '+x.group).toLocaleLowerCase('es').includes(q)));
    $('inventoryCount').textContent=data.scenes.filter(s=>s.image).length+' capturas · '+data.inventory.length+' entradas · '+data.inventory.filter(x=>x.status==='Pendiente de captura').length+' pendientes';
    $('inventoryTable').innerHTML='<table><thead><tr><th>Sección</th><th>Pantalla o estado</th><th>Cobertura</th></tr></thead><tbody>'+list.map(x=>'<tr><td>'+escape(x.group)+'</td><td>'+escape(x.title)+(x.note?'<p>'+escape(x.note)+'</p>':'')+'</td><td>'+(x.scene?'<button data-inventory-scene="'+x.scene+'">Ver captura · sin revisar</button>':escape(x.status))+'</td></tr>').join('')+'</tbody></table>';
    $('inventoryTable').querySelectorAll('[data-inventory-scene]').forEach(b=>b.onclick=()=>focusScene(b.dataset.inventoryScene));
  }
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>activate(b.dataset.view));$('fit').onclick=fit;$('zoomIn').onclick=()=>zoom(1.25);$('zoomOut').onclick=()=>zoom(.8);$('returns').onchange=e=>{state.returns=e.target.checked;renderMap();fit();};
  const canvas=$('canvas');let drag;
  canvas.onpointerdown=e=>{if(e.target.closest('button,img'))return;drag={x:e.clientX,y:e.clientY,sx:state.x,sy:state.y};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');};canvas.onpointermove=e=>{if(drag){state.x=drag.sx+e.clientX-drag.x;state.y=drag.sy+e.clientY-drag.y;transform();}};canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;canvas.classList.remove('dragging');};canvas.onkeydown=e=>{if(e.target!==canvas)return;if(e.key==='+'||e.key==='=')zoom(1.25);if(e.key==='-')zoom(.8);if(e.key==='0')fit();};
  $('inventorySearch').oninput=renderInventory;$('inventoryGroup').onchange=renderInventory;
  [...new Set(data.inventory.map(x=>x.group))].forEach(g=>{const option=document.createElement('option');option.value=g;option.textContent=g;$('inventoryGroup').append(option);});$('censusCount').textContent='Censo técnico · '+data.openers.length+' funciones de apertura';$('census').innerHTML=data.openers.map(x=>'<p><code>'+escape(x.symbol)+'</code><br>'+escape(x.file)+':'+x.line+'</p>').join('');
  $('export').onclick=async()=>{
    const list=visible(),{width,height}=dimensions(),parts=[];
    for(const s of list){const [x,y]=position(s),blob=await(await fetch(s.image)).blob(),uri=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(blob);});parts.push(`<text x="${x}" y="${y+25}" fill="#24352f" font-size="15">${escape(s.title)}</text><image x="${x}" y="${y+TOP}" width="${W}" height="${H}" href="${uri}"/>`+(notes[s.id]?`<text x="${x}" y="${y+TOP+H+22}" fill="#976315" font-size="12">Revisar · ${window.VISUAL_MAP_PRIORITIES[s.id]}</text>`:''));}
    const paths=$('connections').innerHTML,svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="system-ui,sans-serif"><rect width="100%" height="100%" fill="#f6f5f0"/><text x="40" y="30" font-size="16" fill="#24352f">Gestify · ${escape($('viewTitle').textContent)} · datos ficticios</text>${parts.join('')}${paths}<text x="40" y="${height-14}" font-size="12" fill="#68776e">Base ${data.referenceCommit.slice(0,7)} · escenas del 21/08/2026 · Claro · Profesional · Pendiente de revisión de Ángel</text></svg>`,url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),a=document.createElement('a');a.href=url;a.download='gestify-mapa-'+state.view+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  $('areaSelect').onchange=e=>{if(e.target.value)activate(e.target.value);};$('compareGroup').onchange=renderComparison;$('focusEdges').onchange=drawEdges;
  window.addEventListener('resize',()=>{if(maps.has(state.view))fit();});activate('general');
})();

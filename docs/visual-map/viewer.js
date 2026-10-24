'use strict';
(() => {
  const data=window.VISUAL_MAP,$=id=>document.getElementById(id),W=220,S=W/data.viewport.width,H=data.viewport.height*S,TOP=46;
  const state={view:'general',selected:'home',scale:.5,x:0,y:0,returns:false,compare:['household','study','economics']};
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const status=s=>!s.image?'Pendiente':s.fresh?s.review:'Actualizar captura';
  const scene=id=>data.scenes.find(s=>s.id===id),visible=()=>data.scenes.filter(s=>state.view==='general'?s.layout:s.flow);
  const position=s=>state.view==='general'?s.layout:s.flow;
  const availableEdges=()=>data.edges.filter(e=>visible().some(s=>s.id===e.from)&&visible().some(s=>s.id===e.to)&&(e.view!=='return'||state.returns));
  $('edition').textContent='Base '+data.referenceCommit.slice(0,7)+' · móvil 400 × 880';$('scope').textContent=data.scope;
  function activate(view){
    state.view=view;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
    const map=view==='general'||view==='flow';$('workspace').hidden=!map;$('inspector').hidden=!map;$('comparison').hidden=view!=='compare';$('inventory').hidden=view!=='inventory';
    if(map){$('viewTitle').textContent=view==='general'?'Los accesos principales':'Del calendario a los selectores';$('viewSubtitle').textContent=view==='general'?'Inicio conecta con las cinco áreas principales y sus menús auxiliares.':'Un mismo formulario puede tener varios estados de scroll. Las flechas siguen controles reales.';if(!visible().some(s=>s.id===state.selected))state.selected=view==='general'?'home':'calendar';renderMap();fit();inspect();}
    if(view==='compare')renderComparison();if(view==='inventory')renderInventory();
  }
  function renderMap(){
    const list=visible();$('stage').style.width=(state.view==='general'?1950:1400)+'px';$('stage').style.height=(state.returns?1450:1300)+'px';
    $('nodes').innerHTML=list.map((s,i)=>{const [x,y]=position(s);return '<article class="screen-node'+(s.id===state.selected?' selected':'')+'" data-scene="'+s.id+'" style="left:'+x+'px;top:'+y+'px"><div class="node-head"><span class="node-index">'+String(i+1).padStart(2,'0')+'</span><strong>'+escape(s.title)+'</strong></div><div class="screen">'+(s.image?'<img src="'+s.image+'" alt="Captura real de '+escape(s.title)+'" data-enlarge="'+s.id+'" loading="eager">':'<p>Captura pendiente</p>')+hotspots(s,S)+'</div><div class="node-foot"><span>'+escape(s.group)+'</span><span class="review">'+escape(status(s))+'</span></div></article>';}).join('');
    bindScreens($('nodes'));drawEdges();
  }
  function hotspots(s,scale){return data.edges.filter(e=>e.from===s.id&&(e.view!=='return'||state.returns)).map(e=>{const b=s.anchors?.[e.to];if(!b)return '';return '<button class="hotspot'+(e.action==='scroll'?' scroll':'')+'" style="left:'+b.x*scale+'px;top:'+b.y*scale+'px;width:'+b.width*scale+'px;height:'+b.height*scale+'px" title="'+escape(e.label+' → '+scene(e.to).title)+'" aria-label="'+escape(e.label+' → '+scene(e.to).title)+'" data-target="'+e.to+'"></button>';}).join('');}
  function bindScreens(root){root.querySelectorAll('[data-enlarge]').forEach(el=>el.onclick=()=>{state.selected=el.dataset.enlarge;inspect();enlarge(scene(state.selected));});root.querySelectorAll('[data-target]').forEach(el=>el.onclick=e=>{e.stopPropagation();if($('screenDialog').open)$('screenDialog').close();focusScene(el.dataset.target);});root.querySelectorAll('[data-scene]').forEach(el=>el.addEventListener('click',()=>{state.selected=el.dataset.scene;inspect();}));}
  function drawEdges(){
    const ns='http://www.w3.org/2000/svg',svg=$('connections');svg.replaceChildren();svg.setAttribute('viewBox','0 0 '+(state.view==='general'?1950:1400)+' 1300');
    svg.setAttribute('viewBox','0 0 '+(state.view==='general'?1950:1400)+' '+(state.returns?1450:1300));
    const defs=document.createElementNS(ns,'defs');defs.innerHTML='<marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#476880"/></marker>';svg.append(defs);
    availableEdges().forEach((e,i)=>{
      const a=scene(e.from),b=scene(e.to),r=a.anchors?.[e.to];if(!r)return;const [ax,ay]=position(a),[bx,by]=position(b),x=ax+(r.x+r.width/2)*S,y=ay+TOP+(r.y+r.height/2)*S;
      let endX=bx,endY=by+TOP+H/2,d,labelX,labelY;
      if(state.view==='general'){
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
  function focusScene(id){const s=scene(id);if(!s)return;if((state.view==='general'&&!s.layout)||(state.view!=='general'&&!s.flow))activate(s.flow?'flow':'general');state.selected=id;const [x,y]=position(s),box=$('canvas').getBoundingClientRect();state.scale=Math.min(1.35,(box.height-55)/(TOP+H+30));state.x=(box.width-W*state.scale)/2-x*state.scale;state.y=20-y*state.scale;transform();inspect();}
  function inspect(){const s=scene(state.selected);$('selectedTitle').textContent=s.title;$('selectedNote').textContent=s.note||'Captura de la app en un navegador aislado con datos ficticios.';$('selectedMeta').innerHTML='<span class="tag">400 × 880</span><span class="tag">'+escape(status(s))+'</span><span class="tag">Base '+escape((s.commit||data.referenceCommit).slice(0,7))+'</span>';
    $('destinations').innerHTML=data.edges.filter(e=>e.from===s.id).map(e=>'<button data-target="'+e.to+'">'+escape(e.label)+' →<small>'+escape(scene(e.to).title)+'</small></button>').join('')||'<p>El piloto termina en esta pantalla.</p>';
    $('destinations').querySelectorAll('[data-target]').forEach(el=>el.onclick=()=>focusScene(el.dataset.target));$('technical').innerHTML='<b>Ruta reproducida</b><p><code>'+escape(s.route.map(x=>typeof x==='string'?x:'Scroll: '+x.scroll).join(' → ')||'Abrir Inicio')+'</code></p><br><b>Fuentes directas</b><p>'+s.sources.map(escape).join('<br>')+'</p>';
    document.querySelectorAll('[data-scene]').forEach(el=>el.classList.toggle('selected',el.dataset.scene===s.id));drawEdges();
  }
  function enlarge(s){$('dialogTitle').textContent=s.title;const width=Math.min(400,window.innerWidth*.8);$('dialogScreen').innerHTML='<img src="'+s.image+'" alt="'+escape(s.title)+'">'+hotspots(s,width/data.viewport.width);bindScreens($('dialogScreen'));$('screenDialog').showModal();}
  function renderComparison(){
    $('compareChoices').innerHTML=data.scenes.map(s=>'<label><input type="checkbox" value="'+s.id+'" '+(state.compare.includes(s.id)?'checked':'')+'> '+escape(s.title)+'</label>').join('');
    $('compareChoices').querySelectorAll('input').forEach(input=>{input.disabled=!input.checked&&state.compare.length>=3;input.onchange=()=>{state.compare=input.checked?[...state.compare,input.value]:state.compare.filter(x=>x!==input.value);renderComparison();};});
    $('compareGrid').innerHTML=state.compare.map(id=>{const s=scene(id);return '<figure><figcaption>'+escape(s.title)+'</figcaption><img src="'+s.image+'" alt="'+escape(s.title)+'"></figure>';}).join('');
  }
  function renderInventory(){
    const q=$('inventorySearch').value.toLocaleLowerCase('es'),group=$('inventoryGroup').value;
    const list=data.inventory.filter(x=>(!group||x.group===group)&&(!q||(x.title+' '+x.group).toLocaleLowerCase('es').includes(q)));
    $('inventoryCount').textContent=data.scenes.filter(s=>s.image).length+' capturas · '+data.inventory.length+' entradas · resto pendiente';
    $('inventoryTable').innerHTML='<table><thead><tr><th>Sección</th><th>Pantalla o estado</th><th>Cobertura</th></tr></thead><tbody>'+list.map(x=>'<tr><td>'+escape(x.group)+'</td><td>'+escape(x.title)+'</td><td>'+(x.scene?'<button data-inventory-scene="'+x.scene+'">Ver captura · sin revisar</button>':'Pendiente de captura')+'</td></tr>').join('')+'</tbody></table>';
    $('inventoryTable').querySelectorAll('[data-inventory-scene]').forEach(b=>b.onclick=()=>{const s=scene(b.dataset.inventoryScene);activate(s.layout?'general':'flow');focusScene(s.id);});
  }
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>activate(b.dataset.view));$('fit').onclick=fit;$('zoomIn').onclick=()=>zoom(1.25);$('zoomOut').onclick=()=>zoom(.8);$('returns').onchange=e=>{state.returns=e.target.checked;renderMap();fit();};
  const canvas=$('canvas');let drag;
  canvas.onpointerdown=e=>{if(e.target.closest('button,img'))return;drag={x:e.clientX,y:e.clientY,sx:state.x,sy:state.y};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');};canvas.onpointermove=e=>{if(drag){state.x=drag.sx+e.clientX-drag.x;state.y=drag.sy+e.clientY-drag.y;transform();}};canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;canvas.classList.remove('dragging');};canvas.onkeydown=e=>{if(e.target!==canvas)return;if(e.key==='+'||e.key==='=')zoom(1.25);if(e.key==='-')zoom(.8);if(e.key==='0')fit();};
  $('inventorySearch').oninput=renderInventory;$('inventoryGroup').onchange=renderInventory;
  [...new Set(data.inventory.map(x=>x.group))].forEach(g=>{const option=document.createElement('option');option.value=g;option.textContent=g;$('inventoryGroup').append(option);});$('censusCount').textContent='Censo técnico · '+data.openers.length+' funciones de apertura';$('census').innerHTML=data.openers.map(x=>'<p><code>'+escape(x.symbol)+'</code><br>'+escape(x.file)+':'+x.line+'</p>').join('');
  $('export').onclick=async()=>{
    const list=visible(),width=state.view==='general'?1950:1400,height=state.returns?1450:1300,parts=[];
    for(const s of list){const [x,y]=position(s),blob=await(await fetch(s.image)).blob(),uri=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(blob);});parts.push(`<text x="${x}" y="${y+25}" fill="#24352f" font-size="15">${escape(s.title)}</text><image x="${x}" y="${y+TOP}" width="${W}" height="${H}" href="${uri}"/>`);}
    const paths=$('connections').innerHTML,svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="system-ui,sans-serif"><rect width="100%" height="100%" fill="#f6f5f0"/><text x="40" y="30" font-size="16" fill="#24352f">Gestify · ${escape($('viewTitle').textContent)} · piloto · datos ficticios</text>${parts.join('')}${paths}<text x="40" y="${height-14}" font-size="12" fill="#68776e">Base ${data.referenceCommit.slice(0,7)} · escenas del 21/08/2026 · Claro · Profesional · Pendiente de revisión de Ángel</text></svg>`,url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),a=document.createElement('a');a.href=url;a.download='gestify-mapa-'+state.view+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  window.addEventListener('resize',()=>{if(state.view==='general'||state.view==='flow')fit();});activate('general');
})();

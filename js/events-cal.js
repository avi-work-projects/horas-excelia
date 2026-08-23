/* ============================================================
   EVENTS CAL - Los tres calendarios: 1 mes, anual y 4 meses.

   Anual y 4 meses pintan EXACTAMENTE la misma tarjeta de mes
   (_renderEvMonthCard); solo cambia el rango que le pasan. Duplicarla fue un
   error que ya cometimos: cada ajuste habia que hacerlo dos veces y una se
   olvidaba.

   Funciones puras: reciben el estado global y devuelven HTML, asi que se
   comparan con las instantaneas de tools/test.js.
   ============================================================ */

/* ── Render: calendario mensual ─────────────────────────── */
function renderEvCalMonth(){
  var today=new Date();today.setHours(0,0,0,0);
  var puenteMap={};
  if(typeof computePuentes==='function'){
    computePuentes(EV_YEAR).puentes.forEach(function(seq){
      seq.forEach(function(x){puenteMap[evDk(x.date)]=true;});
    });
  }
  // Multi-day events (non-repeating, end strictly after start OR viaje/asturias always as bar)
  var multiEvs=EVENTS.filter(function(ev){return !ev.repeat&&!(ev.dates&&ev.dates.length)&&ev.end&&isEvBarAlways(ev);});
  var multiIds={};multiEvs.forEach(function(ev){multiIds[ev.id]=true;});
  var DN7=['L','M','X','J','V','S','D'];
  /* Contenedor propio: evita el gap:16px de .sy-body entre semanas (así caben
     las 6 semanas de meses como agosto 2026) y acota el sticky de la cabecera */
  var h='<div class="ev-month-wrap">';
  h+='<div class="ev-week-hdr">';
  DN7.forEach(function(n){h+='<div>'+n+'</div>';});
  h+='</div>';
  var first=new Date(EV_YEAR,EV_MONTH,1);
  var last=new Date(EV_YEAR,EV_MONTH+1,0);
  var cur=new Date(first);
  var dow=cur.getDay();var off=dow===0?6:dow-1;
  cur.setDate(cur.getDate()-off);
  while(cur<=last){
    // Build week days array
    var wk=[];
    for(var wi=0;wi<7;wi++){wk.push(new Date(cur.getFullYear(),cur.getMonth(),cur.getDate()+wi));}
    var wStart=wk[0],wEnd=wk[6];
    // Find intersecting multi-day events
    var wMulti=[];
    multiEvs.forEach(function(ev){
      var es=new Date(ev.start+'T00:00:00'),ee=new Date(ev.end+'T00:00:00');
      if(ee<wStart||es>wEnd)return;
      var cs=Math.max(0,Math.round((es-wStart)/86400000));
      var ce=Math.min(6,Math.round((ee-wStart)/86400000));
      /* unDia: la duracion del EVENTO, que es lo que decide si puede compartir
         dia. El trozo puede ser de una columna por el corte de semana o mes. */
      wMulti.push({ev:ev,cs:cs,ce:ce,unDia:(ev.start===(ev.end||ev.start)),
        starts:es>=wStart,ends:ee<=wEnd,row:-1});
    });
    /* Reparto en filas por grosor — ver _evAssignRow */
    var rowOcc=_evRowOcc();
    wMulti.forEach(function(it){_evAssignRow(it,rowOcc);});
    _evMarcarMitades(wMulti);
    var activeRows=0;wMulti.forEach(function(it){if(it.row>=0)activeRows=Math.max(activeRows,it.row+1);});
    // Pre-compute which columns are in-month (for bar dimming)
    var inMCols=[];for(var ci=0;ci<7;ci++){inMCols.push(wk[ci].getMonth()===EV_MONTH);}
    h+='<div class="ev-week-outer">';
    h+='<div class="ev-week-grid">';
    var bspanStart=-1,bspans=[];
    for(var di=0;di<7;di++){
      var d=wk[di];
      var inM=d.getMonth()===EV_MONTH;
      var isTod=d.getTime()===today.getTime();
      var past=inM&&d<today;
      var ds=evDk(d);
      var evs=getEventsOn(ds);
      var edow=d.getDay();
      var dt=inM?dayT(d):'';
      var inPuente=inM&&puenteMap[ds];
      // Rastrear tramos de días puente para perímetro
      if(inPuente){if(bspanStart<0)bspanStart=di;}
      else{if(bspanStart>=0){bspans.push({s:bspanStart,e:di-1});bspanStart=-1;}}
      var cls='ev-cell'+(inM?'':' out-m')+(isTod?' today-ev':'')+(past?' past-cal-day':'')+(edow===0||edow===6?' weekend':'')+(dt&&dt!=='normal'?' ev-day-'+dt:'')+(inPuente?' ev-puente':'');
      h+='<div class="'+cls+'" data-ds="'+ds+'"><div class="ev-num">'+d.getDate()+'</div>';
      /* Reparto del dia en DOS COLUMNAS (v258):
           - derecha (a la altura del numero): hasta EV_CAL_CORNER_STACK
             marcadores de eventos puntuales; si sobran, el ultimo hueco pasa
             a ser el "+" que abre el carrusel del dia.
           - izquierda (empieza bajo el numero): primero los cumpleanos VIP
             (solapados, maximo EV_CAL_VIP_MAX) y debajo las sesiones de
             rutina con su icono. */
      var _corner=[],_vips=[],_ruts=[];
      evs.forEach(function(ev){
        if(multiIds[ev.id])return;
        if(ev.id.indexOf('ev-bday-vip-')===0){_vips.push(ev.id);return;}
        if(ev._rut){_ruts.push(ev);return;}
        _corner.push({vip:false,ev:ev});
      });
      _corner=evSortMarks(_corner,function(it){return it.ev;});
      var _pmkM=past?' past-marker':'';
      if(_corner.length){
        var _cut=_corner.length>EV_CAL_CORNER_STACK?EV_CAL_CORNER_STACK-1:_corner.length;
        /* Con la pila llena los marcadores se encogen un pelin: a 12 px con
           5 huecos el ultimo se salia de la casilla y se veia cortado. */
        h+='<div class="ev-otros-corner'+(_corner.length>=EV_CAL_CORNER_STACK?' llena':'')+'">';
        _corner.slice(0,_cut).forEach(function(it){
          h+=evMarkerHtml(it.ev,_pmkM,'ev-marker-lg',evDefaultShape(it.ev),ds);
        });
        if(_corner.length>EV_CAL_CORNER_STACK)
          h+='<span class="ev-day-more" data-ds="'+ds+'">'+evMorePlusHtml('ev-marker-lg')+'</span>';
        h+='</div>';
      }
      if(_vips.length||_ruts.length){
        h+='<div class="ev-day-left">';
        if(_vips.length){
          h+='<div class="ev-day-vips" data-ds="'+ds+'">';
          _vips.slice(0,EV_CAL_VIP_MAX).forEach(function(vid){
            h+=vipStarSvgHtml(vid,_pmkM,'ev-marker-lg');
          });
          h+='</div>';
        }
        if(_ruts.length){
          h+='<div class="ev-day-ruts">';
          _ruts.forEach(function(rev){h+=rutMarkerHtml(rev,_pmkM,ds);});
          h+='</div>';
        }
        h+='</div>';
      }
      h+='</div>';
    }
    if(bspanStart>=0)bspans.push({s:bspanStart,e:6});
    // Perímetro puente: sin borde donde el puente continúa en otra semana
    var nextMonP=new Date(wk[6]);nextMonP.setDate(nextMonP.getDate()+1);
    var prevSunP=new Date(wk[0]);prevSunP.setDate(prevSunP.getDate()-1);
    bspans.forEach(function(sp){
      var noR=sp.e===6&&puenteMap[evDk(nextMonP)];
      var noL=sp.s===0&&puenteMap[evDk(prevSunP)];
      var bsty='grid-column:'+(sp.s+1)+'/'+(sp.e+2)+';grid-row:1;';
      if(noL)bsty+='border-left:none;border-top-left-radius:0;border-bottom-left-radius:0;';
      if(noR)bsty+='border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;';
      h+='<div class="ev-puente-perimeter" style="'+bsty+'"></div>';
    });
    h+='</div>'; // ev-week-grid
    if(activeRows>0){
      h+='<div class="ev-bars-row">';
      wMulti.forEach(function(it){
        if(it.row<0)return;
        var ev=it.ev;
        var sc=it.starts&&it.ends?'':it.starts?' starts':it.ends?' ends':' continues';
        var showT=it.starts||(it.cs===0);
        // Dim bars that fall entirely in out-of-month columns
        var hasInM=false;for(var ci=it.cs;ci<=it.ce;ci++){if(inMCols[ci])hasInM=true;}
        var _dc=getEvDisplayColor(ev);
        var _pastBar=wk[it.ce]<today?' past-bar':'';
        h+='<div class="ev-multi-bar '+evBarSizeCls(ev)+sc+_pastBar+'" data-id="'+ev.id+'"'
          +' style="grid-column:'+(it.cs+1)+'/'+(it.ce+2)+';grid-row:'+(it.row+1)+';z-index:'+evBarZ(ev)+';border:1.5px solid '+_dc+';background:'+fakeTrans(_dc,0.65)+';color:#fff'+(hasInM?'':';opacity:.35')+_evMitadesStyle(it)+'">'
          +(showT?escHtml(ev.title):'')+'</div>';
      });
      h+='</div>';
    }
    h+='</div>'; // ev-week-outer
    cur.setDate(cur.getDate()+7);
  }
  h+='</div>'; // ev-month-wrap
  return h;
}

function _renderEvMonthCard(m,yr,o){
  var today=o.today;
  var h='<div class="ev-annual-month" data-month="'+m+'"'+(o.showYear?(' data-year="'+yr+'"'):'')+'>';
  h+='<div class="ev-annual-mname">'+EV_MNS[m]+(o.showYear?(' '+yr):'')+'</div>';
  h+='<div class="ev-annual-cal">';
  h+='<div class="ev-annual-hdr-row">';
  ['L','M','X','J','V','S','D'].forEach(function(d){h+='<div class="ev-annual-hdr">'+d+'</div>';});
  h+='</div>';
  var first=new Date(yr,m,1), last=new Date(yr,m+1,0);
  var cur=new Date(first);
  var dow=cur.getDay(); var off=dow===0?6:dow-1;
  cur.setDate(cur.getDate()-off);
  while(cur<=last){
    /* Semana de 7 dias */
    var wk=[];
    for(var wi=0;wi<7;wi++){
      wk.push(new Date(cur.getFullYear(),cur.getMonth(),cur.getDate()));
      cur.setDate(cur.getDate()+1);
    }
    var wStart=wk[0],wEnd=wk[6];
    /* Eventos barra que cruzan la semana, recortados a los dias de ESTE mes */
    var wMulti=[];
    o.multiEvs.forEach(function(ev){
      var es=new Date(ev.start+'T00:00:00'),ee=new Date(ev.end+'T00:00:00');
      if(ee<wStart||es>wEnd)return;
      var cs=Math.max(0,Math.round((es-wStart)/86400000));
      var ce=Math.min(6,Math.round((ee-wStart)/86400000));
      while(cs<=ce&&wk[cs]&&wk[cs].getMonth()!==m)cs++;
      while(ce>=cs&&wk[ce]&&wk[ce].getMonth()!==m)ce--;
      if(cs>ce)return;
      /* unDia: la duracion del EVENTO, que es lo que decide si puede compartir
         dia. El trozo puede ser de una columna por el corte de semana o mes. */
      wMulti.push({ev:ev,cs:cs,ce:ce,unDia:(ev.start===(ev.end||ev.start)),
        starts:es>=wStart,ends:ee<=wEnd,row:-1});
    });
    /* Reparto en filas (max 3) POR GROSOR: dos barras del mismo grosor que
       chocan van a filas distintas (se estrechan); dos de grosor distinto
       comparten fila y se superponen, con la mas fina encima (z-index). */
    var rowOcc=_evRowOcc();
    wMulti.forEach(function(it){_evAssignRow(it,rowOcc);});
    _evMarcarMitades(wMulti);
    h+='<div class="ev-annual-week-outer">';
    var abspanStart=-1,abspans=[];
    for(var di=0;di<7;di++){
      var d=wk[di];
      var inM=d.getMonth()===m;
      var ds=evDk(d);
      var evs=inM?getEventsOn(ds):[];
      var isT=inM&&d.getTime()===today.getTime();
      var isWknd=d.getDay()===0||d.getDay()===6;
      var dt=inM&&typeof dayT==='function'?dayT(d):'';
      var inPuente=inM&&o.puenteMap[ds];
      if(inPuente){if(abspanStart<0)abspanStart=di;}
      else{if(abspanStart>=0){abspans.push({s:abspanStart,e:di-1});abspanStart=-1;}}
      var puenteCls='';
      if(inPuente){puenteCls=EV_ANNUAL_VIEW==='puentes'?' ev-annual-puente':'';}
      else if(EV_ANNUAL_VIEW==='puentes'){
        if(inM&&o.sueltoFestMap[ds])puenteCls=' ev-annual-suelto-fest';
        else if(inM&&o.sueltoVacMap[ds])puenteCls=' ev-annual-suelto-vac';
      }
      var fiestasCls='';
      if(inM){
        if((EV_ANNUAL_VIEW==='fiestas'||EV_ANNUAL_VIEW==='festivos')&&dt==='festivo')fiestasCls=' ann-festivo';
        else if((EV_ANNUAL_VIEW==='fiestas'||EV_ANNUAL_VIEW==='vacaciones')&&dt==='vacaciones')fiestasCls=' ann-vac';
      }
      var past=inM&&d<today;
      /* Cumpleanos VIP: rayas amarillas sobre la casilla (sin estrella aqui) */
      var _vipDay=inM&&!o.vipHidden&&typeof BDAYS!=='undefined'&&Array.isArray(BDAYS)
        &&BDAYS.some(function(b){return b.vip&&b.day===d.getDate()&&b.month===d.getMonth()+1;});
      var cls='ev-annual-day'+(inM?'':' out-m')+(isT?' ann-today':'')+(past?' past-cal-day':'')
        +puenteCls+fiestasCls+(_vipDay?' ann-vip-bday':'');
      var bg='';
      if(inM){
        if(EV_ANNUAL_VIEW==='puentes'){
          if(dt==='festivo')         bg='rgba(255,107,107,.55)';
          else if(dt==='vacaciones') bg='rgba(255,179,71,.55)';
          else if(dt==='ausencia')   bg='rgba(192,132,252,.55)';
          else if(isWknd)            bg='rgba(160,160,200,.22)';
        } else if(isWknd)            bg='rgba(160,160,200,.22)';
      }
      var sty=bg?' style="background:'+bg+'"':'';
      var dsAttr=inM?' data-ds="'+ds+'"':'';
      /* Eventos puntuales: marcadores en rejilla 2x2 (z-index:3) */
      var marcadores='';
      if(inM){
        var single=evSortMarks(evs.filter(function(ev){
          return !o.multiIds[ev.id]&&o.visible(ev)&&ev.id.indexOf('ev-bday-vip-')!==0&&!ev._rut;
        }));
        if(single.length){
          var pmk=past?' past-marker':'';
          marcadores=evAnnualXsHtml(single.map(function(ev){
            return evMarkerHtml(ev,pmk,'',evDefaultShape(ev),ds);
          }));
        }
        /* Las sesiones de rutina no llevan silueta aqui: no cabria. Van como
           puntitos en fila arriba del dia, uno por sesion. */
        var _ruts=evs.filter(function(ev){return ev._rut&&o.visible(ev);});
        if(_ruts.length){
          /* El ancho de cada barrita: como mucho medio dia. Con una o con dos
             sale a mitad; a partir de tres se reparten el hueco entre todas. */
          var _rh='<div class="ev-ann-ruts" style="--rutn:'+Math.max(2,_ruts.length)+'">';
          _ruts.forEach(function(rev){
            _rh+='<span class="ev-ann-rut" style="background:'+(rev.color||'#888')+'"></span>';
          });
          marcadores=_rh+'</div>'+marcadores;
        }
      }
      h+='<div class="'+cls+'"'+sty+dsAttr+'>'+marcadores+'</div>';
    }
    if(abspanStart>=0)abspans.push({s:abspanStart,e:6});
    /* Barras (z-index:2) */
    var activeRows=0;wMulti.forEach(function(it){if(it.row>=0)activeRows=Math.max(activeRows,it.row+1);});
    if(activeRows>0){
      var rowsCls=activeRows>=3?' ev-bars-3rows':activeRows===2?' ev-bars-2rows':'';
      h+='<div class="ev-annual-bars-row'+rowsCls+'">';
      wMulti.forEach(function(it){
        if(it.row<0)return;
        var sc=it.starts&&it.ends?'':it.starts?' a-starts':it.ends?' a-ends':' a-mid';
        var dc=getEvDisplayColor(it.ev);
        var pastBar=wk[it.ce]<today?' past-bar':'';
        var extra=o.barTitles?';font-size:.3rem;padding:0 3px':'';
        var txt=(o.barTitles&&(it.starts||it.cs===0))?escHtml(it.ev.title):'';
        h+='<div class="ev-annual-mbar '+evBarSizeCls(it.ev)+sc+pastBar+'" data-id="'+it.ev.id+'"'
          +' style="grid-column:'+(it.cs+1)+'/'+(it.ce+2)+';grid-row:'+(it.row+1)
          +';z-index:'+evBarZ(it.ev)
          +';border:1px solid '+dc+';background:'+fakeTrans(dc,0.65)+extra+_evMitadesStyle(it)+'">'+txt+'</div>';
      });
      h+='</div>';
    }
    /* Perimetro de los dias puente (bordes abiertos si el puente continua) */
    if(abspans.length&&EV_ANNUAL_VIEW==='puentes'){
      var nextMon=new Date(wk[6]);nextMon.setDate(nextMon.getDate()+1);
      var prevSun=new Date(wk[0]);prevSun.setDate(prevSun.getDate()-1);
      var nextDs=evDk(nextMon),prevDs=evDk(prevSun);
      abspans.forEach(function(sp){
        var right=wk[sp.e+1],left=wk[sp.s-1];
        var noR=(sp.e===6&&o.puenteMap[nextDs])||(right&&o.puenteMap[evDk(right)]);
        var noL=(sp.s===0&&o.puenteMap[prevDs])||(left&&o.puenteMap[evDk(left)]);
        var bsty='grid-column:'+(sp.s+1)+'/'+(sp.e+2)+';grid-row:1;';
        if(noL)bsty+='border-left:none;border-top-left-radius:0;border-bottom-left-radius:0;';
        if(noR)bsty+='border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;';
        h+='<div class="ev-annual-puente-perimeter" style="'+bsty+'"></div>';
      });
    }
    h+='</div>'; /* ev-annual-week-outer */
  }
  h+='</div></div>'; /* ev-annual-cal + ev-annual-month */
  return h;
}

/* ── Render: calendario anual (12 tarjetas del mismo ano) ─────── */
function renderEvAnnual(){
  var o=_evAnnualCtx();
  _evLoadPuentes(o,EV_YEAR);
  var h='<div class="ev-annual-grid'+(EV_EDIT_MODE?' ev-edit-mode':'')+'">';
  for(var m=0;m<12;m++)h+=_renderEvMonthCard(m,EV_YEAR,o);
  return h+'</div>';
}

/* ── Render: calendario 4 meses (puede cruzar de ano) ──────── */
function renderEvQuad(){
  var months=[];
  for(var mi=0;mi<4;mi++){
    var tm=EV_QUAD_MONTH+mi;
    months.push({m:tm%12,y:EV_QUAD_YEAR+Math.floor(tm/12)});
  }
  var rangeStart=new Date(months[0].y,months[0].m,1);
  var rangeEnd=new Date(months[3].y,months[3].m+1,0);
  var o=_evAnnualCtx(function(ev){
    var es=new Date(ev.start+'T00:00:00'),ee=new Date(ev.end+'T00:00:00');
    return ee>=rangeStart&&es<=rangeEnd;
  });
  o.showYear=true;      /* "Ago 2026" en la cabecera de cada tarjeta */
  o.barTitles=true;     /* las barras caben con titulo a este tamano */
  months.forEach(function(mo){_evLoadPuentes(o,mo.y);});
  var h='<div class="ev-annual-grid ev-quad-grid'+(EV_EDIT_MODE?' ev-edit-mode':'')+'">';
  months.forEach(function(mo){h+=_renderEvMonthCard(mo.m,mo.y,o);});
  return h+'</div>';
}

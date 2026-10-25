/* Presentación compartida de estadísticas; no calcula ni guarda datos. */
function renderStatsCard(title,content,note,classes){
  return '<section class="stats-section'+(classes?' '+classes:'')+'"><header class="stats-head"><h3>'+escHtml(title)+'</h3></header>'+content+(note?'<p class="stats-note">'+escHtml(note)+'</p>':'')+'</section>';
}
function renderStatsMetrics(items,columns){
  return '<div class="stats-metrics'+(columns===3?' stats-metrics-three':'')+'">'+items.map(function(item){return '<div class="stats-metric"><strong>'+escHtml(String(item[0]))+'</strong> <span>'+escHtml(item[1])+'</span></div>';}).join('')+'</div>';
}

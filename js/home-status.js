/* Home-only presentation. Actions keep their domain handlers and confirmations. */
function homeStatusIcon(name){
  var paths={
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    invoice:'<path d="M5 2h10l5 5v15H5Z M15 2v5h5 M8 10h7 M8 13h5 M8 17h10m-3-3 3 3-3 3"/>',
    agenda:'<path d="M12 16V2h8l4 4v13h-7 M20 2v5h4 M15 10h6 M15 13h4"/><rect x="1" y="13" width="17" height="11" rx="1.5" fill="var(--surface)"/><path d="m1 14 8.5 6 8.5-6"/>',
    sync:'<path d="M20 8a8.5 8.5 0 0 0-14-3L3 8m0-5v5h5 M4 16a8.5 8.5 0 0 0 14 3l3-3m0 5v-5h-5"/>',
    schedule:'<path d="M20 10V4H2v14h9 M2 5l9 7 9-7"/><circle cx="17" cy="17" r="5"/><path d="M17 14v3l2 1"/>',
    'edit-mail':'<path d="M19 16v6H2V8h13 M2 9l8.5 6L14 12"/><path d="m13 10 8-8 3 3-8 8-4 1Z M19 4l3 3" fill="var(--surface)"/>',
    'edit-invoice':'<path d="M19 16v7H3V2h10l6 6 M13 2v6h6 M7 12h4 M7 16h2 M7 20h7"/><path d="m13 10 8-8 3 3-8 8-4 1Z M19 4l3 3" fill="var(--surface)"/>',
    warning:'<path d="M12 3 2 21h20Z M12 9v5 M12 17v.1"/>'
  };
  return '<svg class="home-status-svg" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.warning)+'</svg>';
}
function homeActionLabel(icon,first,second){return homeStatusIcon(icon)+'<span>'+escHtml(first)+(second?'<br>'+escHtml(second):'')+'</span>';}
function homePanelAction(icon,first,second,attributes){return '<button type="button" class="home-panel-action" aria-label="'+escHtml(first+' '+second)+'" '+attributes+'>'+homeActionLabel(icon,first,second)+'</button>';}

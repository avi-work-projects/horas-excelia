// Anotaciones derivadas del informe: una sola fuente editorial para mapa y revisión.
window.VISUAL_MAP_NOTES={};window.VISUAL_MAP_PRIORITIES={};
for(const finding of window.VISUAL_REVIEW.findings){
  if(finding.status==='resolved')continue;
  for(const id of finding.scenes){
    const previous=window.VISUAL_MAP_NOTES[id];
    window.VISUAL_MAP_NOTES[id]=(previous?previous+'\n\n':'')+finding.priority+' · '+finding.id+': '+finding.problem;
    const priority=window.VISUAL_MAP_PRIORITIES[id];
    if(!priority||finding.priority<priority)window.VISUAL_MAP_PRIORITIES[id]=finding.priority;
  }
}

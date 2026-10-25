const {test,expect}=require('@playwright/test');
test('Swipe y vista previa conservan orden, límites, fechas, filtros y estado al previsualizar',async({page})=>{
 test.setTimeout(90000);
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');await page.locator('#eventsBtn').click();
 const results=await page.evaluate(()=>{
  const scenarios=[{view:'upcoming',tabs:['upcoming','week','months','stats'],fn:_evSwipeUpcoming},{view:'bodas',tabs:['clases','parejas','calendario','stats','config'],fn:_evSwipeBodas},{view:'rutinas',tabs:['lista','stats'],fn:_evSwipeRutinas}];
  const current=()=>EV_VIEW==='bodas'?BODA_SUBTAB:EV_VIEW==='rutinas'?RUT_SUBTAB:EV_VIEW;
  const state=()=>JSON.stringify({view:EV_VIEW,year:EV_YEAR,month:EV_MONTH,edit:EV_EDIT_MODE,boda:BODA_SUBTAB,rut:RUT_SUBTAB,filter:BODA_PAREJAS_FILTER,classes:BODA_PAREJAS_CLASSES,sort:BODA_PAREJAS_SORT,pending:BODA_PENDING,views:EV_VIEW_STATE,storage:Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])});
  const results=[];
  for(const scenario of scenarios)for(const [index,tab]of scenario.tabs.entries())for(const step of [-1,1]){
   EV_VIEW=scenario.view==='upcoming'?tab:scenario.view;BODA_SUBTAB=scenario.view==='bodas'?tab:'clases';RUT_SUBTAB=scenario.view==='rutinas'?tab:'lista';
   EV_YEAR=2026;EV_MONTH=7;EV_VIEW_STATE={week:{year:2027,month:2}};EV_EDIT_MODE=false;BODA_PAREJAS_FILTER='todas';BODA_PAREJAS_CLASSES=3;BODA_PAREJAS_SORT='nombre';refreshEvents(false);
   const before=state(),preview=swipeEventsPreview(step),intact=state()===before,handled=scenario.fn(step),expected=scenario.tabs[index+step]||null;
   results.push({tab,step,expected,actual:current(),intact,handled,hasPreview:preview!==null,matches:preview===null||preview===swipeFrame('eventsOverlay',renderEvContent(),'full-overlay'),year:EV_YEAR,month:EV_MONTH,filter:BODA_PAREJAS_FILTER,classes:BODA_PAREJAS_CLASSES,sort:BODA_PAREJAS_SORT});
  }
  for(const step of [-1,1]){EV_VIEW='birthdays';EV_YEAR=2026;EV_MONTH=7;EV_VIEW_STATE={};refreshEvents(false);const before=state(),preview=swipeEventsPreview(step),intact=state()===before;_evSwipeUpcoming(step);results.push({tab:'birthdays',step,expected:step===1?'week':null,actual:EV_VIEW,intact,handled:true,hasPreview:preview!==null,matches:preview===null||preview===swipeFrame('eventsOverlay',renderEvContent(),'full-overlay')});}
  return results;
 });
 for(const result of results){expect(result.intact,JSON.stringify(result)).toBe(true);expect(result.handled).toBe(true);expect(result.hasPreview).toBe(result.expected!==null);expect(result.actual).toBe(result.expected||result.tab);expect(result.matches,JSON.stringify(result)).toBe(true);
  if(result.expected==='week'&&result.tab!=='birthdays'){expect(result.year).toBe(2027);expect(result.month).toBe(2);}
  if(result.expected==='parejas'){expect(result.filter).toBe('activas');expect(result.classes).toBeNull();expect(result.sort).toBe('boda');}
 }
});

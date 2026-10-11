const {exportFile}=require('./export-helper');
const {test,expect}=require('@playwright/test');
// Usa el navegador completo para probar handles de carpetas reales al recargar,
// también en Linux; sigue ejecutándose sin ventanas visibles.
test.use({viewport:{width:400,height:880},isMobile:true,hasTouch:true,channel:process.platform==='win32'?'msedge':'chromium'});
async function prepareExports(page){
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');
  localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Persona de prueba',day:11,month:10}]));
  window.sharedFiles=[];
  Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
  Object.defineProperty(navigator,'share',{configurable:true,value:async({files})=>{for(const f of files)sharedFiles.push({name:f.name,type:f.type,text:await f.text()});}});
 });
 await page.goto('/');
}
test.beforeEach(async({page})=>prepareExports(page));
test('CSV, PDF, backup, cumpleaños, energía y calendario comparten archivos con fecha',async({page})=>{
 await exportFile(page,'#csvExportBtn','share');await expect.poll(()=>page.evaluate(()=>sharedFiles.length)).toBe(1);
 await exportFile(page,'#pdfExportBtn','share');await expect.poll(()=>page.evaluate(()=>sharedFiles.length)).toBe(2);
 await page.locator('#menuBtn').click();await exportFile(page,'#exportAllBtn','share');await expect.poll(()=>page.evaluate(()=>sharedFiles.length)).toBe(3);
 await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();await exportFile(page,'#bdExport','share');await expect.poll(()=>page.evaluate(()=>sharedFiles.length)).toBe(4);
 await page.evaluate(()=>{ENERGY_ANALYSIS_TAB='archivo';openEnergyAnalysis('luz');});
 await exportFile(page,'#energyStudyExport','share');await expect.poll(()=>page.evaluate(()=>sharedFiles.length)).toBe(5);
 await page.evaluate(()=>{closeEnergyAnalysis();EVENTS=[{id:'demo',kind:'puntual',type:'Otros',title:'Evento de prueba',start:'2026-10-11',end:'2026-10-11',color:'#888888'}];openEvCalendarExport();});
 await page.locator('#evIcsReset').click();await page.locator('#evIcsAll').click();await page.locator('#evIcsNext').click();await exportFile(page,'#evIcsDownload','share');await expect.poll(()=>page.evaluate(()=>sharedFiles.length)).toBe(6);
 const files=await page.evaluate(()=>sharedFiles);
 for(const f of files)expect(f.name).toMatch(/_\d{8}_\d{6}_\d{3}(?:_\d+)?\.(csv|pdf|json|ics)$/);
 expect(files[0].text).toContain('Fecha');expect(files[1].text).toContain('%PDF');
 expect(JSON.parse(files[2].text).birthdays).toBeDefined();expect(JSON.parse(files[3].text)[0].name).toBe('Persona de prueba');
 expect(files[5].text).toContain('BEGIN:VCALENDAR');
});
test('carpeta elegida guarda la misma copia sin impedir compartir',async({page},testInfo)=>{
 await page.evaluate(async()=>{
  await EXPORT_DIRECTORY_READY;window.copies=[];window.storedDirectory=null;
  window.demoDirectory={name:'Gestify',queryPermission:async()=> 'granted',getFileHandle:async name=>({createWritable:async()=>({write:async blob=>copies.push({name,text:await blob.text()}),close:async()=>{}})})};
  window.showDirectoryPicker=async()=>demoDirectory;
  exportDirectoryStore=async(mode,value)=>{if(mode==='set')storedDirectory=value;return storedDirectory;};
 });
 await page.locator('#menuBtn').click();await page.locator('#exportFolderBtn').click();
 await page.locator('#exportFolderChoose').click();await expect(page.locator('#exportFolderStatus')).toHaveText('Carpeta: Gestify');
 await page.screenshot({path:testInfo.outputPath('carpeta.png')});await page.locator('#exportFolderClose').click();
 await exportFile(page,'#csvExportBtn','both');
 await expect.poll(()=>page.evaluate(()=>copies.length)).toBe(1);await expect.poll(()=>page.evaluate(()=>sharedFiles.length)).toBe(1);
 expect(await page.evaluate(()=>copies[0])).toEqual(await page.evaluate(()=>({name:sharedFiles[0].name,text:sharedFiles[0].text})));
 await page.evaluate(()=>{EXPORT_DIRECTORY=null;initExportDirectory();});await expect.poll(()=>page.evaluate(()=>EXPORT_DIRECTORY?.name)).toBe('Gestify');
 await page.locator('#menuBtn').click();await page.locator('#exportFolderBtn').click();await page.locator('#exportFolderLabel').fill('Downloads / Gestify');await page.locator('#exportFolderSave').click();
 await expect(page.locator('#exportFolderStatus')).toHaveText('Carpeta: Downloads / Gestify');expect(await page.evaluate(()=>storedDirectory.label)).toBe('Downloads / Gestify');await page.screenshot({path:testInfo.outputPath('ubicacion.png')});
});
test('sin compartir descarga; permiso revocado no pierde el archivo',async({page})=>{
 await page.evaluate(async()=>{await EXPORT_DIRECTORY_READY;EXPORT_DIRECTORY={name:'Sin permiso',queryPermission:async()=> 'denied'};Object.defineProperty(navigator,'canShare',{value:()=>false});});
 const pending=page.waitForEvent('download');await exportFile(page,'#csvExportBtn','both');const file=await pending;
 expect(file.suggestedFilename()).toMatch(/dias_trabajados_\d{4}_\d{8}_\d{6}_\d{3}\.csv/);
 expect(await page.evaluate(()=>sharedFiles.length)).toBe(0);
});
test('la carpeta se recuerda localmente y los nombres no se repiten',async({playwright},testInfo)=>{
 // La carpeta pertenece a un perfil de navegador: probar persistencia fuera del
 // contexto de incógnito de Playwright, con un perfil aislado y datos inventados.
 const context=await playwright.chromium.launchPersistentContext(testInfo.outputPath('profile'),{headless:true,channel:process.platform==='win32'?'msedge':'chromium',viewport:{width:400,height:880}});
 const page=await context.newPage();
 try{
 await prepareExports(page);
 await page.evaluate(async()=>{
  await EXPORT_DIRECTORY_READY;
  const root=await navigator.storage.getDirectory(),dir=await root.getDirectoryHandle('Gestify-prueba',{create:true});
  await exportDirectoryStore('set',{handle:dir,label:'Downloads / Gestify-prueba'});
 });
 await page.reload();expect(await page.evaluate(async()=>{await EXPORT_DIRECTORY_READY;return [EXPORT_DIRECTORY?.name,EXPORT_DIRECTORY_LABEL];})).toEqual(['Gestify-prueba','Downloads / Gestify-prueba']);
 await page.evaluate(async()=>{await exportDirectoryStore('set',null);EXPORT_DIRECTORY=null;});
 await page.clock.setFixedTime(new Date(2026,9,11,12,30));
 await exportFile(page,'#csvExportBtn','both');await exportFile(page,'#csvExportBtn','both');
 await expect.poll(()=>page.evaluate(()=>sharedFiles.length)).toBe(2);
 expect(await page.evaluate(()=>new Set(sharedFiles.map(f=>f.name)).size)).toBe(2);
 }finally{await context.close();}
});
test('cancelar compartir no descarga y un fallo de copia no impide compartir',async({page})=>{
 let downloads=0;page.on('download',()=>downloads++);
 await page.evaluate(async()=>{await EXPORT_DIRECTORY_READY;Object.defineProperty(navigator,'share',{value:()=>Promise.reject(new DOMException('Cancelado','AbortError'))});});
 await exportFile(page,'#csvExportBtn','share');await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,100)));
 expect(downloads).toBe(0);
 await page.evaluate(()=>{
  EXPORT_DIRECTORY={name:'Carpeta de prueba',queryPermission:async()=> 'granted',getFileHandle:async()=>{throw Error('Disco no disponible');}};
  Object.defineProperty(navigator,'share',{value:async({files})=>{sharedFiles.push({name:files[0].name});}});
 });
 await exportFile(page,'#csvExportBtn','both');await expect.poll(()=>page.evaluate(()=>sharedFiles.length)).toBe(1);
 await expect(page.locator('#toast')).toContainText('No se pudo guardar la copia');expect(downloads).toBe(1);
});

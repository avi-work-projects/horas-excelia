const {test,expect}=require('@playwright/test');

test('energía: revisar, cancelar, fusionar y deshacer una importación',async({page})=>{
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
  await page.goto('/');
  const bill={id:'energy-ui-test',kind:'luz',supplier:'Compañía de prueba',number:'E1',issued:'2026-01-31',start:'2026-01-01',end:'2026-01-31',consumption:100,net:50,gross:60.5,paid:null,notes:'',source:''};
  await page.evaluate(b=>{energyImportHistory({energyBills:[b]});ENERGY_ANALYSIS_YEAR=2026;openEnergyAnalysis('luz');},bill);
  const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-energy-bills-v1'))[0].gross);
  const file={name:'prueba-energia.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({energyBills:[{...bill,gross:72.6}]}))};
  await page.locator('#energyStudyFile').setInputFiles(file);
  await expect(page.locator('.imp-preview')).toContainText('0 nuevos · 1 actualizados');
  await expect(page.locator('.imp-mode-btn.repl')).toHaveCount(0);
  expect(await read()).toBe(60.5);
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  await expect(page.locator('.imp-mode-ov')).toHaveCount(0);expect(await read()).toBe(60.5);
  await page.locator('#energyStudyFile').setInputFiles(file);
  await page.locator('.imp-mode-btn.merge').click();
  await expect.poll(read).toBe(72.6);
  await page.locator('.toast.show #toastUndoBtn').click();
  await expect.poll(read).toBe(60.5);
});

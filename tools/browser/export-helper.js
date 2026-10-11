const {expect}=require('@playwright/test');
async function exportFile(page,selector,mode='save'){
 if(selector==='#csvExportBtn'||selector==='#pdfExportBtn'){
  if(!await page.locator('#hoursCsv').isVisible())await page.locator('#hoursExportBtn').click();
  await page.locator(selector==='#csvExportBtn'?'#hoursCsv':'#hoursPdf').click();
 }else await page.locator(selector).click();
 await page.locator('[data-export-mode="'+mode+'"]').click();
 await expect(page.locator('#exportChoiceWrap')).toHaveCount(0);
 if((selector==='#csvExportBtn'||selector==='#pdfExportBtn')&&await page.locator('#hoursCsv').isVisible()){
  await page.locator('#invoiceBack').click();await expect(page.locator('#invoiceWrap')).toHaveCount(0);
 }
}
module.exports={exportFile};

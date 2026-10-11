const {expect}=require('@playwright/test');
async function exportFile(page,selector,mode='save'){
 await page.locator(selector).click();
 await page.locator('[data-export-mode="'+mode+'"]').click();
 await expect(page.locator('#exportChoiceWrap')).toHaveCount(0);
}
module.exports={exportFile};

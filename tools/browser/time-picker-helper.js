const {expect}=require('@playwright/test');
async function chooseTime(page,selector,time){
  await expect(page.locator('#timePickerWrap')).toHaveCount(0);
  await page.locator(selector).click();
  await expect(page.locator('#timePickerSave')).toBeEnabled();
  const [h,m]=time.split(':').map(Number);
  // Scroll the real wheels, then let scroll snapping settle before saving.
  await page.locator('#timePickerHours').evaluate((el,v)=>{el.scrollTop=(24+v)*44;},h);
  await page.locator('#timePickerMinutes').evaluate((el,v)=>{el.scrollTop=(60+v)*44;},m);
  await expect(page.locator('#timePickerHours')).toHaveAttribute('aria-valuenow',String(h));
  await expect(page.locator('#timePickerMinutes')).toHaveAttribute('aria-valuenow',String(m));
  await page.locator('#timePickerSave').click();
  await expect(page.locator(selector)).toHaveValue(time);
  await expect(page.locator('#timePickerWrap')).toHaveCount(0);
}
module.exports={chooseTime};

const {test,expect}=require('@playwright/test');
const base='https://auth-review.test.ts.net/';
test('MFA se avisa sin consultar el buzón y se retira tras recuperar acceso',async({page,context})=>{
  let phase='mfa',reads=0,health=0;
  await page.clock.setFixedTime(new Date('2026-10-29T10:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:'https://auth-review.test.ts.net/facturas/'},months:{}}));});
  await context.route(base+'**',async route=>{
    const url=new URL(route.request().url());let data;
    if(url.pathname==='/horas/auth-status'){health++;data={phase,checkedAt:'2026-10-29T09:00:00Z'};}
    else if(url.pathname==='/horas/status'){reads++;data=await page.evaluate(()=>({phase:'done',result:{periods:[8,9,10].map(month=>{const period=mkey(2026,month);return {period,verified:true,checkedAt:new Date().toISOString(),rows:hoursScopeKeys(period).map(key=>({key,state:'sent'}))};})}}));}
    else if(url.pathname.endsWith('gestify-status'))data={period:url.searchParams.get('period'),state:'sent',generated:true,issued:true,scheduled:false,sent:true,scheduledDate:null};
    else return route.abort();
    return route.fulfill({json:data,headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
  });
  await page.goto('/');await expect(page.locator('.hours-auth-alert')).toContainText('Microsoft pide MFA');
  await expect(page.locator('.home-submission')).toContainText('Correos al día');expect(reads).toBe(1);
  phase='ready';await page.getByRole('button',{name:'Comprobar acceso'}).click();
  await expect(page.locator('.hours-auth-alert')).toHaveCount(0);expect(reads).toBe(1);expect(health).toBeGreaterThanOrEqual(2);
});

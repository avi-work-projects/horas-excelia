const {test,expect}=require('@playwright/test');
const base='https://auth-review.test.ts.net/';
test('MFA se avisa sin consultar el buzón y se retira tras recuperar acceso',async({page,context},info)=>{
  await page.setViewportSize({width:393,height:840});
  await page.addInitScript(()=>{localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  let phase='mfa',reads=0,health=0,checks=0;
  await page.clock.setFixedTime(new Date('2026-10-29T10:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:'https://auth-review.test.ts.net/facturas/'},months:{}}));});
  await context.route(base+'**',async route=>{
    const url=new URL(route.request().url());let data;
    if(url.pathname==='/horas/auth-status'||url.pathname==='/horas/auth-check'){health++;if(url.pathname.endsWith('auth-check'))checks++;data={phase,checkedAt:'2026-10-29T09:00:00Z'};}
    else if(url.pathname==='/horas/status'){reads++;data=await page.evaluate(()=>({phase:'done',result:{periods:[8,9,10].map(month=>{const period=mkey(2026,month);return {period,verified:true,checkedAt:new Date().toISOString(),rows:hoursScopeKeys(period).map(key=>({key,state:'sent'}))};})}}));}
    else if(url.pathname.endsWith('gestify-status'))data={period:url.searchParams.get('period'),state:'scheduled',generated:true,issued:false,scheduled:true,sent:false,scheduledDate:url.searchParams.get('period')+'-20'};
    else return route.abort();
    return route.fulfill({json:data,headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
  });
  await context.route('**/horas/reachable',r=>r.fulfill({json:{service:'kairo-hours'},headers:{'Access-Control-Allow-Origin':'*'}}));
  await page.goto('/');await expect(page.locator('.home-submission')).toContainText('Correos al día');
  await expect(page.locator('.hours-auth-alert')).toHaveCount(0);expect(health).toBe(0);expect(reads).toBe(1);
  await page.locator('#homeSyncBtn').click();
  const access=page.getByRole('button',{name:'Comprobar acceso a Outlook'});
  await access.click();await expect(page.locator('#homeSyncResult')).toContainText('Microsoft pide MFA');expect(reads).toBe(1);
  phase='ready';await access.click();await expect(page.locator('#homeSyncResult')).toContainText('Acceso a Outlook confirmado');
  await page.locator('[data-hours-check]').click();await expect(page.locator('#homeSyncResult')).toContainText('Correos y factura actualizados');
  await expect(page.locator('#homeSyncBtn #homeSyncDate')).toHaveText(/29\/10.*10:00/);expect(checks).toBe(2);expect(reads).toBe(2);
  await page.locator('#homeSyncDialog').screenshot({path:info.outputPath('sync-kairo.png'),animations:'disabled'});
  await page.locator('[data-close-sync]').click();
  await page.evaluate(()=>{ST['2026-10-12']={type:'festivo'};render();});
  await expect(page.locator('[data-home-invoice=calendar]')).toHaveCount(0);
  await expect(page.locator('#hoursCalendarBtn')).toHaveAccessibleName('Ver envíos');
  await page.screenshot({path:info.outputPath('home-v536.png'),animations:'disabled'});
  await expect(page.locator('.home-submission')).not.toContainText(/Comprobado|Outlook/);
});

test('comprobar acceso muestra progreso y resultado aunque siga detenido; un fallo conserva el aviso',async({page,context})=>{
  let fail=false,release,hold=false;
  await page.clock.setFixedTime(new Date('2026-10-29T10:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:'https://auth-review.test.ts.net/facturas/'},months:{}}));});
  await context.route(base+'**',async route=>{
    if(!/\/auth-(status|check)$/.test(route.request().url()))return route.abort();
    if(hold)await new Promise(resolve=>{release=resolve;});
    if(fail)return route.abort();
    return route.fulfill({json:{phase:'unknown'},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
  });
  await context.route('**/horas/reachable',r=>r.fulfill({json:{service:'kairo-hours'},headers:{'Access-Control-Allow-Origin':'*'}}));
  await page.goto('/');await page.locator('#homeSyncBtn').click();
  const access=page.locator('[data-hours-auth]'),result=page.locator('#homeSyncResult');
  hold=true;await access.click();await expect(result).toContainText('Comprobando el acceso');await expect(access).toBeDisabled();
  await expect.poll(()=>typeof release).toBe('function');hold=false;release();
  await expect(result).toContainText('Microsoft requiere intervención');await expect(access).toBeEnabled();
  fail=true;await access.click();await expect(result).toContainText('No se pudo comprobar');
});

test('la comprobación explícita solicita recuperación y espera a que termine sin barrer correos',async({page,context})=>{
  let requested=false,posts=0;
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:'https://auth-review.test.ts.net/facturas/'},months:{}}));});
  await context.route(base+'**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path.endsWith('/auth-check')){expect(route.request().method()).toBe('POST');expect(route.request().postDataJSON()).toEqual({action:'check'});requested=true;posts++;return route.fulfill({json:{phase:'checking'}});}
    if(path.endsWith('/auth-status'))return route.fulfill({json:{phase:requested?'ready':'unknown'}});
    return route.abort();
  });
  await context.route('**/horas/reachable',r=>r.fulfill({json:{service:'kairo-hours'},headers:{'Access-Control-Allow-Origin':'*'}}));
  await page.goto('/');await page.locator('#homeSyncBtn').click();await page.locator('[data-hours-auth]').click();
  await expect(page.locator('[data-hours-auth]')).toBeDisabled();
  await expect(page.locator('#homeSyncResult')).toContainText('Acceso a Outlook confirmado');
  await expect(page.locator('.hours-auth-alert')).toHaveCount(0);expect(posts).toBe(1);
});

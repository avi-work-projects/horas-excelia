const {test,expect}=require('@playwright/test');
const base='https://auth-review.test.ts.net/';
test('MFA se avisa sin consultar el buzón y se retira tras recuperar acceso',async({page,context})=>{
  let phase='mfa',reads=0,health=0;
  await page.clock.setFixedTime(new Date('2026-10-29T10:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:'https://auth-review.test.ts.net/facturas/'},months:{}}));});
  await context.route(base+'**',async route=>{
    const url=new URL(route.request().url());let data;
    if(url.pathname==='/horas/auth-status'||url.pathname==='/horas/auth-check'){health++;data={phase,checkedAt:'2026-10-29T09:00:00Z'};}
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
  await page.goto('/');const notice=page.locator('.hours-auth-alert');await expect(notice).toContainText('Revisa el acceso');
  hold=true;await notice.getByRole('button').click();await expect(notice.getByRole('button')).toHaveText('Comprobando…');await expect(notice.getByRole('button')).toBeDisabled();
  await expect.poll(()=>typeof release).toBe('function');hold=false;release();
  await expect(page.locator('#toast')).toContainText('Comprobado: el acceso sigue detenido');await expect(notice.getByRole('button')).toBeEnabled();
  fail=true;await notice.getByRole('button').click();await expect(page.locator('#toast')).toContainText('No se pudo comprobar el acceso');await expect(notice).toContainText('Revisa el acceso');
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
  await page.goto('/');await page.getByRole('button',{name:'Comprobar acceso',exact:true}).click();
  await expect(page.getByRole('button',{name:'Comprobando…',exact:true})).toBeDisabled();
  await expect(page.locator('#toast')).toContainText('Acceso a Outlook confirmado');
  await expect(page.locator('.hours-auth-alert')).toHaveCount(0);expect(posts).toBe(1);
});

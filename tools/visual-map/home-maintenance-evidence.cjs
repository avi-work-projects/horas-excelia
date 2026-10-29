// Representative Home states. Isolated profile, synthetic data and blocked mail.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('@playwright/test');
const {startServer}=require('./serve.cjs');
const fixture=require('./fixture.cjs');
async function main(){
  const version=(process.argv.find(arg=>arg.startsWith('--version='))||'--version=v516').slice(10);
  if(!/^v\d+$/.test(version))throw Error('Versión no válida');
  const server=await startServer(0),origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({channel:process.env.GESTIFY_BROWSER_CHANNEL||'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:400,height:1100},isMobile:true,hasTouch:true,timezoneId:'Europe/Madrid',locale:'es-ES',serviceWorkers:'block'});
  const data=fixture(),base='https://home-map.test.ts.net',out=path.resolve(__dirname,'../../docs/visual-map/review/evidence');
  data['excelia-horas-v3'].days={'2027-02-01':{type:'vacaciones'},'2027-02-02':{type:'festivo'},'2027-02-03':{type:'normal',hours:7},'2027-02-04':{type:'ausencia'}};
  data['excelia-horas-v3'].monthH={'2027-02':9};data['excelia-horas-v3'].sent={};
  data['excelia-invoices-v1'].config.kairoUrl=base+'/facturas/';
  data['excelia-mail-config-v1']={to:'destino@example.invalid',cc:['copia@example.invalid'],name:'Persona de ejemplo'};
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2027-02-01T12:00:00+01:00'));
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin===base){
      const period=url.searchParams.get('period');let result;
      if(url.pathname==='/horas/auth-status')result={phase:'disabled'};
      else if(url.pathname==='/facturas/gestify-status')result={period,state:'scheduled',generated:true,issued:false,scheduled:true,sent:false,scheduledDate:period==='2027-02'?'2027-02-19':period+'-20'};
      else if(url.pathname==='/horas/status')result=await page.evaluate(period=>({phase:'done',result:{periods:[-1,0,1].map(offset=>{const d=new Date(Number(period.slice(0,4)),Number(period.slice(5))-1+offset,1),p=mkey(d.getFullYear(),d.getMonth());return {period:p,verified:true,checkedAt:new Date().toISOString(),rows:hoursScopeKeys(p).map(key=>{const schedule=new Date(homeWeekSchedule(key).date+'T08:00:00').toISOString();return {key,state:Date.parse(schedule)<Date.now()?'sent':'scheduled',days:hoursWeekDays(key),schedule};})};})}}),period);
      else return route.abort();
      return route.fulfill({json:result,headers:{'Access-Control-Allow-Origin':origin}});
    }
    return url.origin===origin||['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)?route.continue():route.abort();
  });
  await page.addInitScript(data=>{sessionStorage.setItem('excelia-popup-dismissed','1');for(const [key,value]of Object.entries(data))if(key.startsWith('excelia-'))localStorage.setItem(key,JSON.stringify(value));localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');},data);
  try{
    await page.goto(origin+'/index.html');await page.evaluate(()=>document.fonts.ready);
    if(await page.locator('#homePopupClose').isVisible())await page.locator('#homePopupClose').click();
    await page.waitForFunction(()=>hoursCachedWeek('2027-02-01')?.state==='scheduled'&&homeInvoiceModel(CY,CM).tone==='scheduled');
    fs.mkdirSync(out,{recursive:true});
    for(const mode of ['scheduled','pending','changes','offline','formula'].concat(process.argv.includes('--mfa')?['mfa']:[])){
      await page.evaluate(mode=>{
        HOURS_WEEK_UNLOCKED=Object.create(null);HOURS_JOB_ERROR='';HOME_FORMULA_OPEN=mode==='formula';
        HOURS_AUTH={url:hoursKairoUrl(),phase:mode==='mfa'?'mfa':'ready'};
        homeSubmissionWeeks(CY,CM).forEach(w=>{const row=hoursCachedWeek(w.key);row.state=mode==='pending'?'missing':'scheduled';row.days=hoursWeekDays(w.key);row.schedule=new Date(homeWeekSchedule(w.key).date+'T08:00:00').toISOString();});
        if(mode==='changes'){const row=hoursCachedWeek('2027-02-01');row.days=row.days.map((d,i)=>({date:d.date,type:'normal',hours:i===4?6.5:9}));HOURS_WEEK_UNLOCKED['2027-02-01']=true;}
        if(mode==='offline')HOURS_JOB_ERROR='Sin conexión con Kairo. Se conserva el estado confirmado y el envío manual.';
        const invoice=INVOICE_HOME_CACHE.periods[mkey(CY,CM)].data;
        invoice.state=mode==='pending'?'issued':mode==='changes'?'sent':'scheduled';invoice.sent=invoice.state==='sent';invoice.scheduled=invoice.state==='scheduled';invoice.issued=!invoice.scheduled;invoice.scheduledDate=invoice.scheduled?'2027-02-19':null;
        render();window.scrollTo(0,0);
      },mode);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const box=await page.locator('.week-card').first().boundingBox();
      await page.screenshot({path:path.join(out,'home-'+mode+'-'+version+'.png'),animations:'disabled',clip:{x:0,y:0,width:400,height:Math.ceil(box.y+box.height+12)}});
      console.log('Home '+mode+' · datos ficticios');
    }
    if(errors.length)throw Error(errors.join('\n'));
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});

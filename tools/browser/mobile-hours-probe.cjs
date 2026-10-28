// Read-only probe of the installed PWA over an already-authorised USB bridge.
// It saves only the weekly mail request and a storage digest outside the repo.
const {chromium}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
async function main(){
  const browser=await chromium.connectOverCDP('http://127.0.0.1:9225',{timeout:10000});
  try{
    const pages=browser.contexts().flatMap(c=>c.pages()).filter(p=>p.url()==='https://avi-work-projects.github.io/horas-excelia/index.html');
    if(pages.length!==1)throw Error('Gestify no está identificado de forma única');
    const result=await pages[0].evaluate(async()=>{
      const first=weeks(CY,CM).map(w=>w[0]),last=first[first.length-1];first.push(ad(last,7),ad(last,14));
      const payload={schema:1,period:mkey(CY,CM),mode:'month',targetWeek:null,config:{to:String(TO).split(/[;,]/).map(x=>x.trim()).filter(Boolean),cc:CC.slice()},weeks:first.map(mon=>{
        const key=dk(mon),wd=getWD(key);return{key,subject:'HORAS Y DIAS TRABAJADOS - '+AUTHOR_NAME+' - Semana del '+fd(wd.mon)+' al '+fd(wd.fri),body:buildMailtoBody(wd),days:[0,1,2,3,4].map(i=>{const d=ad(mon,i),type=dayT(d);return{date:dk(d),type,hours:type==='normal'?dayH(d):0};})};
      })};
      const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(Object.entries(localStorage).sort())));
      return{payload,version:APP_VERSION,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,storageHash:[...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join(''),viewport:{width:innerWidth,height:innerHeight},candidateLoaded:typeof openHoursReview==='function'};
    });
    const dir=path.join(process.env.LOCALAPPDATA,'Gestify','private-tests');
    fs.mkdirSync(dir,{recursive:true});
    const file=path.join(dir,'mobile-hours-probe.json');
    if(fs.existsSync(file)){
      const previous=JSON.parse(fs.readFileSync(file,'utf8'));
      if(previous.version===result.version)result.storageUnchanged=previous.storageHash===result.storageHash;
    }
    if(!fs.existsSync(file)||process.argv.includes('--replace-baseline'))fs.writeFileSync(file,JSON.stringify(result));
    console.log(JSON.stringify({version:result.version,timeZone:result.timeZone,period:result.payload.period,weeks:result.payload.weeks.map(w=>w.key),candidateLoaded:result.candidateLoaded,viewport:result.viewport,storageUnchanged:result.storageUnchanged,privateProbeSaved:true}));
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e.name+': '+e.message);process.exitCode=1;});

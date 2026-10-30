const {test,expect}=require('@playwright/test');
const {execFileSync}=require('node:child_process');
const html=execFileSync(process.platform==='win32'?'python':'python3',['-c',`from invoice_month_review import render
row={'id':2,'status':'review','data':{'period':'2026-11','number':'11-01/2026','send_date':'2026-11-20','display':{'total':1234.56,'days':20,'base':1200,'vat':252,'withholding':217.44},'to':'destino@example.invalid','subject':'Factura de noviembre','body':'Correo sintético de revisión.'}}
print(render('2026-11',row,2,{'commissioned':True,'mail_enabled':True},'synthetic-csrf','synthetic-hash'))`],{cwd:'tools/kairo',encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'}});

for(const width of [320,400])test('revisión de noviembre compacta a '+width+' px, con confirmación explícita',async({page},info)=>{
 await page.setViewportSize({width,height:740});let writes=[];
 await page.route('**/synthetic-invoice',r=>r.fulfill({contentType:'text/html',body:html}));
 await page.route('**/facturas/approve',r=>{writes.push(r.request().postDataJSON());return r.fulfill({status:409,json:{message:'La versión ha cambiado. Vuelve a revisar.'}});});
 await page.goto('/synthetic-invoice');await expect(page.getByRole('heading',{name:'Noviembre 2026'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight)).toBe(true);
 await expect(page.getByRole('link',{name:'Revisar borrador PDF'})).toHaveAttribute('href','/facturas/documento/2/draft');
 await page.screenshot({path:info.outputPath('revision-noviembre-'+width+'.png')});
 await page.getByText('Ver correo',{exact:true}).click();
 await expect(page.locator('details pre')).toHaveText('Correo sintético de revisión.');
 await expect(page.locator('details')).not.toContainText('IVA:');
 await expect(page.locator('details')).not.toContainText('Días:');
 await page.screenshot({path:info.outputPath('correo-exacto-'+width+'.png')});
 await page.getByText('Ver correo',{exact:true}).click();
 await page.getByRole('button',{name:'Aprobar emisión y envío',exact:true}).click();
 await expect(page.locator('#confirm')).toBeVisible();expect(writes).toHaveLength(0);
 await page.getByRole('button',{name:'Volver a revisar',exact:true}).click();expect(writes).toHaveLength(0);
 await page.getByRole('button',{name:'Aprobar emisión y envío',exact:true}).click();await page.getByRole('button',{name:'Confirmar',exact:true}).click();
 await expect(page.locator('#result')).toContainText('La versión ha cambiado');expect(writes).toEqual([{hash:'synthetic-hash'}]);
});

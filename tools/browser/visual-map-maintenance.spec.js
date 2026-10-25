const {test,expect}=require('@playwright/test');
const {setup,perform,measure}=require('../visual-map/capture.cjs');
const {scenes,edges}=require('../visual-map/catalog.cjs');
test('El capturador aislado conserva los recorridos y mide los botones de las flechas',async({browser,baseURL},info)=>{
  const {context,page,errors}=await setup(browser,baseURL);
  try{
    const calendar=scenes.find(s=>s.id==='calendar'),day=scenes.find(s=>s.id==='day');
    for(const action of calendar.route)await perform(page,action);
    const measured=await measure(page,calendar,edges);
    expect(measured.png.subarray(1,4).toString()).toBe('PNG');
    const origin=edges.find(e=>e.from==='calendar'&&e.to==='day');
    expect(measured.anchors.day).toEqual(await page.locator(origin.selector).first().boundingBox());
    await perform(page,origin.selector);
    const detail=await measure(page,day,edges);
    expect(detail.entryBox.height).toBeGreaterThan(100);
    expect(detail.anchors.edit.width).toBeGreaterThan(10);
    expect(errors).toEqual([]);
    await info.attach('Ficha y botones de salida',{body:detail.png,contentType:'image/png'});
  }finally{await context.close();}
});

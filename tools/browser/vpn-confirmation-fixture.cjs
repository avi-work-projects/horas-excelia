/* Synthetic tests of Kairo assume the user already confirmed the VPN.
   mobile-connection.spec exercises the actual prompt and expiry separately. */
exports.confirmedVpn=function(test,origin){
  test.beforeEach(async({page})=>{
    await page.addInitScript(origin=>window.addEventListener('DOMContentLoaded',()=>sessionStorage.setItem('excelia-kairo-vpn-v1',JSON.stringify({origin:new URL(origin).origin,at:Date.now()}))),origin);
  });
};

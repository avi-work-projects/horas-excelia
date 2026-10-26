// La suite y los contextos persistentes comparten la elección del navegador.
const channel=process.platform==='win32'?'msedge':process.env.GESTIFY_BROWSER_CHANNEL||undefined;
module.exports={channel,fullChannel:channel||'chromium'};

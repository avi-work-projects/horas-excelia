const {channel}=require('./tools/browser/browser-channel.cjs');
module.exports={testDir:'tools/browser',reporter:process.env.CI?[['dot'],[require.resolve('./tools/browser/timing-reporter.cjs')]]:undefined,use:{baseURL:'http://127.0.0.1:8765',viewport:{width:400,height:880},hasTouch:true,channel},webServer:{command:'node tools/serve-test.js',port:8765,reuseExistingServer:false}};

const {execFileSync}=require('node:child_process');
// Use the production shell and bridge. Only the trusted test origin changes.
module.exports=execFileSync(process.env.GESTIFY_TEST_PYTHON||'python',['-c',
  "from gestify_bridge import receiver;print(receiver('https://fixture.github.io','synthetic').replace('https://fixture.github.io','http://127.0.0.1:8765'))"
],{cwd:'tools/kairo',encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'}});

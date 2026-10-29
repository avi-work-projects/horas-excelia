// Aggregate file timings so the next optimisation starts from evidence.
const path=require('node:path');
module.exports=class TimingReporter{
  constructor(){this.files=new Map();}
  onTestEnd(test,result){const file=path.relative(process.cwd(),test.location.file);this.files.set(file,(this.files.get(file)||0)+result.duration);}
  onEnd(){console.log('\nArchivos con mayor tiempo de pruebas:');for(const [file,ms] of [...this.files].sort((a,b)=>b[1]-a[1]).slice(0,8))console.log(`${(ms/1000).toFixed(1)} s  ${file}`);}
};

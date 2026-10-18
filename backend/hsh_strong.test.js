const {test}=require('node:test');
const assert=require('node:assert/strict');
const {calcHukumHSH,hshEligibility}=require('./rule_engine');
const n={open:100,high:140,low:90,close:130};
test('BRK UP and BRK DWN suppress HSH on every timeframe including near close',()=>{
 for(const tf of [60000,900000,1800000,3600000,14400000,28800000,86400000,604800000,2678400000,31536000000])for(const pattern of ['BRK UP','BRK DWN']){
 const result=calcHukumHSH(n,tf,0,tf*.01,{pattern});
 assert.equal(result.hshActive,false);assert.equal(result.hshSeverity,'NONE');
 assert.equal(result.eligibility.status,'SUPPRESSED_STRONG');assert.equal(result.targetPrice,100);
 }
});
test('normal resumes eligibility without treating unknown perahu as normal',()=>{
 assert.equal(calcHukumHSH(n,3600000,0,60000,'NRL UP').hshActive,true);
 assert.equal(calcHukumHSH(n,3600000,0,60000).hshActive,false);
 assert.equal(hshEligibility(null).status,'UNVERIFIED');
 assert.equal(calcHukumHSH(n,3600000,0,0,'NRL UP').hshActive,false);
});

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {calcHukumJIKA,calcHukumPerahu,calcRSMatrix,calcLeak4RegMatrix}=require('./rule_engine');
for(const open of [90,100,110]) test(`matrix uses canonical rules for open ${open}`,()=>{
 const n={open,high:120,low:80,close:105},b={open:100,high:115,low:85,close:100};
 const m=calcLeak4RegMatrix({'4h':{ohlcv_N:n,ohlcv_B:b}},105,12,3);
 assert.equal(m.tableRows[0].direct,calcHukumJIKA(n,b).trend);
 assert.equal(m.tableRows[0].pattern,calcHukumPerahu(n,b).pattern);
 const rs=calcRSMatrix(b);
 for(const [field,key] of [['res1','r1'],['res2','r2'],['res3','r3'],['res4','r4'],['sup1','s1'],['sup2','s2'],['sup3','s3'],['sup4','s4'],['pivot','pivot']]) assert.equal(m.rsColumns[0][field],rs[key].toFixed(3));
});

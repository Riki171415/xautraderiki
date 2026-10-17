const {test}=require('node:test');
const assert=require('node:assert/strict');
const {calcRSMatrix}=require('./rule_engine');
const keys=['r4','r3','r2','r1','pivot','s1','s2','s3','s4'];
// Values transcribed from the user-provided Ferrari screenshot; comparison is at its displayed precision.
for(const sample of [
 {tf:'1h',b:{open:2334.28,high:2335.68,low:2331.80},n:{open:2334.93},expected:['2349.84','2342.08','2338.20','2336.84','2334.32','2332.96','2330.44','2326.56','2318.80']},
 {tf:'4h',b:{open:2333.45,high:2337.52,low:2321.90},n:{open:2324.27},expected:['2390.75','2359.51','2343.89','2334.63','2328.27','2319.01','2312.65','2297.03','2265.79']}
])test(`Ferrari screenshot ${sample.tf}: all nine levels agree with Excel engine to two decimals`,()=>{
 const rs=calcRSMatrix(sample.b,sample.n,sample.tf);
 assert.deepEqual(keys.map(k=>rs[k].toFixed(2)),sample.expected);
 if(sample.tf==='4h')assert.equal(rs.correction,.08);
});

const {test}=require('node:test');const assert=require('node:assert/strict');
const {calcRSMatrix,calcHukumBusur,calcLeak4RegMatrix}=require('./rule_engine');
const b={open:1282.03,high:1556.95,low:1266.18,close:1300},n={open:1520.51,high:2074.3,low:1451.07,close:1878.46};
// Independent translation of the Excel cell dependency graph J2:R10, including operation order.
function excel(tf,B,N){const P=(B.open+B.high+B.low+N.open+(N.open-(tf==='4h'?8:1)*.01))/5;
const values={pivot:P,r1:2*P-B.low,s1:2*P-B.high};values.r2=P-values.s1+values.r1;values.s2=P-(values.r1-values.s1);
if(['1h','4h','market','1m','5m','15m','30m'].includes(tf)){values.r3=P-values.s2+values.r2;values.s3=P-(values.r2-values.s2);values.r4=P-values.s3+values.r3;values.s4=P-(values.r3-values.s3);}
else {values.r3=2*P+(B.high-2*B.low);values.r4=3*P+(B.high-3*B.low);values.s3=2*P-(2*B.high-B.low);values.s4=3*P-(3*B.high-B.low);}return values;}
for(const tf of ['1m','5m','15m','30m','1h','4h','market','1d','1w','1M','3M','6M','1Y','10Y'])test(`Excel dependency graph and matrix agree for ${tf}`,()=>{const rs=calcRSMatrix(b,n,tf);for(const [key,v]of Object.entries(excel(tf,b,n)))assert.ok(Math.abs(rs[key]-v)<1e-9,`${key}: ${rs[key]} != ${v}`);assert.ok(Math.abs(rs.pivot-1429.234)<.02);});
test('Excel saved Year values agree to two decimals',()=>{const rs=calcRSMatrix(b,n,'1Y');assert.deepEqual(['r4','r3','r2','r1','pivot','s1','s2','s3','s4'].map(k=>rs[k].toFixed(2)),['2046.11','1883.06','1720.00','1592.29','1429.23','1301.52','1138.46','1010.75','883.03']);});
test('Close B never affects Pivot; ON does, H4 correction distinct',()=>{assert.equal(calcRSMatrix(b,n,'1h').pivot,calcRSMatrix({...b,close:1450},n,'1h').pivot);assert.ok(Math.abs(calcRSMatrix(b,n,'1h').pivot-calcRSMatrix(b,n,'4h').pivot-.014)<1e-9);assert.notEqual(calcRSMatrix(b,n,'1h').pivot,calcRSMatrix(b,{...n,open:1500},'1h').pivot);});
test('valid gap reverses levels and blocks invalid BUY plan',()=>{const B={open:100,high:110,low:90},N={open:130,high:140,low:125,close:135};const rs=calcRSMatrix(B,N,'1h');assert.ok(rs.r1>rs.r2);assert.ok(rs.s1>rs.pivot);assert.ok(rs.anomalies.some(a=>a.lower==='r1'&&a.upper==='r2'));const plan=calcHukumBusur({trend:'UP'},rs,N);assert.equal(plan.action,'WAIT');assert.match(plan.reason,/Urutan/);});
test('missing values do not substitute close or a different timeframe',()=>{for(const [B,N,tf] of [[{},n,'4h'],[b,{},'4h'],[b,n,undefined]])assert.equal(calcRSMatrix(B,N,tf).available,false);});

test('all matrix timeframe levels use the same Excel inputs without cross-timeframe substitution',()=>{
 const tfs=['1m','5m','15m','30m','1h','4h','market','1d','1w','1M','3M','6M','1Y'];
 const map=Object.fromEntries(tfs.map((tf,i)=>[tf,{sessionName:'USA',ohlcv_B:{...b,open:b.open+i,high:b.high+i,low:b.low+i},ohlcv_N:{...n,open:n.open+i}}]));
 const matrix=calcLeak4RegMatrix(map,n.close,12,3);
 assert.equal(matrix.rsColumns.length,tfs.length);
 for(const c of matrix.rsColumns){const pair=map[c.timeframe],expected=calcRSMatrix(pair.ohlcv_B,pair.ohlcv_N,c.timeframe);
 for(const [display,key]of [['res1','r1'],['res2','r2'],['res3','r3'],['res4','r4'],['pivot','pivot'],['sup1','s1'],['sup2','s2'],['sup3','s3'],['sup4','s4']])assert.equal(c[display],expected[key].toFixed(3));}
});

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {calcLeak4RegMatrix}=require('./rule_engine');
test('decade strength reference is separate from visible timeframe columns',()=>{
 const pair={ohlcv_N:{timestamp:Date.UTC(2021,0,1),periodEnd:Date.UTC(2031,0,1),open:100,high:120,low:90,close:110},ohlcv_B:{timestamp:Date.UTC(2011,0,1),open:90,high:100,low:80,close:95}};
 const model=calcLeak4RegMatrix({'10Y':pair},110,0,3);
 assert.equal(model.rsColumns.some(c=>c.timeframe==='10Y'),false);
 assert.equal(model.strengthReferences.length,1);
 assert.equal(model.strengthReferences[0].timeframe,'10Y');
 assert.equal(model.strengthReferences[0].periodEnd,Date.UTC(2031,0,1));
 assert.deepEqual(calcLeak4RegMatrix({},110,0,3).strengthReferences,[]);
 assert.deepEqual(calcLeak4RegMatrix({'10Y':{...pair,partialBefore:true}},110,0,3).strengthReferences,[]);
 assert.deepEqual(calcLeak4RegMatrix({'10Y':{...pair,ohlcv_B:{...pair.ohlcv_B,timestamp:Date.UTC(2016,0,1)}}},110,0,3).strengthReferences,[]);
});

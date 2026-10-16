const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validCandles,getExnessCandles,aggregateMonths}=require('./mt5_data');
const {calcHukumHSH,calcLeak4RegMatrix}=require('./rule_engine');
const rows=[[Date.UTC(2025,0,1),100,120,90,110,10],[Date.UTC(2025,1,1),110,140,100,130,20],[Date.UTC(2025,3,1),130,150,120,140,30]];
test('calendar aggregation preserves Exness OHLC and volume',()=>assert.deepEqual(aggregateMonths(rows,3),[[Date.UTC(2025,0,1),100,140,90,130,30],rows[2]]));
test('timeframe never replaced with H1 or another feed',()=>{
 const state={connected:true,lastTickTime:1000,timeframes:{'1h':{candles:rows,updatedAt:1000}}};
 assert.deepEqual(getExnessCandles(state,'1h',1001),rows);
 assert.throws(()=>getExnessCandles(state,'4h',1001),/belum tersedia/);
 assert.throws(()=>getExnessCandles(state,'1h',12000),/tidak aktif/);
});
test('invalid and unordered candles rejected',()=>{
 assert.equal(validCandles(rows),true);
 assert.equal(validCandles([...rows].reverse()),false);
 assert.equal(validCandles([[1,100,90,80,100,1],[2,100,120,90,110,1]]),false);
});
test('missing matrix timeframes omitted, never cloned from H1',()=>{
 const n={open:110,high:140,low:100,close:130}; const b={open:100,high:120,low:90,close:110};
 const matrix=calcLeak4RegMatrix({'1h':{ohlcv_N:n,ohlcv_B:b}},130);
 assert.deepEqual(matrix.tableRows.map(r=>r.timeframe),['1h']);
});
test('HSH target is Open N',()=>{
 const result=calcHukumHSH({open:100,high:140,low:90,close:130},3600000,0,60000);
 assert.equal(result.targetType,'OPEN_N'); assert.equal(result.targetPrice,100); assert.equal(result.hshActive,true);
});

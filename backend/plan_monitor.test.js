const {test}=require('node:test');
const assert=require('node:assert/strict');
const {observePlan,alternativeEntries}=require('./plan_monitor');
const plan={action:'SELL LIMIT',entryPrice:4185,tp1:4170,tp2:4160,stopLoss:4195};
const start=60000;
const n={timestamp:start,low:4150,high:4190};
const bar=(i,lo,hi)=>[start+i*60000,hi,hi,lo,lo];
const check=rows=>observePlan(plan,n,rows,60000,start+rows.length*60000);
test('H4 4185 never touched: no TP even when price passed both targets',()=>{
 const r=observePlan(plan,{...n,high:4180},[bar(0,4150,4180)]);
 assert.equal(r.status,'WAIT_ENTRY');assert.equal(r.tp1Observed,false);assert.equal(r.tp2Observed,false);
});
test('TP before entry does not count as achieved',()=>{
 const r=check([bar(0,4168,4172),bar(1,4183,4187),bar(2,4175,4180)]);
 assert.equal(r.entryObserved,true);assert.equal(r.tp1Observed,false);
});
test('TP after entry is observed',()=>{assert.equal(check([bar(0,4183,4187),bar(1,4168,4175)]).status,'TP1_OBSERVED');});
test('same candle entry and TP is ambiguous',()=>{const r=check([bar(0,4168,4187)]);assert.equal(r.status,'AMBIGUOUS');assert.equal(r.tp1Observed,false);});
test('missing leading or middle history cannot establish sequence',()=>{
 assert.equal(check([bar(1,4183,4187),bar(2,4168,4175)]).status,'UNCONFIRMED');
 assert.equal(check([bar(0,4183,4187),bar(2,4168,4175)]).status,'UNCONFIRMED');
});
test('SL ends scenario before later TP',()=>{assert.equal(check([bar(0,4183,4187),bar(1,4194,4196),bar(2,4158,4175)]).status,'STOP_OBSERVED');});
test('BUY has the same entry-before-target requirement',()=>{
 const p={action:'BUY LIMIT',entryPrice:100,tp1:110,tp2:120,stopLoss:90};
 const r=observePlan(p,{timestamp:start,low:98,high:122},[bar(0,110,122),bar(1,98,102)],60000,start+120000);
 assert.equal(r.entryObserved,true);assert.equal(r.tp2Observed,false);
});
test('H4 alternatives start at M30 and use nearest resistance above price',()=>{
 const pair={ohlcv_B:{open:100,high:110,low:90,close:100},ohlcv_N:{open:99,high:102,low:95,close:101}};
 const r=alternativeEntries('4h',plan,{'30m':pair,'15m':pair,'5m':pair},111,{status:'WAIT_ENTRY'},{available:true,jika:'DOWN'});
 assert.deepEqual(r.map(x=>x.tf),['30m','15m','5m']);assert.equal(r[0].level,'R2');assert.ok(Math.abs(r[0].entryPrice-119.598)<1e-8);assert.ok(r[0].stopLoss>r[0].entryPrice);assert.ok(r[0].tp1<r[0].entryPrice);
 assert.equal(alternativeEntries('4h',plan,{'30m':pair},111,{status:'ENTRY_OBSERVED'},{}).length,0);
 assert.equal(alternativeEntries('4h',plan,{'30m':pair},111,{status:'WAIT_ENTRY'},{available:true,jika:'UP'})[0].status,'WAIT_H4');
});

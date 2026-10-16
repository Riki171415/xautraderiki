const {test}=require('node:test');
const assert=require('node:assert/strict');
const {buildH4Compass}=require('./h4_compass');
const pair=(open,previous,close)=>({ohlcv_N:{open,close,timestamp:1000},ohlcv_B:{open:previous}});
test('H4 up with falling price is bow direction, never confirmed reversal',()=>{
 const r=buildH4Compass({'4h':pair(110,100,105),'1d':pair(110,100,115),'1w':pair(110,100,115),'1h':pair(100,110,95)});
 assert.equal(r.h4.jika,'UP');assert.equal(r.h4.phase,'BOW_DIRECTION');assert.equal(r.bowDirection,'DOWN');assert.equal(r.targetDirection,'UP');assert.equal(r.confirmation,'NOT_CONFIRMED');assert.equal(r.h4.hshTarget,110);assert.equal(r.micro[0].alignment,'OPPOSED');
});
test('bearish H4 mirrors bow and target directions',()=>{
 const r=buildH4Compass({'4h':pair(100,110,105)});assert.equal(r.bowDirection,'UP');assert.equal(r.targetDirection,'DOWN');assert.equal(r.h4.phase,'BOW_DIRECTION');
});
test('aligned move describes direction without claiming target hit',()=>assert.equal(buildH4Compass({'4h':pair(110,100,120)}).h4.phase,'TARGET_DIRECTION'));
test('equal opens retain neutral and wait',()=>{
 const r=buildH4Compass({'4h':pair(100,100,120)});assert.equal(r.h4.jika,'NEUTRAL');assert.equal(r.targetDirection,'WAIT');assert.equal(r.macroStatus,'INCOMPLETE');
});
test('missing H4 cannot be replaced by another timeframe',()=>assert.equal(buildH4Compass({'1h':pair(110,100,120)}).available,false));
test('conflicting daily direction is flagged',()=>{
 const r=buildH4Compass({'4h':pair(110,100,120),'1d':pair(100,110,95),'1w':pair(110,100,120)});assert.equal(r.macroStatus,'CONFLICT');assert.equal(r.macro.find(f=>f.timeframe==='1d').alignment,'OPPOSED');
});
test('full hierarchy preserves distinct per-timeframe opens and moves',()=>{
 const map=Object.fromEntries(['1Y','6M','3M','1M','1w','1d','4h','1h','30m','15m','5m'].map((tf,i)=>[tf,pair(100+i,90+i,105+i)]));
 const r=buildH4Compass(map);assert.equal(r.macroStatus,'ALIGNED');assert.equal(r.macro.length,6);assert.equal(r.micro.length,4);assert.equal(r.h4.openN,106);assert.equal(r.micro[0].openN,107);
});

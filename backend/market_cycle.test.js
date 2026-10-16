const {test}=require('node:test');
const assert=require('node:assert/strict');
const {analyzeMarketSessions}=require('./market_cycle');
const {calcMarketCycle}=require('./rule_engine');
const H=3600000, anchor=Date.UTC(2026,9,15,23);
function fixture(kind='strongBear',now=anchor+23*H) {
 const ranges={strongBear:[[110,90],[109,80],[108,70]],strongBull:[[110,90],[120,91],[130,92]],normalBear:[[110,90],[120,80],[119,70]],normalBull:[[110,90],[120,80],[130,81]]}[kind];
 const hourly=Array.from({length:24},(_,i)=>{const [high,low]=ranges[i<8?0:i<14?1:2];return [anchor+i*H,100,high,low,100,1];});
 return {hourly,daily:{timestamp:anchor+H,open:100,close:kind.endsWith('Bull')?105:95},dailyBefore:{open:99},now};
}
test('bearish and bullish strong cycles mirror actual session bounds',()=>{
 for(const kind of ['strongBear','strongBull']) {const r=analyzeMarketSessions(fixture(kind));assert.equal(r.marketType,'STRONG');assert.equal(r.verification,'OBSERVED');}
});
test('normal requires European expansion and US continuation',()=>{
 for(const kind of ['normalBear','normalBull']) assert.equal(analyzeMarketSessions(fixture(kind)).marketType,'NORMAL');
});
test('missing H1 history blocks classification, never infers completion from time',()=>{
 const c=fixture();c.hourly.splice(3,1);const r=analyzeMarketSessions(c);
 assert.equal(r.sessions[0].status,'incomplete');assert.equal(r.sessions[0].missingBars,1);assert.notEqual(r.marketType,'STRONG');
});
test('Europe still running is provisional; future bars excluded',()=>{
 const c=fixture('strongBear',anchor+12.5*H);const r=analyzeMarketSessions(c);
 assert.equal(r.marketType,'STRONG');assert.equal(r.verification,'PROVISIONAL');assert.equal(r.sessions[1].status,'active');assert.equal(r.sessions[2].bars,0);
});
test('US violation invalidates a strong pattern',()=>{
 const c=fixture();c.hourly[15][2]=115;assert.equal(analyzeMarketSessions(c).marketType,'MIXED');
});
test('US failing to extend European low cannot finalize normal',()=>{
 const c=fixture('normalBear');for(let i=14;i<22;i++) c.hourly[i][3]=85;
 assert.equal(analyzeMarketSessions(c).marketType,'MIXED');
});
test('midnight retains previous trading-cycle day',()=>{
 const r=analyzeMarketSessions(fixture('strongBear',anchor+20*H));assert.equal(r.tradingDay,'2026-10-16');assert.equal(r.activeSession,'USA');
});
test('selected chart timeframe cannot change session classification',()=>{
 const context=fixture();const a=calcMarketCycle({open:1,close:999},null,'5m',999,context);const b=calcMarketCycle({open:999,close:1},null,'1w',1,context);assert.deepEqual(a,b);
});
test('no data remains unavailable, never defaults to normal bearish',()=>{
 const r=analyzeMarketSessions({now:anchor+H});assert.equal(r.marketType,'UNAVAILABLE');assert.equal(r.bias,'UNAVAILABLE');
});
test('neutral daily bias does not create a bullish or bearish signal',()=>{
 const c=fixture();c.daily.close=100;assert.equal(analyzeMarketSessions(c).bias,'NEUTRAL');assert.equal(analyzeMarketSessions(c).marketType,'WAITING');
});

test('Europe gets the actual previous completed USA open, never upcoming USA',()=>{
 const c=fixture('strongBear',anchor+12*H);
 const previous=Array.from({length:8},(_,i)=>[anchor-(10-i)*H,75+i,100,70,80,1]);
 c.hourly=[...previous,...c.hourly];
 const r=analyzeMarketSessions(c);
 assert.equal(r.activeSession,'EROPA');assert.equal(r.previousUsa.hshOpen,75);
 assert.equal(r.previousUsa.start,anchor-10*H);assert.equal(r.previousUsa.status,'completed');
});
test('previous USA with missing bars cannot invent an HSH open',()=>{
 const r=analyzeMarketSessions(fixture('strongBear',anchor+12*H));assert.equal(r.previousUsa.hshOpen,null);
});

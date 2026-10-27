const {test}=require('node:test');
const assert=require('node:assert/strict');
const {analyzeMarketSessions}=require('./market_cycle');
test('broker clock aligns Asia with D1 and moves every session and Market aggregation together',()=>{
 const {aggregateActiveMarket}=require('./market_cycle'),H=3600000,start=Date.UTC(2026,9,27);
 const hourly=Array.from({length:72},(_,i)=>[start+(i-24)*H,100+i,110+i,90+i,101+i,1]);
 const daily={timestamp:start,periodEnd:start+24*H,open:124,close:125};
 for(const [offset,name] of [[0,'ASIA'],[7,'ASIA'],[8,'EROPA'],[14,'USA'],[22,'TRANSISI']]){
  const now=start+offset*H,context={daily,clockMode:'BROKER_DAILY',symbol:'XAUUSD'};
  const c=analyzeMarketSessions({...context,hourly,now});
  assert.equal(c.activeSession,name);assert.equal(c.sessions[0].start,start);assert.equal(c.sessions[0].open,daily.open);
  assert.equal(c.sessions[0].hours,'07:00–15:00 WIB');
  const market=aggregateActiveMarket(hourly,now,context);assert.equal(market.sessionName,name);assert.equal(market.ohlcv_N.timestamp,c.sessions.find(s=>s.name===name).start);
 }
 const shifted={...daily,timestamp:start+H,periodEnd:start+25*H};
 assert.equal(analyzeMarketSessions({hourly,daily:shifted,clockMode:'BROKER_DAILY',now:start+2*H}).sessions[0].hours,'08:00–16:00 WIB');
 const expired=analyzeMarketSessions({hourly,daily,clockMode:'BROKER_DAILY',now:start+25*H});assert.equal(expired.available,false);assert.equal(expired.activeSession,'TRANSISI');assert.equal(expired.cycleStart,null);
});
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

test('Asia reference is previous Europe, not upcoming Europe',()=>{
 const c=fixture('strongBear',anchor+3*H);
 c.hourly=[...Array.from({length:6},(_,i)=>[anchor+(-16+i)*H,80+i,100,70,90,1]),...c.hourly];
 const r=analyzeMarketSessions(c).hshReference;
 assert.equal(r.name,'EROPA');assert.equal(r.hshOpen,80);assert.equal(r.start,anchor-16*H);
});
test('Europe rotation uses prior USA',()=>{
 const c=fixture('strongBear',anchor+12*H);
 c.hourly=[...Array.from({length:8},(_,i)=>[anchor+(-10+i)*H,70+i,100,60,90,1]),...c.hourly];
 const r=analyzeMarketSessions(c).hshReference;
 assert.equal(r.name,'USA');assert.equal(r.hshOpen,70);
});
test('USA rotation uses Asia of the same cycle including after midnight',()=>{
 for(const offset of [15,20]) {
  const r=analyzeMarketSessions(fixture('strongBear',anchor+offset*H)).hshReference;
  assert.equal(r.name,'ASIA');assert.equal(r.hshOpen,100);assert.equal(r.start,anchor);
 }
});
test('missing reference bars suppress the price; transition has no invented rotation',()=>{
 const r=analyzeMarketSessions(fixture('strongBear',anchor+3*H));assert.equal(r.hshReference.hshOpen,null);
 assert.equal(analyzeMarketSessions(fixture('strongBear',anchor+23*H)).hshReference,null);
});

test('market column switches from Europe to USA with real session open',()=>{
 const {aggregateActiveMarket}=require('./market_cycle');
 const c=fixture();const previous=c.hourly.map(r=>[r[0]-24*H,...r.slice(1)]);const rows=[...previous,...c.hourly];
 rows.find(r=>r[0]===anchor+14*H)[1]=101;
 const europe=aggregateActiveMarket(rows,anchor+13.5*H);const usa=aggregateActiveMarket(rows,anchor+14*H);
 assert.equal(europe.sessionName,'EROPA');assert.equal(usa.sessionName,'USA');assert.equal(usa.ohlcv_N.open,101);assert.equal(usa.ohlcv_N.timestamp,anchor+14*H);
});

test('Asia boundary changes Market name, Open N and previous-session B together',()=>{
 const {aggregateActiveMarket}=require('./market_cycle');const c=fixture();
 const next=Array.from({length:2},(_,i)=>[anchor+(24+i)*H,150,160,140,155,1]);
 const current=aggregateActiveMarket([...c.hourly,...next],anchor+24*H);
 assert.equal(current.sessionName,'ASIA');assert.equal(current.ohlcv_N.open,150);assert.equal(current.ohlcv_B.open,100);assert.equal(current.ohlcv_N.timestamp,anchor+24*H);
});

test('status badge hours agree with aggregation at every session boundary',()=>{
 const {getTradingSession}=require('./rule_engine');
 for(const [offset,key] of [[0,'tokyo'],[8,'london'],[14,'newYork'],[21.99,'newYork']]) {
  const r=getTradingSession(anchor+offset*H);assert.deepEqual(r.activeSessions,[key]);
 }
 assert.equal(getTradingSession(anchor+22*H).activeSessions.length,0);
});

test('strong requires strictly stepped extrema, not merely staying inside Asia',()=>{
 const b=fixture('strongBear');for(let i=14;i<22;i++)b.hourly[i][2]=109.5;assert.equal(analyzeMarketSessions(b).marketType,'MIXED');
 const u=fixture('strongBull');for(let i=14;i<22;i++)u.hourly[i][3]=90.5;assert.equal(analyzeMarketSessions(u).marketType,'MIXED');
 const equal=fixture('strongBear');for(let i=8;i<14;i++)equal.hourly[i][2]=110;assert.notEqual(analyzeMarketSessions(equal).marketType,'STRONG');
});

test('normal bearish cannot accept equal USA and Europe highs',()=>{const c=fixture('normalBear');for(let i=14;i<22;i++)c.hourly[i][2]=120;assert.equal(analyzeMarketSessions(c).marketType,'MIXED');});
test('normal same-H1 extrema do not prove event ordering',()=>{const r=analyzeMarketSessions(fixture('normalBear'));assert.equal(r.normalStory.status,'ORDER_UNVERIFIED');assert.equal(r.verification,'ORDER_UNVERIFIED');});
test('normal bearish verifies low-high in Asia Europe and high-low in USA',()=>{
 const c=fixture('normalBear');for(let i=0;i<22;i++){const group=i<8?0:i<14?1:2;const high=group===0?(i===3?110:109):group===1?(i===11?120:119):(i===15?119:118);const low=group===0?(i===1?90:91):group===1?(i===9?80:81):(i===19?70:71);c.hourly[i]=[anchor+i*H,100,high,low,100,1];}
 const r=analyzeMarketSessions(c);assert.equal(r.marketType,'NORMAL');assert.equal(r.normalStory.status,'VERIFIED');
 c.hourly[0][2]=111;assert.equal(analyzeMarketSessions(c).marketType,'MIXED');
});

test('Monday Europe uses last observed Friday USA across empty weekend sessions',()=>{
 const monday=Date.UTC(2026,9,18,23),fridayUsa=monday-58*H;
 const usa=Array.from({length:8},(_,i)=>[fridayUsa+i*H,75,80,70,76,1]);
 const current=Array.from({length:12},(_,i)=>[monday+i*H,100,110,90,95,1]);
 const result=analyzeMarketSessions({symbol:'XAUUSD',hourly:[...usa,...current],daily:{open:100,close:95},now:monday+10*H});
 assert.equal(result.activeSession,'EROPA');assert.equal(result.hshReference.hshOpen,75);
 assert.equal(result.hshReference.start,fridayUsa);assert.equal(result.previousUsa.hshOpen,75);
 assert.equal(result.hshReference.skippedCalendarDays,2);
});
test('latest incomplete USA cannot be replaced with an older complete USA',()=>{
 const monday=Date.UTC(2026,9,18,23),fridayUsa=monday-58*H;
 const older=Array.from({length:8},(_,i)=>[fridayUsa-24*H+i*H,55,60,50,56,1]);
 const latest=[[fridayUsa,75,80,70,76,1]];
 const result=analyzeMarketSessions({symbol:'XAUUSD',hourly:[...older,...latest],daily:{open:100,close:95},now:monday+10*H});
 assert.equal(result.hshReference.start,fridayUsa);assert.equal(result.hshReference.hshOpen,75);assert.equal(result.hshReference.coverage,false);
});

test('BTC never substitutes Friday for missing Sunday USA; present Sunday USA is used',()=>{
 const monday=Date.UTC(2026,9,18,23),friday=monday-58*H,sunday=monday-10*H;
 const bars=start=>Array.from({length:8},(_,i)=>[start+i*H,75,80,70,76,1]);
 for(const symbol of ['BTCUSD','BTC/USDC']){
  const args={symbol,hourly:bars(friday),now:monday+10*H};
  assert.equal(analyzeMarketSessions(args).hshReference.hshOpen,null);
  const result=analyzeMarketSessions({...args,hourly:[...bars(friday),...bars(sunday)]});
  assert.equal(result.hshReference.start,sunday);assert.equal(result.hshReference.hshOpen,75);
 }
});
test('weekday missing history is not assumed to be a holiday closure',()=>{
 const monday=Date.UTC(2026,9,18,23),friday=monday-58*H;
 const hourly=Array.from({length:8},(_,i)=>[friday+i*H,75,80,70,76,1]);
 const result=analyzeMarketSessions({symbol:'EURUSD',hourly,now:monday+34*H});
 assert.equal(result.hshReference.hshOpen,null);
});

test('HSH uses exact opening bar even when later bars are missing; missing opening bar never borrows next open',()=>{
 const monday=Date.UTC(2026,9,18,23),usa=monday-10*H;
 const bars=Array.from({length:8},(_,i)=>[usa+i*H,75+i,90,70,80,1]);
 const args={symbol:'BTCUSD',now:monday+10*H};
 const partial=analyzeMarketSessions({...args,hourly:bars.filter((_,i)=>i!==3)});
 assert.equal(partial.hshReference.hshOpen,75);assert.equal(partial.hshReference.coverage,false);
 const noOpen=analyzeMarketSessions({...args,hourly:bars.slice(1)});
 assert.equal(noOpen.hshReference.hshOpen,null);assert.equal(noOpen.hshReference.open,null);
});

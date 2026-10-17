const {test}=require('node:test');const assert=require('node:assert/strict');
const {buildMarketEntry}=require('./market_entry');
function fixture(){const now=Date.now();return {now,pair:{sessionName:'USA',ohlcv_N:{timestamp:now-3600000,periodEnd:now+10800000,open:100,high:108,low:95,close:105},ohlcv_B:{timestamp:now-86400000,open:99,high:110,low:90,close:100}},compass:{h4:{available:true,jika:'UP'}},cycle:{activeSession:'USA'},quote:{bid:105,ask:105.2,timestamp:now}};}
function run(c){return buildMarketEntry(c.pair,c.compass,c.cycle,c.quote,c.now);}
test('market scenario uses same-session B pivot and preserves own HSH',()=>{const r=run(fixture());assert.equal(r.status,'SCENARIO');assert.ok(Math.abs(r.plan.entryPrice-89.596)<1e-8);assert.ok(Math.abs(r.rs.pivot-99.798)<1e-8);assert.equal(r.hsh.targetPrice,100);});
test('missing data waits',()=>{const c=fixture();c.pair=null;assert.equal(run(c).status,'WAIT');});
test('wrong/expired market waits',()=>{let c=fixture();c.cycle.activeSession='ASIA';assert.equal(run(c).status,'WAIT');c=fixture();c.pair.ohlcv_N.periodEnd=c.now;assert.equal(run(c).status,'WAIT');});
test('opposed H4 waits',()=>{const c=fixture();c.compass.h4.jika='DOWN';assert.equal(run(c).status,'WAIT');});
test('stale quote waits',()=>{const c=fixture();c.quote.timestamp-=11000;assert.equal(run(c).status,'WAIT');});
test('invalid limit price waits',()=>{const c=fixture();c.quote={bid:85,ask:85.2,timestamp:c.now};assert.equal(run(c).status,'WAIT');});
test('neutral market cannot become a sell recommendation',()=>{const c=fixture();c.pair.ohlcv_B.open=100;const r=run(c);assert.equal(r.status,'WAIT');assert.equal(r.plan.action,'WAIT');});

test('WAIT retains full analysis and explains H4 conflict without hiding levels',()=>{const c=fixture();c.compass.h4.jika='DOWN';const r=run(c);assert.equal(r.status,'WAIT');assert.equal(r.analysis.length,7);assert.match(r.analysis[6].text,/berlawanan/);assert.match(r.analysis[4].text,/referensi rencana/);assert.equal(r.phase,'TARGET');});
test('missing data explains unavailable state without invented market values',()=>{const c=fixture();c.pair=null;const r=run(c);assert.equal(r.analysis.length,1);assert.equal(r.current,undefined);});

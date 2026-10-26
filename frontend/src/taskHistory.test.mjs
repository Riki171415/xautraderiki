import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recordTaskHistory,readTaskHistory} from './taskHistory.mjs';
const c={timeframe:'4h',periodStart:0,periodEnd:1000,openN:100,openB:90,lowN:95,highN:105,sup1:90,res1:110,pivot:100};
const sample=(prior,extra={})=>recordTaskHistory(prior,{scope:'EXNESS|XAUUSD',columns:[c],rows:[{timeframe:'4h',pattern:'ANL DWN'}],now:100,...extra});
test('initial OHLC hit gets detection time without claiming sequence',()=>{
 const [r]=sample([]);assert.equal(r.touches.pivot.observedAt,100);assert.equal(r.sequenceStatus,'UNVERIFIED');assert.equal(r.touches.sup1,undefined);
});
test('refresh deduplicates hits and patterns and retains earliest detection',()=>{
 const a=sample([]),b=sample(a,{now:200,columns:[{...c,lowN:85,highN:115}]});
 assert.equal(b.length,1);assert.equal(b[0].touches.pivot.observedAt,100);assert.equal(b[0].touches.sup1.observedAt,200);assert.equal(b[0].touches.res1.observedAt,200);assert.equal(b[0].patterns.length,1);assert.equal(b[0].sequenceStatus,'UNVERIFIED');
 const d=sample(b,{now:300,rows:[{timeframe:'4h',pattern:'NRL UP'}]});assert.equal(d[0].patterns.length,2);
});
test('new period and source have independent records and retain older period',()=>{
 const a=sample([]);assert.equal(sample(a,{scope:'BINANCE|BTC/USDC'}).length,2);
 const b=sample(a,{now:1100,columns:[{...c,periodStart:1000,periodEnd:2000}]});assert.equal(b.length,2);assert.equal(b[0].firstObservedAt,1100);assert.equal(b[1].start,0);
});
test('stale expired missing and invalid data cannot create observations',()=>{
 for(const extra of [{stale:true},{now:1000},{columns:[{...c,lowN:null}]},{columns:[{...c,lowN:120,highN:100}]}])assert.deepEqual(sample([],extra),[]);
});
test('unavailable or corrupt persistence is safe',()=>{
 assert.deepEqual(readTaskHistory({getItem:()=>'{'}),[]);assert.deepEqual(readTaskHistory({getItem:()=>'{"bad":true}'}),[]);assert.deepEqual(readTaskHistory({getItem:()=>{throw Error();}}),[]);
});

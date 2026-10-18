import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadingOrder,referenceSnapshot} from './providerSnapshot.mjs';
import {quoteIsStale,dataQuality} from './analysisState.mjs';
test('selected timeframe cannot change common M1 reference or invent a tick timestamp',()=>{
 const rows=[[1000,90,110,80,100,0,60999]];rows.snapshot={fetchedAt:3000};
 const a=referenceSnapshot({'1m':rows,'1h':[[0,0,0,0,200]]},null,'BINANCE',4000);
 const b=referenceSnapshot({'1m':rows,'4h':[[0,0,0,0,500]]},null,'BINANCE',5000);
 assert.equal(a.price,b.price);assert.equal(a.price,100);assert.equal(a.priceTimestamp,null);
 assert.equal(a.fetchedAt,b.fetchedAt);assert.equal(a.freshness,'UNVERIFIED');
 const data={timestamp:5000,referencePrice:a,requirementsComplete:true};
 assert.equal(quoteIsStale(data,5001),true);assert.equal(dataQuality(data,5001).status,'UNVERIFIED');
});
test('missing reference never falls back to selected timeframe close',()=>{
 assert.equal(referenceSnapshot({'1h':[[0,0,0,0,200]]},null,'BINANCE',5000).price,null);
});
test('source timestamp and completeness govern signals independently of fetch time',()=>{
 const referencePrice={price:100,priceTimestamp:1000,freshness:'FRESH'};
 assert.equal(quoteIsStale({timestamp:99999,referencePrice},50000),true);
 assert.equal(quoteIsStale({timestamp:1000,referencePrice,requirementsComplete:false},1001),true);
 assert.equal(dataQuality({referencePrice,requirementsComplete:false},1001).status,'INCOMPLETE');
 assert.equal(quoteIsStale({referencePrice,requirementsComplete:true},1001),false);
});
test('loading priority deduplicates selected TF and admits daily before remaining frames',()=>{
 assert.deepEqual(loadingOrder('1h').slice(0,4),['1m','4h','1h','1d']);
 assert.equal(loadingOrder('4h').filter(tf=>tf==='4h').length,1);
});

test('expired M1 candle is stale even after a successful new HTTP fetch',()=>{
 const rows=[[0,90,110,80,100,0,59999]];rows.snapshot={fetchedAt:100000};
 const ref=referenceSnapshot({'1m':rows},null,'BINANCE',100001);
 assert.equal(ref.freshness,'STALE');assert.equal(dataQuality({referencePrice:ref,requirementsComplete:true},100001).status,'STALE');
});

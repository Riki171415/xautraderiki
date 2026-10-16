import {test} from 'node:test';
import assert from 'node:assert/strict';
import {findFractals,applyBid,chartCandles} from './chartLogic.mjs';
const bars=[1,2,9,3,2,1].map((high,i)=>({timestamp:1000+i*60000,open:.6,high,low:.4,close:.7}));
test('fractal confirmed only after two right candles close',()=>{
 assert.deepEqual(findFractals(bars.slice(0,5)),[]);
 assert.deepEqual(findFractals(bars),[{index:2,type:'high',price:9}]);
});
test('equal highs do not produce an ambiguous swing',()=>{
 const equal=bars.map(b=>({...b}));equal[3].high=9;assert.deepEqual(findFractals(equal),[]);
});
test('forming candle never becomes a confirmed fractal',()=>{
 const forming=bars.map(b=>({...b}));forming[5].high=99;
 assert.equal(findFractals(forming).some(m=>m.index===5),false);
});
test('Bid updates N without mutating snapshot or closed bars',()=>{
 const tick={bid:3,timestamp:bars[5].timestamp+1000};
 const result=applyBid(bars,tick,tick.timestamp);
 assert.equal(result.at(-1).close,3);assert.equal(result.at(-1).high,3);
 assert.equal(bars.at(-1).close,.7);assert.deepEqual(result.slice(0,-1),bars.slice(0,-1));
});
test('stale ticks and next-period ticks cannot modify old N',()=>{
 assert.equal(applyBid(bars,{bid:3,timestamp:302000},400000),bars);
 assert.equal(applyBid(bars,{bid:3,timestamp:361000},361000),bars);
});
test('reject non-numeric chart rows',()=>assert.deepEqual(chartCandles([[1,2,3,1,2],['bad',2,3,1,2]]),[{timestamp:1,open:2,high:3,low:1,close:2}]));

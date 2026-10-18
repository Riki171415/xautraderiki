import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dailyMarketProgress} from './dailyMarketProgress.mjs';
const base={periodStart:0,periodEnd:200,openN:100,openB:90,closeN:103,highN:105,lowN:89,highB:120,lowB:80,pivot:100,sup1:90,sup2:80,sup3:70,sup4:60,res1:110,res2:120,res3:130,res4:140};
const frames=(daily={},h={},m={})=>[{...base,timeframe:'1d',...daily},{...base,timeframe:'4h',...h},{...base,timeframe:'market',...m}];
test('after bow touch aligned H4 and Market identify the unhit Daily target',()=>{
 const r=dailyMarketProgress(frames(),{now:100});assert.equal(r.daily.progress.bow,'REACHED');assert.equal(r.daily.progress.target,'PENDING');assert.equal(r.phase,'TARGET');assert.equal(r.next.key,'res1');assert.equal(r.next.value,110);assert.ok(r.touched.some(l=>l.key==='sup1'));
});
test('DOWN symmetry identifies S1 target after upper bow touch',()=>{
 const c={openB:110,closeN:97,highN:111,lowN:95};const r=dailyMarketProgress(frames(c,c,c),{now:100});assert.equal(r.daily.progress.bow,'REACHED');assert.equal(r.next.key,'sup1');assert.equal(r.next.value,90);
});
test('both sides touched never establish order and continuation remains conditional',()=>{
 const r=dailyMarketProgress(frames({highN:115}),{now:100});assert.equal(r.both,true);assert.equal(r.sequenceVerified,false);assert.equal(r.next.key,'res2');assert.equal(r.next.name,'Level lanjutan sisi Target');
});
test('conflict missing stale inactive or anomalous input does not choose next task',()=>{
 assert.equal(dailyMarketProgress(frames({},{closeN:95}),{now:100}).phase,'CONFLICT');
 assert.equal(dailyMarketProgress(frames({},{closeN:95}),{now:100}).next,null);
 for(const [columns,options] of [[[],{now:100}],[frames(),{now:100,stale:true}],[frames(),{now:201}],[frames({sup1:101}),{now:100}]])assert.equal(dailyMarketProgress(columns,options).next,null);
});

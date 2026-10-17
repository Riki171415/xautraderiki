import {test} from 'node:test';import assert from 'node:assert/strict';import {twoWayH4} from './twoWayH4.mjs';
const h={timeframe:'4h',periodStart:0,periodEnd:1000,openN:102,openB:100,sup2:80,sup1:90,pivot:100,res1:110,res2:120};
const d={...h,timeframe:'1d',label:'Daily'};
test('both conditional directions use shared H4 levels without mutating active plan',()=>{const cols=[h,d];const a=twoWayH4(cols,105,{now:100});assert.deepEqual(a.map(s=>s.status),['BERSYARAT','BERSYARAT']);assert.equal(a[0].entry,90);assert.equal(a[1].entry,110);assert.equal(a[0].stop,80);assert.equal(a[1].stop,120);assert.ok(a[0].targets.every(t=>t.value>90));assert.ok(a[1].targets.every(t=>t.value<110));assert.equal(h.plan,undefined);});
test('missing, stale and anomalous data hold both scenarios',()=>{assert.ok(twoWayH4([],105,{now:100}).every(s=>s.status==='WAIT'));assert.ok(twoWayH4([h,d],105,{now:100,stale:true}).every(s=>s.entry===null));assert.equal(twoWayH4([{...h,sup2:95},d],105,{now:100})[0].status,'WAIT');});
test('unmatched macro entry never fabricates a conditional order',()=>{assert.ok(twoWayH4([h],105,{now:100}).every(s=>s.status==='WAIT'));});

test('micro movements report real direction, delta and matching independently of conditional entry',()=>{
 const m={...h,timeframe:'5m',label:'M5',openN:94,closeN:93,pivot:90};
 const scenarios=twoWayH4([h,d,m],105,{now:100});const a=scenarios[1].observations.find(m=>m.timeframe==='5m');
 assert.equal(a.direction,'DOWN');assert.equal(a.change,-1);assert.equal(a.toward,'MENUJU');assert.equal(a.target,90);
 assert.equal(scenarios[0].observations.find(m=>m.timeframe==='1m').direction,'WAIT');
 const stale=twoWayH4([h,d,m],105,{now:100,stale:true});assert.ok(stale.every(s=>s.observations.every(m=>m.direction==='WAIT'&&m.change===null)));
 const wait=twoWayH4([h,m],105,{now:100})[0];assert.equal(wait.status,'WAIT');assert.equal(wait.observations.find(m=>m.timeframe==='5m').direction,'DOWN');
});

test('micro destinations require macro confluence and include outer H4 levels, not only entry S1 R1',()=>{
 const outer={...h,res4:150,sup4:50};const macro={timeframe:'1w',label:'Week',periodStart:0,periodEnd:1000,res1:150,sup1:50};
 const small={timeframe:'5m',periodStart:0,periodEnd:1000,openN:100,closeN:110,res2:150,sup2:50};
 const [up,down]=twoWayH4([outer,macro,small],105,{now:100});
 const a=up.observations.find(x=>x.timeframe==='5m');assert.equal(a.anchorKey,'res4');assert.equal(a.target,150);assert.equal(a.level,'res2');assert.equal(a.toward,'MENUJU');assert.equal(a.macroMatches[0].timeframe,'1w');
 const b=down.observations.find(x=>x.timeframe==='5m');assert.equal(b.anchorKey,'sup4');assert.equal(b.toward,'MENJAUH');assert.equal(up.status,'WAIT');
 assert.equal(twoWayH4([outer,small],105,{now:100})[0].observations.find(x=>x.timeframe==='5m').target,null);
});

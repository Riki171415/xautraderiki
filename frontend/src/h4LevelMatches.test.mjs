import {test} from 'node:test';
import assert from 'node:assert/strict';
import {h4LevelMatches,h4MicroMatches} from './h4LevelMatches.mjs';
const h4={timeframe:'4h',res1:'4185',openN:'4170',lowN:'4160',highN:'4180',closeN:'4175',periodStart:0,periodEnd:200};
const day={timeframe:'1d',label:'DAILY',pivot:'4185',openN:'4160',lowN:'4150',highN:'4190',closeN:'4188',periodStart:0,periodEnd:300};
const week={timeframe:'1w',label:'WEEK',sup1:'4185.400',openN:'4200',lowN:'4190',highN:'4220',closeN:'4195',periodStart:0,periodEnd:400};
test('H4 matches exact Daily and reports actual target level status',()=>{const r=h4LevelMatches([h4,day,week],4175,{now:100,move:'UP'});const g=r.groups.find(x=>x.key==='res1');assert.equal(g.matches.length,1);assert.equal(g.matches[0].level,'pivot');assert.equal(g.matches[0].status,'Sudah dilewati');assert.equal(g.toward,'Gerak H4 menuju area');assert.equal(g.distance,10);});
test('near values require explicit tolerance and retain delta',()=>{const r=h4LevelMatches([h4,day,week],4175,{now:100,tolerance:.5});const g=r.groups.find(x=>x.key==='res1');assert.equal(g.count,2);assert.equal(g.matches[1].exact,false);assert.ok(Math.abs(g.matches[1].delta-.4)<1e-8);assert.equal(g.matches[1].status,'Belum tersentuh');});
test('expired Market and missing H4 cannot create targets',()=>{const market={...day,timeframe:'market',periodEnd:99};assert.equal(h4LevelMatches([h4,market],4175,{now:100}).groups.length,0);assert.equal(h4LevelMatches([day],4175,{now:100}).available,false);assert.equal(h4LevelMatches([h4,day],4175,{now:201}).available,false);});
test('same-side motion is descriptive, not a probability',()=>{const g=h4LevelMatches([h4,day],4175,{now:100,move:'DOWN'}).groups[0];assert.equal(g.toward,'Gerak H4 menjauh dari area');assert.equal(g.probability,undefined);});
test('different levels on same timeframe count as one timeframe',()=>{const g=h4LevelMatches([h4,{...day,openN:4185}],4175,{now:100}).groups.find(x=>x.key==='res1');assert.equal(g.count,1);assert.equal(g.matches.length,2);});

test('micro compares all nine H4 levels and HSH without changing macro matches',()=>{
 const keys=['pivot','res1','res2','res3','res4','sup1','sup2','sup3','sup4','openN'];
 const h={...h4,...Object.fromEntries(keys.map((k,i)=>[k,100+i]))};
 const micro={...h,timeframe:'5m',label:'M5',openN:109,closeN:120,lowN:99,highN:120};
 const r=h4MicroMatches([h,micro],99,{now:100});
 assert.equal(r.groups.length,10);assert.equal(r.groups[0].towardCount,1);
 assert.equal(h4LevelMatches([h,micro],99,{now:100}).groups.length,0);
});
test('micro reports direction on both sides, explicit tolerance and expiry',()=>{
 const m={...day,timeframe:'1m',label:'M1',pivot:4185.3,openN:4170,closeN:4178};
 assert.equal(h4MicroMatches([h4,m],4175,{now:100}).groups.some(g=>g.key==='res1'),false);
 let g=h4MicroMatches([h4,m],4175,{now:100,tolerance:.5}).groups.find(g=>g.key==='res1');
 assert.equal(g.matches[0].toward,'MENUJU');
 g=h4MicroMatches([h4,{...m,closeN:4160}],4175,{now:100,tolerance:.5}).groups.find(g=>g.key==='res1');
 assert.equal(g.matches[0].toward,'MENJAUH');
 assert.equal(h4MicroMatches([h4,{...m,periodEnd:99}],4175,{now:100,tolerance:.5}).groups.length,0);
});

test('null or empty levels never create a zero-price confluence',()=>{
 const h={...h4,res1:null,pivot:''},d={...day,res1:null,pivot:''};
 const result=h4LevelMatches([h,d],4175,{now:100});
 assert.ok(result.groups.every(g=>g.value!==0));
});

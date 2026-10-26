import {test} from 'node:test';import assert from 'node:assert/strict';
import {timeframeTask,taskNarrative,taskH4Bridges,TASK_FRAMES} from './timeframeTask.mjs';
const base={periodStart:0,periodEnd:1000,openN:100,openB:90,closeN:95,lowN:85,highN:115,sup1:90,sup2:80,sup3:70,sup4:60,res1:110,res2:120,res3:130,res4:140,pivot:100};
test('both levels touched never proves bow before target, including after crossing Open',()=>{
 for(const closeN of [95,105]){
  const m=timeframeTask({...base,closeN},{now:100});
  assert.equal(m.bow.touched,true);assert.equal(m.target.touched,true);
  assert.equal(m.sequenceStatus,'UNVERIFIED');assert.equal(m.progress.completionVerified,false);
  assert.match(taskNarrative(m,'H4'),/tidak membuktikan urutan/);
 }
});
for(const [timeframe,label] of TASK_FRAMES){
 test(`${label} uses its own JIKA, bow, target, HSH and observed phase`,()=>{
  const col={...base,timeframe};const up=timeframeTask(col,{now:100});assert.equal(up.bow.key,'sup1');assert.equal(up.bow.value,90);assert.equal(up.target.key,'res1');assert.equal(up.open,100);assert.equal(up.phase,'BOW_DIRECTION');assert.equal(up.bow.touched,true);assert.equal(up.target.touched,true);assert.equal(up.bowConfirmed,false);assert.equal(up.transactionVerified,false);assert.equal(up.bow.continuations.length,3);assert.match(taskNarrative(up,label),/searah Busur/);
  const down=timeframeTask({...col,openB:110},{now:100});assert.equal(down.bow.key,'res1');assert.equal(down.target.key,'sup1');assert.equal(down.phase,'TARGET_DIRECTION');
  const neutral=timeframeTask({...col,openB:100},{now:100});assert.equal(neutral.bow,null);assert.equal(neutral.target,null);assert.equal(neutral.open,100);assert.equal(neutral.phase,'UNDETERMINED');
 });
}
test('manual level is additional only; changing it never changes main duties',()=>{
 for(const key of ['sup1','sup4','res2']){const m=timeframeTask(base,{now:100,additionalTarget:key});assert.equal(m.target.key,'res1');assert.equal(m.bow.key,'sup1');assert.equal(m.additional.key,key);}
});
test('missing, expired and stale evidence never fabricates touch or direction',()=>{
 assert.equal(timeframeTask(null,{now:100}).status,'INACTIVE');
 for(const m of [timeframeTask(base,{now:100,stale:true}),timeframeTask(base,{now:1000}),timeframeTask({...base,lowN:null},{now:100})]){assert.equal(m.target.touched,null);assert.equal(m.bow.touched,null);}
 assert.equal(timeframeTask({...base,closeN:null},{now:100}).move,'UNAVAILABLE');assert.equal(timeframeTask({...base,openB:null},{now:100}).target,null);
 assert.equal(timeframeTask({...base,res1:null},{now:100}).status,'INCOMPLETE');
});
test('anomalies preserve names and values and warn rather than swap levels',()=>{const m=timeframeTask({...base,sup1:130,res1:70},{now:100});assert.equal(m.status,'ANOMALY');assert.equal(m.bow.key,'sup1');assert.equal(m.bow.value,130);assert.equal(m.target.value,70);assert.equal(m.warnings.length,2);});
test('H4 bridge retains macro counterpart and micro observed direction',()=>{
 const h={...base,timeframe:'4h',res1:110},d={...base,timeframe:'1d'},m={...base,timeframe:'5m',openN:100,closeN:105,res2:110};
 const bridges=taskH4Bridges([h,d,m],105,'1d',{now:100});const b=bridges.find(g=>g.key==='res1'&&g.match.level==='res1');assert.equal(b.match.value,110);assert.equal(b.microMatches.find(x=>x.level==='res2').toward,'MENUJU');
 assert.equal(taskH4Bridges([h,d,m],105,'1Y',{now:100}).length,0);
});

test('range comparison uses actual same-timeframe N B and does not invent remaining capacity',()=>{
 const m=timeframeTask({...base,highB:120,lowB:80},{now:100});assert.equal(m.range.current,30);assert.equal(m.range.before,40);assert.equal(m.range.expansion,-10);assert.equal(m.range.ratio,.75);assert.equal(m.target.distance,15);assert.equal(m.target.rangeRatio,15/40);assert.equal(m.bow.rangeRatio,5/40);
 const z=timeframeTask({...base,highB:80,lowB:80},{now:100});assert.equal(z.range.ratio,null);assert.equal(z.target.rangeRatio,null);
 const missing=timeframeTask({...base,highB:null,lowB:80},{now:100});assert.equal(missing.range.before,null);assert.equal(missing.target.rangeContext,'UNAVAILABLE');
});

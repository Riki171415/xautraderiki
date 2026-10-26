import {test} from 'node:test';
import assert from 'node:assert/strict';
import {timeframeLevelStrength,dailyLevelStrength,STRENGTH_REFERENCES} from './rvsLimit.mjs';
const now=100,base={periodStart:0,periodEnd:200,highB:120,lowB:80,pivot:100,sup1:95,res1:105};
test('every timeframe uses its declared reference and symmetric support/resistance checks',()=>{
 for(const [tf,ref] of Object.entries(STRENGTH_REFERENCES)){
  const c={...base,timeframe:tf},parent={timeframe:ref,pivot:90,periodStart:0,periodEnd:200};
  const support=timeframeLevelStrength([c,parent],tf,'sup1',{now,price:100});
  assert.equal(support.referenceTf,ref);assert.equal(support.support,true,tf);
  assert.equal(timeframeLevelStrength([c,{...parent,pivot:110}],tf,'res1',{now,price:100}).resistance,true,tf);
  assert.equal(timeframeLevelStrength([c,parent],tf,'res1',{now,price:110}).support,false,'R family not renamed '+tf);
  assert.equal(timeframeLevelStrength([c,parent],tf,'sup1',{now,price:95}).status,'AT');
 }
});
test('absent, expired, stale or equal reference never produces a strong badge',()=>{
 for(const [tf,ref] of Object.entries(STRENGTH_REFERENCES)){
  const c={...base,timeframe:tf},parent={timeframe:ref,pivot:90,periodStart:0,periodEnd:200};
  assert.equal(timeframeLevelStrength([c],tf,'sup1',{now,price:100}).support,false);
  assert.equal(timeframeLevelStrength([c,{...parent,periodEnd:99}],tf,'sup1',{now,price:100}).support,false);
  assert.equal(timeframeLevelStrength([c,parent],tf,'sup1',{now,price:100,stale:true}).support,false);
  assert.equal(timeframeLevelStrength([c,{...parent,pivot:95}],tf,'sup1',{now,price:100}).support,false);
 }
});
test('Year can use an explicit hidden Decade reference without adding a table column',()=>{
 const c={...base,timeframe:'1Y'},decade={timeframe:'10Y',pivot:90,periodStart:0,periodEnd:200};
 assert.equal(timeframeLevelStrength([c],'1Y','sup1',{now,price:100}).valid,false);
 assert.equal(timeframeLevelStrength([c],'1Y','sup1',{now,price:100,referenceColumns:[decade]}).support,true);
});
test('Daily compatibility uses the same Month reference and complete result',()=>{
 const columns=[{...base,timeframe:'1d'},{timeframe:'1M',pivot:90}];
 assert.deepEqual(dailyLevelStrength(columns,'sup1',{now,price:100}),timeframeLevelStrength(columns,'1d','sup1',{now,price:100}));
});

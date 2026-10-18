import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rvsLimit,dailyLevelStrength} from './rvsLimit.mjs';
const base={timeframe:'1d',periodStart:0,periodEnd:200,highB:120,lowB:80,highN:120,lowN:80,pivot:100,sup1:95,res1:105};
test('RVS uses exact Before limits and strict penetration, not touch',()=>{assert.equal(rvsLimit(base,{now:100}).status,'WITHIN');assert.equal(rvsLimit({...base,highN:121},{now:100}).status,'UP');assert.equal(rvsLimit({...base,lowN:79},{now:100}).status,'DOWN');assert.equal(rvsLimit({...base,highN:121,lowN:79},{now:100}).status,'BOTH');});
test('missing stale expired and invalid range never claim break',()=>{for(const [col,opts] of [[base,{now:100,stale:true}],[base,{now:201}],[{...base,highB:null},{now:100}],[{...base,highN:null},{now:100}],[{...base,lowB:130},{now:100}]])assert.equal(rvsLimit(col,opts).up,null);});
test('Daily strength requires both Month pivot and correct Before boundary',()=>{const month={timeframe:'1M',pivot:90};assert.equal(dailyLevelStrength([base,month],'sup1',{now:100,price:100}).support,true);assert.equal(dailyLevelStrength([base,{...month,pivot:110}],'res1',{now:100,price:100}).resistance,true);assert.equal(dailyLevelStrength([base,{...month,pivot:95}],'sup1',{now:100,price:100}).support,false);assert.equal(dailyLevelStrength([base,month],'sup1',{now:100,price:100,stale:true}).support,false);});

test('Daily context cannot label a level above price as strong support',()=>{const columns=[base,{timeframe:'1M',pivot:90}];const above=dailyLevelStrength(columns,'pivot',{now:100,price:99,decimals:2});assert.equal(above.contextSupport,true);assert.equal(above.role,'RESISTANCE');assert.equal(above.support,false);assert.equal(dailyLevelStrength(columns,'pivot',{now:100,price:101}).support,true);assert.equal(dailyLevelStrength(columns,'pivot',{now:100,price:100,decimals:2}).role,'AT');assert.equal(dailyLevelStrength(columns,'pivot',{now:100}).role,'UNVERIFIED');});

test('strength uses displayed precision at Month and Before boundaries',()=>{
 const columns=[{...base,sup1:90.0001},{timeframe:'1M',pivot:90}];
 const reading=dailyLevelStrength(columns,'sup1',{now:100,price:100,decimals:3});
 assert.equal(reading.support,false);assert.equal(reading.checks[0].pass,false);
});
test('expired Month, missing price and flat Before do not produce strong labels',()=>{
 for(const [columns,options] of [
 [[base,{timeframe:'1M',pivot:90,periodStart:0,periodEnd:90}],{now:100,price:110}],
 [[{...base,lowB:120},{timeframe:'1M',pivot:90}],{now:100,price:110}],
 [[base,{timeframe:'1M',pivot:90}],{now:100}],
 ]){const r=dailyLevelStrength(columns,'sup1',options);assert.equal(r.support,false);assert.equal(r.resistance,false);assert.notEqual(r.status,'STRONG');}
});
test('support/resistance flip changes active strength without renaming original level',()=>{
 const cols=[base,{timeframe:'1M',pivot:90}];
 assert.equal(dailyLevelStrength(cols,'sup1',{now:100,price:100}).support,true);
 const below=dailyLevelStrength(cols,'sup1',{now:100,price:94});
 assert.equal(below.role,'RESISTANCE');assert.equal(below.status,'WRONG_SIDE');assert.equal(below.support,false);assert.equal(below.resistance,false);
 const down=[base,{timeframe:'1M',pivot:110}];
 assert.equal(dailyLevelStrength(down,'res1',{now:100,price:100}).resistance,true);
 assert.equal(dailyLevelStrength(down,'res1',{now:100,price:106}).status,'WRONG_SIDE');
});

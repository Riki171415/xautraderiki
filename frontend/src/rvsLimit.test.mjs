import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rvsLimit,dailyLevelStrength} from './rvsLimit.mjs';
const base={timeframe:'1d',periodStart:0,periodEnd:200,highB:120,lowB:80,highN:120,lowN:80,pivot:100,sup1:95,res1:105};
test('RVS uses exact Before limits and strict penetration, not touch',()=>{assert.equal(rvsLimit(base,{now:100}).status,'WITHIN');assert.equal(rvsLimit({...base,highN:121},{now:100}).status,'UP');assert.equal(rvsLimit({...base,lowN:79},{now:100}).status,'DOWN');assert.equal(rvsLimit({...base,highN:121,lowN:79},{now:100}).status,'BOTH');});
test('missing stale expired and invalid range never claim break',()=>{for(const [col,opts] of [[base,{now:100,stale:true}],[base,{now:201}],[{...base,highB:null},{now:100}],[{...base,highN:null},{now:100}],[{...base,lowB:130},{now:100}]])assert.equal(rvsLimit(col,opts).up,null);});
test('Daily strength requires both Month pivot and correct Before boundary',()=>{const month={timeframe:'1M',pivot:90};assert.equal(dailyLevelStrength([base,month],'sup1',{now:100}).support,true);assert.equal(dailyLevelStrength([base,{...month,pivot:110}],'res1',{now:100}).resistance,true);assert.equal(dailyLevelStrength([base,{...month,pivot:95}],'sup1',{now:100}).support,false);assert.equal(dailyLevelStrength([base,month],'sup1',{now:100,stale:true}).support,null);});

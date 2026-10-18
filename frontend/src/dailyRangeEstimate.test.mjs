import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dailyRangeEstimate} from './dailyRangeEstimate.mjs';
const day={timeframe:'1d',periodStart:0,periodEnd:86400000,openN:80000,highB:80500,lowB:79500,pivot:80100,res1:80600,sup1:79400};
const h4={timeframe:'4h',periodStart:0,periodEnd:14400000,highN:80100,lowN:80000,pivot:80050,res1:80700};
test('H4 100 times six projects Open plus/minus 600 and compares Daily B 1000',()=>{const m=dailyRangeEstimate([day,h4],{now:1000});assert.equal(m.available,true);assert.equal(m.projection,600);assert.equal(m.upper,80600);assert.equal(m.lower,79400);assert.equal(m.ratio,.6);assert.equal(m.levels.find(l=>l.timeframe==='1d'&&l.key==='res1').within,true);assert.equal(m.levels.find(l=>l.timeframe==='4h'&&l.key==='res1').within,false);});
test('estimate rejects stale missing ranges and unrelated broker day',()=>{assert.equal(dailyRangeEstimate([day,h4],{now:1000,stale:true}).available,false);assert.equal(dailyRangeEstimate([day,{...h4,highN:null}],{now:1000}).available,false);assert.equal(dailyRangeEstimate([day,{...h4,periodStart:-1000}],{now:1000}).available,false);});

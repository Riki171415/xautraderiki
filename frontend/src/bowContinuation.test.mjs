import {test}from'node:test';import assert from'node:assert/strict';import{bowContinuations}from'./bowContinuation.mjs';
const big={timeframe:'1d',periodStart:0,periodEnd:1000,openN:100,openB:90,closeN:95,lowN:85,highN:105,lowB:80,highB:120,pivot:100,sup1:90,sup2:85,sup3:80,sup4:75,res1:110,res2:115,res3:120,res4:125};
const small={timeframe:'5m',periodStart:0,periodEnd:1000,openN:95,openB:100,closeN:90,lowN:85,highN:101};
test('partial boundary evidence warns, all three required to hold bearish bow scenario',()=>{let a=bowContinuations([big,small],{now:100})[0];assert.equal(a.status,'PERINGATAN');assert.equal(a.levelHit,true);assert.equal(a.beforeBroken,false);
 a=bowContinuations([big,{...small,openB:90,lowN:79}],{now:100})[0];assert.equal(a.checks,3);assert.equal(a.status,'DITAHAN');
 const missing=bowContinuations([{...big,lowB:null},small],{now:100})[0];assert.equal(missing.status,'DATA BELUM LENGKAP');assert.equal(missing.beforeBroken,null);});
test('bullish bow mirrors bearish bounds and stale data never creates opportunity',()=>{const b={...big,openB:110,closeN:105};const s={...small,openN:105,openB:110,closeN:110,lowN:99,highN:126};const a=bowContinuations([b,s],{now:100})[0];assert.equal(a.side,'BUY');assert.equal(a.status,'DITAHAN');assert.equal(a.beforeKey,'highB');assert.deepEqual(bowContinuations([b,s],{now:100,stale:true}),[]);});

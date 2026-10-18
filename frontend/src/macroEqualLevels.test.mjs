import {test} from 'node:test';
import assert from 'node:assert/strict';
import {macroEqualLevels} from './macroEqualLevels.mjs';
const col=(timeframe,levels)=>({timeframe,periodStart:0,periodEnd:200,...levels});
test('all six macro TF may share differently named levels, matches are bidirectional',()=>{
 const cols=[col('1d',{sup1:100}),col('1w',{pivot:100}),col('1M',{res1:100}),col('3M',{sup2:100}),col('6M',{res4:100}),col('1Y',{pivot:100})];
 const m=macroEqualLevels(cols,{now:100,decimals:2});assert.equal(m.size,6);assert.equal(m.get('1d|sup1').length,5);assert.equal(m.get('1Y|pivot').length,5);
});
test('same displayed price is explicit and independent of H4 tolerance',()=>{
 const m=macroEqualLevels([col('1d',{pivot:100.0001}),col('1M',{sup1:100.0002}),col('1Y',{pivot:100.01})],{now:100,decimals:3});
 assert.equal(m.get('1d|pivot')[0].display,'100.000');assert.equal(m.has('1Y|pivot'),false);
});
test('one TF duplicates, H4, missing values and expired periods never create macro matches',()=>{
 const m=macroEqualLevels([col('1d',{pivot:100,res1:100}),col('4h',{pivot:100}),col('1w',{pivot:null}),{...col('1M',{pivot:100}),periodEnd:100},col('1Y',{pivot:''})],{now:100});
 assert.equal(m.size,0);
});
test('missing period and marked unavailable data do not match active levels',()=>{
 assert.equal(macroEqualLevels([col('1d',{pivot:100}),{timeframe:'1M',pivot:100},{...col('1Y',{pivot:100}),unavailable:true}],{now:100}).size,0);
});

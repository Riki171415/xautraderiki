import {test} from 'node:test';import assert from 'node:assert/strict';import {habitWarnings} from './habitWarnings.mjs';
const day={timeframe:'1d',openN:100,openB:90,lowN:95,highN:120,res1:110,sup1:80,periodStart:0,periodEnd:200};const h4={timeframe:'4h',periodStart:0,periodEnd:200};
test('daily touched is context, never a transaction TP',()=>{const r=habitWarnings([day,h4],{},105,{now:100});assert.equal(r.daily.touched,true);assert.match(r.notes[0].text,/bukan bukti TP/);});
test('manual Daily monitor is additional and never replaces the JIKA target',()=>{const r=habitWarnings([day,h4],{},105,{now:100,target:'sup1'});assert.equal(r.daily.touched,true);assert.equal(r.daily.value,110);assert.equal(r.daily.additional.value,80);assert.equal(r.daily.additional.touched,false);});
test('expired or neutral daily yields no automatic task',()=>{assert.equal(habitWarnings([day,h4],{},105,{now:201}).daily,null);assert.equal(habitWarnings([{...day,openB:100},h4],{},105,{now:100}).daily,null);});
test('anomalous Market creates conditional session habit',()=>{const m={timeframe:'market',periodStart:0,periodEnd:200,anomalies:[{lower:'r1',upper:'r2'}]};const r=habitWarnings([day,h4,m],{activeSession:'ASIA'},105,{now:100});assert.match(r.notes[0].text,/R1 Daily 110/);assert.match(r.notes[0].text,/bukan kepastian/);});

test('missing and invalid Daily inputs never become zero-valued targets or false touches',()=>{
 for(const patch of [{res1:null},{highN:null},{lowN:''},{openB:null},{lowN:125,highN:120}])assert.equal(habitWarnings([{...day,...patch},h4],{},105,{now:100}).daily,null);
 assert.equal(habitWarnings([day,h4],{},105,{now:100,target:'openN'}).daily.additional,null);
});
test('Daily observation uses its own period even if H4 is unavailable',()=>{assert.equal(habitWarnings([day],{},105,{now:100}).daily.value,110);});

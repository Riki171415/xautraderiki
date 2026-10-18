import {test} from 'node:test';
import assert from 'node:assert/strict';
import {terminalAnalysis} from './terminalAnalysis.mjs';
import {matrixPlan} from './matrixPlan.mjs';
const h={timeframe:'4h',periodStart:0,periodEnd:1000,openN:101,openB:99,highN:110,lowN:90,closeN:105,res1:110,pivot:100,sup1:90,sup2:80,plan:{action:'BUY LIMIT',stopLoss:80},touchedLevels:{sup1:true,pivot:true}};
const d={...h,timeframe:'1d',res1:90.2,pivot:100.1,sup1:70};
const rows=[h,d].map(c=>({...c,direct:'UP',pattern:'NRM UP',move:'UP',track:'TARGET UP'}));
const args={data:{timestamp:100,symbol:'BTCUSD',broker:{id:'EXNESS'},lotCalc:{lot:.4},userModal:10000},rows,columns:[h,d],selected:'4h',price:105,tolerance:.5,now:100,decimals:3};
test('restored details share exactly the same anchored H4 plan and risk distances',()=>{
 const m=terminalAnalysis(args);assert.deepEqual(m.plan,matrixPlan(h,null,{columns:args.columns,price:105,options:{now:100,tolerance:.5,decimals:3}}));
 assert.equal(m.active,true);assert.equal(m.riskDistance,10);assert.equal(m.targets[0].rewardRisk,1);assert.equal(m.lot,null);
});
test('WAIT retains raw formula levels while suppressing order values',()=>{
 const m=terminalAnalysis({...args,tolerance:0});assert.equal(m.plan.action,'WAIT');assert.equal(m.active,false);assert.equal(m.targets.length,0);assert.equal(m.column.sup1,90);assert.equal(m.column.openN,101);
});
test('micro restoration never enables an independent entry plan',()=>{
 const micro={...h,timeframe:'5m'};const m=terminalAnalysis({...args,rows:[...rows,micro],columns:[...args.columns,micro],selected:'5m'});
 assert.equal(m.plan.observerOnly,true);assert.equal(m.active,false);assert.equal(m.targets.length,0);
});
test('missing weekly context never receives prices from another timeframe',()=>{
 const m=terminalAnalysis({...args,selected:'1w'});assert.equal(m.column,undefined);assert.equal(m.plan.action,'WAIT');assert.equal(m.hsh.open,null);
});
test('weekly context is real W1 but orders still use the H4 anchor',()=>{
 const week={...d,timeframe:'1w'};const m=terminalAnalysis({...args,rows:[...rows,week],columns:[...args.columns,week],selected:'1w'});
 assert.equal(m.column.timeframe,'1w');assert.equal(m.plan.entryPrice,90);assert.equal(m.hsh.open,101);
});
test('touching TP before entry cannot create verified transaction results',()=>{
 const m=terminalAnalysis(args);assert.equal(m.column.touchedLevels.pivot,true);assert.ok(m.warnings.some(w=>w.includes('belum terverifikasi')));assert.equal(m.plan.tp1Observed,undefined);
});
test('expired timeframe, anomaly and stale quotes remain explicit',()=>{
 const m=terminalAnalysis({...args,data:{...args.data,marketDataStatus:'STALE_QUOTE'},columns:[{...h,anomalies:[{lower:'res1',upper:'res2'}]},d],now:1001});
 assert.equal(m.plan.action,'WAIT');assert.equal(m.stale,true);assert.ok(m.warnings.some(w=>w.includes('snapshot')));assert.ok(m.warnings.some(w=>w.includes('anomali')));
});

test('missing timestamp holds orders consistently with shared freshness',()=>{const data={...args.data};delete data.timestamp;const m=terminalAnalysis({...args,data});assert.equal(m.active,false);assert.equal(m.plan.action,'WAIT');});

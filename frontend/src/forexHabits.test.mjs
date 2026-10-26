import test from 'node:test';
import assert from 'node:assert/strict';
import {forexHabitContext,isForexHabitInstrument} from './forexHabits.mjs';
const data={symbol:'XAUUSD',broker:{id:'EXNESS'},marketCycle:{activeSession:'ASIA'}};
const base={periodStart:0,periodEnd:200,openN:100,openB:90,highN:120,lowN:95,res1:110,res2:120,res3:130,res4:140,sup1:80,sup2:70,sup3:60,sup4:50};
const columns=[{...base,timeframe:'1d'},{...base,timeframe:'market',anomalies:[{lower:'r1',upper:'r2'}]}];
test('forex and broker metal suffixes qualify; BTC and Binance do not',()=>{
 for(const symbol of ['XAUUSD','XAUUSDm','EURUSD','GBPUSD.c'])assert.equal(isForexHabitInstrument({...data,symbol}),true);
 for(const symbol of ['BTCUSD','BTCUSDC','PAXGUSDT','EURUSDT'])assert.equal(isForexHabitInstrument({...data,symbol}),false);
 assert.equal(isForexHabitInstrument({...data,broker:{id:'BINANCE'}}),false);
 assert.equal(forexHabitContext({...data,symbol:'BTCUSD'},columns,105,{now:100}),null);
});
test('Market Berbisik maps anomalies symmetrically and according to session',()=>{
 for(const [session,count] of [['ASIA',1],['EROPA',1],['USA',4]]){
  const m=forexHabitContext({...data,marketCycle:{activeSession:session}},columns,105,{now:100});
  assert.equal(m.whisperActive,true);assert.equal(m.targets.length,count);
  assert.ok(m.targets.every(t=>t.label.startsWith('R')));
 }
 const m=forexHabitContext(data,[columns[0],{...columns[1],anomalies:[{lower:'s1',upper:'s2'}]}],105,{now:100});
 assert.deepEqual(m.targets,[{label:'S1 Daily',value:80}]);
});
test('missing, expired, or stale evidence cannot activate a habit target',()=>{
 for(const [cs,opts] of [[columns,{now:201}],[columns,{now:100,stale:true}],[[columns[0]],{now:100}],[[columns[0],{...columns[1],anomalies:[]}],{now:100}]])assert.equal(forexHabitContext(data,cs,105,opts).whisperActive,false);
});

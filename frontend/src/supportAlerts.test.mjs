import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nextSupportAlerts,supportAreas,supportDistance,confirmedSupportSwings,supportZones,supportObservation} from './supportAlerts.mjs';
const start=100000,columns=[{timeframe:'1h',periodStart:0,periodEnd:1000000,sup1:100,lowB:90}];
const step=(state,price,timestamp,extra={})=>nextSupportAlerts(state,{scope:'A',columns,price,timestamp,now:timestamp,distance:1,confirmationMs:0,reboundMultiplier:1,...extra});
const stages=u=>u.events.map(e=>e.stage);
test('approach from above, touch and sampled bounce are separate ordered events',()=>{
 let u=step(null,102,start);assert.deepEqual(stages(u),[]);
 u=step(u.state,100.8,start+1000);assert.deepEqual(stages(u),['NEAR']);
 u=step(u.state,100,start+2000);assert.deepEqual(stages(u),['TOUCH']);
 u=step(u.state,100.4,start+3000);assert.deepEqual(stages(u),[]);
 u=step(u.state,101.2,start+4000);assert.deepEqual(stages(u),['BOUNCE']);
 assert.deepEqual(stages(step(u.state,101.2,start+4000)),[]);
});
test('arrival from below and initial contact never claim verified support touch',()=>{
 let u=step(null,99.5,start);u=step(u.state,100,start+1000);assert.ok(!stages(u).includes('TOUCH'));
 u=step(null,100,start);assert.deepEqual(stages(u),['AREA']);
 u=step(u.state,100.4,start+1000);u=step(u.state,101.2,start+2000);
 assert.deepEqual(stages(u),['REACTION']);assert.equal(Object.values(u.state.levels).find(r=>r.area.value===100).phase,'BOUNCE');
});
test('break invalidates testing and cannot become a bounce on recovery alone',()=>{
 let u=step(null,102,start);u=step(u.state,100,start+1000);u=step(u.state,98,start+2000);
 assert.deepEqual(stages(u),['BREAK']);u=step(u.state,100.5,start+3000);u=step(u.state,101.5,start+4000);
 assert.ok(!stages(u).includes('BOUNCE'));u=step(u.state,100,start+5000);
 assert.equal(Object.values(u.state.levels).find(r=>r.area.value===100).phase,'TESTING');
});
test('stale/gapped source cancels order without repeated area notifications',()=>{
 let u=step(null,102,start);u=step(u.state,100,start+1000);
 u=step(u.state,100,start+12000);assert.ok(!stages(u).includes('TOUCH'));
 u=step(u.state,100,start+13000,{stale:true});assert.equal(u.available,false);
 u=step(u.state,100,start+14000);assert.deepEqual(stages(u),[]);
 assert.equal(supportAreas(columns,1000000).length,0);
 assert.equal(step(null,100,start,{scope:'B'}).state.scope,'B');
});
test('unavailable candles and missing quote time cannot fabricate observations',()=>{
 assert.equal(supportAreas([{...columns[0],unavailable:true}],start).length,0);
 assert.equal(step(null,NaN,start).available,false);
 const data={symbol:'X',broker:{id:'E'},quoteTimestamp:101000,leak4RegMatrix:{currentPrice:'102'}};
 const o=supportObservation(data,{}, {symbol:'X',broker:'E',bid:99,timestamp:100000},101000);
 assert.deepEqual(o,{price:102,timestamp:101000});
 assert.equal(supportDistance('EURUSD',5),.0001);assert.equal(supportDistance('BTCUSD',2),25);
});
test('nearby areas merge without chained expansion',()=>{
 const areas=[100,100.4,100.8].map((value,i)=>({id:String(i),timeframe:'1h',label:'S1',value}));
 const zones=supportZones(areas,1);assert.equal(zones.length,2);assert.equal(zones[0].members.length,2);
});
test('swing low becomes available only after two right-hand candles close',()=>{
 const lows=[103,102,100,102,103,104],rows=lows.map((low,i)=>[i*3600000,105,106,low,105]);
 assert.equal(confirmedSupportSwings(rows,5*3600000-1).length,0);
 const swings=confirmedSupportSwings(rows,5*3600000);assert.equal(swings.length,1);assert.equal(swings[0].availableAt,5*3600000);
 const broken=[...rows,[6*3600000,100,101,97,98]];
 assert.equal(confirmedSupportSwings(broken,7*3600000,1).length,0);
});

test('default confirmation requires sustained recovery, not two quick upticks',()=>{
 const next=(state,price,timestamp)=>nextSupportAlerts(state,{scope:'X',columns,price,timestamp,now:timestamp,distance:1});
 let u=next(null,102,start);u=next(u.state,100,start+1000);
 u=next(u.state,101.5,start+2000);u=next(u.state,102.1,start+3000);assert.ok(!stages(u).includes('BOUNCE'));
 let bounceCount=0;
 for(let j=4;j<=63;j++){u=next(u.state,102.1+j*.01,start+j*1000);bounceCount+=u.events.filter(e=>e.stage==='BOUNCE').length;}
 assert.equal(bounceCount,1);
});

test('wall-clock rerenders cannot confirm a bounce and expired sequences restart',()=>{
 let u=step(null,102,start);u=step(u.state,100,start+1000);
 const first=u.state;
 for(let i=0;i<10;i++)u=nextSupportAlerts(u.state,{scope:'A',columns,price:102,timestamp:start+1000,now:start+1000+i,distance:1});
 assert.equal(u.state.lastTime,first.lastTime);assert.ok(!stages(u).includes('BOUNCE'));
 u=step(u.state,102,start+200000);assert.ok(!stages(u).includes('BOUNCE'));
});

test('future swing confirmations are excluded even when supplied by a caller',()=>{
 const result=step(null,100,start,{areas:[{id:'future',value:100,timeframe:'1h',label:'Swing Low H1',availableAt:start+1}]});
 assert.equal(result.zones.length,0);assert.deepEqual(result.events,[]);
});

test('a new small-timeframe member does not erase the larger-timeframe area identity',()=>{
 const main={id:'daily',value:100,timeframe:'1d',label:'S1'},small={id:'m1-old',value:100.1,timeframe:'1m',label:'S1'};
 const first=supportZones([main,small],1),next=supportZones([main,{...small,id:'m1-new',value:100.2}],1);
 assert.equal(first[0].id,next[0].id);
});

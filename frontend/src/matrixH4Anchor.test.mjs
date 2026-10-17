import {test}from'node:test';import assert from'node:assert/strict';import{matrixPlan,planBadges}from'./matrixPlan.mjs';
test('matrix columns share H4 anchor and only annotate the matching actual row',()=>{
 const h4={timeframe:'4h',periodStart:0,periodEnd:1000,res1:110,pivot:100,sup1:90,sup2:80,plan:{action:'BUY LIMIT',stopLoss:80}};
 const day={timeframe:'1d',label:'DAILY',periodStart:0,periodEnd:1000,res1:90.2,pivot:100.1,sup1:70};
 const context={columns:[h4,day],price:105,options:{tolerance:.5,now:100}};
 const d=matrixPlan(day,null,context),h=matrixPlan(h4,null,context);
 assert.equal(d.entryPrice,h.entryPrice);assert.equal(d.tp1,h.tp1);assert.deepEqual(planBadges(d,'res1'),['BUY LIMIT']);assert.deepEqual(planBadges(d,'sup1'),[]);assert.deepEqual(planBadges(h,'sup2'),['SL']);
});

test('WAIT area labels retain counterpart identity, not the H4 level name',async()=>{
 const {matrixPlan,planBadges}=await import('./matrixPlan.mjs');
 const h={timeframe:'4h',periodStart:0,periodEnd:1000,pivot:100,sup1:90,sup2:80,res4:140,plan:{action:'BUY LIMIT',stopLoss:80}};
 const day={timeframe:'1d',periodStart:0,periodEnd:1000,res1:140,pivot:70};
 const p=matrixPlan(day,null,{columns:[h,day],price:105,options:{now:100}});
 assert.deepEqual(planBadges(p,'res1'),['AREA H4']);
 assert.deepEqual(planBadges(p,'res4'),[]);
});

test('macro ticket remains identical even when selected column has no matching price cell',()=>{
 const h={timeframe:'4h',periodStart:0,periodEnd:1000,sup1:90,sup2:80,pivot:100,res1:110,plan:{action:'BUY LIMIT',stopLoss:80}};
 const d={timeframe:'1d',periodStart:0,periodEnd:1000,res1:90,pivot:100};
 const w={timeframe:'1w',periodStart:0,periodEnd:1000,res1:500,pivot:400};
 const context={columns:[h,d,w],price:105,options:{now:100}};
 const a=matrixPlan(h,null,context),b=matrixPlan(w,null,context);
 for(const key of ['action','entryPrice','tp1','tp2','tp3','stopLoss'])assert.equal(a[key],b[key]);
 assert.equal(b.matchedHere,false);assert.deepEqual(planBadges(b,'res1'),[]);
});

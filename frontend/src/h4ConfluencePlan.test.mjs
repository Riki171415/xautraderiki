import {test}from'node:test';import assert from'node:assert/strict';import{h4ConfluencePlan,confluenceCell}from'./h4ConfluencePlan.mjs';
const c={timeframe:'4h',periodStart:0,periodEnd:1000,res1:110,pivot:100,sup1:90,sup2:80,plan:{action:'BUY LIMIT',stopLoss:80}};
const d={timeframe:'1d',label:'DAILY',periodStart:0,periodEnd:1000,res1:90.2,pivot:100.1,sup1:70};
test('entry and TP require H4 confluence, no independent Daily buy labels',()=>{const p=h4ConfluencePlan([c,d],105,{tolerance:.5,now:100});assert.equal(p.action,'BUY LIMIT');assert.equal(p.areas[1].value,100);assert.equal(confluenceCell(p,d,'res1')[0].role,'BUY LIMIT');assert.equal(confluenceCell(p,d,'sup1').length,0);assert.ok(Math.abs(confluenceCell(p,d,'res1')[0].delta-.2)<1e-9);});
test('no confluence or wrong limit side returns WAIT',()=>{assert.equal(h4ConfluencePlan([c,d],105,{now:100}).action,'WAIT');assert.equal(h4ConfluencePlan([c,d],85,{tolerance:.5,now:100}).action,'WAIT');});
test('SELL chooses descending targets and preserves counterpart row identity',()=>{const h={...c,plan:{action:'SELL LIMIT',stopLoss:120}},day={...d,res1:110,pivot:100,sup1:90};const p=h4ConfluencePlan([h,day],105,{now:100});assert.equal(p.action,'SELL LIMIT');assert.deepEqual(p.areas.filter(a=>a.role.startsWith('TP')).map(a=>a.value),[100,90]);assert.equal(confluenceCell(p,day,'res1')[0].role,'SELL LIMIT');});

test('Pivot or outer H4 matches stay visible even without S1 entry match',()=>{
 const day={...d,res1:140,pivot:100,sup1:70};
 const h={...c,res4:140,sup4:60};
 const p=h4ConfluencePlan([h,day],105,{now:100});
 assert.equal(p.status,'AREAS_AVAILABLE');
 assert.ok(p.attentionAreas.some(g=>g.key==='pivot'));
 assert.ok(p.attentionAreas.some(g=>g.key==='res4'));
 assert.equal(p.entryPrice,undefined);
 assert.equal(confluenceCell(p,day,'res1')[0].role,'AREA H4');
 assert.ok(!p.reason.includes('beli S1'));
});

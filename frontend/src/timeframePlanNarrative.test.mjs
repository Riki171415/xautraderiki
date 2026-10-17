import {test} from 'node:test';import assert from 'node:assert/strict';import {timeframePlanMarkers} from './timeframePlanNarrative.mjs';import {h4ConfluencePlan,confluenceCell} from './h4ConfluencePlan.mjs';
test('Daily narrative reproduces exact table roles and counterpart values including TP1',()=>{
 const h={timeframe:'4h',periodStart:0,periodEnd:1000,sup1:90,sup2:80,pivot:100,res1:110,plan:{action:'BUY LIMIT',stopLoss:80}};
 const d={timeframe:'1d',periodStart:0,periodEnd:1000,res1:90.2,sup1:100.2};const cols=[h,d],opts={now:100,tolerance:.5};
 const plan=h4ConfluencePlan(cols,105,opts),markers=timeframePlanMarkers(cols,105,'1d',opts);
 assert.equal(markers.find(m=>m.role==='TP1').value,100.2);assert.equal(markers.find(m=>m.role==='TP1').anchor,100);
 for(const m of markers)assert.ok(confluenceCell(plan,d,m.key).some(b=>b.role===m.role&&b.anchor===m.anchor));
 assert.ok(timeframePlanMarkers(cols,105,'1d',{...opts,stale:true}).every(m=>m.role==='AREA H4'));
});

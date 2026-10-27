import test from 'node:test';
import assert from 'node:assert/strict';
import {allowMarketNotice} from './marketNoticePolicy.mjs';
const minute=60000;
test('reference plans and important cancellations share cooldown and semantic deduplication',()=>{
 const ref={current:null};
 assert.equal(allowMarketNotice(ref,'a','reference',{status:'WAIT_DATA',key:'x'},0),false);
 assert.equal(allowMarketNotice(ref,'a','reference',{status:'PLAN_VALID',key:'x'},0),true);
 assert.equal(allowMarketNotice(ref,'a','reference',{status:'PLAN_VALID',key:'x'},6*minute),false);
 assert.equal(allowMarketNotice(ref,'a','reference',{status:'INVALIDATED',key:'x'},7*minute),true);
 assert.equal(allowMarketNotice(ref,'a','reference',{status:'STRONG',key:'y'},8*minute),false);
});
test('routine observations never interrupt the user',()=>{
 const ref={current:null};
 for(let n=0;n<60;n++)for(const stage of ['NEAR','TOUCH','AREA','REACTION'])assert.equal(allowMarketNotice(ref,'a','support',{stage,id:n},n*minute),false);
 for(const type of ['AT','NEAR'])assert.equal(allowMarketNotice(ref,'a','h4',{type},0),false);
});
test('all automatic event types share five minutes and suppressed events are consumed',()=>{
 const ref={current:null},bounce={stage:'BOUNCE',id:'daily:S1'},cross={type:'CROSSED',key:'s1',value:4111,direction:'DOWN'};
 assert.equal(allowMarketNotice(ref,'a','support',bounce,0),true);
 assert.equal(allowMarketNotice(ref,'a','h4',cross,minute),false);
 assert.equal(allowMarketNotice(ref,'a','h4',cross,6*minute),false);
 assert.equal(allowMarketNotice(ref,'a','support',{stage:'BREAK',id:'daily:S1'},6*minute),true);
});
test('small candle rollovers and micro timeframe changes cannot repeat a strong popup',()=>{
 const ref={current:null},signal={strong:true,side:'BUY',warnings:[],target:{timeframe:'1d',h4Key:'r1',level:'pivot',value:4200}};
 assert.equal(allowMarketNotice(ref,'a','strong',{...signal,timeframe:'1m',periodStart:0},0),true);
 for(let n=1;n<30;n++)assert.equal(allowMarketNotice(ref,'a','strong',{...signal,timeframe:'5m',periodStart:n*minute},n*minute),false);
 assert.equal(allowMarketNotice(ref,'a','strong',{...signal,warnings:['conflict']},31*minute),false);
 assert.equal(allowMarketNotice(ref,'b','strong',signal,31*minute),true);
});
test('isolated repeated event can notify again after thirty minutes',()=>{
 const ref={current:null},event={stage:'BOUNCE',id:'H4:S1'};
 assert.equal(allowMarketNotice(ref,'a','support',event,0),true);
 assert.equal(allowMarketNotice(ref,'a','support',event,30*minute),true);
});
test('unchanged support level does not repeat when its candle identity rolls over',()=>{
 const ref={current:null},members=[{timeframe:'1m',label:'S1',value:4111}];
 assert.equal(allowMarketNotice(ref,'a','support',{stage:'BOUNCE',id:'1m|old',members},0),true);
 assert.equal(allowMarketNotice(ref,'a','support',{stage:'BOUNCE',id:'1m|new',members},6*minute),false);
});

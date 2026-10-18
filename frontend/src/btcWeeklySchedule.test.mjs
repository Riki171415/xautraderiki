import {test} from 'node:test';
import assert from 'node:assert/strict';
import {btcWeeklySchedule} from './btcWeeklySchedule.mjs';
import {taskHierarchy} from './taskHierarchy.mjs';
const D=86400000,start=Date.UTC(2026,9,12,2),week={timeframe:'1w',periodStart:start,periodEnd:start+7*D,openN:100,openB:90,closeN:95,lowN:90,highN:110,sup1:90,res1:110};
test('BTC weekly splits at exactly broker start plus 84 hours',()=>{for(const symbol of ['BTCUSD','BTCUSDc','BTC/USD','BTC/USDC']){const a=btcWeeklySchedule(week,{symbol,now:start+3.5*D-1}),b=btcWeeklySchedule(week,{symbol,now:start+3.5*D});assert.equal(a.phase,'BOW_DIRECTION');assert.equal(b.phase,'TARGET_DIRECTION');assert.equal(a.midpoint,start+84*3600000);assert.equal(a.bowDays,3.5);}});
test('BTC weekend remains target time and forex schedule remains untouched',()=>{assert.equal(btcWeeklySchedule(week,{symbol:'BTCUSD',now:start+6*D}).phase,'TARGET_DIRECTION');for(const symbol of ['XAUUSD','EURUSD','GBPUSDc','PAXG/USDT'])assert.equal(btcWeeklySchedule(week,{symbol,now:start}),null);});
test('missing expired or nonseven-day Weekly cannot invent a schedule',()=>{for(const c of [null,{...week,periodEnd:start+5*D},{...week,periodStart:undefined}])assert.equal(btcWeeklySchedule(c,{symbol:'BTCUSD',now:start}).available,false);assert.equal(btcWeeklySchedule(week,{symbol:'BTCUSD',now:week.periodEnd}).available,false);});
test('time phase never overwrites price bow phase',()=>{const h=taskHierarchy([week],'1w',{symbol:'BTCUSD',now:start+6*D});assert.equal(h.weeklySchedule.phase,'TARGET_DIRECTION');assert.equal(h.model.phase,'BOW_DIRECTION');});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {quoteIsStale,scopedTick} from './analysisState.mjs';
import {instrumentTolerance} from './instrumentTolerance.mjs';
test('freshness rejects missing old future and server-stale snapshots',()=>{assert.equal(quoteIsStale({timestamp:1000},1001),false);for(const data of [{},{timestamp:0},{timestamp:60000},{timestamp:50000,marketDataStatus:'STALE_QUOTE'}])assert.equal(quoteIsStale(data,50000),true);});
test('forex has independent price tolerance and tick scope',()=>{for(const symbol of ['EURUSD','GBPUSD','EURUSDc','GBPUSDc'])assert.ok(instrumentTolerance(symbol).values.every(v=>v<=.001));const data={symbol:'EURUSD',broker:{id:'EXNESS'}};assert.equal(scopedTick(data,{symbol:'GBPUSD',broker:'EXNESS',bid:1.2}),null);assert.equal(scopedTick(data,{symbol:'EURUSD',broker:'BINANCE',bid:1.2}),null);assert.equal(scopedTick(data,{symbol:'EURUSD',broker:'EXNESS',bid:1.2}).bid,1.2);});

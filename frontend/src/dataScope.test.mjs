import {test} from 'node:test';
import assert from 'node:assert/strict';
import {matchesScope,newestScopedAnalysis} from './dataScope.mjs';
const x={symbol:'XAUUSD',timeframe:'4h',broker:{id:'EXNESS'},timestamp:100,ohlcv_N:{close:4167}};
const btc={...x,symbol:'BTCUSD',timestamp:90,ohlcv_N:{close:81500}};
test('newer XAU snapshot never wins a BTC screen',()=>{assert.equal(newestScopedAnalysis(x,btc,'BTCUSD','4h','EXNESS'),btc);});
test('switching either asset, source, or timeframe suppresses previous data',()=>{
 assert.equal(newestScopedAnalysis(x,x,'BTCUSD','4h','EXNESS'),null);
 assert.equal(matchesScope(x,'XAUUSD','1d','EXNESS'),false);
 assert.equal(matchesScope(x,'XAUUSD','4h','BINANCE'),false);
 assert.equal(matchesScope({...x,broker:null},'XAUUSD','4h','EXNESS'),false);
});
test('latest snapshot selected only within the exact scope',()=>{const newer={...btc,timestamp:101};assert.equal(newestScopedAnalysis(newer,btc,'BTCUSD','4h','EXNESS'),newer);});

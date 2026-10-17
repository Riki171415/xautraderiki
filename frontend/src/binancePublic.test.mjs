import {test} from 'node:test';
import assert from 'node:assert/strict';
import {binanceSymbol,parseKlines,binanceCandles} from './binancePublic.mjs';
test('fallback never labels XAUUSD as Binance',()=>{assert.throws(()=>binanceSymbol('XAUUSD'));assert.equal(binanceSymbol('PAXG/USDT'),'PAXGUSDT');assert.equal(binanceSymbol('XAUT/USDT'),'XAUTUSDT');});
test('reject invalid and unordered candles',()=>{const row=[1,'100','110','90','105','12',99];assert.equal(parseKlines([row,[100,105,115,95,110,10,199]]).length,2);assert.throws(()=>parseKlines([row,row]));assert.throws(()=>parseKlines([row,[100,105,90,95,110,10,199]]));});
test('unsupported timeframe is not replaced by H1',async()=>{await assert.rejects(binanceCandles('PAXG/USDT','10Y'),/belum tersedia/);});

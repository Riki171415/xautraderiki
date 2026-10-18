const {test}=require('node:test');
const assert=require('node:assert/strict');
const {exnessSymbolKey}=require('./exness_symbols');
test('Exness suffixes resolve independently for gold Bitcoin and both forex pairs',()=>{for(const base of ['XAUUSD','BTCUSD','EURUSD','GBPUSD'])for(const suffix of ['','c','m'])assert.equal(exnessSymbolKey(base+suffix),base);assert.notEqual(exnessSymbolKey('EURUSDc'),exnessSymbolKey('GBPUSDc'));});
test('unsupported pairs and crypto USDC are never silently relabeled as forex',()=>{for(const name of ['BTC/USDC','EUR/USDC','EUUSDC','GBPUSDT','USDJPYc',null])assert.equal(exnessSymbolKey(name),null);});

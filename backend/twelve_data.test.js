const {test}=require('node:test');const assert=require('node:assert/strict');const {parseTwelve,twelveRows}=require('./twelve_data');
const sample=()=>({meta:{symbol:'XAU/USD',timezone:'UTC',interval:'4h'},values:[{datetime:'2026-10-16 04:00:00',open:'100',high:'110',low:'90',close:'105'},{datetime:'2026-10-16 00:00:00',open:'99',high:'109',low:'89',close:'100'}]});
test('Twelve timestamps and OHLC mapped into shared candle format',()=>{const r=parseTwelve(sample(),'4h');assert.equal(r[0][0],Date.UTC(2026,9,16));assert.equal(r[0][6],r[0][0]+14400000-1);assert.equal(r[0][5],0);});
test('wrong symbol, timezone, interval and malformed OHLC rejected',()=>{for(const [k,v]of [['symbol','PAXG/USDT'],['timezone','Australia/Sydney'],['interval','1h']]){const j=sample();j.meta[k]=v;assert.throws(()=>parseTwelve(j,'4h'));}const j=sample();j.values[0].high='95';assert.throws(()=>parseTwelve(j,'4h'));});
test('missing secret fails clearly without a network call',async()=>{await assert.rejects(twelveRows('1h',{key:'',fetcher:()=>{throw Error('must not call');}}),/TWELVEDATA_API_KEY/);});
test('provider rejection is not converted to synthetic candles',()=>{assert.throws(()=>parseTwelve({status:'error',message:'Quota exceeded'},'4h'),/Quota/);});

test('missing precious-metal timezone accepted only for an explicitly UTC request',()=>{const j=sample();delete j.meta.timezone;assert.throws(()=>parseTwelve(j,'4h'));assert.equal(parseTwelve(j,'4h',{requestedTimezone:'UTC'})[0][0],Date.UTC(2026,9,16));j.meta.timezone='Australia/Sydney';assert.throws(()=>parseTwelve(j,'4h',{requestedTimezone:'UTC'}));});

 test('all four symbols validate against their own instrument',()=>{
  for(const [symbol,label] of Object.entries(require('./twelve_data').SYMBOLS)){
   const j=sample();j.meta.symbol=label;
   assert.equal(parseTwelve(j,'4h',{symbol}).length,2);
   if(symbol!=='XAUUSD')assert.throws(()=>parseTwelve(j,'4h',{symbol:'XAUUSD'}));
  }
 });
 test('cache and pending requests stay separate per instrument',async()=>{
  const calls=[];const symbols=require('./twelve_data').SYMBOLS;
  const fetcher=async url=>{const q=new URL(url).searchParams;calls.push(q.get('symbol'));const j=sample();j.meta.symbol=q.get('symbol');return {ok:true,json:async()=>j};};
  await Promise.all(['BTCUSD','EURUSD','GBPUSD'].map(symbol=>twelveRows('4h',{symbol,key:'test',fetcher})));
  assert.deepEqual(calls.sort(),['BTC/USD','EUR/USD','GBP/USD']);
  await twelveRows('4h',{symbol:'BTCUSD',key:'test',fetcher});assert.equal(calls.length,3);
  await assert.rejects(twelveRows('4h',{symbol:'AAPL',key:'test',fetcher}),/tidak didukung/);
 });

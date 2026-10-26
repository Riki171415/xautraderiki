const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validCandles,getExnessCandles,aggregateMonths}=require('./mt5_data');
const {calcHukumHSH,calcLeak4RegMatrix}=require('./rule_engine');
const rows=[[Date.UTC(2025,0,1),100,120,90,110,10],[Date.UTC(2025,1,1),110,140,100,130,20],[Date.UTC(2025,3,1),130,150,120,140,30]];
test('calendar aggregation preserves Exness OHLC and volume',()=>assert.deepEqual(aggregateMonths(rows,3),[[Date.UTC(2025,0,1),100,140,90,130,30],rows[2]]));
test('timeframe never replaced with H1 or another feed',()=>{
 const state={connected:true,lastTickTime:1000,timeframes:{'1h':{candles:rows,updatedAt:1000}}};
 assert.deepEqual(getExnessCandles(state,'1h',1001),rows);
 assert.throws(()=>getExnessCandles(state,'4h',1001),/belum tersedia/);
 assert.throws(()=>getExnessCandles(state,'1h',12000),/tidak aktif/);
});
test('invalid and unordered candles rejected',()=>{
 assert.equal(validCandles(rows),true);
 assert.equal(validCandles([...rows].reverse()),false);
 assert.equal(validCandles([[1,100,90,80,100,1],[2,100,120,90,110,1]]),false);
});

const dailyRow=(day,open)=>[Date.UTC(2026,9,day),open,open+10,open-10,open+1,10];
const weekendRows=[dailyRow(22,4125),dailyRow(23,4023),dailyRow(25,3999),dailyRow(26,3997)];
const dailyState=(symbol,rows=weekendRows)=>({symbol,connected:true,lastTickTime:1000,timeframes:{'1d':{updatedAt:1000,candles:rows}}});
test('Monday forex Daily Before selects actual Friday OHLC, not a Sunday stub',()=>{
 for(const symbol of ['XAUUSDc','XAUUSD','EURUSDm','GBPUSD']){
  const s=dailyState(symbol),raw=JSON.stringify(s.timeframes['1d'].candles);
  const result=getExnessCandles(s,'1d',1001);
  assert.deepEqual(result.at(-1),weekendRows.at(-1));
  assert.deepEqual(result.at(-2),weekendRows[1]);
  assert.equal(JSON.stringify(s.timeframes['1d'].candles),raw,'raw MT5 history remains intact');
 }
});
test('BTC retains Sunday as Monday Daily Before',()=>{
 assert.deepEqual(getExnessCandles(dailyState('BTCUSDc'),'1d',1001),weekendRows);
});
test('latest Sunday candle remains N while its forex Before is Friday',()=>{
 const rows=weekendRows.slice(0,-1),result=getExnessCandles(dailyState('XAUUSDc',rows),'1d',1001);
 assert.deepEqual(result.at(-1),rows.at(-1));assert.deepEqual(result.at(-2),rows[1]);
});
test('weekday gaps use previous available trading candle; missing comparison is rejected',()=>{
 const holiday=[dailyRow(22,4125),dailyRow(25,3999),dailyRow(26,3997)];
 assert.deepEqual(getExnessCandles(dailyState('XAUUSDc',holiday),'1d',1001).at(-2),holiday[0]);
 assert.throws(()=>getExnessCandles(dailyState('EURUSD',[dailyRow(25,3999),dailyRow(26,3997)]),'1d',1001),/belum cukup/);
 const tuesday=[...weekendRows,dailyRow(27,4010)];
 assert.deepEqual(getExnessCandles(dailyState('XAUUSDc',tuesday),'1d',1001).at(-2),weekendRows.at(-1));
});
test('Saturday forex stub is skipped as Before, and H4 selection stays unchanged',()=>{
 const rows=[dailyRow(23,4023),dailyRow(24,4000),dailyRow(25,3999),dailyRow(26,3997)];
 assert.deepEqual(getExnessCandles(dailyState('XAUUSDc',rows),'1d',1001).at(-2),rows[0]);
 const s=dailyState('XAUUSDc',rows);s.timeframes['4h']=s.timeframes['1d'];
 assert.deepEqual(getExnessCandles(s,'4h',1001),rows);
});
test('missing matrix timeframes omitted, never cloned from H1',()=>{
 const n={open:110,high:140,low:100,close:130}; const b={open:100,high:120,low:90,close:110};
 const matrix=calcLeak4RegMatrix({'1h':{ohlcv_N:n,ohlcv_B:b}},130);
 assert.deepEqual(matrix.tableRows.map(r=>r.timeframe),['1h']);
});
test('HSH target is Open N',()=>{
 const result=calcHukumHSH({open:100,high:140,low:90,close:130},3600000,0,60000,'NRL UP');
 assert.equal(result.targetType,'OPEN_N'); assert.equal(result.targetPrice,100); assert.equal(result.hshActive,true);
});

test('decade aggregation uses 2021–2030 calendar and rejects missing initial history',()=>{
 const {aggregateDecades}=require('./mt5_data');
 const rows=Array.from({length:240},(_,i)=>[Date.UTC(2011,i,1),100,120,90,110,1]);
 const result=aggregateDecades(rows);assert.equal(result.length,2);assert.equal(result[0][0],Date.UTC(2011,0,1));assert.equal(result[1][0],Date.UTC(2021,0,1));assert.equal(result[0][5],120);
 assert.equal(aggregateDecades(rows.slice(10)).length,1);
});

test('authorized partial decade B uses actual earliest prior open, never invented calendar timestamp',()=>{
 const {aggregateDecades}=require('./mt5_data');
 const rows=Array.from({length:120},(_,i)=>[Date.UTC(2016,10+i,1),100+i,250+i,90+i,110+i,1]);
 const result=aggregateDecades(rows,true);
 assert.equal(result.length,2);assert.equal(result[0][0],Date.UTC(2016,10,1));assert.equal(result[0][1],100);assert.equal(result[1][0],Date.UTC(2021,0,1));
});

test('monthly gap blocks year/quarter aggregation',()=>{
 const {getExnessCandles}=require('./mt5_data');
 const rows=[[Date.UTC(2025,0,1),100,120,90,110,1],[Date.UTC(2025,2,1),100,120,90,110,1]];
 assert.throws(()=>getExnessCandles({connected:true,lastTickTime:1000,timeframes:{'1M':{candles:rows,updatedAt:1000}}},'1Y',1001),/bulan hilang/);
});

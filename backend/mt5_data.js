// Exness data stays separate from exchange data, keyed by timeframe.
const DIRECT_TIMEFRAMES = ['1m','5m','15m','30m','1h','4h','1d','1w','1M'];
function validCandles(rows) {
  return Array.isArray(rows) && rows.length >= 2 && rows.every((r,i) =>
    Array.isArray(r) && r.length >= 6 && r.every(Number.isFinite) && r[0] > 0 &&
    r[1] > 0 && r[2] >= Math.max(r[1],r[4]) && r[3] <= Math.min(r[1],r[4]) &&
    r[3] > 0 && r[5] >= 0 && (!i || rows[i-1][0] < r[0]));
}
function aggregateMonths(rows, months) {
  const groups = new Map();
  for (const row of rows) {
    const d = new Date(row[0]);
    const start = Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth()/months)*months, 1);
    if (!groups.has(start)) groups.set(start,[start,...row.slice(1)]);
    else {
      const g = groups.get(start);
      g[2] = Math.max(g[2],row[2]); g[3] = Math.min(g[3],row[3]); g[4] = row[4]; g[5] += row[5];
    }
  }
  // An initial partial calendar period must not become a misleading previous candle.
  const result = [...groups.values()];
  if (result.length && new Date(rows[0][0]).getUTCMonth() % months !== 0) result.shift();
  return result;
}
function aggregateDecades(rows, allowPartial = false) {
  // COP TAH calendar: 2011–2020, 2021–2030, ...; partial history is never a full decade.
  const groups=new Map();
  for(const r of rows) {
    const d=new Date(r[0]),year=Math.floor((d.getUTCFullYear()-1)/10)*10+1;
    if(!groups.has(year)) groups.set(year,[]);
    groups.get(year).push(r);
  }
  const output=[];
  for(const [year,bars] of groups) {
    const first=new Date(bars[0][0]);
    const offset=(first.getUTCFullYear()-year)*12+first.getUTCMonth();
    if(offset && !allowPartial) continue;
    if(bars.some((r,i)=>r[0]!==Date.UTC(year,offset+i,1))) continue;
    output.push([bars[0][0],bars[0][1],Math.max(...bars.map(r=>r[2])),Math.min(...bars.map(r=>r[3])),bars.at(-1)[4],bars.reduce((s,r)=>s+r[5],0)]);
  }
  return output;
}
function getExnessCandles(state, timeframe, now = Date.now()) {
  if (!state.connected || now - state.lastTickTime >= 10000) throw new Error('Bridge MT5 Exness tidak aktif. Tidak memakai data pengganti.');
  const aggregate = {'3M':3,'6M':6,'1Y':12,'10Y':120}[timeframe];
  const key = aggregate ? '1M' : timeframe;
  const snapshot = state.timeframes?.[key];
  if (!snapshot || now - snapshot.updatedAt >= 15000 || !validCandles(snapshot.candles))
    throw new Error(`Data Exness ${timeframe} belum tersedia atau kedaluwarsa.`);
  if (aggregate) {
    const candles=snapshot.candles;
    for(let i=1;i<candles.length;i++) {
      const d=new Date(candles[i-1][0]);
      if(candles[i][0]!==Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1))
        throw new Error('Riwayat MN1 memiliki bulan hilang; agregasi ditahan.');
    }
  }
  const rows = timeframe==='10Y'?aggregateDecades(snapshot.candles,true):aggregate ? aggregateMonths(snapshot.candles,aggregate) : snapshot.candles;
  if (rows.length < 2) throw new Error(`Riwayat Exness ${timeframe} belum cukup untuk N dan B.`);
  return rows;
}
module.exports = {aggregateDecades,DIRECT_TIMEFRAMES,validCandles,aggregateMonths,getExnessCandles};

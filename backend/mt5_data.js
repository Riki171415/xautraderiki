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
function getExnessCandles(state, timeframe, now = Date.now()) {
  if (!state.connected || now - state.lastTickTime >= 10000) throw new Error('Bridge MT5 Exness tidak aktif. Tidak memakai data pengganti.');
  const aggregate = {'3M':3,'6M':6,'1Y':12}[timeframe];
  const key = aggregate ? '1M' : timeframe;
  const snapshot = state.timeframes?.[key];
  if (!snapshot || now - snapshot.updatedAt >= 15000 || !validCandles(snapshot.candles))
    throw new Error(`Data Exness ${timeframe} belum tersedia atau kedaluwarsa.`);
  const rows = aggregate ? aggregateMonths(snapshot.candles,aggregate) : snapshot.candles;
  if (rows.length < 2) throw new Error(`Riwayat Exness ${timeframe} belum cukup untuk N dan B.`);
  return rows;
}
module.exports = {DIRECT_TIMEFRAMES,validCandles,aggregateMonths,getExnessCandles};

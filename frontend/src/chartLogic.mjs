export function findFractals(candles) {
  const markers = [];
  // Only closed bars can confirm a five-bar swing; the last bar is still forming.
  for (let i = 2; i + 2 < candles.length - 1; i++) {
    const c = candles[i];
    const neighbors = [candles[i-2], candles[i-1], candles[i+1], candles[i+2]];
    if (neighbors.every(n => c.high > n.high)) markers.push({index:i, type:'high', price:c.high});
    if (neighbors.every(n => c.low < n.low)) markers.push({index:i, type:'low', price:c.low});
  }
  return markers;
}
export function chartCandles(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter(r => Array.isArray(r) && r.length >= 5 && r.slice(0,5).every(Number.isFinite))
    .map(([timestamp,open,high,low,close])=>({timestamp,open,high,low,close}));
}
export function applyBid(candles, tick, now = Date.now()) {
  if (!candles.length || !Number.isFinite(tick?.bid) || now - tick.timestamp > 10000) return candles;
  // Never create a new candle from a tick; its broker period must arrive from MT5.
  const last = candles[candles.length-1];
  const previous = candles[candles.length-2];
  const span = previous ? last.timestamp - previous.timestamp : 0;
  if (!span || tick.timestamp >= last.timestamp + span) return candles;
  return [...candles.slice(0,-1), {...last, high:Math.max(last.high,tick.bid), low:Math.min(last.low,tick.bid),close:tick.bid}];
}

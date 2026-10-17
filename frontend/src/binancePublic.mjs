const BASE='https://data-api.binance.vision/api/v3';
const allowed=new Set(['1m','5m','15m','30m','1h','4h','1d','1w','1M']);
const cache=new Map();
export function binanceSymbol(symbol) {
 if(!['PAXG/USDT','XAUT/USDT'].includes(symbol)) throw new Error('Fallback Binance hanya untuk PAXG/USDT atau XAUT/USDT.');
 return symbol.replace('/','');
}
export function parseKlines(raw) {
 if(!Array.isArray(raw)||raw.length<2) throw new Error('Riwayat Binance belum cukup.');
 const rows=raw.map(r=>r.slice(0,7).map(Number));
 if(rows.some((r,i)=>r.length<7||!r.every(Number.isFinite)||r[0]>=r[6]||r[1]<=0||r[3]>Math.min(r[1],r[4])||r[2]<Math.max(r[1],r[4])||r[2]<r[3]||(i&&r[0]<=rows[i-1][0]))) throw new Error('Candle Binance tidak valid.');
 return rows;
}
export async function publicJson(path,params={},signal) {
 const controller=new AbortController();
 const abort=()=>controller.abort();
 if(signal?.aborted)throw new DOMException('Aborted','AbortError');
 signal?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(abort,12000);
 try {
  const res=await fetch(`${BASE}/${path}?${new URLSearchParams(params)}`,{signal:controller.signal});
  if(!res.ok)throw new Error(`Binance tidak dapat diakses (HTTP ${res.status}).`);
  const json=await res.json();if(json.code<0)throw new Error(json.msg);return json;
 } finally {clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export async function binanceCandles(symbol,timeframe,signal) {
 if(!allowed.has(timeframe))throw new Error('Periode ini belum tersedia pada fallback Binance.');
 const key=`${symbol}|${timeframe}`,previous=cache.get(key);
 if(previous&&Date.now()-previous.time<5000)return previous.rows;
 const rows=parseKlines(await publicJson('klines',{symbol:binanceSymbol(symbol),interval:timeframe,limit:timeframe==='1M'?120:300},signal));
 const last=rows[rows.length-1];
 if(last[6]<Date.now()-60000)throw new Error('Candle Binance sudah kedaluwarsa.');
 cache.set(key,{time:Date.now(),rows});return rows;
}

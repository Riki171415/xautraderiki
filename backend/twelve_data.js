const SYMBOLS={XAUUSD:'XAU/USD',BTCUSD:'BTC/USD',EURUSD:'EUR/USD',GBPUSD:'GBP/USD'};
const INTERVALS={'1m':'1min','5m':'5min','15m':'15min','30m':'30min','1h':'1h','4h':'4h','1d':'1day','1w':'1week','1M':'1month'};
const cache=new Map(),pending=new Map();
function parseTwelve(json,tf,{requestedTimezone,symbol='XAUUSD'}={}){
 if(json.status==='error')throw new Error(json.message||'Twelve Data menolak permintaan.');
 if(json.meta?.symbol!==SYMBOLS[symbol])throw new Error('Instrumen Twelve Data tidak sesuai permintaan.');
 if(!['UTC','Etc/UTC','GMT'].includes(json.meta?.timezone)&&!(json.meta?.timezone==null&&requestedTimezone==='UTC'))throw new Error('Zona waktu respons Twelve Data belum dapat dipetakan dengan aman.');
 if(json.meta?.interval!==INTERVALS[tf])throw new Error('Interval Twelve Data tidak sesuai.');
 if(!Array.isArray(json.values)||json.values.length<2)throw new Error('Riwayat Twelve Data belum cukup.');
 const rows=json.values.map(v=>{const t=Date.parse(v.datetime.replace(' ','T')+(v.datetime.includes('T')&&v.datetime.endsWith('Z')?'':'Z'));return [t,Number(v.open),Number(v.high),Number(v.low),Number(v.close),v.volume==null?0:Number(v.volume)];}).sort((a,b)=>a[0]-b[0]);
 const step={'1m':60000,'5m':300000,'15m':900000,'30m':1800000,'1h':3600000,'4h':14400000,'1d':86400000,'1w':604800000}[tf];
 return rows.map((r,i)=>{if(!r.every(Number.isFinite)||r[1]<=0||r[3]>Math.min(r[1],r[4])||r[2]<Math.max(r[1],r[4])||r[2]<r[3]||(i&&r[0]<=rows[i-1][0]))throw new Error('OHLC Twelve Data tidak valid.');const d=new Date(r[0]);return [...r,(step?r[0]+step:Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1))-1];});
}
async function twelveRows(tf,{key=process.env.TWELVEDATA_API_KEY,fetcher=fetch,symbol='XAUUSD'}={}){
 if(!Object.hasOwn(SYMBOLS,symbol))throw new Error('Instrumen Twelve Data tidak didukung.');
 if(!INTERVALS[tf])throw new Error('Timeframe Twelve Data tidak didukung.');
 if(!key){const e=new Error('Pasang TWELVEDATA_API_KEY pada Environment Variables server/Vercel, lalu redeploy.');e.status=503;throw e;}
 const cacheKey=symbol+'|'+tf;
 const saved=cache.get(cacheKey);if(saved&&Date.now()-saved.at<60000)return saved.rows;
 if(pending.has(cacheKey))return pending.get(cacheKey);
 const task=(async()=>{const q=new URLSearchParams({symbol:SYMBOLS[symbol],interval:INTERVALS[tf],outputsize:tf==='1M'?'240':'300',timezone:'UTC',order:'ASC',apikey:key});const response=await fetcher('https://api.twelvedata.com/time_series?'+q,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error(`Twelve Data HTTP ${response.status}.`);const rows=parseTwelve(await response.json(),tf,{requestedTimezone:q.get('timezone'),symbol});cache.set(cacheKey,{at:Date.now(),rows});return rows;})();pending.set(cacheKey,task);try{return await task;}finally{pending.delete(cacheKey);}
}
module.exports={twelveRows,parseTwelve,INTERVALS,SYMBOLS};

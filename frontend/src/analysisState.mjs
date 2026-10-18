export function quoteIsStale(data,now=Date.now()) {
 return !data||data.marketDataStatus==='STALE_QUOTE'||!Number.isFinite(data.timestamp)||now-data.timestamp>45000||data.timestamp>now+5000;
}
export function scopedTick(data,tick) {
 return tick&&tick.symbol===data?.symbol&&tick.broker===data?.broker?.id&&Number.isFinite(tick.bid)?tick:null;
}

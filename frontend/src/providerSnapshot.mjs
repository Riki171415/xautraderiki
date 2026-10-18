export const PROVIDER_TFS=['1m','5m','15m','30m','1h','4h','1d','1w','1M'];
export function loadingOrder(selected) {
  return [...new Set(['1m','4h',selected,'1d',...PROVIDER_TFS])].filter(tf=>PROVIDER_TFS.includes(tf));
}
export function referenceSnapshot(raw,quote,provider,now) {
  const minute=raw['1m'];
  const price=Number.isFinite(quote?.bid)?quote.bid:minute?.at(-1)?.[4]??null;
  // Candle opening time and HTTP receipt time are not last-trade timestamps.
  const ended=Number.isFinite(minute?.at(-1)?.[6])&&minute.at(-1)[6]+1<=now;
  const timestamp=Number.isFinite(quote?.sourceTimestamp)?quote.sourceTimestamp:null;
  return {price,priceTimestamp:timestamp,source:Number.isFinite(quote?.bid)?'BOOK_TICKER':'M1_CLOSE',
    candleStart:minute?.at(-1)?.[0]??null,candleEnd:minute?.at(-1)?.[6]+1||null,
    fetchedAt:minute?.snapshot?.fetchedAt??null,
    freshness:price==null?'INCOMPLETE':timestamp==null?(ended?'STALE':'UNVERIFIED'):now-timestamp>45000||timestamp>now+5000?'STALE':'FRESH',provider};
}

export const dataScope=(symbol,timeframe,broker)=>`${broker}|${symbol}|${timeframe}`;
export function matchesScope(data,symbol,timeframe,broker){return !!data&&data.symbol===symbol&&data.timeframe===timeframe&&data.broker?.id===broker;}
export function newestScopedAnalysis(ws,rest,symbol,timeframe,broker){
 const a=matchesScope(ws,symbol,timeframe,broker)?ws:null;
 const b=matchesScope(rest,symbol,timeframe,broker)?rest:null;
 return a&&(!b||a.timestamp>=b.timestamp)?a:b;
}
// Keep the last snapshot only within the exact selected scope, preserving its age.
export function retainedScopedAnalysis(incoming,previous,symbol,timeframe,broker){
 const current=matchesScope(incoming,symbol,timeframe,broker)?incoming:null;
 const prior=matchesScope(previous,symbol,timeframe,broker)?previous:null;
 return current&&(!prior||current.timestamp>=prior.timestamp)?current:prior;
}

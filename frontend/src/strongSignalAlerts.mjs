export function strongSignalKey(signal,data,tolerance){
 const columns=data?.leak4RegMatrix?.rsColumns||[];
 return [data?.broker?.id,data?.broker?.server,data?.broker?.sourceSession,data?.symbol,tolerance,signal.side,signal.timeframe,columns.find(c=>c.timeframe==='4h')?.periodStart,columns.find(c=>c.timeframe===signal.timeframe)?.periodStart,signal.target?.timeframe,columns.find(c=>c.timeframe===signal.target?.timeframe)?.periodStart,signal.target?.h4Key,signal.target?.level,signal.target?.value].join('|');
}
export function newStrongSignalEvents(signals,data,tolerance,seen){return signals.filter(s=>s.strong&&!seen.has(strongSignalKey(s,data,tolerance)));}

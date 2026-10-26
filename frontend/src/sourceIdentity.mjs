export function sourceIdentity(data){return `${data?.broker?.id||''}|${data?.symbol||''}|${data?.broker?.server||''}|${data?.broker?.sourceSession||''}`;}
export function matchesFeed(data,tick){return !!data&&!!tick&&data.broker?.id===tick.broker&&data.symbol===tick.symbol&&(!data.broker?.sourceSession||data.broker.sourceSession===tick.sourceSession)&&(!data.broker?.server||!tick.server||data.broker.server===tick.server);}
export function acceptsExnessSource(data,selectedServer='',latestSource=null){
 if(data?.broker?.id!=='EXNESS')return true;
 if(selectedServer&&data.broker.server!==selectedServer)return false;
 if(latestSource?.sourceSession&&data.broker.sourceSession!==latestSource.sourceSession)return false;
 return !latestSource?.server||data.broker.server===latestSource.server;
}

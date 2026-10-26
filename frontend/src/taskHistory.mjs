const LEVELS=['sup4','sup3','sup2','sup1','pivot','res1','res2','res3','res4'];
export const HISTORY_LIMIT=1500;
export function recordTaskHistory(prior,{scope,columns=[],rows=[],now,stale=false}={}) {
 if(stale||!scope||!Number.isFinite(now))return prior;
 let next=prior.slice();
 for(const c of columns){
  if(!Number.isFinite(c.periodStart)||!Number.isFinite(c.periodEnd)||now<c.periodStart||now>=c.periodEnd)continue;
  if(![c.openN,c.openB,c.lowN,c.highN].every(v=>v!=null&&Number.isFinite(Number(v)))||Number(c.lowN)>Number(c.highN))continue;
  const key=JSON.stringify([scope,c.timeframe,c.periodStart]),index=next.findIndex(r=>r.key===key),old=index<0?null:next[index];
  const jika=Number(c.openN)>Number(c.openB)?'UP':Number(c.openN)<Number(c.openB)?'DOWN':'NEUTRAL';
  const bowKey=jika==='UP'?'sup1':jika==='DOWN'?'res1':null,targetKey=jika==='UP'?'res1':jika==='DOWN'?'sup1':null;
  const row=rows.find(r=>r.timeframe===c.timeframe),pattern=row?.pattern||'UNAVAILABLE';
  const touches={...(old?.touches||{})};
  for(const level of LEVELS){const value=c[level];if(value!=null&&Number.isFinite(Number(value))&&Number(c.lowN)<=Number(value)&&Number(value)<=Number(c.highN)&&!touches[level])touches[level]={value:Number(value),observedAt:now};}
  const patterns=[...(old?.patterns||[])];
  if(pattern!=='UNAVAILABLE'&&patterns.at(-1)?.pattern!==pattern)patterns.push({pattern,observedAt:now});
  const record={key,scope,timeframe:c.timeframe,start:c.periodStart,end:c.periodEnd,firstObservedAt:old?.firstObservedAt??now,lastObservedAt:now,jika,bowKey,targetKey,touches,patterns:patterns.slice(-100),sequenceStatus:'UNVERIFIED'};
  if(old)next[index]=record;else next.push(record);
 }
 return next.sort((a,b)=>b.lastObservedAt-a.lastObservedAt).slice(0,HISTORY_LIMIT);
}
export function readTaskHistory(storage){try{const value=JSON.parse(storage.getItem('coptah.taskHistory.v1')||'[]');return Array.isArray(value)?value.filter(r=>r&&typeof r.key==='string'&&typeof r.scope==='string'&&r.touches&&Array.isArray(r.patterns)).slice(0,HISTORY_LIMIT):[];}catch{return [];}}

const COOLDOWN=5*60*1000, REPEAT=30*60*1000;
// Shared by automatic toasts and signal dialogs. Suppressed events are consumed,
// so a timer cannot replay an old event after the cooldown.
export function allowMarketNotice(ref,scope,kind,event,now){
 if(!Number.isFinite(now))return false;
 if(ref.current?.scope!==scope)ref.current={scope,last:-Infinity,seen:new Map()};
 const state=ref.current;
 const meaningful=kind==='support'?['BOUNCE','BREAK'].includes(event.stage):kind==='h4'?event.type==='CROSSED':kind==='reference'?['PLAN_VALID','STRONG','INVALIDATED'].includes(event.status):kind==='strong'?event.strong&&!event.warnings?.length:false;
 if(!meaningful)return false;
 const areaKey=event.members?.length?event.members.map(m=>`${m.timeframe}|${m.label}|${m.value}`).sort().join(';'):event.id;
 const key=kind==='reference'?`reference|${event.status}|${event.key}`:kind==='support'?`support|${event.stage}|${areaKey}`:kind==='h4'?`h4|${event.key}|${event.value}|${event.direction}`:`strong|${event.side}|${event.target?.timeframe}|${event.target?.h4Key}|${event.target?.level}|${event.target?.value}`;
 for(const [k,time] of state.seen)if(now-time>=REPEAT)state.seen.delete(k);
 const duplicate=state.seen.has(key);
 state.seen.set(key,now);
 if(duplicate||now-state.last<COOLDOWN)return false;
 state.last=now;
 return true;
}

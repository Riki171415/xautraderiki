import {timeframeTask,taskNarrative} from './timeframeTask.mjs';
export function habitWarnings(columns,cycle,price,{target='AUTO',now=Date.now(),stale=false}={}) {
 const day=columns?.find(c=>c.timeframe==='1d'),h4=columns?.find(c=>c.timeframe==='4h'),market=columns?.find(c=>c.timeframe==='market');
 const valid=c=>c&&(!Number.isFinite(c.periodEnd)||c.periodStart<=now&&now<c.periodEnd);
 const notes=[];
 if(valid(market)&&market.anomalies?.length&&valid(day)) {
  const r=market.anomalies.some(a=>a.lower.startsWith('r')||a.upper.startsWith('r'));
  const s=market.anomalies.some(a=>a.lower.startsWith('s')||a.upper.startsWith('s'));
  const keys=cycle?.activeSession==='ASIA'?[1]:cycle?.activeSession==='EROPA'?[2]:cycle?.activeSession==='USA'?[1,2,3,4]:[];
  if(keys.length)notes.push({id:'habit',text:`Kebiasaan bersyarat ${cycle.activeSession}: ${r?keys.map(i=>`R${i} Daily ${day['res'+i]}`).join(', '):''}${r&&s?' / ':''}${s?keys.map(i=>`S${i} Daily ${day['sup'+i]}`).join(', '):''}. Anomali bukan kepastian sasaran; pantau dua arah.`});
 }
 const model=timeframeTask(day,{now,stale,additionalTarget:target});
 if(!model.active||!model.target||model.target.value==null||!model.observable||!Number.isFinite(price))return {notes,daily:null,task:model};
 const {key,value,touched}=model.target;
 const route=taskNarrative(model,'Daily');
 for(const [role,area] of [['busur',model.bow],['target',model.target],['tambahan',model.additional]])if(area?.touched)notes.push({id:`daily:${model.periodStart}:${role}:${area.key}`,text:`Level ${role} Daily ${area.key.toUpperCase()} ${area.value} tersentuh. ${route} Sentuhan level bukan bukti TP transaksi, akhir Busur, atau kepastian pembalikan.`});
 return {notes,task:model,daily:{key,value,touched,open:model.open,route,trend:model.jika,periodStart:model.periodStart,bow:model.bow,additional:model.additional}};
}

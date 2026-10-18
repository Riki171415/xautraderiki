import {btcWeeklySchedule} from './btcWeeklySchedule.mjs';
import {timeframeTask} from './timeframeTask.mjs';
export const TASK_REFERENCES={'1d':['4h','market'],'1w':['1d'],'1M':['1w'],'3M':['1M'],'6M':['3M'],'1Y':['3M']};
export function taskHierarchy(columns,timeframe,{now=Date.now(),stale=false,symbol}={}) {
 const parent=columns.find(c=>c.timeframe===timeframe),model=timeframeTask(parent,{now,stale});
 let monthWeek=null;
 if(timeframe==='1M'){
  const w=columns.find(c=>c.timeframe==='1w');
  if(w&&model.active&&Number.isFinite(w.periodStart)&&Number.isFinite(w.periodEnd)&&w.periodStart<=now&&now<w.periodEnd&&Number.isFinite(parent.periodStart)&&Number.isFinite(parent.periodEnd)){
   const week=Math.ceil((w.periodStart-parent.periodStart)/(7*86400000))+1;
   monthWeek={week,phase:week<=2?'BOW_DIRECTION':'TARGET_DIRECTION',start:w.periodStart,end:w.periodEnd,note:'Pekan W1 broker yang beririsan dengan Month; Week 1–2 Busur, Week 3 dan seterusnya Target. Gerak aktual tetap diperiksa.'};
  }
 }
 const references=(TASK_REFERENCES[timeframe]||[]).map(tf=>{
  const c=columns.find(c=>c.timeframe===tf),child=timeframeTask(c,{now,stale});
  const phase=!model.active||stale||!child.active||!['UP','DOWN'].includes(model.jika)||!['UP','DOWN'].includes(child.move)?'UNDETERMINED':child.move===model.jika?'TARGET_DIRECTION':'BOW_DIRECTION';
  return {timeframe:tf,jika:child.jika,move:child.move,phase,active:child.active,range:child.range};
 });
 return {timeframe,model,references,monthWeek,weeklySchedule:timeframe==='1w'?btcWeeklySchedule(parent,{symbol,now}):null,available:references.length>0&&references.every(c=>c.active&&c.phase!=='UNDETERMINED')};
}

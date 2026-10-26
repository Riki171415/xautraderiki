import {dailyTaskForColumn} from './dailyH4Task.mjs';
import {habitWarnings} from './habitWarnings.mjs';
export function isForexHabitInstrument(data){
 return data?.broker?.id!=='BINANCE'&&/^(XAU|XAG|EUR|GBP|AUD|NZD|USD|CAD|CHF|JPY)(USD|EUR|GBP|AUD|NZD|CAD|CHF|JPY)(?:$|[._-]|m$|c$)/i.test(data?.symbol||'');
}
export function forexHabitContext(data,columns,price,{now=Date.now(),stale=false,target='AUTO'}={}){
 if(!isForexHabitInstrument(data))return null;
 const active=tf=>columns.find(c=>c.timeframe===tf&&!c.unavailable&&Number.isFinite(c.periodStart)&&Number.isFinite(c.periodEnd)&&c.periodStart<=now&&now<c.periodEnd);
 const market=active('market'),daily=active('1d');
 const session=data?.marketCycle?.activeSession||'TRANSISI';
 const anomalies=market?.anomalies||[];
 const families=['R','S'].filter(f=>anomalies.some(a=>[a.lower,a.upper].some(k=>String(k).toLowerCase().startsWith(f.toLowerCase()))));
 const indices=session==='ASIA'?[1]:session==='EROPA'?[2]:session==='USA'?[1,2,3,4]:[];
 const targets=families.flatMap(f=>indices.map(i=>({label:`${f}${i} Daily`,value:daily?.[(f==='R'?'res':'sup')+i]})));
 const warnings=habitWarnings(columns,data?.marketCycle,price,{now,stale,target});
 const task=dailyTaskForColumn(data?.dailyH4Context,daily,warnings.daily?.value,now);
 const history=data?.marketHabits;
 const weekly=active('1w');
 const gap=weekly&&Number.isFinite(weekly.openN)&&Number.isFinite(weekly.closeB)?weekly.openN-weekly.closeB:null;
 return {session,stale,marketAvailable:!!market,dailyAvailable:!!daily,families,targets,whisperActive:!stale&&!!market&&!!daily&&indices.length>0&&families.length>0&&targets.every(t=>Number.isFinite(t.value)&&t.value>0),
  phase:history?.weekPhase||null,weeks:history?.weeks||[],usa:history?.usaComparison||(session==='USA'?history:null),history,task,daily:warnings.daily,gap,
  route:['res3','res1','res2','sup1'].map(key=>({label:key.replace('res','R').replace('sup','S'),value:daily?.[key],touched:daily?.touchedLevels?.[key]===true}))};
}

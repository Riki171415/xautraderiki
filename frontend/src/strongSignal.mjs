import {signalConflicts} from './directionContext.mjs';
import {taskHierarchy} from './taskHierarchy.mjs';
import {h4MicroMatches} from './h4LevelMatches.mjs';
import {h4ConfluencePlan} from './h4ConfluencePlan.mjs';
import {timeframeTask} from './timeframeTask.mjs';
export function strongSignals(columns=[],price,{now=Date.now(),stale=false,tolerance=0,decimals=3,cycle}={}) {
 const active=c=>c&&(!Number.isFinite(c.periodEnd)||c.periodStart<=now&&now<c.periodEnd);
 const plan=h4ConfluencePlan(columns,Number(price),{now,tolerance,decimals});
 const h4=columns.find(c=>c.timeframe==='4h');
 const macro=plan.comparison.groups;
 const microMatches=h4MicroMatches(columns,Number(price),{now,tolerance,decimals});
 return ['BUY','SELL'].flatMap(side=>['1m','5m','15m','30m','1h'].map(tf=>{
 const direction=side==='BUY'?'UP':'DOWN';const micro=timeframeTask(columns.find(c=>c.timeframe===tf),{now,stale});
 const destination=macro.filter(g=>g.key!=='openN'&&(side==='BUY'?g.value>price:g.value<price)).sort((a,b)=>a.distance-b.distance)[0];
 const counterparts=(destination?.matches||[]).filter(m=>['1d','1w','1M','3M','6M','1Y'].includes(m.timeframe));
 const evaluated=counterparts.map(m=>{
  const hierarchy=taskHierarchy(columns,m.timeframe,{now,stale});const parent=hierarchy.model;
  const phase=parent.jika===direction?'TARGET_DIRECTION':'BOW_DIRECTION';
  const childPhases=hierarchy.available&&hierarchy.references.every(r=>r.move===direction&&r.phase===phase);
  const calendar=hierarchy.monthWeek;const calendarPass=m.timeframe!=='1M'||!!calendar&&calendar.phase===phase;
  const range=hierarchy.references.every(r=>r.range.before>0&&Math.abs(Number(m.value)-Number(price))<=r.range.before);
  return {match:m,hierarchy,phase,aligned:childPhases&&calendarPass,range};
 });
 const matching=evaluated.filter(x=>x.aligned),chosen=matching.find(x=>x.range)||matching[0]||evaluated[0];
 const h4Model=timeframeTask(h4,{now,stale});
 const checks=[
  {key:'fresh',label:'Data periode aktif dan harga segar',pass:!stale&&micro.active&&active(h4)&&Number.isFinite(Number(price))},
  {key:'micro',label:'JIKA + MOVE TF kecil searah',pass:micro.jika===direction&&micro.move===direction},
  {key:'hierarchy',label:'Fase induk dan timeframe acuan selaras',pass:!!chosen?.aligned&&h4Model.move===direction},
  {key:'confluence',label:'H4 cocok level TF besar pada arah sasaran',pass:!!chosen&&!!microMatches.groups.find(g=>g.key===destination?.key)?.matches.some(m=>m.timeframe===tf&&m.toward==='MENUJU')},
  {key:'range',label:'Jarak target ≤ range B tiap TF acuan',pass:!!chosen?.range},
  {key:'session',label:'Pola sesi normal/strong terverifikasi',pass:['NORMAL','STRONG'].includes(cycle?.marketType)&&cycle?.verification==='OBSERVED'&&cycle?.bias===(side==='BUY'?'BULLISH':'BEARISH')},
  {key:'order',label:'Entry–SL–TP H4 valid pada arah yang sama',pass:plan.action===`${side} LIMIT`}
 ];
 const strong=checks.every(c=>c.pass);
 const warnings=signalConflicts(columns,{timeframe:tf,target:chosen?{timeframe:chosen.match.timeframe}:null},{now,stale});
 return {warnings,side,timeframe:tf,status:strong?`SINYAL KUAT ${side}`:'BELUM LENGKAP',checks,strong,target:chosen?{h4Key:destination.key,h4Value:destination.value,timeframe:chosen.match.timeframe,level:chosen.match.level,value:chosen.match.value,phase:chosen.phase}:null};
 }));
}

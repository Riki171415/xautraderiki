import {h4ConfluencePlan,confluenceCell} from './h4ConfluencePlan.mjs';
import {MICRO_TIMEFRAMES,microH4Guide} from './microH4Guide.mjs';
export function matrixPlan(column,marketEntry,context={}){
 if(MICRO_TIMEFRAMES.has(column.timeframe))return microH4Guide(column,context.columns,context.price,context.options);
 if(context.columns){
  const anchored=h4ConfluencePlan(context.columns,context.price,context.options);
  if(anchored.action==='WAIT')return {...anchored,cellRoles:Object.fromEntries(['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'].map(key=>[key,confluenceCell(anchored,column,key).map(m=>m.role)]))};
  const keys=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
  const cellRoles=Object.fromEntries(keys.map(key=>[key,confluenceCell(anchored,column,key).map(m=>m.role)]));
  if(column.timeframe==='4h')cellRoles[anchored.stopKey]=[...(cellRoles[anchored.stopKey]||[]),'SL'];
  // All macro views share the H4 ticket; labels remain only on actual matching cells.
  const matchedHere=Object.values(cellRoles).some(labels=>labels.length);
  const targets=anchored.areas.filter(a=>a.role.startsWith('TP'));
  return {...anchored,matchedHere,cellRoles,tp1:targets[0]?.value,tp2:targets[1]?.value,tp3:targets[2]?.value};
 }
 if(column.timeframe==='market'){
  if(!marketEntry?.plan||marketEntry.current?.timestamp!==column.periodStart)return {action:'WAIT',reason:'Menunggu skenario Market pada periode yang sama.'};
  if(marketEntry.status!=='SCENARIO')return {...marketEntry.plan,action:'WAIT',reason:marketEntry.reason};
  return marketEntry.plan;
 }
 return column.plan||{action:'WAIT',reason:'Rencana timeframe belum tersedia; muat ulang data.'};
}
export function planBadges(plan,key){
 if(!['BUY LIMIT','SELL LIMIT'].includes(plan?.action))return plan?.cellRoles?.[key]||[];
 if(plan.cellRoles)return plan.cellRoles[key]||[];
 const buy=plan.action==='BUY LIMIT';
 const map=buy?{sup1:['BUY LIMIT'],sup2:['SL'],pivot:['TP1'],res1:['TP2'],res2:['TP3']}:{res1:['SELL LIMIT'],res2:['SL'],pivot:['TP1'],sup1:['TP2'],sup2:['TP3']};
 return (map[key]||[]).filter(label=>!label.startsWith('TP')||Number.isFinite(plan['tp'+label.slice(2)]));
}

import {sampleMomentum} from './priceMomentum.mjs';
const keys=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
export function activeSessionAt(now=Date.now()) {
 const h=new Date(now+7*3600000).getUTCHours();
 return h>=6 && h<14?'ASIA':h>=14 && h<20?'EROPA':h>=20 || h<4?'USA':'TRANSISI';
}
export function projectMatrix(matrix,tick,decimals=3,now=Date.now(),previous=null) {
 if(matrix) {
  const current=row=>row.timeframe!=='market' || now>=row.periodStart && now<row.periodEnd;
  matrix={...matrix,rsColumns:matrix.rsColumns.filter(current),tableRows:matrix.tableRows.filter(current)};
 }
 if(!matrix) return matrix;
 const validTick=Number.isFinite(tick?.bid)&&Number.isFinite(tick?.timestamp)&&tick.timestamp<=now;
 if(!validTick&&!previous)return matrix;
 const columns=matrix.rsColumns.map(col=>{
  const prior=previous?.rsColumns?.find(c=>c.timeframe===col.timeframe&&c.periodStart===col.periodStart&&c.periodEnd===col.periodEnd);
  const lastTickTimestamp=Math.max(col.lastTickTimestamp||0,prior?.lastTickTimestamp||0);
  const applies=validTick&&tick.timestamp>=lastTickTimestamp&&tick.timestamp>=col.periodStart&&tick.timestamp<col.periodEnd;
  if(!applies&&!prior)return col;
  const low=Math.min(Number(col.lowN),Number(prior?.lowN??col.lowN),applies?tick.bid:Infinity),high=Math.max(Number(col.highN),Number(prior?.highN??col.highN),applies?tick.bid:-Infinity);
  const close=applies?tick.bid:Number(prior?.closeN??col.closeN);
  const touchedLevels=Object.fromEntries(keys.map(k=>[k,low<=Number(col[k])&&Number(col[k])<=high]));
  const touchedCount=Object.values(touchedLevels).filter(Boolean).length;
  return {...col,decimals,momentumSamples:applies?sampleMomentum(prior?.momentumSamples||[],tick.timestamp,tick.bid):(prior?.momentumSamples||[]),lastTickTimestamp:applies?tick.timestamp:lastTickTimestamp,highN:high.toFixed(decimals),lowN:low.toFixed(decimals),closeN:close.toFixed(decimals),touchedLevels,touchedCount,unreachedCount:9-touchedCount};
 });
 return {...matrix,rsColumns:columns,tableRows:matrix.tableRows.map(row=>{
  const col=columns.find(c=>c.timeframe===row.timeframe);
  if(!col || col===matrix.rsColumns.find(c=>c.timeframe===row.timeframe)) return row;
  const rangeN=Number((Number(col.highN)-Number(col.lowN)).toFixed(decimals));
  const close=Number(col.closeN);
  const move=close>Number(row.openN)?'UP':close<Number(row.openN)?'DOWN':'FLAT';
  const touchedLabels=keys.filter(k=>col.touchedLevels[k]).map(k=>k==='pivot'?'PV':k.replace('res','R').replace('sup','S'));
  return {...row,highN:col.highN,lowN:col.lowN,move,track:move==='FLAT'||row.direct==='NEUTRAL'?'WAIT':move===row.direct?`TARGET ${move}`:`BUSUR ${move}`,rangeN,rangeD:(rangeN-Number(row.rangeB)).toFixed(decimals),touchedLabels,touchedSummary:touchedLabels.length?touchedLabels.join(', '):'Belum Ada',touchedLevels:col.touchedLevels,touchedCount:col.touchedCount,unreachedCount:col.unreachedCount};
 })};
}

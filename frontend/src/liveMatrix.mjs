const keys=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
export function activeSessionAt(now=Date.now()) {
 const h=new Date(now+7*3600000).getUTCHours();
 return h>=6 && h<14?'ASIA':h>=14 && h<20?'EROPA':h>=20 || h<4?'USA':'TRANSISI';
}
export function projectMatrix(matrix,tick,decimals=3,now=Date.now()) {
 if(matrix) {
  const current=row=>row.timeframe!=='market' || now>=row.periodStart && now<row.periodEnd;
  matrix={...matrix,rsColumns:matrix.rsColumns.filter(current),tableRows:matrix.tableRows.filter(current)};
 }
 if(!matrix || !Number.isFinite(tick?.bid)) return matrix;
 const columns=matrix.rsColumns.map(col=>{
  if(!(tick.timestamp>=col.periodStart && tick.timestamp<col.periodEnd)) return col;
  const low=Math.min(Number(col.lowN),tick.bid),high=Math.max(Number(col.highN),tick.bid);
  const touchedLevels=Object.fromEntries(keys.map(k=>[k,low<=Number(col[k])&&Number(col[k])<=high]));
  const touchedCount=Object.values(touchedLevels).filter(Boolean).length;
  return {...col,highN:high.toFixed(decimals),lowN:low.toFixed(decimals),closeN:tick.bid.toFixed(decimals),touchedLevels,touchedCount,unreachedCount:9-touchedCount};
 });
 return {...matrix,rsColumns:columns,tableRows:matrix.tableRows.map(row=>{
  const col=columns.find(c=>c.timeframe===row.timeframe);
  if(!col || col===matrix.rsColumns.find(c=>c.timeframe===row.timeframe)) return row;
  const rangeN=Number((Number(col.highN)-Number(col.lowN)).toFixed(decimals));
  const move=tick.bid>Number(row.openN)?'UP':tick.bid<Number(row.openN)?'DOWN':'FLAT';
  return {...row,highN:col.highN,lowN:col.lowN,move,track:move==='FLAT'||row.direct==='NEUTRAL'?'WAIT':move===row.direct?`TARGET ${move}`:`BUSUR ${move}`,rangeN,rangeD:(rangeN-Number(row.rangeB)).toFixed(decimals),touchedLevels:col.touchedLevels,touchedCount:col.touchedCount,unreachedCount:col.unreachedCount};
 })};
}

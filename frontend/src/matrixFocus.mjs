export const MATRIX_GROUPS={focus:['4h','market','1d'],micro:['1m','5m','15m','30m','1h'],global:['1w','1M','3M','6M','1Y']};
export function focusRows(rows,columns,group='focus'){
 const order=MATRIX_GROUPS[group]||MATRIX_GROUPS.focus;
 return order.flatMap(tf=>{const row=rows.find(r=>r.timeframe===tf),column=columns.find(c=>c.timeframe===tf);return row&&column?[{row,column}]:[];});
}

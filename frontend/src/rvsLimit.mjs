const number=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
export function rvsLimit(column,{now=Date.now(),stale=false}={}) {
 const high=number(column?.highB),low=number(column?.lowB),hn=number(column?.highN),ln=number(column?.lowN);
 const active=!!column&&(!Number.isFinite(column.periodEnd)||column.periodStart<=now&&now<column.periodEnd);
 const valid=high!=null&&low!=null&&high>=low;
 const observed=valid&&active&&!stale&&hn!=null&&ln!=null&&hn>=ln;
 const up=observed?hn>high:null,down=observed?ln<low:null;
 return {high,low,range:valid?high-low:null,up,down,status:!valid?'INCOMPLETE':!observed?'UNVERIFIED':up&&down?'BOTH':up?'UP':down?'DOWN':'WITHIN'};
}
export function dailyLevelStrength(columns,key,options={}) {
 const daily=columns.find(c=>c.timeframe==='1d'),month=columns.find(c=>c.timeframe==='1M');
 const rvs=rvsLimit(daily,options),pivot=number(month?.pivot),value=number(daily?.[key]);
 const active=month&&(!Number.isFinite(month.periodEnd)||month.periodStart<= (options.now??Date.now())&&(options.now??Date.now())<month.periodEnd);
 const valid=rvs.up!==null&&active&&pivot!=null&&value!=null;
 return {value,pivot,low:rvs.low,high:rvs.high,support:valid&&(key==='pivot'||key.startsWith('sup'))?value>pivot&&value>rvs.low:null,resistance:valid&&(key==='pivot'||key.startsWith('res'))?value<pivot&&value<rvs.high:null};
}

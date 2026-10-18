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
 const price=number(options.price),epsilon=10**(-(options.decimals??3))/2;
 const role=!valid||price==null?'UNVERIFIED':Math.abs(value-price)<=epsilon?'AT':value<price?'SUPPORT':'RESISTANCE';
 const contextSupport=valid&&(key==='pivot'||key.startsWith('sup'))?value>pivot&&value>rvs.low:null;
 const contextResistance=valid&&(key==='pivot'||key.startsWith('res'))?value<pivot&&value<rvs.high:null;
 return {value,pivot,price,low:rvs.low,high:rvs.high,role,contextSupport,contextResistance,support:role==='SUPPORT'&&contextSupport===true,resistance:role==='RESISTANCE'&&contextResistance===true};
}

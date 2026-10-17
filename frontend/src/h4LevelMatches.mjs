const numeric=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):NaN;
const LEVELS=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4','openN'];
const LARGE=new Set(['market','1d','1w','1M','3M','6M','1Y']);
export const levelName=k=>k==='openN'?'HSH · Open N':k==='pivot'?'Pivot':k.replace('res','R').replace('sup','S');
export function h4LevelMatches(columns,price,{decimals=3,tolerance=0,now=Date.now(),move='FLAT'}={}) {
 const current=c=>Number.isFinite(c.periodEnd)?c.periodStart<=now&&now<c.periodEnd:true;
 const h4=columns?.find(c=>c.timeframe==='4h'&&current(c));
 if(!h4||!Number.isFinite(price))return {available:false,groups:[],missing:[]};
 const epsilon=10**(-decimals)/2+1e-9;
 const valid=columns.filter(c=>LARGE.has(c.timeframe)&&current(c));
 const missing=[...LARGE].filter(tf=>!valid.some(c=>c.timeframe===tf));
 const groups=LEVELS.flatMap(key=>{
  const value=numeric(h4[key]);if(!Number.isFinite(value))return [];
  const matches=valid.flatMap(c=>LEVELS.flatMap(k=>{
   const target=numeric(c[k]);if(!Number.isFinite(target))return [];
   const delta=Math.abs(value-target);if(delta>Math.max(0,tolerance)+epsilon)return [];
   const low=numeric(c.lowN),high=numeric(c.highN),close=numeric(c.closeN);
   const touched=Number.isFinite(low)&&Number.isFinite(high)&&low<=target&&target<=high;
   const crossed=touched&&(target>=Number(c.openN)?close>target:close<target);
   return [{timeframe:c.timeframe,label:c.label,level:k,value:target,delta,exact:delta<=epsilon,status:crossed?'Sudah dilewati':touched?'Sudah tersentuh':'Belum tersentuh',periodStart:c.periodStart}];
  }));
  if(!matches.length)return [];
  const side=Math.abs(price-value)<=epsilon?'AT':value>price?'ABOVE':'BELOW';
  const toward=side==='AT'?'Harga di area':move==='FLAT'?'Gerak belum berarah':(move==='UP'&&side==='ABOVE'||move==='DOWN'&&side==='BELOW')?'Gerak H4 menuju area':'Gerak H4 menjauh dari area';
  return [{key,value,matches,count:new Set(matches.map(m=>m.timeframe)).size,distance:Math.abs(price-value),side,toward}];
 }).sort((a,b)=>b.count-a.count||a.distance-b.distance);
 return {available:true,groups,missing};
}

// Micro comparisons are observations only; never added to macro entry validation.
export function h4MicroMatches(columns,price,{tolerance=0,decimals=3,now=Date.now()}={}) {
 const keys=LEVELS;
 const active=c=>c&&(!Number.isFinite(c.periodEnd)||(c.periodStart<=now&&now<c.periodEnd));
 const h4=columns?.find(c=>c.timeframe==='4h'&&active(c));
 if(!h4||!Number.isFinite(price))return {available:false,groups:[],missing:[]};
 const microKeys=['1m','5m','15m','30m','1h'];
 const valid=(columns||[]).filter(c=>microKeys.includes(c.timeframe)&&active(c));
 const number=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
 const epsilon=10**(-decimals)/2+1e-9;
 const groups=keys.flatMap(key=>{
  const value=number(h4[key]);if(value==null)return [];
  const matches=valid.flatMap(c=>keys.flatMap(level=>{
   const candidate=number(c[level]);if(candidate==null||Math.abs(value-candidate)>Math.max(0,tolerance)+epsilon)return [];
   const open=number(c.openN),close=number(c.closeN),low=number(c.lowN),high=number(c.highN);
   const direction=open==null||close==null?'WAIT':close>open?'UP':close<open?'DOWN':'FLAT';
   const side=Math.abs(value-price)<=epsilon?'AT':value>price?'ABOVE':'BELOW';
   const toward=side==='AT'?'DI AREA':direction==='FLAT'||direction==='WAIT'?'BELUM BERARAH':(direction==='UP'&&side==='ABOVE'||direction==='DOWN'&&side==='BELOW')?'MENUJU':'MENJAUH';
   return [{timeframe:c.timeframe,label:c.label||c.timeframe,level,value:candidate,delta:Math.abs(value-candidate),direction,toward,touched:low!=null&&high!=null&&low<=candidate&&candidate<=high,periodStart:c.periodStart}];
  }));
  if(!matches.length)return [];
  return [{key,value,distance:Math.abs(value-price),matches,count:new Set(matches.map(m=>m.timeframe)).size,towardCount:new Set(matches.filter(m=>m.toward==='MENUJU').map(m=>m.timeframe)).size}];
 }).sort((a,b)=>b.towardCount-a.towardCount||b.count-a.count||a.distance-b.distance);
 return {available:true,groups,missing:microKeys.filter(tf=>!valid.some(c=>c.timeframe===tf))};
}

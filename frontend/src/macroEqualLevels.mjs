export const MACRO_NAMES={'1d':'Daily','1w':'Week','1M':'Month','3M':'Quarter','6M':'Semester','1Y':'Year'};
const LEVELS=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
export function macroEqualLevels(columns=[],{decimals=3,now=Date.now()}={}) {
 const groups=new Map();
 for(const c of columns){
  if(!Object.hasOwn(MACRO_NAMES,c.timeframe)||c.unavailable||!Number.isFinite(c.periodStart)||!Number.isFinite(c.periodEnd)||!(c.periodStart<=now&&now<c.periodEnd))continue;
  for(const key of LEVELS){
   if(c[key]==null||c[key]===''||!Number.isFinite(Number(c[key])))continue;
   const value=Number(c[key]),display=value.toFixed(decimals);
   if(!groups.has(display))groups.set(display,[]);
   groups.get(display).push({timeframe:c.timeframe,label:MACRO_NAMES[c.timeframe],key,value,display});
  }
 }
 const matches=new Map();
 for(const group of groups.values())if(new Set(group.map(x=>x.timeframe)).size>1)
  for(const item of group)matches.set(item.timeframe+'|'+item.key,group.filter(other=>other.timeframe!==item.timeframe));
 return matches;
}

const num=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const active=(c,now)=>c&&Number.isFinite(c.periodStart)&&Number.isFinite(c.periodEnd)&&c.periodStart<=now&&now<c.periodEnd;
export function dailyRangeEstimate(columns=[],{now=Date.now(),stale=false}={}) {
 const daily=columns.find(c=>c.timeframe==='1d'),h4=columns.find(c=>c.timeframe==='4h');
 const open=num(daily?.openN),hh=num(h4?.highN),hl=num(h4?.lowN),dh=num(daily?.highB),dl=num(daily?.lowB);
 const before=dh!=null&&dl!=null&&dh>=dl?dh-dl:null;
 const wait=reason=>({available:false,reason,open,before,levels:[]});
 if(stale)return wait('Harga lama; estimasi menunggu data segar.');
 if(!active(daily,now)||!active(h4,now)||h4.periodStart<daily.periodStart||h4.periodEnd>daily.periodEnd)return wait('Daily dan H4 aktif pada hari broker yang sama belum tersedia.');
 if(open==null||hh==null||hl==null||hh<hl)return wait('Open Daily atau High/Low N H4 belum lengkap.');
 const h4Range=hh-hl,projection=h4Range*6,upper=open+projection,lower=open-projection;
 const levels=['4h','1d'].flatMap(tf=>{const c=columns.find(c=>c.timeframe===tf);return ['pivot','res1','res2','res3','res4','sup1','sup2','sup3','sup4'].flatMap(key=>{const value=num(c?.[key]);return value==null?[]:[{timeframe:tf,key,value,within:value>=lower&&value<=upper,side:value>open?'UP':value<open?'DOWN':'AT',distance:Math.abs(value-open)}];});});
 return {available:true,open,before,h4Range,multiplier:6,projection,upper,lower,ratio:before>0?projection/before:null,levels:levels.sort((a,b)=>a.distance-b.distance)};
}

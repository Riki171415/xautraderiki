import {h4ConfluencePlan} from './h4ConfluencePlan.mjs';
import {h4MicroMatches,h4LevelMatches} from './h4LevelMatches.mjs';
export function twoWayH4(columns=[],price,{now=Date.now(),tolerance=0,decimals=3,stale=false}={}) {
 const h=columns.find(c=>c.timeframe==='4h');
 const micro=h4MicroMatches(columns,Number(price),{now,tolerance,decimals});
 const comparison=h4LevelMatches(columns,Number(price),{now,tolerance,decimals});
 const number=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
 return ['BUY','SELL'].map(side=>{
  const buy=side==='BUY',key=buy?'sup1':'res1',stopKey=buy?'sup2':'res2';
  const entry=number(h?.[key]),stop=number(h?.[stopKey]),pivot=number(h?.pivot);
  const epsilon=10**(-decimals)/2;
  const destinations=stale?[]:comparison.groups.filter(g=>g.key!=='openN'&&(buy?g.value>=Number(price)-epsilon:g.value<=Number(price)+epsilon)).sort((a,b)=>a.distance-b.distance||b.count-a.count);
  const observations=['1m','5m','15m','30m','1h'].map(timeframe=>{
   const c=columns.find(c=>c.timeframe===timeframe),open=number(c?.openN),close=number(c?.closeN);
   const active=c&&(!Number.isFinite(c.periodEnd)||c.periodStart<=now&&now<c.periodEnd);
   const hActive=h&&(!Number.isFinite(h.periodEnd)||h.periodStart<=now&&now<h.periodEnd);
   const available=!stale&&active&&open!=null&&close!=null;
   const direction=!available?'WAIT':close>open?'UP':close<open?'DOWN':'FLAT';
   const change=available?close-open:null;
   const pairs=destinations.flatMap(g=>(micro.groups.find(x=>x.key===g.key)?.matches||[]).filter(m=>m.timeframe===timeframe).map(match=>({g,match}))).sort((a,b)=>a.g.distance-b.g.distance||a.match.delta-b.match.delta);
   const choice=pairs[0],anchor=choice?.g||destinations[0],match=choice?.match;
   const toward=!available?'DATA BELUM AKTIF':!hActive?'TUNGGU H4':!anchor?'BELUM ADA AREA':!match?'BELUM COCOK':match.toward;
   return {timeframe,label:{'1m':'M1','5m':'M5','15m':'M15','30m':'M30','1h':'H1'}[timeframe],direction,change,toward,level:match?.level,value:match?.value,target:anchor?.value??null,anchorKey:anchor?.key,macroMatches:anchor?.matches||[]};
  });
  const wait=reason=>({side,status:'WAIT',reason,entry:null,stop:null,targets:[],observations,destinations});
  if(stale)return wait('Harga belum segar; skenario menunggu pembaruan sumber.');
  if(!h||!Number.isFinite(Number(price))||Number.isFinite(h.periodEnd)&&!(h.periodStart<=now&&now<h.periodEnd))return wait('Data H4 periode aktif belum tersedia.');
  if(entry==null||stop==null||pivot==null)return wait('Level entry, Pivot atau batas risiko H4 belum lengkap.');
  if(!(buy?stop<entry&&entry<pivot:stop>entry&&entry>pivot))return wait('Urutan level H4 anomali; entry–Pivot–SL belum valid.');
  if(!(buy?entry<price:entry>price))return wait('Harga sudah melewati sisi limit; tunggu susunan harga yang valid, jangan mengejar.');
  const projected=columns.map(c=>c===h?{...c,plan:{action:`${side} LIMIT`,stopLoss:stop}}:c);
  const plan=h4ConfluencePlan(projected,Number(price),{now,tolerance,decimals});
  if(!plan.comparison.groups.some(g=>g.key===key))return wait('Area entry H4 belum cocok dengan timeframe besar pada toleransi aktif.');
  if(plan.action==='WAIT')return wait('Belum ada target searah yang cocok dengan timeframe besar.');
  const group=micro.groups.find(g=>g.key===key);
  const toward=new Set((group?.matches||[]).filter(m=>m.toward==='MENUJU').map(m=>m.timeframe)).size;
  return {side,status:'BERSYARAT',observations,destinations,entry,stop,key,stopKey,targets:plan.areas.filter(a=>a.role.startsWith('TP')),toward,
   bias:number(h.openN)!=null&&number(h.openB)!=null?(Number(h.openN)>Number(h.openB)?'BUY':Number(h.openN)<Number(h.openB)?'SELL':'NETRAL'):'BELUM TERSEDIA',
   reason:buy?'Jika harga turun ke S1 H4 lalu tertahan dan berbalik naik, pantau kelanjutan ke target.':'Jika harga naik ke R1 H4 lalu tertahan dan berbalik turun, pantau kelanjutan ke target.'};
 });
}

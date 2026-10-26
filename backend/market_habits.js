const H=3600000;
function sliceStats(rows,start,end,now){
 const completed=rows.filter(r=>r[0]>=start&&r[0]+H<=Math.min(end,now));
 const slots=[];for(let t=start;t+H<=Math.min(end,now);t+=H){const day=new Date(t+7*H).getUTCDay();if(day!==0&&day!==6)slots.push(t);}
 const seen=new Set(completed.map(r=>r[0]));
 return {start,end,bars:completed.length,expected:slots.length,coverage:slots.length>0&&slots.every(t=>seen.has(t)),open:completed[0]?.[1]??null,close:completed.at(-1)?.[4]??null,high:completed.length?Math.max(...completed.map(r=>r[2])):null,low:completed.length?Math.min(...completed.map(r=>r[3])):null,medianRange:completed.length?(()=>{const a=completed.map(r=>r[2]-r[3]).sort((a,b)=>a-b),i=Math.floor(a.length/2);return a.length%2?a[i]:(a[i-1]+a[i])/2;})():null};
}
function marketHabits({hourly=[],cycle,now=Date.now()}={}) {
 const sorted=[...hourly].filter(r=>r.length>=5&&r.slice(0,5).every(Number.isFinite)&&r[2]>=Math.max(r[1],r[4])&&r[3]<=Math.min(r[1],r[4])).sort((a,b)=>a[0]-b[0]);
 const rows=[...new Map(sorted.map(r=>[r[0],r])).values()];
 const compareSession=session=>{
  const elapsed=session?Math.max(0,Math.min(Math.floor((now-session.start)/H),Math.round((session.end-session.start)/H))):0;
  let current=null,previous=null;
  if(session&&session.name!=='TRANSISI'&&elapsed>0){
   current=sliceStats(rows,session.start,session.start+elapsed*H,now);
   for(let d=1;d<=7;d++){const start=session.start-d*24*H;const day=new Date(start+7*H).getUTCDay();if(day===0||day===6)continue;const candidate=sliceStats(rows,start,start+elapsed*H,now);if(candidate.coverage){previous=candidate;break;}}
  }
  return {session:session?.name||'TRANSISI',elapsedHours:elapsed,current,previous,available:!!current?.coverage&&!!previous?.coverage};
 };
 const session=cycle?.sessions?.find(s=>s.name===cycle.activeSession);
 const comparison=compareSession(session);
 const {elapsedHours:elapsed,current,previous}=comparison;
 const usaComparison=compareSession(cycle?.sessions?.find(s=>s.name==='USA'));
 const local=new Date(now+7*H),day=local.getUTCDay(),midnight=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate())-7*H;
 const monday=midnight-((day+6)%7)*24*H,split=monday+2*24*H+12*H,end=monday+5*24*H;
 const windows=[{label:'Awal pekan · Senin–Rabu 12.00 WIB',start:monday,end:split},{label:'Akhir pekan · Rabu 12.00–Jumat selesai WIB',start:split,end}];
 const weeks=windows.map(w=>({label:w.label,current:sliceStats(rows,w.start,w.end,now),previous:sliceStats(rows,w.start-7*24*H,Math.min(w.end,Math.floor(now/H)*H)-7*24*H,now),forming:now<w.end}));
 return {session:session?.name||'TRANSISI',elapsedHours:elapsed,current,previous,weeks,usaComparison,weekPhase:now<split?'EARLY':now<end?'LATE':'CLOSED',weekSplit:split,available:!!current?.coverage&&!!previous?.coverage,
 note:'Perbandingan memakai candle H1 selesai dan durasi yang sama. Rabu 12.00 WIB adalah batas operasional tampilan, bukan aturan baku COP TAH. Kekosongan jam kerja dapat berupa jeda broker atau riwayat hilang; hasil ditahan. Kebiasaan bukan kepastian.'};
}
module.exports={marketHabits};

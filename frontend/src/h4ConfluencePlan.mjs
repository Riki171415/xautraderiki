import {h4LevelMatches,h4MicroMatches,levelName} from './h4LevelMatches.mjs';
export function h4ConfluencePlan(columns,price,{tolerance=0,decimals=3,now=Date.now(),stale=false}={}){
 const comparison=h4LevelMatches(columns,price,{tolerance,decimals,now});
 const h4=columns.find(c=>c.timeframe==='4h'),base=h4?.plan;
 const micro=h4MicroMatches(columns,price,{tolerance,decimals,now});
 const attentionAreas=comparison.groups.filter(g=>g.key!=='openN').map(g=>({...g,role:'AREA H4',microMatches:micro.groups.find(m=>m.key===g.key)?.matches||[]}));
 const wait=reason=>({action:'WAIT',status:attentionAreas.length?'AREAS_AVAILABLE':'WAIT_DATA',reason:attentionAreas.length?`Ada ${attentionAreas.length} area H4 yang cocok: ${attentionAreas.map(g=>levelName(g.key)+' '+g.value.toFixed(decimals)).join(', ')}. Pantau arah TF kecil menuju area tersebut. Rencana entry belum terkonfirmasi.`:reason,areas:[],attentionAreas,comparison});
 if(stale)return {...wait('Harga belum segar; rencana aktif ditahan.'),reason:'Harga belum segar; rencana aktif ditahan.'};
 if(!comparison.available||!base||!['BUY LIMIT','SELL LIMIT'].includes(base.action))return wait(base?.reason||'H4 belum memiliki rencana berarah yang valid.');
 const buy=base.action==='BUY LIMIT',entryKey=buy?'sup1':'res1';
 const entry=comparison.groups.find(g=>g.key===entryKey);
 if(!entry)return wait('Belum ada level H4 yang cocok dengan timeframe besar pada batas selisih ini.');
 if(!(buy?entry.value<price:entry.value>price))return wait('Harga terakhir sudah melewati sisi limit entry H4. Jangan mengejar harga.');
 const epsilon=10**(-decimals)/2;
 const targets=comparison.groups.filter(g=>g.key!=='openN'&&(buy?g.value>entry.value+epsilon:g.value<entry.value-epsilon)).sort((a,b)=>buy?a.value-b.value:b.value-a.value).filter((g,i,all)=>!i||Math.abs(g.value-all[i-1].value)>epsilon).slice(0,3);
 if(!targets.length)return wait('Entry H4 bertemu level besar, tetapi sasaran ekuivalen pada arah rencana belum tersedia.');
 if(!(Number.isFinite(base.stopLoss)&&(buy?base.stopLoss<entry.value:base.stopLoss>entry.value)))return wait('Urutan SL dan entry H4 belum valid.');
 const areas=[{...entry,role:base.action},...targets.map((g,i)=>({...g,role:`TP${i+1}`}))].map(g=>({...g,microMatches:micro.groups.find(m=>m.key===g.key)?.matches||[]}));
 return {action:base.action,status:'PLAN_AVAILABLE',attentionAreas,reason:'Entry dan sasaran berasal dari level H4 yang bertemu Market/Daily/Week/Month/Kuartal/Semester/Year. TP berurutan menurut harga dari entry, bukan menurut nomor R/S.',entryPrice:entry.value,stopLoss:base.stopLoss,stopKey:buy?'sup2':'res2',areas,comparison};
}
export function confluenceCell(plan,column,key){
 const areas=plan.action==='WAIT'?(plan.attentionAreas||[]):plan.areas;
 return areas.filter(g=>column.timeframe==='4h'?g.key===key:[...(g.matches||[]),...(g.microMatches||[])].some(m=>m.timeframe===column.timeframe&&m.level===key)).map(g=>({role:g.role,observerOnly:['1m','5m','15m','30m','1h'].includes(column.timeframe),anchor:g.value,anchorKey:g.key,count:g.count,delta:Math.abs(Number(column[key])-g.value)}));
}

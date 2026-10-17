export function habitWarnings(columns,cycle,price,{target='AUTO',now=Date.now()}={}) {
 const day=columns?.find(c=>c.timeframe==='1d'),h4=columns?.find(c=>c.timeframe==='4h'),market=columns?.find(c=>c.timeframe==='market');
 const valid=c=>c&&(!Number.isFinite(c.periodEnd)||c.periodStart<=now&&now<c.periodEnd);
 const notes=[];
 if(valid(market)&&market.anomalies?.length&&valid(day)) {
  const r=market.anomalies.some(a=>a.lower.startsWith('r')||a.upper.startsWith('r'));
  const s=market.anomalies.some(a=>a.lower.startsWith('s')||a.upper.startsWith('s'));
  const keys=cycle?.activeSession==='ASIA'?[1]:cycle?.activeSession==='EROPA'?[2]:cycle?.activeSession==='USA'?[1,2,3,4]:[];
  if(keys.length)notes.push({id:'habit',text:`Kebiasaan bersyarat ${cycle.activeSession}: ${r?keys.map(i=>`R${i} Daily ${day['res'+i]}`).join(', '):''}${r&&s?' / ':''}${s?keys.map(i=>`S${i} Daily ${day['sup'+i]}`).join(', '):''}. Anomali bukan kepastian sasaran; pantau dua arah.`});
 }
 if(!valid(day)||!valid(h4))return {notes,daily:null};
 const trend=Number(day.openN)>Number(day.openB)?'UP':Number(day.openN)<Number(day.openB)?'DOWN':'NEUTRAL';
 const key=target==='AUTO'?(trend==='UP'?'res1':trend==='DOWN'?'sup1':null):target;
 if(!key)return {notes,daily:null};
 const value=Number(day[key]),low=Number(day.lowN),high=Number(day.highN),open=Number(day.openN);
 if(![value,low,high,open,price].every(Number.isFinite))return {notes,daily:null};
 const touched=low<=value&&value<=high;
 const route=touched?'Sasaran Daily sudah masuk rentang periode. Pantau reaksi menuju Open Daily dan skenario lanjut tembus.':'Sasaran Daily belum tersentuh; pantau pertemuan level H4 dan kelanjutan tugas Daily.';
 if(touched)notes.push({id:`daily:${day.periodStart}:${key}`,text:`${route} HSH Daily ${day.openN}. Sentuhan sasaran bukan bukti TP transaksi; pembalikan belum terkonfirmasi.`});
 return {notes,daily:{key,value,touched,open,route,trend,periodStart:day.periodStart}};
}

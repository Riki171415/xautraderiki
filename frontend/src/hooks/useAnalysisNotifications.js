import {h4Notice,strongNotice,hshNoticeKey,dailyNoticeKey} from '../notificationCopy.mjs';
import {quoteIsStale} from '../analysisState.mjs';
import {strongSignals} from '../strongSignal.mjs';
import {strongSignalKey,newStrongSignalEvents} from '../strongSignalAlerts.mjs';
import {useEffect,useRef} from 'react';
import {useLiveMatrix} from './useLiveMatrix';
import {h4LevelMatches,levelName} from '../h4LevelMatches.mjs';
import {nextH4Alerts} from '../h4Alerts.mjs';
import {habitWarnings} from '../habitWarnings.mjs';
import {dailyTaskForColumn} from '../dailyH4Task.mjs';
export function useAnalysisNotifications({data,liveTick,now,tolerance,target,settings,onNotify,onStrongSignal}) {
 const matrix=useLiveMatrix(data,liveTick,now);
 const price=Number(matrix?.currentPrice),digits=data?.decimals??3;
 const h4=matrix?.rsColumns?.find(c=>c.timeframe==='4h');
 const result=h4LevelMatches(matrix?.rsColumns,price,{decimals:digits,tolerance,now});
 const alertsEnabled=settings.h4Enabled,alertDistance=settings.distance,enabled=settings.dailyEnabled;
 const tracker=useRef(null),lastAlert=useRef(0),seen=useRef(new Set()),prior=useRef(null),critical=useRef(new Set());
 const signalSeen=useRef(new Set());
 const signals=strongSignals(matrix?.rsColumns||[],price,{now,tolerance,decimals:digits,cycle:data?.marketCycle,stale:quoteIsStale(data,now)});
 useEffect(()=>{
  if(!settings.h4Enabled||!data)return;
  const events=newStrongSignalEvents(signals,data,tolerance,signalSeen.current);
  if(!events.length)return;
  for(const event of events)signalSeen.current.add(strongSignalKey(event,data,tolerance));
  onNotify?.('warning',strongNotice(events,{symbol:data.symbol,source:data.broker?.name,decimals:digits}));
  onStrongSignal?.({...events[0],scope:`${data.broker?.id}|${data.symbol}`,eventKey:strongSignalKey(events[0],data,tolerance)});
 },[data,now,tolerance,settings.h4Enabled,onNotify,onStrongSignal]);
 const w=habitWarnings(matrix?.rsColumns,data?.marketCycle,price,{target,now,stale:quoteIsStale(data,now)});
 const task=dailyTaskForColumn(data?.dailyH4Context,matrix?.rsColumns?.find(c=>c.timeframe==='1d'),w.daily?.value,now);
 useEffect(()=>{
  if(quoteIsStale(data,now) || !alertsEnabled || !onNotify || !result.available || now-(data?.timestamp||0)>45000)return;
  const scope=`${data?.broker?.id}|${data?.symbol}|${h4?.periodStart}|${tolerance}`;
  const update=nextH4Alerts(tracker.current,scope,result.groups,price,{distance:alertDistance,epsilon:10**(-digits)/2});
  if(update.events.length && now-lastAlert.current<10000)return;
  tracker.current=update.state;
  if(!update.events.length)return;
  lastAlert.current=now;
  onNotify('warning',h4Notice(update.events,{symbol:data.symbol,source:data.broker?.name,price,decimals:digits}));
 },[data,price,now,tolerance,alertDistance,alertsEnabled,onNotify]);
 useEffect(()=>{
  if(quoteIsStale(data,now)||!enabled||!onNotify)return;
  const scope=`${data.broker?.id}|${data.symbol}`;
  if(prior.current!==scope){seen.current=new Set();prior.current=scope;}
  const notes=[...w.notes,...(task.hit?[{id:`last-h4:${task.hitStart}:${task.target}`,text:task.reason}]:[])];
  const pending=notes.filter(n=>!seen.current.has(dailyNoticeKey(n,data.marketCycle)));
  if(!pending.length)return;
  for(const n of pending)seen.current.add(dailyNoticeKey(n,data.marketCycle));
  onNotify('warning',{title:'Perkembangan tugas Daily',symbol:data.symbol,source:data.broker?.name,page:'cycle',body:`${pending.length} pembaruan level atau tugas Daily perlu diperhatikan.`,details:pending.map(n=>{if(n.id.startsWith('last-h4:'))return `Target Daily ${Number.isFinite(task.target)?task.target.toFixed(digits):'—'} tersentuh dalam dua H4 terakhir.`;if(n.id.startsWith('daily:')){const role=n.id.split(':')[2],area=role==='busur'?w.task.bow:role==='target'?w.task.target:w.task.additional;return `${role==='tambahan'?'Pantauan tambahan':role==='busur'?'Busur':'Target'} Daily ${levelName(area.key)} ${area.value.toFixed(digits)} tersentuh.`;}return n.text;}),next:'Lihat level yang tersentuh dan pantauan berikutnya pada Analisis Market.',caution:'Sentuhan level bukan bukti akhir Busur atau TP transaksi.'});
 },[data,now,target,enabled]);
 useEffect(()=>{
  if(quoteIsStale(data,now)||data.hsh?.hshSeverity!=='CRITICAL'||matrix?.rsColumns?.find(c=>c.timeframe===data.timeframe)?.hshEligibility?.eligible!==true)return;
  const key=hshNoticeKey(data);
  if(critical.current.has(key))return;
  critical.current.add(key);onNotify('warning',{title:'Menjelang penutupan · perhatian HSH',symbol:data.symbol,source:data.broker?.name,page:'h4',body:`Harga menjauh dari Open pada ${data.timeframe?.toUpperCase()||'timeframe aktif'} sementara periode mendekati penutupan.`,details:[`Open acuan ${Number.isFinite(data.hsh.openPrice)?data.hsh.openPrice.toFixed(digits):'—'} · sisa waktu ${data.hsh.timeToClose||'belum tersedia'}`],next:'Pantau reaksi terhadap Open dan evaluasi rencana H4.',caution:'Peringatan ini tidak memastikan harga kembali ke Open.'});
 },[data,now,onNotify]);
 return signals;
}

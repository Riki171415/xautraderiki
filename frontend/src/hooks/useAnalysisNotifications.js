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
 const signals=strongSignals(matrix?.rsColumns||[],price,{now,tolerance,decimals:digits,cycle:data?.marketCycle,stale:data?.marketDataStatus==='STALE_QUOTE'||!Number.isFinite(data?.timestamp)||now-data.timestamp>45000});
 useEffect(()=>{
  if(!settings.h4Enabled||!data)return;
  const events=newStrongSignalEvents(signals,data,tolerance,signalSeen.current);
  if(!events.length)return;
  for(const event of events)signalSeen.current.add(strongSignalKey(event,data,tolerance));
  onNotify?.('warning',`${data.symbol}: ${events.map(s=>`${s.status} ${s.timeframe.toUpperCase()} → H4 → ${s.target.timeframe} ${s.target.value.toFixed(digits)}`).join(' | ')}. Syarat lengkap; bukan order aktif.`);
  onStrongSignal?.({...events[0],scope:`${data.broker?.id}|${data.symbol}`,eventKey:strongSignalKey(events[0],data,tolerance)});
 },[data,now,tolerance,settings.h4Enabled,onNotify,onStrongSignal]);
 const w=habitWarnings(matrix?.rsColumns,data?.marketCycle,price,{target,now,stale:data?.marketDataStatus==='STALE_QUOTE'});
 const task=dailyTaskForColumn(data?.dailyH4Context,matrix?.rsColumns?.find(c=>c.timeframe==='1d'),w.daily?.value,now);
 useEffect(()=>{
  if(data?.marketDataStatus==='STALE_QUOTE' || !alertsEnabled || !onNotify || !result.available || now-(data?.timestamp||0)>45000)return;
  const scope=`${data?.broker?.id}|${data?.symbol}|${h4?.periodStart}|${tolerance}`;
  const update=nextH4Alerts(tracker.current,scope,result.groups,price,{distance:alertDistance,epsilon:10**(-digits)/2});
  if(update.events.length && now-lastAlert.current<10000)return;
  tracker.current=update.state;
  if(!update.events.length)return;
  lastAlert.current=now;
  const messages=update.events.slice(0,3).map(g=>`${g.type==='CROSSED'?'Melewati':g.type==='AT'?'Menyentuh':'Mendekati'} H4 ${levelName(g.key)} ${g.value.toFixed(digits)} · cocok ${[...new Set(g.matches.map(m=>m.label))].join(', ')} · jarak ${Math.abs(price-g.value).toFixed(digits)}`);
  onNotify('warning',`${data.symbol}: ${messages.join(' | ')}${update.events.length>3?` · +${update.events.length-3} area lain`:''}. Observasi harga, bukan konfirmasi entry/TP.`);
 },[data,price,now,tolerance,alertDistance,alertsEnabled,onNotify]);
 useEffect(()=>{
  if(!data||data.marketDataStatus==='STALE_QUOTE'||now-data.timestamp>45000||!enabled||!onNotify)return;
  const scope=`${data.broker?.id}|${data.symbol}`;
  if(prior.current!==scope){seen.current=new Set();prior.current=scope;}
  const notes=[...w.notes,...(task.hit?[{id:`last-h4:${task.hitStart}:${task.target}`,text:task.reason}]:[])];
  const pending=notes.filter(n=>!seen.current.has(`${n.id}:${data.marketCycle?.tradingDay}:${data.marketCycle?.activeSession}`));
  if(!pending.length)return;
  for(const n of pending)seen.current.add(`${n.id}:${data.marketCycle?.tradingDay}:${data.marketCycle?.activeSession}`);
  onNotify('warning',`${data.symbol}: ${pending.map(n=>n.text).join(' ')}`);
 },[data,now,target,enabled]);
 useEffect(()=>{
  if(!data||data.marketDataStatus==='STALE_QUOTE'||now-data.timestamp>45000||data.hsh?.hshSeverity!=='CRITICAL')return;
  const key=`${data.broker?.id}|${data.symbol}|${data.marketCycle?.tradingDay}|${data.hsh.hshMessage}`;
  if(critical.current.has(key))return;
  critical.current.add(key);onNotify('warning',data.hsh.hshMessage);
 },[data,now,onNotify]);
 return signals;
}

import {sourceIdentity} from '../sourceIdentity.mjs';
import {useSupportAlerts} from './useSupportAlerts';
import {h4Notice,strongNotice} from '../notificationCopy.mjs';
import {quoteIsStale} from '../analysisState.mjs';
import {strongSignals} from '../strongSignal.mjs';
import {strongSignalKey,newStrongSignalEvents} from '../strongSignalAlerts.mjs';
import {useCallback,useEffect,useRef} from 'react';
import {useLiveMatrix} from './useLiveMatrix';
import {h4LevelMatches} from '../h4LevelMatches.mjs';
import {nextH4Alerts} from '../h4Alerts.mjs';
import {allowMarketNotice} from '../marketNoticePolicy.mjs';
export function useAnalysisNotifications({data,liveTick,now,tolerance,target,settings,onNotify,onStrongSignal}) {
 const matrix=useLiveMatrix(data,liveTick,now,tolerance);
 const noticeState=useRef(null);
 const allowNotice=useCallback((kind,event,time)=>allowMarketNotice(noticeState,sourceIdentity(data),kind,event,time),[data?.broker?.id,data?.broker?.server,data?.broker?.sourceSession,data?.symbol]);
 const supportWatch=useSupportAlerts({data,liveTick,matrix,now,enabled:settings.dailyEnabled,onNotify,allowNotice});
 const price=Number(matrix?.currentPrice),digits=data?.decimals??3;
 const h4=matrix?.rsColumns?.find(c=>c.timeframe==='4h');
 const result=h4LevelMatches(matrix?.rsColumns,price,{decimals:digits,tolerance,now});
 const alertsEnabled=settings.h4Enabled,alertDistance=settings.distance;
 const tracker=useRef(null),signalScope=useRef(null),referencePrior=useRef(null);
 const signalSeen=useRef(new Set());
 const signals=strongSignals(matrix?.rsColumns||[],price,{now,tolerance,decimals:digits,cycle:data?.marketCycle,stale:quoteIsStale(data,now)});
 useEffect(()=>{
  const m=matrix?.referenceAnalysis;if(!m?.enabled)return;
  const scope=sourceIdentity(data),key=[m.plan.timeframe,m.plan.periodStart,m.plan.entryPrice,m.plan.stopLoss,m.side].join('|');
  const prior=referencePrior.current;referencePrior.current={scope,key,status:m.status};
  if(!prior||prior.scope!==scope||!settings.h4Enabled||quoteIsStale(data,now))return;
  const valid=['PLAN_VALID','STRONG'].includes(m.status),wasValid=['PLAN_VALID','STRONG'].includes(prior.status);
  if(prior.key===key&&prior.status===m.status)return;
  const status=valid?m.status:wasValid&&['CONFLICT','WAIT_CONFIRMATION'].includes(m.status)?'INVALIDATED':null;
  if(!status||!allowNotice('reference',{status,key},now))return;
  onNotify?.('warning',{title:status==='INVALIDATED'?'Rencana Puzzle ditahan':m.action+' · Puzzle COP TAH',statusLabel:status==='INVALIDATED'?'WAIT':m.status==='STRONG'?'SINYAL KUAT':'RENCANA VALID',symbol:data.symbol,source:data.broker?.name,page:'entries',body:m.reasons.join(' '),details:valid?[`TF ${m.plan.timeframe} · entry ${m.plan.entryPrice.toFixed(digits)} · SL ${m.plan.stopLoss.toFixed(digits)}`]:m.conflicts,next:'Buka Puzzle COP TAH untuk bukti dan periode konfirmasi.',caution:'Rencana analisis; bukan order atau jaminan hasil.'});
 },[data,now,matrix?.referenceAnalysis?.status,matrix?.referenceAnalysis?.plan?.entryPrice,settings.h4Enabled,onNotify,allowNotice]);
 useEffect(()=>{
  if(matrix?.referenceAnalysis?.enabled)return;
  if(!settings.h4Enabled||!data)return;
  const events=newStrongSignalEvents(signals,data,tolerance,signalSeen.current);
  const scope=sourceIdentity(data);
  const initial=signalScope.current!==scope;signalScope.current=scope;
  if(!events.length)return;
  for(const event of events)signalSeen.current.add(strongSignalKey(event,data,tolerance));
  const important=initial?[]:events.filter(event=>allowNotice('strong',event,now));
  if(!important.length)return;
  onNotify?.('warning',strongNotice(important,{symbol:data.symbol,source:data.broker?.name,decimals:digits}));
  onStrongSignal?.({...important[0],scope:sourceIdentity(data),eventKey:strongSignalKey(important[0],data,tolerance)});
 },[data,now,tolerance,settings.h4Enabled,onNotify,onStrongSignal]);
 useEffect(()=>{
  if(matrix?.referenceAnalysis?.enabled)return;
  if(quoteIsStale(data,now) || !alertsEnabled || !onNotify || !result.available || now-(data?.timestamp||0)>45000)return;
  const scope=`${sourceIdentity(data)}|${h4?.periodStart}|${tolerance}`;
  const update=nextH4Alerts(tracker.current,scope,result.groups,price,{distance:alertDistance,epsilon:10**(-digits)/2});
  tracker.current=update.state;
  const important=update.events.filter(event=>allowNotice('h4',event,now));
  if(!important.length)return;
  onNotify('warning',h4Notice(important,{symbol:data.symbol,source:data.broker?.name,price,decimals:digits}));
 },[data,price,now,tolerance,alertDistance,alertsEnabled,onNotify]);
 return {signals,supportWatch};
}

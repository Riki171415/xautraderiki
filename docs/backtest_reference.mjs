// Chronological replay. Current candles use only H1 already completed at decision
// time; completed native candles are never exposed before their actual close.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {buildReferenceAnalysis,referenceEnd}=require('../backend/reference_analysis');
const {calcLeak4RegMatrix}=require('../backend/rule_engine');
const root=path.resolve(import.meta.dirname,'..'),cache=path.join(root,'.cache/reference-history'),H=3600000;
const upper=(rows,time)=>{let lo=0,hi=rows.length;while(lo<hi){const m=(lo+hi)>>1;if(rows[m][0]<=time)lo=m+1;else hi=m;}return lo;};
function simulation(plan,hours,now,cancelAt=Infinity){
 const buy=plan.action==='BUY LIMIT',end=plan.periodEnd;let filled=false;
 for(let i=upper(hours,now-1);i<hours.length&&hours[i][0]<end;i++){
  const r=hours[i];if(r[0]<now)continue;
  if(!filled&&r[0]>=cancelAt)return {outcome:'CANCELLED_UNFILLED',exit:r[0]};
  if(i&&r[0]-hours[i-1][0]>H)return {outcome:'GAP_UNVERIFIED',exit:r[0]};
  const touch=r[3]<=plan.entryPrice&&plan.entryPrice<=r[2],sl=buy?r[3]<=plan.stopLoss:r[2]>=plan.stopLoss,tp=buy?r[2]>=plan.tp1:r[3]<=plan.tp1;
  if(!filled){
   if(!touch)continue;
   filled=true;
   // Entry and a terminal event in the same H1 have no proved order.
   if(sl||tp)return {outcome:'AMBIGUOUS_ENTRY_BAR',exit:r[0]+H};
  }else if(sl&&tp)return {outcome:'AMBIGUOUS_SL_TP',exit:r[0]+H};
  else if(sl)return {outcome:'SL',grossR:-1,exit:r[0]+H};
  else if(tp)return {outcome:'TP1',grossR:Math.abs(plan.tp1-plan.entryPrice)/Math.abs(plan.entryPrice-plan.stopLoss),exit:r[0]+H};
 }
 return {outcome:filled?'OPEN_AT_EXPIRY':'UNFILLED',exit:end};
}
const results=[];
for(const symbol of ['XAUUSD','EURUSD','GBPUSD']){
 const inputs={},native={};
 for(const tf of ['1h','4h','1d','1w','1M','30m','15m']){
  const name=path.join(cache,`${symbol}-${tf}.json`);if(!fs.existsSync(name))continue;
  inputs[tf]=JSON.parse(fs.readFileSync(name,'utf8'));native[tf]=inputs[tf].bars;
 }
 const hours=native['1h']||[];if(hours.length<100){results.push({symbol,status:'INSUFFICIENT_HISTORY'});continue;}
 const begin=hours[0][0],finish=hours.at(-1)[0]+H,split=begin+.7*(finish-begin),digits=inputs['1h'].digits;
 const coverage=Object.fromEntries(Object.entries(native).map(([tf,rows])=>[tf,{bars:rows.length,start:rows[0]?.[0]??null,end:rows.at(-1)?.[0]??null}]));
 const bucket=()=>({samples:0,statuses:{},candidates:0,conflicts:0,cancellations:0,newPlans:0,outcomes:{},grossR:0});
 const stats={development:bucket(),test:bucket()};let previous=null,lastPlan=null,busyUntil=0;const decisions=[];
 for(let i=240;i<hours.length-1;i+=4){
  const now=hours[i][0]+H,price=hours[i][4],histories={},map={};
  for(const [tf,rows] of Object.entries(native)){
   const index=upper(rows,now)-1;if(index<1)continue;
   const r=rows[index],end=referenceEnd(r,tf),complete=end<=now;
   let current=r;
   if(!complete){
    const a=upper(hours,r[0]-1),b=upper(hours,now-H),known=hours.slice(a,b);
    current=[r[0],r[1],Math.max(r[1],...known.map(x=>x[2])),Math.min(r[1],...known.map(x=>x[3])),known.at(-1)?.[4]??r[1],known.reduce((s,x)=>s+x[5],0)];
    // Native micro bars are complete at H1 decision boundaries. An exact
    // new opening bar contains Open only, no future High/Low/Close.
    if(['30m','15m'].includes(tf))current=[r[0],r[1],r[1],r[1],r[1],0];
   }
   const cap=tf==='1h'?300:tf==='1d'?14:tf==='30m'||tf==='15m'?8:5;
   histories[tf]=[...rows.slice(Math.max(0,index-cap),index),current];
   const eligible=histories[tf].filter(x=>tf!=='1d'||![0,6].includes(new Date(x[0]).getUTCDay()));
   if(!complete&&eligible.length>=2&&eligible.at(-1)[0]===current[0]){
    const asCandle=x=>({timestamp:x[0],periodEnd:referenceEnd(x,tf),open:x[1],high:x[2],low:x[3],close:x[4],volume:x[5]});
    map[tf]={ohlcv_N:asCandle(eligible.at(-1)),ohlcv_B:asCandle(eligible.at(-2))};
   }
  }
  const matrix=calcLeak4RegMatrix(map,price,0,digits),m=buildReferenceAnalysis({broker:'EXNESS',symbol,columns:matrix.rsColumns,histories,now,price,quoteTimestamp:now,decimals:digits,tolerance:0});
  const s=now<split?stats.development:stats.test;s.samples++;s.statuses[m.status]=(s.statuses[m.status]||0)+1;s.candidates+=m.candidates.length;if(m.conflicts.length)s.conflicts++;
  if(previous&&['PLAN_VALID','STRONG'].includes(previous)&&!['PLAN_VALID','STRONG'].includes(m.status))s.cancellations++;
  previous=m.status;
  decisions.push({now,action:m.action,side:m.side,plan:m.plan});
 }
 for(let j=0;j<decisions.length;j++){
  const m=decisions[j],now=m.now,s=now<split?stats.development:stats.test;
  if(m.action==='WAIT'||now<busyUntil)continue;
  const key=[m.plan.timeframe,m.plan.periodStart,m.action,m.plan.entryPrice,m.plan.stopLoss].join('|');if(key===lastPlan)continue;
  lastPlan=key;s.newPlans++;
  const boundary=now<split?Math.min(m.plan.periodEnd,split):Math.min(m.plan.periodEnd,finish);
  const cancelled=decisions.slice(j+1).find(d=>d.now<boundary&&(d.action==='WAIT'||d.side!==m.side||d.plan.periodStart!==m.plan.periodStart||d.plan.entryPrice!==m.plan.entryPrice));
  const trade=simulation({...m.plan,periodEnd:boundary},hours,now,cancelled?.now??Infinity);busyUntil=trade.exit;
  s.outcomes[trade.outcome]=(s.outcomes[trade.outcome]||0)+1;s.grossR+=trade.grossR||0;
 }
 results.push({symbol,status:'COMPLETED',source:inputs['1h'].server,coverage,requestedStart:inputs['1h'].requestedStart,requestedEnd:inputs['1h'].requestedEnd,splitTimestamp:split,developmentFraction:.7,stats,limitations:['Samples every four available H1 bars; no tick-level simulation.','M1/M5 unavailable for historical puzzle; M15/M30 shorter than ten years.','Current macro candle is reconstructed from completed H1 only. Missing hours mean partial evidence, not fabricated candles.','Simulation reports first TP only; spread, commission, swap and slippage excluded. Gross R is not net performance.','Same-bar entry/SL/TP has unknown order and is marked ambiguous; gaps are not assigned profit.','No parameter tuning on the final chronological 30 percent. One simulated plan at a time per instrument.']});
 console.log(JSON.stringify({symbol,stats}));
}
fs.writeFileSync(path.join(root,'docs/reference-backtest-results.json'),JSON.stringify({generatedAt:new Date().toISOString(),modelVersion:1,ruleSHA256:createHash('sha256').update(fs.readFileSync(path.join(root,'backend/reference_analysis.js'))).digest('hex'),results},null,2));

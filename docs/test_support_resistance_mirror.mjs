import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {dailyLevelStrength} from '../frontend/src/rvsLimit.mjs';
const require=createRequire(import.meta.url),{calcRSMatrix}=require('../backend/rule_engine.js');
const source=JSON.parse(fs.readFileSync(new URL('./exness-h1-volatility-source.json',import.meta.url)));
const bars=source.bars;
function aggregate(key){const map=new Map();for(const b of bars){const k=key(new Date(b.time*1000));if(!map.has(k))map.set(k,{key:k,open:b.open,high:b.high,low:b.low,close:b.close,bars:[]});const g=map.get(k);g.high=Math.max(g.high,b.high);g.low=Math.min(g.low,b.low);g.close=b.close;g.bars.push(b);}return [...map.values()];}
const days=aggregate(d=>d.toISOString().slice(0,10)),months=aggregate(d=>d.toISOString().slice(0,7));
const rounded=v=>Number(v.toFixed(3));
const stats=()=>({eligibleLevelHours:0,touchedLevelHours:0,closeHeld:0,closeFailed:0,closeAt:0,uniqueHours:new Set()});
const result={support:stats(),resistance:stats()},baseline={support:stats(),resistance:stats()};
let dayCount=0,mirrorChecks=0;const dailyExamples=[];
for(let i=1;i<days.length;i++){
 const d=days[i],b=days[i-1],mi=months.findIndex(m=>m.key===d.key.slice(0,7));
 if(mi<2||b.bars.length<20||d.bars.length<20)continue;
 // Ignore the first (partial) source month and any unfinished last day.
 if(d.key===days.at(-1).key)continue;
 const month=months[mi],beforeMonth=months[mi-1];
 const dr=calcRSMatrix(b,d,'1d'),mr=calcRSMatrix(beforeMonth,month,'1M');if(!dr.available||!mr.available)continue;
 const start=Date.parse(d.key+'T00:00:00Z');
 const column={timeframe:'1d',periodStart:start,periodEnd:start+86400000,lowB:b.low,highB:b.high,pivot:rounded(dr.pivot)};
 for(let n=1;n<=4;n++){column['sup'+n]=rounded(dr['s'+n]);column['res'+n]=rounded(dr['r'+n]);}
 const monthColumn={timeframe:'1M',pivot:rounded(mr.pivot),periodStart:Date.parse(month.key+'-01T00:00:00Z'),periodEnd:Date.UTC(Number(month.key.slice(0,4)),Number(month.key.slice(5,7)),1)};
 dayCount++;
 for(const hour of d.bars){
  const now=hour.time*1000,price=hour.open;
  for(const side of ['support','resistance'])for(const key of ['pivot',...Array.from({length:4},(_,n)=>(side==='support'?'sup':'res')+(n+1))]){
   const r=dailyLevelStrength([column,monthColumn],key,{now,price,decimals:3});
   const v=column[key],support=side==='support';
   // Inverse of resistance: swap < for >, High B for Low B, R for S.
   const mirrored=support?v<price-.0005&&v>monthColumn.pivot+.0005&&v>b.low+.0005:v>price+.0005&&v<monthColumn.pivot-.0005&&v<b.high-.0005;
   assert.equal(r[side],mirrored);mirrorChecks++;
   for(const [collection,eligible] of [[result,r[side]],[baseline,support?v<price-.0005&&v>b.low+.0005:v>price+.0005&&v<b.high-.0005]]){
    if(!eligible)continue;const s=collection[side];s.eligibleLevelHours++;
    if(!(hour.low<=v&&hour.high>=v))continue;
    s.touchedLevelHours++;s.uniqueHours.add(hour.time);
    const delta=(hour.close-v)*(support?1:-1);
    if(delta>.0005)s.closeHeld++;else if(delta<-.0005)s.closeFailed++;else s.closeAt++;
   }
  }
 }
 if(d.key>='2026-10-01')dailyExamples.push({dayUTC:d.key,pivotMonth:monthColumn.pivot,lowB:b.low,highB:b.high,open:d.open,low:d.low,high:d.high,close:d.close});
}
function pack(group){return Object.fromEntries(Object.entries(group).map(([k,s])=>[k,{...s,uniqueHours:s.uniqueHours.size,closeHeldPercent:s.touchedLevelHours?Number((100*s.closeHeld/s.touchedLevelHours).toFixed(2)):null}]));}
const report={source:source.source,symbol:source.symbol,first:new Date(bars[0].time*1000).toISOString(),last:new Date(bars.at(-1).time*1000).toISOString(),dayCount,mirrorChecks,mirrorMismatches:0,method:'UTC-reconstructed Daily and Month from H1; prior completed period OHLC and current period open only for levels. Candidate fixed at each H1 open, touch if H1 range includes level, outcome at H1 close. At least 20 H1 bars on current/prior day, first partial month and last partial day excluded. Not broker-native D1/MN1, not tick backtest or trading win rate. Level-hours overlap and are not independent.',currentAndMirrored:pack(result),withoutMonthFilterExploratoryOnly:pack(baseline),recentDays:dailyExamples};
fs.writeFileSync(new URL('./support-resistance-mirror-results.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,recentDays:report.recentDays.slice(-4)},null,2));

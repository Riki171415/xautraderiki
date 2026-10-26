import fs from 'node:fs';
import {createRequire} from 'node:module';
import {supportAreas,supportZones,confirmedSupportSwings,nextSupportAlerts} from '../frontend/src/supportAlerts.mjs';
import {dailyLevelStrength} from '../frontend/src/rvsLimit.mjs';
const {calcRSMatrix}=createRequire(import.meta.url)('../backend/rule_engine.js');
const load=tf=>JSON.parse(fs.readFileSync(new URL(`./exness-support-audit-${tf}.json`,import.meta.url)));
const inputs=Object.fromEntries(['h1','h4','d1','w1','mn1','m1'].map(tf=>[tf,load(tf)]));
const bad={};for(const [tf,d]of Object.entries(inputs)){bad[tf]=d.bars.filter((r,i)=>![r.time,r.open,r.high,r.low,r.close].every(Number.isFinite)||r.low<=0||r.low>Math.min(r.open,r.close)||r.high<Math.max(r.open,r.close)||(i&&r.time<=d.bars[i-1].time)).length;if(bad[tf])throw new Error(`Invalid ${tf}: ${bad[tf]}`);}
const sources=[['h1','1h',3600000],['h4','4h',14400000],['d1','1d',86400000],['w1','1w',7*86400000],['mn1','1M',null]];
function indexAt(bars,t){let lo=0,hi=bars.length-1,out=-1;while(lo<=hi){const m=(lo+hi)>>1;if(bars[m].time*1000<=t){out=m;lo=m+1;}else hi=m-1;}return out;}
const round=v=>Number(v.toFixed(3));
function columnsAt(now){return sources.flatMap(([name,timeframe,duration])=>{
 const rows=inputs[name].bars,i=indexAt(rows,now);if(i<1)return [];
 const n=rows[i],b=rows[i-1],date=new Date(n.time*1000);
 const periodEnd=duration?n.time*1000+duration:Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1);
 if(now>=periodEnd)return [];
 const rs=calcRSMatrix(b,{open:n.open},timeframe);if(!rs.available)return [];
 const c={timeframe,periodStart:n.time*1000,periodEnd,openN:n.open,openB:b.open,lowB:b.low,highB:b.high,pivot:round(rs.pivot)};
 for(let j=1;j<=4;j++){c['sup'+j]=round(rs['s'+j]);c['res'+j]=round(rs['r'+j]);}return[c];
 });}
const hours=inputs.h1.bars,rawHours=hours.map(b=>[b.time*1000,b.open,b.high,b.low,b.close]);
let cacheHour=-1,cacheColumns=[],cacheSwings=[];
function areasAt(t){const i=indexAt(hours,t);if(i!==cacheHour){cacheHour=i;cacheColumns=columnsAt(t);cacheSwings=confirmedSupportSwings(rawHours.slice(Math.max(0,i-241),i+1),t,1);}return{columns:cacheColumns,areas:[...supportAreas(cacheColumns,t),...cacheSwings]};}
const blank=()=>({hours:0,strongUpHours:0,oldDailyCovered:0,newAreasCovered:0,oldOnlyCovered:0,newOnlyCovered:0,oldTouches:0,oldCloseAbove:0,newTouches:0,newCloseAbove:0});
const buckets={development2016_2023:blank(),validation2024:blank(),comparison2025_2026:blank()};
const yearOf=t=>new Date(t).getUTCFullYear(),bucket=t=>yearOf(t)<=2023?buckets.development2016_2023:yearOf(t)===2024?buckets.validation2024:buckets.comparison2025_2026;
for(let i=15;i<hours.length-1;i++){
 const b=hours[i],t=b.time*1000;if(t<Date.UTC(2016,9,20)||t>=Date.UTC(2026,9,20))continue;
 const {columns,areas}=areasAt(t),s=bucket(t),atr=hours.slice(i-14,i).reduce((sum,r)=>sum+r.high-r.low,0)/14;
 const daily=columns.find(c=>c.timeframe==='1d');if(!daily)continue;
 const old=['pivot','sup1','sup2','sup3','sup4'].filter(key=>dailyLevelStrength(columns,key,{now:t,price:b.open,decimals:3}).support).map(key=>daily[key]);
 const candidates=supportZones(areas,1).filter(z=>z.high<=b.open);
 s.hours++;
 for(const v of old)if(b.low<=v&&b.high>=v){s.oldTouches++;if(b.close>v)s.oldCloseAbove++;}
 for(const z of candidates)if(b.low<=z.high&&b.high>=z.low){s.newTouches++;if(b.close>z.high)s.newCloseAbove++;}
 // Outcome-defined sample, used only for evaluation AFTER the hour, never as a live feature.
 if(b.close-b.open>=atr*.5&&b.close-b.low>=atr){
  s.strongUpHours++;
  const oldHit=old.some(v=>Math.abs(b.low-v)<=1),newHit=candidates.some(z=>b.low>=z.low-1&&b.low<=z.high+1);
  if(oldHit)s.oldDailyCovered++;if(newHit)s.newAreasCovered++;if(newHit&&!oldHit)s.newOnlyCovered++;if(oldHit&&!newHit)s.oldOnlyCovered++;
 }
}
const m=inputs.m1.bars;
function replay(config){
 const events=[];let state=null;cacheHour=-1;
 for(let i=1;i<m.length-1;i++){
  const r=m[i],t=r.time*1000,{columns,areas}=areasAt(t);
  const u=nextSupportAlerts(state,{scope:'Exness|XAUUSDc',columns,areas,price:r.open,timestamp:t,now:t,distance:1,decimals:3,maxGapMs:90000,windowMs:180000,...config});state=u.state;
  for(const e of u.events)events.push({time:t,stage:e.stage,low:e.low,high:e.high,price:r.open,index:i});
 }
 const stageCounts={};for(const e of events)stageCounts[e.stage]=(stageCounts[e.stage]||0)+1;
 const outcome=filtered=>{
  const s={with30Minutes:0,aboveAreaAt30m:0,belowAreaAt30m:0,brokenWithin30m:0};
  for(const e of filtered){const i=e.index,j=i+30;if(j>=m.length||m[j].time-m[i].time!==1800)continue;s.with30Minutes++;if(m[j].open>e.high)s.aboveAreaAt30m++;else s.belowAreaAt30m++;if(m.slice(i+1,j+1).some(b=>b.low<e.low-1))s.brokenWithin30m++;}return s;
 };
 const bounces=events.filter(e=>e.stage==='BOUNCE');
 return{config,stageCounts,developmentAugSep:outcome(bounces.filter(e=>e.time<Date.UTC(2026,9,1))),comparisonOctober:outcome(bounces.filter(e=>e.time>=Date.UTC(2026,9,1))),all:outcome(bounces)};
}
const replayVariants={early:replay({confirmationMs:0,reboundMultiplier:1}),sustained:replay({confirmationMs:60000,reboundMultiplier:2})};
const report={source:'MT5 Exness XAUUSDc',requestedWindow:{from:'2016-10-20',to:'2026-10-20'},coverage:Object.fromEntries(Object.entries(inputs).map(([tf,d])=>[tf,{bars:d.bars.length,first:new Date(d.bars[0].time*1000).toISOString(),last:new Date(d.bars.at(-1).time*1000).toISOString(),invalid:bad[tf]}])),method:'Native D1/H4/W1/MN1 and H1; levels use only previous period OHLC and current open. Swing lows require two subsequent closed H1 candles; later broken swings removed. Fixed band=1, no optimization. Strong-up evaluation = H1 close-open >=0.5 preceding 14-H1 average range AND close-low >= preceding average range. Low-to-area distance <=1 measures retrospective coverage, NOT advance alert recall or win rate. Areas include H1/H4/D1/W1/MN1 Pivot/S1-S4/LowB and confirmed H1 swings. Final day excluded from H1 outcomes. Current partial M1 excluded.',buckets,minuteReplay:{method:'Chronological M1 OPEN samples only. maxGap=90sec instead of live 10sec because samples are one minute apart. Same area state machine, 3-minute response window. No assumed path within OHLC. This does not validate live tick confirmation precision.',first:new Date(m[1].time*1000).toISOString(),last:new Date(m.at(-2).time*1000).toISOString(),variants:replayVariants},limitations:['No claim that all reversals are identifiable before they happen.','No tick history for ten years. Minute replay spans about two months only.','Coverage can improve simply by adding more levels; not statistical evidence of predictive edge.','Observations and levels overlap; no independent-trade assumption.','Exploratory chronological comparisons, not a pristine independent holdout. Design revisions followed initial examination of this dataset; thresholds are not proven predictive.']};
fs.writeFileSync(new URL('./support-ten-year-results.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

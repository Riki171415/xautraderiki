import fs from 'node:fs';
import {dailyLevelStrength} from '../frontend/src/rvsLimit.mjs';
import {nextSupportAlerts} from '../frontend/src/supportAlerts.mjs';
const source=JSON.parse(fs.readFileSync(new URL('./exness-h1-volatility-source.json',import.meta.url)));
const bars=source.bars;
const valid=bars.filter((b,i)=>[b.open,b.high,b.low,b.close,b.time].every(Number.isFinite)&&b.low<=Math.min(b.open,b.close)&&b.high>=Math.max(b.open,b.close)&&(!i||b.time>bars[i-1].time));
const stats={tested:0,touched:0,closedAbove:0,closedBelow:0,closedAt:0};
const examples=[];
for(let i=1;i<bars.length;i++){
 const b=bars[i],p=bars[i-1];if(b.time-p.time!==3600||b.open<p.low)continue;
 stats.tested++;if(b.low>p.low)continue;
 stats.touched++;if(b.close>p.low)stats.closedAbove++;else if(b.close<p.low)stats.closedBelow++;else stats.closedAt++;
 if(b.low>=4110&&b.low<=4113)examples.push({timeWIB:new Date((b.time+7*3600)*1000).toISOString().replace('T',' ').slice(0,19)+' WIB',knownLowB:p.low,open:b.open,high:b.high,low:b.low,close:b.close,closeRelativeToLowB:b.close-p.low});
}
const daily={timeframe:'1d',periodStart:0,periodEnd:1000000,lowB:80,highB:120,pivot:100,sup1:95,res1:105};
const reading=dailyLevelStrength([daily,{timeframe:'1M',pivot:110}],'res1',{now:100,price:106});
const col={timeframe:'1h',periodStart:0,periodEnd:1000000,sup1:100};
const fromBelow=nextSupportAlerts(null,{scope:'audit',columns:[col],price:100,timestamp:100000,now:100000});
const initial=nextSupportAlerts(null,{scope:'audit',columns:[col],price:100,timestamp:100000,now:100000});
let follow=nextSupportAlerts(initial.state,{scope:'audit',columns:[col],price:100.5,timestamp:101000,now:101000});
follow=nextSupportAlerts(follow.state,{scope:'audit',columns:[col],price:101.5,timestamp:102000,now:102000});
const report={source:source.source,symbol:source.symbol,first:new Date(bars[0].time*1000).toISOString(),last:new Date(bars.at(-1).time*1000).toISOString(),bars:bars.length,validBars:valid.length,method:'Prior completed H1 Low B, consecutive hours only, open at/above prior Low B. Touch from hourly low; outcome at same-hour close. No intrabar path assumed. Not a tick-alert backtest or win rate.',stats,examples:examples.slice(-5),reproductions:{resistanceFamilyBelowPrice:{key:'res1',role:reading.role,status:reading.status},initialTouch:{events:initial.events.map(e=>e.stage),followupEvents:follow.events.map(e=>e.stage)},touchWithoutPriorApproach:fromBelow.events.map(e=>e.stage)}};
fs.writeFileSync(new URL('./support-historical-audit.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

import fs from 'node:fs';
import {createRequire} from 'node:module';
import {timeframeLevelStrength} from '../frontend/src/rvsLimit.mjs';
const require=createRequire(import.meta.url),{calcRSMatrix}=require('../backend/rule_engine.js'),{aggregateMonths}=require('../backend/mt5_data.js');
const load=tf=>JSON.parse(fs.readFileSync(`docs/exness-support-audit-${tf}.json`)).bars;
const native=Object.fromEntries([['1h','h1'],['4h','h4'],['1d','d1'],['1w','w1'],['1M','mn1']].map(([tf,file])=>[tf,load(file)]));
const rawMonths=native['1M'].map(b=>[b.time*1000,b.open,b.high,b.low,b.close,b.tick_volume]);
for(const [tf,n]of [['3M',3],['6M',6],['1Y',12]])native[tf]=aggregateMonths(rawMonths,n).map(r=>({time:r[0]/1000,open:r[1],high:r[2],low:r[3],close:r[4]}));
function pairAt(rows,now){let lo=0,hi=rows.length-1,i=-1;while(lo<=hi){const m=(lo+hi)>>1;if(rows[m].time*1000<=now){i=m;lo=m+1;}else hi=m-1;}return i>=1?[rows[i-1],rows[i]]:null;}
const result={};
for(const h of native['1h'].slice(1,-1)){
 const now=h.time*1000,columns=[];
 for(const [tf,rows]of Object.entries(native)){
  const pair=pairAt(rows,now);if(!pair)continue;const [b,n]=pair,rs=calcRSMatrix(b,{open:n.open},tf);if(!rs.available)continue;
  const d=new Date(n.time*1000),monthStep={'1M':1,'3M':3,'6M':6,'1Y':12}[tf];
  const duration={'1h':3600000,'4h':14400000,'1d':86400000,'1w':604800000}[tf];
  const c={timeframe:tf,periodStart:n.time*1000,periodEnd:monthStep?Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+monthStep,1):n.time*1000+duration,lowB:b.low,highB:b.high,pivot:Number(rs.pivot.toFixed(3))};
  for(let j=1;j<=4;j++){c['sup'+j]=Number(rs['s'+j].toFixed(3));c['res'+j]=Number(rs['r'+j].toFixed(3));}columns.push(c);
 }
 for(const c of columns){const s=result[c.timeframe]??={assessed:0,strongSupport:0,strongResistance:0,unverified:0};for(const key of ['pivot','sup1','sup2','sup3','sup4','res1','res2','res3','res4']){const r=timeframeLevelStrength(columns,c.timeframe,key,{now,price:h.open,decimals:3});s.assessed++;if(!r.valid)s.unverified++;if(r.support)s.strongSupport++;if(r.resistance)s.strongResistance++;if(r.support&&r.resistance)throw new Error('Contradictory role');}}
}
const report={source:'MT5 Exness XAUUSDc',method:'Chronological rule evaluation on native H1/H4/D1/W1/MN1 and month-derived Quarter/Semester/Year, sampled at H1 opens. Input levels use previous OHLC and current open only. Counts are level-hours, not predictive success rates. No complete Decade before-period in this exported dataset: Year abstains. Micro TF and Market covered by rule unit tests, not this ten-year replay.',result};
fs.writeFileSync('docs/multitf-strength-history-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

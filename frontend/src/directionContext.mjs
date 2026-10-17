import {calcHukumPerahu} from 'virtual:coptah/rule_engine';
import {levelName} from './h4LevelMatches.mjs';
const n=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const order=['1m','5m','15m','30m','1h','4h','market','1d','1w','1M','3M','6M','1Y'];
const keys=['pivot','sup1','sup2','sup3','sup4','res1','res2','res3','res4'];
const active=(c,now)=>!!c&&(!Number.isFinite(c.periodEnd)||Number.isFinite(c.periodStart)&&c.periodStart<=now&&now<c.periodEnd);
const compare=(a,b)=>a==null||b==null?'UNAVAILABLE':a>b?'UP':a<b?'DOWN':'EQV';
export function directionReading(column,{now=Date.now(),stale=false}={}) {
 const c=column,o=n(c?.openN),ob=n(c?.openB),close=n(c?.closeN),pivot=n(c?.pivot);
 const high=n(c?.highN),low=n(c?.lowN),hb=n(c?.highB),lb=n(c?.lowB);
 const available=active(c,now)&&!stale;
 const rangeValid=high!=null&&low!=null&&hb!=null&&lb!=null&&high>=low&&hb>=lb;
 const pattern=o!=null&&ob!=null&&rangeValid?calcHukumPerahu({open:o,high,low},{open:ob,high:hb,low:lb}).pattern:null;
 const components=[{key:'jika',label:'JIKA',a:o,b:ob,direction:compare(o,ob)},{key:'move',label:'MOVE',a:close,b:o,direction:compare(close,o)},{key:'opPv',label:'OP–PV',a:o,b:pivot,direction:compare(o,pivot)},{key:'perahu',label:'Perahu',pattern,direction:pattern==='NEUTRAL'?'EQV':pattern?.endsWith('UP')?'UP':pattern?.endsWith('DWN')?'DOWN':'UNAVAILABLE'}].map(x=>({...x,direction:available?x.direction:'UNAVAILABLE'}));
 const dirs=components.map(x=>x.direction),mixed=dirs.includes('UP')&&dirs.includes('DOWN');
 const weakened=available&&dirs[2]!=='UNAVAILABLE'?(dirs[2]==='DOWN'&&[dirs[0],dirs[1],dirs[3]].includes('UP')?'UP':dirs[2]==='UP'&&[dirs[0],dirs[1],dirs[3]].includes('DOWN')?'DOWN':null):null;
 const anomaly=available&&pattern?.startsWith('ANL')?pattern:null;
 const sequence=keys.map(k=>({key:k,value:n(c?.[k])}));
 const ascending=['sup4','sup3','sup2','sup1','pivot','res1','res2','res3','res4'].map(k=>n(c?.[k]));
 const rsAnomaly=available&&(!!c?.anomalies?.length||ascending.some((v,i)=>i&&v!=null&&ascending[i-1]!=null&&v<ascending[i-1]));
 const flags=available?[...(mixed?['CAMPUR']:[]),...(weakened?[weakened==='UP'?'NAIK MELEMAH':'TURUN MELEMAH']:[]),...(anomaly?[anomaly]:[]),...(rsAnomaly?['R/S ANOMALI']:[]),...(mixed?['PANTAU R1–S1']:[])]:[];
 return {timeframe:c?.timeframe,available,components,mixed,weakened,anomaly,rsAnomaly,flags,levels:sequence,range:{primary:{high:n(c?.res1),low:n(c?.sup1)},alternative:{high:n(c?.res2),low:n(c?.sup2)}},anomalyBoundary:anomaly?{key:anomaly.endsWith('UP')?'highB':'lowB',value:anomaly.endsWith('UP')?hb:lb}:null};
}
export function directionContext(columns=[],timeframe,options={}) {
 const now=options.now??Date.now(),column=columns.find(c=>c.timeframe===timeframe),reading=directionReading(column,options),epsilon=10**(-(options.decimals??3))/2+1e-9,tolerance=Math.max(0,Number(options.tolerance)||0)+epsilon;
 const pairs=reading.available?keys.flatMap(key=>{const value=n(column?.[key]);return value==null?[]:columns.filter(c=>order.indexOf(c.timeframe)>order.indexOf(timeframe)&&active(c,now)).flatMap(c=>keys.flatMap(k=>{const v=n(c[k]);return v!=null&&Math.abs(value-v)<=tolerance?[{key,value,timeframe:c.timeframe,level:k,target:v,delta:Math.abs(value-v)}]:[];}));}):[];
 const daily=columns.find(c=>c.timeframe==='1d'),week=columns.find(c=>c.timeframe==='1w'),d=directionReading(daily,options),h4=directionReading(columns.find(c=>c.timeframe==='4h'),options),h1=directionReading(columns.find(c=>c.timeframe==='1h'),options);
 const scenarios=[];
 if(timeframe==='1d'&&d.available&&active(week,now)&&(d.mixed||d.anomaly||d.rsAnomaly)&&n(week.pivot)!=null){
 const move=d.components.find(x=>x.key==='move').direction;
 if(['UP','DOWN'].includes(move))scenarios.push({label:'CADANGAN · PIVOT WEEK',value:n(week.pivot),note:`Daily bergerak ${move==='UP'?'naik':'turun'} tetapi pembacaan konflik/anomali. Pantau kemungkinan kembali ke Pivot Week; bukan kepastian pembalikan.`});
 }
 const get=(r,k)=>r.components.find(c=>c.key===k)?.direction;
 if(timeframe==='1d'&&d.available)for(const side of ['BUY','SELL']){
 const buy=side==='BUY',key=buy?'sup1':'res1',pair=pairs.find(p=>p.key===key&&p.timeframe==='1w'&&p.level==='pivot');if(!pair)continue;
 const direction=buy?'UP':'DOWN',confirmed=get(h4,'jika')===direction||get(h1,'jika')===direction&&get(h1,'opPv')===direction;
 scenarios.push({label:`PANTULAN ${buy?'NAIK':'TURUN'} · ${levelName(key)} DAILY ↔ PIVOT WEEK`,value:pair.target,note:`${confirmed?'Konfirmasi arah saat ini sesuai':'Menunggu'}: JIKA H4 ${direction}, atau JIKA H1 ${direction} + OP–PV H1 ${direction}. Reaksi pantulan dan urutannya belum terbukti.`});
 const reversal=n(daily[buy?'lowB':'highB']);if(reversal!=null&&(buy?reversal<pair.target:reversal>pair.target))scenarios.push({label:`PEMICU CADANGAN ${buy?'TURUN':'NAIK'} · RVS DAILY`,value:reversal,note:'Level pantauan stop; bukan order aktif dan tidak mengganti tiket H4.'});
 }
 if(timeframe==='1d'&&d.available&&(d.mixed||d.anomaly||d.rsAnomaly)){
 const area=n(daily.pivot),h=columns.find(c=>c.timeframe==='4h');
 for(const [side,key] of [['BUY','highB'],['SELL','lowB']]){const value=n(h?.[key]);if(active(h,now)&&area!=null&&value!=null&&(side==='BUY'?value>area:value<area))scenarios.push({label:`PEMICU CADANGAN ${side} · RVS H4`,value,note:`Alternatif terhadap area Pivot Daily ${area}; bukan entry otomatis, SL/TP baru belum ditetapkan.`});}
 const asia=columns.find(c=>c.timeframe==='market'&&c.sessionName==='ASIA');
 if(active(asia,now)&&area!=null)for(const [side,key] of [['BUY','res1'],['SELL','sup1']]){const value=n(asia[key]);if(value!=null&&(side==='BUY'?value>area:value<area))scenarios.push({label:`PEMICU CADANGAN ${side} · ${levelName(key)} ASIA`,value,note:'Alternatif pantauan sesi ASIA terverifikasi; bukan order aktif.'});}
 }
 return {...reading,pairs,scenarios};
}
export function signalConflicts(columns,signal,options={}) {
 const frames=[...new Set([signal?.timeframe,'4h','1d',signal?.target?.timeframe].filter(Boolean))];
 return frames.flatMap(tf=>{const r=directionReading(columns?.find(c=>c.timeframe===tf),options);return r.flags.length?[{timeframe:tf,flags:r.flags}]:[];});
}

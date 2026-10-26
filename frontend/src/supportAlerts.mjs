import {matchesFeed} from './sourceIdentity.mjs';
const numeric=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
export function supportAreas(columns=[],now=Date.now()) {
 return columns.filter(c=>!c.unavailable&&Number.isFinite(c.periodStart)&&Number.isFinite(c.periodEnd)&&c.periodStart<=now&&now<c.periodEnd).flatMap(c=>['pivot','sup1','sup2','sup3','sup4','lowB'].flatMap(key=>{const value=numeric(c[key]);return value==null||value<=0?[]:[{id:`${c.timeframe}|${c.periodStart}|${key}|${value}`,timeframe:c.timeframe,label:key==='lowB'?'Low B':key==='pivot'?'Pivot':key.replace('sup','S'),value,availableAt:c.periodStart}];}));
}
export function supportDistance(symbol,decimals=3) {
 const s=String(symbol).replace('/','').toUpperCase();
 return Math.max(2*10**(-decimals),/^(EUR|GBP)USD/.test(s)?.0001:/^BTC/.test(s)?25:1);
}
// A swing is known only after two subsequent H1 candles have CLOSED.
export function confirmedSupportSwings(hourly=[],now=Date.now(),distance=1) {
 const rows=hourly.filter(r=>Array.isArray(r)&&r.length>=5&&r.slice(0,5).every(Number.isFinite)&&r[0]+3600000<=now&&r[0]>=now-10*86400000&&r[3]>0&&r[3]<=Math.min(r[1],r[4])&&r[2]>=Math.max(r[1],r[4])).sort((a,b)=>a[0]-b[0]);
 const result=[];
 for(let i=2;i<rows.length-2;i++){
  const window=rows.slice(i-2,i+3),r=rows[i];
  if(window.some((b,j)=>j&&b[0]-window[j-1][0]!==3600000))continue;
  if(!window.every((b,j)=>j===2||r[3]<b[3]))continue;
  if(rows.slice(i+3).some(b=>b[4]<r[3]-distance))continue;
  result.push({id:`swing|${r[0]}|${r[3]}`,timeframe:'1h',label:'Swing Low H1',value:r[3],availableAt:rows[i+2][0]+3600000});
 }
 return result.slice(-20);
}
export function supportZones(areas=[],distance=1) {
 const zones=[];
 for(const area of [...areas].sort((a,b)=>a.value-b.value)){
  let zone=zones.at(-1);
  if(!zone||area.value-zone.low>distance/2){zone={id:area.id,value:area.value,low:area.value,high:area.value,members:[]};zones.push(zone);}
  zone.members.push(area);zone.high=area.value;zone.value=(zone.low+zone.high)/2;
 }
 const priority=['1Y','6M','3M','1M','1w','1d','market','4h','1h','30m','15m','5m','1m'];
 return zones.map(z=>{const anchor=[...z.members].sort((a,b)=>{const rank=m=>{const i=priority.indexOf(m.timeframe);return i<0?99:i;};return rank(a)-rank(b)||a.id.localeCompare(b.id);})[0];return {...z,id:anchor.id,timeframe:[...new Set(z.members.map(m=>m.timeframe))].join('/'),label:z.members.length>1?`${z.members.length} level berdekatan`:z.members[0].label};});
}
export function supportObservation(data,matrix,liveTick,now=Date.now()) {
 const tick=matchesFeed(data,liveTick)&&Number.isFinite(liveTick.bid)&&Number.isFinite(liveTick.timestamp)&&liveTick.timestamp<=now&&now-liveTick.timestamp<=10000?liveTick:null;
 const quoteTime=data?.quoteTimestamp??data?.referencePrice?.priceTimestamp;
 // Never attach a newer snapshot time to an older cached tick price.
 if(tick&&(!Number.isFinite(quoteTime)||tick.timestamp>=quoteTime))return {price:tick.bid,timestamp:tick.timestamp};
 const raw=data?.referencePrice?.price??data?.leak4RegMatrix?.currentPrice;
 return {price:numeric(raw),timestamp:quoteTime};
}
// Source observations establish order; candle ranges never manufacture a tick path.
export function nextSupportAlerts(previous,{scope,columns=[],areas,price,timestamp,now=Date.now(),stale=false,distance=1,decimals=3,maxGapMs=10000,windowMs=180000,confirmationMs=60000,reboundMultiplier=2}) {
 const empty={scope,lastTime:0,lastPrice:null,levels:{}};
 let state=previous?.scope===scope?previous:empty;
 const epsilon=10**(-decimals)/2,band=Math.max(distance,epsilon*4);
 const zones=supportZones((areas??supportAreas(columns,now)).filter(a=>Number.isFinite(a.value)&&a.value>0&&(!Number.isFinite(a.availableAt)||a.availableAt<=timestamp&&a.availableAt<=now)),band);
 const valid=!stale&&Number.isFinite(price)&&Number.isFinite(timestamp)&&timestamp<=now&&now-timestamp<=maxGapMs;
 if(!valid){
  const levels=Object.fromEntries(Object.entries(state.levels).map(([id,item])=>[id,{...item,phase:item.phase==='BROKEN'?'BROKEN':'WAITING',touchTime:null,rises:0}]));
  return {state:{...state,lastTime:0,lastPrice:null,levels},events:[],zones,available:false};
 }
 if(timestamp<=state.lastTime)return {state,events:[],zones,available:true};
 const continuous=state.lastTime>0&&timestamp-state.lastTime<=maxGapMs;
 const events=[],levels={};
 for(const area of zones){
  const old=state.levels[area.id],item={...old};
  const emit=stage=>{if(!item['sent'+stage]){events.push({...area,stage});item['sent'+stage]=true;}};
  if(!continuous||!old){item.phase=item.phase==='BROKEN'?'BROKEN':'WAITING';item.touchTime=null;item.rises=0;item.fromAbove=false;item.aboveSince=null;}
  const below=price<area.low-band,above=price>area.high+band,inArea=price>=area.low-band&&price<=area.high+band;
  const approached=continuous&&!!old&&state.lastPrice>area.high+epsilon;
  if(below){
   if(['TESTING','BOUNCE','NEAR'].includes(item.phase))emit('BREAK');
   item.phase='BROKEN';item.touchTime=null;item.rises=0;item.aboveSince=null;
  }else if(item.phase==='BROKEN'){
   // A recovery is not yet a support retest. Require a new return from above.
   if(above){item.phase='ABOVE';item.fromAbove=true;}
  }else if(inArea&&price<=area.high+epsilon){
   if(!item.touchTime){item.touchTime=timestamp;item.minimum=price;item.fromAbove=approached;item.rises=0;emit(approached?'TOUCH':'AREA');}
   item.phase='TESTING';item.minimum=Math.min(item.minimum??price,price);item.aboveSince=null;item.rises=0;
  }else if(item.touchTime){
   if(timestamp-item.touchTime>windowMs){item.phase=above?'ABOVE':'WAITING';item.touchTime=null;item.rises=0;}
   else if(continuous){
    item.minimum=Math.min(item.minimum,price);
    // Count at most one rise per second; repeated clock renders cannot confirm a bounce.
    if(!item.lastRiseTime||timestamp-item.lastRiseTime>=1000){item.rises=price>state.lastPrice+epsilon?(item.rises||0)+1:0;item.lastRiseTime=timestamp;}
    if(price>area.high+band)item.aboveSince??=timestamp;else item.aboveSince=null;
    if(item.rises>=2&&timestamp-item.touchTime>=2000&&price-item.minimum>=band*reboundMultiplier&&price>area.high+epsilon&&item.aboveSince!=null&&timestamp-item.aboveSince>=confirmationMs){item.phase='BOUNCE';emit(item.fromAbove?'BOUNCE':'REACTION');item.touchTime=null;}
   }
  }else if(item.phase!=='BOUNCE'){
   item.phase=above?'ABOVE':approached&&price<state.lastPrice-epsilon?'NEAR':'WAITING';
   if(price>area.high+epsilon&&price<=area.high+band&&approached&&price<state.lastPrice-epsilon)emit('NEAR');
  }
  levels[area.id]={...item,area};
 }
 return {state:{scope,lastTime:timestamp,lastPrice:price,levels},events,zones,available:true};
}

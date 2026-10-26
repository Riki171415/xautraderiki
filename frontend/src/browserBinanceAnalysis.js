import {loadingOrder,referenceSnapshot,PROVIDER_TFS} from './providerSnapshot.mjs';
const retained=new Map();
import {aggregateMonths} from 'virtual:coptah/mt5_data';
import {binanceCandles,publicJson,binanceSymbol} from './binancePublic.mjs';
import {calcHukumJIKA,calcHukumPerahu,calcRSMatrix,calcHukumBusur,calcHukumHSH,getTradingSession,generateStoryline,calcLeak4RegMatrix} from 'virtual:coptah/rule_engine';
import {buildH4Compass} from 'virtual:coptah/h4_compass';
import {analyzeMarketSessions,aggregateActiveMarket} from 'virtual:coptah/market_cycle';
import {buildMarketEntry} from 'virtual:coptah/market_entry';
import {marketHabits} from 'virtual:coptah/market_habits';
import {observePlan,alternativeEntries} from 'virtual:coptah/plan_monitor';
const candle=r=>({timestamp:r[0],open:r[1],high:r[2],low:r[3],close:r[4],volume:r[5],periodEnd:r[6]+1});
export async function browserBinanceAnalysis(symbol,timeframe,signal,provider='BINANCE') {
 if(provider!=='BINANCE')throw new Error('Sumber data publik hanya Binance Spot.');
 const providerName='Binance Spot';
 const getRows=binanceCandles;
 const tfs=PROVIDER_TFS;
 const scope=provider+'|'+symbol;
 const previous=retained.get(scope)||{};
 const raw={...previous},map={},failures=new Map();
 let retryAt=0;
 for(const tf of loadingOrder(timeframe)) {
   if(signal?.aborted)throw new DOMException('Aborted','AbortError');
   if(retryAt>Date.now()){failures.set(tf,'Entri antrean berikutnya setelah jeda kuota');continue;}
   try{const rows=await getRows(symbol,tf,signal);raw[tf]=rows;retained.set(scope,{...raw});}
   catch(error){if(signal?.aborted)throw error;failures.set(tf,error.message);if(error.retryAfter)retryAt=Date.now()+error.retryAfter*1000;}
 }
 for(const tf of tfs) {const rows=raw[tf];if(rows?.length>=2)map[tf]={ohlcv_N:candle(rows.at(-1)),ohlcv_B:candle(rows.at(-2))};}
 if(raw['1M']) for(const [tf,months] of [['3M',3],['6M',6],['1Y',12]]) {
   const rows=aggregateMonths(raw['1M'],months).map(r=>{const d=new Date(r[0]);return [...r.slice(0,6),Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+months,1)-1];});
   if(rows.length>=2){raw[tf]=rows;map[tf]={ohlcv_N:candle(rows.at(-1)),ohlcv_B:candle(rows.at(-2))};}
 }
 if(!map[timeframe])throw new Error(`Data ${providerName} ${symbol} ${timeframe} belum tersedia. ${failures.get(timeframe)||''}`);
 const now=Date.now(),decimals=/^(EURUSD|GBPUSD)$/.test(symbol)?5:symbol==='BTCUSD'?2:3,broker={id:provider,name:providerName,server:'Binance Spot',decimals},lotCalc={lot:null,risk:null,accountRiskVerified:false,formula:'Belum tersedia',description:'Isi modal dan spesifikasi instrumen sebelum menghitung lot.'};
 const pair=map[timeframe],n=pair.ohlcv_N,b=pair.ohlcv_B;
 const h4Compass=buildH4Compass(map);
 let quote=null;
 try{const q=await publicJson('ticker/bookTicker',{symbol:binanceSymbol(symbol)},signal);quote={bid:Number(q.bidPrice),ask:Number(q.askPrice)};}catch{}
 if(signal?.aborted)throw new DOMException('Aborted','AbortError');
 const reference=referenceSnapshot(raw,quote,provider,now);
 const price=reference.price??NaN;
 const availability=Object.fromEntries(tfs.map(tf=>[tf,{available:!!map[tf],fetchedAt:raw[tf]?.snapshot?.fetchedAt??null,candleStart:raw[tf]?.at(-1)?.[0]??null,candleEnd:raw[tf]?.at(-1)?.[6]+1||null,error:failures.get(tf)||null}]));
 const marketCycle=analyzeMarketSessions({symbol,hourly:raw['1h']||[],daily:map['1d']?.ohlcv_N,dailyBefore:map['1d']?.ohlcv_B,price,now,source:`${providerName} ${symbol}`});
 if(raw['1h'])map.market=aggregateActiveMarket(raw['1h'],now);
 const make=(tf,p)=>{
  const N=p.ohlcv_N,B=p.ohlcv_B,jika=calcHukumJIKA(N,B),perahu=calcHukumPerahu(N,B),base=calcRSMatrix(B,N,tf,{});
  const touches=Object.fromEntries(Object.entries(base.levels).map(([k,l])=>[k,N.low<=l.value&&N.high>=l.value]));
  const rs=calcRSMatrix(B,N,tf,touches),busur=calcHukumBusur(jika,rs,N,lotCalc,decimals),hsh=calcHukumHSH(N,N.periodEnd-N.timestamp,N.timestamp,N.periodEnd-now,perahu);
  let observation=observePlan(busur,N,raw['1m']||[],60000,now);
  if(observation.status==='UNCONFIRMED')observation=observePlan(busur,N,raw['5m']||[],300000,now);
  return {tf,name:tf.toUpperCase(),style:`COP TAH · ${providerName}`,category:'Skenario bersyarat',currentPrice:price,openN:N.open,openB:B.open,highN:N.high,lowN:N.low,jika,perahu,rs,busur,hsh,observation,alternatives:alternativeEntries(tf,busur,map,price,observation,h4Compass.h4),warnings:[h4Compass.description,`${providerName}: sumber terpisah dari Exness; Bid/Ask tidak diasumsikan tersedia. Tunggu konfirmasi entry.`],coptahRationale:{whyEntryHere:busur.rationale,jikaRole:jika.description,perahuRole:perahu.description,hshRole:'HSH selalu Open N timeframe ini.',antiFomoRule:'Tunggu reaksi harga; tidak mengejar target yang sudah dilewati.',riskRewardRatio:busur.riskReward},globalMacroStoryline:{decadeCycle:`Riwayat mengikuti ketersediaan ${providerName}.`,alignmentRecommendation:h4Compass.description}};
 };
 const current=make(timeframe,pair);
 const marketEntry=buildMarketEntry(map.market,h4Compass,marketCycle,quote,now,decimals);
 if(marketEntry.plan){const m=make('market',map.market);marketEntry.observation=m.observation;marketEntry.alternatives=m.alternatives;}
 return {symbol,marketSymbol:symbol,timeframe,broker,decimals,timestamp:now,dataSource:`${providerName} · ${symbol} · mode hemat kuota`,fallback:true,externalFeed:false,sourceWarnings:[...failures].map(([tf,reason])=>`${tf}: ${reason}`),dataAvailability:availability,referencePrice:reference,fetchedAt:now,quoteTimestamp:reference.priceTimestamp,marketDataStatus:reference.freshness==='STALE'?'STALE_QUOTE':reference.freshness,requirementsComplete:tfs.every(tf=>!!map[tf]&&!failures.has(tf)),retryAt,ohlcv_N:n,ohlcv_B:b,candles:raw[timeframe].slice(-100).map(candle),ohlComparison:{current:n,previous:b,diff:Object.fromEntries(['open','high','low','close'].map(k=>[k,n[k]-b[k]]))},jika:current.jika,perahu:current.perahu,rsMatrix:current.rs,busur:current.busur,hsh:current.hsh,planObservation:current.observation,lotCalc,userModal:null,session:getTradingSession(),h4Compass,dailyH4Context:{daily:map['1d']?.ohlcv_N,rows:raw['4h']||[]},marketCycle,supportHistory:{hourly:(raw['1h']||[]).slice(-240)},marketHabits:marketHabits({hourly:raw['1h']||[],cycle:marketCycle,now}),marketEntry,leak4RegMatrix:calcLeak4RegMatrix(map,price,quote?Math.round((quote.ask-quote.bid)*1000):0,decimals),entryRecommendations:['5m','15m','30m','1h','4h','1d'].filter(tf=>map[tf]).map(tf=>make(tf,map[tf])),yearlyCandles:(raw['1Y']||[]).map(candle),subAlurCerita:{allSchedules:[]},multiTfDecision:{rationale:h4Compass.description,guardrails:h4Compass.warnings},opStatus:{op:'WAIT',brokerName:providerName},storyline:generateStoryline(current.jika,current.perahu,current.busur,current.rs,current.hsh,null,symbol,timeframe,broker,decimals)};
}

const {calcRSMatrix}=require('./rule_engine');
// Observations of a hypothetical plan, never evidence of an executed broker order.
function observePlan(plan,n,rows=[],step=60000,now=Date.now()) {
 const out={status:'WAIT_ENTRY',entryObserved:false,tp1Observed:false,tp2Observed:false,note:'Entry belum tersentuh; TP belum tercapai. Observasi skenario, bukan transaksi.'};
 if(!n || !['BUY LIMIT','SELL LIMIT'].includes(plan?.action)) return {...out,status:'WAIT',note:'Belum ada skenario berarah.'};
 const hit=(c,v)=>Number.isFinite(v)&&c.low<=v&&c.high>=v;
 if(!hit(n,plan.entryPrice)) return out;
 const bars=rows.map(r=>({timestamp:r[0],low:r[3],high:r[2]})).filter(c=>c.timestamp>=n.timestamp && (!n.periodEnd || c.timestamp<n.periodEnd)).sort((a,b)=>a.timestamp-b.timestamp);
 // Missing leading bars or any gap can hide an earlier entry/stop sequence.
 if(!bars.length || bars[0].timestamp!==n.timestamp || bars.some((b,i)=>i&&b.timestamp-bars[i-1].timestamp!==step) || bars.at(-1).timestamp+step<now-step) return {...out,status:'UNCONFIRMED',note:'Level entry masuk rentang, tetapi riwayat intrabar belum lengkap. Urutan entry → TP/SL belum terkonfirmasi.'};
 let entered=false;
 for(const c of bars) {
  const entry=hit(c,plan.entryPrice),sl=hit(c,plan.stopLoss),t1=hit(c,plan.tp1),t2=hit(c,plan.tp2);
  if(!entered) {
   if(!entry) continue;
   if(sl||t1||t2) return {...out,status:'AMBIGUOUS',note:'Entry dan TP/SL berada dalam candle yang sama; urutannya belum terbukti. Target tidak dihitung tercapai.'};
   entered=true;out.entryObserved=true;out.entryTime=c.timestamp;continue;
  }
  if(sl&&(t1||t2)) return {...out,status:'AMBIGUOUS',note:'TP dan SL satu candle; hasil akhir belum terkonfirmasi.'};
  if(sl) return {...out,status:'STOP_OBSERVED',note:'Level SL teramati setelah entry. Skenario berakhir; ini bukan laporan transaksi.'};
  if(t1) out.tp1Observed=true;
  if(t2) {out.tp2Observed=true;return {...out,status:'TP2_OBSERVED',note:'TP2 teramati pada candle setelah entry, sebelum SL. Observasi skenario, bukan profit transaksi.'};}
 }
 return {...out,status:out.tp1Observed?'TP1_OBSERVED':'ENTRY_OBSERVED',note:out.tp1Observed?'TP1 teramati setelah entry; TP2 belum terkonfirmasi. Observasi skenario.':'Entry teramati; target setelah entry belum terkonfirmasi.'};
}
function alternativeEntries(tf,plan,hierarchy,price,observation,h4) {
 if(observation?.status!=='WAIT_ENTRY' || !['BUY LIMIT','SELL LIMIT'].includes(plan?.action) || !Number.isFinite(price)) return [];
 const buy=plan.action==='BUY LIMIT',direction=buy?'UP':'DOWN';
 const order=({market:['30m','15m','5m'],'4h':['30m','15m','5m'],'1d':['4h','1h','30m'],'1h':['15m','5m'],'30m':['5m'],'15m':['5m'],'5m':['1m']})[tf] || [];
 return order.flatMap(lower=>{
  const pair=hierarchy[lower];if(!pair?.ohlcv_B || !pair?.ohlcv_N) return [];
  const rs=calcRSMatrix(pair.ohlcv_B,{});
  const levels=[1,2,3,4].map(i=>({level:`${buy?'S':'R'}${i}`,value:rs[`${buy?'s':'r'}${i}`]})).filter(l=>Number.isFinite(l.value)&&(buy?l.value<price:l.value>price)).sort((a,b)=>Math.abs(a.value-price)-Math.abs(b.value-price));
  const best=levels[0];if(!best) return [];
  const risk=Math.abs(pair.ohlcv_B.high-pair.ohlcv_B.low);if(!(risk>0)) return [];
  const tp1=rs.pivot,tp2=buy?rs.r1:rs.s1,sl=best.value+(buy?-risk:risk);
  if(!(buy?best.value<tp1&&tp1<tp2:best.value>tp1&&tp1>tp2)) return [];
  const aligned=h4?.available&&h4.jika===direction;
  return [{tf:lower,level:best.level,entryPrice:best.value,tp1,tp2,stopLoss:sl,action:plan.action,status:aligned?'WAIT_CONFIRMATION':'WAIT_H4',createdAt:Date.now(),reason:`Alternatif ${lower}: ${buy?'support':'resistance'} terdekat dari harga saat ini. ${aligned?'Sejalan JIKA H4; tunggu reaksi harga dan konfirmasi timeframe kecil.':'Arah H4 belum selaras; jangan aktifkan skenario.'} Level dihitung dari candle B ${lower}; target lama tidak dipindahkan ke skenario baru.`}];
 });
}
module.exports={observePlan,alternativeEntries};

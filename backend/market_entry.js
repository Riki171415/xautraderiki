const {calcHukumJIKA,calcHukumPerahu,calcRSMatrix,calcHukumBusur,calcHukumHSH}=require('./rule_engine');
function buildMarketEntryBase(pair,compass,cycle,quote,now=Date.now(),decimals=3) {
 const result={session:cycle?.activeSession || 'MARKET',status:'WAIT',reason:'Data sesi aktif dan sesi pembanding belum lengkap.',reference:cycle?.hshReference || null};
 if(!pair?.ohlcv_N || !pair?.ohlcv_B || pair.sessionName!==cycle?.activeSession) return result;
 const n=pair.ohlcv_N,b=pair.ohlcv_B;
 if(!(now>=n.timestamp && now<n.periodEnd)) return {...result,reason:'Snapshot sesi sudah berakhir; menunggu sesi baru.'};
 const jika=calcHukumJIKA(n,b),rs=calcRSMatrix(b,n,'market'),perahu=calcHukumPerahu(n,b);
 const plan=calcHukumBusur(jika,rs,n,null,decimals);
 const hsh=calcHukumHSH(n,n.periodEnd-n.timestamp,n.timestamp,n.periodEnd-now);
 Object.assign(result,{current:n,previous:b,jika,perahu,rs,plan,hsh,h4:compass?.h4 || null,sourceComparison:'N = sesi aktif hari ini; B = sesi sejenis sebelumnya yang lengkap. Level RS dihitung dari B.'});
 if(!quote || now-quote.timestamp>10000 || ![quote.bid,quote.ask].every(v=>Number.isFinite(v)&&v>0) || quote.ask<quote.bid) return {...result,reason:'Harga Bid/Ask terbaru belum tersedia; jangan memakai harga snapshot untuk entry.'};
 result.quote=quote;
 if(jika.trend==='NEUTRAL') return {...result,reason:'Open N sama dengan Open B Market. JIKA netral.'};
 if(!compass?.h4?.available || compass.h4.jika==='NEUTRAL') return {...result,reason:'Arah H4 belum tersedia atau netral.'};
 if(compass.h4.jika!==jika.trend) return {...result,reason:'JIKA Market berlawanan dengan H4. Tunggu keselarasan; skenario belum dipilih.'};
 if(plan.action==='WAIT')return {...result,reason:plan.reason || 'Rencana belum valid.'};
 const buy=plan.action==='BUY LIMIT';
 if(buy?plan.entryPrice>=quote.ask:plan.entryPrice<=quote.bid) return {...result,reason:'Level entry sudah berada di sisi yang tidak sesuai untuk limit order. Tunggu evaluasi ulang.'};
 if(!(buy?plan.stopLoss<plan.entryPrice&&plan.entryPrice<plan.tp1&&plan.tp1<=plan.tp2:plan.stopLoss>plan.entryPrice&&plan.entryPrice>plan.tp1&&plan.tp1>=plan.tp2)) return {...result,reason:'Urutan entry, SL, dan TP tidak valid.'};
 if(hsh.hshActive) return {...result,reason:'Peringatan HSH aktif menjelang penutupan sesi; tunggu evaluasi sebelum skenario baru.'};
 return {...result,status:'SCENARIO',reason:`JIKA ${pair.sessionName} ${jika.trend} selaras H4. Skenario ${plan.action} menunggu harga di ${buy?'S1':'R1'}; akhir Busur dan entry belum terkonfirmasi.`};
}
function buildMarketEntry(pair,compass,cycle,quote,now=Date.now(),decimals=3) {
 const entry=buildMarketEntryBase(pair,compass,cycle,quote,now,decimals);
 const n=entry.current,b=entry.previous;
 const fmt=v=>Number.isFinite(v)?v.toFixed(decimals):'belum tersedia';
 if(!n || !b) return {...entry,analysis:[{title:'Kelengkapan data',text:entry.reason}],checklist:[entry.reason]};
 const price=entry.quote?.bid ?? n.close;
 const move=price>n.open?'UP':price<n.open?'DOWN':'FLAT';
 const phase=entry.jika.trend==='NEUTRAL'||move==='FLAT'?'WAIT':move===entry.jika.trend?'TARGET':'BUSUR';
 const macro=compass?.macro || [];
 const small=compass?.micro || [];
 const analysis=[
  {title:'1. Cerita global → H4',text:macro.length?macro.map(f=>`${f.timeframe}: ${f.available?'JIKA '+f.jika:'belum tersedia'}${f.referenceOpenBSource?' (B arsip)':f.partialBefore?' (B parsial)':''}`).join(' → ')+`. Pusat H4 ${entry.h4?.jika || 'belum tersedia'}; gerak H4 ${entry.h4?.move || 'belum tersedia'}.`:'Konteks global belum lengkap; tidak mengisi arah bawaan.'},
  {title:'2. Hukum JIKA Market',text:`Open N ${fmt(n.open)} ${n.open>b.open?'>':n.open<b.open?'<':'='} Open B ${fmt(b.open)} → JIKA ${entry.jika.trend}. N dan B sama-sama sesi ${entry.session}, bukan dua sesi berlainan.`},
  {title:'3. Perahu & gerakan Busur/Target',text:`High N ${fmt(n.high)} / B ${fmt(b.high)}; Low N ${fmt(n.low)} / B ${fmt(b.low)} → ${entry.perahu.pattern}. Harga ${fmt(price)} ${price>n.open?'di atas':price<n.open?'di bawah':'sama dengan'} Open N → gerak ${move}, dibaca ${phase} terhadap JIKA Market. Ini belum konfirmasi akhir Busur.`},
  {title:'4. Hubungan Market dengan H4 & TF kecil',text:`JIKA Market ${entry.jika.trend}; JIKA H4 ${entry.h4?.jika || 'belum tersedia'}. ${entry.h4?.available && entry.h4.jika===entry.jika.trend?'Arah JIKA keduanya selaras.':'Keselarasan belum terpenuhi.'} ${small.map(f=>`${f.timeframe} ${f.jika}`).join(' · ')}. Pergantian arah timeframe kecil belum cukup untuk konfirmasi entry.`},
  {title:'5. Mengapa level entry di sini?',text:entry.plan?.action==='WAIT'?'JIKA netral: tidak ada skenario BUY/SELL.':`${entry.plan.action}: entry ${fmt(entry.plan.entryPrice)} dari ${entry.plan.action==='BUY LIMIT'?'S1':'R1'} sesi B. TP1 Pivot ${fmt(entry.plan.tp1)}, TP2 ${fmt(entry.plan.tp2)}, SL ${fmt(entry.plan.stopLoss)}. R:R ke TP2 ${entry.plan.riskReward}. Level ini referensi rencana, termasuk ketika status WAIT; bukan perintah entry.`},
  {title:'6. HSH sesi & pembanding',text:`Rumah Market ${entry.session} = Open N ${fmt(n.open)}; jarak ${fmt(Math.abs(price-n.open))} satuan harga. Usia sesi ${entry.hsh.percentElapsed}%, sisa ${entry.hsh.timeToClose}, status peringatan ${entry.hsh.hshSeverity}. HSH pembanding ${entry.reference?.name || 'belum tersedia'}: Open ${fmt(entry.reference?.hshOpen)}. Pivot bukan rumah HSH.`},
  {title:'7. Kesimpulan & rambu',text:`${entry.status==='SCENARIO'?'SKENARIO BELUM TERKONFIRMASI':'WAIT'}: ${entry.reason}`},
 ];
 const checklist=[
  entry.quote?'Bid/Ask tersedia pada waktu snapshot.':'Menunggu Bid/Ask segar.',
  `Konteks H4 ${entry.h4?.available?'tersedia':'belum tersedia'}; arah ${entry.h4?.jika || '—'}.`,
  entry.hsh.hshActive?'HSH aktif: tunggu evaluasi, tidak membuat entry baru.':'Peringatan HSH belum aktif menurut syarat mesin.',
  'Periksa ulang sisi limit, spread, serta SL/TP saat harga berubah.',
  'Konfirmasi akhir Busur belum ditetapkan sebagai sinyal otomatis; tidak ada order dikirim.',
 ];
 return {...entry,move,phase,analysis,checklist};
}
module.exports={buildMarketEntry};

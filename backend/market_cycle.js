const HOUR = 3600000;
const WINDOWS = [
  {key:'asia',name:'ASIA',from:0,to:8,hours:'06:00–14:00 WIB'},
  {key:'europe',name:'EROPA',from:8,to:14,hours:'14:00–20:00 WIB'},
  {key:'usa',name:'USA',from:14,to:22,hours:'20:00–04:00 WIB'},
  {key:'transition',name:'TRANSISI',from:22,to:24,hours:'04:00–06:00 WIB'},
];
function summarize(rows,start,end,now) {
  const bars=rows.filter(r=>r[0]>=start && r[0]<end && r[0]<=now);
  const expected=[];
  for(let t=start;t<end && t<=now;t+=HOUR) expected.push(t);
  const timestamps=new Set(bars.map(r=>r[0]));
  const missing=expected.filter(t=>!timestamps.has(t));
  return {
    start,end,bars:bars.length,expectedBars:expected.length,missingBars:missing.length,
    coverage:missing.length===0 && bars.length>0,
    status:now<start?'pending':!bars.length?'unavailable':missing.length?'incomplete':now>=end?'completed':'active',
    open:bars[0]?.[1] ?? null,high:bars.length?Math.max(...bars.map(r=>r[2])):null,
    low:bars.length?Math.min(...bars.map(r=>r[3])):null,close:bars.at(-1)?.[4] ?? null,
    highTime:bars.length?bars.find(r=>r[2]===Math.max(...bars.map(x=>x[2])))[0]:null,
    lowTime:bars.length?bars.find(r=>r[3]===Math.min(...bars.map(x=>x[3])))[0]:null,
  };
}
function analyzeMarketSessions({hourly=[],daily=null,dailyBefore=null,price=null,now=Date.now(),source='MT5 Exness'}={}) {
  const local=new Date(now+7*HOUR);
  let anchor=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate(),6)-7*HOUR;
  if(now<anchor) anchor-=24*HOUR;
  // Fixed windows belong to the COP TAH model; these are not exchange opening hours.
  const sessions=WINDOWS.map(w=>({...w,...summarize(hourly,anchor+w.from*HOUR,anchor+w.to*HOUR,now)}));
  const [asia,europe,usa,transition]=sessions;
  const active=sessions.find(s=>now>=s.start && now<s.end);
  const close=Number.isFinite(price)?price:daily?.close;
  const bias=!daily || !Number.isFinite(close)?'UNAVAILABLE':close>daily.open?'BULLISH':close<daily.open?'BEARISH':'NEUTRAL';
  const dailyJika=!daily || !dailyBefore?'UNAVAILABLE':daily.open>dailyBefore.open?'UP':daily.open<dailyBefore.open?'DOWN':'NEUTRAL';
  let marketType='WAITING',verification='WAITING',description='Menunggu data sesi Asia dan Eropa yang lengkap.';
  const evidence=[];
  if(!daily || !hourly.length) {marketType='UNAVAILABLE';description='Data D1/H1 belum tersedia. Tidak membuat kesimpulan dari timeframe pengganti.';}
  else if(!asia.coverage || asia.status!=='completed') {description='Sesi Asia belum lengkap/selesai. High dan Low belum final.';}
  else if(now<europe.start || !europe.bars) {description='Asia selesai; menunggu pergerakan sesi Eropa.';}
  else if(!europe.coverage || (now>=usa.start && (!usa.bars || !usa.coverage))) {
    marketType='INSUFFICIENT';description='Ada candle H1 yang hilang dalam sesi. Klasifikasi ditahan sampai riwayat lengkap.';
  } else if(bias==='NEUTRAL') {description='Harga sama dengan Open D1; bias harian netral.';}
  else {
    const highBreak=europe.high>asia.high,lowBreak=europe.low<asia.low;
    evidence.push(`High Eropa ${europe.high} ${highBreak?'>':'≤'} High Asia ${asia.high}`);
    evidence.push(`Low Eropa ${europe.low} ${lowBreak?'<':'≥'} Low Asia ${asia.low}`);
    const bearish=bias==='BEARISH';
    if(highBreak && lowBreak) marketType='NORMAL';
    else if(bearish && europe.high<asia.high && europe.low<asia.low || !bearish && europe.high>asia.high && europe.low>asia.low) marketType='STRONG';
    else marketType='MIXED';
    if(usa.bars && ['NORMAL','STRONG'].includes(marketType)) {
      const boundary=europe;
      const violated=marketType==='STRONG'?(bearish?usa.high>=boundary.high:usa.low<=boundary.low):(bearish?usa.high>=boundary.high:usa.low<=boundary.low);
      const continuation=bearish?usa.low<europe.low:usa.high>europe.high;
      evidence.push(`High USA ${usa.high} / High Eropa ${europe.high}; Low USA ${usa.low} / Low Eropa ${europe.low}.`);
      evidence.push(`USA ${continuation?'sudah':'belum'} melanjutkan ekstrem ${bearish?'Low':'High'} Eropa.`);
      if(violated || (usa.status==='completed' && !continuation)) marketType='MIXED';
    }
    const complete=[asia,europe,usa].every(s=>s.status==='completed' && s.coverage);
    verification=complete?'OBSERVED':'PROVISIONAL';
    description=marketType==='STRONG'
      ? `High dan Low Eropa ${bearish?'lebih rendah':'lebih tinggi'} dari Asia; USA harus melanjutkan High dan Low ${bearish?'lebih rendah':'lebih tinggi'} dari Eropa. ${complete?'Pola sesi telah teramati.':'Masih indikasi; sesi yang berjalan dapat mengubah klasifikasi.'}`
      :marketType==='NORMAL'
      ? `Rentang Eropa melewati High dan Low Asia. ${complete?'Pola sesi telah teramati.':'Belum final sampai sesi USA selesai.'}`
      :'Pergerakan antar-sesi belum sesuai pola NORMAL/STRONG. Tidak dipaksakan ke salah satu pola.';
  }
  const normalStory={direction:bias==='BEARISH'?'BEARISH':bias==='BULLISH'?'BULLISH':'UNAVAILABLE',status:'WAITING',checks:[]};
  if(marketType==='NORMAL') {
    const bearish=bias==='BEARISH';
    const ordering=(session,first,second)=>{
      if(!session.coverage||session.status!=='completed')return 'PENDING';
      const a=session[first+'Time'],b=session[second+'Time'];
      if(!Number.isFinite(a)||!Number.isFinite(b)||a===b)return 'UNVERIFIED';
      return a<b?'PASS':'FAIL';
    };
    normalStory.checks=[
      {id:'asia-order',text:`ASIA: ${bearish?'Low → High':'High → Low'}`,status:ordering(asia,bearish?'low':'high',bearish?'high':'low')},
      {id:'europe-order',text:`EROPA: ${bearish?'Low → High':'High → Low'}`,status:ordering(europe,bearish?'low':'high',bearish?'high':'low')},
      {id:'usa-order',text:`USA: ${bearish?'High → Low':'Low → High'}`,status:ordering(usa,bearish?'high':'low',bearish?'low':'high')}
    ];
    const failed=normalStory.checks.some(c=>c.status==='FAIL');
    const all=normalStory.checks.every(c=>c.status==='PASS');
    const complete=[asia,europe,usa].every(x=>x.coverage&&x.status==='completed');
    normalStory.status=failed?'MISMATCH':!complete?'FORMING':all?'VERIFIED':'ORDER_UNVERIFIED';
    evidence.push(...normalStory.checks.map(c=>`${c.text}: ${c.status}`));
    if(failed){marketType='MIXED';verification='MISMATCH';description='Ekstrem sesi menyerupai NORMAL, tetapi urutan High/Low tidak sesuai cerita COP TAH.';}
    else if(complete&&!all){verification='ORDER_UNVERIFIED';description='Ekstrem sesi sesuai kandidat NORMAL; urutan High/Low belum terbukti karena berada dalam candle H1 yang sama. Tidak diberi konfirmasi penuh.';}
    else if(all){description=`NORMAL ${bias}: urutan ekstrem tiga sesi telah teramati. ${bearish?'High Eropa tertinggi dan Low USA terendah':'Low Eropa terendah dan High USA tertinggi'} dalam tiga sesi. Pencapaian sasaran mingguan dinilai terpisah.`;}
  }
  const previousUsa=summarize(hourly,anchor-10*HOUR,anchor-2*HOUR,now);
  const referenceWindows={ASIA:{name:'EROPA',from:-16,to:-10,hours:'14:00–20:00 WIB'},EROPA:{name:'USA',from:-10,to:-2,hours:'20:00–04:00 WIB'},USA:{name:'ASIA',from:0,to:8,hours:'06:00–14:00 WIB'}};
  const window=referenceWindows[active?.name];
  let hshReference=null;
  if(window) {
    const observation=summarize(hourly,anchor+window.from*HOUR,anchor+window.to*HOUR,now);
    hshReference={...observation,name:window.name,activeSession:active.name,hours:window.hours,
      hshOpen:observation.coverage && observation.status==='completed'?observation.open:null};
  }
  const definitions=[
    [1,'USA → ASIA','Ringkasan USA sebelumnya',previousUsa,'close'],
    [2,'ASIA','Open sesi Asia',asia,'open'],[3,'ASIA','Low sesi Asia',asia,'low'],[4,'ASIA','High sesi Asia',asia,'high'],
    [5,'EROPA','Open sesi Eropa',europe,'open'],[6,'EROPA','Low sesi Eropa',europe,'low'],[7,'EROPA','High sesi Eropa',europe,'high'],
    [8,'USA','Open sesi USA',usa,'open'],[9,'USA','High sesi USA',usa,'high'],[10,'USA','Low sesi USA',usa,'low'],
    [11,'USA','Close sesi USA',usa,'close'],[12,'TRANSISI','Transisi menuju Asia berikutnya',transition,'close'],
  ];
  const steps=definitions.map(([step,session,title,s,field])=>({step,session,title,
    status:s.status,value:s[field],desc:s[field]==null?'Belum ada data sesi.':`${field.toUpperCase()} ${s[field]} · ${s.status==='completed'?'sesi selesai':s.status==='incomplete'?'riwayat belum lengkap':'nilai sementara; sesi masih berjalan'}`,
  }));
  const activeStep=steps.find(s=>s.session===active?.name && s.status==='active');
  return {available:!!daily && hourly.length>0,marketType,bias,dailyJika,verification,
    label:`${verification==='PROVISIONAL'?'INDIKASI ':''}${marketType} · ${bias}`,
    activeSession:active?.name || 'TRANSISI',currentStep:activeStep?.step ?? null,
    activeStepTitle:activeStep?.title || 'Menunggu data sesi',activeStepDesc:description,
    totalSteps:12,steps,sessions,evidence,description,source,hshReference,normalStory,
    previousUsa:{...previousUsa,name:'USA sebelumnya',hours:'20:00–04:00 WIB',hshOpen:previousUsa.coverage && previousUsa.status==='completed'?previousUsa.open:null},
    tradingDay:new Date(anchor+7*HOUR).toISOString().slice(0,10),
    wibTime:`${String(local.getUTCHours()).padStart(2,'0')}:${String(local.getUTCMinutes()).padStart(2,'0')} WIB`,
    sessionConvention:'Jendela metode COP TAH tetap dalam WIB; bukan jam bursa/DST. Hari siklus dimulai pukul 06:00 WIB.',
    hshOpen:daily?.open ?? null,
  };
}
function aggregateActiveMarket(hourly, now=Date.now()) {
  const cycle=analyzeMarketSessions({hourly,now});
  const current=cycle.sessions.find(s=>s.name===cycle.activeSession);
  if(!current?.coverage) return null;
  let previous=null;
  for(let day=1;day<=7 && !previous;day++) {
    const candidate=summarize(hourly,current.start-day*24*HOUR,current.end-day*24*HOUR,now);
    if(candidate.coverage && candidate.status==='completed') previous=candidate;
  }
  if(!previous) return null;
  const candle=s=>({timestamp:s.start,periodEnd:s.end,open:s.open,high:s.high,low:s.low,close:s.close,volume:hourly.filter(r=>r[0]>=s.start&&r[0]<s.end&&r[0]<=now).reduce((v,r)=>v+r[5],0)});
  return {sessionName:current.name,ohlcv_N:candle(current),ohlcv_B:candle(previous)};
}
module.exports={analyzeMarketSessions,aggregateActiveMarket};

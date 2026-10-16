// A descriptive hierarchy, not an execution signal or confirmation of a completed bow.
function readFrame(tf, pair) {
  const n=pair?.ohlcv_N,b=pair?.ohlcv_B;
  if(!n || !b || ![n.open,n.close,b.open].every(Number.isFinite)) return {timeframe:tf,available:false,jika:'UNAVAILABLE',move:'UNAVAILABLE',phase:'UNAVAILABLE'};
  const jika=n.open>b.open?'UP':n.open<b.open?'DOWN':'NEUTRAL';
  const move=n.close>n.open?'UP':n.close<n.open?'DOWN':'FLAT';
  const phase=jika==='NEUTRAL'?'WAIT':move==='FLAT'?'AT_OPEN':jika===move?'TARGET_DIRECTION':'BOW_DIRECTION';
  return {timeframe:tf,available:true,jika,move,phase,openN:n.open,openB:b.open,close:n.close,timestamp:n.timestamp,hshTarget:n.open};
}
function buildH4Compass(map={}) {
  const h4=readFrame('4h',map['4h']);
  const macro=['1Y','6M','3M','1M','1w','1d'].map(tf=>readFrame(tf,map[tf]));
  const micro=['1h','30m','15m','5m'].map(tf=>readFrame(tf,map[tf]));
  const reference=h4.jika;
  for(const frame of [...macro,...micro]) frame.alignment=!frame.available?'UNAVAILABLE':reference==='NEUTRAL'||reference==='UNAVAILABLE'||frame.jika==='NEUTRAL'?'NEUTRAL':frame.jika===reference?'ALIGNED':'OPPOSED';
  const major=macro.filter(f=>['1w','1d'].includes(f.timeframe));
  const macroStatus=major.some(f=>!f.available)?'INCOMPLETE':reference==='NEUTRAL'||reference==='UNAVAILABLE'?'WAIT':major.some(f=>f.alignment==='OPPOSED')?'CONFLICT':major.every(f=>f.alignment==='ALIGNED')?'ALIGNED':'MIXED';
  const aligned=micro.filter(f=>f.alignment==='ALIGNED').length;
  const opposed=micro.filter(f=>f.alignment==='OPPOSED').length;
  let label='H4 belum tersedia',description='Menunggu candle N dan B H4 asli. Tidak menyimpulkan arah dari timeframe pengganti.';
  if(h4.available) {
    label=h4.jika==='NEUTRAL'?'H4 NETRAL · tunggu arah':h4.phase==='AT_OPEN'?`JIKA H4 ${reference} · harga di Open N`:h4.phase==='BOW_DIRECTION'?`JIKA H4 ${reference} · gerakan busur ${h4.move==='UP'?'naik':'turun'}`:`JIKA H4 ${reference} · gerak searah target`;
    description=h4.jika==='NEUTRAL'?'Open N sama dengan Open B H4. Belum ada arah JIKA untuk memetakan busur dan target.':h4.phase==='BOW_DIRECTION'
      ? `Harga H4 bergerak berlawanan JIKA ${reference}; dibaca sebagai gerakan busur dalam konteks arah H4. Ini belum membuktikan busur selesai atau menjamin harga berbalik.`
      :h4.phase==='AT_OPEN'?'Harga berada di Open N H4. Belum ada perpindahan bersih dari pembukaan.':`Harga bergerak searah JIKA ${reference} dari Open N H4. Ini menunjukkan arah gerakan saat ini, bukan bukti target RS sudah tercapai.`;
  }
  const warnings=[];
  if(macroStatus==='CONFLICT') warnings.push('H4 berlawanan dengan JIKA D1 atau W1. Tampilkan sebagai konflik konteks; jangan menyebut seluruh timeframe searah.');
  if(macroStatus==='INCOMPLETE') warnings.push('Konteks D1/W1 belum lengkap. Keselarasan global belum dapat ditentukan.');
  if(macro.some(f=>!f.available)) warnings.push('Sebagian timeframe makro belum tersedia; cerita global ditampilkan sebagian.');
  if(micro.some(f=>!f.available)) warnings.push('Sebagian timeframe kecil belum tersedia; pembacaan perkembangan busur belum lengkap.');
  if(h4.available && h4.jika!=='NEUTRAL') warnings.push(`${aligned} TF kecil searah JIKA H4, ${opposed} berlawanan. Pergantian arah TF kecil saja belum mengonfirmasi akhir busur H4.`);
  return {available:h4.available,anchor:'4h',h4,macro,micro,minute:readFrame('1m',map['1m']),macroStatus,label,description,warnings,
    bowDirection:reference==='UP'?'DOWN':reference==='DOWN'?'UP':'WAIT',
    targetDirection:reference==='UP'||reference==='DOWN'?reference:'WAIT',
    confirmation:'NOT_CONFIRMED',
    confirmationNote:'Penanda membaca arah dari Open dan Close. Syarat konfirmasi akhir busur belum ditetapkan; tidak ada sinyal entry otomatis.',
    globalStory:macro.filter(f=>f.available).map(f=>`${f.timeframe}: JIKA ${f.jika}, gerak ${f.move}`).join(' → '),
  };
}
module.exports={readFrame,buildH4Compass};

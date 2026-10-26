import {levelName} from './h4LevelMatches.mjs';
export function hshNoticeKey(data) {return [data?.broker?.id,data?.symbol,data?.timeframe,data?.ohlcv_N?.timestamp].join('|');}
export function dailyNoticeKey(note,cycle) {return [note.id,cycle?.tradingDay,note.id.startsWith('daily:')||note.id.startsWith('last-h4:')?'DAILY':cycle?.activeSession].join(':');}
export function normalizeNotice(type,message,context={}) {
 const value=typeof message==='string'?{body:message}:message||{};
 return {type,title:value.title||(type==='warning'?'Periksa kondisi harga':'Informasi aplikasi'),body:value.body||'',statusLabel:value.statusLabel||'',
  details:value.details||[],next:value.next||'',page:value.page||'sources',caution:value.caution||'',symbol:value.symbol||context.symbol||'',source:value.source||context.broker||'',key:value.key||null};
}
export function h4Notice(events,{symbol,source,price,decimals=3}={}) {
 const fmt=n=>Number.isFinite(n)?n.toFixed(decimals):'—';
 const rank={CROSSED:0,AT:1,NEAR:2},first=[...events].sort((a,b)=>(rank[a.type]??3)-(rank[b.type]??3)||Math.abs(price-a.value)-Math.abs(price-b.value))[0];
 const crossed=first?.type==='CROSSED',direction=first?.direction;
 const area=first?.key?.startsWith('res')?'resistance':first?.key?.startsWith('sup')?'support':'level';
 const action=crossed&&direction?`menembus ${direction==='UP'?'naik':'turun'}`:first?.type==='AT'?'menyentuh':crossed?'melewati':'mendekati';
 const names={CROSSED:'Harga melewati',AT:'Harga menyentuh',NEAR:'Harga mendekati'};
 return {title:`Harga ${action} ${levelName(first?.key||'pivot')} H4`,statusLabel:crossed&&direction?`TEMBUS ${direction==='UP'?'NAIK':'TURUN'}`:first?.type==='AT'?'LEVEL DIUJI':`DEKAT ${area.toUpperCase()}`,symbol,source,page:'h4',
  body:`Harga ${fmt(price)} · ${levelName(first?.key||'pivot')} ${fmt(first?.value)}. ${crossed?'Level sudah dilewati; pembalikan tren belum terbukti.':'Arah balik belum terkonfirmasi.'}`,
  details:events.map(e=>`${names[e.type]||'Harga mendekati'} ${levelName(e.key)} ${fmt(e.value)} · jarak ${fmt(Math.abs(price-e.value))}`),
  next:crossed?`Pantau apakah harga bertahan ${direction==='UP'?'di atas':direction==='DOWN'?'di bawah':'setelah melewati'} ${fmt(first?.value)}.`:`Tunggu harga memantul atau menembus ${fmt(first?.value)}.`,caution:'Sentuhan atau tembus level belum membuktikan entry maupun TP transaksi.'};
}
export function supportNotice(events,{symbol,source,price,decimals=3}={}) {
 const stage=['BREAK','BOUNCE','REACTION','TOUCH','AREA','NEAR'].find(s=>events.some(e=>e.stage===s));
 const first=events.filter(e=>e.stage===stage).sort((a,b)=>Math.abs(price-a.value)-Math.abs(price-b.value))[0];
 const fmt=n=>Number.isFinite(n)?n.toFixed(decimals):'—';
 const area=first?`${fmt(first.low)}${first.high>first.low?'–'+fmt(first.high):''}`:'—';
 const copy={
 BREAK:['TEMBUS TURUN','Support ditembus ke bawah',`Harga ${fmt(price)} sudah melewati batas bawah area ${area}.`,'Tunggu reaksi harga; area ini belum dapat dianggap menahan penurunan.'],
 BOUNCE:['MEMANTUL NAIK','Harga mulai memantul naik',`Harga pulih dari area ${area} dan bertahan di atas batas konfirmasi minimal 60 detik.`,`Pantau apakah harga tetap bertahan di atas area ${area}.`],
 REACTION:['NAIK DARI AREA','Harga naik dari area acuan',`Kenaikan teramati dari ${area}; arah kedatangan sebelumnya belum diketahui.`,'Tunggu uji dari atas sebelum menyebut area ini support.'],
 TOUCH:['UJI SUPPORT','Harga menguji support',`Harga menyentuh area ${area} dari atas. Arah balik belum terkonfirmasi.`,'Tunggu pantulan naik atau penembusan ke bawah.'],
 AREA:['ARAH BELUM JELAS','Harga berada di area acuan',`Harga berada dekat ${area}. Belum cukup data untuk menyimpulkan balik arah.`,'Tunggu reaksi harga berikutnya.'],
 NEAR:['DEKAT SUPPORT','Harga mendekati support',`Harga ${fmt(price)} mendekati area ${area} dari atas.`,'Pantau reaksi saat area disentuh.']};
 const [statusLabel,title,body,next]=copy[stage]||copy.AREA;
 return {statusLabel,title,body,next,symbol,source,page:'global',details:events.map(e=>`${e.members.map(m=>`${m.timeframe} ${m.label} ${fmt(m.value)}`).join(' / ')} · ${e.stage}`),caution:'Pantulan awal belum membuktikan tren berbalik. Ini bukan perintah entry.'};
}
export function strongNotice(events,{symbol,source,decimals=3}={}) {
 const first=events[0],fmt=n=>Number.isFinite(n)?n.toFixed(decimals):'—',up=first?.side==='BUY';
 const conflict=events.some(s=>s.warnings?.length);
 return {title:`Gerak ${up?'naik':'turun'} memenuhi syarat kuat`,statusLabel:conflict?'ARAH MASIH KONFLIK':`ARAH ${up?'NAIK':'TURUN'}`,symbol,source,page:'entries',body:`${first?.timeframe?.toUpperCase()||'TF kecil'} memenuhi syarat ${first?.side||'sinyal'}.${conflict?' Ada timeframe yang masih berlawanan.':''}`,
  details:events.map(s=>`${s.timeframe.toUpperCase()} ${s.side} → H4 ${levelName(s.target.h4Key)} ${fmt(s.target.h4Value)} → ${s.target.timeframe} ${levelName(s.target.level)} ${fmt(s.target.value)}`),
  next:conflict?'Periksa konflik arah sebelum mempertimbangkan entry.':'Periksa Entry, TP dan SL pada rencana H4.',caution:'Ini penilaian metode, bukan order aktif atau jaminan hasil.'};
}

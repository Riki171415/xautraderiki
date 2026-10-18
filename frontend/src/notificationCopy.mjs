import {levelName} from './h4LevelMatches.mjs';
export function hshNoticeKey(data) {
 return [data?.broker?.id,data?.symbol,data?.timeframe,data?.ohlcv_N?.timestamp].join('|');
}
export function dailyNoticeKey(note,cycle) {
 return [note.id,cycle?.tradingDay,note.id.startsWith('daily:')||note.id.startsWith('last-h4:')?'DAILY':cycle?.activeSession].join(':');
}
export function normalizeNotice(type,message,context={}) {
 const value=typeof message==='string'?{body:message}:message||{};
 return {type,title:value.title||(type==='warning'?'Perlu perhatian':'Informasi aplikasi'),body:value.body||'',
  details:value.details||[],next:value.next||'Periksa rincian sebelum mengambil keputusan.',page:value.page||'sources',
  caution:value.caution||'',symbol:value.symbol||context.symbol||'',source:value.source||context.broker||'',key:value.key||null};
}
export function h4Notice(events,{symbol,source,price,decimals=3}={}) {
 const fmt=n=>Number.isFinite(n)?n.toFixed(decimals):'—';
 const names={CROSSED:'Harga melewati',AT:'Harga menyentuh',NEAR:'Harga mendekati'};
 return {title:'Pergerakan di area H4',symbol,source,page:'h4',body:`Harga acuan ${fmt(price)}. ${events.length} area H4 perlu dipantau.`,
  details:events.map(e=>`${names[e.type]||'Harga mendekati'} ${levelName(e.key)} ${fmt(e.value)} · jarak ${fmt(Math.abs(price-e.value))}`),
  next:'Lihat reaksi harga dan konfirmasi TF kecil pada rincian H4.',caution:'Sentuhan atau tembus level belum membuktikan entry maupun TP transaksi.'};
}
export function strongNotice(events,{symbol,source,decimals=3}={}) {
 const first=events[0],fmt=n=>Number.isFinite(n)?n.toFixed(decimals):'—';
 const conflict=events.some(s=>s.warnings?.length);
 return {title:`STRONG ${first?.side||''} · ${first?.timeframe?.toUpperCase()||'TF kecil'}`,symbol,source,page:'entries',
  body:'Seluruh syarat sinyal TF kecil terpenuhi pada pemeriksaan ini.',
  details:events.map(s=>`${s.timeframe.toUpperCase()} ${s.side} → H4 ${levelName(s.target.h4Key)} ${fmt(s.target.h4Value)} → ${s.target.timeframe} ${levelName(s.target.level)} ${fmt(s.target.value)}`),
  next:conflict?'Ada konflik arah. Baca peringatannya dan periksa tiket H4 sebelum mengambil keputusan.':'Periksa Entry, TP dan SL H4 serta kondisi terbaru sebelum mengambil keputusan.',
  caution:'Ini penilaian metode, bukan order aktif atau jaminan hasil.'};
}

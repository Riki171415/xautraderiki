import {timeframeTask} from './timeframeTask.mjs';
import {levelName} from './h4LevelMatches.mjs';
const KEYS=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
export function dailyMarketProgress(columns=[],{now=Date.now(),stale=false}={}) {
 const column=columns.find(c=>c.timeframe==='1d');
 const daily=timeframeTask(column,{now,stale});
 const references=['4h','market'].map(tf=>timeframeTask(columns.find(c=>c.timeframe===tf),{now,stale}));
 const verified=daily.status==='OBSERVING'&&daily.observable;
 const levels=KEYS.map(key=>{
  const raw=column?.[key],value=raw!=null&&raw!==''&&Number.isFinite(Number(raw))?Number(raw):null;
  return {key,value,role:key===daily.bow?.key?'BUSUR':key===daily.target?.key?'TARGET':'LANJUTAN / PANTAUAN',touched:verified&&value!=null?daily.low<=value&&value<=daily.high:null};
 });
 const touched=levels.filter(l=>l.touched===true);
 const directions=references.map(r=>r.status==='OBSERVING'&&['UP','DOWN'].includes(r.move)?r.move:null);
 const phase=!verified||directions.some(d=>!d)?'UNVERIFIED':directions[0]!==directions[1]?'CONFLICT':directions[0]===daily.jika?'TARGET':'BOW';
 const both=daily.progress.bow==='REACHED'&&daily.progress.target==='REACHED';
 let next=null,reason;
 if(!verified)reason=daily.warnings.length?daily.warnings.join(' '):'Daily belum aktif, data belum lengkap, netral atau kesegaran belum terverifikasi. Tugas berikutnya belum dinilai.';
 else if(phase==='UNVERIFIED')reason='Sentuhan Daily dapat dibaca, tetapi H4 atau Market belum cukup untuk menyimpulkan arah tugas berikutnya.';
 else if(phase==='CONFLICT')reason='MOVE H4 dan Market berbeda arah. Tunggu keselarasan; belum memilih satu tugas berikutnya.';
 else {
  const area=phase==='TARGET'?daily.target:daily.bow;
  if(area.touched===false)next={...area,name:phase==='TARGET'?'Target Daily':'Busur Daily'};
  else {
   const continued=area.continuations.filter(x=>x.value!=null&&!x.touched&&(area.direction==='UP'?x.value>daily.close:x.value<daily.close)).sort((a,b)=>Math.abs(a.value-daily.close)-Math.abs(b.value-daily.close))[0];
   if(continued)next={...continued,direction:area.direction,name:'Level lanjutan sisi '+(phase==='TARGET'?'Target':'Busur')};
  }
  reason=next?`MOVE H4 dan Market searah ${phase==='TARGET'?'Target':'Busur'} Daily. Pantau ${levelName(next.key)} secara bersyarat selama arah tetap selaras; bukan kepastian harga menuju level tersebut.`:'Acuan sisi ini sudah tersentuh; tidak ada level lanjutan yang belum tersentuh pada arah gerak saat ini. Pantau reaksi, bukan menganggap tugas baru otomatis dimulai.';
 }
 return {daily,levels,touched,phase,references,next,reason,both,verified,sequenceVerified:false};
}

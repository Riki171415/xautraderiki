import H4MicroIndications from './H4MicroIndications';
import {useState,useRef,useEffect} from 'react';
import {nextH4Alerts} from '../h4Alerts.mjs';
import {h4LevelMatches,levelName} from '../h4LevelMatches.mjs';
import {projectMatrix} from '../liveMatrix.mjs';
export default function H4LevelTargets({data,liveTick,now=Date.now(),onNotify,tolerance:sharedTolerance,onTolerance}) {
 const [localTolerance,setLocalTolerance]=useState(0);
 const tolerance=sharedTolerance??localTolerance;
 const setTolerance=onTolerance??setLocalTolerance;
 const [alertsEnabled,setAlertsEnabled]=useState(true),[alertDistance,setAlertDistance]=useState(1);
 const tracker=useRef(null);
 const lastAlert=useRef(0);
 const matrix=projectMatrix(data?.leak4RegMatrix,liveTick,data?.decimals??3,now);
 const price=liveTick?.bid??Number(matrix?.currentPrice),digits=data?.decimals??3;
 const h4=matrix?.rsColumns?.find(c=>c.timeframe==='4h');
 const move=h4?Number(h4.closeN)>Number(h4.openN)?'UP':Number(h4.closeN)<Number(h4.openN)?'DOWN':'FLAT':'FLAT';
 const result=h4LevelMatches(matrix?.rsColumns,price,{decimals:digits,tolerance,now,move});
 useEffect(()=>{
  if(data?.marketDataStatus==='STALE_QUOTE' || !alertsEnabled || !onNotify || !result.available || now-(data?.timestamp||0)>45000)return;
  const scope=`${data?.broker?.id}|${data?.symbol}|${h4?.periodStart}|${tolerance}`;
  const update=nextH4Alerts(tracker.current,scope,result.groups,price,{distance:alertDistance,epsilon:10**(-digits)/2});
  if(update.events.length && now-lastAlert.current<10000)return;
  tracker.current=update.state;
  if(!update.events.length)return;
  lastAlert.current=now;
  const messages=update.events.slice(0,3).map(g=>`${g.type==='CROSSED'?'Melewati':g.type==='AT'?'Menyentuh':'Mendekati'} H4 ${levelName(g.key)} ${g.value.toFixed(digits)} · cocok ${[...new Set(g.matches.map(m=>m.label))].join(', ')} · jarak ${Math.abs(price-g.value).toFixed(digits)}`);
  onNotify('warning',`${data.symbol}: ${messages.join(' | ')}${update.events.length>3?` · +${update.events.length-3} area lain`:''}. Observasi harga, bukan konfirmasi entry/TP.`);
 },[data,price,now,tolerance,alertDistance,alertsEnabled,onNotify]);
 const fmt=n=>n.toFixed(digits);
 return <section className="cop-panel space-y-4" aria-label="Kunci H4 · pertemuan level harga">
  <div className="flex justify-between gap-3 flex-wrap"><div><p className="workspace-eyebrow">KUNCI H4 · PERTEMUAN NILAI ANTAR TIMEFRAME</p><h2 className="text-lg font-bold mt-2">Petunjuk area sasaran H4</h2></div><label className="text-xs text-slate-300">Selisih maksimum (satuan harga)<select className="block bg-slate-900 border border-slate-600 rounded-lg p-2 mt-1" value={tolerance} onChange={e=>setTolerance(Number(e.target.value))}>{[0,.1,.5,1,2,5].map(v=><option key={v} value={v}>{v===0?'Sama pada presisi tampilan':v}</option>)}</select></label></div>
  <div className="flex items-center gap-4 flex-wrap text-xs text-slate-300">
   <label className="flex items-center gap-2"><input type="checkbox" checked={alertsEnabled} onChange={e=>setAlertsEnabled(e.target.checked)}/>Notifikasi otomatis saat aplikasi terbuka</label>
   <label>Jarak peringatan <select className="bg-slate-900 rounded border border-slate-600 p-2 ml-2" value={alertDistance} onChange={e=>setAlertDistance(Number(e.target.value))}>{[.1,.5,1,2,5].map(v=><option key={v} value={v}>{v} satuan harga</option>)}</select></label>
   <span>Tanpa suara · setiap jenis peringatan sekali per level/periode</span>
  </div>
  {(matrix?.rsColumns||[]).some(c=>c.anomalies?.length>0)&&<div className="p-3 rounded-lg border border-rose-700 text-rose-200 text-xs space-y-2" role="status"><strong>Anomali urutan level · rumus Excel COP TAH</strong>{matrix.rsColumns.filter(c=>c.anomalies?.length).map(c=><p key={c.timeframe}>{c.label}: {c.anomalies.map(a=>`${a.lower.toUpperCase()} ${fmt(a.lowerValue)} > ${a.upper.toUpperCase()} ${fmt(a.upperValue)} (selisih ${fmt(a.difference)})`).join('; ')}</p>)}<p>Nilai asli dipertahankan. Urutan rencana tidak valid berarti WAIT.</p></div>}
  <p className="text-sm text-slate-400">Cocokkan R1–R4, Pivot, S1–S4 dan HSH Open N H4 dengan Market, Daily, Week, Month, Kuartal, Semester dan Year. Prioritas menurut jumlah timeframe yang bertemu, lalu jarak; bukan probabilitas harga akan sampai.</p>
  {!result.available?<p className="text-amber-200 text-sm">Data H4 aktif belum tersedia.</p>:!result.groups.length?<p className="text-amber-200 text-sm">Belum ada level H4 yang cocok pada batas selisih ini. Tidak membuat sasaran pengganti.</p>:<div className="grid grid-cols-1 xl:grid-cols-2 gap-3">{result.groups.map(g=><article key={g.key} className="rounded-xl border border-amber-700/50 bg-slate-900/60 p-4 space-y-2">
   <h3 className="font-bold text-amber-200">H4 {levelName(g.key)} · {fmt(g.value)}</h3>
   <p className="text-xs text-slate-300">{g.count} timeframe bertemu · {g.side==='ABOVE'?'Di atas harga':g.side==='BELOW'?'Di bawah harga':'Di harga sekarang'} · jarak {fmt(g.distance)}</p>
   <p className="text-sm text-cyan-200">{g.toward}</p>
   <ul className="space-y-2">{g.matches.map(m=><li key={m.timeframe+m.level} className="text-xs text-slate-300 border-t border-slate-700 pt-2">{m.label} {levelName(m.level)}: {fmt(m.value)} · {m.exact?'Sama':`Dekat · selisih ${fmt(m.delta)}`}<br/><span className="text-slate-400">{m.status} dalam periode {m.label}</span></li>)}</ul>
  </article>)}</div>}
  <H4MicroIndications columns={matrix?.rsColumns} price={price} tolerance={tolerance} decimals={digits} now={now}/>
  {!!result.missing.length&&<p className="text-xs text-amber-200">Data pembanding belum tersedia/aktif: {result.missing.join(', ')}.</p>}
  <p className="text-xs text-slate-400">Sasaran di atas dan bawah tetap ditampilkan. Arah teramati mengikuti Close H4 terhadap Open H4; bukan ramalan. Sentuhan dihitung per periode pembanding, bukan bukti entry atau TP transaksi. Sumber: {data?.dataSource||'menunggu data'}.</p>
 </section>;
}

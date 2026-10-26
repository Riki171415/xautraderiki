import {useEffect,useRef,useState} from 'react';
import {useLiveMatrix} from '../hooks/useLiveMatrix';
import {quoteIsStale} from '../analysisState.mjs';
import {recordTaskHistory,readTaskHistory} from '../taskHistory.mjs';
const label=k=>k==='pivot'?'PV':k?.replace('sup','S').replace('res','R')||'—';
const date=t=>new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'});
export default function TaskHistory({data,liveTick,now,visible,broker,symbol}) {
 const matrix=useLiveMatrix(data,liveTick,now),[records,setRecords]=useState(()=>{try{return readTaskHistory(localStorage);}catch{return [];}});
 const [tf,setTf]=useState('ALL'),[anomaly,setAnomaly]=useState(false),[saveError,setSaveError]=useState(false);
 const recordsRef=useRef(records),lastSample=useRef(0);
 const scope=`${broker}|${symbol}`,matches=data?.broker?.id===broker&&data?.symbol===symbol;
 useEffect(()=>{
  if(!matches||!matrix||quoteIsStale(data,now)||now-lastSample.current<5000)return;
  lastSample.current=now;
  const next=recordTaskHistory(recordsRef.current,{scope,columns:matrix.rsColumns,rows:matrix.tableRows,now});
  recordsRef.current=next;setRecords(next);
  try{localStorage.setItem('coptah.taskHistory.v1',JSON.stringify(next));setSaveError(false);}catch{setSaveError(true);}
 },[matrix,data,now,scope,matches]);
 if(!visible)return null;
 const scoped=records.filter(r=>r.scope===scope),filtered=scoped.filter(r=>(tf==='ALL'||r.timeframe===tf)&&(!anomaly||r.patterns.some(p=>p.pattern.startsWith('ANL'))));
 const fmt=v=>v.toFixed(data?.decimals??3);
 function download(){const blob=new Blob([JSON.stringify({source:scope,timeZone:'Asia/Jakarta',note:'Waktu deteksi aplikasi, bukan waktu sentuhan historis. Urutan belum terverifikasi.',records:filtered},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`riwayat-tugas-${symbol.replaceAll('/','-')}.json`;a.click();URL.revokeObjectURL(url);}
 return <section className="cop-panel space-y-4"><header><h2 className="text-lg font-bold">Riwayat tugas tiap TF · {symbol}</h2><p className="text-xs text-slate-400">{broker} · Disimpan di browser ini selama aplikasi terbuka, termasuk saat berpindah menu. Maksimal 1.500 periode terbaru.</p></header>
 <p className="text-sm text-amber-200">Waktu di bawah adalah saat aplikasi pertama mendeteksi level dalam rentang OHLC, bukan waktu pasti harga menyentuhnya. Data sebelum pencatatan dan saat aplikasi tertutup tidak direkonstruksi. Urutan Busur → Target serta penyelesaian tugas belum terverifikasi.</p>
 {saveError&&<p role="status">Penyimpanan browser tidak tersedia; catatan baru hanya tersimpan selama sesi ini.</p>}
 <div className="flex gap-3 flex-wrap items-center"><label>Timeframe <select className="bg-slate-900 p-2" value={tf} onChange={e=>setTf(e.target.value)}><option value="ALL">Semua TF</option>{[...new Set(scoped.map(r=>r.timeframe))].map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}</select></label><label><input type="checkbox" checked={anomaly} onChange={e=>setAnomaly(e.target.checked)}/> Pernah pola ANL</label><button className="chart-toggle" disabled={!filtered.length} onClick={download}>Unduh catatan JSON</button></div>
 {!filtered.length&&<p role="status">Belum ada catatan sesuai filter. Pencatatan dimulai setelah data sumber dan periode aktif tersedia.</p>}
 <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead><tr>{['TF / periode WIB','JIKA','Busur','Target','Pola teramati','Level & waktu deteksi WIB','Urutan'].map(h=><th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map(r=>{const task=k=>!k?'Netral':`${label(k)} · ${r.touches[k]?'✓ Tersentuh':'Belum teramati'}`;return <tr key={r.key} className="border-t border-slate-700"><td className="p-3"><b>{r.timeframe.toUpperCase()}</b><p>{date(r.start)} → {date(r.end)}</p><p>{now>=r.end?'Periode berakhir · catatan terakhir':'Periode berjalan'}</p></td><td className="p-3">{r.jika}</td><td className="p-3">{task(r.bowKey)}</td><td className="p-3">{task(r.targetKey)}</td><td className="p-3">{r.patterns.map((p,i)=><p key={i} className={p.pattern.startsWith('ANL')?'text-amber-200':''}>{p.pattern} · {date(p.observedAt)}</p>)}</td><td className="p-3">{Object.entries(r.touches).map(([k,t])=><p key={k}>✓ {label(k)} {fmt(t.value)} · {date(t.observedAt)}</p>)}{!Object.keys(r.touches).length&&'Belum teramati'}</td><td className="p-3">Belum terverifikasi<p>Mulai dipantau: {date(r.firstObservedAt)}</p><p>Terakhir: {date(r.lastObservedAt)}</p></td></tr>;})}</tbody></table></div>
 <p className="text-xs text-slate-400">ANL UP/DWN adalah pola Perahu yang melawan JIKA; berbeda dari anomali susunan angka R/S. Level tersentuh bukan bukti transaksi, TP, atau tugas selesai.</p></section>;
}

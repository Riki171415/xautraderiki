import {useState,useEffect,useRef} from 'react';
import {dailyH4Task} from '../dailyH4Task.mjs';
import {habitWarnings} from '../habitWarnings.mjs';
import {projectMatrix} from '../liveMatrix.mjs';
export default function MarketHabitPanel({data,liveTick,now,onNotify}) {
 const [target,setTarget]=useState('AUTO'),[enabled,setEnabled]=useState(true);
 const seen=useRef(new Set());const prior=useRef(null);
 const matrix=projectMatrix(data?.leak4RegMatrix,liveTick,data?.decimals??3,now);
 const price=liveTick?.bid??Number(matrix?.currentPrice);
 const w=habitWarnings(matrix?.rsColumns,data?.marketCycle,price,{target,now});
 const task=dailyH4Task(data?.dailyH4Context,w.daily?.value,now);
 const history=data?.marketHabits;
 useEffect(()=>{
  if(!data||data.marketDataStatus==='STALE_QUOTE'||now-data.timestamp>45000||!enabled||!onNotify)return;
  const scope=`${data.broker?.id}|${data.symbol}`;
  if(prior.current!==scope){seen.current=new Set();prior.current=scope;}
  const notes=[...w.notes,...(task.hit?[{id:`last-h4:${task.hitStart}:${task.target}`,text:task.reason}]:[])];
  const pending=notes.filter(n=>!seen.current.has(`${n.id}:${data.marketCycle?.tradingDay}:${data.marketCycle?.activeSession}`));
  if(!pending.length)return;
  for(const n of pending)seen.current.add(`${n.id}:${data.marketCycle?.tradingDay}:${data.marketCycle?.activeSession}`);
  onNotify('warning',`${data.symbol}: ${pending.map(n=>n.text).join(' ')}`);
 },[data,now,target,enabled]);
 const fmt=n=>Number.isFinite(n)?n.toFixed(data?.decimals??3):'—';
 const stat=s=>s?.coverage?`${s.bars} jam · O ${fmt(s.open)} / H ${fmt(s.high)} / L ${fmt(s.low)} / C ${fmt(s.close)} · median rentang H1 ${fmt(s.medianRange)}`:`Riwayat belum lengkap (${s?.bars??0}/${s?.expected??0} jam)`;
 return <section className="cop-panel space-y-4">
  <h2 className="font-bold text-lg">Kebiasaan market & tugas Daily</h2>
  <p className="text-xs text-slate-400">Lalu: OB/HB/LB dan sesi pembanding. Sekarang: gerak aktual. Yang akan datang: dua skenario yang terus dievaluasi. Kebiasaan tidak mengalahkan data aktual.</p>
  <label className="text-xs flex gap-2 items-center"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>Notifikasi anomali/konteks Daily saat aplikasi terbuka</label>
  <div className="grid md:grid-cols-2 gap-3"><div className="p-3 border border-slate-700 rounded-xl text-xs space-y-2"><strong>{history?.session||'Market'} sekarang vs sesi sejenis sebelumnya · {history?.elapsedHours??0} jam selesai</strong><p>Sekarang: {stat(history?.current)}</p><p>Pembanding: {stat(history?.previous)}</p>{history?.available&&<p className="text-cyan-200">Median rentang sesi sekarang {history.current.medianRange>history.previous.medianRange?'lebih besar':history.current.medianRange<history.previous.medianRange?'lebih kecil':'sama'} dibanding pembanding; gerak sekarang {history.current.close>history.current.open?'UP':history.current.close<history.current.open?'DOWN':'FLAT'}, sebelumnya {history.previous.close>history.previous.open?'UP':history.previous.close<history.previous.open?'DOWN':'FLAT'}. Ini observasi, bukan ramalan.</p>}<p className="text-slate-400">{history?.note||'Menunggu riwayat H1 dari sumber yang sama.'}</p></div>
  <div className="p-3 border border-slate-700 rounded-xl text-xs space-y-2"><label>Sasaran Daily <select className="bg-slate-900 border rounded p-2" value={target} onChange={e=>setTarget(e.target.value)}><option value="AUTO">R1 jika UP / S1 jika DOWN</option>{['res1','res2','res3','res4','sup1','sup2','sup3','sup4'].map(k=><option key={k} value={k}>{k.toUpperCase()}</option>)}</select></label><p>{w.daily?`${w.daily.key.toUpperCase()} ${fmt(w.daily.value)} · ${w.daily.route} HSH ${fmt(w.daily.open)}.`:'Data Daily/H4 aktif atau arah Daily belum tersedia.'}</p><p className="text-slate-400">Gunakan panel pertemuan H4 untuk mencari area ekuivalen. Dua H4 terakhir dihitung dari batas Daily broker, bukan jam WIB tetap.</p></div></div>
  <div className="p-3 rounded-xl border border-cyan-800 space-y-2 text-xs"><strong>Dua H4 terakhir · penyelesaian sasaran Daily</strong><p>{task.reason}</p>{task.windows?.map(x=><p key={x.start}>{new Date(x.start).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})} WIB · {x.status} · {x.hit?'Sasaran tersentuh':'Sentuhan belum teramati'} · H {fmt(x.high)} / L {fmt(x.low)}</p>)}<p>Level dipantau: {fmt(task.target)}. Gunakan pilihan sasaran Daily di atas. Harga 4199 pada contoh Jumat bukan sasaran tetap hari lain. Ketika H4 pertama belum menyentuh sasaran, pantau H4 terakhir.</p></div>
  {history?.weeks?.map(x=><div key={x.label} className="text-xs border-t border-slate-700 pt-3 space-y-1"><strong>{x.label} · {x.forming?'sementara':'selesai'}</strong><p>Minggu ini: {stat(x.current)}</p><p>Minggu sebelumnya, durasi setara: {stat(x.previous)}</p></div>)}
  {w.notes.map(n=><p key={n.id} className="text-xs text-amber-200 border border-amber-800 rounded-lg p-3">{n.text}</p>)}
  <p className="text-xs text-slate-400">Dua arah: reaksi kembali ke Open Daily atau kelanjutan menembus sasaran. Bukan instruksi membalik posisi otomatis. TP transaksi hanya dinilai setelah entry; urutan belum terbukti berarti belum terkonfirmasi.</p>
 </section>;
}

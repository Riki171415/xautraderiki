import {quoteIsStale} from '../analysisState.mjs';
import {useState} from 'react';
import {dailyTaskForColumn} from '../dailyH4Task.mjs';
import {habitWarnings} from '../habitWarnings.mjs';
import {useLiveMatrix} from '../hooks/useLiveMatrix';
export default function MarketHabitPanel({data,liveTick,now,onNotify,target:sharedTarget,onTarget,alertSettings,onAlertSettings,contextOnly=false}) {
 const [localTarget,setLocalTarget]=useState('AUTO');
 const target=sharedTarget??localTarget,setTarget=onTarget??setLocalTarget;
 const enabled=alertSettings?.dailyEnabled??true;
 const setEnabled=value=>onAlertSettings?.(s=>({...s,dailyEnabled:value}));
 const matrix=useLiveMatrix(data,liveTick,now);
 const price=Number(matrix?.currentPrice);
 const w=habitWarnings(matrix?.rsColumns,data?.marketCycle,price,{target,now,stale:quoteIsStale(data,now)});
 const task=dailyTaskForColumn(data?.dailyH4Context,matrix?.rsColumns?.find(c=>c.timeframe==='1d'),w.daily?.value,now);
 const history=data?.marketHabits;
 const fmt=n=>Number.isFinite(n)?n.toFixed(data?.decimals??3):'—';
 const stat=s=>s?.coverage?`${s.bars} jam · O ${fmt(s.open)} / H ${fmt(s.high)} / L ${fmt(s.low)} / C ${fmt(s.close)} · median rentang H1 ${fmt(s.medianRange)}`:`Riwayat belum lengkap (${s?.bars??0}/${s?.expected??0} jam)`;
 return <section className="cop-panel space-y-4">
  <h2 className="font-bold text-lg">{contextOnly?'Kebiasaan Market':'Kebiasaan market & tugas Daily'}</h2>
  <p className="text-xs text-slate-400">Lalu: OB/HB/LB dan sesi pembanding. Sekarang: gerak aktual. Yang akan datang: dua skenario yang terus dievaluasi. Kebiasaan tidak mengalahkan data aktual.</p>
  <label className="text-xs flex gap-2 items-center"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>Notifikasi anomali/konteks Daily saat aplikasi terbuka</label>
  <div className={contextOnly?'grid gap-3':'grid md:grid-cols-2 gap-3'}><div className="p-3 border border-slate-700 rounded-xl text-xs space-y-2"><strong>{history?.session||'Market'} sekarang vs sesi sejenis sebelumnya · {history?.elapsedHours??0} jam selesai</strong><p>Sekarang: {stat(history?.current)}</p><p>Pembanding: {stat(history?.previous)}</p>{history?.available&&<p className="text-cyan-200">Median rentang sesi sekarang {history.current.medianRange>history.previous.medianRange?'lebih besar':history.current.medianRange<history.previous.medianRange?'lebih kecil':'sama'} dibanding pembanding; gerak sekarang {history.current.close>history.current.open?'UP':history.current.close<history.current.open?'DOWN':'FLAT'}, sebelumnya {history.previous.close>history.previous.open?'UP':history.previous.close<history.previous.open?'DOWN':'FLAT'}. Ini observasi, bukan ramalan.</p>}<p className="text-slate-400">{history?.note||'Menunggu riwayat H1 dari sumber yang sama.'}</p></div>
  {!contextOnly&&<div className="p-3 border border-slate-700 rounded-xl text-xs space-y-2"><label>Pantauan tambahan Daily <select className="bg-slate-900 border rounded p-2" value={target} onChange={e=>setTarget(e.target.value)}><option value="AUTO">Tanpa tambahan · Target JIKA</option>{['res1','res2','res3','res4','sup1','sup2','sup3','sup4'].map(k=><option key={k} value={k}>{k.toUpperCase()}</option>)}</select></label>{w.daily?.additional&&<p>Pantauan tambahan {w.daily.additional.key.toUpperCase()} {fmt(w.daily.additional.value)} · {w.daily.additional.touched?'tersentuh':'belum teramati'}</p>}<p>{w.daily?`${w.daily.key.toUpperCase()} ${fmt(w.daily.value)} · ${w.daily.route} HSH ${fmt(w.daily.open)}.`:'Data Daily/H4 aktif atau arah Daily belum tersedia.'}</p><p className="text-slate-400">Gunakan panel pertemuan H4 untuk mencari area ekuivalen. Dua H4 terakhir dihitung dari batas Daily broker, bukan jam WIB tetap.</p></div>}</div>
  {!contextOnly&&<div className="p-3 rounded-xl border border-cyan-800 space-y-2 text-xs"><strong>Dua H4 terakhir · penyelesaian sasaran Daily</strong><p>{task.reason}</p>{task.windows?.map(x=><p key={x.start}>{new Date(x.start).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})} WIB · {x.status} · {x.hit?'Sasaran tersentuh':'Sentuhan belum teramati'} · H {fmt(x.high)} / L {fmt(x.low)}</p>)}<p>Level dipantau: {fmt(task.target)}. Dua H4 terakhir selalu memantau Target utama sesuai JIKA; pilihan manual hanya pantauan tambahan. Harga 4199 pada contoh Jumat bukan sasaran tetap hari lain. Ketika H4 pertama belum menyentuh sasaran, pantau H4 terakhir.</p></div>}
  {history?.weeks?.map(x=><div key={x.label} className="text-xs border-t border-slate-700 pt-3 space-y-1"><strong>{x.label} · {x.forming?'sementara':'selesai'}</strong><p>Minggu ini: {stat(x.current)}</p><p>Minggu sebelumnya, durasi setara: {stat(x.previous)}</p></div>)}
  {(contextOnly?w.notes.filter(n=>n.id==='habit'):w.notes).map(n=><p key={n.id} className="text-xs text-amber-200 border border-amber-800 rounded-lg p-3">{n.text}</p>)}
  <p className="text-xs text-slate-400">Dua arah: reaksi kembali ke Open Daily atau kelanjutan menembus sasaran. Bukan instruksi membalik posisi otomatis. TP transaksi hanya dinilai setelah entry; urutan belum terbukti berarti belum terkonfirmasi.</p>
 </section>;
}

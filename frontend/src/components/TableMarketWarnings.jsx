import {habitWarnings} from '../habitWarnings.mjs';
import {dailyTaskForColumn} from '../dailyH4Task.mjs';
import {levelName} from '../h4LevelMatches.mjs';
export default function TableMarketWarnings({data,columns=[],price,now=Date.now(),target='AUTO',onTarget,onOpenAnalysis}) {
 const decimals=data?.decimals??3,fmt=v=>Number.isFinite(v)?v.toFixed(decimals):'—';
 const result=habitWarnings(columns,data?.marketCycle,Number(price),{target,now,stale:data?.marketDataStatus==='STALE_QUOTE'});
 const task=dailyTaskForColumn(data?.dailyH4Context,columns.find(c=>c.timeframe==='1d'),result.daily?.value,now);
 const stale=data?.marketDataStatus==='STALE_QUOTE'||!data?.timestamp||now-data.timestamp>45000;
 const daily=result.daily,history=data?.marketHabits;
 const historyReady=history?.available&&history.current&&history.previous;
 const habit=result.notes.filter(n=>n.id==='habit');
 const status=stale?'DATA LAMA':!daily?'DATA BELUM CUKUP':daily.touched?'LEVEL TERSENTUH':'MASIH DIPANTAU';
 return <section className="table-market-warnings" aria-label="Peringatan kebiasaan market dan tugas Daily">
  {onOpenAnalysis&&<button className="chart-toggle" onClick={onOpenAnalysis}>Rincian Sesi Market & Daily →</button>}
  <article className={`table-warning-card ${stale||!daily?'is-muted':daily.touched?'is-complete':'is-attention'}`}><header><h3>◷ Tugas Daily</h3><strong>{status}</strong></header>
   <div className="table-warning-target"><label>Pantau <select aria-label="Pantauan tambahan Daily pada tabel" value={target} onChange={e=>onTarget?.(e.target.value)}><option value="AUTO">Target utama sesuai JIKA</option>{['res1','res2','res3','res4','sup1','sup2','sup3','sup4'].map(k=><option key={k} value={k}>{levelName(k)}</option>)}</select></label>{daily&&<b>Target {levelName(daily.key)} {fmt(daily.value)} · Busur {levelName(daily.bow.key)} {fmt(daily.bow.value)}</b>}</div>
   {daily?.additional&&<p>Pantauan tambahan {levelName(daily.additional.key)} {fmt(daily.additional.value)} · {daily.additional.touched?'tersentuh':'belum teramati'}</p>}
   <p>{stale?'Harga terakhir belum segar. Status ini belum dapat dibaca sebagai kondisi live.':daily?daily.touched?'Harga sudah mencapai level Daily ini. Pantau reaksi kembali ke Open Daily atau lanjut menembus.':'Harga belum mencapai level Daily ini. Perhatikan arah TF kecil dan kecocokan H4 menuju level tersebut.':'Menunggu data Daily/H4 aktif atau arah Daily yang jelas.'}</p>
   <small>HSH / Open Daily {fmt(daily?.open)} · {task.available?task.hit?'✓ tersentuh pada dua H4 terakhir':task.reason:task.reason}</small>
   <details><summary>Lihat bukti & waktu</summary><p>{task.reason}</p>{task.windows?.map(w=><p key={w.start}>{new Date(w.start).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'})} WIB · {w.status} · {w.hit?'✓ sasaran tersentuh':'belum ada bukti sentuhan'}</p>)}<p>Target utama R1 saat JIKA UP / S1 saat DOWN; Busur pada sisi sebaliknya. Pilihan manual hanya menambah pantauan. Sentuhan level bukan TP transaksi atau kepastian pembalikan.</p></details>
  </article>
  <article className={`table-warning-card ${stale||!historyReady?'is-muted':habit.length?'is-attention':'is-context'}`}><header><h3>≈ Kebiasaan Market · {data?.marketCycle?.activeSession||'—'}</h3><strong>{stale?'DATA LAMA':habit.length?'PERHATIAN':historyReady?'KONTEKS':'DATA BELUM CUKUP'}</strong></header>
   <p>{historyReady?`Rentang gerak H1 sesi ini ${history.current.medianRange>history.previous.medianRange?'lebih besar':history.current.medianRange<history.previous.medianRange?'lebih kecil':'sama'} dari sesi sejenis sebelumnya pada durasi yang sama.`:'Riwayat sesi pembanding belum lengkap. Aplikasi belum menyimpulkan kebiasaan.'}</p>
   {historyReady&&<small>Median rentang H1: {fmt(history.current.medianRange)} vs {fmt(history.previous.medianRange)} · {history.elapsedHours} jam selesai</small>}
   <p>{habit.length?habit[0].text:'Pantau dua arah. Kebiasaan sesi merupakan bahan pertimbangan, bukan aturan harga harus bergerak tertentu.'}</p>
   <details><summary>Arti peringatan</summary><p>Anomali R/S Market hanya memberi konteks sasaran Daily sesuai sesi. Perhatikan harga aktual dan H4; tidak ada perintah entry otomatis.</p>{history?.weeks?.map(w=><p key={w.label}>{w.label}: {w.current?.coverage&&w.previous?.coverage?`median H1 ${fmt(w.current.medianRange)} vs pekan lalu ${fmt(w.previous.medianRange)}`:'data pembanding belum lengkap'}</p>)}</details>
  </article>
 </section>;
}

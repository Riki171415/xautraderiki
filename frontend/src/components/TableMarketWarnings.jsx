import ForexHabitSummary from './ForexHabitSummary';
import SupportWatchPanel from './SupportWatchPanel';
import DirectionContext from './DirectionContext';
import {quoteIsStale,dataQuality} from '../analysisState.mjs';
import {habitWarnings} from '../habitWarnings.mjs';
import {dailyTaskForColumn} from '../dailyH4Task.mjs';
import {levelName} from '../h4LevelMatches.mjs';
export default function TableMarketWarnings({data,columns=[],price,now=Date.now(),target='AUTO',onTarget,onOpenAnalysis,tolerance=0}) {
 const decimals=data?.decimals??3,fmt=v=>Number.isFinite(v)?v.toFixed(decimals):'—';
 const result=habitWarnings(columns,data?.marketCycle,Number(price),{target,now,stale:quoteIsStale(data,now)});
 const task=dailyTaskForColumn(data?.dailyH4Context,columns.find(c=>c.timeframe==='1d'),result.daily?.value,now);
 const stale=quoteIsStale(data,now);
 const daily=result.daily;
 const status=stale?dataQuality(data,now).label:!daily?'DATA BELUM CUKUP':daily.touched?'LEVEL TERSENTUH':'MASIH DIPANTAU';
 return <section className="table-market-warnings" aria-label="Peringatan kebiasaan market dan tugas Daily">
  <SupportWatchPanel/>{onOpenAnalysis&&<button className="chart-toggle" onClick={onOpenAnalysis}>Rincian Sesi Market & Daily →</button>}
  <article className={`table-warning-card ${stale||!daily?'is-muted':daily.touched?'is-complete':'is-attention'}`}><header><h3>◷ Tugas Daily</h3><strong>{status}</strong></header>
   <details className="warning-direction-disclosure"><summary>Pembacaan gabungan Daily</summary><DirectionContext columns={columns} timeframe="1d" now={now} stale={stale} tolerance={tolerance} decimals={decimals}/></details><div className="table-warning-target"><label>Pantau <select aria-label="Pantauan tambahan Daily pada tabel" value={target} onChange={e=>onTarget?.(e.target.value)}><option value="AUTO">Target utama sesuai JIKA</option>{['res1','res2','res3','res4','sup1','sup2','sup3','sup4'].map(k=><option key={k} value={k}>{levelName(k)}</option>)}</select></label>{daily&&<b>Target {levelName(daily.key)} {fmt(daily.value)} · Busur {levelName(daily.bow.key)} {fmt(daily.bow.value)}</b>}</div>
   {daily?.additional&&<p>Pantauan tambahan {levelName(daily.additional.key)} {fmt(daily.additional.value)} · {daily.additional.touched?'tersentuh':'belum teramati'}</p>}
   <p>{stale?'Harga terakhir belum segar. Status ini belum dapat dibaca sebagai kondisi live.':daily?daily.touched?'Harga sudah mencapai level Daily ini. Pantau reaksi kembali ke Open Daily atau lanjut menembus.':'Harga belum mencapai level Daily ini. Perhatikan arah TF kecil dan kecocokan H4 menuju level tersebut.':'Menunggu data Daily/H4 aktif atau arah Daily yang jelas.'}</p>
   <small>HSH / Open Daily {fmt(daily?.open)} · {task.available?task.hit?'✓ tersentuh pada dua H4 terakhir':task.reason:task.reason}</small>
   <details><summary>Lihat bukti & waktu</summary><p>{task.reason}</p>{task.windows?.map(w=><p key={w.start}>{new Date(w.start).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'})} WIB · {w.status} · {w.hit?'✓ sasaran tersentuh':'belum ada bukti sentuhan'}</p>)}<p>Target utama R1 saat JIKA UP / S1 saat DOWN; Busur pada sisi sebaliknya. Pilihan manual hanya menambah pantauan. Sentuhan level bukan TP transaksi atau kepastian pembalikan.</p></details>
  </article>
  <ForexHabitSummary data={data} columns={columns} price={price} now={now} target={target}/>
 </section>;
}

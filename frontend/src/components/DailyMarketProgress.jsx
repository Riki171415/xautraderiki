import {dailyMarketProgress} from '../dailyMarketProgress.mjs';
import {quoteIsStale} from '../analysisState.mjs';
import {taskFrameLabel} from '../taskFrameLabel.mjs';
import {levelName} from '../h4LevelMatches.mjs';
export default function DailyMarketProgress({columns=[],data,now=Date.now(),onDaily}) {
 const model=dailyMarketProgress(columns,{now,stale:quoteIsStale(data,now)}),d=model.daily;
 const fmt=v=>Number.isFinite(v)?v.toFixed(data?.decimals??3):'—';
 const area=(name,value,status)=><div><span>{name} · {value?levelName(value.key):'—'}</span><b>{fmt(value?.value)}</b><small>{status==='REACHED'?'✓ Level tersentuh':status==='PENDING'?'○ Belum tersentuh':'Belum terverifikasi'}</small></div>;
 return <section className="daily-market-progress" aria-label="Perjalanan Market mengerjakan Daily"><header><div><small>{taskFrameLabel('market',columns)} → Daily</small><h3>Tugas Daily yang sudah disentuh & pantauan berikutnya</h3></div>{onDaily&&<button type="button" className="chart-toggle" onClick={onDaily}>Rincian Daily →</button>}</header>
  <div className="daily-market-acuan"><div><span>JIKA Daily</span><b>{d.jika==='UNAVAILABLE'?'—':d.jika}</b><small>Open N {fmt(d.open)} / B {fmt(d.before)}</small></div>{area('Busur',d.bow,d.progress.bow)}{area('Target',d.target,d.progress.target)}</div>
  <p><strong>Sudah tersentuh: </strong>{model.verified?model.touched.length?model.touched.map(l=>`${levelName(l.key)} ${fmt(l.value)}${l.role==='BUSUR'?' · Busur':l.role==='TARGET'?' · Target':''}`).join(' | '):'Belum ada level R4–S4 yang tersentuh pada periode Daily ini.':'Belum dapat dinilai dari data aktif yang terverifikasi.'}</p>
  <div className="daily-market-next"><strong>{model.next?`${model.next.name} · ${levelName(model.next.key)} ${fmt(model.next.value)}`:model.phase==='CONFLICT'?'ARAH ACUAN BELUM SELARAS':'Tugas berikutnya · menunggu konfirmasi'}</strong><p>{model.reason}</p><small>{model.references.map((r,i)=>`${i===0?'H4':'Market'}: JIKA ${r.jika} · MOVE ${r.move}`).join(' | ')}</small></div>
  {model.both&&<p className="direction-warning">Busur dan Target Daily sama-sama masuk rentang High–Low. Urutan sentuhannya belum terbukti; tidak menyimpulkan Busur selesai lalu Target.</p>}
  <details><summary>Bukti level Daily · seluruh R4–S4</summary><p>Daily N: Low {fmt(d.low)} / High {fmt(d.high)}. Status sentuhan mengikuti model tugas yang sama.</p><ul>{model.levels.map(l=><li key={l.key}>{l.touched===true?'✓':l.touched===false?'○':'—'} {levelName(l.key)} {fmt(l.value)} · {l.role}</li>)}</ul></details>
  <footer>Level tersentuh bukan akhir Busur terkonfirmasi atau TP transaksi. Level lanjutan adalah pantauan, bukan tugas akhir otomatis atau order baru.</footer>
 </section>;
}

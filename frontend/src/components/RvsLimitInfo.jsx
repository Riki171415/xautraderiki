import {rvsLimit,timeframeLevelStrength,STRENGTH_REFERENCES,STRENGTH_LABELS} from '../rvsLimit.mjs';
import {levelName} from '../h4LevelMatches.mjs';
import {supportAreas} from '../supportAlerts.mjs';
export default function RvsLimitInfo({column,columns=[],now=Date.now(),stale=false,decimals=3,price,referenceColumns=[]}) {
 const model=rvsLimit(column,{now,stale}),fmt=v=>v==null?'—':v.toFixed(decimals);
 const text={INCOMPLETE:'Batas sebelumnya belum lengkap',UNVERIFIED:'Status belum terverifikasi',BOTH:'Kedua batas sudah ditembus',UP:'High B ditembus ke atas',DOWN:'Low B ditembus ke bawah',WITHIN:'Masih di dalam batas sebelumnya'};
 const readings=column?['pivot','sup1','sup2','sup3','sup4','res1','res2','res3','res4'].map(key=>({key,...timeframeLevelStrength(columns,column.timeframe,key,{now,stale,price,decimals,referenceColumns})})):[];
 const tfLabel=STRENGTH_LABELS[column?.timeframe]||column?.timeframe||'TF';
 const referenceTf=STRENGTH_REFERENCES[column?.timeframe],referenceLabel=STRENGTH_LABELS[referenceTf]||'pembanding';
 const month=[...columns,...referenceColumns].find(c=>c.timeframe===referenceTf)?.pivot;
 const numeric=v=>v!=null&&Number.isFinite(Number(v))?Number(v):null;
 const current=numeric(price);
 const nearby=current==null?[]:supportAreas(columns,now).filter(a=>a.value<=current).sort((a,b)=>b.value-a.value).slice(0,3);
 return <aside className="rvs-limit-info rvs-readable">
  <header className="rvs-heading"><div><small>Batas candle sebelumnya</small><h3>RVS LIMIT</h3></div><span className={`rvs-status rvs-status-${model.status.toLowerCase()}`}>{text[model.status]}</span></header>
  <dl className="rvs-reference-grid"><div><dt>Low B</dt><dd>{fmt(model.low)}</dd></div><div><dt>High B</dt><dd>{fmt(model.high)}</dd></div></dl>
  {(model.up||model.down)&&<p className="rvs-next-step" role="status">Periksa arah dan level timeframe yang lebih besar. Batas yang ditembus bisa mengindikasikan tugas TF besar sedang berjalan.</p>}
  <p className="rvs-caution">Tembus batas bukan sinyal entry otomatis atau bukti urutan transaksi.</p>
  <details className="rvs-method"><summary>Pantauan awal support lintas timeframe</summary><p>Pivot, S1–S4, Low B dan swing low H1 dipantau terpisah dari support kuat Daily. Uji support harus datang dari atas. Pantulan awal memerlukan respons harga setelah pengujian; area yang ditembus diberi status tersendiri.</p>{nearby.length?<ul className="rvs-rules">{nearby.map(a=><li key={a.id}>{a.timeframe} · {a.label} <b>{fmt(a.value)}</b> · jarak {fmt(current-a.value)}</li>)}</ul>:<p>Belum ada area acuan aktif di bawah harga.</p>}<p className="rvs-caution">Mengikuti pengaturan notifikasi Daily. Pengamatan berjalan selama aplikasi terbuka dan data segar. Area dapat ditembus; peringatan bukan sinyal entry.</p></details>
  {column&&<section className="rvs-daily-section">
   <header className="rvs-daily-heading"><h3>Kekuatan relatif level {tfLabel}</h3><span>Harga acuan <b>{fmt(numeric(price))}</b></span></header>
   <div className="rvs-strength-grid">{[['Support relatif kuat','support'],['Resistance relatif kuat','resistance']].map(([label,key])=>{const levels=readings.filter(s=>s[key]);const verified=readings.every(s=>s.valid&&s.role!=='UNVERIFIED');return <div className={`rvs-strength-card rvs-strength-${key}`} key={key}><h4>{label}</h4>{levels.length?<ul>{levels.map(s=><li key={s.key}><span>{levelName(s.key)}</span><b>{fmt(s.value)}</b></li>)}</ul>:<p className="rvs-empty">{verified?'Belum ada level yang memenuhi':'Data belum terverifikasi'}</p>}</div>;})}</div>
   <div className="rvs-month-reference"><span>Pembanding {referenceLabel}</span><span>Pivot {referenceLabel} <b>{fmt(numeric(month))}</b></span></div>
   <p className="rvs-caution">Posisi level terhadap harga membantu membaca area; belum membuktikan harga akan tertahan.</p>
   <details className="rvs-method"><summary>Lihat aturan penilaian & rincian level</summary>
    <ul className="rvs-rules"><li><b>Support:</b> level keluarga S atau Pivot berada di bawah harga, di atas Pivot {referenceLabel} dan Low B {tfLabel}.</li><li><b>Resistance:</b> level keluarga R atau Pivot berada di atas harga, di bawah Pivot {referenceLabel} dan High B {tfLabel}.</li><li><b>Di area:</b> level sama dengan harga pada presisi instrumen. Kesamaan tidak dihitung sebagai di atas atau di bawah pembanding.</li><li>Nama level tetap: S adalah keluarga support dan R adalah keluarga resistance, meskipun harga sudah melewatinya.</li></ul>
    <div className="rvs-role-table"><table><thead><tr><th>Level {tfLabel}</th><th>Posisi terhadap harga</th><th>Hasil & alasan COP TAH</th></tr></thead><tbody>{readings.map(s=><tr key={s.key}><td>{levelName(s.key)} {fmt(s.value)}</td><td>{{SUPPORT:'Di bawah harga',RESISTANCE:'Di atas harga',AT:'Di area',UNVERIFIED:'Belum terverifikasi'}[s.role]}</td><td><strong>{s.support?'SUP KUAT':s.resistance?'RES KUAT':s.status==='AT'?'DI AREA':s.status==='UNVERIFIED'||s.status==='INACTIVE'||s.status==='INCOMPLETE'?'BELUM TERVERIFIKASI':'BELUM MEMENUHI'}</strong><small>{s.reason}</small>{s.valid&&s.role!=='UNVERIFIED'&&s.checks.map(c=><small key={c.label}>{c.pass?'✓':'○'} {c.label} {fmt(c.reference)}</small>)}</td></tr>)}</tbody></table></div>
    <p>Kekuatan {tfLabel} adalah konteks support/resistance. STRONG BUY/SELL hanya untuk TF kecil M1–H1 setelah seluruh konfirmasi TF kecil → H4 → TF besar terpenuhi.</p>
   </details>
  </section>}
 </aside>;
}

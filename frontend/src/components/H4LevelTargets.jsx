import H4AttentionAreas from './H4AttentionAreas';
import {h4MicroMatches} from '../h4LevelMatches.mjs';
import {instrumentTolerance} from '../instrumentTolerance.mjs';
import {useLiveMatrix} from '../hooks/useLiveMatrix';
import H4MicroIndications from './H4MicroIndications';
import {useState} from 'react';
import {h4LevelMatches,levelName} from '../h4LevelMatches.mjs';
export default function H4LevelTargets({data,liveTick,now=Date.now(),onNotify,tolerance:sharedTolerance,onTolerance,alertSettings,onAlertSettings}) {
 const [localTolerance,setLocalTolerance]=useState(0);
 const tolerance=sharedTolerance??localTolerance;
 const setTolerance=onTolerance??setLocalTolerance;
 const alertsEnabled=alertSettings?.h4Enabled??true,alertDistance=alertSettings?.distance??1;
 const setAlertsEnabled=value=>onAlertSettings?.(s=>({...s,h4Enabled:value}));
 const setAlertDistance=value=>onAlertSettings?.(s=>({...s,distance:value}));

 const matrix=useLiveMatrix(data,liveTick,now);
 const price=liveTick?.bid??Number(matrix?.currentPrice),digits=data?.decimals??3;
 const h4=matrix?.rsColumns?.find(c=>c.timeframe==='4h');
 const move=h4?Number(h4.closeN)>Number(h4.openN)?'UP':Number(h4.closeN)<Number(h4.openN)?'DOWN':'FLAT':'FLAT';
 const result=h4LevelMatches(matrix?.rsColumns,price,{decimals:digits,tolerance,now,move});
 const microAreas=h4MicroMatches(matrix?.rsColumns,price,{tolerance,decimals:digits,now});
 const attentionAreas=result.groups.map(g=>({...g,microMatches:microAreas.groups.find(m=>m.key===g.key)?.matches||[]}));
 const fmt=n=>n.toFixed(digits);
 const rawLevels=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
 const candidates=rawLevels.flatMap(key=>{const value=Number(h4?.[key]);if(h4?.[key]==null||!Number.isFinite(value))return [];const near=(matrix?.rsColumns||[]).filter(c=>['market','1d','1w','1M','3M','6M','1Y'].includes(c.timeframe)&&(!Number.isFinite(c.periodEnd)||c.periodStart<=now&&now<c.periodEnd)).flatMap(c=>rawLevels.flatMap(k=>c[k]!=null&&Number.isFinite(Number(c[k]))?[{label:c.label,key:k,value:Number(c[k]),delta:Math.abs(value-Number(c[k]))}]:[])).sort((a,b)=>a.delta-b.delta)[0];return [{key,value,near}];});
 return <section className="cop-panel space-y-4" aria-label="Kunci H4 · pertemuan level harga">
  <div className="flex justify-between gap-3 flex-wrap"><div><p className="workspace-eyebrow">KUNCI H4 · PERTEMUAN NILAI ANTAR TIMEFRAME</p><h2 className="text-lg font-bold mt-2">Petunjuk area sasaran H4</h2></div><label className="text-xs text-slate-300">Selisih maksimum (satuan harga)<select className="block bg-slate-900 border border-slate-600 rounded-lg p-2 mt-1" value={tolerance} onChange={e=>setTolerance(Number(e.target.value))}>{instrumentTolerance(data?.symbol).values.map(v=><option key={v} value={v}>{v===0?'Sama pada presisi tampilan':v}</option>)}</select></label></div>
  <p className="text-xs text-slate-300">{instrumentTolerance(data?.symbol).note} Aktif: ≤ {tolerance} {instrumentTolerance(data?.symbol).unit}.</p>
  <div className="flex items-center gap-4 flex-wrap text-xs text-slate-300">
   <label className="flex items-center gap-2"><input type="checkbox" checked={alertsEnabled} onChange={e=>setAlertsEnabled(e.target.checked)}/>Notifikasi otomatis saat aplikasi terbuka</label>
   <label>Jarak peringatan <select className="bg-slate-900 rounded border border-slate-600 p-2 ml-2" value={alertDistance} onChange={e=>setAlertDistance(Number(e.target.value))}>{[.1,.5,1,2,5].map(v=><option key={v} value={v}>{v} satuan harga</option>)}</select></label>
   <span>Tanpa suara · setiap jenis peringatan sekali per level/periode</span>
  </div>
  {(matrix?.rsColumns||[]).some(c=>c.anomalies?.length>0)&&<div className="p-3 rounded-lg border border-rose-700 text-rose-200 text-xs space-y-2" role="status"><strong>Anomali urutan level · rumus Excel COP TAH</strong>{matrix.rsColumns.filter(c=>c.anomalies?.length).map(c=><p key={c.timeframe}>{c.label}: {c.anomalies.map(a=>`${a.lower.toUpperCase()} ${fmt(a.lowerValue)} > ${a.upper.toUpperCase()} ${fmt(a.upperValue)} (selisih ${fmt(a.difference)})`).join('; ')}</p>)}<p>Nilai asli dipertahankan. Urutan rencana tidak valid berarti WAIT.</p></div>}
  <p className="text-sm text-slate-400">Cocokkan R1–R4, Pivot, S1–S4 dan HSH Open N H4 dengan Market, Daily, Week, Month, Kuartal, Semester dan Year. Prioritas menurut jumlah timeframe yang bertemu, lalu jarak; bukan probabilitas harga akan sampai.</p>
  {!result.available?<p className="text-amber-200 text-sm">Data H4 aktif belum tersedia.</p>:!result.groups.length?<div><p className="text-amber-200 text-sm">Data H4 tersedia. Belum ada pasangan level dalam batas selisih yang dipilih; semua level tetap ditampilkan di bawah.</p><div className="h4-unmatched-grid">{candidates.map(c=><article key={c.key}><strong>H4 {levelName(c.key)} · {fmt(c.value)}</strong><span>{c.near?`Terdekat: ${c.near.label} ${levelName(c.near.key)} ${fmt(c.near.value)}`:'Timeframe pembanding belum tersedia'}</span><small>{c.near?`Selisih ${fmt(c.near.delta)} · di luar batas ${tolerance}`:'Menunggu pembanding'}</small></article>)}</div></div>:<details className="h4-attention-details"><summary>Lihat rincian pasangan level & sentuhan</summary><div className="grid grid-cols-1 xl:grid-cols-2 gap-3">{result.groups.map(g=><article key={g.key} className="rounded-xl border border-amber-700/50 bg-slate-900/60 p-4 space-y-2">
   <h3 className="font-bold text-amber-200">H4 {levelName(g.key)} · {fmt(g.value)}</h3>
   <p className="text-xs text-slate-300">{g.count} timeframe bertemu · {g.side==='ABOVE'?'Di atas harga':g.side==='BELOW'?'Di bawah harga':'Di harga sekarang'} · jarak {fmt(g.distance)}</p>
   <p className="text-sm text-cyan-200">{g.toward}</p>
   <ul className="space-y-2">{g.matches.map(m=><li key={m.timeframe+m.level} className="text-xs text-slate-300 border-t border-slate-700 pt-2">{m.label} {levelName(m.level)}: {fmt(m.value)} · {m.exact?'Sama':`Dekat · selisih ${fmt(m.delta)}`}<br/><span className="text-slate-400">{m.status} dalam periode {m.label}</span></li>)}</ul>
  </article>)}</div></details>}
  {!!attentionAreas.length&&<H4AttentionAreas areas={attentionAreas} price={price} decimals={digits}/>}
  <H4MicroIndications columns={matrix?.rsColumns} price={price} tolerance={tolerance} decimals={digits} now={now}/>
  {!!result.missing.length&&<p className="text-xs text-amber-200">Data pembanding belum tersedia/aktif: {result.missing.join(', ')}.</p>}
  <p className="text-xs text-slate-400">Sasaran di atas dan bawah tetap ditampilkan. Arah teramati mengikuti Close H4 terhadap Open H4; bukan ramalan. Sentuhan dihitung per periode pembanding, bukan bukti entry atau TP transaksi. Sumber: {data?.dataSource||'menunggu data'}.</p>
 </section>;
}

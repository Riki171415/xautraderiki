import {h4ConfluencePlan} from '../h4ConfluencePlan.mjs';
import {strongSignals} from '../strongSignal.mjs';
import {levelName} from '../h4LevelMatches.mjs';
export default function TaskTradeAdvice({columns,price,now,tolerance,decimals,stale,data,timeframe,label,markers=[]}) {
 const plan=h4ConfluencePlan(columns,Number(price),{now,tolerance,decimals,stale});
 const valid=!stale&&plan.action!=='WAIT';
 const evaluations=strongSignals(columns,Number(price),{now,tolerance,decimals,stale,cycle:data?.marketCycle});
 const relevant=evaluations.filter(s=>timeframe==='4h'||s.target?.timeframe===timeframe);
 const strong=relevant.filter(s=>s.strong&&plan.action.startsWith(s.side));
 const evidence=[...relevant].sort((a,b)=>b.checks.filter(c=>c.pass).length-a.checks.filter(c=>c.pass).length)[0];
 const side=valid?plan.action.startsWith('BUY')?'BUY':'SELL':'WAIT';
 const fmt=n=>Number.isFinite(n)?n.toFixed(decimals):'—';
 return <section className={`task-trade-advice advice-${side.toLowerCase()}`} aria-label={`Saran BUY SELL dan TP ${label}`}>
  <header><div><span>RENCANA H4 · KONFIRMASI LINTAS TIMEFRAME</span><h4>{valid?plan.action:'MENUNGGU KONFIRMASI'}</h4></div><strong>{strong.length?'SINYAL KUAT · '+strong.map(s=>s.timeframe.toUpperCase()).join(', '):valid?'BERSYARAT · BELUM SINYAL KUAT':'BELUM ADA ENTRY VALID'}</strong></header>
  <div className="task-order-values"><div><span>{valid?`${side} LIMIT · ENTRY`:'ENTRY BUY / SELL'}</span><b>{valid?fmt(plan.entryPrice):'Menunggu'}</b></div>{[1,2,3].map(n=>{const target=valid?plan.areas.find(a=>a.role===`TP${n}`):null;return <div key={n}><span>TP{n} H4</span><b>{target?fmt(target.value):'—'}</b><small>{target?levelName(target.key):'Belum terkonfirmasi'}</small></div>})}<div className="task-order-stop"><span>SL H4</span><b>{valid?fmt(plan.stopLoss):'—'}</b></div></div>
  {strong.some(s=>s.warnings?.length>0)&&<p className="direction-warning">⚠ STRONG disertai konflik: {strong.flatMap(s=>s.warnings.map(w=>`${w.timeframe.toUpperCase()} ${w.flags.join(' / ')}`)).join(' · ')}</p>}
  <p className="task-plan-status">{stale?'WAIT · Data harga belum terverifikasi; sinyal live ditahan.':valid?'Rencana bersyarat · bukan order aktif':plan.reason}</p>
  <details className="task-checklist"><summary>Bukti persyaratan{evidence?` · ${evidence.timeframe.toUpperCase()} ${evidence.side} · ${evidence.checks.filter(c=>c.pass).length}/${evidence.checks.length}`:''}</summary>{evidence?<ul>{evidence.checks.map(c=><li key={c.key}><b>{c.pass?'✓':'○'}</b> {c.label}</li>)}</ul>:<p>Belum ada sasaran TF besar yang memenuhi konteks.</p>}</details>
  <p className="task-observation-legend">✓ Level tersentuh · Entry teramati dan TP setelah entry memerlukan bukti urutan; bukan laporan transaksi.</p>
  <details className="task-advice-explanation"><summary>Alasan & pasangan level {label}</summary><p>{stale?'Harga belum segar. Tunggu pembaruan sebelum membaca saran entry.':valid?'Rencana bersyarat; tunggu reaksi harga dan seluruh unsur konfirmasi. Bukan order aktif.':plan.reason}</p>
  <p className="task-local-markers"><strong>Penanda di {label}: </strong>{markers.length?markers.map(m=>`${m.role} H4 ↔ ${levelName(m.key)} ${fmt(m.value)}`).join(' · '):'Belum ada level timeframe ini yang cocok dengan rencana H4 pada toleransi aktif.'} <span>TP H4 berbeda dari Target {label}.</span></p></details>
</section>;
}

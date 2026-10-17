import {h4MicroMatches,levelName} from '../h4LevelMatches.mjs';
export default function H4MicroIndications({columns,price,tolerance=0,decimals=3,now=Date.now()}) {
 const result=h4MicroMatches(columns,Number(price),{tolerance,decimals,now});
 return <section className="tf-micro-indications"><h3>Indikasi TF kecil → level H4</h3><p>Pencocokan Pivot, R1–R4, S1–S4 dan Open N dengan M1–H1. MENUJU mengikuti gerak Close terhadap Open TF kecil; belum memastikan sasaran tercapai.</p>
 {!result.available?<p>Menunggu H4 aktif.</p>:!result.groups.length?<p>Belum ada level TF kecil yang sama/dekat dengan H4 pada toleransi ini.</p>:<div className="tf-micro-groups">{result.groups.map(g=><article key={g.key}><strong>H4 {levelName(g.key)} · {g.value.toFixed(decimals)}</strong><small>{g.count} TF cocok · {g.towardCount} TF bergerak menuju · jarak {g.distance.toFixed(decimals)}</small>{g.matches.map(m=><div key={m.timeframe+m.level}><b>{m.label} {levelName(m.level)} · {m.value.toFixed(decimals)}</b><span className={m.toward==='MENUJU'?'tf-up':m.toward==='MENJAUH'?'tf-down':''}>{m.direction} · {m.toward}</span><small>Selisih {m.delta.toFixed(decimals)} · {m.touched?'level TF kecil tersentuh':'belum tersentuh'}</small></div>)}</article>)}</div>}
 <small>Hasil ini hanya indikasi. Validasi entry H4 tetap memerlukan kecocokan dengan timeframe besar. {result.missing.length?'TF kecil belum aktif/tersedia: '+result.missing.join(', '):''}</small>
 </section>;
}

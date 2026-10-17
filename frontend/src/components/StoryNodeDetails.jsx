import {levelName} from '../h4LevelMatches.mjs';
export default function StoryNodeDetails({node,decimals=3}) {
 const n=node,fmt=v=>v!=null&&Number.isFinite(v)?v.toFixed(decimals):'—';
 return <div className="story-node-details">
  {!n.available&&<div className="story-detail-notice">Data aktif belum terverifikasi. Angka yang tersedia adalah konteks; arah dan hasil belum disimpulkan.</div>}
  <section><h4>01 · Dasar arah</h4><dl className="story-detail-facts">{n.context.components.map(c=><div key={c.key}><dt>{c.label}</dt><dd><b>{c.direction==='UNAVAILABLE'?'Belum tersedia':c.direction}</b><small>{c.pattern||`${fmt(c.a)} dibanding ${fmt(c.b)}`}</small></dd></div>)}</dl></section>
  <section><h4>02 · Range & batas RVS</h4><dl className="story-detail-facts">{[['Range N',n.range.current],['Range B',n.range.before],['Low B · batas bawah',n.rvs.low],['High B · batas atas',n.rvs.high]].map(([label,value])=><div key={label}><dt>{label}</dt><dd><b>{fmt(value)}</b></dd></div>)}</dl><p className="story-detail-caption">Sentuhan level bukan konfirmasi akhir Busur atau TP transaksi.</p></section>
  {n.references.length>0&&<section><h4>03 · Hubungan tugas</h4><ul>{n.references.map((r,i)=><li key={i}>{r}</li>)}</ul></section>}
  <section><h4>Pasangan level H4</h4>{n.h4pairs.length>0?<ul className="story-detail-pairs">{n.h4pairs.map((p,i)=><li key={i}>{p}</li>)}</ul>:n.microPairs.length>0?<div className="story-detail-table"><table><thead><tr><th>{n.label}</th><th>Patokan H4</th><th>Gerak</th></tr></thead><tbody>{n.microPairs.map(({g,m},i)=><tr key={i}><td>{levelName(m.level)}<b>{fmt(m.value)}</b></td><td>{levelName(g.key)}<b>{fmt(g.value)}</b><small>Selisih {fmt(m.delta)}</small></td><td>{m.toward}</td></tr>)}</tbody></table></div>:<p className="story-detail-caption">Belum ada pasangan H4 pada toleransi aktif.</p>}</section>
  {n.context.flags.length>0&&<section className="story-detail-caution"><h4>Perhatian</h4><ul>{n.context.flags.map(f=><li key={f}>⚠ {f}</li>)}</ul></section>}
  {n.context.scenarios.length>0&&<section><h4>Skenario cadangan · pantauan</h4>{n.context.scenarios.map((s,i)=><article className="story-detail-scenario" key={i}><span>{s.label}</span><strong>{fmt(s.value)}</strong><p>{s.note}</p></article>)}</section>}
  <details className="story-detail-narrative"><summary>Baca narasi lengkap</summary>{n.text.split(/(?<=\.)\s+(?=[A-Z])/).map((part,i)=><p key={i}>{part}</p>)}</details>
 </div>;
}

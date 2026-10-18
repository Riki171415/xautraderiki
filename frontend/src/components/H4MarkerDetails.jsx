import {confluenceCell} from '../h4ConfluencePlan.mjs';
import {levelName} from '../h4LevelMatches.mjs';
const LEVELS=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
export default function H4MarkerDetails({plan,columns=[],timeframe,level,decimals=3,stale=false}) {
 const column=columns.find(c=>c.timeframe===timeframe),h4=columns.find(c=>c.timeframe==='4h');
 const fmt=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v).toFixed(decimals):'—';
 const badges=(c,key)=>c?confluenceCell(plan,c,key):[];
 const entry=(c,key)=>{
  const markers=badges(c,key),stop=plan.action!=='WAIT'&&c?.timeframe==='4h'&&key===plan.stopKey;
  return <article key={key} className="h4-marker-row"><header><strong>{levelName(key)}</strong><b>{fmt(c?.[key])}</b></header>
   {stop&&<p className="h4-marker-role">SL H4 · {fmt(plan.stopLoss)}</p>}
   {markers.map((b,i)=><div className="h4-marker-pair" key={b.anchorKey+b.role+i}><strong>{b.role}{b.observerOnly?' · pengamatan TF kecil':''}</strong><span>H4 {levelName(b.anchorKey)} <b>{fmt(b.anchor)}</b></span><small>Selisih harga {fmt(b.delta)}{stale?' · snapshot; rencana aktif ditahan':''}</small></div>)}
   {!markers.length&&!stop&&<p className="h4-marker-empty">{fmt(c?.[key])==='—'?'Harga level belum tersedia.':'Belum ada penanda rencana atau area H4 yang cocok pada level ini.'}</p>}
  </article>;
 };
 return <section className="matrix-all-markers h4-marker-details"><header><h3>Seluruh penanda H4</h3><span>{plan.action==='WAIT'?'WAIT · belum ada order valid':plan.action+' · bersyarat'}</span></header>
  <p className="h4-marker-reason">{plan.reason||'Penanda mengikuti rencana H4 bersama.'}</p>
  {column?<><h4>Level pilihan · {column.label||timeframe}</h4>{level?entry(column,level):<p>Pilih level untuk menyorot rincian.</p>}
   <details open={!level}><summary>Semua level pada {column.label||timeframe} · R4–S4</summary>{LEVELS.map(key=>entry(column,key))}</details></>:<p>Data timeframe pilihan belum tersedia; tidak memakai harga dari timeframe lain.</p>}
  <details><summary>Acuan harga H4 lengkap · R4–S4</summary>{h4?LEVELS.map(key=>entry(h4,key)):<p>Data H4 belum tersedia.</p>}</details>
  <p className="h4-marker-note">Level rumus tetap ditampilkan saat WAIT. BUY/SELL, TP dan SL hanya muncul jika rencana valid. Tidak adanya pasangan bukan berarti harga sumber dihapus. Sentuhan level bukan bukti transaksi.</p>
 </section>;
}

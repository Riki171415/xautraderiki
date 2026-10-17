import H4AttentionAreas from './H4AttentionAreas';
import H4DirectionStrip from './H4DirectionStrip';
import {instrumentTolerance} from '../instrumentTolerance.mjs';
import SourceHSHBar from './SourceHSHBar';
import {useH4Plan} from '../hooks/useH4Plan';
import TableMarketWarnings from './TableMarketWarnings';
import {useLiveMatrix} from '../hooks/useLiveMatrix';
import {useState,useEffect,useRef} from 'react';
import {Maximize,Minimize,ChevronLeft,ChevronRight,ArrowLeft} from 'lucide-react';
import {h4ConfluencePlan,confluenceCell} from '../h4ConfluencePlan.mjs';
import {microH4Guide,MICRO_TIMEFRAMES} from '../microH4Guide.mjs';
import {levelName} from '../h4LevelMatches.mjs';
import {projectMatrix,activeSessionAt} from '../liveMatrix.mjs';
const TIMEFRAMES=[['1m','M1'],['5m','M5'],['15m','M15'],['30m','M30'],['1h','H1'],['4h','H4'],['market','MARKET'],['1d','DAILY'],['1w','WEEK'],['1M','MONTH'],['3M','QUARTER'],['6M','SEMESTER'],['1Y','YEAR']];
const shortLabel=c=>({ '1m':'M1','5m':'M5','15m':'M15','30m':'M30','1h':'H1','4h':'H4','market':'MARKET','1d':'DAILY','1w':'WEEK','1M':'MONTH','3M':'QUARTER','6M':'SEMESTER','1Y':'YEAR' }[c.timeframe]||c.label);
const LEVELS=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
export default function MatrixSlideshow({data,liveTick,focusedTf,onBack,tolerance=0,onTolerance,dailyTarget='AUTO',onDailyTarget,broker,onBrokerChange,markerExpanded=false,onMarkerExpanded,onOpenAnalysis}) {
 const [infoTab,setInfoTab]=useState('daily');
 const [showMissing,setShowMissing]=useState(true),[page,setPage]=useState(0),[size,setSize]=useState(0),[full,setFull]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(Date.now);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);const fs=()=>setFull(!!document.fullscreenElement);document.addEventListener('fullscreenchange',fs);return()=>{clearInterval(timer);document.removeEventListener('fullscreenchange',fs);};},[]);
 const matrix=useLiveMatrix(data,liveTick,now);
 const actual=matrix?.rsColumns||[];
 const allColumns=TIMEFRAMES.map(([timeframe,label])=>actual.find(c=>c.timeframe===timeframe)||{timeframe,label,unavailable:true});
 const missing=allColumns.filter(c=>c.unavailable);
 const columns=showMissing?allColumns:allColumns.filter(c=>!c.unavailable);
 const pageSize=Math.max(columns.length,1);
 const count=Math.max(1,Math.ceil(columns.length/pageSize)),current=Math.min(page,count-1);
 useEffect(()=>{const key=e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();setPage(p=>Math.min(p+1,count-1));}if(e.key==='ArrowLeft'){e.preventDefault();setPage(p=>Math.max(0,p-1));}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[count]);
 async function toggle(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else setError('Browser belum mendukung layar penuh; matriks tetap menyesuaikan layar.');}catch{setError('Layar penuh tidak diizinkan browser; matriks tetap menyesuaikan layar.');}}
 async function back(){if(document.fullscreenElement)try{await document.exitFullscreen();}catch{}onBack();}
 const visible=columns.slice(current*pageSize,(current+1)*pageSize);
 const price=liveTick?.bid??Number(matrix?.currentPrice);
 const confluence=useH4Plan(data,liveTick,tolerance,now).plan;
 const digits=data?.decimals??3,fmt=v=>Number.isFinite(Number(v))&&v!=null?Number(v).toFixed(digits):'—';
 return <section className="matrix-slideshow rs-presentation" aria-label="Presentasi matriks Support dan Resistance">
  <header className="matrix-slide-header"><button className="chart-toggle" onClick={back} aria-label="Kembali ke tabel"><ArrowLeft size={17}/><span>Tabel</span></button><div><p className="workspace-eyebrow">SUPPORT & RESISTANCE · {columns.length} TIMEFRAME</p><h1>{data?.symbol||'—'} <small>{data?.broker?.name||'Menunggu data'} · {activeSessionAt(now)}</small></h1></div><button className="chart-toggle" onClick={toggle}>{full?<Minimize size={17}/>:<Maximize size={17}/>}<span>{full?'Keluar layar penuh':'Layar penuh'}</span></button></header>
  <div className="rs-presentation-tools"><strong>{data?.symbol||'—'} · {fmt(price)}</strong><label>Selisih H4 <select aria-label="Toleransi pertemuan H4" value={tolerance} onChange={e=>onTolerance?.(Number(e.target.value))}>{instrumentTolerance(data?.symbol).values.map(v=><option key={v} value={v}>{v===0?'Sama persis':`≤ ${v}`}</option>)}</select></label></div>
  <SourceHSHBar data={data} broker={broker} onBrokerChange={onBrokerChange} now={now}/><H4DirectionStrip data={data} liveTick={liveTick} tolerance={tolerance} now={now} expanded={markerExpanded} onExpanded={onMarkerExpanded}/>
  {missing.length>0&&<div className="rs-missing-summary rs-missing-inline"><span><b>{actual.length} timeframe tersedia</b> · {missing.map(c=>c.label).join(', ')} menunggu riwayat</span><button className="chart-toggle" onClick={()=>{setShowMissing(v=>!v);setPage(0);}}>{showMissing?'Sembunyikan kolom kosong':'Lihat kolom belum tersedia'}</button><details><summary>Mengapa?</summary><p>Kolom yang ditandai belum mempunyai candle periode aktif atau riwayat pembanding lengkap. Saat pasar tutup, candle terakhir tidak dianggap sebagai sesi aktif. Riwayat akan ditampilkan setelah diterima dan lolos validasi dari sumber aktif.</p></details></div>}

  {error&&<p role="status" className="text-xs text-amber-200">{error}</p>}
  <div className="rs-presentation-scroll rs-fit-viewport" role="region" aria-label="Seluruh timeframe dan level R4 sampai S4 dalam satu layar"><table className="rs-presentation-table" style={{width:"100%",height:"100%","--tf-count":visible.length}}><colgroup><col style={{width:58}}/>{visible.map(c=><col key={c.timeframe}/>)}</colgroup><thead><tr><th>LEVEL</th>{visible.map(c=>{const micro=microH4Guide(c,columns,price,{tolerance,decimals:digits,now});const matchCount=confluence.comparison.groups.filter(g=>c.timeframe==='4h'||g.matches.some(m=>m.timeframe===c.timeframe)).length;return <th key={c.timeframe} className={c.timeframe===focusedTf?'rs-column-focus':''}><strong className="rs-tf-title" title={c.label}>{shortLabel(c)}</strong><small className={c.unavailable?'rs-jika rs-jika-missing':Number(c.openN)>Number(c.openB)?'rs-jika rs-jika-up':Number(c.openN)<Number(c.openB)?'rs-jika rs-jika-down':'rs-jika'} title={`Open N ${fmt(c.openN)} · Open B ${fmt(c.openB)}`}>{c.unavailable||c.openN==null||c.openB==null?'JIKA: belum tersedia':Number(c.openN)>Number(c.openB)?'JIKA ↑ BUY':Number(c.openN)<Number(c.openB)?'JIKA ↓ SELL':'JIKA = · NETRAL'}</small><small className="rs-open-values" title={`Open N ${fmt(c.openN)} · Open B ${fmt(c.openB)}`}><span>ON <b>{fmt(c.openN)}</b></span><span>OB <b>{fmt(c.openB)}</b></span></small><small title={micro?.reason}>{c.unavailable?'Data belum tersedia':micro?`PENANDA ${micro.direction==='UP'?'↑':micro.direction==='DOWN'?'↓':'·'} H4`:c.timeframe==='4h'?'ACUAN H4':matchCount?`${matchCount} level ekuivalen`:'Belum ekuivalen'}</small></th>;})}</tr></thead><tbody>{LEVELS.map(key=><tr key={key} className={key==='pivot'?'rs-pivot-row':key.startsWith('res')?'rs-res-row':'rs-sup-row'}><th>{key==='pivot'?'PIVOT':key.replace('res','R').replace('sup','S')}</th>{visible.map(c=>{const micro=microH4Guide(c,columns,price,{tolerance,decimals:digits,now}),badges=confluenceCell(confluence,c,key),v=c.unavailable?NaN:Number(c[key]);const touched=c.touchedLevels?.[key]===true;const closest=!c.unavailable&&LEVELS.reduce((best,k)=>Math.abs(Number(c[k])-price)<Math.abs(Number(c[best])-price)?k:best,LEVELS[0])===key;return <td key={c.timeframe} data-timeframe={c.timeframe} data-level={key} className={`${closest?'rs-nearest':''} ${badges.length?'rs-confluence-cell':''} ${c.unavailable?'rs-unavailable':''} ${touched?'rs-level-hit':''}`} title={`${c.label} ${key}: ${fmt(v)} · ${touched?'tersentuh':'belum tersentuh'} · ${badges.map(b=>`${b.role} dari H4 ${levelName(b.anchorKey)} ${fmt(b.anchor)}, selisih ${fmt(b.delta)}`).join('; ')}`}><div className="rs-cell-price">{!c.unavailable&&<i className={`rs-dot ${touched?'rs-dot-hit':''}`} aria-label={touched?'Tersentuh':'Belum tersentuh'}/>}<strong>{fmt(v)}</strong></div><div className="rs-cell-plan">{!c.unavailable&&<span className={`rs-touch-label ${touched?'rs-touch-hit':''}`}>{touched?`✓ ${levelName(key)} KENA`:'· BELUM'}</span>}{micro&&closest&&<span className="rs-label rs-label-guide" title={micro.reason}>{micro.target!=null?`${micro.direction==='UP'?'↑':'↓'} H4`:'PANTAU H4'}</span>}{badges.map(b=><span key={b.role} className={`rs-label ${b.role.startsWith('TP')?'rs-label-tp':b.role.startsWith('BUY')?'rs-label-buy':b.role==='AREA H4'?'rs-label-area':'rs-label-sell'}`} title={`Acuan H4 ${levelName(b.anchorKey)} ${fmt(b.anchor)} · selisih ${fmt(b.delta)}`}>{b.role==='AREA H4'?'AREA H4':b.role}{b.role!=='AREA H4'&&c.timeframe!=='4h'?' · H4':''}</span>)}{confluence.action!=='WAIT'&&c.timeframe==='4h'&&key===confluence.stopKey&&<span className="rs-label rs-label-sl">SL · H4</span>}</div></td>;})}</tr>)}</tbody></table>{!columns.length&&<p className="p-5 text-sm text-slate-400">Menunggu data matriks dari sumber aktif.</p>}</div>
  <section className={`rs-info-dock rs-info-${infoTab}`} aria-label="Informasi pendamping matriks"><nav aria-label="Informasi tabel">{[['daily','Tugas Daily'],['habit','Kebiasaan Market'],['plan','Trading Plan'],['legend','Legenda Warna']].map(([id,label])=><button key={id} aria-pressed={infoTab===id} onClick={()=>setInfoTab(id)}>{label}</button>)}<span>{data?.marketDataStatus==='STALE_QUOTE'?'◷ Harga terakhir · belum live':'● Sumber aktif'}</span></nav>
  <div className="rs-info-body">
  <TableMarketWarnings data={data} columns={columns} price={price} now={now} target={dailyTarget} onTarget={onDailyTarget} onOpenAnalysis={onOpenAnalysis}/>
  <div className="rs-bottom-panels">
  <div className="rs-color-legend" aria-label="Keterangan warna matriks"><h2>PALET WARNA <small>Panduan membaca matriks</small></h2>
   <span><i className="rs-legend-swatch rs-legend-hit"/><b>Hijau</b> ✓ level tersentuh</span>
   <span><i className="rs-legend-swatch rs-legend-nearest"/><b>Emas</b> level terdekat harga</span>
   <span><i className="rs-legend-swatch rs-legend-match"/><b>Cyan</b> level ekuivalen H4 / rencana TP</span>
   <span><i className="rs-legend-swatch rs-legend-buy"/><b>Label hijau</b> bias BUY / entry BUY</span>
   <span><i className="rs-legend-swatch rs-legend-sell"/><b>Label merah</b> bias SELL / entry SELL / SL</span>
   <span><i className="rs-legend-swatch rs-legend-guide"/><b>Ungu</b> penanda TF kecil menuju H4</span>
   <span><i className="rs-legend-swatch rs-legend-muted"/><b>Abu-abu</b> belum tersentuh / data belum tersedia</span>
   <small>Warna angka: jingga = R, merah muda = S, krem = Pivot. Label BUY/SELL/TP/SL adalah rencana; sentuhan level TP belum membuktikan TP tercapai sebelum entry dan urutannya terkonfirmasi.</small>
  </div>
  <div className="rs-h4-plan rs-plan-cards" role="status">{confluence.action==='WAIT'?confluence.attentionAreas?.length?<H4AttentionAreas areas={confluence.attentionAreas} price={Number(price)} decimals={digits} compact/>:<div className="rs-plan-empty"><strong>MENUNGGU KONFIRMASI H4</strong><p>{confluence.reason}</p></div>:<><header><strong>{confluence.action} · H4</strong><small>Rencana bersyarat · TP dinilai setelah entry</small></header><div className="rs-ticket-grid">{[{role:confluence.action,value:confluence.entryPrice},...confluence.areas.filter(a=>a.role.startsWith('TP')),{role:'SL',value:confluence.stopLoss}].map(a=><article key={a.role} className={a.role==='SL'?'is-stop':a.role.startsWith('TP')?'is-target':'is-entry'}><small>{a.role}</small><strong>{fmt(a.value)}</strong></article>)}</div></> }</div>
  </div>
  </div></section>
  <footer className="matrix-slide-footer"><span>{actual.length}/{allColumns.length} timeframe · seluruh level R4–S4<small>✓ Hijau = level tersentuh · emas = terdekat · TP sah hanya setelah entry dan urutannya terkonfirmasi{data?.marketDataStatus==='STALE_QUOTE'?' · harga terakhir':''}</small></span><span className="rs-fit-caption">SATU LAYAR · OTOMATIS</span></footer>
 </section>;
}

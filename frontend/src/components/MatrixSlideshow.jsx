import {TASK_FRAMES} from '../timeframeTask.mjs';
import {quoteIsStale} from '../analysisState.mjs';
import DailyRangeEstimate from './DailyRangeEstimate';
import DirectionContext from './DirectionContext';
import {directionContext} from '../directionContext.mjs';
import {strongSignals} from '../strongSignal.mjs';
import MatrixDetailPanel from './MatrixDetailPanel';
import TaskTradeAdvice from './TaskTradeAdvice';
import {dailyLevelStrength} from '../rvsLimit.mjs';
import TimeframeTasks from './TimeframeTasks';
import TwoWayH4Plan from './TwoWayH4Plan';
import TimeframeRangePopup from './TimeframeRangePopup';
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
  const [panel,setPanel]=useState(null);
 const [taskFrame,setTaskFrame]=useState('1d');
 const viewportRef=useRef(null);
 const [rowHeight,setRowHeight]=useState(40);
 useEffect(()=>{
  const element=viewportRef.current;if(!element)return;
  const update=()=>{const next=Math.max(12,(element.clientHeight-82)/9);setRowHeight(old=>Math.abs(old-next)<.5?old:next);};
  const observer=new ResizeObserver(update);observer.observe(element);update();return()=>observer.disconnect();
 },[]);

 const [rangeSelection,setRangeSelection]=useState(null);
 const rangeScope=`${data?.broker?.id}|${data?.symbol}`;
 useEffect(()=>{setPanel(null);setRangeSelection(null);},[rangeScope]);
 const selectedRange=rangeSelection?.scope===rangeScope?rangeSelection:null;
 const openRange=(tf,level)=>{setRangeSelection({tf,level,scope:rangeScope});setPanel({kind:'level',scope:rangeScope});};
 const openPanel=kind=>setPanel({kind,scope:rangeScope});
 const closePanel=()=>setPanel(null);
 const [showMissing,setShowMissing]=useState(true),[page,setPage]=useState(0),[size,setSize]=useState(0),[full,setFull]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(Date.now);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);const fs=()=>setFull(!!document.fullscreenElement);document.addEventListener('fullscreenchange',fs);return()=>{clearInterval(timer);document.removeEventListener('fullscreenchange',fs);};},[]);
 const matrix=useLiveMatrix(data,liveTick,now);
 const actual=matrix?.rsColumns||[];
 const allColumns=TIMEFRAMES.map(([timeframe,label])=>actual.find(c=>c.timeframe===timeframe)||{timeframe,label,unavailable:true});
 const missing=allColumns.filter(c=>c.unavailable);
 const columns=showMissing?allColumns:allColumns.filter(c=>!c.unavailable);
 const pageSize=Math.max(columns.length,1);
 const count=Math.max(1,Math.ceil(columns.length/pageSize)),current=Math.min(page,count-1);
 useEffect(()=>{const key=e=>{if(e.target?.closest?.('dialog')||['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();setPage(p=>Math.min(p+1,count-1));}if(e.key==='ArrowLeft'){e.preventDefault();setPage(p=>Math.max(0,p-1));}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[count]);
 async function toggle(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else setError('Browser belum mendukung layar penuh; matriks tetap menyesuaikan layar.');}catch{setError('Layar penuh tidak diizinkan browser; matriks tetap menyesuaikan layar.');}}
 async function back(){if(document.fullscreenElement)try{await document.exitFullscreen();}catch{}onBack();}
 const visible=columns.slice(current*pageSize,(current+1)*pageSize);
 const price=Number(matrix?.currentPrice);
 const confluence=useH4Plan(data,liveTick,tolerance,now).plan;
 const entrySignals=strongSignals(columns,Number(price),{now,tolerance,decimals:data?.decimals??3,cycle:data?.marketCycle,stale:quoteIsStale(data,now)}).filter(signal=>signal.strong);
 const readings=new Map(columns.map(c=>[c.timeframe,directionContext(columns,c.timeframe,{now,tolerance,decimals:data?.decimals??3,stale:quoteIsStale(data,now)})]));
 const digits=data?.decimals??3,fmt=v=>Number.isFinite(Number(v))&&v!=null?Number(v).toFixed(digits):'—';
 return <section className="matrix-slideshow rs-presentation" aria-label="Presentasi matriks Support dan Resistance">
  <header className="matrix-slide-header"><button className="chart-toggle" onClick={back} aria-label="Kembali ke tabel"><ArrowLeft size={17}/><span>Tabel</span></button><div><p className="workspace-eyebrow">SUPPORT & RESISTANCE · {columns.length} TIMEFRAME</p><h1>{data?.symbol||'—'} <small>{data?.broker?.name||'Menunggu data'} · {activeSessionAt(now)}</small></h1></div><button className="chart-toggle" onClick={toggle}>{full?<Minimize size={17}/>:<Maximize size={17}/>}<span>{full?'Keluar layar penuh':'Layar penuh'}</span></button></header>
  <div className="rs-presentation-tools"><strong>{data?.symbol||'—'} · {fmt(price)}</strong><label>Selisih H4 <select aria-label="Toleransi pertemuan H4" value={tolerance} onChange={e=>onTolerance?.(Number(e.target.value))}>{instrumentTolerance(data?.symbol).values.map(v=><option key={v} value={v}>{v===0?'Sama persis':`≤ ${v}`}</option>)}</select></label></div>
  <SourceHSHBar data={data} broker={broker} onBrokerChange={onBrokerChange} now={now}/><H4DirectionStrip data={data} liveTick={liveTick} tolerance={tolerance} now={now} expanded={false} onExpanded={()=>openPanel('h4')}/>
  {missing.length>0&&<div className="rs-missing-summary rs-missing-inline"><span><b>{actual.length} timeframe tersedia</b> · {missing.map(c=>c.label).join(', ')} menunggu riwayat</span><button className="chart-toggle" onClick={()=>{setShowMissing(v=>!v);setPage(0);}}>{showMissing?'Sembunyikan kolom kosong':'Lihat kolom belum tersedia'}</button><details><summary>Mengapa?</summary><p>Kolom yang ditandai belum mempunyai candle periode aktif atau riwayat pembanding lengkap. Saat pasar tutup, candle terakhir tidak dianggap sebagai sesi aktif. Riwayat akan ditampilkan setelah diterima dan lolos validasi dari sumber aktif.</p></details></div>}

  {error&&<p role="status" className="text-xs text-amber-200">{error}</p>}
  <div ref={viewportRef} style={{"--rs-row-height":`${rowHeight}px`}} className="rs-presentation-scroll rs-fit-viewport" role="region" aria-label="Seluruh timeframe dan level R4 sampai S4 dalam satu layar"><table className="rs-presentation-table" style={{width:"100%",height:"100%","--tf-count":visible.length}}><colgroup><col style={{width:58}}/>{visible.map(c=><col key={c.timeframe}/>)}</colgroup><thead><tr><th>LEVEL</th>{visible.map(c=>{const micro=microH4Guide(c,columns,price,{tolerance,decimals:digits,now});const matchCount=confluence.comparison.groups.filter(g=>c.timeframe==='4h'||g.matches.some(m=>m.timeframe===c.timeframe)).length;return <th key={c.timeframe} onClick={()=>openRange(c.timeframe)} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openRange(c.timeframe);}}} aria-label={`Detail ${shortLabel(c)} High Low N B`} className={c.timeframe===focusedTf?'rs-column-focus':''}><strong className="rs-tf-title" title={c.label}>{shortLabel(c)}</strong><small className={c.unavailable?'rs-jika rs-jika-missing':Number(c.openN)>Number(c.openB)?'rs-jika rs-jika-up':Number(c.openN)<Number(c.openB)?'rs-jika rs-jika-down':'rs-jika'} title={`Open N ${fmt(c.openN)} · Open B ${fmt(c.openB)}`}>{c.unavailable||c.openN==null||c.openB==null?'JIKA: belum tersedia':Number(c.openN)>Number(c.openB)?'JIKA ↑ BUY':Number(c.openN)<Number(c.openB)?'JIKA ↓ SELL':'JIKA = · NETRAL'}</small><small className="rs-open-values" title={`Open N ${fmt(c.openN)} · Open B ${fmt(c.openB)}`}><span>ON <b>{fmt(c.openN)}</b></span><span>OB <b>{fmt(c.openB)}</b></span></small><small title={micro?.reason}>{c.unavailable?'Data belum tersedia':micro?`PENANDA ${micro.direction==='UP'?'↑':micro.direction==='DOWN'?'↓':'·'} H4`:c.timeframe==='4h'?'ACUAN H4':matchCount?`${matchCount} level ekuivalen`:'Belum ekuivalen'}</small></th>;})}</tr></thead><tbody>{LEVELS.map(key=><tr key={key} className={key==='pivot'?'rs-pivot-row':key.startsWith('res')?'rs-res-row':'rs-sup-row'}><th>{key==='pivot'?'PIVOT':key.replace('res','R').replace('sup','S')}</th>{visible.map(c=>{const micro=microH4Guide(c,columns,price,{tolerance,decimals:digits,now}),badges=confluenceCell(confluence,c,key).sort((a,b)=>a.delta-b.delta||LEVELS.indexOf(a.anchorKey)-LEVELS.indexOf(b.anchorKey)),v=c.unavailable?NaN:Number(c[key]);const strength=c.timeframe==='1d'?dailyLevelStrength(columns,key,{now,price,decimals:digits,stale:quoteIsStale(data,now)}):null;const touched=c.touchedLevels?.[key]===true;const closest=!c.unavailable&&LEVELS.reduce((best,k)=>Math.abs(Number(c[k])-price)<Math.abs(Number(c[best])-price)?k:best,LEVELS[0])===key;return <td key={c.timeframe} data-timeframe={c.timeframe} data-level={key} tabIndex={0} onClick={()=>openRange(c.timeframe,key)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openRange(c.timeframe,key);}}} aria-label={`${shortLabel(c)} ${levelName(key)} · buka High Low N B`} className={`${closest?'rs-nearest':''} ${badges.length?'rs-confluence-cell':''} ${c.unavailable?'rs-unavailable':''} ${touched?'rs-level-hit':''}`} title={`${c.label} ${key}: ${fmt(v)} · ${touched?'tersentuh':'belum tersentuh'} · ${badges.map(b=>`${b.role} dari H4 ${levelName(b.anchorKey)} ${fmt(b.anchor)}, selisih ${fmt(b.delta)}`).join('; ')}`}><div className="rs-cell-price">{!c.unavailable&&<span className={`rs-hit-symbol ${touched?'is-hit':''}`} aria-label={touched?'Tersentuh':'Belum tersentuh'}>{touched?'✓':'·'}</span>}<strong>{fmt(v)}</strong></div><div className="rs-cell-plan">{(()=>{const labels=[];const reading=readings.get(c.timeframe);for(const signal of entrySignals.filter(signal=>signal.timeframe===c.timeframe&&badges.some(b=>b.anchorKey===signal.target?.h4Key)))labels.push({text:`STRONG ${signal.side}${signal.warnings?.length?' ⚠':''}`,kind:signal.side==='BUY'?'buy':'sell'});if(key==='pivot')for(const flag of [...reading.flags,...(reading.scenarios.length?['CADANGAN']:[])])labels.push({text:flag,kind:'warning'});if(strength?.contextSupport||strength?.contextResistance)labels.push({text:strength.support?'SUP KUAT':strength.resistance?'RES KUAT':strength.role==='AT'?'DI AREA':strength.role==='RESISTANCE'?'CALON RES':strength.role==='SUPPORT'?'CALON SUP':'TUNGGU HARGA',kind:'strength'});if(confluence.action!=='WAIT'&&c.timeframe==='4h'&&key===confluence.stopKey)labels.push({text:'SL',kind:'sl'});for(const b of badges)labels.push({text:(b.observerOnly?'↗ ':'')+(b.role==='BUY LIMIT'?'BUY':b.role==='SELL LIMIT'?'SELL':b.role==='AREA H4'?'AREA H4':b.role),kind:b.role.startsWith('TP')?'tp':b.role.startsWith('BUY')?'buy':b.role==='AREA H4'?'area':'sell'});if(micro&&closest)labels.push({text:`${micro.direction==='UP'?'↑':micro.direction==='DOWN'?'↓':'·'} H4`,kind:'guide'});return <>{labels.slice(0,2).map((l,i)=><span className={`rs-label rs-label-${l.kind}`} key={i}>{l.text}</span>)}{labels.length>2&&<span className="rs-label rs-label-more" aria-label={`${labels.length-2} penanda tambahan · buka rincian`}>+{labels.length-2}</span>}</>})()}</div></td>;})}</tr>)}</tbody></table>{!columns.length&&<p className="p-5 text-sm text-slate-400">Menunggu data matriks dari sumber aktif.</p>}</div>
  <nav className="matrix-detail-actions" aria-label="Rincian matriks"><button onClick={()=>openPanel('plan')}>Trading Plan</button><button onClick={()=>openPanel('tasks')}>Tugas TF</button><button onClick={()=>openPanel('habit')}>Peringatan</button><button onClick={()=>openPanel('legend')}>Panduan Warna</button><span>{data?.marketDataStatus==='STALE_QUOTE'?'◷ DATA LAMA':'● Sumber aktif'}</span></nav>
  <footer className="matrix-slide-footer"><span>{actual.length}/{allColumns.length} timeframe · seluruh level R4–S4</span><span className="rs-fit-caption">SATU LAYAR · OTOMATIS</span></footer>
 {panel?.scope===rangeScope&&<MatrixDetailPanel title={{level:'Rincian level',plan:'Trading Plan',tasks:'Tugas Timeframe',habit:'Peringatan',legend:'Panduan Warna',h4:'Penanda H4'}[panel.kind]} onClose={closePanel}>
 {panel.kind==='level'&&selectedRange&&<><TimeframeRangePopup embedded price={price} columns={columns} now={now} stale={quoteIsStale(data,now)} column={allColumns.find(c=>c.timeframe===selectedRange.tf)} row={matrix?.tableRows?.find(r=>r.timeframe===selectedRange.tf)} symbol={data?.symbol} source={data?.dataSource||data?.broker?.name} decimals={digits} level={selectedRange.level} onClose={closePanel}/><DirectionContext columns={columns} timeframe={selectedRange.tf} level={selectedRange.level} now={now} tolerance={tolerance} decimals={digits} stale={quoteIsStale(data,now)}/><section className="matrix-all-markers">{confluence.action!=='WAIT'&&selectedRange.tf==='4h'&&selectedRange.level===confluence.stopKey&&<p>SL H4 · {fmt(confluence.stopLoss)}</p>}<h3>Seluruh penanda H4</h3>{(selectedRange.level?[selectedRange.level]:LEVELS).map(key=><div key={key}><strong>{levelName(key)}</strong>{confluenceCell(confluence,allColumns.find(c=>c.timeframe===selectedRange.tf),key).map((b,i)=><p key={i}>{b.role} · H4 {levelName(b.anchorKey)} {fmt(b.anchor)} · selisih {fmt(b.delta)}{b.observerOnly?' · pengamatan arah':''}</p>)}</div>)}{selectedRange.level&&<p>{allColumns.find(c=>c.timeframe===selectedRange.tf)?.touchedLevels?.[selectedRange.level]?'✓ Level tersentuh':'○ Belum tersentuh'}</p>}</section></>}
 {panel.kind==='plan'&&<><DailyRangeEstimate columns={columns} data={data} now={now} decimals={digits}/><TaskTradeAdvice columns={columns} price={price} now={now} tolerance={tolerance} decimals={digits} stale={quoteIsStale(data,now)} data={data} timeframe="4h" label="H4"/><details><summary>Analisis dua arah & seluruh syarat</summary><TwoWayH4Plan columns={columns} price={price} now={now} tolerance={tolerance} decimals={digits} data={data}/></details></>}
 {panel.kind==='tasks'&&<><label className="matrix-task-picker">Timeframe <select value={taskFrame} onChange={e=>setTaskFrame(e.target.value)}>{TASK_FRAMES.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><TimeframeTasks timeframe={taskFrame} columns={columns} price={price} now={now} tolerance={tolerance} decimals={digits} data={data} dailyTarget={dailyTarget} onDailyTarget={onDailyTarget}/></>}
 {panel.kind==='habit'&&<TableMarketWarnings data={data} columns={columns} price={price} now={now} target={dailyTarget} onTarget={onDailyTarget} onOpenAnalysis={onOpenAnalysis}/>}
 {panel.kind==='h4'&&<H4DirectionStrip data={data} liveTick={liveTick} tolerance={tolerance} now={now} expanded onExpanded={closePanel}/>}
 {panel.kind==='legend'&&<>  <div className="rs-color-legend" aria-label="Keterangan warna matriks"><h2>PALET WARNA <small>Panduan membaca matriks</small></h2>
   <span><i className="rs-legend-swatch rs-legend-hit"/><b>Hijau</b> ✓ level tersentuh</span>
   <span><i className="rs-legend-swatch rs-legend-nearest"/><b>Emas</b> level terdekat harga</span>
   <span><i className="rs-legend-swatch rs-legend-match"/><b>Cyan</b> level ekuivalen H4 / rencana TP</span>
   <span><i className="rs-legend-swatch rs-legend-buy"/><b>Label hijau</b> bias BUY / entry BUY</span>
   <span><i className="rs-legend-swatch rs-legend-sell"/><b>Label merah</b> bias SELL / entry SELL / SL</span>
   <span><i className="rs-legend-swatch rs-legend-guide"/><b>Ungu</b> penanda TF kecil menuju H4</span><span><b>SUP/RES KUAT</b> kekuatan relatif level Daily, bukan sinyal entry</span><span><b>STRONG BUY/SELL</b> sinyal TF kecil M1–H1 setelah seluruh konfirmasi terpenuhi</span>
   <span><i className="rs-legend-swatch rs-legend-muted"/><b>Abu-abu</b> belum tersentuh / data belum tersedia</span>
   <small>Warna angka: jingga = R, merah muda = S, krem = Pivot. Label BUY/SELL/TP/SL adalah rencana; sentuhan level TP belum membuktikan TP tercapai sebelum entry dan urutannya terkonfirmasi.</small>
  </div>
</>}
 </MatrixDetailPanel>}

 </section>;
}

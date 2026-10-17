import {instrumentTolerance} from '../instrumentTolerance.mjs';
import TableMarketWarnings from './TableMarketWarnings';
import {h4ConfluencePlan,confluenceCell} from '../h4ConfluencePlan.mjs';
import {useState,useEffect} from 'react';
import {terminalAnalysis} from '../terminalAnalysis.mjs';
import TerminalAnalysisDetails from './TerminalAnalysisDetails';
import {matrixPlan,planBadges} from '../matrixPlan.mjs';
const LEVELS=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
const name=k=>k==='pivot'?'PIVOT':k.replace('res','R').replace('sup','S');
export default function TimeframeTerminal({data,rows,columns,price,decimals,tolerance,now,focusedTf,onTolerance,initialSection='summary',dailyTarget='AUTO',onDailyTarget,terminalSection,onTerminalSection,onTerminalSelect,onOpenAnalysis}) {
 const [localSelected,setLocalSelected]=useState(focusedTf||'4h');
 const selected=onTerminalSelect?(focusedTf||'4h'):localSelected,setSelected=onTerminalSelect??setLocalSelected;
 const [localSection,setLocalSection]=useState(initialSection);
 const section=terminalSection??localSection,setSection=onTerminalSection??setLocalSection;
 useEffect(()=>{if(focusedTf)setSelected(focusedTf);},[focusedTf]);
 const row=rows.find(r=>r.timeframe===selected);
 const column=columns.find(c=>c.timeframe===selected);
 const fmt=v=>v!=null&&Number.isFinite(Number(v))?Number(v).toFixed(decimals):'—';
 const model=terminalAnalysis({data,rows,columns,selected,price,tolerance,now,decimals});
 const plan=model.plan;
 const weeklyModel=terminalAnalysis({data,rows,columns,selected:'1w',price,tolerance,now,decimals});
 const nearest=column?LEVELS.filter(k=>Number.isFinite(Number(column[k]))).reduce((best,k)=>best==null||Math.abs(Number(column[k])-Number(price))<Math.abs(Number(column[best])-Number(price))?k:best,null):null;
 const anchorPlan=h4ConfluencePlan(columns,Number(price),{tolerance,decimals,now});
 const levelRoles=k=>plan.observerOnly||!activePlan(plan)?confluenceCell(anchorPlan,column||{},k).map(m=>m.role):planBadges(plan,k);
 const activePlan=p=>['BUY LIMIT','SELL LIMIT'].includes(p.action);
 const active=['BUY LIMIT','SELL LIMIT'].includes(plan.action);
 const tabs=[['1m','M1'],['5m','M5'],['15m','M15'],['30m','M30'],['1h','H1'],['4h','H4'],['market','Market'],['1d','Daily'],['1w','Week'],['1M','Month'],['3M','Quarter'],['6M','Semester'],['1Y','Year']];
 return <div className={`tf-terminal tf-restored-terminal tf-section-${section}`}>
  <div className="tf-terminal-intro"><div><span>TERMINAL & ENTRY</span><h2>{tabs.find(t=>t[0]===selected)?.[1]||selected} <small>{data.symbol} · satu timeframe, satu pembacaan</small></h2></div><div className="tf-terminal-quote"><small>{data.marketDataStatus==='STALE_QUOTE'?'Harga terakhir':'Harga sumber aktif'}</small><strong>{fmt(Number(price))}</strong></div></div>
  <nav className="tf-selector" aria-label="Pilih timeframe terminal">{tabs.map(([tf,label])=><button key={tf} aria-pressed={selected===tf} className={selected===tf?'is-active':''} onClick={()=>setSelected(tf)}>{label}{columns.find(c=>c.timeframe===tf)&&<small className="tf-tab-touches">{Object.values(columns.find(c=>c.timeframe===tf).touchedLevels||{}).filter(Boolean).length}/9 kena</small>}{!rows.some(r=>r.timeframe===tf)&&<small>belum tersedia</small>}</button>)}</nav>
  <div className="tf-content-navigation"><nav aria-label="Isi Terminal dan Entry">{[['summary','Ringkasan'],['analysis','Analisis & Risiko'],['weekly','Plan Mingguan']].map(([id,label])=><button key={id} aria-pressed={section===id} onClick={()=>setSection(id)}>{label}</button>)}</nav><label>Selisih H4 <select aria-label="Toleransi H4 terminal" value={tolerance} onChange={e=>onTolerance?.(Number(e.target.value))}>{instrumentTolerance(data?.symbol).values.map(v=><option key={v} value={v}>{v===0?'Sama persis':`≤ ${v}`}</option>)}</select></label></div>
  {section!=='summary'?<TerminalAnalysisDetails model={section==='weekly'?weeklyModel:model} data={data} columns={columns} price={price} decimals={decimals} tolerance={tolerance} now={now} weekly={section==='weekly'}/>:!row||!column?<div className="tf-empty">Data {tabs.find(t=>t[0]===selected)?.[1]} belum tersedia dari sumber aktif.</div>:<>
   <section className="tf-data-panel"><header><h3>{row.label} <small>Tabel OHLC · Perbandingan N / B</small></h3><span className={row.direct==='UP'?'tf-up':row.direct==='DOWN'?'tf-down':''}>JIKA {row.direct==='UP'?'↑ BUY':row.direct==='DOWN'?'↓ SELL':'NETRAL'}</span></header>
    <div className="tf-ohlc"><div className="tf-ohlc-label">PERIODE</div><div>OPEN</div><div>HIGH</div><div>LOW</div><strong>N · Sekarang</strong>{['openN','highN','lowN'].map(k=><b key={k}>{fmt(row[k])}</b>)}<strong>B · Sebelumnya</strong>{['openB','highB','lowB'].map(k=><span key={k}>{fmt(row[k])}</span>)}</div>
    <dl className="tf-metrics">{[['Pola',row.pattern],['Gerak',row.move],['Alur',row.track],['Open / Pivot',row.opPv],['R1 / High B',row.r1Hb],['S1 / Low B',row.s1Lb],['Range N',row.rangeN],['Range B',row.rangeB],['Selisih range',row.rangeD]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v??'—'}</dd></div>)}</dl>
   </section>
   <div className="tf-plan-marker-grid">
    <section className="tf-entry-panel"><header><h3>Rencana Entry · {tabs.find(t=>t[0]===selected)?.[1]} <small>Entry dan sasaran dari level H4</small></h3><span className={`matrix-plan-badge ${active?(plan.action==='BUY LIMIT'?'matrix-plan-buy':'matrix-plan-sell'):'matrix-plan-wait'}`}>{plan.observerOnly?'PENANDA SAJA':plan.action}</span></header>
     {plan.observerOnly?<p>Timeframe di bawah H4 hanya untuk mengamati arah harga. Tidak memiliki entry, SL, atau TP mandiri.</p>:active?<dl className="tf-order-values">{[['Entry','entryPrice'],['TP1','tp1'],['TP2','tp2'],['TP3','tp3'],['SL','stopLoss']].map(([label,k])=><div key={k}><dt>{label}</dt><dd>{fmt(plan[k])}</dd></div>)}</dl>:<p className="tf-wait">{plan.attentionAreas?.length?'Area H4 sudah ditemukan · entry belum terkonfirmasi.':'Menunggu area H4 yang cocok.'}</p>}
     {!plan.observerOnly&&<details className="tf-plan-explanation"><summary>Alasan & syarat rencana</summary><p>{plan.reason||'Rencana bersyarat mengikuti kecocokan H4.'}</p></details>}
     <small>Sentuhan R/S dipantau otomatis terpisah dari rencana. Status TP transaksi belum diverifikasi jika urutan entry → target belum terbukti.</small>
    </section>
    <section className="tf-marker-panel"><header><h3>Penanda Harga <small>{Object.values(column.touchedLevels||{}).filter(Boolean).length}/9 level tersentuh · diperbarui otomatis</small></h3><b>{fmt(price)}</b></header>
     <div className="tf-level-markers">{LEVELS.map(k=><div key={k} className={`${column.touchedLevels?.[k]?'is-hit':''} ${nearest===k?'is-nearest':''} ${k==='pivot'?'is-pivot':k.startsWith('res')?'is-res':'is-sup'}`}><strong>{name(k)}{levelRoles(k).map(role=><em className={`tf-role-label ${role.startsWith('TP')?'tf-cell-tp':role==='SL'?'tf-cell-sl':role.startsWith('BUY')?'tf-cell-buy':role==='AREA H4'?'tf-cell-area':'tf-cell-sell'}`} key={role}>{role}</em>)}{nearest===k&&<em>TERDEKAT</em>}</strong><b>{fmt(column[k])}</b><span>{model.stale?'PERIODE LAMA':column.touchedLevels?.[k]?'✓ TERSENTUH':'○ BELUM TERSENTUH'}</span></div>)}</div>
     {plan.observerOnly&&<details className="tf-plan-explanation"><summary>Hubungan dengan H4</summary><p>{plan.reason}</p></details>}
     {plan.observerOnly&&plan.target!=null&&<p>Acuan H4: <b>{fmt(plan.target)}</b></p>}
     <small>Hijau = level tersentuh. Penanda harga dipisahkan dari validasi rencana entry.</small>
    </section>
   </div>
  </>}
  {section==='summary'&&<TableMarketWarnings data={data} columns={columns} price={price} now={now} target={dailyTarget} onTarget={onDailyTarget} onOpenAnalysis={onOpenAnalysis}/>}
 </div>;
}

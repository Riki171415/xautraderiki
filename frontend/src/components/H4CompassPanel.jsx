import { useState } from 'react';
const direction={UP:'UP',DOWN:'DOWN',NEUTRAL:'NETRAL',UNAVAILABLE:'—',FLAT:'DI OPEN'};
const phase={TARGET_DIRECTION:'Gerak searah target',BOW_DIRECTION:'Gerakan busur',AT_OPEN:'Di Open N',WAIT:'Tunggu arah',UNAVAILABLE:'Belum tersedia'};
const macroLabels={ALIGNED:'Global 10 tahun–D1 searah H4',CONFLICT:'Konflik H4 dengan konteks global',INCOMPLETE:'Hierarki 10 tahun–D1 belum lengkap',MIXED:'Konteks global belum searah penuh',WAIT:'Menunggu arah H4'};
function Frame({frame,onSelect,selected}) {
  return <button type="button" onClick={()=>onSelect(frame.timeframe)} disabled={!frame.available || frame.timeframe==='10Y'} aria-pressed={selected===frame.timeframe} className={`h4-frame ${frame.alignment==='OPPOSED'?'h4-frame-conflict':''} ${selected===frame.timeframe?'h4-frame-selected':''}`}>
    <strong>{frame.timeframe}{frame.referenceOpenBSource ? ' · B arsip' : frame.partialBefore ? ' · B parsial' : ''}</strong><span>JIKA {direction[frame.jika]}</span><small>{frame.available?`Gerak ${direction[frame.move]} · ${frame.phase==='BOW_DIRECTION'?'BUSUR':frame.phase==='TARGET_DIRECTION'?'TARGET':'TUNGGU'}`:'Data belum tersedia'}</small>
  </button>;
}
export default function H4CompassPanel({analysis,decimals=3,onSelect,selected}) {
  const [expanded,setExpanded]=useState(false);
  if(!analysis) return <aside className="h4-compass text-xs text-slate-400" role="status">Kompas H4 · menunggu analisis hierarki timeframe asli.</aside>;
  const h4=analysis.h4;
  const fmt=n=>Number.isFinite(n)?n.toFixed(decimals):'—';
  return <section className="h4-compass" aria-label="H4 pusat analisis tren">
    <div className="flex items-start justify-between flex-wrap gap-3">
      <div><p className="workspace-eyebrow">KOMPAS ANALISIS · GLOBAL → H4 → TIMEFRAME KECIL</p><h2 className="text-base font-bold mt-2 text-slate-100">{analysis.label}</h2></div>
      <button type="button" className="chart-toggle" aria-expanded={expanded} onClick={()=>setExpanded(s=>!s)}>{expanded?'Ringkas':'Lihat alur timeframe'}</button>
    </div>
    <div className="h4-summary-grid">
      <div><small>KONTEKS BESAR</small><strong className={analysis.macroStatus==='CONFLICT'?'text-amber-200':''}>{macroLabels[analysis.macroStatus]}</strong><p>Mulai 10 tahun, uraikan Busur/Target tiap tingkat; H4 kunci arah operasional.</p></div>
      <div><small>H4 · {phase[h4.phase]}</small><strong>Busur {direction[analysis.bowDirection] || 'TUNGGU'} → Target {direction[analysis.targetDirection] || 'TUNGGU'}</strong><p>Open N {fmt(h4.openN)} · Open B {fmt(h4.openB)} · harga {fmt(h4.close)}</p><p>Rumah HSH H4 = Open N {fmt(h4.hshTarget)}</p></div>
      <div><small>PERKEMBANGAN TF KECIL</small><strong>{analysis.micro.filter(f=>f.alignment==='ALIGNED').length} searah · {analysis.micro.filter(f=>f.alignment==='OPPOSED').length} berlawanan JIKA H4</strong><p>H1 · M30 · M15 · M5 · akhir busur belum terkonfirmasi.</p></div>
    </div>
    {expanded && <div className="mt-4 space-y-3">
      <p className="text-xs text-slate-300 leading-relaxed">{analysis.description}</p>
      <div><p className="text-[10px] text-slate-400 mb-2">1. CERITA GLOBAL · ARAH & GERAK TIAP PERIODE</p><div className="h4-frame-grid">{analysis.macro.map(f=><Frame key={f.timeframe} frame={f} onSelect={onSelect} selected={selected}/>)}</div></div>
      <div className="flex items-center gap-3 text-xs"><button type="button" className="chart-toggle chart-toggle-active" onClick={()=>onSelect('4h')}>2. Buka H4</button><span className="text-slate-400">JIKA {direction[h4.jika]} · {phase[h4.phase]}</span></div>
      <div><p className="text-[10px] text-slate-400 mb-2">3. PEMBACAAN GERAKAN DI BAWAH H4</p><div className="h4-frame-grid">{analysis.micro.map(f=><Frame key={f.timeframe} frame={f} onSelect={onSelect} selected={selected}/>)}</div></div>
      {analysis.warnings.map((warning,i)=><p key={i} className="text-[11px] text-amber-200 leading-relaxed">{warning}</p>)}
    </div>}
    <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">{analysis.confirmationNote}</p>
  </section>;
}

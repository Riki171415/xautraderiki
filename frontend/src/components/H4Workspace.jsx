import {useState} from 'react';
import H4LevelTargets from './H4LevelTargets';
import HSHOverview from './HSHOverview';
export default function H4Workspace({data,liveTick,now,onNotify,timeframe,onSelect,onMarket,tolerance,onTolerance,activeTab,onTab,alertSettings,onAlertSettings,onGlobal}) {
 const [localTab,setLocalTab]=useState('targets');
 const tab=(activeTab??localTab)==='context'?'targets':(activeTab??localTab),setTab=onTab??setLocalTab;
 const tabs=[['targets','Pertemuan level'],['hsh','Rumah HSH']];
 return <section className="space-y-5">
  <header className="h4-workspace-hero"><div><p className="workspace-eyebrow">PUSAT ANALISIS H4</p><h2>Temukan area. Baca pergerakannya.</h2><p>Hubungkan level H4 dengan timeframe besar, lalu periksa cerita global dan tugas Daily.</p></div><span className="h4-workspace-tag">{data?.symbol||'—'}<small>H4 · acuan level</small></span></header>
  <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Bagian analisis H4">{tabs.map(([id,label])=><button key={id} type="button" aria-pressed={tab===id} className={`chart-toggle whitespace-nowrap ${tab===id?'chart-toggle-active':''}`} onClick={()=>setTab(id)}>{label}</button>)}</nav>
  {tab==='targets'&&<div><H4LevelTargets data={data} liveTick={liveTick} now={now} onNotify={onNotify} tolerance={tolerance} onTolerance={onTolerance} alertSettings={alertSettings} onAlertSettings={onAlertSettings}/></div>}

  {onGlobal&&<button className="chart-toggle" onClick={onGlobal}>Buka alur di Peta Global →</button>}<button className="chart-toggle" onClick={onMarket}>Lihat kebiasaan & tugas Daily di Sesi Market →</button>
  {tab==='hsh'&&<div><HSHOverview data={data} liveTick={liveTick} now={now} onSelect={onSelect}/></div>}
 </section>;
}

import {useState} from 'react';
import H4LevelTargets from './H4LevelTargets';
import H4CompassPanel from './H4CompassPanel';
import HSHOverview from './HSHOverview';
export default function H4Workspace({data,liveTick,now,onNotify,timeframe,onSelect,onMarket,tolerance,onTolerance,activeTab,onTab,alertSettings,onAlertSettings}) {
 const [localTab,setLocalTab]=useState('targets');
 const tab=activeTab??localTab,setTab=onTab??setLocalTab;
 const tabs=[['targets','Pertemuan level'],['context','Alur besar → kecil'],['hsh','Rumah HSH']];
 return <section className="space-y-5">
  <header className="h4-workspace-hero"><div><p className="workspace-eyebrow">PUSAT ANALISIS H4</p><h2>Temukan area. Baca pergerakannya.</h2><p>Hubungkan level H4 dengan timeframe besar, lalu periksa cerita global dan tugas Daily.</p></div><span className="h4-workspace-tag">{data?.symbol||'—'}<small>H4 · acuan level</small></span></header>
  <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Bagian analisis H4">{tabs.map(([id,label])=><button key={id} type="button" aria-pressed={tab===id} className={`chart-toggle whitespace-nowrap ${tab===id?'chart-toggle-active':''}`} onClick={()=>setTab(id)}>{label}</button>)}</nav>
  {tab==='targets'&&<div><H4LevelTargets data={data} liveTick={liveTick} now={now} onNotify={onNotify} tolerance={tolerance} onTolerance={onTolerance} alertSettings={alertSettings} onAlertSettings={onAlertSettings}/></div>}
  {tab==='context'&&<div><H4CompassPanel analysis={data?.h4Compass} decimals={data?.decimals} selected={timeframe} onSelect={onSelect}/></div>}
  <button className="chart-toggle" onClick={onMarket}>Lihat kebiasaan & tugas Daily di Sesi Market →</button>
  {tab==='hsh'&&<div><HSHOverview data={data} liveTick={liveTick} onSelect={onSelect}/></div>}
 </section>;
}

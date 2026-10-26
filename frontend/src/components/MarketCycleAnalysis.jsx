import ForexHabitSummary from './ForexHabitSummary';
import DailyMarketProgress from './DailyMarketProgress';
import {useState} from 'react';
import {useLiveMatrix} from '../hooks/useLiveMatrix';
import MarketSessionCycle from './MarketSessionCycle';
import MarketHabitPanel from './MarketHabitPanel';
import TimeframeTasks from './TimeframeTasks';
import {quoteIsStale,dataQuality} from '../analysisState.mjs';
export default function MarketCycleAnalysis({data,liveTick,now=Date.now(),tolerance=0,dailyTarget='AUTO',onDailyTarget,alertSettings,onAlertSettings,onGlobal,onEntry,onHsh}) {
 const [tab,setTab]=useState('cycle');
 const matrix=useLiveMatrix(data,liveTick,now),columns=matrix?.rsColumns||[],price=Number(matrix?.currentPrice),decimals=data?.decimals??3;
 const stale=quoteIsStale(data,now);
 if(!data)return null;
 return <section className="cop-panel space-y-4" aria-label="Sesi Market dengan logika COP TAH bersama"><header><h2 className="text-lg font-bold">Sesi Market & hubungan tugas Daily</h2><p className="text-xs text-slate-300">{data.symbol} · {data.broker?.name} · {stale?dataQuality(data,now).label+' · konfirmasi aktif ditahan':'Sumber aktif'}</p></header><nav className="flex flex-wrap gap-2" aria-label="Rincian sesi">{[['cycle','Pola sesi'],['habit','Kebiasaan Market'],['daily','Tugas Daily']].map(([id,label])=><button type="button" key={id} className="chart-toggle" aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
 <DailyMarketProgress columns={columns} data={data} now={now} onDaily={()=>setTab('daily')}/>
 {tab==='cycle'&&<><ForexHabitSummary data={data} columns={columns} price={price} now={now} target={dailyTarget}/><MarketSessionCycle cycle={data.marketCycle} decimals={decimals}/></>}
 {tab==='habit'&&<MarketHabitPanel contextOnly data={data} liveTick={liveTick} now={now} target={dailyTarget} onTarget={onDailyTarget} alertSettings={alertSettings} onAlertSettings={onAlertSettings}/>}
 {tab==='daily'&&<TimeframeTasks columns={columns} price={price} data={data} now={now} tolerance={tolerance} decimals={decimals} timeframe="1d" dailyTarget={dailyTarget} onDailyTarget={onDailyTarget}/>}
 <div className="analysis-destination-links">{onGlobal&&<button onClick={onGlobal}>Peta Global →</button>}{onEntry&&<button onClick={onEntry}>Terminal & Entry →</button>}{onHsh&&<button onClick={onHsh}>Rumah HSH di Kunci H4 →</button>}</div>
 </section>;
}

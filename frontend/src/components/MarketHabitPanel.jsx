import ForexHabitSummary from './ForexHabitSummary';
import {isForexHabitInstrument} from '../forexHabits.mjs';
import {useLiveMatrix} from '../hooks/useLiveMatrix';
export default function MarketHabitPanel({data,liveTick,now,target='AUTO',alertSettings,onAlertSettings}) {
 const matrix=useLiveMatrix(data,liveTick,now);
 if(!isForexHabitInstrument(data))return <p className="text-sm text-slate-300">Market Berbisik dan kebiasaan Senin–Jumat khusus analisis forex dan logam. Aturan ini tidak diterapkan pada BTC atau instrumen Binance.</p>;
 return <><ForexHabitSummary data={data} columns={matrix?.rsColumns||[]} price={matrix?.currentPrice} now={now} target={target}/><label className="text-xs flex gap-2 items-center"><input type="checkbox" checked={alertSettings?.dailyEnabled??true} onChange={e=>onAlertSettings?.(s=>({...s,dailyEnabled:e.target.checked}))}/>Pop-up penting support: pantulan awal / ditembus · jeda 5 menit</label></>;
}

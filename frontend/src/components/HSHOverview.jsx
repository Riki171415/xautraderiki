import {useLiveMatrix} from '../hooks/useLiveMatrix';
import {quoteIsStale} from '../analysisState.mjs';
import { useState } from 'react';
const LABELS={'10Y':'10 tahun','1m':'M1','5m':'M5','15m':'M15','30m':'M30','1h':'H1','4h':'H4 · Time Prime','1d':'D1 · Daily','1w':'W1','1M':'MN1','3M':'Kuartal','6M':'Semester','1Y':'Tahunan'};
export default function HSHOverview({data,liveTick,onSelect,now=Date.now()}) {
 const [expanded,setExpanded]=useState(false);
 const decimals=data?.decimals ?? 3;
 const fmt=n=>Number.isFinite(n)?n.toFixed(decimals):'—';
 const matrix=useLiveMatrix(data,liveTick,now),stale=quoteIsStale(data,now);
 const rows=(matrix?.rsColumns||[]).filter(c=>c.timeframe!=='market').map(c=>({id:c.timeframe,label:LABELS[c.timeframe]||c.timeframe,open:c.openN!=null?Number(c.openN):null,price:Number(matrix?.currentPrice),available:!stale&&Number.isFinite(c.periodStart)&&c.periodStart<=now&&now<c.periodEnd,scope:'Open N periode ini'}));
 const session=data?.marketCycle?.sessions?.find(s=>s.name===data?.marketCycle?.activeSession);
 const market={id:'market',label:`Market · ${session?.name || 'sesi aktif'}`,open:session?.coverage&&session.start<=now&&now<session.end?session.open:null,price:Number(matrix?.currentPrice),available:!stale&&!!session?.coverage&&session.start<=now&&now<session.end,scope:session?.hours || 'Menunggu sesi'};
 const reference=data?.marketCycle?.hshReference;
 const referenceRow={id:'market-reference',label:`HSH ${reference?.name || 'pembanding'} sebelumnya`,open:reference?.hshOpen,
   price:Number(matrix?.currentPrice),
   available:!stale&&reference?.coverage && reference?.status==='completed',
   scope:reference?.start?new Date(reference.start).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})+' WIB · '+reference.hours:'Menunggu riwayat sesi pembanding'};
 const featured=[rows.find(r=>r.id==='4h') || {id:'4h',label:LABELS['4h']},market,rows.find(r=>r.id==='1d') || {id:'1d',label:LABELS['1d']}];
 if(reference) featured.push(referenceRow);
 const content=row=>{
   const valid=row.available && Number.isFinite(row.open) && Number.isFinite(row.price);
   const delta=valid?row.price-row.open:null;
   const atHome=valid && Math.abs(delta)<.5*10**(-decimals);
   return <><div className="flex items-center justify-between gap-2"><strong className="text-xs">{row.label}</strong><span className="text-[10px] text-slate-400">{valid?atHome?'DI OPEN N':delta>0?'DI ATAS OPEN N':'DI BAWAH OPEN N':'BELUM TERSEDIA'}</span></div><p className="text-lg font-mono text-amber-200 mt-2">{fmt(row.open)}</p><p className="text-[11px] text-slate-400 mt-1">Rumah HSH · {row.scope || 'Open N'}</p><p className="text-[11px] text-slate-300 mt-2">Harga {fmt(row.price)} · jarak {valid?fmt(Math.abs(delta)):'—'}</p><p className="text-[11px] text-slate-400 mt-1">{valid?atHome?'Harga berada di rumah.':`Arah menuju rumah: ${delta>0?'turun':'naik'}. Belum merupakan sinyal pembalikan.`:'Menunggu data asli; tidak memakai level pengganti.'}</p></>;
 };
 return <section className="hsh-overview cop-panel space-y-3" aria-label="HSH setiap timeframe"><div className="flex items-center justify-between gap-3 flex-wrap"><div><h2 className="text-sm font-bold">Peta HSH · Rumah = Open N</h2><p className="text-[11px] text-slate-400 mt-1">Time Prime = H4 · Daily = D1 · Market = Open sesi aktif. Rotasi pembanding: Asia → Eropa sebelumnya · Eropa → USA sebelumnya · USA → Asia terakhir.</p></div><button type="button" className="chart-toggle" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'Ringkas':'Semua timeframe'}</button></div>
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">{featured.map(r=><div key={r.id} className="p-3 rounded-xl border border-slate-700 bg-slate-900/50">{content(r)}</div>)}</div>
 {expanded && <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">{['1m','5m','15m','30m','1h','4h','1d','1w','1M','3M','6M','1Y','10Y'].map(tf=>rows.find(r=>r.id===tf) || {id:tf,label:LABELS[tf]}).map(r=><button type="button" key={r.id} disabled={!r.available} onClick={()=>onSelect(r.id)} className="p-3 rounded-xl border border-slate-700 bg-slate-900/50 text-left">{content(r)}</button>)}</div>}
 <p className="text-[10px] text-slate-400">Jarak dalam satuan harga, bukan pip. Lokasi harga terhadap Open N tidak membuktikan HSH aktif; peringatan waktu/ekstensi tetap dibaca pada analisis timeframe terkait. HSH Market dan matriks memakai Open sesi aktif yang sama; sesi pembanding tetap ditulis terpisah.</p>
 </section>;
}

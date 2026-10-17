import {useH4Plan} from '../hooks/useH4Plan';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../config';
import {twelveCandles} from '../twelvePublic';
import {binanceCandles} from '../binancePublic.mjs';
import { applyBid, chartCandles, findFractals } from '../chartLogic.mjs';

const COLORS = { up:'#54c9a0', down:'#e8949c', open:'#f5c66c', pivot:'#a1a9bd', resistance:'#ce9d76', support:'#8daadc' };
const timeLabel = (ts) => new Date(ts).toLocaleString('id-ID', {timeZone:'Asia/Jakarta',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});

export default function CandlestickChart({data, liveTick, symbol, timeframe, broker,tolerance=0}) {
  const [snapshot,setSnapshot] = useState({rows:[],key:''});
  const [error,setError] = useState(null);
  const [received,setReceived] = useState(null);
  const [visible,setVisible] = useState(40);
  const [hover,setHover] = useState(null);
  const [layers,setLayers] = useState({rs:true,plan:true,fractal:true});
  const anchored=useH4Plan(data,liveTick,tolerance);
  const key = `${broker}|${symbol}|${timeframe}`;
  useEffect(()=>{
    let disposed=false, timer, controller;
    setError(null); setReceived(null); setHover(null);
    async function refresh() {
      controller = new AbortController();
      const timeout=setTimeout(()=>controller.abort(),12000);
      try {
        const params=new URLSearchParams({broker,symbol,timeframe,limit:'100'});
        let json;
        if(broker==='TWELVE') json={success:true,data:await twelveCandles(symbol,timeframe,controller.signal)};
        else if(data?.fallback && broker==='BINANCE') json={success:true,data:await binanceCandles(symbol,timeframe,controller.signal)};
        else {
        const response=await fetch(`${API_BASE}/ohlcv?${params}`,{signal:controller.signal});
        json=await response.json();
        if(!response.ok || !json.success) throw new Error(json.error || 'Candle belum tersedia');
        }
        const rows=chartCandles(json.data);
        if(rows.length<2) throw new Error('Riwayat belum cukup untuk N dan B');
        if(!disposed) {setSnapshot({rows,key});setReceived(Date.now());setError(null);}
      } catch(e) { if(!disposed) setError(e.name==='AbortError'?'Permintaan candle melewati batas waktu':e.message); }
      finally {clearTimeout(timeout);if(!disposed) timer=setTimeout(refresh,5000);}
    }
    refresh();
    return ()=>{disposed=true;clearTimeout(timer);controller?.abort();};
  },[key,broker,symbol,timeframe,data?.fallback]);

  const candles=useMemo(()=>{
    if(snapshot.key!==key) return [];
    const tick=liveTick?.broker===broker && liveTick?.symbol===symbol ? liveTick : null;
    return applyBid(snapshot.rows,tick);
  },[snapshot,key,liveTick,broker,symbol]);
  const start=Math.max(0,candles.length-visible);
  const shown=candles.slice(start);
  const last=candles[candles.length-1];
  const previous=candles[candles.length-2];
  const matching=data?.broker?.id===broker && data?.timeframe===timeframe && data?.symbol===symbol;
  // Overlay levels must refer to the same N/B pair as the chart snapshot.
  const coherent=matching && data?.ohlcv_N?.timestamp===last?.timestamp && data?.ohlcv_B?.timestamp===previous?.timestamp;
  const decimals=data?.decimals ?? 3;
  const fmt=(n)=>Number.isFinite(n)?n.toFixed(decimals):'—';
  const open=last?.open;
  const levels=[];
  if(last) levels.push({name:'HSH · OPEN N',value:open,color:COLORS.open,priority:1});
  if(layers.rs && coherent && data.rsMatrix) {
    for(const name of ['r2','r1','pivot','s1','s2']) levels.push({name:name.toUpperCase(),value:data.rsMatrix[name],color:name.startsWith('r')?COLORS.resistance:name.startsWith('s')?COLORS.support:COLORS.pivot});
  }
  const plan=coherent ? anchored.plan : null;
  if(layers.plan && plan && ['BUY LIMIT','SELL LIMIT'].includes(plan.action)) {
    levels.push({name:plan.action,value:plan.entryPrice,color:'#8bc5f4',priority:2});
    levels.push({name:'SL',value:plan.stopLoss,color:'#e8949c'});
    levels.push({name:'TP1',value:plan.tp1,color:'#54c9a0'});
    levels.push({name:'TP2',value:plan.tp2,color:'#54c9a0'});
  }
  // Combine coincident levels so text stays readable (e.g. S1 + BUY LIMIT).
  const combined=[];
  for(const level of levels.filter(l=>Number.isFinite(l.value))) {
    const existing=combined.find(l=>Math.abs(l.value-level.value)<10**(-decimals));
    if(existing) {existing.name += ' / '+level.name;if(level.priority) existing.color=level.color;}
    else combined.push({...level});
  }
  const W=1100,H=450,left=22,right=235,top=28,bottom=42;
  const plotW=W-left-right,plotH=H-top-bottom;
  const scaleValues=[...shown.flatMap(c=>[c.high,c.low]),...combined.map(l=>l.value)];
  const min=scaleValues.length?Math.min(...scaleValues):0,max=scaleValues.length?Math.max(...scaleValues):1;
  const pad=Math.max((max-min)*.12, .1);
  const y=value=>top+(max+pad-value)/(max-min+2*pad)*plotH;
  const step=plotW/Math.max(1,shown.length), x=i=>left+(i+.5)*step;
  const fractals=layers.fractal?findFractals(candles).filter(m=>m.index>=start):[];
  const selected=hover==null?last:shown[hover];
  const active=hover==null?shown.length-1:hover;
  const labels=combined.map(l=>({...l,pos:y(l.value)})).sort((a,b)=>a.pos-b.pos);
  for(let i=1;i<labels.length;i++) labels[i].pos=Math.max(labels[i].pos,labels[i-1].pos+19);
  for(let i=labels.length-1;i>=0;i--) labels[i].pos=Math.min(labels[i].pos,H-bottom-5-(labels.length-1-i)*19);
  const rows=matching ? (data?.leak4RegMatrix?.tableRows || []) : [];
  const relation=coherent ? data?.multiTfDecision : null;

  return <section className="cop-panel candle-workspace" aria-label="Grafik candlestick dan konsep COP TAH">
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div><div className="workspace-eyebrow">PRICE ACTION / {broker} / {symbol}</div>
        <h2 className="text-lg font-bold mt-1">Candlestick & Fractal <span className="text-slate-400 font-normal">· {timeframe}</span></h2>
        <p className="text-xs text-slate-400 mt-1">{broker==='EXNESS'?'Candle MT5 Exness · harga chart memakai Bid':'Candle sumber pasar terpilih'} · waktu WIB</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {[['fractal','Fractal 5 candle'],['rs','Level RS'],['plan','Plan Busur']].map(([id,label])=><button type="button" key={id} aria-pressed={layers[id]} onClick={()=>setLayers(s=>({...s,[id]:!s[id]}))} className={`chart-toggle ${layers[id]?'chart-toggle-active':''}`}>{label}</button>)}
        <label className="text-xs text-slate-400">Tampilan <select aria-label="Jumlah candle yang ditampilkan" value={visible} onChange={e=>{setVisible(Number(e.target.value));setHover(null);}} className="ml-2 bg-slate-900 border border-slate-600 rounded-lg p-2 text-slate-200"><option value="25">25</option><option value="40">40</option><option value="100">Semua ({candles.length})</option></select></label>
      </div>
    </div>
    <div className="chart-ohlc" aria-live="off">
      <span>{selected?timeLabel(selected.timestamp):'Memuat candle Exness…'}</span>
      {['open','high','low','close'].map((field,i)=><span key={field}>{['O','H','L','C'][i]} <strong>{fmt(selected?.[field])}</strong></span>)}
      <span className="text-amber-200">{active===shown.length-1?'N · masih berjalan':active===shown.length-2?'B · periode sebelumnya':'Riwayat'}</span>
    </div>
    {error && <p role="status" className="text-xs text-amber-200 py-2">{error}. {shown.length?'Grafik terakhir dipertahankan; pembaruan dicoba kembali.':'Menunggu data asli timeframe ini.'}</p>}
    {shown.length>0 ? <div className="chart-scroll">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Grafik ${symbol} ${timeframe}, candle naik hijau dan turun merah, fractal terkonfirmasi serta HSH Open N`} className="candle-svg" onPointerLeave={()=>setHover(null)}>
        <rect width={W} height={H} fill="#0a101c" rx="12" />
        {[0,1,2,3,4,5].map(i=>{const price=min-pad+(max-min+2*pad)*i/5;return <g key={i}><line x1={left} x2={W-right} y1={y(price)} y2={y(price)} stroke="#1c293b" strokeWidth="1"/><text x={W-right+7} y={y(price)+4} fill="#71839c" fontSize="10">{fmt(price)}</text></g>;})}
        <rect x={x(shown.length-1)-step/2} y={top} width={step} height={plotH} fill="#f5c66c" opacity=".045" />
        {combined.map((l,i)=><line key={i} x1={left} x2={W-right} y1={y(l.value)} y2={y(l.value)} stroke={l.color} strokeDasharray={l.priority===1?'':'5 6'} strokeWidth={l.priority===1?1.5:1} opacity=".72"/>)}
        {shown.map((c,i)=>{const color=c.close>=c.open?COLORS.up:COLORS.down;const body=Math.max(1.5,Math.abs(y(c.open)-y(c.close)));return <g key={c.timestamp}>
          <title>{timeLabel(c.timestamp)} O {fmt(c.open)} H {fmt(c.high)} L {fmt(c.low)} C {fmt(c.close)}</title>
          <line x1={x(i)} x2={x(i)} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth="1.3"/>
          <rect x={x(i)-Math.max(2,step*.29)} y={Math.min(y(c.open),y(c.close))} width={Math.max(4,step*.58)} height={body} fill={color} rx="1"/>
          <rect x={x(i)-step/2} y={top} width={step} height={plotH} fill="transparent" onPointerMove={()=>setHover(i)} onPointerDown={()=>setHover(i)}/>
          {(i%Math.max(1,Math.floor(shown.length/5))===0) && <text x={x(i)} y={H-15} textAnchor="middle" fill="#8090a6" fontSize="10">{timeLabel(c.timestamp)}</text>}
        </g>;})}
        {fractals.map(m=>{const px=x(m.index-start),py=y(m.price)+(m.type==='high'?-11:11);return <g key={`${m.index}-${m.type}`} pointerEvents="none"><title>Fractal {m.type==='high'?'High':'Low'} terkonfirmasi · {fmt(m.price)}</title><path d={m.type==='high'?`M ${px-4} ${py-4} L ${px+4} ${py-4} L ${px} ${py+2} Z`:`M ${px-4} ${py+4} L ${px+4} ${py+4} L ${px} ${py-2} Z`} fill={m.type==='high'?'#d8b4fe':'#93c5fd'}/></g>;})}
        {hover!=null && shown[hover] && <line x1={x(hover)} x2={x(hover)} y1={top} y2={H-bottom} stroke="#94a3b8" strokeDasharray="3 5" pointerEvents="none"/>}
        {labels.map((l,i)=><g key={i} pointerEvents="none"><path d={`M ${W-right} ${y(l.value)} L ${W-right+66} ${y(l.value)} L ${W-right+75} ${l.pos}`} stroke={l.color} fill="none" opacity=".6"/><text x={W-right+80} y={l.pos+3} fill={l.color} fontSize="9.5">{l.name} · {fmt(l.value)}</text></g>)}
        <text x={x(shown.length-1)} y={17} textAnchor="middle" fill={COLORS.open} fontSize="11">N</text>
        {shown.length>1 && <text x={x(shown.length-2)} y={17} textAnchor="middle" fill="#94a3b8" fontSize="11">B</text>}
      </svg>
    </div>:<div className="py-20 text-center text-slate-400 text-sm">Candle asli {broker} {timeframe} belum tersedia.</div>}
    <div className="chart-concept-grid">
      <div><small>1 · JIKA / ARAH</small><strong>{coherent?`Open N ${fmt(open)} ${open>previous.open?'>':open<previous.open?'<':'='} Open B ${fmt(previous.open)}`:'Menunggu analisis periode yang sama'}</strong><p>{coherent?`JIKA ${data.jika?.trend} · ${data.perahu?.pattern}`:'Overlay plan menunggu sinkronisasi N dan B.'}</p></div>
      <div><small>2 · BUSUR / PLAN</small><strong>{plan && plan.action!=='WAIT'?`${plan.action} · ${fmt(plan.entryPrice)}`:'WAIT / belum ada plan'}</strong><p>{plan && plan.action!=='WAIT'?`TP1 ${fmt(plan.tp1)} · TP2 ${fmt(plan.tp2)} · SL ${fmt(plan.stopLoss)}`:'Tunggu setup sesuai data periode.'}</p></div>
      <div><small>3 · HSH / RUMAH</small><strong>Open N · {fmt(open)}</strong><p>{coherent?`Status ${data.hsh?.hshSeverity || 'NONE'} · usia periode ${data.hsh?.percentElapsed ?? '—'}%`:'Target rumah mengikuti Open candle N.'} · Pivot adalah level RS terpisah.</p></div>
    </div>
    <div className="flex items-center gap-2 flex-wrap mt-3 text-[11px] text-slate-400"><span>Konteks timeframe:</span>{rows.filter(r=>['1h','4h','1d','1w','1M'].includes(r.timeframe)).map(r=><span key={r.timeframe} className="px-2 py-1 rounded-md border border-slate-700">{r.timeframe} · JIKA {r.direct} · MOVE {r.move}</span>)}</div>
    {relation?.available && <div className="mt-3 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 leading-relaxed"><strong>Fraktal COP TAH · {relation.htf?.timeframe} → {relation.ltf?.timeframe}</strong><p className="mt-1">{relation.correlationStatus}</p></div>}
    <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">Fractal: swing High/Low dengan dua candle lebih rendah/tinggi di kiri dan kanan. Penanda baru muncul setelah dua candle kanan selesai; ini berbeda dari hierarki antar-timeframe. Grafik tidak mengirim order.{received?` · Snapshot ${new Date(received).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'})} WIB`:''}</p>
  </section>;
}

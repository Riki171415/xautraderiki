import MarketMovementBadge from './MarketMovementBadge';
import TimeframeCountdown from './TimeframeCountdown';
import {quoteIsStale,dataQuality} from '../analysisState.mjs';
import {useLiveMatrix} from '../hooks/useLiveMatrix';
import TimeframeTerminal from './TimeframeTerminal';
import {matrixPlan,planBadges} from '../matrixPlan.mjs';
import {projectMatrix,activeSessionAt} from '../liveMatrix.mjs';
/**
 * Leak4RegTable — Terminal Analisis
 * COP TAH Analytics Dashboard — Institutional Multi-Timeframe Analysis Matrix
 *
 * Implements modern-web-guidance responsive sticky table patterns:
 * 1. Tabel Utama: OHL Multi-Timeframe, Direct, OP_PV, R1_HB, S1_LB, Pattern, Move, Track, Range
 * 2. Tabel Matriks Support & Resistance: RES_4 s/d SUP_4 (9 Timeframe)
 * 3. Live Price Telemetry & Global Trading Sessions
 */

import React from 'react';
import { ArrowUp, ArrowDown, Activity, Globe, Clock, Shield, Info } from 'lucide-react';

function CompleteMatrix({ data, liveTick, focusedTf, rsOnly=false, displayTimeframes, tolerance=0, onTolerance,dailyTarget='AUTO',onDailyTarget,terminalSection,onTerminalSection,onTerminalSelect,onOpenAnalysis }) {
  const [now,setNow]=React.useState(Date.now);
  React.useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  const liveMatrix=useLiveMatrix(data,liveTick,now);
  if (!data) return null;

  const { leak4RegMatrix, broker, decimals = 3 } = data;
  if (!leak4RegMatrix) return null;

  const { tableRows = [], rsColumns: allRsColumns = [], sessions = [], hshNewYork, dateString, currentPrice, spreadPoints } = liveMatrix;

  const rsColumns=displayTimeframes?allRsColumns.filter(c=>displayTimeframes.includes(c.timeframe)):allRsColumns;
  const matchingTick=liveTick&&liveTick.symbol===data.symbol&&liveTick.broker===data.broker?.id&&Number.isFinite(liveTick.bid)?liveTick:null;
  const activePrice = currentPrice;
  const badges=(col,key)=>planBadges(matrixPlan(col,data.marketEntry,{columns:allRsColumns,price:Number(activePrice),options:{now,decimals,tolerance,stale:quoteIsStale(data,now)}}),key).map(label=><span key={label} className={`matrix-plan-badge ${label==='SL'?'matrix-plan-sl':label.startsWith('TP')?'matrix-plan-tp':label.startsWith('BUY')?'matrix-plan-buy':'matrix-plan-sell'}`}>{label}</span>);
  const hshReference=data.marketCycle?.hshReference;
  const hshActive=data.marketCycle?.sessions?.find(s=>s.name===activeSessionAt(now,data?.marketCycle));
  const hshFmt=v=>Number.isFinite(v)?v.toFixed(decimals):'Menunggu riwayat sesi';
  const tickDirection = liveTick?.direction || 'SAME';

  // Helper styles
  const getDirectClass = (dir) => {
    return dir === 'UP'
      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50 font-bold px-2 py-0.5 rounded'
      : 'bg-rose-950/60 text-rose-300 border border-rose-600/50 font-bold px-2 py-0.5 rounded';
  };

  const getAboveBelowClass = (val) => {
    return val === 'ABOVE' ? 'text-sky-300 font-semibold' : 'text-purple-300 font-semibold';
  };

  const getPatternClass = (pat) => {
    if (pat.includes('INSIDE')) return 'text-indigo-300 font-medium';
    if (pat.includes('UP')) return 'text-emerald-400 font-semibold';
    if (pat.includes('DN')) return 'text-rose-400 font-semibold';
    return 'text-slate-300';
  };

  const getTrackClass = (tr) => {
    return tr.includes('UP') ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
  };

  const getRangeDClass = (rd) => {
    return String(rd).startsWith('+') ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
  };

  return (
    <div className={`cop-panel space-y-4 ${rsOnly?'':'terminal-compact terminal-restored'}`} >
      <div className="terminal-screen-tools"><p className="text-xs text-slate-400">Market aktif: <strong className="text-amber-200">{activeSessionAt(now,data?.marketCycle)}</strong>{!tableRows.some(r=>r.timeframe==='market') && ' · Menunggu candle sesi baru dan riwayat pembanding lengkap. Data sesi lama tidak ditampilkan sebagai sesi aktif.'}</p></div>
      {/* ── Top Bar & Telemetry ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cop-border pb-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="text-cop-gold font-bold text-sm">{data.symbol || 'XAUUSD'}</span>
          <span className="px-2 py-0.5 rounded-full bg-cop-card text-slate-300 border border-cop-border font-semibold">
            Terminal Analisis
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 font-bold text-[10px]">
            {dataQuality(data).label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>Server: <strong className="text-white">{data.broker?.name || 'Menunggu sumber'} ({data.broker?.server || 'sumber publik'})</strong></span>
          <span className="text-slate-600">·</span>
          <span>Spread: <strong className="text-cop-cyan">{spreadPoints} pts</strong></span>
        </div>
      </div>

      {!rsOnly&&<TimeframeTerminal data={data} rows={tableRows} columns={allRsColumns} price={activePrice} decimals={decimals} tolerance={tolerance} now={now} focusedTf={focusedTf} onTolerance={onTolerance} dailyTarget={dailyTarget} onDailyTarget={onDailyTarget} terminalSection={terminalSection} onTerminalSection={onTerminalSection} onTerminalSelect={onTerminalSelect} onOpenAnalysis={onOpenAnalysis}/>}
      {/* ──────────────────────────────────────────────────────────────────────────
          BOTTOM SECTION: 2-COLUMN (TABLE 2: R&S MATRIX + PANEL 3: SESSION & INFO)
         ────────────────────────────────────────────────────────────────────────── */}
      <div hidden={!rsOnly} className={`matrix-workspace ${rsOnly?'sr-dedicated-workspace':'terminal-only-workspace'}`}>
        {/* Table 2: Multi-Timeframe Support & Resistance (9 Columns) */}
        {rsOnly&&<div className="matrix-levels border border-cop-border rounded-xl bg-cop-surface/90 p-3.5 space-y-3">
          
          {/* KOTAK INDIKATOR HARGA SAAT INI DI LEVEL SUPPORT & RESISTANCE */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/70 via-cop-card to-slate-900 border-2 border-amber-500/70 flex items-center justify-between flex-wrap gap-2 text-xs font-mono shadow-glow-gold-sm">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <span className="text-slate-300 font-extrabold uppercase text-[11px] tracking-wider">
                Kotak Lokasi Harga Live:
              </span>
              <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-sm shadow-md tabular-nums">
                ${activePrice}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-amber-200 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border-2 border-amber-400 bg-amber-500/40 inline-block shadow-glow-gold-sm" />
                <span>Kotak Emas / SAAT INI = Level Terdekat</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded shadow-sm">✓ TERSENTUH</span>
                <span>= Sudah Diuji Periode Ini</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">⏳ BELUM</span>
                <span>= Belum Tersentuh</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Matriks Support & Resistance · {rsColumns.length} timeframe
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Deteksi Status Sentuhan & Level Terdekat Otomatis
            </span>
          </div>

          <p className="text-[11px] text-slate-400">BUY/SELL LIMIT = area entry rencana; TP1–TP3 = sasaran; SL = batas risiko. Penanda mengikuti rencana tiap kolom. WAIT tidak menampilkan penanda order. Sentuhan level bukan bukti entry atau TP tercapai. Geser untuk melihat seluruh timeframe.</p>
          <div className="matrix-level-scroll" tabIndex={0} role="region" aria-label="Tabel RS seluruh timeframe, dapat digeser horizontal">
          <table className="matrix-level-table w-full text-center border-collapse text-[10px] font-mono">
            <thead>
              <tr className="border-b border-cop-border text-slate-400 font-extrabold uppercase">
                <th className="py-2 px-2 text-left text-cop-gold">LEVEL</th>
                {rsColumns.map((col) => {
                  const touchedCount = col.touchedCount !== undefined
                    ? col.touchedCount
                    : Object.values(col.touchedLevels || {}).filter(Boolean).length;
                  const isMarket = col.timeframe === 'market';
                  return (
                    <th
                      key={col.timeframe}
                      className={`py-2 px-2 ${
                        isMarket
                          ? 'text-amber-300 bg-amber-500/10 rounded-t-lg border-x border-amber-500/30'
                          : 'text-cyan-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{col.label}</span>
                        {isMarket && (
                          <span className="text-[8px] bg-amber-500 text-slate-950 px-1 rounded font-black">
                            SESI
                          </span>
                        )}
                      </div>
                      <TimeframeCountdown column={col} now={now}/><MarketMovementBadge column={col} now={now} stale={quoteIsStale(data,now)}/><div className="mt-2 text-[10px] font-semibold text-slate-200" title={matrixPlan(col,data.marketEntry,{columns:allRsColumns,price:Number(activePrice),options:{now,decimals,tolerance,stale:quoteIsStale(data,now)}}).reason||'Rencana bersyarat; belum merupakan order.'}>{matrixPlan(col,data.marketEntry,{columns:allRsColumns,price:Number(activePrice),options:{now,decimals,tolerance,stale:quoteIsStale(data,now)}}).action}</div>
                      <div className="text-[8px] font-mono font-normal mt-0.5">
                        {touchedCount > 0 ? (
                          <span className="text-emerald-400 font-bold">{touchedCount}/9 Tersentuh</span>
                        ) : (
                          <span className="text-slate-500">0/9 Tersentuh</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-cop-border/40">
              {['res4', 'res3', 'res2', 'res1'].map((rKey, idx) => (
                <tr key={rKey} className="text-orange-300 hover:bg-orange-500/[0.04]">
                  <td className="py-2 px-2 text-left font-bold text-orange-400">{`RES_${4 - idx}`}</td>
                  {rsColumns.map((col) => {
                    const currentNum = parseFloat(activePrice);
                    const cellNum = parseFloat(col[rKey]);
                    const highNum = parseFloat(col.highN);

                    // Touch detection: pre-computed by backend or via period High / live price
                    const isTouched = Boolean(
                      col.touchedLevels?.[rKey] !== undefined
                        ? col.touchedLevels[rKey]
                        : (!isNaN(highNum) && highNum >= cellNum) || (!isNaN(currentNum) && currentNum >= cellNum)
                    );

                    // Closest level check
                    const allVals = ['res4', 'res3', 'res2', 'res1', 'pivot', 'sup1', 'sup2', 'sup3', 'sup4']
                      .map((k) => ({ k, diff: Math.abs(parseFloat(col[k]) - currentNum) }))
                      .sort((a, b) => a.diff - b.diff);
                    const isClosest = allVals[0]?.k === rKey;

                    return (
                      <td
                        key={col.timeframe}
                        className={`py-1.5 px-1.5 tabular-nums transition-all ${
                          isClosest && isTouched
                            ? 'bg-amber-500/30 text-amber-200 font-black border-2 border-amber-400 rounded-lg shadow-glow-gold'
                            : isClosest
                            ? 'bg-amber-500/25 text-amber-200 font-black border-2 border-amber-400 rounded-lg shadow-glow-gold'
                            : isTouched
                            ? 'bg-emerald-950/60 text-emerald-200 font-black border border-emerald-500/60 shadow-glow-green-sm'
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {isTouched ? (
                            <span className="text-[8px] bg-emerald-500 text-slate-950 px-1 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5 animate-pulse">
                              ✓ TERSENTUH
                            </span>
                          ) : (
                            <span className="text-[8px] bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1 py-0.2 rounded font-medium flex items-center gap-0.5">
                              ⏳ BELUM
                            </span>
                          )}
                          <span className="font-bold">{col[rKey]}</span>
                          {badges(col,rKey)}
                          {isClosest && (
                            <span className="text-[8px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                              SAAT INI
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* PIVOT ROW */}
              <tr className="bg-amber-500/10 text-white font-black border-y-2 border-amber-500/40">
                <td className="py-2.5 px-2 text-left text-cop-gold font-bold">PIVOT</td>
                {rsColumns.map((col) => {
                  const currentNum = parseFloat(activePrice);
                  const cellNum = parseFloat(col.pivot);
                  const highNum = parseFloat(col.highN);
                  const lowNum = parseFloat(col.lowN);

                  // Touch detection: pre-computed or range traversals
                  const isTouched = Boolean(
                    col.touchedLevels?.pivot !== undefined
                      ? col.touchedLevels.pivot
                      : (!isNaN(highNum) && !isNaN(lowNum) && highNum >= cellNum && lowNum <= cellNum) ||
                        (!isNaN(currentNum) && Math.abs(currentNum - cellNum) <= 1.0)
                  );

                  const allVals = ['res4', 'res3', 'res2', 'res1', 'pivot', 'sup1', 'sup2', 'sup3', 'sup4']
                    .map((k) => ({ k, diff: Math.abs(parseFloat(col[k]) - currentNum) }))
                    .sort((a, b) => a.diff - b.diff);
                  const isClosest = allVals[0]?.k === 'pivot';

                  return (
                    <td
                      key={col.timeframe}
                      className={`py-2 px-1.5 text-white font-black tabular-nums transition-all ${
                        isClosest && isTouched
                          ? 'bg-amber-500/40 text-amber-200 border-2 border-amber-400 rounded-lg shadow-glow-gold'
                          : isClosest
                          ? 'bg-amber-500/35 text-amber-200 border-2 border-amber-400 rounded-lg shadow-glow-gold'
                          : isTouched
                          ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/60'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {isTouched ? (
                          <span className="text-[8px] bg-emerald-500 text-slate-950 px-1 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5 animate-pulse">
                            ✓ TERSENTUH
                          </span>
                        ) : (
                          <span className="text-[8px] bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1 py-0.2 rounded font-medium flex items-center gap-0.5">
                            ⏳ BELUM
                          </span>
                        )}
                        <span className="font-black">{col.pivot}</span>
                        {badges(col,'pivot')}
                        {isClosest && (
                          <span className="text-[8px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                            SAAT INI
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {['sup1', 'sup2', 'sup3', 'sup4'].map((sKey, idx) => (
                <tr key={sKey} className="text-rose-300 hover:bg-rose-500/[0.04]">
                  <td className="py-2 px-2 text-left font-bold text-rose-400">{`SUP_${idx + 1}`}</td>
                  {rsColumns.map((col) => {
                    const currentNum = parseFloat(activePrice);
                    const cellNum = parseFloat(col[sKey]);
                    const lowNum = parseFloat(col.lowN);

                    // Touch detection: pre-computed or period Low / live price
                    const isTouched = Boolean(
                      col.touchedLevels?.[sKey] !== undefined
                        ? col.touchedLevels[sKey]
                        : (!isNaN(lowNum) && lowNum <= cellNum) || (!isNaN(currentNum) && currentNum <= cellNum)
                    );

                    const allVals = ['res4', 'res3', 'res2', 'res1', 'pivot', 'sup1', 'sup2', 'sup3', 'sup4']
                      .map((k) => ({ k, diff: Math.abs(parseFloat(col[k]) - currentNum) }))
                      .sort((a, b) => a.diff - b.diff);
                    const isClosest = allVals[0]?.k === sKey;

                    return (
                      <td
                        key={col.timeframe}
                        className={`py-1.5 px-1.5 tabular-nums transition-all ${
                          isClosest && isTouched
                            ? 'bg-amber-500/30 text-amber-200 font-black border-2 border-amber-400 rounded-lg shadow-glow-gold'
                            : isClosest
                            ? 'bg-amber-500/25 text-amber-200 font-black border-2 border-amber-400 rounded-lg shadow-glow-gold'
                            : isTouched
                            ? 'bg-rose-950/60 text-rose-200 font-black border border-rose-500/60 shadow-glow-red-sm'
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {isTouched ? (
                            <span className="text-[8px] bg-rose-500 text-white px-1 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5 animate-pulse">
                              ✓ TERSENTUH
                            </span>
                          ) : (
                            <span className="text-[8px] bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1 py-0.2 rounded font-medium flex items-center gap-0.5">
                              ⏳ BELUM
                            </span>
                          )}
                          <span className="font-bold">{col[sKey]}</span>
                          {badges(col,sKey)}
                          {isClosest && (
                            <span className="text-[8px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                              SAAT INI
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        }
        {/* Panel 3: Live Info, Date, & Global Sessions (4 Columns) */}
        <div className="matrix-session-strip border border-cop-border rounded-xl bg-cop-surface/90 p-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-white tracking-tight flex items-center flex-wrap gap-2 font-mono">
                <span>{data.symbol || 'XAUUSD'} :</span>
                <span
                  className={`tabular-nums ${
                    tickDirection === 'UP'
                      ? 'text-emerald-400'
                      : tickDirection === 'DOWN'
                      ? 'text-rose-400'
                      : 'text-cop-gold'
                  }`}
                >
                  ${activePrice}
                </span>
                {tickDirection === 'UP' && <ArrowUp className="w-4 h-4 text-emerald-400 inline" />}
                {tickDirection === 'DOWN' && <ArrowDown className="w-4 h-4 text-rose-400 inline" />}
              </span>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-cop-border/60">
              <span>SPREAD : <strong className="text-cop-cyan">{spreadPoints} PTS</strong></span>
              <span>HSH {activeSessionAt(now,data?.marketCycle)} · OPEN SESI : <strong className="text-amber-300">{hshFmt(hshActive?.coverage?hshActive.open:null)}</strong></span>
              <span className="block mt-1 text-xs text-slate-400">HSH {hshReference?.name||'pembanding'} sebelumnya : <strong className="text-cyan-200">{hshFmt(hshReference?.hshOpen)}</strong></span>
            </div>

            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider pt-1">
              {dateString}
            </div>
          </div>

          {/* Global Sessions Table */}
          <div className="border border-cop-border rounded-xl bg-cop-card/70 p-2.5 space-y-1.5 text-xs font-mono">
            {sessions.map((s) => (
              <div key={s.city} className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{s.city} : {data.marketCycle?.sessions?.find(x=>x.name===s.city)?.hours||s.time}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    s.status === 'OPEN'
                      ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-600/50'
                      : s.status === 'STATUS'
                      ? 'text-slate-400 bg-slate-900 border border-slate-700'
                      : 'text-rose-400 bg-rose-950/60 border border-rose-700/50'
                  }`}
                >
                  {s.city===activeSessionAt(now,data?.marketCycle)?'OPEN':'CLOSED'}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Branding */}
          <div className="flex items-center justify-between pt-2 border-t border-cop-border/60 text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cop-gold animate-pulse" />
              <span className="text-cop-gold font-bold tracking-widest">COP TAH SYSTEM</span>
            </div>
            <span className="text-slate-400">House Of Gold · Multi-TF</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Leak4RegTable(props) {
 if(!props.data?.leak4RegMatrix)return <section className="cop-panel text-sm text-slate-400">Terminal menunggu data dari sumber aktif.</section>;
 return <CompleteMatrix {...props}/>;
}

export function SupportResistanceMatrix(props){
 return <CompleteMatrix {...props} rsOnly/>;
}

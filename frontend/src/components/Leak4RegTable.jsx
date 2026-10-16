/**
 * Leak4RegTable — Multi-Timeframe Matrix Terminal
 * COP TAH Analytics Dashboard — Institutional Multi-Timeframe Analysis Matrix
 *
 * Implements modern-web-guidance responsive sticky table patterns:
 * 1. Tabel Utama: OHL Multi-Timeframe, Direct, OP_PV, R1_HB, S1_LB, Pattern, Move, Track, Range
 * 2. Tabel Matriks Support & Resistance: RES_4 s/d SUP_4 (9 Timeframe)
 * 3. Live Price Telemetry & Global Trading Sessions
 */

import React from 'react';
import { ArrowUp, ArrowDown, Activity, Globe, Clock, Shield, Info } from 'lucide-react';

export default function Leak4RegTable({ data, liveTick }) {
  if (!data) return null;

  const { leak4RegMatrix, broker, decimals = 3 } = data;
  if (!leak4RegMatrix) return null;

  const { tableRows = [], rsColumns = [], sessions = [], hshNewYork, dateString, currentPrice, spreadPoints } = leak4RegMatrix;

  const activePrice = liveTick?.price !== undefined ? liveTick.price.toFixed(decimals) : currentPrice;
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
    <div className="cop-panel space-y-4">
      {/* ── Top Bar & Telemetry ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cop-border pb-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="text-cop-gold font-bold text-sm">{data.symbol || 'XAUUSD'}</span>
          <span className="px-2 py-0.5 rounded-full bg-cop-card text-slate-300 border border-cop-border font-semibold">
            Multi-Timeframe Matrix Terminal
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 font-bold text-[10px]">
            Live Confluence
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>Server: <strong className="text-white">{data.broker?.name || 'Exness'} ({data.broker?.server || 'MT5Real36'})</strong></span>
          <span className="text-slate-600">·</span>
          <span>Spread: <strong className="text-cop-cyan">{spreadPoints} pts</strong></span>
        </div>
      </div>

      {/* ── Metric Legends Bar ── */}
      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-cop-card/60 px-3 py-1.5 rounded-xl border border-cop-border overflow-x-auto">
        <span className="text-cop-gold font-bold uppercase tracking-wider flex items-center gap-1">
          <Info className="w-3 h-3" /> Legenda:
        </span>
        <span><strong>DIRECT</strong>: Posisi Open N vs B</span>
        <span className="text-slate-600">·</span>
        <span><strong>OP_PV</strong>: Open N vs Pivot</span>
        <span className="text-slate-600">·</span>
        <span><strong>R1_HB / S1_LB</strong>: Posisi Busur vs High/Low B</span>
        <span className="text-slate-600">·</span>
        <span><strong>RANGE_D</strong>: Delta Ekspansi Range N - B</span>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TABEL 1: MULTI-TIMEFRAME STATUS & OHL TABLE (STICKY HEADERS)
         ────────────────────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-cop-border bg-cop-surface/80 max-h-[500px]">
        <table className="w-full text-center font-mono text-[11px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-cop-card/95 text-[10px] text-slate-300 font-extrabold uppercase tracking-wider border-b border-cop-border">
              <th className="sticky top-0 left-0 z-30 bg-cop-card py-2.5 px-3 text-left text-cop-gold border-b border-r border-cop-border">
                TF
              </th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-cyan-300 border-b border-cop-border">OPEN_N</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-slate-400 border-b border-cop-border">OPEN_B</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-cyan-300 border-b border-cop-border">HIGH_N</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-slate-400 border-b border-cop-border">HIGH_B</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-cyan-300 border-b border-cop-border">LOW_N</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-slate-400 border-b border-cop-border">LOW_B</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-white border-b border-cop-border">DIRECT</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-slate-300 border-b border-cop-border">OP_PV</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-slate-300 border-b border-cop-border">R1_HB</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-slate-300 border-b border-cop-border">S1_LB</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-slate-300 border-b border-cop-border">PATTERN</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-white border-b border-cop-border">MOVE</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-white border-b border-cop-border">TRACK</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-cyan-300 border-b border-cop-border">RANGE_N</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-slate-400 border-b border-cop-border">RANGE_B</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-2 text-amber-300 border-b border-cop-border">RANGE_D</th>
              <th className="sticky top-0 z-20 bg-cop-card py-2.5 px-3 text-cop-gold border-b border-cop-border font-black">
                📍 POSISI HARGA LIVE
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cop-border/50 text-[11px]">
            {tableRows.map((row) => {
              const currentNum = parseFloat(activePrice);
              const openNum = parseFloat(row.openN);
              const isAboveOpen = !isNaN(currentNum) && !isNaN(openNum) && currentNum >= openNum;
              const distPts = !isNaN(currentNum) && !isNaN(openNum) ? Math.abs(currentNum - openNum).toFixed(decimals) : '—';

              return (
                <tr key={row.timeframe} className="hover:bg-amber-500/[0.04] transition-colors">
                  {/* Sticky Left Column: Timeframe Label */}
                  <td className="sticky left-0 z-10 bg-cop-surface py-2 px-3 text-left font-bold text-cop-gold border-r border-cop-border whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="py-2 px-2 text-cyan-200 tabular-nums">{row.openN}</td>
                  <td className="py-2 px-2 text-slate-400 tabular-nums">{row.openB}</td>
                  <td className="py-2 px-2 text-cyan-200 tabular-nums">{row.highN}</td>
                  <td className="py-2 px-2 text-slate-400 tabular-nums">{row.highB}</td>
                  <td className="py-2 px-2 text-cyan-200 tabular-nums">{row.lowN}</td>
                  <td className="py-2 px-2 text-slate-400 tabular-nums">{row.lowB}</td>

                  <td className="py-2 px-2">
                    <span className={getDirectClass(row.direct)}>
                      {row.direct}
                    </span>
                  </td>

                  <td className={`py-2 px-2 ${getAboveBelowClass(row.opPv)}`}>
                    {row.opPv}
                  </td>
                  <td className={`py-2 px-2 ${getAboveBelowClass(row.r1Hb)}`}>
                    {row.r1Hb}
                  </td>
                  <td className={`py-2 px-2 ${getAboveBelowClass(row.s1Lb)}`}>
                    {row.s1Lb}
                  </td>

                  <td className={`py-2 px-2 ${getPatternClass(row.pattern)}`}>
                    {row.pattern}
                  </td>

                  <td className="py-2 px-2 font-bold">
                    <span className={row.move === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>
                      {row.move}
                    </span>
                  </td>

                  <td className={`py-2 px-2 ${getTrackClass(row.track)}`}>
                    {row.track}
                  </td>

                  <td className="py-2 px-2 text-white font-medium tabular-nums">{row.rangeN}</td>
                  <td className="py-2 px-2 text-slate-400 tabular-nums">{row.rangeB}</td>
                  <td className={`py-2 px-2 tabular-nums ${getRangeDClass(row.rangeD)}`}>
                    {row.rangeD}
                  </td>

                  {/* KOTAK INDIKATOR POSISI HARGA SAAT INI */}
                  <td className="py-2 px-3">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-[10px] shadow-sm ${
                        isAboveOpen
                          ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-glow-green-sm'
                          : 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-glow-red-sm'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isAboveOpen ? 'bg-emerald-400' : 'bg-rose-400'} animate-ping`} />
                      <span>{isAboveOpen ? '▲ DI ATAS OPEN' : '▼ DI BAWAH OPEN'}</span>
                      <span className="text-white font-black">({isAboveOpen ? '+' : '-'}{distPts})</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          BOTTOM SECTION: 2-COLUMN (TABLE 2: R&S MATRIX + PANEL 3: SESSION & INFO)
         ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Table 2: Multi-Timeframe Support & Resistance (9 Columns) */}
        <div className="lg:col-span-8 overflow-x-auto border border-cop-border rounded-xl bg-cop-surface/90 p-3.5 space-y-3">
          
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
            <div className="flex items-center gap-2 text-[11px] text-amber-200">
              <span className="w-2.5 h-2.5 rounded border-2 border-amber-400 bg-amber-500/40 inline-block shadow-glow-gold-sm" />
              <span>Sel bergaris kotak emas menyala = Level terdekat dengan posisi pasar saat ini</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Matriks Support & Resistance Multi-Timeframe (9 Kolom)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Deteksi Otomatis Level Terdekat
            </span>
          </div>

          <table className="w-full text-center border-collapse text-[10px] font-mono">
            <thead>
              <tr className="border-b border-cop-border text-slate-400 font-extrabold uppercase">
                <th className="py-2 px-2 text-left text-cop-gold">LEVEL</th>
                {rsColumns.map((col) => (
                  <th key={col.timeframe} className="py-2 px-2 text-cyan-300">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cop-border/40">
              {['res4', 'res3', 'res2', 'res1'].map((rKey, idx) => (
                <tr key={rKey} className="text-orange-300 hover:bg-orange-500/[0.04]">
                  <td className="py-1.5 px-2 text-left font-bold text-orange-400">{`RES_${4 - idx}`}</td>
                  {rsColumns.map((col) => {
                    const currentNum = parseFloat(activePrice);
                    const cellNum = parseFloat(col[rKey]);
                    // Check if this level is closest in this column
                    const allVals = ['res4', 'res3', 'res2', 'res1', 'pivot', 'sup1', 'sup2', 'sup3', 'sup4']
                      .map((k) => ({ k, diff: Math.abs(parseFloat(col[k]) - currentNum) }))
                      .sort((a, b) => a.diff - b.diff);
                    const isClosest = allVals[0]?.k === rKey;

                    return (
                      <td
                        key={col.timeframe}
                        className={`py-1.5 px-2 tabular-nums transition-all ${
                          isClosest
                            ? 'bg-amber-500/25 text-amber-200 font-black border-2 border-amber-400 rounded-lg shadow-glow-gold'
                            : ''
                        }`}
                      >
                        {isClosest ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            <span>{col[rKey]}</span>
                          </div>
                        ) : (
                          col[rKey]
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* PIVOT ROW */}
              <tr className="bg-amber-500/10 text-white font-black border-y-2 border-amber-500/40">
                <td className="py-2 px-2 text-left text-cop-gold font-bold">PIVOT</td>
                {rsColumns.map((col) => {
                  const currentNum = parseFloat(activePrice);
                  const allVals = ['res4', 'res3', 'res2', 'res1', 'pivot', 'sup1', 'sup2', 'sup3', 'sup4']
                    .map((k) => ({ k, diff: Math.abs(parseFloat(col[k]) - currentNum) }))
                    .sort((a, b) => a.diff - b.diff);
                  const isClosest = allVals[0]?.k === 'pivot';

                  return (
                    <td
                      key={col.timeframe}
                      className={`py-2 px-2 text-white font-black tabular-nums transition-all ${
                        isClosest
                          ? 'bg-amber-500/40 text-amber-200 border-2 border-amber-400 rounded-lg shadow-glow-gold'
                          : ''
                      }`}
                    >
                      {isClosest ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>{col.pivot}</span>
                        </div>
                      ) : (
                        col.pivot
                      )}
                    </td>
                  );
                })}
              </tr>

              {['sup1', 'sup2', 'sup3', 'sup4'].map((sKey, idx) => (
                <tr key={sKey} className="text-rose-300 hover:bg-rose-500/[0.04]">
                  <td className="py-1.5 px-2 text-left font-bold text-rose-400">{`SUP_${idx + 1}`}</td>
                  {rsColumns.map((col) => {
                    const currentNum = parseFloat(activePrice);
                    const allVals = ['res4', 'res3', 'res2', 'res1', 'pivot', 'sup1', 'sup2', 'sup3', 'sup4']
                      .map((k) => ({ k, diff: Math.abs(parseFloat(col[k]) - currentNum) }))
                      .sort((a, b) => a.diff - b.diff);
                    const isClosest = allVals[0]?.k === sKey;

                    return (
                      <td
                        key={col.timeframe}
                        className={`py-1.5 px-2 tabular-nums transition-all ${
                          isClosest
                            ? 'bg-amber-500/25 text-amber-200 font-black border-2 border-amber-400 rounded-lg shadow-glow-gold'
                            : ''
                        }`}
                      >
                        {isClosest ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            <span>{col[sKey]}</span>
                          </div>
                        ) : (
                          col[sKey]
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel 3: Live Info, Date, & Global Sessions (4 Columns) */}
        <div className="lg:col-span-4 border border-cop-border rounded-xl bg-cop-surface/90 p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-white tracking-tight flex items-center gap-2 font-mono">
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

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-cop-border/60">
              <span>SPREAD : <strong className="text-cop-cyan">{spreadPoints} PTS</strong></span>
              <span>HSH NEW YORK : <strong className="text-amber-300">{hshNewYork}</strong></span>
            </div>

            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider pt-1">
              {dateString}
            </div>
          </div>

          {/* Global Sessions Table */}
          <div className="border border-cop-border rounded-xl bg-cop-card/70 p-2.5 space-y-1.5 text-xs font-mono">
            {sessions.map((s) => (
              <div key={s.city} className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{s.city} : {s.time}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    s.status === 'OPEN'
                      ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-600/50'
                      : s.status === 'STATUS'
                      ? 'text-slate-400 bg-slate-900 border border-slate-700'
                      : 'text-rose-400 bg-rose-950/60 border border-rose-700/50'
                  }`}
                >
                  {s.status}
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

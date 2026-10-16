/**
 * MultiTfMatrixTable — Mode Tabel Matriks Multi-Timeframe
 * COP TAH Analytics Dashboard — Multi-Timeframe Analysis Matrix
 *
 * 1. Tabel Utama: OHL Multi-Timeframe, Direct, OP_PV, R1_HB, S1_LB, Pattern, Move, Track, Range
 * 2. Tabel Matriks Support & Resistance: RES_4 s/d SUP_4 (9 Timeframe)
 * 3. Panel Info Harga Live, Spread, HSH New York, & Status Sesi Pasar Global
 */

import React from 'react';
import { ArrowUp, ArrowDown, Activity, Globe, Clock, Shield } from 'lucide-react';

export default function Leak4RegTable({ data, liveTick }) {
  if (!data) return null;

  const { leak4RegMatrix, broker, decimals = 3 } = data;
  if (!leak4RegMatrix) return null;

  const { tableRows = [], rsColumns = [], sessions = [], hshNewYork, dateString, currentPrice, spreadPoints } = leak4RegMatrix;

  // Live active price from liveTick if available
  const activePrice = liveTick?.price !== undefined ? liveTick.price.toFixed(decimals) : currentPrice;
  const tickDirection = liveTick?.direction || 'SAME';

  // Helper color for DIRECT / MOVE
  const getDirectClass = (dir) => {
    return dir === 'UP' ? 'text-cyan-400 font-bold' : 'text-pink-500 font-bold';
  };

  // Helper color for OP_PV, R1_HB, S1_LB
  const getAboveBelowClass = (val) => {
    return val === 'ABOVE' ? 'text-sky-300' : 'text-purple-400';
  };

  // Helper color for Pattern
  const getPatternClass = (pat) => {
    if (pat.includes('INSIDE')) return 'text-indigo-300 font-medium';
    if (pat.includes('UP')) return 'text-cyan-400';
    if (pat.includes('DN')) return 'text-pink-400';
    return 'text-slate-300';
  };

  // Helper color for Track
  const getTrackClass = (tr) => {
    if (tr.includes('UP')) return 'text-cyan-400 font-semibold';
    return 'text-pink-400 font-semibold';
  };

  // Helper color for Range D
  const getRangeDClass = (rd) => {
    if (String(rd).startsWith('+')) return 'text-cyan-400 font-bold';
    return 'text-pink-400 font-bold';
  };

  return (
    <div className="bg-[#050814] text-slate-200 border-2 border-[#132347] rounded-xl p-4 shadow-2xl font-mono text-[11px] select-none space-y-4">
      {/* ── Top Bar / Custom Branding ── */}
      <div className="flex items-center justify-between border-b border-[#152a55] pb-2 text-[10px] text-slate-400 tracking-wider">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold text-xs">{data.symbol || 'XAUUSD'} — Multi-Timeframe Matrix Terminal</span>
          <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-700/50 font-bold">
            COP TAH Engine v2.0
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-bold">
            Realtime Feed
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">{data.broker?.name || 'Exness'} ({data.broker?.server || 'MT5Real36'})</span>
          <span className="text-cop-gold font-bold uppercase tracking-wider">COP TAH Matrix</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TABEL 1: MULTI-TIMEFRAME STATUS & OHL COMPARISON TABLE
         ────────────────────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto border border-[#162a55] rounded-lg bg-[#070c1e]">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-[#1b3469] bg-[#0c1633] text-[10px] text-slate-300 font-bold tracking-wider">
              <th className="py-2 px-2 text-left text-cyan-400">XAUUSD</th>
              <th className="py-2 px-2 text-cyan-300">OPEN_N</th>
              <th className="py-2 px-2 text-cyan-300">OPEN_B</th>
              <th className="py-2 px-2 text-cyan-300">HIGH_N</th>
              <th className="py-2 px-2 text-cyan-300">HIGH_B</th>
              <th className="py-2 px-2 text-cyan-300">LOW_N</th>
              <th className="py-2 px-2 text-cyan-300">LOW_B</th>
              <th className="py-2 px-2 text-white">DIRECT</th>
              <th className="py-2 px-2 text-slate-300">OP_PV</th>
              <th className="py-2 px-2 text-slate-300">R1_HB</th>
              <th className="py-2 px-2 text-slate-300">S1_LB</th>
              <th className="py-2 px-2 text-slate-300">PATTERN</th>
              <th className="py-2 px-2 text-white">MOVE</th>
              <th className="py-2 px-2 text-white">TRACK</th>
              <th className="py-2 px-2 text-cyan-300">RANGE_N</th>
              <th className="py-2 px-2 text-cyan-300">RANGE_B</th>
              <th className="py-2 px-2 text-amber-300">RANGE_D</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#132347] text-[11px]">
            {tableRows.map((row) => (
              <tr key={row.timeframe} className="hover:bg-blue-950/20 transition-colors">
                {/* Row Header */}
                <td className="py-1.5 px-2 text-left font-bold text-cyan-400 whitespace-nowrap">
                  {row.label}
                </td>
                {/* OHL Values */}
                <td className="py-1.5 px-2 text-cyan-200">{row.openN}</td>
                <td className="py-1.5 px-2 text-slate-300">{row.openB}</td>
                <td className="py-1.5 px-2 text-cyan-200">{row.highN}</td>
                <td className="py-1.5 px-2 text-slate-300">{row.highB}</td>
                <td className="py-1.5 px-2 text-cyan-200">{row.lowN}</td>
                <td className="py-1.5 px-2 text-slate-300">{row.lowB}</td>

                {/* DIRECT */}
                <td className={`py-1.5 px-2 ${getDirectClass(row.direct)}`}>
                  {row.direct}
                </td>

                {/* OP_PV, R1_HB, S1_LB */}
                <td className={`py-1.5 px-2 ${getAboveBelowClass(row.opPv)}`}>
                  {row.opPv}
                </td>
                <td className={`py-1.5 px-2 ${getAboveBelowClass(row.r1Hb)}`}>
                  {row.r1Hb}
                </td>
                <td className={`py-1.5 px-2 ${getAboveBelowClass(row.s1Lb)}`}>
                  {row.s1Lb}
                </td>

                {/* PATTERN */}
                <td className={`py-1.5 px-2 ${getPatternClass(row.pattern)}`}>
                  {row.pattern}
                </td>

                {/* MOVE */}
                <td className={`py-1.5 px-2 ${getDirectClass(row.move)}`}>
                  {row.move}
                </td>

                {/* TRACK */}
                <td className={`py-1.5 px-2 ${getTrackClass(row.track)}`}>
                  {row.track}
                </td>

                {/* RANGES */}
                <td className="py-1.5 px-2 text-white font-medium">{row.rangeN}</td>
                <td className="py-1.5 px-2 text-slate-400">{row.rangeB}</td>
                <td className={`py-1.5 px-2 ${getRangeDClass(row.rangeD)}`}>
                  {row.rangeD}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          BOTTOM SECTION: 2-COLUMN (TABLE 2: R&S MATRIX + PANEL 3: SESSION & INFO)
         ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── Table 2: Multi-Timeframe Support & Resistance (9 Columns) ── */}
        <div className="lg:col-span-8 overflow-x-auto border border-[#162a55] rounded-lg bg-[#070c1e] p-2">
          <table className="w-full text-center border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-[#1b3469] text-cyan-400 font-bold uppercase tracking-wider">
                <th className="py-1.5 px-2 text-left text-slate-400">LEVEL</th>
                {rsColumns.map((col) => (
                  <th key={col.timeframe} className="py-1.5 px-2 text-cyan-300">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132347]">
              {/* RES_4 */}
              <tr className="text-cyan-300/80 hover:bg-blue-950/20">
                <td className="py-1 px-2 text-left font-bold text-sky-400">RES_4</td>
                {rsColumns.map((col) => (
                  <td key={col.timeframe} className="py-1 px-2">{col.res4}</td>
                ))}
              </tr>
              {/* RES_3 */}
              <tr className="text-cyan-300/80 hover:bg-blue-950/20">
                <td className="py-1 px-2 text-left font-bold text-sky-400">RES_3</td>
                {rsColumns.map((col) => (
                  <td key={col.timeframe} className="py-1 px-2">{col.res3}</td>
                ))}
              </tr>
              {/* RES_2 */}
              <tr className="text-cyan-300/80 hover:bg-blue-950/20">
                <td className="py-1 px-2 text-left font-bold text-sky-400">RES_2</td>
                {rsColumns.map((col) => (
                  <td key={col.timeframe} className="py-1 px-2">{col.res2}</td>
                ))}
              </tr>
              {/* RES_1 */}
              <tr className="text-cyan-200 hover:bg-blue-950/20 font-medium">
                <td className="py-1 px-2 text-left font-bold text-sky-300">RES_1</td>
                {rsColumns.map((col) => (
                  <td key={col.timeframe} className="py-1 px-2">{col.res1}</td>
                ))}
              </tr>

              {/* PIVOT (Highlighted Row) */}
              <tr className="bg-blue-950/40 text-white font-bold border-y-2 border-cyan-500/40">
                <td className="py-1.5 px-2 text-left text-amber-300">PIVOT</td>
                {rsColumns.map((col) => (
                  <td key={col.timeframe} className="py-1.5 px-2 text-white font-bold">
                    {col.pivot}
                  </td>
                ))}
              </tr>

              {/* SUP_1 */}
              <tr className="text-pink-300/90 hover:bg-pink-950/20 font-medium">
                <td className="py-1 px-2 text-left font-bold text-pink-400">SUP_1</td>
                {rsColumns.map((col) => (
                  <td key={col.timeframe} className="py-1 px-2">{col.sup1}</td>
                ))}
              </tr>
              {/* SUP_2 */}
              <tr className="text-pink-400/80 hover:bg-pink-950/20">
                <td className="py-1 px-2 text-left font-bold text-pink-400">SUP_2</td>
                {rsColumns.map((col) => (
                  <td key={col.timeframe} className="py-1 px-2">{col.sup2}</td>
                ))}
              </tr>
              {/* SUP_3 */}
              <tr className="text-pink-400/80 hover:bg-pink-950/20">
                <td className="py-1 px-2 text-left font-bold text-pink-400">SUP_3</td>
                {rsColumns.map((col) => (
                  <td key={col.timeframe} className="py-1 px-2">{col.sup3}</td>
                ))}
              </tr>
              {/* SUP_4 */}
              <tr className="text-pink-400/80 hover:bg-pink-950/20">
                <td className="py-1 px-2 text-left font-bold text-pink-400">SUP_4</td>
                {rsColumns.map((col) => (
                  <td key={col.timeframe} className="py-1 px-2">{col.sup4}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Panel 3: Live Info, Date, & Global Sessions (4 Columns) ── */}
        <div className="lg:col-span-4 border border-[#162a55] rounded-lg bg-[#070c1e] p-3 flex flex-col justify-between space-y-3">
          {/* Top Info: Live Price & Date */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>XAUUSD :</span>
                <span
                  className={`transition-colors duration-200 ${
                    tickDirection === 'UP'
                      ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                      : tickDirection === 'DOWN'
                      ? 'text-pink-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'text-cyan-300'
                  }`}
                >
                  {activePrice}
                </span>
                {tickDirection === 'UP' && <ArrowUp className="w-4 h-4 text-emerald-400 inline animate-bounce" />}
                {tickDirection === 'DOWN' && <ArrowDown className="w-4 h-4 text-pink-500 inline animate-bounce" />}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>SPREAD : <strong className="text-cyan-400">{spreadPoints} POINT</strong></span>
              <span>HSH NEWYORK : <strong className="text-amber-300">{hshNewYork}</strong></span>
            </div>

            <div className="text-[10px] text-slate-400 uppercase tracking-wider pt-1 border-t border-[#152a55]/60">
              {dateString}
            </div>
          </div>

          {/* Global Sessions Table */}
          <div className="border border-[#132347] rounded bg-[#050814]/80 p-2 space-y-1 text-[10px]">
            {sessions.map((s) => (
              <div key={s.city} className="flex items-center justify-between font-mono">
                <span className="text-slate-300 font-semibold">{s.city} : {s.time}</span>
                <span
                  className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                    s.status === 'OPEN'
                      ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-700/50'
                      : s.status === 'STATUS'
                      ? 'text-slate-400 bg-slate-900 border border-slate-700'
                      : 'text-pink-400 bg-pink-950/60 border border-pink-700/50'
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Custom Branding */}
          <div className="flex items-center justify-between pt-1 border-t border-[#152a55]/60 text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cop-gold animate-pulse" />
              <span className="text-cop-gold font-bold tracking-widest">COP TAH MATRIX SYSTEM</span>
            </div>
            <span className="text-cyan-400 text-[10px] font-semibold">House Of Gold · Multi-TF Confluence</span>
          </div>
        </div>
      </div>
    </div>
  );
}

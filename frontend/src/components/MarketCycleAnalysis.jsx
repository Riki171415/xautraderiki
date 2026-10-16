import MarketSessionCycle from './MarketSessionCycle';
/**
 * MarketCycleAnalysis — Analisis Siklus Pasar & Alur Fraktal COP TAH
 *
 * Menampilkan angka nyata pasar langsung (Live Price, Open, High, Low, Pivot, R1, R2, S1, S2)
 * Dilengkapi dengan Analisa 2 Arah (Skenario A BUY Trend vs Skenario B SELL HSH Reversal)
 * serta Tabel Fraktal 7-Timeframe lengkap dengan angka riil tanpa istilah 'lilin'.
 */

import React, { useState } from 'react';
import {
  Compass,
  GitBranch,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  ChevronRight,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Repeat,
  TrendingUp,
  TrendingDown,
  Home,
  Target,
  Split,
  Shield
} from 'lucide-react';

export default function MarketCycleAnalysis({data,liveTick}) {
  const daily=data?.leak4RegMatrix?.tableRows?.find(r=>r.timeframe==='1d');
  const rs=data?.leak4RegMatrix?.rsColumns?.find(r=>r.timeframe==='1d');
  if(!data) return null;
  if(!daily || !rs) return <section className="cop-panel space-y-4"><h2 className="font-bold">Analisis Siklus Pasar</h2><MarketSessionCycle cycle={data.marketCycle} decimals={data.decimals}/><p className="text-xs text-amber-200">Plan harian ditahan: data D1/RS asli belum lengkap.</p></section>;
  return <MarketCycleDetails data={data} liveTick={liveTick}/>;
}
function MarketCycleDetails({ data, liveTick }) {
  if (!data) return null;

  const { marketCycle, subAlurCerita, multiTfDecision, leak4RegMatrix, broker, userModal = 10000, lotCalc, decimals = 3 } = data;
  const [activeTab, setActiveTab] = useState('cycle'); // 'cycle' | 'two-way' | 'fractal' | 'confluence'

  const currentPrice = liveTick?.bid ?? data?.ohlcv_N?.close;

  // ── Extract Daily Real Numbers from leak4RegMatrix ──────────────────────────
  const dailyRow = leak4RegMatrix?.tableRows?.find(
    (r) => r.timeframe === '1d' || r.label?.includes('DAILY') || r.label?.includes('JUMAT') || r.label?.includes('KAMIS') || r.label?.includes('RABU') || r.label?.includes('SELASA') || r.label?.includes('SENIN')
  );
  const dailyRS = leak4RegMatrix?.rsColumns?.find(
    (c) => c.timeframe === '1d' || c.label?.includes('DAILY')
  );

  const dOpen = parseFloat(dailyRow.openN);
  const dOpenB = parseFloat(dailyRow.openB);
  const dHigh = parseFloat(dailyRow.highN);
  const dLow = parseFloat(dailyRow.lowN);
  const dRange = dHigh - dLow;

  const dPivot = parseFloat(dailyRS.pivot);
  const dRes1 = parseFloat(dailyRS.res1);
  const dRes2 = parseFloat(dailyRS.res2);
  const dRes3 = parseFloat(dailyRS.res3);
  const dSup1 = parseFloat(dailyRS.sup1);
  const dSup2 = parseFloat(dailyRS.sup2);
  const dSup3 = parseFloat(dailyRS.sup3);

  const isDailyUp = dOpen > dOpenB;
  const dailyTrend = dOpen === dOpenB ? 'NEUTRAL' : isDailyUp ? 'UP' : 'DOWN';

  // Lot Calculation (3 Core Theories)
  const lot = lotCalc?.lot || (userModal / 25000).toFixed(2);

  // ── SKENARIO 2 ARAH SIKLUS HARIAN (INTRADAY) ──────────────────────────────
  // Skenario A: BUY Trend Intraday (Busur Sesi Pagi di S1)
  const trendEntry = isDailyUp ? dSup1 : dRes1;
  const trendTp1 = dPivot;
  const trendTp2 = isDailyUp ? dRes1 : dSup1;
  const trendTp3 = isDailyUp ? dRes2 : dSup2;
  const trendSl = isDailyUp ? dSup2 : dRes2;

  const trendTp1Pts = Math.abs(trendTp1 - trendEntry).toFixed(decimals);
  const trendTp2Pts = Math.abs(trendTp2 - trendEntry).toFixed(decimals);
  const trendSlPts = Math.abs(trendEntry - trendSl).toFixed(decimals);
  const trendRr = parseFloat(trendSlPts) > 0 ? (parseFloat(trendTp2Pts) / parseFloat(trendSlPts)).toFixed(2) : '2.50';

  const trendProfitTp1 = '—';
  const trendProfitTp2 = '—';
  const trendLossSl = '—';

  // Skenario B: SELL HSH Reversal Intraday (Jika Target R1/R2 Tercapai di Sesi Malam USA)
  const hshEntryPrimary = isDailyUp ? dRes1 : dSup1;
  const hshEntrySecondary = isDailyUp ? dRes2 : dSup2;
  const hshTp1 = dOpen; // Pulang ke Open Hari Ini
  const hshTp2 = dPivot; // Level RS tambahan, bukan rumah HSH
  const hshTp3 = isDailyUp ? dSup1 : dRes1; // Koreksi ke Lantai Busur
  const hshSl = isDailyUp ? dRes2 + 10 : dSup2 - 10;

  const hshTp1Pts = Math.abs(hshEntryPrimary - hshTp1).toFixed(decimals);
  const hshTp2Pts = Math.abs(hshEntryPrimary - hshTp2).toFixed(decimals);
  const hshTp3Pts = Math.abs(hshEntryPrimary - hshTp3).toFixed(decimals);
  const hshSlPts = Math.abs(hshSl - hshEntryPrimary).toFixed(decimals);
  const hshRr = parseFloat(hshSlPts) > 0 ? (parseFloat(hshTp1Pts) / parseFloat(hshSlPts)).toFixed(2) : '2.80';

  const hshProfitTp1 = '—';
  const hshProfitTp2 = '—';
  const hshProfitTp3 = '—';
  const hshLossSl = '—';

  // Only observed range touches; no order execution or chronological TP claim.
  const crossed = level => dLow <= level && dHigh >= level;
  const isTrendEntryTouched = crossed(trendEntry);
  const isTrendTp1Touched = crossed(trendTp1);
  const isTrendTp2Touched = crossed(trendTp2);
  const isHshEntryTouched = crossed(hshEntryPrimary);
  const isHshTp1Touched = crossed(hshTp1);
  const isHshTp2Touched = crossed(hshTp2);

  // ── Helper to Lookup Multi-TF Matrix Numbers for Fractal Table ─────────────
  const getTfNumbers = (tfKey) => {
    let row = null;
    let rs = null;

    if (tfKey === '1Y') {
      row = leak4RegMatrix?.tableRows?.find((r) => r.timeframe === '1Y');
      rs = leak4RegMatrix?.rsColumns?.find((c) => c.timeframe === '1Y');
    } else if (tfKey === '6M') {
      row = leak4RegMatrix?.tableRows?.find((r) => r.timeframe === '6M');
      rs = leak4RegMatrix?.rsColumns?.find((c) => c.timeframe === '6M');
    } else if (tfKey === '3M') {
      row = leak4RegMatrix?.tableRows?.find((r) => r.timeframe === '3M');
      rs = leak4RegMatrix?.rsColumns?.find((c) => c.timeframe === '3M');
    } else if (tfKey === '1M') {
      row = leak4RegMatrix?.tableRows?.find((r) => r.timeframe === '1M');
      rs = leak4RegMatrix?.rsColumns?.find((c) => c.timeframe === '1M');
    } else if (tfKey === '1w') {
      row = leak4RegMatrix?.tableRows?.find((r) => r.timeframe === '1w' || r.label?.includes('WEEK'));
      rs = leak4RegMatrix?.rsColumns?.find((c) => c.timeframe === '1w' || c.label?.includes('WEEK'));
    } else if (tfKey === '1d') {
      row = dailyRow;
      rs = dailyRS;
    } else if (tfKey === '4h') {
      row = leak4RegMatrix?.tableRows?.find((r) => r.timeframe === '4h');
      rs = leak4RegMatrix?.rsColumns?.find((c) => c.timeframe === '4h');
    } else if (tfKey === 'market' || tfKey === 'london') {
      row = leak4RegMatrix?.tableRows?.find((r) => r.timeframe === 'market');
      rs = leak4RegMatrix?.rsColumns?.find((c) => c.timeframe === 'market');
    } else if (tfKey === '1h') {
      row = leak4RegMatrix?.tableRows?.find((r) => r.timeframe === '1h');
      rs = leak4RegMatrix?.rsColumns?.find((c) => c.timeframe === '1h');
    }

    return {
      open: row ? parseFloat(row.openN) : null,
      low: row ? parseFloat(row.lowN) : null,
      high: row ? parseFloat(row.highN) : null,
      pivot: rs ? parseFloat(rs.pivot) : null,
      res1: rs ? parseFloat(rs.res1) : null,
      sup1: rs ? parseFloat(rs.sup1) : null,
      range: row ? Number(row.highN) - Number(row.lowN) : null,
    };
  };

  return (
    <div className="cop-panel space-y-4">
      {/* ── Top Header & Tab Navigation ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-cop-border pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-cop-gold shadow-glow-gold-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-white font-mono">Analisis Siklus Pasar & Alur Fraktal</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold uppercase">
                Metode COP TAH
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/50 font-bold uppercase flex items-center gap-1">
                <Split className="w-3 h-3 text-blue-400" /> Analisa 2 Arah Tersedia
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              12 Langkah Sesi Harian · Skenario 2 Arah (BUY & SELL HSH) · Angka Nyata Pasar Lengkap
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cop-card border border-cop-border self-start lg:self-auto shadow-sm flex-wrap">
          <button
            onClick={() => setActiveTab('cycle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'cycle'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-glow-gold-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Siklus 12 Sesi</span>
          </button>

          <button
            onClick={() => setActiveTab('two-way')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'two-way'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-glow-gold-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Split className="w-3.5 h-3.5 text-cop-gold" />
            <span>Analisa 2 Arah</span>
          </button>

          <button
            onClick={() => setActiveTab('fractal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'fractal'
                ? 'bg-cop-blue text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Sub-Alur Fraktal (Data Riil)</span>
          </button>

          <button
            onClick={() => setActiveTab('confluence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'confluence'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Keputusan Entry TF</span>
          </button>
        </div>
      </div>

      {/* ── BARIS RINGKASAN ANGKA REAL-TIME SIKLUS HARIAN (LIVE METRICS STRIP) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-mono text-xs">
        <div className="p-2.5 rounded-xl bg-cop-card border border-cop-border">
          <span className="text-[10px] text-slate-400 block uppercase">Harga Live</span>
          <span className="text-sm font-black text-white tabular-nums">${currentPrice.toFixed(decimals)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cop-card border border-cop-border">
          <span className="text-[10px] text-slate-400 block uppercase">Open Hari Ini</span>
          <span className="text-sm font-bold text-amber-300 tabular-nums">${dOpen.toFixed(decimals)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cop-card border border-cop-border">
          <span className="text-[10px] text-slate-400 block uppercase">Pivot Harian</span>
          <span className="text-sm font-bold text-cop-gold tabular-nums">${dPivot.toFixed(decimals)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cop-card border border-cop-border">
          <span className="text-[10px] text-slate-400 block uppercase">Target R1</span>
          <span className="text-sm font-bold text-emerald-400 tabular-nums">${dRes1.toFixed(decimals)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cop-card border border-cop-border">
          <span className="text-[10px] text-slate-400 block uppercase">Target R2</span>
          <span className="text-sm font-bold text-emerald-300 tabular-nums">${dRes2.toFixed(decimals)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cop-card border border-cop-border">
          <span className="text-[10px] text-slate-400 block uppercase">Lantai S1 (Busur)</span>
          <span className="text-sm font-bold text-blue-400 tabular-nums">${dSup1.toFixed(decimals)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cop-card border border-cop-border">
          <span className="text-[10px] text-slate-400 block uppercase">Lantai S2 (SL)</span>
          <span className="text-sm font-bold text-rose-400 tabular-nums">${dSup2.toFixed(decimals)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cop-card border border-cop-border">
          <span className="text-[10px] text-slate-400 block uppercase">Rentang Hari</span>
          <span className="text-sm font-black text-cop-cyan tabular-nums">{dRange.toFixed(1)} selisih harga</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: SIKLUS 12 LANGKAH PERGERAKAN MARKET DENGAN ANGKA LEVEL LENGKAP
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'cycle' && <MarketSessionCycle cycle={marketCycle} decimals={decimals} />}

      {activeTab === 'two-way' && dailyTrend === 'NEUTRAL' && <p className="text-sm text-amber-200">Open N sama dengan Open B. JIKA netral: tunggu arah sebelum membuat skenario.</p>}
      {activeTab === 'two-way' && dailyTrend !== 'NEUTRAL' && (
        <div className="space-y-4 font-mono">
          <div className="p-3.5 rounded-xl bg-cop-card border border-cop-border flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Split className="w-4 h-4 text-cop-gold" />
              <span className="font-bold text-white">Skenario 2 Arah · {data.symbol} · {data.broker?.name}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Lot Rekomendasi (Modal ${userModal.toLocaleString()}): <strong className="text-cop-gold">{lot} Lot</strong>
            </span>
          </div>

          <p className="text-[11px] text-slate-400">Level tersentuh berarti masuk rentang High–Low D1, bukan bukti order terisi atau target tercapai setelah entry. Selisih harga bukan jumlah pip broker.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* KARTU SKENARIO A: BUY TREND INTRADAY (BUSUR S1) */}
            <div className="p-5 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-950/20 via-cop-card to-slate-900 shadow-glow-green-sm space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-emerald-800/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                      SKENARIO A
                    </span>
                    <h3 className="text-base font-black text-white">
                      {isDailyUp ? 'BUY LIMIT' : 'SELL LIMIT'} @ ${trendEntry.toFixed(decimals)}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Sesuai Hukum JIKA {dailyTrend} harian. {isDailyUp ? 'Skenario Buy Limit menunggu busur ke S1.' : 'Skenario Sell Limit menunggu busur ke R1.'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase">Risk / Reward</span>
                  <span className="text-sm font-black text-emerald-400">1 : {trendRr}</span>
                </div>
              </div>

              {/* 4 Kotak Roadmap Target A */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  isTrendEntryTouched ? 'bg-amber-500/20 border-amber-400 shadow-glow-gold-sm' : 'bg-cop-surface border-cop-border'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-blue-400 font-bold">TITIK ENTRY</span>
                    {isTrendEntryTouched && (
                      <span className="text-[8px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-white tabular-nums">${trendEntry.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-400">{isDailyUp ? 'Support S1' : 'Resistance R1'}</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  isTrendTp1Touched ? 'bg-emerald-950/60 border-emerald-400' : 'bg-emerald-950/30 border-emerald-800/50'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-emerald-400 font-bold">TARGET 1 (PIVOT)</span>
                    {isTrendTp1Touched && (
                      <span className="text-[8px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ LEVEL TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-emerald-300 tabular-nums">${trendTp1.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-300">+{trendTp1Pts} selisih harga</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  isTrendTp2Touched ? 'bg-emerald-950/70 border-emerald-400 shadow-glow-green-sm' : 'bg-emerald-950/50 border-emerald-500/70 shadow-glow-green-sm'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-emerald-300 font-black">TARGET 2 ({isDailyUp ? 'R1' : 'S1'})</span>
                    {isTrendTp2Touched && (
                      <span className="text-[8px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ LEVEL TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-emerald-300 tabular-nums">${trendTp2.toFixed(decimals)}</div>
                  <span className="text-[9px] text-emerald-400 font-bold">+{trendTp2Pts} selisih harga</span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-700/60">
                  <span className="text-[10px] text-rose-400 font-bold block mb-0.5">STOP LOSS (S2)</span>
                  <div className="text-sm font-black text-rose-300 tabular-nums">${trendSl.toFixed(decimals)}</div>
                  <span className="text-[9px] text-rose-300">-{trendSlPts} selisih harga</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-cop-surface/80 border border-cop-border text-xs flex items-center justify-between text-slate-300">
                <span>🎯 Target 3 Runner: <strong className="text-white">${trendTp3.toFixed(decimals)}</strong> ({isDailyUp ? 'Resistance R2' : 'Support S2'})</span>
                <span className="text-slate-400 text-[11px]">Waktu: <strong className="text-cop-gold">Sesi Asia s/d Awal Eropa</strong></span>
              </div>
            </div>

            {/* KARTU SKENARIO B: SELL HSH REVERSAL (TARGET R1/R2 TERCAPAI) */}
            <div className="p-5 rounded-2xl border-2 border-rose-500/60 bg-gradient-to-br from-rose-950/20 via-cop-card to-slate-900 shadow-glow-red-sm space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-rose-800/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-rose-500 text-white">
                      SKENARIO B (2 ARAH)
                    </span>
                    <h3 className="text-base font-black text-white">
                      {isDailyUp ? 'SELL REVERSAL' : 'BUY REVERSAL'} @ ${hshEntryPrimary.toFixed(decimals)}
                    </h3>
                  </div>
                  <p className="text-xs text-rose-200/90 mt-1">
                    Skenario HSH menunggu reaksi di {isDailyUp ? 'R1/R2' : 'S1/S2'} (${hshEntryPrimary.toFixed(decimals)} / ${hshEntrySecondary.toFixed(decimals)}), dengan rumah di Open N D1. Rejection dan pembalikan belum otomatis terkonfirmasi. Pivot merupakan level RS terpisah.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase">Risk / Reward</span>
                  <span className="text-sm font-black text-rose-400">1 : {hshRr}</span>
                </div>
              </div>

              {/* 4 Kotak Roadmap Target B */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  isHshEntryTouched ? 'bg-amber-500/20 border-amber-400 shadow-glow-gold-sm' : 'bg-cop-surface border-rose-500/40'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-rose-400 font-bold">AREA ENTRY {isDailyUp ? 'SELL' : 'BUY'}</span>
                    {isHshEntryTouched && (
                      <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-white tabular-nums">${hshEntryPrimary.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-400">R1 ($${hshEntryPrimary.toFixed(0)}) - R2 ($${hshEntrySecondary.toFixed(0)})</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  isHshTp1Touched ? 'bg-rose-950/60 border-rose-400' : 'bg-rose-950/30 border-rose-800/50'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-rose-400 font-bold">TP 1 (OPEN HARI INI)</span>
                    {isHshTp1Touched && (
                      <span className="text-[8px] bg-rose-400 text-white font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ LEVEL TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-rose-300 tabular-nums">${hshTp1.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-300">+{hshTp1Pts} selisih harga</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  isHshTp2Touched ? 'bg-rose-950/70 border-rose-400 shadow-glow-red-sm' : 'bg-rose-950/50 border-rose-500/70 shadow-glow-red-sm'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-rose-300 font-black">RS TAMBAHAN (PIVOT)</span>
                    {isHshTp2Touched && (
                      <span className="text-[8px] bg-rose-400 text-white font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ LEVEL TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-rose-300 tabular-nums">${hshTp2.toFixed(decimals)}</div>
                  <span className="text-[9px] text-rose-400 font-bold">+{hshTp2Pts} selisih harga</span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-700/80">
                  <span className="text-[10px] text-rose-300 font-bold block mb-0.5">STOP LOSS (SL)</span>
                  <div className="text-sm font-black text-rose-200 tabular-nums">${hshSl.toFixed(decimals)}</div>
                  <span className="text-[9px] text-rose-300">-{hshSlPts} selisih harga</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-cop-surface/80 border border-cop-border text-xs flex items-center justify-between text-slate-300">
                <span>🎯 TP 3 Koreksi Dasar: <strong className="text-white">${hshTp3.toFixed(decimals)}</strong> ({isDailyUp ? 'Support S1' : 'Resistance R1'} / {hshTp3Pts} selisih harga)</span>
                <span className="text-slate-400 text-[11px]">Waktu Eksekusi: <strong className="text-rose-400">Sesi USA metode (20:00–04:00 WIB)</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: SUB-ALUR CERITA FRAKTAL (LENGKAP DENGAN DATA ANGKA PASAR)
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'fractal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-cop-card border border-emerald-500/40 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Jika Trend Utama NAIK:</span>
                <span className="text-emerald-400 font-bold text-sm">Hukum Jika UP</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block uppercase">Arah Pentangan Busur:</span>
                <span className="text-cop-gold font-bold text-sm">Hukum Busur DOWN 🏹</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cop-card border border-rose-500/40 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Jika Trend Utama TURUN:</span>
                <span className="text-rose-400 font-bold text-sm">Hukum Jika DOWN</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block uppercase">Arah Pentangan Busur:</span>
                <span className="text-cop-gold font-bold text-sm">Hukum Busur UP 🏹</span>
              </div>
            </div>
          </div>

          {/* Full Fractal Timetable across 7 Timeframes WITH REAL NUMBERS */}
          <div className="overflow-x-auto rounded-xl border border-cop-border">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-cop-card text-slate-400 uppercase text-[10px] tracking-wider border-b border-cop-border">
                  <th className="py-2.5 px-3">Timeframe Data</th>
                  <th className="py-2.5 px-3">Open N</th>
                  <th className="py-2.5 px-3">Lantai Busur (S1/Low)</th>
                  <th className="py-2.5 px-3">Pivot Ekuilibrium</th>
                  <th className="py-2.5 px-3">Plafon Target (R1/High)</th>
                  <th className="py-2.5 px-3">Rentang Data</th>
                  <th className="py-2.5 px-3">Hukum Jika</th>
                  <th className="py-2.5 px-3">Fase Live</th>
                  <th className="py-2.5 px-3">Progress Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cop-border/40 bg-cop-surface/40">
                {subAlurCerita?.allSchedules?.map((sched) => {
                  const nums = getTfNumbers(sched.tf);

                  const s1Val = nums.sup1 !== null ? nums.sup1 : nums.low;
                  const r1Val = nums.res1 !== null ? nums.res1 : nums.high;
                  const pivotVal = nums.pivot;

                  const isSupTouched = Boolean(
                    (s1Val !== null && nums.low !== null && nums.low <= s1Val) ||
                    (s1Val !== null && currentPrice <= s1Val)
                  );
                  const isPivotTouched = Boolean(
                    pivotVal !== null && (
                      (nums.high !== null && nums.low !== null && nums.high >= pivotVal && nums.low <= pivotVal) ||
                      Math.abs(currentPrice - pivotVal) <= 1.0
                    )
                  );
                  const isResTouched = Boolean(
                    (r1Val !== null && nums.high !== null && nums.high >= r1Val) ||
                    (r1Val !== null && currentPrice >= r1Val)
                  );

                  return (
                    <tr key={sched.tf} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap align-middle">
                        <div className="flex items-center gap-1.5">
                          <span className="text-cop-cyan font-bold">{sched.name}</span>
                        </div>
                      </td>

                      {/* Open N */}
                      <td className="py-2.5 px-3 font-bold text-amber-300 tabular-nums">
                        {nums.open !== null ? `$${nums.open.toFixed(decimals)}` : '—'}
                      </td>

                      {/* Lantai Busur (S1 / Low) */}
                      <td className={`py-2.5 px-3 font-bold tabular-nums transition-colors ${
                        isSupTouched ? 'bg-rose-950/40 text-rose-300' : 'text-blue-400'
                      }`}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isSupTouched && (
                            <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5 animate-pulse">
                              ✓ TERSENTUH
                            </span>
                          )}
                          <span>
                            {s1Val !== null ? `$${s1Val.toFixed(decimals)}` : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Pivot Ekuilibrium */}
                      <td className={`py-2.5 px-3 font-bold tabular-nums transition-colors ${
                        isPivotTouched ? 'bg-amber-500/20 text-amber-200' : 'text-cop-gold'
                      }`}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isPivotTouched && (
                            <span className="text-[8px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5 animate-pulse">
                              ✓ TERSENTUH
                            </span>
                          )}
                          <span>
                            {pivotVal !== null ? `$${pivotVal.toFixed(decimals)}` : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Plafon Target (R1 / High) */}
                      <td className={`py-2.5 px-3 font-bold tabular-nums transition-colors ${
                        isResTouched ? 'bg-emerald-950/40 text-emerald-300' : 'text-emerald-400'
                      }`}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isResTouched && (
                            <span className="text-[8px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5 animate-pulse">
                              ✓ TERSENTUH
                            </span>
                          )}
                          <span>
                            {r1Val !== null ? `$${r1Val.toFixed(decimals)}` : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Rentang Data Pts */}
                      <td className="py-2.5 px-3 font-mono text-slate-300 tabular-nums">
                        {nums.range !== null ? `${nums.range.toFixed(1)} selisih harga` : '—'}
                      </td>

                      {/* Hukum Jika */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            sched.jika === 'UP'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
                              : 'bg-rose-950/60 text-rose-300 border border-rose-600/40'
                          }`}
                        >
                          JIKA {sched.jika}
                        </span>
                      </td>

                      {/* Fase Live */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            sched.currentPhase === 'BUSUR'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                          }`}
                        >
                          {sched.currentPhase}
                        </span>
                      </td>

                      {/* Progress Waktu */}
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {sched.progress}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 4: KORELASI TF BESAR & TF KECIL
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'confluence' && (
        <div className="space-y-4 font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-2.5">
              <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cop-gold" />
                Timeframe Besar (HTF): <strong className="text-white">{multiTfDecision?.htf?.timeframe || 'D1'}</strong>
              </span>
              <div className="text-xs text-slate-300 leading-relaxed">
                JIKA: <strong className="text-emerald-400">{multiTfDecision?.htf?.jika || '—'}</strong> · MOVE: <strong className="text-cop-gold">{multiTfDecision?.htf?.move || '—'}</strong>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-cop-border/60 pt-2 flex items-center justify-between">
                <span>Open D1: <strong className="text-white">${dOpen.toFixed(decimals)}</strong></span>
                <span>Pivot D1: <strong className="text-cop-gold">${dPivot.toFixed(decimals)}</strong></span>
                <span>R1: <strong className="text-emerald-400">${dRes1.toFixed(decimals)}</strong></span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-2.5">
              <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cop-cyan" />
                Timeframe Kecil (LTF): <strong className="text-white">{multiTfDecision?.ltf?.timeframe || '1H'}</strong>
              </span>
              <div className="text-xs text-slate-300 leading-relaxed">
                JIKA: <strong className="text-rose-400">{multiTfDecision?.ltf?.jika || '—'}</strong> · MOVE: <strong className="text-cop-gold">{multiTfDecision?.ltf?.move || '—'}</strong>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-cop-border/60 pt-2 flex items-center justify-between">
                <span>Harga Live: <strong className="text-white">${currentPrice.toFixed(decimals)}</strong></span>
                <span>Support S1: <strong className="text-blue-400">${dSup1.toFixed(decimals)}</strong></span>
                <span>SL S2: <strong className="text-rose-400">${dSup2.toFixed(decimals)}</strong></span>
              </div>
            </div>
          </div>

          {/* 3 Pagar Pengaman */}
          <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              3 Pagar Pengaman COP TAH (Batas Toleransi Entry)
            </span>
            <div className="space-y-1.5">
              {multiTfDecision?.guardrails?.map((guard, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-cop-surface border border-cop-border text-xs text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{guard}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepCard({ step, isActive }) {
  const isCompleted = step.status === 'completed';

  return (
    <div
      className={`p-2.5 rounded-xl border transition-all ${
        isActive
          ? 'bg-amber-950/40 border-amber-500/80 shadow-glow-gold-sm ring-1 ring-amber-500/30'
          : isCompleted
          ? 'bg-cop-surface/50 border-cop-border/60'
          : 'bg-cop-surface/20 border-cop-border/30 opacity-70'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
              isActive
                ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                : isCompleted
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {step.step}
          </span>
          <span
            className={`text-xs font-mono font-bold line-clamp-1 ${
              isActive ? 'text-amber-300' : isCompleted ? 'text-slate-200' : 'text-slate-400'
            }`}
          >
            {step.title}
          </span>
        </div>
        {isActive && (
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 uppercase">
            AKTIF
          </span>
        )}
      </div>
      <p className="text-[11px] font-mono text-slate-400 leading-snug line-clamp-2 pl-7">{step.desc}</p>
    </div>
  );
}

/**
 * MultiTimeframeEntryPlanner — Rekomendasi Titik Entry Multi-Timeframe (5m, 15m, 30m, 1h, 4h, 1d)
 * Berdasarkan Konsep 3 Core Theories & 5 Hukum COP TAH dengan Peringatan & Rambu-Rambu Lengkap.
 *
 * TAMPILAN PER TIMEFRAME (FOCUSED VIEW):
 * Dirancang khusus agar pengguna tidak pusing dengan 6 kartu sekaligus dalam satu layar.
 * Pengguna dapat memilih satu timeframe fokus dengan navigasi tab cepat dan melihat seluruh tiket,
 * rambu-rambu, kalkulasi risiko, dan status sentuhan harga secara luas dan tertata elegan.
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Target,
  ShieldAlert,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Split,
  Eye,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  DollarSign,
  BookOpen,
  Globe,
  Anchor
} from 'lucide-react';

export default function MultiTimeframeEntryPlanner({ data, liveTick }) {
  // Available timeframes in chronological order
  const TF_ORDER = ['5m', '15m', '30m', '1h', '4h', '1d'];

  // Initialize selected timeframe from current active timeframe or default to '1h'
  const initialTf = data?.timeframe && TF_ORDER.includes(data.timeframe) ? data.timeframe : '1h';
  const [selectedTf, setSelectedTf] = useState(initialTf);
  const [copiedTf, setCopiedTf] = useState(null);

  // Sync if header timeframe changes and matches available TF
  useEffect(() => {
    if (data?.timeframe && TF_ORDER.includes(data.timeframe)) {
      setSelectedTf(data.timeframe);
    }
  }, [data?.timeframe]);

  if (!data) return null;

  const { entryRecommendations = [], broker, userModal = 10000, lotCalc, decimals = 3 } = data;
  const currentPrice = liveTick?.bid || data?.ohlcv_N?.close || NaN;

  // Selected recommendation object
  const currentRec = entryRecommendations.find((r) => r.tf === selectedTf) || entryRecommendations[0];

  if (!currentRec) return null;

  const currentIndex = TF_ORDER.indexOf(selectedTf);
  const prevTf = currentIndex > 0 ? TF_ORDER[currentIndex - 1] : null;
  const nextTf = currentIndex < TF_ORDER.length - 1 ? TF_ORDER[currentIndex + 1] : null;

  const isBuy = currentRec.busur.action === 'BUY LIMIT';
  const isSell = currentRec.busur.action === 'SELL LIMIT';
  const entryPrice = currentRec.busur.entryPrice;
  const tp1Price = currentRec.busur.tp1;
  const tp2Price = currentRec.busur.tp2;
  const distToEntry = Math.abs(currentPrice - entryPrice).toFixed(decimals);
  const isCopied = copiedTf === currentRec.tf;

  // Institutional Touch Detection for Entry Signal & TP Targets
  const crossed = level => Number.isFinite(level) && currentRec.lowN<=level && currentRec.highN>=level;
  const isEntryTouched = crossed(entryPrice);
  const isTp1Touched = crossed(tp1Price);
  const isTp2Touched = crossed(tp2Price);

  const handleCopyPlan = async (rec) => {
    const text =
      `📋 [SARAN ENTRY COP TAH — TIMEFRAME ${rec.name.toUpperCase()} (${rec.style.toUpperCase()})]\n` +
      `Asset: ${data.symbol || 'XAUUSD'} · Server: ${broker?.name || 'Exness'} (${broker?.server || 'MT5Real36'})\n` +
      `Harga Pasar Saat Ini: $${currentPrice.toFixed(decimals)}\n` +
      `──────────────────────────────────────────────\n` +
      `🎯 TIKET EKSEKUSI HUKUM BUSUR:\n` +
      `• Aksi: ${rec.busur.action} @ $${rec.busur.entryPrice.toFixed(decimals)}\n` +
      `• Target TP1 (Pivot): $${rec.busur.tp1.toFixed(decimals)} (+${rec.busur.tp1Points} satuan harga | Est +$${rec.busur.estProfitTp1})\n` +
      `• Target TP2 (Hukum Busur): $${rec.busur.tp2.toFixed(decimals)} (+${rec.busur.tp2Points} satuan harga | Est +$${rec.busur.estProfitTp2})\n` +
      `• Stop Loss: $${rec.busur.stopLoss.toFixed(decimals)} (-${rec.busur.slPoints} satuan harga | Est -$${rec.busur.estLossSl})\n` +
      `• Risk/Reward: ${rec.busur.riskReward}\n` +
      `• Rekomendasi Lot: ${lotCalc?.lot || '0.40'} Lot (Modal $${userModal.toLocaleString()})\n` +
      `──────────────────────────────────────────────\n` +
      `⚠️ RAMBU-RAMBU & PERINGATAN COP TAH:\n` +
      rec.warnings.map((w, i) => `${i + 1}. ${w}`).join('\n');

    await navigator.clipboard.writeText(text);
    setCopiedTf(rec.tf);
    setTimeout(() => setCopiedTf(null), 2500);
  };

  return (
    <div className="cop-panel space-y-5 font-mono">
      {/* ── 1. Top Header & Live Telemetry ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cop-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-cop-gold shadow-glow-gold-sm">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Saran Titik Entry Multi-Timeframe (Tampilan Per Timeframe)
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/50 uppercase">
              100% Sesuai Data Tabel
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 uppercase">
              Rambu-Rambu Lengkap
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Pilih timeframe di bawah untuk fokus pada satu rencana trading secara mendalam, rapi, dan tanpa distraksi.
          </p>
        </div>

        {/* Global Live Price Banner */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-cop-card to-slate-900 border-2 border-amber-500/70 shadow-glow-gold-sm self-start lg:self-auto text-xs">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold">Harga Pasar Live:</div>
            <div className="text-base font-black text-white tabular-nums">${currentPrice.toFixed(decimals)}</div>
          </div>
          <div className="border-l border-slate-700/80 pl-2.5 text-[10px] text-slate-400">
            <div>Modal: <strong className="text-cop-gold">${userModal.toLocaleString()}</strong></div>
            <div>Lot: <strong className="text-emerald-400">{lotCalc?.lot || '0.40'} Lot</strong></div>
          </div>
        </div>
      </div>

      {/* ── 2. Timeframe Selector Pills (Pilih Satu Timeframe Fokus) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-white uppercase text-[11px] tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cop-gold" />
            Pilih Timeframe Analisis:
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Klik tombol timeframe untuk mengganti tampilan
          </span>
        </div>

        {/* 6 Segmented Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {entryRecommendations.map((rec) => {
            const isActive = selectedTf === rec.tf;
            const recIsBuy = rec.busur.action === 'BUY LIMIT';
            const recEntry = rec.busur.entryPrice;
            const recTouched = Boolean(
              recIsBuy
                ? (currentPrice <= recEntry || (rec.lowN !== undefined && rec.lowN <= recEntry))
                : (currentPrice >= recEntry || (rec.highN !== undefined && rec.highN >= recEntry))
            );

            return (
              <button
                key={rec.tf}
                onClick={() => setSelectedTf(rec.tf)}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-start justify-between text-left relative overflow-hidden ${
                  isActive
                    ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 via-cop-card to-slate-900 shadow-glow-gold scale-[1.02]'
                    : 'border-cop-border/80 bg-cop-surface/80 hover:bg-cop-card hover:border-slate-600'
                }`}
              >
                {/* Active Indicator Top Bar */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 shadow-glow-gold" />
                )}

                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-xs font-black uppercase ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                    {rec.tf}
                  </span>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                    rec.jika.trend === 'UP'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600/40'
                      : 'bg-rose-950 text-rose-300 border-rose-600/40'
                  }`}>
                    {rec.jika.trend}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-white truncate w-full">
                  {rec.name}
                </div>

                <div className="flex items-center justify-between w-full mt-2 pt-1.5 border-t border-slate-800 text-[10px]">
                  <span className={`font-semibold ${recIsBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {recIsBuy ? 'BUY' : 'SELL'} @ ${rec.busur.entryPrice.toFixed(decimals > 2 ? 1 : 2)}
                  </span>
                  {recTouched ? (
                    <span className="text-[8px] bg-emerald-500 text-slate-950 px-1 py-0.2 rounded font-black flex items-center gap-0.5 animate-pulse shadow-sm">
                      <Zap className="w-2.5 h-2.5" /> HIT
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-mono">
                      {Math.abs(currentPrice - recEntry).toFixed(0)} satuan harga
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2.5. Tabel Matriks Status Sentuhan Harga di Setiap Timeframe ── */}
      <div className="border-2 border-cop-border rounded-2xl bg-cop-surface/90 overflow-hidden shadow-xl font-mono">
        <div className="p-3.5 bg-gradient-to-r from-slate-950 via-cop-card to-slate-900 border-b border-cop-border flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cop-gold" />
              Tabel Matriks Status Sentuhan Harga di Setiap Timeframe
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50">
              Deteksi Real-Time
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Tanda <strong className="text-emerald-400">✓ TERSENTUH</strong> menunjukkan harga telah menyentuh titik target pada periode ini
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cop-border">
                <th className="py-2.5 px-3 text-left">Timeframe</th>
                <th className="py-2.5 px-2">Arah JIKA & Pola</th>
                <th className="py-2.5 px-3">Titik Entry S1/R1</th>
                <th className="py-2.5 px-3">Status Sentuhan Entry</th>
                <th className="py-2.5 px-3">Target TP1 (Pivot)</th>
                <th className="py-2.5 px-3">Target TP2 (Busur)</th>
                <th className="py-2.5 px-3">Stop Loss</th>
                <th className="py-2.5 px-2">R : R</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cop-border/40">
              {entryRecommendations.map((rec) => {
                const isSelected = selectedTf === rec.tf;
                const recIsBuy = rec.busur.action === 'BUY LIMIT';
                const recEntry = rec.busur.entryPrice;
                const recTp1 = rec.busur.tp1;
                const recTp2 = rec.busur.tp2;
                const recDist = Math.abs(currentPrice - recEntry).toFixed(decimals);

                const touchedEntry = Boolean(
                  recIsBuy
                    ? (currentPrice <= recEntry || (rec.lowN !== undefined && rec.lowN <= recEntry))
                    : (currentPrice >= recEntry || (rec.highN !== undefined && rec.highN >= recEntry))
                );

                const touchedTp1 = Boolean(
                  recIsBuy
                    ? (currentPrice >= recTp1 || (rec.highN !== undefined && rec.highN >= recTp1))
                    : (currentPrice <= recTp1 || (rec.lowN !== undefined && rec.lowN <= recTp1))
                );

                const touchedTp2 = Boolean(
                  recIsBuy
                    ? (currentPrice >= recTp2 || (rec.highN !== undefined && rec.highN >= recTp2))
                    : (currentPrice <= recTp2 || (rec.lowN !== undefined && rec.lowN <= recTp2))
                );

                return (
                  <tr
                    key={rec.tf}
                    onClick={() => setSelectedTf(rec.tf)}
                    className={`cursor-pointer transition-all hover:bg-amber-500/[0.08] ${
                      isSelected ? 'bg-amber-500/15 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-left whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${
                          isSelected ? 'bg-amber-400 text-slate-950 font-black' : 'bg-cop-card text-white'
                        }`}>
                          {rec.tf.toUpperCase()}
                        </span>
                        <div>
                          <div className="text-white font-bold">{rec.name}</div>
                          <div className="text-[9px] text-slate-400">{rec.style}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-2">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                          rec.jika.trend === 'UP'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600/40'
                            : 'bg-rose-950 text-rose-300 border-rose-600/40'
                        }`}>
                          JIKA {rec.jika.trend}
                        </span>
                        <span className="text-[9px] text-slate-400">{rec.perahu.pattern}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 tabular-nums">
                      <div className="font-bold text-white">
                        <span className={recIsBuy ? 'text-emerald-400' : 'text-rose-400'}>
                          {recIsBuy ? 'BUY' : 'SELL'}
                        </span>{' '}
                        ${recEntry.toFixed(decimals)}
                      </div>
                      <span className="text-[9px] text-slate-400">{recIsBuy ? 'Support S1' : 'Resistance R1'}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      {touchedEntry ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] shadow-glow-green-sm animate-pulse">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>✓ TERSENTUH</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] border border-slate-700">
                          <Clock className="w-3 h-3 text-cop-cyan" />
                          <span>Sisa {recDist} satuan harga</span>
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 tabular-nums">
                      <div className="flex items-center justify-center gap-1">
                        {touchedTp1 && (
                          <span className="text-[8px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5 animate-pulse">
                            ✓ LEVEL TERSENTUH
                          </span>
                        )}
                        <span className={touchedTp1 ? 'text-emerald-300 font-black' : 'text-slate-300 font-bold'}>
                          ${recTp1.toFixed(decimals)}
                        </span>
                      </div>
                      <span className="text-[9px] text-emerald-400">+{rec.busur.tp1Points} satuan harga</span>
                    </td>

                    <td className="py-2.5 px-3 tabular-nums">
                      <div className="flex items-center justify-center gap-1">
                        {touchedTp2 && (
                          <span className="text-[8px] bg-purple-500 text-slate-950 px-1.5 py-0.2 rounded font-black shadow-sm flex items-center gap-0.5 animate-pulse">
                            LEVEL TERSENTUH
                          </span>
                        )}
                        <span className={touchedTp2 ? 'text-purple-300 font-black' : 'text-slate-300 font-bold'}>
                          ${recTp2.toFixed(decimals)}
                        </span>
                      </div>
                      <span className="text-[9px] text-cop-gold">+{rec.busur.tp2Points} satuan harga</span>
                    </td>

                    <td className="py-2.5 px-3 tabular-nums">
                      <span className="text-rose-400 font-bold">${rec.busur.stopLoss.toFixed(decimals)}</span>
                      <div className="text-[9px] text-slate-400">-{rec.busur.slPoints} satuan harga</div>
                    </td>

                    <td className="py-2.5 px-2">
                      <span className="text-[10px] font-bold text-cop-gold bg-cop-card px-1.5 py-0.5 rounded border border-cop-border">
                        {rec.busur.riskReward}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTf(rec.tf);
                        }}
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 shadow-glow-gold-sm font-black'
                            : 'bg-cop-card text-slate-300 border border-cop-border hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? 'Sedang Aktif' : 'Lihat Detail →'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Focused Cockpit View (Hanya Menampilkan 1 Timeframe Terpilih) ── */}
      <div className="bg-gradient-to-br from-cop-card via-cop-surface to-cop-card border-2 border-cop-border rounded-3xl p-5 lg:p-6 shadow-2xl space-y-6">
        {/* Navigation Bar between Timeframes */}
        <div className="flex items-center justify-between border-b border-cop-border/60 pb-3 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => prevTf && setSelectedTf(prevTf)}
              disabled={!prevTf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cop-border bg-cop-bg text-slate-300 hover:bg-cop-card disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{prevTf ? `TF ${prevTf.toUpperCase()}` : 'Batas Awal'}</span>
            </button>

            <button
              onClick={() => nextTf && setSelectedTf(nextTf)}
              disabled={!nextTf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cop-border bg-cop-bg text-slate-300 hover:bg-cop-card disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span>{nextTf ? `TF ${nextTf.toUpperCase()}` : 'Batas Akhir'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sedang Ditampilkan:</span>
            <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-glow-gold-sm">
              Timeframe {currentRec.name} ({currentRec.style})
            </span>
          </div>
        </div>

        {/* 2-Column Institutional Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── KOLOM KIRI (7 Kolom): Status, Posisi Harga & Tiket Order ── */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header Sinyal & Kategori */}
            <div className="flex items-center justify-between border-b border-cop-border/60 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border-2 font-black text-sm ${
                  isBuy
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-glow-green-sm'
                    : 'bg-rose-950 border-rose-500 text-rose-300 shadow-glow-red-sm'
                }`}>
                  {currentRec.tf.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{currentRec.name} · {currentRec.style}</h3>
                  <p className="text-xs text-slate-400">{currentRec.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-sm ${
                  currentRec.jika.trend === 'UP'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-glow-green-sm'
                    : 'bg-rose-950 border-rose-500 text-rose-300 shadow-glow-red-sm'
                }`}>
                  HUKUM JIKA {currentRec.jika.trend} · {currentRec.perahu.pattern}
                </span>
              </div>
            </div>

            {/* BANNER STATUS SENTUHAN HARGA & TARGET (BESAR & JELAS) */}
            {isTp2Touched ? (
              <div className="p-3.5 rounded-2xl bg-purple-950/70 border-2 border-purple-400 shadow-glow-purple flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2.5 text-purple-200 font-black text-sm">
                  <Sparkles className="w-5 h-5 text-purple-300 animate-spin" />
                  <span>🏆 TARGET UTAMA TP2 TERCAPAI LENGKAP</span>
                </div>
                <span className="text-xs bg-purple-500 text-slate-950 px-3 py-1 rounded-lg font-black shadow-md">
                  SELESAI (+{currentRec.busur.tp2Points} satuan harga)
                </span>
              </div>
            ) : isTp1Touched ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400 shadow-glow-green-sm flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2.5 text-emerald-200 font-black text-sm">
                  <Target className="w-5 h-5 text-emerald-300 animate-pulse" />
                  <span>🎯 TARGET PIVOT TP1 TERCAPAI</span>
                </div>
                <span className="text-xs bg-emerald-500 text-slate-950 px-3 py-1 rounded-lg font-black shadow-md">
                  AMANKAN SEBAGIAN
                </span>
              </div>
            ) : isEntryTouched ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/25 border-2 border-amber-400 text-amber-200 font-black shadow-glow-gold flex items-center justify-between text-xs font-mono animate-pulse">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
                  </span>
                  <span className="text-sm">⚡ HARGA TERSENTUH (SINYAL ENTRY TERPICU)!</span>
                </div>
                <span className="text-xs bg-amber-500 text-slate-950 px-3 py-1 rounded-lg font-black shadow-md">
                  ORDER AKTIF
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/80 text-slate-300 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-cop-cyan" />
                  <span>Menunggu Koreksi Sentuhan Harga:</span>
                </div>
                <span className="text-xs font-black text-cop-gold tabular-nums bg-cop-bg px-2.5 py-1 rounded-lg border border-cop-border">
                  Sisa {distToEntry} satuan harga ke Titik Entry
                </span>
              </div>
            )}

            {/* KOTAK INDIKATOR LOKASI HARGA LIVE */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-amber-500/60 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-cop-gold animate-ping" />
                  <span>Kotak Lokasi Harga Live Terkini:</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-sm tabular-nums shadow-sm">
                  ${currentPrice.toFixed(decimals)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800">
                <div className="bg-cop-surface/80 p-2 rounded-xl border border-cop-border/60">
                  <span className="text-[10px] text-slate-400 block">Open N ({currentRec.tf})</span>
                  <span className="font-bold text-white tabular-nums">${currentRec.openN.toFixed(decimals)}</span>
                </div>
                <div className="bg-cop-surface/80 p-2 rounded-xl border border-cop-border/60">
                  <span className="text-[10px] text-slate-400 block">Pivot Gravitasi</span>
                  <span className="font-bold text-cop-gold tabular-nums">${currentRec.rs.pivot.toFixed(decimals)}</span>
                </div>
                <div className="bg-cop-surface/80 p-2 rounded-xl border border-cop-border/60">
                  <span className="text-[10px] text-slate-400 block">Jarak ke Entry</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{distToEntry} satuan harga</span>
                </div>
                <div className="bg-cop-surface/80 p-2 rounded-xl border border-cop-border/60">
                  <span className="text-[10px] text-slate-400 block">Usia Periode</span>
                  <span className="font-bold text-cop-cyan">{currentRec.hsh.percentElapsed}%</span>
                </div>
              </div>
            </div>

            {/* TIKET EKSEKUSI PENDING ORDER (DATA RIIL TABEL) */}
            <div className="p-4 rounded-2xl bg-cop-surface/90 border-2 border-cop-border space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-cop-gold" />
                  Tiket Pending Order Resmi (Data Riil Matriks)
                </span>
                <span className="text-xs font-bold text-cop-gold bg-cop-card px-2.5 py-0.5 rounded-lg border border-cop-border">
                  R:R {currentRec.busur.riskReward}
                </span>
              </div>

              {/* Baris Entry */}
              <div className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                isEntryTouched
                  ? 'bg-amber-500/20 border-amber-400 shadow-glow-gold-sm font-bold'
                  : 'bg-cop-card border-cop-border'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    isBuy ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                  }`}>
                    {currentRec.busur.action}
                  </span>
                  <span className="text-slate-200 font-bold">{isBuy ? 'Support S1' : 'Resistance R1'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-white tabular-nums">
                    ${entryPrice.toFixed(decimals)}
                  </span>
                  {isEntryTouched ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded bg-emerald-500 text-slate-950 flex items-center gap-1 animate-pulse shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> TERSENTUH
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      MENUNGGU
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Kotak Target TP1, TP2, Runner & Stop Loss */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                {/* TP 1 */}
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold block">TP 1 (Pivot Amankan)</span>
                    <span className="text-sm font-black text-emerald-300 tabular-nums">${currentRec.busur.tp1.toFixed(decimals)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 block font-bold">+{currentRec.busur.tp1Points} satuan harga</span>
                    <span className="text-[10px] text-slate-400">(+${currentRec.busur.estProfitTp1})</span>
                  </div>
                </div>

                {/* TP 2 */}
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 shadow-glow-green-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-300 font-black block">TP 2 (Target Utama Busur)</span>
                    <span className="text-sm font-black text-emerald-300 tabular-nums">${currentRec.busur.tp2.toFixed(decimals)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-300 font-black block">+{currentRec.busur.tp2Points} satuan harga</span>
                    <span className="text-[10px] text-emerald-400 font-bold">(+${currentRec.busur.estProfitTp2})</span>
                  </div>
                </div>

                {/* TP 3 Runner */}
                <div className="p-2.5 rounded-xl bg-cop-card border border-cop-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-purple-300 font-bold block">TP 3 (Runner Trailing)</span>
                    <span className="text-sm font-bold text-white tabular-nums">${currentRec.busur.tp3.toFixed(decimals)}</span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono">Trailing SL</span>
                </div>

                {/* Stop Loss */}
                <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-600/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-rose-400 font-bold block">Stop Loss (Batas Risiko)</span>
                    <span className="text-sm font-black text-rose-300 tabular-nums">${currentRec.busur.stopLoss.toFixed(decimals)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-rose-400 block font-bold">-{currentRec.busur.slPoints} satuan harga</span>
                    <span className="text-[10px] text-rose-300">(-${currentRec.busur.estLossSl})</span>
                  </div>
                </div>
              </div>

              {/* Copy Plan Action Button */}
              <button
                onClick={() => handleCopyPlan(currentRec)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 border border-cop-border shadow-sm mt-2"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cop-gold" />}
                <span>{isCopied ? `Plan ${currentRec.name} Berhasil Disalin!` : `Salin Tiket Skenario ${currentRec.name}`}</span>
              </button>
            </div>
          </div>

          {/* ── KOLOM KANAN (5 Kolom): Rambu-Rambu & Peringatan Lengkap COP TAH ── */}
          <div className="lg:col-span-5 space-y-4">
            {/* Box Rambu-Rambu Keselamatan */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-amber-600/50 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider border-b border-amber-900/50 pb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Rambu-Rambu & Peringatan Wajib ({currentRec.tf.toUpperCase()})</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Patuhi rambu-rambu di bawah ini sebelum mengeksekusi order pada timeframe ini untuk menghindari jebakan likuiditas:
              </p>

              <div className="space-y-2 text-xs leading-relaxed text-slate-200">
                {currentRec.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-cop-surface/80 border border-cop-border/60 hover:border-amber-500/40 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-amber-500/40">
                      {idx + 1}
                    </span>
                    <span className="text-[11px]">{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box Edukasi Karakteristik Timeframe */}
            <div className="p-4 rounded-2xl bg-cop-surface border border-cop-border space-y-2.5 text-xs">
              <span className="text-cop-gold font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cop-gold" />
                Karakteristik Timeframe {currentRec.name}:
              </span>

              <div className="space-y-2 text-[11px] text-slate-300 pt-1">
                <div className="p-2 rounded-lg bg-cop-bg border border-cop-border/50">
                  <strong className="text-white block mb-0.5">Fungsi Utama:</strong>
                  {currentRec.category} — {currentRec.style}.
                </div>

                <div className="p-2 rounded-lg bg-cop-bg border border-cop-border/50">
                  <strong className="text-white block mb-0.5">Ketahanan Risiko:</strong>
                  Maksimal kerugian terukur ${currentRec.busur.estLossSl} dengan rasio reward ${currentRec.busur.estProfitTp2} (R:R {currentRec.busur.riskReward}).
                </div>

                <div className="p-2 rounded-lg bg-cop-bg border border-cop-border/50">
                  <strong className="text-white block mb-0.5">Sinkronisasi Tabel:</strong>
                  Titik masuk ${entryPrice.toFixed(decimals)} sinkron 100% dengan kolom {isBuy ? 'SUP_1' : 'RES_1'} pada Matriks Support & Resistance.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Alur Cerita Metode COP TAH & Hubungan Peta Global (Tahunan 2026 & Dekade 2021–2030) ── */}
        <div className="pt-4 border-t border-slate-800 space-y-3 font-mono">
          {/* Subtle Clean Header */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cop-surface border border-cop-border text-cop-gold shadow-sm">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Alur Cerita & Rasional Entry COP TAH</span>
                  <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-slate-800 text-cop-gold border border-slate-700">
                    TF {currentRec.tf.toUpperCase()}
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-cop-bg border border-cop-border text-slate-300">
                Dekade: <strong className="text-cop-cyan">2021–2030</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-cop-bg border border-cop-border text-slate-300">
                Makro: <strong className="text-cop-gold">2026 Q4</strong>
              </span>
            </div>
          </div>

          {/* 2-Column Institutional Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {/* ── KIRI: Rasional 5 Hukum COP TAH ── */}
            <div className="p-3.5 rounded-xl bg-cop-surface/60 border border-slate-800 space-y-3">
              {/* Header Card */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cop-gold" />
                  Rasional 5 Hukum COP TAH
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  R:R {currentRec.busur.riskReward}
                </span>
              </div>

              {/* Logika Hukum Busur (Hero Tag) */}
              <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                isBuy
                  ? 'bg-emerald-950/25 border-emerald-800/40 text-emerald-200'
                  : 'bg-rose-950/25 border-rose-800/40 text-rose-200'
              }`}>
                <div className="flex items-center justify-between font-black text-[10px] uppercase tracking-wider mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cop-gold" />
                    Logika Hukum Busur ({currentRec.busur.action}):
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cop-bg border border-slate-700 text-slate-300">
                    Anti-FOMO
                  </span>
                </div>
                <p className="text-[11px] font-sans font-medium text-slate-200 leading-snug">
                  {currentRec.coptahRationale?.whyEntryHere ||
                    `Menunggu harga menarik busur ke ${isBuy ? 'Support S1' : 'Resistance R1'} ($${entryPrice.toFixed(decimals)}) agar tidak FOMO di atas Pivot.`}
                </p>
              </div>

              {/* 3 Micro Metrics: JIKA, Perahu, HSH */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                {/* JIKA */}
                <div className="p-2 rounded-lg bg-cop-card/80 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">1. JIKA</span>
                    <span className={`text-[8px] font-black px-1 rounded ${
                      currentRec.jika.trend === 'UP' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                    }`}>
                      {currentRec.jika.trend}
                    </span>
                  </div>
                  <div className="text-white font-bold truncate">Arah {currentRec.jika.direction}</div>
                  <p className="text-[9px] text-slate-400 font-sans leading-tight">
                    Pijakan di {isBuy ? 'S1' : 'R1'}
                  </p>
                </div>

                {/* Perahu */}
                <div className="p-2 rounded-lg bg-cop-card/80 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">2. PERAHU</span>
                    <span className="text-[8px] font-bold px-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {currentRec.perahu.pattern}
                    </span>
                  </div>
                  <div className="text-white font-bold truncate">{currentRec.perahu.status}</div>
                  <p className="text-[9px] text-slate-400 font-sans leading-tight">
                    Kapasitas daya pacu
                  </p>
                </div>

                {/* HSH */}
                <div className="p-2 rounded-lg bg-cop-card/80 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">3. HSH</span>
                    <span className="text-[8px] font-bold px-1 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                      TP1
                    </span>
                  </div>
                  <div className="text-cop-gold font-bold tabular-nums">${currentRec.rs.pivot.toFixed(decimals)}</div>
                  <p className="text-[9px] text-slate-400 font-sans leading-tight">
                    Pivot RS (terpisah dari HSH)
                  </p>
                </div>
              </div>
            </div>

            {/* ── KANAN: Peta Fraktal Makro (2026 Q4 & Dekade) ── */}
            <div className="p-3.5 rounded-xl bg-cop-surface/60 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Header Card */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[11px] font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cop-cyan" />
                    Peta Fraktal Global (2026 Q4 & Dekade)
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                    Siklus Makro
                  </span>
                </div>

                {/* 3 Step Ribbon */}
                <div className="space-y-1.5 text-xs">
                  {/* Step 1: Dekade */}
                  <div className="p-2 rounded-lg bg-cop-card/80 border border-slate-800/80 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-950 text-cop-cyan flex items-center justify-center flex-shrink-0 text-[9px] font-black border border-cyan-800/60 mt-0.5">
                      1
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <strong className="text-white">Dekade 2021–2030</strong>
                        <span className="text-[9px] text-slate-400">Supercycle Emas</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">
                        {currentRec.globalMacroStoryline?.decadeCycle || 'Ekspansi makro 10 tahun dari dasar akumulasi $1,680–$1,800 ke rekor baru.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: 2026 Q4 */}
                  <div className="p-2 rounded-lg bg-cop-card/80 border border-slate-800/80 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-950 text-cop-gold flex items-center justify-center flex-shrink-0 text-[9px] font-black border border-amber-800/60 mt-0.5">
                      2
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <strong className="text-white">Tahun 2026 (Kuartal 4)</strong>
                        <span className="text-[9px] text-amber-400">Pasca ATH $5,240</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">
                        {currentRec.globalMacroStoryline?.year2026Phase || 'Konsolidasi & keseimbangan HSH di koridor $4,100–$4,250.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: TF Role */}
                  <div className="p-2 rounded-lg bg-cop-card/80 border border-slate-800/80 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-950 text-blue-300 flex items-center justify-center flex-shrink-0 text-[9px] font-black border border-blue-800/60 mt-0.5">
                      3
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <strong className="text-white">Peran Fraktal TF {currentRec.tf.toUpperCase()}</strong>
                        <span className="text-[9px] text-slate-400">{currentRec.style}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">
                        {currentRec.globalMacroStoryline?.fractalRole || 'Menjadi bagian gelombang fraktal yang selaras dengan siklus lebih besar.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Synthesis Pill */}
              <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-950/40 via-cop-card to-slate-900 border border-blue-500/30 flex items-center gap-2 text-[11px] text-slate-200">
                <Info className="w-3.5 h-3.5 text-cop-cyan flex-shrink-0" />
                <span className="font-sans font-medium text-[10px] leading-tight">
                  <strong className="text-white">Sintesis:</strong> {currentRec.globalMacroStoryline?.alignmentRecommendation || `Gunakan titik entry TF ${currentRec.tf} ini dengan disiplin risiko rasio ${currentRec.busur.riskReward}.`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

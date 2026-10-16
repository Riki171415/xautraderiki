/**
 * MultiTimeframeEntryPlanner — Rekomendasi Titik Entry Multi-Timeframe (5m, 15m, 30m, 1h, 4h, 1d)
 * Berdasarkan Konsep 3 Core Theories & 5 Hukum COP TAH dengan Peringatan & Rambu-Rambu Lengkap.
 * Semua titik entry 100% sinkron dengan data riil pada Tabel Matriks Support & Resistance.
 */

import React, { useState } from 'react';
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
  Info
} from 'lucide-react';

export default function MultiTimeframeEntryPlanner({ data, liveTick }) {
  const [selectedTfFilter, setSelectedTfFilter] = useState('ALL');
  const [copiedTf, setCopiedTf] = useState(null);

  if (!data) return null;

  const { entryRecommendations = [], broker, userModal = 10000, lotCalc, decimals = 3 } = data;
  const currentPrice = liveTick?.price || data?.ohlcv_N?.close || 4184.25;

  const handleCopyPlan = async (rec) => {
    const text =
      `📋 [SARAN ENTRY COP TAH — TIMEFRAME ${rec.name.toUpperCase()} (${rec.style.toUpperCase()})]\n` +
      `Asset: ${data.symbol || 'XAUUSD'} · Server: ${broker?.name || 'Exness'} (${broker?.server || 'MT5Real36'})\n` +
      `Harga Pasar Saat Ini: $${currentPrice.toFixed(decimals)}\n` +
      `──────────────────────────────────────────────\n` +
      `🎯 TIKET EKSEKUSI HUKUM BUSUR:\n` +
      `• Aksi: ${rec.busur.action} @ $${rec.busur.entryPrice.toFixed(decimals)}\n` +
      `• Target TP1 (Pivot): $${rec.busur.tp1.toFixed(decimals)} (+${rec.busur.tp1Points} pts | Est +$${rec.busur.estProfitTp1})\n` +
      `• Target TP2 (Hukum Busur): $${rec.busur.tp2.toFixed(decimals)} (+${rec.busur.tp2Points} pts | Est +$${rec.busur.estProfitTp2})\n` +
      `• Stop Loss: $${rec.busur.stopLoss.toFixed(decimals)} (-${rec.busur.slPoints} pts | Est -$${rec.busur.estLossSl})\n` +
      `• Risk/Reward: ${rec.busur.riskReward}\n` +
      `• Rekomendasi Lot: ${lotCalc?.lot || '0.40'} Lot (Modal $${userModal.toLocaleString()})\n` +
      `──────────────────────────────────────────────\n` +
      `⚠️ RAMBU-RAMBU & PERINGATAN COP TAH:\n` +
      rec.warnings.map((w, i) => `${i + 1}. ${w}`).join('\n');

    await navigator.clipboard.writeText(text);
    setCopiedTf(rec.tf);
    setTimeout(() => setCopiedTf(null), 2500);
  };

  const filteredRecs = selectedTfFilter === 'ALL'
    ? entryRecommendations
    : entryRecommendations.filter((r) => r.tf === selectedTfFilter);

  return (
    <div className="cop-panel space-y-5 font-mono">
      {/* ── 1. Top Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cop-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-cop-gold shadow-glow-gold-sm">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Saran Titik Entry Multi-Timeframe (5m, 15m, 30m, 1h, 4h, 1d)
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/50 uppercase">
              100% Sesuai Data Tabel
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 uppercase">
              Rambu-Rambu Lengkap
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Panduan entry bertingkat dari scalping mikro hingga swing harian dengan rambu peringatan Hukum JIKA, Perahu, Busur, dan HSH.
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

      {/* ── 2. Timeframe Filter Strip ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center gap-1.5 p-1 bg-cop-surface rounded-xl border border-cop-border text-xs flex-wrap">
          <button
            onClick={() => setSelectedTfFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedTfFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-glow-gold-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Timeframe (6 TF)
          </button>
          {entryRecommendations.map((rec) => (
            <button
              key={rec.tf}
              onClick={() => setSelectedTfFilter(rec.tf)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                selectedTfFilter === rec.tf
                  ? rec.jika.trend === 'UP'
                    ? 'bg-emerald-600 text-white shadow-glow-green-sm'
                    : 'bg-rose-600 text-white shadow-glow-red-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{rec.name}</span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-black ${rec.jika.trend === 'UP' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                {rec.jika.trend}
              </span>
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cop-gold" />
          <span>Titik entry diambil langsung dari level Support (S1) atau Resistance (R1) pada tabel.</span>
        </div>
      </div>

      {/* ── 3. Cards Grid (Multi-Timeframe Recommendations) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredRecs.map((rec) => {
          const isBuy = rec.busur.action === 'BUY LIMIT';
          const isSell = rec.busur.action === 'SELL LIMIT';
          const entryPrice = rec.busur.entryPrice;
          const tp1Price = rec.busur.tp1;
          const tp2Price = rec.busur.tp2;
          const distToEntry = Math.abs(currentPrice - entryPrice).toFixed(decimals);
          const isCopied = copiedTf === rec.tf;

          // Institutional Touch Detection for Entry Signal & TP Targets
          const isEntryTouched = isBuy
            ? (currentPrice <= entryPrice || (rec.lowN !== undefined && rec.lowN <= entryPrice))
            : (currentPrice >= entryPrice || (rec.highN !== undefined && rec.highN >= entryPrice));

          const isTp1Touched = isBuy
            ? (currentPrice >= tp1Price || (rec.highN !== undefined && rec.highN >= tp1Price))
            : (currentPrice <= tp1Price || (rec.lowN !== undefined && rec.lowN <= tp1Price));

          const isTp2Touched = isBuy
            ? (currentPrice >= tp2Price || (rec.highN !== undefined && rec.highN >= tp2Price))
            : (currentPrice <= tp2Price || (rec.lowN !== undefined && rec.lowN <= tp2Price));

          return (
            <div
              key={rec.tf}
              className={`cop-card p-4 rounded-2xl border-2 flex flex-col justify-between space-y-4 transition-all duration-300 backdrop-blur-md shadow-card-elevated ${
                isEntryTouched
                  ? 'border-amber-400 bg-gradient-to-b from-amber-950/30 via-cop-card to-slate-900 shadow-glow-gold'
                  : isBuy
                  ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 via-cop-card to-slate-900 shadow-glow-green-sm'
                  : 'border-rose-500/50 bg-gradient-to-b from-rose-950/20 via-cop-card to-slate-900 shadow-glow-red-sm'
              }`}
            >
              <div className="space-y-3.5">
                {/* Header Card: TF Name & Category */}
                <div className="flex items-center justify-between border-b border-cop-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border font-black text-xs ${
                      isBuy
                        ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                        : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
                    }`}>
                      {rec.tf.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">{rec.name} · {rec.style}</h3>
                      <p className="text-[10px] text-slate-400">{rec.category}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    rec.jika.trend === 'UP'
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/90 border-rose-500 text-rose-300'
                  }`}>
                    JIKA {rec.jika.trend} · {rec.perahu.pattern}
                  </span>
                </div>

                {/* INDIKATOR STATUS SENTUHAN SINYAL ENTRY & TARGET */}
                {isTp2Touched ? (
                  <div className="p-2.5 rounded-xl bg-purple-950/70 border-2 border-purple-400 shadow-glow-purple flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-purple-200 font-black">
                      <Sparkles className="w-4 h-4 text-purple-300" />
                      <span>🏆 TARGET UTAMA TP2 TERCAPAI</span>
                    </div>
                    <span className="text-[10px] bg-purple-500 text-slate-950 px-2 py-0.5 rounded font-black shadow-sm">
                      SELESAI (+{rec.busur.tp2Points} pts)
                    </span>
                  </div>
                ) : isTp1Touched ? (
                  <div className="p-2.5 rounded-xl bg-emerald-950/70 border-2 border-emerald-400 shadow-glow-green-sm flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-emerald-200 font-black">
                      <Target className="w-4 h-4 text-emerald-300" />
                      <span>🎯 TARGET PIVOT TP1 TERCAPAI</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black shadow-sm">
                      AMANKAN SEBAGIAN
                    </span>
                  </div>
                ) : isEntryTouched ? (
                  <div className="p-2.5 rounded-xl bg-amber-500/25 border-2 border-amber-400 text-amber-200 font-black shadow-glow-gold flex items-center justify-between text-xs font-mono animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                      </span>
                      <span>⚡ HARGA TERSENTUH (SINYAL ENTRY TERPICU)</span>
                    </div>
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black shadow-sm">
                      ORDER AKTIF
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cop-cyan" />
                      <span>Menunggu Sentuhan Harga:</span>
                    </div>
                    <span className="text-[11px] font-bold text-cop-gold tabular-nums">
                      Sisa {distToEntry} pts
                    </span>
                  </div>
                )}

                {/* KOTAK INDIKATOR LOKASI HARGA SAAT INI */}
                <div className="p-3 rounded-xl bg-slate-950/90 border-2 border-amber-500/60 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cop-gold animate-ping" />
                      <strong className="text-white">Kotak Posisi Harga Live:</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black tabular-nums">
                      ${currentPrice.toFixed(decimals)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-800">
                    <span className="text-slate-400">
                      Open N: <strong className="text-white">${rec.openN.toFixed(decimals)}</strong>
                    </span>
                    <span className="text-slate-400 text-right">
                      Pivot: <strong className="text-cop-gold">${rec.rs.pivot.toFixed(decimals)}</strong>
                    </span>
                    <span className="text-slate-400">
                      Jarak ke Entry: <strong className="text-emerald-400 font-bold tabular-nums">{distToEntry} pts</strong>
                    </span>
                    <span className="text-slate-400 text-right">
                      Usia Periode: <strong className="text-cop-cyan">{rec.hsh.percentElapsed}%</strong>
                    </span>
                  </div>
                </div>

                {/* Tiket Eksekusi Saran Entry (Hukum Busur) */}
                <div className="p-3.5 rounded-xl bg-cop-surface/80 border border-cop-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Tiket Pending Order (Data Riil)
                    </span>
                    <span className="text-[11px] font-bold text-cop-gold">
                      R:R {rec.busur.riskReward}
                    </span>
                  </div>

                  {/* ENTRY ROW DENGAN TANDA TERSENTUH */}
                  <div className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                    isEntryTouched
                      ? 'bg-amber-500/20 border-amber-400 shadow-glow-gold-sm font-bold'
                      : 'bg-cop-card border-cop-border'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                        isBuy ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      }`}>
                        {rec.busur.action}
                      </span>
                      <span className="text-slate-300 font-semibold">{isBuy ? 'Support S1' : 'Resistance R1'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white tabular-nums">
                        ${entryPrice.toFixed(decimals)}
                      </span>
                      {isEntryTouched ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950 flex items-center gap-1 animate-pulse shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> TERSENTUH
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          MENUNGGU
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TP1 & TP2 & SL Grid */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-cop-card/50 text-[11px]">
                      <span className="text-emerald-400 font-semibold">TP 1 (Pivot Amankan Sebagian):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 tabular-nums">(+${rec.busur.estProfitTp1})</span>
                        <span className="font-bold text-emerald-300 tabular-nums">${rec.busur.tp1.toFixed(decimals)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-2 py-1 rounded bg-emerald-950/30 border border-emerald-600/40 text-[11px]">
                      <span className="text-emerald-300 font-bold">TP 2 (Target Utama Busur):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-400 font-black tabular-nums">(+${rec.busur.estProfitTp2})</span>
                        <span className="font-black text-emerald-300 tabular-nums">${rec.busur.tp2.toFixed(decimals)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-2 py-1 rounded bg-rose-950/30 border border-rose-600/40 text-[11px]">
                      <span className="text-rose-400 font-semibold">Stop Loss (Batas Risiko):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-rose-300 tabular-nums">(-${rec.busur.estLossSl})</span>
                        <span className="font-bold text-rose-300 tabular-nums">${rec.busur.stopLoss.toFixed(decimals)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RAMBU-RAMBU & WARNING COP TAH */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-600/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rambu-Rambu & Peringatan ({rec.tf})</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-300">
                    {rec.warnings.map((w, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-cop-surface/60 border border-cop-border/40">
                        <span className="text-amber-400 font-black">•</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Copy Plan Action Button */}
              <button
                onClick={() => handleCopyPlan(rec)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 border border-cop-border"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cop-gold" />}
                <span>{isCopied ? `Plan ${rec.name} Tersalin!` : `Salin Skenario ${rec.name}`}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

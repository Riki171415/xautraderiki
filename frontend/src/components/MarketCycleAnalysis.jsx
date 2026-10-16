/**
 * MarketCycleAnalysis — Analisis Pergerakan Market COP TAH
 *
 * 1. Pergerakan Market (NORMAL vs STRONG) — 12 Langkah Cerita Harian (Asia -> Eropa -> USA -> Transisi)
 * 2. Sub-Alur Cerita Fraktal (Hukum Busur & Target: 1Y, 6M, 3M, 1M, 1W, D1, H4)
 * 3. Korelasi TF Besar & TF Kecil (Keputusan Entry Aman & 3 Pagar Pengaman)
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
  Repeat
} from 'lucide-react';

export default function MarketCycleAnalysis({ data }) {
  if (!data) return null;

  const { marketCycle, subAlurCerita, multiTfDecision, decimals = 3 } = data;
  const [activeTab, setActiveTab] = useState('cycle'); // 'cycle' | 'fractal' | 'confluence'
  const [cycleViewMode, setCycleViewMode] = useState('auto'); // 'auto' | 'NORMAL' | 'STRONG'

  const currentPattern = marketCycle?.marketType || 'NORMAL';
  const displayPattern = cycleViewMode === 'auto' ? currentPattern : cycleViewMode;

  const isStrong = displayPattern === 'STRONG';
  const activeStep = marketCycle?.currentStep || 4;

  // Session icon helper
  const getSessionIcon = (session) => {
    if (session.includes('ASIA') || session.includes('Pagi')) return Sun;
    if (session.includes('EROPA') || session.includes('Sore')) return Sunset;
    if (session.includes('USA') || session.includes('Malam')) return Moon;
    return Repeat;
  };

  return (
    <div className="cop-panel space-y-5">
      {/* ── Top Header & Tab Navigation ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cop-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-cop-gold/10 border border-amber-500/30 text-cop-gold shadow-lg shadow-amber-950/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">Analisis Pergerakan Market</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cop-gold/15 text-cop-gold border border-cop-gold/40 font-semibold uppercase">
                Metode COP TAH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Siklus 12 Langkah Harian · Sub-Alur Fraktal Busur-Target · Matriks Keputusan Entry Aman
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cop-card border border-cop-border self-start md:self-auto">
          <button
            onClick={() => setActiveTab('cycle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'cycle'
                ? 'bg-cop-blue text-white shadow-md shadow-blue-900/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Siklus 12 Langkah</span>
          </button>
          <button
            onClick={() => setActiveTab('fractal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'fractal'
                ? 'bg-cop-blue text-white shadow-md shadow-blue-900/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Sub-Alur Fraktal</span>
          </button>
          <button
            onClick={() => setActiveTab('confluence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'confluence'
                ? 'bg-cop-blue text-white shadow-md shadow-blue-900/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Keputusan Entry TF</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: SIKLUS 12 LANGKAH PERGERAKAN MARKET (NORMAL vs STRONG)
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'cycle' && (
        <div className="space-y-4">
          {/* Status Bar: Pola Aktif & Toggle Mode */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cop-card to-slate-900/80 border border-cop-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-center ${
                  marketCycle?.bias === 'BEARISH'
                    ? 'bg-red-950/40 border-red-500/40 text-red-400'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                }`}
              >
                {marketCycle?.bias === 'BEARISH' ? (
                  <ArrowDownRight className="w-5 h-5" />
                ) : (
                  <ArrowUpRight className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Status Pola Hari Ini:
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      marketCycle?.marketType === 'STRONG'
                        ? 'bg-purple-950/60 border-purple-500/60 text-purple-300'
                        : 'bg-blue-950/60 border-blue-500/60 text-blue-300'
                    }`}
                  >
                    {marketCycle?.label || 'MARKET NORMAL BEARISH'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-600/30 font-bold">
                    Langkah {activeStep} / 12
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 font-mono flex items-center gap-2">
                  <span className="text-white font-bold">{marketCycle?.activeSession}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-cop-cyan font-bold">{marketCycle?.wibTime}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{marketCycle?.activeStepTitle}</span>
                </div>
              </div>
            </div>

            {/* Pattern Switcher (Auto / Normal / Strong) */}
            <div className="flex items-center gap-2 self-start lg:self-auto bg-cop-surface p-1 rounded-lg border border-cop-border">
              <span className="text-[10px] font-mono text-slate-500 px-2 uppercase">Lihat Pola:</span>
              <button
                onClick={() => setCycleViewMode('auto')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                  cycleViewMode === 'auto'
                    ? 'bg-cop-gold/20 text-cop-gold border border-cop-gold/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Otomatis ({currentPattern})
              </button>
              <button
                onClick={() => setCycleViewMode('NORMAL')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                  cycleViewMode === 'NORMAL'
                    ? 'bg-blue-950 text-blue-300 border border-blue-600/50 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pola NORMAL
              </button>
              <button
                onClick={() => setCycleViewMode('STRONG')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                  cycleViewMode === 'STRONG'
                    ? 'bg-purple-950 text-purple-300 border border-purple-600/50 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pola STRONG
              </button>
            </div>
          </div>

          {/* Core Rule Comparison Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cop-border/80 flex items-start gap-3 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-cop-cyan flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white font-mono">
                {isStrong ? '⚡ Karakteristik Pasar STRONG:' : '📐 Karakteristik Pasar NORMAL:'}
              </span>
              <p className="text-slate-300 font-mono text-[11px]">
                {isStrong ? (
                  <>
                    Pada pasar <strong className="text-purple-300">STRONG</strong>, harga High hari langsung dikunci di{' '}
                    <strong className="text-amber-300">Sesi Pagi (ASIA)</strong> dan tidak tertembus lagi. Pasar Sore
                    (Eropa) gagal membuat High baru (High Eropa &lt; High Asia), lalu langsung terjun mengejar Low baru
                    tanpa koreksi signifikan.
                  </>
                ) : (
                  <>
                    Pada pasar <strong className="text-blue-300">NORMAL</strong>, setelah sesi Asia membentuk Low &
                    High awal, <strong className="text-amber-300">Sesi Sore (EROPA)</strong> akan menembus High Asia
                    untuk mengunci harga <strong className="text-emerald-300">HIGH cerita keseluruhan hari</strong>. Baru
                    kemudian di <strong className="text-purple-300">Sesi USA</strong> harga ditekuk turun menembus Low
                    Eropa untuk membentuk <strong className="text-red-300">LOW cerita keseluruhan hari</strong>.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 12-Step Grid Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Phase 1: Pasar Pagi ASIA (Steps 1-4) */}
            <div className="p-3.5 rounded-xl bg-cop-card/70 border border-cop-border flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                    1. Pasar Pagi (ASIA)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-cop-surface px-1.5 py-0.5 rounded border border-cop-border">
                  06:00 - 14:00 WIB
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {marketCycle?.steps?.slice(0, 4).map((s) => (
                  <StepCard key={s.step} step={s} isActive={s.step === activeStep} />
                ))}
              </div>
            </div>

            {/* Phase 2: Pasar Sore EROPA (Steps 5-7) */}
            <div className="p-3.5 rounded-xl bg-cop-card/70 border border-cop-border flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <Sunset className="w-4 h-4 text-cop-cyan" />
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                    2. Pasar Sore (EROPA)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-cop-surface px-1.5 py-0.5 rounded border border-cop-border">
                  14:00 - 20:00 WIB
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {marketCycle?.steps?.slice(4, 7).map((s) => (
                  <StepCard key={s.step} step={s} isActive={s.step === activeStep} />
                ))}
              </div>
            </div>

            {/* Phase 3: Pasar Malam USA (Steps 8-11) */}
            <div className="p-3.5 rounded-xl bg-cop-card/70 border border-cop-border flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                    3. Pasar Malam (USA)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-cop-surface px-1.5 py-0.5 rounded border border-cop-border">
                  20:00 - 04:00 WIB
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {marketCycle?.steps?.slice(7, 11).map((s) => (
                  <StepCard key={s.step} step={s} isActive={s.step === activeStep} />
                ))}
              </div>
            </div>

            {/* Phase 4: Transisi & Siklus Mingguan (Step 12) */}
            <div className="p-3.5 rounded-xl bg-cop-card/70 border border-cop-border flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                    4. Transisi Esok Hari
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-cop-surface px-1.5 py-0.5 rounded border border-cop-border">
                  04:00 - 06:00 WIB
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {marketCycle?.steps?.slice(11, 12).map((s) => (
                  <StepCard key={s.step} step={s} isActive={s.step === activeStep} />
                ))}
                <div className="p-3 rounded-lg bg-cop-surface/80 border border-cop-border text-[11px] font-mono text-slate-400 leading-relaxed mt-2">
                  <span className="text-amber-400 font-bold block mb-1">💡 Catatan Kunci Siklus:</span>
                  Cerita pergerakan ini berulang setiap hari secara harmonis hingga target High dan Low mingguan
                  terpenuhi.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: SUB-ALUR CERITA FRAKTAL (BUSUR VS TARGET)
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'fractal' && (
        <div className="space-y-4">
          {/* Fundamental Golden Rule */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-cop-card to-slate-900 border border-amber-600/40">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cop-gold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Hukum Dasar Sub-Alur Cerita COP TAH</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-cop-surface border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Jika Trend Utama NAIK:</span>
                  <span className="text-emerald-400 font-bold text-sm">Hukum Jika UP</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block uppercase">Arah Pentangan Busur:</span>
                  <span className="text-amber-400 font-bold text-sm">Hukum Busur DOWN 🏹</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cop-surface border border-red-500/30 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Jika Trend Utama TURUN:</span>
                  <span className="text-red-400 font-bold text-sm">Hukum Jika DOWN</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block uppercase">Arah Pentangan Busur:</span>
                  <span className="text-amber-400 font-bold text-sm">Hukum Busur UP 🏹</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Timeframe Focus Indicator */}
          {subAlurCerita?.activeSchedule && (
            <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Timeframe Aktif Anda:
                  </span>
                  <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-cop-blue/20 border border-cop-blue/40">
                    {subAlurCerita.activeSchedule.name}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      subAlurCerita.activeSchedule.currentPhase === 'BUSUR'
                        ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 animate-pulse'
                        : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                    }`}
                  >
                    Fase Saat Ini: {subAlurCerita.activeSchedule.currentPhase}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {subAlurCerita.activeSchedule.progress}
                </span>
              </div>

              {/* Progress split bar */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    subAlurCerita.activeSchedule.isCurrentBusur
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/20'
                      : 'bg-cop-surface/40 border-cop-border/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-400">🏹 FASE 1: BUSUR (Pentangan)</span>
                    {subAlurCerita.activeSchedule.isCurrentBusur && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-black font-bold">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-200">{subAlurCerita.activeSchedule.busurRule}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Waktu: {subAlurCerita.activeSchedule.busurTime}</div>
                </div>

                <div
                  className={`p-3 rounded-lg border transition-all ${
                    !subAlurCerita.activeSchedule.isCurrentBusur
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                      : 'bg-cop-surface/40 border-cop-border/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-400">🎯 FASE 2: TARGET & HSH</span>
                    {!subAlurCerita.activeSchedule.isCurrentBusur && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500 text-black font-bold">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-200">{subAlurCerita.activeSchedule.targetRule}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Waktu: {subAlurCerita.activeSchedule.targetTime}</div>
                </div>
              </div>
            </div>
          )}

          {/* Full Fractal Timetable across all 7 Timeframes */}
          <div className="overflow-x-auto rounded-xl border border-cop-border">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-cop-card/80 border-b border-cop-border text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Timeframe</th>
                  <th className="py-2.5 px-3">Hukum Jika</th>
                  <th className="py-2.5 px-3">Fase 1: Busur (Pentangan)</th>
                  <th className="py-2.5 px-3">Fase 2: Target (Pelepasan)</th>
                  <th className="py-2.5 px-3">Fase Live</th>
                  <th className="py-2.5 px-3">Progress Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cop-border/40 bg-cop-surface/40">
                {subAlurCerita?.allSchedules?.map((sched) => (
                  <tr key={sched.tf} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                      <span className="text-cop-cyan">{sched.name}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          sched.jika === 'UP'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
                            : 'bg-red-950/60 text-red-300 border border-red-600/40'
                        }`}
                      >
                        JIKA {sched.jika}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-amber-300/90 text-[11px]">
                      <div>{sched.busurRule}</div>
                      <div className="text-[10px] text-slate-500">{sched.busurTime}</div>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-300/90 text-[11px]">
                      <div>{sched.targetRule}</div>
                      <div className="text-[10px] text-slate-500">{sched.targetTime}</div>
                    </td>
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
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{sched.progress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: KORELASI TF BESAR & TF KECIL (KEPUTUSAN ENTRY AMAN)
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'confluence' && (
        <div className="space-y-4">
          {/* Confluence Narrative Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TF Besar Card */}
            <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-3">
              <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cop-blue" />
                  Timeframe Besar (HTF)
                </span>
                <span className="text-xs font-mono font-bold text-cop-gold px-2 py-0.5 rounded bg-cop-surface border border-cop-border">
                  {multiTfDecision?.htf?.timeframe || 'D1'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-cop-surface border border-cop-border/50">
                  <span className="text-[10px] text-slate-500 block">HUKUM JIKA:</span>
                  <span
                    className={`font-bold ${
                      multiTfDecision?.htf?.jika === 'UP' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    JIKA {multiTfDecision?.htf?.jika || 'UP'}
                  </span>
                </div>
                <div className="p-2 rounded bg-cop-surface border border-cop-border/50">
                  <span className="text-[10px] text-slate-500 block">HUKUM MOVE:</span>
                  <span className="font-bold text-amber-400">{multiTfDecision?.htf?.move || 'NRL DWN'}</span>
                </div>
              </div>

              {/* Levels TF Besar */}
              <div className="space-y-1 text-[11px] font-mono pt-1">
                <div className="flex justify-between text-slate-400">
                  <span>Resistance R1 HTF:</span>
                  <span className="text-orange-400 font-bold">${multiTfDecision?.htf?.r1 || '—'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pivot HTF:</span>
                  <span className="text-white font-bold">${multiTfDecision?.htf?.pivot || '—'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Support S1 HTF:</span>
                  <span className="text-pink-400 font-bold">${multiTfDecision?.htf?.s1 || '—'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Low Before HTF:</span>
                  <span className="text-red-400 font-bold">${multiTfDecision?.htf?.lowBefore || '—'}</span>
                </div>
              </div>
            </div>

            {/* TF Kecil Card */}
            <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-3">
              <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cop-cyan" />
                  Timeframe Kecil (LTF)
                </span>
                <span className="text-xs font-mono font-bold text-cop-cyan px-2 py-0.5 rounded bg-cop-surface border border-cop-border">
                  {multiTfDecision?.ltf?.timeframe || '1h'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-cop-surface border border-cop-border/50">
                  <span className="text-[10px] text-slate-500 block">HUKUM JIKA:</span>
                  <span
                    className={`font-bold ${
                      multiTfDecision?.ltf?.jika === 'UP' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    JIKA {multiTfDecision?.ltf?.jika || 'DOWN'}
                  </span>
                </div>
                <div className="p-2 rounded bg-cop-surface border border-cop-border/50">
                  <span className="text-[10px] text-slate-500 block">HUKUM MOVE:</span>
                  <span className="font-bold text-amber-400">{multiTfDecision?.ltf?.move || 'NRL DWN'}</span>
                </div>
              </div>

              {/* Status Alur Cerita Sinkron */}
              <div className="p-3 rounded-lg bg-cop-surface/80 border border-cop-border text-xs font-mono leading-relaxed text-slate-300">
                <span className="text-cop-gold font-bold block mb-1">🔗 Sinkronisasi Alur Cerita:</span>
                {multiTfDecision?.correlationStatus ||
                  'Menghubungkan alur cerita pentangan Busur TF Besar dengan pergerakan candle TF Kecil.'}
              </div>
            </div>
          </div>

          {/* Decision Box (Keputusan Entry Aman) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cop-card via-slate-900 to-cop-card border border-cop-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cop-border/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white font-mono">Keputusan Entry yang Relatif Aman</span>
              </div>
              <div
                className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border self-start sm:self-auto ${
                  multiTfDecision?.signalColor === 'red'
                    ? 'bg-red-950/80 border-red-500 text-red-300'
                    : multiTfDecision?.signalColor === 'green'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-500 text-amber-300'
                }`}
              >
                {multiTfDecision?.safeEntryAction || 'STANDBY / WAIT'}
              </div>
            </div>

            {/* Guardrails (3 Pagar Pengaman) */}
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
                3 Pagar Pengaman COP TAH (Batas Toleransi Entry):
              </span>
              <div className="space-y-2">
                {multiTfDecision?.guardrails?.map((guard, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-cop-surface border border-cop-border/70 flex items-start gap-2.5 text-xs font-mono text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cop-cyan flex-shrink-0 mt-0.5" />
                    <span>{guard}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * StepCard Component — Individual step in 12-step daily market cycle
 */
function StepCard({ step, isActive }) {
  const isCompleted = step.status === 'completed';

  return (
    <div
      className={`p-2.5 rounded-lg border transition-all ${
        isActive
          ? 'bg-amber-950/30 border-amber-500/80 shadow-md shadow-amber-950/30 ring-1 ring-amber-500/30'
          : isCompleted
          ? 'bg-cop-surface/40 border-cop-border/60 opacity-80'
          : 'bg-cop-surface/20 border-cop-border/30 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
              isActive
                ? 'bg-amber-500 text-black animate-pulse'
                : isCompleted
                ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-600/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {step.step}
          </span>
          <span
            className={`text-xs font-mono font-semibold line-clamp-1 ${
              isActive ? 'text-amber-300 font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-400'
            }`}
          >
            {step.title}
          </span>
        </div>
        {isActive && (
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
            Aktif
          </span>
        )}
      </div>
      <p className="text-[11px] font-mono text-slate-400 leading-snug line-clamp-3 pl-6">{step.desc}</p>
    </div>
  );
}

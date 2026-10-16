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

  return (
    <div className="cop-panel space-y-4">
      {/* ── Top Header & Tab Navigation ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cop-border pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-cop-gold shadow-glow-gold-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white font-mono">Analisis Siklus Pasar & Alur Fraktal</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold uppercase">
                Metode COP TAH
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              12 Langkah Sesi Harian · Sub-Alur Pentangan Busur · Matriks Keputusan Entry Aman
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cop-card border border-cop-border self-start md:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab('cycle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'cycle'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-glow-gold-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Siklus 12 Langkah</span>
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
            <span>Sub-Alur Fraktal</span>
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

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: SIKLUS 12 LANGKAH PERGERAKAN MARKET (NORMAL vs STRONG)
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'cycle' && (
        <div className="space-y-4">
          {/* Status Bar: Pola Aktif & Toggle Mode */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cop-card to-slate-900 border border-cop-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-center ${
                  marketCycle?.bias === 'BEARISH'
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-400 shadow-glow-red-sm'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-glow-green-sm'
                }`}
              >
                {marketCycle?.bias === 'BEARISH' ? (
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Status Pola Hari Ini:
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      marketCycle?.marketType === 'STRONG'
                        ? 'bg-purple-950/70 border-purple-500/60 text-purple-300'
                        : 'bg-blue-950/70 border-blue-500/60 text-blue-300'
                    }`}
                  >
                    {marketCycle?.label || 'MARKET NORMAL BEARISH'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-600/40 font-bold">
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

            {/* Pattern Switcher */}
            <div className="flex items-center gap-2 self-start lg:self-auto bg-cop-surface p-1 rounded-xl border border-cop-border">
              <span className="text-[10px] font-mono text-slate-500 px-2 uppercase">Lihat Pola:</span>
              <button
                onClick={() => setCycleViewMode('auto')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  cycleViewMode === 'auto'
                    ? 'bg-amber-500/20 text-cop-gold border border-amber-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Otomatis ({currentPattern})
              </button>
              <button
                onClick={() => setCycleViewMode('NORMAL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  cycleViewMode === 'NORMAL'
                    ? 'bg-blue-950 text-blue-300 border border-blue-600/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pola NORMAL
              </button>
              <button
                onClick={() => setCycleViewMode('STRONG')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  cycleViewMode === 'STRONG'
                    ? 'bg-purple-950 text-purple-300 border border-purple-600/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pola STRONG
              </button>
            </div>
          </div>

          {/* 12-Step Grid Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Phase 1: ASIA (Steps 1-4) */}
            <div className="p-3.5 rounded-xl bg-cop-card/80 border border-cop-border space-y-2.5">
              <div className="flex items-center justify-between border-b border-cop-border pb-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase">1. Pagi (ASIA)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">06:00 - 14:00 WIB</span>
              </div>
              <div className="space-y-2">
                {marketCycle?.steps?.slice(0, 4).map((s) => (
                  <StepCard key={s.step} step={s} isActive={s.step === activeStep} />
                ))}
              </div>
            </div>

            {/* Phase 2: EROPA (Steps 5-7) */}
            <div className="p-3.5 rounded-xl bg-cop-card/80 border border-cop-border space-y-2.5">
              <div className="flex items-center justify-between border-b border-cop-border pb-2">
                <div className="flex items-center gap-2">
                  <Sunset className="w-4 h-4 text-cop-cyan" />
                  <span className="text-xs font-bold text-white font-mono uppercase">2. Sore (EROPA)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">14:00 - 20:00 WIB</span>
              </div>
              <div className="space-y-2">
                {marketCycle?.steps?.slice(4, 7).map((s) => (
                  <StepCard key={s.step} step={s} isActive={s.step === activeStep} />
                ))}
              </div>
            </div>

            {/* Phase 3: USA (Steps 8-11) */}
            <div className="p-3.5 rounded-xl bg-cop-card/80 border border-cop-border space-y-2.5">
              <div className="flex items-center justify-between border-b border-cop-border pb-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase">3. Malam (USA)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">20:00 - 04:00 WIB</span>
              </div>
              <div className="space-y-2">
                {marketCycle?.steps?.slice(7, 11).map((s) => (
                  <StepCard key={s.step} step={s} isActive={s.step === activeStep} />
                ))}
              </div>
            </div>

            {/* Phase 4: Transisi (Step 12) */}
            <div className="p-3.5 rounded-xl bg-cop-card/80 border border-cop-border space-y-2.5">
              <div className="flex items-center justify-between border-b border-cop-border pb-2">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase">4. Transisi Esok</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">04:00 - 06:00 WIB</span>
              </div>
              <div className="space-y-2">
                {marketCycle?.steps?.slice(11, 12).map((s) => (
                  <StepCard key={s.step} step={s} isActive={s.step === activeStep} />
                ))}
                <div className="p-2.5 rounded-lg bg-cop-surface border border-cop-border text-[11px] font-mono text-slate-300 leading-relaxed">
                  <span className="text-cop-gold font-bold block mb-1">💡 Siklus Harmonis:</span>
                  Pola ini berulang secara fraktal setiap hari sampai High dan Low mingguan terisi sempurna.
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

          {/* Full Fractal Timetable across 7 Timeframes */}
          <div className="overflow-x-auto rounded-xl border border-cop-border">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-cop-card text-slate-400 uppercase text-[10px] tracking-wider border-b border-cop-border">
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
                    <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className="text-cop-cyan">{sched.name}</span>
                      </div>
                    </td>
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
          TAB 3: KORELASI TF BESAR & TF KECIL
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'confluence' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-2.5">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cop-gold" />
                Timeframe Besar (HTF): <strong className="text-white">{multiTfDecision?.htf?.timeframe || 'D1'}</strong>
              </span>
              <div className="text-xs font-mono text-slate-300 leading-relaxed">
                JIKA: <strong className="text-emerald-400">{multiTfDecision?.htf?.jika || 'UP'}</strong> · MOVE: <strong className="text-cop-gold">{multiTfDecision?.htf?.move || 'NRL DWN'}</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-2.5">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cop-cyan" />
                Timeframe Kecil (LTF): <strong className="text-white">{multiTfDecision?.ltf?.timeframe || '1H'}</strong>
              </span>
              <div className="text-xs font-mono text-slate-300 leading-relaxed">
                JIKA: <strong className="text-rose-400">{multiTfDecision?.ltf?.jika || 'DOWN'}</strong> · MOVE: <strong className="text-cop-gold">{multiTfDecision?.ltf?.move || 'NRL DWN'}</strong>
              </div>
            </div>
          </div>

          {/* 3 Pagar Pengaman */}
          <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-2.5">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              3 Pagar Pengaman COP TAH (Batas Toleransi Entry)
            </span>
            <div className="space-y-1.5">
              {multiTfDecision?.guardrails?.map((guard, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-cop-surface border border-cop-border text-xs font-mono text-slate-300 flex items-start gap-2">
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

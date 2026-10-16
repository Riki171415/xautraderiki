/**
 * PendingOrders — Target & Pending Order (Hukum Busur)
 * Institutional Execution Ticket with Risk:Reward Visualizer & Preset Lot Calculator
 */
import {
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  DollarSign,
  Calculator,
  Target,
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Zap,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { updateModal } from '../hooks/useAnalysis';

export default function PendingOrders({ data, liveTick, onModalUpdate }) {
  const [modalInput, setModalInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderExecuted, setOrderExecuted] = useState(false);
  const [copiedPlan, setCopiedPlan] = useState(false);

  if (!data) return null;
  const { busur, rsMatrix, userModal, lotCalc, broker, ohlcv_N } = data;
  const decimals = data.decimals ?? (broker?.id !== 'BINANCE' ? 3 : 2);

  const isBuy = busur?.action === 'BUY LIMIT';
  const isSell = busur?.action === 'SELL LIMIT';

  // Live price & distance calculation
  const currentPrice = liveTick?.price || ohlcv_N?.close || 0;
  const entryPrice = busur?.entryPrice || 0;
  const liveDist = currentPrice && entryPrice ? Math.abs(currentPrice - entryPrice).toFixed(decimals) : busur?.distToEntry || '0.000';

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalInput || isNaN(modalInput)) return;
    setSubmitting(true);
    await updateModal(parseFloat(modalInput));
    setSubmitting(false);
    setModalInput('');
    if (onModalUpdate) onModalUpdate();
  };

  const handlePresetModal = async (amount) => {
    setSubmitting(true);
    await updateModal(amount);
    setSubmitting(false);
    if (onModalUpdate) onModalUpdate();
  };

  const handleExecuteOrder = () => {
    setOrderExecuted(true);
    setTimeout(() => setOrderExecuted(false), 5000);
  };

  const handleCopyPlan = async () => {
    if (!busur) return;
    const planText = `[COP TAH INSTITUTIONAL TRADE PLAN]\n` +
      `Asset: ${data.symbol || 'XAUUSD'} · Server: ${broker?.name || 'Exness'} (${broker?.server || 'MT5Real36'})\n` +
      `Action: ${busur.action} @ ${busur.entryPrice?.toFixed(decimals)}\n` +
      `────────────────────────────────\n` +
      `Target TP1 (Pivot): ${busur.tp1?.toFixed(decimals)} (+${busur.tp1Points} pts | Est +$${busur.estProfitTp1})\n` +
      `Target TP2 (Busur): ${busur.tp2?.toFixed(decimals)} (+${busur.tp2Points} pts | Est +$${busur.estProfitTp2})\n` +
      `Target TP3 (Runner): ${busur.tp3?.toFixed(decimals)} (Trailing Stop)\n` +
      `Stop Loss (SL): ${busur.stopLoss?.toFixed(decimals)} (-${busur.slPoints} pts | Est -$${busur.estLossSl})\n` +
      `Risk/Reward: ${busur.riskReward}\n` +
      `Rekomendasi Lot: ${lotCalc?.lot || '0.40'} Lot (Modal $${userModal?.toLocaleString() || '10,000'})`;

    await navigator.clipboard.writeText(planText);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);
  };

  return (
    <div className="cop-panel h-full flex flex-col justify-between space-y-4">
      {/* ── Ticket Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-cop-gold">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono">Target & Pending Order (Hukum Busur)</h2>
            <p className="text-[10px] text-slate-400 font-mono">Tiket Eksekusi & Manajemen Risiko</p>
          </div>
        </div>

        <span
          className={`text-xs font-mono font-black px-3 py-1 rounded-full border shadow-sm ${
            isBuy
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-glow-green-sm'
              : isSell
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-glow-red-sm'
              : 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-glow-gold-sm'
          }`}
        >
          {busur?.action || 'STANDBY'}
        </span>
      </div>

      {/* ── Main Signal Action Card ── */}
      <div
        className={`p-4 rounded-2xl border-2 transition-all duration-300 backdrop-blur-md shadow-card-elevated ${
          isBuy
            ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/30 via-cop-card to-slate-900 shadow-glow-green-sm'
            : isSell
            ? 'border-rose-500/60 bg-gradient-to-br from-rose-950/30 via-cop-card to-slate-900 shadow-glow-red-sm'
            : 'border-amber-600/40 bg-gradient-to-br from-amber-950/20 via-cop-card to-slate-900 shadow-glow-gold-sm'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {isBuy ? (
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-400 flex-shrink-0 animate-pulse">
              <ArrowUpCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
          ) : isSell ? (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-400 flex-shrink-0 animate-pulse">
              <ArrowDownCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/60 text-amber-400 flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between mb-1">
              <span
                className={`text-lg font-black font-mono tracking-tight ${
                  isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                {busur?.action} @ ${busur?.entryPrice?.toFixed(decimals) || '—'}
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                Jarak: <strong className="text-cop-gold font-bold tabular-nums">{liveDist} pts</strong>
              </span>
            </div>

            <div className="text-xs font-mono text-slate-200 mb-1 leading-relaxed">
              {busur?.instruction}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {busur?.rationale}
            </div>
          </div>
        </div>

        {/* Live Distance Meter Strip */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cop-cyan" />
            Harga Live: <strong className="text-white tabular-nums">${currentPrice.toFixed(decimals)}</strong>
          </span>
          <span className="text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cop-gold" />
            Titik Entry: <strong className="text-cop-gold tabular-nums">${entryPrice.toFixed(decimals)}</strong>
          </span>
          <span className="text-slate-400">
            Status: <strong className={isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-slate-400'}>
              {currentPrice > entryPrice ? (isBuy ? 'Menunggu Koreksi Turun' : 'Siap Terpanggil') : (isSell ? 'Menunggu Koreksi Naik' : 'Siap Terpanggil')}
            </strong>
          </span>
        </div>
      </div>

      {/* ── Target Roadmap & Risk Guardrails Table ── */}
      <div className="p-3.5 rounded-xl bg-cop-card/80 border border-cop-border space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
            Rencana Target & Batas Proteksi Risiko
          </span>
          <span className="text-xs font-mono text-slate-400 bg-cop-surface px-2 py-0.5 rounded-lg border border-cop-border">
            Risk:Reward <strong className="text-emerald-400 font-bold tabular-nums">{busur?.riskReward || '1 : 2.50'}</strong>
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          {/* ENTRY ROW */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-cop-surface border border-cop-border/60">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-600/50">
                ENTRY
              </span>
              <span className="font-semibold text-slate-300">Titik Masuk Pending Order</span>
            </div>
            <div className="text-right font-bold text-white tabular-nums">
              ${entryPrice.toFixed(decimals)}
            </div>
          </div>

          {/* TP1 ROW */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/60">
                TP 1
              </span>
              <span className="font-semibold text-emerald-300">Target Pivot (Amankan Sebagian)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-emerald-400 font-semibold tabular-nums">+{busur?.tp1Points} pts</span>
              <span className="text-[10px] text-slate-400 tabular-nums">(+$${busur?.estProfitTp1})</span>
              <span className="font-bold text-emerald-400 tabular-nums">${busur?.tp1?.toFixed(decimals) || '—'}</span>
            </div>
          </div>

          {/* TP2 ROW */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/60 shadow-glow-green-sm">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                TP 2
              </span>
              <span className="font-bold text-emerald-300">Target Utama (Hukum Busur)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-emerald-400 font-bold tabular-nums">+{busur?.tp2Points} pts</span>
              <span className="text-[10px] text-emerald-300 font-bold tabular-nums">(+$${busur?.estProfitTp2})</span>
              <span className="font-black text-emerald-300 tabular-nums">${busur?.tp2?.toFixed(decimals) || '—'}</span>
            </div>
          </div>

          {/* STOP LOSS ROW */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-700/50">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-900/70 text-rose-300 border border-rose-600/60">
                SL
              </span>
              <span className="font-semibold text-rose-300">Batas Proteksi Risiko (Stop Loss)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-rose-400 font-semibold tabular-nums">-{busur?.slPoints} pts</span>
              <span className="text-[10px] text-rose-300 tabular-nums">(-$${busur?.estLossSl})</span>
              <span className="font-bold text-rose-400 tabular-nums">${busur?.stopLoss?.toFixed(decimals) || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleExecuteOrder}
          disabled={!isBuy && !isSell}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs font-mono tracking-wider transition-all duration-200 border flex items-center justify-center gap-2 shadow-sm ${
            isBuy
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-400 shadow-glow-green-sm'
              : isSell
              ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border-rose-400 shadow-glow-red-sm'
              : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
          }`}
        >
          {isBuy ? '▲ SIMULASI BUY LIMIT' : isSell ? '▼ SIMULASI SELL LIMIT' : '◆ STANDBY'}
        </button>

        <button
          onClick={handleCopyPlan}
          className="btn-ghost justify-center py-2.5"
        >
          {copiedPlan ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cop-gold" />}
          <span>{copiedPlan ? 'Tersalin ke Clipboard!' : 'Salin Rencana Target'}</span>
        </button>
      </div>

      {/* ── Modal & Lot Calculator with Quick Presets ── */}
      <div className="p-3.5 rounded-xl bg-cop-card border border-cop-border space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-cop-gold" />
            <span className="text-xs font-bold text-white font-mono">Modal & Lot Calculator (3 Core Theories)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Rumus: Modal / 25,000</span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono bg-cop-surface px-3 py-2 rounded-lg border border-cop-border">
          <span className="text-slate-400">
            Modal Aktif: <strong className="text-cop-gold font-bold tabular-nums">${userModal?.toLocaleString() || '10,000'}</strong>
          </span>
          <span className="text-slate-400">
            Lot Rekomendasi: <strong className="text-emerald-400 font-bold tabular-nums">{lotCalc?.lot || '0.40'} Lot</strong>
          </span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Preset:</span>
          {[2000, 5000, 10000, 25000, 50000].map((amt) => (
            <button
              key={amt}
              onClick={() => handlePresetModal(amt)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                userModal === amt
                  ? 'bg-amber-500/20 text-cop-gold border-amber-500/50 font-bold'
                  : 'bg-cop-surface text-slate-400 border-cop-border hover:text-white'
              }`}
            >
              ${amt >= 1000 ? `${amt / 1000}k` : amt}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <form onSubmit={handleModalSubmit} className="flex gap-2">
          <input
            type="number"
            min="100"
            step="100"
            placeholder="Ketik nominal modal USD..."
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
            className="flex-1 bg-cop-surface border border-cop-border rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cop-gold"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-cop-blue hover:bg-blue-600 text-white transition-colors"
          >
            {submitting ? '...' : 'Update'}
          </button>
        </form>
      </div>
    </div>
  );
}

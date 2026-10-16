/**
 * PendingOrders — Bottom-Right: Pending Order triggers, Trade Target Plan (TP1, TP2, SL) & Risk Management
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

  const handleExecuteOrder = () => {
    setOrderExecuted(true);
    setTimeout(() => setOrderExecuted(false), 5000);
  };

  const handleCopyPlan = async () => {
    if (!busur) return;
    const planText = `[COP TAH TRADE PLAN]\n` +
      `Broker: ${broker?.name || 'Binance'}\n` +
      `Sinyal: ${busur.action} @ ${busur.entryPrice?.toFixed(decimals)}\n` +
      `Target TP1: ${busur.tp1?.toFixed(decimals)} (+${busur.tp1Points} pts | Est +$${busur.estProfitTp1})\n` +
      `Target TP2: ${busur.tp2?.toFixed(decimals)} (+${busur.tp2Points} pts | Est +$${busur.estProfitTp2})\n` +
      `Target TP3: ${busur.tp3?.toFixed(decimals)} (Runner)\n` +
      `Stop Loss (SL): ${busur.stopLoss?.toFixed(decimals)} (-${busur.slPoints} pts | Est -$${busur.estLossSl})\n` +
      `Risk/Reward: ${busur.riskReward}\n` +
      `Lot Rekomendasi: ${lotCalc?.lot || '0.40'} Lot (Modal $${userModal?.toFixed(2) || '10,000'})`;

    await navigator.clipboard.writeText(planText);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);
  };

  return (
    <div className="cop-panel h-full flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cop-gold" />
          <h2 className="text-sm font-bold text-white">Target & Pending Order (Hukum Busur)</h2>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
          isBuy
            ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
            : isSell
            ? 'bg-red-950/70 border-red-500/60 text-red-300'
            : 'bg-amber-950/70 border-amber-500/60 text-amber-300'
        }`}>
          {busur?.action || 'STANDBY'}
        </span>
      </div>

      {/* Main Signal Banner */}
      <div className={`p-3.5 rounded-xl border-2 transition-all duration-300 ${
        isBuy
          ? 'border-emerald-500/60 bg-emerald-950/30'
          : isSell
          ? 'border-red-500/60 bg-red-950/30'
          : 'border-amber-600/40 bg-amber-950/20'
      }`}>
        <div className="flex items-start gap-3">
          {isBuy ? (
            <ArrowUpCircle className="w-7 h-7 text-emerald-400 flex-shrink-0 mt-0.5 animate-pulse" />
          ) : isSell ? (
            <ArrowDownCircle className="w-7 h-7 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
          ) : (
            <AlertCircle className="w-7 h-7 text-amber-400 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className={`text-base font-black font-mono ${
                isBuy ? 'text-emerald-400' : isSell ? 'text-red-400' : 'text-amber-400'
              }`}>
                {busur?.action} @ {busur?.entryPrice?.toFixed(decimals) || '—'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Jarak: <strong className="text-cop-gold font-bold">{liveDist} pts</strong>
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300 mb-1 leading-relaxed">
              {busur?.instruction}
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              {busur?.rationale}
            </div>
          </div>
        </div>

        {/* Live Distance Meter */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cop-cyan" />
            Harga Live: <strong className="text-white">${currentPrice.toFixed(decimals)}</strong>
          </span>
          <span className="text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cop-gold" />
            Titik Entry: <strong className="text-cop-gold">${entryPrice.toFixed(decimals)}</strong>
          </span>
          <span className="text-slate-400">
            Status: <strong className={isBuy ? 'text-emerald-400' : isSell ? 'text-red-400' : 'text-slate-400'}>
              {currentPrice > entryPrice ? (isBuy ? 'Menunggu Penurunan' : 'Siap Sentuh') : (isSell ? 'Menunggu Kenaikan' : 'Siap Sentuh')}
            </strong>
          </span>
        </div>
      </div>

      {/* Target Roadmap Table (Tabel Sasaran Ambil Untung & Stop Loss) */}
      <div className="p-3 rounded-xl bg-cop-card border border-cop-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="section-title mb-0">Rencana Target & Batas Risiko</span>
          <span className="text-[10px] font-mono text-slate-500">
            R:R Ratio <strong className="text-emerald-400 font-bold">{busur?.riskReward || '1 : 2.50'}</strong>
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          {/* ENTRY ROW */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-cop-surface border border-cop-border">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-600/60">
                ENTRY
              </span>
              <span className="font-semibold text-slate-300">Titik Masuk Pending Order</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-white text-sm">${entryPrice.toFixed(decimals)}</span>
            </div>
          </div>

          {/* TP1 ROW */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/60">
                TARGET 1 (TP1)
              </span>
              <span className="font-semibold text-emerald-300">Pivot (Amankan Sebagian)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-emerald-400 font-semibold">+{busur?.tp1Points} pts</span>
              <span className="text-[10px] text-slate-400">(Est +${busur?.estProfitTp1})</span>
              <span className="font-bold text-emerald-400 text-sm">${busur?.tp1?.toFixed(decimals) || '—'}</span>
            </div>
          </div>

          {/* TP2 ROW */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-600/60 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-black font-black">
                TARGET 2 (TP2)
              </span>
              <span className="font-bold text-emerald-300">Target Utama (Hukum Busur)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-emerald-400 font-bold">+{busur?.tp2Points} pts</span>
              <span className="text-[10px] text-emerald-300 font-bold">(Est +${busur?.estProfitTp2})</span>
              <span className="font-black text-emerald-300 text-sm">${busur?.tp2?.toFixed(decimals) || '—'}</span>
            </div>
          </div>

          {/* TP3 ROW */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-cop-surface/70 border border-cop-border">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-600/60">
                TARGET 3 (TP3)
              </span>
              <span className="font-semibold text-slate-300">Runner (Trailing Stop)</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-purple-300 text-sm">${busur?.tp3?.toFixed(decimals) || '—'}</span>
            </div>
          </div>

          {/* STOP LOSS ROW */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-red-950/30 border border-red-700/50">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-900/70 text-red-300 border border-red-600/60">
                STOP LOSS (SL)
              </span>
              <span className="font-semibold text-red-300">Batas Proteksi Risiko</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-red-400 font-semibold">-{busur?.slPoints} pts</span>
              <span className="text-[10px] text-red-300">(Est -${busur?.estLossSl})</span>
              <span className="font-bold text-red-400 text-sm">${busur?.stopLoss?.toFixed(decimals) || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExecuteOrder}
          disabled={!isBuy && !isSell}
          className={`py-2.5 px-3 rounded-lg font-bold text-xs font-mono tracking-wider transition-all duration-200 border flex items-center justify-center gap-1.5 ${
            isBuy
              ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : isSell
              ? 'bg-red-700 hover:bg-red-600 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
          }`}
        >
          {isBuy ? '▲ PASANG BUY LIMIT' : isSell ? '▼ PASANG SELL LIMIT' : '◆ STANDBY'}
        </button>

        <button
          onClick={handleCopyPlan}
          className="btn-ghost text-xs justify-center font-mono py-2.5 border border-cop-border hover:border-cop-blue"
        >
          {copiedPlan ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingUp className="w-3.5 h-3.5 text-cop-cyan" />}
          <span>{copiedPlan ? 'Tersalin!' : 'Salin Rencana Target'}</span>
        </button>
      </div>

      {/* Execution Confirmation Toast */}
      {orderExecuted && (
        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Pending Order tercatat: <strong>{busur?.action} @ {entryPrice.toFixed(decimals)}</strong> | Target: <strong>{busur?.tp2?.toFixed(decimals)}</strong> | SL: <strong>{busur?.stopLoss?.toFixed(decimals)}</strong>
          </span>
        </div>
      )}

      {/* Modal / Lot Calculator */}
      <div className="p-3 rounded-lg bg-cop-card border border-cop-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-cop-gold" />
            <span className="section-title mb-0">Modal & Lot Calculator</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Rumus: Modal / 25,000</span>
        </div>

        <div className="text-xs font-mono text-slate-400 mb-2 flex items-center justify-between">
          <span>Modal: <strong className="text-cop-gold font-bold">${userModal?.toFixed(2) || '10,000.00'}</strong></span>
          <span>Lot Belajar: <strong className="text-emerald-400 font-bold">{lotCalc?.lot || '0.40'} Lot</strong></span>
        </div>

        <form onSubmit={handleModalSubmit} className="flex gap-2">
          <input
            type="number"
            min="100"
            step="100"
            placeholder="Ketik modal USD (cth: 10000)..."
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
            className="flex-1 bg-cop-surface border border-cop-border rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cop-blue"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cop-blue hover:bg-blue-600 text-white transition-colors"
          >
            {submitting ? '...' : 'UPDATE'}
          </button>
        </form>
      </div>
    </div>
  );
}

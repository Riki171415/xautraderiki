/**
 * OHLPanel — OHL Comparison Metrics (Current N vs Previous B)
 * Includes Intraday Candle Range Visualizer & Hukum JIKA Trend Status
 */
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Activity, Sparkles } from 'lucide-react';

function PriceDiff({ value, decimals = 2 }) {
  if (value === undefined || value === null) return <span className="text-slate-500 font-mono">—</span>;
  const isPos = value > 0;
  const isZero = Math.abs(value) < 0.001;
  return (
    <span
      className={`font-mono text-xs font-bold flex items-center justify-end gap-0.5 tabular-nums ${
        isZero ? 'text-slate-400' : isPos ? 'text-emerald-400' : 'text-rose-400'
      }`}
    >
      {isZero ? <Minus className="w-3 h-3" /> : isPos ? <ArrowUp className="w-3 h-3 stroke-[2.5]" /> : <ArrowDown className="w-3 h-3 stroke-[2.5]" />}
      {isZero ? '0.00' : `${isPos ? '+' : ''}${value.toFixed(decimals)}`}
    </span>
  );
}

function OHLMetric({ label, valueN, valueB, diff, decimals = 2, isLive = false, liveDirection = null }) {
  return (
    <div
      className={`cop-card flex-1 min-w-[200px] border transition-all duration-200 ${
        isLive
          ? 'bg-gradient-to-b from-cop-card to-slate-900/90 border-cop-gold/40 shadow-glow-gold-sm'
          : 'border-cop-border/80'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        {isLive && (
          <span className="flex items-center gap-1 text-[9px] font-mono font-extrabold text-cop-gold bg-amber-950/60 border border-amber-500/40 px-2 py-0.2 rounded-full uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cop-gold animate-ping" />
            Live
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] text-slate-400 font-mono mb-0.5">Data N (Saat Ini)</div>
          <div
            className={`calm-price text-xl lg:text-2xl font-black font-mono tracking-tight tabular-nums transition-colors ${
              isLive && liveDirection === 'UP'
                ? 'text-emerald-300'
                : isLive && liveDirection === 'DOWN'
                ? 'text-rose-300'
                : 'text-white'
            }`}
          >
            {valueN !== undefined ? valueN.toFixed(decimals) : '—'}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400 font-mono mb-0.5">Data B (Sebelumnya)</div>
          <div className="text-xs font-mono font-semibold text-slate-300 tabular-nums">
            {valueB !== undefined ? valueB.toFixed(decimals) : '—'}
          </div>
          <PriceDiff value={diff} decimals={decimals} />
        </div>
      </div>
    </div>
  );
}

export default function OHLPanel({ data, liveTick }) {
  if (!data) return null;
  const { ohlComparison, jika, broker } = data;
  if (!ohlComparison) return null;

  const decimals = data.decimals ?? (broker?.id !== 'BINANCE' ? 3 : 2);
  const { current: N, previous: B, diff } = ohlComparison;

  const isMatchingTick = Boolean(liveTick?.price && (!liveTick.broker || !broker || liveTick.broker === broker.id));
  const activeClose = isMatchingTick ? liveTick.bid : N?.close;
  const activeDiffClose = isMatchingTick && B?.close ? liveTick.bid - B.close : diff?.close;

  const trendUp = jika?.trend === 'UP';
  const trendDown = jika?.trend === 'DOWN';

  // Calculate candle progress position (Range % between Low and High)
  const candleRange = (N?.high && N?.low) ? (N.high - N.low) : 0;
  const pricePositionPercent = (candleRange > 0 && activeClose !== undefined)
    ? Math.max(0, Math.min(100, ((activeClose - N.low) / candleRange) * 100))
    : 50;

  return (
    <div className="space-y-3.5">
      {/* ── Hukum JIKA Trend Banner ── */}
      <div
        className={`flex items-center justify-between px-4 lg:px-5 py-3 rounded-2xl border backdrop-blur-md transition-all shadow-card-elevated ${
          trendUp
            ? 'bg-gradient-to-r from-emerald-950/40 via-cop-card to-slate-900 border-emerald-500/50 shadow-glow-green-sm'
            : trendDown
            ? 'bg-gradient-to-r from-rose-950/40 via-cop-card to-slate-900 border-rose-500/50 shadow-glow-red-sm'
            : 'bg-gradient-to-r from-slate-900 via-cop-card to-slate-900 border-cop-border'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-center ${
              trendUp
                ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400'
                : trendDown
                ? 'bg-rose-900/40 border-rose-500/50 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {trendUp ? (
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            ) : trendDown ? (
              <TrendingDown className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Minus className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Hukum JIKA (Trend Direction):
              </span>
              <span
                className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full border ${
                  trendUp
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60 shadow-glow-green-sm'
                    : trendDown
                    ? 'bg-rose-950/70 text-rose-300 border-rose-500/60 shadow-glow-red-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {jika?.label || 'ANALYZING...'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              {jika?.description || 'Analisis posisi Open Data N vs Data B'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Live Close
            </span>
            <span
              className={`calm-price text-xl lg:text-2xl font-black font-mono tracking-tight tabular-nums ${
                isMatchingTick && liveTick?.direction === 'UP'
                  ? 'text-emerald-300'
                  : isMatchingTick && liveTick?.direction === 'DOWN'
                  ? 'text-rose-300'
                  : 'text-white'
              }`}
            >
              ${activeClose !== undefined ? activeClose.toFixed(decimals) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 4 OHL Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <OHLMetric label="OPEN" valueN={N?.open} valueB={B?.open} diff={diff?.open} decimals={decimals} />
        <OHLMetric label="HIGH" valueN={N?.high} valueB={B?.high} diff={diff?.high} decimals={decimals} />
        <OHLMetric label="LOW" valueN={N?.low} valueB={B?.low} diff={diff?.low} decimals={decimals} />
        <OHLMetric
          label="LIVE CLOSE"
          valueN={activeClose}
          valueB={B?.close}
          diff={activeDiffClose}
          decimals={decimals}
          isLive={true}
          liveDirection={liveTick?.direction}
        />
      </div>

      {/* ── Intraday Data Range Visualizer ── */}
      {N?.high && N?.low && (
        <div className="p-3 rounded-xl bg-cop-card/70 border border-cop-border/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="text-rose-400 font-bold">LOW: ${N.low.toFixed(decimals)}</span>
            </span>
            <span className="text-slate-300">
              Rentang Data: <strong className="text-cop-gold tabular-nums">{candleRange.toFixed(decimals)} pts</strong> ({pricePositionPercent.toFixed(1)}% dari Low)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">HIGH: ${N.high.toFixed(decimals)}</span>
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-cop-border">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                pricePositionPercent > 50
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                  : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${pricePositionPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * OHLPanel — OHL Comparison Metrics (Current N vs Previous B)
 * Top section of the dashboard
 */
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';

function PriceDiff({ value, decimals = 2 }) {
  if (value === undefined || value === null) return <span className="text-slate-500">—</span>;
  const isPos = value > 0;
  const isZero = Math.abs(value) < 0.001;
  return (
    <span className={`font-mono text-xs font-semibold flex items-center gap-0.5 ${
      isZero ? 'text-slate-400' : isPos ? 'text-emerald-400' : 'text-red-400'
    }`}>
      {isZero ? <Minus className="w-3 h-3" /> : isPos ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {isZero ? '0.00' : `${isPos ? '+' : ''}${value.toFixed(decimals)}`}
    </span>
  );
}

function OHLMetric({ label, valueN, valueB, diff, decimals = 2 }) {
  return (
    <div className="cop-card flex-1 min-w-0">
      <div className="section-title">{label}</div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] text-slate-500 font-mono mb-0.5">Candle N (Current)</div>
          <div className="text-xl font-bold font-mono text-white tracking-tight">
            {valueN !== undefined ? valueN.toFixed(decimals) : '—'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-mono mb-0.5">Candle B (Previous)</div>
          <div className="text-sm font-mono text-slate-400">
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

  // Use liveTick price if available and matching broker
  const isMatchingTick = Boolean(liveTick?.price && (!liveTick.broker || !broker || liveTick.broker === broker.id));
  const activeClose = isMatchingTick ? liveTick.price : N?.close;
  const activeDiffClose = isMatchingTick && B?.close ? liveTick.price - B.close : diff?.close;

  const trendUp = jika?.trend === 'UP';
  const trendDown = jika?.trend === 'DOWN';

  return (
    <div className="space-y-3">
      {/* Trend Banner */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${
        trendUp
          ? 'bg-emerald-900/20 border-emerald-700/40'
          : trendDown
          ? 'bg-red-900/20 border-red-700/40'
          : 'bg-slate-800/40 border-slate-600/40'
      }`}>
        <div className="flex items-center gap-2">
          {trendUp ? (
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          ) : trendDown ? (
            <TrendingDown className="w-5 h-5 text-red-400" />
          ) : (
            <Minus className="w-5 h-5 text-slate-400" />
          )}
          <span className={`text-sm font-bold font-mono ${trendUp ? 'text-emerald-400' : trendDown ? 'text-red-400' : 'text-slate-400'}`}>
            {jika?.label || 'LOADING...'}
          </span>
          <span className="text-xs text-slate-500 font-mono">— {jika?.description}</span>
        </div>
        <div className="flex items-center gap-3">
          {isMatchingTick && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              1s TICK
            </span>
          )}
          <span className="text-xs text-slate-500 font-mono">Live Close:</span>
          <span className={`text-lg font-bold font-mono transition-colors duration-200 ${
            isMatchingTick && liveTick?.direction === 'UP'
              ? 'text-emerald-300'
              : isMatchingTick && liveTick?.direction === 'DOWN'
              ? 'text-red-300'
              : trendUp
              ? 'text-emerald-400'
              : trendDown
              ? 'text-red-400'
              : 'text-white'
          }`}>
            {activeClose !== undefined ? activeClose.toFixed(decimals) : '—'}
          </span>
        </div>
      </div>

      {/* OHL Metrics Row */}
      <div className="flex gap-3">
        <OHLMetric label="OPEN" valueN={N?.open} valueB={B?.open} diff={diff?.open} decimals={decimals} />
        <OHLMetric label="HIGH" valueN={N?.high} valueB={B?.high} diff={diff?.high} decimals={decimals} />
        <OHLMetric label="LOW" valueN={N?.low} valueB={B?.low} diff={diff?.low} decimals={decimals} />
        <OHLMetric label="LIVE CLOSE" valueN={activeClose} valueB={B?.close} diff={activeDiffClose} decimals={decimals} />
      </div>
    </div>
  );
}

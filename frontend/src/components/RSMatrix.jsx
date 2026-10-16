/**
 * RSMatrix — 9-Row Resistance/Support Matrix with Dynamic Touch Color Detection
 * R4, R3, R2, R1, Pivot, S1, S2, S3, S4
 */
import { Target, Zap } from 'lucide-react';

const LEVEL_CONFIG = {
  r4: { label: 'R4', type: 'resistance', rank: 4 },
  r3: { label: 'R3', type: 'resistance', rank: 3 },
  r2: { label: 'R2', type: 'resistance', rank: 2 },
  r1: { label: 'R1', type: 'resistance', rank: 1 },
  pivot: { label: 'Pivot', type: 'pivot', rank: 0 },
  s1: { label: 'S1', type: 'support', rank: 1 },
  s2: { label: 'S2', type: 'support', rank: 2 },
  s3: { label: 'S3', type: 'support', rank: 3 },
  s4: { label: 'S4', type: 'support', rank: 4 },
};

function getLevelClass(type, touched) {
  if (touched) {
    if (type === 'resistance') return 'level-touched-resistance';
    if (type === 'pivot') return 'level-touched-pivot';
    if (type === 'support') return 'level-touched-support';
  }
  if (type === 'resistance') return 'level-default-resistance';
  if (type === 'pivot') return 'level-default-pivot';
  if (type === 'support') return 'level-default-support';
  return 'level-row border-slate-700 bg-slate-800/20 text-slate-300';
}

function getTouchDotClass(type, touched) {
  if (!touched) return 'touch-dot bg-slate-700';
  if (type === 'resistance') return 'touch-dot bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]';
  if (type === 'pivot') return 'touch-dot bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.8)]';
  if (type === 'support') return 'touch-dot bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]';
}

function getLabelBadgeClass(type, touched) {
  if (touched) {
    if (type === 'resistance') return 'cop-badge bg-emerald-900/60 text-emerald-300 border border-emerald-600/60';
    if (type === 'pivot') return 'cop-badge bg-violet-900/60 text-violet-300 border border-violet-600/60';
    if (type === 'support') return 'cop-badge bg-red-900/60 text-red-300 border border-red-600/60';
  }
  if (type === 'resistance') return 'cop-badge-orange';
  if (type === 'pivot') return 'cop-badge bg-white/10 text-white border border-white/20';
  if (type === 'support') return 'cop-badge bg-pink-900/40 text-pink-300 border border-pink-700/40';
  return 'cop-badge-gray';
}

export default function RSMatrix({ data, liveTick }) {
  if (!data?.rsMatrix) return null;

  const { rsMatrix, ohlcv_N, broker } = data;
  const decimals = data.decimals ?? (broker?.id !== 'BINANCE' ? 3 : 2);
  const isMatchingTick = Boolean(liveTick?.price && (!liveTick.broker || !broker || liveTick.broker === broker.id));
  const currentPrice = isMatchingTick ? liveTick.price : ohlcv_N?.close;

  const levelOrder = ['r4', 'r3', 'r2', 'r1', 'pivot', 's1', 's2', 's3', 's4'];

  const closestLevel = levelOrder.reduce((closest, key) => {
    const level = rsMatrix.levels[key];
    if (!level || !currentPrice) return closest;
    const dist = Math.abs(currentPrice - level.value);
    if (!closest || dist < closest.dist) return { key, dist, value: level.value };
    return closest;
  }, null);

  return (
    <div className="cop-panel h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cop-gold" />
          <h2 className="text-sm font-bold text-white">RS Matrix</h2>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> R Default
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> R Touched
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white/60 inline-block" /> Pivot
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" /> Piv Touched
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pink-400 inline-block" /> S Default
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> S Touched
          </span>
        </div>
      </div>

      {/* Current Price Indicator */}
      {currentPrice && (
        <div className={`flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg border transition-colors duration-200 ${
          isMatchingTick && liveTick?.direction === 'UP'
            ? 'bg-emerald-950/40 border-emerald-500/50'
            : isMatchingTick && liveTick?.direction === 'DOWN'
            ? 'bg-red-950/40 border-red-500/50'
            : 'bg-cop-blue/10 border-cop-blue/30'
        }`}>
          <Zap className="w-3.5 h-3.5 text-cop-blue" />
          <span className="text-xs font-mono text-slate-300">Current Price (1s Tick):</span>
          <span className={`text-sm font-bold font-mono ${
            isMatchingTick && liveTick?.direction === 'UP'
              ? 'text-emerald-300'
              : isMatchingTick && liveTick?.direction === 'DOWN'
              ? 'text-red-300'
              : 'text-cop-blue'
          }`}>
            ${currentPrice.toFixed(decimals)}
          </span>
          {isMatchingTick && (
            <span className={`text-[10px] font-mono font-bold ${
              liveTick?.direction === 'UP' ? 'text-emerald-400' : liveTick?.direction === 'DOWN' ? 'text-red-400' : 'text-slate-400'
            }`}>
              {liveTick?.direction === 'UP' ? '▲ NAIK' : liveTick?.direction === 'DOWN' ? '▼ TURUN' : '● TETAP'}
            </span>
          )}
          {closestLevel && (
            <span className="text-[10px] font-mono text-slate-400 ml-auto">
              Nearest: <strong className="text-white">{LEVEL_CONFIG[closestLevel.key]?.label}</strong> ({closestLevel.value.toFixed(decimals)}) · Selisih: <strong className="text-cop-gold">{closestLevel.dist.toFixed(decimals)} pts</strong>
            </span>
          )}
        </div>
      )}

      {/* 9-Row RS Table */}
      <div className="space-y-1">
        {levelOrder.map((key) => {
          const level = rsMatrix.levels[key];
          if (!level) return null;

          const config = LEVEL_CONFIG[key];
          const isClosest = closestLevel?.key === key;
          const rowClass = getLevelClass(config.type, level.touched);
          const distance = currentPrice ? (currentPrice - level.value).toFixed(decimals) : null;

          return (
            <div
              key={key}
              className={`${rowClass} ${isClosest ? 'ring-1 ring-cop-blue/50' : ''} transition-all duration-300`}
            >
              {/* Touch dot */}
              <div className={getTouchDotClass(config.type, level.touched)} />

              {/* Label */}
              <span className={getLabelBadgeClass(config.type, level.touched)}>
                {config.label}
              </span>

              {/* Value */}
              <span className="font-mono font-bold text-sm flex-1 text-center">
                {level.value.toFixed(decimals)}
              </span>

              {/* Distance from current price */}
              {distance !== null && (
                <span className={`text-[10px] font-mono text-right w-16 ${
                  parseFloat(distance) > 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {parseFloat(distance) > 0 ? '+' : ''}{distance}
                </span>
              )}

              {/* Touched badge */}
              {level.touched && (
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400 animate-pulse">
                  ●TOUCH
                </span>
              )}

              {/* Closest indicator */}
              {isClosest && (
                <span className="text-[9px] font-mono text-cop-blue">◄ PRICE</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

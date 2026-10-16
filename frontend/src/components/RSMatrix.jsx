/**
 * RSMatrix — 9-Row Resistance/Support Matrix with Dynamic Touch Detection & Proximity Bar
 * Institutional level-depth visualization for R4, R3, R2, R1, Pivot, S1, S2, S3, S4
 */
import { Target, Zap, Activity, Info, CheckCircle2 } from 'lucide-react';

const LEVEL_CONFIG = {
  r4: { label: 'R4', type: 'resistance', rank: 4, desc: 'Extreme Resistance' },
  r3: { label: 'R3', type: 'resistance', rank: 3, desc: 'Strong Resistance' },
  r2: { label: 'R2', type: 'resistance', rank: 2, desc: 'Target Resistance 2' },
  r1: { label: 'R1', type: 'resistance', rank: 1, desc: 'Upper Bow / Resistance 1' },
  pivot: { label: 'PIVOT', type: 'pivot', rank: 0, desc: 'Central Pivot Point' },
  s1: { label: 'S1', type: 'support', rank: 1, desc: 'Lower Bow / Support 1' },
  s2: { label: 'S2', type: 'support', rank: 2, desc: 'Target Support 2' },
  s3: { label: 'S3', type: 'support', rank: 3, desc: 'Strong Support' },
  s4: { label: 'S4', type: 'support', rank: 4, desc: 'Extreme Support' },
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

function getLabelBadgeClass(type, touched) {
  if (touched) {
    if (type === 'resistance') return 'cop-badge bg-emerald-900/60 text-emerald-300 border border-emerald-500/80 shadow-glow-green-sm';
    if (type === 'pivot') return 'cop-badge bg-violet-900/60 text-violet-300 border border-violet-500/80 shadow-glow-blue';
    if (type === 'support') return 'cop-badge bg-rose-900/60 text-rose-300 border border-rose-500/80 shadow-glow-red-sm';
  }
  if (type === 'resistance') return 'cop-badge bg-orange-950/60 text-orange-300 border border-orange-700/50';
  if (type === 'pivot') return 'cop-badge bg-amber-500/20 text-cop-gold border border-amber-500/50 font-bold';
  if (type === 'support') return 'cop-badge bg-rose-950/40 text-rose-300 border border-rose-700/50';
  return 'cop-badge-gray';
}

export default function RSMatrix({ data, liveTick }) {
  if (!data?.rsMatrix) return null;

  const { rsMatrix, ohlcv_N, broker } = data;
  const decimals = data.decimals ?? (broker?.id !== 'BINANCE' ? 3 : 2);
  const isMatchingTick = Boolean(liveTick?.price && (!liveTick.broker || !broker || liveTick.broker === broker.id));
  const currentPrice = isMatchingTick ? liveTick.price : ohlcv_N?.close;

  const levelOrder = ['r4', 'r3', 'r2', 'r1', 'pivot', 's1', 's2', 's3', 's4'];

  // Find closest level to current price
  const closestLevel = levelOrder.reduce((closest, key) => {
    const level = rsMatrix.levels[key];
    if (!level || !currentPrice) return closest;
    const dist = Math.abs(currentPrice - level.value);
    if (!closest || dist < closest.dist) return { key, dist, value: level.value };
    return closest;
  }, null);

  return (
    <div className="cop-panel h-full flex flex-col justify-between space-y-3.5">
      {/* ── Panel Header ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-cop-gold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono">RS Matrix (9 Level Matriks)</h2>
              <p className="text-[10px] text-slate-400 font-mono">Deteksi Sentuhan Dinamis & Level Pivot</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-orange-300">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> R
            </span>
            <span className="flex items-center gap-1 text-cop-gold font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Pivot
            </span>
            <span className="flex items-center gap-1 text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> S
            </span>
          </div>
        </div>

        {/* ── Active Price Banner ── */}
        {currentPrice && (
          <div
            className={`flex items-center justify-between px-3.5 py-2 rounded-xl border transition-all duration-300 font-mono ${
              isMatchingTick && liveTick?.direction === 'UP'
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-glow-green-sm'
                : isMatchingTick && liveTick?.direction === 'DOWN'
                ? 'bg-rose-950/40 border-rose-500/50 shadow-glow-red-sm'
                : 'bg-cop-card/90 border-cop-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cop-gold" />
              <span className="text-xs text-slate-300 font-semibold">Harga Pasar:</span>
              <span
                className={`text-sm font-black tabular-nums ${
                  isMatchingTick && liveTick?.direction === 'UP'
                    ? 'text-emerald-300'
                    : isMatchingTick && liveTick?.direction === 'DOWN'
                    ? 'text-rose-300'
                    : 'text-white'
                }`}
              >
                ${currentPrice.toFixed(decimals)}
              </span>
              {isMatchingTick && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    liveTick?.direction === 'UP'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-700/60'
                      : liveTick?.direction === 'DOWN'
                      ? 'bg-rose-950 text-rose-400 border-rose-700/60'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {liveTick?.direction === 'UP' ? '▲ NAIK' : liveTick?.direction === 'DOWN' ? '▼ TURUN' : '● TETAP'}
                </span>
              )}
            </div>

            {closestLevel && (
              <div className="text-[10px] text-slate-400 hidden sm:block">
                Level Terdekat: <strong className="text-white">{LEVEL_CONFIG[closestLevel.key]?.label}</strong> ({closestLevel.value.toFixed(decimals)}) · Selisih: <strong className="text-cop-gold tabular-nums">{closestLevel.dist.toFixed(decimals)} pts</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 9-Row RS Matrix Table ── */}
      <div className="space-y-1.5">
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
              className={`${rowClass} ${
                isClosest ? 'ring-1 ring-cop-gold/80 shadow-glow-gold-sm' : ''
              }`}
            >
              {/* Level Badge */}
              <div className="flex items-center gap-2">
                <span className={getLabelBadgeClass(config.type, level.touched)}>
                  {config.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden xl:inline">
                  {config.desc}
                </span>
              </div>

              {/* Price Value */}
              <span className="font-mono font-bold text-sm text-center tabular-nums text-white">
                ${level.value.toFixed(decimals)}
              </span>

              {/* Distance from Market Price */}
              <div className="flex items-center gap-2 justify-end w-28">
                {distance !== null && (
                  <span
                    className={`text-[11px] font-mono font-semibold tabular-nums ${
                      parseFloat(distance) > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {parseFloat(distance) > 0 ? '+' : ''}{distance}
                  </span>
                )}

                {/* Touched Badge */}
                {level.touched ? (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/70 animate-pulse">
                    TOUCH
                  </span>
                ) : isClosest ? (
                  <span className="text-[9px] font-mono font-bold text-cop-gold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/50">
                    MARKET
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

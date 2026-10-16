/**
 * OperationalStatus — Bottom-Left: OP, Trend, Task, Move, Range N/B indicators
 */
import { Shield, TrendingUp, TrendingDown, Minus, Activity, BarChart, Target, Layers } from 'lucide-react';

function StatRow({ icon: Icon, label, value, valueClass = 'text-white' }) {
  return (
    <div className="stat-row">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-mono">{label}</span>
      </div>
      <span className={`text-sm font-bold font-mono ${valueClass}`}>{value || '—'}</span>
    </div>
  );
}

function getOPClass(op) {
  if (op === 'ACTIVE') return 'cop-badge-green';
  return 'cop-badge-gray';
}

function getTrendClass(trend) {
  if (trend === 'UP') return 'text-emerald-400';
  if (trend === 'DOWN') return 'text-red-400';
  return 'text-slate-400';
}

function getTaskClass(task) {
  if (task?.includes('BUY')) return 'text-emerald-400';
  if (task?.includes('SELL')) return 'text-red-400';
  return 'text-amber-400';
}

function getMoveClass(move) {
  if (!move) return 'text-slate-400';
  if (move.includes('UP')) return 'text-emerald-400';
  if (move.includes('DWN') || move.includes('DOWN')) return 'text-red-400';
  if (move.includes('SDW') || move.includes('NRL')) return 'text-amber-400';
  return 'text-slate-400';
}

export default function OperationalStatus({ data }) {
  if (!data) return null;
  const { opStatus, jika, perahu, lotCalc } = data;

  const trendIcon = jika?.trend === 'UP' ? TrendingUp : jika?.trend === 'DOWN' ? TrendingDown : Minus;

  return (
    <div className="cop-panel h-full">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-cop-blue" />
        <h2 className="text-sm font-bold text-white">Operational Status</h2>
      </div>

      {/* Broker & System OP */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-cop-card border border-cop-border">
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>Feed Server</span>
            {data?.broker?.id === 'EXNESS' && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                data?.broker?.isDirectMT5
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60'
                  : 'bg-blue-950/60 text-blue-300 border border-blue-600/50'
              }`}>
                {data?.broker?.isDirectMT5 ? 'MT5 DIRECT' : 'MT5Real36'}
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-cop-gold font-mono flex items-center gap-1.5 mt-0.5">
            <span>{opStatus?.brokerName || data?.broker?.name || 'Binance'}</span>
            <span className="text-[10px] text-slate-400 font-normal">({data?.broker?.server || 'Live'})</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cop-surface border border-cop-border text-slate-400 font-normal">
              {opStatus?.spread || data?.broker?.spreadLabel || '0.5 pip'}
            </span>
          </div>
        </div>
        <span className={getOPClass(opStatus?.op)}>
          {opStatus?.op || 'STANDBY'}
        </span>
      </div>

      {/* Status Rows */}
      <div className="space-y-0.5">
        <StatRow
          icon={trendIcon}
          label="TREND (JIKA)"
          value={opStatus?.trend}
          valueClass={getTrendClass(opStatus?.trend)}
        />
        <StatRow
          icon={Target}
          label="TASK (BUSUR)"
          value={opStatus?.task}
          valueClass={getTaskClass(opStatus?.task)}
        />
        <StatRow
          icon={Layers}
          label="MOVE (PERAHU)"
          value={opStatus?.move}
          valueClass={getMoveClass(opStatus?.move)}
        />
        <StatRow
          icon={BarChart}
          label="RANGE N (pts)"
          value={opStatus?.rangeN}
          valueClass="text-cop-gold"
        />
        <StatRow
          icon={BarChart}
          label="RANGE B (pts)"
          value={opStatus?.rangeB}
          valueClass="text-slate-400"
        />
      </div>

      {/* Perahu Pattern Card */}
      {perahu && (
        <div className="mt-4 p-3 rounded-lg bg-cop-card border border-cop-border">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
            Hukum Perahu Pattern
          </div>
          <div className={`text-base font-bold font-mono mb-1 ${getMoveClass(perahu.pattern)}`}>
            {perahu.pattern}
          </div>
          <div className="text-[11px] text-slate-400 font-mono leading-relaxed">
            {perahu.description}
          </div>
        </div>
      )}

      {/* Lot Size — 3 Core Theories */}
      {lotCalc && (
        <div className="mt-3 p-3 rounded-lg bg-amber-950/20 border border-amber-700/30">
          <div className="text-[10px] font-mono text-amber-500/70 uppercase tracking-widest mb-1.5">
            3 Core Theories — Lot Calc
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-cop-gold">{lotCalc.lot} LOT</span>
            <span className="text-[10px] font-mono text-slate-500">{lotCalc.formula}</span>
          </div>
        </div>
      )}
    </div>
  );
}

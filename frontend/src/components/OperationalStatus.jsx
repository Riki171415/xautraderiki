/**
 * OperationalStatus — Operational Indicators (OP, Trend, Task, Move, Range N/B)
 */
import { Shield, TrendingUp, TrendingDown, Minus, BarChart, Target, Layers, Server } from 'lucide-react';

function StatRow({ icon: Icon, label, value, valueClass = 'text-white' }) {
  return (
    <div className="stat-row">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-mono">{label}</span>
      </div>
      <span className={`text-xs font-bold font-mono tabular-nums ${valueClass}`}>{value || '—'}</span>
    </div>
  );
}

function getOPClass(op) {
  if (op === 'ACTIVE') return 'cop-badge-green';
  return 'cop-badge-gray';
}

function getTrendClass(trend) {
  if (trend === 'UP') return 'text-emerald-400';
  if (trend === 'DOWN') return 'text-rose-400';
  return 'text-slate-400';
}

function getTaskClass(task) {
  if (task?.includes('BUY')) return 'text-emerald-400';
  if (task?.includes('SELL')) return 'text-rose-400';
  return 'text-amber-400';
}

function getMoveClass(move) {
  if (!move) return 'text-slate-400';
  if (move.includes('UP')) return 'text-emerald-400';
  if (move.includes('DWN') || move.includes('DOWN')) return 'text-rose-400';
  if (move.includes('SDW') || move.includes('NRL')) return 'text-amber-400';
  return 'text-slate-400';
}

export default function OperationalStatus({ data }) {
  if (!data) return null;
  const { opStatus, jika, perahu, lotCalc } = data;

  const trendIcon = jika?.trend === 'UP' ? TrendingUp : jika?.trend === 'DOWN' ? TrendingDown : Minus;

  return (
    <div className="cop-panel h-full flex flex-col justify-between space-y-3.5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-cop-blue">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono">Status Operasional</h2>
            <p className="text-[10px] text-slate-400 font-mono">Telemetri Rule Engine & Hukum Perahu</p>
          </div>
        </div>

        {/* Server Status Header */}
        <div className="flex items-center justify-between mb-3 p-3 rounded-xl bg-cop-card border border-cop-border">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Feed Server</span>
              {data?.broker?.id === 'EXNESS' && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  data?.broker?.isDirectMT5
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                    : 'bg-blue-950 text-blue-300 border border-blue-600/50'
                }`}>
                  {data?.broker?.isDirectMT5 ? 'MT5 DIRECT' : 'MT5Real36'}
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-cop-gold font-mono flex items-center gap-1.5 mt-0.5">
              <span>{opStatus?.brokerName || data?.broker?.name || 'Exness'}</span>
              <span className="text-[10px] text-slate-400 font-normal">({data?.broker?.server || 'Interbank CFD'})</span>
            </div>
          </div>
          <span className={getOPClass(opStatus?.op)}>
            {opStatus?.op || 'STANDBY'}
          </span>
        </div>

        {/* Telemetry Rows */}
        <div className="space-y-0.5">
          <StatRow
            icon={trendIcon}
            label="TREND (HUKUM JIKA)"
            value={opStatus?.trend}
            valueClass={getTrendClass(opStatus?.trend)}
          />
          <StatRow
            icon={Target}
            label="TASK (HUKUM BUSUR)"
            value={opStatus?.task}
            valueClass={getTaskClass(opStatus?.task)}
          />
          <StatRow
            icon={Layers}
            label="MOVE (HUKUM PERAHU)"
            value={opStatus?.move}
            valueClass={getMoveClass(opStatus?.move)}
          />
          <StatRow
            icon={BarChart}
            label="RANGE N (Saat Ini)"
            value={`${opStatus?.rangeN || '0.00'} pts`}
            valueClass="text-cop-gold font-bold"
          />
          <StatRow
            icon={BarChart}
            label="RANGE B (Sebelumnya)"
            value={`${opStatus?.rangeB || '0.00'} pts`}
            valueClass="text-slate-400"
          />
        </div>

        {/* Perahu Pattern Card */}
        {perahu && (
          <div className="mt-3 p-3 rounded-xl bg-cop-card border border-cop-border">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
              Hukum Perahu (Pola Candle)
            </div>
            <div className={`text-sm font-black font-mono mb-1 ${getMoveClass(perahu.pattern)}`}>
              {perahu.pattern}
            </div>
            <div className="text-[11px] text-slate-300 font-mono leading-relaxed">
              {perahu.description}
            </div>
          </div>
        )}
      </div>

      {/* Lot Size — 3 Core Theories */}
      {lotCalc && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/30 to-cop-card border border-amber-500/40">
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1">
            3 Core Theories — Lot Size Rekomendasi
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-black font-mono text-cop-gold tabular-nums">{lotCalc.lot} LOT</span>
            <span className="text-[10px] font-mono text-slate-400">{lotCalc.formula}</span>
          </div>
        </div>
      )}
    </div>
  );
}

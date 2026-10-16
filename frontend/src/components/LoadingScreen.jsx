/**
 * LoadingScreen — Initial loading state for the dashboard
 */
import { BarChart2, Loader2 } from 'lucide-react';

export default function LoadingScreen({ status, error, reconnectCount }) {
  return (
    <div className="min-h-screen bg-cop-bg flex flex-col items-center justify-center gap-6">
      {/* Logo */}
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-cop-gold/10 border border-cop-gold/30 glow-gold">
        <BarChart2 className="w-10 h-10 text-cop-gold" />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">COP TAH Analytics</h1>
        <p className="text-sm text-slate-500 font-mono">XAUUSD / PAXG Trading Dashboard</p>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3">
          <div className="text-red-400 font-mono text-sm bg-red-950/30 border border-red-700/30 px-4 py-2 rounded-lg">
            ⚠ {error}
          </div>
          {reconnectCount > 0 && (
            <p className="text-slate-500 text-xs font-mono">
              Attempting to reconnect ({reconnectCount}/10)...
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-cop-gold font-mono text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting to Binance market data...
          </div>
          <div className="text-slate-600 text-xs font-mono">
            {status === 'connecting' ? 'Establishing WebSocket connection...' : `Status: ${status}`}
          </div>
        </div>
      )}

      <div className="flex gap-6 text-[10px] font-mono text-slate-700 uppercase tracking-widest mt-4">
        <span>HUKUM JIKA</span>
        <span>·</span>
        <span>HUKUM PERAHU</span>
        <span>·</span>
        <span>HUKUM BUSUR</span>
        <span>·</span>
        <span>RS MATRIX</span>
        <span>·</span>
        <span>HSH</span>
      </div>
    </div>
  );
}

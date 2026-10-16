/**
 * LoadingScreen — Initial loading state for the dashboard
 */
import { BarChart2, Loader2 } from 'lucide-react';

export default function LoadingScreen({ status, error, reconnectCount }) {
  return (
    <div className="min-h-screen bg-cop-bg flex flex-col items-center justify-center p-6 text-slate-100 font-mono">
      {/* Brand Icon */}
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-cop-card to-slate-900 border border-cop-gold/40 shadow-glow-gold mb-6 animate-pulse">
        <BarChart2 className="w-10 h-10 text-cop-gold" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight mb-1">COP TAH Analytics</h1>
        <p className="text-xs text-cop-gold uppercase tracking-widest font-semibold">
          Institutional XAUUSD / Gold Terminal
        </p>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3">
          <div className="text-rose-300 font-mono text-xs bg-rose-950/60 border border-rose-500/50 px-5 py-3 rounded-xl shadow-glow-red-sm max-w-md text-center">
            ⚠ {error}
          </div>
          {reconnectCount > 0 && (
            <p className="text-slate-400 text-xs font-mono">
              Mencoba menghubungkan kembali ({reconnectCount}/10)...
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5 text-cop-gold font-mono text-xs font-bold bg-cop-card px-4 py-2 rounded-xl border border-cop-border shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin text-cop-gold" />
            Menghubungkan ke Feed Pasar Interbank & MT5...
          </div>
          <div className="text-slate-500 text-[11px] font-mono">
            {status === 'connecting' ? 'Memulai koneksi WebSocket...' : `Status: ${status}`}
          </div>
        </div>
      )}

      <div className="flex gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-8 flex-wrap justify-center">
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

/**
 * StorylineGenerator — Dynamic narrative card compiling all rule engine outputs
 */
import { BookOpen, RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function StorylineGenerator({ data }) {
  const [copied, setCopied] = useState(false);

  if (!data?.storyline) {
    return (
      <div className="cop-panel h-full flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cop-cyan">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white font-mono">Storyline Generator</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <RefreshCw className="w-4 h-4 animate-spin text-cop-gold" />
            Menyusun narasi fraktal pasar...
          </div>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.storyline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cop-panel h-full flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cop-cyan">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono">Storyline Generator</h2>
              <p className="text-[10px] text-slate-400 font-mono">Narasi Komprehensif Sesi & Fraktal</p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="btn-ghost"
            title="Salin narasi trading"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px]">Salin</span>
              </>
            )}
          </button>
        </div>

        {/* Narrative Box */}
        <textarea
          className="storyline-box"
          readOnly
          value={data.storyline}
          spellCheck={false}
        />
      </div>

      {/* Key Strategic Chips */}
      {data.jika && data.perahu && data.busur && (
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
          <div className="bg-cop-card border border-cop-border rounded-xl p-2 text-center">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">JIKA</div>
            <div
              className={`text-xs font-black ${
                data.jika.trend === 'UP' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {data.jika.trend}
            </div>
          </div>

          <div className="bg-cop-card border border-cop-border rounded-xl p-2 text-center">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">PERAHU</div>
            <div className="text-xs font-black text-amber-300 line-clamp-1">
              {data.perahu.pattern}
            </div>
          </div>

          <div className="bg-cop-card border border-cop-border rounded-xl p-2 text-center">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">BUSUR</div>
            <div
              className={`text-xs font-black line-clamp-1 ${
                data.busur.color === 'green'
                  ? 'text-emerald-400'
                  : data.busur.color === 'red'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {data.busur.action}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

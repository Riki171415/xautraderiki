/**
 * StorylineGenerator — Dynamic narrative card compiling all rule engine outputs
 */
import { BookOpen, RefreshCw, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';

export default function StorylineGenerator({ data }) {
  const [copied, setCopied] = useState(false);

  if (!data?.storyline) {
    return (
      <div className="cop-panel h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-cop-cyan" />
          <h2 className="text-sm font-bold text-white">Storyline Generator</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-mono">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Generating narrative...
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
    <div className="cop-panel h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cop-cyan" />
          <h2 className="text-sm font-bold text-white">Storyline Generator</h2>
          <span className="cop-badge bg-cyan-900/30 text-cyan-400 border border-cyan-700/30 text-[9px]">
            LIVE NARRATIVE
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="btn-ghost"
          title="Copy storyline"
        >
          {copied ? (
            <>
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      <textarea
        className="storyline-box flex-1"
        readOnly
        value={data.storyline}
        spellCheck={false}
      />

      {/* Fractal step summary */}
      {data.jika && data.perahu && data.busur && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-cop-card border border-cop-border rounded-lg p-2 text-center">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">JIKA</div>
            <div className={`text-xs font-bold font-mono ${
              data.jika.trend === 'UP' ? 'text-emerald-400' :
              data.jika.trend === 'DOWN' ? 'text-red-400' : 'text-slate-400'
            }`}>{data.jika.trend}</div>
          </div>
          <div className="bg-cop-card border border-cop-border rounded-lg p-2 text-center">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">PERAHU</div>
            <div className="text-xs font-bold font-mono text-amber-400">{data.perahu.pattern}</div>
          </div>
          <div className="bg-cop-card border border-cop-border rounded-lg p-2 text-center">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">BUSUR</div>
            <div className={`text-xs font-bold font-mono ${
              data.busur.color === 'green' ? 'text-emerald-400' :
              data.busur.color === 'red' ? 'text-red-400' : 'text-amber-400'
            }`}>{data.busur.action}</div>
          </div>
        </div>
      )}
    </div>
  );
}

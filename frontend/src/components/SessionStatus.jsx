/**
 * SessionStatus — Global trading session status (Tokyo, London, New York)
 * + HSH Warning Banner
 */
import { Globe, Home, AlertTriangle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

function SessionBadge({ name, sessionData, emoji }) {
  const isActive = sessionData?.active;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 ${
      isActive
        ? 'border-emerald-600/60 bg-emerald-900/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
        : 'border-cop-border bg-cop-card'
    }`}>
      <div className={`w-2.5 h-2.5 rounded-full ${
        isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-700'
      }`} />
      <div>
        <div className={`text-xs font-bold font-mono ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
          {emoji} {name}
        </div>
        <div className="text-[10px] font-mono text-slate-600">
          {sessionData?.open} – {sessionData?.close} UTC
        </div>
      </div>
      {isActive && (
        <span className="ml-auto text-[9px] font-mono font-bold text-emerald-400 tracking-widest uppercase">
          OPEN
        </span>
      )}
    </div>
  );
}

function HSHBanner({ hsh }) {
  if (!hsh?.hshActive) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-cop-card border border-cop-border">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
          <Home className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold font-mono text-slate-400 mb-1">HSH — Home Sweet Home</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-cop-border/30 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-slate-600 transition-all duration-500"
                style={{ width: `${hsh?.percentElapsed || 0}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
              {hsh?.timeToClose || '—'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-600 mt-1">
            Candle {hsh?.percentElapsed || 0}% complete — No HSH signal
          </div>
        </div>
      </div>
    );
  }

  const isCritical = hsh.hshSeverity === 'CRITICAL';
  const isHigh = hsh.hshSeverity === 'HIGH';

  return (
    <div className={`p-3 rounded-lg border-2 ${
      isCritical
        ? 'border-red-500/70 bg-red-950/40 hsh-critical'
        : isHigh
        ? 'border-amber-500/60 bg-amber-950/30 hsh-high'
        : 'border-yellow-600/50 bg-yellow-950/20'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${isCritical ? 'animate-flash' : 'animate-pulse'}`}>
          <AlertTriangle className={`w-6 h-6 ${
            isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-yellow-400'
          }`} />
        </div>
        <div className="flex-1">
          <div className={`text-xs font-bold font-mono tracking-wider uppercase mb-1 ${
            isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-yellow-400'
          }`}>
            🏠 HSH ACTIVE — {hsh.hshSeverity}
          </div>
          <div className="text-xs font-mono text-slate-300 leading-relaxed">
            {hsh.hshMessage}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 bg-cop-border/30 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${hsh.percentElapsed || 0}%` }}
              />
            </div>
            <span className={`text-[10px] font-mono font-bold whitespace-nowrap ${
              isCritical ? 'text-red-400' : 'text-amber-400'
            }`}>
              ⏱ {hsh.timeToClose}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionStatus({ data }) {
  const [localTime, setLocalTime] = useState('');
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Jakarta' }));
      setUtcTime(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const session = data?.session;
  const hsh = data?.hsh;

  return (
    <div className="cop-panel h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cop-cyan" />
          <h2 className="text-sm font-bold text-white">Session Status</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{utcTime} UTC</span>
          <span className="text-slate-700">|</span>
          <span>{localTime} WIB</span>
        </div>
      </div>

      {/* Active Sessions */}
      {session?.activeSessions?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active:</span>
          {session.activeSessions.map((s) => (
            <span key={s} className="cop-badge-green text-[10px]">
              {s.toUpperCase()} SESSION
            </span>
          ))}
        </div>
      )}

      {/* Session Cards */}
      <div className="grid grid-cols-3 gap-2">
        <SessionBadge
          name="TOKYO"
          emoji="🇯🇵"
          sessionData={session?.sessions?.tokyo}
        />
        <SessionBadge
          name="LONDON"
          emoji="🇬🇧"
          sessionData={session?.sessions?.london}
        />
        <SessionBadge
          name="NEW YORK"
          emoji="🇺🇸"
          sessionData={session?.sessions?.newYork}
        />
      </div>

      {/* HSH Warning Banner */}
      <div>
        <div className="section-title mb-2">Hukum Rumah Idaman (HSH)</div>
        <HSHBanner hsh={hsh} />
      </div>
    </div>
  );
}

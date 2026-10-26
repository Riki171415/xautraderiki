/**
 * SessionStatus — Global Trading Sessions (Tokyo, London, New York) + HSH Warning Banner
 */
import { Globe, Home, AlertTriangle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

function SessionBadge({ name, sessionData, flag }) {
  const isActive = sessionData?.active;
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-300 font-mono ${
        isActive
          ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/40 via-cop-card to-slate-900 shadow-glow-green-sm'
          : 'border-cop-border bg-cop-card/70'
      }`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          isActive ? 'bg-emerald-400 shadow-glow-green animate-pulse' : 'bg-slate-700'
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-bold leading-none ${isActive ? 'text-emerald-300' : 'text-slate-400'}`}>
          {flag} {name}
        </div>
        <div className="text-[10px] text-slate-500 mt-1 tabular-nums">
          {sessionData?.open} – {sessionData?.close} WIB
        </div>
      </div>
      {isActive && (
        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-600/50 uppercase tracking-wider">
          OPEN
        </span>
      )}
    </div>
  );
}

function HSHBanner({ hsh }) {
  if (!hsh?.hshActive) {
    return (
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-cop-card/70 border border-cop-border">
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-400">
          <Home className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold font-mono text-slate-300">HSH — Home Sweet Home</span>
            <span className="text-[10px] font-mono text-slate-400 tabular-nums">{hsh?.timeToClose || '—'}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-cop-border/60">
            <div
              className="h-full bg-slate-600 rounded-full transition-all duration-500"
              style={{ width: `${hsh?.percentElapsed || 0}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1.5">
            Durasi Periode Data {hsh?.percentElapsed || 0}% selesai · Belum ada sinyal HSH aktif
          </div>
        </div>
      </div>
    );
  }

  const isCritical = hsh.hshSeverity === 'CRITICAL';
  const isHigh = hsh.hshSeverity === 'HIGH';

  return (
    <div
      className={`p-3.5 rounded-xl border-2 transition-all ${
        isCritical
          ? 'border-rose-500 bg-rose-950/40 hsh-critical shadow-glow-red'
          : isHigh
          ? 'border-amber-500/80 bg-amber-950/40 shadow-glow-gold'
          : 'border-yellow-600/60 bg-yellow-950/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${isCritical ? 'animate-pulse' : ''}`}>
          <AlertTriangle
            className={`w-6 h-6 ${
              isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-yellow-400'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`text-xs font-black font-mono tracking-wider uppercase mb-1 ${
              isCritical ? 'text-rose-300' : isHigh ? 'text-amber-300' : 'text-yellow-300'
            }`}
          >
            🏠 PANTAUAN HSH — {hsh.hshSeverity} · belum terkonfirmasi
          </div>
          <div className="text-xs font-mono text-slate-200 leading-relaxed">
            {hsh.hshMessage}
            <p className="mt-2 text-slate-400">{hsh.thresholdNote || 'Peringatan berdasarkan aturan metode; probabilitas kembali ke Open N belum teruji.'}</p>
          </div>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-cop-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${hsh.percentElapsed || 0}%` }}
              />
            </div>
            <span
              className={`text-[10px] font-mono font-bold whitespace-nowrap tabular-nums ${
                isCritical ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              ⏱ Tersisa: {hsh.timeToClose}
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
      setLocalTime(now.toLocaleTimeString('id-ID', { hour12: false, timeZone: 'Asia/Jakarta' }));
      setUtcTime(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const hour=Number(localTime.split(/[.:]/)[0]);
  const session = {sessions:{
    tokyo:{active:hour>=6&&hour<14,open:'06:00',close:'14:00'},
    london:{active:hour>=14&&hour<20,open:'14:00',close:'20:00'},
    newYork:{active:hour>=20||hour<4,open:'20:00',close:'04:00'},
  }};
  const hsh = data?.hsh;

  return (
    <div className="cop-panel h-full flex flex-col justify-between space-y-3.5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono">Status Sesi Pasar Global</h2>
              <p className="text-[10px] text-slate-400 font-mono">Jadwal Pasar & Hukum Rumah Idaman</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cop-gold" />
            <span className="tabular-nums font-semibold">{localTime} WIB</span>
          </div>
        </div>

        {/* Global Session Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          <SessionBadge name="ASIA" flag="🇯🇵" sessionData={session?.sessions?.tokyo} />
          <SessionBadge name="EROPA" flag="🇬🇧" sessionData={session?.sessions?.london} />
          <SessionBadge name="USA" flag="🇺🇸" sessionData={session?.sessions?.newYork} />
        </div>
      </div>

      {/* HSH Warning Banner */}
      <div>
        <div className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 mb-2">
          Hukum Rumah Idaman (Home Sweet Home)
        </div>
        <HSHBanner hsh={hsh} />
      </div>
    </div>
  );
}

import { API_BASE } from '../config';
import { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  ChevronDown,
  BarChart2,
  Radio,
  Server,
  X,
  Check,
  Zap,
  ShieldCheck,
  User,
  Clock,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function Header({
  symbol,
  timeframe,
  broker = 'EXNESS',
  liveTick,
  wsStatus,
  lastUpdated,
  onRefresh,
  onSymbolChange,
  onTimeframeChange,
  onBrokerChange,
  onOpenSources,
}) {
  const [showMt5Modal, setShowMt5Modal] = useState(false);
  const [syncPriceInput, setSyncPriceInput] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // MT5 Direct Account Login State
  const [mt5Login, setMt5Login] = useState('');
  const [mt5Password, setMt5Password] = useState('');
  const [mt5Server, setMt5Server] = useState('Exness-MT5Real36');
  const [mt5CurrentPrice, setMt5CurrentPrice] = useState('');
  const [linkedAccount, setLinkedAccount] = useState(null);
  const [linkingAccount, setLinkingAccount] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [linkError, setLinkError] = useState(null);

  // Check existing MT5 status on mount
  useEffect(() => {
    fetch(`${API_BASE}/mt5/status`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.account || json?.state?.account) {
          setLinkedAccount({
            login: json.account || json.state?.account,
            server: json.server || json.state?.server || 'Exness-MT5Real36',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleAccountLogin = async (e) => {
    e.preventDefault();
    if (!mt5Login) return;
    setLinkingAccount(true);
    setLinkError(null);
    try {
      const res = await fetch(`${API_BASE}/mt5/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: mt5Login,
          password: mt5Password,
          server: mt5Server || 'Exness-MT5Real36',
          currentPrice: mt5CurrentPrice ? parseFloat(mt5CurrentPrice) : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setLinkedAccount(json.data);
        setLinkSuccess(true);
        if (onBrokerChange) onBrokerChange('EXNESS');
        if (onRefresh) onRefresh();
        setTimeout(() => setLinkSuccess(false), 3000);
      } else {
        setLinkError(json.error || 'Gagal menghubungkan akun');
      }
    } catch (err) {
      setLinkError(err.message);
    } finally {
      setLinkingAccount(false);
    }
  };

  const handleDisconnectAccount = async () => {
    await fetch(`${API_BASE}/mt5/disconnect`, { method: 'POST' });
    setLinkedAccount(null);
    if (onRefresh) onRefresh();
  };

  const handleSyncPrice = async (e) => {
    e.preventDefault();
    if (!syncPriceInput || isNaN(syncPriceInput)) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/mt5/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(syncPriceInput) }),
      });
      if (res.ok) {
        setSyncSuccess(true);
        if (onBrokerChange) onBrokerChange('EXNESS');
        if (onRefresh) onRefresh();
        setTimeout(() => {
          setSyncSuccess(false);
          setShowMt5Modal(false);
        }, 1200);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const BROKERS_LIST = [
    {id:'TWELVE',label:'Twelve Data (XAU/USD)',server:'Twelve Data',tag:'XAU/USD'},
    { id: 'EXNESS', label: 'Exness (MT5Real36)', server: 'Exness-MT5Real36', tag: '🔵 Real 36' },
    { id: 'BINANCE', label: 'Binance (Live)', server: 'Binance Live', tag: '🟡 Spot/Futures' },
  ];

  const INTRADAY_TF = [
    { id: '1m', label: '1m' },
    { id: '5m', label: '5m' },
    { id: '15m', label: '15m' },
    { id: '30m', label: '30m' },
    { id: '1h', label: '1H' },
    { id: '4h', label: '4H' },
  ];

  const MACRO_TF = [
    { id: '1d', label: '1D' },
    { id: '1w', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: '1Y', label: '1Y' },
  ];

  const ALL_SYMBOLS = [
    { id: 'XAUUSD', label: 'XAU/USD · Gold Spot' },
    { id: 'PAXG/USDT', label: 'PAXG/USDT · Paxos Gold' },
    {id:'BTCUSD',label:'BTC/USD · Exness'},
    {id:'BTC/USDC',label:'BTC/USDC · Bitcoin'},
    { id: 'XAUT/USDT', label: 'XAUT/USDT · Tether Gold' },
  ];

  const SYMBOLS = ALL_SYMBOLS.filter(s => broker === 'BINANCE' ? !['XAUUSD','BTCUSD'].includes(s.id) : broker==='EXNESS'?['XAUUSD','BTCUSD'].includes(s.id):s.id==='XAUUSD');

  const isConnected = wsStatus === 'connected';
  const now = new Date().toLocaleTimeString('id-ID', { hour12: false, timeZone: 'Asia/Jakarta' });
  const utcNow = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' });

  return (
    <header className="header-gradient px-4 lg:px-6 py-2.5 select-none transition-all">
      <div className="header-inner flex items-center justify-between gap-3 flex-wrap">

        {/* ── Brand Section ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-cop-surface to-slate-900 border border-cop-gold/40 shadow-glow-gold-sm">
            <BarChart2 className="w-5 h-5 text-cop-gold" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-cop-bg animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                COP TAH <span className="text-cop-gold">{broker === 'TWELVE' ? 'Twelve Data' : broker === 'BINANCE' ? 'Binance Spot' : 'Exness MT5'}</span>
              </h1>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                PRO v2.5
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1 flex items-center gap-1.5">
              <span>{symbol}</span>
              <span className="text-slate-600">·</span>
              <span className="text-cop-gold font-bold">{broker}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">Fractal Confluence</span>
            </p>
          </div>
        </div>

        {/* ── Live Institutional Ticker (Center Stage) ── */}
        {liveTick?.price && (
          <div
            className={`calm-ticker flex items-center gap-3 px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-card-elevated ${
              liveTick.direction === 'UP'
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-glow-green-sm'
                : liveTick.direction === 'DOWN'
                ? 'bg-rose-950/40 border-rose-500/50 shadow-glow-red-sm'
                : 'bg-cop-card/80 border-cop-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    liveTick.direction === 'UP'
                      ? 'bg-emerald-400'
                      : liveTick.direction === 'DOWN'
                      ? 'bg-rose-400'
                      : 'bg-cop-gold'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    liveTick.direction === 'UP'
                      ? 'bg-emerald-500'
                      : liveTick.direction === 'DOWN'
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                  }`}
                />
              </span>
              <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">
                TICK 1S
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span
                className={`calm-price text-lg font-black font-mono tracking-tight tabular-nums transition-colors duration-200 ${
                  liveTick.direction === 'UP'
                    ? 'text-emerald-300'
                    : liveTick.direction === 'DOWN'
                    ? 'text-rose-300'
                    : 'text-white'
                }`}
              >
                ${(liveTick.bid ?? liveTick.price).toFixed(liveTick?.decimals ?? (broker !== 'BINANCE' ? 3 : 2))}
              </span>
              {liveTick.direction === 'UP' ? (
                <span className="text-emerald-400 text-xs font-black flex items-center">
                  <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              ) : liveTick.direction === 'DOWN' ? (
                <span className="text-rose-400 text-xs font-black flex items-center">
                  <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              ) : (
                <span className="text-slate-400 text-xs font-bold">●</span>
              )}
            </div>

            {liveTick.bid && liveTick.ask && (
              <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono text-slate-400 border-l border-slate-700/60 pl-2.5">
                <span>
                  B: <strong className="text-slate-200 tabular-nums">{liveTick.bid.toFixed(liveTick?.decimals ?? (broker !== 'BINANCE' ? 3 : 2))}</strong>
                </span>
                <span>
                  A: <strong className="text-slate-200 tabular-nums">{liveTick.ask.toFixed(liveTick?.decimals ?? (broker !== 'BINANCE' ? 3 : 2))}</strong>
                </span>
                <span className="text-cop-gold font-bold bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-600/30">
                  {liveTick.spread}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Controls & Selectors ── */}
        <div className="header-controls flex items-center gap-2 flex-wrap">

          <button type="button" className="chart-toggle" onClick={onOpenSources} title="Buka pengaturan sumber data">{broker==='TWELVE'?'Twelve Data':broker==='BINANCE'?'Binance':'Exness MT5'} · Sumber</button>

          {/* MT5 Direct Bridge Pill */}
          <button
            onClick={() => setShowMt5Modal(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all shadow-sm ${
              linkedAccount?.login || liveTick?.isDirectMT5
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-glow-green-sm'
                : broker === 'EXNESS'
                ? 'bg-cop-card hover:bg-cop-surface border-cop-border hover:border-cop-gold/60 text-slate-200'
                : 'bg-cop-card hover:bg-cop-surface border-slate-700/80 hover:border-cop-cyan text-slate-300'
            }`}
            title="Kelola Akun Exness MT5 atau Sinkronisasi Data"
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                linkedAccount?.login || liveTick?.isDirectMT5 ? 'text-emerald-400 animate-pulse' : 'text-cop-gold'
              }`}
            />
            <span>
              {linkedAccount?.login ? `MT5 #${linkedAccount.login}` : broker === 'EXNESS' ? 'MT5 Feed / Akun' : 'Hubungkan MT5'}
            </span>
          </button>

          {/* Symbol Selector */}
          <div className="relative">
            <select
              value={symbol}
              onChange={(e) => onSymbolChange(e.target.value)}
              className="appearance-none bg-cop-card/90 border border-cop-border hover:border-cop-blue/60 text-white text-xs font-mono font-semibold px-3 py-1.5 pr-7 rounded-xl cursor-pointer transition-all shadow-sm focus:outline-none"
            >
              {SYMBOLS.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Ergonomic Timeframe Segmented Control (Intraday & Macro) */}
          <div className="flex items-center gap-1 bg-cop-card/90 border border-cop-border rounded-xl p-1 shadow-sm">
            {/* Intraday Group */}
            <div className="flex items-center gap-0.5 pr-1 border-r border-cop-border/60">
              {INTRADAY_TF.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => onTimeframeChange(tf.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    timeframe === tf.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-glow-gold-sm font-extrabold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Intraday Timeframe ${tf.label}`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Macro Group */}
            <div className="flex items-center gap-0.5 pl-1">
              {MACRO_TF.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => onTimeframeChange(tf.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    timeframe === tf.id
                      ? 'bg-cop-blue text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Macro Timeframe ${tf.label}`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            className="btn-ghost"
            title="Refresh Data Analisis"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* ── Status Bar & Clocks ── */}
        <div className="header-connection flex items-center gap-2.5 flex-shrink-0">
          {/* WS Status Badge */}
          <div
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
              isConnected
                ? 'text-emerald-300 border-emerald-600/50 bg-emerald-950/40 shadow-glow-green-sm'
                : 'text-rose-300 border-rose-600/50 bg-rose-950/40 shadow-glow-red-sm'
            }`}
          >
            {isConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
            <span>{isConnected ? 'TERHUBUNG' : 'MENGHUBUNGKAN'}</span>
          </div>

          {/* Time & Session Clock */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-cop-card/60 border border-cop-border text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cop-gold" />
            <span className="tabular-nums font-semibold">{now} WIB</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 tabular-nums">{utcNow} UTC</span>
          </div>
        </div>

      </div>

      {/* ── MT5 Bridge Modal ── */}
      {showMt5Modal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-tick-flash">
          <div className="bg-cop-surface border border-cop-border rounded-2xl max-w-lg w-full p-6 shadow-2xl font-mono text-slate-300 space-y-4">
            <div className="flex items-center justify-between border-b border-cop-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-cop-gold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Koneksi Langsung Exness-MT5Real36</h3>
                  <p className="text-[10px] text-slate-400">Sinkronisasi harga & feed interbank real-time</p>
                </div>
              </div>
              <button
                onClick={() => setShowMt5Modal(false)}
                className="p-1.5 rounded-xl hover:bg-cop-card text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">

              {broker !== 'EXNESS' && (
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/50 text-sky-200 text-xs flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cop-cyan flex-shrink-0" />
                  <span>
                    Broker aktif saat ini: <strong className="text-white">{broker}</strong>. Menghubungkan akun atau menyelaraskan harga akan <strong>otomatis beralih ke Exness (MT5Real36)</strong>.
                  </span>
                </div>
              )}

              {/* Opsi 1: Masukkan Akun MT5 Langsung */}
              <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cop-gold" />
                    <span className="text-xs font-bold text-white">Opsi 1: Hubungkan Akun MT5</span>
                  </div>
                  <span className="text-[10px] text-cop-gold bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-600/40 font-semibold">
                    Investor Read-Only
                  </span>
                </div>

                {linkedAccount?.login ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Akun MT5 Terhubung: #{linkedAccount.login}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Server: {linkedAccount.server || 'Exness-MT5Real36'}
                      </div>
                    </div>
                    <button
                      onClick={handleDisconnectAccount}
                      className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-300 text-xs font-bold border border-rose-700/60 transition-colors"
                    >
                      Putuskan
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAccountLogin} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Nomor Akun MT5 (Login)</label>
                        <input
                          type="number"
                          placeholder="Cth: 14256381"
                          value={mt5Login}
                          onChange={(e) => setMt5Login(e.target.value)}
                          className="w-full bg-cop-surface border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cop-gold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Password Investor</label>
                        <input
                          type="password"
                          placeholder="Investor password..."
                          value={mt5Password}
                          onChange={(e) => setMt5Password(e.target.value)}
                          className="w-full bg-cop-surface border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cop-gold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Server Broker</label>
                        <input
                          type="text"
                          value={mt5Server}
                          onChange={(e) => setMt5Server(e.target.value)}
                          className="w-full bg-cop-surface border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cop-gold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-emerald-400 block mb-1 font-bold">Harga MT5 Sekarang (3 digit)</label>
                        <input
                          type="number"
                          step="0.001"
                          placeholder="Cth: 4179.250"
                          value={mt5CurrentPrice}
                          onChange={(e) => setMt5CurrentPrice(e.target.value)}
                          className="w-full bg-cop-surface border border-emerald-700/60 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 leading-tight flex items-start gap-1.5 p-2 rounded-lg bg-cop-surface/60 border border-cop-border/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-cop-cyan flex-shrink-0 mt-0.5" />
                      <span>Tips Keamanan: Anda dapat menggunakan <strong>Investor Password (Read-Only)</strong> akun Exness Anda agar 100% terlindungi tanpa hak eksekusi order langsung.</span>
                    </div>

                    {linkSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Akun MT5 berhasil dihubungkan & feed dialihkan ke Exness!
                      </div>
                    )}
                    {linkError && (
                      <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-300 text-xs">
                        {linkError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={linkingAccount}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold font-mono transition-all shadow-glow-gold-sm"
                    >
                      {linkingAccount ? 'Menghubungkan...' : 'Hubungkan Akun MT5'}
                    </button>
                  </form>
                )}
              </div>

              {/* Opsi 2: Samakan Langsung Harga MT5 */}
              <div className="p-4 rounded-xl bg-cop-card border border-cop-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Samakan Langsung Harga Layar MT5
                  </span>
                  {liveTick?.price && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Feed: <strong className="text-white">${(liveTick.bid ?? liveTick.price).toFixed(liveTick?.decimals ?? (broker !== 'BINANCE' ? 3 : 2))}</strong>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ketik harga yang sedang tampil di chart MT5 Anda sekarang (3 digit). Seluruh matriks Pivot & level order akan otomatis terkalibrasi secara presisi:
                </p>
                <form onSubmit={handleSyncPrice} className="flex gap-2">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Contoh: 4179.250"
                    value={syncPriceInput}
                    onChange={(e) => setSyncPriceInput(e.target.value)}
                    className="flex-1 bg-cop-surface border border-emerald-600/60 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={syncing}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-glow-green-sm whitespace-nowrap"
                  >
                    {syncSuccess ? '✓ Terkalibrasi!' : syncing ? '...' : 'Samakan Harga'}
                  </button>
                </form>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowMt5Modal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

import { useState, useEffect } from 'react';
import { Activity, RefreshCw, Wifi, WifiOff, ChevronDown, BarChart2, Radio, Server, X, Check, Copy, ExternalLink, Lock, User, Key, ShieldCheck, Zap } from 'lucide-react';

export default function Header({
  symbol,
  timeframe,
  broker = 'BINANCE',
  liveTick,
  wsStatus,
  lastUpdated,
  onRefresh,
  onSymbolChange,
  onTimeframeChange,
  onBrokerChange,
}) {
  const [showMt5Modal, setShowMt5Modal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
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
    fetch('http://localhost:3001/api/mt5/status')
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
      const res = await fetch('http://localhost:3001/api/mt5/login', {
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
        // Otomatis ubah broker aktif ke EXNESS agar dashboard menampilkan feed MT5
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
    await fetch('http://localhost:3001/api/mt5/disconnect', { method: 'POST' });
    setLinkedAccount(null);
    if (onRefresh) onRefresh();
  };

  const handleSyncPrice = async (e) => {
    e.preventDefault();
    if (!syncPriceInput || isNaN(syncPriceInput)) return;
    setSyncing(true);
    try {
      const res = await fetch('http://localhost:3001/api/mt5/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(syncPriceInput) }),
      });
      if (res.ok) {
        setSyncSuccess(true);
        // Otomatis ubah broker aktif ke EXNESS agar hasil kalibrasi langsung terlihat
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
    { id: 'EXNESS', label: '🔵 Exness (MT5Real36)', server: 'Exness-MT5Real36' },
    { id: 'BINANCE', label: '🟡 Binance', server: 'Binance Live' },
    { id: 'FBS', label: '🟢 FBS', server: 'FBS-Real' },
    { id: 'OCTA', label: '🟣 Octa', server: 'OctaFX-Real' },
  ];

  const TIMEFRAMES = [
    { id: '1m', label: '1m' },
    { id: '5m', label: '5m' },
    { id: '15m', label: '15m' },
    { id: '30m', label: '30m' },
    { id: '1h', label: '1h' },
    { id: '4h', label: '4h' },
    { id: '1d', label: '1D' },
    { id: '1w', label: '1W (Minggu)' },
    { id: '1M', label: '1M (Bulan)' },
    { id: '3M', label: '3M (3 Bulan)' },
    { id: '1Y', label: '1Y (Tahun)' },
  ];

  const SYMBOLS = [
    { id: 'XAUUSD', label: 'XAU/USD (Gold)' },
    { id: 'PAXG/USDT', label: 'PAXG/USDT (Paxos Gold)' },
    { id: 'XAUT/USDT', label: 'XAUT/USDT (Tether Gold)' },
  ];

  const isConnected = wsStatus === 'connected';
  const now = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Jakarta' });

  return (
    <header className="header-gradient flex items-center justify-between px-6 py-2.5 select-none gap-4">
      {/* ── Brand ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cop-gold/10 border border-cop-gold/30 glow-gold">
          <BarChart2 className="w-5 h-5 text-cop-gold" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white leading-none">
            COP TAH Analytics
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">
            {symbol} — {broker}
          </p>
        </div>
      </div>

      {/* ── Realtime 1s Price Ticker ──────────────────────────── */}
      {liveTick?.price && (
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all duration-300 font-mono ${
          liveTick.direction === 'UP'
            ? 'bg-emerald-950/60 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
            : liveTick.direction === 'DOWN'
            ? 'bg-red-950/60 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
            : 'bg-cop-card border-cop-border'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={`relative flex h-2 w-2`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                liveTick.direction === 'UP' ? 'bg-emerald-400' : liveTick.direction === 'DOWN' ? 'bg-red-400' : 'bg-cop-cyan'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                liveTick.direction === 'UP' ? 'bg-emerald-500' : liveTick.direction === 'DOWN' ? 'bg-red-500' : 'bg-cyan-500'
              }`} />
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">1s LIVE</span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`text-base font-black tracking-tight ${
              liveTick.direction === 'UP' ? 'text-emerald-300' : liveTick.direction === 'DOWN' ? 'text-red-300' : 'text-white'
            }`}>
              ${liveTick.price.toFixed(liveTick?.decimals ?? (broker !== 'BINANCE' ? 3 : 2))}
            </span>
            {liveTick.direction === 'UP' && <span className="text-emerald-400 text-xs font-black">▲</span>}
            {liveTick.direction === 'DOWN' && <span className="text-red-400 text-xs font-black">▼</span>}
          </div>

          {liveTick.bid && liveTick.ask && (
            <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-slate-400 border-l border-slate-700/60 pl-2">
              <span>B: <strong className="text-slate-200">{liveTick.bid.toFixed(liveTick?.decimals ?? (broker !== 'BINANCE' ? 3 : 2))}</strong></span>
              <span>A: <strong className="text-slate-200">{liveTick.ask.toFixed(liveTick?.decimals ?? (broker !== 'BINANCE' ? 3 : 2))}</strong></span>
              <span className="text-cop-gold font-bold">({liveTick.spread})</span>
            </div>
          )}
        </div>
      )}

      {/* ── Controls ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Broker / Server Selector */}
        <div className="relative">
          <select
            value={broker}
            onChange={(e) => onBrokerChange && onBrokerChange(e.target.value)}
            className="appearance-none bg-cop-card border border-cop-border text-white text-xs font-semibold px-3 py-1.5 pr-7 rounded-lg cursor-pointer hover:border-cop-gold transition-colors font-mono"
            title="Pilih Server Broker"
          >
            {BROKERS_LIST.map((b) => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Exness MT5 Direct Bridge Pill */}
        <button
          onClick={() => setShowMt5Modal(true)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 border transition-all ${
            linkedAccount?.login || liveTick?.isDirectMT5
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : broker === 'EXNESS'
              ? 'bg-cop-card hover:bg-cop-surface border-cop-border hover:border-cop-gold text-slate-300'
              : 'bg-cop-card hover:bg-cop-surface border-slate-700 hover:border-cop-cyan text-slate-400'
          }`}
          title="Kelola Akun Exness MT5 atau Sinkronisasi Data"
        >
          <Radio className={`w-3 h-3 ${linkedAccount?.login || liveTick?.isDirectMT5 ? 'text-emerald-400 animate-pulse' : 'text-cop-gold'}`} />
          <span>
            {linkedAccount?.login ? `MT5 #${linkedAccount.login}` : broker === 'EXNESS' ? '🔌 Feed MT5 / Akun' : '🔌 Hubungkan MT5'}
          </span>
        </button>

        {/* Symbol Selector */}
        <div className="relative">
          <select
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            className="appearance-none bg-cop-card border border-cop-border text-white text-xs font-semibold px-3 py-1.5 pr-7 rounded-lg cursor-pointer hover:border-cop-blue transition-colors font-mono"
          >
            {SYMBOLS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Timeframe Pills */}
        <div className="flex items-center gap-1 bg-cop-card border border-cop-border rounded-lg p-1 overflow-x-auto max-w-[500px]">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => onTimeframeChange(tf.id)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-semibold whitespace-nowrap transition-colors ${
                timeframe === tf.id
                  ? 'bg-cop-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-cop-accent/50'
              }`}
              title={`Timeframe ${tf.label}`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="btn-ghost"
          title="Refresh Analysis"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="text-xs">Refresh</span>
        </button>
      </div>

      {/* ── Status ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Last Updated */}
        {lastUpdated && (
          <span className="hidden md:inline text-[10px] font-mono text-slate-500">
            {lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        )}

        {/* WS Connection Status */}
        <div className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded border ${
          isConnected
            ? 'text-emerald-400 border-emerald-700/40 bg-emerald-900/20'
            : 'text-red-400 border-red-700/40 bg-red-900/20'
        }`}>
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {isConnected ? 'LIVE' : 'OFFLINE'}
        </div>

        {/* UTC Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cop-gold animate-pulse" />
          <span>{now} WIB</span>
        </div>
      </div>

      {/* ── MT5 Bridge Modal ──────────────────────────────────── */}
      {showMt5Modal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cop-surface border border-cop-border rounded-2xl max-w-lg w-full p-6 shadow-2xl font-mono text-slate-300 space-y-4">
            <div className="flex items-center justify-between border-b border-cop-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-cop-gold" />
                <h3 className="text-sm font-bold text-white">Koneksi Langsung Exness-MT5Real36</h3>
              </div>
              <button
                onClick={() => setShowMt5Modal(false)}
                className="p-1 rounded-lg hover:bg-cop-card text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">

              {/* ── Active Broker Notification ── */}
              {broker !== 'EXNESS' && (
                <div className="p-2.5 rounded-lg bg-blue-950/50 border border-cop-blue/60 text-sky-200 text-xs flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cop-cyan flex-shrink-0" />
                  <span>
                    Broker aktif saat ini: <strong className="text-white">{broker}</strong>. Menghubungkan akun atau menyelaraskan harga akan <strong>otomatis beralih ke Exness (MT5Real36)</strong>.
                  </span>
                </div>
              )}

              {/* ── PILIHAN 1: Masukkan Akun MT5 Langsung ── */}
              <div className="p-3.5 rounded-xl bg-cop-card border border-cop-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cop-gold" />
                    <span className="text-xs font-bold text-white">Opsi 1: Masukkan Akun MT5 Langsung</span>
                  </div>
                  <span className="text-[10px] text-cop-cyan bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    Input Akun
                  </span>
                </div>

                {linkedAccount?.login ? (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/60 flex items-center justify-between">
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
                      className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800 text-red-300 text-[10px] font-bold border border-red-700/60 transition-colors"
                    >
                      Putuskan
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAccountLogin} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Nomor Akun MT5 (Login)</label>
                        <input
                          type="number"
                          placeholder="Cth: 14256381"
                          value={mt5Login}
                          onChange={(e) => setMt5Login(e.target.value)}
                          className="w-full bg-cop-bg border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cop-blue"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Password (Investor / Read-Only)</label>
                        <input
                          type="password"
                          placeholder="Password MT5..."
                          value={mt5Password}
                          onChange={(e) => setMt5Password(e.target.value)}
                          className="w-full bg-cop-bg border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cop-blue"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Server Broker</label>
                        <input
                          type="text"
                          value={mt5Server}
                          onChange={(e) => setMt5Server(e.target.value)}
                          className="w-full bg-cop-bg border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cop-blue"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-emerald-400 block mb-1 font-bold">Harga MT5 Anda Saat Ini (3 digit)</label>
                        <input
                          type="number"
                          step="0.001"
                          placeholder="Cth: 4179.250 (opsional)"
                          value={mt5CurrentPrice}
                          onChange={(e) => setMt5CurrentPrice(e.target.value)}
                          className="w-full bg-cop-bg border border-emerald-700/60 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 leading-tight flex items-start gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cop-cyan flex-shrink-0 mt-0.5" />
                      <span>Tips: Anda dapat menggunakan <strong>Investor Password (Read-Only)</strong> akun Exness Anda agar 100% aman tanpa risiko order.</span>
                    </div>

                    {linkSuccess && (
                      <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Akun MT5 berhasil dihubungkan & beralih ke Exness!
                      </div>
                    )}
                    {linkError && (
                      <div className="p-2 rounded bg-red-950/60 border border-red-500 text-red-300 text-xs">
                        {linkError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={linkingAccount}
                      className="w-full py-2 rounded-lg bg-cop-blue hover:bg-blue-600 text-white text-xs font-bold font-mono transition-colors"
                    >
                      {linkingAccount ? 'Menghubungkan...' : '🚀 Hubungkan Akun MT5'}
                    </button>
                  </form>
                )}
              </div>

              {/* ── PILIHAN 2: Mode Mandiri / Tanpa Buka MT5 ── */}
              <div className="p-3 rounded-xl bg-cop-card border border-cop-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cop-gold">Opsi 2: Mode Mandiri (Tanpa Buka MT5 Sama Sekali)</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Otomatis Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jika Anda tidak ingin memasukkan akun MT5, aplikasi <strong>sudah otomatis mengambil data Spot Gold interbank mandiri</strong> langsung dari pasar fisik London LBMA di kisaran <strong>4,174 – 4,179</strong> tanpa perlu membuka aplikasi MT5.
                </p>
              </div>

              {/* ── PILIHAN 3: Kalibrasi Manual Cepat ── */}
              <div className="p-3 rounded-xl bg-cop-card border border-cop-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Opsi 3: ⚡ Samakan Langsung dengan Harga di Layar MT5</span>
                  {liveTick?.price && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Dashboard: <strong className="text-white">${liveTick.price.toFixed(liveTick?.decimals ?? (broker !== 'BINANCE' ? 3 : 2))}</strong>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ketik harga yang sedang tampil di layar MT5 Anda sekarang (3 digit di belakang koma). Seluruh grafik, Pivot, dan target OP akan disamakan secara presisi:
                </p>
                <form onSubmit={handleSyncPrice} className="flex gap-2">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Contoh: 4179.250"
                    value={syncPriceInput}
                    onChange={(e) => setSyncPriceInput(e.target.value)}
                    className="flex-1 bg-cop-bg border border-emerald-600/60 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={syncing}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    {syncSuccess ? '✓ Terkalibrasi!' : syncing ? '...' : '⚡ Samakan Harga'}
                  </button>
                </form>
              </div>

              {/* ── PILIHAN 4: MQL5 EA Bridge ── */}
              <div className="p-3 rounded-xl bg-cop-card border border-cop-border space-y-2">
                <span className="text-xs font-bold text-cop-cyan">Opsi 4: Pasang EA di MT5 (Jika Membuka Terminal)</span>
                <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Buka file <strong className="text-white">CopTah_Exness_Bridge.mq5</strong> di MetaEditor MT5 Anda, klik <strong>Compile</strong>.</li>
                  <li>Di MT5 buka: <span className="text-slate-300">Tools &gt; Options &gt; Expert Advisors &gt; Centang "Allow WebRequest"</span>, tambahkan: <strong className="text-white">http://localhost:3001</strong></li>
                  <li>Attach EA ke chart XAUUSD. Selesai!</li>
                </ol>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowMt5Modal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-colors"
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

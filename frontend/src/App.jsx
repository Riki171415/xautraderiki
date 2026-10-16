/**
 * COP TAH Analytics Dashboard — Main App
 * Platform Trading Institusional XAUUSD / Gold Berdasarkan 3 Core Theories & 5 Hukum COP TAH
 *
 * Alur Kerja Runtut (Institutional Trading Pipeline):
 *  - Pilar 1: 'global'    ➔ Peta Makro Global (2021 - 2030 Peta Siklus 10 Tahun)
 *  - Pilar 2: 'weekly'    ➔ Trading Plan Mingguan (WEEK 3 — Skenario 2 Arah BUY & SELL HSH)
 *  - Pilar 3: 'dashboard' ➔ Cockpit Eksekusi Live (OHL Intraday, Ladder RS Matrix, Tiket Order, Sesi Pasar)
 *  - Pilar 4: 'terminal'  ➔ Terminal Matriks 17-Kolom & Siklus 12 Langkah Sesi
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import OHLPanel from './components/OHLPanel';
import CandlestickChart from './components/CandlestickChart';
import H4CompassPanel from './components/H4CompassPanel';
import HSHOverview from './components/HSHOverview';
import RSMatrix from './components/RSMatrix';
import OperationalStatus from './components/OperationalStatus';
import StorylineGenerator from './components/StorylineGenerator';
import PendingOrders from './components/PendingOrders';
import SessionStatus from './components/SessionStatus';
import LoadingScreen from './components/LoadingScreen';
import MarketCycleAnalysis from './components/MarketCycleAnalysis';
import Leak4RegTable from './components/Leak4RegTable';
import GlobalStoryline from './components/GlobalStoryline';
import WeeklyTradingPlan from './components/WeeklyTradingPlan';
import MultiTimeframeEntryPlanner from './components/MultiTimeframeEntryPlanner';
import HistoricalDataViewer from './components/HistoricalDataViewer';
import AnalysisGuide from './components/AnalysisGuide';
import {activeSessionAt} from './liveMatrix.mjs';
import { useWebSocket } from './hooks/useWebSocket';
import { useAnalysis, resetTouches } from './hooks/useAnalysis';
import {
  RefreshCw,
  AlertOctagon,
  CheckCircle,
  RotateCcw,
  Table,
  LayoutDashboard,
  Layers,
  Compass,
  Calendar,
  Globe,
  Radio,
  ChevronDown,
  Zap,
  ArrowRight,
  TrendingUp,
  Activity,
  Sparkles,
  Shield,
  Split,
  Target,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
  CandlestickChart as CandlestickIcon
} from 'lucide-react';

export default function App() {
  const [sidebarHidden, setSidebarHidden] = useState(() => { try { return localStorage.getItem('coptah.sidebarHidden') === 'true'; } catch { return false; } });
  useEffect(() => { try { localStorage.setItem('coptah.sidebarHidden', String(sidebarHidden)); } catch {} }, [sidebarHidden]);
  const [symbol, setSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('1h');
  const [broker, setBroker] = useState('EXNESS');
  // Default to Cockpit Eksekusi Live (Pilar 1) or Saran Entry (Pilar 2)
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'entries' | 'weekly' | 'cycle' | 'table' | 'global' | 'all'
  const [terminalTab, setTerminalTab] = useState('both'); // 'table' | 'cycle' | 'both'
  const [notification, setNotification] = useState(null);
  useEffect(() => { document.title = `COP TAH · ${symbol} · ${broker === 'BINANCE' ? 'Binance Spot' : 'Exness MT5'}`; }, [symbol, broker]);

  // ── Data Sources ───────────────────────────────────────────────────────────
  const { data: wsData, liveTick: rawTick, status: wsStatus, error: wsError, reconnectCount, isLoading: wsLoading, sendMessage } = useWebSocket();
  const { data: restData, loading, error: restError, lastUpdated, refetch } = useAnalysis(symbol, timeframe, broker, 30000);

  const [clock, setClock] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const tickAge = rawTick ? Math.max(0, Math.floor((clock - rawTick.timestamp) / 1000)) : null;
  const liveTick = rawTick?.broker === broker && rawTick?.symbol === symbol && tickAge < 10 ? rawTick : null;
  const previousSession=useRef(activeSessionAt(clock));
  const activeSession=activeSessionAt(clock);
  useEffect(()=>{
    if(previousSession.current!==activeSession) {
      previousSession.current=activeSession;
      refetch();
    }
  },[activeSession,refetch]);
  const wsMatches =
    Boolean(wsData) &&
    (wsData.symbol === symbol ||
      wsData.marketSymbol === symbol ||
      (symbol === 'XAUUSD' && wsData.symbol?.includes('XAU'))) &&
    wsData.timeframe === timeframe &&
    (!wsData.broker || wsData.broker.id === broker);
  const data = wsMatches && (!restData || wsData.timestamp >= restData.timestamp) ? wsData : restData;

  // Subscribe to live feed (Stale-While-Revalidate: do NOT blank out screen)
  useEffect(() => {
    sendMessage({ type: 'subscribe', symbol, timeframe, broker });
  }, [symbol, timeframe, broker, sendMessage]);

  // HSH Critical notification
  useEffect(() => {
    if (data?.hsh?.hshSeverity === 'CRITICAL') {
      showNotification('warning', data.hsh.hshMessage);
    }
  }, [data?.hsh?.hshSeverity]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message, id: Date.now() });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleRefresh = useCallback(async () => {
    const result = await refetch();
    showNotification(result ? 'info' : 'warning', result ? 'Analisis berhasil diperbarui' : 'Pembaruan gagal. Periksa koneksi sumber data.');
  }, [refetch, showNotification]);

  const handleResetTouches = useCallback(async () => {
    await resetTouches();
    refetch();
    showNotification('info', 'Sensor sentuhan RS Matrix berhasil di-reset');
  }, [refetch, showNotification]);

  const handleModalUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSymbolChange = useCallback((newSymbol) => {
    setSymbol(newSymbol);
    if (newSymbol.includes('PAXG') || newSymbol.includes('XAUT')) {
      if (broker !== 'BINANCE') {
        setBroker('BINANCE');
        showNotification('info', `Simbol kripto ${newSymbol} dialihkan ke feed Binance Spot/Futures`);
      }
    }
  }, [broker, showNotification]);

  const handleBrokerChange = useCallback((newBroker) => {
    setBroker(newBroker);
    if (newBroker === 'BINANCE' && symbol === 'XAUUSD') {
      setSymbol('PAXG/USDT');
      showNotification('info', 'Binance memakai instrumen PAXG/USDT, bukan harga XAUUSD Exness.');
    }
    if (newBroker !== 'BINANCE' && (symbol.includes('PAXG') || symbol.includes('XAUT'))) {
      setSymbol('XAUUSD');
      showNotification('info', `Broker ${newBroker} disesuaikan ke instrumen Gold Spot XAUUSD`);
    }
  }, [symbol, showNotification]);

  // ── Current Telemetry Quick Stats ──────────────────────────────────────────
  const currentPrice = liveTick?.bid ?? data?.ohlcv_N?.close ?? null;
  const weeklyRow = data?.leak4RegMatrix?.tableRows?.find(
    (r) => r.timeframe === '1w' || r.label?.includes('WEEK') || r.label?.includes('1w')
  );
  const isWeeklyUp = weeklyRow ? parseFloat(weeklyRow.openN) >= parseFloat(weeklyRow.openB) : true;
  const weekLabel = weeklyRow?.label || 'WEEK_3';

  // ── 6 Top-Level Workflow Navigation Pillars ────────────────────────────────
  const WORKFLOW_PILLARS = [
    {
      id: 'dashboard',
      pillarNum: '1',
      title: 'Cockpit Live',
      shortTitle: '1. Cockpit Live',
      icon: Zap,
      badge: 'Live',
      desc: 'OHL Intraday, Tangga RS, Tiket Order & Telemetri Pasar'
    },
    {
      id: 'candles',
      title: 'Candlestick & Fractal',
      shortTitle: 'Candlestick',
      icon: CandlestickIcon,
      badge: 'Chart',
      desc: `Grafik ${symbol} · ${broker}, fractal, Open N, level RS dan plan COP TAH`
    },
    {
      id: 'entries',
      pillarNum: '2',
      title: 'Saran Entry (5m–1D)',
      shortTitle: '2. Saran Entry',
      icon: Target,
      badge: '6 TF + Rambu',
      desc: 'Rekomendasi Titik Entry 5m, 15m, 30m, 1h, 4h, 1d dengan Rambu COP TAH'
    },
    {
      id: 'weekly',
      pillarNum: '3',
      title: `Plan ${weekLabel}`,
      shortTitle: `3. Plan ${weekLabel}`,
      icon: Calendar,
      badge: '2 Arah',
      desc: 'Trading Plan Mingguan 2 Arah (BUY & SELL HSH)'
    },
    {
      id: 'cycle',
      pillarNum: '4',
      title: 'Market Cycle',
      shortTitle: '4. Market Cycle',
      icon: Compass,
      badge: '12 Sesi',
      desc: 'Siklus 12 Sesi Harian, Angka Riil & Analisa 2 Arah Intraday'
    },
    {
      id: 'table',
      pillarNum: '5',
      title: 'Tabel Matriks',
      shortTitle: '5. Tabel Matriks',
      icon: Table,
      badge: '17 Kolom',
      desc: 'Matriks 17 Kolom & 9 Level Support Resistance dengan Kotak Posisi Live'
    },
    {
      id: 'global',
      pillarNum: '6',
      title: 'Peta Global (2021–2030)',
      shortTitle: '6. Peta Global',
      icon: Globe,
      badge: 'Makro',
      desc: 'Siklus 10 Tahun Emas & Posisi Real 2026 Q4'
    },
    {id:'guide',title:'Panduan Analisis',shortTitle:'Panduan',icon:Compass,desc:'Pembacaan 10 tahun sampai timeframe kecil, dengan H4 sebagai kunci'},
    {
      id: 'history',
      pillarNum: '7',
      title: `Historis ${broker === 'BINANCE' ? 'Binance' : 'Exness'}`,
      shortTitle: '7. Historis',
      icon: Database,
      badge: 'MN1',
      desc: `Riwayat bulanan ${symbol} dari ${broker === 'BINANCE' ? 'Binance Spot' : 'MT5 Exness'}`
    }
  ];

  // ── Loading State ──────────────────────────────────────────────────────────
  if (!data && loading && !restError) {
    return (
      <LoadingScreen
        status={wsStatus}
        error={wsError || restError}
        reconnectCount={reconnectCount}
      />
    );
  }

  return (
    <div className={`premium-app min-h-screen bg-cop-bg flex flex-col overflow-hidden text-slate-100 ${sidebarHidden ? 'sidebar-hidden' : ''}`}>
      <button type="button" className="sidebar-toggle" onClick={() => setSidebarHidden(v => !v)} aria-expanded={!sidebarHidden} aria-controls="workspace-navigation" aria-label={sidebarHidden ? 'Tampilkan menu navigasi' : 'Sembunyikan menu navigasi'} title={sidebarHidden ? 'Tampilkan menu' : 'Sembunyikan menu'}>
        {sidebarHidden ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        <span>{sidebarHidden ? 'Menu' : 'Tutup menu'}</span>
      </button>
      {/* ── 1. Institutional Header ── */}
      <Header
        symbol={symbol}
        timeframe={timeframe}
        broker={broker}
        liveTick={liveTick}
        wsStatus={wsStatus}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        onSymbolChange={handleSymbolChange}
        onTimeframeChange={setTimeframe}
        onBrokerChange={handleBrokerChange}
      />

      {/* ── Notification Toast ── */}
      {notification && (
        <div
          className={`fixed top-16 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-mono backdrop-blur-xl transition-all duration-300 max-w-md animate-tick-flash ${
            notification.type === 'warning'
              ? 'bg-rose-950/90 border-rose-500/70 text-rose-200 shadow-glow-red'
              : 'bg-cop-surface/95 border-amber-500/40 text-amber-200 shadow-glow-gold-sm'
          }`}
        >
          {notification.type === 'warning' ? (
            <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span className="leading-relaxed">{notification.message}</span>
        </div>
      )}

      {/* ── Error Banner ── */}
      {(wsError || restError) && !data && (
        <div className="bg-rose-950/50 border-b border-rose-800/40 px-6 py-2 flex items-center gap-2 text-xs font-mono text-rose-300">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          Koneksi terganggu: {wsError || restError} — Menghubungkan ulang secara otomatis...
        </div>
      )}

      {!data && !loading && <section className="mx-4 my-5 p-5 rounded-2xl border border-amber-700 bg-slate-900 text-slate-200" role="status">
        <h2 className="text-lg font-bold text-amber-300">Aplikasi terbuka · sumber data belum terhubung</h2>
        <p className="mt-2 text-sm">{restError || 'Menunggu server analisis dan bridge MT5.'}</p>
        <p className="mt-2 text-sm text-slate-400">Jika memakai Vercel, server analisis harus tersedia melalui HTTPS dan terhubung ke MT5 komputer atau VPS. MT5 di tablet tidak mengirim data langsung ke aplikasi ini. Angka analisis ditampilkan setelah sumber berhasil terhubung.</p>
        <button type="button" onClick={handleRefresh} className="chart-toggle mt-4">Coba hubungkan kembali</button>
      </section>}

      {/* ── 2. WORKFLOW NAVIGATION BAR (6 PILAR UTAMA COP TAH) ── */}
      <div id="workspace-navigation" aria-label="Navigasi workspace" className="workflow-nav bg-cop-surface/95 border-b border-cop-border/80 backdrop-blur-md px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="sidebar-brand"><div className="sidebar-monogram">CT<span>•</span></div><div><strong>COP TAH</strong><small>GOLD ANALYTICS</small></div></div>
        <div className="sidebar-caption">WORKSPACE</div>
        <label className="mobile-page-picker"><span>Menu analisis</span><select aria-label="Pilih menu analisis" value={viewMode} onChange={e=>setViewMode(e.target.value)}>{WORKFLOW_PILLARS.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
        {/* Left: 6 Pilar Workflow Controller */}
        <div className="flex items-center gap-1.5 p-1 bg-cop-card/90 rounded-2xl border border-cop-border shadow-sm flex-wrap">
          {WORKFLOW_PILLARS.map((p) => {
            const Icon = p.icon;
            const isActive = viewMode === p.id;
            return (
              <button
                key={p.id}
                aria-current={viewMode === p.id ? 'page' : undefined}
                onClick={() => setViewMode(p.id)}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                title={p.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? '' : 'text-slate-400'}`} />
                <span className="hidden sm:inline nav-label">{p.title}</span>
                <span className="sm:hidden nav-label">{p.shortTitle.replace(/^\d+\. /, '')}</span>
              </button>
            );
          })}


        </div>

        <div className="sidebar-footnote"><span className="sidebar-status-dot"/> {broker} DATA<span>H4 COMPASS</span></div>
        {/* Right: Quick Action Reset RS & Market Telemetry Pill */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-cop-card border border-cop-border text-[11px]">
            <span className="text-slate-400">Harga Live:</span>
            <strong className="text-white tabular-nums">{currentPrice == null ? '—' : `$${currentPrice.toFixed(data?.decimals ?? 3)}`}</strong>
            <span className="text-slate-600">·</span>
            <span className={`font-bold ${isWeeklyUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              1W JIKA {isWeeklyUp ? 'UP' : 'DOWN'}
            </span>
          </div>

          <button
            onClick={handleResetTouches}
            className="btn-ghost text-[11px] flex items-center gap-1.5 px-2.5 py-1.5"
            title="Reset sensor deteksi sentuhan level RS"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Reset RS</span>
          </button>
        </div>
      </div>

      <div className="workspace-summary" role="status" aria-live="polite">
        <div><span className="workspace-eyebrow">GOLD INTELLIGENCE <span className="mx-2">/</span> {symbol} <span className="mx-2">/</span> {timeframe}</span>
          <h1>{WORKFLOW_PILLARS.find(p => p.id === viewMode)?.title || 'Analisis'} <span className="workspace-instrument">{symbol} · {broker === 'BINANCE' ? 'Binance Spot' : 'Exness MT5'}</span></h1>
          <p>{WORKFLOW_PILLARS.find(p => p.id === viewMode)?.desc || 'Pilih menu analisis'}</p>
        </div>
        <div className={`feed-health ${liveTick ? 'feed-health-fresh' : ''}`}>
          <span className="feed-dot" />
          <div><strong>{liveTick ? (liveTick.isDirectMT5 ? 'MT5 langsung' : 'Binance · polling 1 detik') : 'Menunggu harga terbaru'}</strong>
          <small>{liveTick ? `${liveTick.source || broker} · diterima ${tickAge} dtk lalu` : (data?.dataSource || 'Harga lama tidak ditampilkan sebagai live')}</small></div>
        </div>
      </div>

      {/* ── 4. MAIN WORKSPACE CONTAINER ── */}
      <main className="workspace-main flex-1 p-4 lg:p-6 space-y-6">
        {viewMode === 'guide' && <AnalysisGuide data={data} />}
        {data && clock-data.timestamp>45000 && <p role="status" className="p-3 border border-amber-700 rounded-xl text-sm text-amber-200">Analisis belum diperbarui lebih dari 45 detik. Angka terakhir bukan kondisi terbaru; periksa bridge dan koneksi.</p>}
        <H4CompassPanel analysis={data?.h4Compass} decimals={data?.decimals} selected={timeframe} onSelect={setTimeframe} />
        <HSHOverview data={data} liveTick={liveTick} onSelect={setTimeframe} />
        <details className="data-notes"><summary>Informasi sumber data & perhitungan</summary><p className="text-[11px] text-slate-400 leading-relaxed mt-2">Basis harga: Bid {broker === 'BINANCE' ? 'Binance Spot' : 'Exness MT5'}. Perbedaan waktu snapshot dapat menyebabkan selisih sesaat antar-panel. Angka estimasi uang/lot pada plan masih memakai rumus metode, belum divalidasi terhadap ukuran kontrak dan mata uang akun; jangan dianggap sebagai profit/rugi akun. Level tersentuh bukan bukti transaksi atau profit.</p></details>
        {(viewMode === 'candles') && (
          <CandlestickChart data={data} liveTick={liveTick} symbol={symbol} timeframe={timeframe} broker={broker} />
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 1: COCKPIT EKSEKUSI LIVE (DASHBOARD REAL-TIME)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'dashboard') && (
          <div className="space-y-5">

            {/* 1. OHL Metrics & Intraday Range Bar */}
            <OHLPanel data={data} liveTick={liveTick} />

            {/* 2. Dual Panel: RS Matrix + Order Execution Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 flex flex-col">
                <RSMatrix data={data} liveTick={liveTick} />
              </div>

              <div className="lg:col-span-7 flex flex-col">
                <PendingOrders data={data} liveTick={liveTick} onModalUpdate={handleModalUpdate} />
              </div>
            </div>

            {/* 3. Bottom Grid: Operational Status, Session Status & AI Storyline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-4">
                <OperationalStatus data={data} />
              </div>
              <div className="lg:col-span-4">
                <SessionStatus data={data} />
              </div>
              <div className="lg:col-span-4">
                <StorylineGenerator data={data} />
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 2: REKOMENDASI ENTRY MULTI-TIMEFRAME (5M - 1D) + RAMBU COP TAH
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'entries') && (
          <div className="space-y-4">
            <MultiTimeframeEntryPlanner data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 3: TRADING PLAN MINGGUAN (REAL MARKET DATA 1W)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'weekly') && (
          <div className="space-y-4">
            <WeeklyTradingPlan data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 4: MARKET CYCLE (SIKLUS 12 SESI HARIAN)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'cycle' || viewMode === 'terminal') && (
          <div className="space-y-4">
            <MarketCycleAnalysis data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 5: TABEL MATRIKS MULTI-TIMEFRAME (17 KOLOM)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'table' || viewMode === 'terminal') && (
          <div className="space-y-4">
            <Leak4RegTable data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 6: PETA GLOBAL COP TAH (2021 – 2030)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'global') && (
          <div className="space-y-4">
            <GlobalStoryline data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 7: DATA HISTORIS XAUUSD (2000 – 2026) & 5 HUKUM COP TAH
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'history') && (
          <div className="space-y-4">
            <HistoricalDataViewer key={`${broker}|${symbol}`} broker={broker} symbol={symbol} />
          </div>
        )}

      </main>

      {/* ── 5. Terminal Footer ── */}
      <footer className="border-t border-cop-border/80 px-4 lg:px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-cop-surface/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-cop-gold font-bold">COP TAH Engine</span>
          <span>·</span>
          <span>Gold Analytics · {symbol} · {broker}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-400">
          <span>3 Core Theories</span>
          <span>·</span>
          <span>5 Trading Laws</span>
          <span>·</span>
          <span className="text-emerald-400">Multi-TF Confluence</span>
        </div>
        <div className="text-slate-400">
          Feed: <strong className="text-slate-200">{data?.broker?.name || broker}</strong>
        </div>
      </footer>
    </div>
  );
}

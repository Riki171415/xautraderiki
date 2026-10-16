/**
 * COP TAH Analytics Dashboard — Main App
 * Platform Trading Institusional XAUUSD / Gold Berdasarkan 3 Core Theories & 5 Hukum COP TAH
 *
 * Alur Kerja Runtut (Institutional Trading Pipeline):
 *  - Pilar 1: 'global'    ➔ Peta Makro Global (2021 - 2030 Peta Siklus 10 Tahun)
 *  - Pilar 2: 'weekly'    ➔ Trading Plan Mingguan (WEEK 3 — Skenario 2 Arah BUY & SELL HSH)
 *  - Pilar 3: 'dashboard' ➔ Cockpit Eksekusi Live (OHL Intraday, Ladder RS Matrix, Tiket Order, Sesi Pasar)
 *  - Pilar 4: 'terminal'  ➔ Terminal Matriks 17-Kolom & Siklus 12 Langkah Sesi
 *  - 'all': Semua Bagian Terintegrasi (All-in-One View)
 */

import { useState, useEffect, useCallback } from 'react';
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
  Maximize2,
  Sparkles,
  Shield,
  Split,
  Target,
  Database,
  CandlestickChart as CandlestickIcon
} from 'lucide-react';

export default function App() {
  const [symbol, setSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('1h');
  const [broker, setBroker] = useState('EXNESS');
  // Default to Cockpit Eksekusi Live (Pilar 1) or Saran Entry (Pilar 2)
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'entries' | 'weekly' | 'cycle' | 'table' | 'global' | 'all'
  const [terminalTab, setTerminalTab] = useState('both'); // 'table' | 'cycle' | 'both'
  const [notification, setNotification] = useState(null);

  // ── Data Sources ───────────────────────────────────────────────────────────
  const { data: wsData, liveTick: rawTick, status: wsStatus, error: wsError, reconnectCount, isLoading: wsLoading, sendMessage } = useWebSocket();
  const { data: restData, loading, error: restError, lastUpdated, refetch } = useAnalysis(symbol, timeframe, broker, 30000);

  const [clock, setClock] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const tickAge = rawTick ? Math.max(0, Math.floor((clock - rawTick.timestamp) / 1000)) : null;
  const liveTick = rawTick?.broker === broker && rawTick?.symbol === symbol && tickAge < 10 ? rawTick : null;
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
      desc: 'Grafik candle Exness, fractal, Open N, level RS dan plan COP TAH'
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
    {
      id: 'history',
      pillarNum: '7',
      title: 'Historis Exness',
      shortTitle: '7. Historis',
      icon: Database,
      badge: 'MN1',
      desc: 'Riwayat bulanan asli sesuai ketersediaan terminal Exness'
    }
  ];

  // ── Loading State ──────────────────────────────────────────────────────────
  if (!data && (loading || wsStatus === 'connecting')) {
    return (
      <LoadingScreen
        status={wsStatus}
        error={wsError || restError}
        reconnectCount={reconnectCount}
      />
    );
  }

  return (
    <div className="premium-app min-h-screen bg-cop-bg flex flex-col overflow-hidden text-slate-100">
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

      {/* ── 2. WORKFLOW NAVIGATION BAR (6 PILAR UTAMA COP TAH) ── */}
      <div className="workflow-nav bg-cop-surface/95 border-b border-cop-border/80 backdrop-blur-md px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="sidebar-brand"><div className="sidebar-monogram">CT<span>•</span></div><div><strong>COP TAH</strong><small>GOLD ANALYTICS</small></div></div>
        <div className="sidebar-caption">WORKSPACE</div>
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

          {/* Opsi Tampilkan Semua (All-in-One) */}
          <button
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              viewMode === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Tampilkan Semua Pilar Sekaligus"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Semua Bagian</span>
          </button>
        </div>

        <div className="sidebar-footnote"><span className="sidebar-status-dot"/> EXNESS DATA<span>H4 COMPASS</span></div>
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
          <h1>{WORKFLOW_PILLARS.find(p => p.id === viewMode)?.title || 'Semua Bagian'}</h1>
          <p>{WORKFLOW_PILLARS.find(p => p.id === viewMode)?.desc || 'Seluruh analisis dalam satu tampilan'}</p>
        </div>
        <div className={`feed-health ${liveTick ? 'feed-health-fresh' : ''}`}>
          <span className="feed-dot" />
          <div><strong>{liveTick ? (liveTick.isDirectMT5 ? 'MT5 langsung' : 'Binance · polling 1 detik') : 'Menunggu harga terbaru'}</strong>
          <small>{liveTick ? `${liveTick.source || broker} · diterima ${tickAge} dtk lalu` : (data?.dataSource || 'Harga lama tidak ditampilkan sebagai live')}</small></div>
        </div>
      </div>

      {/* ── 4. MAIN WORKSPACE CONTAINER ── */}
      <main className="workspace-main flex-1 p-4 lg:p-6 space-y-6">
        <H4CompassPanel analysis={data?.h4Compass} decimals={data?.decimals} selected={timeframe} onSelect={setTimeframe} />
        <HSHOverview data={data} liveTick={liveTick} onSelect={setTimeframe} />
        <details className="data-notes"><summary>Informasi sumber data & perhitungan</summary><p className="text-[11px] text-slate-400 leading-relaxed mt-2">Basis harga: Bid Exness. Perbedaan waktu snapshot dapat menyebabkan selisih sesaat antar-panel. Angka estimasi uang/lot pada plan masih memakai rumus metode, belum divalidasi terhadap ukuran kontrak dan mata uang akun; jangan dianggap sebagai profit/rugi akun. Level tersentuh bukan bukti transaksi atau profit.</p></details>
        {(viewMode === 'candles' || viewMode === 'all') && (
          <CandlestickChart data={data} liveTick={liveTick} symbol={symbol} timeframe={timeframe} broker={broker} />
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 1: COCKPIT EKSEKUSI LIVE (DASHBOARD REAL-TIME)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'dashboard' || viewMode === 'all') && (
          <div className="space-y-5">
            {viewMode === 'all' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60 font-mono">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pilar 1: Cockpit Eksekusi Live (Real-Time Intraday)
                </h2>
              </div>
            )}

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
        {(viewMode === 'entries' || viewMode === 'all') && (
          <div className="space-y-4">
            {viewMode === 'all' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60 font-mono">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pilar 2: Saran Titik Entry (5m, 15m, 30m, 1h, 4h, 1d) & Rambu COP TAH
                </h2>
              </div>
            )}
            <MultiTimeframeEntryPlanner data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 3: TRADING PLAN MINGGUAN (REAL MARKET DATA 1W)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'weekly' || viewMode === 'all') && (
          <div className="space-y-4">
            {viewMode === 'all' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60 font-mono">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pilar 3: Trading Plan Mingguan 2 Arah (Real Market Data)
                </h2>
              </div>
            )}
            <WeeklyTradingPlan data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 4: MARKET CYCLE (SIKLUS 12 SESI HARIAN)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'cycle' || viewMode === 'terminal' || viewMode === 'all') && (
          <div className="space-y-4">
            {viewMode === 'all' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60 font-mono">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pilar 4: Analisis Siklus Pasar 12 Sesi & Skenario 2 Arah
                </h2>
              </div>
            )}
            <MarketCycleAnalysis data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 5: TABEL MATRIKS MULTI-TIMEFRAME (17 KOLOM)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'table' || viewMode === 'terminal' || viewMode === 'all') && (
          <div className="space-y-4">
            {viewMode === 'all' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60 font-mono">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pilar 5: Tabel Matriks Multi-Timeframe 17-Kolom & 9 Level RS
                </h2>
              </div>
            )}
            <Leak4RegTable data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 6: PETA GLOBAL COP TAH (2021 – 2030)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'global' || viewMode === 'all') && (
          <div className="space-y-4">
            {viewMode === 'all' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60 font-mono">
                <div className="w-2.5 h-2.5 rounded-full bg-cop-gold" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pilar 6: Peta Makro Global COP TAH (2021 – 2030)
                </h2>
              </div>
            )}
            <GlobalStoryline data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 7: DATA HISTORIS XAUUSD (2000 – 2026) & 5 HUKUM COP TAH
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'history' || viewMode === 'all') && (
          <div className="space-y-4">
            {viewMode === 'all' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60 font-mono">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pilar 7: Data Historis XAUUSD (2000 – 2026) & Klasifikasi 5 Hukum COP TAH
                </h2>
              </div>
            )}
            <HistoricalDataViewer liveTick={liveTick} />
          </div>
        )}

      </main>

      {/* ── 5. Terminal Footer ── */}
      <footer className="border-t border-cop-border/80 px-4 lg:px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-cop-surface/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-cop-gold font-bold">COP TAH Engine</span>
          <span>·</span>
          <span>Institutional Gold Platform (XAUUSD)</span>
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

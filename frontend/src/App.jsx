/**
 * COP TAH Analytics Dashboard — Main App
 * Institutional Trading Analytics for XAUUSD/PAXG
 *
 * View Modes:
 *  - 'dashboard': Executive Dashboard (OHL, RS Matrix, Pending Orders, Operational Status, Narrative)
 *  - 'weekly': Trading Plan Mingguan (Real Market Data 1W Plan & Execution Map)
 *  - 'global': Alur Cerita Global COP TAH (2021 - 2030 Peta Siklus 10 Tahun)
 *  - 'table': Multi-Timeframe Matrix Terminal (17-column Leak4Reg Matrix & 9-column RS)
 *  - 'cycle': Market Cycle 12-Step Timeline & Sub-Alur Fraktal
 *  - 'both': All-in-One Integrated View
 */

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import OHLPanel from './components/OHLPanel';
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
import { useWebSocket } from './hooks/useWebSocket';
import { useAnalysis } from './hooks/useAnalysis';
import { resetTouches } from './hooks/useAnalysis';
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
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [symbol, setSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('1h');
  const [broker, setBroker] = useState('EXNESS');
  // OPSI A: Executive Dashboard as default view mode
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'weekly' | 'global' | 'table' | 'cycle' | 'both'
  const [notification, setNotification] = useState(null);

  // ── Data Sources ───────────────────────────────────────────────────────────
  const { data: wsData, liveTick, status: wsStatus, error: wsError, reconnectCount, isLoading: wsLoading, sendMessage, clearData } = useWebSocket();
  const { data: restData, loading, error: restError, lastUpdated, refetch } = useAnalysis(symbol, timeframe, broker, 30000);

  const wsMatches =
    Boolean(wsData) &&
    (wsData.symbol === symbol ||
      wsData.marketSymbol === symbol ||
      (symbol === 'XAUUSD' && wsData.symbol?.includes('XAU'))) &&
    wsData.timeframe === timeframe &&
    (!wsData.broker || wsData.broker.id === broker);
  const data = wsMatches ? wsData : restData;

  useEffect(() => {
    clearData();
    sendMessage({ type: 'subscribe', symbol, timeframe, broker });
    refetch();
  }, [symbol, timeframe, broker]);

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

  const handleRefresh = useCallback(() => {
    refetch();
    showNotification('info', 'Analisis data berhasil diperbarui');
  }, [refetch, showNotification]);

  const handleResetTouches = useCallback(async () => {
    await resetTouches();
    refetch();
    showNotification('info', 'Sensor sentuhan RS Matrix berhasil di-reset');
  }, [refetch, showNotification]);

  const handleModalUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cop-bg flex flex-col overflow-hidden text-slate-100">
      {/* ── Institutional Header ── */}
      <Header
        symbol={symbol}
        timeframe={timeframe}
        broker={broker}
        liveTick={liveTick}
        wsStatus={wsStatus}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        onSymbolChange={setSymbol}
        onTimeframeChange={setTimeframe}
        onBrokerChange={setBroker}
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

      {/* ── Institutional Toolbar Strip ── */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-2 bg-cop-surface/80 border-b border-cop-border/80 backdrop-blur-md flex-wrap gap-2">
        {/* Left: Feed Telemetry */}
        <div className="flex items-center gap-2.5">
          {data && (
            <>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Feed:</span>
              <span className="text-[11px] font-mono font-bold text-cop-gold flex items-center gap-1.5 bg-amber-950/30 px-2 py-0.5 rounded-lg border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {data.broker?.name || broker} ({data.broker?.server || 'Interbank CFD'})
              </span>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                {data.symbol} · TF: <strong className="text-white">{data.timeframe}</strong> · Spread: <strong className="text-cop-cyan">{data.broker?.spreadLabel || '1.2 pips'}</strong>
              </span>
            </>
          )}
        </div>

        {/* Right: View Mode Segmented Switcher & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented View Mode Controller */}
          <div className="flex items-center gap-1 bg-cop-card/90 p-1 rounded-xl border border-cop-border shadow-sm flex-wrap">
            {/* 1. Dashboard */}
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-glow-gold-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Executive Dashboard (Tampilan Utama)"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {/* 2. Weekly Trading Plan (NEW!) */}
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'weekly'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-glow-green-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Trading Plan Mingguan Berdasarkan Data Pasar Nyata 1W"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Plan Mingguan</span>
            </button>

            {/* 3. Global Storyline 2021-2030 (NEW!) */}
            <button
              onClick={() => setViewMode('global')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'global'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-glow-gold-sm font-black'
                  : 'text-cop-gold hover:text-white hover:bg-amber-500/10'
              }`}
              title="Alur Cerita Global COP TAH (2021 – 2030 Peta Siklus 10 Tahun)"
            >
              <Globe className="w-3.5 h-3.5 text-cop-gold" />
              <span>Cerita 2021-2030</span>
            </button>

            {/* 4. Matrix Table */}
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-cop-blue text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Multi-Timeframe Matrix Terminal"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabel Matriks</span>
            </button>

            {/* 5. Market Cycle */}
            <button
              onClick={() => setViewMode('cycle')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'cycle'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Siklus 12 Langkah Sesi Harian"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Market Cycle</span>
            </button>

            {/* 6. All-in-One */}
            <button
              onClick={() => setViewMode('both')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'both'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Tampilkan Semua Bagian Secara Lengkap"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Semua</span>
            </button>
          </div>

          <button
            onClick={handleResetTouches}
            className="btn-ghost text-[11px]"
            title="Reset deteksi sentuhan level RS"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span className="hidden md:inline">Reset RS</span>
          </button>
        </div>
      </div>

      {/* ── Main Dashboard Workspace ── */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        {/* ── VIEW 1: EXECUTIVE DASHBOARD (DEFAULT OPSI A) ── */}
        {(viewMode === 'dashboard' || viewMode === 'both') && (
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

        {/* ── VIEW 2: TRADING PLAN MINGGUAN (REAL MARKET DATA) ── */}
        {(viewMode === 'weekly' || viewMode === 'both') && (
          <div className="space-y-4">
            {viewMode === 'both' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Trading Plan Mingguan (Real Market Data)
                </h2>
              </div>
            )}
            <WeeklyTradingPlan data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ── VIEW 3: ALUR CERITA GLOBAL COP TAH (2021 – 2030) ── */}
        {(viewMode === 'global' || viewMode === 'both') && (
          <div className="space-y-4">
            {viewMode === 'both' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60">
                <div className="w-2.5 h-2.5 rounded-full bg-cop-gold" />
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Alur Cerita Global COP TAH (2021 – 2030)
                </h2>
              </div>
            )}
            <GlobalStoryline data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ── VIEW 4: MULTI-TIMEFRAME MATRIX TERMINAL TABLE ── */}
        {(viewMode === 'table' || viewMode === 'both') && (
          <div className="space-y-4">
            {viewMode === 'both' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60">
                <div className="w-2.5 h-2.5 rounded-full bg-cop-blue" />
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Matriks Multi-Timeframe COP TAH
                </h2>
              </div>
            )}
            <Leak4RegTable data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ── VIEW 5: MARKET CYCLE & SUB-ALUR FRAKTAL ── */}
        {(viewMode === 'cycle' || viewMode === 'both') && (
          <div className="space-y-4">
            {viewMode === 'both' && (
              <div className="flex items-center gap-2 pt-2 border-t border-cop-border/60">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Analisis Siklus Pergerakan & Sub-Alur Fraktal
                </h2>
              </div>
            )}
            <MarketCycleAnalysis data={data} />
          </div>
        )}

      </main>

      {/* ── Terminal Footer ── */}
      <footer className="border-t border-cop-border/80 px-4 lg:px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-cop-surface/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-cop-gold font-bold">COP TAH Engine</span>
          <span>·</span>
          <span>Institutional Gold Terminal</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-400">
          <span>3 Core Theories</span>
          <span>·</span>
          <span>5 Trading Laws</span>
          <span>·</span>
          <span className="text-emerald-400">Multi-TF Confluence</span>
        </div>
        <div className="text-slate-400">
          Exness & Binance Interbank Feed
        </div>
      </footer>
    </div>
  );
}

/**
 * COP TAH Analytics Dashboard — Main App
 * Full-stack trading analytics for XAUUSD/PAXG on Binance
 *
 * Architecture:
 *  - WebSocket (primary): Live data stream from backend
 *  - REST polling (fallback): Every 30s if WS unavailable
 *  - Rule Engine: JIKA, Perahu, Busur, RS Matrix, HSH, Lot Calc
 *  - Fractal Storytelling: Narrative generator per timeframe
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
import { useWebSocket } from './hooks/useWebSocket';
import { useAnalysis } from './hooks/useAnalysis';
import { resetTouches } from './hooks/useAnalysis';
import { RefreshCw, AlertOctagon, CheckCircle, RotateCcw, Table, LayoutDashboard, Layers } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

export default function App() {
  const [symbol, setSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('1h');
  const [broker, setBroker] = useState('EXNESS');
  const [viewMode, setViewMode] = useState('both'); // 'table' | 'dashboard' | 'both'
  const [notification, setNotification] = useState(null);

  // ── Data Sources ───────────────────────────────────────────────────────────
  // Primary: WebSocket
  const { data: wsData, liveTick, status: wsStatus, error: wsError, reconnectCount, isLoading: wsLoading, sendMessage, clearData } = useWebSocket();

  // Fallback: REST API polling (every 30s)
  const { data: restData, loading, error: restError, lastUpdated, refetch } = useAnalysis(symbol, timeframe, broker, 30000);

  // Merge: ONLY use wsData if it matches the currently selected symbol+timeframe+broker.
  // Otherwise the auto-broadcast would override REST data for other timeframes or brokers.
  const wsMatches =
    Boolean(wsData) &&
    (wsData.symbol === symbol ||
      wsData.marketSymbol === symbol ||
      (symbol === 'XAUUSD' && wsData.symbol?.includes('XAU'))) &&
    wsData.timeframe === timeframe &&
    (!wsData.broker || wsData.broker.id === broker);
  const data = wsMatches ? wsData : restData;

  // When symbol/timeframe/broker changes: clear stale wsData immediately, notify WS, refetch REST
  useEffect(() => {
    clearData();                                                   // wipe old WS data so it doesn't override
    sendMessage({ type: 'subscribe', symbol, timeframe, broker }); // tell backend to push new broker/TF data
    refetch();                                                     // immediately call REST API
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
    setTimeout(() => setNotification(null), 6000);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
    showNotification('info', 'Analysis refreshed');
  }, [refetch]);

  const handleResetTouches = useCallback(async () => {
    await resetTouches();
    refetch();
    showNotification('info', 'Touch detection reset');
  }, [refetch]);

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
    <div className="min-h-screen bg-cop-bg flex flex-col overflow-hidden">
      {/* ── Header ── */}
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
        <div className={`fixed top-16 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-mono transition-all duration-300 max-w-md ${
          notification.type === 'warning'
            ? 'bg-red-950/90 border-red-600/60 text-red-300'
            : 'bg-cop-surface border-cop-border text-slate-300'
        }`}>
          {notification.type === 'warning' ? (
            <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span className="text-xs leading-relaxed">{notification.message}</span>
        </div>
      )}

      {/* ── Error Banner ── */}
      {(wsError || restError) && !data && (
        <div className="bg-red-950/40 border-b border-red-800/40 px-6 py-2 flex items-center gap-2 text-xs font-mono text-red-400">
          <AlertOctagon className="w-3.5 h-3.5" />
          Connection error: {wsError || restError} — Retrying...
        </div>
      )}

      {/* ── Toolbar Strip ── */}
      <div className="flex items-center justify-between px-6 py-2 bg-cop-surface border-b border-cop-border">
        <div className="flex items-center gap-2.5">
          {data && (
            <>
              <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Feed:</span>
              <span className="text-[10px] font-mono font-bold text-cop-gold uppercase">
                {data.broker?.name || broker} ({data.broker?.server || 'Interbank CFD'})
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400">
                {data.symbol} · TF: <strong className="text-white">{data.timeframe}</strong> · Spread: <strong className="text-cop-cyan">{data.broker?.spreadLabel || '0.5 pip'}</strong>
              </span>
              {liveTick?.price && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  liveTick.direction === 'UP'
                    ? 'text-emerald-400 border-emerald-700/50 bg-emerald-950/40'
                    : liveTick.direction === 'DOWN'
                    ? 'text-red-400 border-red-700/50 bg-red-950/40'
                    : 'text-slate-400 border-slate-700 bg-slate-900/40'
                }`}>
                  Live: ${liveTick.price.toFixed(data?.decimals ?? (broker !== 'BINANCE' ? 3 : 2))} {liveTick.direction === 'UP' ? '▲' : liveTick.direction === 'DOWN' ? '▼' : '●'}
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Mode Switcher: Table vs Dashboard vs Both */}
          <div className="flex items-center gap-1 bg-cop-card p-0.5 rounded-lg border border-cop-border mr-2">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                viewMode === 'table'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/80 font-bold shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Tabel Matriks Multi-Timeframe COP TAH"
            >
              <Table className="w-3 h-3 text-cyan-400" />
              <span>Mode Tabel Matriks</span>
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-cop-blue text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Dashboard Modern Cards & Widgets"
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setViewMode('both')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                viewMode === 'both'
                  ? 'bg-amber-950 text-amber-300 border border-amber-600/80 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilkan Keduanya (Tabel Matriks + Dashboard)"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Gabungan</span>
            </button>
          </div>

          <button
            onClick={handleResetTouches}
            className="btn-ghost text-[10px]"
            title="Reset touch detection"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Touches
          </button>
          <button
            onClick={handleRefresh}
            className="btn-ghost text-[10px]"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── COP TAH MULTI-TIMEFRAME MATRIX TABLE ── */}
        {(viewMode === 'table' || viewMode === 'both') && (
          <Leak4RegTable data={data} liveTick={liveTick} />
        )}

        {/* ── DASHBOARD PANELS ── */}
        {(viewMode === 'dashboard' || viewMode === 'both') && (
          <>
            {/* ── TOP SECTION: OHL Metrics ── */}
            <OHLPanel data={data} liveTick={liveTick} />

            {/* ── MIDDLE SECTION: RS Matrix (full width) ── */}
            <RSMatrix data={data} liveTick={liveTick} />

            {/* ── MARKET CYCLE & SUB-ALUR CERITA (full width) ── */}
            <MarketCycleAnalysis data={data} />

            {/* ── BOTTOM SECTION: 2-column layout ── */}
            <div className="grid grid-cols-2 gap-4">

              {/* ── BOTTOM LEFT: Operational Status + Storyline ── */}
              <div className="space-y-4">
                <OperationalStatus data={data} />
                <StorylineGenerator data={data} />
              </div>

              {/* ── BOTTOM RIGHT: Pending Orders + Session/HSH ── */}
              <div className="space-y-4">
                <PendingOrders data={data} liveTick={liveTick} onModalUpdate={handleModalUpdate} />
                <SessionStatus data={data} />
              </div>
            </div>
          </>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-cop-border px-6 py-2 flex items-center justify-between text-[10px] font-mono text-slate-700">
        <span>COP TAH Analytics Dashboard v1.0 — XAUUSD / PAXG · Binance</span>
        <span>3 Core Theories · 5 Trading Laws · Multi-Timeframe Fractal Storytelling</span>
        <span>⚡ Hukum JIKA · Perahu · Busur · RS Matrix · HSH</span>
      </footer>
    </div>
  );
}

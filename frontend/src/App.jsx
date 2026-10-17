import {useAnalysisNotifications} from './hooks/useAnalysisNotifications';
import {instrumentTolerance} from './instrumentTolerance.mjs';
import SourceHSHBar from './components/SourceHSHBar';
import OHLCWorkspace from './components/OHLCWorkspace';
import {newestScopedAnalysis} from './dataScope.mjs';
import H4DirectionStrip from './components/H4DirectionStrip';
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
import H4Workspace from './components/H4Workspace';
import MarketHabitPanel from './components/MarketHabitPanel';
import MarketCycleAnalysis from './components/MarketCycleAnalysis';
import Leak4RegTable from './components/Leak4RegTable';
import MatrixSlideshow from './components/MatrixSlideshow';
import GlobalStoryline from './components/GlobalStoryline';
import HistoricalDataViewer from './components/HistoricalDataViewer';
import AnalysisGuide from './components/AnalysisGuide';
import {PAGES,resolveNavigation} from './navigation.mjs';
import {DEFAULT_BROKER} from './config';
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
  BookOpen as BookIcon,
  Bell,
  Clock,
  Menu as MenuIcon,
  CandlestickChart as CandlestickIcon
} from 'lucide-react';

export default function App() {
  const [sidebarHidden, setSidebarHidden] = useState(() => { try { return localStorage.getItem('coptah.sidebarHidden') === 'true'; } catch { return false; } });
  useEffect(() => { try { localStorage.setItem('coptah.sidebarHidden', String(sidebarHidden)); } catch {} }, [sidebarHidden]);
  const [symbol, setSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('1h');
  const [h4ToleranceByInstrument,setH4ToleranceByInstrument]=useState({});
  const [dailyTarget,setDailyTarget]=useState('AUTO');
  const [terminalFocus,setTerminalFocus]=useState('4h');
  const [terminalSection,setTerminalSection]=useState('summary');
  const [analysisTab,setAnalysisTab]=useState('global'),[h4Tab,setH4Tab]=useState('targets');
  const [markerExpanded,setMarkerExpanded]=useState(false);
  const [alertSettings,setAlertSettings]=useState({h4Enabled:true,dailyEnabled:true,distance:1});
  const [broker, setBroker] = useState(DEFAULT_BROKER);
  const toleranceScope=`${broker}|${symbol}`;
  const h4Tolerance=h4ToleranceByInstrument[toleranceScope]??instrumentTolerance(symbol).defaultValue;
  const setH4Tolerance=value=>setH4ToleranceByInstrument(prior=>({...prior,[toleranceScope]:value}));
  // Default to Cockpit Eksekusi Live (Pilar 1) or Saran Entry (Pilar 2)
  const [viewMode, setViewMode] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [noticeHistory,setNoticeHistory]=useState([]),[noticesOpen,setNoticesOpen]=useState(false),[menuOpen,setMenuOpen]=useState(false);
  const toastTimer=useRef(null);
  useEffect(()=>{const close=e=>{if(e.key==='Escape'){setNoticesOpen(false);setMenuOpen(false);}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
  useEffect(()=>()=>clearTimeout(toastTimer.current),[]);
  const navigate=useCallback(id=>{const route=resolveNavigation(id);setViewMode(route.page);if(route.analysisTab)setAnalysisTab(route.analysisTab);if(route.terminalSection)setTerminalSection(route.terminalSection);setMenuOpen(false);window.scrollTo({top:0,behavior:'instant'});},[]);
  useEffect(() => { document.title = `COP TAH · ${symbol} · ${broker === 'TWELVE' ? 'Twelve Data' : broker === 'BINANCE' ? 'Binance Spot' : 'Exness MT5'}`; }, [symbol, broker]);

  // ── Data Sources ───────────────────────────────────────────────────────────
  const { data: wsData, liveTick: rawTick, status: wsStatus, error: wsError, reconnectCount, isLoading: wsLoading, sendMessage } = useWebSocket(broker==='EXNESS');
  const { data: restData, loading, error: restError, lastUpdated, refetch } = useAnalysis(symbol, timeframe, broker, 30000);

  useEffect(()=>{
    if((restData?.fallback || restData?.externalFeed) && (broker!==restData.broker.id || symbol!==restData.symbol)) {
      setBroker(restData.broker.id);setSymbol(restData.symbol);
    }
  },[restData,broker,symbol]);

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
  const data = newestScopedAnalysis(wsData,restData,symbol,timeframe,broker);


  // Subscribe to live feed (Stale-While-Revalidate: do NOT blank out screen)
  useEffect(() => {
    sendMessage({ type: 'subscribe', symbol, timeframe, broker });
  }, [symbol, timeframe, broker, sendMessage]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const showNotification = useCallback((type, message) => {
    const item={type,message,id:Date.now()+Math.random(),time:Date.now(),page:message.includes('Daily')||message.includes('Kebiasaan')?'cycle':'h4'};
    setNotification(item);setNoticeHistory(items=>[item,...items].slice(0,50));
    clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setNotification(null),7000);
  }, []);

  useAnalysisNotifications({data,liveTick,now:clock,tolerance:h4Tolerance,target:dailyTarget,settings:alertSettings,onNotify:showNotification});

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
    if (newSymbol.includes('PAXG') || newSymbol.includes('XAUT') || newSymbol==='BTC/USDC') {
      if (broker !== 'BINANCE') {
        setBroker('BINANCE');
        showNotification('info', `Simbol kripto ${newSymbol} dialihkan ke feed Binance Spot/Futures`);
      }
    }
  }, [broker, showNotification]);

  const handleBrokerChange = useCallback((newBroker) => {
    setBroker(newBroker);
    if (newBroker === 'BINANCE' && ['XAUUSD','BTCUSD'].includes(symbol)) {
      setSymbol(symbol==='BTCUSD'?'BTC/USDC':'PAXG/USDT');
      showNotification('info',symbol==='BTCUSD'?'Binance memakai BTC/USDC Spot; Exness memakai BTC/USD.':'Binance memakai PAXG/USDT, instrumen berbeda dari XAUUSD.');
    }
    if ((newBroker !== 'BINANCE' && (symbol.includes('PAXG') || symbol.includes('XAUT') || symbol==='BTC/USDC')) || (newBroker==='TWELVE'&&symbol==='BTCUSD')) {
      const nextSymbol=newBroker==='EXNESS'&&symbol==='BTC/USDC'?'BTCUSD':'XAUUSD';
      setSymbol(nextSymbol);
      showNotification('info',`Sumber ${newBroker} memakai ${nextSymbol}.`);
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
  const icons={dashboard:LayoutDashboard,analysis:Compass,global:Globe,h4:Compass,cycle:Clock,candles:CandlestickIcon,entries:Target,ohlc:Table,table:Table,levels:Layers,history:Database,guide:BookIcon,sources:Radio};
  const WORKFLOW_PILLARS=PAGES.map(p=>({...p,shortTitle:p.title,icon:icons[p.id]}));
  const pageTitle=id=>PAGES.find(p=>p.id===resolveNavigation(id).page)?.title||id;
  const openTable=()=>navigate('entries');


  return (
    <div className={`premium-app min-h-screen bg-cop-bg flex flex-col overflow-hidden text-slate-100 ${sidebarHidden ? 'sidebar-hidden' : ''} ${viewMode==='levels'?'matrix-slide-mode':''} ${viewMode==='entries'?'entries-mode':''}`}>
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
        onOpenSources={()=>navigate('sources')}
      />

      {/* ── Notification Toast ── */}
      {notification && (
        <div
          className={`fixed top-16 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-mono backdrop-blur-xl transition-all duration-300 max-w-md ${
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
          <span role="status" aria-live="polite" className="leading-relaxed">{notification.message}</span>
        </div>
      )}

      {data?.marketDataStatus==='STALE_QUOTE'&&<div role="status" className="px-5 py-3 text-sm bg-amber-950/50 text-amber-200">MT5 Exness terhubung · menampilkan candle/harga terakhir. Tick harga belum baru; pasar mungkin tutup atau feed sedang tidak bergerak. Waktu tick: {data.quoteTimestamp?new Date(data.quoteTimestamp).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'}):'belum tersedia'} WIB. Notifikasi harga baru ditahan.</div>}
      {!data&&loading&&<div className="px-5 py-2 text-sm text-cyan-200" role="status">Mengambil data {symbol} dari {broker}. Pilihan sumber tetap bisa digunakan.</div>}
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
        <p className="mt-2 text-sm text-slate-400">Jika memakai Vercel, server analisis harus tersedia melalui HTTPS dan terhubung ke MT5 komputer atau VPS. MT5 di tablet tidak mengirim data langsung ke aplikasi ini. Versi online memakai Twelve Data: pasang TWELVEDATA_API_KEY pada server/Vercel. Angka analisis ditampilkan setelah sumber berhasil terhubung.</p>
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <button type="button" onClick={handleRefresh} className="chart-toggle">Coba hubungkan kembali</button>
          <button type="button" onClick={() => handleBrokerChange('BINANCE')} className="chart-toggle bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30">Gunakan Data Pasar Binance (PAXG/USDT)</button>
        </div>
      </section>}

      {data?.externalFeed&&<div className="px-5 py-3 bg-sky-950 text-sky-200 text-sm">Twelve Data · XAU/USD · sumber terpisah dari Exness. Batas candle mengikuti penyedia; selisih ≤ $1 belum diverifikasi. Bid/Ask broker tidak tersedia.</div>}
      {data?.fallback && <div role="status" className="px-5 py-3 bg-amber-950/50 text-amber-200 text-sm border-b border-amber-800">Fallback Binance Spot · {data.symbol} · bukan XAUUSD Exness. Data langsung diperbarui setiap 30 detik; WebSocket server tidak diperlukan.</div>}
      <aside id="workspace-navigation" className="workflow-nav step-sidebar" aria-label="Navigasi workspace">
        <div className="sidebar-brand"><div className="sidebar-monogram">CT<span>•</span></div><div><strong>COP TAH</strong><small>GOLD ANALYTICS</small></div></div>
        {['utama','pendukung'].map(group=><div className="step-menu-group" key={group}><p className="sidebar-caption">{group==='utama'?'MENU UTAMA':'PENDUKUNG'}</p>{WORKFLOW_PILLARS.filter(p=>p.group===group).map(p=><button type="button" key={p.id} onClick={()=>navigate(p.id)} aria-current={viewMode===p.id?'page':undefined} className={`nav-item ${viewMode===p.id?'nav-item-active':''}`}><p.icon size={17}/><span className="nav-label">{p.title}</span></button>)}</div>)}
      </aside>
      <div className="app-utility"><button className="chart-toggle" onClick={()=>setNoticesOpen(v=>!v)} aria-expanded={noticesOpen}><Bell size={16}/> Notifikasi {noticeHistory.length||''}</button></div>
      {noticesOpen&&<aside className="notice-drawer" aria-label="Pusat notifikasi"><header className="flex justify-between items-center"><h2 className="font-semibold">Pusat notifikasi</h2><button className="chart-toggle" onClick={()=>setNoticesOpen(false)}>Tutup</button></header><p className="text-xs text-slate-400 mt-2">50 kejadian terbaru selama sesi aplikasi.</p>{!noticeHistory.length&&<p className="text-sm p-4 text-slate-400">Belum ada notifikasi.</p>}{noticeHistory.map(n=><button key={n.id} className="notice-item" onClick={()=>{navigate(n.page);setNoticesOpen(false);}}><small>{new Date(n.time).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'})} WIB</small><p>{n.message}</p><span>Buka {pageTitle(n.page)} →</span></button>)}</aside>}
      {menuOpen&&<div className="mobile-menu-sheet" role="dialog" aria-label="Semua menu"><header className="flex justify-between items-center"><strong>Menu analisis</strong><button className="chart-toggle" onClick={()=>setMenuOpen(false)}>Tutup</button></header>{WORKFLOW_PILLARS.map(p=><button key={p.id} onClick={()=>navigate(p.id)} className={`nav-item ${viewMode===p.id?'nav-item-active':''}`}><p.icon size={18}/>{p.title}</button>)}</div>}
      <nav className="mobile-bottom-nav" aria-label="Navigasi utama mobile">{WORKFLOW_PILLARS.filter(p=>['dashboard','analysis','entries'].includes(p.id)).map(({id,title:label,icon:Icon})=><button key={id} aria-current={viewMode===id?'page':undefined} onClick={()=>navigate(id)}><Icon size={19}/><span>{label}</span></button>)}<button aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}><MenuIcon size={19}/><span>Menu</span></button></nav>

      <div className="workspace-summary" role="status" aria-live="polite">
        <div><span className="workspace-eyebrow">GOLD INTELLIGENCE <span className="mx-2">/</span> {symbol} <span className="mx-2">/</span> {timeframe}</span>
          <h1>{WORKFLOW_PILLARS.find(p => p.id === viewMode)?.title || 'Analisis'} <span className="workspace-instrument">{symbol} · {broker === 'TWELVE' ? 'Twelve Data' : broker === 'BINANCE' ? 'Binance Spot' : 'Exness MT5'}</span></h1>
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
        {viewMode!=='levels'&&<SourceHSHBar data={data} broker={broker} onBrokerChange={handleBrokerChange} now={clock}/>}
        {viewMode!=='levels'&&<H4DirectionStrip data={data} liveTick={liveTick} tolerance={h4Tolerance} now={clock} expanded={markerExpanded} onExpanded={setMarkerExpanded}/>}
        {viewMode==='levels'&&<MatrixSlideshow markerExpanded={markerExpanded} onMarkerExpanded={setMarkerExpanded} onOpenAnalysis={()=>navigate('cycle')} broker={broker} onBrokerChange={handleBrokerChange} dailyTarget={dailyTarget} onDailyTarget={setDailyTarget} data={data} liveTick={liveTick} focusedTf={timeframe} onTolerance={setH4Tolerance} tolerance={h4Tolerance} onBack={()=>navigate('entries')}/>}

        {viewMode==='ohlc'&&<OHLCWorkspace data={data} liveTick={liveTick} now={clock} focusedTf={timeframe} onSelect={tf=>{setTerminalFocus(tf);navigate('entries');}}/>}
        {viewMode === 'guide' && <AnalysisGuide data={data} />}
        {viewMode==='analysis'&&analysisTab==='h4'&&<div className="flex justify-end"><button className="chart-toggle" onClick={()=>{setTerminalFocus('4h');openTable();}}>Lihat H4 di Tabel</button></div>}

        {viewMode==='sources'&&<section className="cop-panel space-y-4"><h2 className="text-lg font-semibold">Sumber Data</h2><label className="block text-sm">Penyedia<select className="block p-3 mt-2 rounded-xl bg-slate-900 border border-slate-600" value={broker} onChange={e=>handleBrokerChange(e.target.value)}><option value="EXNESS">Exness · MT5 lokal</option><option value="TWELVE">Twelve Data · XAU/USD</option><option value="BINANCE">Binance Spot</option></select></label><p className="text-sm text-slate-400">{data?.dataSource||restError||'Menunggu koneksi.'}</p><p className="text-xs text-slate-400">Lokal memilih Exness; online memilih Twelve Data. Twelve memerlukan TWELVEDATA_API_KEY pada server. Data antarpenyedia tidak dicampur.</p><button className="chart-toggle" onClick={handleRefresh}>Periksa koneksi</button></section>}
        {viewMode==='analysis'&&<nav className="analysis-tabs" aria-label="Bagian Analisis">{[['global','Peta Global'],['h4','Kunci H4'],['cycle','Sesi Market & Daily']].map(([id,label])=><button className={`chart-toggle ${analysisTab===id?'chart-toggle-active':''}`} key={id} aria-pressed={analysisTab===id} onClick={()=>setAnalysisTab(id)}>{label}</button>)}</nav>}
        {data && clock-data.timestamp>45000 && <p role="status" className="p-3 border border-amber-700 rounded-xl text-sm text-amber-200">Analisis belum diperbarui lebih dari 45 detik. Angka terakhir bukan kondisi terbaru; periksa bridge dan koneksi.</p>}
        {viewMode==='analysis'&&analysisTab==='h4'&&<H4Workspace activeTab={h4Tab} onTab={setH4Tab} alertSettings={alertSettings} onAlertSettings={setAlertSettings} data={data} liveTick={liveTick} now={clock} timeframe={timeframe} onSelect={setTimeframe} onMarket={()=>navigate('cycle')} tolerance={h4Tolerance} onTolerance={setH4Tolerance}/>}
        {viewMode==='sources'&&<details className="data-notes"><summary>Informasi sumber data & perhitungan</summary><p className="text-[11px] text-slate-400 leading-relaxed mt-2">Basis harga: {broker === 'TWELVE' ? 'OHLC penyedia · ' : 'Bid · '} {broker === 'TWELVE' ? 'Twelve Data' : broker === 'BINANCE' ? 'Binance Spot' : 'Exness MT5'}. Perbedaan waktu snapshot dapat menyebabkan selisih sesaat antar-panel. Angka estimasi uang/lot pada plan masih memakai rumus metode, belum divalidasi terhadap ukuran kontrak dan mata uang akun; jangan dianggap sebagai profit/rugi akun. Level tersentuh bukan bukti transaksi atau profit.</p></details>}
        {(viewMode === 'candles') && (
          <CandlestickChart tolerance={h4Tolerance} data={data} liveTick={liveTick} symbol={symbol} timeframe={timeframe} broker={broker} />
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 1: COCKPIT EKSEKUSI LIVE (DASHBOARD REAL-TIME)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'dashboard') && (
          <div className="space-y-5">

            <button type="button" onClick={()=>navigate('h4')} className="h4-cockpit-link"><span><small>ACUAN ANALISIS</small><strong>H4 · area pertemuan & sasaran</strong><span>Periksa level yang bertemu dan konteks Daily dalam satu ruang analisis.</span></span><ArrowRight size={21}/></button>
            <section className="cop-panel home-overview"><div><p className="workspace-eyebrow">BERANDA</p><h2>Kondisi market, dalam satu pandangan</h2><p>{data?.marketCycle?.activeSession||'Menunggu sesi'} · {data?.broker?.name||broker} · {symbol}</p></div><button className="chart-toggle chart-toggle-active" onClick={()=>navigate('global')}>Mulai analisis →</button></section>
            {/* 1. OHL Metrics & Intraday Range Bar */}
            <OHLPanel data={data} liveTick={liveTick} />

            <section className="cop-panel home-actions"><p>Rencana entry, risiko dan penjelasan lengkap tersedia di Terminal & Entry.</p><button className="chart-toggle" onClick={()=>navigate('entries')}>Buka Terminal & Entry →</button><button className="chart-toggle" onClick={()=>navigate('ohlc')}>Lihat tabel OHLC</button></section>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 2: REKOMENDASI ENTRY MULTI-TIMEFRAME (5M - 1D) + RAMBU COP TAH
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'entries') && <Leak4RegTable terminalSection={terminalSection} onTerminalSection={setTerminalSection} onTerminalSelect={setTerminalFocus} onOpenAnalysis={()=>navigate('cycle')} dailyTarget={dailyTarget} onDailyTarget={setDailyTarget} data={data} liveTick={liveTick} focusedTf={terminalFocus||timeframe} onTolerance={setH4Tolerance} tolerance={h4Tolerance}/>}


        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 3: TRADING PLAN MINGGUAN (REAL MARKET DATA 1W)
            ════════════════════════════════════════════════════════════════════════ */}


        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 4: MARKET CYCLE (SIKLUS 12 SESI HARIAN)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'analysis'&&analysisTab==='cycle') && (
          <div className="space-y-4">
            <MarketHabitPanel alertSettings={alertSettings} onAlertSettings={setAlertSettings} target={dailyTarget} onTarget={setDailyTarget} data={data} liveTick={liveTick} now={clock}/><MarketCycleAnalysis data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 5: TABEL MATRIKS MULTI-TIMEFRAME (17 KOLOM)
            ════════════════════════════════════════════════════════════════════════ */}


        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 6: PETA GLOBAL COP TAH (2021 – 2030)
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'analysis'&&analysisTab==='global') && (
          <div className="space-y-4">
            <GlobalStoryline data={data} liveTick={liveTick} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PILAR 7: DATA HISTORIS XAUUSD (2000 – 2026) & 5 HUKUM COP TAH
            ════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'history') && (
          <div className="space-y-4">
            <HistoricalDataViewer decimals={data?.decimals??3} key={`${broker}|${symbol}`} broker={broker} symbol={symbol} />
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

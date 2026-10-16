/**
 * HistoricalDataViewer.jsx — Menu Data Historis XAUUSD (2000 – 2026)
 *
 * Menggabungkan sumber data:
 *  1. walidgeuttala/walid/XAUUSD .csv: Data OHLC Bulanan (2000 – 2022)
 *  2. datasets/gold-prices/monthly.csv: Benchmark Makro Emas Global
 *  3. Telemetri Institusional COP TAH: Data Bulanan Modern (2022 – 2026)
 *
 * Mengaplikasikan 5 Hukum COP TAH secara menyeluruh:
 *  - Hukum JIKA (Open N vs Open B)
 *  - Hukum Perahu (BRK UP, NRL DWN, SDW UP, ANL)
 *  - Hukum Busur (Rentang Range & Ekspansi Delta)
 *  - Hukum HSH (Reversi Titik Temu ke Open N)
 *
 * Sesuai instruksi: Menggunakan istilah "Data" / "Periode" / "Bar Bulanan" (Bebas dari istilah "lilin").
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  Search,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  BarChart3,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Target
} from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function HistoricalDataViewer({ liveTick }) {
  const [summary, setSummary] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [allCandles, setAllCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [selectedDecade, setSelectedDecade] = useState('ALL'); // 'ALL' | '2020s' | '2010s' | '2000s'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrendFilter, setSelectedTrendFilter] = useState('ALL'); // 'ALL' | 'UP' | 'DOWN'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch Summary & Full Dataset
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch summary
        const sumRes = await fetch(`${API_BASE}/api/historical/summary`);
        if (!sumRes.ok) throw new Error(`HTTP ${sumRes.status} saat memuat ringkasan`);
        const sumJson = await sumRes.json();

        // Fetch full candles (limit 500 covers all 317 months)
        const canRes = await fetch(`${API_BASE}/api/historical/candles?limit=500`);
        if (!canRes.ok) throw new Error(`HTTP ${canRes.status} saat memuat data historis`);
        const canJson = await canRes.json();

        if (isMounted) {
          setSummary(sumJson.summary || null);
          setMetadata(sumJson.metadata || null);
          setAllCandles(canJson.candles || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered dataset
  const filteredData = useMemo(() => {
    let result = [...allCandles];

    // Decade filter
    if (selectedDecade !== 'ALL') {
      result = result.filter((item) => item.decade === selectedDecade);
    }

    // Trend filter
    if (selectedTrendFilter !== 'ALL') {
      result = result.filter((item) => item.jika?.trend === selectedTrendFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.date.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          String(item.year).includes(q) ||
          (item.perahu?.pattern || '').toLowerCase().includes(q) ||
          (item.jika?.trend || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [allCandles, selectedDecade, selectedTrendFilter, searchQuery]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDecade, selectedTrendFilter, searchQuery, pageSize]);

  // Paginated rows
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // CSV Export trigger
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const res = await fetch(`${API_BASE}/api/historical/export`);
      if (!res.ok) throw new Error('Gagal mengunduh CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `XAUUSD_Historical_COPTAH_2000_2026_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Export error: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const currentLivePrice = liveTick?.price || summary?.latestPrice || 4184.51;

  if (loading) {
    return (
      <div className="bg-cop-card border border-cop-border rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-sm font-bold text-amber-300 font-mono">Memuat Basis Data Historis XAUUSD (2000–2026)...</p>
          <p className="text-xs text-slate-400 font-mono mt-1">Mengintegrasikan 317+ bar bulanan & kalkulasi 5 Hukum COP TAH</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 text-center space-y-3">
        <p className="text-rose-400 font-bold font-mono text-sm">Gagal Mengakses Data Historis</p>
        <p className="text-xs text-slate-300 font-mono">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 rounded-xl text-xs font-mono text-rose-200 transition-all"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Header Banner & Data Lineage ── */}
      <div className="bg-gradient-to-r from-cop-card via-cop-surface to-cop-card border border-cop-border rounded-3xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-amber-400" />
                DATABASE MULTI-DEKADE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-cop-bg/80 border border-cop-border">
                {metadata?.totalCandles || 317} Periode Bulanan (2000–2026)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30">
                5 Hukum COP TAH Aktif
              </span>
            </div>

            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-3">
              Data Historis XAUUSD & Peta Siklus 26+ Tahun
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1 max-w-3xl leading-relaxed">
              Basis data historis komprehensif dari gabungan arsip global, benchmark institusional, dan telemetri pasar real-time.
              Setiap bar bulanan telah diklasifikasikan secara kuantitatif berdasarkan <strong>Hukum JIKA</strong>, <strong>Hukum Perahu</strong>,
              <strong>Hukum Busur</strong>, dan <strong>Reversi HSH</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold shadow-glow-gold-sm transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Mengekspor...' : 'Unduh CSV Historis'}
            </button>
          </div>
        </div>

        {/* Sumber Data Lineage */}
        <div className="mt-4 pt-3 border-t border-cop-border/60 flex items-center gap-2 text-[11px] font-mono text-slate-400 flex-wrap">
          <span className="text-amber-400 font-bold">Sumber Terverifikasi:</span>
          <span className="bg-cop-bg/80 px-2 py-0.5 rounded border border-cop-border/60">
            walidgeuttala (2000–2022)
          </span>
          <span>·</span>
          <span className="bg-cop-bg/80 px-2 py-0.5 rounded border border-cop-border/60">
            datasets/gold-prices (Benchmark Makro)
          </span>
          <span>·</span>
          <span className="bg-cop-bg/80 px-2 py-0.5 rounded border border-cop-border/60">
            COP TAH Real Market Interbank (2022–2026)
          </span>
        </div>
      </div>

      {/* ── 2. Macro Metric Cards (Statistik Kunci) ── */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Rekor Tertinggi (ATH) */}
          <div className="bg-cop-card/90 border border-cop-border rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
              <span>Rekor Tertinggi (ATH)</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-black text-emerald-400 tracking-tight">
                ${Number(summary.allTimeHigh).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Dicapai: {summary.athDate}
              </div>
            </div>
          </div>

          {/* Card 2: Rekor Terendah (ATL) */}
          <div className="bg-cop-card/90 border border-cop-border rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
              <span>Rekor Terendah (ATL)</span>
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-black text-rose-400 tracking-tight">
                ${Number(summary.allTimeLow).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Tercatat: {summary.atlDate}
              </div>
            </div>
          </div>

          {/* Card 3: Rata-rata Range Bulanan */}
          <div className="bg-cop-card/90 border border-cop-border rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
              <span>Rata-rata Rentang (Busur)</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-black text-blue-300 tracking-tight">
                {summary.avgMonthlyRange} pts
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Pergerakan High–Low Rata-rata
              </div>
            </div>
          </div>

          {/* Card 4: Rasio JIKA UP Winrate */}
          <div className="bg-cop-card/90 border border-cop-border rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
              <span>Dominasi JIKA UP</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-black text-amber-300 tracking-tight">
                {summary.jikaUpPercent}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {summary.jikaUpCount} dari {summary.totalCandles} Periode
              </div>
            </div>
          </div>

          {/* Card 5: Rekor Ekspansi Terbesar */}
          <div className="bg-cop-card/90 border border-cop-border rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
              <span>Ekspansi Terbesar</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-black text-purple-300 tracking-tight">
                {summary.biggestExpansionMonth.range} pts
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {summary.biggestExpansionMonth.date}
              </div>
            </div>
          </div>

          {/* Card 6: Harga Terkini (Live) */}
          <div className="bg-cop-card/90 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-glow-gold-sm">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
              <span className="text-amber-300 font-bold">Harga Terkini (Live)</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-black text-white tracking-tight">
                ${Number(currentLivePrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                Siklus Berjalan (2026)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Interactive Filter & Search Controls ── */}
      <div className="bg-cop-card/90 border border-cop-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Decade Segmented Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-cop-bg rounded-xl border border-cop-border/80 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Semua Periode (2000–2026)' },
            { id: '2020s', label: '2020-an (Modern)' },
            { id: '2010s', label: '2010-an (Supercycle)' },
            { id: '2000s', label: '2000-an (Awal Milenium)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDecade(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                selectedDecade === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Trend Filter, Search Input & Page Size */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* Trend Filter */}
          <div className="flex items-center gap-1 bg-cop-bg px-2 py-1.5 rounded-xl border border-cop-border/80">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTrendFilter}
              onChange={(e) => setSelectedTrendFilter(e.target.value)}
              className="bg-transparent text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua JIKA</option>
              <option value="UP" className="bg-slate-900">JIKA UP</option>
              <option value="DOWN" className="bg-slate-900">JIKA DOWN</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tahun, bulan, pola..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cop-bg border border-cop-border/80 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-cop-bg border border-cop-border/80 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none"
          >
            <option value={25} className="bg-slate-900">25 per hal</option>
            <option value={50} className="bg-slate-900">50 per hal</option>
            <option value={100} className="bg-slate-900">100 per hal</option>
            <option value={500} className="bg-slate-900">Semua ({totalItems})</option>
          </select>
        </div>
      </div>

      {/* ── 4. Main Historical Matrix Table ── */}
      <div className="bg-cop-card/95 border border-cop-border rounded-2xl shadow-xl overflow-hidden">
        {/* Table header meta info */}
        <div className="px-5 py-3 border-b border-cop-border/80 flex items-center justify-between text-xs font-mono text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold text-slate-200">
              Menampilkan {paginatedRows.length} dari {totalItems} Data Periode
            </span>
            {selectedDecade !== 'ALL' && (
              <span className="text-amber-400">· Dekade: {selectedDecade}</span>
            )}
            {selectedTrendFilter !== 'ALL' && (
              <span className="text-emerald-400">· JIKA: {selectedTrendFilter}</span>
            )}
            {searchQuery && (
              <span className="text-blue-400">· Pencarian: "{searchQuery}"</span>
            )}
          </div>

          <div>
            Halaman <strong className="text-white">{currentPage}</strong> dari{' '}
            <strong className="text-white">{totalPages}</strong>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-cop-surface/80 border-b border-cop-border text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-3 text-right">Open N ($)</th>
                <th className="py-3 px-3 text-right">High N ($)</th>
                <th className="py-3 px-3 text-right">Low N ($)</th>
                <th className="py-3 px-3 text-right">Close N ($)</th>
                <th className="py-3 px-3 text-right">Rentang (Pts)</th>
                <th className="py-3 px-3 text-right">Perubahan</th>
                <th className="py-3 px-3 text-center">Hukum JIKA</th>
                <th className="py-3 px-3 text-center">Pola Perahu</th>
                <th className="py-3 px-3 text-center">HSH Reversi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cop-border/40">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-mono">
                    Tidak ada data yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((c) => {
                  const isUp = c.close >= c.open;
                  const isCurrentYear = c.year === 2026;
                  const isCurrentMonth = c.date === '2026-10';

                  return (
                    <tr
                      key={c.date}
                      className={`hover:bg-cop-surface/70 transition-colors ${
                        isCurrentMonth
                          ? 'bg-amber-500/10 font-bold border-l-4 border-l-amber-500'
                          : ''
                      }`}
                    >
                      {/* Periode */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isCurrentMonth ? (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          ) : (
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span className={`font-semibold ${isCurrentMonth ? 'text-amber-300' : 'text-slate-200'}`}>
                            {c.label}
                          </span>
                          {isCurrentMonth && (
                            <span className="text-[9px] bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded border border-amber-500/50">
                              LIVE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Open N */}
                      <td className="py-2.5 px-3 text-right font-medium text-slate-300">
                        ${c.open.toFixed(2)}
                      </td>

                      {/* High N */}
                      <td className="py-2.5 px-3 text-right font-medium text-emerald-400">
                        ${c.high.toFixed(2)}
                      </td>

                      {/* Low N */}
                      <td className="py-2.5 px-3 text-right font-medium text-rose-400">
                        ${c.low.toFixed(2)}
                      </td>

                      {/* Close N */}
                      <td className={`py-2.5 px-3 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${c.close.toFixed(2)}
                      </td>

                      {/* Rentang Range (Pts) */}
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-cop-bg text-blue-300 font-bold border border-cop-border/60">
                          {c.range.toFixed(2)}
                        </span>
                      </td>

                      {/* Perubahan % */}
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 font-bold ${
                            c.change > 0
                              ? 'text-emerald-400'
                              : c.change < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {c.change > 0 ? '+' : ''}
                          {c.change.toFixed(2)}%
                        </span>
                      </td>

                      {/* Hukum JIKA */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.jika.trend === 'UP'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              : c.jika.trend === 'DOWN'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                              : 'bg-slate-700/30 text-slate-300 border-slate-600/40'
                          }`}
                        >
                          {c.jika.trend === 'UP' ? '▲ JIKA UP' : c.jika.trend === 'DOWN' ? '▼ JIKA DOWN' : '— NETRAL'}
                        </span>
                      </td>

                      {/* Pola Perahu */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            c.perahu.pattern.includes('BRK')
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : c.perahu.pattern.includes('NRL')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          }`}
                        >
                          {c.perahu.pattern}
                        </span>
                      </td>

                      {/* HSH Reversi */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                            c.hsh.isRevertedToOpen
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800/40 text-slate-400'
                          }`}
                          title={`Selisih Close ke Open: $${c.hsh.diffFromOpen}`}
                        >
                          {c.hsh.isRevertedToOpen ? '✓ REVERSI' : `Δ $${c.hsh.diffFromOpen}`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="px-5 py-3.5 bg-cop-surface/80 border-t border-cop-border flex items-center justify-between text-xs font-mono text-slate-400 flex-wrap gap-3">
          <div>
            Menampilkan baris{' '}
            <strong className="text-white">
              {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            hingga{' '}
            <strong className="text-white">
              {Math.min(currentPage * pageSize, totalItems)}
            </strong>{' '}
            dari total <strong className="text-white">{totalItems}</strong> data
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-cop-border bg-cop-bg text-slate-300 hover:bg-cop-card disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-cop-bg rounded-lg border border-cop-border text-slate-200">
              Hal {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-cop-border bg-cop-bg text-slate-300 hover:bg-cop-card disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. Pedagogical COP TAH Law Analysis Box ── */}
      <div className="bg-gradient-to-br from-cop-card to-cop-surface border border-cop-border/80 rounded-2xl p-5 shadow-lg space-y-3 font-mono">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Info className="w-4 h-4" />
          Pedoman Membaca Data Historis dengan 5 Hukum COP TAH
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300 pt-2 border-t border-cop-border/60">
          <div className="bg-cop-bg/60 p-3 rounded-xl border border-cop-border/50">
            <span className="text-emerald-400 font-bold block mb-1">1. Hukum JIKA</span>
            Jika Open N &gt; Open B, probabilitas siklus ekspansi UP adalah {summary?.jikaUpPercent || 55.5}%. Jika Open N &lt; Open B, pasar memasuki tekanan sell off atau HSH correction.
          </div>

          <div className="bg-cop-bg/60 p-3 rounded-xl border border-cop-border/50">
            <span className="text-blue-400 font-bold block mb-1">2. Hukum Perahu</span>
            Pola BRK UP (Breakout Up) menandai fase trending terkuat, sedangkan NRL DWN (Normal Down) dan SDW UP (Sideway) menandai masa kompresi volatilitas.
          </div>

          <div className="bg-cop-bg/60 p-3 rounded-xl border border-cop-border/50">
            <span className="text-amber-400 font-bold block mb-1">3. Hukum Busur (Range)</span>
            Rata-rata rentang bulanan sebesar {summary?.avgMonthlyRange || 94.46} poin. Apabila rentang bulan berjalan telah mencapai &gt;1.5x rata-rata, waspadai saturasi dorongan.
          </div>

          <div className="bg-cop-bg/60 p-3 rounded-xl border border-cop-border/50">
            <span className="text-purple-400 font-bold block mb-1">4. Hukum HSH Reversion</span>
            Harga penutupan memiliki tendensi magnetik untuk kembali mendekati titik Open N atau Open B sebelum membuka siklus baru.
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * WeeklyTradingPlan — Panduan Trading Plan Mingguan Berdasarkan Data Nyata Pasar (COP TAH)
 * Menyajikan Analisis 2 Arah: Skenario Utama (Trend Following) & Skenario 2 Arah (HSH Reversion saat Target Tercapai)
 * Terintegrasi penuh dengan data multi-timeframe nyata (1W, 1M Oktober, dan 1Y 2026).
 */

import React, { useState } from 'react';
import {
  Calendar,
  Compass,
  Target,
  Shield,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Copy,
  Check,
  AlertTriangle,
  DollarSign,
  Layers,
  ArrowUp,
  ArrowDown,
  Home,
  GitFork,
  Sparkles,
  Maximize2
} from 'lucide-react';

export default function WeeklyTradingPlan({ data, liveTick }) {
  const [copied, setCopied] = useState(false);
  const [activeScenario, setActiveScenario] = useState('all'); // 'all' | 'trend' | 'hsh'

  if (!data) return null;

  const { leak4RegMatrix, broker, userModal = 10000, lotCalc, decimals = 3 } = data;
  const currentPrice = liveTick?.price || data?.ohlcv_N?.close || 4174.5;

  // ── Extract Multi-Timeframe Rows & RS Columns ──────────────────────────────
  // 1W (Weekly)
  const weeklyRow = leak4RegMatrix?.tableRows?.find(
    (r) => r.timeframe === '1w' || r.label?.includes('WEEK') || r.label?.includes('1w')
  );
  const weeklyRS = leak4RegMatrix?.rsColumns?.find(
    (c) => c.timeframe === '1w' || c.label?.includes('WEEK') || c.label?.includes('1w')
  );

  // 1M (Monthly)
  const monthRow = leak4RegMatrix?.tableRows?.find(
    (r) => r.timeframe === '1M' || r.label?.includes('OKT') || r.label?.includes('1M')
  );
  const monthRS = leak4RegMatrix?.rsColumns?.find(
    (c) => c.timeframe === '1M' || c.label?.includes('MONTH') || c.label?.includes('1M')
  );

  // 1Y (Yearly)
  const yearRow = leak4RegMatrix?.tableRows?.find(
    (r) => r.timeframe === '1Y' || r.label?.includes('2026') || r.label?.includes('1Y')
  );
  const yearRS = leak4RegMatrix?.rsColumns?.find(
    (c) => c.timeframe === '1Y' || c.label?.includes('YEAR') || c.label?.includes('1Y')
  );

  // 1W Real Values
  const openN = weeklyRow ? parseFloat(weeklyRow.openN) : currentPrice;
  const openB = weeklyRow ? parseFloat(weeklyRow.openB) : currentPrice - 20;
  const highN = weeklyRow ? parseFloat(weeklyRow.highN) : currentPrice + 15;
  const lowN = weeklyRow ? parseFloat(weeklyRow.lowN) : currentPrice - 15;

  // 1M & 1Y Real Values
  const monthOpen = monthRow ? parseFloat(monthRow.openN) : 4165.09;
  const monthHigh = monthRow ? parseFloat(monthRow.highN) : 4230.21;
  const monthPivot = monthRS ? parseFloat(monthRS.pivot) : 4266.687;

  const yearOpen = yearRow ? parseFloat(yearRow.openN) : 4337.0;
  const yearHigh = yearRow ? parseFloat(yearRow.highN) : 5650.86;
  const yearLow = yearRow ? parseFloat(yearRow.lowN) : 3944.57;

  // Real Weekly 5 Laws Calculations
  const isWeeklyUp = openN >= openB;
  const weeklyTrend = isWeeklyUp ? 'UP' : 'DOWN';
  const weeklyPerahu = weeklyRow?.pattern || 'BRK UP';

  // Levels from Real Market Matrix (1W)
  const pivot = weeklyRS ? parseFloat(weeklyRS.pivot) : (openN + openB) / 2;
  const res1 = weeklyRS ? parseFloat(weeklyRS.res1) : pivot + 25;
  const res2 = weeklyRS ? parseFloat(weeklyRS.res2) : pivot + 50;
  const res3 = weeklyRS ? parseFloat(weeklyRS.res3) : pivot + 80;
  const sup1 = weeklyRS ? parseFloat(weeklyRS.sup1) : pivot - 25;
  const sup2 = weeklyRS ? parseFloat(weeklyRS.sup2) : pivot - 50;
  const sup3 = weeklyRS ? parseFloat(weeklyRS.sup3) : pivot - 80;

  // Lot Calculation (3 Core Theories)
  const lot = lotCalc?.lot || (userModal / 25000).toFixed(2);

  // ── SKENARIO 1: TREND FOLLOWING (HUKUM BUSUR) ──────────────────────────────
  const trendAction = isWeeklyUp ? 'BUY LIMIT' : 'SELL LIMIT';
  const trendEntry = isWeeklyUp ? sup1 : res1;
  const trendTp1 = pivot;
  const trendTp2 = isWeeklyUp ? res1 : sup1;
  const trendTp3 = isWeeklyUp ? res2 : sup2;
  const trendSl = isWeeklyUp ? sup2 : res2;

  const trendTp1Pts = Math.abs(trendTp1 - trendEntry).toFixed(decimals);
  const trendTp2Pts = Math.abs(trendTp2 - trendEntry).toFixed(decimals);
  const trendSlPts = Math.abs(trendEntry - trendSl).toFixed(decimals);
  const trendRr = parseFloat(trendSlPts) > 0 ? (parseFloat(trendTp2Pts) / parseFloat(trendSlPts)).toFixed(2) : '2.50';

  const trendProfitTp1 = (parseFloat(lot) * parseFloat(trendTp1Pts) * 10).toFixed(2);
  const trendProfitTp2 = (parseFloat(lot) * parseFloat(trendTp2Pts) * 10).toFixed(2);
  const trendLossSl = (parseFloat(lot) * parseFloat(trendSlPts) * 10).toFixed(2);

  // ── SKENARIO 2 (2 ARAH): PEMBALIKAN HSH (HOME SWEET HOME) SAAT TARGET TERCAPAI ──
  // Jika target mingguan (R1/R2 untuk tren UP) tercapai, harga mengalami kelelahan momentum
  // dan ditarik kembali oleh magnet Home Sweet Home (HSH) ke Open pekan, Pivot, dan Support.
  const hshAction = isWeeklyUp ? 'SELL ON STRENGTH / REVERSAL' : 'BUY ON DIP / REVERSAL';
  const hshTriggerDesc = isWeeklyUp
    ? `Target R1 ($${res1.toFixed(decimals)}) atau R2 ($${res2.toFixed(decimals)}) telah tercapai/disentuh & ada penolakan (wick rejection) di paruh akhir pekan`
    : `Target S1 ($${sup1.toFixed(decimals)}) atau S2 ($${sup2.toFixed(decimals)}) telah tercapai/disentuh & ada penolakan (wick rejection) di paruh akhir pekan`;

  const hshEntryPrimary = isWeeklyUp ? res1 : sup1;
  const hshEntrySecondary = isWeeklyUp ? res2 : sup2;

  // Target HSH:
  // Target 1: HSH Cepat — Pulang ke Open Pekan Ini (Open N)
  const hshTp1 = openN;
  // Target 2: HSH Magnetik — Pulang ke Pivot Mingguan (yang berkonfluensi dengan Open Bulan $4,165.09)
  const hshTp2 = pivot;
  // Target 3: HSH Ekspansi Koreksi Dalam — Menguji batas Support S1 (atau R1 jika bearish)
  const hshTp3 = isWeeklyUp ? sup1 : res1;
  // Stop Loss HSH: Di atas R2 + buffer 10 pts (atau R3)
  const hshSl = isWeeklyUp ? res2 + 10 : sup2 - 10;

  const hshTp1Pts = Math.abs(hshEntryPrimary - hshTp1).toFixed(decimals);
  const hshTp2Pts = Math.abs(hshEntryPrimary - hshTp2).toFixed(decimals);
  const hshTp3Pts = Math.abs(hshEntryPrimary - hshTp3).toFixed(decimals);
  const hshSlPts = Math.abs(hshSl - hshEntryPrimary).toFixed(decimals);
  const hshRr = parseFloat(hshSlPts) > 0 ? (parseFloat(hshTp2Pts) / parseFloat(hshSlPts)).toFixed(2) : '2.80';

  const hshProfitTp1 = (parseFloat(lot) * parseFloat(hshTp1Pts) * 10).toFixed(2);
  const hshProfitTp2 = (parseFloat(lot) * parseFloat(hshTp2Pts) * 10).toFixed(2);
  const hshProfitTp3 = (parseFloat(lot) * parseFloat(hshTp3Pts) * 10).toFixed(2);
  const hshLossSl = (parseFloat(lot) * parseFloat(hshSlPts) * 10).toFixed(2);

  // Calendar & Week Calculation (WIB)
  const now = new Date();
  const dayIndex = now.getUTCDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  const wibHour = (now.getUTCHours() + 7) % 24;

  // Dynamic Week Number of the Month (1 to 5)
  const weekNumber = Math.min(Math.ceil(now.getUTCDate() / 7), 5);
  const weekLabel = `WEEK ${weekNumber}`;
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthName = monthNames[now.getUTCMonth()];
  const currentYear = now.getUTCFullYear();

  // Role of this week in the Monthly Cycle (1M)
  const isMonthlyBusur = weekNumber <= 2;
  const monthlyRoleTitle = isMonthlyBusur ? `Fase Busur Bulanan (Minggu 1 & 2)` : `Fase Target & HSH Bulanan (Minggu 3 & 4)`;
  const monthlyRoleBadge = isMonthlyBusur ? 'bg-amber-950/80 text-amber-300 border-amber-500/50' : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
  const monthlyRoleDescription = isMonthlyBusur
    ? `Saat ini berada di ${weekLabel}. Lilin bulanan ${monthName} sedang menarik busur membentuk ekor/pijakan.`
    : `Saat ini berada di ${weekLabel} (Tgl 15+). Lilin bulanan ${monthName} telah melampaui fase busur dan memasuki pelepasan target bulanan menuju Resistance/Support makro!`;

  const isBusurPhase = dayIndex === 1 || dayIndex === 2 || (dayIndex === 3 && wibHour < 12);

  const daysGuide = [
    {
      day: 'SENIN',
      title: 'Pembentukan Open & Awal Busur',
      phase: 'BUSUR (Pentangan)',
      action: isWeeklyUp ? 'Tunggu pasar menarik harga turun ke area S1.' : 'Tunggu pasar menarik harga naik ke area R1.',
      status: dayIndex === 1 ? 'HARI INI (AKTIF)' : dayIndex > 1 ? 'SELESAI' : 'MENUNGGU',
    },
    {
      day: 'SELASA',
      title: 'Puncak Tarikan Busur (Golden Entry BUY)',
      phase: 'BUSUR MAKSIMAL',
      action: isWeeklyUp
        ? `Area ideal Buy Limit di S1 ($${sup1.toFixed(decimals)}).`
        : `Area ideal Sell Limit di R1 ($${res1.toFixed(decimals)}).`,
      status: dayIndex === 2 ? 'HARI INI (AKTIF)' : dayIndex > 2 ? 'SELESAI' : 'MENUNGGU',
    },
    {
      day: 'RABU',
      title: 'Titik Balik (Turning Point 12:00 WIB)',
      phase: 'TRANSISI BUSUR ➔ TARGET',
      action: 'Pukul 12:00 WIB busur selesai terpentang; anak panah mulai melesat menuju Pivot.',
      status: dayIndex === 3 ? 'HARI INI (AKTIF)' : dayIndex > 3 ? 'SELESAI' : 'MENUNGGU',
    },
    {
      day: 'KAMIS',
      title: 'Pelepasan Target ➔ Siaga Skenario 2 (HSH)',
      phase: 'TARGET TERCAPAI (R1/R2)',
      action: `Harga melaju ke R1 ($${res1.toFixed(decimals)}) / R2 ($${res2.toFixed(decimals)}). JIKA TARGET TERCAPAI: Waspada pembalikan arah (HSH)! Siapkan order SELL on rejection.`,
      status: dayIndex === 4 ? 'HARI INI (AKTIF)' : dayIndex > 4 ? 'SELESAI' : 'MENUNGGU',
    },
    {
      day: 'JUMAT',
      title: 'Penyelesaian Target & Eksekusi HSH Pulang',
      phase: 'HSH MINGGUAN LENGKAP',
      action: `Jika target R1/R2 sudah tercapai, pasar mengeksekusi HSH (SELL) menarik harga pulang ke Open Senin ($${openN.toFixed(decimals)}) dan Pivot ($${pivot.toFixed(decimals)}). Amankan semua posisi!`,
      status: dayIndex === 5 ? 'HARI INI (AKTIF)' : 'MENUNGGU',
    },
  ];

  const handleCopyPlan = async () => {
    const text =
      `📋 [TRADING PLAN MINGGUAN 2 ARAH COP TAH — ${weekLabel} (${monthName.toUpperCase()} ${currentYear})]\n` +
      `Asset: ${data.symbol || 'XAUUSD'} · Server: ${broker?.name || 'Exness'} (${broker?.server || 'MT5Real36'})\n` +
      `Periode: ${weekLabel} (${monthName} ${currentYear}) · Siklus: ${monthlyRoleTitle}\n` +
      `Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}\n` +
      `──────────────────────────────────────────────\n` +
      `📊 DATA CANDLE MULTI-TIMEFRAME NYATA (1W, 1M, 1Y):\n` +
      `• Open ${weekLabel} (N): $${openN.toFixed(decimals)}\n` +
      `• Open WEEK ${weekNumber > 1 ? weekNumber - 1 : 4} (B): $${openB.toFixed(decimals)}\n` +
      `• Open Bulan ${monthName} (1M): $${monthOpen.toFixed(decimals)} | High Bulan: $${monthHigh.toFixed(decimals)}\n` +
      `• Open Tahun ${currentYear} (1Y): $${yearOpen.toFixed(decimals)} | High Tahun: $${yearHigh.toFixed(decimals)}\n` +
      `• Hukum JIKA 1W: JIKA ${weeklyTrend} (${isWeeklyUp ? 'BULLISH' : 'BEARISH'}) | Perahu: ${weeklyPerahu}\n` +
      `──────────────────────────────────────────────\n` +
      `🟢 SKENARIO A: BUY LIMIT (MENGIKUTI TREN 1W DI S1)\n` +
      `• Aksi: ${trendAction} @ $${trendEntry.toFixed(decimals)} (Support S1)\n` +
      `• Target 1 (Pivot): $${trendTp1.toFixed(decimals)} (+${trendTp1Pts} pts | Est +$${trendProfitTp1})\n` +
      `• Target 2 (Resistance R1): $${trendTp2.toFixed(decimals)} (+${trendTp2Pts} pts | Est +$${trendProfitTp2})\n` +
      `• Target 3 (Resistance R2): $${trendTp3.toFixed(decimals)}\n` +
      `• Stop Loss (SL): $${trendSl.toFixed(decimals)} (-${trendSlPts} pts | Est -$${trendLossSl})\n` +
      `• Risk / Reward Ratio: 1 : ${trendRr}\n` +
      `──────────────────────────────────────────────\n` +
      `🔴 SKENARIO B (2 ARAH): SELL HSH REVERSAL (JIKA TARGET TERCAPAI)\n` +
      `• Syarat: Target R1 ($${res1.toFixed(decimals)}) / R2 ($${res2.toFixed(decimals)}) tercapai & ada rejection\n` +
      `• Aksi: ${hshAction} @ $${hshEntryPrimary.toFixed(decimals)} s/d $${hshEntrySecondary.toFixed(decimals)}\n` +
      `• Target 1 (HSH Pulang ke Open Pekan): $${hshTp1.toFixed(decimals)} (+${hshTp1Pts} pts | Est +$${hshProfitTp1})\n` +
      `• Target 2 (HSH Magnetik Pivot & Open Bulan): $${hshTp2.toFixed(decimals)} (+${hshTp2Pts} pts | Est +$${hshProfitTp2})\n` +
      `• Target 3 (Ekspansi Koreksi ke S1): $${hshTp3.toFixed(decimals)} (+${hshTp3Pts} pts | Est +$${hshProfitTp3})\n` +
      `• Stop Loss SELL: $${hshSl.toFixed(decimals)} (-${hshSlPts} pts | Est -$${hshLossSl})\n` +
      `• Risk / Reward Ratio: 1 : ${hshRr}\n` +
      `──────────────────────────────────────────────\n` +
      `🌐 KONEKSI ALUR CERITA MULTI-TIMEFRAME:\n` +
      `1. 1W: R1 ($${res1.toFixed(decimals)}) adalah target pelepasan busur. Rejection memicu HSH pulang ke Open ($${openN.toFixed(decimals)}).\n` +
      `2. 1M (Okt): Dinding High Oktober $${monthHigh.toFixed(decimals)} berhimpitan dengan R1 Mingguan $${res1.toFixed(decimals)}. Rejection di sini menarik harga pulang ke Open Bulan $${monthOpen.toFixed(decimals)} (Pivot $${pivot.toFixed(decimals)}).\n` +
      `3. 1Y (2026): Tarikan Q4 menuju Open 2026 ($${yearOpen.toFixed(decimals)}). Koreksi HSH di Week 3 adalah jeda sehat akumulasi sebelum menembus $${yearOpen.toFixed(decimals)}.\n` +
      `──────────────────────────────────────────────\n` +
      `🛡️ MANAJEMEN RISIKO (3 CORE THEORIES):\n` +
      `• Modal Akun: $${userModal.toLocaleString()} USD | Lot: ${lot} Lot (Formula: Modal / 25,000)`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="cop-panel space-y-5">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cop-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-cop-gold shadow-glow-gold-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-white font-mono">
                Trading Plan Mingguan 2 Arah — {weekLabel} ({monthName} {currentYear})
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-cop-gold border border-amber-500/50 font-black uppercase shadow-glow-gold-sm">
                ⭐ {weekLabel} AKTIF
              </span>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase ${monthlyRoleBadge}`}>
                {monthlyRoleTitle}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/50 font-bold uppercase flex items-center gap-1">
                <GitFork className="w-3 h-3 text-blue-400" /> Analisis 2 Arah (BUY & SELL HSH)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              {monthlyRoleDescription}
            </p>
          </div>
        </div>

        {/* Action Button: Copy Trading Plan */}
        <button
          onClick={handleCopyPlan}
          className="btn-gold self-start md:self-auto"
        >
          {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
          <span>{copied ? 'Tersalin ke Clipboard!' : `Salin Plan 2 Arah (${weekLabel})`}</span>
        </button>
      </div>

      {/* ── 1. Telemetry Data Nyata Multi-Timeframe (1W, 1M, 1Y) ── */}
      <div className="p-4 rounded-2xl bg-cop-card border border-cop-border space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
          <span className="text-xs font-bold text-cop-gold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> 1. Telemetry Data Nyata Pasar (Lilin 1W, 1M, & 1Y)
          </span>
          <span className="text-[10px] text-slate-400">
            Feed Server: <strong className="text-white">{broker?.name || 'Exness'} ({broker?.server || 'MT5Real36'})</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Open {weekLabel} (N):</span>
            <span className="text-sm font-black text-white tabular-nums">${openN.toFixed(decimals)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Open Bulan {monthName}:</span>
            <span className="text-sm font-bold text-amber-300 tabular-nums">${monthOpen.toFixed(decimals)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Open Tahun {currentYear}:</span>
            <span className="text-sm font-bold text-cop-cyan tabular-nums">${yearOpen.toFixed(decimals)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Hukum JIKA 1W:</span>
            <span className={`text-sm font-black ${isWeeklyUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              JIKA {weeklyTrend} ({isWeeklyUp ? 'BULLISH' : 'BEARISH'})
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Pivot Mingguan:</span>
            <span className="text-sm font-bold text-cop-gold tabular-nums">${pivot.toFixed(decimals)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Fase Siklus Live:</span>
            <span className={`text-sm font-bold ${isBusurPhase ? 'text-amber-300' : 'text-emerald-300'}`}>
              {isBusurPhase ? 'Fase Busur (S1/R1)' : 'Fase Pelepasan Target'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter / Switcher Tab Skenario 2 Arah ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center gap-1.5 p-1 bg-cop-surface rounded-xl border border-cop-border text-xs font-mono">
          <button
            onClick={() => setActiveScenario('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-glow-gold-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Skenario (2 Arah Lengkap)</span>
          </button>
          <button
            onClick={() => setActiveScenario('trend')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'trend'
                ? 'bg-emerald-600 text-white shadow-glow-green-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Skenario A: BUY Trend (Busur S1)</span>
          </button>
          <button
            onClick={() => setActiveScenario('hsh')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'hsh'
                ? 'bg-rose-600 text-white shadow-glow-red-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Skenario B: SELL HSH (Target Tercapai)</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cop-gold" />
          <span>Analisis Dinamis 2 Arah Berdasarkan Reaksi Target RS</span>
        </span>
      </div>

      {/* ── 2. DUAL EXECUTION CARDS (SKENARIO A & SKENARIO B) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono">
        {/* ── KARTU 1: SKENARIO A — BUY LIMIT (TREND FOLLOWING DI BUSUR S1) ── */}
        {(activeScenario === 'all' || activeScenario === 'trend') && (
          <div
            className={`p-5 rounded-2xl border-2 backdrop-blur-md shadow-card-elevated flex flex-col justify-between ${
              activeScenario === 'trend' ? 'lg:col-span-2' : ''
            } border-emerald-500/60 bg-gradient-to-br from-emerald-950/30 via-cop-card to-slate-900 shadow-glow-green-sm`}
          >
            <div>
              {/* Header Kartu A */}
              <div className="flex items-center justify-between gap-2 border-b border-emerald-800/40 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-emerald-300">
                      SKENARIO A: {trendAction} @ ${trendEntry.toFixed(decimals)}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500">
                      HUKUM BUSUR 1W
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Fokus mengikuti tren JIKA UP 1W. Pasang Buy Limit di Support S1 saat harga menarik busur di awal pekan (Senin s/d Rabu pagi).
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Risk : Reward</span>
                  <span className="text-sm font-black text-emerald-400 tabular-nums">1 : {trendRr}</span>
                </div>
              </div>

              {/* Roadmap Targets Skenario A */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-4">
                <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
                  <span className="text-[10px] text-blue-400 font-bold block mb-0.5">ENTRY ORDER</span>
                  <div className="text-sm font-black text-white tabular-nums">${trendEntry.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-400">Support S1 (Busur)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">TARGET 1 (PIVOT)</span>
                  <div className="text-sm font-black text-emerald-300 tabular-nums">${trendTp1.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-300">+{trendTp1Pts} pts (+${trendProfitTp1})</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/70 shadow-glow-green-sm">
                  <span className="text-[10px] text-emerald-300 font-black block mb-0.5">TARGET 2 (R1)</span>
                  <div className="text-sm font-black text-emerald-300 tabular-nums">${trendTp2.toFixed(decimals)}</div>
                  <span className="text-[9px] text-emerald-400 font-bold">+{trendTp2Pts} pts (+${trendProfitTp2})</span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-700/60">
                  <span className="text-[10px] text-rose-400 font-bold block mb-0.5">STOP LOSS (S2)</span>
                  <div className="text-sm font-black text-rose-300 tabular-nums">${trendSl.toFixed(decimals)}</div>
                  <span className="text-[9px] text-rose-300">-{trendSlPts} pts (-${trendLossSl})</span>
                </div>
              </div>
            </div>

            {/* Note Skenario A */}
            <div className="p-2.5 rounded-xl bg-cop-surface/70 border border-cop-border text-[11px] text-slate-300 flex items-center justify-between">
              <span>🎯 Target Runner 3: <strong className="text-white">${trendTp3.toFixed(decimals)}</strong> (Resistance R2)</span>
              <span className="text-slate-400">Lot: <strong className="text-cop-gold">{lot}</strong></span>
            </div>
          </div>
        )}

        {/* ── KARTU 2: SKENARIO B (2 ARAH) — SELL HSH REVERSAL (JIKA TARGET R1/R2 TERCAPAI) ── */}
        {(activeScenario === 'all' || activeScenario === 'hsh') && (
          <div
            className={`p-5 rounded-2xl border-2 backdrop-blur-md shadow-card-elevated flex flex-col justify-between ${
              activeScenario === 'hsh' ? 'lg:col-span-2' : ''
            } border-rose-500/60 bg-gradient-to-br from-rose-950/30 via-cop-card to-slate-900 shadow-glow-red-sm`}
          >
            <div>
              {/* Header Kartu B */}
              <div className="flex items-center justify-between gap-2 border-b border-rose-800/40 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-rose-300">
                      SKENARIO B (2 ARAH): {hshAction}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500">
                      HSH MEAN REVERSION
                    </span>
                  </div>
                  <p className="text-xs text-rose-200/90 mt-1">
                    {hshTriggerDesc}. Ketika target kenaikan tersentuh, gravitasi HSH menarik harga pulang!
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Risk : Reward</span>
                  <span className="text-sm font-black text-rose-400 tabular-nums">1 : {hshRr}</span>
                </div>
              </div>

              {/* Roadmap Targets Skenario B (HSH Sell) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-4">
                <div className="p-2.5 rounded-xl bg-cop-surface border border-rose-500/40">
                  <span className="text-[10px] text-rose-400 font-bold block mb-0.5">AREA ENTRY SELL</span>
                  <div className="text-sm font-black text-white tabular-nums">${hshEntryPrimary.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-400">R1 ($${hshEntryPrimary.toFixed(0)}) - R2 ($${hshEntrySecondary.toFixed(0)})</span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/50">
                  <span className="text-[10px] text-rose-400 font-bold block mb-0.5">TP 1 (PULANG KE OPEN)</span>
                  <div className="text-sm font-black text-rose-300 tabular-nums">${hshTp1.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-300">+{hshTp1Pts} pts (+${hshProfitTp1})</span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/70 shadow-glow-red-sm">
                  <span className="text-[10px] text-rose-300 font-black block mb-0.5">TP 2 (PIVOT & OPEN BULAN)</span>
                  <div className="text-sm font-black text-rose-300 tabular-nums">${hshTp2.toFixed(decimals)}</div>
                  <span className="text-[9px] text-rose-400 font-bold">+{hshTp2Pts} pts (+${hshProfitTp2})</span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-700/80">
                  <span className="text-[10px] text-rose-300 font-bold block mb-0.5">STOP LOSS SELL (SL)</span>
                  <div className="text-sm font-black text-rose-200 tabular-nums">${hshSl.toFixed(decimals)}</div>
                  <span className="text-[9px] text-rose-300">-{hshSlPts} pts (-${hshLossSl})</span>
                </div>
              </div>
            </div>

            {/* Note Skenario B */}
            <div className="p-2.5 rounded-xl bg-cop-surface/70 border border-cop-border text-[11px] text-slate-300 flex items-center justify-between">
              <span>🎯 Target 3 Koreksi Dalam: <strong className="text-white">${hshTp3.toFixed(decimals)}</strong> (Support S1 / +{hshTp3Pts} pts | +${hshProfitTp3})</span>
              <span className="text-slate-400">Trigger: <strong className="text-rose-400">Wick Rejection @ R1/R2</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Multi-Timeframe Storyline Confluence Widget (1W ➔ 1M ➔ 1Y) ── */}
      <div className="p-4 rounded-2xl bg-cop-card border border-cop-border space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cop-gold" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              3. Sinkronisasi Alur Cerita Data Global Multi-Timeframe (1W, 1M, & 1Y)
            </span>
          </div>
          <span className="text-[10px] text-cop-gold font-bold">
            Konfluensi Skenario 2 Arah
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* 1W Card */}
          <div className="p-3.5 rounded-xl bg-cop-surface border border-cop-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cop-gold uppercase">1. Lilin Mingguan ({weekLabel})</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Lilin Aktif
              </span>
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed">
              Open: <strong className="text-white">${openN.toFixed(decimals)}</strong> | Target: <strong className="text-emerald-400">R1 ${res1.toFixed(decimals)}</strong> & <strong className="text-emerald-400">R2 ${res2.toFixed(decimals)}</strong>.
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              <strong>Kaitan Skenario:</strong> Pelepasan target terjadi di paruh kedua pekan (Kamis/Jumat). Jika R1 disentuh dan membentuk rejection wick, Lilin {weekLabel} selesai mengekspansi body dan wajib melakukan pullback <strong>HSH</strong> kembali ke Open Pekan (${openN.toFixed(decimals)}).
            </p>
          </div>

          {/* 1M Card */}
          <div className="p-3.5 rounded-xl bg-cop-surface border border-cop-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase">2. Lilin Bulanan ({monthName})</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Transisi Fase Busur ➔ Target
              </span>
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed">
              Open Bulan: <strong className="text-white">${monthOpen.toFixed(decimals)}</strong> | High Bulan: <strong className="text-amber-300">${monthHigh.toFixed(decimals)}</strong>.
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              <strong>Konfluensi Plafon:</strong> High Bulan ${monthHigh.toFixed(decimals)} berhimpitan langsung dengan R1 Mingguan ${res1.toFixed(decimals)}! Area ini adalah <em>Dinding Plafon Bulanan</em>. Kegagalan menembus R1 memicu SELL HSH menuju magnet <strong>Open Bulan ${monthOpen.toFixed(decimals)}</strong> yang sejajar dengan Pivot Mingguan (${pivot.toFixed(decimals)}).
            </p>
          </div>

          {/* 1Y Card */}
          <div className="p-3.5 rounded-xl bg-cop-surface border border-cop-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cop-cyan uppercase">3. Lilin Tahunan ({currentYear})</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Peta Siklus 10 Tahun
              </span>
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed">
              Open Tahun: <strong className="text-white">${yearOpen.toFixed(decimals)}</strong> | Live: <strong className="text-cop-cyan">${currentPrice.toFixed(decimals)}</strong>.
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              <strong>Magnetik Makro:</strong> Posisi harga live berada di bawah Open Tahun ${yearOpen.toFixed(decimals)}. Kuartal 4 bertugas menarik harga mendekati $4,337. Lonjakan ke R1/R2 mingguan adalah 'anak tangga' awal. Skenario SELL HSH di Week 3 adalah jeda koreksi sehat (re-accumulation) sebelum dorongan besar berikutnya.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Timeline 5 Hari Kerja (Panduan Harian dalam 1 Minggu) ── */}
      <div className="space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-cop-border pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cop-cyan" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              4. Panduan Alur Cerita Harian (Senin s/d Jumat) — Kapan Beralih dari BUY ke SELL HSH
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Siklus 2,5 Hari Busur (BUY) + 2,5 Hari Target & HSH (SELL)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {daysGuide.map((d) => (
            <div
              key={d.day}
              className={`p-3 rounded-xl border transition-all ${
                d.status.includes('AKTIF')
                  ? 'bg-amber-950/40 border-amber-500 shadow-glow-gold-sm ring-1 ring-amber-500/40'
                  : d.status === 'SELESAI'
                  ? 'bg-cop-card/40 border-cop-border/60 opacity-70'
                  : 'bg-cop-card border-cop-border'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-white">{d.day}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    d.status.includes('AKTIF')
                      ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                      : d.status === 'SELESAI'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {d.status}
                </span>
              </div>

              <div className="text-[10px] text-cop-gold font-bold mb-1">{d.phase}</div>
              <div className="text-[11px] text-slate-300 font-semibold mb-1">{d.title}</div>
              <p className="text-[10px] text-slate-400 leading-snug">{d.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

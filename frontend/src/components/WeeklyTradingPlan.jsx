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
  ChevronRight,
  Split,
  Eye
} from 'lucide-react';

function WeeklyTradingPlanDetails({ data, liveTick }) {
  const [copied, setCopied] = useState(false);
  // Default tab: 'compare' so user sees both clearly, with options 'trend', 'hsh', 'roadmap'
  const [activeTab, setActiveTab] = useState('compare');

  if (!data) return null;

  const { leak4RegMatrix, broker, userModal = 10000, lotCalc, decimals = 3 } = data;
  const currentPrice = liveTick?.bid || data?.ohlcv_N?.close || 4174.5;

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
  const isWeeklyUp = openN > openB;
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

  const trendProfitTp1 = '—';
  const trendProfitTp2 = '—';
  const trendLossSl = '—';

  // ── SKENARIO 2 (2 ARAH): PEMBALIKAN HSH (HOME SWEET HOME) SAAT TARGET TERCAPAI ──
  const hshAction = isWeeklyUp ? 'SELL ON REVERSAL' : 'BUY ON REVERSAL';
  const hshTriggerDesc = isWeeklyUp
    ? `Target R1 ($${res1.toFixed(decimals)}) atau R2 ($${res2.toFixed(decimals)}) telah tercapai dan ada penolakan harga (wick rejection) di paruh akhir pekan`
    : `Target S1 ($${sup1.toFixed(decimals)}) atau S2 ($${sup2.toFixed(decimals)}) telah tercapai dan ada penolakan harga (wick rejection) di paruh akhir pekan`;

  const hshEntryPrimary = isWeeklyUp ? res1 : sup1;
  const hshEntrySecondary = isWeeklyUp ? res2 : sup2;

  // Target HSH:
  // Target 1: HSH Cepat — Pulang ke Open Pekan Ini (Open N)
  const hshTp1 = openN;
  // Level RS tambahan setelah skenario HSH; rumah HSH hanya Open N
  const hshTp2 = pivot;
  // Target 3: HSH Koreksi Dalam — Menguji batas Support S1 (atau R1 jika bearish)
  const hshTp3 = isWeeklyUp ? sup1 : res1;
  // Stop Loss HSH: Di atas R2 + buffer 10 satuan harga
  const hshSl = isWeeklyUp ? res2 + 10 : sup2 - 10;

  const hshTp1Pts = Math.abs(hshEntryPrimary - hshTp1).toFixed(decimals);
  const hshTp2Pts = Math.abs(hshEntryPrimary - hshTp2).toFixed(decimals);
  const hshTp3Pts = Math.abs(hshEntryPrimary - hshTp3).toFixed(decimals);
  const hshSlPts = Math.abs(hshSl - hshEntryPrimary).toFixed(decimals);
  const hshRr = parseFloat(hshSlPts) > 0 ? (parseFloat(hshTp1Pts) / parseFloat(hshSlPts)).toFixed(2) : '2.80';

  const hshProfitTp1 = '—';
  const hshProfitTp2 = '—';
  const hshProfitTp3 = '—';
  const hshLossSl = '—';

  // Institutional Touch Detection for Weekly Levels
  const crossed = level => lowN <= level && highN >= level;
  const isTrendEntryTouched = crossed(trendEntry);
  const isTrendTp1Touched = crossed(trendTp1);
  const isTrendTp2Touched = crossed(trendTp2);
  const isHshEntryTouched = crossed(hshEntryPrimary);
  const isHshTp1Touched = crossed(hshTp1);
  const isHshTp2Touched = crossed(hshTp2);

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
    ? `Periode ${weekLabel}: Data bulanan ${monthName} sedang membentuk pijakan dasar busur.`
    : `Periode ${weekLabel} (Tgl 15+): Data bulanan ${monthName} memasuki pelepasan target ekspansi menuju Resistance/Support makro!`;

  const isBusurPhase = dayIndex === 1 || dayIndex === 2 || (dayIndex === 3 && wibHour < 12);

  // Stepper Timeline Guide
  const stepsTimeline = [
    {
      step: '01',
      day: 'SENIN - SELASA',
      title: 'Fase Pentangan Busur',
      action: isWeeklyUp ? `Area Eksekusi BUY di Support S1 ($${sup1.toFixed(decimals)})` : `Area Eksekusi SELL di Resistance R1 ($${res1.toFixed(decimals)})`,
      desc: 'Harga ditarik menjauhi Open untuk membentuk pijakan dasar busur mingguan.',
      active: dayIndex === 1 || dayIndex === 2,
      done: dayIndex > 2,
      color: 'emerald'
    },
    {
      step: '02',
      day: 'RABU (12:00 WIB)',
      title: 'Titik Balik (Turning Point)',
      action: `Pelepasan anak panah menuju Pivot ($${pivot.toFixed(decimals)})`,
      desc: 'Busur selesai terpentang penuh. Momentum mulai berbalik menuju target ekuilibrium.',
      active: dayIndex === 3,
      done: dayIndex > 3,
      color: 'amber'
    },
    {
      step: '03',
      day: 'KAMIS',
      title: 'Target Tercapai (Plafon R1/R2)',
      action: `Harga menyentuh R1 ($${res1.toFixed(decimals)}) / R2 ($${res2.toFixed(decimals)})`,
      desc: 'Target Skenario A tercapai. Amankan profit BUY & aktifkan radar Skenario B (SELL HSH).',
      active: dayIndex === 4,
      done: dayIndex > 4,
      color: 'cyan'
    },
    {
      step: '04',
      day: 'JUMAT',
      title: 'Eksekusi Pembalikan HSH',
      action: `SELL HSH Reversal pulang ke Open N ($${openN.toFixed(decimals)})`,
      desc: 'Penolakan di target memicu gaya gravitasi HSH. Kunci semua profit sebelum sesi malam usai.',
      active: dayIndex === 5,
      done: false,
      color: 'rose'
    }
  ];

  const handleCopyPlan = async () => {
    const text =
      `📋 [TRADING PLAN MINGGUAN 2 ARAH — ${weekLabel} (${monthName.toUpperCase()} ${currentYear})]\n` +
      `Asset: ${data.symbol || 'XAUUSD'} · Server: ${broker?.name || 'Exness'} (${broker?.server || 'MT5Real36'})\n` +
      `Periode: ${weekLabel} (${monthName} ${currentYear}) · Siklus: ${monthlyRoleTitle}\n` +
      `Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}\n` +
      `──────────────────────────────────────────────\n` +
      `📊 DATA PASAR MULTI-TIMEFRAME NYATA (1W, 1M, 1Y):\n` +
      `• Open ${weekLabel} (N): $${openN.toFixed(decimals)}\n` +
      `• Open WEEK ${weekNumber > 1 ? weekNumber - 1 : 4} (B): $${openB.toFixed(decimals)}\n` +
      `• Open Bulan ${monthName} (1M): $${monthOpen.toFixed(decimals)} | High Bulan: $${monthHigh.toFixed(decimals)}\n` +
      `• Open Tahun ${currentYear} (1Y): $${yearOpen.toFixed(decimals)} | High Tahun: $${yearHigh.toFixed(decimals)}\n` +
      `• Hukum JIKA 1W: JIKA ${weeklyTrend} (${isWeeklyUp ? 'BULLISH' : 'BEARISH'}) | Perahu: ${weeklyPerahu}\n` +
      `──────────────────────────────────────────────\n` +
      `🟢 SKENARIO A: BUY LIMIT (MENGIKUTI TREN 1W DI S1)\n` +
      `• Aksi: ${trendAction} @ $${trendEntry.toFixed(decimals)} (Support S1)\n` +
      `• Target 1 (Pivot): $${trendTp1.toFixed(decimals)} (+${trendTp1Pts} satuan harga | Est +$${trendProfitTp1})\n` +
      `• Target 2 (Resistance R1): $${trendTp2.toFixed(decimals)} (+${trendTp2Pts} satuan harga | Est +$${trendProfitTp2})\n` +
      `• Target 3 (Resistance R2): $${trendTp3.toFixed(decimals)}\n` +
      `• Stop Loss (SL): $${trendSl.toFixed(decimals)} (-${trendSlPts} satuan harga | Est -$${trendLossSl})\n` +
      `• Risk / Reward Ratio: 1 : ${trendRr}\n` +
      `──────────────────────────────────────────────\n` +
      `🔴 SKENARIO B (2 ARAH): SELL HSH REVERSAL (JIKA TARGET TERCAPAI)\n` +
      `• Syarat: Target R1 ($${res1.toFixed(decimals)}) / R2 ($${res2.toFixed(decimals)}) tercapai & ada penolakan harga\n` +
      `• Aksi: ${hshAction} @ $${hshEntryPrimary.toFixed(decimals)} s/d $${hshEntrySecondary.toFixed(decimals)}\n` +
      `• Target 1 (HSH Pulang ke Open Pekan): $${hshTp1.toFixed(decimals)} (+${hshTp1Pts} satuan harga | Est +$${hshProfitTp1})\n` +
      `• Level tambahan RS (bukan rumah HSH): $${hshTp2.toFixed(decimals)} (+${hshTp2Pts} satuan harga | Est +$${hshProfitTp2})\n` +
      `• Target 3 (Koreksi Dalam ke Support S1): $${hshTp3.toFixed(decimals)} (+${hshTp3Pts} satuan harga | Est +$${hshProfitTp3})\n` +
      `• Stop Loss SELL: $${hshSl.toFixed(decimals)} (-${hshSlPts} satuan harga | Est -$${hshLossSl})\n` +
      `• Risk / Reward Ratio: 1 : ${hshRr}\n` +
      `──────────────────────────────────────────────\n` +
      `🌐 SINKRONISASI DATA GLOBAL:\n` +
      `1. Data 1W: R1 ($${res1.toFixed(decimals)}) adalah target pelepasan busur. Rejection memicu HSH pulang ke Open ($${openN.toFixed(decimals)}).\n` +
      `2. Data 1M (Okt): Dinding High Oktober $${monthHigh.toFixed(decimals)} berhimpitan dengan R1 Mingguan $${res1.toFixed(decimals)}. Rejection di sini menarik harga pulang ke Open Bulan $${monthOpen.toFixed(decimals)} (Pivot $${pivot.toFixed(decimals)}).\n` +
      `3. Data 1Y (2026): Tarikan Q4 menuju Open 2026 ($${yearOpen.toFixed(decimals)}). Koreksi HSH di Week 3 adalah jeda sehat akumulasi sebelum dorongan lanjutan.\n` +
      `──────────────────────────────────────────────\n` +
      `🛡️ MANAJEMEN RISIKO (3 CORE THEORIES):\n` +
      `• Modal Akun: $${userModal.toLocaleString()} USD | Rekomendasi Lot: ${lot} Lot (Formula: Modal / 25,000)`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="cop-panel space-y-5">
      {/* ── 1. Executive Top Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cop-border pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-cop-gold shadow-glow-gold-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-white font-mono tracking-tight">
              Trading Plan Mingguan — {weekLabel} ({monthName} {currentYear})
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-cop-gold border border-amber-500/50 font-black uppercase shadow-glow-gold-sm">
              ⭐ {weekLabel} AKTIF
            </span>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase ${monthlyRoleBadge}`}>
              {monthlyRoleTitle}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {monthlyRoleDescription}
          </p>
        </div>

        {/* Action: Copy Plan Button */}
        <button
          onClick={handleCopyPlan}
          className="btn-gold self-start lg:self-auto flex items-center gap-2 text-xs font-mono font-bold"
        >
          {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
          <span>{copied ? 'Tersalin ke Clipboard!' : `Salin Plan 2 Arah (${weekLabel})`}</span>
        </button>
      </div>

      {/* ── 2. Strip Ringkas Data Kunci (Clean Metrics Bar) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-cop-card border border-cop-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Harga Live</span>
            <span className="text-base font-black text-white tabular-nums">${currentPrice.toFixed(decimals)}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">MT5 Real</span>
        </div>

        <div className="p-3 rounded-xl bg-cop-card border border-cop-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Open {weekLabel}</span>
            <span className="text-base font-black text-white tabular-nums">${openN.toFixed(decimals)}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isWeeklyUp ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-rose-950 text-rose-300 border-rose-500/50'}`}>
            JIKA {weeklyTrend}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-cop-card border border-cop-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Target Atas (R1)</span>
            <span className="text-base font-black text-emerald-400 tabular-nums">${res1.toFixed(decimals)}</span>
          </div>
          <span className="text-[10px] text-slate-400">Plafon Target</span>
        </div>

        <div className="p-3 rounded-xl bg-cop-card border border-cop-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Lantai Busur (S1)</span>
            <span className="text-base font-black text-blue-400 tabular-nums">${sup1.toFixed(decimals)}</span>
          </div>
          <span className="text-[10px] text-slate-400">Pijakan Busur</span>
        </div>
      </div>

      {/* ── 3. Tab Kontrol Segmented (Pilih Tampilan Skenario yang Bersih) ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-cop-border/60">
        <div className="flex items-center gap-1.5 p-1 bg-cop-surface rounded-xl border border-cop-border text-xs font-mono">
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-amber-500 text-slate-950 shadow-glow-gold-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Bandingkan 2 Arah</span>
          </button>

          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'trend'
                ? 'bg-emerald-600 text-white shadow-glow-green-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Skenario A: BUY Trend</span>
          </button>

          <button
            onClick={() => setActiveTab('hsh')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'hsh'
                ? 'bg-rose-600 text-white shadow-glow-red-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Skenario B: SELL HSH</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'roadmap'
                ? 'bg-cop-blue text-white shadow-glow-cyan-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Alur Hari & Data Global</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-cop-gold" />
          <span>Lot Aman (Modal ${userModal.toLocaleString()}): <strong className="text-cop-gold">{lot} Lot</strong></span>
        </div>
      </div>

      {/* ── 4. KARTU EKSEKUSI SKENARIO (TERTATA RAPI & ERGONOMIS) ── */}
      {(activeTab === 'compare' || activeTab === 'trend' || activeTab === 'hsh') && (
        <div className={`grid gap-5 font-mono ${activeTab === 'compare' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* ── KARTU SKENARIO A: BUY TREND (HUKUM BUSUR) ── */}
          {(activeTab === 'compare' || activeTab === 'trend') && (
            <div className="p-5 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-950/20 via-cop-card to-slate-900 shadow-glow-green-sm space-y-4">
              {/* Header Kartu */}
              <div className="flex items-start justify-between gap-3 border-b border-emerald-800/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                      SKENARIO A
                    </span>
                    <h3 className="text-base font-black text-white">
                      {trendAction} @ ${trendEntry.toFixed(decimals)}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Fokus tren utama (JIKA UP). Pasang Buy Limit saat harga menarik busur bawah ke Support S1 di awal pekan.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase">Risk / Reward</span>
                  <span className="text-sm font-black text-emerald-400">1 : {trendRr}</span>
                </div>
              </div>

              {/* Grid 4 Kotak Rapi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  isTrendEntryTouched ? 'bg-amber-500/20 border-amber-400 shadow-glow-gold-sm' : 'bg-cop-surface border-cop-border'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-blue-400 font-bold">TITIK ENTRY</span>
                    {isTrendEntryTouched && (
                      <span className="text-[8px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-white tabular-nums">${trendEntry.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-400">Support S1</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  isTrendTp1Touched ? 'bg-emerald-950/60 border-emerald-400' : 'bg-emerald-950/30 border-emerald-800/50'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-emerald-400 font-bold">TARGET 1 (PIVOT)</span>
                    {isTrendTp1Touched && (
                      <span className="text-[8px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ LEVEL TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-emerald-300 tabular-nums">${trendTp1.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-300">+{trendTp1Pts} satuan harga (+${trendProfitTp1})</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  isTrendTp2Touched ? 'bg-emerald-950/70 border-emerald-400 shadow-glow-green-sm' : 'bg-emerald-950/50 border-emerald-500/70 shadow-glow-green-sm'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-emerald-300 font-black">TARGET 2 (R1)</span>
                    {isTrendTp2Touched && (
                      <span className="text-[8px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ LEVEL TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-emerald-300 tabular-nums">${trendTp2.toFixed(decimals)}</div>
                  <span className="text-[9px] text-emerald-400 font-bold">+{trendTp2Pts} satuan harga (+${trendProfitTp2})</span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-700/60">
                  <span className="text-[10px] text-rose-400 font-bold block mb-0.5">STOP LOSS (S2)</span>
                  <div className="text-sm font-black text-rose-300 tabular-nums">${trendSl.toFixed(decimals)}</div>
                  <span className="text-[9px] text-rose-300">-{trendSlPts} satuan harga (-${trendLossSl})</span>
                </div>
              </div>

              {/* Footer Info */}
              <div className="p-2.5 rounded-xl bg-cop-surface/80 border border-cop-border text-xs flex items-center justify-between text-slate-300">
                <span>🎯 Target 3 (Runner): <strong className="text-white">${trendTp3.toFixed(decimals)}</strong> (Resistance R2)</span>
                <span className="text-slate-400 text-[11px]">Waktu Masuk: <strong className="text-cop-gold">Senin - Rabu Pagi</strong></span>
              </div>
            </div>
          )}

          {/* ── KARTU SKENARIO B: SELL HSH REVERSAL (TARGET TERCAPAI) ── */}
          {(activeTab === 'compare' || activeTab === 'hsh') && (
            <div className="p-5 rounded-2xl border-2 border-rose-500/60 bg-gradient-to-br from-rose-950/20 via-cop-card to-slate-900 shadow-glow-red-sm space-y-4">
              {/* Header Kartu */}
              <div className="flex items-start justify-between gap-3 border-b border-rose-800/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-rose-500 text-white">
                      SKENARIO B (2 ARAH)
                    </span>
                    <h3 className="text-base font-black text-white">
                      {hshAction} @ ${hshEntryPrimary.toFixed(decimals)}
                    </h3>
                  </div>
                  <p className="text-xs text-rose-200/90 mt-1">
                    {hshTriggerDesc}. Selesai menembak target, harga ditarik magnet HSH pulang ke rumah!
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase">Risk / Reward</span>
                  <span className="text-sm font-black text-rose-400">1 : {hshRr}</span>
                </div>
              </div>

              {/* Grid 4 Kotak Rapi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  isHshEntryTouched ? 'bg-amber-500/20 border-amber-400 shadow-glow-gold-sm' : 'bg-cop-surface border-rose-500/40'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-rose-400 font-bold">AREA ENTRY SELL</span>
                    {isHshEntryTouched && (
                      <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-white tabular-nums">${hshEntryPrimary.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-400">R1 ($${hshEntryPrimary.toFixed(0)}) - R2 ($${hshEntrySecondary.toFixed(0)})</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  isHshTp1Touched ? 'bg-rose-950/60 border-rose-400' : 'bg-rose-950/30 border-rose-800/50'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-rose-400 font-bold">TP 1 (OPEN PEKAN)</span>
                    {isHshTp1Touched && (
                      <span className="text-[8px] bg-rose-400 text-white font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ LEVEL TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-rose-300 tabular-nums">${hshTp1.toFixed(decimals)}</div>
                  <span className="text-[9px] text-slate-300">+{hshTp1Pts} satuan harga (+${hshProfitTp1})</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  isHshTp2Touched ? 'bg-rose-950/70 border-rose-400 shadow-glow-red-sm' : 'bg-rose-950/50 border-rose-500/70 shadow-glow-red-sm'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-rose-300 font-black">RS TAMBAHAN (PIVOT)</span>
                    {isHshTp2Touched && (
                      <span className="text-[8px] bg-rose-400 text-white font-black px-1.5 py-0.2 rounded shadow-sm">
                        ✓ LEVEL TERSENTUH
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-rose-300 tabular-nums">${hshTp2.toFixed(decimals)}</div>
                  <span className="text-[9px] text-rose-400 font-bold">+{hshTp2Pts} satuan harga (+${hshProfitTp2})</span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-700/80">
                  <span className="text-[10px] text-rose-300 font-bold block mb-0.5">STOP LOSS SELL (SL)</span>
                  <div className="text-sm font-black text-rose-200 tabular-nums">${hshSl.toFixed(decimals)}</div>
                  <span className="text-[9px] text-rose-300">-{hshSlPts} satuan harga (-${hshLossSl})</span>
                </div>
              </div>

              {/* Footer Info */}
              <div className="p-2.5 rounded-xl bg-cop-surface/80 border border-cop-border text-xs flex items-center justify-between text-slate-300">
                <span>🎯 TP 3 Koreksi Penuh: <strong className="text-white">${hshTp3.toFixed(decimals)}</strong> (Support S1 / +{hshTp3Pts} satuan harga)</span>
                <span className="text-slate-400 text-[11px]">Waktu Eksekusi: <strong className="text-rose-400">Kamis Sesi NY - Jumat</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. VISUAL STEPPER TIMELINE ALUR 5 HARI ── */}
      {(activeTab === 'compare' || activeTab === 'roadmap') && (
        <div className="p-4 rounded-2xl bg-cop-card border border-cop-border space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cop-cyan" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Alur Perjalanan Waktu Pekan Ini (Senin s/d Jumat)
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Kapan Masuk BUY dan Kapan Beralih ke SELL HSH
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {stepsTimeline.map((s, idx) => (
              <div
                key={s.step}
                className={`p-3.5 rounded-xl border relative transition-all ${
                  s.active
                    ? 'bg-amber-950/40 border-amber-500 shadow-glow-gold-sm ring-1 ring-amber-500/40'
                    : s.done
                    ? 'bg-cop-card/40 border-cop-border/60 opacity-75'
                    : 'bg-cop-surface border-cop-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    TAHAP {s.step}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      s.active
                        ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                        : s.done
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.active ? 'HARI INI (AKTIF)' : s.done ? 'LEWAT' : 'MENUNGGU'}
                  </span>
                </div>

                <div className="text-xs font-black text-white mb-0.5">{s.day}</div>
                <div className="text-[11px] font-bold text-cop-gold mb-1.5">{s.title}</div>
                <div className="text-xs font-semibold text-slate-200 mb-1">{s.action}</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. TABEL SINKRONISASI DATA GLOBAL (1W - 1M - 1Y) ── */}
      {(activeTab === 'compare' || activeTab === 'roadmap') && (
        <div className="p-4 rounded-2xl bg-cop-card border border-cop-border space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cop-gold" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Sinkronisasi Data Global Multi-Timeframe (1W, 1M, & 1Y)
              </span>
            </div>
            <span className="text-[10px] text-cop-gold font-bold">Konfluensi Skenario 2 Arah</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-cop-border text-slate-400 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Timeframe Data</th>
                  <th className="py-2.5 px-3">Harga Buka (Open)</th>
                  <th className="py-2.5 px-3">Target / Plafon Atas</th>
                  <th className="py-2.5 px-3">Titik Ekuilibrium / Pivot</th>
                  <th className="py-2.5 px-3">Kaitan Skenario 2 Arah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cop-border/50 text-slate-300">
                {/* 1W Row */}
                <tr className="hover:bg-cop-surface/50">
                  <td className="py-2.5 px-3 font-bold text-cop-gold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cop-gold" />
                    Data Mingguan ({weekLabel})
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">${openN.toFixed(decimals)}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">R1: ${res1.toFixed(decimals)}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-300">${pivot.toFixed(decimals)}</td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400">
                    Jika R1 disentuh, data harga menunjukkan sentuhan level; pantau kemungkinan HSH kembali ke Open Pekan (${openN.toFixed(decimals)}).
                  </td>
                </tr>

                {/* 1M Row */}
                <tr className="hover:bg-cop-surface/50">
                  <td className="py-2.5 px-3 font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Data Bulanan ({monthName})
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">${monthOpen.toFixed(decimals)}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">High: ${monthHigh.toFixed(decimals)}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-300">${monthPivot.toFixed(decimals)}</td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400">
                    High Bulan (${monthHigh.toFixed(decimals)}) berhimpitan dengan R1 Mingguan. Penolakan di sini menarik harga ke Open Bulan (${monthOpen.toFixed(decimals)}).
                  </td>
                </tr>

                {/* 1Y Row */}
                <tr className="hover:bg-cop-surface/50">
                  <td className="py-2.5 px-3 font-bold text-cop-cyan flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cop-cyan" />
                    Data Tahunan ({currentYear})
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">${yearOpen.toFixed(decimals)}</td>
                  <td className="py-2.5 px-3 font-bold text-cop-cyan">High: ${yearHigh.toFixed(decimals)}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-400">Low: ${yearLow.toFixed(decimals)}</td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400">
                    Harga live saat ini di bawah Open Tahun ($4,337). Tarikan Q4 menuju $4,337; HSH di Week 3 adalah jeda re-akumulasi sebelum dorongan lanjutan.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WeeklyTradingPlan(props) {
 const rows=props.data?.leak4RegMatrix?.tableRows || [];
 const rs=props.data?.leak4RegMatrix?.rsColumns || [];
 if(!['1w','1M','1Y'].every(tf=>rows.some(r=>r.timeframe===tf) && rs.some(r=>r.timeframe===tf))) return <div className="cop-panel text-sm text-slate-400">Plan mingguan menunggu data W1, MN1, dan tahunan asli yang lengkap. Harga dan sasaran akan tampil setelah riwayat tersedia.</div>;
 const week=rows.find(r=>r.timeframe==='1w');
 if(Number(week.openN)===Number(week.openB)) return <div className="cop-panel text-sm text-slate-400">JIKA W1 NETRAL · Open N sama dengan Open B. Tunggu arah; tidak membuat plan BUY/SELL.</div>;
 const planRS=rs.find(c=>c.timeframe==='1w');
 const levels=['sup2','sup1','pivot','res1','res2'].map(k=>Number(planRS[k]));
 if(!levels.every(Number.isFinite)||levels.some((v,i)=>i>0&&v<=levels[i-1]))return <section className="cop-panel text-sm text-amber-200">WAIT · Urutan SL–entry–TP tidak valid. Periksa anomali level Excel pada tabel; nilai asli tidak ditukar.</section>;
 return <WeeklyTradingPlanDetails {...props}/>;
}

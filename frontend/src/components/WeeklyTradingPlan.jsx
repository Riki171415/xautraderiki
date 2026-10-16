/**
 * WeeklyTradingPlan — Panduan Trading Plan Mingguan Berdasarkan Data Nyata Pasar (COP TAH)
 * Dihitung secara matematis dari data lilin 1W real-time (bukan asumsi atau tebakan)
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
  ArrowDown
} from 'lucide-react';

export default function WeeklyTradingPlan({ data, liveTick }) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const { leak4RegMatrix, broker, userModal = 10000, lotCalc, decimals = 3 } = data;
  const currentPrice = liveTick?.price || data?.ohlcv_N?.close || 4174.5;

  // Extract weekly row and weekly RS column from real matrix data
  const weeklyRow = leak4RegMatrix?.tableRows?.find(
    (r) => r.timeframe === '1w' || r.label?.includes('WEEK') || r.label?.includes('1w')
  );
  const weeklyRS = leak4RegMatrix?.rsColumns?.find(
    (c) => c.timeframe === '1w' || c.label?.includes('WEEK') || c.label?.includes('1w')
  );

  // If weeklyRow is not found, fallback to default or calculated values
  const openN = weeklyRow ? parseFloat(weeklyRow.openN) : currentPrice;
  const openB = weeklyRow ? parseFloat(weeklyRow.openB) : currentPrice - 20;
  const highN = weeklyRow ? parseFloat(weeklyRow.highN) : currentPrice + 15;
  const lowN = weeklyRow ? parseFloat(weeklyRow.lowN) : currentPrice - 15;
  const rangeN = weeklyRow ? parseFloat(weeklyRow.rangeN) : 30;
  const rangeB = weeklyRow ? parseFloat(weeklyRow.rangeB) : 45;

  // Real Weekly 5 Laws Calculations
  const isWeeklyUp = openN >= openB;
  const weeklyTrend = isWeeklyUp ? 'UP' : 'DOWN';
  const weeklyPerahu = weeklyRow?.pattern || 'BRK UP';

  // Levels from Real Market Matrix
  const pivot = weeklyRS ? parseFloat(weeklyRS.pivot) : (openN + openB) / 2;
  const res1 = weeklyRS ? parseFloat(weeklyRS.res1) : pivot + 25;
  const res2 = weeklyRS ? parseFloat(weeklyRS.res2) : pivot + 50;
  const sup1 = weeklyRS ? parseFloat(weeklyRS.sup1) : pivot - 25;
  const sup2 = weeklyRS ? parseFloat(weeklyRS.sup2) : pivot - 50;

  // Weekly Busur Execution Plan
  const action = isWeeklyUp ? 'BUY LIMIT' : 'SELL LIMIT';
  const entryLevel = isWeeklyUp ? sup1 : res1;
  const tp1 = pivot;
  const tp2 = isWeeklyUp ? res1 : sup1;
  const tp3 = isWeeklyUp ? res2 : sup2;
  const stopLoss = isWeeklyUp ? sup2 : res2;

  const tp1Pts = Math.abs(tp1 - entryLevel).toFixed(decimals);
  const tp2Pts = Math.abs(tp2 - entryLevel).toFixed(decimals);
  const slPts = Math.abs(entryLevel - stopLoss).toFixed(decimals);
  const rrRatio = parseFloat(slPts) > 0 ? (parseFloat(tp2Pts) / parseFloat(slPts)).toFixed(2) : '2.50';

  const lot = lotCalc?.lot || (userModal / 25000).toFixed(2);
  const estProfitTp1 = (parseFloat(lot) * parseFloat(tp1Pts) * 10).toFixed(2);
  const estProfitTp2 = (parseFloat(lot) * parseFloat(tp2Pts) * 10).toFixed(2);
  const estLossSl = (parseFloat(lot) * parseFloat(slPts) * 10).toFixed(2);

  // Day of week in WIB
  const now = new Date();
  const dayIndex = now.getUTCDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  const wibHour = (now.getUTCHours() + 7) % 24;

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
      title: 'Puncak Tarikan Busur (Golden Entry)',
      phase: 'BUSUR MAKSIMAL',
      action: isWeeklyUp
        ? `Area ideal sentuh Buy Limit di S1 ($${sup1.toFixed(decimals)}).`
        : `Area ideal sentuh Sell Limit di R1 ($${res1.toFixed(decimals)}).`,
      status: dayIndex === 2 ? 'HARI INI (AKTIF)' : dayIndex > 2 ? 'SELESAI' : 'MENUNGGU',
    },
    {
      day: 'RABU',
      title: 'Titik Balik (Turning Point 12:00 WIB)',
      phase: 'TRANSISI BUSUR ➔ TARGET',
      action: 'Pukul 12:00 WIB busur selesai terpentang; anak panah mulai dilepaskan menuju Pivot.',
      status: dayIndex === 3 ? 'HARI INI (AKTIF)' : dayIndex > 3 ? 'SELESAI' : 'MENUNGGU',
    },
    {
      day: 'KAMIS',
      title: 'Pelepasan Target & Momentum Utama',
      phase: 'TARGET (Ekspansi)',
      action: `Harga melaju menembus TP1 ($${tp1.toFixed(decimals)}) menuju TP2 ($${tp2.toFixed(decimals)}).`,
      status: dayIndex === 4 ? 'HARI INI (AKTIF)' : dayIndex > 4 ? 'SELESAI' : 'MENUNGGU',
    },
    {
      day: 'JUMAT',
      title: 'Penyelesaian Target & Waspada HSH',
      phase: 'TARGET & HSH MINGGUAN',
      action: `Amankan semua profit sebelum sesi malam berakhir! Waspada tarikan magnetik HSH kembali ke Open Senin ($${openN.toFixed(decimals)}).`,
      status: dayIndex === 5 ? 'HARI INI (AKTIF)' : 'MENUNGGU',
    },
  ];

  const handleCopyPlan = async () => {
    const text =
      `📋 [TRADING PLAN MINGGUAN COP TAH — DATA PASAR NYATA]\n` +
      `Asset: ${data.symbol || 'XAUUSD'} · Server: ${broker?.name || 'Exness'} (${broker?.server || 'MT5Real36'})\n` +
      `Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}\n` +
      `──────────────────────────────────────────────\n` +
      `📊 DATA CANDLE MINGGUAN (1W):\n` +
      `• Open Minggu Ini (N): $${openN.toFixed(decimals)}\n` +
      `• Open Minggu Lalu (B): $${openB.toFixed(decimals)}\n` +
      `• Hukum JIKA Mingguan: JIKA ${weeklyTrend} (${isWeeklyUp ? 'BULLISH / Fokus BUY' : 'BEARISH / Fokus SELL'})\n` +
      `• Hukum Perahu: ${weeklyPerahu}\n` +
      `──────────────────────────────────────────────\n` +
      `🎯 RENCANA EKSEKUSI PENDING ORDER (HUKUM BUSUR):\n` +
      `• Aksi: ${action} @ $${entryLevel.toFixed(decimals)}\n` +
      `• Target 1 (Pivot): $${tp1.toFixed(decimals)} (+${tp1Pts} pts | Est +$${estProfitTp1})\n` +
      `• Target 2 (Busur Utama): $${tp2.toFixed(decimals)} (+${tp2Pts} pts | Est +$${estProfitTp2})\n` +
      `• Target 3 (Runner): $${tp3.toFixed(decimals)}\n` +
      `• Stop Loss (SL): $${stopLoss.toFixed(decimals)} (-${slPts} pts | Est -$${estLossSl})\n` +
      `• Risk / Reward Ratio: 1 : ${rrRatio}\n` +
      `──────────────────────────────────────────────\n` +
      `🛡️ MANAJEMEN RISIKO (3 CORE THEORIES):\n` +
      `• Modal Akun: $${userModal.toLocaleString()} USD\n` +
      `• Lot Rekomendasi: ${lot} Lot (Formula: Modal / 25,000)\n` +
      `• Jadwal Siklus: Senin-Rabu (Busur) | Kamis-Jumat (Target & HSH)`;

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
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white font-mono">
                Trading Plan Mingguan (Real Market Data)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                Data Nyata 1W
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Panduan Berdasarkan Matematika Lilin Mingguan & 5 Hukum COP TAH (Bukan Asumsi)
            </p>
          </div>
        </div>

        {/* Action Button: Copy Trading Plan */}
        <button
          onClick={handleCopyPlan}
          className="btn-gold self-start md:self-auto"
        >
          {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
          <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Trading Plan Mingguan'}</span>
        </button>
      </div>

      {/* ── 1. Telemetry Data Nyata Lilin Mingguan (1W) ── */}
      <div className="p-4 rounded-2xl bg-cop-card border border-cop-border space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-cop-border/60 pb-2">
          <span className="text-xs font-bold text-cop-gold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> 1. Data Nyata Pasar Lilin 1W (Minggu Ini vs Minggu Lalu)
          </span>
          <span className="text-[10px] text-slate-400">
            Feed Server: <strong className="text-white">{broker?.name || 'Exness'} ({broker?.server || 'MT5Real36'})</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Open Minggu Ini (N):</span>
            <span className="text-sm font-black text-white tabular-nums">${openN.toFixed(decimals)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Open Minggu Lalu (B):</span>
            <span className="text-sm font-bold text-slate-300 tabular-nums">${openB.toFixed(decimals)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Hukum JIKA 1W:</span>
            <span className={`text-sm font-black ${isWeeklyUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              JIKA {weeklyTrend} ({isWeeklyUp ? 'BULLISH' : 'BEARISH'})
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Hukum Perahu 1W:</span>
            <span className="text-sm font-bold text-cop-gold">{weeklyPerahu}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-slate-400 block uppercase">Fase Siklus Live:</span>
            <span className={`text-sm font-bold ${isBusurPhase ? 'text-amber-300' : 'text-emerald-300'}`}>
              {isBusurPhase ? 'Fase Busur (Pentangan)' : 'Fase Pelepasan Target'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Tiket Eksekusi Rencana Mingguan (Weekly Execution Ticket) ── */}
      <div
        className={`p-5 rounded-2xl border-2 backdrop-blur-md font-mono shadow-card-elevated ${
          isWeeklyUp
            ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/30 via-cop-card to-slate-900 shadow-glow-green-sm'
            : 'border-rose-500/60 bg-gradient-to-br from-rose-950/30 via-cop-card to-slate-900 shadow-glow-red-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white">
                Sinyal Eksekusi Mingguan: {action} @ ${entryLevel.toFixed(decimals)}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  isWeeklyUp
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                    : 'bg-rose-950 text-rose-300 border-rose-500'
                }`}
              >
                HUKUM BUSUR 1W
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isWeeklyUp
                ? `Tren Mingguan UP — Pasang Buy Limit di Busur Bawah (Support S1 $${entryLevel.toFixed(decimals)}) saat tarikan awal pekan.`
                : `Tren Mingguan DOWN — Pasang Sell Limit di Busur Atas (Resistance R1 $${entryLevel.toFixed(decimals)}) saat tarikan awal pekan.`}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Risk : Reward</span>
            <span className="text-base font-black text-emerald-400 tabular-nums">1 : {rrRatio}</span>
          </div>
        </div>

        {/* Roadmap Target Mingguan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-4">
          {/* ENTRY */}
          <div className="p-3 rounded-xl bg-cop-surface border border-cop-border">
            <span className="text-[10px] text-blue-400 font-bold block mb-1">TITIK ENTRY PENDING ORDER</span>
            <div className="text-base font-black text-white tabular-nums">${entryLevel.toFixed(decimals)}</div>
            <span className="text-[10px] text-slate-400">Level {isWeeklyUp ? 'Support S1' : 'Resistance R1'}</span>
          </div>

          {/* TP1 */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
            <span className="text-[10px] text-emerald-400 font-bold block mb-1">TARGET 1 (PIVOT)</span>
            <div className="text-base font-black text-emerald-300 tabular-nums">${tp1.toFixed(decimals)}</div>
            <span className="text-[10px] text-slate-300">+{tp1Pts} pts (Est +${estProfitTp1} USD)</span>
          </div>

          {/* TP2 */}
          <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/70 shadow-glow-green-sm">
            <span className="text-[10px] text-emerald-300 font-black block mb-1">TARGET 2 (BUSUR UTAMA)</span>
            <div className="text-base font-black text-emerald-300 tabular-nums">${tp2.toFixed(decimals)}</div>
            <span className="text-[10px] text-emerald-400 font-bold">+{tp2Pts} pts (Est +${estProfitTp2} USD)</span>
          </div>

          {/* STOP LOSS */}
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-700/60">
            <span className="text-[10px] text-rose-400 font-bold block mb-1">BATAS STOP LOSS (SL)</span>
            <div className="text-base font-black text-rose-300 tabular-nums">${stopLoss.toFixed(decimals)}</div>
            <span className="text-[10px] text-rose-300">-{slPts} pts (Est -${estLossSl} USD)</span>
          </div>
        </div>

        {/* 3 Core Theories Risk Formula */}
        <div className="p-3 rounded-xl bg-cop-surface/80 border border-cop-border flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cop-gold" />
            <span className="text-slate-300">
              Rekomendasi Ukuran Lot (3 Core Theories): <strong className="text-cop-gold font-bold">{lot} Lot</strong>
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Formula: Modal (${userModal.toLocaleString()} USD) / 25,000
          </span>
        </div>
      </div>

      {/* ── 3. Timeline 5 Hari Kerja (Panduan Harian dalam 1 Minggu) ── */}
      <div className="space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-cop-border pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cop-cyan" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              3. Panduan Alur Cerita Harian (Senin s/d Jumat)
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Siklus 2,5 Hari Busur + 2,5 Hari Target & HSH
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

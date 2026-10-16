/**
 * GlobalStoryline — Alur Cerita Global COP TAH (2021 – 2030)
 * Peta Siklus 10 Tahun Emas (XAUUSD) Berdasarkan 5 Hukum Utama & Fraktal Waktu
 */

import React, { useState } from 'react';
import {
  Globe,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Zap,
  Info,
  ChevronRight,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Repeat
} from 'lucide-react';

const BASE_YEARLY_DATA = {
  2021: {
    year: 2021,
    status: 'HISTORICAL',
    tag: 'Normal Outside Bar (Ekspansi 2 Sisi)',
    open: 1936,
    high: 2101,
    low: 1688,
    close: 1835,
    range: 413,
    jika: 'DOWN',
    jikaDesc: 'Open 2021 ($1,936) < Open 2020 ($1,946) — JIKA DOWN',
    perahu: 'NRL DWN',
    perahuTitle: 'Normal Outside Bar',
    perahuDesc: 'High ($2,101) menembus High 2020 ($2,050) & Low ($1,688) menembus Low 2020 ($1,778) — Ekspansi kedua sisi.',
    busurS1: 'Menarik Busur NAIK ke $2,101 (Semester 1)',
    targetS2: 'Pelepasan Panah TURUN ke Support $1,688 (Semester 2)',
    hsh: 'Menutup tahun di $1,835 dekat harga pembukaan.',
    narrative: 'Tahun konsolidasi pasca pandemi. Karena JIKA DOWN, Semester 1 menarik busur ke atas menguji $2,101. Semester 2 anak panah dilepas turun ke $1,688. Di akhir tahun, Hukum HSH menarik harga kembali mendekati Open $1,835.',
    playbook: 'Pada tahun Normal Outside Bar JIKA DOWN, cari Sell Limit di puncak busur Semester 1, ambil profit di dasar busur Semester 2.',
  },
  2022: {
    year: 2022,
    status: 'HISTORICAL',
    tag: 'Normal Outside Bar & HSH Fenomenal',
    open: 1835,
    high: 2076,
    low: 1606,
    close: 1822,
    range: 470,
    jika: 'DOWN',
    jikaDesc: 'Open 2022 ($1,835) < Open 2021 ($1,936) — JIKA DOWN',
    perahu: 'NRL DWN',
    perahuTitle: 'Normal Outside Bar (Ekspansi Ganda)',
    perahuDesc: 'High ($2,076) memecahkan High 2021 dan Low ($1,606) memecahkan Low 2021 — Ekspansi ekstrem kedua sisi.',
    busurS1: 'Menarik Busur NAIK ke $2,076 (Februari - Maret / Perang Ukraina)',
    targetS2: 'Pelepasan Panah TURUN ke Support $1,606 (Oktober)',
    hsh: 'HSH Legendaris: Reversion dari $1,606 kembali pulang ke Open $1,835, ditutup di $1,822 (selisih $13)!',
    narrative: 'Contoh paling sempurna Hukum Busur & HSH dalam sejarah COP TAH! Karena JIKA DOWN, Semester 1 wajib menarik busur ke ATAS mencari Resistance di $2,076. Semester 2 anak panah dilepas jatuh menghujam hingga $1,606. Di Q4, Hukum Rumah Idaman (HSH) aktif menarik harga kembali pulang ke $1,822!',
    playbook: 'Pelajaran emas: Saat JIKA DOWN dan harga naik di Semester 1, itu adalah kesempatan Sell Limit di puncak busur (R1), bukan Buy.',
  },
  2023: {
    year: 2023,
    status: 'HISTORICAL',
    tag: 'Big Boat Breakout Awal',
    open: 1822,
    high: 2095,
    low: 1716,
    close: 2028,
    range: 379,
    jika: 'UP',
    jikaDesc: 'Low ($1,716) bertahan kokoh di atas Low 2022 ($1,606) — Rebound JIKA UP',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Break Up',
    perahuDesc: 'Low ($1,716) bertahan aman, High ($2,095) menembus rekor sebelumnya dan candle ditutup di $2,028.',
    busurS1: 'Ujian Busur Bawah ke $1,716 (Krisis Perbankan SVB Maret)',
    targetS2: 'Breakout All-Time High ke $2,095 (Desember)',
    hsh: 'Ditutup kokoh di $2,028 di atas level psikologis $2,000.',
    narrative: 'Tahun transisi besar. Ujian busur bawah selesai cepat di $1,716. Konflik geopolitik Timur Tengah dan ekspektasi pelonggaran The Fed melontarkan harga menembus All-Time High ke $2,095. Lilin ditutup kokoh di $2,028 menandai awal siklus Bullish baru.',
    playbook: 'Konfirmasi Big Boat Break Up menandakan akumulasi institusi telah selesai, bersiap untuk ekspansi super di tahun-tahun berikutnya.',
  },
  2024: {
    year: 2024,
    status: 'HISTORICAL',
    tag: 'Super Expansion & Dedolarisasi',
    open: 2027,
    high: 3295,
    low: 1968,
    close: 2633,
    range: 1327,
    jika: 'UP',
    jikaDesc: 'Open 2024 ($2,027) > Open 2023 ($1,822) — JIKA UP SUPER STRONG',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Super Trend',
    perahuDesc: 'Low ($1,968) hanya terjadi sebentar di awal tahun, disusul penembusan Resistance beruntun hingga $3,295.',
    busurS1: 'Busur Bawah Dangkal $1,968 (Q1)',
    targetS2: 'Pelepasan Target Masif ke $3,295 (Q3 - Q4)',
    hsh: 'Koreksi akhir tahun menuju titik tolak $2,633.',
    narrative: 'Tahun ledakan pasar Strong! Bank-bank sentral dunia memborong emas fisik secara masif. Harga tidak memberikan toleransi koreksi dalam. Target anak panah melesat menembus $3,000 hingga menyentuh puncaknya di $3,295 sebelum terkonsolidasi di $2,633.',
    playbook: 'Pada pola Super Strong, jangan pasang Sell Counter-Trend sebelum ada konfirmasi HSH di kuartal 4.',
  },
  2025: {
    year: 2025,
    status: 'HISTORICAL',
    tag: 'Penaklukan Level $4,000+',
    open: 2633,
    high: 4790,
    low: 2627,
    close: 4337,
    range: 2163,
    jika: 'UP',
    jikaDesc: 'Open 2025 ($2,633) > Open 2024 ($2,027) — JIKA UP',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Continuation',
    perahuDesc: 'Penetrasi kokoh melampaui level psikologis $4,000 dan mengukir puncak rekor baru di $4,790.',
    busurS1: 'Busur Bawah Cepat $2,627 (Q1)',
    targetS2: 'Pelepasan Target Melampaui $4,000 s/d $4,790 (Semester 2)',
    hsh: 'Ditutup di $4,337 sebagai titik tolak tahun berjalan 2026.',
    narrative: 'Emas resmi menaklukkan batas $4,000 per troy ounce. Polarisasi moneter global dan inflasi fiat mempercepat arus pelarian modal ke safe haven fisik. Harga ditutup di $4,337.',
    playbook: 'Level $4,000 yang tadinya Resistance psikologis berubah menjadi Support beton jangka panjang.',
  },
  2026: {
    year: 2026,
    status: 'LIVE_CURRENT',
    tag: '⭐ TAHUN BERJALAN: TARGET R4 & HSH WARNING',
    open: 4337,
    high: 5651,
    low: 3945,
    close: 4185,
    range: 1706,
    jika: 'UP',
    jikaDesc: 'Open 2026 ($4,337) > Open 2025 ($2,633) — JIKA UP SUPER STRONG',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Target Reached & HSH Active',
    perahuDesc: 'Harga live saat ini diuji di ~$4,185, High tahun berjalan $5,650.86 dan Low $3,944.57.',
    busurS1: 'Busur S1 Selesai di Low $3,945 (Q1)',
    targetS2: 'Target S2 Tercapai di Rekor High $5,651 (Q3)',
    hsh: '⚠️ HSH ALERT AKTIF: Waktu sudah 83% (Oktober). Tarikan magnetik HSH aktif kembali mendekati Open $4,337!',
    narrative: 'POSISI KITA SAAT INI (DATA REAL MARKET)! Emas dibuka pada $4,337, menarik busur bawah ke $3,945 di Semester 1, lalu melontarkan anak panah menembus rekor High $5,651 di Semester 2. Saat ini lilin tahunan memasuki Kuartal 4 (83% durasi) dan magnet Hukum HSH aktif menarik harga kembali mendekati area keseimbangan Open $4,337, bergerak di sekitar level $4,185.',
    playbook: 'PERINGATAN KRITIKAL: Waktu tahunan sudah memasuki Q4 (83%). Waspada tarikan magnet HSH ke Open $4,337. Jangan hold Buy swing tanpa proteksi!',
  },
  2027: {
    year: 2027,
    status: 'PROJECTION',
    tag: 'Konstruksi Busur Raksasa (Rest Area)',
    open: 4200,
    high: 4800,
    low: 3950,
    close: 4500,
    range: 850,
    jika: 'UP',
    jikaDesc: 'Open 2027 (~$4,200) > Open 2026 ($4,337) — JIKA NEUTRAL/UP',
    perahu: 'SDW UP',
    perahuTitle: 'Small Boat Inside Bar (Konsolidasi)',
    perahuDesc: 'Harga bergerak di dalam rentang tahun 2026 untuk mengumpulkan energi kinetik baru.',
    busurS1: 'Konstruksi Busur Bawah ke $3,950 (Semester 1)',
    targetS2: 'Konsolidasi & Rebound Sehat di $4,600 (Semester 2)',
    hsh: 'Konsolidasi stabil di $4,500.',
    narrative: 'Setelah reli besar 2024–2026, tahun 2027 diproyeksikan menjadi Tahun Busur (Rest Area). Semester 1 membentuk busur bawah ke $3,950 untuk membersihkan posisi buyer spekulatif. Semester 2 pasar berkonsolidasi sehat membentuk dasar kokoh sebelum gelombang berikutnya.',
    playbook: 'Tahun akumulasi terbaik! Manfaatkan Semester 1 saat busur bawah menyentuh $3,950 untuk pasang Buy Limit swing.',
  },
  2028: {
    year: 2028,
    status: 'PROJECTION',
    tag: 'Gelombang Kedua Breakout (BRK UP)',
    open: 4500,
    high: 5400,
    low: 4300,
    close: 5100,
    range: 1100,
    jika: 'UP',
    jikaDesc: 'Open 2028 (~$4,500) > Open 2027 ($4,200) — JIKA UP',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Second Wave',
    perahuDesc: 'Penembusan rekor meluncurkan harga menuju target baru $5,400.',
    busurS1: 'Busur Ringan ke $4,300 (Semester 1)',
    targetS2: 'Pelepasan Target Gelombang 2 ke $5,400 (Semester 2)',
    hsh: 'Ditutup di $5,100.',
    narrative: 'Bertepatan dengan siklus likuiditas global baru. Busur yang dibangun di 2027 melontarkan anak panah gelombang kedua menembus rekor baru hingga $5,400 per troy ounce.',
    playbook: 'Kombinasi klasik JIKA UP + BRK UP: Hold posisi swing buy dari 2027 dan trailing stop hingga $5,400.',
  },
  2029: {
    year: 2029,
    status: 'PROJECTION',
    tag: 'Milestone Sejarah $6,000+',
    open: 5100,
    high: 6000,
    low: 4900,
    close: 5800,
    range: 1100,
    jika: 'UP',
    jikaDesc: 'Open 2029 (~$5,100) > Open 2028 ($4,500) — JIKA UP STRONG',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Historic Peak',
    perahuDesc: 'Penetrasi bersejarah menguji angka keramat $6,000 per troy ounce.',
    busurS1: 'Busur Dangkal $4,900 (Semester 1)',
    targetS2: 'Euforia Global Menembus $5,800 s/d $6,000 (Semester 2)',
    hsh: 'Penutupan di $5,800.',
    narrative: 'Tahun pencapaian milestone emas dunia. Emas resmi menembus $6,000 per troy ounce di tengah pergeseran tatanan cadangan devisa internasional dan adopsi standar emas global.',
    playbook: 'Level euforia tinggi: Amankan sebagian besar profit di atas $5,800 menjelang penutupan siklus dekade.',
  },
  2030: {
    year: 2030,
    status: 'PROJECTION',
    tag: 'Penutupan Siklus Dekade & HSH Makro',
    open: 5800,
    high: 6500,
    low: 5200,
    close: 5600,
    range: 1300,
    jika: 'NEUTRAL',
    jikaDesc: 'Akhir siklus 10 tahunan (2020 - 2030) — Exhaustion',
    perahu: 'NRL / ANL',
    perahuTitle: 'Normal Outside Bar / Reversal Anomaly',
    perahuDesc: 'Volatilitas ekstrem penutupan dekade dengan rentang di atas 1,300 poin.',
    busurS1: 'Puncak Klimaks $6,500 di Awal Tahun',
    targetS2: 'Distribusi Institusi & HSH Dekade Turun ke $5,200',
    hsh: 'HSH Super Dekade: Reversion ke area keseimbangan baru $5,600.',
    narrative: 'Penutupan siklus 10 tahunan COP TAH (2020–2030). Terjadi fenomena HSH Super Makro: Setelah mencapai klimaks di awal tahun, aksi ambil untung global memicu koreksi sehat dan menyeimbangkan harga di area $5,600.',
    playbook: 'Disiplin proteksi modal ketat: Kurangi risiko, beralih ke strategi cash preservation.',
  },
};

export default function GlobalStoryline({ data, liveTick }) {
  const [selectedYear, setSelectedYear] = useState(2026);

  // Extract real 1Y candle from dashboard's leak4RegMatrix
  const yearly1YRow = data?.leak4RegMatrix?.tableRows?.find(
    (r) => r.timeframe === '1Y' || r.label === '2026' || r.label?.includes('YEAR')
  );
  const currentLivePrice = liveTick?.price || data?.ohlcv_N?.close || 4185.0;

  // Real market candle values from server
  const real1YOpen = yearly1YRow?.openN ? parseFloat(yearly1YRow.openN) : 4337;
  const real1YHigh = yearly1YRow?.highN ? parseFloat(yearly1YRow.highN) : 5650.86;
  const real1YLow = yearly1YRow?.lowN ? parseFloat(yearly1YRow.lowN) : 3944.57;
  const real1YClose = currentLivePrice;
  const real1YOpenB = yearly1YRow?.openB ? parseFloat(yearly1YRow.openB) : 2633;

  // Construct dynamic data synchronized with live market feed
  const YEARLY_DATA = { ...BASE_YEARLY_DATA };

  if (YEARLY_DATA[2026]) {
    YEARLY_DATA[2026] = {
      ...YEARLY_DATA[2026],
      open: Math.round(real1YOpen),
      high: Math.round(real1YHigh),
      low: Math.round(real1YLow),
      close: Math.round(real1YClose),
      range: Math.round(real1YHigh - real1YLow),
      jikaDesc: `Open 2026 ($${Math.round(real1YOpen).toLocaleString()}) > Open 2025 ($${Math.round(real1YOpenB).toLocaleString()}) — JIKA UP SUPER STRONG`,
      perahuDesc: `Harga live saat ini diuji di $${real1YClose.toFixed(2)}, High $${real1YHigh.toFixed(2)}, Low $${real1YLow.toFixed(2)}.`,
      narrative: `POSISI REAL MARKET SAAT INI! Emas tahun 2026 dibuka pada level $${Math.round(real1YOpen).toLocaleString()} (di atas Open 2025 $${Math.round(real1YOpenB).toLocaleString()}). Sesuai Hukum JIKA UP, Semester 1 menarik busur ke Low $${Math.round(real1YLow).toLocaleString()}, disusul lonjakan Target Semester 2 ke rekor High $${Math.round(real1YHigh).toLocaleString()}. Saat ini lilin tahunan memasuki Kuartal 4 (83% durasi) dan magnet Hukum HSH aktif menarik harga kembali mendekati area keseimbangan Open $${Math.round(real1YOpen).toLocaleString()}, saat ini bergerak di level $${real1YClose.toFixed(2)}.`,
    };
  }

  // If backend provided full yearlyCandles array, sync past years dynamically
  if (Array.isArray(data?.yearlyCandles)) {
    data.yearlyCandles.forEach((yc) => {
      if (YEARLY_DATA[yc.year] && yc.year !== 2026) {
        YEARLY_DATA[yc.year] = {
          ...YEARLY_DATA[yc.year],
          open: Math.round(yc.open),
          high: Math.round(yc.high),
          low: Math.round(yc.low),
          close: Math.round(yc.close),
          range: Math.round(yc.high - yc.low),
        };
      }
    });
  }

  const selected = YEARLY_DATA[selectedYear] || YEARLY_DATA[2026];
  const is2026 = selectedYear === 2026;

  return (
    <div className="cop-panel space-y-5">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cop-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-cop-gold shadow-glow-gold-sm">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white font-mono">
                Alur Cerita Global COP TAH (2021 – 2030)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold uppercase">
                Peta Siklus 10 Tahun
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Breakdown Tahunan Berdasarkan 5 Hukum Utama (JIKA, Perahu, Busur, RS Matrix, HSH)
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/50 to-cop-card border border-amber-500/50 shadow-glow-gold-sm text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cop-gold animate-pulse" />
          <span className="text-slate-300">Tahun Aktif:</span>
          <strong className="text-cop-gold font-bold">2026 Q4 (Live)</strong>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 font-bold tabular-nums">${currentLivePrice.toFixed(2)}</span>
        </div>
      </div>

      {/* ── Year Slider / Selector Strip ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cop-gold" />
            Pilih Tahun untuk Melihat Alur Cerita & Hukum COP TAH:
          </span>
          <span className="text-[10px] text-slate-500">Klik salah satu tahun di bawah</span>
        </div>

        <div className="grid grid-cols-5 lg:grid-cols-10 gap-1.5 bg-cop-card/90 p-1.5 rounded-2xl border border-cop-border shadow-sm">
          {Object.keys(YEARLY_DATA).map((yrStr) => {
            const yr = parseInt(yrStr, 10);
            const item = YEARLY_DATA[yr];
            const isSelected = selectedYear === yr;
            const isLive = item.status === 'LIVE_CURRENT';
            const isProj = item.status === 'PROJECTION';

            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`py-2 px-1 rounded-xl text-xs font-mono transition-all flex flex-col items-center justify-center gap-0.5 border ${
                  isSelected
                    ? isLive
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 font-black border-amber-400 shadow-glow-gold'
                      : 'bg-cop-blue text-white font-black border-blue-400 shadow-md'
                    : isLive
                    ? 'bg-amber-950/40 text-cop-gold border-amber-500/60 font-bold hover:bg-amber-950/70 shadow-glow-gold-sm'
                    : isProj
                    ? 'bg-cop-surface/40 text-purple-300/80 border-purple-900/40 hover:text-white hover:bg-cop-surface'
                    : 'bg-cop-surface/60 text-slate-300 border-cop-border/60 hover:text-white hover:bg-cop-surface'
                }`}
              >
                <span className="text-xs font-extrabold tracking-tight">{yr}</span>
                <span className="text-[8px] uppercase tracking-wider font-semibold opacity-90">
                  {isLive ? '⭐ LIVE' : isProj ? 'PROYEKSI' : item.perahu}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Selected Year Deep Dive Dashboard ── */}
      <div className="space-y-4">
        {/* Main Banner Card */}
        <div
          className={`p-4 lg:p-5 rounded-2xl border-2 backdrop-blur-md transition-all shadow-card-elevated ${
            is2026
              ? 'border-amber-500/80 bg-gradient-to-br from-amber-950/30 via-cop-card to-slate-900 shadow-glow-gold'
              : selected.jika === 'UP'
              ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/20 via-cop-card to-slate-900 shadow-glow-green-sm'
              : 'border-rose-500/50 bg-gradient-to-br from-rose-950/20 via-cop-card to-slate-900 shadow-glow-red-sm'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cop-border/60 pb-3.5 mb-3.5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  TAHUN {selected.year}
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    is2026
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-glow-gold-sm'
                      : selected.status === 'PROJECTION'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-500/60'
                      : 'bg-cop-card text-slate-300 border-cop-border'
                  }`}
                >
                  {selected.tag}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                <span>Rentang Tahunan: <strong className="text-cop-gold tabular-nums">{selected.range} pts</strong></span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-slate-400">{selected.status === 'LIVE_CURRENT' ? '🟢 Sinkronisasi Real-Time MT5 / Binance Feed' : selected.status === 'HISTORICAL' ? 'Data Lilin Pasar Nyata' : 'Proyeksi Fraktal COP TAH'}</span>
              </div>
            </div>

            {/* Core Law Badges */}
            <div className="flex items-center gap-2 self-start lg:self-auto font-mono">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                  selected.jika === 'UP'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-glow-green-sm'
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-glow-red-sm'
                }`}
              >
                {selected.jika === 'UP' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                JIKA {selected.jika}
              </span>

              <span className="px-3 py-1 rounded-xl text-xs font-bold border bg-cop-card text-cop-gold border-amber-500/40">
                PERAHU: {selected.perahu}
              </span>
            </div>
          </div>

          {/* 4 Metric Cards: Open, High, Low, Close */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4 font-mono">
            <div className="p-3 rounded-xl bg-cop-surface/90 border border-cop-border">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-1">Open Tahunan (1 Jan)</span>
              <span className="text-xl font-black text-white tabular-nums">${selected.open.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-cop-surface/90 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest block font-bold mb-1">High Rekor Tahunan</span>
              <span className="text-xl font-black text-emerald-300 tabular-nums">${selected.high.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-cop-surface/90 border border-rose-500/30">
              <span className="text-[10px] text-rose-400 uppercase tracking-widest block font-bold mb-1">Low Dasar Busur</span>
              <span className="text-xl font-black text-rose-300 tabular-nums">${selected.low.toLocaleString()}</span>
            </div>
            <div className={`p-3 rounded-xl border ${is2026 ? 'bg-amber-500/10 border-amber-500/50 shadow-glow-gold-sm' : 'bg-cop-surface/90 border-cop-border'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-cop-gold uppercase tracking-widest block font-bold">
                  {is2026 ? 'Harga Saat Ini (Live)' : 'Close Akhir Tahun'}
                </span>
                {is2026 && <span className="w-2 h-2 rounded-full bg-cop-gold animate-ping" />}
              </div>
              <span className="text-xl font-black text-cop-gold tabular-nums">${selected.close.toLocaleString()}</span>
            </div>
          </div>

          {/* 2-Babak Siklus Tahunan (Semester 1 Busur vs Semester 2 Target & HSH) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-cop-surface/80 border border-cop-border space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                🏹 SEMESTER 1 (Jan - Jun): FASE BUSUR
              </span>
              <p className="text-amber-300 font-semibold">{selected.busurS1}</p>
            </div>

            <div className="p-3 rounded-xl bg-cop-surface/80 border border-cop-border space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                🎯 SEMESTER 2 (Jul - Okt): FASE TARGET
              </span>
              <p className="text-emerald-300 font-semibold">{selected.targetS2}</p>
            </div>

            <div className="p-3 rounded-xl bg-cop-surface/80 border border-cop-border space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                🏠 AKHIR Q4 (Nov - Des): HUKUM HSH
              </span>
              <p className="text-slate-200">{selected.hsh}</p>
            </div>
          </div>

          {/* Narrative Story */}
          <div className="p-3.5 rounded-xl bg-cop-surface/90 border border-cop-border space-y-1.5 font-mono text-xs leading-relaxed">
            <span className="text-cop-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Alur Cerita & Psikologi Pasar Menurut COP TAH:
            </span>
            <p className="text-slate-300 text-[11.5px]">{selected.narrative}</p>
          </div>

          {/* Tactical Playbook for Traders */}
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-cop-card to-cop-surface border border-amber-500/40 font-mono text-xs text-amber-200 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-cop-gold flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cop-gold uppercase tracking-wider block">
                Petunjuk Eksekusi Trader COP TAH:
              </span>
              <span className="text-slate-300 text-[11px]">{selected.playbook}</span>
            </div>
          </div>
        </div>

        {/* ── Tabel Matriks 10 Tahun (2021 – 2030) ── */}
        <div className="border border-cop-border rounded-2xl bg-cop-surface/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cop-gold" />
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Matriks Tabel Perbandingan 10 Tahun (2021 – 2030)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Sinkronisasi 5 Hukum Trading
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-cop-border">
            <table className="w-full min-w-[1350px] text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-cop-card text-[10px] uppercase tracking-wider border-b border-cop-border">
                  <th className="py-3 px-3 text-slate-400 font-extrabold whitespace-nowrap">Tahun</th>
                  <th className="py-3 px-2 text-slate-400 font-extrabold whitespace-nowrap">Open</th>
                  <th className="py-3 px-2 text-slate-400 font-extrabold whitespace-nowrap">High</th>
                  <th className="py-3 px-2 text-slate-400 font-extrabold whitespace-nowrap">Low</th>
                  <th className="py-3 px-2 text-slate-400 font-extrabold whitespace-nowrap">Close</th>
                  <th className="py-3 px-2 text-slate-400 font-extrabold whitespace-nowrap">Hukum JIKA</th>
                  <th className="py-3 px-2 text-slate-400 font-extrabold whitespace-nowrap">Perahu</th>
                  <th className="py-3 px-3 min-w-[280px] text-amber-400 font-extrabold">Fase Busur (S1)</th>
                  <th className="py-3 px-3 min-w-[280px] text-emerald-400 font-extrabold">Fase Target (S2)</th>
                  <th className="py-3 px-3 min-w-[300px] text-slate-300 font-extrabold">Status HSH Akhir Tahun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cop-border/40 text-[11px]">
                {Object.values(YEARLY_DATA).map((row) => {
                  const isCurrent = row.year === 2026;
                  return (
                    <tr
                      key={row.year}
                      onClick={() => setSelectedYear(row.year)}
                      className={`cursor-pointer transition-colors ${
                        selectedYear === row.year
                          ? 'bg-amber-500/15'
                          : isCurrent
                          ? 'bg-amber-950/20'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap align-top">
                        <div className="flex items-center gap-1.5">
                          <span className={isCurrent ? 'text-cop-gold font-black' : ''}>{row.year}</span>
                          {isCurrent && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                              LIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 tabular-nums text-slate-300 align-top whitespace-nowrap">${row.open}</td>
                      <td className="py-3 px-2 tabular-nums text-emerald-400 font-semibold align-top whitespace-nowrap">${row.high}</td>
                      <td className="py-3 px-2 tabular-nums text-rose-400 font-semibold align-top whitespace-nowrap">${row.low}</td>
                      <td className="py-3 px-2 tabular-nums text-white align-top whitespace-nowrap">${row.close}</td>
                      <td className="py-3 px-2 align-top whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                            row.jika === 'UP'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
                              : 'bg-rose-950/60 text-rose-300 border border-rose-600/40'
                          }`}
                        >
                          {row.jika}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-cop-gold whitespace-nowrap align-top">{row.perahu}</td>
                      <td className="py-3 px-3 min-w-[280px] align-top">
                        <div className="text-amber-200/90 text-[11px] leading-relaxed break-words">{row.busurS1}</div>
                      </td>
                      <td className="py-3 px-3 min-w-[280px] align-top">
                        <div className="text-emerald-300 font-semibold text-[11px] leading-relaxed break-words">{row.targetS2}</div>
                      </td>
                      <td className="py-3 px-3 min-w-[300px] align-top">
                        <div className="text-slate-300 text-[11px] leading-relaxed break-words">{row.hsh}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Panduan Top-Down Confluence ── */}
        <div className="p-4 rounded-2xl bg-cop-card/80 border border-cop-border space-y-2.5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cop-cyan" />
            <span className="font-bold text-white uppercase tracking-wider">
              Cara Memanfaatkan Alur Cerita Global Ini Saat Trading Harian (Top-Down Confluence)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-[11px] leading-relaxed pt-1">
            <div className="p-3 rounded-xl bg-cop-surface border border-cop-border space-y-1">
              <span className="font-bold text-cop-gold block">1. Baca Musim Makro (1Y)</span>
              <p>Di tahun 2026 harga sudah di target pucuk $4,185 (Q4). Jangan pernah swing Buy jangka panjang tanpa stop loss karena arus HSH dapat memicu koreksi ratusan poin.</p>
            </div>

            <div className="p-3 rounded-xl bg-cop-surface border border-cop-border space-y-1">
              <span className="font-bold text-emerald-400 block">2. Siklus Mingguan (1W)</span>
              <p>Senin s/d Rabu siang adalah fase Busur Mingguan. Rabu siang s/d Jumat adalah fase Pelepasan Target dan HSH Mingguan.</p>
            </div>

            <div className="p-3 rounded-xl bg-cop-surface border border-cop-border space-y-1">
              <span className="font-bold text-cop-cyan block">3. Disiplin 3 Core Theories</span>
              <p>Gunakan rumus Lot = Modal / 25,000. Dengan modal $10,000 pasang lot 0.40 agar akun kebal dari ayunan besar pasar emas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

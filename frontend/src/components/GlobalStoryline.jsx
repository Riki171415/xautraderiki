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

const YEARLY_DATA = {
  2021: {
    year: 2021,
    status: 'HISTORICAL',
    tag: 'Konsolidasi Small Boat',
    open: 1898,
    high: 1959,
    low: 1676,
    close: 1829,
    range: 283,
    jika: 'UP',
    jikaDesc: 'Open 2021 ($1,898) > Open 2020 ($1,517) — JIKA UP',
    perahu: 'SDW UP',
    perahuTitle: 'Small Boat Inside Bar',
    perahuDesc: 'High ($1,959) < High 2020 ($2,075) dan Low ($1,676) > Low 2020 ($1,451) — Lilin berada di dalam rentang tahun sebelumnya.',
    busurS1: 'Menarik Busur Turun ke $1,676 (Maret - Juni)',
    targetS2: 'Pantulan Target ke Pivot $1,850 (Juli - Oktober)',
    hsh: 'Menutup tahun di $1,829 dekat harga pembukaan.',
    narrative: 'Setelah lonjakan pandemi 2020, tahun 2021 menjadi tahun pengisian energi (Small Boat). Sesuai Hukum Busur pada tren UP, Semester 1 menarik busur ke bawah hingga $1,676 untuk mencari dasar busur. Semester 2 anak panah memantul namun energi belum cukup untuk memecahkan rekor baru karena terkunci pola Small Boat.',
    playbook: 'Pada tahun Small Boat, trader COP TAH dilarang mengejar target R3/R4; cukup ambil profit di Pivot dan R1.',
  },
  2022: {
    year: 2022,
    status: 'HISTORICAL',
    tag: 'Normal Outside Bar & HSH Fenomenal',
    open: 1829,
    high: 2070,
    low: 1614,
    close: 1824,
    range: 456,
    jika: 'DOWN',
    jikaDesc: 'Open 2022 ($1,829) < Open 2021 ($1,898) — JIKA DOWN',
    perahu: 'NRL DWN',
    perahuTitle: 'Normal Outside Bar (Ekspansi Ganda)',
    perahuDesc: 'High ($2,070) memecahkan High 2021 dan Low ($1,614) memecahkan Low 2021 — Ekspansi ekstrem kedua sisi.',
    busurS1: 'Menarik Busur NAIK ke $2,070 (Februari - Maret / Perang Ukraina)',
    targetS2: 'Pelepasan Panah TURUN ke Support $1,614 (Oktober)',
    hsh: 'HSH Legendaris: Reversion dari $1,614 kembali ke Open $1,829, ditutup persis di $1,824 (selisih $5)!',
    narrative: 'Contoh paling sempurna Hukum Busur & HSH dalam sejarah COP TAH! Karena JIKA DOWN, Semester 1 wajib menarik busur ke ATAS mencari Resistance R1 di $2,070 (isu perang). Trader pemula mengira emas akan to the moon, padahal itu pentangan busur. Semester 2 anak panah dilepas jatuh menghujam hingga $1,614. Di Q4, Hukum Rumah Idaman (HSH) aktif menarik harga kembali pulang ke $1,824!',
    playbook: 'Pelajaran emas: Saat JIKA DOWN dan harga naik di Semester 1, itu adalah kesempatan Sell Limit di puncak busur (R1), bukan Buy.',
  },
  2023: {
    year: 2023,
    status: 'HISTORICAL',
    tag: 'Big Boat Breakout Awal',
    open: 1824,
    high: 2146,
    low: 1804,
    close: 2063,
    range: 342,
    jika: 'UP',
    jikaDesc: 'Rejection di Low B ($1,804) lalu konfirmasi JIKA UP',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Break Up',
    perahuDesc: 'Low ($1,804) bertahan kokoh di atas Low 2022 ($1,614), High ($2,146) menembus rekor ATH sebelumnya.',
    busurS1: 'Ujian Busur Bawah ke $1,804 (Krisis Perbankan SVB Maret)',
    targetS2: 'Breakout All-Time High ke $2,146 (Desember)',
    hsh: 'Ditutup kokoh di $2,063 di atas level psikologis $2,000.',
    narrative: 'Tahun transisi besar. Ujian busur bawah selesai cepat di $1,804. Konflik geopolitik Timur Tengah dan ekspektasi pemangkasan suku bunga The Fed melontarkan anak panah menembus All-Time High ke $2,146. Lilin ditutup kokoh di $2,063 menandai era baru emas.',
    playbook: 'Konfirmasi Big Boat Break Up menandakan siklus akumulasi institusi telah selesai, bersiap untuk ekspansi super di tahun berikutnya.',
  },
  2024: {
    year: 2024,
    status: 'HISTORICAL',
    tag: 'Super Expansion & Dedolarisasi',
    open: 2063,
    high: 2790,
    low: 1984,
    close: 2624,
    range: 806,
    jika: 'UP',
    jikaDesc: 'Open 2024 ($2,063) > Open 2023 ($1,824) — JIKA UP SUPER STRONG',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Super Trend',
    perahuDesc: 'Low ($1,984) hanya terjadi sebentar di Februari, disusul penembusan Resistance R1-R4 tanpa koreksi dalam.',
    busurS1: 'Busur Bawah Dangkal $1,984 (Februari)',
    targetS2: 'Pelepasan Target Masif ke $2,790 (Oktober)',
    hsh: 'Koreksi akhir tahun menuju $2,624.',
    narrative: 'Tahun ledakan pasar Strong! Bank-bank sentral dunia (BRICS, PBoC China) memborong emas fisik secara masif. Harga tidak memberikan toleransi koreksi dalam. Target anak panah melesat menembus R1 ($2,200), R2 ($2,400), R3 ($2,600) hingga menyentuh puncaknya di $2,790 pada Oktober 2024.',
    playbook: 'Pada pola Super Strong, jangan pernah pasang Sell Counter-Trend sebelum ada sinyal konfirmasi HSH di kuartal 4.',
  },
  2025: {
    year: 2025,
    status: 'HISTORICAL',
    tag: 'Penaklukan Level $3,000',
    open: 2624,
    high: 3500,
    low: 2550,
    close: 3450,
    range: 950,
    jika: 'UP',
    jikaDesc: 'Open 2025 ($2,624) > Open 2024 ($2,063) — JIKA UP',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Continuation',
    perahuDesc: 'Penetrasi kokoh melampaui level psikologis $3,000 dan mengukir pijakan di $3,500.',
    busurS1: 'Busur Bawah Cepat $2,550 (Q1)',
    targetS2: 'Pelepasan Target Melampaui $3,000 s/d $3,500',
    hsh: 'Ditutup di $3,450 sebagai titik tolak tahun 2026.',
    narrative: 'Emas resmi menaklukkan batas psikologis $3,000 per troy ounce. Inflasi mata uang fiat dan polarisasi moneter global mempercepat arus pelarian modal ke safe haven emas fisik.',
    playbook: 'Level $3,000 yang tadinya Resistance psikologis berubah menjadi Support beton jangka panjang.',
  },
  2026: {
    year: 2026,
    status: 'LIVE_CURRENT',
    tag: '⭐ TAHUN BERJALAN: TARGET R4 & HSH WARNING',
    open: 3450,
    high: 4185,
    low: 3380,
    close: 3850, // Proyeksi close
    range: 805,
    jika: 'UP',
    jikaDesc: 'Open 2026 ($3,450) > Open 2025 ($2,624) — JIKA UP SUPER STRONG',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Target Reached',
    perahuDesc: 'Harga saat ini berada di $4,174 – $4,179, menguji Resistance R4 di $4,185.',
    busurS1: 'Busur S1 Selesai di $3,380 (Q1)',
    targetS2: 'Target S2 Tercapai Sempurna di $4,185 (Q3 - Oktober)',
    hsh: '⚠️ HSH ALERT AKTIF: Waktu sudah 83% (Oktober). Potensi tarikan magnetik pulang mendekati $3,850 di akhir tahun!',
    narrative: 'POSISI KITA SAAT INI! Emas telah menyelesaikan fase pelepasan target Semester 2 di level spektakuler $4,174 – $4,185. Namun karena waktu candle tahunan telah memasuki Kuartal 4 (83% durasi) dan selisih dari Open 1 Jan ($3,450) sudah melebihi +700 poin, maka magnet Hukum Rumah Idaman (HSH) mulai aktif menarik harga kembali untuk menyeimbangkan lilin tahunan.',
    playbook: 'PERINGATAN KRITIKAL: Jangan Buy di pucuk $4,180! Fokus kunci profit, lakukan scalping ketat, dan bersiap untuk fase koreksi tahunan menuju $3,800 – $3,900.',
  },
  2027: {
    year: 2027,
    status: 'PROJECTION',
    tag: 'Konstruksi Busur Raksasa (Rest Area)',
    open: 3850,
    high: 4250,
    low: 3650,
    close: 3950,
    range: 600,
    jika: 'UP',
    jikaDesc: 'Open 2027 (~$3,850) > Open 2026 ($3,450) — JIKA UP',
    perahu: 'SDW UP',
    perahuTitle: 'Small Boat Inside Bar (Konsolidasi)',
    perahuDesc: 'Harga bergerak di dalam rentang tahun 2026 untuk mengumpulkan energi kinetik baru.',
    busurS1: 'Konstruksi Busur Bawah ke $3,650 (Semester 1)',
    targetS2: 'Konsolidasi & Rebound Sehat di $4,100 (Semester 2)',
    hsh: 'Konsolidasi stabil di $3,950.',
    narrative: 'Setelah lonjakan tanpa henti 2024–2026, tahun 2027 diproyeksikan menjadi Tahun Busur (Rest Area). Semester 1 pasar akan membentuk busur bawah yang dalam ke $3,650 – $3,750 untuk membersihkan posisi buyer spekulatif. Semester 2 pasar berkonsolidasi sehat membentuk dasar kokoh sebelum gelombang berikutnya.',
    playbook: 'Tahun akumulasi terbaik! Manfaatkan Semester 1 saat busur bawah menyentuh $3,650 untuk pasang Buy Limit swing jangka panjang.',
  },
  2028: {
    year: 2028,
    status: 'PROJECTION',
    tag: 'Gelombang Kedua Breakout (BRK UP)',
    open: 3950,
    high: 4800,
    low: 3880,
    close: 4650,
    range: 920,
    jika: 'UP',
    jikaDesc: 'Open 2028 (~$3,950) > Open 2027 ($3,850) — JIKA UP',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Second Wave',
    perahuDesc: 'Penembusan rekor $4,250 meluncurkan harga menuju target $4,800.',
    busurS1: 'Busur Ringan ke $3,880 (Semester 1)',
    targetS2: 'Pelepasan Target Gelombang 2 ke $4,800 (Semester 2)',
    hsh: 'Ditutup di $4,650.',
    narrative: 'Bertepatan dengan siklus likuiditas global baru dan pemilu AS. Busur yang dibangun di 2027 melontarkan anak panah gelombang kedua menembus rekor baru hingga $4,800 per troy ounce.',
    playbook: 'Kombinasi klasik JIKA UP + BRK UP: Hold posisi swing buy dari 2027 dan trailing stop hingga $4,800.',
  },
  2029: {
    year: 2029,
    status: 'PROJECTION',
    tag: 'Milestone Sejarah $5,000+',
    open: 4650,
    high: 5400,
    low: 4580,
    close: 5150,
    range: 820,
    jika: 'UP',
    jikaDesc: 'Open 2029 (~$4,650) > Open 2028 ($3,950) — JIKA UP STRONG',
    perahu: 'BRK UP',
    perahuTitle: 'Big Boat Historic Peak',
    perahuDesc: 'Penetrasi bersejarah menembus angka keramat $5,000 per troy ounce.',
    busurS1: 'Busur Dangkal $4,580 (Semester 1)',
    targetS2: 'Euforia Global Menembus $5,000 s/d $5,400 (Semester 2)',
    hsh: 'Penutupan di $5,150.',
    narrative: 'Tahun pencapaian milestone emas dunia. Emas resmi menembus $5,000 per troy ounce di tengah pergeseran tatanan cadangan devisa internasional dan adopsi standar emas digital/fisik secara masif.',
    playbook: 'Level euforia tinggi: Amankan sebagian besar profit di atas $5,000 menjelang penutupan siklus dekade.',
  },
  2030: {
    year: 2030,
    status: 'PROJECTION',
    tag: 'Penutupan Siklus Dekade & HSH Makro',
    open: 5150,
    high: 5500,
    low: 4350,
    close: 4700,
    range: 1150,
    jika: 'NEUTRAL',
    jikaDesc: 'Akhir siklus 10 tahunan (2020 - 2030) — Exhaustion',
    perahu: 'NRL / ANL',
    perahuTitle: 'Normal Outside Bar / Reversal Anomaly',
    perahuDesc: 'Volatilitas ekstrem penutupan dekade dengan rentang di atas 1,000 poin.',
    busurS1: 'Puncak Klimaks $5,500 di Awal Tahun',
    targetS2: 'Distribusi Institusi & HSH Dekade Turun ke $4,350',
    hsh: 'HSH Super Dekade: Reversion ke area keseimbangan baru $4,700.',
    narrative: 'Penutupan siklus 10 tahunan COP TAH (2020–2030). Terjadi fenomena HSH Super Makro: Setelah mencapai klimaks di awal tahun, aksi ambil untung global memicu koreksi sehat dan menyeimbangkan harga di area $4,700.',
    playbook: 'Disiplin proteksi modal ketat: Kurangi risiko, beralih ke strategi cash preservation.',
  },
};

export default function GlobalStoryline({ data, liveTick }) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const selected = YEARLY_DATA[selectedYear] || YEARLY_DATA[2026];

  const currentLivePrice = liveTick?.price || data?.ohlcv_N?.close || 4174.5;
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
              <p className="text-xs text-slate-300 font-mono mt-1">
                Rentang Tahunan: <strong className="text-cop-gold tabular-nums">{selected.range} pts</strong> · Open: <strong className="text-white tabular-nums">${selected.open}</strong> · High: <strong className="text-emerald-400 tabular-nums">${selected.high}</strong> · Low: <strong className="text-rose-400 tabular-nums">${selected.low}</strong> · Close: <strong className="text-white tabular-nums">${selected.close}</strong>
              </p>
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
            <table className="w-full min-w-[1050px] text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-cop-card text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-cop-border">
                  <th className="py-2.5 px-3 whitespace-nowrap">Tahun</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Open</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">High</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Low</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Close</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Hukum JIKA</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Perahu</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Fase Busur (S1)</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Fase Target (S2)</th>
                  <th className="py-2.5 px-3 min-w-[250px]">Status HSH Akhir Tahun</th>
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
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                        <span className={isCurrent ? 'text-cop-gold font-black' : ''}>{row.year}</span>
                        {isCurrent && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                            LIVE
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 tabular-nums text-slate-300">${row.open}</td>
                      <td className="py-2.5 px-2 tabular-nums text-emerald-400 font-semibold">${row.high}</td>
                      <td className="py-2.5 px-2 tabular-nums text-rose-400 font-semibold">${row.low}</td>
                      <td className="py-2.5 px-2 tabular-nums text-white">${row.close}</td>
                      <td className="py-2.5 px-2">
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
                      <td className="py-2.5 px-2 font-bold text-cop-gold whitespace-nowrap">{row.perahu}</td>
                      <td className="py-2.5 px-3 min-w-[200px]">
                        <div className="text-slate-300 text-[11px] leading-relaxed">{row.busurS1}</div>
                      </td>
                      <td className="py-2.5 px-3 min-w-[220px]">
                        <div className="text-emerald-300 font-semibold text-[11px] leading-relaxed">{row.targetS2}</div>
                      </td>
                      <td className="py-2.5 px-3 min-w-[250px]">
                        <div className="text-slate-300 text-[11px] leading-relaxed">{row.hsh}</div>
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

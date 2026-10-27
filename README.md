# COP TAH Analytics Dashboard

**Sebelum memperbaiki aplikasi, baca [Peta aplikasi & panduan perbaikan](PANDUAN_APLIKASI.md).** Dokumen ini memetakan implementasi dan aturan terbaru; beberapa bagian README berikut merupakan dokumentasi awal.

> **XAUUSD / PAXG Trading Analytics** — Binance | Node.js + React + Vite + Tailwind CSS

A production-ready full-stack trading analytics dashboard implementing a proprietary methodology based on **3 Core Theories**, **5 Main Trading Laws**, and **Multi-Timeframe Fractal Storytelling**.

---

## 🚀 Quick Start

**One-click launch (Windows):**
```
Double-click: start.bat
```

**Manual launch:**
```bash
# Terminal 1 — Backend
cd backend
node server.js

# Terminal 2 — Frontend
cd frontend
npx vite --port 5173
```

Then open: **http://localhost:5173**

---

## 📁 Project Structure

```
TRADING/
├── backend/
│   ├── server.js          # Express + CCXT + WebSocket server
│   ├── rule_engine.js     # Core trading logic (all 5 Laws)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                        # Main dashboard layout
│   │   ├── components/
│   │   │   ├── Header.jsx                 # Nav + symbol/timeframe selectors
│   │   │   ├── OHLPanel.jsx               # OHL metrics (N vs B comparison)
│   │   │   ├── RSMatrix.jsx               # 9-row RS Matrix with touch colors
│   │   │   ├── OperationalStatus.jsx      # OP/Trend/Task/Move/Range indicators
│   │   │   ├── StorylineGenerator.jsx     # Fractal narrative card
│   │   │   ├── PendingOrders.jsx          # Busur + Modal calculator
│   │   │   ├── SessionStatus.jsx          # Tokyo/London/NY + HSH banner
│   │   │   └── LoadingScreen.jsx          # Connecting state
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js            # Live WS connection (auto-reconnect)
│   │   │   └── useAnalysis.js             # REST polling fallback
│   │   └── index.css                      # Dark theme styles + animations
│   └── package.json
├── package.json           # Monorepo root scripts
└── start.bat              # One-click Windows launcher
```

---

## 🧠 Core Rule Engine — 5 Trading Laws

### 1. Hukum JIKA (Trend Direction)
- `Open_N > Open_B` → **TREND UP** → Focus BUY setups
- `Open_N < Open_B` → **TREND DOWN** → Focus SELL setups

### 2. Hukum Perahu (Pattern Status)
Evaluates High/Low combinations to classify:

| Pattern | Meaning |
|---------|---------|
| `NRL UP` / `NRL DWN` | Normal expansion (outside bar) |
| `BRK UP` / `BRK DWN` | Big Boat — strong directional break |
| `SDW UP` / `SDW DWN` | Small Boat — inside bar / consolidation |
| `ANL UP` / `ANL DWN` | Anomaly — counter-trend breach |

### 3. Hukum Busur (Bow & Pending Orders)
- Trend UP → **Buy Limit** at Lower Bow (Support S1)
- Trend DOWN → **Sell Limit** at Upper Bow (Resistance R1)

### 4. RS Matrix — Dynamic Touch Colors
9 levels computed from previous candle's H/L/C:

| Level | Default Color | On Touch |
|-------|--------------|----------|
| R4–R1 | 🟠 Orange | 🟢 Green |
| Pivot  | ⚪ White  | 🟣 Violet |
| S1–S4 | 🩷 Pink   | 🔴 Red   |

### 5. Hukum Rumah Idaman (HSH — Home Sweet Home)
When candle is **>80% complete** and price has extended far from Open:
- **MEDIUM**: 15+ min remaining — Early warning
- **HIGH**: 5-15 min remaining — Active alert
- **CRITICAL**: <5 min remaining — Flashing banner

---

## 📐 3 Core Theories — Risk Management

**Lot Size Formula:**
```
Lot = User Modal / 25,000
```

Example: \$10,000 modal → **0.40 lot**

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/analysis?symbol=PAXG/USDT&timeframe=1h` | Full live analysis |
| GET | `/api/analysis/cached` | Last computed analysis |
| POST | `/api/modal` | Update trading modal (body: `{modal: 10000}`) |
| POST | `/api/reset-touches` | Reset RS level touch detection |
| GET | `/api/ohlcv?symbol=PAXG/USDT&timeframe=1h&limit=50` | Raw OHLCV data |

**WebSocket:** `ws://localhost:3001`
- Send: `{ type: "subscribe", symbol: "PAXG/USDT", timeframe: "1h" }`
- Receive: `{ type: "analysis", data: { ... } }` (every 30 seconds)

---

## 🎨 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Symbol | Timeframe | WS Status | Time              │
├─────────────────────────────────────────────────────────────┤
│  OHL METRICS: Open/High/Low/Close — Current (N) vs Prev (B) │
├─────────────────────────────────────────────────────────────┤
│  RS MATRIX: R4 R3 R2 R1 | PIVOT | S1 S2 S3 S4 (9 rows)    │
├───────────────────────────┬─────────────────────────────────┤
│  OPERATIONAL STATUS       │  PENDING ORDERS (Busur)         │
│  · OP/Trend/Task/Move     │  · BUY/SELL LIMIT action card   │
│  · Range N / Range B      │  · Key levels quick reference   │
│  · Lot Size (3 Theories)  │  · Modal / Lot calculator       │
├───────────────────────────┤─────────────────────────────────┤
│  STORYLINE GENERATOR      │  SESSION STATUS                 │
│  (Fractal Narrative)      │  · Tokyo / London / New York    │
│  Step-by-step guide       │  · HSH Warning Banner           │
└───────────────────────────┴─────────────────────────────────┘
```

---

## ⚙️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, CCXT, ws (WebSocket) |
| Market Data | Binance via CCXT (PAXG/USDT spot) |
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Icons | Lucide React |
| Fonts | Inter (UI) + JetBrains Mono (data) |

---

*⚡ Trade with discipline. Follow the Laws.*

### Panduan pemeliharaan terkini

Baca [PANDUAN_APLIKASI.md](PANDUAN_APLIKASI.md) sebelum perubahan. Panduan memuat menu, pemilik logika, aturan COP TAH, alur TF besar–kecil, rambu dan panel rincian, langkah menjalankan aplikasi, serta batas verifikasi. Status validasi tiap perubahan dicatat pada panduan dan laporan audit; build lokal atau push tidak berarti deployment maupun installer terverifikasi.

Laporan audit lintas menu: [AUDIT_KONSISTENSI.md](AUDIT_KONSISTENSI.md). Memuat sumber logika bersama, perbedaan yang dikoreksi dan batas verifikasi saat ini.

### Installer Windows 64-bit
Paket: `installers/COP-TAH-Windows-x64-Setup.exe`. Salin ke komputer tujuan lalu jalankan; Node dan Python disertakan. Buka pintasan COP TAH. Exness memerlukan terminal MT5 desktop yang sudah login pada komputer tujuan; Binance Spot dapat dipilih tanpa MT5. Tutup layanan lewat ikon area notifikasi. Installer tidak membawa `.env`, API key, akun atau cache harga komputer pembuat. Instalasi per pengguna di LocalAppData, server paket mendengarkan localhost saja.

Sumber installer berada di `windows-desktop/`; build dengan `python windows-desktop/build_installer.py` pada Windows x64 dengan Node, Python 3.11 dan dependensi proyek/bridge tersedia. Checksum SHA256 dan manifest build dihasilkan di `installers/`. Paket belum ditandatangani sertifikat penerbit. Baca `windows-desktop/PANDUAN-WINDOWS.txt` untuk pemasangan, pembaruan dan uninstall.


### Riwayat tugas dan waktu data — 19 Oktober 2026

Header menampilkan tanggal/jam WIB dan umur **Analisis diperbarui** serta **Harga sumber** secara terpisah. Pembaruan gagal mempertahankan snapshot terakhir hanya untuk sumber, instrumen dan TF yang sama, dengan peringatan **Pembaruan tertunda** dan timestamp asli. Waktu harga yang tidak diketahui tidak diganti dengan waktu pengambilan analisis.

Menu **Historis → Riwayat tugas tiap TF** menyimpan catatan level tersentuh, JIKA, Busur/Target dan perubahan pola termasuk ANL. Tersedia filter TF/ANL dan unduhan JSON. Penyimpanan lokal browser mencakup maksimal 1.500 periode yang sempat diamati saat aplikasi terbuka; bukan rekonstruksi seluruh historis broker. Waktu deteksi tidak membuktikan waktu sentuhan atau urutan tugas.

Lihat [panduan aplikasi](PANDUAN_APLIKASI.md) untuk penggunaan dan batas interpretasi. Pengujian terarah dan build frontend berhasil; installer Windows 1.2.1 sudah dibangun ulang dan memuat perubahan ini. Belum ada verifikasi deployment atau feed live untuk pembaruan ini.

Installer terbaru: **1.2.1**, sekitar **69,8 MiB**. Verifikasi installer, integritas ZIP, SHA256 serta kesamaan frontend/backend/dokumen paket dengan sumber build berhasil diperiksa. Seluruh 255 tes aplikasi lulus. Baca [catatan rilis 1.2.1](docs/RILIS_1.2.1.md); tutup COP TAH sebelum menjalankan installer pembaruan.

## Pembaruan 1.3.0

[Logika Puzzle COP TAH](docs/LOGIKA_PUZZLE_COPTAH.md) mendokumentasikan aturan Om Dhan, konfirmasi TF adik, Selasa/Rabu, HSH referensi dan keputusan entry. [Uji historis](docs/UJI_HISTORIS_PUZZLE.md) melaporkan cakupan dan keterbatasannya; hasil bukan bukti profitabilitas. UI memakai rincian lipat dan layout responsif.

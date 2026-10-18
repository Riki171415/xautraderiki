# Peta aplikasi & panduan perbaikan COP TAH

> Baca dokumen ini sebelum mengubah aplikasi. Cocokkan dengan kode dan pengujian terkini; dokumen bukan pengganti pemeriksaan kode.
>
> Diperbarui: 18 Oktober 2026, WIB. Panduan kondisi kode saat ini, disiapkan untuk commit/push pembaruan 18 Oktober 2026. Baseline sebelum rangkaian perubahan ini: `d4a8285`. Status push dilaporkan melalui Git; push tidak membuktikan deployment Vercel berhasil.

## Status dan lokasi utama terbaru

- **Peta Global:** tampilan empat tahap melalui `CoptahStory` (TF besar, Daily/Market, H4, TF kecil), rincian terstruktur `StoryNodeDetails`, arsip tahunan tetap dapat dibuka.
- **Matriks R/S:** 13 timeframe × 9 level; rambu singkat, maksimal dua label dan +jumlah; satu panel rincian kanan, tanpa dock bawah yang mengecilkan tabel.
- **Sinyal:** STRONG BUY/SELL hanya TF kecil M1–H1; SUP/RES KUAT merupakan konteks Daily. Konflik memberi peringatan, tidak mengganti pemeriksaan strong lama.
- **Logika bersama terbaru:** `rvsLimit.mjs`, `directionContext.mjs`, `coptahStory.mjs`. Rincian aturan ada pada bagian akhir panduan; tidak ada API harga baru.
- **Batas verifikasi:** versi sebelum perubahan alur/rincian pernah lolos tes dan build. Kondisi akhir belum diuji/build ulang atas permintaan pengguna; pengguna memeriksa tampilan sendiri.

## 1. Mulai dari sini

1. Baca permintaan pengguna dan aturan analisis pada bagian 4–7.
2. Periksa `git status --short`, `git log -5 --oneline`, dan diff. Jangan menimpa perubahan yang belum disimpan.
3. Temukan berkas melalui tabel bagian 3. Lacak dari sumber data → model → tampilan → notifikasi.
4. Reproduksi masalah pada instrumen, broker, timeframe, periode, toleransi, dan tab yang sama.
5. Perbaiki sumber masalah bersama; hindari menambal angka/narasi pada satu komponen saja.
6. Jalankan pemeriksaan bagian 9, perbarui dokumen ini jika perilaku berubah, lalu laporkan hasil dan keterbatasannya.
7. Commit/push hanya ketika diminta. Jangan mengaku deployment berhasil tanpa verifikasi.

## 2. Gambaran sistem

- Frontend: React 18, Vite, Tailwind/CSS; port lokal 5173.
- Backend: Node.js/Express/WebSocket; `backend/server.js`, port 3001.
- MT5: `exness_mt5_bridge.py` mengirim tick/candle terminal Exness ke backend. Backend mempunyai supervisor bridge; jangan menjalankan banyak instance.
- MT5 EA alternatif: `CopTah_Exness_Bridge.mq5`.
- Binance: `backend/binance_data.js` dan jalur browser fallback; instrumen Binance tidak boleh dilabeli sebagai instrumen Exness.
- Twelve: `backend/twelve_data.js`, `api/twelve.js`; key disimpan di environment server, bukan frontend atau chat.
- Rumus backend dipakai juga oleh frontend melalui plugin `virtual:coptah/*` dalam `frontend/vite.config.js`. Jangan membuat mesin rumus kedua.
- Data snapshot REST + tick WebSocket dipilih sesuai scope broker/instrumen/timeframe. Proyeksi tick menambah informasi gerak dan sentuhan intraperiode.
- APK tablet dan installer berada di `android-tablet/` dan `installers/`; build web tidak otomatis memperbarui APK.

### Konfigurasi sumber

`frontend/src/config.js` menentukan default: localhost → EXNESS, host online → TWELVE. `VITE_API_URL` dan `VITE_WS_URL` dapat mengubah alamat server. Default `/api` dan `/ws` diteruskan Vite ke port 3001.

Exness XAUUSD/BTCUSD dapat memakai simbol broker seperti XAUUSDc/BTCUSDc. Binance BTC/USDC, PAXG/USDT, dan XAUT adalah instrumen berbeda. Jangan mencampur snapshot, range, histori, harga, atau spesifikasi kontraknya. Twelve online memerlukan `TWELVEDATA_API_KEY`; MT5 komputer tidak otomatis tersedia di Vercel.

## 3. Menu dan peta berkas

Daftar menu tunggal: [navigation.mjs](frontend/src/navigation.mjs). Sidebar memiliki tepat enam menu utama; mobile memakai Beranda, Analisis, Terminal, dan Menu.

| Menu / fungsi | Berkas awal yang diperiksa |
|---|---|
| Shell, state bersama, pergantian broker/instrumen, pusat notifikasi | [App.jsx](frontend/src/App.jsx), [Header.jsx](frontend/src/components/Header.jsx) |
| Beranda | [OHLPanel.jsx](frontend/src/components/OHLPanel.jsx) |
| Analisis → Peta Global | [GlobalStoryline.jsx](frontend/src/components/GlobalStoryline.jsx) |
| Analisis → Kunci H4 / Rumah HSH | [H4Workspace.jsx](frontend/src/components/H4Workspace.jsx), [H4LevelTargets.jsx](frontend/src/components/H4LevelTargets.jsx), [HSHOverview.jsx](frontend/src/components/HSHOverview.jsx) |
| Analisis → Sesi Market & Daily | [MarketHabitPanel.jsx](frontend/src/components/MarketHabitPanel.jsx), [MarketSessionCycle.jsx](frontend/src/components/MarketSessionCycle.jsx) |
| Terminal & Entry | [Leak4RegTable.jsx](frontend/src/components/Leak4RegTable.jsx), [TimeframeTerminal.jsx](frontend/src/components/TimeframeTerminal.jsx), [TerminalAnalysisDetails.jsx](frontend/src/components/TerminalAnalysisDetails.jsx) |
| Chart & Fractal | [CandlestickChart.jsx](frontend/src/components/CandlestickChart.jsx) |
| Tabel OHLC | [OHLCWorkspace.jsx](frontend/src/components/OHLCWorkspace.jsx) |
| Matriks R/S satu layar | [MatrixSlideshow.jsx](frontend/src/components/MatrixSlideshow.jsx) |
| Trading Plan dua arah & rincian TF kecil | [TwoWayH4Plan.jsx](frontend/src/components/TwoWayH4Plan.jsx), [twoWayH4.mjs](frontend/src/twoWayH4.mjs) |
| Tab tugas Market–Year | [TimeframeTasks.jsx](frontend/src/components/TimeframeTasks.jsx), [timeframeTask.mjs](frontend/src/timeframeTask.mjs) |
| Indikasi H4 → sesi → Weekly | [H4SessionOutlook.jsx](frontend/src/components/H4SessionOutlook.jsx), [h4SessionOutlook.mjs](frontend/src/h4SessionOutlook.mjs) |
| Penanda H4 bersama | [H4DirectionStrip.jsx](frontend/src/components/H4DirectionStrip.jsx), [H4PlanMarkers.jsx](frontend/src/components/H4PlanMarkers.jsx) |
| Popup High/Low N/B | [TimeframeRangePopup.jsx](frontend/src/components/TimeframeRangePopup.jsx) |
| Popup sinyal kuat | [StrongSignalPopup.jsx](frontend/src/components/StrongSignalPopup.jsx) |
| Historis / Panduan / Sumber Data | [HistoricalDataViewer.jsx](frontend/src/components/HistoricalDataViewer.jsx), [AnalysisGuide.jsx](frontend/src/components/AnalysisGuide.jsx), shell App |
| CSS tampilan | [index.css](frontend/src/index.css) |

Historis, Panduan, dan Sumber Data adalah menu pendukung. Alias lama Global/H4/Cycle menuju tab Analisis terkait; Table/Terminal/Weekly menuju Terminal & Entry. Pertahankan tab, timeframe, broker/instrumen, toleransi, serta pilihan pantauan Daily ketika berpindah halaman. Render isi tab aktif saja; jangan mempertahankan panel analisis lengkap tersembunyi demi menjalankan notifikasi.

### Jalur data dan model penting

| Perilaku | Berkas |
|---|---|
| Pengambilan snapshot / tick | [useAnalysis.js](frontend/src/hooks/useAnalysis.js), [useWebSocket.js](frontend/src/hooks/useWebSocket.js) |
| Scope data; jangan tampilkan XAU lama pada BTC | [dataScope.mjs](frontend/src/dataScope.mjs) |
| Range/sentuhan dari tick dan snapshot | [useLiveMatrix.js](frontend/src/hooks/useLiveMatrix.js), [liveMatrix.mjs](frontend/src/liveMatrix.mjs) |
| Pivot, R/S, JIKA, Perahu dan aturan backend | [rule_engine.js](backend/rule_engine.js) |
| Hierarki narasi backend | [h4_compass.js](backend/h4_compass.js) |
| Kecocokan H4 dengan TF besar/kecil | [h4LevelMatches.mjs](frontend/src/h4LevelMatches.mjs) |
| Rencana H4 bersama dan penanda sel | [h4ConfluencePlan.mjs](frontend/src/h4ConfluencePlan.mjs), [matrixPlan.mjs](frontend/src/matrixPlan.mjs), [useH4Plan.js](frontend/src/hooks/useH4Plan.js) |
| Narasi tugas harus menyebut label TP H4 yang sama dengan tabel | [timeframePlanNarrative.mjs](frontend/src/timeframePlanNarrative.mjs) |
| Hierarki acuan timeframe dan pekan broker | [taskHierarchy.mjs](frontend/src/taskHierarchy.mjs) |
| Sinyal kuat dan deduplikasi kejadian | [strongSignal.mjs](frontend/src/strongSignal.mjs), [strongSignalAlerts.mjs](frontend/src/strongSignalAlerts.mjs) |
| TF kecil mengikuti Busur TF besar | [bowContinuation.mjs](frontend/src/bowContinuation.mjs) |
| Dua H4 terakhir Daily | [dailyH4Task.mjs](frontend/src/dailyH4Task.mjs) |
| Peringatan kebiasaan dan tugas Daily | [habitWarnings.mjs](frontend/src/habitWarnings.mjs), [TableMarketWarnings.jsx](frontend/src/components/TableMarketWarnings.jsx) |
| Monitor notifikasi tunggal tingkat aplikasi | [useAnalysisNotifications.js](frontend/src/hooks/useAnalysisNotifications.js) |
| Sesi normal/strong | [market_cycle.js](backend/market_cycle.js) |
| Histori kebiasaan sesi | [market_habits.js](backend/market_habits.js) |
| Urutan entry → TP/SL | [plan_monitor.js](backend/plan_monitor.js) |
| Pilihan selisih harga | [instrumentTolerance.mjs](frontend/src/instrumentTolerance.mjs) |

## 4. Rumus wajib: Excel COP TAH

Masukan: OB = Open B, HB = High B, LB = Low B, ON = Open N, dan timeframe yang benar. Close B tidak dipakai untuk Pivot.

```text
PV = (OB + HB + LB + 2*ON - koreksi) / 5
koreksi H4 = 0.08; timeframe lainnya = 0.01
R1 = 2*PV - LB
S1 = 2*PV - HB
R2 = PV - S1 + R1
S2 = PV - (R1 - S1)

H1, H4, Market:
R3 = PV - S2 + R2
S3 = PV - (R2 - S2)
R4 = PV - S3 + R3
S4 = PV - (R3 - S3)

Daily sampai Year:
R3 = 2*PV + HB - 2*LB
R4 = 3*PV + HB - 3*LB
S3 = 2*PV - 2*HB + LB
S4 = 3*PV - 3*HB + LB
```

M1–M30 memakai perluasan keluarga H1. Hitung presisi penuh, bulatkan hanya saat ditampilkan. Data wajib hilang → belum tersedia, bukan nol atau data pengganti. Jangan menukar nama atau mengurutkan ulang nilai level anomali untuk menyamarkannya. WAIT jika urutan entry–SL–TP tidak valid.

Referensi pengguna: Excel manual `Tabel RPS Coptah by RushArt.xlsx` dan indikator Ferrari COP TAH. File `.ex5` adalah biner; kesamaan menyeluruh dengan source Ferrari tidak boleh diklaim hanya dari screenshot. Excel asli tidak diubah.

## 5. Aturan tugas timeframe dan perjalanan harga

| JIKA | Busur | Target | HSH |
|---|---|---|---|
| Open N > Open B → UP | Turun, S1 | Naik, R1 | Open N |
| Open N < Open B → DOWN | Naik, R1 | Turun, S1 | Open N |
| Sama → NETRAL | Belum ditentukan | Belum ditentukan | Open N |

- MOVE memakai Close N vs Open N. Searah JIKA = arah Target; berlawanan = arah Busur. Ini tidak membuktikan level sudah tercapai.
- R2–R4/S2–S4 adalah level lanjutan; tidak otomatis berarti tugas akhir.
- Pantauan Daily manual adalah tambahan; tidak mengganti Busur/Target utama.
- Sentuhan level, konfirmasi akhir Busur, entry teramati, dan TP transaksi adalah status berbeda.
- Dua H4 terakhir mengikuti batas Daily broker. Jangan mengunci ke jam 21.00/01.00 WIB. Konteks Daily dan tabel harus memiliki periode sama.
- Range N = High N − Low N, range B = High B − Low B pada timeframe yang sama. Tampilkan pelebaran dan jarak sasaran; range bukan batas maksimum pasar atau “sisa tenaga”.
- Toleransi BTC dinyatakan dalam satuan harga, bukan point broker: termasuk 0, 1, 5, 10, 25, 50, 75, 100, 250. Default BTC 25; XAU default 0. Baca nilai terbaru dari model, jangan duplikasi daftar di UI.

### Rantai acuan yang diminta pengguna

| Timeframe tugas | Acuan |
|---|---|
| Daily | H4 dan Market |
| Weekly | Daily |
| Month | Weekly |
| Quarter | Month |
| Semester | Quarter |
| Year | Quarter |

Month memakai candle W1 kalender broker yang beririsan dengan periode Month. Week 1–2 sebagai waktu Busur, Week 3 dan seterusnya sebagai waktu Target; gerak aktual tetap diperiksa. Ini tidak boleh diganti pembagian tanggal 1–7/8–14 tanpa persetujuan.

### H4 → sesi → Weekly

JIKA H4 (Open N vs Open B) adalah patokan indikasi arah sesi. MOVE H4 adalah perkembangannya, bukan pengganti arah JIKA. Arah H4 searah JIKA Weekly berarti arah Target Weekly; berlawanan berarti arah Busur. Data lama/netral/expired ditahan. Bukan kepastian arah sesi berikutnya.

## 6. Kecocokan, Trading Plan dan sinyal kuat

- Cocokkan seluruh R4–R1, Pivot, S1–S4 H4 dengan Market, Daily, Week, Month, Quarter, Semester, Year; HSH/Open juga dapat menjadi pasangan konteks model.
- Setelah area H4 cocok TF besar ditemukan, amati M1, M5, M15, M30, H1 menuju/menjauh dari area tersebut. Tidak hanya S1/R1.
- Penanda sel memakai nama dan nilai counterpart asli. Beberapa kecocokan: satu label terdekat + `+n`, rincian melalui keterangan. Jangan membanjiri sel sampai meluber.
- Entry utama H4 dan TP/SL memakai satu rencana bersama. TF kecil tidak otomatis mempunyai order mandiri; skenario mengikuti Busur adalah konteks terpisah, bukan perintah transaksi.
- TP1 H4 yang muncul pada sel Daily harus ikut disebut di narasi Daily dengan nilai H4, nilai counterpart, dan selisih. Target Daily tidak sama dengan TP H4.
- Trading Plan merupakan tab pertama/default matriks; rincian dua arah dan checklist harus tetap tersedia meski status WAIT.

Label **SINYAL KUAT BUY/SELL** berarti semua syarat model terpenuhi pada snapshot, bukan probabilitas kemenangan. Syarat saat ini:

1. Data dan periode aktif, snapshot segar.
2. JIKA dan MOVE TF kecil searah skenario.
3. H4 MOVE dan fase TF induk/acuan selaras; Month juga memeriksa pekan broker.
4. H4 cocok level TF besar serta TF kecil punya pasangan yang menuju area H4.
5. Jarak sasaran ≤ range B setiap timeframe acuan yang diperiksa.
6. Pola sesi NORMAL/STRONG terverifikasi dan bias searah.
7. Entry–SL–TP H4 valid pada arah yang sama.

Popup otomatis hanya untuk sinyal lengkap; deduplikasi per broker/instrumen/toleransi/TF/periode/target. Tombol BUY/SELL membuka checklist juga ketika belum lengkap. Popup harus memperbarui status bila syarat gugur, dan tidak menampilkan instrumen sebelumnya. Monitor dipanggil sekali di App; jangan menambah monitor pada masing-masing tab.

### Batas skenario Busur TF kecil

Contoh TF besar JIKA UP/MOVE DOWN: Busur turun, TF kecil DOWN dapat mendukung pengamatan SELL. Bullish simetris. Sesuai instruksi pengguna, penahanan memerlukan **semua tiga batas**, bukan salah satu:

- JIKA kecil tidak lagi sesuai arah skenario.
- Pivot/S (untuk SELL) atau Pivot/R (untuk BUY) TF besar tersentuh.
- Low B (SELL) atau High B (BUY) TF besar ditembus.

Sebagian batas → peringatan. Data kurang → belum lengkap. Bukan jaminan aman dan bukan pengganti SL. Kondisi dihitung dari data periode; tidak boleh mengklaim perubahan/urutan historis yang belum direkam.

## 7. Sesi NORMAL dan STRONG

Jendela metode saat ini: ASIA 06.00–14.00, EROPA 14.00–20.00, USA 20.00–04.00, TRANSISI 04.00–06.00 WIB. Ini konvensi metode aplikasi, bukan jadwal bursa/DST. Jangan mengubah diam-diam berdasarkan ilustrasi lama 05.00/15.00/20.00.

**NORMAL bearish:** Asia Low → High; Low Eropa lebih rendah dari Asia lalu High Eropa lebih tinggi; USA High lebih rendah dari Eropa lalu Low lebih rendah. Bullish memakai kebalikan. Urutan ekstrem harus teramati; keduanya di candle H1 yang sama → `ORDER_UNVERIFIED`. Urutan bertentangan → MIXED. Sesi belum selesai → sementara. Tidak otomatis berarti sasaran Weekly selesai.

**STRONG bearish:** High dan Low Eropa lebih rendah dari Asia, High dan Low USA lebih rendah dari Eropa. Bullish simetris makin tinggi. Perbandingan ketat; nilai sama tidak memenuhi syarat ekstrem berurutan. Periksa bukti dan status sesi dalam `market_cycle.js`; tidak cukup hanya range melebar.

Batas verifikasi: alur pembukaan dan sisa pergerakan antarsesi tidak membuktikan gap/kontinuitas tick; urutan dalam satu H1 tidak diketahui; pola STRONG saat ini terutama memeriksa ekstrem sesi dan penyelesaian sesi. Jangan menyebut semua detail narasi teori telah terbukti jika kode belum memeriksanya.

## 8. Menjalankan dan memeriksa aplikasi

Dari root proyek, dua terminal terpisah:

```powershell
npm.cmd run start:backend
npm.cmd run dev:frontend -- --host 127.0.0.1 --port 5173 --strictPort
```

Buka `http://127.0.0.1:5173/`. Health: `http://127.0.0.1:3001/api/health`.

`start.bat` tersedia, tetapi membuka jendela dan memulai bridge sendiri; jangan jalankan berulang jika server/bridge sudah hidup. Untuk helper background Windows gunakan `Start-Process -WindowStyle Hidden`. Pastikan port 3001/5173 tidak sudah dipakai sebelum memulai instance lain.

Log lokal yang berguna: `backend-runtime.log`, `backend-runtime-error.log`, `vite-runtime.log`, `vite-runtime-error.log`, serta log MT5. Log adalah data diagnostik; jangan menyalin credential ke dokumen, commit, atau chat.

Endpoint penting: `/api/analysis`, `/api/analysis/cached`, `/api/mt5/status`, `/api/mt5/history`, `/api/historical/candles`, `/api/yearly-history`, `/api/twelve`. Baca kontrak di server sebelum mengubah parameter. Health OK hanya membuktikan server hidup, bukan MT5 tersambung atau semua riwayat tersedia.

## 9. Pengujian dan penerimaan

```powershell
node --test backend/*.test.js frontend/src/*.test.mjs
npm.cmd run build:frontend
git diff --check
```

- Pilih tes terkait terlebih dahulu; kemudian seluruh suite untuk perubahan analisis lintas menu.
- File tes penting: `backend/market_cycle.test.js`; frontend `timeframeTask.test.mjs`, `strongSignal.test.mjs`, `strongSignalAlerts.test.mjs`, `h4SessionOutlook.test.mjs`, `timeframePlanNarrative.test.mjs`, `matrixH4Anchor.test.mjs`, `dailyH4Task.test.mjs`, `dataScope.test.mjs`, `appRender.test.mjs`, `terminalRender.test.mjs`.
- SSR render memeriksa struktur dan crash, bukan geometri layar atau interaksi browser.
- SSR Vite harus memakai cacheDir pengujian terpisah dengan optimizeDeps tidak melakukan discovery. Jangan memakai cache `.vite-runtime` untuk tes ad hoc.
- Verifikasi desktop 1366×768, tablet landscape 1280×800, dan HP: R4–S4 utuh, header tidak terpotong, label tidak meluber, popup dapat ditutup, seluruh tab bisa diakses.
- Uji Exness/Binance/Twelve, XAU/BTC, sesi berganti, candle baru, toleransi berubah, data stale/hilang, WAIT, anomali, target sebelum entry, dan notifikasi tidak berulang.
- Tidak boleh mengklaim verifikasi visual jika browser tidak bisa diakses. Browser lokal sempat berhasil dibuka; pemeriksaan interaksi/responsif dihentikan atas permintaan pengguna. Jangan menyatakan browser tidak tersedia berdasarkan kegagalan sesi lama.

## 10. Masalah yang pernah terjadi: cek sebelum menambal

| Gejala | Pemeriksaan awal |
|---|---|
| `Cannot read properties of null (reading useState)` | Dua instance Vite, dua React, dedupe React, cache SSR bercampur cache dev. Jangan langsung mengubah hook bisnis. |
| XAU/BTC saling membawa angka lama | Scope snapshot/tick, symbol broker sebenarnya, dataScope, riwayat dan cache sumber. |
| Label tabel ada tetapi narasi hilang | confluenceCell → timeframePlanMarkers; hindari membuat narasi terpisah dari rencana. |
| TP dianggap tercapai sebelum entry | plan_monitor; cek urutan candle, same-candle ambiguity, SL lebih dulu, coverage histori. |
| Tabel terpotong atau berkedip | Ukuran viewport, tinggi dock, ResizeObserver, row budget, tinggi label, urutan kartu. Jangan hanya menambah CSS override baru. |
| Month/Quarter/Semester/Year kosong | Coverage riwayat bulanan, batas kalender N/B, simbol/sumber aktif. Jangan mengisi dengan timeframe lain. |
| HSH sesi kosong | Coverage sesi aktif/pembanding, periode dan waktu WIB; HSH = Open sesi, bukan Pivot. |
| Binance HTTP 500 | Log backend, allowlist pasangan, endpoint publik, respons malformed/rate limit. Jangan mengganti label instrumen. |
| MT5 tidak aktif | Terminal login, supervisor bridge, single instance, endpoint tick/status; health server saja belum cukup. |
| Status live salah saat akhir pekan | quoteTimestamp, marketDataStatus, periode aktif; candle terakhir bukan harga live. |

### Utang teknis dan batas yang harus diingat

- `index.css` mempunyai banyak aturan bertumpuk akibat iterasi tampilan. Saat memperbaiki layout, telusuri specificity dan aturan terakhir; konsolidasikan blok terkait secara terukur, jangan menghapus gaya lain secara luas.
- `backend/rule_engine.js` masih mempunyai narasi jadwal lama `calcSubAlurCerita`; ia tidak boleh dijadikan acuan utama untuk membatalkan rantai pengguna terbaru dalam `taskHierarchy.mjs` (terutama Year ← Quarter). Audit pemanggil bila mengubahnya.
- Popup native dialog memerlukan verifikasi browser untuk keyboard/fokus, Escape, klik backdrop, perubahan harga, dan pergantian instrumen.
- Belum ada backtest yang membuktikan probabilitas kemenangan label “sinyal kuat”. Jangan menambahkan persentase keyakinan buatan.
- Selalu cek commit, branch, remote dan status deployment. Localhost, kode yang dipush, dan versi Vercel dapat berbeda. Jangan menganggap push sama dengan deployment sukses.

## 11. Catatan perubahan berikutnya

Setiap perubahan penting, perbarui tanggal dokumen, aturan yang berubah, berkas pemilik logika, pengujian yang dijalankan, keterbatasan visual, serta commit/push/deployment yang benar-benar terverifikasi. Jangan menulis API key, nomor akun, password, atau token di catatan ini.

### Tampilan saran pada tab tugas

`TimeframeTasks.jsx` menampilkan `TaskTradeAdvice.jsx` di bagian atas setiap tab Market–Year: rencana H4 bersama, entry BUY/SELL LIMIT, TP1–TP3 dan SL. Status bersyarat tidak diubah menjadi sinyal kuat kecuali seluruh syarat model terpenuhi dan sasaran sinyal adalah timeframe tab tersebut. Data lama/WAIT tidak menampilkan harga order valid. Penanda pasangan pada timeframe tab tetap ditulis terpisah dari Target tugas. Penjelasan JIKA, acuan dan range tersedia dalam rincian yang dapat dibuka.

Matriks R/S memakai tombol Trading Plan, Tugas TF, Peringatan, dan Panduan Warna untuk membuka panel kanan. Panel tidak mengambil tinggi tabel. Pilihan Tugas TF tetap tersimpan saat ditutup/dibuka kembali.

### RVS Limit dan kekuatan relatif Daily

`rvsLimit.mjs` memakai High B dan Low B timeframe itu sendiri (bukan Open ± range). Tembus atas: High N > High B; tembus bawah: Low N < Low B. Kesamaan hanya sentuhan. Rentang N dapat membuktikan kedua sisi pernah ditembus, bukan urutannya. Data lama, periode tidak aktif atau range tidak lengkap tidak diberi klaim tembus. Indikasinya mengerjakan tugas TF lebih besar, tanpa otomatis memilih TF tujuan atau mengaktifkan order.

Support Daily (Pivot/S1–S4) relatif lebih kuat jika di atas Pivot Month dan Low B Daily; resistance (Pivot/R1–R4) jika di bawah Pivot Month dan High B Daily. Perbandingan ketat, bukan toleransi H4. Label di sel Daily dan rincian tab Daily menggunakan model sama; popup semua timeframe menampilkan batas RVS. Rumus harga dan syarat sinyal kuat tidak diubah.

Label kekuatan level Daily adalah SUP KUAT / RES KUAT. Istilah STRONG BUY/SELL hanya untuk M1–H1 yang memenuhi seluruh syarat strongSignal.mjs. Penamaan STRONG BUY/SELL Daily sebelumnya sudah dibatalkan.

### Matriks ringkas dan panel rincian kanan

Panel bawah Matriks R/S diganti tombol Trading Plan, Tugas TF, Peringatan, dan Panduan Warna. Semuanya membuka satu `MatrixDetailPanel` berupa native dialog di kanan dengan lebar min(440px,40vw), atau selebar layar pada HP. Dialog menimpa tampilan tanpa mengubah geometri tabel; Escape, latar dan tombol tutup mengembalikan fokus ke pemicu. Isi High/Low memakai TimeframeRangePopup dalam mode embedded agar tidak membuat modal kedua. Pilihan tugas disimpan di MatrixSlideshow, panel ditutup saat scope broker/instrumen berganti, dan tick tidak mereset panel.

Sel tabel memakai harga, tanda ✓/titik, maksimal dua label dan +jumlah untuk penanda lain. Klik sel membuka seluruh pasangan dan peran H4. Label SUP/RES KUAT adalah kekuatan relatif level Daily. STRONG BUY/SELL hanya untuk sinyal entry TF kecil M1–H1 setelah seluruh unsur model strongSignals terpenuhi. Angka Open N/B dan seluruh 13 timeframe serta R4–S4 dipertahankan. Rumus dan API tidak berubah.

Pengujian otomatis render/sinkronisasi penanda dan build versi panel awal pernah lolos. Perubahan berikutnya pada konflik arah, alur cerita, dan rincian Peta Global belum diuji/build ulang sesuai instruksi pengguna. Pengujian interaksi/ukuran layar browser diserahkan kepada pengguna; belum dinyatakan terverifikasi pada desktop, tablet dan HP.

Penyesuaian kartu pada panel kanan: Trading Plan menggunakan baris harga penuh (label kiri, angka kanan); penanda M1–H1, area perhatian H4 dan tiket H4 disusun satu kolom. Layout lima kolom desktop tidak dipakai di dalam panel sempit. Ruang/padding dipadatkan dan angka diperbesar. Pengujian lanjutan diserahkan kepada pengguna sesuai permintaannya.

### Koreksi istilah sinyal dan kekuatan Daily

Menggantikan penamaan STRONG BUY/SELL Daily sebelumnya: sel Daily memakai SUP KUAT / RES KUAT dan rincian Support/Resistance relatif kuat. STRONG BUY/SELL dikhususkan bagi M1–H1 yang lolos seluruh pemeriksaan strongSignals; pada tabel ditempel ke sel TF kecil yang mempunyai pasangan ke sasaran H4 sinyal tersebut. Tidak menambah atau mengurangi syarat aktivasi sinyal. Pengujian tidak dijalankan ulang sesuai permintaan pengguna.

### Pembacaan gabungan COP TAH dan cadangan

`directionContext.mjs` menjadi model bersama JIKA (Open N/B), MOVE (Close N/Open N), OP–PV (Open N/Pivot) dan Perahu dari mesin backend yang dipakai melalui virtual:coptah/rule_engine. Perahu memakai N/B timeframe yang sama, tidak mengubah klasifikasi mesin. Minimal satu UP dan DOWN menandai CAMPUR/indikasi sideways; EQV tidak otomatis konflik. Open di sisi berlawanan Pivot menandai pelemahan arah yang muncul pada komponen lain. Perahu ANL dan anomali urutan R/S dibedakan. Data lama/tidak aktif tidak mengklaim konflik baru.

Tabel memakai rambu ringkas pada Pivot dan +jumlah, sementara DirectionContext pada panel level, Tugas TF serta rincian Trading Plan memuat bukti, pasangan level ke seluruh TF lebih besar, range pantauan R1–S1 dan alternatif R2–S2. Nilai asli tidak ditukar jika R/S anomali. Hanya syarat lama strongSignals menentukan strong; keluaran ditambah warnings untuk konflik TF kecil/H4/Daily/TF sasaran, ditampilkan bersama sinyal dan popup, tanpa membatalkan strong.

Cadangan Daily konflik/anomali mencakup Pivot Week, pasangan S1/R1 Daily–Pivot Week beserta syarat JIKA H4 atau JIKA+OP–PV H1, dan batas RVS Daily/H4 yang berada pada sisi valid. Level ASIA hanya ditambahkan jika kolom sesi secara eksplisit terverifikasi ASIA dengan R/S tersedia; tidak mengambil level MARKET USA/EROPA lalu menamainya ASIA. Snapshot tidak cukup untuk memastikan sesi sebelumnya strong, Week strong tanpa sentuh Pivot, atau HSH tajam; panel memberi keterangan belum terverifikasi. Tidak membuat order instant, tidak mengganti rencana H4 dan tidak mengarang SL/TP cadangan.

Implementasi ini belum diuji otomatis, build, maupun browser sesuai permintaan pengguna untuk melakukan verifikasi sendiri. Status pengiriman mengikuti commit dan laporan push terbaru; bukan klaim deployment.

### Alur cerita utuh TF besar → H4 → TF kecil

`coptahStory.mjs` merangkai model timeframeTask, taskHierarchy, directionContext, RVS Limit, kecocokan H4/mikro, dan strongSignals ke satu hasil narasi bersama. Urutan penyajian Year, Semester, Quarter, Month, Week, Daily, Market, H4, H1, M30, M15, M5, M1; hubungan acuan tetap mengikuti aturan pengguna (Year dan Semester memakai Quarter, Daily memakai H4+Market), bukan menganggap urutan visual sebagai sebab-akibat. Tiap node menyebut JIKA, MOVE, fase, acuan Busur/Target/HSH, hubungan tugas, range dan RVS, pasangan H4, konflik serta cadangan. TF kecil menyebut pasangan level H4 dan menuju/menjauh; STRONG hanya memakai model tujuh syarat lama. Kesimpulan memakai tiket entry/TP/SL H4 yang sama, bukan order baru.

CoptahStory tampil lengkap di Analisis/Peta Global menggunakan kolom yang diproyeksikan live dan toleransi aplikasi; arsip kompas lama dipindahkan ke rincian. Bentuk compact tampil di Terminal ringkasan dan tiket Trading Plan/tab tugas. Cerita mencantumkan celah data/masa berlaku/harga lama serta tidak mengarang hubungan yang belum terverifikasi. Tidak menjalankan pengujian, build, atau browser sesuai instruksi pengguna. Status pengiriman mengikuti commit dan laporan push terbaru; bukan klaim deployment.

### Penyederhanaan Peta Global

Peta Global memakai mode mapView pada CoptahStory: status utama, tahap 1 tugas TF besar, tahap 2 Daily/Market, tahap 3 jembatan H4, tahap 4 konfirmasi H1–M1, lalu kesimpulan tiket H4. Kartu menampilkan JIKA/MOVE, fase, angka Busur/Target dan rambu konflik; narasi panjang serta pasangan dan cadangan berada dalam rincian tertutup. Arsip kompas/tahunan tetap tersimpan dalam rincian terpisah. Model cerita tidak berubah; hanya ditambah properti JIKA/MOVE/Busur/Target agar tampilan tidak mengekstrak angka dari teks narasi. Tidak melakukan pengujian/build/browser sesuai permintaan pengguna sebelumnya.

Rincian alur cerita memakai StoryNodeDetails bersama: dasar arah dalam kotak nilai, range/RVS, hubungan tugas, pasangan H4, peringatan, dan kartu skenario cadangan berharga besar. Narasi penuh tersedia terpisah. Saat rincian kartu Peta Global dibuka, kartu melebar sepanjang baris agar teks tidak terhimpit kolom sempit; rincian ditutup mengembalikan susunan grid. Belum diuji/build sesuai permintaan pengguna.

## 12. Ringkasan pengiriman 18 Oktober 2026

Rangkaian pembaruan ini mencakup tugas COP TAH dan pola sesi, konfirmasi TF kecil, RVS, konflik arah, panel matriks kanan serta Peta Global/rincian terstruktur. Dokumentasi telah diselaraskan dengan penamaan dan navigasi terakhir. Permintaan pengguna mengizinkan commit dan push ke origin/main; deployment dan hasil uji akhir tidak diklaim. Untuk identitas commit gunakan git log -1, untuk sinkronisasi gunakan git status -sb.

### Koreksi peran level terhadap harga berjalan

DailyLevelStrength memisahkan contextSupport/contextResistance (kriteria Pivot Month + Low/High B Daily) dari role terhadap price eksplisit sumber aktif. Di bawah harga = SUPPORT, di atas = RESISTANCE, selisih maksimal setengah digit tampilan = AT; data lama/tidak aktif/harga hilang = UNVERIFIED. Label SUP KUAT/RES KUAT hanya jika konteks dan peran saat ini sesuai; konteks support kuat yang berada di atas harga ditulis CALON RES, bukan SUP KUAT. Nama Pivot/R/S dan angka asli tidak berubah. Panel RVS memakai harga acuan yang sama dan tabel peran/konteks agar perbedaannya jelas. Tidak mengubah syarat strongSignals atau order H4. Belum diuji/build sesuai permintaan pengguna; perubahan setelah commit e7a9db9 belum dipush.

### Estimasi jangkauan Daily dari range H4

`dailyRangeEstimate.mjs` memakai contoh pengguna: range N H4 = High N − Low N, proyeksi per sisi = range H4 × 6, batas atas/bawah = Open Daily ± proyeksi. Contoh 100 × 6 = 600; Before Daily 1000 menjadi pembanding 60%, bukan batas pemotong. Model memerlukan Daily/H4 aktif dalam hari broker yang sama dan harga segar. H4 N belum final; enam candle hanya asumsi range serupa, bukan penjumlahan gerak aktual atau sisa kapasitas hari. Total lebar dua batas = dua kali proyeksi per sisi. Tidak menyebutnya probabilitas/backtest atau mengganti TP transaksi.

DailyRangeEstimate tampil di Tugas Daily, panel Trading Plan matriks, dan Peta Global. Daftar harga H4/Daily yang berada dalam batas ditampilkan sebagai kandidat pantauan per sisi Open, bukan target otomatis. Data tidak lengkap/lama tidak memunculkan proyeksi valid. Belum diuji/build dan belum dipush sesuai batas instruksi pengguna.

### Audit konsistensi lintas menu

Baca [AUDIT_KONSISTENSI.md](AUDIT_KONSISTENSI.md) untuk temuan, koreksi dan batas verifikasi. analysisState.mjs menyediakan quoteIsStale dan scopedTick. useLiveMatrix menjadi sumber currentPrice serta JIKA/MOVE/OP–PV/Perahu projected bersama. h4ConfluencePlan menerima opsi stale; pemakai utama meneruskannya. Sesi Market tidak lagi membuat tiket Daily sendiri atau SL tetap ±10/lot modal; lima tabnya memakai model bersama (pola sesi, tiket H4, cerita, tugas Daily, HSH). Kunci H4/Alur memakai cerita baru, bukan kompas lama; Rumah HSH memakai Open N kolom aktif. Terminal ringkasan/rincian memakai cerita dan estimasi Daily sama. Tidak diuji/build/browser sesuai instruksi pengguna; belum dipush.

### Tambahan Exness EURUSDc dan GBPUSDc

Pilihan header dan backend mendukung EURUSD/GBPUSD, dengan broker symbol EURUSDc/GBPUSDc (fallback exact suffix m atau tanpa suffix jika akun menyediakannya). Bridge Python menyiarkan kedua pasangan terpisah dari XAU/BTC; simbol tidak tersedia tetap kosong dan tidak diganti instrumen lain. Kegagalan API forex tidak fallback ke Twelve emas. Toleransi forex memakai angka 0 sampai 0.001 dalam satuan harga; presisi mengikuti digits MT5. Restart backend dan supervisor bridge diperlukan untuk memuat daftar simbol baru. Tidak menjalankan aplikasi/tes/build sesuai instruksi pengguna.

Batas penting: rumus COP TAH bersama masih memakai koreksi harga tetap .08 untuk H4 dan .01 untuk timeframe lain; penskalaan koreksi khusus forex belum diberikan/dikonfirmasi. Jangan menyatakan level forex sudah tervalidasi hanya karena data simbol tersedia; anomali urutan tetap dipertahankan dan order tidak valid harus WAIT.

## Hasil pengujian terbaru — 18 Oktober 2026

Pengguna kemudian secara eksplisit meminta pengujian, sehingga batas tidak menjalankan tes/build sebelumnya tidak lagi berlaku untuk verifikasi ini.

- Seluruh suite: 204 tes lulus, 0 gagal (`node --test backend/*.test.js frontend/src/*.test.mjs`).
- Build frontend Vite berhasil.
- Sintaks backend server valid; bridge Python lolos parsing AST.
- Pemeriksaan whitespace diff bersih (peringatan normalisasi LF/CRLF bukan kegagalan).
- Koreksi selama pengujian: hapus deklarasi quoteDigits ganda pada penerimaan tick; fixture terminal kini menyertakan timestamp segar; fallback tanpa konteks H4 diuji WAIT; tes strongSignals memakai Vite SSR agar modul virtual mesin bersama dimuat dengan benar.
- Penambahan tes: proyeksi 100×6=600, data estimasi tidak valid/lama, freshness dan scope tick forex, render cerita/rincian dari data lengkap, pemetaan simbol Exness exact suffix. Fungsi pemetaan Exness dipisahkan ke backend/exness_symbols.js dan dipakai server serta tes yang sama.
- Pemeriksaan koneksi MT5 langsung tidak menghasilkan respons dan dihentikan. Ketersediaan EURUSDc/GBPUSDc di akun broker, stream aktual, dan angka rumus forex belum terverifikasi.
- Tidak menjalankan transaksi, push, atau menyatakan deployment berhasil. Pengujian browser/interaksi responsif belum dilakukan pada tahap ini.

### Tugas H4, H1, M30, M15 dan penanda progres

TASK_FRAMES sekarang mencakup H4, H1, M30, M15 serta seluruh tugas Market–Year; pemilih panel Matriks memakai daftar bersama. Tugas mikro tetap observasi dan tidak membuat entry/SL/TP mandiri. timeframeTask.progress memisahkan zona harga saat ini dari bukti sentuhan: IN_BOW, BEYOND_BOW, IN_TARGET, BEYOND_TARGET, AT_HSH atau UNVERIFIED. JIKA UP: Open sampai S1 adalah zona Busur; JIKA DOWN: Open sampai R1 adalah zona Busur. Close N menentukan lokasi aktual; data lama/hilang, periode tidak aktif dan anomali tidak diberi klaim zona valid.

TaskProgress menampilkan status JIKA, lokasi harga, acuan Busur serta Target. REACHED ditulis “Acuan terpenuhi · tersentuh”, bukan akhir Busur atau TP transaksi. Kedua acuan bisa berstatus tersentuh pada periode yang sama tanpa menyimpulkan urutan. Peta Global dan rinciannya memakai progress yang sama. Data periode baru tidak mewarisi sentuhan periode sebelumnya.

Verifikasi terbaru: 212 tes lulus, 0 gagal; build frontend berhasil. Pemeriksaan browser dan feed BTC live belum dilakukan, sehingga contoh BTC pengguna tidak diklaim sebagai kondisi yang sudah diperiksa. Belum dipush.


### Audit menu dan render ganda — keadaan terbaru

Enam menu utama tetap berasal dari navigation.mjs. Sumber pengulangan adalah isi tab/panel, bukan tambahan menu utama. Kepemilikan isi lengkap sekarang:

| Informasi | Tempat utama | Akses kontekstual |
|---|---|---|
| Alur TF besar–kecil lengkap | Analisis → Peta Global | Kunci H4/Sesi menyediakan tombol menuju Peta Global; Terminal menyediakan rincian compact |
| Kecocokan/penanda H4 | Analisis → Kunci H4 → Pertemuan level | Ringkasan global tidak membuka kartu lengkap di setiap halaman; Matriks tetap mempunyai panel rincian konteks |
| HSH semua timeframe | Kunci H4 → Rumah HSH | Header hanya HSH sesi aktif/pembanding; Sesi menyediakan tautan ke Kunci H4 |
| Pola sesi dan kebiasaan | Sesi Market & Daily → Pola sesi / Kebiasaan Market | Satu tab aktif dirender; panel kebiasaan tidak lagi mengulang tiket dan bukti tugas Daily |
| Tugas Daily | Sesi Market & Daily → Tugas Daily | Matriks → Tugas TF membuka komponen tugas yang sama untuk timeframe pilihan |
| Tiket Entry/TP/SL | Terminal & Entry | Trading Plan Matriks adalah akses konteks; di tugas hanya muncul jika rincian rencana H4 dibuka |

Sesi kini hanya tiga tab: Pola sesi, Kebiasaan Market, Tugas Daily; salinan tab Trading Plan/Global/HSH diganti tombol navigasi. Kunci H4 hanya Pertemuan level dan Rumah HSH; tab alur duplikat dihapus (nilai lama context kembali ke targets). TaskTradeAdvice menjadi tiket murni tanpa CoptahStory dan DirectionContext tertanam. TaskProgress serta rincian tugas tetap utuh. Data/rumus tidak dihapus atau diubah oleh konsolidasi ini.

Verifikasi setelah konsolidasi: 212 tes lulus, 0 gagal, build frontend berhasil. Regresi memeriksa enam menu unik, navigasi alias lama, tiket tanpa cerita Global tertanam, tab Sesi tanpa tiket/alur duplikat, dan kebiasaan tanpa bukti Daily duplikat. Belum diuji visual browser dan belum dipush.

### BTC: jadwal Weekly tujuh hari

Khusus BTCUSD/BTCUSDc/BTCUSDm dan BTC/USDC, btcWeeklySchedule.mjs membagi candle W1 broker tujuh hari menjadi 84 jam pertama (3,5 hari waktu Busur) dan 84 jam berikutnya (3,5 hari waktu Target). Titik tengah dihitung dari periodStart W1, bukan Rabu/Kamis pada jam WIB yang ditebak. Tampilan menggunakan WIB tetapi batas sumber tetap epoch broker. Simbol lain tidak mendapat aturan ini. Candle hilang/tidak aktif atau rentang W1 bukan tujuh hari menghasilkan jadwal belum terverifikasi.

Jadwal tampak pada Tugas Week, Plan Mingguan dan Peta Global; narasi cerita juga menyebut fase waktunya. taskHierarchy.weeklySchedule terpisah dari model.phase: harga dapat tetap di Busur meskipun waktu sudah masuk Target. Jadwal tidak otomatis menandai akhir Busur, sentuhan sasaran atau STRONG, dan tidak mengubah syarat entry. Pembagian sesi intrahari serta kalender Month tidak diubah oleh aturan ini.

Pengguna menyetujui pembagian BTC 3,5+3,5 hari. Tes baru mencakup simbol/suffix, batas tepat 84 jam broker, weekend, data hilang/expired, tidak mengubah forex, dan waktu Target dengan harga masih Busur. Total terbaru 216 tes lulus, 0 gagal; build frontend sukses. Belum diuji browser dan belum dipush.

### Audit ulang lintas menu + BTC

Laporan AUDIT_KONSISTENSI.md diperbarui. Regresi render seluruh halaman/tab mencakup XAU/BTC/EURUSD/GBPUSD dan feed kosong. Diperbaiki Chart yang dapat membaca previous.open saat OHLC belum tersedia; syarat koherensi sekarang memerlukan candle N/B nyata bertimestamp valid. Guide memakai model aktual bersama serta aturan terbaru, bukan kompas snapshot/jadwal forex generik. Jadwal BTC tersedia di ringkasan H4 dan Guide, di samping Global/Tugas Week/Plan Mingguan. Fase waktu tetap terpisah dari fase harga. Label data lama OHLC/Terminal disamakan. Total tes tetap 216 (cakupan tes render diperluas), semuanya lulus; build berhasil. Belum diuji browser atau feed live, belum dipush.

### Pengaturan Twelve Data di Vercel
Menu pendukung Sumber Data menampilkan panduan Settings → Environment Variables dengan TWELVEDATA_API_KEY, cakupan Production/Preview dan redeploy. Tombol pada layar koneksi gagal mengarah ke menu yang sama. Periksa Twelve Data memanggil /api/twelve hanya atas klik pengguna dan memakai kuota. Kunci tidak dikirim dari form browser, tidak disimpan di localStorage atau repo. Lokal memakai backend/.env; konfigurasi Vercel terpisah. Belum diverifikasi visual pada perubahan ini.

### Twelve Data: empat instrumen
Twelve Data mendukung XAUUSD, BTCUSD, EURUSD, GBPUSD dengan simbol penyedia XAU/USD, BTC/USD, EUR/USD, GBP/USD. Header mempertahankan pilihan saat pindah Exness/Twelve; data selalu dibatasi sumber dan instrumen. /api/twelve menerima symbol; cache/pending memakai symbol+timeframe dan memvalidasi simbol respons. Chart, histori dan analisis memakai simbol yang sama. Quarter/Semester/Year dihitung dari OHLC bulanan nyata dengan aggregateMonths bersama; periode awal tidak lengkap dibuang. Desimal forex 5, BTC 2, emas 3. Timeframe gagal/kuota ditampilkan dalam status data belum lengkap; tidak diisi dari instrumen lain. Seluruh syarat strong/entry tetap memakai model bersama dan menunggu jika komponen wajib belum ada. Verifikasi langsung H1 BTC/EUR/GBP masing-masing menerima 300 candle; 219 tes lulus dan build berhasil. Belum diperiksa browser atau dipush. Kunci lokal tidak otomatis masuk Vercel.

# Audit konsistensi menu COP TAH — 18 Oktober 2026

Audit ini berupa penelusuran kode dan perbaikan sumber logika. Tidak menjalankan tes, build, browser, transaksi, atau API eksternal sesuai permintaan pengguna. Hasil bukan sertifikasi bahwa aplikasi bebas bug saat dijalankan.

## Temuan dan koreksi

| Temuan | Dampak | Koreksi |
|---|---|---|
| Sesi Market membentuk tiket Daily sendiri, SL HSH ±10 dan lot dari modal | Berbeda dengan Terminal/Matriks dan dapat menampilkan angka risiko tanpa spesifikasi | Komponen Sesi memakai TaskTradeAdvice, TwoWayH4Plan, TimeframeTasks, CoptahStory dan HSH bersama. Pola sesi tetap MarketSessionCycle; tidak ada tiket Daily/lot contoh lokal. |
| Harga tick tidak selalu disaring scope; matriks projected memperbarui kolom tetapi currentPrice masih snapshot | Cerita, tabel dan notifikasi dapat memakai harga berbeda | useLiveMatrix menyaring broker/simbol, memproyeksikan currentPrice serta menghitung ulang JIKA/MOVE/OP–PV/Perahu dari kolom N/B yang sama. Pemakai mengambil matrix.currentPrice. |
| Pemeriksaan harga lama berbeda antar menu | Chart/Terminal dapat menunjukkan order saat menu lain WAIT | analysisState.quoteIsStale sebagai aturan bersama: status server STALE_QUOTE, timestamp hilang, usia >45 detik, atau timestamp >5 detik ke depan. h4ConfluencePlan menerima opsi stale agar guard berada pada model. |
| Pola Perahu OHLC berasal dari snapshot ketika High/Low sudah diperbarui tick | Pola tabel tidak sama dengan panel konflik | Hook matriks menggunakan calcHukumPerahu mesin backend bersama, tanpa membuat rumus Perahu kedua. |
| Konteks Kunci H4 dan HSH memakai kompas lama | Hierarki/nilai bisa tertinggal dari cerita baru | Kunci H4 memakai CoptahStory yang sama; Rumah HSH mengambil Open N dan harga dari projected matrix, memeriksa periode, serta membedakan sesi pembanding. |
| matrixPlan dapat kembali ke tiket timeframe individual tanpa konteks H4 | Menghidupkan entry mandiri yang sudah dilarang | Jika konteks H4 tidak tersedia, WAIT; macro memakai tiket H4 bersama, micro hanya pengamatan. |
| Tiket H4 di tab H4 menyaring strong hanya dengan target.timeframe === 4h | Sinyal TF kecil dapat hilang di ringkasan H4 meskipun ada di popup | Ringkasan H4 menerima semua strong arah tiket; tab macro tetap menyaring sasaran yang relevan. Syarat tujuh pemeriksaan strong tidak diubah. |
| Estimasi Daily/cerita tidak dapat diakses dari semua bagian Terminal | Pengguna kehilangan konteks ketika berpindah rincian | Ringkasan, analisis dan plan mingguan Terminal dapat membuka model cerita dan estimasi yang sama. |

## Peta menu setelah koreksi

- Beranda: perbandingan N/B dan harga tick dibatasi broker/simbol; tidak membuat tiket alternatif.
- Analisis/Peta Global: CoptahStory, projected matrix, toleransi aplikasi; arsip tahunan diberi konteks terpisah.
- Analisis/Kunci H4: pencocokan level bersama; alur besar–kecil memakai CoptahStory; HSH Open N aktif.
- Analisis/Sesi Market & Daily: pola sesi memakai data sesi broker, tugas memakai timeframeTask, tiket memakai H4; skenario dua arah jelas bersyarat.
- Terminal & Entry: matrixPlan → h4ConfluencePlan, shared freshness, cerita, konflik dan estimasi Daily.
- Chart & Fractal: useH4Plan → projected matrix → h4ConfluencePlan; fractal chart tetap observasi geometris, bukan algoritme entry tersendiri.
- Tabel OHLC: projected N/B, JIKA/MOVE/Perahu; sentuhan terpisah dari transaksi.
- Matriks R/S: tiket/penanda H4, strongSignals, dailyLevelStrength, quoteIsStale; rincian memakai hasil model yang sama.
- Notifikasi: strongSignals dan habitWarnings sama dengan UI, shared freshness; deduplikasi kejadian tetap dipertahankan.
- Historis adalah arsip, Panduan adalah materi baca, Sumber Data adalah konfigurasi; tidak diperlakukan sebagai pembuat sinyal live.

## Batas yang masih perlu diverifikasi pengguna

1. Pergantian XAU/BTC, Exness/Binance/Twelve serta timeframe dan toleransi saat tick datang.
2. Data lama, akhir periode, neutral, data tidak lengkap, R/S anomali dan target tersentuh sebelum entry.
3. Persamaan angka tiket H4 di Chart, Terminal, Matriks, Sesi, Global dan notifikasi.
4. Popup/fokus/keyboard dan responsive layout; tes/build akhir belum dijalankan atas instruksi pengguna.
5. Ketersediaan sumber/riwayat broker tidak dibuktikan lewat audit statis. Pola sesi backend adalah snapshot analisis, bukan pembuktian seluruh kronologi.
6. Estimasi Open Daily ± range H4×6 adalah heuristik pengguna; bukan TP transaksi, backtest, atau kepastian range maksimum.

Tidak ada push pada tahap audit ini. Referensi baseline: e7a9db9; koreksi peran Daily dan estimasi range setelahnya juga masih perubahan lokal.

## Pembaruan verifikasi — 18 Oktober 2026

Atas permintaan baru pengguna untuk menguji: suite backend/frontend 204 lulus, 0 gagal; build frontend sukses; sintaks backend dan Python valid. Temuan deklarasi quoteDigits ganda telah diperbaiki. Ditambahkan regresi estimasi Daily, scope forex, freshness, render alur dan pemetaan exact simbol Exness. Batas pada bagian sebelumnya yang menyebut tes belum dijalankan adalah riwayat sebelum verifikasi ini. Koneksi MT5 langsung tidak merespons dan dihentikan; live EURUSDc/GBPUSDc serta penskalaan koreksi rumus forex belum tervalidasi. Tidak ada pengujian browser/responsif atau push pada tahap ini.

## Audit menu/render ganda terbaru

Enam menu utama tetap unik. Konsolidasi tab Sesi menjadi Pola sesi/Kebiasaan/Tugas Daily, Kunci H4 menjadi Pertemuan/Rumah HSH, salinan Global/Entry/HSH diganti tombol tujuan. Kebiasaan tidak otomatis merender tugas Daily kedua. Tiket H4 tidak lagi menyertakan cerita Global sendiri; pada halaman tugas tiket berada dalam rincian tertutup. Penanda global berupa ringkasan dan tombol menuju Kunci H4, bukan kartu lengkap berulang. Akses Matriks tetap kontekstual dari model yang sama. 212 tes lulus dan build sukses; browser belum diperiksa, belum dipush.

## Audit ulang seluruh menu dan jadwal BTC

Pemeriksaan terbaru menemukan Chart menganggap OHLC kosong sebagai pasangan koheren karena undefined===undefined, lalu membaca previous.open. Sekarang membutuhkan dua candle bertimestamp valid; regresi render memakai data tidak lengkap pada seluruh menu. Label data lama OHLC/Terminal disamakan melalui quoteIsStale; konteks Chart memakai rows matriks projected.

Panduan diperbaiki agar tidak lagi menjelaskan tiket/SL/TP mandiri TF kecil atau TP1 tetap Pivot di semua menu. Data aktual Panduan kini memakai matriks projected, timeframeTask dan taskHierarchy; hubungan Year/Semester ke Quarter ditulis eksplisit. Jadwal BTC 84+84 jam ditampilkan juga di ringkasan H4/Weekly dan Panduan, terpisah dari fase harga. Batas waktu tidak mengubah tujuh syarat strong atau fase JIKA/MOVE.

Verifikasi: 216 tes lulus, 0 gagal; build sukses; sintaks backend valid. appRender kini memeriksa seluruh menu serta tab Analisis/Terminal dengan fixture XAU, BTC, EURUSD, GBPUSD, selain feed kosong. storyAudit membandingkan jadwal BTC di Tugas Week, ringkasan H4, Panduan, Global, Plan Mingguan dan memastikan forex tidak mendapat jadwal BTC. Ini verifikasi struktur/logika dengan fixture, bukan validasi harga live atau layout browser. Belum dipush.

# Perbaikan pantauan support dan pengujian 10 tahun

Sumber terverifikasi dari terminal: Exness-MT5Real36, Exness Technologies Ltd, XAUUSDc, presisi 3 desimal. Jendela utama 20 Oktober 2016–20 Oktober 2026. Data hanya harga, tanpa data akun atau transaksi.

## Perbaikan aplikasi

- Memisahkan area acuan, mendekati dari atas, diuji, pantulan awal, dan ditembus. Filter kuat Daily tetap terpisah.
- Memantau Pivot, S1–S4 dan Low B lintas timeframe, ditambah swing low H1 yang baru diketahui setelah dua candle sesudahnya selesai. Swing yang kemudian ditutup di bawah batas dibuang.
- Menggabungkan level berdekatan tanpa menjadikan jumlah level sebagai probabilitas. Identitas area mengikuti timeframe induk agar pergantian M1 tidak menghapus pelacakan H4/Daily.
- Harga datang dari bawah atau pengamatan pertama di area tidak disebut sentuhan support dari atas. Respons kenaikan awal tetap dilacak, dengan arah kedatangan dinyatakan belum diketahui.
- Harga yang melewati bawah area sebesar jarak perhatian membatalkan pengujian dan ditandai DITEMBUS. Kembali ke atas harus diikuti uji baru dari atas sebelum disebut pantulan support.
- Dua kenaikan cepat tidak cukup. Default konfirmasi: pulih di atas batas atas area + jarak perhatian, bertahan sekurangnya 60 detik, dua kenaikan yang dihitung terpisah minimal satu detik, perpindahan sekurangnya 2 kali jarak perhatian, dalam jendela 3 menit setelah pengamatan awal area. Ini parameter observasi, bukan estimasi probabilitas.
- Jeda harga >10 detik membatalkan urutan pantulan. Pengulangan render jam tidak dianggap tick baru. Tick lama tidak dipasangkan dengan timestamp snapshot yang lebih baru.
- Mengubah label posisi R/S menjadi Di bawah harga / Di atas harga agar tidak menyebut R1 sebagai calon support hanya karena harga melewatinya.
- Status area ditampilkan pada kolom timeframe dan panel pantauan support. Notifikasi mengikuti pengaturan Daily, tetapi status tetap dipantau jika notifikasi dimatikan.

## Cakupan data asli terminal

| Timeframe | Candle | Awal (UTC) | Akhir (UTC) | OHLC invalid / waktu tidak berurutan |
|---|---:|---|---|---:|
| H1 | 57127 | 2016-10-20T00:00:00.000Z | 2026-10-20T15:00:00.000Z | 0 |
| H4 | 15661 | 2016-10-02T00:00:00.000Z | 2026-10-20T12:00:00.000Z | 0 |
| D1 | 3066 | 2016-10-20T00:00:00.000Z | 2026-10-20T00:00:00.000Z | 0 |
| W1 | 525 | 2016-10-02T00:00:00.000Z | 2026-10-18T00:00:00.000Z | 0 |
| MN1 | 134 | 2015-09-01T00:00:00.000Z | 2026-10-01T00:00:00.000Z | 0 |
| M1 | 57388 | 2026-08-23T22:01:00.000Z | 2026-10-20T15:33:00.000Z | 0 |

History M1 tersedia sekitar dua bulan, bukan 10 tahun. Data bulanan sejak 2015 diperlukan sebagai pembanding sebelum awal jendela utama. H4/W1 juga memiliki pembanding sedikit sebelum 20 Oktober 2016. Candle yang masih berjalan tidak dipakai sebagai hasil akhir pengujian.

## Pemeriksaan area selama 10 tahun

Level dihitung memakai rumus asli aplikasi, OHLC periode SEBELUMNYA, dan Open periode berjalan. Swing hanya dipakai setelah waktu konfirmasi. Kandidat ditetapkan pada Open H1. Tidak mengasumsikan urutan High dan Low dalam satu candle.

| Periode | Jam H1 dievaluasi | Sampel kenaikan H1 | Dekat area filter Daily lama | Dekat area pantauan baru |
|---|---:|---:|---:|---:|
| development2016_2023 | 40531 | 4245 | 262 | 3775 |
| validation2024 | 5929 | 655 | 34 | 509 |
| comparison2025_2026 | 10636 | 1097 | 34 | 573 |

Pada periode pembanding 2025–2026, 573/1097 (52,23%) sampel kenaikan mempunyai low di dekat area pantauan baru, dibanding 34/1097 (3,10%) filter kuat Daily. Semua area filter Daily lama yang tercakup tetap tercakup oleh daftar area baru pada sampel ini.

Sampel kenaikan ditentukan setelah jam berakhir: Close–Open >= 0,5 kali rata-rata range 14 H1 sebelumnya dan Close–Low >= rata-rata range tersebut. Ukuran ini hanya cakupan area terhadap low historis. BUKAN tingkat peringatan sebelum harga naik, BUKAN win rate, dan BUKAN bukti daya prediksi. Menambah level akan meningkatkan cakupan sekaligus jumlah kejadian yang harus disaring.

## Replay kronologis M1

Hanya harga OPEN M1 berurutan yang dimasukkan sebagai observasi. Tidak menciptakan jalur Open→Low→High→Close buatan. Jeda maksimal 90 detik untuk replay sampel satu menit; live tetap 10 detik. Karena itu pengujian ini tidak menggantikan pengujian tick live.

| Ukuran | Konfirmasi cepat pembanding | Konfirmasi bertahan 60 detik |
|---|---:|---:|
| Pantulan awal yang teramati | 417 | 242 |
| Punya pengamatan penuh 30 menit | 414 | 242 |
| Harga masih di atas area setelah 30 menit | 237 (57,25%) | 156 (64,46%) |
| Sempat menembus batas bawah selama 30 menit | 286 | 148 |

Agustus–September: rasio masih di atas area berubah dari 61,51% menjadi 68,57%. Oktober: 48,53% menjadi 53,73%.

Konfirmasi yang lebih ketat menghasilkan lebih sedikit label pantulan, dengan proporsi harga di atas area setelah 30 menit yang lebih tinggi dalam replay ini. Namun banyak area tetap sempat ditembus kembali. Data yang sama sudah diperiksa saat merancang perbaikan; pemisahan kronologis ini bersifat eksploratif, bukan holdout independen yang belum pernah dilihat. Belum ada klaim peningkatan keuntungan atau signifikansi statistik.

## Validasi implementasi

27 pemeriksaan otomatis terkait arah sentuhan, pengamatan pertama, pantulan bertahan, pembatalan area, jeda harga, waktu sumber, swing tanpa melihat masa depan, identitas area, presisi harga, render aplikasi dan pembaruan matriks lolos. Pemeriksaan sintaks backend dan build frontend lolos. Belum ada uji forward transaksi; aplikasi tidak membuka order.

Batas data: tidak memiliki tick 10 tahun. Harga Bid belum mencakup spread transaksi atau eksekusi. Sampel level/jam saling berkaitan. Aturan Forex/BTC belum dikalibrasi dengan pengujian emas ini. Jarak perhatian emas tetap 1 satuan harga; Forex/BTC memakai default masing-masing. Filter kuat Daily tidak diubah menjadi prediktor pantulan.

## Reproduksi dan integritas sumber

Jalankan node docs/test_support_ten_years.mjs. Hasil lengkap berada di docs/support-ten-year-results.json. Data hanya dibaca dari file ekspor; tidak ada unduhan atau transaksi saat pengujian.

- docs/exness-support-audit-h1.json: SHA-256 378c468fe67155c8e59012159d29c4fe17b85046b372bd1e4ee7f05d0e9bc923
- docs/exness-support-audit-h4.json: SHA-256 713d67187634ff3aafa34c8b73b952f5039928b14e680e90445ed92e10f48c2c
- docs/exness-support-audit-d1.json: SHA-256 7dbd827685e838b8d8d9556997752b4f7bce530b1a7c8ff117155a465488b8d5
- docs/exness-support-audit-w1.json: SHA-256 0999065fdd612147f38cbeccd75a45e59922e5c4fdebf87678f2a8a7bc8e7585
- docs/exness-support-audit-mn1.json: SHA-256 cd4f613ee0b1bbf5ac6d7fb6c746a6566a2f10df50ef2730364b8bac0b48246c
- docs/exness-support-audit-m1.json: SHA-256 d477bcffa4cf8016fbffcf25e1d5e5391f105963ecff7df7e05144f8aa9dd2de
# Uji historis Puzzle COP TAH 1.3.0

Sumber native MT5 Exness; pengambilan baca-saja. Pembagian kronologis 70% pengembangan dan 30% uji akhir, tanpa penyetelan parameter pada bagian uji.

## Cakupan data

| Instrumen | TF | Candle | Awal UTC | Akhir UTC |
| --- | --- | ---: | --- | --- |
| XAUUSD | 1h | 57232 | 2016-10-28 | 2026-10-27 |
| XAUUSD | 4h | 15669 | 2016-10-28 | 2026-10-27 |
| XAUUSD | 1d | 3065 | 2016-10-28 | 2026-10-27 |
| XAUUSD | 1w | 522 | 2016-10-30 | 2026-10-25 |
| XAUUSD | 1M | 120 | 2016-11-01 | 2026-10-01 |
| XAUUSD | 30m | 90000 | 2019-03-19 | 2026-10-27 |
| XAUUSD | 15m | 90000 | 2023-01-05 | 2026-10-27 |
| EURUSD | 1h | 60202 | 2016-10-28 | 2026-10-27 |
| EURUSD | 4h | 15750 | 2016-10-28 | 2026-10-27 |
| EURUSD | 1d | 3077 | 2016-10-28 | 2026-10-27 |
| EURUSD | 1w | 522 | 2016-10-30 | 2026-10-25 |
| EURUSD | 1M | 120 | 2016-11-01 | 2026-10-01 |
| EURUSD | 30m | 90000 | 2019-08-06 | 2026-10-27 |
| EURUSD | 15m | 90000 | 2023-03-15 | 2026-10-27 |
| GBPUSD | 1h | 60202 | 2016-10-28 | 2026-10-27 |
| GBPUSD | 4h | 15750 | 2016-10-28 | 2026-10-27 |
| GBPUSD | 1d | 3077 | 2016-10-28 | 2026-10-27 |
| GBPUSD | 1w | 522 | 2016-10-30 | 2026-10-25 |
| GBPUSD | 1M | 120 | 2016-11-01 | 2026-10-01 |
| GBPUSD | 30m | 90000 | 2019-08-06 | 2026-10-27 |
| GBPUSD | 15m | 90000 | 2023-03-15 | 2026-10-27 |

H1/H4/D1 mencakup hampir sepuluh tahun; bukan 10 tahun penuh semua TF. M30 lebih pendek, M15 baru sekitar 2023, dan M1/M5 tidak digunakan dalam replay. MN1 juga lebih pendek daripada awal permintaan. Kekosongan data tidak diisi candle buatan.

## Hasil bagian uji akhir 30%

| Instrumen | Sampel | Rencana baru | Sampel konflik | Pembatalan keputusan | TP1 jelas | SL jelas | Ambigu | Gap | Batal sebelum isi | Tidak terisi | Terbuka saat batas | Gross R hasil jelas |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| XAUUSD | 4424 | 535 | 1612 | 454 | 2 | 3 | 77 | 41 | 35 | 363 | 14 | -1.0449 |
| EURUSD | 4652 | 26 | 2126 | 32 | 0 | 1 | 1 | 0 | 18 | 5 | 1 | -1.0000 |
| GBPUSD | 4652 | 36 | 2102 | 49 | 1 | 2 | 3 | 0 | 26 | 4 | 0 | -1.7412 |

Gross R menjumlah hanya kejadian yang hasilnya jelas, belum memasukkan spread, komisi, swap atau slippage. Kejadian ambigu, gap dan posisi terbuka tidak diklaim profit atau dimasukkan sebagai transaksi selesai. Angka tersebut bukan return portofolio atau win rate keseluruhan. Jumlah hasil jelas kecil; hasil ini **belum membuktikan profitabilitas atau peningkatan presisi**.

## Metode, kegagalan dan batas

- Sampel setiap empat H1 tersedia, bukan setiap tick.
- Candle berjalan direkonstruksi dari H1 yang sudah selesai; pola konfirmasi juga membutuhkan candle penerus native. Tidak memakai High/Low/Close masa depan.
- Selasa baru dibekukan setelah penutupan; Rabu baru memberi konteks arah setelah selesai. Sesi JIKA/ANL perlu OHLC dan pembanding lengkap.
- Satu rencana simulasi aktif per instrumen. Pending limit dapat dibatalkan pada evaluasi berikutnya; posisi sudah terisi tidak otomatis ditutup saat sinyal berubah.
- Entry bersamaan SL/TP dalam H1 atau SL dan TP dalam H1 yang sama: ambigu. Celah H1: tidak terverifikasi.
- Simulasi berakhir/dibatasi pada akhir periode TF asal atau batas partisi; hasil tidak menyeberang partisi pengembangan/uji. Hanya TP1 yang disimulasikan, bukan TP2/TP3.
- Jumlah konflik/kandidat adalah jumlah sampel keputusan, bukan transaksi nyata. Cakupan mikro berbeda per instrumen sehingga label kuat tidak diuji penuh 10 tahun.
- Parameter tidak diubah untuk membuat bagian uji akhir terlihat lebih baik.

## Reproduksi

1. `python docs/export_reference_history.py` mengambil OHLC baca-saja ke cache lokal, tanpa kredensial atau posisi dalam repositori.
2. `node docs/backtest_reference.mjs` menghasilkan JSON.
3. `python docs/write_reference_report.py` menghasilkan laporan MD dan memeriksa hash aturan.

Hash aturan: `2e8a9354cc9bab07dd9b271df33546ab07cfb03dcd22b76317ca197d56d08573`.

[Logika lengkap](LOGIKA_PUZZLE_COPTAH.md) · [JSON hasil](reference-backtest-results.json).

# Rilis 1.2.8 — Daily Before forex

Daily Before pada XAUUSD, EURUSD dan GBPUSD Exness melewati candle bertanggal Sabtu/Minggu dan memilih candle hari kerja terakhir yang benar-benar tersedia. Pada Senin 26 Oktober 2026, pembandingnya Jumat 23 Oktober, bukan candle tambahan Minggu 25 Oktober. Tanggal mengikuti timestamp candle sumber dalam UTC, bukan tanggal kalender komputer.

Aturan diterapkan di jalur pengambilan candle Exness bersama, sehingga analisis utama, HTF, matriks semua timeframe, JIKA, range, level R/S dan rekomendasi menggunakan pasangan N/B yang sama. Candle N tetap candle asli terakhir MT5; OHLC Jumat tidak digabung dengan candle Minggu. Snapshot mentah MT5 dipertahankan. Jika Jumat tidak tersedia, sistem memakai hari kerja sebelumnya yang tersedia; jika tidak ada pembanding yang memenuhi syarat, analisis ditahan. BTC tetap memakai candle harian sebelumnya termasuk akhir pekan. Pemilihan H4 tidak berubah.

Rincian Daily menampilkan tanggal N dan Before serta penjelasan kebijakan pembanding.

Audit baca-saja pada Exness-MT5Real36, XAUUSDc, 26 Oktober 2026:

| Daily Before Jumat 23 Oktober | Nilai |
| --- | ---: |
| Open | 4023.654 |
| High | 4034.421 |
| Low | 3975.365 |
| Close | 3996.057 |

Bukti pemilihan candle asli dan hasil matriks ada di `daily-before-exness-audit.json`. Tidak ada order atau perubahan akun selama audit. Installer dibangun dan diverifikasi tanpa menjalankan pemasangan.

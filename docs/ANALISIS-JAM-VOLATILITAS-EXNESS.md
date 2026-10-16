# Analisis historis volatilitas Exness dan pembacaan COP TAH

Dihitung 16 Oktober 2026 dari 12.000 candle H1 selesai XAUUSDc terminal MT5 Exness. Rentang: 4 Oktober 2024 22.00 WIB–16 Oktober 2026 19.00 WIB (jam pembukaan candle terakhir). Bukan data Binance atau arsip bulanan campuran. Tidak ada OHLC tidak valid, timestamp duplikat, atau urutan waktu terbalik dalam sampel yang diambil.

## Metode

Volatilitas diukur dari High − Low setiap candle H1, lalu dikelompokkan berdasarkan jam pembukaan WIB (UTC+7). Peringkat memakai median (High − Low) / Open × 100%, agar perubahan level harga dan satu lonjakan ekstrem tidak terlalu mendominasi. Median dolar dihitung terpisah; ini perubahan harga emas, bukan laba akun. Candle berjalan dikecualikan. Tidak mengisi candle hilang. Sampel per jam tidak selalu sama karena jeda perdagangan dan batas periode. Statistik ini bukan volatilitas return tahunan.

## Seluruh jam, diurutkan menurut median rentang persentase

| Jam WIB | Sampel | Median rentang harga | Median rentang % |
|---|---:|---:|---:|
| 20.00–21.00 | 523 | $19.075 | 0.5224% |
| 21.00–22.00 | 523 | $18.805 | 0.4910% |
| 08.00–09.00 | 523 | $16.843 | 0.4381% |
| 22.00–23.00 | 524 | $15.717 | 0.4254% |
| 19.00–20.00 | 524 | $14.582 | 0.3798% |
| 23.00–00.00 | 524 | $11.887 | 0.3247% |
| 07.00–08.00 | 523 | $12.437 | 0.3239% |
| 09.00–10.00 | 524 | $12.719 | 0.3233% |
| 13.00–14.00 | 524 | $11.691 | 0.3137% |
| 15.00–16.00 | 524 | $11.184 | 0.3118% |
| 12.00–13.00 | 524 | $12.177 | 0.3087% |
| 14.00–15.00 | 524 | $11.650 | 0.3086% |
| 18.00–19.00 | 524 | $10.738 | 0.2851% |
| 16.00–17.00 | 524 | $10.183 | 0.2773% |
| 00.00–01.00 | 521 | $10.166 | 0.2709% |
| 17.00–18.00 | 524 | $9.812 | 0.2680% |
| 10.00–11.00 | 524 | $10.407 | 0.2630% |
| 01.00–02.00 | 520 | $9.330 | 0.2490% |
| 02.00–03.00 | 512 | $9.452 | 0.2424% |
| 06.00–07.00 | 523 | $8.855 | 0.2305% |
| 05.00–06.00 | 348 | $9.296 | 0.2283% |
| 11.00–12.00 | 524 | $8.302 | 0.2138% |
| 03.00–04.00 | 506 | $7.247 | 0.1990% |
| 04.00–05.00 | 166 | $5.662 | 0.1584% |

## Pemeriksaan kestabilan: 90 hari terakhir

| Jam WIB | Sampel | Median rentang harga | Median rentang % |
|---|---:|---:|---:|
| 20.00–21.00 | 64 | $25.880 | 0.6111% |
| 08.00–09.00 | 65 | $23.501 | 0.5541% |
| 21.00–22.00 | 64 | $22.516 | 0.5216% |
| 19.00–20.00 | 65 | $22.875 | 0.5135% |
| 22.00–23.00 | 64 | $18.323 | 0.4294% |

## Pemeriksaan kestabilan: 30 hari terakhir

| Jam WIB | Sampel | Median rentang harga | Median rentang % |
|---|---:|---:|---:|
| 20.00–21.00 | 22 | $23.299 | 0.5463% |
| 19.00–20.00 | 23 | $22.875 | 0.5363% |
| 08.00–09.00 | 22 | $20.711 | 0.4858% |
| 21.00–22.00 | 22 | $19.872 | 0.4786% |
| 12.00–13.00 | 22 | $17.313 | 0.4074% |

## Implikasi untuk waktu observasi entry

- Prioritas observasi awal USA: 19.00–22.00 WIB. Jam 20.00–21.00 peringkat pertama pada sampel penuh, 90 hari, dan 30 hari. Jam 19.00–20.00 menguat pada periode terbaru. Ini jendela observasi, bukan bukti waktu entry dengan profit tertinggi.
- Alternatif observasi Asia: 08.00–09.00 WIB, peringkat ketiga sampel penuh, kedua 90 hari, ketiga 30 hari. Jangan menganggap Asia selalu sepi.
- Eropa 14.00–20.00 tetap dapat membentuk setup; tidak menjadi sesi paling volatil hanya karena nama sesinya. Pada panduan metode, 19.00–20.00 masih Eropa.
- Jam 03.00–04.00 relatif rendah pada sampel. Jam 04.00–05.00 hanya 166 candle dan tidak ada pada sampel 90 hari: bukan bukti bahwa jam tanpa perdagangan aman untuk entry.

## Cara menggabungkan dengan COP TAH

1. Mulai 10Y → 1Y → 6M → 3M → MN1 → W1 → D1; bedakan riwayat broker dengan Open B arsip/parsial. Jangan memakai arah global yang diisi dari sumber lain seolah terverifikasi.
2. H4 sebagai kunci: JIKA dari Open N vs Open B, gerak dari Close vs Open N. Berlawanan JIKA = arah Busur; searah = arah Target, belum bukti TP tercapai.
3. Jika H4 DOWN, tunggu Busur naik ke resistance untuk skenario SELL. Jika H4 UP, tunggu Busur turun ke support untuk skenario BUY. Volatilitas tinggi tidak menentukan BUY atau SELL.
4. Jika entry utama H4 belum disentuh, tinjau resistance/support M30 → M15 → M5. Alternatif memakai entry, SL dan TP sendiri dan menunggu konfirmasi; bukan mengejar harga yang sudah bergerak.
5. Periksa Market N vs B sesi sejenis, keselarasan H4, Perahu, HSH = Open N dan spread. Rotasi HSH pembanding Asia→Eropa sebelumnya, Eropa→USA sebelumnya, USA→Asia terakhir berbeda dari definisi B.
6. Entry harus teramati terlebih dahulu sebelum TP; TP sebelum entry tidak dihitung. Satu candle yang menyentuh entry dan TP/SL tidak membuktikan urutan.
7. Pilih entry berdasarkan setup yang memenuhi syarat di jendela observasi. Jika tidak ada setup, WAIT walaupun sedang jam paling aktif.

## Hasil pembacaan panduan

Panduan aplikasi frontend/src/components/AnalysisGuide.jsx mengikuti hierarki aktual dan menyatakan konfirmasi akhir Busur belum otomatis tersedia. Dokumen lama docs/alur_cerita_global_coptah_2021_2030.md berbeda: menyatakan Semester 1 wajib Busur dan Semester 2 Target serta memuat contoh angka historis tanpa verifikasi sumber pada dokumen tersebut. Dokumen lama tidak dipakai sebagai bukti statistik maupun aturan pasti. Definisi teknis pemilik metode untuk konfirmasi akhir Busur masih diperlukan sebelum backtest strategi lengkap dapat dinilai final.

## Batas kesimpulan

Belum ada backtest lengkap COP TAH dengan aturan konfirmasi final, tick Bid/Ask, spread historis yang memadai, slippage, komisi dan pengujian di luar sampel. Jadi belum bisa menyebut satu jam sebagai waktu entry terbaik atau memberikan win rate. Data H1 hanya membuktikan rentang intrajam, bukan urutan semua sentuhan harga. Sampel H1 ini sekitar dua tahun; data MN1 sepuluh tahun tidak dapat mengungkap jam intraday. Penyebab lonjakan (berita tertentu, DST, likuiditas) tidak diidentifikasi dari OHLC saja. Hasil khusus XAUUSDc Exness dan tidak dipindahkan ke PAXG/USDT.

Pengambilan timestamp dan batas ketersediaan riwayat mengacu [dokumentasi MetaTrader 5](https://www.mql5.com/en/docs/python_metatrader5/mt5copyratesfrompos_py). Data mentah: exness-h1-volatility-source.json. Hasil per jam: exness-hourly-volatility.json.

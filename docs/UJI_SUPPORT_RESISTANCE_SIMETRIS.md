# Uji support sebagai kebalikan resistance — 20 Oktober 2026

## Kesimpulan

Aturan support kuat Daily saat ini SUDAH simetris dengan aturan resistance kuat Daily. Membalik aturan resistance secara benar tidak menghasilkan aturan support baru dan tidak menyelesaikan support kosong saat harga berada di bawah Pivot Month. Masalah label posisi dan pelacakan sentuhan yang ditemukan pada audit sebelumnya tetap terpisah.

| Pemeriksaan | Resistance | Support simetris / saat ini |
| --- | --- | --- |
| Keluarga level | R1–R4 atau Pivot | S1–S4 atau Pivot |
| Terhadap harga | Level > harga | Level < harga |
| Pivot Month | Level < Pivot Month | Level > Pivot Month |
| Batas sebelumnya | Level < High B Daily | Level > Low B Daily |
| Data | Aktif, lengkap, harga segar | Sama |

Semua perbandingan menggunakan toleransi setengah unit presisi 3 desimal sesuai kode. Hasil: 85.060 pemeriksaan pada 377 hari, tanpa perbedaan antara aturan aplikasi dan rumusan simetris independen.

## Pengujian historis

Data: MT5 Exness XAUUSDc, 12.000 candle H1, 4 Oktober 2024 22:00 WIB–16 Oktober 2026 19:00 WIB. Daily dan Month direkonstruksi menurut kalender UTC dari arsip H1, bukan candle D1/MN1 asli terminal broker. Hari dengan kurang dari 20 candle H1, hari sesudah pembanding dengan kurang dari 20 candle, bulan pertama parsial, bulan berikutnya yang memakai bulan pertama sebagai pembanding, dan hari terakhir parsial tidak disertakan. Sisa hari tidak dijamin lengkap, sehingga hasil ini merupakan pemeriksaan eksploratif.

Level Daily dihitung memakai rumus calcRSMatrix yang sama dengan aplikasi, dari OHLC hari sebelumnya dan Open hari berjalan. Pivot Month memakai OHLC bulan sebelumnya dan Open bulan berjalan. High/Low akhir periode berjalan tidak digunakan untuk membuat level. Nilai dibulatkan ke 3 desimal sesuai tampilan.

Pada setiap Open H1, level disaring memakai harga Open yang sudah diketahui. Sentuhan berarti range H1 mencakup level. Hasil 'menutup di sisi yang diharapkan' berarti Close H1 di atas level untuk support dan di bawah level untuk resistance; ini tidak menyatakan urutan tick atau bahwa level tidak pernah ditembus.

| Filter aplikasi / support simetris | Support | Resistance |
| --- | ---: | ---: |
| Level-jam memenuhi filter | 6.600 | 2.389 |
| Level-jam tersentuh | 731 | 325 |
| Menutup di sisi yang diharapkan | 405 | 158 |
| Menutup di sisi berlawanan | 326 | 167 |
| Proporsi menutup di sisi yang diharapkan | 55,40% | 48,62% |
| Jam unik dengan sentuhan | 719 | 320 |

Satu jam dapat menyentuh lebih dari satu level; pengamatan saling berkaitan. Proporsi bukan win rate, tidak mengukur profit, SL/TP, spread/biaya, ketahanan level sepanjang jam, atau probabilitas masa depan. Kinerja resistance juga belum terbukti sebagai patokan kuat hanya karena labelnya tampil.

## Eksplorasi tanpa filter Pivot Month

Dengan syarat keluarga level, sisi harga dan batas Before tetap dipertahankan, tetapi filter Pivot Month dihapus:

| Hasil | Support | Resistance |
| --- | ---: | ---: |
| Sentuhan level-jam | 1.014 | 899 |
| Menutup di sisi yang diharapkan | 538 | 447 |
| Proporsi | 53,06% | 49,72% |

Support lebih sering tersedia, tetapi proporsi hasil support justru turun dari 55,40% ke 53,06%. Sampel yang dipilih berbeda dan belum ada uji luar sampel; hasil ini tidak membuktikan filter Month meningkatkan kinerja atau layak dihapus. Varian ini hanya eksperimen dan tidak diterapkan ke aplikasi.

## Hubungan dengan harga 4111

Pada 15 Oktober 2026 UTC (mulai 07:00 WIB), arsip menunjukkan Open 4111.879, Low 4110.944, High 4177.440, Close 4156.128. Pivot Month hasil rumus aplikasi adalah 4277.218. Karena seluruh harga hari tersebut di bawah Pivot Month, tidak mungkin ada level di bawah harga yang sekaligus di atas Pivot Month. Support kuat Daily akan kosong sepanjang hari meski terjadi kenaikan besar.

Ini contoh historis yang relevan, BUKAN pembuktian bahwa itulah kejadian yang dimaksud pengguna. Low 4110.944 diketahui setelah terjadi; tidak boleh dipakai sebagai level support yang seolah sudah diketahui di awal. Diperlukan data lebih kecil atau tick untuk membuktikan urutan sentuh → pantul dan waktu peringatan.

## Keputusan

Tidak mengubah aturan support karena versi simetrisnya sudah sama dengan aplikasi. Lebih tepat memisahkan area support yang dipantau dari filter konteks Daily dan memperbaiki label/urutan notifikasi yang bermasalah. Validasi berikutnya memerlukan D1/MN1 asli broker serta tick/M1 untuk pengujian kronologis, termasuk data di luar sampel.

Reproduksi: node docs/test_support_resistance_mirror.mjs.
Hasil terstruktur: docs/support-resistance-mirror-results.json.

# Audit calon support — 20 Oktober 2026

## Hasil

Istilah calon support saat ini terlalu luas dan belum didukung pemeriksaan reaksi historis. Aturan support kuat Daily merupakan filter metode, bukan hasil pengujian kekuatan. Audit ini tidak mengubah rumus atau ambang strategi.

## Data dan metode

Sumber: docs/exness-h1-volatility-source.json, MT5 Exness XAUUSDc. Terdapat 12.000 candle H1, seluruhnya lolos pemeriksaan urutan waktu dan konsistensi OHLC, dari 4 Oktober 2024 22:00 WIB sampai 16 Oktober 2026 19:00 WIB. Kelulusan struktur tidak mengautentikasi sumber secara independen. Arsip bulanan lama backend/data/historical_xauusd.json tidak dipakai karena sudah dikarantina aplikasi.

Pengujian memakai Low B dari candle H1 yang sudah selesai sebelum candle pengamatan. Hanya pasangan berjarak satu jam dan Open N >= Low B yang disertakan. Ini mencegah penggunaan Low N masa depan sebagai kandidat support. Hasil diukur pada penutupan jam yang sama, bukan urutan tick atau hasil transaksi.

Dari 11.451 pasangan yang memenuhi, 5.258 candle mencapai/menembus Low B. Sebanyak 2.750 menutup kembali di atasnya dan 2.508 menutup di bawahnya. Sentuhan Low B saja tidak membedakan support yang menahan dari level yang ditembus. Angka ini bukan win rate, tidak mencakup S1–S4 atau seluruh aturan Daily, serta tidak membuktikan urutan High/Low intrabar.

Contoh: 8 Oktober 2026 22:00 WIB, Low B yang sudah diketahui adalah 4121.853. Candle membuka 4124.421, mencapai Low 4110.617, lalu menutup 4111.803, tetap di bawah Low B. Titik low sekitar 4111 yang terlihat setelah candle selesai tidak otomatis merupakan support yang sudah diketahui sebelumnya.

## Temuan kode

1. **Label posisi disamakan dengan calon support.** dailyLevelStrength menetapkan role SUPPORT untuk setiap level di bawah harga, termasuk R1. Reproduksi R1=105, harga=106 menghasilkan role SUPPORT tetapi status WRONG_SIDE. RvsLimitInfo menerjemahkannya menjadi Calon support. Ini kontradiksi label dengan hasil penilaian; seharusnya kolom posisi berbunyi Di bawah harga, sementara status kekuatan dinilai terpisah.
2. **Sentuhan tanpa bukti arah datang.** nextSupportAlerts menerima tick tepat di level sebagai TOUCH tanpa memerlukan pendekatan dari atas. Karena itu, harga yang datang dari bawah atau baru pertama kali diamati juga dapat disebut menyentuh support. Klaim yang lebih tepat adalah Harga di area sampai arah pendekatan diketahui.
3. **Pantulan setelah tick pertama bisa terlewat.** Tick pertama tepat di level menerbitkan TOUCH tetapi tidak memasang touchTime karena continuous=false. Dua kenaikan berikutnya tidak menghasilkan BOUNCE. Ada ketidaksesuaian antara notifikasi sentuhan dan pelacakan lanjutannya.
4. **Ambang belum diuji historis.** Jarak 1 untuk emas, 25 untuk BTC, dua kenaikan, jendela 60 detik, dan reset saat jeda >10 detik adalah parameter implementasi. Data H1 tidak cukup untuk memvalidasi parameter tick tersebut.
5. **Level support Daily bisa kosong secara struktural.** Syarat level > Pivot Month, > Low B Daily, dan < harga tidak mungkin terpenuhi jika harga di bawah salah satu pembanding. Ini konsisten dengan kode, tetapi tidak membuktikan tidak adanya support pasar. Tidak ada dasar dari audit ini untuk membalik syarat secara otomatis.
6. **Daftar area belum menilai riwayat kerusakan.** supportAreas memasukkan S1–S4 dan Low B periode aktif tanpa menyimpan apakah level sebelumnya sudah ditembus dan kembali didekati dari bawah. Badge ini perlu disebut area acuan, bukan support terkonfirmasi.

## Batas audit dan tindak lanjut

Kejadian terbaru pada screenshot dan urutan tick pantulan 4111 belum terverifikasi: arsip berakhir 16 Oktober, dan akses ke layanan lokal 127.0.0.1:3001 ditolak lingkungan eksekusi. Tidak menggunakan data simbol lain sebagai pengganti.

Perbaikan yang disarankan: pisahkan posisi level, area acuan, dan respons harga; wajibkan urutan mendekati dari atas → di area → respons; batalkan status support jika area ditembus sebelum pantulan; gunakan data tick/M1 yang bertimestamp untuk uji urutan tanpa melihat masa depan. Filter support kuat Daily tidak diubah sampai ada dasar metode atau evaluasi terpisah.

Reproduksi: node docs/audit_support.mjs. Ringkasan mesin: docs/support-historical-audit.json.

# COP TAH 1.2.5 — peringatan lebih sederhana

Notifikasi memuat status yang konkret, satu kejadian dan satu langkah pantauan.
Rincian metode dipindah ke Alasan & rincian. Status support membedakan kedekatan,
uji dari atas, pantulan teramati, kenaikan tanpa urutan datang yang diketahui,
dan penembusan ke bawah. H4 menampilkan arah penembusan yang benar-benar diamati.

Contoh: MEMANTUL NAIK / Harga mulai memantul naik; TEMBUS TURUN / Support ditembus
ke bawah; UJI SUPPORT / arah balik belum terkonfirmasi. Label tidak menyatakan
tren berbalik hanya karena level disentuh atau ditembus. STRONG BUY/SELL tetap
memakai pemeriksaan yang sama, dengan judul gerak naik/turun yang lebih mudah dibaca.

Logika pendeteksian tidak dilonggarkan. Pemeriksaan penyalinan pesan dan arah
penembusan, state support, render aplikasi dan build frontend dijalankan.

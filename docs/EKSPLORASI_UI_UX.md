# Eksplorasi UI/UX COP TAH

Dasar: inspeksi kode aplikasi dan keluhan pengguna. Ini usulan desain, belum perubahan UI dan belum hasil uji kegunaan pengguna. Browser lokal saat pemeriksaan sebelumnya dinonaktifkan; geometri visual belum diverifikasi.

## Tujuan
Pengguna bisa menemukan: data apa yang dipakai, harga layak dibaca live atau snapshot, tugas TF besar, perkembangan TF kecil, dan mengapa rencana masih WAIT. Informasi lengkap dipertahankan melalui panel rincian.

## Susunan yang disarankan
1. Satu header bersama: sumber Exness/Binance, instrumen, harga acuan, status kesegaran. Pilihan sumber tidak diulang di setiap panel.
2. Satu ringkasan: Arah acuan → fase tugas → status rencana → alasan utama. Bedakan JIKA H4 dari MOVE dan dari sinyal entry.
3. Area kerja utama sesuai menu. OHLC dan Matriks mendapat ruang terbesar; kontrol tambahan tetap ringkas.
4. Satu panel rincian kanan: Ringkasan, Bukti, dan Skenario cadangan. Desktop tetap overlay; tabel tidak berubah ukuran. HP memakai panel penuh dengan tombol tutup tetap terlihat.

## Contoh susunan konseptual, bukan data pasar
```
[Exness ▼] [BTCUSD ▼]  Harga acuan …  [Status data]

JIKA H4 …   |   Weekly: Busur/Target …
Rencana: MENUNGGU KONFIRMASI
Alasan utama: …                       [Lihat syarat]

[Area kerja: matriks / OHLC / peta / chart]

[Trading Plan] [Tugas TF] [Panduan]
```

Tidak menampilkan BUY/SELL besar tanpa status bersyarat/strong dan identitas TF. WAIT bukan ruang kosong: tetap perlihatkan level rumus dan syarat yang belum terpenuhi; angka order tidak valid tetap ditahan.

## Perlakuan tiap menu
| Menu | Informasi pertama | Rincian |
|---|---|---|
| Beranda | Status data, arah acuan, tugas berjalan, langkah berikutnya | Satu tombol lanjut sesuai hambatan: koneksi atau analisis |
| Analisis | Urutan TF besar → Daily/Market → H4 → TF kecil | Komponen JIKA/MOVE/OP–PV/Perahu dan pasangan level |
| Terminal & Entry | Status, Entry, TP1–TP3, SL, alasan utama | Checklist persyaratan, risiko, skenario dan plan mingguan |
| Chart & Fractal | Harga, TF dan legenda lapisan yang aktif | Toggle R/S, rencana H4 dan fractal |
| Tabel OHLC | N/B lengkap, angka sejajar, header tetap terbaca | Klik TF membuka pembacaan gabungan dan High/Low |
| Matriks R/S | Harga sel, ✓ sentuhan dan paling banyak dua label | Klik sel/+jumlah membuka semua peran dan bukti |

Enam menu tetap dipertahankan. Historis/Panduan/Sumber Data tetap pendukung; jangan membuat menu Dashboard/Trading Plan tambahan dengan isi sama.

## Bahasa dan rambu
- JIKA: arah acuan dari Open N vs Open B.
- MOVE: gerak saat ini dari Close N vs Open N.
- Busur/Target: fase tugas induk, bukan otomatis tiket transaksi.
- Cocok H4: level berdekatan dalam batas selisih; bukan bukti pantulan.
- Strong pergerakan: Perahu BRK UP/DWN; HSH dinonaktifkan pada TF tersebut.
- STRONG BUY/SELL: sinyal TF kecil setelah seluruh persyaratan; harus menyebut TF.
- SUP/RES KUAT: kekuatan relatif level; jangan disamakan dengan sinyal entry.
- Level tersentuh, entry teramati dan TP setelah entry memakai label berbeda.

## Warna dan keterbacaan
Gunakan teks dasar terang, abu-abu terang untuk informasi pendukung. Hijau untuk BUY, merah muda SELL/SL, cyan TP/kecocokan, emas perhatian/level terdekat. Sentuhan memakai ikon ✓ tersendiri sehingga tidak tampak sebagai perintah BUY. Setiap warna disertai teks/ikon. Jangan memenuhi seluruh sel dengan beberapa warna sekaligus: harga dasar, satu aksen keadaan, lalu badge peran.

Usulan ukuran: angka utama 22–28 px, isi rincian 14 px, teks tabel 12–14 px bila ruang cukup. Mode seluruh 13 TF boleh lebih padat, tetapi tidak memotong angka. HP menyediakan scroll tabel dengan kolom level tetap; jangan memaksa seluruh TF menjadi huruf kecil. Tombol utama ditargetkan 40–44 px tinggi. Ukur kontras, bukan hanya memilih warna dari tampilan monitor.

Rujukan: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html dan https://www.w3.org/TR/WCAG/ . Teks normal minimal 4,5:1, teks besar 3:1; ukuran sasaran interaksi WCAG 2.2 minimum 24×24 CSS px dengan pengecualian yang ditetapkan standar. Angka ukuran desain di atas adalah usulan produk, bukan klaim kepatuhan.

## Urutan pelaksanaan
1. Satukan header dan hilangkan kontrol/status berulang.
2. Ringkasan keputusan dengan alasan WAIT dan checklist yang jelas.
3. Samakan kartu tugas TF serta panel rincian.
4. Audit warna, ukuran huruf, fokus keyboard dan layout matriks/HP.
5. Setelah disetujui, rebuild installer agar paket desktop memuat UI terbaru.

## Penerimaan
- Dari halaman pertama pengguna bisa menyebut sumber, instrumen, status harga dan langkah berikutnya.
- Pada tugas pengguna dapat menunjukkan Busur, Target dan perkembangan TF kecil tanpa membaca narasi panjang.
- Pengguna dapat membedakan strong pergerakan, STRONG entry dan SUP/RES KUAT.
- Harga, tiket dan alasan sama saat berpindah menu; tidak mengubah rumus selama pekerjaan desain.
- Tidak ada label terpotong pada 1366×768, 1280×800 dan HP; panel tidak menyusutkan matriks.
- Update harga tidak menutup rincian, memindahkan fokus atau mengubah ukuran tabel.
- Uji keyboard, Escape, pengembalian fokus, kontras dan pembaca layar; laporkan bagian yang belum diuji langsung.

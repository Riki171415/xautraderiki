# COP TAH 1.2.6 — posisi terbuka MT5

Panel Posisi terbuka MT5 berada di bawah header saat sumber Exness dipilih.
Klik panel untuk melihat tiket, instrumen, BUY/SELL, lot, harga masuk, harga
sekarang, SL/TP aktual, profit dan swap. Semua posisi akun ditampilkan, termasuk
instrumen selain pilihan chart. Tidak ada tombol pembukaan, penutupan atau
pengubahan posisi.

Bridge membaca positions_get setiap sekitar tiga detik, terpisah dari pembaruan
quote, dan memeriksa sumber akun sebelum/sesudah pembacaan. Daftar kosong yang
berhasil dibaca dibedakan dari kegagalan API. Snapshot >15 detik ditahan; pergantian
akun/server membersihkan posisi sebelumnya. Mata uang dipertahankan dari MT5,
termasuk USC; komisi tidak tersedia dan profit/swap ditampilkan terpisah.

Daftar posisi disimpan di memori proses, tanpa arsip posisi akun. Endpoint GET/POST
posisi membatasi koneksi, Host dan Origin ke localhost. Tidak menyebarkan posisi
ke WebSocket pasar atau halaman internet. Paket installer tidak membawa data
posisi, nomor akun, password atau konfigurasi komputer pembuat.

Validasi: pengujian normalisasi posisi, tiket 64-bit, mata uang cent, snapshot
kosong/gagal/kedaluwarsa, pemisahan sumber, Origin/Host, render panel dan pergantian
akun pada backend uji terpisah. Pembacaan langsung MT5 juga berhasil; tidak ada
transaksi yang diubah selama pengujian.

# COP TAH 1.2.1 — 19 Oktober 2026

## Perubahan

- Header selalu menampilkan waktu analisis dan harga sumber dalam WIB, beserta umur data. Waktu harga yang tidak tersedia ditandai secara eksplisit.
- Snapshot terakhir dipertahankan untuk sumber/instrumen/TF yang sama saat pembaruan tertunda, dengan peringatan dan timestamp asli. Respons lebih tua tidak menggantikan snapshot terbaru.
- Historis menampilkan riwayat tugas tiap TF, sentuhan level, perubahan pola Perahu termasuk ANL, filter dan unduhan JSON. Catatan disimpan di browser hingga 1.500 periode yang sempat diamati.
- Waktu deteksi sentuhan dibedakan dari waktu kejadian historis. Urutan Busur–Target tidak diklaim selesai dari OHLC semata. HSH diberi label pantauan belum terkonfirmasi.
- Pemrosesan arsip lama tidak lagi menyamakan Close di antara dua Open dengan bukti reversion. Persentase klasifikasi JIKA dibedakan dari akurasi prediksi.

## Memperbarui instalasi

Tutup COP TAH melalui ikon area notifikasi Windows → Keluar dan hentikan layanan. Jalankan `installers/COP-TAH-Windows-x64-Setup.exe` versi 1.2.1, lalu buka kembali melalui pintasan. MT5 tetap perlu terpasang dan login. Riwayat lokal browser tidak otomatis dipindahkan ke perangkat atau profil browser lain.

## Paket dan batas verifikasi

Paket membawa runtime Node/Python dan build frontend terbaru. Tidak membawa akun broker, `.env`, API key, log atau cache harga komputer pembuat. Manifest dan SHA256 tersedia di folder `installers`.

Seluruh 255 pengujian aplikasi lulus dan build frontend berhasil. Pengujian aplikasi tidak membuktikan profitabilitas metode. Installer belum ditandatangani sertifikat penerbit; pemasangan pada komputer lain dan feed live tetap perlu diverifikasi.

Verifikasi paket selesai: mode `--verify`, integritas ZIP dan SHA256 lulus; seluruh aset frontend, modul backend tambahan dan panduan paket sesuai dengan sumber build. EXE berukuran 73.182.720 byte (69,8 MiB), berisi 3.795 file. SHA256: `7533a8fb8dce8cf1e32a91961ba05064f3f3073b88eead8fc9f0b74ca529973a`.

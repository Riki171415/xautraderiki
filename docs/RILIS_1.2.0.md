# COP TAH 1.2.0 — 19 Oktober 2026

## Perubahan
- Sumber data hanya Exness MT5 dan Binance Spot; integrasi Twelve dihapus.
- Header tunggal, ringkasan JIKA H4/Weekly/rencana, panel rincian dan matriks HP yang dapat digeser.
- Perjalanan tugas Daily pada Analisis Market, penanda H4 lengkap, serta kesamaan level Daily–Year.
- Koreksi label kekuatan relatif Daily, status data, dan penahanan HSH pada Perahu BRK UP/BRK DWN.
- Narasi berorientasi kondisi pasar; notifikasi berisi kejadian, langkah berikutnya dan rincian tanpa mengulang diskusi metode.

## Installer Windows
`installers/COP-TAH-Windows-x64-Setup.exe` membawa runtime Node/Python serta UI terbaru. Instalasi per pengguna; pintasan Desktop/Start Menu dan layanan latar belakang melalui ikon notifikasi Windows. Installer/update dan uninstall meminta COP TAH ditutup terlebih dahulu. MT5 tetap dipasang dan login di komputer tujuan. Tidak membawa akun, password, API key, log atau harga komputer pembuat.

Biner tidak dimasukkan ke Git; sumber build, panduan, manifest versi dan checksum ikut repository. Paket EXE dapat diambil dari lampiran lokal percakapan ini. Memperbarui kode Git tidak otomatis memasang aplikasi desktop.

## Validasi dan batas
- 242 tes aplikasi lulus; build frontend dan kompilasi installer berhasil.
- Python bawaan dapat memuat MetaTrader5/NumPy/Requests.
- Server dari folder paket diuji di port terpisah: health, halaman utama dan JavaScript terbaru HTTP 200.
- Installer mempunyai mode `--verify` untuk memeriksa paket tertanam tanpa memasang aplikasi.
- Belum diuji pemasangan pada komputer lain, belum ditandatangani sertifikat Windows, dan pemeriksaan visual/browser terhalang pengaturan Work.
- Rumus COP TAH dipertahankan; keberhasilan tes perangkat lunak tidak membuktikan akurasi metode atau profitabilitas.

## Memperbarui instalasi
Tutup COP TAH melalui ikon area notifikasi → Keluar dan hentikan layanan. Jalankan installer 1.2.0 dan buka kembali melalui pintasan. MT5 dan akun broker tetap berada pada komputer tujuan.


## Perubahan sumber setelah paket 1.2.0

Pembaruan 19 Oktober 2026 setelah paket di atas menambahkan riwayat tugas tiap TF di Historis, penjelasan status Busur–Target/HSH, penanganan snapshot saat pembaruan tertunda, serta waktu dan umur analisis/harga sumber yang selalu terlihat dalam WIB. Panduan penggunaan terbaru tersedia pada [PANDUAN_APLIKASI.md](../PANDUAN_APLIKASI.md).

Perubahan sumber tersebut telah diuji secara terarah dan build frontend berhasil. Paket installer 1.2.0 yang disebut sebelumnya belum dibangun ulang untuk memuat pembaruan ini; klaim validasi paket pada bagian sebelumnya hanya berlaku pada paket yang saat itu dibangun. Deployment dan feed live untuk perubahan berikutnya belum diverifikasi.

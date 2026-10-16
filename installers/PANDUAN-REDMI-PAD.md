# COP TAH Exness untuk Redmi Pad

Installer: COP-TAH-Exness-Tablet.apk
Android minimum: 8.0. Versi aplikasi: 1.0.0.

## Memasang
1. Pindahkan APK ke tablet melalui kabel USB, penyimpanan pribadi, atau metode berbagi file yang Anda gunakan.
2. Buka APK di aplikasi Files tablet. Jika diminta Android, izinkan pemasangan dari aplikasi Files tersebut.
3. Buka COP TAH Exness. Masukkan alamat dashboard, lalu pilih Simpan dan buka dashboard.

## Akses memakai internet HP dari luar rumah
Aplikasi MT5 Android tidak menyediakan bridge untuk aplikasi dashboard. Data tetap berasal dari MT5 Windows yang sudah terhubung ke Exness. Komputer, backend dashboard, dan bridge Python harus terus menyala dan komputer harus terhubung internet.

Pilihan jaringan privat:
1. Pasang Tailscale dari https://tailscale.com/download di komputer dan tablet.
2. Login Tailscale dengan akun yang sama pada kedua perangkat. Aktifkan koneksinya pada tablet.
3. Lihat alamat Tailscale komputer (format 100.x.x.x).
4. Pada aplikasi COP TAH, masukkan http://ALAMAT-TAILSCALE-KOMPUTER:3001/ dan simpan. Ganti placeholder tersebut dengan alamat komputer sebenarnya.
5. Bila Windows meminta akses jaringan untuk Node.js, izinkan pada jaringan yang digunakan untuk koneksi privat ini. Jangan membuka port router ke internet.
6. Uji dengan tablet memakai hotspot/internet HP, bukan Wi-Fi komputer. Pastikan indikator MT5 langsung muncul dan waktu harga terus diperbarui.

Jika sudah memiliki server HTTPS atau reverse proxy yang terlindungi, masukkan alamat HTTPS server tersebut. Proxy harus meneruskan halaman dashboard, /api, dan WebSocket /ws ke backend port 3001.

## Catatan
- Akses internet dari luar rumah belum otomatis aktif setelah APK dipasang; jaringan privat atau server HTTPS perlu disiapkan.
- localhost / 127.0.0.1 pada tablet mengacu ke tablet sendiri, bukan komputer.
- Nilai utama harga adalah tengah Bid dan Ask; chart MT5 biasanya menampilkan Bid.
- Tombol Koneksi dapat dipakai untuk mengganti alamat server.
- Tidak ada transaksi yang dikirim oleh aplikasi tablet ini.
- APK telah berhasil dibangun dan tanda tangannya diverifikasi. Pengujian pada perangkat Redmi Pad fisik belum dilakukan.

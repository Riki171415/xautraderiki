# Twelve Data XAU/USD

Default sumber: localhost/127.0.0.1 = MT5 Exness; alamat online = Twelve Data XAU/USD. Pilihan sumber tetap tersedia pada header. Sumber online tidak otomatis diganti menjadi PAXG bila Twelve Data gagal.

Pasang `TWELVEDATA_API_KEY` di Vercel Project Settings → Environment Variables (Production dan Preview bila digunakan), kemudian redeploy. Jangan memakai awalan VITE_ untuk key. Endpoint `/api/twelve` menjalankan permintaan di sisi server. Untuk server Express lokal, pasang environment variable yang sama sebelum menjalankannya jika ingin memilih Twelve secara manual.

API key harus memiliki akses Gold Spot XAU/USD, intraday, dan histori pada paket yang digunakan. Analisis meminta sampai 9 timeframe asli; paket/kuota harus mencukupi. Cache respons server 60 detik mengurangi permintaan; batas kuota tetap mengikuti akun dan cache instance Vercel. Data diperbarui lewat polling, bukan tick Bid/Ask broker. Tidak ada jaminan selisih maksimum $1 terhadap Exness sebelum pengujian berdampingan.

Permintaan memakai timezone UTC; respons yang tidak menyatakan zona UTC ditolak agar candle Daily/H4 tidak dipetakan secara keliru. Kebutuhan adaptasi zona yang berbeda harus diperiksa dari respons nyata penyedia, bukan ditebak. Hari/minggu/bulan mengikuti data penyedia, bukan candle Exness. Riwayat yang gagal/ditolak paket tidak diganti dengan broker lain.

Rumus COP TAH tetap memakai mesin bersama. Twelve Data OHLC tidak dianggap memiliki Bid/Ask Exness: skenario Market tetap WAIT jika pemeriksaan membutuhkan Bid/Ask. Validasi akhir membutuhkan API key dan respons XAU/USD asli; pengujian parser menggunakan respons contoh, bukan pembuktian data live.

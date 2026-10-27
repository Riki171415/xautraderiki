# Logika aplikasi — Puzzle COP TAH 1.3.0

Dokumen pembaruan: 27 Oktober 2026 (WIB). Ini menjelaskan implementasi, bukan janji hasil transaksi. Aturan disepakati dalam plan pengguna; referensi awal tersimpan di dokumen `REFERENSI_*.md`.

## 1. Cakupan dan sumber kebenaran

- Aktif hanya pada XAUUSD, EURUSD dan GBPUSD Exness, termasuk suffix simbol c/m. BTC dan Binance mempertahankan logika sebelumnya.
- Mesin deterministik bersama: `backend/reference_analysis.js`. Backend dan frontend memakai implementasi yang sama melalui modul aturan bersama Vite.
- Input: broker, simbol, OHLC per TF, kolom RPS aktif, timestamp quote, waktu evaluasi, presisi dan toleransi. Tidak ada model prediksi eksternal atau pengiriman order.
- Output API tambahan: `referenceContext` berisi input historis dan identitas sesi sumber; `referenceAnalysis` berisi keputusan, kandidat, bukti, konflik, rencana dan alasannya.
- Frontend menghitung ulang model yang sama dengan quote terbaru dan toleransi pilihan pengguna. Nilai API menggunakan toleransi bawaan 0; frontend dapat menyesuaikan toleransi, bukan rumus RPS.
- Data sumber tetap dijaga berdasarkan server/akun/sourceSession yang sudah ada. Harga lebih tua dari 10 detik, dari masa depan lebih dari 5 detik, atau data wajib tidak lengkap menahan rencana. Riwayat Week/Daily/H4 yang dibutuhkan tidak tersedia → WAIT_DATA.

## 2. Waktu dan candle pembanding

Awal siklus sesi Exness mengikuti Open D1 broker. Asia: 0–8 jam; Eropa: 8–14 jam; USA: 14–22 jam; transisi: 22–24 jam dari timestamp D1. Contoh D1 mulai 07.00 WIB menghasilkan Asia 07–15, Eropa 15–21, USA 21–05, transisi 05–07. Timestamp TF native tidak digeser mengikuti nama sesi.

Week berjalan adalah konteks sementara. D1, H4 dan TF adik untuk konfirmasi memakai pasangan candle terakhir selesai dan candle pembanding sebelumnya. Waktu pola konfirmasi dibedakan dari periode level entry yang sedang aktif. Candle belum selesai dan candle masa depan tidak dapat mengesahkan pola.

Daily Before forex/logam melewati candle Sabtu/Minggu dan memilih hari kerja terakhir yang tersedia; OHLC mentah tidak dicampur atau dibuat ulang. Konfirmasi sesi memakai agregasi H1 lengkap. Sesi pembanding tidak lengkap tidak diganti diam-diam dengan sesi lebih lama untuk menghasilkan ANL/JIKA.

## 3. Makna istilah dan aturan Om Dhan

Titanic/perahu besar = BRK. Sekoci/perahu kecil = SDW. Anomali = ANL. NRL tetap kategori normal tersendiri. Arah `DWN` pada kode pola dibaca DOWN. Kamus 47 entri tersedia dalam antarmuka; persamaan istilah tidak otomatis memberi konfirmasi entry.

| Week / D1 | D1 / H4 yang terkonfirmasi | Kandidat | TF level entry |
| --- | --- | --- | --- |
| Week BRK DWN | D1 BRK UP | BUY | Daily S1 |
| Week BRK DWN | D1 ANL UP / SDW UP | SELL | Daily R1 |
| Week BRK UP | D1 BRK DWN | SELL | Daily R1 |
| Week BRK UP | D1 ANL DWN / SDW DWN | BUY | Daily S1 |
| D1 BRK UP | H4 BRK DWN / ANL DWN | BUY | H4 S1 |
| D1 BRK DWN | H4 BRK UP / ANL UP | SELL | H4 R1 |
| Week–D1–H4 semua berarah UP | Pola memiliki suffix UP | BUY | H4 S1 |
| Week–D1–H4 semua berarah DOWN | Pola memiliki suffix DWN | SELL | H4 R1 |

Tiga BRK searah dicatat sebagai bukti tambahan tanpa memperbesar risiko. Kombinasi yang tidak tercantum tidak dipaksakan menghasilkan kandidat. Kandidat searah dapat hidup bersamaan. Jika lebih dari satu kandidat sudah dikonfirmasi dan memiliki rencana valid, prioritas TF level: H4, lalu Daily, lalu Weekly. Kandidat BUY dan SELL yang berlaku bersamaan menghasilkan konflik/WAIT, bukan pilihan arah secara sembarang.

## 4. TF adik, inversi RPS dan Busur

Tangga tetap: Year → Semester → Quarter → Month → Week → Daily → H4 → H1 → M30 → M15 → M5 → M1. Market tidak dihitung sebagai tingkat.

- Dua dan tiga tingkat di bawah TF asal diperiksa pada candle selesai. Minimal satu JIKA searah kandidat diperlukan untuk rencana Om Dhan. Konfirmasi lama sebelum awal periode level asal tidak dipakai.
- Jika kedua TF adik memiliki JIKA UP dan DOWN berlawanan, kandidat ditahan sebagai konflik.
- R1 > R2 pada presisi instrumen: OVERBOUGHT; konfirmasi JIKA adik DOWN diperlukan.
- S1 < S2: OVERSOLD; konfirmasi JIKA adik UP diperlukan. Kedua inversi aktif bersamaan menimbulkan konflik.
- Kesamaan level pada presisi instrumen tidak dianggap inversi.
- Lower Bow: induk JIKA UP, harga di area S1 menurut toleransi, adik JIKA UP. Upper Bow: induk JIKA DOWN, harga di R1, adik JIKA DOWN.
- Rumus Pivot dan R/S asli tetap milik `rule_engine.js`. Modul Puzzle tidak mengganti angka atau menukar nama level ketika dilintasi harga.

## 5. Batas Selasa dan keputusan Rabu

H/L Selasa dibekukan dari Daily Selasa yang telah selesai dalam Week broker aktif. Tanpa candle tersebut status menunggu Selasa/data, bukan mengambil Selasa pekan lain.

Week JIKA UP memantau Low Selasa; Week DOWN memantau High Selasa. Tick/harga atau wick melampaui batas lebih dari setengah unit presisi membatalkan batas. Sama persis bukan penembusan. Penembusan tercatat dari OHLC Daily setelah Selasa serta harga yang sedang diamati; bukan asumsi urutan intrabar.

Rabu mencatat batas atas, bawah, atau keduanya yang diambil. Mengambil kedua batas tidak membuktikan mana dahulu. Setelah candle Rabu selesai dan mengambil sedikitnya satu batas, Close > Open memberi konteks UP untuk Kamis–Jumat; Close < Open memberi DOWN; sama berarti netral. Belum ada penembusan → belum memberi arah lanjutan dari aturan ini. Arah nonnetral yang melawan kandidat membuat WAIT. Batas Selasa yang telah batal juga menahan kandidat yang masih mengikuti arah Weekly yang dibatalkan itu.

## 6. HSH referensi, terpisah dari HSH klasik

Open N Daily tetap rumah Daily dan Open N Weekly tetap rumah Weekly. Konfirmasi sesi tidak mengganti rumah tersebut.

1. Tentukan Target R1 jika JIKA UP atau S1 jika JIKA DOWN pada TF asal.
2. Cari bukti Target tersentuh pada H1 selesai di dalam periode TF tersebut.
3. Jika Target dan Open ada pada H1 yang sama, urutan ditahan. Jika Open sudah tersentuh pada H1 setelah Target, skenario lama tidak diulang.
4. Tunggu USA/Eropa selesai dengan pola ANL UP/DWN searah dari harga kembali menuju Open. MOVE sesi harus searah perjalanan itu.
5. Awal sesi konfirmasi harus sesudah akhir H1 sentuhan Target. Riwayat H1 dari sentuhan sampai akhir sesi harus utuh; celah menghasilkan belum terkonfirmasi.
6. Jalur referensi ini boleh menghasilkan kandidat walau Daily/Weekly masih BRK. Pemeriksaan HSH klasik berbasis Perahu dan usia candle tetap konteks terpisah.
7. HSH Daily dan Weekly disebut selaras hanya bila keduanya terkonfirmasi dan arah menuju Open sama. Arah berlawanan → konflik/WAIT. Harga sudah di Open tidak dikejar.

Kandidat HSH memakai R1 TF asal untuk SELL atau S1 untuk BUY. Open HSH tetap ditampilkan terpisah dari TP rencana. Skenario tidak menjamin harga mencapai Open.

## 7. Habit sesi dan status keputusan

Habit menggunakan JIKA sesi, yaitu Open sesi dibanding Open sesi sejenis sebelumnya. Empat susunan: DOWN–DOWN–UP; UP–UP–DOWN; DOWN–UP–DOWN; UP–DOWN–UP. Susunan baru dikonfirmasi setelah Asia/Eropa/USA selesai dengan pembanding valid. Sebelum lengkap: FORMING, tanpa prediksi USA dan tanpa veto otomatis terhadap seluruh entry.

| Status | Makna |
| --- | --- |
| WAIT_DATA | Harga/periode/riwayat wajib tidak cukup |
| NO_CANDIDATE | Tidak ada kombinasi referensi berlaku |
| WAIT_CONFIRMATION | Ada kandidat, tetapi konfirmasi atau urutan risiko/sisi limit belum valid |
| CONFLICT | Kandidat, TF adik, inversi, Selasa/Rabu atau HSH saling bertentangan |
| PLAN_VALID | Kandidat dikonfirmasi, tidak konflik, serta level/limit valid |
| STRONG | PLAN_VALID ditambah habit lengkap yang cocok dan bukti candle TF adik selesai di area entry lalu bergerak searah |

Label kuat hanya diberikan pada TF kecil yang benar-benar menyumbang bukti, bukan disalin ke semua TF kecil. STRONG bukan probabilitas keberhasilan atau perintah transaksi.

## 8. Entry, SL/TP dan propagasi keputusan

| Rencana | Entry | SL | TP1 | TP2 | TP3 |
| --- | --- | --- | --- | --- | --- |
| BUY LIMIT | S1 | S2 | Pivot | R1 | R2 |
| SELL LIMIT | R1 | R2 | Pivot | S1 | S2 |

Semua harga berasal dari TF level yang dipilih, bukan selalu H4. BUY harus SL < entry < TP1 < TP2 < TP3 dan entry di bawah harga sekarang. SELL simetris. Urutan harus berbeda pada presisi instrumen. Harga sudah melewati sisi limit, level hilang/terbalik, konflik, atau quote lama → WAIT; tidak diubah menjadi market order.

Rencana referensi mengendalikan tiket H4 bersama, `matrixPlan`, Terminal, rekomendasi API dan sinyal kuat pada instrumen cakupan. Rekomendasi lama disimpan sebagai legacy, tetapi observasi TP/entry lama tidak ditempelkan ke rencana baru. Badge entry/TP/SL ditempatkan pada TF level asal. Tidak ada lot bawaan atau estimasi uang dari saldo yang belum diverifikasi.

Notifikasi referensi tidak muncul saat awal membuka aplikasi. Hanya transisi menjadi PLAN_VALID/STRONG atau penahanan penting dari rencana valid yang dipertimbangkan. Semua notifikasi pasar berbagi jeda 5 menit dan deduplikasi 30 menit; pesan yang ditahan tidak diantrekan. Pengamatan support tetap memakai jalur observasinya yang terpisah.

## 9. Tampilan dan mobile

Puzzle tersedia di Analisis H4, Sesi Market dan Terminal. Pada matriks, tombol ringkas membuka rincian; tidak ditambahkan panel besar di bawah tabel. Posisi MT5 tetap ringkas di tengah baris HSH atas tabel.

Rincian pola, Selasa/Rabu, HSH, habit dan kamus dapat dilipat. Pada layar kecil teks membungkus, nilai entry memakai flex wrap, kamus menjadi kolom yang muat lebar layar, pencarian penuh lebar, dan kontrol ringkasan minimal 44px. Tabel level mempertahankan gulir horizontal untuk keterbacaan. Perubahan tidak memasukkan tombol transaksi.

## 10. Validasi dan batas hasil historis

- Pengujian mencakup aturan simetris, NRL/netral, candle selesai, tidak memakai data masa depan, konflik, pembatalan, urutan HSH, sesinya bolong, kompatibilitas BTC/Binance dan kesamaan API/frontend.
- Histori MT5 diekspor baca-saja ke `.cache/reference-history`, tidak menyimpan akun, password atau posisi ke repositori. Skrip: `docs/export_reference_history.py`.
- Replay: `docs/backtest_reference.mjs`. Pembagian waktu 70% pengembangan dan 30% uji akhir; tidak menyetel parameter pada bagian uji. Sampel setiap empat H1 tersedia. Candle makro berjalan direkonstruksi hanya dari H1 yang sudah selesai.
- Simulasi satu rencana per instrumen pada satu waktu. Entry limit harus benar-benar tersentuh; rencana tertunda dibatalkan bila keputusan berikutnya tidak berlaku. Simulasi tidak melewati batas pembagian pengembangan/uji.
- Entry dan SL/TP dalam H1 yang sama ditandai ambigu. Celah data ditandai tidak terverifikasi. Hasil melaporkan TP1, bukan klaim TP2/TP3 atau urutan tick.
- Gross R belum memasukkan spread, swap, komisi atau slippage; bukan hasil bersih. Cakupan M15/M30 lebih pendek daripada D1/H1/H4 sehingga tidak ada klaim validasi seluruh puzzle selama 10 tahun penuh.

Hasil lengkap dan cakupan per instrumen: [laporan backtest](UJI_HISTORIS_PUZZLE.md) dan [data hasil](reference-backtest-results.json). Rilis ini menerapkan aturan yang disepakati; hasil historis tidak menjadi bukti peningkatan profitabilitas.

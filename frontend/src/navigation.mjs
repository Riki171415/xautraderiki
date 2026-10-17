export const ANALYSIS_STEPS=['global','h4','cycle','candles','entries'];
export const PAGES=[
 {id:'dashboard',title:'Beranda',group:'utama',desc:'Ringkasan harga, sumber data dan kondisi analisis'},
 {id:'global',title:'Peta Global',group:'utama',desc:'Mulai dari 10 tahun, uraikan cerita sampai Daily'},
 {id:'h4',title:'Analisis H4',group:'utama',desc:'Pertemuan level, area sasaran dan rumah HSH'},
 {id:'cycle',title:'Sesi Market',group:'utama',desc:'Sesi aktif, kebiasaan dan tugas Daily'},
 {id:'candles',title:'Chart & Fractal',group:'utama',desc:'Periksa gerakan harga dan konfirmasi timeframe kecil'},
 {id:'entries',title:'Terminal & Entry',group:'utama',desc:'Data, rencana entry dan penanda harga per timeframe dalam satu layar'},
 {id:'levels',title:'Matriks Support & Resistance',group:'referensi',desc:'Seluruh level R/S dalam tampilan lebar, dengan penanda entry dan TP'},
 {id:'history',title:'Historis',group:'referensi',desc:'Riwayat dari instrumen dan sumber yang sedang aktif'},
 {id:'guide',title:'Panduan',group:'referensi',desc:'Pelajari aturan dan cara membaca COP TAH'},
 {id:'sources',title:'Sumber Data',group:'referensi',desc:'Pilih penyedia dan periksa status koneksi'}
];
export function stepNeighbors(page){const i=ANALYSIS_STEPS.indexOf(page);return {previous:i>0?ANALYSIS_STEPS[i-1]:null,next:i>=0?ANALYSIS_STEPS[i+1]||null:null};}

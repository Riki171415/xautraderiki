export const ANALYSIS_STEPS=['analysis','entries','candles'];
export const PAGES=[
 {id:'dashboard',title:'Beranda',group:'utama',desc:'Harga, koneksi dan kondisi singkat'},
 {id:'analysis',title:'Analisis',group:'utama',desc:'Peta Global, Kunci H4, serta Sesi Market & Daily'},
 {id:'entries',title:'Terminal & Entry',group:'utama',desc:'Ringkasan, analisis & risiko dan plan mingguan'},
 {id:'candles',title:'Chart & Fractal',group:'utama',desc:'Gerakan harga dan konfirmasi timeframe kecil'},
 {id:'ohlc',title:'Tabel OHLC',group:'utama',desc:'Seluruh timeframe dan data N/B dalam satu tabel'},
 {id:'levels',title:'Matriks R/S',group:'utama',desc:'Seluruh level dan penanda pada sel'},
 {id:'history',title:'Historis',group:'pendukung',desc:'Catatan sentuhan, tugas tiap TF, pola ANL dan riwayat harga'},
 {id:'guide',title:'Panduan',group:'pendukung',desc:'Aturan dan cara membaca COP TAH'},
 {id:'sources',title:'Sumber Data',group:'pendukung',desc:'Penyedia dan status koneksi'}
];
export function resolveNavigation(id){
 if(['global','h4','cycle'].includes(id))return {page:'analysis',analysisTab:id};
 if(['table','terminal','weekly'].includes(id))return {page:'entries',terminalSection:id==='weekly'?'weekly':'summary'};
 return {page:PAGES.some(p=>p.id===id)?id:'dashboard'};
}
export function stepNeighbors(page){const i=ANALYSIS_STEPS.indexOf(page);return {previous:i>0?ANALYSIS_STEPS[i-1]:null,next:i>=0?ANALYSIS_STEPS[i+1]||null:null};}

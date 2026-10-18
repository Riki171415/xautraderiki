export function sessionNarrative(cycle,decimals=3) {
 const fmt=n=>n.toFixed(decimals);
 const sessions=cycle?.sessions||[],facts=[];
 for(const [previous,current] of [['ASIA','EROPA'],['EROPA','USA']]){
  const a=sessions.find(s=>s.name===previous),b=sessions.find(s=>s.name===current);
  if(!a?.coverage||!b?.coverage)continue;
  for(const [field,name] of [['high','Harga tertinggi'],['low','Harga terendah']]){
   if(!Number.isFinite(a[field])||!Number.isFinite(b[field]))continue;
   const x=Number(b[field].toFixed(decimals)),y=Number(a[field].toFixed(decimals));
   facts.push(`${name} ${current==='EROPA'?'Eropa':'USA'} ${fmt(b[field])} ${x>y?'lebih tinggi dari':x<y?'lebih rendah dari':'sama pada presisi tampilan dengan'} ${previous==='ASIA'?'Asia':'Eropa'} ${fmt(a[field])}${b.status==='active'?' · sementara':''}.`);
  }
 }
 const type=cycle?.marketType,verification=cycle?.verification;
 let title='Pola sesi belum dapat disimpulkan',summary='Menunggu data sesi yang cukup; belum menentukan pola pergerakan.';
 if(type==='NORMAL'||type==='STRONG'){
  const confirmed=verification==='OBSERVED';
  title=(confirmed?'Pola ':'Indikasi pola ')+(type==='NORMAL'?'normal':'strong');
  summary=confirmed?'Perbandingan sesi memenuhi pola pada data yang tersedia. Sasaran Daily dibaca terpisah di ringkasan tugas.':'Pola masih sementara. Tunggu sesi selesai dan bukti urutan gerak sebelum menganggapnya terkonfirmasi.';
 }
 if(type==='MIXED'){title='Arah antar-sesi belum membentuk pola yang selaras';summary='Perbandingan harga atau urutan gerak belum memenuhi satu pola. Pantau perkembangan sesi dan tugas Daily; belum menyimpulkan normal atau strong.';}
 if(type==='INSUFFICIENT'||type==='UNAVAILABLE'){title='Data sesi belum lengkap';summary='Riwayat yang diperlukan belum tersedia lengkap. Analisis pola ditahan sampai datanya mencukupi.';}
 if(verification==='ORDER_UNVERIFIED'){title='Rentang sesuai kandidat pola; urutan gerak belum terbukti';summary='Harga tertinggi dan terendah belum dapat dipastikan urutannya dari data yang tersedia. Pola belum mendapat konfirmasi penuh.';}
 const active=sessions.find(s=>s.name===cycle?.activeSession);
 const waiting=sessions.find(s=>s.name!=='TRANSISI'&&['pending','unavailable','incomplete'].includes(s.status));
 const next=active?.status==='active'?`Sesi ${active.name==='EROPA'?'Eropa':active.name==='ASIA'?'Asia':active.name} masih berjalan; High dan Low dapat berubah.`:waiting?`Menunggu data sesi ${waiting.name==='EROPA'?'Eropa':waiting.name==='ASIA'?'Asia':waiting.name} agar pembacaan dapat dilanjutkan.`:'Baca level Daily yang sudah tersentuh dan pantauan berikutnya pada ringkasan tugas di atas.';
 return {title,summary,facts,next};
}

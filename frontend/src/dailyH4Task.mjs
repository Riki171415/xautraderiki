export function dailyH4Task(context,target,now=Date.now()) {
 if(!context?.daily || !Number.isFinite(target))return {available:false,reason:'Data Daily/H4 atau sasaran belum tersedia.'};
 const d=context.daily,start=d.timestamp,end=d.periodEnd,H=4*3600000;
 if(!Number.isFinite(end)||end<=start||now<start||now>=end)return {available:false,reason:'Periode Daily tidak aktif atau batas waktunya belum tersedia.'};
 const windows=[end-2*H,end-H].map((t,i)=>{
  const r=context.rows?.find(r=>r[0]===t);
  const started=now>=t,valid=r&&r[2]!=null&&r[3]!=null&&Number.isFinite(Number(r[2]))&&Number.isFinite(Number(r[3]))&&Number(r[3])<=Number(r[2]),hit=started&&valid&&Number(r[3])<=target&&target<=Number(r[2]);
  return {index:i+1,start:t,end:t+H,status:!started?'Belum mulai':!valid?'Data belum tersedia':now>=t+H?'Selesai':'Berjalan',hit:!!hit,high:started&&valid?Number(r[2]):null,low:started&&valid?Number(r[3]):null};
 });
 const hit=windows.find(w=>w.hit);
 return {available:true,windows,hit:!!hit,hitStart:hit?.start,open:d.open,target,
 reason:hit?'Sasaran Daily tersentuh pada salah satu dari dua H4 terakhir. Pantau kemungkinan gerak ke sisi berlawanan / Open Daily, sekaligus risiko lanjut tembus. Bukan kepastian pembalikan.':now<end-2*H?'Belum masuk dua H4 terakhir Daily.':'Belum ada bukti sasaran tersentuh pada dua H4 terakhir. Lanjut pantau tugas Daily.'};
}

export function dailyTaskForColumn(context,column,target,now=Date.now()) {
 if(!column||context?.daily?.timestamp!==column.periodStart||context?.daily?.periodEnd!==column.periodEnd)return {available:false,reason:'Riwayat dua H4 terakhir belum sesuai dengan periode Daily pada tabel; menunggu sinkronisasi.'};
 return dailyH4Task(context,target,now);
}

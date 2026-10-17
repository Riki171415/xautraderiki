export function dailyH4Task(context,target,now=Date.now()) {
 if(!context?.daily || !Number.isFinite(target))return {available:false,reason:'Data Daily/H4 atau sasaran belum tersedia.'};
 const d=context.daily,start=d.timestamp,end=d.periodEnd,H=4*3600000;
 if(!Number.isFinite(end)||end<=start||now<start||now>=end)return {available:false,reason:'Periode Daily tidak aktif atau batas waktunya belum tersedia.'};
 const windows=[end-2*H,end-H].map((t,i)=>{
  const r=context.rows?.find(r=>r[0]===t);
  const started=now>=t,hit=started&&r&&r[3]<=target&&target<=r[2];
  return {index:i+1,start:t,end:t+H,status:!started?'Belum mulai':!r?'Data belum tersedia':now>=t+H?'Selesai':'Berjalan',hit:!!hit,high:started?r?.[2]:null,low:started?r?.[3]:null};
 });
 const hit=windows.find(w=>w.hit);
 return {available:true,windows,hit:!!hit,hitStart:hit?.start,open:d.open,target,
 reason:hit?'Sasaran Daily tersentuh pada salah satu dari dua H4 terakhir. Pantau kemungkinan gerak ke sisi berlawanan / Open Daily, sekaligus risiko lanjut tembus. Bukan kepastian pembalikan.':now<end-2*H?'Belum masuk dua H4 terakhir Daily.':'Belum ada bukti sasaran tersentuh pada dua H4 terakhir. Lanjut pantau tugas Daily.'};
}
